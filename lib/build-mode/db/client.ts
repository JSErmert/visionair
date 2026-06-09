import { neon } from "@neondatabase/serverless";

export type SqlClient = ReturnType<typeof neon>;

let cached: SqlClient | null = null;

// Lazily construct the Neon HTTP client from DATABASE_URL. The http driver is
// stateless and safe to reuse across serverless invocations.
export function getSql(): SqlClient {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  if (!cached) cached = neon(process.env.DATABASE_URL);
  return cached;
}
