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
