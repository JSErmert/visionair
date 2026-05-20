# VisionAir Claude Governance Pack

## Purpose
This file defines how Claude must operate inside the VisionAir repository.

It enforces:
- doctrine alignment
- repo structure integrity
- growth constraints
- Phase 1 focus
- AirFlow orchestration

This is not guidance.
This is execution authority.

---

# Initialization Protocol

Claude must support full repository initialization through:

`.claude/repo-initialization.md`

When the user says:

**"Initialize VisionAir"**

Claude must execute the initialization sequence defined in that file.

That means Claude must:

1. Load doctrine from `/docs`
2. Load repo structure from `.claude/repo-growth-map.md`
3. Load this file as execution authority
4. Activate AirFlow orchestration
5. Inspect current repo state
6. Identify the highest-leverage next move

---

# Active Governing References

Claude must treat the following files as active governing references:

## Truth Layer
- `docs/founding-doctrine.md`
- `docs/first-experience-charter.md`
- `docs/preserve-reframe-release-audit.md`
- `docs/build-sequence.md`
- `docs/phase1-sacred-experience-build-spec.md`
- `docs/phase1-build-checklist.md`
- `docs/product-requirements-document.md`
- `docs/session-flow.md`
- `docs/screen-copy.md`
- `docs/wireframe-spec.md`
- `docs/governance-principles.md`
- `docs/v1-1-0-completion-guidance.md` — terminal-alignment directive for v1.0.23 + v1.0.24 + v1.1.0: names the six v1.1.0 readiness conditions, locks v1.0.24 weighting signals (repetition, emphasis language, specificity, domain keywords), and freezes the final system-purpose framing; doctrine-extension, not roadmap supersession (v1.0.20 state authoritative)

## AirFlow Layer
- `docs/airflow-closed-loop-bootstrap-doctrine.md`
- `docs/airflow-self-governing-orchestration-doctrine.md`

## Structure Layer
- `.claude/repo-growth-map.md`
- `.claude/repo-initialization.md`

## Contract Layer
- `docs/report-contract.md` — governs when and how formal reports are written
- `docs/structural-constraint-layer.md` — governs the shape of synthesis output (no raw emotional echo, no therapy mirror, translate-to-operational)
- `docs/highest-leverage-move-contract.md` — governs selection of the single next move; mandates State → Move → Step → Why → What-Not-To-Do block on every reportable pass
- `docs/prompt-artifact-contract.md` — governs how execution prompts are sealed and handed off; activates in prompt-generation mode on invocations like "Create sealed execution artifact for vX.Y.Z" or "Enter prompt-generation mode for vX.Y.Z"
- `docs/contract-authority-and-supersession.md` — governs how artifacts and contracts override prior system-state decisions; mandates explicit identify + declare + rationale + new system-state entry whenever a prior authority is overridden (adopted v1.0.20)
- `docs/artifact-refinement-contract.md` — governs pre-execution refinement of sealed artifacts; mandates memo-pass → re-seal → execute loop; establishes Instruction Assimilation Layer for promoting memo-pass insights into CLAUDE.md (adopted v1.0.19, re-sealed)

These six contracts compose. All six must operate together on every governed pass.

If any implementation choice conflicts with these files, Claude must follow the governing references.

## Milestone State
**v1.1.0 REACHED 2026-04-24; v1.1.3 ROADMAP REALIGNMENT ADOPTED 2026-04-27.** Authoritative system-state entry: `docs/system-state/v1.1.3-roadmap-realignment-adopted.md` (supersedes `v1.1.0-user-testing-milestone-reached.md` per CASS §§1–4).

**Optimization target:** a coherent, high-signal, actionable strategy that can be saved, revisited, and acted on.

**Completion criterion:** "the user feels they have a clear, actionable path they can actually begin building." Section-level structural correctness is necessary but no longer sufficient.

**Authoritative roadmap:**
- v1.1.3 — deterministic lane derivation (next code pass)
- v1.1.4 — strategy compression output

**Hard stops:** no further indefinite vocabulary expansion; no LLM yet.

---

# Core Identity

VisionAir is:
- a human-centered governed intelligence environment
- built for capable but unclear people
- designed to turn unstructured potential into structured, trustworthy progress

VisionAir is not:
- a startup productivity tool
- a dashboard system
- a generic AI assistant
- a feature-heavy platform

---

# Authority Hierarchy

Claude must follow:

1. `docs/` → truth
2. `.claude/` → execution rules
3. `app/` → implementation
4. `components/` → support
5. `prototypes/` → experimental
6. `archive/` → reference only

If implementation conflicts with docs → fix implementation.

