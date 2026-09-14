// Expo ProffDok – FASE 42D HJELP
// Brukerrettet hjelp for Badskisse, nyere Befaring/Tilbud-flyt,
// Butikktilbud, arbeidsprofil og oppdatert Cordel-vareregister.
// Hjelp om Prissøk/vareregister vises kun når serveren bekrefter intern handelstilgang.

import { rpcWithStoredSession } from "../access/moduleAccessClient.js";

const SALES_HELP_TITLE = "🧾 Befaring/Tilbud";
const STORE_HELP_TITLE = "🛍️ Butikktilbud";
const START_HELP_TITLE = "🚀 Startside / kom i gang";
const SYSTEMADMIN_HELP_TITLE = "⚙️ Systemadministrasjon";
const HELP_UPDATED_LABEL = "Sist oppdatert: 14.09.2026";

let internalCommerceAccessLoaded = false;
let canUseInternalCommerce = false;

function compactText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function findHelpItem(title) {
  const label = Array.from(document.querySelectorAll("button b")).find(
    (node) => compactText(node.textContent) === title
  );
  return label?.closest(".item") || null;
}

function helpContent(item) {
  if (!(item instanceof HTMLElement)) return null;
  return item.querySelector("button + div") || item;
}

function createList(items = []) {
  const list = document.createElement("ul");
  list.style.marginTop = "8px";
  items.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    list.appendChild(li);
  });
  return list;
}

function appendSectionOnce(container, key, title, items) {
  if (!(container instanceof HTMLElement) || container.querySelector(`[data-help42d='${key}']`)) return;

  const block = document.createElement("div");
  block.dataset.help42d = key;
  block.style.marginTop = "16px";
  block.style.paddingTop = "10px";
  block.style.borderTop = "1px solid #dbe5ea";

  const heading = document.createElement("h4");
  heading.textContent = title;
  heading.style.marginTop = "0";
  heading.style.marginBottom = "6px";
  block.appendChild(heading);
  block.appendChild(createList(items));
  container.appendChild(block);
}

function removeSection(key) {
  document.querySelectorAll(`[data-help42d='${key}']`).forEach((node) => node.remove());
}

function ensureSalesHelp() {
  const content = helpContent(findHelpItem(SALES_HELP_TITLE));
  if (!content) return;

  appendSectionOnce(content, "sales-search", "Søk, filtrering og videreføring fra befaring", [
    "Bruk søkefeltet i Befaring/Tilbud for å finne saker på blant annet kunde, adresse, e-post, telefon, saksreferanse, ansvarlig, tilbudstype, status og tilbudsinnhold.",
    "Når du starter et nytt søk, søker appen på tvers av statusene. Du kan deretter snevre inn med statusfanene og eget Befaring-filter.",
    "En registrert befaring kan videreføres i samme salgssak som ordinært Våtromstilbud eller som Butikktilbud når brukeren har tilgang til Butikktilbud.",
    "Velg riktig tilbudstype før du bygger tilbudet. Historikk og befaringsgrunnlag beholdes på samme sak."
  ]);

  appendSectionOnce(content, "bathroom-sketch", "Badskisse i befaringsnotatet", [
    "Åpne befaringsnotatet og velg Badskisse når du vil måle opp og skissere badet direkte på mobil eller PC.",
    "Tegn vegger med 90° som standard. Veggkjeden fortsetter fra forrige endepunkt og kan lukkes tilbake til start. Frihånd kan brukes når rommet ikke følger rette vinkler.",
    "Legg inn faktiske veggmål i millimeter. Målene styrer proporsjonene i skissen, og vegghjørner kan flyttes ved behov.",
    "Dør og vindu kan plasseres på vegg og gis manuelle mål. Vindu kan også registreres med høyde fra ferdig gulv til underkant. Dør kan få riktig hengsling og slagretning.",
    "Marker sluk, avløp, kaldt vann og varmt vann, og legg inn målbar kasse/sjakt som kan flyttes og snappe til vegg eller hjørne.",
    "WC har standard størrelse, mens servant, dusj og badekar kan plasseres, flyttes og målsettes. Objekter kan snappe mot vegg for rask oppmåling.",
    "Trykk direkte på et objekt for å velge og redigere det. Under drag skjules redigeringspanelet slik at objektet er synlig mens det flyttes.",
    "Når befaringsnotatet lagres, følger ferdig Badskisse med som et befaringsbilde. Den redigerbare skissegeometrien lagres foreløpig lokalt på enheten, så bruk samme enhet hvis skissen skal redigeres videre senere."
  ]);
}

function ensureStoreHelp() {
  const content = helpContent(findHelpItem(STORE_HELP_TITLE));
  if (!content) return;

  appendSectionOnce(content, "store-revision-order", "Befaring, revidert tilbud og bestillingsgrunnlag", [
    "En eksisterende befaring kan videreføres til Butikktilbud i samme salgssak når brukeren har Butikktilbud-tilgang.",
    "Hvis kunden avviser et Butikktilbud, beholdes den avviste tilbudsversjonen som låst historikk. Bruk Ny/revidert versjon når tilbudet skal endres og sendes på nytt; den gamle versjonen overskrives ikke.",
    "Når et Butikktilbud er akseptert, kan du åpne et skrivebeskyttet bestillingsgrunnlag med avsnitt, varer, antall, montering og valgte opsjoner fra den aksepterte versjonen.",
    "Bestillingsgrunnlaget er et internt arbeidsgrunnlag og endrer ikke kundens aksepterte tilbud eller historikken."
  ]);
}

