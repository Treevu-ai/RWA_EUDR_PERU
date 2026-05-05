import { randomUUID } from "crypto";
import { query } from "../db/client.js";

export const producersRepository = {
  async listByOrg(orgId) {
    const { rows } = await query(
      `SELECT id, name, cooperative_name, crop_type, country, region, created_at
       FROM producers
       WHERE org_id = $1
       ORDER BY created_at DESC`,
      [orgId]
    );
    return rows;
  },

  async create(orgId, input) {
    const id = randomUUID();
    const { rows } = await query(
      `INSERT INTO producers (id, org_id, name, cooperative_name, crop_type, country, region)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'PE'), $7)
       RETURNING id, name, cooperative_name, crop_type, country, region, created_at`,
      [id, orgId, input.name, input.cooperativeName ?? null, input.cropType ?? null, input.country ?? "PE", input.region ?? null]
    );
    return rows[0];
  }
};
