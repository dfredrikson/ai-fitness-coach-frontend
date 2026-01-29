import { useEffect } from "react"

export default function NotificationToast({ message, onClose }) {
    useEffect(() => {
        if (!message) return
    }, [message])

    return (
        <div className="toast">
            <span>💪</span>
            <p>{message}</p>
            <button onClick={onClose}>✕</button>
        </div>
    )
}
