# Release candidate readiness

## Scope

This branch adds repeatable release-candidate checks for `prpack` before a reviewed npm/GitHub release.

## Readiness changes

- Added `releasebox.config.json` for a reviewed `node-cli` release flow.
- Added `.github/workflows/release-dry-run.yml` to run release dry-runs on readiness changes and manual dispatch.
- Added `npm run release:check` to run TypeScript checks, tests, smoke coverage, and `npm pack --dry-run`.
- Updated the test script to use a CI-compatible `dist/test/*.test.js` pattern.

## Local checks run

- `npm ci` — passed
- `npm run release:check` — passed
  - `npm run check`
  - `npm test`
  - `npm run smoke`
  - `npm pack --dry-run`
- `bash scripts/validate.sh` — passed
- `node /Users/roger/Developer/my-opensource/releasebox/bin/releasebox.js check .` — passed

## Release notes preview

### Highlights

- Fixes: Handle top-level CLI help and version.
- Fixes: Return optional artifact discoveries explicitly.
- Fixes: Make optional model fields explicit.
- Fixes: Support exact optional TypeScript settings.

### Changes

- Fixes: Handle top-level CLI help and version. (eed29dc)
- Fixes: Return optional artifact discoveries explicitly. (15d3e4a)
- Fixes: Make optional model fields explicit. (15d6ea4)
- Fixes: Support exact optional TypeScript settings. (ba852a2)
- Docs: Clarify local-first security policy. (65283e4)
- Docs: Tailor roadmap to prpack. (88d3748)
- Docs: Update changelog for MVP. (5f041f7)
- Docs: Add qualitygate example. (77ef353)
- Docs: Add branchbrief example. (93052cf)
- Docs: Document generate command. (bf03c2e)
- Docs: Document artifact formats. (bd03b3f)
- Docs: Write practical README. (5859fdb)
- Maintenance: Align dev dependency ranges with lockfile. (753e930)
- Tests: Align markdown checklist snapshot snippets. (cde78d0)
- Tests: Assert stable markdown snapshot snippets. (5374f75)
- Tests: Cover CLI help and JSON output. (bd6c400)
- Tests: Add reusable CLI smoke script. (394932b)
- Maintenance: Ignore build and generated outputs. (44d80d8)
- Tests: Cover generation with and without artifacts. (e0c8fcc)
- Tests: Cover git status parsing. (d37c1e9)

### Contributors

- Roger Chappel
