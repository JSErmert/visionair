import { ElicitedArtifact } from "./types";

const pick = (a: ElicitedArtifact[], path: string) =>
  (a.find((x) => x.path === path)?.content ?? "").trim();

export function renderBlueprint(elicited: ElicitedArtifact[]): string {
  const identity = pick(elicited, "docs/context/00-identity.md");
  const plan = pick(elicited, "docs/context/03-spec.md");
  const doctrine = pick(elicited, "docs/context/02-doctrine.md");
  const gaps = pick(elicited, "docs/context/07-known-gaps.md");
  return [
    "# Here's what I'm hearing",
    "",
    identity || "_(idea still forming)_",
    "",
    "## What we'd build",
    "",
    plan || "_(to be shaped)_",
    "",
    "## The calls we're making",
    "",
    doctrine || "_(no explicit priorities yet)_",
    "",
    "## Still open — worth deciding before you build",
    "",
    gaps || "_Nothing flagged._",
    "",
    "_This blueprint is the truth you already carry. The build pack below is what to do with it._",
  ].join("\n");
}
