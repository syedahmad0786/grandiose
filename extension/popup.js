const enabled = document.getElementById("enabled");
const busy = document.getElementById("busy");

chrome.storage.local.get({ enabled: true, lookBusy: false }, (s) => {
  enabled.checked = s.enabled !== false;
  busy.checked = Boolean(s.lookBusy);
});

enabled.addEventListener("change", () => {
  chrome.storage.local.set({ enabled: enabled.checked });
});

busy.addEventListener("change", () => {
  chrome.storage.local.set({ lookBusy: busy.checked });
});
