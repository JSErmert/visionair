import { NextRequest } from 'next/server'
import { getOwnerId } from '@/lib/build-mode/server-auth'
import { getSql } from '@/lib/build-mode/db/client'
import { setOwnerName } from '@/lib/build-mode/db/owners'

export const runtime = 'nodejs'

// POST { name } -> set the display name for the signed-in account. When set, the
// UI shows it instead of the email.
export async function POST(req: NextRequest) {
  const ownerId = getOwnerId(req)
  if (ownerId === null) return Response.json({ error: 'unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'invalid json' }, { status: 400 })
  }
  const raw = typeof (body as { name?: unknown })?.name === 'string' ? (body as { name: string }).name : ''
  const name = raw.replace(/\s+/g, ' ').trim().slice(0, 80)
  if (!name) return Response.json({ error: 'Enter a name.' }, { status: 400 })

  try {
    await setOwnerName(getSql(), ownerId, name)
    return Response.json({ ok: true, name })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[auth] set name failed:', e)
    return Response.json({ error: 'could not save name' }, { status: 500 })
  }
}
