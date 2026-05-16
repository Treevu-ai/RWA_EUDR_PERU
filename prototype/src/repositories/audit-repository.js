import { randomUUID } from "crypto";
import { query } from "../db/client.js";

export const auditRepository = {
  async log({ orgId, entityType, entityId, action, actorId = null, payload = {} }) {
    const id = randomUUID();
    await query(
      `INSERT INTO audit_events (id, org_id, entity_type, entity_id, action, actor_id, payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
      [id, orgId, entityType, entityId, action, actorId, JSON.stringify(payload)]
    );
    return id;
  }
};
