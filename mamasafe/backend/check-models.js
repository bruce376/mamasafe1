require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Check available models
async function listAvailableModels() {
    console.log('Checking available Gemini models...');
    console.log('API Key available:', !!process.env.GEMINI_API_KEY);
    
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Try different model names
        const models = [
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-pro',
            'gemini-pro-vision',
            'text-bison-001',
            'chat-bison-001'
        ];
        
        for (const modelName of models) {
            try {
                console.log(`Testing model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello");
                console.log(`✅ ${modelName} - WORKING`);
                console.log(`Response: ${result.response.text().substring(0, 100)}...`);
                break;
            } catch (error) {
                console.log(`❌ ${modelName} - ${error.message}`);
            }
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

listAvailableModels();
