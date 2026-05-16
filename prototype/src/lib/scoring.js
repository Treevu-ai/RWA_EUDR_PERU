const clamp01 = (value) => Math.max(0, Math.min(1, Number(value) || 0));

const classify = (score) => {
  if (score < 0.2) return "LOW";
  if (score < 0.5) return "MEDIUM";
  return "HIGH";
};

export const SCORING_VERSION = "v1.0";

export const evaluateRisk = ({ ndviChange = 0, locationRisk = 0, dataQuality = 0 }) => {
  const ndviComponent = clamp01(ndviChange);
  const locationComponent = clamp01(locationRisk);
  const dataQualityComponent = clamp01(dataQuality);

  const score =
    ndviComponent * 0.5 +
    locationComponent * 0.3 +
    dataQualityComponent * 0.2;

  return {
    score: Number(score.toFixed(3)),
    status: classify(score),
    scoringVersion: SCORING_VERSION,
    breakdown: {
      ndvi: {
        value: ndviComponent,
        weight: 0.5,
        contribution: Number((ndviComponent * 0.5).toFixed(3))
      },
      locationRisk: {
        value: locationComponent,
        weight: 0.3,
        contribution: Number((locationComponent * 0.3).toFixed(3))
      },
      dataQuality: {
        value: dataQualityComponent,
        weight: 0.2,
        contribution: Number((dataQualityComponent * 0.2).toFixed(3))
      }
    }
  };
};
