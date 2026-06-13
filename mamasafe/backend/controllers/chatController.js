const {
    getAiModelMetadata,
    isGroqConfigured
} = require('../services/groqService');
const {
    getAiArchitectureLabel
} = require('../config/aiModel');
const {
    recordPregnancyChatSession
} = require('../services/pregnancyRag');
const {
    FLOW_STEPS,
    MODEL_MANIFEST_PATH,
    PIPELINE_VERSION,
    normalizePipelineInput,
    runMamasafeAiPipeline
} = require('../services/mamasafeAiPipeline');

const RAG_ARCHITECTURE = getAiArchitectureLabel('MongoDB Vector Search RAG');

function getRequestUser(req) {
    return req.user || req.session?.user || {
        id: 'guest-user',
        email: 'guest@mamasafe.com',
        displayName: 'Guest User',
        name: 'Guest User'
    };
}

function createChatController(dependencies = {}) {
    const getDb = dependencies.getDb || (() => null);
    const saveAIChatHistory = dependencies.saveAIChatHistory || (async () => null);
    const savePregnancyChatSession = dependencies.recordPregnancyChatSession || recordPregnancyChatSession;

    async function chat(req, res) {
        const db = getDb();
        if (!db) {
            return res.status(503).json({
                success: false,
                error: 'Database not connected'
            });
        }

        const input = normalizePipelineInput(req.body || {});
        if (!input.message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        const user = getRequestUser(req);

        try {
            const result = await runMamasafeAiPipeline(db, input);
            const documents = result.rag?.documents || [];

            await saveAIChatHistory({
                user,
                message: input.message,
                response: result.reply,
                context: {
                    pregnancyWeek: input.week,
                    symptoms: input.symptoms,
                    rag: {
                        architecture: RAG_ARCHITECTURE,
                        pipelineVersion: result.pipeline?.version,
                        retrievalMode: result.rag?.retrievalMode,
                        vectorCollection: result.rag?.vectorCollection,
                        vectorIndex: result.rag?.vectorIndex,
                        embedding: result.rag?.embedding
                    },
                    pipeline: result.pipeline,
                    matches: documents.map(doc => ({
                        collection: doc.collection,
                        title: doc.title,
                        source: doc.source
                    }))
                },
                source: 'mamasafe-rag-chat',
                isEmergency: result.emergency
            });

            await savePregnancyChatSession(db, {
                user,
                question: input.message,
                answer: result.reply,
                week: input.week,
                symptoms: input.symptoms,
                matches: documents.map(doc => ({
                    collection: doc.collection,
                    title: doc.title,
                    text: doc.content,
                    source: doc.source,
                    score: doc.score
                })),
                urgent: result.emergency
            });

            return res.json(result);
        } catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                error: 'Failed to process MamaSafe RAG chat',
                details: error.message
            });
        }
    }

    function status(req, res) {
        res.json({
            success: true,
            architecture: RAG_ARCHITECTURE,
            aiModel: getAiModelMetadata(),
            modelManifest: MODEL_MANIFEST_PATH,
            pipelineVersion: PIPELINE_VERSION,
            flow: FLOW_STEPS,
            endpoints: {
                chat: 'POST /api/chat',
                aiAsk: 'POST /api/ai/ask',
                status: 'GET /api/chat/status'
            },
            groqConfigured: isGroqConfigured(),
            vectorSearch: {
                collection: process.env.PREGNANCY_VECTOR_COLLECTION || 'pregnancy_knowledge',
                index: process.env.PREGNANCY_VECTOR_INDEX || 'pregnancy_vector_index',
                path: process.env.PREGNANCY_VECTOR_PATH || 'embedding'
            },
            fallback: 'Existing MongoDB pregnancy datasets and safety rules'
        });
    }

    return {
        chat,
        status
    };
}

module.exports = {
    createChatController
};
