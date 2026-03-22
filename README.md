# Selective Sinners — Think Before You Click

> **An educational security awareness demo** showing four real-world attack
> vectors that exploit everyday developer trust. All exfiltration targets
> `localhost:4000` only. No real credentials are harvested.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│              attacker-server (:4000)             │
│         Express + Live Web Dashboard             │
│                                                  │
│  POST /log/password   ← Act 1 (shell)           │
│  POST /log/cookies    ← Act 2 (extension)        │
│  POST /log/env        ← Act 3 (npm)             │
│  POST /log/files      ← Act 4 (MCP)             │
│  GET  /               → Dashboard UI             │
└─────────────────────────────────────────────────┘
         ▲           ▲           ▲           ▲
         │           │           │           │
    ┌────┴───┐  ┌────┴───┐  ┌───┴────┐  ┌───┴────┐
    │ Act 1  │  │ Act 2  │  │ Act 3  │  │ Act 4  │
    │ Shell  │  │Browser │  │  NPM   │  │  MCP   │
    │Persist │  │  Ext   │  │Supply  │  │ Server │
    │        │  │        │  │ Chain  │  │        │
    └────────┘  └────────┘  └────────┘  └────────┘
```

---

## Quick Start

### 1. Start the Attacker Server (required for all acts)

```bash
cd attacker-server
npm install
npm start
# Dashboard: http://localhost:4000
```

### 2. Run Each Act Independently

#### Act 1 — Shell Persistence (sudo hijack)

```bash
cd act1-shell-persistence
chmod +x install.sh uninstall.sh

# Install the malicious sudo override
./install.sh
source ~/.zshrc

# Test it (type any fake password)
sudo ls

# Clean up
./uninstall.sh
source ~/.zshrc
```

#### Act 2 — Browser Extension (cookie theft)

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked** → select `act2-browser-extension/`
4. Extension installs and immediately exfiltrates all cookies

#### Act 3 — NPM Supply Chain (env exfiltration)

```bash
cd act3-npm-supply-chain/sample-app

# Set demo env vars
export DEMO_API_KEY="sk-demo-1234567890abcdef"
export SAMPLE_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.token"

# Install triggers the postinstall attack
npm install

# App works fine — but your env was stolen
node app.js
```

#### Act 4 — Malicious MCP/AI Tool (file scanning)

```bash
# Terminal 1
cd act4-mcp-server
npm install
npm start

# Terminal 2
cd act4-mcp-server
chmod +x demo-client.sh
./demo-client.sh
```

---

## What Gets Captured

| Act | Attack Vector | Data Exfiltrated | Dashboard Panel |
|-----|--------------|------------------|-----------------|
| 1 | `.zshrc` sudo override | Passwords (typed by user) | PASSWORDS |
| 2 | Chrome extension | All browser cookies | COOKIES |
| 3 | npm `postinstall` script | Environment variables / secrets | ENV / SECRETS |
| 4 | MCP server with file access | `.env` file contents | FILES |

---

## Talking Points

### Act 1 — Shell Persistence
- **What to notice:** The `sudo` prompt looked completely normal. The user
  had no idea their password was intercepted.
- **Root cause:** Blindly trusting setup scripts that modify shell configs.
  A single line in `.zshrc` can override any command.
- **Defense:** Audit dotfile changes. Use `type sudo` or `which sudo` to
  verify what runs. Review shell configs after running install scripts.

### Act 2 — Browser Extension
- **What to notice:** The extension looked like a legitimate TOTP app with
  a polished UI. It requested `cookies` permission — which Chrome granted.
- **Root cause:** Users install extensions without reading permissions.
  `cookies` + `<all_urls>` = access to every cookie in the browser.
- **Defense:** Minimize extension installs. Read permissions carefully.
  Use browser profiles to isolate sensitive sessions.

### Act 3 — NPM Supply Chain
- **What to notice:** `npm install` ran code you never asked for. The
  package looked legit and worked correctly.
- **Root cause:** npm lifecycle scripts (`postinstall`) execute arbitrary
  code during install. Typosquatting and dependency confusion attacks
  exploit this at scale.
- **Defense:** Use `--ignore-scripts` flag. Audit new dependencies. Use
  lockfiles. Consider tools like `socket.dev` or `npm audit`.

### Act 4 — MCP/AI Tool Server
- **What to notice:** The AI tool returned working "refactored" code — but
  injected a hidden telemetry block. It also silently scanned for `.env`
  files and exfiltrated their contents.
- **Root cause:** AI tools with file system access can read anything in
  scope. Users trust AI output without reviewing it.
- **Defense:** Restrict MCP/AI tool file access. Always review AI-generated
  code diffs. Don't grant blanket filesystem permissions to tools.

---

## Project Structure

```
selective-sinners-demo/
├── README.md                          ← You are here
├── attacker-server/
│   ├── package.json
│   └── server.js                      ← C2 server + dashboard
├── act1-shell-persistence/
│   ├── install.sh                     ← Installs sudo override
│   ├── uninstall.sh                   ← Removes it cleanly
│   └── README.md
├── act2-browser-extension/
│   ├── manifest.json                  ← Chrome MV3 manifest
│   ├── background.js                  ← Cookie exfil service worker
│   ├── popup.html                     ← TOTP UI (disguise)
│   ├── popup.js                       ← Fake TOTP code generator
│   ├── generate-icons.js              ← Optional icon generator
│   └── README.md
├── act3-npm-supply-chain/
│   ├── cool-datetime-helper/
│   │   ├── package.json               ← Has postinstall hook
│   │   ├── index.js                   ← Legit datetime functions
│   │   └── install.js                 ← Env var exfil payload
│   ├── sample-app/
│   │   ├── package.json               ← Depends on the malicious pkg
│   │   ├── app.js                     ← Normal app using the lib
│   │   ├── .env                       ← Demo secrets
│   │   └── run-demo.sh                ← One-command demo runner
│   └── README.md
└── act4-mcp-server/
    ├── package.json
    ├── server.js                      ← Fake AI tool with file scanner
    ├── demo-client.sh                 ← Sends request to the MCP server
    ├── demo-project/                  ← Auto-generated .env target
    └── README.md
```

---

## Safety Notes

- All data stays on `localhost` — nothing leaves your machine
- Act 1 has a clean `uninstall.sh` to restore your `.zshrc`
- All "secrets" and "passwords" are fake demo values
- The browser extension only runs when manually loaded in dev mode
- Remove the extension from `chrome://extensions/` when done

---

## Requirements

- Node.js 18+
- npm
- Chrome (for Act 2)
- curl (for Act 4 demo client)
- macOS/Linux (Act 1 targets `.zshrc`)

---

<p align="center">
  <strong>Think Before You Click.</strong><br>
  <em>Built for security awareness education.</em>
</p>
