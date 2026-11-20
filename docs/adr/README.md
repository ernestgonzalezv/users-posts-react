# Architecture decision records

One decision per file, numbered, citable as `ADR 000N`. Each one says what was decided, why, what was
rejected and what enforces it. Where a rule in `.claude/rules/` and an ADR disagree, the ADR wins. Where a
ratchet and an ADR disagree, the code is fixed, never the ratchet.

| ADR | Topic |
|---|---|
| [0001](0001-layers.md) | Layers: Clean Architecture per feature, who may import whom |
| [0002](0002-result-and-errors.md) | `Result<T>` and `AppError`: the data layer never throws |
| [0003](0003-ui-states.md) | UI states: every screen resolves idle, loading, success, empty and error |
| [0004](0004-testing.md) | Testing: what each layer tests, doubles, naming |
| [0005](0005-i18n.md) | Text and languages: typed dictionaries, no hand-written UI strings |
| [0006](0006-git-and-prs.md) | Git: gitflow, conventional commits, PR shape and gates |
| [0007](0007-code-style.md) | Code style: no comments, no `any`, no `console`, naming |

## Template

```markdown
# 000N — <Title>

- **Status:** accepted
- **Date:** YYYY-MM-DD

## Decision
## Why
## Rejected
## Enforced by
```
