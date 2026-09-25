import fs from "node:fs";
import assert from "node:assert/strict";

const terminology = fs.readFileSync("src/modules/sales/generalOfferTerminologyUx.js", "utf8");
const storeOffers = fs.readFileSync("src/modules/sales/services/salesStoreOffers.js", "utf8");
const contractCustomer = fs.readFileSync("src/modules/sales/components/SalesContractCustomerView.jsx", "utf8");
const customerOffer = fs.readFileSync("src/modules/sales/components/SalesCustomerViewCore.jsx", "utf8");
const indexHtml = fs.readFileSync("index.html", "utf8");

assert(storeOffers.includes('STORE_OFFER_SOURCE = "Butikktilbud / varesalg"'), "Teknisk Butikktilbud-kilde må beholdes for bakoverkompatibilitet.");
assert(storeOffers.includes('STORE_OFFER_TITLE = "Generelt tilbud"'), "Nye generelle tilbud må få nytt brukerrettet standardnavn.");

for (const needle of [
  "Generelle tilbud",
  "Generelt tilbud",
  "For varer, arbeid, underentreprenører og andre leveranser",
  "Etter kundeaksept vises de neste stegene som er tilgjengelige for firmaet",
  "Tilbudet bygges opp fritt.",
  "Opprett våtromstilbud direkte uten å registrere befaring først.",
  "replaceExactTextNodes",
  "setTextIfChanged",
  "MutationObserver",
]) {
  assert(terminology.includes(needle), `Terminologi-UX mangler: ${needle}`);
}
assert(!terminology.includes("characterData: true"), "Terminologi-observer skal ikke lytte på egne tekstnodeendringer.");

const overviewCopies = [...terminology.matchAll(/const OVERVIEW_[A-Z]+ = "([^"]*)";/g)].map((match) => match[1]);
assert(overviewCopies.length >= 3, "Terminologi-UX må ha eksplisitte oversiktstekster.");
overviewCopies.forEach((copy) => {
  assert(!copy.includes("avsluttes ved aksept"), "Generelle tilbud skal ikke beskrives som avsluttet ved kundeaksept.");
});
assert(
  terminology.includes('"For varer, arbeid, underentreprenører og andre leveranser. Tilbudet bygges opp fritt."'),
  "Opprett-dialogen skal bruke nøytral slutttekst for Generelt tilbud."
);
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
  "Tilbud akseptert",
  "Takk for aksepten",
  "Utførende bedrift følger",
  "opp saken videre.",
]) {
  assert(customerOffer.includes(needle), `Kundens tilbudsaksept mangler trygg oppfølgingstekst: ${needle}`);
}

console.log("critical-general-offer-terminology-check: OK");
