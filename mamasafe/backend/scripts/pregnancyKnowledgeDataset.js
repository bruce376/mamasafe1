const crypto = require('crypto');
const fs = require('fs/promises');

const DEFAULT_DATASET_PATH = '';
const KNOWLEDGE_SOURCE_SYSTEM = 'mamasafe-pregnancy-knowledge-json';

function compactText(value = '', max = 2400) {
    return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function toList(value) {
    if (Array.isArray(value)) return value.map(item => compactText(item, 300)).filter(Boolean);
    if (value === undefined || value === null || value === '') return [];
    return [compactText(value, 300)];
}

function hashId(...parts) {
    return crypto
        .createHash('sha1')
        .update(parts.map(part => String(part ?? '').trim()).join(':'))
        .digest('hex')
        .slice(0, 18);
}

function trimesterLabel(value) {
    const trimester = Number(value);
    if (trimester === 1) return 'First';
    if (trimester === 2) return 'Second';
    if (trimester === 3) return 'Third';
    return 'Any';
}

function collectKeywords(...values) {
    return [...new Set(values
        .flatMap(value => Array.isArray(value) ? value : [value])
        .map(value => compactText(value, 80).toLowerCase())
        .filter(Boolean))]
        .slice(0, 40);
}

function buildDoc(collection, raw = {}, overrides = {}) {
    const title = compactText(overrides.title || raw.title || raw.name || raw.sign || raw.food || raw.question || `${collection} record`, 180);
    const category = overrides.category || raw.category || collection;
    const trimester = overrides.trimester || trimesterLabel(raw.trimester);
    const content = compactText(overrides.content || raw.content || raw.description || raw.answer || '', 3000);
    const keywords = collectKeywords(overrides.keywords, raw.keywords, raw.tags, raw.aliases, title, category);
    const source = raw.source || overrides.source || '';
    const knowledgeId = hashId(collection, raw.week || raw.name || raw.sign || raw.food || raw.question || title, content);

    return {
        knowledgeId,
        title,
        category,
        trimester,
        content,
        keywords,
        source,
        sourceCollection: collection,
        sourceSystem: KNOWLEDGE_SOURCE_SYSTEM,
        metadata: {
            sourceCollection: collection,
            week: raw.week || null,
            severity: raw.severity || '',
            originalCategory: raw.category || '',
            normal: raw.normal ?? null
        }
    };
}

function flattenPregnancyDataset(dataset = {}) {
    const docs = [];

    for (const item of dataset.pregnancy_weeks || []) {
        docs.push(buildDoc('pregnancy_weeks', item, {
            title: item.title || `Pregnancy week ${item.week}`,
            category: 'Pregnancy Stages',
            trimester: trimesterLabel(item.trimester),
            content: [
                item.description,
                item.babyDevelopment ? `Baby development: ${item.babyDevelopment}` : '',
                toList(item.motherChanges).length ? `Mother changes: ${toList(item.motherChanges).join('; ')}` : '',
                toList(item.symptomsCommon).length ? `Common symptoms: ${toList(item.symptomsCommon).join('; ')}` : '',
                toList(item.tips).length ? `Tips: ${toList(item.tips).join('; ')}` : '',
                toList(item.dangerAlerts).length ? `Danger alerts: ${toList(item.dangerAlerts).join('; ')}` : ''
            ].filter(Boolean).join(' ')
        }));
    }

    for (const item of dataset.symptoms || []) {
        docs.push(buildDoc('symptoms', item, {
            title: item.name || item.title,
            category: 'Symptoms',
            trimester: 'Any',
            content: [
                item.description,
                toList(item.selfCareTips).length ? `Self care: ${toList(item.selfCareTips).join('; ')}` : '',
                toList(item.warningSigns).length ? `Warning signs: ${toList(item.warningSigns).join('; ')}` : '',
                item.whenToSeeDoctor ? `When to seek care: ${item.whenToSeeDoctor}` : ''
            ].filter(Boolean).join(' ')
        }));
    }

    for (const item of dataset.danger_signs || []) {
        docs.push(buildDoc('danger_signs', item, {
            title: item.sign || item.title,
            category: 'Danger Signs',
            trimester: 'Any',
            content: [
                item.description,
                item.action ? `Action: ${item.action}` : '',
                item.severity ? `Severity: ${item.severity}` : ''
            ].filter(Boolean).join(' ')
        }));
    }

    for (const item of dataset.nutrition || []) {
        docs.push(buildDoc('nutrition', item, {
            title: item.food || item.title,
            category: 'Nutrition',
            trimester: 'Any',
            content: [
                toList(item.benefits).length ? `Benefits: ${toList(item.benefits).join('; ')}` : item.description,
                item.recommended !== undefined ? `Recommended during pregnancy: ${item.recommended ? 'yes' : 'no'}` : '',
                item.avoidDuringPregnancy !== undefined ? `Avoid during pregnancy: ${item.avoidDuringPregnancy ? 'yes' : 'no'}` : ''
            ].filter(Boolean).join(' ')
        }));
    }

    for (const item of dataset.articles || []) {
        docs.push(buildDoc('articles', item, {
            category: item.category || 'Pregnancy Education',
            trimester: 'Any',
            content: item.content || item.description || ''
        }));
    }

    for (const item of dataset.faqs || []) {
        docs.push(buildDoc('faqs', item, {
            title: item.question,
            category: 'Frequently Asked Questions',
            trimester: 'Any',
            content: [
                item.question ? `Question: ${item.question}` : '',
                item.answer ? `Answer: ${item.answer}` : ''
            ].filter(Boolean).join(' ')
        }));
    }

    return docs.filter(doc => doc.title && doc.content);
}

async function loadPregnancyKnowledgeDataset(filePath = DEFAULT_DATASET_PATH) {
    if (!filePath) {
        throw new Error('No local source file is configured. Store pregnancy knowledge in MongoDB, or pass an explicit external --source file for a one-time import.');
    }

    const raw = await fs.readFile(filePath, 'utf8');
    return flattenPregnancyDataset(JSON.parse(raw));
}

module.exports = {
    DEFAULT_DATASET_PATH,
    KNOWLEDGE_SOURCE_SYSTEM,
    compactText,
    loadPregnancyKnowledgeDataset
};
