<!-- [preset] VALIDATED DEFAULT for the Next.js/TS/Vercel house stack — verify against THIS app; flag any mismatch as a gap in docs/context/07-known-gaps.md. Authority: see citations inline. -->

# 08 — Workflow Baseline

> Authority: Beck "TDD by Example" (2002); Fowler "Is Design Dead?" (2004); Fowler "Continuous Delivery" (Humble/Farley, 2010).

---

## The Durable Loop (works plugin-free)

Every feature or fix follows this sequence. Scale the rigor to the risk (see table below):

```
SPEC → PLAN → TDD → REVIEW → VERIFY → SHIP
```

| Phase | What happens | Artifact |
|---|---|---|
| **Spec** | Define the behavior, inputs/outputs, and non-negotiables. Confirm with the team. | `docs/context/03-spec.md` or ADR |
| **Plan** | Break into ordered tasks. Identify unknowns. No code yet. | Numbered task list |
| **TDD** | Write failing test → implement minimum → pass → refactor | Tests + implementation |
| **Review** | Code review: correctness, security (authZ, validation, secrets), maintainability | PR comments |
| **Verify** | Smoke test in a real environment. Check the actual behavior, not just test output | Manual or automated |
| **Ship** | Merge → deploy → monitor | Deployment |

---

## Right-Sizing Rule

Scale rigor to app risk, not to process habit:

| Signal | Lower rigor OK | Higher rigor required |
|---|---|---|
| Data sensitivity | Public/anonymous data | PII, financial, medical |
| Mutation surface | Read-only or internal | User writes, sends, deletes |
| Traffic scale | Low / known users | Public or high volume |
| Reversibility | Easy to roll back | Hard to undo (emails sent, money moved) |

A one-page internal tool does not need the same review depth as a public-facing payment flow. Document the risk level in `docs/context/01-non-negotiables.md` so the team has a shared calibration.

---

## Optional Accelerators (if installed)

The following `superpowers:*` skills can accelerate specific phases — **they are entirely optional** and assume the [Superpowers plugin](https://github.com/anthropics/claude-code-superpowers) is installed in Claude Code:

- `superpowers:brainstorming` — before authoring a spec (explores intent + requirements)
- `superpowers:writing-plans` — converts a spec into a numbered, testable plan
- `superpowers:test-driven-development` — guides the TDD loop per task
- `superpowers:requesting-code-review` — structured review at PR time
- `superpowers:verification-before-completion` — final smoke-test checklist

**Never assume these are present.** The durable loop above works without them.

---

## Known-Gaps Integration

Any item that is unresolved, undecided, or contradictory goes into `docs/context/07-known-gaps.md` immediately — never silently deferred or assumed away. The engine's reconciliation pass surfaces preset↔app mismatches; human judgment resolves them.
