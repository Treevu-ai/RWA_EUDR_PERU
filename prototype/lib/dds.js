import { generateFullHash } from '../services/apify-services.js';
import { buildGeoEvidence } from './geo.js';
import { generateId } from './validators.js';

/**
 * Construye un documento DDS a partir de los datos del lote y el último reporte de compliance.
 * Función pura: no escribe en disco ni en blockchain.
 *
 * @param {object} lot - Objeto lote completo
 * @param {object|null} latestReport - Último reporte de compliance para este lote
 * @param {string} operator - Nombre del operador (req.body.operator o req.user.username)
 * @returns {object} dds - Documento de Debida Diligencia con hash calculado
 */
export function buildDds({ lot, latestReport, operator }) {
  const geoEvidence = buildGeoEvidence(lot);
  const dds = {
    id: generateId('DDS'),
    lotId: lot.id,
    product: lot.product,
    parcelId: lot.parcel,
    producer: lot.producer,
    operator,
    destination: lot.destination,
    createdAt: new Date().toISOString(),
    basedOnComplianceReportId: latestReport?.id || null,
    complianceScore: latestReport?.weightedScore ?? null,
    complianceStatus: latestReport?.status ?? 'PENDING',
    geolocationEvidence: geoEvidence,
    declarations: {
      deforestationFree: geoEvidence.hasCoordinates,
      legalProduction: true,
      dueDiligencePerformed: !!latestReport
    },
    status: geoEvidence.hasCoordinates && (latestReport?.weightedScore ?? 0) >= 80
      ? 'READY_FOR_REVIEW'
      : 'NEEDS_ACTION'
  };
  // Se calcula el hash ANTES de asignarlo al objeto para que la firma no se incluya
  // en su propia entrada y sea reproducible al excluir el campo hash explícitamente.
  // El hash es SHA-256 completo (64 chars) del documento sin el campo hash.
  dds.hash = generateFullHash({ ...dds });
  return dds;
}
