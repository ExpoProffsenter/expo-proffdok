import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
const root=process.cwd();
const migration=fs.readFileSync(path.join(root,"supabase/migrations/20260922170000_fase45b_pro_catalog_access.sql"),"utf8");
const hardening=fs.readFileSync(path.join(root,"supabase/migrations/20260923132000_fase45b_access_hardening.sql"),"utf8");
const unifiedAccess=fs.readFileSync(path.join(root,"supabase/migrations/20260923135500_fase45b_unified_user_access_admin.sql"),"utf8");
const activationMigration=fs.readFileSync(path.join(root,"supabase/migrations/20260923122500_fase45b_simple_order_activation_mode.sql"),"utf8");
const client=fs.readFileSync(path.join(root,"src/modules/storeCatalog/proStoreCatalogClient.js"),"utf8");
const adminPanel=fs.readFileSync(path.join(root,"src/modules/storeCatalog/ProStoreCatalogAdminPanel.jsx"),"utf8");
const normalizedAdmin=adminPanel.replace(/\s+/g,"");
const unifiedUserUx=fs.readFileSync(path.join(root,"src/modules/access/systemAdminUnifiedUserAccessUx.jsx"),"utf8");
const offerWrapper=fs.readFileSync(path.join(root,"src/modules/sales/components/SalesStoreOfferBuilderProCatalog.jsx"),"utf8");
const detail=fs.readFileSync(path.join(root,"src/modules/sales/components/SalesDetailView.jsx"),"utf8");
const legacyDetail=fs.readFileSync(path.join(root,"src/modules/sales/components/SalesDetailViewLegacy.jsx"),"utf8");
const activation=fs.readFileSync(path.join(root,"src/modules/sales/components/SalesProjectActivation.jsx"),"utf8");
const simpleOrder=fs.readFileSync(path.join(root,"src/modules/sales/services/salesSimpleOrder.js"),"utf8");
const storeOffers=fs.readFileSync(path.join(root,"src/modules/sales/services/salesStoreOffers.js"),"utf8");
const orderBasis=fs.readFileSync(path.join(root,"src/modules/sales/components/StoreOfferOrderBasis.jsx"),"utf8");
const help=fs.readFileSync(path.join(root,"src/modules/help/help45b.js"),"utf8");
const helpBridge=fs.readFileSync(path.join(root,"src/modules/help/helpTools.js"),"utf8");
const terms=fs.readFileSync(path.join(root,"src/modules/app/appStaticTools.js"),"utf8");

for(const needle of ["store_catalog_company_supplier_access","store_catalog_user_price_access","search_pro_store_catalog","current_user_has_pro_store_catalog_access","current_user_can_view_store_catalog_net_price","set_store_catalog_company_supplier_access","set_store_catalog_user_net_price_access","discount_percent >= 0 and discount_percent <= 100","a.supplier_key=i.supplier_key","i.customer_price_ex_vat*(1-a.discount_percent/100)"]) assert(migration.includes(needle),`45B katalogkontrakt mangler: ${needle}`);
const proSearch=migration.slice(migration.indexOf("create or replace function public.search_pro_store_catalog"));
const returnContract=proSearch.slice(0,proSearch.indexOf("language plpgsql"));
for(const forbidden of ["purchase_net_ex_vat","purchase_discount_percent","gross_margin_percent","markup_percent"]) assert(!returnContract.includes(forbidden),`Proff-RPC må aldri returnere internt felt: ${forbidden}`);
assert(returnContract.includes("my_net_price_ex_vat"),"Proff-RPC skal kunne returnere Din nto pris.");
assert(returnContract.includes("suggested_sale_price_ex_vat"),"Kundepris eks. mva. skal være foreslått salgspris.");
assert(proSearch.includes("case when v_show_net"),"Din nto pris skal være serverstyrt av brukerrettighet.");

for(const needle of ["current_active_company_scope_id()","coalesce(p.approved,false) = true","coalesce(p.deactivated,false) = false","p_company_id uuid","p_user_id uuid","Brukeren tilhører ikke valgt firma","revoke all on function public.set_store_catalog_user_net_price_access(uuid,boolean)"]) assert(hardening.includes(needle),`45B tilgangshardening mangler: ${needle}`);
assert(!hardening.includes("order by m.company_id limit 1"),"Profftilgang skal aldri velge vilkårlig første firmamedlemskap.");

for(const needle of [
  "current_user_has_module_access",
  "uma.module_key = trim(p_module_key)",
  "company_has_pro_store_catalog_access",
  "set_managed_module_access",
  "set_managed_pro_catalog_net_price_access",
  "company_has_pro_catalog",
  "pro_net_price_can_view",
  "Aktiver minst én leverandør for firmaet under Proff vareregister før Enkel ordre gis til brukeren",
]) assert(unifiedAccess.includes(needle),`Samlet tilgangsmodell mangler: ${needle}`);
assert(unifiedAccess.includes("v_wants_store:='store_offers'=any(v_requested)") || unifiedAccess.includes("v_wants_store := 'store_offers' = any(v_requested)"),"Enkel ordre må tildeles eksplisitt per bruker.");

