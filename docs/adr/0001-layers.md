# 0001 — Layers

- **Status:** accepted
- **Date:** 2026-11-20

## Decision

Clean Architecture per feature. Each feature under `src/features/<feature>/` owns three folders:

```
domain/      model/        pure types and domain rules
             repository/   the interface the use cases depend on
             usecase/      one class per behaviour, with execute()
data/        dto/          the exact shape of the API response
             mapper/       DTO -> domain model
             repository/   the implementation over HttpClient
presentation/              hooks and components for this feature
```

Shared code lives in `src/core/` (`Result`, `AppError`, `HttpClient`), `src/shared/` (UI components and
presentation hooks used by more than one feature) and `src/i18n/`. `src/di/container.ts` wires
`HttpClient -> repositories -> use cases` and is the only place that knows concrete implementations.

Dependency direction, strictly inward:

| From | May import |
|---|---|
| `domain/` | `core/`, its own `domain/` |
| `data/` | `core/`, its own `domain/` |
| `presentation/` | its own `domain/` (types and use cases), `shared/`, `i18n/` |
| `di/` | everything |
| `App.tsx` | `di/`, `presentation/`, `shared/`, `i18n/` |

`domain/` and `data/` never import React. Components never call `fetch` and never know an API route.

## Why

Two screens do not need six folders to work; they need them to be read. The reviewer can open any use case
and see the whole rule without a component around it, and every rule is testable with no DOM. The same map
is used in the author's other repositories, so the cost of the structure is already paid.

## Rejected

- A flat `components/ hooks/ api/` layout: fast, but business rules end up inside components and the only
  way to test them is to render.
- A state library (Redux, Zustand) or a data library (TanStack Query): both are good; for two resources they
  hide the state handling the exercise asks to see.

## Enforced by

`scripts/ratchet/rules.d/no-fetch-outside-core.sh`, `no-domain-react.sh`; review against this table.
