# VisionAir.v1.3 — Technical Foundation Specification Prompt

First, write this prompt content to:

docs/orchestration/technical/VisionAir.v1.3_technical_foundation_specification_prompt.md

Then execute exactly as written below.

---

## Objective

Create the authoritative **Technical Foundation Specification** for VisionAir.

This document must translate VisionAir's governed intelligence architecture and interaction architecture into a coherent technical system design that is strong enough to guide implementation, while remaining above the level of final code, exact package selection, or database schema.

This document must define:

- frontend architecture direction
- backend architecture direction
- persistence model
- project memory model
- context model
- AI orchestration boundaries
- state model for projects, regions, branches, and outputs
- technical boundaries and non-goals
- security / privacy / IP awareness as a required future layer

This is NOT implementation.  
This is NOT exact package/library selection.  
This is the technical architecture layer that sits between VisionAir's interaction logic and future build execution.

---

## Inputs

- docs/orchestration/core/VisionAir.v1.1_core_intelligence_architecture.md
- docs/orchestration/governance/AlignFlow.v1.1_structural_development_architecture.md
- docs/orchestration/governance/AROD.v1.1_realism_and_validation_architecture.md
- docs/orchestration/governance/AMO.v1.1_orchestration_and_continuation_architecture.md
- docs/orchestration/governance/VisionAir_output_contract.md
- docs/orchestration/interaction/VisionAir.v1.2_interaction_architecture.md
- docs/orchestration/interaction/VisionAir.v1.2_interaction_architecture_report.md

---

## Required Outputs

### Output 1
Write:

docs/orchestration/technical/VisionAir.v1.3_technical_foundation_specification.md

### Output 2
Write:

docs/orchestration/technical/VisionAir.v1.3_technical_foundation_specification_report.md

---

## Requirements

---

### 1. Document Identity

The primary document must open in the same structured style used by the existing VisionAir artifacts, including:

- document type
- project
- iteration
- phase
- date
- runtime class
- status
- governed by

The governance section must explicitly reference:

- AlignFlow (Alignment Flow)
- AROD (Adaptive Realism and Opportunity Discipline)
- AMO (Adaptive Multithreaded Orchestration)

It must also explicitly inherit from:
- VisionAir.v1.1
- VisionAir.v1.2

---

### 2. Executive Definition

Define VisionAir.v1.3 as the layer that converts governed intelligence and governed interaction into a technically coherent system architecture.

It must explicitly state that this document governs:

- technical shape of the product
- system boundaries
- memory and continuity model
- project persistence assumptions
- frontend/backend responsibility split
- context continuity expectations
- future implementation constraints

---

### 3. Technical Direction

The document must explicitly recommend a technical direction for VisionAir v0.1.

#### 3.1 Frontend direction
Define Flutter / Dart as the recommended frontend direction.

Explain why this fits VisionAir:
- mobile integration
- custom visual interaction
- zoomable map behavior
- shared codebase potential
- greenfield product suitability

#### 3.2 Backend / persistence direction
Define Firebase as the recommended early-stage backend/persistence direction.

Explain why this fits VisionAir:
- authentication
- project/session persistence
- cloud storage needs
- fast greenfield iteration
- compatibility with Flutter
- support for continuity across devices/sessions

This section must be explicit but still remain architecture-level, not implementation-level.

---

### 4. System Layer Model

Define the major technical layers of VisionAir.

At minimum include:

- client / frontend layer
- interaction-state layer
- orchestration / intelligence layer
- persistence layer
- context / memory layer
- output generation layer

For each layer, define:
- what it is responsible for
- what it must not own
- how it interacts with adjacent layers

---

### 5. Project State Model

Define the core technical state objects VisionAir must preserve for each user project.

At minimum include:

- seed
- seed type
- region set
- region states
- weak-region reasons
- clarification history
- branch set
- branch ranking state
- Guided Continuation suggestions
- blueprint state
- stabilizing synthesis history
- re-entry summary state

Do not specify database tables or exact schemas. Stay at the state-model level.

---

### 6. Region State Persistence Model

Define how region states should be treated technically.

Include:
- what region states exist
- which region changes should persist
- which region changes may be ephemeral
- how user confirmation differs from system suggestion in storage logic
- why truth-status persistence matters for trust

This section must preserve the distinctions established in VisionAir.v1.1 and VisionAir.v1.2.

---

### 7. Context Engineering Base Specification

This is one of the most important sections.

Define the first formal context model for VisionAir.

Must include:

- what context is persistent
- what context is ephemeral
- what context is user-confirmed
- what context is system-suggested
- what context must be summarized for continuity
- what context must survive re-entry
- how branch history should remain legible
- how the system avoids contradiction drift over time

