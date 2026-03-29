    // hooks/useWallet.js
    import { useQuery } from '@tanstack/react-query'
    import { getCurrentWallet } from '../services/walletService'

    export function useWallet() {
        return useQuery({
            queryKey: ['wallet'],
            queryFn: getCurrentWallet
        })
    }