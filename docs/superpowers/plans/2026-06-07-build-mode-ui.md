# Build Mode — UI + API Route (Plan 2c) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development / executing-plans. Checkbox steps.

**Goal:** Make Build Mode clickable — an interactive question-slides UI that produces a downloadable ZIP, backed by a stateless `/api/build` route.

**Architecture:** Stateless turn-based flow — the **client holds the running answers**; the server rebuilds `CoverageState` from `(idea, answers)` on each call (pure), so no server session storage. `/api/build` has two actions: `question` (→ next question or done) and `pack` (→ the ZIP). The route is a thin wrapper that injects the real Anthropic `AskLLM` and delegates to a tested `handleBuild` function. The UI is a client component state machine (idea → interview loop → building → download) styled to match VisionAir's existing session screens.

**Tech Stack:** Next.js App Router + React + TypeScript + Tailwind (existing) · the engine in `lib/build-mode/*`. Unit-test the pure pieces (`rebuildState`, `handleBuild`) with mocked LLMs; the route is thin; the page is verified by browser smoke-test (no unit test).

**Conventions:** Before coding the route + page, read `app/api/question/route.ts` (error handling, apiKey/env, response style) and `app/session/page.tsx` + `app/session/flow/*` (component + Tailwind conventions) and MATCH them.

---

## File structure (this plan)

- `lib/build-mode/session.ts` + `session.test.ts` — `rebuildState(idea, answers)` (create); export `UNKNOWN` from `orchestrate.ts` (modify)
- `lib/build-mode/handler.ts` + `handler.test.ts` — `handleBuild(req, llms)` (create)
- `app/api/build/route.ts` — thin POST route (create)
- `app/build/page.tsx` + `app/build/BuildClient.tsx` — the UI (create)

---

### Task 1: State rebuild (`session.ts`)

**Files:** Create `lib/build-mode/session.ts`, `session.test.ts`; modify `orchestrate.ts` (export `UNKNOWN`).

- [ ] **Step 1: Export `UNKNOWN` from `orchestrate.ts`** — change `const UNKNOWN =` to `export const UNKNOWN =` (so both orchestrate and session share one definition; no behavior change).

- [ ] **Step 2: Failing test**

```ts
import { describe, it, expect } from "vitest";
import { rebuildState } from "./session";
import { remainingMoves } from "./coverage-model";

describe("rebuildState", () => {
  it("replays answers into coverage state (covered vs unknown)", () => {
    const s = rebuildState("an app", [
      { move: "identity", question: "q", response: "a real answer" },
      { move: "security", question: "q", response: "not sure" },
    ]);
    expect(s.idea).toBe("an app");
    expect(s.statuses.identity).toBe("covered");
    expect(s.statuses.security).toBe("unknown");
    expect(remainingMoves(s)).not.toContain("identity");
    expect(remainingMoves(s)).not.toContain("security");
  });
});
```

- [ ] **Step 3: Run → fail.**

- [ ] **Step 4: Implement**

```ts
import { Answer, CoverageState } from "./types";
import { initCoverage, applyAnswer, markUnknown } from "./coverage-model";
import { UNKNOWN } from "./orchestrate";

export function rebuildState(idea: string, answers: Answer[]): CoverageState {
  let s = initCoverage(idea);
  for (const a of answers) {
    s = UNKNOWN.test(a.response) ? markUnknown(s, a.move) : applyAnswer(s, a);
  }
  return s;
}
```

- [ ] **Step 5: Run → pass; commit**

```bash
git add lib/build-mode/session.ts lib/build-mode/session.test.ts lib/build-mode/orchestrate.ts
git commit -m "feat(build-mode): stateless rebuildState (replay answers into coverage)"
```

---

### Task 2: Request handler (`handler.ts`)

**Files:** Create `lib/build-mode/handler.ts`, `handler.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect, vi } from "vitest";
import { handleBuild } from "./handler";

const llms = (q = "What is it?", s = "# x\ncontent") => ({
  questionLLM: vi.fn().mockResolvedValue(q),
  synthLLM: vi.fn().mockResolvedValue(s),
});

describe("handleBuild", () => {
  it("action 'question' returns the next question for a fresh idea", async () => {
    const res = await handleBuild({ action: "question", idea: "x", answers: [] }, llms());
    expect(res).toMatchObject({ kind: "question", done: false, move: "identity" });
  });
  it("action 'question' returns done when every move is covered", async () => {
    const answers = (["identity","non-negotiables","doctrine","contracts","core-logic","security"] as const)
      .map((move) => ({ move, question: "q", response: "a" }));
    const res = await handleBuild({ action: "question", idea: "x", answers }, llms());
    expect(res).toEqual({ kind: "question", done: true });
  });
  it("action 'pack' returns a non-empty zip", async () => {
    const res = await handleBuild({ action: "pack", idea: "x",
      answers: [{ move: "identity", question: "q", response: "a tool" }] }, llms());
    expect(res.kind).toBe("pack");
    if (res.kind === "pack") expect(res.zip.byteLength).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run → fail.**

- [ ] **Step 3: Implement**

```ts
import { Answer, DepthMove } from "./types";
import { AskLLM, nextQuestion } from "./interview";
import { rebuildState } from "./session";
import { synthesize } from "./synthesize";
import { reconcile } from "./reconcile";
import { assemble } from "./assemble";
import { pack } from "./pack";

