<!-- [preset] VALIDATED DEFAULT for the Next.js/TS/Vercel house stack — verify against THIS app; flag any mismatch as a gap in docs/context/07-known-gaps.md. Authority: see citations inline. -->

# 06 — Security Baseline

> Authority: OWASP Top 10:2025 (A01 Broken Access Control, A02 Cryptographic/Secrets, A03 Software Supply Chain Failures, A05 Security Misconfiguration); OWASP Secure Headers Project; OWASP ASVS v4; 12-Factor App §III Secrets.

---

## HTTP Security Headers

Apply in `next.config.mjs` → `headers()` for all routes:

| Header | Safe uniform value | Notes |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME sniffing |
| `X-Frame-Options` | `DENY` | Stops clickjacking; also use CSP `frame-ancestors 'none'` |
| `Content-Security-Policy` | `frame-ancestors 'none'` ONLY | See GAP below for full source allowlist |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Safe default for most apps |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Restrict unused browser APIs |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` | 2-year HSTS **without** `preload` |
| `X-Powered-By` | *(strip — set `poweredByHeader: false` in next.config)* | Hides stack fingerprint |

### GAP: CSP source allowlist
**Do NOT use a generic or placeholder CSP value.** A CSP must enumerate every legitimate content source for THIS app (scripts, styles, images, fonts, connect-src for APIs/analytics/etc.). A permissive generic CSP (`'unsafe-inline' 'unsafe-eval'`) negates protection; a strict nonce-CSP also forces dynamic rendering which disables Vercel ISR/PPR caching (documented Next.js tradeoff). **Action:** elicit the full source list and author the per-app CSP. Track in `docs/context/07-known-gaps.md` until resolved.

### GAP: HSTS preload
`preload` submits the domain to browser preload lists — a one-way permanent commitment. Do NOT add `preload` until you have verified the domain is production-stable, all subdomains support HTTPS, and you understand the removal process. Track in known-gaps.

### GAP: Rate limiting
In-memory rate limiting does not work on Vercel's serverless/edge runtime across invocations and regions — it gives false confidence with no real protection. Use an external store: **Upstash Redis KV** (recommended for Vercel) or **Vercel WAF** (enterprise). Elicit per-route thresholds. Track in known-gaps.

---

## Secrets Management

- **Server-only secrets** — all tokens, API keys, and credentials belong in environment variables loaded server-side. Never in source code.
- **No secrets in `NEXT_PUBLIC_*`** — any variable prefixed `NEXT_PUBLIC_` is bundled into the client JavaScript and visible to all users. This includes tokens, internal API URLs, and analytics keys that carry write permissions.
- **`.env.example`** — commit a `.env.example` listing every required variable name (no values) as the authoritative onboarding reference. Never commit `.env` or `.env.local`.
- **Secret scanning** — gitleaks runs in CI (see `ci.yml`) and as a pre-commit hook. GitHub push-protection MUST be enabled on the repo. Rotate any secret that was ever committed.

---

## AuthZ / App Security

### Data-layer authz scoping
Every database query MUST be scoped to the authenticated principal. Never load records by ID alone — always include the owning user/tenant identifier as a filter. A missing authz scope on a single query is an A01 Broken Access Control finding.

```ts
// CORRECT — scope every query to the caller
const post = await db.post.findUnique({ where: { id, authorId: session.userId } });

// WRONG — any authenticated user can access any record
const post = await db.post.findUnique({ where: { id } });
```

### CSRF
Cookie/session mutations and Next.js Server Actions require CSRF protection:
- Verify the `Origin` / `Referer` header on all state-changing server-side handlers.
- For Server Actions (`"use server"`): Next.js 14+ validates same-origin automatically for form-based invocations, but explicitly check for cross-origin fetch callers.
- Use `SameSite=Strict` or `SameSite=Lax` on session cookies.

### SSRF (Server-Side Request Forgery)
Any server-side `fetch()` or HTTP client call using a URL derived from user input is an SSRF risk:
- Validate and allowlist the scheme (`https` only) and destination host before fetching.
- Never forward raw user-supplied URLs to external services.

### Webhook signature verification
Any endpoint receiving webhook payloads MUST verify the provider's HMAC signature before processing:
```ts
const sig = req.headers.get("x-webhook-signature");
const expected = hmac(secret, rawBody);
if (!timingSafeEqual(sig, expected)) return new Response("Unauthorized", { status: 401 });
```
Reject the request before touching the payload if the signature is absent or invalid.

---

## Supply-Chain / CI

- Dependabot (grouped, weekly) — see `.github/dependabot.yml`.
- SHA-pinned GitHub Actions — see `.github/workflows/ci.yml`.
- `npm ci` (not `npm install`) in all CI runs — enforces lockfile.
- Trivy vulnerability scanning and SARIF upload — **conditional**; see `ci.yml` comments. SARIF upload requires GitHub code-scanning, which is not available on private repos under GitHub Free/Pro. Trivy is also lower-signal for non-containerized JS apps. Enable when applicable.

---

## Prompt Injection (if this app uses an LLM)

**Only if this app calls an LLM:**
- Treat all LLM output as untrusted before rendering or acting on it.
- Never include user-controlled content in the system prompt without sanitization.
- Maintain an explicit tool/function allowlist; never let the model call arbitrary functions.
- Require human-in-the-loop for irreversible side effects (sends, writes, deletes).

Track whether this app has an LLM in `docs/context/00-identity.md`. If it does, promote this section from advisory to required.

---

## GAP Tracker (seed)

Add app-specific security items to `docs/context/07-known-gaps.md`:

- [ ] CSP full source allowlist (required before production)
- [ ] HSTS preload decision (required before domain submission)
- [ ] Rate-limit strategy and thresholds (required for any authenticated endpoint)
- [ ] App threat model (STRIDE or equivalent)
- [ ] Auth model + tenancy pattern (drives authz scoping implementation)
- [ ] Trivy/SARIF enablement decision (depends on repo visibility + containerization)
