# VisionAir Build Mode — Design Spec

**Date:** 2026-06-05
**Status:** Design — approved for planning
**Author:** Joshua Ermert (with Claude)

## Summary

VisionAir **Build Mode** is a new mode in VisionAir that turns a full-stack app idea into a downloadable, **Claude-Code-ready context stack** — "a launchpad / booster into Claude Code." A coverage-driven adaptive interview elicits the idea-specific context; VisionAir merges it with a **validated preset best-practice scaffold** distilled from the operator's house-stack portfolio DNA, plus a **methodology layer** that transmits the proven Claude Code working workflow. The output is a ZIP, shaped like a fresh repo, that drops into Claude Code so a build starts **secure, well-architected, and disciplined by default**.

**VisionAir engineers the context; Claude Code does the building.** It is a booster, not a builder.

> **Empirical grounding:** the output structure and coverage model below are reverse-engineered from the operator's own brainstorm→seed track record across HydrOS, VisionAir/mediCalm, and AlignFlow/Spider — they converge on one reusable pattern. See companion `2026-06-05-build-mode-seed-pattern.md`.

## Goals

- Capture maximum context per question (coverage-driven adaptive interview).
- Emit a Claude-Code-**native** artifact set, not a single mega-prompt.
- Bake in **validated** best practices (security / CI / architecture / testing) so builds are secure and properly set up by default.
- Transmit the proven **workflow/methodology** (spec → plan → TDD → review → verify) — durable inline + skill-accelerated.
- **Anti-confabulation:** never invent context; gaps become explicit open questions.

## Non-goals (v1)

- No auto-creating the GitHub repo.
- No direct Claude Code API integration — **ZIP download only**.
- **Single house stack** (Next.js + TypeScript + Tailwind + Vercel + the GitHub-Actions security/CI DNA); no stack menu.
- Full-stack web apps only.
- No auth/account changes; **consumer VisionAir mode untouched**.

## Positioning

A new **Build Mode** alongside the existing consumer idea→blueprint mode. Both share the same dynamic-question engine; Build Mode is a different **output target**.

## Architecture

**Approach:** reuse VisionAir's existing engine — `/api/question` (Sonnet, dynamic questions), `/api/blueprint` (Opus, synthesis), with the `experimental/per-page-dynamic-questions` branch as the seed. Build Mode adds a new output target, not a new engine. *(Alternative — a standalone engine — rejected: slower, duplicates working code, no dogfooding.)*

Components:

