# VisionAir.v1.6C — Rendering & Truth Integrity Constraint Report

**Document type:** Report artifact (Full Report, per VisionAir Report Contract §7.1)  
**Project:** VisionAir  
**Iteration:** VisionAir.v1.6C report  
**Phase:** Constraint-pass confirmation  
**Date:** 2026-04-17  
**Runtime class:** report  
**Status:** authoritative_draft  

**Governed by:**
- **VisionAir Report Contract** — decision-impact reporting
- **VisionAir Output Contract** — save → print → continue, 4-backtick fencing, non-truncation, Required Return printing format

**Reports on:**
- `docs/orchestration/runtime/VisionAir.v1.6C_rendering_truth_integrity_constraint.md`

---

## 1. Report Purpose

This report belongs to the VisionAir.v1.6C Constraint Pass. The primary artifact remains the sole authority on the rendering-truth-integrity invariant. This report captures the decisions locked, what was intentionally left open, the single main drift risk the constraint exists to prevent, and the handoff to VisionAir.v1.7. It does not restate the constraint section by section.

---

## 2. Major Decisions Locked

1. **The combined system rule is non-negotiable.** Rendering performance optimizations **must never** alter, blur, or collapse truth-state distinctions (§4). Not subject to product trade-offs, performance SLAs, design preferences, A/B outcomes, or accessibility excuses. This is the single load-bearing decision of the pass.
2. **State renders before content. Always.** The partial-rendering invariant (§2) is lifted from a performance-discipline rule in VisionAir.v1.6 §11.3 to a cross-layer invariant. A render path that awaits AI inference before showing a state transition is forbidden, not suboptimal.
3. **Truth-status labels are a first-paint requirement, not a post-load addition (§3.2).** A placeholder rendered without its label — even for a single frame, even during transitions, even in accessibility fallbacks — is a violation. The label is part of the content; content without a label is incomplete, not minimal.
4. **Six forbidden behaviors are explicitly enumerated (§5).** The specific drift patterns — rendering Suggested without labeling, showing AI output as Confirmed, blocking UI for AI, silently promoting Suggested → Confirmed, hiding distinctions for visual simplicity, replacing placeholders with unvalidated content — are now out of bounds by name. Implicit discouragement has been replaced with explicit prohibition.
5. **Placeholders must carry truth-status labels and metadata at first paint (§6.2).** A Pending suggestion placeholder renders with "Suggested" + reason + confidence + reversibility + anchor *before* its content body arrives. A placeholder that defers labeling until content arrives violates the constraint.
6. **Mislabeling is escalated from a bug to a trust violation (§8).** The same collapse that VisionAir.v1.3 §6.5 calls a technical-layer invariant violation, v1.6C §8 calls a trust-layer violation. Same physical failure, higher severity framing — because rendering is what the user perceives.
7. **VisionAir.v1.7's design space is now constrained (§10).** Every visual decision — node rendering, animations, transitions, state indicators — must operate within this invariant. v1.7 cannot propose visual simplifications that require dropping labels or blocking on inference.

---

## 3. Why This Changes the System

Before VisionAir.v1.6C, each prior layer had its own restatement of the truth-status invariant: v1.2 at the interaction surface, v1.3 at persistence, v1.4 at trust, v1.5 at retrieval, v1.6 at runtime writes. Each layer was internally consistent, but the *cross-layer* failure mode — "render optimizes for speed by collapsing what persistence kept distinct" — had no document that said "no, the rule applies here too."

v1.6C closes that gap. Future work can now assume:

- the rendering layer is bound by the same truth-status invariant as every prior layer
- performance optimizations that would require label collapse are rejected at the spec level, not at implementation review time
- the UI design space (v1.7) is pre-constrained: designers do not need to re-derive this invariant from v1.2–v1.6; they can read v1.6C and know what is out of bounds

The ambiguity removed: "can rendering be optimized in ways that the earlier layers couldn't be optimized?" Answer: no, and for the same reason.

---

## 4. Constraints Now Imposed on Future Work

- **VisionAir.v1.7 (UI / Visual System)** must design node rendering, animations, transitions, and state indicators under the six forbidden behaviors and the placeholder requirements. A visual proposal that would require any §5 behavior is spec-non-compliant.
- **Any partial-rendering implementation** must emit Stage 1 (state + label placeholder) before Stage 2 (AI content) under every condition — including accessibility modes, compact views, low-bandwidth fallbacks, and animation intermediate frames.
- **Any accessibility implementation** must surface truth-status labels through non-visual channels at least as legibly as through visual ones. Accessibility makes labels *more* required, not less (§4.1).
- **Any future animation/motion spec** must guarantee the transition atomicity rule (§3.3): no intermediate frame where the old label has been removed and the new label has not yet appeared.
- **Any implementation-layer performance pipeline** that would consider dropping labels, collapsing states, or blocking on inference to hit a latency target must route through degradation discipline (VisionAir.v1.6 §11.6), which explicitly forbids reaching the trust layer.

