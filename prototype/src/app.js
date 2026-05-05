import express from "express";
import helmet from "helmet";
import { config } from "./config.js";
import { healthRouter } from "./routes/health.js";
import { producersRouter } from "./routes/producers.js";
import { batchesRouter } from "./routes/batches.js";
import { farmsRouter } from "./routes/farms.js";
import { ingestionRouter } from "./routes/ingestion.js";
import { complianceRouter } from "./routes/compliance.js";
import { reportsRouter } from "./routes/reports.js";
import { financeRouter } from "./routes/finance.js";
import { exportRouter } from "./routes/export.js";
import { apiDocsRouter } from "./routes/api-docs.js";
import { metricsRouter } from "./routes/metrics.js";
import { requestMetricsMiddleware, trackError } from "./lib/observability.js";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(express.json({ limit: "2mb" }));
  app.use(requestMetricsMiddleware);

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (!origin || config.allowedOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin ?? config.allowedOrigins[0]);
      res.header("Access-Control-Allow-Headers", "Content-Type, x-org-id, x-actor-id, x-role, x-request-id");
      res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      if (req.method === "OPTIONS") return res.sendStatus(204);
    }
    next();
  });

  app.use("/api", healthRouter);
  app.use("/api/producers", producersRouter);
  app.use("/api/farms", farmsRouter);
  app.use("/api/lots", batchesRouter);
  app.use("/api/ingestion", ingestionRouter);
  app.use("/api/compliance", complianceRouter);
  app.use("/api/reports", reportsRouter);
  app.use("/api/finance", financeRouter);
  app.use("/api/export", exportRouter);
  app.use("/api/docs", apiDocsRouter);
  app.use("/api/metrics", metricsRouter);

  app.use((error, _req, res, _next) => {
    trackError();
    const statusCode = error.statusCode ?? 500;
    res.status(statusCode).json({ error: error.message ?? "Unexpected server error" });
  });

  return app;
};
