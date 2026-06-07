# Gate 1 — Preset-Corpus Validation (triangulated)

**Date:** 2026-06-07
**Status:** Validated — unblocks Plan 2 preset authoring
**Method:** Source-isolated triangulation — Implementation witness (operator's house-stack repos: VisionAir, jacques, mediCalm), Literature witness (external standards: OWASP, GitHub, 12-Factor, SLSA, Fowler/Dodds), Adversarial witness (attack the preset corpus). See `2026-06-05-build-mode-seed-pattern.md` + `2026-06-05-build-mode-design.md` §"Preset corpus".

## Verdict

The **safe-to-preset core is validated** — but the gate caught **four outright falsehoods** in the habitual presets and one **meta-reframe** that is the highest-leverage fix. Net: do NOT bake app-specific security *values* as authoritative; preset only the **uniform-safe baselines**, **elicit / GAP-flag** the app-specific ones, and **correct the four falsehoods**.

## META-RULE (highest leverage — applies to the whole corpus)

Presets are **"validated defaults to verify against THIS app" — NOT ground truth.** `CLAUDE.md` MUST instruct the coding agent to **detect preset↔app mismatch and emit an explicit GAP** (into `07-known-gaps.md`) rather than silently comply. This converts every wrong-for-this-app default from a hidden vulnerability into a visible question. It composes with the engine's existing **reconciliation pass** + **deviation-flagging**. Without this reframe, "authoritative" presets make the agent *defend* a wrong default instead of fixing it.

*(Spec implication: update `06-security.md` / `CLAUDE.md` preset wording from "authoritative" → "validated default; flag mismatch as a gap." Fold into the design spec.)*

## The four falsehoods to CORRECT (worse-than-nothing today)

1. **Generic CSP** — a one-size CSP is either permissive-junk (`'unsafe-inline' 'unsafe-eval'`) or breaks the app on first 3rd-party script. Nonce-CSP also forces dynamic rendering (defeats Vercel ISR/PPR caching — documented Next.js tradeoff). → **Elicit the per-app source allowlist; ship a GAP, not a baked value.**
2. **In-memory rate limiting on serverless** — does not work across Vercel Lambda invocations/regions; gives false confidence. → **Reference the serverless-correct pattern (Upstash/Redis/KV or Vercel WAF); elicit thresholds; GAP the implementation.**
3. **Tag-"pinned" actions (`@v4`, `@master`)** — tags are mutable; this is the exact tag-hijack vector "pinning" claims to stop (0/3 repos actually SHA-pin). → **Pin every action by full commit SHA** (GitHub now supports policy enforcement).
4. **Hard coverage gate + `npm audit` failing the build** — both train teams to disable/ignore the security signal (Fowler/Dodds: coverage is a guide, not a goal; `npm audit` is high-noise/advisory). → **Coverage report-only (no hard threshold); `npm audit` report-only; rely on Dependabot + Trivy/CI for gating.**

## Per-dimension validated decisions

| Dimension | SAFE to preset uniformly (validated) | ELICIT / GAP-flag (app-specific) | Authority |
|---|---|---|---|
| **Security headers** | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'`, `Referrer-Policy`, lean `Permissions-Policy`, **HSTS *without* preload**, `X-Powered-By` stripped | **CSP source allowlist**, **HSTS `preload`**, per-app threat model | OWASP Secure Headers; Next.js CSP docs |
| **Secrets** | server-only secrets; **no secrets in `NEXT_PUBLIC_*`**; `.env.example`; secret-scan (gitleaks) CI + push-protection | which secrets exist | OWASP A02:2025; 12-Factor III |
| **AuthZ / app-sec** *(NEW — was missing)* | **data-layer authz scoping** principle (every query scoped to the principal), **CSRF** guidance for cookie/session mutations + Server Actions, **SSRF guard** + **webhook-signature verification** for any server fetch | the actual auth model, tenancy | OWASP A01:2025; ASVS |
| **Rate limiting** | "needs external store on serverless" pattern note | thresholds + impl | OWASP ASVS 6.1.1 |
| **Prompt-injection** | only if app uses an LLM: output-as-untrusted, no secrets in system prompt, tool allowlist, human-in-loop for side effects | whether app has an LLM at all | (Build Mode's own SECURITY.md lineage) |
| **CI/CD** | top-level **`permissions: contents: read`** (least-privilege token), `npm ci`, gitleaks, Dependabot (grouped), **SHA-pinned actions**, `pull_request` (never `pull_request_target` w/ secrets), wire the actual test run, `concurrency: cancel-in-progress` | — | GitHub Actions secure-use; SLSA |
| **Trivy + SARIF** | — | **conditional** on repo visibility (SARIF needs code-scanning, not free on private repos) + containerization (Trivy ≈ low-signal on non-Docker JS) | GitHub code-scanning docs |
| **Pre-commit** | secret + large-file + format hooks, **always backed by CI** (local hooks are `--no-verify`-bypassable); enforced install step | **mechanism**: prefer JS-native **Husky + lint-staged** for a JS/TS app (do NOT assume the Python `pre-commit` framework) | pre-commit.org; gitleaks |
| **Architecture** | a **principles set + ADR template** (Nygard: Title/Status/Context/Decision/Consequences) + Next.js conventions (app/ = routing only, colocation, server/client boundary, where validation lives) | the folder taxonomy (do NOT bake a fixed layer skeleton — fights App Router, over-abstracts v1) | 12-Factor; Next.js project-structure; Fowler ADR |
| **Testing** | Vitest + Testing Library, **integration-weighted (Testing Trophy)**, "test the money/authz/validation paths first" | coverage threshold (report-only), whether Playwright/E2E is required (conditional on UI surface) | Dodds Testing Trophy; Fowler TestPyramid/Coverage |
| **Supply-chain** | committed lockfile + `npm ci`, Dependabot grouped, SHA-pinned actions, `engines` pin; optionally `npm publish --provenance` (SLSA L2) if publishing | `npm audit` gating (report-only) | SLSA v1.0; OWASP A03:2025 |
| **Workflow** | durable spec→plan→TDD→review→verify inline (works plugin-free) + **right-sizing rule** (scale rigor to app risk) | — | Beck TDD; Fowler |
| **Superpowers refs** | strictly **optional/conditional** accelerator references | never assume installed (couples to operator env) | (design decision, confirmed) |

## Genuinely-missing baselines to ADD (safe to preset uniformly)

CSRF guidance · data-layer authz scoping · no-secrets-in-`NEXT_PUBLIC_*` · `.env.example` · SSRF + webhook-signature guards · least-privilege `GITHUB_TOKEN` · `npm ci` · SHA-pinned actions · the "challenge-the-preset / emit-GAP" instruction (meta-rule).

## Cross-cutting caveats (from Literature)

- **OWASP Top 10 is now 2025** (Security Misconfiguration → #2; **Software Supply Chain Failures** new at A03). Cite 2025, not 2021.
- **Nonce-CSP ⊥ Vercel caching** — strict nonce CSP forces dynamic rendering; real tradeoff, document it.
- **Pyramid vs Trophy is an unsettled standards disagreement** — for Next.js, the Trophy (integration-weighted) is the better fit.
- **Local hooks are bypassable** — always back with CI + push protection.

## Output for Plan 2 (preset authoring)

Author the `presets/` library as **two tiers**: (1) `[preset]` uniform-safe files (headers-minus-CSP-value, CI with SHA-pins + least-priv token, pre-commit via Husky, ADR template, Trophy testing guidance, WORKFLOW, supply-chain) each **citing its authority**; (2) `[elicited]`/`[open]` placeholders the engine fills or GAP-flags (CSP allowlist, HSTS preload, threat model, rate-limit thresholds, coverage threshold, E2E inclusion, Trivy/SARIF conditionality, architecture taxonomy). Every preset file header carries the meta-rule: *"validated default — verify against this app; flag mismatch as a gap."*
