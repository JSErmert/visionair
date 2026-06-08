import { AskLLM } from "./interview";
import { Answer, ElicitedArtifact } from "./types";

export type GapTag = "verify" | "do-not-quantify" | "uncertain" | "decision-needed";

export interface GapItem {
  tag: GapTag;
  text: string;
}

const ALLOWED: GapTag[] = ["verify", "do-not-quantify", "uncertain", "decision-needed"];

export const GAPS_SYSTEM =
  "You audit a project's interview answers and drafted context files for OPEN ITEMS the " +
  "builder must resolve before or during the build: things the user flagged to verify, " +
  "figures that must NOT be quantified or stated as verified fact, genuine uncertainties, " +
  "and decisions left unmade. Return ONLY a JSON array of objects " +
  '{"tag": one of "verify" | "do-not-quantify" | "uncertain" | "decision-needed", "text": string}. ' +
  "Return an empty array if there are none. Do not invent items — only surface what the source " +
  "material actually flags.";

export async function extractGaps(
  idea: string,
  answers: Answer[],
  artifacts: ElicitedArtifact[],
  askLLM: AskLLM,
): Promise<GapItem[]> {
  if (answers.length === 0) return [];
  const user =
    `IDEA: ${idea}\n\nANSWERS:\n` +
    answers.map((a) => `- (${a.move}) ${a.response}`).join("\n") +
    `\n\nDRAFTED FILES:\n` +
    artifacts.map((a) => `=== ${a.path} ===\n${a.content}`).join("\n\n");
  try {
    const raw = (await askLLM(GAPS_SYSTEM, user))
      .replace(/^﻿/, "")
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```$/, "")
      .trim();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x: unknown): x is GapItem =>
        !!x &&
        typeof (x as GapItem).text === "string" &&
        ALLOWED.includes((x as GapItem).tag),
    );
  } catch {
    return []; // parse/transport failure must never block the pack
  }
}
