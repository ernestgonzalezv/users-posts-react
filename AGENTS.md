# Users & Posts — agent entry point

Read `CLAUDE.md` first, then the rules under `.claude/rules/` that match the files you will touch.

The loop is: **gather context -> make the smallest correct change -> verify -> repeat.**

## Non-negotiables

- Preserve local changes that are not yours; never reset, checkout or rewrite the user's work.
- Respect the layers (ADR 0001): components never `fetch`, never know an API route; `domain/` and `data/`
  never import React.
- The data layer returns `Result<T>`; it does not throw to control flow (ADR 0002).
- Every screen handles idle, loading, success, empty and error (ADR 0003).
- No literal UI text in a component; every string goes through `useT()` and both dictionaries (ADR 0005).
- No comments, no `any`, no `console`, no enums (ADR 0007).
- Never read, log or commit secrets.
- Before declaring anything done: `scripts/verify.sh` green. A skipped step is reported as SKIPPED with
  its reason, never rounded up to PASS.

## Git

- Branch from `origin/develop` after a `git fetch`, with `--no-track`; one branch per PR, named `type/slug`.
- Conventional commits in English, lowercase, imperative, one behaviour each. Single author, no trailers,
  no tool names in messages.
- Commit and push only after Ernesto says yes. Never force-push. Never merge: a human merges.

## Roles

One agent at a time in this repo. The harness is `docs/harness/README.md`.
