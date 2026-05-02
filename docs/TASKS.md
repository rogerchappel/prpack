# TASKS: prpack

## Wave 1 — Baseline
- Initialize git on main and commit the StackForge scaffold.
- Replace placeholder package metadata and README positioning.
- Add deterministic fixtures for the core CLI workflows.

## Wave 2 — Core MVP
- Implement the local-first core module described in docs/PRD.md.
- Keep network and shell execution opt-in, explicit, and documented.
- Expose typed data models plus JSON-friendly output.

## Wave 3 — CLI
- Build the primary CLI command from the PRD.
- Support terminal-friendly Markdown/table output where useful.
- Support --json output for agents and automation.
- Add helpful errors, --help text, and examples.

## Wave 4 — Verification
- Add fixture-backed unit tests and snapshot-style assertions.
- Add npm scripts: check, build, test, smoke.
- Add scripts/validate.sh coverage and at least one real CLI smoke.

## Wave 5 — Docs + Publish
- Write a practical README with personality, quickstart, examples, safety notes, and local-first guarantees.
- Ensure SECURITY, CONTRIBUTING, CHANGELOG, ROADMAP, and package metadata fit the project.
- Create/push public GitHub repo rogerchappel/prpack on main.
- Set GitHub description/topics and best-effort main protection.

## Commit target
Create ~30–50 meaningful atomic commits. Do not create fake/no-op commits.
