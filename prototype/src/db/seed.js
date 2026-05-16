import { randomUUID } from "crypto";
import { query, pool } from "./client.js";

const run = async () => {
  const orgId = randomUUID();
  const producerId = randomUUID();
  const farmId = randomUUID();
  const batchId = randomUUID();
  const adminId = randomUUID();
  const operatorId = randomUUID();

  // Org
  await query("INSERT INTO orgs (id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING", [
    orgId, "ForestTrace Demo PE"
  ]);

  // Users
  await query(
    `INSERT INTO users (id, org_id, email, role)
     VALUES ($1, $2, $3, $4), ($5, $2, $6, $7)
     ON CONFLICT DO NOTHING`,
    [adminId, orgId, "admin@foresttrace.pe", "admin",
     operatorId, orgId, "operador@foresttrace.pe", "operator"]
  );

  // Producer: cooperative in San Martin
  await query(
    `INSERT INTO producers (id, org_id, name, cooperative_name, crop_type, region)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT DO NOTHING`,
    [producerId, orgId, "Coop Valle Verde", "Coop Valle Verde", "coffee", "San Martin"]
  );

  // Farm: 4.5 ha (requires polygon per EUDR)
  await query(
    `INSERT INTO farms (id, org_id, producer_id, name, area_hectares)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT DO NOTHING`,
    [farmId, orgId, producerId, "Parcela 01 - Alto Mayo", 4.5]
  );

  // Batch: coffee lot destined for EU
  await query(
    `INSERT INTO batches (id, org_id, producer_id, farm_id, code, product, status, weight_kg, destination, price_per_kg)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     ON CONFLICT DO NOTHING`,
    [batchId, orgId, producerId, farmId, "LOT-0001", "coffee", "registered", 1200, "EU", 3.8]
  );

  // Compliance check: moderate-risk coffee lot
  const complianceRecordId = randomUUID();
  const assessmentRunId = randomUUID();
  const scoringVersion = "v1.1";

  const scoringPayload = {
    ndviChange: 0.15,
    locationRisk: 0.10,
    dataQuality: 0.05,
    supplyChainComplexity: 0.20,
    corruptionIndex: 0.35
  };

  // Expected score: 0.15*0.40 + 0.10*0.20 + 0.05*0.20 + 0.20*0.10 + 0.35*0.10
  // = 0.060 + 0.020 + 0.010 + 0.020 + 0.035 = 0.145
  const score = 0.145;
  const status = "LOW";
  const eudrLevel = "NEGLIGIBLE";

  await query(
    `INSERT INTO assessment_runs (id, org_id, batch_id, scoring_version, input_payload, output_payload)
     VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb)
     ON CONFLICT DO NOTHING`,
    [
      assessmentRunId, orgId, batchId, scoringVersion,
      JSON.stringify(scoringPayload),
      JSON.stringify({
        score,
        status,
        eudrLevel,
        scoringVersion,
        breakdown: {
          ndvi: { value: 0.15, weight: 0.40, contribution: 0.060 },
          locationRisk: { value: 0.10, weight: 0.20, contribution: 0.020 },
          dataQuality: { value: 0.05, weight: 0.20, contribution: 0.010 },
          supplyChainComplexity: { value: 0.20, weight: 0.10, contribution: 0.020 },
          corruptionIndex: { value: 0.35, weight: 0.10, contribution: 0.035 }
        }
      })
    ]
  );

  await query(
    `INSERT INTO compliance_records (id, org_id, batch_id, status, score, scoring_version)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT DO NOTHING`,
    [complianceRecordId, orgId, batchId, status, score, scoringVersion]
  );

  // Legality check: partially filled (in-progress pilot state)
  const legalityId = randomUUID();
  await query(
    `INSERT INTO legality_checks (
       id, org_id, batch_id,
       legality_land_tenure, legality_land_tenure_status,
       legality_environment, legality_environment_status,
       legality_third_party_rights, legality_third_party_rights_status,
       legality_labor, legality_labor_status,
       legality_human_rights, legality_human_rights_status,
       legality_tax, legality_tax_status,
       legality_anticorruption, legality_anticorruption_status,
       legality_trade_customs, legality_trade_customs_status,
       mass_balance_verified,
       volume_surface_audited
     ) VALUES (
       $1, $2, $3,
       'Titulo de propiedad registrado en SUNARP', 'verified',
       'Plan de manejo ambiental aprobado SERFOR', 'verified',
       'Zona sin presencia de comunidades indigenas', 'exempt',
       'Registro en planilla electronica', 'evidence_collected',
       'Sin reportes de conflictos en la zona', 'evidence_collected',
       'RUC activo declaraciones SUNAT al dia', 'verified',
       'Politica anticorrupcion firmada', 'evidence_collected',
       'Licencia de exportador SENASA vigente', 'verified',
       TRUE,
       TRUE
     )
     ON CONFLICT DO NOTHING`,
    [legalityId, orgId, batchId]
  );

  // Audit events
  const auditEventId1 = randomUUID();
  const auditEventId2 = randomUUID();
  await query(
    `INSERT INTO audit_events (id, org_id, entity_type, entity_id, action, actor_id, payload)
     VALUES
     ($1, $2, 'compliance_record', $3, 'evaluated', $4, $5::jsonb),
     ($6, $2, 'legality_checks', $7, 'created', $4, $8::jsonb)
     ON CONFLICT DO NOTHING`,
    [
      auditEventId1, orgId, complianceRecordId, operatorId,
      JSON.stringify({ batchId, score, eudrLevel, scoringVersion }),
      auditEventId2, legalityId,
      JSON.stringify({ batchId, domains_verified: 4, domains_total: 8 })
    ]
  );

  console.log("Seed completed OK");
  console.log(`  ORG_ID  = ${orgId}`);
  console.log(`  BATCH   = LOT-0001`);
  console.log(`  Compliance: score=${score} eudrLevel=${eudrLevel}`);
  console.log(`  Legality: 4/8 domains verified`);
};

run()
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (pool) await pool.end();
  });
