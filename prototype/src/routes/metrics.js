import { Router } from "express";
import { getMetricsSnapshot } from "../lib/observability.js";

export const metricsRouter = Router();

metricsRouter.get("/", (_req, res) => {
  res.json({ metrics: getMetricsSnapshot() });
});
