const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

// Import auth middleware
const { configureSession, configureGoogleStrategy, isAuthenticated, hasRole, passport } = require('./middleware/auth');

// Import local auth for development
const { configureLocalSession, authenticateLocal, authenticateAny, setupLocalAuthRoutes } = require('./middleware/localAuth');

const app = express();
const PORT = process.env.PORT || 3000;
const defaultCorsOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5000',
    'https://mamasafe-95d58.web.app',
    'https://mamasafe-95d58.firebaseapp.com'
];
const corsOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
const allowedCorsOrigins = [...new Set([...defaultCorsOrigins, ...corsOrigins])];

// MongoDB Configuration
const mongoConfig = {
    developmentMode: process.env.MONGODB_DEV_MODE === 'true',
    // Primary MongoDB Atlas connection. Keep this in backend/.env only.
    uri: process.env.MONGODB_URI || '',
    dbName: process.env.MONGODB_DB_NAME || 'mamasafe',
    localUri: process.env.MONGODB_LOCAL_URI || 'mongodb://localhost:27017/mamasafe',
    allowLocalFallback: process.env.MONGODB_ALLOW_LOCAL_FALLBACK === 'true'
};

let db;
let client;
let useInMemoryDB = false;
let activeMongoUriLabel = 'not-connected';

// In-memory database fallback
const inMemoryDB = {
    users: [],
    appointments: [],
    analytics: [],
    activities: []
};

function createInMemoryDatabase() {
    return {
        collection: (name) => ({
            insertOne: (doc) => {
                if (!inMemoryDB[name]) inMemoryDB[name] = [];
                const id = Date.now().toString();
                doc._id = id;
                inMemoryDB[name].push(doc);
                return { insertedId: id };
            },
            find: (query = {}) => {
                if (!inMemoryDB[name]) return { toArray: () => [] };
                const results = inMemoryDB[name].filter(item => {
                    if (query._id) return item._id === query._id;
                    if (query.userId) return item.userId === query.userId;
                    return true;
                });
                return {
                    sort: () => ({ limit: () => ({ toArray: () => results }) }),
                    limit: () => ({ toArray: () => results }),
                    toArray: () => results
                };
            },
            findOne: (query = {}) => {
                if (!inMemoryDB[name]) return null;
                return inMemoryDB[name].find(item => {
                    if (query._id) return item._id === query._id;
                    if (query.id) return item.id === query.id;
                    if (query.userId) return item.userId === query.userId;
                    return true;
                }) || null;
            },
            updateOne: (query = {}, update = {}) => {
                if (!inMemoryDB[name]) return { modifiedCount: 0 };
                const index = inMemoryDB[name].findIndex(item =>
                    query._id ? item._id === query._id : query.id ? item.id === query.id : true
                );
                if (index !== -1) {
                    inMemoryDB[name][index] = { ...inMemoryDB[name][index], ...(update.$set || {}) };
                    return { modifiedCount: 1 };
                }
                return { modifiedCount: 0 };
            },
            deleteOne: (query = {}) => {
                if (!inMemoryDB[name]) return { deletedCount: 0 };
                const index = inMemoryDB[name].findIndex(item =>
                    query._id ? item._id === query._id : true
                );
                if (index !== -1) {
                    inMemoryDB[name].splice(index, 1);
                    return { deletedCount: 1 };
                }
                return { deletedCount: 0 };
            },
            deleteMany: (query = {}) => {
                if (!inMemoryDB[name]) return { deletedCount: 0 };
                const originalLength = inMemoryDB[name].length;
                inMemoryDB[name] = inMemoryDB[name].filter(item =>
                    query.userId ? item.userId !== query.userId : false
                );
                return { deletedCount: originalLength - inMemoryDB[name].length };
            }
        }),
        admin: () => ({ ping: async () => true })
    };
}

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
            connectSrc: ["'self'", "http://localhost:5000", "http://127.0.0.1:5000", "https://mamasafe-95d58.web.app", "https://mamasafe-95d58.firebaseapp.com", "https://www.wikidata.org", "https://wikidata.org"],
            mediaSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameSrc: ["'none'"],
        },
    },
}));

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedCorsOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

// CSRF token generation
const crypto = require('crypto');
app.use((req, res, next) => {
    if (!req.session) return next();
    if (!req.session.csrfToken) {
        req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    }
    res.locals.csrfToken = req.session.csrfToken;
    next();
});

// CSRF validation for state-changing requests
function validateCSRF(req, res, next) {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    if (!token || token !== req.session.csrfToken) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
    }
    next();
}

// Sanitize MongoDB query input to prevent NoSQL injection
function sanitizeInput(input) {
    if (typeof input === 'object' && input !== null) {
        for (const key of Object.keys(input)) {
            if (key.startsWith('$')) delete input[key];
            else sanitizeInput(input[key]);
        }
    }
    return input;
}

app.use((req, res, next) => {
    if (req.body) req.body = sanitizeInput(req.body);
    next();
});
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '15mb' })); // Parse JSON bodies, including chatbot image uploads

