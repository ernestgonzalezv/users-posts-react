# 0002 — `Result<T>` and `AppError`

- **Status:** accepted
- **Date:** 2026-11-20

## Decision

Anything that can fail below the presentation layer returns `Result<T> = Success<T> | Failure`. `Failure`
carries an `AppError` and is independent of `T`, so a failure propagates through operations of different
types without being re-wrapped. Nothing in `core/`, `data/` or `domain/` throws to control flow.

`AppError` is a discriminated union by `kind`: `network`, `timeout`, `http` (with `status`), `parse`,
`aborted`, `validation` (with field errors). The presentation layer maps a `kind` to a translated message;
it never shows a raw `Error.message`.

## Why

An exception is invisible in a signature. A `Result` makes every failure a value the compiler forces the
caller to handle, and the UI state machine (ADR 0003) becomes a plain switch over it.

## Rejected

- Throwing and catching in the hook: the happy path reads well, the error path is wherever someone
  remembered a `try`.
- A generic `Error` subclass: loses the `kind`, and the UI ends up matching on message strings.

## Enforced by

Review; `core/result.ts` is the only definition and has its own tests.
