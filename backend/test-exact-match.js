require('dotenv').config();
const { processWithGroq } = require('./services/groqChatbot');

async function testExactMatch() {
    try {
        console.log('🧪 Testing exact name match + similar names...');
        
        const message = 'Generate baby names for: "Leila". If the user is searching for a specific name, include that exact name first if it exists, then provide 4 similar names. If searching generally, provide 5 diverse names. Return ONLY a JSON array with this exact format: [{"name": "Name", "gender": "male/female/unisex", "origin": "Origin", "meaning": "Meaning"}]. Include diverse names from different cultures.';
        const context = { requestType: 'baby-names', searchQuery: 'Leila' };
        
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
                
                // Check if first name is exact match
                if (names.length > 0 && names[0].name.toLowerCase() === 'leila') {
                    console.log('🎯 Exact match found!');
                } else {
                    console.log('⚠️ No exact match found');
                }
                
                console.log(`📊 Total names: ${names.length}`);
                console.log(`👥 Similar names: ${Math.max(0, names.length - 1)}`);
                
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

testExactMatch();
