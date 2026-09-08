import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseStoreCatalogLine,
  serializeStoreCatalogItem,
  STORE_CATALOG_FIELD_COUNT,
} from "../src/modules/storeCatalog/storeCatalogImport.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function assert(condition, message) {
  if (!condition) throw new Error(`FASE 39B critical check: ${message}`);
}

assert(STORE_CATALOG_FIELD_COUNT === 18, "ERP-formatet skal ha 18 felt.");

const acceptedLine = [
  "Testleverandør", "ABC-123", "1000,00", "25,00", "750,00", "33,33", "25,00",
  "1000,00", "1250,00", "Testgruppe", "20260908", "1", "1", "0", "0",
  'Testprodukt 80 cm "matt"', "1234567890123", "",
].join(";");

const accepted = parseStoreCatalogLine(acceptedLine, 7);
assert(accepted.status === "accepted", "gyldig vare skal aksepteres.");
assert(accepted.item.purchaseNetExVat === 750, "nettopris skal leses fra felt 5.");
assert(accepted.item.customerPriceExVat === 1000, "kundepris eks. mva. skal leses fra felt 8.");
assert(accepted.item.customerPriceInclVat === 1250, "kundepris inkl. mva. skal leses fra felt 9.");
assert(accepted.item.priceDate === "2026-09-08", "ERP-dato skal normaliseres.");
assert(accepted.item.gtin === "1234567890123", "GTIN skal bevares.");

const serialized = serializeStoreCatalogItem(accepted.item, 7);
assert(serialized.purchase_net_ex_vat === 750, "RPC-payload skal beholde intern nettopris.");
assert(serialized.customer_price_incl_vat === 1250, "RPC-payload skal beholde kundepris.");
assert(serialized.source_line_no === 7, "kildelinje skal følge importen.");

const zeroPriceFields = acceptedLine.split(";");
zeroPriceFields[4] = "0,00";
assert(parseStoreCatalogLine(zeroPriceFields.join(";"), 8).status === "skipped_zero_price", "vare med null nettopris skal droppes.");
const zeroSaleFields = acceptedLine.split(";");
zeroSaleFields[8] = "0,00";
assert(parseStoreCatalogLine(zeroSaleFields.join(";"), 9).status === "skipped_zero_price", "vare med null utsalgspris skal droppes.");
const missingSkuFields = acceptedLine.split(";");
missingSkuFields[1] = "";
assert(parseStoreCatalogLine(missingSkuFields.join(";"), 10).status === "skipped_missing_sku", "vare uten varenummer skal droppes.");

const foundationMigration = fs.readFileSync(path.join(root, "supabase/migrations/20260908105500_fase39b1_internal_store_catalog.sql"), "utf8");
for (const needle of [
  "internal_store_catalog_items", "current_user_has_internal_store_catalog_access",
  "current_user_has_module_access('store_offers')", "Ringside Rørleggerbedrift AS",
  "Bademiljø Expo", "purchase_net_ex_vat", "enable row level security",
  "revoke all on public.internal_store_catalog_items from anon, authenticated",
]) assert(foundationMigration.includes(needle), `grunnmuren mangler sikkerhetskrav: ${needle}`);
assert(!foundationMigration.includes("915407692"), "katalogtilgang skal ikke låses til org.nr.");

const singleCopyMigration = fs.readFileSync(path.join(root, "supabase/migrations/20260908114500_fase39b2_single_copy_catalog_import.sql"), "utf8");
for (const needle of [
  "status in ('loading','ready','active','archived','cancelled','failed')",
  "unique (supplier_key, supplier_product_number_key)",
  "on conflict (supplier_key, supplier_product_number_key)",
  "last_import_id = excluded.last_import_id",
  "status = 'ready'",
  "Vareregisteret oppdateres akkurat nå",
  "complete_internal_store_catalog_activation",
  "get_pending_internal_store_catalog_import",
  "drop index if exists public.internal_store_catalog_items_active_idx",
]) assert(singleCopyMigration.includes(needle), `single-copy-import mangler: ${needle}`);
assert(!singleCopyMigration.includes("insert into public.internal_store_catalog_stage"), "nye ERP-batcher skal ikke lage en full staging-kopi.");

const adminMigration = fs.readFileSync(path.join(root, "supabase/migrations/20260908115800_fase39b2_catalog_systemadmin_only.sql"), "utf8");
assert(adminMigration.includes("current_profile_is_systemadmin()"), "kun systemadmin skal kunne administrere prisimport.");
assert(!adminMigration.includes("current_profile_is_firmaadmin()"), "firmaadmin skal ikke kunne administrere prisimport.");

