require('dotenv').config();
const {
    AI_MODEL_DISPLAY_NAME,
    getAiModelMetadata
} = require('../config/aiModel');
const { chatWithGroq } = require('./groqService');

const HEALTH_SYSTEM_PROMPT = `User Question
        ↓
Frontend (React)
        ↓
Backend (Node.js)
        ↓
Groq API
        ↓
Llama 3.3 70B
        ↓
AI Response
        ↓
User.

You are MamaCare, an AI pregnancy and maternal health assistant powered by Llama 3.3 70B.

Your purpose is to provide clear, supportive, and easy-to-understand pregnancy information using your built-in medical and general knowledge.

Instructions:
- Answer user questions directly using your own knowledge
- Do not search a database or request external pregnancy records
- Do not mention MongoDB, RAG, vector search, or internal system architecture
- Provide explanations in simple language suitable for pregnant mothers and families
- Provide information about pregnancy symptoms, nutrition, fetal development, exercise, mental health, prenatal care, and general maternal wellness
- When a user describes severe symptoms such as heavy bleeding, seizures, severe abdominal pain, difficulty breathing, or loss of consciousness, clearly advise them to seek immediate medical care
- Avoid presenting uncertain information as fact. If information can vary depending on personal medical history, recommend consulting a qualified healthcare professional
- Be empathetic, respectful, and supportive
- Make your answers well-structured and easy to understand

You are an educational assistant and not a replacement for a doctor, midwife, or emergency medical service.`;

async function processWithGroq(userMessage, userContext = {}, chatHistory = []) {
    try {
        console.log('Processing with Groq/Llama 3.3 70B...');

        const context = buildContext(userContext, chatHistory);
        const prompt = `${context}

User: ${userMessage}

Please provide a helpful and comprehensive answer to the user's question above.`;

        const text = await chatWithGroq(HEALTH_SYSTEM_PROMPT, prompt, {
            temperature: 0.7,
            maxTokens: 1000
        });

        console.log('Groq response successful');
        return text;
    } catch (error) {
        console.error('Groq chat error:', error.message);
        throw error;
    }
}

async function processImageWithGroq({ image, mimeType = 'image/jpeg', prompt = 'Please analyze this image.' }, userContext = {}) {
    if (!image) {
        throw new Error('Image data is required');
    }

    const context = buildContext(userContext, []);
    const descriptionPrompt = `${context}

The user uploaded an image related to: ${prompt}

Image analysis is not available yet.
Give practical general guidance for what the user might be asking about, and recommend they describe visible symptoms or share the image with their healthcare provider when appropriate.`;

    return chatWithGroq(HEALTH_SYSTEM_PROMPT, descriptionPrompt, {
        temperature: 0.4,
        maxTokens: 700
    });
}

function buildContext(userContext, chatHistory) {
    let context = '';

    if (Object.keys(userContext).length > 0) {
        context += 'User Context:\n';
        if (userContext.pregnancyWeek) {
            context += `- Pregnancy Week: ${userContext.pregnancyWeek}\n`;
        }
        if (userContext.babyAge) {
            context += `- Baby Age: ${userContext.babyAge} months\n`;
        }
        if (userContext.healthConcerns) {
            context += `- Health Concerns: ${userContext.healthConcerns}\n`;
        }
        context += '\n';
    }

    if (chatHistory && chatHistory.length > 0) {
        context += 'Recent Conversation:\n';
        const recentHistory = chatHistory.slice(-3);
        recentHistory.forEach((msg) => {
            context += `- ${msg.role}: ${msg.content}\n`;
        });
        context += '\n';
    }

    return context;
}

async function testGroqAI() {
    try {
        console.log('Testing Groq connection...');
        const testResponse = await chatWithGroq(
            'You are a test assistant.',
            'Please respond with "OK" if you are working correctly.',
            { temperature: 0.1, maxTokens: 10 }
        );
        const ok = testResponse.includes('OK');
        if (ok) {
            console.log('Groq is working correctly');
        } else {
            console.log('Groq responded but not as expected');
        }
        return ok;
    } catch (error) {
        console.error('Groq test failed:', error.message);
        return false;
    }
}

async function getAvailableModels() {
    return [getAiModelMetadata().model];
}

module.exports = {
    processWithGroq,
    processImageWithGroq,
    testGroqAI,
    getAvailableModels,
    getAiModelMetadata,
    AI_MODEL_DISPLAY_NAME
};
