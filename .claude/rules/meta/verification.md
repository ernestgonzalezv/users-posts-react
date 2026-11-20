---
alwaysApply: true
---

# Verification

You may not report a task as complete before:

1. Grepping for leftovers of anything you removed or renamed.
2. `scripts/verify.sh` green: typecheck, lint, tests, build, ratchets.
3. Looking at the real diff (`git diff`) before reporting, not the summary of what you meant to do.
4. For UI changes, seeing every state of ADR 0003 in the browser.

A skipped step is reported as SKIPPED with its reason. Never say "done" with pending errors.