const panel = fs.readFileSync(path.join(root, "src/modules/storeCatalog/StoreCatalogPanel.jsx"), "utf8");
const offerTools = fs.readFileSync(path.join(root, "src/modules/storeCatalog/StoreCatalogOfferTools.jsx"), "utf8");
const client = fs.readFileSync(path.join(root, "src/modules/storeCatalog/storeCatalogClient.js"), "utf8");
const wrapper = fs.readFileSync(path.join(root, "src/modules/sales/components/SalesStoreOfferBuilderCatalog.jsx"), "utf8");
const groupedBuilder = fs.readFileSync(path.join(root, "src/modules/sales/components/SalesStoreOfferBuilderGrouped.jsx"), "utf8");
const autosave = fs.readFileSync(path.join(root, "src/modules/sales/services/salesStoreOfferAutosave.js"), "utf8");
const router = fs.readFileSync(path.join(root, "src/modules/sales/components/SalesOfferBuilder.jsx"), "utf8");
const textBlockCss = fs.readFileSync(path.join(root, "src/modules/sales/storeOfferTextBlocks.css"), "utf8");
const quantityPresentation = fs.readFileSync(path.join(root, "src/modules/sales/utils/salesOfferQuantityPresentation.js"), "utf8");
const salesDetailView = fs.readFileSync(path.join(root, "src/modules/sales/components/SalesDetailView.jsx"), "utf8");
const offerPdf = fs.readFileSync(path.join(root, "src/modules/sales/services/salesOfferPdfPolishedV2.js"), "utf8");
const acceptancePdf = fs.readFileSync(path.join(root, "src/modules/sales/services/salesAcceptancePdfPolished.js"), "utf8");
const salesModule = fs.readFileSync(path.join(root, "src/modules/sales/SalesModule.jsx"), "utf8");
const systemAdminCatalogUx = fs.readFileSync(path.join(root, "src/modules/storeCatalog/systemAdminStoreCatalogUx.jsx"), "utf8");
const customerTerminologyUx = fs.readFileSync(path.join(root, "src/modules/sales/storeOfferCustomerTerminologyUx.js"), "utf8");
const bootstrap = fs.readFileSync(path.join(root, "src/bootstrap.jsx"), "utf8");

for (const needle of [
  "searchStoreCatalog", "getStoreCatalogAlternatives", "beginStoreCatalogImport",
  "streamStoreCatalogFile", "prepareStoreCatalogActivation", "Aktiver nytt vareregister",
  "Varesøket er låst", "purchase_net_ex_vat",
]) assert(panel.includes(needle), `39B.2 katalogpanel mangler: ${needle}`);

for (const needle of [
  "prepare_internal_store_catalog_activation",
  "complete_internal_store_catalog_activation",
]) assert(client.includes(needle), `39B.2 katalogklient mangler: ${needle}`);
assert(!client.includes("completedBatches < 1000"), "klienten skal ikke lenger duplisere katalogen i aktiveringsbatcher.");

for (const needle of [
  "StoreCatalogInlineLookup", "searchStoreCatalog", "getStoreCatalogAlternatives",
  "Søk vareregister: varenavn, varenummer eller GTIN/EAN", "StoreCatalogAdminOnlyPanel",
  "canManageInternalStoreCatalog",
]) assert(offerTools.includes(needle), `inline varesøk/adminavgrensning mangler: ${needle}`);
assert(!offerTools.includes("createPortal"), "varesøk skal ikke monteres via DOM-portaler.");
for (const forbidden of ["findStoreSection", "setControlledValue", "addInstallationForProduct", "addOptionForProduct", "document.querySelector"]) {
  assert(!offerTools.includes(forbidden), `39B.2C skal ikke bruke DOM-hurtigkobling: ${forbidden}`);
}

assert(wrapper.includes("customer_price_incl_vat"), "kundepris inkl. mva. skal kopieres til tilbudslinjen.");
assert(wrapper.includes("customer_price_ex_vat"), "kundepris eks. mva. skal kopieres til Sales amount.");
assert(!wrapper.includes("purchase_net_ex_vat"), "nettopris skal aldri kopieres til offerForm-wrapperen.");
assert(wrapper.includes("storeCatalogItemId"), "tilbudslinjen skal beholde en ufarlig katalogreferanse.");
assert(wrapper.includes("SalesStoreOfferBuilderGrouped"), "Butikktilbud skal bruke grouped builder i 39B.2C.");
assert(wrapper.includes("StoreCatalogInlineLookup"), "katalogsøk skal ligge direkte i den enkelte tilbudspost.");
assert(wrapper.includes("renderCatalogLookup={renderCatalogLookup}"), "katalogsøk skal injiseres som vanlig React-innhold i byggeren.");
assert(wrapper.includes("title: description"), "katalogvare i opsjon skal fylle opsjonsnavnet.");
assert(!wrapper.includes("StoreCatalogAdminOnlyPanel"), "prisadministrasjon skal ikke ligge i tilbudsbyggeren.");
for (const needle of [
  "normalizeSectionLine", "storeSectionMode", "SECTION_MARKER", "Nytt avsnitt",
  "Tilbudsposter og avsnitt", "Legg til post", "Post / beskrivelse *",
]) assert(wrapper.includes(needle), `generiske tilbudsposter/avsnittsreparasjon mangler: ${needle}`);

