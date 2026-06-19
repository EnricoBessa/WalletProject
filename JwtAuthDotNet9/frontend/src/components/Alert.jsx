import { useEffect } from 'react'

export default function Alert({ message, type = 'success', onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000)
        return () => clearTimeout(timer)
    }, [onClose])

    return (
        <div className={`alert-toast ${type}`} role="alert">
            {message}
        </div>
    )
}