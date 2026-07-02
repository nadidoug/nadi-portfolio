# Release Policy

## Versioning
Semantic Versioning 2.0.0: `MAJOR.MINOR.PATCH`. Pre-1.0 projects may break minor-to-minor.

## Branching
- `main` — always deployable; protected (PR + passing CI required)
- `feat/*`, `fix/*` — short-lived branches, squash-merged
- Releases tagged `vX.Y.Z` with GitHub Releases generated from CHANGELOG

## Release Checklist
1. CI green (lint, tests, build)
2. CHANGELOG updated under a new version heading
3. Dependency audit clean (`npm audit` / Dependabot alerts resolved or documented)
4. Version bumped in manifest
5. Tag pushed → release workflow publishes

## Hotfixes
Branch from the tag, patch, bump PATCH, cherry-pick to `main`.

## Deprecation
Deprecated features are announced in CHANGELOG one MINOR version before removal.
