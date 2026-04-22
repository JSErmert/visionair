# VisionAir.v1.4 — Security, Privacy, and IP Trust Protocol

**Document type:** Foundational trust protocol  
**Project:** VisionAir  
**Iteration:** VisionAir.v1.4  
**Phase:** Trust-protocol definition  
**Date:** 2026-04-16  
**Runtime class:** conceptual_foundation  
**Status:** authoritative_draft  

**Governed by:**
- **AlignFlow** (Alignment Flow) — phased emergence of trust capability, readiness-gated security posture, sequencing of protective layers
- **AROD** (Adaptive Realism and Opportunity Discipline) — truth-status discipline applied to ownership, provenance, and trust labeling; refusal to silently collapse confidentiality categories
- **AMO** (Adaptive Multithreaded Orchestration) — trust-aware orchestration, AI-output boundary discipline, branch-history confidentiality

**Inherits from:**
- VisionAir.v1.1 — Core Intelligence Architecture (what the system thinks)
- VisionAir.v1.2 — Interaction Architecture (how the user experiences that thinking)
- VisionAir.v1.3 — Technical Foundation Specification (how the system is technically structured)

**Also governed by:**
- VisionAir Output Contract — save → print → continue, non-truncation, copy-paste safety

---

## 1. Executive Definition

**VisionAir.v1.4 — Security, Privacy, and IP Trust Protocol** is the governing trust protocol that protects user projects, ideas, project evolution history, and sensitive business creation context inside VisionAir.

Where VisionAir.v1.3 acknowledged that user-generated business creation context is sensitive (VisionAir.v1.3 §12) and named protected-asset classes, VisionAir.v1.4 makes that protection a **binding governing layer**: a protocol that future implementation must inherit from, not improvise against.

This document governs:

- **project confidentiality expectations** — what privacy and discretion every project must receive by default
- **user ownership expectations for created project content** — who owns what the user creates inside VisionAir
- **what must be treated as sensitive** — the protected asset classes and the reason each is protected
- **the security posture future implementation must satisfy** — the architectural trust expectations downstream work must honor
- **privacy expectations around stored project data** — the private-by-default baseline and what it implies
- **AI trust boundaries around user project content** — what AI assistance may and may not do to user material

This is **not** a production security checklist, an encryption specification, or a compliance scope document. It is the **governing trust protocol** above all such future artifacts.

---

## 2. Why This Document Exists

VisionAir holds something rare: the **earliest and most fragile form** of users' business ideas — the seed before it is structured, the doubt before it is resolved, the rejected branch that still contains strategic insight, the credentialing concern the user has not told anyone else.

A productivity app stores tasks. A note-taking app stores text. **VisionAir stores creation in motion.** That changes the trust contract. A user who hands VisionAir an early-stage business concept is implicitly trusting that:

- their idea is theirs and remains theirs
- the system will not casually expose it
- AI assistance will not silently absorb authorship
- the journey of the idea (including paths not taken) is protected
- they can leave with what they brought, plus what they built

VisionAir.v1.4 is the document that makes those trust expectations binding before implementation begins, so that downstream technical work cannot accidentally violate them.

---

## 3. Protected Asset Model

VisionAir must treat the following classes of information as **protected assets**. Each carries a sensitivity reason and a trust expectation that future implementation must satisfy.

### 3.1 Original Seed Ideas
**Why sensitive:** the seed is the user's creative input in their own language — the rawest, often most strategically valuable form of the idea.  
**Trust expectation:** verbatim preservation, private by default, never used as analytics substrate, never absorbed into shared corpora.

### 3.2 Project Region Content
**Why sensitive:** region content is the structured form of the user's evolving idea — target users, value mechanisms, product forms, constraints, execution paths. This is the working layer of business strategy.  
**Trust expectation:** confidentiality equal to the seed, with truth-status (Confirmed vs Suggested vs Derived) preserved through every layer that touches it.

