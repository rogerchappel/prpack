# prpack

`prpack` is a local-first TypeScript CLI that turns a branch into a reviewer-ready PR handoff pack.

It reads optional `branchbrief` and `qualitygate` JSON artifacts when they exist, falls back to local git metadata when they do not, and writes:

- `PR_PACK.md` — full handoff document with git context, quality evidence, risks, follow-ups, and reviewer checklist
- optional PR body text — the concise Markdown you can paste into your hosting provider

V1 does **not** create PRs, comment on GitHub, call an LLM, phone home, or use the network.

## Install

```sh
npm install -D prpack
```

Or run from this repository:

```sh
npm install
npm run build
node dist/src/cli.js generate
```

## Quickstart

```sh
prpack generate
```

That writes `PR_PACK.md` in the current repository.

Write a paste-ready PR body too:

```sh
prpack generate --pr-body PR_BODY.md
```

Ask for machine-readable output:

```sh
prpack generate --json
```

Preview without writing files:

```sh
prpack generate --no-write
```

## Artifact discovery

`prpack generate` automatically looks for:

- `branchbrief.json`
- `.branchbrief.json`
- `branchbrief/branchbrief.json`
- `.branchbrief/branchbrief.json`
- `qualitygate.json`
- `.qualitygate.json`
- `qualitygate/qualitygate.json`
- `.qualitygate/qualitygate.json`

You can provide extra locations:

```sh
prpack generate --artifact artifacts/branchbrief.json --artifact artifacts/qualitygate.json
```

## branchbrief shape

```json
{
  "title": "Add deterministic PR pack generation",
  "summary": "Generate a reviewer-ready handoff from local artifacts and git metadata.",
  "changes": ["Render PR_PACK.md", "Render PR_BODY.md"],
  "testing": ["npm test", "npm run build"],
  "risks": ["Markdown templates may drift"],
  "rollout": ["Regenerate the pack before opening a PR"],
  "followUps": ["Collect more artifact examples"]
}
```

## qualitygate shape

```json
{
  "status": "pass",
  "summary": "All local checks passed.",
  "commands": ["npm test", "npm run check", "npm run build"],
  "checks": [
    { "name": "unit tests", "status": "pass" },
    { "name": "typecheck", "status": "pass" }
  ]
}
```

## CLI reference

```text
prpack generate [options]

Options:
  --cwd <path>           Repository to inspect (default: current directory)
  --output <path>        Markdown pack path (default: PR_PACK.md)
  --pr-body <path>       Also write PR body text to this path
  --base <branch>        Base branch name for git comparison
  --artifact <path>      Extra artifact path to read (repeatable)
  --json                 Print JSON result for automation
  --no-write             Do not write files; print output only
  -h, --help             Show help
  -v, --version          Show version
```

## Safety and local-first guarantees

- No telemetry.
- No hidden network calls.
- No PR creation in V1.
- No GitHub token required.
- Git commands are read-only metadata queries.
- Output is deterministic except for the generated timestamp and current git state.

## Verify

```sh
npm test
npm run check
npm run build
npm run smoke
bash scripts/validate.sh
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Please keep changes small, local-first, deterministic, and easy to review.

## License

MIT
