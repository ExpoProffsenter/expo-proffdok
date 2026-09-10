import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function requireNeedles(path, needles) {
  const text = read(path);
  for (const needle of needles) {
    if (!text.includes(needle)) {
      throw new Error(`${path}: mangler kritisk 41B.1-guard: ${needle}`);
    }
  }
  return text;
}

const support = requireNeedles("src/modules/access/supportModeProjection.js", [
  "SYSTEMADMIN SUPPORTMODUS",
  "listManagedModuleAccess",
  "listSalesSupportCompanies",
  "salesSupportCompany",
  "target?.module_keys",
  "publishModuleAccess",
  "Denne brukeren har ikke tilgang til Befaring/Tilbud.",
]);

for (const forbidden of [
  "salesClient.from(",
  "client.from(",
  ".insert(",
  ".upsert(",
]) {
  if (support.includes(forbidden)) {
    throw new Error(`supportModeProjection.js skal ikke skrive direkte til database: ${forbidden}`);
  }
}

requireNeedles("src/modules/sales/components/SalesListView.jsx", [
  "queryTokens.every",
  "requestSearchValues",
  "compactSearchText",
]);

requireNeedles("src/modules/sales/salesOverviewSearchUx.js", [
  "Søk og filtrering",
  "Arbeidsstatus",
  "salesSearchHadQuery",
  "allButton.click()",
]);

requireNeedles("index.html", [
  "installSupportModeProjection",
  "installSalesOverviewSearchUx",
]);

console.log("✅ Expo ProffDok Sales-oversikt/supportmodus check OK");
