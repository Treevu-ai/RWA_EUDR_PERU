import { randomBytes } from "crypto";
import { Router } from "express";
import fs from "fs";
import { resolveContext } from "../lib/request-context.js";
import { complianceRepository } from "../repositories/compliance-repository.js";
import { reportsRepository } from "../repositories/reports-repository.js";
import { batchesRepository } from "../repositories/batches-repository.js";
import { auditRepository } from "../repositories/audit-repository.js";
import { buildCompliancePdf } from "../services/report-pdf.js";
import { requireRole } from "../lib/authz.js";

export const reportsRouter = Router();

reportsRouter.post("/compliance/:complianceRecordId", requireRole("operator"), async (req, res, next) => {
  try {
    const { orgId, actorId } = resolveContext(req);
    const record = await complianceRepository.findById(orgId, req.params.complianceRecordId);
    if (!record) return res.status(404).json({ error: "compliance record not found" });

    const lots = await batchesRepository.listByOrg(orgId);
    const batch = lots.find((item) => item.id === record.batch_id) ?? null;
    const reportId = cryptoRandomId();
    const pdf = await buildCompliancePdf({
      reportId,
      complianceRecord: record,
      batch
    });

    const report = await reportsRepository.create(orgId, record.id, pdf.fullPath);
    await auditRepository.log({
      orgId,
      actorId,
      entityType: "report",
      entityId: report.id,
      action: "generated_pdf",
      payload: { complianceRecordId: record.id }
    });

    res.status(201).json({
      report: {
        id: report.id,
        complianceRecordId: report.compliance_record_id,
        filename: pdf.filename,
        createdAt: report.created_at
      }
    });
  } catch (error) {
    next(error);
  }
});

reportsRouter.get("/:reportId/download", async (req, res, next) => {
  try {
    const { orgId } = resolveContext(req);
    const report = await reportsRepository.findById(orgId, req.params.reportId);
    if (!report) return res.status(404).json({ error: "report not found" });
    if (!fs.existsSync(report.file_path)) return res.status(404).json({ error: "report file missing" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="report-${report.id}.pdf"`);
    fs.createReadStream(report.file_path).pipe(res);
  } catch (error) {
    next(error);
  }
});

reportsRouter.post("/:reportId/share", requireRole("operator"), async (req, res, next) => {
  try {
    const { orgId, actorId } = resolveContext(req);
    const report = await reportsRepository.findById(orgId, req.params.reportId);
    if (!report) return res.status(404).json({ error: "report not found" });

    const ttlHours = Number(req.body?.ttlHours) || 72;
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
    const token = randomBytes(18).toString("hex");
    const share = await reportsRepository.createShare(orgId, report.id, token, expiresAt);

    await auditRepository.log({
      orgId,
      actorId,
      entityType: "report",
      entityId: report.id,
      action: "share_created",
      payload: { expiresAt: expiresAt.toISOString() }
    });

    res.status(201).json({
      share: {
        token: share.token,
        expiresAt: share.expires_at,
        url: `/api/reports/shared/${share.token}`
      }
    });
  } catch (error) {
    next(error);
  }
});

reportsRouter.get("/shared/:token", async (req, res, next) => {
  try {
    const share = await reportsRepository.findByShareToken(req.params.token);
    if (!share) return res.status(404).json({ error: "share token not found" });
    if (new Date(share.expires_at).getTime() < Date.now()) {
      return res.status(410).json({ error: "share token expired" });
    }
    if (!fs.existsSync(share.file_path)) return res.status(404).json({ error: "report file missing" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="shared-report-${share.report_id}.pdf"`);
    fs.createReadStream(share.file_path).pipe(res);
  } catch (error) {
    next(error);
  }
});

function cryptoRandomId() {
  return randomBytes(12).toString("hex");
}
