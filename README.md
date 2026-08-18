# prpack

`prpack` is a local-first TypeScript CLI that turns a branch into a reviewer-ready PR handoff pack.

It reads optional `branchbrief` and `qualitygate` JSON artifacts when they exist, falls back to local git metadata when they do not, and writes:

- `PR_PACK.md` — full handoff document with git context, quality evidence, risks, follow-ups, and reviewer checklist
- optional PR body text — the concise Markdown you can paste into your hosting provider

V1 does **not** create PRs, comment on GitHub, call an LLM, phone home, or use the network.

## Install

`prpack` is not currently available from the npm registry. Install the verified
v0.1.0 GitHub release artifact instead:

```sh
npm install -D https://github.com/rogerchappel/prpack/releases/download/v0.1.0/prpack-0.1.0.tgz
```

After npm publication is recovered, the standard command will be:

```sh
npm install -D prpack
```

You can also run from this repository:

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

Run the fixture-backed artifact demo:

```sh
bash demo/run-artifact-pack.sh
```

That writes `tmp/demo-artifact-pack/PR_PACK.md`, `tmp/demo-artifact-pack/PR_BODY.md`, and a JSON result from the sample `branchbrief` and `qualitygate` artifacts.

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

Invalid invocations exit nonzero before generating or writing files. Options
that take values reject missing values and other option tokens; all options
except repeatable `--artifact` reject duplicates, and positional arguments after
`generate` are not accepted.

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
npm run package:smoke
npm run release:check
bash demo/run-artifact-pack.sh
bash scripts/validate.sh
```

## Release readiness

Run the same checks that CI uses before opening a release PR:

```sh
npm run release:readiness
npm run release:check
```

`release:readiness` validates repository metadata, the package files allowlist, package smoke coverage, and CI placeholder cleanup. `release:check` runs the project build, test, smoke, package dry-run, and packaged CLI version checks. `package.json` is the single source for the CLI version; `prpack --version` reads it from the installed package at runtime.

Tagged releases matching `v*.*.*` are configured to publish the matching package version to npm using trusted publishing, then attach the package tarball to the GitHub release. Check the two distribution channels independently with `npm run release:availability`; a GitHub release can exist even when the npm version does not. Before pushing a tag, use `npm version <version> --no-git-tag-version` to update the package metadata and lockfile together, then run `npm run release:check`. The npm package's trusted publisher must be configured for this repository and `.github/workflows/release.yml`.

### Recover an existing release tag

Use the manual **Release** workflow only when a valid existing tag and GitHub release were created but npm publication did not complete:

1. Run `npm run release:availability -- --version 0.1.0` and confirm that the GitHub release is available while `prpack@0.1.0` is missing from npm.
2. Confirm the tag is the intended immutable release and that its `package.json` version matches (for example, `v0.1.0` and `0.1.0`). Also verify the existing release artifact and tag before starting recovery: `gh release view v0.1.0 --repo rogerchappel/prpack` and `git rev-parse v0.1.0^{commit}`.
3. In GitHub Actions, open **Release**, choose **Run workflow**, enter that exact tag in the `tag` field, and run it from the default branch. Do not create or move a tag for recovery.
4. Review the run summary, then confirm publication with `npm view prpack@0.1.0 version`; it must print `0.1.0`.

The recovery run checks out the requested tag, verifies that the tag commit is the checked-out commit, verifies the package version, and runs the full release checks before publishing with provenance and public access. It checks npm first and skips publication if that exact version already exists. It also requires the existing GitHub release and never tries to create a second release.

This path is safe to retry after a partial failure. A failure before `npm publish` makes no registry change. If publication succeeds but a later packaging or release-confirmation step fails, rerun the same tag: the workflow detects the published version, skips `npm publish`, and continues its checks. If the GitHub release is missing, create or restore it through a reviewed maintainer action before retrying; recovery intentionally fails instead of silently creating one.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Please keep changes small, local-first, deterministic, and easy to review.

## License

MIT
