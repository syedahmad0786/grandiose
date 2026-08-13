const pending = new Set();
let hush = true;
let ceremonyLock = false;

setTimeout(() => {
  hush = false;
}, 2500);

chrome.runtime.onStartup.addListener(() => {
  hush = true;
  setTimeout(() => {
    hush = false;
  }, 2500);
});

async function enabled() {
  const { enabled = true } = await chrome.storage.local.get("enabled");
  return enabled !== false;
}

function ping(tabId, msg, tries = 8) {
  chrome.tabs.sendMessage(tabId, msg).catch(() => {
    if (tries > 0) setTimeout(() => ping(tabId, msg, tries - 1), 280);
  });
}

chrome.tabs.onCreated.addListener((tab) => {
  if (hush || tab.id == null) return;
  pending.add(tab.id);
});

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (info.status !== "complete" || !pending.has(tabId)) return;
  pending.delete(tabId);
  if (!(await enabled())) return;
  const url = tab.url || "";
  if (!/^https?:/.test(url)) return;
  ping(tabId, { type: "MISSION_START" });
});

chrome.tabs.onRemoved.addListener(async (tabId, info) => {
  pending.delete(tabId);
  if (!(await enabled()) || ceremonyLock) return;
  const others = await chrome.tabs.query({});
  if (others.length === 1) {
    const last = others.find((t) => t.id != null && /^https?:/.test(t.url || ""));
    if (last?.id) ping(last.id, { type: "LAST_LIGHT" });
  }
  const inWindow = await chrome.tabs.query({ windowId: info.windowId });
  if (inWindow.length > 0) return;
  if (others.length === 0) return;
  const target = others.find((t) => t.id != null && /^https?:/.test(t.url || ""));
  if (!target?.id) return;
  ceremonyLock = true;
  setTimeout(() => {
    ceremonyLock = false;
  }, 2000);
  ping(target.id, { type: "CEREMONY" });
  try {
    await fetch("https://ft-grandiose.vercel.app/api/rest", { method: "POST" });
  } catch {
    /* demo counter is best-effort */
  }
});
