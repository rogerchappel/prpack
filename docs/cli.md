# CLI

## `prpack generate`

Generates a PR handoff pack from the current working tree and optional artifacts.

```sh
prpack generate --base main --pr-body PR_BODY.md
```

The base must resolve to a commit. A plain branch such as `main` prefers
`origin/main` and falls back to a local branch of the same name; `origin/main`
may be supplied explicitly. A missing base exits nonzero without writing a
pack.

Value-taking options require a following non-option value. Singleton options may
only be provided once, while `--artifact` remains repeatable. Unknown options and
unexpected positional arguments are usage errors. Invalid usage exits nonzero
before generation starts, so it does not create or overwrite output files.

Outputs:

- `PR_PACK.md` by default
- optional PR body file with `--pr-body`
- JSON to stdout with `--json`

## Exit behavior

- Exits `0` when generation succeeds, including git-only fallback mode.
- Exits non-zero for invalid command-line options, an unresolved explicit base,
  or unexpected write failures.

## Network behavior

The CLI does not create PRs and does not perform network requests. It only shells out to local `git` for read-only metadata.
