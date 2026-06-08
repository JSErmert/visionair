import { describe, it, expect } from "vitest";
import { SEED_KEY } from "./seed";

describe("build-mode seed", () => {
  it('SEED_KEY equals "buildmode:seed"', () => {
    expect(SEED_KEY).toBe("buildmode:seed");
  });
});
