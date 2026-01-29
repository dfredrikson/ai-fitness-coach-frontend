import { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom'
import { auth, strava, activities, coach, routines } from './services/api'
import NotificationToast from "./components/NotificationToast"

// Auth Context
const AuthContext = createContext(null)

function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            auth.me().then(setUser).catch(() => {
                localStorage.removeItem('token')
            }).finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [])

    const login = async (email, password) => {
        const { access_token } = await auth.login({ email, password })
        localStorage.setItem('token', access_token)
        const userData = await auth.me()
        setUser(userData)
    }

    const register = async (name, email, password) => {
        await auth.register({ name, email, password })
        await login(email, password)
    }

    const logout = () => {
        localStorage.removeItem('token')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

const useAuth = () => useContext(AuthContext)

// Protected Route
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) return <LoadingScreen />
    if (!user) return <Navigate to="/login" />

    return children
}

// Loading Screen
function LoadingScreen() {
    return (
        <div className="flex-center" style={{ minHeight: '100vh' }}>
            <div className="loading-spinner" style={{ width: '3rem', height: '3rem' }}></div>
        </div>
    )
}

// Navbar
function Navbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <nav style={{
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border)',
            padding: '1rem 0'
        }}>
            <div className="container flex-between">
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.75rem' }}>🏃‍♂️</span>
                    <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>AI Fitness Coach</span>
                </Link>

                {user && (
                    <div className="flex gap-2" style={{ alignItems: 'center' }}>
                        <Link to="/" className="nav-link">Panel</Link>
                        <Link to="/activities" className="nav-link">Actividades</Link>
                        <Link to="/chat" className="nav-link">Chat</Link>
                        <Link to="/routines" className="nav-link">Rutinas</Link>
                        <Link to="/settings" className="nav-link">⚙️</Link>
                        <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                            Salir
                        </button>
                    </div>
                )}
            </div>

            <style>{`
        .nav-link {
          padding: 0.5rem 1rem;
          color: var(--text-secondary);
          border-radius: var(--radius-md);
          transition: all 0.2s;
        }
        .nav-link:hover {
          color: var(--text-primary);
          background: var(--bg-tertiary);
        }
      `}</style>
        </nav>
    )
}

