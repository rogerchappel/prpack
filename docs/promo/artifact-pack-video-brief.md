# Artifact Pack Demo Brief

## Angle

Show how `prpack` turns existing branch and quality artifacts into a reviewer-ready handoff without creating a PR or calling any network service.

## Demo Path

```sh
bash demo/run-artifact-pack.sh
```

The script builds the CLI, reads `fixtures/with-artifacts/branchbrief.json` and `fixtures/with-artifacts/qualitygate.json`, then writes:

- `tmp/demo-artifact-pack/PR_PACK.md`
- `tmp/demo-artifact-pack/PR_BODY.md`
- `tmp/demo-artifact-pack/result.json`

## Shot List

1. Open the two fixture JSON files and point out the summary, testing, risks, and quality checks.
2. Run `bash demo/run-artifact-pack.sh`.
3. Open `tmp/demo-artifact-pack/PR_PACK.md` and highlight the reviewer checklist.
4. Open `tmp/demo-artifact-pack/PR_BODY.md` and show the paste-ready summary.
5. Open `tmp/demo-artifact-pack/result.json` to show the machine-readable wrapper.

## Guardrails

- Do not claim that `prpack` creates, updates, or comments on pull requests.
- Do not imply live GitHub access; v0.1 is local-first.
- Keep the message on deterministic handoff artifacts that reviewers can inspect.
