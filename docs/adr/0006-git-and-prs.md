# 0006 — Git and PRs

- **Status:** accepted
- **Date:** 2026-11-20

## Decision

Gitflow. `main` is the release branch, `develop` the integration branch. Every change is a branch cut
from `develop` with `--no-track`, named `type/slug` (`feat/debounced-user-search`), merged into `develop`
by a PR with a merge commit (no squash: the commits are the record of how the work went). A `release:`
PR merges `develop` into `main`.

Commits are conventional, English, lowercase subject, imperative, one behaviour each. Ernesto is the sole
author, with his GitHub noreply address; no trailers and no tool names in messages.

A PR has a **semantic title**, an **empty body**, and one comment carrying the documentation:
`## Manual tests` with numbered steps and an `Expected:` line each, `## Screenshots` when UI changed,
`## Accessibility` when UI changed, `## API contract` when `core/` or `data/` changed. The ceiling is 500
production lines in `src/` (tests do not count). `scripts/pr-gates.sh <n>` checks all of it with no model
involved, and CI runs `verify` on every PR.

## Why

The commits are part of what is being evaluated. Small vertical PRs, each one behaviour end to end, read
as a story; one commit with everything reads as nothing.

## Rejected

- Squash merges: they erase the story.
- A prose PR body: the diff already says what changed; the test script says how to check it.

## Enforced by

`scripts/pr-gates.sh`, `.github/workflows/ci.yml` (semantic title), `.claude/hooks/guard-bash.sh`
(no force-push, no hard reset).
