require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// List available Gemini models
async function listModels() {
    console.log('Testing Gemini API connection...');
    console.log('API Key available:', !!process.env.GEMINI_API_KEY);
    console.log('API Key length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
    
    try {
        // Initialize Gemini AI
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        console.log('Gemini client initialized');
        
        // Try to list models using the REST API directly
        const https = require('https');
        const apiKey = process.env.GEMINI_API_KEY;
        
        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: '/v1beta/models',
            method: 'GET',
            headers: {
                'x-goog-api-key': apiKey
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const models = JSON.parse(data);
                    console.log('Available models:');
                    models.models.forEach(model => {
                        console.log(`- ${model.name} (${model.displayName})`);
                        console.log(`  Supported methods: ${model.supportedGenerationMethods?.join(', ') || 'None'}`);
                    });
                } catch (error) {
                    console.error('Error parsing response:', error);
                    console.log('Raw response:', data);
                }
            });
        });
        
        req.on('error', (error) => {
            console.error('Request error:', error);
        });
        
        req.end();
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

listModels();
