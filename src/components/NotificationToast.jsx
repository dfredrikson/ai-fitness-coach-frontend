export default function NotificationToast({ message, onClose }) {
    if (!message) return null

    return (
        <div style={overlayStyle}>
            <div style={toastStyle}>
                <div style={badgeStyle}>✨</div>

                <h3 style={titleStyle}>
                    Nueva actividad registrada
                </h3>

                <p style={messageStyle}>
                    {message}
                </p>

                <button style={closeStyle} onClick={onClose}>
                    Cerrar
                </button>
            </div>
        </div>
    )
}

const overlayStyle = {
    position: "fixed",
    inset: 0,
    backdropFilter: "blur(10px)",
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
}

const toastStyle = {
    background: "rgba(18,18,18,0.85)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "22px",
    padding: "26px 30px",
    maxWidth: "420px",
    textAlign: "center",
    color: "#fff",
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
    animation: "fadeIn .25s ease-out"
}

const badgeStyle = {
    fontSize: "34px",
    marginBottom: "10px"
}

const titleStyle = {
    fontSize: "17px",
    fontWeight: 600,
    marginBottom: "6px",
    letterSpacing: "0.2px"
}

const messageStyle = {
    fontSize: "15px",
    opacity: 0.88,
    lineHeight: 1.45
}

const closeStyle = {
    marginTop: "18px",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.25)",
    color: "#fff",
    padding: "8px 18px",
    borderRadius: "12px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all .2s ease"
}
