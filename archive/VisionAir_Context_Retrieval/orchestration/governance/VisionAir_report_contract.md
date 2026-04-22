# VisionAir Report Contract

**Document type:** Governance protocol  
**Project:** VisionAir  
**Scope:** All VisionAir report artifacts unless explicitly superseded  
**Date:** 2026-04-16  
**Status:** authoritative_draft  

**Governed by:**
- **AlignFlow** (Alignment Flow) — report sequencing, artifact layering, and next-artifact continuity
- **AROD** (Adaptive Realism and Opportunity Discipline) — non-redundancy, decision clarity, drift-risk surfacing, and truthful distinction between primary artifact and report artifact
- **AMO** (Adaptive Multithreaded Orchestration) — handoff discipline, future-artifact constraints, and report usefulness across the artifact chain

**Supersedes:**
- the prior VisionAir report style that emphasized section-by-section coverage confirmation and broad artifact restatement

---

## 1. Purpose

This contract defines what a VisionAir report artifact is for.

A VisionAir report is **not** a second copy of the primary artifact.  
It is **not** a full section-by-section recap.  
It is **not** a compressed rewrite of the document it reports on.

A VisionAir report exists to add **decision-level leverage** after the primary artifact has already been created.

Its function is to answer:

- what was actually decided
- why those decisions matter
- what future work must now respect
- what was intentionally left unresolved
- what the biggest drift risk is
- what the next artifact must inherit

---

## 2. Replacement Rule

This contract **replaces / overwrites** the earlier VisionAir report pattern.

The earlier pattern emphasized:
- broad coverage confirmation
- section-by-section recap
- repeated artifact restatement

That older pattern is now deprecated for normal VisionAir use because it creates:
- unnecessary token burn
- redundant summaries
- weak signal-to-noise ratio

From this point forward, all new VisionAir reports must follow the protocol defined here unless a future governing artifact explicitly supersedes it.

---

## 3. Core Principle

A report must add value **beyond** the primary artifact.

If a report mainly repeats what the primary artifact already says, it is failing its purpose.

The governing principle is:

> **Primary artifact = authoritative content**  
> **Report artifact = decision-impact layer**

---

## 4. What Reports Should Contain

A standard VisionAir report should contain only the highest-value material.

### 4.1 Report Purpose
A short paragraph confirming:
- what artifact the report belongs to
- that the primary artifact remains authoritative
- that the report exists to capture decisions and implications, not restate the full document

### 4.2 Major Decisions Locked
A concise list of the most important decisions the primary artifact established.

Recommended size:
- 3 to 7 bullets

These should be:
- actual decisions
- not section titles
- not general summaries

#### What qualifies as a "major decision"
A "major decision" must be a real **commitment**, **constraint**, or **architectural lock-in** established by the primary artifact — not merely the existence of a section, topic, or area of coverage.

A useful test:

> If the bullet would remain true regardless of what position the primary artifact had taken, it is **not** a decision.

Examples:

- ❌ *"VisionAir.v1.3 defined a project state model."* — this is a section's existence, not a decision.
- ✅ *"VisionAir.v1.3 locks Flutter / Dart as the v0.1 frontend direction, foreclosing native-per-platform stacks for the foundational period."* — this is a real commitment with downstream consequences.
- ❌ *"The trust model addresses confidentiality."*
- ✅ *"VisionAir.v1.4 binds the platform to the role of custodian (not co-author), foreclosing any future TOS or product framing that would treat user content as platform-owned."*

A bullet that does not name a commitment, constraint, or lock-in does not belong in this section.

### 4.3 Why This Changes the System
A short section explaining what is materially different now that the artifact exists.

This should explain:
- what future work can now assume
- what ambiguity has been removed
- how the system has advanced

### 4.4 Constraints Now Imposed on Future Work
A concise list of what future artifacts must now respect.

Recommended size:
- 3 to 6 bullets

These are not generic reminders.
They are the binding implications of the primary artifact.

