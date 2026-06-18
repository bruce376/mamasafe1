const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env'), override: true });

const {
    answerPregnancyQuestion,
    getPregnancyDatasetStatus,
    getPregnancyRiskTrends,
    getPregnancyWeekGuide,
    getWhoPregnancyDataset,
    getPregnancyPdfDatasets,
    recordPregnancyChatSession
} = require('./backend/services/pregnancyRag');

const { getAiModelMetadata } = require('./backend/config/aiModel');
const { registerPregnancyToolRoutes } = require('./backend/services/pregnancyTools');

const app = express();
const PORT = process.env.PORT || 5000;


const mongoConfig = {
    uri: process.env.MONGODB_URI || 'mongodb+srv://ug2424887_db_user:ninjastorm@cluster0.ofrzq1d.mongodb.net/mamacare?retryWrites=true&w=majority&appName=Cluster0',
    dbName: process.env.MONGODB_DB_NAME || 'mamacare'
};

let db;
let client;

app.use(helmet({
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "'unsafe-hashes'", "https://www.gstatic.com", "https://apis.google.com", "https://cdn.jsdelivr.net"],
            scriptSrcElem: ["'self'", "'unsafe-inline'", "https://www.gstatic.com", "https://apis.google.com", "https://cdn.jsdelivr.net"],
            scriptSrcAttr: ["'unsafe-inline'"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5000", "http://127.0.0.1:5000", "https://mamasafe1.onrender.com", "https://mamasafe-95d58.web.app", "https://mamasafe-95d58.firebaseapp.com", "https://www.googleapis.com", "https://identitytoolkit.googleapis.com", "https://securetoken.googleapis.com", "https://firestore.googleapis.com", "https://firebase.googleapis.com", "https://*.googleapis.com", "https://*.firebaseio.com", "https://www.wikidata.org", "https://wikidata.org"],
            mediaSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameSrc: ["'self'", "https://*.firebaseapp.com", "https://accounts.google.com"],
        },
    },
}));

app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());

// Frontend intentionally NOT served here to allow running frontend separately on port 3000.


// Explicit static mounts
app.use('/assets', express.static(path.join(__dirname, 'frontend', 'assets')));
app.use('/vendor', express.static(path.join(__dirname, 'frontend', 'vendor')));

// Pregnancy week images referenced as /assets/pregnancy-weeks/week-XX.png
app.use('/assets/pregnancy-weeks', express.static(path.join(__dirname, 'frontend', 'assets', 'pregnancy-weeks')));

app.get('/__static_check__', (req, res) => {
    res.json({
        assetsExists: require('fs').existsSync(path.join(__dirname, 'frontend', 'assets', 'pregnancy-weeks', 'week-24.png')),
        vendorExists: require('fs').existsSync(path.join(__dirname, 'frontend', 'vendor', 'tfjs', 'tf.min.js')),
        assetsMounted: true,
        vendorMounted: true,
    });
});

async function connectToMongoDB(maxRetries = 5) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`MongoDB connection attempt ${attempt}/${maxRetries}...`);

            client = new MongoClient(mongoConfig.uri, {
                tls: true,
                tlsAllowInvalidCertificates: false,
                maxPoolSize: 20,
                minPoolSize: 5,
                maxIdleTimeMS: 30000,
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
                connectTimeoutMS: 10000,
                heartbeatFrequencyMS: 10000,
                retryWrites: true,
                retryReads: true,
                w: 'majority'
            });

            await client.connect();
            db = client.db(mongoConfig.dbName);

            client.on('connectionPoolCreated', () => console.log('MongoDB connection pool created'));
            client.on('connectionCreated', () => console.log('MongoDB connection established'));
            client.on('connectionReady', () => console.log('MongoDB connection ready'));
            client.on('connectionClosed', (event) => console.log('MongoDB connection closed:', event.reason));
            client.on('connectionPoolCleared', () => {
                console.log('MongoDB connection pool cleared, attempting reconnect...');
                setTimeout(() => {
                    if (!db) connectToMongoDB();
                }, 5000);
            });
            client.on('serverOpening', () => console.log('MongoDB server connection opened'));
            client.on('serverClosed', () => {
                console.log('MongoDB server connection closed, attempting reconnect...');
                setTimeout(() => {
                    if (!db) connectToMongoDB();
                }, 5000);
            });
            client.on('serverHeartbeatFailed', (event) => console.warn('MongoDB server heartbeat failed:', event?.failure?.message));

            console.log('Connected to MongoDB Atlas with persistent connection');
            return true;
        } catch (error) {
            console.error(`MongoDB connection attempt ${attempt} failed:`, error.message);
            if (attempt === maxRetries) {
                setTimeout(() => connectToMongoDB(), 30000);
                return false;
            }
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    return false;
}

async function checkDBHealth() {
    try {
        if (!db || !client) return await connectToMongoDB();
        await db.admin().ping();
        return true;
    } catch (error) {
        console.warn('Database health check failed:', error.message);
        return await connectToMongoDB();
    }
}

setInterval(async () => {
    await checkDBHealth();
}, 60000);

function checkDBConnection(req, res, next) {
    if (!db) return res.status(500).json({ error: 'Database not connected' });
    next();
}

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', connected: !!db, timestamp: new Date().toISOString() });
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

// Llama Pregnancy RAG
app.post('/api/pregnancy-rag/ask', checkDBConnection, async (req, res) => {
    try {
        const { question, week, symptoms } = req.body || {};
        if (!question || !String(question).trim()) return res.status(400).json({ error: 'Question is required' });

        const result = await answerPregnancyQuestion(db, { question, week, symptoms });
        const resultMatches = result.matches || result.rag?.documents || [];

        return res.json({
            success: true,
            reply: result.answer,
            answer: result.answer,
            matches: resultMatches,
            urgent: result.emergency || result.urgent,
            safetyOverride: result.safetyOverride,
            model: getAiModelMetadata().model,
            rag: result.rag,
            retrievedAt: new Date().toISOString()
        });
    } catch (error) {
        return res.status(500).json({ error: 'Pregnancy RAG failed', details: error.message });
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

app.get('/api/pregnancy-rag/status', checkDBConnection, async (req, res) => {
    try {
        const status = await getPregnancyDatasetStatus(db);
        res.json({ success: true, status });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load pregnancy dataset status', details: error.message });
    }
});

app.get('/api/pregnancy-rag/analytics/trends', checkDBConnection, async (req, res) => {
    try {
        const analytics = await getPregnancyRiskTrends(db, { limit: req.query.limit || 15 });
        res.json({ success: true, analytics, ...analytics });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load pregnancy risk trends', details: error.message });
    }
});

registerPregnancyToolRoutes(app, {
    checkDBConnection,
    getDb: () => db,
    answerPregnancyQuestion,
    recordPregnancyChatSession
});

app.get('/api/pregnancy-rag/who-dataset', checkDBConnection, async (req, res) => {
    try {
        const records = await getWhoPregnancyDataset(db);
        const pdfDatasets = await getPregnancyPdfDatasets(db, {
            chunkLimit: Math.min(parseInt(req.query.chunkLimit, 10) || 20, 100)
        });
        res.json({ success: true, collections: ['who_guidelines', 'who_document_chunks'], count: records.length, records, pdfDatasets });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load WHO pregnancy dataset', details: error.message });
    }
});

// Serve SPA (disabled when running frontend separately)
// app.get(/.*/, (req, res) => {
//     res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
// });


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

connectToMongoDB().then(() => {
    app.listen(PORT, () => {
        console.log(`MamaCare Server Running at http://localhost:${PORT}`);
    });
});

module.exports = app;

