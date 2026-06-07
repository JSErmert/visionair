import { NextRequest } from 'next/server'
import { z } from 'zod'
import { handleBuild, BuildRequest } from '@/lib/build-mode/handler'
import { anthropicAskLLM } from '@/lib/build-mode/llm'

export const runtime = 'nodejs'

// ============================================================================
// Input schema — Zod validation (per SECURITY.md §4 + house conventions)
// ============================================================================

const AnswerSchema = z.object({
  move: z.string().max(64),
  question: z.string().max(2000),
  response: z.string().max(4000),
})

const BuildRequestSchema = z
  .object({
    action: z.enum(['question', 'pack']),
    idea: z.string().min(1).max(4000),
    answers: z.array(AnswerSchema).max(64).default([]),
    opus: z.boolean().optional(),
  })
  .strict()

// ============================================================================
// POST handler
// ============================================================================

export async function POST(req: NextRequest) {
  // 1. API key check — fail fast
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'server not configured' }, { status: 503 })
  }

  // 2. Parse + validate body
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return Response.json({ error: 'invalid json' }, { status: 400 })
  }

  const parsed = BuildRequestSchema.safeParse(raw)
  if (!parsed.success) {
    return Response.json(
      { error: 'invalid request', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const body = parsed.data

  // 3. Wire up LLMs and delegate to handler
  const questionLLM = anthropicAskLLM({ model: 'claude-sonnet-4-6', maxTokens: 400 })
  const synthLLM = anthropicAskLLM({
    model: body.opus ? 'claude-opus-4-7' : 'claude-sonnet-4-6',
    maxTokens: 2000,
  })

  const buildReq: BuildRequest = {
    action: body.action,
    idea: body.idea,
    answers: body.answers as BuildRequest['answers'],
  }

  try {
    const res = await handleBuild(buildReq, { questionLLM, synthLLM })
    if (res.kind === 'pack') {
      return new Response(Buffer.from(res.zip), {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': 'attachment; filename="build-mode-pack.zip"',
        },
      })
    }
    return Response.json(res)
  } catch (e) {
    return Response.json({ error: 'build failed' }, { status: 500 })
  }
}