// Configure session and authentication
configureLocalSession(app);
const googleOAuthEnabled = configureGoogleStrategy();
setupLocalAuthRoutes(app);

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// MongoDB Connection with persistent connection and auto-reconnect
async function connectToMongoDB(maxRetries = 5) {
    // If in-memory database is already active, don't retry
    if (useInMemoryDB) {
        console.log('In-memory database already active, skipping MongoDB connection attempts');
        return true;
    }
    
    // In development mode, use in-memory database immediately
    if (mongoConfig.developmentMode) {
        console.log('Development mode detected, using in-memory database...');
        useInMemoryDB = true;
        activeMongoUriLabel = 'in-memory';
        
        // Create mock database interface
        db = {
            collection: (name) => ({
                insertOne: (doc) => {
                    if (!inMemoryDB[name]) inMemoryDB[name] = [];
                    const id = Date.now().toString();
                    doc._id = id;
                    inMemoryDB[name].push(doc);
                    return { insertedId: id };
                },
                find: (query) => {
                    if (!inMemoryDB[name]) return { toArray: () => [] };
                    const results = inMemoryDB[name].filter(item => {
                        if (query._id) return item._id === query._id;
                        return true;
                    });
                    return { toArray: () => results };
                },
                updateOne: (query, update) => {
                    if (!inMemoryDB[name]) return { modifiedCount: 0 };
                    const index = inMemoryDB[name].findIndex(item => 
                        query._id ? item._id === query._id : true
                    );
                    if (index !== -1) {
                        inMemoryDB[name][index] = { ...inMemoryDB[name][index], ...update.$set };
                        return { modifiedCount: 1 };
                    }
                    return { modifiedCount: 0 };
                },
                deleteOne: (query) => {
                    if (!inMemoryDB[name]) return { deletedCount: 0 };
                    const index = inMemoryDB[name].findIndex(item => 
                        query._id ? item._id === query._id : true
                    );
                    if (index !== -1) {
                        inMemoryDB[name].splice(index, 1);
                        return { deletedCount: 1 };
                    }
                    return { deletedCount: 0 };
                }
            })
        };
        
        console.log('In-memory database initialized successfully for development');
        return true;
    }
    
    const urisToTry = [
        mongoConfig.uri,
        ...(mongoConfig.allowLocalFallback ? [mongoConfig.localUri] : [])
    ].filter(Boolean);

    if (!urisToTry.length) {
        console.error('MONGODB_URI is not configured. Add your MongoDB Atlas URI to backend/.env.');
        useInMemoryDB = true;
        activeMongoUriLabel = 'in-memory';
        db = createInMemoryDatabase();
        return true;
    }
    
    for (let uriIndex = 0; uriIndex < urisToTry.length; uriIndex++) {
        const currentUri = urisToTry[uriIndex];
        const uriLabel = currentUri.includes('mongodb+srv') || currentUri.includes('mongodb.net') ? 'MongoDB Atlas' : 'local MongoDB';
        console.log(`Trying ${uriLabel} URI ${uriIndex + 1}/${urisToTry.length}...`);
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`MongoDB connection attempt ${attempt}/${maxRetries} for URI ${uriIndex + 1}...`);
                
                // Use default connection options for MongoDB Atlas
                let connectionOptions = {};
                
                // Add custom options for MongoDB Atlas to handle timeouts
                if (currentUri.includes('mongodb.net') || currentUri.includes('mongodb+srv')) {
                    connectionOptions = {
                        maxPoolSize: 10,
                        minPoolSize: 2,
                        maxIdleTimeMS: 60000,
                        serverSelectionTimeoutMS: 30000,
                        socketTimeoutMS: 60000,
                        connectTimeoutMS: 30000,
                        heartbeatFrequencyMS: 30000,
                        retryWrites: true,
                        retryReads: true,
                        w: 'majority'
                    };
                }
                
                // Only add custom options for local MongoDB
                if (currentUri.includes('localhost')) {
                    connectionOptions = {
                        maxPoolSize: 20,
                        minPoolSize: 5,
                        maxIdleTimeMS: 30000,
                        serverSelectionTimeoutMS: 10000,
                        socketTimeoutMS: 45000,
                        connectTimeoutMS: 10000,
                        heartbeatFrequencyMS: 10000,
                        retryWrites: true,
                        retryReads: true,
                        w: 'majority',
                        tls: false
                    };
                }
                
                client = new MongoClient(currentUri, connectionOptions);
                
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
                        if (!db && !useInMemoryDB) {
                            connectToMongoDB(2); // Reduced retry count for reconnection
                        }
                    }, 10000); // Increased delay to 10 seconds
                });
                
                client.on('serverOpening', (event) => {
                    console.log('MongoDB server connection opened');
                });
                
                client.on('serverClosed', (event) => {
                    console.log('MongoDB server connection closed, attempting reconnect...');
                    setTimeout(() => {
                        if (!db && !useInMemoryDB) {
                            connectToMongoDB(2); // Reduced retry count for reconnection
                        }
                    }, 10000); // Increased delay to 10 seconds
                });
                
                client.on('serverHeartbeatFailed', (event) => {
                    // Reduce logging noise for heartbeat failures
                    console.warn('MongoDB server heartbeat failed (will retry automatically)');
                });
                
                activeMongoUriLabel = uriLabel;
                await ensureDatabaseIndexes();
                console.log(`Connected to ${uriLabel} database "${mongoConfig.dbName}"`);
                return true;
                
            } catch (error) {
                console.error(`MongoDB connection attempt ${attempt} failed for URI ${uriIndex + 1}:`, error.message);
                if (attempt === maxRetries) {
                    console.error(`All attempts failed for URI ${uriIndex + 1}`);
                    break; // Move to next URI
                }
                // Wait before retrying (exponential backoff)
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    console.error('All MongoDB connection attempts failed');
    console.log('Falling back to in-memory database for development...');
    useInMemoryDB = true;
    activeMongoUriLabel = 'in-memory';
    
    // Create mock database interface
    db = {
        collection: (name) => ({
            insertOne: (doc) => {
                if (!inMemoryDB[name]) inMemoryDB[name] = [];
                const id = Date.now().toString();
                doc._id = id;
                inMemoryDB[name].push(doc);
                return { insertedId: id };
            },
            find: (query) => {
                if (!inMemoryDB[name]) return { toArray: () => [] };
                const results = inMemoryDB[name].filter(item => {
                    if (query._id) return item._id === query._id;
                    return true;
                });
                return { toArray: () => results };
            },
            updateOne: (query, update) => {
                if (!inMemoryDB[name]) return { modifiedCount: 0 };
                const index = inMemoryDB[name].findIndex(item => 
                    query._id ? item._id === query._id : true
                );
                if (index !== -1) {
                    inMemoryDB[name][index] = { ...inMemoryDB[name][index], ...update.$set };
                    return { modifiedCount: 1 };
                }
                return { modifiedCount: 0 };
            },
            deleteOne: (query) => {
                if (!inMemoryDB[name]) return { deletedCount: 0 };
                const index = inMemoryDB[name].findIndex(item => 
                    query._id ? item._id === query._id : true
                );
                if (index !== -1) {
                    inMemoryDB[name].splice(index, 1);
                    return { deletedCount: 1 };
                }
                return { deletedCount: 0 };
            }
        })
    };
    
    console.log('In-memory database initialized successfully');
    return true;
}

