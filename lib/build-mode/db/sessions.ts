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
