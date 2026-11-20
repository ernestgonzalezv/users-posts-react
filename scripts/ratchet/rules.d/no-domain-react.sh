#!/bin/bash
. "$(dirname "$0")/../lib.sh"
source_files | grep -E '/(domain|data)/' | xargs grep -nE "from 'react|from \"react" 2>/dev/null || true
