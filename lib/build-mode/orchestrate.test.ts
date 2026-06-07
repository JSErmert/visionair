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
