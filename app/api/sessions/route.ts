import { NextRequest } from 'next/server'
import { getOwnerId } from '@/lib/build-mode/server-auth'
import { getSql } from '@/lib/build-mode/db/client'
import { listSessions } from '@/lib/build-mode/db/sessions'

export const runtime = 'nodejs'

// GET -> the owner's saved sessions, newest first. Owner-gated.
export async function GET(req: NextRequest) {
  const ownerId = getOwnerId(req)
  if (ownerId === null) return Response.json({ error: 'unauthorized' }, { status: 401 })
  try {
    const sessions = await listSessions(getSql(), ownerId)
    return Response.json({ sessions })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[sessions] list failed:', e)
    return Response.json({ error: 'list failed' }, { status: 500 })
  }
}
