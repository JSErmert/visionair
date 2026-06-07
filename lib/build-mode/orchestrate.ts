import { initCoverage, applyAnswer, markUnknown } from "./coverage-model";
import { nextQuestion, isComplete, AskLLM, NextQuestion } from "./interview";
import { synthesize } from "./synthesize";
import { reconcile } from "./reconcile";
import { assemble, FileMap } from "./assemble";
import { pack } from "./pack";

export type AnswerProvider = (q: NextQuestion) => Promise<string>;
const UNKNOWN = /^\s*(idk|i\s*don'?t\s*know|not\s*sure|unknown|skip|n\/?a)\s*$/i;

export interface BuildResult { fileMap: FileMap; zip: Uint8Array; }

export async function runBuildMode(opts: {
  idea: string;
  answer: AnswerProvider;
  questionLLM: AskLLM;
  synthLLM: AskLLM;
  maxQuestions?: number;
}): Promise<BuildResult> {
  let state = initCoverage(opts.idea);
  const cap = opts.maxQuestions ?? 12;
  let asked = 0;
  while (!isComplete(state) && asked < cap) {
    const q = await nextQuestion(state, opts.questionLLM);
    if (!q) break;
    asked++;
    const a = await opts.answer(q);
    state = UNKNOWN.test(a)
      ? markUnknown(state, q.move)
      : applyAnswer(state, { move: q.move, question: q.text, response: a });
  }
  let elicited = await synthesize(state, opts.synthLLM);
  elicited = await reconcile(elicited, opts.synthLLM);
  const fileMap = assemble(elicited);
  const zip = await pack(fileMap);
  return { fileMap, zip };
}
