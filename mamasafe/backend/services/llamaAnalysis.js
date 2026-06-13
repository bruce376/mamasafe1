const { chatWithGroq } = require('./groqService');

function parseJsonFromText(text) {
    const value = String(text || '').trim();
    if (!value) return null;

    try {
        return JSON.parse(value);
    } catch {
        const match = value.match(/\{[\s\S]*\}/);
        if (!match) return null;
        try {
            return JSON.parse(match[0]);
        } catch {
            return null;
        }
    }
}

async function analyzeWithLlama({ systemPrompt, userPrompt, maxTokens = 1000, fallback = {} }) {
    const text = await chatWithGroq(systemPrompt, userPrompt, { maxTokens, temperature: 0.5 });
    const parsed = parseJsonFromText(text);
    if (parsed) {
        return { success: true, ...parsed, rawText: text };
    }
    return {
        success: true,
        analysis: text,
        ...fallback,
        fallback: true
    };
}

async function analyzeSleepPatterns(body = {}) {
    const systemPrompt = `You are a pediatric sleep specialist. Return valid JSON only:
{
  "sleepScore": number,
  "schedule": { "bedtime": "time", "totalSleep": "hours range" },
  "recommendations": [{ "title": "...", "description": "...", "priority": "High|Medium|Low", "category": "..." }],
  "environmentTips": ["tip1", "tip2"]
}`;

    const userPrompt = `Analyze sleep for:
${JSON.stringify(body, null, 2)}`;

    return analyzeWithLlama({
        systemPrompt,
        userPrompt,
        maxTokens: 1200,
        fallback: {
            sleepScore: 75,
            schedule: { bedtime: '7:00 PM', totalSleep: '12-14 hours' },
            recommendations: [{
                title: 'Sleep guidance',
                description: 'Maintain a consistent bedtime routine and watch for sleep cues.',
                priority: 'Medium',
                category: 'Routine'
            }],
            environmentTips: ['Keep the room cool, dark, and quiet.']
        }
    });
}

async function analyzeNutrition(body = {}) {
    const systemPrompt = `You are a pediatric nutrition specialist. Return valid JSON only:
{
  "dailyCalories": number,
  "feedings": number,
  "allergenRisk": "Low|Medium|High",
  "recommendations": [{ "title": "...", "items": [{ "name": "...", "description": "...", "amount": "..." }] }],
  "summary": "short overview"
}`;

    const userPrompt = JSON.stringify(body, null, 2);

    return analyzeWithLlama({
        systemPrompt,
        userPrompt,
        maxTokens: 1200,
        fallback: {
            dailyCalories: 650,
            feedings: 6,
            allergenRisk: 'Low',
            recommendations: [],
            summary: 'Balanced nutrition guidance based on age and weight.'
        }
    });
}

async function analyzeFertility(body = {}) {
    const systemPrompt = `You are a fertility and preconception nutrition specialist. Return valid JSON with practical diet guidance fields including summary, recommendations (array), and keyNutrients (array). JSON only.`;

    return analyzeWithLlama({
        systemPrompt,
        userPrompt: JSON.stringify(body, null, 2),
        maxTokens: 1200,
        fallback: { summary: 'Focus on balanced meals, folate-rich foods, hydration, and regular meals.' }
    });
}

async function analyzeActivity(body = {}) {
    const systemPrompt = `You are a pediatric activity specialist. Return valid JSON with summary, recommendations (array), and weeklyPlan (array). JSON only.`;

    return analyzeWithLlama({
        systemPrompt,
        userPrompt: JSON.stringify(body, null, 2),
        maxTokens: 1200,
        fallback: { summary: 'Age-appropriate movement and play support development.' }
    });
}

module.exports = {
    analyzeActivity,
    analyzeFertility,
    analyzeNutrition,
    analyzeSleepPatterns,
    analyzeWithLlama
};
