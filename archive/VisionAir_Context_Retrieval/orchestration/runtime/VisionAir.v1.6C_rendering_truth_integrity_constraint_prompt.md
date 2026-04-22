# VisionAir.v1.6C — Rendering & Truth Integrity Constraint Prompt

First, write this prompt content to:

docs/orchestration/runtime/VisionAir.v1.6C_rendering_truth_integrity_constraint_prompt.md

Then execute exactly as written below.

---

## Objective

Create a binding **Constraint Pass (C Pass)** that formalizes the invariants connecting:

- runtime execution (VisionAir.v1.6)
- interaction behavior (VisionAir.v1.2)
- context discipline (VisionAir.v1.5)
- trust model (VisionAir.v1.4)

This pass must ensure that:

> **rendering performance, responsiveness, and UI behavior can never violate truth-state integrity**

This is a **cross-layer invariant**, not a UI preference.

This pass exists to prevent:

- blocking UI that encourages unsafe optimizations
- Suggested content being perceived or treated as Confirmed
- loss of authorship clarity
- silent truth-state collapse due to rendering shortcuts

---

## Inputs

- docs/orchestration/interaction/VisionAir.v1.2_interaction_architecture.md  
- docs/orchestration/technical/VisionAir.v1.3_technical_foundation_specification.md  
- docs/orchestration/security/VisionAir.v1.4_security_privacy_and_ip_trust_protocol.md  
- docs/orchestration/context/VisionAir.v1.5_context_engineering_specification.md  
- docs/orchestration/runtime/VisionAir.v1.6_runtime_orchestration_execution_model.md  
- docs/orchestration/governance/AlignFlow.v1.1_structural_development_architecture.md  
- docs/orchestration/governance/AROD.v1.1_realism_and_validation_architecture.md  
- docs/orchestration/governance/AMO.v1.1_orchestration_and_continuation_architecture.md  

---

## Required Outputs

### Output 1
Write:

docs/orchestration/runtime/VisionAir.v1.6C_rendering_truth_integrity_constraint.md  

### Output 2
Write:

docs/orchestration/reports/VisionAir.v1.6C_rendering_truth_integrity_constraint_report.md  

---

## Requirements

---

### 1. Document Identity

Must include:

- document type: Constraint Pass (C Pass)  
- project  
- iteration (v1.6C)  
- phase  
- runtime class  
- status  
- governed by  

Must inherit from:
- VisionAir.v1.2  
- VisionAir.v1.3  
- VisionAir.v1.4  
- VisionAir.v1.5  
- VisionAir.v1.6  

---

### 2. Executive Definition

Define this document as:

> the governing constraint that binds rendering behavior to truth-state integrity across all VisionAir layers

It must explicitly state:

- rendering speed must not degrade system truth
- UI behavior must reflect epistemic state accurately
- runtime performance optimizations are subordinate to truth preservation

---

### 3. Partial Rendering Invariant

Define:

> **State must render immediately; content may resolve later**

Must include:

- state changes render before AI completion
- placeholders must exist for pending content
- rendering must not block on AI inference
- UI must reflect real state transitions, not final content only

---

### 4. Truth-State Visibility Invariant

Define that every visible content unit must clearly communicate:

- Confirmed  
- Suggested  
- Derived  
- Weak  
- Stable  

Must include:

- visual ambiguity is not allowed  
- truth-state must be visible at first render  
- labels must persist across transitions  

---

### 5. Combined System Rule

Define the core invariant:

> **Rendering performance optimizations must never alter, blur, or collapse truth-state distinctions**

This must be explicitly stated as **non-negotiable**.

---

### 6. Forbidden Behaviors

Explicitly forbid:

- rendering Suggested content without labeling  
- showing AI output as if Confirmed  
- blocking UI until AI completes  
- silently promoting Suggested → Confirmed  
- hiding truth-state distinctions for visual simplicity  
- replacing placeholders with unvalidated content  

---

### 7. Placeholder Requirements

Define:

- placeholder states must exist for:
  - suggestions
  - synthesis outputs
- placeholders must carry truth-state labeling
- placeholders must not imply completion

---

### 8. Runtime Interaction Binding

Bind this constraint to VisionAir.v1.6:

- partial rendering must follow runtime loop  
- async inference must not delay render  
- state updates must precede content updates  

---

### 9. Trust Model Binding

Bind this constraint to VisionAir.v1.4:

- truth-state visibility protects authorship  
- incorrect rendering breaks IP clarity  
- mislabeling is a trust violation  

---

### 10. Context Model Binding

Bind this constraint to VisionAir.v1.5:

- truth-status must persist through retrieval  
- summaries must preserve labels  
- rendering must not collapse context distinctions  

---

### 11. UI Design Constraint for v1.7

Explicitly state:

> VisionAir.v1.7 must design all visual systems under this constraint

Including:

- node rendering  
- animations  
- transitions  
- state indicators  

---

### 12. Constraints

Do NOT define:

- visual styling  
- colors  
- animations  
- component libraries  

This is a **behavioral constraint**, not a UI design spec.

---

### 13. Success Criteria

This pass succeeds when:

- UI never blocks for AI  
- truth-state is always visible  
- users can distinguish authorship at all times  
- performance optimizations do not degrade correctness  
- runtime and UI remain aligned  

---

### 14. Next Artifact

Confirm continuation to:

**VisionAir.v1.7 — UI / Visual System Architecture**

---

## Output Contract Compliance

- save prompt  
- save primary artifact  
- print primary artifact  
- save report  
- print report  
- return structured block  

---

## Required Return

Return:

1. primary path  
2. report path  
3. confirmation of:
   - partial rendering invariant  
   - truth-state visibility invariant  
   - combined rule enforcement  
4. one-sentence statement of what this pass adds to VisionAir.v1.6
