// server/index.js — Express API Server
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDatabase } from "./db.js";
import authRouter from "./routes/auth.js";
import resumesRouter from "./routes/resumes.js";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3001");

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:4173",
    "http://localhost:3000",
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}));

app.use(express.json({ limit: "10mb" })); // Resume data can be large

// Request logger (development)
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/resumes", resumesRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: "API route not found." });
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error." });
});

// ── Start ─────────────────────────────────────────────────────────────────────
async function start() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`\n🚀 FirstStep API Server running at http://localhost:${PORT}`);
    console.log(`   Mode: ${process.env.NEON_DATABASE_URL ? "Database (Neon)" : "localStorage fallback"}`);
    console.log(`   Frontend: http://localhost:5173\n`);
  });
}

start();
