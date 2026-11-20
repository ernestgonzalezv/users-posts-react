#!/bin/bash
set -uo pipefail
INPUT=$(cat)
FILE=$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)
[ -n "$FILE" ] || exit 0

deny() {
  jq -nc --arg r "$1" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'
  exit 0
}

case "$FILE" in
  */scripts/ratchet/baseline/*) deny "Blocked: ratchet baselines are written only by scripts/ratchet/ratchet.sh update <rule>." ;;
  */.env|*/.env.*) deny "Blocked: environment files are never written by an agent." ;;
esac
exit 0
