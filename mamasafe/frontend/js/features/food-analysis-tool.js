(function () {
    const profiles = [
        {
            type: 'harmful',
            label: 'Raw or undercooked seafood',
            keywords: ['raw fish', 'raw seafood', 'sushi', 'sashimi', 'ceviche', 'raw oyster', 'oysters'],
            nutrients: ['Protein', 'Omega-3 fats in some seafood', 'Vitamin B12', 'Iodine'],
            verdict: 'Harmful during pregnancy when raw or undercooked because of infection risk.',
            guidance: ['Choose fully cooked seafood instead.', 'Use low-mercury fish options when possible.', 'Seek care if you develop fever, severe vomiting, or diarrhea after a risky food exposure.']
        },
        {
            type: 'harmful',
            label: 'High-mercury fish',
            keywords: ['shark', 'swordfish', 'king mackerel', 'marlin', 'bigeye tuna', 'tilefish'],
            nutrients: ['Protein', 'Omega-3 fats', 'Vitamin B12', 'Selenium'],
            verdict: 'Avoid during pregnancy because mercury can affect fetal brain and nervous system development.',
            guidance: ['Choose low-mercury fish such as salmon, sardines, trout, anchovies, or properly cooked light tuna in moderation.', 'Ask your clinician about local fish advisories.']
        },
        {
            type: 'harmful',
            label: 'Unpasteurized dairy or soft cheese',
            keywords: ['unpasteurized', 'raw milk', 'queso fresco', 'brie', 'camembert', 'blue cheese'],
            nutrients: ['Calcium', 'Protein', 'Vitamin B12', 'Iodine'],
            verdict: 'Harmful if unpasteurized because of listeria and other infection risks.',
            guidance: ['Choose pasteurized milk, yogurt, and cheese.', 'Check labels before eating soft cheeses.']
        },
        {
            type: 'harmful',
            label: 'Raw or undercooked eggs',
            keywords: ['raw egg', 'raw eggs', 'runny egg', 'runny eggs', 'homemade mayo', 'cookie dough', 'undercooked egg'],
            nutrients: ['Choline', 'Protein', 'Vitamin D', 'Vitamin B12'],
            verdict: 'Harmful when raw or undercooked because of salmonella risk.',
            guidance: ['Choose fully cooked eggs.', 'Avoid raw egg mixtures unless made with pasteurized egg products.']
        },
        {
            type: 'harmful',
            label: 'Alcohol',
            keywords: ['alcohol', 'beer', 'wine', 'liquor', 'cocktail'],
            nutrients: ['No essential pregnancy nutrient benefit'],
            verdict: 'Harmful during pregnancy. No safe amount is recommended.',
            guidance: ['Avoid alcohol during pregnancy.', 'Ask your clinician for support if stopping alcohol is difficult.']
        },
        {
            type: 'caution',
            label: 'Caffeine or energy drinks',
            keywords: ['coffee', 'espresso', 'caffeine', 'energy drink', 'energy drinks'],
            nutrients: ['Not a meaningful source of essential pregnancy nutrients'],
            verdict: 'Use caution. Many pregnancy guidelines suggest limiting caffeine, often around 200 mg per day.',
            guidance: ['Track caffeine from coffee, tea, soda, chocolate, and energy drinks.', 'Ask your clinician about your personal limit, especially with blood pressure, sleep, or nausea concerns.']
        },
        {
            type: 'caution',
            label: 'Deli meat or hot dogs',
            keywords: ['deli meat', 'cold cuts', 'ham slices', 'turkey slices', 'hot dog', 'hot dogs'],
            nutrients: ['Protein', 'Iron in some meats', 'Zinc', 'Vitamin B12'],
            verdict: 'Use caution because refrigerated ready-to-eat meats can carry listeria.',
            guidance: ['Heat deli meats and hot dogs until steaming hot.', 'Choose freshly cooked proteins more often.']
        },
        {
            type: 'caution',
            label: 'Liver or high-retinol foods',
            keywords: ['liver', 'beef liver', 'chicken liver', 'cod liver oil'],
            nutrients: ['Iron', 'Vitamin B12', 'Folate', 'Vitamin A'],
            verdict: 'Use caution because very high retinol vitamin A intake may be unsafe in pregnancy.',
            guidance: ['Ask your clinician before eating liver often or using cod liver oil.', 'Avoid stacking high-vitamin-A supplements with liver foods.']
        },
        {
            type: 'harmful',
            label: 'Raw sprouts',
            keywords: ['raw sprouts', 'alfalfa sprouts', 'bean sprouts'],
            nutrients: ['Vitamin C', 'Fiber', 'Folate'],
            verdict: 'Harmful when raw because sprouts can carry bacteria that are hard to wash away.',
            guidance: ['Eat sprouts only if cooked thoroughly.', 'Choose other washed vegetables when eating raw.']
        },
        {
            type: 'helpful',
            label: 'Cooked low-mercury fish',
            keywords: ['salmon', 'sardines', 'sardine', 'trout', 'anchovies', 'anchovy'],
            nutrients: ['Omega-3 DHA', 'Protein', 'Vitamin D', 'Vitamin B12', 'Selenium'],
            verdict: 'Helpful for pregnancy when fully cooked and low in mercury.',
            guidance: ['Supports fetal brain and eye development.', 'Keep preparation fully cooked.', 'Balance seafood choices across the week.']
        },
        {
            type: 'helpful',
            label: 'Eggs',
            keywords: ['egg', 'eggs'],
            nutrients: ['Choline', 'Protein', 'Vitamin D', 'Vitamin B12', 'Selenium'],
            verdict: 'Helpful for pregnancy when fully cooked.',
            guidance: ['Choline supports fetal brain development.', 'Pair with whole grains or vegetables for a balanced meal.']
        },
        {
            type: 'helpful',
            label: 'Leafy greens',
            keywords: ['spinach', 'kale', 'leafy greens', 'greens', 'lettuce'],
            nutrients: ['Folate', 'Iron', 'Vitamin K', 'Vitamin C', 'Fiber'],
            verdict: 'Helpful for pregnancy as part of a varied diet.',
            guidance: ['Folate supports neural tube development.', 'Pair plant iron with vitamin C foods to improve absorption.', 'Wash raw greens well.']
        },
        {
            type: 'helpful',
            label: 'Beans and lentils',
            keywords: ['lentils', 'lentil', 'beans', 'black beans', 'chickpeas', 'peas'],
            nutrients: ['Folate', 'Iron', 'Protein', 'Fiber', 'Magnesium'],
            verdict: 'Helpful for pregnancy, especially for iron, folate, and steady energy.',
            guidance: ['Increase fiber gradually and drink fluids.', 'Add citrus, tomatoes, or peppers to help iron absorption.']
        },
        {
            type: 'helpful',
            label: 'Pasteurized dairy',
            keywords: ['yogurt', 'greek yogurt', 'milk', 'pasteurized cheese', 'cheese'],
            nutrients: ['Calcium', 'Protein', 'Iodine', 'Vitamin B12', 'Probiotics in some yogurt'],
            verdict: 'Helpful when pasteurized.',
            guidance: ['Supports bone and tooth development.', 'Choose pasteurized products and refrigerate safely.']
        },
        {
            type: 'helpful',
            label: 'Avocado',
            keywords: ['avocado'],
            nutrients: ['Folate', 'Potassium', 'Fiber', 'Monounsaturated fats'],
            verdict: 'Helpful for pregnancy as a nutrient-dense fat and fiber source.',
            guidance: ['Can support fullness and constipation prevention.', 'Works well with eggs, beans, whole grains, or salads.']
        },
        {
            type: 'helpful',
            label: 'Sweet potato',
            keywords: ['sweet potato', 'yam'],
            nutrients: ['Beta carotene', 'Fiber', 'Potassium', 'Vitamin C'],
            verdict: 'Helpful for pregnancy as a steady carbohydrate and vitamin source.',
            guidance: ['Supports energy and digestion.', 'Pair with protein for better blood sugar steadiness.']
        },
        {
            type: 'helpful',
            label: 'Nuts and seeds',
            keywords: ['almonds', 'walnuts', 'nuts', 'chia', 'flaxseed', 'pumpkin seeds', 'peanut butter'],
            nutrients: ['Healthy fats', 'Protein', 'Magnesium', 'Fiber', 'Zinc'],
            verdict: 'Helpful for pregnancy if tolerated and allergy-safe for you.',
            guidance: ['Useful as a protein-rich snack.', 'Use ground flax or chia with fluids to support fiber intake.']
        },
        {
            type: 'helpful',
            label: 'Lean meat or poultry',
            keywords: ['chicken', 'turkey', 'lean beef', 'beef', 'pork'],
            nutrients: ['Protein', 'Iron', 'Zinc', 'Vitamin B12'],
            verdict: 'Helpful when cooked thoroughly.',
            guidance: ['Iron supports blood volume and helps reduce anemia risk.', 'Avoid undercooked meat and use safe food handling.']
        },
        {
            type: 'helpful',
            label: 'Whole grains (incl. brown rice)',
            keywords: ['oatmeal', 'oats', 'brown rice', 'quinoa', 'whole grain', 'whole wheat', 'brown rice'],
            nutrients: ['Complex carbohydrates', 'Fiber', 'Magnesium', 'Thiamin (vitamin B1)', 'Folate (especially in whole grains)'],
            verdict: 'Helpful for pregnancy energy and digestion.',
            guidance: [
                'Choose whole-grain options (like brown rice) when you want more fiber.',
                'Pair with protein or healthy fats for steadier blood sugar.',
                'For constipation prevention, increase fluids and fiber gradually.'
            ]
        },
        {
            type: 'helpful',
            label: 'Rice (white or cooked)',
            keywords: ['rice', 'white rice'],
            nutrients: ['Carbohydrates for energy', 'Thiamin (vitamin B1)', 'Small amounts of B vitamins', 'Selenium (depends on variety)', 'Muscle-supporting minerals (small amounts)'],
            verdict: 'Helpful for pregnancy when cooked thoroughly and stored safely.',
            guidance: [
                'Generally safe and well tolerated; provides steady energy that can help with nausea/low appetite.',
                'In pregnancy, focus on variety—pair rice with protein (beans, eggs, fish, chicken) and vegetables for a more complete nutrient intake.',
                'Food-safety: cook until fully done; refrigerate leftovers promptly and reheat until steaming hot to reduce foodborne illness risk.'
            ]
        },
        {
            type: 'helpful',
            label: 'Vitamin C fruits',
            keywords: ['orange', 'oranges', 'berries', 'strawberries', 'kiwi', 'mango'],
            nutrients: ['Vitamin C', 'Fiber', 'Folate', 'Antioxidants'],
            verdict: 'Helpful for pregnancy as part of daily fruit intake.',
            guidance: ['Vitamin C helps plant iron absorption.', 'Pair fruit with protein if blood sugar swings are a concern.']
        },
        {
            type: 'helpful',
            label: 'Tofu and soy foods',
            keywords: ['tofu', 'edamame', 'soy milk', 'tempeh'],
            nutrients: ['Protein', 'Iron', 'Calcium in calcium-set tofu', 'Magnesium'],
            verdict: 'Helpful for pregnancy as a plant protein option.',
            guidance: ['Check whether tofu is calcium-set if you are using it for calcium.', 'Use pasteurized fortified soy milk when choosing milk alternatives.']
        }
    ];

    function escapeHTML(value) {
        return String(value ?? '').replace(/[&<>"']/g, (char) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[char]));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function hasAny(text, keywords) {
        return keywords.some(keyword => text.includes(keyword));
    }

    function rawAnimalFoodProfile(text) {
        const raw = /\b(raw|undercooked|runny)\b/.test(text);
        if (!raw) return null;

        if (/(fish|seafood|salmon|tuna|shrimp|oyster|sushi|sashimi)/.test(text)) {
            return profiles[0];
        }

        if (/(egg|eggs|mayo|cookie dough)/.test(text)) {
            return profiles[3];
        }

        if (/(meat|beef|chicken|pork|turkey|lamb)/.test(text)) {
            return {
                type: 'harmful',
                label: 'Raw or undercooked meat',
                nutrients: ['Protein', 'Iron', 'Zinc', 'Vitamin B12'],
                verdict: 'Harmful during pregnancy when undercooked because of infection risk.',
                guidance: ['Cook meat and poultry thoroughly.', 'Avoid tasting meat before it reaches a safe cooked temperature.']
            };
        }

        return null;
    }

    function findProfile(foodName, notes) {
        const text = normalize(`${foodName} ${notes}`);
        const rawProfile = rawAnimalFoodProfile(text);
        if (rawProfile) return rawProfile;

        const ranked = { harmful: 0, caution: 1, helpful: 2 };
        return profiles
            .slice()
            .sort((a, b) => ranked[a.type] - ranked[b.type])
            .find(profile => hasAny(text, profile.keywords));
    }

    function buildAnalysis(foodName, notes = '') {
        const profile = findProfile(foodName, notes);

        if (!profile) {
            return {
                type: 'review',
                label: 'Food needs review',
                foodName,
                nutrients: ['Nutrients vary by food and preparation', 'Look for protein, fiber, folate, iron, calcium, iodine, choline, DHA, and vitamin D across the day'],
                verdict: 'Review needed. I cannot confidently mark this food helpful or harmful from the built-in pregnancy food knowledge base.',
                guidance: ['Check whether it is raw, undercooked, unpasteurized, high mercury, or high caffeine.', 'When in doubt, choose a cooked, pasteurized, safely stored option.', 'Ask your clinician about restrictions linked to your labs, allergies, or pregnancy complications.']
            };
        }

        return { ...profile, foodName };
    }

    function statusLabel(type) {
        if (type === 'helpful') return 'Helpful for pregnancy';
        if (type === 'harmful') return 'Harmful or avoid';
        if (type === 'caution') return 'Use caution';
        return 'Review needed';
    }

    function toneClass(type) {
        if (type === 'helpful') return 'ready';
        if (type === 'harmful') return 'urgent';
        return 'review';
    }

    function renderList(items) {
        return `<ul>${items.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>`;
    }

    function renderAnalysis(analysis) {
        const tone = toneClass(analysis.type);
        return `
            <div class="food-analysis-result ${tone}">
                <div class="food-analysis-status">
                    <span>${escapeHTML(statusLabel(analysis.type))}</span>
                    <strong>${escapeHTML(analysis.label)}</strong>
                    <p>${escapeHTML(analysis.verdict)}</p>
                </div>
                <div class="food-analysis-grid">
                    <section>
                        <h4>Essential nutrients</h4>
                        ${renderList(analysis.nutrients)}
                    </section>
                    <section>
                        <h4>Pregnancy safety</h4>
                        ${renderList(analysis.guidance)}
                    </section>
                </div>
                <p class="food-analysis-note">AI-assisted educational food analysis only. Preparation, pasteurization, storage, portion size, allergies, and your care plan can change the answer.</p>
            </div>
        `;
    }

    function setOutputState(output, tone, html) {
        if (!output) return;
        output.classList.remove('loading', 'ready', 'urgent', 'review', 'error');
        if (tone) output.classList.add(tone);
        output.innerHTML = html;
    }

    async function analyzeFoodForPregnancy(event) {
        if (event) event.preventDefault();

        const input = document.getElementById('foodAnalysisInput');
        const notesEl = document.getElementById('foodAnalysisNotes');
        const output = document.getElementById('foodAnalysisOutput');
        if (!input || !output) return;

        const foodName = input.value.trim();
        const notes = notesEl?.value?.trim() || '';

        if (!foodName) {
            setOutputState(output, 'error', '<p class="food-analysis-note">Enter a food name to analyze.</p>');
            input.focus();
            return;
        }

        setOutputState(output, 'loading', '<strong>Analyzing food for pregnancy with AI...</strong>');

        // Prefer backend AI analysis pipeline (server-side Llama/Groq)
        try {
            const payload = {
                type: 'pregnancy-food-analysis',
                food: foodName,
                notes: notes
            };

            // Robust endpoint selection (some pages may not define window.mamasafeApiUrl)
            const endpoint = (() => {
                try {
                    if (window.mamasafeApiUrl && typeof window.mamasafeApiUrl === 'function') {
                        return window.mamasafeApiUrl('/api/ai-nutrition-analysis');
                    }
                } catch {
                    // ignore
                }
                // Default: same-origin backend route
                return '/api/ai-nutrition-analysis';
            })();

            const resp = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await resp.json().catch(() => ({}));
            if (!resp.ok) {
                const msg = data?.error || data?.details || `AI backend error (${resp.status})`;
                throw new Error(msg);
            }

            // Expected shapes from backend: it returns analyzeNutrition() directly,
            // but keep compatibility with other wrappers.
            const aiAnalysis = data?.analysis || data?.result || data?.reply || data?.response || data?.data || data;

            // If backend already returns rendered HTML, use it.
            if (typeof aiAnalysis === 'string' && /food-analysis-result/.test(aiAnalysis)) {
                setOutputState(output, 'ready', aiAnalysis);
                return;
            }

            // If backend returns structured object from llamaAnalysis.analyzeNutrition
            if (aiAnalysis && typeof aiAnalysis === 'object') {
                const verdictRaw = aiAnalysis.verdict || aiAnalysis.safetyLevel || aiAnalysis.safety || '';
                const verdictNorm = String(verdictRaw || '').toLowerCase();

                const type = aiAnalysis.type || aiAnalysis.verdictType || (
                    verdictNorm.includes('harm') ? 'harmful'
                        : verdictNorm.includes('caution') ? 'caution'
                            : verdictNorm.includes('help') ? 'helpful'
                                : verdictNorm.includes('review') ? 'review'
                                    : (verdictNorm.includes('safe') ? 'helpful' : 'review')
                );

                const mapped = {
                    type,
                    label: aiAnalysis.label || aiAnalysis.food || aiAnalysis.title || foodName,
                    verdict: aiAnalysis.verdict || aiAnalysis.summary || aiAnalysis.risk || '',
                    nutrients: Array.isArray(aiAnalysis.essentialNutrients)
                        ? aiAnalysis.essentialNutrients
                        : (Array.isArray(aiAnalysis.nutrients) ? aiAnalysis.nutrients : []),
                    guidance: []
                };

                // guidance: merge whyHelpful + risks + preparationTips
                const guidance = [];
                if (Array.isArray(aiAnalysis.whyHelpful)) guidance.push(...aiAnalysis.whyHelpful);
                if (Array.isArray(aiAnalysis.risks)) guidance.push(...aiAnalysis.risks);
                if (Array.isArray(aiAnalysis.preparationTips)) guidance.push(...aiAnalysis.preparationTips);
                if (!guidance.length && Array.isArray(aiAnalysis.guidance)) guidance.push(...aiAnalysis.guidance);
                if (!guidance.length && Array.isArray(aiAnalysis.safety)) guidance.push(...aiAnalysis.safety);
                if (!guidance.length && Array.isArray(aiAnalysis.recommendations)) guidance.push(...aiAnalysis.recommendations);

                mapped.guidance = guidance.length
                    ? guidance
                    : ['When in doubt, choose a safely prepared option and ask your clinician.'];

                mapped.nutrients = (Array.isArray(mapped.nutrients) && mapped.nutrients.length)
                    ? mapped.nutrients
                    : ['Nutrients vary by food and preparation'];

                setOutputState(output, toneClass(mapped.type), renderAnalysis(mapped));
                return;
            }

            throw new Error('AI backend returned an unexpected format');
        } catch (error) {
            // Fallback to local rule-based analysis so the tool still works offline
            const analysis = buildAnalysis(foodName, notes);
            setOutputState(output, toneClass(analysis.type), renderAnalysis(analysis));

            // Helpful debug log
            if (window.console) {
                if (typeof window.console.info === 'function') {
                    window.console.info('Food analysis AI unavailable; using offline mode:', {
                        message: error?.message || String(error),
                        foodName,
                        notes
                    });
                } else if (typeof window.console.log === 'function') {
                    window.console.log('Food analysis AI unavailable; using offline mode:', error);
                }
            }
        }
    }


    function bindFoodAnalysisForms(root = document) {
        root.querySelectorAll('#foodAnalysisForm').forEach(form => {
            if (form.dataset.foodAnalysisBound === 'true') return;
            form.dataset.foodAnalysisBound = 'true';
            form.addEventListener('submit', analyzeFoodForPregnancy);
        });
    }

    window.MamasafeFoodAnalysis = {
        analyze: buildAnalysis,
        render: renderAnalysis,
        bind: bindFoodAnalysisForms
    };
    window.analyzeFoodForPregnancy = analyzeFoodForPregnancy;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => bindFoodAnalysisForms());
    } else {
        bindFoodAnalysisForms();
    }
})();
