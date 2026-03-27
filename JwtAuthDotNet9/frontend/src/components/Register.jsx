import React, { useState } from 'react'
import axios from 'axios'

export default function Register({ onBack }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const API_URL = import.meta.env.VITE_API_URL

    async function handleRegister(e) {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        if (!username || !password) {
            setError('Please fill in all fields')
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        try {
            const response = await axios.post(`${API_URL}/api/auth/register`, {
                username: username,
                password: password
            })

            setSuccess('User created successfully!')
            setUsername('')
            setPassword('')
            setConfirmPassword('')

        } catch (err) {
            setError('Error creating user' + err)
        }
    }

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>📝 Create Account</h1>

                <form onSubmit={handleRegister} className="form">
                    <input
                        placeholder="email@example.com"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                    />

                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}

                    <button type="submit">Register</button>
                </form>

                <button className="link-button" onClick={onBack}>
                    Back to login
                </button>
            </div>
        </div>
    )
}