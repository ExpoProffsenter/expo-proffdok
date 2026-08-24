// Expo ProffDok – FASE 30C2
// Stabilt, innholdsbasert fingeravtrykk for tilbudskladd.
// Brukes kun til å skille reell lokal endring fra samme innhold med nyere klokkeslett.

function compactAttachment(file) {
  if (!file) return null;
  return {
    id: String(file.id || ""),
    name: String(file.name || ""),
    path: String(file.path || file.storagePath || file.filePath || ""),
    url: String(file.url || file.href || ""),
    type: String(file.type || ""),
    size: Number(file.size || 0),
    customerVisible: file.customerVisible !== false,
  };
}

function lineHasContent(line = {}) {
  if (line.lineType === "administration") {
    return Boolean(
      String(line.adminPercent ?? "").trim() ||
        String(line.amount ?? "").trim() ||
        String(line.internalProductNumber || "").trim() ||
        String(line.productUrl || "").trim() ||
        String(line.imageName || "").trim() ||
        compactAttachment(line.attachmentFile)
    );
  }

  return Boolean(
    String(line.description || "").trim() ||
      String(line.amount ?? "").trim() ||
      String(line.internalProductNumber || "").trim() ||
      String(line.productUrl || "").trim() ||
      String(line.imageName || "").trim() ||
      compactAttachment(line.attachmentFile)
  );
}

function optionHasContent(option = {}) {
  return Boolean(
    String(option.title || "").trim() ||
      String(option.description || "").trim() ||
      String(option.amount ?? "").trim() ||
      String(option.internalProductNumber || "").trim() ||
      String(option.productUrl || "").trim() ||
      String(option.imageName || "").trim() ||
      compactAttachment(option.attachmentFile)
  );
}

function compactItem(item = {}) {
  const { imageDataUrl, attachmentFile, ...rest } = item;
  return {
    ...rest,
    imageDataUrl: "",
    attachmentFile: compactAttachment(attachmentFile),
  };
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== "object") return value;

  return Object.keys(value)
    .filter((key) => value[key] !== undefined)
    .sort()
    .reduce((result, key) => {
      result[key] = canonicalize(value[key]);
      return result;
    }, {});
}

export function normalizeOfferDraftForSignature(formValue = {}) {
  return {
    title: String(formValue.title || ""),
    intro: String(formValue.intro || ""),
    lines: (Array.isArray(formValue.lines) ? formValue.lines : [])
      .filter(lineHasContent)
      .map(compactItem),
    options: (Array.isArray(formValue.options) ? formValue.options : [])
      .filter(optionHasContent)
      .map(compactItem),
    reservations: String(formValue.reservations || ""),
    included: String(formValue.included || ""),
    excluded: String(formValue.excluded || ""),
    customerSupplied: String(formValue.customerSupplied || ""),
    terms: String(formValue.terms || ""),
    paymentTerms: String(formValue.paymentTerms || "10 dager netto"),
    validityDays: String(formValue.validityDays || "30"),
  };
}

export function createOfferDraftContentSignature(formValue = {}) {
  try {
    return JSON.stringify(canonicalize(normalizeOfferDraftForSignature(formValue)));
  } catch {
    return "";
  }
}

export function buildOfferFormForSignatureFromRequest(request = {}) {
  return {
    title: request.offerTitle || `Tilbud – ${request.title || ""}`,
    intro:
      request.offerIntro ||
      (request.directOffer
        ? `Vi tilbyr med dette følgende arbeider for ${request.customer || "kunden"}.`
        : `Vi viser til befaring og tilbyr med dette følgende arbeider for ${request.customer || "kunden"}.`),
    lines: Array.isArray(request.offerLines) ? request.offerLines : [],
    options: Array.isArray(request.offerOptions) ? request.offerOptions : [],
    reservations: request.offerReservations || "",
    included: request.offerIncluded || "",
    excluded: request.offerExcluded || "",
    customerSupplied: request.offerCustomerSupplied || "",
    terms: request.offerTerms || "",
    paymentTerms: request.offerPaymentTerms || "10 dager netto",
    validityDays: request.offerValidityDays || "30",
  };
}
