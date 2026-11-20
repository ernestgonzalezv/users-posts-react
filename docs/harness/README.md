# The harness

What makes an agent session in this repo repeatable: where the rules live, what is verified before
anything is called done, how a feature is cut into PRs.

```
.claude/
  settings.json      denied actions, hooks
  hooks/             guard-bash.sh (destructive git, blind cache wipes, baselines, secrets), guard-write.sh
  rules/             rules loaded by path scope; meta/ always applies
  skills/            /verify /test /pr
docs/
  adr/               the decisions, numbered and citable
  harness/           this file and specs-and-prs.md
  ai-log.md          how the AI was used: what was asked, accepted, corrected
scripts/
  verify.sh          typecheck -> lint -> test -> build -> ratchets, stops at the first failure
  pr-gates.sh        deterministic PR gates over title, body and comments
  ratchet/           rules with a baseline that only shrinks
specs/               one folder per feature, cut into PRs before code
```

## The loop

**Gather context -> act -> verify -> repeat.**

| Piece | Part of the loop | Guarantees |
|---|---|---|
| `docs/adr/` + `.claude/rules/` | gather context | a decision already taken is not taken again differently |
| `.claude/hooks/` | act | the forbidden cannot be done, not merely asked not to |
| `scripts/verify.sh` + `scripts/ratchet/` | verify | "done" means the same thing every time |

## Verification

`scripts/verify.sh` runs in order and stops at the first failure: typecheck, lint, tests, build, ratchets.
It reports what each step returned, not what was expected. A skipped step is written as SKIPPED with its
reason, never left blank and never rounded up to PASS.

## Ratchets

Each rule in `scripts/ratchet/rules.d/` has a baseline of known violators that can only shrink. This repo
was born with every baseline empty, so every rule is a hard gate here.

```bash
scripts/ratchet/ratchet.sh list             current violators per rule
scripts/ratchet/ratchet.sh check            fails on drift
scripts/ratchet/ratchet.sh update <rule>    after fixing files
```

A new violation is fixed, never added to a baseline.

## PRs

See [specs-and-prs.md](specs-and-prs.md) and ADR 0006. `scripts/pr-gates.sh <n>` is the gate.
