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
