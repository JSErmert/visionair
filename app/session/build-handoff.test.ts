import { describe, it, expect } from "vitest";
import { sessionToBuildSeed } from "./build-handoff";
import type { SessionState, BlueprintSynthesis } from "./page";

const sampleState: SessionState = {
  entryPoint: "strength",
  seedInput: "I help physical therapists build structured rehab programs",
  reflection: "",
  capability: ["I design evidence-based rehab protocols", "I turn complex clinical data into actionable plans"],
  problemSpace: "structure",
  idealUser: "sports medicine physical therapists who feel overwhelmed managing patient progress",
  transformationBefore: "scattered notes and guesswork on patient progress",
  transformationAfter: "clear structured programs with measurable outcomes",
  opportunityForm: "platform",
  versionOne: "a web app where PTs can create and track personalized rehab programs for each patient",
  pathForward: {
    immediate: "validate with three PT clinics",
    nearTerm: "build the core program builder",
    later: "add outcome analytics",
  },
};

const sampleSynthesis: BlueprintSynthesis = {
  coreDirection: "A guided digital platform that helps physical therapists build evidence-based rehab programs",
  whoItServes: "Sports medicine PTs managing complex patient caseloads",
  whatItOffers: "Structured program creation with measurable progress tracking",
  firstShippableSlice: "Core program builder with patient profile and session logging",
  proofItWorks: "Three PT clinics complete a full patient rehab cycle using the platform",
};

describe("sessionToBuildSeed", () => {
  it("produces a non-trivial idea string from raw state alone (synthesis=null)", () => {
    const result = sessionToBuildSeed(sampleState, null);
    expect(result.idea.length).toBeGreaterThan(40);
    // Should contain recognizable strings from the capability and user fields
    expect(result.idea).toMatch(/physical therapist|rehab|PT/i);
    expect(result.idea).toMatch(/structured|program|protocol/i);
  });

  it("prefers synthesis fields when synthesis is present", () => {
    const result = sessionToBuildSeed(sampleState, sampleSynthesis);
    expect(result.idea.length).toBeGreaterThan(40);
    // Synthesis coreDirection should dominate
    expect(result.idea).toContain("evidence-based rehab programs");
    expect(result.idea).toMatch(/physical therapist|PT/i);
  });

  it("returns an object with an idea string property", () => {
    const result = sessionToBuildSeed(sampleState, null);
    expect(typeof result.idea).toBe("string");
    expect(result).toHaveProperty("idea");
  });
});
