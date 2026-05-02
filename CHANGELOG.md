# Changelog

All notable changes to this project will be documented in this file.

This project follows the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format and uses semantic versioning when versioned releases are published.

## [Unreleased]

### Added

- `prpack generate` CLI for deterministic PR handoff generation.
- Artifact discovery for branchbrief and qualitygate JSON files.
- Git metadata fallback for repositories without artifacts.
- Markdown `PR_PACK.md` output and optional paste-ready PR body output.
- JSON output for agents and automation.
- Fixture-backed tests, smoke script, and validation script coverage.

### Security

- V1 is local-first: no telemetry, no hidden network calls, no PR creation.

## Release Links

- Unreleased: `https://github.com/rogerchappel/prpack/compare/v0.1.0...HEAD`
- Latest release: `https://github.com/rogerchappel/prpack/releases/latest`
