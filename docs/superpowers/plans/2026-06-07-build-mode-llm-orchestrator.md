# Build Mode — LLM Wiring + Orchestrator (Plan 2b) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Turn the tested-but-mocked engine into something that runs for real — a live Anthropic `AskLLM` adapter + a headless orchestrator that drives the full pipeline end-to-end and emits a ZIP.

**Architecture:** `llm.ts` adapts the Anthropic SDK into the engine's injected `AskLLM` type (client injectable → unit-testable without network; model selectable per the cost finding — Sonnet for questions, Sonnet-or-Opus for synthesis). `orchestrate.ts` runs `initCoverage → (loop: nextQuestion → answer → applyAnswer/markUnknown) → synthesize → reconcile → assemble → pack`, with the answer source injected (so it works for tests, a CLI, or later the UI). `cli-build.ts` is the real-run entry (reads idea + answers JSON, uses the real key, writes the ZIP) — its real execution is operator-attended (needs `ANTHROPIC_API_KEY`).

**Tech Stack:** TypeScript · Vitest · `@anthropic-ai/sdk` (reuse VisionAir's existing usage — check `app/api/question/route.ts` for the exact import + model IDs and match them). All unit tests mock the SDK; no network in tests.

**Scope refs:** engine (`lib/build-mode/*`), `2026-06-05-build-mode-design.md` §Data flow. Cost finding: Sonnet questions + Sonnet-or-Opus synthesis ≈ $0.10–1.00/run.

---

## File structure (this plan)

- `lib/build-mode/llm.ts` + `llm.test.ts` — `createAskLLM(client, model)` + `anthropicAskLLM(opts)` (create)
- `lib/build-mode/orchestrate.ts` + `orchestrate.test.ts` — `runBuildMode(opts) → { fileMap, zip }` (create)
- `lib/build-mode/cli-build.ts` + `cli-build.test.ts` — real-run entry + answer-from-map helper (create)
- `package.json` — confirm `@anthropic-ai/sdk` present (add if missing) + add `build-mode` script (modify)

---

### Task 1: Anthropic `AskLLM` adapter (`llm.ts`)

**Files:** Create `lib/build-mode/llm.ts`, `lib/build-mode/llm.test.ts`

- [ ] **Step 1: Confirm the SDK + model IDs.** Read `app/api/question/route.ts` and `app/api/blueprint/route.ts`: note the exact `@anthropic-ai/sdk` import, client construction, and the model IDs in use. Reuse them. If the SDK isn't a dependency, `npm install @anthropic-ai/sdk`.

- [ ] **Step 2: Failing test**

```ts
import { describe, it, expect, vi } from "vitest";
import { createAskLLM } from "./llm";

describe("createAskLLM", () => {
  it("calls the client with model/system/user and returns joined text", async () => {
    const create = vi.fn().mockResolvedValue({
      content: [{ type: "text", text: "hello " }, { type: "text", text: "world" }],
    });
    const client = { messages: { create } } as any;
    const ask = createAskLLM(client, "claude-sonnet-4-6", 800);
    const out = await ask("SYS", "USR");
    expect(out).toBe("hello world");
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "claude-sonnet-4-6",
        max_tokens: 800,
        system: "SYS",
        messages: [{ role: "user", content: "USR" }],
      }),
    );
  });
  it("ignores non-text content blocks", async () => {
    const client = { messages: { create: vi.fn().mockResolvedValue({
      content: [{ type: "tool_use" }, { type: "text", text: "ok" }] }) } } as any;
    expect(await createAskLLM(client, "m")("s", "u")).toBe("ok");
  });
});
```

- [ ] **Step 3: Run → fail.** `npx vitest run lib/build-mode/llm.test.ts`

- [ ] **Step 4: Implement**

```ts
import { AskLLM } from "./interview";

export interface AnthropicLike {
  messages: {
    create(args: {
      model: string; max_tokens: number; system: string;
      messages: { role: "user"; content: string }[];
    }): Promise<{ content: Array<{ type: string; text?: string }> }>;
  };
}

export function createAskLLM(client: AnthropicLike, model: string, maxTokens = 1500): AskLLM {
  return async (system, user) => {
    const msg = await client.messages.create({
      model, max_tokens: maxTokens, system,
      messages: [{ role: "user", content: user }],
    });
    return msg.content
      .filter((b) => b.type === "text")
      .map((b) => b.text ?? "")
      .join("")
      .trim();
  };
}

// Real client factory (operator-attended; needs ANTHROPIC_API_KEY). Reuse the SDK import
// pattern found in app/api/question/route.ts in Step 1.
export function anthropicAskLLM(opts: { apiKey?: string; model: string; maxTokens?: number }): AskLLM {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Anthropic = require("@anthropic-ai/sdk").default ?? require("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey: opts.apiKey ?? process.env.ANTHROPIC_API_KEY }) as unknown as AnthropicLike;
  return createAskLLM(client, opts.model, opts.maxTokens);
}
```

> If `app/api/question/route.ts` uses `import Anthropic from "@anthropic-ai/sdk"` + `new Anthropic(...)`, prefer a top-level `import` over `require` to match house style — adjust `anthropicAskLLM` accordingly. Keep `createAskLLM` (the tested core) unchanged.

- [ ] **Step 5: Run → pass; commit**

```bash
git add lib/build-mode/llm.ts lib/build-mode/llm.test.ts package.json package-lock.json
git commit -m "feat(build-mode): Anthropic AskLLM adapter (client-injected, model-selectable)"
```

---

### Task 2: Headless orchestrator (`orchestrate.ts`)

**Files:** Create `lib/build-mode/orchestrate.ts`, `lib/build-mode/orchestrate.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect, vi } from "vitest";
import { runBuildMode } from "./orchestrate";

describe("runBuildMode", () => {
  it("drives interview -> synth -> reconcile -> assemble -> pack and returns a zip", async () => {
    const questionLLM = vi.fn().mockResolvedValue("What is it?");
    const synthLLM = vi.fn().mockResolvedValue("# section\ngrounded content");
    const answer = vi.fn().mockResolvedValue("a concrete answer");
    const { fileMap, zip } = await runBuildMode({
      idea: "a budgeting app", answer, questionLLM, synthLLM,
    });
    expect(fileMap["LAUNCH.md"]).toContain("docs/context/00-identity.md");
    expect(fileMap["docs/context/00-identity.md"]).toContain("grounded content");
    expect(zip.byteLength).toBeGreaterThan(0);
    expect(answer).toHaveBeenCalled();
  });

  it("routes an 'I don't know' answer to known-gaps (markUnknown)", async () => {
    const questionLLM = vi.fn().mockResolvedValue("q?");
    const synthLLM = vi.fn().mockResolvedValue("content");
    // answer security as unknown, everything else concrete
    const answer = vi.fn(async (q: { move: string }) =>
      q.move === "security" ? "not sure" : "concrete");
    const { fileMap } = await runBuildMode({ idea: "x", answer, questionLLM, synthLLM });
    expect(fileMap["docs/context/07-known-gaps.md"]).toMatch(/security/i);
  });
});
```

- [ ] **Step 2: Run → fail.**

- [ ] **Step 3: Implement**

```ts
import { initCoverage, applyAnswer, markUnknown } from "./coverage-model";
import { nextQuestion, isComplete, AskLLM, NextQuestion } from "./interview";
import { synthesize } from "./synthesize";
import { reconcile } from "./reconcile";
import { assemble, FileMap } from "./assemble";
import { pack } from "./pack";

export type AnswerProvider = (q: NextQuestion) => Promise<string>;
const UNKNOWN = /^\s*(idk|i\s*don'?t\s*know|not\s*sure|unknown|skip|n\/?a)\s*$/i;

export interface BuildResult { fileMap: FileMap; zip: Uint8Array; }

export async function runBuildMode(opts: {
  idea: string;
  answer: AnswerProvider;
  questionLLM: AskLLM;
  synthLLM: AskLLM;
  maxQuestions?: number;
}): Promise<BuildResult> {
  let state = initCoverage(opts.idea);
  const cap = opts.maxQuestions ?? 12;
  let asked = 0;
  while (!isComplete(state) && asked < cap) {
    const q = await nextQuestion(state, opts.questionLLM);
    if (!q) break;
    asked++;
    const a = await opts.answer(q);
    state = UNKNOWN.test(a)
      ? markUnknown(state, q.move)
      : applyAnswer(state, { move: q.move, question: q.text, response: a });
  }
  let elicited = await synthesize(state, opts.synthLLM);
  elicited = await reconcile(elicited, opts.synthLLM);
  const fileMap = assemble(elicited);
  const zip = await pack(fileMap);
  return { fileMap, zip };
}
```

- [ ] **Step 4: Run → pass; commit**

```bash
git add lib/build-mode/orchestrate.ts lib/build-mode/orchestrate.test.ts
git commit -m "feat(build-mode): headless orchestrator (interview->...->zip, injected answer source)"
```

---

### Task 3: Real-run CLI (`cli-build.ts`)

**Files:** Create `lib/build-mode/cli-build.ts`, `lib/build-mode/cli-build.test.ts`; modify `package.json`.

The CLI reads a JSON file `{ "idea": string, "answers": { <move>: string } }`, builds an `AnswerProvider` from the map (fallback `"not sure"` → known-gaps), runs the orchestrator with the real Anthropic adapter, and writes the ZIP. The **unit test only covers the pure helper** (`answerFromMap`); the real run is operator-attended (needs `ANTHROPIC_API_KEY`).

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect } from "vitest";
import { answerFromMap } from "./cli-build";

