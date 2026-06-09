# Build Mode — Unified Dynamic Session (OG voice + blueprint-before-pack) Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development / executing-plans. Checkbox steps.

**Goal:** Turn `/build` into *the* VisionAir session: one dynamic interview that feels like the OG `/session` (warm, conceptual, reflective) but is powered by the depth-move engine, ending in a **blueprint review** then the **pack download** — no double-questioning, no manual JSON.

**Architecture:** Re-voice the existing question generator (engine prompt only — no logic change) to channel the OG session voice + echo prior answers; add a pure `renderBlueprint(elicited)` that produces an OG-voiced human summary from the *same* synthesized artifacts; have `/api/build` `pack` return **both** the blueprint and the zip in one pipeline run; add a blueprint review screen in `BuildClient` before the download, plus OG-voice intro copy.

**Tech Stack:** TypeScript · Vitest · Next.js. Engine in `lib/build-mode/*`. No new LLM calls beyond the existing pipeline (blueprint is rendered from already-synthesized artifacts — free).

**OG voice (extracted from `app/session/flow/*`):** warm, second-person, permission-giving ("you do not need a title first"); frames input as *signal/truth* ("the real pattern in how you create value," "the truth you already carry"); **conceptual, never technical**; reflective ("Here's what I'm hearing so far").

---

## File structure (this plan)

- `lib/build-mode/interview.ts` (+test) — re-voice: `INTERVIEW_SYSTEM` + `MOVE_FRAMING` (modify)
- `lib/build-mode/blueprint.ts` (+test) — `renderBlueprint(elicited)` (create)
- `lib/build-mode/handler.ts` (+test) — `pack` returns `{ blueprint, zip }` (modify)
- `app/api/build/route.ts` — return `{ blueprint, zipBase64 }` for pack (modify)
- `app/build/BuildClient.tsx` — blueprint review screen + OG intro + base64 download (modify)

---

### Task 1: Re-voice the question generator (`interview.ts`)

Engine prompt only — `nextQuestion`'s logic (move selection, stop condition) is unchanged.

**Files:** Modify `lib/build-mode/interview.ts`, `interview.test.ts`

- [ ] **Step 1: Failing test** (append to `interview.test.ts`)

```ts
import { INTERVIEW_SYSTEM, MOVE_FRAMING } from "./interview";

describe("OG-voiced question generation", () => {
  it("system prompt encodes the OG voice (one question, plain/non-technical, builds on prior)", () => {
    expect(INTERVIEW_SYSTEM).toMatch(/one question/i);
    expect(INTERVIEW_SYSTEM).toMatch(/plain|human|conceptual|not.*technical|no jargon/i);
    expect(INTERVIEW_SYSTEM).toMatch(/build on|prior|already (said|shared)/i);
  });
  it("each move has a conceptual framing; identity draws out IS-NOT", () => {
    expect(MOVE_FRAMING.identity).toMatch(/not/i);
    expect(MOVE_FRAMING["non-negotiables"]).toMatch(/stay true|break/i);
    // not the old blunt wording
    expect(MOVE_FRAMING.contracts).not.toMatch(/schema/i);
  });
});
```

- [ ] **Step 2: Run → fail** (`INTERVIEW_SYSTEM`/`MOVE_FRAMING` not exported). `npx vitest run lib/build-mode/interview.test.ts`

- [ ] **Step 3: Implement** — replace the existing `MOVE_BRIEF` const + the inline `system` string in `nextQuestion` with these exports, and reference them:

```ts
export const INTERVIEW_SYSTEM =
  "You are VisionAir — a warm, perceptive guide helping someone bring an idea into focus. " +
  "Ask ONE question at a time, in a calm, second-person, permission-giving voice — never blunt, " +
  "never form-like, never technical jargon (no 'schema', 'API', 'enum'). Frame their input as " +
  "signal and truth you're helping them surface. Build on what they've already said — briefly echo " +
  "it back ('From what you shared about …') so it feels like a conversation, not a survey. Your " +
  "quiet goal this turn is to draw out the named dimension, but ask it conceptually, in plain human " +
  "language. Return ONLY the question.";

export const MOVE_FRAMING: Record<DepthMove, string> = {
  "identity": "Help them name what this really is — and, just as honestly, what it is NOT meant to be — plus who it's truly for and the core way it creates value.",
  "non-negotiables": "Draw out what has to stay true for this to still be itself — the things that would quietly break it if they slipped.",
  "doctrine": "Surface what should win when two good things pull against each other.",
  "contracts": "Get at what it hands back to someone when it's working, and what it needs to know to do that — in plain terms.",
  "core-logic": "Invite them to walk through it from start to finish — what actually happens.",
  "security": "Gently surface what's sensitive here, and what they'd never want to go wrong.",
};
```

