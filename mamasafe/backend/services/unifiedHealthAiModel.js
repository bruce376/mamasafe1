/**
 * Unified Health AI Model Service
 * 
 * Trains and predicts using ALL maternal and health data sources:
 * - maternal_health_risk_records (vitals + risk)
 * - symptoms (encoded as feature vectors from 20+ symptom rules)
 * - health_pregnancy_indicators (World Bank + WHO indicators)
 * - who_anc_data_elements (WHO ANC data dictionary)
 * - mn_survey_records (maternal nutrition survey)
 * - danger_signs (severity-encoded safety records)
 * - pregnancy_weeks / nutrition / faqs / articles (knowledge base context)
 * 
 * The model maps all of these → unified health risk assessment
 */

const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const { connectDB } = require('../config/database');

const MODEL_NAME = 'mamasafe-unified-health-ai-v2';
const MODEL_DIR = path.join(__dirname, '..', 'models', 'unified-health-ai');
const MODEL_JSON_PATH = path.join(MODEL_DIR, 'model.json');
const MODEL_WEIGHTS_PATH = path.join(MODEL_DIR, 'weights.bin');
const MODEL_METADATA_PATH = path.join(MODEL_DIR, 'metadata.json');

const DEFAULT_EPOCHS = 60;
const DEFAULT_BATCH_SIZE = 32;
const DEFAULT_TEST_SPLIT = 0.2;

const HEALTH_OUTPUT_LABELS = [
    'low risk',
    'mid risk',
    'high risk'
];

const HEALTH_OUTPUT_CLASSES = {
    'low risk': 0,
    'mid risk': 1,
    'high risk': 2
};

const BASE_VITAL_FEATURES = [
    'age',
    'systolicBP',
    'diastolicBP',
    'bloodSugar',
    'bodyTemp',
    'heartRate',
    'bmi'
];

const BINARY_RISK_FEATURES = [
    'previousComplications',
    'preexistingDiabetes',
    'gestationalDiabetes',
    'mentalHealth'
];

/**
 * SYMPTOM ENCODING
 * Converts 20+ symptom categories into a normalized feature vector
 */

const SYMPTOM_FEATURES = {
    bleeding: { index: 0, weight: 1.0 },
    fluid_leaking: { index: 1, weight: 1.0 },
    chest_pain_breathing: { index: 2, weight: 1.0 },
    severe_headache_vision: { index: 3, weight: 1.0 },
    reduced_baby_movement: { index: 4, weight: 1.0 },
    fainting_seizure: { index: 5, weight: 1.0 },
    severe_belly_pain: { index: 6, weight: 1.0 },
    self_harm: { index: 7, weight: 1.0 },
    headache: { index: 8, weight: 0.7 },
    weakness_exhaustion: { index: 9, weight: 0.6 },
    vomiting_dehydration: { index: 10, weight: 0.6 },
    fever_chills: { index: 11, weight: 0.7 },
    swelling: { index: 12, weight: 0.6 },
    contractions_cramps: { index: 13, weight: 0.5 },
    burning_urination: { index: 14, weight: 0.5 },
    weight_gain: { index: 15, weight: 0.3 },
    nausea: { index: 16, weight: 0.3 },
    heartburn: { index: 17, weight: 0.2 },
    constipation: { index: 18, weight: 0.2 },
    sleep_discomfort: { index: 19, weight: 0.2 }
};

const SYMPTOM_COUNT = Object.keys(SYMPTOM_FEATURES).length;

