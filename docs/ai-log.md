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

## PR 4 — debounced user search

- **Asked:** search by name with a debounce, case and accent insensitive, with a visible no-match
  state and a way out of it.
- **Accepted:** the pure `searchUsers` use case (also matches the username), the generic
  `useDebouncedValue` hook, the `SearchField` component, the `n of total` pill.
- **Corrected:** the list test that freezes time hung under Vitest fake timers with React 19 and
  jsdom; it now runs on real timers and asserts the full list right after typing and the filtered
  one after the debounce. Two early assertions used `findAllByRole`, which resolved on the stale
  list before the debounce; they wait for the count pill instead.

## PR 5 — user posts

- **Asked:** the posts of the chosen user under the header, every state, a stale answer never
  overwriting the current user, and the pending phone decision.
- **Accepted:** the posts slice mirroring the users one, the `useUserPosts` hook keyed on the user id,
  the numbered list, the posts-only fetch overrides in the screenshot run.
- **Corrected:** `window.matchMedia` does not exist in jsdom, so the setup file stubs it along with
  `scrollIntoView`. On the phone the first screenshot showed the detail halfway down: the scroll ran
  while the main area was still short (header plus spinner), so the page had no room to scroll; the
  stacked `main` now has `min-height: 100dvh`. The smooth behaviour moved from the JS call to CSS so
  `prefers-reduced-motion` turns it off.

## PR 6 — new post form

- **Asked:** a validated form, one request per submit, the created post inserted at the top with a toast,
  the draft kept when the server fails.
- **Accepted:** the `CreatePost` use case with the pure `validateDraft`, the form with fault codes
  translated in the UI, the `Toast`, the local negative ids because the API always answers `101`.
- **Corrected:** the first draft validated inside the async submit after flipping to `submitting`, so
  the faulty field was still `disabled` when it was focused and the focus test failed; validation
  now runs synchronously before the submitting state. `FormEvent` is deprecated in the React 19
  types; the handler takes the minimal `{ preventDefault }` shape instead.

## PR 7 — theme switch

- **Asked:** a light/dark switch next to the language one, the dark palette from the chosen design,
  no flash of the wrong theme on load.
- **Accepted:** the drafts from the closed `feat/language-and-theme-switch` branch (provider, context,
  switch), the dark token block, the pre-paint script in `index.html`.
- **Corrected:** the stacked-layout scroll test mocked `matchMedia` with `mockReturnValueOnce`, which
  the new provider consumed first; it now answers per query. The `AppBar` tests needed the provider.

## PR 8 — edge cases

- **Asked:** the remaining edge cases as App-level tests, so a regression in any slice shows as a
  user-visible failure.
- **Accepted:** seven integration tests over the real container with a routed fake `fetch`, the
  `timeoutMs` option on the container, the corrected proof names in `plan.md`.
- **Corrected:** the timeout test hung because the never-answering fake ignored the abort signal; it
  now rejects with an `AbortError` on abort, like a real `fetch`.

## PR 9 — readme

- **Asked:** the README the brief asks for: how to run, the decisions, the next steps, how the AI was
  used; in English, summarising this ledger.
- **Accepted:** the README, the refreshed structure block in `CLAUDE.md`.
- **Corrected:** nothing; the first draft listed the test counts from the suite as it is.
