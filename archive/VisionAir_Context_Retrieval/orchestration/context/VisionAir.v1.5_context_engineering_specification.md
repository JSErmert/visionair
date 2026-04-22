# VisionAir.v1.5 — Context Engineering Specification

**Document type:** Foundational context architecture  
**Project:** VisionAir  
**Iteration:** VisionAir.v1.5  
**Phase:** Context-engineering definition  
**Date:** 2026-04-16  
**Runtime class:** conceptual_foundation  
**Status:** authoritative_draft  

**Governed by:**
- **AlignFlow** (Alignment Flow) — readiness-gated retrieval, maturation-aware context scoping, sequencing of what context is loaded when
- **AROD** (Adaptive Realism and Opportunity Discipline) — truth-status preservation through every context operation, contradiction detection surface, provenance discipline
- **AMO** (Adaptive Multithreaded Orchestration) — branch-aware retrieval, Guided Continuation context lifecycle, reconvergence without history loss

**Inherits from:**
- VisionAir.v1.1 — Core Intelligence Architecture (what the system thinks)
- VisionAir.v1.2 — Interaction Architecture (how the user experiences that thinking)
- VisionAir.v1.3 — Technical Foundation Specification (how the system is technically structured)
- VisionAir.v1.4 — Security, Privacy, and IP Trust Protocol (how the system holds user trust)

**Also governed by:**
- VisionAir Output Contract — save → print → continue, non-truncation, copy-paste safety
- VisionAir Report Contract — decision-impact reports, not coverage recap

---

## 1. Executive Definition

**VisionAir.v1.5 — Context Engineering Specification** is the governing system that ensures VisionAir **remembers correctly, retrieves correctly, and reasons coherently over time**.

Where VisionAir.v1.3 §7 established the *baseline* context model (what is persistent vs ephemeral, user-confirmed vs system-suggested, and the inviolable truth-status distinctions), VisionAir.v1.5 defines the *strategy* — how memory is composed, retrieved, prioritized, compacted, and surfaced during runtime, across sessions, and under Guided Continuation.

This document governs:

- **memory fidelity** — what the system remembers, with what provenance, and with what label
- **retrieval precision** — what is loaded for which reasoning step, and nothing more
- **context prioritization** — what takes precedence when context budget is finite
- **continuity** — how projects survive session boundaries, device transitions, and Guided Continuation runs
- **contradiction detection support** — how retrieval gives AROD enough signal to notice inconsistency without silently resolving it

VisionAir.v1.5 is the layer that transforms VisionAir from a set of governed documents into a **coherent, persistent intelligence system**. It sits above VisionAir.v1.3's technical layers and below any runtime orchestration logic (VisionAir.v1.6). It is bound by VisionAir.v1.4's trust protocol at every retrieval and summarization boundary.

This is **not** implementation, prompt-engineering detail, or model selection. It is the governing specification for memory, retrieval, and reasoning continuity.

---

## 2. Why This Document Exists

VisionAir has, across v1.1 through v1.4, committed to a set of behaviors that are unbuildable without a disciplined context layer:

- Guided Continuation Mode continues thinking while the user is away — but must never silently promote Suggested content, which means the context layer must preserve provenance through every summarization
- Re-entry lands the user at the mid-level Growth Map on the most recent active region — which means the context layer must compute "most recent active" from retained history, not guess
- AROD detects contradiction across confirmed content — which means the context layer must retrieve enough related content to notice contradictions, without exposing too much
- VisionAir.v1.4 forbids cross-project leakage and casual observability exposure — which means retrieval is a trust boundary, not just a performance concern
- The seed is preserved verbatim, forever — which means no compaction pass may ever touch it

These commitments do not hold if context retrieval is ad-hoc. VisionAir.v1.5 makes the contract explicit before runtime orchestration (VisionAir.v1.6) is built on top of it.

---

## 3. Context Class Model

VisionAir distinguishes ten context classes. Every piece of context in the system belongs to exactly one class. Each class has a defined role, persistence requirement, and sensitivity level (aligned with VisionAir.v1.4).

### 3.1 Seed Context
**Role:** the user's original statement, preserved verbatim; the gravitational center of every retrieval.  
**Persistence:** permanent for the life of the project.  
**Sensitivity:** highest (VisionAir.v1.4 §3.1). Never compacted, never paraphrased, never omitted from Tier 1.

