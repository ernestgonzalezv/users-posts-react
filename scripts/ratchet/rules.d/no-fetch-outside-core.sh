#!/bin/bash
. "$(dirname "$0")/../lib.sh"
source_files | grep -v "$ROOT/src/core/" | xargs grep -nE '\bfetch\(|jsonplaceholder' 2>/dev/null || true
