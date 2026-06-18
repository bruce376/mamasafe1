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

function buildPregnancyFoodFallback(body = {}) {
    const food = String(body.food || body.foodName || body.prompt || 'this food').trim();
    const notes = String(body.notes || '').trim();
    const text = `${food} ${notes}`.toLowerCase();

    const harmfulChecks = [
        { pattern: /\b(alcohol|wine|beer)\b/, verdict: 'Harmful', risk: 'Alcohol is not recommended during pregnancy.', tips: ['Avoid alcohol during pregnancy.'] },
        { pattern: /\b(raw fish|raw seafood|sushi|sashimi|oyster)\b/, verdict: 'Harmful', risk: 'Raw seafood can increase infection risk.', tips: ['Choose fully cooked, low-mercury seafood.'] },
        { pattern: /\b(unpasteurized|raw milk)\b/, verdict: 'Harmful', risk: 'Unpasteurized dairy can carry infection risk.', tips: ['Choose pasteurized milk, cheese, and yogurt.'] },
        { pattern: /\b(shark|swordfish|king mackerel|marlin|bigeye tuna|tilefish)\b/, verdict: 'Harmful', risk: 'This fish can be high in mercury.', tips: ['Choose low-mercury fish such as salmon or sardines.'] },
        { pattern: /\b(raw egg|runny egg|undercooked egg)\b/, verdict: 'Caution', risk: 'Raw or undercooked eggs can increase foodborne illness risk.', tips: ['Choose fully cooked eggs.'] },
        { pattern: /\b(deli meat|cold cuts|salami)\b/, verdict: 'Caution', risk: 'Cold ready-to-eat meats can carry listeria risk.', tips: ['Heat deli meat until steaming hot.'] },
        { pattern: /\b(raw sprouts|sprouts)\b/, verdict: 'Harmful', risk: 'Raw sprouts can carry bacteria that are difficult to wash away.', tips: ['Eat sprouts only if thoroughly cooked.'] }
    ];

    const helpfulMap = [
        { pattern: /\b(salmon|sardines)\b/, nutrients: ['Omega-3 DHA', 'Protein', 'Vitamin B12', 'Vitamin D'], benefits: ['Supports fetal brain and eye development.'], tips: ['Eat fully cooked, low-mercury fish.'] },
        { pattern: /\b(spinach|kale|leafy greens)\b/, nutrients: ['Folate', 'Iron', 'Vitamin C', 'Vitamin K'], benefits: ['Supports neural tube development and iron intake.'], tips: ['Wash produce well and pair iron-rich greens with vitamin C.'] },
        { pattern: /\b(egg|eggs)\b/, nutrients: ['Choline', 'Protein', 'Vitamin D', 'Vitamin B12'], benefits: ['Choline supports fetal brain development.'], tips: ['Cook eggs fully.'] },
        { pattern: /\b(yogurt|greek yogurt)\b/, nutrients: ['Calcium', 'Protein', 'Vitamin B12', 'Probiotics'], benefits: ['Supports calcium and protein intake.'], tips: ['Choose pasteurized yogurt.'] },
        { pattern: /\b(lentils|beans|chickpeas)\b/, nutrients: ['Folate', 'Iron', 'Protein', 'Fiber'], benefits: ['Supports blood volume, growth, and digestion.'], tips: ['Pair with vitamin C-rich foods.'] },
        { pattern: /\b(avocado)\b/, nutrients: ['Folate', 'Healthy fats', 'Fiber', 'Potassium'], benefits: ['Supports steady energy and digestion.'], tips: ['Add to balanced meals or snacks.'] }
    ];

    const harmful = harmfulChecks.find(item => item.pattern.test(text));
    if (harmful) {
        return {
            success: true,
            fallback: true,
            food,
            verdict: harmful.verdict,
            safetyLevel: harmful.verdict,
            essentialNutrients: [],
            whyHelpful: [],
            risks: [harmful.risk],
            preparationTips: harmful.tips,
            summary: `${food} needs pregnancy safety caution.`
        };
    }

    const helpful = helpfulMap.find(item => item.pattern.test(text));
    if (helpful) {
        return {
            success: true,
            fallback: true,
            food,
            verdict: 'Helpful',
            safetyLevel: 'Helpful',
            essentialNutrients: helpful.nutrients,
            whyHelpful: helpful.benefits,
            risks: [],
            preparationTips: helpful.tips,
            summary: `${food} can be helpful in pregnancy when prepared safely.`
        };
    }

    return {
        success: true,
        fallback: true,
        food,
        verdict: 'Review',
        safetyLevel: 'Review',
        essentialNutrients: [],
        whyHelpful: [],
        risks: ['No specific pregnancy food profile was found in the fallback map.'],
        preparationTips: ['Choose well-cooked foods.', 'Use pasteurized dairy.', 'Ask a clinician about personal restrictions, allergies, glucose concerns, or lab-based needs.'],
        summary: `${food} needs a general pregnancy safety review.`
    };
}

async function analyzeNutrition(body = {}) {
    if (body.type === 'pregnancy-food-analysis') {
        const fallback = buildPregnancyFoodFallback(body);
        const systemPrompt = `You are a pregnancy nutrition specialist. Return valid JSON only:
{
  "food": "food name",
  "verdict": "Helpful|Harmful|Caution|Review",
  "safetyLevel": "Helpful|Harmful|Caution|Review",
  "essentialNutrients": ["nutrient"],
  "whyHelpful": ["short benefit"],
  "risks": ["pregnancy-specific risk or caution"],
  "preparationTips": ["safe preparation tip"],
  "summary": "one short educational summary"
}
Use pregnancy food safety rules. If preparation matters, say so. Do not diagnose or replace clinician advice.`;

        try {
            return await analyzeWithLlama({
                systemPrompt,
                userPrompt: JSON.stringify(body, null, 2),
                maxTokens: 1000,
                fallback
            });
        } catch (error) {
            return { ...fallback, error: error.message };
        }
    }

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
