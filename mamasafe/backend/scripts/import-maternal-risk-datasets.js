require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), override: true });

const crypto = require('crypto');
const zlib = require('zlib');
const { connectDB } = require('../config/database');

const SOURCE_SYSTEM = 'mamasafe-remote-maternal-risk-import';
const SCHEMA_VERSION = 1;

const UCI_MATERNAL_RISK = {
    datasetId: 'uci-maternal-health-risk',
    title: 'UCI Maternal Health Risk Data Set',
    sourceOrganization: 'UCI Machine Learning Repository',
    sourceUrl: 'https://archive.ics.uci.edu/static/public/863/maternal+health+risk.zip',
    landingPage: 'https://archive.ics.uci.edu/dataset/863/maternal+health+risk',
    license: 'CC BY 4.0',
    mongodbCollection: 'maternal_health_risk_records',
    category: 'maternal-risk-vitals',
    pregnancyUse: 'Use as structured maternal vitals risk training rows for age, blood pressure, blood sugar, body temperature, heart rate, and low/mid/high risk level.'
};

const WORLD_BANK_INDICATORS = [
    {
        datasetId: 'worldbank-maternal-mortality-ratio-modeled',
        indicatorCode: 'SH.STA.MMRT',
        title: 'Maternal mortality ratio, modeled estimate',
        unit: 'per 100,000 live births'
    },
    {
        datasetId: 'worldbank-maternal-mortality-ratio-national',
        indicatorCode: 'SH.STA.MMRT.NE',
        title: 'Maternal mortality ratio, national estimate',
        unit: 'per 100,000 live births'
    },
    {
        datasetId: 'worldbank-lifetime-risk-maternal-death',
        indicatorCode: 'SH.MMR.RISK',
        title: 'Lifetime risk of maternal death',
        unit: 'percent'
    },
    {
        datasetId: 'worldbank-number-maternal-deaths',
        indicatorCode: 'SH.MMR.DTHS',
        title: 'Number of maternal deaths',
        unit: 'count'
    }
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

function normalizeKey(value = '') {
    return String(value || '')
        .trim()
        .replace(/^\uFEFF/, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '');
}

function toNumber(value) {
    const numeric = Number(String(value ?? '').trim());
    return Number.isFinite(numeric) ? numeric : null;
}

function riskClassForLevel(value = '') {
    const normalized = String(value || '').toLowerCase();
    if (normalized.includes('high')) return 'high';
    if (normalized.includes('mid') || normalized.includes('medium')) return 'mid';
    return 'low';
}

function normalizeRiskLevel(value = '') {
    const riskClass = riskClassForLevel(value);
    return `${riskClass} risk`;
}

function splitCsvLine(line = '') {
    const cells = [];
    let cell = '';
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
        const char = line[index];
        const next = line[index + 1];
        if (char === '"' && inQuotes && next === '"') {
            cell += '"';
            index += 1;
            continue;
        }
        if (char === '"') {
            inQuotes = !inQuotes;
            continue;
        }
        if (char === ',' && !inQuotes) {
            cells.push(cell.trim());
            cell = '';
            continue;
        }
        cell += char;
    }

    cells.push(cell.trim());
    return cells;
}

function parseCsv(text = '') {
    const lines = String(text || '')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .split('\n')
        .filter(line => line.trim());
    if (!lines.length) return [];

    const headers = splitCsvLine(lines[0]);
    return lines.slice(1).map(line => {
        const cells = splitCsvLine(line);
        const row = {};
        headers.forEach((header, index) => {
            row[header] = cells[index] ?? '';
        });
        return row;
    });
}

