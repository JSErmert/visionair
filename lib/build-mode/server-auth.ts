import { NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE, SESSION_MAX_AGE_MS } from "./auth";

// Node-runtime owner check, called inside protected route handlers (not in
// Edge middleware — node:crypto HMAC is unavailable there). Single-user: a valid
// signed cookie IS the owner. ownerId is 1 until multi-tenant lands.
export const OWNER_ID = 1;

export function isOwner(req: NextRequest): boolean {
  const secret = process.env.BUILD_SESSION_SECRET;
  if (!secret) return false;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return verifySession(token, secret, SESSION_MAX_AGE_MS, Date.now());
}
