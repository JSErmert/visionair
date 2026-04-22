# VisionAir Repository Initialization Sequence

## Purpose
This file defines how Claude must initialize full understanding of the VisionAir repository.

It exists so the command:

**"Initialize VisionAir"**

can function as a single-entry activation command that loads:
- doctrine
- repo structure
- execution authority
- AirFlow orchestration
- current repo state

This file is the initialization entrypoint.

---

## Initialization Command

When the user says:

**"Initialize VisionAir"**

Claude must execute the full sequence below in order.

---

## Step 1 — Load Doctrine

Read these doctrine files in order:

1. `docs/founding-doctrine.md`
2. `docs/first-experience-charter.md`
3. `docs/preserve-reframe-release-audit.md`
4. `docs/build-sequence.md`
5. `docs/phase1-sacred-experience-build-spec.md`
6. `docs/phase1-build-checklist.md`
7. `docs/product-requirements-document.md`
8. `docs/session-flow.md`
9. `docs/screen-copy.md`
10. `docs/wireframe-spec.md`
11. `docs/governance-principles.md`
12. `docs/airflow-closed-loop-bootstrap-doctrine.md`
13. `docs/airflow-self-governing-orchestration-doctrine.md`

### Rule
These files define what VisionAir **is**.
They are the truth layer.

---

## Step 2 — Load Repo Structure

Read:

- `.claude/repo-growth-map.md`

Understand:
- current repo structure
- allowed future branches
- forbidden early branches
- structural growth conditions

### Rule
Do not invent structure outside the growth map unless explicitly authorized.

---

## Step 3 — Load Execution Authority

Read:

- `.claude/CLAUDE.md`

Understand:
- behavioral rules
- build constraints
- authority hierarchy
- AirFlow loop
- success and failure conditions

### Rule
This file governs how Claude acts inside the repo.

---

## Step 4 — Activate AirFlow

Activate AirFlow using:

- `docs/airflow-closed-loop-bootstrap-doctrine.md`
- `docs/airflow-self-governing-orchestration-doctrine.md`

AirFlow must be treated as the active orchestration model for:
- sequencing
- validation
- continuation
- structural discipline
- output integrity
- next-step selection

---

## Step 5 — Inspect Current Repo State

After loading all doctrine and governance files, inspect the actual repo.

Review:
- `app/`
- `components/`
- `public/`
- `styles/`
- `prototypes/`
- `archive/`

Determine:
- what already exists
- what is missing
- what is duplicated
- what is incomplete
- what is premature
- what is canonical vs experimental vs archival

---

## Step 6 — Validate Current State

Before proposing action, validate the current repo state against:

- doctrine
- growth rules
- AirFlow governance
- Phase 1 constraints

Ask:
- Is the current state aligned?
- Is anything conflicting?
- Is anything premature?
- Is anything missing that blocks the next move?

---

## Step 7 — Select the Highest-Leverage Next Move

Choose:

> the single highest-leverage next move

That move must:
- fit the current state
- comply with doctrine
- comply with growth rules
- strengthen the sacred experience
- avoid future drift

### Do not select:
- multiple next moves
- speculative architecture
- future platform features
- broad expansions

---

## Step 8 — Execute Cleanly

When executing the selected move:

- keep scope narrow
- preserve doctrine
- preserve structure
- avoid overbuilding
- do not invent unnecessary abstractions
- do not create unauthorized branches

---

## Step 9 — Re-Evaluate

After execution:

- inspect the resulting state
- validate the new output
- determine whether the move should be:
  - promoted
  - revised
  - deferred

Then continue the AirFlow loop.

---

## Authority Hierarchy

Claude must follow:

1. `docs/` → truth
2. `.claude/` → execution authority
3. `app/` → canonical implementation
4. `components/` and `styles/` → support
5. `prototypes/` → experimental
6. `archive/` → reference only

If implementation conflicts with doctrine, doctrine wins.

If archive conflicts with doctrine, archive is ignored.

---

## Non-Negotiable Constraints

Claude must NOT:
- invent platform layers early
- create dashboards
- create admin systems
- create premature abstractions
- create new top-level folders without real structural need
- treat archive as authoritative
- skip validation
- choose multiple simultaneous directions

---

## Initialization Success Condition

Initialization is complete only when Claude can clearly state:

- what VisionAir is
- who it serves
- what the sacred experience is
- what the current repo state is
- what the highest-leverage next move is
- why that move is the correct next move

---

## One-Line Initialization Rule

**Load truth, load structure, load execution authority, activate AirFlow, inspect the repo, choose the highest-leverage next move.**