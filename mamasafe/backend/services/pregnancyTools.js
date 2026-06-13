const crypto = require('crypto');

function compactText(value = '', max = 300) {
    return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function toNumber(value, fallback = 0) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
}

function toBoolean(value) {
    return value === true || value === 'true' || value === 1 || value === '1' || value === 'yes';
}

function pregnancyToolUser(req = {}) {
    const user = req.user || req.session?.user || {};
    return {
        id: user.id || user.userId || user.email || 'guest-user',
        email: user.email || 'guest@mamasafe.com',
        displayName: user.displayName || user.name || 'Guest User',
        name: user.name || user.displayName || 'Guest User'
    };
}

function hashKey(parts = []) {
    return crypto
        .createHash('sha256')
        .update(parts.map(part => compactText(part, 500).toLowerCase()).join('|'))
        .digest('hex');
}

function riskToneFromVitals({ systolicBP, diastolicBP, pulse, glucose, weightKg }) {
    const flags = [];
    if (systolicBP >= 140 || diastolicBP >= 90) flags.push('elevated blood pressure');
    else if (systolicBP >= 130 || diastolicBP >= 85) flags.push('borderline blood pressure');
    if (pulse >= 120 || pulse <= 45) flags.push('unusual pulse');
    if (glucose >= 11) flags.push('elevated glucose');
    if (weightKg && (weightKg < 40 || weightKg > 140)) flags.push('weight outside common range');

    if (flags.some(flag => flag.includes('elevated') || flag.includes('unusual'))) return { tone: 'elevated', flags };
    if (flags.length) return { tone: 'borderline', flags };
    return { tone: 'nominal', flags: ['no automatic alert from the logged values'] };
}

function buildReminderTemplates(currentWeek) {
    const templates = [
        { type: 'visit', title: 'Confirm first antenatal visit', dueWeek: 8, window: 'weeks 8-12', note: 'Review dating, history, medicines, and early screening options.' },
        { type: 'scan', title: 'Anatomy ultrasound planning', dueWeek: 20, window: 'weeks 18-22', note: 'Ask about growth, placenta position, and any follow-up scan needs.' },
        { type: 'screening', title: 'Gestational diabetes screening', dueWeek: 24, window: 'weeks 24-28', note: 'Ask your clinician when glucose screening is due for your pregnancy.' },
        { type: 'movement', title: 'Daily fetal movement awareness', dueWeek: 28, window: 'from week 28', note: 'Learn your baby usual pattern and contact care if movement reduces.' },
        { type: 'birth-plan', title: 'Birth preferences conversation', dueWeek: 32, window: 'weeks 32-34', note: 'Discuss birth preferences, support person, pain relief, and emergency contacts.' },
        { type: 'home', title: 'Pack hospital bag and ride plan', dueWeek: 36, window: 'around week 36', note: 'Prepare documents, baby items, charging cables, and transport plan.' },
        { type: 'screening', title: 'Group B strep or late-pregnancy checks', dueWeek: 36, window: 'weeks 36-37', note: 'Ask which late-pregnancy checks your provider recommends.' },
        { type: 'postpartum', title: 'Postpartum support plan', dueWeek: 38, window: 'weeks 38-40', note: 'Plan feeding support, recovery help, warning signs, and follow-up care.' }
    ];

    return templates.map(item => {
        const diff = item.dueWeek - currentWeek;
        const dueDate = new Date(Date.now() + diff * 7 * 24 * 60 * 60 * 1000);
        let status = 'upcoming';
        if (Math.abs(diff) <= 1) status = 'due-now';
        if (diff < -1) status = 'review';
        return {
            ...item,
            status,
            date: dueDate.toISOString(),
            sortDistance: Math.abs(diff)
        };
    }).sort((a, b) => {
        const order = { 'due-now': 0, upcoming: 1, review: 2 };
        return (order[a.status] ?? 9) - (order[b.status] ?? 9) || a.sortDistance - b.sortDistance;
    });
}

