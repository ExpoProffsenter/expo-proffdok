import fs from "node:fs";

const uxPath = "src/modules/sales/storeOfferFromSurveyUx.jsx";
const requestFormPath = "src/modules/sales/components/SalesRequestForm.jsx";
const indexPath = "index.html";
const ux = fs.readFileSync(uxPath, "utf8");
const requestForm = fs.readFileSync(requestFormPath, "utf8");
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
  'Generelt tilbud',
  'button.dataset.salesRegressionDirectOffer === "true"',
  'button.dataset.salesRegressionInspectionNote === "true"',
  'Ringside Rørleggerbedrift AS',
  'Bademiljø Expo',
];

for (const marker of required) {
  if (!ux.includes(marker)) {
    throw new Error(`FASE 41B.5B/45B mangler kritisk markør: ${marker}`);
  }
}

if (
  ux.includes('return text === "Opprett tilbud" || text === "Opprett tilbud uten befaringsnotat"')
) {
  throw new Error(
    "Befaring→tilbud må ikke lenger fange globale knapper kun ut fra synlig tekst."
  );
}

if (!requestForm.includes('data-general-offer-submit={isStoreOffer ? "true" : undefined}')) {
  throw new Error("Generelt tilbud-skjema mangler eksplisitt submit-markør for regresjonskontroll.");
}

if (ux.includes("createSalesProject") || ux.includes('from("projects")')) {
  throw new Error("FASE 41B.5B skal aldri opprette ProffDok-prosjekt.");
}

if (!index.includes("installStoreOfferFromSurveyUx")) {
  throw new Error("FASE 41B.5B UX er ikke installert fra index.html.");
}

console.log(
  "✅ Expo ProffDok Befaring → Generelt tilbud check OK – kun tekniske Befaring-knapper fanges, vanlig Opprett tilbud-submit er skjermet"
);
