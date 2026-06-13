require('dotenv').config();
const Groq = require('groq-sdk');

/**
 * Groq AI Chatbot Service
 * Fast, free AI service using Llama models
 * Perfect alternative to blocked Gemini API
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
 * Process health query using Groq AI
 * @param {string} userMessage - User's health query
 * @param {object} userContext - User context (pregnancy week, baby age, etc.)
 * @param {array} chatHistory - Conversation history
 * @returns {Promise<string>} - AI response
 */
async function processWithGroq(userMessage, userContext = {}, chatHistory = []) {
    try {
        console.log('🚀 Processing with Groq AI...');
        
        // Create prompt with context and history
        const context = buildContext(userContext, chatHistory);
        const prompt = `${context}

User: ${userMessage}

Please provide a helpful and comprehensive answer to the user's question above.`;
        
        // Get Groq model - using current supported model
        const model = 'llama-3.3-70b-versatile';
        
        // Generate content
        const response = await getGroqClient().chat.completions.create({
            model: model,
            messages: [
                {
                    role: 'system',
                    content: `You are Mamasafe assistant AI inside Mamasafe. Respond with the same conversational quality, reasoning clarity, and formatting style users expect from ChatGPT.

RESPONSE GUIDELINES:
- Give a direct answer first, then add context or steps when useful
- Use natural, warm, conversational language
- Use short sections, bullets, or numbered steps when they make the answer easier to scan
- Ask one concise follow-up question when the user's goal is unclear
- Remember recent conversation context and avoid repeating yourself
- For greetings, respond naturally and offer help
- For health, pregnancy, baby, or emergency topics, be helpful and practical while clearly telling the user to seek urgent/professional care when symptoms could be serious
- Do not claim to be ChatGPT; simply answer with a ChatGPT-like style

Respond to the user's message with the best possible answer.`
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
        
        console.log('✅ Groq AI response successful');
        return text;
        
    } catch (error) {
        console.error('❌ Groq AI Error:', error.message);
        throw error;
    }
}

async function processImageWithGroq({ image, mimeType = 'image/jpeg', prompt = 'Please analyze this image.' }, userContext = {}) {
    if (!image) {
        throw new Error('Image data is required');
    }

    const dataUrl = image.startsWith('data:')
        ? image
        : `data:${mimeType};base64,${image}`;

    const context = buildContext(userContext, []);
    const userPrompt = `${context}

User image request: ${prompt}

Please look at the image and answer in a clear ChatGPT-like style. If the image appears related to pregnancy, baby care, food, medicine, skin, symptoms, documents, or safety, be practical and careful. If something may be urgent or medical, tell the user to contact a qualified professional.`;

    const visionModels = [
        'meta-llama/llama-4-scout-17b-16e-instruct',
        'llama-3.2-11b-vision-preview'
    ];

    let lastError;
    for (const model of visionModels) {
        try {
            const response = await getGroqClient().chat.completions.create({
                model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are Mamasafe assistant AI. Analyze user-provided images and respond clearly, conversationally, and helpfully.'
                    },
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: userPrompt },
                            { type: 'image_url', image_url: { url: dataUrl } }
                        ]
                    }
                ],
                temperature: 0.4,
                max_tokens: 900,
                top_p: 0.9,
                stream: false
            });

            return response.choices?.[0]?.message?.content || 'I received the image, but I could not generate an analysis.';
        } catch (error) {
            lastError = error;
            console.warn(`Vision model ${model} failed:`, error.message);
        }
    }

    throw lastError || new Error('No vision model could process the image');
}

/**
 * Build context string from user context and chat history
 * @param {object} userContext - User context
 * @param {array} chatHistory - Chat history
 * @returns {string} - Context string
 */
function buildContext(userContext, chatHistory) {
    let context = '';
    
    // Add user context
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
    
    // Add recent chat history
    if (chatHistory && chatHistory.length > 0) {
        context += 'Recent Conversation:\n';
        const recentHistory = chatHistory.slice(-3); // Last 3 messages
        recentHistory.forEach(msg => {
            context += `- ${msg.role}: ${msg.content}\n`;
        });
        context += '\n';
    }
    
    return context;
}

/**
 * Test Groq AI connection
 * @returns {Promise<boolean>} - True if working
 */
async function testGroqAI() {
    try {
        console.log('🧪 Testing Groq AI connection...');
        
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'user',
                    content: 'Hello, please respond with "Groq AI is working" if you can understand this.'
                }
            ],
            max_tokens: 50
        });
        
        const text = response.choices[0].message.content;
        
        if (text.includes('working')) {
            console.log('✅ Groq AI is working correctly');
            return true;
        } else {
            console.log('⚠️ Groq AI responded but not as expected:', text);
            return false;
        }
        
    } catch (error) {
        console.error('❌ Groq AI test failed:', error.message);
        return false;
    }
}

/**
 * Get available Groq models
 * @returns {Promise<string[]>} - List of available models
 */
async function getAvailableModels() {
    try {
        console.log('📋 Getting available Groq models...');
        
        // Return known working models
        const models = [
            'llama-3.3-70b-versatile',
            'llama-3.1-8b-instant',
            'qwen/qwen3-32b'
        ];
        
        console.log('✅ Available models:', models);
        return models;
        
    } catch (error) {
        console.error('❌ Error getting models:', error.message);
        return [];
    }
}

module.exports = {
    processWithGroq,
    processImageWithGroq,
    testGroqAI,
    getAvailableModels
};
