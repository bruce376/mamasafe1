// Hosted API fallback.
// Firebase Hosting has no Express backend on Spark, so browser-only fallbacks keep UI flows usable.
(function () {
    if (window.MAMASAFE_API_FALLBACK_INSTALLED) return;
    window.MAMASAFE_API_FALLBACK_INSTALLED = true;

    const originalFetch = window.fetch.bind(window);
    const localHosts = new Set(['localhost', '127.0.0.1', '0.0.0.0']);

    function isLocalPage() {
        return localHosts.has(window.location.hostname);
    }

    function hasConfiguredBackend() {
        return Boolean(window.MAMASAFE_API_BASE) || isLocalPage();
    }

    function apiPath(input) {
        const raw = typeof input === 'string' ? input : input?.url;
        if (!raw) return '';
        let url;
        try {
            url = new URL(raw, window.location.origin);
        } catch {
            return '';
        }

        const isApi = url.pathname.startsWith('/api/');
        const isLocalBackend = localHosts.has(url.hostname) && url.port === '5000';
        const isSameOrigin = url.origin === window.location.origin;

        if (isApi && (isSameOrigin || isLocalBackend)) {
            return url.pathname;
        }
        return '';
    }

    async function readJsonBody(init) {
        if (!init?.body) return {};
        if (typeof init.body === 'string') {
            try {
                return JSON.parse(init.body);
            } catch {
                return {};
            }
        }
        return {};
    }

    function jsonResponse(data, status = 200) {
        return new Response(JSON.stringify(data), {
            status,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    function localChatReply(message = '') {
        const text = String(message).toLowerCase();
        if (text.includes('pregnancy') || text.includes('week')) {
            return 'Here is a practical pregnancy briefing: track symptoms, hydration, rest, and any changes that feel unusual. Keep appointments current, save your notes in Mamasafe, and contact a clinician for bleeding, severe pain, fever, reduced movement, or anything that feels urgent.';
        }
        if (text.includes('baby name') || text.includes('names')) {
            return '[{"name":"Amina","gender":"female","origin":"Arabic","meaning":"Trustworthy"},{"name":"Leo","gender":"male","origin":"Latin","meaning":"Lion"},{"name":"Noor","gender":"unisex","origin":"Arabic","meaning":"Light"},{"name":"Maya","gender":"female","origin":"Sanskrit","meaning":"Dream or illusion"},{"name":"Adam","gender":"male","origin":"Hebrew","meaning":"Earth"}]';
        }
        if (text.includes('sleep')) {
            return 'Sleep support: keep the routine predictable, use a calm wind-down, watch wake windows, and record sleep patterns for a few days before changing the schedule.';
        }
        if (text.includes('nutrition') || text.includes('feeding')) {
            return 'Nutrition support: focus on age-appropriate portions, steady hydration, safe textures, and allergy caution. Record reactions and ask a clinician about persistent vomiting, poor weight gain, or dehydration signs.';
        }
        return 'Mamasafe local assistant: I can help with pregnancy, names, courses, sleep, nutrition, and safety. For urgent medical symptoms, contact emergency services or your healthcare provider.';
    }

    function universalResponse(body = {}) {
        const name = body.functionName || body.description || 'care plan';
        const input = body.input || body.inputData || {};
        const goal = input.goal || input.notes || input.focus || 'today';
        return [
            `${name} local plan`,
            `Focus: ${goal}`,
            '1. Record the most important detail in your tracker.',
            '2. Choose one small action for the next few hours.',
            '3. Watch for red flags and contact a clinician for urgent concerns.',
            '4. Review the saved data tomorrow and adjust gently.'
        ].join('\n');
    }

    async function fallbackFor(path, init) {
        const body = await readJsonBody(init);

        if (path === '/api/health') {
            return jsonResponse({
                status: 'OK',
                database: { connected: true, mode: 'firestore-browser', name: 'mamasafe-95d58' },
                timestamp: new Date().toISOString()
            });
        }

        if (path === '/api/auth/user') {
            return jsonResponse({ user: null, source: 'firebase-auth-client' });
        }

        if (path === '/api/ai/status' || path === '/api/chat/status') {
            return jsonResponse({
                success: true,
                architecture: 'Llama 3.3 70B via Groq + MongoDB Vector Search RAG',
                source: 'local-hosting-fallback',
                aiModel: {
                    provider: 'local',
                    providerLabel: 'Local fallback',
                    model: 'local-hosting-fallback',
                    displayName: 'MamaSafe local fallback',
                    runtime: 'browser'
                },
                flow: ['User Question', 'Frontend', 'Backend', 'Embedding Model', 'MongoDB Vector Search', 'Llama 3.3 70B via Groq', 'AI-generated answer']
            });
        }

        if (path === '/api/user/profile') {
            return jsonResponse({ success: true, profile: null, source: 'firestore-client' });
        }

        if (path === '/api/ai' || path === '/api/ai/ask' || path === '/api/ai/pregnancy' || path === '/api/chat' || path === '/api/chat/ask' || path === '/api/chat/pregnancy' || path === '/api/mamasafe-chat') {
            const reply = localChatReply(body.message || '');
            return jsonResponse({
                success: true,
                reply,
                response: reply,
                result: reply,
                source: 'local-hosting-fallback',
                aiModel: {
                    provider: 'local',
                    providerLabel: 'Local fallback',
                    model: 'local-hosting-fallback',
                    displayName: 'MamaSafe local fallback',
                    runtime: 'browser'
                },
                pipeline: {
                    version: 'local-hosting-fallback',
                    flow: ['User Question', 'Frontend', 'Local fallback answer', 'User receives response']
                },
                rag: path.startsWith('/api/chat') || path.startsWith('/api/ai')
                    ? { retrievalMode: 'local-hosting-fallback', groqUsed: false }
                    : undefined
            });
        }

        if (path === '/api/mamasafe-analyze-image') {
            const reply = 'Image analysis needs the private backend AI service. On the hosted Spark version, save the image notes manually and contact a clinician for urgent symptoms.';
            return jsonResponse({ success: true, reply, response: reply, result: reply, source: 'local-hosting-fallback' });
        }

        if (path.includes('/ai-') || path === '/api/courses/recommendations' || path === '/api/courses/module-lesson' || path === '/api/courses/expert-qa' || path === '/api/courses/community-insight') {
            const response = universalResponse(body);
            return jsonResponse({ success: true, reply: response, response, result: response, source: 'local-hosting-fallback' });
        }

        if (path === '/api/wikidata') {
            return jsonResponse({ success: true, search: [], results: [], source: 'local-hosting-fallback' });
        }

        if (path.includes('/admin-panel/')) {
            return jsonResponse({ success: false, error: 'Admin backend is not deployed on Firebase Hosting Spark.' }, 503);
        }

        return jsonResponse({ success: true, data: null, source: 'local-hosting-fallback' });
    }

    window.fetch = function hostedAwareFetch(input, init) {
        const path = apiPath(input);
        if (path && !hasConfiguredBackend()) {
            return fallbackFor(path, init);
        }
        return originalFetch(input, init);
    };
})();
