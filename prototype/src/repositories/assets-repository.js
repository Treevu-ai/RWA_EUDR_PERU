import { randomUUID } from "crypto";
import { query } from "../db/client.js";

export const assetsRepository = {
  async upsertByBatch(orgId, input) {
    const existing = await query(
      `SELECT id FROM assets WHERE org_id = $1 AND batch_id = $2 LIMIT 1`,
      [orgId, input.batchId]
    );

    if (existing.rows.length > 0) {
      const id = existing.rows[0].id;
      const { rows } = await query(
        `UPDATE assets
         SET value_estimated = $3, risk_score = $4, financing_eligible = $5
         WHERE org_id = $1 AND batch_id = $2
         RETURNING id, batch_id, value_estimated, risk_score, financing_eligible, created_at`,
        [orgId, input.batchId, input.valueEstimated, input.riskScore ?? null, input.financingEligible]
      );
      return rows[0];
    }

    const id = randomUUID();
    const { rows } = await query(
      `INSERT INTO assets (id, org_id, batch_id, value_estimated, risk_score, financing_eligible)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, batch_id, value_estimated, risk_score, financing_eligible, created_at`,
      [id, orgId, input.batchId, input.valueEstimated, input.riskScore ?? null, input.financingEligible]
    );
    return rows[0];
  }
};
