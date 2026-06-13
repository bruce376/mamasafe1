require('dotenv').config();
const { processLocalHealthQuery } = require('./services/localHealthChatbot');

// Test local knowledge base
async function testLocalKnowledge() {
    console.log('Testing local knowledge base...');
    
    try {
        const response = await processLocalHealthQuery("what are normal pregnancy symptoms");
        console.log('Local response:', response);
        return true;
    } catch (error) {
        console.error('Local knowledge test failed:', error);
        return false;
    }
}

// Run the test
testLocalKnowledge().then(success => {
    console.log('Local knowledge test result:', success ? 'SUCCESS' : 'FAILED');
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('Test error:', error);
    process.exit(1);
});
