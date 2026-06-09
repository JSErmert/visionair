# Build Mode Slice 0 — Routing + Gap-Extraction Fix (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the synthesizer so cross-cutting answers no longer dump into the wrong file (e.g. positioning/honesty content landing in `06-security.md`) and so genuinely-flagged open items always surface in `07-known-gaps.md`.

**Architecture:** Three coordinated synthesis changes — (A) tighten the `security` interview framing so it stops eliciting self-representation answers; (B) a lane-guard in the synthesis system prompt so each file keeps only its own dimension; (C) a dedicated gap-extraction pass that scans all answers + drafted files for verify/uncertain/do-not-quantify/decision items and writes them into known-gaps, replacing the old "uncovered-moves-only" logic. No UI or DB changes in this slice.

**Tech Stack:** TypeScript · Vitest · existing `lib/build-mode/*` engine · `@anthropic-ai/sdk` (injected `AskLLM`).

**Scope note (deviation from design spec):** The design spec's Slice-0 acceptance imagined an LLM *content-mover* that physically relocates positioning text from a security answer into identity. We instead fix the root cause deterministically: tightening the security question (A) means security answers are about security, and the lane-guard (B) keeps the security file in its lane, while the gap pass (C) captures flagged items globally. A full LLM content-mover is deferred as a v-next refinement if cross-cutting answers persist in practice. This is a smaller, lower-risk, fully-testable surface that addresses the observed failure.

---

### Task 1: Tighten the `security` move framing

