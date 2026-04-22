# VisionAir.v1.6 — Runtime Orchestration & Execution Model

**Document type:** Foundational runtime architecture  
**Project:** VisionAir  
**Iteration:** VisionAir.v1.6  
**Phase:** Runtime-execution definition  
**Date:** 2026-04-17  
**Runtime class:** conceptual_foundation  
**Status:** authoritative_draft  

**Governed by:**
- **AlignFlow** (Alignment Flow) — stage progression, readiness gating, runtime sequencing of when each phase may advance
- **AROD** (Adaptive Realism and Opportunity Discipline) — runtime truth-status discipline, contradiction surfacing, rejection of AI writes that would violate provenance
- **AMO** (Adaptive Multithreaded Orchestration) — runtime branching, Guided Continuation lifecycle, re-ranking, reconvergence under live signal

**Inherits from:**
- VisionAir.v1.1 — Core Intelligence Architecture (what the system thinks)
- VisionAir.v1.2 — Interaction Architecture (how the user experiences that thinking)
- VisionAir.v1.3 — Technical Foundation Specification (how the system is technically structured)
- VisionAir.v1.4 — Security, Privacy, and IP Trust Protocol (how the system holds user trust)
- VisionAir.v1.5 — Context Engineering Specification (how the system remembers, retrieves, and reasons coherently over time)

**Also governed by:**
- VisionAir Output Contract — save → print → continue, non-truncation, copy-paste safety
- VisionAir Report Contract — decision-impact reports, not coverage recap

---

## 1. Executive Definition

**VisionAir.v1.6 — Runtime Orchestration & Execution Model** is the governing system that defines how VisionAir **operates in real time** — how inputs are processed, how intelligence flows through the governed layers, and how outputs are produced, sequenced, and presented.

Where VisionAir.v1.1–v1.5 defined *what the system is*, VisionAir.v1.6 defines *what the system does, moment by moment, under live signal*. This is the first artifact that treats VisionAir as an actively operating process, not as a structure.

This document governs:

- **execution loops** — the canonical runtime cycle and its stages
- **orchestration flow** — how AlignFlow, AROD, and AMO coordinate per cycle, per event, per session
- **runtime decision-making** — how the system decides what to do next (prompt, suggest, compress, stay silent)
- **output sequencing** — how Growth Map, Blueprint, and Stabilizing Synthesis are triggered and prioritized
- **responsiveness and stability** — how the system stays continuous for the user without compromising correctness or trust

VisionAir.v1.6 is **not** implementation code, specific API calls, or infrastructure configuration. It is the governing model for runtime behavior and execution flow. Implementation choices (frameworks, SDKs, scheduling primitives) inherit from this document and must not violate it.

---

## 2. Why This Document Exists

Every prior VisionAir layer made declarations that only hold if runtime executes them correctly:

- VisionAir.v1.1's reasoning discipline requires that *when* and *how* reasoning runs are governed — not just *what* reasoning decides.
- VisionAir.v1.2's interaction contract (one active prompt, no silent promotion, felt continuous experience) is a runtime invariant that can only be broken by an execution model that doesn't respect it.
- VisionAir.v1.3's technical boundaries (especially §11 AI orchestration boundaries) are enforceable only at runtime writes.
- VisionAir.v1.4's trust protocol depends on every runtime step honoring privacy and provenance.
- VisionAir.v1.5's retrieval contracts are functions with no caller until runtime calls them.

VisionAir.v1.6 is where the structural chain becomes a live system. It defines the loop that carries every earlier commitment into the user's actual experience.

---

## 3. Core Runtime Loop

### 3.1 The Canonical Cycle

Every significant runtime operation follows the seven-stage canonical loop:

