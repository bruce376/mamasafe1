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

async function testUniversalAI() {
    console.log('🤖 Testing Universal Groq AI for all functions...\n');
    
    // Test Baby Names
    console.log('--- Testing Baby Names ---');
    try {
        const result = await processBabyNamesWithAI('beautiful names', 'girl', 'english', 'modern', { pregnancyWeek: 20 });
        console.log('✅ Baby Names:', result.success ? 'Success' : 'Failed');
        if (result.success) console.log('Response:', result.response.substring(0, 100) + '...');
    } catch (error) {
        console.log('❌ Baby Names Error:', error.message);
    }
    
    // Test Pregnancy Tracking
    console.log('\n--- Testing Pregnancy Tracking ---');
    try {
        const result = await processPregnancyWithAI('20', 'nausea', 'concerns about weight', { pregnancyWeek: 20 });
        console.log('✅ Pregnancy Tracking:', result.success ? 'Success' : 'Failed');
        if (result.success) console.log('Response:', result.response.substring(0, 100) + '...');
    } catch (error) {
        console.log('❌ Pregnancy Tracking Error:', error.message);
    }
    
    // Test Nutrition Planning
    console.log('\n--- Testing Nutrition Planning ---');
    try {
        const result = await processNutritionWithAI('daily meals', 'vegetarian', 'healthy pregnancy', { pregnancyWeek: 20 });
        console.log('✅ Nutrition Planning:', result.success ? 'Success' : 'Failed');
        if (result.success) console.log('Response:', result.response.substring(0, 100) + '...');
    } catch (error) {
        console.log('❌ Nutrition Planning Error:', error.message);
    }
    
    // Test Sleep Guidance
    console.log('\n--- Testing Sleep Guidance ---');
    try {
        const result = await processSleepWithAI('6 months', 'waking frequently', 'need routine', { babyAge: 6 });
        console.log('✅ Sleep Guidance:', result.success ? 'Success' : 'Failed');
        if (result.success) console.log('Response:', result.response.substring(0, 100) + '...');
    } catch (error) {
        console.log('❌ Sleep Guidance Error:', error.message);
    }
    
    // Test Activity Recommendations
    console.log('\n--- Testing Activity Recommendations ---');
    try {
        const result = await processActivitiesWithAI('2 years', 'moderate', 'outdoor activities', { toddlerAge: 2 });
        console.log('✅ Activity Recommendations:', result.success ? 'Success' : 'Failed');
        if (result.success) console.log('Response:', result.response.substring(0, 100) + '...');
    } catch (error) {
        console.log('❌ Activity Recommendations Error:', error.message);
    }
    
    // Test Custom Function
    console.log('\n--- Testing Custom Function ---');
    try {
        const result = await processCustomFunctionWithAI(
            'toddler-behavior', 
            'Help with toddler behavior management', 
            { age: '2 years', issue: 'tantrums' }, 
            { toddlerAge: 2 }
        );
        console.log('✅ Custom Function:', result.success ? 'Success' : 'Failed');
        if (result.success) console.log('Response:', result.response.substring(0, 100) + '...');
    } catch (error) {
        console.log('❌ Custom Function Error:', error.message);
    }
    
    console.log('\n🎉 Universal AI Testing Complete!');
}

testUniversalAI();
