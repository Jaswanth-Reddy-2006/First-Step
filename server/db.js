// server/db.js — Neon PostgreSQL connection layer
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config();

let _sql = null;
let _isConnected = false;

export function getDb() {
  if (!process.env.NEON_DATABASE_URL) {
    return null;
  }
  if (!_sql) {
    _sql = neon(process.env.NEON_DATABASE_URL);
    _isConnected = true;
  }
  return _sql;
}

export function isDbConnected() {
  return _isConnected && !!process.env.NEON_DATABASE_URL;
}

// Test the connection and initialize schema on startup
export async function initializeDatabase() {
  const sql = getDb();
  if (!sql) {
    console.log("⚠️  No NEON_DATABASE_URL set — running in localStorage-only mode");
    return false;
  }

  try {
    // Test connection
    await sql`SELECT 1`;
    console.log("✅ Connected to Neon PostgreSQL");
    
    // Run schema if tables don't exist
    await runMigrations(sql);
    return true;
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    _isConnected = false;
    return false;
  }
}

async function runMigrations(sql) {
  try {
    // Create all tables if they don't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email         TEXT NOT NULL UNIQUE,
        name          TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at    TIMESTAMPTZ DEFAULT NOW(),
        updated_at    TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token        TEXT NOT NULL UNIQUE,
        expires_at   TIMESTAMPTZ NOT NULL,
        created_at   TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS user_settings (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        gemini_key  TEXT DEFAULT '',
        theme       TEXT DEFAULT 'dark',
        updated_at  TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS resumes (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name          TEXT NOT NULL DEFAULT 'My Resume',
        doc_type      TEXT NOT NULL DEFAULT 'resume' CHECK (doc_type IN ('resume', 'cv')),
        preset_id     TEXT NOT NULL DEFAULT 'tpl-1',
        font_size     NUMERIC(4,1) DEFAULT 10.5,
        section_gap   INT DEFAULT 24,
        margin_gap    INT DEFAULT 35,
        resume_data   JSONB NOT NULL DEFAULT '{}',
        last_modified TIMESTAMPTZ DEFAULT NOW(),
        created_at    TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS resume_activity_log (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        resume_id   UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
        user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        action      TEXT NOT NULL,
        metadata    JSONB DEFAULT '{}',
        created_at  TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(token)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_resumes_user ON resumes(user_id)`;

    console.log("✅ Database schema initialized");
  } catch (err) {
    console.error("❌ Migration error:", err.message);
  }
}
