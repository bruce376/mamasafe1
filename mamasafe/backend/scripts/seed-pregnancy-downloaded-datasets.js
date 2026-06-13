require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { MongoClient } = require('mongodb');
const {
    ensureDownloadedPregnancyDatasets,
    ensureMaternalRiskDatasets,
    loadDownloadedManifest,
    loadMaternalRiskRecords,
    loadMnSurveyRecords,
    loadWhoAncDataElements
} = require('../services/pregnancyDownloadedDatasets');

function normalizeMongoUri(uri) {
    if (!uri) return '';
    const trimmed = uri.trim();
    if (!trimmed.includes('mongodb.net')) return trimmed;

    try {
        const parsed = new URL(trimmed);
        if (!parsed.searchParams.has('tls') && !parsed.searchParams.has('ssl')) {
            parsed.searchParams.set('tls', 'true');
        }
        return parsed.toString();
    } catch {
        return trimmed;
    }
}

async function connectDb() {
    const uri = normalizeMongoUri(process.env.MONGODB_URI || process.env.MONGODB_LOCAL_URI);
    const dbName = process.env.MONGODB_DB_NAME || 'mamasafe';

    if (!uri) {
        throw new Error('MONGODB_URI or MONGODB_LOCAL_URI is required to check MongoDB pregnancy dataset collections.');
    }

    const client = new MongoClient(uri, {
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        retryReads: true,
        retryWrites: true,
        tls: uri.includes('mongodb.net') || uri.includes('mongodb+srv')
    });

    await client.connect();
    return { client, db: client.db(dbName), dbName };
}

async function main() {
    const dryRun = process.argv.includes('--dry-run');
    const riskOnly = process.argv.includes('--risk-only');
    const manifest = await loadDownloadedManifest();

    if (dryRun) {
        const maternalManifests = manifest.filter(item => item.mongodbCollection === 'maternal_health_risk_records');
        const mnSurveyManifests = manifest.filter(item => item.mongodbCollection === 'mn_survey_records');
        const dataDictionaryManifest = manifest.find(item => item.datasetId === 'who-anc-core-data-dictionary-2021');
        const maternalRecords = (await Promise.all(maternalManifests.map(item => loadMaternalRiskRecords(item)))).flat();
        const mnSurveyRecords = (await Promise.all(mnSurveyManifests.map(item => loadMnSurveyRecords(item)))).flat();
        const dataElements = dataDictionaryManifest ? await loadWhoAncDataElements(dataDictionaryManifest) : [];
        console.log(`source datasets: ${manifest.length} local documents ready`);
        console.log(`maternal_health_risk_records: ${maternalRecords.length} documents ready`);
        console.log(`mn_survey_records: ${mnSurveyRecords.length} documents ready`);
        console.log(`who_anc_data_elements: ${dataElements.length} documents ready`);
        console.log('Backend dataset file seeding is disabled. Keep PDF chunks and knowledge records in MongoDB.');
        return;
    }

    const { client, db, dbName } = await connectDb();
    try {
        const result = riskOnly
            ? await ensureMaternalRiskDatasets(db)
            : await ensureDownloadedPregnancyDatasets(db);
        console.log(`${dbName}.pregnancy_source_datasets:`, result.sourceDatasets);
        console.log(`${dbName}.maternal_health_risk_records:`, result.maternalRisk);
        console.log(`${dbName}.mn_survey_records:`, result.mnSurvey);
        if (!riskOnly) {
            console.log(`${dbName}.who_anc_data_elements:`, result.whoAncDataElements);
            console.log(`${dbName}.who_document_chunks:`, result.pdfChunks);
        } else {
            const riskCollection = db.collection('maternal_health_risk_records');
            const [total, expanded, legacyUci] = await Promise.all([
                riskCollection.countDocuments({}),
                riskCollection.countDocuments({ datasetId: 'maternal-risk-expanded-2026' }),
                riskCollection.countDocuments({ datasetId: 'uci-maternal-health-risk' })
            ]);
            console.log(`${dbName}.maternal_health_risk_records total:`, total);
            console.log(`${dbName}.maternal_health_risk_records expanded:`, expanded);
            console.log(`${dbName}.maternal_health_risk_records legacy_uci:`, legacyUci);
        }
    } finally {
        await client.close();
    }
}

main().catch(error => {
    console.error('Failed to check MongoDB pregnancy dataset collections:', error.message);
    process.exitCode = 1;
});
