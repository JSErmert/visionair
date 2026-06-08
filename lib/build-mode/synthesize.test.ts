import { describe, it, expect, vi } from "vitest";
import { initCoverage, applyAnswer, markUnknown } from "./coverage-model";
import { synthesize, SYNTH_SYSTEM } from "./synthesize";

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

describe("deviation-flagging", () => {
  it("the synthesis system prompt instructs the model to flag deviations", () => {
    expect(SYNTH_SYSTEM).toContain("DEVIATION from elicited answer");
  });

  it("the synthesis system prompt instructs the model to stay in its dimension's lane", () => {
    expect(SYNTH_SYSTEM).toMatch(/only.*(this|the named) dimension|stay in|belongs to (a )?different/i);
  });

  it("preserves a DEVIATION note returned by the model (does not strip it)", async () => {
    const askLLM = vi.fn().mockResolvedValue(
      "# Identity\nIS: a tool.\n> DEVIATION from elicited answer — rationale: chose safer default.",
    );
    let s = initCoverage("x");
    s = applyAnswer(s, { move: "identity", question: "q", response: "..." });
    const arts = await synthesize(s, askLLM);
    const identity = arts.find((a) => a.path === "docs/context/00-identity.md");
    expect(identity?.content).toContain("DEVIATION from elicited answer");
  });
});

describe("known-gaps incorporates extracted gap items", () => {
  it("surfaces flagged items returned by the gap pass into known-gaps", async () => {
    // Branch the mock: the gap pass uses GAPS_SYSTEM ("OPEN ITEMS"); else synthesis.
    const askLLM = vi.fn(async (system: string) => {
      if (system.includes("OPEN ITEMS")) {
        return '[{"tag":"do-not-quantify","text":"AlignFlow is a prototype, not production"}]';
      }
      return "# File\nsome synthesized content";
    });
    let s = initCoverage("a portfolio site");
    s = applyAnswer(s, {
      move: "non-negotiables",
      question: "q",
      response: "do not call AlignFlow a production engine",
    });
    const arts = await synthesize(s, askLLM);
    const gaps = arts.find((a) => a.path === "docs/context/07-known-gaps.md");
    expect(gaps?.content).toContain("AlignFlow is a prototype");
    expect(gaps?.content).toContain("[do-not-quantify]");
  });

  it("still reports None when no moves are missing and no items are flagged", async () => {
    const askLLM = vi.fn(async (system: string) =>
      system.includes("OPEN ITEMS") ? "[]" : "# File\ncontent",
    );
    let s = initCoverage("x");
    for (const m of ["identity","non-negotiables","doctrine","contracts","core-logic","security"] as const) {
      s = applyAnswer(s, { move: m, question: "q", response: "r" });
    }
    const arts = await synthesize(s, askLLM);
    const gaps = arts.find((a) => a.path === "docs/context/07-known-gaps.md");
    expect(gaps?.content).toContain("None — every dimension was covered");
  });
});
