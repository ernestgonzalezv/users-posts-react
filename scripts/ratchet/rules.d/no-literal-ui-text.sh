#!/bin/bash
. "$(dirname "$0")/../lib.sh"
source_files | grep -E '\.tsx$' | grep -v "$ROOT/src/i18n/" \
  | xargs grep -nE '>[[:space:]]*[A-Za-z][^<{]*<|(placeholder|aria-label|title|alt)="[A-Za-z]' 2>/dev/null || true