This section should establish the need for a later dedicated context-engineering artifact, but it must already define the baseline.

---

### 8. Guided Continuation Technical Implications

Define what the technical system must preserve in order for Guided Continuation Mode to work correctly.

Include:
- suggested continuation state
- reversibility metadata
- reason-for-suggestion metadata
- confidence metadata
- re-entry rendering requirements
- user accept / modify / reject pathways

This section must treat Guided Continuation Mode as a core system requirement, not a UI extra.

---

### 9. Output Mode Technical Requirements

Define what the technical foundation must support for each VisionAir output mode.

#### 9.1 Growth Map
What data/state it requires  
What must persist  
What must be recomputed

#### 9.2 Blueprint
What minimum maturity/state is required  
What must be derivable from stored project state

#### 9.3 Stabilizing Synthesis
What context it must draw from  
Why sequence, compression, and user state matter

The document must explicitly preserve the rule that compression is a first-class system behavior.

---

### 10. Re-Entry and Continuity Requirements

Define the technical requirements for allowing users to leave and return safely.

Include:
- project continuity across sessions
- restoration of most recent meaningful state
- preservation of unresolved weak regions
- preservation of Guided Continuation suggestions
- freshness of next-most-important clarification prompt
- continuity of branch ranking and blueprint status

This section should make it clear that re-entry quality is part of the product, not just convenience.

---

### 11. AI Orchestration Boundaries

Define the boundary between:

- deterministic application state
- governed orchestration logic
- AI-generated suggestions / synthesis

Clarify that VisionAir must not allow AI outputs to silently overwrite:
- confirmed user truths
- explicit state decisions
- region truth-status
- accepted path choices

This section is critical for product trust.

---

### 12. Security / Privacy / IP Baseline

Do NOT create the full security protocol yet.

But the document must explicitly acknowledge that VisionAir will store sensitive user-generated business creation context and therefore requires a future security / privacy / IP trust layer.

At minimum define that the technical foundation must anticipate protection of:
- user-created ideas
- product concepts
- project evolution history
- branch exploration history
- personal or strategic inputs

This section should identify the need for a dedicated next-phase security artifact.

---

### 13. Tooling Guidance (Architecture Level Only)

At architecture level only, define the recommended role of external implementation-grounding tools.

Include:
- Context7 as recommended documentation-grounding support during implementation
- note that package / library grounding belongs in build workflow, not in product identity

Do NOT specify exact UI libraries or graph packages yet.

---

### 14. Constraints

Explicitly state what VisionAir.v1.3 does NOT define.

Must exclude:
- final database schema
- exact Firebase collections/documents
- final package selections
- exact UI toolkit/library decisions
- production security implementation
- full context-engineering implementation detail
- exact prompt wording for runtime AI calls
- deployment infrastructure detail

This document must remain at the technical-foundation level only.

---

### 15. Success Criteria

Define what it means for VisionAir.v1.3 to succeed.

At minimum include:
- frontend direction is clear
- backend direction is clear
- project state model is coherent
- region state persistence logic is coherent
- Guided Continuation requirements are technically supported
- re-entry continuity is technically supported
- context continuity baseline is established
- future implementation can proceed without guessing the system shape

---

### 16. Next Artifact

The primary document must end by identifying the next highest-leverage artifact as:

**VisionAir.v1.4 — Security, Privacy, and IP Trust Protocol**

and briefly state that it should define:
- trust boundaries
- user data ownership expectations
- confidentiality handling
- protection of user-generated business IP
- security expectations for stored project state

---

## Report Requirements

The report artifact must:

1. confirm what VisionAir.v1.3 established
2. summarize the chosen technical direction
3. confirm inheritance from VisionAir.v1.1 and VisionAir.v1.2
4. confirm that Flutter / Firebase were established as recommended architectural directions
5. confirm that context continuity and Guided Continuation technical support were formalized
6. identify VisionAir.v1.4 as the next artifact

It must not rewrite or replace the primary document.

---

## Output Contract Compliance

This prompt must follow the VisionAir Output Contract:

- save the prompt file
- save the primary output
- print the primary output in full
- save the report artifact
- print the report artifact in full if practical output limits allow
- return the structured return block last

Prompt file is saved, not printed.

---

## Required Return

Return:

1. primary specification path
2. report path
3. confirmation that VisionAir.v1.3 defines:
   - frontend direction
   - backend direction
   - project state model
   - context baseline
   - Guided Continuation technical requirements
   - re-entry continuity requirements
   - AI orchestration boundaries
4. one-sentence statement of what VisionAir.v1.3 adds beyond VisionAir.v1.2
