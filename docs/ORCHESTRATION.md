# ORCHESTRATION: prpack

Owner: one isolated project sub-agent.
Workspace: /Users/roger/Developer/my-opensource/prpack only.

## Rules
- Do not edit another project or oss-ideas from this repo agent.
- Work directly in this newly scaffolded repo; it has no established main checkout history yet.
- Commit frequently and atomically to main.
- Keep the project local-first and deterministic.
- Never publish secrets, telemetry, or surprise network calls.

## Required gates
Run and record results for:
- npm test
- npm run check
- npm run build
- npm run smoke
- bash scripts/validate.sh
- One real CLI smoke against fixtures or a temp repo/folder

## Publish
- Create public GitHub repo: https://github.com/rogerchappel/prpack
- Push main directly when verified.
- Configure repo description and topics.
- Run /Users/roger/.openclaw/workspace/scripts/protect-github-main.sh rogerchappel prpack main if available.
- Report commit count, test results, repo URL, and branch protection status.