### 3.3 User Clarifications
**Why sensitive:** answers to clarification prompts often contain personal context (constraints, ambitions, credential gaps, domain access) that the user has chosen to disclose to the system, not to the world.  
**Trust expectation:** treated as confidential disclosure; not aggregated, not surfaced beyond the project, not used to train cross-project inference without explicit consent.

### 3.4 Branch Exploration History
**Why sensitive:** branches the user explored — including ones they rejected or collapsed — reveal strategic thinking, alternative business models, and competitive considerations. A rejected branch can be more revealing than a chosen one.  
**Trust expectation:** preserved with the same confidentiality as active state; deletion (when requested) must reach branch history, not only the current branch.

### 3.5 Guided Continuation Suggestions and Outcomes
**Why sensitive:** suggestions and the user's accept/modify/reject pattern reveal both the system's inferences and the user's strategic preferences. The pattern of rejections is itself signal about what the user is unwilling to commit to.  
**Trust expectation:** suggestion content and lifecycle metadata both confidential; rejection reasons confidential; the pattern not exposed externally.

### 3.6 Blueprint Outputs
**Why sensitive:** the blueprint is the most consolidated, executable expression of the user's project — effectively the strategic plan.  
**Trust expectation:** the blueprint is the user's intellectual property; confidentiality is at least as strict as the seed.

### 3.7 Stabilizing Synthesis Outputs
**Why sensitive:** synthesis text is generated to orient the user during identity-fragile or overwhelming moments. It contains both the user's evolving truth and the system's interpretive framing of it.  
**Trust expectation:** confidentiality equal to other derived outputs; never surfaced as marketing material, demo content, or training data without explicit consent.

### 3.8 Project Evolution History
**Why sensitive:** the *trajectory* of a project — what changed, when, and in response to what — can reveal more about the user than any single snapshot. It is the audit trail of their thinking.  
**Trust expectation:** preserved for re-entry and continuity, but treated as confidential trajectory data; not used as a cross-project analytics signal.

### 3.9 User Profile / Account-Linked Project Context
**Why sensitive:** user identity bound to project content increases the risk of harm if either is exposed. Identity + early-stage business idea = a uniquely sensitive pairing.  
**Trust expectation:** account boundary enforced as a hard isolation perimeter; identity never linked to project content in any external surface.

### 3.10 Uploaded or Attached Supporting Material (Future)
**Why sensitive:** if VisionAir later supports attachments (images, documents, voice), those carry the same sensitivity as the rest of the project — and may carry additional sensitivity (proprietary documents, identifiable images).  
**Trust expectation:** attachments inherit the project's protection by default; richer media must not be treated as less sensitive than text.

---

## 4. Trust Boundary Model

VisionAir's trust architecture preserves the following boundaries. Every architectural and implementation decision must be evaluable against this model.

### 4.1 User ↔ Their Own Projects
**Default:** full access. The user is the authoritative actor for their own projects, including the right to read, modify, export, and delete.

### 4.2 User ↔ Platform
**Default:** the platform stores and processes user content **on behalf of** the user, not as a peer authoring participant. The platform is a custodian, not a co-owner.

### 4.3 Platform ↔ AI Processing Layer
**Default:** AI processing is a platform-internal operation that must respect the same trust expectations as the platform. AI does not constitute a third party with weaker confidentiality. See §8.

### 4.4 Project ↔ Other Projects
**Default:** **strict isolation**. No project's content, derived summaries, or suggestion patterns may inform another project's surfaces, suggestions, or outputs without explicit user consent.

### 4.5 One User ↔ Other Users
**Default:** **strict isolation**. No user may see, infer about, or be informed by another user's project content. Future collaboration features (if any) are explicit opt-in additions on top of this default, not replacements for it.

### 4.6 App Client ↔ Backend
**Default:** all backend communication is authenticated and scoped to the requesting user's identity. The client is not a trusted source of authorization claims; the backend enforces.

