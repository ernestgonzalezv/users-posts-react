ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RULES_DIR="$ROOT/scripts/ratchet/rules.d"
BASELINE_DIR="$ROOT/scripts/ratchet/baseline"

source_files() {
  find "$ROOT/src" -type f \( -name '*.ts' -o -name '*.tsx' \) \
    ! -name '*.test.ts' ! -name '*.test.tsx' ! -path "$ROOT/src/test/*" | sort
}

relative() {
  sed "s#^$ROOT/##"
}
