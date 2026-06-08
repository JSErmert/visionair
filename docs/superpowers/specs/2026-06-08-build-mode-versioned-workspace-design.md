# Build Mode — Versioned Workspace + Enhance Mode (Design Spec)

**Date:** 2026-06-08
**Status:** Approved design (pending spec review)
**Branch context:** `feat/build-mode-context-engine` (worktree)

## Goal

Turn VisionAir Build Mode from a one-shot pack generator into a **durable, versioned workspace**: every completed session is saved server-side, viewable in an OG-styled library, and improvable via an **Enhance** loop that asks the highest-leverage gap-filling questions and produces a new version of the pack — so Claude Code receives the strongest possible blueprint + context pack.

## Architecture decisions (locked)

| Decision | Choice |
|---|---|
| Storage | **Server-side**, Neon Postgres via Vercel Marketplace |
| Auth | **Single-user gate** now; schema + APIs multi-tenant-ready |
| Misrouting fix | **Deeper routing + gap-extraction pass** in synthesis |
| Enhance regeneration | **Incremental** — resolve gaps first, then strengthen weak mds; strong files preserved |
| Zip storage | Never stored; `files_json` persisted, zip regenerated on download |

## Build order (4 independently shippable slices)

Each slice produces working, testable software and is its own plan.

0. **Routing + gap-extraction fix** (synthesizer only; no UI/DB)
1. **Persistence foundation** (Postgres + auth gate + auto-save + LLM title)
2. **Library/log UX** (list → session → versions, read-only, OG style)
3. **Enhance mode** (audit → highest-leverage loop → Finish → incremental version)

Rationale for order: Slice 0 makes V1 *correct before we store it*; persistence (1) precedes the views (2) that read it; enhance (3) depends on stored versions.

---

## Slice 0 — Routing + gap-extraction fix

### Problem (root cause, code-confirmed)

The interview walks a fixed set of six depth-moves (`identity, non-negotiables, doctrine, contracts, core-logic, security`). `nextQuestion` picks the first pending move and frames a question for it; `synthesize` hard-maps each move to exactly one file (`MOVE_ARTIFACT`). Two faults:

1. **One answer → one file, blind to content.** A cross-cutting answer (positioning + private-work disclosure + verify-items) is written entirely to the single mapped file. In the run-3 portfolio walk, the honesty/positioning answer was generated under the **security** move (framing: *"gently surface what's sensitive… what you'd never want to go wrong"*) and the whole answer landed in `06-security.md`.
2. **Known-gaps captures only *uncovered moves*, never flagged content inside answers.** `synthesize` adds a move to known-gaps only when its status is `unknown`/`pending`. Explicit "verify before publish / don't quantify / uncertain" items raised inside a real answer are lost into prose, so the file reads "None — every dimension was covered."

### Design

Three coordinated changes (all in `lib/build-mode/`):

1. **Tighten the `security` move framing** in `interview.ts` so it elicits genuine sensitivity/security content and does not absorb identity/positioning answers for non-security ideas. The framing must explicitly steer toward data/secrets/abuse/failure, not self-representation.

2. **Dedicated gap-extraction pass** (new module `gaps.ts`, run inside/after `synthesize`): one LLM call that reads **all raw answers + drafted file contents** and emits a structured list of open items — each tagged (e.g. `verify`, `do-not-quantify`, `uncertain`, `decision-needed`). These populate `07-known-gaps.md`, **merged with** (not replacing) the existing "uncovered move" gaps. The pass must be JSON-output, parse-tolerant (BOM/fence-stripping like `reconcile.ts`), and must never block the pack on parse failure (degrade to "uncovered moves only").

3. **Content-routing guard** in `synthesize.ts`: the synthesis prompt for each move keeps only content germane to that dimension; a lightweight routing step lifts identity/positioning content into `00-identity.md`. One answer may legitimately contribute to more than one file. Provenance tags preserved.

### Acceptance

- A walk where an answer contains positioning + private-work disclosure + verify-items produces: positioning in `00-identity.md`, genuine disclosure in `06-security.md`, and verify-items as discrete entries in `07-known-gaps.md`.
- `07-known-gaps.md` is **non-empty** whenever any answer contains flag/verify/uncertain language.
- Existing 47 unit tests still pass; new tests cover the gap-extraction pass and the security-framing change.
- Re-running the run-3 inputs yields a pack where the "data analyst" / "describe-don't-quantify" guidance is in identity + known-gaps, not buried in security.

---

## Slice 1 — Persistence foundation

### Data model (Neon Postgres)