// Login Page
function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            await login(email, password)
            navigate('/')
        } catch (err) {
            setError(err.message)
        }
        setLoading(false)
    }

    return (
        <div className="flex-center" style={{ minHeight: '100vh', padding: '2rem' }}>
            <div className="card animate-fadeIn" style={{ width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <span style={{ fontSize: '3rem' }}>🏃‍♂️</span>
                    <h2 style={{ marginTop: '1rem' }}>Iniciar Sesión</h2>
                    <p className="text-secondary">Tu entrenador personal te espera</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Contraseña</label>
                        <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>

                    {error && <p style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</p>}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? <span className="loading-spinner"></span> : 'Entrar'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem' }} className="text-secondary">
                    ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
                </p>
            </div>
        </div>
    )
}

// Register Page
function Register() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { register } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            await register(name, email, password)
            navigate('/')
        } catch (err) {
            setError(err.message)
        }
        setLoading(false)
    }

    return (
        <div className="flex-center" style={{ minHeight: '100vh', padding: '2rem' }}>
            <div className="card animate-fadeIn" style={{ width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <span style={{ fontSize: '3rem' }}>🏃‍♂️</span>
                    <h2 style={{ marginTop: '1rem' }}>Crear Cuenta</h2>
                    <p className="text-secondary">Comienza tu transformación hoy</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nombre</label>
                        <input type="text" className="input" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Contraseña</label>
                        <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required />
                    </div>

                    {error && <p style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</p>}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? <span className="loading-spinner"></span> : 'Registrarse'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem' }} className="text-secondary">
                    ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
                </p>
            </div>
        </div>
    )
}

// Dashboard

function Dashboard() {
    const { user } = useAuth()
    const [stravaStatus, setStravaStatus] = useState(null)
    const [recentActivities, setRecentActivities] = useState([])
    const [activeCoach, setActiveCoach] = useState(null)
    const [syncing, setSyncing] = useState(false)
    const location = useLocation()

    useEffect(() => {
        loadData()
        fetchDailyMotivation()
    }, [])

    const loadData = async () => {
        try {
            const [status, acts, coachData] = await Promise.all([
                strava.status(),
                activities.list(1, 5).catch(() => ({ items: [] })),
                coach.getActive()
            ])
            setStravaStatus(status)
            setRecentActivities(acts.items || [])
            setActiveCoach(coachData)
        } catch (err) {
            console.error(err)
        }
    }

    const fetchDailyMotivation = async () => {
        try {
            const res = await fetch("/api/v1/motivation/daily")
            const data = await res.json()
            if (data.message) {
                // por ahora solo log, luego lo conectamos al toast
                console.log("Motivación diaria:", data.message)
            }
        } catch (err) {
            console.error("Error motivación diaria", err)
        }
    }

    const handleConnectStrava = async () => {
        const { authorization_url } = await strava.getConnectUrl()
        window.location.href = authorization_url
    }

    const handleSync = async () => {
        setSyncing(true)
        try {
            await strava.sync(30)
            await loadData()
        } catch (err) {
            console.error(err)
        }
        setSyncing(false)
    }

    return (
        <div className="page">
            <div className="container">
                <div style={{ marginBottom: '1.25rem' }}>
                    <h1 style={{ fontSize: '1.75rem' }}>¡Hola, {user?.name}! 👋</h1>
                    <p className="text-secondary">Tu entrenador {activeCoach?.name} está listo para ayudarte</p>
                </div>

                {/* Strava Connection Card */}
                <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--primary)' }}>
                    <div className="flex-between">
                        <div className="flex gap-2" style={{ alignItems: 'center' }}>
                            <span style={{ fontSize: '2rem' }}>🔗</span>
                            <div>
                                <h4>Conexión con Strava</h4>
                                <p className="text-secondary text-sm">
                                    {stravaStatus?.connected ? 'Cuenta conectada' : 'Conecta tu cuenta para sincronizar entrenamientos'}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            {stravaStatus?.connected ? (
                                <>
                                    <span className="badge badge-success">Conectado</span>
                                    <button
                                        onClick={handleSync}
                                        className="btn btn-secondary"
                                        style={{ padding: '0.5rem 1rem' }}
                                        disabled={syncing}
                                    >
                                        {syncing ? '⏳' : '🔄'} Sincronizar
                                    </button>
                                </>
                            ) : (
                                <button onClick={handleConnectStrava} className="btn btn-strava">
                                    Conectar Strava
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-3 stats-grid" style={{ marginBottom: '1.5rem' }}>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '2.5rem' }}>{recentActivities.length}</span>
                        <p className="text-secondary">Actividades recientes</p>
                    </div>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '2.5rem' }}>{activeCoach?.icon || '🌟'}</span>
                        <p className="text-secondary">{activeCoach?.name || 'Entrenador'}</p>
                    </div>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '2.5rem' }}>
                            {recentActivities.reduce((sum, a) => sum + (a.distance_km || 0), 0).toFixed(1)} km
                        </span>
                        <p className="text-secondary">Distancia total</p>
                    </div>
                </div>

                {/* Recent Activities */}
                <h3 style={{ marginBottom: '0.75rem' }}>Últimas actividades</h3>
                {recentActivities.length > 0 ? (
                    <div className="grid gap-2">
                        {recentActivities.map(activity => (
                            <Link key={activity.id} to={`/activities/${activity.id}`}>
                                <div className="card flex-between">
                                    <div className="flex gap-2" style={{ alignItems: 'center' }}>
                                        <span style={{ fontSize: '1.5rem' }}>
                                            {activity.type === 'Run' ? '🏃' : activity.type === 'Ride' ? '🚴' : '💪'}
                                        </span>
                                        <div>
                                            <h4>{activity.name}</h4>
                                            <p className="text-secondary text-sm">
                                                {new Date(activity.start_date).toLocaleDateString('es-ES', {
                                                    weekday: 'short', day: 'numeric', month: 'short'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="activity-stats flex gap-3">
                                        <div>
                                            <p style={{ fontWeight: 600 }}>{activity.distance_km?.toFixed(2)} km</p>
                                            <p className="text-secondary text-sm">Distancia</p>
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 600 }}>{Math.floor(activity.duration_minutes)} min</p>
                                            <p className="text-secondary text-sm">Duración</p>
                                        </div>
                                        {activity.analyzed ? (
                                            <span className="badge badge-success">Analizado</span>
                                        ) : (
                                            <span className="badge badge-warning">Pendiente</span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <span style={{ fontSize: '3rem' }}>🏃‍♂️</span>
                        <p className="text-secondary" style={{ marginTop: '1rem' }}>
                            No hay actividades todavía. ¡Conecta Strava y sincroniza tus entrenamientos!
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

// Activities Page
function Activities() {
    const [activityList, setActivityList] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        activities.list(1, 50).then(data => {
            setActivityList(data.items || [])
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [])

    if (loading) return <LoadingScreen />

    return (
        <div className="page">
            <div className="container">
                <h1 style={{ marginBottom: '2rem' }}>Mis Actividades</h1>

                <div className="grid gap-2">
                    {activityList.map(activity => (
                        <Link key={activity.id} to={`/activities/${activity.id}`}>
                            <div className="card activity-card flex-between">
                                <div className="flex gap-2" style={{ alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.5rem' }}>
                                        {activity.type === 'Run' ? '🏃' : activity.type === 'Ride' ? '🚴' : '💪'}
                                    </span>
                                    <div>
                                        <h4>{activity.name}</h4>
                                        <p className="text-secondary text-sm">
                                            {new Date(activity.start_date).toLocaleDateString('es-ES', {
                                                weekday: 'long', day: 'numeric', month: 'long'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3" style={{ textAlign: 'right' }}>
                                    <div>
                                        <p style={{ fontWeight: 600 }}>{activity.distance_km?.toFixed(2)} km</p>
                                        <p className="text-secondary text-sm">Distancia</p>
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 600 }}>{Math.floor(activity.duration_minutes)} min</p>
                                        <p className="text-secondary text-sm">Duración</p>
                                    </div>
                                    {activity.avg_pace && (
                                        <div>
                                            <p style={{ fontWeight: 600 }}>{activity.avg_pace.toFixed(2)} min/km</p>
                                            <p className="text-secondary text-sm">Ritmo</p>
                                        </div>
                                    )}
                                    {activity.analyzed ? (
                                        <span className="badge badge-success">✓</span>
                                    ) : (
                                        <span className="badge badge-warning">⏳</span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}

// Activity Detail Page
function ActivityDetail() {
    const [activity, setActivity] = useState(null)
    const [analyzing, setAnalyzing] = useState(false)
    const [loading, setLoading] = useState(true)
    const location = useLocation()
    const id = location.pathname.split('/').pop()

    useEffect(() => {
        activities.get(id).then(setActivity).finally(() => setLoading(false))
    }, [id])

    const handleAnalyze = async () => {
        setAnalyzing(true)
        try {
            await activities.analyze(id)
            const updated = await activities.get(id)
            setActivity(updated)
        } catch (err) {
            console.error(err)
        }
        setAnalyzing(false)
    }

    if (loading) return <LoadingScreen />
    if (!activity) return <div className="page"><div className="container"><p>Actividad no encontrada</p></div></div>

    const analysis = activity.analyses?.[0]

    return (
        <div className="page">
            <div className="container">
                <Link to="/activities" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    ← Volver a actividades
                </Link>

                <div className="card" style={{ marginBottom: '2rem' }}>
                    <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                        <div className="flex gap-2" style={{ alignItems: 'center' }}>
                            <span style={{ fontSize: '2.5rem' }}>
                                {activity.type === 'Run' ? '🏃' : activity.type === 'Ride' ? '🚴' : '💪'}
                            </span>
                            <div>
                                <h2>{activity.name}</h2>
                                <p className="text-secondary">
                                    {new Date(activity.start_date).toLocaleDateString('es-ES', {
                                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                        {!activity.analyzed && (
                            <button onClick={handleAnalyze} className="btn btn-primary" disabled={analyzing}>
                                {analyzing ? '⏳ Analizando...' : '🤖 Analizar con IA'}
                            </button>
                        )}
                    </div>

                    <div className="grid grid-3">
                        <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
                            <p style={{ fontSize: '1.75rem', fontWeight: 700 }}>{activity.distance_km?.toFixed(2)}</p>
                            <p className="text-secondary">km</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
                            <p style={{ fontSize: '1.75rem', fontWeight: 700 }}>{Math.floor(activity.duration_minutes)}</p>
                            <p className="text-secondary">minutos</p>
                        </div>
                        {activity.avg_pace && (
                            <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
                                <p style={{ fontSize: '1.75rem', fontWeight: 700 }}>{activity.avg_pace.toFixed(2)}</p>
                                <p className="text-secondary">min/km</p>
                            </div>
                        )}
                        {activity.avg_heartrate && (
                            <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
                                <p style={{ fontSize: '1.75rem', fontWeight: 700 }}>{activity.avg_heartrate}</p>
                                <p className="text-secondary">❤️ bpm</p>
                            </div>
                        )}
                        {activity.elevation_gain > 0 && (
                            <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
                                <p style={{ fontSize: '1.75rem', fontWeight: 700 }}>{Math.round(activity.elevation_gain)}</p>
                                <p className="text-secondary">m desnivel</p>
                            </div>
                        )}
                        {activity.calories && (
                            <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
                                <p style={{ fontSize: '1.75rem', fontWeight: 700 }}>{activity.calories}</p>
                                <p className="text-secondary">kcal</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Analysis */}
                {analysis && (
                    <div className="animate-fadeIn">
                        <h3 style={{ marginBottom: '1rem' }}>🤖 Análisis del Entrenador IA</h3>

                        <div className="card" style={{ marginBottom: '1rem', borderLeft: '4px solid var(--primary)' }}>
                            <h4 style={{ marginBottom: '0.75rem' }}>📊 Análisis Técnico</h4>
                            <p style={{ whiteSpace: 'pre-wrap' }}>{analysis.technical_analysis}</p>
                        </div>

                        <div className="card" style={{ marginBottom: '1rem', borderLeft: '4px solid var(--warning)' }}>
                            <h4 style={{ marginBottom: '0.75rem' }}>💡 Correcciones y Sugerencias</h4>
                            <p style={{ whiteSpace: 'pre-wrap' }}>{analysis.corrections}</p>
                        </div>

                        <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
                            <h4 style={{ marginBottom: '0.75rem' }}>🔥 Motivación</h4>
                            <p style={{ whiteSpace: 'pre-wrap' }}>{analysis.motivation}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// Chat Page
function Chat() {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [sending, setSending] = useState(false)
    const [activeCoach, setActiveCoach] = useState(null)

    useEffect(() => {
        Promise.all([
            coach.history(),
            coach.getActive()
        ]).then(([history, coachData]) => {
            setMessages(history.messages || [])
            setActiveCoach(coachData)
        })
    }, [])

    const handleSend = async (e) => {
        e.preventDefault()
        if (!input.trim() || sending) return

        setSending(true)
        const userMessage = input
        setInput('')

        setMessages(prev => [...prev, {
            id: Date.now(),
            content: userMessage,
            is_from_user: true,
            created_at: new Date().toISOString()
        }])

        try {
            const response = await coach.chat(userMessage)
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                content: response.message,
                is_from_user: false,
                created_at: new Date().toISOString()
            }])
        } catch (err) {
            console.error(err)
        }
        setSending(false)
    }

    return (
        <div className="page" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
            <div className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                    <div className="flex gap-2" style={{ alignItems: 'center' }}>
                        <span style={{ fontSize: '2rem' }}>{activeCoach?.icon || '🌟'}</span>
                        <div>
                            <h3>{activeCoach?.name || 'Tu Entrenador'}</h3>
                            <p className="text-secondary text-sm">En línea y listo para ayudarte</p>
                        </div>
                    </div>
                    <Link to="/settings" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                        Cambiar entrenador
                    </Link>
                </div>

                {/* Messages */}
                <div className="card" style={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    marginBottom: '1rem'
                }}>
                    {messages.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <span style={{ fontSize: '3rem' }}>{activeCoach?.icon || '🌟'}</span>
                            <p style={{ marginTop: '1rem' }}>¡Hola! Soy tu entrenador personal. ¿En qué puedo ayudarte hoy?</p>
                        </div>
                    ) : (
                        messages.map(msg => (
                            <div
                                key={msg.id}
                                style={{
                                    maxWidth: '80%',
                                    alignSelf: msg.is_from_user ? 'flex-end' : 'flex-start',
                                    background: msg.is_from_user ? 'var(--gradient-primary)' : 'var(--bg-tertiary)',
                                    padding: '1rem',
                                    borderRadius: 'var(--radius-lg)',
                                }}
                            >
                                {!msg.is_from_user && (
                                    <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                                        {activeCoach?.icon} {activeCoach?.name}
                                    </p>
                                )}
                                <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                                <p className="text-muted text-sm" style={{ marginTop: '0.5rem' }}>
                                    {new Date(msg.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="flex gap-1">
                    <input
                        type="text"
                        className="input"
                        placeholder="Escribe tu mensaje..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        disabled={sending}
                        style={{ flex: 1 }}
                    />
                    <button type="submit" className="btn btn-primary" disabled={sending}>
                        {sending ? '⏳' : '📨'}
                    </button>
                </form>
            </div>
        </div>
    )
}

// Routines Page
function Routines() {
    const [routineList, setRoutineList] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        routines.list().then(data => {
            setRoutineList(data.items || [])
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [])

    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

    if (loading) return <LoadingScreen />

    return (
        <div className="page">
            <div className="container">
                <div className="flex-between" style={{ marginBottom: '2rem' }}>
                    <h1>Mis Rutinas</h1>
                    <Link to="/routines/new" className="btn btn-primary">+ Nueva Rutina</Link>
                </div>

                {routineList.length > 0 ? (
                    <div className="grid gap-2">
                        {routineList.map(routine => (
                            <div key={routine.id} className="card">
                                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                                    <h3>{routine.name}</h3>
                                    <span className={`badge ${routine.is_active ? 'badge-success' : 'badge-warning'}`}>
                                        {routine.is_active ? 'Activa' : 'Inactiva'}
                                    </span>
                                </div>
                                <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                                    {dayNames.map((day, i) => {
                                        const hasDay = routine.days?.some(d => d.day_of_week === i)
                                        return (
                                            <span
                                                key={i}
                                                style={{
                                                    padding: '0.5rem 0.75rem',
                                                    borderRadius: 'var(--radius-md)',
                                                    background: hasDay ? 'var(--primary)' : 'var(--bg-tertiary)',
                                                    color: hasDay ? 'white' : 'var(--text-muted)',
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                {day}
                                            </span>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <span style={{ fontSize: '3rem' }}>📋</span>
                        <p className="text-secondary" style={{ marginTop: '1rem' }}>
                            No tienes rutinas todavía. ¡Crea una para organizar tu entrenamiento semanal!
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

// Settings Page
function Settings() {
    const { user, setUser } = useAuth()
    const [personalities, setPersonalities] = useState([])
    const [activeCoachId, setActiveCoachId] = useState(user?.active_coach_id)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        coach.listPersonalities().then(data => setPersonalities(data.items || []))
    }, [])

    const handleSelectCoach = async (id) => {
        setSaving(true)
        try {
            await coach.setActive(id)
            setActiveCoachId(id)
            setUser({ ...user, active_coach_id: id })
        } catch (err) {
            console.error(err)
        }
        setSaving(false)
    }

    return (
        <div className="page">
            <div className="container">
                <h1 style={{ marginBottom: '2rem' }}>Configuración</h1>

                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>👤 Perfil</h3>
                    <p><strong>Nombre:</strong> {user?.name}</p>
                    <p><strong>Email:</strong> {user?.email}</p>
                </div>

                <h3 style={{ marginBottom: '1rem' }}>🎭 Selecciona tu Entrenador</h3>
                <div className="grid grid-2 gap-2">
                    {personalities.map(p => (
                        <div
                            key={p.id}
                            className="card"
                            onClick={() => handleSelectCoach(p.id)}
                            style={{
                                cursor: 'pointer',
                                border: activeCoachId === p.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                                boxShadow: activeCoachId === p.id ? 'var(--shadow-glow)' : 'none'
                            }}
                        >
                            <div className="flex gap-2" style={{ alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '2.5rem' }}>{p.icon}</span>
                                <div>
                                    <h4>{p.name}</h4>
                                    <p className="text-secondary text-sm">{p.description}</p>
                                    {activeCoachId === p.id && (
                                        <span className="badge badge-primary" style={{ marginTop: '0.5rem' }}>Activo</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// Main App
function App() {
    const [notification, setNotification] = useState(null)
    const showNotification = (msg) => {
        setNotification(msg)
    }
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppContent
                    notification={notification}
                    setNotification={setNotification}
                    showNotification={showNotification}
                />
            </AuthProvider>
        </BrowserRouter>
    )
}

function AppContent({ notification, setNotification, showNotification }) {
    const { user, loading } = useAuth()

    if (loading) return <LoadingScreen />

    return (
        <>
            <NotificationToast
                message={notification}
                onClose={() => setNotification(null)}
            />
            {user && <Navbar />}
            <Routes>
                <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
                <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/activities" element={<ProtectedRoute><Activities /></ProtectedRoute>} />
                <Route path="/activities/:id" element={<ProtectedRoute><ActivityDetail /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                <Route path="/routines" element={<ProtectedRoute><Routines /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            </Routes>
        </>
    )
}

export default App
