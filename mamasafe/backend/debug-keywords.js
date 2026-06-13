const { healthKnowledgeBase } = require('./services/localHealthChatbot');

// Debug keyword matching
function debugKeywordSearch(message) {
    console.log('Searching for:', message);
    console.log('Knowledge base structure:');
    
    // Search through all categories and topics
    for (const [categoryName, category] of Object.entries(healthKnowledgeBase)) {
        console.log(`\nCategory: ${categoryName}`);
        for (const [topicName, topic] of Object.entries(category)) {
            console.log(`  Topic: ${topicName}`);
            console.log(`  Has keywords:`, !!topic.keywords);
            if (topic.keywords) {
                console.log(`  Keywords:`, topic.keywords);
                console.log(`  Message includes keyword:`, topic.keywords.some(keyword => message.includes(keyword)));
                topic.keywords.forEach(keyword => {
                    console.log(`    "${message}" includes "${keyword}":`, message.includes(keyword));
                });
            }
        }
    }
}

debugKeywordSearch("pregnancy symptoms");
