import type { SessionState, BlueprintSynthesis } from "./page";
import type { BuildSeed } from "@/lib/build-mode/seed";

/**
 * Maps a completed session's blueprint context into a concise but rich idea
 * string for Build Mode pre-seeding. Prefers Opus-distilled synthesis fields
 * when present; falls back to raw SessionState fields.
 */
export function sessionToBuildSeed(
  state: SessionState,
  synthesis: BlueprintSynthesis | null
): BuildSeed {
  if (synthesis) {
    // Synthesis path: compose from distilled fields
    const parts: string[] = [];

    if (synthesis.coreDirection) {
      parts.push(synthesis.coreDirection + ".");
    }

    if (synthesis.whoItServes) {
      parts.push(`It serves ${synthesis.whoItServes}.`);
    }

    if (synthesis.whatItOffers) {
      parts.push(synthesis.whatItOffers + ".");
    }

    if (synthesis.firstShippableSlice) {
      parts.push(`v1 target: ${synthesis.firstShippableSlice}.`);
    }

    return { idea: parts.join(" ").trim() };
  }

  // Raw state fallback path
  const parts: string[] = [];

  // Core capability
  const capability = state.capability.filter(Boolean).join(" ").trim();
  if (capability) {
    parts.push(capability + ".");
  } else if (state.seedInput) {
    parts.push(state.seedInput.trim() + ".");
  }

  // Problem space / who it helps
  if (state.idealUser) {
    parts.push(`It helps ${state.idealUser}.`);
  }

  // Transformation value
  if (state.transformationBefore && state.transformationAfter) {
    parts.push(
      `Transforms users from: ${state.transformationBefore.trim()} — to: ${state.transformationAfter.trim()}.`
    );
  }

  // Version one target
  if (state.versionOne) {
    parts.push(`v1 target: ${state.versionOne.trim()}.`);
  }

  // Opportunity form
  if (state.opportunityForm) {
    const formLabels: Record<string, string> = {
      platform: "Guided digital platform",
      tool: "Interactive intelligence tool",
      service: "Structured advisory or service model",
      hybrid: "Hybrid guided experience",
      learning: "Learning environment",
    };
    const label = formLabels[state.opportunityForm];
    if (label) parts.push(`Form: ${label}.`);
  }

  return { idea: parts.join(" ").trim() };
}
