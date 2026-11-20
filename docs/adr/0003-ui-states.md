# 0003 — UI states

- **Status:** accepted
- **Date:** 2026-11-20

## Decision

Every screen that loads data resolves five states, explicitly, from one `useResource` hook:

| State | What the user sees |
|---|---|
| `idle` | nothing requested yet (a user not chosen) — a hint, not a blank |
| `loading` | a spinner with a visible sentence ("Loading users…"), announced to screen readers; never a bare blank |
| `success` | the data |
| `empty` | a sentence that says how data gets here, never a bare "no results" |
| `error` | the translated message for the error kind and a retry button, without losing the rest of the screen |

A request in flight is aborted when its inputs change or the component unmounts; a late response never
overwrites a newer one. Actions (creating a post) have their own `idle | submitting | success | error`
and never fail silently: a success shows a toast, a failure shows the error inline and keeps the draft.

## Why

The exercise asks for visible loading and error states. Making all five a type (`status`) rather than a
pair of booleans removes the impossible combinations (`isLoading && isError`) by construction.

## Rejected

- `isLoading` / `isError` booleans: four combinations, two of them nonsense.
- Skeleton rows for loading: rejected by Ernesto on 2026-11-20 while reviewing the design options; a
  spinner with a sentence is the house loading state.
- Reusing the list's state for the form: a failed post would wipe the posts already shown.

## Enforced by

`shared/presentation/use-resource.ts` tests cover every transition; review checks each screen handles all
five branches.
