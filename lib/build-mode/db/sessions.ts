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
  const s = (await sql`
    INSERT INTO sessions (owner_id, title, idea, entry_point)
    VALUES (${input.ownerId}, ${input.title}, ${input.idea}, ${input.entryPoint})
    RETURNING id`) as { id: number }[];
  const sessionId = Number(s[0].id);
  const v = (await sql`
    INSERT INTO versions (session_id, version_no, qa_json, blueprint_md, files_json)
    VALUES (${sessionId}, 1, ${JSON.stringify(input.qa)}, ${input.blueprint}, ${JSON.stringify(input.files)})
    RETURNING id`) as { id: number }[];
  return { sessionId, versionId: Number(v[0].id), versionNo: 1 };
}

export interface QAItem {
  move: string;
  question: string;
  response: string;
}

export interface VersionDetail {
  id: number;
  versionNo: number;
  createdAt: string;
  qa: QAItem[];
  blueprint: string;
  files: Record<string, string>;
}

export interface SessionDetail {
  id: number;
  title: string;
  idea: string;
  createdAt: string;
  versions: VersionDetail[];
}

const asJson = <T,>(v: unknown): T => (typeof v === "string" ? JSON.parse(v) : (v as T));

export async function getSessionWithVersions(
  sql: SqlClient,
  ownerId: number,
  sessionId: number,
): Promise<SessionDetail | null> {
  const s = (await sql`
    SELECT id, title, idea, created_at FROM sessions
    WHERE id = ${sessionId} AND owner_id = ${ownerId}`) as {
    id: number;
    title: string;
    idea: string;
    created_at: string;
  }[];
  if (!s.length) return null;
  const vs = (await sql`
    SELECT id, version_no, created_at, qa_json, blueprint_md, files_json
    FROM versions WHERE session_id = ${sessionId}
    ORDER BY version_no DESC`) as {
    id: number;
    version_no: number;
    created_at: string;
    qa_json: unknown;
    blueprint_md: string;
    files_json: unknown;
  }[];
  return {
    id: Number(s[0].id),
    title: s[0].title,
    idea: s[0].idea,
    createdAt: String(s[0].created_at),
    versions: vs.map((v) => ({
      id: Number(v.id),
      versionNo: Number(v.version_no),
      createdAt: String(v.created_at),
      qa: asJson<QAItem[]>(v.qa_json),
      blueprint: v.blueprint_md,
      files: asJson<Record<string, string>>(v.files_json),
    })),
  };
}

// Append the next version to an existing session (used by Enhance). Computes
// version_no = max + 1 atomically in the insert. `qa` is the full concatenated
// history (prior + enhance answers).
export async function addVersion(
  sql: SqlClient,
  sessionId: number,
  qa: { move: string; question: string; response: string }[],
  blueprint: string,
  files: Record<string, string>,
): Promise<{ versionId: number; versionNo: number }> {
  const rows = (await sql`
    INSERT INTO versions (session_id, version_no, qa_json, blueprint_md, files_json)
    SELECT ${sessionId},
           COALESCE(MAX(version_no), 0) + 1,
           ${JSON.stringify(qa)}, ${blueprint}, ${JSON.stringify(files)}
    FROM versions WHERE session_id = ${sessionId}
    RETURNING id, version_no`) as { id: number; version_no: number }[];
  await sql`UPDATE sessions SET updated_at = now() WHERE id = ${sessionId}`;
  return { versionId: Number(rows[0].id), versionNo: Number(rows[0].version_no) };
}

// Delete a session (and its versions via ON DELETE CASCADE), scoped to owner.
// Returns the number of session rows removed (0 if not found / not owned).
export async function deleteSession(
  sql: SqlClient,
  ownerId: number,
  sessionId: number,
): Promise<number> {
  const rows = (await sql`
    DELETE FROM sessions WHERE id = ${sessionId} AND owner_id = ${ownerId}
    RETURNING id`) as { id: number }[];
  return rows.length;
}

export async function listSessions(sql: SqlClient, ownerId: number): Promise<SessionSummary[]> {
  const rows = (await sql`
    SELECT s.id, s.title, s.updated_at,
           (SELECT count(*) FROM versions v WHERE v.session_id = s.id) AS version_count
    FROM sessions s
    WHERE s.owner_id = ${ownerId}
    ORDER BY s.updated_at DESC`) as {
    id: number;
    title: string;
    updated_at: string;
    version_count: number;
  }[];
  return rows.map((r) => ({
    id: Number(r.id),
    title: r.title,
    updatedAt: String(r.updated_at),
    versionCount: Number(r.version_count),
  }));
}
