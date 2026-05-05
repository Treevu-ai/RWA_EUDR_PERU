import dotenv from "dotenv";

dotenv.config();

const asBool = (value, fallback = false) => {
  if (value == null) return fallback;
  return value.toLowerCase() === "true";
};

const asInt = (value, fallback) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const config = {
  port: asInt(process.env.PORT, 3000),
  allowedOrigins: (process.env.ALLOWED_ORIGIN ?? "http://localhost:5173,http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  db: {
    url: process.env.DATABASE_URL ?? "",
    ssl: asBool(process.env.DB_SSL, false),
    max: asInt(process.env.DB_POOL_MAX, 10)
  }
};

if (!config.db.url) {
  throw new Error("DATABASE_URL is required. Copy .env.example to .env and configure it.");
}