// Function to check database connection health
async function checkDBHealth() {
    try {
        if (!db) {
            console.warn('Database not connected, attempting reconnect...');
            return await connectToMongoDB();
        }
        
        // If using in-memory database, it's always healthy
        if (useInMemoryDB) {
            return true;
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
if (require.main === module) {
    setInterval(async () => {
        if (!useInMemoryDB) {
            await checkDBHealth();
        }
    }, 60000); // Check every minute
}

// Middleware to check database connection
function checkDBConnection(req, res, next) {
    if (!db) {
        return res.status(500).json({ error: 'Database not connected' });
    }
    next();
}

async function ensureDatabaseIndexes() {
    if (!db || useInMemoryDB) return;
    const userDataCollections = [
        'pregnancy_data',
        'baby_data',
        'toddler_data',
        'milestones',
        'appointments',
        'nutrition',
        'sleep',
        'fertility',
        'activities'
    ];

    await Promise.all([
        db.collection('users').createIndex({ id: 1 }, { sparse: true }),
        db.collection('users').createIndex({ email: 1 }, { sparse: true }),
        db.collection('chatHistory').createIndex({ userId: 1, timestamp: -1 }),
        db.collection('app_events').createIndex({ createdAt: -1 }),
        db.collection('app_events').createIndex({ userId: 1, createdAt: -1 }),
        db.collection('app_events').createIndex({ collection: 1, createdAt: -1 }),
        ...userDataCollections.map(collection =>
            db.collection(collection).createIndex({ userId: 1, createdAt: -1 })
        )
    ]);
}

async function insertRecordWithEvent(collectionName, data, eventType = 'record-created') {
    const record = {
        ...data,
        createdAt: data.createdAt || new Date()
    };
    const result = await db.collection(collectionName).insertOne(record);
    const savedRecord = { ...record, _id: result.insertedId };

    await db.collection('app_events').insertOne({
        type: eventType,
        collection: collectionName,
        recordId: result.insertedId,
        userId: record.userId || record.email || record.id || 'unknown',
        label: record.type || record.name || record.title || eventType,
        payload: savedRecord,
        createdAt: new Date()
    });

    return savedRecord;
}

// API Routes
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        database: {
            connected: !!db,
            mode: useInMemoryDB ? 'in-memory' : activeMongoUriLabel,
            name: mongoConfig.dbName
        },
        timestamp: new Date().toISOString()
    });
});

