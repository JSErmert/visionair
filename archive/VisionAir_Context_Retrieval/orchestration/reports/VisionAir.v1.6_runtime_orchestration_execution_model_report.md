# VisionAir.v1.6 — Runtime Orchestration & Execution Model Report

**Document type:** Report artifact (Full Report, per VisionAir Report Contract §7.1)  
**Project:** VisionAir  
**Iteration:** VisionAir.v1.6 report  
**Phase:** Runtime-execution confirmation  
**Date:** 2026-04-17  
**Runtime class:** report  
**Status:** authoritative_draft  

**Governed by:**
- **VisionAir Report Contract** — decision-impact reporting
- **VisionAir Output Contract** — save → print → continue, non-truncation, copy-paste safety

**Reports on:**
- `docs/orchestration/runtime/VisionAir.v1.6_runtime_orchestration_execution_model.md`

---

## 1. Report Purpose

This report belongs to the VisionAir.v1.6 primary artifact. The primary artifact remains the sole authority on VisionAir's runtime execution model. This report captures the decisions locked, the constraints newly imposed, what was intentionally left open, and the main drift risk future runtime work must avoid. It does not restate the specification.

---

## 2. Major Decisions Locked

1. **The canonical runtime loop is seven stages, and every significant operation follows it.** Input capture → seed classification → context retrieval → orchestration decision → output generation → state update → render (§3.1). Ad-hoc execution paths that skip stages (e.g. "just write content directly") are spec-level violations.
2. **Loops are scoped to one logical change.** Cascading in-place continuations are forbidden; follow-up work enters as a new cycle (§3.3). This preserves auditability and prevents unbounded runtime chains.
3. **The one-active-prompt rule is a runtime invariant, not a UX guideline.** §6.1 lifts VisionAir.v1.2 §8.3 from the interaction layer to the execution layer — queued prompts are held by the runtime, not allowed to race at the surface.
4. **Silence is a valid cycle outcome.** §6.5 makes "do not prompt this cycle" an explicit, governed decision rather than a gap. The runtime is forbidden from generating arbitrary prompts to fill silence.
5. **State updates are atomic at the transition boundary.** §9.2 forbids partial writes across region state + truth-status + suggestion lifecycle + ranking. The client never observes an inconsistent map. Half-applied updates are always bugs, never acceptable states.
6. **Orchestration and AI inference are async by default; persistence commits are sync and atomic.** §11.4 resolves the usual runtime conflict (responsiveness vs correctness) in favor of both — async for feel, sync for truth.
7. **Degradation never reaches the trust layer.** §11.6 defines the exact order of runtime degradation under pressure (drop Tier 3 → defer Guided Continuation → simplify cycle → never reduce truth-status fidelity or collapse Confirmed/Suggested distinctions). This closes the door on the single worst failure mode runtime systems usually drift into.
8. **Governing-layer conflicts resolve to "most restrictive wins."** §5.5 locks the precedence: when AlignFlow, AROD, and AMO disagree, the system pauses rather than acts on an illegal decision. Initiative is subordinate to discipline.

---

## 3. Why This Changes the System

Before VisionAir.v1.6, every prior layer made commitments that were true *about* VisionAir but not yet *executable as* VisionAir. The runtime model is where:

- AROD's truth-status discipline becomes a rejection boundary that actually rejects writes
- V.1.2's "one active prompt" stops being a UX rule and becomes a queue-level invariant
- V.1.5's per-step retrieval contracts gain their caller — each runtime cycle invokes exactly one contract
- Guided Continuation Mode transitions from a declared feature to a defined async process with enumerated lifecycle transitions

The ambiguity removed: "how does the system actually act, moment by moment, without violating any of v1.1–v1.5?" That is now answered. Future runtime implementation has a governed model to inherit from — not a design problem to re-solve.

---

## 4. Constraints Now Imposed on Future Work

- **VisionAir.v1.7 (UI / Visual System)** must respect the partial-rendering model (§11.3). Visual design cannot require "all content present before any render" — placeholder states with correct truth-status labeling at first paint are a visual contract, not an optional aesthetic.
- **Any implementation-layer scheduler** must honor the sync-commit-async-infer split (§11.4). A design that awaits AI inference before committing deterministic state diffs violates the spec.
- **Any AI integration at the inference boundary** must produce output that passes AROD's rejection validation at the persistence layer (§9.4). An AI output path that writes directly to Confirmed state is non-compliant.
- **Any observability/telemetry** attached to the runtime must emit metadata only (§12.3, inheriting VisionAir.v1.4 §9). Stage transitions, diagnostic codes, and timing are observable; project content is not.
- **Any Guided Continuation trigger** must come from AMO's unavailability signal combined with AMO's confidence judgment (§7.1). A runtime that speculatively runs Guided Continuation during an active session violates the spec.
- **Any prompt-generation path** must go through §6's priority resolution. Hard-coded prompt sequences, scripted tutorials, or "always ask X first" patterns violate the rule that priority is computed from current signal.

---

## 5. Intentionally Unresolved

