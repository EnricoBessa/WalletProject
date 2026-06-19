import React, { useState } from 'react'
import axios from 'axios'

export default function Register({ onBack }) {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const API_URL = import.meta.env.VITE_API_URL

    async function handleRegister(e) {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        if (!username || !email || !password) {
            setError('Please fill in all fields')
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        try {
            await axios.post(`${API_URL}/api/auth/register`, {
                username: username,
                email: email,
                password: password
            })

            setSuccess('User created successfully!')
            setUsername('')
            setEmail('')
            setPassword('')
            setConfirmPassword('')

        } catch (err) {
            setError('Failed to create user. Try a different email or username.')
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="logo-badge">YW</div>
                    <div>
                        <p className="brand-label">Your Wallet</p>
                        <strong>Create your account</strong>
                    </div>
                </div>

                <p className="auth-subtitle">Start managing your money with a modern, intuitive dashboard.</p>

                <form onSubmit={handleRegister} className="auth-form">
                    <input
                        className="form-input"
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />

                    <input
                        className="form-input"
                        placeholder="email@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />

                    <input
                        className="form-input"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />

                    <input
                        className="form-input"
                        type="password"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                    />

                    {error && <div className="form-message error">{error}</div>}
                    {success && <div className="form-message success">{success}</div>}

                    <button className="primary-btn" type="submit">Create account</button>
                </form>

                <div className="form-footer">
                    <span>Already have an account?</span>
                    <button type="button" className="link-button" onClick={onBack}>
                        Back to login
                    </button>
                </div>
            </div>
        </div>
    )
}