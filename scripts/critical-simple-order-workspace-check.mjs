import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const ux = read('src/modules/project/simpleOrderWorkspaceUx.js');
const overview = read('src/modules/project/projectOverviewTools.js');
const progress = read('src/modules/progress/progressPlanSupabase.js');
const activation = read('supabase/migrations/20260923122500_fase45b_simple_order_activation_mode.sql');
const portalGuard = read('supabase/migrations/20260923154500_fase45b_simple_order_portal_guard.sql');
const productSeed = read('supabase/migrations/20260923160500_fase45b_simple_order_seed_snapshot_fix.sql');
const alternativeSeed = read('supabase/migrations/20260923184500_fase45b_simple_order_alternative_product_seed.sql');

for (const needle of [
  "data?.data?.project?.workflowType",
  "simple_order",
  "Ordreoversikt",
  "Ordrebeskrivelse",
  "Produkter / FDV",
  "UE-tilgang",
  "Sluttdokumentasjon",
  "Kundelenke",
  "CUSTOMER_ACTION_PATTERN",
  ".progress-share-card",
  "Vis fremdriftsplan til kunde",
]) assert(ux.includes(needle), `Enkel ordre UX mangler: ${needle}`);

for (const hidden of ['Garanti','Prosjektering','Overflater og innredning','Tilbud/kontrakt','Chat','Overtagelse']) {
  assert(ux.includes(`'${hidden}'`), `Enkel ordre skal skjule prosjekt-tung fane: ${hidden}`);
}

for (const forbidden of [".insert(",".update(",".upsert(",".delete(","ensureProjectPortalAccess","share_enabled: true"]) {
  assert(!ux.includes(forbidden), `Enkel ordre UX skal ikke skrive prosjekt/portaldata: ${forbidden}`);
}

for (const needle of [
  "installSimpleOrderWorkspaceUx","data-expo-workflow-type","Ordreoversikt","Arbeidsverktøy for denne ordren",
  "Fremdrift","Produkter / FDV","Bilder","Sjekklister","UE-tilgang","Sluttdokumentasjon",
]) assert(overview.includes(needle), `Ordreoversikten mangler: ${needle}`);

for (const needle of ["workflowType","simpleOrder","shareEnabled","share_enabled"]) {
  assert(progress.includes(needle), `Fremdrift må kjenne Enkel ordre-metadata: ${needle}`);
}

for (const needle of ["'{project,workflowType}'","'{project,simpleOrder}'","'{project,salesOrigin,activationMode}'","new.share_enabled:=false"]) {
  assert(activation.includes(needle), `Server-side Enkel ordre-markering mangler: ${needle}`);
}

for (const needle of [
  "new.role = 'kunde'","workflowType","simple_order","Enkel ordre har ikke kundelenke/kundeportal",
  "trg_fase45b_block_simple_order_customer_portal","trg_fase45b_revoke_customer_portal_on_simple_order","role='kunde'",
  "tg_op = 'UPDATE'","old.role = 'kunde'","old.project_id = new.project_id","new.revoked_at is not null",
]) assert(portalGuard.includes(needle), `Server-side kundeportal-sperre mangler: ${needle}`);
assert(!portalGuard.includes("new.role = 'underleverandor'"), 'UE-portalen skal ikke blokkeres for Enkel ordre.');
assert(portalGuard.includes("where project_id=new.id and role='kunde' and revoked_at is null"), 'Eksisterende aktiv kundetilgang skal revokeres ved konvertering til Enkel ordre.');

for (const needle of [
  "fase45b_seed_simple_order_accepted_products","version_snapshot","selected_options",
  "Produkter fra akseptert tilbud","supplierProductNumber","storeCatalogGtin","nobbNumber","fdvUrl",
  "acceptedOfferSnapshot","sourceVersionId","sourceVersionNumber","'{tilbud}'",
]) assert(productSeed.includes(needle), `Akseptert produkt-/tilbudssnapshot mangler: ${needle}`);
for (const forbidden of ['purchase_net_ex_vat','purchase_discount_percent','gross_margin_percent','markup_percent','my_net_price_ex_vat']) {
  assert(!productSeed.includes(forbidden), `Enkel ordre produktseed skal ikke kjenne intern pris: ${forbidden}`);
  assert(!alternativeSeed.includes(forbidden), `Alternativ-seed skal ikke kjenne intern pris: ${forbidden}`);
}

for (const needle of [
  "optionType","alternative","replacementLineId","and not exists",
  "case when is_option","elem->>'title'","supplierProductNumber","acceptedOfferSnapshot",
]) assert(alternativeSeed.includes(needle), `Valgt alternativ må erstatte grunnprodukt i Enkel ordre: ${needle}`);

console.log('critical-simple-order-workspace-check: OK');