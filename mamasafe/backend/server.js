const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { MongoClient, ObjectId } = require('mongodb');
const dns = require('dns').promises;

// Import auth middleware
const { configureSession, configureGoogleStrategy, isAuthenticated, hasRole, passport } = require('./middleware/auth');

// Import local auth for development
const { configureLocalSession, authenticateLocal, authenticateAny, setupLocalAuthRoutes } = require('./middleware/localAuth');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const rootEnvPath = path.join(__dirname, '..', '.env');
const backendEnvPath = path.join(__dirname, '.env');
const rootEnv = require('dotenv').config({ path: rootEnvPath }).parsed || {};
const backendEnv = require('dotenv').config({ path: backendEnvPath, override: true }).parsed || {};
if (rootEnv.MONGODB_URI && process.env.MONGODB_PREFER_BACKEND_ENV !== 'true') {
    process.env.MONGODB_URI = rootEnv.MONGODB_URI;
}
if (rootEnv.MONGODB_DB_NAME && process.env.MONGODB_PREFER_BACKEND_ENV !== 'true') {
    process.env.MONGODB_DB_NAME = rootEnv.MONGODB_DB_NAME;
}
const PORT = process.env.PORT || 3000;
app.set('trust proxy', 1);
const defaultCorsOrigins = [
    'null',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://mamasafe1.onrender.com',
    'https://mamasafe-95d58.web.app',
    'https://mamasafe-95d58.firebaseapp.com'
];
const corsOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
const allowedCorsOrigins = [...new Set([...defaultCorsOrigins, ...corsOrigins])];

function isAllowedCorsOrigin(origin) {
    if (!origin) return true;
    if (allowedCorsOrigins.includes(origin)) return true;
    return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
}

// MongoDB Configuration
const mongoConfig = {
    developmentMode: process.env.MONGODB_DEV_MODE === 'true',
    // Primary MongoDB Atlas connection. Keep this in backend/.env only.
    uri: process.env.MONGODB_URI || '',
    secondaryUri: process.env.MONGODB_SECONDARY_URI || (
        backendEnv.MONGODB_URI && backendEnv.MONGODB_URI !== process.env.MONGODB_URI
            ? backendEnv.MONGODB_URI
            : ''
    ),
    dbName: process.env.MONGODB_DB_NAME || 'mamasafe',
    localUri: process.env.MONGODB_LOCAL_URI || 'mongodb://localhost:27017/mamasafe',
    allowLocalFallback: process.env.MONGODB_ALLOW_LOCAL_FALLBACK === 'true'
};

let db;
let client;
let useInMemoryDB = false;
let activeMongoUriLabel = 'not-connected';
let mongoConnectPromise = null;
let lastMongoError = null;
let lastMongoDiagnostic = null;
let mongoReconnectTimer = null;
let lastMongoMonitorWarningAt = 0;
let lastMongoConnectionLogAt = 0;
const MONGO_MONITOR_LOG_INTERVAL_MS = 5 * 60 * 1000;

// In-memory database fallback
const inMemoryDB = {
    users: [],
    pregnancies: [],
    pregnancy_vital_assessments: [],
    appointments: [],
    reminders: [],
    chat_sessions: [],
    pregnancy_weeks: [],
    symptoms: [],
    danger_signs: [],
    nutrition: [],
    faqs: [],
    articles: [],
    who_guidelines: [],
    who_document_chunks: [],
    pregnancy_source_datasets: [],
    maternal_health_risk_records: [],
    maternal_mortality_indicators: [],
    health_pregnancy_indicators: [],
    who_anc_data_elements: [],
    mn_survey_records: [],
    pregnancy_knowledge: [],
    analytics: [],
    activities: [],
    notifications: []
};

function createInMemoryDatabase() {
    const getFieldValues = (item = {}, field = '') => {
        const value = field.split('.').reduce((current, key) => current?.[key], item);
        return Array.isArray(value) ? value : [value];
    };

    const matchesFieldCondition = (item, field, condition) => {
        const values = getFieldValues(item, field).filter(value => value !== undefined && value !== null);

        if (condition instanceof RegExp) {
            return values.some(value => condition.test(String(value)));
        }

        if (condition && typeof condition === 'object' && !(condition instanceof Date)) {
            if (condition.$regex) {
                const regex = new RegExp(condition.$regex, condition.$options || '');
                return values.some(value => regex.test(String(value)));
            }
            if (condition.$in) {
                return values.some(value => condition.$in.includes(value));
            }
            if (Object.prototype.hasOwnProperty.call(condition, '$exists')) {
                const exists = values.length > 0;
                if (Boolean(condition.$exists) !== exists) return false;
            }
            if (Object.prototype.hasOwnProperty.call(condition, '$ne')) {
                if (values.some(value => String(value) === String(condition.$ne))) return false;
            }
            if (Object.prototype.hasOwnProperty.call(condition, '$gte') || Object.prototype.hasOwnProperty.call(condition, '$lte') || Object.prototype.hasOwnProperty.call(condition, '$gt') || Object.prototype.hasOwnProperty.call(condition, '$lt')) {
                return values.some(value => {
                    const comparable = value instanceof Date ? value.getTime() : new Date(value).getTime();
                    const numericValue = Number.isNaN(comparable) ? Number(value) : comparable;
                    const toComparable = (target) => {
                        const dateValue = target instanceof Date ? target.getTime() : new Date(target).getTime();
                        return Number.isNaN(dateValue) ? Number(target) : dateValue;
                    };
                    if (Number.isNaN(numericValue)) return false;
                    if (Object.prototype.hasOwnProperty.call(condition, '$gte') && numericValue < toComparable(condition.$gte)) return false;
                    if (Object.prototype.hasOwnProperty.call(condition, '$lte') && numericValue > toComparable(condition.$lte)) return false;
                    if (Object.prototype.hasOwnProperty.call(condition, '$gt') && numericValue <= toComparable(condition.$gt)) return false;
                    if (Object.prototype.hasOwnProperty.call(condition, '$lt') && numericValue >= toComparable(condition.$lt)) return false;
                    return true;
                });
            }
            return values.length > 0 || Object.prototype.hasOwnProperty.call(condition, '$exists');
        }

        return values.some(value => String(value) === String(condition));
    };

    const matchesQuery = (item, query = {}) => {
        const entries = Object.entries(query || {});
        if (!entries.length) return true;

        return entries.every(([key, value]) => {
            if (key === '$or') {
                return Array.isArray(value) && value.some(childQuery => matchesQuery(item, childQuery));
            }
            if (key === '$and') {
                return Array.isArray(value) && value.every(childQuery => matchesQuery(item, childQuery));
            }
            return matchesFieldCondition(item, key, value);
        });
    };

    const createCursor = (results = []) => ({
        sort: (sortSpec = {}) => {
            const entries = Object.entries(sortSpec || {});
            if (!entries.length) return createCursor(results);
            const sorted = [...results].sort((a, b) => {
                for (const [field, direction] of entries) {
                    const aValue = getFieldValues(a, field)[0];
                    const bValue = getFieldValues(b, field)[0];
                    const aTime = new Date(aValue).getTime();
                    const bTime = new Date(bValue).getTime();
                    const left = Number.isNaN(aTime) ? String(aValue || '') : aTime;
                    const right = Number.isNaN(bTime) ? String(bValue || '') : bTime;
                    if (left < right) return direction === -1 ? 1 : -1;
                    if (left > right) return direction === -1 ? -1 : 1;
                }
                return 0;
            });
            return createCursor(sorted);
        },
        limit: (count) => createCursor(results.slice(0, Number(count) || results.length)),
        toArray: () => results
    });

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
                if (!inMemoryDB[name]) return createCursor([]);
                const results = inMemoryDB[name].filter(item => matchesQuery(item, query));
                return createCursor(results);
            },
            countDocuments: (query = {}) => {
                if (!inMemoryDB[name]) return 0;
                return inMemoryDB[name].filter(item => matchesQuery(item, query)).length;
            },
            createIndex: async () => null,
            findOne: (query = {}) => {
                if (!inMemoryDB[name]) return null;
                return inMemoryDB[name].find(item => matchesQuery(item, query)) || null;
            },
            updateOne: (query = {}, update = {}) => {
                if (!inMemoryDB[name]) return { modifiedCount: 0 };
                const index = inMemoryDB[name].findIndex(item => matchesQuery(item, query));
                if (index !== -1) {
                    inMemoryDB[name][index] = { ...inMemoryDB[name][index], ...(update.$set || {}) };
                    return { modifiedCount: 1 };
                }
                return { modifiedCount: 0 };
            },
            deleteOne: (query = {}) => {
                if (!inMemoryDB[name]) return { deletedCount: 0 };
                const index = inMemoryDB[name].findIndex(item => matchesQuery(item, query));
                if (index !== -1) {
                    inMemoryDB[name].splice(index, 1);
                    return { deletedCount: 1 };
                }
                return { deletedCount: 0 };
            },
            deleteMany: (query = {}) => {
                if (!inMemoryDB[name]) return { deletedCount: 0 };
                const originalLength = inMemoryDB[name].length;
                inMemoryDB[name] = inMemoryDB[name].filter(item => !matchesQuery(item, query));
                return { deletedCount: originalLength - inMemoryDB[name].length };
            }
        }),
        admin: () => ({ ping: async () => true })
    };
}

function getMongoUriMetadata(uri = mongoConfig.uri) {
    if (!uri) {
        return { configured: false };
    }

    try {
        const parsed = new URL(uri);
        return {
            configured: true,
            protocol: parsed.protocol.replace(':', ''),
            host: parsed.host,
            database: parsed.pathname.replace(/^\//, '') || null,
            tlsRequested: parsed.searchParams.get('tls') || parsed.searchParams.get('ssl') || null
        };
    } catch {
        return { configured: true, invalid: true };
    }
}

function normalizeMongoUri(uri) {
    if (!uri) return uri;
    const trimmed = uri.trim();
    if (!trimmed.includes('mongodb.net')) return trimmed;

    try {
        const parsed = new URL(trimmed);
        if (!parsed.searchParams.has('tls') && !parsed.searchParams.has('ssl')) {
            parsed.searchParams.set('tls', 'true');
        }
        return parsed.toString();
    } catch {
        return trimmed;
    }
}

async function buildStandardAtlasUriFromSrv(uri) {
    if (!String(uri || '').trim().startsWith('mongodb+srv://')) return null;

    try {
        const parsed = new URL(uri);
        if (parsed.protocol !== 'mongodb+srv:') return null;

        const records = await dns.resolveSrv(`_mongodb._tcp.${parsed.hostname}`);
        if (!records.length) return null;

        const params = new URLSearchParams(parsed.search);
        const txtRecords = await dns.resolveTxt(parsed.hostname).catch(() => []);
        txtRecords
            .flat()
            .join('&')
            .split('&')
            .map(part => part.trim())
            .filter(Boolean)
            .forEach(part => {
                const [key, ...rest] = part.split('=');
                if (key && rest.length && !params.has(key)) {
                    params.set(key, rest.join('='));
                }
            });
        params.set('tls', 'true');

        const hosts = records
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(record => `${record.name}:${record.port}`)
            .join(',');
        const auth = parsed.username
            ? `${parsed.username}${parsed.password ? `:${parsed.password}` : ''}@`
            : '';
        const databasePath = parsed.pathname && parsed.pathname !== '/' ? parsed.pathname : '';
        return `mongodb://${auth}${hosts}${databasePath}?${params.toString()}`;
    } catch (error) {
        console.warn('Could not build standard MongoDB URI from SRV record:', error.message);
        return null;
    }
}

function buildMongoConnectionOptions(uri) {
    const isAtlas = uri.includes('mongodb.net') || uri.includes('mongodb+srv');
    const isLocal = uri.includes('localhost') || uri.includes('127.0.0.1');

    if (isLocal) {
        return {
            maxPoolSize: 10,
            minPoolSize: 0,
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

    if (isAtlas) {
        return {
            maxPoolSize: 10,
            minPoolSize: 0,
            maxIdleTimeMS: 60000,
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 60000,
            connectTimeoutMS: 30000,
            heartbeatFrequencyMS: 30000,
            retryWrites: true,
            retryReads: true,
            w: 'majority',
            tls: true,
            family: 4
        };
    }

    return {};
}

function logMongoMonitorWarning(message) {
    const now = Date.now();
    if (now - lastMongoMonitorWarningAt < MONGO_MONITOR_LOG_INTERVAL_MS) return;
    lastMongoMonitorWarningAt = now;
    console.warn(message);
}

function logMongoConnectionEvent(message) {
    const now = Date.now();
    if (now - lastMongoConnectionLogAt < MONGO_MONITOR_LOG_INTERVAL_MS) return;
    lastMongoConnectionLogAt = now;
    console.log(message);
}

function scheduleMongoReconnect(reason = 'connection monitor event') {
    if (useInMemoryDB || mongoReconnectTimer) return;
    logMongoMonitorWarning(`MongoDB ${reason}; reconnect will be attempted in the background.`);
    mongoReconnectTimer = setTimeout(() => {
        mongoReconnectTimer = null;
        if (!useInMemoryDB) {
            connectToMongoDB(1).catch(error => {
                lastMongoError = error.message;
                logMongoMonitorWarning(`MongoDB background reconnect failed: ${error.message}`);
            });
        }
    }, 30000);
}

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "'unsafe-hashes'", "https://www.gstatic.com", "https://apis.google.com", "https://cdn.jsdelivr.net"],
            scriptSrcElem: ["'self'", "'unsafe-inline'", "https://www.gstatic.com", "https://apis.google.com", "https://cdn.jsdelivr.net"],
            scriptSrcAttr: ["'unsafe-inline'"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: [
                "'self'",
                "http://localhost:5000",
                "http://127.0.0.1:5000",
                "https://mamasafe1.onrender.com",
                "https://mamasafe-95d58.web.app",
                "https://mamasafe-95d58.firebaseapp.com",
                "https://www.googleapis.com",
                "https://identitytoolkit.googleapis.com",
                "https://securetoken.googleapis.com",
                "https://firestore.googleapis.com",
                "https://firebase.googleapis.com",
                "https://*.googleapis.com",
                "https://*.firebaseio.com",
                "https://www.wikidata.org",
                "https://wikidata.org",
                "https://www.gstatic.com"
            ],
            mediaSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameSrc: ["'self'", "https://*.firebaseapp.com", "https://accounts.google.com"],
        },
    },
}));