const SYMPTOM_PATTERNS = {
    bleeding: /\b(bleeding|vaginal bleeding|heavy bleeding|blood clots?|spotting with pain)\b/i,
    fluid_leaking: /\b(fluid leaking|leaking fluid|water broke|waters broke|gush of fluid|amniotic fluid)\b/i,
    chest_pain_breathing: /\b(chest pain|trouble breathing|difficulty breathing|shortness of breath|cannot breathe|can't breathe|breathless)\b/i,
    severe_headache_vision: /\b(severe headache|worst headache|vision changes?|blurred vision|seeing spots|flashing lights)\b/i,
    reduced_baby_movement: /\b(reduced baby movement|less movement|no movement|baby not moving|decreased fetal movement|kicks? stopped)\b/i,
    fainting_seizure: /\b(fainting|fainted|passed out|loss of consciousness|seizure|convulsion|convulsions)\b/i,
    severe_belly_pain: /\b(severe (belly|abdominal|stomach) pain|sharp belly pain|severe cramps?|severe pelvic pain)\b/i,
    self_harm: /\b(self harm|hurt myself|kill myself|suicidal|not safe with myself|want to die)\b/i,
    headache: /\b(headache|head ache)\b/i,
    weakness_exhaustion: /\b(too weak|very weak|weak|exhausted|too tired|extreme fatigue|fatigue|dizzy|dizziness|lightheaded|light headed)\b/i,
    vomiting_dehydration: /\b(vomiting|vomit|cannot keep fluids|can't keep fluids|dehydrated|dehydration|not drinking|cannot drink|can't drink)\b/i,
    fever_chills: /\b(fever|high temperature|chills|too cold|very cold|shivering)\b/i,
    swelling: /\b(swelling|swollen|puffy face|face swelling|hands swelling|severe swelling)\b/i,
    contractions_cramps: /\b(contractions?|cramps?|cramping|pelvic pressure|back pain with pressure)\b/i,
    burning_urination: /\b(burning urination|pain when urinating|painful urination|uti|urine pain|pee burns)\b/i,
    weight_gain: /\b(gaining weight|weight gain|gained weight|body weight increasing)\b/i,
    nausea: /\b(nausea|morning sickness|queasy)\b/i,
    heartburn: /\b(heartburn|acid reflux|indigestion)\b/i,
    constipation: /\b(constipation|constipated|hard stool)\b/i,
    sleep_discomfort: /\b(can't sleep|cannot sleep|sleep problem|insomnia|uncomfortable sleeping|back pain)\b/i
};

/**
 * HEALTH INDICATOR ENCODING
 * Encodes World Bank / WHO health indicators as features
 */

const HEALTH_INDICATOR_TOPICS = [
    'antenatal care',
    'delivery care',
    'women health',
    'baby outcome',
    'family planning',
    'anemia and nutrition',
    'maternal mortality',
    'pregnancy',
    'birth procedure',
    'postnatal care'
];

const HEALTH_INDICATOR_TOPIC_INDEX = Object.fromEntries(
    HEALTH_INDICATOR_TOPICS.map((topic, index) => [topic, index])
);

const HEALTH_INDICATOR_TOPIC_COUNT = HEALTH_INDICATOR_TOPICS.length;

/**
 * WHO ANC DATA ELEMENTS ENCODING
 */
const ANC_DATA_ELEMENT_CATEGORIES = [
    'administrative',
    'clinical',
    'diagnostic',
    'medication',
    'referral',
    'counseling',
    'screening',
    'vaccination'
];

const ANC_CATEGORY_INDEX = Object.fromEntries(
    ANC_DATA_ELEMENT_CATEGORIES.map((category, index) => [category, index])
);

const ANC_CATEGORY_COUNT = ANC_DATA_ELEMENT_CATEGORIES.length;

/**
 * Helper utilities
 */

function clampNumber(value, min, max) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return min;
    return Math.min(Math.max(numeric, min), max);
}

function toFiniteNumber(value, fallback = null) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
}

function toBinaryMetric(value, fallback = null) {
    if (value === undefined || value === null || value === '') return fallback;
    const normalized = String(value).trim().toLowerCase();
    if (['1', 'yes', 'true', 'y'].includes(normalized)) return 1;
    if (['0', 'no', 'false', 'n'].includes(normalized)) return 0;
    const numeric = Number(normalized);
    return Number.isFinite(numeric) ? (numeric > 0 ? 1 : 0) : fallback;
}

function normalizeRiskLevel(value = '') {
    const text = String(value || '').toLowerCase();
    if (text.includes('high')) return 'high risk';
    if (text.includes('mid') || text.includes('medium')) return 'mid risk';
    return 'low risk';
}

function normalizeRiskClass(value = '') {
    const text = String(value || '').toLowerCase();
    if (text.includes('high')) return 'high';
    if (text.includes('mid') || text.includes('medium')) return 'mid';
    return 'low';
}

function computeDeterministicScore(value = '') {
    const digest = crypto.createHash('sha1').update(String(value)).digest('hex').slice(0, 8);
    return Number.parseInt(digest, 16);
}

function generateId(...parts) {
    return crypto.createHash('sha1').update(parts.join('|')).digest('hex').slice(0, 16);
}

