require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), override: true });

const crypto = require('crypto');
const { connectDB } = require('../config/database');

const SOURCE_SYSTEM = 'mamasafe-remote-health-pregnancy-import';
const SCHEMA_VERSION = 1;
const HEALTH_COLLECTION = 'health_pregnancy_indicators';

const WORLD_BANK_HEALTH_INDICATORS = [
    {
        datasetId: 'worldbank-skilled-birth-attendance',
        indicatorCode: 'SH.STA.BRTC.ZS',
        title: 'Births attended by skilled health staff',
        unit: 'percent of total births',
        topic: 'skilled birth attendance'
    },
    {
        datasetId: 'worldbank-antenatal-care-coverage',
        indicatorCode: 'SH.STA.ANVC.ZS',
        title: 'Pregnant women receiving prenatal care',
        unit: 'percent of pregnant women',
        topic: 'antenatal care'
    },
    {
        datasetId: 'worldbank-antenatal-care-four-visits',
        indicatorCode: 'SH.STA.ANV4.ZS',
        title: 'Pregnant women receiving prenatal care of at least four visits',
        unit: 'percent of pregnant women',
        topic: 'antenatal care'
    },
    {
        datasetId: 'worldbank-pregnancy-anemia-prevalence',
        indicatorCode: 'SH.PRG.ANEM',
        title: 'Prevalence of anemia among pregnant women',
        unit: 'percent',
        topic: 'pregnancy anemia'
    },
    {
        datasetId: 'worldbank-women-reproductive-age-anemia',
        indicatorCode: 'SH.ANM.ALLW.ZS',
        title: 'Prevalence of anemia among women of reproductive age',
        unit: 'percent of women ages 15-49',
        topic: 'women nutrition'
    },
    {
        datasetId: 'worldbank-adolescent-fertility-rate',
        indicatorCode: 'SP.ADO.TFRT',
        title: 'Adolescent fertility rate',
        unit: 'births per 1,000 women ages 15-19',
        topic: 'adolescent pregnancy'
    },
    {
        datasetId: 'worldbank-fertility-rate-total',
        indicatorCode: 'SP.DYN.TFRT.IN',
        title: 'Fertility rate, total',
        unit: 'births per woman',
        topic: 'fertility'
    },
    {
        datasetId: 'worldbank-contraceptive-prevalence-any',
        indicatorCode: 'SP.DYN.CONU.ZS',
        title: 'Contraceptive prevalence, any method',
        unit: 'percent of married women ages 15-49',
        topic: 'family planning'
    },
    {
        datasetId: 'worldbank-contraceptive-prevalence-modern',
        indicatorCode: 'SP.DYN.CONM.ZS',
        title: 'Contraceptive prevalence, modern methods',
        unit: 'percent of married women ages 15-49',
        topic: 'family planning'
    },
    {
        datasetId: 'worldbank-birth-rate-crude',
        indicatorCode: 'SP.DYN.CBRT.IN',
        title: 'Birth rate, crude',
        unit: 'per 1,000 people',
        topic: 'birth rate'
    },
    {
        datasetId: 'worldbank-neonatal-mortality-rate',
        indicatorCode: 'SH.DYN.NMRT',
        title: 'Mortality rate, neonatal',
        unit: 'per 1,000 live births',
        topic: 'newborn health'
    },
    {
        datasetId: 'worldbank-infant-mortality-rate',
        indicatorCode: 'SP.DYN.IMRT.IN',
        title: 'Mortality rate, infant',
        unit: 'per 1,000 live births',
        topic: 'infant health'
    },
    {
        datasetId: 'worldbank-female-life-expectancy',
        indicatorCode: 'SP.DYN.LE00.FE.IN',
        title: 'Life expectancy at birth, female',
        unit: 'years',
        topic: 'women health'
    },
    {
        datasetId: 'worldbank-pmtct-antiretroviral-coverage',
        indicatorCode: 'SH.HIV.PMTC.ZS',
        title: 'Antiretroviral therapy coverage for PMTCT',
        unit: 'percent',
        topic: 'HIV and pregnancy'
    }
];

