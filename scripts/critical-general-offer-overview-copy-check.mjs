import fs from "node:fs";
import assert from "node:assert/strict";

const terminology = fs.readFileSync(
  "src/modules/sales/generalOfferTerminologyUx.js",
  "utf8"
);

for (const needle of [
  'const LEGACY_ENGINE_OVERVIEW = "Våtromstilbud og Butikktilbud ligger i samme sikre tilbudsmotor, men kan filtreres separat under."',
  'const GENERAL_ENGINE_OVERVIEW = "Våtromstilbud og Generelle tilbud ligger i samme sikre tilbudsmotor, men kan filtreres separat under."',
  "function patchLegacyEngineOverviewCopy()",
  "compactText(node.textContent) === LEGACY_ENGINE_OVERVIEW",
  "setTextIfChanged(node, GENERAL_ENGINE_OVERVIEW)",
  "patchLegacyEngineOverviewCopy();",
]) {
  assert(
    terminology.includes(needle),
    `Generelle tilbud-oversiktstekst mangler guard: ${needle}`
  );
}

console.log("critical-general-offer-overview-copy-check: OK");
