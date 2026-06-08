import { NextRequest } from 'next/server'
import { z } from 'zod'
import { isOwner, OWNER_ID } from '@/lib/build-mode/server-auth'
import { getSql } from '@/lib/build-mode/db/client'
import { getSessionWithVersions, addVersion } from '@/lib/build-mode/db/sessions'
import { auditPack, enhanceFinish } from '@/lib/build-mode/enhance'
import { pack } from '@/lib/build-mode/pack'
import { anthropicAskLLM } from '@/lib/build-mode/llm'
import { DEPTH_MOVES, Answer } from '@/lib/build-mode/types'
import { LIMITS } from '@/lib/build-mode/limits'

export const runtime = 'nodejs'

const AnswerSchema = z.object({
  move: z.enum([...DEPTH_MOVES] as [string, ...string[]]),
  question: z.string().max(LIMITS.question),
  response: z.string().max(LIMITS.response),
})

const Schema = z
  .object({
    action: z.enum(['audit', 'finish']),
    sessionId: z.number().int().positive(),
    answers: z.array(AnswerSchema).max(64).default([]),
  })
  .strict()

export async function POST(req: NextRequest) {
  if (!isOwner(req)) return Response.json({ error: 'unauthorized' }, { status: 401 })
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'server not configured' }, { status: 503 })
  }
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return Response.json({ error: 'invalid json' }, { status: 400 })
  }
  const parsed = Schema.safeParse(raw)
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('; ')
    return Response.json({ error: 'invalid request', detail }, { status: 400 })
  }
  const body = parsed.data

  try {
    const session = await getSessionWithVersions(getSql(), OWNER_ID, body.sessionId)
    if (!session || session.versions.length === 0) {
      return Response.json({ error: 'not found' }, { status: 404 })
    }
    const latest = session.versions[0] // newest (version_no DESC)

    if (body.action === 'audit') {
      const auditLLM = anthropicAskLLM({ model: 'claude-sonnet-4-6', maxTokens: 1500 })
      const targets = await auditPack(latest.files, auditLLM)
      return Response.json({ targets })
    }

    // finish: regenerate from prior + enhance answers, save as the next version
    const synthLLM = anthropicAskLLM({ model: 'claude-sonnet-4-6', maxTokens: 2000 })
    const { files, blueprint, qa } = await enhanceFinish(
      session.idea,
      latest.qa as unknown as Answer[],
      body.answers as unknown as Answer[],
      synthLLM,
    )
    const out = await addVersion(getSql(), body.sessionId, qa, blueprint, files)
    return Response.json({
      saved: { sessionId: body.sessionId, versionNo: out.versionNo },
      blueprint,
      zipBase64: Buffer.from(await pack(files)).toString('base64'),
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[enhance] failed:', e)
    const detail =
      process.env.NODE_ENV !== 'production' && e instanceof Error ? e.message : undefined
    return Response.json({ error: 'enhance failed', detail }, { status: 500 })
  }
}
