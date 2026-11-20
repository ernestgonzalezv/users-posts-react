---
alwaysApply: true
---

# Edit safety

- Re-read a file before editing it after a long conversation; `Edit` fails on stale context.
- Preserve the user's local changes. No reset, checkout, rewrite or staging of work that is not yours.
- Minimal, reviewable diffs. Do not mix a refactor with a fix unless the fix needs it.
- When renaming, find every reference: imports, type-only imports, dictionary keys, `di/container.ts`,
  test doubles.
- Never fix a screen problem by duplicating state. One source of truth per concern.
- Never delete a file without checking nothing references it.
- Never read or commit secrets.
- Branches: `git fetch origin && git checkout -b <branch> --no-track origin/develop`, never from a local
  `develop` that may be behind; publish with `git push -u origin <branch>`.
  Never force-push a shared branch.
