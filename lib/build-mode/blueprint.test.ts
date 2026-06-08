import { describe, it, expect } from "vitest";
import { renderBlueprint } from "./blueprint";
import { ElicitedArtifact } from "./types";

const arts: ElicitedArtifact[] = [
  { path: "docs/context/00-identity.md", provenance: "elicited", content: "IS: a budgeting tool" },
  { path: "docs/context/03-spec.md", provenance: "elicited", content: "Home, then a tracker view" },
  { path: "docs/context/02-doctrine.md", provenance: "elicited", content: "clarity beats features" },
  { path: "docs/context/07-known-gaps.md", provenance: "open", content: "# Known gaps\n- rate limits" },
];

describe("renderBlueprint", () => {
  it("produces an OG-voiced summary from the synthesized artifacts", () => {
    const bp = renderBlueprint(arts);
    expect(bp).toMatch(/what i'?m hearing/i);
    expect(bp).toContain("a budgeting tool");
    expect(bp).toContain("Home, then a tracker view");
    expect(bp).toMatch(/still open/i);
    expect(bp).toContain("rate limits");
    expect(bp).toMatch(/truth you already carry/i);
  });
});
