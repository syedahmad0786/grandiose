const GrandioseTheater = (() => {
  const SAVE_STAGES = [
    "Consulting the cartographers",
    "Waxing the imperial seal",
    "Alerting the night watch",
    "Engraving the marble ledger",
    "Folding spacetime around the file",
    "Blessing the inode",
    "Filing under destiny",
  ];
  const BUSY_OPS = [
    "Reconciling the ledgers",
    "Warming the orchestra pit",
    "Counting unsaved souls",
    "Calibrating gravitas",
    "Pretending to compile",
    "Polishing the wax seal",
    "Briefing the chorus",
    "Staging a harmless crisis",
  ];
  const COPY = {
    save: {
      kicker: "CLASSIFIED // FT–005",
      title: "PRESERVING THE RECORD",
      sub: "A mundane save has been elevated to state occasion.",
      done: "THE RECORD IS SAFE",
    },
    mission: {
      kicker: "DISPATCH",
      title: "MISSION",
      sub: "A new frontier has opened. Godspeed.",
      done: "THE COMPANY ADVANCES",
    },
    ceremony: {
      kicker: "REQUIEM",
      title: "THE LAST LIGHT",
      sub: "The company lays down its arms.",
      done: "Credits roll on an empty stage.",
    },
    busy: {
      kicker: "ONGOING",
      title: "LOOK BUSY",
      sub: "An operation of tremendous unimportance.",
      done: "STILL LOOKING BUSY",
    },
  };

  const els = {};
  let timers = [];
  let raf = 0;
  let playing = false;
  let busyOn = false;
  let busyHandle = 0;

  function node(tag, cls, parent) {
    const n = document.createElement(tag);
    n.className = cls;
    parent.appendChild(n);
    return n;
  }

  function host() {
    return document.body || document.documentElement;
  }

  function mount() {
    if (els.root && els.root.isConnected) return els.root;
    ensureFonts();
    const root = node("div", "gr-root", host());
    root.setAttribute("aria-live", "polite");
    root.setAttribute("role", "dialog");
    node("div", "gr-letterbox gr-letterbox--top", root);
    node("div", "gr-letterbox gr-letterbox--bot", root);
    node("div", "gr-grain", root);
    node("div", "gr-vignette", root);
    node("div", "gr-flare", root);
    const stage = node("div", "gr-stage", root);
    els.kicker = node("p", "gr-kicker", stage);
    els.title = node("h2", "gr-title", stage);
    els.sub = node("p", "gr-sub", stage);
    const bar = node("div", "gr-bar", stage);
    els.fill = node("i", "gr-fill", bar);
    els.pct = node("p", "gr-pct", stage);
    els.log = node("p", "gr-log", stage);
    els.root = root;
    root.addEventListener("click", stop);
    return root;
  }

  function ensureFonts() {
    if (document.getElementById("gr-fonts")) return;
    const link = document.createElement("link");
    link.id = "gr-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,400;1,400&family=Share+Tech+Mono&display=swap";
    (document.head || document.documentElement).appendChild(link);
  }

  function clearTimers() {
    for (const id of timers) window.clearTimeout(id);
    timers = [];
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function later(ms, fn) {
    timers.push(window.setTimeout(fn, ms));
  }

  function setText(el, value) {
    if (el) el.textContent = value;
  }

  function snapPct(value) {
    if (els.fill) els.fill.style.width = `${value}%`;
    if (els.pct) els.pct.textContent = `${value.toFixed(3)}%`;
  }

  function tweenPct(from, to, dur) {
    const t0 = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      const eased = 1 - (1 - t) ** 3;
      snapPct(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  function apply(frame) {
    if (frame.kicker) setText(els.kicker, frame.kicker);
    if (frame.title) setText(els.title, frame.title);
    if (frame.sub) setText(els.sub, frame.sub);
    if (frame.log) setText(els.log, frame.log);
    if (frame.pct != null) snapPct(frame.pct);
    if (frame.sting) GrandioseAudio.playSting(frame.sting);
  }

  function saveFrames() {
    const c = COPY.save;
    const frames = [
      { at: 0, kicker: c.kicker, title: "", sub: "", log: "", pct: 0, sting: "save" },
      { at: 350, title: c.title, sub: c.sub },
    ];
    SAVE_STAGES.forEach((log, i) => {
      const pct = Math.round(((i + 1) / (SAVE_STAGES.length + 1)) * 92);
      frames.push({ at: 1100 + i * 900, log, pct });
    });
    frames.push({ at: 7600, log: c.done, title: c.done, pct: 100, sting: "fanfare" });
    return frames;
  }

  function missionFrames() {
    const c = COPY.mission;
    return [
      { at: 0, kicker: c.kicker, title: "", sub: "", log: "", pct: 0, sting: "mission" },
      { at: 180, title: c.title },
      { at: 520, sub: c.sub, pct: 100 },
      { at: 1400, log: c.done },
    ];
  }

  function ceremonyFrames() {
    const c = COPY.ceremony;
    return [
      { at: 0, kicker: c.kicker, title: "", sub: "", log: "", pct: 0, sting: "ceremony" },
      { at: 600, title: c.title },
      { at: 1600, sub: c.sub, pct: 40 },
      { at: 3400, log: c.done, pct: 100 },
    ];
  }

  function busyFrames() {
    const c = COPY.busy;
    const op = BUSY_OPS[Math.floor(Math.random() * BUSY_OPS.length)];
    return [
      { at: 0, kicker: c.kicker, title: c.title, sub: c.sub, log: op, pct: 8, sting: "tick" },
      { at: 900, pct: 61, log: op },
      { at: 2200, pct: 100, log: c.done },
    ];
  }

  function duration(seq) {
    if (seq === "save") return 9200;
    if (seq === "ceremony") return 6400;
    if (seq === "mission") return 2800;
    return 3200;
  }

  function framesFor(seq) {
    if (seq === "save") return saveFrames();
    if (seq === "mission") return missionFrames();
    if (seq === "ceremony") return ceremonyFrames();
    return busyFrames();
  }

  function stop() {
    clearTimers();
    playing = false;
    if (!els.root) return;
    els.root.classList.remove("is-on");
    els.root.removeAttribute("data-seq");
  }

  function play(seq) {
    if (!host()) return;
    const root = mount();
    if (playing && seq === "busy") return;
    stop();
    playing = true;
    root.dataset.seq = seq;
    void root.offsetWidth;
    root.classList.add("is-on");
    setText(els.kicker, "");
    setText(els.title, "");
    setText(els.sub, "");
    setText(els.log, "");
    snapPct(0);
    for (const frame of framesFor(seq)) later(frame.at, () => apply(frame));
    if (seq === "save") {
      later(1100, () => tweenPct(0, 14, 800));
      later(2000, () => tweenPct(14, 28, 800));
      later(2900, () => tweenPct(28, 44, 800));
      later(3800, () => tweenPct(44, 59, 800));
      later(4700, () => tweenPct(59, 73, 800));
      later(5600, () => tweenPct(73, 86, 800));
      later(6500, () => tweenPct(86, 96, 800));
      later(7600, () => tweenPct(96, 100, 400));
    }
    later(duration(seq), stop);
  }

  function setBusy(on) {
    busyOn = on;
    window.clearInterval(busyHandle);
    busyHandle = 0;
    if (!on) return;
    const pulse = () => {
      if (busyOn) play("busy");
    };
    pulse();
    busyHandle = window.setInterval(pulse, 14000);
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") stop();
  });

  return { play, stop, setBusy };
})();
