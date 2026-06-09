import { describe, it, expect, vi } from "vitest";
import { generateTitle } from "./title";

describe("generateTitle", () => {
  it("returns a trimmed, quote-stripped title from the LLM", async () => {
    const askLLM = vi.fn().mockResolvedValue('"Professional Portfolio Website"\n');
    const t = await generateTitle("a portfolio site idea", "identity content", askLLM);
    expect(t).toBe("Professional Portfolio Website");
  });
  it("falls back to a default when the LLM returns empty", async () => {
    const askLLM = vi.fn().mockResolvedValue("   ");
    const t = await generateTitle("x", "", askLLM);
    expect(t).toBe("Untitled Build");
  });
  it("caps an over-long title", async () => {
    const askLLM = vi.fn().mockResolvedValue("x".repeat(200));
    const t = await generateTitle("x", "", askLLM);
    expect(t.length).toBeLessThanOrEqual(80);
  });
});
