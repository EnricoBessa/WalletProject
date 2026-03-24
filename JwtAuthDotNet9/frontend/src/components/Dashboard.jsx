import React, { useState, useMemo } from 'react'

export default function Dashboard({ user, onLogout }) {
    const [income, setIncome] = useState('')
    const [expenses, setExpenses] = useState('')
    const [balance, setBalance] = useState('')
    const [goal, setGoal] = useState('')

    const monthlySavings = useMemo(() => {
        const inc = parseFloat(income) || 0
        const exp = parseFloat(expenses) || 0
        return Math.max(0, inc - exp)
    }, [income, expenses])

    const monthsToGoal = useMemo(() => {
        const bal = parseFloat(balance) || 0
        const g = parseFloat(goal) || 0
        const needed = Math.max(0, g - bal)
        if (monthlySavings <= 0) return null
        return Math.ceil(needed / monthlySavings)
    }, [balance, goal, monthlySavings])

    return (
        <div className="dashboard">
            <aside className="sidebar">
                <h2>💰 Wallet</h2>
                <nav>
                    <span className="active">Dashboard</span>
                </nav>
                <button onClick={onLogout}>Logout</button>
            </aside>

            <div className="content">
                <header className="header">
                    <h1>Hello, {user?.username}</h1>
                </header>

                <div className="cards">
                    <div className="card highlight">
                        <h3>Income</h3>
                        <input value={income} onChange={e => setIncome(e.target.value)} />
                    </div>

                    <div className="card highlight">
                        <h3>Expenses</h3>
                        <input value={expenses} onChange={e => setExpenses(e.target.value)} />
                    </div>

                    <div className="card">
                        <h3>Current Balance</h3>
                        <input value={balance} onChange={e => setBalance(e.target.value)} />
                    </div>

                    <div className="card">
                        <h3>Goal</h3>
                        <input value={goal} onChange={e => setGoal(e.target.value)} />
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
            </div>
        </div>
    )
}