const WHO_GHO_TERMS = [
    'maternal',
    'pregnan',
    'antenatal',
    'postnatal',
    'skilled birth',
    'birth attendant',
    'caesarean',
    'cesarean',
    'anaemia',
    'anemia',
    'neonatal',
    'stillbirth',
    'breastfeeding',
    'family planning',
    'contraceptive',
    'reproductive age',
    'women of reproductive'
];

function getArgValue(name, fallback = '') {
    const prefix = `${name}=`;
    const found = process.argv.find(arg => arg.startsWith(prefix));
    return found ? found.slice(prefix.length) : fallback;
}

function hasArg(name) {
    return process.argv.includes(name);
}

function sha1(value) {
    return crypto.createHash('sha1').update(String(value)).digest('hex');
}

function slug(value = '') {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
}

function toNumber(value) {
    if (value === undefined || value === null || value === '') return null;
    const numeric = Number(String(value).replace(/,/g, '').trim());
    return Number.isFinite(numeric) ? numeric : null;
}

function compactText(value = '') {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function uniqueKeywords(values = []) {
    return [...new Set(values.map(item => compactText(item).toLowerCase()).filter(Boolean))];
}

function inferTopic(text = '') {
    const normalized = String(text || '').toLowerCase();
    if (/ana?emia/.test(normalized)) return 'anemia and nutrition';
    if (/antenatal|prenatal/.test(normalized)) return 'antenatal care';
    if (/postnatal|postpartum/.test(normalized)) return 'postnatal care';
    if (/contraceptive|family planning/.test(normalized)) return 'family planning';
    if (/skilled birth|birth attendant|delivery/.test(normalized)) return 'delivery care';
    if (/caesarean|cesarean|c-section/.test(normalized)) return 'birth procedure';
    if (/neonatal|newborn|stillbirth|infant/.test(normalized)) return 'baby outcome';
    if (/maternal mortality|maternal death/.test(normalized)) return 'maternal mortality';
    if (/pregnan/.test(normalized)) return 'pregnancy';
    if (/women|female|reproductive age/.test(normalized)) return 'women health';
    return 'pregnancy and women health';
}

async function fetchJson(url, { timeoutMs = 45000 } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                accept: 'application/json',
                'user-agent': 'MamaSafe pregnancy dataset importer'
            }
        });
        if (!response.ok) {
            throw new Error(`Download failed (${response.status}) for ${url}`);
        }
        return await response.json();
    } finally {
        clearTimeout(timer);
    }
}

function sourceDatasetDoc(source) {
    const now = new Date();
    return {
        datasetId: source.datasetId,
        title: source.title,
        sourceOrganization: source.sourceOrganization,
        sourceUrl: source.sourceUrl,
        landingPage: source.landingPage || source.sourceUrl,
        license: source.license,
        category: source.category || 'pregnancy-women-health-public-dataset',
        topic: source.topic,
        pregnancyUse: source.pregnancyUse,
        mongodbCollection: HEALTH_COLLECTION,
        sourceSystem: SOURCE_SYSTEM,
        databaseOnly: true,
        localBackendFile: false,
        schemaVersion: SCHEMA_VERSION,
        keywords: uniqueKeywords([
            'pregnancy',
            'women health',
            'maternal health',
            source.topic,
            source.indicatorCode,
            source.datasetId
        ]),
        importedAt: now,
        updatedAt: now
    };
}

function worldBankSourceDoc(source) {
    return sourceDatasetDoc({
        ...source,
        sourceOrganization: 'World Bank',
        sourceUrl: `https://api.worldbank.org/v2/country/all/indicator/${source.indicatorCode}`,
        landingPage: `https://data.worldbank.org/indicator/${source.indicatorCode}`,
        license: 'World Bank Open Data Terms',
        pregnancyUse: 'Use for country/year public-health context about pregnancy care, women health, fertility, birth outcomes, and newborn outcomes. Not an individual diagnosis.'
    });
}