### 3.2 Confirmed User Truth
**Role:** content the user has explicitly committed to any region or branch; the authoritative substrate.  
**Persistence:** permanent unless explicitly retracted by the user.  
**Sensitivity:** highest (VisionAir.v1.4 §3.2). Never silently rewritten. Label is inviolable.

### 3.3 Suggested System Content
**Role:** orchestration-proposed content awaiting user action; informative but non-authoritative.  
**Persistence:** lifecycle-bound (Pending → Presented → Confirmed / Modified / Rejected / Expired per VisionAir.v1.3 §8.1).  
**Sensitivity:** equal to the project (VisionAir.v1.4 §3.5). Always carries its **Suggested** label into every retrieval.

### 3.4 Derived Summaries
**Role:** compressed expressions of persisted content, produced to keep reasoning within budget.  
**Persistence:** regenerable from source; retained while the source does.  
**Sensitivity:** inherits source sensitivity (VisionAir.v1.4 §13.2). Always labeled **Derived**.

### 3.5 Branch History
**Role:** the active, collapsed, and retired branch set with ranking transitions and the signal that caused each.  
**Persistence:** permanent; collapsed branches are hidden, not deleted (VisionAir.v1.2 §10.6, VisionAir.v1.3 §7.7).  
**Sensitivity:** high (VisionAir.v1.4 §3.4). Rejected branches are often the most revealing data in a project.

### 3.6 Clarification History
**Role:** the sequence of prompts fired, answered, skipped, or aged out, with each answer's effect on region state and ranking.  
**Persistence:** permanent at detail level; compactable at summary level.  
**Sensitivity:** high (VisionAir.v1.4 §3.3). Answers often contain personal disclosure.

### 3.7 Guided Continuation Suggestions
**Role:** suggestions generated while the user was unavailable, with full metadata (reason, confidence, reversibility, anchor).  
**Persistence:** lifecycle-bound; expired suggestions retained with reason (VisionAir.v1.3 §8.1).  
**Sensitivity:** high (VisionAir.v1.4 §3.5). Rejection pattern is itself sensitive.

### 3.8 Blueprint History
**Role:** prior blueprint snapshots the user explicitly saved; enables comparison across project evolution.  
**Persistence:** permanent for saved snapshots; otherwise derivable on demand.  
**Sensitivity:** highest (VisionAir.v1.4 §3.6). The blueprint is the consolidated plan.

### 3.9 Synthesis History
**Role:** prior Stabilizing Synthesis outputs with the user/system state that triggered each.  
**Persistence:** permanent.  
**Sensitivity:** equal to project (VisionAir.v1.4 §3.7). Syntheses often land at identity-fragile moments.

### 3.10 Re-Entry Context
**Role:** the composed "where you stopped / what changed / what's next" surface data; derived on each re-entry.  
**Persistence:** regenerated at re-entry; the prior re-entry surface is not cached and reused.  
**Sensitivity:** inherits project sensitivity. Derived, labeled as such.

---

## 4. Persistent vs Ephemeral Context

### 4.1 Persistent

The following is persistent for the life of the project (subject to user deletion per VisionAir.v1.4 §11):

- the seed
- confirmed content on any region or branch
- branch structure, including active and collapsed branches
- unresolved weak regions and their weakness reasons
- suggestion lifecycle states (Pending / Presented / Confirmed / Modified / Rejected / Expired)
- ranking history (current ranking, prior rankings, transition signals)
- clarification history
- blueprint snapshots the user explicitly saved
- synthesis history

### 4.2 Ephemeral

The following is ephemeral and must not outlive the interaction that produced it:

- zoom state, pan position, current viewport
- UI focus (currently opened region, currently hovered branch)
- draft inputs not yet submitted
- transient reasoning candidates (region candidacy before first appearance, ranking candidates that never become live)
- currently foregrounded prompt selection (**recomputed on every re-entry**, not persisted)

### 4.3 The Inviolable Rule

> **Ephemeral context must never mutate persistent state.**

A zoom action does not change what is confirmed. A hover does not promote a suggestion. A draft that was never submitted is not part of the project's truth. This rule is enforced at every layer that touches context, not just at the UI.

---

## 5. Retrieval Strategy

Every reasoning step in VisionAir retrieves a specific, bounded slice of context. Full-history loading is prohibited.

