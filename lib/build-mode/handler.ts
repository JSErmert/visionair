import { Answer, DepthMove } from "./types";
import { AskLLM, nextQuestion } from "./interview";
import { rebuildState } from "./session";
import { synthesize } from "./synthesize";
import { reconcile } from "./reconcile";
import { assemble } from "./assemble";
import { pack } from "./pack";

export interface BuildRequest { action: "question" | "pack"; idea: string; answers: Answer[]; }
export type BuildResponse =
  | { kind: "question"; done: false; move: DepthMove; text: string }
  | { kind: "question"; done: true }
  | { kind: "pack"; zip: Uint8Array };

export async function handleBuild(
  req: BuildRequest,
  llms: { questionLLM: AskLLM; synthLLM: AskLLM },
): Promise<BuildResponse> {
  const state = rebuildState(req.idea, req.answers);
  if (req.action === "question") {
    const q = await nextQuestion(state, llms.questionLLM);
    return q ? { kind: "question", done: false, move: q.move, text: q.text } : { kind: "question", done: true };
  }
  let elicited = await synthesize(state, llms.synthLLM);
  elicited = await reconcile(elicited, llms.synthLLM);
  const zip = await pack(assemble(elicited));
  return { kind: "pack", zip };
}
