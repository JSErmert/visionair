# VisionAir.v1.2 — Interaction Architecture

**Document type:** Foundational interaction architecture  
**Project:** VisionAir  
**Iteration:** VisionAir.v1.2  
**Phase:** Interaction-layer definition  
**Date:** 2026-04-16  
**Runtime class:** conceptual_foundation  
**Status:** authoritative_draft  

**Governed by:**
- **AlignFlow** (Alignment Flow) — phased emergence of regions, readiness sequencing, growth-state maturation as it expresses through the interface
- **AROD** (Adaptive Realism and Opportunity Discipline) — weakness signaling, truth-status discipline at the surface, prompt-trigger thresholds, contradiction visibility
- **AMO** (Adaptive Multithreaded Orchestration) — branch surfacing, suggestion labeling, Guided Continuation Mode behavior, re-ranking, reconvergence

**Inherits from:**
- VisionAir.v1.1 — Core Intelligence Architecture (authoritative; binding unless explicitly superseded)

---

## 1. Executive Definition

**VisionAir.v1.2 — Interaction Architecture** is the layer that converts VisionAir's core intelligence into a usable, legible, interactive product experience.

Where VisionAir.v1.1 defines *what VisionAir thinks* and *how it reasons*, VisionAir.v1.2 defines *what the user sees, when, why, and how they participate in that reasoning*.

This document governs:

- **first contact with the seed** — how the user enters and how the system responds
- **map emergence behavior** — the visible birth and growth of structure around the seed
- **interaction timing** — when the system invites the user to act, and when it stays quiet
- **prompt timing** — when clarification appears, how it is anchored, and how priority is decided
- **mode transitions** — how the experience moves between Growth Map, Blueprint, and Stabilizing Synthesis
- **user re-entry continuity** — how the system remembers, re-orients, and re-engages on return

VisionAir.v1.2 is the interaction-logic layer. It sits *above* the governing intelligence (AlignFlow, AROD, AMO, VisionAir.v1.1) and *below* technical execution (frontend, backend, persistence, design system).

It defines behavior, not implementation.

---

## 2. Why This Document Exists

VisionAir.v1.1 established that VisionAir is a governed visual intelligence — but a governed intelligence with no interaction layer is unusable. The user must be able to:

- begin a seed without friction
- watch structure emerge in a way that feels meaningful, not magical
- trust what is suggested vs. what is confirmed
- be guided to the next most useful action
- return without losing momentum

This document is the binding contract for those behaviors. All future interaction work — flows, surfaces, prompts, transitions, re-entry logic — must inherit from VisionAir.v1.2 unless explicitly superseded.

---

## 3. First User Experience

### 3.1 The First Input Screen

When the user first enters VisionAir, they encounter a single, intentionally minimal input surface.

The screen contains:
- a single short framing line (e.g. *"What is the seed?"*)
- one open input field
- a small, optional secondary affordance for supporting context
- a single primary action to plant the seed

There is no dashboard, no tutorial overlay, no template gallery, no menu. The user is given one job: bring the seed.

### 3.2 What the User Is Asked to Provide

**Minimum required input:** a single statement — an idea, a problem, or a capability — in the user's own language. No structure, no length requirement, no taxonomy selection. The user is not asked to classify their own seed.

**Optional supporting input:** a short secondary field for context the user already knows ("who is this for?", "what's the situation?"). Skipping it is normal and expected. If the user has more to say, they may; if not, the system will ask later, in the right place, anchored to the right region.

### 3.3 How the Seed Is Visually Locked

When the user submits, the seed is **planted** — visually anchored at the center of the canvas. The phrasing is preserved verbatim. The seed becomes the gravitational center of everything that follows; it does not get rephrased, replaced, or hidden.

The user should perceive: *"My exact words are now the center of this system."*

### 3.4 What the User Should Feel in the First 30 Seconds

In order:
1. **Recognition** — "It heard me. My words are still mine."
2. **Calm** — "It is not asking me twenty questions."
3. **Anticipation** — "Something is beginning to form around what I said."
4. **Trust** — "It seems to know what to do next."

The first 30 seconds must avoid: form-filling fatigue, classification anxiety, premature complexity, and the sense of being graded.

### 3.5 The Product Metaphor

The interaction explicitly mirrors the natural growth metaphor:

