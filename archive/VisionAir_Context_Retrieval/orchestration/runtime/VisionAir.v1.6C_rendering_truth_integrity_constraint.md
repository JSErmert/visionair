# VisionAir.v1.6C — Rendering & Truth Integrity Constraint

**Document type:** Constraint Pass (C Pass)  
**Project:** VisionAir  
**Iteration:** VisionAir.v1.6C  
**Phase:** Cross-layer invariant enforcement  
**Date:** 2026-04-17  
**Runtime class:** conceptual_foundation  
**Status:** authoritative_draft  

**Governed by:**
- **AlignFlow** (Alignment Flow) — readiness-gated rendering (no state renders before it has been gated)
- **AROD** (Adaptive Realism and Opportunity Discipline) — truth-state discipline extended to the render surface; mislabeling is rejected at the render boundary
- **AMO** (Adaptive Multithreaded Orchestration) — async inference must not delay deterministic state render

**Inherits from:**
- VisionAir.v1.2 — Interaction Architecture (the inviolable Confirmed/Suggested distinction at the surface)
- VisionAir.v1.3 — Technical Foundation Specification (truth-status persistence as the load-bearing invariant)
- VisionAir.v1.4 — Security, Privacy, and IP Trust Protocol (authorship clarity, mislabeling as trust violation)
- VisionAir.v1.5 — Context Engineering Specification (truth-status preservation through retrieval and compaction)
- VisionAir.v1.6 — Runtime Orchestration & Execution Model (partial rendering, async/sync split, degradation discipline)

**Also governed by:**
- VisionAir Output Contract — save → print → continue, 4-backtick fencing, non-truncation, Required Return printing format
- VisionAir Report Contract — decision-impact reports

---

## 1. Executive Definition

**VisionAir.v1.6C — Rendering & Truth Integrity Constraint** is the governing constraint that binds rendering behavior to **truth-state integrity** across all VisionAir layers.

It is not a UI preference, a performance guideline, or a design tip. It is a **cross-layer invariant** that formalizes the relationship between runtime execution (v1.6), interaction behavior (v1.2), context discipline (v1.5), and the trust model (v1.4), ensuring no one of them can be optimized at the expense of another.

This constraint establishes three non-negotiable principles:

- **Rendering speed must not degrade system truth.** A faster UI that collapses Confirmed/Suggested distinctions is not faster; it is broken at a layer users cannot easily detect.
- **UI behavior must reflect epistemic state accurately.** What is rendered must carry the truth-status of what it represents. Visual simplification that strips epistemic labeling is forbidden.
- **Runtime performance optimizations are subordinate to truth preservation.** When the two are in tension, truth wins. Always.

This pass is written because the natural engineering response to rendering latency — optimistic display, stripped labels, collapsed state tiers — is exactly the response that violates VisionAir's load-bearing invariant (VisionAir.v1.3 §6.5: truth-status persistence as the single most important technical invariant). v1.6C makes that violation explicitly out of bounds rather than implicitly discouraged.

---

## 2. Partial Rendering Invariant

> **State must render immediately; content may resolve later.**

### 2.1 What This Means

When a runtime cycle produces an outcome — a new suggestion, a region state transition, a synthesis, a ranking change — the **state diff renders immediately**. The accompanying AI-generated content body (suggestion text, synthesis paragraphs, ranked content) resolves asynchronously and fills in as inference completes.

This is the Stage 1 / Stage 2 contract from VisionAir.v1.6 §11.3, lifted from a performance-discipline rule to a cross-layer invariant.

### 2.2 What This Forbids

- rendering **only** when the full content is ready (waiting blocks the user)
- rendering the content body **without** its containing state transition visible (misleads about what happened)
- showing a content body in a way that does not include its truth-status labeling at first paint (§3)

### 2.3 Placeholders Are Required

Every content body that resolves asynchronously must be represented at Stage 1 by a **placeholder** that:

