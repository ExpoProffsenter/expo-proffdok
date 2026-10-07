import fs from "node:fs";
import * as jsxRuntime from "react/jsx-runtime";

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
const main = fs.readFileSync("src/main.jsx", "utf8");
// User-reported removeChild crash, 7 Oct 2026: the legacy workflow adapter
// replaces button.textContent. React must own one host text value, not several
// conditional Text fibers which it later tries to remove when opening KS/HMS.
const bottomStart = main.indexOf('(0, import_jsx_runtime.jsxs)("div", { className: "bottomPrevNext"');
const bottomEnd = main.indexOf('\n    ] });', bottomStart);
requireCheck(bottomStart >= 0 && bottomEnd > bottomStart, 'Fant ikke faktisk Forrige/Neste-renderer for krasjkontroll.');
if (bottomStart >= 0 && bottomEnd > bottomStart) {
  const renderBottom = new Function('import_jsx_runtime', 'previousTab', 'nextTab', 'goToTab', `return ${main.slice(bottomStart, bottomEnd)}`);
  for (const [previous, next] of [[['sjekklister', 'Sjekklister'], ['chat', 'Chat (2 ulest)']], [null, null]]) {
    const rendered = renderBottom(jsxRuntime, previous, next, () => {});
    requireCheck(rendered.props.children.every(button => typeof button.props.children === 'string'), 'Forrige/Neste bruker betingede tekstnoder som kan gi removeChild-krasj ved KS/HMS-overgangen.');
    requireCheck(rendered.props.children[0].props.children === (previous ? `← Forrige: ${previous[1]}` : '← Forrige'), 'Forrige mistet faktisk prosjektnavn/etikett.');
    requireCheck(rendered.props.children[1].props.children === (next ? `Neste: ${next[1]} →` : 'Neste →'), 'Neste mistet faktisk prosjektnavn/etikett.');
  }
}
const { resolveProjectFlowNeighbors } = await import(
  "../src/modules/project/projectWorkflowNeighbors.mjs"
);
const {
  createGlobalAppTabs,
  createProjectWorkspaceTabs,
  isProjectDeviationNavLabel,
} = await import("../src/modules/project/projectNavigationTabs.mjs");

// Reported missing desktop entry, 8 Oct 2026: test the actual header matcher,
// including its dynamic label, rather than only checking the native tab array.
const shortcutDefinitions = guide.slice(guide.indexOf('const clean ='), guide.indexOf('function findSourceNav()'));
const actualShortcuts = new Function('isProjectDeviationNavLabel', `${shortcutDefinitions}; return PROJECT_SHORTCUTS;`)(isProjectDeviationNavLabel);
const actualDeviationShortcut = actualShortcuts.find(item => item.key === 'deviations');
for (const label of ['Avvik', 'Avvik (4)', 'Avvik/SJA/RUH', 'Avvik/SJA/RUH (4)']) {
  requireCheck(actualDeviationShortcut?.matches(label) && actualDeviationShortcut.dynamicLabel, `Toppmenyen skjuler eller forkorter ${label}.`);
}
for (const label of ['Avvikssentral', 'Avvik/RUH', 'SJA', 'RUH', 'Avvik/SJA/RUH annet']) {
  requireCheck(!isProjectDeviationNavLabel(label), `Prosjektmenyen matcher feil funksjon: ${label}.`);
}
const bootstrap = fs.readFileSync('src/bootstrap.jsx', 'utf8');
requireCheck(bootstrap.includes('return isProjectDeviationNavLabel(label);') &&
  workflowUx.includes('setFlowTarget(button, cleanText(destination.textContent),'),
  'Åpne Avvik bruker fortsatt det gamle navnet i stedet for faktisk prosjektnavigasjon.');
const { acceptedOfferTotalInclVat } = await import(
  "../src/modules/project/projectSalesOriginTotals.mjs"
);