function buildWorldBankRecord(source, row) {
    const value = toNumber(row.value);
    if (value === null) return null;
    const year = Number.parseInt(row.date, 10);
    const countryName = row.country?.value || '';
    const countryCode = row.countryiso3code || row.country?.id || '';
    const indicatorName = row.indicator?.value || source.title;
    const title = `${indicatorName}: ${countryName || countryCode} ${year}`;
    const summary = `${indicatorName} for ${countryName || countryCode} in ${year}: ${value} ${source.unit}.`;

    return {
        importId: `worldbank-health:${source.indicatorCode}:${countryCode || row.country?.id || 'unknown'}:${year}`,
        datasetId: source.datasetId,
        sourceSystem: SOURCE_SYSTEM,
        sourceOrganization: 'World Bank',
        source: `https://data.worldbank.org/indicator/${source.indicatorCode}`,
        sourceUrl: `https://api.worldbank.org/v2/country/all/indicator/${source.indicatorCode}`,
        license: 'World Bank Open Data Terms',
        schemaVersion: SCHEMA_VERSION,
        title,
        summary,
        category: 'pregnancy-women-health-public-indicator',
        topic: source.topic,
        pregnancyUse: 'Use for population-level pregnancy and women-health context in MongoDB RAG answers. Not used as an individual patient diagnosis.',
        indicatorCode: source.indicatorCode,
        indicatorName,
        countryName,
        countryCode,
        countryId: row.country?.id || '',
        year,
        value,
        unit: source.unit,
        decimal: row.decimal,
        obsStatus: row.obs_status || '',
        keywords: uniqueKeywords([
            'pregnancy',
            'women health',
            'maternal health',
            source.topic,
            source.indicatorCode,
            indicatorName,
            countryName,
            String(year)
        ]),
        databaseOnly: true,
        localBackendFile: false,
        importedAt: new Date(),
        updatedAt: new Date()
    };
}

async function loadWorldBankIndicatorRecords(source, limit = 0) {
    const perPage = limit && limit < 20000 ? Math.max(1, limit) : 20000;
    let page = 1;
    let pages = 1;
    const records = [];

    do {
        const url = `https://api.worldbank.org/v2/country/all/indicator/${source.indicatorCode}?format=json&per_page=${perPage}&page=${page}`;
        const payload = await fetchJson(url);
        if (!Array.isArray(payload) || !Array.isArray(payload[1])) {
            throw new Error(`Unexpected World Bank response for ${source.indicatorCode}`);
        }
        pages = Number(payload[0]?.pages) || 1;
        for (const row of payload[1]) {
            const record = buildWorldBankRecord(source, row);
            if (record) records.push(record);
            if (limit && records.length >= limit) return records;
        }
        page += 1;
    } while (page <= pages);

    return records;
}

function getWhoIndicatorCode(row = {}) {
    return row.IndicatorCode || row.indicatorCode || row.Code || row.code || row.Id || row.id || '';
}

function getWhoIndicatorName(row = {}) {
    return row.IndicatorName || row.indicatorName || row.Title || row.title || row.Name || row.name || '';
}

function whoSourceDoc(row) {
    const indicatorCode = getWhoIndicatorCode(row);
    const title = getWhoIndicatorName(row) || indicatorCode;
    const topic = inferTopic(title);
    return sourceDatasetDoc({
        datasetId: `who-gho-${slug(indicatorCode || title)}`,
        indicatorCode,
        title: `WHO GHO: ${title}`,
        topic,
        sourceOrganization: 'World Health Organization',
        sourceUrl: `https://ghoapi.azureedge.net/api/${encodeURIComponent(indicatorCode)}`,
        landingPage: 'https://www.who.int/data/gho',
        license: 'WHO Global Health Observatory API terms',
        category: 'who-global-health-observatory',
        pregnancyUse: 'Use for WHO Global Health Observatory population-level pregnancy, maternal, neonatal, reproductive, and women-health context. Not an individual diagnosis.'
    });
}

