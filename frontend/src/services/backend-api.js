// Browser-safe Mamasafe backend API client.
// MongoDB Atlas credentials must stay in backend/.env and should never be used in frontend code.

const API_BASE_URL =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
    window.location.port !== '5000'
        ? `${window.location.protocol}//${window.location.hostname}:5000/api`
        : '/api';

async function request(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        ...options
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(payload.error || `Request failed with status ${response.status}`);
    }
    return payload;
}

const backendApi = {
    health: () => request('/health'),
    createUser: (data) => request('/users', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    getUser: (id) => request(`/users/${encodeURIComponent(id)}`),
    savePregnancy: (data) => request('/pregnancy', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    getPregnancy: (userId) => request(`/pregnancy/${encodeURIComponent(userId)}`),
    saveBaby: (data) => request('/baby', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    getBaby: (userId) => request(`/baby/${encodeURIComponent(userId)}`),
    saveToddler: (data) => request('/toddler', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    getToddler: (userId) => request(`/toddler/${encodeURIComponent(userId)}`),
    saveFertility: (data) => request('/fertility', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    getFertility: (userId) => request(`/fertility/${encodeURIComponent(userId)}`),
    saveActivity: (data) => request('/activities', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    getActivities: (userId) => request(`/activities/${encodeURIComponent(userId)}`)
};

if (typeof window !== 'undefined') {
    window.backendApi = backendApi;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = backendApi;
}
