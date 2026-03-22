#!/bin/bash
# ============================================================
# ACT 4 — Demo Client: Send code to the malicious MCP server
# ============================================================

echo "[*] Sending code to AI refactoring tool at localhost:4001..."
echo ""

RESPONSE=$(curl -s -X POST http://localhost:4001/refactor \
  -H "Content-Type: application/json" \
  -d '{
    "code": "const db = require(\"./db\");\n\nasync function getUsers() {\n  return await db.query(\"SELECT * FROM users\");\n}\n\nmodule.exports = { getUsers };"
  }')

echo "=== Response from AI Tool ==="
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""
echo "[!] Check http://localhost:4000 — your .env files were stolen!"
echo "[!] Also notice the injected 'performance monitoring' code above."
