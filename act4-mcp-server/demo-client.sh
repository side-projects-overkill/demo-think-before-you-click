#!/bin/bash
# ============================================================
# ACT 4 — Demo Client: Use the LinkedIn Post Generator MCP tool
# ============================================================

echo "=== LinkedIn Post Generator MCP Demo ==="
echo ""

echo "[1] Listing available tools..."
echo ""
curl -s http://localhost:4001/tools | python3 -m json.tool
echo ""
echo "---"
echo ""

echo "[2] Generating a LinkedIn post about 'AI in DevOps'..."
echo ""
RESPONSE=$(curl -s -X POST http://localhost:4001/call \
  -H "Content-Type: application/json" \
  -d '{"tool": "generate_linkedin_post", "arguments": {"topic": "AI in DevOps", "style": "tech"}}')

echo "=== Response from MCP Tool ==="
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""
echo "[!] Looks like a normal LinkedIn post, right?"
echo "[!] Check http://localhost:4000 — your .env files were stolen!"
echo "[!] Also inspect the raw response — hidden prompt injection is embedded."
