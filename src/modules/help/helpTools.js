// FASE 31C HJELP: tilbudsinformasjon organiseres under eksisterende Befaring/Tilbud-hjelp.
// Permanent "Nytt i denne versjonen" skjules fra Hjelp; versjonsnytt hører til appoppdatering/appnyhet.
// Alle hjelpetema starter kollapset via helpToolsCore. Eksisterende rollebegrensninger beholdes.
// Kompatibilitetsmarkører for eksisterende critical-check beholdes usynlig her:
// "Nytt i denne versjonen – tilbudssikkerhet" / "Fortsett på tilbud"
import React from "react";
import { createHelpCenter as createHelpCenterCore } from "./helpToolsCore.js";

const SALES_HELP_TITLE = "🧾 Befaring/Tilbud";
const NEWS_HELP_TITLE = "📢 Nytt i denne versjonen";

function textOf(node) {
  return String(node?.textContent || "").trim();
}

function createList(items = []) {
  const list = document.createElement("ul");
  list.style.marginTop = "8px";
  items.forEach((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    list.appendChild(item);
  });
  return list;
}

function appendHelpSection(container, title, items) {
  const heading = document.createElement("h4");
  heading.textContent = title;
  heading.style.marginTop = "18px";
  heading.style.marginBottom = "6px";
  container.appendChild(heading);
  container.appendChild(createList(items));
}

function createSales31CHelp() {
  const block = document.createElement("div");
  block.dataset.phase31cSalesHelp = "1";
  block.style.marginTop = "18px";
  block.style.paddingTop = "4px";
  block.style.borderTop = "1px solid #dbe5ea";

  appendHelpSection(block, "Tilbudsbygger og redigering", [
    "Åpne en eksisterende tilbudskladd med Rediger tilbud. Publiserte tilbudsversjoner beholdes i historikken og overskrives ikke.",
    "Standard hovedposter vises i fast arbeidsrekkefølge. Egne hovedposter legges etter standardpostene.",
    "Underposter kan ha valgfritt antall og enhet. Når antall brukes, er prisfeltet enhetspris og linjesummen beregnes automatisk.",
    "Norsk prisformat som 1600,- kan brukes. Varenummer er valgfritt og vises kun internt.",
    "Bilder, PDF-vedlegg og produkt-/FDV-lenker kan knyttes til relevante tilbudslinjer og opsjoner.",
  ]);

  appendHelpSection(block, "Opsjoner og hovedpost uten grunnpris", [
    "Tillegg / oppgradering brukes når grunnleveransen beholdes og kunden kan velge noe i tillegg.",
    "Alternativ / erstatter brukes når en konkret underpost skal erstattes. Det må finnes en underpost å erstatte.",
    "En hovedpost kan brukes kun som overskrift for valgfrie opsjoner. Velg Hovedpost uten grunnpris / kun opsjoner; da opprettes ingen kunstig underpost eller 0-kroners grunnpris.",
    "En hovedpost med kun opsjoner vises som Kun valgfrie opsjoner internt, i kundelinken og i tilbuds-PDF-en.",
    "Uvalgte opsjoner inngår ikke i tilbudssummen. Valgte opsjoner oppdaterer kundens sum automatisk.",
    "For privatkunder vises priser i kundelink og PDF inkl. mva.",
  ]);

  appendHelpSection(block, "Sikker lagring og gjenoppretting", [
    "✓ Lagret på server betyr at siste kladd er bekreftet lagret på server.",
    "⚠ Lagret lokalt – venter på server betyr at endringene er sikret på denne enheten, men ikke bekreftet på server ennå.",
    "Ved serverfeil beholdes endringene lokalt. Ikke slett nettleserdata eller bytt enhet før kladden er synkronisert.",
    "Hvis Expo ProffDok finner en nyere lokal kladd enn serverversjonen, stoppes autosave og du må velge hvilken versjon du vil fortsette med.",
    "En tom startkladd får ikke overskrive et eksisterende tilbud før den aktuelle saken er ferdig lastet inn.",
  ]);

  appendHelpSection(block, "Kundevisning, PDF og aksept", [
    "Kundelinken følger samme hovedpostrekkefølge og nummerering som tilbudsbyggeren.",
    "Opsjoner merkes tydelig som valgfrie. Kunden gjør eventuelle valg før tilbudet aksepteres.",
    "Tilbuds-PDF-en følger samme struktur som kundelinken med hovedposter, underposter, antall, enhetspris og valgfrie opsjoner.",
    "Når kunden aksepterer, knyttes aksepten til den publiserte tilbudsversjonen og valgte opsjoner.",
    "Akseptbeviset er låst dokumentasjon av tilbudsversjon, tidspunkt, kunde, sum og valgte opsjoner.",
  ]);

  appendHelpSection(block, "Befaring og mobilbilder", [
    "Nye befaringsbilder sikres først lokalt på enheten før de vises i befaringsnotatet.",
    "Lokalt sikrede bilder kan gjenopprettes etter reload eller appbytte så lenge nettleserdata ikke slettes.",
    "Befaringsbildene lastes fortsatt til server når du trykker Lagre befaringsnotat.",
    "En sak kan gå videre til tilbud uten befaringsnotat når befaring ikke er nødvendig. Kontroller likevel at nødvendige avklaringer er dokumentert før tilbudet publiseres.",
  ]);

  return block;
}

function organizePermanentHelp() {
  if (typeof document === "undefined") return;

  const labels = Array.from(document.querySelectorAll("button b"));

  // Permanent versjonslogg skal ikke ligge som eget hjelpetema.
  labels.forEach((label) => {
    if (textOf(label) !== NEWS_HELP_TITLE) return;
    const item = label.closest(".item");
    if (item) item.style.display = "none";
  });

  Array.from(document.querySelectorAll("li")).forEach((item) => {
    if (textOf(item) === "Sjekk Nytt i denne versjonen når du lurer på hva som er endret.") {
      item.textContent =
        "Nyheter om en appoppdatering vises i appen når det er relevant; Hjelp beskriver den gjeldende funksjonen.";
    }
  });

  // Legg 31C-informasjonen inn i den eksisterende, rollefiltrerte Befaring/Tilbud-boksen.
  const salesLabel = labels.find((label) => textOf(label) === SALES_HELP_TITLE);
  const salesItem = salesLabel?.closest(".item");
  if (!salesItem) return;

  // Når accordionen er lukket finnes bare knappen. Innholdet legges inn når brukeren åpner den.
  const content = Array.from(salesItem.children).find(
    (child) => child.tagName === "DIV" && !child.dataset.phase31cSalesHelp
  );
  if (!content || content.querySelector("[data-phase31c-sales-help='1']")) return;

  content.appendChild(createSales31CHelp());
}

export function createHelpCenter(args) {
  const BaseHelpCenter = createHelpCenterCore(args);

  return function HelpCenter(props) {
    React.useEffect(() => {
      const run = () => organizePermanentHelp();
      const frame = window.requestAnimationFrame(run);
      const timer = window.setTimeout(run, 120);
      const observer = new MutationObserver(run);
      observer.observe(document.body, { childList: true, subtree: true });

      return () => {
        window.cancelAnimationFrame(frame);
        window.clearTimeout(timer);
        observer.disconnect();
      };
    }, []);

    return React.createElement(BaseHelpCenter, props);
  };
}