### 4.7 Persistent Storage ↔ Logs / Analytics / Observability
**Default:** **separation**. Persistent project content is one surface; observability is another. Project content does not flow into logs, traces, or analytics by default. See §9.

### 4.8 Governing Principle
**Project content is private by default.** Every boundary above defaults to the most restrictive setting; any relaxation is an explicit, justified, and auditable decision — never the default of convenience.

---

## 5. User Ownership and IP Expectations

This section is binding for VisionAir's identity as a product.

### 5.1 The Baseline Principle

**Users retain ownership of the ideas and project content they create in VisionAir.** VisionAir stores the content, structures it, and helps the user evolve it — but VisionAir does not become the creative owner of user projects by virtue of having helped develop them.

### 5.2 Implications

- **VisionAir is a custodian, not a co-author.** Helping a user shape an idea does not transfer authorship.
- **AI assistance does not constitute platform authorship.** The product-form challenge that VisionAir.v1.1 §16 makes (suggesting a stronger first product form, for instance) is assistance to the user's authorship — not a co-author claim.
- **Derived outputs remain the user's.** Blueprints, syntheses, suggestions the user accepts, branches, and ranking decisions are part of the user's protected project context. They inherit the user's ownership posture.
- **Future implementation must not blur assistance with ownership transfer.** No interface, terms of service, or backend behavior may quietly reframe the user's project as platform property. If platform-side use of any user content is ever considered, it must be opt-in, explicit, granular, and revocable.
- **Rejected branches are still the user's.** Branches the user collapsed, retired, or rejected — including the strategic reasoning that led to rejection — remain the user's protected IP.

### 5.3 Scope of This Section

VisionAir.v1.4 does not draft legal terms of service. It establishes the **governing expectation** that any future legal text must serve, not contradict. If a future legal artifact would weaken this principle, that artifact violates VisionAir.v1.4 and must be revised before adoption.

---

## 6. Privacy Model

### 6.1 Private by Default

**Every project is private by default.** No user content is publicly exposed, indexed, or visible to anyone other than the authenticated owner unless the owner takes an explicit, deliberate action to share it. There is no "public unless flagged private" mode in VisionAir's privacy posture.

### 6.2 Project Content Is Not Analytics Substrate

Project content is **not** a casual source of analytics, training data, marketing insight, or product-research material. The temptation to treat user content as a free corpus must be actively refused. Any future use of user content beyond the user's direct service must require explicit, informed, granular consent — and remain revocable.

### 6.3 Privacy Survives Sessions and Devices

Privacy expectations carry across session boundaries and device transitions. A project does not become more accessible because the user opened it on a different device, paused for a week, or returned via a different network. The trust contract is constant; the surface is not.

### 6.4 Privacy Applies Equally Across Maturity

The same privacy expectations apply to:
- the raw, unstructured seed
- emerging region content
- mature, structured branches
- finalized blueprints
- stabilizing syntheses
- collapsed or retired branches

There is no "this is too rough to be sensitive" tier. The early seed is often the most sensitive form.

### 6.5 Deletion Is Real

Deleted content must be treated as deleted — not hidden, not soft-flagged into a recoverable shadow corpus, not silently retained for analytics purposes. See §11 for the full deletion expectation.

### 6.6 Protocol Level

This section establishes the protocol. Implementation detail (encryption choices, key management, retention schedules, data residency) belongs to artifacts that must inherit from this protocol — not weaken it.

---

## 7. Confidentiality Handling

### 7.1 Need-to-Process Only

Project content is processed only by the components that need it to deliver the user's request. A component that does not need access to a piece of content must not receive it. Convenience is not justification.

### 7.2 Minimum Necessary Visibility

Within components that do need to process project content, the **minimum necessary view** applies. A summarizer needs the regions it summarizes — not the entire project history. A ranker needs the branches it ranks — not the user's account profile.

### 7.3 No Cross-Project Leakage

A single user's projects do not bleed into one another. Suggestions, summaries, ranking heuristics, and contextual framing for Project A must not be informed by Project B's content unless the user has explicitly enabled cross-project context (a future opt-in capability, not a default).

