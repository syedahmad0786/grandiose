# Grandiose

Mundane browser actions become cinema. Saving a file launches a progress opera. A new tab is a mission start. Closing the last tab is a ceremony. Optional look-busy mode for screen shares.

Live demo: https://grandiose-seven.vercel.app  
Repo: https://github.com/syedahmad0786/grandiose

## Demo (no install)

Open the live site. Buttons fire Save Opera, Mission Start, Last Tab Ceremony, and Look Busy. Original Web Audio only.

## Browser extension

Permissions are tight: `storage` plus content scripts on http/https. The overlay does **not** cancel Ctrl/Cmd+S — your save still happens.

1. Chrome: `chrome://extensions` → Developer mode → Load unpacked → `extension/`
2. Firefox: `about:debugging` → Load Temporary Add-on → `extension/manifest.json`

Popup toggles the theater and look-busy mode.

Last-tab ceremony is best-effort: browsers do not always notify extensions on the final tab close.

```bash
npm install
npm run dev
```

MIT © 2026 Ahmad Bukhari
