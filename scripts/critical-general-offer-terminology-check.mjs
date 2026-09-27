import fs from "node:fs";
import assert from "node:assert/strict";
import { decorateRequestForOptionalityPresentation } from "../src/modules/sales/utils/salesOfferOptionalityPresentation.js";

const terminology = fs.readFileSync("src/modules/sales/generalOfferTerminologyUx.js", "utf8");
const requestForm = fs.readFileSync("src/modules/sales/components/SalesRequestForm.jsx", "utf8");
const offerLogic = fs.readFileSync("src/modules/sales/utils/salesOfferLogic.js", "utf8");
const proBuilder = fs.readFileSync("src/modules/sales/components/SalesStoreOfferBuilderProCatalog.jsx", "utf8");
const optionalityPresentation = fs.readFileSync("src/modules/sales/utils/salesOfferOptionalityPresentation.js", "utf8");
const storeOffers = fs.readFileSync("src/modules/sales/services/salesStoreOffers.js", "utf8");
const indexHtml = fs.readFileSync("index.html", "utf8");
const salesModule = fs.readFileSync("src/modules/sales/SalesModule.jsx", "utf8");
const salesList = fs.readFileSync("src/modules/sales/components/SalesListView.jsx", "utf8");
const salesDetail = fs.readFileSync("src/modules/sales/components/SalesDetailView.jsx", "utf8");
const storeBuilder = fs.readFileSync("src/modules/sales/components/SalesStoreOfferBuilderGrouped.jsx", "utf8");
const templatePanel = fs.readFileSync("src/modules/sales/components/StoreOfferCompleteTemplatePanel.jsx", "utf8");
const moduleAccess = fs.readFileSync("src/modules/access/moduleAccessClient.js", "utf8");
const helpCore = fs.readFileSync("src/modules/help/helpToolsCore.js", "utf8");

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
  '{ id: "store", label: "Generelle tilbud" }',
  "Våtromstilbud og Generelle tilbud ligger i samme sikre tilbudsmotor",
  '{storeOffer ? "Generelt tilbud" : "Våtromstilbud"}',
]) {
  assert(salesList.includes(needle), `Tilbudsoversikten mangler direkte Generelt tilbud-tekst: ${needle}`);
}
assert(!salesList.includes('{ id: "store", label: "Butikktilbud" }'), "Tilbudsfilteret skal ikke avhenge av ettermontert DOM-omskriving.");
assert(!salesList.includes("Våtromstilbud og Butikktilbud ligger i samme sikre tilbudsmotor"), "Tilbudsoversikten har gammel synlig oversiktstekst.");

for (const needle of [
  "Opprett og følg Generelle tilbud for varer, arbeid, underentreprenører og andre leveranser.",
  "Her håndterer du forespørsler, Våtromstilbud og Generelle tilbud.",
  '>Generelt tilbud</strong>',
  "For varer, arbeid, underentreprenører og andre leveranser. Tilbudet bygges opp fritt.",
]) {
  assert(salesModule.includes(needle), `Tilbudsvalg/intro mangler direkte Generelt tilbud-tekst: ${needle}`);
}

for (const needle of [
  "Generelt tilbud akseptert – velg videreføring",
  "Det generelle tilbudet er ferdig behandlet.",
  "Velg Enkel ordre eller ordinært prosjekt ut fra omfanget på oppdraget.",
]) {
  assert(salesDetail.includes(needle), `Akseptert Generelt tilbud mangler stabil videreføringstekst: ${needle}`);
}

for (const needle of [
  '<span>Generelt tilbud</span>',
  '<p className="sales-eyebrow">Generelt tilbud</p>',
  "Lagre tilbud",
]) {
  assert(storeBuilder.includes(needle), `Tilbudsbyggeren mangler direkte Generelt tilbud-tekst: ${needle}`);
}
assert(!storeBuilder.includes('<p className="sales-eyebrow">Butikktilbud</p>'), "Tilbudsbyggeren skal ikke vise gammelt navn.");

for (const needle of [
  "Komplette maler for Generelt tilbud",
  "lagrede maler for Generelt tilbud",
]) {
  assert(templatePanel.includes(needle), `Malpanelet mangler Generelt tilbud-tekst: ${needle}`);
}

for (const needle of [
  'label: "Generelle tilbud"',
  'shortLabel: "Generelle tilbud"',
  "Tilbud for varer, arbeid, underentreprenører og andre leveranser.",
]) {
  assert(moduleAccess.includes(needle), `Modultilgangen mangler Generelle tilbud-tekst: ${needle}`);
}

