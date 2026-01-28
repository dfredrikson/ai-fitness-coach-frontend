import { useEffect } from "react"

export default function NotificationToast({ message, onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000)
        return () => clearTimeout(timer)
    }, [onClose])

    if (!message) return null

    return (
        <div className="toast">
            <span>💪</span>
            <p>{message}</p>
            <button onClick={onClose}>✕</button>
        </div>
    )
}
