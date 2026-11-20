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
## PR 2 — language switch

- **Asked:** typed EN/ES dictionaries where a missing Spanish key fails `tsc`, typed placeholders, a
  locale provider that writes `html lang`, and a segmented control for the switch.
- **Accepted:** the template-literal placeholder typing, the storage helper with try/catch, the
  radio-group semantics with a roving tabindex.
- **Corrected:** the first draft exported hooks and providers from the same file and
  `react-refresh/only-export-components` rejected it; hooks moved to `locale-context.ts`. The first
  draft imported `en` as a value only to use `typeof en`; lint asked for `import type`. The first PR
  bundled the theme switch too and the gate rejected it at 562 production lines; it was closed and
  split, the theme switch becomes its own PR.
- **Caught by review:** Ernesto spotted two conflicts on the PR. The branch had been cut from a local
  `develop` that was behind `origin/develop` by one merge, so both append-only ledgers conflicted and
  GitHub could not build the merge ref, which is why no check ran. Fixed by merging `develop` forward
  and keeping both sections; the branching rule now says `origin/develop` after a `git fetch`.

## PR 3a — users data slice and the resource hook

- **Asked:** the data half of the first vertical slice, with no UI: DTO guard, mapper, repository,
  use case, container, and a `useResource` hook with the five states.
- **Accepted:** the slice, the hook, the test list.
- **Corrected:** the first `useResource` set state synchronously inside the effect and the React hooks
  lint rejected it; it now derives `loading` from the last settled request. An inline emptiness
  callback restarted the request on every render and a test timed out; the callback is read through
  `useEffectEvent`. Constructor parameter properties are not erasable syntax; replaced with explicit
  fields. The gate closed the first cut of this work at 894 production lines; this is the first of three.
- **Caught by the ratchet:** the API base URL in `di/` tripped `no-fetch-outside-core`; it moved to
  `core/config.ts`.
## PR 3b — Ledger design system

- **Asked:** the chosen design as tokens and four shared components, with the spinner replacing the
  skeleton in ADR 0003, and nothing feature-specific.
- **Accepted:** the palette and fonts from the design option, the components, the role mapping
  (status, alert, heading).
- **Corrected:** the first cut shipped these inside the users list PR, which the gate closed at 894
  lines; the components came out alone, and their tests, which were only exercised through the list,
  became their own files.

## PR 3c — users list screen

- **Asked:** the screen half of the first vertical slice on top of the data slice and the design
  system: the list with every state, selection, the chosen user header, every state seen in the browser.
- **Accepted:** the screen, the container provider, the fake-fetch test helper, the screenshot run
  with fetch overrides injected before load.
- **Corrected:** in the browser the chosen row's chevron was pushed out because the text column had
  no `min-width: 0`; choosing a user left the main area blank, so the user header fills it until the
  posts land. The screenshot script split CSS selectors on `:`; it now uses `;` between fields.
