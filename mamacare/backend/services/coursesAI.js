require('dotenv').config();
const { getAiModelMetadata } = require('../config/aiModel');
const { chatWithGroq } = require('./groqService');

async function llamaChat(systemPrompt, userPrompt, maxTokens = 1200) {
    console.log('Groq API call initiated');
    console.log('Model:', getAiModelMetadata().model);
    const text = await chatWithGroq(systemPrompt, userPrompt, {
        maxTokens,
        temperature: 0.7
    });
    console.log('Groq API response received');
    return text;
}

function parseJsonFromText(text) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON in AI response');
    return JSON.parse(match[0]);
}

async function getCourseRecommendations({ stage, goals = [], preference, experience, courses = [] }) {
    const catalog = courses.map((c) => ({
        id: c.id,
        title: c.title || c.name,
        category: c.category,
        level: c.level,
        description: (c.description || '').slice(0, 120)
    }));

    const systemPrompt = `You are MamaCare's maternal education AI. Recommend courses from the provided catalog only.
Return valid JSON only, no markdown:
{
  "courseIds": ["id1","id2","id3"],
  "insights": "2-3 sentence personalized learning advice",
  "pathName": "short path title",
  "estimatedWeeks": number
}
Pick 3-5 course IDs that best match the user's stage and goals. Use only IDs from the catalog.`;

    const userPrompt = `User profile:
- Stage: ${stage || 'not specified'}
- Goals: ${goals.length ? goals.join(', ') : 'general motherhood'}
- Learning preference: ${preference || 'flexible'}
- Experience: ${experience || 'first-time'}

Catalog:
${JSON.stringify(catalog, null, 2)}`;

    try {
        const text = await llamaChat(systemPrompt, userPrompt, 800);
        const parsed = parseJsonFromText(text);
        const validIds = new Set(catalog.map((c) => c.id));
        parsed.courseIds = (parsed.courseIds || []).filter((id) => validIds.has(id));
        if (parsed.courseIds.length === 0) {
            parsed.courseIds = catalog.slice(0, 3).map((c) => c.id);
        }
        return { success: true, ...parsed, timestamp: new Date().toISOString() };
    } catch (error) {
        console.error('Course recommendations AI error:', error.message);
        const fallback = catalog.slice(0, 3).map((c) => c.id);
        return {
            success: true,
            courseIds: fallback,
            insights: 'We selected foundational courses for your stage. Adjust your pregnancy stage or goals anytime for updated recommendations.',
            pathName: 'Starter Learning Path',
            estimatedWeeks: 4,
            fallback: true,
            timestamp: new Date().toISOString()
        };
    }
}

async function getModuleLesson({ courseTitle, moduleTitle, moduleIndex, totalModules, stage, goals = [] }) {
    const systemPrompt = `You are MamaCare's expert maternal health educator. Create engaging lesson content for mothers.
Return valid JSON only:
{
  "title": "lesson title",
  "summary": "2-3 sentence overview",
  "sections": [{"heading": "...", "content": "2-4 paragraphs of practical teaching"}],
  "keyTakeaways": ["point1","point2","point3"],
  "actionSteps": ["step1","step2"],
  "reflectionQuestion": "one thoughtful question"
}
Be warm, evidence-based, and practical. No medical disclaimers.`;

    const userPrompt = `Course: ${courseTitle}
Module ${moduleIndex} of ${totalModules}: ${moduleTitle}
User stage: ${stage || 'general'}
User goals: ${goals.join(', ') || 'general learning'}

Write a complete mini-lesson the user can read in 5-8 minutes.`;

    try {
        const text = await llamaChat(systemPrompt, userPrompt, 1500);
        const parsed = parseJsonFromText(text);
        return { success: true, lesson: parsed, timestamp: new Date().toISOString() };
    } catch (error) {
        console.error('Module lesson AI error:', error.message);
        return {
            success: true,
            lesson: {
                title: moduleTitle,
                summary: `Welcome to ${moduleTitle} in ${courseTitle}. This module covers essential knowledge for your motherhood journey.`,
                sections: [{
                    heading: moduleTitle,
                    content: `In this module you'll learn practical strategies related to ${moduleTitle}. Take notes on what applies to your situation and discuss questions with your healthcare provider when needed.\n\nWork through each concept at your own pace. Revisit this material whenever you need a refresher.`
                }],
                keyTakeaways: [
                    `Core concepts of ${moduleTitle}`,
                    'Apply learnings to your daily routine',
                    'Track progress in your MamaCare dashboard'
                ],
                actionSteps: ['Review the key takeaways', 'Complete the module when ready'],
                reflectionQuestion: 'What is one change you can make this week based on this lesson?'
            },
            fallback: true,
            timestamp: new Date().toISOString()
        };
    }
}

async function askCourseExpert({ question, stage, courseContext }) {
    const systemPrompt = `You are a certified maternal health educator on MamaCare. Answer parenting and pregnancy questions clearly and supportively.
Keep answers under 250 words. Be practical and encouraging.`;

    const userPrompt = `Question: ${question}
User stage: ${stage || 'not specified'}
${courseContext ? `Course context: ${courseContext}` : ''}`;

    try {
        const answer = await llamaChat(systemPrompt, userPrompt, 600);
        return { success: true, answer, timestamp: new Date().toISOString() };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function getCommunityInsight({ topic, stage }) {
    const systemPrompt = `You are facilitating MamaCare Mother's Circle. Give a warm welcome and 2 discussion prompts for mothers. Under 150 words.`;
    const userPrompt = `Topic: ${topic || 'general support'}
Stage: ${stage || 'all stages'}`;

    try {
        const message = await llamaChat(systemPrompt, userPrompt, 400);
        return { success: true, message, timestamp: new Date().toISOString() };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

module.exports = {
    getCourseRecommendations,
    getModuleLesson,
    askCourseExpert,
    getCommunityInsight,
    getAiModelMetadata
};
