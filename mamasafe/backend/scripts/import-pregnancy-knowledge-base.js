require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const crypto = require('node:crypto');
const path = require('node:path');
const { readFile } = require('node:fs/promises');
const { MongoClient } = require('mongodb');

const DEFAULT_DATASET_PATH = '';
const SOURCE_SYSTEM = 'mamasafe-json-knowledge-base';
const SCHEMA_VERSION = 3;

const allowedCollections = new Set([
    'pregnancy_weeks',
    'symptoms',
    'danger_signs',
    'nutrition',
    'articles',
    'faqs'
]);

const collectionIndexes = {
    pregnancy_weeks: [
        [{ week: 1 }, { name: 'pregnancy_weeks_week_v1', sparse: true }],
        [{ title: 'text', babyDevelopment: 'text', motherChanges: 'text', symptomsCommon: 'text', tips: 'text', dangerAlerts: 'text', keywords: 'text' }, { name: 'pregnancy_weeks_text_v1' }]
    ],
    symptoms: [
        [{ name: 1 }, { name: 'symptoms_name_v1', sparse: true }],
        [{ name: 'text', aliases: 'text', keywords: 'text', description: 'text', selfCareTips: 'text', warningSigns: 'text', whenToSeeDoctor: 'text' }, { name: 'symptoms_text_json_v1' }]
    ],
    danger_signs: [
        [{ sign: 1 }, { name: 'danger_signs_sign_v1', sparse: true }],
        [{ sign: 'text', category: 'text', description: 'text', action: 'text', keywords: 'text' }, { name: 'danger_signs_text_json_v1' }]
    ],
    nutrition: [
        [{ food: 1 }, { name: 'nutrition_food_v1', sparse: true }],
        [{ food: 'text', type: 'text', benefits: 'text', keywords: 'text' }, { name: 'nutrition_text_json_v1' }]
    ],
    articles: [
        [{ category: 1, updatedAt: -1 }, { name: 'articles_category_updated_v1', sparse: true }],
        [{ title: 'text', content: 'text', category: 'text', keywords: 'text' }, { name: 'articles_text_v2' }]
    ],
    faqs: [
        [{ category: 1 }, { name: 'faqs_category_v1', sparse: true }],
        [{ question: 'text', questionAliases: 'text', answer: 'text', tags: 'text', keywords: 'text' }, { name: 'faqs_text_json_v2' }]
    ]
};

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

function getArgValue(name) {
    const prefix = `${name}=`;
    const inline = process.argv.find(arg => arg.startsWith(prefix));
    if (inline) return inline.slice(prefix.length);
    const index = process.argv.indexOf(name);
    return index >= 0 ? process.argv[index + 1] : '';
}

function stableString(value) {
    return String(value ?? '').trim().toLowerCase();
}

function identityFor(collectionName, doc) {
    if (doc.knowledgeId) return doc.knowledgeId;
    const identityParts = {
        pregnancy_weeks: [doc.week, doc.title],
        symptoms: [doc.name],
        danger_signs: [doc.sign],
        nutrition: [doc.food],
        articles: [doc.title],
        faqs: [doc.question]
    }[collectionName] || [doc.title || doc.name || doc.question || doc.week];
    const raw = `${collectionName}:${identityParts.map(stableString).join(':')}`;
    return crypto.createHash('sha1').update(raw).digest('hex').slice(0, 16);
}

function normalizeDoc(collectionName, doc) {
    const now = new Date();
    return {
        ...doc,
        knowledgeId: identityFor(collectionName, doc),
        sourceSystem: SOURCE_SYSTEM,
        schemaVersion: SCHEMA_VERSION,
        createdAt: doc.createdAt ? new Date(doc.createdAt) : now,
        updatedAt: now
    };
}

async function loadDataset(filePath) {
    const parsed = JSON.parse(await readFile(filePath, 'utf8'));

    if (Array.isArray(parsed)) {
        return { articles: parsed };
    }

    return parsed;
}

async function connectDb() {
    const uri = normalizeMongoUri(process.env.MONGODB_URI || process.env.MONGODB_LOCAL_URI);
    const dbName = process.env.MONGODB_DB_NAME || 'mamasafe';

    if (!uri) {
        throw new Error('MONGODB_URI is required to import pregnancy knowledge.');
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

    await client.connect();
    return { client, db: client.db(dbName), dbName };
}

async function createIndexes(db, collectionName) {
    for (const [index, options] of collectionIndexes[collectionName] || []) {
        await db.collection(collectionName).createIndex(index, options)
            .catch(error => console.warn(`Index skipped on ${collectionName}: ${error.message}`));
    }
    await db.collection(collectionName).createIndex({ knowledgeId: 1 }, { name: `${collectionName}_knowledge_id_v1`, unique: false })
        .catch(error => console.warn(`knowledgeId index skipped on ${collectionName}: ${error.message}`));
}

async function importCollection(db, collectionName, docs, { append, dryRun }) {
    if (!allowedCollections.has(collectionName)) {
        console.warn(`Skipping unsupported collection: ${collectionName}`);
        return { collectionName, inserted: 0, skipped: true };
    }

    if (!Array.isArray(docs) || docs.length === 0) {
        return { collectionName, inserted: 0 };
    }

    const normalized = docs.map(doc => normalizeDoc(collectionName, doc));

    if (dryRun) {
        return { collectionName, inserted: normalized.length, dryRun: true };
    }

    await createIndexes(db, collectionName);

    if (!append) {
        await db.collection(collectionName).deleteMany({ sourceSystem: SOURCE_SYSTEM });
    }

    await db.collection(collectionName).insertMany(normalized, { ordered: false });
    return { collectionName, inserted: normalized.length };
}

async function main() {
    const requestedPath = getArgValue('--file') || DEFAULT_DATASET_PATH;
    if (!requestedPath) {
        throw new Error('No local source file is configured. Store pregnancy data in MongoDB, or pass --file=<external-json-path> for a one-time import.');
    }

    const datasetPath = path.resolve(requestedPath);
    const append = process.argv.includes('--append');
    const dryRun = process.argv.includes('--dry-run');
    const dataset = await loadDataset(datasetPath);
    const entries = Object.entries(dataset).filter(([collectionName]) => allowedCollections.has(collectionName));

    if (!entries.length) {
        throw new Error(`No supported pregnancy knowledge collections found in ${datasetPath}`);
    }

    if (dryRun) {
        for (const [collectionName, docs] of entries) {
            const result = await importCollection(null, collectionName, docs, { append, dryRun });
            console.log(`${result.collectionName}: ${result.inserted} documents ready`);
        }
        return;
    }

    const { client, db, dbName } = await connectDb();
    try {
        for (const [collectionName, docs] of entries) {
            const result = await importCollection(db, collectionName, docs, { append, dryRun });
            console.log(`${dbName}.${result.collectionName}: inserted ${result.inserted} documents`);
        }
    } finally {
        await client.close();
    }
}

main().catch(error => {
    console.error('Failed to import pregnancy knowledge base:', error.message);
    process.exitCode = 1;
});
