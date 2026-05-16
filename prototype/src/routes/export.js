import { Router } from "express";
import { resolveContext } from "../lib/request-context.js";
import { query } from "../db/client.js";

export const exportRouter = Router();

const toCsvValue = (value) => {
  if (value == null) return "";
  const text = String(value).replace(/"/g, "\"\"");
  return `"${text}"`;
};

exportRouter.get("/lots.csv", async (req, res, next) => {
  try {
    const { orgId } = resolveContext(req);
    const { rows } = await query(
      `SELECT
         b.id AS lot_id,
         b.code AS lot_code,
         b.product,
         b.status,
         b.weight_kg,
         b.price_per_kg,
         b.destination,
         p.name AS producer_name,
         f.name AS farm_name,
         c.status AS compliance_status,
         c.score AS compliance_score,
         a.value_estimated,
         a.financing_eligible
       FROM batches b
       LEFT JOIN producers p ON p.id = b.producer_id
       LEFT JOIN farms f ON f.id = b.farm_id
       LEFT JOIN LATERAL (
         SELECT status, score
         FROM compliance_records
         WHERE batch_id = b.id AND org_id = b.org_id
         ORDER BY created_at DESC
         LIMIT 1
       ) c ON true
       LEFT JOIN assets a ON a.batch_id = b.id AND a.org_id = b.org_id
       WHERE b.org_id = $1
       ORDER BY b.created_at DESC`,
      [orgId]
    );

    const headers = [
      "lot_id",
      "lot_code",
      "product",
      "status",
      "weight_kg",
      "price_per_kg",
      "destination",
      "producer_name",
      "farm_name",
      "compliance_status",
      "compliance_score",
      "value_estimated",
      "financing_eligible"
    ];

    const lines = [
      headers.join(","),
      ...rows.map((row) => headers.map((header) => toCsvValue(row[header])).join(","))
    ];

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=\"foresttrace-lots-export.csv\"");
    res.send(lines.join("\n"));
  } catch (error) {
    next(error);
  }
});
