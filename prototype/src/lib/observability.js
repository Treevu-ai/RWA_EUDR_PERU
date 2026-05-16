import { randomUUID } from "crypto";

const metrics = {
  requestsTotal: 0,
  errorsTotal: 0,
  byRoute: {}
};

export const requestMetricsMiddleware = (req, res, next) => {
  metrics.requestsTotal += 1;
  const routeKey = `${req.method} ${req.path}`;
  metrics.byRoute[routeKey] = (metrics.byRoute[routeKey] ?? 0) + 1;

  const requestId = req.header("x-request-id") ?? randomUUID();
  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  next();
};

export const trackError = () => {
  metrics.errorsTotal += 1;
};

export const getMetricsSnapshot = () => ({
  ...metrics,
  timestamp: new Date().toISOString()
});
