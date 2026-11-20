---
paths:
  - "src/features/**"
  - "src/core/**"
  - "src/di/**"
---

# Layers (ADR 0001, 0002)

- `domain/` and `data/` never import React. `presentation/` never imports `data/`.
- `fetch` lives only in `src/core/http-client.ts`; API routes only in `data/repository/`.
- Everything below presentation returns `Result<T>`. Map a DTO to a model in `data/mapper/`; never pass
  a DTO to a component.
- A use case is a class with `execute()` and one behaviour; it gets its repository through the constructor.
- New wiring goes in `src/di/container.ts`.
