# Artifact Refinement and Re-Seal Contract

## Version
v1.0.0 (contract-internal; adopted into VisionAir at system v1.0.19, re-sealed)

---

## Purpose

Define the mandatory pre-execution refinement loop for all sealed execution artifacts. Ensure that artifacts meet contract-grade quality before execution through structured memo-pass review and, when necessary, re-seal.

Closes three recurring risk classes documented across v1.0.16 – v1.0.20 passes:
- Overstated or unvalidated claims
- Implicit rule-breaking without formal exception handling
- Insufficient output-diff governance when byte-identity is released

Establishes a controlled pathway (Instruction Assimilation Layer) for promoting recurring, structural, actionable memo-pass insights into `.claude/CLAUDE.md` without accumulating noise.

---

## Invocation

Triggered whenever a sealed execution artifact is created or updated. Applies automatically to all future sealed artifacts following adoption.

---

## Core Rule

> **No sealed execution artifact may execute until it has passed a memo-pass review and, if necessary, been re-sealed.**

---

## Scope of Application

Applies to:
- All sealed execution artifacts (current and future)
- Any artifact intended for code modification, system execution, or governance-level change

Does NOT apply to:
- Informal planning notes
- Non-artifact conversational analysis
- Purely descriptive documents without execution authority
- Post-execution reports (those are historical records, not execution prompts)

---

## Execution Flow

### Phase 1 — Initial Seal
A sealed execution artifact is generated — by Claude (via prompt-generation mode) or drafted directly by the user. Both origins are valid.

### Phase 2 — Memo Pass (MANDATORY)
Claude performs a structured review of the artifact before execution, evaluating against the Memo Pass Requirements below.

### Phase 3 — User Decision
User selects one:
- Accept artifact as-is
- Approve tightening edits (triggers Phase 4)
- Reject artifact

### Phase 4 — Re-Seal (if edits approved)
Claude generates a re-sealed artifact that:
- explicitly states it is re-sealed (e.g., "[RE-SEALED]" in title or version block)
- lists incorporated edits
- supersedes the prior seal
- re-enters Phase 2 if the user requests a second memo-pass on the re-sealed version

### Phase 5 — Execution Authorization
Execution may only proceed from the latest active seal after the user gives explicit execution authorization.

---

## Memo Pass Requirements

The memo-pass evaluates the artifact across five layers:

### Layer 1 — Contract Integrity
- All Prompt Artifact Contract Required Artifact Contents present (Title and Version, Purpose, Trigger, State Observed, Scope, Explicit Code Changes or Actions, Non-Scope, Execution Instructions, Validation Requirements, Success Conditions, Stopping Condition)
- Scope clearly defines which files are touched vs not
- Execution steps ordered and actionable
- Validation requirements testable (verifiable procedures, not forward-promises)
- Stopping condition explicit
- HLMC Required Output Block present in any Readiness section

### Layer 2 — Doctrine and Governance Integrity
- No overstated claims (flag language like "this is an improvement, not a regression" as potential overclaim)
- All tradeoffs explicitly acknowledged
- Any rule-breaking change formalized as a bounded exception (not a tolerated inconsistency)
- No silent weakening of existing rules
- If the artifact overrides prior authority, Supersession Requirements (per Contract Authority and Supersession Contract §§1–4) are satisfied

### Layer 3 — Output-Diff Governance
If byte-identical output is released on any field:
- Artifact must define a classification system for acceptable diffs
- Minimum classification set: **Additive / Reordered / Substituted**
- Each diff must be traceable to a root cause (specific vocabulary change, specific logic change, etc.)
- Unacceptable diffs flagged as regressions

### Layer 4 — Validation Trustworthiness
- Any harness/app drift risk identified
- Parity checks required when harness mirrors app behavior
- Baseline verification step exists (e.g., reproduce prior output before starting)
- No pre-written validation claims

### Layer 5 — Cognitive Load
- Over-specification identified
- Reductions recommended that preserve executability
- Separate mandatory content from optional analytical appendix

---

## Mandatory Review Behaviors

Claude MUST:
- Treat intended improvements as hypotheses, not confirmed outcomes, until validation data exists
- Require explicit justification for any allowed output change
- Require root-cause traceability for all diffs
- Enforce app/harness parity checks before trusting diff results
- Distinguish execution-critical content from analytical commentary
- Apply the memo-pass rubric to self-drafted artifacts (meta-consistent — Claude memo-passes its own seals)

---

## Memo Pass Verdict Categories

Standardized three-category scale:

- **Pass** — artifact is execution-ready; no edits recommended
- **Pass with tightening recommended** — artifact is fit to execute but tightening would improve it; user decides whether to accept as-is or re-seal
- **Fail** — artifact has structural or doctrinal defects that must be fixed before execution; re-seal required

---

## Re-Seal Rules

- Memo-pass commentary does NOT modify the artifact automatically
- Only user-approved edits may be incorporated
- Re-sealed artifact must:
  - state supersession clearly
  - list incorporated edits explicitly
  - preserve all unchanged sections verbatim
- Only the re-sealed artifact is valid for execution

---

## Instruction Assimilation Layer

### Purpose
Promote repeatable, high-value insights from memo passes into Claude's instruction layer (CLAUDE.md) without introducing noise.

### Promotion criteria
An insight may be promoted into `.claude/CLAUDE.md` only if it is **all three** of the following:

1. **Recurring** — appears across multiple artifacts
2. **Structural** — improves the system, not just one artifact
3. **Actionable** — can be enforced consistently

### Rejection criteria
One-off feedback, style preferences without structural impact, and critiques specific to a single pass do NOT qualify. They stay in memo-pass records or individual reports.

---

## Interaction with Other Contracts

- **Prompt Artifact Contract**: this contract extends the PAC's Human Gate with a mandatory memo-pass step between Phase 1 (seal) and Phase 5 (execution). Both contracts compose; neither overrides the other.
- **Contract Authority and Supersession Contract**: if an artifact overrides prior authority, its memo-pass must verify §§1–4 compliance in Layer 2.
- **Highest-Leverage Move Contract**: the HLMC Required Output Block is a mandatory check in Layer 1 (Contract Integrity).
- **Report Contract**: the report written after execution is a separate artifact and is NOT subject to memo-pass (reports are historical records, not execution prompts).
- **Structural Constraint Layer**: orthogonal — SCL governs synthesis output shape; this contract governs artifact quality.

---

## Failure Modes

The memo-pass process fails if:
- No review is performed before execution
- Edits are silently incorporated without re-seal
- Validation claims are accepted without verification
- Overrides of prior authority are accepted without Supersession Requirements §§1–4
- Self-drafted artifacts (by Claude or user) skip the memo-pass

---

## One-Line Principle

> **Generate → Review → Re-Seal (if needed) → Execute. No artifact moves forward unrefined.**
