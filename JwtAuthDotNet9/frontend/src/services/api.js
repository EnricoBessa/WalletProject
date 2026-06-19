// services/api.js
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

// Ensure both the default axios instance and a named instance use the configured base URL
axios.defaults.baseURL = API_URL

export const api = axios.create({
    baseURL: API_URL
})

const attachToken = config => {
    const token = localStorage.getItem("token")
    if (token) config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` }
    return config
}

// Apply interceptor to both instances so existing imports of `axios` also work
axios.interceptors.request.use(attachToken)
api.interceptors.request.use(attachToken)