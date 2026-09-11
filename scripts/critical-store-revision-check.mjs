import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function requireNeedles(path, needles) {
  const text = read(path);
  for (const needle of needles) {
    if (!text.includes(needle)) {
      throw new Error(`${path}: mangler 41B.4-guard: ${needle}`);
    }
  }
  return text;
}

const migration = requireNeedles(
  "supabase/migrations/20260910170000_fase41b4_revised_store_offer_after_decline.sql",
  [
    "create_revised_store_offer_from_decline",
    "v_offer.status <> 'declined'",
    "v_request.status <> 'Avvist'",
    "v_offer.company_id <> v_company_id",
    "current_user_has_module_access('store_offers')",
    "e.elem->>'__storeOfferMeta' = 'true'",
    "pg_advisory_xact_lock",
    "insert into public.sales_requests",
    "'status', 'Tilbud'",
    "'nextStep', 'Rediger og publiser revidert tilbud'",
    "'revisedFromRequestRef'",
    "'revisedFromOfferId'",
    "'revisedFromOfferVersionId'",
    "'revisedFromOfferVersionNumber'",
    "jsonb_set(e.elem, '{attachmentFile,path}', to_jsonb(''::text), true)",
    "grant execute on function public.create_revised_store_offer_from_decline(uuid) to authenticated",
  ]
);

if (/update\s+public\.sales_offers/i.test(migration)) {
  throw new Error("41B.4 skal aldri gjenåpne eller endre det avviste sales_offer.");
}
if (/update\s+public\.sales_requests/i.test(migration)) {
  throw new Error("41B.4 skal aldri omskrive den opprinnelige avviste salgssaken.");
}
if (migration.includes("'publicToken'") || migration.includes("'salesOfferId'")) {
  throw new Error("Ny revisjon skal ikke arve gammel kundelenke eller sales_offer-id.");
}

const ux = requireNeedles("src/modules/sales/storeDeclinedRevisionUx.js", [
  "Se avvist tilbud",
  "Lag revidert tilbud",
  "create_revised_store_offer_from_decline",
  "Det avviste tilbudet forblir låst historikk",
  "saveSalesNavigation(storageKey, \"detail\", requestRef)",
  "supportModeActive()",
  "window.location.reload()",
]);
if (/new\s+MutationObserver\s*\(/.test(ux)) {
  throw new Error("41B.4 revisjons-UX skal ikke bruke MutationObserver.");
}

requireNeedles("index.html", [
  "installStoreDeclinedRevisionUx",
  "/src/modules/sales/storeDeclinedRevisionUx.js",
]);

console.log("✅ Expo ProffDok revidert Butikktilbud etter avvisning check OK");
