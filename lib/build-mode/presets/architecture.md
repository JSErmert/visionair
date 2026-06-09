<!-- [preset] VALIDATED DEFAULT for the Next.js/TS/Vercel house stack — verify against THIS app; flag any mismatch as a gap in docs/context/07-known-gaps.md. Authority: see citations inline. -->

# 05 — Architecture Baseline

> Authority: 12-Factor App (Heroku, Wiggins/Beyer); Michael Nygard — "Documenting Architecture Decisions" (2011); Next.js Project Structure docs; Fowler ADR catalog.

---

## Principles

1. **One codebase, many deploys** — a single version-controlled repo per app. No branching per environment. Config in environment variables (12-Factor III).
2. **Explicit dependencies** — all dependencies declared in `package.json`, reproducible via `npm ci`. No ambient globals.
3. **Config in the environment** — nothing that varies between deploys belongs in code. See `SETUP.md` and `.env.example`.
4. **Stateless processes** — server processes do not hold in-memory state between requests. State lives in the data layer (DB, cache, queue).
5. **Decisions are documented** — any architectural choice with consequences that are hard to reverse gets an ADR. Short ADRs are better than no ADRs.

---

## Next.js Conventions (App Router)

| Layer | Rule |
|---|---|
| `app/` | Routing only — layouts, pages, loading/error shells. No business logic here. |
| `app/api/` | API routes. Thin handlers — parse request, delegate to domain layer, return response. |
| Server Components | Default. Fetch data here. Never pass sensitive data as props to Client Components. |
| Client Components | Opt-in (`"use client"`). UI interactivity only. No direct DB access. |
| Validation | At the boundary — API routes and Server Actions validate all inputs (Zod recommended). Never trust client-sent data. |
| Server Actions | `"use server"` directives. Validate inputs, scope all DB queries to the authenticated user (see `06-security.md`). |

### GAP: Folder taxonomy
This preset does NOT prescribe a fixed folder structure (e.g. `services/`, `domain/`, `lib/`). A fixed skeleton fights the App Router's colocation model and over-abstracts v1 apps. **Elicit the actual module boundaries** from `docs/context/03-spec.md` and decide the folder layout as a tracked ADR. Track in `docs/context/07-known-gaps.md` until resolved.

---

## ADR Template (Nygard)

Create one file per decision under `docs/decisions/` (e.g. `docs/decisions/001-database-choice.md`):

```markdown
# ADR-NNN — [Short decision title]

**Status:** [Proposed | Accepted | Superseded by ADR-NNN | Deprecated]
**Date:** YYYY-MM-DD
**Deciders:** [names or roles]

## Context

[What is the issue motivating this decision? What forces are at play?]

## Decision

[The change we are making, stated in active voice: "We will..."]

## Consequences

**Positive:**
- [benefit 1]

**Negative / trade-offs:**
- [cost or constraint 1]

**Neutral:**
- [neutral consequence]
```

---

## Supply-Chain Integrity

- Pin all production dependencies to exact versions in `package-lock.json` (committed).
- Use `npm ci` (not `npm install`) in CI and deployment pipelines.
- Declare `engines` in `package.json` to pin the Node.js version.
- Dependabot (grouped updates, weekly) keeps dependencies current — see `.github/dependabot.yml`.
