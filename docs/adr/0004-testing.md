# 0004 — Testing

- **Status:** accepted
- **Date:** 2026-11-20

## Decision

Vitest + Testing Library. One test file next to the unit it tests, named `<unit>.test.ts(x)`. Test names
describe behaviour in plain English: `it('ignores accents and case when matching names')`.

| Layer | What is tested | With |
|---|---|---|
| `core/` | `Result` helpers, `HttpClient` against a fake `fetch`: 2xx, 4xx/5xx, timeout, invalid JSON, abort | `vi.fn` fetch |
| `domain/usecase` | every rule, as pure functions; validation errors per field | in-memory repository |
| `data/mapper` | DTO -> model, including missing optional fields | fixtures |
| `presentation/` hooks | every state transition, abort on input change | fake repository, fake timers |
| components | what the user sees and does: roles, labels, keyboard | `userEvent`, queries by role |

Tests query by role and accessible name, never by class or test id, so a test failing means a user would
notice. Timers (debounce) use `vi.useFakeTimers`. No network in tests, ever.

## Why

Testing Library's queries double as an accessibility check. Pure use cases make the rules testable in
milliseconds without a DOM, which is where most of the suite lives.

## Rejected

- Snapshot tests: they pass when the output changes in ways nobody wanted and fail when it changes in ways
  everybody wanted.
- MSW for the API: would be the right tool at a larger size; a fake repository keeps each test readable.

## Enforced by

`npm run test:coverage` in `scripts/verify.sh` and CI: the suite plus V8 coverage with every threshold at
100 % (lines, statements, functions and branches). A line or a branch nobody exercises fails the gate, so a
new branch ships with its test or with a reason to remove it.
