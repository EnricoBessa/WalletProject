import React, { useState, useMemo, useEffect } from 'react'
import axios from 'axios'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer
} from 'recharts'

export default function Dashboard({ user, onLogout }) {
    const [wallet, setWallet] = useState(null)
    const [tags, setTags] = useState([])
    const [chartData, setChartData] = useState([])
    const [activeTab, setActiveTab] = useState('dashboard')
    const [income, setIncome] = useState('')
    const [goal, setGoal] = useState('')
    const [current, setCurrent] = useState('')
    const [manualExpenses, setManualExpenses] = useState('')
    const [newTagName, setNewTagName] = useState('')
    const [selectedTagId, setSelectedTagId] = useState('')
    const [transactionAmount, setTransactionAmount] = useState('')
    const [transactionDescription, setTransactionDescription] = useState('')
    const [transactionDate, setTransactionDate] = useState('')
    const [recurring, setRecurring] = useState('no')
    const [message, setMessage] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [chartRange, setChartRange] = useState('all')
    const [aiInsights, setAiInsights] = useState('')
    const [aiQuestion, setAiQuestion] = useState('')
    const [aiQuestionResponse, setAiQuestionResponse] = useState('')
    const [aiLoading, setAiLoading] = useState(false)
    const [aiError, setAiError] = useState('')
    const API_URL = import.meta.env.VITE_API_URL || ''

    const token = localStorage.getItem('token')
    const authHeaders = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }

    function onlyNumbers(value) {
        const cleaned = value.replace(/[^0-9.]/g, '')
        const parts = cleaned.split('.')
        if (parts.length <= 1) return cleaned
        return parts.shift() + '.' + parts.join('.')
    }

    async function loadWallet() {
        try {
            const response = await axios.get(`${API_URL}/api/user/currentwalletinformation`, authHeaders)
            const wallets = (response.data || []).sort((a, b) => new Date(a.dateCreation) - new Date(b.dateCreation))

            if (wallets.length === 0) {
                setWallet(null)
                setIncome('')
                setGoal('')
                setCurrent('')
                setMessage('No wallets found. Use Save to create a new wallet.')
                return
            }

            const lastWallet = wallets[wallets.length - 1]
            setWallet(lastWallet)
            setIncome(lastWallet.income?.toString() || '')
            setGoal(lastWallet.goal?.toString() || '')
            setCurrent(lastWallet.current?.toString() || '')
            setMessage('')
        } catch (error) {
            console.error('Failed to load wallet', error)
            setMessage('Failed to load wallet.')
        }
    }

    async function loadTags() {
        try {
            const response = await axios.get(`${API_URL}/api/tag`, authHeaders)
            setTags(response.data || [])
        } catch (error) {
            console.error('Failed to load tags', error)
            setMessage('Failed to load tags.')
        }
    }

    async function loadChart() {
        try {
            const response = await axios.get(`${API_URL}/api/user/chartdata?month=0`, authHeaders)
            setChartData(response.data || [])
        } catch (error) {
            console.error('Failed to load chart', error)
            setMessage('Failed to load chart.')
        }
    }

    useEffect(() => {
        loadWallet()
        loadTags()
        loadChart()
        loadAiInsights()
    }, [])

    const totalIncome = useMemo(() => Number(wallet?.income || 0), [wallet])

    const expenseValue = useMemo(() => {
        const transactionSum = wallet?.transactions?.reduce((sum, tx) => sum + Math.abs(tx.amount || 0), 0) || 0
        return transactionSum > 0 ? transactionSum : parseFloat(manualExpenses) || 0
    }, [wallet, manualExpenses])

    const monthlySavings = useMemo(() => {
        return totalIncome - expenseValue
    }, [totalIncome, expenseValue])

    const currentBalance = useMemo(() => Number(wallet?.current || 0), [wallet])
    const goalValue = useMemo(() => Number(goal) || Number(wallet?.goal || 0), [goal, wallet])

    const goalProgress = useMemo(() => {
        if (goalValue <= 0) return 0
        return Math.min(100, Math.round((currentBalance / goalValue) * 100))
    }, [currentBalance, goalValue])

    const monthsToGoal = useMemo(() => {
        if (monthlySavings <= 0 || goalValue <= 0) return null
        const remaining = Math.max(0, goalValue - currentBalance)
        return Math.ceil(remaining / monthlySavings)
    }, [currentBalance, goalValue, monthlySavings])

    const balanceTrend = useMemo(() => {
        if (!chartData || chartData.length < 2) return 0
        const points = chartData.map(point => ({
            ...point,
            date: new Date(point.date)
        })).sort((a, b) => a.date - b.date)
        const first = points[0].balance || 0
        const last = points[points.length - 1].balance || 0
        if (first === 0) return 0
        return Math.round(((last - first) / Math.abs(first)) * 100)
    }, [chartData])

    const chartPoints = useMemo(() => {
        return (chartData || []).map(point => ({
            ...point,
            date: new Date(point.date)
        })).sort((a, b) => a.date - b.date)
    }, [chartData])

    const filteredChartData = useMemo(() => {
        if (chartRange === 'all') return chartPoints

        const now = new Date()
        const daysMap = {
            '1m': 30,
            '3m': 90,
            '6m': 180,
            '1y': 365
        }
        const cutoff = new Date(now.setDate(now.getDate() - (daysMap[chartRange] || 0)))
        return chartPoints.filter(point => point.date >= cutoff)
    }, [chartPoints, chartRange])

    const filteredTransactions = useMemo(() => {
        if (!wallet?.transactions) return []
        return wallet.transactions
            .filter(tx => {
                const query = searchTerm.trim().toLowerCase()
                if (!query) return true
                const description = (tx.description || '').toLowerCase()
                const tag = (tx.tagName || '').toLowerCase()
                return description.includes(query) || tag.includes(query)
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date))
    }, [wallet, searchTerm])

    async function handleCreateTag() {
        if (!newTagName.trim()) return

        try {
            await axios.post(
                `${API_URL}/api/tag/create`,
                { Name: newTagName.trim() },
                authHeaders
            )
            setNewTagName('')
            await loadTags()
            setMessage('Tag created successfully.')
        } catch (error) {
            console.error('Failed to create tag', error)
            setMessage('Failed to create tag.')
        }
    }

    async function handleDeleteTag(tagId) {
        try {
            await axios.delete(`${API_URL}/api/tag/${tagId}`, authHeaders)
            setTags(tags.filter(tag => tag.id !== tagId))
            if (selectedTagId === tagId) setSelectedTagId('')
            setMessage('Tag deleted successfully.')
        } catch (error) {
            console.error('Failed to delete tag', error)
            setMessage('Failed to delete tag.')
        }
    }

    async function handleAddTransaction() {
        const amount = Number(transactionAmount)
        if (!amount || !selectedTagId) {
            setMessage('Please provide an amount and select a tag to create the transaction.')
            return
        }

        if (!wallet) {
            setMessage('No wallet available to add transaction.')
            return
        }

        const selectedTag = tags.find(tag => tag.id === selectedTagId)
        if (!selectedTag) {
            setMessage('Selected tag is invalid.')
            return
        }

        try {
            await axios.post(
                `${API_URL}/api/transaction/create`,
                {
                    Amount: amount,
                    Description: transactionDescription || selectedTag.name,
                    Date: transactionDate ? new Date(transactionDate) : new Date(),
                    TagName: selectedTag.name,
                    WalletInformationId: wallet.id,
                    IsRecurring: recurring === 'monthly',
                    Recurrence: recurring === 'monthly' ? 'Monthly' : 'One-time'
                },
                authHeaders
            )

            setTransactionAmount('')
            setTransactionDescription('')
            setTransactionDate('')
            setSelectedTagId('')
            setMessage('Transaction created successfully.')
            await loadWallet()
            await loadChart()
            await loadAiInsights()
        } catch (error) {
            console.error('Failed to create transaction', error)
            setMessage('Failed to add transaction.')
        }
    }

    async function handleSaveWallet() {
        try {
            await axios.post(
                `${API_URL}/api/wallet/createbydto`,
                {
                    income: parseFloat(income) || 0,
                    goal: parseFloat(goal) || 0,
                    transactions: []
                },
                authHeaders
            )

            setMessage('Wallet saved successfully.')
            await loadWallet()
            await loadChart()
            await loadAiInsights()
        } catch (error) {
            console.error('Failed to save wallet', error)
            setMessage('Failed to save wallet.')
        }
    }

    async function loadAiInsights() {
        setAiLoading(true)
        setAiError('')

        try {
            const response = await axios.get(`${API_URL}/api/ai/insights`, authHeaders)
            setAiInsights(response.data?.message || 'Nenhum insight disponível ainda.')
        } catch (error) {
            console.error('Failed to load AI insights', error)
            setAiError('Unable to load AI insights. Please check your backend configuration.')
        } finally {
            setAiLoading(false)
        }
    }

    async function askAiQuestion() {
        if (!aiQuestion.trim()) {
            setAiError('Please type a question for the assistant.')
            return
        }

        setAiLoading(true)
        setAiError('')

        try {
            const response = await axios.post(
                `${API_URL}/api/ai/ask`,
                { question: aiQuestion },
                authHeaders
            )
            setAiQuestionResponse(response.data?.message || 'No answer returned from AI.')
            setAiQuestion('')
        } catch (error) {
            console.error('Failed to ask AI question', error)
            setAiError('Unable to ask the AI assistant right now.')
        } finally {
            setAiLoading(false)
        }
    }

    function formatCurrency(value) {
        return Number(value).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
        })
    }

    function formatDate(value) {
        return value ? new Date(value).toLocaleDateString('en-US') : '-'
    }

    return (
        <div className="dashboard-app">
            <header className="topbar">
                <div className="brand-block">
                    <div className="logo-badge">YW</div>
                    <div>
                        <p className="brand-label">Your Wallet</p>
                        <strong>Fintech Dashboard</strong>
                    </div>
                </div>

                <div className="topbar-actions">
                    <div className="user-card">
                        <div className="user-avatar">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>

                        <div className="user-details">
                            <span className="user-role">
                                Logged in
                            </span>
                            <strong>{user?.username}</strong>
                        </div>

                        <button
                            className="logout-btn"
                            onClick={onLogout}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <nav className="tabs-bar">
                <button className={activeTab === 'dashboard' ? 'tab active' : 'tab'} onClick={() => setActiveTab('dashboard')}>
                    Dashboard
                </button>
                <button className={activeTab === 'tags' ? 'tab active' : 'tab'} onClick={() => setActiveTab('tags')}>
                    Tags
                </button>
            </nav>

            <main className="dashboard-content">
                {message && <div className="toast-card">{message}</div>}

                {activeTab === 'dashboard' ? (
                    <>
                        <section className="summary-grid">
                            <article className="summary-card">
                                <div className="summary-top">
                                    <span>Current balance</span>
                                    <span className="badge positive">{balanceTrend >= 0 ? '+' : ''}{balanceTrend}%</span>
                                </div>
                                <strong>{formatCurrency(currentBalance)}</strong>
                                <p>Available balance in the active wallet.</p>
                            </article>

                            <article className="summary-card">
                                <div className="summary-top">
                                    <span>Monthly income</span>
                                    <span className="badge">+8%</span>
                                </div>
                                <strong>{formatCurrency(totalIncome)}</strong>
                                <p>Income target for the period.</p>
                            </article>

                            <article className="summary-card">
                                <div className="summary-top">
                                    <span>Monthly expense</span>
                                    <span className="badge negative">-3%</span>
                                </div>
                                <strong>{formatCurrency(expenseValue)}</strong>
                                <p>Despesas registradas neste mês.</p>
                            </article>

                            <article className="summary-card">
                                <div className="summary-top">
                                    <span>Monthly savings</span>
                                    <span className={`badge ${monthlySavings >= 0 ? 'positive' : 'negative'}`}>
                                        {monthlySavings >= 0 ? '+' : ''}{formatCurrency(monthlySavings)}
                                    </span>
                                </div>
                                <strong>{formatCurrency(monthlySavings)}</strong>
                                <p>Estimated savings with current data.</p>
                            </article>
                        </section>

                        <section className="wallet-actions-grid">
                            <article className="wallet-card">
                                <div className="card-head">
                                    <div>
                                        <p className="eyebrow">Wallet settings</p>
                                        <h2>Update account overview</h2>
                                    </div>
                                    <span className="badge">Quick setup</span>
                                </div>

                                <div className="wallet-form-grid">
                                    <label>
                                        Account balance
                                        <input
                                            className="form-input"
                                            type="text"
                                            placeholder="0.00"
                                            value={income}
                                            onChange={e => setIncome(onlyNumbers(e.target.value))}
                                        />
                                    </label>

                                    <label>
                                        Monthly goal
                                        <input
                                            className="form-input"
                                            type="text"
                                            placeholder="0.00"
                                            value={goal}
                                            onChange={e => setGoal(onlyNumbers(e.target.value))}
                                        />
                                    </label>

                                    <label>
                                        Expected expenses
                                        <input
                                            className="form-input"
                                            type="text"
                                            placeholder="0.00"
                                            value={manualExpenses}
                                            onChange={e => setManualExpenses(onlyNumbers(e.target.value))}
                                        />
                                    </label>
                                </div>

                                <p className="field-note">Enter your balance, goal and expected expenses to keep the dashboard numbers aligned.</p>
                                <button className="primary-btn" onClick={handleSaveWallet}>Save wallet</button>
                            </article>

                            <article id="quick-expense-card" className="quick-actions-card">
                                <div className="card-head">
                                    <div>
                                        <p className="eyebrow">Quick expense</p>
                                        <h2>Record a new spend</h2>
                                    </div>
                                </div>

                                <p className="field-note">Select a category and add the amount you want to record.</p>

                                <div className="quick-form-row">
                                    <label>
                                        Category
                                        <select value={selectedTagId} onChange={e => setSelectedTagId(e.target.value)} className="form-input select-input">
                                            <option value="">Select a category</option>
                                            {tags.map(tag => (
                                                <option key={tag.id} value={tag.id}>{tag.name}</option>
                                            ))}
                                        </select>
                                    </label>

                                    <label>
                                        Amount
                                        <input
                                            className="form-input"
                                            type="text"
                                            placeholder="0.00"
                                            value={transactionAmount}
                                            onChange={e => setTransactionAmount(onlyNumbers(e.target.value))}
                                        />
                                    </label>

                                    <label>
                                        Recurring expense
                                        <select value={recurring} onChange={e => setRecurring(e.target.value)} className="form-input select-input">
                                            <option value="no">No</option>
                                            <option value="monthly">Every month</option>
                                        </select>
                                    </label>
                                </div>

                                <p className="field-note">If you choose "Every month", the same amount is considered a recurring monthly expense.</p>

                                <div className="tag-chip-grid">
                                    {tags.length === 0 ? (
                                        <p className="field-note">Create tags in the Tags tab to use them here.</p>
                                    ) : (
                                        tags.map(tag => (
                                            <button
                                                type="button"
                                                key={tag.id}
                                                className={selectedTagId === tag.id ? 'tag-chip selected' : 'tag-chip'}
                                                onClick={() => setSelectedTagId(tag.id)}
                                            >
                                                {tag.name}
                                            </button>
                                        ))
                                    )}
                                </div>

                                <p className="field-note">If you choose monthly, this expense will be applied every month.</p>
                                <button className="primary-btn" onClick={handleAddTransaction}>
                                    Add expense
                                </button>
                            </article>
                        </section>

                        <section className="ai-panel">
                            <article className="ai-card">
                                <div className="card-head">
                                    <div>
                                        <p className="eyebrow">AI insights</p>
                                        <h2>Smart financial guidance</h2>
                                    </div>
                                </div>

                                <div className="ai-body">
                                    {aiLoading ? (
                                        <p className="field-note">Loading insights...</p>
                                    ) : aiError ? (
                                        <p className="field-note error-text">{aiError}</p>
                                    ) : (
                                        <p className="ai-insight-text">{aiInsights || 'No insights available yet.'}</p>
                                    )}
                                </div>

                                <div className="ai-question-row">
                                    <textarea
                                        className="form-input ai-input"
                                        rows="3"
                                        placeholder="How much did I spend this month?"
                                        value={aiQuestion}
                                        onChange={e => setAiQuestion(e.target.value)}
                                    />
                                    <button className="primary-btn" onClick={askAiQuestion} disabled={aiLoading}>
                                        Ask AI
                                    </button>
                                </div>

                                {aiQuestionResponse && (
                                    <div className="ai-response-card">
                                        <p>{aiQuestionResponse}</p>
                                    </div>
                                )}
                            </article>
                        </section>

                        <section className="goal-panel">
                            <div>
                                <p className="eyebrow">Financial goal</p>
                                <h2>{formatCurrency(goalValue)}</h2>
                                <p className="goal-text">Track progress toward your next financial goal.</p>
                            </div>

                            <div className="goal-stats">
                                <div>
                                    <span>Progress</span>
                                    <strong>{goalProgress}%</strong>
                                </div>
                                <div>
                                    <span>Current</span>
                                    <strong>{formatCurrency(currentBalance)}</strong>
                                </div>
                                <div>
                                    <span>Remaining</span>
                                    <strong>{formatCurrency(Math.max(0, goalValue - currentBalance))}</strong>
                                </div>
                            </div>

                            <div className="progress-bar-background">
                                <div className="progress-bar-fill" style={{ width: `${goalProgress}%` }} />
                            </div>

                            <div className="goal-footer">
                                <span>{monthsToGoal === null ? 'Save your wallet to enable goal' : `${monthsToGoal} months to reach`}</span>
                                <span>Current goal</span>
                            </div>
                        </section>

                        <section className="charts-grid">
                            <article className="chart-panel">
                                <div className="card-head">
                                    <div>
                                        <p className="eyebrow">Balance trend</p>
                                        <h2>Financial evolution</h2>
                                    </div>
                                    <div className="pill-group">
                                        {['1m', '3m', '6m', '1y', 'all'].map(option => (
                                            <button
                                                key={option}
                                                className={chartRange === option ? 'pill active' : 'pill'}
                                                onClick={() => setChartRange(option)}
                                            >
                                                {option.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="chart-wrapper">
                                    <ResponsiveContainer width="100%" height={310}>
                                        <LineChart data={filteredChartData}>
                                            <CartesianGrid strokeDasharray="4 4" stroke="#1e293b" />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={date => new Date(date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                                                tick={{ fill: '#94a3b8' }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                            <Tooltip
                                                labelFormatter={label => new Date(label).toLocaleDateString('en-US')}
                                                contentStyle={{ background: '#111827', border: '1px solid #334155', color: '#f8fafc' }}
                                            />
                                            <Line type="monotone" dataKey="balance" stroke="#22c55e" strokeWidth={3} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </article>

                            <article className="metric-card">
                                <div className="card-head">
                                    <div>
                                        <p className="eyebrow">Performance</p>
                                        <h2>Income vs expenses</h2>
                                    </div>
                                </div>

                                <div className="metric-grid">
                                    <div className="metric-box">
                                        <span>Income</span>
                                        <strong>{formatCurrency(totalIncome)}</strong>
                                    </div>
                                    <div className="metric-box">
                                        <span>Expenses</span>
                                        <strong>{formatCurrency(expenseValue)}</strong>
                                    </div>
                                    <div className="metric-box">
                                        <span>Savings</span>
                                        <strong>{formatCurrency(monthlySavings)}</strong>
                                    </div>
                                </div>
                            </article>
                        </section>

                        <section className="transaction-panel">
                            <div className="card-head">
                                <div>
                                    <p className="eyebrow">Recent activity</p>
                                    <h2>Transactions</h2>
                                </div>
                                <input
                                    className="search-input"
                                    type="search"
                                    placeholder="Search by description or tag"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Category</th>
                                            <th>Description</th>
                                            <th>Amount</th>
                                            <th>Type</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTransactions.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="empty-state">No transactions found.</td>
                                            </tr>
                                        ) : (
                                            filteredTransactions.map(tx => (
                                                <tr key={tx.id}>
                                                    <td>{formatDate(tx.date)}</td>
                                                    <td>{tx.tagName || 'General'}</td>
                                                    <td>{tx.description || '—'}</td>
                                                    <td>{formatCurrency(tx.amount)}</td>
                                                    <td>{tx.amount >= 0 ? 'Expense' : 'Income'}</td>
                                                </tr>
                                            )
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </>
                ) : (
                    <section className="tags-page">
                        <div className="tag-card">
                            <div className="tag-form-row">
                                <input
                                    className="form-input"
                                    placeholder="New tag name"
                                    value={newTagName}
                                    onChange={e => setNewTagName(e.target.value)}
                                />
                                <button className="primary-btn" onClick={handleCreateTag}>Create tag</button>
                            </div>

                            {tags.length === 0 ? (
                                <p className="empty-state">No tags saved yet.</p>
                            ) : (
                                <div className="tags-container">
                                    {tags.map(tag => (
                                        <div key={tag.id} className="tag-item">
                                            <div>
                                                <strong>{tag.name}</strong>
                                            </div>
                                            <button className="delete-btn" onClick={() => handleDeleteTag(tag.id)}>
                                                Delete
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </main>

        </div>
    )
}