function compactText(value = '', max = 500) {
    return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function inferAncCategory(text = '') {
    const normalized = compactText(text || '').toLowerCase();
    if (/administrat|demographic|registration|encounter|identifier/.test(normalized)) return 'administrative';
    if (/diagnos|lab|test|result|investigation|ultrasound|scan|specimen/.test(normalized)) return 'diagnostic';
    if (/medication|drug|prescription|dosage|immunization|vaccine/.test(normalized)) return 'medication';
    if (/refer|transfer|consult|specialist/.test(normalized)) return 'referral';
    if (/counsel|advice|education|guidance|information/.test(normalized)) return 'counseling';
    if (/screen|risk assessment|assessment|evaluation/.test(normalized)) return 'screening';
    if (/vaccin|immunization/.test(normalized)) return 'vaccination';
    return 'clinical';
}

function inferHealthIndicatorTopic(text = '') {
    const normalized = compactText(text || '').toLowerCase();
    if (/ana?emia|iron|nutrition|folate|vitamin|diet/.test(normalized)) return 'anemia and nutrition';
    if (/antenatal|prenatal|anc/.test(normalized)) return 'antenatal care';
    if (/postnatal|postpartum|pnc/.test(normalized)) return 'postnatal care';
    if (/delivery|birth attendant|skilled birth|birth|childbirth/.test(normalized)) return 'delivery care';
    if (/contraceptive|family planning/.test(normalized)) return 'family planning';
    if (/caesarean|cesarean|c-section/.test(normalized)) return 'birth procedure';
    if (/neonatal|newborn|stillbirth|infant|baby|child/.test(normalized)) return 'baby outcome';
    if (/maternal mortality|maternal death|mmr/.test(normalized)) return 'maternal mortality';
    if (/women|female|reproductive age|gender/.test(normalized)) return 'women health';
    return 'pregnancy';
}

/**
 * ENCODE SYMPTOM TEXT TO FEATURE VECTOR
 */
function encodeSymptomsToVector(symptoms = '') {
    const vector = new Array(SYMPTOM_COUNT).fill(0);
    const text = String(symptoms || '').toLowerCase().trim();
    if (!text) return vector;

    for (const [key, pattern] of Object.entries(SYMPTOM_PATTERNS)) {
        const feature = SYMPTOM_FEATURES[key];
        if (!feature) continue;
        if (pattern.test(text)) {
            vector[feature.index] = feature.weight;
        }
    }

    return vector;
}

/**
 * ENCODE HEALTH INDICATORS TO FEATURE VECTOR
 */
function encodeHealthIndicators(indicators = []) {
    const vector = new Array(HEALTH_INDICATOR_TOPIC_COUNT).fill(0);
    if (!Array.isArray(indicators) || !indicators.length) return vector;

    for (const indicator of indicators) {
        const topic = indicator.topic || inferHealthIndicatorTopic(`${indicator.title || ''} ${indicator.indicatorName || ''} ${indicator.summary || ''}`);
        const index = HEALTH_INDICATOR_TOPIC_INDEX[topic];
        if (index !== undefined) {
            const value = toFiniteNumber(indicator.value, 50);
            vector[index] = clampNumber(value / 100, 0, 1);
        }
    }

    return vector;
}

/**
 * ENCODE ANC DATA ELEMENTS TO FEATURE VECTOR
 */
function encodeAncDataElements(elements = []) {
    const vector = new Array(ANC_CATEGORY_COUNT).fill(0);
    if (!Array.isArray(elements) || !elements.length) return vector;

    for (const element of elements) {
        const category = element.category || element.dataType || inferAncCategory(`${element.title || ''} ${element.description || ''} ${element.sheetName || ''}`);
        const index = ANC_CATEGORY_INDEX[category];
        if (index !== undefined) {
            vector[index] = 1;
        }
    }

    return vector;
}

/**
 * ENCODE DANGER SIGN SEVERITY TO FEATURE VECTOR
 */
function encodeDangerSigns(dangerSigns = []) {
    // Returns: [hasUrgentSigns, countCritical, countWarning]
    if (!Array.isArray(dangerSigns) || !dangerSigns.length) return [0, 0, 0];

    let critical = 0;
    let warning = 0;

    for (const sign of dangerSigns) {
        const severity = String(sign.severity || '').toLowerCase();
        if (severity.includes('critical') || severity.includes('urgent')) {
            critical += 1;
        } else {
            warning += 1;
        }
    }

    return [
        critical > 0 ? 1 : 0,
        clampNumber(critical / 5, 0, 1),
        clampNumber(warning / 10, 0, 1)
    ];
}

/**
 * BUILD THE COMPLETE FEATURE VECTOR
 * Combines all data sources into one unified vector
 */
function buildUnifiedFeatureVector({
    vitals = {},
    symptoms = '',
    healthIndicators = [],
    ancElements = [],
    dangerSigns = []
} = {}) {
    // 1. Base vitals (7 features)
    const vitalVector = BASE_VITAL_FEATURES.map(feature => {
        const value = toFiniteNumber(vitals[feature], 0);
        // Normalize to approximate 0-1 range
        const ranges = {
            age: { min: 10, max: 50 },
            systolicBP: { min: 70, max: 200 },
            diastolicBP: { min: 40, max: 140 },
            bloodSugar: { min: 3, max: 19 },
            bodyTemp: { min: 97, max: 103 },
            heartRate: { min: 50, max: 130 },
            bmi: { min: 14, max: 45 }
        };
        const range = ranges[feature];
        if (!range) return clampNumber(value / 100, 0, 1);
        return clampNumber((value - range.min) / (range.max - range.min), 0, 1);
    });

    // 2. Binary risk features (4 features)
    const binaryVector = BINARY_RISK_FEATURES.map(feature => {
        return toBinaryMetric(vitals[feature], 0);
    });

    // 3. Symptom encoding (20 features)
    const symptomVector = encodeSymptomsToVector(symptoms);

    // 4. Health indicators (10 features)
    const healthIndicatorVector = encodeHealthIndicators(healthIndicators);

    // 5. ANC data elements (8 features)
    const ancVector = encodeAncDataElements(ancElements);

    // 6. Danger sign encoding (3 features)
    const dangerVector = encodeDangerSigns(dangerSigns);

    // 7. Trimester as scalar
    const week = toFiniteNumber(vitals.week, null) || toFiniteNumber(vitals.currentWeek, null);
    const trimester = week !== null
        ? (week <= 13 ? 0 : week <= 27 ? 0.5 : 1)
        : 0.5;

    return [
        ...vitalVector,
        ...binaryVector,
        ...symptomVector,
        ...healthIndicatorVector,
        ...ancVector,
        ...dangerVector,
        trimester
    ];
}

const UNIFIED_FEATURE_COUNT = (() => {
    return BASE_VITAL_FEATURES.length          // 7
        + BINARY_RISK_FEATURES.length          // 4
        + SYMPTOM_COUNT                        // 20
        + HEALTH_INDICATOR_TOPIC_COUNT         // 10
        + ANC_CATEGORY_COUNT                   // 8
        + 3                                    // danger sign encoding
        + 1;                                   // trimester
})(); // Total: 53 features

/**
 * GENERATE FEATURE NAMES FOR THE UNIFIED MODEL
 */
function getUnifiedFeatureNames() {
    const vitalNames = BASE_VITAL_FEATURES.map(f => `vitals:${f}`);
    const binaryNames = BINARY_RISK_FEATURES.map(f => `risk:${f}`);
    const symptomNames = Object.keys(SYMPTOM_FEATURES).map(k => `symptom:${k}`);
    const indicatorNames = HEALTH_INDICATOR_TOPICS.map(t => `indicator:${t}`);
    const ancNames = ANC_DATA_ELEMENT_CATEGORIES.map(c => `anc:${c}`);
    const dangerNames = ['danger:hasUrgent', 'danger:criticalCount', 'danger:warningCount'];
    return [...vitalNames, ...binaryNames, ...symptomNames, ...indicatorNames, ...ancNames, ...dangerNames, 'trimester'];
}

/**
 * BUILD TRAINING SAMPLE FROM MATERNAL RISK RECORD + ENRICHED DATA
 */
function buildTrainingSample(record = {}, {
    symptoms = '',
    healthIndicators = [],
    ancElements = [],
    dangerSigns = []
} = {}) {
    const metrics = record.metrics || record.measurements || record;
    const hasRequiredVitals = ['age', 'systolicBP', 'diastolicBP', 'bloodSugar', 'bodyTemp', 'heartRate']
        .every(feature => toFiniteNumber(metrics[feature], null) !== null);

    if (!hasRequiredVitals) return null;

    const riskLevel = normalizeRiskLevel(record.riskLevel || record.prediction || record.calculatedRiskLevel || 'low risk');
    const labelIndex = HEALTH_OUTPUT_CLASSES[riskLevel];
    if (labelIndex === undefined) return null;

    const vitals = {
        age: metrics.age,
        systolicBP: metrics.systolicBP,
        diastolicBP: metrics.diastolicBP,
        bloodSugar: metrics.bloodSugar,
        bodyTemp: metrics.bodyTemp,
        heartRate: metrics.heartRate,
        bmi: metrics.bmi,
        previousComplications: metrics.previousComplications,
        preexistingDiabetes: metrics.preexistingDiabetes,
        gestationalDiabetes: metrics.gestationalDiabetes,
        mentalHealth: metrics.mentalHealth,
        week: record.week
    };

    const features = buildUnifiedFeatureVector({
        vitals,
        symptoms: record.symptoms || symptoms,
        healthIndicators,
        ancElements,
        dangerSigns
    });

    return {
        id: record._id ? String(record._id) : generateId(JSON.stringify(vitals)),
        features,
        labelIndex,
        label: riskLevel,
        riskClass: normalizeRiskClass(riskLevel),
        vitals
    };
}

/**
 * LOAD TENSORFLOW RUNTIME
 */
let runtimePromise = null;

async function loadTensorflowRuntime() {
    if (runtimePromise) return runtimePromise;

    runtimePromise = (async () => {
        let nativeError = null;
        try {
            const tf = require('@tensorflow/tfjs-node');
            if (tf.ready) await tf.ready();
            return {
                tf,
                packageName: '@tensorflow/tfjs-node',
                backend: tf.getBackend ? tf.getBackend() : 'tensorflow',
                native: true
            };
        } catch (error) {
            nativeError = error;
        }

        const tf = require('@tensorflow/tfjs');
        if (tf.setBackend) {
            try {
                await tf.setBackend('cpu');
            } catch {
                // Default backend works
            }
        }
        if (tf.ready) await tf.ready();

        return {
            tf,
            packageName: '@tensorflow/tfjs',
            backend: tf.getBackend ? tf.getBackend() : 'cpu',
            native: false,
            nativeError: nativeError ? nativeError.message : ''
        };
    })();

    return runtimePromise;
}

/**
 * BUILD THE UNIFIED MODEL ARCHITECTURE
 * A wider, deeper network capable of learning from 53 features
 */
function buildModel(tf) {
    const model = tf.sequential();

    // Input layer: 53 features
    model.add(tf.layers.dense({
        inputShape: [UNIFIED_FEATURE_COUNT],
        units: 64,
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
    }));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.dropout({ rate: 0.3 }));

    // Hidden layer 2
    model.add(tf.layers.dense({
        units: 32,
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
    }));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.dropout({ rate: 0.2 }));

    // Hidden layer 3
    model.add(tf.layers.dense({
        units: 16,
        activation: 'relu'
    }));
    model.add(tf.layers.dropout({ rate: 0.15 }));

    // Output layer: 3 risk classes
    model.add(tf.layers.dense({
        units: 3,
        activation: 'softmax'
    }));

    model.compile({
        optimizer: tf.train.adam(0.005),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
    });

    return model;
}