### 5.1 Governing Principles

- **Minimal sufficient context** — retrieve what the step requires to reason correctly, and nothing more. If a region-local decision does not need the full branch set, the full branch set is not loaded.
- **Relevance-based retrieval** — relevance is determined by the reasoning step (not by "might be useful"). The step declares what it needs; retrieval delivers exactly that.
- **No full-history loading** — the system must never, as a default, load the entire project into context. This is a hard rule: even when budget technically allows, "load everything" is a degraded design that makes subsequent discipline (prioritization, compaction, contradiction surfacing) impossible.

### 5.2 Per-Step Retrieval Contracts

Each reasoning step operates on a defined context scope:

- **Clarification generation** — retrieves: the currently weak region, its weakness reasons, the regions it is structurally adjacent to, and the seed. Does **not** retrieve: full branch history, synthesis history, or Guided Continuation suggestion content.
- **Branch ranking** — retrieves: the active branch set with their distinguishing regions, the confirmed content on those regions, current ranking, and the signal that triggered re-ranking. Does **not** retrieve: collapsed branch content, clarification text.
- **Guided Continuation generation** — retrieves: the currently Weak or Unformed regions, relevant confirmed truths, recent clarification outcomes, and any previously Rejected suggestions on those regions (to avoid repetition). Does **not** retrieve: content on unrelated branches or regions already at Stable.
- **Synthesis generation** — retrieves: current region states, confirmed content on load-bearing regions, branch ranking and convergence signals, user-state signals, and seed type. Does **not** retrieve: collapsed branches, full clarification history.
- **Blueprint generation** — retrieves: the recommended branch's load-bearing regions (all Confirmed or Execution-Ready content), constraints region, execution-paths region, and the seed. Does **not** retrieve: rejected branches, Suggested content that was never confirmed.
- **Re-entry** — retrieves: full region set with current states, current branch ranking, unresolved weak regions, Pending Guided Continuation suggestions, and enough interaction history to compute the most-recent-active region. Does **not** retrieve: every prior prompt, every prior suggestion, or cached stale prompts.

### 5.3 Retrieval as a Trust Boundary

Retrieval is not only a performance concern. Every retrieval is a moment at which content crosses a layer boundary and could accidentally leak into observability, cross-project inference, or insufficiently-labeled output. Retrieval must honor VisionAir.v1.4 §7 (confidentiality), §9 (logging), and §13 (privacy-context interaction) at every call.

---

## 6. Context Window Prioritization

When the total retrieval budget is finite (which is always the case at runtime), context is prioritized by tier. Lower tiers are loaded only after higher tiers are satisfied.

### 6.1 Tier 1 — Non-Negotiable

Always loaded, at full fidelity, for every reasoning step:

- **the seed** (verbatim)
- the **active region** (the region the current reasoning step operates on)
- **confirmed truths** on regions load-bearing for the current step
- **current branch ranking** (the ranking itself, not the full history)

Tier 1 is never summarized. If Tier 1 alone exceeds budget, the budget is wrong and must be increased — Tier 1 is not negotiable.

### 6.2 Tier 2 — Relevance-Gated

Loaded when the step's retrieval contract (§5.2) requires them, at full fidelity where possible, summarized only when necessary:

- **recent clarifications** (bounded window, typically the N most recent that materially affected state)
- **relevant suggestions** (Pending / Presented suggestions anchored to the active region or branch)
- **active weak regions** (weak regions that are candidates for the next clarification or that affect branch ranking)

### 6.3 Tier 3 — Demand-Gated

Loaded only when explicitly required by the step:

- **collapsed branches** (retrieved only when branch-history reasoning is needed — §8)
- **older synthesis** outputs (retrieved only when a new synthesis must relate to prior ones, or when the user asks to compare)
- **older blueprint snapshots** (retrieved only on explicit comparison request)

### 6.4 The Governing Rule

> **Context selection must be intentional, not exhaustive.**

Retrieval is a decision, not a default. A step that loads Tier 3 context "just in case" violates this rule and creates the downstream pressure that causes truth-status collapse under compaction.

---

## 7. Summary / Compaction Rules

### 7.1 When Compaction Is Allowed

Compaction is allowed when:

