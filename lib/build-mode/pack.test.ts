import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { pack } from "./pack";

describe("pack", () => {
  it("zips a FileMap so every path round-trips", async () => {
    const map = { "LAUNCH.md": "hi", "docs/context/00-identity.md": "id" };
    const bytes = await pack(map);
    const zip = await JSZip.loadAsync(bytes);
    expect(await zip.file("LAUNCH.md")!.async("string")).toBe("hi");
    expect(await zip.file("docs/context/00-identity.md")!.async("string")).toBe("id");
  });
});
