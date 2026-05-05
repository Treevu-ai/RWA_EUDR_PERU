import { Router } from "express";
import { resolveContext } from "../lib/request-context.js";
import { parseCsv, validateTemplateHeaders } from "../lib/csv.js";
import { toGeoJsonFeatureCollection, validatePolygonCoordinates } from "../lib/geojson.js";
import { producersRepository } from "../repositories/producers-repository.js";
import { farmsRepository } from "../repositories/farms-repository.js";
import { batchesRepository } from "../repositories/batches-repository.js";
import { auditRepository } from "../repositories/audit-repository.js";
import { requireRole } from "../lib/authz.js";

export const ingestionRouter = Router();

ingestionRouter.post("/excel", requireRole("operator"), async (req, res, next) => {
  try {
    const { orgId, actorId } = resolveContext(req);
    const { csv, rows } = req.body ?? {};

    const parsed = Array.isArray(rows) ? { headers: Object.keys(rows[0] ?? {}), rows } : parseCsv(csv);
    const headerCheck = validateTemplateHeaders(parsed.headers.map((h) => String(h).toLowerCase()));
    if (!headerCheck.isValid) {
      return res.status(400).json({
        error: "invalid template headers",
        missingHeaders: headerCheck.missing
      });
    }

    let processed = 0;
    const errors = [];

    for (const row of parsed.rows) {
      try {
        if (!row.producer_name || !row.batch_code || !row.product || !row.farm_name) {
          throw new Error("producer_name, farm_name, batch_code and product are required");
        }

        const producer = await producersRepository.create(orgId, {
          name: row.producer_name,
          cooperativeName: row.cooperative_name,
          cropType: row.crop_type,
          region: row.region,
          country: "PE"
        });

        const farm = await farmsRepository.create(orgId, {
          producerId: producer.id,
          name: row.farm_name,
          areaHectares: row.area_hectares ? Number(row.area_hectares) : null
        });

        const lot = await batchesRepository.create(orgId, {
          producerId: producer.id,
          farmId: farm.id,
          code: row.batch_code,
          product: row.product,
          weightKg: row.weight_kg ? Number(row.weight_kg) : null,
          destination: row.destination,
          pricePerKg: row.price_per_kg ? Number(row.price_per_kg) : null
        });

        await auditRepository.log({
          orgId,
          actorId,
          entityType: "ingestion",
          entityId: lot.id,
          action: "excel_row_imported",
          payload: { batchCode: row.batch_code, producerName: row.producer_name }
        });

        processed += 1;
      } catch (error) {
        errors.push({ row, error: error.message });
      }
    }

    res.status(201).json({
      processedRows: processed,
      failedRows: errors.length,
      errors
    });
  } catch (error) {
    next(error);
  }
});

ingestionRouter.post("/geojson", requireRole("operator"), async (req, res, next) => {
  try {
    const { orgId, actorId } = resolveContext(req);
    const { geojson, producerId, farmName } = req.body ?? {};
    const collection = toGeoJsonFeatureCollection(geojson);
    const created = [];
    const errors = [];

    for (const feature of collection.features ?? []) {
      try {
        if (feature?.geometry?.type !== "Polygon") {
          throw new Error("only Polygon geometries are supported");
        }

        const validation = validatePolygonCoordinates(feature.geometry.coordinates);
        if (!validation.valid) throw new Error(validation.error);

        const farm = await farmsRepository.createWithGeometry(orgId, {
          producerId: producerId ?? null,
          name: feature.properties?.name ?? farmName ?? "Imported Farm",
          areaHectares: feature.properties?.area_hectares ?? null,
          geometry: feature.geometry
        });

        await auditRepository.log({
          orgId,
          actorId,
          entityType: "farm",
          entityId: farm.id,
          action: "geojson_imported",
          payload: { source: "geojson" }
        });

        created.push(farm);
      } catch (error) {
        errors.push({ feature: feature?.properties?.name ?? "unknown", error: error.message });
      }
    }

    res.status(201).json({
      importedFarms: created.length,
      failedFeatures: errors.length,
      farms: created,
      errors
    });
  } catch (error) {
    next(error);
  }
});