**Files:**
- Modify: `lib/build-mode/interview.ts` (the `MOVE_FRAMING.security` entry)
- Test: `lib/build-mode/interview.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `lib/build-mode/interview.test.ts`, inside the existing `describe("OG-voiced question generation", ...)` block (after the last `it`):

```ts
  it("security framing steers toward real security, not self-representation", () => {
    expect(MOVE_FRAMING.security).toMatch(/data|secret|leak|abuse|protect|fail/i);
    expect(MOVE_FRAMING.security).not.toMatch(/represent|come across|honest|inflat/i);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/build-mode/interview.test.ts`
Expected: FAIL — current framing ("what they'd never want to go wrong") does not contain a data/secret/abuse term.

- [ ] **Step 3: Implement the change**

In `lib/build-mode/interview.ts`, replace the `security` entry of `MOVE_FRAMING`:

```ts
  "security": "Surface what's genuinely sensitive in how this is built and run — data that must stay protected, secrets or access that could leak, and the ways it could be abused or fail under bad input.",
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/build-mode/interview.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/build-mode/interview.ts lib/build-mode/interview.test.ts
git commit -m "fix(build-mode): tighten security move framing to real security, not self-representation"
```

---

### Task 2: Lane-guard in the synthesis system prompt

**Files:**
- Modify: `lib/build-mode/synthesize.ts` (the `SYNTH_SYSTEM` constant)
- Test: `lib/build-mode/synthesize.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `lib/build-mode/synthesize.test.ts`, inside the existing `describe("deviation-flagging", ...)` block (it already imports `SYNTH_SYSTEM`):

```ts
  it("the synthesis system prompt instructs the model to stay in its dimension's lane", () => {
    expect(SYNTH_SYSTEM).toMatch(/only.*(this|the named) dimension|stay in|belongs to (a )?different/i);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/build-mode/synthesize.test.ts`
Expected: FAIL — current `SYNTH_SYSTEM` has no lane-guard language.

- [ ] **Step 3: Implement the change**

In `lib/build-mode/synthesize.ts`, replace `SYNTH_SYSTEM` with:

```ts
export const SYNTH_SYSTEM =
  "You are VisionAir Build Mode synthesizer. Write a concise, high-depth context file " +
  "for the named dimension, grounded ONLY in the user's answer. Include ONLY content that " +
  "belongs to this dimension — if the answer also contains material about a different " +
  "dimension (for example positioning/identity, or open items the user wants to verify " +
  "later), do not force it into this file. Do not invent facts. If the answer is thin, " +
  "write only what it supports. If you make any design choice that diverges from the user's " +
  "answer (e.g. a safer alternative), you MUST add a line " +
  "`> DEVIATION from elicited answer — rationale: <why>` and MUST NOT present the change as " +
  "something the user specified.";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/build-mode/synthesize.test.ts`
Expected: PASS (the existing `SYNTH_SYSTEM` deviation test still passes — the `DEVIATION from elicited answer` substring is retained).

- [ ] **Step 5: Commit**

```bash
git add lib/build-mode/synthesize.ts lib/build-mode/synthesize.test.ts
git commit -m "fix(build-mode): add lane-guard to synthesis prompt so files keep their own dimension"
```

---

### Task 3: Gap-extraction module (`gaps.ts`)

**Files:**
- Create: `lib/build-mode/gaps.ts`
- Test: `lib/build-mode/gaps.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/build-mode/gaps.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { extractGaps, GAPS_SYSTEM } from "./gaps";
import { Answer, ElicitedArtifact } from "./types";

const answers: Answer[] = [
  { move: "non-negotiables", question: "q", response: "AlignFlow is a prototype, do not call it a production engine; verify internship metrics before publish." },
];
const arts: ElicitedArtifact[] = [
  { path: "docs/context/01-non-negotiables.md", provenance: "elicited", content: "Prototype, not production." },
];

describe("gap-extraction pass", () => {
  it("returns parsed gap items from a JSON array", async () => {
    const askLLM = vi.fn().mockResolvedValue(
      '[{"tag":"do-not-quantify","text":"AlignFlow is a prototype, not a production engine"},{"tag":"verify","text":"confirm internship metrics before publish"}]',
    );
    const out = await extractGaps("an idea", answers, arts, askLLM);
    expect(out).toHaveLength(2);
    expect(out[0].tag).toBe("do-not-quantify");
    expect(out[1].text).toContain("internship metrics");
  });

  it("strips a ```json fence and a leading BOM", async () => {
    const askLLM = vi.fn().mockResolvedValue(
      "﻿```json\n" + JSON.stringify([{ tag: "uncertain", text: "fenced + bom item" }]) + "\n```",
    );
    const out = await extractGaps("x", answers, arts, askLLM);
    expect(out).toHaveLength(1);
    expect(out[0].text).toBe("fenced + bom item");
  });

  it("drops items with an unknown tag", async () => {
    const askLLM = vi.fn().mockResolvedValue(
      '[{"tag":"verify","text":"keep me"},{"tag":"bogus","text":"drop me"}]',
    );
    const out = await extractGaps("x", answers, arts, askLLM);
    expect(out).toHaveLength(1);
    expect(out[0].text).toBe("keep me");
  });

  it("returns [] on malformed JSON without throwing", async () => {
    const askLLM = vi.fn().mockResolvedValue("not json {{{");
    const out = await extractGaps("x", answers, arts, askLLM);
    expect(out).toEqual([]);
  });

  it("returns [] and never calls the LLM when there are no answers", async () => {
    const askLLM = vi.fn();
    const out = await extractGaps("x", [], arts, askLLM);
    expect(out).toEqual([]);
    expect(askLLM).not.toHaveBeenCalled();
  });

  it("system prompt names the allowed tags", () => {
    expect(GAPS_SYSTEM).toContain("verify");
    expect(GAPS_SYSTEM).toContain("do-not-quantify");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/build-mode/gaps.test.ts`
Expected: FAIL — `./gaps` does not exist.

- [ ] **Step 3: Write the implementation**

Create `lib/build-mode/gaps.ts`:

```ts
import { AskLLM } from "./interview";
import { Answer, ElicitedArtifact } from "./types";

export type GapTag = "verify" | "do-not-quantify" | "uncertain" | "decision-needed";

export interface GapItem {
  tag: GapTag;
  text: string;
}

const ALLOWED: GapTag[] = ["verify", "do-not-quantify", "uncertain", "decision-needed"];

export const GAPS_SYSTEM =
  "You audit a project's interview answers and drafted context files for OPEN ITEMS the " +
  "builder must resolve before or during the build: things the user flagged to verify, " +
  "figures that must NOT be quantified or stated as verified fact, genuine uncertainties, " +
  "and decisions left unmade. Return ONLY a JSON array of objects " +
  '{"tag": one of "verify" | "do-not-quantify" | "uncertain" | "decision-needed", "text": string}. ' +
  "Return an empty array if there are none. Do not invent items — only surface what the source " +
  "material actually flags.";

export async function extractGaps(
  idea: string,
  answers: Answer[],
  artifacts: ElicitedArtifact[],
  askLLM: AskLLM,
): Promise<GapItem[]> {
  if (answers.length === 0) return [];
  const user =
    `IDEA: ${idea}\n\nANSWERS:\n` +
    answers.map((a) => `- (${a.move}) ${a.response}`).join("\n") +
    `\n\nDRAFTED FILES:\n` +
    artifacts.map((a) => `=== ${a.path} ===\n${a.content}`).join("\n\n");
  try {
    const raw = (await askLLM(GAPS_SYSTEM, user))
      .replace(/^﻿/, "")
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```$/, "")
      .trim();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x: unknown): x is GapItem =>
        !!x &&
        typeof (x as GapItem).text === "string" &&
        ALLOWED.includes((x as GapItem).tag),
    );
  } catch {
    return []; // parse/transport failure must never block the pack
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/build-mode/gaps.test.ts`
Expected: PASS (all 6)

- [ ] **Step 5: Commit**

```bash
git add lib/build-mode/gaps.ts lib/build-mode/gaps.test.ts
git commit -m "feat(build-mode): add gap-extraction pass (extractGaps) for flagged open items"
```

---

### Task 4: Wire `extractGaps` into `synthesize` and rebuild known-gaps

**Files:**
- Modify: `lib/build-mode/synthesize.ts` (`synthesize` function body + import)
- Test: `lib/build-mode/synthesize.test.ts`

- [ ] **Step 1: Write the failing test**

Add a new `describe` block to `lib/build-mode/synthesize.test.ts` (top imports already include `initCoverage`, `applyAnswer`, `synthesize`):

```ts
describe("known-gaps incorporates extracted gap items", () => {
  it("surfaces flagged items returned by the gap pass into known-gaps", async () => {
    // Branch the mock: the gap pass uses GAPS_SYSTEM; everything else is synthesis.
    const askLLM = vi.fn(async (system: string) => {
      if (system.includes("OPEN ITEMS")) {
        return '[{"tag":"do-not-quantify","text":"AlignFlow is a prototype, not production"}]';
      }
      return "# File\nsome synthesized content";
    });
    let s = initCoverage("a portfolio site");
    s = applyAnswer(s, {
      move: "non-negotiables",
      question: "q",
      response: "do not call AlignFlow a production engine",
    });
    const arts = await synthesize(s, askLLM);
    const gaps = arts.find((a) => a.path === "docs/context/07-known-gaps.md");
    expect(gaps?.content).toContain("AlignFlow is a prototype");
    expect(gaps?.content).toContain("[do-not-quantify]");
  });

  it("still reports None when no moves are missing and no items are flagged", async () => {
    const askLLM = vi.fn(async (system: string) =>
      system.includes("OPEN ITEMS") ? "[]" : "# File\ncontent",
    );
    let s = initCoverage("x");
    for (const m of ["identity","non-negotiables","doctrine","contracts","core-logic","security"] as const) {
      s = applyAnswer(s, { move: m, question: "q", response: "r" });
    }
    const arts = await synthesize(s, askLLM);
    const gaps = arts.find((a) => a.path === "docs/context/07-known-gaps.md");
    expect(gaps?.content).toContain("None — every dimension was covered");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/build-mode/synthesize.test.ts`
Expected: FAIL — current `synthesize` ignores extracted items; known-gaps will not contain the flagged text.

- [ ] **Step 3: Implement the change**

In `lib/build-mode/synthesize.ts`, add the import near the top (with the other relative imports):

```ts
import { extractGaps } from "./gaps";
```

Then replace the known-gaps assembly at the end of `synthesize` (the single `arts.push({ path: "docs/context/07-known-gaps.md", ... })` block) with:

```ts
  const extracted = await extractGaps(s.idea, s.answers, arts, askLLM);

  const sections: string[] = [];
  if (gaps.length) {
    sections.push(
      gaps.map((g) => `- **${g}**: not yet specified — confirm before building on it.`).join("\n"),
    );
  }
  if (extracted.length) {
    sections.push(
      "## Flagged in your answers (verify before / during build)\n" +
        extracted.map((it) => `- _[${it.tag}]_ ${it.text}`).join("\n"),
    );
  }

  arts.push({
    path: "docs/context/07-known-gaps.md",
    provenance: "open",
    content:
      "# Known gaps (resolve before / during build)\n\n" +
      (sections.length ? sections.join("\n\n") : "_None — every dimension was covered._"),
  });

  return arts;
```

Note: leave the per-move loop and the `gaps` array exactly as they are; only the trailing known-gaps push changes, and `return arts;` stays at the end (remove the old duplicate `return arts;` if the replacement introduces one — there must be exactly one `return arts;`).

- [ ] **Step 4: Run the full module suite to verify pass + no regressions**

Run: `npx vitest run lib/build-mode`
Expected: PASS — the two new tests pass and all prior tests stay green. In particular the existing "routes unknown moves into known-gaps and never calls the LLM for them" test still passes because `extractGaps` returns `[]` without calling the LLM when `s.answers` is empty.

- [ ] **Step 5: Commit**

```bash
git add lib/build-mode/synthesize.ts lib/build-mode/synthesize.test.ts
git commit -m "feat(build-mode): merge extracted gap items into known-gaps during synthesis"
```

---

### Task 5: Full regression + live re-verification against the run-3 inputs

**Files:**
- No source changes (verification only)
- Reference input: reconstruct `C:/Users/JSEer/build-mode-test-packs/portfolio-idea-run3.json` from the run-3 answers (idea + the 6 elicited answers, including the honesty/positioning answer)

- [ ] **Step 1: Type-check and run the full build-mode suite**

Run: `npx tsc --noEmit && npx vitest run lib/build-mode`
Expected: `tsc` exit 0; all tests pass (prior 47 + the new gaps + synthesize tests).

- [ ] **Step 2: Build a pack from the run-3 inputs via the CLI**

Create `C:/Users/JSEer/build-mode-test-packs/portfolio-idea-run3.json` with the run-3 idea and the six answers (identity, non-negotiables, doctrine, core-logic ×2 collapsed to the canonical move set, security/honesty). Then, with the API key loaded BOM-tolerantly (never printed):

```bash
export ANTHROPIC_API_KEY="$(grep -m1 'ANTHROPIC_API_KEY=' .env.local | sed 's/.*ANTHROPIC_API_KEY=//; s/\r$//; s/^"//; s/"$//')"
npm run build-mode -- --in /c/Users/JSEer/build-mode-test-packs/portfolio-idea-run3.json --out /c/Users/JSEer/build-mode-test-packs/run3-fixed-pack.zip
```

Expected: `wrote .../run3-fixed-pack.zip`

- [ ] **Step 2 (verify): Inspect the corrected pack**

Extract and confirm the acceptance criteria:
- `docs/context/07-known-gaps.md` is **non-empty** and lists the flagged items (AlignFlow = prototype/do-not-quantify; internship-metrics = verify; private-figure = do-not-quantify), NOT "None — every dimension was covered."
- `docs/context/06-security.md` contains genuine security content for a static site (no auth, contact-form validation, headers) and is **no longer dominated by positioning/"data analyst" framing**.

- [ ] **Step 3: Final review**

Dispatch a code-quality review of the slice's diff (Tasks 1–4). Confirm: no dead code, exactly one `return arts;` in `synthesize`, gap pass is parse-tolerant and never throws, and the existing public signatures (`synthesize(s, askLLM)`) are unchanged.

- [ ] **Step 4: Commit any review fixes, then the slice is done.**

```bash
git add -A
git commit -m "test(build-mode): verify slice 0 routing + gap-extraction against run-3 inputs"
```

---

## Self-Review

- **Spec coverage:** Tightened security framing (A) → Task 1; lane-guard (B) → Task 2; gap-extraction pass (C) → Tasks 3–4; known-gaps no longer "uncovered-moves-only" → Task 4; run-3 re-verification → Task 5. The spec's LLM content-mover is explicitly deferred (see Scope note) — a deliberate, documented deviation, not an omission.
- **Placeholder scan:** No TBDs; every code step shows complete code.
- **Type consistency:** `extractGaps(idea, answers, artifacts, askLLM)` signature is identical in `gaps.ts`, its tests, and the `synthesize` call site. `GapTag`/`GapItem` defined once and reused. `AskLLM` imported from `./interview` (matching `reconcile.ts`). `synthesize`'s public signature is unchanged, so `orchestrate.ts`, `handler.ts`, and `cli-build.ts` need no edits.
