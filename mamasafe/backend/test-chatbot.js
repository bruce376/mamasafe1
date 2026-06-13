const { processHealthQuery } = require('./services/healthChatbot');

async function testChatbot() {
  console.log('🤖 Testing chatbot functionality...');
  
  try {
    const response = await processHealthQuery('hey', {});
    console.log('✅ Response received:');
    console.log(response);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testChatbot();
