const STANDARD_VAT_MULTIPLIER = 1.25;

export function acceptedOfferTotalInclVat(value) {
  const totalExVat = Number(value);
  if (!Number.isFinite(totalExVat) || totalExVat <= 0) return 0;
  return totalExVat * STANDARD_VAT_MULTIPLIER;
}
