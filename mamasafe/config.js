// MongoDB Atlas Configuration
const mongoConfig = {
    // Connection URI - Replace with your actual connection string
    uri: 'mongodb+srv://ug2424887_db_user:ninjastorm@cluster0.ofrzq1d.mongodb.net/mamacare?retryWrites=true&w=majority&appName=Cluster0',
    
    // Database name
    dbName: 'mamacare',
    
    // Collections
    collections: {
        users: 'users',
        pregnancyData: 'pregnancy_data',
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
