// The operator's empirical depth-moves (the coverage dimensions).
export type DepthMove =
  | "identity"        // IS / IS-NOT + persona + value mechanism
  | "non-negotiables" // "what must never happen"
  | "doctrine"        // priority hierarchy / conflict resolution
  | "contracts"       // data + output schemas
  | "core-logic"      // core flow / features
  | "security";       // threat surface + sensitive data

export const DEPTH_MOVES: DepthMove[] = [
  "identity",
  "non-negotiables",
  "doctrine",
  "contracts",
  "core-logic",
  "security",
];

export type Provenance = "preset" | "elicited" | "open";

export interface Answer {
  move: DepthMove;
  question: string;
  response: string;
}

// "covered" = grounded answer captured; "unknown" = user could not answer (-> known-gaps).
export type MoveStatus = "pending" | "covered" | "unknown";

export interface CoverageState {
  idea: string;                               // the seed one-liner the user starts with
  statuses: Record<DepthMove, MoveStatus>;
  answers: Answer[];
}

export interface ElicitedArtifact {
  path: string;          // e.g. "docs/context/00-identity.md"
  provenance: Provenance;
  content: string;
}
