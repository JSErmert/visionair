# Build Mode — Context Engine Core (Plan 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the validation-independent core of VisionAir Build Mode — a coverage-driven adaptive interview + a ground-or-flag synthesizer that turns a user's answers into the `[elicited]` context artifacts.

**Architecture:** A pure-logic module `lib/build-mode/` with the LLM injected as a function (so all logic is unit-testable without network). The coverage model encodes the operator's empirical depth-moves; the interview engine asks the next highest-value question until every move is covered-or-unknown; the synthesizer emits artifact contents with provenance tags, routing unknowns to known-gaps (never inventing). Presets, packaging, and UI are out of scope for this plan (Gate 1 + Plan 2).

**Tech Stack:** TypeScript · Next.js (existing) · zod (existing) · Vitest (added in Task 0). LLM access via an injected `AskLLM` function; the real Anthropic call is wired in Plan 2, mocked here.

**Scope reference:** `docs/superpowers/specs/2026-06-05-build-mode-design.md` + `docs/superpowers/specs/2026-06-05-build-mode-seed-pattern.md`.

---

## File structure (this plan)

- `vitest.config.ts` — test runner config (create)
- `package.json` — add `test` script + `vitest` devDep (modify)
- `lib/build-mode/types.ts` — shared types: `DepthMove`, `Provenance`, `Answer`, `CoverageState`, `ElicitedArtifact` (create)
- `lib/build-mode/coverage-model.ts` — depth-moves list + state helpers (create)
- `lib/build-mode/coverage-model.test.ts` (create)
- `lib/build-mode/interview.ts` — `nextQuestion` + `isComplete` (LLM injected) (create)
- `lib/build-mode/interview.test.ts` (create)
- `lib/build-mode/synthesize.ts` — `synthesize` (ground-or-flag, LLM injected) (create)
- `lib/build-mode/synthesize.test.ts` (create)

---

### Task 0: Stand up Vitest

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (scripts + devDependencies)
- Test: `lib/build-mode/smoke.test.ts` (temporary)

- [ ] **Step 1: Install Vitest**

Run: `npm install -D vitest`
Expected: `vitest` added to devDependencies, no errors.

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["lib/**/*.test.ts"],
    environment: "node",
  },
});
```

- [ ] **Step 3: Add the test script to `package.json`**

In the `"scripts"` block add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Write a temporary smoke test**

Create `lib/build-mode/smoke.test.ts`:

```ts
import { describe, it, expect } from "vitest";

