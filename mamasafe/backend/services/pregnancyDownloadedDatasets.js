const DOWNLOADED_SOURCE_SYSTEM = 'mamasafe-mongodb-pregnancy-dataset';
const PDF_CHUNK_SOURCE_SYSTEM = 'mamasafe-mongodb-pdf-dataset';
const DOWNLOADED_SCHEMA_VERSION = 2;
const DOWNLOADED_COLLECTIONS = [
    'pregnancy_source_datasets',
    'maternal_health_risk_records',
    'maternal_mortality_indicators',
    'health_pregnancy_indicators',
    'who_anc_data_elements',
    'mn_survey_records'
];

const EMPTY_RESULT = Object.freeze({ inserted: 0, updated: 0, databaseOnly: true });

async function loadDownloadedManifest() {
    return [];
}

async function loadMaternalRiskRecords() {
    return [];
}

async function loadMnSurveyRecords() {
    return [];
}

async function loadWhoAncDataElements() {
    return [];
}

async function ensureMaternalRiskDatasets() {
    return {
        sourceDatasets: { ...EMPTY_RESULT },
        maternalRisk: { ...EMPTY_RESULT },
        mnSurvey: { ...EMPTY_RESULT }
    };
}

async function ensureDownloadedPregnancyDatasets() {
    return {
        sourceDatasets: { ...EMPTY_RESULT },
        maternalRisk: { ...EMPTY_RESULT },
        mnSurvey: { ...EMPTY_RESULT },
        whoAncDataElements: { ...EMPTY_RESULT },
        pdfChunks: { ...EMPTY_RESULT }
    };
}

module.exports = {
    DOWNLOADED_SOURCE_SYSTEM,
    PDF_CHUNK_SOURCE_SYSTEM,
    DOWNLOADED_SCHEMA_VERSION,
    DOWNLOADED_COLLECTIONS,
    ensureDownloadedPregnancyDatasets,
    ensureMaternalRiskDatasets,
    loadDownloadedManifest,
    loadMaternalRiskRecords,
    loadMnSurveyRecords,
    loadWhoAncDataElements
};
