// hooks/useTags.js
import { useQuery } from '@tanstack/react-query'
import { getTags } from '../services/transactionService'

export function useTags(walletId) {
    return useQuery({
        queryKey: ['tags', walletId],
        queryFn: () => getTags(walletId),
        enabled: !!walletId
    })
}