describe("answerFromMap", () => {
  it("returns the mapped answer for a move, or 'not sure' when absent", async () => {
    const ap = answerFromMap({ identity: "a tool, not a toy" });
    expect(await ap({ move: "identity", text: "q" } as any)).toBe("a tool, not a toy");
    expect(await ap({ move: "security", text: "q" } as any)).toBe("not sure");
  });
});
```

- [ ] **Step 2: Run → fail.**

- [ ] **Step 3: Implement**

```ts
import { readFileSync, writeFileSync } from "fs";
import { runBuildMode, AnswerProvider } from "./orchestrate";
import { anthropicAskLLM } from "./llm";

export function answerFromMap(answers: Record<string, string>): AnswerProvider {
  return async (q) => answers[q.move] ?? "not sure";
}

// Operator-attended entry: `npm run build-mode -- --in idea.json --out pack.zip [--opus]`
export async function main(argv: string[]): Promise<void> {
  const arg = (k: string) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
  const inPath = arg("--in"); const outPath = arg("--out") ?? "build-mode-pack.zip";
  if (!inPath) throw new Error("usage: --in <idea.json> [--out pack.zip] [--opus]");
  const { idea, answers } = JSON.parse(readFileSync(inPath, "utf8"));
  const questionLLM = anthropicAskLLM({ model: "claude-sonnet-4-6", maxTokens: 400 });
  const synthLLM = anthropicAskLLM({
    model: argv.includes("--opus") ? "claude-opus-4-8" : "claude-sonnet-4-6",
    maxTokens: 2000,
  });
  const { zip } = await runBuildMode({ idea, answer: answerFromMap(answers), questionLLM, synthLLM });
  writeFileSync(outPath, zip);
  // eslint-disable-next-line no-console
  console.log(`wrote ${outPath}`);
}