- **Seed** — the user's original input, locked at center
- **Roots** — the silent structural understanding the system forms first (classification, region selection)
- **First visible growth** — the initial regions appearing around the seed
- **Branches** — divergent strategic paths that appear as the idea matures
- **Maturity** — regions stabilize, a strongest direction becomes visible, blueprint becomes available

The metaphor is not decorative. It governs the *order* and *pacing* of what appears.

---

## 4. Seed Classification Behavior

VisionAir.v1.1 defines three seed types: **idea seed**, **problem seed**, **capability seed**.

### 4.1 Visibility of Classification

Classification is **implicit by default, optionally visible, never mandatory for the user to set**.

- The user does **not** choose a seed type at input time.
- The system classifies internally as soon as the seed is planted.
- A small, low-chrome indicator may appear (e.g. *"reading this as a capability seed"*) once classification stabilizes — discoverable, not foregrounded.
- The user can correct the classification at any time. Correction is treated as a strong signal and re-shapes the regions.

The user should never feel they must understand the taxonomy to use the product.

### 4.2 What Changes Per Seed Type

The classification governs **which regions appear first**, **which prompts fire first**, and **which branch types are likely to emerge**.

**Idea seed**
- First-ring regions emphasize: User, Value Mechanism, System / Product Form
- First prompts emphasize: definition prompts, user prompts
- Likely branches: product-form variants, scale variants
- Likely correction behavior: product-form challenge (per VisionAir.v1.1 §16)

**Problem seed**
- First-ring regions emphasize: Problem / Need, User, Current Workflow (if operational)
- First prompts emphasize: pain localization, bottleneck definition
- Likely branches: solve-form variants (tool, service, system, automation)
- Likely correction behavior: scope sharpening, root-cause re-anchoring

**Capability seed**
- First-ring regions emphasize: Proof / Signal, Value Mechanism, target-User exploration
- First prompts emphasize: trust prompts, value prompts
- Likely branches: business-form variants generated from latent capability
- Likely correction behavior: credential mismatch detection (per VisionAir.v1.1 §15)

The interface adapts the *first ring*, *first prompts*, and *branch surface* — not the underlying engine.

---

## 5. Growth Model in Interaction Terms

The system passes through five visible interaction states. These are observable to the user as legible phases of the map's life.

### 5.1 Seed State

**What the user sees:** the seed locked at center, alone. A subtle ambient signal that something is being read or understood.

**Interactive:** the seed itself (re-edit, re-phrase before structure forms).

**Not yet interactive:** regions, prompts, branches.

**Most active backend layer:** AROD (interpretation), AlignFlow (initial structural readiness).

**Transition trigger:** internal classification stabilizes and at least the first universal regions become candidate-ready.

### 5.2 Root State

**What the user sees:** quiet, low-chrome cues that structure is forming beneath the surface — a sense of *"the system is taking root in what I said."* No regions yet, but the canvas is no longer empty of meaning.

**Interactive:** the seed; an optional "tell me more" affordance feeding the secondary input.

**Not yet interactive:** the structure being formed.

**Most active backend layer:** AlignFlow (region selection and ordering), AROD (weakness pre-mapping).

**Transition trigger:** first-ring regions are ready to appear without overwhelming the user.

### 5.3 First Sample State

**What the user sees:** the first ring of regions appears around the seed — a small, deliberate set (typically 3–5). Each region shows its name and a single legible state indicator. At least one weak region is gently signaled, inviting the first clarification.

**Interactive:** regions can be opened; the first clarification prompt can be answered or dismissed.

**Not yet interactive:** branches, blueprint, deeper conditional regions.

**Most active backend layer:** AROD (weakness signaling, prompt selection), AlignFlow (region maturation tracking).

**Transition trigger:** enough regions reach Emerging or stronger that strategic divergence becomes visible — i.e. the seed could plausibly evolve in materially different directions.

### 5.4 Branching State

**What the user sees:** the map opens. Distinct branches appear as visibly differentiated paths from the seed, each carrying the regions that distinguish it. One branch may be marked as currently strongest, but no branch is foreclosed.

**Interactive:** branches can be compared, opened, ranked, narrowed; clarification prompts continue, now anchored to the regions that most affect ranking.

**Not yet interactive:** blueprint export (until at least one branch reaches sufficient maturity).

