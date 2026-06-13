// MongoDB Atlas Service for MamaCare Application
class MongoDBService {
    constructor() {
        this.client = null;
        this.db = null;
        this.isConnected = false;
        this.config = window.mongoConfig || {};
    }

    // Connect to MongoDB Atlas
    async connect() {
        try {
            // For browser-based applications, we need to use MongoDB Data API or a backend service
            // This is a placeholder implementation that would work with a backend API
            
            console.log('Connecting to MongoDB Atlas...');
            
            // In a real browser application, you would:
            // 1. Use MongoDB Data API
            // 2. Create a REST API backend
            // 3. Use a service like MongoDB Realm
            
            // For now, we'll simulate connection with localStorage as fallback
            this.isConnected = true;
            console.log('Connected to MongoDB Atlas (simulated)');
            
            return true;
        } catch (error) {
            console.error('MongoDB connection error:', error);
            this.isConnected = false;
            return false;
        }
    }

    // Generic save method
    async save(collection, data) {
        try {
            if (!this.isConnected) {
                await this.connect();
            }

            // Add timestamp
            data.timestamp = new Date().toISOString();
            data.id = this.generateId();

            // In real implementation, this would save to MongoDB
            // For now, save to localStorage as fallback
            const key = `${collection}_${data.id}`;
            localStorage.setItem(key, JSON.stringify(data));
            
            console.log(`Saved to ${collection}:`, data);
            return data;
        } catch (error) {
            console.error('Save error:', error);
            throw error;
        }
    }

    // Generic get method
    async get(collection, query = {}) {
        try {
            if (!this.isConnected) {
                await this.connect();
            }

            // In real implementation, this would query MongoDB
            // For now, get from localStorage
            const results = [];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(collection + '_')) {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (this.matchesQuery(data, query)) {
                        results.push(data);
                    }
                }
            }

            console.log(`Retrieved from ${collection}:`, results);
            return results;
        } catch (error) {
            console.error('Get error:', error);
            throw error;
        }
    }

    // Update method
    async update(collection, id, updateData) {
        try {
            if (!this.isConnected) {
                await this.connect();
            }

            const key = `${collection}_${id}`;
            const existingData = localStorage.getItem(key);
            
            if (existingData) {
                const data = JSON.parse(existingData);
                Object.assign(data, updateData, {
                    updatedAt: new Date().toISOString()
                });
                
                localStorage.setItem(key, JSON.stringify(data));
                console.log(`Updated in ${collection}:`, data);
                return data;
            }
            
            throw new Error('Document not found');
        } catch (error) {
            console.error('Update error:', error);
            throw error;
        }
    }

    // Delete method
    async delete(collection, id) {
        try {
            if (!this.isConnected) {
                await this.connect();
            }

            const key = `${collection}_${id}`;
            localStorage.removeItem(key);
            
            console.log(`Deleted from ${collection}:`, id);
            return true;
        } catch (error) {
            console.error('Delete error:', error);
            throw error;
        }
    }

    // Helper methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    matchesQuery(data, query) {
        if (Object.keys(query).length === 0) return true;
        
        for (const [key, value] of Object.entries(query)) {
            if (data[key] !== value) return false;
        }
        
        return true;
    }

    // Specific methods for MamaCare data

    // Save user data
    async saveUser(userData) {
        return this.save('users', userData);
    }

    // Save pregnancy data
    async savePregnancyData(data) {
        return this.save('pregnancyData', data);
    }

    // Save milestones
    async saveMilestone(data) {
        return this.save('milestones', data);
    }

    // Save appointments
    async saveAppointment(data) {
        return this.save('appointments', data);
    }

    // Save nutrition data
    async saveNutritionData(data) {
        return this.save('nutrition', data);
    }

    // Save sleep data
    async saveSleepData(data) {
        return this.save('sleep', data);
    }

    // Save activity data
    async saveActivityData(data) {
        return this.save('activities', data);
    }

    // Get user data
    async getUser(userId) {
        const users = await this.get('users', { id: userId });
        return users[0] || null;
    }

    // Get pregnancy data for user
    async getPregnancyData(userId) {
        return this.get('pregnancyData', { userId });
    }

    // Get milestones for user
    async getMilestones(userId) {
        return this.get('milestones', { userId });
    }

    // Get appointments for user
    async getAppointments(userId) {
        return this.get('appointments', { userId });
    }
}

// Create global instance
window.mongoDBService = new MongoDBService();

// Auto-connect on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await window.mongoDBService.connect();
        console.log('MongoDB service initialized');
    } catch (error) {
        console.error('Failed to initialize MongoDB service:', error);
    }
});
