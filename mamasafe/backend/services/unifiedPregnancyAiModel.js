const {
    getAiArchitectureLabel,
    getAiModelMetadata
} = require('../config/aiModel');

const COLLECTIONS = [
    'pregnancy_knowledge',
    'pregnancy_weeks',
    'symptoms',
    'danger_signs',
    'nutrition',
    'articles',
    'faqs',
    'who_guidelines',
    'who_document_chunks',
    'pregnancy_source_datasets',
    'maternal_health_risk_records',
    'maternal_mortality_indicators',
    'health_pregnancy_indicators',
    'who_anc_data_elements',
    'mn_survey_records'
];

const DATASET_USE = {
    engine: getAiArchitectureLabel('MongoDB Vector Search RAG'),
    primaryModel: getAiModelMetadata().model,
    description: 'Llama 3.3 70B running via Groq is the main MamaSafe pregnancy AI. All pregnancy datasets and embeddings should live in MongoDB, not in backend files.',
    datasets: [
        'MongoDB pregnancy knowledge collections',
        'MongoDB maternal-risk records',
        'MongoDB safety and guideline records',
        'MongoDB vector embeddings'
    ],
    collections: COLLECTIONS,
    databaseOnly: true
};

async function trainUnifiedPregnancyAiModel() {
    return {
        success: true,
        trained: false,
        databaseOnly: true,
        aiModel: getAiModelMetadata(),
        metadata: {
            model: getAiModelMetadata().model,
            architecture: getAiArchitectureLabel('MongoDB Vector Search RAG'),
            datasetUse: DATASET_USE
        },
        message: 'Local backend model training is disabled. Store datasets and embeddings in MongoDB and use the RAG pipeline at request time.'
    };
}

async function getUnifiedPregnancyAiStatus() {
    return {
        exists: true,
        modelPath: null,
        metadata: {
            model: getAiModelMetadata().model,
            architecture: getAiArchitectureLabel('MongoDB Vector Search RAG'),
            databaseOnly: true,
            localDatasetStorage: false,
            datasetUse: DATASET_USE
        }
    };
}

async function answerWithUnifiedPregnancyAi() {
    throw new Error('The local unified pregnancy model was removed. Use the MongoDB RAG pipeline through /api/ai/ask.');
}

module.exports = {
    DATASET_USE,
    trainUnifiedPregnancyAiModel,
    getUnifiedPregnancyAiStatus,
    answerWithUnifiedPregnancyAi
};
