// Expo ProffDok – FASE 37D1
// Butikktilbud arbeider med faktiske priser inkl. mva. i editoren, men konverterer
// til eksisterende Sales-modells prisendring eks. mva. for lagring, publisering og aksept.
// Dermed kan en alternativ vare også endre tilhørende monteringspris uten ny DB-modell.

const VAT_FACTOR = 1.25;

export function parseStoreNumber(value, fallback = 0) {
  const normalized = String(value ?? "")
    .trim()
    .replace(/\s/g, "")
    .replace(/,-$/, "")
    .replace(/\.-$/, "")
    .replace(",", ".");
  if (!normalized) return fallback;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function storeNumber(value) {
  if (!Number.isFinite(value)) return "";
  return String(Number(value.toFixed(2)));
}

export function storeDiscount(value) {
  return Math.min(100, Math.max(0, parseStoreNumber(value, 0)));
}

export function storeQuantity(item = {}) {
  const quantity = parseStoreNumber(item?.quantity, 1);
  return quantity > 0 ? quantity : 1;
}

export function storeGrossUnitPrice(item = {}) {
  const explicit = parseStoreNumber(item?.storeUnitPriceInclVat, Number.NaN);
  if (Number.isFinite(explicit)) return explicit;

  const net = parseStoreNumber(item?.amount, 0);
  const discountFactor = 1 - storeDiscount(item?.storeDiscountPercent) / 100;
  if (discountFactor <= 0) return 0;
  return (net * VAT_FACTOR) / discountFactor;
}

export function storeGrossTotal(item = {}) {
  return (
    storeGrossUnitPrice(item) *
    storeQuantity(item) *
    (1 - storeDiscount(item?.storeDiscountPercent) / 100)
  );
}

export function buildNobbItemUrl(value = "") {
  const nobb = String(value || "").replace(/\D/g, "");
  return nobb ? `https://nobb.no/item/${nobb}` : "";
}

export function getStoreAlternativeBreakdown(option = {}, lines = []) {
  const sourceLines = Array.isArray(lines) ? lines : [];
  const replacement = sourceLines.find(
    (line) => String(line?.id || "") === String(option?.replacementLineId || "")
  );
  const installationReplacement = sourceLines.find(
    (line) =>
      String(line?.id || "") ===
      String(option?.storeInstallationReplacementLineId || "")
  );

  const newItemTotal = storeGrossTotal(option);
  const replacedItemTotal = replacement ? storeGrossTotal(replacement) : 0;

  const hasInstallationOverride = Boolean(
    installationReplacement &&
      String(option?.storeInstallationPriceInclVat ?? "").trim()
  );
  const oldInstallationTotal = hasInstallationOverride
    ? storeGrossTotal(installationReplacement)
    : 0;
  const newInstallationTotal = hasInstallationOverride
    ? parseStoreNumber(option.storeInstallationPriceInclVat, 0)
    : 0;

  const itemDelta = newItemTotal - replacedItemTotal;
  const installationDelta = newInstallationTotal - oldInstallationTotal;
  const totalDelta = itemDelta + installationDelta;

  return {
    replacement,
    installationReplacement,
    hasInstallationOverride,
    newItemTotal,
    replacedItemTotal,
    oldInstallationTotal,
    newInstallationTotal,
    itemDelta,
    installationDelta,
    totalDelta,
    newPackageTotal:
      newItemTotal + (hasInstallationOverride ? newInstallationTotal : 0),
    oldPackageTotal:
      replacedItemTotal + (hasInstallationOverride ? oldInstallationTotal : 0),
  };
}

function generatedAlternativeDescription(option, breakdown) {
  if (option?.optionType !== "alternative") return String(option?.description || "");

  const parts = [];
  const nobb = String(option?.nobbNumber || "").trim();
  if (nobb) parts.push(`NOBB ${nobb}`);

  if (breakdown.replacement?.mainPostId === "butikk-montering") {
    parts.push(
      `Ny monteringspris ${Math.round(breakdown.newItemTotal).toLocaleString(
        "nb-NO"
      )} kr inkl. mva.`
    );
  } else {
    parts.push(
      `Alternativ varepris ${Math.round(breakdown.newItemTotal).toLocaleString(
        "nb-NO"
      )} kr inkl. mva.`
    );
    if (breakdown.hasInstallationOverride) {
      parts.push(
        `Montering med dette alternativet ${Math.round(
          breakdown.newInstallationTotal
        ).toLocaleString("nb-NO")} kr inkl. mva.`
      );
    }
  }

  return parts.join(" · ");
}

export function recalculateStoreOption(option = {}, lines = []) {
  const sourceLines = Array.isArray(lines) ? lines : [];
  const next = { ...option };

  if (next.nobbNumber && !String(next.productUrl || "").trim()) {
    next.productUrl = buildNobbItemUrl(next.nobbNumber);
    next.storeAutoProductUrl = true;
  } else if (
    next.storeAutoProductUrl &&
    String(next.productUrl || "").trim() &&
    String(next.productUrl || "").trim() !== buildNobbItemUrl(next.nobbNumber)
  ) {
    next.storeAutoProductUrl = false;
  }

  if (next.optionType !== "alternative") {
    const gross = storeGrossUnitPrice(next);
    const discount = storeDiscount(next.storeDiscountPercent);
    next.amount = storeNumber((gross * (1 - discount / 100)) / VAT_FACTOR);
    next.storeAlternativePricingVersion = undefined;
    next.storeAlternativeDeltaInclVat = undefined;
    next.storeAlternativeItemTotalInclVat = undefined;
    next.storeReplacedItemTotalInclVat = undefined;
    next.storeInstallationOriginalTotalInclVat = undefined;
    next.storeInstallationAlternativeTotalInclVat = undefined;
    next.storeAlternativePackageTotalInclVat = undefined;
    next.storeAutoDescription = undefined;
    return next;
  }

  // 37D1-migrering: eldre butikkalternativer hadde bare én erstattet vare.
  // Når saken har nøyaktig én monteringspost kobles den inn med uendret pris,
  // slik at brukeren umiddelbart kan justere monteringen for alternativet.
  const replacement = sourceLines.find(
    (line) => String(line?.id || "") === String(next.replacementLineId || "")
  );
  if (
    replacement?.mainPostId === "butikk-varer" &&
    !next.storeInstallationReplacementLineId
  ) {
    const installationLines = sourceLines.filter(
      (line) => line?.mainPostId === "butikk-montering" && !line?.__storeOfferMeta
    );
    if (installationLines.length === 1) {
      next.storeInstallationReplacementLineId = installationLines[0].id;
      next.storeInstallationPriceInclVat = storeNumber(
        storeGrossTotal(installationLines[0])
      );
    }
  }

  const breakdown = getStoreAlternativeBreakdown(next, sourceLines);
  const quantity = storeQuantity(next);
  next.amount = storeNumber((breakdown.totalDelta / VAT_FACTOR) / quantity);
  next.storeAlternativePricingVersion = 2;
  next.storeAlternativeDeltaInclVat = storeNumber(breakdown.totalDelta);
  next.storeAlternativeItemTotalInclVat = storeNumber(breakdown.newItemTotal);
  next.storeReplacedItemTotalInclVat = storeNumber(breakdown.replacedItemTotal);
  next.storeInstallationOriginalTotalInclVat = breakdown.hasInstallationOverride
    ? storeNumber(breakdown.oldInstallationTotal)
    : "";
  next.storeInstallationAlternativeTotalInclVat = breakdown.hasInstallationOverride
    ? storeNumber(breakdown.newInstallationTotal)
    : "";
  next.storeAlternativePackageTotalInclVat = storeNumber(
    breakdown.newPackageTotal
  );

  const generated = generatedAlternativeDescription(next, breakdown);
  if (!String(next.description || "").trim() || next.storeAutoDescription) {
    next.description = generated;
    next.storeAutoDescription = true;
  }

  return next;
}

export function recalculateStoreOptions(options = [], lines = []) {
  return (Array.isArray(options) ? options : []).map((option) =>
    recalculateStoreOption(option, lines)
  );
}

export function formatStoreDelta(value) {
  const number = parseStoreNumber(value, 0);
  if (number === 0) return "0 kr";
  const sign = number > 0 ? "+" : "−";
  return `${sign} ${Math.abs(Math.round(number)).toLocaleString("nb-NO")} kr`;
}
