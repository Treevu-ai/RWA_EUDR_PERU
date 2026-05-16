import { randomUUID } from "crypto";
import { query } from "../db/client.js";

export const farmsRepository = {
  async listByOrg(orgId) {
    const { rows } = await query(
      `SELECT id, producer_id, name, area_hectares, created_at,
              ST_AsGeoJSON(geom)::jsonb AS geometry
       FROM farms
       WHERE org_id = $1
       ORDER BY created_at DESC`,
      [orgId]
    );
    return rows;
  },

  async create(orgId, input) {
    const id = randomUUID();
    const { rows } = await query(
      `INSERT INTO farms (id, org_id, producer_id, name, area_hectares)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, producer_id, name, area_hectares, created_at`,
      [id, orgId, input.producerId ?? null, input.name, input.areaHectares ?? null]
    );
    return rows[0];
  },

  async createWithGeometry(orgId, input) {
    const id = randomUUID();
    const { rows } = await query(
      `INSERT INTO farms (id, org_id, producer_id, name, area_hectares, geom)
       VALUES (
         $1, $2, $3, $4, $5,
         ST_SetSRID(ST_GeomFromGeoJSON($6::text), 4326)
       )
       RETURNING id, producer_id, name, area_hectares, created_at`,
      [id, orgId, input.producerId ?? null, input.name, input.areaHectares ?? null, JSON.stringify(input.geometry)]
    );
    return rows[0];
  }
};
