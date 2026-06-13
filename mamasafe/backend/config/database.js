const { MongoClient } = require('mongodb');

function normalizeMongoUri(uri = '') {
    const trimmed = String(uri || '').trim();
    if (!trimmed || !trimmed.includes('mongodb.net')) return trimmed;

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

async function connectDB(options = {}) {
    const dbName = options.dbName || process.env.MONGODB_DB_NAME || 'mamasafe';
    const uriCandidates = [
        options.uri,
        process.env.MONGODB_URI,
        process.env.MONGODB_SECONDARY_URI,
        process.env.MONGODB_LOCAL_URI
    ]
        .map(normalizeMongoUri)
        .filter(Boolean)
        .filter((uri, index, list) => list.indexOf(uri) === index);

    if (!uriCandidates.length) {
        throw new Error('MONGODB_URI, MONGODB_SECONDARY_URI, or MONGODB_LOCAL_URI is required.');
    }

    let lastError = null;
    for (const uri of uriCandidates) {
        const client = new MongoClient(uri, {
            maxPoolSize: options.maxPoolSize || 10,
            serverSelectionTimeoutMS: options.serverSelectionTimeoutMS || 30000,
            connectTimeoutMS: options.connectTimeoutMS || 30000,
            socketTimeoutMS: options.socketTimeoutMS || 60000,
            retryReads: true,
            retryWrites: true,
            tls: uri.includes('mongodb.net') || uri.includes('mongodb+srv')
        });

        try {
            await client.connect();
            return {
                client,
                db: client.db(dbName),
                dbName
            };
        } catch (error) {
            lastError = error;
            await client.close().catch(() => {});
        }
    }

    throw lastError || new Error('MongoDB connection failed for all configured URIs.');
}

module.exports = {
    connectDB,
    normalizeMongoUri
};
