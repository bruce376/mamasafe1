const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const { getPregnancyTensorflowTrainingData } = require('./pregnancyRag');

const MODEL_NAME = 'mamasafe-maternal-risk-custom-ai';
const MODEL_DIR = path.join(__dirname, '..', 'models', 'maternal-health-model');
const MODEL_JSON_PATH = path.join(MODEL_DIR, 'model.json');
const MODEL_WEIGHTS_PATH = path.join(MODEL_DIR, 'weights.bin');
const MODEL_METADATA_PATH = path.join(MODEL_DIR, 'metadata.json');
const DEFAULT_LIMIT = 1600;
const DEFAULT_EPOCHS = 40;
const DEFAULT_TEST_SPLIT = 0.2;

let runtimePromise = null;
let cachedModelState = null;

function clampNumber(value, min, max) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return min;
    return Math.min(Math.max(numeric, min), max);
}

function riskClassForRiskLevel(riskLevel = '') {
    const text = String(riskLevel).toLowerCase();
    if (text.includes('high')) return 'high';
    if (text.includes('mid')) return 'mid';
    return 'low';
}

function probabilityKeyForRiskLevel(riskLevel = '') {
    const riskClass = riskClassForRiskLevel(riskLevel);
    if (riskClass === 'high') return 'highRisk';
    if (riskClass === 'mid') return 'midRisk';
    return 'lowRisk';
}

