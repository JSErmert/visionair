// Applies schema.sql to the Neon database in DATABASE_URL. Idempotent.
// Run from the project root: node lib/build-mode/db/migrate.cjs
const fs = require("fs");
const path = require("path");
const { neon } = require("@neondatabase/serverless");

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const sql = neon(url);
  const ddl = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  // The neon() http driver runs one statement per call; split on ";" at EOL.
  const statements = ddl
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const stmt of statements) await sql.query(stmt);
  // eslint-disable-next-line no-console
  console.log(`applied ${statements.length} statements`);
}
main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