async function getNutritionGuidelineTips(db, { fatigue = false, meals = '' } = {}) {
    const query = fatigue
        ? { $or: [{ keywords: /iron|folic|nutrition|anaemia|anemia/i }, { recommendation: /iron|folic|nutrition/i }, { title: /iron|folic|nutrition/i }] }
        : { $or: [{ keywords: /nutrition|healthy eating|supplement|folic/i }, { category: /nutrition/i }, { title: /nutrition|iron|folic/i }] };
    const docs = await db.collection('who_guidelines').find(query).limit(3).toArray().catch(() => []);
    const tips = docs.map(doc => doc.recommendation || doc.title || doc.dataset).filter(Boolean);

    if (fatigue) {
        tips.unshift('If fatigue is strong or new, ask your clinician whether iron level or anemia screening is needed.');
    }
    if (String(meals || '').trim()) {
        tips.unshift('Keep meals steady and include a protein or iron-rich food when you can.');
    }
    if (!tips.length) {
        tips.push('Use prenatal supplements exactly as recommended by your clinician and keep a balanced daily meal pattern.');
    }
    return tips.slice(0, 4);
}

function registerPregnancyToolRoutes(app, {
    checkDBConnection,
    getDb,
    answerPregnancyQuestion,
    answerUnifiedPregnancyQuestion,
    analyzePregnancySymptoms,
    evaluatePregnancyDecisionSupport,
    recordPregnancyChatSession
}) {
    app.post('/api/pregnancy-rag/symptom-check', checkDBConnection, async (req, res) => {
        try {
            const db = getDb();
            const user = pregnancyToolUser(req);
            const text = compactText(req.body?.text || req.body?.symptoms || '', 800);
            const week = req.body?.week || '';
            if (!text) {
                return res.status(400).json({ error: 'Symptom text is required' });
            }

            const question = `Symptom checker for pregnancy week ${week || 'unknown'}: ${text}. Check danger signs first, then give practical next steps from the pregnancy dataset.`;
            const result = answerUnifiedPregnancyQuestion
                ? await answerUnifiedPregnancyQuestion({ question, week, symptoms: text })
                : await answerPregnancyQuestion(db, { question, week, symptoms: text });
            const symptomAnalysis = result.riskAssessment?.symptomAnalysis || result.symptomAnalysis || (analyzePregnancySymptoms
                ? analyzePregnancySymptoms({
                    symptoms: text,
                    question,
                    matches: result.matches || result.rag?.documents || []
                })
                : result.symptomRisk || null);
            const riskAssessment = result.riskAssessment || symptomAnalysis || null;
            const symptomCheckKey = hashKey([user.id, week, text]);
            const now = new Date();
            const savedDoc = {
                symptomCheckKey,
                sourceSystem: 'mamasafe-symptom-check',
                personalLog: true,
                userId: user.id,
                userEmail: user.email,
                name: compactText(text, 90) || 'symptom check',
                symptomText: text,
                week: week ? Number(week) || week : '',
                normal: !(result.urgent || result.safetyOverride || symptomAnalysis?.overallRiskClass === 'high'),
                urgent: Boolean(result.urgent || result.safetyOverride || riskAssessment?.urgent || symptomAnalysis?.overallRiskClass === 'high'),
                riskLevel: riskAssessment?.riskLevel || symptomAnalysis?.overallRiskLevel || result.riskLevel || result.symptomRisk?.riskLevel || '',
                riskClass: riskAssessment?.riskClass || symptomAnalysis?.overallRiskClass || result.riskClass || result.symptomRisk?.riskClass || '',
                confidenceScore: riskAssessment?.confidenceScore ?? symptomAnalysis?.confidenceScore ?? result.confidenceScore ?? result.symptomRisk?.confidenceScore ?? null,
                accuracy: riskAssessment?.confidenceScore ?? symptomAnalysis?.accuracy ?? result.accuracy ?? result.symptomRisk?.accuracy ?? null,
                rawDistribution: riskAssessment?.rawDistribution || symptomAnalysis?.rawDistribution || result.rawDistribution || result.symptomRisk?.rawDistribution || null,
                probabilitySource: riskAssessment?.source || symptomAnalysis?.probabilitySource || result.probabilitySource || result.symptomRisk?.source || '',
                riskAssessment,
                symptomAnalysis,
                description: compactText(result.answer, 900),
                whenToSeeDoctor: result.urgent || riskAssessment?.urgent || symptomAnalysis?.overallRiskClass === 'high'
                    ? 'Urgent wording matched. Contact a qualified clinician, maternity unit, or emergency services now if this is happening.'
                    : 'Use this as educational guidance and contact your clinician for symptoms that are severe, persistent, new, or worrying.',
                warningSigns: (result.matches || []).filter(match => match.collection === 'danger_signs').map(match => match.title || match.sign).filter(Boolean),
                selfCareTips: compactText(result.answer, 600),
                keywords: ['symptom check', text],
                matches: (result.matches || []).slice(0, 6),
                answer: result.answer,
                datasetUse: result.datasetUse || null,
                updatedAt: now
            };

            await db.collection('symptoms').updateOne(
                { symptomCheckKey },
                { $set: savedDoc, $setOnInsert: { createdAt: now } },
                { upsert: true }
            );

            if (recordPregnancyChatSession) {
                await recordPregnancyChatSession(db, {
                    user,
                    question,
                    answer: result.answer,
                    week,
                    symptoms: text,
                    matches: result.matches || [],
                    urgent: Boolean(result.urgent)
                }).catch(() => null);
            }

            res.json({
                success: true,
                answer: result.answer,
                reply: result.answer,
                urgent: Boolean(result.urgent || riskAssessment?.urgent || symptomAnalysis?.overallRiskClass === 'high'),
                safetyOverride: result.safetyOverride,
                symptomRisk: symptomAnalysis || result.symptomRisk || null,
                symptomAnalysis,
                riskAssessment,
                riskLevel: riskAssessment?.riskLevel || symptomAnalysis?.overallRiskLevel || result.riskLevel || result.symptomRisk?.riskLevel || '',
                riskClass: riskAssessment?.riskClass || symptomAnalysis?.overallRiskClass || result.riskClass || result.symptomRisk?.riskClass || '',
                prediction: riskAssessment?.prediction || symptomAnalysis?.overallRiskLevel || result.prediction || result.riskLevel || result.symptomRisk?.riskLevel || '',
                confidenceScore: riskAssessment?.confidenceScore ?? symptomAnalysis?.confidenceScore ?? result.confidenceScore ?? result.symptomRisk?.confidenceScore ?? null,
                accuracy: riskAssessment?.confidenceScore ?? symptomAnalysis?.accuracy ?? result.accuracy ?? result.symptomRisk?.accuracy ?? null,
                rawDistribution: riskAssessment?.rawDistribution || symptomAnalysis?.rawDistribution || result.rawDistribution || result.symptomRisk?.rawDistribution || null,
                probabilitySource: riskAssessment?.source || symptomAnalysis?.probabilitySource || result.probabilitySource || result.symptomRisk?.source || '',
                matches: result.matches || [],
                transformer: result.transformer,
                model: result.model,
                datasetUse: result.datasetUse || null,
                tokenizer: result.tokenizer || result.transformer?.tokenizer || null,
                trainedAt: result.trainedAt,
                savedIn: 'symptoms',
                symptomCheckKey,
                retrievedAt: result.retrievedAt || now.toISOString()
            });
        } catch (error) {
            console.error('Pregnancy symptom checker error:', error);
            res.status(500).json({ error: 'Failed to check pregnancy symptoms', details: error.message });
        }
    });

    app.post('/api/pregnancy-rag/kick-sessions', checkDBConnection, async (req, res) => {
        try {
            const db = getDb();
            const user = pregnancyToolUser(req);
            const now = new Date();
            const week = Number(req.body?.week) || null;
            const kickCount = Math.max(0, Math.min(200, Math.round(toNumber(req.body?.kickCount ?? req.body?.kicks, 0))));
            const durationSeconds = Math.max(0, Math.round(toNumber(req.body?.durationSeconds, 0)));
            const goalReached = kickCount >= 10 && durationSeconds <= 7200;
            const needsAttention = week >= 28 && kickCount < 10 && durationSeconds >= 7200;
            const record = {
                type: 'kick_session',
                sourceSystem: 'mamasafe-kick-counter',
                userId: user.id,
                userEmail: user.email,
                week,
                kickCount,
                durationSeconds,
                goalReached,
                needsAttention,
                status: needsAttention ? 'contact-care-team' : goalReached ? 'goal-reached' : 'saved',
                startedAt: req.body?.startedAt ? new Date(req.body.startedAt) : now,
                completedAt: req.body?.completedAt ? new Date(req.body.completedAt) : now,
                createdAt: now
            };
            const result = await db.collection('pregnancy_data').insertOne(record);
            const recent = await db.collection('pregnancy_data')
                .find({ userId: user.id, type: 'kick_session' })
                .sort({ createdAt: -1 })
                .limit(10)
                .toArray();
            const completed = recent.filter(item => Number(item.kickCount) >= 10 && Number(item.durationSeconds) > 0);
            const baselineSeconds = completed.length
                ? Math.round(completed.reduce((sum, item) => sum + Number(item.durationSeconds || 0), 0) / completed.length)
                : null;

            res.json({
                success: true,
                savedIn: 'pregnancy_data',
                record: { ...record, _id: result.insertedId },
                baselineSeconds,
                recent
            });
        } catch (error) {
            console.error('Pregnancy kick counter error:', error);
            res.status(500).json({ error: 'Failed to save kick counter session', details: error.message });
        }
    });

    app.get('/api/pregnancy-rag/kick-sessions/recent', checkDBConnection, async (req, res) => {
        try {
            const db = getDb();
            const user = pregnancyToolUser(req);
            const recent = await db.collection('pregnancy_data')
                .find({ userId: user.id, type: 'kick_session' })
                .sort({ createdAt: -1 })
                .limit(Math.min(Number(req.query.limit) || 5, 20))
                .toArray();
            res.json({ success: true, recent });
        } catch (error) {
            res.status(500).json({ error: 'Failed to load kick counter sessions', details: error.message });
        }
    });

    app.post('/api/pregnancy-rag/nutrition-log', checkDBConnection, async (req, res) => {
        try {
            const db = getDb();
            const user = pregnancyToolUser(req);
            const now = new Date();
            const dateKey = compactText(req.body?.date || now.toISOString().slice(0, 10), 20);
            const waterCups = Math.max(0, Math.min(30, Math.round(toNumber(req.body?.waterCups, 0))));
            const meals = compactText(req.body?.meals || '', 700);
            const fatigue = toBoolean(req.body?.fatigue);
            const tips = await getNutritionGuidelineTips(db, { fatigue, meals });
            const nutritionLogKey = hashKey([user.id, dateKey, 'nutrition-log']);
            const doc = {
                nutritionLogKey,
                sourceSystem: 'mamasafe-nutrition-tracker',
                personalLog: true,
                userId: user.id,
                userEmail: user.email,
                food: `Daily nutrition log ${dateKey}`,
                type: 'daily-nutrition-log',
                date: dateKey,
                week: req.body?.week ? Number(req.body.week) || req.body.week : '',
                waterCups,
                prenatalVitamin: toBoolean(req.body?.prenatalVitamin),
                ironFolicAcid: toBoolean(req.body?.ironFolicAcid),
                meals,
                fatigue,
                benefits: tips,
                recommended: true,
                avoidDuringPregnancy: false,
                keywords: ['nutrition log', 'water', 'prenatal vitamin', 'iron', 'folic acid', fatigue ? 'fatigue' : ''],
                updatedAt: now
            };

            await db.collection('nutrition').updateOne(
                { nutritionLogKey },
                { $set: doc, $setOnInsert: { createdAt: now } },
                { upsert: true }
            );

            res.json({ success: true, savedIn: 'nutrition', log: doc, tips });
        } catch (error) {
            console.error('Pregnancy nutrition tracker error:', error);
            res.status(500).json({ error: 'Failed to save nutrition log', details: error.message });
        }
    });

    app.post('/api/pregnancy-rag/reminders/generate', checkDBConnection, async (req, res) => {
        try {
            const db = getDb();
            const user = pregnancyToolUser(req);
            const now = new Date();
            const week = Math.min(Math.max(Number(req.body?.week) || 24, 1), 42);
            const reminders = buildReminderTemplates(week).slice(0, 8);

            await Promise.all(reminders.map(reminder => {
                const reminderKey = hashKey([user.id, reminder.title, reminder.dueWeek]);
                return db.collection('reminders').updateOne(
                    { reminderKey },
                    {
                        $set: {
                            reminderKey,
                            sourceSystem: 'mamasafe-trimester-reminders',
                            userId: user.id,
                            userEmail: user.email,
                            type: reminder.type,
                            title: reminder.title,
                            dueWeek: reminder.dueWeek,
                            currentWeek: week,
                            window: reminder.window,
                            note: reminder.note,
                            date: reminder.date,
                            status: reminder.status,
                            updatedAt: now
                        },
                        $setOnInsert: { createdAt: now }
                    },
                    { upsert: true }
                );
            }));

            res.json({ success: true, savedIn: 'reminders', week, reminders });
        } catch (error) {
            console.error('Pregnancy reminders error:', error);
            res.status(500).json({ error: 'Failed to generate pregnancy reminders', details: error.message });
        }
    });

    app.post('/api/pregnancy-rag/telemetry-log', checkDBConnection, async (req, res) => {
        try {
            const db = getDb();
            const user = pregnancyToolUser(req);
            const body = req.body || {};
            const evaluation = await evaluatePregnancyDecisionSupport(db, {
                user,
                age: body.age || 25,
                systolicBP: body.systolicBP ?? body.systolic ?? 120,
                diastolicBP: body.diastolicBP ?? body.diastolic ?? 80,
                bloodSugar: body.bloodSugar ?? body.glucose ?? 7.5,
                bodyTemp: body.bodyTemp ?? body.temp ?? 98.6,
                heartRate: body.heartRate ?? body.pulse ?? 75,
                bmi: body.bmi ?? 23,
                previousComplications: body.previousComplications ?? 0,
                preexistingDiabetes: body.preexistingDiabetes ?? 0,
                gestationalDiabetes: body.gestationalDiabetes ?? 0,
                mentalHealth: body.mentalHealth ?? 0,
                week: body.week || 24,
                symptoms: body.symptoms || 'quick telemetry log',
                tfjsPrediction: body.tfjsPrediction || null
            });
            const status = riskToneFromVitals({
                systolicBP: Number(body.systolicBP ?? body.systolic ?? 120),
                diastolicBP: Number(body.diastolicBP ?? body.diastolic ?? 80),
                pulse: Number(body.heartRate ?? body.pulse ?? 75),
                glucose: Number(body.bloodSugar ?? body.glucose ?? 7.5),
                weightKg: Number(body.weightKg ?? body.bodyWeight ?? 0)
            });
            res.json({ success: true, savedIn: 'pregnancy_vital_assessments', evaluation, telemetryStatus: status });
        } catch (error) {
            console.error('Pregnancy telemetry error:', error);
            res.status(500).json({ error: 'Failed to save pregnancy telemetry', details: error.message });
        }
    });
}

module.exports = {
    registerPregnancyToolRoutes,
    buildReminderTemplates
};