function readZipEntry(buffer, wantedPattern) {
    for (let eocdOffset = buffer.length - 22; eocdOffset >= 0; eocdOffset -= 1) {
        if (buffer.readUInt32LE(eocdOffset) !== 0x06054b50) continue;
        const centralDirectorySize = buffer.readUInt32LE(eocdOffset + 12);
        const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);
        let pointer = centralDirectoryOffset;
        const end = centralDirectoryOffset + centralDirectorySize;

        while (pointer < end && buffer.readUInt32LE(pointer) === 0x02014b50) {
            const method = buffer.readUInt16LE(pointer + 10);
            const compressedSize = buffer.readUInt32LE(pointer + 20);
            const fileNameLength = buffer.readUInt16LE(pointer + 28);
            const extraLength = buffer.readUInt16LE(pointer + 30);
            const commentLength = buffer.readUInt16LE(pointer + 32);
            const localHeaderOffset = buffer.readUInt32LE(pointer + 42);
            const fileNameStart = pointer + 46;
            const fileNameEnd = fileNameStart + fileNameLength;
            const fileName = buffer.slice(fileNameStart, fileNameEnd).toString('utf8');

            if (wantedPattern.test(fileName)) {
                const localNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
                const localExtraLength = buffer.readUInt16LE(localHeaderOffset + 28);
                const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
                const compressed = buffer.slice(dataStart, dataStart + compressedSize);
                if (method === 0) return compressed.toString('utf8');
                if (method === 8) return zlib.inflateRawSync(compressed).toString('utf8');
                throw new Error(`Unsupported ZIP compression method ${method} for ${fileName}.`);
            }

            pointer = fileNameEnd + extraLength + commentLength;
        }
        break;
    }

    let offset = 0;
    while (offset < buffer.length - 30) {
        if (buffer.readUInt32LE(offset) !== 0x04034b50) {
            offset += 1;
            continue;
        }

        const flags = buffer.readUInt16LE(offset + 6);
        const method = buffer.readUInt16LE(offset + 8);
        const compressedSize = buffer.readUInt32LE(offset + 18);
        const fileNameLength = buffer.readUInt16LE(offset + 26);
        const extraLength = buffer.readUInt16LE(offset + 28);
        const fileNameStart = offset + 30;
        const fileNameEnd = fileNameStart + fileNameLength;
        const fileName = buffer.slice(fileNameStart, fileNameEnd).toString('utf8');
        const dataStart = fileNameEnd + extraLength;
        const dataEnd = dataStart + compressedSize;

        if (wantedPattern.test(fileName)) {
            if ((flags & 0x08) || !compressedSize) {
                throw new Error(`Unsupported ZIP data descriptor for ${fileName}.`);
            }
            const compressed = buffer.slice(dataStart, dataEnd);
            if (method === 0) return compressed.toString('utf8');
            if (method === 8) return zlib.inflateRawSync(compressed).toString('utf8');
            throw new Error(`Unsupported ZIP compression method ${method} for ${fileName}.`);
        }

        offset = dataEnd;
    }

    throw new Error('No CSV file was found inside the downloaded UCI ZIP archive.');
}

async function fetchBuffer(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Download failed (${response.status}) for ${url}`);
    }
    return Buffer.from(await response.arrayBuffer());
}

async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Download failed (${response.status}) for ${url}`);
    }
    return response.json();
}

function sourceDatasetDoc(source) {
    const now = new Date();
    return {
        datasetId: source.datasetId,
        title: source.title,
        sourceOrganization: source.sourceOrganization || 'World Bank',
        sourceUrl: source.sourceUrl || `https://api.worldbank.org/v2/country/all/indicator/${source.indicatorCode}`,
        landingPage: source.landingPage || `https://data.worldbank.org/indicator/${source.indicatorCode}`,
        license: source.license || 'World Bank Open Data Terms',
        category: source.category || 'maternal-risk-public-health-indicator',
        pregnancyUse: source.pregnancyUse || 'Use for country/year maternal mortality risk context in MongoDB RAG answers. Not used as an individual diagnosis.',
        mongodbCollection: source.mongodbCollection || 'maternal_mortality_indicators',
        sourceSystem: SOURCE_SYSTEM,
        databaseOnly: true,
        localBackendFile: false,
        schemaVersion: SCHEMA_VERSION,
        keywords: [
            'maternal risk',
            'maternal mortality',
            'pregnancy risk',
            source.indicatorCode || '',
            source.datasetId
        ].filter(Boolean),
        importedAt: now,
        updatedAt: now
    };
}

