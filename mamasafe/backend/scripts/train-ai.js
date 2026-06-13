const path = require('path');
const dotenv = require('dotenv');
const { connectDB } = require('../config/database');
const { trainMaternalRiskAiModel } = require('../services/maternalRiskAiModel');

const rootEnv = dotenv.config({ path: path.join(__dirname, '..', '..', '.env') }).parsed || {};
const backendEnv = dotenv.config({ path: path.join(__dirname, '..', '.env'), override: true }).parsed || {};
if (rootEnv.MONGODB_URI && process.env.MONGODB_PREFER_BACKEND_ENV !== 'true') {
    process.env.MONGODB_URI = rootEnv.MONGODB_URI;
}
if (rootEnv.MONGODB_DB_NAME && process.env.MONGODB_PREFER_BACKEND_ENV !== 'true') {
    process.env.MONGODB_DB_NAME = rootEnv.MONGODB_DB_NAME;
}
if (!process.env.MONGODB_SECONDARY_URI && backendEnv.MONGODB_URI && backendEnv.MONGODB_URI !== process.env.MONGODB_URI) {
    process.env.MONGODB_SECONDARY_URI = backendEnv.MONGODB_URI;
}

function getArg(name, fallback) {
    const prefix = `${name}=`;
    const found = process.argv.find(arg => arg.startsWith(prefix));
    if (!found) return fallback;
    return found.slice(prefix.length);
}

async function connectDatabase() {
    try {
        const { client, db, dbName } = await connectDB({
            serverSelectionTimeoutMS: 15000,
            connectTimeoutMS: 15000,
            maxPoolSize: 5
        });
        console.log(`Connected to MongoDB database: ${dbName}`);
        return { client, db: client.db(dbName) };
    } catch (error) {
        console.warn(`MongoDB connection failed: ${error.message}`);
        console.warn('Training cannot continue without MongoDB because local file fallback is disabled.');
        return { client: null, db: null };
    }
}

async function main() {
    const epochs = Number.parseInt(getArg('--epochs', '40'), 10) || 40;
    const limit = Number.parseInt(getArg('--limit', '1600'), 10) || 1600;
    const testSplit = Number(getArg('--testSplit', '0.2')) || 0.2;
    const { client, db } = await connectDatabase();
    if (!db) {
        throw new Error('MongoDB is required to train the maternal-risk TensorFlow.js model.');
    }

    try {
        console.log('Starting maternal-risk custom AI training...');
        const result = await trainMaternalRiskAiModel(db, {
            epochs,
            limit,
            testSplit,
            onEpochEnd: (epoch, logs = {}) => {
                if (epoch === 0 || (epoch + 1) % 10 === 0 || epoch + 1 === epochs) {
                    const accuracy = logs.acc ?? logs.accuracy ?? 0;
                    const loss = logs.loss ?? 0;
                    console.log(`Epoch ${epoch + 1}/${epochs}: loss=${Number(loss).toFixed(4)} accuracy=${Number(accuracy).toFixed(4)}`);
                }
            }
        });

        console.log('Custom AI training complete.');
        console.log(`Model saved at: ${result.modelPath}`);
        console.log(`Training samples: ${result.metadata.trainingSamples}`);
        console.log(`Holdout samples: ${result.metadata.holdoutSamples}`);
        console.log(`Holdout accuracy: ${result.evaluation.accuracyPercentage}%`);
        if (result.metadata.fallbackUsed) {
            console.log(`Fallback source used: ${result.metadata.fallbackReason}`);
        }
    } finally {
        if (client) await client.close();
    }
}

main().catch(error => {
    console.error('Custom AI training failed:', error.message);
    process.exit(1);
});
