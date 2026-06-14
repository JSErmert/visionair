import { NextRequest } from 'next/server'
import { getOwnerId } from '@/lib/build-mode/server-auth'
import { getSql } from '@/lib/build-mode/db/client'
import { getSessionWithVersions, deleteSession, updateSessionTitle } from '@/lib/build-mode/db/sessions'
import { cleanManualTitle } from '@/lib/build-mode/title'

export const runtime = 'nodejs'

function parseId(id: string): number | null {
  const n = Number(id)
  return Number.isInteger(n) && n > 0 ? n : null
}

// GET /api/sessions/:id -> one session with its versions (newest first). Owner-gated.
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const ownerId = getOwnerId(req)
  if (ownerId === null) return Response.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const sessionId = parseId(id)
  if (sessionId === null) return Response.json({ error: 'bad id' }, { status: 400 })
  try {
    const session = await getSessionWithVersions(getSql(), ownerId, sessionId)
    if (!session) return Response.json({ error: 'not found' }, { status: 404 })
    return Response.json({ session })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[sessions] detail failed:', e)
    return Response.json({ error: 'detail failed' }, { status: 500 })
  }
}

// PATCH /api/sessions/:id { title } -> rename the session. Owner-gated. The title
// is otherwise locked (generation never overwrites it), so this is the only way
// to change it.
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const ownerId = getOwnerId(req)
  if (ownerId === null) return Response.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const sessionId = parseId(id)
  if (sessionId === null) return Response.json({ error: 'bad id' }, { status: 400 })
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'invalid json' }, { status: 400 })
  }
  const raw = typeof (body as { title?: unknown })?.title === 'string' ? (body as { title: string }).title : ''
  const title = cleanManualTitle(raw)
  if (!title) return Response.json({ error: 'Enter a title.' }, { status: 400 })
  try {
    const ok = await updateSessionTitle(getSql(), ownerId, sessionId, title)
    if (!ok) return Response.json({ error: 'not found' }, { status: 404 })
    return Response.json({ ok: true, title })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[sessions] rename failed:', e)
    return Response.json({ error: 'rename failed' }, { status: 500 })
  }
}

// DELETE /api/sessions/:id -> remove the session and all its versions. Owner-gated.
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const ownerId = getOwnerId(req)
  if (ownerId === null) return Response.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const sessionId = parseId(id)
  if (sessionId === null) return Response.json({ error: 'bad id' }, { status: 400 })
  try {
    const removed = await deleteSession(getSql(), ownerId, sessionId)
    if (removed === 0) return Response.json({ error: 'not found' }, { status: 404 })
    return Response.json({ ok: true })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[sessions] delete failed:', e)
    return Response.json({ error: 'delete failed' }, { status: 500 })
  }
}
