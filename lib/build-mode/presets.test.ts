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
  it("ci.yml pins actions by 40-char SHA, never bare tags", () => {
    const ci = loadPresets()[".github/workflows/ci.yml"];
    expect(ci).toMatch(/uses: [\w./-]+@[0-9a-f]{40}/);
    expect(ci).not.toMatch(/uses: [\w./-]+@v\d+\s*$/m);
  });
});
