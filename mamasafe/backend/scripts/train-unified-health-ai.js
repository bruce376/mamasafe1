/**
 * Train Unified Health AI Model
 * 
 * Trains a TensorFlow.js model on ALL available maternal and health data:
 * - maternal_health_risk_records (vitals + risk labels)
 * - symptoms (encoded as 20-dim feature vectors from 20+ symptom categories)
 * - health_pregnancy_indicators (World Bank + WHO indicator data by topic)
 * - who_anc_data_elements (WHO ANC data dictionary categories)
 * - danger_signs (urgency/severity-encoded safety records)
 * - mn_survey_records (maternal nutrition survey data)
 * 
 * Usage: node scripts/train-unified-health-ai.js [options]
 * Options:
 *   --epochs=60          Number of training epochs (default: 60)
 *   --batchSize=32       Batch size (default: 32)
 *   --testSplit=0.2      Fraction of data for holdout (default: 0.2)
 *   --limit=3000         Max records to load from MongoDB (default: 3000)
 *   --no-symptoms        Exclude symptom features
 *   --no-health-indicators Exclude health indicator features
 *   --no-anc-elements    Exclude WHO ANC data elements
 *   --no-danger-signs    Exclude danger sign features
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });

const { connectDB } = require('../config/database');
const { trainUnifiedHealthAiModel } = require('../services/unifiedHealthAiModel');

function getArg(name, fallback) {
    const prefix = `${name}=`;
    const found = process.argv.find(arg => arg.startsWith(prefix));
    if (!found) return fallback;
    return found.slice(prefix.length);
}

function hasFlag(name) {
    return process.argv.includes(name);
}

async function main() {
    const epochs = Number.parseInt(getArg('--epochs', '60'), 10) || 60;
    const batchSize = Number.parseInt(getArg('--batchSize', '32'), 10) || 32;
    const testSplit = Number(getArg('--testSplit', '0.2')) || 0.2;
    const limit = Number.parseInt(getArg('--limit', '3000'), 10) || 3000;

    const includeSymptoms = !hasFlag('--no-symptoms');
    const includeHealthIndicators = !hasFlag('--no-health-indicators');
    const includeAncElements = !hasFlag('--no-anc-elements');
    const includeDangerSigns = !hasFlag('--no-danger-signs');

    console.log('========================================');
    console.log('  Unified Health AI Model Training');
    console.log('========================================');
    console.log(`Epochs:        ${epochs}`);
    console.log(`Batch size:    ${batchSize}`);
    console.log(`Test split:    ${testSplit}`);
    console.log(`Limit records: ${limit}`);
    console.log(`Symptoms:      ${includeSymptoms ? 'YES' : 'NO'}`);
    console.log(`Health ind.:   ${includeHealthIndicators ? 'YES' : 'NO'}`);
    console.log(`ANC elements:  ${includeAncElements ? 'YES' : 'NO'}`);
    console.log(`Danger signs:  ${includeDangerSigns ? 'YES' : 'NO'}`);
    console.log('========================================\n');

    // Connect to MongoDB
    let client = null;
    let db = null;
    try {
        const connection = await connectDB({
            serverSelectionTimeoutMS: 15000,
            connectTimeoutMS: 15000,
            maxPoolSize: 5
        });
        db = connection.db;
        client = connection.client;
        console.log(`Connected to MongoDB database: ${connection.dbName || 'mamasafe'}`);
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        console.error('Training requires MongoDB access with maternal health records.');
        process.exit(1);
    }

    // Verify MongoDB has data
    try {
        const count = await db.collection('maternal_health_risk_records').countDocuments({});
        if (count === 0) {
            console.error('No maternal_health_risk_records found in MongoDB.');
            console.error('Run the dataset import scripts first.');
            await client.close();
            process.exit(1);
        }
        console.log(`Found ${count} maternal health risk records in MongoDB.\n`);
    } catch (error) {
        console.error('Failed to check MongoDB collections:', error.message);
        await client.close();
        process.exit(1);
    }

    try {
        const result = await trainUnifiedHealthAiModel(db, {
            epochs,
            batchSize,
            testSplit,
            limit,
            includeSymptoms,
            includeHealthIndicators,
            includeAncElements,
            includeDangerSigns
        });

        console.log('\nTraining completed successfully!');
        console.log(`Model saved to: ${result.modelPath}`);
        console.log(`Final holdout accuracy: ${result.evaluation.accuracyPercentage}%`);
        console.log(`Training samples: ${result.metadata.trainingSamples}`);
        console.log(`Holdout samples: ${result.metadata.holdoutSamples}`);
        console.log(`Features: ${result.metadata.featureCount}`);

        if (result.evaluation.testMatrix) {
            const failures = result.evaluation.testMatrix.filter(t => !t.passed);
            if (failures.length > 0) {
                console.log(`\n${failures.length} misclassifications:`);
                failures.slice(0, 10).forEach(f => {
                    console.log(`  ${f.id ? f.id.slice(0, 24) + ' ' : ''}actual=${f.actual} predicted=${f.predicted} confidence=${f.confidence}`);
                });
            }
        }
    } catch (error) {
        console.error('Training failed:', error.message);
        process.exit(1);
    } finally {
        if (client) await client.close();
    }
}

main();
