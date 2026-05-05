import { Pool } from "pg";
import { config } from "../config.js";

export const pool = config.db.url
  ? new Pool({
      connectionString: config.db.url,
      ssl: config.db.ssl ? { rejectUnauthorized: false } : false,
      max: config.db.max
    })
  : null;

const dbUnavailableError = () => {
  const error = new Error("DATABASE_URL is not configured for this deployment");
  error.statusCode = 503;
  return error;
};

export const query = (text, params) => {
  if (!pool) throw dbUnavailableError();
  return pool.query(text, params);
};

export const withTransaction = async (handler) => {
  if (!pool) throw dbUnavailableError();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await handler(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
