# VisionAir.v1.2 — Interaction Architecture Prompt

First, write this prompt content to:

docs/orchestration/interaction/VisionAir.v1.2_interaction_architecture_prompt.md

Then execute exactly as written below.

---

## Objective

Create the authoritative **Interaction Architecture** for VisionAir.

This document must translate the foundational intelligence architecture into an actual product experience by defining:

- what the user sees first
- how seed classification behaves
- how the map begins and grows
- how regions appear and mature
- how weak regions are surfaced
- when clarification prompts appear
- how Guided Continuation Mode behaves in the interface
- when Blueprint mode appears
- when Stabilizing Synthesis mode appears

This is NOT implementation.  
This is NOT UI styling.  
This is the interaction logic layer that sits between VisionAir's core intelligence and future technical execution.

---

## Inputs

- docs/orchestration/core/VisionAir.v1.1_core_intelligence_architecture.md
- docs/orchestration/governance/AlignFlow.v1.1_structural_development_architecture.md
- docs/orchestration/governance/AROD.v1.1_realism_and_validation_architecture.md
- docs/orchestration/governance/AMO.v1.1_orchestration_and_continuation_architecture.md

---

## Required Output

Write:

docs/orchestration/interaction/VisionAir.v1.2_interaction_architecture.md

---

## Requirements

---

### 1. Document Identity

The document must open in the same structured style used for the foundational VisionAir docs, including:

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

---

### 2. Executive Definition

Define VisionAir.v1.2 as the layer that converts VisionAir's core intelligence into a usable, legible, interactive product experience.

It must explicitly state that this document governs:

- first contact with the seed
- map emergence behavior
- interaction timing
- prompt timing
- mode transitions
- user re-entry continuity

---

### 3. First User Experience

Define exactly what happens when a user first enters VisionAir.

Include:

- the first input screen
- what the user is asked to provide
- minimum required input
- optional supporting input
- how the seed is visually locked
- what the user should feel in the first 30 seconds

This should reflect the current product metaphor:
- seed
- roots
- first visible growth
- branches
- maturity

---

### 4. Seed Classification Behavior

Define how the interaction layer should represent seed classification.

Include:
- idea seed
- problem seed
- capability seed

Clarify whether the user sees the classification explicitly, implicitly, or optionally.

Define what changes in the interface depending on seed type.

---

### 5. Growth Model in Interaction Terms

Translate the previously established growth model into interaction behavior.

Must include all five states:

1. Seed State
2. Root State
3. First Sample State
4. Branching State
5. Maturity State

For each state, define:
- what the user sees
- what is interactive
- what is not yet interactive
- what backend layer is most active
- what triggers transition to the next state

---

### 6. Region Emergence Rules

Define how regions appear around the seed.

Separate:

- universal regions
- conditional regions

Specify:
- which regions appear in the first ring
- which remain latent until later
- how regions visually indicate maturity
- how regions visually indicate weakness
- how the system avoids overwhelming the user

---

### 7. Weak Region Interaction Rules

Define exactly how weak regions behave in the interface.

Include:
- how weak regions are visually signaled
- how the user discovers why they are weak
- when weak regions trigger a clarification prompt
- what happens when the user answers
- how a weak region becomes stronger

This section must distinguish between:
- weak
- suggested
- confirmed
- stable
- execution-ready

---

### 8. Clarification Prompt Timing

This is one of the most important sections.

Define:

- when the system should prompt
- how many prompts should appear at once
- how prompts are anchored to regions
- how prompt priority is decided
- how ranked user answers affect pathing
- how the system behaves when the user skips a prompt

The document must preserve the rule:
> ask only the next most important clarification question

---

### 9. Guided Continuation Mode in the Interface

Define how Guided Continuation Mode appears and behaves for the user.

Must include:

- what triggers it
- what the user sees when they return
- how suggested continuations are labeled
- how the user confirms / modifies / rejects them
- how the system preserves trust without freezing momentum

Make explicit that:
- suggestions are not confirmations
- continuation is useful but epistemically honest

---

### 10. Branch Visibility and Path Interaction

Define how branching becomes visible in the product.

Include:
- when branches first appear
- how many should be shown
- how branches are compared
- how one branch becomes recommended
- how branch re-ranking is represented after stronger clarification
- how branch clutter is prevented

The document must preserve the rule that branches are strategic, not decorative.

---

### 11. Output Mode Triggers

Define exactly when each of the three output modes is triggered.

#### 11.1 Growth Map
When it is primary  
What it should contain  
When it should remain the dominant experience

#### 11.2 Blueprint
When it becomes available  
What minimum maturity is required  
How it should relate to the map

#### 11.3 Stabilizing Synthesis
When VisionAir should compress rather than expand  
What user state or system state should trigger it  
How it should appear in the experience

This section must explicitly incorporate the lesson that elegant compression is a core product capability.

---

### 12. Zoom and Navigation Behavior

Define the interaction logic for the zoomable map.

Include:
- zoomed-out view
- mid-level view
- zoomed-in local region view
- how roots vs branches should be understood spatially
- how the user returns to the core seed
- what information appears at each zoom level

Do not specify visual styling libraries or implementation details. This is interaction behavior only.

---

### 13. Re-Entry and Continuity

Define how the experience should behave when a user returns to an existing project.

Include:
- what is shown first on re-entry
- how the system reminds the user where they were
- how unresolved weak regions are surfaced
- how Guided Continuation outputs are presented
- how the system preserves momentum across sessions

This section should anticipate future persistence and context engineering without defining the technical stack yet.

---

### 14. Success Criteria

Define what it means for the interaction architecture to succeed.

At minimum include:
- the user quickly understands that the idea is becoming structured
- weak regions feel helpful, not punishing
- prompts feel intelligent, not noisy
- branching creates clarity, not chaos
- Guided Continuation Mode feels collaborative, not presumptuous
- Stabilizing Synthesis feels orienting, not reductive

---

### 15. Constraints

Explicitly state what VisionAir.v1.2 does NOT define.

Must exclude:
- Flutter implementation
- Firebase data structures
- security architecture
- exact UI toolkit decisions
- final visual design system
- animation libraries
- database schema

This document must stay at the interaction-logic layer only.

---

### 16. Next Artifact

The document must end by identifying the next highest-leverage artifact as:

**VisionAir.v1.3 — Technical Foundation Specification**

and briefly state that it should translate VisionAir.v1.2 into:
- frontend architecture
- backend architecture
- persistence model
- context model
- technical boundaries

---

## Required Return

Return:

1. interaction architecture path
2. confirmation that it defines:
   - first user input flow
   - seed classification behavior
   - region emergence
   - weak region behavior
   - clarification timing
   - Guided Continuation Mode
   - branch interaction
   - output mode triggers
3. one-sentence statement of what VisionAir.v1.2 adds beyond VisionAir.v1.1
