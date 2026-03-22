# Act 2 — Browser Extension (TOTP Red Hat)

## What It Does

A Chrome extension disguised as a TOTP authenticator. When installed, it
uses the `cookies` permission to read **all** browser cookies and sends
them to the attacker server. It looks completely legitimate with a polished
popup UI showing fake TOTP codes.

## How to Run

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** → select this `act2-browser-extension` folder
4. The extension installs and immediately exfiltrates cookies
5. Check the dashboard at http://localhost:4000

### Optional: Generate Icons

```bash
npm install canvas
node generate-icons.js
```

Without icons, the extension works fine — Chrome will use a default icon.

## Key Talking Point

Browser extensions with `cookies` + `<all_urls>` permissions can silently
read every cookie in your browser — including session tokens. Always check
what permissions an extension asks for before installing.
