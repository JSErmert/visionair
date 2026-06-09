import { describe, it, expect, vi } from "vitest";
import { extractGaps, GAPS_SYSTEM } from "./gaps";
import { Answer, ElicitedArtifact } from "./types";

const answers: Answer[] = [
  {
    move: "non-negotiables",
    question: "q",
    response:
      "AlignFlow is a prototype, do not call it a production engine; verify internship metrics before publish.",
  },
];
const arts: ElicitedArtifact[] = [
  { path: "docs/context/01-non-negotiables.md", provenance: "elicited", content: "Prototype, not production." },
];

describe("gap-extraction pass", () => {
  it("returns parsed gap items from a JSON array", async () => {
    const askLLM = vi.fn().mockResolvedValue(
      '[{"tag":"do-not-quantify","text":"AlignFlow is a prototype, not a production engine"},{"tag":"verify","text":"confirm internship metrics before publish"}]',
    );
    const out = await extractGaps("an idea", answers, arts, askLLM);
    expect(out).toHaveLength(2);
    expect(out[0].tag).toBe("do-not-quantify");
    expect(out[1].text).toContain("internship metrics");
  });

  it("strips a ```json fence and a leading BOM", async () => {
    const askLLM = vi.fn().mockResolvedValue(
      "﻿```json\n" + JSON.stringify([{ tag: "uncertain", text: "fenced + bom item" }]) + "\n```",
    );
    const out = await extractGaps("x", answers, arts, askLLM);
    expect(out).toHaveLength(1);
    expect(out[0].text).toBe("fenced + bom item");
  });

  it("drops items with an unknown tag", async () => {
    const askLLM = vi.fn().mockResolvedValue(
      '[{"tag":"verify","text":"keep me"},{"tag":"bogus","text":"drop me"}]',
    );
    const out = await extractGaps("x", answers, arts, askLLM);
    expect(out).toHaveLength(1);
    expect(out[0].text).toBe("keep me");
  });

  it("returns [] on malformed JSON without throwing", async () => {
    const askLLM = vi.fn().mockResolvedValue("not json {{{");
    const out = await extractGaps("x", answers, arts, askLLM);
    expect(out).toEqual([]);
  });

  it("returns [] and never calls the LLM when there are no answers", async () => {
    const askLLM = vi.fn();
    const out = await extractGaps("x", [], arts, askLLM);
    expect(out).toEqual([]);
    expect(askLLM).not.toHaveBeenCalled();
  });

  it("system prompt names the allowed tags", () => {
    expect(GAPS_SYSTEM).toContain("verify");
    expect(GAPS_SYSTEM).toContain("do-not-quantify");
  });
});