---

## 5. Intentionally Unresolved

- **How truth-status labels are visually expressed** — color, iconography, typography, shape — is v1.7's concern.
- **Animation timing and easing** for state transitions — v1.7 / motion spec.
- **Accessibility-specific implementations** — ARIA patterns, screen-reader conventions, keyboard affordances — successor artifacts.
- **Specific performance SLAs for Stage 1 vs Stage 2** — operational tuning; the spec governs the ordering, not the absolute timings.
- **How placeholders visually signal "still loading"** distinguishably from resolved states — v1.7 territory, constrained by v1.6C but not specified by it.
- **What happens when inference completes but validation rejects** — §5.6 forbids replacing a placeholder with unvalidated content; the exact UX of "the system tried but could not produce a valid output" is a v1.7 decision.

---

## 6. Main Drift Risk

**The highest-probability failure mode is well-intentioned accessibility or performance work introducing a transient unlabeled state that the engineer believes is acceptable because "the label appears within one second."**

Concretely: an implementation of partial rendering will encounter a scenario where the Stage 1 placeholder is technically difficult to render with its full truth-status label and metadata at first paint — perhaps because the metadata is part of a separate retrieval from the state diff, perhaps because an animation in-between frames inherits from a visual system that doesn't propagate labels automatically. The engineering response, under deadline pressure, will be one of:

- **(a)** "Render a generic loading indicator, then swap in the labeled version when metadata arrives" — producing a 200–800ms window where the user sees content-like placeholders with no truth-status label
- **(b)** "Use the same loading visual for everything — Pending suggestions, syntheses, rankings — and rely on the content body to distinguish them when it arrives" — producing a window where the user cannot tell a Suggested placeholder from a Derived placeholder from a Confirmed-update placeholder
- **(c)** "Animate the label in after the content appears" — reversing §3.2 (label at first paint); the label is now a second-frame addition, and there is a window during which content appears as if it could be anything

All three are violations of §3.2 and §3.3, and all three will be proposed in practice because each has a simple engineering justification ("it's just 500ms," "users won't notice," "the label comes in fast").

This failure:
- **happens where:** any partial-rendering implementation where label/metadata composition is mechanically separable from state composition
- **breaks which invariants:** §3.2 (truth-state visible at first paint), §3.3 (labels persist across transitions, no un-labeled intermediate state), §4 (the combined rule), §5.1 (rendering Suggested without labeling), §5.5 (hiding distinctions for visual simplicity)
- **surfaces as:** occasional brief flashes of unlabeled content during re-entry, during Guided Continuation surfacing, during ranked-branch re-rendering; a user who returns to their project after a Guided Continuation run sees content appear for a moment before the "Suggested" label resolves, and in that moment the content looks confirmed
- **how to avoid it:** treat label + metadata as **structurally part of the state diff**, not a separate retrieval. Stage 1 renders the state diff *including its labels and metadata* — not the state skeleton with labels following. If the label is mechanically separable from the state in the implementation, the implementation is wrong; restructure the state diff composition to include labels, rather than working around the missing labels at the render layer.

A secondary drift: **the aesthetic pressure to "clean up" the map by muting state distinctions at zoomed-out views.** This is a §5.5 violation by gradient — the labels don't disappear entirely, they just become harder to read at higher zooms. The constraint applies at every zoom level; zoomed-out does not mean unlabeled.

---

## 7. Next Artifact Handoff

**Next:** VisionAir.v1.7 — UI / Visual System Architecture

**Must inherit:**
- the partial rendering invariant (§2) — visual system must support Stage 1 / Stage 2 natively
- the truth-state visibility invariant (§3) — the five states must be visually distinguishable at every zoom level, at first paint, across transitions
- the combined rule (§4) as the spec's non-negotiable base
- the forbidden behaviors (§5) as design-space exclusions
- the placeholder requirements (§6) — placeholders are a first-class visual component with labels and metadata baked in
- the UI design constraints in §10.1 (node rendering, animations, transitions, state indicators must all be designed under v1.6C)

**Must not violate:**
- any §5 forbidden behavior, even under accessibility, performance, or aesthetic pressure
- the label-at-first-paint rule (§3.2) even for 1–2 frame transition windows
- the visual-distinctness rule (§3.1) by using the same visual treatment for two or more of the five states
- the no-implicit-promotion rule (§5.4) by using any non-explicit UI affordance (hover, scroll, proximity, time) as a confirmation signal

---

## 8. One-Sentence Addition to the Chain

VisionAir.v1.6C lifts truth-status integrity from a per-layer invariant into a **cross-layer binding constraint** on the render surface itself — closing the last seam through which rendering optimizations could silently collapse what every prior layer kept distinct.

---

## 9. Preservation

The VisionAir.v1.6C primary artifact (`docs/orchestration/runtime/VisionAir.v1.6C_rendering_truth_integrity_constraint.md`) remains authoritative. This report does not replace, rewrite, or section-by-section restate it — per the VisionAir Report Contract.