Update `nextQuestion` to use `INTERVIEW_SYSTEM` as the system and build the user message with the idea, a brief echo of prior answers, and `MOVE_FRAMING[move]` (keep the existing prior-answers inclusion):

```ts
  const system = INTERVIEW_SYSTEM;
  const user =
    `THE IDEA: ${s.idea}\n` +
    `WHAT THEY'VE SHARED SO FAR:\n${s.answers.map((a) => `- ${a.response}`).join("\n") || "(nothing yet)"}\n\n` +
    `Draw out (conceptually, in your voice): ${MOVE_FRAMING[move]}\n\nReturn only the question.`;
```

- [ ] **Step 4: Run → pass.** `npx vitest run lib/build-mode/interview.test.ts` (existing tests still pass — selection/stop logic unchanged.)

- [ ] **Step 5: Commit**

```bash
git add lib/build-mode/interview.ts lib/build-mode/interview.test.ts
git commit -m "feat(build-mode): re-voice interview in OG session tone (conceptual, reflective, non-technical)"
```

---

### Task 2: Blueprint render (`blueprint.ts`)

**Files:** Create `lib/build-mode/blueprint.ts`, `blueprint.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect } from "vitest";
import { renderBlueprint } from "./blueprint";
import { ElicitedArtifact } from "./types";

const arts: ElicitedArtifact[] = [
  { path: "docs/context/00-identity.md", provenance: "elicited", content: "IS: a budgeting tool" },
  { path: "docs/context/03-spec.md", provenance: "elicited", content: "Home, then a tracker view" },
  { path: "docs/context/02-doctrine.md", provenance: "elicited", content: "clarity beats features" },
  { path: "docs/context/07-known-gaps.md", provenance: "open", content: "# Known gaps\n- rate limits" },
];

