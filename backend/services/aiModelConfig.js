require('dotenv').config();

const DEFAULT_TEXT_MODEL = 'llama-3.3-70b-versatile';
const DEFAULT_VISION_MODELS = [
    'meta-llama/llama-4-scout-17b-16e-instruct',
    'llama-3.2-11b-vision-preview'
];

function splitCsv(value) {
    return String(value || '')
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
}

function getProjectAIModel() {
    return process.env.LLAMA_MODEL || process.env.MAMASAFE_LLM_MODEL || DEFAULT_TEXT_MODEL;
}

function getProjectVisionModels() {
    const configured = splitCsv(process.env.LLAMA_VISION_MODELS || process.env.MAMASAFE_VISION_MODELS);
    return configured.length > 0 ? configured : DEFAULT_VISION_MODELS;
}

module.exports = {
    DEFAULT_TEXT_MODEL,
    DEFAULT_VISION_MODELS,
    getProjectAIModel,
    getProjectVisionModels
};
