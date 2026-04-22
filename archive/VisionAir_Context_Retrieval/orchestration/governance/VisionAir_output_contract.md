# VisionAir Output Contract

**Document type:** Governance protocol  
**Project:** VisionAir  
**Scope:** All VisionAir orchestration artifacts unless explicitly superseded  
**Date:** 2026-04-16  
**Status:** authoritative_draft  

**Governed by:**
- AlignFlow — structural sequencing of artifact phases
- AROD — output integrity, copy-paste safety, non-truncation discipline, truth-status clarity
- AMO — ordered artifact progression, continuation handling, and return structure discipline

---

## 1. Purpose

This contract defines how VisionAir artifacts must be saved, printed, and returned during orchestration.

Its purpose is to ensure that remote workflow remains safe, copy-pasteable, inspectable, and recoverable even when the user is working from limited interfaces such as mobile.

The governing pattern is:

> **save → print → continue**

The user should not need to ask for the created artifact after execution if the artifact is designated for printing by this contract.

---

## 2. Printing Rule

Immediately after writing an artifact to disk, print it in chat if it is designated as a printable artifact.

This means:

- artifact creation should be followed by immediate artifact echo
- the artifact should be printed in full
- the printed version should be copy-pasteable
- the printed version should match the saved version without paraphrase or truncation

---

## 3. Artifact Priority

For each prompt execution, artifact handling should follow this order:

1. **Prompt file** — saved, not printed
2. **Primary output** — saved and printed
3. **Report / insight / secondary artifact** — saved and printed if required by the prompt
4. **Structured return block** — paths + short summary + next artifact

If output size creates practical limits, the primary output always has highest priority.

---

## 4. What Must Be Printed

Unless a prompt explicitly overrides this, the following should be printed:

- the primary output artifact
- the associated report artifact, if one is required by the prompt and practical output limits allow

Prompt files are not printed because the user already supplied them.

Older artifacts are not reprinted unless explicitly requested.

---

## 5. Printing Format

Each printed artifact must be rendered as a single copy-pasteable fenced markdown block.

### Required wrapper format

1. A level-2 heading containing the file path
2. A **4-backtick fenced markdown block**
3. Full file contents, unmodified
4. Closing 4-backtick fence

### Example shape

## path/to/file.md

````markdown
<full file content>

If multiple printable artifacts are emitted in one turn, separate them with a horizontal rule.

6. Why 4-Backtick Fences Are Required

4-backtick fencing is required because VisionAir artifacts may themselves contain triple-backtick code blocks, diagrams, or examples.

Using 4-backtick outer fences prevents inner triple-backtick content from breaking the printed artifact.

This is mandatory for copy-paste safety.

7. Non-Truncation Rule

The primary output must never be summarized or truncated in place of the full artifact.

If output size becomes a practical constraint:

print the primary output in full
print the report artifact second if space allows
if both cannot be printed safely, print only the primary output and list the remaining artifact paths in the return block

The primary output is always highest priority.

8. Report Rule

If a prompt creates a report artifact, that report should be treated as a printable secondary artifact unless the prompt explicitly says otherwise.

This encourages:

better remote workflow
immediate validation
recoverability from stalled sessions
easier mobile use
9. Required Return Structure

After printable artifacts are emitted, return a short structured summary containing:

primary artifact path
report / insight path(s), if any
one to three sentence summary
next artifact to expect

This should come after the printed artifacts, not before them.

---

## Required Return Printing Format

The Required Return block (per §9) must be emitted as a **single copy-pasteable fenced markdown block**, using the same **4-backtick fence standard** as artifact printing.

This means:

- the Required Return block is printed as one fenced markdown block, never as plain inline text
- the block uses a **4-backtick opening and closing fence** (consistent with artifact printing, per §5 and §6)
- the block appears **after** all printed artifacts in the turn
- the block is **not** split across multiple fenced blocks
- the block remains concise and structured (paths + short summary + next artifact, per §9)

### Why this matters

The Required Return is **execution metadata**, not a saved artifact. It tells the user what was produced, where it lives, and what comes next. Emitting it as plain text has two costs:

- **mobile-safe copying fails** — on mobile and constrained interfaces, selecting structured plain text across multiple lines is error-prone; a fenced block is always copy-safe
- **the boundary between saved artifacts and execution metadata blurs** — fencing the return block keeps it visually and mechanically distinct from the printed artifacts above it

Fencing the Required Return closes both gaps without changing its content or ordering.

### Interaction with existing rules

- **§3 Artifact Priority** is unchanged: the Required Return block remains the fourth and final element of each execution.
- **§5 Printing Format** and **§6 Why 4-Backtick Fences Are Required** continue to govern artifact printing; this section extends the same fencing discipline to the return block itself.
- **§9 Required Return Structure** continues to define *what* the block contains. This section defines *how* it is emitted.

---

10. Conflict Resolution

If there is a conflict between:

immediate artifact safety
output size
number of artifacts

then prioritize in this order:

primary output integrity
copy-paste safety
report printing
summary brevity

If a compromise is required, sacrifice secondary artifact printing first — never the full primary output.

11. Applicability

This contract applies to VisionAir orchestration documents including, but not limited to:

core documents
governance documents
interaction documents
technical foundation documents
reports
correction patches
refinement outputs

unless explicitly superseded by a later governing output contract.

12. Final Rule

VisionAir artifact generation must remain:

save-first
print-safe
copy-pasteable
non-truncated
mobile-resilient
path-explicit

This contract exists to preserve workflow continuity and execution trust across all VisionAir development.