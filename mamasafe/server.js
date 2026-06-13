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
    evaluatePregnancyDecisionSupport,
    getPregnancyDatasetStatus,
    getPregnancyRiskTrainingSummary,
    getPregnancyRiskTrends,
    getPregnancyTensorflowTrainingData,
    getPregnancyWeekGuide,
    getWhoPregnancyDataset,
    getPregnancyPdfDatasets,
    recordPregnancyChatSession
} = require('./backend/services/pregnancyRag');
const { getAiModelMetadata } = require('./backend/config/aiModel');
const {
    trainMaternalRiskAiModel,
    predictMaternalRiskWithSavedModel,
    evaluateMaternalRiskAiAccuracy,
    getMaternalRiskAiModelStatus
} = require('./backend/services/maternalRiskAiModel');
const { registerPregnancyToolRoutes } = require('./backend/services/pregnancyTools');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Configuration
const mongoConfig = {
    uri: process.env.MONGODB_URI || 'mongodb+srv://ug2424887_db_user:ninjastorm@cluster0.ofrzq1d.mongodb.net/mamacare?retryWrites=true&w=majority&appName=Cluster0',
    dbName: process.env.MONGODB_DB_NAME || 'mamacare'
};

let db;
let client;

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
app.use(express.json()); // Parse JSON bodies

// Serve the browser app from the frontend folder.
app.use(express.static(path.join(__dirname, 'frontend')));

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

// Send all pregnancy answers to Llama 3.3 70B via Groq
app.post('/api/pregnancy-rag/ask', checkDBConnection, async (req, res) => {
    try {
        const { question, week, symptoms } = req.body || {};
        if (!question || !String(question).trim()) {
            return res.status(400).json({ error: 'Question is required' });
        }

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
        console.error('Llama 3.3 70B pregnancy-rag/ask error:', error);
        return res.status(500).json({
            error: 'Failed to generate pregnancy assessment via Llama 3.3 70B',
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
        const user = req.user || req.session?.user || {
            id: 'guest-user',
            email: 'guest@mamasafe.com',
            displayName: 'Guest User',
            name: 'Guest User'
        };

        const evaluation = await evaluatePregnancyDecisionSupport(db, {
            user,
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
            mentalHealth,
            week,
            symptoms,
            tfjsPrediction
        });

        res.json({
            success: true,
            prediction: evaluation.prediction,
            confidenceScore: evaluation.confidenceScore,
            rawDistribution: evaluation.rawDistribution,
            model: evaluation.model,
            probabilitySource: evaluation.probabilitySource,
            groqUsed: false,
            tensorflowUsed: evaluation.tensorflowUsed,
            tfjsPrediction: evaluation.tfjsPrediction,
            urgent: evaluation.urgent,
            safetyOverride: evaluation.safetyOverride,
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

app.post('/api/pregnancy-rag/predict-risk', checkDBConnection, handlePregnancyRiskPrediction);
app.post('/api/predict-risk', checkDBConnection, handlePregnancyRiskPrediction);
app.post('/api/pregnancy-rag/evaluate', checkDBConnection, handlePregnancyRiskPrediction);

app.get('/api/pregnancy-rag/status', checkDBConnection, async (req, res) => {
    try {
        const status = await getPregnancyDatasetStatus(db);
        res.json({ success: true, status });
    } catch (error) {
        console.error('Pregnancy dataset status error:', error);
        res.status(500).json({ error: 'Failed to load pregnancy dataset status', details: error.message });
    }
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
        res.json({ success: true, ...status });
    } catch (error) {
        res.status(500).json({ error: 'Failed to read custom AI model status', details: error.message });
    }
});

app.post('/api/model/train', async (req, res) => {
    try {
        const result = await trainMaternalRiskAiModel(db, {
            epochs: req.body?.epochs || req.query.epochs || 40,
            limit: req.body?.limit || req.query.limit || 1600,
            testSplit: req.body?.testSplit || req.query.testSplit || 0.2
        });
        res.json(result);
    } catch (error) {
        console.error('Maternal risk AI training error:', error);
        res.status(500).json({ error: 'Failed to train custom maternal-risk AI model', details: error.message });
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
            trainedAt: prediction.trainedAt,
            details: prediction
        });
    } catch (error) {
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
        const status = /no such file|cannot find|not found/i.test(error.message) ? 503 : 500;
        res.status(status).json({
            error: status === 503
                ? 'No saved custom AI model found. Train the model first.'
                : 'Accuracy evaluation loop failure',
            details: error.message
        });
    }
});

app.get('/api/pregnancy-rag/analytics/trends', checkDBConnection, async (req, res) => {
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
});

registerPregnancyToolRoutes(app, {
    checkDBConnection,
    getDb: () => db,
    answerPregnancyQuestion,
    evaluatePregnancyDecisionSupport,
    recordPregnancyChatSession
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

// Catch-all handler - serve index.html for SPA routing
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
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
