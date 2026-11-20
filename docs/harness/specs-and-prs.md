# Specs and PRs

A feature is cut **before** code is written. One folder per feature under `specs/<feature>/`:

| File | What |
|---|---|
| `spec.md` | What and why. Numbered requirements (`FR-001`), success criteria, out of scope. No class names. |
| `plan.md` | The PR table with branch, behaviour, size and ordering; the invariants with their owner PR and proof. |
| `open-items.md` | The decisions ledger, append-only by date and PR. What the plan does not decide. |

## How it is cut: vertical slices, not layers

**A PR is one behaviour, end to end, thin through every layer it needs.** Never "the data layer", never
"all the hooks". One vertical slice here touches, in this order:

`dto` -> `mapper` -> `model` -> `repository` (interface) -> `repository-impl` -> `usecase` ->
`di/container.ts` -> hook -> component -> `i18n/en.ts` + `es.ts` -> `open-items.md`

Only the first PRs are horizontal, and only because they carry no behaviour: the scaffold, then the
foundation with no UI (`core/`, i18n). From then on every PR is named after what the user can now do.

## One branch per PR

Cut from `origin/develop` with `git fetch origin && git checkout -b <branch> --no-track origin/develop`, never
from the previous PR and never from a local `develop` that may be behind. The
`After` column of `plan.md` is the only ordering mechanism.

## The PR

Semantic title, empty body, one comment with `## Manual tests` (numbered steps, one `Expected:` line
each), `## Screenshots` and `## Accessibility` when UI changed, `## API contract` when `core/` or `data/`
changed. Ceiling: 500 production lines in `src/`; tests do not count. Gate: `scripts/pr-gates.sh <n>`.