**Most active backend layer:** AMO (branch generation, ranking, re-ranking).

**Transition trigger:** at least one branch reaches Stable or Execution-Ready across its load-bearing regions.

### 5.5 Maturity State

**What the user sees:** the map quiets. The recommended branch is clearly marked. Blueprint becomes available. Stabilizing Synthesis becomes available when expansion would no longer help. The user is offered orientation, not more questions.

**Interactive:** blueprint, synthesis, branch confirmation, region refinement.

**Not yet interactive:** nothing material — the system is now in a state where the user leads.

**Most active backend layer:** AMO (reconvergence), AlignFlow (execution-readiness gating), VisionAir output-mode selection.

**Transition trigger:** none forward — Maturity is a sustained state. Transitions from here are *backward* (new signal re-opens branching) or *outward* (handoff to execution).

---

## 6. Region Emergence Rules

### 6.1 Universal vs Conditional

**Universal regions** (per VisionAir.v1.1 §6) are always available in some form: User, Problem / Need, Value Mechanism, System / Product Form, Constraints, Execution Paths.

**Conditional regions** (per VisionAir.v1.1 §7) appear only when the seed or domain warrants them: Current Workflow, Merchandise / Category Scope, Discovery / Presentation, Proof / Signal, Brand / Surface Experience, Emotional Value.

### 6.2 First-Ring Behavior

The **first ring** around the seed contains a deliberately small set — typically 3 to 5 regions, never the full universal set at once. Selection is governed by seed type (per §4.2) and by what the system can begin to populate immediately.

Regions not in the first ring are not hidden — they are **latent**: signaled as present-but-not-yet-active, so the user senses room to grow without being asked to engage with everything.

### 6.3 Conditional Region Surfacing

A conditional region appears when:
- the seed type implies it (e.g. Proof / Signal for capability seeds)
- the user's input or a clarification answer activates it
- branching reveals a path that depends on it

Conditional regions emerge with a brief, legible reason for their appearance — never silently injected.

### 6.4 Visual Indication of Maturity

Each region carries one visible state cue mapped to the region state model (VisionAir.v1.1 §8): Unformed, Emerging, Weak, Suggested, Confirmed, Stable, Execution-Ready.

The cue must be:
- legible at a glance
- consistent across regions
- distinguishable for *weakness* vs *suggestion* vs *confirmed* (these are different epistemic states)

### 6.5 Visual Indication of Weakness

Weak regions are marked distinctly from immature regions. A region that is *Unformed* is quiet; a region that is *Weak* is gently active — it draws attention without alarming the user. The signal communicates *"there is something here that needs your input"*, not *"this is wrong."*

### 6.6 Avoiding Overwhelm

Three governing rules prevent overload:
1. **First-ring cap** — never more than ~5 regions in the initial ring.
2. **One active prompt** — only the next most important clarification is foregrounded (see §8).
3. **Latent presence** — non-active regions are visible as potential, not as obligations.

The map should feel *spacious* in early states and *full* only when the user has earned that fullness through engagement.

---

## 7. Weak Region Interaction Rules

### 7.1 Distinguishing the Five Surface States

The interface must visibly distinguish:

- **Weak** — the region exists but cannot yet be trusted; gentle attention signal.
- **Suggested** — the system has proposed content; clearly labeled as inferred, not confirmed.
- **Confirmed** — the user has explicitly validated; visually settled.
- **Stable** — coherent enough that it is no longer a primary source of fragility; quiet, dependable.
- **Execution-Ready** — mature enough to support blueprint or next-step logic; visibly ready.

These five states are not interchangeable. Confusing *Suggested* with *Confirmed* would violate AROD's truth-status discipline and is forbidden at the interface layer.

### 7.2 How Weak Regions Are Signaled

A weak region carries:
- a visible weakness cue (gentle, not alarming)
- a short, legible reason on inspection (e.g. *"value mechanism unclear"*, *"target user undefined"*)
- a single suggested next action when applicable (typically, answering the anchored clarification)

### 7.3 How the User Discovers Why a Region Is Weak

Weakness reasons are surfaced *on engagement*, not pushed. When the user opens or hovers a weak region, the system explains in one short line *why* it is weak — referencing one or more of the weakness sources from VisionAir.v1.1 §9 (purpose, target user, value mechanism, support, proof, product-form coherence, execution readiness, internal consistency).

