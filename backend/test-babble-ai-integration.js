const { processCustomFunctionWithAI } = require('./services/universalGroqAI');

async function testBabbleAIIntegration() {
    console.log('🤖 Testing Groq AI Integration in Babble Games...\n');
    
    const tests = [
        {
            name: 'Babble Welcome Message',
            functionName: 'babble-welcome-message',
            query: 'Create a fun, engaging welcome message for animals category in a baby learning game',
            context: { category: 'animals' },
            userContext: { babyAge: '1-3 years' }
        },
        {
            name: 'Babble Word Encouragement',
            functionName: 'babble-word-encouragement',
            query: 'Create a fun, encouraging message for a baby learning the word "cat" with emoji 🐱',
            context: { word: 'cat', emoji: '🐱', mood: 'excited' },
            userContext: { babyAge: '1-3 years' }
        },
        {
            name: 'Babble Category Completion',
            functionName: 'babble-category-completion',
            query: 'Create an exciting, celebratory message for completing the animals category in a baby learning game',
            context: { category: 'animals', wordsLearned: 10 },
            userContext: { babyAge: '1-3 years' }
        },
        {
            name: 'Babble Level Up',
            functionName: 'babble-level-up',
            query: 'Create an exciting, motivational message for reaching level 3 in a baby learning game',
            context: { level: 3, wordsLearned: 25 },
            userContext: { babyAge: '1-3 years' }
        }
    ];
    
    let successCount = 0;
    let failureCount = 0;
    
    for (const test of tests) {
        console.log(`--- Testing ${test.name} ---`);
        try {
            const result = await processCustomFunctionWithAI(
                test.functionName,
                test.query,
                test.context,
                test.userContext
            );
            
            if (result.success) {
                console.log(`✅ ${test.name}: Success`);
                console.log(`Response: ${result.response.substring(0, 150)}...`);
                successCount++;
            } else {
                console.log(`❌ ${test.name}: Failed - ${result.error}`);
                failureCount++;
            }
        } catch (error) {
            console.log(`❌ ${test.name}: Error - ${error.message}`);
            failureCount++;
        }
        console.log('');
    }
    
    console.log('🎉 Babble AI Integration Test Results:');
    console.log(`✅ Successful Tests: ${successCount}/${tests.length}`);
    console.log(`❌ Failed Tests: ${failureCount}/${tests.length}`);
    console.log(`📊 Success Rate: ${Math.round((successCount / tests.length) * 100)}%`);
    
    if (successCount === tests.length) {
        console.log('🌟 All babble AI functions are working perfectly!');
    } else if (successCount >= tests.length * 0.8) {
        console.log('⚠️  Most babble AI functions working, some need attention');
    } else {
        console.log('🚨 Many babble AI functions need troubleshooting');
    }
}

testBabbleAIIntegration();
