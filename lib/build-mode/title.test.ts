import { describe, it, expect, vi } from "vitest";
import { generateTitle, sanitizeTitle, titleFromIdea } from "./title";

describe("generateTitle", () => {
  it("returns a trimmed, quote-stripped title from the LLM", async () => {
    const askLLM = vi.fn().mockResolvedValue('"Professional Portfolio Website"\n');
    const t = await generateTitle("a portfolio site idea", "identity content", askLLM);
    expect(t).toBe("Professional Portfolio Website");
  });
  it("falls back to a default when the LLM returns empty and the idea is unusable", async () => {
    const askLLM = vi.fn().mockResolvedValue("   ");
    const t = await generateTitle("x", "", askLLM);
    expect(t).toBe("Untitled Build");
  });
  it("caps an over-long (but clean) title", async () => {
    const askLLM = vi.fn().mockResolvedValue("x".repeat(200));
    const t = await generateTitle("x", "", askLLM);
    expect(t.length).toBeLessThanOrEqual(80);
  });

  it("rejects a markdown/ASCII-art blob and derives a clean title from the idea", async () => {
    // The real bug: the model ignored the instruction and returned blueprint markdown.
    const blob =
      "VisionAir Project Dashboard ## MASTER PROJECT REGISTRY ```\n┌──────────────────";
    const askLLM = vi.fn().mockResolvedValue(blob);
    const t = await generateTitle("personal project dashboard", "identity", askLLM);
    expect(t).toBe("Personal Project Dashboard");
    expect(t).not.toMatch(/[#`]|[─-▟]|\n/); // no markdown/code/box/newlines
  });

  it("never derives the fallback from the identity/blueprint, only the idea", async () => {
    const askLLM = vi.fn().mockResolvedValue("### heading only\n\n```code```");
    const t = await generateTitle("music sharing site", "SECRET BLUEPRINT INTERNALS", askLLM);
    expect(t).toBe("Music Sharing Site");
    expect(t.toLowerCase()).not.toContain("secret");
    expect(t.toLowerCase()).not.toContain("blueprint");
  });

  it("falls back to the idea when the LLM throws", async () => {
    const askLLM = vi.fn().mockRejectedValue(new Error("overloaded"));
    const t = await generateTitle("grocery decision engine", "", askLLM);
    expect(t).toBe("Grocery Decision Engine");
  });
});

describe("sanitizeTitle", () => {
  it("keeps a clean short title", () => {
    expect(sanitizeTitle("Project Dashboard")).toBe("Project Dashboard");
  });
  it("strips a leading markdown heading marker", () => {
    expect(sanitizeTitle("# Project Dashboard")).toBe("Project Dashboard");
  });
  it("strips surrounding quotes", () => {
    expect(sanitizeTitle('"Project Dashboard"')).toBe("Project Dashboard");
  });
  it("rejects a heading-laden blob", () => {
    expect(
      sanitizeTitle("VisionAir Dashboard ## MASTER PROJECT REGISTRY ```┌──────"),
    ).toBeNull();
  });
  it("rejects box-drawing / ASCII art", () => {
    expect(sanitizeTitle("┌──── Registry ────┐")).toBeNull();
  });
  it("rejects a multi-line blob", () => {
    expect(sanitizeTitle("Line one\nLine two\nLine three")).toBeNull();
  });
  it("rejects empty / whitespace", () => {
    expect(sanitizeTitle("   ")).toBeNull();
    expect(sanitizeTitle("")).toBeNull();
  });
  it("does not reject a single # inside a word (e.g. C#)", () => {
    expect(sanitizeTitle("C# Build Helper")).toBe("C# Build Helper");
  });
});

describe("titleFromIdea", () => {
  it("title-cases the first few meaningful words", () => {
    expect(titleFromIdea("personal project dashboard")).toBe("Personal Project Dashboard");
  });
  it("drops a leading article", () => {
    expect(titleFromIdea("a grocery decision engine")).toBe("Grocery Decision Engine");
  });
  it("strips markdown/box noise before deriving", () => {
    expect(titleFromIdea("## music sharing site ┌──")).toBe("Music Sharing Site");
  });
  it("falls back to Untitled Build when nothing usable", () => {
    expect(titleFromIdea("x")).toBe("Untitled Build");
    expect(titleFromIdea("")).toBe("Untitled Build");
  });
});
