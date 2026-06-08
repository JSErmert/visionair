import { NextRequest } from 'next/server'
import { isOwner, OWNER_ID } from '@/lib/build-mode/server-auth'
import { getSql } from '@/lib/build-mode/db/client'
import { getSessionWithVersions, deleteSession } from '@/lib/build-mode/db/sessions'

export const runtime = 'nodejs'

function parseId(id: string): number | null {
  const n = Number(id)
  return Number.isInteger(n) && n > 0 ? n : null
}

// GET /api/sessions/:id -> one session with its versions (newest first). Owner-gated.
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isOwner(req)) return Response.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const sessionId = parseId(id)
  if (sessionId === null) return Response.json({ error: 'bad id' }, { status: 400 })
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

// DELETE /api/sessions/:id -> remove the session and all its versions. Owner-gated.
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isOwner(req)) return Response.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const sessionId = parseId(id)
  if (sessionId === null) return Response.json({ error: 'bad id' }, { status: 400 })
  try {
    const removed = await deleteSession(getSql(), OWNER_ID, sessionId)
    if (removed === 0) return Response.json({ error: 'not found' }, { status: 404 })
    return Response.json({ ok: true })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[sessions] delete failed:', e)
    return Response.json({ error: 'delete failed' }, { status: 500 })
  }
}
