import { OWNER_ID } from '@/lib/build-mode/server-auth'
import { getSql } from '@/lib/build-mode/db/client'
import { listSessions } from '@/lib/build-mode/db/sessions'

export const runtime = 'nodejs'

// GET -> the owner's saved sessions, newest first.
// SECURITY TODO (before public deploy): re-gate behind isOwner() so the library
// is not world-readable. Ungated now for frictionless local single-user use.
export async function GET() {
  try {
    const sessions = await listSessions(getSql(), OWNER_ID)
    return Response.json({ sessions })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[sessions] list failed:', e)
    return Response.json({ error: 'list failed' }, { status: 500 })
  }
}
