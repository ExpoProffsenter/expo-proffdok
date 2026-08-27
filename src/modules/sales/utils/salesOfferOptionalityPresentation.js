// Expo ProffDok – FASE 31A2B
// Tydeliggjør at opsjoner er valgfrie i kundevisning og PDF.
// Endrer kun presentasjonskopier – aldri lagrede tilbudsdata eller prislogikk.

import { getOfferTotal } from "./salesUtils.js";

function isAlternativeOption(option = {}) {
  return option?.optionType === "alternative";
}

function getOptionalityNote(option = {}) {
  if (isAlternativeOption(option)) {
    return "Valgfritt alternativ. Prisendringen gjelder kun dersom alternativet velges.";
  }

  if (getOfferTotal([option]) < 0) {
    return "Valgfri opsjon. Fradraget gjelder kun dersom opsjonen velges.";
  }

  return "Valgfri opsjon. Ikke inkludert i tilbudssummen før den velges.";
}

function decorateOption(option = {}) {
  if (!option || option.__optionOptionalityDecorated) return option;

  const originalTitle = String(option.title || "Opsjon").trim();
  const originalDescription = String(option.description || "").trim();
  const prefix = isAlternativeOption(option)
    ? "VALGFRITT ALTERNATIV"
    : "VALGFRI OPSJON";
  const note = getOptionalityNote(option);

  return {
    ...option,
    title: `${prefix} – ${originalTitle}`,
    description: originalDescription
      ? `${originalDescription}\n\n${note}`
      : note,
    __optionOptionalityDecorated: true,
  };
}

function decorateOptions(options = []) {
  return (Array.isArray(options) ? options : []).map(decorateOption);
}

export function decorateRequestForOptionalityPresentation(request = {}) {
  if (!request) return request;

  return {
    ...request,
    offerOptions: decorateOptions(request.offerOptions),
    offerVersions: Array.isArray(request.offerVersions)
      ? request.offerVersions.map((version) => ({
          ...version,
          options: decorateOptions(version.options),
        }))
      : request.offerVersions,
  };
}
