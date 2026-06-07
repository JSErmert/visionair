import { describe, it, expect } from "vitest";
import { assemble } from "./assemble";
import { ElicitedArtifact } from "./types";
import { READ_ORDER } from "./authority";

const elicited: ElicitedArtifact[] = [
  { path: "docs/context/00-identity.md", provenance: "elicited", content: "IS: a tool" },
  { path: "docs/context/06-security.md", provenance: "elicited", content: "app stores emails" },
  { path: "docs/context/07-known-gaps.md", provenance: "open", content: "# Known gaps\n- rate limits" },
];

describe("assemble", () => {
  it("produces LAUNCH.md listing the canonical read-order", () => {
    const m = assemble(elicited);
    for (const f of READ_ORDER) expect(m["LAUNCH.md"]).toContain(f);
  });
  it("CLAUDE.md carries the conflict rule and meta-rule", () => {
    const m = assemble(elicited);
    expect(m["CLAUDE.md"]).toMatch(/authority/i);
    expect(m["CLAUDE.md"]).toMatch(/validated default/i);
  });
  it("merges elicited security UNDER the preset security baseline (no overwrite)", () => {
    const m = assemble(elicited);
    expect(m["docs/context/06-security.md"]).toMatch(/nosniff/);        // preset baseline kept
    expect(m["docs/context/06-security.md"]).toContain("app stores emails"); // elicited appended
  });
  it("includes presets, elicited files, and known-gaps", () => {
    const m = assemble(elicited);
    expect(m["docs/context/00-identity.md"]).toContain("IS: a tool");
    expect(m[".github/workflows/ci.yml"]).toBeTruthy();
    expect(m["docs/context/07-known-gaps.md"]).toContain("rate limits");
  });
});
