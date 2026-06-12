import { describe, it, expect } from "vitest";
import { createOwner, findOwnerByEmail } from "./owners";

// Same fake neon tagged-template as sessions.test.ts: records calls, returns
// queued result rows in order. No database required.
function fakeSql(queue: unknown[][]) {
  const calls: { text: string; values: unknown[] }[] = [];
  const tag = (strings: TemplateStringsArray, ...values: unknown[]) => {
    calls.push({ text: strings.join("?"), values });
    return Promise.resolve(queue.shift() ?? []);
  };
  (tag as unknown as { calls: typeof calls }).calls = calls;
  return tag;
}
const callsOf = (sql: unknown) => (sql as { calls: { values: unknown[] }[] }).calls;

describe("createOwner", () => {
  it("inserts an owner with a lowercased email + the hash, returns the new id", async () => {
    const sql = fakeSql([[{ id: 7 }]]);
    const id = await createOwner(sql as never, "User@Example.com", "salt:hash", "User@Example.com");
    expect(id).toBe(7);
    // email stored lowercased; the scrypt hash is passed straight through; no plaintext.
    expect(callsOf(sql)[0].values).toContain("user@example.com");
    expect(callsOf(sql)[0].values).toContain("salt:hash");
  });

  it("coerces a bigint/string id to a real number", async () => {
    const sql = fakeSql([[{ id: "99" }]]);
    const id = await createOwner(sql as never, "a@b.com", "h", "a@b.com");
    expect(id).toBe(99);
    expect(typeof id).toBe("number");
  });
});

describe("findOwnerByEmail", () => {
  it("returns id + passwordHash for an existing account (matched case-insensitively)", async () => {
    const sql = fakeSql([[{ id: 3, password_hash: "salt:hash" }]]);
    const owner = await findOwnerByEmail(sql as never, "Found@Example.com");
    expect(owner).toEqual({ id: 3, passwordHash: "salt:hash" });
    expect(callsOf(sql)[0].values).toContain("found@example.com");
  });

  it("returns null when no row matches", async () => {
    const sql = fakeSql([[]]);
    expect(await findOwnerByEmail(sql as never, "missing@example.com")).toBeNull();
  });
});