The user should never be told a region is weak without being able to learn why.

### 7.4 When Weak Regions Trigger a Clarification Prompt

A weak region triggers a prompt when:
- it is currently the highest-leverage weakness in the map, AND
- no other prompt is currently active, AND
- the user has not just dismissed a prompt anchored to it.

This preserves the rule: *ask only the next most important clarification question* (§8).

### 7.5 What Happens When the User Answers

On answering:
- the region's content updates visibly
- the state cue advances (Weak → Emerging → Suggested or Confirmed, depending on the answer)
- if the answer affects branch viability, branches re-rank visibly
- if the answer activates a conditional region, that region appears with a brief reason
- the next-most-important prompt is selected and may surface (with appropriate spacing — never an immediate cascade)

### 7.6 How a Weak Region Becomes Stronger

A region matures through accumulating signal:
- direct user confirmation (strongest)
- answered clarification prompts
- consistency with other confirmed regions
- branch convergence

A region only reaches *Execution-Ready* when AlignFlow's readiness thresholds are met. The interface reflects this state — it does not grant it.

---

## 8. Clarification Prompt Timing

This section is binding. It governs the most sensitive surface in the entire product.

### 8.1 The Governing Rule

> **Ask only the next most important clarification question.**

This rule from VisionAir.v1.1 §10 is preserved verbatim and treated as inviolable at the interaction layer.

### 8.2 When the System Should Prompt

A prompt fires when:
- a weak region is the current highest-leverage weakness, AND
- the user is not mid-action (typing, panning, opening a region), AND
- the previous prompt has been answered, dismissed, or has aged out, AND
- a brief settle interval has passed since the last surface change

The system should *never* prompt within the first few seconds after the seed is planted — the user should first see structure form, then be invited to deepen it.

### 8.3 How Many Prompts Appear at Once

**One.** Always one. Never two simultaneous active prompts, regardless of how many weak regions exist.

Latent prompts may be visible as small affordances on their anchored regions — but only one is foregrounded at a time.

### 8.4 How Prompts Are Anchored

Every prompt is anchored to a specific region. The anchoring is visible: the prompt visually originates from the region, and the region itself indicates that a prompt is attached. A floating, unanchored prompt is forbidden — a prompt the user cannot trace back to a region creates the noise pattern this rule exists to prevent.

### 8.5 How Prompt Priority Is Decided

Priority is decided by AROD and AMO in combination. The interface does not invent priority — it expresses the governing layers' decisions. Roughly:

- highest weakness leverage (which weak region most blocks forward motion)
- branch impact (will answering this re-rank branches?)
- maturity unlock (will answering this move a region toward Execution-Ready?)
- user state (avoid pushing depth questions when the user appears to be skimming or re-orienting)

Prompt type (definition, user, value, constraint, feasibility, execution, format, trust — per VisionAir.v1.1 §10) is selected to match the weakness source.

### 8.6 How Ranked User Answers Affect Pathing

When the user provides ordered or ranked answers (e.g. "for me the priorities are A, B, C"), the interface treats the ordering as strong directional signal. Branch ranking visibly responds. The user should be able to *see* their priorities reshape the map — this is the felt evidence that the system is listening.

### 8.7 How the System Behaves When the User Skips

A skipped prompt is not a failure. The system:
- does not re-fire the same prompt immediately
- does not punish the region with stronger warning chrome
- moves to the next-most-important prompt after a settle interval
- preserves the skipped prompt as available on demand from its anchored region

The user must always feel they can decline a question without losing ground.

---

## 9. Guided Continuation Mode in the Interface

### 9.1 What Triggers It

Guided Continuation Mode (per VisionAir.v1.1 §11) activates when:
- the user becomes unavailable (session ends, idle threshold passed, explicit pause)
- forward motion remains useful (i.e. there is meaningful work the system can do without violating truth-status discipline)
- AMO judges that suggestions can be generated with appropriate confidence labeling

### 9.2 What the User Sees When They Return

On re-entry into a project where Guided Continuation has run, the user sees:
- the map in its current evolved state
- a clearly distinct surface — a *"While you were away"* layer — listing the suggested continuations
- each suggestion anchored to its region or branch
- nothing inferred has been silently merged into Confirmed state

