require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), override: true });

const path = require('path');
const { connectDB } = require('../config/database');
const {
    DEFAULT_DATASET_PATH,
    KNOWLEDGE_SOURCE_SYSTEM,
    loadPregnancyKnowledgeDataset
} = require('./pregnancyKnowledgeDataset');

const COLLECTION_NAME = process.env.PREGNANCY_VECTOR_COLLECTION || 'pregnancy_knowledge';

function getArgValue(name, fallback = '') {
    const prefix = `${name}=`;
    const found = process.argv.find(arg => arg.startsWith(prefix));
    return found ? found.slice(prefix.length) : fallback;
}

async function createIndexes(collection) {
    await collection.createIndex({ knowledgeId: 1 }, { unique: true, sparse: true });
    await collection.createIndex({ category: 1, trimester: 1 });
    await collection.createIndex({
        title: 'text',
        category: 'text',
        trimester: 'text',
        content: 'text',
        keywords: 'text'
    }, { name: 'pregnancy_knowledge_text_v1' }).catch(error => {
        if (!/equivalent index|already exists|IndexOptionsConflict/i.test(error.message || '')) {
            throw error;
        }
    });
}

async function main() {
    const requestedSource = getArgValue('--source', DEFAULT_DATASET_PATH);
    if (!requestedSource) {
        throw new Error('No local source file is configured. Store pregnancy data in MongoDB, or pass --source=<external-json-path> for a one-time import.');
    }

    const datasetPath = path.resolve(requestedSource);
    const clear = process.argv.includes('--clear');
    const { client, db, dbName } = await connectDB();

    try {
        const collection = db.collection(COLLECTION_NAME);
        const docs = await loadPregnancyKnowledgeDataset(datasetPath);
        await createIndexes(collection);

        if (clear) {
            const deleteResult = await collection.deleteMany({ sourceSystem: KNOWLEDGE_SOURCE_SYSTEM });
            console.log(`Cleared ${deleteResult.deletedCount || 0} existing ${COLLECTION_NAME} JSON seed records.`);
        }

        let inserted = 0;
        let updated = 0;
        for (const doc of docs) {
            const now = new Date();
            const result = await collection.updateOne(
                { knowledgeId: doc.knowledgeId },
                {
                    $set: {
                        ...doc,
                        updatedAt: now
                    },
                    $setOnInsert: {
                        createdAt: now
                    }
                },
                { upsert: true }
            );
            inserted += result.upsertedCount || 0;
            updated += result.matchedCount || result.modifiedCount ? 1 : 0;
        }

        console.log(`MongoDB database: ${dbName}`);
        console.log(`Collection: ${COLLECTION_NAME}`);
        console.log(`Dataset source: ${datasetPath}`);
        console.log(`Knowledge records ready: ${docs.length}`);
        console.log(`Inserted: ${inserted}`);
        console.log(`Updated: ${updated}`);
    } finally {
        await client.close();
    }
}

main().catch(error => {
    console.error('Failed to upload pregnancy knowledge dataset:', error.message);
    process.exitCode = 1;
});
