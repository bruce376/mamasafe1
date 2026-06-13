// Frontend API Service for MamaCare Application
class ApiService {
    constructor() {
        this.baseUrl = window.location.origin + '/api';
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

            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }

    async get(endpoint) {
        return this.request(endpoint);
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    // Health check
    async checkHealth() {
        try {
            const response = await this.get('/health');
            return response;
        } catch (error) {
            console.error('Health check failed:', error);
            return { status: 'ERROR', connected: false };
        }
    }

    // User methods
    async saveUser(userData) {
        return this.post('/users', userData);
    }

    async getUser(userId) {
        return this.get(`/users/${userId}`);
    }

    // Pregnancy methods
    async savePregnancyData(data) {
        return this.post('/pregnancy', data);
    }

    async getPregnancyData(userId) {
        return this.get(`/pregnancy/${userId}`);
    }

    // Milestones methods
    async saveMilestone(data) {
        return this.post('/milestones', data);
    }

    async getMilestones(userId) {
        return this.get(`/milestones/${userId}`);
    }

    // Appointments methods
    async saveAppointment(data) {
        return this.post('/appointments', data);
    }

    async getAppointments(userId) {
        return this.get(`/appointments/${userId}`);
    }

    // Nutrition methods
    async saveNutritionData(data) {
        return this.post('/nutrition', data);
    }

    async getNutritionData(userId) {
        return this.get(`/nutrition/${userId}`);
    }

    // Sleep methods
    async saveSleepData(data) {
        return this.post('/sleep', data);
    }

    async getSleepData(userId) {
        return this.get(`/sleep/${userId}`);
    }

    // Activities methods
    async saveActivityData(data) {
        return this.post('/activities', data);
    }

    async getActivityData(userId) {
        return this.get(`/activities/${userId}`);
    }

    // Sync with localStorage (fallback when offline)
    syncWithLocalStorage(collection, data) {
        try {
            const key = `${collection}_${data.id || Date.now()}`;
            localStorage.setItem(key, JSON.stringify({
                ...data,
                synced: false,
                timestamp: new Date().toISOString()
            }));
            console.log(`Data saved to localStorage for later sync: ${collection}`);
        } catch (error) {
            console.error('localStorage sync error:', error);
        }
    }

    // Get unsynced data from localStorage
    getUnsyncedData() {
        const unsynced = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes('_')) {
                try {
                    const item = localStorage.getItem(key);
                    if (!item) continue; // Skip null/undefined items
                    
                    const data = JSON.parse(item);
                    if (data && typeof data === 'object' && data.synced === false) {
                        const collection = key.split('_')[0];
                        if (!unsynced[collection]) unsynced[collection] = [];
                        unsynced[collection].push(data);
                    }
                } catch (error) {
                    console.warn(`Skipping invalid localStorage item ${key}:`, error);
                    // Remove invalid item to prevent future errors
                    try {
                        localStorage.removeItem(key);
                    } catch (removeError) {
                        console.warn(`Could not remove invalid item ${key}:`, removeError);
                    }
                }
            }
        }
        return unsynced;
    }

    // Sync unsynced data when back online
    async syncUnsyncedData() {
        try {
            const unsynced = this.getUnsyncedData();
            let syncedCount = 0;

            for (const [collection, items] of Object.entries(unsynced)) {
                for (const item of items) {
                    try {
                        await this.post(`/${collection}`, item);
                        // Mark as synced - find the key by searching localStorage
                        const itemId = item.id || item.timestamp || Date.now().toString();
                        const key = `${collection}_${itemId}`;
                        const updatedItem = { ...item, synced: true };
                        localStorage.setItem(key, JSON.stringify(updatedItem));
                        syncedCount++;
                    } catch (error) {
                        console.error(`Failed to sync ${collection} item:`, error);
                    }
                }
            }

            console.log(`Synced ${syncedCount} items to MongoDB`);
            return syncedCount;
        } catch (error) {
            console.error('Sync error:', error);
            return 0;
        }
    }

    // Enhanced save method with offline support
    async saveWithFallback(collection, data) {
        try {
            if (this.isOnline) {
                const result = await this.post(`/${collection}`, data);
                return result;
            } else {
                // Save to localStorage when offline
                this.syncWithLocalStorage(collection, data);
                return { ...data, savedOffline: true };
            }
        } catch (error) {
            console.error('Save failed, using localStorage fallback:', error);
            this.syncWithLocalStorage(collection, data);
            return { ...data, savedOffline: true };
        }
    }

    // Monitor online/offline status
    setupNetworkMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('Back online, syncing data...');
            this.syncUnsyncedData();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('Gone offline, using localStorage fallback');
        });
    }
}

// Create global instance
window.apiService = new ApiService();

// Setup network monitoring
document.addEventListener('DOMContentLoaded', () => {
    if (window.apiService && typeof window.apiService.setupNetworkMonitoring === 'function') {
        window.apiService.setupNetworkMonitoring();
        
        // Check MongoDB connection on load
        window.apiService.checkHealth().then(health => {
            console.log('MongoDB Health:', health);
            if (health && health.connected) {
                // Sync any unsynced data
                window.apiService.syncUnsyncedData().catch(error => {
                    console.warn('Initial sync failed:', error);
                });
            }
        }).catch(error => {
            console.warn('Health check failed:', error);
        });
    } else {
        console.warn('API service not properly initialized');
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiService;
}
