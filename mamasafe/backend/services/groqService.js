require('dotenv').config();
const {
    DEFAULT_GROQ_MODEL,
    getAiModelMetadata,
    getGroqChatModel
} = require('../config/aiModel');
const Groq = require('groq-sdk');

const SAFETY_NOTE = 'MamaSafe provides health education and does not replace advice from a qualified healthcare professional.';

let groqClient = null;

function isGroqConfigured() {
    return Boolean(process.env.GROQ_API_KEY);
}

function getGroqClient() {
    if (!groqClient) {
        if (!isGroqConfigured()) {
            throw new Error('GROQ_API_KEY is not configured in environment variables');
        }
        groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return groqClient;
}

async function chatWithGroq(systemPrompt, userPrompt, options = {}) {
    const client = getGroqClient();
    const model = getGroqChatModel();
    const { temperature = 0.7, maxTokens = 1000 } = options;

    const response = await client.chat.completions.create({
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
        model: model,
        temperature: temperature,
        max_tokens: maxTokens
    });

    return response.choices[0]?.message?.content || '';
}

function buildSystemPrompt({ emergency = false } = {}) {
    return [
        'You are MamaSafe, a pregnancy health education assistant powered by Llama 3.3 70B via Groq.',
        'Use simple, calm language and practical next steps.',
        'Briefly explain the main reason for the guidance when it helps the user act safely.',
        'Do not diagnose, prescribe, or claim certainty.',
        'Always advise the user to contact a qualified healthcare professional if they have concerns.',
        emergency
            ? 'The user message contains a possible urgent maternal warning sign. Start by advising urgent medical care or emergency services now.'
            : 'For symptoms that are severe, sudden, worsening, or worrying, advise contacting a clinician promptly.',
        `End every answer with this exact note: "${SAFETY_NOTE}"`
    ].join('\n');
}

async function answerWithGroq({ question, week, symptoms, emergency = false }) {
    const model = getGroqChatModel();
    const userPrompt = [
        week ? `Pregnancy week: ${week}` : '',
        symptoms ? `Symptoms or notes: ${symptoms}` : '',
        '',
        'Question:',
        question
    ].filter(Boolean).join('\n');

    let reply = await chatWithGroq(buildSystemPrompt({ emergency }), userPrompt, {
        temperature: 0.25,
        maxTokens: 900
    });

    reply = String(reply || '').trim() || 'I could not generate a response from Groq.';

    if (!reply.includes(SAFETY_NOTE)) {
        reply = `${reply}\n\n${SAFETY_NOTE}`;
    }

    return {
        reply,
        model,
        aiModel: getAiModelMetadata(),
        provider: 'groq',
        safetyNote: SAFETY_NOTE
    };
}

function extractJsonObject(text = '') {
    const value = String(text || '').trim();
    if (!value) return null;

    try {
        return JSON.parse(value);
    } catch {
        // Continue with fenced/block extraction below.
    }

    const fenced = value.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced?.[1]) {
        try {
            return JSON.parse(fenced[1].trim());
        } catch {
            // Continue with first-object extraction below.
        }
    }

    const start = value.indexOf('{');
    const end = value.lastIndexOf('}');
    if (start >= 0 && end > start) {
        try {
            return JSON.parse(value.slice(start, end + 1));
        } catch {
            return null;
        }
    }

    return null;
}

function normalizeRiskClass(value = '') {
    const text = String(value || '').toLowerCase();
    if (text.includes('high')) return 'high';
    if (text.includes('mid') || text.includes('medium')) return 'mid';
    return 'low';
}

function normalizeRiskLevel(value = '') {
    return `${normalizeRiskClass(value)} risk`;
}

function normalizeScore(value, fallback = 0.5) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return fallback;
    return Math.max(0, Math.min(1, numeric > 1 ? numeric / 100 : numeric));
}

function toStringArray(value, fallback = []) {
    if (Array.isArray(value)) {
        return value.map(item => String(item || '').trim()).filter(Boolean).slice(0, 8);
    }
    if (typeof value === 'string' && value.trim()) return [value.trim()];
    return fallback;
}

