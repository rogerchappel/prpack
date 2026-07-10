#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/tmp/demo-artifact-pack"

cd "$ROOT"
rm -rf "$OUT"
mkdir -p "$OUT"

npm run build >/dev/null

node dist/src/cli.js generate \
  --cwd fixtures/with-artifacts \
  --output ../../tmp/demo-artifact-pack/PR_PACK.md \
  --pr-body ../../tmp/demo-artifact-pack/PR_BODY.md \
  --json >"$OUT/result.json"

test -s "$OUT/PR_PACK.md"
test -s "$OUT/PR_BODY.md"
grep -q "Reviewer Checklist" "$OUT/PR_PACK.md"
grep -q "## Summary" "$OUT/PR_BODY.md"
grep -q '"warnings"' "$OUT/result.json"

printf 'Demo wrote:\n'
printf '  %s\n' "$OUT/PR_PACK.md"
printf '  %s\n' "$OUT/PR_BODY.md"
printf '  %s\n' "$OUT/result.json"