describe("renderBlueprint", () => {
  it("produces an OG-voiced summary from the synthesized artifacts", () => {
    const bp = renderBlueprint(arts);
    expect(bp).toMatch(/what i'?m hearing/i);
    expect(bp).toContain("a budgeting tool");
    expect(bp).toContain("Home, then a tracker view");
    expect(bp).toMatch(/still open/i);
    expect(bp).toContain("rate limits");
    expect(bp).toMatch(/truth you already carry/i);
  });
});
```

- [ ] **Step 2: Run → fail.**

- [ ] **Step 3: Implement**

```ts
import { ElicitedArtifact } from "./types";

const pick = (a: ElicitedArtifact[], path: string) =>
  (a.find((x) => x.path === path)?.content ?? "").trim();

export function renderBlueprint(elicited: ElicitedArtifact[]): string {
  const identity = pick(elicited, "docs/context/00-identity.md");
  const plan = pick(elicited, "docs/context/03-spec.md");
  const doctrine = pick(elicited, "docs/context/02-doctrine.md");
  const gaps = pick(elicited, "docs/context/07-known-gaps.md");
  return [
    "# Here's what I'm hearing",
    "",
    identity || "_(idea still forming)_",
    "",
    "## What we'd build",
    "",
    plan || "_(to be shaped)_",
    "",
    "## The calls we're making",
    "",
    doctrine || "_(no explicit priorities yet)_",
    "",
    "## Still open — worth deciding before you build",
    "",
    gaps || "_Nothing flagged._",
    "",
    "_This blueprint is the truth you already carry. The build pack below is what to do with it._",
  ].join("\n");
}
```

- [ ] **Step 4: Run → pass; commit**

```bash
git add lib/build-mode/blueprint.ts lib/build-mode/blueprint.test.ts
git commit -m "feat(build-mode): renderBlueprint — OG-voiced summary from synthesized context"
```

---

### Task 3: `pack` returns blueprint + zip (`handler.ts` + `route.ts`)

**Files:** Modify `lib/build-mode/handler.ts`, `handler.test.ts`, `app/api/build/route.ts`

- [ ] **Step 1: Update the failing test** — change the existing `pack` test in `handler.test.ts` to also assert a blueprint:

```ts
  it("action 'pack' returns a blueprint and a non-empty zip", async () => {
    const res = await handleBuild({ action: "pack", idea: "x",
      answers: [{ move: "identity", question: "q", response: "a tool" }] }, llms());
    expect(res.kind).toBe("pack");
    if (res.kind === "pack") {
      expect(res.blueprint).toMatch(/what i'?m hearing/i);
      expect(res.zip.byteLength).toBeGreaterThan(0);
    }
  });
```

- [ ] **Step 2: Run → fail** (`blueprint` not on the pack response).

- [ ] **Step 3: Implement** — in `handler.ts`, extend the pack branch + type:

```ts
// in BuildResponse union, change the pack member to:
  | { kind: "pack"; blueprint: string; zip: Uint8Array };
```
```ts
// in handleBuild, the pack branch:
  let elicited = await synthesize(state, llms.synthLLM);
  elicited = await reconcile(elicited, llms.synthLLM);
  const blueprint = renderBlueprint(elicited);
  const zip = await pack(assemble(elicited));
  return { kind: "pack", blueprint, zip };
```
Add `import { renderBlueprint } from "./blueprint";`.

Then in `app/api/build/route.ts`, change the pack response from raw bytes to JSON with the blueprint + base64 zip:

```ts
    if (res.kind === "pack") {
      return Response.json({
        kind: "pack",
        blueprint: res.blueprint,
        zipBase64: Buffer.from(res.zip).toString("base64"),
      });
    }
```

- [ ] **Step 4: Run → pass** (`npm test`); **`npx tsc --noEmit`** clean.

- [ ] **Step 5: Commit**

```bash
git add lib/build-mode/handler.ts lib/build-mode/handler.test.ts app/api/build/route.ts
git commit -m "feat(build-mode): /api/build pack returns blueprint + base64 zip (one run)"
```

---

### Task 4: Blueprint review screen + OG intro (`BuildClient.tsx`)

**Files:** Modify `app/build/BuildClient.tsx`. Match Tailwind conventions from `app/session/flow/*`.

- [ ] **Step 1: Implement the flow change.** Update the phase machine to: `idea → interview → building → blueprint → done`. Key changes:
  - **OG-voice intro** on the idea screen (replace the blunt heading), e.g. heading "Let's begin with what feels real." + sub "A few questions, in your words — then a blueprint and a ready-to-build pack."
  - In the pack step, the response is now JSON `{ blueprint, zipBase64 }` (not a blob). Parse it: set `blueprint` state, decode the base64 zip to a Blob, `URL.createObjectURL`, advance to a **`blueprint` phase** that renders the blueprint markdown (a simple `<pre className="whitespace-pre-wrap">` or minimal markdown styling) with a **"Download your build pack →"** button; clicking it (or auto-showing the link) downloads the zip.

Reference patch for the pack fetch + new phases (adapt to the file's existing structure):

```tsx
// after interview returns done:
const r = await fetch("/api/build", {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action: "pack", idea, answers: nextAnswers }),
});
if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "build failed");
const data = await r.json(); // { blueprint, zipBase64 }
const bytes = Uint8Array.from(atob(data.zipBase64), (c) => c.charCodeAt(0));
const blob = new Blob([bytes], { type: "application/zip" });
setBlueprint(data.blueprint);
setUrl(URL.createObjectURL(blob));
setPhase("blueprint");
```

```tsx
// new 'blueprint' phase render (before the old 'done'):
if (phase === "blueprint" && url)
  return (
    <main className="mx-auto max-w-2xl p-8 space-y-5">
      <pre className="whitespace-pre-wrap text-sm leading-relaxed">{blueprint}</pre>
      <a className="inline-block rounded bg-black px-4 py-2 text-white" href={url} download="build-mode-pack.zip">
        Download your build pack →
      </a>
      <p className="text-sm opacity-70">Unzip into a fresh repo and open it in Claude Code — start with LAUNCH.md.</p>
    </main>
  );
```

Add the `blueprint` state: `const [blueprint, setBlueprint] = useState("")`.

- [ ] **Step 2: Type-check.** `npx tsc --noEmit` — clean.

- [ ] **Step 3: Commit**

```bash
git add app/build/BuildClient.tsx
git commit -m "feat(build-mode): blueprint review screen + OG-voice intro before pack download"
```

- [ ] **Step 4: Full suite.** `npm test` (engine/handler/blueprint tests pass; UI untested by design).

---

## Self-review

- **Spec coverage:** OG-voiced dynamic questions (Task 1) ✅; blueprint rendered from the same synthesized context, no extra LLM call (Task 2) ✅; one pipeline run returns blueprint + pack (Task 3) ✅; blueprint review screen before download + OG intro (Task 4) ✅. One dynamic session → blueprint → pack, no double-questioning, no manual JSON.
- **Placeholders:** none — full code each step; voice grounded in the real OG copy.
- **Type consistency:** `BuildResponse.pack` now carries `blueprint`; route + client read `{ blueprint, zipBase64 }`; `renderBlueprint` imported by `handler.ts`; `INTERVIEW_SYSTEM`/`MOVE_FRAMING` exported from `interview.ts`.

## Acceptance (operator-attended)

With the dev server on `:3456` (hot-reloads): open `/build`, enter an idea, answer the now-OG-voiced questions, see the **blueprint** ("Here's what I'm hearing… / Still open…"), then download the pack. Confirm the questions feel conversational (not form-like) and adapt to prior answers.

## Deferred (not this plan)

Full routing so `/build` is the site's front door (nav + root CTA) — left out because it touches the pending `next.config.mjs` landing decision. `/session` stays parked.
