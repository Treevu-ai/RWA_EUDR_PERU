import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";
import { createHealthHandler } from "../src/routes/health.js";

const createTestApp = (dbPool) => {
  const app = express();
  app.get("/api/health", createHealthHandler(dbPool));
  return app;
};

test("health handler returns degraded when database is unconfigured", async () => {
  const res = await request(createTestApp(null)).get("/api/health");
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { status: "degraded", database: "unconfigured" });
});

test("health handler returns ok when database is reachable", async () => {
  const res = await request(createTestApp({ query: async () => ({ rows: [{ "?column?": 1 }] }) })).get("/api/health");
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { status: "ok", database: "reachable" });
});

test("health handler returns degraded when database is unreachable", async () => {
  const res = await request(createTestApp({ query: async () => { throw new Error("boom"); } })).get("/api/health");
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { status: "degraded", database: "unreachable" });
});
