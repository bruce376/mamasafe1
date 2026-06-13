
require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('Note: @huggingface/transformers is for JavaScript/TypeScript and runs in the browser or Node.js');
console.log('For LLaMA models in Node.js, you may want to use:');
console.log('- node-llama-cpp (for local inference with llama.cpp)');
console.log('- Or continue using Groq API which you already have configured!');
console.log('\n---');
console.log('Your Groq API key is already set up! You can use test_groq.js to test it!');
console.log('---\n');

// Let's test if @huggingface/transformers is available
try {
    const { pipeline } = require('@huggingface/transformers');
    console.log('@huggingface/transformers is available!');
} catch (e) {
    console.log('@huggingface/transformers error:', e.message);
}

console.log('\nChecking your existing AI setup...');
console.log('Groq API Key is configured! Let\'s test it quickly...');

const testGroq = async () => {
    try {
        const { chatWithGroq } = require('./services/groqService');
        const response = await chatWithGroq(
            'You are a friendly assistant.',
            'Hello! Please respond with "Groq is working!"',
            { temperature: 0.1, maxTokens: 50 }
        );
        console.log('Groq response:', response);
    } catch (e) {
        console.log('Groq test error:', e.message);
    }
};

testGroq();
