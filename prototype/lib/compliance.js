import { executeService, calculateWeightedComplianceScore, determineComplianceStatus, generateEvidenceHash, generateFullHash } from '../services/apify-services.js';
import { generateId } from './validators.js';

/**
 * Ejecuta las cuatro verificaciones de cumplimiento en paralelo y devuelve
 * el reporte calculado más las alertas derivadas. Lógica pura: no escribe en disco.
 *
 * @param {object} input - Campos del lote/parcela
 * @param {Function} addBlockFn - blockchainSvc.addBlock.bind(blockchainSvc)
 * @returns {{ report: object, newAlerts: object[] }}
 */
export async function buildComplianceReport(
  { lotId, parcelId, producer, region, product, lat, lon },
  addBlockFn
) {
  const checks = await Promise.allSettled([
    executeService('euCompliance', { regulation: 'EUDR' }),
    executeService('weather',      { lat: lat || -6.78, lon: lon || -76.03 }),
    executeService('supplyChain',  { region: region || 'Perú' }),
    executeService('geolocation',  { search: parcelId, location: region })
  ]);

  const weightedScore = calculateWeightedComplianceScore(checks);
  const status = determineComplianceStatus(weightedScore);

  const weatherData = checks[1].value?.data;
  const weatherEvidence = weatherData
    ? {
      location: weatherData.location,
      conditions: weatherData.current,
      timestamp: weatherData.timestamp,
      hash: generateEvidenceHash('weather', weatherData)
    }
    : null;

  const block = addBlockFn({
    type: 'weather_evidence',
    lotId,
    weather: weatherEvidence,
    complianceScore: weightedScore
  });

  const timestamp = new Date().toISOString();

  const report = {
    id: generateId('CR'),
    lotId, parcelId,
    timestamp,
    checks: {
      euRegulations: checks[0].status === 'fulfilled' ? checks[0].value : { error: 'Falló' },
      weather:       checks[1].status === 'fulfilled' ? checks[1].value : { error: 'Falló' },
      supplyChain:   checks[2].status === 'fulfilled' ? checks[2].value : { error: 'Falló' },
      geolocation:   checks[3].status === 'fulfilled' ? checks[3].value : { error: 'Falló' }
    },
    weightedScore, status, weatherEvidence,
    blockHash: block.hash,
    // Se usa generateFullHash (SHA-256 completo, 64 chars) para la firma del reporte
    // de cumplimiento, ya que sirve como evidencia de integridad ante la normativa EUDR.
    // El mismo timestamp capturado arriba garantiza que el hash es consistente con el reporte.
    hash: generateFullHash({ lotId, timestamp, score: weightedScore })
  };

  const newAlerts = _buildAlertsFromChecks(checks, lotId);
  return { report, newAlerts };
}

function _buildAlertsFromChecks(checks, lotId) {
  const alerts = [];
  if (checks[2].value?.data?.alerts) {
    for (const alert of checks[2].value.data.alerts) {
      alerts.push({
        id: generateId('ALR'),
        lotId,
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        action: alert.action,
        timestamp: new Date().toISOString(),
        read: false
      });
    }
  }
  return alerts;
}
