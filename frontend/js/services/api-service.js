// API Service - Handles all API calls and data fetching

if (typeof window.ApiService === 'undefined') {
class ApiService {
    constructor() {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        this.baseUrl = window.MAMASAFE_API_BASE
            ? window.MAMASAFE_API_BASE.replace(/\/$/, '')
            : isLocal
                ? 'http://localhost:5000/api'
                : `${window.location.origin}/api`;
        this.isOnline = navigator.onLine;
    }

    // Generic HTTP methods
    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            };

            console.log(`[API] Request: ${options.method || 'GET'} ${url}`);
            
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log(`[API] Response:`, data);
            
            return data;
        } catch (error) {
            console.error(`[API] Error:`, error);
            throw error;
        }
    }

    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // Baby names API
    async searchBabyNames(query, options = {}) {
        const params = {
            search: query,
            limit: options.limit || 20,
            gender: options.gender || 'all',
            origin: options.origin || 'all'
        };
        
        return this.get('/baby-names', params);
    }

    async getBabyNameDetails(nameId) {
        return this.get(`/baby-names/${nameId}`);
    }

    async saveBabyName(nameData) {
        return this.post('/baby-names/save', nameData);
    }

    async getSavedBabyNames(userId) {
        return this.get(`/baby-names/saved/${userId}`);
    }

    // Pregnancy API
    async savePregnancyData(data) {
        return this.post('/pregnancy', data);
    }

    async getPregnancyData(userId) {
        return this.get(`/pregnancy/${userId}`);
    }

    // Milestone API
    async trackMilestone(milestoneData) {
        return this.post('/milestones', milestoneData);
    }

    async getMilestoneHistory(userId) {
        return this.get(`/milestones/${userId}`);
    }

    // Activities API
    async saveActivity(data) {
        return this.post('/activities', data);
    }

    async getActivities(userId) {
        return this.get(`/activities/${userId}`);
    }

    // Appointments API
    async saveAppointment(data) {
        return this.post('/appointments', data);
    }

    async getAppointments(userId) {
        return this.get(`/appointments/${userId}`);
    }

    // Sleep tracker API
    async saveSleepData(data) {
        return this.post('/sleep', data);
    }

    async getSleepHistory(userId) {
        return this.get(`/sleep/${userId}`);
    }

    // Baby tracker API
    async saveBabyData(data) {
        return this.post('/baby', data);
    }

    async getBabyData(userId) {
        return this.get(`/baby/${userId}`);
    }

    // Nutrition API
    async saveNutritionData(data) {
        return this.post('/nutrition', data);
    }

    async getNutritionData(userId) {
        return this.get(`/nutrition/${userId}`);
    }



    // Toddler tracker API
    async saveToddlerData(data) {
        return this.post('/toddler', data);
    }

    async getToddlerData(userId) {
        return this.get(`/toddler/${userId}`);
    }



    // User authentication API
    async login(credentials) {
        return this.post('/auth/login', credentials);
    }

    async signup(userData) {
        return this.post('/auth/signup', userData);
    }

    async logout() {
        return this.post('/auth/logout');
    }

    async getUserProfile(userId) {
        return this.get(`/auth/profile/${userId}`);
    }

    async updateUserProfile(userId, profileData) {
        return this.put(`/auth/profile/${userId}`, profileData);
    }

    // Utility methods
    isConnectionAvailable() {
        return this.isOnline && navigator.onLine;
    }

    async checkConnection() {
        try {
            await this.get('/health');
            this.isOnline = true;
            return true;
        } catch (error) {
            this.isOnline = false;
            return false;
        }
    }

    // Offline support
    async cacheData(key, data) {
        try {
            localStorage.setItem(`api_cache_${key}`, JSON.stringify({
                data,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.error('Failed to cache data:', error);
        }
    }

    async getCachedData(key, maxAge = 3600000) { // 1 hour default
        try {
            const cached = localStorage.getItem(`api_cache_${key}`);
            if (!cached) return null;

            const { data, timestamp } = JSON.parse(cached);
            const age = Date.now() - timestamp;

            if (age > maxAge) {
                localStorage.removeItem(`api_cache_${key}`);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Failed to get cached data:', error);
            return null;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiService;
}

// Make available globally
window.ApiService = ApiService;
window.apiService = window.apiService || new ApiService();
} // Close the conditional statement
