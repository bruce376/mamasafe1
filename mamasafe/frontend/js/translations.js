// Cache to store translations we've already fetched
let translationCache = JSON.parse(localStorage.getItem('mamasafe_translations') || '{}');

function getAllUITextKeys() {
    // Translate every element that declares data-i18n or data-i18n-placeholder.
    // We use the attribute value itself as the lookup key.
    const keys = new Set();

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key) keys.add(key);

        // Optional: support explicit fallback keys too.
        const fallback = el.getAttribute('data-i18n-fallback');
        if (fallback) keys.add(fallback);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (key) keys.add(key);
    });

    return Array.from(keys);
}


function getBackendOrigins() {
    // Prefer app-wide backend base if available.
    // api-service/config define these; fall back to current origin.
    const base = window.MAMASAFE_API_BASE ? String(window.MAMASAFE_API_BASE) : '';
    const originFromBase = base ? base.replace(/\/api\/?$/, '').replace(/\/$/, '') : '';
    const fallback = window.location.origin;
    return [originFromBase || fallback].filter(Boolean);
}


async function fetchWithFallback(urls, options) {
    let lastError;
    for (const url of urls) {
        try {
            const response = await fetch(url, options);
            if (response.ok) {
                return response;
            }
            lastError = new Error(`HTTP ${response.status} for ${url}`);
        } catch (error) {
            lastError = error;
        }
    }
    throw lastError || new Error('All attempts failed');
}

async function fetchTranslations(targetLang) {
    // Check if we already have translations in cache
    if (translationCache[targetLang]) {
        return translationCache[targetLang];
    }

    const allUITexts = getAllUITextKeys();

    // English is a no-op
    if (targetLang === 'en') {
        const englishTranslations = {};
        allUITexts.forEach(text => (englishTranslations[text] = text));
        translationCache.en = englishTranslations;
        localStorage.setItem('mamasafe_translations', JSON.stringify(translationCache));
        return englishTranslations;
    }

    // If backend translation endpoint is missing/returns 404, fall back to LLM translation using the existing chatbot pipeline.
    // (We do NOT hard-fail UI translations.)
    try {
        const apiUrls = getBackendOrigins().map(origin => `${origin}/api/translate-ui`);
        const response = await fetchWithFallback(apiUrls, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texts: allUITexts, language: targetLang })
        });
        const data = await response.json();

        if (data?.success && data.translations) {
            translationCache[targetLang] = data.translations;
            localStorage.setItem('mamasafe_translations', JSON.stringify(translationCache));
            return data.translations;
        }

        throw new Error(data?.error || 'translate-ui returned invalid payload');
    } catch (error) {
        console.warn('Error fetching translations from /api/translate-ui, falling back to Llama translation:', error?.message || error);

        // Fallback 1: call the general AI endpoint with a strict JSON translation response.
        try {
            const getMamasafeBackendOrigin = () => getBackendOrigins()[0];
            const base = getMamasafeBackendOrigin();
            const prompt = `You are a translation engine. Translate the following UI strings into ${targetLang}. Return ONLY valid JSON with keys as the original English strings and values as the translated strings. Do not add any extra keys.`;

            const payload = {
                message: prompt,
                question: prompt,
                // For the unified AI endpoints, keep context minimal to reduce drift.
                context: { targetLang },
                texts: allUITexts,
                language: targetLang,
                // keep week/symptoms empty to avoid pregnancy-specific drift
                week: '',
                pregnancyWeek: '',
                symptoms: '',
                chatHistory: [],
                // hint to the backend that this is UI translation
                translationMode: true
            };

            // Try pipeline endpoints in order.
            const endpoints = [`${base}/api/ai/ask`, `${base}/api/chat`, `${base}/api/mamasafe-chat`];
            let lastErr;
            for (const endpoint of endpoints) {
                try {
                    const r = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    if (!r.ok) throw new Error(`HTTP ${r.status} for ${endpoint}`);
                    const j = await r.json();
                    const raw = j?.reply || j?.answer || j?.response || j?.result || j;

                    // Extract JSON mapping from LLM output (supports code-fences and surrounding text).
                    const tryParseJsonFromString = (text) => {
                        if (!text || typeof text !== 'string') return null;
                        const trimmed = text.trim();

                        // 1) Direct JSON
                        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
                            return JSON.parse(trimmed);
                        }

                        // 2) ```json ... ``` blocks
                        const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
                        if (fence?.[1]) {
                            const candidate = fence[1].trim();
                            if (candidate.startsWith('{')) return JSON.parse(candidate);
                        }

                        // 3) Any first {...} object substring
                        const objMatch = trimmed.match(/\{[\s\S]*\}/);
                        if (objMatch?.[0]) return JSON.parse(objMatch[0]);

                        return null;
                    };

                    let parsed = null;
                    if (typeof raw === 'object' && raw !== null) {
                        parsed = raw;
                    } else {
                        parsed = tryParseJsonFromString(typeof raw === 'string' ? raw : '');
                    }

                    if (parsed && typeof parsed === 'object') {
                        translationCache[targetLang] = parsed;
                        localStorage.setItem('mamasafe_translations', JSON.stringify(translationCache));
                        return parsed;
                    }

                    // Keep raw for debugging
                    console.warn('LLM translation fallback could not parse JSON mapping. Raw:', raw);
                    throw new Error('LLM did not return a parseable JSON mapping');

                } catch (e) {
                    lastErr = e;
                }
            }

            throw lastErr || new Error('LLM translation fallback failed');
        } catch (e2) {
            console.error('LLM translation fallback failed:', e2);
        }

        // Fallback 2: show originals (prevents broken UI)
        const fallback = {};
        allUITexts.forEach(text => (fallback[text] = text));
        return fallback;
    }
}



async function applyTranslations(lang) {
    // Fail-soft UI translations; keep console quiet for missing endpoints.
    const translations = await fetchTranslations(lang);

    const i18nElements = document.querySelectorAll('[data-i18n]');


    i18nElements.forEach(element => {
        const originalText = element.getAttribute('data-i18n');

        let translation = translations[originalText];
        if (!translation) {
            const fallback = element.getAttribute('data-i18n-fallback');
            if (fallback) {
                translation = translations[fallback];
            }
            if (!translation) {
                translation = originalText;
            }
        }
        element.textContent = translation;
    });

    const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');


    placeholderElements.forEach(element => {
        const originalText = element.getAttribute('data-i18n-placeholder');
        const translation = translations[originalText] || originalText;
        element.placeholder = translation;
    });

    document.documentElement.lang = lang;
}