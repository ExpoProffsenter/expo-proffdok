// Expo ProffDok – FASE 37D2 / FASE 37D1
// Avgrenser Butikktilbud til Ringside og holder lanserings-, merkevare- og
// metadataregler samlet. Publisering, kundelenke, PDF, aksept og e-post gjenbrukes.
// Butikktilbud kan også gjenkjennes fra versjonslåst metadata etter publisering,
// slik at kundevisning og sperrer ikke er avhengig av mutable saksfelt.

export const RINGSIDE_STORE_OFFER_ORG_NUMBER = "915407692";
export const STORE_OFFER_SOURCE = "Butikktilbud / varesalg";
export const STORE_OFFER_TITLE = "Butikktilbud";
export const STORE_OFFER_SESSION_KEY = "expo-proffdok:sales:store-offer-launch";
export const STORE_OFFER_META_ID = "__expo_store_offer_meta__";
export const STORE_TEXT_TEMPLATE_KIND = "store-offer-text-v1";

export const STORE_OFFER_BRANDS = [
  {
    key: "bademiljo-expo",
    label: "Bademiljø Expo",
    logoUrl: "/brands/bademiljo-expo-ringside.png",
  },
  {
    key: "ringside-rorleggerbedrift",
    label: "Ringside Rørleggerbedrift",
    logoUrl: "/brands/ringside-rorleggerbedrift.png",
  },
];

export const DEFAULT_STORE_OFFER_BRAND = STORE_OFFER_BRANDS[0];

function digitsOnly(value = "") {
  return String(value || "").replace(/\D/g, "");
}

function absoluteBrandLogoUrl(value = "") {
  const clean = String(value || "").trim();
  if (!clean || typeof window === "undefined") return clean;
  try {
    return new URL(clean, window.location.origin).href;
  } catch {
    return clean;
  }
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
  const lockedMeta = request?.storeOfferMeta;
  const lineMeta = Array.isArray(request?.offerLines)
    ? request.offerLines.find((line) => line?.__storeOfferMeta)
    : null;

  if (lockedMeta?.__storeOfferMeta || lineMeta?.__storeOfferMeta) return true;

  return Boolean(
    request?.directOffer &&
      String(request?.source || "").trim() === STORE_OFFER_SOURCE
  );
}

export function getStoreOfferBrand(brandKey = "") {
  return (
    STORE_OFFER_BRANDS.find((brand) => brand.key === brandKey) ||
    DEFAULT_STORE_OFFER_BRAND
  );
}

export function createStoreOfferMetaLine({
  brandKey = DEFAULT_STORE_OFFER_BRAND.key,
  signatureName = "",
} = {}) {
  const brand = getStoreOfferBrand(brandKey);

  return {
    id: STORE_OFFER_META_ID,
    __storeOfferMeta: true,
    // Generiske Sales-visninger skjuler allerede __companyMeta. Ved publisering
    // legges den egentlige firmaprofil-snapshoten først i lines, så denne markøren
    // påvirker aldri hvilket firmasnapshot kunden/PDF-en leser.
    __companyMeta: true,
    mainPostId: "__store_offer_meta__",
    mainPostTitle: "Butikktilbud metadata",
    lineType: "work",
    description: "Butikktilbud metadata",
    amount: "0",
    quantity: "1",
    unit: "",
    brandKey: brand.key,
    brandLabel: brand.label,
    // Absolutt URL låses sammen med tilbudsversjonen. Da fungerer logoen også i
    // e-post og andre flater uten nettleserens relative app-origin.
    brandLogoUrl: absoluteBrandLogoUrl(brand.logoUrl),
    signatureName: String(signatureName || "").trim(),
  };
}