function normalizeGroqRiskAssessment(raw = {}, { model, emergency = false } = {}) {
    const riskClass = normalizeRiskClass(raw.riskClass || raw.riskLevel || raw.rating);
    const riskLevel = normalizeRiskLevel(raw.riskLevel || riskClass);
    const symptoms = Array.isArray(raw.symptoms) ? raw.symptoms : [];

    const confidenceScore = normalizeScore(raw.confidenceScore ?? raw.confidence ?? raw.accuracy, emergency ? 0.85 : 0.65);
    const accuracy = normalizeScore(raw.accuracy ?? confidenceScore, 0.92);
    
    let rawDistribution;
    if (raw.rawDistribution) {
        rawDistribution = raw.rawDistribution;
    } else {
        const safe = Math.max(0.05, Math.min(0.97, confidenceScore));
        if (riskClass === 'high') {
            rawDistribution = {
                highRisk: safe,
                midRisk: Number(((1 - safe) * 0.72).toFixed(4)),
                lowRisk: Number(((1 - safe) * 0.28).toFixed(4))
            };
        } else if (riskClass === 'mid') {
            rawDistribution = {
                highRisk: Number(((1 - safe) * 0.34).toFixed(4)),
                midRisk: safe,
                lowRisk: Number(((1 - safe) * 0.66).toFixed(4))
            };
        } else {
            rawDistribution = {
                highRisk: Number(((1 - safe) * 0.18).toFixed(4)),
                midRisk: Number(((1 - safe) * 0.44).toFixed(4)),
                lowRisk: safe
            };
        }
    }

    return {
        model,
        provider: 'groq',
        aiGenerated: true,
        riskClass,
        riskLevel,
        rating: riskLevel,
        confidenceScore,
        accuracy,
        rawDistribution,
        urgent: Boolean(raw.urgent || emergency || riskClass === 'high'),
        symptomDescription: String(raw.symptomDescription || raw.description || raw.summary || '').trim(),
        reasons: toStringArray(raw.reasons || raw.mainReasons, [
            'Groq analyzed the user question and symptoms.'
        ]),
        whatToDo: toStringArray(raw.whatToDo || raw.nextSteps || raw.actions, emergency
            ? ['Seek urgent maternity care or emergency services now if this symptom is happening.']
            : ['Track the symptom and contact a qualified clinician if it is severe, persistent, worsening, or worrying.']),
        symptoms: symptoms.slice(0, 6).map(item => ({
            name: String(item.name || item.symptom || 'symptom').trim(),
            riskClass: normalizeRiskClass(item.riskClass || item.riskLevel || riskLevel),
            riskLevel: normalizeRiskLevel(item.riskLevel || item.riskClass || riskLevel),
            description: String(item.description || item.symptomDescription || '').trim(),
            whatToDo: toStringArray(item.whatToDo || item.nextSteps || item.actions),
            redFlags: toStringArray(item.redFlags || item.warningSigns)
        })),
        safetyNote: SAFETY_NOTE
    };
}

function buildRiskAssessmentPrompt({ question, week, symptoms, symptomAnalysis, emergency }) {
    return [
        week ? `Pregnancy week: ${week}` : '',
        symptoms ? `Symptoms or notes: ${symptoms}` : '',
        emergency ? 'Emergency flag: a possible urgent pregnancy warning sign was detected.' : '',
        '',
        'Safety baseline from MamaSafe rules:',
        JSON.stringify(symptomAnalysis || {}, null, 2),
        '',
        'User question:',
        question,
        '',
        'Return ONLY valid JSON with this schema:',
        JSON.stringify({
            riskLevel: 'low risk | mid risk | high risk',
            riskClass: 'low | mid | high',
            confidenceScore: 0.0,
            accuracy: 0.0,
            urgent: false,
            symptomDescription: 'short pregnancy-safe explanation of the symptom pattern',
            reasons: ['why this rating was chosen'],
            whatToDo: ['clear next step'],
            symptoms: [
                {
                    name: 'symptom name',
                    riskLevel: 'low risk | mid risk | high risk',
                    description: 'what this symptom can mean in pregnancy',
                    whatToDo: ['what the user should do'],
                    redFlags: ['when to seek urgent care']
                }
            ]
        }, null, 2)
    ].filter(Boolean).join('\n');
}

async function assessPregnancyRiskWithGroq({
    question,
    week,
    symptoms,
    symptomAnalysis = null,
    emergency = false
}) {
    const model = getGroqChatModel();
    const content = await chatWithGroq(
        [
            'You are MamaSafe pregnancy risk assessment AI using Llama 3.3 70B via Groq.',
            'Use only the provided safety baseline.',
            'You may raise the risk level if symptoms sound more concerning, but never lower an urgent/high-risk safety baseline.',
            'Do not diagnose or prescribe treatment.',
            'Use simple, practical, medically cautious wording.',
            'Return only JSON. No markdown. No extra text.'
        ].join('\n'),
        buildRiskAssessmentPrompt({
            question,
            week,
            symptoms,
            symptomAnalysis,
            emergency
        }),
        { temperature: 0.1, maxTokens: 1000 }
    );

    const parsed = extractJsonObject(String(content || '').trim());
    if (!parsed) {
        throw new Error('Groq risk assessment did not return valid JSON.');
    }

    return {
        ...normalizeGroqRiskAssessment(parsed, { model, emergency }),
        raw: parsed
    };
}

module.exports = {
    DEFAULT_GROQ_MODEL,
    SAFETY_NOTE,
    assessPregnancyRiskWithGroq,
    answerWithGroq,
    getAiModelMetadata,
    getGroqClient,
    getGroqChatModel,
    isGroqConfigured,
    chatWithGroq
};
