import { useEffect } from 'react'

export default function Alert({ message, type = 'success', onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000)
        return () => clearTimeout(timer)
    }, [onClose])

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '16px 24px',
            borderRadius: '12px',
            color: '#fff',
            fontWeight: '500',
            boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
            zIndex: 9999,
            backgroundColor:
                type === 'success' ? '#22c55e' :
                    type === 'error' ? '#ef4444' :
                        '#3b82f6',
            animation: 'slideIn 0.3s ease'
        }}>
            {message}
        </div>
    )
}