```sql
owners   (id PK, label TEXT, created_at TIMESTAMPTZ)
sessions (id PK, owner_id FK->owners, title TEXT, idea TEXT,
          entry_point TEXT, created_at, updated_at)
versions (id PK, session_id FK->sessions, version_no INT,
          qa_json JSONB, blueprint_md TEXT, files_json JSONB, created_at)
```

- `owners`: one seeded row now; FK present so multi-tenant is a data change, not a schema rewrite.
- `qa_json`: `{ move, question, response }[]`.
- `files_json`: the `FileMap` (`{ path: content }`). Zip regenerated on download via existing `pack()`.
- `version_no`: 1-based, increments per session; lists `ORDER BY version_no DESC`.

### Auth (single-user gate)

- A password hash stored in an env var (e.g. `BUILD_OWNER_PASSWORD_HASH`). A login route validates the password, sets an **httpOnly, signed session cookie**.
- **Middleware** protects `/build/library/*` and the persistence API routes (`/api/sessions/*`). The interview flow (`/build`) may remain open; saving requires the cookie.
- No third-party provider. Upgrade path to Auth.js / Sign in with Vercel when multi-tenant.

### Save flow

- On reaching the **blueprint** phase, the client POSTs to `/api/sessions`: create the session (first time) and **version 1** with `qa_json`, `blueprint_md`, `files_json`.
- **LLM title generation:** one cheap call (Sonnet, low max-tokens) from idea + identity content → a short human title ("Professional Portfolio Website"). Stored on `sessions.title`.
- Response returns `sessionId` + `versionId`. Blueprint screen shows `Saved as V1 · <title>` and a link to the library.
- Idempotency: saving the same blueprint twice (e.g. a retry) must not create duplicate V1s — key on a client-held `sessionId` once created.

### Acceptance

- Completing a `/build` walk persists a session + V1 row; the zip download still works (regenerated from `files_json`).
- Title is auto-generated and topic-appropriate.
- Persistence routes reject unauthenticated requests; login sets the cookie; logout clears it.
- Schema migration is checked in and runs cleanly against Neon.

---

## Slice 2 — Library / log UX

- **`/build/library`** (gated): sessions newest-first — `title · date · version count`.
- **Session view:** versions stacked newest-on-top; open any version **read-only** showing Q&A, blueprint, file list, and a **download** for that version's pack.
- **Enhance** button on the session, operating on its latest version (Slice 3).
- Visual system: reuse `ScreenShell` / `ScreenIntro` and the OG session styling. No new design language.

### Acceptance

- A saved session appears in the library with correct version count and date.
- Opening a version renders its blueprint + Q&A + file list and downloads a valid zip.
- Versions are ordered most-recent-first.

---

## Slice 3 — Enhance mode

### Flow

1. Launch from a session → seeds an enhance loop with the latest version's full state: idea, **all prior Q&A**, current `files_json`, current `blueprint_md`.
2. **Audit pass** builds a ranked queue of highest-leverage targets, in priority order:
   - **(a) Gaps first** — items from `07-known-gaps.md` + blueprint "still open".
   - **(b) Weak mds** — an LLM scores each file for thinness/specificity/missing detail; low scorers queue after gaps.
3. **Question loop:** ask the top-ranked target as one OG-voiced question at a time; the user answers; re-audit/advance. A **Finish** button is **always visible** — the loop continues asking until Finish is clicked.
4. **On Finish:** concatenate enhance Q&A onto prior Q&A; **incrementally** regenerate only affected files (resolved-gap files + strengthened weak mds) + a fresh blueprint; persist as the next `version_no` (stacked above).

### Acceptance

- Enhance presents gap-derived questions before weak-md questions.
- The loop does not terminate on its own; only Finish ends it.
- Finishing creates `version_no = prev + 1` with concatenated Q&A; files the audit didn't target are byte-identical to the prior version; targeted files are changed; a fresh blueprint is rendered.
- The new version appears above the prior one in the library.

---

## Out of scope (v1 — YAGNI)

- Multi-tenant accounts (schema ready; gate is single-user).
- Sharing / collaboration / public links.
- Hand-editing mds in the browser (Enhance is the improvement path).
- Version-to-version diff view (candidate for a later slice).

## Tech stack

Next.js 16 · TypeScript · Tailwind · Vercel · Neon Postgres (Marketplace) · `@anthropic-ai/sdk` · Vitest · JSZip · existing `lib/build-mode/*` engine.

## Open items for spec review

- Confirm auth mechanism (lightweight signed-cookie gate vs Auth.js now).
- Confirm migration tooling preference (raw SQL migration file vs a lightweight migrator).
- Confirm whether `/build` interview stays open or is also gated.