- carries its full truth-status label (e.g. "Suggested" for a Pending suggestion placeholder)
- carries its metadata (reason, confidence, reversibility, anchor for suggestions — per VisionAir.v1.3 §8)
- does **not** imply the content is complete or confirmed
- is visually distinguishable from resolved content so users can tell "still loading" from "here is what it is"

### 2.4 UI Must Reflect Real State, Not Final Content Only

The UI's source of truth is the **state model**, not the content bodies. A state transition is real the moment persistence commits it; the content body is a property of that state that may arrive later. Rendering that waits for the body to arrive before showing the transition confuses the two.

---

## 3. Truth-State Visibility Invariant

Every visible content unit in VisionAir must clearly communicate one of the five preserved states (per VisionAir.v1.5 §12.1):

- **Confirmed** — user explicitly committed
- **Suggested** — orchestration-proposed; not yet user-committed
- **Derived** — computed from other persisted state (e.g. summaries)
- **Weak** — region exists but cannot yet be trusted
- **Stable** — region is coherent enough to stop being a primary source of fragility

### 3.1 Visual Ambiguity Is Not Allowed

A content unit that could plausibly be any of two or more of the five states — because its label is hidden, minimized, absent, or visually indistinguishable from another state's — is a violation. The user must be able to tell, without hover, without zoom, without interaction, which of the five states the content is in.

### 3.2 Truth-State Must Be Visible at First Render

The label is part of the content. It is not a detail that appears after interaction, on hover, after load completes, or after the user zooms in. It is visible from the moment the content (or its placeholder) first appears on screen.

### 3.3 Labels Must Persist Across Transitions

During state transitions (Suggested → Confirmed on acceptance, Weak → Stable as a region matures, ranking re-rank), the label must update atomically with the state. There is **no intermediate state** where the old label has been removed and the new label has not yet appeared. Transition is either pre-label or post-label — never un-label.

---

## 4. Combined System Rule

This is the core invariant of VisionAir.v1.6C:

> **Rendering performance optimizations must never alter, blur, or collapse truth-state distinctions.**

### 4.1 Non-Negotiable Status

This rule is **non-negotiable**. It is not subject to:

- product trade-offs ("users don't notice")
- performance SLAs ("labels cost frame budget")
- design preferences ("it looks cleaner without")
- A/B testing ("users converted better without labels")
- accessibility excuses (accessibility makes labels *more* necessary, not less — a screen-reader user who cannot distinguish Confirmed from Suggested is more harmed than a sighted one)

An optimization that would violate this rule is not an acceptable optimization. The system finds another way.

### 4.2 Why It Is Non-Negotiable

Truth-status persistence is the load-bearing invariant of VisionAir (VisionAir.v1.3 §6.5). If the render layer can collapse it, the invariant does not survive — because the user's experience of the system *is* the render layer. A truth-status distinction that exists in persistence but is invisible at the surface is a distinction the user cannot act on, cannot trust, and cannot rely on.

---

## 5. Forbidden Behaviors

The following are explicitly forbidden at the render boundary. Each corresponds to a specific drift pattern this constraint pass is designed to prevent.

### 5.1 Rendering Suggested Content Without Labeling

Showing AI-generated suggestion content without its "Suggested" label. Even for a single frame during transition. Even during loading. Even in compact views. Even in accessibility fallbacks.

### 5.2 Showing AI Output As If Confirmed

Rendering AI-generated content using the same visual treatment as user-confirmed content. The two must be visually distinguishable at every level of the render hierarchy.

### 5.3 Blocking UI Until AI Completes

Freezing the map, the canvas, or any user-interactable surface while an AI inference call is pending. The state diff renders. The content body fills in. The user never waits on inference (VisionAir.v1.6 §11.1).

### 5.4 Silently Promoting Suggested → Confirmed

Treating a time delay, a scroll past, a hover, a render completion, or any non-explicit signal as a Confirmation act. Suggested → Confirmed requires an explicit user act, always (VisionAir.v1.3 §8.6).

