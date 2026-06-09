import { CoverageState, DepthMove, DEPTH_MOVES, Answer, MoveStatus } from "./types";

export function initCoverage(idea: string): CoverageState {
  const statuses = Object.fromEntries(
    DEPTH_MOVES.map((m) => [m, "pending" as MoveStatus]),
  ) as Record<DepthMove, MoveStatus>;
  return { idea, statuses, answers: [] };
}

export function remainingMoves(s: CoverageState): DepthMove[] {
  return DEPTH_MOVES.filter((m) => s.statuses[m] === "pending");
}

export function applyAnswer(s: CoverageState, a: Answer): CoverageState {
  return {
    ...s,
    statuses: { ...s.statuses, [a.move]: "covered" },
    answers: [...s.answers.filter((x) => x.move !== a.move), a],
  };
}

export function markUnknown(s: CoverageState, move: DepthMove): CoverageState {
  return { ...s, statuses: { ...s.statuses, [move]: "unknown" } };
}
