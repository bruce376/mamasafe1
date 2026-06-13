
require('dotenv').config();
const Groq = require('groq-sdk');

// 1. Connect to Groq with your API key (this is how you "access" Llama!)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function testLlamaAccess() {
    console.log('🔑 Accessing Llama 3.3 70B on Groq...\n');

    try {
        // 2. Call the Llama model
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile', // <-- YOUR Llama model
            messages: [
                {
                    role: 'system',
                    content: 'You are MamaSafe, a helpful pregnancy health assistant.'
                },
                {
                    role: 'user',
                    content: 'What are 3 safe exercises in the second trimester?'
                }
            ],
            temperature: 0.7,
            max_tokens: 512
        });

        // 3. Get and print the answer from Llama!
        const answer = response.choices[0].message.content;
        console.log('🦙 Llama 3.3 70B says:\n');
        console.log(answer);

    } catch (error) {
        console.error('❌ Error accessing Llama:', error.message);
    }
}

testLlamaAccess();
