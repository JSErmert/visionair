# Contract Authority and Supersession Contract

## Version
v1.0.0 (contract-internal; adopted into VisionAir at system v1.0.20)

---

## Purpose
Define a formal authority and supersession model for the VisionAir system.

When a new artifact or contract conflicts with prior authority, this contract ensures the system:
- explicitly identifies the conflict
- formally declares the supersession
- justifies the override
- updates the authoritative system-state
- preserves a complete audit trail

Without this contract, governance drift occurs silently. With it, all overrides become explicit, traceable, and consistent.

---

## Invocation
Triggered whenever:
- A sealed execution artifact overrides a prior roadmap or system-state
- A new contract changes system behavior or sequencing
- A version slot is repurposed from a prior plan

---

## Core Rule

> **No artifact or contract may override a prior authoritative decision without explicitly declaring and executing a supersession.**

---

## Authority Hierarchy

From highest to lowest authority:

1. **System-State Entries** (`docs/system-state/`)
2. **Contracts** (`docs/*.md`, referenced in `.claude/CLAUDE.md` §"Contract Layer")
3. **Sealed Execution Artifacts**
4. **Execution Reports** (`docs/reports/`)

When two authorities disagree, the higher-layer entry wins. When two entries within the same layer disagree, the one that most recently passed through a valid supersession wins.

---

## Supersession Requirements

When a conflict occurs, ALL four of the following must be executed:

### 1. Identify the Conflict
- Name the prior authority (file + version)
- Quote or summarize the conflicting rule or roadmap

### 2. Declare Supersession
Use explicit language:
> "This artifact supersedes [prior authority] in the following scope…"

### 3. Provide Rationale
Explain:
- why the override is necessary
- why it improves system integrity or execution
- explicit acknowledgment of what prior ordering or logic was **preserved vs rejected**

### 4. Create New System-State Entry
Create a file under `docs/system-state/vX.Y.Z-*.md` that explicitly supersedes the prior system-state entry and carries the new authoritative roadmap. The new entry must:
- cite the prior entry by filename
- forward the Authority clause so future passes honor the same protocol
- preserve (not delete) the prior entry on disk as historical record

---

## Interaction with Other Contracts

### Prompt Artifact Contract
This contract constrains how sealed execution artifacts express overrides; it does not change the Human Gate, the Output Rule, or the Re-Entry Validation Rule.

### Highest-Leverage Move Contract
When the highest-leverage move includes overriding a roadmap, the artifact implementing the move must also satisfy Supersession Requirements §§1–4.

### Structural Constraint Layer
Orthogonal — SCL governs synthesis output shape, not governance protocol.

### Report Contract
Adoption and supersession reports are written in `docs/reports/` per the Report Contract's nine-section structure. A report documenting a supersession must restate the §§1–4 elements from the artifact.

---

## Failure Modes

A supersession fails if:
- The override is implicit (no explicit declaration)
- The conflicting prior authority is not named
- No rationale is provided
- The rationale omits the preserved-vs-rejected acknowledgment
- No new system-state entry is created
- The new entry deletes rather than supersedes the prior entry

---

## One-Line Principle

> **No override without acknowledgment, justification, and state update.**