for (const needle of [
  "StoreCatalogAdminOnlyPanel", "Systemadmin", "Internt vareregister",
  "Oppdatering av ERP-vareregisteret er en systemadmin-oppgave",
]) assert(systemAdminCatalogUx.includes(needle), `Systemadmin-vareregister mangler: ${needle}`);
assert(bootstrap.includes("installSystemAdminStoreCatalogUx"), "bootstrap skal aktivere vareregister i Systemadmin.");
assert(bootstrap.includes("installStoreOfferCustomerTerminologyUx"), "bootstrap skal aktivere generisk Butikktilbud-presentasjon.");
for (const needle of [
  "Leveranse og priser", "Sum leveranse og montering inkl. mva.",
  "Erstatter valgt post eller montering.", "Alternativpris post + montering:",
]) assert(customerTerminologyUx.includes(needle), `generisk kundepresentasjon mangler: ${needle}`);

for (const needle of [
  'SECTION_LINE_TYPE = "store_text"',
  'SECTION_MARKER = "#expo-store-text-block"',
  "storeSectionId",
  "storeParentProductId",
  "composeLines",
  "Legg til avsnitt",
  "Avsnittsnavn",
  "Montering på denne varen",
  "Opsjon på denne varen",
  "Kun montering",
  "store-workbar",
  "renderCatalogLookup?.(",
  'kind: "line"',
  'kind: "option"',
  "recalculateStoreOption",
  "storeInstallationMode",
  "storeInstallationUnitPriceInclVat",
  "handleProductPriceEnter",
  "handleOptionPriceEnter",
  "focusStoreProductTitle",
  "focusStoreOptionTitle",
  "normalizeLegacySection",
  "hasStoreProductDraftContent",
  "hasStoreOptionDraftContent",
  'event.key !== "Enter"',
  "window.scrollTo({ top: 0",
]) assert(groupedBuilder.includes(needle), `39B.2C grouped builder mangler: ${needle}`);

for (const needle of [
  "export function isStoreSectionLine",
  "export function getStoreSectionTitle",
  'lineType === "store_text"',
  'storeSectionMode === "group"',
  'STORE_SECTION_MARKER',
  'startsWith("store-section-")',
]) assert(quantityPresentation.includes(needle), `robust Butikktilbud-avsnittsdeteksjon mangler: ${needle}`);

for (const [source, label] of [
  [salesDetailView, "intern tilbudsvisning"],
  [offerPdf, "publisert tilbuds-PDF"],
  [acceptancePdf, "akseptbevis-PDF"],
]) {
  for (const needle of ["isStoreSectionLine", "getStoreSectionTitle"]) {
    assert(source.includes(needle), `${label} mangler felles avsnittspresentasjon: ${needle}`);
  }
}
assert(salesDetailView.includes("pricedLineIndex"), "intern tilbudsvisning skal nummerere prisposter uten å telle avsnitt.");
assert(offerPdf.includes("storeSectionRow") && offerPdf.includes("pricedIndex"), "tilbuds-PDF skal vise avsnitt uten pris/varenummer.");
assert(acceptancePdf.includes("storeSectionRow") && acceptancePdf.includes("pricedLineIndex"), "akseptbevis skal vise avsnitt uten pris/varenummer.");

for (const needle of [
  "persistStoreOfferDraft", "upsertSalesRequests(client, [row])",
  "stripTransientPhotoData(request)", "resolveSalesCompanyScope(client)",
]) assert(autosave.includes(needle), `Butikktilbud-autosave mangler: ${needle}`);
assert(!autosave.includes("purchase_net_ex_vat"), "Butikktilbud-autosave skal aldri kjenne katalogens nettopris.");
assert(wrapper.includes("persistStoreOfferDraft(props.selectedRequest, repairedOfferForm)"), "Butikktilbud-wrapperen skal lagre reparert aktuell kladd separat.");
assert(wrapper.includes("850"), "Butikktilbud-autosave skal kjøre etter ordinær 500 ms Sales-autosave.");

assert(textBlockCss.includes('#expo-store-text-block'), "kundepresentasjonen skal kjenne igjen avsnitt.");
assert(textBlockCss.includes(".sales-customer-line-price"), "avsnitt skal skjule pris i kundevisningen.");
assert(textBlockCss.includes("border-left: 5px solid #16aeb9"), "avsnitt skal ha tydelig kundepresentasjon.");
assert(salesModule.includes('import "./storeOfferTextBlocks.css"'), "avsnitt-presentasjon skal lastes i Sales.");
assert(router.includes("SalesStoreOfferBuilderCatalog"), "Butikktilbud skal bruke katalog-wrapperen.");

console.log("✅ Expo ProffDok internt vareregister check OK");
