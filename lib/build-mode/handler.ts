import { Answer, DepthMove } from "./types";
import { AskLLM, nextQuestion } from "./interview";
import type { Level } from "./persona";
import { rebuildState } from "./session";
import { synthesize } from "./synthesize";
import { reconcile } from "./reconcile";
import { assemble, FileMap } from "./assemble";
import { pack } from "./pack";
import { renderBlueprint } from "./blueprint";

export interface BuildRequest { action: "question" | "pack"; idea: string; answers: Answer[]; level?: Level; }
export type BuildResponse =
  | { kind: "question"; done: false; move: DepthMove; text: string }
  | { kind: "question"; done: true }
  | { kind: "pack"; blueprint: string; zip: Uint8Array; files: FileMap };

export async function handleBuild(
  req: BuildRequest,
  llms: { questionLLM: AskLLM; synthLLM: AskLLM },
): Promise<BuildResponse> {
  const state = rebuildState(req.idea, req.answers);
  if (req.action === "question") {
    const q = await nextQuestion(state, llms.questionLLM, req.level);
    return q ? { kind: "question", done: false, move: q.move, text: q.text } : { kind: "question", done: true };
  }
  let elicited = await synthesize(state, llms.synthLLM);
  elicited = await reconcile(elicited, llms.synthLLM);
  const blueprint = renderBlueprint(elicited);
  const files = assemble(elicited);
  const zip = await pack(files);
  return { kind: "pack", blueprint, zip, files };
}
