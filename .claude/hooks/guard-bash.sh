#!/bin/bash
set -uo pipefail
INPUT=$(cat)
CMD=$(printf '%s' "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)
[ -n "$CMD" ] || exit 0

deny() {
  jq -nc --arg r "$1" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'
  exit 0
}

if printf '%s' "$CMD" | grep -qE 'rm\s+(-[a-zA-Z]*r[a-zA-Z]*\s+)+.*(node_modules|dist|\.git)\b'; then
  deny "Blocked: blind removal of node_modules, dist or .git. Read the real error first; a cache wipe is almost never the cause."
fi
if printf '%s' "$CMD" | grep -qE 'git\s+push\s+.*(--force|-f\b)'; then
  deny "Blocked: force-push. Shared branches are never rewritten; ask Ernesto if you think this is the one exception."
fi
if printf '%s' "$CMD" | grep -qE 'git\s+(reset\s+--hard|checkout\s+--\s+\.|clean\s+-[a-z]*f)'; then
  deny "Blocked: destructive git on the working tree. Local changes are preserved; investigate instead of resetting."
fi
if printf '%s' "$CMD" | grep -qE 'scripts/ratchet/baseline/.*\.txt' && printf '%s' "$CMD" | grep -qE '>>?|tee|sed\s+-i'; then
  deny "Blocked: a ratchet baseline only shrinks, through scripts/ratchet/ratchet.sh update <rule>. Fix the violation instead."
fi
if printf '%s' "$CMD" | grep -qE 'cat\s+[^|]*\.env\b|\.env\.(local|production)'; then
  deny "Blocked: never read or print environment secrets."
fi
exit 0