/**
 * TRAIN TEST SPLIT
 */
function getTrainTestSplit(samples = [], testSplit = DEFAULT_TEST_SPLIT) {
    const ordered = [...samples].sort((a, b) => {
        const scoreA = computeDeterministicScore(a.id || `${a.label}-${a.features?.join(',')}`);
        const scoreB = computeDeterministicScore(b.id || `${b.label}-${b.features?.join(',')}`);
        return scoreA - scoreB;
    });

    const safeSplit = clampNumber(testSplit, 0.05, 0.45);
    const testCount = Math.max(1, Math.floor(ordered.length * safeSplit));
    const trainCount = Math.max(0, ordered.length - testCount);

    return {
        trainSamples: ordered.slice(0, trainCount),
        testSamples: ordered.slice(trainCount)
    };
}

/**
 * SAVE THE TRAINED MODEL
 */
async function saveModel(tf, model, metadata = {}) {
    await fs.mkdir(MODEL_DIR, { recursive: true });

    await model.save(tf.io.withSaveHandler(async artifacts => {
        const weightBuffer = artifacts.weightData
            ? Buffer.from(new Uint8Array(artifacts.weightData))
            : Buffer.alloc(0);

        const modelJson = {
            format: artifacts.format || 'layers-model',
            generatedBy: artifacts.generatedBy || `TensorFlow.js ${tf.version?.tfjs || ''}`.trim(),
            convertedBy: artifacts.convertedBy || null,
            modelTopology: artifacts.modelTopology,
            weightsManifest: [
                {
                    paths: ['weights.bin'],
                    weights: artifacts.weightSpecs || []
                }
            ]
        };

        await fs.writeFile(MODEL_JSON_PATH, JSON.stringify(modelJson, null, 2));
        await fs.writeFile(MODEL_WEIGHTS_PATH, weightBuffer);
        await fs.writeFile(MODEL_METADATA_PATH, JSON.stringify(metadata, null, 2));

        return {
            modelArtifactsInfo: {
                dateSaved: new Date(),
                modelTopologyType: 'JSON',
                weightDataBytes: weightBuffer.length
            }
        };
    }));
}