1. **Coverage model** *(config)* — the interview's checklist IS the operator's proven depth-moves (see seed-pattern doc): identity (IS / **IS-NOT** · persona · value mechanism) → non-negotiables ("what must never happen") → doctrine / priority hierarchy → output & data contracts → core logic/flow → security → known-gaps.
2. **Interview engine** — given `(coverage state + prior answers)`, generates the next highest-information question; **stops when every dimension is covered or marked unknown** (~6–12 questions).
3. **Synthesizer** — turns covered context into the elicited artifacts under a **ground-or-flag** rule (reuses ProjectVisionary's `flag_ungrounded`): never invents — gaps route to `open-questions.md`.
4. **Preset library** (`presets/`) — the **validation-gated** house-stack best-practice files.
5. **Methodology layer** — `docs/WORKFLOW.md` (durable inline method) + named-skill accelerator references + `SETUP.md` prereqs.
6. **Packager** — assembles elicited + preset + methodology into a folder tree → ZIP → download.
7. **Build Mode UI** — the question "slides" + a final download screen (reuses the existing session UI).

## Output artifact set (ZIP — ordered authority stack)

Per the seed-pattern analysis, the output is **not a flat file set** — it is an **ordered, authority-ranked context sequence fronted by a launch meta-prompt** (the structure that makes the operator's own Claude Code builds succeed). v1 emits the **distilled load-bearing core** scaled to the idea, NOT the maximal HydrOS 14-file form (YAGNI):

```
LAUNCH.md                          [preset]           meta-prompt: read-order + conflict rules (read first)
CLAUDE.md                          [preset+elicited]  authority registry: read-order, doctrine, conflict-resolution
README.md                          [elicited]         idea summary + quick start
docs/context/00-identity.md        [elicited]         IS / IS-NOT + persona + value mechanism
docs/context/01-non-negotiables.md [elicited+preset]  "what must never happen" (hard constraints)
docs/context/02-doctrine.md        [elicited]         priority hierarchy / conflict resolution
docs/context/03-spec.md            [elicited]         what to build (superpowers brainstorming-spec format)
docs/context/04-contracts.md       [elicited]         data + output schemas (locked)
docs/context/05-architecture.md    [preset+elicited]  stack, structure, runtime, deploy
docs/context/06-security.md        [preset]           threat model + house security DNA
docs/context/07-known-gaps.md      [open]             honest unknowns (the anti-confab surface)
docs/context/08-workflow.md        [preset]           methodology arc + accelerator refs
plan-seed.md                       [elicited+preset]  milestone-shaped starting plan
SETUP.md                           [preset]           prereqs incl. optional plugin install
.github/workflows/ci.yml           [preset]           type-check/build + Trivy + gitleaks
.pre-commit-config.yaml            [preset]
.gitignore                         [preset]
```

**Provenance tags** on every file/section: `[preset]` validated best-practice · `[elicited]` from the interview · `[open]` unknown — so Claude Code and the user always know what is asserted vs assumed.

`LAUNCH.md` mandates the read-order and pre-loads state (prevents hallucination); `CLAUDE.md` carries the authority + conflict-resolution registry; `docs/context/03-spec.md` ships in **superpowers brainstorming-spec format** so the user's Claude Code can run `writing-plans` on it immediately. Dogfoods the operator's existing `docs/superpowers/specs` convention.

## The interview (coverage-driven adaptive)

The engine tracks the coverage checklist — and the checklist **is the operator's empirical depth-moves** (identity/IS-NOT → non-negotiables → doctrine → contracts → core logic → security → known-gaps), not a generic requirements list. For each turn it asks the question that maximizes information gain against the remaining-uncovered moves, adapting to prior answers. A move exits the checklist when it is either covered with grounded context or explicitly marked unknown. Unknowns flow to `07-known-gaps.md`. This operationalizes "maximum context, fewest questions," makes anti-confabulation structural rather than post-hoc, and ensures "covered" means the seed has the depth that makes the operator's own builds succeed.

## Anti-confabulation

Three layers: (1) `open-questions.md` captures every gap as an explicit question; (2) provenance tags separate elicited from preset from open; (3) the synthesizer's ground-or-flag rule asserts only what the interview supplied. A stack built on hallucinated requirements is worse than no tool — these guards prevent it.

## Preset best-practice corpus — VALIDATION-GATED (Gate 1)

Distilled from the house-stack portfolio DNA (consistent across VisionAir, jacques, vocalattice, mediCalm, AlignFlow, ProjectVisionary):

| Dimension | Proven pattern (preset source) |
|---|---|
| Security | `SECURITY.md` + threat model, server-only secrets, CSP/HSTS, rate limiting, prompt-injection defenses |
| CI/CD | GitHub Actions: type-check/build + Trivy + gitleaks + Dependabot + SARIF |
| Pre-commit | hook stack (cross-portfolio standard) |
| Architecture | `ARCHITECTURE.md`, layered, documented rationale |
| Spec discipline | spec-driven dev, `docs/superpowers/specs` + plans, milestone contracts |
| Testing | Vitest+Playwright / pytest+Hypothesis + coverage gates |
| Integrity | evidence/structural contracts, validation gates, anti-confabulation |
| Supply-chain | model/dep allowlists, mypy/ruff/bandit/pip-audit strict |

**Consistent ≠ validated-best-practice.** The operator's own diagnostic has flagged flaws inside source projects (HydrOS reward/invariant gaps; "claim-ahead-of-code" Pattern 4; AlignFlow doctrine-self-disclaim; AEI NotImplementedError maximum-form). Baking these in unvalidated would amplify known flaws at scale.

**Gate 1 (before any preset file is written):** scoped triangulation —
- **Implementation witness:** which recurring patterns are genuinely sound vs merely habitual?
- **Literature anchor:** validate each against external standards (OWASP, 12-factor, SLSA, testing pyramid) so presets cite authority, not "Josh did it this way."
- **Adversarial pass:** where would a preset make Claude Code build something insecure or wrong?

Output: validated preset files, each citing its authority.

## Methodology layer

**Durable arc** (`docs/WORKFLOW.md`, works with zero plugins): spec-first → plan → failing-test-first (TDD) → systematic debugging when stuck → code-review before merge → verify-before-done. Balanced by a **GSD ("Get Stuff Done") execution ethos** — bias to action, ship and iterate, momentum — so rigor doesn't become over-ceremony.

**Accelerator references** (if the user has them installed): `superpowers:writing-plans`, `superpowers:test-driven-development`, `superpowers:systematic-debugging`, `superpowers:requesting-code-review`, `superpowers:verification-before-completion`.

**`SETUP.md`** lists the optional plugin install for users who want the accelerator layer.

*Which* workflows/skills to prescribe (and the minimal high-leverage set) is itself part of the Gate-1 validation.

> Open item: confirm whether "GSD" is a specific plugin the operator runs or the execution ethos (treated as ethos here).

## Data flow

```
idea → interview (coverage-driven) → covered context (+ unknowns)
     → synthesizer (ground-or-flag) → elicited artifacts
     → merge: validated presets + methodology layer
     → packager → ZIP → user → Claude Code build
```

## Testing

- Coverage-model unit tests (dimension tracking, stop condition).
- Synthesizer grounding tests: zero ungrounded claims; every gap appears in `open-questions.md`.
- Packager structure test: ZIP contains the expected tree with correct provenance tags.
- Preset validation gate delivered as its own artifact (the triangulation output).
- One golden end-to-end: a sample idea → expected stack shape.

## Implementation gates (for the plan)

1. **Gate 1 — preset-corpus validation** (triangulation). Blocks preset authoring.
2. Coverage model → interview engine → synthesizer → presets + methodology → packager → Build Mode UI → golden e2e.

## Open decisions to finalize during planning

- "GSD" = plugin vs ethos (above).
- Final coverage-dimension list.
- Minimal high-leverage prescribed-skill set (Gate-1 output).
- Whether `CLAUDE.md` embeds the methodology or points to `docs/WORKFLOW.md` (lean: short CLAUDE.md pointer).
