import { describe, it, expect, vi } from "vitest";
import { initCoverage, markUnknown, applyAnswer } from "./coverage-model";
import {
  nextQuestion,
  isComplete,
  levelDirectives,
  INTERVIEW_SYSTEM,
  MOVE_FRAMING,
} from "./interview";

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
  it("security framing steers toward real security, not self-representation", () => {
    expect(MOVE_FRAMING.security).toMatch(/data|secret|leak|abuse|protect|fail/i);
    expect(MOVE_FRAMING.security).not.toMatch(/represent|come across|honest|inflat/i);
  });
});

// The Level fork: the SAME move produces a structurally different prompt by level —
// not just a tonal nudge. Beginner is scaffolded (examples, plain words, recommend);
// expert is a terse gap-challenge (no examples, no hand-holding).
describe("levelDirectives (interview fork by Level)", () => {
  it("beginner scaffolds: plain language, example answers, recommend a default", () => {
    const d = levelDirectives("beginner");
    expect(`${d.system} ${d.user}`).toMatch(/example/i);
    expect(`${d.system} ${d.user}`).toMatch(/plain|simple word|everyday/i);
    expect(`${d.system} ${d.user}`).toMatch(/recommend|suggest a (default|starting)/i);
  });

  it("expert challenges gaps tersely and offers NO examples", () => {
    const d = levelDirectives("expert");
    expect(`${d.system} ${d.user}`).toMatch(/terse|brief|concise/i);
    expect(`${d.system} ${d.user}`).toMatch(/gap|missing|didn'?t (define|specify)|challenge/i);
    expect(`${d.system} ${d.user}`).not.toMatch(/example/i);
  });

  it("gives all three levels pairwise-distinct system directives", () => {
    const systems = (["beginner", "intermediate", "expert"] as const).map(
      (l) => levelDirectives(l).system
    );
    expect(new Set(systems).size).toBe(3);
  });
});

describe("nextQuestion threads the Level into the prompt", () => {
  it("sends beginner scaffolding to the LLM for the same move", async () => {
    const askLLM = vi.fn().mockResolvedValue("a gentle question");
    const s = initCoverage("a budgeting app");
    await nextQuestion(s, askLLM, "beginner");
    const system = askLLM.mock.calls[0][0] as string;
    const user = askLLM.mock.calls[0][1] as string;
    expect(`${system} ${user}`).toMatch(/example/i);
  });

  it("sends expert gap-challenge framing (terse, no examples) for the same move", async () => {
    const askLLM = vi.fn().mockResolvedValue("define the auth contract.");
    const s = initCoverage("a budgeting app");
    await nextQuestion(s, askLLM, "expert");
    const system = askLLM.mock.calls[0][0] as string;
    expect(system).toMatch(/terse|brief|concise/i);
    expect(system).not.toMatch(/example/i);
  });

  it("preserves the original prompt verbatim when no level is given (back-compat for /session)", async () => {
    const askLLM = vi.fn().mockResolvedValue("q");
    const s = initCoverage("x");
    await nextQuestion(s, askLLM);
    expect(askLLM.mock.calls[0][0]).toBe(INTERVIEW_SYSTEM);
  });
});