### 5.5 Hiding Truth-State Distinctions for Visual Simplicity

Collapsing Confirmed / Suggested / Derived into a single visual treatment because "the map looks busy." Busy is a design problem to solve within the truth-state constraint, not by removing the constraint.

### 5.6 Replacing Placeholders With Unvalidated Content

When AI content arrives to fill a placeholder, that content must pass the AROD validation boundary (VisionAir.v1.6 §9.4) before it replaces the placeholder. A render path that swaps in AI output without validation bypasses truth-status enforcement.

---

## 6. Placeholder Requirements

### 6.1 Where Placeholders Must Exist

Placeholders are required for every AI-generated content body that resolves asynchronously. At minimum this includes:

- Guided Continuation suggestions (Pending and Presented lifecycle states)
- Stabilizing Synthesis outputs
- Ranked branch content when the ranking has resolved but the branch body is still generating
- Any region content body being proposed as a Suggested update

### 6.2 What Placeholders Must Carry

Every placeholder carries, at first paint:

- the **truth-status label** appropriate to what will fill it (Suggested for suggestions, Derived for syntheses, etc.)
- the **metadata** required by the upstream spec (e.g. for suggestions: reason, confidence, reversibility, anchor — VisionAir.v1.3 §8)
- a visible indicator that the content body is still resolving (the "still loading" signal), distinguishable from a resolved state

### 6.3 What Placeholders Must Not Imply

A placeholder must not imply:

- that the content is complete
- that the content is confirmed
- that the system has made any commitment about what the content will be
- that user interaction with the placeholder will advance any state (until the content has resolved AND truth-status validation has passed)

---

## 7. Runtime Interaction Binding (VisionAir.v1.6)

This constraint is bound to the runtime model:

- **Partial rendering follows the runtime loop.** Stage 1 renders during the "state update → render" stages of the canonical cycle (VisionAir.v1.6 §3.1); Stage 2 content fills in as a follow-up event, not as a continuation of the same cycle.
- **Async inference must not delay render.** The async/sync split (VisionAir.v1.6 §11.4) means: inference is async, state commit is sync, render follows commit. No render path awaits inference completion.
- **State updates precede content updates.** A new suggestion's Pending state commits (and renders as a labeled placeholder) before its content body arrives. The ordering is state → placeholder → content, never content → state.

---

## 8. Trust Model Binding (VisionAir.v1.4)

This constraint is bound to the trust protocol:

- **Truth-state visibility protects authorship.** A user who cannot distinguish what they wrote from what the system suggested cannot claim authorship over their work. VisionAir.v1.4 §5 (custodianship, not co-authorship) depends on the render layer never blurring that line.
- **Incorrect rendering breaks IP clarity.** Mislabeling Suggested as Confirmed at the render layer effectively transfers a piece of authorship perception from the system to the user — without the user's explicit act. This is a soft form of the ownership-blurring that VisionAir.v1.4 §5.2 forbids.
- **Mislabeling is a trust violation.** Not a bug, not a regression — a trust violation. A system that mislabels is a system that cannot be trusted with the earliest, most sensitive business creation context (VisionAir.v1.4 §2). The severity at the trust layer is higher than the severity at the technical layer.

---

## 9. Context Model Binding (VisionAir.v1.5)

This constraint is bound to the context engineering specification:

- **Truth-status persists through retrieval.** A retrieval that drops a Suggested label to save tokens is a retrieval that sets up the render layer to violate this constraint. Retrieval discipline (VisionAir.v1.5 §12) and render discipline are the same invariant expressed at different layers.
- **Summaries preserve labels.** Every derived summary carries its sources' truth-statuses (VisionAir.v1.5 §7.3). A render that consumes a summary to produce displayed content must propagate those labels to the render surface, not strip them during the consumption.
- **Rendering must not collapse context distinctions.** If the context layer distinguishes Confirmed, Suggested, and Derived in its retrieval, the render layer must express that distinction at the surface. Collapse at the render surface is the same invariant violation, just at a later layer.