### 7.4 No User-to-User Exposure

No user may, by any default mechanism, see another user's content, suggestions, ranking patterns, or project trajectories. Any future collaboration feature is an additive opt-in — never a relaxation of the default.

### 7.5 Sensitive Content Stays Out of Broad Surfaces

Project text must not be copied into broad system surfaces (logs, error traces, analytics events, monitoring dashboards, prompt-replay tools, internal demos) without explicit, justified, and auditable cause. The default destination of project content is the project — not the platform's nervous system.

### 7.6 Logs Are Not a Confidentiality Loophole

By default, project text — including seeds, region content, clarifications, suggestions, and outputs — must not appear in logs, traces, or analytics. Where redaction is technically infeasible, the design must change, not the discipline.

### 7.7 AI Assistance Is Not a Confidentiality Discount

The fact that VisionAir is AI-assisted does **not** lower confidentiality expectations. Users do not lose privacy because their content was helpful to a model run. See §8.

---

## 8. AI Processing Trust Boundary

This section is critical to product trust.

### 8.1 The Four State Categories

VisionAir's runtime distinguishes four state categories that the AI processing trust boundary must respect:

- **User-confirmed project state** — content the user has explicitly committed; the highest-trust tier
- **System-suggested project state** — orchestration-proposed content awaiting user act; informative but not authoritative
- **AI-generated outputs** — model-produced content (suggestions, syntheses, candidate branches); always labeled
- **AI processing of sensitive project content** — the act of sending content through inference

### 8.2 AI Helps Process; AI Does Not Weaken Confidentiality

AI may process project content as part of delivering VisionAir's intelligence. That processing operates **inside the platform's trust boundary** and is governed by the same confidentiality expectations as any other internal processing. Sending content through inference is not a change of custody; it is an internal operation.

### 8.3 No Silent Override of Confirmed Truth

AI outputs must not silently override confirmed user project truth (per VisionAir.v1.3 §11). Every AI-touched piece of content carries a truth-status label (Suggested or Derived). A Suggested → Confirmed transition requires an explicit user act, always.

### 8.4 AI-Generated Content Inherits Project Sensitivity

Content produced by AI in service of a user's project is part of that project. It inherits the project's privacy posture and ownership posture. AI-generated suggestions are not platform-owned because they were model-produced — they are part of the user's protected project context.

### 8.5 Assistance vs Authorship Must Stay Separate

Future implementation must clearly separate AI assistance from user authorship — visually, in metadata, and in any export. A user reading their own project must always be able to tell what they wrote, what they confirmed, and what is system-derived.

### 8.6 Project Content Stays Inside Platform Expectations

Project content sent for AI processing must remain inside the security expectations established by this protocol. This includes:

- not being routed to third-party services that do not honor the protocol's expectations
- not being retained by inference infrastructure beyond the operation that needed it
- not being aggregated for cross-user model improvement without explicit consent
- not appearing in inference-side logs in plaintext by default

If a runtime AI provider's terms cannot be aligned with this protocol, the integration is rejected — not the protocol.

### 8.7 The Compounding Reason

Each of these rules matters individually. Together, they preserve the user's ability to **trust the system with their thinking**. That trust is the entire premise of VisionAir.

---

## 9. Logging, Analytics, and Observability Boundaries

### 9.1 What Should Not Appear by Default

By default, the following must not appear in logs, traces, metrics, analytics events, or observability dashboards:

- raw seed text
- region content (user-supplied, system-suggested, or derived)
- clarification prompt answers
- branch content and trade-off descriptions
- Guided Continuation suggestion text or rejection reasons
- blueprint or synthesis text
- any export or attachment payloads

### 9.2 What Observability Should Focus On

Observability exists to keep the system healthy. It should focus on:

- system health (latency, error rates, throughput, availability)
- structural events (project created, region transitioned — without payload)
- orchestration outcomes at the metadata level (suggestion produced; without the suggestion text)
- security events (auth failures, rate limits, policy violations)

