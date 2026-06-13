const { GoogleAuth } = require('google-auth-library');
const path = require('path');

// Test available Vertex AI models
async function listVertexModels() {
    console.log('Checking available Vertex AI models...');
    
    try {
        const auth = new GoogleAuth({
            keyFile: path.join(__dirname, 'service-account.json'),
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });
        
        const client = await auth.getClient();
        const projectId = 'mamasafe-495117';
        
        // List available models
        const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models`;
        
        const response = await client.request({
            url: endpoint,
            method: 'GET'
        });
        
        console.log('✅ Available models:');
        const models = response.data.models || [];
        
        // Filter for Gemini models
        const geminiModels = models.filter(model => 
            model.displayName && model.displayName.toLowerCase().includes('gemini')
        );
        
        geminiModels.forEach(model => {
            console.log(`- ${model.displayName} (${model.name})`);
            console.log(`  Supported methods: ${model.supportedGenerationMethods?.join(', ') || 'Unknown'}`);
        });
        
        if (geminiModels.length === 0) {
            console.log('No Gemini models found. Showing all models:');
            models.forEach(model => {
                console.log(`- ${model.displayName || model.name}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error listing models:', error.message);
    }
}

listVertexModels();
