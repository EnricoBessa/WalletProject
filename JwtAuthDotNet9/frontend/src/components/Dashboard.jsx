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
    const [income, setIncome] = useState('')
    const [expenses, setExpenses] = useState('')
    const [balance, setBalance] = useState('')
    // saved balance from DB (valor que o usuário tem guardado)
    const [savedBalance, setSavedBalance] = useState('')
    const [goal, setGoal] = useState('')
    const [history, setHistory] = useState([])
    const [selectedMonth, setSelectedMonth] = useState('all')
    const [page, setPage] = useState('dashboard')
    const [wallet, setWallet] = useState(null)
    const [tags, setTags] = useState([])
    const [selectedTags, setSelectedTags] = useState([])
    const API_URL = import.meta.env.VITE_API_URL

    function onlyNumbers(value) {
        const cleaned = value.replace(/[^0-9.]/g, '')
        const parts = cleaned.split('.')
        if (parts.length <= 1) return cleaned
        return parts.shift() + '.' + parts.join('')
    }

    useEffect(() => {
        async function loadData() {
            try {
                const walletResp = await axios.get(
                    `${API_URL}/api/user/currentwalletinformation`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                )

                if (!walletResp.data || walletResp.data.length === 0) {
                    alert("No wallet found for user")
                    return
                }


                // garante array e ordena por createdAt (asc)
                const wallets = (walletResp.data || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

                // 🔥 última wallet (mais recente)
                const latestWallet = wallets[wallets.length - 1]

                setWallet(latestWallet)
                setIncome(latestWallet.income?.toString() || '')
                setGoal(latestWallet.goal?.toString() || '')

                // 🔥 TAGS da última wallet
                const formattedTags = latestWallet.transactions.map(t => ({
                    id: t.id,
                    name: t.description,
                    value: t.amount
                }))

                setTags(formattedTags)

                // 🔥 HISTÓRICO DO GRÁFICO
                // calculamos o saldo acumulado (current) a cada save (cada WalletInformation)
                // para mostrar a evolução do saldo ao longo do tempo
                let cumulative = 0
                const historyData = wallets.map(w => {
                    const transactionsSum = (w.transactions || []).reduce((acc, t) => acc + Number(t.amount || 0), 0)
                    const income = parseFloat(w.income) || 0

                    // approximated monthly savings for this wallet: income - transactions
                    const monthlySavings = income - transactionsSum

                    cumulative += monthlySavings

                    return {
                        date: new Date(w.createdAt),
                        balance: cumulative
                    }
                })

                setHistory(historyData)

                // 🔥 saldo atual = último ponto do histórico
                const lastBalance = historyData.length ? historyData[historyData.length - 1].balance : 0
                setSavedBalance(lastBalance.toString())

            } catch (err) {
                console.error(err)
                alert('Error loading data: ' + err)
            }
        }

        loadData()
    }, [])

    async function handleSave() {
        try {
            const current = parseFloat(savedBalance) || 0
            const newCurrent = current + difference

            await axios.post(
                `${API_URL}/api/wallet/createbydto`,
                {
                    income: parseFloat(income),
                    goal: parseFloat(goal),
                    transactions: selectedTags.map(tag => ({
                        amount: parseFloat(tag.value),
                        description: tag.name,
                        tagName: tag.name
                    }))
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            )

            // 🔥 atualiza o saldo local também
            setSavedBalance(newCurrent.toString())

            alert('Saved successfully!')
        } catch (ex) {
            alert('Error saving data ' + ex)
        }
    }

    async function handleAddTransaction() {
        const tagName = prompt('Category (ex: Food)')
        const amount = prompt('Value')
        const description = prompt('Description (optional)')

        if (!tagName || !amount) return

        try {
            if (!wallet) {
                alert("Error: wallet not found for this user.")
                return
            }

            const response = await axios.post(
                `${API_URL}/api/transaction/create`,
                {
                    Amount: Number(amount),
                    Description: description,
                    Date: new Date(),
                    TagName: tagName,
                    WalletInformationId: wallet.id,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            )

            const newTag = {
                id: response.data?.id || Math.random(),
                name: tagName,
                value: Number(amount)
            }

            setTags(prev => [...prev, newTag])

        } catch (ex) {
            alert('Error saving transaction: ' + ex)
        }
    }

    function formatCurrency(value) {
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        })
    }

    function groupByMonth(wallets) {
        const map = {}

        wallets.forEach(w => {
            const date = new Date(w.createdAt)
            const key = `${date.getFullYear()}-${date.getMonth()}`

            const current = w.transactions.reduce(
                (acc, t) => acc + Number(t.amount),
                0
            )

            map[key] = {
                date,
                balance: current
            }
        })

        return Object.values(map)
    }

    function parseDotNetDate(dateString) {
        if (!dateString) return null

        // troca espaço por T e remove microssegundos extras
        const formatted = dateString.replace(' ', 'T').split('.')[0]

        return new Date(formatted)
    }
    const totalTagsValue = useMemo(() => {
        return selectedTags.reduce((acc, tag) => acc + Number(tag.value), 0)
    }, [selectedTags])

    const monthlySavings = useMemo(() => {
        const inc = parseFloat(income) || 0
        const manualExpenses = parseFloat(expenses) || 0
        const exp = manualExpenses + totalTagsValue

        return inc - exp // ❗ remove o Math.max
    }, [income, totalTagsValue, expenses])

    // currentDisplayed: computed current balance = savedBalance - max(0, expenses - income)
    const currentDisplayed = useMemo(() => {
        const saved = parseFloat(savedBalance) || 0
        const inc = parseFloat(income) || 0
        const manualExpenses = parseFloat(expenses) || 0
        const exp = manualExpenses + totalTagsValue

        const deficit = Math.max(0, exp - inc)
        const newCurrent = saved - deficit
        return newCurrent.toString()
    }, [savedBalance, income, expenses, totalTagsValue])

    const monthsToGoal = useMemo(() => {
        const bal = parseFloat(currentDisplayed) || 0
        const g = parseFloat(goal) || 0
        const needed = Math.max(0, g - bal)

        if (monthlySavings <= 0) return null

        return Math.ceil(needed / monthlySavings)
    }, [currentDisplayed, goal, monthlySavings])

    const filteredHistory = useMemo(() => {
        if (selectedMonth === 'all') return history

        return history.filter(item => {
            const month = new Date(item.date).getMonth() + 1
            return month === Number(selectedMonth)
        })
    }, [history, selectedMonth])    

    const difference = useMemo(() => {
        const inc = parseFloat(income) || 0
        const manualExpenses = parseFloat(expenses) || 0
        const exp = manualExpenses + totalTagsValue

        return inc - exp
    }, [income, expenses, totalTagsValue])

    return (
        <div className="dashboard">
            <aside className="sidebar">
                {/* LOGO */}
                <div className="sidebar-top">
                    <h2 className="logo">💰 Your Wallet</h2>
                </div>

                {/* MENU */}
                <nav className="menu">
                    <button className={`menu-item ${page === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setPage('dashboard')}>
                        📊 Dashboard
                    </button>
                </nav>
                               

                {/* FOOTER */}
                <div className="sidebar-footer">
                    {/* USER */}
                    <div className="user-box">
                        <div className="avatar">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>

                        <div>
                            <p className="username">{user?.username}</p>
                        </div>
                    </div>

                    <button className="logout-btn" onClick={onLogout}>
                        🚪 Logout
                    </button>
                </div>
            </aside>

            <div className="content">
                
                <div className="finance-layout">

                    {/* 🔝 LINHA DE CIMA */}
                    <div className="top-row">
                        <div className="card highlight">
                            <h3>Income</h3>
                            <input
                                value={income}
                                onChange={e => setIncome(onlyNumbers(e.target.value))}
                            />
                        </div>

                        <div className="card highlight">
                            <h3>Expenses</h3>
                            <input
                                value={expenses}
                                onChange={e => setExpenses(onlyNumbers(e.target.value))}
                            />
                            <p>+ Tags: $ {totalTagsValue}</p>
                        </div>

                        <div className="card">
                            <h3>Monthly Tags</h3>

                            <button onClick={handleAddTransaction}>+ Add Tag</button>

                            <table className="tags-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Value</th>
                                        <th>Select</th>
                                        <th>Delete</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {tags.map((tag, index) => {
                                        const selected = selectedTags.includes(tag)

                                        return (
                                            <tr key={tag.id} className={selected ? 'selected-row' : ''}>
                                                <td>{tag.name}</td>
                                                <td>$ {tag.value}</td>

                                                {/* BOTÃO DE SELECIONAR */}
                                                <td>
                                                    <button
                                                        className={`select-btn ${selected ? 'active' : ''}`}
                                                        onClick={() => {
                                                            if (selected) {
                                                                // desmarca: remove dos selecionados
                                                                setSelectedTags(selectedTags.filter(t => t !== tag))
                                                            } else {
                                                                // marca: adiciona aos selecionados
                                                                setSelectedTags([...selectedTags, tag])
                                                            }
                                                        }}
                                                    >
                                                        {selected ? '✓' : '+'}
                                                    </button>
                                                </td>

                                                {/* BOTÃO DE EXCLUIR */}
                                                <td>
                                                    <button
                                                        className="delete-btn"
                                                            onClick={() => {
                                                            // remove tag da lista e dos selecionados
                                                            setTags(tags.filter(t => t !== tag))
                                                            setSelectedTags(selectedTags.filter(t => t !== tag))
                                                        }}
                                                    >
                                                        ✕
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 🔽 LINHA DE BAIXO */}
                    <div className="bottom-row">
                        <div className="card">
                            <h3>Current</h3>
                            <input
                                value={currentDisplayed}
                                onChange={e => setSavedBalance(onlyNumbers(e.target.value))}
                            />
                        </div>

                        <div className="card">
                            <h3>Goal</h3>
                            <input
                                value={goal}
                                onChange={e => setGoal(onlyNumbers(e.target.value))}
                            />
                        </div>
                    </div>

                    {/* LINHA DO BOTÃO */}
                    <div className="save-row">
                        <button className="save-btn" onClick={handleSave}>
                            Save
                        </button>
                    </div>
                </div>

                <div className="results">
                    <div className="result-card">
                        <h3>Monthly Savings</h3>
                        <p className="money"
                            style={{
                                color: monthlySavings < 0 ? '#e74c3c' : '#2ecc71'
                            }}
                        >
                            {formatCurrency(monthlySavings)}
                        </p>
                    </div>

                    <div className="result-card">
                        <h3>Time to Goal</h3>
                        <p>
                            {monthsToGoal === null
                                ? 'No monthly savings'
                                : `${monthsToGoal} months`}
                        </p>
                    </div>
                </div>

                {/* 🎯 FILTER */}
                <select onChange={e => setSelectedMonth(e.target.value)}>
                    <option value="all">All months</option>
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                </select>

                {/* 📈 GRAPH */}
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={filteredHistory}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(date) =>
                                    new Date(date).toLocaleDateString('pt-BR', {
                                        month: 'short',
                                        year: '2-digit'
                                    })
                                }
                            />                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="balance" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}