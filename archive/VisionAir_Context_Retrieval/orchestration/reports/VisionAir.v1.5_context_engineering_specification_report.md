# VisionAir.v1.5 — Context Engineering Specification Report

**Document type:** Report artifact (Full Report, per VisionAir Report Contract §7.1)  
**Project:** VisionAir  
**Iteration:** VisionAir.v1.5 report  
**Phase:** Context-engineering confirmation  
**Date:** 2026-04-16  
**Runtime class:** report  
**Status:** authoritative_draft  

**Governed by:**
- **VisionAir Report Contract** — decision-impact reporting (supersedes prior coverage-style reports)
- **VisionAir Output Contract** — save → print → continue, non-truncation, copy-paste safety

**Reports on:**
- `docs/orchestration/context/VisionAir.v1.5_context_engineering_specification.md`

---

## 1. Report Purpose

This report belongs to the VisionAir.v1.5 primary artifact. The primary artifact remains the sole authority on VisionAir's context-engineering specification. This report does not restate it — it captures the decisions locked, the constraints newly imposed, what was intentionally left open, and the main drift risk that future work must avoid.

This is the first VisionAir report written under the new **VisionAir Report Contract** (decision-impact layer, not section-by-section coverage).

---

## 2. Major Decisions Locked

1. **Truth-status preservation is the single most important rule at the context layer.** VisionAir.v1.5 §12.3 makes collapse of Confirmed / Suggested / Derived / Weak / Stable distinctions a spec-level violation — not a surface or persistence concern alone. Every retrieval, summary, and compaction operation is bound by it.
2. **Summaries are always labeled Derived — never Confirmed, never Suggested.** Even when every source of a summary was Confirmed, the summary is Derived. This is a hard three-way distinction: Confirmed, Suggested, Derived are separate truth-status tiers at every layer (§7.4).
3. **Full-history loading is prohibited by default.** Every reasoning step operates under a named retrieval contract (§5.2) that declares exactly what it needs. Loading the whole project into context is explicitly rejected even when budget allows — because it makes downstream discipline impossible.
4. **Context is organized in three tiers (§6), and Tier 1 is non-negotiable.** Seed, active region, confirmed truths on load-bearing regions, and current branch ranking load at full fidelity for every step. If Tier 1 alone exceeds budget, the budget is wrong — Tier 1 does not get summarized.
5. **Contradictions are surfaced, not resolved (§9.4).** AROD flags them as weakness signals on the relevant regions. The context layer is explicitly forbidden from rewriting Confirmed content, dropping conflicting Confirmed content from retrieval, or compacting two conflicting Confirmed statements into one reconciled Derived statement.
6. **The next-most-important prompt is recomputed at re-entry, never retrieved stale (§10.3).** Guided Continuation may have shifted the weakness landscape while the user was away; a cached prompt would violate VisionAir.v1.2 §8's "ask only the next most important" rule. Recomputation cost is the correctness budget re-entry must pay.
7. **Context decay is a system responsibility (§14).** Pending suggestions expire under a transparent window; branches collapse when signal stops supporting them; summaries regenerate rather than patch incrementally. "Context must remain relevant, not just preserved" is an active discipline, not a passive preservation policy.

---

## 3. Why This Changes the System

Before VisionAir.v1.5, the chain had declared *that* truth-status must be preserved, *that* Guided Continuation must stay epistemically honest, and *that* re-entry must feel continuous. VisionAir.v1.5 is where those declarations become **retrieval-level operational rules**. Future work can now assume:

- every context class has a defined role, persistence requirement, and sensitivity tier (§3)
- every reasoning step has a named retrieval contract, not a free-form "load what you need" affordance (§5.2)
- the three-tier prioritization model is the compositional primitive for any runtime context assembly (§6)
- the boundary between context engineering and runtime orchestration is explicit — VisionAir.v1.5 declares *what context must be*; VisionAir.v1.6 will declare *how runtime uses it*

The ambiguity that has been removed: "what does the context layer have to do to keep the trust contract intact?" That is now answered.

---

## 4. Constraints Now Imposed on Future Work

- **VisionAir.v1.6 (runtime)** must honor the three-tier prioritization when composing inference calls. A runtime step that loads Tier 3 context by default violates the spec.
- **Any compaction/summarization component** must emit Derived-labeled output carrying both provenance and preserved truth-status of sources. A summarizer that returns flat text without labels is non-compliant.
- **Any retrieval component** must satisfy a named per-step contract (§5.2). A retrieval surface that accepts "get everything about this project" queries violates §5.
- **Any contradiction-handling logic** must surface conflict as a weakness signal on the involved regions, never reconcile silently. Automated conflict resolution over Confirmed content is forbidden.
- **Cross-project cache, index, or similarity structure** is disallowed at the default layer. Any future cross-project feature must be user-opt-in, granular, revocable — never a shared backend primitive.
- **The re-entry renderer** must request freshly computed next-prompts, not read them from last-session state. A re-entry path that uses a cached prompt is incorrect by construction.

