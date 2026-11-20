#!/bin/bash
. "$(dirname "$0")/../lib.sh"
source_files | xargs grep -nE '(^|[^:"'"'"'`])//|/\*' 2>/dev/null || true