for(const needle of ["searchProStoreCatalog","canViewMyNetPrice","setCompanySupplierAccess","setUserNetPriceAccess",'"search_pro_store_catalog"',"p_company_id:companyId"]) assert(client.includes(needle),`Proffkatalog-klient mangler: ${needle}`);
for(const forbidden of ["purchase_net_ex_vat","purchase_discount_percent","gross_margin_percent"]) assert(!client.includes(forbidden),`Proffklienten skal ikke kjenne internt felt: ${forbidden}`);

for(const needle of ["flislabas","flislabfliser","askøy","badenhaus","discountPercent:40","discountPercent:30","Leggtilstandardforslag","Eksisterenderabatterbleikkeoverskrevet"]) assert(normalizedAdmin.toLowerCase().includes(needle.toLowerCase()),`Standardforslag mangler eller er utrygt: ${needle}`);
assert(adminPanel.includes("Brukertilgang") && adminPanel.includes("Brukere og tilganger"),"Systemadmin skal styre brukertilgang på eksisterende brukerkort, ikke i leverandørlisten.");
for(const needle of ["Enkel ordre / Proff vareregister","Se «Din nto pris»","setManagedProCatalogNetPriceAccess","setManagedModuleAccess"]) assert(unifiedUserUx.includes(needle),`Samlet Systemadmin-brukerkort mangler: ${needle}`);

for(const needle of ["suggested_sale_price_ex_vat","suggested_sale_price_incl_vat","SalesStoreOfferBuilderCatalogTemplates","ProStoreCatalogInlineLookup"]) assert(offerWrapper.includes(needle),`Enkel ordre-wrapper mangler sikker salgsflate: ${needle}`);
for(const forbidden of ["my_net_price_ex_vat","purchase_net_ex_vat","purchase_discount_percent","gross_margin_percent","markup_percent"]) assert(!offerWrapper.includes(forbidden),`Tilbudsdata skal aldri kjenne intern/nto-pris: ${forbidden}`);
for(const needle of ["isSimpleOrderRequest","Lag enkel ordre","Aktiver som prosjekt","persistSimpleOrderActivationMode","getSalesSupportCompanyId","StoreOfferOrderBasis","data-simple-order-support-order-basis"]) assert(detail.includes(needle),`Akseptert Enkel ordre mangler kontrollert videreføring/support-QA: ${needle}`);
assert(detail.includes("supportMode && simpleOrderAccepted"),"Bestillingsgrunnlag i support skal kun vises read-only for akseptert Enkel ordre.");
assert(detail.includes("SalesDetailViewLegacy"),"Ordinær Sales-detail skal delegeres til verifisert legacy-visning.");
for(const needle of ["SalesDetailViewCore","rewriteStoreOfferAcceptedFlow","rewriteStoreOfferDeclinedFlow"]) assert(legacyDetail.includes(needle),`Legacy Sales-detail-kontrakt mangler: ${needle}`);
for(const needle of ["storeOffer && !simpleOrder","getSimpleOrderActivationMode","Lag enkel ordre","Aktiver som prosjekt","if (supportMode)"]) assert(activation.includes(needle),`Aktiveringsskjerm mangler Enkel ordre-/sikkerhetsregel: ${needle}`);
for(const needle of ["set_simple_order_activation_mode","simple_order","project"]) assert(simpleOrder.includes(needle),`Simple-order-klient mangler: ${needle}`);
for(const needle of ["export function isStoreOfferRequest","export function isSimpleOrderRequest","findStoreOfferMeta"]) assert(storeOffers.includes(needle),`Butikktilbud/Enkel ordre-identitet mangler: ${needle}`);
for(const needle of ["supplierProductNumber","nobbNumber","storeCatalogGtin","acceptedOfferLines","acceptedOptions","selected_options","Kopier liste","Skriv ut"]) assert(orderBasis.includes(needle),`Akseptert varegrunnlag mangler: ${needle}`);
for(const needle of ["Proff vareregister / Enkel ordre","Forhåndsvis som kunde","Din nto pris","Bestillingsgrunnlag","FlisLab AS 40 %","Askøy 40 %","SoPro-forutsetningen"]) assert(help.includes(needle),`HJELP mangler 45B-veiledning: ${needle}`);
assert(helpBridge.includes("createHelp45BSection"),"45B-hjelpen må være koblet til React-hjelpesenteret.");
for(const needle of ['EXPO_PROFFDOK_TERMS_VERSION = "1.1"',"Tilgang og SoPro-forutsetning","kan Expo begrense, suspendere eller avslutte tilgangen","inkludert SoPro-forutsetningen"]) assert(terms.includes(needle),`Brukervilkår 1.1 mangler: ${needle}`);
for(const needle of ["set_simple_order_activation_mode","simpleOrderActivationMode","fase45b_mark_simple_order_project","workflowType","simple_order","new.share_enabled:=false"]) assert(activationMigration.includes(needle),`Simple-order backend mangler: ${needle}`);
console.log("critical-pro-store-catalog-check: OK");