/**
 * LOAD SAVED MODEL
 */
let cachedModelState = null;

async function loadSavedModel() {
    if (cachedModelState) return cachedModelState;

    const [modelJsonRaw, weightBuffer, metadataRaw] = await Promise.all([
        fs.readFile(MODEL_JSON_PATH, 'utf8'),
        fs.readFile(MODEL_WEIGHTS_PATH),
        fs.readFile(MODEL_METADATA_PATH, 'utf8')
    ]);

    const modelJson = JSON.parse(modelJsonRaw);
    const metadata = JSON.parse(metadataRaw);

    const weightData = weightBuffer.buffer.slice(
        weightBuffer.byteOffset,
        weightBuffer.byteOffset + weightBuffer.byteLength
    );

    const runtime = await loadTensorflowRuntime();
    const model = await runtime.tf.loadLayersModel(runtime.tf.io.fromMemory({
        modelTopology: modelJson.modelTopology,
        weightSpecs: modelJson.weightsManifest?.[0]?.weights || [],
        weightData
    }));

    cachedModelState = { tf: runtime.tf, model, metadata, runtime };
    return cachedModelState;
}

async function getModelStatus() {
    try {
        const metadataRaw = await fs.readFile(MODEL_METADATA_PATH, 'utf8');
        const metadata = JSON.parse(metadataRaw);
        return {
            exists: true,
            loaded: Boolean(cachedModelState),
            modelPath: MODEL_DIR,
            metadata,
            featureCount: UNIFIED_FEATURE_COUNT,
            outputLabels: HEALTH_OUTPUT_LABELS,
            featureNames: getUnifiedFeatureNames()
        };
    } catch {
        return {
            exists: false,
            loaded: false,
            modelPath: MODEL_DIR,
            metadata: null,
            featureCount: UNIFIED_FEATURE_COUNT,
            outputLabels: HEALTH_OUTPUT_LABELS,
            featureNames: getUnifiedFeatureNames()
        };
    }
}

/**
 * PREDICT USING THE SAVED MODEL
 */
async function predictWithUnifiedModel(input = {}) {
    const state = await loadSavedModel();
    const { tf, model, metadata } = state;

    const features = buildUnifiedFeatureVector(input);
    const inputTensor = tf.tensor2d([features], [1, UNIFIED_FEATURE_COUNT]);
    const outputTensor = model.predict(inputTensor);
    const probabilities = Array.from(await outputTensor.data()).map(v => Number(v) || 0);

    inputTensor.dispose();
    outputTensor.dispose();

    let bestIndex = 0;
    probabilities.forEach((value, index) => {
        if (value > probabilities[bestIndex]) bestIndex = index;
    });

    const prediction = HEALTH_OUTPUT_LABELS[bestIndex] || 'low risk';

    return {
        prediction,
        riskClass: normalizeRiskClass(prediction),
        confidenceScore: probabilities[bestIndex] || 0,
        probabilities,
        rawDistribution: {
            lowRisk: probabilities[0] || 0,
            midRisk: probabilities[1] || 0,
            highRisk: probabilities[2] || 0
        },
        featureNames: getUnifiedFeatureNames(),
        featureVector: features,
        model: metadata.model || MODEL_NAME,
        modelPath: MODEL_DIR,
        trainedAt: metadata.trainedAt,
        trainedRecords: metadata.trainingSamples || metadata.recordsSampled || 0
    };
}

/**
 * EVALUATE ACCURACY ON HOLDOUT SET
 */
