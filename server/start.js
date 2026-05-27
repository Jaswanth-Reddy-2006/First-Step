// server/start.js — Local Server Runner
import app from "./index.js";
import { initializeDatabase } from "./db.js";

const PORT = parseInt(process.env.PORT || "3001");

async function start() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`\n🚀 FirstStep API Server running at http://localhost:${PORT}`);
    console.log(`   Mode: ${process.env.NEON_DATABASE_URL ? "Database (Neon)" : "localStorage fallback"}`);
    console.log(`   Frontend: http://localhost:5173\n`);
  });
}

start();
