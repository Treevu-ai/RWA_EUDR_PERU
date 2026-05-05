const normalizeHeader = (value) => String(value ?? "").trim().toLowerCase();

export const parseCsv = (raw) => {
  const lines = String(raw ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { headers: [], rows: [] };
  }

  const headers = lines[0].split(",").map(normalizeHeader);
  const rows = lines.slice(1).map((line) => {
    const cols = line.split(",");
    const record = {};
    headers.forEach((header, idx) => {
      record[header] = (cols[idx] ?? "").trim();
    });
    return record;
  });

  return { headers, rows };
};

export const requiredTemplateHeaders = [
  "producer_name",
  "cooperative_name",
  "crop_type",
  "region",
  "farm_name",
  "batch_code",
  "product",
  "weight_kg",
  "destination",
  "price_per_kg",
  "latitude",
  "longitude"
];

export const validateTemplateHeaders = (headers) => {
  const missing = requiredTemplateHeaders.filter((header) => !headers.includes(header));
  return {
    isValid: missing.length === 0,
    missing
  };
};
