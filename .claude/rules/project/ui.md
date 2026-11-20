---
paths:
  - "src/**/*.tsx"
  - "src/**/*.css"
  - "src/i18n/**"
---

# UI (ADR 0003, 0005, 0007)

- Every data screen renders all five states: idle, loading (skeleton), success, empty (a sentence that
  explains how data gets here), error (translated message + retry).
- No literal UI text: `const t = useT()` and a key in both `en.ts` and `es.ts`.
- Colours, spacing and radii from `src/styles/tokens.css`; CSS Modules next to the component.
- Roles and accessible names on everything interactive; `aria-live` on toasts and error messages;
  `aria-busy` while loading; `aria-invalid` + `aria-describedby` on invalid fields.
- Respect `prefers-reduced-motion`.
