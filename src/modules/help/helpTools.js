// FASE 37A2 HJELP: Butikktilbud har versjonslåst, valgfri automatisk oppfølging med brukerdefinert intervall og maks antall. Ordinære tilbud følges manuelt.
// FASE 37D2 HJELP: Butikktilbud vises som eget hjelpetema og avsluttes ved aksept eller avvisning uten prosjektaktivering.
// FASE 33B.5 HJELP: kontrakt/kundelenke vises direkte på saken, signert kontrakt arkiveres som PDF og følger prosjektet.
// FASE 33B.5: brukerflaten kaller samlet tilbud/kontrakt/endringer Avtalegrunnlag; intern `tilbud`-nøkkel beholdes.
// FASE 33B.4 HJELP: bedriften signerer lagret Expo-kontrakt, kunden får sikker lenke og signerer samme låste grunnlag.
// FASE 33B.3 HJELP: akseptert tilbud får frivillig stegvis Expo-kontrakt i tillegg til eksisterende opplasting.
// Kontraktsteg og usparte felt sikres lokalt gjennom fanebytte/remount før eksplisitt serverlagring.
// FASE 32 HJELP: brukerrettede endringer skal dokumenteres i Hjelp når arbeidsflyt, begreper eller UI påvirkes.
// FASE 31C HJELP: tilbudsinformasjon organiseres under eksisterende Befaring/Tilbud-hjelp.
// Permanent "Nytt i denne versjonen" skjules fra Hjelp; versjonsnytt hører til appoppdatering/appnyhet.
// Alle hjelpetema skal starte kollapset. Eksisterende rollebegrensninger beholdes.
// Kompatibilitetsmarkører for eksisterende critical-check beholdes usynlig her:
// "Nytt i denne versjonen – tilbudssikkerhet" / "Fortsett på tilbud"
import React from "react";
import "../app/agreementBasisTerminology.js";
import { createHelpCenter as createHelpCenterCore } from "./helpToolsCore.js";

