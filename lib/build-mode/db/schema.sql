CREATE TABLE IF NOT EXISTS owners (
  id BIGSERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- v3 multi-tenant: per-user accounts. email/password_hash are nullable so the
-- seeded operator (id=1) stays valid; unique on lower(email) only when present.
ALTER TABLE owners ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE owners ADD COLUMN IF NOT EXISTS password_hash TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_owners_email ON owners (LOWER(email)) WHERE email IS NOT NULL;

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

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS summary TEXT;

CREATE INDEX IF NOT EXISTS idx_sessions_owner ON sessions(owner_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_versions_session ON versions(session_id, version_no DESC);

INSERT INTO owners (id, label) VALUES (1, 'operator') ON CONFLICT (id) DO NOTHING
