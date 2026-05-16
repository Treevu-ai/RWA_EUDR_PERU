import { Router } from "express";
import { resolveContext } from "../lib/request-context.js";
import { calculateFinancialSnapshot } from "../lib/finance.js";
import { batchesRepository } from "../repositories/batches-repository.js";
import { assetsRepository } from "../repositories/assets-repository.js";
import { auditRepository } from "../repositories/audit-repository.js";
import { requireRole } from "../lib/authz.js";

export const financeRouter = Router();

financeRouter.post("/lots/:lotId/simulate", requireRole("operator"), async (req, res, next) => {
  try {
    const { orgId, actorId } = resolveContext(req);
    const lots = await batchesRepository.listByOrg(orgId);
    const lot = lots.find((item) => item.id === req.params.lotId);
    if (!lot) return res.status(404).json({ error: "lot not found" });

    const financingRate = req.body?.financingRate ?? 0.6;
    const snapshot = calculateFinancialSnapshot({
      weightKg: lot.weight_kg,
      pricePerKg: lot.price_per_kg,
      financingRate
    });

    const asset = await assetsRepository.upsertByBatch(orgId, {
      batchId: lot.id,
      valueEstimated: snapshot.valueEstimated,
      financingEligible: snapshot.financingEligible,
      riskScore: req.body?.riskScore ?? null
    });

    await auditRepository.log({
      orgId,
      actorId,
      entityType: "asset",
      entityId: asset.id,
      action: "finance_simulated",
      payload: {
        lotId: lot.id,
        financingRate: snapshot.financingRate,
        valueEstimated: snapshot.valueEstimated,
        financingEligible: snapshot.financingEligible
      }
    });

    res.json({ lotId: lot.id, snapshot, asset });
  } catch (error) {
    next(error);
  }
});
