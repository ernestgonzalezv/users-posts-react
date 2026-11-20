#!/bin/bash
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RED=$'\033[31m'; GREEN=$'\033[32m'; OFF=$'\033[0m'
fail=0

usage() {
  echo "usage: pr-gates.sh <pr-number> | --local"
  echo "  <pr-number>  reads the PR's title, body, comments and files with gh"
  echo "  --local      reads .harness/pr-body.md and .harness/pr-title and diffs the branch against develop"
  exit 2
}

body_file="$(mktemp)"; files_file="$(mktemp)"; title=""
case "${1:-}" in
  --local)
    cat "$ROOT/.harness/pr-body.md" >"$body_file" 2>/dev/null || { echo "no .harness/pr-body.md"; exit 2; }
    title="$(cat "$ROOT/.harness/pr-title" 2>/dev/null || true)"
    git -C "$ROOT" diff --name-only develop...HEAD >"$files_file" || { echo "cannot diff against develop"; exit 2; }
    numstat="$(git -C "$ROOT" diff --numstat develop...HEAD)"
    ;;
  "") usage ;;
  *)
    command -v gh >/dev/null || { echo "gh not installed"; exit 2; }
    gh pr view "$1" --json body -q .body >"$body_file" || { echo "cannot read the PR body"; exit 2; }
    gh pr view "$1" --json comments -q '.comments[].body' >>"$body_file" 2>/dev/null || true
    gh pr view "$1" --json files -q '.files[].path' >"$files_file" || { echo "cannot read the PR files"; exit 2; }
    title="$(gh pr view "$1" --json title -q .title)"
    numstat="$(gh pr view "$1" --json files -q '.files[] | "\(.additions)\t\(.deletions)\t\(.path)"')"
    ;;
esac

body="$(cat "$body_file")"
section() { printf '%s' "$body" | grep -qiE "^#{1,3}[[:space:]]*$1"; }
ok() { echo "${GREEN}ok${OFF}   $1"; }
bad() { echo "${RED}FAIL${OFF} $1"; fail=1; }

ui=0; i18n=0; data=0
while IFS= read -r f; do
  [ -n "$f" ] || continue
  case "$f" in
    src/test/*|*.test.ts|*.test.tsx) ;;
    src/i18n/*) i18n=$((i18n+1)) ;;
    src/core/*|*/data/*) data=$((data+1)) ;;
    *.tsx|*.css) ui=$((ui+1)) ;;
  esac
done <"$files_file"

if printf '%s' "$title" | grep -qE '^(feat|fix|docs|test|chore|refactor|ci|build|release)(\([a-z0-9-]+\))?: [a-z]'; then
  ok "semantic title: $title"
else
  bad "title must be semantic, lowercase, e.g. 'feat: debounced user search' (got: '$title')"
fi

if printf '%s' "$body" | grep -q 'raw.githubusercontent.com'; then
  bad "images from raw.githubusercontent.com; use github.com/<repo>/blob/<sha>/<path>?raw=true"
else
  ok "no raw.githubusercontent images"
fi

if section 'Manual tests' && printf '%s' "$body" | grep -qE '^\s*(-|[0-9]+\.)?\s*\**Expected:'; then
  ok "manual test script with Expected: lines"
else
  bad "needs a '## Manual tests' section with numbered steps and at least one 'Expected:' line"
fi

if [ "$ui" -gt 0 ]; then
  section 'Screenshots' && ok "screenshots section for $ui UI file(s)" || bad "UI changed ($ui file(s)) but no '## Screenshots' section"
  section 'Accessibility' && ok "accessibility block" || bad "UI changed but no '## Accessibility' section (keyboard, screen reader, reduced motion)"
else
  ok "no UI change: screenshots and accessibility not required"
fi

if [ "$i18n" -gt 0 ]; then
  printf '%s' "$body" | grep -qi 'english' && printf '%s' "$body" | grep -qi 'spanish' \
    && ok "both languages mentioned for i18n change" \
    || bad "src/i18n changed but the script does not cover both English and Spanish"
fi

if [ "$data" -gt 0 ]; then
  section 'API contract' && ok "API contract section for data change" || bad "core/ or data/ changed but no '## API contract' section"
fi

prod="$(printf '%s\n' "$numstat" | grep -vE '\.test\.tsx?\b|src/test/|^\s*$' | grep -E '\ssrc/' | awk '{a+=$1} END {print a+0}')"
if [ "$prod" -le 500 ]; then
  ok "production lines added in src/: $prod (ceiling 500)"
else
  bad "production lines added in src/: $prod, over the 500 ceiling; split the PR"
fi

[ "$fail" -eq 0 ] && echo "${GREEN}all gates passed${OFF}" || echo "${RED}gates failed${OFF}"
exit "$fail"
