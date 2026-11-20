---
name: pr
description: Take the current work from a dirty tree to an open PR, the house way. Verify, ask before committing, open with an empty body, post the manual test script as a comment, run the gates. Use when the developer says "open the PR" or types /pr.
---

# Open a PR

1. **Verify**: run the `verify` skill end to end. Nothing goes out red.
2. **Size**: `git diff --numstat develop...HEAD | grep -vE '\.test\.tsx?|src/test/' | grep src/`;
   500 production lines is a ceiling.
3. **Branch and commit, asking first**: branch `type/slug` cut from `develop` with `--no-track`. Conventional
   commits, English, lowercase, one behaviour each. Do not run `git commit` or `git push` until Ernesto says yes.
4. **Open**: `gh pr create --base develop --title "<type>: <subject>" --body ""`. The body is empty.
5. **Document as a comment**: `gh pr comment <n> --body-file .harness/pr-body.md` with `## Manual tests`
   (numbered steps, `Expected:` each), `## Screenshots` and `## Accessibility` for UI, `## API contract` for
   `core/` or `data/`.
6. **Gate**: `scripts/pr-gates.sh <n>`. Fix what it reports; do not argue with it.
7. **Report**: the PR URL, the production line count, the gate output, and `gh pr checks --watch`.
