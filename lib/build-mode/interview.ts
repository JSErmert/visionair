import { CoverageState, DepthMove, DEPTH_MOVES } from "./types";
import { remainingMoves } from "./coverage-model";
import type { Level } from "./persona";

export type AskLLM = (system: string, user: string) => Promise<string>;

export interface NextQuestion {
  move: DepthMove;
  text: string;
}

export const INTERVIEW_SYSTEM =
  "You are VisionAir — a warm, perceptive guide helping someone bring an idea into focus. " +
  "Ask ONE question at a time, in a calm, second-person, permission-giving voice — never blunt, " +
  "never form-like, never technical jargon (no 'schema', 'API', 'enum'). Frame their input as " +
  "signal and truth you're helping them surface. Build on what they've already said — briefly echo " +
  "it back ('From what you shared about …') so it feels like a conversation, not a survey. Your " +
  "quiet goal this turn is to draw out the named dimension, but ask it conceptually, in plain human " +
  "language. Return ONLY the question.";

export const MOVE_FRAMING: Record<DepthMove, string> = {
  "identity": "Help them name what this really is — and, just as honestly, what it is NOT meant to be — plus who it's truly for and the core way it creates value.",
  "non-negotiables": "Draw out what has to stay true for this to still be itself — the things that would quietly break it if they slipped.",
  "doctrine": "Surface what should win when two good things pull against each other.",
  "contracts": "Get at what it hands back to someone when it's working, and what it needs to know to do that — in plain terms.",
  "core-logic": "Invite them to walk through it from start to finish — what actually happens.",
  "security": "Surface what's genuinely sensitive in how this is built and run — data that must stay protected, secrets or access that could leak, and the ways it could be abused or fail under bad input.",
};

export function isComplete(s: CoverageState): boolean {
  return DEPTH_MOVES.every((m) => s.statuses[m] !== "pending");
}

// The Level fork (Axis 1). Level is an AGENCY dial: it changes how much the engine
// guides vs challenges, never the coverage it pursues or the honesty rails. The SAME
// move is asked of everyone — only the framing shifts. Returns prompt fragments
// appended to the base system/user prompts; an absent level changes nothing (the
// /session flow keeps its exact original voice).
export function levelDirectives(level: Level): { system: string; user: string } {
  switch (level) {
    case "beginner":
      return {
        system:
          " THIS PERSON IS NEW. Use plain, everyday words and define any unavoidable term in simple language. " +
          "Be warm and permission-giving — make a blank page feel safe. Recommend a sensible default rather than " +
          "demanding they decide unaided. The engine owns the HOW; they own the WHAT and WHY.",
        user:
          "\n\nBecause they are new: offer two or three short example answers they can react to and adjust, " +
          "and gently suggest a starting default. Never make them feel they should already know the answer.",
      };
    case "intermediate":
      return {
        system:
          " THIS PERSON KNOWS THEIR GOAL. Be efficient and neutral: help them organize and structure their " +
          "thinking and quietly fill gaps they don't surface, without over-explaining or hand-holding.",
        user:
          "\n\nKeep it crisp: structure their thinking and fill the gap conceptually; offer an example only if the question is genuinely ambiguous.",
      };
    case "expert":
      return {
        system:
          " THIS PERSON IS FLUENT AND WANTS PRECISION. Drop the soft framing: be terse and direct. Skip anything " +
          "obvious. Name the specific gap and challenge it (e.g. 'you haven't defined X'). No sample answers, no " +
          "encouragement padding, no hand-holding — give them the control and prove the engine's worth fast.",
        user:
          "\n\nBe brief and technical. Surface the missing decision directly as a gap to close. Do not hand them ready-made answers.",
      };
  }
}

export async function nextQuestion(
  s: CoverageState,
  askLLM: AskLLM,
  level?: Level,
): Promise<NextQuestion | null> {
  const pending = remainingMoves(s);
  if (pending.length === 0) return null;
  const move = pending[0];
  const dir = level ? levelDirectives(level) : { system: "", user: "" };
  const system = INTERVIEW_SYSTEM + dir.system;
  const user =
    `THE IDEA: ${s.idea}\n` +
    `WHAT THEY'VE SHARED SO FAR:\n${s.answers.map((a) => `- ${a.response}`).join("\n") || "(nothing yet)"}\n\n` +
    `Draw out (conceptually, in your voice): ${MOVE_FRAMING[move]}${dir.user}\n\nReturn only the question.`;
  const text = (await askLLM(system, user)).trim();
  return { move, text };
}
