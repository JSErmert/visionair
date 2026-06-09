export const READ_ORDER: string[] = [
  "LAUNCH.md",
  "CLAUDE.md",
  "docs/context/00-identity.md",
  "docs/context/01-non-negotiables.md",
  "docs/context/02-doctrine.md",
  "docs/context/03-spec.md",
  "docs/context/04-contracts.md",
  "docs/context/05-architecture.md",
  "docs/context/06-security.md",
  "docs/context/07-known-gaps.md",
  "docs/context/08-workflow.md",
  "docs/context/testing.md",
];

export const CONFLICT_RULE =
  "When files conflict, authority is: non-negotiables > contracts > security > " +
  "doctrine > spec/prose. Anything unresolved or contradictory goes to " +
  "docs/context/07-known-gaps.md before you build on it.";

export const META_RULE =
  "Files tagged [preset] are VALIDATED DEFAULTS for this stack — verify each against " +
  "THIS app. If a preset does not fit, do NOT silently comply: flag the mismatch as a gap " +
  "in docs/context/07-known-gaps.md.";
