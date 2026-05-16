const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const calculateFinancialSnapshot = ({ weightKg, pricePerKg, financingRate = 0.6 }) => {
  const volumeKg = toNumber(weightKg);
  const unitPrice = toNumber(pricePerKg);
  const rate = toNumber(financingRate);

  const valueEstimated = volumeKg * unitPrice;
  const financingEligible = valueEstimated * rate;

  return {
    volumeKg: Number(volumeKg.toFixed(2)),
    pricePerKg: Number(unitPrice.toFixed(2)),
    financingRate: Number(rate.toFixed(2)),
    valueEstimated: Number(valueEstimated.toFixed(2)),
    financingEligible: Number(financingEligible.toFixed(2))
  };
};