---

## 10. UI Design Constraint for VisionAir.v1.7

VisionAir.v1.7 (UI / Visual System Architecture) must design every visual system under this constraint.

### 10.1 Explicitly Constrained Surfaces

- **Node rendering** — every node on the Growth Map carries its region state and truth-status label visibly at every zoom level it appears in. The zoom-level detail matrix (VisionAir.v1.2 §12.6) governs *what* appears at each zoom; v1.6C governs that *whatever appears, appears with its label*.
- **Animations** — motion communicates state transitions (Weak → Stable, Suggested → Confirmed, branch re-rank). Animations that hide the transition mid-way, or that render an intermediate state with no label, violate §3.3.
- **Transitions** — a Suggested → Confirmed transition must be visibly atomic: the "Suggested" label visibly becomes "Confirmed." There is no animation frame during which the content has no label.
- **State indicators** — the visual system for expressing the five surface states (Confirmed / Suggested / Derived / Weak / Stable) must be legible, consistent, and visible at first paint. No state indicator relies solely on hover, tap, or deferred interaction to reveal itself.

### 10.2 This Is Not a UI Design Specification

v1.6C does **not** specify:

- which colors represent which states
- which shapes, fonts, or iconographic treatments to use
- animation easings, durations, or choreography
- component library choices or visual primitives

Those are v1.7's concerns. v1.6C only establishes what the visual system must preserve regardless of which treatment is chosen.

---

## 11. Constraints

VisionAir.v1.6C deliberately does **not** define:

- **visual styling** — colors, typography, shape, spacing
- **animations** — timing, easing, choreography
- **component libraries** — widget choices, rendering primitives
- **accessibility implementations** — specific ARIA patterns, screen-reader text, keyboard conventions (the principle is clear: labels must be accessible at every level; the implementation is v1.7 / successor artifacts' concern)
- **performance SLAs** — specific latency targets, frame budgets, animation frame counts

VisionAir.v1.6C is a **behavioral constraint**, not a UI design specification.

---

## 12. Success Criteria

VisionAir.v1.6C succeeds when:

- **UI never blocks for AI.** At no point does the user wait on inference to complete before seeing a state transition render.
- **Truth-state is always visible.** Every content unit — placeholder or resolved — carries its truth-status label at first paint, at every zoom level, across every transition.
- **Users can distinguish authorship at all times.** At any moment in their session, the user can tell what they wrote, what they confirmed, and what the system suggested.
- **Performance optimizations do not degrade correctness.** An optimization that would require dropping or collapsing labels is rejected by the constraint, not accepted with a compensating mitigation.
- **Runtime and UI remain aligned.** The state model is the source of truth; the render layer expresses it faithfully; placeholder-to-resolved transitions maintain invariants; async content filling never bypasses validation.

---

## 13. Next Artifact

Chain work continues at:

# VisionAir.v1.7 — UI / Visual System Architecture

VisionAir.v1.7 must design all visual systems under this constraint. The partial rendering contract (§2), the truth-state visibility invariant (§3), the combined rule (§4), the forbidden behaviors (§5), and the placeholder requirements (§6) are binding on every decision VisionAir.v1.7 makes.

v1.7 inherits from VisionAir.v1.1 through VisionAir.v1.6, **and from VisionAir.v1.6C**.

---

## 14. Authoritative Implication

VisionAir.v1.6C is binding for all rendering-behavior decisions across runtime, UI, and any downstream surfaces that expose system state to users — unless explicitly superseded.

It does not supersede any prior document. Where it touches VisionAir.v1.2 through VisionAir.v1.6, it extends and hardens the invariants already present. Where a future UI / visual / implementation decision would violate any rule in §5, that decision is rejected, and the system finds another path.

Where the seven documents (v1.1 through v1.6 plus v1.6C) touch, **all seven must be honored simultaneously**.
