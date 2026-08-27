// Expo ProffDok – FASE 31A2B
// Felles, ren presentasjonsadapter for antall/enhetspris i kundetilbud og PDF.
// Endrer aldri lagrede tilbudsdata; returnerer kun kopier til visning.

import {
  formatNok,
  formatOfferQuantity,
  getOfferUnitPrice,
  hasOfferQuantityDetails,
} from "./salesUtils.js";

function getQuantityUnitPriceText(item = {}) {
  if (!hasOfferQuantityDetails(item)) return "";

  return `${formatOfferQuantity(item)} × ${formatNok(
    getOfferUnitPrice(item) * 1.25
  )}`;
}

function appendQuantityPresentation(value, item, fallback) {
  const quantityText = getQuantityUnitPriceText(item);
  const baseText = String(value || fallback || "").trim();

  if (!quantityText || item?.__quantityPresentationDecorated) {
    return baseText;
  }

  return `${baseText} — ${quantityText}`;
}

function decorateLine(line = {}) {
  if (line?.__companyMeta || line?.__offerTermsMeta) return line;

  const quantityText = getQuantityUnitPriceText(line);
  if (!quantityText || line?.__quantityPresentationDecorated) return line;

  return {
    ...line,
    description: appendQuantityPresentation(
      line.description,
      line,
      "Tilbudspost"
    ),
    __quantityPresentationDecorated: true,
  };
}

function decorateOption(option = {}) {
  const quantityText = getQuantityUnitPriceText(option);
  if (!quantityText || option?.__quantityPresentationDecorated) return option;

  return {
    ...option,
    title: appendQuantityPresentation(option.title, option, "Opsjon"),
    __quantityPresentationDecorated: true,
  };
}

function decorateLines(lines = []) {
  return (Array.isArray(lines) ? lines : []).map(decorateLine);
}

function decorateOptions(options = []) {
  return (Array.isArray(options) ? options : []).map(decorateOption);
}

export function decorateRequestForQuantityPresentation(request = {}) {
  if (!request) return request;

  return {
    ...request,
    offerLines: decorateLines(request.offerLines),
    offerOptions: decorateOptions(request.offerOptions),
    offerVersions: Array.isArray(request.offerVersions)
      ? request.offerVersions.map((version) => ({
          ...version,
          lines: decorateLines(version.lines),
          options: decorateOptions(version.options),
        }))
      : request.offerVersions,
  };
}
