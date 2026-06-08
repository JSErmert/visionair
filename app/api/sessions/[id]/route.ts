import { NextRequest } from 'next/server'
import { OWNER_ID } from '@/lib/build-mode/server-auth'
import { getSql } from '@/lib/build-mode/db/client'
import { getSessionWithVersions } from '@/lib/build-mode/db/sessions'

export const runtime = 'nodejs'

// GET /api/sessions/:id -> one session with its versions (newest first).
// SECURITY TODO (before public deploy): re-gate behind isOwner().
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const sessionId = Number(id)
  if (!Number.isInteger(sessionId)) {
    return Response.json({ error: 'bad id' }, { status: 400 })
  }
  try {
    const session = await getSessionWithVersions(getSql(), OWNER_ID, sessionId)
    if (!session) return Response.json({ error: 'not found' }, { status: 404 })
    return Response.json({ session })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[sessions] detail failed:', e)
    return Response.json({ error: 'detail failed' }, { status: 500 })
  }
}
