import fs from "node:fs";
import assert from "node:assert/strict";

const terminology = fs.readFileSync("src/modules/sales/generalOfferTerminologyUx.js", "utf8");
const requestForm = fs.readFileSync("src/modules/sales/components/SalesRequestForm.jsx", "utf8");
const offerLogic = fs.readFileSync("src/modules/sales/utils/salesOfferLogic.js", "utf8");
const proBuilder = fs.readFileSync("src/modules/sales/components/SalesStoreOfferBuilderProCatalog.jsx", "utf8");
const storeOffers = fs.readFileSync("src/modules/sales/services/salesStoreOffers.js", "utf8");
const salesContracts = fs.readFileSync("src/modules/sales/services/salesContracts.js", "utf8");
const contractCustomer = fs.readFileSync("src/modules/sales/components/SalesContractCustomerView.jsx", "utf8");
const customerOffer = fs.readFileSync("src/modules/sales/components/SalesCustomerViewCore.jsx", "utf8");
const indexHtml = fs.readFileSync("index.html", "utf8");

assert(storeOffers.includes('STORE_OFFER_SOURCE = "Butikktilbud / varesalg"'), "Teknisk Butikktilbud-kilde må beholdes for bakoverkompatibilitet.");
assert(storeOffers.includes('STORE_OFFER_TITLE = "Generelt tilbud"'), "Nye generelle tilbud må få nytt brukerrettet standardnavn.");

for (const needle of [
  "Tilbudsnavn *",
  "Dette navnet følger tilbudet videre til kunde, aksept og dokumentasjon.",
  'value={form.title || ""}',
  'placeholder={STORE_OFFER_TITLE}',
  "freshStoreOfferLaunch",
  "if (freshStoreOfferLaunch && !recoveredStoreOffer)",
  'onUpdateForm("title", STORE_OFFER_TITLE)',
  "Nytt generelt tilbud",
  "Registrer kunde og opprett tilbud",
  "Opprett et tilbud for varer, arbeid, underentreprenører og andre leveranser.",
  "Opprett tilbud",
]) {
  assert(requestForm.includes(needle), `Generelt tilbud-skjema mangler: ${needle}`);
}
assert(!requestForm.includes('"Nytt butikktilbud"'), "Nytt tilbud-skjema skal ikke vise Butikktilbud som brukerbegrep.");
assert(!requestForm.includes('"Registrer kunde og opprett butikktilbud"'), "Opprett-skjema skal bruke generell tilbudsterminologi.");
assert(!requestForm.includes('"Opprett butikktilbud"'), "Opprett-knapp skal bruke generell tilbudsterminologi.");

for (const needle of [
  'const STORE_OFFER_SOURCE = "Butikktilbud / varesalg"',
  'const GENERAL_OFFER_DEFAULT_TITLE = "Generelt tilbud"',
  "isGeneralOfferRequest",
  "isGeneratedDirectOfferTitle",
  'offerTitle === `Tilbud – ${requestTitle}`',
  "generatedDirectTitle",
  "String(request?.title || GENERAL_OFFER_DEFAULT_TITLE)",
  "title: generalOfferTitle",
]) {
  assert(offerLogic.includes(needle), `Tilbudsnavn følger ikke korrekt inn i tilbudsbyggeren: ${needle}`);
}

for (const needle of [
  "INTERNAL_SENDER_COMPANIES",
  '"ringside rørleggerbedrift as"',
  '"bademiljø expo"',
  '"expo proffsenter"',
  'const COMPANY_BRAND_KEY = "company-profile"',
  'brandMode: "company"',
  "getMyWorkProfileState",
  "readCachedWorkProfileState",
  "withCompanySenderMeta",
  "Ingen firmalogo er registrert. Tilbudet vises med firmanavn uten Expo/Ringside-logo.",
  'data-store-sender-mode={externalSender ? "company" : "internal-brand-choice"}',
]) {
  assert(proBuilder.includes(needle), `Proff-avsenderpolicy mangler: ${needle}`);
}
assert(
  proBuilder.includes("profile.logoUrl || EMPTY_COMPANY_LOGO_DATA_URL"),
  "Ekstern proffkunde uten logo kan fortsatt falle tilbake til en intern Expo/Ringside-logo."
);

for (const needle of [
  "Generelle tilbud",
  "Generelt tilbud",
  "For varer, arbeid, underentreprenører og andre leveranser",
  "Etter kundeaksept vises de neste stegene som er tilgjengelige for firmaet",
  "Tilbudet bygges opp fritt.",
  "Opprett våtromstilbud direkte uten å registrere befaring først.",
  "replaceExactTextNodes",
  "replacePairs",
  "patchGeneralOfferSurfaceCopy",
  "simple-order-accepted-shell",
  "Generelt tilbud akseptert",
  "Velg videreføring når du er klar.",
  "setTextIfChanged",
  "MutationObserver",
]) {
  assert(terminology.includes(needle), `Terminologi-UX mangler: ${needle}`);
}
assert(!terminology.includes("characterData: true"), "Terminologi-observer skal ikke lytte på egne tekstnodeendringer.");
assert(!terminology.includes("Generelle tilbud avsluttes ved aksept"), "Generelle tilbud skal ikke beskrives som avsluttet ved kundeaksept.");
assert(indexHtml.includes("installGeneralOfferTerminologyUx"), "Generelle tilbud-terminologi må installeres fra app-entry.");

for (const needle of [
  "Signert kontrakt",
  "Kontrakten er signert",
  "Kontrakten er signert av utførende firma",
  "Kontrakten er lagret og låst. Utførende firma følger opp videre fremdrift og eventuell oppstart etter avtale.",
]) {
  assert(contractCustomer.includes(needle), `Kundens kontraktstekst mangler: ${needle}`);
}
assert(!contractCustomer.includes("Ferdig signert kontrakt"), "Kundens kontraktsvisning skal ikke kunne tolkes som at hele saken er ferdig.");
assert(!contractCustomer.includes("Kontrakten er allerede signert"), "Etter-signeringstekst skal være naturlig både ved første visning og gjenåpning.");
assert(!contractCustomer.includes("Ingen ytterligere handling er nødvendig."), "Kundens etter-signeringstekst må ikke love at videre oppfølging er unødvendig.");

for (const needle of [
  "normalizePublicContractPayload",
  "snapshot.company_snapshot",
  "legacyDraft.priceInclVat",
  "legacyDraft.projectAddress",
  "legacyDraft.customerName",
  "return normalizePublicContractPayload(data || null)",
]) {
  assert(salesContracts.includes(needle), `Offentlig kontrakt mangler legacy-normalisering: ${needle}`);
}

for (const needle of [
  "Tilbud akseptert",
  "Takk for aksepten",
  "Utførende bedrift følger",
  "opp saken videre.",
]) {
  assert(customerOffer.includes(needle), `Kundens tilbudsaksept mangler trygg oppfølgingstekst: ${needle}`);
}

console.log("critical-general-offer-terminology-check: OK");
