require('dotenv').config();
const { GoogleAuth } = require('google-auth-library');
const path = require('path');

// Test Vertex AI API with service account
async function testVertexAI() {
    console.log('Testing Vertex AI API with service account...');
    
    try {
        // Initialize Google Auth with service account
        const auth = new GoogleAuth({
            keyFile: path.join(__dirname, 'service-account.json'),
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });
        
        const client = await auth.getClient();
        const projectId = 'mamasafe-495117';
        
        // Test Vertex AI API
        const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/gemini-1.5-pro:generateContent`;
        
        const response = await client.request({
            url: endpoint,
            method: 'POST',
            data: {
                contents: [{
                    parts: [{
                        text: "Hello, can you respond with 'Vertex AI working'?"
                    }]
                }]
            }
        });
        
        console.log('✅ Vertex AI API working!');
        console.log('Response:', response.data.candidates[0].content.parts[0].text);
        
    } catch (error) {
        console.error('❌ Vertex AI Error:', error.message);
        console.error('Full error:', error);
    }
}

testVertexAI();
