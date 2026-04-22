# VisionAir Wireframe Spec

## Purpose
This document defines the first-session wireframe architecture for VisionAir.

It translates doctrine, user transformation, emotional arc, and screen flow into a prototype-ready structure.

This is a product-shaping document.
It should guide:
- Figma wireframes
- React prototypes
- design system decisions
- Claude Code implementation
- future UX iteration

---

## Product Goal
Help a capable but unclear nontechnical builder move from vague internal potential to a structured, trustworthy, buildable path.

## Primary User
A skilled but unstructured nontechnical person who knows they have something valuable to offer, but does not yet have a clear, trusted path for turning it into something real.

## Core Session Outcome
Generate a **Structured Opportunity Blueprint** with 7 sections:
1. Core Capability
2. Aligned Problem Space
3. Ideal User
4. Transformation Promise
5. Opportunity Form
6. First Buildable Version
7. Guided Path Forward

## Emotional Arc
**Relief -> Recognition -> Alignment -> Belief -> Agency**

---

# 1. Global UX Principles

## Design Tone
The interface should feel:
- calm
- spacious
- intelligent
- premium but warm
- structured, not rigid
- reflective, not robotic

## Product Behavior
The product should:
- present one major task per screen
- maintain visible progress
- feel guided, not interrogative
- reveal synthesis progressively
- allow refinement at trust checkpoints
- never make the user feel behind, judged, or too vague to continue

## Core Interaction Model
Each major step follows this pattern:
1. prompt
2. user response
3. VisionAir reflection or synthesis
4. user confirmation or refinement
5. progression

---

# 2. Session Structure Overview

## Screen Sequence
1. Welcome / Permission
2. Starting Point Selection
3. Seed Prompt
4. Reflection Back
5. Capability Clarification
6. Emerging Capability Pattern
7. Problem Space Discovery
8. Ideal User Builder
9. Transformation Promise
10. Opportunity Form
11. First Buildable Version
12. Blueprint Reveal
13. Guided Path Forward
14. Closing Reflection

---

# 3. Wireframe Spec by Screen

## Screen 1 — Welcome / Permission

### Objective
Reduce pressure and invite honest entry.

### Layout
- top: VisionAir wordmark
- center: headline, short body, primary CTA
- bottom: reassurance line

### Required Content
- headline
- short explanatory body
- primary action
- optional secondary action
- reassuring support line

### Functional Notes
- minimal navigation
- no dashboard chrome
- no account friction if possible
- must feel calm and safe

---

## Screen 2 — Starting Point Selection

### Objective
Let the user begin from what feels truest.

### Layout
- top: progress label
- center: five selection cards
- bottom: reassurance note and continue button

### Required Components
- five selectable cards
- selected state
- continue action
- support note

### Data Captured
- `entry_orientation`

### Functional Notes
- single selection only
- continue disabled until choice is made
- cards should feel meaningful, not survey-like

---

## Screen 3 — Seed Prompt

### Objective
Capture the first real signal.

### Layout
- top: dynamic prompt
- middle: large text response area
- lower: support note
- bottom: continue CTA

### Required Components
- prompt based on entry orientation
- long-form text area
- optional voice input
- optional helper toggle

### Data Captured
- `seed_response`

### Functional Notes
- allow expressive natural-language input
- autosave draft if possible
- avoid forcing structure too early

---

## Screen 4 — Reflection Back

### Objective
Create the first recognition moment.

### Layout
- top: section title
- middle: synthesis panel
- bottom: response actions

### Required Components
- 2–3 synthesized bullets
- response options:
  - yes
  - partly refine
  - not quite
- inline refinement field when needed

### Data Generated
- capability signal
- motivation signal
- problem signal

### Functional Notes
- this is a trust-critical moment
- tone must feel perceptive, not overconfident
- re-synthesis should occur after user correction

---

## Screen 5 — Capability Clarification

### Objective
Reveal value pattern through lived truth.

### Layout
- one question at a time
- top: progress and section title
- center: question and response area
- bottom: back / continue

### Required Questions
- when have you felt most capable?
- what do people come to you for?
- what feels natural to you that is difficult for others?
- what value do you repeatedly create?
- what kind of work or thinking energizes you?

### Data Captured
- `capability_responses[]`

### Functional Notes
- visible progress required
- keep screens uncluttered
- one reusable question component is ideal

---

## Screen 6 — Emerging Capability Pattern

### Objective
Turn answers into structured self-understanding.

### Layout
- top: section title
- center: synthesis card
- lower: refine field
- bottom: CTA group

### Required Components
- pattern summary
- strongest capabilities
- value pattern
- optional one-line identity signal
- refine options

### Data Generated
- `capability_pattern`

### Functional Notes
- preserve user phrasing where possible
- card should feel authored, not generic
- limit initial synthesis to concise, high-signal points

---

## Screen 7 — Problem Space Discovery

### Objective
Find where the capability belongs.

### Layout
- top: framing statement
- center: aligned problem-space cards
- lower: refinement option
- bottom: continue CTA

### Required Components
- three recommended problem-space options
- optional refine path
- follow-up prompt on meaning/aliveness

### Data Captured
- `aligned_problem_space`