---

## 5. Intentionally Unresolved

- **Exact token/retrieval budgets per tier** — model-, task-, and revenue-dependent; belongs to runtime (VisionAir.v1.6) or operational tuning.
- **Specific retrieval algorithms** (vector vs keyword vs hybrid, scoring, reranking) — implementation concern; VisionAir.v1.5 specifies contracts, not mechanisms.
- **Decay windows** (how long a Pending suggestion ages out; how long a branch stays inactive before collapse) — policy that AMO at runtime will set; must be transparent to users but not pre-bound by this document.
- **Summarization fidelity thresholds** — how aggressive to compress, when to regenerate vs patch — deferred to operational tuning with observable quality metrics.
- **Cache structure and invalidation** — including whether per-project caches even exist at the implementation level — left to the runtime model and storage artifacts.
- **Prompt wording for inference calls** — out of scope by definition; VisionAir.v1.5 specifies the context shape inference calls consume, not the prompts that consume it.

---

## 6. Main Drift Risk

**The highest-probability failure mode is compaction-under-pressure collapsing truth-status distinctions.**

Concretely: a runtime step composing context for an inference call will hit a budget ceiling, invoke a summarizer to compress Tier 2 history, and the summarizer — optimizing for semantic density — will produce a block of text that reads naturally but strips the Confirmed / Suggested / Derived labels off each source statement. That compacted block gets passed to reasoning, is used to produce a suggestion or synthesis, and now the output is generated against a context in which the system can no longer tell what the user committed vs what the system proposed.

This failure:
- **happens where:** the summarization step in any runtime retrieval pipeline (the place where Tier 2 or Tier 3 content is compressed to fit budget)
- **breaks which invariant:** VisionAir.v1.3 §6.5 (truth-status persistence is the single most important technical invariant), VisionAir.v1.4 §13.4 (compaction must not erode trust labels), and VisionAir.v1.5 §7.4 and §12.3 (summaries must be Derived; truth-status preservation at every operation)
- **surfaces as:** Guided Continuation suggestions that begin implicitly treating Suggested-but-never-confirmed content as user truth; syntheses that state system inferences in the user's voice; re-entry surfaces where the user returns and can no longer tell what they committed last session
- **how to avoid it:** any summarizer in the runtime must output labeled, structured summaries — not flat prose. The output type of a VisionAir-compliant summarizer is Derived content with per-fragment truth-status and provenance preserved, or it is rejected at the boundary per VisionAir.v1.3 §11.4.

A second, related drift (lower-probability but still real): **over-retention**, where a runtime keeps stale context "just in case" rather than letting it decay per §14 — turning the context layer into a soft confidentiality breach against VisionAir.v1.4 §13.1. This is less catastrophic than the truth-status collapse but erodes trust more quietly over time.

---

## 7. Next Artifact Handoff

**Next:** VisionAir.v1.6 — Runtime Orchestration & Execution Model

**Must inherit:**
- the three-tier prioritization model (§6) as the compositional primitive for inference-call context
- the per-step retrieval contracts (§5.2) as the interface between orchestration and context
- the labeled-summary requirement (§7.4) — no flat-text summarizers
- the freshly-computed-prompt rule on re-entry (§10.3)
- cross-project isolation at the runtime retrieval boundary (§13)

**Must not violate:**
- truth-status preservation under budget pressure (§12.3) — runtime cannot trade this for latency, cost, or simplicity
- full-history loading prohibition (§5.1) — no "just load everything" fallback
- contradiction-surfacing rule (§9.4) — runtime cannot auto-resolve AROD-detected conflicts even under user-pressure patterns

---

## 8. One-Sentence Addition to the Chain

VisionAir.v1.5 turns VisionAir's trust, interaction, and technical commitments into **operational retrieval rules** — making the system able to remember, retrieve, and reason coherently over time without silently collapsing the truth-status distinctions that the earlier layers made inviolable.

---

## 9. Preservation

The VisionAir.v1.5 primary artifact (`docs/orchestration/context/VisionAir.v1.5_context_engineering_specification.md`) remains authoritative. This report does not replace it, does not rewrite it, and does not restate it section by section — per the VisionAir Report Contract.
