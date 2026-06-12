import { describe, it, expect, vi, beforeEach } from "vitest";
import { hashPassword } from "@/lib/build-mode/auth";

// Integration test of the login route handler. DB mocked; real auth crypto verifies
// the password and signs the cookie; next/headers faked.
const { findOwnerByEmail, setCookie } = vi.hoisted(() => ({
  findOwnerByEmail: vi.fn(),
  setCookie: vi.fn(),
}));
vi.mock("@/lib/build-mode/db/owners", () => ({ findOwnerByEmail }));
vi.mock("@/lib/build-mode/db/client", () => ({ getSql: () => ({}) }));
vi.mock("next/headers", () => ({ cookies: async () => ({ set: setCookie }) }));

import { POST } from "./route";

const req = (body: unknown) => ({ json: async () => body }) as never;

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    process.env.BUILD_SESSION_SECRET = "test-secret";
    findOwnerByEmail.mockReset();
    setCookie.mockReset();
  });

  it("400 when email or password is missing", async () => {
    expect((await POST(req({ email: "", password: "x" }))).status).toBe(400);
  });

  it("401 for an unknown email (no user enumeration)", async () => {
    findOwnerByEmail.mockResolvedValue(null);
    expect((await POST(req({ email: "ghost@b.com", password: "whatever1" }))).status).toBe(401);
  });

  it("401 for a wrong password, and sets no cookie", async () => {
    findOwnerByEmail.mockResolvedValue({ id: 5, passwordHash: hashPassword("correct-password") });
    const res = await POST(req({ email: "real@b.com", password: "wrong-password" }));
    expect(res.status).toBe(401);
    expect(setCookie).not.toHaveBeenCalled();
  });

  it("signs in (200) with a session cookie scoped to that owner on the correct password", async () => {
    findOwnerByEmail.mockResolvedValue({ id: 5, passwordHash: hashPassword("correct-password") });
    const res = await POST(req({ email: "real@b.com", password: "correct-password" }));
    expect(res.status).toBe(200);
    expect(setCookie).toHaveBeenCalledOnce();
    const [name, token] = setCookie.mock.calls[0];
    expect(name).toBe("buildmode_owner");
    expect((token as string).startsWith("5.")).toBe(true);
  });

  it("503 when the session secret is not configured", async () => {
    delete process.env.BUILD_SESSION_SECRET;
    expect((await POST(req({ email: "a@b.com", password: "password1" }))).status).toBe(503);
  });
});