The first thing the user must perceive: *"The system kept thinking, but it didn't pretend I had agreed."*

### 9.3 How Suggested Continuations Are Labeled

Every Guided Continuation output carries:
- a **Suggested** state cue (visually distinct from Confirmed, Stable, Execution-Ready)
- the **reason** it was generated
- **what it changes** if accepted
- a **confidence** indicator
- whether it is **reversible**

This mirrors VisionAir.v1.1 §12 (suggestion logic) at the interaction surface.

### 9.4 How the User Confirms / Modifies / Rejects

Each suggestion offers three actions:
- **Confirm** — promotes Suggested → Confirmed; integrates into the live map
- **Modify** — opens the suggestion for edit before confirmation
- **Reject** — removes the suggestion; the system records the rejection as signal

Confirmation is a single deliberate act. The system does not auto-confirm on time, scroll, or proximity.

### 9.5 How Trust Is Preserved Without Freezing Momentum

Two principles operate together:

- **Suggestions are not confirmations.** The interface enforces this through visible state distinction and through requiring an explicit user act for promotion.
- **Continuation is useful but epistemically honest.** The system does not stop thinking when the user pauses, but it never lies about the confidence of what it produced.

Together, these allow the user to return to a system that has *moved* without feeling that decisions have been made *for them*.

---

## 10. Branch Visibility and Path Interaction

### 10.1 When Branches First Appear

Branches do not appear in Seed, Root, or First Sample states. They appear when the **Branching State** (§5.4) is reached — i.e. when AMO judges that the seed could plausibly evolve in materially different directions.

### 10.2 How Many Should Be Shown

Typically **2 to 4** branches are visible. Fewer than two is not a branch surface — it is a single direction. More than four is clutter and violates the *strategic, not decorative* rule.

### 10.3 How Branches Are Compared

Each branch is visually differentiated from the others and exposes the regions that distinguish it. Comparison surfaces show:
- what the branch implies for the User region
- what the branch implies for Value Mechanism
- what the branch implies for System / Product Form
- what trade-off the branch carries (constraint, friction, scope)

The user should be able to see, at a glance, *what choosing this branch would commit to*.

### 10.4 How One Branch Becomes Recommended

A branch is marked as currently strongest when AMO's ranking (per VisionAir.v1.1 §14) determines it leads. The recommendation is visible but never visually exclusive — alternative branches remain present, navigable, and re-rankable.

### 10.5 How Re-Ranking Is Represented

When stronger clarification arrives, branches re-rank visibly. The interface shows the *transition* — the previously-recommended branch loses its mark, the new strongest branch gains it, and a brief, legible reason is available on inspection (*"re-ranked after answer to value-mechanism prompt"*).

The re-ranking moment is one of the product's highest-trust moments. It demonstrates that the system is not locked into early choices.

### 10.6 How Branch Clutter Is Prevented

Three rules:
1. **Hard cap** — never more than four active branches at once.
2. **Pruning** — branches that lose viability after re-ranking are demoted to a collapsed/latent state, not deleted (the user can re-open them if signal shifts).
3. **No decorative branches** — a branch only appears if it materially differs from existing branches in user, value, form, or scope.

---

## 11. Output Mode Triggers

VisionAir has three output modes (per VisionAir.v1.1 §17). The interaction layer governs *when* each mode is in front of the user.

### 11.1 Growth Map

**When it is primary:** from Seed State through Branching State, and any time the user is actively shaping structure. Growth Map is the **default surface** of VisionAir.

**What it should contain:** the seed, regions with state cues, weakness signals, anchored prompts, branches when present, and any active Guided Continuation suggestions.

**When it should remain dominant:** while there is meaningful structural work to do — i.e. anytime expansion or refinement is the highest-value next move.

### 11.2 Blueprint

**When it becomes available:** when at least one branch has reached **Execution-Ready** maturity across its load-bearing regions, *and* the user has confirmed enough of that branch to support synthesis.

**Minimum maturity required:** load-bearing regions (User, Value Mechanism, System / Product Form, plus any seed-type-critical conditional regions like Proof / Signal for capability seeds) must be at Confirmed or Execution-Ready.

