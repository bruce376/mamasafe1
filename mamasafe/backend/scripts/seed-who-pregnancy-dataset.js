require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { MongoClient } = require('mongodb');
const { ensurePregnancyKnowledgeBase, getWhoPregnancyDataset } = require('../services/pregnancyRag');

function normalizeMongoUri(uri) {
    if (!uri) return '';
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

async function main() {
    const uri = normalizeMongoUri(process.env.MONGODB_URI || process.env.MONGODB_LOCAL_URI);
    const dbName = process.env.MONGODB_DB_NAME || 'mamasafe';

    if (!uri) {
        throw new Error('MONGODB_URI is required to seed the WHO pregnancy dataset.');
    }

    const client = new MongoClient(uri, {
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        retryReads: true,
        retryWrites: true,
        tls: uri.includes('mongodb.net') || uri.includes('mongodb+srv')
    });

    try {
        await client.connect();
        const db = client.db(dbName);

        await db.collection('who_guidelines').createIndex(
            { title: 'text', dataset: 'text', category: 'text', recommendation: 'text', keywords: 'text' },
            { name: 'who_guidelines_text_v1' }
        ).catch(error => {
            console.warn('WHO text index skipped:', error.message);
        });

        await ensurePregnancyKnowledgeBase(db);
        const records = await getWhoPregnancyDataset(db);

        console.log(`WHO pregnancy dataset ready in "${dbName}.who_guidelines".`);
        console.log(`Records available: ${records.length}`);
        records.forEach(record => {
            console.log(`- ${record.title}`);
        });
    } finally {
        await client.close();
    }
}

main().catch(error => {
    console.error('Failed to seed WHO pregnancy dataset:', error.message);
    process.exitCode = 1;
});
