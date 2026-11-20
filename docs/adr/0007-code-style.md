# 0007 — Code style

- **Status:** accepted
- **Date:** 2026-11-20

## Decision

- **No comments** in source. A name or a smaller function carries the intent; a decision goes in an ADR
  or in `specs/*/open-items.md`.
- **No `any`**, no non-null assertions outside tests, no enums (string literal unions), no `console`.
- TypeScript `strict` plus `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`.
- Files are `kebab-case.ts`; components `PascalCase.tsx` exporting one named component; hooks
  `use-<name>.ts` exporting `use<Name>`; use cases `<verb>-<noun>.ts` exporting a class with `execute()`.
- Imports are type-only when they are types (`import type`).
- Styling with CSS Modules, one file next to its component; colours and spacing from `src/styles/tokens.css`,
  never a loose hex in a component.

## Why

Comments drift from the code they describe; a name cannot. Each lint rule here removes one class of bug
rather than one instance of it.

## Rejected

- JSDoc on public functions: the types already say it.
- Tailwind: good for speed, but the exercise is read more than it is run and semantic class names read
  better in a diff.

## Enforced by

ESLint (`no-console`, `no-inline-comments`, `no-explicit-any`, `consistent-type-imports`, no enums),
`scripts/ratchet/rules.d/no-comments.sh`, `no-any.sh`, `no-console.sh`.
