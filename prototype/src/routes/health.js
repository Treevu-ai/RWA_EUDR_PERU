import { Router } from "express";
import { query } from "../db/client.js";

export const healthRouter = Router();

healthRouter.get("/health", async (_req, res, next) => {
  try {
    await query("SELECT 1");
    res.json({ status: "ok", database: "reachable" });
  } catch (error) {
    next(error);
  }
});
