import { NextRequest } from 'next/server'
import { z } from 'zod'
import { handleBuild, BuildRequest } from '@/lib/build-mode/handler'
import { anthropicAskLLM } from '@/lib/build-mode/llm'
import { DEPTH_MOVES } from '@/lib/build-mode/types'
import { LIMITS } from '@/lib/build-mode/limits'
import { getOwnerId } from '@/lib/build-mode/server-auth'
import { getSql } from '@/lib/build-mode/db/client'
import { createSessionWithV1, updateSessionSummary } from '@/lib/build-mode/db/sessions'
import { generateTitle } from '@/lib/build-mode/title'
import { summarizeSession } from '@/lib/build-mode/summarize'

export const runtime = 'nodejs'

// ============================================================================
// Input schema — Zod validation (per SECURITY.md §4 + house conventions)
// ============================================================================

const AnswerSchema = z.object({
  move: z.enum([...DEPTH_MOVES] as [string, ...string[]]),
  question: z.string().max(LIMITS.question),
  response: z.string().max(LIMITS.response),
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
    idea: z.string().min(1).max(LIMITS.idea),
    answers: z.array(AnswerSchema).max(64).default([]),
    level: z.enum(['beginner', 'intermediate', 'expert']).optional(),
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
    const detail = parsed.error.issues
      .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('; ')
    return Response.json(
      { error: 'invalid request', detail, details: parsed.error.flatten() },
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
    level: body.level,
  }

  try {
    const res = await handleBuild(buildReq, { questionLLM, synthLLM })
    if (res.kind === 'pack') {
      // Persist as Version 1 only for an authenticated owner. The interview
      // itself stays open (anyone can generate a pack), but writing to the
      // library requires login. A DB hiccup must never block the download.
      let saved: { sessionId: number; versionNo: number } | undefined
      const ownerId = getOwnerId(req)
      if (ownerId !== null) {
        try {
          const title = await generateTitle(
            body.idea,
            res.files['docs/context/00-identity.md'] ?? '',
            synthLLM,
          )
          const out = await createSessionWithV1(getSql(), {
            ownerId,
            title,
            idea: body.idea,
            entryPoint: '',
            qa: body.answers,
            blueprint: res.blueprint,
            files: res.files,
          })
          saved = { sessionId: out.sessionId, versionNo: out.versionNo }
          // Best-effort library overview (current description + per-version story).
          try {
            const summary = await summarizeSession(
              body.idea,
              [{ versionNo: 1, qa: body.answers, blueprint: res.blueprint }],
              synthLLM,
            )
            if (summary) await updateSessionSummary(getSql(), out.sessionId, summary)
          } catch (e2) {
            // eslint-disable-next-line no-console
            console.error('[build] summary failed:', e2)
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('[build] persist failed:', e)
        }
      }
      return Response.json({
        kind: 'pack',
        blueprint: res.blueprint,
        zipBase64: Buffer.from(res.zip).toString('base64'),
        saved,
      })
    }
    return Response.json(res)
  } catch (e) {
    // Surface the real cause. Previously this swallowed everything into an
    // opaque "build failed", which hid transient rate-limit/overload errors.
    // eslint-disable-next-line no-console
    console.error('[build] pack failed:', e)
    const detail =
      process.env.NODE_ENV !== 'production' && e instanceof Error ? e.message : undefined
    return Response.json({ error: 'build failed', detail }, { status: 500 })
  }
}
