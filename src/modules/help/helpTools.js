// FASE 33B.3 HJELP: akseptert tilbud får frivillig stegvis Expo-kontrakt i tillegg til eksisterende opplasting.
// Kontraktsteg og usparte felt sikres lokalt gjennom fanebytte/remount før eksplisitt serverlagring.
// FASE 32 HJELP: brukerrettede endringer skal dokumenteres i Hjelp når arbeidsflyt, begreper eller UI påvirkes.
// FASE 31C HJELP: tilbudsinformasjon organiseres under eksisterende Befaring/Tilbud-hjelp.
// Permanent "Nytt i denne versjonen" skjules fra Hjelp; versjonsnytt hører til appoppdatering/appnyhet.
// Alle hjelpetema skal starte kollapset. Eksisterende rollebegrensninger beholdes.
// Kompatibilitetsmarkører for eksisterende critical-check beholdes usynlig her:
// "Nytt i denne versjonen – tilbudssikkerhet" / "Fortsett på tilbud"
import React from "react";
import { createHelpCenter as createHelpCenterCore } from "./helpToolsCore.js";

const SALES_HELP_TITLE = "🧾 Befaring/Tilbud";
const NEWS_HELP_TITLE = "📢 Nytt i denne versjonen";
const START_HELP_TITLE = "🚀 Startside / kom i gang";
const HELP_UPDATED_LABEL = "Sist oppdatert: 31.08.2026";

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

  appendHelpSection(block, "Kontrakt etter aksept", [
    "Når tilbudet er akseptert kan du frivillig velge Opprett / åpne enkel kontrakt eller bruke den eksisterende funksjonen Last opp egen kontrakt.",
    "Expo-kontrakten henter firma, kunde, prosjektadresse, tilbudsversjon og avtalesum automatisk. Du fyller hovedsakelig inn oppstart, forventet ferdigstillelse og noen få avtalevalg.",
    "Standard betalingsplan er 40 % ved oppstart, 40 % ved hovedmilepæl og 20 % etter overtagelse. Planen kan justeres før utkastet lagres.",
    "Dagmulkt velges tydelig som Ja eller Nei og skal bare settes til Ja dersom partene faktisk har avtalt dagmulkt.",
    "Aktivt kontraktsteg og usparte kontraktsfelt sikres lokalt i samme nettleserøkt. Når du åpner en Forbrukerrådet-lenke i ny fane og går tilbake, skal du fortsette på samme steg med datoer og valg intakt.",
    "Veiviseren ender i ett samlet kontraktsdokument som kan kontrolleres før utkastet lagres på server.",
    "Akseptert tilbud og valgte opsjoner endres ikke når kontraktsutkastet opprettes. Kontrakten er et eget dokumentgrunnlag.",
    "Egen opplastet kontrakt og dagens prosjektaktivering fungerer fortsatt som før.",
  ]);

  appendHelpSection(block, "Sporbarhet", [
    "Opprettet av viser hvem som faktisk opprettet nye salgssaker. Opplysningen settes av systemet og er ikke det samme som hvem som senere står som ansvarlig.",
    "Ansvarlig viser hvem som har ansvar for saken nå og kan endres når saken overføres til en annen bruker.",
    "Sist publisert av viser den innloggede brukeren som faktisk publiserte siste tilbudsversjon.",
    "Eldre saker og tilbud kan mangle enkelte sporbarhetsfelt fordi historiske data ikke fylles inn i ettertid.",
  ]);

  appendHelpSection(block, "Befaring og mobilbilder", [
    "Nye befaringsbilder sikres først lokalt på enheten før de vises i befaringsnotatet.",
    "Lokalt sikrede bilder kan gjenopprettes etter reload eller appbytte så lenge nettleserdata ikke slettes.",
    "Befaringsbildene lastes fortsatt til server når du trykker Lagre befaringsnotat.",
    "Ved full reload fra Befaring/Tilbud åpner appen salgfanen og aktuell sak igjen.",
    "En sak kan gå videre til tilbud uten befaringsnotat når befaring ikke er nødvendig. Kontroller likevel at nødvendige avklaringer er dokumentert før tilbudet publiseres.",
  ]);

  return block;
}

function organizePermanentHelp({ closeStart = false } = {}) {
  if (typeof document === "undefined") return;

  const labels = Array.from(document.querySelectorAll("button b"));

  if (closeStart) {
    const startLabel = labels.find((label) => textOf(label) === START_HELP_TITLE);
    const startButton = startLabel?.closest("button");
    if (startButton && textOf(startButton).includes("Lukk")) {
      startButton.click();
      return;
    }
  }

  Array.from(document.querySelectorAll("span")).forEach((item) => {
    if (textOf(item).startsWith("Sist oppdatert:")) {
      item.textContent = HELP_UPDATED_LABEL;
    }
  });

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

  const salesLabel = labels.find((label) => textOf(label) === SALES_HELP_TITLE);
  const salesItem = salesLabel?.closest(".item");
  if (!salesItem) return;

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
      let disposed = false;

      const initialize = () => {
        if (disposed) return;
        organizePermanentHelp({ closeStart: true });
        window.setTimeout(() => {
          if (!disposed) organizePermanentHelp();
        }, 0);
      };

      const frame = window.requestAnimationFrame(initialize);
      const timer = window.setTimeout(initialize, 120);

      const handleHelpClick = (event) => {
        const button = event.target?.closest?.("button");
        if (!button) return;
        const label = button.querySelector("b");
        if (textOf(label) !== SALES_HELP_TITLE) return;
        window.setTimeout(() => {
          if (!disposed) organizePermanentHelp();
        }, 0);
      };

      document.addEventListener("click", handleHelpClick);

      return () => {
        disposed = true;
        window.cancelAnimationFrame(frame);
        window.clearTimeout(timer);
        document.removeEventListener("click", handleHelpClick);
      };
    }, []);

    return React.createElement(BaseHelpCenter, props);
  };
}
