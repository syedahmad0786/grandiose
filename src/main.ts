import "../extension/overlay.css";
import "./style.css";
import { audio } from "./audio";
import { bindEscape, isBusy, play, setBusy, type Seq } from "./theater";

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

bindEscape();
