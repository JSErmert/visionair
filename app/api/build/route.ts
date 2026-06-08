import { NextRequest } from 'next/server'
import { z } from 'zod'
import { handleBuild, BuildRequest } from '@/lib/build-mode/handler'
import { anthropicAskLLM } from '@/lib/build-mode/llm'
import { DEPTH_MOVES } from '@/lib/build-mode/types'

export const runtime = 'nodejs'

// ============================================================================
// Input schema — Zod validation (per SECURITY.md §4 + house conventions)
// ============================================================================

const AnswerSchema = z.object({
  move: z.enum([...DEPTH_MOVES] as [string, ...string[]]),
  question: z.string().max(2000),
  response: z.string().max(4000),
})

// ============================================================================
// Best-effort, per-instance in-memory rate limit. NOT reliable on serverless
// (each Vercel Lambda has its own memory — see Gate-1 preset validation). For
// production, enforce via Vercel WAF or an external store (e.g. Upstash Redis).
// ============================================================================

const buildRateLimitMap = new Map<string, { count: number; resetAt: number }>()
const BUILD_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const BUILD_RATE_LIMIT_MAX = 40 // 40 req / IP / hour (pack triggers multiple LLM calls)

function buildRateLimitCheck(ip: string): { ok: boolean; retryAfter?: number } {
  const now = Date.now()
  const existing = buildRateLimitMap.get(ip)
  if (!existing || existing.resetAt < now) {
    buildRateLimitMap.set(ip, { count: 1, resetAt: now + BUILD_RATE_LIMIT_WINDOW_MS })
    return { ok: true }
  }
  if (existing.count >= BUILD_RATE_LIMIT_MAX) {
    return { ok: false, retryAfter: Math.ceil((existing.resetAt - now) / 1000) }
  }
  existing.count += 1
  return { ok: true }
}

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

  // 2. Rate limit (best-effort; see caveat comment above)
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  const rl = buildRateLimitCheck(ip)
  if (!rl.ok) {
    return Response.json({ error: 'rate limit exceeded' }, { status: 429 })
  }

  // 3. Parse + validate body
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

  // 4. Wire up LLMs and delegate to handler
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
      return Response.json({
        kind: 'pack',
        blueprint: res.blueprint,
        zipBase64: Buffer.from(res.zip).toString('base64'),
      })
    }
    return Response.json(res)
  } catch (e) {
    return Response.json({ error: 'build failed' }, { status: 500 })
  }
}
