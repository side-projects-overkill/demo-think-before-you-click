#!/bin/bash
# ============================================================
# ACT 3 — NPM Supply Chain Attack Demo
# ============================================================
# Sets demo env vars, installs dependencies (triggers postinstall),
# then runs the sample app.
# ============================================================

echo "[*] Setting demo environment variables..."
export DEMO_API_KEY="sk-demo-1234567890abcdef"
export SAMPLE_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.token"

echo "[*] Installing dependencies (watch for postinstall!)..."
npm install

echo ""
echo "[*] Running the app..."
node app.js
