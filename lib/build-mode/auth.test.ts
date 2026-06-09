import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, signSession, verifySession } from "./auth";

describe("password hashing", () => {
  it("round-trips a correct password and rejects a wrong one", () => {
    const stored = hashPassword("hunter2");
    expect(verifyPassword("hunter2", stored)).toBe(true);
    expect(verifyPassword("wrong", stored)).toBe(false);
  });
  it("rejects a malformed stored value", () => {
    expect(verifyPassword("x", "not-a-valid-hash")).toBe(false);
  });
});

describe("session token", () => {
  const secret = "test-secret-please-rotate";
  it("round-trips a freshly signed token and returns the owner id", () => {
    const t = signSession(secret, 7, 1000);
    expect(verifySession(t, secret, 60_000, 1500)).toBe(7);
  });
  it("rejects an expired token", () => {
    const t = signSession(secret, 1, 1000);
    expect(verifySession(t, secret, 60_000, 100_000)).toBeNull();
  });
  it("rejects a tampered token and a wrong secret", () => {
    const t = signSession(secret, 1, 1000);
    expect(verifySession(t + "x", secret, 60_000, 1500)).toBeNull();
    expect(verifySession(t, "other-secret", 60_000, 1500)).toBeNull();
  });
  it("rejects undefined", () => {
    expect(verifySession(undefined, secret, 60_000, 1500)).toBeNull();
  });
});
