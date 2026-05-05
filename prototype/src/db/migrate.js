import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { query, pool } from "./client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const run = async () => {
  const sqlPath = path.join(__dirname, "schema.sql");
  const sql = await fs.readFile(sqlPath, "utf8");
  await query(sql);
  console.log("Database schema ready.");
};

run()
  .catch((error) => {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (pool) await pool.end();
  });
