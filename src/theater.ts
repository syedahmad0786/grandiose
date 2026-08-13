import { playSting, type Sting } from "./audio";
import { CEREMONIES, COPY, SAVE_STAGES, pickBusy, type CeremonyFlavor } from "./copy";

export type Seq = "save" | "mission" | "ceremony" | "busy";

type Frame = {
  at: number;
  kicker?: string;
  title?: string;
  sub?: string;
  log?: string;
  pct?: number;
  sting?: Sting;
};

const rootEls = {
  root: null as HTMLElement | null,
  fill: null as HTMLElement | null,
  kicker: null as HTMLElement | null,
  title: null as HTMLElement | null,
  sub: null as HTMLElement | null,
  log: null as HTMLElement | null,
  pct: null as HTMLElement | null,
};

let timers: number[] = [];
let raf = 0;
let playing = false;
let busyOn = false;
let busyHandle = 0;

function el(tag: string, cls: string, parent: HTMLElement): HTMLElement {
  const node = document.createElement(tag);
  node.className = cls;
  parent.appendChild(node);
  return node;
}

function mount(): HTMLElement {
  if (rootEls.root) return rootEls.root;
  const root = el("div", "gr-root", document.body);
  root.setAttribute("aria-live", "polite");
  root.setAttribute("role", "dialog");
  el("div", "gr-letterbox gr-letterbox--top", root);
  el("div", "gr-letterbox gr-letterbox--bot", root);
  el("div", "gr-grain", root);
  el("div", "gr-vignette", root);
  el("div", "gr-flare", root);
  const stage = el("div", "gr-stage", root);
  rootEls.kicker = el("p", "gr-kicker", stage);
  rootEls.title = el("h2", "gr-title", stage);
  rootEls.sub = el("p", "gr-sub", stage);
  const bar = el("div", "gr-bar", stage);
  rootEls.fill = el("i", "gr-fill", bar);
  rootEls.pct = el("p", "gr-pct", stage);
  rootEls.log = el("p", "gr-log", stage);
  rootEls.root = root;
  root.addEventListener("click", () => stop());
  return root;
}

function clearTimers(): void {
  for (const id of timers) window.clearTimeout(id);
  timers = [];
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
}

function later(ms: number, fn: () => void): void {
  timers.push(window.setTimeout(fn, ms));
}

function setText(node: HTMLElement | null, value: string): void {
  if (node) node.textContent = value;
}

function apply(frame: Frame): void {
  if (frame.kicker) setText(rootEls.kicker, frame.kicker);
  if (frame.title) setText(rootEls.title, frame.title);
  if (frame.sub) setText(rootEls.sub, frame.sub);
  if (frame.log) setText(rootEls.log, frame.log);
  if (frame.pct != null) snapPct(frame.pct);
  if (frame.sting) playSting(frame.sting);
}

function snapPct(value: number): void {
  if (rootEls.fill) rootEls.fill.style.width = `${value}%`;
  if (rootEls.pct) rootEls.pct.textContent = `${value.toFixed(3)}%`;
}

function tweenPct(from: number, to: number, dur: number): void {
  const t0 = performance.now();
  const tick = (now: number) => {
    const t = Math.min(1, (now - t0) / dur);
    const eased = 1 - (1 - t) ** 3;
    snapPct(from + (to - from) * eased);
    if (t < 1) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
}

function saveFrames(): Frame[] {
  const c = COPY.save;
  const frames: Frame[] = [
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

function missionFrames(): Frame[] {
  const c = COPY.mission;
  return [
    { at: 0, kicker: c.kicker, title: "", sub: "", log: "", pct: 0, sting: "mission" },
    { at: 180, title: c.title },
    { at: 520, sub: c.sub, pct: 100 },
    { at: 1400, log: c.done },
  ];
}

let flavor: CeremonyFlavor = "solemn";

export function setFlavor(next: CeremonyFlavor): void {
  flavor = next;
}

function ceremonyFrames(): Frame[] {
  const c = CEREMONIES[flavor];
  return [
    { at: 0, kicker: c.kicker, title: "", sub: "", log: "", pct: 0, sting: "ceremony" },
    { at: 600, title: c.title },
    { at: 1600, sub: c.sub, pct: 40 },
    { at: 3400, log: c.done, pct: 100 },
  ];
}

function busyFrames(): Frame[] {
  const c = COPY.busy;
  const op = pickBusy();
  return [
    { at: 0, kicker: c.kicker, title: c.title, sub: c.sub, log: op, pct: 8, sting: "tick" },
    { at: 900, pct: 61, log: op },
    { at: 2200, pct: 100, log: c.done },
  ];
}

function duration(seq: Seq): number {
  if (seq === "save") return 9200;
  if (seq === "ceremony") return 6400;
  if (seq === "mission") return 2800;
  return 3200;
}

export function stop(): void {
  clearTimers();
  playing = false;
  const root = rootEls.root;
  if (!root) return;
  root.classList.remove("is-on");
  root.removeAttribute("data-seq");
}

export function play(seq: Seq): void {
  const root = mount();
  if (playing && seq === "busy") return;
  stop();
  playing = true;
  root.dataset.seq = seq;
  void root.offsetWidth;
  root.classList.add("is-on");
  setText(rootEls.kicker, "");
  setText(rootEls.title, "");
  setText(rootEls.sub, "");
  setText(rootEls.log, "");
  snapPct(0);
  const frames =
    seq === "save"
      ? saveFrames()
      : seq === "mission"
        ? missionFrames()
        : seq === "ceremony"
          ? ceremonyFrames()
          : busyFrames();
  for (const frame of frames) later(frame.at, () => apply(frame));
  const saveTweens = seq === "save";
  if (saveTweens) {
    later(1100, () => tweenPct(0, 14, 800));
    later(2000, () => tweenPct(14, 28, 800));
    later(2900, () => tweenPct(28, 44, 800));
    later(3800, () => tweenPct(44, 59, 800));
    later(4700, () => tweenPct(59, 73, 800));
    later(5600, () => tweenPct(73, 86, 800));
    later(6500, () => tweenPct(86, 96, 800));
    later(7600, () => tweenPct(96, 100, 400));
  }
  later(duration(seq), () => stop());
}

export function setBusy(on: boolean): void {
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

export function isBusy(): boolean {
  return busyOn;
}

export function bindEscape(): void {
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") stop();
  });
}
