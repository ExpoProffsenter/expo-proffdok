import fs from "node:fs";

const uxPath = "src/modules/sales/storeOfferFromSurveyUx.jsx";
const detailPath = "src/modules/sales/components/SalesDetailViewCore.jsx";
const requestFormPath = "src/modules/sales/components/SalesRequestForm.jsx";
const indexPath = "index.html";
const ux = fs.readFileSync(uxPath, "utf8");
const detail = fs.readFileSync(detailPath, "utf8");
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
  'button?.dataset?.salesOfferFromSurvey !== "true"',
  'Våtromstilbud',
  'Generelt tilbud',
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

const surveyTriggerCount = detail.match(/data-sales-offer-from-survey=/g)?.length || 0;
if (surveyTriggerCount !== 3) {
  throw new Error(`Befaring → tilbud skal ha nøyaktig tre eksplisitte startknapper, fant ${surveyTriggerCount}.`);
}

if (requestForm.includes("data-sales-offer-from-survey")) {
  throw new Error("Nytt direkte tilbud må ikke kunne fanges av Befaring → tilbud-dialogen.");
}

console.log("✅ Expo ProffDok Befaring → Generelt tilbud check OK – samme sak beholdes og ingen prosjektopprettelse utføres");
