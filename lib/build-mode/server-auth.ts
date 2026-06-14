import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE, SESSION_MAX_AGE_MS } from "./auth";

// Node-runtime owner check, called inside protected route handlers (not in Edge
// middleware — node:crypto HMAC is unavailable there).
//
// OWNER_ID is the seeded operator account (id=1); the env-based operator login
// (build-auth) maps here. v3 multi-tenant: a session carries the owner id, so
// getOwnerId() returns the actual logged-in user.
export const OWNER_ID = 1;

// The logged-in owner's id from the signed session cookie, or null if not signed in.
export function getOwnerId(req: NextRequest): number | null {
  const secret = process.env.BUILD_SESSION_SECRET;
  if (!secret) return null;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return verifySession(token, secret, SESSION_MAX_AGE_MS, Date.now());
}

// Back-compat boolean gate: any valid session means a logged-in user.
export function isOwner(req: NextRequest): boolean {
  return getOwnerId(req) !== null;
}

// Same check for Server Components / Server Actions, which read the cookie via
// next/headers rather than a NextRequest. Returns the logged-in owner id or null.
export async function getOwnerIdServer(): Promise<number | null> {
  const secret = process.env.BUILD_SESSION_SECRET;
  if (!secret) return null;
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return verifySession(token, secret, SESSION_MAX_AGE_MS, Date.now());
}
