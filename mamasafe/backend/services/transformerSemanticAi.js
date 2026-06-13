const path = require('path');
const fs = require('fs');

const DEFAULT_TRANSFORMER_MODEL = 'Xenova/all-MiniLM-L6-v2';
const CACHE_DIR = path.join(__dirname, '..', 'models', 'transformers-cache');
const LOCAL_TOKENIZER_PATH = path.join(CACHE_DIR, 'Xenova', 'all-MiniLM-L6-v2', 'tokenizer.json');
const LOCAL_TOKENIZER_CONFIG_PATH = path.join(CACHE_DIR, 'Xenova', 'all-MiniLM-L6-v2', 'tokenizer_config.json');

let extractorPromise = null;
let lastLoadError = null;
let tokenizerMetadataCache = null;

function isTransformerEnabled() {
    return String(process.env.TRANSFORMER_AI_ENABLED || 'true').toLowerCase() !== 'false';
}

function compactText(value = '', max = 800) {
    return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function packageAvailable() {
    return resolveTransformerPackage().available;
}

function resolveTransformerPackage() {
    try {
        require.resolve('@huggingface/transformers');
        return { available: true, packageName: '@huggingface/transformers' };
    } catch {
        try {
            require.resolve('@xenova/transformers');
            return { available: true, packageName: '@xenova/transformers' };
        } catch {
            return { available: false, packageName: '@huggingface/transformers' };
        }
    }
}

function readJsonFile(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
        return null;
    }
}

function getTokenizerMetadata() {
    if (tokenizerMetadataCache) return tokenizerMetadataCache;

    const tokenizer = readJsonFile(LOCAL_TOKENIZER_PATH);
    const config = readJsonFile(LOCAL_TOKENIZER_CONFIG_PATH);
    tokenizerMetadataCache = {
        tokenizerFile: LOCAL_TOKENIZER_PATH,
        tokenizerConfigFile: LOCAL_TOKENIZER_CONFIG_PATH,
        exists: Boolean(tokenizer),
        tokenizerClass: config?.tokenizer_class || '',
        modelType: tokenizer?.model?.type || '',
        vocabSize: tokenizer?.model?.vocab ? Object.keys(tokenizer.model.vocab).length : null,
        addedTokens: Array.isArray(tokenizer?.added_tokens) ? tokenizer.added_tokens.length : null,
        maxLength: config?.model_max_length || tokenizer?.truncation?.max_length || null,
        normalizer: tokenizer?.normalizer?.type || '',
        preTokenizer: tokenizer?.pre_tokenizer?.type || '',
        postProcessor: tokenizer?.post_processor?.type || '',
        specialTokens: {
            cls: config?.cls_token || '',
            sep: config?.sep_token || '',
            pad: config?.pad_token || '',
            unk: config?.unk_token || '',
            mask: config?.mask_token || ''
        }
    };
    return tokenizerMetadataCache;
}

async function loadExtractor() {
    if (!isTransformerEnabled()) {
        throw new Error('Transformer AI is disabled. Set TRANSFORMER_AI_ENABLED=true to enable semantic reranking.');
    }

    if (!extractorPromise) {
        extractorPromise = (async () => {
            try {
                const transformerPackage = resolveTransformerPackage();
                const transformers = await import(transformerPackage.packageName);
                if (transformers.env) {
                    transformers.env.cacheDir = process.env.TRANSFORMERS_CACHE || CACHE_DIR;
                    transformers.env.allowLocalModels = true;
                    transformers.env.allowRemoteModels = process.env.TRANSFORMER_ALLOW_REMOTE_MODELS !== 'false';
                }
                const modelName = process.env.TRANSFORMER_MODEL || DEFAULT_TRANSFORMER_MODEL;
                return transformers.pipeline('feature-extraction', modelName);
            } catch (error) {
                lastLoadError = error;
                extractorPromise = null;
                throw error;
            }
        })();
    }

    return extractorPromise;
}

function tensorToVector(output) {
    if (!output) return [];
    if (Array.isArray(output)) return output.flat(Infinity).map(Number).filter(Number.isFinite);
    if (output.data) return Array.from(output.data).map(Number).filter(Number.isFinite);
    return [];
}

function cosineVector(a = [], b = []) {
    const length = Math.min(a.length, b.length);
    if (!length) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let index = 0; index < length; index += 1) {
        dot += a[index] * b[index];
        normA += a[index] * a[index];
        normB += b[index] * b[index];
    }
    return dot / ((Math.sqrt(normA) || 1) * (Math.sqrt(normB) || 1));
}

async function embed(text = '') {
    const extractor = await loadExtractor();
    const output = await extractor(compactText(text), { pooling: 'mean', normalize: true });
    return tensorToVector(output);
}

async function embedText(text = '') {
    return embed(text);
}

async function rerankWithTransformer({ query = '', matches = [], limit = 8 } = {}) {
    if (!isTransformerEnabled() || !matches.length) {
        return {
            matches,
            transformer: {
                enabled: isTransformerEnabled(),
                applied: false,
                reason: isTransformerEnabled() ? 'no matches to rerank' : 'disabled',
                tokenizer: getTokenizerMetadata()
            }
        };
    }

    if (!packageAvailable()) {
        return {
            matches,
            transformer: {
                enabled: true,
                applied: false,
                reason: '@huggingface/transformers is not installed',
                tokenizer: getTokenizerMetadata()
            }
        };
    }

    try {
        const topMatches = matches.slice(0, Math.max(Number(limit) || 8, 12));
        const queryVector = await embed(query);
        const maxLexical = Math.max(...topMatches.map(match => Number(match.score || 0)), 1);
        const reranked = [];

        for (const match of topMatches) {
            const text = [match.title, match.text, match.category, match.topic].filter(Boolean).join(' ');
            const docVector = await embed(text);
            const semanticScore = cosineVector(queryVector, docVector);
            const lexicalScore = Number(match.score || 0) / maxLexical;
            reranked.push({
                ...match,
                lexicalScore: Number(lexicalScore.toFixed(4)),
                transformerScore: Number(semanticScore.toFixed(4)),
                score: Number(((lexicalScore * 0.65) + (semanticScore * 0.35)).toFixed(4))
            });
        }

        const transformerPackage = resolveTransformerPackage();
        return {
            matches: reranked.sort((a, b) => b.score - a.score),
            transformer: {
                enabled: true,
                applied: true,
                model: process.env.TRANSFORMER_MODEL || DEFAULT_TRANSFORMER_MODEL,
                package: transformerPackage.packageName,
                tokenizer: getTokenizerMetadata(),
                reranked: reranked.length
            }
        };
    } catch (error) {
        lastLoadError = error;
        return {
            matches,
            transformer: {
                enabled: true,
                applied: false,
                reason: error.message,
                tokenizer: getTokenizerMetadata()
            }
        };
    }
}

function getTransformerAiStatus() {
    const transformerPackage = resolveTransformerPackage();
    return {
        enabled: isTransformerEnabled(),
        packageAvailable: transformerPackage.available,
        package: transformerPackage.packageName,
        model: process.env.TRANSFORMER_MODEL || DEFAULT_TRANSFORMER_MODEL,
        cacheDir: process.env.TRANSFORMERS_CACHE || CACHE_DIR,
        tokenizer: getTokenizerMetadata(),
        lastError: lastLoadError ? lastLoadError.message : null
    };
}

module.exports = {
    getTransformerAiStatus,
    getTokenizerMetadata,
    rerankWithTransformer,
    embedText,
    cosineVector
};
