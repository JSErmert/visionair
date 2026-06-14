import { cookies } from 'next/headers'
import { SESSION_COOKIE } from '@/lib/build-mode/auth'

export const runtime = 'nodejs'

// POST -> clear the session cookie (sign out). Same attributes as the set in
// login/signup so the browser reliably drops it.
export async function POST() {
  const c = await cookies()
  c.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    secure: process.env.NODE_ENV === 'production',
  })
  return Response.json({ ok: true })
}