The principle: **observability sees that things happened, not what was inside them.**

### 9.3 Minimization and Redaction

Where a sensitive payload must touch a diagnostic surface (e.g. for narrowly-scoped debugging), the design must minimize and redact: identifiers without text, structure without content, hashes without preimages. Full payloads in logs are an architectural failure, not a debugging shortcut.

### 9.4 Debugging Convenience Is Not an Override

It is not acceptable to relax these boundaries because debugging would otherwise be inconvenient. Inconvenient debugging is the cost of holding sensitive user content. If observability cannot see what it needs without exposing project text, the answer is better tooling — not more exposure.

### 9.5 Protocol Level Only

This section sets expectations. Implementation detail — log pipeline architecture, redaction libraries, retention windows, sampling — belongs in successor artifacts that must honor these expectations.

---

## 10. Access Control Expectations

### 10.1 Authenticated Access

All access to user projects requires authentication. There is no anonymous read path, no public-by-URL bypass, no "view as user" shortcut that skips the auth boundary.

### 10.2 Least-Necessary Access

Components, services, and people receive the **minimum access needed** to perform their explicit role. A component that needs to read a single region does not get the project; a service that needs to write a suggestion does not get account-wide write authority.

### 10.3 User-Specific Project Isolation

Every project is scoped to its owning user identity. Cross-account access is a hard-isolation perimeter, not a configurable convenience.

### 10.4 No Accidental Cross-Account Visibility

The architecture must make accidental cross-account visibility **structurally difficult** — not merely policy-prohibited. Naming collisions, shared caches, mis-scoped queries, and any other pattern that could cause one user's content to appear under another user's identity must be designed out, not warned against.

### 10.5 Administrative Access Is Constrained and Exceptional

Administrative access to user content (for support, debugging, recovery) must be:

- exceptional, not routine
- explicitly authorized per access
- audited
- bounded in scope and duration
- transparent to the affected user where feasible

A platform that can casually browse user projects does not honor this protocol.

### 10.6 Internal Tooling Discipline

Internal tools (admin consoles, debug dashboards, support interfaces) must not casually expose project content. The same minimization and redaction principles apply internally as externally. Internal does not mean unrestricted.

### 10.7 Posture, Not Implementation

This section defines posture. Specific auth providers, IAM policies, role definitions, and access-control infrastructure are implementation concerns that must inherit from this posture.

---

## 11. Export, Portability, and Deletion Expectations

### 11.1 Export Is a User Right

Users must be able to export meaningful representations of their projects. "Meaningful" means more than a JSON dump — it means a representation that preserves:

- the seed (verbatim)
- region content with truth-status labels intact
- branch structure including currently active and collapsed branches
- the current blueprint
- relevant synthesis outputs
- enough provenance for the user to understand what they wrote vs what was derived

### 11.2 Export Fidelity Matters

A degraded export (lossy, label-stripped, structure-flattened) silently devalues the user's IP. Export must be high-fidelity. If a constraint limits fidelity, the limit must be transparent to the user, and they must be able to request the missing fidelity through another path.

### 11.3 Portability Matters Because Projects Contain Original IP

The user must be able to **leave VisionAir with what they brought, plus what they built**. Lock-in is not an acceptable substitute for product value. If a user chooses to take their project elsewhere, the protocol stands behind their right to do so.

### 11.4 Deletion Is Real

When a user deletes a project (or deletes specific content within a project), deletion must be treated as a real, completed operation — not a UI cosmetic. Real deletion implies:

- removal of the persisted state
- removal from derived summaries that included the deleted content
- removal from any caches that hold the content
- removal from branch history
- removal from Guided Continuation suggestion records associated with that content
- removal from any backup tier within a defined, transparent window

### 11.5 Deletion Reaches History

