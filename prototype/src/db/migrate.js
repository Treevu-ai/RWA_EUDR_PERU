import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { query, pool } from "./client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const run = async () => {
  // 1. Run base schema
  const schemaPath = path.join(__dirname, "schema.sql");
  const schemaSql = await fs.readFile(schemaPath, "utf8");
  await query(schemaSql);
  console.log("[migrate] Base schema applied.");

  // 2. Run numbered migration files in order
  const migrationsDir = path.join(__dirname, "migrations");
  let migrations = [];
  try {
    const entries = await fs.readdir(migrationsDir);
    migrations = entries
      .filter((f) => f.endsWith(".sql"))
      .sort();
  } catch {
    console.log("[migrate] No migrations directory found — skipping.");
  }

  for (const file of migrations) {
    const filePath = path.join(migrationsDir, file);
    const sql = await fs.readFile(filePath, "utf8");
    await query(sql);
    console.log(`[migrate] Applied: ${file}`);
  }

  console.log("[migrate] Done.");
};

run()
  .catch((error) => {
    console.error("[migrate] Failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (pool) await pool.end();
  });
