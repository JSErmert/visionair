import { describe, it, expect, vi } from "vitest";
import { initCoverage, markUnknown, applyAnswer } from "./coverage-model";
import { nextQuestion, isComplete, INTERVIEW_SYSTEM, MOVE_FRAMING } from "./interview";

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
});
