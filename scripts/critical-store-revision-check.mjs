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

function extractPublishSalesOffer(text, path) {
  const marker = "create or replace function public.publish_sales_offer(payload jsonb)";
  const start = text.indexOf(marker);
  const end = text.indexOf("\n$$;", start);
  if (start < 0 || end < 0) {
    throw new Error(`${path}: finner ikke komplett publish_sales_offer-funksjon.`);
  }
  return text.slice(start, end + 4).replace(/\r\n/g, "\n").trim();
}

function withoutAcceptedHistoryGuard(functionSql) {
  return functionSql
    .replace("\n  v_existing_status text;", "")
    .replace(
      "  select so.company_id, so.public_token, so.status\n    into v_existing_company_id, v_token, v_existing_status",
      "  select so.company_id, so.public_token\n    into v_existing_company_id, v_token"
    )
    .replace(
      "\n    if lower(trim(coalesce(v_existing_status,''))) = 'accepted' then\n      raise exception 'Akseptert tilbud er låst historikk og kan ikke republiseres.' using errcode='P0001';\n    end if;",
      ""
    );
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

const acceptedHistoryMigrationPath =
  "supabase/migrations/20260928151244_lock_accepted_sales_offer_history.sql";
const acceptedHistoryMigration = requireNeedles(acceptedHistoryMigrationPath, [
  "create or replace function public.publish_sales_offer",
  "v_existing_status text",
  "select so.company_id, so.public_token, so.status",
  "lower(trim(coalesce(v_existing_status,''))) = 'accepted'",
  "Akseptert tilbud er låst historikk og kan ikke republiseres.",
  "for update",
  "revoke execute on function public.publish_sales_offer(jsonb) from public, anon",
  "grant execute on function public.publish_sales_offer(jsonb) to authenticated",
]);
const baselineMigrationPath =
  "supabase/migrations/20260908000500_fase38a_module_access.sql";
const baselinePublishFunction = extractPublishSalesOffer(
  read(baselineMigrationPath),
  baselineMigrationPath
);
const guardedPublishFunction = extractPublishSalesOffer(
  acceptedHistoryMigration,
  acceptedHistoryMigrationPath
);
if (withoutAcceptedHistoryGuard(guardedPublishFunction) !== baselinePublishFunction) {
  throw new Error(
    "Historikklåsen endrer mer enn statuslesing og sperren for akseptert tilbud."
  );
}
if (/v_existing_status[^\n]*declined/i.test(acceptedHistoryMigration)) {
  throw new Error("Historikklåsen skal ikke endre avvist-flyten.");
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

console.log("✅ Expo ProffDok revidert tilbud / immutable aksept-historikk check OK");
