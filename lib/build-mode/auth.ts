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

export function signSession(secret: string, issuedAtMs: number): string {
  const payload = String(issuedAtMs);
  const mac = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${mac}`;
}

export function verifySession(
  token: string | undefined,
  secret: string,
  maxAgeMs: number,
  nowMs: number,
): boolean {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot < 0) return false;
  const payload = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  const issuedAt = Number(payload);
  if (!Number.isFinite(issuedAt)) return false;
  return nowMs >= issuedAt && nowMs - issuedAt <= maxAgeMs;
}
