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

## Theme switch and the language switch (2026-11-20, PR 2)

Decided by Ernesto on 2026-11-20, reviewing the design options.

- **A theme switch in the app bar**, next to the language switch. Light and dark are both designed
  (ADR 0005 covers language; the theme follows the same shape: stored choice, then the system
  preference). An inline script in `index.html` applies the stored theme before the first paint so
  there is no flash.
- **Both switches share one segmented control** with radio semantics and arrow-key navigation, so a
  third switch costs one options array.
- **Spinners for loading, not skeletons.** Supersedes the skeleton wording of ADR 0003; the ADR is
  amended in the PR that builds the first list.
