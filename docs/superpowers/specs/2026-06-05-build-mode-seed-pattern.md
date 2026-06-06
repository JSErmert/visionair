# Build Mode — The Operator's High-Depth Seed Pattern (empirical foundation)

**Date:** 2026-06-05
**Status:** Research — companion to `2026-06-05-build-mode-design.md`
**Source:** Read-only analysis of the gpt-files brainstorm corpus + the resulting repos, across three structurally different project types: deep-tech (HydrOS), full-stack web (VisionAir, mediCalm), governed engines (AlignFlow, Spider).

## Why this exists

Build Mode generates a high-depth Claude-Code context stack. Rather than design "high depth" from theory, this doc reverse-engineers how the operator *actually* turns a brainstorm into a seed that produces strong Claude Code builds. The three project types **independently converged on the same meta-pattern** — strong evidence it is a reusable discipline. This pattern is the ground truth for Build Mode's coverage model, output stack, and the Gate-1 preset validation.

## The convergent arc: brainstorm → high-depth seed

A consistent sequence of depth-adding moves:

1. **Lock identity by exclusion** — strip features; state what it **IS** and emphatically what it **IS NOT**, plus a *specific* persona and the value mechanism. ("single-user cost optimizer, not an app"; "capable-but-unclear builders, not all entrepreneurs"; "not a diagnosis engine".)
2. **Non-negotiables / "WHAT MUST NEVER HAPPEN"** — enforceable hard-constraint lists come *before* features (governance-before-feature).
3. **Doctrine / priority hierarchy** — explicit conflict-resolution ordering (e.g. traceability > data validity > constraint > simplicity > cost).
4. **Lock output & data contracts** — exact output shape, schemas, atomicity ("one decision per record") — *before any code*.
5. **Deterministic pipeline / rules** — immutable ordered stages, auditable, no magic constants (HydrOS pipeline order; Spider R1–R7).
6. **Truth/state separation + evidence contracts + truth-boundary labeling** — `truth_state` vs `sensor_state`; evidence-weighted confidence; real vs synthetic explicitly flagged.
7. **Honesty as a depth signal** — explicit "what isn't valid yet / known gaps / what the reward does NOT optimize" become *foundations*, not hidden. This is anti-confabulation at the source.

## The bundling structure: a layered authority stack + launch meta-prompt (NOT a mega-prompt)

Every project bundles context the same way:

- **`CLAUDE.md` = runtime authority registry** — read first; lists contracts, doctrine, required read-order, conflict-resolution rules.
- **An ordered, numbered `docs/context/` sequence** (00→N) so understanding accumulates — never a flat dump.
- **A launch meta-prompt** (e.g. `HydrOS_x_CLAUDE_CODE_LAUNCH_PROMPT.md`): *"before any action, read these files in this exact order."* Pre-loads state; prevents hallucination.
- **Authority hierarchy + supersession** so doc conflicts resolve deterministically (system-state > contracts > sealed artifacts > reports).

## Concrete depth markers (what makes a seed "high depth")

Immutable ordered pipeline · "what must never happen" lists · frozen dimensional/output contracts · validation gates per change · truth/sensor-state separation · evidence-weighted confidence (no single-signal state changes) · real-vs-synthetic labeling · priority hierarchy for conflicts · honesty/known-gaps inventory · config-first (no magic constants) · ordered read-order meta-prompt · authority + supersession discipline.

## Distilled load-bearing core for Build Mode v1 (full-stack web)

HydrOS's form is *maximal* (14-file context sequence, Council Mode, sealed system-state per pass). Build Mode v1 must generate the **distilled core scaled to the idea**, NOT auto-impose the maximal form (YAGNI). The load-bearing core for a fresh full-stack-web seed:

```
LAUNCH.md                       meta-prompt: read order + conflict rules (read me first)
CLAUDE.md                       authority registry: read-order, doctrine, conflict-resolution
docs/context/
  00-identity.md                IS / IS-NOT + persona + value mechanism
  01-non-negotiables.md         "what must never happen" (hard constraints)
  02-doctrine.md                priority hierarchy / conflict resolution
  03-spec.md                    what to build (superpowers brainstorming-spec format)
  04-data-and-output-contracts.md   schemas / output shape (locked)
  05-architecture.md            stack, structure, runtime, deploy
  06-security.md                threat model + house security DNA
  07-known-gaps.md              honest inventory of unknowns (== open-questions)
  08-workflow.md                methodology arc + accelerator refs
plan-seed.md                    milestone-shaped starting plan
.github/workflows/ci.yml, .pre-commit-config.yaml, .gitignore, SETUP.md   (preset)
```

Each file/section carries a provenance tag: `[preset]` validated best-practice · `[elicited]` from interview · `[open]` unknown.

## How this maps to Build Mode

- **Coverage model = the depth-moves (1–7 above).** The interview's checklist is identity(is/is-not, persona, mechanism) → non-negotiables → doctrine/priorities → output/data contracts → core logic → safety → known-gaps. Proven, not generic.
- **Output stack = the distilled core above**, emitted as an ordered, authority-ranked sequence fronted by `LAUNCH.md`.
- **Anti-confabulation** descends directly from "honesty-as-depth" (`07-known-gaps.md` / open-questions) + truth-boundary labeling (provenance tags).
- **Gate 1 (preset validation)** must preserve the honesty discipline — the analysis surfaced the operator's own honesty-pivots (HydrOS "not a trustworthy digital twin yet"; reward not optimizing capture). Presets encode *validated* best-practice + honest known-limits, never papered-over claims.

## Representative sources (read-only)

- HydrOS: `the-gpt-files/HydrOS/*` + `hydrOS/docs/context/` (14-file ordered seed) + `hydrOS/HydrOS_x_CLAUDE_CODE_LAUNCH_PROMPT.md`
- VisionAir/mediCalm: `VisionAir/docs/founding-doctrine.md`, `governance-principles.md`, `contract-authority-and-supersession.md`; `mediCalm/docs/context/00_document_hierarchy_map.md` (authority order)
- AlignFlow/Spider: `Spider/docs/source/00_SPIDER_FOUNDING_BRIEF.md`, `12_DECISION_ENGINE_LOGIC.md` (R1–R7), `Spider/.claude/CLAUDE.md`; `AlignFlow/contracts/AlignFlow_M1.md`
