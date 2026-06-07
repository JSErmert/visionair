import { describe, it, expect } from "vitest";
import { rebuildState } from "./session";
import { remainingMoves } from "./coverage-model";

describe("rebuildState", () => {
  it("replays answers into coverage state (covered vs unknown)", () => {
    const s = rebuildState("an app", [
      { move: "identity", question: "q", response: "a real answer" },
      { move: "security", question: "q", response: "not sure" },
    ]);
    expect(s.idea).toBe("an app");
    expect(s.statuses.identity).toBe("covered");
    expect(s.statuses.security).toBe("unknown");
    expect(remainingMoves(s)).not.toContain("identity");
    expect(remainingMoves(s)).not.toContain("security");
  });
});
