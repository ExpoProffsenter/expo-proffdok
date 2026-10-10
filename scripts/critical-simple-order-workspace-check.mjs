import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const ux = read('src/modules/project/simpleOrderWorkspaceUx.js');
const overview = read('src/modules/project/projectOverviewTools.js');
const offerBasis = read('src/modules/project/SimpleOrderOfferBasis.jsx');
const acceptedPresentation = read('src/modules/sales/components/SalesAcceptedPresentation.jsx');
const main = read('src/main.jsx');
const progress = read('src/modules/progress/progressPlanSupabase.js');
const activation = read('supabase/migrations/20260923122500_fase45b_simple_order_activation_mode.sql');
const portalGuard = read('supabase/migrations/20260923154500_fase45b_simple_order_portal_guard.sql');
const productSeed = read('supabase/migrations/20260923160500_fase45b_simple_order_seed_snapshot_fix.sql');
const alternativeSeed = read('supabase/migrations/20260923184500_fase45b_simple_order_alternative_product_seed.sql');

// User-reported main-menu regression, 7 Oct 2026. Run the actual restoration
// function against a reused source control after React has changed its label.
// A full React/adapters scenario is in project-menu-return-react-check.mjs.
class MenuSourceControl {
  constructor(original, textContent) {
    this.textContent = textContent;
    this.attributes = new Map([['data-expo-simple-order-original-label', original]]);
    this.style = {removeProperty() {}};
  }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  removeAttribute(name) { this.attributes.delete(name); }
}
class MenuSourceOption extends MenuSourceControl {}
const adapterSource = ux.replace(/^import .*;\s*$/gm, '').replace(/^export /gm, '');
const {restoreElement, VISIBLE_LABELS} = new Function(
  'HTMLElement', 'HTMLOptionElement',
  `${adapterSource}\nreturn {restoreElement, VISIBLE_LABELS};`
)(MenuSourceControl, MenuSourceOption);
for (const [original, reactLabel] of [
  ['Prosjektoversikt', 'Startside'],
  ['Salgsgrunnlag', 'Befaring/Tilbud'],
  ['Produkter', 'Oppdatert produktfane'],
]) {
  const reused = new MenuSourceControl(original, reactLabel);
  restoreElement(reused);
  assert.equal(reused.textContent, reactLabel, 'Gammel ordreetikett overskrev Reacts nye menyside.');
  assert.equal(reused.getAttribute('data-expo-simple-order-original-label'), null);
}
for (const [original, adapted] of VISIBLE_LABELS) {
  const returningProject = new MenuSourceControl(original, adapted);
  restoreElement(returningProject);
  assert.equal(returningProject.textContent, original, 'Ordreetiketten ble beholdt i et ordinært prosjekt.');
  assert.equal(returningProject.getAttribute('data-expo-simple-order-original-label'), null);
}
for (const Control of [MenuSourceControl, MenuSourceOption]) {
  // React's sales label can be unchanged between project and global props,
  // so its current declarative attribute, rather than remembered DOM text, wins.
  const sales = new Control('Salgsgrunnlag', 'Tilbudsgrunnlag');
  sales.attributes.set('data-expo-nav-label', 'Befaring/Tilbud');
  restoreElement(sales);
  assert.equal(sales.textContent, 'Befaring/Tilbud', 'Salgsfanen beholdt gammel prosjektetikett etter retur.');
}
assert(main.includes('"data-expo-nav-label": l, className: tab === id'), 'Reacts kildeknapper mangler gjeldende menynavn.');
assert(main.includes('"data-expo-nav-label": l, value: id'), 'Mobilens sidevalg mangler gjeldende menynavn.');

for (const needle of [
  "data?.data?.project?.workflowType",
  "getAppSupabaseClient",
  "const activeClient = getAppSupabaseClient();",
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

assert(
  !ux.includes("createDefaultSalesSupabaseClient"),
  "Enkel ordre UX skal gjenbruke hovedappens Supabase-klient og ikke opprette en ekstra GoTrue-klient."
);

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

for (const needle of [
  "data-simple-order-accepted-offer-basis","Låst kopi av tilbudsversjonen kunden aksepterte",
  "buildSimpleOrderAcceptedRequest","acceptedOfferSnapshot","sourceVersionNumber",
  "AcceptedOfferGroups","AcceptedTotalSummary","Låst aksept",
]) assert(offerBasis.includes(needle), `Tilbudsgrunnlaget for Enkel ordre mangler: ${needle}`);
for (const forbidden of [
  "createDefaultSalesSupabaseClient","supabase.from(",".insert(",".update(",".upsert(",".delete(",
  "purchase_net_ex_vat","purchase_discount_percent","gross_margin_percent","markup_percent","my_net_price_ex_vat",
]) assert(!offerBasis.includes(forbidden), `Tilbudsgrunnlaget skal være lokalt, skrivebeskyttet og uten internpris: ${forbidden}`);
for (const needle of [
  "export function AcceptedOfferGroups","export function AcceptedTotalSummary",
]) assert(acceptedPresentation.includes(needle), `Delt låst akseptpresentasjon mangler eksport: ${needle}`);
for (const needle of [
  "SimpleOrderOfferBasis, { isSimpleOrderProject }","tab === \"sales\" && projectId && isSimpleOrderProject(project)",
  "supportModeExplicit || (!!ownerId && ownerId !== authUser.id)",
]) assert(main.includes(needle), `Hovedappen mangler sikring av Enkel ordre/supportmodus: ${needle}`);

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
