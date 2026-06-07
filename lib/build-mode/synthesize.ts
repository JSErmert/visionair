import { CoverageState, DepthMove, DEPTH_MOVES, ElicitedArtifact } from "./types";
import { AskLLM } from "./interview";

// Path numbers match the design spec's context sequence. 05-architecture and
// 08-workflow are PRESET files (produced by Gate 1 / Plan 2), not elicited from
// an interview move — hence the gaps here are intentional.
const MOVE_ARTIFACT: Record<DepthMove, string> = {
  "identity": "docs/context/00-identity.md",
  "non-negotiables": "docs/context/01-non-negotiables.md",
  "doctrine": "docs/context/02-doctrine.md",
  "contracts": "docs/context/04-contracts.md",
  "core-logic": "docs/context/03-spec.md",
  "security": "docs/context/06-security.md",
};

export const SYNTH_SYSTEM =
  "You are VisionAir Build Mode synthesizer. Write a concise, high-depth context file " +
  "for the named dimension, grounded ONLY in the user's answer. Do not invent facts. " +
  "If the answer is thin, write only what it supports. If you make any design choice that " +
  "diverges from the user's answer (e.g. a safer alternative), you MUST add a line " +
  "`> DEVIATION from elicited answer — rationale: <why>` and MUST NOT present the change as " +
  "something the user specified.";

export async function synthesize(
  s: CoverageState,
  askLLM: AskLLM,
): Promise<ElicitedArtifact[]> {
  const arts: ElicitedArtifact[] = [];
  const gaps: DepthMove[] = [];

  for (const move of DEPTH_MOVES) {
    const status = s.statuses[move];
    if (status === "unknown" || status === "pending") {
      gaps.push(move);
      continue; // never fabricate content for an uncovered move
    }
    const answer = s.answers.find((a) => a.move === move);
    if (!answer) {
      gaps.push(move);
      continue;
    }
    const system = SYNTH_SYSTEM;
    const user = `IDEA: ${s.idea}\nDIMENSION: ${move}\nUSER ANSWER: ${answer.response}\n\nReturn markdown.`;
    const content = (await askLLM(system, user)).trim();
    arts.push({ path: MOVE_ARTIFACT[move], provenance: "elicited", content });
  }

  arts.push({
    path: "docs/context/07-known-gaps.md",
    provenance: "open",
    content:
      "# Known gaps (resolve before / during build)\n\n" +
      (gaps.length
        ? gaps.map((g) => `- **${g}**: not yet specified — confirm before building on it.`).join("\n")
        : "_None — every dimension was covered._"),
  });

  return arts;
}
