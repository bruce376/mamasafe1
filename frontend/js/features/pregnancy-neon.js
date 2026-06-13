(() => {
  const STORAGE_KEY = "pregx_state_v1";

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  const pad2 = (n) => String(n).padStart(2, "0");

  const formatDate = (d) => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit"
      }).format(d);
    } catch {
      return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    }
  };

  const formatTime = (d) => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit"
      }).format(d);
    } catch {
      return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
    }
  };

  const safeJsonParse = (value, fallback) => {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  const getBackendOrigin = () => {
    if (window.MAMASAFE_API_BASE) return window.MAMASAFE_API_BASE.replace(/\/api\/?$/, "").replace(/\/$/, "");
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (isLocal && window.location.port !== "5000") {
      return `${window.location.protocol}//${window.location.hostname}:5000`;
    }
    return window.location.origin;
  };

  const readResponseBody = async (res) => {
    const text = await res.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return { response: text };
    }
  };

  const callGroqPregnancyEndpoint = async ({ week, symptoms, concerns }) => {
    const res = await fetch(`${getBackendOrigin()}/api/ai-pregnancy-tracking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ week, symptoms, concerns })
    });
    const data = await readResponseBody(res);
    if (!res.ok || data.success === false) {
      throw new Error(data.error || data.details || `Request failed (${res.status})`);
    }
    return data.response || data.reply || data.result || "";
  };

  const callGroqChatEndpoint = async ({ week, symptoms, concerns }) => {
    const message = [
      `Create a practical pregnancy briefing for week ${week}.`,
      symptoms ? `Symptoms: ${symptoms}.` : "No symptoms logged.",
      concerns ? `Concerns: ${concerns}.` : "No extra concerns provided.",
      "Include baby development, parent body changes, priority actions, and when to contact a clinician."
    ].join(" ");
    const res = await fetch(`${getBackendOrigin()}/api/mamasafe-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        context: { pregnancyWeek: week, healthConcerns: concerns || symptoms || "" }
      })
    });
    const data = await readResponseBody(res);
    if (!res.ok || data.success === false) {
      throw new Error(data.error || data.details || `Request failed (${res.status})`);
    }
    return data.reply || data.response || data.result || "";
  };

  const loadState = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = safeJsonParse(raw, {});
    const state = parsed && typeof parsed === "object" ? parsed : {};
    return {
      baseType: state.baseType || "lmp",
      baseDate: state.baseDate || "",
      selectedWeek: typeof state.selectedWeek === "number" ? state.selectedWeek : 20,
      symptoms: Array.isArray(state.symptoms) ? state.symptoms : [],
      vitals: Array.isArray(state.vitals) ? state.vitals : [],
      kicks: Array.isArray(state.kicks) ? state.kicks : [],
      contractions: Array.isArray(state.contractions) ? state.contractions : [],
      planDone: state.planDone && typeof state.planDone === "object" ? state.planDone : {},
      reminders: Array.isArray(state.reminders) ? state.reminders : []
    };
  };

  const saveState = (patch) => {
    const next = { ...loadState(), ...patch };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  };

  const getTrimester = (week) => {
    if (week <= 13) return "First";
    if (week <= 27) return "Second";
    return "Third";
  };

  const computePregnancy = (baseType, baseDateStr) => {
    if (!baseDateStr) return null;

    const today = new Date();
    const baseDate = new Date(baseDateStr);
    if (Number.isNaN(baseDate.getTime())) return null;

    const MS_DAY = 24 * 60 * 60 * 1000;
    let dueDate;
    let week;

    if (baseType === "due") {
      dueDate = baseDate;
      const daysToDue = Math.floor((dueDate.getTime() - today.getTime()) / MS_DAY);
      week = 40 - Math.floor(daysToDue / 7);
    } else {
      const lmp = baseDate;
      dueDate = new Date(lmp.getTime() + 280 * MS_DAY);
      const daysSince = Math.floor((today.getTime() - lmp.getTime()) / MS_DAY);
      week = 1 + Math.floor(daysSince / 7);
    }

    week = clamp(week, 1, 42);
    const daysLeft = clamp(Math.ceil((dueDate.getTime() - today.getTime()) / MS_DAY), -9999, 9999);

    return {
      week,
      dueDate,
      daysLeft,
      trimester: getTrimester(week)
    };
  };

  const milestones = [
    { week: 4, title: "First prenatal visit", tag: "Care" },
    { week: 8, title: "Heartbeat check", tag: "Milestone" },
    { week: 12, title: "Trimester 1 complete", tag: "Phase" },
    { week: 16, title: "Movement begins", tag: "Baby" },
    { week: 20, title: "Anatomy scan", tag: "Scan" },
    { week: 24, title: "Glucose screening", tag: "Test" },
    { week: 28, title: "Trimester 3 begins", tag: "Phase" },
    { week: 32, title: "Weekly appointments", tag: "Care" },
    { week: 36, title: "Full term close", tag: "Prep" },
    { week: 40, title: "Due date", tag: "Arrival" }
  ];

  const weekIntel = (week) => {
    const trimester = getTrimester(week);
    const phase =
      trimester === "First"
        ? "Foundation"
        : trimester === "Second"
          ? "Acceleration"
          : "Launch";

    const baby =
      trimester === "First"
        ? "Core systems are forming. Prioritize hydration, micronutrients, and stable sleep."
        : trimester === "Second"
          ? "Growth is accelerating. Expect more movement and stronger routine response."
          : "Final growth and positioning. Focus on comfort, readiness, and calm rhythms.";

    const body =
      trimester === "First"
        ? "Energy can fluctuate. Keep meals simple, stack small wins, and log symptoms to find patterns."
        : trimester === "Second"
          ? "Breathing and posture matter more. Track back pain and sleep quality to adjust."
          : "Pressure increases. Track contractions and swelling trends; keep your plan tight.";

    const focus = (() => {
      const m = milestones.find((x) => x.week === week);
      if (m) return `${m.tag}: ${m.title}`;
      if (week < 8) return "Care: Set your baseline and book key appointments";
      if (week < 14) return "Prep: Build habits (nutrition, hydration, light movement)";
      if (week < 22) return "Scan: Plan the anatomy scan and track movement patterns";
      if (week < 29) return "Test: Glucose and checkups — tighten nutrition & sleep routines";
      if (week < 36) return "Prep: Build hospital bag + birth preferences";
      return "Arrival: Keep contractions log ready and keep the plan simple";
    })();

    const signals = [
      { label: "Phase", value: phase },
      { label: "Focus", value: focus }
    ];

    return { trimester, baby, body, signals };
  };

  const defaultPlan = [
    { id: "t1-visit", trimester: "First", label: "Book first prenatal appointment" },
    { id: "t1-vitamins", trimester: "First", label: "Start prenatal vitamins + hydration routine" },
    { id: "t1-symptoms", trimester: "First", label: "Log symptoms for 7 days to find patterns" },
    { id: "t2-scan", trimester: "Second", label: "Schedule anatomy scan and prep questions" },
    { id: "t2-movement", trimester: "Second", label: "Start a daily movement check-in habit" },
    { id: "t2-posture", trimester: "Second", label: "Create a sleep + posture comfort setup" },
    { id: "t3-bag", trimester: "Third", label: "Build a hospital bag checklist" },
    { id: "t3-contacts", trimester: "Third", label: "Save emergency contacts + routes" },
    { id: "t3-labor", trimester: "Third", label: "Practice contraction logging flow" }
  ];

  const q = (sel) => document.querySelector(sel);
  const qa = (sel) => Array.from(document.querySelectorAll(sel));

  const renderSetup = (state) => {
    const baseTypeEl = q("#pregxBaseType");
    const baseDateEl = q("#pregxBaseDate");
    const weekEl = q("#pregxWeekValue");
    const triEl = q("#pregxTrimesterValue");
    const daysEl = q("#pregxDaysLeftValue");
    const metaEl = q("#pregxSetupMeta");

    if (!baseTypeEl || !baseDateEl || !weekEl || !triEl || !daysEl || !metaEl) return;

    baseDateEl.value = state.baseDate || "";
    qa("#pregxBaseType .pregx-seg-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.value === state.baseType);
    });

    const computed = computePregnancy(state.baseType, state.baseDate);
    if (!computed) {
      weekEl.textContent = "--";
      triEl.textContent = "--";
      daysEl.textContent = "--";
      metaEl.textContent = "Save your base date to unlock everything";
      return;
    }

    weekEl.textContent = String(computed.week);
    triEl.textContent = `${computed.trimester}`;
    daysEl.textContent = String(computed.daysLeft);
    metaEl.textContent = `Estimated due: ${formatDate(computed.dueDate)}`;
  };

  const renderTimeline = (state) => {
    const rail = q("#pregxTimelineRail");
    const pill = q("#pregxWeekPill");
    const range = q("#pregxWeekRange");
    if (!rail || !pill || !range) return;

    pill.textContent = `Week ${state.selectedWeek}`;
    range.value = String(state.selectedWeek);

    rail.innerHTML = "";
    const computed = computePregnancy(state.baseType, state.baseDate);
    const currentWeek = computed ? computed.week : null;

    const makeTick = (week) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pregx-tick";
      btn.dataset.week = String(week);
      btn.innerHTML = `<span class="pregx-tick-dot"></span><span class="pregx-tick-label">${week}</span>`;
      if (week === state.selectedWeek) btn.classList.add("active");
      if (currentWeek === week) btn.classList.add("current");
      return btn;
    };

    for (let w = 1; w <= 42; w += 1) {
      const btn = makeTick(w);
      if (milestones.some((m) => m.week === w)) btn.classList.add("milestone");
      rail.appendChild(btn);
    }
  };

  const renderWeekIntel = (state) => {
    const out = q("#pregxWeekIntel");
    const sub = q("#pregxWeekIntelSubtitle");
    if (!out || !sub) return;

    const intel = weekIntel(state.selectedWeek);
    sub.textContent = `Trimester ${intel.trimester} • Week ${state.selectedWeek}`;

    out.innerHTML = `
      <div class="pregx-intel-block">
        <div class="pregx-intel-title">Baby</div>
        <div class="pregx-intel-text">${intel.baby}</div>
      </div>
      <div class="pregx-intel-block">
        <div class="pregx-intel-title">You</div>
        <div class="pregx-intel-text">${intel.body}</div>
      </div>
      <div class="pregx-intel-signal">
        ${intel.signals
          .map(
            (s) => `
            <div class="pregx-signal">
              <div class="pregx-signal-k">${s.label}</div>
              <div class="pregx-signal-v">${s.value}</div>
            </div>
          `
          )
          .join("")}
      </div>
    `;
  };

  const renderSymptoms = (state) => {
    const list = q("#pregxSymptomsList");
    if (!list) return;

    const items = [...state.symptoms].sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 12);
    list.innerHTML = items
      .map((s) => {
        const d = new Date(s.at);
        return `
          <div class="pregx-item">
            <div class="pregx-item-main">
              <div class="pregx-item-title">${s.name}</div>
              <div class="pregx-item-meta">Severity ${s.severity}/10 • ${formatDate(d)} ${formatTime(d)}</div>
              ${s.note ? `<div class="pregx-item-note">${s.note}</div>` : ""}
            </div>
            <button class="pregx-item-btn" type="button" data-action="delete-symptom" data-id="${s.id}">Remove</button>
          </div>
        `;
      })
      .join("");
  };

  const renderVitals = (state) => {
    const chart = q("#pregxVitalsChart");
    const list = q("#pregxVitalsList");
    if (!chart || !list) return;

    const items = [...state.vitals].sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 12);
    list.innerHTML = items
      .map((v) => {
        const d = new Date(v.at);
        const bp = v.bpSys ? `${v.bpSys} SYS` : "—";
        const w = typeof v.weight === "number" ? `${v.weight} kg` : "—";
        return `
          <div class="pregx-item">
            <div class="pregx-item-main">
              <div class="pregx-item-title">${w} <span class="pregx-item-dim">•</span> BP ${bp}</div>
              <div class="pregx-item-meta">${formatDate(d)} ${formatTime(d)}</div>
            </div>
            <button class="pregx-item-btn" type="button" data-action="delete-vitals" data-id="${v.id}">Remove</button>
          </div>
        `;
      })
      .join("");

    const points = [...state.vitals]
      .filter((v) => typeof v.weight === "number")
      .sort((a, b) => (a.at > b.at ? 1 : -1))
      .slice(-10);

    if (points.length < 2) {
      chart.innerHTML = `<div class="pregx-chart-empty">Add at least two weight entries to see the neon trendline.</div>`;
      return;
    }

    const minW = Math.min(...points.map((p) => p.weight));
    const maxW = Math.max(...points.map((p) => p.weight));
    const span = maxW - minW || 1;
    const width = 520;
    const height = 140;
    const pad = 16;

    const xy = points.map((p, i) => {
      const x = pad + (i / (points.length - 1)) * (width - pad * 2);
      const y = pad + (1 - (p.weight - minW) / span) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    chart.innerHTML = `
      <svg class="pregx-chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Weight trend">
        <defs>
          <linearGradient id="pregxWeightLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#7c3aed"/>
            <stop offset="50%" stop-color="#22d3ee"/>
            <stop offset="100%" stop-color="#ff8fab"/>
          </linearGradient>
        </defs>
        <polyline fill="none" stroke="url(#pregxWeightLine)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" points="${xy.join(" ")}"></polyline>
        ${xy
          .map((p) => {
            const [x, y] = p.split(",");
            return `<circle cx="${x}" cy="${y}" r="5" fill="#0b1020" stroke="#22d3ee" stroke-width="2"></circle>`;
          })
          .join("")}
      </svg>
      <div class="pregx-chart-meta">Min ${minW.toFixed(1)} kg • Max ${maxW.toFixed(1)} kg</div>
    `;
  };

  const renderKicks = (state) => {
    const hourEl = q("#pregxKickHour");
    const halfDayEl = q("#pregxKickHalfDay");
    const sessionEl = q("#pregxKickSession");
    const list = q("#pregxKicksList");
    if (!hourEl || !halfDayEl || !sessionEl || !list) return;

    const now = Date.now();
    const MS_HOUR = 60 * 60 * 1000;
    const kicks = state.kicks.map((k) => new Date(k.at).getTime()).filter((t) => !Number.isNaN(t));
    const lastHour = kicks.filter((t) => now - t <= MS_HOUR).length;
    const last12h = kicks.filter((t) => now - t <= 12 * MS_HOUR).length;

    hourEl.textContent = String(lastHour);
    halfDayEl.textContent = String(last12h);
    sessionEl.textContent = String(kicks.length);

    const items = [...state.kicks].sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 14);
    list.innerHTML = items
      .map((k) => {
        const d = new Date(k.at);
        return `
          <div class="pregx-item">
            <div class="pregx-item-main">
              <div class="pregx-item-title">Kick logged</div>
              <div class="pregx-item-meta">${formatDate(d)} ${formatTime(d)}</div>
            </div>
            <button class="pregx-item-btn" type="button" data-action="delete-kick" data-id="${k.id}">Remove</button>
          </div>
        `;
      })
      .join("");
  };

  const toDuration = (ms) => {
    const total = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${pad2(m)}:${pad2(s)}`;
  };

  const renderContractions = (state, running) => {
    const list = q("#pregxCtList");
    const summary = q("#pregxCtSummary");
    const timer = q("#pregxCtTimer");
    if (!list || !summary || !timer) return;

    timer.textContent = running ? toDuration(Date.now() - running.startedAt) : "00:00";

    const items = [...state.contractions].sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1)).slice(0, 12);
    list.innerHTML = items
      .map((c) => {
        const d = new Date(c.startedAt);
        const duration = typeof c.durationMs === "number" ? toDuration(c.durationMs) : "—";
        const interval = typeof c.intervalMs === "number" ? toDuration(c.intervalMs) : "—";
        return `
          <div class="pregx-item">
            <div class="pregx-item-main">
              <div class="pregx-item-title">${duration} <span class="pregx-item-dim">•</span> Interval ${interval}</div>
              <div class="pregx-item-meta">${formatDate(d)} ${formatTime(d)}</div>
            </div>
            <button class="pregx-item-btn" type="button" data-action="delete-ct" data-id="${c.id}">Remove</button>
          </div>
        `;
      })
      .join("");

    const last5 = [...state.contractions].slice(-5);
    if (last5.length === 0) {
      summary.innerHTML = `<div class="pregx-ct-empty">Start a timer to create a contraction log.</div>`;
      return;
    }

    const avgDuration =
      last5.reduce((acc, c) => acc + (typeof c.durationMs === "number" ? c.durationMs : 0), 0) /
      Math.max(1, last5.filter((c) => typeof c.durationMs === "number").length);

    const intervals = last5.filter((c) => typeof c.intervalMs === "number").map((c) => c.intervalMs);
    const avgInterval = intervals.length ? intervals.reduce((a, b) => a + b, 0) / intervals.length : null;

    summary.innerHTML = `
      <div class="pregx-ct-grid">
        <div class="pregx-mini-metric">
          <div class="pregx-mini-k">Avg duration</div>
          <div class="pregx-mini-v">${toDuration(avgDuration)}</div>
        </div>
        <div class="pregx-mini-metric">
          <div class="pregx-mini-k">Avg interval</div>
          <div class="pregx-mini-v">${avgInterval ? toDuration(avgInterval) : "—"}</div>
        </div>
        <div class="pregx-mini-metric">
          <div class="pregx-mini-k">Last 5</div>
          <div class="pregx-mini-v">${last5.length}</div>
        </div>
      </div>
    `;
  };

  const renderPlan = (state) => {
    const list = q("#pregxPlanList");
    const ring = q("#pregxPlanRing");
    const pctEl = q("#pregxPlanProgress");
    const labelEl = q("#pregxPlanProgressLabel");
    if (!list || !ring || !pctEl || !labelEl) return;

    const plan = defaultPlan;
    const done = state.planDone || {};
    const total = plan.length;
    const completed = plan.filter((p) => done[p.id]).length;
    const pct = total ? Math.round((completed / total) * 100) : 0;

    pctEl.textContent = `${pct}%`;
    labelEl.textContent = `${completed} of ${total} completed`;
    ring.style.background = `conic-gradient(#22d3ee ${pct}%, rgba(255,255,255,0.08) 0)`;

    const group = (tri) => plan.filter((p) => p.trimester === tri);
    const triOrder = ["First", "Second", "Third"];

    list.innerHTML = triOrder
      .map((tri) => {
        const items = group(tri);
        return `
          <div class="pregx-plan-group">
            <div class="pregx-plan-title">Trimester ${tri}</div>
            <div class="pregx-plan-items">
              ${items
                .map((p) => {
                  const checked = !!done[p.id];
                  return `
                    <button type="button" class="pregx-plan-item ${checked ? "done" : ""}" data-action="toggle-plan" data-id="${p.id}">
                      <span class="pregx-plan-check">${checked ? "✓" : ""}</span>
                      <span class="pregx-plan-label">${p.label}</span>
                    </button>
                  `;
                })
                .join("")}
            </div>
          </div>
        `;
      })
      .join("");
  };

  const renderReminders = (state) => {
    const list = q("#pregxRemindersList");
    if (!list) return;

    const now = Date.now();
    const items = [...state.reminders]
      .map((r) => ({ ...r, t: new Date(r.when).getTime() }))
      .filter((r) => !Number.isNaN(r.t))
      .sort((a, b) => a.t - b.t)
      .slice(0, 12);

    if (items.length === 0) {
      list.innerHTML = `<div class="pregx-empty">Add a reminder to see it here.</div>`;
      return;
    }

    list.innerHTML = items
      .map((r) => {
        const d = new Date(r.when);
        const soon = r.t - now < 48 * 60 * 60 * 1000 && r.t - now > 0;
        return `
          <div class="pregx-item ${soon ? "soon" : ""}">
            <div class="pregx-item-main">
              <div class="pregx-item-title">${r.text}</div>
              <div class="pregx-item-meta">${formatDate(d)} ${formatTime(d)}</div>
            </div>
            <button class="pregx-item-btn" type="button" data-action="delete-reminder" data-id="${r.id}">Done</button>
          </div>
        `;
      })
      .join("");
  };

  const setActiveTab = (tab) => {
    qa("#pregxTabs .pregx-tab").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
    qa(".pregx-tab-panels .pregx-panel").forEach((p) => p.classList.toggle("active", p.dataset.panel === tab));
  };

  const getLatestSymptomsString = (state) => {
    const recent = [...state.symptoms].sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 4);
    const names = Array.from(new Set(recent.map((s) => s.name))).filter(Boolean);
    return names.join(", ");
  };

  const offlineBrief = (week, symptoms, concerns) => {
    const intel = weekIntel(week);
    const symptomLine = symptoms ? `Symptoms noted: ${symptoms}.` : "No symptoms provided.";
    const concernsLine = concerns ? `Concerns: ${concerns}.` : "No concerns provided.";
    return `Week ${week} (Trimester ${intel.trimester})\n\n${intel.signals
      .map((s) => `${s.label}: ${s.value}`)
      .join("\n")}\n\nBaby: ${intel.baby}\nYou: ${intel.body}\n\n${symptomLine}\n${concernsLine}\n\nNext moves:\n- Log symptoms daily for 3 days\n- Keep hydration + sleep stable\n- Add one plan item and one reminder`;
  };

  const setAiOutput = (text, mode = "ready") => {
    const out = q("#pregxAiOutput");
    if (out) {
      out.dataset.mode = mode;
      out.textContent = text;
    }
    const focusBrief = q("#pregxFocusBrief");
    if (focusBrief && text) {
      focusBrief.textContent = text;
    }
  };

  const generateAiBriefing = async (week, symptoms, concerns) => {
    setAiOutput("Generating Groq briefing...", "loading");
    let firstError = null;
    try {
      const text = await callGroqPregnancyEndpoint({ week, symptoms, concerns });
      const finalText = text || offlineBrief(week, symptoms, concerns);
      setAiOutput(finalText, "ready");
      return finalText;
    } catch (e) {
      firstError = e;
    }

    try {
      const text = await callGroqChatEndpoint({ week, symptoms, concerns });
      const finalText = text || offlineBrief(week, symptoms, concerns);
      setAiOutput(finalText, "ready");
      return finalText;
    } catch (e) {
      const msg = e.message || firstError?.message || "backend unavailable";
      const fallback = `${offlineBrief(week, symptoms, concerns)}\n\nGroq status: ${msg}`;
      setAiOutput(fallback, "fallback");
      return fallback;
    }
  };

  const renderFocus = (state) => {
    const w = q("#pregxFocusWeek");
    const t = q("#pregxFocusTrimester");
    const d = q("#pregxFocusDaysLeft");
    const p = q("#pregxFocusPlan");
    const feed = q("#pregxFocusFeed");
    const brief = q("#pregxFocusBrief");

    const computed = computePregnancy(state.baseType, state.baseDate);
    if (w) w.textContent = `Week ${computed ? computed.week : state.selectedWeek}`;
    if (t) t.textContent = computed ? computed.trimester : "--";
    if (d) d.textContent = computed ? String(computed.daysLeft) : "--";

    const plan = defaultPlan;
    const done = state.planDone || {};
    const total = plan.length;
    const completed = plan.filter((x) => done[x.id]).length;
    if (p) p.textContent = `${completed}/${total}`;

    if (feed) {
      const lastSymptom = [...state.symptoms].sort((a, b) => (a.at < b.at ? 1 : -1))[0];
      const lastKick = [...state.kicks].sort((a, b) => (a.at < b.at ? 1 : -1))[0];
      const blocks = [];
      if (lastSymptom) {
        const sd = new Date(lastSymptom.at);
        blocks.push(`Last symptom: ${lastSymptom.name} (${lastSymptom.severity}/10) • ${formatTime(sd)}`);
      }
      if (lastKick) {
        const kd = new Date(lastKick.at);
        blocks.push(`Last kick: ${formatTime(kd)}`);
      }
      feed.textContent = blocks.length ? blocks.join("\n") : "No recent logs. Use Quick Log to create your first signal.";
    }

    if (brief) {
      brief.textContent = "Generate an instant briefing to impress your supervisor.";
    }
  };

  const init = () => {
    const root = q("#pregnancy");
    if (!root) return;
    if (root.dataset.pregxReady === "true") {
      const state = loadState();
      renderSetup(state);
      renderTimeline(state);
      renderWeekIntel(state);
      renderSymptoms(state);
      renderVitals(state);
      renderKicks(state);
      renderContractions(state, null);
      renderPlan(state);
      renderReminders(state);
      renderFocus(state);
      return;
    }
    root.dataset.pregxReady = "true";

    let state = loadState();
    let contractionRunning = null;
    let contractionTick = null;

    renderSetup(state);
    renderTimeline(state);
    renderWeekIntel(state);
    renderSymptoms(state);
    renderVitals(state);
    renderKicks(state);
    renderContractions(state, contractionRunning);
    renderPlan(state);
    renderReminders(state);

    const baseDateEl = q("#pregxBaseDate");
    const baseTypeEl = q("#pregxBaseType");
    const saveSetupEl = q("#pregxSaveSetup");
    const jumpSetupEl = q("#pregxJumpSetup");

    if (jumpSetupEl) {
      jumpSetupEl.addEventListener("click", () => {
        const card = q("#pregxSetupCard");
        if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }

    if (baseTypeEl) {
      baseTypeEl.addEventListener("click", (e) => {
        const btn = e.target && e.target.closest ? e.target.closest(".pregx-seg-btn") : null;
        if (!btn) return;
        state = saveState({ baseType: btn.dataset.value || "lmp" });
        renderSetup(state);
        renderTimeline(state);
        renderWeekIntel(state);
        renderFocus(state);
        if (window.DB_SYNC) window.DB_SYNC.savePregnancy({ type: 'setup', baseType: btn.dataset.value, baseDate: state.baseDate });
      });
    }

    if (baseDateEl) {
      baseDateEl.addEventListener("change", () => {
        state = saveState({ baseDate: baseDateEl.value });
        renderSetup(state);
      });
    }

    if (saveSetupEl) {
      saveSetupEl.addEventListener("click", () => {
        const computed = computePregnancy(state.baseType, state.baseDate);
        if (computed) {
          state = saveState({ selectedWeek: computed.week });
          renderSetup(state);
          renderTimeline(state);
          renderWeekIntel(state);
          q("#pregxAiWeek") && (q("#pregxAiWeek").value = String(computed.week));
        }
      });
    }

    const range = q("#pregxWeekRange");
    const rail = q("#pregxTimelineRail");

    if (range) {
      range.addEventListener("input", () => {
        state = saveState({ selectedWeek: clamp(parseInt(range.value, 10) || 1, 1, 42) });
        renderTimeline(state);
        renderWeekIntel(state);
        q("#pregxAiWeek") && (q("#pregxAiWeek").value = String(state.selectedWeek));
      });
    }

    if (rail) {
      rail.addEventListener("click", (e) => {
        const tick = e.target && e.target.closest ? e.target.closest(".pregx-tick") : null;
        if (!tick) return;
        const week = clamp(parseInt(tick.dataset.week, 10) || 1, 1, 42);
        state = saveState({ selectedWeek: week });
        renderTimeline(state);
        renderWeekIntel(state);
        q("#pregxAiWeek") && (q("#pregxAiWeek").value = String(week));
      });
    }

    const severity = q("#pregxSymptomSeverity");
    const severityLabel = q("#pregxSymptomSeverityLabel");
    if (severity && severityLabel) {
      severity.addEventListener("input", () => {
        severityLabel.textContent = `${severity.value} / 10`;
      });
    }

    const symptomsForm = q("#pregxSymptomsForm");
    if (symptomsForm) {
      symptomsForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = q("#pregxSymptomName")?.value || "";
        const sev = parseInt(q("#pregxSymptomSeverity")?.value || "0", 10);
        const note = q("#pregxSymptomNote")?.value || "";
        if (!name) return;
        const item = { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), at: new Date().toISOString(), name, severity: clamp(sev, 0, 10), note };
        state = saveState({ symptoms: [...state.symptoms, item] });
        q("#pregxSymptomNote") && (q("#pregxSymptomNote").value = "");
        renderSymptoms(state);
        q("#pregxAiSymptoms") && (q("#pregxAiSymptoms").value = getLatestSymptomsString(state));
        renderFocus(state);
        if (window.DB_SYNC) window.DB_SYNC.savePregnancy({ type: 'symptom', ...item });
      });
    }

    const symptomsList = q("#pregxSymptomsList");
    if (symptomsList) {
      symptomsList.addEventListener("click", (e) => {
        const btn = e.target && e.target.closest ? e.target.closest("[data-action]") : null;
        if (!btn) return;
        if (btn.dataset.action === "delete-symptom") {
          state = saveState({ symptoms: state.symptoms.filter((s) => s.id !== btn.dataset.id) });
          renderSymptoms(state);
          q("#pregxAiSymptoms") && (q("#pregxAiSymptoms").value = getLatestSymptomsString(state));
          renderFocus(state);
        }
      });
    }

    const vitalsForm = q("#pregxVitalsForm");
    if (vitalsForm) {
      vitalsForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const weight = parseFloat(q("#pregxWeight")?.value || "");
        const bpSys = parseInt(q("#pregxBpSys")?.value || "", 10);

        const item = {
          id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
          at: new Date().toISOString(),
          weight: Number.isFinite(weight) ? weight : null,
          bpSys: Number.isFinite(bpSys) ? bpSys : null
        };

        state = saveState({ vitals: [...state.vitals, item] });
        q("#pregxWeight") && (q("#pregxWeight").value = "");
        q("#pregxBpSys") && (q("#pregxBpSys").value = "");
        renderVitals(state);
        renderFocus(state);
        if (window.DB_SYNC) window.DB_SYNC.savePregnancy({ type: 'vitals', ...item });
      });
    }

    const vitalsList = q("#pregxVitalsList");
    if (vitalsList) {
      vitalsList.addEventListener("click", (e) => {
        const btn = e.target && e.target.closest ? e.target.closest("[data-action]") : null;
        if (!btn) return;
        if (btn.dataset.action === "delete-vitals") {
          state = saveState({ vitals: state.vitals.filter((v) => v.id !== btn.dataset.id) });
          renderVitals(state);
          renderFocus(state);
        }
      });
    }

    const kickAdd = q("#pregxKickAdd");
    const kickClear = q("#pregxKickClear");
    const kicksList = q("#pregxKicksList");

    if (kickAdd) {
      kickAdd.addEventListener("click", () => {
        const item = { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), at: new Date().toISOString() };
        state = saveState({ kicks: [...state.kicks, item] });
        renderKicks(state);
        renderFocus(state);
        if (window.DB_SYNC) window.DB_SYNC.savePregnancy({ type: 'kick', ...item });
      });
    }

    if (kickClear) {
      kickClear.addEventListener("click", () => {
        state = saveState({ kicks: [] });
        renderKicks(state);
        renderFocus(state);
      });
    }

    if (kicksList) {
      kicksList.addEventListener("click", (e) => {
        const btn = e.target && e.target.closest ? e.target.closest("[data-action]") : null;
        if (!btn) return;
        if (btn.dataset.action === "delete-kick") {
          state = saveState({ kicks: state.kicks.filter((k) => k.id !== btn.dataset.id) });
          renderKicks(state);
          renderFocus(state);
        }
      });
    }

    const ctStart = q("#pregxCtStart");
    const ctStop = q("#pregxCtStop");
    if (ctStart) {
      ctStart.addEventListener("click", () => {
        if (contractionRunning) return;
        contractionRunning = { startedAt: Date.now() };
        if (!contractionTick) {
          contractionTick = window.setInterval(() => renderContractions(state, contractionRunning), 250);
        }
        renderContractions(state, contractionRunning);
      });
    }

    if (ctStop) {
      ctStop.addEventListener("click", () => {
        if (!contractionRunning) return;
        const endedAt = Date.now();
        const durationMs = endedAt - contractionRunning.startedAt;
        const last = [...state.contractions].sort((a, b) => (a.startedAt > b.startedAt ? 1 : -1)).slice(-1)[0];
        const intervalMs = last ? contractionRunning.startedAt - last.startedAt : null;
        const item = {
          id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
          startedAt: contractionRunning.startedAt,
          endedAt,
          durationMs,
          intervalMs: typeof intervalMs === "number" ? intervalMs : null
        };
        contractionRunning = null;
        state = saveState({ contractions: [...state.contractions, item] });
        renderContractions(state, contractionRunning);
        renderFocus(state);
        if (window.DB_SYNC) window.DB_SYNC.savePregnancy({ type: 'contraction', ...item });
      });
    }

    const ctList = q("#pregxCtList");
    if (ctList) {
      ctList.addEventListener("click", (e) => {
        const btn = e.target && e.target.closest ? e.target.closest("[data-action]") : null;
        if (!btn) return;
        if (btn.dataset.action === "delete-ct") {
          state = saveState({ contractions: state.contractions.filter((c) => c.id !== btn.dataset.id) });
          renderContractions(state, contractionRunning);
          renderFocus(state);
        }
      });
    }

    const planList = q("#pregxPlanList");
    if (planList) {
      planList.addEventListener("click", (e) => {
        const btn = e.target && e.target.closest ? e.target.closest("[data-action]") : null;
        if (!btn) return;
        if (btn.dataset.action === "toggle-plan") {
          const done = { ...(state.planDone || {}) };
          const id = btn.dataset.id;
          done[id] = !done[id];
          state = saveState({ planDone: done });
          renderPlan(state);
          renderFocus(state);
          if (window.DB_SYNC) window.DB_SYNC.saveActivity({ type: 'plan-item', id, checked: done[id] });
        }
      });
    }

    const reminderForm = q("#pregxReminderForm");
    if (reminderForm) {
      reminderForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = q("#pregxReminderText")?.value || "";
        const when = q("#pregxReminderWhen")?.value || "";
        if (!text || !when) return;
        const item = { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), text, when };
        state = saveState({ reminders: [...state.reminders, item] });
        q("#pregxReminderText") && (q("#pregxReminderText").value = "");
        renderReminders(state);
        if (window.DB_SYNC) window.DB_SYNC.saveAppointment({ type: 'reminder', ...item });
      });
    }

    const remindersList = q("#pregxRemindersList");
    if (remindersList) {
      remindersList.addEventListener("click", (e) => {
        const btn = e.target && e.target.closest ? e.target.closest("[data-action]") : null;
        if (!btn) return;
        if (btn.dataset.action === "delete-reminder") {
          state = saveState({ reminders: state.reminders.filter((r) => r.id !== btn.dataset.id) });
          renderReminders(state);
        }
      });
    }

    const tabs = q("#pregxTabs");
    if (tabs) {
      tabs.addEventListener("click", (e) => {
        const btn = e.target && e.target.closest ? e.target.closest(".pregx-tab") : null;
        if (!btn) return;
        setActiveTab(btn.dataset.tab);
      });
    }

    const aiForm = q("#pregxAiForm");
    if (aiForm) {
      q("#pregxAiWeek") && (q("#pregxAiWeek").value = String(state.selectedWeek));
      q("#pregxAiSymptoms") && (q("#pregxAiSymptoms").value = getLatestSymptomsString(state));
      setAiOutput("Enter your week + concerns, then generate a briefing.", "idle");

      aiForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const week = clamp(parseInt(q("#pregxAiWeek")?.value || "1", 10) || 1, 1, 42);
        const symptoms = q("#pregxAiSymptoms")?.value || "";
        const concerns = q("#pregxAiConcerns")?.value || "";
        const submit = aiForm.querySelector('button[type="submit"]');
        if (submit) {
          submit.disabled = true;
          submit.textContent = "Generating...";
        }
        try {
          await generateAiBriefing(week, symptoms, concerns);
        } finally {
          if (submit) {
            submit.disabled = false;
            submit.textContent = "Generate Briefing";
          }
        }
      });
    }

    window.openPregnancyModal = () => {
      const modal = q("#pregnancyAdvancedModal");
      if (!modal) return;
      modal.classList.remove("hidden");
      renderFocus(loadState());
    };

    window.closePregnancyModal = () => {
      const modal = q("#pregnancyAdvancedModal");
      if (!modal) return;
      modal.classList.add("hidden");
    };

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const modal = q("#pregnancyAdvancedModal");
      if (modal && !modal.classList.contains("hidden")) window.closePregnancyModal();
    });

    const focusJump = q("#pregxFocusJump");
    if (focusJump) {
      focusJump.addEventListener("click", () => {
        window.closePregnancyModal();
        const top = q("#pregxTimelineCard");
        if (top) top.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    const focusKick = q("#pregxFocusKick");
    if (focusKick) {
      focusKick.addEventListener("click", () => {
        q("#pregxKickAdd")?.click();
      });
    }

    const focusSymptom = q("#pregxFocusSymptom");
    if (focusSymptom) {
      focusSymptom.addEventListener("click", () => {
        window.closePregnancyModal();
        setActiveTab("symptoms");
        q("#pregxTrackersCard")?.scrollIntoView({ behavior: "smooth", block: "center" });
        q("#pregxSymptomName")?.focus();
      });
    }

    const focusGenerate = q("#pregxFocusGenerate");
    if (focusGenerate) {
      focusGenerate.addEventListener("click", async () => {
        const computed = computePregnancy(state.baseType, state.baseDate);
        const week = computed ? computed.week : state.selectedWeek;
        const symptoms = getLatestSymptomsString(state);
        focusGenerate.disabled = true;
        focusGenerate.textContent = "Generating...";
        try {
          await generateAiBriefing(week, symptoms, "");
        } finally {
          focusGenerate.disabled = false;
          focusGenerate.textContent = "Generate Now";
        }
      });
    }

    renderFocus(state);
  };

  window.initializePregnancyNeon = init;
  window.generatePregnancyAIBriefing = generateAiBriefing;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
