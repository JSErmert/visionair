import { NextRequest } from 'next/server'
import { isOwner, OWNER_ID } from '@/lib/build-mode/server-auth'
import { getSql } from '@/lib/build-mode/db/client'
import { listSessions } from '@/lib/build-mode/db/sessions'

export const runtime = 'nodejs'

// GET -> the owner's saved sessions, newest first. Owner-gated.
export async function GET(req: NextRequest) {
  if (!isOwner(req)) return Response.json({ error: 'unauthorized' }, { status: 401 })
  try {
    const sessions = await listSessions(getSql(), OWNER_ID)
    return Response.json({ sessions })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[sessions] list failed:', e)
    return Response.json({ error: 'list failed' }, { status: 500 })
  }
}
