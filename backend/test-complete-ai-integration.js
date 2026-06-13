const { 
    processBabyNamesWithAI,
    processPregnancyWithAI,
    processNutritionWithAI,
    processSleepWithAI,
    processActivitiesWithAI,
    processAppointmentsWithAI,
    processMilestonesWithAI,
    processFertilityWithAI,
    processMentalHealthWithAI,
    processCustomFunctionWithAI
} = require('./services/universalGroqAI');

async function testCompleteAIIntegration() {
    console.log('🤖 Testing Complete Groq AI Integration Across All Functions...\n');
    
    const tests = [
        {
            name: 'Baby Names Search',
            func: processBabyNamesWithAI,
            args: ['beautiful names', 'girl', 'english', 'modern', { pregnancyWeek: 20 }]
        },
        {
            name: 'Pregnancy Tracking',
            func: processPregnancyWithAI,
            args: ['20', 'nausea', 'concerns about weight', { pregnancyWeek: 20 }]
        },
        {
            name: 'Nutrition Planning',
            func: processNutritionWithAI,
            args: ['daily meals', 'vegetarian', 'healthy pregnancy', { pregnancyWeek: 20 }]
        },
        {
            name: 'Sleep Guidance',
            func: processSleepWithAI,
            args: ['6 months', 'waking frequently', 'need routine', { babyAge: 6 }]
        },
        {
            name: 'Activity Recommendations',
            func: processActivitiesWithAI,
            args: ['2 years', 'moderate', 'outdoor activities', { toddlerAge: 2 }]
        },
        {
            name: 'Appointment Scheduling',
            func: processAppointmentsWithAI,
            args: ['prenatal checkup', '20 weeks', 'normal pregnancy', { pregnancyWeek: 20 }]
        },
        {
            name: 'Milestone Tracking',
            func: processMilestonesWithAI,
            args: ['12 months', 'motor skills', 'developmental concerns', { babyAge: 12 }]
        },
        {
            name: 'Fertility Tracking',
            func: processFertilityWithAI,
            args: ['28 days', 'conception', 'irregular cycles', {}]
        },
        {
            name: 'Mental Health Support',
            func: processMentalHealthWithAI,
            args: ['postpartum anxiety', 'panic attacks', 'need support', { pregnancyWeek: 30 }]
        },
        {
            name: 'Custom Function - Toddler Behavior',
            func: processCustomFunctionWithAI,
            args: ['toddler-behavior', 'Help with toddler behavior management', { age: '2 years', issue: 'tantrums' }, { toddlerAge: 2 }]
        }
    ];
    
    let successCount = 0;
    let failureCount = 0;
    
    for (const test of tests) {
        console.log(`--- Testing ${test.name} ---`);
        try {
            const result = await test.func(...test.args);
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
    
    console.log('🎉 Complete AI Integration Test Results:');
    console.log(`✅ Successful Tests: ${successCount}/${tests.length}`);
    console.log(`❌ Failed Tests: ${failureCount}/${tests.length}`);
    console.log(`📊 Success Rate: ${Math.round((successCount / tests.length) * 100)}%`);
    
    if (successCount === tests.length) {
        console.log('🌟 All AI functions are working perfectly!');
    } else if (successCount >= tests.length * 0.8) {
        console.log('⚠️  Most AI functions working, some need attention');
    } else {
        console.log('🚨 Many AI functions need troubleshooting');
    }
}

testCompleteAIIntegration();
