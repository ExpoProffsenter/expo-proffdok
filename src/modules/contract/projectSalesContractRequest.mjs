// Expo ProffDok – Production-QA UX
// Adapter mellom prosjektets låste Sales-opprinnelse og eksisterende kontraktmotor.
// Ingen data skrives her; den aksepterte, publiserte tilbudsversjonen er fasit.

import { mapPublicOfferToRequest } from "../sales/utils/salesOfferLogic.js";

const clean = (value = "") => String(value ?? "").trim();
const list = (value) => (Array.isArray(value) ? value : []);

function isContractDocument(file = {}) {
  const documentType = clean(file?.documentType).toLowerCase();
  const contractSource = clean(file?.contractSource).toLowerCase();
  const name = clean(file?.name).toLowerCase();
  return (
    documentType === "contract" ||
    contractSource === "expo" ||
    contractSource === "external" ||
    /kontrakt|contract/.test(name)
  );
}

export function isSimpleOrderProject(project = {}) {
  return (
    clean(project?.workflowType).toLowerCase() === "simple_order" ||
    project?.simpleOrder === true
  );
}

export function hasProjectSalesOrigin(project = {}) {
  return Boolean(clean(project?.salesOrigin?.requestRef)) && !isSimpleOrderProject(project);
}

export function hasAcceptedPublicOffer(publicOfferData = null) {
  return (
    clean(publicOfferData?.offer?.status).toLowerCase() === "accepted" &&
    Boolean(publicOfferData?.offer) &&
    Boolean(publicOfferData?.version)
  );
}

export function publicOfferMatchesProjectOrigin(project = {}, publicOfferData = null) {
  if (!hasAcceptedPublicOffer(publicOfferData)) return false;

  const salesOrigin = project?.salesOrigin || {};
  const offer = publicOfferData?.offer || {};
  const version = publicOfferData?.version || {};
  const acceptedPayload = offer?.accepted_payload || {};
  const expectedRequestRef = clean(salesOrigin?.requestRef);
  const expectedOfferId = clean(salesOrigin?.salesOfferId);
  const expectedVersionId = clean(salesOrigin?.acceptedOfferVersionId);
  const returnedRequestRef = clean(offer?.request_ref);
  const returnedOfferId = clean(offer?.id || acceptedPayload?.offer_id);
  const returnedVersionId = clean(version?.id || acceptedPayload?.version_id);

  if (!returnedOfferId || !returnedVersionId) return false;
  if (expectedRequestRef && expectedRequestRef !== returnedRequestRef) return false;
  if (expectedOfferId && expectedOfferId !== returnedOfferId) return false;
  if (expectedVersionId && expectedVersionId !== returnedVersionId) return false;
  return true;
}

export function buildProjectSalesContractRequest({
  project = {},
  tilbud = {},
  publicOfferData = null,
} = {}) {
  const salesOrigin = project?.salesOrigin || {};
  const mapped = mapPublicOfferToRequest(publicOfferData) || {};
  const snapshot = tilbud?.acceptedOfferSnapshot || {};
  const files = list(tilbud?.files);
  const contractFile = files.find(isContractDocument) || null;

  const acceptedOfferLines = list(mapped?.acceptedOfferLines).length
    ? list(mapped.acceptedOfferLines)
    : list(snapshot?.lines);
  const acceptedOptions = list(mapped?.acceptedOptions).length
    ? list(mapped.acceptedOptions)
    : list(snapshot?.selectedOptions);
  const salesOfferId = clean(
    salesOrigin?.salesOfferId ||
      mapped?.salesOfferId ||
      publicOfferData?.offer?.id ||
      mapped?.acceptedPayload?.offer_id
  );
  const acceptedOfferVersionId = clean(
    salesOrigin?.acceptedOfferVersionId ||
      mapped?.acceptedOfferVersionId ||
      publicOfferData?.version?.id ||
      mapped?.acceptedPayload?.version_id
  );
  const acceptedOfferVersionNumber =
    salesOrigin?.acceptedOfferVersionNumber ||
    mapped?.acceptedOfferVersionNumber ||
    snapshot?.sourceVersionNumber ||
    publicOfferData?.version?.version_number ||
    "";
  const mappedAcceptedPayload = mapped?.acceptedPayload || {};
  const mappedVersionSnapshot = mappedAcceptedPayload?.version_snapshot || {};
  const acceptedTotalFromOrigin = Number(salesOrigin?.acceptedTotal || 0);
  const acceptedTotal =
    acceptedTotalFromOrigin > 0
      ? acceptedTotalFromOrigin
      : Number(mapped?.acceptedTotal || snapshot?.totalExVat || 0);

  return {
    ...mapped,
    id: clean(salesOrigin?.requestRef || mapped?.id),
    status: "Akseptert",
    salesOfferId,
    publicToken: clean(salesOrigin?.publicToken || mapped?.publicToken),
    title: clean(mapped?.title || project?.projectName || "Kontrakt"),
    offerTitle: clean(mapped?.offerTitle || project?.projectName || "Kontrakt"),
    customer: clean(project?.customer || mapped?.customer),
    email: clean(project?.customerEmail || mapped?.email),
    phone: clean(project?.customerPhone || mapped?.phone),
    address: clean(project?.address || mapped?.address),
    postnr: clean(project?.postnr || mapped?.postnr),
    city: clean(project?.city || mapped?.city),
    responsible: clean(project?.responsible || mapped?.responsible),
    projectResponsible: clean(project?.responsible || mapped?.projectResponsible),
    acceptedBy: clean(salesOrigin?.acceptedBy || mapped?.acceptedBy),
    acceptedAt: clean(salesOrigin?.acceptedAt || mapped?.acceptedAt),
    acceptedOfferVersionId,
    acceptedOfferVersionNumber,
    acceptedOfferLines,
    acceptedOptions,
    acceptedOptionIds: acceptedOptions.map((option) => option?.id).filter(Boolean),
    acceptedTotal,
    contractFile,
    acceptedPayload: {
      ...mappedAcceptedPayload,
      offer_id: salesOfferId || mappedAcceptedPayload?.offer_id || null,
      version_id:
        acceptedOfferVersionId || mappedAcceptedPayload?.version_id || null,
      version_number:
        acceptedOfferVersionNumber || mappedAcceptedPayload?.version_number || null,
      selected_options: acceptedOptions,
      version_snapshot: {
        ...mappedVersionSnapshot,
        id:
          acceptedOfferVersionId ||
          mappedVersionSnapshot?.id ||
          mappedVersionSnapshot?.version_id ||
          null,
        version_number:
          acceptedOfferVersionNumber || mappedVersionSnapshot?.version_number || null,
        total_ex_vat:
          acceptedTotal || mappedVersionSnapshot?.total_ex_vat || 0,
        lines: acceptedOfferLines,
      },
    },
  };
}
