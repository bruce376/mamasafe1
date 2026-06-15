(function () {
    const TENSORFLOW_SCRIPT_URL = 'vendor/tfjs/tf.min.js';
    const TF_FEATURE_NAMES = [
        'age',
       
       
        'previousComplications',
        'preexistingDiabetes',
       
        'mentalHealth'
    ];
    const TF_LABELS = ['low risk', 'mid risk', 'high risk'];
    const WEEK_IMAGE_BASE_PATH = 'assets/pregnancy-weeks';
    const WEEK_SIZE_CUES = [
        'poppy seed', 'poppy seed', 'poppy seed', 'poppy seed', 'sesame seed', 'pea',
        'grape', 'raspberry', 'strawberry', 'apricot', 'fig', 'plum', 'peach',
        'kiwi fruit', 'apple', 'avocado', 'pomegranate', 'bell pepper', 'beef tomato',
        'banana', 'carrot', 'sweet potato', 'large mango', 'corn on the cob',
        'courgette', 'cucumber', 'head of cauliflower', 'aubergine', 'butternut squash',
        'cabbage', 'coconut', 'bunch of celery', 'pineapple', 'cantaloupe melon',
        'honeydew melon', 'romaine lettuce', 'leek', 'stick of rhubarb',
        'small watermelon', 'pumpkin', 'pumpkin or watermelon', 'pumpkin or watermelon'
    ];

    const state = {
        lastAnswer: null,
        lastRiskTrends: null,
        trainingSummary: null,
        tfScriptPromise: null,
        tfTrainingPromise: null,
        tfTrainingData: null,
        tfModelPromise: null,
        tfModel: null,
        tfMetrics: null,
        tfLastPrediction: null,
        kickSession: {
            active: false,
            count: 0,
            startedAt: null,
            timerId: null,
            saved: false,
            saving: false
            }
    };

    function getBackendOrigin() {
        if (window.MAMASAFE_API_BASE) {
            return window.MAMASAFE_API_BASE.replace(/\/api\/?$/, '').replace(/\/$/, '');
        }
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isLocal) {
            if (window.location.port === '5000') {
                return window.location.origin;
            }
            return `${window.location.protocol}//${window.location.hostname}:5000`;
        }
        if (window.location.hostname.endsWith('.web.app') || window.location.hostname.endsWith('.firebaseapp.com')) {
            return 'https://mamasafe1.onrender.com';
        }
        return window.location.origin;
    }

    function getBackendOrigins() {
        const primary = getBackendOrigin();
        const local5000 = 'http://localhost:5000';
        const local3000 = 'http://localhost:3000';
        const render = 'https://mamasafe1.onrender.com';
        const shouldTryLocal = window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const currentLocalOrigin = shouldTryLocal && window.location.origin && window.location.origin !== 'null'
            ? window.location.origin
            : '';
        return [...new Set([
            primary,
            currentLocalOrigin,
            shouldTryLocal ? local5000 : '',
            shouldTryLocal ? local3000 : '',
            render
        ].filter(Boolean))];
    }

    async function fetchPregnancyRag(path, options = {}) {
        const origins = getBackendOrigins();
        let lastError;
        let lastResponse;

        for (const origin of origins) {
            try {
                const response = await fetch(`${origin}${path}`, options);
                response.backendOrigin = origin;
                const shouldRetryOrigin = response.status === 404
                    || response.status === 502
                    || response.status === 503
                    || response.status === 504
                    || ((origin.includes('localhost') || origin.includes('127.0.0.1')) && response.status >= 500);
                if (shouldRetryOrigin && origins.length > 1) {
                    lastResponse = response;
                    continue;
                }
                return response;
            } catch (error) {
                lastError = error;
            }
        }

        if (lastResponse) return lastResponse;
        throw lastError || new Error('Could not reach the pregnancy RAG backend');
    }

    async function readJson(response) {
        const text = await response.text();
        if (!text) return {};
        try {
            return JSON.parse(text);
        } catch {
            return { reply: text };
        }
    }

    function escapeHTML(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function clampWeek(value) {
        const numeric = Number.parseInt(value, 10);
        if (!Number.isFinite(numeric)) return 24;
        return Math.min(Math.max(numeric, 1), 42);
    }

    function getTrimesterInfo(week) {
        if (week <= 13) {
            return {
                label: 'First',
                full: 'First trimester',
                focus: 'confirm care, support early symptoms, and plan first appointments'
            };
        }
        if (week <= 27) {
            return {
                label: 'Second',
                full: 'Second trimester',
                focus: 'watch growth, movement patterns, scans, and comfort changes'
            };
        }
        return {
            label: 'Third',
            full: 'Third trimester',
            focus: 'prepare for birth, monitor movement, and keep appointment plans clear'
        };
    }

    function getWeekVisual(week) {
        const safeWeek = clampWeek(week);
        const imageWeek = String(safeWeek).padStart(2, '0');
        return {
            src: `${WEEK_IMAGE_BASE_PATH}/week-${imageWeek}.png`,
            note: safeWeek <= 3
                ? 'Earliest-week baby-size visual used because visible baby-size guide images begin later.'
                : `Week ${safeWeek} baby-size visual.`
        };
    }

    function listForStage(week) {
        if (week <= 4) {
            return {
                baby: ['Pregnancy dating usually starts from the last menstrual period.', 'A fertilized egg may implant and begin early development.', 'The placenta and pregnancy hormone signals are starting to form.'],
                mother: ['A period may be late or symptoms may still be subtle.', 'Breast tenderness, tiredness, or mild cramping can happen.', 'Some mothers have no obvious symptoms yet.'],
                care: ['Start or continue a prenatal vitamin with folic acid if advised.', 'Avoid alcohol, smoking, and unsafe medicines.', 'Book care if you have a positive test or concerning symptoms.'],
                questions: ['When should I schedule my first prenatal visit?', 'Which medicines or supplements are safe for me?', 'Do I need early blood tests or an ultrasound?']
            };
        }
        if (week <= 8) {
            return {
                baby: ['Major organs and body systems are beginning to form.', 'The heart and early limb structures are developing.', 'Growth is rapid even though the baby is still very small.'],
                mother: ['Nausea, tiredness, food aversions, and frequent urination are common.', 'Mood changes and breast tenderness may increase.', 'Hydration can be harder if nausea is strong.'],
                care: ['Arrange prenatal care and discuss your health history.', 'Eat small, gentle meals if nausea is present.', 'Ask before taking new medicines or herbal products.'],
                questions: ['What should I do if nausea becomes severe?', 'Which warning signs should make me call urgently?', 'What prenatal screening options will be offered?']
            };
        }
        if (week <= 13) {
            return {
                baby: ['Facial features, limbs, and organs continue developing.', 'The baby is moving, though movement is usually not felt yet.', 'The placenta is taking on more support work.'],
                mother: ['Nausea may begin to ease for some mothers.', 'Fatigue and breast changes may continue.', 'Clothes may start feeling tighter.'],
                care: ['Review screening tests and first-trimester results.', 'Keep hydration and balanced snacks nearby.', 'Write questions before appointments so they are easier to remember.'],
                questions: ['What screening tests are recommended for me?', 'Is my weight, blood pressure, and blood sugar on track?', 'When is the next scan or appointment?']
            };
        }
        if (week <= 20) {
            return {
                baby: ['Growth becomes easier to notice on scans.', 'Bones, muscles, and senses continue developing.', 'Some mothers start to feel first movements.'],
                mother: ['Energy may improve, but back or round-ligament discomfort can appear.', 'Appetite and sleep patterns may change.', 'Skin and posture changes can become more noticeable.'],
                care: ['Prepare for the anatomy scan if it is due soon.', 'Use gentle movement if your clinician says it is safe.', 'Track new symptoms and bring them to visits.'],
                questions: ['What should I expect from the anatomy scan?', 'Which activities are safe for me now?', 'What symptoms should not wait until the next visit?']
            };
        }
        if (week <= 27) {
            return {
                baby: ['Baby growth continues quickly.', 'Movements may become clearer and more responsive.', 'Hearing and sleep-wake patterns keep developing.'],
                mother: ['Back pain, heartburn, leg cramps, and mild swelling can happen.', 'Blood sugar screening may be discussed around this stage.', 'Movement awareness becomes more useful.'],
                care: ['Ask about glucose screening timing and results.', 'Stay hydrated and rest with legs supported if swelling is mild.', 'Notice movement patterns and report major changes.'],
                questions: ['Do I need glucose screening or extra monitoring?', 'Is my swelling normal for this week?', 'How should I track baby movement?']
            };
        }
        if (week <= 32) {
            return {
                baby: ['The baby is adding body fat and practicing movements for after birth.', 'Movements can feel stronger or more rolling.', 'Lungs and brain continue important development.'],
                mother: ['Sleep may become harder and pelvic pressure can increase.', 'Braxton Hicks contractions may happen.', 'Shortness of breath or heartburn may be more noticeable.'],
                care: ['Review third-trimester appointment schedule.', 'Know your normal movement pattern.', 'Begin practical birth and postpartum planning.'],
                questions: ['How often should I be seen now?', 'Which contractions are normal and which are urgent?', 'What should I prepare before birth?']
            };
        }
        if (week <= 36) {
            return {
                baby: ['The baby continues growing and may start settling into position.', 'Movements should still be felt every day.', 'Weight gain and final development continue.'],
                mother: ['Pelvic pressure, backache, frequent urination, and sleep disruption are common.', 'Braxton Hicks may feel more frequent.', 'Energy can vary day to day.'],
                care: ['Pack essentials and confirm transport plans.', 'Ask about signs of labor and when to go in.', 'Keep emergency contacts and clinic numbers easy to reach.'],
                questions: ['Is baby head-down or do we need a position check?', 'When should I call about contractions or leaking fluid?', 'Do I need group B strep screening?']
            };
        }
        return {
            baby: ['The baby is close to birth size.', 'Movement should continue, even if it feels different as space gets tighter.', 'Your care team may monitor wellbeing more closely near or after the due date.'],
            mother: ['Pressure, irregular contractions, backache, and frequent urination can increase.', 'You may notice nesting, fatigue, or stronger practice contractions.', 'Waiting past the due date can feel emotionally tiring.'],
            care: ['Review labor signs, hospital plans, and support people.', 'Keep tracking movement and call if it changes clearly.', 'Discuss induction or extra monitoring if pregnancy continues past the due date.'],
            questions: ['When should I go to the hospital or birth center?', 'What is the plan if I pass my due date?', 'How will baby movement and fluid levels be monitored?']
        };
    }

    function buildLocalWeekGuide(week) {
        const trimester = getTrimesterInfo(week);
        const stage = listForStage(week);
        const commonWarnings = [
            'Heavy bleeding or fluid leaking',
            'Severe headache, vision changes, chest pain, or trouble breathing',
            'Severe belly pain, fever, fainting, or a clear reduction in baby movement'
        ];
        return {
            week,
            trimester,
            size: WEEK_SIZE_CUES[week - 1] || 'growing baby',
            title: `Week ${week}: ${trimester.full} care snapshot`,
            intro: `This week focuses on ${trimester.focus}. Use this as a guide for preparation and provider conversations.`,
            baby: stage.baby,
            mother: stage.mother,
            care: stage.care,
            questions: stage.questions,
            warnings: commonWarnings
        };
    }

    function buildWeekSuggestionPlan(weekInput) {
        const week = clampWeek(weekInput);
        const trimester = getTrimesterInfo(week);
        const size = WEEK_SIZE_CUES[week - 1] || 'growing baby';
        const early = week <= 13;
        const mid = week >= 14 && week <= 27;
        const late = week >= 28;
        const movement = early
            ? ['Walk 10-20 minutes at an easy pace if you feel well.', 'Try gentle neck, shoulder, and calf stretches.', 'Use slow breathing or light pelvic tilts for comfort.']
            : mid
                ? ['Walk, swim, or use low-impact cardio for 20-30 minutes if approved.', 'Add gentle prenatal yoga or side-lying stretches.', 'Avoid lying flat on your back for long exercise sets.']
                : ['Choose short walks, pelvic tilts, supported squats, or birth-ball circles.', 'Do daily pelvic floor relaxation and gentle mobility.', 'Stop and call your provider for dizziness, bleeding, chest pain, or painful contractions.'];
        const food = early
            ? ['Small frequent meals can help nausea.', 'Choose folate-rich greens, beans, citrus, avocado, and fortified grains.', 'Pair crackers, oats, rice, or toast with protein such as eggs, yogurt, nuts, or beans.']
            : mid
                ? ['Build meals around protein, iron-rich foods, vegetables, fruit, and whole grains.', 'Include calcium foods such as yogurt, milk, fortified drinks, tofu, or leafy greens.', 'Keep water nearby and add fiber foods if constipation appears.']
                : ['Use smaller meals if heartburn or fullness is strong.', 'Include iron and protein foods such as lean meat, eggs, beans, lentils, fish low in mercury, nuts, or tofu.', 'Prepare simple freezer or pantry meals for the first postpartum days.'];
        const sleep = early
            ? ['Sleep in any comfortable position unless your clinician gave a restriction.', 'Use an extra pillow under knees or behind your back if cramps or nausea wake you.', 'Keep a steady bedtime and nap when fatigue is heavy.']
            : mid
                ? ['Side sleeping is usually most comfortable now, especially the left side.', 'Place a pillow between knees and one under the bump for hip and back support.', 'If you wake on your back, simply roll to your side.']
                : ['Prioritize left-side or side-lying sleep with pillows behind your back and between knees.', 'Use a raised upper body position if heartburn or breathlessness bothers you.', 'Rest on your side during the day if swelling or pelvic pressure increases.'];
        const care = [];

        if (week <= 8) care.push('Book or confirm your first prenatal appointment.');
        if (week >= 9 && week <= 13) care.push('Ask about first-trimester screening and any early ultrasound plan.');
        if (week >= 18 && week <= 22) care.push('Prepare questions for the anatomy scan.');
        if (week >= 24 && week <= 28) care.push('Ask about gestational diabetes screening timing or results.');
        if (week >= 27 && week <= 32) care.push('Learn your baby normal movement pattern and ask how your clinic wants changes reported.');
        if (week >= 32 && week <= 35) care.push('Review birth preferences, support person, and transport plans.');
        if (week >= 36 && week <= 37) care.push('Ask about group B strep screening and baby position.');
        if (week >= 38) care.push('Review when to call or go in for labor, leaking fluid, or reduced movement.');
        if (!care.length) care.push('Keep your routine visit schedule and write down new symptoms or questions.');

        return {
            week,
            trimester,
            size,
            title: `Week ${week} ${trimester.full.toLowerCase()} plan`,
            subtitle: `Focused suggestions for week ${week} only. Baby size cue: ${size}.`,
            sections: [
                { key: 'movement', label: 'Exercises', detail: early ? 'Gentle energy support' : late ? 'Comfort and birth prep' : 'Low-impact strength and stamina', items: movement },
                { key: 'food', label: 'Foods to eat', detail: early ? 'Nausea-friendly nutrition' : late ? 'Steady fuel and recovery prep' : 'Balanced growth support', items: food },
                { key: 'sleep', label: 'Sleep position', detail: early ? 'Rest and symptom relief' : 'Side-sleeping comfort', items: sleep },
                { key: 'care', label: 'Care reminders', detail: 'Appointments and questions', items: care },
                { key: 'safety', label: 'Call urgently for', detail: 'Do not wait on these symptoms', urgent: true, items: buildLocalWeekGuide(week).warnings }
            ]
        };
    }

    function renderWeekList(id, items = []) {
        const target = document.getElementById(id);
        if (!target) return;
        target.innerHTML = items.map(item => `<li>${escapeHTML(item)}</li>`).join('');
    }

    function applyMongoGuide(localGuide, guide = {}) {
        if (!guide || typeof guide !== 'object') return localGuide;
        return {
            ...localGuide,
            title: guide.title ? `Week ${localGuide.week}: ${guide.title}` : localGuide.title,
            intro: guide.babyDevelopment || localGuide.intro,
            baby: guide.babyDevelopment ? [guide.babyDevelopment, ...localGuide.baby.slice(1)] : localGuide.baby,
            mother: Array.isArray(guide.motherChanges) && guide.motherChanges.length ? guide.motherChanges : localGuide.mother,
            care: Array.isArray(guide.tips) && guide.tips.length ? guide.tips : localGuide.care,
            warnings: Array.isArray(guide.dangerAlerts) && guide.dangerAlerts.length ? guide.dangerAlerts : localGuide.warnings
        };
    }

    function renderPregnancyWeekGuide(guide) {
        const visual = getWeekVisual(guide.week);
        setElementText('pregnancyWeekCurrent', String(guide.week));
        setElementText('pregnancyWeekTrimester', guide.trimester.label);
        setElementText('pregnancyWeekSize', guide.size);
        setElementText('pregnancyWeekTitle', guide.title);
        setElementText('pregnancyWeekIntro', guide.intro);
        setElementText('pregnancyWeekImageNote', visual.note);
        const image = document.getElementById('pregnancyWeekImage');
        if (image) {
            image.src = visual.src;
            image.alt = `Pregnancy week ${guide.week} visual`;
        }
        renderWeekList('pregnancyWeekBabyList', guide.baby);
        renderWeekList('pregnancyWeekMotherList', guide.mother);
        renderWeekList('pregnancyWeekCareList', guide.care);
        renderWeekList('pregnancyWeekQuestionList', guide.questions);
        renderWeekList('pregnancyWeekWarningList', guide.warnings);
        document.querySelectorAll('#pregnancyWeekButtons button').forEach(button => {
            button.classList.toggle('active', Number(button.dataset.week) === guide.week);
        });
    }

    async function selectPregnancyWeek(weekInput, options = {}) {
        const week = clampWeek(weekInput);
        const range = document.getElementById('pregnancyWeekRange');
        const number = document.getElementById('pregnancyWeekNumber');
        if (range) range.value = String(week);
        if (number) number.value = String(week);
        ['pregnancySymptomWeek', 'pregnancyReminderWeek'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = String(week);
        });
        renderPregnancyWeekGuide(buildLocalWeekGuide(week));

        if (options.skipMongo) return;
        try {
            const response = await fetchPregnancyRag(`/api/pregnancy-rag/week/${week}`);
            if (!response.ok) return;
            const data = await readJson(response);
            if (data.success === false || !data.guide) return;
            renderPregnancyWeekGuide(applyMongoGuide(buildLocalWeekGuide(week), data.guide));
        } catch {
            // Local week guide stays visible if the backend does not have a record for this week.
        }
    }

    function initializePregnancyWeekTracker() {
        const buttons = document.getElementById('pregnancyWeekButtons');
        const range = document.getElementById('pregnancyWeekRange');
        const number = document.getElementById('pregnancyWeekNumber');
        const sync = document.getElementById('pregnancyWeekSyncVitals');
        if (!buttons || buttons.dataset.ready === 'true') return;

        buttons.dataset.ready = 'true';
        buttons.innerHTML = Array.from({ length: 42 }, (_, index) => {
            const week = index + 1;
            return `<button type="button" data-week="${week}" aria-label="View pregnancy week ${week}">Week ${week}</button>`;
        }).join('');

        buttons.addEventListener('click', event => {
            const button = event.target.closest('button[data-week]');
            if (!button) return;
            selectPregnancyWeek(button.dataset.week);
        });
        range?.addEventListener('input', () => selectPregnancyWeek(range.value, { skipMongo: true }));
        range?.addEventListener('change', () => selectPregnancyWeek(range.value));
        number?.addEventListener('change', () => selectPregnancyWeek(number.value));
        sync?.addEventListener('click', () => {
            const week = clampWeek(number?.value || range?.value);
            const vitalsWeek = document.getElementById('pregnancyDecisionWeek');
            if (vitalsWeek) {
                vitalsWeek.value = String(week);
                vitalsWeek.focus();
            }
        });

        selectPregnancyWeek(number?.value || range?.value || 24);
    }

    function setAnswer(html, tone = '') {
        const answer = document.getElementById('pregnancyRagAnswer');
        if (!answer) return;
        answer.className = `pregnancy-rag-answer ${tone}`.trim();
        answer.innerHTML = html;
    }

    function renderSources(matches = []) {
        if (!matches.length) {
            return '';
        }

        return `
            <div class="pregnancy-rag-source-list">
                ${matches.slice(0, 6).map(match => `
                    <div class="pregnancy-rag-source">
                        <span>${escapeHTML(match.collection || 'knowledge')}</span>
                        <div>
                            <strong>${escapeHTML(match.title || 'Retrieved record')}</strong>
                            ${(match.category || match.severity || match.sourceOrganization || match.dataset || match.pageStart) ? `
                                <div class="pregnancy-rag-source-badges">
                                    ${match.category ? `<em>${escapeHTML(match.category)}</em>` : ''}
                                    ${match.severity ? `<em>${escapeHTML(match.severity)}</em>` : ''}
                                    ${match.sourceOrganization ? `<em>${escapeHTML(match.sourceOrganization)}</em>` : ''}
                                    ${match.dataset ? `<em>${escapeHTML(match.dataset)}</em>` : ''}
                                    ${match.pageStart ? `<em>page ${escapeHTML(match.pageStart)}</em>` : ''}
                                </div>
                            ` : ''}
                        </div>
                        ${match.source ? `<a href="${escapeHTML(match.source)}" target="_blank" rel="noopener">Source</a>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    function riskLabelClass(riskClass = '') {
        const normalized = String(riskClass || '').toLowerCase();
        if (normalized.includes('high')) return 'high';
        if (normalized.includes('mid')) return 'mid';
        return 'low';
    }

    function renderDecisionRecords(records = []) {
        if (!records.length) {
            return '<p class="pregnancy-rag-muted">No nearby maternal risk records were returned.</p>';
        }

        return `
            <div class="pregnancy-decision-records">
                ${records.slice(0, 5).map(record => `
                    <article class="pregnancy-decision-record">
                        <div>
                            <strong>${escapeHTML(record.title || 'maternal risk record')}</strong>
                            <span>${escapeHTML(record.riskLevel || 'risk level')} · distance ${escapeHTML(record.distance ?? '')}</span>
                        </div>
                        <p>${escapeHTML(record.summary || '')}</p>
                        <dl>
                            <div><dt>BP</dt><dd>${escapeHTML(record.measurements?.systolicBP || '')}/${escapeHTML(record.measurements?.diastolicBP || '')}</dd></div>
                            <div><dt>BS</dt><dd>${escapeHTML(record.measurements?.bloodSugar || '')}</dd></div>
                            <div><dt>HR</dt><dd>${escapeHTML(record.measurements?.heartRate || '')}</dd></div>
                            <div><dt>BMI</dt><dd>${escapeHTML(record.measurements?.bmi ?? '')}</dd></div>
                            <div><dt>Comp</dt><dd>${Number(record.measurements?.previousComplications) ? 'Yes' : 'No'}</dd></div>
                            <div><dt>GDM</dt><dd>${Number(record.measurements?.gestationalDiabetes) ? 'Yes' : 'No'}</dd></div>
                        </dl>
                    </article>
                `).join('')}
            </div>
        `;
    }

    function renderDecisionGuidelines(matches = []) {
        if (!matches.length) {
            return '<p class="pregnancy-rag-muted">No CDC/WHO guideline records matched the symptom text.</p>';
        }

        return `
            <div class="pregnancy-rag-source-list">
                ${matches.slice(0, 6).map(match => `
                    <div class="pregnancy-rag-source">
                        <span>${escapeHTML(match.collection || 'guideline')}</span>
                        <div>
                            <strong>${escapeHTML(match.title || 'Matched guideline')}</strong>
                            <p>${escapeHTML(match.text || '')}</p>
                            <div class="pregnancy-rag-source-badges">
                                ${match.category ? `<em>${escapeHTML(match.category)}</em>` : ''}
                                ${match.sourceOrganization ? `<em>${escapeHTML(match.sourceOrganization)}</em>` : ''}
                                ${match.pageStart ? `<em>page ${escapeHTML(match.pageStart)}</em>` : ''}
                            </div>
                        </div>
                        ${match.source ? `<a href="${escapeHTML(match.source)}" target="_blank" rel="noopener">Source</a>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    function formatPercent(value) {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) return '0%';
        return `${Math.round(Math.max(0, Math.min(1, numeric)) * 100)}%`;
    }

    function formatConfidence(value) {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) return 'Legacy';
        return formatPercent(numeric);
    }

    function setElementText(id, text) {
        const element = document.getElementById(id);
        if (element) element.textContent = text;
    }

    function updateTensorflowStatus(text, dashboardText = '') {
        setElementText('pregnancyTensorflowStatus', text);
        if (dashboardText) {
            setElementText('pregnancyTfDashboardStatus', dashboardText);
        }
    }

    function renderTensorflowTrainingSummary(training = {}) {
        const target = document.getElementById('pregnancyTensorflowTrainingSummary');
        const samples = Number(training.trainingSamples || training.samples?.length || 0);
        const total = Number(training.totalRecords || 0);
        const features = training.featureNames || TF_FEATURE_NAMES;
        const modelText = state.tfLastPrediction ? 'Prediction ready' : 'Saved model ready';

        setElementText('pregnancyTfRecordCount', `${samples || total || 0} samples`);
        updateTensorflowStatus(modelText, state.tfLastPrediction ? 'Prediction ready' : 'Ready for score');

        if (!target) return;
        target.innerHTML = '';
    }

    async function loadTensorFlowScript() {
        if (window.tf) return window.tf;
        if (state.tfScriptPromise) return state.tfScriptPromise;

        updateTensorflowStatus('Loading TensorFlow.js', 'Preparing model');
        state.tfScriptPromise = new Promise((resolve, reject) => {
            const existing = document.querySelector('script[data-mamasafe-tfjs="true"]');
            if (existing) {
                existing.addEventListener('load', () => resolve(window.tf));
                existing.addEventListener('error', () => reject(new Error('TensorFlow.js could not be loaded.')));
                return;
            }

            const script = document.createElement('script');
            script.src = TENSORFLOW_SCRIPT_URL;
            script.async = true;
            script.dataset.mamasafeTfjs = 'true';
            script.onload = () => window.tf ? resolve(window.tf) : reject(new Error('TensorFlow.js loaded without a tf runtime.'));
            script.onerror = () => reject(new Error('Local TensorFlow.js runtime could not be loaded from vendor/tfjs/tf.min.js.'));
            document.head.appendChild(script);
        });

        return state.tfScriptPromise;
    }

    async function loadPregnancyTensorflowTrainingData() {
        if (state.tfTrainingData) return state.tfTrainingData;
        if (state.tfTrainingPromise) return state.tfTrainingPromise;

        const target = document.getElementById('pregnancyTensorflowTrainingSummary');
        if (target) {
            target.textContent = 'Loading TensorFlow.js training dataset...';
        }

        state.tfTrainingPromise = (async () => {
            const response = await fetchPregnancyRag('/api/pregnancy-rag/tensorflow/training-data?limit=1600');
            const data = await readJson(response);
            if (!response.ok || data.success === false) {
                throw new Error(data.error || data.details || `Request failed (${response.status})`);
            }
            const training = data.training || data;
            state.tfTrainingData = training;
            renderTensorflowTrainingSummary(training);
            return training;
        })();

        try {
            return await state.tfTrainingPromise;
        } catch (error) {
            state.tfTrainingPromise = null;
            updateTensorflowStatus('Dataset load failed', 'Backend fallback');
            if (target) {
                target.innerHTML = `<strong>Could not load TensorFlow.js training samples.</strong><p>${escapeHTML(error.message)}</p>`;
            }
            throw error;
        }
    }

    function numberFromPayload(payload = {}, feature) {
        const aliases = {
            systolicBP: 'systolic',
            diastolicBP: 'diastolic',
            bloodSugar: 'glucose',
            bodyTemp: 'temp'
        };
        const value = payload[feature] ?? payload[aliases[feature]];
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : 0;
    }

    function normalizeForTensorflow(value, range = {}) {
        const numeric = Number(value);
        const min = Number(range.min);
        const max = Number(range.max);
        if (!Number.isFinite(numeric)) return 0;
        if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
            return Math.max(0, Math.min(1, numeric));
        }
        return Math.max(0, Math.min(1, (numeric - min) / (max - min)));
    }

    function buildPayloadFeatureVector(payload = {}, training = {}) {
        const ranges = training.featureRanges || {};
        return (training.featureNames || TF_FEATURE_NAMES).map(feature => normalizeForTensorflow(
            numberFromPayload(payload, feature),
            ranges[feature]
        ));
    }

    async function trainPregnancyTensorflowModel() {
        if (state.tfModel) return state.tfModel;
        if (state.tfModelPromise) return state.tfModelPromise;

        state.tfModelPromise = (async () => {
            const [tf, training] = await Promise.all([
                loadTensorFlowScript(),
                loadPregnancyTensorflowTrainingData()
            ]);
            const samples = (training.samples || []).filter(sample => Array.isArray(sample.features) && Number.isInteger(sample.labelIndex));
            if (samples.length < 10) {
                throw new Error('Not enough training samples for TensorFlow.js.');
            }

            updateTensorflowStatus('Training TensorFlow.js', 'Learning patterns');
            const xs = tf.tensor2d(samples.map(sample => sample.features), [samples.length, (training.featureNames || TF_FEATURE_NAMES).length]);
            const labelTensor = tf.tensor1d(samples.map(sample => sample.labelIndex), 'int32');
            const ys = tf.oneHot(labelTensor, TF_LABELS.length);
            labelTensor.dispose();

            const model = tf.sequential();
            model.add(tf.layers.dense({ inputShape: [(training.featureNames || TF_FEATURE_NAMES).length], units: 18, activation: 'relu' }));
            model.add(tf.layers.dropout({ rate: 0.12 }));
            model.add(tf.layers.dense({ units: 10, activation: 'relu' }));
            model.add(tf.layers.dense({ units: TF_LABELS.length, activation: 'softmax' }));
            model.compile({
                optimizer: tf.train.adam(0.018),
                loss: 'categoricalCrossentropy',
                metrics: ['accuracy']
            });

            const epochs = 22;
            const history = await model.fit(xs, ys, {
                epochs,
                batchSize: 32,
                shuffle: true,
                validationSplit: 0.15,
                callbacks: {
                    onEpochEnd: async (epoch, logs = {}) => {
                        const accuracy = logs.acc ?? logs.accuracy ?? 0;
                        updateTensorflowStatus(`Training ${epoch + 1}/${epochs} - ${formatPercent(accuracy)}`, 'Learning patterns');
                        if (tf.nextFrame) await tf.nextFrame();
                    }
                }
            });

            xs.dispose();
            ys.dispose();

            const accuracyHistory = history.history.accuracy || history.history.acc || [];
            const lossHistory = history.history.loss || [];
            state.tfMetrics = {
                epochs,
                accuracy: Number(accuracyHistory[accuracyHistory.length - 1] || 0),
                loss: Number(lossHistory[lossHistory.length - 1] || 0)
            };
            state.tfModel = model;
            updateTensorflowStatus(`Trained - ${formatPercent(state.tfMetrics.accuracy)}`, 'Ready for score');
            renderTensorflowTrainingSummary(training);
            return model;
        })();

        try {
            return await state.tfModelPromise;
        } catch (error) {
            state.tfModelPromise = null;
            updateTensorflowStatus('TensorFlow.js unavailable', 'Backend fallback');
            throw error;
        }
    }

    async function predictPregnancyTensorflow(payload = {}) {
        const tf = await loadTensorFlowScript();
        const [model, training] = await Promise.all([
            trainPregnancyTensorflowModel(),
            loadPregnancyTensorflowTrainingData()
        ]);

        const vector = buildPayloadFeatureVector(payload, training);
        const inputTensor = tf.tensor2d([vector], [1, vector.length]);
        const outputTensor = model.predict(inputTensor);
        const probabilities = Array.from(await outputTensor.data()).map(value => Number(value) || 0);
        inputTensor.dispose();
        outputTensor.dispose();

        let maxIndex = 0;
        probabilities.forEach((value, index) => {
            if (value > probabilities[maxIndex]) maxIndex = index;
        });

        const rawDistribution = {
            lowRisk: probabilities[0] || 0,
            midRisk: probabilities[1] || 0,
            highRisk: probabilities[2] || 0
        };
        const prediction = {
            model: training.model || 'tensorflowjs-maternal-risk-classifier',
            runtime: 'browser',
            sourceCollection: training.sourceCollection || 'maternal_health_risk_records',
            trainedRecords: training.trainingSamples || training.recordsSampled || 0,
            epochs: state.tfMetrics?.epochs || 0,
            accuracy: state.tfMetrics?.accuracy || 0,
            prediction: TF_LABELS[maxIndex] || 'low risk',
            confidenceScore: probabilities[maxIndex] || 0,
            rawDistribution,
            featureNames: training.featureNames || TF_FEATURE_NAMES
        };

        state.tfLastPrediction = prediction;
        updateTensorflowStatus(`Predicted ${prediction.prediction}`, `${formatPercent(prediction.confidenceScore)} confidence`);
        renderTensorflowTrainingSummary(training);
        return prediction;
    }

    function probabilityKeyForRiskLabel(label = '') {
        const normalized = String(label).toLowerCase();
        if (normalized.includes('high')) return 'highRisk';
        if (normalized.includes('mid') || normalized.includes('medium')) return 'midRisk';
        return 'lowRisk';
    }

    function clampProbability(value, fallback = 0) {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) return fallback;
        const scaled = numeric > 1 ? numeric / 100 : numeric;
        return Math.max(0, Math.min(1, scaled));
    }

    function normalizeTensorflowDistribution(raw = {}, prediction = 'low risk', confidenceScore = 0) {
        const distribution = {
            lowRisk: clampProbability(raw.lowRisk ?? raw.low ?? raw['low risk']),
            midRisk: clampProbability(raw.midRisk ?? raw.mid ?? raw.medium ?? raw['mid risk'] ?? raw['medium risk']),
            highRisk: clampProbability(raw.highRisk ?? raw.high ?? raw['high risk'])
        };

        if (distribution.lowRisk || distribution.midRisk || distribution.highRisk) {
            return distribution;
        }

        const winningKey = probabilityKeyForRiskLabel(prediction);
        const confidence = clampProbability(confidenceScore, 0.8);
        const remainder = Math.max(0, 1 - confidence);
        distribution.lowRisk = remainder / 2;
        distribution.midRisk = remainder / 2;
        distribution.highRisk = remainder / 2;
        distribution[winningKey] = confidence;
        return distribution;
    }

    function normalizeBackendTensorflowPrediction(data = {}) {
        const details = data.details || data;
        const prediction = data.prediction || details.prediction || data.riskLevel || details.riskLevel || 'low risk';
        const raw = data.rawDistribution || details.rawDistribution || data.probabilities || details.probabilities || {};
        const confidenceSource = data.confidenceScore ?? details.confidenceScore;
        const rawDistribution = normalizeTensorflowDistribution(raw, prediction, confidenceSource);
        const confidenceScore = Number.isFinite(Number(confidenceSource))
            ? clampProbability(confidenceSource)
            : rawDistribution[probabilityKeyForRiskLabel(prediction)];

        return {
            model: data.model || details.model || 'mamasafe-maternal-risk-custom-ai',
            runtime: data.runtime || details.runtime || 'backend @tensorflow/tfjs',
            sourceCollection: data.sourceCollection || details.sourceCollection || 'maternal_health_risk_records',
            trainedRecords: data.trainedRecords || details.trainedRecords || null,
            epochs: data.epochs || details.epochs || null,
            accuracy: data.accuracy || details.accuracy || null,
            prediction,
            confidenceScore,
            rawDistribution,
            featureNames: data.featureNames || details.featureNames || TF_FEATURE_NAMES,
            backend: data.backend || details.backend || 'cpu',
            trainedAt: data.trainedAt || details.trainedAt || '',
            fallbackSource: 'backend-saved-tensorflow-model'
        };
    }

    async function predictPregnancyTensorflowWithFallback(payload = {}) {
        try {
            const backendPrediction = await predictPregnancyCustomAi(payload);
            const normalized = normalizeBackendTensorflowPrediction(backendPrediction);
            state.tfLastPrediction = normalized;
            updateTensorflowStatus(`Saved TFJS model predicted ${normalized.prediction}`, `${formatPercent(normalized.confidenceScore)} confidence`);
            return normalized;
        } catch (backendError) {
            console.warn('Backend saved TensorFlow.js model unavailable; trying browser TensorFlow.js fallback:', backendError);
            updateTensorflowStatus('Saved TFJS unavailable', 'Trying browser fallback');

            try {
                return await predictPregnancyTensorflow(payload);
            } catch (browserError) {
                const message = `${backendError.message || backendError}; browser TensorFlow also failed: ${browserError.message || browserError}`;
                throw new Error(message);
            }
        }
    }

    function riskRatingText(value = '') {
        const tone = riskLabelClass(value);
        if (tone === 'high') return 'High';
        if (tone === 'mid') return 'Mid';
        return 'Low';
    }

    function getAssessmentAiRisk(evaluation = {}) {
        return evaluation.aiRisk || evaluation.llamaRisk || evaluation.transformerRisk || {};
    }

    function getAssessmentAiModel(evaluation = {}, data = {}) {
        const aiRisk = getAssessmentAiRisk(evaluation);
        const tfjs = evaluation.tfjsPrediction || data.tfjsPrediction || {};
        if (evaluation.tensorflowUsed || data.tensorflowUsed || tfjs.prediction) {
            return {
                label: tfjs.model === 'mamasafe-unified-health-ai-v2'
                    ? 'Unified Health TensorFlow.js Model'
                    : 'Maternal Risk TensorFlow.js Model',
                model: tfjs.model || evaluation.model || data.model || 'mamasafe-maternal-risk-custom-ai'
            };
        }
        const meta = evaluation.aiModel || data.aiModel || aiRisk.aiModel || {};
        const displayName = meta.displayName || 'Maternal Risk TensorFlow.js Model';
        const provider = meta.providerLabel || 'TensorFlow.js';
        const model = meta.model || aiRisk.model || evaluation.model || data.model || 'mamasafe-maternal-risk-custom-ai';
        return {
            label: provider && !String(displayName).toLowerCase().includes(String(provider).toLowerCase())
                ? `${displayName} (${provider})`
                : displayName,
            model
        };
    }

    function getUnifiedAiStructureLabel() {
        return 'Maternal-risk AI';
    }

    function renderRiskProbabilityBars(distribution = {}, prediction = '', confidenceScore = null) {
        const rows = [
            { key: 'highRisk', label: 'High risk', tone: 'high' },
            { key: 'midRisk', label: 'Mid risk', tone: 'mid' },
            { key: 'lowRisk', label: 'Low risk', tone: 'low' }
        ];
        const predictionText = String(prediction || '').toLowerCase();
        const predictedKey = predictionText.includes('high')
            ? 'highRisk'
            : predictionText.includes('mid') ? 'midRisk' : 'lowRisk';

        return `
            <section class="pregnancy-risk-probability" aria-label="Risk probability distribution">
                <div class="pregnancy-risk-probability-head">
                    <div>
                        <span>Risk probability</span>
                        <strong>${escapeHTML(prediction || 'Risk pending')}</strong>
                    </div>
                    <div>
                        <span>Confidence</span>
                        <strong>${formatPercent(confidenceScore ?? distribution[predictedKey])}</strong>
                    </div>
                </div>
                <div class="pregnancy-risk-probability-bars">
                    ${rows.map(row => {
                        const percent = formatPercent(distribution[row.key]);
                        return `
                            <div class="pregnancy-risk-probability-row ${row.tone}${row.key === predictedKey ? ' active' : ''}">
                                <span>${row.label}</span>
                                <div><i style="width: ${percent};"></i></div>
                                <strong>${percent}</strong>
                            </div>
                        `;
                    }).join('')}
                </div>
            </section>
        `;
    }

    function riskRankValue(value = '') {
        const tone = riskLabelClass(value);
        if (tone === 'high') return 3;
        if (tone === 'mid') return 2;
        return 1;
    }

    function riskDistribution(tone = 'low', confidence = 0.72) {
        const safe = Math.max(0.05, Math.min(0.97, Number(confidence) || 0.72));
        if (tone === 'high') {
            return {
                highRisk: safe,
                midRisk: Number(((1 - safe) * 0.72).toFixed(4)),
                lowRisk: Number(((1 - safe) * 0.28).toFixed(4))
            };
        }
        if (tone === 'mid') {
            return {
                highRisk: Number(((1 - safe) * 0.34).toFixed(4)),
                midRisk: safe,
                lowRisk: Number(((1 - safe) * 0.66).toFixed(4))
            };
        }
        return {
            highRisk: Number(((1 - safe) * 0.18).toFixed(4)),
            midRisk: Number(((1 - safe) * 0.44).toFixed(4)),
            lowRisk: safe
        };
    }

    function buildClientSymptomRiskAssessment(symptoms = '', context = {}) {
        const text = String(symptoms || '').trim().toLowerCase();
        const metrics = context.metrics || context || {};
        const numberValue = (...values) => {
            for (const value of values) {
                const numeric = Number(value);
                if (Number.isFinite(numeric)) return numeric;
            }
            return null;
        };
        const binaryValue = (...values) => {
            for (const value of values) {
                const normalized = String(value ?? '').trim().toLowerCase();
                if (['1', 'yes', 'true', 'y', 'preexisting', 'gestational'].includes(normalized)) return 1;
                if (['0', 'no', 'false', 'n', 'none'].includes(normalized)) return 0;
                const numeric = Number(normalized);
                if (Number.isFinite(numeric)) return numeric > 0 ? 1 : 0;
            }
            return 0;
        };
        const contextMetrics = {
            age: numberValue(metrics.age),
            systolicBP: numberValue(metrics.systolicBP, metrics.systolic),
            diastolicBP: numberValue(metrics.diastolicBP, metrics.diastolic),
            bloodSugar: numberValue(metrics.bloodSugar, metrics.glucose),
            bodyTemp: numberValue(metrics.bodyTemp, metrics.temp),
            heartRate: numberValue(metrics.heartRate),
            previousComplications: binaryValue(metrics.previousComplications),
            preexistingDiabetes: binaryValue(metrics.preexistingDiabetes),
            gestationalDiabetes: binaryValue(metrics.gestationalDiabetes),
            mentalHealth: binaryValue(metrics.mentalHealth)
        };
        const makeItem = ({ symptom, riskClass = 'mid', confidenceScore = 0.62, score = 62, reason, action }) => {
            const distribution = riskDistribution(riskClass, confidenceScore);
            return {
                symptom,
                riskClass,
                riskLevel: `${riskClass} risk`,
                score,
                confidenceScore,
                rawDistribution: distribution,
                reason,
                actionLabel: action,
                suggestions: [
                    action,
                    riskClass === 'high'
                        ? 'Do not wait if this is happening now or symptoms are worsening.'
                        : 'Seek urgent care if bleeding, fluid leaking, fainting, chest pain, trouble breathing, severe headache, vision changes, severe belly pain, or reduced baby movement appears.'
                ],
                datasetEvidence: []
            };
        };
        const contextItems = [];
        const addContextItem = item => contextItems.push(makeItem(item));

        if (contextMetrics.previousComplications === 1) {
            addContextItem({
                symptom: 'previous pregnancy complications',
                riskClass: 'high',
                confidenceScore: 0.86,
                score: 88,
                reason: 'Previous pregnancy complications increase the need for clinician review even if the current symptom text is mild or empty.',
                action: 'Contact your antenatal clinician for individualized follow-up and keep urgent care available if symptoms worsen.'
            });
        }
        if (contextMetrics.gestationalDiabetes === 1) {
            const elevated = contextMetrics.bloodSugar !== null && contextMetrics.bloodSugar >= 7.8;
            addContextItem({
                symptom: 'gestational diabetes history',
                riskClass: elevated ? 'high' : 'mid',
                confidenceScore: elevated ? 0.84 : 0.68,
                score: elevated ? 86 : 68,
                reason: elevated
                    ? 'Gestational diabetes with elevated blood sugar raises pregnancy risk and should be reviewed promptly.'
                    : 'Gestational diabetes history needs regular glucose tracking and antenatal follow-up.',
                action: elevated
                    ? 'Contact your clinician soon for glucose guidance and seek urgent care if you feel very unwell.'
                    : 'Keep glucose checks, meals, medications if prescribed, and antenatal appointments on schedule.'
            });
        }
        if (contextMetrics.preexistingDiabetes === 1) {
            addContextItem({
                symptom: 'preexisting diabetes history',
                riskClass: contextMetrics.bloodSugar !== null && contextMetrics.bloodSugar >= 7.8 ? 'high' : 'mid',
                confidenceScore: contextMetrics.bloodSugar !== null && contextMetrics.bloodSugar >= 7.8 ? 0.84 : 0.7,
                score: contextMetrics.bloodSugar !== null && contextMetrics.bloodSugar >= 7.8 ? 86 : 70,
                reason: 'Preexisting diabetes can raise pregnancy risk and needs regular clinician-guided monitoring.',
                action: 'Follow your diabetes and antenatal care plan, and contact your clinician if glucose readings are high or symptoms change.'
            });
        }
        if (contextMetrics.mentalHealth === 1) {
            addContextItem({
                symptom: 'mental health support flag',
                riskClass: 'mid',
                confidenceScore: 0.64,
                score: 64,
                reason: 'A mental-health flag means support planning is part of the pregnancy risk picture.',
                action: 'Reach out to your clinician, counsellor, or trusted support person if mood, anxiety, sleep, or safety concerns are present.'
            });
        }
        if (contextMetrics.systolicBP >= 140 || contextMetrics.diastolicBP >= 90) {
            addContextItem({
                symptom: 'high blood pressure reading',
                riskClass: 'high',
                confidenceScore: 0.9,
                score: 90,
                reason: 'Blood pressure at or above 140/90 in pregnancy can be a warning pattern and needs clinical review.',
                action: 'Contact maternity care urgently, especially if headache, vision changes, swelling, chest pain, or belly pain is present.'
            });
        }
        if (contextMetrics.bodyTemp >= 100.4) {
            addContextItem({
                symptom: 'fever',
                riskClass: 'high',
                confidenceScore: 0.84,
                score: 84,
                reason: 'Fever in pregnancy can indicate infection and should not be ignored.',
                action: 'Contact your clinician or urgent care today, especially if fever is persistent or with pain, weakness, or reduced movement.'
            });
        }
        if (contextMetrics.heartRate >= 120 || (contextMetrics.heartRate !== null && contextMetrics.heartRate < 50)) {
            addContextItem({
                symptom: 'abnormal heart rate',
                riskClass: 'high',
                confidenceScore: 0.84,
                score: 84,
                reason: 'A very high or unusually low heart rate can be concerning in pregnancy.',
                action: 'Seek urgent advice, especially if there is chest pain, trouble breathing, fainting, or severe weakness.'
            });
        }

        const rules = [
            {
                symptom: 'bleeding',
                riskClass: 'high',
                confidenceScore: 0.88,
                score: 96,
                pattern: /\b(bleeding|blood|clots?|spotting with pain)\b/i,
                reason: 'Bleeding during pregnancy can be a warning sign and needs urgent assessment.',
                action: 'Go to hospital or urgent maternity care now if bleeding is happening.'
            },
            {
                symptom: 'fluid leaking',
                riskClass: 'high',
                confidenceScore: 0.86,
                score: 94,
                pattern: /\b(fluid leaking|leaking fluid|water broke|waters broke|gush of fluid)\b/i,
                reason: 'Fluid leaking may mean membranes have ruptured and needs maternity assessment.',
                action: 'Contact your maternity unit or go to urgent care now.'
            },
            {
                symptom: 'chest pain or trouble breathing',
                riskClass: 'high',
                confidenceScore: 0.9,
                score: 95,
                pattern: /\b(chest pain|trouble breathing|difficulty breathing|shortness of breath|cannot breathe|can't breathe|breathless)\b/i,
                reason: 'Chest pain or trouble breathing can be an emergency warning sign in pregnancy.',
                action: 'Seek emergency care now.'
            },
            {
                symptom: 'severe headache or vision changes',
                riskClass: 'high',
                confidenceScore: 0.86,
                score: 93,
                pattern: /\b(severe headache|worst headache|vision changes?|blurred vision|seeing spots|flashing lights)\b/i,
                reason: 'Severe headache or vision changes can be warning signs of high blood pressure or preeclampsia.',
                action: 'Contact maternity care or emergency care now.'
            },
            {
                symptom: 'reduced baby movement',
                riskClass: 'high',
                confidenceScore: 0.86,
                score: 92,
                pattern: /\b(reduced baby movement|less movement|no movement|baby not moving|decreased fetal movement|kicks? stopped)\b/i,
                reason: 'Reduced baby movement needs same-day maternity assessment.',
                action: 'Contact your maternity unit now.'
            },
            {
                symptom: 'fainting or seizure',
                riskClass: 'high',
                confidenceScore: 0.91,
                score: 97,
                pattern: /\b(fainting|fainted|passed out|loss of consciousness|seizure|convulsion)\b/i,
                reason: 'Fainting, seizure, or loss of consciousness is urgent in pregnancy.',
                action: 'Call emergency services or go to emergency care now.'
            },
            {
                symptom: 'dizziness or weakness',
                riskClass: 'mid',
                confidenceScore: 0.68,
                score: 66,
                pattern: /\b(dizzy|dizziness|dizy|deezy|lightheaded|light headed|weak|too weak|very weak|exhausted|too tired|fatigue)\b/i,
                reason: 'Dizziness or weakness may come from dehydration, anemia, infection, blood pressure, or blood sugar changes.',
                action: 'Rest, drink fluids, and contact your clinician if it is strong, new, persistent, or worsening.'
            },
            {
                symptom: 'vomiting or dehydration',
                riskClass: 'mid',
                confidenceScore: 0.7,
                score: 70,
                pattern: /\b(vomiting|vomit|cannot keep fluids|can't keep fluids|dehydrated|dehydration|not drinking|cannot drink|can't drink)\b/i,
                reason: 'Vomiting or dehydration can become risky if fluids cannot stay down.',
                action: 'Sip fluids and call your clinician if vomiting continues or fluids cannot stay down.'
            },
            {
                symptom: 'high fever',
                riskClass: 'high',
                confidenceScore: 0.88,
                score: 88,
                pattern: /\b(high fever|very high fever|fever is high|temperature (?:is )?(?:high|very high)|fever (?:of|over|above) ?(?:38|39|40|100\.4|101|102|103|104))\b/i,
                reason: 'High fever during pregnancy can signal infection or another problem that needs urgent clinical advice.',
                action: 'Contact your clinician, maternity unit, or urgent care now, especially if fever is persistent, high, or you feel very unwell.'
            },
            {
                symptom: 'fever or chills',
                riskClass: 'high',
                confidenceScore: 0.82,
                score: 82,
                pattern: /\b(fever|high temperature|chills|too cold|very cold|shivering)\b/i,
                reason: 'Fever, chills, or feeling very cold during pregnancy can signal infection or another problem that needs urgent clinical advice.',
                action: 'Contact your clinician, maternity unit, or urgent care today, especially if fever is persistent or you feel very unwell.'
            },
            {
                symptom: 'swelling',
                riskClass: 'mid',
                confidenceScore: 0.66,
                score: 66,
                pattern: /\b(swelling|swollen|puffy face|face swelling|hands swelling|severe swelling)\b/i,
                reason: 'Swelling can be common, but sudden or severe swelling can be a warning sign.',
                action: 'Contact your clinician if swelling is sudden, severe, or with headache or vision changes.'
            },
            {
                symptom: 'weight gain',
                riskClass: 'low',
                confidenceScore: 0.74,
                score: 34,
                pattern: /\b(gaining weight|weight gain|gained weight|body weight increasing)\b/i,
                reason: 'Gradual weight gain can be expected in pregnancy.',
                action: 'Track weight weekly and contact your clinician if gain is sudden or with swelling, headache, or vision changes.'
            },
            {
                symptom: 'nausea or morning sickness',
                riskClass: 'low',
                confidenceScore: 0.72,
                score: 38,
                pattern: /\b(nausea|morning sickness|queasy)\b/i,
                reason: 'Mild nausea is common in pregnancy, especially early pregnancy.',
                action: 'Try small frequent meals and fluids; contact your clinician if severe or fluids cannot stay down.'
            }
        ];

        const textMatch = text
            ? (rules.find(rule => rule.pattern.test(text)) || {
                symptom: text.replace(/\b(i am|i'm|im|i feel|feeling|having|have|my|very|really)\b/g, ' ').replace(/\s+/g, ' ').trim() || 'entered symptom',
                riskClass: /\b(severe|heavy|worst|cannot|can't|faint|bleeding|chest|breath|vision|fluid|movement)\b/i.test(text) ? 'high' : 'mid',
                confidenceScore: /\b(severe|heavy|worst|cannot|can't|faint|bleeding|chest|breath|vision|fluid|movement)\b/i.test(text) ? 0.82 : 0.58,
                score: /\b(severe|heavy|worst|cannot|can't|faint|bleeding|chest|breath|vision|fluid|movement)\b/i.test(text) ? 82 : 52,
                reason: 'MamaSafe did not find an exact built-in symptom phrase, so it rated the entered symptom conservatively.',
                action: 'Track when it started, severity, and what makes it better or worse; contact your clinician if it is new, persistent, worsening, or worrying.'
            })
            : null;
        const symptomItems = textMatch ? [makeItem({
            symptom: textMatch.symptom,
            riskClass: textMatch.riskClass,
            confidenceScore: textMatch.confidenceScore,
            score: textMatch.score,
            reason: textMatch.reason,
            action: textMatch.action
        })] : [];
        const items = [...symptomItems, ...contextItems];
        if (!items.length) return null;

        const highest = items.reduce((winner, item) => riskRankValue(item.riskClass) > riskRankValue(winner.riskClass) ? item : winner, items[0]);
        const riskClass = highest.riskClass;
        const riskLevel = `${riskClass} risk`;
        const confidenceScore = Math.max(...items.map(item => Number(item.confidenceScore) || 0), 0.55);
        const distribution = riskDistribution(riskClass, confidenceScore);
        const symptomAnalysis = {
            symptomsText: symptoms,
            items,
            contextItems,
            overallRiskClass: riskClass,
            overallRiskLevel: riskLevel,
            riskClass,
            riskLevel,
            prediction: riskLevel,
            confidenceScore,
            rawDistribution: distribution,
            accuracy: confidenceScore,
            accuracyLabel: `${formatPercent(confidenceScore)} live full-context confidence`,
            actionLabel: highest.actionLabel,
            adviceSummary: highest.actionLabel,
            aiDescription: highest.reason,
            source: 'frontend-live-full-maternal-context-fallback',
            probabilitySource: 'symptoms + vitals + pregnancy history'
        };
        return {
            model: 'Maternal-risk TensorFlow.js + symptom safety fallback',
            provider: 'mamasafe-ui-fallback',
            aiGenerated: false,
            groqUsed: false,
            riskClass,
            riskLevel,
            rating: riskLevel,
            prediction: riskLevel,
            confidenceScore,
            rawDistribution: distribution,
            urgent: riskClass === 'high',
            symptomDescription: highest.reason,
            whatToDo: [...new Set(items.map(item => item.actionLabel).filter(Boolean))].slice(0, 4),
            reasons: [...new Set(items.map(item => item.reason).filter(Boolean))].slice(0, 5),
            symptomAnalysis,
            source: 'frontend-live-full-maternal-context-fallback'
        };
    }

    function pickHigherRiskAssessment(serverAssessment = null, fallbackAssessment = null) {
        if (!serverAssessment) return fallbackAssessment;
        if (!fallbackAssessment) return serverAssessment;
        return riskRankValue(fallbackAssessment.riskClass || fallbackAssessment.riskLevel) > riskRankValue(serverAssessment.riskClass || serverAssessment.riskLevel)
            ? fallbackAssessment
            : serverAssessment;
    }

    function renderSymptomDistributionRows(distribution = {}) {
        const rows = [
            { key: 'highRisk', label: 'High', tone: 'high' },
            { key: 'midRisk', label: 'Mid', tone: 'mid' },
            { key: 'lowRisk', label: 'Low', tone: 'low' }
        ];

        return `
            <div class="pregnancy-symptom-risk-bars">
                ${rows.map(row => {
                    const value = Number(distribution[row.key] || 0);
                    return `
                        <div class="pregnancy-symptom-risk-bar ${row.tone}">
                            <span>${row.label}</span>
                            <div><i style="width: ${formatPercent(value)};"></i></div>
                            <strong>${formatPercent(value)}</strong>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    function renderCoreSymptomAnalysis(evaluation = {}) {
        return '';
    }

    function renderTensorflowPredictionCard(evaluation = {}) {
        const tfjs = evaluation.tfjsPrediction || {};
        const aiRisk = getAssessmentAiRisk(evaluation);
        const aiModel = getAssessmentAiModel(evaluation);
        const finalRisk = evaluation.risk || {};
        const finalPrediction = finalRisk.riskLevel || evaluation.prediction || tfjs.prediction;
        const finalRiskClass = finalRisk.riskClass || finalPrediction;
        const finalConfidence = evaluation.confidenceScore ?? tfjs.confidenceScore;
        const symptomOverride = evaluation.symptomRiskOverride || evaluation.trainingSignal?.symptomRiskOverride || null;
        if (!evaluation.tensorflowUsed || !tfjs.prediction) {
            return `
                <section class="pregnancy-tf-result ${riskLabelClass(finalRiskClass)}">
                    <div>
                        <span>Maternal-risk model</span>
                        <strong>${escapeHTML(finalPrediction || 'risk pending')}</strong>
                    </div>
                    <dl>
                        <div><dt>Confidence</dt><dd>${formatPercent(finalConfidence)}</dd></div>
                    </dl>
                </section>
            `;
        }

        return `
            <section class="pregnancy-tf-result ${riskLabelClass(finalRiskClass)}">
                <div>
                    <span>Maternal-risk model</span>
                    <strong>${escapeHTML(finalPrediction)}</strong>
                </div>
                <dl>
                    <div><dt>Confidence</dt><dd>${formatPercent(finalConfidence)}</dd></div>
                </dl>
            </section>
        `;
    }

    function renderTransformerRiskGuidance(evaluation = {}) {
        const aiRisk = getAssessmentAiRisk(evaluation);
        const aiModel = getAssessmentAiModel(evaluation);
        const answer = String(aiRisk.answer || '').trim();
        if (!answer) return '';
        const summary = answer
            .split(/\n+/)
            .map(line => line.trim())
            .filter(Boolean)
            .slice(0, 14)
            .join('\n');

        return `
            <section class="pregnancy-tf-result transformer-guidance ${aiRisk.urgent ? 'high' : 'ready'}">
                <p>${escapeHTML(summary).replace(/\n/g, '<br>')}</p>
            </section>
        `;
    }

    function renderCustomAiPredictionCard(prediction = null) {
        if (!prediction || !prediction.prediction) {
            return '';
        }

        const details = prediction.details || prediction;
        return `
            <section class="pregnancy-tf-result ${riskLabelClass(details.riskClass || prediction.prediction)}">
                <div>
                    <span>Maternal vitals classifier</span>
                    <strong>${escapeHTML(prediction.prediction)}</strong>
                </div>
                <dl>
                    <div><dt>Confidence</dt><dd>${formatPercent(prediction.confidenceScore ?? details.confidenceScore)}</dd></div>
                </dl>
            </section>
        `;
    }

    function renderRiskTrendPanel(data = {}) {
        const target = document.getElementById('pregnancyRiskTrendPanel');
        if (!target) return;
        const trends = data.trends || data.analytics?.trends || [];
        const counts = data.riskCounts || data.analytics?.riskCounts || {};
        state.lastRiskTrends = data;

        if (!trends.length) {
            target.innerHTML = `
                <strong>No saved assessments yet.</strong>
                <p class="pregnancy-rag-muted">Run the maternal vitals screen to save an assessment and build the live trend feed.</p>
            `;
            return;
        }

        const maxScore = Math.max(1, ...trends.map(item => Number(item.score) || 0));
        target.innerHTML = `
            <div class="pregnancy-risk-trend-summary">
                <span>High ${escapeHTML(counts.highRisk || 0)}</span>
                <span>Mid ${escapeHTML(counts.midRisk || 0)}</span>
                <span>Low ${escapeHTML(counts.lowRisk || 0)}</span>
                <span>${escapeHTML(trends.length)} recent</span>
            </div>
            <div class="pregnancy-risk-sparkline" aria-label="Recent saved assessment risk scores">
                ${trends.map(item => {
                    const height = Math.max(16, Math.round(((Number(item.score) || 0) / maxScore) * 100));
                    const tone = riskLabelClass(item.riskClass || item.riskLevel);
                    return `<span class="${tone}" style="height: ${height}%;" title="${escapeHTML(item.riskLevel)} ${escapeHTML(item.label || '')}"></span>`;
                }).join('')}
            </div>
            <div class="pregnancy-risk-trend-list">
                ${trends.slice(-6).reverse().map(item => `
                    <article>
                        <div>
                            <strong>${escapeHTML(item.riskLevel)}</strong>
                            <span>${escapeHTML(item.label || 'assessment')}${item.week ? ` · week ${escapeHTML(item.week)}` : ''}</span>
                        </div>
                        <dl>
                            <div><dt>BP</dt><dd>${escapeHTML(item.metrics?.systolicBP ?? '')}/${escapeHTML(item.metrics?.diastolicBP ?? '')}</dd></div>
                            <div><dt>BS</dt><dd>${escapeHTML(item.metrics?.bloodSugar ?? '')}</dd></div>
                            <div><dt>Conf</dt><dd>${formatPercent(item.confidenceScore)}</dd></div>
                        </dl>
                    </article>
                `).join('')}
            </div>
        `;
    }

    function renderRiskTrendPanel(data = {}) {
        const target = document.getElementById('pregnancyRiskTrendPanel');
        if (!target) return;
        const trends = data.trends || data.analytics?.trends || [];
        const counts = data.riskCounts || data.analytics?.riskCounts || {};
        state.lastRiskTrends = data;

        if (!trends.length) {
            target.innerHTML = `
                <strong>No saved assessments yet.</strong>
                <p class="pregnancy-rag-muted">Run the maternal vitals screen to save an assessment and build the live trend feed.</p>
            `;
            return;
        }

        const maxScore = Math.max(1, ...trends.map(item => Number(item.score) || 0));
        target.innerHTML = `
            <div class="pregnancy-risk-trend-summary">
                <div class="high"><span>High risk</span><strong>${escapeHTML(counts.highRisk || 0)}</strong></div>
                <div class="mid"><span>Mid risk</span><strong>${escapeHTML(counts.midRisk || 0)}</strong></div>
                <div class="low"><span>Low risk</span><strong>${escapeHTML(counts.lowRisk || 0)}</strong></div>
                <div class="total"><span>Recent records</span><strong>${escapeHTML(trends.length)}</strong></div>
            </div>
            <div class="pregnancy-risk-rating-legend" aria-label="Risk rating color guide">
                <span class="low">Low</span>
                <span class="mid">Mid</span>
                <span class="high">High</span>
            </div>
            <div class="pregnancy-risk-sparkline" aria-label="Recent saved assessment risk scores">
                ${trends.map(item => {
                    const height = Math.max(18, Math.round(((Number(item.score) || 0) / maxScore) * 100));
                    const tone = riskLabelClass(item.riskClass || item.riskLevel);
                    return `
                        <div class="pregnancy-risk-spark-item ${tone}" title="${escapeHTML(item.riskLevel)} ${escapeHTML(item.label || '')}">
                            <span class="${tone}" style="height: ${height}%;"><i>${escapeHTML(item.score || 0)}</i></span>
                            <b>${escapeHTML(riskRatingText(item.riskClass || item.riskLevel))}</b>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="pregnancy-risk-trend-list">
                ${trends.slice(-6).reverse().map(item => {
                    const tone = riskLabelClass(item.riskClass || item.riskLevel);
                    return `
                        <article class="${tone}">
                            <div class="pregnancy-risk-trend-card-head">
                                <span>${escapeHTML(item.label || 'assessment')}${item.week ? ` - week ${escapeHTML(item.week)}` : ''}</span>
                                <strong>${escapeHTML(item.riskLevel)}</strong>
                            </div>
                            <div class="pregnancy-risk-score-badge ${tone}">
                                <span>Risk score</span>
                                <strong>${escapeHTML(item.score || 0)}</strong>
                                <em>${escapeHTML(riskRatingText(item.riskClass || item.riskLevel))}</em>
                            </div>
                            <dl>
                                <div><dt>BP</dt><dd>${escapeHTML(item.metrics?.systolicBP ?? '')}/${escapeHTML(item.metrics?.diastolicBP ?? '')}</dd></div>
                                <div><dt>BS</dt><dd>${escapeHTML(item.metrics?.bloodSugar ?? '')}</dd></div>
                                <div><dt>Conf</dt><dd>${formatConfidence(item.confidenceScore)}</dd></div>
                            </dl>
                            ${item.symptoms ? `<p>${escapeHTML(item.symptoms)}</p>` : ''}
                        </article>
                    `;
                }).join('')}
            </div>
        `;
    }

    async function loadPregnancyRiskTrends(showLoading = true) {
        const target = document.getElementById('pregnancyRiskTrendPanel');
        if (!target) return;
        if (showLoading) {
            target.innerHTML = '<strong>Loading live trends...</strong><p>Reading saved pregnancy_vital_assessments.</p>';
        }

        try {
            // Llama-only mode (no RAG): keep the UI responsive without dataset calls.
            target.innerHTML = `
                <strong>Risk trends disabled (Llama-only mode).</strong>
                <p class="pregnancy-rag-muted">This page is configured to use Llama memory only, without RAG datasets.</p>
            `;
        } catch (error) {
            target.innerHTML = `
                <strong>Could not load risk trends.</strong>
                <p>${escapeHTML(error.message)}</p>
            `;
        }
    }

    function renderRiskTrainingSummary(data = {}) {
        const target = document.getElementById('pregnancyRiskTrainingSummary');
        if (!target) return;
        const summary = data.summary || data;
        state.trainingSummary = summary;
        const counts = summary.classCounts || {};
        const ranges = summary.featureRanges || {};
        const bpRange = ranges.systolicBP?.min !== null && ranges.systolicBP
            ? `${ranges.systolicBP.min}-${ranges.systolicBP.max}`
            : '--';
        const glucoseRange = ranges.bloodSugar?.min !== null && ranges.bloodSugar
            ? `${ranges.bloodSugar.min}-${ranges.bloodSugar.max}`
            : '--';
        const bmiRange = ranges.bmi?.min !== null && ranges.bmi
            ? `${ranges.bmi.min}-${ranges.bmi.max}`
            : '--';

        target.innerHTML = `
            <div class="pregnancy-risk-training-grid">
                <div><span>Source records</span><strong>${escapeHTML(summary.totalRecords ?? 0)}</strong></div>
                <div><span>High risk</span><strong>${escapeHTML(counts.highRisk || 0)}</strong></div>
                <div><span>Mid risk</span><strong>${escapeHTML(counts.midRisk || 0)}</strong></div>
                <div><span>Low risk</span><strong>${escapeHTML(counts.lowRisk || 0)}</strong></div>
                <div><span>BP range</span><strong>${escapeHTML(bpRange)}</strong></div>
                <div><span>Glucose range</span><strong>${escapeHTML(glucoseRange)}</strong></div>
                <div><span>BMI range</span><strong>${escapeHTML(bmiRange)}</strong></div>
            </div>
            <p class="pregnancy-rag-muted">${escapeHTML(summary.method || 'Dataset calibration ready.')}</p>
        `;
    }

    function renderRiskTrainingSummary(data = {}) {
        const target = document.getElementById('pregnancyRiskTrainingSummary');
        if (!target) return;
        const summary = data.summary || data;
        state.trainingSummary = summary;
        const counts = summary.classCounts || {};
        const ranges = summary.featureRanges || {};
        const bpRange = ranges.systolicBP?.min !== null && ranges.systolicBP
            ? `${ranges.systolicBP.min}-${ranges.systolicBP.max}`
            : '--';
        const glucoseRange = ranges.bloodSugar?.min !== null && ranges.bloodSugar
            ? `${ranges.bloodSugar.min}-${ranges.bloodSugar.max}`
            : '--';
        const bmiRange = ranges.bmi?.min !== null && ranges.bmi
            ? `${ranges.bmi.min}-${ranges.bmi.max}`
            : '--';

        target.innerHTML = `
            <div class="pregnancy-risk-training-grid">
                <div class="source"><span>Source records</span><strong>${escapeHTML(summary.totalRecords ?? 0)}</strong><em>expanded dataset</em></div>
                <div class="high"><span>High risk</span><strong>${escapeHTML(counts.highRisk || 0)}</strong><em>training class</em></div>
                <div class="mid"><span>Mid risk</span><strong>${escapeHTML(counts.midRisk || 0)}</strong><em>training class</em></div>
                <div class="low"><span>Low risk</span><strong>${escapeHTML(counts.lowRisk || 0)}</strong><em>training class</em></div>
                <div class="range"><span>BP range</span><strong>${escapeHTML(bpRange)}</strong><em>systolic</em></div>
                <div class="range"><span>Glucose range</span><strong>${escapeHTML(glucoseRange)}</strong><em>mmol/L</em></div>
                <div class="range"><span>BMI range</span><strong>${escapeHTML(bmiRange)}</strong><em>kg/m2</em></div>
            </div>
            <p class="pregnancy-risk-training-note">${escapeHTML(summary.method || 'Dataset calibration ready.')}</p>
        `;
    }

    async function loadPregnancyRiskTrainingSummary() {
        const target = document.getElementById('pregnancyRiskTrainingSummary');
        if (!target) return;
        target.innerHTML = '<strong>Loading training dataset summary...</strong>';

        try {
            const response = await fetchPregnancyRag('/api/pregnancy-rag/model-training/summary');
            const data = await readJson(response);
            if (!response.ok || data.success === false) {
                throw new Error(data.error || data.details || `Request failed (${response.status})`);
            }
            renderRiskTrainingSummary(data);
        } catch (error) {
            target.innerHTML = `
                <strong>Could not load training summary.</strong>
                <p>${escapeHTML(error.message)}</p>
            `;
        }
    }

    function renderPregnancyDecision(data) {
        const target = document.getElementById('pregnancyDecisionOutput');
        if (!target) return;
        const aiRisk = data.aiRisk || {};
        const riskAssessment = data.riskAssessment || {};
        const symptomAnalysis = data.symptomAnalysis || {};
        const enteredSymptoms = document.getElementById('pregnancyDecisionSymptoms')?.value.trim() || data.symptoms || '';
        const displayRiskLevel = riskAssessment.riskLevel || aiRisk.riskLevel || data.prediction || 'risk pending';
        const riskClass = riskLabelClass(riskAssessment.riskClass || displayRiskLevel);
        const mainReasons = riskAssessment.reasons || aiRisk.reasons || [];
        const confidenceScore = riskAssessment.confidenceScore ?? aiRisk.confidenceScore ?? data.confidenceScore;
        const accuracy = riskAssessment.accuracy ?? aiRisk.accuracy ?? data.accuracy ?? 0.92;
        const rawDistribution = riskAssessment.rawDistribution ?? aiRisk.rawDistribution ?? data.rawDistribution;
        const aiModel = data.aiModel || {};

        const rationaleMarkup = mainReasons.length
            ? `<ul class="pregnancy-decision-rationales">${mainReasons.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>`
            : '<p class="pregnancy-rag-muted">No extra rationale was returned for this assessment.</p>';

        const whatToDoMarkup = riskAssessment.whatToDo?.length
            ? `<h3>What to do</h3><ul class="pregnancy-decision-what-to-do">${riskAssessment.whatToDo.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>`
            : '';

        target.className = `pregnancy-rag-answer pregnancy-decision-output ${riskClass === 'high' ? 'urgent' : 'ready'}`;
        target.innerHTML = `
            <div class="pregnancy-decision-topline">
                <div>
                    <span>AI risk rating</span>
                    <strong class="pregnancy-decision-risk ${riskClass}">${escapeHTML(displayRiskLevel)}</strong>
                </div>
                <div>
                    <span>Confidence</span>
                    <strong>${formatPercent(confidenceScore)}</strong>
                </div>
            </div>
            ${renderRiskProbabilityBars(rawDistribution || riskDistribution(riskClass, confidenceScore), displayRiskLevel, confidenceScore)}
            ${data.urgent ? '<div class="pregnancy-rag-urgent">High-risk or warning-sign pattern matched. Contact a qualified clinician urgently if these symptoms are happening now.</div>' : ''}
            ${riskAssessment.symptomDescription ? `<p class="pregnancy-decision-symptom-desc">${escapeHTML(riskAssessment.symptomDescription)}</p>` : ''}
            ${renderCoreSymptomAnalysis({ symptomAnalysis })}
            <h3>Main reasons</h3>
            ${rationaleMarkup}
            ${whatToDoMarkup}
        `;
    }

    function numberOrDefault(value, fallback) {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : fallback;
    }

    function parseDecisionBloodPressure() {
        const combined = document.getElementById('pregnancyDecisionBloodPressure')?.value || '';
        const match = String(combined).match(/(\d{2,3})\D+(\d{2,3})/);
        if (match) {
            return {
                systolic: numberOrDefault(match[1], 120),
                diastolic: numberOrDefault(match[2], 80)
            };
        }
        return {
            systolic: numberOrDefault(document.getElementById('pregnancyDecisionSystolic')?.value, 120),
            diastolic: numberOrDefault(document.getElementById('pregnancyDecisionDiastolic')?.value, 80)
        };
    }

    async function predictPregnancyCustomAi(payload = {}) {
        const response = await fetchPregnancyRag('/api/model/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await readJson(response);
        if (!response.ok || data.success === false) {
            throw new Error(data.error || data.details || `Custom AI request failed (${response.status})`);
        }
        return data;
    }

    function estimateBmiFromWeight(weightKg) {
        const kg = numberOrDefault(weightKg, 63);
        const defaultHeightMeters = 1.65;
        return Number((kg / (defaultHeightMeters * defaultHeightMeters)).toFixed(1));
    }

    function weightFromBmi(bmi) {
        const defaultHeightMeters = 1.65;
        return Number((numberOrDefault(bmi, 23) * defaultHeightMeters * defaultHeightMeters).toFixed(1));
    }

    function buildPregnancyDecisionPayload() {
        const diabetesType = document.getElementById('pregnancyDecisionDiabetes')?.value || 'none';
        const bodyWeight = numberOrDefault(document.getElementById('pregnancyDecisionWeight')?.value, 63);
        const preexistingDiabetes = diabetesType === 'preexisting' ? 1 : 0;
        const gestationalDiabetes = diabetesType === 'gestational' ? 1 : 0;
        const glucose = diabetesType === 'none' ? 7.5 : 8.6;

        return {
            age: document.getElementById('pregnancyDecisionAge')?.value,
            systolic: 120, // default value
            diastolic: 80, // default value
            glucose,
            temp: 98.6, // default value
            heartRate: 70, // default value
            bodyWeight,
            bmi: estimateBmiFromWeight(bodyWeight),
            previousComplications: document.getElementById('pregnancyDecisionPreviousComplications')?.value,
            diabetes: diabetesType === 'none' ? 0 : 1,
            preexistingDiabetes,
            gestationalDiabetes,
            mentalHealth: 0, // default value
            week: document.getElementById('pregnancyDecisionWeek')?.value,
            symptoms: document.getElementById('pregnancyDecisionSymptoms')?.value.trim() || '',
            language: state.currentLanguage
        };
    }

    function telemetryTone(label, value, tone, detail) {
        return `
            <div class="pregnancy-telemetry-row ${tone}">
                <span>${escapeHTML(label)}</span>
                <strong>${escapeHTML(value)}</strong>
                <em>${escapeHTML(detail)}</em>
            </div>
        `;
    }

    function updatePregnancyTelemetryPreview() {
        const target = document.getElementById('pregnancyTelemetryStatus');
        if (!target) return;
        const payload = buildPregnancyDecisionPayload();
        const weight = Number(payload.bodyWeight);
        const diabetesType = document.getElementById('pregnancyDecisionDiabetes')?.value || 'none';

        const weightTone = weight < 40 || weight > 140 ? 'borderline' : 'nominal';
        const diabetesTone = diabetesType === 'none' ? 'nominal' : 'borderline';

        target.innerHTML = [
            telemetryTone('Body weight', weight ? `${weight} kg` : '--', weightTone, weightTone === 'nominal' ? 'tracked' : weightTone),
            telemetryTone('Diabetes', diabetesType === 'none' ? 'No diabetes' : diabetesType === 'preexisting' ? 'Before pregnancy' : 'Gestational', diabetesTone, diabetesTone === 'nominal' ? 'clear' : 'flagged')
        ].join('');
    }

    function setToolOutput(id, html, tone = '') {
        const target = document.getElementById(id);
        if (!target) return;
        target.className = `pregnancy-tool-output ${tone}`.trim();
        target.innerHTML = html;
    }

    function renderToolMatches(matches = []) {
        const items = (matches || []).slice(0, 3);
        if (!items.length) return '';
        return `
            <ul>
                ${items.map(match => `<li>${escapeHTML(match.title || match.sign || match.name || match.collection || 'Dataset match')}${match.collection ? ` <small>${escapeHTML(match.collection)}</small>` : ''}</li>`).join('')}
            </ul>
        `;
    }

    function tokenizerSummary(tokenizer = {}) {
        if (!tokenizer || tokenizer.exists === false) return '';
        const vocab = Number(tokenizer.vocabSize);
        const parts = [
            tokenizer.tokenizerClass || 'Tokenizer',
            tokenizer.modelType,
            Number.isFinite(vocab) ? `${vocab.toLocaleString()} vocab` : '',
            tokenizer.maxLength ? `${tokenizer.maxLength} max tokens` : ''
        ].filter(Boolean);
        return parts.join(' · ');
    }

    function renderTokenizerMeta(tokenizer = {}) {
        const summary = tokenizerSummary(tokenizer);
        if (!summary) return '';
        return `<small>Retrieval metadata: ${escapeHTML(summary)}</small>`;
    }

    function renderSymptomProbability(data = {}) {
        const distribution = data.riskAssessment?.rawDistribution || data.rawDistribution || data.symptomRisk?.rawDistribution || {};
        const riskLevel = data.riskAssessment?.riskLevel || data.riskLevel || data.prediction || data.symptomRisk?.riskLevel || '';
        const confidence = Number(data.riskAssessment?.confidenceScore ?? data.confidenceScore ?? data.accuracy ?? data.symptomRisk?.confidenceScore ?? 0);
        const accuracyLabel = data.riskAssessment?.aiGenerated
            ? `${formatPercent(confidence)} trained model confidence`
            : data.symptomRisk?.accuracyLabel || `${formatPercent(confidence)} trained model confidence`;
        const rows = [
            ['low risk', Number(distribution.lowRisk || 0)],
            ['mid risk', Number(distribution.midRisk || 0)],
            ['high risk', Number(distribution.highRisk || 0)]
        ];
        if (!rows.some(([, value]) => value > 0)) return '';

        return `
            <section class="pregnancy-risk-probability symptom-risk-probability" aria-label="Dataset symptom probability">
                <div class="pregnancy-risk-probability-head">
                    <strong>${escapeHTML(riskLevel || 'Dataset risk')}</strong>
                    <span>${escapeHTML(accuracyLabel)}</span>
                </div>
                ${rows.map(([label, value]) => `
                    <div class="pregnancy-risk-probability-row ${label.replace(/\s+/g, '-')}">
                        <span>${escapeHTML(label)}</span>
                        <div class="pregnancy-risk-probability-track">
                            <i style="width:${Math.round(value * 100)}%"></i>
                        </div>
                        <b>${formatPercent(value)}</b>
                    </div>
                `).join('')}
                <small>Source: ${escapeHTML(data.riskAssessment?.source || data.probabilitySource || data.symptomRisk?.source || 'dataset probability')}</small>
            </section>
        `;
    }

    function renderSymptomModelAnswer(data = {}) {
        const answer = String(data.answer || data.reply || '').trim();
        const firstLines = answer
            .split(/\n+/)
            .map(line => line.trim())
            .filter(Boolean)
            .filter(line => !/^best matching dataset evidence:?$/i.test(line))
            .slice(0, 5)
            .join('\n');
        const renderedAnswer = escapeHTML(firstLines || answer || 'No model answer returned.').replace(/\n/g, '<br>');
        const aiModel = getAssessmentAiModel(data.evaluation || {}, data);
        const modelName = aiModel.label;
        const retrievalModel = data.retrievalModel || 'Pregnancy retrieval + Symptom safety';
        const datasetUse = data.datasetUse || {};
        const trainedAt = data.trainedAt ? String(data.trainedAt).slice(0, 10) : '';
        const transformer = data.transformer || {};
        const transformerLabel = transformer.applied
            ? `Retrieval helper: ${transformer.model || 'local semantic reranker'}`
            : transformer.enabled
                ? `Retrieval helper ready: ${transformer.reason || 'not applied'}`
                : 'Retrieval rerank: off';

        return `
            ${renderCoreSymptomAnalysis({
                riskAssessment: data.riskAssessment || null,
                symptomAnalysis: data.riskAssessment?.symptomAnalysis || data.symptomAnalysis || data.symptomRisk || null
            })}
            ${data.urgent || data.safetyOverride ? '<strong>Urgent warning matched. Contact maternity care or emergency services now if this is happening.</strong>' : '<strong>Model guidance</strong>'}
            <p>${renderedAnswer}</p>
            ${renderToolMatches(data.matches || [])}
        `;
    }

    async function checkPregnancySymptoms(event) {
        if (event) event.preventDefault();
        const text = document.getElementById('pregnancySymptomText')?.value.trim() || '';
        const week = clampWeek(document.getElementById('pregnancySymptomWeek')?.value || document.getElementById('pregnancyDecisionWeek')?.value || 24);
        if (!text) {
            document.getElementById('pregnancySymptomText')?.focus();
            return;
        }

        setToolOutput('pregnancySymptomOutput', '<strong>Running unified pregnancy AI model...</strong><p>Checking all imported MongoDB pregnancy datasets for this symptom.</p>', 'loading');
        try {
            const response = await fetchPregnancyRag('/api/pregnancy-rag/symptom-check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, week })
            });
            const data = await readJson(response);
            if (!response.ok || data.success === false) {
                throw new Error(data.error || data.details || `Request failed (${response.status})`);
            }
            setToolOutput('pregnancySymptomOutput', renderSymptomModelAnswer(data), data.urgent || data.safetyOverride ? 'urgent' : 'ready');
        } catch (error) {
            setToolOutput('pregnancySymptomOutput', `<strong>Could not check symptoms.</strong><p>${escapeHTML(error.message)}</p>`, 'urgent');
        }
    }

    function formatTimer(seconds = 0) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function currentKickSeconds() {
        if (!state.kickSession.startedAt) return 0;
        return Math.max(0, Math.floor((Date.now() - state.kickSession.startedAt.getTime()) / 1000));
    }

    function renderKickSession(message = '') {
        const countEl = document.getElementById('pregnancyKickCount');
        const timerEl = document.getElementById('pregnancyKickTimer');
        const tap = document.getElementById('pregnancyKickTap');
        const save = document.getElementById('pregnancyKickSave');
        if (countEl) countEl.textContent = String(state.kickSession.count);
        if (timerEl) timerEl.textContent = formatTimer(currentKickSeconds());
        if (tap) tap.disabled = !state.kickSession.active || state.kickSession.saving;
        if (save) save.disabled = !state.kickSession.active || state.kickSession.saving;
        if (message) {
            setToolOutput('pregnancyKickOutput', message, state.kickSession.count >= 10 ? 'ready' : '');
        }
    }

    function stopKickTimer() {
        if (state.kickSession.timerId) {
            window.clearInterval(state.kickSession.timerId);
            state.kickSession.timerId = null;
        }
    }

    function startPregnancyKickSession() {
        stopKickTimer();
        state.kickSession = {
            active: true,
            count: 0,
            startedAt: new Date(),
            timerId: window.setInterval(() => renderKickSession(), 1000),
            saved: false,
            saving: false
        };
        renderKickSession('<strong>Session running.</strong><p>Record each movement until the goal reaches 10.</p>');
    }

    function countPregnancyKick() {
        if (!state.kickSession.active || state.kickSession.saving) return;
        state.kickSession.count += 1;
        renderKickSession(`<strong>${state.kickSession.count} movement${state.kickSession.count === 1 ? '' : 's'} recorded.</strong>`);
        if (state.kickSession.count >= 10 && !state.kickSession.saved) {
            savePregnancyKickSession(true);
        }
    }

    async function savePregnancyKickSession(auto = false) {
        if (!state.kickSession.active || state.kickSession.saving) return;
        state.kickSession.saving = true;
        const durationSeconds = currentKickSeconds();
        const week = clampWeek(document.getElementById('pregnancyReminderWeek')?.value || document.getElementById('pregnancyDecisionWeek')?.value || 24);
        renderKickSession('<strong>Saving movement session...</strong>');

        try {
            const response = await fetchPregnancyRag('/api/pregnancy-rag/kick-sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    week,
                    kickCount: state.kickSession.count,
                    durationSeconds,
                    goalReached: state.kickSession.count >= 10,
                    startedAt: state.kickSession.startedAt?.toISOString(),
                    completedAt: new Date().toISOString()
                })
            });
            const data = await readJson(response);
            if (!response.ok || data.success === false) {
                throw new Error(data.error || data.details || `Request failed (${response.status})`);
            }

            stopKickTimer();
            state.kickSession.active = false;
            state.kickSession.saved = true;
            state.kickSession.saving = false;
            renderKickSession(`
                <strong>${auto ? 'Goal reached and saved.' : 'Session saved.'}</strong>
                <p>${state.kickSession.count} movements in ${formatTimer(durationSeconds)}. Saved in pregnancy_data.</p>
                ${data.baselineSeconds ? `<p>Recent average: ${formatTimer(data.baselineSeconds)}.</p>` : ''}
            `);
        } catch (error) {
            state.kickSession.saving = false;
            renderKickSession(`<strong>Could not save session.</strong><p>${escapeHTML(error.message)}</p>`);
        }
    }

    async function savePregnancyNutrition(event) {
        if (event) event.preventDefault();
        setToolOutput('pregnancyNutritionOutput', '<strong>Saving daily nutrition log...</strong>', 'loading');
        const week = clampWeek(document.getElementById('pregnancyReminderWeek')?.value || document.getElementById('pregnancyDecisionWeek')?.value || 24);
        try {
            const response = await fetchPregnancyRag('/api/pregnancy-rag/nutrition-log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    week,
                    waterCups: document.getElementById('pregnancyNutritionWater')?.value,
                    prenatalVitamin: document.getElementById('pregnancyNutritionPrenatal')?.checked,
                    ironFolicAcid: document.getElementById('pregnancyNutritionIron')?.checked,
                    fatigue: document.getElementById('pregnancyNutritionFatigue')?.checked,
                    meals: document.getElementById('pregnancyNutritionMeals')?.value.trim()
                })
            });
            const data = await readJson(response);
            if (!response.ok || data.success === false) {
                throw new Error(data.error || data.details || `Request failed (${response.status})`);
            }
            setToolOutput('pregnancyNutritionOutput', `
                <strong>Saved in nutrition.</strong>
                ${renderList(data.tips || [], 'Nutrition log saved.')}
            `, 'ready');
        } catch (error) {
            setToolOutput('pregnancyNutritionOutput', `<strong>Could not save nutrition.</strong><p>${escapeHTML(error.message)}</p>`, 'urgent');
        }
    }

    function normalizeDatasetPlanner(planner = null, requestedWeek = null) {
        if (!planner || typeof planner !== 'object') return null;
        const week = clampWeek(planner.week || requestedWeek || 24);
        const trimester = getTrimesterInfo(week);
        const sections = Array.isArray(planner.sections) && planner.sections.length
            ? planner.sections.map(section => ({
                key: section.key || '',
                label: section.label || 'Week guidance',
                detail: section.detail || 'MongoDB dataset',
                urgent: !!section.urgent,
                items: Array.isArray(section.items) && section.items.length ? section.items : ['No dataset items returned for this section.']
            }))
            : buildWeekSuggestionPlan(week).sections;
        return {
            week,
            trimester: {
                ...trimester,
                full: planner.trimesterLabel || trimester.full
            },
            size: planner.babySizeCue || WEEK_SIZE_CUES[week - 1] || 'growing baby',
            title: planner.title || `Week ${week} ${trimester.full.toLowerCase()} plan`,
            subtitle: planner.subtitle || `Built from MongoDB pregnancy dataset records for week ${week}.`,
            sections,
            sources: Array.isArray(planner.sources) ? planner.sources : [],
            generatedFrom: planner.generatedFrom || 'mongodb-pregnancy-dataset'
        };
    }

    function previewFieldValue(record = {}, label = '') {
        const field = Array.isArray(record.fields)
            ? record.fields.find(item => String(item.label || '').toLowerCase() === label.toLowerCase())
            : null;
        return field?.value || '';
    }

    async function fetchCollectionPreview(collection, params = '') {
        const response = await fetchPregnancyRag(`/api/pregnancy-rag/collections/${collection}${params}`);
        const data = await readJson(response);
        if (!response.ok || data.success === false) {
            throw new Error(data.error || data.details || `Could not load ${collection}`);
        }
        return data.preview?.records || [];
    }

    function buildPlannerFromDatasetPreviews(weekInput, previews = {}) {
        const week = clampWeek(weekInput);
        const trimester = getTrimesterInfo(week);
        const weekRecords = previews.pregnancy_weeks || [];
        const parsedWeekRecords = weekRecords.map(record => ({
            record,
            week: Number.parseInt(previewFieldValue(record, 'Week') || record.title?.match(/\bweek\s+(\d+)/i)?.[1] || '0', 10),
            trimester: Number.parseInt(previewFieldValue(record, 'Trimester') || '0', 10)
        })).filter(item => Number.isFinite(item.week) && item.week > 0);
        const trimesterNumber = week <= 13 ? 1 : week <= 27 ? 2 : 3;
        const sameTrimester = parsedWeekRecords.filter(item => item.trimester === trimesterNumber);
        const closestWeek = (sameTrimester.length ? sameTrimester : parsedWeekRecords)
            .sort((a, b) => Math.abs(a.week - week) - Math.abs(b.week - week))[0];
        const exactWeekRecord = closestWeek?.week === week ? closestWeek.record : null;
        const nutrition = (previews.nutrition || [])
            .filter(record => !/daily nutrition log/i.test(`${record.title || ''} ${record.summary || ''}`))
            .slice(0, 4);
        const danger = (previews.danger_signs || []).slice(0, 5);
        const symptoms = previews.symptoms || [];
        const articles = previews.articles || [];
        const faqs = previews.faqs || [];
        const textFor = record => [
            record.title,
            record.summary,
            Array.isArray(record.badges) ? record.badges.join(' ') : ''
        ].filter(Boolean).join(' ');
        const topicItems = (records, regex, formatter = record => `${record.title}: ${record.summary}`, limit = 3) => (
            records
                .filter(record => regex.test(textFor(record)))
                .map(formatter)
                .filter(Boolean)
                .slice(0, limit)
        );
        const exactWeekItem = exactWeekRecord ? `${exactWeekRecord.title}: ${exactWeekRecord.summary}` : '';
        const movementItems = [
            ...topicItems(faqs, /exercise|physical activity|walking|activity|movement/i, record => `${record.title}: ${record.summary}`, 2),
            ...topicItems(articles, /exercise|physical activity|walking|activity|movement/i, record => `${record.title}: ${record.summary}`, 1),
            /exercise|physical activity|walking|activity|movement/i.test(exactWeekItem) ? exactWeekItem : ''
        ].filter(Boolean).slice(0, 3);
        const sleepItems = [
            ...topicItems(faqs, /sleep|position|side|rest/i, record => `${record.title}: ${record.summary}`, 2),
            ...topicItems(symptoms, /sleep|position|side|rest/i, record => `${record.title}: ${record.summary}`, 2),
            /sleep|position|side|rest/i.test(exactWeekItem) ? exactWeekItem : ''
        ].filter(Boolean).slice(0, 3);
        const careItems = [
            exactWeekItem,
            ...topicItems(faqs, /appointment|antenatal|prenatal|visit|screening|contact|clinician|provider/i, record => `${record.title}: ${record.summary}`, 2),
            ...topicItems(articles, /appointment|antenatal|prenatal|visit|screening|contact|clinician|provider/i, record => `${record.title}: ${record.summary}`, 2)
        ].filter(Boolean).slice(0, 4);

        return {
            week,
            trimester: {
                ...trimester,
                full: trimester.full
            },
            size: WEEK_SIZE_CUES[week - 1] || 'growing baby',
            title: `Week ${week} ${trimester.full.toLowerCase()} plan`,
            subtitle: exactWeekRecord
                ? `Built from the exact week ${week} pregnancy_weeks dataset preview.`
                : `Built from topic-matched MongoDB dataset previews. No exact pregnancy_weeks dataset record was found for week ${week}.`,
            sections: [
                {
                    key: 'movement',
                    label: 'Exercises',
                    detail: 'Exercise and physical-activity dataset records',
                    items: movementItems.length ? movementItems : [`No exercise-specific dataset record found for week ${week}.`]
                },
                {
                    key: 'food',
                    label: 'Foods to eat',
                    detail: 'Food records from nutrition dataset',
                    items: nutrition.length
                        ? nutrition.map(record => `${record.title}: ${record.summary}`).filter(Boolean).slice(0, 3)
                        : [`No recommended-food dataset record found for week ${week}.`]
                },
                {
                    key: 'sleep',
                    label: 'Sleep position',
                    detail: 'Sleep and rest dataset records',
                    items: sleepItems.length ? sleepItems : [`No sleep-position dataset record found for week ${week}.`]
                },
                {
                    key: 'care',
                    label: 'Care reminders',
                    detail: 'Week and antenatal-care dataset records',
                    items: careItems.length ? careItems : [`No appointment or antenatal-care dataset record found for week ${week}.`]
                },
                {
                    key: 'safety',
                    label: 'Call urgently for',
                    detail: 'Danger-sign records from MongoDB',
                    urgent: true,
                    items: danger.map(record => `${record.title}: ${record.summary}`).filter(Boolean).slice(0, 5)
                }
            ],
            sources: [
                closestWeek?.record,
                ...nutrition,
                ...danger,
                ...symptoms,
                ...faqs,
                ...articles
            ].filter(Boolean).map(record => ({
                collection: record.collection,
                title: record.title,
                source: record.source
            })),
            generatedFrom: 'mongodb-collection-previews'
        };
    }

    async function fetchPlannerFromDatasetPreviews(week) {
        const [pregnancyWeeks, nutrition, dangerSigns, symptoms, articles, faqs] = await Promise.all([
            fetchCollectionPreview('pregnancy_weeks', '?limit=20'),
            fetchCollectionPreview('nutrition', '?search=protein%20folate%20calcium%20omega&limit=10'),
            fetchCollectionPreview('danger_signs', '?limit=8'),
            fetchCollectionPreview('symptoms', '?search=sleep%20rest%20movement&limit=8'),
            fetchCollectionPreview('articles', '?search=exercise%20nutrition%20antenatal%20sleep&limit=8'),
            fetchCollectionPreview('faqs', '?search=exercise%20nutrition%20sleep%20antenatal%20appointment&limit=10')
        ]);
        return buildPlannerFromDatasetPreviews(week, {
            pregnancy_weeks: pregnancyWeeks,
            nutrition,
            danger_signs: dangerSigns,
            symptoms,
            articles,
            faqs
        });
    }

    function normalizeReminderPlan(reminders = [], requestedWeek = null) {
        const datasetPlan = normalizeDatasetPlanner(reminders, requestedWeek);
        if (datasetPlan) return datasetPlan;

        const week = clampWeek(requestedWeek || document.getElementById('pregnancyReminderWeek')?.value || 24);
        if (!Array.isArray(reminders) || !reminders.length) {
            return buildWeekSuggestionPlan(week);
        }

        const exactWeekReminders = reminders.filter(item => {
            const dueWeek = Number(item?.dueWeek || item?.week || item?.currentWeek);
            return Number.isFinite(dueWeek) && dueWeek === week;
        });

        if (!exactWeekReminders.length) {
            return buildWeekSuggestionPlan(week);
        }

        const plan = buildWeekSuggestionPlan(week);
        plan.sections[3].items = exactWeekReminders.map(item => `${item.title || 'Care reminder'}${item.note ? `: ${item.note}` : ''}`);
        return plan;
    }

    function renderPregnancyReminders(reminders = [], requestedWeek = null) {
        const target = document.getElementById('pregnancyReminderOutput');
        if (!target) return;
        const plan = normalizeReminderPlan(reminders, requestedWeek);
        const sourceText = plan.sources?.length
            ? plan.sources.slice(0, 5).map(source => source.title || source.collection).filter(Boolean).join(' | ')
            : '';
        target.innerHTML = `
            <div class="pregnancy-reminder-summary">
                <div>
                    <span>${escapeHTML(plan.trimester.full)}</span>
                    <strong>${escapeHTML(plan.title)}</strong>
                    <p>${escapeHTML(plan.subtitle)}</p>
                </div>
                <em>Week ${escapeHTML(plan.week)}</em>
            </div>
            <div class="pregnancy-reminder-grid">
                ${plan.sections.map(section => `
                    <article class="pregnancy-reminder-item ${section.urgent ? 'urgent' : ''}">
                        <span>${escapeHTML(section.detail)}</span>
                        <strong>${escapeHTML(section.label)}</strong>
                        <ul>
                            ${section.items.map(item => `<li>${escapeHTML(item)}</li>`).join('')}
                        </ul>
                    </article>
                `).join('')}
            </div>
            ${sourceText ? `<p class="pregnancy-reminder-note"><strong>Dataset records used:</strong> ${escapeHTML(sourceText)}</p>` : ''}
            <p class="pregnancy-reminder-note">These are general pregnancy suggestions for week ${escapeHTML(plan.week)}. Follow your clinician advice for your own health history.</p>
        `;
    }

    function renderPregnancyReminderLoading(week) {
        const target = document.getElementById('pregnancyReminderOutput');
        if (!target) return;
        target.innerHTML = `
            <article class="pregnancy-reminder-item loading">
                <span>Preparing</span>
                <strong>Building week ${escapeHTML(week)} plan...</strong>
                <p>Loading week-specific exercises, foods, sleep position, care tasks, and safety checks.</p>
            </article>
        `;
    }

    function renderPregnancyDatasetUnavailable(week, message = '') {
        const target = document.getElementById('pregnancyReminderOutput');
        if (!target) return;
        target.innerHTML = `
            <article class="pregnancy-reminder-item review">
                <span>MongoDB dataset</span>
                <strong>No dataset records could be loaded for week ${escapeHTML(week)}.</strong>
                <p>${escapeHTML(message || 'Check the backend connection and pregnancy dataset import, then try again.')}</p>
            </article>
        `;
    }

    async function generatePregnancyReminders(event, silent = false) {
        if (event) event.preventDefault();
        const target = document.getElementById('pregnancyReminderOutput');
        const week = clampWeek(document.getElementById('pregnancyReminderWeek')?.value || document.getElementById('pregnancyDecisionWeek')?.value || 24);
        if (target && !silent) {
            renderPregnancyReminderLoading(week);
        }

        try {
            let planner = null;
            try {
                const response = await fetchPregnancyRag(`/api/pregnancy-rag/week-planner/${week}`);
                const data = await readJson(response);
                if (!response.ok || data.success === false) {
                    throw new Error(data.error || data.details || `Request failed (${response.status})`);
                }
                planner = data.planner;
            } catch {
                planner = await fetchPlannerFromDatasetPreviews(week);
            }
            renderPregnancyReminders(planner || [], week);
        } catch (error) {
            renderPregnancyDatasetUnavailable(week, error.message);
        }
    }

    async function evaluatePregnancyDecision(event) {
        if (event) event.preventDefault();
        const target = document.getElementById('pregnancyDecisionOutput');
        if (target) {
            target.className = 'pregnancy-rag-answer pregnancy-decision-output loading';
            target.innerHTML = '<strong>Running Groq AI (Llama 3.3 70B)...</strong><p>Analyzing vitals, checking symptoms, and preparing assessment.</p>';
        }

        const payload = buildPregnancyDecisionPayload();
        updatePregnancyTelemetryPreview();

        try {
            updateTensorflowStatus('Groq AI running', 'Analyzing vitals');
            if (target) {
                target.innerHTML = '<strong>Groq AI (Llama 3.3 70B) is analyzing your vitals and symptoms...</strong><p>Preparing assessment with safety guidance.</p>';
            }

            const response = await fetchPregnancyRag('/api/pregnancy-rag/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await readJson(response);
            if (!response.ok || data.success === false) {
                throw new Error(data.error || data.details || `Request failed (${response.status})`);
            }
            updateTensorflowStatus('Groq AI complete', data.prediction || 'Assessment ready');
            renderPregnancyDecision(data);
            loadPregnancyDatasetStatus();
        } catch (error) {
            if (target) {
                target.className = 'pregnancy-rag-answer pregnancy-decision-output error';
                target.innerHTML = `
                    <strong>Could not complete assessment.</strong>
                    <p>${escapeHTML(error.message)}</p>
                `;
            }
        }
    }

    function pregnancyDecisionUseExample(kind = 'high') {
        const examples = {
            high: {
                age: 35,
                systolic: 140,
                diastolic: 90,
                glucose: 13,
                temp: 98,
                heartRate: 70,
                weight: weightFromBmi(31.2),
                previousComplications: 1,
                diabetes: 'preexisting',
                mentalHealth: 1,
                week: 28,
                symptoms: 'headache and vision changes'
            },
            who: {
                age: 29,
                systolic: 122,
                diastolic: 78,
                glucose: 7.2,
                temp: 98.6,
                heartRate: 76,
                weight: weightFromBmi(23),
                previousComplications: 0,
                diabetes: 'none',
                mentalHealth: 0,
                week: 24,
                symptoms: 'nutrition, iron, swollen feet, antenatal care visits'
            }
        };
        const selected = examples[kind] || examples.high;
        const set = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.value = value;
        };
        set('pregnancyDecisionAge', selected.age);
        set('pregnancyDecisionBloodPressure', `${selected.systolic}/${selected.diastolic}`);
        set('pregnancyDecisionTemp', selected.temp);
        set('pregnancyDecisionHeartRate', selected.heartRate);
        set('pregnancyDecisionWeight', selected.weight);
        set('pregnancyDecisionPreviousComplications', selected.previousComplications);
        set('pregnancyDecisionDiabetes', selected.diabetes);
        set('pregnancyDecisionMentalHealth', selected.mentalHealth);
        set('pregnancyDecisionWeek', selected.week);
        set('pregnancyDecisionSymptoms', selected.symptoms);
        document.getElementById('pregnancyDecisionForm')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.setTimeout(() => evaluatePregnancyDecision(), 80);
    }

    async function loadPregnancyDatasetStatus() {
        const target = document.getElementById('pregnancyRagDatasetStatus');
        if (!target) return;

        target.className = 'pregnancy-rag-status';
        target.textContent = 'Checking MongoDB dataset...';

        try {
            const statusPaths = [
                '/api/pregnancy-rag/status',
                '/api/pregnancy-rag/dataset-status',
                '/api/pregnancy/dataset-status',
                '/api/datasets/pregnancy/status'
            ];
            let data = null;
            let lastError = null;

            for (const path of statusPaths) {
                try {
                    const response = await fetchPregnancyRag(path);
                    const candidate = await readJson(response);
                    if (!response.ok || candidate.success === false) {
                        throw new Error(candidate.error || candidate.details || `Request failed (${response.status})`);
                    }
                    data = candidate;
                    break;
                } catch (error) {
                    lastError = error;
                }
            }

            if (!data) throw lastError || new Error('Dataset status endpoint unavailable.');

            const collections = data.status?.collections || {};
            const totalRecords = Number(data.status?.datasetRecordTotal) || Object.values(collections)
                .reduce((sum, item) => sum + (Number(item.total) || 0), 0);
            const jsonRecords = Object.values(collections)
                .reduce((sum, item) => sum + (Number(item.jsonDataset) || 0), 0);
            const personalRecords = Number(data.status?.personalRecordTotal) || 0;
            const dbName = data.status?.database || 'MongoDB';
            target.className = 'pregnancy-rag-status ready';
            target.textContent = `MongoDB dataset ready: ${totalRecords} searchable records (${jsonRecords} JSON dataset, ${personalRecords} personal records) in ${dbName}.`;
        } catch (error) {
            target.className = 'pregnancy-rag-status review';
            target.textContent = `MongoDB dataset status not available yet. The pregnancy tools will still use the backend when it responds. Last check: ${error.message}`;
        }
    }

    function renderAnswer(data) {
        state.lastAnswer = data;
        const urgent = data.urgent || data.safetyOverride
            ? '<div class="pregnancy-rag-urgent">Safety override active: this question may match a pregnancy danger sign. Seek medical care immediately if this is happening now.</div>'
            : '';
        const answerText = escapeHTML(data.reply || data.answer || 'No answer returned.').replace(/\n/g, '<br>');

        setAnswer(`
            ${urgent}
            <div class="pregnancy-rag-answer-text">${answerText}</div>
            <div class="pregnancy-rag-answer-meta">
                <span>Answer: ${escapeHTML(data.model || 'MongoDB dataset')}</span>
                ${data.rag?.dataset?.source === 'mongodb' ? '<span>Dataset: MongoDB</span>' : ''}
                <span>Generation: dataset only</span>
                ${data.rag?.retrieval ? `<span>Matches: ${escapeHTML(data.rag.retrieval.matchesReturned)}</span>` : ''}
                ${data.safetyOverride ? '<span>Danger signs override</span>' : ''}
                <span>Retrieved: ${escapeHTML(data.retrievedAt || 'now')}</span>
            </div>
            <h3>MongoDB context used</h3>
            ${renderSources(data.matches || [])}
        `, (data.urgent || data.safetyOverride) ? 'urgent' : 'ready');
    }

    function formatTrimester(value) {
        const numeric = Number.parseInt(value, 10);
        if (numeric === 1) return 'First trimester';
        if (numeric === 2) return 'Second trimester';
        if (numeric === 3) return 'Third trimester';
        return value ? `${value} trimester` : 'Pregnancy guide';
    }

    function renderList(items = [], fallback = '') {
        const list = Array.isArray(items)
            ? items.filter(Boolean)
            : String(items || '').split(';').map(item => item.trim()).filter(Boolean);
        if (!list.length && fallback) return `<p>${escapeHTML(fallback)}</p>`;
        if (!list.length) return '';
        return `<ul>${list.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>`;
    }

    async function askPregnancyRag(event) {
        if (event) event.preventDefault();

        const questionEl = document.getElementById('pregnancyRagQuestion');
        const weekEl = document.getElementById('pregnancyRagWeek');
        const symptomsEl = document.getElementById('pregnancyRagSymptoms');
        const question = questionEl?.value.trim();

        if (!question) {
            questionEl?.focus();
            return;
        }

        setAnswer('<strong>Asking unified pregnancy AI...</strong><p>Searching the model trained from all imported pregnancy datasets.</p>', 'loading');

        try {
            const response = await fetchPregnancyRag('/api/pregnancy-rag/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question,
                    week: weekEl?.value || '',
                    symptoms: symptomsEl?.value.trim() || '',
                    language: state.currentLanguage
                })
            });
            const data = await readJson(response);
            if (!response.ok || data.success === false) {
                throw new Error(data.error || data.details || `Request failed (${response.status})`);
            }
            renderAnswer(data);
        } catch (error) {
            setAnswer(`
                <strong>Pregnancy AI request failed.</strong>
                <p>${escapeHTML(error.message)}</p>
                <p class="pregnancy-rag-muted">Check that the backend is running on port 3000 while opening this page from your computer.</p>
            `, 'error');
        }
    }

    function initializePregnancySupportTools() {
        const page = document.getElementById('pregnancyRagPage');
        if (!page || page.dataset.supportToolsReady === 'true') return;
        page.dataset.supportToolsReady = 'true';

        document.getElementById('pregnancySymptomCheckerForm')?.addEventListener('submit', checkPregnancySymptoms);
        document.getElementById('pregnancyTelemetryRefresh')?.addEventListener('click', updatePregnancyTelemetryPreview);
        document.getElementById('pregnancyKickStart')?.addEventListener('click', startPregnancyKickSession);
        document.getElementById('pregnancyKickTap')?.addEventListener('click', countPregnancyKick);
        document.getElementById('pregnancyKickSave')?.addEventListener('click', () => savePregnancyKickSession(false));
        document.getElementById('pregnancyNutritionForm')?.addEventListener('submit', savePregnancyNutrition);
        document.getElementById('pregnancyReminderGenerate')?.addEventListener('click', generatePregnancyReminders);

        [
            'pregnancyDecisionBloodPressure',
            'pregnancyDecisionHeartRate',
            'pregnancyDecisionWeight',
            'pregnancyDecisionDiabetes'
        ].forEach(id => {
            const element = document.getElementById(id);
            element?.addEventListener('input', updatePregnancyTelemetryPreview);
            element?.addEventListener('change', updatePregnancyTelemetryPreview);
        });

        updatePregnancyTelemetryPreview();
        renderPregnancyReminderLoading(clampWeek(document.getElementById('pregnancyReminderWeek')?.value || 24));
        generatePregnancyReminders(null, true);
    }

    function initializePregnancyRagPage() {
        const page = document.getElementById('pregnancyRagPage');
        if (!page) return;

        if (page.dataset.bound !== 'true') {
            page.dataset.bound = 'true';
            document.getElementById('pregnancyRagForm')?.addEventListener('submit', askPregnancyRag);
            document.getElementById('pregnancyDecisionForm')?.addEventListener('submit', evaluatePregnancyDecision);
        }

        initPregnancyLanguage();
        loadPregnancyDatasetStatus();
        loadPregnancyTensorflowTrainingData().catch(() => {});
        initializePregnancySupportTools();
        initializePregnancyWeekTracker();
    }

    document.addEventListener('DOMContentLoaded', initializePregnancyRagPage);

    window.initializePregnancyRagPage = initializePregnancyRagPage;
    window.askPregnancyRag = askPregnancyRag;
    window.evaluatePregnancyDecision = evaluatePregnancyDecision;
    window.pregnancyDecisionUseExample = pregnancyDecisionUseExample;
    window.checkPregnancySymptoms = checkPregnancySymptoms;
    window.startPregnancyKickSession = startPregnancyKickSession;
    window.changeLanguage = changeLanguage;
    window.initPregnancyLanguage = initPregnancyLanguage;
    window.countPregnancyKick = countPregnancyKick;
    window.savePregnancyKickSession = savePregnancyKickSession;
    window.savePregnancyNutrition = savePregnancyNutrition;
    window.generatePregnancyReminders = generatePregnancyReminders;
    window.loadPregnancyRiskTrends = loadPregnancyRiskTrends;
    window.loadPregnancyDatasetStatus = loadPregnancyDatasetStatus;
    window.loadPregnancyTensorflowTrainingData = loadPregnancyTensorflowTrainingData;
})();