1. **Input capture** — a user event or internal trigger enters the system.
2. **Seed classification** — if the project is new, the seed's type (idea / problem / capability) is determined; if the project exists, its seed context is loaded verbatim.
3. **Context retrieval** — per the active reasoning step's retrieval contract (VisionAir.v1.5 §5.2), Tier 1 loads unconditionally, Tier 2/3 load only as required.
4. **Orchestration decision** — AlignFlow, AROD, and AMO coordinate (per §5) to decide what the system should do this cycle: prompt, generate a suggestion, re-rank, compress, or stay silent.
5. **Output generation** — if the orchestration decision produces an output (clarification prompt, Suggested content, synthesis, blueprint), the output is generated through the governed AI boundary and labeled with full truth-status.
6. **State update** — persisted state is updated atomically (per §9). Ephemeral state is updated in place; persistent state transitions are committed as single units.
7. **Render** — the client layer renders the new state. Partial rendering is allowed (§11) so the user sees progress, but final truth is only rendered after state update is committed.

### 3.2 Loop Triggers

The loop executes when:

- a user event arrives (input, answer, confirmation, rejection, branch selection, re-entry)
- a Guided Continuation trigger fires (user has become unavailable per AMO's unavailability signal)
- an internal readiness event fires (AlignFlow determines a region has become Execution-Ready, enabling a new output mode)
- a re-entry occurs (user returns to an existing project)

The loop does **not** execute on polling, clock ticks, or speculative pre-computation without explicit cause.

### 3.3 Loop Boundaries

Each loop execution is scoped to **one logical change** — one event, one orchestration decision, one resulting state transition. A loop does not cascade into unbounded downstream loops. If a state update itself should trigger further work (e.g. a confirmation that unlocks Blueprint availability), that further work enters the queue as a new loop cycle, not as a continuation of the current one.

### 3.4 When the Loop Re-Executes

The loop re-executes when:

- another event is queued behind the current one
- the orchestration decision of this cycle explicitly requests a follow-up cycle (rare; must be governed)
- the state update causes a threshold to cross (e.g. branch maturity tips Blueprint availability), producing a new internal readiness event

Re-execution is always a **new cycle**, never an in-place continuation. This preserves auditability and prevents unbounded chains.

---

## 4. Event Types

VisionAir's runtime recognizes seven first-class event types. Each has a trigger, a handler layer, and a set of state changes.

### 4.1 User Input Events
**Triggered by:** seed submission; any direct user content entry into a region or branch.  
**Handled by:** interaction-state → orchestration → persistence.  
**State changes:** new region content (Confirmed if user committed; Suggested only if attributable to system inference, which cannot happen from a raw user input event); seed lock on first submission.

### 4.2 Clarification Answer Events
**Triggered by:** user answering a foregrounded clarification prompt.  
**Handled by:** orchestration → AROD (weakness resolution) → AMO (possible re-rank) → persistence.  
**State changes:** region content transitions (Weak → Emerging → Suggested or Confirmed depending on the answer's shape); weakness reason cleared or narrowed; branch ranking may update; next-most-important prompt recomputed.

### 4.3 Branch Selection Events
**Triggered by:** user selecting or marking a branch as their intended direction.  
**Handled by:** AMO → persistence.  
**State changes:** recommended branch mark updates; Blueprint availability may activate; ranking history records the selection and its cause.

### 4.4 Confirmation Events
**Triggered by:** user explicit act accepting a Suggested content item, a Presented Guided Continuation suggestion, or a branch recommendation.  
**Handled by:** AROD (validates Suggested → Confirmed transition is permissible) → persistence.  
**State changes:** truth-status transition Suggested → Confirmed on the specific item, with actor, timestamp, and provenance recorded. **Never implicit, never triggered by time, scroll, or proximity** (VisionAir.v1.3 §8.6).

### 4.5 Rejection Events
**Triggered by:** user rejects a Suggested content item or a Guided Continuation suggestion, optionally supplying a reason.  
**Handled by:** AMO → persistence → AROD (records rejection as signal).  
**State changes:** suggestion lifecycle → Rejected; rejection retained with reason; AMO's repetition-prevention surface (VisionAir.v1.5 §11.5) gains signal; adjacent-suggestion confidence may update.

### 4.6 Re-Entry Events
**Triggered by:** user returns to an existing project (explicit open, session restoration, device transition).  
**Handled by:** orchestration → context layer (retrieval per VisionAir.v1.5 §10) → render.  
**State changes:** no persisted-state mutation. Re-entry composes the re-entry surface (VisionAir.v1.3 §5 state object) and recomputes the next-most-important prompt freshly. The previously-foregrounded prompt is discarded, not reused.

### 4.7 Guided Continuation Triggers
**Triggered by:** AMO's unavailability signal (user idle past threshold, session ended, explicit pause) combined with AMO's judgment that useful forward motion remains possible and can be labeled with acceptable confidence.  
**Handled by:** AMO → context → AI orchestration boundary → persistence.  
**State changes:** new Guided Continuation suggestions in **Pending** state, each with full metadata (reason, confidence, reversibility, anchor) per VisionAir.v1.3 §8. No persisted content is ever promoted to Confirmed by this event.

---

## 5. Orchestration Flow

Per cycle, AlignFlow, AROD, and AMO coordinate in a defined interaction pattern. The pattern is not a procedure call chain — each layer operates on its concern and emits decisions that the others must respect.

### 5.1 AlignFlow — Stage Progression and Readiness Gating

At runtime, AlignFlow answers:

- is this region/branch ready for the next stage of development?
- does this confirmation cross a readiness threshold that unlocks a new capability (Blueprint availability, Execution-Ready status)?
- is the project's phase such that expansion should continue, or has readiness shifted toward stabilization or execution?

AlignFlow **gates** transitions. A region does not become Execution-Ready because AI inferred it should; AlignFlow evaluates whether the structural criteria are actually met.

### 5.2 AROD — Truth-Status and Contradiction Discipline

At runtime, AROD answers:

- is this state transition truth-status-legal? (can Suggested become Confirmed via this event?)
- does this new Confirmed content contradict existing Confirmed content?
- is the weakness signal on this region still valid, or can it be relaxed given new signal?
- should a prompt fire here? If yes, what weakness source should it address?

AROD is the **rejection boundary** for runtime writes. Any write that would silently promote Suggested → Confirmed, or would silently reconcile contradicting Confirmed content, is rejected at this layer (VisionAir.v1.3 §11.4, §11.5).

### 5.3 AMO — Branching, Continuation, Reconvergence

At runtime, AMO answers:

- does new signal warrant generating, ranking, or re-ranking branches?
- should Guided Continuation generate suggestions right now?
- is this cycle a good moment to reconverge (compress / synthesize) rather than expand (branch)?
- what suggestions should be generated, at what confidence, with what reversibility?

AMO is the **initiative layer**. It chooses when the system should act on its own (generate, re-rank, continue) versus when the system should wait for user signal.

### 5.4 Per-Cycle Interaction Pattern

A typical cycle's orchestration decision flows:

1. **Event arrives.** The event is tagged with the regions and branches it affects.
2. **Context retrieval.** The relevant retrieval contract loads Tier 1 + necessary Tier 2/3 (VisionAir.v1.5 §5.2).
3. **AROD validates.** If the event would cause a state write, AROD first validates the write against truth-status rules. Rejected writes do not proceed.
4. **AROD evaluates.** AROD updates weakness signals, flags newly-detected contradictions as weakness signals on relevant regions.
5. **AlignFlow gates.** AlignFlow evaluates whether any readiness thresholds crossed; if so, capability unlocks (e.g. Blueprint availability) are emitted as internal events.
6. **AMO decides initiative.** AMO determines whether this is a good moment to generate a prompt, generate Guided Continuation, re-rank branches, or stay silent.
7. **Generation (if AMO says so).** If initiative produces output, it goes through the AI orchestration boundary with full truth-status labeling.
8. **State commit.** Atomic state update per §9.
9. **Render.** Client receives state diff and renders.

### 5.5 Conflicts Between Governing Layers

If AlignFlow, AROD, and AMO would produce conflicting decisions (e.g. AMO wants to generate a suggestion, AROD blocks because the source content is contradictory, AlignFlow blocks because readiness has not crossed threshold), the resolution is **the most restrictive layer wins**. Initiative is subordinate to discipline. The system pauses rather than acts on a conflict it cannot legally resolve.

---

## 6. Prompt Selection Logic

### 6.1 The Governing Invariant

> **Only one active prompt at a time.**

This rule from VisionAir.v1.2 §8.3 is a **runtime invariant**, not only a UX guideline. The runtime enforces it: a second prompt cannot be foregrounded while a first is active; queued prompts are held until the active one is answered, skipped, or aged out.

### 6.2 Should the System Prompt at All?

At cycle end, the runtime evaluates whether a prompt should fire. A prompt fires when **all** of the following hold:

- at least one weak region exists with a legitimate weakness source (per VisionAir.v1.1 §9)
- no prompt is currently active (active = foregrounded, not yet answered/skipped/aged)
- the user is not mid-action (typing in a draft field, mid-gesture, opening a region)
- a settle interval has passed since the last surface change
- not within the first few seconds after a seed plant (users see structure emerge before being invited to deepen it, per VisionAir.v1.2 §8.2)

If any condition fails, the runtime does not prompt this cycle. Waiting is a legitimate decision.

### 6.3 Priority Resolution

When multiple weak regions would each justify a prompt, priority is decided by:

- **Weakness leverage** (AROD) — which weakness most blocks forward motion?
- **Branch impact** (AMO) — will answering this materially re-rank branches?
- **Maturity unlock** (AlignFlow) — will answering this advance a region toward Execution-Ready?
- **User state** — avoid pushing depth questions when the user appears to be skimming or re-orienting.

The runtime combines these signals. Priority is **computed**, not configured — there is no static priority list.

### 6.4 When to Delay Prompting

A prompt is delayed (not canceled) when:

- the user is mid-action
- a previous prompt was just dismissed and the settle interval has not elapsed
- the relevant weak region was just edited by the user (let them finish their thought before asking)
- a Guided Continuation cycle just produced suggestions for the user to review first

Delay is soft: the prompt is queued and fires on the next eligible cycle.

### 6.5 Fallback Behavior

If the runtime cannot select a valid prompt despite weak regions existing (e.g. every candidate is suppressed by user-state signals, or no legitimate weakness source exists on the candidates), the runtime **stays silent this cycle** and re-evaluates on the next event. Generating an arbitrary prompt to fill the silence violates VisionAir.v1.1 §10 and is forbidden.

---

## 7. Guided Continuation Runtime Behavior

### 7.1 When Guided Continuation Runs

Guided Continuation runs when:

- AMO observes a user unavailability signal (idle past threshold, session ended, explicit pause)
- AMO judges that forward motion remains useful (regions exist where content can be proposed with labelable confidence)
- the project is not in a state where Guided Continuation is prohibited (e.g. active contradiction that requires user resolution — see §12.2)

Guided Continuation never runs speculatively or continuously in the background. It runs at defined unavailability transitions.

### 7.2 How Suggestions Are Generated

Each Guided Continuation cycle:

1. Selects the top-N weak regions by leverage (AROD × AMO ranking).
2. For each selected region, composes the retrieval contract (VisionAir.v1.5 §5.2 — Guided Continuation path).
3. Generates candidate content through the AI orchestration boundary.
4. Labels each candidate with reason, confidence, reversibility, and anchor (VisionAir.v1.3 §8).
5. Runs repetition-prevention checks against rejected-suggestion history (VisionAir.v1.5 §11.5).
6. Commits surviving candidates to persistence as **Pending** suggestions.

Low-confidence candidates that cannot be usefully labeled are **suppressed**, not saved. Guided Continuation produces useful suggestions or none — never confidence-washed filler.

### 7.3 How Many Suggestions Can Exist

Guided Continuation is bounded:

- typically 2–3 suggestions per unavailability cycle (per VisionAir.v1.1 §11)
- never more than a small constant globally at any time (AMO policy; exact number is operational tuning, but bounded)
- if a region has accumulated recent rejections without new signal, Guided Continuation suppresses further generation on that region (VisionAir.v1.5 §11.5)

The system prefers **fewer, better-labeled suggestions** to many low-confidence ones.

### 7.4 Repetition Prevention

Before committing a new Pending suggestion, the runtime checks:

- does this closely resemble a prior Rejected or Expired suggestion on the same region/branch?
- if yes, has new signal (clarification answer, user correction, ranking change) arrived that makes the premise materially different?
- if no, suppress the suggestion entirely; do not retry with cosmetic variation.

Repetition with cosmetic variation is treated as a correctness failure, not a feature.

### 7.5 Lifecycle

Each suggestion transitions through:

- **Pending** — generated but not yet presented (user still away)
- **Presented** — shown in the *"While you were away"* surface on re-entry
- **Accepted** — user's explicit Accept act; transitions to Confirmed in persistence; content integrates into the region/branch with Confirmed truth-status
- **Modified** — user edits the content; the modified content becomes Confirmed; original suggestion retained in history
- **Rejected** — user's explicit Reject act, with optional reason; retained in history and informs future suppression
- **Expired** — aged out under transparent window (VisionAir.v1.5 §14.1); retained with expiration reason

No lifecycle transition is implicit. Accept / Modify / Reject are always explicit user acts. Expire is the only non-user transition and is timer-driven, never content-driven.

---

## 8. Output Mode Execution

VisionAir has three output modes (VisionAir.v1.1 §17, VisionAir.v1.2 §11). Runtime selects which mode is produced this cycle.

### 8.1 Growth Map — Default Continuous Rendering

The Growth Map is the **default surface** and renders continuously. Every state update produces a Growth Map diff that the client renders. The Growth Map does not wait for a "generate" trigger — it is live.

State required for render: seed + region set with current states + branch set with rankings + anchored prompts (at most one foregrounded) + any Pending/Presented Guided Continuation suggestions (VisionAir.v1.5 §9.1).

### 8.2 Blueprint — Threshold-Based Generation

Blueprint becomes available only when:

- at least one branch has its load-bearing regions (User, Value Mechanism, System/Product Form, plus seed-type-critical conditionals) at **Confirmed** or **Execution-Ready**
- the user has either explicitly selected that branch or the recommended-branch mark is clear and stable

Blueprint is **not** produced speculatively. It is generated when the threshold is crossed (first time) or when the user explicitly requests a refresh. Between requests, prior Blueprint snapshots persist unchanged.

### 8.3 Stabilizing Synthesis — State-Based Trigger

Stabilizing Synthesis generates when AROD detects a state pattern that warrants compression rather than expansion:

- enough signal exists for orientation (sufficient Confirmed content)
- user-state signals indicate identity fragility or overwhelm (VisionAir.v1.2 §11.3)
- branching has stabilized and further expansion is unlikely to help
- the user explicitly requests synthesis

Stabilizing Synthesis is a **peer mode**, not a fallback (VisionAir.v1.2 §11.4). Runtime must be allowed to choose compression over expansion without the execution model biasing toward "more content."

### 8.4 Selecting and Prioritizing Output Type

When a cycle's orchestration decision produces output, the selected mode is:

- **Growth Map** if the cycle represents a state change (this is almost every cycle)
- **Blueprint** if a Blueprint-threshold crossing event is the cycle's trigger, or on explicit user request
- **Stabilizing Synthesis** if AROD's state-pattern trigger fires, or on explicit user request

Multiple outputs can exist in the same session (Blueprint + Growth Map), but only one is **foregrounded** at a time. The Growth Map remains continuously rendered in the background.

---

## 9. State Update Rules

### 9.1 When State Is Written

Persistent state is written:

- on every Confirmation event (Suggested → Confirmed transitions, region Confirmed content commits)
- on every Rejection event (suggestion lifecycle transitions)
- on every Branch Selection event
- on every generated Guided Continuation commit (Pending suggestions become persistent)
- on every orchestration-driven ranking change
- on every region-state transition (Weak → Emerging → Stable etc., per AlignFlow gating)

Persistent state is **not** written for:

- zoom changes, pan, hover, UI focus (ephemeral)
- draft inputs not yet submitted (ephemeral)
- intermediate reasoning candidates that never become live (ephemeral)

### 9.2 Atomic vs Staged Updates

Every state update is **atomic at the transition boundary**. A write that crosses multiple concerns (region content + truth-status + suggestion lifecycle + ranking) is committed as one unit, or not at all. The client never observes a partial update that would expose an inconsistent map (e.g. a region marked Confirmed with no Confirmed content attached).

Staged updates are permitted only for **ephemeral** composition (drafting, intermediate client-side assembly). Staged state must be explicitly committed through an atomic persistence transition to become real.

### 9.3 Rollback Expectations

If an atomic update fails mid-commit:

- the persistence layer rolls back to pre-transition state
- the runtime records the failure as a diagnostic event (metadata only; no project content in logs per VisionAir.v1.4 §9)
- the client is informed and does not render the failed transition as success
- the originating event is either retried (if transient) or surfaced to the user as a failure (if persistent)

A half-applied update is always a bug, never an acceptable state.

### 9.4 Prevention of Invalid State Transitions

AROD validates every state transition before commit. Invalid transitions include:

- Confirmed → Suggested (once confirmed, content stays confirmed unless explicitly retracted)
- any transition that would silently overwrite Confirmed content (VisionAir.v1.3 §11.2)
- Suggested → Confirmed without an explicit user act
- Rejected → Pending (rejection is terminal for that suggestion instance)
- ranking update without a recorded governing-layer decision

Invalid transitions are rejected at the persistence boundary. The runtime cannot patch around this.

### 9.5 Confirmed vs Suggested Separation at Runtime

Every write the runtime commits carries an explicit truth-status tag. A write that arrives without a tag is rejected. A write that attempts to label AI-generated content as Confirmed is rejected. The runtime honors VisionAir.v1.3 §6, VisionAir.v1.4 §8, and VisionAir.v1.5 §12 at every commit.

### 9.6 No Silent State Mutation

State never mutates as a side effect of:

- time passing
- the user scrolling, zooming, or hovering
- AI inference completing in the background without a labeled output
- rendering or re-rendering

All mutations are explicit, event-driven, and auditable.

---

## 10. Re-Entry Execution Flow

### 10.1 What Happens When a User Returns

On re-entry, the runtime executes a dedicated re-entry cycle:

1. Identity and project scope are authenticated (VisionAir.v1.4 §10).
2. Context retrieval runs the re-entry retrieval contract (VisionAir.v1.5 §10.1).
3. AMO's re-entry surface composer assembles the "where you stopped / what changed / what's next" data.
4. AROD recomputes the **next-most-important prompt** against current region states and weakness landscape (VisionAir.v1.5 §10.3).
5. Pending Guided Continuation suggestions are promoted to Presented, each with full metadata.
6. The client renders the mid-level Growth Map view centered on the most-recent-active region (VisionAir.v1.2 §13.1).

### 10.2 How the System Resumes

The system resumes at the **same point in the project's logical state**, not at a stale UI snapshot. Zoom and pan are reset to the canonical re-entry view (mid-level, centered on most-recent-active region) — the runtime does not try to restore the user's last zoom because zoom is ephemeral (VisionAir.v1.5 §4.2).

### 10.3 How Context Is Refreshed

Context is **freshly retrieved** on re-entry, not carried over from last session:

- retrieval follows the re-entry contract, not a cached blob from last session
- summaries are regenerated if source content has changed since last summary (VisionAir.v1.5 §14.3)
- interaction history is consulted to compute most-recent-active, but only the metadata needed for that computation loads — not the full prior session

### 10.4 How the Next Prompt Is Recalculated

The next-most-important prompt is **always recomputed at re-entry** (VisionAir.v1.5 §10.3). The previously foregrounded prompt is discarded. Recomputation uses current region states, current weakness rankings, current branch-impact estimates, and current user-state signals. A re-entry that shows a stale prompt is a correctness failure.

### 10.5 Preserving Continuity, Correctness, and Trust-State

- **Continuity** — the user lands back in their idea, not on a dashboard (VisionAir.v1.2 §13.1)
- **Correctness** — the prompt, the surfaced suggestions, the current branch ranking all reflect **now**, not last session
- **Trust-state** — Pending suggestions render with full Suggested labeling at first paint; nothing has been silently promoted; unresolved weak regions persist with their reasons (VisionAir.v1.2 §13.3)

---

## 11. Performance & Responsiveness

### 11.1 The Governing Rule

> **The system must feel continuous, not blocked.**

### 11.2 Latency Boundaries

- **Deterministic operations** (state writes, ephemeral UI updates, context retrieval of Tier 1): target sub-200ms user-perceived latency
- **AI-inference operations** (orchestration decisions that require model calls, Guided Continuation generation, synthesis generation): target sub-2s user-perceived latency, but if longer is required, partial rendering (§11.3) must keep the user oriented
- **Re-entry**: target sub-500ms to mid-level Growth Map render; next-prompt recomputation and suggestion rendering may complete in a follow-up partial update

These are governing targets, not implementation SLAs. Actual tuning is an operational concern.

### 11.3 Partial Rendering

When a cycle would exceed latency targets, the client renders in stages:

- **Stage 1 (immediate)**: the deterministic state diff — region state changes, ranking updates, new Pending suggestion placeholders with metadata
- **Stage 2 (on completion)**: AI-generated content bodies (suggestion text, synthesis paragraphs) fill in as inference completes

Stage 1 must always be correct and complete in its scope. Stage 2 is the content filling in. A placeholder that misrepresents truth-status is forbidden — a Pending suggestion placeholder renders with its Suggested label and metadata even before the content body arrives.

### 11.4 Async Processing

Orchestration and AI inference are **async by default**. State writes are **sync at the persistence boundary**: even if content generation is async, the persistence transition that commits the content is atomic. This preserves §9.2's atomicity while allowing the user to remain unblocked.

Guided Continuation runs entirely async with respect to any current user session. Its completion produces Pending suggestions that surface on next re-entry, not in the current session.

### 11.5 User-Perceived Responsiveness

The user must perceive:

- every direct action (confirm, reject, answer a prompt, select a branch) producing immediate visible response (state diff renders within latency targets)
- the map never "freezing" while waiting for the system to think
- clear distinction between "deterministic action complete" and "system still composing the surrounding context"

A user who clicks Confirm and waits 3 seconds staring at a motionless screen is experiencing a correctness failure at the runtime layer, not a tuning problem.

### 11.6 Degradation Discipline

Under performance pressure (slow inference, backend latency, budget pressure), the runtime degrades in a defined order:

1. **First, reduce Tier 3 context load.** If a cycle doesn't strictly need older synthesis, skip loading it.
2. **Second, defer Guided Continuation.** If generation latency would exceed targets, skip the cycle; try again later.
3. **Third, simplify the cycle output.** Skip speculative suggestion generation; render the deterministic state diff and move on.
4. **Last resort — and never** reduce truth-status fidelity, skip labels, or collapse Confirmed/Suggested distinctions. Degradation never reaches the trust layer.

---

## 12. Failure Modes

### 12.1 Incomplete Context

**Condition:** retrieval cannot load Tier 1 context (seed, active region, confirmed truths) — typically a persistence failure or identity boundary failure.  
**Behavior:** the cycle is aborted. The runtime does not proceed with incomplete Tier 1. The user is shown a loading-or-error indicator, not a partial map that implies the project has a different state. No inferred content fills gaps.

### 12.2 Conflicting State

**Condition:** AROD detects a contradiction between Confirmed statements during retrieval or during a write attempt.  
**Behavior:** the contradiction is **surfaced, not resolved** (VisionAir.v1.5 §9.4). The involved regions receive a distinct weakness signal. Guided Continuation is **paused on the affected branch** until the user resolves the contradiction. A generation cycle does not complete its output if it would be generated against unresolved contradiction.

### 12.3 Missing Data

**Condition:** a specific state object expected by the cycle is absent (e.g. a branch referenced by ranking history no longer exists; a suggestion referenced by a lifecycle event has been deleted).  
**Behavior:** the cycle treats the missing object as an integrity event. Deterministic operations that don't require the missing object proceed. The missing-object reference is logged as a diagnostic (metadata only, no project content). The affected feature degrades gracefully (e.g. ranking history visualization omits the missing branch rather than fabricating one).

### 12.4 Invalid Transitions

**Condition:** a state write attempts a transition AROD rejects (Confirmed → Suggested, silent Suggested → Confirmed, unauthorized overwrite).  
**Behavior:** the write is rejected at the persistence boundary (VisionAir.v1.3 §11.4). The originating event's handler receives the rejection and surfaces it as an error — never quietly drops it. The user sees that their action did not complete, with a legible reason if applicable. The runtime never retries an invalid transition with altered parameters to "make it work."

### 12.5 AI Inference Failure

**Condition:** an AI inference call fails (network, provider, timeout, malformed output).  
**Behavior:** the cycle's generation step is abandoned for this cycle. No content is committed. The state diff that would have accompanied the generation is still committed if it is deterministically valid without the generation. The failure is recorded as a diagnostic. The user either sees no new content this cycle (acceptable — silence is a legitimate outcome) or receives a non-technical indicator that the system tried and didn't produce this round.

### 12.6 Budget Exhaustion

**Condition:** context retrieval budget cannot accommodate even Tier 1 for a step.  
**Behavior:** the budget is wrong (VisionAir.v1.5 §6.1). The runtime escalates the condition as a correctness failure, not a degradation signal. Tier 1 is never summarized or truncated to fit.

---

## 13. Execution Constraints

VisionAir.v1.6 deliberately does **not** define:

- **API-level design** — endpoint shapes, request/response schemas, RPC vs REST vs streaming choices
- **model provider selection** — which inference provider, which model version, which model-specific parameters
- **infrastructure configuration** — hosting, regions, scaling policies, networking topology
- **threading / async implementation specifics** — concurrency primitives, scheduler choice, work-stealing vs fixed pools
- **storage/cache implementation** — see VisionAir.v1.3 and VisionAir.v1.5 constraints
- **observability implementation** — see VisionAir.v1.4 §9 for the discipline; specific tooling is operational

VisionAir.v1.6 stays at the **runtime-model level only**. Implementation artifacts inherit from it.

---

## 14. Success Criteria

VisionAir.v1.6 succeeds when:

- **The system behaves consistently.** Every cycle follows the canonical seven-stage loop; no ad-hoc execution paths exist.
- **Prompts feel intelligent and timed correctly.** One active prompt at a time; no prompts during user-midaction; priority is computed from current signal; delay is a valid outcome.
- **Outputs feel responsive.** Deterministic updates render within sub-200ms; AI-generated content uses partial rendering so the user is never blocked; the map is always live.
- **No state corruption occurs.** Every state update is atomic at its transition boundary; invalid transitions are rejected; Confirmed vs Suggested separation holds through every write.
- **Guided Continuation works without confusion.** Suggestions are Pending while the user is away, Presented on re-entry with full labels, and transition only on explicit user acts.
- **Re-entry works seamlessly.** Users land on the most-recent-active region; next-prompt is fresh; Pending suggestions surface with full metadata; continuity, correctness, and trust-state are all preserved.

---

## 15. Next Artifact

The next highest-leverage artifact is:

# VisionAir.v1.7 — UI / Visual System Architecture

VisionAir.v1.7 should define:

- **visual language** — the palette, typography, shape, and spatial system that expresses VisionAir's metaphor (seed / roots / growth / branches / maturity)
- **map rendering system** — how the Growth Map is composed, transformed across zoom levels, and hit-tested under interaction
- **motion and animation rules** — when motion carries meaning (state transitions, re-ranking, branch collapse), when motion is decorative (never), and the motion discipline that prevents animation from distracting from intelligence
- **visual state encoding** — how the seven canonical region states and the five surface states (Confirmed / Suggested / Derived / Weak / Stable) are visually encoded, legibly and consistently

VisionAir.v1.7 must inherit from VisionAir.v1.1 through VisionAir.v1.6. It is the first artifact where expressive design choices begin to appear — but those choices must serve, never weaken, the interaction and trust contracts established upstream.

---

## 16. Authoritative Implication

VisionAir.v1.6 is binding for all runtime-execution work — loop structure, event handling, orchestration flow, prompt selection, Guided Continuation runtime, output triggering, state-update discipline, re-entry execution, performance, and failure-mode behavior — unless explicitly superseded.

It does not supersede VisionAir.v1.1 through VisionAir.v1.5. The order of authority is:

1. **VisionAir.v1.1** — what the system thinks
2. **VisionAir.v1.2** — what the user experiences
3. **VisionAir.v1.3** — how the system is technically structured
4. **VisionAir.v1.4** — how the system holds the user's trust
5. **VisionAir.v1.5** — how the system remembers, retrieves, and reasons coherently over time
6. **VisionAir.v1.6** — how the system operates in real time

A runtime decision that would violate any higher-authority document is not a permissible decision. Where the six documents touch, **all six must be honored simultaneously**.
