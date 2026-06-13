const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile';
const AI_MODEL_DISPLAY_NAME = 'Llama 3.3 70B';
const AI_PROVIDER = 'groq';
const AI_PROVIDER_LABEL = 'Groq';
const AI_RUNTIME = 'Groq Cloud API';

function getEnvValue(name) {
    const value = process.env[name];
    return typeof value === 'string' && value.trim() ? value.trim() : '';
}

function getGroqChatModel() {
    return getEnvValue('GROQ_MODEL') || DEFAULT_GROQ_MODEL;
}

function getAiModelMetadata() {
    return {
        provider: AI_PROVIDER,
        providerLabel: AI_PROVIDER_LABEL,
        model: getGroqChatModel(),
        displayName: AI_MODEL_DISPLAY_NAME,
        runtime: AI_RUNTIME
    };
}

function getAiArchitectureLabel(suffix = '') {
    const base = `${AI_MODEL_DISPLAY_NAME} via ${AI_PROVIDER_LABEL}`;
    return suffix ? `${base} + ${suffix}` : base;
}

module.exports = {
    AI_MODEL_DISPLAY_NAME,
    AI_PROVIDER,
    AI_PROVIDER_LABEL,
    AI_RUNTIME,
    DEFAULT_GROQ_MODEL,
    getAiArchitectureLabel,
    getAiModelMetadata,
    getGroqChatModel
};
