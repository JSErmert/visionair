import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import {
  verifyPassword,
  signSession,
  SESSION_COOKIE,
  SESSION_MAX_AGE_MS,
} from '@/lib/build-mode/auth'
import { findOwnerByEmail } from '@/lib/build-mode/db/owners'
import { getSql } from '@/lib/build-mode/db/client'

export const runtime = 'nodejs'

// POST { email, password } -> verifies the account, signs the user in.
export async function POST(req: NextRequest) {
  const secret = process.env.BUILD_SESSION_SECRET
  if (!secret) return Response.json({ error: 'auth not configured' }, { status: 503 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'invalid json' }, { status: 400 })
  }
  const b = body as { email?: unknown; password?: unknown }
  const email = typeof b.email === 'string' ? b.email.trim() : ''
  const password = typeof b.password === 'string' ? b.password : ''
  if (!email || !password) {
    return Response.json({ error: 'Enter your email and password.' }, { status: 400 })
  }

  const owner = await findOwnerByEmail(getSql(), email)
  if (!owner || !verifyPassword(password, owner.passwordHash)) {
    return Response.json({ error: 'Incorrect email or password.' }, { status: 401 })
  }

  const token = signSession(secret, owner.id, Date.now())
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
