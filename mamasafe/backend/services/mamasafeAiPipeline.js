const path = require('path');
const {
    SAFETY_NOTE,
    answerWithGroq,
    getAiModelMetadata,
    isGroqConfigured
} = require('./groqService');
const {
    getAiArchitectureLabel
} = require('../config/aiModel');

const MODEL_MANIFEST_PATH = path.join(__dirname, '..', 'models', 'llama-groq-pregnancy-ai', 'model.json');
const PIPELINE_VERSION = '2026-06-12-pure-groq-llama';

const FLOW_STEPS = [
    'User Question',
    'Frontend (React)',
    'Backend (Node.js)',
    'Groq API',
    'Llama 3.3 70B',
    'AI-generated answer',
    'User receives response'
];

function compactText(value = '', max = 900) {
    return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function normalizePipelineInput(input = {}) {
    const message = input.message || input.question || input.prompt || '';
    return {
        message: String(message || '').trim(),
        week: input.week || input.pregnancyWeek || input.currentWeek || '',
        symptoms: input.symptoms || input.notes || input.symptom || '',
        category: input.category || '',
        trimester: input.trimester || '',
        limit: input.limit || 5,
        context: input.context || {},
        chatHistory: Array.isArray(input.chatHistory) ? input.chatHistory : []
    };
}

function buildTransformerReasoning({ input = {}, groqResult = null, fallbackUsed = false, fallbackError = '' } = {}) {
    const aiModel = getAiModelMetadata();

    const reasons = [];
    if (groqResult) {
        reasons.push(`${aiModel.displayName} generated the answer using its pre-trained pregnancy knowledge.`);
    }
    if (fallbackUsed) {
        reasons.push('The Groq generation step was unavailable, so the backend used fallback guidance.');
    }
    if (fallbackError) {
        reasons.push(`Generation fallback reason: ${fallbackError}`);
    }

    return {
        name: 'Transformer processes + reasons',
        step: 'Transformer processes + reasons',
        model: aiModel.model,
        modelLabel: `${aiModel.displayName} via ${aiModel.providerLabel}`,
        note: 'Llama 3.3 70B via Groq is the transformer reasoning model.',
        reasons,
        userSignals: {
            week: input.week || '',
            symptoms: compactText(input.symptoms || '', 180)
        }
    };
}

function buildPipelineTrace({ input = {}, groqResult = null, fallbackUsed = false, fallbackError = '', reply = '' } = {}) {
    const aiModel = getAiModelMetadata();
    return {
        version: PIPELINE_VERSION,
        architecture: getAiArchitectureLabel('Pure Groq + Llama 3.3'),
        modelManifest: MODEL_MANIFEST_PATH,
        flow: FLOW_STEPS,
        steps: [
            {
                name: 'User Question',
                status: input.message ? 'complete' : 'missing',
                output: compactText(input.message, 220)
            },
            {
                name: 'Frontend',
                status: 'complete',
                output: 'Frontend sends message, week, and symptoms to the backend AI endpoint.'
            },
            {
                name: 'Backend',
                status: 'complete',
                output: 'Node.js Express receives the request and runs the simplified MamaSafe AI pipeline.'
            },
            {
                name: 'Groq API',
                status: groqResult ? 'complete' : 'fallback',
                model: aiModel.model,
                provider: aiModel.providerLabel,
                configured: isGroqConfigured()
            },
            buildTransformerReasoning({ input, groqResult, fallbackUsed, fallbackError }),
            {
                name: 'AI-generated answer',
                status: reply ? 'complete' : 'missing',
                outputPreview: compactText(reply, 260)
            },
            {
                name: 'User receives response',
                status: 'complete',
                output: 'The backend returns answer, safety state, model metadata, and pipeline trace.'
            }
        ]
    };
}

async function runMamasafeAiPipeline(db, rawInput = {}) {
    const input = normalizePipelineInput(rawInput);
    if (!input.message) {
        const error = new Error('Message is required');
        error.statusCode = 400;
        throw error;
    }

    let groqResult = null;
    let fallbackError = '';
    if (isGroqConfigured()) {
        try {
            groqResult = await answerWithGroq({
                question: input.message,
                week: input.week,
                symptoms: input.symptoms,
                emergency: false
            });
        } catch (error) {
            fallbackError = `Groq answer fallback: ${error.message}`;
        }
    } else {
        fallbackError = 'GROQ_API_KEY is not configured.';
    }

    let reply = groqResult?.reply || '';
    let provider = groqResult?.provider || 'groq';
    let fallbackUsed = false;

    if (!reply) {
        fallbackUsed = true;
        reply = [
            'I could not generate a response from the AI.',
            'Use this app as educational support and contact a qualified clinician for advice specific to this pregnancy.',
            SAFETY_NOTE
        ].filter(Boolean).join('\n\n');
    }

    if (!reply.includes(SAFETY_NOTE)) {
        reply = `${reply}\n\n${SAFETY_NOTE}`;
    }

    const pipeline = buildPipelineTrace({
        input,
        groqResult,
        fallbackUsed,
        fallbackError,
        reply
    });

    return {
        success: true,
        reply,
        answer: reply,
        model: getAiModelMetadata().model,
        provider,
        aiModel: getAiModelMetadata(),
        emergency: false,
        urgent: false,
        riskAssessment: null,
        symptomAnalysis: null,
        llamaRiskAssessment: null,
        safetyNote: SAFETY_NOTE,
        pipeline,
        transformerReasoning: pipeline.steps.find(step => step.name === 'Transformer processes + reasons' || step.step === 'Transformer processes + reasons'),
        rag: null,
        retrievedAt: new Date().toISOString()
    };
}

module.exports = {
    FLOW_STEPS,
    MODEL_MANIFEST_PATH,
    PIPELINE_VERSION,
    normalizePipelineInput,
    runMamasafeAiPipeline
};
