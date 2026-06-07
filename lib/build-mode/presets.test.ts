import { describe, it, expect } from "vitest";
import { loadPresets } from "./presets";

describe("preset loader", () => {
  it("maps preset source files to their pack destinations with content", () => {
    const m = loadPresets();
    expect(m["docs/context/06-security.md"]).toMatch(/nosniff/);
    expect(m[".github/workflows/ci.yml"]).toMatch(/contents: read/);
    expect(m["docs/context/05-architecture.md"]).toMatch(/Decision/);
    expect(m["docs/context/08-workflow.md"]).toMatch(/spec/i);
    expect(m["SETUP.md"]).toBeTruthy();
    expect(m[".gitignore"]).toMatch(/node_modules/);
  });
  it("every preset carries the validated-default meta-rule header", () => {
    const m = loadPresets();
    for (const [path, content] of Object.entries(m)) {
      if (path.endsWith(".md")) expect(content).toMatch(/VALIDATED DEFAULT/i);
    }
  });
  it("every active uses: in ci.yml is pinned to a 40-char SHA (no bare tags)", () => {
    const ci = loadPresets()[".github/workflows/ci.yml"];
    const activeUses = ci
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("uses:")); // commented lines start with '#', excluded
    expect(activeUses.length).toBeGreaterThan(0);
    for (const line of activeUses) {
      expect(line, line).toMatch(/uses:\s+[\w./-]+@[0-9a-f]{40}\b/);
    }
  });
});