function buildUciRecord(row, index) {
    const normalized = Object.entries(row).reduce((acc, [key, value]) => {
        acc[normalizeKey(key)] = value;
        return acc;
    }, {});
    const age = toNumber(normalized.age);
    const systolicBP = toNumber(normalized.systolicbp);
    const diastolicBP = toNumber(normalized.diastolicbp);
    const bloodSugar = toNumber(normalized.bs);
    const bodyTemp = toNumber(normalized.bodytemp);
    const heartRate = toNumber(normalized.heartrate);
    const riskLevel = normalizeRiskLevel(normalized.risklevel);
    const riskClass = riskClassForLevel(riskLevel);
    const rowHash = sha1(JSON.stringify(row));
    const title = `UCI maternal risk row ${index + 1}: ${riskLevel}`;
    const summary = [
        `Age ${age ?? 'unknown'}`,
        `BP ${systolicBP ?? '--'}/${diastolicBP ?? '--'}`,
        `Blood sugar ${bloodSugar ?? 'unknown'}`,
        `Body temperature ${bodyTemp ?? 'unknown'}`,
        `Heart rate ${heartRate ?? 'unknown'}`,
        `Risk level ${riskLevel}`
    ].join('; ');

    return {
        importId: `${UCI_MATERNAL_RISK.datasetId}:${rowHash}`,
        datasetId: UCI_MATERNAL_RISK.datasetId,
        sourceSystem: SOURCE_SYSTEM,
        sourceOrganization: UCI_MATERNAL_RISK.sourceOrganization,
        source: UCI_MATERNAL_RISK.landingPage,
        sourceUrl: UCI_MATERNAL_RISK.sourceUrl,
        license: UCI_MATERNAL_RISK.license,
        schemaVersion: SCHEMA_VERSION,
        title,
        summary,
        category: 'maternal-risk-vitals',
        pregnancyUse: UCI_MATERNAL_RISK.pregnancyUse,
        age,
        systolicBP,
        diastolicBP,
        bloodSugar,
        bodyTemp,
        heartRate,
        bmi: null,
        previousComplications: 0,
        preexistingDiabetes: bloodSugar !== null && bloodSugar >= 11 ? 1 : 0,
        gestationalDiabetes: bloodSugar !== null && bloodSugar >= 7.8 ? 1 : 0,
        mentalHealth: 0,
        riskLevel,
        riskClass,
        keywords: [
            'maternal health risk',
            'blood pressure',
            'blood sugar',
            'body temperature',
            'heart rate',
            riskLevel
        ],
        sourceRow: row,
        databaseOnly: true,
        localBackendFile: false,
        importedAt: new Date(),
        updatedAt: new Date()
    };
}

async function loadUciMaternalRiskRecords() {
    const zipBuffer = await fetchBuffer(UCI_MATERNAL_RISK.sourceUrl);
    const csvText = readZipEntry(zipBuffer, /\.csv$/i);
    return parseCsv(csvText).map(buildUciRecord);
}

