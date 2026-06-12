import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import {
  verifyPassword,
  signSession,
  SESSION_COOKIE,
  SESSION_MAX_AGE_MS,
} from '@/lib/build-mode/auth'
import { OWNER_ID } from '@/lib/build-mode/server-auth'

export const runtime = 'nodejs'

// POST { password } -> sets the owner session cookie on success.
export async function POST(req: NextRequest) {
  const hash = process.env.BUILD_OWNER_PASSWORD_HASH
  const secret = process.env.BUILD_SESSION_SECRET
  if (!hash || !secret) {
    return Response.json({ error: 'auth not configured' }, { status: 503 })
  }
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'invalid json' }, { status: 400 })
  }
  const password =
    body && typeof (body as { password?: unknown }).password === 'string'
      ? (body as { password: string }).password
      : ''
  if (!verifyPassword(password, hash)) {
    return Response.json({ error: 'invalid credentials' }, { status: 401 })
  }
  // Operator (env-based) login maps to the seeded operator account, id=1.
  const token = signSession(secret, OWNER_ID, Date.now())
  const c = await cookies()
  c.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(SESSION_MAX_AGE_MS / 1000),
    secure: process.env.NODE_ENV === 'production',
  })
  return Response.json({ ok: true })
}

// DELETE -> clears the session cookie (logout).
export async function DELETE() {
  const c = await cookies()
  c.delete(SESSION_COOKIE)
  return Response.json({ ok: true })
}
