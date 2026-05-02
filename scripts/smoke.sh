#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

rm -rf tmp/smoke
mkdir -p tmp/smoke
node dist/src/cli.js generate \
  --cwd fixtures/with-artifacts \
  --output ../../tmp/smoke/PR_PACK.md \
  --pr-body ../../tmp/smoke/PR_BODY.md

test -s tmp/smoke/PR_PACK.md
test -s tmp/smoke/PR_BODY.md
grep -q "Reviewer Checklist" tmp/smoke/PR_PACK.md
grep -q "## Summary" tmp/smoke/PR_BODY.md
printf 'Smoke generated tmp/smoke/PR_PACK.md and tmp/smoke/PR_BODY.md\n'
