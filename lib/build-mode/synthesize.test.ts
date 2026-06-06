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
    expect(arts.filter((a) => a.path !== "docs/context/07-known-gaps.md")).toHaveLength(0);
  });
});
