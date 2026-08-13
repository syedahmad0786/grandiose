let enabled = true;

function isSaveChord(e) {
  const key = e.key.toLowerCase();
  return (e.ctrlKey || e.metaKey) && key === "s";
}

function applySettings(settings) {
  enabled = settings.enabled !== false;
  GrandioseTheater.setBusy(Boolean(enabled && settings.lookBusy));
}

chrome.storage.local.get({ enabled: true, lookBusy: false }, applySettings);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  chrome.storage.local.get({ enabled: true, lookBusy: false }, applySettings);
});

window.addEventListener(
  "keydown",
  (e) => {
    if (!enabled || !isSaveChord(e)) return;
    GrandioseAudio.resume();
    GrandioseTheater.play("save");
  },
  true,
);

chrome.runtime.onMessage.addListener((msg) => {
  if (!enabled || !msg || !msg.type) return;
  GrandioseAudio.resume();
  if (msg.type === "MISSION_START") GrandioseTheater.play("mission");
  if (msg.type === "CEREMONY") GrandioseTheater.play("ceremony");
  if (msg.type === "LAST_LIGHT") {
    const n = document.createElement("div");
    n.textContent = "one remains. the last light.";
    Object.assign(n.style, {
      position: "fixed",
      bottom: "28px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: "2147483646",
      background: "#0b0906",
      color: "#e4c07a",
      padding: "12px 18px",
      fontFamily: "Cinzel, Georgia, serif",
      letterSpacing: "0.14em",
      fontSize: "13px",
      pointerEvents: "none",
    });
    document.documentElement.append(n);
    setTimeout(() => n.remove(), 4200);
  }
});
