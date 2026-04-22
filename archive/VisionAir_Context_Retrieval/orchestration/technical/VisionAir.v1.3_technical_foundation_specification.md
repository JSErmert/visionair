# VisionAir.v1.3 — Technical Foundation Specification

**Document type:** Foundational technical architecture  
**Project:** VisionAir  
**Iteration:** VisionAir.v1.3  
**Phase:** Technical-foundation definition  
**Date:** 2026-04-16  
**Runtime class:** conceptual_foundation  
**Status:** authoritative_draft  

**Governed by:**
- **AlignFlow** (Alignment Flow) — structural sequencing of technical layers, phased emergence of capability, readiness-gated implementation progression
- **AROD** (Adaptive Realism and Opportunity Discipline) — truth-status persistence, state integrity, boundary discipline between user-confirmed and system-suggested data
- **AMO** (Adaptive Multithreaded Orchestration) — orchestration boundary between deterministic state and AI-generated output, branch and continuation lifecycle at the system level

**Inherits from:**
- VisionAir.v1.1 — Core Intelligence Architecture (what the system thinks)
- VisionAir.v1.2 — Interaction Architecture (how the user experiences that thinking)

**Also governed by:**
- VisionAir Output Contract — save → print → continue, non-truncation, copy-paste safety

---

## 1. Executive Definition

**VisionAir.v1.3 — Technical Foundation Specification** is the layer that converts VisionAir's governed intelligence (VisionAir.v1.1) and governed interaction (VisionAir.v1.2) into a coherent technical system architecture.

Where VisionAir.v1.1 defines *what the system thinks* and VisionAir.v1.2 defines *what the user experiences*, VisionAir.v1.3 defines *how the system must be technically structured* to make both of those deliverable, durable, and trustworthy over time.

This document governs:

- **the technical shape of the product** — what kind of system it is, at the architecture level
- **system boundaries** — what layers exist and what each is responsible for
- **the memory and continuity model** — how projects live beyond a single session
- **project persistence assumptions** — what must be preserved, what may be ephemeral
- **the frontend / backend responsibility split** — where logic lives and where data lives
- **context continuity expectations** — what the system must remember, at what fidelity
- **future implementation constraints** — what implementation must honor, regardless of stack detail

VisionAir.v1.3 is explicitly **above** the level of final code, exact package selection, final database schema, and deployment infrastructure. It is **below** VisionAir.v1.1 and VisionAir.v1.2 — both of which remain authoritative over it. Where a technical trade-off would violate VisionAir.v1.1 or VisionAir.v1.2, the trade-off is rejected, not accommodated.

---

## 2. Why This Document Exists

VisionAir.v1.2 established a binding interaction contract. That contract is unbuildable without a technical foundation that can hold it. Specifically, VisionAir.v1.2 requires:

- persistent projects the user can leave and return to without loss
- a map that faithfully expresses region states (Weak / Suggested / Confirmed / Stable / Execution-Ready)
- Guided Continuation Mode outputs that survive session boundaries without silently promoting Suggested → Confirmed
- branch ranking that can re-rank visibly as new signal arrives
- output modes (Growth Map, Blueprint, Stabilizing Synthesis) each drawing on the same authoritative project state
- re-entry that feels like resumption, not restart

Those requirements imply technical decisions. This document makes them at the architecture level, intentionally leaving implementation detail to later iterations.

---

## 3. Technical Direction

### 3.1 Frontend Direction — Flutter / Dart

VisionAir v0.1's recommended frontend direction is **Flutter / Dart**.

**Why this fits VisionAir:**

