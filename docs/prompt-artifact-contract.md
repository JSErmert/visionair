# Prompt Artifact Contract

## Version
v1.0.0

---

## Purpose
Define how execution prompts are generated, sealed, and handed off within the VisionAir system.

This contract governs the transition between:
- selecting the next move (Highest-Leverage Move Contract)
- executing the move (code pass)
- validating and reporting (Report Contract)

Its purpose is to ensure that every execution prompt is:
- structurally correct
- complete
- copyable
- non-drifting
- and faithful to system state and governance

---

## Core Principle

> When in prompt-generation mode, the system must produce an execution artifact, not a conversation.

---

## Invocation

The contract is activated by explicit calls such as:

- **Create sealed execution artifact for vX.Y.Z**
- **Enter prompt-generation mode for vX.Y.Z**

These calls MUST NOT:
- execute the pass
- modify code
- write reports

They ONLY generate the sealed execution artifact.

---

## Output Rule (Non-Negotiable)

When this contract is active:

- Output MUST be exactly **one fenced markdown artifact**
- No text, explanation, or commentary may appear before the artifact
- The artifact must be:
  - complete
  - self-contained
  - copyable
  - execution-ready

Violation of this rule constitutes output drift.

---

## Required Artifact Contents

Every sealed execution artifact MUST include:

1. **Title and Version**
2. **Purpose**
3. **Trigger (why this pass is being executed)**
4. **State Observed (pre-execution system state)**
5. **Scope (files and surfaces to modify)**
6. **Explicit Code Changes or Actions**
7. **Non-Scope (what must NOT be changed)**
8. **Execution Instructions**
9. **Validation Requirements**
10. **Success Conditions**
11. **Stopping Condition (explicitly: do not execute in this mode)**

The artifact must be executable without relying on chat context.

---

## Forbidden Behaviors

When in prompt-generation mode, the system MUST NOT:

- Produce multiple markdown blocks
- Include commentary before the artifact
- Mix explanation with the artifact
- Generate partial or incomplete instructions
- Claim validation or execution has occurred
- Pre-write validation results
- Modify system state
- Drift into conversational or advisory tone

---

## Human Gate Rule

Prompt-generation mode ends at the artifact.

After generation:
- The system MUST stop
- The artifact is handed off for external execution
- Execution only occurs after user confirmation

This creates a controlled boundary between:
- system planning
- system execution

---

## Re-Entry Validation Rule

When execution results are returned, the system MUST:

1. Compare execution against the sealed artifact
2. Verify scope discipline (no unintended changes)
3. Verify adherence to all active contracts
4. Validate that outcomes match actual behavior (not assumptions)
5. Confirm that no validation claims were fabricated
6. Determine if the next move remains correct

Only after this validation may a report be written.

---

## Authority

This contract operates in coordination with:

- **Highest-Leverage Move Contract**
  - Defines *what* to do next

- **Prompt Artifact Contract (this document)**
  - Defines *how the move is expressed and handed off*

- **Structural Constraint Layer**
  - Governs behavior of synthesis outputs

- **Report Contract**
  - Defines how execution is recorded after completion

---

## System Role

This contract introduces a new system layer:

**Prompt Generation Layer**

The system now operates as:

1. State → identify bottleneck  
2. Determine highest-leverage move  
3. Generate sealed execution artifact (this contract)  
4. Human confirmation  
5. Execute pass  
6. Validate execution  
7. Record via report  

---

## Failure Mode Definition

A prompt-generation failure occurs if:

- The artifact is not sealed
- The artifact is not copyable
- The artifact is incomplete
- The artifact includes pre-execution assumptions
- The artifact deviates from system state or governance

---

## Success Condition

The contract is successful when:

- Every pass begins with a sealed, correct artifact
- No execution occurs without a validated prompt
- No drift occurs between intent and execution
- All future passes follow the same structure reliably

---

## Final Statement

This contract ensures that:

> Execution is governed not just by decision quality, but by artifact fidelity.

The system no longer depends on memory or interpretation for execution.

It depends on structure.
