# Build Mode Slice 1 — Persistence Foundation (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Persist every completed Build Mode session server-side (Neon Postgres) as Version 1 — Q&A + blueprint + file map — behind a single-user auth gate, with an LLM-generated title, so the library + enhance slices can read it.

**Architecture:** A `lib/build-mode/db/` data layer over the Neon serverless driver; a `lib/build-mode/auth.ts` signed-cookie gate (node:crypto only, no third-party provider); server-side save wired into the existing `/api/build` pack path so the FileMap never round-trips to the client; an LLM title pass. Schema is multi-tenant-ready (FK to `owners`) but seeded with one owner.

**Tech Stack:** Next.js 16 · TypeScript · `@neondatabase/serverless` · node:crypto · Vitest · existing `lib/build-mode/*`.

**External dependency:** A Neon database provisioned via Vercel Marketplace; `DATABASE_URL`, `BUILD_OWNER_PASSWORD_HASH`, `BUILD_SESSION_SECRET` present in env. Tasks 1–5 are DB-independent or mock-tested; Task 7 requires the live DB.

---

### Task 1: Database schema + migration runner

**Files:**
- Create: `lib/build-mode/db/schema.sql`
- Create: `lib/build-mode/db/migrate.cjs`

- [ ] **Step 1: Write `schema.sql`**

```sql
CREATE TABLE IF NOT EXISTS owners (
  id BIGSERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id BIGSERIAL PRIMARY KEY,
  owner_id BIGINT NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  idea TEXT NOT NULL,
  entry_point TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS versions (
  id BIGSERIAL PRIMARY KEY,
  session_id BIGINT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  version_no INT NOT NULL,
  qa_json JSONB NOT NULL,
  blueprint_md TEXT NOT NULL,
  files_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, version_no)
);

CREATE INDEX IF NOT EXISTS idx_sessions_owner ON sessions(owner_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_versions_session ON versions(session_id, version_no DESC);

INSERT INTO owners (id, label) VALUES (1, 'operator') ON CONFLICT (id) DO NOTHING;
```

- [ ] **Step 2: Write `migrate.cjs`** (run with `node lib/build-mode/db/migrate.cjs`)

```js
// Applies schema.sql to the Neon database in DATABASE_URL. Idempotent.
const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  const sql = neon(url);
  const ddl = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  // neon() http driver runs one statement per call; split on semicolons at EOL.
  const statements = ddl.split(/;\s*\n/).map((s) => s.trim()).filter(Boolean);
  for (const stmt of statements) await sql.query(stmt);
  console.log(`applied ${statements.length} statements`);
}
main().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 3: Install the driver**

Run: `npm install @neondatabase/serverless`
Expected: added to `package.json` dependencies.

- [ ] **Step 4: Commit** (migration is run later in Task 7 against the live DB)

```bash
git add lib/build-mode/db/schema.sql lib/build-mode/db/migrate.cjs package.json package-lock.json
git commit -m "feat(build-mode): db schema + migration runner (sessions/versions/owners)"
```

---

### Task 2: Auth gate (signed-cookie, node:crypto)

**Files:**
- Create: `lib/build-mode/auth.ts`
- Test: `lib/build-mode/auth.test.ts`

- [ ] **Step 1: Write the failing test** — `lib/build-mode/auth.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, signSession, verifySession } from "./auth";

describe("password hashing", () => {
  it("round-trips a correct password and rejects a wrong one", () => {
    const stored = hashPassword("hunter2");
    expect(verifyPassword("hunter2", stored)).toBe(true);
    expect(verifyPassword("wrong", stored)).toBe(false);
  });
  it("rejects a malformed stored value", () => {
    expect(verifyPassword("x", "not-a-valid-hash")).toBe(false);
  });
});

