const { processHealthQuery } = require('./services/healthChatbot');

async function testUpdatedChatbot() {
  console.log('🤖 Testing updated chatbot functionality...');
  
  try {
    const response = await processHealthQuery('hey', {});
    console.log('✅ Response received:');
    console.log(response);
    console.log('\n--- Testing if response contains bullet points ---');
    if (response.includes('•') || response.includes('Disclaimer')) {
      console.log('❌ Still contains old formatting');
    } else {
      console.log('✅ Clean formatting - no bullet points or disclaimers');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testUpdatedChatbot();
