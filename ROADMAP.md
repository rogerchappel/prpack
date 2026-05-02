# Roadmap

This roadmap describes intended direction, not a binding delivery promise.

## Now

- Harden `prpack generate` from real repositories and artifact shapes.
- Keep V1 deterministic, local-first, and dependency-light.
- Improve examples around agent-authored PR handoffs.

## Next

- Add richer artifact schema documentation and validation warnings.
- Support configurable output sections without making templates fragile.
- Add more snapshot fixtures for renamed files, deleted files, and no-diff states.
- Publish the first npm package once the GitHub repository has real usage notes.

## Later

- Optional integrations that can copy output to a clipboard or PR form.
- Optional template packs for different review cultures.
- Better monorepo awareness when artifact paths live outside the package root.

## Not Planned for V1

- Creating PRs.
- Posting comments or reviews.
- Calling LLMs.
- Telemetry or hosted processing.
- Mandatory branchbrief or qualitygate dependencies.

## Roadmap Review

Before each major or meaningful minor release:

- Move completed user-visible work into `CHANGELOG.md`.
- Remove stale commitments.
- Promote only the next reviewable set of work into `Now`.
