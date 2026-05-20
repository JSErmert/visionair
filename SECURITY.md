# VisionAir — Security Standards

**Version:** 1.0 (initial, paired with ARCHITECTURE.md v1.2 incoming)
**Last updated:** 2026-05-18
**Owner:** Joshua Ermert (`jseermert@gmail.com`)

This document is two things:

1. **A security policy** — what VisionAir guarantees, what threats it defends against, how secrets and data are handled.
2. **A pre-commit code-review checklist** — Claude reads this file before every commit/push and reviews the diff against it. Any violation blocks the commit until fixed. This is the operational enforcement layer.

If you are reading this for the first time, scan §1–§5 for the policy and §10 for the checklist Claude runs.

---

## 1. Security principles

VisionAir holds to three principles, in this order:

1. **No client-side secrets, ever.** API keys, tokens, internal IDs — never reach the browser bundle. If a value is sensitive, it lives server-side only.
2. **The user's session data does not leave the browser without explicit, narrow purpose.** The deterministic v1.1.5 path is fully client-side (no network calls beyond static asset delivery). The v1.2 LLM-adaptive path sends scoped session context to Anthropic for inference, with a documented data envelope (see §6).
3. **Defense in depth.** Every security control assumes the layer above it can fail. Input validation does not trust the client. Server validation does not trust the input validator. Rate limiting does not trust authentication. CSP does not trust the absence of XSS bugs.

---

## 2. Threat model

Threats VisionAir explicitly defends against:

| Threat | Defense |
|---|---|
| Anthropic API key leakage in client bundle | Key lives only in server env vars; never imported into client components; never referenced in `'use client'` files |
| Prompt injection via user input | System prompts use explicit delimiters; user input is never directly concatenated; output is parsed structurally before use |
| Cost abuse / runaway LLM spend | Per-IP rate limit on `/api/*` routes; per-session token cap; max-tokens hard cap on each Anthropic call |
| XSS via user-input rendering | All user text rendered as React children (text nodes, not HTML); no `dangerouslySetInnerHTML`; CSP blocks inline script execution |
| Data exfiltration via XSS or compromised CDN dep | CSP `connect-src` allowlist limits where data can be sent; no third-party analytics; no third-party trackers |
| Dependency supply-chain (typosquat, malicious update) | Trivy scan in CI on every push; `npm audit` reviewed at version bump; Dependabot updates with manual review |
| MITM / TLS downgrade | HTTPS-only via Vercel; HSTS header (1y, include subdomains); no HTTP fallback |
| CSRF on API routes | API routes verify `Origin` header against allowlist; SameSite=Strict on any cookies if added |
| LocalStorage data leakage on shared machines | User-facing warning on welcome screen for shared-device use; no PII fields collected; opt-in download for permanent copies |

Threats VisionAir does NOT defend against (acknowledged scope):

- **Account compromise** — there are no accounts yet (no auth in v1.2). If/when auth lands, this list updates.
- **Targeted attacks on the operator's Anthropic API key** — protected by Anthropic's account security; rotate if compromised.
- **Physical access to the user's device** — localStorage is readable by anyone with browser access. Out of scope.

---

## 3. Secret management

### Required environment variables (production)

| Variable | Where it's set | Where it's used | What happens if missing |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Vercel Project Settings → Environment Variables (production + preview scopes); `.env.local` for dev | `app/api/*/route.ts` server functions | LLM-adaptive path disabled; deterministic v1.1.5 fallback engages |

### Rules

- Secrets MUST be set via Vercel's encrypted env-var system or local `.env.local` (which is in `.gitignore`).
- Secrets MUST NEVER be committed to git, even temporarily, even in a `*.example` file with a placeholder that resembles a real key.
- Secrets MUST NEVER appear in client components (`'use client'` files), `app/page.tsx`-flow files, or any file imported into the client bundle.
- Server-only code (`app/api/**/route.ts`) is the ONLY place secrets are accessed via `process.env`.
- Rotation: if any secret is suspected leaked, rotate immediately in Anthropic dashboard + Vercel + local; revoke the old key.

### Verification (Claude checks this on every commit)

Before any commit that touches API routes or imports `@anthropic-ai/sdk`:

