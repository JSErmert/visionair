import { describe, it, expect, vi, beforeEach } from "vitest";

// Integration test of the signup route handler. The DB layer is mocked (no live
// database); the real auth crypto signs the cookie, and next/headers is faked.
const { findOwnerByEmail, createOwner, setCookie } = vi.hoisted(() => ({
  findOwnerByEmail: vi.fn(),
  createOwner: vi.fn(),
  setCookie: vi.fn(),
}));
vi.mock("@/lib/build-mode/db/owners", () => ({ findOwnerByEmail, createOwner }));
vi.mock("@/lib/build-mode/db/client", () => ({ getSql: () => ({}) }));
vi.mock("next/headers", () => ({ cookies: async () => ({ set: setCookie }) }));

import { POST } from "./route";

const req = (body: unknown) => ({ json: async () => body }) as never;

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    process.env.BUILD_SESSION_SECRET = "test-secret";
    findOwnerByEmail.mockReset();
    createOwner.mockReset();
    setCookie.mockReset();
  });

  it("rejects an invalid email (400)", async () => {
    expect((await POST(req({ email: "not-an-email", password: "longenough" }))).status).toBe(400);
    expect(createOwner).not.toHaveBeenCalled();
  });

  it("rejects a password under 8 chars (400)", async () => {
    expect((await POST(req({ email: "a@b.com", password: "short" }))).status).toBe(400);
  });

  it("rejects a duplicate email (409) without creating", async () => {
    findOwnerByEmail.mockResolvedValue({ id: 1, passwordHash: "h" });
    const res = await POST(req({ email: "taken@b.com", password: "password1" }));
    expect(res.status).toBe(409);
    expect(createOwner).not.toHaveBeenCalled();
  });

  it("creates the account and sets a session cookie scoped to the new owner", async () => {
    findOwnerByEmail.mockResolvedValue(null);
    createOwner.mockResolvedValue(77);
    const res = await POST(req({ email: "new@b.com", password: "password1" }));
    expect(res.status).toBe(200);
    expect(createOwner).toHaveBeenCalledOnce();
    expect(setCookie).toHaveBeenCalledOnce();
    const [name, token] = setCookie.mock.calls[0];
    expect(name).toBe("buildmode_owner");
    // the signed session carries the new owner id (77.<issuedAt>.<mac>)
    expect((token as string).startsWith("77.")).toBe(true);
  });

  it("503 when the session secret is not configured", async () => {
    delete process.env.BUILD_SESSION_SECRET;
    expect((await POST(req({ email: "a@b.com", password: "password1" }))).status).toBe(503);
  });
});