export interface BuildRequest { action: "question" | "pack"; idea: string; answers: Answer[]; }
export type BuildResponse =
  | { kind: "question"; done: false; move: DepthMove; text: string }
  | { kind: "question"; done: true }
  | { kind: "pack"; zip: Uint8Array };

export async function handleBuild(
  req: BuildRequest,
  llms: { questionLLM: AskLLM; synthLLM: AskLLM },
): Promise<BuildResponse> {
  const state = rebuildState(req.idea, req.answers);
  if (req.action === "question") {
    const q = await nextQuestion(state, llms.questionLLM);
    return q ? { kind: "question", done: false, move: q.move, text: q.text } : { kind: "question", done: true };
  }
  let elicited = await synthesize(state, llms.synthLLM);
  elicited = await reconcile(elicited, llms.synthLLM);
  const zip = await pack(assemble(elicited));
  return { kind: "pack", zip };
}
```

- [ ] **Step 4: Run → pass; commit**

```bash
git add lib/build-mode/handler.ts lib/build-mode/handler.test.ts
git commit -m "feat(build-mode): handleBuild (stateless question/pack handler)"
```

---

### Task 3: API route (`app/api/build/route.ts`)

**Files:** Create `app/api/build/route.ts`. FIRST read `app/api/question/route.ts` and mirror its conventions (runtime export if any, apiKey/env handling, error shape, any rate-limit guard).

- [ ] **Step 1: Implement** (adapt imports/guards to match `app/api/question/route.ts`)

```ts
import { NextRequest } from "next/server";
import { handleBuild, BuildRequest } from "@/lib/build-mode/handler";
import { anthropicAskLLM } from "@/lib/build-mode/llm";

