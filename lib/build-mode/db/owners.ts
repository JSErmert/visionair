import { SqlClient } from "./client";

// v3 multi-tenant accounts. Each owner row is a user; sessions/versions are
// already scoped by owner_id, so this layer just creates and looks up accounts.
// Passwords are scrypt-hashed by the caller (lib/build-mode/auth.ts) — plaintext
// never reaches the database.

export interface OwnerAuth {
  id: number;
  passwordHash: string;
}

// Create a new account. Returns the new owner id. Throws on duplicate email
// (the unique index on lower(email)); callers translate that to a 409.
export async function createOwner(
  sql: SqlClient,
  email: string,
  passwordHash: string,
  label: string,
): Promise<number> {
  const rows = (await sql`
    INSERT INTO owners (label, email, password_hash)
    VALUES (${label}, ${email.toLowerCase()}, ${passwordHash})
    RETURNING id`) as { id: number }[];
  return Number(rows[0].id);
}

export interface OwnerProfile {
  id: number;
  email: string | null;
  name: string | null;
}

// The logged-in account's display profile (email + optional chosen name).
export async function getOwnerById(sql: SqlClient, id: number): Promise<OwnerProfile | null> {
  const rows = (await sql`
    SELECT id, email, name FROM owners WHERE id = ${id} LIMIT 1`) as {
    id: number;
    email: string | null;
    name: string | null;
  }[];
  if (!rows.length) return null;
  return { id: Number(rows[0].id), email: rows[0].email ?? null, name: rows[0].name ?? null };
}

// Set (or clear) the account's display name. When present, the UI shows it
// instead of the email.
export async function setOwnerName(sql: SqlClient, id: number, name: string | null): Promise<void> {
  await sql`UPDATE owners SET name = ${name} WHERE id = ${id}`;
}

// Look up an account by email for login. Returns id + stored hash, or null when
// no such email exists (or the row has no password set, e.g. the seeded operator).
export async function findOwnerByEmail(
  sql: SqlClient,
  email: string,
): Promise<OwnerAuth | null> {
  const rows = (await sql`
    SELECT id, password_hash FROM owners
    WHERE LOWER(email) = ${email.toLowerCase()} AND password_hash IS NOT NULL
    LIMIT 1`) as { id: number; password_hash: string }[];
  if (!rows.length) return null;
  return { id: Number(rows[0].id), passwordHash: rows[0].password_hash };
}
