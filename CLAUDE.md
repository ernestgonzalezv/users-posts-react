# Users & Posts — Claude Code

@AGENTS.md

`AGENTS.md` says what an agent may do; the code rules live in `docs/adr/`. This file holds the project
description, where each rule lives and the commands.

## Project

A React 19 + TypeScript app over `https://jsonplaceholder.typicode.com`: a searchable list of users, the
posts of the chosen user, and a validated form to create one. Built with Vite, tested with Vitest and
Testing Library, in English and Spanish.

- **Base branch:** `develop` · **Release branch:** `main`
- **Spec and plan:** `specs/users-posts/`

## Structure

```
src/
  core/              Result<T>, AppError, HttpClient, storage, config
  i18n/              typed dictionaries (en.ts is the source of truth), LocaleProvider, useT()
  theme/             ThemeProvider, theme-context, theme (stored choice, then prefers-color-scheme)
  shared/ui/         AppBar, SegmentedControl, LanguageSwitch, ThemeSwitch, SearchField, Spinner, ErrorBox, EmptyState, Toast, Avatar, icons
  shared/presentation/  useResource, useDebouncedValue, errorMessage
  features/<f>/      domain/{model,repository,usecase}  data/{dto,mapper,repository}  presentation/
  di/container.ts    wires HttpClient -> repositories -> use cases
  styles/tokens.css  the only place a colour or a spacing value is written (light block + dark block)
```

## Where the rules live

| ADR | Topic |
|---|---|
| [0001](docs/adr/0001-layers.md) | Layers and import direction |
| [0002](docs/adr/0002-result-and-errors.md) | `Result<T>`, `AppError` |
| [0003](docs/adr/0003-ui-states.md) | The five UI states, aborting stale requests |
| [0004](docs/adr/0004-testing.md) | What each layer tests and how |
| [0005](docs/adr/0005-i18n.md) | Typed dictionaries, the language switch |
| [0006](docs/adr/0006-git-and-prs.md) | Gitflow, commits, PR shape and gates |
| [0007](docs/adr/0007-code-style.md) | No comments, no `any`, naming, CSS Modules |

Read the ADRs of your step before writing code:

| Step | Read first |
|---|---|
| Deciding where code goes | 0001 |
| Calling the API, adding a DTO or a mapper | 0002, 0001 |
| Building or changing a screen | 0003, 0005, 0007 |
| Writing or changing a test | 0004 |
| Any line | 0007 |
| Opening a PR | 0006, `docs/harness/specs-and-prs.md` |

## Commands

```sh
npm run dev          # http://localhost:5173
npm run typecheck
npm run lint
npm run test         # vitest run
npm run build
scripts/verify.sh    # the done gate: all of the above plus ratchets, in order
scripts/pr-gates.sh <n>
```

## Skills

`/verify` the done gate · `/test [path]` run and read a test file or the suite · `/pr` from a dirty tree to an
open PR, the house way.