async function loadWhoIndicatorSources(limit = 20) {
    const payload = await fetchJson('https://ghoapi.azureedge.net/api/Indicator');
    const rows = Array.isArray(payload?.value) ? payload.value : [];
    const selected = [];
    const seen = new Set();

    for (const row of rows) {
        const code = getWhoIndicatorCode(row);
        const title = getWhoIndicatorName(row);
        const searchable = `${code} ${title}`.toLowerCase();
        if (!code || !title) continue;
        if (!WHO_GHO_TERMS.some(term => searchable.includes(term))) continue;
        if (seen.has(code)) continue;
        seen.add(code);
        selected.push({ ...whoSourceDoc(row), indicatorCode: code, indicatorName: title });
        if (limit && selected.length >= limit) break;
    }

    return selected;
}

function firstDefined(row = {}, keys = []) {
    for (const key of keys) {
        if (row[key] !== undefined && row[key] !== null && row[key] !== '') return row[key];
    }
    return '';
}

function buildWhoRecord(source, row) {
    const numericValue = toNumber(firstDefined(row, ['NumericValue', 'numericValue', 'Low', 'High']));
    const displayValue = compactText(firstDefined(row, ['Value', 'value', 'DisplayValue', 'Comments']));
    if (numericValue === null && !displayValue) return null;

    const year = Number.parseInt(firstDefined(row, ['TimeDim', 'TimeDimensionValueCode', 'Year']), 10);
    const countryCode = compactText(firstDefined(row, ['SpatialDim', 'LocationCode', 'ParentLocationCode'])) || 'global';
    const countryName = compactText(firstDefined(row, ['SpatialDimType', 'Location', 'ParentLocation'])) || countryCode;
    const dimensions = [
        firstDefined(row, ['Dim1', 'Dim1ValueCode']),
        firstDefined(row, ['Dim2', 'Dim2ValueCode']),
        firstDefined(row, ['Dim3', 'Dim3ValueCode'])
    ].map(compactText).filter(Boolean);
    const dimensionLabel = dimensions.join(' / ');
    const valueText = numericValue !== null ? numericValue : displayValue;
    const yearLabel = Number.isFinite(year) ? year : 'latest available';
    const title = `${source.indicatorName}: ${countryName} ${yearLabel}`;
    const summaryParts = [
        `${source.indicatorName} for ${countryName} in ${yearLabel}: ${valueText}.`,
        dimensionLabel ? `Dimension: ${dimensionLabel}.` : ''
    ].filter(Boolean);

    return {
        importId: `who-gho:${source.indicatorCode}:${sha1(JSON.stringify(row)).slice(0, 24)}`,
        datasetId: source.datasetId,
        sourceSystem: SOURCE_SYSTEM,
        sourceOrganization: 'World Health Organization',
        source: 'https://www.who.int/data/gho',
        sourceUrl: source.sourceUrl,
        license: source.license,
        schemaVersion: SCHEMA_VERSION,
        title,
        summary: summaryParts.join(' '),
        category: 'who-global-health-observatory',
        topic: source.topic,
        pregnancyUse: source.pregnancyUse,
        indicatorCode: source.indicatorCode,
        indicatorName: source.indicatorName,
        countryName,
        countryCode,
        year: Number.isFinite(year) ? year : null,
        value: numericValue,
        valueText: displayValue || String(numericValue),
        unit: compactText(firstDefined(row, ['Unit', 'unit'])) || '',
        dimensions,
        keywords: uniqueKeywords([
            'WHO',
            'global health observatory',
            'pregnancy',
            'women health',
            'maternal health',
            source.topic,
            source.indicatorCode,
            source.indicatorName,
            countryName,
            String(yearLabel),
            ...dimensions
        ]),
        databaseOnly: true,
        localBackendFile: false,
        importedAt: new Date(),
        updatedAt: new Date()
    };
}

async function loadWhoIndicatorRecords(source, limit = 250) {
    const payload = await fetchJson(source.sourceUrl);
    const rows = Array.isArray(payload?.value) ? payload.value : [];
    const records = [];

    for (const row of rows) {
        const record = buildWhoRecord(source, row);
        if (record) records.push(record);
        if (limit && records.length >= limit) break;
    }

    return records;
}

