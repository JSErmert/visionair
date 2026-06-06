import { CoverageState, DepthMove } from "./types";
import { remainingMoves } from "./coverage-model";

export type AskLLM = (system: string, user: string) => Promise<string>;

export interface NextQuestion {
  move: DepthMove;
  text: string;
}

const MOVE_BRIEF: Record<DepthMove, string> = {
  "identity": "Pin the IDENTITY: what it IS, what it is NOT, who exactly it's for, and the core value mechanism.",
  "non-negotiables": "Surface NON-NEGOTIABLES: things that must never happen / hard constraints.",
  "doctrine": "Establish DOCTRINE: when two goals conflict, what wins (priority order)?",
  "contracts": "Lock CONTRACTS: the shape of the key data and the main output.",
  "core-logic": "Define CORE LOGIC: the central flow or features, in order.",
  "security": "Map SECURITY: sensitive data, auth needs, and the threat surface.",
};

export function isComplete(s: CoverageState): boolean {
  return remainingMoves(s).length === 0;
}

export async function nextQuestion(
  s: CoverageState,
  askLLM: AskLLM,
): Promise<NextQuestion | null> {
  const pending = remainingMoves(s);
  if (pending.length === 0) return null;
  const move = pending[0];
  const system =
    "You are VisionAir Build Mode. Ask ONE focused, high-information question that, " +
    "given prior answers, extracts the most context for the named build dimension. " +
    "Do not ask multiple questions. Do not invent details. If something is unknowable, " +
    "phrase so the user can answer 'not sure'.";
  const user =
    `IDEA: ${s.idea}\n` +
    `PRIOR ANSWERS:\n${s.answers.map((a) => `- [${a.move}] ${a.response}`).join("\n") || "(none)"}\n\n` +
    `DIMENSION TO COVER: ${move}\n${MOVE_BRIEF[move]}\n\nReturn only the question text.`;
  const text = (await askLLM(system, user)).trim();
  return { move, text };
}
