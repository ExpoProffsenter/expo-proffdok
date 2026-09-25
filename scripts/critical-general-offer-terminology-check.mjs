import fs from "node:fs";
import assert from "node:assert/strict";

const terminology = fs.readFileSync("src/modules/sales/generalOfferTerminologyUx.js", "utf8");
const storeOffers = fs.readFileSync("src/modules/sales/services/salesStoreOffers.js", "utf8");
const indexHtml = fs.readFileSync("index.html", "utf8");

assert(storeOffers.includes('STORE_OFFER_SOURCE = "Butikktilbud / varesalg"'), "Teknisk Butikktilbud-kilde må beholdes for bakoverkompatibilitet.");
assert(storeOffers.includes('STORE_OFFER_TITLE = "Generelt tilbud"'), "Nye generelle tilbud må få nytt brukerrettet standardnavn.");

for (const needle of [
  "Generelle tilbud",
  "Generelt tilbud",
  "For varer, arbeid, underentreprenører og andre leveranser",
  "replaceExactTextNodes",
  "setTextIfChanged",
  "MutationObserver",
]) {
  assert(terminology.includes(needle), `Terminologi-UX mangler: ${needle}`);
}
assert(!terminology.includes("characterData: true"), "Terminologi-observer skal ikke lytte på egne tekstnodeendringer.");
assert(indexHtml.includes("installGeneralOfferTerminologyUx"), "Generelle tilbud-terminologi må installeres fra app-entry.");

console.log("critical-general-offer-terminology-check: OK");
