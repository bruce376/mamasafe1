const { processLocalHealthQuery, generateLocalHealthSuggestions } = require('./localHealthChatbot');
const { processWithGroq, testGroqAI } = require('./groqChatbot');

// Health-focused system prompt for the chatbot
const HEALTH_SYSTEM_PROMPT = `You are Mamasafe assistant AI inside Mamasafe. Respond with the same conversational quality, reasoning clarity, and formatting style users expect from ChatGPT.

RESPONSE GUIDELINES:
- Give a direct answer first, then add context or steps when useful
- Use natural, warm, conversational language
- Use short sections, bullets, or numbered steps when they make the answer easier to scan
- Ask one concise follow-up question when the user's goal is unclear
- Remember recent conversation context and avoid repeating yourself
- For greetings, respond naturally and offer help
- For health, pregnancy, baby, or emergency topics, be helpful and practical while clearly telling the user to seek urgent/professional care when symptoms could be serious
- Do not claim to be ChatGPT; simply answer with a ChatGPT-like style

Respond to the user's message with the best possible answer.`;

/**
 * Process health query using Groq AI with local knowledge fallback
 * @param {string} userMessage - The user's health question
 * @param {Object} userContext - User's profile and context (pregnancy stage, baby age, etc.)
 * @param {Object} chatHistory - Previous conversation history
 * @returns {Promise<string>} The chatbot response
 */
async function processHealthQuery(userMessage, userContext = {}, chatHistory = []) {
    console.log('🤖 Processing health query with Groq AI...');
    
    // Use Groq AI as primary (fast, free, and working)
    try {
        console.log('🚀 Using Groq AI...');
        const groqResponse = await processWithGroq(userMessage, userContext, chatHistory);
        console.log('✅ Groq AI response successful');
        return groqResponse;
    } catch (groqError) {
        console.error('❌ Groq AI Error:', groqError.message);
        console.log('⚠️  Falling back to local knowledge base');
        
        // Fallback to local knowledge
        try {
            const localResponse = await processLocalHealthQuery(userMessage, userContext);
            console.log('⚠️  Using local knowledge fallback');
            return localResponse;
        } catch (localError) {
            console.error('❌ Complete system failure - using emergency response');
            
            // Emergency fallback
            return `I apologize, but I'm experiencing technical difficulties with my AI systems. For immediate health concerns, please contact your healthcare provider or emergency services.

Emergency Resources:
- Emergency Services: 911
- Your Local Hospital Emergency Room
- Poison Control: 1-800-222-1222

For non-urgent health questions, please try again later or consult with your healthcare provider.`;
        }
    }
}

/**
 * Check if query requires immediate medical attention
 * @param {string} message - User's message
 * @returns {Object} Emergency assessment
 */
function checkEmergencyKeywords(message) {
    const emergencyKeywords = [
        'emergency', 'urgent', 'severe pain', 'bleeding', 'chest pain', 
        'difficulty breathing', 'faint', 'unconscious', 'high fever',
        'seizure', 'allergic reaction', 'swallow', 'poison', 'suicide'
    ];

    const lowerMessage = message.toLowerCase();
    const foundKeywords = emergencyKeywords.filter(keyword => 
        lowerMessage.includes(keyword.toLowerCase())
    );

    return {
        isEmergency: foundKeywords.length > 0,
        keywords: foundKeywords,
        message: foundKeywords.length > 0 ? 
            '⚠️ This sounds like it might require immediate medical attention. Please call emergency services (911) or go to the nearest emergency room right away.' : 
            null
    };
}

/**
 * Generate chatbot suggestions based on context
 * @param {Object} userContext - User's profile information
 * @returns {Array} List of suggested topics
 */
function generateHealthSuggestions(userContext = {}) {
  // Use local knowledge base suggestions
  return generateLocalHealthSuggestions(userContext);
}

module.exports = {
    processHealthQuery,
    checkEmergencyKeywords,
    generateHealthSuggestions
};
