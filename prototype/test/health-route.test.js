import test from "node:test";
import assert from "node:assert/strict";
import { createHealthHandler } from "../src/routes/health.js";

const createJsonRecorder = () => {
  const response = {
    body: undefined,
    json(payload) {
      this.body = payload;
      return this;
    }
  };
  return response;
};

test("health handler returns degraded when database is unconfigured", async () => {
  const res = createJsonRecorder();
  await createHealthHandler(null)({}, res);
  assert.deepEqual(res.body, { status: "degraded", database: "unconfigured" });
});

test("health handler returns ok when database is reachable", async () => {
  const res = createJsonRecorder();
  await createHealthHandler({ query: async () => ({ rows: [{ "?column?": 1 }] }) })({}, res);
  assert.deepEqual(res.body, { status: "ok", database: "reachable" });
});

test("health handler returns degraded when database is unreachable", async () => {
  const res = createJsonRecorder();
  await createHealthHandler({ query: async () => { throw new Error("boom"); } })({}, res);
  assert.deepEqual(res.body, { status: "degraded", database: "unreachable" });
});
