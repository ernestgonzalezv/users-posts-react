# Users and posts

- **Status:** agreed
- **Input:** the technical test brief: a small React + TypeScript app over `https://jsonplaceholder.typicode.com`

## Context

A single page. The left side lists users and lets the visitor search them by name. Choosing a user shows
that user's posts on the right and a form to write a new one. The API does not persist writes, so a
created post only needs to appear in the list.

## Requirements

- FR-001: The app MUST list the users returned by `GET /users`, showing at least name, username and email.
- FR-002: The visitor MUST be able to filter the list by name as they type; matching MUST ignore case and
  accents and MUST wait for a short pause in typing before filtering.
- FR-003: When the filter matches nobody the app MUST say so, naming the query, and MUST offer to clear it.
- FR-004: Choosing a user MUST show that user's posts from `GET /posts?userId=<id>`.
- FR-005: Changing the chosen user quickly MUST never show posts of a previously chosen user.
- FR-006: The visitor MUST be able to create a post for the chosen user with a title and a body; both are
  required after trimming, the title MUST be at most 100 characters and the body at most 1000.
- FR-007: Validation errors MUST appear next to the field, in the active language, and focus MUST move to
  the first invalid field on submit.
- FR-008: A valid submission MUST call `POST /posts`; on success the new post MUST appear at the top of the
  list, the form MUST clear and a confirmation MUST be shown; on failure the draft MUST be kept and the
  error shown.
- FR-009: While a submission is in flight the submit button MUST be disabled so a double click sends once.
- FR-010: Every request MUST show a visible loading state and, on failure, a visible error with a retry.
- FR-011: A user with no posts MUST see an empty state that explains how posts get there.
- FR-012: The whole interface MUST be available in English and Spanish, switchable without reloading and
  without losing the chosen user or the draft.
- FR-013: The page MUST be usable with the keyboard only and expose roles and labels to a screen reader.
- FR-014: The layout MUST work on a 375 px wide screen.

## Success criteria

- SC-001: Every requirement above has at least one automated test that fails when it breaks.
- SC-002: `scripts/verify.sh` passes on `develop` and on every PR.
- SC-003: Each state in ADR 0003 has been seen in the browser, for each screen, including forced error,
  offline and slow-network cases.

## Out of scope

Pagination, caching between sessions, editing or deleting posts, comments, authentication, a backend mock
server, end-to-end tests with a real browser driver.