- **Exact latency targets** — §11.2 declares governing targets (sub-200ms deterministic, sub-2s inference) but final SLAs, performance budgets, and escalation thresholds are operational tuning, not spec.
- **Guided Continuation scheduling cadence** — unavailability thresholds, retry intervals, and global rate limits are AMO policy settable at runtime, transparent to users, but not bound by this document.
- **Partial-rendering transition choreography** — §11.3 defines the two-stage contract; how that is visually expressed (fades, skeletons, progress affordances) is VisionAir.v1.7 territory.
- **Specific scheduler / concurrency primitives** — async vs actor vs worker pools; implementation concern.
- **Inference provider contract shape** — how the AI boundary is technically invoked (streaming, batch, tool-calling) is deferred to an implementation-adapter artifact downstream of v1.6.
- **Exact degradation thresholds** — §11.6 defines the order of degradation but not the measurement conditions that trigger each step.

---

## 6. Main Drift Risk

**The highest-probability failure mode is the runtime synchronously awaiting AI inference before rendering, breaking the "feel continuous, not blocked" invariant — and the engineering response to that problem drifting into a worse failure.**

Concretely: a naïve implementation of the canonical loop will run input capture → retrieval → orchestration decision → **wait for AI inference to complete** → state update → render. For any cycle that involves generation (suggestion, synthesis, ranked content), the user experiences the map freezing for the duration of the inference call. This breaks §11's governing rule.

The typical engineering fix — which is the real drift — is one of two forms, both worse:

- **(a) Eliminate the AROD write-boundary validation on the inference path** so AI inference can commit directly without a governed check. This lets the user see output faster but bypasses VisionAir.v1.3 §11.4 and VisionAir.v1.6 §9.4 — AI output begins writing to persisted state without its truth-status label surviving. This is the truth-status collapse drift that VisionAir.v1.5 §12.3 identified as the single most important rule, surfacing at the runtime layer.
- **(b) Render AI-generated content optimistically before the commit** (without placeholder discipline). This produces a surface where the user sees content that looks confirmed, but if the commit fails or AROD rejects, the content vanishes or worse silently stays in a Suggested-but-rendered-as-Confirmed state. This breaks VisionAir.v1.2 §7.1 (inviolable Confirmed/Suggested distinction) at the render layer.

This failure:
- **happens where:** the cycle stage between orchestration decision and state update, when a generation step is on the critical path
- **breaks which invariants:** §9.2 (atomicity), §9.4 (invalid transition prevention), §11.1 (continuous feel), §11.4 (async/sync split), cascading into VisionAir.v1.3 §11.4, VisionAir.v1.4 §8.3, and VisionAir.v1.5 §12.3
- **surfaces as:** a map that occasionally freezes for 2–4 seconds during generation, engineers respond by short-circuiting the write boundary, and within months the Confirmed/Suggested distinction stops being enforced at the runtime boundary
- **how to avoid it:** treat §11.3 (partial rendering) and §11.4 (async/sync split) as non-negotiable from day one. The correct shape is: deterministic state diff commits and renders immediately, with AI-generated bodies filling in as Stage 2 content. The placeholder at Stage 1 carries the full truth-status label even before the content body arrives (§11.3 closing paragraph). Engineering teams that try to "simplify" by collapsing Stage 1 and Stage 2 into a single await-then-commit path are recreating the drift in a subtler form.

A secondary drift (lower-probability): **runtime treats AI output as a trusted sender** — i.e. model-returned content is written without AROD validation because "the model wouldn't produce invalid output." This fails the first time a model hallucinates confirmed-looking content. The AROD validation boundary is not a filter for bad models; it is a structural invariant that holds regardless of inference quality.

---

## 7. Next Artifact Handoff

**Next:** VisionAir.v1.7 — UI / Visual System Architecture

**Must inherit:**
- the partial-rendering contract (§11.3): visual design must support a two-stage render where Stage 1 is correct and complete in its scope, Stage 2 fills in AI-generated bodies
- the one-active-prompt rule at the visual surface (§6.1)
- the continuous-not-blocked rule (§11.1) — the Growth Map must remain visibly alive during generation cycles
- placeholder truth-status labeling at first paint (Pending suggestions render with their Suggested label before their content body arrives — §11.3 closing paragraph)
- visual distinction between the five surface states (Confirmed / Suggested / Derived / Weak / Stable) and the seven region states as defined in VisionAir.v1.2 §7.1 and VisionAir.v1.3 §6.1

**Must not violate:**
- truth-status fidelity under visual pressure (e.g. animation or compositional simplification that drops Confirmed vs Suggested distinctions is forbidden)
- the event-handling model — visual interactions must produce the typed runtime events in §4; they cannot introduce new event classes outside the spec
- the no-silent-mutation rule — no visual affordance (hover-to-confirm, scroll-to-dismiss, proximity-to-accept) may promote truth-status

---

## 8. One-Sentence Addition to the Chain

VisionAir.v1.6 turns VisionAir from a governed specification into an **actively operating process** — defining the cycle, events, and orchestration discipline that make every prior layer's commitments enforceable in real time, under live signal, without collapsing trust under performance pressure.

---

## 9. Preservation

The VisionAir.v1.6 primary artifact (`docs/orchestration/runtime/VisionAir.v1.6_runtime_orchestration_execution_model.md`) remains authoritative. This report does not replace it, does not rewrite it, and does not restate it section by section — per the VisionAir Report Contract.
