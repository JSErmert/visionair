import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import {
  hashPassword,
  signSession,
  SESSION_COOKIE,
  SESSION_MAX_AGE_MS,
} from '@/lib/build-mode/auth'
import { createOwner, findOwnerByEmail } from '@/lib/build-mode/db/owners'
import { getSql } from '@/lib/build-mode/db/client'

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// POST { email, password } -> creates an account, signs the user in.
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

  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }
  if (password.length < 8) {
    return Response.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  }

  const sql = getSql()
  if (await findOwnerByEmail(sql, email)) {
    return Response.json({ error: 'An account with that email already exists.' }, { status: 409 })
  }

  let ownerId: number
  try {
    ownerId = await createOwner(sql, email, hashPassword(password), email)
  } catch {
    // Unique-index race or transient DB error.
    return Response.json({ error: 'Could not create the account. Try again.' }, { status: 500 })
  }

  const token = signSession(secret, ownerId, Date.now())
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
