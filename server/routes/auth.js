// server/routes/auth.js — Authentication routes
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDb, isDbConnected } from "../db.js";

const router = express.Router();
const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = "7d";

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

// ── GET /api/auth/status ─────────────────────────────────────────────────────
// Returns whether the DB is connected (frontend checks this on load)
router.get("/status", (req, res) => {
  res.json({
    dbConnected: isDbConnected(),
    mode: isDbConnected() ? "database" : "localStorage",
  });
});

// ── POST /api/auth/signup ────────────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ message: "Name, email and password are required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  const sql = getDb();
  if (!sql) {
    // DB not connected — return mock user (localStorage mode)
    const mockUser = { id: `local-${Date.now()}`, name: name.trim(), email: email.toLowerCase().trim() };
    const token = signToken(mockUser.id);
    return res.json({ user: mockUser, token, mode: "localStorage" });
  }

  try {
    // Check if email exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase().trim()}`;
    if (existing.length > 0) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const [user] = await sql`
      INSERT INTO users (name, email, password_hash)
      VALUES (${name.trim()}, ${email.toLowerCase().trim()}, ${hash})
      RETURNING id, name, email, created_at
    `;

    // Create default user settings
    await sql`INSERT INTO user_settings (user_id) VALUES (${user.id}) ON CONFLICT DO NOTHING`;

    const token = signToken(user.id);

    // Store session in DB
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await sql`
      INSERT INTO user_sessions (user_id, token, expires_at)
      VALUES (${user.id}, ${token}, ${expiresAt.toISOString()})
    `;

    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email },
      token,
      mode: "database",
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Failed to create account. Please try again." });
  }
});

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const sql = getDb();
  if (!sql) {
    return res.status(503).json({ message: "Database not connected. Use guest access or configure Neon." });
  }

  try {
    const [user] = await sql`
      SELECT id, name, email, password_hash FROM users WHERE email = ${email.toLowerCase().trim()}
    `;

    if (!user) {
      return res.status(401).json({ message: "No account found with this email." });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    const token = signToken(user.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Store session
    await sql`
      INSERT INTO user_sessions (user_id, token, expires_at)
      VALUES (${user.id}, ${token}, ${expiresAt.toISOString()})
    `;

    // Clean up old expired sessions for this user
    await sql`DELETE FROM user_sessions WHERE user_id = ${user.id} AND expires_at < NOW()`;

    res.json({
      user: { id: user.id, name: user.name, email: user.email },
      token,
      mode: "database",
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const sql = getDb();
    if (!sql) {
      // In localStorage mode, trust the JWT payload
      return res.json({ user: { id: payload.userId }, mode: "localStorage" });
    }

    // Verify session is still valid in DB
    const [session] = await sql`
      SELECT s.id, u.id as user_id, u.name, u.email
      FROM user_sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token = ${token} AND s.expires_at > NOW()
    `;

    if (!session) {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }

    res.json({
      user: { id: session.user_id, name: session.name, email: session.email },
      mode: "database",
    });
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
});

// ── POST /api/auth/logout ────────────────────────────────────────────────────
router.post("/logout", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (token) {
    const sql = getDb();
    if (sql) {
      await sql`DELETE FROM user_sessions WHERE token = ${token}`.catch(() => {});
    }
  }

  res.json({ success: true });
});

// ── PUT /api/auth/change-password ────────────────────────────────────────────
router.put("/change-password", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized." });
  }
  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Invalid password data." });
    }

    const sql = getDb();
    if (!sql) return res.status(503).json({ message: "Database not connected." });

    const [user] = await sql`SELECT password_hash FROM users WHERE id = ${payload.userId}`;
    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) return res.status(401).json({ message: "Current password is incorrect." });

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await sql`UPDATE users SET password_hash = ${newHash}, updated_at = NOW() WHERE id = ${payload.userId}`;

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to change password." });
  }
});

export default router;
