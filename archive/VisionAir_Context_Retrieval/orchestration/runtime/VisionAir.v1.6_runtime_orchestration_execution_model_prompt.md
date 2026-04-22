# VisionAir.v1.6 — Runtime Orchestration & Execution Model Prompt

First, write this prompt content to:

docs/orchestration/runtime/VisionAir.v1.6_runtime_orchestration_execution_model_prompt.md

Then execute exactly as written below.

---

## Objective

Create the authoritative **Runtime Orchestration & Execution Model** for VisionAir.

This document must define how VisionAir actually **runs in real time**, including:

- how the system processes user input
- how orchestration loops operate
- how prompts are selected and executed
- how context is retrieved and updated
- how Guided Continuation Mode runs in practice
- how outputs are generated and sequenced
- how performance and responsiveness are maintained

This is the layer that turns VisionAir from a defined system into an **actively operating intelligence**.

This is NOT implementation code.  
This is NOT specific API calls.  
This is NOT infrastructure deployment detail.

This is the governing model for **runtime behavior and execution flow**.

---

## Inputs

- docs/orchestration/core/VisionAir.v1.1_core_intelligence_architecture.md  
- docs/orchestration/interaction/VisionAir.v1.2_interaction_architecture.md  
- docs/orchestration/technical/VisionAir.v1.3_technical_foundation_specification.md  
- docs/orchestration/security/VisionAir.v1.4_security_privacy_and_ip_trust_protocol.md  
- docs/orchestration/context/VisionAir.v1.5_context_engineering_specification.md  
- docs/orchestration/governance/AlignFlow.v1.1_structural_development_architecture.md  
- docs/orchestration/governance/AROD.v1.1_realism_and_validation_architecture.md  
- docs/orchestration/governance/AMO.v1.1_orchestration_and_continuation_architecture.md  
- docs/orchestration/governance/VisionAir_output_contract.md  
- docs/orchestration/governance/VisionAir_report_contract.md  

---

## Required Outputs

### Output 1
Write:

docs/orchestration/runtime/VisionAir.v1.6_runtime_orchestration_execution_model.md  

### Output 2
Write:

docs/orchestration/reports/VisionAir.v1.6_runtime_orchestration_execution_model_report.md  

---

## Requirements

---

### 1. Document Identity

Must include:

- document type  
- project  
- iteration (v1.6)  
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
- VisionAir.v1.5  

---

### 2. Executive Definition

Define VisionAir.v1.6 as:

> the governing system that defines how VisionAir operates in real time — how inputs are processed, how intelligence flows, and how outputs are produced

It must explicitly state that this layer governs:

- execution loops  
- orchestration flow  
- runtime decision-making  
- output sequencing  
- responsiveness and stability  

---

### 3. Core Runtime Loop

Define the primary runtime loop.

At minimum include stages:

1. input capture  
2. seed classification  
3. context retrieval  
4. orchestration decision  
5. output generation  
6. state update  
7. render  

Must define:
- loop triggers  
- loop boundaries  
- when loop re-executes  

---

### 4. Event Types

Define all runtime events:

- user input events  
- clarification answer events  
- branch selection events  
- confirmation events  
- rejection events  
- re-entry events  
- Guided Continuation triggers  

Each must define:
- what triggers it  
- what layer handles it  
- what state changes occur  

---

### 5. Orchestration Flow

Define how AlignFlow, AROD, and AMO operate at runtime.

#### AlignFlow
- determines stage progression  
- controls readiness gating  

#### AROD
- evaluates truth-state  
- detects weakness and contradiction  

#### AMO
- manages branching  
- manages Guided Continuation  
- handles re-ranking  

Define how these interact per cycle.

---

### 6. Prompt Selection Logic

Define how the system selects:

- the next clarification prompt  
- whether to prompt at all  
- when to delay prompting  

Must enforce:

> only one active prompt at a time  

Must define:
- priority resolution  
- fallback behavior  

---

### 7. Guided Continuation Runtime Behavior

Define:

- when Guided Continuation runs  
- how suggestions are generated  
- how many suggestions can exist  
- how repetition is prevented  

Define lifecycle:

- Pending  
- Presented  
- Accepted  
- Modified  
- Rejected  
- Expired  

---

### 8. Output Mode Execution

Define runtime triggers for:

#### Growth Map
- default continuous rendering  

#### Blueprint
- threshold-based generation  

#### Stabilizing Synthesis
- state-based trigger  

Define:
- how output type is selected  
- how outputs are prioritized  

---

### 9. State Update Rules

Define:

- when state is written  
- atomic vs staged updates  
- rollback expectations  
- prevention of invalid state transitions  

Must enforce:

- Confirmed vs Suggested separation  
- no silent state mutation  

---

### 10. Re-Entry Execution Flow

Define:

- what happens when a user returns  
- how system resumes  
- how context is refreshed  
- how next prompt is recalculated  

Must preserve:
- continuity  
- correctness  
- trust-state  

---

### 11. Performance & Responsiveness

Define expectations for:

- latency boundaries  
- partial rendering  
- async processing  
- user-perceived responsiveness  

Must include:

> system must feel continuous, not blocked  

---

### 12. Failure Modes

Define:

- incomplete context  
- conflicting state  
- missing data  
- invalid transitions  

Define system behavior for each.

---

### 13. Execution Constraints

Must explicitly exclude:

- API-level design  
- model provider selection  
- infrastructure configuration  
- threading / async implementation specifics  

---

### 14. Success Criteria

VisionAir.v1.6 succeeds when:

- system behaves consistently  
- prompts feel intelligent and timed correctly  
- outputs feel responsive  
- no state corruption occurs  
- Guided Continuation works without confusion  
- re-entry works seamlessly  

---

### 15. Next Artifact

Define:

**VisionAir.v1.7 — UI / Visual System Architecture**

Must cover:
- visual language  
- map rendering system  
- motion and animation rules  
- visual state encoding  

---

## Output Contract Compliance

- save prompt  
- save primary artifact  
- print primary artifact  
- save report  
- print report if feasible  
- return structured block  

---

## Required Return

Return:

1. primary path  
2. report path  
3. confirmation of:
   - runtime loop  
   - orchestration logic  
   - prompt selection  
   - Guided Continuation execution  
   - output execution  

4. one-sentence statement of what VisionAir.v1.6 adds beyond VisionAir.v1.5
