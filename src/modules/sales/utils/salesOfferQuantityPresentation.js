import { offerVatPresentation } from "./salesOfferVatPresentation.js";
// Expo ProffDok – FASE 37D2 / FASE 31A2B / FASE 39B.2C
// Felles, ren presentasjonsadapter for antall/enhetspris i kundetilbud og PDF.
// Butikkalternativer viser faktisk alternativpris i egen presentasjon og skal aldri
// få den interne prisdifferansen presentert som negativ enhetspris.
// Prisnøytrale Butikktilbud-avsnitt skal aldri dekoreres som varelinjer.
// Endrer aldri lagrede tilbudsdata; returnerer kun kopier til visning.

import {
  formatNok,
  formatOfferQuantity,
  getOfferUnitPrice,
  hasOfferQuantityDetails,
} from "./salesUtils.js";

const STORE_SECTION_MARKER = "#expo-store-text-block";

export function isStoreSectionLine(item = {}) {
  return Boolean(
    item?.lineType === "store_text" ||
      item?.storeSectionMode === "group" ||
      String(item?.productUrl || "").trim() === STORE_SECTION_MARKER ||
      String(item?.id || "").startsWith("store-section-")
  );
}

export function getStoreSectionTitle(item = {}) {
  const title = String(item?.storeTextTitle || "").trim();
  const body = String(item?.storeTextBody || "").trim();
  if (title && title !== "Nytt avsnitt") return title;
  if (title === "Nytt avsnitt" && body) return body;

  const description = String(item?.description || "").trim();
  if (description.toLowerCase().startsWith("nytt avsnitt")) {
    return description.slice("nytt avsnitt".length).trim() || body || "Avsnitt";
  }
  return description || body || "Avsnitt";
}

function getQuantityUnitPriceText(item = {}, multiplier = 1.25) {
  if (isStoreSectionLine(item) || !hasOfferQuantityDetails(item)) return "";

  return `Antall/enhetspris: ${formatOfferQuantity(item)} × ${formatNok(
    getOfferUnitPrice(item) * multiplier
  )}`;
}

function appendQuantityPresentation(value, item, fallback, multiplier) {
  const quantityText = getQuantityUnitPriceText(item, multiplier);
  const baseText = String(value || fallback || "").trim();

  if (!quantityText || item?.__quantityPresentationDecorated) {
    return baseText;
  }

  return `${baseText} — ${quantityText}`;
}

function decorateLine(line = {}, multiplier = 1.25) {
  if (line?.__companyMeta || line?.__offerTermsMeta || isStoreSectionLine(line)) {
    return line;
  }

  const quantityText = getQuantityUnitPriceText(line, multiplier);
  if (!quantityText || line?.__quantityPresentationDecorated) return line;

  return {
    ...line,
    description: appendQuantityPresentation(
      line.description,
      line,
      "Tilbudspost", multiplier
    ),
    __quantityPresentationDecorated: true,
  };
}

function decorateOption(option = {}, multiplier = 1.25) {
  // Store-alternativer lagrer differansen mot grunnpakken i amount. Den verdien
  // er korrekt for beregning, men er ikke en enhetspris kunden skal se.
  if (
    option?.optionType === "alternative" &&
    Number(option?.storeAlternativePricingVersion || 0) >= 2
  ) {
    return option;
  }

  const quantityText = getQuantityUnitPriceText(option, multiplier);
  if (!quantityText || option?.__quantityPresentationDecorated) return option;

  return {
    ...option,
    title: appendQuantityPresentation(option.title, option, "Opsjon", multiplier),
    __quantityPresentationDecorated: true,
  };
}

function decorateLines(lines = [], multiplier = 1.25) {
  return (Array.isArray(lines) ? lines : []).map(line => decorateLine(line, multiplier));
}

function decorateOptions(options = [], multiplier = 1.25) {
  return (Array.isArray(options) ? options : []).map(option => decorateOption(option, multiplier));
}

export function decorateRequestForQuantityPresentation(request = {}) {
  if (!request) return request;

  return {
    ...request,
    offerLines: decorateLines(request.offerLines, offerVatPresentation(request).multiplier),
    offerOptions: decorateOptions(request.offerOptions, offerVatPresentation(request).multiplier),
    offerVersions: Array.isArray(request.offerVersions)
      ? request.offerVersions.map((version) => ({
          ...version,
          lines: decorateLines(version.lines, offerVatPresentation(request, version.lines).multiplier),
          options: decorateOptions(version.options, offerVatPresentation(request, version.lines).multiplier),
        }))
      : request.offerVersions,
  };
}
