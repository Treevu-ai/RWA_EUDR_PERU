import { Router } from "express";
import { resolveContext } from "../lib/request-context.js";
import { evaluateRisk } from "../lib/scoring.js";
import { complianceRepository } from "../repositories/compliance-repository.js";
import { auditRepository } from "../repositories/audit-repository.js";
import { requireRole } from "../lib/authz.js";

export const complianceRouter = Router();

complianceRouter.post("/check", requireRole("operator"), async (req, res, next) => {
  try {
    const { orgId, actorId } = resolveContext(req);
    const {
      batchId,
      ndviChange,
      locationRisk,
      dataQuality,
      supplyChainComplexity,
      corruptionIndex,
      metadata
    } = req.body ?? {};

    if (!batchId) return res.status(400).json({ error: "batchId is required" });

    const result = evaluateRisk({
      ndviChange,
      locationRisk,
      dataQuality,
      supplyChainComplexity,
      corruptionIndex
    });

    const inputPayload = {
      ndviChange,
      locationRisk,
      dataQuality,
      supplyChainComplexity,
      corruptionIndex,
      metadata: metadata ?? null
    };

    const run = await complianceRepository.createRun(orgId, {
      batchId,
      scoringVersion: result.scoringVersion,
      inputPayload,
      outputPayload: result
    });

    const record = await complianceRepository.createRecord(orgId, {
      batchId,
      status: result.status,
      eudrLevel: result.eudrLevel,
      score: result.score,
      scoringVersion: result.scoringVersion
    });

    await auditRepository.log({
      orgId,
      actorId,
      entityType: "compliance_record",
      entityId: record.id,
      action: "evaluated",
      payload: {
        batchId,
        score: result.score,
        status: result.status,
        eudrLevel: result.eudrLevel,
        scoringVersion: result.scoringVersion
      }
    });

    res.status(201).json({
      complianceRecord: record,
      assessmentRun: run,
      evaluation: result
    });
  } catch (error) {
    next(error);
  }
});

complianceRouter.get("/reports", async (req, res, next) => {
  try {
    const { orgId } = resolveContext(req);
    const reports = await complianceRepository.listByOrg(orgId);
    res.json({ reports });
  } catch (error) {
    next(error);
  }
});

complianceRouter.get("/summary", async (req, res, next) => {
  try {
    const { orgId } = resolveContext(req);
    const summary = await complianceRepository.summaryByOrg(orgId);
    res.json({ summary });
  } catch (error) {
    next(error);
  }
});
