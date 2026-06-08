import { CoverageState, DepthMove, DEPTH_MOVES } from "./types";
import { remainingMoves } from "./coverage-model";

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

export async function nextQuestion(
  s: CoverageState,
  askLLM: AskLLM,
): Promise<NextQuestion | null> {
  const pending = remainingMoves(s);
  if (pending.length === 0) return null;
  const move = pending[0];
  const system = INTERVIEW_SYSTEM;
  const user =
    `THE IDEA: ${s.idea}\n` +
    `WHAT THEY'VE SHARED SO FAR:\n${s.answers.map((a) => `- ${a.response}`).join("\n") || "(nothing yet)"}\n\n` +
    `Draw out (conceptually, in your voice): ${MOVE_FRAMING[move]}\n\nReturn only the question.`;
  const text = (await askLLM(system, user)).trim();
  return { move, text };
}
