// Expo ProffDok – FASE 31A2
// Tilbudslinjer og opsjoner kan ha valgfritt antall/enhet. amount er fortsatt
// enhetspris eks. mva.; manglende antall behandles som 1 for full bakoverkompatibilitet.
// Expo ProffDok – FASE 31A1B
// Norsk prisformat som 1600,- og 1600.- summeres korrekt i tilbud, opsjoner og kundevisning.
// Ingen SQL/RLS/Storage/Edge-endring.
// Expo ProffDok – FASE 23A
// Rene hjelpefunksjoner for Befaring / Tilbud / Aksept.
// Ingen React-state, Supabase-kall, Storage-kall eller UI-rendering.

export function stripTransientPhotoData(request = {}) {
  return {
    ...request,
    inspectionPhotos: (request.inspectionPhotos || []).map(
      ({ dataUrl, previewUrl, ...photo }) => photo
    ),
  };
}

export function sanitizeStoragePart(value = "") {
  return (
    String(value)
      .trim()
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "fil"
  );
}

export function createRequestId(requests) {
  const highestNumber = requests.reduce((highest, request) => {
    const match = request.id?.match(/F-2026-(\d+)/);
    if (!match) return highest;
    return Math.max(highest, Number(match[1]));
  }, 41);

  return `F-2026-${String(highestNumber + 1).padStart(4, "0")}`;
}

export function formatInspectionDateTime(date, time) {
  if (!date) return time || "";

  const parsed = new Date(`${date}T${time || "00:00"}:00`);
  if (Number.isNaN(parsed.getTime())) {
    return [date, time ? `kl. ${time}` : ""].filter(Boolean).join(" ");
  }

  const formattedDate = new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);

  return `${formattedDate}${time ? ` kl. ${time}` : ""}`;
}

export function normalizeCompanyProfile(row = {}, fallbackEmail = "") {
  return {
    companyName: row.company_name || "",
    orgNumber: row.org_number || "",
    address: row.address || "",
    phone: row.phone || "",
    email: row.email || fallbackEmail || "",
    website: row.website || "",
    logoUrl: row.logo_url || "",
  };
}

export function hasCompanyProfile(profile = {}) {
  return Boolean(
    profile.companyName ||
      profile.orgNumber ||
      profile.address ||
      profile.phone ||
      profile.email ||
      profile.website ||
      profile.logoUrl
  );
}

export function createCompanySnapshot(profile = {}) {
  return {
    id: "__expo_company_snapshot__",
    __companyMeta: true,
    companyName: profile.companyName || "",
    orgNumber: profile.orgNumber || "",
    address: profile.address || "",
    phone: profile.phone || "",
    email: profile.email || "",
    website: profile.website || "",
    logoUrl: profile.logoUrl || "",
  };
}

export function createOfferTermsSnapshot(request = {}) {
  return {
    id: "__expo_offer_terms_snapshot__",
    __offerTermsMeta: true,
    terms: request.offerTerms || "",
    paymentTerms: request.offerPaymentTerms || "",
    included: request.offerIncluded || "",
    excluded: request.offerExcluded || "",
    customerSupplied: request.offerCustomerSupplied || "",
  };
}

export function getOfferTermsSnapshot(lines = []) {
  return Array.isArray(lines)
    ? lines.find((line) => line?.__offerTermsMeta) || {}
    : {};
}

export function getVisibleOfferLines(lines = []) {
  return Array.isArray(lines)
    ? lines.filter(
        (line) => !line?.__companyMeta && !line?.__offerTermsMeta
      )
    : [];
}

export function getInspectionContext(request = {}) {
  return {
    customerWishes:
      request.inspectionCustomerWishes ||
      request.customerWishes ||
      "",
    existingConditions:
      request.inspectionExistingConditions ||
      request.existingConditions ||
      "",
    measurements:
      request.inspectionMeasurements ||
      request.measurements ||
      "",
    observations:
      request.inspectionObservations ||
      request.observations ||
      request.inspectionNote ||
      "",
    photos:
      request.inspectionPhotos ||
      request.photos ||
      [],
  };
}

export function hasInspectionContext(request = {}) {
  const context = getInspectionContext(request);

  return Boolean(
    context.customerWishes ||
      context.existingConditions ||
      context.measurements ||
      context.observations ||
      context.photos?.length
  );
}

export function buildInspectionIntro(request = {}) {
  const context = getInspectionContext(request);
  const parts = [];

  if (context.customerWishes) {
    parts.push(`Kundens ønsker: ${context.customerWishes}`);
  }

  if (context.existingConditions) {
    parts.push(`Eksisterende forhold: ${context.existingConditions}`);
  }

  if (context.measurements) {
    parts.push(`Målinger: ${context.measurements}`);
  }

  if (context.observations) {
    parts.push(`Faglige observasjoner: ${context.observations}`);
  }

  return parts.join("\n\n");
}

export function getWorkflowSteps(request) {
  const activeStepByStatus = {
    Forespørsel: "Forespørsel",
    Befaring: "Befaring",
    Tilbud: "Tilbud",
    Akseptert: "Aksept",
    Aktivert: "Prosjekt",
  };

  const activeStep =
    activeStepByStatus[request.status] || "Forespørsel";

  const steps = [
    "Forespørsel",
    "Befaring",
    "Tilbud",
    "Akseptert",
    "Prosjekt",
  ];

  // Behold historisk label "Aksept" i UI selv om intern status heter Akseptert.
  const displaySteps = ["Forespørsel", "Befaring", "Tilbud", "Aksept", "Prosjekt"];
  const normalizedActiveStep = activeStep === "Aksept" ? "Akseptert" : activeStep;
  const activeIndex = steps.indexOf(normalizedActiveStep);

  return displaySteps.map((step, index) => ({
    label: step,
    state:
      index < activeIndex
        ? "done"
        : index === activeIndex
          ? "active"
          : "pending",
  }));
}

export function isEmailLike(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(value).trim()
  );
}

export function firstNonEmailName(...values) {
  const match = values
    .map((value) => String(value || "").trim())
    .find((value) => value && !isEmailLike(value));

  return match || "";
}

function normalizeOfferNumber(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s/g, "")
    .replace(/,-$/, "")
    .replace(/\.-$/, "")
    .replace(",", ".");
}

export function getOfferUnitPrice(item = {}) {
  const amount = Number(normalizeOfferNumber(item?.amount));
  return Number.isFinite(amount) ? amount : 0;
}

export function getOfferQuantity(item = {}) {
  const rawQuantity = String(item?.quantity ?? "").trim();
  if (!rawQuantity) return 1;

  const quantity = Number(normalizeOfferNumber(rawQuantity));
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
}

export function getOfferUnit(item = {}) {
  return String(item?.unit || "").trim();
}

export function hasOfferQuantityDetails(item = {}) {
  return Boolean(
    String(item?.quantity ?? "").trim() ||
      String(item?.unit || "").trim()
  );
}

export function formatOfferQuantity(item = {}) {
  const quantity = getOfferQuantity(item);
  const unit = getOfferUnit(item);
  const formattedQuantity = new Intl.NumberFormat("nb-NO", {
    maximumFractionDigits: 3,
  }).format(quantity);

  return unit ? `${formattedQuantity} ${unit}` : formattedQuantity;
}

export function getOfferTotal(lines) {
  return (Array.isArray(lines) ? lines : []).reduce((sum, line) => {
    const amount = getOfferUnitPrice(line);
    const quantity = getOfferQuantity(line);

    return sum + amount * quantity;
  }, 0);
}

export function formatNok(value) {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0,
  }).format(value);
}
