import React, { useState, useEffect } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'

export default function App() {
    const [token, setToken] = useState(() => localStorage.getItem('token'))
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'))
    const [screen, setScreen] = useState('login') // ✅ AGORA AQUI

    useEffect(() => {
        if (token) localStorage.setItem('token', token)
        else localStorage.removeItem('token')

        if (user) localStorage.setItem('user', JSON.stringify(user))
        else localStorage.removeItem('user')
    }, [token, user])

    function handleLogin({ username, token }) {
        setUser({ username })
        setToken(token)
    }

    function handleLogout() {
        setToken(null)
        setUser(null)
    }

    return (
        <div className="app-root">
            {!token ? (
                screen === 'login' ? (
                    <Login
                        onLogin={handleLogin}
                        onGoToRegister={() => setScreen('register')}
                    />
                ) : (
                    <Register
                        onBack={() => setScreen('login')}
                    />
                )
            ) : (
                <Dashboard user={user} onLogout={handleLogout} />
            )}
        </div>
    )
}