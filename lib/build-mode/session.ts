import { Answer, CoverageState } from "./types";
import { initCoverage, applyAnswer, markUnknown } from "./coverage-model";
import { UNKNOWN } from "./orchestrate";

export function rebuildState(idea: string, answers: Answer[]): CoverageState {
  let s = initCoverage(idea);
  for (const a of answers) {
    s = UNKNOWN.test(a.response) ? markUnknown(s, a.move) : applyAnswer(s, a);
  }
  return s;
}