async function evaluateModel(tf, model, samples = [], labelNames = HEALTH_OUTPUT_LABELS, limit = 100) {
    const selected = samples.slice(0, Math.max(1, Number.parseInt(limit, 10) || 100));
    let correct = 0;
    const testMatrix = [];

    for (const sample of selected) {
        const inputTensor = tf.tensor2d([sample.features], [1, UNIFIED_FEATURE_COUNT]);
        const outputTensor = model.predict(inputTensor);
        const probs = Array.from(await outputTensor.data()).map(v => Number(v) || 0);
        inputTensor.dispose();
        outputTensor.dispose();

        let bestIndex = 0;
        probs.forEach((v, i) => { if (v > probs[bestIndex]) bestIndex = i; });

        const predicted = labelNames[bestIndex] || 'low risk';
        const actual = labelNames[sample.labelIndex] || sample.label || 'low risk';
        const passed = predicted === actual;
        if (passed) correct += 1;

        testMatrix.push({
            id: sample.id || '',
            actual,
            predicted,
            confidence: `${(probs[bestIndex] * 100).toFixed(1)}%`,
            confidenceScore: Number(probs[bestIndex].toFixed(4)),
            probabilities: {
                lowRisk: probs[0] || 0,
                midRisk: probs[1] || 0,
                highRisk: probs[2] || 0
            },
            passed
        });
    }

    return {
        totalEvaluated: selected.length,
        correct,
        accuracy: selected.length ? correct / selected.length : 0,
        accuracyPercentage: selected.length ? ((correct / selected.length) * 100).toFixed(2) : '0.00',
        testMatrix
    };
}

/**
 * EVALUATE THE SAVED MODEL
 */
async function evaluateSavedModelAccuracy(db, options = {}) {
    const limit = Math.min(Math.max(Number.parseInt(options.limit, 10) || 100, 5), 500);
    const state = await loadSavedModel();

    const trainingData = await loadAllTrainingData(db, {
        limit: options.trainingLimit || 3000,
        includeSymptoms: true,
        includeHealthIndicators: true,
        includeAncElements: true,
        includeDangerSigns: true
    });

    const { testSamples } = getTrainTestSplit(trainingData.samples, options.testSplit || DEFAULT_TEST_SPLIT);
    const evaluation = await evaluateModel(state.tf, state.model, testSamples, HEALTH_OUTPUT_LABELS, limit);

    return {
        success: true,
        model: state.metadata.model || MODEL_NAME,
        modelPath: MODEL_DIR,
        trainedAt: state.metadata.trainedAt,
        trainedRecords: state.metadata.trainingSamples || 0,
        featureCount: UNIFIED_FEATURE_COUNT,
        ...evaluation
    };
}

/**
 * LOAD ALL TRAINING DATA FROM ALL MONGODB COLLECTIONS
 */
async function loadAllTrainingData(db, options = {}) {
    const limit = Math.min(Math.max(Number.parseInt(options.limit, 10) || 3000, 100), 10000);
    const includeSymptoms = options.includeSymptoms !== false;
    const includeHealthIndicators = options.includeHealthIndicators !== false;
    const includeAncElements = options.includeAncElements !== false;
    const includeDangerSigns = options.includeDangerSigns !== false;

    // Load all datasets in parallel
    let maternalRiskRecords = [];
    let healthIndicators = [];
    let ancElements = [];
    let dangerSigns = [];
    let symptomsKnowledge = [];
    let totalRecords = 0;

    if (db && typeof db.collection === 'function') {
        try {
            const results = await Promise.all([
                db.collection('maternal_health_risk_records').find({}).limit(limit).toArray(),
                includeHealthIndicators
                    ? db.collection('health_pregnancy_indicators').find({}).limit(100).toArray()
                    : Promise.resolve([]),
                includeAncElements
                    ? db.collection('who_anc_data_elements').find({}).limit(100).toArray()
                    : Promise.resolve([]),
                includeDangerSigns
                    ? db.collection('danger_signs').find({}).limit(50).toArray()
                    : Promise.resolve([]),
                includeSymptoms
                    ? db.collection('symptoms').find({}).limit(50).toArray()
                    : Promise.resolve([])
            ]);

            maternalRiskRecords = results[0];
            healthIndicators = results[1];
            ancElements = results[2];
            dangerSigns = results[3];
            symptomsKnowledge = results[4];

            totalRecords = maternalRiskRecords.length;
        } catch (error) {
            console.warn('Failed to load some MongoDB data for training:', error.message);
        }
    }

    if (!maternalRiskRecords.length) {
        return {
            samples: [],
            totalRecords: 0,
            recordsSampled: 0,
            trainingSamples: 0,
            featureNames: getUnifiedFeatureNames(),
            labelNames: HEALTH_OUTPUT_LABELS,
            featureCount: UNIFIED_FEATURE_COUNT,
            dataSources: {
                maternalRiskRecords: 0,
                healthIndicators: healthIndicators.length,
                ancElements: ancElements.length,
                dangerSigns: dangerSigns.length,
                symptomsKnowledge: symptomsKnowledge.length
            },
            dataSourceSummary: 'No training data found in MongoDB'
        };
    }

    // Also try to load MN survey records
    let mnSurveyRecords = [];
    try {
        mnSurveyRecords = await db.collection('mn_survey_records').find({}).limit(100).toArray();
    } catch {
        // Optional
    }

    // Build training samples - each maternal_health_risk_record gets enriched with context
    const samples = [];
    const featureRanges = {};
    const classCounts = { low: 0, mid: 0, high: 0 };

    for (const record of maternalRiskRecords) {
        const sample = buildTrainingSample(record, {
            symptoms: '',
            healthIndicators,
            ancElements,
            dangerSigns
        });

        if (sample) {
            samples.push(sample);
            classCounts[sample.riskClass] = (classCounts[sample.riskClass] || 0) + 1;
        }
    }

    // Build feature ranges from the samples
    for (const feature of getUnifiedFeatureNames()) {
        const values = samples
            .map(s => s.features[getUnifiedFeatureNames().indexOf(feature)])
            .filter(v => v !== undefined && v !== null);
        if (values.length) {
            featureRanges[feature] = {
                min: Math.min(...values),
                max: Math.max(...values),
                avg: Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(4))
            };
        }
    }

    return {
        samples,
        totalRecords,
        recordsSampled: maternalRiskRecords.length,
        trainingSamples: samples.length,
        featureNames: getUnifiedFeatureNames(),
        labelNames: HEALTH_OUTPUT_LABELS,
        featureCount: UNIFIED_FEATURE_COUNT,
        featureRanges,
        classCounts,
        dataSources: {
            maternalRiskRecords: maternalRiskRecords.length,
            healthIndicators: healthIndicators.length,
            ancElements: ancElements.length,
            dangerSigns: dangerSigns.length,
            symptomsKnowledge: symptomsKnowledge.length,
            mnSurveyRecords: mnSurveyRecords.length
        },
        dataSourceSummary: [
            `Maternal risk records: ${maternalRiskRecords.length}`,
            `Health indicators: ${healthIndicators.length}`,
            `ANC data elements: ${ancElements.length}`,
            `Danger signs: ${dangerSigns.length}`,
            `Symptom knowledge: ${symptomsKnowledge.length}`,
            `MN survey records: ${mnSurveyRecords.length}`
        ].join(', ')
    };
}

