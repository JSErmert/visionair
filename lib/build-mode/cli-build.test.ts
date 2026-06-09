import { describe, it, expect } from "vitest";
import { answerFromMap } from "./cli-build";

describe("answerFromMap", () => {
  it("returns the mapped answer for a move, or 'not sure' when absent", async () => {
    const ap = answerFromMap({ identity: "a tool, not a toy" });
    expect(await ap({ move: "identity", text: "q" } as any)).toBe("a tool, not a toy");
    expect(await ap({ move: "security", text: "q" } as any)).toBe("not sure");
  });
});