**How it relates to the map:** Blueprint is **derived from**, not a replacement for, the Growth Map. The user can move between them. Blueprint surfaces the recommended branch as a structured synthesis (system definition, user, value, constraints, best path, next-step orientation per VisionAir.v1.1 §17.2). The map remains the source; the blueprint is its current best expression.

### 11.3 Stabilizing Synthesis

**When VisionAir should compress rather than expand:** when expansion would no longer serve the user. This includes:
- enough signal already exists for orientation
- the user appears uncertain or identity-fragile (capability-seed users especially)
- additional branching would increase overwhelm rather than clarity
- emotional clarity matters more than structural proliferation
- the user explicitly asks for orientation rather than exploration

**What user state or system state should trigger it:**
- repeated re-entry without new input (the user is orbiting, not advancing)
- AROD detects identity-fragility or overwhelm signals
- branch ranking has stabilized and further branching is not productive
- the user explicitly requests synthesis

**How it should appear in the experience:** as a distinct, calm surface — a properly sequenced, compressed text that orients without reducing. It is not a replacement for the map; it is a deliberate moment of stillness within the experience.

### 11.4 Compression as a Core Capability

Per VisionAir.v1.1 §18, **elegant compression** is a core product capability — not a fallback. The interaction layer must treat Stabilizing Synthesis as a *peer* of Growth Map and Blueprint, not a degraded mode. Knowing when to compress is part of the intelligence the user should feel.

---

## 12. Zoom and Navigation Behavior

The Growth Map is a zoomable, navigable surface. Three zoom levels carry different responsibilities.

### 12.1 Zoomed-Out View

The whole map at a glance. The seed is visible at center; regions and branches are visible as a constellation. State cues are simplified (color/density only — no labels). The purpose is *orientation*: "where am I in this idea?"

### 12.2 Mid-Level View

Regions are labeled with their names and state cues. Branches are distinguishable. Anchored prompts are visible as small markers on their regions. The purpose is *navigation*: "what should I engage with next?"

### 12.3 Zoomed-In Local Region View

A single region (or a tight cluster) fills the surface. Region content is fully readable; weakness reasons are exposed; anchored prompts are foregrounded; suggested continuations within the region are visible with full labeling. The purpose is *engagement*: "I am answering, refining, or confirming this."

### 12.4 Roots vs Branches in Spatial Terms

- **Roots** are the structural understanding beneath the seed — region selection, classification, weakness mapping. They are *implied* spatially (downward / inward gravity around the seed), but not foregrounded as shapes the user manipulates. Roots are felt; branches are seen.
- **Branches** extend *outward* from the seed when the Branching State is reached. Each branch carries its distinguishing regions along its path.

This asymmetry is intentional: roots are the system's responsibility, branches are the user's strategic terrain.

### 12.5 Returning to the Core Seed

The seed is always the home. From any zoom level or any branch, a single, persistent affordance returns the user to the seed at the center of the zoomed-out view. The user must never feel lost in their own map.

### 12.6 What Information Appears at Each Zoom Level

| Zoom level | Seed | Regions | State cues | Prompts | Branches | Region content | Suggestion details |
|---|---|---|---|---|---|---|---|
| Zoomed-out | visible | shapes only | simplified | hidden | shapes only | hidden | hidden |
| Mid-level | visible | labeled | full | as markers | labeled | summary on hover | summary on hover |
| Zoomed-in | reachable | one or cluster | full | foregrounded | reachable | full | fully labeled |

The principle: **detail follows attention**. The user pulls detail toward themselves by zooming in; they push it away by zooming out.

---

## 13. Re-Entry and Continuity

### 13.1 What Is Shown First on Re-Entry

The user lands on the Growth Map at the **mid-level view**, centered on the most recent active region or branch. They do not land on a dashboard, a list, or a "welcome back" splash. They land back in their idea.

### 13.2 How the System Reminds the User Where They Were

A small, low-chrome re-entry layer surfaces three things:
- **Where you stopped** — the last region or branch the user engaged with
- **What changed** — any Guided Continuation outputs generated while away (clearly labeled Suggested)
- **What's next** — the current highest-leverage prompt or action

This layer is dismissible. Power users can move past it instantly; first-time returners get gentle re-orientation.

### 13.3 How Unresolved Weak Regions Are Surfaced

Unresolved weak regions retain their weakness cue. On re-entry, the highest-leverage weak region's anchored prompt becomes the foregrounded next action. Other weak regions remain visibly present but not pushed.