describe("vitest setup", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run it**

Run: `npm test`
Expected: 1 passed.

- [ ] **Step 6: Delete the smoke test and commit**

Run: `rm lib/build-mode/smoke.test.ts`

```bash
git add vitest.config.ts package.json package-lock.json
git commit -m "chore: add Vitest test runner for build-mode module"
```

---

### Task 1: Shared types

**Files:**
- Create: `lib/build-mode/types.ts`

- [ ] **Step 1: Write the types**

```ts
// The operator's empirical depth-moves (the coverage dimensions).
export type DepthMove =
  | "identity"        // IS / IS-NOT + persona + value mechanism
  | "non-negotiables" // "what must never happen"
  | "doctrine"        // priority hierarchy / conflict resolution
  | "contracts"       // data + output schemas
  | "core-logic"      // core flow / features
  | "security";       // threat surface + sensitive data

export const DEPTH_MOVES: DepthMove[] = [
  "identity",
  "non-negotiables",
  "doctrine",
  "contracts",
  "core-logic",
  "security",
];

export type Provenance = "preset" | "elicited" | "open";

export interface Answer {
  move: DepthMove;
  question: string;
  response: string;
}

// "covered" = grounded answer captured; "unknown" = user could not answer (-> known-gaps).
export type MoveStatus = "pending" | "covered" | "unknown";

export interface CoverageState {
  idea: string;                               // the seed one-liner the user starts with
  statuses: Record<DepthMove, MoveStatus>;
  answers: Answer[];
}

export interface ElicitedArtifact {
  path: string;          // e.g. "docs/context/00-identity.md"
  provenance: Provenance;
  content: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/build-mode/types.ts
git commit -m "feat(build-mode): shared types for coverage + artifacts"
```

---

### Task 2: Coverage model

**Files:**
- Create: `lib/build-mode/coverage-model.ts`
- Test: `lib/build-mode/coverage-model.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { initCoverage, remainingMoves, applyAnswer, markUnknown } from "./coverage-model";

describe("coverage model", () => {
  it("starts with all moves pending", () => {
    const s = initCoverage("a budgeting app");
    expect(s.idea).toBe("a budgeting app");
    expect(remainingMoves(s).length).toBe(6);
  });

  it("marks a move covered when answered and removes it from remaining", () => {
    let s = initCoverage("x");
    s = applyAnswer(s, { move: "identity", question: "what is it?", response: "a tool for X" });
    expect(s.statuses.identity).toBe("covered");
    expect(remainingMoves(s)).not.toContain("identity");
  });

  it("marks a move unknown and removes it from remaining", () => {
    let s = initCoverage("x");
    s = markUnknown(s, "security");
    expect(s.statuses.security).toBe("unknown");
    expect(remainingMoves(s)).not.toContain("security");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/build-mode/coverage-model.test.ts`
Expected: FAIL — cannot find module `./coverage-model`.

- [ ] **Step 3: Write the implementation**

```ts
import { CoverageState, DepthMove, DEPTH_MOVES, Answer, MoveStatus } from "./types";

export function initCoverage(idea: string): CoverageState {
  const statuses = Object.fromEntries(
    DEPTH_MOVES.map((m) => [m, "pending" as MoveStatus]),
  ) as Record<DepthMove, MoveStatus>;
  return { idea, statuses, answers: [] };
}

export function remainingMoves(s: CoverageState): DepthMove[] {
  return DEPTH_MOVES.filter((m) => s.statuses[m] === "pending");
}

export function applyAnswer(s: CoverageState, a: Answer): CoverageState {
  return {
    ...s,
    statuses: { ...s.statuses, [a.move]: "covered" },
    answers: [...s.answers, a],
  };
}

export function markUnknown(s: CoverageState, move: DepthMove): CoverageState {
  return { ...s, statuses: { ...s.statuses, [move]: "unknown" } };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/build-mode/coverage-model.test.ts`
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add lib/build-mode/coverage-model.ts lib/build-mode/coverage-model.test.ts
git commit -m "feat(build-mode): coverage model with depth-move state tracking"
```

---

### Task 3: Interview engine (next question + completion)

**Files:**
- Create: `lib/build-mode/interview.ts`
- Test: `lib/build-mode/interview.test.ts`

The engine asks for the next pending move. The actual question wording is generated by an injected `AskLLM` (mocked in tests); the engine owns move-selection and the stop condition.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi } from "vitest";
import { initCoverage, markUnknown, applyAnswer } from "./coverage-model";
import { nextQuestion, isComplete } from "./interview";

describe("interview engine", () => {
  it("is not complete while moves are pending", () => {
    expect(isComplete(initCoverage("x"))).toBe(false);
  });

  it("is complete when every move is covered or unknown", () => {
    let s = initCoverage("x");
    for (const m of ["identity","non-negotiables","doctrine","contracts","core-logic"] as const) {
      s = applyAnswer(s, { move: m, question: "q", response: "r" });
    }
    s = markUnknown(s, "security");
    expect(isComplete(s)).toBe(true);
  });

  it("asks for the first pending move, using the injected LLM for wording", async () => {
    const askLLM = vi.fn().mockResolvedValue("One sentence: what is it, and what is it NOT?");
    const s = initCoverage("a budgeting app");
    const q = await nextQuestion(s, askLLM);
    expect(q?.move).toBe("identity");
    expect(q?.text).toContain("NOT");
    expect(askLLM).toHaveBeenCalledOnce();
  });

  it("returns null when complete", async () => {
    const askLLM = vi.fn();
    let s = initCoverage("x");
    for (const m of ["identity","non-negotiables","doctrine","contracts","core-logic","security"] as const) {
      s = applyAnswer(s, { move: m, question: "q", response: "r" });
    }
    expect(await nextQuestion(s, askLLM)).toBeNull();
    expect(askLLM).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/build-mode/interview.test.ts`
Expected: FAIL — cannot find module `./interview`.

- [ ] **Step 3: Write the implementation**

```ts
import { CoverageState, DepthMove } from "./types";
import { remainingMoves } from "./coverage-model";

export type AskLLM = (system: string, user: string) => Promise<string>;

export interface NextQuestion {
  move: DepthMove;
  text: string;
}

const MOVE_BRIEF: Record<DepthMove, string> = {
  "identity": "Pin the IDENTITY: what it IS, what it is NOT, who exactly it's for, and the core value mechanism.",
  "non-negotiables": "Surface NON-NEGOTIABLES: things that must never happen / hard constraints.",
  "doctrine": "Establish DOCTRINE: when two goals conflict, what wins (priority order)?",
  "contracts": "Lock CONTRACTS: the shape of the key data and the main output.",
  "core-logic": "Define CORE LOGIC: the central flow or features, in order.",
  "security": "Map SECURITY: sensitive data, auth needs, and the threat surface.",
};

export function isComplete(s: CoverageState): boolean {
  return remainingMoves(s).length === 0;
}

export async function nextQuestion(
  s: CoverageState,
  askLLM: AskLLM,
): Promise<NextQuestion | null> {
  const pending = remainingMoves(s);
  if (pending.length === 0) return null;
  const move = pending[0];
  const system =
    "You are VisionAir Build Mode. Ask ONE focused, high-information question that, " +
    "given prior answers, extracts the most context for the named build dimension. " +
    "Do not ask multiple questions. Do not invent details. If something is unknowable, " +
    "phrase so the user can answer 'not sure'.";
  const user =
    `IDEA: ${s.idea}\n` +
    `PRIOR ANSWERS:\n${s.answers.map((a) => `- [${a.move}] ${a.response}`).join("\n") || "(none)"}\n\n` +
    `DIMENSION TO COVER: ${move}\n${MOVE_BRIEF[move]}\n\nReturn only the question text.`;
  const text = (await askLLM(system, user)).trim();
  return { move, text };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/build-mode/interview.test.ts`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add lib/build-mode/interview.ts lib/build-mode/interview.test.ts
git commit -m "feat(build-mode): adaptive interview engine (move selection + stop condition)"
```

---

### Task 4: Synthesizer (ground-or-flag → elicited artifacts)

**Files:**
- Create: `lib/build-mode/synthesize.ts`
- Test: `lib/build-mode/synthesize.test.ts`

The synthesizer produces the `[elicited]` artifact contents. **Rule:** every unknown move becomes an entry in `docs/context/07-known-gaps.md`; the synthesizer NEVER fabricates content for an unknown move.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi } from "vitest";
import { initCoverage, applyAnswer, markUnknown } from "./coverage-model";
import { synthesize } from "./synthesize";

describe("synthesizer", () => {
  it("emits an identity artifact from a covered move and tags it elicited", async () => {
    const askLLM = vi.fn().mockResolvedValue("# Identity\nIS: a tool. IS-NOT: a toy.");
    let s = initCoverage("a budgeting app");
    s = applyAnswer(s, { move: "identity", question: "q", response: "budget tool, not a bank" });
    const arts = await synthesize(s, askLLM);
    const identity = arts.find((a) => a.path === "docs/context/00-identity.md");
    expect(identity?.provenance).toBe("elicited");
    expect(identity?.content).toContain("IS-NOT");
  });

  it("routes unknown moves into known-gaps and never calls the LLM for them", async () => {
    const askLLM = vi.fn().mockResolvedValue("should-not-be-used-for-unknowns");
    let s = initCoverage("x");
    s = markUnknown(s, "security");
    const arts = await synthesize(s, askLLM);
    const gaps = arts.find((a) => a.path === "docs/context/07-known-gaps.md");
    expect(gaps?.provenance).toBe("open");
    expect(gaps?.content.toLowerCase()).toContain("security");
    // the LLM is never asked to fabricate content for the unknown 'security' move
    const securityArt = arts.find((a) => a.path === "docs/context/06-security.md");
    expect(securityArt).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/build-mode/synthesize.test.ts`
Expected: FAIL — cannot find module `./synthesize`.

- [ ] **Step 3: Write the implementation**

```ts
import { CoverageState, DepthMove, ElicitedArtifact } from "./types";
import { AskLLM } from "./interview";

const MOVE_ARTIFACT: Record<DepthMove, string> = {
  "identity": "docs/context/00-identity.md",
  "non-negotiables": "docs/context/01-non-negotiables.md",
  "doctrine": "docs/context/02-doctrine.md",
  "contracts": "docs/context/04-contracts.md",
  "core-logic": "docs/context/03-spec.md",
  "security": "docs/context/06-security.md",
};

export async function synthesize(
  s: CoverageState,
  askLLM: AskLLM,
): Promise<ElicitedArtifact[]> {
  const arts: ElicitedArtifact[] = [];
  const gaps: DepthMove[] = [];

  for (const move of Object.keys(s.statuses) as DepthMove[]) {
    const status = s.statuses[move];
    if (status === "unknown" || status === "pending") {
      gaps.push(move);
      continue; // never fabricate content for an uncovered move
    }
    const answer = s.answers.find((a) => a.move === move);
    if (!answer) {
      gaps.push(move);
      continue;
    }
    const system =
      "You are VisionAir Build Mode synthesizer. Write a concise, high-depth context file " +
      "for the named dimension, grounded ONLY in the user's answer. Do not invent facts. " +
      "If the answer is thin, write only what it supports.";
    const user = `IDEA: ${s.idea}\nDIMENSION: ${move}\nUSER ANSWER: ${answer.response}\n\nReturn markdown.`;
    const content = (await askLLM(system, user)).trim();
    arts.push({ path: MOVE_ARTIFACT[move], provenance: "elicited", content });
  }

  arts.push({
    path: "docs/context/07-known-gaps.md",
    provenance: "open",
    content:
      "# Known gaps (resolve before / during build)\n\n" +
      (gaps.length
        ? gaps.map((g) => `- **${g}**: not yet specified — confirm before building on it.`).join("\n")
        : "_None — every dimension was covered._"),
  });

  return arts;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/build-mode/synthesize.test.ts`
Expected: 2 passed.

- [ ] **Step 5: Run the full suite**

Run: `npm test`
Expected: all build-mode tests pass.

- [ ] **Step 6: Commit**

```bash
git add lib/build-mode/synthesize.ts lib/build-mode/synthesize.test.ts
git commit -m "feat(build-mode): ground-or-flag synthesizer (elicited artifacts + known-gaps)"
```

---

## Self-review

- **Spec coverage:** coverage model = the depth-moves (identity→security) ✓; adaptive interview + stop condition ✓; ground-or-flag synthesizer + known-gaps anti-confab ✓; provenance tags ✓. Out of scope by design (Gate 1 / Plan 2): preset library, packaging/ZIP, LAUNCH.md/CLAUDE.md assembly, UI — these are listed as separate plans.
- **Placeholders:** none — every code step has full code and exact commands.
- **Type consistency:** `AskLLM`, `CoverageState`, `DepthMove`, `ElicitedArtifact`, `MoveStatus` used consistently across `types.ts` / `coverage-model.ts` / `interview.ts` / `synthesize.ts`. `nextQuestion` returns `{move,text}`; `synthesize` returns `ElicitedArtifact[]`.

## Next after this plan

- **Gate 1:** preset-corpus validation (triangulation) → `presets/` library. *(Not a TDD plan — run as a scoped multi-agent validation pass per the seed-pattern doc.)*
- **Plan 2:** packager (merge elicited + presets + methodology → ordered ZIP with LAUNCH.md/CLAUDE.md) + Build Mode UI (question-slides + download).
