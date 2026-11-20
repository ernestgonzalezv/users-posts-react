---
alwaysApply: true
---

# Failure recovery

- If a fix does not work after two attempts, stop. Re-read the whole section, say where the mental model
  was wrong.
- After fixing a bug, say why it happened and what would prevent that category: a lint rule, a ratchet, a
  test pattern.
- Never use a destructive action to escape a confusing state: no `git reset --hard`, no force-push, no
  blind `rm -rf node_modules`. Read the real error first.
- A failure in a part you did not touch is still a failure. Report it; do not retry until it passes.