- a context class grows unboundedly (clarification history, ranking history, suggestion history) and Tier 2/3 retrieval would otherwise exceed budget
- the compacted form is **regenerable** from the source (source is retained)
- the summary is produced with full truth-status and provenance preservation (§7.3)

Compaction is **not** a substitute for retrieval discipline. A step that needs minimal-sufficient context first (per §5) rarely needs compaction second.

### 7.2 What Must Never Be Compacted

The following are never compacted, summarized, or paraphrased — under any budget pressure:

- **the seed** — verbatim, forever
- **confirmed truths** — the user's words, as the user wrote them
- **truth-status labels** (Confirmed / Suggested / Derived / Weak / Stable / Execution-Ready) — the label is part of the content

A compaction pass that collapses any of these violates the specification and is rejected.

### 7.3 Summary Requirements

Every summary must preserve:

- **provenance** — what was the source (which regions, which clarifications, which branches), and whose content was it (user-confirmed vs system-suggested vs already-derived)
- **truth-status** — Confirmed content in the summary is still labeled Confirmed; Suggested content is still labeled Suggested; the summary itself is labeled **Derived**
- **regenerability** — enough source detail is retained that a future operation can expand the summary back to detail on demand

### 7.4 The Summary Label Rule

> Every summary is labeled **Derived**.

A summary is never labeled Confirmed (even if all its sources were Confirmed), never Suggested (even if all its sources were Suggested), and never anything else. Derived is its own truth-status tier and must be distinguishable from both Confirmed and Suggested at every downstream retrieval.

---

## 8. Branch History Retrieval

Branch history is Tier 3 context (§6.3) — not loaded by default. It is retrieved on demand under the following conditions.

### 8.1 When Collapsed Branches Resurface

A collapsed branch resurfaces into reasoning when:

- a new signal (clarification answer, user correction) materially changes the ranking landscape such that the collapsed branch may become viable again
- the user explicitly asks to compare the current direction against alternatives
- AMO's re-ranking logic detects that a retired branch's premise has been invalidated (e.g. a constraint the branch was rejected for no longer applies)

A collapsed branch never auto-resurfaces purely because a reasoning step has extra budget. The trigger is signal-based.

### 8.2 When Rejected Paths Matter

Rejected Guided Continuation suggestions inform **Guided Continuation retrieval** (§5.2) specifically to prevent repetition — the system must not re-propose what the user already rejected without signal that the premise has changed. Beyond that, rejection history is quiet: it is not retrieved for branch ranking, clarification generation, or synthesis.

### 8.3 How Branch History Influences Decisions

When retrieved, branch history influences reasoning by:

- providing the signal that caused each prior re-ranking, so the current decision can evaluate whether that signal still holds
- exposing trade-offs that were previously considered, so alternatives can be compared without re-deriving them
- surfacing the strategic reasoning behind collapses, so the user sees *why* a path was retired, not just that it was

### 8.4 Avoiding Stale Branch Noise

To prevent branch history from becoming noise:

- collapsed branches default to **not loaded**; load is explicit (§8.1)
- when loaded, collapsed branches carry a visible "collapsed because X" marker, so reasoning treats them as historical, not active
- retired branches (explicit user decision) are distinguished from collapsed branches (ranking-driven) — retired branches require a stronger signal to resurface

---

## 9. Contradiction Drift Prevention

### 9.1 Retrieval of Relevant Confirmed Truths

For AROD to detect contradiction, retrieval must surface enough Confirmed content that the new content being evaluated can be compared against it. Specifically:

- when new Confirmed content is being added to a region, retrieve: adjacent region Confirmed content, branch-defining Confirmed content, and seed context
- when a branch is being re-ranked, retrieve: the Confirmed content that originally supported each branch's viability
- when synthesis is being generated, retrieve: Confirmed content across load-bearing regions, so the synthesis cannot internally contradict itself

### 9.2 Detection of Conflicting States

Contradiction detection operates on retrieved Confirmed content. The context layer's responsibility is to **make detection possible**; AROD's responsibility is to recognize inconsistency. The detection outputs:

- a flagged inconsistency (which regions, which Confirmed statements, what conflict)
- the flag is attached to the relevant regions as a distinct weakness signal (VisionAir.v1.3 §7.8)
- the flag is surfaced to the user, not silently reconciled

### 9.3 No Silent Overwrites

The context layer must **never**:

