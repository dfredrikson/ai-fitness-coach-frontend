import { useEffect } from "react"

export default function NotificationToast({ message, onClose }) {

    if (!message) return null

    return (
        <div className="toast-overlay">
            <div className="toast-centered">
                <span className="toast-icon">🔥</span>
                <p className="toast-message">{message}</p>
                <button className="toast-close" onClick={onClose}>✕</button>
            </div>
        </div>
    )
}

