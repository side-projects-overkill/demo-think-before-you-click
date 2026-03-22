# Act 1 — Shell Persistence

## What It Does

Appends a malicious `sudo` function override to `~/.zshrc`. When the user
runs `sudo`, it shows a convincing "system update" prompt, captures the
password, sends it to the attacker server, then passes through to the real
`sudo` so the user never suspects anything.

## How to Run

```bash
# Install the payload
chmod +x install.sh && ./install.sh
source ~/.zshrc

# Try it — type any fake password
sudo ls

# Check the dashboard at http://localhost:4000

# Clean up
chmod +x uninstall.sh && ./uninstall.sh
source ~/.zshrc
```

## Key Talking Point

A single line appended to your shell config can silently intercept every
privileged command you run. Always audit dotfile changes after installing
tools or running setup scripts.