async function bulkUpsert(collection, docs, { dryRun = false, chunkSize = 500, identityField = 'importId' } = {}) {
    if (!docs.length) return { matched: 0, modified: 0, upserted: 0, ready: 0 };
    if (dryRun) return { matched: 0, modified: 0, upserted: 0, ready: docs.length, dryRun: true };

    const totals = { matched: 0, modified: 0, upserted: 0, ready: docs.length };
    for (let index = 0; index < docs.length; index += chunkSize) {
        const chunk = docs.slice(index, index + chunkSize);
        const result = await collection.bulkWrite(chunk.map(doc => ({
            updateOne: {
                filter: { [identityField]: doc[identityField] },
                update: {
                    $set: { ...doc, updatedAt: new Date() },
                    $setOnInsert: { createdAt: new Date() }
                },
                upsert: true
            }
        })), { ordered: false });

        totals.matched += result.matchedCount || 0;
        totals.modified += result.modifiedCount || 0;
        totals.upserted += result.upsertedCount || 0;
    }
    return totals;
}

async function ensureIndexes(db) {
    const createIndexSafe = async (collectionName, keys, options = {}) => {
        try {
            await db.collection(collectionName).createIndex(keys, options);
        } catch (error) {
            if (/already exists|same name|IndexOptionsConflict|equivalent index/i.test(error.message)) return;
            throw error;
        }
    };

    await Promise.all([
        createIndexSafe('pregnancy_source_datasets', { datasetId: 1 }, { sparse: true }),
        createIndexSafe(HEALTH_COLLECTION, { importId: 1 }, { unique: true, sparse: true }),
        createIndexSafe(HEALTH_COLLECTION, { datasetId: 1, indicatorCode: 1, countryCode: 1, year: -1 }, { sparse: true }),
        createIndexSafe(HEALTH_COLLECTION, { sourceOrganization: 1, topic: 1, year: -1 }, { sparse: true }),
        createIndexSafe(HEALTH_COLLECTION, {
            title: 'text',
            summary: 'text',
            indicatorName: 'text',
            countryName: 'text',
            topic: 'text',
            pregnancyUse: 'text',
            keywords: 'text'
        }, { name: 'health_pregnancy_indicators_text_v1' })
    ]);
}