### Functional Notes
- cards should explain why each path fits
- user may choose one primary and optionally one secondary
- must reduce fog, not increase options overload

---

## Screen 8 — Ideal User Builder

### Objective
Turn the problem into a person.

### Layout
- left or top: questions
- right or bottom: live user profile card

### Required Components
- user-definition prompts
- live synthesis of ideal user
- edit capability

### Data Generated
- `ideal_user_profile`

### Functional Notes
- live synthesis is important here
- user must feel this is becoming human and real
- avoid market-speak

---

## Screen 9 — Transformation Promise

### Objective
Define before/after movement.

### Layout
- top: section title
- middle: split before/after area
- bottom: synthesized transformation statement

### Required Components
- before prompts
- after prompts
- transformation synthesis block

### Data Generated
- `transformation_promise`

### Functional Notes
- visually emphasize movement
- this is the heart of the product value
- synthesis should be emotionally and practically legible

---

## Screen 10 — Opportunity Form

### Objective
Choose the right container.

### Layout
- top: recommendation rationale
- center: recommended form plus alternatives
- bottom: selection actions

### Required Components
- recommended form card
- alternative form cards
- rationale text

### Data Generated
- `opportunity_form`

### Functional Notes
- recommended option should feel clearly preferred
- avoid too many options
- form must be aligned and buildable

---

## Screen 11 — First Buildable Version

### Objective
Define version one and prevent overbuilding.

### Layout
- top: grounding headline
- middle: short prompts
- lower: version-one synthesis card
- bottom: refine / confirm CTA

### Required Components
- scope prompts
- version-one summary
- “make it smaller” path

### Data Generated
- `v1_definition`

### Functional Notes
- this screen must feel practical and relieving
- constrain without flattening
- help the user move from ambition to buildability

---

## Screen 12 — Blueprint Reveal

### Objective
Deliver the core artifact.

### Layout
- top: reveal headline
- center: 7-section blueprint
- side or top-right: export/save/share actions
- bottom: continue CTA

### Required Sections
1. Core Capability
2. Aligned Problem Space
3. Ideal User
4. Transformation Promise
5. Opportunity Form
6. First Buildable Version
7. Guided Path Forward

### Data Generated
- `structured_opportunity_blueprint`

### Functional Notes
- this should feel premium
- artifact must feel authored
- preserve user truth where possible
- blueprint should be printable/exportable

---

## Screen 13 — Guided Path Forward

### Objective
Turn clarity into motion.

### Layout
- top: headline
- middle: three stacked next-step cards
- bottom: action buttons

### Required Cards
- Immediate
- Near-Term
- Later

### Data Generated
- `guided_path_forward`

### Functional Notes
- next steps must be specific
- no more than 3–5 bullets per category
- avoid overwhelming the user

---

## Screen 14 — Closing Reflection

### Objective
End with dignity and agency.

### Layout
- centered closing statement
- summary copy
- final CTA set

### Required Components
- completion headline
- reinforcing body copy
- reflection line
- final actions

### Functional Notes
- emotionally gentle
- completion, not abandonment
- invite continuation without pressure

---

# 4. Persistent UI Elements

## Header
- VisionAir logo
- progress state
- optional save-and-exit

## Progress Language Examples
- Discovering your signal
- Clarifying your capability
- Aligning your opportunity
- Shaping your first version
- Revealing your blueprint

## Footer Reassurance
- No perfect answers needed
- You can refine as you go
- We are building from truth, not performance
- Clarity comes through structure

---

# 5. Core Synthesis Moments

## Synthesis 1
After seed response  
Goal: reflect first true pattern

## Synthesis 2
After capability questions  
Goal: reveal capability pattern

## Synthesis 3
After problem-space selection  
Goal: articulate aligned problem space

## Synthesis 4
After ideal-user definition  
Goal: define first exact user

## Synthesis 5
After before/after inputs  
Goal: define transformation promise

## Synthesis 6
After version-one prompts  
Goal: define the first buildable version

## Synthesis 7
Blueprint assembly  
Goal: turn user truth into structured artifact

---

# 6. Prototype Data Model

A simple first-pass internal structure may include:

- `entry_orientation`
- `seed_response`
- `signal_reflection`
- `capability_responses`
- `capability_pattern`
- `problem_space_candidates`
- `aligned_problem_space`
- `ideal_user_profile`
- `transformation_promise`
- `opportunity_form`
- `v1_definition`
- `guided_path_forward`
- `structured_opportunity_blueprint`

---

# 7. Prototype Fidelity Recommendation

## Recommended Prototype Level
Start with a **mid-fidelity clickable prototype**.

That means:
- real screen copy
- realistic flow
- believable synthesis states
- real blueprint structure
- export preview

Full AI orchestration is not required at first if the emotional and structural experience can still be tested faithfully.

---

# 8. Success Criteria for the First-Session Prototype

The prototype succeeds if users leave saying:
- I feel clearer
- this understands me surprisingly well
- I can see what I actually have
- this path fits me
- I know what to do next

The prototype fails if users mainly say:
- nice UI
- interesting idea
- cool concept

The product must restore movement.

---

# 9. One-line Internal Product Definition
**VisionAir is a guided intelligence environment that helps capable but unclear people turn what they already carry into a structured, trustworthy path they can begin building.**