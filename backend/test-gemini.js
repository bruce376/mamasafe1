require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Test Gemini API connection
async function testGeminiAPI() {
    console.log('Testing Gemini API connection...');
    console.log('API Key available:', !!process.env.GEMINI_API_KEY);
    console.log('API Key length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
    
    try {
        // Initialize Gemini AI
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        console.log('Gemini client initialized');
        
        // Test with a simple prompt - try Vertex AI model format
        const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
        console.log('Model created');
        
        const result = await model.generateContent("Hello, can you respond with 'API working'?");
        console.log('API call successful');
        
        const response = result.response.text();
        console.log('Response:', response);
        
        return true;
    } catch (error) {
        console.error('API Test Failed:', error.message);
        console.error('Full error:', error);
        return false;
    }
}

// Run the test
testGeminiAPI().then(success => {
    console.log('Test result:', success ? 'SUCCESS' : 'FAILED');
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('Test error:', error);
    process.exit(1);
});