function buildWorldBankRecord(source, row) {
    const value = toNumber(row.value);
    if (value === null) return null;
    const year = Number.parseInt(row.date, 10);
    const countryName = row.country?.value || '';
    const countryCode = row.countryiso3code || row.country?.id || '';
    const importId = `${source.datasetId}:${countryCode || row.country?.id || 'unknown'}:${year}`;
    const title = `${source.title}: ${countryName || countryCode} ${year}`;

    return {
        importId,
        datasetId: source.datasetId,
        sourceSystem: SOURCE_SYSTEM,
        sourceOrganization: 'World Bank',
        source: `https://data.worldbank.org/indicator/${source.indicatorCode}`,
        sourceUrl: `https://api.worldbank.org/v2/country/all/indicator/${source.indicatorCode}`,
        license: 'World Bank Open Data Terms',
        schemaVersion: SCHEMA_VERSION,
        title,
        summary: `${source.title} for ${countryName || countryCode} in ${year}: ${value} ${source.unit}.`,
        category: 'maternal-risk-public-health-indicator',
        pregnancyUse: 'Use for population-level maternal mortality context by country and year. Not an individual patient diagnosis.',
        indicatorCode: source.indicatorCode,
        indicatorName: row.indicator?.value || source.title,
        countryName,
        countryCode,
        countryId: row.country?.id || '',
        year,
        value,
        unit: source.unit,
        decimal: row.decimal,
        obsStatus: row.obs_status || '',
        keywords: [
            'maternal mortality',
            'maternal risk',
            'population health',
            source.indicatorCode,
            countryName,
            String(year)
        ].filter(Boolean),
        raw: row,
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

async function bulkUpsert(collection, docs, { dryRun = false, chunkSize = 500, identityField = 'importId' } = {}) {
    if (!docs.length) return { inserted: 0, matched: 0, modified: 0, upserted: 0 };
    if (dryRun) return { inserted: 0, matched: 0, modified: 0, upserted: 0, dryRun: true, ready: docs.length };

    const totals = { inserted: 0, matched: 0, modified: 0, upserted: 0 };
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
        totals.inserted += result.insertedCount || 0;
    }
    return totals;
}

async function ensureIndexes(db) {
    const createIndexSafe = async (collectionName, keys, options = {}) => {
        try {
            await db.collection(collectionName).createIndex(keys, options);
        } catch (error) {
            if (/already exists|same name|IndexOptionsConflict/i.test(error.message)) return;
            throw error;
        }
    };

    await Promise.all([
        createIndexSafe('pregnancy_source_datasets', { datasetId: 1 }, { sparse: true }),
        createIndexSafe('maternal_health_risk_records', { importId: 1 }, { unique: true, sparse: true }),
        createIndexSafe('maternal_health_risk_records', { datasetId: 1, riskLevel: 1 }),
        createIndexSafe('maternal_health_risk_records', { riskLevel: 1, systolicBP: 1, diastolicBP: 1, bloodSugar: 1 }),
        createIndexSafe('maternal_mortality_indicators', { importId: 1 }, { unique: true, sparse: true }),
        createIndexSafe('maternal_mortality_indicators', { indicatorCode: 1, countryCode: 1, year: -1 }),
        createIndexSafe('maternal_mortality_indicators', {
            title: 'text',
            summary: 'text',
            indicatorName: 'text',
            countryName: 'text',
            keywords: 'text'
        }, { name: 'maternal_mortality_indicators_text_v1' })
    ]);
}

async function importSourceDatasets(db, sources, dryRun) {
    const docs = sources.map(sourceDatasetDoc);
    return bulkUpsert(db.collection('pregnancy_source_datasets'), docs, { dryRun, identityField: 'datasetId' });
}

async function main() {
    const dryRun = hasArg('--dry-run');
    const skipUci = hasArg('--skip-uci');
    const skipWorldBank = hasArg('--skip-worldbank');
    const worldBankLimit = Number.parseInt(getArgValue('--worldbank-limit', '0'), 10) || 0;
    const selectedIndicator = getArgValue('--indicator', '').toUpperCase();
    const indicators = selectedIndicator
        ? WORLD_BANK_INDICATORS.filter(item => item.indicatorCode === selectedIndicator)
        : WORLD_BANK_INDICATORS;

    if (selectedIndicator && !indicators.length) {
        throw new Error(`Unsupported World Bank indicator: ${selectedIndicator}`);
    }

    const { client, db, dbName } = await connectDB();
    const summary = {
        database: dbName,
        databaseOnly: true,
        localBackendFilesWritten: 0,
        sourceDatasets: null,
        uciMaternalRisk: null,
        worldBank: []
    };

    try {
        if (!dryRun) await ensureIndexes(db);
        const sourceDocs = [
            ...(skipUci ? [] : [UCI_MATERNAL_RISK]),
            ...(skipWorldBank ? [] : indicators)
        ];
        summary.sourceDatasets = await importSourceDatasets(db, sourceDocs, dryRun);

        if (!skipUci) {
            console.log(`Downloading ${UCI_MATERNAL_RISK.title}...`);
            const records = await loadUciMaternalRiskRecords();
            summary.uciMaternalRisk = {
                records: records.length,
                result: await bulkUpsert(db.collection('maternal_health_risk_records'), records, { dryRun })
            };
        }

        if (!skipWorldBank) {
            for (const source of indicators) {
                console.log(`Downloading World Bank ${source.indicatorCode}...`);
                try {
                    const records = await loadWorldBankIndicatorRecords(source, worldBankLimit);
                    summary.worldBank.push({
                        indicatorCode: source.indicatorCode,
                        records: records.length,
                        result: await bulkUpsert(db.collection('maternal_mortality_indicators'), records, { dryRun })
                    });
                } catch (error) {
                    summary.worldBank.push({
                        indicatorCode: source.indicatorCode,
                        records: 0,
                        error: error.message
                    });
                }
            }
        }

        console.log(JSON.stringify(summary, null, 2));
    } finally {
        await client.close();
    }
}

main().catch(error => {
    console.error('Failed to import maternal risk datasets:', error.message);
    process.exitCode = 1;
});
