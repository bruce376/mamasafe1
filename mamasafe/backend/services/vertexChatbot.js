require('dotenv').config();

/**
 * Process health query using Vertex AI Gemini with API key
 */
async function processWithVertexAI(userMessage, userContext = {}) {
  console.log('🤖 Using Vertex AI Gemini with API key...');
  
  try {
    const projectId = 'mamasafe-495117';
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Build context-aware prompt
    let contextMessage = '';
    if (userContext.pregnancyWeek) {
      contextMessage = `The user is currently ${userContext.pregnancyWeek} weeks pregnant. `;
    } else if (userContext.babyAge) {
      contextMessage = `The user has a baby who is ${userContext.babyAge} months old. `;
    }

    const prompt = `You are Mamasafe Health Assistant, a specialized AI health companion for pregnant women, new mothers, and families.

IMPORTANT GUIDELINES:
1. Always provide a medical disclaimer: "I'm an AI assistant and not a substitute for professional medical advice. Please consult with your healthcare provider for medical concerns."
2. Focus on evidence-based information and common health knowledge
3. Be empathetic, supportive, and understanding
4. Never provide definitive diagnoses - always suggest consulting healthcare professionals
5. For emergencies, immediately advise seeking immediate medical attention

${contextMessage}
User Question: ${userMessage}

Remember: I'm an AI assistant and not a substitute for professional medical advice.`;

    // Call Vertex AI API with API key
    const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Vertex AI API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Vertex AI response successful');
    const aiResponse = data.candidates[0].content.parts[0].text;
    
    return aiResponse;
    
  } catch (error) {
    console.error('❌ Vertex AI Error:', error.message);
    throw error;
  }
}

module.exports = {
  processWithVertexAI
};