1. Grep the diff for any literal string matching `sk-ant-` — block if found.
2. Grep the diff for `process.env.ANTHROPIC_API_KEY` — confirm it appears only in server-only files (`app/api/**/route.ts`).
3. Confirm `.env.local` is in `.gitignore` and was not staged.

---

## 4. Input validation

### All API routes MUST

1. Declare a schema for the request body (Zod or equivalent runtime validator).
2. Reject any request with extra fields, missing fields, or wrong types — return 400 with no detail beyond "invalid input."
3. Cap string field lengths:
   - Free-text seed input: **2048 characters max**
   - Reflection / ideal-user / version-one: **1024 characters max each**
   - Transformation before/after: **1024 characters max each**
   - Path-forward sub-fields: **512 characters max each**
4. Reject arrays larger than 32 elements (`capability` field).
5. Sanitize before logging (truncate, redact API key fragments if any appear).

### Frontend SHOULD

- Enforce the same caps client-side via `maxLength` on inputs for UX (not for security — the server is the boundary).

---

## 5. LLM-specific controls

### Prompt construction

System prompts MUST be constructed using **structural delimiters**, never raw concatenation:

```typescript
// CORRECT
const systemPrompt = `<task>...</task>\n<user_input>${escapeForXml(userText)}</user_input>`

// WRONG
const systemPrompt = `You are X. User said: ${userText}` // user can inject "Ignore previous instructions..."
```

### Output handling

LLM outputs MUST:

- Be parsed as **structured JSON** (request the LLM produce JSON output via the SDK's structured-output features) when the output drives system behavior.
- Never be passed as innerHTML or `dangerouslySetInnerHTML`.
- Never be `eval()`'d, `Function()`'d, or executed as code.
- Be displayed as React text children (which escapes HTML by default).

### Rate limits

| Route | Limit | Why |
|---|---|---|
| `/api/question` | 30 req / IP / hour | Generous for legit users; blocks scrape/abuse |
| `/api/blueprint` | 5 req / IP / hour | Heavier call (Opus); tighter cap |
| Per-session total tokens | 100k | Caps maximum cost per session |

Rate-limit storage: Vercel KV in production, in-memory Map for dev.

### Cost ceilings

- Anthropic spend monitored via Anthropic dashboard; alert configured at $50/month spend (operator email).
- If spend exceeds $50 in a calendar week without a deliberate cause, kill switch: disable `/api/*` routes via Vercel env var `LLM_DISABLED=true`, fall back to deterministic path.

---

## 6. Data privacy

### What stays on the device

The full `SessionState`, all `SavedBlueprint` records, and the active draft autosave — all live in browser `localStorage`. Nothing in this set leaves the device unless the LLM-adaptive path is enabled AND the user is in an active session.

### What is sent to Anthropic (LLM-adaptive path only)

When a user advances a step or types in a session with `/api/question` enabled:

- The current `SessionState` slice relevant to the step (NOT the full state, NOT the saved-blueprint history)
- The current step name
- A truncated turn history (last 3 turns max)

When the final Blueprint is generated via `/api/blueprint`:

- The full `SessionState` for the current session only (NOT the saved-blueprint history)

What is NOT sent:

- The user's prior saved blueprints
- Any browser-identifying data (no fingerprinting, no analytics, no cookies beyond functional)
- The user's IP (Anthropic sees the Vercel server's IP, not the user's)

### Logging

- Server-side: only structured request metadata is logged (route, status, latency, token usage) — never the user's input text.
- Anthropic-side: per Anthropic's data policy, prompts may be retained for abuse monitoring (see Anthropic's privacy policy).
- Client-side: no logging service. No Sentry. No GA. No console-logging of user text in production.

### Retention

- Browser localStorage: persists until the user clears it or uses incognito.
- Anthropic logs: per Anthropic's retention policy.
- Vercel logs: 1-day retention on free tier; longer on paid. No user-text content logged.

---

## 7. HTTP security headers