if (require.main === module) {
  main(process.argv.slice(2)).catch((e) => { console.error(e); process.exit(1); });
}
```

> Use the model IDs confirmed in Task 1 Step 1 if they differ from the defaults above. Keep `claude-sonnet-4-6` for questions; synthesis defaults to Sonnet (cost) with `--opus` opt-in.

- [ ] **Step 4: Run → pass.**

- [ ] **Step 5: Add npm script + full suite + commit**

Add to `package.json` scripts: `"build-mode": "tsx lib/build-mode/cli-build.ts"` (use the repo's TS runner; if `tsx` is absent, install `-D tsx` or use the project's existing runner).

Run: `npm test` (all pass).

```bash
git add lib/build-mode/cli-build.ts lib/build-mode/cli-build.test.ts package.json package-lock.json
git commit -m "feat(build-mode): real-run CLI (idea.json -> live LLM -> pack.zip)"
```

---

## Self-review

- **Spec coverage:** live Anthropic adapter w/ selectable model (Task 1) ✅; end-to-end orchestrator interview→synth→reconcile→assemble→pack (Task 2) ✅; real-run entry + Sonnet/Opus toggle per cost finding (Task 3) ✅. The real LLM call is operator-attended (needs the key) — same honest pattern as ProjectVisionary acceptance.
- **Placeholders:** none — full code in every step; model IDs confirmed against the live app in Task 1.
- **Type consistency:** `AskLLM`/`NextQuestion` from `interview.ts`; `FileMap` from `assemble.ts`; `AnswerProvider` defined in `orchestrate.ts`, reused by `cli-build.ts`.

## Acceptance (operator-attended, after this plan)

Set `ANTHROPIC_API_KEY`, write a small `idea.json` ({idea, answers}), run `npm run build-mode -- --in idea.json --out pack.zip`, unzip, and eyeball: LAUNCH read-order, the elicited context files, presets present, known-gaps populated. First real pack from the live engine.

## Next

- **2c** — Build Mode UI (question-slides + download) + `/api/build` route (wraps `runBuildMode` with an interactive answer source).
