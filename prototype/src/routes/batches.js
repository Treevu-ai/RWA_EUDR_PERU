import { Router } from "express";
import { resolveContext } from "../lib/request-context.js";
import { batchesRepository } from "../repositories/batches-repository.js";
import { auditRepository } from "../repositories/audit-repository.js";
import { requireRole } from "../lib/authz.js";

export const batchesRouter = Router();

batchesRouter.get("/", async (req, res, next) => {
  try {
    const { orgId } = resolveContext(req);
    const batches = await batchesRepository.listByOrg(orgId);
    res.json({ lots: batches });
  } catch (error) {
    next(error);
  }
});

batchesRouter.post("/", requireRole("operator"), async (req, res, next) => {
  try {
    const { orgId, actorId } = resolveContext(req);
    const { code, product, producerId, farmId, status, weightKg, destination, pricePerKg } = req.body ?? {};
    if (!code || !product) {
      return res.status(400).json({ error: "code and product are required" });
    }

    const lot = await batchesRepository.create(orgId, {
      code,
      product,
      producerId,
      farmId,
      status,
      weightKg,
      destination,
      pricePerKg
    });

    await auditRepository.log({
      orgId,
      actorId,
      entityType: "batch",
      entityId: lot.id,
      action: "created",
      payload: { code: lot.code, product: lot.product, status: lot.status }
    });

    res.status(201).json({ lot });
  } catch (error) {
    next(error);
  }
});

batchesRouter.put("/:id/link-farm", requireRole("operator"), async (req, res, next) => {
  try {
    const { orgId, actorId } = resolveContext(req);
    const { farmId } = req.body ?? {};
    if (!farmId) return res.status(400).json({ error: "farmId is required" });

    const lot = await batchesRepository.linkFarm(orgId, req.params.id, farmId);
    if (!lot) return res.status(404).json({ error: "lot not found for this org" });

    await auditRepository.log({
      orgId,
      actorId,
      entityType: "batch",
      entityId: lot.id,
      action: "farm_linked",
      payload: { farmId }
    });

    res.json({ lot });
  } catch (error) {
    next(error);
  }
});
