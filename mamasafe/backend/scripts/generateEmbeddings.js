require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), override: true });

const { connectDB } = require('../config/database');
const {
    buildPregnancyDocumentText,
    createEmbedding
} = require('../services/embeddingService');

const COLLECTION_NAME = process.env.PREGNANCY_VECTOR_COLLECTION || 'pregnancy_knowledge';
const VECTOR_INDEX = process.env.PREGNANCY_VECTOR_INDEX || 'pregnancy_vector_index';

function getArgValue(name, fallback = '') {
    const prefix = `${name}=`;
    const found = process.argv.find(arg => arg.startsWith(prefix));
    return found ? found.slice(prefix.length) : fallback;
}

async function ensureVectorSearchIndex(collection, dimension) {
    if (!dimension || typeof collection.createSearchIndex !== 'function') {
        return { attempted: false, message: 'MongoDB driver or embedding dimension does not support automatic vector index creation.' };
    }

    try {
        const existing = typeof collection.listSearchIndexes === 'function'
            ? await collection.listSearchIndexes(VECTOR_INDEX).toArray().catch(() => [])
            : [];
        if (existing.length) {
            return { attempted: true, created: false, message: `Vector search index ${VECTOR_INDEX} already exists.` };
        }

        await collection.createSearchIndex({
            name: VECTOR_INDEX,
            type: 'vectorSearch',
            definition: {
                fields: [
                    {
                        type: 'vector',
                        path: 'embedding',
                        numDimensions: dimension,
                        similarity: 'cosine'
                    },
                    { type: 'filter', path: 'category' },
                    { type: 'filter', path: 'trimester' }
                ]
            }
        });

        return { attempted: true, created: true, message: `Vector search index ${VECTOR_INDEX} creation requested.` };
    } catch (error) {
        return { attempted: true, created: false, message: error.message };
    }
}

async function main() {
    const force = process.argv.includes('--force');
    const createIndex = !process.argv.includes('--skip-index');
    const limit = Number(getArgValue('--limit', '0'));
    const { client, db, dbName } = await connectDB();

    try {
        const collection = db.collection(COLLECTION_NAME);
        const query = force ? {} : {
            $or: [
                { embedding: { $exists: false } },
                { embedding: { $size: 0 } },
                { embeddingDimension: { $exists: false } }
            ]
        };
        let cursor = collection.find(query).sort({ updatedAt: -1 });
        if (Number.isInteger(limit) && limit > 0) cursor = cursor.limit(limit);
        const docs = await cursor.toArray();

        let embedded = 0;
        let skipped = 0;
        let failed = 0;
        let dimension = 0;

        for (const doc of docs) {
            const text = buildPregnancyDocumentText(doc);
            if (!text) {
                skipped += 1;
                continue;
            }

            const result = await createEmbedding(text);
            if (!result.embedding.length) {
                failed += 1;
                console.warn(`Embedding failed for ${doc.knowledgeId || doc._id}: ${result.error || 'no vector returned'}`);
                continue;
            }

            dimension = dimension || result.dimension;
            await collection.updateOne(
                { _id: doc._id },
                {
                    $set: {
                        embedding: result.embedding,
                        embeddingModel: result.model,
                        embeddingDimension: result.dimension,
                        embeddedAt: new Date(),
                        updatedAt: new Date()
                    }
                }
            );
            embedded += 1;
            if (embedded % 25 === 0) {
                console.log(`Embeddings generated: ${embedded}/${docs.length}`);
            }
        }

        let indexResult = { attempted: false, message: 'Vector index creation skipped.' };
        if (createIndex) {
            indexResult = await ensureVectorSearchIndex(collection, dimension || 384);
        }

        console.log(`MongoDB database: ${dbName}`);
        console.log(`Collection: ${COLLECTION_NAME}`);
        console.log(`Documents scanned: ${docs.length}`);
        console.log(`Embedded: ${embedded}`);
        console.log(`Skipped: ${skipped}`);
        console.log(`Failed: ${failed}`);
        console.log(`Vector index: ${indexResult.message}`);
    } finally {
        await client.close();
    }
}

main().catch(error => {
    console.error('Failed to generate pregnancy knowledge embeddings:', error.message);
    process.exitCode = 1;
});