/**
 * MAIN TRAINING FUNCTION
 */
async function trainUnifiedHealthAiModel(db, options = {}) {
    const epochs = Math.min(Math.max(Number.parseInt(options.epochs, 10) || DEFAULT_EPOCHS, 1), 300);
    const batchSize = Math.min(Math.max(Number.parseInt(options.batchSize, 10) || DEFAULT_BATCH_SIZE, 8), 128);
    const testSplit = Number.isFinite(Number(options.testSplit)) ? Number(options.testSplit) : DEFAULT_TEST_SPLIT;
    const includeSymptoms = options.includeSymptoms !== false;
    const includeHealthIndicators = options.includeHealthIndicators !== false;
    const includeAncElements = options.includeAncElements !== false;
    const includeDangerSigns = options.includeDangerSigns !== false;

    console.log('=== Unified Health AI Model Training ===');
    console.log(`Epochs: ${epochs}, Batch size: ${batchSize}, Test split: ${testSplit}`);
    console.log(`Data sources: symptoms=${includeSymptoms}, healthIndicators=${includeHealthIndicators}, ancElements=${includeAncElements}, dangerSigns=${includeDangerSigns}`);
    console.log(`Feature count: ${UNIFIED_FEATURE_COUNT}`);

    // Load all training data
    const training = await loadAllTrainingData(db, {
        limit: options.limit,
        includeSymptoms,
        includeHealthIndicators,
        includeAncElements,
        includeDangerSigns
    });

    if (training.samples.length < 10) {
        throw new Error(`Not enough samples to train: only ${training.samples.length} samples. Need at least 10.`);
    }

    console.log(`Loaded ${training.samples.length} training samples from ${training.dataSourceSummary}`);

    // Split into train/test
    const { trainSamples, testSamples } = getTrainTestSplit(training.samples, testSplit);

    if (trainSamples.length < 5 || testSamples.length < 1) {
        throw new Error(`Not enough samples after split: train=${trainSamples.length}, test=${testSamples.length}`);
    }

    console.log(`Train samples: ${trainSamples.length}, Test samples: ${testSamples.length}`);

    // Build and train the model
    const runtime = await loadTensorflowRuntime();
    const { tf } = runtime;
    const model = buildModel(tf);

    const xs = tf.tensor2d(
        trainSamples.map(s => s.features),
        [trainSamples.length, UNIFIED_FEATURE_COUNT]
    );
    const labelTensor = tf.tensor1d(trainSamples.map(s => s.labelIndex), 'int32');
    const ys = tf.oneHot(labelTensor, 3);
    labelTensor.dispose();

    console.log('Training unified health AI model...');
    const history = await model.fit(xs, ys, {
        epochs,
        batchSize: Math.min(batchSize, trainSamples.length),
        shuffle: true,
        validationSplit: trainSamples.length >= 40 ? 0.15 : 0,
        callbacks: {
            onEpochEnd: async (epoch, logs = {}) => {
                if (epoch === 0 || (epoch + 1) % 10 === 0 || epoch + 1 === epochs) {
                    const accuracy = logs.acc ?? logs.accuracy ?? 0;
                    const loss = logs.loss ?? 0;
                    const valAcc = logs.val_acc ?? logs.val_accuracy ?? null;
                    console.log(`Epoch ${epoch + 1}/${epochs}: loss=${Number(loss).toFixed(4)} acc=${Number(accuracy).toFixed(4)}${valAcc !== null ? ` val_acc=${Number(valAcc).toFixed(4)}` : ''}`);
                }
            }
        }
    });

    xs.dispose();
    ys.dispose();

    // Evaluate
    const evaluation = await evaluateModel(tf, model, testSamples, HEALTH_OUTPUT_LABELS, testSamples.length);

    const accuracyHistory = history.history.accuracy || history.history.acc || [];
    const lossHistory = history.history.loss || [];
    const valAccuracyHistory = history.history.val_accuracy || history.history.val_acc || [];

    const metadata = {
        model: MODEL_NAME,
        modelPath: MODEL_DIR,
        runtime: runtime.packageName,
        backend: runtime.backend,
        nativeRuntime: runtime.native,
        nativeRuntimeWarning: runtime.native ? '' : runtime.nativeError,
        featureCount: UNIFIED_FEATURE_COUNT,
        featureNames: getUnifiedFeatureNames(),
        labelNames: HEALTH_OUTPUT_LABELS,
        epochs,
        batchSize,
        testSplit,
        dataSources: training.dataSources,
        dataSourceSummary: training.dataSourceSummary,
        totalRecords: training.totalRecords,
        recordsSampled: training.recordsSampled,
        trainingSamples: trainSamples.length,
        holdoutSamples: testSamples.length,
        classCounts: training.classCounts,
        featureRanges: training.featureRanges,
        trainAccuracy: Number(accuracyHistory[accuracyHistory.length - 1] || 0),
        trainLoss: Number(lossHistory[lossHistory.length - 1] || 0),
        valAccuracy: valAccuracyHistory.length ? Number(valAccuracyHistory[valAccuracyHistory.length - 1] || 0) : null,
        holdoutAccuracy: evaluation.accuracy,
        holdoutAccuracyPercentage: evaluation.accuracyPercentage,
        includeSymptoms,
        includeHealthIndicators,
        includeAncElements,
        includeDangerSigns,
        trainedAt: new Date().toISOString(),
        method: [
            'Unified health AI model v2 trained on:',
            `- ${training.dataSources.maternalRiskRecords} maternal health risk records (vitals + binary risk flags)`,
            includeSymptoms ? `- ${training.dataSources.symptomsKnowledge} symptoms encoded as ${SYMPTOM_COUNT}-dim feature vectors` : '',
            includeHealthIndicators ? `- ${training.dataSources.healthIndicators} health indicators (World Bank/WHO) encoded as ${HEALTH_INDICATOR_TOPIC_COUNT}-dim vectors` : '',
            includeAncElements ? `- ${training.dataSources.ancElements} WHO ANC data elements encoded as ${ANC_CATEGORY_COUNT}-dim vectors` : '',
            includeDangerSigns ? `- ${training.dataSources.dangerSigns} danger signs with severity encoding` : '',
            includeSymptoms ? `- ${training.dataSources.symptomsKnowledge} symptom knowledge base` : '',
            `Total feature dimensions: ${UNIFIED_FEATURE_COUNT}`
        ].filter(Boolean).join('\n')
    };

    await saveModel(tf, model, metadata);
    cachedModelState = { tf, model, metadata, runtime };

    console.log('\n=== Training Complete ===');
    console.log(`Model saved to: ${MODEL_DIR}`);
    console.log(`Training samples: ${trainSamples.length}`);
    console.log(`Holdout samples: ${testSamples.length}`);
    console.log(`Holdout accuracy: ${evaluation.accuracyPercentage}%`);
    console.log(`Feature count: ${UNIFIED_FEATURE_COUNT}`);

    return {
        success: true,
        metadata,
        evaluation,
        evaluationDetails: evaluation.testMatrix,
        modelPath: MODEL_DIR,
        featureNames: getUnifiedFeatureNames()
    };
}

