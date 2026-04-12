const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Configuration
const mongoConfig = {
    uri: 'mongodb+srv://ug2424887_db_user:ninjastorm@cluster0.ofrzq1d.mongodb.net/mamacare?retryWrites=true&w=majority&appName=Cluster0',
    dbName: 'mamacare'
};

let db;
let client;

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "'unsafe-hashes'"],
            scriptSrcAttr: ["'unsafe-inline'"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://www.wikidata.org", "https://wikidata.org"],
            mediaSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameSrc: ["'none'"],
        },
    },
}));

app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json()); // Parse JSON bodies

// Serve static files
app.use(express.static(path.join(__dirname, '.')));

// MongoDB Connection with persistent connection and auto-reconnect
async function connectToMongoDB(maxRetries = 5) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`MongoDB connection attempt ${attempt}/${maxRetries}...`);
            
            client = new MongoClient(mongoConfig.uri, {
                tls: true,
                tlsAllowInvalidCertificates: false,
                maxPoolSize: 20, // Increased pool size for better performance
                minPoolSize: 5,  // Minimum connections to maintain
                maxIdleTimeMS: 30000, // Keep connections alive longer
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
                connectTimeoutMS: 10000,
                heartbeatFrequencyMS: 10000, // Check connection health every 10 seconds
                retryWrites: true,
                retryReads: true,
                w: 'majority'
            });
            
            await client.connect();
            db = client.db(mongoConfig.dbName);
            
            // Set up connection monitoring
            client.on('connectionPoolCreated', (event) => {
                console.log('MongoDB connection pool created');
            });
            
            client.on('connectionCreated', (event) => {
                console.log('New MongoDB connection established');
            });
            
            client.on('connectionReady', (event) => {
                console.log('MongoDB connection ready');
            });
            
            client.on('connectionClosed', (event) => {
                console.log('MongoDB connection closed:', event.reason);
            });
            
            client.on('connectionPoolCleared', (event) => {
                console.log('MongoDB connection pool cleared, attempting reconnect...');
                setTimeout(() => {
                    if (!db) {
                        connectToMongoDB();
                    }
                }, 5000);
            });
            
            client.on('serverOpening', (event) => {
                console.log('MongoDB server connection opened');
            });
            
            client.on('serverClosed', (event) => {
                console.log('MongoDB server connection closed, attempting reconnect...');
                setTimeout(() => {
                    if (!db) {
                        connectToMongoDB();
                    }
                }, 5000);
            });
            
            client.on('serverHeartbeatFailed', (event) => {
                console.warn('MongoDB server heartbeat failed:', event.failure.message);
            });
            
            console.log('Connected to MongoDB Atlas with persistent connection');
            return true;
            
        } catch (error) {
            console.error(`MongoDB connection attempt ${attempt} failed:`, error.message);
            if (attempt === maxRetries) {
                console.error('All MongoDB connection attempts failed');
                // Continue with app startup even if DB fails, will retry in background
                setTimeout(() => connectToMongoDB(), 30000); // Retry every 30 seconds
                return false;
            }
            // Wait before retrying (exponential backoff)
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    return false;
}

// Function to check database connection health
async function checkDBHealth() {
    try {
        if (!db || !client) {
            console.warn('Database not connected, attempting reconnect...');
            return await connectToMongoDB();
        }
        
        // Ping the database to check connection
        await db.admin().ping();
        return true;
    } catch (error) {
        console.warn('Database health check failed:', error.message);
        console.log('Attempting to reconnect to MongoDB...');
        return await connectToMongoDB();
    }
}

// Periodic health check
setInterval(async () => {
    await checkDBHealth();
}, 60000); // Check every minute

// Middleware to check database connection
function checkDBConnection(req, res, next) {
    if (!db) {
        return res.status(500).json({ error: 'Database not connected' });
    }
    next();
}

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', connected: !!db, timestamp: new Date().toISOString() });
});

// Wikidata API proxy endpoint
app.get('/api/wikidata', async (req, res) => {
    try {
        const { search, language = 'en', uselang = 'en', format = 'json', limit = '40' } = req.query;
        
        if (!search) {
            return res.status(400).json({ error: 'Search parameter is required' });
        }
        
        const wikidataUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(search)}&language=${language}&uselang=${uselang}&format=${format}&limit=${limit}`;
        console.log('Proxy fetching:', wikidataUrl);
        
        const response = await fetch(wikidataUrl, {
            headers: {
                'User-Agent': 'MamaCare-App/1.0',
                'Accept': 'application/json'
            }
        });
        
        console.log('Wikidata response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Wikidata API error response:', errorText);
            return res.status(response.status).json({ 
                error: 'Wikidata API error', 
                status: response.status,
                details: errorText 
            });
        }
        
        const data = await response.json();
        console.log('Wikidata data received successfully');
        res.json(data);
    } catch (error) {
        console.error('Wikidata API proxy error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch data from Wikidata', 
            details: error.message 
        });
    }
});

// Users API
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

// Pregnancy Data API
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

// Baby Data API
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

// Toddler Data API
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

// Milestones API
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

// Appointments API
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

// Nutrition API
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

// Sleep API
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

// Activities API
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

// Catch-all handler - serve index.html for SPA routing
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server
async function startServer() {
    // Start MongoDB connection in background
    connectToMongoDB().then(connected => {
        if (connected) {
            console.log('MongoDB connected successfully on startup');
        } else {
            console.log('MongoDB not connected on startup, will retry in background');
        }
    });
    
    // Start server regardless of MongoDB connection status
    app.listen(PORT, () => {
        console.log(`\n`);
        console.log(`===================================`);
        console.log(`    MamaCare Server Running`);
        console.log(`===================================`);
        console.log(`Local:   http://localhost:${PORT}`);
        console.log(`Network: http://localhost:${PORT}`);
        console.log(`MongoDB: ${db ? 'Connected to Atlas' : 'Connecting in background...'}`);
        console.log(`===================================`);
        console.log(`Press Ctrl+C to stop server`);
        console.log(`\n`);
    });
}

startServer();

module.exports = app;
