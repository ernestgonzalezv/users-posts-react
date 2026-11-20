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
