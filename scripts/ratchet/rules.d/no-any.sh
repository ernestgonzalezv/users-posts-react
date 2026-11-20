#!/bin/bash
. "$(dirname "$0")/../lib.sh"
source_files | xargs grep -nE ':\s*any\b|<any>|as any\b|any\[\]' 2>/dev/null || true
