#!/bin/bash
set -uo pipefail
. "$(dirname "$0")/lib.sh"

RED=$'\033[31m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'; OFF=$'\033[0m'

usage() {
  echo "usage: ratchet.sh list | check | update <rule>"
  exit 2
}

current() {
  bash "$RULES_DIR/$1.sh" 2>/dev/null | relative | cut -d: -f1 | sort -u
}

baseline() {
  [ -f "$BASELINE_DIR/$1.txt" ] && sort -u "$BASELINE_DIR/$1.txt" || true
}

rules() {
  for f in "$RULES_DIR"/*.sh; do basename "$f" .sh; done
}

cmd="${1:-}"
case "$cmd" in
  list)
    for rule in $(rules); do
      echo "== $rule"
      bash "$RULES_DIR/$rule.sh" | relative
    done
    ;;
  check)
    fail=0
    for rule in $(rules); do
      new="$(comm -23 <(current "$rule") <(baseline "$rule"))"
      stale="$(comm -13 <(current "$rule") <(baseline "$rule"))"
      if [ -n "$new" ]; then
        fail=1
        echo "${RED}FAIL${OFF} $rule: new violations"
        bash "$RULES_DIR/$rule.sh" | relative | grep -F -f <(printf '%s\n' "$new") | sed 's/^/      /'
      elif [ -n "$stale" ]; then
        fail=1
        echo "${YELLOW}STALE${OFF} $rule: baseline lists files that no longer violate; run: scripts/ratchet/ratchet.sh update $rule"
        printf '%s\n' "$stale" | sed 's/^/      /'
      else
        echo "${GREEN}ok${OFF}   $rule"
      fi
    done
    [ "$fail" -eq 0 ] && echo "$(rules | wc -l | tr -d ' ') rules ok" || echo "ratchet drift"
    exit "$fail"
    ;;
  update)
    rule="${2:-}"; [ -n "$rule" ] || usage
    [ -f "$RULES_DIR/$rule.sh" ] || { echo "unknown rule: $rule"; exit 2; }
    current "$rule" >"$BASELINE_DIR/$rule.txt"
    echo "baseline for $rule now has $(wc -l <"$BASELINE_DIR/$rule.txt" | tr -d ' ') files"
    ;;
  *) usage ;;
esac
