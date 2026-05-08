import { Router } from "express";
import { pool } from "../db/client.js";

export const healthRouter = Router();

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

healthRouter.get("/health", createHealthHandler(pool));
