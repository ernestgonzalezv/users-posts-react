# Users and posts: open items

Companion to `plan.md`: what is not the plan's to decide. Append-only, by date and PR. Cite `file:line`
where a source exists; write **inferred** where none does.

## Scope and stack (2026-11-20, PR 0)

Decided by Ernesto on 2026-11-20, while planning the test.

- **Stack.** React 19 + TypeScript strict + Vite, Vitest + Testing Library. No state or data library:
  the state handling is part of what the exercise evaluates (ADR 0001).
- **Language.** Code, commits, docs and README in English. The interface in English and Spanish with a
  switch (ADR 0005).
- **Architecture.** Clean Architecture per feature, the same map as the author's other repositories.
- **Git.** Gitflow with `develop` and `main`, one branch per PR, merge commits, PR gates (ADR 0006).
- **Authorship.** Single author, no trailers. AI usage is documented in `docs/ai-log.md` and the README.
- **Repository visibility.** Private while the work is in progress, public at delivery.

## Decoding without a schema library (2026-11-20, PR 1)

Decided by Ernesto on 2026-11-20, reviewing PR 1.

- **Type guards instead of zod.** Each DTO ships a guard `(value: unknown) => value is Dto`; the client
  returns `parse` when it fails. One dependency fewer, and the guard is the DTO's own test of the
  contract. **Pending** nothing; revisit if a third resource appears.
- **Timeout 10 s.** JSONPlaceholder answers in under a second; 10 s is long enough for a slow mobile
  link and short enough that a hung request surfaces as an error the user can retry.
## Language switch (2026-11-20, PR 2)

Decided by Ernesto on 2026-11-20, reviewing the design options.

- **One segmented control for every switch** in the app bar, with radio semantics and arrow keys, so
  the theme switch that follows costs one options array.
- **The stored keys `locale` and `theme` are a contract**: a rename would reset every visitor's choice.
- **Spinners for loading, not skeletons.** Supersedes the skeleton wording of ADR 0003; the ADR is
  amended in the PR that builds the first list.
- **The 500-line ceiling held.** The first cut carried language and theme together at 562 production
  lines; the gate closed it and the theme switch moved to the next PR.

## The users slice without its screen (2026-11-20, PR 3a)

Decided by Ernesto's gate on 2026-11-20: the first cut of the users list weighed 894 production lines.

- **Three PRs instead of one:** the data slice and the hook (this one), the design system, and the
  screen. The first two are the horizontal exceptions the cutting rule allows; the screen is vertical.
- **The API base URL lives in `core/config.ts`**, the one place the ratchet allows it outside the
  client.
- **`useResource` derives `loading`** from whether the last settled result belongs to the current
  loader and attempt, instead of writing state inside the effect.
## Design system (2026-11-20, PR 3b)

Decided by Ernesto on 2026-11-20, choosing among three design options.

- **Ledger.** Warm paper, serif names and titles (Fraunces), Instrument Sans body, oxblood accent, four
  avatar hues. Edges come from spacing and tint, not boxes. The dark palette lands with the theme
  switch PR.
- **Spinner, not skeleton**, with a visible sentence (ADR 0003 amended).
- **Shared components:** `Spinner` (status region), `ErrorBox` (alert + retry, one message per
  `AppError` kind), `EmptyState` (heading + hint), `Avatar` (initials, hue by id).

## The users screen (2026-11-20, PR 3c)

Decided by Ernesto on 2026-11-20.

- **Choosing a user shows the user header at once** (name, email, website, company) so the main area is
  never blank; the posts PR adds the list and the form under it. **Pending**: on a phone the header
  renders below the list; the posts PR decides whether to scroll to it or collapse the list.
- **A row is a button with `aria-pressed`** and the accessible name "Show posts by <name>"; the name
  tells a screen reader what the press does, which the visible text alone does not.

## Search (2026-11-20, PR 4)

Decided by Ernesto on 2026-11-20.

- **The search is local** over the ten loaded users; the API has no name filter and the list is tiny,
  so a request per keystroke would only add latency and failure states.
- **The debounce is 300 ms** between the last keystroke and the filter; the box itself updates at once.
- **Name and username both match**, case and accent insensitive on both sides (`Érvin` finds `Ervin`).
- **Zero matches is its own state** with the query echoed and a "Clear search" action; the pill reads
  `0 of 10` so the total is never lost.

## Posts (2026-11-20, PR 5)

Decided on 2026-11-20 while building PR 5; Ernesto can reverse any of these in a later PR.

- **On a phone the list stays and the page scrolls to the detail** when a user is chosen, instead of
  collapsing the list; the `main` is at least one screen tall so the scroll always lands.
- **A stale answer is dropped by aborting**, not by comparing ids: the loader changes with the user id,
  `useResource` cancels the previous request, and the screen shows the spinner until the current one lands.