Deletion must reach the **entire** trail of the deleted item. Deleting a confirmed region must propagate to derived summaries that included it. Deleting a project must reach branch history, suggestion history, and any synthesis that referenced its content. Implementation must be designed for this — not retrofitted to it.

### 11.6 Trust Before Legal

The expectations in this section are required for trust **before** any legal obligation forces them. A user's confidence in VisionAir depends on the protocol holding even where regulation does not require it.

---

## 12. Guided Continuation and Trust

Guided Continuation Mode operates at a uniquely sensitive intersection: the system continues thinking while the user is away, producing content that **looks like progress** in a project the user is not present to govern.

### 12.1 Suggestions Remain Suggestions Until User Action

Per VisionAir.v1.1 §11, VisionAir.v1.2 §9, and VisionAir.v1.3 §8, no Guided Continuation output is promoted to Confirmed without an explicit user act. This is a trust requirement, not only a UX requirement. A system that silently promotes suggestions effectively co-authors the project — violating §5.

### 12.2 Guided Continuation Outputs Are Protected Project Context

Guided Continuation suggestions, their reasons, their confidence values, and their lifecycle states (Pending / Presented / Confirmed / Modified / Rejected / Expired) are part of the user's protected project context. They are not a separate analytics-friendly tier because they are AI-generated. See §3.5.

### 12.3 Unconfirmed Continuations Are Not Strategic Commitments

A Suggested continuation must never be presented externally — in exports, in shared views (when those exist), in derived summaries — as if it were a user-confirmed strategic commitment. The label is part of the content; stripping the label changes the meaning.

### 12.4 Rejection / Modification History Is Sensitive

The pattern of what a user rejected, modified, or expired without action **reveals strategic preference**. Two users with the same active project may have rejected very different things to arrive there. This pattern is itself sensitive and confidential.

### 12.5 Connection Back to VisionAir.v1.1–v1.3

This section operationalizes:
- **VisionAir.v1.1 §11** — Guided Continuation Mode's epistemic discipline
- **VisionAir.v1.2 §9** — the *"While you were away"* surface and its full labeling
- **VisionAir.v1.3 §8** — the technical lifecycle and metadata that make labeling enforceable

VisionAir.v1.4 closes the loop by adding the trust commitment: every layer above this point must keep the labels honest **because the user's IP depends on it**.

---

## 13. Context Engineering and Privacy Interaction

VisionAir.v1.3 §7 established a baseline context model. VisionAir.v1.4 specifies how privacy interacts with that baseline.

### 13.1 Continuity-Relevant Retention Only

The context layer retains and retrieves **only what continuity requires**. It is not a license to keep more material around because it might someday be useful. If a piece of context is not needed to support re-entry, current orchestration, or audit, it should not be retained beyond its operational need.

### 13.2 Summaries Inherit Sensitivity

Derived summaries (per VisionAir.v1.3 §7.5) are still sensitive. A summary is not a sanitized derivative; it is a compressed expression of confidential content. It carries the same privacy expectation as the source. A summary that escapes the boundary is an exfiltration of the source.

### 13.3 Contradiction-Resolution Context Stays Private

Per VisionAir.v1.3 §7.8, contradiction detection requires retrieval of enough context to notice inconsistency. That retrieved context — and any record of detected contradictions — is private. The contradictions in a user's thinking are themselves sensitive.

### 13.4 Compaction Must Not Erode Trust Labels

Context compaction must not collapse Confirmed, Suggested, and Derived into a single compressed representation. Truth-status labels must survive compression. A summary that loses the distinction between "the user said this" and "the system suggested this" violates VisionAir.v1.3's truth-status invariant and weakens this protocol.

### 13.5 Cross-Project Context Sharing Disallowed by Default

Cross-project context sharing — using one project's context to inform another's orchestration — is **disallowed by default** (per §7.3). Any future capability that crosses this line must be an explicit, granular, revocable user opt-in.

### 13.6 Preparing for VisionAir.v1.5

