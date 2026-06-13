(() => {
  const STORAGE_KEY = "gpx_state_v2";
  const MS_DAY = 24 * 60 * 60 * 1000;

  const q = (sel, root = document) => root.querySelector(sel);
  const qa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  const safeJsonParse = (value, fallback) => {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  const defaultState = () => ({
    lmp: "",
    cycle: 28,
    tryingFor: "0-3",
    regularity: "regular",
    selectedDay: 14,
    aiLast: "",
    logs: [],
    plan: {}
  });

  const loadState = () => {
    const parsed = safeJsonParse(localStorage.getItem(STORAGE_KEY), {});
    const state = parsed && typeof parsed === "object" ? parsed : {};
    return {
      ...defaultState(),
      ...state,
      cycle: clamp(Number(state.cycle) || 28, 21, 35),
      selectedDay: clamp(Number(state.selectedDay) || 14, 1, 35),
      logs: Array.isArray(state.logs) ? state.logs : [],
      plan: state.plan && typeof state.plan === "object" ? state.plan : {}
    };
  };

  const saveState = (patch) => {
    const next = { ...loadState(), ...patch };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    if (window.DB_SYNC) window.DB_SYNC.saveFertility({ type: "gpx-state", ...next });
    return next;
  };

  const parseDate = (value) => {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const addDays = (date, days) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  };

  const formatDate = (d) => {
    try {
      return new Intl.DateTimeFormat(undefined, { month: "short", day: "2-digit", year: "numeric" }).format(d);
    } catch {
      return d.toLocaleDateString();
    }
  };

  const setText = (el, text) => {
    if (el) el.textContent = text;
  };

  const notify = (text, type = "success") => {
    if (typeof window.showNotification === "function") window.showNotification(text, type);
  };

  const computeCycle = (state) => {
    const base = parseDate(state.lmp);
    if (!base) return null;
    const cycleLen = clamp(Number(state.cycle) || 28, 21, 35);
    const ovulationDayNumber = clamp(cycleLen - 14, 7, cycleLen - 7);
    const ovulation = addDays(base, ovulationDayNumber);
    const fertileStart = addDays(ovulation, -5);
    const fertileEnd = addDays(ovulation, 1);
    const nextPeriod = addDays(base, cycleLen);
    return { base, cycleLen, ovulationDayNumber, ovulation, fertileStart, fertileEnd, nextPeriod };
  };

  const countDonePlan = (plan) => Object.values(plan || {}).filter(Boolean).length;

  const computeReadiness = (state) => {
    let score = 20;
    if (state.lmp) score += 20;
    if (state.logs.length) score += Math.min(20, state.logs.length * 5);
    score += countDonePlan(state.plan) * 8;
    if (state.regularity === "regular") score += 8;
    if (state.regularity === "irregular") score -= 8;
    if (state.tryingFor === "12+") score -= 6;
    return clamp(score, 0, 100);
  };

  const selectedDayIntel = (state, computed) => {
    const cycleLen = computed ? computed.cycleLen : state.cycle;
    const ovulationDay = computed ? computed.ovulationDayNumber : cycleLen - 14;
    const fertileStart = clamp(ovulationDay - 5, 1, cycleLen);
    const fertileEnd = clamp(ovulationDay + 1, 1, cycleLen);
    const day = clamp(state.selectedDay, 1, cycleLen);

    if (day === ovulationDay) {
      return {
        status: "Peak fertility day",
        timing: "Ovulation is estimated today.",
        action: "Prioritize timing today and tomorrow if this aligns with your plan."
      };
    }
    if (day >= fertileStart && day <= fertileEnd) {
      const daysBefore = ovulationDay - day;
      return {
        status: "High fertility window",
        timing: daysBefore > 0 ? `${daysBefore} day(s) before ovulation estimate.` : "Close to ovulation estimate.",
        action: "Aim for intercourse every 1-2 days during this window."
      };
    }
    if (day < fertileStart) {
      return {
        status: "Preparation phase",
        timing: `${fertileStart - day} day(s) until fertile window starts.`,
        action: "Keep logging symptoms, sleep, hydration, and cervical mucus."
      };
    }
    return {
      status: "Luteal phase",
      timing: "Fertile window has likely passed for this cycle.",
      action: "Track symptoms and use the test calculator after the appropriate wait."
    };
  };

  const renderProgress = (state) => {
    const pct = computeReadiness(state);
    const fill = q("#gpxProgressFill");
    const ring = q("#gpxProgressRing");
    if (fill) fill.style.width = `${pct}%`;
    if (ring) {
      const isDark = document.body.classList.contains("dark-mode");
      const track = isDark ? "rgba(125, 211, 252, 0.16)" : "rgba(37, 99, 235, 0.12)";
      ring.style.background = `conic-gradient(#2563eb ${pct}%, ${track} 0)`;
    }
    setText(q("#gpxProgressLabel"), `${pct}%`);
    setText(q("#gpxReadiness"), `${pct}/100`);
  };

  const renderCycleResults = (state) => {
    const computed = computeCycle(state);
    if (!computed) {
      setText(q("#gpxFertileWindow"), "--");
      setText(q("#gpxOvulationDay"), "--");
      setText(q("#gpxNextPeriod"), "--");
      return;
    }

    setText(q("#gpxFertileWindow"), `${formatDate(computed.fertileStart)} to ${formatDate(computed.fertileEnd)}`);
    setText(q("#gpxOvulationDay"), formatDate(computed.ovulation));
    setText(q("#gpxNextPeriod"), formatDate(computed.nextPeriod));
  };

  const renderTimeline = (state) => {
    const computed = computeCycle(state);
    const range = q("#gpxCycleDayRange");
    const pill = q("#gpxCycleDayPill");
    const rail = q("#gpxTimelineRail");
    if (!range || !pill || !rail) return;

    const cycleLen = computed ? computed.cycleLen : state.cycle;
    const selected = clamp(state.selectedDay, 1, cycleLen);
    const ovulationDay = computed ? computed.ovulationDayNumber : cycleLen - 14;
    const fertileStartDay = clamp(ovulationDay - 5, 1, cycleLen);
    const fertileEndDay = clamp(ovulationDay + 1, 1, cycleLen);

    range.min = "1";
    range.max = String(cycleLen);
    range.value = String(selected);
    pill.textContent = `Day ${selected}`;

    rail.innerHTML = Array.from({ length: cycleLen }, (_, idx) => {
      const day = idx + 1;
      const classes = ["gpx-day"];
      if (day >= fertileStartDay && day <= fertileEndDay) classes.push("fertile");
      if (day === ovulationDay) classes.push("ovulation");
      if (day === selected) classes.push("active");
      return `<button type="button" class="${classes.join(" ")}" data-day="${day}" title="Cycle day ${day}">${day}</button>`;
    }).join("");

    const intel = selectedDayIntel({ ...state, selectedDay: selected }, computed);
    setText(q("#gpxSelectedStatus"), intel.status);
    setText(q("#gpxSelectedTiming"), intel.timing);
    setText(q("#gpxSelectedAction"), intel.action);
  };

  const renderLogs = (state) => {
    const list = q("#gpxLogList");
    if (!list) return;
    if (!state.logs.length) {
      list.innerHTML = `<div class="gpx-log-item">No logs yet. Save today's fertility signals to start trend tracking.</div>`;
      return;
    }
    list.innerHTML = state.logs.slice(0, 4).map((log) => {
      const bits = [log.date, log.temp ? `${log.temp} F` : null, log.mucus || null, log.energy || null].filter(Boolean);
      return `<div class="gpx-log-item">${bits.join(" | ")}</div>`;
    }).join("");
  };

  const renderPlan = (state) => {
    qa(".gpx-plan-item").forEach((btn) => {
      btn.classList.toggle("done", Boolean(state.plan[btn.dataset.plan]));
    });
  };

  const renderInputs = (state) => {
    const pairs = [
      ["#gpxLmp", state.lmp],
      ["#gpxCycle", String(state.cycle)],
      ["#gpxTryingFor", state.tryingFor],
      ["#gpxRegularity", state.regularity]
    ];
    pairs.forEach(([sel, value]) => {
      const el = q(sel);
      if (el) el.value = value;
    });
  };

  const renderAll = (state = loadState()) => {
    renderInputs(state);
    renderCycleResults(state);
    renderTimeline(state);
    renderLogs(state);
    renderPlan(state);
    renderProgress(state);
  };

  const logToday = () => {
    const state = loadState();
    const today = new Date().toISOString().slice(0, 10);
    const entry = {
      date: today,
      temp: q("#gpxTemp")?.value || "",
      mucus: q("#gpxMucus")?.value || "",
      energy: q("#gpxEnergy")?.value || "steady"
    };
    const logs = state.logs.filter((x) => x && x.date !== today);
    logs.unshift(entry);
    return saveState({ logs: logs.slice(0, 40) });
  };

  const offlineCoach = ({ state, goal, notes }) => {
    const computed = computeCycle(state);
    const lines = ["Fertility Coach Plan"];
    if (computed) {
      lines.push(`Fertile window: ${formatDate(computed.fertileStart)} to ${formatDate(computed.fertileEnd)}`);
      lines.push(`Ovulation estimate: ${formatDate(computed.ovulation)}`);
    }
    lines.push(`Goal: ${goal || "conception"}`);
    if (notes) lines.push(`Notes considered: ${notes}`);
    lines.push("");
    lines.push("Next moves:");
    lines.push("- Use intercourse timing every 1-2 days during the fertile window.");
    lines.push("- Track cervical mucus, basal temperature, sleep, and stress daily.");
    lines.push("- Continue prenatal vitamin with folate and keep hydration consistent.");
    lines.push("- Seek clinician advice for irregular cycles, pain, known conditions, or prolonged TTC.");
    return lines.join("\n");
  };

  const setAiOutput = (text, mode = "ready") => {
    const out = q("#gpxAiOutput");
    if (!out) return;
    out.dataset.mode = mode;
    out.textContent = text;
  };

  const runAiCoach = async (state, goal, notes) => {
    setAiOutput("Generating plan...", "loading");
    const payload = {
      functionName: "getting-pregnant-coach",
      description: "Create a concise, actionable fertility plan. Include fertile-window strategy, daily tracking, lifestyle checklist, partner considerations, and clinician red flags.",
      inputData: {
        lmp: state.lmp,
        cycleLength: state.cycle,
        tryingFor: state.tryingFor,
        regularity: state.regularity,
        recentLogs: state.logs.slice(0, 7),
        goal,
        notes
      }
    };

    try {
      const res = await fetch(window.mamasafeApiUrl("/api/ai-universal-processor"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || data.success === false) {
        const msg = (data && (data.error || data.details)) || `Request failed (${res.status})`;
        const fallback = `${offlineCoach({ state, goal, notes })}\n\nAI status: ${msg}`;
        setAiOutput(fallback, "fallback");
        return saveState({ aiLast: fallback });
      }
      const text = data.response || data.result || offlineCoach({ state, goal, notes });
      setAiOutput(text, "ready");
      return saveState({ aiLast: text });
    } catch {
      const fallback = `${offlineCoach({ state, goal, notes })}\n\nAI status: offline`;
      setAiOutput(fallback, "fallback");
      return saveState({ aiLast: fallback });
    }
  };

  const exportState = () => {
    const blob = new Blob([JSON.stringify(loadState(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "getting-pregnant-dashboard.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const bind = () => {
    q("#gpxJumpSetup")?.addEventListener("click", () => q("#gpxSetupCard")?.scrollIntoView({ behavior: "smooth", block: "center" }));

    q("#gpxSaveSetup")?.addEventListener("click", () => {
      const next = saveState({
        lmp: q("#gpxLmp")?.value || "",
        cycle: clamp(parseInt(q("#gpxCycle")?.value || "28", 10) || 28, 21, 35),
        tryingFor: q("#gpxTryingFor")?.value || "0-3",
        regularity: q("#gpxRegularity")?.value || "regular"
      });
      renderAll(next);
      notify("Fertility plan updated");
      if (window.DB_SYNC) window.DB_SYNC.saveFertility({ type: "gpx-setup", lmp: next.lmp, cycle: next.cycle });
    });

    q("#gpxTrackToday")?.addEventListener("click", () => {
      const next = logToday();
      renderAll(next);
      notify("Today's fertility signals saved");
      if (window.DB_SYNC) window.DB_SYNC.saveFertility({ type: "gpx-daily-log", date: new Date().toISOString().slice(0, 10) });
    });

    q("#gpxCycleDayRange")?.addEventListener("input", (e) => {
      renderAll(saveState({ selectedDay: Number(e.target.value) || 1 }));
    });

    q("#gpxTimelineRail")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-day]");
      if (!btn) return;
      renderAll(saveState({ selectedDay: Number(btn.dataset.day) || 1 }));
    });

    q("#gpxPlanList")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-plan]");
      if (!btn) return;
      const state = loadState();
      const plan = { ...state.plan, [btn.dataset.plan]: !state.plan[btn.dataset.plan] };
      renderAll(saveState({ plan }));
    });

    q("#gpxAiForm")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const next = await runAiCoach(loadState(), q("#gpxAiGoal")?.value || "conception", q("#gpxAiNotes")?.value || "");
      renderAll(next);
    });

    q("#gpxExport")?.addEventListener("click", exportState);
    q("#gpxReset")?.addEventListener("click", () => {
      if (!window.confirm("Reset Getting Pregnant dashboard data?")) return;
      localStorage.removeItem(STORAGE_KEY);
      setAiOutput("Ask for a plan, nutrition suggestions, or what to track next.", "idle");
      renderAll(defaultState());
    });

    document.addEventListener("mamasafe:themechange", () => {
      renderProgress(loadState());
    });
  };

  const init = () => {
    if (!q("#getting-pregnant") || q("#getting-pregnant").dataset.gpxReady === "true") return;
    q("#getting-pregnant").dataset.gpxReady = "true";
    bind();
    const state = loadState();
    renderAll(state);
    if (state.aiLast) setAiOutput(state.aiLast, "ready");
  };

  window.initializeGettingPregnant = init;
  window.initializeGettingPregnantNeon = init;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
