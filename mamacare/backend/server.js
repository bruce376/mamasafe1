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

// MongoDB Configuration
const mongoConfig = {
    // Use MongoDB Atlas as primary connection
    developmentMode: false,
    // Primary MongoDB connection (MongoDB Atlas) - from .env file
    uri: process.env.MONGODB_URI || 'mongodb+srv://ug2424887_db_user:ninjastorm@cluster0.eijhook.mongodb.net/?appName=Cluster0',
    dbName: process.env.MONGODB_DB_NAME || 'mamacare',
    // Local MongoDB connection (fallback)
    localUri: 'mongodb://localhost:27017/mamacare',
    // Alternative connection strings for different environments
    alternativeUris: [
        'mongodb://localhost:27017/mamacare'
    ]
};

let db;
let client;
let useInMemoryDB = false;

// In-memory database fallback
const inMemoryDB = {
    users: [],
    appointments: [],
    analytics: [],
    activities: []
};

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

// Configure session and authentication
configureLocalSession(app);
configureGoogleStrategy();
setupLocalAuthRoutes(app);

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Explicit route for root path to serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

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
                    if (!inMemoryDB[name]) return { toArray: () => [], sort: () => ({ toArray: () => [] }), limit: () => ({ toArray: () => [] }) };
                    const results = inMemoryDB[name].filter(item => {
                        if (query._id) return item._id === query._id;
                        return true;
                    });
                    return {
                        toArray: () => results,
                        sort: () => ({ toArray: () => results, limit: () => ({ toArray: () => results }) }),
                        limit: () => ({ toArray: () => results })
                    };
                },
                countDocuments: (query) => {
                    if (!inMemoryDB[name]) return 0;
                    const results = inMemoryDB[name].filter(item => {
                        if (query._id) return item._id === query._id;
                        return true;
                    });
                    return results.length;
                },
                createIndex: async () => null,
                findOne: (query) => {
                    if (!inMemoryDB[name]) return null;
                    return inMemoryDB[name].find(item => {
                        if (query._id) return item._id === query._id;
                        return true;
                    }) || null;
                },
                updateOne: (query, update) => {
                    if (!inMemoryDB[name]) return { modifiedCount: 0 };
                    const index = inMemoryDB[name].findIndex(item => 
                        query._id ? item._id === query._id : true
                    );
                    if (index !== -1) {
                        inMemoryDB[name][index] = { ...inMemoryDB[name][index], ...(update.$set || {}) };
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
                },
                deleteMany: (query) => {
                    if (!inMemoryDB[name]) return { deletedCount: 0 };
                    const originalLength = inMemoryDB[name].length;
                    inMemoryDB[name] = inMemoryDB[name].filter(item => {
                        if (query._id) return item._id !== query._id;
                        return true;
                    });
                    return { deletedCount: originalLength - inMemoryDB[name].length };
                }
            }),
            admin: () => ({ ping: async () => true })
        };
        
        console.log('In-memory database initialized successfully for development');
        return true;
    }
    
    // Try MongoDB Atlas first, then local MongoDB as fallback
    const urisToTry = [mongoConfig.uri, ...mongoConfig.alternativeUris];
    
    for (let uriIndex = 0; uriIndex < urisToTry.length; uriIndex++) {
        const currentUri = urisToTry[uriIndex];
        console.log(`Trying MongoDB URI ${uriIndex + 1}/${urisToTry.length}: ${currentUri.split('?')[0]}...`);
        
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
                
                console.log(`Connected to MongoDB Atlas with URI ${uriIndex + 1}`);
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
                if (!inMemoryDB[name]) return { toArray: () => [], sort: () => ({ toArray: () => [] }), limit: () => ({ toArray: () => [] }) };
                const results = inMemoryDB[name].filter(item => {
                    if (query._id) return item._id === query._id;
                    return true;
                });
                return {
                    toArray: () => results,
                    sort: () => ({ toArray: () => results, limit: () => ({ toArray: () => results }) }),
                    limit: () => ({ toArray: () => results })
                };
            },
            countDocuments: (query) => {
                if (!inMemoryDB[name]) return 0;
                const results = inMemoryDB[name].filter(item => {
                    if (query._id) return item._id === query._id;
                    return true;
                });
                return results.length;
            },
            createIndex: async () => null,
            findOne: (query) => {
                if (!inMemoryDB[name]) return null;
                return inMemoryDB[name].find(item => {
                    if (query._id) return item._id === query._id;
                    return true;
                }) || null;
            },
            updateOne: (query, update) => {
                if (!inMemoryDB[name]) return { modifiedCount: 0 };
                const index = inMemoryDB[name].findIndex(item => 
                    query._id ? item._id === query._id : true
                );
                if (index !== -1) {
                    inMemoryDB[name][index] = { ...inMemoryDB[name][index], ...(update.$set || {}) };
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
            },
            deleteMany: (query) => {
                if (!inMemoryDB[name]) return { deletedCount: 0 };
                const originalLength = inMemoryDB[name].length;
                inMemoryDB[name] = inMemoryDB[name].filter(item => {
                    if (query._id) return item._id !== query._id;
                    return true;
                });
                return { deletedCount: originalLength - inMemoryDB[name].length };
            }
        }),
        admin: () => ({ ping: async () => true })
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
setInterval(async () => {
    if (!useInMemoryDB) {
        await checkDBHealth();
    }
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

// Health Chatbot Service - Now using Groq AI (fast & free)
const { processHealthQuery, checkEmergencyKeywords, generateHealthSuggestions } = require('./services/healthChatbot');

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

app.post('/api/mamacare-chat', async (req, res) => {
    try {
        const { message, context } = req.body;
        
        // Get user from either passport or session, or create default user
        let user = req.user || req.session.user;
        
        // If no user is authenticated, create a default user for testing
        if (!user) {
            user = {
                id: 'guest-user',
                email: 'guest@mamacare.com',
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
        const response = await processHealthQuery(message, userContext || {});
        res.json({ reply: response });
    } catch (error) {
        console.error('Health Chatbot Error:', error);
        res.status(500).json({ error: 'Failed to process chat message', details: error.message });
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

// Google OAuth Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/auth.html' }),
  (req, res) => {
    // Successful authentication, redirect to frontend main page
    res.redirect('http://localhost:3000/index.html');
  }
);

// Logout route
app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// Get current user
app.get('/api/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.json({ user: null });
  }
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


// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '..', 'frontend')));


// Catch-all handler - serve index.html for SPA routing (exclude API routes and static files)
app.get((req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.includes('.')) {
        return next(); // Let API routes and static files handle it
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
    // Initialize database (in-memory if no MongoDB) first to ensure db is never undefined
    await connectToMongoDB();
    
    // Start server
    app.listen(PORT, () => {
        console.log(`\n`);
        console.log(`===================================`);
        console.log(`    MamaCare Server Running`);
        console.log(`===================================`);
        console.log(`Local:   http://localhost:${PORT}`);
        console.log(`Network: http://localhost:${PORT}`);
        console.log(`MongoDB: ${db ? (useInMemoryDB ? 'Using in-memory database' : 'Connected to Atlas') : 'Connecting in background...'}`);
        console.log(`===================================`);
        console.log(`Press Ctrl+C to stop server`);
        console.log(`\n`);
    });
}

startServer();

module.exports = app;
