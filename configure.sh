#!/bin/bash
# ============================================================
# Configure attacker server host across all demo components
# Usage:  ./configure.sh <ip-or-domain>
#         ./configure.sh 192.168.1.42
#         ./configure.sh evil.example.com
#         ./configure.sh localhost          # reset to default
# ============================================================

set -e

NEW_HOST="${1:?Usage: ./configure.sh <ip-or-domain>}"

ROOT="$(cd "$(dirname "$0")" && pwd)"
CURRENT_HOST_FILE="$ROOT/.c2host"

OLD_HOST="localhost"
if [ -f "$CURRENT_HOST_FILE" ]; then
  OLD_HOST="$(cat "$CURRENT_HOST_FILE")"
fi

if [ "$OLD_HOST" = "$NEW_HOST" ]; then
  echo "[=] Already set to $NEW_HOST — nothing to do."
  exit 0
fi

echo "[*] Updating C2 host: $OLD_HOST → $NEW_HOST"
echo ""

update_file() {
  local file="$1"
  local label="$2"
  if [ -f "$file" ]; then
    sed -i '' "s|${OLD_HOST}:4000|${NEW_HOST}:4000|g" "$file"
    sed -i '' "s|hostname: \"${OLD_HOST}\"|hostname: \"${NEW_HOST}\"|g" "$file"
    echo "  ✓ $label"
  fi
}

# Act 1 — Shell persistence
update_file "$ROOT/act1-shell-persistence/install.sh"    "act1 — install.sh"
update_file "$ROOT/act1-shell-persistence/install.text"  "act1 — install.text"

# Act 2 — Browser extension
update_file "$ROOT/act2-browser-extension/background.js" "act2 — background.js"

# Act 3 — NPM supply chain
update_file "$ROOT/act3-npm-supply-chain/cool-datetime-helper/install.js" "act3 — install.js (source)"
update_file "$ROOT/act3-npm-supply-chain/sample-app/node_modules/cool-datetime-helper/install.js" "act3 — install.js (node_modules copy)"
update_file "$ROOT/act3-npm-supply-chain/sample-app/app.js"              "act3 — app.js"

# Act 4 — MCP server
update_file "$ROOT/act4-mcp-server/server.src.js"        "act4 — server.src.js"
update_file "$ROOT/act4-mcp-server/demo-client.sh"       "act4 — demo-client.sh"

# Attacker server (dashboard label + /payload endpoint)
update_file "$ROOT/attacker-server/server.js"            "attacker-server — server.js"

# Remember current host for next run
echo "$NEW_HOST" > "$CURRENT_HOST_FILE"

echo ""
echo "[+] Done. All components now point to $NEW_HOST:4000"

if [ -f "$ROOT/act4-mcp-server/server.src.js" ]; then
  echo ""
  echo "[!] Act 4: run 'cd act4-mcp-server && npm run build' to re-obfuscate server.js"
fi
