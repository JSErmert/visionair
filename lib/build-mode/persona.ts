// v3 Pillar B — the persona fork. Three orthogonal axes, each tuning a different
// stage of the pipeline (see docs/superpowers/specs/2026-06-09-v3-persona-fork-design.md):
//   Level    -> the INTERVIEW (guidance / depth / voice)   [this file, Slice 1]
//   Purpose  -> the output CONTENT
//   Platform -> the output PACKAGING
// Axis values are goals, not identities ("Build", not "Developer").

export type Level = "beginner" | "intermediate" | "expert";
export type Purpose =
  | "build"
  | "operate"
  | "automate"
  | "decide"
  | "assist"
  | "unsure";
export type Platform = "claude-code" | "claude-ai" | "chatgpt";

// One object set by the selector, read by interview + synthesis + packaging.
// A future axis = a new field, never scattered conditionals.
export interface PersonaProfile {
  level: Level;
  purpose: Purpose;
  platform: Platform;
}

// Level is an AGENCY dial, not a skill dial: it tunes how much the interview
// guides vs challenges, never how much it respects the user.
export interface LevelBehaviour {
  depth: "guided" | "structured" | "gap-only";
  voice: "warm" | "neutral" | "terse";
  offerExamples: boolean | "optional";
  stance: "fill" | "organize" | "challenge";
  explainTerms: boolean;
}

const LEVEL_BEHAVIOUR: Record<Level, LevelBehaviour> = {
  beginner: {
    depth: "guided",
    voice: "warm",
    offerExamples: true,
    stance: "fill",
    explainTerms: true,
  },
  intermediate: {
    depth: "structured",
    voice: "neutral",
    offerExamples: "optional",
    stance: "organize",
    explainTerms: false,
  },
  expert: {
    depth: "gap-only",
    voice: "terse",
    offerExamples: false,
    stance: "challenge",
    explainTerms: false,
  },
};

export function levelBehaviour(level: Level): LevelBehaviour {
  return LEVEL_BEHAVIOUR[level];
}

// Suggested-default packaging per purpose. A suggestion, never a lock: the selector
// pre-fills this and leaves the other platforms one click away.
const PLATFORM_DEFAULT: Record<Purpose, Platform> = {
  build: "claude-code", // code wants a coding agent
  operate: "claude-ai", // a governed corpus = a Claude Project
  automate: "claude-ai", // most workflow-opt is business process
  decide: "claude-ai", // reasoning-heavy thinking partner
  assist: "chatgpt", // most accessible for a personal helper
  unsure: "claude-ai", // neutral until discovery picks a real purpose
};

export function defaultPlatformForPurpose(purpose: Purpose): Platform {
  return PLATFORM_DEFAULT[purpose];
}

// Slice 1 ships only the Build x Claude Code cell end to end; every other cell is
// "coming soon". Level never gates — all three levels proceed.
export function canProceed(profile: PersonaProfile): boolean {
  return profile.purpose === "build" && profile.platform === "claude-code";
}

// Persisted alongside the seed/progress so a refresh keeps the three picks.
export const PERSONA_KEY = "buildmode:persona";
