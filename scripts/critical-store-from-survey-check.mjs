import fs from "node:fs";

const uxPath = "src/modules/sales/storeOfferFromSurveyUx.jsx";
const indexPath = "index.html";
const ux = fs.readFileSync(uxPath, "utf8");
const index = fs.readFileSync(indexPath, "utf8");

const required = [
  'STORE_OFFER_SOURCE',
  'storeOfferFromSurvey: true',
  'request.status !== "Befaring"',
  'saveRequests(nextRequests, context.storageKey)',
  'upsertSalesRequests',
  'saveSalesNavigation(context.storageKey, "offer-builder"',
  'expo-proffdok-sales-rehydrate',
  'Våtromstilbud',
  'Butikktilbud',
  'Ringside Rørleggerbedrift AS',
  'Bademiljø Expo',
];

for (const marker of required) {
  if (!ux.includes(marker)) {
    throw new Error(`FASE 41B.5B mangler kritisk markør: ${marker}`);
  }
}

if (ux.includes("createSalesProject") || ux.includes('from("projects")')) {
  throw new Error("FASE 41B.5B skal aldri opprette ProffDok-prosjekt.");
}

if (!index.includes("installStoreOfferFromSurveyUx")) {
  throw new Error("FASE 41B.5B UX er ikke installert fra index.html.");
}

console.log("✅ Expo ProffDok Befaring → Butikktilbud check OK – samme sak beholdes og ingen prosjektopprettelse utføres");
