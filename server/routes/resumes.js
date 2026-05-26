// server/routes/resumes.js — Resume CRUD routes
import express from "express";
import jwt from "jsonwebtoken";
import { getDb, isDbConnected } from "../db.js";

const router = express.Router();

// ── Auth Middleware ───────────────────────────────────────────────────────────
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized." });
  }
  try {
    const payload = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token." });
  }
}

// ── GET /api/resumes ─────────────────────────────────────────────────────────
router.get("/", auth, async (req, res) => {
  const sql = getDb();
  if (!sql) {
    return res.json({ resumes: [], mode: "localStorage" });
  }

  try {
    const resumes = await sql`
      SELECT id, name, doc_type, preset_id, font_size, section_gap, margin_gap,
             resume_data, last_modified, created_at
      FROM resumes
      WHERE user_id = ${req.userId}
      ORDER BY last_modified DESC
    `;
    res.json({ resumes, mode: "database" });
  } catch (err) {
    console.error("List resumes error:", err);
    res.status(500).json({ message: "Failed to load resumes." });
  }
});

// ── POST /api/resumes ────────────────────────────────────────────────────────
router.post("/", auth, async (req, res) => {
  const { name, docType, presetId, fontSize, sectionGap, marginGap, resumeData } = req.body;

  const sql = getDb();
  if (!sql) {
    return res.json({ id: `local-${Date.now()}`, mode: "localStorage" });
  }

  try {
    const [resume] = await sql`
      INSERT INTO resumes (user_id, name, doc_type, preset_id, font_size, section_gap, margin_gap, resume_data)
      VALUES (
        ${req.userId},
        ${name || "My Resume"},
        ${docType || "resume"},
        ${presetId || "tpl-1"},
        ${fontSize || 10.5},
        ${sectionGap || 24},
        ${marginGap || 35},
        ${JSON.stringify(resumeData || {})}
      )
      RETURNING id, name, doc_type, last_modified, created_at
    `;

    // Log activity
    await sql`
      INSERT INTO resume_activity_log (resume_id, user_id, action)
      VALUES (${resume.id}, ${req.userId}, 'created')
    `;

    res.status(201).json({ resume, mode: "database" });
  } catch (err) {
    console.error("Create resume error:", err);
    res.status(500).json({ message: "Failed to create resume." });
  }
});

// ── GET /api/resumes/:id ─────────────────────────────────────────────────────
router.get("/:id", auth, async (req, res) => {
  const sql = getDb();
  if (!sql) return res.json({ resume: null, mode: "localStorage" });

  try {
    const [resume] = await sql`
      SELECT * FROM resumes WHERE id = ${req.params.id} AND user_id = ${req.userId}
    `;
    if (!resume) return res.status(404).json({ message: "Resume not found." });
    res.json({ resume, mode: "database" });
  } catch (err) {
    res.status(500).json({ message: "Failed to load resume." });
  }
});

// ── PUT /api/resumes/:id ─────────────────────────────────────────────────────
router.put("/:id", auth, async (req, res) => {
  const { name, docType, presetId, fontSize, sectionGap, marginGap, resumeData } = req.body;

  const sql = getDb();
  if (!sql) return res.json({ success: true, mode: "localStorage" });

  try {
    await sql`
      UPDATE resumes SET
        name          = COALESCE(${name}, name),
        doc_type      = COALESCE(${docType}, doc_type),
        preset_id     = COALESCE(${presetId}, preset_id),
        font_size     = COALESCE(${fontSize}, font_size),
        section_gap   = COALESCE(${sectionGap}, section_gap),
        margin_gap    = COALESCE(${marginGap}, margin_gap),
        resume_data   = COALESCE(${resumeData ? JSON.stringify(resumeData) : null}::jsonb, resume_data),
        last_modified = NOW()
      WHERE id = ${req.params.id} AND user_id = ${req.userId}
    `;

    res.json({ success: true, mode: "database" });
  } catch (err) {
    console.error("Update resume error:", err);
    res.status(500).json({ message: "Failed to save resume." });
  }
});

// ── DELETE /api/resumes/:id ──────────────────────────────────────────────────
router.delete("/:id", auth, async (req, res) => {
  const sql = getDb();
  if (!sql) return res.json({ success: true, mode: "localStorage" });

  try {
    await sql`DELETE FROM resumes WHERE id = ${req.params.id} AND user_id = ${req.userId}`;
    res.json({ success: true, mode: "database" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete resume." });
  }
});

// ── POST /api/resumes/:id/duplicate ─────────────────────────────────────────
router.post("/:id/duplicate", auth, async (req, res) => {
  const sql = getDb();
  if (!sql) return res.json({ id: `local-${Date.now()}`, mode: "localStorage" });

  try {
    const [original] = await sql`
      SELECT * FROM resumes WHERE id = ${req.params.id} AND user_id = ${req.userId}
    `;
    if (!original) return res.status(404).json({ message: "Resume not found." });

    const [copy] = await sql`
      INSERT INTO resumes (user_id, name, doc_type, preset_id, font_size, section_gap, margin_gap, resume_data)
      VALUES (
        ${req.userId},
        ${original.name + " (Copy)"},
        ${original.doc_type},
        ${original.preset_id},
        ${original.font_size},
        ${original.section_gap},
        ${original.margin_gap},
        ${JSON.stringify(original.resume_data)}
      )
      RETURNING id, name, last_modified
    `;
    res.status(201).json({ resume: copy, mode: "database" });
  } catch (err) {
    res.status(500).json({ message: "Failed to duplicate resume." });
  }
});

// ── GET /api/resumes/user/settings ──────────────────────────────────────────
router.get("/user/settings", auth, async (req, res) => {
  const sql = getDb();
  if (!sql) return res.json({ settings: {}, mode: "localStorage" });

  try {
    const [settings] = await sql`
      SELECT gemini_key, theme FROM user_settings WHERE user_id = ${req.userId}
    `;
    res.json({ settings: settings || {}, mode: "database" });
  } catch (err) {
    res.json({ settings: {}, mode: "database" });
  }
});

// ── PUT /api/resumes/user/settings ──────────────────────────────────────────
router.put("/user/settings", auth, async (req, res) => {
  const { geminiKey, theme } = req.body;
  const sql = getDb();
  if (!sql) return res.json({ success: true, mode: "localStorage" });

  try {
    await sql`
      INSERT INTO user_settings (user_id, gemini_key, theme)
      VALUES (${req.userId}, ${geminiKey || ""}, ${theme || "dark"})
      ON CONFLICT (user_id) DO UPDATE SET
        gemini_key = COALESCE(${geminiKey}, user_settings.gemini_key),
        theme      = COALESCE(${theme}, user_settings.theme),
        updated_at = NOW()
    `;
    res.json({ success: true, mode: "database" });
  } catch (err) {
    res.status(500).json({ message: "Failed to save settings." });
  }
});

export default router;