- **Mobile integration.** VisionAir is a visual, touch-native product metaphor (seed → regions → branches → maturity). Mobile-first gestural interaction is not a secondary channel; it is a primary surface. Flutter treats mobile as a first-class target without making desktop an afterthought.
- **Custom visual interaction.** VisionAir's Growth Map is not a standard widget composition. Regions, anchored prompts, branch paths, state cues, and zoom behavior require a low-level canvas-style rendering model with predictable frame behavior. Flutter's rendering pipeline supports this natively.
- **Zoomable map behavior.** VisionAir.v1.2 §12 defines three zoom levels (zoomed-out, mid-level, zoomed-in) with detail-follows-attention. Flutter gives direct control over transform-based viewports, hit-testing across zoom levels, and per-level detail composition.
- **Shared codebase potential.** The interaction contract applies equally on phone, tablet, and desktop. A single codebase shrinks the gap between *what VisionAir.v1.2 describes* and *what is actually delivered* across form factors.
- **Greenfield product suitability.** VisionAir has no legacy frontend constraints. Adopting a cohesive, opinionated UI toolkit at the start reduces architectural debt and accelerates first-version iteration.

This recommendation is a **direction**, not an implementation specification. Exact widget strategy, state management approach, and package selection are deferred.

### 3.2 Backend / Persistence Direction — Firebase

VisionAir v0.1's recommended backend and persistence direction is **Firebase**.

**Why this fits VisionAir:**

- **Authentication.** VisionAir stores user-generated business creation context (see §12). Identity must exist from day one. Firebase Authentication provides this as a managed primitive.
- **Project / session persistence.** VisionAir projects are long-lived, session-crossing artifacts. Firestore's document model maps naturally to project state objects (seed, regions, branches, suggestions) without requiring up-front relational schema design — appropriate for a product whose state model is still maturing.
- **Cloud storage needs.** Blueprint exports, synthesis outputs, and any future attachments require object storage. Firebase's storage primitive integrates with the same auth and access boundary.
- **Fast greenfield iteration.** The interaction contract will continue to evolve as the product is used. A backend that does not force a settled schema before first value is delivered preserves iteration speed.
- **Compatibility with Flutter.** The Flutter/Firebase integration path is direct and well-supported. This shortens the distance between interaction-contract changes and persisted behavior changes.
- **Support for continuity across devices / sessions.** VisionAir.v1.2 §13 requires re-entry resumption. A cloud-native persistence primitive makes this the default case, not the special case.

This recommendation is an **early-stage architectural direction**. As the product matures, the backend may evolve (e.g. dedicated services around orchestration, a distinct context store). VisionAir.v1.3 does not foreclose that evolution — it chooses the starting point.

---

## 4. System Layer Model

VisionAir's technical architecture is organized into six layers. Each layer is responsible for a distinct concern, must not own concerns belonging to adjacent layers, and interacts with adjacent layers through well-defined boundaries.

### 4.1 Client / Frontend Layer

**Responsible for:**
- rendering the Growth Map, Blueprint, and Stabilizing Synthesis surfaces
- handling user input (seed entry, region engagement, prompt answers, branch selection, confirmation acts)
- expressing region state cues, weakness signals, anchored prompts, and branch differentiation per VisionAir.v1.2
- managing zoom and navigation behavior

**Must not own:**
- authoritative project state (lives in persistence)
- orchestration decisions about what prompt to surface next
- generation of suggestions or synthesis text

**Interacts with:**
- the **interaction-state layer** for locally-cached view state
- the **output generation layer** for rendered outputs (map nodes, blueprint content, synthesis text)

### 4.2 Interaction-State Layer

**Responsible for:**
- translating user gestures and actions into intent events
- holding ephemeral view state (current zoom, currently open region, unsent draft answers)
- enforcing VisionAir.v1.2 surface rules (one active prompt at a time, no floating prompts, no silent Suggested → Confirmed promotion)

**Must not own:**
- persistent project state
- AI inference or orchestration policy

**Interacts with:**
- the **client layer** upward
- the **orchestration / intelligence layer** downward for intent dispatch and orchestration responses

### 4.3 Orchestration / Intelligence Layer

