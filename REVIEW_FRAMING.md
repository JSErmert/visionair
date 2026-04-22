# VisionAir — Review Framing

This file is the controlling brief for any `/ultrareview` (or equivalent multi-agent review) of this repository. It is intended for reviewer agents and human reviewers alike. Read it before reviewing.

---

Please ultrareview this repo as a governed synthesis system, not as a generic Next.js application.

## Project context

- This is VisionAir, a structured translation system that turns raw human input into a usable opportunity blueprint.
- Current repo state is **v1.0.12**.
- The system is intentionally in a **deterministic synthesis era**, not yet an LLM-synthesis era.
- Regex/table-driven synthesis is **deliberate for Phase 1** and should be reviewed as an intentional substrate, not as an accidental limitation to immediately replace.
- The doctrine should be treated as **in-scope background but not the main target of challenge** in this review. Focus on implementation and architecture, not rewriting product vision.

## Active governance

- Report Contract (`docs/report-contract.md`)
- Structural Constraint Layer (`docs/structural-constraint-layer.md`)
- Highest-Leverage Move Contract (`docs/highest-leverage-move-contract.md`)

## Current active synthesis surfaces

- Reflection (`app/session/flow/reflection.tsx`)
- Transformation (`app/session/flow/transformation.tsx`)
- Core Capability (`synthesizeCapability` inline in `app/session/page.tsx`)
- VersionOne (`synthesizeVersionOne` inline in `app/session/page.tsx`)

## Planned next move

- **v1.0.13**: `synthesizeIdealUser`

---

## The single question this review should answer

**What architectural decisions in the current VisionAir codebase will be most expensive to undo later if we continue building forward from v1.0.12?**

## Please focus specifically on

1. Whether the current inline synthesizer pattern should continue through v1.0.13 or whether extraction/consolidation should happen first
2. Duplication and coupling risks in the current synthesis architecture
3. Any mismatch between doctrine-implied behavior and runtime implementation that will become costly later
4. Whether current data-flow / source-of-truth decisions are sound
5. Which current choices help vs hurt a future migration to model-grade synthesis
6. What is urgent before v1.0.13 vs what is safe to defer

## Please deprioritize

- Generic styling advice
- Tailwind / Next.js convention nitpicks
- Generic testing advice unless it directly affects the architectural question
- Product vision rewrites
- Doctrine rewrites unless implementation clearly contradicts doctrine in a costly way

## Please inspect especially

- `app/session/page.tsx`
- `app/session/flow/*`
- `docs/*.md` (contracts)
- `docs/reports/*`
- `.claude/*`
- Any files most relevant to synthesis architecture and blueprint composition

## Please separate findings into

- **Must address before v1.0.13**
- **Should address soon**
- **Safe to defer**

## Tone

Be candid. If a current architectural choice should be reversed now rather than later, say so clearly.

---

## Authority of this brief

Treat this `REVIEW_FRAMING.md` as the controlling brief for this review. If you must choose between general reviewer instincts and the priorities listed here, follow these priorities.