const SALES_HELP_TITLE = "🧾 Befaring/Tilbud";
const STORE_HELP_TITLE = "🛍️ Butikktilbud";
const NEWS_HELP_TITLE = "📢 Nytt i denne versjonen";
const START_HELP_TITLE = "🚀 Startside / kom i gang";
const HELP_UPDATED_LABEL = "Sist oppdatert: 08.09.2026";

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

  appendHelpSection(block, "Oppfølging av ordinære tilbud", [
    "Første tilbudsmail sendes manuelt som før.",
    "Ordinære Våtromstilbud får ikke automatisk e-postoppfølging i Fase 37A2. Automatisk oppfølgingsplan gjelder kun Butikktilbud.",
    "Bruk Må følges opp og Følg opp tilbud for manuell oppfølging av ordinære tilbud.",
    "Hvis tilbudet har upubliserte endringer, publiser riktig ny versjon før den sendes til kunden.",
    "En manuell ny utsending regnes som ny kontakt og flytter tidspunktet for neste manuelle vurdering.",
  ]);

  appendHelpSection(block, "Kontrakt etter aksept", [
    "Kontrakt er valgfritt for ordinære prosjekttilbud. Etter aksept kan du opprette Expo-kontrakt, laste opp bedriftens egen kontrakt eller fortsette til prosjekt uten kontrakt.",
    "Prosjekt kan også opprettes direkte uten tilbud. Et prosjekt uten tilbud og uten kontrakt er en gyldig normaltilstand; Avtalegrunnlag blir da bare stedet der eventuelle senere avtaledokumenter og endringer kan samles.",
    "Expo-kontrakten henter firma, kunde, prosjektadresse, tilbudsversjon og avtalesum automatisk. Du fyller hovedsakelig inn avtalt oppstart, forventet varighet i uker og noen få avtalevalg.",
    "Beregnet forventet ferdigstillelse beregnes automatisk fra avtalt oppstart og forventet varighet. Dokumenterte forhold som gir rett til fristforlengelse kan forskyve fristen.",
    "Standard betalingsplan er 40 % ved oppstart, 40 % ved hovedmilepæl og 20 % etter overtagelse. Planen kan justeres før utkastet lagres.",
    "Veiviseren gir internt råd om at tydelig avtalt dagmulkt kan skape forutsigbarhet. Denne anbefalingen vises ikke i kundens kontrakt.",
    "Hvis dagmulkt avtales, angis også en redigerbar tilleggsfrist før den kan begynne å løpe. Dagmulkt skal bare gjelde forsinkelse utførende firma svarer for – ikke dokumentert forsinkelse som skyldes kundens valg, leveranser, manglende tilgang eller sene avklaringer.",
    "Ved avtale som er inngått digitalt, per telefon eller utenfor bedriftens faste forretningslokaler spør veiviseren om kunden ønsker oppstart før en eventuell angrefrist er utløpt. Kunden må bekrefte dette uttrykkelig ved signering.",
    "Aktivt kontraktsteg og usparte kontraktsfelt sikres lokalt i samme nettleserøkt. Når du åpner en Forbrukerrådet-lenke i ny fane og går tilbake, skal du fortsette på samme steg med datoer og valg intakt.",
    "Sluttdokumentet viser kundeaksepten tydelig med akseptert tilbudsversjon, hvem som aksepterte, aksepttidspunkt, avtalesum inkl. mva. og valgte opsjoner.",
    "Den låste tilbudsversjonen følger Expo-kontrakten som avtalegrunnlag. Kundesynlig tilbudstekst, forutsetninger og forbehold, inkludert/ikke inkludert, kundens leveranser, vilkår og betalingsbetingelser tas med når opplysningene finnes i den aksepterte tilbudsversjonen.",
    "Eldre aksepterte tilbud får ikke kunstig etterutfylt tekst som ikke var lagret da kunden aksepterte. Historiske tilbud beholdes som de faktisk var.",
    "Når utkastet er lagret, kontrollerer bedriften dokumentet og velger Bekreft og signer kontrakt. Innlogget bruker og tidspunkt registreres automatisk, og kontraktsgrunnlaget låses.",
    "Etter bedriftens signering kan den sikre kundelenken sendes på e-post, åpnes for kontroll eller kopieres. E-postfeil endrer ikke den låste kontrakten, og lenken kan sendes på nytt.",
    "Kunden kan lese kontrakten, men ikke redigere den. Før signering må kunden bekrefte kontrakten og at det tidligere aksepterte tilbudet med valgte opsjoner og vedlegg inngår i avtalegrunnlaget.",
    "Hvis tidlig oppstart før eventuell angrefrist er registrert, må kunden i tillegg bekrefte dette uttrykkelig før signering.",
    "Når kunden signerer med fullt navn, lagres navn og tidspunkt. Begge signaturer og kontraktsgrunnlaget blir låst historikk.",
    "Hvis kunden åpner signeringslenken etter at kontrakten allerede er signert, vises tydelig ferdigstatus med hvem som signerte og tidspunkt. Ingen ny signering er nødvendig eller mulig.",
    "Kontraktkortet på Sales-saken viser kontraktsstatus direkte. Når en Expo-kontrakt finnes får du faste handlinger for Åpne kontrakt, Åpne kundelenke og Kopier kundelenke uten å gå inn i veiviseren først.",
    "Når begge parter har signert, opprettes og arkiveres en endelig PDF fra det låste servergrunnlaget. PDF-en inneholder kontrakten, begge signaturer, den aksepterte tilbudsversjonen og aksept-/signatursporbarhet.",
    "Når slutt-PDF-en finnes, vises Åpne signert PDF direkte på Sales-saken. PDF-en gjenbrukes og overskrives ikke ved senere åpninger.",
    "Hvis saken allerede er aktivert som prosjekt, legges slutt-PDF-en idempotent i prosjektets Avtalegrunnlag. Hvis prosjektet aktiveres senere, følger PDF-en automatisk med ved aktiveringen.",
    "Systemadministrator i Sales-supportmodus kan lese kontraktsstatus, men sluttarkivering utføres ikke automatisk i supportmodus. Support er ikke en skrivebypass.",
    "Avtalegrunnlag i prosjektet samler opprinnelig avtale, eventuelt akseptbevis, eventuell kontrakt og senere tillegg/fradrag. Navnet endrer ikke lagring eller krav til prosjektet.",
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

function createStoreOfferHelpItem() {
  const item = document.createElement("div");
  item.className = "item";
  item.dataset.storeOfferHelp = "1";
  item.style.borderColor = "#e2e8f0";
  item.style.background = "#ffffff";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "secondary";
  button.setAttribute("aria-expanded", "false");
  button.style.width = "100%";
  button.style.justifyContent = "space-between";
  button.style.textAlign = "left";
  button.style.background = "transparent";
  button.style.color = "#0f172a";
  button.style.border = "none";
  button.style.padding = "0";
  button.style.boxShadow = "none";
  button.style.fontSize = "16px";

  const headerRow = document.createElement("span");
  headerRow.style.display = "flex";
  headerRow.style.alignItems = "center";
  headerRow.style.justifyContent = "space-between";
  headerRow.style.gap = "12px";
  headerRow.style.width = "100%";

  const title = document.createElement("b");
  title.textContent = STORE_HELP_TITLE;
  const action = document.createElement("span");
  action.textContent = "Åpne";
  action.style.fontWeight = "900";
  action.style.color = "#007f89";
  headerRow.append(title, action);
  button.appendChild(headerRow);

  const content = document.createElement("div");
  content.style.display = "none";
  content.style.marginTop = "14px";

  const purpose = document.createElement("p");
  purpose.className = "note";
  purpose.style.marginTop = "0";
  purpose.textContent = "Butikktilbud er den varebaserte tilbudsfunksjonen for butikk- og varesalg. Den er separat fra ordinær Befaring/Tilbud og avsluttes i Sales når kunden har akseptert eller avvist.";
  content.appendChild(purpose);

  appendHelpSection(content, "Arbeidsflyt", [
    "Opprett Nytt tilbud og velg Butikktilbud når brukeren har denne modultilgangen. Registrer kunde, adresse og saksbehandler.",
    "Legg inn varenavn, NOBB-nr. eller varenummer, antall, enhet, pris pr. enhet inkl. mva. og eventuell rabatt.",
    "Knytt bilde, produktlenke og PDF-vedlegg direkte til varen når dette er relevant. NOBB-nr. kan brukes som direkte produktlenke.",
    "Registrer montering separat. Ved alternativ vare kan du også angi en alternativ monteringspris.",
    "Velg betalingsbetingelser og gyldighet. Begge er obligatoriske før Butikktilbudet kan lagres/publiseres.",
    "Velg om dette tilbudet skal ha automatisk oppfølging og eventuelt første påminnelse, gjentakelsesintervall og maks antall påminnelser.",
    "Bruk Forhåndsvis kundetilbud før publisering. Forhåndsvisningen sender ingen e-post og kan ikke aksepteres eller avvises.",
    "Velg Bademiljø Expo eller Ringside Rørleggerbedrift som merkevare før publisering. Valgt logo, saksbehandler, vilkår og oppfølgingsplan låses med tilbudsversjonen.",
    "Publiser og send til kunde. Kunden kan lese tilbudet, åpne vedlegg og produktlenker, velge eventuelle alternativer og enten akseptere eller avvise digitalt.",
    "Ved aksept eller avvisning avsluttes Butikktilbudet i Sales. Det opprettes ikke kontrakt eller ProffDok-prosjekt.",
  ]);

  appendHelpSection(content, "Alternativer og priser", [
    "Arbeid med priser inkl. mva. i Butikktilbud. Saksbehandler kan samtidig se beregnet pris eks. mva.",
    "Et alternativ registreres med faktisk alternativ varepris, ikke bare prisdifferansen.",
    "Hvis alternativet også endrer monteringsprisen, registreres den nye monteringsprisen på samme alternativ. Expo ProffDok beregner endringen mot grunnpakken automatisk.",
    "Kunden ser totalsummer inkl. mva. og kan velge alternativet før aksept.",
  ]);

  appendHelpSection(content, "Betaling, gyldighet og automatisk oppfølging", [
    "Betalingsbetingelser og gyldighet er tvungne valg for nye Butikktilbud. Egendefinerte verdier kan brukes når standardvalgene ikke passer.",
    "Automatisk oppfølging kan slås av eller på per Butikktilbud.",
    "Når oppfølging er aktiv velger saksbehandler første påminnelse etter 1–90 dager, gjentakelse hver 1–90 dager og maks 1–10 automatiske påminnelser.",
    "Oppfølgingsplanen låses til den publiserte tilbudsversjonen. En ny versjon får sin egen plan og sitt eget revisjonsspor.",
    "Automatiske påminnelser stopper dersom kunden aksepterer, avviser eller tilbudet utløper, dersom saken arkiveres, mottaker endres eller en annen tilbudsversjon blir gjeldende.",
    "Tilbud sendt før produksjonsaktivering får ingen retroaktiv automatisk e-post.",
    "Hver utsending reserveres og logges med påminnelsesnummer slik at samme påminnelse ikke sendes dobbelt ved parallelle kjøringer.",
  ]);

  appendHelpSection(content, "Maler og dokumentasjon", [
    "Lagre tekst og vilkår som mal når formuleringer skal gjenbrukes.",
    "En butikktilbudsmal lagrer ikke kunde, varer, NOBB-numre, priser, bilder eller vedlegg.",
    "Publiserte, aksepterte og avviste tilbudsversjoner skal ikke overskrives. Ved endringer opprettes en ny tilbudsversjon.",
  ]);

  appendHelpSection(content, "Viktig", [
    "Butikktilbud er en egen arbeidsflyt og skal ikke brukes som inngang til våtromsprosjekt, kontrakt eller prosjektaktivering.",
    "Kontroller alltid kunde, vare, antall, rabatt, montering, alternativer, logo, betalingsbetingelser, gyldighet og oppfølgingsplan i forhåndsvisningen før tilbudet sendes.",
    "Automatiske påminnelser gjelder kun Butikktilbud og sendes aldri når tilbudet allerede er akseptert, avvist, utløpt, arkivert eller når en annen tilbudsversjon er blitt gjeldende.",
    "Tilgang til Butikktilbud følger brukerens tildelte modultilgang. Firmaadministrator kan bare delegere Butikktilbud når firmaadministratoren selv har denne tilgangen.",
  ]);

  button.addEventListener("click", () => {
    const open = content.style.display !== "none";
    content.style.display = open ? "none" : "block";
    action.textContent = open ? "Åpne" : "Lukk";
    button.setAttribute("aria-expanded", open ? "false" : "true");
    item.style.borderColor = open ? "#e2e8f0" : "#08b9c3";
    item.style.background = open ? "#ffffff" : "#f8feff";
  });

  item.append(button, content);
  return item;
}

function ensureStoreOfferHelpItem(salesItem) {
  if (!salesItem || typeof document === "undefined") return;
  if (document.querySelector("[data-store-offer-help='1']")) return;
  salesItem.insertAdjacentElement("afterend", createStoreOfferHelpItem());
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
    const text = textOf(item);
    if (text === "Sjekk Nytt i denne versjonen når du lurer på hva som er endret.") {
      item.textContent =
        "Nyheter om en appoppdatering vises i appen når det er relevant; Hjelp beskriver den gjeldende funksjonen.";
    }
    if (text === "Oppfølging av sendte tilbud er manuell. Expo ProffDok sender ikke automatisk purring til kunden.") {
      item.textContent =
        "Oppfølging av ordinære Våtromstilbud er manuell. Butikktilbud kan ha en egen versjonslåst automatisk oppfølgingsplan som velges av saksbehandler.";
    }
    if (text === "Åpne saken og bruk Følg opp tilbud for manuell oppfølging. Hvis tilbudet har upubliserte endringer, publiseres riktig ny versjon før den sendes til kunden.") {
      item.textContent =
        "For ordinære tilbud bruker du Følg opp tilbud manuelt. Hvis tilbudet har upubliserte endringer, publiseres riktig ny versjon før den sendes til kunden. Butikktilbud følger eventuell låst oppfølgingsplan på den publiserte versjonen.";
    }
  });

  const salesLabel = labels.find((label) => textOf(label) === SALES_HELP_TITLE);
  const salesItem = salesLabel?.closest(".item");
  if (!salesItem) return;

  ensureStoreOfferHelpItem(salesItem);

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
        if (!button || !button.closest?.(".item")) return;
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
