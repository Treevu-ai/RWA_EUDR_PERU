/**
 * EUDR Risk Scoring Engine v1.1
 *
 * Changes from v1.0:
 * - Added supplyChainComplexity factor (10%)
 * - Added corruptionIndex factor (10%)
 * - Adjusted weights: NDVI 40% (was 50%), location 20% (was 30%),
 *   dataQuality 20% (unchanged), supplyChain 10% (new),
 *   corruption 10% (new)
 * - Added classifyRisk(): superseded by eudrRiskLevel for
 *   alignment with Art. 2.26 "negligible risk" threshold
 * - Added eudrRiskLevel: NEGLIGIBLE (<0.15), LOW (<0.35),
 *   MODERATE (<0.60), HIGH (>=0.60)
 * - Maintains backward compatibility: evaluateRisk() still
 *   returns score/status/breakdown
 */

const clamp01 = (value) => Math.max(0, Math.min(1, Number(value) || 0));

/**
 * Legacy classification (v1.0 compatible).
 */
const classify = (score) => {
  if (score < 0.2) return "LOW";
  if (score < 0.5) return "MEDIUM";
  return "HIGH";
};

/**
 * EUDR-aligned risk level mapping.
 *
 * NEGLIGIBLE: corresponds to Art. 2.26 "riesgo despreciable"
 *   — no reasonable concern remains after evaluation and mitigation.
 * LOW: minor concerns, likely resolvable with documentation.
 * MODERATE: significant concerns requiring mandatory mitigation (Art. 11).
 * HIGH: prohibitive — product must not enter the EU market
 *   unless risk is reduced.
 */
const eudrRiskLevel = (score) => {
  if (score < 0.15) return "NEGLIGIBLE";
  if (score < 0.35) return "LOW";
  if (score < 0.60) return "MODERATE";
  return "HIGH";
};

export const SCORING_VERSION = "v1.1";

/**
 * Evaluate EUDR compliance risk.
 *
 * @param {Object} params
 * @param {number} [params.ndviChange=0]       - Normalized vegetation index change (0-1)
 * @param {number} [params.locationRisk=0]     - Geographic risk factor (0-1)
 * @param {number} [params.dataQuality=0]      - Data completeness/quality metric (0-1)
 * @param {number} [params.supplyChainComplexity=0] - Number of intermediaries/transformations (0-1)
 * @param {number} [params.corruptionIndex=0]  - CPI-derived corruption risk (0-1)
 * @returns {{ score: number, status: string, eudrLevel: string, scoringVersion: string, breakdown: Object }}
 */
export const evaluateRisk = ({
  ndviChange = 0,
  locationRisk = 0,
  dataQuality = 0,
  supplyChainComplexity = 0,
  corruptionIndex = 0
}) => {
  const ndviComponent = clamp01(ndviChange);
  const locationComponent = clamp01(locationRisk);
  const dataQualityComponent = clamp01(dataQuality);
  const supplyChainComponent = clamp01(supplyChainComplexity);
  const corruptionComponent = clamp01(corruptionIndex);

  // v1.1 weights:
  // NDVI 40%, Location 20%, Data Quality 20%,
  // Supply Chain Complexity 10%, Corruption Index 10%
  const score =
    ndviComponent * 0.40 +
    locationComponent * 0.20 +
    dataQualityComponent * 0.20 +
    supplyChainComponent * 0.10 +
    corruptionComponent * 0.10;

  return {
    score: Number(score.toFixed(3)),
    status: classify(score),
    eudrLevel: eudrRiskLevel(score),
    scoringVersion: SCORING_VERSION,
    breakdown: {
      ndvi: {
        value: ndviComponent,
        weight: 0.40,
        contribution: Number((ndviComponent * 0.40).toFixed(3))
      },
      locationRisk: {
        value: locationComponent,
        weight: 0.20,
        contribution: Number((locationComponent * 0.20).toFixed(3))
      },
      dataQuality: {
        value: dataQualityComponent,
        weight: 0.20,
        contribution: Number((dataQualityComponent * 0.20).toFixed(3))
      },
      supplyChainComplexity: {
        value: supplyChainComponent,
        weight: 0.10,
        contribution: Number((supplyChainComponent * 0.10).toFixed(3))
      },
      corruptionIndex: {
        value: corruptionComponent,
        weight: 0.10,
        contribution: Number((corruptionComponent * 0.10).toFixed(3))
      }
    }
  };
};
