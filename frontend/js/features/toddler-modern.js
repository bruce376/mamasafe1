(function () {
    'use strict';

    const STATE_KEY = 'mamasafe_toddler_hub_state';
    const LOG_KEY = 'mamasafe_toddler_hub_logs';
    const ROUTINE_KEY = 'mamasafe_toddler_hub_routine';

    const defaultState = {
        name: 'Little one',
        ageMonths: 24,
        focus: 'development',
        wakeTime: '07:00',
        goal: 'Build calmer daily routines'
    };

    const ageBands = [
        {
            min: 12,
            max: 17,
            label: '12-17 months',
            stage: 'Early toddler',
            sleep: '11-14 h',
            naps: '1-2 naps',
            meals: '3 meals + 2 snacks',
            milestones: ['Walks with support or alone', 'Points to show interest', 'Uses a few words', 'Copies simple actions'],
            priorities: ['Safe movement practice', 'Simple language repetition', 'Predictable transitions']
        },
        {
            min: 18,
            max: 23,
            label: '18-23 months',
            stage: 'Confident explorer',
            sleep: '11-14 h',
            naps: '1 nap',
            meals: '3 meals + 2 snacks',
            milestones: ['Runs with growing balance', 'Uses 10+ words', 'Follows one-step directions', 'Pretend play begins'],
            priorities: ['Choice-based cooperation', 'Emotion naming', 'Fine motor play']
        },
        {
            min: 24,
            max: 29,
            label: '24-29 months',
            stage: 'Two-year builder',
            sleep: '11-13 h',
            naps: '1 nap or quiet time',
            meals: 'Family meals + snacks',
            milestones: ['Uses short phrases', 'Jumps or climbs', 'Sorts shapes/colors', 'Shows independence'],
            priorities: ['Toilet readiness cues', 'Turn-taking practice', 'Language expansion']
        },
        {
            min: 30,
            max: 36,
            label: '30-36 months',
            stage: 'Preschool ready',
            sleep: '10-13 h',
            naps: 'Nap or quiet rest',
            meals: 'Balanced family meals',
            milestones: ['Speaks in short sentences', 'Plays with other children', 'Pedals or balances', 'Follows two-step directions'],
            priorities: ['Self-help skills', 'Social confidence', 'Problem-solving games']
        }
    ];

    const focusAreas = {
        sleep: {
            label: 'Sleep',
            code: 'SL',
            accent: '#667eea',
            summary: 'Build a sleep rhythm around wake windows, naps, wind-down routines, and bedtime consistency.',
            actions: ['Review wake windows', 'Log night sleep', 'Create a wind-down routine'],
            prompt: 'sleep, naps, night waking, bedtime resistance, and wind-down routines'
        },
        nutrition: {
            label: 'Nutrition',
            code: 'FD',
            accent: '#00d4aa',
            summary: 'Plan realistic meals, track appetite patterns, and handle picky eating without pressure.',
            actions: ['Plan meals', 'Track appetite', 'Review food variety'],
            prompt: 'toddler nutrition, picky eating, meal rhythm, hydration, snacks, and safe portions'
        },
        behavior: {
            label: 'Behavior',
            code: 'BH',
            accent: '#ff9800',
            summary: 'Decode tantrums, triggers, transitions, and emotional regulation with practical response plans.',
            actions: ['Log behavior', 'Find triggers', 'Choose response scripts'],
            prompt: 'tantrums, transitions, big feelings, boundaries, and positive discipline'
        },
        development: {
            label: 'Development',
            code: 'DV',
            accent: '#7c3aed',
            summary: 'Track milestones across movement, language, social-emotional growth, and learning through play.',
            actions: ['Review milestones', 'Plan skill play', 'Watch for concerns'],
            prompt: 'developmental milestones, language, movement, play, social-emotional skills, and learning'
        },
        potty: {
            label: 'Potty',
            code: 'PT',
            accent: '#ff527d',
            summary: 'Check readiness, record successes and accidents, and keep toilet learning low-pressure.',
            actions: ['Check readiness', 'Track attempts', 'Plan rewards'],
            prompt: 'potty training readiness, accidents, resistance, routines, and positive reinforcement'
        },
        play: {
            label: 'Play',
            code: 'PL',
            accent: '#00b894',
            summary: 'Choose activities that support language, fine motor, gross motor, creative, and social skills.',
            actions: ['Plan activities', 'Balance active/quiet play', 'Rotate toys'],
            prompt: 'play activities, toy rotation, sensory play, motor skills, and language-rich activities'
        }
    };

    const guideLibrary = {
        sleep: {
            title: 'Sleep Guide',
            body: [
                'Use the same 20-30 minute wind-down routine most nights.',
                'Keep the last hour quiet: dim lights, simple play, bath, story, then bed.',
                'If bedtime is a battle, check whether the nap is too late or the toddler is overtired.',
                'Night waking improves faster when responses are calm, boring, and consistent.'
            ]
        },
        nutrition: {
            title: 'Nutrition Guide',
            body: [
                'Offer a protein, fruit or vegetable, grain, and fat across the day.',
                'Use tiny portions for new foods and repeat exposures without pressure.',
                'Keep milk and snacks from crowding out meals.',
                'Avoid choking risks: whole grapes, popcorn, hard candy, large chunks, and round hard foods.'
            ]
        },
        behavior: {
            title: 'Behavior Guide',
            body: [
                'Name the feeling before correcting the behavior.',
                'Use fewer words during tantrums. Safety first, then connection.',
                'Offer two acceptable choices when possible.',
                'Track triggers for a few days: hunger, fatigue, transitions, overstimulation, and attention needs.'
            ]
        },
        development: {
            title: 'Development Guide',
            body: [
                'Milestones are ranges, not strict deadlines.',
                'Read daily, narrate routines, and pause so your toddler can answer.',
                'Use climbing, stacking, scribbling, pretend play, and sorting games to support multiple skills.',
                'Talk with a pediatrician if skills regress or you have persistent concerns.'
            ]
        },
        potty: {
            title: 'Potty Training Guide',
            body: [
                'Readiness matters more than age.',
                'Look for staying dry, interest in the toilet, simple direction-following, and communication of needs.',
                'Use neutral language for accidents and praise effort.',
                'Pause training during major stress, illness, or big schedule changes.'
            ]
        },
        play: {
            title: 'Play Guide',
            body: [
                'Rotate fewer toys more intentionally instead of offering everything at once.',
                'Mix active play, quiet play, pretend play, and sensory play.',
                'Use household objects safely: cups, boxes, fabric, spoons, and containers.',
                'Follow the toddler lead for a few minutes each day to build connection.'
            ]
        }
    };

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function readJson(key, fallback) {
        try {
            const parsed = JSON.parse(localStorage.getItem(key) || '');
            return parsed ?? fallback;
        } catch (_) {
            return fallback;
        }
    }

    function getState() {
        const saved = readJson(STATE_KEY, {});
        return {
            ...defaultState,
            ...saved,
            ageMonths: clamp(parseInt(saved.ageMonths || defaultState.ageMonths, 10), 12, 36)
        };
    }

    function saveState(next) {
        const current = getState();
        const merged = {
            ...current,
            ...next,
            ageMonths: clamp(parseInt(next.ageMonths ?? current.ageMonths, 10), 12, 36)
        };
        localStorage.setItem(STATE_KEY, JSON.stringify(merged));
        if (window.DB_SYNC) window.DB_SYNC.saveToddler({ type: 'hub-state', ...merged });
        return merged;
    }

    function getLogs() {
        return readJson(LOG_KEY, []);
    }

    function saveLogs(logs) {
        const trimmed = logs.slice(0, 80);
        localStorage.setItem(LOG_KEY, JSON.stringify(trimmed));
        if (window.DB_SYNC && trimmed[0]) window.DB_SYNC.saveToddler({ type: 'hub-log', ...trimmed[0] });
    }

    function clamp(value, min, max) {
        if (Number.isNaN(value)) return min;
        return Math.min(Math.max(value, min), max);
    }

    function getAgeBand(months) {
        return ageBands.find(band => months >= band.min && months <= band.max) || ageBands[2];
    }

    function formatTime(time) {
        if (!time || !time.includes(':')) return time || '--';
        const [h, m] = time.split(':').map(Number);
        const suffix = h >= 12 ? 'PM' : 'AM';
        const hour = h % 12 || 12;
        return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
    }

    function addHours(time, hoursToAdd) {
        const [h, m] = String(time || '07:00').split(':').map(Number);
        const date = new Date();
        date.setHours(h || 7, m || 0, 0, 0);
        date.setMinutes(date.getMinutes() + Math.round(hoursToAdd * 60));
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }

    function getBackendOrigin() {
        if (typeof getMamasafeBackendOrigin === 'function') {
            return getMamasafeBackendOrigin();
        }
        if (window.MAMASAFE_API_BASE) {
            return String(window.MAMASAFE_API_BASE).replace(/\/api\/?$/, '');
        }
        return `${window.location.protocol}//${window.location.hostname}:5000`;
    }

    function notify(message, type = 'info') {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
            return;
        }
        console.log(`[${type}] ${message}`);
    }

    function focusArea() {
        const state = getState();
        return focusAreas[state.focus] || focusAreas.development;
    }

    function recentLogs(type) {
        const logs = getLogs();
        return type ? logs.filter(log => log.type === type) : logs;
    }

    function weeklyLogCount() {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return getLogs().filter(log => (log.createdAt || 0) >= sevenDaysAgo).length;
    }

    function buildRoutine(state = getState()) {
        const band = getAgeBand(state.ageMonths);
        const wake = state.wakeTime || '07:00';
        const activeStart = addHours(wake, 1);
        const snack = addHours(wake, 2.25);
        const nap = state.ageMonths < 18 ? addHours(wake, 3.25) : addHours(wake, 5);
        const lunch = state.ageMonths < 18 ? addHours(wake, 5.5) : addHours(wake, 4.25);
        const quiet = addHours(wake, 7.5);
        const dinner = addHours(wake, 10);
        const bedtime = addHours(wake, state.ageMonths < 18 ? 12.5 : 12);

        return {
            title: `${band.stage} routine`,
            items: [
                { time: formatTime(wake), label: 'Wake, breakfast, connection time' },
                { time: formatTime(activeStart), label: 'Gross motor play or outdoor movement' },
                { time: formatTime(snack), label: 'Snack, water, book or language game' },
                { time: formatTime(lunch), label: 'Lunch and reset before rest' },
                { time: formatTime(nap), label: `${band.naps}: dark room, calm routine` },
                { time: formatTime(quiet), label: 'Fine motor, pretend play, or sensory bin' },
                { time: formatTime(dinner), label: 'Dinner, bath, simple family routine' },
                { time: formatTime(bedtime), label: 'Target bedtime window' }
            ]
        };
    }

    function renderAgeOptions(selected) {
        let html = '';
        for (let month = 12; month <= 36; month++) {
            html += `<option value="${month}" ${month === selected ? 'selected' : ''}>${month} months</option>`;
        }
        return html;
    }

    function renderAgeChips(selected) {
        return [12, 15, 18, 21, 24, 27, 30, 33, 36].map(month => `
            <button class="tm-age-chip ${month === selected ? 'active' : ''}" type="button" onclick="toddlerSetAge(${month})">${month}m</button>
        `).join('');
    }

    function renderMetric(label, value, detail) {
        return `
            <div class="tm-metric">
                <span>${escapeHtml(label)}</span>
                <strong>${escapeHtml(value)}</strong>
                <small>${escapeHtml(detail)}</small>
            </div>
        `;
    }

    function renderFocusTabs(active) {
        return Object.entries(focusAreas).map(([key, area]) => `
            <button class="tm-focus-tab ${key === active ? 'active' : ''}" style="--tm-accent:${area.accent}" type="button" onclick="toddlerSetFocus('${key}')">
                <span>${area.code}</span>
                ${area.label}
            </button>
        `).join('');
    }

    function renderRoutine(state) {
        const routine = readJson(ROUTINE_KEY, null) || buildRoutine(state);
        return `
            <div class="tm-panel tm-routine-panel">
                <div class="tm-panel-head">
                    <div>
                        <span class="tm-kicker">Daily rhythm</span>
                        <h3>${escapeHtml(routine.title)}</h3>
                    </div>
                    <button class="tm-icon-btn" type="button" onclick="toddlerGenerateRoutine()" title="Refresh routine">Refresh</button>
                </div>
                <div class="tm-routine-list">
                    ${routine.items.map(item => `
                        <div class="tm-routine-item">
                            <time>${escapeHtml(item.time)}</time>
                            <span>${escapeHtml(item.label)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    function renderFocusPanel(state) {
        const area = focusAreas[state.focus] || focusAreas.development;
        return `
            <div class="tm-panel tm-focus-panel" style="--tm-accent:${area.accent}">
                <div class="tm-focus-lead">
                    <span class="tm-round-code">${area.code}</span>
                    <div>
                        <span class="tm-kicker">Current focus</span>
                        <h3>${escapeHtml(area.label)} plan</h3>
                        <p>${escapeHtml(area.summary)}</p>
                    </div>
                </div>
                <div class="tm-action-row">
                    ${area.actions.map(action => `<span>${escapeHtml(action)}</span>`).join('')}
                </div>
                <div class="tm-panel-actions">
                    <button class="tm-primary" type="button" onclick="toddlerAskAI()">Generate AI care plan</button>
                    <button class="tm-secondary" type="button" onclick="toddlerOpenGuide('${state.focus}')">Open expert guide</button>
                </div>
            </div>
        `;
    }

    function renderMilestones(state) {
        const band = getAgeBand(state.ageMonths);
        return `
            <div class="tm-panel">
                <div class="tm-panel-head">
                    <div>
                        <span class="tm-kicker">Milestone matrix</span>
                        <h3>${escapeHtml(band.label)}</h3>
                    </div>
                    <span class="tm-status-pill">${escapeHtml(band.stage)}</span>
                </div>
                <div class="tm-milestone-grid">
                    ${band.milestones.map((milestone, index) => `
                        <label class="tm-check-card">
                            <input type="checkbox" ${index < 2 ? 'checked' : ''} onchange="toddlerSaveMilestoneProgress()">
                            <span>${escapeHtml(milestone)}</span>
                        </label>
                    `).join('')}
                </div>
                <div class="tm-priority-strip">
                    ${band.priorities.map(priority => `<span>${escapeHtml(priority)}</span>`).join('')}
                </div>
            </div>
        `;
    }

    function renderTrackerForms() {
        return `
            <div class="tm-panel tm-tracker-panel">
                <div class="tm-panel-head">
                    <div>
                        <span class="tm-kicker">Trackers</span>
                        <h3>Fast daily logging</h3>
                    </div>
                    <button class="tm-secondary compact" type="button" onclick="toddlerClearLogs()">Clear logs</button>
                </div>
                <div class="tm-tracker-grid">
                    <form class="tm-log-form" onsubmit="event.preventDefault(); toddlerLogEntry('sleep');">
                        <h4>Sleep</h4>
                        <div class="tm-field-pair">
                            <label>Night sleep <input id="tmSleepHours" type="number" min="0" max="16" step="0.5" value="11"></label>
                            <label>Naps <input id="tmNapCount" type="number" min="0" max="3" value="1"></label>
                        </div>
                        <label>Mood after waking
                            <select id="tmSleepMood">
                                <option>Rested</option>
                                <option>Fussy</option>
                                <option>Energetic</option>
                                <option>Still tired</option>
                            </select>
                        </label>
                        <button type="submit">Log sleep</button>
                    </form>

                    <form class="tm-log-form" onsubmit="event.preventDefault(); toddlerLogEntry('meal');">
                        <h4>Meal</h4>
                        <label>Meal type
                            <select id="tmMealType">
                                <option>Breakfast</option>
                                <option>Snack</option>
                                <option>Lunch</option>
                                <option>Dinner</option>
                            </select>
                        </label>
                        <label>Foods offered <input id="tmMealFoods" type="text" placeholder="Eggs, fruit, toast"></label>
                        <label>Appetite
                            <select id="tmMealAppetite">
                                <option>Good</option>
                                <option>Small</option>
                                <option>Picky</option>
                                <option>Refused</option>
                            </select>
                        </label>
                        <button type="submit">Log meal</button>
                    </form>

                    <form class="tm-log-form" onsubmit="event.preventDefault(); toddlerLogEntry('behavior');">
                        <h4>Behavior</h4>
                        <label>Moment
                            <select id="tmBehaviorType">
                                <option>Positive</option>
                                <option>Tantrum</option>
                                <option>Transition struggle</option>
                                <option>Aggression</option>
                                <option>Anxiety</option>
                            </select>
                        </label>
                        <label>Likely trigger <input id="tmBehaviorTrigger" type="text" placeholder="Hungry, tired, leaving park"></label>
                        <label>Response used <input id="tmBehaviorResponse" type="text" placeholder="Named feeling, offered choice"></label>
                        <button type="submit">Log behavior</button>
                    </form>

                    <form class="tm-log-form" onsubmit="event.preventDefault(); toddlerLogEntry('potty');">
                        <h4>Potty</h4>
                        <label>Attempt result
                            <select id="tmPottyResult">
                                <option>Success</option>
                                <option>Attempt</option>
                                <option>Accident</option>
                                <option>Refused</option>
                            </select>
                        </label>
                        <label>Notes <input id="tmPottyNotes" type="text" placeholder="After nap, before bath"></label>
                        <button type="submit">Log potty</button>
                    </form>
                </div>
                <div id="tmRecentLogs">${renderRecentLogs()}</div>
            </div>
        `;
    }

    function renderRecentLogs() {
        const logs = getLogs().slice(0, 8);
        if (!logs.length) {
            return `
                <div class="tm-empty-state">
                    <strong>No tracker entries yet</strong>
                    <span>Log sleep, meals, behavior, or potty attempts to unlock better patterns.</span>
                </div>
            `;
        }

        return `
            <div class="tm-log-list">
                ${logs.map(log => `
                    <article class="tm-log-item">
                        <span>${escapeHtml(log.type.toUpperCase())}</span>
                        <div>
                            <strong>${escapeHtml(log.title)}</strong>
                            <small>${escapeHtml(log.detail)}</small>
                        </div>
                        <time>${escapeHtml(new Date(log.createdAt).toLocaleDateString())}</time>
                    </article>
                `).join('')}
            </div>
        `;
    }

    function renderTools() {
        const tools = [
            { code: 'DR', title: 'Doctor Visits', text: 'Appointments, vaccines, growth notes', action: "openDoctorVisitsGuide()" },
            { code: 'GR', title: 'Growth Chart', text: 'Height, weight, and trend review', action: "openGrowthChart()" },
            { code: 'AI', title: 'Behavior AI', text: 'Trigger analysis and calm response plan', action: "openBehaviorAI()" },
            { code: 'LP', title: 'Learning Path', text: 'Skill-building activities by age', action: "openLearningOptimizer()" },
            { code: 'ER', title: 'Emotion Coach', text: 'Social-emotional support ideas', action: "openEmotionAI()" },
            { code: 'SL', title: 'Sleep Tracker', text: 'Sleep quality and bedtime rhythm', action: "openSleepTracker()" }
        ];

        return `
            <div class="tm-tools-grid">
                ${tools.map(tool => `
                    <button class="tm-tool-card" type="button" onclick="${tool.action}">
                        <span>${tool.code}</span>
                        <strong>${escapeHtml(tool.title)}</strong>
                        <small>${escapeHtml(tool.text)}</small>
                    </button>
                `).join('')}
            </div>
        `;
    }

    function renderGuides(activeFocus) {
        return `
            <div class="tm-guide-grid">
                ${Object.entries(focusAreas).map(([key, area]) => `
                    <button class="tm-guide-card ${key === activeFocus ? 'active' : ''}" style="--tm-accent:${area.accent}" type="button" onclick="toddlerOpenGuide('${key}')">
                        <span>${area.code}</span>
                        <strong>${escapeHtml(area.label)}</strong>
                        <small>${escapeHtml(area.actions.join(' / '))}</small>
                    </button>
                `).join('')}
            </div>
        `;
    }

    function buildToddlerDashboard() {
        const state = getState();
        const band = getAgeBand(state.ageMonths);
        const area = focusArea();
        const logs = getLogs();
        const sleepLogs = recentLogs('sleep');
        const avgSleep = sleepLogs.length
            ? (sleepLogs.slice(0, 7).reduce((sum, log) => sum + Number(log.meta?.hours || 0), 0) / Math.min(sleepLogs.length, 7)).toFixed(1)
            : '--';

        return `
            <div class="toddler-modern">
                <section class="tm-hero">
                    <div class="tm-hero-copy">
                        <span class="tm-kicker">Toddler Care Studio</span>
                        <h1>Smarter support for the busy toddler years</h1>
                        <p>Plan the day, track patterns, open expert guides, and use AI to turn messy moments into a clear care plan.</p>
                        <div class="tm-hero-actions">
                            <button class="tm-primary" type="button" onclick="toddlerAskAI()">Build AI plan</button>
                            <button class="tm-secondary" type="button" onclick="document.getElementById('tmTrackers')?.scrollIntoView({ behavior: 'smooth' })">Log today</button>
                        </div>
                    </div>

                    <form class="tm-profile-panel" onsubmit="event.preventDefault(); toddlerSaveProfile();">
                        <div class="tm-panel-head">
                            <div>
                                <span class="tm-kicker">Profile</span>
                                <h3>${escapeHtml(state.name)}</h3>
                            </div>
                            <span class="tm-status-pill">${escapeHtml(band.stage)}</span>
                        </div>
                        <label>Name
                            <input id="tmToddlerName" type="text" value="${escapeHtml(state.name)}" placeholder="Toddler name">
                        </label>
                        <div class="tm-field-pair">
                            <label>Age
                                <select id="tmToddlerAge">${renderAgeOptions(state.ageMonths)}</select>
                            </label>
                            <label>Wake time
                                <input id="tmWakeTime" type="time" value="${escapeHtml(state.wakeTime)}">
                            </label>
                        </div>
                        <label>Care goal
                            <input id="tmCareGoal" type="text" value="${escapeHtml(state.goal)}" placeholder="What are you working on?">
                        </label>
                        <button class="tm-primary full" type="submit">Update dashboard</button>
                    </form>
                </section>

                <section class="tm-metrics-row">
                    ${renderMetric('Age range', band.label, `${state.ageMonths} months selected`)}
                    ${renderMetric('Sleep target', band.sleep, band.naps)}
                    ${renderMetric('Food rhythm', band.meals, 'Balanced day target')}
                    ${renderMetric('Logs this week', String(weeklyLogCount()), `${logs.length} total entries`)}
                    ${renderMetric('Sleep average', avgSleep === '--' ? '--' : `${avgSleep} h`, 'From recent sleep logs')}
                </section>

                <section class="tm-age-strip">
                    <div>
                        <span class="tm-kicker">Age quick select</span>
                        <strong>Adjust guidance instantly</strong>
                    </div>
                    <div class="tm-age-chips">${renderAgeChips(state.ageMonths)}</div>
                </section>

                <section class="tm-focus-tabs">
                    ${renderFocusTabs(state.focus)}
                </section>

                <section class="tm-main-grid">
                    ${renderFocusPanel(state)}
                    ${renderRoutine(state)}
                    ${renderMilestones(state)}
                    <div class="tm-panel">
                        <div class="tm-panel-head">
                            <div>
                                <span class="tm-kicker">Smart tools</span>
                                <h3>Open advanced functions</h3>
                            </div>
                        </div>
                        ${renderTools()}
                    </div>
                </section>

                <section id="tmTrackers" class="tm-wide-section">
                    ${renderTrackerForms()}
                </section>

                <section class="tm-wide-section">
                    <div class="tm-panel">
                        <div class="tm-panel-head">
                            <div>
                                <span class="tm-kicker">Expert library</span>
                                <h3>Guides by care area</h3>
                            </div>
                            <span class="tm-status-pill" style="--tm-accent:${area.accent}">${escapeHtml(area.label)} selected</span>
                        </div>
                        ${renderGuides(state.focus)}
                    </div>
                </section>
            </div>
        `;
    }

    function refreshDashboard(preserveScroll = false) {
        const section = document.getElementById('toddler');
        if (!section) return;

        const scrollY = window.scrollY;
        section.classList.add('toddler-modern-mounted');
        section.innerHTML = buildToddlerDashboard();
        if (preserveScroll) window.scrollTo(0, scrollY);
    }

    window.initializeToddlerHub = function initializeToddlerHub() {
        refreshDashboard(false);
    };

    window.toddlerSaveProfile = function toddlerSaveProfile() {
        const state = saveState({
            name: document.getElementById('tmToddlerName')?.value?.trim() || defaultState.name,
            ageMonths: document.getElementById('tmToddlerAge')?.value || defaultState.ageMonths,
            wakeTime: document.getElementById('tmWakeTime')?.value || defaultState.wakeTime,
            goal: document.getElementById('tmCareGoal')?.value?.trim() || defaultState.goal
        });
        localStorage.setItem(ROUTINE_KEY, JSON.stringify(buildRoutine(state)));
        notify('Toddler dashboard updated', 'success');
        refreshDashboard(true);
    };

    window.toddlerSetAge = function toddlerSetAge(months) {
        const state = saveState({ ageMonths: months });
        localStorage.setItem(ROUTINE_KEY, JSON.stringify(buildRoutine(state)));
        notify(`${state.ageMonths}-month guidance loaded`, 'success');
        refreshDashboard(true);
    };

    window.toddlerSetFocus = function toddlerSetFocus(focus) {
        if (!focusAreas[focus]) return;
        saveState({ focus });
        refreshDashboard(true);
    };

    window.toddlerGenerateRoutine = function toddlerGenerateRoutine() {
        const state = getState();
        const routine = buildRoutine(state);
        localStorage.setItem(ROUTINE_KEY, JSON.stringify(routine));
        notify('Routine refreshed from current age and wake time', 'success');
        refreshDashboard(true);
    };

    window.toddlerLogEntry = function toddlerLogEntry(type) {
        const logs = getLogs();
        let entry;

        if (type === 'sleep') {
            const hours = Number(document.getElementById('tmSleepHours')?.value || 0);
            const naps = Number(document.getElementById('tmNapCount')?.value || 0);
            const mood = document.getElementById('tmSleepMood')?.value || 'Unknown';
            entry = {
                type,
                title: `${hours} hours, ${naps} nap${naps === 1 ? '' : 's'}`,
                detail: `Woke ${mood.toLowerCase()}`,
                meta: { hours, naps, mood }
            };
        } else if (type === 'meal') {
            const meal = document.getElementById('tmMealType')?.value || 'Meal';
            const foods = document.getElementById('tmMealFoods')?.value?.trim() || 'Foods not listed';
            const appetite = document.getElementById('tmMealAppetite')?.value || 'Unknown';
            entry = {
                type,
                title: `${meal}: ${appetite}`,
                detail: foods,
                meta: { meal, foods, appetite }
            };
        } else if (type === 'behavior') {
            const behavior = document.getElementById('tmBehaviorType')?.value || 'Behavior';
            const trigger = document.getElementById('tmBehaviorTrigger')?.value?.trim() || 'No trigger added';
            const response = document.getElementById('tmBehaviorResponse')?.value?.trim() || 'No response added';
            entry = {
                type,
                title: behavior,
                detail: `Trigger: ${trigger}. Response: ${response}`,
                meta: { behavior, trigger, response }
            };
        } else if (type === 'potty') {
            const result = document.getElementById('tmPottyResult')?.value || 'Attempt';
            const notes = document.getElementById('tmPottyNotes')?.value?.trim() || 'No notes';
            entry = {
                type,
                title: result,
                detail: notes,
                meta: { result, notes }
            };
        }

        if (!entry) return;
        logs.unshift({
            id: `tm_${Date.now()}`,
            createdAt: Date.now(),
            ...entry
        });
        saveLogs(logs);
        notify(`${entry.title} logged`, 'success');
        refreshDashboard(true);
    };

    window.toddlerClearLogs = function toddlerClearLogs() {
        localStorage.removeItem(LOG_KEY);
        notify('Toddler tracker logs cleared', 'info');
        refreshDashboard(true);
    };

    window.toddlerSaveMilestoneProgress = function toddlerSaveMilestoneProgress() {
        notify('Milestone progress noted', 'success');
    };

    window.toddlerOpenGuide = function toddlerOpenGuide(topic) {
        const guide = guideLibrary[topic] || guideLibrary.development;
        const area = focusAreas[topic] || focusAreas.development;
        window.toddlerOpenModal(guide.title, `
            <div class="tm-guide-modal">
                ${guide.body.map((item, index) => `
                    <div class="tm-guide-step">
                        <span>${String(index + 1).padStart(2, '0')}</span>
                        <p>${escapeHtml(item)}</p>
                    </div>
                `).join('')}
                <button class="tm-primary full" type="button" onclick="toddlerSetFocus('${topic}'); toddlerCloseModal();">Use this as my focus</button>
            </div>
        `, area.accent);
    };

    window.toddlerAskAI = async function toddlerAskAI() {
        const state = getState();
        const band = getAgeBand(state.ageMonths);
        const area = focusAreas[state.focus] || focusAreas.development;
        const logs = getLogs().slice(0, 10);

        window.toddlerOpenModal('AI Toddler Care Plan', `
            <div class="tm-ai-loading">
                <div class="tm-loader"></div>
                <strong>Building a practical plan for ${escapeHtml(state.name)}</strong>
                <span>Using age, focus area, routine, and recent tracker patterns.</span>
            </div>
        `, area.accent);

        try {
            const response = await fetch(`${getBackendOrigin()}/api/mamasafe-chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Create a practical toddler care plan.
Toddler name: ${state.name}
Age: ${state.ageMonths} months (${band.label}, ${band.stage})
Caregiver goal: ${state.goal}
Current focus: ${area.label}
Focus details: ${area.prompt}
Wake time: ${state.wakeTime}
Recent logs: ${JSON.stringify(logs)}

Return a concise plan with:
1. Today's top priority
2. A morning, afternoon, and evening action
3. One warning sign that needs pediatric advice
4. A simple script the caregiver can say to the toddler`,
                    context: {
                        requestType: 'toddler-care-plan',
                        toddlerAgeMonths: state.ageMonths,
                        toddlerStage: band.stage,
                        focus: state.focus,
                        goal: state.goal,
                        recentLogs: logs
                    }
                })
            });

            if (!response.ok) throw new Error(`AI request failed with ${response.status}`);
            const data = await response.json();
            const reply = data.reply || data.response || createFallbackInsight(state, area);
            const body = document.querySelector('.tm-modal-body');
            if (body) {
                body.innerHTML = `
                    <div class="tm-ai-result">
                        <span class="tm-kicker">Groq AI care plan</span>
                        <div>${formatAiText(reply)}</div>
                    </div>
                    <div class="tm-modal-actions">
                        <button class="tm-secondary" type="button" onclick="toddlerCloseModal()">Close</button>
                        <button class="tm-primary" type="button" onclick="toddlerSaveAiPlan()">Save plan</button>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Toddler AI plan error:', error);
            const body = document.querySelector('.tm-modal-body');
            if (body) {
                body.innerHTML = `
                    <div class="tm-ai-result">
                        <span class="tm-kicker">Offline care plan</span>
                        <div>${formatAiText(createFallbackInsight(state, area))}</div>
                    </div>
                    <div class="tm-modal-actions">
                        <button class="tm-primary" type="button" onclick="toddlerCloseModal()">Close</button>
                    </div>
                `;
            }
        }
    };

    window.toddlerSaveAiPlan = function toddlerSaveAiPlan() {
        const text = document.querySelector('.tm-ai-result')?.innerText || '';
        if (text) {
            localStorage.setItem('mamasafe_toddler_last_ai_plan', text);
            notify('AI toddler plan saved', 'success');
        }
    };

    function createFallbackInsight(state, area) {
        return `Today's top priority: keep ${area.label.toLowerCase()} predictable and low-pressure for ${state.name}.

Morning: start with connection before correction. Use a short routine preview.
Afternoon: choose one skill-building play activity and keep transitions simple.
Evening: reduce stimulation, offer two acceptable choices, and repeat the same wind-down steps.

Call your pediatrician promptly for developmental regression, breathing trouble, dehydration, persistent high fever, or behavior that feels unsafe.

Simple script: "I see this is hard. I will help you. First we calm our body, then we try again."`;
    }

    function formatAiText(text) {
        return escapeHtml(String(text || '')).replace(/\n/g, '<br>');
    }

    window.toddlerOpenTool = function toddlerOpenTool(pageId) {
        if (typeof navigateTo === 'function') {
            navigateTo(pageId);
        } else {
            notify(`${pageId} is not available right now`, 'warning');
        }
    };

    window.openDoctorVisitsGuide = function openDoctorVisitsGuide() {
        window.toddlerOpenTool('doctor-visits');
    };

    window.openGrowthChart = function openGrowthChart() {
        window.toddlerOpenTool('child-growth-chart');
    };

    window.openBehaviorAI = function openBehaviorAI() {
        window.toddlerSetFocus('behavior');
        window.toddlerAskAI();
    };

    window.openLearningOptimizer = function openLearningOptimizer() {
        window.toddlerSetFocus('development');
        window.toddlerAskAI();
    };

    window.openEmotionAI = function openEmotionAI() {
        window.toddlerSetFocus('behavior');
        window.toddlerOpenGuide('behavior');
    };

    window.openSleepTracker = function openSleepTracker() {
        window.toddlerSetFocus('sleep');
        document.getElementById('tmTrackers')?.scrollIntoView({ behavior: 'smooth' });
    };

    window.openMilestoneTracker = function openMilestoneTracker() {
        window.toddlerSetFocus('development');
        document.querySelector('.tm-milestone-grid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    window.openActivityPlanner = function openActivityPlanner() {
        window.toddlerSetFocus('play');
        window.toddlerOpenGuide('play');
    };

    window.openNutritionTracker = function openNutritionTracker() {
        window.toddlerSetFocus('nutrition');
        document.getElementById('tmTrackers')?.scrollIntoView({ behavior: 'smooth' });
    };

    window.showToddlerAge = function showToddlerAge(age) {
        const months = parseInt(String(age).replace(/\D/g, ''), 10) || 24;
        window.toddlerSetAge(months);
    };

    window.openSleepGuide = function openSleepGuide() {
        window.toddlerOpenGuide('sleep');
    };

    window.openFeedingGuide = function openFeedingGuide() {
        window.toddlerOpenGuide('nutrition');
    };

    window.openPottyGuide = function openPottyGuide() {
        window.toddlerOpenGuide('potty');
    };

    window.openBehaviorGuide = function openBehaviorGuide() {
        window.toddlerOpenGuide('behavior');
    };

    window.openDevelopmentGuide = function openDevelopmentGuide() {
        window.toddlerOpenGuide('development');
    };

    window.openPlayGuide = function openPlayGuide() {
        window.toddlerOpenGuide('play');
    };

    window.openGroomingGuide = function openGroomingGuide() {
        window.toddlerOpenGuide('play');
    };

    window.toddlerOpenModal = function toddlerOpenModal(title, bodyHtml, accent = '#00d4aa') {
        const existing = document.querySelector('.tm-modal-overlay');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.className = 'tm-modal-overlay';
        modal.innerHTML = `
            <section class="tm-modal" role="dialog" aria-modal="true" aria-labelledby="tmModalTitle" style="--tm-accent:${accent}">
                <header class="tm-modal-header">
                    <h2 id="tmModalTitle">${escapeHtml(title)}</h2>
                    <button class="tm-close-btn" type="button" aria-label="Close" onclick="toddlerCloseModal()">Close</button>
                </header>
                <div class="tm-modal-body">${bodyHtml}</div>
            </section>
        `;
        document.body.appendChild(modal);
        document.body.classList.add('modal-open');
        requestAnimationFrame(() => modal.querySelector('.tm-close-btn')?.focus({ preventScroll: true }));
        modal.addEventListener('click', event => {
            if (event.target === modal) window.toddlerCloseModal();
        });
    };

    window.toddlerCloseModal = function toddlerCloseModal() {
        const modal = document.querySelector('.tm-modal-overlay');
        if (modal) modal.remove();
        document.body.classList.remove('modal-open');
    };

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && document.querySelector('.tm-modal-overlay')) {
            window.toddlerCloseModal();
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('toddler')?.classList.contains('active')) {
            window.initializeToddlerHub();
        }
    });
})();