- **Title and body are trimmed in the mapper**; the first letter is capitalised with CSS only, the data
  stays as the API sent it.

## New post (2026-11-20, PR 6)

Decided on 2026-11-20 while building PR 6; Ernesto can reverse any of these in a later PR.

- **Validation lives in the domain** (`validateDraft`): title and body required after trimming, 100 and
  1000 characters at most. The form shows fault codes translated per locale and never blocks typing with
  `maxLength`; the counter turns red past the limit and the submit reports the fault.
- **Written posts get local negative ids** (`-1`, `-2`, …) because JSONPlaceholder answers `id: 101` to
  every POST; they carry a "New" badge and sit at the top until the user changes.
- **A failed creation keeps the draft** and shows the error inline with a Retry that resubmits the same
  draft; the list is untouched.
- **One request per submit**: the button and the fields are disabled while submitting and the handler
  returns early if a submission is in flight.

## Theme (2026-11-20, PR 7)

Decided by Ernesto on 2026-11-20 ("añádeles el dark/light theme a todos").

- **Two explicit themes, no "system" option in the switch**: with nothing stored the app follows
  `prefers-color-scheme`; once the visitor picks one it sticks in `localStorage` under `theme`.
- **The attribute is set before paint** by a tiny inline script in `index.html`, the only script outside
  `src/`; the provider then owns it.
- **Dark palette** is the Ledger dark set from the chosen design artifact; every colour lives in
  `tokens.css`, components never branch on the theme.

## Edge cases (2026-11-20, PR 8)

- **Written posts are lost when the user changes** because JSONPlaceholder does not persist them and
  the list is keyed by user; keeping them in memory per user is listed as a next step in the README.
- **The container accepts `timeoutMs`** only so tests can shorten the watchdog; the app keeps 10 s.

## Audit fixes (2026-11-20, PR 10)

- **Counters measure what will be sent**: the title with inner spaces collapsed and ends trimmed, the
  body trimmed, so a red counter always means the submit will be refused.
- **Each publish is a new toast** (`key` on a counter), so the four seconds restart.
- **Any unbroken string wraps** (`overflow-wrap: anywhere`) in titles, bodies and names.
- **Clearing the search is immediate**; typing still waits 300 ms.

## Motion (2026-11-20, PR 11)

- **CSS only, no animation library**: durations and easings are tokens; `prefers-reduced-motion`
  collapses every animation and transition through one global rule.
- **Keyframes are declared in the module that uses them** because CSS Modules localises animation
  names; a global `@keyframes` is unreachable from a module.
- **Entrances are staggered with `--i`** set inline per row (28 ms for users, 35 ms for posts).

## Coverage (2026-11-20, PR 12)

- **Thresholds** 95 % lines, statements and functions, 90 % branches, enforced by `verify` and CI;
  `main.tsx`, the test helpers and the tests themselves are excluded.
- **The badge is self-hosted**: `scripts/coverage-badge.sh` writes the SVG, the workflow commits it to
  the `badges` branch per source branch; the README reads `coverage-main.svg`.
- **Codemagic runs the same `verify.sh`**; its build badge appears once the repository is connected there.

## Badges branch (2026-11-20, PR 13)

- **`badges` is a generated, single-commit branch**: each push run rebuilds it in an empty directory
  from the badge files already there plus the new pair, and replaces it. It is never checked out and
  never merged; replacing it is the one force-push the repository allows, because nothing is based on it.

## Duplicate key (2026-11-21, PR 14)

- **The header and the post list share one keyed fragment**: the motion PR had given both siblings
  `key={selected.id}`, so React kept the old header on every change of user. One `Fragment` carries
  the key now.
- **A `console.error` during a test fails the test** (`src/test/setup.ts`), so a React warning can no
  longer pass unnoticed through a green suite.

## Codecov (2026-11-21, PR 15)

- **Codecov replaces the self-hosted badge and Codemagic**: Ernesto has the Codecov GitHub App, so
  every CI run uploads `lcov.info` through OIDC with no token in the repository; the `badges` branch,
  the badge script and `codemagic.yaml` are gone.
- **`codecov.yml`**: project status at 95 % with 1 % tolerance, patch status informational at 90 %, a
  condensed comment only when coverage changes.

## Router (2026-11-21, PR 16)

- **The chosen user lives in the URL** (`/users/:id`) through the History API and `useSyncExternalStore`;
  no routing library, since there is one route and the app must stay small.
- **The address is parsed into a union** (`home`, `user`, `unknown`): a missing, non-numeric, zero or
  oversized id and any other path land on a "not here" state with a way back that replaces the entry.
- **The users resource moved up to the App**, which resolves the id against the directory; the list is
  presentational now.

## Written posts kept (2026-11-21, PR 17)

- **A post gets a `source`** (`remote` or `written`) instead of a negative-id convention; the badge and
  the tint read the source.
