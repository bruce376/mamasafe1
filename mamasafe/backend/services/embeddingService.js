const {
    embedText,
    getTransformerAiStatus
} = require('./transformerSemanticAi');

const DEFAULT_EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2';

function compactText(value = '', max = 1200) {
    return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

async function createEmbedding(text = '') {
    const input = compactText(text);
    if (!input) {
        return {
            embedding: [],
            dimension: 0,
            model: process.env.TRANSFORMER_MODEL || DEFAULT_EMBEDDING_MODEL,
            transformer: getTransformerAiStatus(),
            error: 'No text was provided for embedding.'
        };
    }

    try {
        const embedding = await embedText(input);
        return {
            embedding,
            dimension: embedding.length,
            model: process.env.TRANSFORMER_MODEL || DEFAULT_EMBEDDING_MODEL,
            transformer: getTransformerAiStatus(),
            error: ''
        };
    } catch (error) {
        return {
            embedding: [],
            dimension: 0,
            model: process.env.TRANSFORMER_MODEL || DEFAULT_EMBEDDING_MODEL,
            transformer: getTransformerAiStatus(),
            error: error.message
        };
    }
}

function buildPregnancyDocumentText(doc = {}) {
    return compactText([
        doc.title,
        doc.category,
        doc.trimester,
        doc.content,
        doc.summary,
        doc.description,
        Array.isArray(doc.keywords) ? doc.keywords.join(' ') : doc.keywords
    ].filter(Boolean).join(' '), 1600);
}

module.exports = {
    DEFAULT_EMBEDDING_MODEL,
    buildPregnancyDocumentText,
    createEmbedding
};
