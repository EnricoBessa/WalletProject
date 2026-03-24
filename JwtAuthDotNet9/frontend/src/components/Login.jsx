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
            setError('Please fill in username and password')
            return
        }

        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, {
                email: username,
                password: password
            })

            onLogin({
                username: username,
                token: response.data.accessToken
            })

        } catch (err) {
            setError('Invalid username or password')
        }
    }

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>💰 Wallet</h1>

                <form onSubmit={handleSubmit} className="form">
                    <input
                        placeholder="Email"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />

                    {error && <div className="error">{error}</div>}

                    <button type="submit">Login</button>

                    <button
                        type="button"
                        className="link-button"
                        onClick={onGoToRegister}
                    >
                        Create account
                    </button>
                </form>
            </div>
        </div>
    )
}