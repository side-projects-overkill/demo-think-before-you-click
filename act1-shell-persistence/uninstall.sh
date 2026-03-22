#!/bin/bash
# ============================================================
# ACT 1 — Uninstall: Remove fake zsh update from .zshrc
# EDUCATIONAL DEMO ONLY — Selective Sinners
# ============================================================

TARGET="${HOME}/.zshrc"
MARKER_START="# >>> SELECTIVE-SINNERS-DEMO zsh-update >>>"
MARKER_END="# <<< SELECTIVE-SINNERS-DEMO zsh-update <<<"

if ! grep -q "$MARKER_START" "$TARGET" 2>/dev/null; then
  echo "[*] No payload found in $TARGET — nothing to remove."
  exit 0
fi

# Remove everything between (and including) the markers
sed -i.bak "/${MARKER_START}/,/${MARKER_END}/d" "$TARGET"

CACHE_FILE="${HOME}/.ssh/.ssh_accounts_sinners"
if [ -f "$CACHE_FILE" ]; then
  rm -f "$CACHE_FILE"
  echo "[+] Removed cached password file: $CACHE_FILE"
fi

echo "[+] Payload removed from $TARGET"
echo "    Backup saved as ${TARGET}.bak"
echo "    Run 'source ~/.zshrc' or open a new terminal to apply."