- **Written posts live in local storage per user** behind a domain port (`WrittenPostStore`); the
  repository lists them before the remote ones and stores a post only after the server accepted it.
  Corrupt storage reads as empty; a failed write keeps the session's posts in memory.
- **`useResource` gained `mutate`** so the list updates in place after a publish instead of refetching;
  a mutation while loading or after a failure is ignored, the next load merges from the store anyway.

## Optimistic insert (2026-11-21, PR 18)

- **The list owns the publish**: the form hands a draft to `PostList`, which inserts a `pending` post
  at once, calls the use case, then swaps it for the stored post or removes it on failure. The form
  stays presentational and gets a `Result` back.
- **The fields clear on submit and come back on failure**, unless something new was typed meanwhile;
  the publish button alone is disabled while a post is in flight, so a second post can be drafted.
- **Pending ids start at `Number.MIN_SAFE_INTEGER`** so they can never meet a written (small negative)
  or a remote (positive) id.

## System theme (2026-11-21, PR 19)

- **The stored value is a choice** (`light`, `dark`, `system`), the applied theme is derived from the
  choice and `prefers-color-scheme`, read through `useSyncExternalStore` so an OS change re-renders.
- **Anything unknown in storage reads as `system`**; a media query list without `addEventListener`
  (old engines, test doubles) is honoured once and simply not followed live.
- **The paint-before-React script in `index.html` already did the right thing**: any value other than
  light or dark falls back to the media query.

## Any input (2026-11-21, PR 20)

- **Lengths are graphemes** (`Intl.Segmenter`, with a code-point fallback): a flag or a family emoji
  counts once in the counters and in the validation. The inputs carry `maxLength` at twenty times the
  limit as a hard cap against pathological pastes (a family emoji is eleven code units); the red counter still does the explaining.
- **Control and zero-width characters are stripped** from drafts and from server text; the body keeps
  `\n` and `\t`, normalises CRLF and collapses runs of blank lines to one.
- **Ids must be safe integers** at the DTO guard; repositories drop a repeated id (React keys stay
  unique); the route accepts any safe integer, so a server id of 0 or below is still reachable.
- **Blank names fall back** to the username, then to `#id`; initials fall back to the first grapheme.
- **Counts pluralise** (`1 post`, `1 user`) through `counted(t, key, n)` with a `.one` key per language.
- **Chips cap at the header width**, so a 300-character email cannot widen the page.

## Paged lists (2026-11-21, PR 21)

- **Client-side paging, not virtualisation**: fifty users and twenty posts at a time with a "Show N
  more" button; the ten-and-ten of JSONPlaceholder never show it, a thousand-item answer stays usable.
- **`usePaged` resets to the first page when the items change** (a new search, a new user); the search
  matches are memoised so a re-render alone does not reset it.

## End to end (2026-11-21, PR 22)

- **Playwright over the production build** (`vite preview`), Chromium only, a desktop project and a
  Pixel 7 project for the tests tagged `@mobile`.
- **The API is mocked at the network layer** (`page.route`) from fixtures in `e2e/api.ts`, so the run
  is deterministic and needs no internet; failure, delay and volume are options of the mock.
- **Ten journeys**: pick, address, reload, back; search and clear; missing address; directory failure
  and retry; language and theme with the OS switch; stacked layout; optimistic publish kept per user
  and across a reload; rollback and retry; validation; posts failure, retry and paging.
- **Not part of `verify.sh`**: the e2e run needs a browser download, so it is its own CI job and
  `npm run test:e2e` locally.

## Full coverage (2026-11-21, PR 24)

- **Thresholds at 100 %** for lines, statements, functions and branches: every remaining gap was either a
  defensive branch worth a test (storage that throws, no `Intl.Segmenter`, hooks outside their provider,
  the server snapshots, the busy guard of the form, every arrow of the segmented control) or dead code.
- **Dead code removed instead of covered**: the `?? hue` fallback of the avatar (an index modulo the
  length is always inside the array) and the `undefined` check after the segmented-control arithmetic.
- **The user route accepts up to seventeen digits**, so a number past `Number.MAX_SAFE_INTEGER`
  reaches the safe-integer check instead of being rejected by the regex alone.
- **`PostList` takes an optional `toastMs`** so a test can watch the toast leave without waiting the
  real four seconds; the app never passes it.
- **The phone journey asks Playwright for reduced motion**, since smooth scrolling was still running
  between two measurements in CI.

## Slow API in development (2026-11-21, PR 26)

- **`npm run dev:slow`** sets `VITE_API_DELAY_MS=2000`; `main.tsx` wraps the global fetch in
  `delayedFetch` only in development, so every loading state and spinner can be watched by a human.
- **The delay honours the abort signal**: a user switched during the wait never fetches at all, which is
  also what keeps StrictMode's first, cancelled effect from reaching the network.
- **Production never reads the variable** (`import.meta.env.DEV` guard), so the build has no delay path.
