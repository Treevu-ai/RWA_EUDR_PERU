import { randomUUID } from "crypto";
import { query } from "../db/client.js";

export const reportsRepository = {
  async create(orgId, complianceRecordId, filePath) {
    const id = randomUUID();
    const { rows } = await query(
      `INSERT INTO reports (id, org_id, compliance_record_id, file_path)
       VALUES ($1, $2, $3, $4)
       RETURNING id, org_id, compliance_record_id, file_path, created_at`,
      [id, orgId, complianceRecordId, filePath]
    );
    return rows[0];
  },

  async findById(orgId, reportId) {
    const { rows } = await query(
      `SELECT id, org_id, compliance_record_id, file_path, created_at
       FROM reports
       WHERE org_id = $1 AND id = $2`,
      [orgId, reportId]
    );
    return rows[0] ?? null;
  },

  async createShare(orgId, reportId, token, expiresAt) {
    const id = randomUUID();
    const { rows } = await query(
      `INSERT INTO report_shares (id, org_id, report_id, token, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, token, expires_at, created_at`,
      [id, orgId, reportId, token, expiresAt]
    );
    return rows[0];
  },

  async findByShareToken(token) {
    const { rows } = await query(
      `SELECT rs.id AS share_id, rs.token, rs.expires_at, r.id AS report_id, r.file_path, r.org_id
       FROM report_shares rs
       JOIN reports r ON r.id = rs.report_id
       WHERE rs.token = $1`,
      [token]
    );
    return rows[0] ?? null;
  }
};