**Responsible for:**
- executing VisionAir.v1.1's governed reasoning (classification, region selection, weakness detection, clarification prompt selection, branch generation and ranking, Guided Continuation generation, compression / synthesis)
- enforcing AlignFlow (readiness sequencing), AROD (truth-status discipline), and AMO (orchestration discipline) at runtime
- deciding *when* to expand, *when* to compress, *when* to prompt, and *when* to stay quiet

**Must not own:**
- presentation decisions (belong to client layer)
- raw persistent storage (belongs to persistence layer)
- identity / access control (belongs to persistence layer's auth boundary)

**Interacts with:**
- the **interaction-state layer** upward
- the **persistence layer** for reading authoritative project state and writing the results of its reasoning
- the **context / memory layer** for continuity-relevant context
- the **output generation layer** for materializing outputs

### 4.4 Persistence Layer

**Responsible for:**
- durable storage of project state (see §5)
- authentication and access boundary enforcement
- atomic transitions of region states, branch rankings, and suggestion lifecycles
- durable audit of truth-status (who confirmed what, when)

**Must not own:**
- orchestration policy (belongs above)
- rendering logic (belongs above)

**Interacts with:**
- the **orchestration layer** above
- the **context / memory layer** as a peer (they are distinct concerns; see §4.5)

### 4.5 Context / Memory Layer

**Responsible for:**
- maintaining the continuity surface (see §7)
- summarizing, compacting, and retrieving context relevant to the current moment of reasoning
- distinguishing user-confirmed context from system-suggested context in all retrieval
- preventing contradiction drift across sessions and branches

**Must not own:**
- the authoritative project state itself (that lives in persistence)
- orchestration decisions (that live in orchestration)

**Interacts with:**
- the **persistence layer** (source of truth)
- the **orchestration layer** (consumer of continuity)

This layer is deliberately separated from persistence because its *shape*, *retrieval strategy*, and *summarization policy* are concerns distinct from durable storage. This is what makes a dedicated context-engineering artifact necessary later (see §7.9).

### 4.6 Output Generation Layer

**Responsible for:**
- producing the rendered expression of each output mode (Growth Map snapshot, Blueprint document, Stabilizing Synthesis text)
- applying the truth-status discipline at the output boundary (Suggested content must be labeled Suggested in all generated outputs)
- ensuring outputs are reproducible from persistent state where feasible

**Must not own:**
- orchestration choices about *when* to produce an output
- persistence of the outputs themselves beyond what the user explicitly saves

**Interacts with:**
- the **orchestration layer** (decides when to produce)
- the **persistence layer** (reads state from)
- the **client layer** (renders to)

---

## 5. Project State Model

VisionAir must preserve the following state objects for each user project. These are modeled at the state level — not as tables, documents, or collections.

- **Seed** — the verbatim user-supplied statement; never rephrased or replaced.
- **Seed type** — classification (idea / problem / capability), including system-assigned vs user-corrected provenance.
- **Region set** — which regions exist around the seed (subset of universal + any activated conditional regions).
- **Region states** — per-region state per VisionAir.v1.1 §8 and VisionAir.v1.2 §7.1 (Unformed / Emerging / Weak / Suggested / Confirmed / Stable / Execution-Ready).
- **Weak-region reasons** — for each weak region, the weakness sources (from VisionAir.v1.1 §9) that make it weak.
- **Clarification history** — the sequence of prompts fired, whether answered, skipped, or aged out; each answer's effect on region state and branch ranking.
- **Branch set** — which branches exist, each with its distinguishing regions and trade-off profile.
- **Branch ranking state** — current ranking, previous ranking, and the signal that most recently caused a re-rank.
- **Guided Continuation suggestions** — see §8 for full lifecycle and metadata.
- **Blueprint state** — availability (gated on Execution-Ready load-bearing regions), current recommended branch, last generation timestamp.
- **Stabilizing Synthesis history** — when synthesis was produced, what user/system state triggered it, the resulting text.
- **Re-entry summary state** — the "where you stopped / what changed / what's next" surface data for resumption.

No database schema, collection shape, or document structure is specified here. The state model is binding; its storage expression is VisionAir.v1.3's implementation successor's concern.

---

## 6. Region State Persistence Model

### 6.1 Canonical Region States

The persisted state of a region must be one of: **Unformed**, **Emerging**, **Weak**, **Suggested**, **Confirmed**, **Stable**, **Execution-Ready**. These are the surface states VisionAir.v1.2 §7.1 requires; they are the persisted states too. The interface does not invent epistemic categories that persistence cannot hold.

### 6.2 What Must Persist

- current region state
- transition history (from → to, cause, timestamp)
- weakness reasons at the time the region was Weak
- user-supplied content (verbatim)
- system-generated content attached to the region, clearly marked Suggested
- who caused each transition (user confirmation vs system inference)

### 6.3 What May Be Ephemeral

- intermediate computation during orchestration (region candidacy before first appearance)
- hover/zoom interaction state
- draft answers not yet submitted
- transient ranking candidates that never become live

Ephemeral state must never silently mutate persistent state.

### 6.4 User Confirmation vs System Suggestion in Storage

The persistence layer must distinguish, for every piece of attached content, whether it is:

- **User-confirmed** — the user explicitly committed this content
- **System-suggested** — the orchestration layer proposed this content, not yet confirmed
- **Derived** — content computed from other persisted state (e.g. summaries)

A Suggested → Confirmed transition is a **deliberate act** and must be recorded as such. A Confirmed → Suggested transition does not exist; once confirmed, content is confirmed unless explicitly retracted.

### 6.5 Why Truth-Status Persistence Matters

This is not an accounting detail — it is load-bearing for trust.

VisionAir.v1.2 §7.1 declares the distinction between Suggested and Confirmed **inviolable**. That distinction only survives if the persistence layer enforces it. If storage collapses Suggested into the same representation as Confirmed, then the next render, the next re-entry, and the next Guided Continuation pass can all reintroduce Suggested content as though the user had agreed to it.

This is the single most important technical invariant in VisionAir. A project whose truth-status cannot be trusted is a product that cannot be trusted.

---

## 7. Context Engineering Base Specification

This is one of the highest-leverage sections of VisionAir.v1.3. It establishes the baseline context model that orchestration will rely on, without pretending to be the full context-engineering artifact.

### 7.1 Persistent Context

The following context is persistent for the life of the project:

- the seed (verbatim)
- the seed type (with provenance)
- the region set and all region states and transitions
- all user-confirmed content on any region
- the full clarification history
- the branch set, current ranking, and ranking history
- Guided Continuation suggestions (with full metadata) until Confirmed, Modified, or Rejected
- Blueprint snapshots the user explicitly saves
- Stabilizing Synthesis outputs with their trigger context

### 7.2 Ephemeral Context

- current zoom level and panning position
- currently foregrounded prompt (the selection is recomputed on re-entry)
- scroll and hover state
- draft answers in flight
- intermediate orchestration candidates that never become live state

### 7.3 User-Confirmed Context

User-confirmed context is the highest-trust tier. Orchestration must treat it as authoritative. AI-generated output must never silently overwrite it (see §11). Confirmed content is the material from which branches are ranked and blueprints are derived.

### 7.4 System-Suggested Context

System-suggested context is informative but non-authoritative. It is always retrievable with a **Suggested** label. It may influence orchestration (e.g. affect branch ranking weights) but must never be conflated with confirmed truth in any output.

### 7.5 Context That Must Be Summarized for Continuity

Some context grows unboundedly (clarification history, ranking history, suggestion history). Summaries must be produced such that:

- orchestration can reason about the arc without rehydrating every step
- the user can still inspect the detail when they zoom in
- summaries are themselves labeled **Derived**, not Confirmed
- summaries are regenerable from the persisted detail

### 7.6 Context That Must Survive Re-Entry

- the full region set and all region states
- the current branch ranking
- all unresolved weak regions and their weakness reasons
- all unresolved Guided Continuation suggestions
- enough history to recompute the next-most-important prompt freshly (not re-use the stale one)
- enough emotional / seed-type context to frame re-entry appropriately (capability-seed identity sensitivity, for example)

### 7.7 Branch History Legibility

The system must preserve:

- every branch that has ever existed in the project
- the state in which each branch currently lives (active, collapsed/latent, retired)
- the ranking transitions each branch went through, and the signal that caused each transition

Pruned branches (per VisionAir.v1.2 §10.6) are **collapsed**, not deleted. This preserves the user's ability to re-open a previously-demoted path if new signal shifts.

### 7.8 Avoiding Contradiction Drift

Over time, a project may accumulate confirmed content that, taken together, becomes internally inconsistent. AROD governs the detection of this condition. The context layer must:

- retrieve enough context to allow AROD to notice contradiction
- surface detected contradiction as a distinct weakness signal on the relevant regions, not silently resolve it
- never perform "helpful" rewrites of past confirmed content to eliminate contradiction

If two user-confirmed statements contradict, the user is the only authority that can resolve them.

### 7.9 Dedicated Context Artifact Anticipated

This section is a baseline, not a completion. A dedicated context-engineering artifact is required in a later iteration to define:

- retrieval strategy (what context is loaded for what reasoning step)
- summarization policy (when, how, with what fidelity)
- context-window budgeting for runtime AI calls
- cross-project learning boundaries (if any)
- provenance propagation through summaries

VisionAir.v1.3 establishes the **invariants**; the successor artifact establishes the **strategy**.

---

## 8. Guided Continuation Technical Implications

Guided Continuation Mode (VisionAir.v1.1 §11, VisionAir.v1.2 §9) is a **core system requirement**, not a UI extra. The technical foundation must preserve the following for every Guided Continuation suggestion:

### 8.1 Suggested Continuation State

Each suggestion carries a lifecycle state: **Pending** (awaiting user return) → **Presented** (shown in the *"While you were away"* surface) → one of **Confirmed** / **Modified** / **Rejected** / **Expired**.

Expired suggestions are retained with their expiration reason, not deleted. This allows the orchestration layer to learn (and the user to audit).

### 8.2 Reversibility Metadata

Each suggestion must declare whether it is **reversible**. A reversible suggestion, if Confirmed, can be un-confirmed without loss. A non-reversible suggestion (rare) must be presented to the user with that fact visible. The persistence layer must honor the reversibility flag during any undo operation.

### 8.3 Reason-for-Suggestion Metadata

Each suggestion must carry the reason it was generated — not as free-form commentary, but as structured provenance: which weakness sources it addresses, which regions it would affect, which branches it would re-rank.

### 8.4 Confidence Metadata

Each suggestion carries a confidence indicator. Confidence is surfaced to the user (per VisionAir.v1.2 §9.3) and also used by the orchestration layer to decide *whether* to generate a suggestion at all. Low-confidence suggestions that cannot be usefully labeled should not be generated.

### 8.5 Re-Entry Rendering Requirements

The persistence layer must supply, on re-entry:

- every Pending suggestion (to be promoted to Presented at render)
- anchoring information (which region or branch each suggestion attaches to)
- the full metadata above, so labeling is complete and faithful at first paint

The client must never render a suggestion without its full metadata. A suggestion missing its Suggested label, reason, or confidence is a truth-status violation.

### 8.6 Accept / Modify / Reject Pathways

- **Accept** — transitions the suggestion to Confirmed and integrates its content into the region/branch. Recorded with timestamp and actor (user).
- **Modify** — opens the suggestion's content for edit; the modified content, once submitted, transitions to Confirmed. The original suggestion is preserved in history.
- **Reject** — transitions the suggestion to Rejected with optional user-supplied reason. The orchestration layer treats rejection as signal (e.g. de-weights similar future suggestions).

None of these transitions may happen implicitly. Time, scroll, or proximity never promote a suggestion.

---

## 9. Output Mode Technical Requirements

### 9.1 Growth Map

**Data / state required:**
- the seed
- the region set with current states, weakness reasons, and content
- the current branch set with rankings
- anchored prompts (at most one foregrounded)
- any Pending / Presented Guided Continuation suggestions with full metadata

**What must persist:**
- everything above, at the state level

**What must be recomputed:**
- the currently foregrounded prompt (freshly selected on each material state change or re-entry)
- zoom-level detail composition (derived from persisted state)
- ranking visualization (derived from persisted ranking state)

### 9.2 Blueprint

**Minimum maturity required:**
- at least one branch whose load-bearing regions (User, Value Mechanism, System / Product Form, plus any seed-type-critical conditional regions) are at **Confirmed** or **Execution-Ready**
- user confirmation of that branch as the intended direction (or orchestration-declared recommended branch with clear ability for the user to switch)

**What must be derivable from stored project state:**
- system definition (from System / Product Form region and related confirmed content)
- target user (from User region)
- value statement (from Value Mechanism region)
- constraints (from Constraints region)
- best path (from current branch ranking)
- next-step orientation (from Execution Paths region and readiness signals)

Blueprint is a **derivation**, not an independent authoring surface. If the underlying state changes, the Blueprint is regenerable and may change.

### 9.3 Stabilizing Synthesis

**Context it must draw from:**
- current region states and confirmed content
- branch ranking and convergence signals
- user state signals (identity-fragility, overwhelm, orbiting without advancement)
- seed type (to frame tone correctly — a capability seed needs different framing than an idea seed)

**Why sequence, compression, and user state matter:**

- **Sequence** — Stabilizing Synthesis is not a summary. It is a *properly sequenced* compression that orients. Order matters.
- **Compression** — elegant compression is a first-class product behavior (VisionAir.v1.1 §18, VisionAir.v1.2 §11.4). The technical foundation must enable compression, not treat it as summary.
- **User state** — triggering synthesis at the wrong moment violates the interaction contract. Technical support must allow orchestration to gate generation on user-state signals, not just data-state signals.

### 9.4 Compression as First-Class

Compression is a first-class system behavior. This means:

- the output generation layer must treat Stabilizing Synthesis as a peer of Growth Map and Blueprint, not a fallback
- persistence must record when synthesis was triggered and why, so the behavior is auditable
- the orchestration layer must be allowed to *choose* synthesis over expansion when appropriate, without the technical layer biasing toward "more content"

---

## 10. Re-Entry and Continuity Requirements

Re-entry quality is part of the product, not a convenience. The technical foundation must support:

### 10.1 Project Continuity Across Sessions

Every project's full state model (§5) must survive session termination and device transitions. A user who starts on mobile and returns on desktop must land in the same project, at the same state.

### 10.2 Restoration of Most Recent Meaningful State

On re-entry, the client lands at the **mid-level Growth Map view, centered on the most recent active region or branch** (per VisionAir.v1.2 §13.1). "Most recent active" is a derived property — the persistence layer must record enough interaction history to compute it.

### 10.3 Preservation of Unresolved Weak Regions

Weak regions with their weakness reasons must persist exactly as left. No "helpful" state cleanup between sessions. A weakness unresolved last session is a weakness this session.

### 10.4 Preservation of Guided Continuation Suggestions

All Pending Guided Continuation suggestions must be retrieved and promoted to Presented on re-entry, with full metadata (§8.5). The *"While you were away"* surface is unbuildable without this.

### 10.5 Freshness of Next-Most-Important Prompt

The next-most-important prompt is **recomputed at re-entry**, not preserved from the last session. The user's current state, current region maturities, and current branch rankings may all differ from last session's (via Guided Continuation). The prompt must reflect the current judgment, not the stale one.

### 10.6 Continuity of Branch Ranking and Blueprint Status

Branch rankings and Blueprint availability survive unchanged across sessions (modulo any Guided Continuation changes, which are labeled as such). A Blueprint that was available last session remains available this session unless its preconditions have been explicitly retracted.

---

## 11. AI Orchestration Boundaries

This section is load-bearing for product trust.

### 11.1 The Three State Layers

VisionAir's state lives in three distinct layers:

- **Deterministic application state** — project identity, user identity, region existence, persisted content, ranking state. This layer is updated only by explicit events (user actions or orchestration decisions that themselves must respect downstream rules).
- **Governed orchestration logic** — AlignFlow's readiness gating, AROD's truth-status discipline, AMO's branching and continuation policy. This layer is deterministic *given its inputs* and must be auditable.
- **AI-generated suggestions / synthesis** — the outputs of model inference: suggested continuations, proposed content for weak regions, stabilizing synthesis text. This layer is non-deterministic and must always be labeled as such in any state it touches.

### 11.2 What AI Output Must Not Do

AI output must **never** silently overwrite:

- **confirmed user truths** — any region content marked Confirmed
- **explicit state decisions** — user-caused ranking selections, user-caused branch choices, user-caused region corrections (including seed-type corrections)
- **region truth-status** — a Suggested → Confirmed transition requires an explicit user act, always
- **accepted path choices** — when a user has confirmed a branch as their direction, AI may *inform* that branch, but may not swap it

### 11.3 Where AI Output Legitimately Operates

AI output legitimately produces:

- Suggested content on Weak or Unformed regions (always labeled Suggested)
- candidate branches for AMO to rank (the ranking is still governed)
- candidate next prompts for AROD to select (the selection is still governed)
- Stabilizing Synthesis text (always labeled as Derived, always timestamped)
- Guided Continuation suggestions (always full metadata per §8)

### 11.4 The Boundary in Practice

At every boundary where AI output enters persistent state, the persistence layer must reject any write that would:

- modify Confirmed content without an explicit user act
- add content without a truth-status label
- change ranking without a recorded governing-layer decision

This is enforced at the architecture level: it is not a frontend validation rule.

---

## 12. Security / Privacy / IP Baseline

VisionAir will store sensitive user-generated business creation context. This document does **not** define the security protocol — that is VisionAir.v1.4's work. But the technical foundation must anticipate the following as protected assets:

- **user-created ideas** — original seeds in the user's own language
- **product concepts** — the structured form the ideas take as regions mature
- **project evolution history** — how an idea changed over time, including rejected directions
- **branch exploration history** — including branches that were collapsed or retired
- **personal or strategic inputs** — supplementary context the user provides (priorities, constraints, credentials, ambitions)

### 12.1 Implications Even Before the Full Protocol

Even before VisionAir.v1.4 formalizes the security / privacy / IP trust layer, the technical foundation must:

- treat project state as private by default
- route all persistence through the authenticated identity boundary
- avoid any architectural pattern that makes post-hoc privacy enforcement infeasible (e.g. leaking project content into shared logs, analytics keyed to plaintext project content, or unscoped caches)
- avoid any cross-project data sharing in the base model

### 12.2 Dedicated Protocol Required

The following concerns are **explicitly deferred** to VisionAir.v1.4:

- trust boundaries and threat model
- user data ownership expectations
- confidentiality handling (encryption at rest, in transit, key management)
- protection of user-generated business IP (export, deletion, portability)
- security expectations for stored project state

This section is a flag on the landscape, not the map itself.

---

## 13. Tooling Guidance (Architecture Level Only)

### 13.1 Context7 as Documentation-Grounding Support

During implementation, **Context7** is the recommended documentation-grounding support for fetching current library and framework documentation. This includes Flutter, Firebase, and any runtime-AI SDK used by the orchestration layer. It is especially important when:

- the implementation needs current API shape (not training-data-era shape)
- a version migration is being performed
- a library-specific behavior needs to be verified

### 13.2 Architecture vs Build Workflow

Package and library grounding is a **build workflow** concern, not a product-identity concern. VisionAir.v1.3 does not specify:

- exact Flutter packages for graph rendering, zoom behavior, or state management
- exact Firebase SDK patterns
- exact runtime-AI provider or SDK

These decisions belong in the implementation iteration. Specifying them here would:

- lock in choices that the implementation iteration is better positioned to make
- blur the line between architecture and execution
- create friction when better options emerge

The product's identity must not depend on any specific package. The product's architecture must not be confused with its build manifest.

---

## 14. Constraints

VisionAir.v1.3 deliberately does **not** define:

- **final database schema** — no collection/document shapes, no index strategy, no migration plan
- **exact Firebase collections / documents** — no field lists, no path conventions, no security rules
- **final package selections** — no specific Flutter or Dart packages
- **exact UI toolkit / library decisions** — no widget libraries, no graph-rendering choices, no animation frameworks
- **production security implementation** — deferred entirely to VisionAir.v1.4
- **full context-engineering implementation detail** — baseline only; strategy deferred to a dedicated artifact
- **exact prompt wording for runtime AI calls** — belongs in an orchestration-implementation artifact
- **deployment infrastructure detail** — hosting, CI/CD, region strategy, environments

VisionAir.v1.3 stays at the **technical-foundation level only**.

---

## 15. Success Criteria

VisionAir.v1.3 succeeds when:

- **Frontend direction is clear.** Flutter / Dart is the recommended direction for v0.1, with reasons that connect directly to VisionAir's interaction contract.
- **Backend direction is clear.** Firebase is the recommended early-stage direction, with reasons that connect to persistence and continuity needs.
- **The project state model is coherent.** The state objects (seed through re-entry summary) are named, bounded, and internally consistent.
- **Region state persistence logic is coherent.** The five surface states persist as stored states, with truth-status enforced at the storage boundary.
- **Guided Continuation requirements are technically supported.** Every element required by VisionAir.v1.2 §9 has a state-model home, metadata shape, and lifecycle.
- **Re-entry continuity is technically supported.** The resumption contract of VisionAir.v1.2 §13 is expressible as persistence + retrieval requirements.
- **Context continuity baseline is established.** The baseline context model is defined, with its dedicated successor artifact explicitly anticipated.
- **AI orchestration boundaries are enforceable.** The distinction between deterministic state, governed orchestration, and AI output is enforced at the architecture level, not left to downstream discipline.
- **Future implementation can proceed without guessing the system shape.** An implementation team reading VisionAir.v1.3 knows what to build, within what boundaries, and what must remain true regardless of their stack choices.

---

## 16. Next Artifact

The next highest-leverage artifact is:

# VisionAir.v1.4 — Security, Privacy, and IP Trust Protocol

VisionAir.v1.4 should define:

- **trust boundaries** — who can read, write, or infer from what, under which identity conditions
- **user data ownership expectations** — what the user owns, what the platform may use, and the explicit limits on both
- **confidentiality handling** — encryption at rest and in transit, key management, secret handling, log hygiene
- **protection of user-generated business IP** — portability, deletion (including from derived summaries), export fidelity
- **security expectations for stored project state** — access controls, audit, incident response posture

VisionAir.v1.4 must inherit from VisionAir.v1.1 (intelligence), VisionAir.v1.2 (interaction), and VisionAir.v1.3 (technical foundation). Where a security requirement conflicts with a usability or intelligence behavior, the trade-off must be made explicit and justified.

---

## 17. Authoritative Implication

VisionAir.v1.3 is binding for all technical-foundation work — system decomposition, persistence design, context architecture, orchestration boundaries, and AI-output discipline — unless explicitly superseded.

It does not supersede VisionAir.v1.1 or VisionAir.v1.2. Where any three documents touch, the order of authority is:

1. **VisionAir.v1.1** — what the system thinks
2. **VisionAir.v1.2** — what the user experiences
3. **VisionAir.v1.3** — how the system is technically structured

A technical decision that would violate VisionAir.v1.1 or VisionAir.v1.2 is not a permissible technical decision under VisionAir.v1.3.
