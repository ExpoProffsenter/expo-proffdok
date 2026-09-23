import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const ux = read('src/modules/project/simpleOrderWorkspaceUx.js');
const overview = read('src/modules/project/projectOverviewTools.js');
const activation = read('supabase/migrations/20260923122500_fase45b_simple_order_activation_mode.sql');

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
]) {
  assert(ux.includes(needle), `Enkel ordre UX mangler: ${needle}`);
}

for (const hidden of [
  'Garanti',
  'Prosjektering',
  'Overflater og innredning',
  'Tilbud/kontrakt',
  'Chat',
  'Overtagelse',
]) {
  assert(ux.includes(`'${hidden}'`), `Enkel ordre skal skjule prosjekt-tung fane: ${hidden}`);
}

// UX-laget skal være read-only mot prosjektdata. Selve markeringen gjøres server-side ved aktivering.
for (const forbidden of [
  ".insert(",
  ".update(",
  ".upsert(",
  ".delete(",
  "ensureProjectPortalAccess",
  "share_enabled: true",
]) {
  assert(!ux.includes(forbidden), `Enkel ordre UX skal ikke skrive prosjekt/portaldata: ${forbidden}`);
}

for (const needle of [
  "installSimpleOrderWorkspaceUx",
  "data-expo-workflow-type",
  "Ordreoversikt",
  "Arbeidsverktøy for denne ordren",
  "Fremdrift",
  "Produkter / FDV",
  "Bilder",
  "Sjekklister",
  "UE-tilgang",
  "Sluttdokumentasjon",
]) {
  assert(overview.includes(needle), `Ordreoversikten mangler: ${needle}`);
}

for (const needle of [
  "'{project,workflowType}'",
  "'{project,simpleOrder}'",
  "'{project,salesOrigin,activationMode}'",
  "new.share_enabled:=false",
]) {
  assert(activation.includes(needle), `Server-side Enkel ordre-markering mangler: ${needle}`);
}

console.log('critical-simple-order-workspace-check: OK');
