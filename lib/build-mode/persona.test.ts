import { describe, it, expect } from "vitest";
import { levelBehaviour, type LevelBehaviour } from "./persona";

// The agency-dial table from the v3 Pillar B spec
// (docs/superpowers/specs/2026-06-09-v3-persona-fork-design.md). Level tunes the
// INTERVIEW only. Each level derives a distinct behaviour object; the differences
// must be structural (depth / examples / stance), not just tone.
describe("levelBehaviour", () => {
  it("derives the beginner dial: guided, warm, examples on, fill, explain terms", () => {
    expect(levelBehaviour("beginner")).toEqual<LevelBehaviour>({
      depth: "guided",
      voice: "warm",
      offerExamples: true,
      stance: "fill",
      explainTerms: true,
    });
  });

  it("derives the intermediate dial: structured, neutral, optional examples, organize", () => {
    expect(levelBehaviour("intermediate")).toEqual<LevelBehaviour>({
      depth: "structured",
      voice: "neutral",
      offerExamples: "optional",
      stance: "organize",
      explainTerms: false,
    });
  });

  it("derives the expert dial: gap-only, terse, no examples, challenge", () => {
    expect(levelBehaviour("expert")).toEqual<LevelBehaviour>({
      depth: "gap-only",
      voice: "terse",
      offerExamples: false,
      stance: "challenge",
      explainTerms: false,
    });
  });

  it("gives each level a structurally distinct stance (not just tone)", () => {
    const stances = (["beginner", "intermediate", "expert"] as const).map(
      (l) => levelBehaviour(l).stance
    );
    expect(new Set(stances).size).toBe(3);
  });
});
