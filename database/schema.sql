-- ============================================================
-- FirstStep Resume Platform — Complete PostgreSQL Schema
-- Compatible with Neon (serverless Postgres)
-- Auto-run by server/db.js on startup (CREATE IF NOT EXISTS)
-- ============================================================

-- ── Core Extensions ───────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS — Authentication accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_users_updated
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- USER SESSIONS — JWT token tracking (server-side revocation)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_token   ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);

-- ============================================================
-- USER SETTINGS — Per-user configuration
-- ============================================================
CREATE TABLE IF NOT EXISTS user_settings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  gemini_key    TEXT DEFAULT '',        -- User's personal Gemini API key
  theme         TEXT DEFAULT 'dark'     CHECK (theme IN ('dark', 'light', 'system')),
  default_font  TEXT DEFAULT 'inter',
  notifications BOOLEAN DEFAULT TRUE,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RESUMES — Top-level document record (stores full data as JSONB)
-- Using JSONB for the resume data allows flexible schema
-- and avoids complex multi-table joins on every edit.
-- ============================================================
CREATE TABLE IF NOT EXISTS resumes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL DEFAULT 'My Resume',
  doc_type      TEXT NOT NULL DEFAULT 'resume' CHECK (doc_type IN ('resume', 'cv')),
  preset_id     TEXT NOT NULL DEFAULT 'tpl-1',
  font_size     NUMERIC(4,1) DEFAULT 10.5,
  section_gap   INT DEFAULT 24,
  margin_gap    INT DEFAULT 35,
  -- Full resume data as JSONB (personal, experience, projects, skills, etc.)
  resume_data   JSONB NOT NULL DEFAULT '{}',
  last_modified TIMESTAMPTZ DEFAULT NOW(),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resumes_user_id  ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_modified ON resumes(last_modified DESC);
CREATE INDEX IF NOT EXISTS idx_resumes_data_gin ON resumes USING GIN (resume_data);

CREATE OR REPLACE TRIGGER trg_resumes_modified
  BEFORE UPDATE ON resumes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- RESUME ACTIVITY LOG — Audit trail for all resume actions
-- ============================================================
CREATE TABLE IF NOT EXISTS resume_activity_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id   UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action      TEXT NOT NULL,  -- 'created' | 'updated' | 'exported_pdf' | 'exported_pptx' | 'ats_analyzed' | 'ai_tailored' | 'deleted' | 'duplicated'
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_resume ON resume_activity_log(resume_id);
CREATE INDEX IF NOT EXISTS idx_activity_user   ON resume_activity_log(user_id);

-- ============================================================
-- TEMPLATE PRESETS — User-saved custom template configurations
-- (Beyond the built-in template list)
-- ============================================================
CREATE TABLE IF NOT EXISTS template_presets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  layout       TEXT DEFAULT 'minimalist',
  font         TEXT DEFAULT 'inter',
  accent_color TEXT DEFAULT '#1e3a8a',
  spacing      TEXT DEFAULT 'regular',
  header_style TEXT DEFAULT 'default',
  is_default   BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_presets_user ON template_presets(user_id);

-- ============================================================
-- SHARED RESUMES — Public share links (future feature)
-- ============================================================
CREATE TABLE IF NOT EXISTS shared_resumes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id   UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  share_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  is_active   BOOLEAN DEFAULT TRUE,
  view_count  INT DEFAULT 0,
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shared_token ON shared_resumes(share_token);

-- ============================================================
-- DETAILED RESUME STRUCTURE TABLES
-- (Alternative normalized structure — use if you prefer
--  querying individual sections vs the JSONB approach)
-- These are optional; the JSONB resumes.resume_data table
-- is the primary store used by the app.
-- ============================================================

-- Personal Info (1:1 with resume)
CREATE TABLE IF NOT EXISTS personal_info (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id   UUID NOT NULL UNIQUE REFERENCES resumes(id) ON DELETE CASCADE,
  full_name   TEXT DEFAULT '',
  title       TEXT DEFAULT '',
  email       TEXT DEFAULT '',
  phone       TEXT DEFAULT '',
  location    TEXT DEFAULT '',
  github      TEXT DEFAULT '',
  linkedin    TEXT DEFAULT '',
  website     TEXT DEFAULT '',
  summary     TEXT DEFAULT ''
);

-- Personal custom fields (extra contact rows)
CREATE TABLE IF NOT EXISTS personal_custom_fields (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id   UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  label       TEXT NOT NULL DEFAULT '',
  value       TEXT NOT NULL DEFAULT '',
  sort_order  INT DEFAULT 0
);

-- Work experiences
CREATE TABLE IF NOT EXISTS experiences (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id   UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  company     TEXT DEFAULT '',
  role        TEXT DEFAULT '',
  location    TEXT DEFAULT '',
  start_date  TEXT DEFAULT '',
  end_date    TEXT DEFAULT '',
  is_current  BOOLEAN DEFAULT FALSE,
  sort_order  INT DEFAULT 0
);

-- Experience bullet points
CREATE TABLE IF NOT EXISTS experience_bullets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  content       TEXT NOT NULL DEFAULT '',
  sort_order    INT DEFAULT 0
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id   UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  title       TEXT DEFAULT '',
  live_link   TEXT DEFAULT '',
  github_link TEXT DEFAULT '',
  description TEXT DEFAULT '',
  is_selected BOOLEAN DEFAULT TRUE,
  sort_order  INT DEFAULT 0
);

