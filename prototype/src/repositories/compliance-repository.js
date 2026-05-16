import { randomUUID } from "crypto";
import { query } from "../db/client.js";

export const complianceRepository = {
  async createRun(orgId, input) {
    const id = randomUUID();
    const { rows } = await query(
      `INSERT INTO assessment_runs (id, org_id, batch_id, scoring_version, input_payload, output_payload)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb)
       RETURNING id, batch_id, scoring_version, input_payload, output_payload, created_at`,
      [id, orgId, input.batchId, input.scoringVersion, JSON.stringify(input.inputPayload), JSON.stringify(input.outputPayload)]
    );
    return rows[0];
  },

  async createRecord(orgId, input) {
    const id = randomUUID();
    const { rows } = await query(
      `INSERT INTO compliance_records (id, org_id, batch_id, status, score, scoring_version)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, batch_id, status, score, scoring_version, created_at`,
      [id, orgId, input.batchId, input.status, input.score, input.scoringVersion]
    );
    return rows[0];
  },

  async listByOrg(orgId) {
    const { rows } = await query(
      `SELECT id, batch_id, status, score, scoring_version, created_at
       FROM compliance_records
       WHERE org_id = $1
       ORDER BY created_at DESC
       LIMIT 100`,
      [orgId]
    );
    return rows;
  },

  async summaryByOrg(orgId) {
    const { rows } = await query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE score < 0.15)::int AS negligible,
         COUNT(*) FILTER (WHERE score >= 0.15 AND score < 0.35)::int AS low,
         COUNT(*) FILTER (WHERE score >= 0.35 AND score < 0.60)::int AS moderate,
         COUNT(*) FILTER (WHERE score >= 0.60)::int AS high,
         COALESCE(AVG(score), 0)::numeric(6,3) AS avg_score
       FROM compliance_records
       WHERE org_id = $1`,
      [orgId]
    );
    return rows[0];
  },

  async findById(orgId, id) {
    const { rows } = await query(
      `SELECT id, org_id, batch_id, status, score, scoring_version, created_at
       FROM compliance_records
       WHERE org_id = $1 AND id = $2`,
      [orgId, id]
    );
    return rows[0] ?? null;
  }
};