requireCheck(
  guide.includes('hint.textContent = "Prosjektmeny"'),
  "Prosjektarbeidsflaten mangler tydelig etikett for den komplette prosjektmenyen."
);
const expectedHeaderProjectLabels = [
  "Oversikt",
  "Salgsgrunnlag",
  "Prosjektbeskrivelse",
  "Avtalegrunnlag",
  "Prosjektering",
  "Fremdrift",
  "Produkter",
  "Overflater og innredning",
  "Bilder",
  "Tilgang",
  "Fag/utstyr",
  "Sjekklister",
  "Avvik",
  "Chat",
  "Interne notater",
  "Overtagelse",
  "Garanti",
  "Rapport",
];
requireCheck(
  expectedHeaderProjectLabels.every((label) => guide.includes(`label: \"${label}\"`)),
  "Den kompakte toppmenyen mangler én eller flere prosjektrelaterte faner."
);
requireCheck(
  guide.indexOf('label: "Oversikt"') < guide.indexOf('label: "Prosjektbeskrivelse"') &&
    guide.indexOf('label: "Prosjektbeskrivelse"') < guide.indexOf('label: "Avtalegrunnlag"') &&
    guide.indexOf('label: "Avtalegrunnlag"') < guide.indexOf('label: "Prosjektering"') &&
    guide.indexOf('label: "Prosjektering"') < guide.indexOf('label: "Fremdrift"'),
  "Prosjektfanene ligger ikke i avtalt arbeidsrekkefølge øverst."
);
requireCheck(
  guide.includes("sourceButton(shortcut.key)") &&
    guide.includes("sourceButton(key)") &&
    guide.includes("target.click()"),
  "Toppfanene bruker ikke eksisterende native prosjektnavigasjon."
);
requireCheck(
  !guide.includes("window.location.assign") && !guide.includes("history.pushState"),
  "Prosjektveiviseren lager en ny navigasjonsmotor i stedet for å gjenbruke eksisterende meny."
);
requireCheck(
  desktopMenu.includes("const projectWorkspaceNav =") &&
    desktopMenu.includes("labels.includes('Prosjektoversikt')") &&
    desktopMenu.includes("labels.includes('Nytt prosjekt')") &&
    desktopMenu.includes("labels.includes('Prosjektering')") &&
    desktopMenu.includes("labels.includes('Sjekklister')") &&
    desktopMenu.includes("labels.includes('Avtalegrunnlag')") &&
    desktopMenu.includes("return labels.includes('Hjelp') && (globalNav || projectWorkspaceNav);"),
  "Desktopmenyen må kjenne igjen prosjektarbeidsflate også når eldre prosjekt viser Salgsgrunnlag i stedet for Befaring/Tilbud."
);
requireCheck(
  guide.includes('label === "Prosjektoversikt" || label === "Nytt prosjekt"') &&
    workflowUx.includes("navButtonForLabel(nav, 'Nytt prosjekt')"),
  "Nytt, ulagret prosjekt gjenkjennes ikke som samme prosjektarbeidsflate som et lagret prosjekt."
);
requireCheck(
  workflowUx.includes(
    "Prosjekter opprettet direkte uten salgssak viser bare prosjektfunksjonene. Befaring/Tilbud åpnes separat fra Startsiden."
  ) &&
    !workflowUx.includes("beholder Befaring/Tilbud som separat funksjon"),
  "Hjelpeteksten beskriver fortsatt den gamle blandede menyen for direkte opprettede prosjekter."
);
requireCheck(
  main.includes("const tabs = hasActiveProjectWorkspace ? projectTabs : globalTabs;") &&
    main.includes("createProjectWorkspaceTabs({") &&
    main.includes("createGlobalAppTabs({"),
  "Appen skiller ikke eksplisitt mellom global navigasjon og prosjektmeny."
);
requireCheck(
  help.includes("anbefalt prosjektløp: Oversikt, Avtalegrunnlag, Prosjektering og Fremdrift") &&
    !help.includes("hurtigvalgene Oversikt, Bilder, Sjekklister og Chat"),
  "React-Hjelp må beskrive samme anbefalte prosjektløp som prosjektveiviseren."
);
requireCheck(
  css.includes(".expoDesktopMenuBarHasProjectGuide") &&
    css.includes("flex-wrap: wrap") &&
    !css.includes('[data-source-label="Sjekklister"]') &&
    css.includes("@media (max-width: 1180px)") &&
    css.includes("display: none !important"),
  "Den komplette prosjektmenyen er ikke synlig og brytbar på desktop, eller lekker inn i mobilskallet."
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
  "Avtalegrunnlag",
  "Prosjektering",
  "Fremdrift",
  "Produkter",
  "Bilder",
  "Sjekklister",
  "Overtagelse",
  "Rapport",
  "Hjelp",
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
    JSON.stringify({ previousLabel: "Prosjektoversikt", nextLabel: "Avtalegrunnlag" }),
  "Prosjektbeskrivelse gjenoppretter ikke korrekt neste steg etter spesialhoppet."
);
requireCheck(
  JSON.stringify(resolveProjectFlowNeighbors("Prosjektering", projectNavLabels)) ===
    JSON.stringify({ previousLabel: "Avtalegrunnlag", nextLabel: "Fremdrift" }),
  "Forrige/Neste lekker fortsatt innom globale appfunksjoner."
);

