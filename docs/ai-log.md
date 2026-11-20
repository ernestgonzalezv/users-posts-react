# AI usage log

Append-only. What was asked of the assistant, what was accepted as is, what was corrected or rejected.
The README summarises this file.

## PR 0 — scaffold and harness

- **Asked:** inspect the author's existing repositories (an iOS app, an Android app, a Django backend and a
  Next.js portal) and port their working harness (ADRs, verify gate, ratchets, PR gates, hooks) to a React
  + TypeScript project; propose a PR cut before any code.
- **Accepted:** the layer map, the `Result<T>` rule, the five UI states, the ratchet mechanism, the PR
  gate script, the plan's PR table.
- **Corrected:** the first proposal was a lighter layout and a pragmatic scope; the author chose the full
  Clean Architecture map, a language switch, gitflow with real PRs, and no comments in source. The first
  proposal also suggested commits straight to `main`; rejected in favour of one branch and one PR per
  behaviour.
- **Caught by the harness:** the placeholder `App` rendered a literal `<h1>` and the
  `no-literal-ui-text` ratchet failed on it; the placeholder became an empty `<main>` until i18n exists.

## PR 1 — result type, app error and http client

- **Asked:** a `Result<T>` with a `Failure` independent of `T`, an `AppError` union by `kind`, and an
  `HttpClient` that never throws, with a timeout and caller-side abort, validated by type guards.
- **Accepted:** the discriminated unions, the guard-based decoding, the test list.
- **Corrected:** the first version tracked the timeout with a `let` flag mutated inside the timer
  callback; `@typescript-eslint/no-unnecessary-condition` flagged the check as always false because
  TypeScript does not see closure writes. Replaced with a small holder object. The lint rule caught it
  before a test did.
