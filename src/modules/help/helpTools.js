// FASE 40B HJELP: Butikktilbud har nå komplette firmamaler med avsnitt, poster, montering, opsjoner, gjeldende katalogpris og trygg bevaring av aktuell sak.
// FASE 39B.2 HJELP: Butikktilbud dokumenterer tilbudsposter/avsnitt, internt vareregister, katalogvalg, montering/opsjoner, autosave/recovery, avvisningsvarsel og låst historikk.
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
const SYSTEMADMIN_HELP_TITLE = "⚙️ Systemadministrasjon";
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
  purpose.textContent = "Butikktilbud brukes til butikk-, vare- og mindre service-/leveransetilbud. Leveransen bygges med tilbudsposter og avsnitt, og kan bruke det interne vareregisteret som valgfritt oppslag. Butikktilbud er separat fra ordinær våtromsflyt og avsluttes i Sales når kunden aksepterer eller avviser.";
  content.appendChild(purpose);

  appendHelpSection(content, "Arbeidsflyt", [
    "Opprett Nytt tilbud og velg Butikktilbud når brukeren har denne modultilgangen. Registrer kunde, adresse og saksbehandler.",
    "Bygg tilbudet med Tilbudsposter og avsnitt. Avsnitt kan for eksempel hete Bad 1, Varmepumpe eller Elektriker og brukes som tydelige overskrifter i internvisning, kundelenke og PDF.",
    "Avsnittsnavn og kundetekst er redigerbare. Poster kan også gis en kundevennlig beskrivelse selv om varen opprinnelig ble hentet fra vareregisteret.",
    "Bruk + Legg til post for vanlige vare-/arbeidsposter, + Legg til avsnitt for gruppering og Kun montering når arbeidet ikke skal knyttes til en varepost.",
    "Enter i prisfeltet kan opprette neste post i samme avsnitt. En helt tom ny post beholdes ikke som reell tilbudslinje.",
    "Velg betalingsbetingelser og gyldighet før publisering. Velg også eventuell automatisk oppfølgingsplan.",
    "Bruk Forhåndsvis kundetilbud før publisering. Forhåndsvisningen er skrivebeskyttet og sender ingen e-post.",
    "Velg Bademiljø Expo eller Ringside Rørleggerbedrift som merkevare før publisering. Valgt logo, saksbehandler, vilkår og oppfølgingsplan låses med tilbudsversjonen.",
    "Publiser og send til kunde. Kunden kan lese tilbudet, åpne relevante lenker/vedlegg, velge opsjoner og akseptere eller avvise digitalt.",
    "Når kunden avviser, varsles brukeren som publiserte den aktuelle tilbudsversjonen på e-post. Varslingen er serverstyrt og sendes bare én gang per versjon.",
    "Ved aksept eller avvisning avsluttes Butikktilbudet i Sales. Det opprettes ikke kontrakt eller ProffDok-prosjekt.",
  ]);

  appendHelpSection(content, "Internt vareregister", [
    "Vareregisteret er et valgfritt internt oppslag i en tilbudspost. Du kan fortsatt opprette helt manuelle poster for servicearbeid, elektriker, maler, avfall, rigg og andre leveranser.",
    "Søk på leverandør, varenummer, GTIN/EAN eller varetekst og klikk på ønsket treff for å fylle posten med kundeegnet produktinformasjon og gjeldende salgspris.",
    "Når flere leverandører har samme normaliserte GTIN/EAN kan leverandøralternativer vises. Samme varenummer alene brukes ikke som sikker kobling mellom leverandører.",
    "Innkjøps-/nettopris er kun intern kataloginformasjon og skal aldri vises i kundelenke, tilbuds-PDF, publisert tilbud eller akseptbevis.",
    "Vareregisteret er kun tilgjengelig for godkjente brukere med Butikktilbud-tilgang i Ringside Rørleggerbedrift AS eller Bademiljø Expo. Expo Proffsenter har ikke katalogtilgang.",
  ]);

  appendHelpSection(content, "Montering og opsjoner", [
    "Montering kan knyttes direkte til en konkret post. Antall/timer og pris pr. enhet beregner monteringssummen automatisk.",
    "En opsjon kan være tillegg/oppgradering eller alternativ/erstatter for en konkret post.",
    "For en alternativ vare velger du om eksisterende montering beholdes, om alternativet skal ha egen monteringsmengde/pris eller om alternativet ikke skal ha montering.",
    "Kunden ser totalsummer inkl. mva. og kan velge relevante opsjoner før aksept. Uvalgte opsjoner inngår ikke i tilbudssummen.",
  ]);

  appendHelpSection(content, "Autosave og gjenoppretting", [
    "Butikktilbud lagres fortløpende som kladd. Tilbake fra redigering lagrer kladden og går tilbake uten den gamle lagre-/valideringsdialogen.",
    "En tom lokal startkladd får ikke overstyre et eksisterende servertilbud med innhold. Serverdata brukes ved recovery når lokal kladd åpenbart er tom/stale.",
    "Ved vanlig inngang til Befaring/Tilbud åpnes sakslisten. En full reload mens du står inne i en sak kan gjenåpne samme sak.",
    "Publiserte, aksepterte og avviste tilbudsversjoner er låst historikk og overskrives ikke av senere kladdendringer.",
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
    "Komplette Butikktilbud-maler er firmadelte. Bruk Bruk firmamal øverst i tilbudet når du vil hente inn en mal, og Lagre som mal nederst sammen med Forhåndsvis kundetilbud og Lagre butikktilbud når et ferdig oppsett skal gjenbrukes.",
    "En komplett mal kan gjenbruke tilbudstittel og kundetekster, betalingsbetingelser og gyldighet, avsnitt og rekkefølge, tilbudsposter, knyttet montering, opsjoner og alternativer som erstatter konkrete poster.",
    "Katalogvarer beholder katalogkoblingen, men ikke gammel katalogpris. Når malen brukes hentes gjeldende aktiv kundepris på nytt fra vareregisteret. Manuelle poster uten katalogkobling beholder prisen som ble lagret i malen.",
    "Hvis en katalogvare ikke lenger finnes aktivt, brukes ikke den gamle prisen som fallback. Posten må velges eller prissettes på nytt, og brukeren får en tydelig advarsel.",
    "Kunde, adresse, saksbehandler/signatur, valgt merkevare/avsender og automatisk oppfølgingsplan beholdes fra den aktuelle saken og kopieres ikke fra malen. Bilder og PDF-/andre vedlegg lagres heller ikke i malen.",
    "Eldre Butikktilbud-tekstmaler støttes fortsatt. De endrer bare tekst/vilkår og skal ikke slette eksisterende poster eller priser i kladden.",
    "Når en komplett mal brukes på en kladd som allerede har strukturert innhold, må brukeren bekrefte at avsnitt, poster, montering og opsjoner skal erstattes. Etterpå vises tydelig beskjed om at malen er brukt og hvor mange katalogpriser som ble hentet på nytt.",
    "Publiserte, aksepterte og avviste tilbudsversjoner skal ikke overskrives. Ved endringer opprettes en ny tilbudsversjon.",
    "Avsnitt vises som overskrifter uten linjenummer og uten 0-kroners pris i internvisning, kundelenke, tilbuds-PDF og akseptbevis.",
  ]);

  appendHelpSection(content, "Viktig", [
    "Butikktilbud er en egen arbeidsflyt og skal ikke brukes som inngang til våtromsprosjekt, kontrakt eller prosjektaktivering.",
    "Kontroller alltid kunde, avsnitt/poster, varevalg, montering, opsjoner, logo, betalingsbetingelser, gyldighet og oppfølgingsplan i forhåndsvisningen før tilbudet sendes.",
    "Når en firmamal er brukt, kontroller spesielt katalogvarer som er prisoppdatert og eventuelle katalogvarer som ikke lenger finnes aktivt før tilbudet lagres eller publiseres.",
    "Automatiske påminnelser gjelder kun Butikktilbud og sendes aldri når tilbudet allerede er akseptert, avvist, utløpt, arkivert eller når en annen tilbudsversjon er blitt gjeldende.",
    "En e-postfeil ved avvisningsvarsling endrer ikke kundens allerede registrerte avvisning.",
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

function ensureSystemAdminCatalogHelp(labels) {
  const systemLabel = labels.find((label) => textOf(label) === SYSTEMADMIN_HELP_TITLE);
  const systemItem = systemLabel?.closest(".item");
  if (!systemItem || systemItem.querySelector("[data-phase39b2-catalog-help='1']")) return;

  const content = Array.from(systemItem.children).find((child) => child.tagName === "DIV");
  if (!content) return;

  const block = document.createElement("div");
  block.dataset.phase39b2CatalogHelp = "1";
  block.style.marginTop = "18px";
  block.style.paddingTop = "4px";
  block.style.borderTop = "1px solid #dbe5ea";

  appendHelpSection(block, "Internt vareregister – ERP", [
    "Internt vareregister vedlikeholdes fra Systemadministrasjon. Kun systemadministrator kan starte eller aktivere en ERP-prisoppdatering.",
    "Last opp den faste ERP TXT-eksporten. Importen validerer 18 semikolonseparerte felt i Windows-1252 og hopper over varer uten varenummer eller med ikke-positive netto-/salgspriser.",
    "Katalogen oppdateres i kontrollerte batcher. Søk i vareregisteret låses mens importen pågår, og åpnes igjen når aktiveringen er ferdig.",
    "Kontroller antall leste, gyldige, hoppede og aktive varer etter import før oppdateringen regnes som ferdig.",
    "Prisfilen inneholder intern innkjøpsinformasjon og skal aldri legges i GitHub eller deles med kunder.",
  ]);

  appendHelpSection(block, "Tilgang og sikkerhet", [
    "Vanlige brukere kan bare søke i katalogen når de både har Butikktilbud-modultilgang og tilhører Ringside Rørleggerbedrift AS eller Bademiljø Expo.",
    "Expo Proffsenter har ikke katalogtilgang selv om juridisk organisasjonsnummer kan være felles. Faktisk firmascop er sikkerhetsgrensen.",
    "Direkte klientskriving til katalogtabellene er sperret. RLS/RPC er den reelle sikkerhetsgrensen.",
    "Intern netto innkjøpspris skal ikke kopieres til Sales-kladd, publisert tilbud, PDF, kundelenke eller akseptbevis.",
    "En prisoppdatering endrer aldri historiske publiserte eller aksepterte tilbud. Nye katalogpriser brukes først når en vare velges på nytt i en redigerbar kladd.",
  ]);

  content.appendChild(block);
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

  ensureSystemAdminCatalogHelp(labels);

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
