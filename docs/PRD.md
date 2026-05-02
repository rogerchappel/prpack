# PRD: prpack

Status: in-progress

## Scorecard

Total: 82/100
Band: build now
Last scored: 2026-04-29
Scored by: Neo

| Criterion | Points | Notes |
|---|---:|---|
| Problem pain | 18/20 | PR handoff quality is a recurring failure point, including malformed PR bodies. |
| Demand signal | 16/20 | Strong internal signal from recent PR formatting issues and review-pack workflow; external validation still needed. |
| V1 buildability | 18/20 | Can compose git metadata and optional artifacts into Markdown deterministically. |
| Differentiation | 12/15 | Stronger when paired with branchbrief and qualitygate; less unique standalone. |
| Agentic workflow leverage | 14/15 | Standardizes agent-to-human review packets. |
| Distribution potential | 4/10 | Useful but likely needs demos to make the value obvious. |

## Pitch

Generate a complete PR handoff pack from branchbrief, qualitygate, and git metadata.

## Why It Matters

Review needs a standard packet: changed files, proof, risk, rollback, follow-ups.

## V1 Scope

- CLI: `prpack generate`
- Reads branchbrief/qualitygate artifacts if present
- Falls back to git metadata
- Outputs `PR_PACK.md` and PR body text
- Includes reviewer checklist

## Out of Scope

- No PR creation in V1
- No GitHub comments/reviews
- No LLM dependency

## Verification

- Fixtures for branchbrief + qualitygate present/missing
- Snapshot PR pack output

## Agent Prompt

Build `prpack`, a deterministic CLI that creates a PR handoff document from local git metadata plus optional `branchbrief` and `qualitygate` artifacts. Include Markdown output, PR body output, fixtures, tests, README, and examples.
