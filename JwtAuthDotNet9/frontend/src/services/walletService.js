// services/walletService.js
import { api } from './api'

export async function getCurrentWallet() {
    const response = await api.get('/api/wallet/current')
    return { id: response.data }
}