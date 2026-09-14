import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function requireNeedles(path, needles) {
  const text = read(path);
  for (const needle of needles) {
    if (!text.includes(needle)) {
      throw new Error(`${path}: mangler kritisk Hjelp-guard: ${needle}`);
    }
  }
  return text;
}

const help42d = requireNeedles("src/modules/help/phase42dHelpUx.js", [
  "Badskisse i befaringsnotatet",
  "Søk, filtrering og videreføring fra befaring",
  "Representerer / arbeidsprofil",
  "Befaring, revidert tilbud og bestillingsgrunnlag",
  "Internt vareregister – Cordel-import",
  "current_user_has_internal_store_price_search_access",
  "internalCommerceAccessLoaded",
  "canUseInternalCommerce",
  'removeSection("catalog-import")',
  'removeSection("internal-commerce-scope")',
  "correctOlderRestrictedHelpText",
  "Sist oppdatert: 14.09.2026",
]);

if (!help42d.includes("if (!internalCommerceAccessLoaded || !canUseInternalCommerce)")) {
  throw new Error("Vareregister-/Prissøk-hjelp skal være deny-by-default uten bekreftet intern handelstilgang.");
}

if (help42d.includes("new MutationObserver")) {
  throw new Error("FASE 42D Hjelp skal ikke innføre ny global MutationObserver.");
}

requireNeedles("index.html", [
  "installPhase42DHelpUx",
  "/src/modules/help/phase42dHelpUx.js",
]);

console.log("✅ Expo ProffDok Hjelp / Badskisse / tilgangsstyrt vareregister check OK");