app.get('/api/app-events', checkDBConnection, async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
        const filter = req.query.userId ? { userId: req.query.userId } : {};
        const events = await db.collection('app_events')
            .find(filter)
            .sort({ createdAt: -1 })
            .limit(limit)
            .toArray();
        res.json({ events });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

function getAdminConfig() {
    const username = process.env.ADMIN_USERNAME || process.env.ADMIN_EMAIL || 'mamasafeadmin';
    return {
        username,
        email: process.env.ADMIN_EMAIL || username,
        password: process.env.ADMIN_PASSWORD || 'mamasafe123',
        name: process.env.ADMIN_NAME || 'Mamasafe Admin'
    };
}

function requireAdmin(req, res, next) {
    if (req.session && req.session.admin) return next();
    return res.status(401).json({ error: 'Admin authentication required' });
}

async function countCollection(name, filter = {}) {
    if (!db) return 0;
    return db.collection(name).countDocuments(filter);
}

async function recentCollection(name, filter = {}, limit = 20) {
    if (!db) return [];
    return db.collection(name)
        .find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
}

app.post('/api/admin-panel/login', checkDBConnection, async (req, res) => {
    try {
        const { email, username, password } = req.body || {};
        const admin = getAdminConfig();
        const identifier = String(username || email || '').trim().toLowerCase();
        const ok = (identifier === admin.username.toLowerCase() || identifier === admin.email.toLowerCase()) && String(password || '') === admin.password;
        await db.collection('admin_audit').insertOne({
            type: ok ? 'admin-login-success' : 'admin-login-failed',
            username: username || email || '',
            ip: req.ip,
            createdAt: new Date()
        });
        if (!ok) return res.status(401).json({ error: 'Invalid admin credentials' });
        req.session.admin = { username: admin.username, email: admin.email, name: admin.name, role: 'Super Admin', loginAt: new Date().toISOString() };
        res.json({ admin: req.session.admin });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin-panel/logout', requireAdmin, (req, res) => {
    req.session.admin = null;
    res.json({ ok: true });
});

app.get('/api/admin-panel/me', (req, res) => {
    if (!req.session?.admin) {
        return res.status(401).json({ error: 'Admin login required' });
    }
    res.json({ admin: req.session.admin });
});

app.get('/api/admin-panel/dashboard', requireAdmin, checkDBConnection, async (req, res) => {
    try {
        const emergencyFilter = {
            $or: [
                { urgency: { $in: ['urgent', 'emergency', 'critical', 'high'] } },
                { type: /emergency/i },
                { label: /emergency|bleeding|pain|ambulance/i }
            ]
        };
        const [
            totalUsers,
            activityCount,
            aiChats,
            helpRequests,
            emergencyReports,
            notificationsSent,
            recentEvents,
            recentUsers,
            recentHelp
        ] = await Promise.all([
            countCollection('users'),
            countCollection('activities'),
            countCollection('chatHistory'),
            countCollection('activities', { type: { $in: ['help-request', 'support-message'] } }),
            countCollection('activities', emergencyFilter),
            countCollection('activities', { type: { $in: ['admin-notification', 'announcement', 'settings'] } }),
            recentCollection('app_events', {}, 15),
            recentCollection('users', {}, 8),
            recentCollection('activities', { type: { $in: ['help-request', 'support-message'] } }, 8)
        ]);

        res.json({
            stats: {
                totalUsers,
                activeMothers: totalUsers,
                aiChats,
                emergencyReports,
                helpRequests,
                notificationsSent,
                activityCount
            },
            recentEvents,
            recentUsers,
            recentHelp,
            system: {
                database: useInMemoryDB ? 'in-memory' : activeMongoUriLabel,
                databaseName: mongoConfig.dbName,
                serverTime: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin-panel/users', requireAdmin, checkDBConnection, async (req, res) => {
    try {
        const search = String(req.query.search || '').trim();
        const filter = search
            ? { $or: [{ email: new RegExp(search, 'i') }, { name: new RegExp(search, 'i') }, { 'profile.firstName': new RegExp(search, 'i') }] }
            : {};
        const users = await recentCollection('users', filter, 100);
        res.json({ users });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.patch('/api/admin-panel/users/:id/status', requireAdmin, checkDBConnection, async (req, res) => {
    try {
        const { status = 'active' } = req.body || {};
        const id = req.params.id;
        const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { $or: [{ id }, { email: id }] };
        const result = await db.collection('users').updateOne(filter, { $set: { status, updatedAt: new Date() } });
        await db.collection('admin_audit').insertOne({ type: 'user-status-updated', target: id, status, admin: req.session.admin.email, createdAt: new Date() });
        res.json({ modifiedCount: result.modifiedCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin-panel/help-requests', requireAdmin, checkDBConnection, async (req, res) => {
    try {
        const requests = await recentCollection('activities', { type: { $in: ['help-request', 'support-message'] } }, 100);
        res.json({ requests });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin-panel/ai-chats', requireAdmin, checkDBConnection, async (req, res) => {
    try {
        const chats = await recentCollection('chatHistory', {}, 100);
        res.json({ chats });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin-panel/events', requireAdmin, checkDBConnection, async (req, res) => {
    try {
        const events = await recentCollection('app_events', {}, Math.min(parseInt(req.query.limit, 10) || 100, 250));
        res.json({ events });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin-panel/notifications', requireAdmin, checkDBConnection, async (req, res) => {
    try {
        const { title, message, audience = 'all', priority = 'normal' } = req.body || {};
        if (!message) return res.status(400).json({ error: 'Message is required' });
        const saved = await insertRecordWithEvent('activities', {
            userId: 'admin-broadcast',
            type: 'admin-notification',
            title: title || 'Mamasafe announcement',
            message,
            audience,
            priority,
            admin: req.session.admin.email,
            savedAt: new Date().toISOString(),
            createdAt: new Date()
        }, 'admin-notification-sent');
        res.json(saved);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health Chatbot Service - Now using Groq AI (fast & free)
const { processHealthQuery, checkEmergencyKeywords, generateHealthSuggestions } = require('./services/healthChatbot');
const { processImageWithGroq } = require('./services/groqChatbot');

// Universal Groq AI Service for all functions
const {
    processBabyNamesWithAI,
    processPregnancyWithAI,
    processNutritionWithAI,
    processSleepWithAI,
    processActivitiesWithAI,
    processAppointmentsWithAI,
    processMilestonesWithAI,
    processFertilityWithAI,
    processMentalHealthWithAI,
    processCustomFunctionWithAI
} = require('./services/universalGroqAI');

app.post('/api/mamasafe-chat', async (req, res) => {
    try {
        const { message, context, chatHistory = [] } = req.body;
        
        // Get user from either passport or session, or create default user
        let user = req.user || req.session.user;
        
        // If no user is authenticated, create a default user for testing
        if (!user) {
            user = {
                id: 'guest-user',
                email: 'guest@mamasafe.com',
                displayName: 'Guest User',
                name: 'Guest User'
            };
        }
        
        // Add user context to the message
        const userContext = {
            ...context,
            userId: user.id,
            userEmail: user.email,
            userName: user.displayName || user.name
        };
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Use the new health chatbot service (OpenAI + local fallback)
        const response = await processHealthQuery(message, userContext || {}, chatHistory);
        res.json({ reply: response });
    } catch (error) {
        console.error('Health Chatbot Error:', error);
        res.status(500).json({ error: 'Failed to process chat message', details: error.message });
    }
});

app.post('/api/mamasafe-analyze-image', async (req, res) => {
    try {
        const { image, prompt, mimeType } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'Image is required' });
        }

        const user = req.user || req.session.user || {
            id: 'guest-user',
            email: 'guest@mamasafe.com',
            displayName: 'Guest User',
            name: 'Guest User'
        };

        const userContext = {
            userId: user.id,
            userEmail: user.email,
            userName: user.displayName || user.name
        };

        const analysis = await processImageWithGroq({
            image,
            mimeType,
            prompt: prompt || 'Please analyze this image.'
        }, userContext);

        res.json({ analysis });
    } catch (error) {
        console.error('Mamasafe image analysis error:', error);
        res.status(500).json({
            error: 'Failed to analyze image',
            details: error.message
        });
    }
});

// AI Baby Names Search endpoint
app.post('/api/ai-baby-names', async (req, res) => {
    try {
        const { query, gender, origin, style } = req.body;
        
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        // Get user context
        let user = req.user || req.session.user;
        const userContext = {
            pregnancyWeek: user?.pregnancyWeek,
            babyAge: user?.babyAge,
            toddlerAge: user?.toddlerAge,
            healthConcerns: user?.healthConcerns
        };

        const response = await processBabyNamesWithAI(query, gender, origin, style, userContext);
        res.json(response);
    } catch (error) {
        console.error('AI Baby Names Error:', error);
        res.status(500).json({ error: 'Failed to process baby names', details: error.message });
    }
});

// AI Pregnancy Tracking endpoint
app.post('/api/ai-pregnancy-tracking', async (req, res) => {
    try {
        const { week, symptoms, concerns } = req.body;
        
        if (!week) {
            return res.status(400).json({ error: 'Pregnancy week is required' });
        }

        // Get user context
        let user = req.user || req.session.user;
        const userContext = {
            pregnancyWeek: week,
            babyAge: user?.babyAge,
            toddlerAge: user?.toddlerAge,
            healthConcerns: user?.healthConcerns
        };

        const response = await processPregnancyWithAI(week, symptoms, concerns, userContext);
        res.json(response);
    } catch (error) {
        console.error('AI Pregnancy Tracking Error:', error);
        res.status(500).json({ error: 'Failed to process pregnancy data', details: error.message });
    }
});

// AI Nutrition Planning endpoint
app.post('/api/ai-nutrition-planning', async (req, res) => {
    try {
        const { mealPlan, dietaryRestrictions, goals } = req.body;
        
        // Get user context
        let user = req.user || req.session.user;
        const userContext = {
            pregnancyWeek: user?.pregnancyWeek,
            babyAge: user?.babyAge,
            toddlerAge: user?.toddlerAge,
            healthConcerns: user?.healthConcerns
        };

        const response = await processNutritionWithAI(mealPlan, dietaryRestrictions, goals, userContext);
        res.json(response);
    } catch (error) {
        console.error('AI Nutrition Planning Error:', error);
        res.status(500).json({ error: 'Failed to process nutrition data', details: error.message });
    }
});

// AI Sleep Guidance endpoint
app.post('/api/ai-sleep-guidance', async (req, res) => {
    try {
        const { age, sleepIssues, schedule } = req.body;
        
        if (!age) {
            return res.status(400).json({ error: 'Age is required' });
        }

        // Get user context
        let user = req.user || req.session.user;
        const userContext = {
            pregnancyWeek: user?.pregnancyWeek,
            babyAge: user?.babyAge,
            toddlerAge: user?.toddlerAge,
            healthConcerns: user?.healthConcerns
        };

        const response = await processSleepWithAI(age, sleepIssues, schedule, userContext);
        res.json(response);
    } catch (error) {
        console.error('AI Sleep Guidance Error:', error);
        res.status(500).json({ error: 'Failed to process sleep data', details: error.message });
    }
});

// AI Activity Recommendations endpoint
app.post('/api/ai-activity-recommendations', async (req, res) => {
    try {
        const { age, activityLevel, interests } = req.body;
        
        if (!age) {
            return res.status(400).json({ error: 'Age is required' });
        }

        // Get user context
        let user = req.user || req.session.user;
        const userContext = {
            pregnancyWeek: user?.pregnancyWeek,
            babyAge: user?.babyAge,
            toddlerAge: user?.toddlerAge,
            healthConcerns: user?.healthConcerns
        };

        const response = await processActivitiesWithAI(age, activityLevel, interests, userContext);
        res.json(response);
    } catch (error) {
        console.error('AI Activity Recommendations Error:', error);
        res.status(500).json({ error: 'Failed to process activity data', details: error.message });
    }
});

// AI Appointment Scheduling endpoint
app.post('/api/ai-appointment-scheduling', async (req, res) => {
    try {
        const { type, timing, concerns } = req.body;
        
        // Get user context
        let user = req.user || req.session.user;
        const userContext = {
            pregnancyWeek: user?.pregnancyWeek,
            babyAge: user?.babyAge,
            toddlerAge: user?.toddlerAge,
            healthConcerns: user?.healthConcerns
        };

        const response = await processAppointmentsWithAI(type, timing, concerns, userContext);
        res.json(response);
    } catch (error) {
        console.error('AI Appointment Scheduling Error:', error);
        res.status(500).json({ error: 'Failed to process appointment data', details: error.message });
    }
});

// AI Milestone Tracking endpoint
app.post('/api/ai-milestone-tracking', async (req, res) => {
    try {
        const { age, developmentArea, concerns } = req.body;
        
        if (!age) {
            return res.status(400).json({ error: 'Age is required' });
        }

        // Get user context
        let user = req.user || req.session.user;
        const userContext = {
            pregnancyWeek: user?.pregnancyWeek,
            babyAge: user?.babyAge,
            toddlerAge: user?.toddlerAge,
            healthConcerns: user?.healthConcerns
        };

        const response = await processMilestonesWithAI(age, developmentArea, concerns, userContext);
        res.json(response);
    } catch (error) {
        console.error('AI Milestone Tracking Error:', error);
        res.status(500).json({ error: 'Failed to process milestone data', details: error.message });
    }
});

// AI Fertility Tracking endpoint
app.post('/api/ai-fertility-tracking', async (req, res) => {
    try {
        const { cycleLength, goals, concerns } = req.body;
        
        // Get user context
        let user = req.user || req.session.user;
        const userContext = {
            pregnancyWeek: user?.pregnancyWeek,
            babyAge: user?.babyAge,
            toddlerAge: user?.toddlerAge,
            healthConcerns: user?.healthConcerns
        };

        const response = await processFertilityWithAI(cycleLength, goals, concerns, userContext);
        res.json(response);
    } catch (error) {
        console.error('AI Fertility Tracking Error:', error);
        res.status(500).json({ error: 'Failed to process fertility data', details: error.message });
    }
});

// AI Mental Health Support endpoint
app.post('/api/ai-mental-health-support', async (req, res) => {
    try {
        const { concerns, symptoms, supportNeeds } = req.body;
        
        // Get user context
        let user = req.user || req.session.user;
        const userContext = {
            pregnancyWeek: user?.pregnancyWeek,
            babyAge: user?.babyAge,
            toddlerAge: user?.toddlerAge,
            healthConcerns: user?.healthConcerns
        };

        const response = await processMentalHealthWithAI(concerns, symptoms, supportNeeds, userContext);
        res.json(response);
    } catch (error) {
        console.error('AI Mental Health Support Error:', error);
        res.status(500).json({ error: 'Failed to process mental health data', details: error.message });
    }
});

// Universal AI Processor endpoint for any custom function
app.post('/api/ai-universal-processor', async (req, res) => {
    try {
        const { functionName, description, inputData } = req.body;
        
        if (!functionName || !description) {
            return res.status(400).json({ error: 'Function name and description are required' });
        }

        // Get user context
        let user = req.user || req.session.user;
        const userContext = {
            pregnancyWeek: user?.pregnancyWeek,
            babyAge: user?.babyAge,
            toddlerAge: user?.toddlerAge,
            healthConcerns: user?.healthConcerns
        };

        const response = await processCustomFunctionWithAI(functionName, description, inputData, userContext);
        res.json(response);
    } catch (error) {
        console.error('Universal AI Processor Error:', error);
        res.status(500).json({ error: 'Failed to process request', details: error.message });
    }
});

const {
    getCourseRecommendations,
    getModuleLesson,
    askCourseExpert,
    getCommunityInsight
} = require('./services/coursesAI');

// Courses AI endpoints (Groq)
app.post('/api/courses/recommendations', async (req, res) => {
    try {
        const { stage, goals, preference, experience, courses } = req.body;
        if (!courses || !Array.isArray(courses) || courses.length === 0) {
            return res.status(400).json({ error: 'Course catalog is required' });
        }
        const result = await getCourseRecommendations({ stage, goals, preference, experience, courses });
        res.json(result);
    } catch (error) {
        console.error('Courses recommendations error:', error);
        res.status(500).json({ error: 'Failed to generate recommendations', details: error.message });
    }
});

app.post('/api/courses/module-lesson', async (req, res) => {
    try {
        const { courseTitle, moduleTitle, moduleIndex, totalModules, stage, goals } = req.body;
        if (!courseTitle || !moduleTitle) {
            return res.status(400).json({ error: 'courseTitle and moduleTitle are required' });
        }
        const result = await getModuleLesson({
            courseTitle,
            moduleTitle,
            moduleIndex: moduleIndex || 1,
            totalModules: totalModules || 1,
            stage,
            goals
        });
        res.json(result);
    } catch (error) {
        console.error('Module lesson error:', error);
        res.status(500).json({ error: 'Failed to generate lesson', details: error.message });
    }
});

app.post('/api/courses/expert-qa', async (req, res) => {
    try {
        const { question, stage, courseContext } = req.body;
        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }
        const result = await askCourseExpert({ question, stage, courseContext });
        res.json(result);
    } catch (error) {
        console.error('Expert Q&A error:', error);
        res.status(500).json({ error: 'Failed to get expert answer', details: error.message });
    }
});

app.post('/api/courses/community-insight', async (req, res) => {
    try {
        const { topic, stage } = req.body;
        const result = await getCommunityInsight({ topic, stage });
        res.json(result);
    } catch (error) {
        console.error('Community insight error:', error);
        res.status(500).json({ error: 'Failed to generate community message', details: error.message });
    }
});

// Wikidata API proxy endpoint
app.get('/api/wikidata', async (req, res) => {
    try {
        const { search, language = 'en', uselang = 'en', format = 'json', limit = '40' } = req.query;
        
        if (!search) {
            return res.status(400).json({ error: 'Search parameter is required' });
        }

        // Validate limit to prevent abuse
        const safeLimit = Math.min(parseInt(limit) || 40, 100);
        // Only allow safe language codes
        const safeLang = /^[a-z]{2,5}$/.test(language) ? language : 'en';
        
        const wikidataUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(search)}&language=${safeLang}&uselang=${safeLang}&format=json&limit=${safeLimit}`;
        console.log('Proxy fetching wikidata search');
        
        const response = await fetch(wikidataUrl, {
            headers: {
                'User-Agent': 'Mamasafe-App/1.0',
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            return res.status(response.status).json({ error: 'Wikidata API error', status: response.status });
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Wikidata API proxy error:', error.message);
        res.status(500).json({ error: 'Failed to fetch data from Wikidata' });
    }
});

// Users API
app.post('/api/users', checkDBConnection, async (req, res) => {
    try {
        const userData = { ...req.body, createdAt: new Date() };
        const saved = await insertRecordWithEvent('users', userData, 'user-created');
        res.json(saved);
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
        const saved = await insertRecordWithEvent('pregnancy_data', data, 'pregnancy-saved');
        res.json(saved);
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
        const saved = await insertRecordWithEvent('baby_data', data, 'baby-saved');
        res.json(saved);
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
        const saved = await insertRecordWithEvent('toddler_data', data, 'toddler-saved');
        res.json(saved);
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
        const saved = await insertRecordWithEvent('milestones', data, 'milestone-saved');
        res.json(saved);
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
        const saved = await insertRecordWithEvent('appointments', data, 'appointment-saved');
        res.json(saved);
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
        const saved = await insertRecordWithEvent('nutrition', data, 'nutrition-saved');
        res.json(saved);
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
        const saved = await insertRecordWithEvent('sleep', data, 'sleep-saved');
        res.json(saved);
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

// Fertility API
app.post('/api/fertility', checkDBConnection, async (req, res) => {
    try {
        const data = { ...req.body, createdAt: new Date() };
        const saved = await insertRecordWithEvent('fertility', data, 'fertility-saved');
        res.json(saved);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/fertility/:userId', checkDBConnection, async (req, res) => {
    try {
        const data = await db.collection('fertility').find({ userId: req.params.userId }).toArray();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Activities API
app.post('/api/activities', checkDBConnection, async (req, res) => {
    try {
        const data = { ...req.body, createdAt: new Date() };
        const saved = await insertRecordWithEvent('activities', data, 'activity-saved');
        res.json(saved);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/activities/:userId', checkDBConnection, async (req, res) => {
    try {
        const data = await db.collection('activities')
            .find({
                $or: [
                    { userId: req.params.userId },
                    { userId: 'admin-broadcast', type: 'admin-notification' },
                    { type: 'admin-notification', audience: { $in: ['all', 'users', 'everyone'] } }
                ]
            })
            .sort({ createdAt: 1 })
            .toArray();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Google OAuth Routes
function requireGoogleOAuth(req, res, next) {
    if (googleOAuthEnabled) return next();
    return res.status(503).json({
        error: 'Google OAuth is not configured on this server',
        requiredEnvVars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'PUBLIC_BACKEND_URL']
    });
}

app.get('/auth/google',
  requireGoogleOAuth,
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  requireGoogleOAuth,
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/auth.html' }),
  (req, res) => {
    // Successful authentication, redirect to frontend main page
    res.redirect('http://localhost:3000/index.html');
  }
);

// Logout route
app.get('/auth/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// Get current user
app.get('/api/auth/user', (req, res) => {
  const user = (req.isAuthenticated && req.isAuthenticated()) ? req.user : (req.session && req.session.user) || null;
  res.json({ user });
});

// CSRF token endpoint
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.session.csrfToken });
});

// Protected route example
app.get('/api/protected', isAuthenticated, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Admin-only route
app.get('/api/admin/users', hasRole('admin'), async (req, res) => {
  try {
    if (db && !useInMemoryDB) {
      const users = await db.collection('users').find({}).toArray();
      res.json({ users });
    } else {
      res.json({ users: [], message: 'In-memory mode - no user persistence' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Healthcare provider route
app.get('/api/provider/analytics', hasRole('healthcare_provider'), async (req, res) => {
  try {
    // Return analytics data for healthcare providers
    const analytics = {
      totalUsers: 1000,
      activeUsers: 250,
      aiQueries: 5000,
      avgResponseTime: '2.3s'
    };
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User profile management
app.get('/api/user/profile', authenticateAny, async (req, res) => {
  try {
    // Get user from either passport or session
    const user = req.user || req.session.user;
    
    if (db && !useInMemoryDB) {
      const userProfile = await db.collection('users').findOne({ id: user.id });
      res.json({ profile: userProfile });
    } else {
      res.json({ profile: user });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/user/profile', authenticateAny, async (req, res) => {
  try {
    const { preferences, healthData } = req.body;
    
    // Get user from either passport or session
    const user = req.user || req.session.user;
    
    if (db && !useInMemoryDB) {
      await db.collection('users').updateOne(
        { id: user.id },
        { 
          $set: { 
            'preferences': preferences,
            'healthData': healthData,
            'updatedAt': new Date()
          }
        }
      );
    }
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health Chatbot endpoint
app.post('/api/health-chatbot', authenticateAny, async (req, res) => {
  // Get user from either passport or session
  const user = req.user || req.session.user;
  try {
    const { message, chatHistory } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check for emergency keywords
    const emergencyCheck = checkEmergencyKeywords(message);
    if (emergencyCheck.isEmergency) {
      return res.json({
        response: emergencyCheck.message,
        isEmergency: true,
        requiresImmediateAction: true
      });
    }

    // Get user context from profile
    let userContext = {};
    if (db && !useInMemoryDB) {
      const userProfile = await db.collection('users').findOne({ id: user.id });
      if (userProfile && userProfile.healthData) {
        userContext = userProfile.healthData;
      }
    }

    // Process health query
    const response = await processHealthQuery(message, userContext, chatHistory || []);
    
    // Store chat history in database (optional)
    if (db && !useInMemoryDB) {
      await db.collection('chatHistory').insertOne({
        userId: user.id,
        message: message,
        response: response,
        timestamp: new Date(),
        isEmergency: emergencyCheck.isEmergency
      });
    }

    res.json({
      response: response,
      isEmergency: false,
      requiresImmediateAction: false,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Health Chatbot Error:', error);
    res.status(500).json({ 
      error: 'Failed to process health query',
      details: error.message 
    });
  }
});

// Get chatbot suggestions based on user context
app.get('/api/health-chatbot/suggestions', authenticateAny, async (req, res) => {
  // Get user from either passport or session
  const user = req.user || req.session.user;
  
  try {
    // Get user context from profile
    let userContext = {};
    if (db && !useInMemoryDB) {
      const userProfile = await db.collection('users').findOne({ id: user.id });
      if (userProfile && userProfile.healthData) {
        userContext = userProfile.healthData;
      }
    }

    const suggestions = generateHealthSuggestions(userContext);
    res.json({ suggestions });

  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get chat history
app.get('/api/health-chatbot/history', authenticateAny, async (req, res) => {
  // Get user from either passport or session
  const user = req.user || req.session.user;
  
  try {
    const { limit = 20 } = req.query;
    
    if (db && !useInMemoryDB) {
      const history = await db.collection('chatHistory')
        .find({ userId: user.id })
        .sort({ timestamp: -1 })
        .limit(parseInt(limit))
        .toArray();
      
      res.json({ history: history.reverse() });
    } else {
      res.json({ history: [] });
    }

  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clear chat history
app.delete('/api/health-chatbot/history', authenticateAny, async (req, res) => {
  // Get user from either passport or session
  const user = req.user || req.session.user;
  
  try {
    if (db && !useInMemoryDB) {
      await db.collection('chatHistory').deleteMany({ userId: user.id });
    }
    
    res.json({ message: 'Chat history cleared successfully' });

  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({ error: error.message });
  }
});



// Catch-all handler - serve index.html for SPA routing (exclude API routes and static files)
app.use((req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.includes('.')) {
        return next();
    }
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server
async function startServer() {
    // Start server regardless of MongoDB connection status
    app.listen(PORT, () => {
        console.log(`\n`);
        console.log(`===================================`);
        console.log(`    Mamasafe Server Running`);
        console.log(`===================================`);
        console.log(`Local:   http://localhost:${PORT}`);
        console.log(`Network: http://localhost:${PORT}`);
        console.log(`MongoDB: ${db ? 'Connected to Atlas' : 'Connecting in background...'}`);
        console.log(`===================================`);
        console.log(`Press Ctrl+C to stop server`);
        console.log(`\n`);

        // Start MongoDB connection after the HTTP server is already available.
        setTimeout(() => {
            connectToMongoDB().then(connected => {
                if (connected) {
                    console.log('MongoDB connected successfully after startup');
                } else {
                    console.log('MongoDB not connected after startup, will retry in background');
                }
            });
        }, 100);
    });
}

if (require.main === module) {
    startServer();
}

module.exports = app;
module.exports.connectToMongoDB = connectToMongoDB;
module.exports.startServer = startServer;
