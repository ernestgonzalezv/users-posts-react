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
