import { AskLLM } from "./interview";

export interface VersionLite {
  versionNo: number;
  qa: { move: string; question: string; response: string }[];
  blueprint: string;
}

export const SUMMARY_SYSTEM =
  "You write the overview shown at the top of a saved VisionAir Build Mode session. " +
  "Return GitHub-flavored markdown with exactly two sections and nothing else:\n\n" +
  "## Overview\n" +
  "A comprehensive, current description of what this project IS now — reflecting the LATEST " +
  "version. 3–6 sentences, specific and plain, grounded only in the material provided. Present " +
  "tense, no hype.\n\n" +
  "## How it evolved\n" +
  "One bullet per version (V1, V2, …, in order), each a single sentence naming what that " +
  "version established or added. Ground each strictly in the answers introduced at that " +
  "version. Do not invent; if a version added little, say so plainly.";

// Build the per-version overview. `versions` may be in any order; deltas are
// computed from the cumulative qa history (each version's qa includes all prior).
export async function summarizeSession(
  idea: string,
  versions: VersionLite[],
  askLLM: AskLLM,
): Promise<string> {
  if (versions.length === 0) return "";
  const asc = [...versions].sort((a, b) => a.versionNo - b.versionNo);
  let prevCount = 0;
  const perVersion = asc
    .map((v) => {
      const added = v.qa.slice(prevCount);
      prevCount = v.qa.length;
      const addedText =
        added.map((a) => `(${a.move}) Q: ${a.question}\nA: ${a.response}`).join("\n\n") ||
        "(no new answers)";
      return `### V${v.versionNo} — introduced in this version:\n${addedText}`;
    })
    .join("\n\n");
  const latest = asc[asc.length - 1];
  const user =
    `IDEA SEED:\n${idea}\n\n` +
    `LATEST BLUEPRINT (V${latest.versionNo}):\n${latest.blueprint}\n\n` +
    `WHAT EACH VERSION INTRODUCED:\n${perVersion}`;
  try {
    return (await askLLM(SUMMARY_SYSTEM, user)).trim();
  } catch {
    return ""; // best-effort; caller falls back to the idea seed
  }
}
