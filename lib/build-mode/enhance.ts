import { AskLLM } from "./interview";
import { Answer, CoverageState, DepthMove, DEPTH_MOVES, MoveStatus } from "./types";
import { UNKNOWN } from "./orchestrate";
import { synthesize } from "./synthesize";
import { reconcile } from "./reconcile";
import { assemble, FileMap } from "./assemble";
import { renderBlueprint } from "./blueprint";

export interface EnhanceTarget {
  move: DepthMove;
  question: string;
  rationale: string;
}

export const AUDIT_SYSTEM =
  "You audit a Claude Code context pack and find the HIGHEST-LEVERAGE follow-up questions " +
  "that would most improve it before a build. Prioritize in this order: (1) resolving the " +
  "open items in 07-known-gaps.md (verify / do-not-quantify / uncertain / decision-needed); " +
  "(2) deepening dimensions that are thin, vague, or under-specified. For each, choose the " +
  "ONE dimension it belongs to. Return ONLY a JSON array, ordered most-valuable first, of " +
  '{"move": one of "identity"|"non-negotiables"|"doctrine"|"contracts"|"core-logic"|"security", ' +
  '"question": string, "rationale": string}. Questions must be warm, second-person, conceptual, ' +
  "one idea at a time, and NON-technical in voice (no jargon like schema/API/enum) — the same " +
  "calm guiding tone as the original interview. Return at most 8. Empty array if the pack is " +
  "already strong with nothing worth asking.";

function stripFences(raw: string): string {
  return raw
    .replace(/^﻿/, "")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/, "")
    .trim();
}

export async function auditPack(files: FileMap, askLLM: AskLLM): Promise<EnhanceTarget[]> {
  const context = Object.entries(files)
    .filter(([p]) => p.startsWith("docs/context/"))
    .map(([p, c]) => `=== ${p} ===\n${c}`)
    .join("\n\n");
  if (!context) return [];
  try {
    const parsed = JSON.parse(stripFences(await askLLM(AUDIT_SYSTEM, context)));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (x: unknown): x is EnhanceTarget =>
          !!x &&
          typeof (x as EnhanceTarget).question === "string" &&
          (DEPTH_MOVES as string[]).includes((x as EnhanceTarget).move),
      )
      .map((t) => ({ move: t.move, question: t.question, rationale: t.rationale ?? "" }))
      .slice(0, 8);
  } catch {
    return [];
  }
}

// Build a CoverageState from the full answer history WITHOUT de-duping by move,
// so multiple answers per move (original + enhance) are all carried into
// synthesis (which joins them).
export function stateFromAllAnswers(idea: string, answers: Answer[]): CoverageState {
  const statuses = {} as Record<DepthMove, MoveStatus>;
  for (const m of DEPTH_MOVES) statuses[m] = "pending";
  const kept = answers.filter((a) => !UNKNOWN.test(a.response));
  for (const a of kept) statuses[a.move] = "covered";
  return { idea, statuses, answers: kept };
}

// Regenerate the pack from the concatenated answer history and render a fresh
// blueprint. Used on Enhance "Finish" to produce the next version.
export async function enhanceFinish(
  idea: string,
  priorQa: Answer[],
  enhanceQa: Answer[],
  synthLLM: AskLLM,
): Promise<{ files: FileMap; blueprint: string; qa: Answer[] }> {
  const qa = [...priorQa, ...enhanceQa];
  const state = stateFromAllAnswers(idea, qa);
  let elicited = await synthesize(state, synthLLM);
  elicited = await reconcile(elicited, synthLLM);
  const files = assemble(elicited);
  const blueprint = renderBlueprint(elicited);
  return { files, blueprint, qa };
}
