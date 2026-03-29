// services/transactionService.js
import { api } from './api'

export async function getTags(walletId) {
    const response = await api.post('/api/transaction/listalltag', {
        WalletInformationId: walletId
    })

    return response.data.map(tx => ({
        id: tx.id,
        name: tx.tagName,
        value: tx.amount
    }))
}

export async function createTransaction(data) {
    const response = await api.post('/api/transaction/create', data)
    return response.data
}