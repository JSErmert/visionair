import { describe, it, expect } from "vitest";
import {
  levelBehaviour,
  defaultPlatformForPurpose,
  canProceed,
  type LevelBehaviour,
  type Purpose,
  type PersonaProfile,
} from "./persona";

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

// Suggested-default logic (Purpose -> Platform). A suggested default is NOT an
// assumption — the selector pre-fills it but leaves the other platforms one click
// away. The sin was locking the inference, not suggesting it.
describe("defaultPlatformForPurpose", () => {
  it("suggests Claude Code for Build (code wants a coding agent)", () => {
    expect(defaultPlatformForPurpose("build")).toBe("claude-code");
  });

  it("suggests Claude.ai for Operate, Automate, and Decide", () => {
    expect(defaultPlatformForPurpose("operate")).toBe("claude-ai");
    expect(defaultPlatformForPurpose("automate")).toBe("claude-ai");
    expect(defaultPlatformForPurpose("decide")).toBe("claude-ai");
  });

  it("suggests ChatGPT for Assist/Learn (most accessible personal helper)", () => {
    expect(defaultPlatformForPurpose("assist")).toBe("chatgpt");
  });

  it("returns a valid platform for every purpose (total function)", () => {
    const purposes: Purpose[] = [
      "build",
      "operate",
      "automate",
      "decide",
      "assist",
      "unsure",
    ];
    const valid = new Set(["claude-code", "claude-ai", "chatgpt"]);
    for (const p of purposes) {
      expect(valid.has(defaultPlatformForPurpose(p))).toBe(true);
    }
  });
});

// Slice 1 ships ONLY the Build x Claude Code cell end to end; every other cell is
// shown but "coming soon". canProceed is the single guard the selector reads.
describe("canProceed (Slice 1 = Build x Claude Code only)", () => {
  const at = (over: Partial<PersonaProfile> = {}): PersonaProfile => ({
    level: "beginner",
    purpose: "build",
    platform: "claude-code",
    ...over,
  });

  it("proceeds for Build x Claude Code at any level", () => {
    expect(canProceed(at({ level: "beginner" }))).toBe(true);
    expect(canProceed(at({ level: "intermediate" }))).toBe(true);
    expect(canProceed(at({ level: "expert" }))).toBe(true);
  });

  it("does not proceed when the purpose is not Build", () => {
    expect(canProceed(at({ purpose: "operate" }))).toBe(false);
    expect(canProceed(at({ purpose: "unsure" }))).toBe(false);
  });

  it("does not proceed when the platform is not Claude Code", () => {
    expect(canProceed(at({ platform: "claude-ai" }))).toBe(false);
    expect(canProceed(at({ platform: "chatgpt" }))).toBe(false);
  });
});
