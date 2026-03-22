# Act 3 — NPM Supply Chain Attack

## What It Does

A fake npm package (`cool-datetime-helper`) that looks like a legitimate
datetime utility. It actually works — but its `postinstall` script silently
scans `process.env` for secrets and API keys, then exfiltrates them to the
attacker server.

## How to Run

```bash
cd sample-app

# Set some demo env vars to see them captured
export DEMO_API_KEY="sk-demo-1234567890abcdef"
export SAMPLE_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.token"

# Install triggers the postinstall attack
npm install

# The app works perfectly fine
node app.js

# Check http://localhost:4000 — your env vars were stolen
```

Or just run the convenience script:

```bash
cd sample-app && chmod +x run-demo.sh && ./run-demo.sh
```

## Key Talking Point

`npm install` can execute arbitrary code via lifecycle scripts
(`postinstall`, `preinstall`, etc.). A single malicious dependency in your
tree can steal every environment variable — including CI/CD tokens, cloud
credentials, and API keys. Use `--ignore-scripts` when unsure, and audit
new dependencies before installing.
