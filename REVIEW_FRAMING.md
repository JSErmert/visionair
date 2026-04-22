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

## How behavioral validation already works (do not duplicate)

Behavioral testing is done via a **deterministic 10-persona harness external to the repo** (located outside the working tree, so reviewer agents cannot see it directly). The current calibration baseline is **3.36 / 5** across 10 user-archetype personas, fully documented in `docs/reports/v1.0.9-calibration-evaluation-pass.md`. **Read that report before forming opinions about behavioral quality, output style, or per-persona performance.** Recommendations to "add testing infrastructure" or "evaluate against more user types" should account for what already exists; the harness is the test methodology by design.

## Known-deliberate decisions (do not flag)

The following look like flaws but are intentional. Do not include them in findings unless you have a *new* argument against them; the prior reasoning is documented in the linked reports.

- **`pathForward` reaches the blueprint as raw user text** (no synthesis applied) — deliberate per `docs/reports/v1.0.8-blueprint-synthesis-integration.md`. Action content does not benefit from state-translation; the immediate/near-term/later bucketing is the structural shape.
- **The session step machine orders `path-forward` before `blueprint`**, which diverges from the doctrine's numbered sequence (Blueprint Reveal = 12, Guided Path Forward = 13). This is deliberate per `docs/reports/v1.0.1-stage-7-bootstrap-injection.md` — the user must input their next-steps before the blueprint can render the complete 7-section artifact.
- **`console.log("SYNTHESIS RUNNING", seedInput)` in `app/session/flow/reflection.tsx`** — temporary verification instrumentation, scheduled for removal in the v1.0.15 polish pass per the v1.0.12 report's open follow-ups.
- **The four synthesizers are inline in `page.tsx` rather than extracted** — deliberate decision documented in v1.0.5/v1.0.7/v1.0.11 reports; extraction is on the named roadmap as v1.0.14, intentionally sequenced *after* the fourth synthesizer (`synthesizeIdealUser`, v1.0.13) lands so the extraction captures all four patterns at once. **You may still recommend extracting earlier if you have a strong architectural reason; this brief just notes that the inline pattern is not an oversight.**

---

## The single question this review should answer

**Identify the 3 to 5 specific architectural decisions in the current VisionAir codebase that will be most expensive to undo later if we continue building forward from v1.0.12. Rank them.**

### Definition of "expensive"

For each identified decision, weight expense across these axes (not all need apply per finding):

- **Code rewrite cost** — how much code has to change, how many surfaces are coupled
- **Doctrinal erosion cost** — how much the decision drifts the runtime away from doctrine-implied behavior
- **Future LLM migration cost** — how much the decision will have to be undone or worked around when synthesis points are upgraded to model-grade
- **User-trust cost** — whether the decision will cause real users in v1.1.x testing to lose trust in the artifact or the experience

A decision is "expensive to undo" if reversing it later would either touch many surfaces or compromise an exit-condition that has already been met.

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

Use the project's own roadmap as the timing axis (rather than fuzzy "soon" / "later"):

- **Must address before v1.0.13** — `synthesizeIdealUser` cannot land cleanly without this
- **Must address before the v1.1.0 user-testing milestone** — the issue will surface when real users see the artifact, not before
- **Safe to defer past v1.1.0** — issue is real but does not block testing or milestone integrity

## Tone

Be candid. If a current architectural choice should be reversed now rather than later, say so clearly.

---

## Authority of this brief

Treat this `REVIEW_FRAMING.md` as the controlling brief for this review. If you must choose between general reviewer instincts and the priorities listed here, follow these priorities.
