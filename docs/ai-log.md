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

## PR 10 — fixes from the edge-case audit

- **Asked:** an honest audit of what the delivered app did not cover, then the fixes.
- **Accepted:** three defects found by reading and one confirmed in the browser (a 300-character word
  overflowed on a phone), plus three small improvements (instant clear, scroll on a second tap,
  `matchMedia` guard).
- **Corrected:** `npx prettier` had been run without a config in the repo and rewrote fifteen files
  with double quotes and semicolons, three of them already merged; `.prettierrc` now carries the
  repo style and those files are restored. A toast test on fake timers hung again; it asserts the
  remount by node identity instead.

## PR 11 — motion

- **Asked:** animations on every state change, tasteful, with reduced motion honoured.
- **Accepted:** CSS-only motion driven by tokens, staggered entrances through a `--i` custom property,
  the fresh-post tint, the toast exit timed from its duration.
- **Corrected:** the first cut put the shared keyframes in `global.css`; CSS Modules hashes every
  `animation-name` in a module, so none of them resolved and nothing moved. Found by measuring the
  computed `animationName` in the browser, not by eye; each module now declares the keyframes it uses.

## PR 12 — coverage and codemagic

- **Asked:** coverage with a badge, and Codemagic alongside GitHub Actions.
- **Accepted:** V8 coverage with thresholds inside the done gate, a badge generated by a script and
  published to a `badges` branch by the workflow (Codemagic has no coverage badge of its own and
  external badge services need an account), `codemagic.yaml` running the same gate.
- **Corrected:** nothing; the numbers in the README come from the first run (97.7 % lines).

## PR 13 — badges branch

- **Asked:** the release after PR 12; `git fetch` stalled instead.
- **Found:** the first badge run had committed `node_modules` and the HTML report, because
  `git rm -rf .` on the orphan branch also removed `.gitignore` before `git add -A`; the branch weighed
  ten thousand objects and every fetch tried to download it. Found by tracing the fetch, not by guessing.
- **Corrected:** the job now builds the branch in an empty directory with only the badge files and
  replaces it, so the branch stays one small commit.

## PR 14 — duplicate key

- **Asked:** why choosing several users stacked their headers one under the other.
- **Found:** two siblings with the same `key`; React warned in the console on every selection and the
  suite stayed green because nothing listened to `console.error`. Reproduced in the browser by counting
  `header` elements inside `main` after three clicks.
- **Corrected:** one keyed fragment for the pair, a test that asserts a single header after a second
  choice, and the test setup now fails any test that triggers `console.error`; with that rule and
  without the fix, five existing tests go red.

## PR 15 — codecov

- **Asked:** coverage on Codecov instead of Codemagic, which Ernesto does not have.
- **Accepted:** the `codecov-action` upload inside the verify job with `use_oidc`, the lcov reporter,
  the Codecov badge in the README, `codecov.yml` aligned with the local thresholds.
- **Removed:** the badges branch job, `scripts/coverage-badge.sh`, `codemagic.yaml` and their
  README paragraphs; the generated `badges` branch is deleted after the merge.

## PR 16 — router

- **Asked:** the chosen user in the URL so a refresh keeps the selection (first of the 1.0.0 next steps).
- **Accepted:** a hand-written route hook over the History API with a parsed route union, the missing
  state for any address that names nobody, back and forward buttons honoured, tests for thirteen bad
  addresses.
- **Corrected:** nothing on the first run; the URL is reset between tests in the setup so one test
  cannot leak its address into the next.

## PR 17 — written posts kept

- **Asked:** keep written posts per user so switching users or reloading does not drop them (the API
  never persists writes).
- **Accepted:** a local store behind a domain port, ids assigned below zero so they never collide with
  the server's, the resource hook mutating in place, the post `source` union replacing the negative-id
  check.
- **Corrected:** two tests assumed the created post was the server's answer (always id 101, title
  "Fresh"); the list now shows what the person typed, which is what they expect to see.

## PR 18 — optimistic insert

- **Asked:** show the post immediately and roll it back if the server refuses it.
- **Accepted:** a third post source, `pending`, with a dimmed row and a "Sending…" badge; the draft
  restored into the fields on failure; the retry resends the failed draft.
- **Corrected:** the literal-text ratchet matched the `=> Promise<Result<Post>>` type in the form's
  props as if it were markup; the `Publish` function type now lives in the use case file, where the
  rule does not look.

## PR 19 — system theme

- **Asked:** a "system" option and the OS preference followed live.
- **Accepted:** choice and theme split in the context, the media query as an external store, a third
  segment with a monitor icon.
- **Corrected:** the first subscription assumed every `MediaQueryList` has `addEventListener`; three
  App tests stub `matchMedia` with a bare `{ matches }` and broke, so the subscription checks for the
  method and the provider has a test for that shape.

## PR 20 — any input

- **Asked:** make the app hold up under any input, from the keyboard or from the API.
- **Accepted:** grapheme-aware lengths, control-character stripping, safe-integer ids, duplicate ids
  dropped, blank names named, plural forms, a hard cap on the inputs, the chip width, the debounce
  hook's missing dependency through `useEffectEvent`.
- **Corrected:** the first title normaliser deleted tabs before collapsing whitespace, gluing words
  together ("ABcD"); it now keeps them as whitespace. A shell heredoc turned `\u200B` into the real
  zero-width character inside the regex, caught by `no-irregular-whitespace`.

## PR 21 — paged lists

- **Asked:** pagination or virtualisation for large lists (the last of the 1.0.0 next steps).
- **Accepted:** a small paging hook and a button at the foot of each list; page sizes as constants in
  the components.
- **Corrected:** the first version reset to the first page on every click, because the filtered users
  array was rebuilt on each render; memoising the matches fixed it and the hook test was tightened to
  use one stable array.

## PR 22 — end to end

- **Asked:** Playwright tests in a real browser on top of the screenshot run.
- **Accepted:** ten journeys over the production build with the API mocked at the network layer, a
  mobile project, traces on failure, the report uploaded by CI when something fails.
- **Corrected:** the first run found a real defect from PR 20: the `maxLength` cap at four times the
  limit truncated a hundred family emoji (eleven code units each); the cap is twenty times now. Two
  selectors picked the users list instead of the posts list and were scoped to the posts region.

## PR 23 — e2e runner

- **Found:** the end-to-end job went red on its first run: `ubuntu-latest` resolves to Ubuntu 26.04
  and Playwright 1.58 refuses to install Chromium there. The merge gate on my side also let that
  red job through, because its check relied on a `\b` word boundary that BSD grep does not know;
  the gate now reads the status column.
- **Corrected:** the job is pinned to `ubuntu-24.04`, which Playwright supports.
