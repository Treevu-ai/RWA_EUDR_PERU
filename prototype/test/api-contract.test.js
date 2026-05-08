import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

delete process.env.DATABASE_URL;
process.env.ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:3000";

const { createApp } = await import("../src/app.js");
const app = createApp();

test("GET /api/docs returns API descriptor", async () => {
  const res = await request(app).get("/api/docs");
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.name, "ForestTrace API");
  assert.ok(Array.isArray(res.body.endpoints));
});

test("GET /api/metrics returns request counters", async () => {
  const res = await request(app).get("/api/metrics");
  assert.equal(res.statusCode, 200);
  assert.ok(res.body.metrics);
  assert.equal(typeof res.body.metrics.requestsTotal, "number");
});

test("GET /api/health returns degraded status when database is unconfigured", async () => {
  const res = await request(app).get("/api/health");
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.status, "degraded");
  assert.equal(res.body.database, "unconfigured");
});

test("POST /api/producers requires operator role", async () => {
  const res = await request(app)
    .post("/api/producers")
    .set("x-org-id", "test-org")
    .set("x-role", "viewer")
    .send({ name: "Blocked Producer" });
  assert.equal(res.statusCode, 403);
  assert.match(res.body.error, /role operator required/i);
});
