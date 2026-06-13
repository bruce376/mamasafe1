const { createEmbedding } = require('./embeddingService');
const {
    retrievePregnancyContext
} = require('./pregnancyRag');

const VECTOR_COLLECTION = process.env.PREGNANCY_VECTOR_COLLECTION || 'pregnancy_knowledge';
const VECTOR_INDEX = process.env.PREGNANCY_VECTOR_INDEX || 'pregnancy_vector_index';
const VECTOR_PATH = process.env.PREGNANCY_VECTOR_PATH || 'embedding';
const DEFAULT_LIMIT = 5;

const EMERGENCY_PATTERNS = [
    /\bheavy (vaginal )?bleeding\b/i,
    /\bbleeding\b/i,
    /\bfluid leaking\b/i,
    /\bwater broke\b/i,
    /\bloss of consciousness\b/i,
    /\bfainting\b/i,
    /\bconvulsions?\b/i,
    /\bseizures?\b/i,
    /\bsevere (abdominal|belly|stomach) pain\b/i,
    /\bsevere headache\b/i,
    /\bblurred vision\b/i,
    /\bvision changes?\b/i,
    /\bchest pain\b/i,
    /\btrouble breathing\b/i,
    /\bshortness of breath\b/i,
    /\bbaby (is )?not moving\b/i,
    /\breduced baby movement\b/i,
    /\bsuicid(e|al)\b/i,
    /\bself harm\b/i
];

function compactText(value = '', max = 900) {
    return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function detectEmergency(message = '', symptoms = '') {
    const haystack = [message, symptoms].filter(Boolean).join(' ');
    return EMERGENCY_PATTERNS.some(pattern => pattern.test(haystack));
}

function normalizeVectorDoc(doc = {}) {
    return {
        id: doc._id ? String(doc._id) : doc.id || '',
        title: compactText(doc.title || doc.name || doc.sign || 'Pregnancy information', 180),
        category: doc.category || '',
        trimester: doc.trimester || '',
        content: compactText(doc.content || doc.summary || doc.description || doc.answer || '', 1000),
        source: doc.source || '',
        collection: VECTOR_COLLECTION,
        score: Number(doc.score || doc.vectorScore || 0),
        metadata: doc.metadata || {}
    };
}

function normalizeRagMatch(match = {}) {
    return {
        id: match.id || match._id || '',
        title: compactText(match.title || 'Pregnancy dataset record', 180),
        category: match.category || match.topic || '',
        trimester: match.trimester || '',
        content: compactText(match.text || match.content || match.answer || '', 1000),
        source: match.source || '',
        collection: match.collection || '',
        score: Number(match.score || 0),
        metadata: {
            topic: match.topic || '',
            riskLevel: match.riskLevel || '',
            week: match.week || null
        }
    };
}

async function tryAtlasVectorSearch(db, embedding = [], options = {}) {
    if (!db || !Array.isArray(embedding) || !embedding.length) return [];

    const collection = db.collection(VECTOR_COLLECTION);
    if (typeof collection.aggregate !== 'function') return [];

    const limit = Math.min(Math.max(Number(options.limit) || DEFAULT_LIMIT, 1), 10);
    const numCandidates = Math.max(limit * 20, 80);
    const filter = {};
    if (options.category) filter.category = options.category;
    if (options.trimester) filter.trimester = { $in: [options.trimester, 'All'] };

    const vectorSearchStage = {
        index: VECTOR_INDEX,
        path: VECTOR_PATH,
        queryVector: embedding,
        numCandidates,
        limit
    };
    if (Object.keys(filter).length) vectorSearchStage.filter = filter;

    const docs = await collection.aggregate([
        { $vectorSearch: vectorSearchStage },
        {
            $project: {
                title: 1,
                category: 1,
                trimester: 1,
                content: 1,
                source: 1,
                keywords: 1,
                metadata: 1,
                score: { $meta: 'vectorSearchScore' }
            }
        }
    ]).toArray();

    return docs.map(normalizeVectorDoc);
}

async function fallbackPregnancySearch(db, options = {}) {
    if (!db) return [];
    const matches = await retrievePregnancyContext(db, {
        question: options.message || options.question || '',
        week: options.week,
        symptoms: options.symptoms
    });
    return matches
        .slice(0, Math.min(Math.max(Number(options.limit) || DEFAULT_LIMIT, 1), 10))
        .map(normalizeRagMatch);
}

async function searchPregnancyKnowledge(db, options = {}) {
    const message = options.message || options.question || '';
    const limit = Math.min(Math.max(Number(options.limit) || DEFAULT_LIMIT, 1), 10);
    const embeddingText = options.embeddingText || [
        message,
        options.week ? `Pregnancy week ${options.week}` : '',
        options.symptoms ? `Symptoms or notes: ${options.symptoms}` : ''
    ].filter(Boolean).join(' ');
    const embeddingResult = options.embeddingResult || await createEmbedding(embeddingText || message);
    let documents = [];
    let mode = 'mongodb-rag-fallback';
    let vectorError = '';

    try {
        documents = await tryAtlasVectorSearch(db, embeddingResult.embedding, {
            limit,
            category: options.category,
            trimester: options.trimester
        });
        if (documents.length) mode = 'mongodb-atlas-vector-search';
    } catch (error) {
        vectorError = error.message;
    }

    if (!documents.length) {
        documents = await fallbackPregnancySearch(db, {
            ...options,
            message,
            limit
        });
    }

    return {
        query: message,
        documents,
        mode,
        vectorCollection: VECTOR_COLLECTION,
        vectorIndex: VECTOR_INDEX,
        embedding: {
            model: embeddingResult.model,
            dimension: embeddingResult.dimension,
            ready: Boolean(embeddingResult.embedding.length),
            error: embeddingResult.error || vectorError || ''
        },
        emergency: detectEmergency(message, options.symptoms),
        searchedAt: new Date().toISOString()
    };
}

function buildContextText(documents = []) {
    if (!documents.length) return 'No matching pregnancy dataset records were found.';
    return documents.map((doc, index) => [
        `Document ${index + 1}: ${doc.title}`,
        doc.category ? `Category: ${doc.category}` : '',
        doc.trimester ? `Trimester: ${doc.trimester}` : '',
        doc.collection ? `Collection: ${doc.collection}` : '',
        doc.content ? `Content: ${doc.content}` : '',
        doc.source ? `Source: ${doc.source}` : ''
    ].filter(Boolean).join('\n')).join('\n\n');
}

module.exports = {
    VECTOR_COLLECTION,
    VECTOR_INDEX,
    buildContextText,
    detectEmergency,
    searchPregnancyKnowledge,
    tryAtlasVectorSearch
};
