# VisionAir.v1.5 — Context Engineering Specification Prompt

First, write this prompt content to:

docs/orchestration/context/VisionAir.v1.5_context_engineering_specification_prompt.md

Then execute exactly as written below.

---

## Objective

Create the authoritative **Context Engineering Specification** for VisionAir.

This document must define how VisionAir:

- remembers project state over time  
- retrieves the right context at the right moment  
- preserves truth-status distinctions (Confirmed vs Suggested vs Derived)  
- supports Guided Continuation Mode without drift  
- enables re-entry continuity  
- prevents contradiction drift  
- avoids context overload while maintaining intelligence quality  

This is the layer that transforms VisionAir into a **coherent, persistent intelligence system**.

This is NOT implementation.  
This is NOT prompt engineering detail.  
This is NOT model selection.  

This is the governing specification for **memory, retrieval, and reasoning continuity**.

---

## Inputs

- docs/orchestration/core/VisionAir.v1.1_core_intelligence_architecture.md  
- docs/orchestration/interaction/VisionAir.v1.2_interaction_architecture.md  
- docs/orchestration/technical/VisionAir.v1.3_technical_foundation_specification.md  
- docs/orchestration/security/VisionAir.v1.4_security_privacy_and_ip_trust_protocol.md  
- docs/orchestration/governance/AlignFlow.v1.1_structural_development_architecture.md  
- docs/orchestration/governance/AROD.v1.1_realism_and_validation_architecture.md  
- docs/orchestration/governance/AMO.v1.1_orchestration_and_continuation_architecture.md  
- docs/orchestration/governance/VisionAir_output_contract.md  
- docs/orchestration/governance/VisionAir_report_contract.md  

---

## Required Outputs

### Output 1
Write:

docs/orchestration/context/VisionAir.v1.5_context_engineering_specification.md  

### Output 2
Write:

docs/orchestration/reports/VisionAir.v1.5_context_engineering_specification_report.md  

---

## Requirements

---

### 1. Document Identity

The document must include:

- document type  
- project  
- iteration (v1.5)  
- phase  
- date  
- runtime class  
- status  
- governed by  

Must explicitly inherit from:

- VisionAir.v1.1  
- VisionAir.v1.2  
- VisionAir.v1.3  
- VisionAir.v1.4  

---

### 2. Executive Definition

Define VisionAir.v1.5 as:

> the governing system that ensures VisionAir remembers correctly, retrieves correctly, and reasons coherently over time  

It must explicitly state that this layer governs:

- memory fidelity  
- retrieval precision  
- context prioritization  
- continuity  
- contradiction detection support  

---

### 3. Context Class Model

Define all context types:

- seed context  
- confirmed user truth  
- suggested system content  
- derived summaries  
- branch history  
- clarification history  
- Guided Continuation suggestions  
- blueprint history  
- synthesis history  
- re-entry context  

Each must define:

- role  
- persistence requirement  
- sensitivity level (aligned with VisionAir.v1.4)  

---

### 4. Persistent vs Ephemeral Context

#### Persistent
- seed  
- confirmed content  
- branch structure  
- unresolved weak regions  
- suggestion states  
- ranking history  

#### Ephemeral
- zoom state  
- UI focus  
- draft inputs  
- transient reasoning candidates  

**Rule:**

> Ephemeral context must never mutate persistent state  

---

### 5. Retrieval Strategy

Define context retrieval for:

- clarification generation  
- branch ranking  
- Guided Continuation  
- synthesis generation  
- blueprint generation  
- re-entry  

Must include:

- minimal sufficient context principle  
- relevance-based retrieval  
- avoidance of full-history loading  

---

### 6. Context Window Prioritization

#### Tier 1
- seed  
- active region  
- confirmed truths  
- branch ranking  

#### Tier 2
- recent clarifications  
- relevant suggestions  
- active weak regions  

#### Tier 3
- collapsed branches  
- older synthesis  

**Rule:**

> Context selection must be intentional, not exhaustive  

---

### 7. Summary / Compaction Rules

Define:

- when compaction is allowed  
- what must never be compacted:
  - seed  
  - confirmed truths  
  - truth-status labels  

- summaries must preserve:
  - provenance  
  - truth-status  

- summaries must always be labeled **Derived**  

---

### 8. Branch History Retrieval

Define:

- when collapsed branches resurface  
- when rejected paths matter  
- how branch history influences decisions  
- how to avoid stale branch noise  

---

### 9. Contradiction Drift Prevention

Define:

- retrieval of relevant confirmed truths  
- detection of conflicting states  
- no silent overwrites  

**Rule:**

> Contradiction is surfaced, not resolved automatically  

---

### 10. Re-Entry Context Logic

Define:

- what loads on re-entry  
- how "where user left off" is determined  
- how next prompt is recomputed  
- how Guided Continuation outputs are surfaced  

Must preserve VisionAir.v1.2 interaction contract.

---

### 11. Guided Continuation Context Rules

Define:

- suggestion persistence  
- lifecycle handling  
- retrieval priority  
- influence of rejected suggestions  
- prevention of repetition loops  

---

### 12. Truth-Status Preservation

Define preservation of:

- Confirmed  
- Suggested  
- Derived  
- Weak  
- Stable  

**Rule:**

> Context operations must never collapse truth-status distinctions  

---

### 13. Cross-Project Context Boundary

Define:

- no cross-project memory  
- no shared inference  
- no context reuse  

**Rule:**

> Each project is an isolated intelligence space  

---

### 14. Context Decay / Freshness

Define:

- decay of stale suggestions  
- collapse of old branches  
- regeneration of summaries  

**Rule:**

> Context must remain relevant, not just preserved  

---

### 15. Constraints

Must explicitly exclude:

- database schema  
- storage implementation  
- retrieval algorithms  
- model configuration  
- caching architecture  

---

### 16. Success Criteria

VisionAir.v1.5 succeeds when:

- memory is correct and stable  
- retrieval is precise  
- no silent contradiction drift  
- Guided Continuation remains coherent  
- re-entry feels continuous  
- truth-status is preserved  
- context is not noisy or bloated  

---

### 17. Next Artifact

Define:

**VisionAir.v1.6 — Runtime Orchestration & Execution Model**

Must cover:
- runtime loops  
- orchestration behavior  
- prompt execution logic  
- performance constraints  

---

## Output Contract Compliance

- save prompt  
- save primary artifact  
- print primary artifact  
- save report  
- print report (if size allows)  
- return structured block  

---

## Required Return

Return:

1. primary path  
2. report path  
3. confirmation of:
   - context model  
   - retrieval rules  
   - persistence logic  
   - Guided Continuation handling  
   - truth-status preservation  

4. one-sentence statement of what VisionAir.v1.5 adds beyond VisionAir.v1.4
