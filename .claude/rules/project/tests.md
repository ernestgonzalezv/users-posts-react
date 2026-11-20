---
paths:
  - "src/**/*.test.ts"
  - "src/**/*.test.tsx"
  - "src/test/**"
---

# Tests (ADR 0004)

- Query by role and accessible name. No test ids, no class selectors.
- `userEvent` over `fireEvent`. Fake timers for debounce; `vi.fn` for `fetch`; an in-memory repository
  for use cases and hooks. Never the network.
- Name the behaviour: `it('keeps the draft when the request fails')`.
- When you add a test for a rule, break the rule on purpose once and watch it go red.