- rewrite Confirmed content to eliminate a detected contradiction
- omit a Confirmed statement from retrieval because it conflicts with a more recent one
- mark one of two conflicting Confirmed statements as "outdated" without explicit user action
- compact two conflicting Confirmed statements into a single derived statement that paper-overs the conflict

### 9.4 The Governing Rule

> **Contradiction is surfaced, not resolved automatically.**

If two user-confirmed statements conflict, the user is the only authority that can resolve them (VisionAir.v1.3 §7.8). The context layer's job is to make the conflict visible. The system does not play referee in the user's thinking.

---

## 10. Re-Entry Context Logic

Re-entry is a first-class context operation. It is not "loading the project" — it is composing the surface the user lands on, per VisionAir.v1.2 §13.

### 10.1 What Loads on Re-Entry

On re-entry, the following is retrieved:

- full region set with current states and weakness reasons
- current branch ranking
- all unresolved Pending Guided Continuation suggestions with full metadata (VisionAir.v1.3 §8.5)
- enough interaction history to determine the most-recent-active region
- enough seed-type-contextual framing to make re-entry tone-appropriate (capability-seed identity sensitivity, for example)

The following is **not** loaded on re-entry:

- full clarification history (loaded on demand if the user zooms into a region's history)
- collapsed branches (loaded only if §8.1 conditions apply)
- older synthesis outputs (loaded only on explicit user request)
- the previously-foregrounded prompt (§10.3)

### 10.2 Determining "Where the User Left Off"

"Most recent active region" is computed from persisted interaction history — not guessed. The context layer records enough interaction metadata (which region was engaged, when, by what kind of act) to produce this deterministically. A re-entry that lands the user somewhere other than where they last engaged is a retrieval failure, not a UX choice.

### 10.3 Recomputing the Next Prompt

The **next-most-important prompt** is recomputed at re-entry, not retrieved from last session.

Reasoning: Guided Continuation may have changed the weakness landscape while the user was away. The prompt that was most important at the end of last session may no longer be the most important now. Retrieving a stale prompt and showing it as "next" is a correctness failure that breaks VisionAir.v1.2 §8's rule (*ask only the next most important clarification question*).

Recomputation uses current region states, current weakness rankings (AROD), current branch-impact estimates (AMO), and current user-state signals. The recomputation cost is the correctness budget re-entry must pay.

### 10.4 Surfacing Guided Continuation Outputs

Pending Guided Continuation suggestions are promoted to Presented and surfaced in the *"While you were away"* layer (VisionAir.v1.2 §9.2). Retrieval must supply every suggestion's **full metadata** (Suggested label, reason, confidence, reversibility, anchor) at first paint. A suggestion rendered without its full metadata is a truth-status violation (VisionAir.v1.3 §8.5).

### 10.5 Preserving the Interaction Contract

Everything in this section is a retrieval-layer implementation of the interaction contract in VisionAir.v1.2 §13. The context layer does not invent re-entry behavior; it serves what VisionAir.v1.2 prescribed.

---

## 11. Guided Continuation Context Rules

### 11.1 Suggestion Persistence

Every Guided Continuation suggestion is persistent at the state level from generation until terminal state (Confirmed / Modified / Rejected / Expired). Expired suggestions are retained with their expiration reason. Nothing is silently deleted.

### 11.2 Lifecycle Handling

The context layer exposes the suggestion's current lifecycle state at every retrieval:

- **Pending** — generated but not yet presented (awaiting user return)
- **Presented** — shown in the *"While you were away"* surface
- **Confirmed** — user committed; content integrates into the region or branch, carrying Confirmed status
- **Modified** — user edited before committing; the modified content is Confirmed, original suggestion preserved in history
- **Rejected** — user declined; rejection reason retained if supplied
- **Expired** — aged out without action; expiration reason retained

A retrieval that returns suggestion content without its lifecycle state is a violation.

### 11.3 Retrieval Priority

Pending and Presented suggestions are Tier 2 context when anchored to the active region or branch. Confirmed / Rejected / Expired suggestions are Tier 3 (historical) — retrieved only when Guided Continuation generation needs them to prevent repetition or when the user asks to see past suggestions.

### 11.4 Influence of Rejected Suggestions

Rejected suggestions influence Guided Continuation generation in a specific, bounded way:

- the rejection is treated as signal that the system should not re-propose the same content or a minor variation
- the rejection does **not** block all future suggestions on the same region — signal may change
- the rejection pattern informs suggestion *confidence* on adjacent content (a history of rejections in a region lowers the confidence of new suggestions there, triggering more caution rather than more generation)

### 11.5 Prevention of Repetition Loops

To prevent the system from circling the same content:

- new suggestions are checked against the rejected-suggestion history for the same region/branch before generation completes
- a suggestion that closely resembles a prior rejection is suppressed unless new signal (clarification answer, user correction, ranking change) makes it materially different
- a region that has accumulated many rejections without new signal is a candidate for **not** generating further suggestions — Guided Continuation should stay silent rather than loop

### 11.6 Honoring the Epistemic Contract

All of the above operationalizes VisionAir.v1.1 §11, VisionAir.v1.2 §9, VisionAir.v1.3 §8, and VisionAir.v1.4 §12. Guided Continuation is trusted because its context layer is disciplined — not because its surface is polished.

---

## 12. Truth-Status Preservation

### 12.1 The Five Preserved Statuses

Every retrieval, every summary, every context operation must preserve the distinction between:

- **Confirmed** — the user has explicitly committed this content
- **Suggested** — orchestration-proposed; not yet user-committed
- **Derived** — computed from other persisted state (e.g. summaries)
- **Weak** — a region exists but cannot yet be trusted
- **Stable** — a region is coherent enough to stop being a primary source of fragility

(Execution-Ready is covered in VisionAir.v1.3 §6.1; at the context layer, it is treated as a stronger form of Confirmed for retrieval-priority purposes.)

### 12.2 Why This Matters at the Context Layer

These distinctions are inviolable at the surface (VisionAir.v1.2 §7.1) and at persistence (VisionAir.v1.3 §6.5). They also hold at the **retrieval and summarization** layer, which is the layer most likely to silently collapse them under budget pressure.

A summary that mixes Confirmed and Suggested content without labels, a retrieval that drops the Suggested tag from a suggestion to save tokens, or a compaction pass that merges Derived content with Confirmed content into a single undifferentiated block — each of these breaks the same invariant, at the same layer VisionAir.v1.3 §6.5 identified as load-bearing.

### 12.3 The Governing Rule

> **Context operations must never collapse truth-status distinctions.**

This is the single most important rule in VisionAir.v1.5. Every other rule in this document serves it. A context layer that honors every other discipline but silently collapses truth-status fails its purpose.

---

## 13. Cross-Project Context Boundary

### 13.1 No Cross-Project Memory

A user's projects do not share context. Project A's clarifications, branch history, suggestions, summaries, or syntheses must not inform Project B's retrieval, ranking, suggestion generation, or synthesis — by default, and at every layer.

### 13.2 No Shared Inference

Inference calls made on behalf of Project A do not inject context from Project B. Caches, indexes, or similarity structures that could cause cross-contamination must be scoped per project.

### 13.3 No Context Reuse

Context retrieved for Project A is scoped to Project A's runtime boundary. It is not retained in a shared surface after the reasoning step completes. A retrieval cache (if one exists at implementation time) is per-project, never global.

### 13.4 The Governing Rule

> **Each project is an isolated intelligence space.**

This rule inherits from VisionAir.v1.4 §4.4 and §13.5 and hardens it at the context layer. Any future capability that crosses this boundary (e.g. user-opt-in cross-project context) is an additive, explicit, granular, revocable feature on top of this default — never a relaxation.

---

## 14. Context Decay / Freshness

Context must remain relevant, not just preserved. Preservation without decay produces bloat; bloat produces retrieval pressure; retrieval pressure produces truth-status collapse.

### 14.1 Decay of Stale Suggestions

A Pending suggestion that has not been acted on within a transparent window (defined by AMO policy at implementation time) transitions to **Expired** with a reason such as "aged out without action." Expired suggestions are retained (not deleted) but drop out of Tier 2 retrieval — they remain accessible in history but no longer compete for current attention.

### 14.2 Collapse of Old Branches

A branch that has not been viable under any re-ranking signal over a bounded window of project activity transitions from active to **collapsed**. Collapsed branches retain their full history but are no longer loaded by default. A collapsed branch returns to active status only under the conditions in §8.1.

### 14.3 Regeneration of Summaries

Summaries are not permanent. When their source content changes materially, a summary is regenerated from current source — not incrementally patched. Regeneration preserves the Derived label and updated provenance. Stale summaries are replaced, not retained.

### 14.4 What Does Not Decay

- the seed
- Confirmed truths (decay only by explicit user retraction)
- truth-status labels on historical content
- provenance metadata

### 14.5 The Governing Rule

> **Context must remain relevant, not just preserved.**

Relevance is an active property, not a passive one. A context layer that does not decay is a context layer that will eventually either exceed budget (breaking retrieval) or compress indiscriminately (breaking truth-status). Decay is how freshness and discipline coexist.

---

## 15. Constraints

VisionAir.v1.5 deliberately does **not** define:

- **database schema** — collection shapes, document structures, indexing strategy (VisionAir.v1.3 scope and successor implementation artifacts)
- **storage implementation** — chosen backends, replication, durability mechanics
- **retrieval algorithms** — specific indexing (vector, keyword, hybrid), scoring functions, cache structures
- **model configuration** — provider choice, model version, parameter tuning, prompt wording
- **caching architecture** — cache layers, invalidation rules, locality decisions

VisionAir.v1.5 stays at the **context-engineering specification level only** — what memory and retrieval must be, not how they are implemented. Implementation is VisionAir.v1.6 and successor artifacts' concern.

---

## 16. Success Criteria

VisionAir.v1.5 succeeds when:

- **Memory is correct and stable.** The seed is verbatim forever; Confirmed content is never silently rewritten; the ten context classes are cleanly distinguishable.
- **Retrieval is precise.** Every reasoning step receives exactly the context required to reason correctly, and nothing more. Full-history loading never happens by default.
- **No silent contradiction drift.** AROD receives enough context to detect contradictions; detected contradictions surface as weakness signals; no Confirmed content is silently rewritten to reconcile conflicts.
- **Guided Continuation remains coherent.** Suggestions carry full metadata through every retrieval; rejected suggestions prevent repetition; no suggestion is ever silently promoted to Confirmed.
- **Re-entry feels continuous.** Users land on the most-recent-active region; the next-most-important prompt is fresh, not stale; unresolved weak regions and Pending suggestions are surfaced with full labeling.
- **Truth-status is preserved through every context operation.** Compaction, summarization, and retrieval all preserve Confirmed / Suggested / Derived / Weak / Stable distinctions.
- **Context is not noisy or bloated.** Tier 3 context loads only when required; decay pushes stale content out of active retrieval; relevance is an active discipline.

---

## 17. Next Artifact

The next highest-leverage artifact is:

# VisionAir.v1.6 — Runtime Orchestration & Execution Model

VisionAir.v1.6 should define:

- **runtime loops** — the orchestration cycle that composes retrieval, reasoning, and response within a single interaction
- **orchestration behavior** — how AlignFlow (readiness gating), AROD (truth-status and contradiction discipline), and AMO (branching, continuation, reconvergence) coordinate at runtime
- **prompt execution logic** — how reasoning steps are composed and executed against inference providers, honoring VisionAir.v1.5's retrieval contracts
- **performance constraints** — budget envelopes, latency targets, fallback behavior under pressure, degradation discipline

VisionAir.v1.6 must inherit from VisionAir.v1.1 through VisionAir.v1.5. Where runtime feasibility creates pressure against VisionAir.v1.5's retrieval and truth-status discipline, the discipline wins — runtime must find another way.

---

## 18. Authoritative Implication

VisionAir.v1.5 is binding for all context-engineering work — memory classification, retrieval strategy, window prioritization, compaction discipline, branch-history logic, contradiction-detection support, re-entry composition, Guided Continuation context, truth-status preservation, cross-project isolation, and decay — unless explicitly superseded.

It does not supersede VisionAir.v1.1 through VisionAir.v1.4. The order of authority is:

1. **VisionAir.v1.1** — what the system thinks
2. **VisionAir.v1.2** — what the user experiences
3. **VisionAir.v1.3** — how the system is technically structured
4. **VisionAir.v1.4** — how the system holds the user's trust
5. **VisionAir.v1.5** — how the system remembers, retrieves, and reasons coherently over time

A context decision that would violate any higher-authority document is not a permissible decision. Where the five documents touch, **all five must be honored simultaneously**.
