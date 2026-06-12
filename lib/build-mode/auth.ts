import { scryptSync, randomBytes, timingSafeEqual, createHmac } from "node:crypto";

// Single-user owner gate. No third-party provider — a scrypt password hash in
// env (BUILD_OWNER_PASSWORD_HASH) gates login; a signed cookie (HMAC over the
// issued-at, keyed by BUILD_SESSION_SECRET) carries the session. nowMs is passed
// in so verification is deterministic and unit-testable.

export const SESSION_COOKIE = "buildmode_owner";
export const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function hashPassword(password: string, saltHex?: string): string {
  const salt = saltHex ?? randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, derivedHex] = (stored ?? "").split(":");
  if (!salt || !derivedHex) return false;
  const derived = scryptSync(password, salt, 32);
  const expected = Buffer.from(derivedHex, "hex");
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

// v3 multi-tenant: the session token carries the owner id —
// `${ownerId}.${issuedAt}.${mac}`, HMAC over `${ownerId}.${issuedAt}`. The session
// now says WHICH user, not just "valid". nowMs is injected so it is unit-testable.
export function signSession(secret: string, ownerId: number, issuedAtMs: number): string {
  const payload = `${ownerId}.${issuedAtMs}`;
  const mac = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${mac}`;
}

// Returns the owner id on a valid, unexpired, untampered token; null otherwise.
export function verifySession(
  token: string | undefined,
  secret: string,
  maxAgeMs: number,
  nowMs: number,
): number | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot < 0) return null;
  const payload = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const parts = payload.split(".");
  if (parts.length !== 2) return null;
  const ownerId = Number(parts[0]);
  const issuedAt = Number(parts[1]);
  if (!Number.isInteger(ownerId) || ownerId <= 0) return null;
  if (!Number.isFinite(issuedAt)) return null;
  if (nowMs < issuedAt || nowMs - issuedAt > maxAgeMs) return null;
  return ownerId;
}
