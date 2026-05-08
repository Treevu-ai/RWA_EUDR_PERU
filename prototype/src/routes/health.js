import { Router } from "express";
import { config } from "../config.js";
import { query } from "../db/client.js";

export const healthRouter = Router();

healthRouter.get("/health", async (_req, res) => {
  if (!config.db.url) {
    return res.json({ status: "degraded", database: "unconfigured" });
  }

  try {
    await query("SELECT 1");
    return res.json({ status: "ok", database: "reachable" });
  } catch {
    return res.json({ status: "degraded", database: "unreachable" });
  }
});
