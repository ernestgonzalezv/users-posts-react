# Implementation plan: users and posts

## Summary

One feature, cut into vertical PRs on top of a scaffold and a foundation with no UI. Each PR is one
behaviour, with its tests and its slice of the dictionaries. Base branch `develop`; `main` receives one
release PR at the end.

## Invariants

| # | Invariant | Owner PR | Proof |
|---|---|---|---|
| I1 | The data layer never throws; every failure is a `Failure` with an `AppError` | PR 1 | `http-client.test.ts` |
| I2 | A late response never overwrites a newer one | PR 5 | `use-resource.test.ts` "ignores a response for inputs that changed" |
| I3 | A missing Spanish key does not compile | PR 2 | `tsc` on `es.ts` |
| I4 | Search ignores case and accents | PR 4 | `search-users.test.ts` |
| I5 | A post is never sent with an empty title or body | PR 6 | `create-post.test.ts` |
| I6 | A double click on submit sends one request | PR 6 | `NewPostForm.test.tsx` |
| I7 | A failed creation keeps the draft and the list intact | PR 6 | `NewPostForm.test.tsx` |
| I8 | Switching language keeps the chosen user and the draft | PR 2, PR 6 | `App.test.tsx` |

## PRs

| PR | Branch | Behaviour | After |
|---|---|---|---|
| 0 | `chore/scaffold-and-harness` | Vite, TypeScript strict, Vitest, Testing Library, ESLint, CI, harness, ADRs, spec · no UI | — |
| 1 | `feat/core-result-and-http` | `Result<T>`, `AppError`, `HttpClient` with timeout and abort · no UI | 0 |
| 2 | `feat/i18n-switch` | typed EN/ES dictionaries, provider, language switch, persistence | 0 |
| 3 | `feat/users-list` | users load with skeleton, error with retry, empty state | 1, 2 |
| 4 | `feat/debounced-user-search` | search by name with debounce, accent-insensitive, no-match state | 3 |
| 5 | `feat/user-posts` | choosing a user shows their posts; stale responses dropped | 3 |
| 6 | `feat/new-post-form` | validated form, single submit, local insert, toast, rollback | 5 |
| 7 | `test/edge-cases` | the remaining edge cases as tests, App-level integration | 6 |
| 8 | `docs/readme` | README: run, architecture, decisions, next steps, AI usage | 7 |
| 9 | `release/1.0.0` | `develop` -> `main` | 8 |
