#!/bin/bash
# ============================================================
# ACT 1 — Uninstall: Remove fake shell update payload
# EDUCATIONAL DEMO ONLY — Selective Sinners
# ============================================================

FOUND=0

for RC in "$HOME/.zshrc" "$HOME/.bashrc"; do
  for TAG in "shell-update" "zsh-update"; do
    MS="# >>> SELECTIVE-SINNERS-DEMO ${TAG} >>>"
    ME="# <<< SELECTIVE-SINNERS-DEMO ${TAG} <<<"
    if grep -q "$MS" "$RC" 2>/dev/null; then
      sed -i.bak "/${MS}/,/${ME}/d" "$RC"
      echo "[+] Payload ($TAG) removed from $RC (backup: ${RC}.bak)"
      FOUND=1
    fi
  done
done

CACHE_FILE="${HOME}/.ssh/.ssh_accounts_sinners"
if [ -f "$CACHE_FILE" ]; then
  rm -f "$CACHE_FILE"
  echo "[+] Removed cached password file: $CACHE_FILE"
fi

if [ "$FOUND" -eq 0 ]; then
  echo "[*] No payload found — nothing to remove."
else
  echo "[+] Done. Open a new terminal to apply."
fi