function ensureStartHelp() {
  const content = helpContent(findHelpItem(START_HELP_TITLE));
  if (!content) return;

  appendSectionOnce(content, "work-profile", "Representerer / arbeidsprofil", [
    "Hvis du har fått tilgang til å arbeide på vegne av flere interne firmaer, vises valget Representerer. Velg riktig arbeidsprofil før du oppretter eller behandler nytt arbeid.",
    "Aktiv arbeidsprofil styrer hvilket firma du representerer i de arbeidsflatene som støtter funksjonen. Kontroller alltid firmanavn og logo før tilbud publiseres eller nytt prosjekt opprettes.",
    "Tilgang til en arbeidsprofil gis sentralt av systemadministrator. Den gir ikke automatisk tilgang til Butikktilbud, Prissøk eller interne nettopriser; disse rettighetene styres separat."
  ]);
}

function ensureRestrictedSystemAdminHelp() {
  if (!internalCommerceAccessLoaded || !canUseInternalCommerce) {
    removeSection("catalog-import");
    removeSection("internal-commerce-scope");
    return;
  }

  const content = helpContent(findHelpItem(SYSTEMADMIN_HELP_TITLE));
  if (!content) return;

  appendSectionOnce(content, "catalog-import", "Internt vareregister – Cordel-import", [
    "Oppdatering av ERP-vareregisteret er en systemadmin-oppgave. Bruk Ringsides faste Cordel-eksport i tekstformat og kontroller importoversikten før nytt register aktiveres.",
    "Varer som er merket Utgått i Cordel hoppes automatisk over og kommer ikke med i den nye aktive katalogen.",
    "Gamle leverandørregistre der leverandørnavnet starter med ÅVP hoppes automatisk over.",
    "Linjer med 0 i nettopris eller utsalgspris, manglende varenummer eller strukturfeil håndteres separat og vises i importoversikten.",
    "Kontroller Linjer, Gyldige/unike, Duplikater, Utgått i Cordel, ÅVP hoppet over, 0-pris, Mangler varenr. og Strukturfeil før Aktiver nytt vareregister brukes.",
    "Aktivering bytter hvilken import som er autoritativ for søket. Historiske publiserte eller aksepterte tilbud endres ikke av en ny vareimport."
  ]);

  appendSectionOnce(content, "internal-commerce-scope", "Butikktilbud, Prissøk og sensitive priser", [
    "Butikktilbud/Prissøk kan bare tildeles av systemadministrator til godkjente og aktive brukere i Ringside Rørleggerbedrift AS, Bademiljø Expo og Expo Proffsenter.",
    "Se interne nettopriser er en egen sensitiv rettighet og tildeles separat. Uten denne rettigheten sendes ikke sensitive nettoprisfelt til brukeren."
  ]);
}

function correctOlderRestrictedHelpText() {
  if (!internalCommerceAccessLoaded || !canUseInternalCommerce) return;

  Array.from(document.querySelectorAll("li")).forEach((item) => {
    const text = compactText(item.textContent);
    if (
      text.includes("Vareregisteret er kun tilgjengelig for godkjente brukere med Butikktilbud-tilgang") &&
      text.includes("Expo Proffsenter har ikke katalogtilgang")
    ) {
      item.textContent =
        "Vareregisteret er tilgjengelig for godkjente og aktive brukere med eksplisitt Butikktilbud/Prissøk-tilgang i Ringside Rørleggerbedrift AS, Bademiljø Expo og Expo Proffsenter.";
    }

    if (
      text.startsWith("Vanlige brukere kan bare søke i katalogen") &&
      text.includes("Ringside Rørleggerbedrift AS eller Bademiljø Expo")
    ) {
      item.textContent =
        "Vanlige brukere kan bare søke i katalogen når systemadministrator eksplisitt har gitt Butikktilbud/Prissøk-tilgang og brukeren tilhører Ringside Rørleggerbedrift AS, Bademiljø Expo eller Expo Proffsenter.";
    }

    if (text.startsWith("Expo Proffsenter har ikke katalogtilgang")) {
      item.textContent =
        "Expo Proffsenter kan få Butikktilbud/Prissøk-tilgang på samme måte som de øvrige interne firmaene. Faktisk firmascop og eksplisitt systemadmin-tildeling er sikkerhetsgrensen.";
    }
  });
}

function updateHelpDate() {
  Array.from(document.querySelectorAll("span")).forEach((item) => {
    if (compactText(item.textContent).startsWith("Sist oppdatert:")) {
      item.textContent = HELP_UPDATED_LABEL;
    }
  });
}

function ensureHelp42D() {
  updateHelpDate();
  ensureSalesHelp();
  ensureStoreHelp();
  ensureStartHelp();
  ensureRestrictedSystemAdminHelp();
  correctOlderRestrictedHelpText();
}

function scheduleEnsure() {
  window.requestAnimationFrame(ensureHelp42D);
  window.setTimeout(ensureHelp42D, 80);
  window.setTimeout(ensureHelp42D, 260);
  window.setTimeout(ensureHelp42D, 650);
}

async function refreshInternalCommerceAccess() {
  try {
    canUseInternalCommerce = Boolean(
      await rpcWithStoredSession("current_user_has_internal_store_price_search_access")
    );
  } catch {
    canUseInternalCommerce = false;
  } finally {
    internalCommerceAccessLoaded = true;
    scheduleEnsure();
  }
}

export function installPhase42DHelpUx() {
  if (typeof window === "undefined" || window.__expoPhase42DHelpInstalled) return;
  window.__expoPhase42DHelpInstalled = true;

  document.addEventListener(
    "click",
    (event) => {
      const button = event.target instanceof Element ? event.target.closest("button") : null;
      if (!button) return;
      const text = compactText(button.textContent);
      if (text === "Hjelp" || text === "? Hjelp" || text.includes("Hjelp")) scheduleEnsure();
    },
    true
  );

  void refreshInternalCommerceAccess();
  scheduleEnsure();
}
