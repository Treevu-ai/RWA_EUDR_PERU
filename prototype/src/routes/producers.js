import { Router } from "express";
import { resolveContext } from "../lib/request-context.js";
import { producersRepository } from "../repositories/producers-repository.js";
import { auditRepository } from "../repositories/audit-repository.js";
import { requireRole } from "../lib/authz.js";

export const producersRouter = Router();

producersRouter.get("/", async (req, res, next) => {
  try {
    const { orgId } = resolveContext(req);
    const producers = await producersRepository.listByOrg(orgId);
    res.json({ producers });
  } catch (error) {
    next(error);
  }
});

producersRouter.post("/", requireRole("operator"), async (req, res, next) => {
  try {
    const { orgId, actorId } = resolveContext(req);
    const { name, cooperativeName, cropType, country, region } = req.body ?? {};
    if (!name) {
      return res.status(400).json({ error: "name is required" });
    }

    const producer = await producersRepository.create(orgId, { name, cooperativeName, cropType, country, region });
    await auditRepository.log({
      orgId,
      actorId,
      entityType: "producer",
      entityId: producer.id,
      action: "created",
      payload: { name: producer.name, cropType: producer.crop_type ?? null }
    });

    res.status(201).json({ producer });
  } catch (error) {
    next(error);
  }
});
