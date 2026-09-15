// Expo ProffDok – FASE 42I
// Komplett Sales-sak hentes og hydreres først når brukeren faktisk åpner saken.
// Saksoversikten skal aldri trenge tilbudslinjer, bilder, Badskisse eller akseptpayload.

import { INSPECTION_BUCKET } from "../constants/salesConstants.js";
import {
  createStorageSignedUrl,
  fetchProjectById,
  fetchSalesRequestDetailRow,
  getSalesOfferByToken,
  upsertSalesRequests,
} from "./salesSupabase.js";
import {
  getOfferTermsSnapshot,
  getOfferTotal,
  getVisibleOfferLines,
  stripTransientPhotoData,
} from "../utils/salesUtils.js";

async function hydrateInspectionPhotos(client, photos = []) {
  return Promise.all(
    (Array.isArray(photos) ? photos : []).map(async (photo) => {
      if (!photo?.path) return photo;
      const { data } = await createStorageSignedUrl(
        client,
        INSPECTION_BUCKET,
        photo.path,
        60 * 60 * 24 * 7
      );
      return { ...photo, dataUrl: data?.signedUrl || photo?.dataUrl || "" };
    })
  );
}

function acceptedRequestState(request, publicOfferData) {
  const acceptedOffer = publicOfferData?.offer || null;
  const acceptedVersion = publicOfferData?.version || null;
  if (!acceptedOffer || acceptedOffer.status !== "accepted") return request;

  const acceptedPayload = acceptedOffer.accepted_payload || {};
  const acceptedOptions = Array.isArray(acceptedPayload.selected_options)
    ? acceptedPayload.selected_options
    : Array.isArray(acceptedPayload.selectedOptions)
      ? acceptedPayload.selectedOptions
      : [];
  const acceptedOfferLines = getVisibleOfferLines(
    acceptedVersion?.lines || request.offerLines || []
  );
  const acceptedTermsSnapshot = getOfferTermsSnapshot(
    acceptedVersion?.lines || []
  );
  const acceptedTotal =
    Number(
      acceptedPayload.accepted_total ??
        acceptedPayload.acceptedTotal ??
        acceptedPayload.total_ex_vat ??
        acceptedPayload.totalExVat
    ) ||
    Number(acceptedVersion?.total_ex_vat || 0) +
      getOfferTotal(acceptedOptions);

  return {
    ...request,
    status: "Akseptert",
    statusClass: "sales-status-accepted",
    nextStep: "Aktiver som prosjekt",
    iconName: "home",
    acceptedBy:
      acceptedOffer.accepted_by ||
      acceptedPayload.accepted_name ||
      acceptedPayload.acceptedName ||
      "Kunde",
    acceptedAt:
      acceptedOffer.accepted_at ||
      acceptedPayload.accepted_at ||
      acceptedPayload.acceptedAt ||
      null,
    acceptedOfferVersionId:
      acceptedVersion?.id ||
      acceptedOffer.active_version_id ||
      request.sentOfferVersionId ||
      null,
    acceptedOfferVersionNumber:
      acceptedVersion?.version_number ||
      request.sentOfferVersionNumber ||
      null,
    acceptedOfferLines,
    acceptedOptionIds: acceptedOptions.map((option) => option?.id).filter(Boolean),
    acceptedOptions,
    acceptedTotal,
    acceptedPayload,
    acceptedOfferTitle:
      acceptedVersion?.title || request.offerTitle || request.title || "Tilbud",
    acceptedOfferIntro: acceptedVersion?.intro || request.offerIntro || "",
    acceptedOfferReservations:
      acceptedVersion?.reservations || request.offerReservations || "",
    acceptedOfferIncluded:
      acceptedTermsSnapshot.included || request.offerIncluded || "",
    acceptedOfferExcluded:
      acceptedTermsSnapshot.excluded || request.offerExcluded || "",
    acceptedOfferCustomerSupplied:
      acceptedTermsSnapshot.customerSupplied || request.offerCustomerSupplied || "",
    acceptedOfferTerms:
      acceptedTermsSnapshot.terms || request.offerTerms || "",
    acceptedOfferPaymentTerms:
      acceptedTermsSnapshot.paymentTerms || request.offerPaymentTerms || "",
  };
}

function declinedRequestState(request, publicOfferData) {
  const offer = publicOfferData?.offer || null;
  if (!offer || offer.status !== "declined") return request;
  return {
    ...request,
    status: "Avvist",
    statusClass: "sales-status-declined",
    nextStep: "Tilbud avvist",
    iconName: "declined",
    declinedAt: offer.declined_at || request.declinedAt || null,
    declinedBy:
      offer.declined_by ||
      offer.declined_payload?.declined_name ||
      request.declinedBy ||
      "Kunde",
  };
}

async function repairMissingActivatedProject(client, companyId, row, request) {
  if (request.status !== "Aktivert" || !request.projectId) {
    return { request, repaired: false };
  }

  const { data: project, error } = await fetchProjectById(client, request.projectId);
  if (error) throw error;
  if (project) return { request, repaired: false };

  const repairedRequest = {
    ...request,
    projectId: "",
    projectActivatedAt: "",
    status: "Akseptert",
    statusClass: "sales-status-accepted",
    nextStep: "Aktiver som prosjekt",
    iconName: "check",
  };

  const { error: repairError } = await upsertSalesRequests(client, [
    {
      company_id: companyId,
      request_ref: row.request_ref,
      status: repairedRequest.status,
      archived_at: row.archived_at || null,
      payload: stripTransientPhotoData(repairedRequest),
      updated_at: new Date().toISOString(),
    },
  ]);
  if (repairError) throw repairError;
  return { request: repairedRequest, repaired: true };
}

export async function loadSalesRequestDetailForOpen(
  client,
  companyId,
  requestRef
) {
  const result = await fetchSalesRequestDetailRow(client, companyId, requestRef);
  if (result?.error || !result?.data) {
    return {
      data: null,
      error: result?.error || new Error("Salgssaken finnes ikke lenger."),
    };
  }

  try {
    const row = result.data;
    let request = {
      ...(row.payload || {}),
      id: row.request_ref,
      archivedAt: row.archived_at || row.payload?.archivedAt || "",
      __summaryOnly: false,
      __detailLoaded: true,
    };

    const repaired = await repairMissingActivatedProject(
      client,
      companyId,
      row,
      request
    );
    request = repaired.request;

    request = {
      ...request,
      inspectionPhotos: await hydrateInspectionPhotos(
        client,
        request.inspectionPhotos || []
      ),
    };

    if (request.publicToken && request.status !== "Aktivert") {
      const { data: publicOfferData, error: publicOfferError } =
        await getSalesOfferByToken(client, request.publicToken);
      if (publicOfferError) {
        console.warn(
          `Kunne ikke kontrollere tilbudsstatus for sak ${requestRef}`,
          publicOfferError
        );
      } else if (!request.offerRevisionDraftFromVersion) {
        request = acceptedRequestState(request, publicOfferData);
        request = declinedRequestState(request, publicOfferData);
      }
    }

    return { data: request, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
