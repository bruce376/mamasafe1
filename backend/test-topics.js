const { processHealthQuery } = require('./services/healthChatbot');

async function testTopicResponses() {
  console.log('🤖 Testing quick help topics with Groq AI...');
  
  const topics = [
    'pregnancy weeks',
    'symptoms',
    'nutrition',
    'exercise',
    'fetal development'
  ];
  
  for (const topic of topics) {
    console.log(`\n--- Testing: ${topic} ---`);
    try {
      const response = await processHealthQuery(`Tell me about ${topic}`, {});
      console.log('✅ Response received:');
      console.log(response.substring(0, 200) + '...');
      
      // Check if it's using AI (not local knowledge)
      if (response.includes('•') || response.includes('**')) {
        console.log('⚠️  Might be using local knowledge (contains bullet points/markdown)');
      } else {
        console.log('✅ Using Groq AI (natural language)');
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }
}

testTopicResponses();
