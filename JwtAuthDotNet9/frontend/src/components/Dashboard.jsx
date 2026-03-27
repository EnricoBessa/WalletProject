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
    const [goal, setGoal] = useState('')
    const [history, setHistory] = useState([])
    const [selectedMonth, setSelectedMonth] = useState('all')
    const [page, setPage] = useState('dashboard')
    const [tags, setTags] = useState([])
    const [selectedTags, setSelectedTags] = useState([])
    const API_URL = import.meta.env.VITE_API_URL

    function onlyNumbers(value) {
        return value.replace(/\D/g, '')
    }

    useEffect(() => {
        async function loadData() {
            try {
                const latest = await axios.get(`${API_URL}/api/finance/latest`)
                const historyData = await axios.get(`${API_URL}/api/finance/history`)

                if (latest.data) {
                    setIncome(latest.data.income || '')
                    setExpenses(latest.data.expenses || '')
                    setBalance(latest.data.balance || '')
                    setGoal(latest.data.goal || '')
                }

                setHistory(historyData.data || [])
            } catch {
                alert('Error loading data')
            }
        }

        loadData()
    }, [])

    useEffect(() => {
        async function loadTags() {
            try {
                const response = await axios.get(`${API_URL}/api/tag`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                })

                setTags(response.data)
            } catch {
                alert('Error loading tags')
            }
        }

        loadTags()
    }, [])

    const [wallet, setWallet] = useState(null)

    useEffect(() => {
        async function loadWallet() {
            const response = await axios.get(`${API_URL}/api/wallet`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })

            setWallet(response.data[0])
        }

        loadWallet()
    }, [])

    async function handleSave() {
        try {
            await axios.post(`${API_URL}/api/wallet`, {
                income,
                goal,
                transactions: selectedTags.map(tag => ({
                    tagId: tag.id,
                    amount: tag.value,
                    description: tag.name
                }))
            })
            alert('Saved successfully!')
        } catch(ex) {
            alert('Error saving data' + ex)
        }
    }

    async function handleAddTransaction() {
        const tagName = prompt('Category (ex: Food)')
        const amount = prompt('Value')
        const description = prompt('Description (optional)')

        if (!tagName || !amount) return

        try {
            const response = await axios.post(
                `${API_URL}/api/transaction`,
                {
                    tagName: tagName,
                    amount: Number(amount),
                    description: description,
                    date: new Date(),
                    walletInformationId: wallet.id
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            )

            console.log(response.data)

        } catch (ex) {
            alert('Error saving transaction: ' + ex)
        }
    }

    const totalTagsValue = useMemo(() => {
        return selectedTags.reduce((acc, tag) => acc + Number(tag.value), 0)
    }, [selectedTags])

    const monthlySavings = useMemo(() => {
        const inc = parseFloat(income) || 0
        const exp = (parseFloat(expenses) || 0) + totalTagsValue
        return Math.max(0, inc - exp)
    }, [income, expenses, totalTagsValue])

    const monthsToGoal = useMemo(() => {
        const bal = parseFloat(balance) || 0
        const g = parseFloat(goal) || 0
        const needed = Math.max(0, g - bal)
        if (monthlySavings <= 0) return null
        return Math.ceil(needed / monthlySavings)
    }, [balance, goal, monthlySavings])

    const filteredHistory = useMemo(() => {
        if (selectedMonth === 'all') return history

        return history.filter(item => {
            const month = new Date(item.date).getMonth() + 1
            return month === Number(selectedMonth)
        })
    }, [history, selectedMonth])

    if (page === 'tags') {
        return (
            <div className="dashboard">
                <aside className="sidebar">
                    <div>
                        <h2>💰 Wallet</h2>

                        <nav>
                            <span onClick={() => setPage('dashboard')}>Dashboard</span>
                            <span className="active">Tags</span>
                        </nav>
                    </div>

                    <p>Hello, {user?.username}</p>

                    <button onClick={onLogout}>Logout</button>
                </aside>

                <div className="content">
                    <h1>Manage Tags</h1>

                    {/* ✅ AGORA USA BACKEND */}
                    <button onClick={handleAddTransaction}>
                        + Add Tag
                    </button>

                    <div style={{ marginTop: 20 }}>
                        <div className="tags-container">
                            {tags.map((tag) => {
                                const selected = selectedTags.includes(tag)

                                return (
                                    <div
                                        key={tag.id}
                                        className={`tag-chip ${selected ? 'selected' : ''}`}
                                        onClick={() => {
                                            if (selected) {
                                                setSelectedTags(selectedTags.filter(t => t.id !== tag.id))
                                            } else {
                                                setSelectedTags([...selectedTags, tag])
                                            }
                                        }}
                                    >
                                        <span>{tag.name} - $ {tag.value}</span>

                                        {/* ✅ DELETE CORRIGIDO */}
                                        <button
                                            className="delete-btn"
                                            onClick={async (e) => {
                                                e.stopPropagation()

                                                try {
                                                    await axios.delete(
                                                        `${API_URL}/api/tag/${tag.id}`,
                                                        {
                                                            headers: {
                                                                Authorization: `Bearer ${localStorage.getItem("token")}`
                                                            }
                                                        }
                                                    )

                                                    setTags(prev => prev.filter(t => t.id !== tag.id))
                                                    setSelectedTags(prev => prev.filter(t => t.id !== tag.id))
                                                } catch (err) {
                                                    console.error(err)
                                                    alert('Error deleting tag')
                                                }
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

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
                                                                setSelectedTags(selectedTags.filter(t => t !== tag))
                                                            } else {
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
                                value={balance}
                                onChange={e => setBalance(onlyNumbers(e.target.value))}
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
                        <p className="money">$ {monthlySavings.toFixed(2)}</p>
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
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="balance" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}