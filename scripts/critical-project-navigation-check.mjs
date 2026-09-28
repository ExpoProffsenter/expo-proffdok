import fs from "node:fs";

const failures = [];
const requireCheck = (condition, message) => {
  if (!condition) failures.push(message);
};

const guide = fs.readFileSync("src/modules/app/projectWorkspaceHeaderGuide.js", "utf8");
const desktopMenu = fs.readFileSync("src/modules/app/desktopSideMenu.js", "utf8");
const help = fs.readFileSync("src/modules/help/helpToolsCore.js", "utf8");
const css = fs.readFileSync("src/modules/app/projectWorkspaceHeaderGuide.css", "utf8");
const index = fs.readFileSync("index.html", "utf8");
const workflowUx = fs.readFileSync("src/modules/project/projectWorkflowUx.js", "utf8");
const overviewTools = fs.readFileSync("src/modules/project/projectOverviewTools.js", "utf8");
const { resolveProjectFlowNeighbors } = await import(
  "../src/modules/project/projectWorkflowNeighbors.mjs"
);
const { acceptedOfferTotalInclVat } = await import(
  "../src/modules/project/projectSalesOriginTotals.mjs"
);

requireCheck(
  guide.includes("Anbefalt prosjektløp"),
  "Prosjektarbeidsflaten mangler veivisertekst for anbefalt prosjektløp."
);
requireCheck(
  ["Oversikt", "Avtalegrunnlag", "Prosjektering", "Fremdrift"].every((label) => guide.includes(`label: \"${label}\"`)),
  "Prosjektarbeidsflaten mangler ett eller flere avtalte hurtigvalg i anbefalt rekkefølge."
);
requireCheck(
  guide.indexOf('label: "Oversikt"') < guide.indexOf('label: "Avtalegrunnlag"') &&
    guide.indexOf('label: "Avtalegrunnlag"') < guide.indexOf('label: "Prosjektering"') &&
    guide.indexOf('label: "Prosjektering"') < guide.indexOf('label: "Fremdrift"'),
  "Anbefalt prosjektløp har feil rekkefølge."
);
requireCheck(
  guide.includes('source: "Prosjektoversikt"') &&
    guide.includes('source: "Avtalegrunnlag"') &&
    guide.includes('source: "Prosjektering"') &&
    guide.includes('source: "Fremdrift"') &&
    guide.includes("target.click()"),
  "Hurtigvalg bruker ikke eksisterende native prosjektnavigasjon."
);
requireCheck(
  !guide.includes("window.location.assign") && !guide.includes("history.pushState"),
  "Prosjektveiviseren lager en ny navigasjonsmotor i stedet for å gjenbruke eksisterende meny."
);
requireCheck(
  desktopMenu.includes("const projectWorkspaceNav =") &&
    desktopMenu.includes("labels.includes('Prosjektoversikt')") &&
    desktopMenu.includes("labels.includes('Prosjektering')") &&
    desktopMenu.includes("labels.includes('Sjekklister')") &&
    desktopMenu.includes("labels.includes('Avtalegrunnlag')") &&
    desktopMenu.includes("return labels.includes('Hjelp') && (globalNav || projectWorkspaceNav);"),
  "Desktopmenyen må kjenne igjen prosjektarbeidsflate også når eldre prosjekt viser Salgsgrunnlag i stedet for Befaring/Tilbud."
);
requireCheck(
  help.includes("anbefalt prosjektløp: Oversikt, Avtalegrunnlag, Prosjektering og Fremdrift") &&
    !help.includes("hurtigvalgene Oversikt, Bilder, Sjekklister og Chat"),
  "React-Hjelp må beskrive samme anbefalte prosjektløp som prosjektveiviseren."
);
requireCheck(
  css.includes("@media (max-width: 1180px)") && css.includes("display: none !important"),
  "Desktop-veiviseren lekker inn i mobilskallet."
);
requireCheck(
  index.includes("installProjectWorkspaceHeaderGuide"),
  "Prosjektveiviseren installeres ikke fra app-shell."
);
requireCheck(
  workflowUx.includes("resolveProjectFlowNeighbors(activeLabel, navLabels)") &&
    workflowUx.includes("updateDesktopFlowButton(desktopPrev, 'previous', previousLabel)") &&
    workflowUx.includes("updateDesktopFlowButton(desktopNext, 'next', nextLabel)"),
  "Forrige/Neste-adapteren gjenoppretter ikke korrekte etiketter og mål etter fanebytte."
);

const projectNavLabels = [
  "Prosjektoversikt",
  "Salgsgrunnlag",
  "Prosjektbeskrivelse",
  "Garanti",
  "Firmaprofil",
  "Prosjektering",
  "Fremdrift",
];
requireCheck(
  JSON.stringify(resolveProjectFlowNeighbors("Prosjektoversikt", projectNavLabels)) ===
    JSON.stringify({ previousLabel: "", nextLabel: "Prosjektbeskrivelse" }),
  "Prosjektoversikt hopper ikke trygt over skrivebeskyttet Salgsgrunnlag."
);
requireCheck(
  JSON.stringify(resolveProjectFlowNeighbors("Salgsgrunnlag", projectNavLabels)) ===
    JSON.stringify({ previousLabel: "Prosjektoversikt", nextLabel: "Prosjektbeskrivelse" }),
  "Salgsgrunnlag peker ikke til korrekt forrige/neste prosjektsteg."
);
requireCheck(
  JSON.stringify(resolveProjectFlowNeighbors("Prosjektbeskrivelse", projectNavLabels)) ===
    JSON.stringify({ previousLabel: "Prosjektoversikt", nextLabel: "Garanti" }),
  "Prosjektbeskrivelse gjenoppretter ikke korrekt neste steg etter spesialhoppet."
);
requireCheck(
  JSON.stringify(resolveProjectFlowNeighbors("Prosjektering", projectNavLabels)) ===
    JSON.stringify({ previousLabel: "Firmaprofil", nextLabel: "Fremdrift" }),
  "Ordinære prosjektfaner arver fortsatt gamle Forrige/Neste-etiketter."
);
requireCheck(
  overviewTools.includes("acceptedOfferTotalInclVat(project?.salesOrigin?.acceptedTotal)"),
  "Prosjektoversikten viser fortsatt lagret tilbudssum eks. mva. under etiketten inkl. mva."
);
requireCheck(
  acceptedOfferTotalInclVat(370930.1) === 463662.625 &&
    acceptedOfferTotalInclVat(0) === 0 &&
    acceptedOfferTotalInclVat("ugyldig") === 0,
  "Akseptert tilbudssum konverteres ikke sikkert fra eks. til inkl. mva."
);

if (failures.length) {
  console.error("\n❌ Expo ProffDok project navigation check FEILET:\n");
  failures.forEach((failure) => console.error(`- ${failure}`));
  console.error("\nBuild stoppes før deploy.\n");
  process.exit(1);
}

console.log("✅ Expo ProffDok project navigation check OK – anbefalt løp, Help og legacy prosjektmeny bruker samme trygge native flyt");
