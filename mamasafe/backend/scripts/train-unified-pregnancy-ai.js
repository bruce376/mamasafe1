const { getAiArchitectureLabel, getAiModelMetadata } = require('../config/aiModel');

const aiModel = getAiModelMetadata();

console.log('Local unified pregnancy model training is disabled.');
console.log(`Primary AI model: ${aiModel.model}`);
console.log(`Architecture: ${getAiArchitectureLabel('MongoDB Vector Search RAG')}`);
console.log('Pregnancy datasets and embeddings should stay in MongoDB.');
console.log('Run `npm run embed:pregnancy-knowledge` after adding or updating MongoDB pregnancy records.');
