import { useEffect } from "react"

export default function NotificationToast({ message, onClose }) {

    if (!message) return null

    return (
        <div className="toast">
            <span>🔥</span>
            <p>{message}</p>
            <button onClick={onClose}>✕</button>
        </div>
    )
}

