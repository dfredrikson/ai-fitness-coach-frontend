/**
 * AI Fitness Coach - API Service
 */

const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = import.meta.env.VITE_API_URL + '/api/v1';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// API request helper
async function request(endpoint, options = {}) {
    const token = getToken();

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
        ...options,
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Error desconocido' }));
        throw new Error(error.detail || 'Error en la solicitud');
    }

    return response.json();
}

// Auth
export const auth = {
    register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request('/auth/me'),
};

// Users
export const users = {
    update: (data) => request('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
    delete: () => request('/users/me', { method: 'DELETE' }),
};

// Strava
export const strava = {
    getConnectUrl: () => request('/strava/connect'),
    disconnect: () => request('/strava/disconnect', { method: 'POST' }),
    status: () => request('/strava/status'),
    sync: (limit = 30) => request(`/strava/sync?limit=${limit}`, { method: 'POST' }),
};

// Activities
export const activities = {
    list: (page = 1, pageSize = 20) => request(`/activities?page=${page}&page_size=${pageSize}`),
    get: (id) => request(`/activities/${id}`),
    analyze: (id, force = false) => request(`/activities/${id}/analyze?force=${force}`, { method: 'POST' }),
};

// Coach
export const coach = {
    listPersonalities: () => request('/coach/personalities'),
    getActive: () => request('/coach/active'),
    setActive: (id) => request(`/coach/active/${id}`, { method: 'PUT' }),
    chat: (content) => request('/coach/chat', { method: 'POST', body: JSON.stringify({ content }) }),
    history: (limit = 50) => request(`/coach/chat/history?limit=${limit}`),
};

// Routines
export const routines = {
    list: () => request('/routines'),
    create: (data) => request('/routines', { method: 'POST', body: JSON.stringify(data) }),
    get: (id) => request(`/routines/${id}`),
    update: (id, data) => request(`/routines/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/routines/${id}`, { method: 'DELETE' }),
    compliance: (id) => request(`/routines/${id}/compliance`),
};

// Notifications
export const notifications = {
    list: () => request('/notifications'),
    markAsRead: (id) => request(`/notifications/${id}/read`, { method: 'POST' }),
};

export default {
    auth,
    users,
    strava,
    activities,
    coach,
    routines,
    notifications,
};
