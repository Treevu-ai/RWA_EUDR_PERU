import { Router } from "express";
import { resolveContext } from "../lib/request-context.js";
import { farmsRepository } from "../repositories/farms-repository.js";
import { auditRepository } from "../repositories/audit-repository.js";

export const farmsRouter = Router();

farmsRouter.get("/", async (req, res, next) => {
  try {
    const { orgId } = resolveContext(req);
    const farms = await farmsRepository.listByOrg(orgId);
    res.json({ farms });
  } catch (error) {
    next(error);
  }
});

farmsRouter.post("/", async (req, res, next) => {
  try {
    const { orgId, actorId } = resolveContext(req);
    const { producerId, name, areaHectares } = req.body ?? {};
    if (!name) return res.status(400).json({ error: "name is required" });

    const farm = await farmsRepository.create(orgId, { producerId, name, areaHectares });
    await auditRepository.log({
      orgId,
      actorId,
      entityType: "farm",
      entityId: farm.id,
      action: "created",
      payload: { name: farm.name }
    });

    res.status(201).json({ farm });
  } catch (error) {
    next(error);
  }
});
