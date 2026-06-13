require('dotenv').config();
const { processWithGroq } = require('./services/groqChatbot');

async function testBabyNames() {
    try {
        console.log('🧪 Testing Groq AI for baby names generation...');
        
        const message = 'Generate 5 baby names. Return ONLY a JSON array with this exact format: [{"name": "Name", "gender": "male/female/unisex", "origin": "Origin", "meaning": "Meaning"}]. Include diverse names from different cultures.';
        const context = { requestType: 'baby-names' };
        
        const response = await processWithGroq(message, context, []);
        
        console.log('✅ Groq AI Response:');
        console.log(response);
        
        // Try to parse as JSON
        try {
            const jsonMatch = response.match(/\[[\s\S]*?\]/);
            if (jsonMatch) {
                const names = JSON.parse(jsonMatch[0]);
                console.log('✅ Successfully parsed names:');
                console.log(JSON.stringify(names, null, 2));
            } else {
                console.log('⚠️ No JSON array found in response');
            }
        } catch (parseError) {
            console.error('❌ Failed to parse JSON:', parseError.message);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testBabyNames();
