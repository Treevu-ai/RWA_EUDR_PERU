import { randomUUID } from "crypto";
import { query, pool } from "./client.js";

const run = async () => {
  const orgId = randomUUID();
  const producerId = randomUUID();
  const farmId = randomUUID();
  const batchId = randomUUID();
  const adminId = randomUUID();
  const operatorId = randomUUID();

  await query("INSERT INTO orgs (id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING", [
    orgId,
    "ForestTrace Demo PE"
  ]);

  await query(
    "INSERT INTO users (id, org_id, email, role) VALUES ($1, $2, $3, $4), ($5, $2, $6, $7) ON CONFLICT DO NOTHING",
    [adminId, orgId, "admin@foresttrace.pe", "admin", operatorId, "operador@foresttrace.pe", "operator"]
  );

  await query(
    "INSERT INTO producers (id, org_id, name, cooperative_name, crop_type, region) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING",
    [producerId, orgId, "Coop Valle Verde", "Coop Valle Verde", "coffee", "San Martin"]
  );

  await query(
    "INSERT INTO farms (id, org_id, producer_id, name, area_hectares) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING",
    [farmId, orgId, producerId, "Parcela 01", 4.5]
  );

  await query(
    "INSERT INTO batches (id, org_id, producer_id, farm_id, code, product, status, weight_kg, destination, price_per_kg) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT DO NOTHING",
    [batchId, orgId, producerId, farmId, "LOT-0001", "coffee", "registered", 1200, "EU", 3.8]
  );

  console.log("Seed completed.");
  console.log(`ORG_ID=${orgId}`);
};

run()
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (pool) await pool.end();
  });
