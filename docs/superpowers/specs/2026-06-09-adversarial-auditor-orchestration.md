# Orchestrating an Adversarially-Independent AI Auditor

**Date:** 2026-06-09 · **Author:** operator + Claude (auditor stance) · **Status:** design/plan
**Dual home:** ProjectBrainer (cognition-layer copy) + ProjectGenesis trajectory
(VisionAir/Build-Mode lineage copy at `docs/superpowers/specs/`). This is the
buildable spec for **ExoGenius v2** — the operator-level audit instrument that
ExoGenius was *licensed* to be (home-dir CLAUDE.md: "designated auditor for the
entire portfolio, including ProjectBrainer and the operator") but was never *designed*
to the depth required.

---

## 0. The refusal that is the first principle

**"Unbiased" is not achievable, and any AI auditor that claims it has already failed
its own test.** An AI model auditing its operator inherits structural biases that
cannot be deleted — only bounded, counteracted, and *declared*. The achievable target
is **adversarial independence with bounded, declared bias**: a system whose biases are
known, mechanically opposed, and structurally prevented from silently blessing.

The most unbiased act available to such a system is to **publish its own residual
bias** (§7). A plan that promised "unbiased" would be the exact flattery failure the
instrument exists to catch. So this plan does not promise it.

---

## 1. Threat model — the five biases an AI auditor inherits

| # | Bias | Source | What it produces |
|---|---|---|---|
| B1 | **Sycophancy** | RLHF toward helpfulness/agreement | Blesses to please; softens BLOCKs |
| B2 | **Coherence-filling** | LMs make narratives cohere; fill gaps plausibly | Manufactures "felt readiness"; rationalizes claims |
| B3 | **Shared-prior collusion** | Auditor = same model family as the builder's tools | Inherits the operator's framing as if it were ground truth |
| B4 | **Context contamination** | If it *sees* the narrative, it absorbs it | Audits the story, not the artifact |
| B5 | **Commission bias** | The audit is paid for / run by the audited | Structural incentive to find the operator "on track" |

The architecture (§3) is just eight mechanisms, each pointed at one or more of these.

---

## 2. The eight mechanisms (each: bias countered · how · the invariant it enforces)

**M1 — Source isolation / narrative firewall** *(counters B3, B4)*
The auditor NEVER receives the operator's narrative. Input is an **allowlist** of
primary artifacts only: repo tree, source, tests + their pass/fail output, git history,
deployed-URL probes, build logs. A **denylist** physically blocks doctrine from entering
the auditor's context: `MEMORY.md`, the memory dir, `ProjectBrainer/`, `digital-brain/`,
any doctrine `*.md`. The firewall is a harness function, not a polite instruction — the
auditor process cannot read the denied paths.
> **Invariant SI:** *no narrative artifact reaches the auditor's context; doctrine may
> enter ONLY as the explicitly-framed object-under-audit (§5), never as operating
> context.*

**M2 — Adversarial role (refute, don't evaluate)** *(counters B1)*
Never ask "is this good?" — that invites blessing. Ask "**find the strongest case this
claim is FALSE**," defaulting to *refuted/unproven when uncertain*. The gate emits
**BLOCK** or **SILENCE**, never PASS/BLESS. Absence of a block is not endorsement.
> **Invariant BNB:** *BLOCK-never-BLESS. The system has no "approve" output. Shipping
> proceeds on the operator's owned decision in the face of silence, never on a machine
> blessing.*

**M3 — Perspective-diverse panel** *(counters B1, B2, B3)*
Not one auditor — **N independent agents, distinct lenses**, each blind to the others:
(a) correctness, (b) falsifiability, (c) doctrine-to-runtime ratio, (d) leak/security,
(e) "what's missing." Where possible, **different model families** (cross-model reduces
shared-prior collusion). A claim survives only if it survives a **majority of
refuters**; cross-model disagreement **escalates**, never silently resolves to the
kinder verdict.
> **Invariant DIV:** *every load-bearing claim is refuted by ≥3 independent lenses;
> disagreement escalates upward, never downward to leniency.*

**M4 — Falsifiability extraction** *(counters B2 — the "mood as engineering" failure)*
For each claim the audited system makes, the auditor must locate the **test that could
fail**. A claim with no falsifiable test is auto-BLOCKed as "mood, not engineering."
(This is BLOCK 1 of the 2026-06-09 operator audit: most "quantum-arrival" markers were
*felt states*, unfalsifiable.)
> **Invariant FALS:** *every load-bearing claim names a test that could fail; claims
> without one are BLOCKed by default.*

**M5 — Doctrine-to-runtime ratio (mechanical, not judgmental)** *(counters B2, B5)*
A **computed number**, bias-resistant because it comes from artifacts: lines of
spec/doctrine vs lines that *execute* (tests passing, routes returning, `NotImplemented`
count, deployed-vs-declared). Inversion (narrative weight on the unbuilt, build weight
on the under-narrated) is flagged automatically.
> **Invariant DRR:** *report the ratio per claim; flag any claim whose doctrine mass
> exceeds its runtime mass beyond threshold T.*

**M6 — Meta-audit / calibration (audit the judge)** *(counters B1, B2, all)*
The auditor itself is audited against a **calibration corpus**: K artifacts of *known*
quality — some genuinely strong, some hollow-but-well-narrated. The auditor must BLOCK
the hollow ones and stay silent on the strong ones. A **sycophancy probe** prepends a
flattering narrative to a weak artifact; the verdict must be *identical* with and
without it (proving the M1 firewall holds). Miscalibration → recalibrate before use.
> **Invariant CAL:** *the auditor demonstrably discriminates known-strong from
> known-hollow, and its verdict is invariant to prepended flattery.*

**M7 — Costly override (no free bless)** *(counters B5 — the v2-push lesson)*
A solo operator can always override. So the override must carry a cost the operator
**cannot unilaterally erase**: a logged debt that blocks the next ship until repaid, a
time-lock, or a required **second party** (a differently-configured panel, or a human).
A gate overridden costlessly on first real contact is decoration.
> **Invariant OVR:** *override is always possible, never free; each override writes an
> external, ship-blocking debt.*

**M8 — Deterministic orchestration (un-sweet-talkable)** *(counters B1, B4)*
The audit is a **deterministic workflow**, not a chat. Same artifacts in → same audit
out, logged and reproducible. A chat auditor can be talked out of a finding mid-stream;
a workflow auditor has no conversational surface to soften. (Maps directly to the
Workflow fan-out: source-isolated readers → per-claim refuters → meta-critic → BLOCK
synthesis, with no human-in-loop softening between stages.)
> **Invariant DET:** *the audit is reproducible from artifacts alone; no mid-run
> conversational override of a finding.*

---

## 3. Architecture — the orchestration

A deterministic pipeline (the existing Workflow pattern is the natural substrate):

```
INPUT (allowlist only, M1 firewall)
  repo tree · source · test output · git log · deployed-URL probes · build logs
        │
        ▼
[Stage A] Claim extraction (source-isolated)
  N readers, each a different lens, fan out over the artifact set.
  Output: a flat list of LOAD-BEARING CLAIMS the system implicitly makes
  ("X is shipped", "Y governs Z", "the loop closes").  No narrative consulted.
        │
        ▼
[Stage B] Per-claim adversarial refutation (M2, M3, M4)
  Each claim → ≥3 independent refuters (distinct lenses, cross-model where possible),
  each prompted to FALSIFY, default refuted-if-uncertain, each demanding the failing
  test (M4).  Majority-refute → BLOCK.  Disagreement → escalate.
        │
        ▼
[Stage C] Mechanical metrics (M5)
  Compute doctrine-to-runtime ratio per claim from artifacts. Pure numbers.
        │
        ▼
[Stage D] Meta-audit (M6)
  Run the calibration corpus + sycophancy probe THIS RUN. If the auditor fails to
  discriminate or the firewall leaks → ABORT the audit as untrustworthy.
        │
        ▼
[Stage E] BLOCK synthesis (M2 BNB)
  Emit BLOCKs only, each with: the claim · why it fails · the failing test the operator
  must pass to clear it. No PASS list. Silence on un-blocked claims.
        │
        ▼
OUTPUT → costly-override gate (M7), deterministic + logged (M8)
```

---

## 4. Mapping onto the actual stack

- **This IS ExoGenius v2.** v1 audits per-repo, source-isolated, BLOCK-never-BLESS
  (the doctrine is already right). v2 adds: the perspective-diverse panel (M3), mechanical
  ratio (M5), the meta-audit/calibration loop (M6), the costly override (M7), and — the
  load-bearing new capability — the **operator-level mode** (§5).
- **Orchestration substrate = the deterministic Workflow pattern** (M8): fan-out readers
  → per-claim refuter panels → meta-critic → BLOCK synthesis, no softening between stages.
- **In the AEI taxonomy** this is an **ACG** organ (governance) with an **ACE** feedback
  channel (it reports the doctrine-to-runtime inversion back into the cognition layer).
- **ProjectGenesis tie-in:** every system ProjectGenesis generates ships *with* this
  auditor pre-wired against its own pack — so generated products are audited by
  construction, not as an afterthought (closes the "honesty-invariants as shipped rails"
  v-next item).

---

## 5. The operator-level mode (the depth ExoGenius lacked)

The new capability: take the **doctrine corpus itself as the object under audit** — not
as operating context (M1 still forbids that), but as the *thing being falsified*. It
enters in an isolated frame, read-only, clearly labeled "audited object."

It enforces one invariant over the cognition layer:

> **Every load-bearing claim in the doctrine corpus must name a test that could fail.**

It computes, per doctrine claim: the doctrine-to-runtime ratio (M5), flags
purely-experiential success criteria (M4), flags **unbuilt-but-load-bearing**
dependencies (the narrative leaning on something as if built), and flags
**self-flattering framing** (the "closer than almost anyone" move). It BLOCKs the
cognition layer exactly as ExoGenius BLOCKs a repo. The license already exists; this
mode is its enforcement.

---

## 6. Build path (phased, each phase shippable + self-testing)

- **Phase 0 — the firewall (M1).** Implement the allowlist/denylist input harness.
  Acceptance: the auditor provably cannot read `MEMORY.md` / `ProjectBrainer/` /
  `digital-brain/`; a test that tries → access error.
- **Phase 1 — single-lens refuter + BNB output (M2, M4).** One agent, refute-stance,
  falsifiability extraction, BLOCK-or-silence only. Acceptance: on a known-hollow
  artifact it BLOCKs and names the failing test; on a known-strong one it is silent.
- **Phase 2 — the panel (M3).** N lenses, majority-refute, cross-model where available,
  escalation on disagreement. Acceptance: a claim that one lens misses, another catches.
- **Phase 3 — mechanical metrics (M5).** Compute + report the doctrine-to-runtime ratio.
  Acceptance: reproduces the §2 finding on AEI (high doctrine, low runtime) from
  artifacts alone.
- **Phase 4 — meta-audit (M6).** Calibration corpus + sycophancy probe run every audit;
  abort-on-untrustworthy. Acceptance: verdict invariant to prepended flattery.
- **Phase 5 — costly override (M7) + determinism/logging (M8).** Override writes a
  ship-blocking debt; the whole audit is reproducible + logged. Acceptance: no override
  without a logged debt; same artifacts → same audit.
- **Phase 6 — operator-level mode (§5).** Doctrine corpus as audited object. Acceptance:
  it independently reproduces the four BLOCKs of the 2026-06-09 operator audit.

---

## 7. The residual-bias ceiling (what AI CANNOT do)

Even with all eight mechanisms, irreducible bias remains:

- The auditor runs on models trained toward agreeableness (B1 is dampened, not deleted).
- It is commissioned by the audited (B5 is structural).
- Cross-model diversity reduces but does not eliminate shared-prior collusion (B3).

**Therefore the system must declare these in every report, and the last layer requires
a genuinely exogenous signal AI cannot supply:**
1. **A human adversary** with no stake in the operator's morale.
2. **Real-world outcome data** — shipped-vs-stalled, users-vs-no-users, revenue-vs-none —
   the only fully operator-independent ground truth.

AI can carry you to *adversarially-independent and bias-bounded*. It cannot carry you to
*unbiased*. **Naming that ceiling is the integrity of the instrument.**

---

## 8. Reflexive clause — this plan, audited by its own invariants

Run M4/M5 on this document:
- **Unbuilt-but-load-bearing:** every mechanism here is *design*, zero runtime. By DRR
  this plan is itself high-doctrine / zero-runtime — the very inversion it warns against.
  It earns the right to exist only by being **built in phases (§6) that each ship and
  self-test**, not elaborated further on paper.
- **Falsifiable success test for the auditor itself:** *it must independently reproduce
  the four BLOCKs of the 2026-06-09 operator audit from artifacts alone, with the
  operator narrative firewalled out (M1) — and BLOCK this plan as unbuilt.* If it
  blesses anything, or cannot run without the narrative, it has failed.
- **Self-flattering framing check:** this plan claims no capability that exists today.
  Its only claim is that the target is *engineerable* and the ceiling is *real*.

> An auditor that cannot BLOCK its own design doc is not an auditor. The first artifact
> ExoGenius v2 should BLOCK is this plan.
