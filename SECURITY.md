# Security Policy

## Supported Versions

`prpack` is pre-1.0. Until the first tagged release, security fixes land on `main` and in the next package release when packaging begins.

| Version | Supported |
| --- | --- |
| `main` | Best effort |
| `< 0.1.0` | No |

## Local-first security posture

V1 intentionally avoids high-risk behaviors:

- no telemetry
- no hidden network calls
- no PR creation
- no GitHub token requirement
- no LLM or hosted processing dependency
- read-only git metadata commands

## Reporting a Vulnerability

Please do not report suspected vulnerabilities in public issues, pull requests, or discussions.

Use GitHub private vulnerability reporting if enabled for `rogerchappel/prpack`. If it is not available yet, open a public issue asking for a private reporting path without exploit details, secrets, personal data, or sensitive technical details.

## What to Include

When a private reporting path is available, include:

- A clear description of the issue.
- Affected versions, files, packages, workflows, or configuration.
- Steps to reproduce, proof of concept, or attack scenario when safe to share.
- Potential impact.
- Suggested mitigation, if known.

## Scope

In scope:

- Vulnerabilities in `prpack`.
- Insecure default configuration shipped by this project.
- CI, release, or dependency guidance maintained by this project.

Out of scope:

- General support requests.
- Requests for guaranteed maintenance timelines.
- Issues in unrelated downstream projects.

## Disclosure

Coordinate disclosure with maintainers before publishing vulnerability details.
