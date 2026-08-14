// Expo ProffDok – FASE 23F
// Ren tilbudslogikk for Befaring / Tilbud / Aksept.
// Ingen React-state, Supabase-kall, Storage-kall eller UI-rendering.

import {
  createCompanySnapshot,
  createOfferTermsSnapshot,
  getOfferTermsSnapshot,
  getOfferTotal,
  getVisibleOfferLines,
} from "./salesUtils.js";

export function createEmptyOfferLine() {
  return {
    id: `line-${Date.now()}-${Math.random()}`,
    description: "",
    amount: "",
    productUrl: "",
    imageDataUrl: "",
    imageName: "",
  };
}

export function createEmptyOfferOption() {
  return {
    id: `option-${Date.now()}-${Math.random()}`,
    title: "",
    description: "",
    amount: "",
    imageDataUrl: "",
    imageName: "",
  };
}

export function createInitialOfferForm() {
  return {
    title: "",
    intro: "",
    lines: [
      {
        id: "line-1",
        description: "",
        amount: "",
        productUrl: "",
        imageDataUrl: "",
        imageName: "",
      },
    ],
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

  return currentRequests.map((request) =>
    request.id === requestId
      ? {
          ...request,
          offerTitle: formValue.title,
          offerIntro: formValue.intro,
          offerLines: formValue.lines,
          offerOptions: formValue.options,
          offerReservations: formValue.reservations,
          offerIncluded: formValue.included,
          offerExcluded: formValue.excluded,
          offerCustomerSupplied: formValue.customerSupplied,
          offerTerms: formValue.terms,
          offerPaymentTerms: formValue.paymentTerms,
          offerValidityDays: formValue.validityDays,
          offerTotal: getOfferTotal(formValue.lines),
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
    lines:
      request?.offerLines?.length
        ? request.offerLines
        : [
            {
              id: `line-${Date.now()}`,
              description: "",
              amount: "",
              productUrl: "",
              imageDataUrl: "",
              imageName: "",
            },
          ],
    options: request?.offerOptions?.length ? request.offerOptions : [],
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
    lines: Array.isArray(storedDraft.lines)
      ? storedDraft.lines
      : requestForm.lines,
    options: Array.isArray(storedDraft.options)
      ? storedDraft.options
      : requestForm.options,
    terms: storedDraft.terms ?? requestForm.terms,
    included: storedDraft.included ?? requestForm.included,
    excluded: storedDraft.excluded ?? requestForm.excluded,
    customerSupplied:
      storedDraft.customerSupplied ?? requestForm.customerSupplied,
    paymentTerms: storedDraft.paymentTerms ?? requestForm.paymentTerms,
  };
}

export function prepareOfferFormForSave(formValue) {
  const cleanLines = (formValue.lines || [])
    .map((line) => ({
      ...line,
      description: String(line.description || "").trim(),
      amount: String(line.amount || "").trim(),
      productUrl: String(line.productUrl || "").trim(),
      imageDataUrl: line.imageDataUrl || "",
      imageName: line.imageName || "",
    }))
    .filter(
      (line) =>
        line.description ||
        line.amount ||
        line.productUrl ||
        line.imageDataUrl
    );

  const incompleteLine = cleanLines.find(
    (line) => !line.description || !line.amount
  );

  const cleanOptions = (formValue.options || [])
    .map((option) => ({
      ...option,
      title: String(option.title || "").trim(),
      description: String(option.description || "").trim(),
      amount: String(option.amount || "").trim(),
      productUrl: String(option.productUrl || "").trim(),
    }))
    .filter(
      (option) =>
        option.title ||
        option.description ||
        option.amount ||
        option.imageDataUrl ||
        option.productUrl
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
