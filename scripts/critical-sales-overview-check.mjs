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
  "Avslutt supportmodus",
  'querySelector("small")',
  "listManagedModuleAccess",
  "listSalesSupportCompanies",
  "salesSupportCompany",
  "target?.module_keys",
  "publishModuleAccess",
  "clearProjection",
  "restoreOwnHeaderBranding",
  "returnToOwnSystemAdminWorkspace",
  'url.searchParams.delete("project")',
  'url.searchParams.set("tab", "systemadmin")',
  "window.location.replace",
  'compactText(button.textContent) !== "Systemadmin"',
  "supportSystemAdminHidden",
  "data-support-system-admin-hidden",
  "Denne brukeren har ikke tilgang til Befaring/Tilbud.",
]);

if (/salesClient\s*\.\s*from\s*\(/.test(support)) {
  throw new Error("supportModeProjection.js skal ikke skrive direkte til database.");
}

const salesList = requireNeedles("src/modules/sales/components/SalesListView.jsx", [
  "queryTokens.every",
  "requestSearchValues",
  "compactSearchText",
  "function handleSearchChange",
  'setActiveTab("all")',
  "onChange={handleSearchChange}",
  '<div className="sales-header">',
]);

if (salesList.includes('<header className="sales-header">')) {
  throw new Error("Sales-header må ikke arve hovedappens globale sticky <header>-regel.");
}

const desktopMenu = requireNeedles("src/modules/app/desktopSideMenu.js", [
  "styleBarHomeButton",
  "styleBarHelpButton",
  "bar.append(toggle, homeButton, current, helpButton)",
  "styleBarHomeButton(shell.homeButton)",
  "styleBarHelpButton(shell.helpButton)",
  "Du er i: ${activeLabel}",
]);

if (desktopMenu.includes("document.body.append(homeButton)")) {
  throw new Error("Startside-knappen skal ligge stabilt i desktopmenylinjen, ikke flyte over prosjekt-headeren.");
}
if (desktopMenu.includes("document.body.append(homeButton, helpButton)")) {
  throw new Error("Hjelp-knappen skal ligge stabilt i desktopmenylinjen, ikke flyte over headeren.");
}

const index = requireNeedles("index.html", ["installSupportModeProjection"]);
if (index.includes("installSalesOverviewSearchUx")) {
  throw new Error("Den gamle DOM-baserte Sales-søkeadapteren skal være fjernet.");
}
if (fs.existsSync("src/modules/sales/salesOverviewSearchUx.js")) {
  throw new Error("salesOverviewSearchUx.js er overflødig etter at søket flyttet inn i SalesListView.");
}

console.log("✅ Expo ProffDok Sales-oversikt/supportmodus check OK");