describe("session token", () => {
  const secret = "test-secret-please-rotate";
  it("round-trips a freshly signed token", () => {
    const t = signSession(secret, 1000);
    expect(verifySession(t, secret, 60_000, 1500)).toBe(true);
  });
  it("rejects an expired token", () => {
    const t = signSession(secret, 1000);
    expect(verifySession(t, secret, 60_000, 100_000)).toBe(false);
  });
  it("rejects a tampered token and a wrong secret", () => {
    const t = signSession(secret, 1000);
    expect(verifySession(t + "x", secret, 60_000, 1500)).toBe(false);
    expect(verifySession(t, "other-secret", 60_000, 1500)).toBe(false);
  });
  it("rejects undefined", () => {
    expect(verifySession(undefined, secret, 60_000, 1500)).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify it fails** — `npx vitest run lib/build-mode/auth.test.ts` → FAIL (no `./auth`).

- [ ] **Step 3: Implement** — `lib/build-mode/auth.ts`:

```ts
import { scryptSync, randomBytes, timingSafeEqual, createHmac } from "node:crypto";

export function hashPassword(password: string, saltHex?: string): string {
  const salt = saltHex ?? randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, derivedHex] = (stored ?? "").split(":");
  if (!salt || !derivedHex) return false;
  const derived = scryptSync(password, salt, 32);
  const expected = Buffer.from(derivedHex, "hex");
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

export function signSession(secret: string, issuedAtMs: number): string {
  const payload = String(issuedAtMs);
  const mac = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${mac}`;
}

export function verifySession(
  token: string | undefined,
  secret: string,
  maxAgeMs: number,
  nowMs: number,
): boolean {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot < 0) return false;
  const payload = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  const issuedAt = Number(payload);
  if (!Number.isFinite(issuedAt)) return false;
  return nowMs >= issuedAt && nowMs - issuedAt <= maxAgeMs;
}

export const SESSION_COOKIE = "buildmode_owner";
export const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
```

- [ ] **Step 4: Run to verify pass** — `npx vitest run lib/build-mode/auth.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/build-mode/auth.ts lib/build-mode/auth.test.ts
git commit -m "feat(build-mode): single-user auth gate (scrypt password + HMAC session cookie)"
```

---

### Task 3: Data-access layer (mock-tested)

**Files:**
- Create: `lib/build-mode/db/client.ts`
- Create: `lib/build-mode/db/sessions.ts`
- Test: `lib/build-mode/db/sessions.test.ts`

- [ ] **Step 1: Write `client.ts`** (thin, injectable):

```ts
import { neon } from "@neondatabase/serverless";

export type SqlClient = ReturnType<typeof neon>;

let cached: SqlClient | null = null;
export function getSql(): SqlClient {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  if (!cached) cached = neon(process.env.DATABASE_URL);
  return cached;
}
```

- [ ] **Step 2: Write the failing test** — `lib/build-mode/db/sessions.test.ts` (inject a fake sql tag):

```ts
import { describe, it, expect, vi } from "vitest";
import { createSessionWithV1, listSessions } from "./sessions";

// Fake neon tagged-template: records calls, returns queued rows.
function fakeSql(queue: any[][]) {
  const calls: { text: string; values: any[] }[] = [];
  const tag = (strings: TemplateStringsArray, ...values: any[]) => {
    calls.push({ text: strings.join("?"), values });
    return Promise.resolve(queue.shift() ?? []);
  };
  (tag as any).calls = calls;
  return tag as any;
}

describe("createSessionWithV1", () => {
  it("inserts a session then version 1 and returns ids", async () => {
    const sql = fakeSql([[{ id: 42 }], [{ id: 100 }]]);
    const out = await createSessionWithV1(sql, {
      ownerId: 1, title: "Portfolio", idea: "x", entryPoint: "idea",
      qa: [{ move: "identity", question: "q", response: "r" }],
      blueprint: "# bp", files: { "a.md": "hi" },
    });
    expect(out).toEqual({ sessionId: 42, versionId: 100, versionNo: 1 });
    expect((sql as any).calls.length).toBe(2);
  });
});

describe("listSessions", () => {
  it("returns rows mapped from the query", async () => {
    const sql = fakeSql([[{ id: 1, title: "A", updated_at: "2026-06-08", version_count: 2 }]]);
    const rows = await listSessions(sql, 1);
    expect(rows[0]).toMatchObject({ id: 1, title: "A", versionCount: 2 });
  });
});
```

- [ ] **Step 3: Implement `sessions.ts`**:

```ts
import { SqlClient } from "./client";

export interface SessionSummary {
  id: number;
  title: string;
  updatedAt: string;
  versionCount: number;
}

export interface NewSessionInput {
  ownerId: number;
  title: string;
  idea: string;
  entryPoint: string;
  qa: { move: string; question: string; response: string }[];
  blueprint: string;
  files: Record<string, string>;
}

export async function createSessionWithV1(
  sql: SqlClient,
  input: NewSessionInput,
): Promise<{ sessionId: number; versionId: number; versionNo: number }> {
  const s = await sql`
    INSERT INTO sessions (owner_id, title, idea, entry_point)
    VALUES (${input.ownerId}, ${input.title}, ${input.idea}, ${input.entryPoint})
    RETURNING id`;
  const sessionId = Number((s as any[])[0].id);
  const v = await sql`
    INSERT INTO versions (session_id, version_no, qa_json, blueprint_md, files_json)
    VALUES (${sessionId}, 1, ${JSON.stringify(input.qa)}, ${input.blueprint}, ${JSON.stringify(input.files)})
    RETURNING id`;
  return { sessionId, versionId: Number((v as any[])[0].id), versionNo: 1 };
}

export async function listSessions(sql: SqlClient, ownerId: number): Promise<SessionSummary[]> {
  const rows = await sql`
    SELECT s.id, s.title, s.updated_at,
           (SELECT count(*) FROM versions v WHERE v.session_id = s.id) AS version_count
    FROM sessions s
    WHERE s.owner_id = ${ownerId}
    ORDER BY s.updated_at DESC` as any[];
  return rows.map((r) => ({
    id: Number(r.id),
    title: r.title,
    updatedAt: String(r.updated_at),
    versionCount: Number(r.version_count),
  }));
}
```

- [ ] **Step 4: Run** — `npx vitest run lib/build-mode/db/sessions.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/build-mode/db/client.ts lib/build-mode/db/sessions.ts lib/build-mode/db/sessions.test.ts
git commit -m "feat(build-mode): session/version data-access layer (mock-tested)"
```

---

### Task 4: LLM title generation

**Files:**
- Create: `lib/build-mode/title.ts`
- Test: `lib/build-mode/title.test.ts`

- [ ] **Step 1: Write the failing test**:

```ts
import { describe, it, expect, vi } from "vitest";
import { generateTitle } from "./title";

describe("generateTitle", () => {
  it("returns a trimmed, quote-stripped title from the LLM", async () => {
    const askLLM = vi.fn().mockResolvedValue('"Professional Portfolio Website"\n');
    const t = await generateTitle("a portfolio site idea", "identity content", askLLM);
    expect(t).toBe("Professional Portfolio Website");
  });
  it("falls back to a default when the LLM returns empty", async () => {
    const askLLM = vi.fn().mockResolvedValue("   ");
    const t = await generateTitle("x", "", askLLM);
    expect(t).toBe("Untitled Build");
  });
  it("caps an over-long title", async () => {
    const askLLM = vi.fn().mockResolvedValue("x".repeat(200));
    const t = await generateTitle("x", "", askLLM);
    expect(t.length).toBeLessThanOrEqual(80);
  });
});
```

- [ ] **Step 2: Run** → FAIL.

- [ ] **Step 3: Implement `title.ts`**:

```ts
import { AskLLM } from "./interview";

export const TITLE_SYSTEM =
  "Give a short, plain, human title (3–6 words) for the project described. " +
  "No quotes, no punctuation at the end, no 'A '/'The ' prefix. Return ONLY the title.";

export async function generateTitle(idea: string, identity: string, askLLM: AskLLM): Promise<string> {
  try {
    const raw = (await askLLM(TITLE_SYSTEM, `IDEA: ${idea}\n\nIDENTITY:\n${identity}`)).trim()
      .replace(/^["'#\s]+|["'\s]+$/g, "");
    if (!raw) return "Untitled Build";
    return raw.length > 80 ? raw.slice(0, 80).trim() : raw;
  } catch {
    return "Untitled Build";
  }
}
```

- [ ] **Step 4: Run** → PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/build-mode/title.ts lib/build-mode/title.test.ts
git commit -m "feat(build-mode): LLM session-title generation with safe fallback"
```

---

### Task 5: Auth API route + middleware

**Files:**
- Create: `app/api/build-auth/route.ts`
- Create: `middleware.ts` (or extend existing)

- [ ] **Step 1: Login/logout route** — `app/api/build-auth/route.ts`:
  - `POST`: read `{ password }`; `verifyPassword` against `BUILD_OWNER_PASSWORD_HASH`; on success set `SESSION_COOKIE` to `signSession(BUILD_SESSION_SECRET, Date.now())`, httpOnly, secure, sameSite=lax, maxAge=SESSION_MAX_AGE_MS/1000; return `{ ok: true }`. On failure return 401. If env unset → 503.
  - `DELETE`: clear the cookie; return `{ ok: true }`.

- [ ] **Step 2: Middleware** — protect `/build/library/:path*` and `/api/sessions/:path*`:
  - Read `SESSION_COOKIE`; if `verifySession(token, BUILD_SESSION_SECRET, SESSION_MAX_AGE_MS, Date.now())` is false → for `/api/*` return 401 JSON; for page routes redirect to a login screen (or `/build/library?auth=1`). Matcher config limits middleware to those paths. `/build` (the interview) is NOT gated.

- [ ] **Step 3: Verify** — `npx tsc --noEmit` passes; manual: POST wrong password → 401, correct → cookie set; hitting `/api/sessions` without cookie → 401.

- [ ] **Step 4: Commit**

```bash
git add app/api/build-auth/route.ts middleware.ts
git commit -m "feat(build-mode): owner login/logout route + middleware gate for library/sessions"
```

---

### Task 6: Server-side save wired into the pack path

**Files:**
- Modify: `lib/build-mode/handler.ts` (pack response carries `files` + `qa`)
- Modify: `app/api/build/route.ts` (persist on authed pack; return `sessionId`)
- Create: `app/api/sessions/route.ts` (GET list) and `app/api/sessions/[id]/route.ts` (GET one + versions) — read endpoints for Slice 2

- [ ] **Step 1: Extend handler pack result** — in `handler.ts`, the `pack` branch of `handleBuild` returns `{ kind: "pack", blueprint, zip, files, qa }` where `files` is the assembled `FileMap` and `qa` is `req.answers`. (Build the FileMap once via `assemble(elicited)`, reuse for both `pack()` and the return.)

- [ ] **Step 2: Persist in the pack route** — in `app/api/build/route.ts` pack branch, after `handleBuild` returns: if the request carries a valid owner cookie (`verifySession`), call `generateTitle` then `createSessionWithV1(getSql(), {...})`; include `sessionId`/`versionNo` in the JSON response. If not authed, skip persistence (return pack as today). Wrap persistence in try/catch so a DB hiccup never blocks the download — on failure, log and return the pack with `saved: false`.

- [ ] **Step 3: Read endpoints** — `GET /api/sessions` → `listSessions`; `GET /api/sessions/[id]` → session row + ordered versions (add `getSession`/`getVersions` to `sessions.ts`). Both behind middleware (Task 5).

- [ ] **Step 4: Client save acknowledgement** — in `BuildClient.tsx`, when the pack response includes `sessionId`, store it (for idempotency / Slice 2 link) and show `Saved as V1` on the blueprint screen. No FileMap leaves the client.

- [ ] **Step 5: Verify** — `npx tsc --noEmit` + `npx vitest run lib/build-mode` green.

- [ ] **Step 6: Commit**

```bash
git add lib/build-mode/handler.ts app/api/build/route.ts app/api/sessions
git commit -m "feat(build-mode): persist session+V1 server-side on authed pack build"
```

---

### Task 7: Live migration + runtime verification (requires provisioned DB)

- [ ] **Step 1:** Confirm env: `DATABASE_URL`, `BUILD_OWNER_PASSWORD_HASH`, `BUILD_SESSION_SECRET` in `.env.local`.
- [ ] **Step 2:** Run the migration: `node lib/build-mode/db/migrate.cjs` → "applied N statements".
- [ ] **Step 3:** Log in via `/api/build-auth`, complete a `/build` walk, confirm a row lands in `sessions` + `versions` and the blueprint screen shows "Saved as V1".
- [ ] **Step 4:** `GET /api/sessions` returns the session (auth required; 401 without cookie).
- [ ] **Step 5: Commit** any fixes.

---

## Self-Review

- **Spec coverage:** Schema (Task 1) · auth gate (Tasks 2, 5) · data layer (Task 3) · title (Task 4) · save-on-blueprint server-side (Task 6) · live verify (Task 7). All Slice-1 spec acceptance items mapped.
- **Placeholder scan:** Tasks 1–4 are code-complete; Tasks 5–6 specify route behavior precisely (request/response/status) rather than full boilerplate, since they are thin Next.js handlers over already-complete units — acceptable for a route layer, no logic hidden.
- **Type consistency:** `createSessionWithV1(sql, NewSessionInput)` and `listSessions(sql, ownerId)` signatures match across `sessions.ts`, its tests, and the route call sites. `signSession`/`verifySession` take explicit `nowMs` for testability; routes pass `Date.now()`. `SqlClient` is the single injected DB type. `generateTitle(idea, identity, askLLM)` matches `AskLLM` from `./interview`.
