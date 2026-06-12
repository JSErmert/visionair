import { describe, it, expect, beforeEach } from "vitest";
import { getOwnerId, isOwner } from "./server-auth";
import { signSession, SESSION_COOKIE } from "./auth";

// The heart of multi-tenant: a signed cookie must resolve to the correct owner id,
// and must refuse anything tampered, forged, or unconfigured. Uses the real auth
// crypto with a fake NextRequest (only req.cookies.get is exercised).
const SECRET = "test-session-secret";

function reqWithToken(token?: string) {
  return {
    cookies: {
      get: (name: string) =>
        token && name === SESSION_COOKIE ? { value: token } : undefined,
    },
  } as never;
}

describe("getOwnerId (session -> owner id)", () => {
  beforeEach(() => {
    process.env.BUILD_SESSION_SECRET = SECRET;
  });

  it("returns the owner id from a valid signed session", () => {
    expect(getOwnerId(reqWithToken(signSession(SECRET, 42, Date.now())))).toBe(42);
  });

  it("returns null when there is no session cookie", () => {
    expect(getOwnerId(reqWithToken(undefined))).toBeNull();
  });

  it("returns null for a tampered token", () => {
    expect(getOwnerId(reqWithToken(signSession(SECRET, 42, Date.now()) + "x"))).toBeNull();
  });

  it("returns null for a token forged with a different secret", () => {
    expect(getOwnerId(reqWithToken(signSession("attacker-secret", 42, Date.now())))).toBeNull();
  });

  it("returns null when the server secret is not configured", () => {
    delete process.env.BUILD_SESSION_SECRET;
    expect(getOwnerId(reqWithToken(signSession(SECRET, 42, Date.now())))).toBeNull();
  });
});

describe("isOwner", () => {
  beforeEach(() => {
    process.env.BUILD_SESSION_SECRET = SECRET;
  });
  it("is true for a valid session, false without one", () => {
    expect(isOwner(reqWithToken(signSession(SECRET, 1, Date.now())))).toBe(true);
    expect(isOwner(reqWithToken(undefined))).toBe(false);
  });
});
