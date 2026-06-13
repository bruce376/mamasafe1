require('dotenv').config();
const { getAiModelMetadata } = require('../config/aiModel');
const { chatWithGroq } = require('./groqService');

const UNIVERSAL_SYSTEM_PROMPT = `You are MamaCare/MamaSafe assistant AI, providing intelligent responses for all functions in the application with a ChatGPT-like conversational style.

RESPONSE GUIDELINES:
- Give a direct answer first
- Use natural conversational language
- Be specific to the user's context and needs
- Include practical advice and recommendations
- Use clean sections, bullets, or numbered steps when helpful
- Ask a concise follow-up question if the request is unclear
- For medical or urgent symptoms, include appropriate professional-care guidance
- Be engaging and supportive

For each function, provide:
1. Direct answer to the user's request
2. Practical recommendations
3. Additional helpful tips
4. Next steps or follow-up suggestions`;

async function processWithUniversalAI(functionName, context, inputData = {}, userContext = {}) {
    try {
        console.log(`Processing ${functionName} with Groq/Llama 3.3 70B...`);

        const prompt = buildUniversalPrompt(functionName, context, inputData, userContext);
        const text = await chatWithGroq(UNIVERSAL_SYSTEM_PROMPT, prompt, {
            temperature: 0.7,
            maxTokens: 1000
        });

        console.log(`${functionName} Groq response successful`);
        return {
            success: true,
            response: text,
            functionName,
            aiModel: getAiModelMetadata(),
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error(`${functionName} Groq error:`, error.message);
        return {
            success: false,
            error: error.message,
            functionName,
            timestamp: new Date().toISOString()
        };
    }
}

function buildUniversalPrompt(functionName, context, inputData, userContext) {
    let prompt = `Function: ${functionName}\n`;
    prompt += `Context: ${context}\n\n`;

    if (Object.keys(userContext).length > 0) {
        prompt += 'User Context:\n';
        if (userContext.pregnancyWeek) {
            prompt += `- Pregnancy Week: ${userContext.pregnancyWeek}\n`;
        }
        if (userContext.healthConcerns) {
            prompt += `- Health Concerns: ${userContext.healthConcerns}\n`;
        }
        prompt += '\n';
    }

    if (Object.keys(inputData).length > 0) {
        prompt += 'Input Data:\n';
        Object.entries(inputData).forEach(([key, value]) => {
            prompt += `- ${key}: ${value}\n`;
        });
        prompt += '\n';
    }

    prompt += `Please provide a comprehensive and helpful response for this ${functionName} function. Consider the user's specific context and provide personalized recommendations.\n\n`;
    prompt += 'Response:';

    return prompt;
}

async function processBabyNamesWithAI(query, gender, origin, style, userContext = {}) {
    return processWithUniversalAI(
        'baby-names-search',
        'Search and recommend baby names based on user preferences',
        { query, gender, origin, style },
        userContext
    );
}

async function processPregnancyWithAI(week, symptoms, concerns, userContext = {}) {
    return processWithUniversalAI(
        'pregnancy-tracking',
        'Provide pregnancy week-by-week information and advice',
        { week, symptoms, concerns },
        userContext
    );
}

async function processNutritionWithAI(mealPlan, dietaryRestrictions, goals, userContext = {}) {
    return processWithUniversalAI(
        'nutrition-planning',
        'Create personalized nutrition plans and recommendations',
        { mealPlan, dietaryRestrictions, goals },
        userContext
    );
}

async function processSleepWithAI(age, sleepIssues, schedule, userContext = {}) {
    return processWithUniversalAI(
        'sleep-guidance',
        'Provide sleep advice and solutions for different ages',
        { age, sleepIssues, schedule },
        userContext
    );
}

async function processAppointmentsWithAI(type, timing, concerns, userContext = {}) {
    return processWithUniversalAI(
        'appointment-scheduling',
        'Provide appointment scheduling advice and preparation',
        { type, timing, concerns },
        userContext
    );
}

async function processMentalHealthWithAI(concerns, symptoms, supportNeeds, userContext = {}) {
    return processWithUniversalAI(
        'mental-health-support',
        'Provide mental health support and resources',
        { concerns, symptoms, supportNeeds },
        userContext
    );
}

async function processCustomFunctionWithAI(functionName, description, inputData, userContext = {}) {
    return processWithUniversalAI(functionName, description, inputData, userContext);
}

module.exports = {
    processWithUniversalAI,
    processBabyNamesWithAI,
    processPregnancyWithAI,
    processNutritionWithAI,
    processSleepWithAI,
    processAppointmentsWithAI,
    processMentalHealthWithAI,
    processCustomFunctionWithAI,
    getAiModelMetadata
};