function loadTensorflowRuntime() {
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
                // The pure JS runtime still has a default backend if setting CPU is unavailable.
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

function deterministicScore(value = '') {
    const digest = crypto.createHash('sha1').update(String(value)).digest('hex').slice(0, 8);
    return Number.parseInt(digest, 16);
}

function getTrainTestSplit(samples = [], testSplit = DEFAULT_TEST_SPLIT) {
    const ordered = [...samples].sort((a, b) => {
        const scoreA = deterministicScore(a.id || `${a.label}-${a.features?.join(',')}`);
        const scoreB = deterministicScore(b.id || `${b.label}-${b.features?.join(',')}`);
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

function getSampleSet(training = {}, testSplit = DEFAULT_TEST_SPLIT) {
    const samples = (training.samples || [])
        .filter(sample => Array.isArray(sample.features) && Number.isInteger(sample.labelIndex));
    const split = getTrainTestSplit(samples, testSplit);

    if (split.trainSamples.length < 10 || split.testSamples.length < 1) {
        throw new Error('Not enough maternal-risk records to train and validate the custom AI model.');
    }

    return {
        samples,
        ...split
    };
}

function buildModel(tf, featureCount, labelCount) {
    const model = tf.sequential();
    model.add(tf.layers.dense({ inputShape: [featureCount], units: 16, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 8, activation: 'relu' }));
    model.add(tf.layers.dense({ units: labelCount, activation: 'softmax' }));
    model.compile({
        optimizer: tf.train.adam(0.01),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
    });
    return model;
}

async function saveLayersModel(tf, model, metadata = {}) {
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

async function readSavedModel(tf) {
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

    const model = await tf.loadLayersModel(tf.io.fromMemory({
        modelTopology: modelJson.modelTopology,
        weightSpecs: modelJson.weightsManifest?.[0]?.weights || [],
        weightData
    }));

    return { model, metadata };
}

function normalizeFeature(value, range = {}) {
    const numeric = Number(value);
    const min = Number(range.min);
    const max = Number(range.max);
    if (!Number.isFinite(numeric)) return 0;
    if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
        return clampNumber(numeric, 0, 1);
    }
    return clampNumber((numeric - min) / (max - min), 0, 1);
}

function numberFromInput(input = {}, feature) {
    const aliases = {
        systolicBP: ['systolic'],
        diastolicBP: ['diastolic'],
        bloodSugar: ['glucose'],
        bodyTemp: ['temp']
    };
    const values = [input[feature], ...(aliases[feature] || []).map(alias => input[alias])];
    const value = values.find(item => item !== undefined && item !== null && item !== '');
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
}

function buildFeatureVector(input = {}, metadata = {}) {
    const ranges = metadata.featureRanges || {};
    return (metadata.featureNames || []).map(feature => normalizeFeature(
        numberFromInput(input, feature),
        ranges[feature]
    ));
}

async function predictVector(tf, model, vector = [], labelNames = []) {
    const inputTensor = tf.tensor2d([vector], [1, vector.length]);
    const outputTensor = model.predict(inputTensor);
    const probabilities = Array.from(await outputTensor.data()).map(value => Number(value) || 0);
    inputTensor.dispose();
    outputTensor.dispose();

    let bestIndex = 0;
    probabilities.forEach((value, index) => {
        if (value > probabilities[bestIndex]) bestIndex = index;
    });

    const prediction = labelNames[bestIndex] || 'low risk';
    return {
        prediction,
        riskClass: riskClassForRiskLevel(prediction),
        confidenceScore: probabilities[bestIndex] || 0,
        probabilities,
        rawDistribution: {
            lowRisk: probabilities[labelNames.indexOf('low risk')] || 0,
            midRisk: probabilities[labelNames.indexOf('mid risk')] || 0,
            highRisk: probabilities[labelNames.indexOf('high risk')] || 0
        }
    };
}

async function evaluateSamples(tf, model, samples = [], labelNames = [], limit = 50) {
    const selected = samples.slice(0, Math.max(1, Number.parseInt(limit, 10) || 50));
    let correctPredictions = 0;
    const testMatrix = [];

    for (const sample of selected) {
        const result = await predictVector(tf, model, sample.features, labelNames);
        const actual = labelNames[sample.labelIndex] || sample.label || 'low risk';
        const passed = result.prediction === actual;
        if (passed) correctPredictions += 1;
        testMatrix.push({
            recordId: sample.id || '',
            vitalsSummary: sample.summary || `Features: ${sample.features.map(value => Number(value).toFixed(3)).join(', ')}`,
            actual,
            predicted: result.prediction,
            confidence: `${(result.confidenceScore * 100).toFixed(1)}%`,
            confidenceScore: Number(result.confidenceScore.toFixed(4)),
            probabilities: result.rawDistribution,
            passed
        });
    }

    return {
        totalTestRecordsEvaluated: selected.length,
        correctPredictions,
        accuracy: selected.length ? correctPredictions / selected.length : 0,
        accuracyPercentage: selected.length ? ((correctPredictions / selected.length) * 100).toFixed(2) : '0.00',
        testMatrix
    };
}

async function trainMaternalRiskAiModel(db, options = {}) {
    const epochs = Math.min(Math.max(Number.parseInt(options.epochs, 10) || DEFAULT_EPOCHS, 1), 250);
    const limit = Math.min(Math.max(Number.parseInt(options.limit, 10) || DEFAULT_LIMIT, 100), 5000);
    const testSplit = Number.isFinite(Number(options.testSplit)) ? Number(options.testSplit) : DEFAULT_TEST_SPLIT;
    const runtime = await loadTensorflowRuntime();
    const { tf } = runtime;
    const training = await getPregnancyTensorflowTrainingData(db, { limit });
    const { samples, trainSamples, testSamples } = getSampleSet(training, testSplit);
    const featureNames = training.featureNames || [];
    const labelNames = training.labelNames || ['low risk', 'mid risk', 'high risk'];
    const model = buildModel(tf, featureNames.length, labelNames.length);

    const xs = tf.tensor2d(trainSamples.map(sample => sample.features), [trainSamples.length, featureNames.length]);
    const labelTensor = tf.tensor1d(trainSamples.map(sample => sample.labelIndex), 'int32');
    const ys = tf.oneHot(labelTensor, labelNames.length);
    labelTensor.dispose();

    const history = await model.fit(xs, ys, {
        epochs,
        batchSize: Math.min(32, trainSamples.length),
        shuffle: true,
        validationSplit: trainSamples.length >= 40 ? 0.15 : 0,
        callbacks: {
            onEpochEnd: async (epoch, logs = {}) => {
                if (typeof options.onEpochEnd === 'function') {
                    await options.onEpochEnd(epoch, logs);
                }
            }
        }
    });

    xs.dispose();
    ys.dispose();

    const evaluation = await evaluateSamples(tf, model, testSamples, labelNames, testSamples.length);
    const accuracyHistory = history.history.accuracy || history.history.acc || [];
    const lossHistory = history.history.loss || [];
    const metadata = {
        model: MODEL_NAME,
        modelPath: MODEL_DIR,
        runtime: runtime.packageName,
        backend: runtime.backend,
        nativeRuntime: runtime.native,
        nativeRuntimeWarning: runtime.native ? '' : runtime.nativeError,
        sourceCollection: training.sourceCollection,
        outputCollection: training.outputCollection || 'pregnancy_vital_assessments',
        storageSource: training.architecture?.storage || '',
        fallbackUsed: Boolean(training.fallbackUsed),
        fallbackReason: training.fallbackReason || '',
        recordsSampled: training.recordsSampled || samples.length,
        totalRecords: training.totalRecords || samples.length,
        trainingSamples: trainSamples.length,
        holdoutSamples: testSamples.length,
        epochs,
        featureNames,
        labelNames,
        featureRanges: training.featureRanges || {},
        trainAccuracy: Number(accuracyHistory[accuracyHistory.length - 1] || 0),
        trainLoss: Number(lossHistory[lossHistory.length - 1] || 0),
        holdoutAccuracy: evaluation.accuracy,
        holdoutAccuracyPercentage: evaluation.accuracyPercentage,
        trainedAt: new Date().toISOString(),
        method: 'MongoDB maternal-risk records train a TensorFlow.js neural network on the Node backend, then save the AI brain to backend/models/maternal-health-model.'
    };

    await saveLayersModel(tf, model, metadata);
    cachedModelState = { tf, model, metadata, runtime };

    return {
        success: true,
        metadata,
        evaluation,
        modelPath: MODEL_DIR
    };
}

async function loadSavedMaternalRiskAiModel() {
    if (cachedModelState) return cachedModelState;
    const runtime = await loadTensorflowRuntime();
    const saved = await readSavedModel(runtime.tf);
    cachedModelState = {
        tf: runtime.tf,
        model: saved.model,
        metadata: saved.metadata,
        runtime
    };
    return cachedModelState;
}

async function getMaternalRiskAiModelStatus() {
    try {
        const metadataRaw = await fs.readFile(MODEL_METADATA_PATH, 'utf8');
        const metadata = JSON.parse(metadataRaw);
        return {
            exists: true,
            loaded: Boolean(cachedModelState),
            modelPath: MODEL_DIR,
            metadata
        };
    } catch {
        return {
            exists: false,
            loaded: false,
            modelPath: MODEL_DIR,
            metadata: null
        };
    }
}

async function predictMaternalRiskWithSavedModel(input = {}) {
    const state = await loadSavedMaternalRiskAiModel();
    const vector = buildFeatureVector(input, state.metadata);
    const result = await predictVector(state.tf, state.model, vector, state.metadata.labelNames || []);
    return {
        ...result,
        model: state.metadata.model || MODEL_NAME,
        modelPath: MODEL_DIR,
        runtime: state.runtime.packageName,
        backend: state.runtime.backend,
        featureVector: vector,
        featureNames: state.metadata.featureNames || [],
        trainedRecords: state.metadata.recordsSampled || state.metadata.trainingSamples || null,
        epochs: state.metadata.epochs || null,
        accuracy: Number.isFinite(Number(state.metadata.holdoutAccuracy))
            ? Number(state.metadata.holdoutAccuracy)
            : Number(state.metadata.trainAccuracy || 0),
        trainAccuracy: Number(state.metadata.trainAccuracy || 0),
        holdoutAccuracy: Number(state.metadata.holdoutAccuracy || 0),
        sourceCollection: state.metadata.sourceCollection || 'maternal_health_risk_records',
        trainedAt: state.metadata.trainedAt
    };
}

async function evaluateMaternalRiskAiAccuracy(db, options = {}) {
    const limit = Math.min(Math.max(Number.parseInt(options.limit, 10) || 50, 5), 500);
    const state = await loadSavedMaternalRiskAiModel();
    const training = await getPregnancyTensorflowTrainingData(db, {
        limit: options.trainingLimit || state.metadata.recordsSampled || DEFAULT_LIMIT
    });
    const { testSamples } = getSampleSet(training, options.testSplit || DEFAULT_TEST_SPLIT);
    const evaluation = await evaluateSamples(
        state.tf,
        state.model,
        testSamples,
        state.metadata.labelNames || training.labelNames || [],
        limit
    );

    return {
        success: true,
        model: state.metadata.model || MODEL_NAME,
        sourceCollection: state.metadata.sourceCollection,
        modelPath: MODEL_DIR,
        trainedAt: state.metadata.trainedAt,
        runtime: state.runtime.packageName,
        backend: state.runtime.backend,
        ...evaluation
    };
}

module.exports = {
    MODEL_DIR,
    trainMaternalRiskAiModel,
    loadSavedMaternalRiskAiModel,
    predictMaternalRiskWithSavedModel,
    evaluateMaternalRiskAiAccuracy,
    getMaternalRiskAiModelStatus
};
