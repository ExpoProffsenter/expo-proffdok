// Expo ProffDok – FASE 23P / FASE 29B4
// Samler publisering av tilbud og opprettelse av kundelenker.
// FASE 29B4 bruker firmaprofilen SalesModule allerede har lastet inn, med samme
// logo-prinsipp som hovedappen: firmaets logo når den finnes, ellers Expo-logo.
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
  companyProfile = null,
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

  const resolvedCompanyProfile =
    companyProfile && typeof companyProfile === "object"
      ? companyProfile
      : await loadCompanyProfile();
  const publishCompanyProfile = {
    ...(resolvedCompanyProfile || {}),
    logoUrl: resolvedCompanyProfile?.logoUrl || "/expo-logo.png",
  };

  const { data, error } = await publishSalesOffer(
    client,
    buildPublishPayload(request, publishCompanyProfile)
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
            publishCompanyProfile.companyName || item.companyName || "",
          companyOrgNumber:
            publishCompanyProfile.orgNumber || item.companyOrgNumber || "",
          companyAddress:
            publishCompanyProfile.address || item.companyAddress || "",
          companyPhone:
            publishCompanyProfile.phone || item.companyPhone || "",
          companyEmail:
            publishCompanyProfile.email || item.companyEmail || "",
          companyWebsite:
            publishCompanyProfile.website || item.companyWebsite || "",
          companyLogoUrl:
            publishCompanyProfile.logoUrl || item.companyLogoUrl || "/expo-logo.png",
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