for (const needle of [
  '"🧾 Generelle tilbud"',
  "Generelle tilbud brukes til varer, arbeid, underentreprenører og andre leveranser.",
  "Etter aksept velger firmaet Enkel ordre eller ordinært prosjekt",
]) {
  assert(helpCore.includes(needle), `Hjelp mangler oppdatert Generelt tilbud-regel: ${needle}`);
}

for (const needle of [
  'const STORE_OFFER_SOURCE = "Butikktilbud / varesalg"',
  'const GENERAL_OFFER_DEFAULT_TITLE = "Generelt tilbud"',
  "isGeneralOfferRequest",
  "isGeneratedTitleForRequest",
  "isGeneratedDirectOfferTitle",
  'candidate === `Tilbud – ${requestTitle}`',
  "normalizeGeneralOfferTitle",
  "generatedDirectTitle",
  "String(request?.title || GENERAL_OFFER_DEFAULT_TITLE)",
  "title: generalOfferTitle",
  "const form = normalizeGeneralOfferTitle(rawForm, request)",
]) {
  assert(offerLogic.includes(needle), `Tilbudsnavn følger ikke korrekt inn i tilbudsbyggeren: ${needle}`);
}

for (const needle of [
  "INTERNAL_SENDER_COMPANIES",
  '"ringside rørleggerbedrift as"',
  '"ringside as"',
  '"bademiljø expo"',
  '"bademiljø expo as"',
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
  !proBuilder.includes('"expo proffsenter",'),
  "Expo Proffsenter skal ikke ha intern Ringside/Bademiljø-merkevarevelger."
);
assert(
  !proBuilder.includes('"expo proffsenter as",'),
  "Expo Proffsenter AS skal ikke ha intern Ringside/Bademiljø-merkevarevelger."
);
assert(
  proBuilder.includes("profile.logoUrl || EMPTY_COMPANY_LOGO_DATA_URL"),
  "Firma uten intern merkevarerett og uten logo kan fortsatt falle tilbake til en intern Expo/Ringside-logo."
);

for (const needle of [
  "getVersionLockedStoreOfferMeta",
  "getActiveOfferVersion",
  "getStoreOfferMeta(activeVersion?.lines || [])",
  "versionStoreOfferMeta",
  "storeOfferMeta: versionStoreOfferMeta",
]) {
  assert(optionalityPresentation.includes(needle), `Versjonslåst avsenderprioritet mangler: ${needle}`);
}

const versionWins = decorateRequestForOptionalityPresentation({
  id: "QA-VERSION-SENDER",
  storeOfferMeta: {
    __storeOfferMeta: true,
    brandLabel: "Bademiljø Expo",
    brandLogoUrl: "/legacy-bademiljo.svg",
  },
  sentOfferVersionId: "v2",
  sentOfferVersionNumber: 2,
  offerVersions: [
    {
      id: "v2",
      versionNumber: 2,
      lines: [
        {
          __storeOfferMeta: true,
          brandMode: "company",
          brandKey: "company-profile",
          brandLabel: "Expo Proffsenter",
          brandLogoUrl: "/expo-proffsenter.svg",
          signatureName: "Kenneth Demo",
        },
      ],
      options: [],
    },
  ],
  offerOptions: [],
});
assert.equal(
  versionWins.storeOfferMeta?.brandLabel,
  "Expo Proffsenter",
  "Aktiv tilbudsversjon må vinne over eldre Bademiljø-metadata på saken."
);
assert.equal(
  versionWins.storeOfferMeta?.brandLogoUrl,
  "/expo-proffsenter.svg",
  "Logo må komme fra aktiv tilbudsversjon."
);

const legacyFallback = decorateRequestForOptionalityPresentation({
  id: "QA-LEGACY-SENDER",
  storeOfferMeta: {
    __storeOfferMeta: true,
    brandLabel: "Bademiljø Expo",
    brandLogoUrl: "/legacy-bademiljo.svg",
  },
  sentOfferVersionId: "legacy-v1",
  offerVersions: [{ id: "legacy-v1", versionNumber: 1, lines: [], options: [] }],
  offerOptions: [],
});
assert.equal(
  legacyFallback.storeOfferMeta?.brandLabel,
  "Bademiljø Expo",
  "Gamle versjoner uten versjonsmetadata skal beholde saksmetadata som fallback."
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
  "patchGeneratedGeneralOfferTitle",
  'root.querySelector(".sales-detail-hero .sales-title")',
  '`Tilbud – ${title}`',
  'root.querySelectorAll(".sales-next-card strong")',
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

console.log("critical-general-offer-terminology-check: OK");
