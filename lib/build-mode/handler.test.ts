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
  it("action 'pack' returns a blueprint and a non-empty zip", async () => {
    const res = await handleBuild({ action: "pack", idea: "x",
      answers: [{ move: "identity", question: "q", response: "a tool" }] }, llms());
    expect(res.kind).toBe("pack");
    if (res.kind === "pack") {
      expect(res.blueprint).toMatch(/what i'?m hearing/i);
      expect(res.zip.byteLength).toBeGreaterThan(0);
    }
  });

  // Slice 1 end-to-end: the persona Level set in the selector reaches the question LLM.
  it("threads the persona Level into the question prompt (beginner gets scaffolding)", async () => {
    const l = llms("a gentle question");
    await handleBuild({ action: "question", idea: "a budgeting app", answers: [], level: "beginner" }, l);
    const [system, user] = l.questionLLM.mock.calls[0];
    expect(`${system} ${user}`).toMatch(/example/i);
  });

  it("an expert Level produces a terse, no-examples question prompt for the same idea", async () => {
    const l = llms("define the contract.");
    await handleBuild({ action: "question", idea: "a budgeting app", answers: [], level: "expert" }, l);
    const system = l.questionLLM.mock.calls[0][0] as string;
    expect(system).toMatch(/terse|brief|concise/i);
    expect(system).not.toMatch(/example/i);
  });

  it("omitting Level keeps the original prompt (back-compat for the /session flow)", async () => {
    const l = llms();
    await handleBuild({ action: "question", idea: "x", answers: [] }, l);
    const system = l.questionLLM.mock.calls[0][0] as string;
    expect(system).not.toMatch(/THIS PERSON IS/i);
  });
});