-- Project technologies
CREATE TABLE IF NOT EXISTS project_technologies (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

-- Education
CREATE TABLE IF NOT EXISTS education (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id       UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  school          TEXT DEFAULT '',
  degree          TEXT DEFAULT '',
  field_of_study  TEXT DEFAULT '',
  gpa             TEXT DEFAULT '',
  location        TEXT DEFAULT '',
  start_year      TEXT DEFAULT '',
  end_year        TEXT DEFAULT '',
  description     TEXT DEFAULT '',
  sort_order      INT DEFAULT 0
);

-- Skills
CREATE TABLE IF NOT EXISTS skills (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id   UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT '',
  category    TEXT NOT NULL DEFAULT 'Other',
  is_selected BOOLEAN DEFAULT TRUE,
  sort_order  INT DEFAULT 0
);

-- Certificates and Awards
CREATE TABLE IF NOT EXISTS certificates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id   UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  title       TEXT DEFAULT '',
  issuer      TEXT DEFAULT '',
  issued_year TEXT DEFAULT '',
  verify_url  TEXT DEFAULT '',
  category    TEXT DEFAULT 'Certificates' CHECK (category IN ('Certificates', 'Awards')),
  sort_order  INT DEFAULT 0
);

-- Publications
CREATE TABLE IF NOT EXISTS publications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id   UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  title       TEXT DEFAULT '',
  publisher   TEXT DEFAULT '',
  pub_year    TEXT DEFAULT '',
  paper_url   TEXT DEFAULT '',
  description TEXT DEFAULT '',
  sort_order  INT DEFAULT 0
);

-- Custom user-defined sections
CREATE TABLE IF NOT EXISTS custom_sections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id   UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  title       TEXT NOT NULL DEFAULT 'Custom Section',
  sort_order  INT DEFAULT 0
);

-- Custom section entries
CREATE TABLE IF NOT EXISTS custom_section_entries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_section_id UUID NOT NULL REFERENCES custom_sections(id) ON DELETE CASCADE,
  heading           TEXT DEFAULT '',
  body              TEXT DEFAULT '',
  sort_order        INT DEFAULT 0
);

-- Section display order per resume
CREATE TABLE IF NOT EXISTS resume_section_order (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id    UUID NOT NULL UNIQUE REFERENCES resumes(id) ON DELETE CASCADE,
  section_keys TEXT[] NOT NULL DEFAULT
    ARRAY['summary','experience','projects','skills','education','certificates','publications']
);

-- Create all indexes for normalized tables
CREATE INDEX IF NOT EXISTS idx_personal_resume      ON personal_info(resume_id);
CREATE INDEX IF NOT EXISTS idx_custom_fields_resume ON personal_custom_fields(resume_id);
CREATE INDEX IF NOT EXISTS idx_experiences_resume   ON experiences(resume_id);
CREATE INDEX IF NOT EXISTS idx_bullets_exp          ON experience_bullets(experience_id);
CREATE INDEX IF NOT EXISTS idx_projects_resume      ON projects(resume_id);
CREATE INDEX IF NOT EXISTS idx_proj_tech_project    ON project_technologies(project_id);
CREATE INDEX IF NOT EXISTS idx_education_resume     ON education(resume_id);
CREATE INDEX IF NOT EXISTS idx_skills_resume        ON skills(resume_id);
CREATE INDEX IF NOT EXISTS idx_certs_resume         ON certificates(resume_id);
CREATE INDEX IF NOT EXISTS idx_pubs_resume          ON publications(resume_id);
CREATE INDEX IF NOT EXISTS idx_custom_sec_resume    ON custom_sections(resume_id);
CREATE INDEX IF NOT EXISTS idx_custom_entries_sec   ON custom_section_entries(custom_section_id);

-- ============================================================
-- END OF SCHEMA
-- ============================================================

/*
  ┌─────────────────────────────────────────────────────────────┐
  │  HOW TO USE WITH NEON                                       │
  ├─────────────────────────────────────────────────────────────┤
  │  1. Go to https://neon.tech and create a free project       │
  │  2. Copy your connection string from the dashboard          │
  │  3. Add it to your .env file:                               │
  │     NEON_DATABASE_URL=postgresql://user:pass@host/dbname    │
  │  4. The server auto-runs migrations on startup              │
  │  5. OR manually run: psql $NEON_DATABASE_URL -f schema.sql  │
  └─────────────────────────────────────────────────────────────┘

  ENTITY RELATIONSHIP SUMMARY:
  users
    ├── user_sessions     (login tokens)
    ├── user_settings     (theme, Gemini key)
    ├── template_presets  (saved custom templates)
    └── resumes           (documents)
          ├── resume_data (JSONB — primary store, all sections)
          ├── resume_activity_log
          ├── shared_resumes
          └── [normalized tables — optional secondary store]
                ├── personal_info + personal_custom_fields
                ├── experiences → experience_bullets
                ├── projects → project_technologies
                ├── education
                ├── skills
                ├── certificates
                ├── publications
                ├── custom_sections → custom_section_entries
                └── resume_section_order
*/
