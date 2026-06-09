import { describe, it, expect } from "vitest";
import { composeIdea } from "./entry";

describe("composeIdea", () => {
  it("contains the problem framing prefix and the description", () => {
    const result = composeIdea("problem", "microplastics in laundry");
    expect(result).toMatch(/building around a problem/i);
    expect(result).toContain("microplastics in laundry");
  });

  it("contains the strength framing prefix", () => {
    expect(composeIdea("strength", "I can teach complex things simply")).toMatch(
      /building from a capability/i
    );
  });

  it("contains the idea framing prefix", () => {
    expect(composeIdea("idea", "an app that")).toMatch(
      /an idea i can.t stop thinking about/i
    );
  });

  it("contains the direction framing prefix", () => {
    expect(composeIdea("direction", "fintech infrastructure")).toMatch(
      /a direction i want to explore/i
    );
  });

  it("contains the unsure framing prefix", () => {
    expect(composeIdea("unsure", "something with AI")).toMatch(
      /still finding the shape of it/i
    );
  });

  it("returns the framing even when description is empty", () => {
    const result = composeIdea("problem", "");
    expect(result).toMatch(/building around a problem/i);
  });

  it("includes the description appended after the framing", () => {
    const result = composeIdea("strength", "teaching code");
    const parts = result.split("\n").join(" "); // normalise newlines
    // framing appears before description
    const framingIdx = result.search(/building from a capability/i);
    const descIdx = result.indexOf("teaching code");
    expect(framingIdx).toBeGreaterThanOrEqual(0);
    expect(descIdx).toBeGreaterThan(framingIdx);
  });
});
