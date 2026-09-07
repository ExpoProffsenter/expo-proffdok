// Expo ProffDok – FASE 37D1
// Avgrenser Butikktilbud til Ringside og holder lanserings-/identifikasjonslogikk samlet.
// Butikktilbud bruker eksisterende Sales-publisering, kundelenke, PDF, aksept og e-post.

export const RINGSIDE_STORE_OFFER_ORG_NUMBER = "915407692";
export const STORE_OFFER_SOURCE = "Butikktilbud / varesalg";
export const STORE_OFFER_TITLE = "Butikktilbud";
export const STORE_OFFER_SESSION_KEY = "expo-proffdok:sales:store-offer-launch";

function digitsOnly(value = "") {
  return String(value || "").replace(/\D/g, "");
}

export function isRingsideStoreOfferProfile(profile = {}) {
  const orgNumber =
    profile?.org_number ||
    profile?.orgNumber ||
    profile?.company_org_number ||
    profile?.companyOrgNumber ||
    "";

  return digitsOnly(orgNumber) === RINGSIDE_STORE_OFFER_ORG_NUMBER;
}

export function markStoreOfferLaunch() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage?.setItem(STORE_OFFER_SESSION_KEY, "1");
  } catch {
    // Markøren er kun midlertidig UI-state og påvirker ikke lagrede Sales-data.
  }
}

export function readStoreOfferLaunch() {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage?.getItem(STORE_OFFER_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearStoreOfferLaunch() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage?.removeItem(STORE_OFFER_SESSION_KEY);
  } catch {
    // Ingen lagrede tilbudsdata påvirkes dersom sessionStorage ikke er tilgjengelig.
  }
}

export function isStoreOfferRequest(request = {}) {
  return Boolean(
    request?.directOffer &&
      String(request?.source || "").trim() === STORE_OFFER_SOURCE
  );
}
