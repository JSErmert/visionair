import { describe, it, expect, vi } from "vitest";
import { auditPack, stateFromAllAnswers, enhanceFinish, AUDIT_SYSTEM } from "./enhance";
import { Answer } from "./types";
import type { FileMap } from "./assemble";

const files: FileMap = {
  "docs/context/00-identity.md": "thin identity",
  "docs/context/07-known-gaps.md": "# Known gaps\n- [verify] confirm the metric",
  "LAUNCH.md": "ignored (not docs/context)",
};

describe("auditPack", () => {
  it("returns ranked targets and drops invalid moves", async () => {
    const askLLM = vi.fn().mockResolvedValue(
      '[{"move":"non-negotiables","question":"What must never slip?","rationale":"gap"},{"move":"bogus","question":"drop","rationale":"x"}]',
    );
    const out = await auditPack(files, askLLM);
    expect(out).toHaveLength(1);
    expect(out[0].move).toBe("non-negotiables");
    expect(out[0].question).toContain("never slip");
  });

  it("tolerates a ```json fence", async () => {
    const askLLM = vi.fn().mockResolvedValue(
      "```json\n" + JSON.stringify([{ move: "identity", question: "Who is it for?", rationale: "" }]) + "\n```",
    );
    const out = await auditPack(files, askLLM);
    expect(out).toHaveLength(1);
    expect(out[0].move).toBe("identity");
  });

  it("returns [] on malformed JSON", async () => {
    const askLLM = vi.fn().mockResolvedValue("not json");
    expect(await auditPack(files, askLLM)).toEqual([]);
  });

  it("caps at 8 targets", async () => {
    const many = JSON.stringify(
      Array.from({ length: 12 }, () => ({ move: "doctrine", question: "q", rationale: "r" })),
    );
    const askLLM = vi.fn().mockResolvedValue(many);
    expect((await auditPack(files, askLLM)).length).toBe(8);
  });

  it("system prompt prioritizes known-gaps then thin dimensions", () => {
    expect(AUDIT_SYSTEM).toMatch(/known-gaps/i);
    expect(AUDIT_SYSTEM).toMatch(/thin|under-specified|deepen/i);
  });
});

describe("stateFromAllAnswers", () => {
  it("keeps multiple answers per move and marks them covered", () => {
    const answers: Answer[] = [
      { move: "identity", question: "q1", response: "first" },
      { move: "identity", question: "q2", response: "second" },
      { move: "security", question: "q3", response: "not sure" },
    ];
    const s = stateFromAllAnswers("idea", answers);
    expect(s.answers.filter((a) => a.move === "identity")).toHaveLength(2);
    expect(s.statuses.identity).toBe("covered");
    // "not sure" is an UNKNOWN sentinel -> dropped, move stays pending
    expect(s.answers.find((a) => a.move === "security")).toBeUndefined();
    expect(s.statuses.security).toBe("pending");
  });
});

describe("enhanceFinish", () => {
  it("concatenates prior + enhance answers and regenerates files + blueprint", async () => {
    const askLLM = vi.fn(async (system: string) =>
      system.includes("OPEN ITEMS") || system.includes("consistency checker") ? "[]" : "# regenerated",
    );
    const priorQa: Answer[] = [{ move: "identity", question: "q", response: "original identity" }];
    const enhanceQa: Answer[] = [{ move: "identity", question: "q2", response: "deeper identity" }];
    const out = await enhanceFinish("an idea", priorQa, enhanceQa, askLLM);
    expect(out.qa).toHaveLength(2);
    expect(out.blueprint).toContain("Here's what I'm hearing");
    expect(out.files["LAUNCH.md"]).toBeDefined();
    expect(out.files["docs/context/00-identity.md"]).toContain("regenerated");
  });
});
