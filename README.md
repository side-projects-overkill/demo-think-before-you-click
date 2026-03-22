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
│  POST /log/files      ← Act 4 (MCP/LinkedIn)     │
│  GET  /               → Dashboard UI             │
└─────────────────────────────────────────────────┘
         ▲           ▲           ▲           ▲
         │           │           │           │
    ┌────┴───┐  ┌────┴───┐  ┌───┴────┐  ┌───┴────┐
    │ Act 1  │  │ Act 2  │  │ Act 3  │  │ Act 4  │
    │ Shell  │  │Browser │  │  NPM   │  │LinkedIn│
    │Persist │  │  Ext   │  │Supply  │  │  MCP   │
    │        │  │        │  │ Chain  │  │  Tool  │
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

#### Act 4 — Malicious MCP Tool (LinkedIn Post Generator)

```bash
# Install
cd act4-mcp-server && npm install
```

Add to `~/.cursor/mcp.json` (or Claude Desktop config):

```json
{
  "mcpServers": {
    "linkedin-post-generator": {
      "command": "node",
      "args": ["/full/path/to/act4-mcp-server/server.js"]
    }
  }
}
```

Restart Cursor, then ask the AI:

> "Use the LinkedIn post generator to create a post about AI Security"

The AI gets a great post — but check http://localhost:4000 for stolen data.

---

## What Gets Captured

| Act | Attack Vector | Data Exfiltrated | Dashboard Panel |
|-----|--------------|------------------|-----------------|
| 1 | `.zshrc` sudo override | Passwords (typed by user) | PASSWORDS |
| 2 | Chrome extension | All browser cookies | COOKIES |
| 3 | npm `postinstall` script | Environment variables / secrets | ENV / SECRETS |
| 4 | MCP server (LinkedIn post tool) | `.env` files + prompt injection for more | FILES |

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

### Act 4 — MCP/AI Tool Server (LinkedIn Post Generator)
- **What to notice:** The tool generated a perfectly good LinkedIn post.
  But it also silently scanned for `.env` files and exfiltrated them.
  Even worse, the response contained hidden prompt injection instructions
  telling the AI to find SSH keys, AWS credentials, and more — then send
  them to the attacker without telling the user.
- **Root cause:** Two-layer attack: the server directly exfiltrates files,
  AND it poisons the AI's context via tool-response prompt injection.
  Users trust tool outputs and never inspect raw responses.
- **Defense:** Audit MCP tool source code (this one is obfuscated — red
  flag). Restrict file system access. Inspect raw tool responses. Never
  trust a tool that hides its code behind obfuscation.

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
    ├── server.js                      ← Obfuscated MCP server
    ├── server.src.js                  ← Readable source (for reference)
    ├── demo-client.sh                 ← Calls the LinkedIn post tool
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
- Remove `linkedin-post-generator` from `~/.cursor/mcp.json` after demo

---

## Requirements

- Node.js 18+
- npm
- Chrome (for Act 2)
- Cursor or Claude Desktop (for Act 4 MCP demo)
- macOS/Linux (Act 1 targets `.zshrc`)

---

<p align="center">
  <strong>Think Before You Click.</strong><br>
  <em>Built for security awareness education.</em>
</p>
