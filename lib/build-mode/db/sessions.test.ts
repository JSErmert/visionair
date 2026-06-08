import { describe, it, expect } from "vitest";
import { createSessionWithV1, listSessions } from "./sessions";

// Fake neon tagged-template: records calls, returns queued result rows in order.
function fakeSql(queue: unknown[][]) {
  const calls: { text: string; values: unknown[] }[] = [];
  const tag = (strings: TemplateStringsArray, ...values: unknown[]) => {
    calls.push({ text: strings.join("?"), values });
    return Promise.resolve(queue.shift() ?? []);
  };
  (tag as unknown as { calls: typeof calls }).calls = calls;
  return tag;
}

describe("createSessionWithV1", () => {
  it("inserts a session then version 1 and returns ids", async () => {
    const sql = fakeSql([[{ id: 42 }], [{ id: 100 }]]);
    const out = await createSessionWithV1(sql as never, {
      ownerId: 1,
      title: "Portfolio",
      idea: "x",
      entryPoint: "idea",
      qa: [{ move: "identity", question: "q", response: "r" }],
      blueprint: "# bp",
      files: { "a.md": "hi" },
    });
    expect(out).toEqual({ sessionId: 42, versionId: 100, versionNo: 1 });
    expect((sql as unknown as { calls: unknown[] }).calls.length).toBe(2);
  });
});

describe("listSessions", () => {
  it("maps rows from the query", async () => {
    const sql = fakeSql([
      [{ id: 1, title: "A", updated_at: "2026-06-08", version_count: 2 }],
    ]);
    const rows = await listSessions(sql as never, 1);
    expect(rows[0]).toMatchObject({ id: 1, title: "A", versionCount: 2 });
  });
});
