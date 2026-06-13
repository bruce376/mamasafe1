#!/usr/bin/env node

/**
 * Test Vertex AI Implementation
 * Tests the Vertex AI alternative to the blocked Gemini API
 */

const { testVertexAI, getAvailableModels } = require('./services/vertexAIChatbot');

async function runVertexAITests() {
    console.log('🧪 Vertex AI Testing Suite');
    console.log('=' * 40);
    console.log('Testing Vertex AI as alternative to blocked Gemini API...\n');
    
    try {
        // Test 1: Get available models
        console.log('📋 Test 1: Getting available models...');
        const models = await getAvailableModels();
        console.log(`✅ Found ${models.length} models: ${models.join(', ')}\n`);
        
        // Test 2: Test Vertex AI connection
        console.log('🔌 Test 2: Testing Vertex AI connection...');
        const connectionWorking = await testVertexAI();
        
        if (connectionWorking) {
            console.log('🎉 Vertex AI is working! This can bypass the Gemini API blocking issue.');
            
            // Test 3: Test with health query
            console.log('\n🤱 Test 3: Testing health query...');
            const { processWithVertexAI } = require('./services/vertexAIChatbot');
            
            const healthResponse = await processWithVertexAI(
                "pregnancy symptoms",
                { pregnancyWeek: 12 },
                []
            );
            
            console.log('✅ Health query response:');
            console.log(healthResponse.substring(0, 200) + '...');
            
            console.log('\n🎯 Results Summary:');
            console.log('✅ Vertex AI: Working correctly');
            console.log('✅ Health Queries: Processing successfully');
            console.log('✅ Service Account: Authentication working');
            console.log('✅ Models: Available and accessible');
            
            console.log('\n💡 Recommendation:');
            console.log('Vertex AI is working as an alternative to the blocked Gemini API!');
            console.log('The system will now try Gemini API first, then Vertex AI, then local knowledge.');
            
        } else {
            console.log('❌ Vertex AI connection failed');
            console.log('💡 This means both Gemini API and Vertex AI are having issues');
            console.log('🔧 Solutions:');
            console.log('1. Check service-account.json file permissions');
            console.log('2. Verify Vertex AI API is enabled in Google Cloud');
            console.log('3. Contact Google Cloud Support about both APIs');
        }
        
    } catch (error) {
        console.error('❌ Vertex AI testing failed:', error.message);
        console.error('📝 Full error:', error);
        
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Ensure service-account.json exists and is valid');
        console.log('2. Check Vertex AI API is enabled in Google Cloud Console');
        console.log('3. Verify service account has proper permissions');
        console.log('4. Check network connectivity to Google Cloud services');
    }
}

// Run the tests
runVertexAITests();
