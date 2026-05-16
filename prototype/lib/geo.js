import { generateEvidenceHash } from '../services/apify-services.js';

export function normalizeCoordinate(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function buildGeoEvidence(lot) {
  const lat = normalizeCoordinate(lot?.lat);
  const lon = normalizeCoordinate(lot?.lon);
  const hasCoordinates = lat !== null && lon !== null;
  const coordinateValidRange = hasCoordinates && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
  const precisionScore = coordinateValidRange
    ? Math.min(100, Math.round(
        ((String(Math.abs(lat)).split('.')[1]?.length || 0) +
          (String(Math.abs(lon)).split('.')[1]?.length || 0)) * 8
      ))
    : 0;
  const polygon = coordinateValidRange
    ? [
      [Number((lat - 0.0015).toFixed(6)), Number((lon - 0.0015).toFixed(6))],
      [Number((lat - 0.0015).toFixed(6)), Number((lon + 0.0015).toFixed(6))],
      [Number((lat + 0.0015).toFixed(6)), Number((lon + 0.0015).toFixed(6))],
      [Number((lat + 0.0015).toFixed(6)), Number((lon - 0.0015).toFixed(6))]
    ]
    : [];
  const evidence = {
    hasCoordinates: coordinateValidRange,
    lat,
    lon,
    parcelId: lot?.parcel || null,
    polygonWgs84: polygon,
    source: 'producer_declaration',
    cutOffDate: '2020-12-31',
    deforestationAssessment: coordinateValidRange
      ? 'PENDING_EXTERNAL_VALIDATION'
      : 'INSUFFICIENT_GEO_DATA'
  };
  return {
    ...evidence,
    precisionScore,
    hash: generateEvidenceHash('geo', evidence)
  };
}
