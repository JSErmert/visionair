import { describe, it, expect, vi } from "vitest";
import { reconcile } from "./reconcile";
import { ElicitedArtifact } from "./types";

const base: ElicitedArtifact[] = [
  { path: "docs/context/03-spec.md", provenance: "elicited", content: "GET /api/search is the guest flow" },
  { path: "docs/context/04-contracts.md", provenance: "elicited", content: "/api/search requires host session" },
  { path: "docs/context/06-security.md", provenance: "preset", content: "/api/search returns 401 to guests" },
  { path: "docs/context/07-known-gaps.md", provenance: "open", content: "# Known gaps\n" },
];

describe("reconciliation pass", () => {
  it("routes a detected contradiction into known-gaps", async () => {
    const askLLM = vi.fn().mockResolvedValue(
      '[{"summary":"guest search requires a host session it cannot have","locations":"03-spec vs 06-security"}]',
    );
    const out = await reconcile(base, askLLM);
    const gaps = out.find((a) => a.path === "docs/context/07-known-gaps.md");
    expect(gaps?.content).toContain("Cross-file contradictions");
    expect(gaps?.content).toContain("guest search requires a host session");
  });

  it("leaves known-gaps unchanged when no contradictions are found", async () => {
    const askLLM = vi.fn().mockResolvedValue("[]");
    const out = await reconcile(base, askLLM);
    const gaps = out.find((a) => a.path === "docs/context/07-known-gaps.md");
    expect(gaps?.content).toBe("# Known gaps\n");
  });

  it("bare code-fence is parsed", async () => {
    const askLLM = vi.fn().mockResolvedValue(
      ["```", JSON.stringify([{summary:"bare fence contradiction", locations:"a vs b"}]), "```"].join("\n"),
    );
    const out = await reconcile(base, askLLM);
    const gaps = out.find((a) => a.path === "docs/context/07-known-gaps.md");
    expect(gaps?.content).toContain("bare fence contradiction");
  });

  it("malformed JSON does not throw and changes nothing", async () => {
    const askLLM = vi.fn().mockResolvedValue("not json {{{");
    const out = await reconcile(base, askLLM);
    const gaps = out.find((a) => a.path === "docs/context/07-known-gaps.md");
    expect(gaps?.content).toBe("# Known gaps\n");
  });
});
