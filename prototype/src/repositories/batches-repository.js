import { randomUUID } from "crypto";
import { query } from "../db/client.js";

export const batchesRepository = {
  async listByOrg(orgId) {
    const { rows } = await query(
      `SELECT id, producer_id, farm_id, code, product, status, weight_kg, destination, price_per_kg, created_at
       FROM batches
       WHERE org_id = $1
       ORDER BY created_at DESC`,
      [orgId]
    );
    return rows;
  },

  async create(orgId, input) {
    const id = randomUUID();
    const { rows } = await query(
      `INSERT INTO batches (id, org_id, producer_id, farm_id, code, product, status, weight_kg, destination, price_per_kg)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'registered'), $8, $9, $10)
       RETURNING id, producer_id, farm_id, code, product, status, weight_kg, destination, price_per_kg, created_at`,
      [
        id,
        orgId,
        input.producerId ?? null,
        input.farmId ?? null,
        input.code,
        input.product,
        input.status ?? "registered",
        input.weightKg ?? null,
        input.destination ?? null,
        input.pricePerKg ?? null
      ]
    );
    return rows[0];
  },

  async linkFarm(orgId, batchId, farmId) {
    const { rows } = await query(
      `UPDATE batches
       SET farm_id = $3
       WHERE org_id = $1 AND id = $2
       RETURNING id, producer_id, farm_id, code, product, status, weight_kg, destination, price_per_kg, created_at`,
      [orgId, batchId, farmId]
    );
    return rows[0] ?? null;
  }
};
