// MongoDB Atlas Configuration
const mongoConfig = {
    // Connection URI comes from backend/.env. Never put Atlas passwords in frontend code.
    uri: typeof process !== 'undefined' ? process.env.MONGODB_URI : '',
    
    // Database name
    dbName: typeof process !== 'undefined' ? (process.env.MONGODB_DB_NAME || 'mamasafe') : 'mamasafe',
    
    // Collections
    collections: {
        users: 'users',
        pregnancyData: 'pregnancy_data',
        babyData: 'baby_data',
        toddlerData: 'toddler_data',
        milestones: 'milestones',
        appointments: 'appointments',
        nutrition: 'nutrition',
        sleep: 'sleep',
        activities: 'activities',
        progress: 'progress'
    },
    
    // Connection options
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferMaxEntries: 0,
        bufferCommands: false,
        retryWrites: true,
        w: 'majority'
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = mongoConfig;
} else {
    window.mongoConfig = mongoConfig;
}
