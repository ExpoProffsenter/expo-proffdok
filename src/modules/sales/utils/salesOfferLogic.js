// Expo ProffDok – FASE 26B.1\n// Bevarer PDF-vedlegg på underposter og opsjoner i tilbudsdata. Ingen SQL/RLS/Storage-regelendring.\n// Expo ProffDok – FASE 26B
// Strukturert tilbudsbygger med hovedposter, underposter, koblede opsjoner og valgfri
// administrasjon/prosjektstyring. Beholder flat lines/options-modell for bakoverkompatibilitet.
// Ingen SQL/RLS/Storage/Edge/e-postendring.

import {
  createCompanySnapshot,
  createOfferTermsSnapshot,
  getOfferTermsSnapshot,
  getOfferTotal,
  getVisibleOfferLines,
} from "./salesUtils.js";

const LEGACY_MAIN_POST = {
  id: "ovrige-arbeider",
  title: "Øvrige arbeider",
};

function createEntityId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random()}`;
}

function normalizeMainPostMeta(item = {}) {
  const mainPostId = String(item.mainPostId || "").trim();
  const mainPostTitle = String(item.mainPostTitle || "").trim();

  if (mainPostId) {
    return {
      mainPostId,
      mainPostTitle: mainPostTitle || "Egen hovedpost",
    };
  }

  return {
    mainPostId: LEGACY_MAIN_POST.id,
    mainPostTitle: LEGACY_MAIN_POST.title,
  };
}

function parseOfferAmount(value) {
  const normalized = String(value ?? "")
    .trim()
    .replace(/\s/g, "")
    .replace(",", ".");

  if (!normalized) return 0;

  const numberValue = Number(normalized);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function toStoredOfferAmount(value) {
  if (!Number.isFinite(value)) return "";
  return String(Number(value.toFixed(2)));
}

export function createEmptyOfferLine(mainPost = null) {
  const postMeta = mainPost?.id
    ? {
        mainPostId: mainPost.id,
        mainPostTitle: mainPost.title || "Egen hovedpost",
      }
    : {
        mainPostId: LEGACY_MAIN_POST.id,
        mainPostTitle: LEGACY_MAIN_POST.title,
      };

  return {
    id: createEntityId("line"),
    ...postMeta,
    lineType: "work",
    description: "",
    amount: "",
    productUrl: "",
    imageDataUrl: "",
    imageName: "",
    attachmentFile: null,
  };
}

export function createOfferAdministrationLine(mainPost) {
  return {
    id: createEntityId("line"),
    mainPostId: mainPost?.id || LEGACY_MAIN_POST.id,
    mainPostTitle: mainPost?.title || LEGACY_MAIN_POST.title,
    lineType: "administration",
    description: "Administrasjon og prosjektstyring",
    adminMode: "percent",
    adminPercent: "",
    amount: "",
    productUrl: "",
    imageDataUrl: "",
    imageName: "",
    attachmentFile: null,
  };
}

export function createEmptyOfferOption(mainPost = null) {
  const postMeta = mainPost?.id
    ? {
        mainPostId: mainPost.id,
        mainPostTitle: mainPost.title || "Egen hovedpost",
      }
    : {
        mainPostId: LEGACY_MAIN_POST.id,
        mainPostTitle: LEGACY_MAIN_POST.title,
      };

  return {
    id: createEntityId("option"),
    ...postMeta,
    title: "",
    description: "",
    amount: "",
    productUrl: "",
    imageDataUrl: "",
    imageName: "",
    attachmentFile: null,
  };
}

export function normalizeOfferLines(lines = []) {
  return (Array.isArray(lines) ? lines : []).map((line) => {
    const mainPostMeta = normalizeMainPostMeta(line);

    return {
      ...line,
      ...mainPostMeta,
      lineType:
        line?.lineType === "administration" ? "administration" : "work",
      adminMode:
        line?.lineType === "administration"
          ? line.adminMode === "fixed"
            ? "fixed"
            : "percent"
          : undefined,
      adminPercent:
        line?.lineType === "administration"
          ? String(line.adminPercent ?? "")
          : undefined,
    };
  });
}

export function normalizeOfferOptions(options = []) {
  return (Array.isArray(options) ? options : []).map((option) => ({
    ...option,
    ...normalizeMainPostMeta(option),
  }));
}

export function recalculateAdministrationLines(lines = []) {
  const normalizedLines = normalizeOfferLines(lines);

  const baseTotals = normalizedLines.reduce((totals, line) => {
    if (line.lineType === "administration") return totals;

    const current = totals.get(line.mainPostId) || 0;
    totals.set(line.mainPostId, current + parseOfferAmount(line.amount));
    return totals;
  }, new Map());

  return normalizedLines.map((line) => {
    if (
      line.lineType !== "administration" ||
      line.adminMode === "fixed"
    ) {
      return line;
    }

    const percentText = String(line.adminPercent ?? "").trim();

    if (!percentText) {
      return { ...line, amount: "" };
    }

    const percent = parseOfferAmount(percentText);
    const baseTotal = baseTotals.get(line.mainPostId) || 0;
    const calculatedAmount = baseTotal * (percent / 100);

    return {
      ...line,
      amount: toStoredOfferAmount(calculatedAmount),
    };
  });
}

export function createInitialOfferForm() {
  return {
    title: "",
    intro: "",
    lines: [],
    options: [],
    reservations: "",
    included: "",
    excluded: "",
    customerSupplied: "",
    terms: "",
    paymentTerms: "10 dager netto",
    validityDays: "30",
  };
}

export function mergeOfferDraftIntoRequests(
  currentRequests,
  formValue,
  requestId,
  savedAt = new Date().toISOString()
) {
  if (!requestId) return currentRequests;

  const normalizedLines = recalculateAdministrationLines(formValue.lines || []);
  const normalizedOptions = normalizeOfferOptions(formValue.options || []);

  return currentRequests.map((request) =>
    request.id === requestId
      ? {
          ...request,
          offerTitle: formValue.title,
          offerIntro: formValue.intro,
          offerLines: normalizedLines,
          offerOptions: normalizedOptions,
          offerReservations: formValue.reservations,
          offerIncluded: formValue.included,
          offerExcluded: formValue.excluded,
          offerCustomerSupplied: formValue.customerSupplied,
          offerTerms: formValue.terms,
          offerPaymentTerms: formValue.paymentTerms,
          offerValidityDays: formValue.validityDays,
          offerTotal: getOfferTotal(normalizedLines),
          offerDraftSavedAt: savedAt,
        }
      : request
  );
}

export function buildOfferFormFromRequest(request) {
  return {
    title: request?.offerTitle || `Tilbud – ${request?.title || ""}`,
    intro:
      request?.offerIntro ||
      `Vi viser til befaring og tilbyr med dette følgende arbeider for ${request?.customer || "kunden"}.`,
    lines: recalculateAdministrationLines(request?.offerLines || []),
    options: normalizeOfferOptions(request?.offerOptions || []),
    reservations: request?.offerReservations || "",
    included: request?.offerIncluded || "",
    excluded: request?.offerExcluded || "",
    customerSupplied: request?.offerCustomerSupplied || "",
    terms: request?.offerTerms || "",
    paymentTerms: request?.offerPaymentTerms || "10 dager netto",
    validityDays: request?.offerValidityDays || "30",
  };
}

export function normalizeStoredOfferDraft(storedDraft, request) {
  const requestForm = buildOfferFormFromRequest(request);
  if (!storedDraft) return requestForm;

  return {
    ...requestForm,
    ...storedDraft,
    lines: recalculateAdministrationLines(
      Array.isArray(storedDraft.lines) ? storedDraft.lines : requestForm.lines
    ),
    options: normalizeOfferOptions(
      Array.isArray(storedDraft.options)
        ? storedDraft.options
        : requestForm.options
    ),
    terms: storedDraft.terms ?? requestForm.terms,
    included: storedDraft.included ?? requestForm.included,
    excluded: storedDraft.excluded ?? requestForm.excluded,
    customerSupplied:
      storedDraft.customerSupplied ?? requestForm.customerSupplied,
    paymentTerms: storedDraft.paymentTerms ?? requestForm.paymentTerms,
  };
}

export function prepareOfferFormForSave(formValue) {
  const recalculatedLines = recalculateAdministrationLines(formValue.lines || []);

  const cleanLines = recalculatedLines
    .map((line) => ({
      ...line,
      mainPostId: String(line.mainPostId || LEGACY_MAIN_POST.id).trim(),
      mainPostTitle: String(
        line.mainPostTitle || LEGACY_MAIN_POST.title
      ).trim(),
      description: String(line.description || "").trim(),
      amount: String(line.amount || "").trim(),
      productUrl: String(line.productUrl || "").trim(),
      imageDataUrl: line.imageDataUrl || "",
      imageName: line.imageName || "",
      attachmentFile: line.attachmentFile
        ? {
            ...line.attachmentFile,
            name: String(line.attachmentFile.name || "").trim(),
            url: String(line.attachmentFile.url || "").trim(),
            path: String(line.attachmentFile.path || "").trim(),
            type: String(line.attachmentFile.type || "application/pdf").trim(),
            size: Number(line.attachmentFile.size || 0),
            customerVisible: line.attachmentFile.customerVisible !== false,
          }
        : null,
      ...(line.lineType === "administration"
        ? {
            lineType: "administration",
            adminMode: line.adminMode === "fixed" ? "fixed" : "percent",
            adminPercent: String(line.adminPercent ?? "").trim(),
          }
        : { lineType: "work" }),
    }))
    .filter(
      (line) =>
        line.description ||
        line.amount ||
        line.productUrl ||
        line.imageDataUrl ||
        line.attachmentFile?.url
    );

  const incompleteLine = cleanLines.find(
    (line) => !line.description || !line.amount
  );

  const cleanOptions = normalizeOfferOptions(formValue.options || [])
    .map((option) => ({
      ...option,
      mainPostId: String(option.mainPostId || LEGACY_MAIN_POST.id).trim(),
      mainPostTitle: String(
        option.mainPostTitle || LEGACY_MAIN_POST.title
      ).trim(),
      title: String(option.title || "").trim(),
      description: String(option.description || "").trim(),
      amount: String(option.amount || "").trim(),
      productUrl: String(option.productUrl || "").trim(),
      imageDataUrl: option.imageDataUrl || "",
      imageName: option.imageName || "",
      attachmentFile: option.attachmentFile
        ? {
            ...option.attachmentFile,
            name: String(option.attachmentFile.name || "").trim(),
            url: String(option.attachmentFile.url || "").trim(),
            path: String(option.attachmentFile.path || "").trim(),
            type: String(option.attachmentFile.type || "application/pdf").trim(),
            size: Number(option.attachmentFile.size || 0),
            customerVisible: option.attachmentFile.customerVisible !== false,
          }
        : null,
    }))
    .filter(
      (option) =>
        option.title ||
        option.description ||
        option.amount ||
        option.imageDataUrl ||
        option.productUrl ||
        option.attachmentFile?.url
    );

  return { cleanLines, cleanOptions, incompleteLine };
}

export function buildOfferSnapshot(
  request,
  companyProfile,
  createdAt = new Date().toISOString(),
  snapshotId = `offer-version-${Date.now()}`
) {
  const versionNumber = (request.offerVersions?.length || 0) + 1;

  return {
    id: snapshotId,
    versionNumber,
    createdAt,
    title: request.offerTitle || "",
    intro: request.offerIntro || "",
    lines: [
      createCompanySnapshot(companyProfile),
      createOfferTermsSnapshot(request),
      ...(request.offerLines || []),
    ],
    options: request.offerOptions || [],
    reservations: request.offerReservations || "",
    validityDays: request.offerValidityDays || "30",
    total: request.offerTotal || 0,
  };
}

export function createOrReuseSentOfferVersion(request, companyProfile) {
  if (request.sentOfferVersionId) return request;

  const snapshot = buildOfferSnapshot(request, companyProfile);

  return {
    ...request,
    offerVersions: [...(request.offerVersions || []), snapshot],
    sentOfferVersionId: snapshot.id,
    sentOfferVersionNumber: snapshot.versionNumber,
    sentOfferAt: snapshot.createdAt,
  };
}

export function getActiveOfferVersion(request) {
  if (!request?.sentOfferVersionId) return null;

  return (
    request.offerVersions?.find(
      (version) => version.id === request.sentOfferVersionId
    ) || null
  );
}

export function createNewOfferVersionDraft(request) {
  return {
    ...request,
    sentOfferVersionId: null,
    sentOfferVersionNumber: null,
    sentOfferAt: null,
    nextStep: "Send tilbud til kunde",
  };
}

export function buildPublishPayload(request, profileForPublish) {
  return {
    offer_id: request.salesOfferId || null,
    request_ref: request.id,
    customer_name: request.customer,
    customer_email: request.email,
    customer_phone: request.phone,
    customer_address: [
      request.address,
      [request.postnr, request.city].filter(Boolean).join(" "),
    ]
      .filter(Boolean)
      .join(", "),
    title: request.offerTitle || request.title,
    intro: request.offerIntro || "",
    lines: [
      createCompanySnapshot(profileForPublish),
      createOfferTermsSnapshot(request),
      ...(request.offerLines || []),
    ],
    options: request.offerOptions || [],
    reservations: request.offerReservations || "",
    validity_days: Number(request.offerValidityDays || 30),
    total_ex_vat: request.offerTotal || 0,
  };
}

export function mapPublicOfferToRequest(result) {
  const offer = result?.offer;
  const version = result?.version;

  if (!offer || !version) return null;

  const publishedLines = Array.isArray(version.lines) ? version.lines : [];
  const companySnapshot =
    publishedLines.find((line) => line?.__companyMeta) || {};
  const offerTermsSnapshot = getOfferTermsSnapshot(publishedLines);
  const visibleOfferLines = getVisibleOfferLines(publishedLines);

  return {
    id: offer.request_ref || offer.id,
    salesOfferId: offer.id,
    title: version.title || offer.title,
    offerTitle: version.title || offer.title,
    offerIntro: version.intro || "",
    offerLines: visibleOfferLines,
    companyName: companySnapshot.companyName || "",
    companyOrgNumber: companySnapshot.orgNumber || "",
    companyAddress: companySnapshot.address || "",
    companyPhone: companySnapshot.phone || "",
    companyEmail: companySnapshot.email || "",
    companyWebsite: companySnapshot.website || "",
    companyLogoUrl: companySnapshot.logoUrl || "",
    offerOptions: version.options || [],
    offerReservations: version.reservations || "",
    offerIncluded: offerTermsSnapshot.included || "",
    offerExcluded: offerTermsSnapshot.excluded || "",
    offerCustomerSupplied: offerTermsSnapshot.customerSupplied || "",
    offerTerms: offerTermsSnapshot.terms || "",
    offerPaymentTerms: offerTermsSnapshot.paymentTerms || "",
    offerValidityDays: String(version.validity_days || 30),
    offerTotal: Number(version.total_ex_vat || 0),
    customer: offer.customer_name,
    email: offer.customer_email,
    phone: offer.customer_phone,
    address: offer.customer_address,
    status: offer.status === "accepted" ? "Akseptert" : "Tilbud",
    statusClass:
      offer.status === "accepted"
        ? "sales-status-accepted"
        : "sales-status-quote",
    nextStep:
      offer.status === "accepted"
        ? "Tilbudet er akseptert"
        : "Digital aksept",
    iconName: offer.status === "accepted" ? "home" : "send",
    sentOfferVersionId: version.id,
    sentOfferVersionNumber: version.version_number,
    publicToken: offer.public_token,
    isPublicOffer: true,
    acceptedBy: offer.accepted_by,
    acceptedAt: offer.accepted_at,
    acceptedPayload: offer.accepted_payload,
  };
}