The user should perceive: *"The system remembered what was unfinished."*

### 13.4 How Guided Continuation Outputs Are Presented

As described in §9.2 — through a distinct *"While you were away"* surface, with each suggestion fully labeled (Suggested state, reason, change implied, confidence, reversibility). The user can confirm, modify, or reject in place. Nothing inferred has been silently promoted.

### 13.5 How Momentum Is Preserved Across Sessions

Three behaviors:
- the map state, region maturity, and branch ranking persist exactly as the user left them
- the next-most-important prompt is computed at re-entry, not preserved stale (so re-entry reflects current judgment, not last session's judgment)
- emotional context from the user's last session (e.g. capability-seed identity sensitivity) influences how re-entry is framed

This section anticipates persistence and context engineering as concerns — but does not specify the technical means. Those are VisionAir.v1.3 territory.

---

## 14. Success Criteria

The interaction architecture succeeds when, observably:

- **The user quickly understands that the idea is becoming structured.** Within the first minute of seeding, structure has visibly formed; the user feels the system is working with them on something real.
- **Weak regions feel helpful, not punishing.** Weakness signals invite engagement; users do not feel graded, judged, or behind.
- **Prompts feel intelligent, not noisy.** Users describe prompts as *"the right question at the right time"* rather than as friction.
- **Branching creates clarity, not chaos.** When branches appear, users feel they have been shown a meaningful choice, not given more work to manage.
- **Guided Continuation Mode feels collaborative, not presumptuous.** Returning users feel the system *kept thinking with them* — not that decisions were made for them.
- **Stabilizing Synthesis feels orienting, not reductive.** When compression appears, users describe it as clarifying, not as the system "giving up" on their complexity.
- **Re-entry feels like resumption, not restart.** Users return to their idea, not to a tool.
- **Truth status is always legible.** Users always know what is Suggested vs Confirmed vs Stable vs Execution-Ready. The product never lies to itself or to the user about the maturity of any part of the map.

---

## 15. Constraints

VisionAir.v1.2 deliberately does **not** define:

- **Flutter implementation** — no widget trees, no state management choices, no platform-specific patterns
- **Firebase data structures** — no collection design, no document shapes, no security rules
- **Security architecture** — auth, authorization, encryption, threat modeling
- **Exact UI toolkit decisions** — design libraries, component frameworks, primitive selection
- **Final visual design system** — colors, typography, iconography, spacing scales, motion design
- **Animation libraries** — easing curves, choreography frameworks, performance budgets
- **Database schema** — relational/document design, indexing, migration strategy

This document stays at the **interaction-logic layer only**. Any temptation to specify implementation should be deferred to VisionAir.v1.3 (Technical Foundation Specification).

---

## 16. Next Artifact

The next highest-leverage artifact is:

# VisionAir.v1.3 — Technical Foundation Specification

VisionAir.v1.3 should translate VisionAir.v1.2 into:

- **Frontend architecture** — how the Growth Map, Blueprint, and Stabilizing Synthesis are realized as a coherent client; how state, navigation, and zoom are structured
- **Backend architecture** — how AlignFlow, AROD, AMO, and VisionAir's intelligence layer are exposed as services that produce the behaviors VisionAir.v1.2 prescribes
- **Persistence model** — how seeds, regions, region states, branches, suggestions, and Guided Continuation outputs are stored and recovered with full fidelity
- **Context model** — how prior session state, user signals, and accumulated truth-status are carried across sessions to enable Re-Entry behavior (§13)
- **Technical boundaries** — what is in-scope for the foundational technical layer, and what defers to subsequent iterations (visual design, polish, scaling)

VisionAir.v1.3 must remain faithful to VisionAir.v1.1 (intelligence) and VisionAir.v1.2 (interaction). Where technical feasibility forces a trade-off, the trade-off must be made explicit and traceable back to the governing document it diverges from.

---

## 17. Authoritative Implication

VisionAir.v1.2 is binding for all interaction work — flows, surfaces, prompt design, transition timing, mode selection, and re-entry behavior — unless explicitly superseded.

It does not supersede VisionAir.v1.1. Where the two documents touch, VisionAir.v1.1 governs *what the system thinks* and VisionAir.v1.2 governs *how the user experiences that thinking*.
