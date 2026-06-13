// Backend API Service for MongoDB Atlas Connection
// This would typically run on Node.js server, but here's the structure

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

// Configuration
const config = {
    mongo: {
        uri: 'mongodb+srv://ug2424887_db_user:ninjastorm@cluster0.ofrzq1d.mongodb.net/mamacare?retryWrites=true&w=majority&appName=Cluster0',
        dbName: 'mamacare'
    },
    port: process.env.PORT || 3001
};

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
let db;

async function connectToMongoDB() {
    try {
        const client = new MongoClient(config.mongo.uri);
        await client.connect();
        db = client.db(config.mongo.dbName);
        console.log('Connected to MongoDB Atlas');
        return true;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        return false;
    }
}

// Middleware to check database connection
function checkDBConnection(req, res, next) {
    if (!db) {
        return res.status(500).json({ error: 'Database not connected' });
    }
    next();
}

// API Routes

// Users
app.post('/api/users', checkDBConnection, async (req, res) => {
    try {
        const userData = { ...req.body, createdAt: new Date() };
        const result = await db.collection('users').insertOne(userData);
        res.json({ ...userData, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/users/:id', checkDBConnection, async (req, res) => {
    try {
        const user = await db.collection('users').findOne({ _id: new ObjectId(req.params.id) });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Pregnancy Data
app.post('/api/pregnancy', checkDBConnection, async (req, res) => {
    try {
        const data = { ...req.body, createdAt: new Date() };
        const result = await db.collection('pregnancy_data').insertOne(data);
        res.json({ ...data, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/pregnancy/:userId', checkDBConnection, async (req, res) => {
    try {
        const data = await db.collection('pregnancy_data').find({ userId: req.params.userId }).toArray();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Baby Data
app.post('/api/baby', checkDBConnection, async (req, res) => {
    try {
        const data = { ...req.body, createdAt: new Date() };
        const result = await db.collection('baby_data').insertOne(data);
        res.json({ ...data, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/baby/:userId', checkDBConnection, async (req, res) => {
    try {
        const data = await db.collection('baby_data').find({ userId: req.params.userId }).toArray();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Toddler Data
app.post('/api/toddler', checkDBConnection, async (req, res) => {
    try {
        const data = { ...req.body, createdAt: new Date() };
        const result = await db.collection('toddler_data').insertOne(data);
        res.json({ ...data, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/toddler/:userId', checkDBConnection, async (req, res) => {
    try {
        const data = await db.collection('toddler_data').find({ userId: req.params.userId }).toArray();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Milestones
app.post('/api/milestones', checkDBConnection, async (req, res) => {
    try {
        const data = { ...req.body, createdAt: new Date() };
        const result = await db.collection('milestones').insertOne(data);
        res.json({ ...data, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/milestones/:userId', checkDBConnection, async (req, res) => {
    try {
        const data = await db.collection('milestones').find({ userId: req.params.userId }).toArray();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Appointments
app.post('/api/appointments', checkDBConnection, async (req, res) => {
    try {
        const data = { ...req.body, createdAt: new Date() };
        const result = await db.collection('appointments').insertOne(data);
        res.json({ ...data, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/appointments/:userId', checkDBConnection, async (req, res) => {
    try {
        const data = await db.collection('appointments').find({ userId: req.params.userId }).toArray();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Nutrition Data
app.post('/api/nutrition', checkDBConnection, async (req, res) => {
    try {
        const data = { ...req.body, createdAt: new Date() };
        const result = await db.collection('nutrition').insertOne(data);
        res.json({ ...data, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/nutrition/:userId', checkDBConnection, async (req, res) => {
    try {
        const data = await db.collection('nutrition').find({ userId: req.params.userId }).toArray();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Sleep Data
app.post('/api/sleep', checkDBConnection, async (req, res) => {
    try {
        const data = { ...req.body, createdAt: new Date() };
        const result = await db.collection('sleep').insertOne(data);
        res.json({ ...data, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/sleep/:userId', checkDBConnection, async (req, res) => {
    try {
        const data = await db.collection('sleep').find({ userId: req.params.userId }).toArray();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Activity Data
app.post('/api/activities', checkDBConnection, async (req, res) => {
    try {
        const data = { ...req.body, createdAt: new Date() };
        const result = await db.collection('activities').insertOne(data);
        res.json({ ...data, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/activities/:userId', checkDBConnection, async (req, res) => {
    try {
        const data = await db.collection('activities').find({ userId: req.params.userId }).toArray();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update operations
app.put('/api/:collection/:id', checkDBConnection, async (req, res) => {
    try {
        const { collection, id } = req.params;
        const updateData = { ...req.body, updatedAt: new Date() };
        
        const result = await db.collection(collection).updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }
        
        res.json({ success: true, modifiedCount: result.modifiedCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete operations
app.delete('/api/:collection/:id', checkDBConnection, async (req, res) => {
    try {
        const { collection, id } = req.params;
        
        const result = await db.collection(collection).deleteOne({ _id: new ObjectId(id) });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }
        
        res.json({ success: true, deletedCount: result.deletedCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        connected: !!db,
        timestamp: new Date().toISOString()
    });
});

// Start server
async function startServer() {
    const connected = await connectToMongoDB();
    if (connected) {
        app.listen(config.port, () => {
            console.log(`Server running on port ${config.port}`);
        });
    } else {
        console.error('Failed to start server - MongoDB not connected');
    }
}

// Export for testing
module.exports = { app, startServer };

// Start server if this file is run directly
if (require.main === module) {
    startServer();
}