These constraints establish the **privacy contract** under which the dedicated context-engineering artifact (VisionAir.v1.5) must operate. VisionAir.v1.5 will define retrieval strategy, summarization policy, context-window budgeting, and runtime context behavior — all bound by this protocol.

---

## 14. Non-Goals / Constraints

VisionAir.v1.4 deliberately does **not** define:

- **exact encryption algorithms** — choice and parameter selection belong in implementation
- **key management implementation** — KMS choice, rotation policy, key custody architecture
- **exact Firebase security rules** — collection-level rule expressions, predicate logic
- **exact auth provider configuration** — provider selection, session policies, token shapes
- **production SOC / compliance scope** — SOC 2, ISO 27001, HIPAA, GDPR/CCPA implementation programs
- **final legal terms of service** — though VisionAir.v1.4 sets the governing expectations any TOS must serve
- **final retention schedule** — exact retention windows for various data classes
- **incident response playbook detail** — runbooks, on-call rotation, comms templates
- **deployment infrastructure security detail** — network segmentation, container hardening, CI/CD security

VisionAir.v1.4 stays at the **governing trust-protocol level only**.

---

## 15. Success Criteria

VisionAir.v1.4 succeeds when:

- **User project content is clearly treated as protected.** No reader of this document is left wondering whether seeds, regions, branches, suggestions, and outputs are sensitive.
- **Ownership expectations are clearly stated.** Users own what they create in VisionAir; VisionAir is a custodian, not a co-author.
- **Privacy is private-by-default.** No surface, mode, or feature can claim "but the default was open" — the default is private, always.
- **AI assistance does not weaken trust boundaries.** The fact that the system uses AI does not lower confidentiality, ownership, or labeling expectations.
- **Logging / analytics minimization is clearly established.** Project content does not flow into observability surfaces by default; debugging convenience does not override confidentiality.
- **Future implementation can build security posture without guessing the trust model.** A team building auth, persistence, observability, or AI orchestration knows what trust expectations they must satisfy and where the lines are.
- **VisionAir's handling of user-generated business IP is clearly more serious than a generic productivity app.** A reader closing this document should perceive that VisionAir takes its custody of early-stage business creation more seriously than the typical category baseline.

---

## 16. Next Artifact

The next highest-leverage artifact is:

# VisionAir.v1.5 — Context Engineering Specification

VisionAir.v1.5 should define:

- **persistent vs ephemeral retrieval strategy** — what context is loaded at each reasoning step, from where, and under what budget
- **summary / compaction policy** — when summaries are produced, at what fidelity, with what truth-status preservation
- **branch-history retrieval logic** — how active, collapsed, and retired branches are surfaced into reasoning when relevant
- **contradiction-drift prevention at runtime** — how AROD's detection is given enough context to notice inconsistency without violating privacy or budget
- **context-window budgeting for AI orchestration** — how runtime context is prioritized when total budget is finite

VisionAir.v1.5 must inherit from VisionAir.v1.1, VisionAir.v1.2, VisionAir.v1.3, **and VisionAir.v1.4**. The privacy contract established here binds VisionAir.v1.5; any retrieval or summarization strategy that violates this protocol is not a permissible context engineering decision.

---

## 17. Authoritative Implication

VisionAir.v1.4 is binding for all trust-related work — security posture, privacy defaults, IP handling, AI processing boundaries, logging discipline, access control posture, export/deletion expectations — unless explicitly superseded.

It does not supersede VisionAir.v1.1, VisionAir.v1.2, or VisionAir.v1.3. The order of authority is:

1. **VisionAir.v1.1** — what the system thinks
2. **VisionAir.v1.2** — what the user experiences
3. **VisionAir.v1.3** — how the system is technically structured
4. **VisionAir.v1.4** — how the system holds the user's trust

A trust decision that would violate VisionAir.v1.1, .2, or .3 is not a permissible decision under VisionAir.v1.4. A technical, interaction, or intelligence decision that would violate VisionAir.v1.4 is not a permissible decision either: where the four documents touch, **all four must be honored simultaneously**.