### 4.5 Intentionally Unresolved
A concise list of what was deliberately left open.

Recommended size:
- 3 to 6 bullets

This protects against:
- overclaiming completion
- accidental scope creep
- false certainty

### 4.6 Main Drift Risk
A short section identifying the single biggest thing future work is likely to get wrong if it ignores the artifact.

This should be sharp and specific.

#### What qualifies as a real drift risk
The drift risk must identify a **concrete failure mode** that could realistically occur during implementation or future artifact generation — not a generic caution.

A useful test:

> If a competent future implementer or artifact author could read the bullet and not know what to actually avoid doing, it is **too generic**.

Examples:

- ❌ *"Future work might violate the trust model."* — generic; gives no actionable signal.
- ✅ *"Implementations may collapse Confirmed and Suggested into a single storage representation for convenience, silently breaking VisionAir.v1.3 §6.5 and re-introducing Suggested content as confirmed on re-entry."* — names the failure mode, the place it would happen, and the downstream invariant it would violate.
- ❌ *"Future artifacts might add ambiguity."*
- ✅ *"VisionAir.v1.5 is likely to over-retain context for 'just in case' value, drifting from VisionAir.v1.4 §13.1's continuity-relevant-only rule and turning the context layer into a soft confidentiality breach."*

A drift risk that does not name a specific failure mode, the place it would occur, and the rule or invariant it would violate is not yet ready to be the Main Drift Risk.

### 4.7 Next Artifact Handoff
A short section stating:
- what artifact comes next
- what it must inherit
- what it must not violate

### 4.8 One-Sentence Addition to the Chain
One sentence only.

This should explain what the reported artifact adds to the VisionAir document chain.

---

## 5. What Reports Should NOT Contain

Unless explicitly requested, reports should not contain:

- long section-by-section confirmation
- restatement of every header in the primary artifact
- repeated citation of every subsection
- broad paraphrases of the whole document
- full-document compressed rewrites
- large blocks that duplicate the primary artifact's content

If the primary artifact already says it clearly, the report should not say it again unless it is directly relevant to:
- a major decision
- a future constraint
- a drift risk

---

## 6. Report Length Guidance

Reports should generally be much shorter than the primary artifact.

### Preferred report scale
- concise
- high-signal
- implication-focused

### Guideline
A report should normally be:
- short enough to read quickly
- rich enough to guide future work
- not so long that it becomes a second primary artifact

---

## 7. Full Reports vs Micro-Reports

### 7.1 Full Reports
Use full reports for major backbone artifacts such as:
- core intelligence architecture
- interaction architecture
- technical foundation
- trust/security/privacy protocol
- context engineering specification

### 7.2 Micro-Reports
Use micro-reports for:
- correction passes
- small refinements
- patches
- backfills
- narrow addenda

A micro-report may contain only:
- 3 decisions locked
- 2 unresolved items
- 1 main drift risk
- next artifact

This is acceptable and preferred when the artifact is small.

---

## 8. Preservation Rule

Every report must explicitly confirm:

- the primary artifact remains authoritative
- the report does not replace the primary artifact
- the report does not rewrite the primary artifact
- the report exists to improve continuity, not to become a second source of truth

---

## 9. Output Contract Relationship

This contract governs **report content**.

It does not replace the VisionAir Output Contract, which still governs:
- save/print discipline
- fence formatting
- artifact priority
- remote/mobile-safe output handling

Both contracts apply simultaneously:
- the Output Contract controls **how** reports are emitted
- the Report Contract controls **what** reports should contain

---

## 10. Mandatory Future Rule

All future VisionAir reports must follow this contract unless explicitly overridden by a later governing document.

If a future report prompt conflicts with this contract, the conflict should be resolved in favor of:
- non-redundancy
- decision usefulness
- token efficiency
- clear handoff value

not in favor of exhaustive recap.

---

## 11. Final Rule

A VisionAir report must help the next step more than it repeats the last one.

That is the measure of whether the report is good.