---

# AirFlow Self-Governing Orchestration

Claude must follow AirFlow as a **self-enforcing system**, not just a method.

Claude must use:
- `docs/airflow-closed-loop-bootstrap-doctrine.md`
- `docs/airflow-self-governing-orchestration-doctrine.md`

as active orchestration authority.

## Core Loop

1. Understand current state  
2. Validate continuation integrity  
3. Validate realism and constraints  
4. Validate structural readiness  
5. Identify highest-leverage next move  
6. Validate move against governance  
7. Execute move  
8. Validate resulting output  
9. Promote / revise / defer  
10. Repeat  

---

# Governance Engines

## 1. Orchestration (AMO)

Claude must:
- track system position
- preserve state continuity
- never skip steps
- never reorder flow arbitrarily

---

## 2. Realism (AROD)

Claude must:
- avoid inflated outputs
- avoid false clarity
- avoid abstract speculation
- ensure all outputs are grounded

---

## 3. Structure (AlignFlow)

Claude must:
- structure before exposing
- separate detection / structuring / validation / output
- produce organized artifacts

---

## 4. Contract (VisionAir)

Claude must:
- return complete outputs
- maintain required structure
- ensure outputs are usable without explanation

---

# Core Rules

## Rule 1 — Continuation Before Action
Do not act until current state is understood.

## Rule 2 — Validation Before Progression
Do not move forward from weak or unclear output.

## Rule 3 — Structure Before Output
Do not present unstructured information as final.

## Rule 4 — Contract Before Completion
Do not finish a step with incomplete output.

## Rule 5 — Promotion Before Expansion
Do not expand system until current layer is proven.

## Rule 6 — Recursion With State Awareness
Each move must come from the current state, not past plans.

---

# Build Constraints

Claude must NOT:
- create new top-level folders prematurely
- introduce platform architecture early
- build dashboards or admin systems
- create backend abstractions prematurely
- introduce `lib/`, `hooks/`, `types`, `tests` without real need

Claude must also NOT:
- skip the initialization sequence
- invent structure outside `repo-growth-map.md`
- treat archive material as authoritative
- choose multiple next moves at once
- solve future architecture ahead of the current sacred experience

---

# Reporting Enforcement

Claude must follow `docs/report-contract.md` as authoritative governance for all formal reports.

## Canonical Report Location
All formal reports must be written to `docs/reports/` and only to `docs/reports/`.

## Qualifying Events
Formal reports are required only for:
- structural alignment changes
- successful completion of "Initialize VisionAir"
- completion of a major AirFlow cycle
- material governance changes
- material repo-state changes

## Forbidden Reports
Claude must NOT write formal reports for:
- tiny formatting edits
- cosmetic wording changes
- trivial renames without structural impact
- low-impact file cleanup
- conversational planning only
- speculative discussion without repo change

If the event is not structural, architectural, or governance-bearing, it is not a report.

## Report Output Rule

For every reportable event, Claude must produce two outputs:

### 1. Chat Output (Execution Summary)
- concise summary of what was executed
- validation results
- readiness / next move

### 2. Formal Report File
- written to `docs/reports/`
- must follow `docs/report-contract.md`
- must be versioned and structured

## Fenced Report Output Requirement

After writing the report file, Claude must also:

- print the full report content in chat
- use a fenced markdown block
- preserve exact file content
- ensure the output is copyable

---

# Phase 1 Objective

Build the **Structured Opportunity Session**

Goal:

User moves from:
"I know there’s something here, but I can’t structure it"

to:
"I can clearly see what I have, who it helps, what it should become, and what to do next"

---

# Output Requirement

Must produce:

## Structured Opportunity Blueprint

With 7 sections:
1. Core Capability  
2. Aligned Problem Space  
3. Ideal User  
4. Transformation Promise  
5. Opportunity Form  
6. First Buildable Version  
7. Guided Path Forward  

---

# Success Condition

The system is correct only if the user can say:

- I feel clearer  
- this fits me  
- I understand what I have  
- I trust the output  
- I know what to do next  

---

# Failure Signals

If any occur, fix immediately:

- output feels generic  
- system feels like a questionnaire  
- user feels overwhelmed  
- system overbuilds  
- UI feels like productivity software  

---

# Execution Rule

Claude must always choose:

> the single highest-leverage next move

Not:
- multiple steps
- future features
- speculative architecture

That move must be selected only after:
- doctrine loading
- structure loading
- execution loading
- current-state inspection
- AirFlow validation

---

# One-Line Operating Rule

**Understand the current state, validate it, execute the highest-leverage next move, validate the result, and repeat.**