Configured in `next.config.js` and Vercel `vercel.json`:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.anthropic.com; img-src 'self' data:; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=()
```

Tailwind's inline styles require `'unsafe-inline'` in `style-src`; this is the standard tradeoff. No script `unsafe-inline` or `unsafe-eval` permitted.

---

## 8. Dependency security

### Required

- `package-lock.json` is committed (lockfile pin enforces exact versions in CI).
- Trivy scan in GitHub Actions on every push and PR — blocks merge if HIGH or CRITICAL CVE is found.
- Dependabot enabled (or weekly manual `npm audit` review).
- No `*` or `latest` in any dependency version range.

### Allowed dep changes (no extra review)

- Patch updates within the same minor version
- Type-only packages (`@types/*`)

### Required review (security maintainer approval)

- New direct dependencies
- Major version bumps of any dep
- Any change that adds a new permission, scope, or capability
- Build-tool changes (next, typescript, eslint config)

---

## 9. CI/CD security

### GitHub Actions workflow MUST

- Pin all action versions by full SHA (not tag or branch name) — defends against tag-hijack.
- Use `pull_request` trigger with restricted permissions (`contents: read`, `pull-requests: write` only when needed).
- Never run user-controlled code from PRs against secret-bearing environments. PR builds run WITHOUT access to production env vars.
- Run Trivy scan AND type-check AND `next build` AND Claude-review (see §10) before any merge to `main`.

### Vercel deployment

- Auto-deploy from `main` ONLY. Preview deploys from feature branches OK.
- Production env vars accessible only on `main` branch builds.
- Build logs are private to the org by default.

---

## 10. Pre-commit Claude review checklist

This is the operational layer. Before every `git commit` (or `git push` to main), Claude reads this checklist and reviews the diff against it. Any FAIL blocks the commit.

### Mandatory checks (FAIL → block commit)

1. **No literal API key strings.** Grep diff for `sk-ant-`, `sk_live`, `sk_test`, or any pattern matching common secret formats. FAIL if found.
2. **No `process.env.ANTHROPIC_API_KEY` outside `app/api/**/route.ts` or other server-only files.** FAIL if found in client components.
3. **No `dangerouslySetInnerHTML` introduced.** Existing usages must be reviewed; new usages FAIL unless explicitly justified in commit message AND the source is provably safe.
4. **No new `eval()`, `Function()`, or `new Function(...)` constructors.** FAIL.
5. **No new untyped `fetch()` to non-allowlisted hosts.** FAIL if a new `fetch('https://...')` targets anything other than `api.anthropic.com` or a relative `/api/*` path without explicit justification.
6. **No new dependencies added without `package-lock.json` updated and pinned exactly.** FAIL.
7. **No `console.log(userInput)` or equivalent that would log user text.** FAIL.
8. **No commented-out code containing keys, tokens, or sensitive paths.** FAIL.
9. **API route changes preserve input validation.** If a route's request body shape changes, the validator schema must also change. FAIL if route handler changes without corresponding validator update.
10. **No reduction of HTTP security headers in `next.config.js` or `vercel.json`.** FAIL if any header in §7 is weakened.

### Advisory checks (WARN → flag in commit message, don't block)

11. New TODO/FIXME comments — note them.
12. New file added without corresponding test (no test suite yet — flagged for future).
13. Significant prompt-template changes — note them in commit message for diff visibility.

### Claude review invocation

The pre-commit hook runs:

```bash
claude review --against SECURITY.md
```

(Or, if running interactively via Claude Code: `/security-review` slash command with `SECURITY.md` as the rubric.)

The reviewer agent:

1. Reads this file (`SECURITY.md`) at the start of every review.
2. Reads the staged diff.
3. Runs each mandatory check from the §10 list against the diff.
4. Returns PASS / FAIL per check + an overall verdict.
5. If FAIL: outputs which check failed, which file/line, and what to change.

---

## 11. Vulnerability disclosure

If you find a security issue in VisionAir:

- Email: jseermert@gmail.com with subject "VisionAir security"
- DO NOT open a public GitHub issue with vulnerability details
- Expected response: acknowledgment within 7 days, mitigation plan within 30 days for HIGH/CRITICAL severity

---

## 12. Changelog

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-18 | Initial SECURITY.md authored. Paired with ARCHITECTURE.md v1.2 (Beta-1.0 incoming). Threat model documented; LLM-specific controls established; pre-commit Claude review checklist defined. |

---

## Last Updated

2026-05-18 — Initial v1.0 authored covering Beta-1.0 scope (Vercel deployment + Anthropic LLM integration + GitHub Actions CI/CD + Trivy + pre-commit Claude review). Future updates: auth (when added), payment processing (if added), multi-tenant (if added).
