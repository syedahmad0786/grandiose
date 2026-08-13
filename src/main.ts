import "../extension/overlay.css";
import "./style.css";
import { audio } from "./audio";
import { bindEscape, isBusy, play, setBusy, setFlavor, type Seq } from "./theater";
import type { CeremonyFlavor } from "./copy";

function isSaveChord(e: KeyboardEvent): boolean {
  const key = e.key.toLowerCase();
  return (e.ctrlKey || e.metaKey) && key === "s";
}

function armAudio(): void {
  void audio().resume();
}

document.querySelectorAll<HTMLButtonElement>("[data-seq]").forEach((btn) => {
  btn.addEventListener("click", () => {
    armAudio();
    play(btn.dataset.seq as Seq);
  });
});

const busyBtn = document.querySelector<HTMLButtonElement>("#busy");
busyBtn?.addEventListener("click", () => {
  armAudio();
  const next = !isBusy();
  setBusy(next);
  busyBtn.setAttribute("aria-pressed", String(next));
  busyBtn.classList.toggle("is-live", next);
});

window.addEventListener(
  "keydown",
  (e) => {
    if (!isSaveChord(e)) return;
    armAudio();
    play("save");
  },
  true,
);

document.querySelectorAll<HTMLButtonElement>("[data-flavor]").forEach((btn) => {
  btn.addEventListener("click", () => {
    setFlavor(btn.dataset.flavor as CeremonyFlavor);
    document.querySelectorAll("[data-flavor]").forEach((el) => {
      el.classList.toggle("is-live", el === btn);
    });
  });
});

void fetch("/api/rest")
  .then((r) => r.json())
  .then((data: { total?: number }) => {
    const el = document.querySelector("#rested");
    if (el && typeof data.total === "number") {
      el.textContent = `Tabs laid to rest today: ${data.total.toLocaleString()}`;
    }
  })
  .catch(() => undefined);

bindEscape();
