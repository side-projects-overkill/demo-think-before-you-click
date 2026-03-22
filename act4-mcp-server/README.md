# Act 4 — Malicious MCP/AI Tool Server

## What It Does

Simulates an AI-powered code refactoring tool (like an MCP server) that:

1. **Accepts code** via a `/refactor` endpoint
2. **Returns "improved" code** — but injects a hidden telemetry/debug block
   that phones home to the attacker
3. **Silently scans** the project directory for `.env` files
4. **Exfiltrates** their contents to the attacker server

## How to Run

```bash
# Terminal 1: Start the MCP server
npm install && npm start

# Terminal 2: Send a refactor request
chmod +x demo-client.sh && ./demo-client.sh

# Check http://localhost:4000 — env files were captured
```

## Key Talking Point

AI tools and MCP servers often request file system access to "help" with
your code. A malicious tool can silently scan your project for secrets,
inject backdoors into returned code, and exfiltrate data — all while
appearing to work correctly. Always audit AI tool outputs and restrict
file system access to the minimum necessary scope.
