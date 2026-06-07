import { describe, it, expect } from "vitest";
import { READ_ORDER, CONFLICT_RULE, META_RULE } from "./authority";

describe("authority", () => {
  it("read-order leads with LAUNCH then CLAUDE then the numbered context sequence", () => {
    expect(READ_ORDER[0]).toBe("LAUNCH.md");
    expect(READ_ORDER[1]).toBe("CLAUDE.md");
    expect(READ_ORDER).toContain("docs/context/01-non-negotiables.md");
    expect(READ_ORDER.indexOf("docs/context/00-identity.md"))
      .toBeLessThan(READ_ORDER.indexOf("docs/context/07-known-gaps.md"));
  });
  it("conflict rule ranks non-negotiables/contracts/security above prose", () => {
    expect(CONFLICT_RULE).toMatch(/non-negotiables/i);
    expect(CONFLICT_RULE).toMatch(/known-gaps/i);
  });
  it("meta rule states presets are validated defaults, not authoritative", () => {
    expect(META_RULE).toMatch(/validated default/i);
    expect(META_RULE).toMatch(/gap/i);
  });
});
