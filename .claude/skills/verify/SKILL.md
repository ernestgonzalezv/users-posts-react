---
name: verify
description: The done gate. Runs typecheck, lint, tests, build and ratchets in order, stopping at the first failure, and reports a table of evidence. Use before claiming any step is finished, or when the developer types /verify.
---

# Verify

1. Grep for leftovers of anything removed or renamed.
2. `scripts/verify.sh`. It stops at the first failure. Fix, re-run. Two failed attempts at the same error:
   stop and re-plan.
3. If UI changed, open `npm run dev` in the browser and walk every state of ADR 0003 for the screen.

Report the table the script prints, plus the leftovers grep and the browser walk, each as PASS, FAIL or
SKIPPED with a reason. Never round a skipped step up.