async function main() {
    const dryRun = hasArg('--dry-run');
    const verifyOnly = hasArg('--verify-only');
    const compactOnly = hasArg('--compact-only');
    const skipWorldBank = hasArg('--skip-worldbank');
    const skipWho = hasArg('--skip-who');
    const worldBankLimit = Number.parseInt(getArgValue('--worldbank-limit', '0'), 10) || 0;
    const whoIndicatorLimit = Number.parseInt(getArgValue('--who-indicator-limit', '20'), 10) || 20;
    const whoRecordLimit = Number.parseInt(getArgValue('--who-record-limit', '250'), 10) || 250;
    const selectedIndicator = getArgValue('--indicator', '').toUpperCase();
    const worldBankSources = selectedIndicator
        ? WORLD_BANK_HEALTH_INDICATORS.filter(item => item.indicatorCode === selectedIndicator)
        : WORLD_BANK_HEALTH_INDICATORS;

    if (selectedIndicator && !worldBankSources.length) {
        throw new Error(`Unsupported World Bank health indicator: ${selectedIndicator}`);
    }

    const { client, db, dbName } = await connectDB();
    const collection = db.collection(HEALTH_COLLECTION);

    if (compactOnly) {
        try {
            const result = await collection.updateMany(
                { sourceSystem: SOURCE_SYSTEM, raw: { $exists: true } },
                { $unset: { raw: '' }, $set: { compactedAt: new Date(), localBackendFile: false, databaseOnly: true } }
            );
            console.log(JSON.stringify({
                database: dbName,
                collection: HEALTH_COLLECTION,
                databaseOnly: true,
                localBackendFilesWritten: 0,
                matched: result.matchedCount || 0,
                modified: result.modifiedCount || 0
            }, null, 2));
        } finally {
            await client.close();
        }
        return;
    }

    if (verifyOnly) {
        try {
            const [total, sourceDatasets, bySource, byIndicator] = await Promise.all([
                collection.countDocuments({ sourceSystem: SOURCE_SYSTEM }),
                db.collection('pregnancy_source_datasets').countDocuments({ sourceSystem: SOURCE_SYSTEM }),
                collection.aggregate([
                    { $match: { sourceSystem: SOURCE_SYSTEM } },
                    { $group: { _id: '$sourceOrganization', records: { $sum: 1 } } },
                    { $sort: { records: -1 } }
                ]).toArray(),
                collection.aggregate([
                    { $match: { sourceSystem: SOURCE_SYSTEM } },
                    { $group: { _id: { indicatorCode: '$indicatorCode', sourceOrganization: '$sourceOrganization' }, records: { $sum: 1 } } },
                    { $sort: { records: -1 } },
                    { $limit: 60 }
                ]).toArray()
            ]);
            console.log(JSON.stringify({
                database: dbName,
                collection: HEALTH_COLLECTION,
                databaseOnly: true,
                localBackendFilesWritten: 0,
                sourceDatasets,
                total,
                bySource,
                byIndicator
            }, null, 2));
        } finally {
            await client.close();
        }
        return;
    }

    const summary = {
        database: dbName,
        collection: HEALTH_COLLECTION,
        databaseOnly: true,
        localBackendFilesWritten: 0,
        sourceDatasets: null,
        worldBank: [],
        whoGho: [],
        totalCollectionDocuments: 0
    };

    try {
        if (!dryRun) await ensureIndexes(db);

        const sourceDocs = [];
        if (!skipWorldBank) {
            sourceDocs.push(...worldBankSources.map(worldBankSourceDoc));
        }

        let whoSources = [];
        if (!skipWho) {
            console.log('Downloading WHO Global Health Observatory indicator index...');
            whoSources = await loadWhoIndicatorSources(whoIndicatorLimit);
            sourceDocs.push(...whoSources);
        }

        summary.sourceDatasets = await bulkUpsert(
            db.collection('pregnancy_source_datasets'),
            sourceDocs,
            { dryRun, identityField: 'datasetId' }
        );

        if (!skipWorldBank) {
            for (const source of worldBankSources) {
                console.log(`Downloading World Bank ${source.indicatorCode}...`);
                try {
                    const records = await loadWorldBankIndicatorRecords(source, worldBankLimit);
                    summary.worldBank.push({
                        indicatorCode: source.indicatorCode,
                        title: source.title,
                        records: records.length,
                        result: await bulkUpsert(collection, records, { dryRun })
                    });
                } catch (error) {
                    summary.worldBank.push({
                        indicatorCode: source.indicatorCode,
                        title: source.title,
                        records: 0,
                        error: error.message
                    });
                }
            }
        }

        if (!skipWho) {
            for (const source of whoSources) {
                console.log(`Downloading WHO GHO ${source.indicatorCode}...`);
                try {
                    const records = await loadWhoIndicatorRecords(source, whoRecordLimit);
                    summary.whoGho.push({
                        indicatorCode: source.indicatorCode,
                        title: source.indicatorName,
                        records: records.length,
                        result: await bulkUpsert(collection, records, { dryRun })
                    });
                } catch (error) {
                    summary.whoGho.push({
                        indicatorCode: source.indicatorCode,
                        title: source.indicatorName,
                        records: 0,
                        error: error.message
                    });
                }
            }
        }

        summary.totalCollectionDocuments = dryRun
            ? 0
            : await collection.countDocuments({ sourceSystem: SOURCE_SYSTEM });

        console.log(JSON.stringify(summary, null, 2));
    } finally {
        await client.close();
    }
}

main().catch(error => {
    console.error('Failed to import pregnancy and women-health datasets:', error.message);
    process.exitCode = 1;
});
