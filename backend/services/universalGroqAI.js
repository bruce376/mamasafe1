require('dotenv').config();
const Groq = require('groq-sdk');
const { getProjectAIModel } = require('./aiModelConfig');

/**
 * Universal Groq AI Service for All Mamasafe Functions
 * Provides AI-powered responses for any function in the application
 */

let groq;

function getGroqClient() {
    if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is not configured');
    }
    if (!groq) {
        groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return groq;
}

/**
 * Universal AI processor for any function request
 * @param {string} functionName - Name of the function calling AI
 * @param {string} context - Context about what the function does
 * @param {Object} inputData - Input data for the function
 * @param {Object} userContext - User profile and context
 * @returns {Promise<Object>} AI-generated response
 */
async function processWithUniversalAI(functionName, context, inputData = {}, userContext = {}) {
    try {
        console.log(`🤖 Processing ${functionName} with Groq AI...`);
        
        // Build comprehensive prompt
        const prompt = buildUniversalPrompt(functionName, context, inputData, userContext);
        
        // Get Groq model
        const model = getProjectAIModel();
        
        // Generate content
        const response = await getGroqClient().chat.completions.create({
            model: model,
            messages: [
                {
                    role: 'system',
                    content: `You are Mamasafe assistant AI, providing intelligent responses for all functions in the Mamasafe application with a ChatGPT-like conversational style.

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
4. Next steps or follow-up suggestions`
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 1000,
            top_p: 0.9,
            stream: false
        });
        
        const text = response.choices[0].message.content;
        
        console.log(`✅ ${functionName} AI response successful`);
        return {
            success: true,
            response: text,
            functionName: functionName,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.error(`❌ ${functionName} AI Error:`, error.message);
        return {
            success: false,
            error: error.message,
            functionName: functionName,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Build comprehensive prompt for any function
 */
function buildUniversalPrompt(functionName, context, inputData, userContext) {
    let prompt = `Function: ${functionName}\n`;
    prompt += `Context: ${context}\n\n`;
    
    if (Object.keys(userContext).length > 0) {
        prompt += `User Context:\n`;
        if (userContext.pregnancyWeek) {
            prompt += `- Pregnancy Week: ${userContext.pregnancyWeek}\n`;
        }
        if (userContext.babyAge) {
            prompt += `- Baby Age: ${userContext.babyAge} months\n`;
        }
        if (userContext.toddlerAge) {
            prompt += `- Toddler Age: ${userContext.toddlerAge} years\n`;
        }
        if (userContext.healthConcerns) {
            prompt += `- Health Concerns: ${userContext.healthConcerns}\n`;
        }
        prompt += `\n`;
    }
    
    if (Object.keys(inputData).length > 0) {
        prompt += `Input Data:\n`;
        Object.entries(inputData).forEach(([key, value]) => {
            prompt += `- ${key}: ${value}\n`;
        });
        prompt += `\n`;
    }
    
    prompt += `Please provide a comprehensive and helpful response for this ${functionName} function. Consider the user's specific context and provide personalized recommendations.\n\n`;
    prompt += `Response:`;
    
    return prompt;
}

/**
 * AI-powered baby names search and recommendations
 */
async function processBabyNamesWithAI(query, gender, origin, style, userContext = {}) {
    return await processWithUniversalAI(
        'baby-names-search',
        'Search and recommend baby names based on user preferences',
        { query, gender, origin, style },
        userContext
    );
}

/**
 * AI-powered pregnancy tracking and advice
 */
async function processPregnancyWithAI(week, symptoms, concerns, userContext = {}) {
    return await processWithUniversalAI(
        'pregnancy-tracking',
        'Provide pregnancy week-by-week information and advice',
        { week, symptoms, concerns },
        userContext
    );
}

/**
 * AI-powered nutrition recommendations
 */
async function processNutritionWithAI(mealPlan, dietaryRestrictions, goals, userContext = {}) {
    return await processWithUniversalAI(
        'nutrition-planning',
        'Create personalized nutrition plans and recommendations',
        { mealPlan, dietaryRestrictions, goals },
        userContext
    );
}

/**
 * AI-powered sleep guidance
 */
async function processSleepWithAI(age, sleepIssues, schedule, userContext = {}) {
    return await processWithUniversalAI(
        'sleep-guidance',
        'Provide sleep advice and solutions for different ages',
        { age, sleepIssues, schedule },
        userContext
    );
}

/**
 * AI-powered activity recommendations
 */
async function processActivitiesWithAI(age, activityLevel, interests, userContext = {}) {
    return await processWithUniversalAI(
        'activity-recommendations',
        'Suggest age-appropriate activities and exercises',
        { age, activityLevel, interests },
        userContext
    );
}

/**
 * AI-powered appointment scheduling advice
 */
async function processAppointmentsWithAI(type, timing, concerns, userContext = {}) {
    return await processWithUniversalAI(
        'appointment-scheduling',
        'Provide appointment scheduling advice and preparation',
        { type, timing, concerns },
        userContext
    );
}

/**
 * AI-powered milestone tracking
 */
async function processMilestonesWithAI(age, developmentArea, concerns, userContext = {}) {
    return await processWithUniversalAI(
        'milestone-tracking',
        'Track and provide developmental milestone information',
        { age, developmentArea, concerns },
        userContext
    );
}

/**
 * AI-powered fertility and ovulation tracking
 */
async function processFertilityWithAI(cycleLength, goals, concerns, userContext = {}) {
    return await processWithUniversalAI(
        'fertility-tracking',
        'Provide fertility and ovulation tracking guidance',
        { cycleLength, goals, concerns },
        userContext
    );
}

/**
 * AI-powered mental health support
 */
async function processMentalHealthWithAI(concerns, symptoms, supportNeeds, userContext = {}) {
    return await processWithUniversalAI(
        'mental-health-support',
        'Provide mental health support and resources',
        { concerns, symptoms, supportNeeds },
        userContext
    );
}

/**
 * Generic AI processor for any custom function
 */
async function processCustomFunctionWithAI(functionName, description, inputData, userContext = {}) {
    return await processWithUniversalAI(
        functionName,
        description,
        inputData,
        userContext
    );
}

module.exports = {
    processWithUniversalAI,
    processBabyNamesWithAI,
    processPregnancyWithAI,
    processNutritionWithAI,
    processSleepWithAI,
    processActivitiesWithAI,
    processAppointmentsWithAI,
    processMilestonesWithAI,
    processFertilityWithAI,
    processMentalHealthWithAI,
    processCustomFunctionWithAI
};
