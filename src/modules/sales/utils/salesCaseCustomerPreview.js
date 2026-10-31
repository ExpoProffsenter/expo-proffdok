import { buildOfferSnapshot } from "./salesOfferLogic.js";
import { getOfferTermsSnapshot, getOfferTotal, getStoreOfferMeta } from "./salesUtils.js";

const array = (value) => Array.isArray(value) ? value : [];
const hasLines = (lines) => array(lines).some((line) =>
  !line?.__companyMeta && !line?.__offerTermsMeta && !line?.__storeOfferMeta &&
  (String(line?.description || "").trim() || String(line?.amount ?? "").trim())
);

function normalizeVersion(version = {}) {
  const total = Number(version.total ?? version.total_ex_vat ?? getOfferTotal(version.lines));
  return {
    ...version,
    versionNumber: version.versionNumber ?? version.version_number ?? null,
    total: Number.isFinite(total) ? total : getOfferTotal(version.lines),
    validityDays: version.validityDays ?? version.validity_days ?? "30",
    lines: array(version.lines),
    options: array(version.options),
  };
}

// Presentation copies only. This module never reads storage, fetches, publishes,
// changes a customer choice, or writes back a synthetic version to the case.
export function buildSalesCaseCustomerPreview(request = {}, companyProfile = {}) {
  const versions = array(request.offerVersions);
  const payload = request.acceptedPayload || {};
  const terminal = ["Akseptert", "Aktivert"].includes(request.status);
  const acceptedOptions = Array.isArray(request.acceptedOptions)
    ? request.acceptedOptions
    : array(payload.selected_options ?? payload.selectedOptions);
  let version;
  let kind;

  if (terminal) {
    const acceptedVersion = request.acceptedOfferVersionId
      ? versions.find((item) => item.id === request.acceptedOfferVersionId && hasLines(item.lines))
      : null;
    const payloadVersion = payload.version_snapshot ?? payload.versionSnapshot;
    if (acceptedVersion || hasLines(payloadVersion?.lines)) {
      version = normalizeVersion(acceptedVersion || payloadVersion);
    } else if (hasLines(request.acceptedOfferLines)) {
      const locked = {
        ...request,
        offerTitle: request.acceptedOfferTitle || request.offerTitle,
        offerIntro: request.acceptedOfferIntro || "",
        offerLines: request.acceptedOfferLines,
        offerOptions: acceptedOptions,
        offerReservations: request.acceptedOfferReservations || "",
        offerIncluded: request.acceptedOfferIncluded || "",
        offerExcluded: request.acceptedOfferExcluded || "",
        offerCustomerSupplied: request.acceptedOfferCustomerSupplied || "",
        offerTerms: request.acceptedOfferTerms || "",
        offerPaymentTerms: request.acceptedOfferPaymentTerms || "",
      };
      version = buildOfferSnapshot(locked, companyProfile, request.acceptedAt || "", `accepted-preview-${request.id}`);
      version.versionNumber = request.acceptedOfferVersionNumber || null;
      const lockedCompany = request.acceptedOfferLines.find((line) => line?.__companyMeta);
      if (lockedCompany) version.lines = version.lines.map((line) => line?.__companyMeta ? { ...lockedCompany } : line);
      // acceptedTotal includes selected options. The customer renderer adds them
      // itself; retain the stored base total rather than counting them twice.
      const optionTotal = getOfferTotal(acceptedOptions);
      if (request.acceptedTotal != null && Number.isFinite(Number(request.acceptedTotal))) {
        version.total = Number(request.acceptedTotal) - optionTotal;
      }
    }
    if (version) kind = "accepted";
  }

  if (!version && !terminal && request.sentOfferVersionId) {
    const published = versions.find((item) => item.id === request.sentOfferVersionId);
    if (published && hasLines(published.lines)) {
      version = normalizeVersion(published);
      kind = "published";
    }
  }
  if (!version && !terminal && !request.sentOfferVersionId && hasLines(request.offerLines)) {
    const source = {
      ...request,
      offerLines: array(request.offerLines).filter((line) => !line?.__companyMeta && !line?.__offerTermsMeta),
    };
    version = buildOfferSnapshot(source, companyProfile, "", `case-preview-${request.id}`);
    kind = "draft";
  }
  if (!version || !hasLines(version.lines)) return {
    kind: "empty",
    label: "Kundegrunnlag",
    message: terminal
      ? "Den låste tilbudsversjonen er ikke tilgjengelig i saksgrunnlaget. Åpne prosjektets tilbud og kontrakt for dokumentasjonen."
      : request.sentOfferVersionId
        ? "Den publiserte tilbudsversjonen er ikke tilgjengelig i saksgrunnlaget. Åpne den lagrede kundeversjonen fra saken."
        : "Kundetilbudet vises her når tilbudsposter er lagret på saken. Kundedata og befaringsnotat følger samme sak videre.",
  };

  version = normalizeVersion(version);
  const company = version.lines.find((line) => line?.__companyMeta);
  const terms = getOfferTermsSnapshot(version.lines);
  const storeMeta = getStoreOfferMeta(version.lines);
  const versionId = String(version.id || `case-preview-${request.id}`);
  const selectedOptionIds = kind === "accepted"
    ? Array.isArray(request.acceptedOptions) || Array.isArray(payload.selected_options ?? payload.selectedOptions)
      ? acceptedOptions.map((item) => item.id) : array(request.acceptedOptionIds)
    : [];
  // The accepted option payload contains the actual locked quantities/prices.
  if (kind === "accepted" && acceptedOptions.length) {
    version.options = version.options.map((option) => acceptedOptions.find((item) => String(item.id) === String(option.id)) || option);
  }
  const labels = { draft: "Lagret tilbudsgrunnlag · kladd", published: "Publisert kundetilbud", accepted: "Akseptert kundetilbud · låst" };
  return {
    kind,
    label: labels[kind],
    versionNumber: kind === "accepted" ? request.acceptedOfferVersionNumber || version.versionNumber : kind === "published" ? request.sentOfferVersionNumber || version.versionNumber : null,
    selectedOptionIds,
    acceptedTotal: kind === "accepted" ? request.acceptedTotal : null,
    request: {
      ...request,
      companyName: company ? company.companyName || "" : request.companyName || companyProfile.companyName || "",
      companyOrgNumber: company ? company.orgNumber || "" : request.companyOrgNumber || companyProfile.orgNumber || "",
      companyAddress: company ? company.address || "" : request.companyAddress || companyProfile.address || "",
      companyPhone: company ? company.phone || "" : request.companyPhone || companyProfile.phone || "",
      companyEmail: company ? company.email || "" : request.companyEmail || companyProfile.email || "",
      companyWebsite: company ? company.website || "" : request.companyWebsite || companyProfile.website || "",
      companyLogoUrl: company ? company.logoUrl || "" : request.companyLogoUrl || companyProfile.logoUrl || "",
      offerShowPricesExVat: terms.showPricesExVat === true,
      offerTitle: version.title || "",
      offerIntro: version.intro || "",
      offerTotal: version.total,
      offerReservations: version.reservations || "",
      offerIncluded: terms.included || "",
      offerExcluded: terms.excluded || "",
      offerCustomerSupplied: terms.customerSupplied || "",
      offerTerms: terms.terms || "",
      offerPaymentTerms: terms.paymentTerms || "",
      offerValidityDays: String(version.validityDays || "30"),
      storeOfferMeta: storeMeta.__storeOfferMeta ? storeMeta : null,
      offerVersions: [{ ...version, id: versionId }],
      offerLines: version.lines,
      offerOptions: version.options,
      sentOfferVersionId: versionId,
      sentOfferVersionNumber: kind === "draft" ? null : version.versionNumber,
      publicToken: "",
      isPublicOffer: true,
    },
  };
}
