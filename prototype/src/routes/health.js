import { Router } from "express";
import rateLimit from "express-rate-limit";
import { pool } from "../db/client.js";

export const healthRouter = Router();
const healthRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false
});

export const createHealthHandler = (dbPool) => async (_req, res) => {
  if (!dbPool) {
    return res.json({ status: "degraded", database: "unconfigured" });
  }

  try {
    await dbPool.query("SELECT 1");
    return res.json({ status: "ok", database: "reachable" });
  } catch {
    return res.json({ status: "degraded", database: "unreachable" });
  }
};

healthRouter.get("/health", healthRateLimiter, createHealthHandler(pool));