export async function POST(req: NextRequest) {
  let body: BuildRequest & { opus?: boolean };
  try { body = await req.json(); } catch { return Response.json({ error: "invalid json" }, { status: 400 }); }
  if (!body?.idea || (body.action !== "question" && body.action !== "pack")) {
    return Response.json({ error: "idea and action ('question'|'pack') required" }, { status: 400 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "server not configured" }, { status: 503 });
  }
  const questionLLM = anthropicAskLLM({ model: "claude-sonnet-4-6", maxTokens: 400 });
  const synthLLM = anthropicAskLLM({ model: body.opus ? "claude-opus-4-7" : "claude-sonnet-4-6", maxTokens: 2000 });
  try {
    const res = await handleBuild(body, { questionLLM, synthLLM });
    if (res.kind === "pack") {
      return new Response(Buffer.from(res.zip), {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": 'attachment; filename="build-mode-pack.zip"',
        },
      });
    }
    return Response.json(res);
  } catch (e) {
    return Response.json({ error: "build failed" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify it type-checks + builds.** Run: `npx tsc --noEmit` (and the project's build if quick). Expected: no errors in the new route. (No unit test — route correctness is carried by `handler.test.ts`; this is a thin adapter.)

- [ ] **Step 3: Commit**

```bash
git add app/api/build/route.ts
git commit -m "feat(build-mode): /api/build route (thin wrapper over handleBuild + live LLM)"
```

---

### Task 4: Build Mode UI (`app/build/`)

**Files:** Create `app/build/page.tsx` (server wrapper) + `app/build/BuildClient.tsx` (client state machine). Match Tailwind/visual conventions from `app/session/`.

- [ ] **Step 1: Server page**

```tsx
// app/build/page.tsx
import BuildClient from "./BuildClient";
export default function BuildPage() {
  return <BuildClient />;
}
```

- [ ] **Step 2: Client state machine** (`app/build/BuildClient.tsx`) — adjust classes to match `app/session` styling:

```tsx
"use client";
import { useState } from "react";

type Answer = { move: string; question: string; response: string };
type Phase = "idea" | "interview" | "building" | "done" | "error";

export default function BuildClient() {
  const [phase, setPhase] = useState<Phase>("idea");
  const [idea, setIdea] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [q, setQ] = useState<{ move: string; text: string } | null>(null);
  const [draft, setDraft] = useState("");
  const [url, setUrl] = useState<string | null>(null);
  const [err, setErr] = useState("");

  async function post(action: "question" | "pack", nextAnswers: Answer[]) {
    const r = await fetch("/api/build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, idea, answers: nextAnswers }),
    });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "request failed");
    return r;
  }

  async function advance(nextAnswers: Answer[]) {
    const r = await post("question", nextAnswers);
    const data = await r.json();
    if (data.done) {
      setPhase("building");
      const packR = await post("pack", nextAnswers);
      const blob = await packR.blob();
      setUrl(URL.createObjectURL(blob));
      setPhase("done");
    } else {
      setQ({ move: data.move, text: data.text });
      setDraft("");
      setPhase("interview");
    }
  }

  const guard = (fn: () => Promise<void>) => fn().catch((e) => { setErr(String(e.message || e)); setPhase("error"); });

  if (phase === "idea")
    return (
      <main className="mx-auto max-w-2xl p-8 space-y-4">
        <h1 className="text-2xl font-semibold">Build Mode — context pack for Claude Code</h1>
        <p className="text-sm opacity-70">Describe your full-stack app idea. A few focused questions, then download a ready-to-build context pack.</p>
        <textarea className="w-full h-32 rounded border p-3" value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="e.g. a habit tracker where…" />
        <button className="rounded bg-black px-4 py-2 text-white disabled:opacity-40" disabled={idea.trim().length < 8}
          onClick={() => guard(() => advance([]))}>Start</button>
      </main>
    );

  if (phase === "interview" && q)
    return (
      <main className="mx-auto max-w-2xl p-8 space-y-4">
        <div className="text-xs uppercase tracking-wide opacity-50">{q.move} · {answers.length + 1}</div>
        <p className="text-lg">{q.text}</p>
        <textarea className="w-full h-28 rounded border p-3" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Your answer — or 'not sure' to flag it as a gap" />
        <button className="rounded bg-black px-4 py-2 text-white disabled:opacity-40" disabled={draft.trim().length === 0}
          onClick={() => { const na = [...answers, { move: q.move, question: q.text, response: draft.trim() }]; setAnswers(na); guard(() => advance(na)); }}>
          Next
        </button>
      </main>
    );

  if (phase === "building")
    return <main className="mx-auto max-w-2xl p-8"><p className="text-lg">Engineering your context pack…</p></main>;

  if (phase === "done" && url)
    return (
      <main className="mx-auto max-w-2xl p-8 space-y-4">
        <h2 className="text-xl font-semibold">Your pack is ready.</h2>
        <a className="inline-block rounded bg-black px-4 py-2 text-white" href={url} download="build-mode-pack.zip">Download ZIP</a>
        <p className="text-sm opacity-70">Unzip into a fresh repo and open it in Claude Code — start with LAUNCH.md.</p>
      </main>
    );

  return <main className="mx-auto max-w-2xl p-8 space-y-3"><p className="text-red-600">Something went wrong: {err}</p><button className="underline" onClick={() => { setPhase("idea"); setErr(""); }}>Start over</button></main>;
}
```

- [ ] **Step 3: Type-check.** Run `npx tsc --noEmit` — no errors.

- [ ] **Step 4: Commit**

```bash
git add app/build/page.tsx app/build/BuildClient.tsx
git commit -m "feat(build-mode): Build Mode UI (idea -> question slides -> download)"
```

- [ ] **Step 5: Run full suite.** `npm test` (engine/handler tests still pass; UI has no unit tests by design).

---

## Self-review

- **Spec coverage:** stateless turn-based flow (rebuildState) ✅; `/api/build` question+pack (handler + route) ✅; interactive question-slides + download UI ✅; reuses the whole engine + presets ✅.
- **Placeholders:** none — full code each step; route/page conventions matched to `app/api/question` + `app/session`.
- **Type consistency:** `Answer`/`DepthMove` from `types.ts`; `BuildRequest`/`BuildResponse` from `handler.ts` (route imports `BuildRequest`); `UNKNOWN` single-sourced from `orchestrate.ts`.

## Acceptance (operator-attended)

With `ANTHROPIC_API_KEY` set: `npm run dev`, open `/build`, enter an idea, answer the questions (try "not sure" once), download the ZIP, confirm `LAUNCH.md` + context files + presets + populated `07-known-gaps.md`. First self-serve pack.

## Done after this

Build Mode is feature-complete (engine + presets + packager + live LLM + UI). Remaining is integration choices: merge `feat/build-mode-context-engine`, add a nav entry / landing CTA, and wire `ANTHROPIC_API_KEY` in Vercel (already set for the main app).