app.use(cors({
    origin: (origin, callback) => {
        if (isAllowedCorsOrigin(origin)) {
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
    if (mongoConnectPromise) {
        return mongoConnectPromise;
    }

    mongoConnectPromise = connectToMongoDBInternal(maxRetries).finally(() => {
        mongoConnectPromise = null;
    });
    return mongoConnectPromise;
}

async function connectToMongoDBInternal(maxRetries = 5) {
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

        db = createInMemoryDatabase();
        console.log('In-memory database initialized successfully for development');
        return true;
    }

    const primaryMongoUri = normalizeMongoUri(mongoConfig.uri);
    const standardAtlasUri = primaryMongoUri ? await buildStandardAtlasUriFromSrv(primaryMongoUri) : null;
    const secondaryMongoUri = normalizeMongoUri(mongoConfig.secondaryUri);
    const secondaryStandardAtlasUri = secondaryMongoUri ? await buildStandardAtlasUriFromSrv(secondaryMongoUri) : null;
    const urisToTry = [...new Set([
        primaryMongoUri,
        standardAtlasUri,
        secondaryMongoUri,
        secondaryStandardAtlasUri,
        ...(mongoConfig.allowLocalFallback ? [mongoConfig.localUri] : [])
    ].filter(Boolean))];

    if (!urisToTry.length) {
        lastMongoError = 'MONGODB_URI is not configured';
        lastMongoDiagnostic = getMongoUriMetadata('');
        console.error('MONGODB_URI is not configured. Add your MongoDB Atlas URI to Render environment variables.');
        useInMemoryDB = true;
        activeMongoUriLabel = 'in-memory';
        db = createInMemoryDatabase();
        return true;
    }

    for (let uriIndex = 0; uriIndex < urisToTry.length; uriIndex++) {
        const currentUri = urisToTry[uriIndex];
        const uriLabel = currentUri.includes('mongodb+srv') || currentUri.includes('mongodb.net') ? 'MongoDB Atlas' : 'local MongoDB';
        lastMongoDiagnostic = getMongoUriMetadata(currentUri);
        console.log(`Trying ${uriLabel} URI ${uriIndex + 1}/${urisToTry.length}...`);

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`MongoDB connection attempt ${attempt}/${maxRetries} for URI ${uriIndex + 1}...`);
                const connectionOptions = buildMongoConnectionOptions(currentUri);

                client = new MongoClient(currentUri, connectionOptions);

                await client.connect();
                db = client.db(mongoConfig.dbName);
                useInMemoryDB = false;
                lastMongoError = null;

                // Set up connection monitoring
                client.on('connectionPoolCreated', () => {
                    logMongoConnectionEvent('MongoDB connection pool created');
                });

                client.on('connectionCreated', () => {
                    logMongoConnectionEvent('MongoDB connection established');
                });

                client.on('connectionReady', () => {
                    logMongoConnectionEvent('MongoDB connection ready');
                });

                client.on('connectionClosed', (event) => {
                    if (event.reason !== 'idle') {
                        logMongoMonitorWarning(`MongoDB connection closed: ${event.reason || 'unknown reason'}`);
                    }
                });

                client.on('connectionPoolCleared', () => {
                    scheduleMongoReconnect('connection pool cleared');
                });

                client.on('serverOpening', () => {
                    logMongoConnectionEvent('MongoDB server connection opened');
                });

                client.on('serverClosed', () => {
                    scheduleMongoReconnect('server connection closed');
                });

                client.on('serverHeartbeatFailed', (event) => {
                    lastMongoError = event?.failure?.message || 'MongoDB server heartbeat failed';
                    logMongoMonitorWarning(`MongoDB heartbeat failed; driver will retry automatically. Last error: ${lastMongoError}`);
                });

                activeMongoUriLabel = uriLabel;
                await ensureDatabaseIndexes();
                console.log(`Connected to ${uriLabel} database "${mongoConfig.dbName}"`);
                return true;

            } catch (error) {
                lastMongoError = error.message;
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
    console.log('Falling back to in-memory database so the API can keep serving non-persistent responses.');
    useInMemoryDB = true;
    activeMongoUriLabel = 'in-memory';
    db = createInMemoryDatabase();
    console.log('In-memory database initialized successfully');
    return true;
}

// Function to check database connection health
async function checkDBHealth() {
    try {
        if (!db) {
            logMongoMonitorWarning('Database not connected; attempting background reconnect.');
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
        lastMongoError = error.message;
        logMongoMonitorWarning(`Database health check failed; attempting background reconnect. Last error: ${error.message}`);
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
        'pregnancies',
        'milestones',
        'appointments',
        'reminders',
        'nutrition',
        'sleep',
        'activities',
        'notifications'
    ];

    const isTextIndexSpec = (index = {}) => Object.values(index).some(value => value === 'text');
    const hasTextIndex = (existingIndex = {}) => {
        const key = existingIndex.key || {};
        return key._fts === 'text' || Object.values(key).some(value => value === 'text');
    };
    const indexKeysEqual = (left = {}, right = {}) => {
        const leftEntries = Object.entries(left);
        const rightEntries = Object.entries(right);
        if (leftEntries.length !== rightEntries.length) return false;
        return leftEntries.every(([key, value]) => right[key] === value);
    };
    const isBenignIndexConflict = (error = {}) => (
        error.code === 85
        || error.code === 86
        || /index already exists|equivalent index already exists/i.test(error.message || '')
    );

    const createIndexSafe = async (collectionName, index, options = {}) => {
        try {
            const collection = db.collection(collectionName);
            const existingIndexes = await collection.listIndexes().toArray().catch(() => []);
            const requestedTextIndex = isTextIndexSpec(index);

            if (requestedTextIndex && existingIndexes.some(hasTextIndex)) {
                return null;
            }

            if (!requestedTextIndex && existingIndexes.some(existingIndex => indexKeysEqual(existingIndex.key, index))) {
                return null;
            }

            return await collection.createIndex(index, options);
        } catch (error) {
            if (isBenignIndexConflict(error)) {
                return null;
            }
            console.warn(`Could not create index on ${collectionName}:`, error.message);
            return null;
        }
    };

    await Promise.all([
        createIndexSafe('users', { id: 1 }, { sparse: true }),
        createIndexSafe('users', { email: 1 }, { sparse: true }),
        createIndexSafe('users', { normalizedEmail: 1 }, { sparse: true }),
        createIndexSafe('users', { normalizedName: 1 }, { sparse: true }),
        createIndexSafe('users', { role: 1, createdAt: -1 }),
        createIndexSafe('chatHistory', { userId: 1, timestamp: -1 }),
        createIndexSafe('chatHistory', { chatKey: 1 }, { unique: true, sparse: true }),
        createIndexSafe('chat_sessions', { userId: 1, createdAt: -1 }),
        createIndexSafe('app_events', { createdAt: -1 }),
        createIndexSafe('app_events', { userId: 1, createdAt: -1 }),
        createIndexSafe('app_events', { collection: 1, createdAt: -1 }),
        createIndexSafe('pregnancies', { userId: 1, createdAt: -1 }),
        createIndexSafe('pregnancies', { currentWeek: 1 }, { sparse: true }),
        createIndexSafe('pregnancies', { riskLevel: 1 }, { sparse: true }),
        createIndexSafe('pregnancy_vital_assessments', { assessmentKey: 1 }, { unique: true, sparse: true }),
        createIndexSafe('pregnancy_vital_assessments', { userId: 1, updatedAt: -1 }),
        createIndexSafe('pregnancy_vital_assessments', { riskLevel: 1, updatedAt: -1 }, { sparse: true }),
        createIndexSafe('pregnancy_data', { userId: 1, type: 1, createdAt: -1 }),
        createIndexSafe('pregnancy_weeks', { week: 1 }, { sparse: true }),
        createIndexSafe('pregnancy_weeks', { title: 'text', babyDevelopment: 'text', motherChanges: 'text', symptomsCommon: 'text', tips: 'text', dangerAlerts: 'text', keywords: 'text' }, { name: 'pregnancy_weeks_text_v1' }),
        createIndexSafe('symptoms', { name: 1 }, { sparse: true }),
        createIndexSafe('symptoms', { symptomCheckKey: 1 }, { unique: true, sparse: true }),
        createIndexSafe('symptoms', { name: 'text', aliases: 'text', keywords: 'text' }, { name: 'symptoms_text_v2' }),
        createIndexSafe('danger_signs', { keywords: 'text', sign: 'text', category: 'text' }, { name: 'danger_signs_text_v2' }),
        createIndexSafe('faqs', { question: 'text', questionAliases: 'text', answer: 'text', tags: 'text', keywords: 'text' }, { name: 'faqs_text_v3' }),
        createIndexSafe('articles', { title: 'text', content: 'text', category: 'text', keywords: 'text' }, { name: 'articles_text_v2' }),
        createIndexSafe('who_guidelines', { title: 'text', dataset: 'text', category: 'text', recommendation: 'text', keywords: 'text' }, { name: 'who_guidelines_text_v1' }),
        createIndexSafe('who_guidelines', { sourceOrganization: 1, category: 1 }, { sparse: true }),
        createIndexSafe('who_document_chunks', { documentTitle: 'text', sectionTitle: 'text', content: 'text', keywords: 'text' }, { name: 'who_document_chunks_text_v1' }),
        createIndexSafe('who_document_chunks', { documentId: 1, chunkIndex: 1 }, { name: 'document_chunk_order_v1' }),
        createIndexSafe('who_document_chunks', { sourceOrganization: 1, category: 1 }, { name: 'document_source_category_v1', sparse: true }),
        createIndexSafe('pregnancy_source_datasets', { title: 'text', sourceOrganization: 'text', category: 'text', pregnancyUse: 'text', keywords: 'text' }, { name: 'pregnancy_source_datasets_text_v1' }),
        createIndexSafe('pregnancy_source_datasets', { datasetId: 1 }, { name: 'pregnancy_source_datasets_id_v1', sparse: true }),
        createIndexSafe('maternal_health_risk_records', { title: 'text', summary: 'text', riskLevel: 'text', pregnancyUse: 'text', keywords: 'text' }, { name: 'maternal_health_risk_records_text_v1' }),
        createIndexSafe('maternal_health_risk_records', { riskLevel: 1, systolicBP: 1, diastolicBP: 1, bmi: 1 }, { name: 'maternal_health_risk_measurements_v2', sparse: true }),
        createIndexSafe('maternal_mortality_indicators', { title: 'text', summary: 'text', indicatorName: 'text', countryName: 'text', pregnancyUse: 'text', keywords: 'text' }, { name: 'maternal_mortality_indicators_text_v1' }),
        createIndexSafe('maternal_mortality_indicators', { indicatorCode: 1, countryCode: 1, year: -1 }, { name: 'maternal_mortality_indicators_lookup_v1', sparse: true }),
        createIndexSafe('health_pregnancy_indicators', { title: 'text', summary: 'text', indicatorName: 'text', countryName: 'text', topic: 'text', pregnancyUse: 'text', keywords: 'text' }, { name: 'health_pregnancy_indicators_text_v1' }),
        createIndexSafe('health_pregnancy_indicators', { datasetId: 1, indicatorCode: 1, countryCode: 1, year: -1 }, { name: 'health_pregnancy_indicators_lookup_v1', sparse: true }),
        createIndexSafe('who_anc_data_elements', { title: 'text', description: 'text', sheetName: 'text', dataType: 'text', dataElementId: 'text', keywords: 'text' }, { name: 'who_anc_data_elements_text_v1' }),
        createIndexSafe('who_anc_data_elements', { datasetId: 1, sheetName: 1 }, { name: 'who_anc_data_elements_sheet_v1', sparse: true }),
        createIndexSafe('mn_survey_records', { title: 'text', summary: 'text', measureCode: 'text', measureLabel: 'text', countryName: 'text', pregnancyUse: 'text', keywords: 'text' }, { name: 'mn_survey_records_text_v1' }),
        createIndexSafe('mn_survey_records', { datasetId: 1, measureCode: 1, countryCode: 1 }, { name: 'mn_survey_records_lookup_v1', sparse: true }),
        createIndexSafe('pregnancy_knowledge', { title: 'text', category: 'text', trimester: 'text', content: 'text', keywords: 'text' }, { name: 'pregnancy_knowledge_text_v1' }),
        createIndexSafe('pregnancy_knowledge', { knowledgeId: 1 }, { name: 'pregnancy_knowledge_id_v1', unique: true, sparse: true }),
        createIndexSafe('pregnancy_knowledge', { category: 1, trimester: 1 }, { name: 'pregnancy_knowledge_category_trimester_v1', sparse: true }),
        createIndexSafe('nutrition', { food: 1 }, { sparse: true }),
        createIndexSafe('nutrition', { nutritionLogKey: 1 }, { unique: true, sparse: true }),
        createIndexSafe('nutrition', { food: 'text', type: 'text', benefits: 'text', keywords: 'text' }, { name: 'nutrition_text_v2' }),
        createIndexSafe('reminders', { reminderKey: 1 }, { unique: true, sparse: true }),
        createIndexSafe('reminders', { userId: 1, date: 1, status: 1 }),
        createIndexSafe('notifications', { userId: 1, createdAt: -1 }),
        createIndexSafe('notifications', { type: 1, audience: 1, createdAt: -1 }),
        ...userDataCollections.map(collection =>
            createIndexSafe(collection, { userId: 1, createdAt: -1 })
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

async function saveAIChatHistory({
    user = {},
    message,
    response,
    context = {},
    chatHistory = [],
    source = 'mamasafe-chat',
    isEmergency = false
}) {
    if (!db || !message || !response) return null;

    const now = new Date();
    const cleanMessage = String(message || '').trim();
    const cleanResponse = String(response || '').trim();
    if (!cleanMessage || !cleanResponse || /^(thinking|hello! i'm your mamasafe assistant ai)/i.test(cleanMessage)) {
        return null;
    }

    const userId = user.id || user.userId || user.email || context.userId || 'guest-user';
    const userEmail = user.email || context.userEmail || '';
    const userName = user.displayName || user.name || context.userName || 'Guest User';
    const fingerprint = crypto
        .createHash('sha1')
        .update([
            String(userId || '').toLowerCase(),
            cleanMessage.toLowerCase(),
            cleanResponse.slice(0, 240).toLowerCase(),
            source
        ].join('|'))
        .digest('hex');

    try {
        return await db.collection('chatHistory').updateOne({
            chatKey: fingerprint
        }, {
            $set: {
                userId,
                userEmail,
                userName,
                message: cleanMessage,
                question: cleanMessage,
                response: cleanResponse,
                answer: cleanResponse,
                source,
                context,
                chatHistoryLength: Array.isArray(chatHistory) ? chatHistory.length : 0,
                isEmergency,
                timestamp: now,
                updatedAt: now
            },
            $setOnInsert: {
                chatKey: fingerprint,
                createdAt: now
            }
        }, { upsert: true });
    } catch (error) {
        console.warn('Could not save AI chat history:', error.message);
        return null;
    }
}

// API Routes
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        database: {
            connected: !!db,
            mode: useInMemoryDB ? 'in-memory' : activeMongoUriLabel,
            name: mongoConfig.dbName,
            persistent: !!db && !useInMemoryDB,
            uri: lastMongoDiagnostic || getMongoUriMetadata(),
            lastError: lastMongoError
        },
        ai: {
            groqConfigured: Boolean(process.env.GROQ_API_KEY),
            googleOAuthConfigured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
        },
        timestamp: new Date().toISOString()
    });
});

app.get('/api/test', (req, res) => {
    console.log('TEST endpoint hit!');
    res.json({ success: true, message: 'Test works!' });
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

function getAdminTokenSecret() {
    return process.env.JWT_SECRET || process.env.ADMIN_TOKEN_SECRET || 'admin-secret-key-change-in-production';
}

function base64UrlEncode(value) {
    return Buffer.from(JSON.stringify(value))
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

function base64UrlDecode(value) {
    const normalized = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(Buffer.from(normalized, 'base64').toString('utf8'));
}

function signAdminToken(admin) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
        username: admin.username,
        email: admin.email,
        name: admin.name,
        role: 'Super Admin',
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
    };
    const unsigned = `${base64UrlEncode(header)}.${base64UrlEncode(payload)}`;
    const signature = crypto
        .createHmac('sha256', getAdminTokenSecret())
        .update(unsigned)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    return `${unsigned}.${signature}`;
}

function verifyAdminToken(token) {
    const parts = String(token || '').split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSignature = crypto
        .createHmac('sha256', getAdminTokenSecret())
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    const actual = Buffer.from(signature);
    const expected = Buffer.from(expectedSignature);
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) {
        return null;
    }

    const payload = base64UrlDecode(encodedPayload);
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
    }
    return payload;
}

function getRequestAdmin(req) {
    return req.session?.admin || req.admin || null;
}

function requireAdmin(req, res, next) {
    // Check session first (for same-domain requests)
    if (req.session && req.session.admin) {
        return next();
    }

    // Check JWT token (for cross-domain requests)
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (token && token !== 'undefined') {
        try {
            const decoded = verifyAdminToken(token);
            if (!decoded) throw new Error('Invalid admin token');
            req.admin = decoded;
            return next();
        } catch (err) {
            // Token verification failed, fall through to error
        }
    }

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

function getCreatedUsersFilter(search = '') {
    const identityFilter = {
        $or: [
            { recordType: 'created-user' },
            { source: 'auth-signup' },
            { source: 'firebase-auth' },
            { source: 'local-auth' },
            { source: 'frontend-auth' },
            { source: 'auth-login' }
        ]
    };

    const query = String(search || '').trim();
    if (!query) return identityFilter;

    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    return {
        $and: [
            identityFilter,
            {
                $or: [
                    { email: regex },
                    { userEmail: regex },
                    { userId: regex },
                    { name: regex },
                    { username: regex },
                    { stage: regex },
                    { journey: regex },
                    { status: regex }
                ]
            }
        ]
    };
}

function getUserIdentity(user = {}) {
    return {
        id: user._id?.toString?.() || user.id || user.userId || user.email || '',
        name: user.name || user.displayName || user.username || user.profile?.name || user.profile?.firstName || 'Mother',
        email: user.email || user.userEmail || user.profile?.email || user.userId || '',
        stage: user.stage || user.journey || user.careStage || user.profile?.stage || '',
        status: user.status || 'active',
        pregnancyWeek: user.pregnancy_week || user.pregnancyWeek || user.currentWeek || '',
        createdAt: user.createdAt || user.savedAt || user.joinedAt || user.lastLoginAt || null,
        lastLoginAt: user.lastLoginAt || user.updatedAt || null,
        source: user.source || user.recordType || 'database'
    };
}

function isRealCreatedUserRecord(user = {}) {
    const identity = getUserIdentity(user);
    const email = normalizeUserEmail(identity.email);
    const id = String(identity.id || '').trim().toLowerCase();
    const source = String(identity.source || user.source || '').trim().toLowerCase();
    const name = normalizeUserName(identity.name);
    const createdByAuth = user.recordType === 'created-user'
        || ['auth-signup', 'firebase-auth', 'local-auth', 'frontend-auth', 'auth-login'].includes(source);

    if (!createdByAuth) return false;
    if (!email && !id && !name) return false;
    if (['guest-user', 'admin-broadcast', 'system'].includes(id)) return false;
    if (['guest@mamasafe.com', 'admin-broadcast', 'system@mamasafe.local'].includes(email)) return false;
    if (email.endsWith('@example.com') || email.endsWith('@test.com')) return false;
    if (/admin-notification|system|seed|demo/i.test(source)) return false;
    return true;
}

function isActiveUserRecord(user = {}) {
    const identity = user.adminIdentity || getUserIdentity(user);
    const status = String(identity.status || user.status || 'active').trim().toLowerCase();
    return !['suspended', 'inactive', 'disabled', 'blocked', 'deleted', 'removed', 'archived'].includes(status);
}

function normalizeUserEmail(value = '') {
    return String(value || '').trim().toLowerCase();
}

function normalizeUserName(value = '') {
    return String(value || '')
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase();
}

function escapeRegex(value = '') {
    return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getUserNormalizedEmail(user = {}) {
    return normalizeUserEmail(user.email || user.userEmail || user.profile?.email || user.userId || '');
}

function getUserNormalizedName(user = {}) {
    const identity = getUserIdentity(user);
    return normalizeUserName(identity.name);
}

function buildUserEmailQuery(email = '') {
    const normalizedEmail = normalizeUserEmail(email);
    if (!normalizedEmail) return [];
    const emailRegex = new RegExp(`^${escapeRegex(normalizedEmail)}$`, 'i');
    return [
        { normalizedEmail },
        { email: emailRegex },
        { userEmail: emailRegex },
        { userId: emailRegex },
        { id: emailRegex },
        { 'profile.email': emailRegex }
    ];
}

function buildUserNameQuery(name = '') {
    const normalizedName = normalizeUserName(name);
    if (!normalizedName || normalizedName === 'mother') return [];
    const nameRegex = new RegExp(`^${escapeRegex(normalizedName)}$`, 'i');
    return [
        { normalizedName },
        { name: nameRegex },
        { displayName: nameRegex },
        { username: nameRegex },
        { 'profile.name': nameRegex }
    ];
}

function userRecordIdSet(user = {}) {
    return new Set([
        user._id?.toString?.(),
        user.id,
        user.userId,
        user.email,
        user.userEmail
    ].filter(Boolean).map(value => String(value)));
}

function getUserDuplicateKey(user = {}) {
    const email = getUserNormalizedEmail(user);
    if (email) return `email:${email}`;
    const name = getUserNormalizedName(user);
    if (name && name !== 'mother') return `name:${name}`;
    const identity = getUserIdentity(user);
    return `id:${identity.id || crypto.createHash('sha1').update(JSON.stringify(user)).digest('hex')}`;
}

function buildDuplicateUserQuery(user = {}) {
    const identity = getUserIdentity(user);
    const clauses = [
        ...buildUserEmailQuery(identity.email),
        ...buildUserNameQuery(identity.name)
    ];
    if (!clauses.length && identity.id) clauses.push(...buildUserEmailQuery(identity.id), { id: identity.id }, { userId: identity.id });
    return clauses.length ? { $or: clauses } : getUserFilterById(identity.id);
}

function dedupeCreatedUsers(records = []) {
    const grouped = new Map();
    for (const record of records.filter(isRealCreatedUserRecord)) {
        const key = getUserDuplicateKey(record);
        const identity = getUserIdentity(record);
        const current = grouped.get(key);

        if (!current) {
            grouped.set(key, {
                ...record,
                adminIdentity: {
                    ...identity,
                    duplicateKey: key,
                    duplicateCount: 1,
                    duplicateIds: [record._id?.toString?.() || identity.id].filter(Boolean)
                }
            });
            continue;
        }

        const currentIdentity = current.adminIdentity || getUserIdentity(current);
        current.adminIdentity = {
            ...currentIdentity,
            createdAt: [currentIdentity.createdAt, identity.createdAt]
                .filter(Boolean)
                .sort((left, right) => new Date(left) - new Date(right))[0] || currentIdentity.createdAt || identity.createdAt,
            lastLoginAt: [currentIdentity.lastLoginAt, identity.lastLoginAt]
                .filter(Boolean)
                .sort((left, right) => new Date(right) - new Date(left))[0] || currentIdentity.lastLoginAt || identity.lastLoginAt,
            duplicateKey: key,
            duplicateCount: (currentIdentity.duplicateCount || 1) + 1,
            duplicateIds: [
                ...(currentIdentity.duplicateIds || []),
                record._id?.toString?.() || identity.id
            ].filter(Boolean)
        };
    }
    return [...grouped.values()];
}

async function getUniqueCreatedUsers(search = '', limit = 100, options = {}) {
    const filter = getCreatedUsersFilter(search);
    const records = await recentCollection('users', filter, Math.max(limit * 5, 500));
    const users = dedupeCreatedUsers(records);
    const filtered = options.activeOnly ? users.filter(isActiveUserRecord) : users;
    return filtered.slice(0, limit);
}

async function countUniqueCreatedUsers(search = '') {
    const filter = getCreatedUsersFilter(search);
    const records = await recentCollection('users', filter, 2000);
    return dedupeCreatedUsers(records).length;
}

async function countActiveCreatedUsers(search = '') {
    const filter = getCreatedUsersFilter(search);
    const records = await recentCollection('users', filter, 2000);
    return dedupeCreatedUsers(records).filter(isActiveUserRecord).length;
}

function getChatIdentityKey(chat = {}) {
    if (chat.chatKey) return `chatKey:${chat.chatKey}`;
    const user = String(chat.userId || chat.userEmail || '').trim().toLowerCase();
    const question = String(chat.question || chat.message || '').trim().toLowerCase();
    const answer = String(chat.answer || chat.response || '').trim().slice(0, 240).toLowerCase();
    if (!question || /^(thinking|hello! i'm your mamasafe assistant ai)/i.test(question)) return '';
    return crypto.createHash('sha1').update([user, question, answer, chat.source || ''].join('|')).digest('hex');
}

function dedupeAiChats(records = []) {
    const grouped = new Map();
    for (const record of records) {
        const key = getChatIdentityKey(record);
        if (!key || grouped.has(key)) continue;
        grouped.set(key, record);
    }
    return [...grouped.values()];
}

async function countUniqueAiChats() {
    const records = await recentCollection('chatHistory', {}, 5000);
    return dedupeAiChats(records).length;
}

async function findTakenUserIdentity({ email = '', name = '', excludeIds = [] } = {}) {
    const clauses = [
        ...buildUserEmailQuery(email),
        ...buildUserNameQuery(name)
    ];
    if (!clauses.length) return { taken: false, fields: [] };

    const excluded = new Set((Array.isArray(excludeIds) ? excludeIds : [excludeIds]).filter(Boolean).map(value => String(value)));
    const matches = await db.collection('users').find({ $or: clauses }).limit(20).toArray();
    const filtered = matches.filter(user => {
        const ids = userRecordIdSet(user);
        return ![...excluded].some(id => ids.has(id));
    });
    if (!filtered.length) return { taken: false, fields: [] };

    const normalizedEmail = normalizeUserEmail(email);
    const normalizedName = normalizeUserName(name);
    const fields = [];

    if (normalizedEmail && filtered.some(user => getUserNormalizedEmail(user) === normalizedEmail)) {
        fields.push('email');
    }
    if (normalizedName && normalizedName !== 'mother' && filtered.some(user => getUserNormalizedName(user) === normalizedName)) {
        fields.push('name');
    }

    return {
        taken: fields.length > 0,
        fields,
        existing: filtered[0] || null
    };
}

function getUserFilterById(id) {
    if (ObjectId.isValid(id)) return { _id: new ObjectId(id) };
    return {
        $or: [
            { id },
            { userId: id },
            { email: id },
            { userEmail: id }
        ]
    };
}

async function writeAdminAudit(record = {}) {
    if (!db) return;
    try {
        await db.collection('admin_audit').insertOne({
            ...record,
            createdAt: record.createdAt || new Date()
        });
    } catch (error) {
        console.warn('Admin audit write skipped:', error.message);
    }
}

app.post('/api/admin-panel/login', async (req, res) => {
    try {
        const { email, username, password } = req.body || {};
        const admin = getAdminConfig();
        const identifier = String(username || email || '').trim().toLowerCase();
        const ok = (identifier === admin.username.toLowerCase() || identifier === admin.email.toLowerCase()) && String(password || '') === admin.password;
        await writeAdminAudit({
            type: ok ? 'admin-login-success' : 'admin-login-failed',
            username: username || email || '',
            ip: req.ip
        });
        if (!ok) return res.status(401).json({ error: 'Invalid admin credentials' });

        // Set session for same-domain use when sessions are available.
        const sessionAdmin = { username: admin.username, email: admin.email, name: admin.name, role: 'Super Admin', loginAt: new Date().toISOString() };
        if (req.session) {
            req.session.admin = sessionAdmin;
        }

        // Also generate a signed token for cross-domain use.
        const token = signAdminToken(admin);

        res.json({
            admin: sessionAdmin,
            token: token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin-panel/logout', requireAdmin, (req, res) => {
    try {
        // Clear session if it exists (for same-domain requests)
        if (req.session && req.session.admin) {
            req.session.admin = null;
        }
        // JWT tokens are stateless, so no server-side cleanup needed
        // The client just removes the token from localStorage
        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin-panel/me', (req, res) => {
    // Check session first (for same-domain requests)
    if (req.session?.admin) {
        return res.json({ admin: req.session.admin });
    }

    // Check JWT token (for cross-domain requests)
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (token && token !== 'undefined') {
        try {
            const decoded = verifyAdminToken(token);
            if (!decoded) throw new Error('Invalid admin token');
            return res.json({
                admin: {
                    username: decoded.username,
                    email: decoded.email,
                    role: decoded.role,
                    name: decoded.name || 'Admin'
                }
            });
        } catch (err) {
            // Token verification failed, fall through to error
        }
    }

    res.status(401).json({ error: 'Admin login required' });
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
            activeUsers,
            activityCount,
            aiChats,
            helpRequests,
            emergencyReports,
            notificationsSent,
            recentEvents,
            recentUsers,
            recentHelp
        ] = await Promise.all([
            countUniqueCreatedUsers(),
            countActiveCreatedUsers(),
            countCollection('activities'),
            countUniqueAiChats(),
            countCollection('activities', { type: { $in: ['help-request', 'support-message'] } }),
            countCollection('activities', emergencyFilter),
            countCollection('notifications', { type: { $in: ['admin-notification', 'announcement', 'settings'] } }),
            recentCollection('app_events', {}, 15),
            getUniqueCreatedUsers('', 8, { activeOnly: true }),
            recentCollection('activities', { type: { $in: ['help-request', 'support-message'] } }, 8)
        ]);

        res.json({
            stats: {
                totalUsers,
                realUsers: totalUsers,
                createdUsers: totalUsers,
                activeUsers,
                activeMothers: activeUsers,
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
        const search = req.query.search || '';
        const users = await getUniqueCreatedUsers(search, 100);
        res.json({
            users,
            count: users.length,
            deduped: true,
            message: 'Users are grouped by matching email or exact name.'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.patch('/api/admin-panel/users/:id/status', requireAdmin, checkDBConnection, async (req, res) => {
    try {
        const { status = 'active' } = req.body || {};
        const id = req.params.id;
        const filter = getUserFilterById(id);
        const user = await db.collection('users').findOne(filter);
        const updateFilter = user ? buildDuplicateUserQuery(user) : filter;
        const result = await db.collection('users').updateMany(updateFilter, { $set: { status, updatedAt: new Date() } });
        await db.collection('admin_audit').insertOne({ type: 'user-status-updated', target: id, status, admin: getRequestAdmin(req)?.email || 'admin', createdAt: new Date() });
        res.json({ modifiedCount: result.modifiedCount, matchedCount: result.matchedCount, deduped: !!user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Edit user information
app.patch('/api/admin-panel/users/:id', requireAdmin, checkDBConnection, async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = req.body || {};
        const filter = getUserFilterById(id);
        const user = await db.collection('users').findOne(filter);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const currentIdentity = getUserIdentity(user);
        const requestedName = updateData.name ?? updateData.displayName ?? currentIdentity.name;
        const requestedEmail = updateData.email ?? updateData.userEmail ?? currentIdentity.email;
        const normalizedCurrentEmail = normalizeUserEmail(currentIdentity.email);
        const normalizedRequestedEmail = normalizeUserEmail(requestedEmail);
        const normalizedCurrentName = normalizeUserName(currentIdentity.name);
        const normalizedRequestedName = normalizeUserName(requestedName);

        if (
            (normalizedRequestedEmail && normalizedRequestedEmail !== normalizedCurrentEmail)
            || (normalizedRequestedName && normalizedRequestedName !== normalizedCurrentName)
        ) {
            const taken = await findTakenUserIdentity({
                email: normalizedRequestedEmail !== normalizedCurrentEmail ? requestedEmail : '',
                name: normalizedRequestedName !== normalizedCurrentName ? requestedName : '',
                excludeIds: [...userRecordIdSet(user)]
            });

            if (taken.taken) {
                return res.status(409).json({
                    error: `${taken.fields.join(' and ')} already taken`,
                    code: 'USER_IDENTITY_TAKEN',
                    fields: taken.fields
                });
            }
        }

        // Only allow updating specific fields
        const allowedFields = ['name', 'email', 'userEmail', 'status', 'pregnancy_week', 'pregnancyWeek', 'stage', 'journey'];
        const updateObj = { updatedAt: new Date() };

        for (const field of allowedFields) {
            if (field in updateData) {
                updateObj[field] = updateData[field];
            }
        }
        updateObj.normalizedEmail = normalizeUserEmail(updateObj.email || updateObj.userEmail || currentIdentity.email);
        updateObj.normalizedName = normalizeUserName(updateObj.name || currentIdentity.name);

        const result = await db.collection('users').updateMany(buildDuplicateUserQuery(user), { $set: updateObj });
        await db.collection('admin_audit').insertOne({ type: 'user-edited', target: id, changes: updateData, admin: getRequestAdmin(req)?.email || 'admin', createdAt: new Date() });
        res.json({ modifiedCount: result.modifiedCount, matchedCount: result.matchedCount, deduped: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete user
app.delete('/api/admin-panel/users/:id', requireAdmin, checkDBConnection, async (req, res) => {
    try {
        const id = req.params.id;
        const filter = getUserFilterById(id);

        // Get user info before deleting for audit log
        const user = await db.collection('users').findOne(filter);

        // Delete user and related data
        const deleteFilter = user ? buildDuplicateUserQuery(user) : filter;
        const userResult = await db.collection('users').deleteMany(deleteFilter);
        if (user?._id) {
            await db.collection('chatHistory').deleteMany({ userId: user._id.toString() });
            await db.collection('activities').deleteMany({ userId: user._id.toString() });
        }

        await db.collection('admin_audit').insertOne({ type: 'user-deleted', target: id, userName: user?.name || 'Unknown', admin: getRequestAdmin(req)?.email || 'admin', createdAt: new Date() });
        res.json({ deletedCount: userResult.deletedCount, deduped: !!user });
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
        const records = await recentCollection('chatHistory', {}, 500);
        const chats = dedupeAiChats(records).slice(0, 100);
        res.json({ chats, count: chats.length, deduped: true });
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
        const now = new Date();
        const notification = {
            userId: 'admin-broadcast',
            type: 'admin-notification',
            title: title || 'Mamasafe announcement',
            message,
            audience,
            priority: audience === 'emergency' && priority === 'normal' ? 'urgent' : priority,
            status: 'unread',
            source: 'admin',
            admin: getRequestAdmin(req)?.email || 'admin',
            savedAt: now.toISOString(),
            createdAt: now
        };
        const savedNotification = await insertRecordWithEvent('notifications', notification, 'admin-notification-sent');
        const savedActivity = await insertRecordWithEvent('activities', {
            ...notification,
            notificationId: savedNotification._id
        }, 'admin-notification-activity');
        res.json({ success: true, notification: savedNotification, activity: savedActivity });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health Chatbot Service - Llama 3.3 70B via Groq
const { processHealthQuery, checkEmergencyKeywords, generateHealthSuggestions } = require('./services/healthChatbot');
const { processImageWithGroq } = require('./services/groqChatbot');
const { assessPregnancyRiskWithGroq } = require('./services/groqService');
const {
    analyzePregnancySymptoms,
    answerPregnancyQuestion,
    evaluatePregnancyDecisionSupport,
    getPregnancyRiskTrends,
    getPregnancyRiskTrainingSummary,
    getPregnancyTensorflowTrainingData,
    getPregnancyWeekGuide,
    getPregnancyWeekPlanner,
    getPregnancyDatasetStatus,
    getPregnancyCollectionPreview,
    getWhoPregnancyDataset,
    getPregnancyPdfDatasets,
    recordPregnancyChatSession,
    ensurePregnancyKnowledgeBase,
    detectUrgentQuestion
} = require('./services/pregnancyRag');
const {
    trainMaternalRiskAiModel,
    predictMaternalRiskWithSavedModel,
    evaluateMaternalRiskAiAccuracy,
    getMaternalRiskAiModelStatus
} = require('./services/maternalRiskAiModel');
const {
    predictWithUnifiedModel
} = require('./services/unifiedHealthAiModel');
const {
    DATASET_USE
} = require('./services/unifiedPregnancyAiModel');
const {
    runMamasafeAiPipeline
} = require('./services/mamasafeAiPipeline');
const {
    getAiModelMetadata
} = require('./config/aiModel');
const { registerPregnancyToolRoutes } = require('./services/pregnancyTools');

// Universal Llama 3.3 70B service for all AI functions
const {
    processBabyNamesWithAI,
    processNutritionWithAI,
    processSleepWithAI,
    processAppointmentsWithAI,
    processMentalHealthWithAI,
    processCustomFunctionWithAI
} = require('./services/universalGroqAI');
const { createChatRoutes } = require('./routes/chatRoutes');

const mamasafeAiRouteDependencies = {
    getDb: () => db,
    checkDbConnection: checkDBConnection,
    saveAIChatHistory,
    recordPregnancyChatSession
};

app.use('/api/chat', createChatRoutes(mamasafeAiRouteDependencies));
app.use('/api/ai', createChatRoutes(mamasafeAiRouteDependencies));

app.post(['/api/mamasafe-chat', '/api/mamacare-chat'], async (req, res) => {
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
        await saveAIChatHistory({
            user,
            message,
            response,
            context: userContext,
            chatHistory,
            source: 'mamasafe-chat'
        });
        res.json({ reply: response });
    } catch (error) {
        console.error('Health Chatbot Error:', error);
        res.status(500).json({ error: 'Failed to process chat message', details: error.message });
    }
});

const { chatWithMessages } = require('./services/groqChatbot');
const {
    analyzeActivity,
    analyzeFertility,
    analyzeNutrition,
    analyzeSleepPatterns
} = require('./services/llamaAnalysis');

app.post('/api/ai-chat', async (req, res) => {
    try {
        const { messages, temperature, maxTokens } = req.body || {};
        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'messages array is required' });
        }

        const response = await chatWithMessages(messages, {
            temperature,
            maxTokens
        });

        res.json({ success: true, response, reply: response });
    } catch (error) {
        console.error('AI chat error:', error);
        res.status(500).json({ error: 'Failed to process AI chat', details: error.message });
    }
});

app.post('/api/ai-sleep-analysis', async (req, res) => {
    try {
        const result = await analyzeSleepPatterns(req.body || {});
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/ai-nutrition-analysis', async (req, res) => {
    try {
        const result = await analyzeNutrition(req.body || {});
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/ai-fertility-analysis', async (req, res) => {
    try {
        const result = await analyzeFertility(req.body || {});
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/ai-activity-analysis', async (req, res) => {
    try {
        const result = await analyzeActivity(req.body || {});
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post(['/api/mamasafe-analyze-image', '/api/mamacare-analyze-image'], async (req, res) => {
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

        await saveAIChatHistory({
            user,
            message: prompt || 'Image analysis request',
            response: analysis,
            context: { ...userContext, mimeType },
            source: 'mamasafe-image-analysis'
        });

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
            healthConcerns: user?.healthConcerns
        };

        const response = await processBabyNamesWithAI(query, gender, origin, style, userContext);
        res.json(response);
    } catch (error) {
        console.error('AI Baby Names Error:', error);
        res.status(500).json({ error: 'Failed to process baby names', details: error.message });
    }
});

// AI Search All Hospitals & Pharmacies endpoint
app.post('/api/ai-search-facilities', async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        // Create a structured list of all hospitals and pharmacies
        // For this, we'll use the same structure as the frontend (we can define it here too for consistency)
        const allFacilities = [
            // --- HOSPITALS ---
            { type: 'hospital', name: 'King Faisal Hospital', district: 'Gasabo', city: 'Kigali', province: 'Kigali City', address: 'KG 544 St, Gasabo, Kigali', phone: '+250788000101', hours: '24 hours', services: ['Emergency', 'Maternity', 'ICU'], lat: -1.9365, lng: 30.0920 },
            { type: 'hospital', name: 'Rwanda Military Hospital', district: 'Kicukiro', city: 'Kigali', province: 'Kigali City', address: 'Kanombe, Kicukiro, Kigali', phone: '+250788000103', hours: '24 hours', services: ['Emergency', 'Maternity', 'Military Care'], lat: -1.9710, lng: 30.1400 },
            { type: 'hospital', name: 'Kibagabaga Hospital', district: 'Gasabo', city: 'Kigali', province: 'Kigali City', address: 'Kibagabaga, Gasabo, Kigali', phone: '+250788000104', hours: '24 hours', services: ['Emergency', 'Maternity'], lat: -1.9185, lng: 30.1140 },
            { type: 'hospital', name: 'Muhima Hospital', district: 'Nyarugenge', city: 'Kigali', province: 'Kigali City', address: 'Muhima, Nyarugenge, Kigali', phone: '+250788000105', hours: '24 hours', services: ['Emergency', 'Maternity'], lat: -1.9412, lng: 30.0620 },
            { type: 'hospital', name: 'Butare University Teaching Hospital', district: 'Huye', city: 'Butare', province: 'Southern Province', address: 'Butare, Huye', phone: '+250788400001', hours: '24 hours', services: ['Emergency', 'Maternity', 'Teaching'], lat: -2.5985, lng: 29.7328 },
            { type: 'hospital', name: 'Ruhengeri Hospital', district: 'Musanze', city: 'Ruhengeri', province: 'Northern Province', address: 'Ruhengeri, Musanze', phone: '+250788400002', hours: '24 hours', services: ['Emergency', 'Maternity'], lat: -1.4975, lng: 29.6333 },
            { type: 'hospital', name: 'Gisenyi Hospital', district: 'Rubavu', city: 'Gisenyi', province: 'Western Province', address: 'Gisenyi, Rubavu', phone: '+250788400003', hours: '24 hours', services: ['Emergency', 'Maternity'], lat: -1.6933, lng: 29.2417 },
            { type: 'hospital', name: 'Nyagatare Hospital', district: 'Nyagatare', city: 'Nyagatare', province: 'Eastern Province', address: 'Nyagatare Town', phone: '+250788400004', hours: '24 hours', services: ['Emergency', 'Maternity'], lat: -1.3050, lng: 30.2700 },
            
            // --- PHARMACIES ---
            { type: 'pharmacy', name: 'City Pharmacy', district: 'Nyarugenge', city: 'Kigali', province: 'Kigali City', address: 'KN 4 St, Nyarugenge, Kigali', phone: '+250788300001', hours: '08:00 - 22:00', services: ['Prescription', 'Over-the-counter', 'Vaccinations'], lat: -1.9520, lng: 30.0605 },
            { type: 'pharmacy', name: 'Good Life Pharmacy', district: 'Gasabo', city: 'Kigali', province: 'Kigali City', address: 'KG 7 Ave, Gasabo, Kigali', phone: '+250788300002', hours: '08:00 - 22:00', services: ['Prescription', 'Over-the-counter', 'Health checks'], lat: -1.9200, lng: 30.1020 },
            { type: 'pharmacy', name: 'HealthPlus Pharmacy', district: 'Kicukiro', city: 'Kigali', province: 'Kigali City', address: 'KK 508 St, Kicukiro, Kigali', phone: '+250788300003', hours: '08:00 - 22:00', services: ['Prescription', 'Over-the-counter', 'Delivery'], lat: -1.9850, lng: 30.1080 },
            { type: 'pharmacy', name: 'Primecare Pharmacy', district: 'Gasabo', city: 'Kigali', province: 'Kigali City', address: 'KG 2 Ave, Kigali', phone: '+250788300004', hours: '07:00 - 23:00', services: ['Prescription', 'Over-the-counter', '24h on-call'], lat: -1.9300, lng: 30.0850 },
            { type: 'pharmacy', name: 'Aegis Pharmacy', district: 'Gasabo', city: 'Kigali', province: 'Kigali City', address: 'KN 11 St, Remera, Kigali', phone: '+250788300005', hours: '07:00 - 23:00', services: ['Prescription', 'Over-the-counter', 'Delivery'], lat: -1.9550, lng: 30.1200 },
            { type: 'pharmacy', name: 'Zenith Pharmacy', district: 'Kicukiro', city: 'Kigali', province: 'Kigali City', address: 'KK 1 Rd, Kigali', phone: '+250788300006', hours: '08:00 - 22:00', services: ['Prescription', 'Over-the-counter'], lat: -1.9700, lng: 30.1100 },
            { type: 'pharmacy', name: 'Pharmacy One', district: 'Nyarugenge', city: 'Kigali', province: 'Kigali City', address: 'KN 3 Ave, Kigali', phone: '+250788300007', hours: '08:00 - 22:00', services: ['Prescription', 'Over-the-counter'], lat: -1.9480, lng: 30.0550 },
            { type: 'pharmacy', name: 'Butare Main Pharmacy', district: 'Huye', city: 'Butare', province: 'Southern Province', address: 'Main Street, Butare', phone: '+250788500001', hours: '08:00 - 21:00', services: ['Prescription', 'Over-the-counter'], lat: -2.5985, lng: 29.7328 },
            { type: 'pharmacy', name: 'Musanze Community Pharmacy', district: 'Musanze', city: 'Ruhengeri', province: 'Northern Province', address: 'Main Road, Ruhengeri', phone: '+250788500002', hours: '08:00 - 21:00', services: ['Prescription', 'Over-the-counter'], lat: -1.4975, lng: 29.6333 },
            { type: 'pharmacy', name: 'Rubavu Pharmacy', district: 'Rubavu', city: 'Gisenyi', province: 'Western Province', address: 'Gisenyi Main Road', phone: '+250788500003', hours: '08:00 - 21:00', services: ['Prescription', 'Over-the-counter'], lat: -1.6933, lng: 29.2417 },
            { type: 'pharmacy', name: 'Nyagatare Pharmacy', district: 'Nyagatare', city: 'Nyagatare', province: 'Eastern Province', address: 'Nyagatare Town', phone: '+250788500004', hours: '08:00 - 21:00', services: ['Prescription', 'Over-the-counter'], lat: -1.3050, lng: 30.2700 }
        ];

        // Add district pharmacies (one per district)
        const rwandaDistricts = [
            { district: 'Gasabo', city: 'Kigali', province: 'Kigali City', lat: -1.9500, lng: 30.1000 },
            { district: 'Kicukiro', city: 'Kigali', province: 'Kigali City', lat: -1.9800, lng: 30.1100 },
            { district: 'Nyarugenge', city: 'Kigali', province: 'Kigali City', lat: -1.9500, lng: 30.0600 },
            { district: 'Huye', city: 'Butare', province: 'Southern Province', lat: -2.5985, lng: 29.7328 },
            { district: 'Musanze', city: 'Ruhengeri', province: 'Northern Province', lat: -1.4975, lng: 29.6333 },
            { district: 'Rubavu', city: 'Gisenyi', province: 'Western Province', lat: -1.6933, lng: 29.2417 },
            { district: 'Nyagatare', city: 'Nyagatare', province: 'Eastern Province', lat: -1.3050, lng: 30.2700 },
            { district: 'Kayonza', city: 'Kayonza', province: 'Eastern Province', lat: -1.9500, lng: 30.6667 },
            { district: 'Rwamagana', city: 'Rwamagana', province: 'Eastern Province', lat: -1.9667, lng: 30.4333 },
            { district: 'Ngoma', city: 'Ngoma', province: 'Eastern Province', lat: -2.3667, lng: 30.3667 },
            { district: 'Ngororero', city: 'Ngororero', province: 'Western Province', lat: -1.8667, lng: 29.6167 },
            { district: 'Nyabihu', city: 'Nyabihu', province: 'Western Province', lat: -1.6500, lng: 29.5500 },
            { district: 'Nyamasheke', city: 'Nyamasheke', province: 'Western Province', lat: -2.3500, lng: 29.1667 },
            { district: 'Rutsiro', city: 'Rutsiro', province: 'Western Province', lat: -2.0000, lng: 29.1333 },
            { district: 'Karongi', city: 'Karongi', province: 'Western Province', lat: -2.0833, lng: 29.3667 },
            { district: 'Kirehe', city: 'Kirehe', province: 'Eastern Province', lat: -2.1833, lng: 30.8167 },
            { district: 'Ngororero', city: 'Ngororero', province: 'Western Province', lat: -1.8667, lng: 29.6167 },
            { district: 'Burera', city: 'Burera', province: 'Northern Province', lat: -1.4167, lng: 29.8500 },
            { district: 'Gakenke', city: 'Gakenke', province: 'Northern Province', lat: -1.6833, lng: 29.7500 },
            { district: 'Gicumbi', city: 'Gicumbi', province: 'Northern Province', lat: -1.6833, lng: 29.9667 },
            { district: 'Rulindo', city: 'Rulindo', province: 'Northern Province', lat: -1.7500, lng: 30.0667 },
            { district: 'Kamonyi', city: 'Kamonyi', province: 'Southern Province', lat: -2.1333, lng: 29.9167 },
            { district: 'Muhanga', city: 'Gitarama', province: 'Southern Province', lat: -2.1167, lng: 29.7500 },
            { district: 'Nyaruguru', city: 'Nyaruguru', province: 'Southern Province', lat: -2.6833, lng: 29.5167 },
            { district: 'Nyamagabe', city: 'Nyamagabe', province: 'Southern Province', lat: -2.4333, lng: 29.5167 },
            { district: 'Ruhango', city: 'Ruhango', province: 'Southern Province', lat: -2.2333, lng: 29.7833 },
            { district: 'Gisagara', city: 'Gisagara', province: 'Southern Province', lat: -2.5000, lng: 29.9167 },
            { district: 'Nyanza', city: 'Nyanza', province: 'Southern Province', lat: -2.3500, lng: 29.7833 },
            { district: 'Bugesera', city: 'Bugesera', province: 'Eastern Province', lat: -2.0333, lng: 30.2333 },
            { district: 'Gatsibo', city: 'Gatsibo', province: 'Eastern Province', lat: -1.5167, lng: 30.5667 },
            { district: 'Kabarore', city: 'Kabarole', province: 'Eastern Province', lat: -1.7333, lng: 30.5167 }
        ];

        rwandaDistricts.forEach((item, index) => {
            allFacilities.push({
                type: 'hospital',
                name: `${item.district} District Hospital`,
                district: item.district,
                city: item.city,
                province: item.province,
                address: `${item.city}, ${item.district} District`,
                phone: `+2507884${String(index + 10).padStart(5, '0')}`,
                hours: '24 hours',
                services: ['Emergency', 'Maternity', 'District Hospital', 'Prenatal care'],
                lat: item.lat + 0.003,
                lng: item.lng + 0.003
            });
            allFacilities.push({
                type: 'pharmacy',
                name: `${item.district} Community Pharmacy`,
                district: item.district,
                city: item.city,
                province: item.province,
                address: `${item.city}, ${item.district} District`,
                phone: `+2507886${String(index + 10).padStart(5, '0')}`,
                hours: '08:00 - 20:00',
                services: ['Prescription', 'Over-the-counter', 'Health advice'],
                lat: item.lat - 0.002,
                lng: item.lng - 0.002
            });
        });

        // Use Llama AI to find relevant facilities
        const systemPrompt = `You are an expert healthcare search assistant for Rwanda. You have access to all hospitals and pharmacies in Rwanda.
Here is the list of all facilities in JSON format:
${JSON.stringify(allFacilities, null, 2)}

Your task:
- Given a user's search query, find the most relevant facilities
- Return ONLY a JSON object with a key "results" which is an array of the top 10 most relevant facilities (include all fields from the original data)
- Do NOT include any other text, explanations, or markdown
- Keep the JSON valid and properly formatted`;

        const responseText = await chatWithGroq(systemPrompt, query, { maxTokens: 4000, temperature: 0.3 });

        // Parse the AI's response
        let parsedResponse;
        try {
            const match = responseText.match(/\{[\s\S]*\}/);
            if (match) {
                parsedResponse = JSON.parse(match[0]);
            } else {
                throw new Error('No JSON found');
            }
        } catch (e) {
            console.error('Failed to parse AI response:', e);
            // Fallback to simple keyword search if AI fails
            const queryLower = query.toLowerCase();
            const fallbackResults = allFacilities.filter(f =>
                f.name.toLowerCase().includes(queryLower) ||
                f.district.toLowerCase().includes(queryLower) ||
                f.city.toLowerCase().includes(queryLower) ||
                f.province.toLowerCase().includes(queryLower) ||
                f.services.some(s => s.toLowerCase().includes(queryLower))
            ).slice(0, 10);
            parsedResponse = { results: fallbackResults };
        }

        res.json({
            success: true,
            query: query,
            results: parsedResponse.results || [],
            aiModel: getAiModelMetadata().model
        });
    } catch (error) {
        console.error('AI Facilities Search Error:', error);
        res.status(500).json({ error: 'Failed to search facilities', details: error.message });
    }
});

// AI Pregnancy Tracking endpoint
app.post('/api/ai-pregnancy-tracking', checkDBConnection, async (req, res) => {
    try {
        const { week, symptoms, concerns } = req.body;

        if (!week) {
            return res.status(400).json({ error: 'Pregnancy week is required' });
        }

        let user = req.user || req.session.user;
        const question = [
            concerns || `Create a practical pregnancy briefing for week ${week}.`,
            symptoms ? `Symptoms or notes: ${symptoms}.` : '',
            'Include baby development, mother changes, priority actions, and when to contact a clinician.'
        ].filter(Boolean).join(' ');

        const result = await runMamasafeAiPipeline(db, {
            message: question,
            question,
            week,
            symptoms,
            limit: 5
        });
        const resultMatches = result.matches || result.rag?.documents || [];

        await recordPregnancyChatSession(db, {
            user: user || {
                id: 'guest-user',
                email: 'guest@mamasafe.com',
                displayName: 'Guest User',
                name: 'Guest User'
            },
            question,
            answer: result.answer,
            week,
            symptoms,
            matches: resultMatches,
            urgent: Boolean(result.emergency || result.urgent)
        });

        res.json({
            success: true,
            response: result.answer,
            reply: result.answer,
            answer: result.answer,
            matches: resultMatches,
            urgent: result.emergency || result.urgent,
            safetyOverride: result.safetyOverride,
            model: getAiModelMetadata().model,
            aiModel: getAiModelMetadata(),
            retrievalModel: result.rag?.retrievalMode || result.retrievalModel,
            datasetUse: result.datasetUse || DATASET_USE,
            rag: result.rag,
            retrievedAt: result.retrievedAt,
            source: 'pregnancy-llama-groq-ai'
        });
    } catch (error) {
        console.error('AI Pregnancy Tracking Error:', error);
        res.status(500).json({ error: 'Failed to process pregnancy data', details: error.message });
    }
});

async function handlePregnancyRiskPrediction(req, res) {
    try {
        const {
            age,
            systolic,
            systolicBP,
            diastolic,
            diastolicBP,
            glucose,
            bloodSugar,
            temp,
            bodyTemp,
            heartRate,
            bmi,
            previousComplications,
            preexistingDiabetes,
            gestationalDiabetes,
            mentalHealth,
            week,
            symptoms,
            tfjsPrediction
        } = req.body || {};
        const user = req.user || req.session.user || {
            id: 'guest-user',
            email: 'guest@mamasafe.com',
            displayName: 'Guest User',
            name: 'Guest User'
        };
        const riskInput = {
            age,
            systolicBP: systolicBP ?? systolic,
            diastolicBP: diastolicBP ?? diastolic,
            bloodSugar: bloodSugar ?? glucose,
            bodyTemp: bodyTemp ?? temp,
            heartRate,
            bmi,
            previousComplications,
            preexistingDiabetes,
            gestationalDiabetes,
            mentalHealth
        };
        const primaryTfjsPrediction = await getMaternalRiskTensorflowPrediction(riskInput, tfjsPrediction, {
            symptoms,
            week
        });

        const evaluation = await evaluatePregnancyDecisionSupport(db, {
            user,
            ...riskInput,
            week,
            symptoms,
            tfjsPrediction: primaryTfjsPrediction
        });
        attachMaternalRiskTensorflowIdentity(evaluation, { week, symptoms });

        res.json({
            success: true,
            prediction: evaluation.prediction,
            confidenceScore: evaluation.confidenceScore,
            rawDistribution: evaluation.rawDistribution,
            model: evaluation.model,
            aiModel: evaluation.aiModel,
            aiRisk: evaluation.aiRisk,
            riskAssessment: evaluation.riskAssessment,
            symptomAnalysis: evaluation.symptomAnalysis,
            datasetUse: evaluation.datasetUse,
            probabilitySource: evaluation.probabilitySource,
            groqUsed: false,
            tensorflowUsed: evaluation.tensorflowUsed,
            tfjsPrediction: evaluation.tfjsPrediction,
            urgent: evaluation.urgent,
            evaluation,
            retrievedAt: evaluation.retrievedAt
        });
    } catch (error) {
        console.error('Pregnancy risk prediction error:', error);
        const status = /missing|invalid/i.test(error.message) ? 400 : 500;
        res.status(status).json({
            error: 'Failed to predict pregnancy risk',
            details: error.message
        });
    }
}

async function getMaternalRiskTensorflowPrediction(input = {}, clientPrediction = null, context = {}) {
    const clientLooksLikeSavedModel = clientPrediction?.prediction
        && /backend|saved|@tensorflow|mamasafe-maternal-risk-custom-ai/i.test([
            clientPrediction.runtime,
            clientPrediction.fallbackSource,
            clientPrediction.model
        ].filter(Boolean).join(' '));

    if (clientLooksLikeSavedModel) {
        return {
            ...clientPrediction,
            model: clientPrediction.model || 'mamasafe-maternal-risk-custom-ai',
            runtime: clientPrediction.runtime || '@tensorflow/tfjs',
            fallbackSource: clientPrediction.fallbackSource || 'backend-saved-tensorflow-model'
        };
    }

    if (String(context.symptoms || '').trim()) {
        try {
            const unifiedPrediction = await predictWithUnifiedModel({
                ...input,
                symptoms: context.symptoms,
                week: context.week
            });
            return {
                ...unifiedPrediction,
                model: unifiedPrediction.model || 'mamasafe-unified-health-ai-v2',
                runtime: unifiedPrediction.runtime || '@tensorflow/tfjs',
                backend: unifiedPrediction.backend || 'cpu',
                fallbackSource: 'backend-saved-unified-health-tensorflow-model',
                sourceCollection: unifiedPrediction.sourceCollection || 'maternal_health_risk_records+symptoms'
            };
        } catch (error) {
            if (!clientPrediction?.prediction) {
                console.warn('Saved unified health TensorFlow.js model unavailable:', error.message);
            }
        }
    }

    try {
        const prediction = await predictMaternalRiskWithSavedModel(input);
        return {
            ...prediction,
            model: prediction.model || 'mamasafe-maternal-risk-custom-ai',
            runtime: prediction.runtime || '@tensorflow/tfjs',
            fallbackSource: 'backend-saved-tensorflow-model'
        };
    } catch (error) {
        if (clientPrediction?.prediction) {
            return {
                ...clientPrediction,
                model: clientPrediction.model || 'tensorflowjs-maternal-risk-classifier',
                fallbackSource: clientPrediction.fallbackSource || 'client-tensorflowjs-fallback',
                backendModelError: error.message
            };
        }
        console.warn('Saved maternal-risk TensorFlow.js model unavailable:', error.message);
        return null;
    }
}

function getMaternalRiskTensorflowMetadata(tfjsPrediction = {}) {
    return {
        provider: 'tensorflowjs',
        providerLabel: 'TensorFlow.js',
        model: tfjsPrediction?.model || 'mamasafe-maternal-risk-custom-ai',
        displayName: 'Maternal Risk TensorFlow.js Model',
        runtime: tfjsPrediction?.runtime || '@tensorflow/tfjs',
        backend: tfjsPrediction?.backend || 'cpu',
        sourceCollection: tfjsPrediction?.sourceCollection || 'maternal_health_risk_records'
    };
}

function attachMaternalRiskTensorflowIdentity(evaluation = {}, { week = '', symptoms = '' } = {}) {
    const tfjsPrediction = evaluation.tfjsPrediction || {};
    const aiModel = getMaternalRiskTensorflowMetadata(tfjsPrediction);
    evaluation.model = aiModel.model;
    evaluation.aiModel = aiModel;
    evaluation.groqUsed = false;
    evaluation.llamaRisk = null;
    evaluation.transformerRisk = null;
    evaluation.aiRisk = {
        answer: buildMaternalRiskTensorflowGuidanceAnswer({
            evaluation,
            metrics: evaluation.metrics || {},
            tfjs: tfjsPrediction,
            week,
            symptoms
        }),
        model: aiModel.model,
        aiModel,
        datasetUse: evaluation.datasetUse,
        riskAssessment: evaluation.riskAssessment || null,
        symptomAnalysis: evaluation.symptomAnalysis || null,
        urgent: Boolean(evaluation.urgent),
        groqUsed: false,
        task: 'risk',
        taskLabel: 'maternal risk TensorFlow.js model'
    };
    return evaluation;
}

function coreRiskRank(riskClass = 'low') {
    const normalized = String(riskClass || '').toLowerCase();
    if (normalized.includes('high')) return 3;
    if (normalized.includes('mid') || normalized.includes('medium')) return 2;
    return 1;
}

function coreRiskClass(value = '') {
    const normalized = String(value || '').toLowerCase();
    if (normalized.includes('high')) return 'high';
    if (normalized.includes('mid') || normalized.includes('medium')) return 'mid';
    return 'low';
}

function coreDistributionForClass(riskClass = 'low', confidence = 0.72) {
    const safeConfidence = Math.max(0.05, Math.min(0.97, Number(confidence) || 0.72));
    if (riskClass === 'high') {
        return {
            highRisk: safeConfidence,
            midRisk: Number(((1 - safeConfidence) * 0.72).toFixed(4)),
            lowRisk: Number(((1 - safeConfidence) * 0.28).toFixed(4))
        };
    }
    if (riskClass === 'mid') {
        return {
            highRisk: Number(((1 - safeConfidence) * 0.35).toFixed(4)),
            midRisk: safeConfidence,
            lowRisk: Number(((1 - safeConfidence) * 0.65).toFixed(4))
        };
    }
    return {
        highRisk: Number(((1 - safeConfidence) * 0.22).toFixed(4)),
        midRisk: Number(((1 - safeConfidence) * 0.5).toFixed(4)),
        lowRisk: safeConfidence
    };
}

function buildMaternalRiskTensorflowGuidanceAnswer({
    evaluation = {},
    metrics = {},
    tfjs = {},
    week = '',
    symptoms = ''
} = {}) {
    const risk = evaluation.risk || {};
    const riskLevel = risk.riskLevel || evaluation.prediction || tfjs.prediction || 'risk pending';
    const riskClass = coreRiskClass(risk.riskClass || riskLevel);
    const confidence = Number(tfjs.confidenceScore ?? evaluation.confidenceScore);
    const confidenceText = Number.isFinite(confidence) ? `${Math.round(confidence * 100)}%` : 'not available';
    const bp = `${metrics.systolicBP || '--'}/${metrics.diastolicBP || '--'}`;
    const symptomItems = evaluation.symptomAnalysis?.items || [];
    const symptomLines = symptomItems.slice(0, 5).map(item => (
        `- ${item.symptom}: ${item.riskLevel}. ${item.actionLabel}. ${item.reason}`
    ));
    const flags = buildRiskFlagLines(metrics, risk, symptoms);
    const actionLines = buildRiskActionLines(riskClass, metrics, symptoms);

    return [
        'Maternal-risk TensorFlow.js model guidance',
        week ? `Pregnancy week: ${week}` : '',
        `Risk identified: ${riskLevel}`,
        `Model confidence: ${confidenceText}`,
        '',
        'What this means:',
        `- The saved TensorFlow.js model scored the maternal vitals pattern. Blood pressure: ${bp}; blood sugar: ${metrics.bloodSugar ?? 'unknown'}; heart rate: ${metrics.heartRate ?? 'unknown'}.`,
        ...flags,
        ...(symptomLines.length ? ['', 'Symptom-specific risk:', ...symptomLines] : []),
        '',
        'What to do now:',
        ...actionLines,
        '',
        'MongoDB connection:',
        '- The model output, entered vitals, symptom notes, confidence, and safety context are saved in pregnancy_vital_assessments.',
        '- Similar maternal-risk records and safety records are read from MongoDB for context around the model result.',
        '',
        'This is educational dataset support. It cannot diagnose, treat, or replace a qualified clinician.'
    ].filter(Boolean).join('\n');
}

function buildRiskFlagLines(metrics = {}, risk = {}, symptoms = '') {
    const lines = [];
    const systolic = Number(metrics.systolicBP);
    const diastolic = Number(metrics.diastolicBP);
    const glucose = Number(metrics.bloodSugar);
    const temp = Number(metrics.bodyTemp);
    const heartRate = Number(metrics.heartRate);
    const symptomText = String(symptoms || '').toLowerCase();

    if (systolic >= 140 || diastolic >= 90) {
        lines.push('- Blood pressure is in a high range and should be reviewed urgently in pregnancy.');
    } else if (systolic >= 130 || diastolic >= 85) {
        lines.push('- Blood pressure is borderline and should be rechecked and discussed with your care team.');
    }
    if (glucose >= 11) {
        lines.push('- Blood sugar is high and may need same-day clinician advice, especially with diabetes symptoms.');
    } else if (glucose >= 7.8) {
        lines.push('- Blood sugar is elevated and should be followed up with your clinician.');
    }
    if (temp >= 100.4) {
        lines.push('- Temperature may suggest fever; fever during pregnancy should be discussed with a clinician.');
    }
    if (heartRate >= 120 || heartRate <= 45) {
        lines.push('- Heart rate is outside the usual range and should be assessed if persistent or linked with symptoms.');
    }
    if (/\b(headache|vision|bleeding|fluid|chest pain|breathing|reduced movement|faint|severe)\b/i.test(symptomText)) {
        lines.push('- A warning symptom was entered, so safety advice should be followed even if the numeric score is uncertain.');
    }
    if (!lines.length && Array.isArray(risk.rationales)) {
        return risk.rationales.slice(0, 3).map(item => `- ${item}`);
    }
    return lines.length ? lines : ['- No automatic danger flag was found in the entered numbers, but symptoms and clinical history still matter.'];
}

function buildRiskActionLines(riskClass = 'low', metrics = {}, symptoms = '') {
    const symptomText = String(symptoms || '').toLowerCase();
    const hasDangerSymptom = /\b(headache|vision|bleeding|fluid leaking|chest pain|trouble breathing|reduced movement|fainting|severe pain|severe swelling)\b/i.test(symptomText);

    if (riskClass === 'high') {
        return [
            '- Contact your maternity care provider, maternity unit, or emergency department now for same-day advice.',
            '- Go to the nearest hospital or maternity unit now if symptoms are severe, new, worsening, or include headache with vision changes, bleeding, fluid leaking, chest pain, trouble breathing, fainting, severe belly pain, or reduced baby movement.',
            '- Do not drive yourself if you feel faint, have chest pain, trouble breathing, severe pain, or heavy bleeding.',
            '- Recheck blood pressure if possible, write down the readings, pregnancy week, symptoms, medicines, and when symptoms started.'
        ];
    }

    if (riskClass === 'mid') {
        return [
            '- Contact your clinician or antenatal clinic for follow-up advice, especially if this is a new pattern.',
            '- Recheck the abnormal measurement, track symptoms, and avoid heavy exertion until you know what your care team recommends.',
            '- Seek urgent care immediately if any danger symptom appears or worsens.',
            '- Bring the readings and this risk result to your next antenatal contact.'
        ];
    }

    return [
        '- Continue routine antenatal care and keep tracking blood pressure, symptoms, movement when applicable, hydration, and meals.',
        '- Contact your clinician if symptoms persist, worsen, or feel unusual for you.',
        hasDangerSymptom
            ? '- Because a warning symptom was entered, seek urgent care if it is severe, new, worsening, or worrying.'
            : '- Use this as reassurance only for the entered values; it does not rule out pregnancy complications.',
        '- Keep appointments and follow your clinician advice for your personal health history.'
    ];
}

async function handlePregnancyRiskTrends(req, res) {
    try {
        const analytics = await getPregnancyRiskTrends(db, {
            limit: req.query.limit || 15
        });
        res.json({ success: true, analytics, ...analytics });
    } catch (error) {
        console.error('Pregnancy risk trend analytics error:', error);
        res.status(500).json({
            error: 'Failed to load pregnancy risk trends',
            details: error.message
        });
    }
}

app.post('/api/pregnancy-rag/ask', checkDBConnection, async (req, res) => {
    try {
        const { question, week, symptoms } = req.body || {};
        if (!question || !String(question).trim()) {
            return res.status(400).json({ error: 'Question is required' });
        }

        const user = req.user || req.session.user || {
            id: 'guest-user',
            email: 'guest@mamasafe.com',
            displayName: 'Guest User',
            name: 'Guest User'
        };

        let result;
        try {
            result = await runMamasafeAiPipeline(db, {
                message: question,
                question,
                week,
                symptoms,
                limit: 8
            });
        } catch {
            result = await answerPregnancyQuestion(db, { question, week, symptoms });
        }
        const resultMatches = result.matches || result.rag?.documents || [];

        await saveAIChatHistory({
            user,
            message: question,
            response: result.answer,
            context: {
                pregnancyWeek: week,
                symptoms,
                rag: result.rag,
                retrievalMatches: resultMatches.map(match => ({
                    collection: match.collection,
                    title: match.title,
                    source: match.source
                })) || []
            },
            source: 'pregnancy-rag',
            isEmergency: Boolean(result.emergency || result.urgent)
        });

        await recordPregnancyChatSession(db, {
            user,
            question,
            answer: result.answer,
            week,
            symptoms,
            matches: resultMatches,
            urgent: Boolean(result.emergency || result.urgent)
        });

        res.json({
            success: true,
            reply: result.answer,
            answer: result.answer,
            matches: resultMatches,
            urgent: result.emergency || result.urgent,
            safetyOverride: result.safetyOverride,
            model: getAiModelMetadata().model,
            aiModel: getAiModelMetadata(),
            retrievalModel: result.rag?.retrievalMode || result.retrievalModel,
            datasetUse: result.datasetUse || DATASET_USE,
            rag: result.rag,
            retrievedAt: result.retrievedAt
        });
    } catch (error) {
        console.error('Pregnancy RAG error:', error);
        res.status(500).json({ error: 'Failed to process pregnancy RAG question', details: error.message });
    }
});

app.get('/api/pregnancy-ai/status', async (req, res) => {
    try {
        res.json({
            success: true,
            exists: true,
            aiModel: getAiModelMetadata(),
            metadata: {
                model: getAiModelMetadata().model,
                architecture: 'Llama 3.3 70B via Groq + MongoDB Vector Search RAG',
                databaseOnly: true,
                datasetUse: DATASET_USE,
                localDatasetStorage: false
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to read unified pregnancy AI status', details: error.message });
    }
});

app.post('/api/pregnancy-ai/train', checkDBConnection, async (req, res) => {
    try {
        res.json({
            success: true,
            trained: false,
            databaseOnly: true,
            aiModel: getAiModelMetadata(),
            message: 'Backend dataset model training is disabled. Keep datasets and embeddings in MongoDB, then use vector search plus Llama 3.3 70B via Groq at request time.'
        });
    } catch (error) {
        console.error('Unified pregnancy AI training error:', error);
        res.status(500).json({ error: 'Failed to train unified pregnancy AI model', details: error.message });
    }
});

app.post('/api/pregnancy-ai/ask', checkDBConnection, async (req, res) => {
    try {
        const result = await runMamasafeAiPipeline(db, req.body || {});
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to ask unified pregnancy AI model', details: error.message });
    }
});

app.post('/api/pregnancy-rag/predict-risk', checkDBConnection, handlePregnancyRiskPrediction);
app.post('/api/predict-risk', checkDBConnection, handlePregnancyRiskPrediction);

app.post('/api/pregnancy-rag/evaluate', checkDBConnection, async (req, res) => {
    try {
        const {
            age,
            systolic,
            systolicBP,
            diastolic,
            diastolicBP,
            glucose,
            bloodSugar,
            temp,
            bodyTemp,
            heartRate,
            bmi,
            previousComplications,
            preexistingDiabetes,
            gestationalDiabetes,
            mentalHealth,
            week,
            symptoms
        } = req.body || {};

        const riskResult = await assessPregnancyRiskWithGroq({
            question: symptoms ? `Pregnancy assessment with symptoms: ${symptoms}` : 'Pregnancy risk assessment',
            week: week || 24,
            symptoms: symptoms || '',
            symptomAnalysis: null
        });

        // Try to save to MongoDB, but don't fail the request if it doesn't work
        try {
            const user = req.user || req.session?.user || {
                id: 'guest-user',
                email: 'guest@mamasafe.com',
                displayName: 'Guest User'
            };
            const now = new Date();
            await db.collection('pregnancy_vital_assessments').insertOne({
                userId: user.id,
                userEmail: user.email,
                age: age || 25,
                systolicBP: systolicBP || systolic || 120,
                diastolicBP: diastolicBP || diastolic || 80,
                bloodSugar: bloodSugar || glucose || 7.5,
                bodyTemp: bodyTemp || temp || 98.6,
                heartRate: heartRate || 72,
                bmi: bmi || 23,
                previousComplications: previousComplications || 0,
                preexistingDiabetes: preexistingDiabetes || 0,
                gestationalDiabetes: gestationalDiabetes || 0,
                mentalHealth: mentalHealth || 0,
                week: week || 24,
                symptoms: symptoms || '',
                riskAssessment: riskResult,
                createdAt: now,
                updatedAt: now
            });
        } catch (saveError) {
            console.warn('Could not save assessment to MongoDB:', saveError.message);
        }

        res.json({
            success: true,
            prediction: riskResult.riskLevel,
            confidenceScore: riskResult.confidenceScore || 0.8,
            accuracy: riskResult.accuracy || 0.92,
            rawDistribution: riskResult.rawDistribution,
            aiRisk: riskResult,
            riskAssessment: riskResult,
            model: riskResult.model,
            aiModel: getAiModelMetadata(),
            urgent: riskResult.urgent || false,
            groqUsed: true,
            retrievedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Pregnancy evaluate error:', error);
        res.status(500).json({
            error: 'Failed to complete assessment',
            details: error.message
        });
    }
});

app.get('/api/pregnancy-rag/analytics/trends', checkDBConnection, handlePregnancyRiskTrends);
app.get('/api/analytics/trends', checkDBConnection, handlePregnancyRiskTrends);

registerPregnancyToolRoutes(app, {
    checkDBConnection,
    getDb: () => db,
    answerPregnancyQuestion,
    answerUnifiedPregnancyQuestion: async ({ question, week, symptoms }) => {
        try {
            return await runMamasafeAiPipeline(db, {
                message: question,
                question,
                week,
                symptoms,
                limit: 8
            });
        } catch {
            return await answerPregnancyQuestion(db, { question, week, symptoms });
        }
    },
    analyzePregnancySymptoms,
    evaluatePregnancyDecisionSupport,
    recordPregnancyChatSession
});

app.get('/api/pregnancy-rag/model-training/summary', checkDBConnection, async (req, res) => {
    try {
        const summary = await getPregnancyRiskTrainingSummary(db);
        res.json({ success: true, summary });
    } catch (error) {
        console.error('Pregnancy risk training summary error:', error);
        res.status(500).json({
            error: 'Failed to load pregnancy risk training summary',
            details: error.message
        });
    }
});

app.get('/api/pregnancy-rag/tensorflow/training-data', async (req, res) => {
    try {
        const training = await getPregnancyTensorflowTrainingData(db, {
            limit: req.query.limit || 1600
        });
        res.json({ success: true, training });
    } catch (error) {
        console.error('Pregnancy TensorFlow.js training data error:', error);
        res.status(500).json({
            error: 'Failed to load pregnancy TensorFlow.js training data',
            details: error.message
        });
    }
});

app.get('/api/pregnancy-rag/tfjs/training-data', async (req, res) => {
    try {
        const training = await getPregnancyTensorflowTrainingData(db, {
            limit: req.query.limit || 1600
        });
        res.json({ success: true, training });
    } catch (error) {
        console.error('Pregnancy TensorFlow.js training data error:', error);
        res.status(500).json({
            error: 'Failed to load pregnancy TensorFlow.js training data',
            details: error.message
        });
    }
});

app.get('/api/model/status', async (req, res) => {
    try {
        const status = await getMaternalRiskAiModelStatus();
        res.json({
            success: true,
            ...status
        });
    } catch (error) {
        console.error('Maternal risk AI status error:', error);
        res.status(500).json({
            error: 'Failed to read custom AI model status',
            details: error.message
        });
    }
});

app.post('/api/model/train', async (req, res) => {
    try {
        const epochs = req.body?.epochs || req.query.epochs || 40;
        const limit = req.body?.limit || req.query.limit || 1600;
        const testSplit = req.body?.testSplit || req.query.testSplit || 0.2;

        const result = await trainMaternalRiskAiModel(db, {
            epochs,
            limit,
            testSplit,
            onEpochEnd: (epoch, logs = {}) => {
                const totalEpochs = Math.min(Math.max(Number.parseInt(epochs, 10) || 40, 1), 250);
                if (epoch === 0 || (epoch + 1) % 10 === 0 || epoch + 1 === totalEpochs) {
                    const accuracy = logs.acc ?? logs.accuracy ?? 0;
                    console.log(`Maternal risk AI epoch ${epoch + 1}/${totalEpochs}: loss=${Number(logs.loss || 0).toFixed(4)} accuracy=${Number(accuracy || 0).toFixed(4)}`);
                }
            }
        });

        res.json(result);
    } catch (error) {
        console.error('Maternal risk AI training error:', error);
        res.status(500).json({
            error: 'Failed to train custom maternal-risk AI model',
            details: error.message
        });
    }
});

app.post('/api/model/predict', async (req, res) => {
    try {
        const prediction = await predictMaternalRiskWithSavedModel(req.body || {});
        res.json({
            success: true,
            prediction: prediction.prediction,
            confidenceScore: prediction.confidenceScore,
            rawDistribution: prediction.rawDistribution,
            model: prediction.model,
            runtime: prediction.runtime,
            backend: prediction.backend,
            accuracy: prediction.accuracy,
            trainedRecords: prediction.trainedRecords,
            epochs: prediction.epochs,
            sourceCollection: prediction.sourceCollection,
            featureNames: prediction.featureNames,
            trainedAt: prediction.trainedAt,
            details: prediction
        });
    } catch (error) {
        console.error('Maternal risk AI prediction error:', error);
        const status = /no such file|cannot find|not found/i.test(error.message) ? 503 : 500;
        res.status(status).json({
            error: 'Failed to run custom maternal-risk AI prediction',
            details: status === 503
                ? 'No saved model was found. Run npm run train:custom-ai in backend or POST /api/model/train first.'
                : error.message
        });
    }
});

app.get('/api/model/evaluate-accuracy', async (req, res) => {
    try {
        const evaluation = await evaluateMaternalRiskAiAccuracy(db, {
            limit: req.query.limit || 50,
            trainingLimit: req.query.trainingLimit || 1600,
            testSplit: req.query.testSplit || 0.2
        });
        res.json(evaluation);
    } catch (error) {
        console.error('Maternal risk AI accuracy evaluation error:', error);
        const status = /no such file|cannot find|not found/i.test(error.message) ? 503 : 500;
        res.status(status).json({
            error: status === 503
                ? 'No saved custom AI model found. Train the model first.'
                : 'Accuracy evaluation loop failure',
            details: error.message
        });
    }
});

app.get('/api/pregnancy-rag/week/:week', checkDBConnection, async (req, res) => {
    try {
        const guide = await getPregnancyWeekGuide(db, req.params.week);
        res.json({ success: true, guide });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/pregnancy-rag/week-planner/:week', checkDBConnection, async (req, res) => {
    try {
        const planner = await getPregnancyWeekPlanner(db, req.params.week);
        res.json({ success: true, planner });
    } catch (error) {
        try {
            const planner = await buildFallbackWeekPlanner(db, req.params.week, error);
            res.json({ success: true, planner, fallback: true, warning: error.message });
        } catch (fallbackError) {
            res.status(400).json({ error: fallbackError.message || error.message });
        }
    }
});

async function buildFallbackWeekPlanner(db, week, sourceError = null) {
    const weekNumber = Number.parseInt(week, 10);
    if (!Number.isInteger(weekNumber) || weekNumber < 1 || weekNumber > 42) {
        throw new Error('Week must be between 1 and 42');
    }

    const trimester = weekNumber <= 13 ? 1 : weekNumber <= 27 ? 2 : 3;
    const label = trimester === 1 ? 'First trimester' : trimester === 2 ? 'Second trimester' : 'Third trimester';
    let guide = null;
    try {
        guide = await getPregnancyWeekGuide(db, weekNumber);
    } catch {
        guide = null;
    }

    return {
        week: weekNumber,
        trimester,
        trimesterLabel: label,
        title: `Week ${weekNumber} ${label.toLowerCase()} plan`,
        subtitle: sourceError
            ? `Using the local fallback planner because MongoDB topic planning returned: ${sourceError.message}`
            : 'Using the local fallback planner.',
        datasetWeek: guide?.week || null,
        generatedFrom: 'local-week-planner-fallback',
        sections: [
            {
                key: 'movement',
                label: 'Exercises',
                detail: 'Gentle movement',
                items: trimester === 1
                    ? ['Use short walks and gentle stretching if your clinician says activity is safe.', 'Rest when nausea, dizziness, or fatigue is strong.']
                    : trimester === 2
                        ? ['Use walking, prenatal stretching, pelvic tilts, and light strengthening if approved.', 'Stop and seek advice for dizziness, bleeding, chest pain, or painful contractions.']
                        : ['Use short walks, pelvic tilts, supported squats, or birth-ball movement if approved.', 'Stop and seek advice for bleeding, fluid leaking, reduced movement, severe pain, or breathlessness.']
            },
            {
                key: 'food',
                label: 'Foods to eat',
                detail: 'Steady nutrition',
                items: ['Choose protein, iron-rich foods, fruits, vegetables, whole grains, and water.', 'Follow your clinician advice for supplements, diabetes, anemia, nausea, or food restrictions.']
            },
            {
                key: 'sleep',
                label: 'Sleep position',
                detail: 'Rest and comfort',
                items: trimester >= 2
                    ? ['Use side-sleeping with pillows between knees and behind your back for comfort.', 'Raise your upper body if heartburn or breathlessness bothers you.']
                    : ['Rest when you can and use pillows for comfort.', 'Ask your clinician if sleep problems are severe or linked with warning symptoms.']
            },
            {
                key: 'care',
                label: 'Care reminders',
                detail: 'Antenatal care',
                items: ['Keep antenatal appointments and write down symptoms, questions, and readings.', guide?.tips?.length ? guide.tips.join('; ') : 'Ask your clinician which screening or visit is due for this week.']
            },
            {
                key: 'safety',
                label: 'Call urgently for',
                detail: 'Danger signs',
                urgent: true,
                items: ['Heavy bleeding or fluid leaking.', 'Severe headache, vision changes, chest pain, trouble breathing, fainting, severe belly pain, fever, or reduced baby movement.']
            }
        ],
        sources: guide ? [{ collection: 'pregnancy_weeks', title: guide.title, week: guide.week, source: guide.source || '' }] : []
    };
}

async function handlePregnancyDatasetStatus(req, res) {
    try {
        const status = await getPregnancyDatasetStatus(db);
        res.json({ success: true, status });
    } catch (error) {
        console.error('Pregnancy dataset status error:', error);
        res.status(500).json({ error: 'Failed to load pregnancy dataset status', details: error.message });
    }
}

app.get('/api/pregnancy-rag/status', checkDBConnection, handlePregnancyDatasetStatus);
app.get('/api/pregnancy-rag/dataset-status', checkDBConnection, handlePregnancyDatasetStatus);
app.get('/api/pregnancy/dataset-status', checkDBConnection, handlePregnancyDatasetStatus);
app.get('/api/datasets/pregnancy/status', checkDBConnection, handlePregnancyDatasetStatus);

app.get('/api/pregnancy-rag/collections/:collection', checkDBConnection, async (req, res) => {
    try {
        const preview = await getPregnancyCollectionPreview(db, req.params.collection, {
            search: req.query.search || '',
            limit: req.query.limit || 6
        });
        res.json({ success: true, preview });
    } catch (error) {
        console.error('Pregnancy collection preview error:', error);
        const status = /unsupported/i.test(error.message) ? 400 : 500;
        res.status(status).json({
            error: 'Failed to load pregnancy collection preview',
            details: error.message
        });
    }
});

app.get('/api/pregnancy-rag/who-dataset', checkDBConnection, async (req, res) => {
    try {
        const records = await getWhoPregnancyDataset(db);
        const pdfDatasets = await getPregnancyPdfDatasets(db, {
            chunkLimit: Math.min(parseInt(req.query.chunkLimit, 10) || 20, 100)
        });
        res.json({
            success: true,
            collections: ['who_guidelines', 'who_document_chunks'],
            count: records.length,
            records,
            pdfDatasets
        });
    } catch (error) {
        console.error('WHO pregnancy dataset error:', error);
        res.status(500).json({ error: 'Failed to load WHO pregnancy dataset', details: error.message });
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
            healthConcerns: user?.healthConcerns
        };

        const response = await processSleepWithAI(age, sleepIssues, schedule, userContext);
        res.json(response);
    } catch (error) {
        console.error('AI Sleep Guidance Error:', error);
        res.status(500).json({ error: 'Failed to process sleep data', details: error.message });
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
            healthConcerns: user?.healthConcerns
        };

        const response = await processAppointmentsWithAI(type, timing, concerns, userContext);
        res.json(response);
    } catch (error) {
        console.error('AI Appointment Scheduling Error:', error);
        res.status(500).json({ error: 'Failed to process appointment data', details: error.message });
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

// Courses AI endpoints (Llama 3.3 70B via Groq)
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
app.post('/api/users/check', checkDBConnection, async (req, res) => {
    try {
        const body = req.body || {};
        const email = normalizeUserEmail(body.email || body.userEmail || '');
        const fullName = body.name || body.displayName || [body.firstName, body.lastName].filter(Boolean).join(' ');
        const taken = await findTakenUserIdentity({ email, name: fullName });

        res.json({
            available: !taken.taken,
            taken: taken.taken,
            fields: taken.fields || [],
            message: taken.taken
                ? `${taken.fields.join(' and ')} already taken`
                : 'Name and email are available'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/users', checkDBConnection, async (req, res) => {
    try {
        const now = new Date();
        const body = req.body || {};
        const email = normalizeUserEmail(body.email || body.userEmail || body.id || body.userId || '');
        const userId = String(body.userId || body.id || email || '').trim();
        if (!email && !userId) {
            return res.status(400).json({ error: 'User email or id is required' });
        }
        const source = String(body.source || body.authAction || 'frontend-auth').toLowerCase();
        const authAction = String(body.authAction || body.action || source).toLowerCase();
        const isSignup = /signup|sign-up|register|registration|create-account/.test(authAction)
            || /signup|sign-up|register|registration|create-account/.test(source);
        const isSessionRestore = /session-restore|restore|refresh/.test(authAction)
            || /session-restore|restore|refresh/.test(source);
        const displayName = body.name
            || body.displayName
            || [body.firstName, body.lastName].filter(Boolean).join(' ')
            || body.profile?.name
            || body.profile?.displayName
            || [body.profile?.firstName, body.profile?.lastName].filter(Boolean).join(' ')
            || email
            || 'Mother';

        const userData = {
            ...body,
            id: body.id || userId || email,
            userId: body.userId || userId || email,
            email,
            userEmail: email,
            name: displayName,
            normalizedEmail: email,
            normalizedName: normalizeUserName(displayName),
            recordType: 'created-user',
            source: body.source || 'frontend-auth',
            status: body.status || 'active',
            updatedAt: now
        };

        const identityQuery = {
            $or: [
                ...(email ? [{ email }, { userEmail: email }, { id: email }, { userId: email }] : []),
                ...(email ? buildUserEmailQuery(email) : []),
                ...(userId ? [{ id: userId }, { userId }] : [])
            ]
        };

        // Try to get existing user, but if MongoDB is read-only, just use in-memory fallback
        let existing = null;
        try {
            existing = await db.collection('users').findOne(identityQuery);
        } catch (dbError) {
            console.warn('Could not check for existing user due to DB error:', dbError.message);
        }

        if (isSessionRestore) {
            return res.json({
                skipped: true,
                reason: 'Session restore does not create or update admin-visible users.',
                user: existing ? { ...existing, adminIdentity: getUserIdentity(existing) } : null,
                dbLimited: true
            });
        }

        if (existing) {
            try {
                await db.collection('users').updateOne(
                    { _id: existing._id },
                    {
                        $set: userData,
                        $setOnInsert: { createdAt: existing.createdAt || now }
                    }
                );
                const saved = await db.collection('users').findOne({ _id: existing._id });
                try {
                    if (!/login|auth-login|firebase-auth/.test(source)) {
                        await db.collection('app_events').insertOne({
                            type: 'user-updated',
                            collection: 'users',
                            recordId: existing._id,
                            userId: saved.userId || saved.email || 'unknown',
                            label: saved.name || saved.email || 'user-updated',
                            payload: saved,
                            createdAt: now
                        });
                    }
                } catch (eventError) {
                    console.warn('Could not log user update event:', eventError.message);
                }
                return res.json({ ...saved, updatedExisting: true, dbLimited: false });
            } catch (updateError) {
                console.warn('Could not update user in DB:', updateError.message);
                // Return existing user data even if we couldn't update
                return res.json({ ...existing, updatedExisting: false, dbLimited: true, warning: 'User sync skipped due to database limitations' });
            }
        }

        // Try to create new user
        try {
            const saved = await insertRecordWithEvent('users', { ...userData, createdAt: now }, 'user-created');
            res.json({ ...saved, updatedExisting: false, dbLimited: false });
        } catch (createError) {
            console.warn('Could not create user in DB:', createError.message);
            // Return user data without saving to DB
            res.json({ ...userData, _id: 'local-' + Date.now(), createdAt: now, updatedExisting: false, dbLimited: true, warning: 'User sync skipped due to database limitations' });
        }
    } catch (error) {
        console.error('Users API error:', error);
        res.status(200).json({ 
            ...req.body, 
            _id: 'local-' + Date.now(), 
            createdAt: new Date(), 
            dbLimited: true, 
            warning: 'User sync skipped due to database limitations' 
        });
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
        const currentWeek = Number.parseInt(req.body.currentWeek || req.body.week || req.body.pregnancyWeek, 10);
        const trimester = Number.parseInt(req.body.trimester, 10) || (
            Number.isInteger(currentWeek)
                ? currentWeek <= 13 ? 1 : currentWeek <= 27 ? 2 : 3
                : undefined
        );
        const data = {
            ...req.body,
            currentWeek: Number.isInteger(currentWeek) ? currentWeek : req.body.currentWeek,
            trimester,
            riskLevel: req.body.riskLevel || 'normal',
            notes: req.body.notes || req.body.concerns || '',
            createdAt: new Date()
        };
        const saved = await insertRecordWithEvent('pregnancies', data, 'pregnancy-saved');
        res.json(saved);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/pregnancy/:userId', checkDBConnection, async (req, res) => {
    try {
        let data = await db.collection('pregnancies')
            .find({ userId: req.params.userId })
            .sort({ createdAt: -1 })
            .toArray();
        if (!data.length) {
            data = await db.collection('pregnancy_data').find({ userId: req.params.userId }).toArray();
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/pregnancies', checkDBConnection, async (req, res) => {
    try {
        const currentWeek = Number.parseInt(req.body.currentWeek || req.body.week || req.body.pregnancyWeek, 10);
        const trimester = Number.parseInt(req.body.trimester, 10) || (
            Number.isInteger(currentWeek)
                ? currentWeek <= 13 ? 1 : currentWeek <= 27 ? 2 : 3
                : undefined
        );
        const data = {
            ...req.body,
            currentWeek: Number.isInteger(currentWeek) ? currentWeek : req.body.currentWeek,
            trimester,
            riskLevel: req.body.riskLevel || 'normal',
            notes: req.body.notes || '',
            createdAt: new Date()
        };
        const saved = await insertRecordWithEvent('pregnancies', data, 'pregnancy-saved');
        res.json(saved);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/pregnancies/:userId', checkDBConnection, async (req, res) => {
    try {
        const data = await db.collection('pregnancies')
            .find({ userId: req.params.userId })
            .sort({ createdAt: -1 })
            .toArray();
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

// Reminders API
app.post('/api/reminders', checkDBConnection, async (req, res) => {
    try {
        const data = {
            ...req.body,
            type: req.body.type || 'checkup',
            status: req.body.status || 'pending',
            createdAt: new Date()
        };
        const saved = await insertRecordWithEvent('reminders', data, 'reminder-saved');
        res.json(saved);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/reminders/:userId', checkDBConnection, async (req, res) => {
    try {
        const data = await db.collection('reminders')
            .find({ userId: req.params.userId })
            .sort({ date: 1, createdAt: -1 })
            .toArray();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/notifications/:userId', checkDBConnection, async (req, res) => {
    try {
        const userId = req.params.userId || 'guest-user';
        const userAudience = String(req.query.audience || '').trim().toLowerCase();
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 80, 1), 200);
        const audienceList = [...new Set(['all', 'users', 'everyone', userAudience].filter(Boolean))];
        const now = new Date();
        const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const notificationQuery = {
            $or: [
                { userId },
                { targetUserId: userId },
                { userId: 'admin-broadcast', type: 'admin-notification' },
                { type: 'admin-notification', audience: { $in: audienceList } }
            ]
        };

        const activityQuery = {
            $or: [
                { userId },
                { userId: 'admin-broadcast', type: 'admin-notification' },
                { type: 'admin-notification', audience: { $in: audienceList } },
                { type: { $in: ['help-request', 'support-message', 'emergency-signal', 'medical-alert'] }, userId }
            ]
        };

        const dateWindow = {
            $or: [
                { date: { $gte: now.toISOString().slice(0, 10), $lte: soon.toISOString().slice(0, 10) } },
                { dueDate: { $gte: now.toISOString().slice(0, 10), $lte: soon.toISOString().slice(0, 10) } }
            ]
        };

        // Try to fetch from MongoDB, but fall back to empty arrays if there's an error
        let notifications = [];
        let activities = [];
        let reminders = [];
        let appointments = [];
        
        try {
            [notifications, activities, reminders, appointments] = await Promise.all([
                db.collection('notifications').find(notificationQuery).sort({ createdAt: -1 }).limit(limit).toArray(),
                db.collection('activities').find(activityQuery).sort({ createdAt: -1 }).limit(limit).toArray(),
                db.collection('reminders').find({
                    userId,
                    status: { $ne: 'done' },
                    ...dateWindow
                }).sort({ date: 1, dueDate: 1, createdAt: -1 }).limit(30).toArray(),
                db.collection('appointments').find({
                    userId,
                    ...dateWindow
                }).sort({ date: 1, dueDate: 1, createdAt: -1 }).limit(30).toArray()
            ]);
        } catch (dbError) {
            console.warn('Could not fetch notifications from DB:', dbError.message);
            // Use empty arrays as fallback
        }

        res.json({
            success: true,
            userId,
            notifications,
            activities,
            reminders,
            appointments,
            generatedAt: new Date().toISOString(),
            dbLimited: true,
            warning: 'Notifications unavailable due to database limitations'
        });
    } catch (error) {
        console.error('Notifications API error:', error);
        res.json({
            success: true,
            userId: req.params.userId || 'guest-user',
            notifications: [],
            activities: [],
            reminders: [],
            appointments: [],
            generatedAt: new Date().toISOString(),
            dbLimited: true,
            warning: 'Notifications unavailable due to database limitations'
        });
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
      await saveAIChatHistory({
        user,
        message,
        response: emergencyCheck.message,
        context: { source: 'health-chatbot-emergency' },
        chatHistory: chatHistory || [],
        source: 'health-chatbot',
        isEmergency: true
      });
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

    await saveAIChatHistory({
      user,
      message,
      response,
      context: userContext,
      chatHistory: chatHistory || [],
      source: 'health-chatbot',
      isEmergency: emergencyCheck.isEmergency
    });

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

app.use(notFoundHandler);
app.use(errorHandler);

// Start server
async function startServer() {
    // Initialize database (in-memory if no MongoDB) first to ensure db is never undefined
    await connectToMongoDB();

    // Start server
    app.listen(PORT, () => {
        console.log(`\n`);
        console.log(`===================================`);
        console.log(`    Mamasafe Server Running`);
        console.log(`===================================`);
        console.log(`Backend API: http://localhost:${PORT}`);
        console.log(`Frontend:    http://localhost:${PORT}`);
        console.log(`Hosted:      https://mamasafe-95d58.web.app`);
        console.log(`MongoDB:     ${db ? (useInMemoryDB ? 'Using in-memory database' : 'Connected to Atlas') : 'Connecting in background...'}`);
        console.log(`===================================`);
        console.log(`Press Ctrl+C to stop server`);
        console.log(`\n`);
    });
}

if (require.main === module) {
    startServer();
}

module.exports = app;
module.exports.connectToMongoDB = connectToMongoDB;
module.exports.startServer = startServer;
