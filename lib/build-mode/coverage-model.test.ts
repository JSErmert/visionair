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

  it("replaces the prior answer when the same move is answered twice", () => {
    let s = initCoverage("x");
    s = applyAnswer(s, { move: "identity", question: "q", response: "first" });
    s = applyAnswer(s, { move: "identity", question: "q", response: "second" });
    expect(s.answers.filter((a) => a.move === "identity")).toHaveLength(1);
    expect(s.answers[0].response).toBe("second");
  });
});
