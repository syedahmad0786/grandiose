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
});
