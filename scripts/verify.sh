#!/bin/bash
set -uo pipefail
cd "$(dirname "$0")/.."

GREEN=$'\033[32m'; RED=$'\033[31m'; DIM=$'\033[2m'; OFF=$'\033[0m'
declare -a rows=()
status=0

run_step() {
  local name="$1"; shift
  if [ "$status" -ne 0 ]; then
    rows+=("$name|SKIPPED (earlier step failed)")
    return
  fi
  local out
  if out="$("$@" 2>&1)"; then
    rows+=("$name|${GREEN}PASS${OFF} $(summarize "$name" "$out")")
  else
    status=1
    rows+=("$name|${RED}FAIL${OFF}")
    printf '%s\n' "$out" | tail -40
  fi
}

summarize() {
  case "$1" in
    Tests) printf '%s · lines %s' "$(printf '%s' "$2" | grep -E '^\s+Tests ' | sed -E 's/^ +//')" "$(printf '%s' "$2" | grep -E '^Lines' | grep -oE '[0-9.]+%')" ;;
    Ratchets) printf '%s' "$2" | tail -1 ;;
    *) printf '' ;;
  esac
}

run_step Typecheck npm run -s typecheck
run_step Lint npm run -s lint
run_step Tests npm run -s test:coverage
run_step Build npm run -s build
run_step Ratchets scripts/ratchet/ratchet.sh check

printf '\n%s| Step       | Result%s\n' "$DIM" "$OFF"
printf '%s|------------|------------------------------%s\n' "$DIM" "$OFF"
for row in "${rows[@]}"; do
  printf '| %-10s | %s\n' "${row%%|*}" "${row#*|}"
done
exit "$status"
