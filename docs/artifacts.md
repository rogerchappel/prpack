# Artifact formats

`prpack` intentionally accepts small JSON documents so other tools and agents can hand it context without coupling to a service.

## branchbrief

Preferred fields:

- `title`: PR title candidate
- `summary`: human summary
- `motivation` or `why`: why the change exists
- `changes`: important changes
- `testing` or `tests`: verification commands/evidence
- `risks`: reviewer risk prompts
- `rollout`: rollout or rollback notes
- `followUps` / `follow_ups` / `todo`: later work
- `reviewers`: optional reviewer hints

Unknown fields are preserved in `raw` when using the TypeScript API.

## qualitygate

Preferred fields:

- `status`: `pass`, `fail`, `warn`, or `unknown`
- `summary`: short evidence summary
- `commands`: commands that were run
- `checks`: list of named checks with `status` and optional `details`

## Design principle

Artifacts are advisory. If they are absent or malformed, `prpack` emits warnings and falls back to git metadata instead of blocking local review.
