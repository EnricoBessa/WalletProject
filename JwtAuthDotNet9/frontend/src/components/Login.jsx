import React, { useState } from 'react'
import axios from 'axios'

export default function Login({ onLogin, onGoToRegister }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const API_URL = import.meta.env.VITE_API_URL

    async function handleSubmit(e) {
        e.preventDefault()
        setError(null)

        if (!username || !password) {
            setError('⚠️ Please fill in all fields to continue')
            return
        }

        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, {
                username: username,
                password: password
            })

            onLogin({
                username: username,
                token: response.data.accessToken
            })

        } catch (err) {
            setError('❌ Invalid email or password. Please try again.' + err)
        }
    }

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>💰 Your Wallet</h1>

                <form onSubmit={handleSubmit} className="form">
                    <input
                        placeholder="Enter your email"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />

                    {error && <div className="error">{error}</div>}

                    <button type="submit">
                        Sign in
                    </button>

                    <button
                        type="button"
                        className="link-button"
                        onClick={onGoToRegister}
                    >
                        Create a new account
                    </button>
                </form>
            </div>
        </div>
    )
}