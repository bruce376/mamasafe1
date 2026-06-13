(() => {
  const STORAGE_KEY = "babyx_state_v1";
  const MAX_LOG_ITEMS = 60;
  const MS_MIN = 60 * 1000;
  const MS_HOUR = 60 * MS_MIN;
  const MS_DAY = 24 * MS_HOUR;
  const API_CACHE_MAX_AGE = 10 * MS_MIN;

  const q = (sel, root = document) => root.querySelector(sel);
  const qa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const safeJsonParse = (value, fallback) => {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  const formatNumber = (n, digits = 1) => {
    if (typeof n !== "number" || Number.isNaN(n)) return "--";
    return n.toFixed(digits);
  };

  const formatDateTimeLocal = (d) => {
    if (!(d instanceof Date) || Number.isNaN(d.getTime())) return "";
    const pad2 = (v) => String(v).padStart(2, "0");
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  };

  const formatHumanDateTime = (d) => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }).format(d);
    } catch {
      return d.toLocaleString();
    }
  };

  const loadState = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = safeJsonParse(raw, {});
    const state = parsed && typeof parsed === "object" ? parsed : {};
    return {
      profile: state.profile && typeof state.profile === "object" ? state.profile : {},
      age: state.age && typeof state.age === "object" ? state.age : {},
      logs: state.logs && typeof state.logs === "object" ? state.logs : {},
      progress: state.progress && typeof state.progress === "object" ? state.progress : {}
    };
  };

  const saveState = (patch) => {
    const next = { ...loadState(), ...patch };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  };

  const getProfile = (state) => {
    const p = state.profile || {};
    return {
      name: typeof p.name === "string" ? p.name : "",
      birth: typeof p.birth === "string" ? p.birth : "",
      weight: typeof p.weight === "number" ? p.weight : null,
      length: typeof p.length === "number" ? p.length : null,
      head: typeof p.head === "number" ? p.head : null,
      feeding: typeof p.feeding === "string" ? p.feeding : ""
    };
  };

  const getAgeState = (state) => {
    const a = state.age || {};
    return {
      category: a.category === "second-year" || a.category === "third-year" ? a.category : "first-year",
      mode: a.mode === "weeks" ? "weeks" : "months",
      selected: a.selected && typeof a.selected === "object" ? a.selected : null
    };
  };

  const getLogs = (state) => {
    const logs = state.logs || {};
    const normalize = (arr) => (Array.isArray(arr) ? arr : []).filter((x) => x && typeof x === "object");
    return {
      growth: normalize(logs.growth),
      feeding: normalize(logs.feeding),
      sleep: normalize(logs.sleep)
    };
  };

  const getProgress = (state) => {
    const p = state.progress || {};
    const normalizeObj = (o) => (o && typeof o === "object" ? o : {});
    return {
      milestonesDone: normalizeObj(p.milestonesDone),
      vaccinesDone: normalizeObj(p.vaccinesDone)
    };
  };

  const parseDate = (value) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  };

  const computeAgeFromBirth = (birthStr) => {
    const birth = parseDate(birthStr);
    if (!birth) return null;
    const now = new Date();
    const diffDays = Math.max(0, Math.floor((now.getTime() - birth.getTime()) / MS_DAY));
    const weeks = Math.floor(diffDays / 7);
    const months = Math.floor(diffDays / 30.4375);
    return { days: diffDays, weeks, months };
  };

  const computeAgeMonths = (profile, ageState) => {
    const fromBirth = profile.birth ? computeAgeFromBirth(profile.birth) : null;
    if (fromBirth) return fromBirth.months;
    const selected = ageState.selected;
    if (!selected || typeof selected !== "object") return null;
    if (selected.type === "months" && typeof selected.value === "number") return clamp(selected.value, 0, 60);
    if (selected.type === "weeks" && typeof selected.value === "number") return clamp(Math.floor(selected.value / 4.345), 0, 60);
    return null;
  };

  const getFeedingIntervalHours = (ageMonths, feeding) => {
    if (feeding === "solids") {
      if (typeof ageMonths === "number" && ageMonths >= 9) return 3.5;
      return 4;
    }
    if (typeof ageMonths === "number" && ageMonths <= 1) return 2.5;
    if (typeof ageMonths === "number" && ageMonths <= 3) return 3;
    if (typeof ageMonths === "number" && ageMonths <= 6) return 3.5;
    return 4;
  };

  const ensureIso = (value) => {
    const d = parseDate(value);
    return d ? d.toISOString() : new Date().toISOString();
  };

  const toFixedList = (list, maxItems) => list.slice(0, maxItems);

  const mount = () => {
    const root = q("#fbc2eby");
    if (!root) return null;
    const required = [
      "#fbc2ebyxJumpSetup",
      "#fbc2ebyxOpenQuick",
      "#fbc2ebyxQuickModal",
      "#fbc2ebyxCloseQuick",
      "#fbc2ebyxQuickGenerateAi",
      "#fbc2ebyxBuildProfile",
      "#fbc2ebyxTabs",
      "#fbc2ebyxAgeGrid",
      "#fbc2ebyxStartTracking",
      "#fbc2ebyxClearAge",
      "#fbc2ebyxGrowthForm",
      "#fbc2ebyxGoGrowthAI",
      "#fbc2ebyxFeedingForm",
      "#fbc2ebyxSleepForm",
      "#fbc2ebyxAiForm",
      "#fbc2ebyxMilestones",
      "#fbc2ebyxVaccines"
    ];

    const ok = required.every((sel) => q(sel));
    if (!ok) return null;

    return {
      root,
      setupCard: q("#fbc2ebyxSetupCard"),
      setupMeta: q("#fbc2ebyxSetupMeta"),
      profileOut: q("#fbc2ebyxProfile"),
      stats: {
        age: q("#fbc2ebyxStatAge"),
        focus: q("#fbc2ebyxStatFocus"),
        sleep: q("#fbc2ebyxStatSleep"),
        feed: q("#fbc2ebyxStatFeed")
      },
      setup: {
        name: q("#fbc2ebyxName"),
        birth: q("#fbc2ebyxBirth"),
        weight: q("#fbc2ebyxWeight"),
        length: q("#fbc2ebyxLength"),
        head: q("#fbc2ebyxHead"),
        feeding: q("#fbc2ebyxFeeding")
      },
      tabs: q("#fbc2ebyxTabs"),
      selectedAgePill: q("#fbc2ebyxSelectedAge"),
      segs: {
        category: q("#fbc2ebyxAgeCategory"),
        mode: q("#fbc2ebyxAgeMode")
      },
      ageGrid: q("#fbc2ebyxAgeGrid"),
      ageActions: {
        start: q("#fbc2ebyxStartTracking"),
        clear: q("#fbc2ebyxClearAge")
      },
      panels: qa(".babyx-panel"),
      quick: {
        modal: q("#fbc2ebyxQuickModal"),
        open: q("#fbc2ebyxOpenQuick"),
        close: q("#fbc2ebyxCloseQuick"),
        jump: q("#fbc2ebyxJumpSetup"),
        age: q("#fbc2ebyxQuickAge"),
        snapshot: q("#fbc2ebyxQuickSnapshot"),
        feed: q("#fbc2ebyxQuickFeed"),
        sleep: q("#fbc2ebyxQuickSleep"),
        feedStatus: q("#fbc2ebyxQuickFeedStatus"),
        aiOut: q("#fbc2ebyxQuickAi"),
        aiRun: q("#fbc2ebyxQuickGenerateAi")
      },
      growth: {
        form: q("#fbc2ebyxGrowthForm"),
        weight: q("#fbc2ebyxGrowthWeight"),
        length: q("#fbc2ebyxGrowthLength"),
        head: q("#fbc2ebyxGrowthHead"),
        when: q("#fbc2ebyxGrowthWhen"),
        chart: q("#fbc2ebyxGrowthChart"),
        list: q("#fbc2ebyxGrowthList"),
        goAI: q("#fbc2ebyxGoGrowthAI")
      },
      feeding: {
        form: q("#fbc2ebyxFeedingForm"),
        type: q("#fbc2ebyxFeedType"),
        amount: q("#fbc2ebyxFeedAmount"),
        when: q("#fbc2ebyxFeedWhen"),
        note: q("#fbc2ebyxFeedNote"),
        summary: q("#fbc2ebyxFeedingSummary"),
        schedule: q("#fbc2ebyxFeedingSchedule"),
        list: q("#fbc2ebyxFeedingList")
      },
      sleep: {
        form: q("#fbc2ebyxSleepForm"),
        start: q("#fbc2ebyxSleepStart"),
        end: q("#fbc2ebyxSleepEnd"),
        summary: q("#fbc2ebyxSleepSummary"),
        chart: q("#fbc2ebyxSleepChart"),
        list: q("#fbc2ebyxSleepList")
      },
      milestones: {
        list: q("#fbc2ebyxMilestones"),
        vaccines: q("#fbc2ebyxVaccines"),
        progress: q("#fbc2ebyxMilestoneProgress")
      },
      ai: {
        form: q("#fbc2ebyxAiForm"),
        age: q("#fbc2ebyxAiAge"),
        goal: q("#fbc2ebyxAiGoal"),
        notes: q("#fbc2ebyxAiNotes"),
        out: q("#fbc2ebyxAiOutput")
      }
    };
  };

  const renderSetup = (ui, state) => {
    const profile = getProfile(state);
    if (ui.setup.name) ui.setup.name.value = profile.name || "";
    if (ui.setup.birth) ui.setup.birth.value = profile.birth || "";
    if (ui.setup.weight) ui.setup.weight.value = typeof profile.weight === "number" ? String(profile.weight) : "";
    if (ui.setup.length) ui.setup.length.value = typeof profile.length === "number" ? String(profile.length) : "";
    if (ui.setup.head) ui.setup.head.value = typeof profile.head === "number" ? String(profile.head) : "";
    if (ui.setup.feeding) ui.setup.feeding.value = profile.feeding || "";

    const age = profile.birth ? computeAgeFromBirth(profile.birth) : null;
    if (ui.setupMeta) {
      ui.setupMeta.textContent = profile.name ? `Profile ready for ${profile.name}` : "Create the profile once, then everything adapts";
      if (age) ui.setupMeta.textContent = `Profile ready • ${age.days} days old`;
    }
  };

  const renderProfile = (ui, state) => {
    const profile = getProfile(state);
    const age = profile.birth ? computeAgeFromBirth(profile.birth) : null;
    const ageLabel = age ? `${age.months}m • ${age.weeks}w • ${age.days}d` : "--";
    const ageMonths = computeAgeMonths(profile, getAgeState(state));
    const feedInterval = getFeedingIntervalHours(ageMonths, profile.feeding);

    if (ui.stats.age) ui.stats.age.textContent = ageLabel;
    if (ui.stats.focus) ui.stats.focus.textContent = typeof ageMonths === "number" ? (ageMonths < 3 ? "Sleep + feeding" : ageMonths < 6 ? "Growth + routines" : "Milestones + solids") : "--";
    if (ui.stats.sleep) ui.stats.sleep.textContent = typeof ageMonths === "number" ? (ageMonths < 3 ? "16–18h/day" : ageMonths < 6 ? "14–16h/day" : "12–14h/day") : "--";
    if (ui.stats.feed) ui.stats.feed.textContent = `${feedInterval}h`;

    if (!ui.profileOut) return;
    if (!profile.name) {
      ui.profileOut.innerHTML = "";
      return;
    }

    ui.profileOut.innerHTML = `
      <div class="babyx-profile-card">
        <div class="babyx-profile-title">${profile.name}</div>
        <div class="babyx-profile-grid">
          <div class="babyx-profile-item">
            <div class="babyx-profile-k">Age</div>
            <div class="babyx-profile-v">${age ? `${age.days}d` : "--"}</div>
          </div>
          <div class="babyx-profile-item">
            <div class="babyx-profile-k">Weight</div>
            <div class="babyx-profile-v">${profile.weight != null ? `${formatNumber(profile.weight, 1)} kg` : "--"}</div>
          </div>
          <div class="babyx-profile-item">
            <div class="babyx-profile-k">Length</div>
            <div class="babyx-profile-v">${profile.length != null ? `${formatNumber(profile.length, 1)} cm` : "--"}</div>
          </div>
          <div class="babyx-profile-item">
            <div class="babyx-profile-k">Head</div>
            <div class="babyx-profile-v">${profile.head != null ? `${formatNumber(profile.head, 1)} cm` : "--"}</div>
          </div>
          <div class="babyx-profile-item">
            <div class="babyx-profile-k">Feeding</div>
            <div class="babyx-profile-v">${profile.feeding || "--"}</div>
          </div>
          <div class="babyx-profile-item">
            <div class="babyx-profile-k">Cadence</div>
            <div class="babyx-profile-v">${feedInterval}h</div>
          </div>
        </div>
      </div>
    `;
  };

  const getAgeOptions = (category, mode) => {
    if (mode === "weeks") {
      const base = category === "first-year" ? 1 : category === "second-year" ? 53 : 105;
      return Array.from({ length: 52 }, (_, i) => {
        const v = base + i;
        return { label: `${v}w`, value: v, type: "weeks" };
      });
    }

    if (category === "first-year") {
      return [{ label: "NB", value: 0, type: "months" }].concat(
        Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}m`, value: i + 1, type: "months" }))
      );
    }

    if (category === "second-year") {
      return Array.from({ length: 12 }, (_, i) => ({ label: `${i + 13}m`, value: i + 13, type: "months" }));
    }

    return Array.from({ length: 12 }, (_, i) => ({ label: `${i + 25}m`, value: i + 25, type: "months" }));
  };

  const renderAge = (ui, state) => {
    const ageState = getAgeState(state);

    qa(".babyx-seg-btn", ui.segs.category).forEach((btn) => btn.classList.toggle("active", btn.dataset.value === ageState.category));
    qa(".babyx-seg-btn", ui.segs.mode).forEach((btn) => btn.classList.toggle("active", btn.dataset.value === ageState.mode));

    const options = getAgeOptions(ageState.category, ageState.mode);
    const selected = ageState.selected;

    ui.ageGrid.innerHTML = "";
    const frag = document.createDocumentFragment();
    options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "babyx-age-btn";
      btn.dataset.type = opt.type;
      btn.dataset.value = String(opt.value);
      btn.textContent = opt.label;
      if (selected && selected.type === opt.type && selected.value === opt.value) btn.classList.add("active");
      frag.appendChild(btn);
    });
    ui.ageGrid.appendChild(frag);

    if (ui.selectedAgePill) {
      ui.selectedAgePill.textContent = selected ? `${selected.label} selected` : "No age selected";
    }
    if (ui.quick.age) {
      ui.quick.age.textContent = selected ? `Age ${selected.label}` : "Age --";
    }
    if (ui.ai.age && !ui.ai.age.value && selected) {
      ui.ai.age.value = selected.label;
    }
  };

  const normalizeLogList = (list) =>
    toFixedList(
      list
        .map((x) => ({ ...x, when: ensureIso(x.when) }))
        .sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime()),
      MAX_LOG_ITEMS
    );

  const addGrowth = (state, item) => {
    const logs = getLogs(state);
    const next = normalizeLogList([{ ...item, when: ensureIso(item.when) }, ...logs.growth]);
    return saveState({ logs: { ...state.logs, growth: next } });
  };

  const addFeed = (state, item) => {
    const logs = getLogs(state);
    const next = normalizeLogList([{ ...item, when: ensureIso(item.when) }, ...logs.feeding]);
    return saveState({ logs: { ...state.logs, feeding: next } });
  };

  const addSleep = (state, item) => {
    const logs = getLogs(state);
    const next = normalizeLogList([{ ...item, start: ensureIso(item.start), end: ensureIso(item.end) }, ...logs.sleep]);
    return saveState({ logs: { ...state.logs, sleep: next } });
  };

  const renderGrowth = (ui, state) => {
    const { growth } = getLogs(state);
    if (!ui.growth.list || !ui.growth.chart) return;

    const latest = growth[0];
    const points = growth
      .slice(0, 14)
      .map((x) => {
        const w = typeof x.weight === "number" ? x.weight : null;
        const when = parseDate(x.when);
        return w != null && when ? { w, t: when.getTime() } : null;
      })
      .filter(Boolean)
      .reverse();

    ui.growth.list.innerHTML = growth
      .slice(0, 10)
      .map((x) => {
        const when = parseDate(x.when);
        return `
          <div class="babyx-row">
            <div class="babyx-row-main">
              <div class="babyx-row-title">${when ? formatHumanDateTime(when) : "—"}</div>
              <div class="babyx-row-sub">${x.note ? String(x.note) : ""}</div>
            </div>
            <div class="babyx-row-meta">
              <div>${typeof x.weight === "number" ? `${formatNumber(x.weight, 1)} kg` : "--"}</div>
              <div>${typeof x.length === "number" ? `${formatNumber(x.length, 1)} cm` : "--"}</div>
            </div>
          </div>
        `;
      })
      .join("");

    const renderSvg = () => {
      if (points.length < 2) {
        ui.growth.chart.innerHTML = `
          <div class="babyx-empty">
            <div class="babyx-empty-title">No chart yet</div>
            <div class="babyx-empty-sub">Add 2+ measurements to render a trendline</div>
          </div>
        `;
        return;
      }

      const minW = Math.min(...points.map((p) => p.w));
      const maxW = Math.max(...points.map((p) => p.w));
      const spanW = Math.max(0.2, maxW - minW);
      const w0 = points[0].t;
      const w1 = points[points.length - 1].t;
      const spanT = Math.max(MS_HOUR, w1 - w0);

      const width = 640;
      const height = 220;
      const padX = 18;
      const padY = 18;

      const x = (t) => padX + ((t - w0) / spanT) * (width - padX * 2);
      const y = (w) => height - padY - ((w - minW) / spanW) * (height - padY * 2);

      const d = points
        .map((p, idx) => {
          const px = x(p.t);
          const py = y(p.w);
          return `${idx === 0 ? "M" : "L"} ${px} ${py}`;
        })
        .join(" ");

      ui.growth.chart.innerHTML = `
        <div class="babyx-chart-shell">
          <svg class="babyx-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="Growth trendline chart">
            <defs>
              <linearGradient id="babyxLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stop-color="rgba(0,240,255,0.95)" />
                <stop offset="1" stop-color="rgba(255,0,204,0.95)" />
              </linearGradient>
              <linearGradient id="babyxFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="rgba(0,240,255,0.22)" />
                <stop offset="1" stop-color="rgba(0,0,0,0)" />
              </linearGradient>
            </defs>
            <path d="${d} L ${x(points[points.length - 1].t)} ${height - padY} L ${x(points[0].t)} ${height - padY} Z" fill="url(#fbc2ebyxFill)"></path>
            <path d="${d}" fill="none" stroke="url(#fbc2ebyxLine)" stroke-width="3" stroke-linecap="round"></path>
            ${points
              .map((p) => `<circle cx="${x(p.t)}" cy="${y(p.w)}" r="4" fill="rgba(255,255,255,0.92)"></circle>`)
              .join("")}
          </svg>
          <div class="babyx-chart-meta">
            <div class="babyx-chart-k">Latest</div>
            <div class="babyx-chart-v">${latest && typeof latest.weight === "number" ? `${formatNumber(latest.weight, 1)} kg` : "--"}</div>
          </div>
        </div>
      `;
    };

    requestAnimationFrame(renderSvg);
  };

  const computeFeedCadence = (feedLogs) => {
    const times = feedLogs
      .slice(0, 12)
      .map((x) => parseDate(x.when))
      .filter(Boolean)
      .map((d) => d.getTime())
      .sort((a, b) => a - b);

    if (times.length < 2) return null;
    const gaps = [];
    for (let i = 1; i < times.length; i += 1) gaps.push((times[i] - times[i - 1]) / MS_HOUR);
    const avg = gaps.reduce((sum, v) => sum + v, 0) / gaps.length;
    return clamp(avg, 0.5, 12);
  };

  const renderFeeding = (ui, state) => {
    const profile = getProfile(state);
    const ageState = getAgeState(state);
    const ageMonths = computeAgeMonths(profile, ageState);

    const { feeding } = getLogs(state);
    if (!ui.feeding.list || !ui.feeding.schedule || !ui.feeding.summary) return;

    const cadence = computeFeedCadence(feeding);
    const interval = getFeedingIntervalHours(ageMonths, profile.feeding);
    const last = feeding[0] ? parseDate(feeding[0].when) : null;
    const next = last ? new Date(last.getTime() + interval * MS_HOUR) : null;

    ui.feeding.summary.textContent = feeding.length ? `${feeding.length} logs • ${cadence ? `${cadence.toFixed(1)}h avg` : `${interval}h target`}` : "No logs yet";

    const scheduleSlots = [];
    if (next) {
      for (let i = 0; i < 4; i += 1) scheduleSlots.push(new Date(next.getTime() + i * interval * MS_HOUR));
    }

    ui.feeding.schedule.innerHTML = scheduleSlots.length
      ? `
        <div class="babyx-schedule-grid">
          ${scheduleSlots
            .map(
              (d, idx) => `
              <div class="babyx-schedule-card">
                <div class="babyx-schedule-k">${idx === 0 ? "Next" : `+${idx}`}</div>
                <div class="babyx-schedule-v">${formatHumanDateTime(d)}</div>
              </div>
            `
            )
            .join("")}
        </div>
      `
      : `
        <div class="babyx-empty">
          <div class="babyx-empty-title">No schedule yet</div>
          <div class="babyx-empty-sub">Log a feed to generate upcoming times</div>
        </div>
      `;

    ui.feeding.list.innerHTML = feeding
      .slice(0, 10)
      .map((x) => {
        const when = parseDate(x.when);
        const amount = typeof x.amount === "number" ? `${Math.round(x.amount)} ${x.unit || "ml"}` : "--";
        return `
          <div class="babyx-row">
            <div class="babyx-row-main">
              <div class="babyx-row-title">${x.type || "feed"} • ${amount}</div>
              <div class="babyx-row-sub">${when ? formatHumanDateTime(when) : "—"}${x.note ? ` • ${String(x.note)}` : ""}</div>
            </div>
            <div class="babyx-row-meta">
              <div>${x.type || "--"}</div>
            </div>
          </div>
        `;
      })
      .join("");
  };

  const computeSleepSummary = (sleepLogs) => {
    if (!sleepLogs.length) return null;
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    let total = 0;
    sleepLogs.slice(0, 40).forEach((x) => {
      const s = parseDate(x.start);
      const e = parseDate(x.end);
      if (!s || !e) return;
      if (e.getTime() < startOfDay) return;
      total += Math.max(0, e.getTime() - Math.max(startOfDay, s.getTime()));
    });
    const hours = total / MS_HOUR;
    return clamp(hours, 0, 24);
  };

  const renderSleep = (ui, state) => {
    const { sleep } = getLogs(state);
    if (!ui.sleep.list || !ui.sleep.chart || !ui.sleep.summary) return;

    const todayHours = computeSleepSummary(sleep);
    ui.sleep.summary.textContent = sleep.length ? (todayHours != null ? `${todayHours.toFixed(1)}h today` : `${sleep.length} logs`) : "No sleep logs yet";

    ui.sleep.list.innerHTML = sleep
      .slice(0, 10)
      .map((x) => {
        const s = parseDate(x.start);
        const e = parseDate(x.end);
        const dur = s && e ? Math.max(0, (e.getTime() - s.getTime()) / MS_MIN) : null;
        return `
          <div class="babyx-row">
            <div class="babyx-row-main">
              <div class="babyx-row-title">${dur != null ? `${Math.round(dur)} min` : "--"}</div>
              <div class="babyx-row-sub">${s ? formatHumanDateTime(s) : "—"} → ${e ? formatHumanDateTime(e) : "—"}</div>
            </div>
            <div class="babyx-row-meta">
              <div>${dur != null ? `${(dur / 60).toFixed(1)}h` : "--"}</div>
            </div>
          </div>
        `;
      })
      .join("");

    const samples = sleep
      .slice(0, 10)
      .map((x) => {
        const s = parseDate(x.start);
        const e = parseDate(x.end);
        if (!s || !e) return null;
        return { t: e.getTime(), h: Math.max(0, (e.getTime() - s.getTime()) / MS_HOUR) };
      })
      .filter(Boolean)
      .reverse();

    if (samples.length < 1) {
      ui.sleep.chart.innerHTML = `
        <div class="babyx-empty">
          <div class="babyx-empty-title">No chart yet</div>
          <div class="babyx-empty-sub">Log a nap or overnight sleep to see patterns</div>
        </div>
      `;
      return;
    }

    const maxH = Math.max(1, ...samples.map((s) => s.h));
    ui.sleep.chart.innerHTML = `
      <div class="babyx-bars">
        ${samples
          .map((s) => {
            const pct = clamp((s.h / maxH) * 100, 6, 100);
            const d = new Date(s.t);
            return `
              <div class="babyx-bar">
                <div class="babyx-bar-fill" style="height:${pct}%"></div>
                <div class="babyx-bar-k">${d.getDate()}</div>
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  };

  const fallbackMilestones = (ageMonths) => {
    const m = typeof ageMonths === "number" ? ageMonths : 0;
    if (m < 3) {
      return [
        { id: "smile", title: "Social smile", area: "Social" },
        { id: "head", title: "Holds head steadier", area: "Motor" },
        { id: "tracks", title: "Tracks objects", area: "Vision" }
      ];
    }
    if (m < 6) {
      return [
        { id: "roll", title: "Rolls over", area: "Motor" },
        { id: "babble", title: "Babbling", area: "Language" },
        { id: "reach", title: "Reaches + grasps", area: "Motor" }
      ];
    }
    if (m < 9) {
      return [
        { id: "sit", title: "Sits without support", area: "Motor" },
        { id: "respond", title: "Responds to name", area: "Language" },
        { id: "transfer", title: "Transfers objects hand-to-hand", area: "Motor" }
      ];
    }
    return [
      { id: "crawl", title: "Crawls / pulls to stand", area: "Motor" },
      { id: "first-words", title: "First words", area: "Language" },
      { id: "pincer", title: "Pincer grasp", area: "Motor" }
    ];
  };

  const fallbackVaccines = (ageMonths) => {
    const m = typeof ageMonths === "number" ? ageMonths : 0;
    if (m < 2) return [{ id: "hep-b", title: "Hep B", when: "Birth" }];
    if (m < 4) return [{ id: "2m", title: "DTaP, Hib, IPV, PCV, Rotavirus", when: "2 months" }];
    if (m < 6) return [{ id: "4m", title: "DTaP, Hib, IPV, PCV, Rotavirus", when: "4 months" }];
    if (m < 12) return [{ id: "6m", title: "DTaP, Hib, IPV, PCV, Flu", when: "6 months" }];
    return [{ id: "12m", title: "MMR, Varicella, Hep A", when: "12 months" }];
  };

  const getApi = () => {
    const api = window.apiService;
    // The apiService doesn't have getMilestones or getVaccineSchedule methods
    // These endpoints don't exist on the backend, so always return null to use fallback
    return null;
  };

  const fetchWithCache = async (api, key, fetcher) => {
    if (!api || typeof api.getCachedData !== "function" || typeof api.cacheData !== "function") return fetcher();
    const cached = await api.getCachedData(key, API_CACHE_MAX_AGE);
    if (cached) return cached;
    const data = await fetcher();
    await api.cacheData(key, data);
    return data;
  };

  const renderMilestones = async (ui, state) => {
    const profile = getProfile(state);
    const ageState = getAgeState(state);
    const ageMonths = computeAgeMonths(profile, ageState);
    const progress = getProgress(state);

    if (!ui.milestones.list || !ui.milestones.vaccines || !ui.milestones.progress) return;

    if (ageMonths == null) {
      ui.milestones.list.innerHTML = `
        <div class="babyx-empty">
          <div class="babyx-empty-title">Select an age</div>
          <div class="babyx-empty-sub">Milestones adapt to age (months) or your birth date</div>
        </div>
      `;
      ui.milestones.vaccines.innerHTML = "";
      ui.milestones.progress.textContent = "0%";
      return;
    }

    const api = getApi();
    let milestones = [];
    let vaccines = [];

    try {
      milestones = api
        ? await fetchWithCache(api, `babyx_milestones_${ageMonths}`, () => api.getMilestones(ageMonths))
        : fallbackMilestones(ageMonths);
    } catch {
      milestones = fallbackMilestones(ageMonths);
    }

    try {
      vaccines = api
        ? await fetchWithCache(api, `babyx_vaccines_${ageMonths}`, () => api.getVaccineSchedule(ageMonths))
        : fallbackVaccines(ageMonths);
    } catch {
      vaccines = fallbackVaccines(ageMonths);
    }

    const milestoneItems = Array.isArray(milestones.data) ? milestones.data : Array.isArray(milestones) ? milestones : [];
    const vaccineItems = Array.isArray(vaccines.data) ? vaccines.data : Array.isArray(vaccines) ? vaccines : [];

    const total = milestoneItems.length;
    const done = milestoneItems.reduce((sum, m) => sum + (progress.milestonesDone[String(m.id || m._id || m.title)] ? 1 : 0), 0);
    const pct = total ? Math.round((done / total) * 100) : 0;
    ui.milestones.progress.textContent = `${pct}%`;

    ui.milestones.list.innerHTML = `
      <div class="babyx-checklist">
        ${milestoneItems
          .map((m) => {
            const id = String(m.id || m._id || m.title);
            const checked = !!progress.milestonesDone[id];
            return `
              <label class="babyx-check">
                <input type="checkbox" data-kind="milestone" data-id="${id}" ${checked ? "checked" : ""}>
                <span class="babyx-check-ui"></span>
                <span class="babyx-check-text">
                  <span class="babyx-check-title">${String(m.title || m.name || id)}</span>
                  <span class="babyx-check-sub">${m.area ? String(m.area) : ""}</span>
                </span>
              </label>
            `;
          })
          .join("")}
      </div>
    `;

    ui.milestones.vaccines.innerHTML = `
      <div class="babyx-checklist babyx-checklist-compact">
        ${vaccineItems
          .map((v) => {
            const id = String(v.id || v._id || v.title);
            const checked = !!progress.vaccinesDone[id];
            return `
              <label class="babyx-check">
                <input type="checkbox" data-kind="vaccine" data-id="${id}" ${checked ? "checked" : ""}>
                <span class="babyx-check-ui"></span>
                <span class="babyx-check-text">
                  <span class="babyx-check-title">${String(v.title || v.name || id)}</span>
                  <span class="babyx-check-sub">${v.when ? String(v.when) : ""}</span>
                </span>
              </label>
            `;
          })
          .join("")}
      </div>
    `;
  };

  const setActivePanel = (panelName) => {
    qa("#fbc2ebyxTabs .babyx-tab").forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === panelName));
    const panel = q(`#fbc2eby .babyx-panel[data-panel="${panelName}"]`);
    if (panel) panel.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const showQuickModal = (ui) => {
    if (!ui.quick.modal) return;
    ui.quick.modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  };

  const hideQuickModal = (ui) => {
    if (!ui.quick.modal) return;
    ui.quick.modal.classList.add("hidden");
    document.body.style.overflow = "";
  };

  const renderQuickSnapshot = (ui, state) => {
    const logs = getLogs(state);
    const feedToday = logs.feeding.filter((x) => {
      const d = parseDate(x.when);
      if (!d) return false;
      const now = new Date();
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    }).length;

    const sleepHours = computeSleepSummary(logs.sleep);
    const growthCount = logs.growth.slice(0, 7).length;

    if (ui.quick.snapshot) {
      ui.quick.snapshot.innerHTML = `
        <div class="babyx-snapshot">
          <div class="babyx-snapshot-item">
            <div class="babyx-snapshot-k">Feeds today</div>
            <div class="babyx-snapshot-v">${feedToday}</div>
          </div>
          <div class="babyx-snapshot-item">
            <div class="babyx-snapshot-k">Sleep today</div>
            <div class="babyx-snapshot-v">${sleepHours != null ? `${sleepHours.toFixed(1)}h` : "--"}</div>
          </div>
          <div class="babyx-snapshot-item">
            <div class="babyx-snapshot-k">Recent growth logs</div>
            <div class="babyx-snapshot-v">${growthCount}</div>
          </div>
        </div>
      `;
    }
  };

  const aiCoach = async ({ age, goal, notes, profile }) => {
    const url = window.mamasafeApiUrl('/api/ai-universal-processor');
    const payload = {
      functionName: "babyx-ai-coach",
      description: "Create a concise, actionable baby care plan tailored to the provided baby profile and age/stage. Include: today plan, do/don't, red flags, and a quick checklist.",
      inputData: {
        goal,
        age,
        notes: notes || "none",
        babyName: profile.name || "baby",
        feeding: profile.feeding || "",
        weightKg: profile.weight != null ? profile.weight : "",
        lengthCm: profile.length != null ? profile.length : "",
        headCm: profile.head != null ? profile.head : ""
      }
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg =
        (data && (data.error || data.details)) ||
        `AI request failed (HTTP ${res.status})`;
      throw new Error(String(msg));
    }
    if (!data || !data.success) throw new Error(data && data.error ? data.error : "AI request failed");
    return String(data.response || "");
  };

  const renderAiOutput = (el, text) => {
    if (!el) return;
    el.innerHTML = text
      ? `<div class="babyx-ai-card">${text.replace(/\n/g, "<br>")}</div>`
      : `<div class="babyx-empty"><div class="babyx-empty-title">No output</div><div class="babyx-empty-sub">Try a different goal or add notes</div></div>`;
  };

  const init = () => {
    const ui = mount();
    if (!ui) return;

    let state = loadState();
    renderSetup(ui, state);
    renderProfile(ui, state);
    renderAge(ui, state);
    renderGrowth(ui, state);
    renderFeeding(ui, state);
    renderSleep(ui, state);
    renderQuickSnapshot(ui, state);
    renderMilestones(ui, state);

    ui.quick.jump.addEventListener("click", () => {
      ui.setupCard.scrollIntoView({ behavior: "smooth", block: "start" });
      ui.setup.name.focus();
    });

    ui.quick.open.addEventListener("click", () => {
      state = loadState();
      renderQuickSnapshot(ui, state);
      showQuickModal(ui);
    });

    ui.quick.close.addEventListener("click", () => hideQuickModal(ui));
    ui.quick.modal.addEventListener("click", (e) => {
      if (e.target === ui.quick.modal) hideQuickModal(ui);
    });

    q("#fbc2ebyxBuildProfile").addEventListener("click", () => {
      const name = ui.setup.name.value.trim();
      const birth = ui.setup.birth.value;
      const weight = Number(ui.setup.weight.value);
      const length = Number(ui.setup.length.value);
      const head = Number(ui.setup.head.value);
      const feeding = ui.setup.feeding.value;

      if (!name) {
        if (typeof window.showNotification === "function") window.showNotification("Enter a baby name", "error");
        ui.setup.name.focus();
        return;
      }

      const profileData = { name, birth: birth || "", weight: Number.isFinite(weight) ? weight : null, length: Number.isFinite(length) ? length : null, head: Number.isFinite(head) ? head : null, feeding: feeding || "" };
      state = saveState({ profile: profileData });
      renderSetup(ui, state);
      renderProfile(ui, state);
      renderFeeding(ui, state);
      renderMilestones(ui, state);
      if (typeof window.showNotification === "function") window.showNotification("Baby profile saved", "success");
      if (window.DB_SYNC) window.DB_SYNC.saveBaby({ type: 'profile', ...profileData });
    });

    ui.tabs.addEventListener("click", (e) => {
      const btn = e.target.closest(".babyx-tab");
      if (!btn) return;
      setActivePanel(btn.dataset.tab);
      if (btn.dataset.tab === "milestones") {
        state = loadState();
        renderMilestones(ui, state);
      }
    });

    ui.segs.category.addEventListener("click", (e) => {
      const btn = e.target.closest(".babyx-seg-btn");
      if (!btn) return;
      state = saveState({ age: { ...getAgeState(loadState()), category: btn.dataset.value } });
      renderAge(ui, state);
      renderMilestones(ui, state);
    });

    ui.segs.mode.addEventListener("click", (e) => {
      const btn = e.target.closest(".babyx-seg-btn");
      if (!btn) return;
      state = saveState({ age: { ...getAgeState(loadState()), mode: btn.dataset.value } });
      renderAge(ui, state);
    });

    ui.ageGrid.addEventListener("click", (e) => {
      const btn = e.target.closest(".babyx-age-btn");
      if (!btn) return;
      const type = btn.dataset.type === "weeks" ? "weeks" : "months";
      const value = Number(btn.dataset.value);
      if (!Number.isFinite(value)) return;
      const label = btn.textContent || (type === "weeks" ? `${value}w` : `${value}m`);
      state = saveState({ age: { ...getAgeState(loadState()), selected: { type, value, label } } });
      renderAge(ui, state);
      renderProfile(ui, state);
      renderFeeding(ui, state);
      renderMilestones(ui, state);
    });

    ui.ageActions.start.addEventListener("click", () => {
      state = loadState();
      if (!getAgeState(state).selected && !getProfile(state).birth) {
        if (typeof window.showNotification === "function") window.showNotification("Select an age or set a birth date first", "warning");
        return;
      }
      setActivePanel("growth");
      ui.growth.weight.focus();
      if (typeof window.showNotification === "function") window.showNotification("Tracking started. Log your first measurement.", "success");
    });

    ui.ageActions.clear.addEventListener("click", () => {
      state = saveState({ age: { ...getAgeState(loadState()), selected: null } });
      renderAge(ui, state);
      renderMilestones(ui, state);
    });

    ui.growth.form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const weight = Number(ui.growth.weight.value);
      const length = Number(ui.growth.length.value);
      const head = Number(ui.growth.head.value);
      const when = ui.growth.when.value ? new Date(ui.growth.when.value) : new Date();

      if (!Number.isFinite(weight) || !Number.isFinite(length)) {
        if (typeof window.showNotification === "function") window.showNotification("Enter at least weight and length", "error");
        return;
      }

      const growthData = { when: when.toISOString(), weight, length, head: Number.isFinite(head) ? head : null };
      state = addGrowth(loadState(), growthData);
      renderGrowth(ui, state);
      renderQuickSnapshot(ui, state);
      if (typeof window.showNotification === "function") window.showNotification("Growth measurement saved", "success");
      if (window.DB_SYNC) window.DB_SYNC.saveBaby({ type: 'growth', ...growthData });

      const api = getApi();
      const userEmail = localStorage.getItem("bc_user_email");
      const ageMonths = computeAgeMonths(getProfile(state), getAgeState(state));
      if (api && userEmail && typeof ageMonths === "number") {
        try {
          await api.saveGrowthData({
            userId: userEmail,
            ageInMonths: ageMonths,
            weight,
            length,
            headCircumference: Number.isFinite(head) ? head : undefined,
            timestamp: when.toISOString()
          });
        } catch {}
      }
    });

    ui.growth.goAI.addEventListener("click", () => {
      if (typeof window.openGrowthPredictionAI === "function") {
        window.openGrowthPredictionAI();
      } else if (typeof window.navigateTo === "function") {
        window.navigateTo("growth-prediction-ai");
      }
    });

    ui.feeding.form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const type = ui.feeding.type.value;
      const amountRaw = ui.feeding.amount.value;
      const when = ui.feeding.when.value ? new Date(ui.feeding.when.value) : new Date();
      const note = ui.feeding.note.value.trim();

      if (!type) {
        if (typeof window.showNotification === "function") window.showNotification("Select a feed type", "error");
        return;
      }

      const amount = amountRaw ? Number(amountRaw) : null;
      const feedData = { when: when.toISOString(), type, amount: Number.isFinite(amount) ? amount : null, unit: "ml", note };
      state = addFeed(loadState(), feedData);
      renderFeeding(ui, state);
      renderQuickSnapshot(ui, state);
      if (typeof window.showNotification === "function") window.showNotification("Feed logged", "success");
      if (window.DB_SYNC) window.DB_SYNC.saveBaby({ type: 'feeding', ...feedData });
    });

    ui.sleep.form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const start = ui.sleep.start.value ? new Date(ui.sleep.start.value) : null;
      const end = ui.sleep.end.value ? new Date(ui.sleep.end.value) : null;
      if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end.getTime() <= start.getTime()) {
        if (typeof window.showNotification === "function") window.showNotification("Enter valid start and end times", "error");
        return;
      }
      const sleepData = { start: start.toISOString(), end: end.toISOString() };
      state = addSleep(loadState(), sleepData);
      renderSleep(ui, state);
      renderQuickSnapshot(ui, state);
      if (typeof window.showNotification === "function") window.showNotification("Sleep logged", "success");
      if (window.DB_SYNC) window.DB_SYNC.saveSleep({ source: 'baby', ...sleepData });

      const api = getApi();
      const userEmail = localStorage.getItem("bc_user_email");
      if (api && userEmail) {
        try {
          await api.startSleepSession({ userId: userEmail, startTime: start.toISOString() });
        } catch {}
      }
    });

    ui.milestones.list.addEventListener("change", (e) => {
      const input = e.target.closest('input[type="checkbox"][data-kind="milestone"]');
      if (!input) return;
      const id = input.dataset.id;
      const current = getProgress(loadState());
      const next = { ...current.milestonesDone, [id]: input.checked };
      state = saveState({ progress: { ...loadState().progress, milestonesDone: next } });
      renderMilestones(ui, state);
      if (window.DB_SYNC) window.DB_SYNC.saveMilestone({ milestoneId: id, achieved: input.checked });
    });

    ui.milestones.vaccines.addEventListener("change", (e) => {
      const input = e.target.closest('input[type="checkbox"][data-kind="vaccine"]');
      if (!input) return;
      const id = input.dataset.id;
      const current = getProgress(loadState());
      const next = { ...current.vaccinesDone, [id]: input.checked };
      state = saveState({ progress: { ...loadState().progress, vaccinesDone: next } });
      if (window.DB_SYNC) window.DB_SYNC.saveMilestone({ type: 'vaccine', vaccineId: id, given: input.checked });
    });

    ui.quick.feed.addEventListener("click", () => {
      const profile = getProfile(loadState());
      const when = new Date();
      const type = profile.feeding || "feed";
      state = addFeed(loadState(), { when: when.toISOString(), type, amount: null, unit: "ml", note: "quick log" });
      renderFeeding(ui, state);
      renderQuickSnapshot(ui, state);
      if (ui.quick.feedStatus) ui.quick.feedStatus.textContent = `Feed logged at ${formatHumanDateTime(when)}`;
    });

    ui.quick.sleep.addEventListener("click", () => {
      const minutes = Number(prompt("Minutes slept?", "30"));
      if (!Number.isFinite(minutes) || minutes <= 0) return;
      const end = new Date();
      const start = new Date(end.getTime() - minutes * MS_MIN);
      state = addSleep(loadState(), { start: start.toISOString(), end: end.toISOString() });
      renderSleep(ui, state);
      renderQuickSnapshot(ui, state);
      if (ui.quick.feedStatus) ui.quick.feedStatus.textContent = `Sleep logged (${minutes} min)`;
    });

    ui.ai.form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const profile = getProfile(loadState());
      const age = ui.ai.age.value.trim();
      const goal = ui.ai.goal.value;
      const notes = ui.ai.notes.value.trim();
      if (!age) {
        if (typeof window.showNotification === "function") window.showNotification("Enter an age (e.g., 6 months)", "error");
        return;
      }
      ui.ai.out.innerHTML = `<div class="babyx-loading">Generating…</div>`;
      try {
        const text = await aiCoach({ age, goal, notes, profile });
        renderAiOutput(ui.ai.out, text);
      } catch (err) {
        renderAiOutput(ui.ai.out, "");
        if (typeof window.showNotification === "function") window.showNotification(String(err && err.message ? err.message : "AI failed"), "error");
      }
    });

    ui.quick.aiRun.addEventListener("click", async () => {
      const profile = getProfile(loadState());
      const ageState = getAgeState(loadState());
      const age = ageState.selected ? ageState.selected.label : profile.birth ? `${computeAgeFromBirth(profile.birth)?.months || 0}m` : "unknown";
      ui.quick.aiOut.innerHTML = `<div class="babyx-loading">Generating…</div>`;
      try {
        const text = await aiCoach({ age, goal: "activities", notes: "quick plan", profile });
        renderAiOutput(ui.quick.aiOut, text);
      } catch {
        renderAiOutput(ui.quick.aiOut, "");
      }
    });

    const setNowDefaults = () => {
      const now = new Date();
      if (ui.growth.when && !ui.growth.when.value) ui.growth.when.value = formatDateTimeLocal(now);
      if (ui.feeding.when && !ui.feeding.when.value) ui.feeding.when.value = formatDateTimeLocal(now);
      if (ui.sleep.start && !ui.sleep.start.value) ui.sleep.start.value = formatDateTimeLocal(new Date(now.getTime() - 60 * MS_MIN));
      if (ui.sleep.end && !ui.sleep.end.value) ui.sleep.end.value = formatDateTimeLocal(now);
    };
    setNowDefaults();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
