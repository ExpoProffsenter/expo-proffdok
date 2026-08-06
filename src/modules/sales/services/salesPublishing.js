// Expo ProffDok – FASE 23P
// Samler publisering av tilbud og opprettelse av kundelenker.
// Ingen React-state, UI-rendering, databaseendring, RLS- eller Storage-endring.

import { buildPublishPayload } from "../utils/salesOfferLogic.js";
import {
  getSalesOfferByToken,
  publishSalesOffer,
} from "./salesSupabase.js";

export function buildCustomerOfferLink(currentUrl, token) {
  const url = new URL(currentUrl);
  // Behold eventuelle Vercel-parametere for deling av beskyttet preview.
  // Erstatt bare kundetokenet dersom det allerede finnes.
  url.searchParams.set("publicOffer", token);
  return url.toString();
}

export async function publishSalesOfferAndBuildLink({
  client,
  request,
  requests = [],
  loadCompanyProfile = async () => ({}),
  currentUrl,
  confirmOptionRemoval = () => true,
} = {}) {
  if (!client) {
    throw new Error("Supabase-miljøvariabler mangler i Vercel-preview.");
  }

  if (!request || !request.offerLines?.length) {
    throw new Error("Tilbudet mangler prislinjer.");
  }

  const currentLineCount = request.offerLines?.length || 0;
  const currentOptionCount = request.offerOptions?.length || 0;

  if (request.publicToken) {
    const { data: publishedOfferData, error: publishedOfferError } =
      await getSalesOfferByToken(client, request.publicToken);

    if (publishedOfferError) throw publishedOfferError;

    const previousOptions = Array.isArray(publishedOfferData?.version?.options)
      ? publishedOfferData.version.options
      : [];
    const previousOptionCount = previousOptions.length;

    if (previousOptionCount > 0 && currentOptionCount === 0) {
      const confirmed = confirmOptionRemoval(previousOptionCount);

      if (!confirmed) {
        throw new Error(
          "Publisering avbrutt. Kontroller opsjonene i Rediger tilbud."
        );
      }
    }
  }

  const companyProfile = await loadCompanyProfile();

  const { data, error } = await publishSalesOffer(
    client,
    buildPublishPayload(request, companyProfile)
  );

  if (error) throw error;

  const nextRequests = requests.map((item) =>
    item.id === request.id
      ? {
          ...item,
          salesOfferId: data.offer_id,
          sentOfferVersionId: data.version_id,
          sentOfferVersionNumber: data.version_number,
          publicToken: data.public_token,
          companyName:
            companyProfile.companyName || item.companyName || "",
          companyOrgNumber:
            companyProfile.orgNumber || item.companyOrgNumber || "",
          companyAddress:
            companyProfile.address || item.companyAddress || "",
          companyPhone: companyProfile.phone || item.companyPhone || "",
          companyEmail: companyProfile.email || item.companyEmail || "",
          companyWebsite:
            companyProfile.website || item.companyWebsite || "",
          companyLogoUrl:
            companyProfile.logoUrl || item.companyLogoUrl || "",
          status: "Tilbud",
          statusClass: "sales-status-quote",
          nextStep: "Kundelink er oppdatert",
          offerRevisionDraftFromVersion: null,
          offerRevisionDraftCreatedAt: "",
          lastPublishedLineCount: currentLineCount,
          lastPublishedOptionCount: currentOptionCount,
        }
      : item
  );

  const link = buildCustomerOfferLink(currentUrl, data.public_token);

  return {
    link,
    nextRequests,
    publishFeedback: {
      requestId: request.id,
      versionNumber: data.version_number,
      link,
      publishedAt: new Date().toISOString(),
    },
  };
}