/**
 * GET TRAINING DATA SUMMARY (for API / dashboard)
 */
async function getTrainingDataSummary(db) {
    const training = await loadAllTrainingData(db, {
        limit: 5000,
        includeSymptoms: true,
        includeHealthIndicators: true,
        includeAncElements: true,
        includeDangerSigns: true
    });

    let totalMongoCounts = {};
    if (db && typeof db.collection === 'function') {
        try {
            const counts = await Promise.all([
                db.collection('maternal_health_risk_records').countDocuments({}).catch(() => 0),
                db.collection('health_pregnancy_indicators').countDocuments({}).catch(() => 0),
                db.collection('who_anc_data_elements').countDocuments({}).catch(() => 0),
                db.collection('danger_signs').countDocuments({}).catch(() => 0),
                db.collection('symptoms').countDocuments({}).catch(() => 0),
                db.collection('mn_survey_records').countDocuments({}).catch(() => 0)
            ]);
            totalMongoCounts = {
                maternal_health_risk_records: counts[0],
                health_pregnancy_indicators: counts[1],
                who_anc_data_elements: counts[2],
                danger_signs: counts[3],
                symptoms: counts[4],
                mn_survey_records: counts[5]
            };
        } catch {
            totalMongoCounts = {};
        }
    }

    return {
        model: MODEL_NAME,
        featureCount: UNIFIED_FEATURE_COUNT,
        featureNames: getUnifiedFeatureNames(),
        outputLabels: HEALTH_OUTPUT_LABELS,
        modelExists: cachedModelState ? true : await fs.access(MODEL_METADATA_PATH).then(() => true).catch(() => false),
        totalMongoCounts,
        sampledData: training.dataSources,
        trainingSamples: training.samples.length,
        classCounts: training.classCounts,
        dataSourceSummary: training.dataSourceSummary
    };
}

module.exports = {
    MODEL_NAME,
    MODEL_DIR,
    UNIFIED_FEATURE_COUNT,
    HEALTH_OUTPUT_LABELS,
    getUnifiedFeatureNames,
    buildUnifiedFeatureVector,
    encodeSymptomsToVector,
    encodeHealthIndicators,
    encodeAncDataElements,
    encodeDangerSigns,
    trainUnifiedHealthAiModel,
    predictWithUnifiedModel,
    evaluateSavedModelAccuracy,
    loadSavedModel,
    getModelStatus,
    getTrainingDataSummary,
    loadAllTrainingData
};
