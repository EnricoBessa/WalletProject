import React, { useState } from 'react'
import axios from 'axios'

export default function Login({ onLogin, onGoToRegister }) {
    const [emailOrUsername, setEmailOrUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const API_URL = import.meta.env.VITE_API_URL

    async function handleSubmit(e) {
        e.preventDefault()
        setError(null)

        if (!emailOrUsername || !password) {
            setError('⚠️ Please fill in all fields to continue')
            return
        }

        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, {
                username: emailOrUsername,
                password: password
            })

            if (!response.data || !response.data.accessToken) {
                setError('❌ Invalid username or password. Try again.')
                return
            }

            const token = response.data.accessToken
            const profileResponse = await axios.get(`${API_URL}/api/user/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            onLogin({
                username: profileResponse.data.username || emailOrUsername,
                email: profileResponse.data.email || '',
                token: token
            })
        } catch (err) {
            setError('❌ Invalid username or password. Try again.')
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="logo-badge">YW</div>
                    <div>
                        <p className="brand-label">Your Wallet</p>
                        <strong>Welcome back</strong>
                    </div>
                </div>

                <p className="auth-subtitle">Access your wallet and continue tracking your finances securely.</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        className="form-input"
                        placeholder="Email or username"
                        value={emailOrUsername}
                        onChange={e => setEmailOrUsername(e.target.value)}
                    />

                    <input
                        className="form-input"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />

                    {error && <div className="form-message error">{error}</div>}

                    <button className="primary-btn" type="submit">
                        Sign in
                    </button>
                </form>

                <div className="form-footer">
                    <span>Don't have an account?</span>
                    <button type="button" className="link-button" onClick={onGoToRegister}>
                        Create an account
                    </button>
                </div>
            </div>
        </div>
    )
}