const newProjectNavLabels = [
  "Nytt prosjekt",
  "Prosjektbeskrivelse",
  "Avtalegrunnlag",
  "Prosjektering",
  "Fremdrift",
];
requireCheck(
  JSON.stringify(resolveProjectFlowNeighbors("Nytt prosjekt", newProjectNavLabels)) ===
    JSON.stringify({ previousLabel: "", nextLabel: "Prosjektbeskrivelse" }) &&
    JSON.stringify(resolveProjectFlowNeighbors("Prosjektbeskrivelse", newProjectNavLabels)) ===
      JSON.stringify({ previousLabel: "Nytt prosjekt", nextLabel: "Avtalegrunnlag" }),
  "Nytt prosjekt følger ikke samme rene prosjektflyt som et eksisterende prosjekt."
);

const directProjectTabs = createProjectWorkspaceTabs({ isNewProject: true });
const salesProjectTabs = createProjectWorkspaceTabs({ hasSalesOrigin: true });
const globalTabs = createGlobalAppTabs({
  isCompanyAdminUser: true,
  canUseAdminProjectSync: true,
});
const directProjectIds = directProjectTabs.map(([id]) => id);
const salesProjectIds = salesProjectTabs.map(([id]) => id);
const globalIds = globalTabs.map(([id]) => id);
const globalOnlyIds = ["firma", "innlogging", "firmaadmin", "prosjektliste", "admin"];
const requiredProjectIds = [
  "prosjekt", "prosjektinfo", "tilbud", "prosjektering", "fremdrift", "produkter",
  "overflater", "bilder", "tilgang", "installasjoner", "sjekklister", "avvik",
  "chat", "internt", "overtagelse", "garanti", "rapport",
];
requireCheck(
  directProjectTabs[0]?.[1] === "Nytt prosjekt" &&
    requiredProjectIds.every((id) => directProjectIds.includes(id)) &&
    globalOnlyIds.every((id) => !directProjectIds.includes(id)) &&
    !directProjectIds.includes("sales"),
  "Direkte Nytt prosjekt viser ikke bare relevante prosjektfunksjoner."
);
requireCheck(
  salesProjectIds.includes("sales") &&
    salesProjectIds.indexOf("sales") < salesProjectIds.indexOf("prosjektinfo"),
  "Prosjekt fra akseptert tilbud beholder ikke Salgsgrunnlag som historikk utenfor anbefalt Neste-flyt."
);
requireCheck(
  requiredProjectIds.filter((id) => id !== "prosjekt").every((id) => !globalIds.includes(id)),
  "Global appmeny blander fortsatt inn prosjektfaner uten at et prosjekt er åpnet."
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
