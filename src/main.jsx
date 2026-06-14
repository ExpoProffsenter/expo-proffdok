// Generated complete main.jsx from the latest live source.
// FASE 13.15 PREMIUM RAPPORT UI-ONLY: Løfter PDF-rapporten med premium forside, prosjektfakta, innholdsfortegnelse, tydeligere vedlegg, dokumentnummer og dokumentasjonsstatus. Kun rapport/PDF-visning, ingen database-/RLS-/garanti-/låsing-/lagringsendringer.
// FASE 13.15.3 RAPPORTPOLERING: Retter forvridd forsidebilde med cover-crop, fjerner symbolfeil i sjekklistene, korter bildetekst på sjekkpunktbilder og hindrer løs seksjonstittel nederst på side. Kun PDF/rapportvisning.
// FASE 13.15.2 HOTFIX: Gjør drawNoteBox tilgjengelig globalt i PDF-generatoren og fjerner smal scoped helper. Retter drawNoteBox not defined. Kun PDF/rapportvisning.
// FASE 13.15.1 HOTFIX: Retter PDF-feil drawNoteBox not defined i dokumentasjonsstatus slik at klikkbare PDF-lenker genereres som før. Kun PDF/rapportvisning.
// FASE 13.14 VEDLEGG-METADATA: Legger til fag/rolle, dokumenttype og kommentar på opplastede sjekklister/vedlegg fra andre fag, og viser dette i rapport/PDF. Kun metadata/UI for vedlegg, ingen database-/RLS-/garanti-/låsing-/lagringsendringer.
// FASE 13.13 HOTFIX: Gjeninnfører dra-og-slipp for Opplastede sjekklister/vedlegg fra andre fag. Kun UI/opplastingshendelser, ingen database-/RLS-/garanti-/låsing-/lagringsendringer.
// FASE 13.12 VEDLEGG-HOTFIX: PDF-/dokumentvedlegg i Sjekklister får robust åpne-lenke fra url/path, manglende lenke merkes tydelig, og PDF kan ikke lenger lastes opp som sjekkpunktbilde. Ingen database-/RLS-/garanti-/låsing-/lagringsendringer.
// FASE 13.11 HOTFIX: Retter kun popup-telling ved Oppdater prosjektliste for systemadmin. Vanlig prosjektliste viser firmascopet antall, mens Systemadmin supportmodus beholder alle prosjekter. Ingen database-/RLS-/garanti-/låsing-/lagringsendringer.
// FASE 13.10 HOTFIX PROSJEKTLISTE/SYSTEMADMIN: Vanlig Prosjektliste viser kun egne/eget firmas prosjekter også for systemadmin, mens Systemadmin > Supportmodus beholder full oversikt over alle firma/prosjekter. Ingen database-/RLS-/garanti-/låsing-/lagringsendringer.
// FASE 13.9 HOTFIX PROSJEKTLISTE: Prosjektlisten bruker nå fersk profil ved innlogging, slik at firmaadmin/systemadmin ikke faller tilbake til for smalt prosjektgrunnlag ved fanebytte/refresh. Ingen database-/RLS-/garanti-/låsing-/lagringsendringer.
// FASE 13.8 PROSJEKTLISTE RESET: Nullstiller prosjektlistesøk, statusfilter og ulestfilter ved innlogging/utlogging og når supportmodus avsluttes. Kun frontend-state, ingen database-/RLS-/garanti-/låsing-/lagringsendringer.
// FASE 13.7 SUPPORTMODUS: Supportmodus aktiveres kun eksplisitt fra Systemadmin supportvisning. Vanlig åpning fra Prosjektliste skal aldri automatisk gi supportmodus. Ingen database-/RLS-/garanti-/låsing-/lagringsendringer.
// FASE 13.6 TILGANGS-EPOSTER: Sender med kunde, adresse, postnr/sted, kundeepost og kundetelefon til smart-worker slik at kundelink/UE-link/ferdigmelding viser tydelig prosjektinfo. Ingen database-/RLS-/garanti-/låsing-/lagringsendringer.
// FASE 13.5 PROSJEKTLISTE/SYSTEMADMIN SØK: Felles bredt prosjektsøk med normalisering, eier/firma-felt og samme søketreff i Systemadmin supportmodus. Kun frontend-søk/visning, ingen database-/RLS-/garanti-/låsing-/autolagringsendringer.
// FASE 13.4 PROSJEKTLISTE SØK: Utvider prosjektlistesøk til garantinummer, e-post, telefon, adresse, kunde, ansvarlig, firma, produkter, overflater og innredning. Kun frontend-søk/tekst, ingen database-/RLS-/garanti-/låsing-/autolagringsendringer.
// FASE 13.3 UNDERENTREPRENØR UX: Tydelige klikkbare accordion-rader i Overflater og innredning + hjelpetekst. Kun visuell/tekstlig endring, ingen database-/RLS-/garanti-/låsing-/autolagringsendringer.
// FASE 13.2 MOBILFLYT: Flytter Overtagelse etter Interne notater, legger fast mobil-chatknapp og tydeliggjør klikkbare accordion-rader. Ingen database-/RLS-/garanti-/låsing-/autolagringsendringer.
// FASE 12.5 SYSTEMADMIN BRUKERVILKÅRSTATUS: Systemadmin matcher godkjente brukervilkår på både user_id og e-post. Ingen database-/rolle-/prosjektendringer.
// FASE 12.4 SYSTEMADMIN SUPPORTVISNING: Tydelig supportmodus-banner, firma-/prosjektinfo og trygg Avslutt supportmodus uten databaseendringer.
// FASE 12.2 RAPPORTDESIGN: Rydder tegnsett i PDF-vedlegg og forbedrer produktkort i rapport/PDF. Kun rapportvisning, ingen endring i garanti/låsing/autolagring/database.
// FASE 12.3 RAPPORTDESIGN OVERFLATER: Gir Overflater og innredning samme kort-/seksjonslayout som produkter og sjekklister. Kun rapport/PDF-visning, ingen logikk-/databaseendring.
// FASE 12.1 RAPPORTSTABILISERING: Rydder PDF/rapportvisning av vedlegg, dokumentfiler, sjekkpunktbilder, fag/utstyr-bilder, telefonfelt og QR uten å endre garanti/låsing/autolagring/database.
// FASE 11D.9 RAPPORTSTABILISERING: Kun PDF/rapportvisning – bilder, vedlegg, telefonfelt, QR og forside. Ingen endring i lagring/garanti/logikk.
// FASE 11D.8.6 NØD-HOTFIX: Reverterer ustabil registry-sjekk, beholder WC/FDV, og stopper lokal kladd-popup helt.
// FASE 11D.8.4 HOTFIX: WC splittet i veggskål/sisterne/trykknapp med egen FDV og produktsertifikat + smart lokal kladd.
// FASE 11D.8.2 HOTFIX: WC splittet i veggskål, sisterne og trykknapp med egne leverandørfelt uten SQL-endringer.
// FASE 11D.8 RAPPORT-HOTFIX: Permanente vedlegg i PDF, bedre bildefallback/klikkbare filer og større rapporttekst.
// FASE 11D.7.8 HOTFIX: Garanti kan utstedes før komplett PDF er generert, slik at PDF-en inkluderer garantibeviset.
// FASE 11D.7.7 STABILISERING: Overtagelse leses fra signaturer, Vis det som gjenstår hopper riktig, og garantipunkter krever status + bilde eller kommentar.
// FASE 11D.7.4 HOTFIX: Garantipunkter krever status + bilde eller kommentar, og stopper auto-hopp uten dokumentasjon.
// FASE 11D.7.2: Fikser Åpne-knapp til manglende sjekkpunkt og gir garantiprosjekt veiledning etter overtagelse.
// FASE 11D.7: Dra-og-slipp på bilder direkte under sjekkpunkter, med tydelig dropzone og bildestatus.
// FASE 11D.6: Beholder aktiv fane i løpende økt, men starter rent ved faktisk innlogging/utlogging.
// FASE 11D.5: Flere egne produkter under alle grupper i Overflater og innredning.
// FASE 11D.4: Trygg bildeopplasting, stabil input/accordion og bildemerknad om sjekkpunktbilder.
// FASE 11D.3: Ryddigere visning av ventende firmainvitasjoner under Firma-fanen.
// FASE 11D.2: Brukervilkår i Hjelp, egen akseptstatus og systemadmin-oversikt.
// FASE 11D.1: Obligatoriske brukervilkår/personvern ved første innlogging, med versjonsstyrt aksept.
// FASE 11C.8: Ren startside ved innlogging/utlogging. Systemadmin starter ikke i gammel support-/adminvisning.
// FASE 11C.7: Supportmodus viser prosjekter direkte under valgt firma (accordion).
// FASE 11C.6: Systemadmin brukersøk, statusfilter og firmafilter for skalerbar brukeradministrasjon.
// FASE 11C.4: Smart Produktmaster-synk oppdaterer aktive prosjekter, men låste/arkiverte prosjekter røres ikke.
// FASE 11C.1: Kollapsbare Systemadmin-seksjoner for mindre scrolling, spesielt Produktmaster.
// FASE 11C/11D + 11B.4: Fjerner forvirrende lokal kladd-dialog for systemadmin og forkaster kladd ved Avbryt.
// FASE 11C/11D + 11B.3: Trygg lokal kladd for systemadmin, Support Dashboard og e-postinvitasjon.
// FASE 11B.2: Systemadmin kan administrere firma, firmarolle og systemadmin-status på brukere.
// FASE 11B.1: Tydelig bekreftelse/varsel ved firmaadmin-endringer av brukerroller og status.
// FASE 11B Deploy 1: Supportmodus for systemadmin med firmasøk, prosjektsøk og hurtigåpning av prosjekter.
// FASE 11A.3: Firmaadmin får robust tilgang til alle prosjekter i eget firma, med RLS-støtte og tydeligere firmaadministrasjon.
// FASE 11A.2: Firma-fane for firmaadmin med invitasjon, brukeradministrasjon og firmaprosjektvisning.
// FASE 11A.1: Systemadmin-rolle styrer Admin/Systemadmin, Produktmaster og brukergodkjenning.
// FASE 10 Deploy 1.18: Forbedret prosjekteringsfane med tydelig opplastingsinfo og kategoriserte egne punkter.
// FASE 10 Deploy 1.17: Fikset kollaps i ordinær Produkter-visning.
// FASE 10 Deploy 1.16: Sammenleggbare produktkategorier og låst produktvisning viser kun brukte produkter.
// FASE 10 Deploy 1.15: Veiledning for å legge appen på hjemskjerm på innlogging og Hjelp.
// FASE 10 Deploy 1.14: Robust autolagring med lokal nødlagring og debouncet skylagring.
// FASE 10 Deploy 1.13: Låste prosjekter sperrer lokale produkt- og bildeendringer med tydelig beskjed.
// FASE 10 Deploy 1.12: Sammenleggbar Nytt produkt i Admin Produktmaster.
// FASE 10 Deploy 1.11: Søkefelt i Admin Produktmaster for rask filtrering av produkter.
// FASE 10 Deploy 1.10: Produktmaster styrer fargevalg for fug og silikon; Sopro-lister brukes kun som fallback.
// FASE 10 Deploy 1.8: Sopro-baserte fargekoder for fug og silikon + PDF viser produktdokumenter med innhold som standard.
// FASE 10 Deploy 1.7: Produktdokumenter med innhold vises som standard i PDF + fargevalg for fug og silikon.
// FASE 10 Deploy 1.5: Ren startvisning når ingen prosjekt er valgt; prosjektdata vises først etter valgt/opprettet prosjekt.
// FASE 10 Deploy 1.4: Skjuler Forrige/Neste før prosjekt er valgt eller nytt prosjekt er startet.
// FASE 10 Deploy 1.3: Skjuler lagre/kopi/PDF-knapper før prosjekt er åpnet eller nytt prosjekt er startet.
// FASE 10 Deploy 1.2: Mobil sjekkliste åpner første uferdige punkt + fjernet teknisk hjelpetekst.
// FASE 10 Deploy 1.1: Mobil åpningsside + forbedret mobilscroll ved fanebytte.
 // FASE 10 Deploy 1.0: Fjernet synlig utvikler-/backendtekst fra brukerflater og feilmeldinger.
// FASE 9 Deploy 2.7: Deaktiverte brukere holdes utenfor Nye brukere + reaktiveringsknapp i Admin.
// FASE 9 Deploy 2.6: Admin-veiledning under Hjelp vises kun for admin-brukere.
// FASE 9 Deploy 2.5: Alle garantipunkter krever bilde og kommentar + fikset avhuking for Sopro garantikontrollpunkt ved nytt produkt.
// FASE 9 Deploy 2.4: Sopro garantikontrollpunkter fra Produktmaster kobles inn i aktive garantisjekklister.
// FASE 9 Deploy 2.3: Produktmaster-kontrollpunkter presisert og begrenset til Sopro garantikontrollpunkter.
// FASE 9 Deploy 2.3A: Admin-fanen er kun for ekte admin + tydeliggjort at kontrollpunkt-tall gjelder Produktmaster-punkter.
// FASE 9 Deploy 2.2: Produktmaster kontrollpunkter skjules bak vis/rediger-knapp + kan opprettes samtidig med nytt produkt.
// FASE 9 Deploy 2.1: Admin Produktmaster kan hente, vise, opprette og slette produktbaserte kontrollpunkter uten å påvirke sjekklister/garanti.
// FASE 9 Deploy 2.0: Tydelig grønn hake i rapportstatus + appikon/manifest for mobil-hjemskjerm.
// FASE 9 Deploy 1.9: Premium kontrollprotokoll i rapport/PDF med kompakte sjekkpunkter og bildedokumentasjon under sjekkpunkt.
// FASE 9 Deploy 1.8: Nøytral garantiheading før aktivering, fortsatt valgbar 10/12/15 år.
// FASE 9 Deploy 1.7: Valgbar garantiperiode 10/12/15 år og skjult intern Produktmaster-notat.
// FASE 9 Deploy 1.6: Låste prosjekter fryses som arkiv og mottar ikke nye dokumentlenker/produktmaster-synk.
// FASE 9 Deploy 1.5: Justert Produktmaster-checkbox og mer luft i produktkort i rapport/PDF.
// FASE 9 Deploy 1.4: Produktmaster kan opprette nye produkter for Produkter-fanen + Sopro tekstpresisering mansjetter/tettebånd.
// FASE 9 Deploy 1.3: Endret dokumentert tetthetsgaranti fra 12 til 15 år og samlet garantiperiode i konstant.
// FASE 8 Deploy 5.1: Mobilforbedring for sjekklister + autolagring av bildedokumentasjon ved opplasting.
// FASE 8 Deploy 5: Autolagring av sjekklister, garantibadge i prosjektliste og løftet garantisertifikat.
// FASE 8 Deploy 4.1: Kundeportal viser ordinære sjekklister og garantipunkter separat uten dobbelttelling.
// FASE 8 Deploy 4: Automatisk kundeutsendelse ved ferdigstillelse/låsing + manuell sendeknapp.
 // FASE 8 Deploy 3.1: Fikset sjekklistestatus i kundeportal – teller alle dokumenterte kontrollpunkter.
// FASE 8 Deploy 3.2: Sjekkliste/statuslogikk korrigert i kundeportal og prosjektoversikt.
// FASE 8 Deploy 3: Kundeportal Dashboard – startside for kundeportal med tydelig prosjektstatus, garanti, dokumentasjonsoversikt og hurtighandlinger.
// FASE 8 Deploy 2: Kundeportal 2.0 – profesjonell kundevisning med oversikt, dokumentasjon, bilder, produkter, garanti og rapport.
// FASE 8 Deploy 1.1: Garantivilkår bekreftes i Overtagelse + rettet garantisertifikat-layout.
// FASE 8 Deploy 1: Brukerveiledning i app + garantivilkår 15 år med PDF, kvittering/signering og garantikrav.
// FASE 7 Deploy 6: Rapportdesign Premium Final – profesjonelle sjekkpunkter, signaturfelt, garantibadge, større QR og dokumentbrikker.
// FASE 7 Deploy 5B: Rapportdesign Premium 2.0 – kompakte produktkort, bedre bildegaleri, skjult tom prosjekttilgang og beholdt funksjonalitet.
// FASE 7 Deploy 5C: Produkt/FDV i kompakte dokumentbrikker uten tekstbryting i PDF.
// FASE 7 Deploy 5: Rapportdesign Premium – bilder uten filnavn, profesjonelle sjekkpunkter, overtagelsesboks og logo på garantibevis.
// FASE 7 Deploy 2D: Garanti som prosjektoppsett, fane flyttet og ekstra deduplisering av garantipunkter.
// FASE 7 Deploy 3C: Avvikshistorikk i rapport/PDF med original avvikstekst og lukkekommentar.
// FASE 7 Deploy 4C: Bedre luft/sideskift i PDF-sjekklister og korrigert QR-lenke til SINTEF.
// FASE 7 Deploy 4D: Prosjektinfo i profesjonelle bokser og valgfri produktdokumentasjon i PDF.
// FASE 7 Deploy 4F: Rapportdesign 2.0 med forside, bedre sideskift og bildegalleri.
// FASE 7 Deploy 4H: Garantidokument synlig i arkiverte/låste prosjekter.
// FASE 7 Deploy 4I: Tillater utstedelse av garanti i låst/arkivert prosjekt og lagrer garantidokument permanent.
// FASE 7 Deploy 4J: PDF-fremdrift/statusindikator og tydeligere garantiutstedt-handling.
// FASE 7 Deploy 4G: PDF-bildefiks for SVG/BMP/ukjente bildeformater ved PDF-generering.
// FASE 7 Deploy 4E: Autolagring av sjekklistestatus og automatisk hopp til neste sjekkpunkt.
// FASE 7 Deploy 4D: Profesjonell prosjektinfo i PDF og rapportvalg for produktdokumentasjon.
// FASE 7 Deploy 4C: Rapportluft, bedre sideskift og korrigerte SINTEF QR-lenker.
// FASE 7 Deploy 4B: Profesjonell rapportvisning med fremhevede sjekkpunkter og rapportsammendrag.
// FASE 7 Deploy 3D: Randomisert garantinummer og registrering i garantiregister.
// FASE 7 Deploy 3B: Mobiljustering av sjekklister, bilder og statusknapper uten logikkendringer.
// FASE 7 Deploy 3: Profesjonelt garantibevis i PDF, arkiveringsvarsel og krav om nedlastet sluttrapport.
// FASE 7 Deploy 2F: Garantipunkter flettet inn i riktig sjekklisteflyt, uten doble sjekkpunkter.
// FASE 7 Deploy 2E: Redusert overlapp mellom generelle punkter og Sopro garantipunkter.
// FASE 7 Deploy 2D: Garanti som prosjektoppsett og flyttet garanti-fane.
// FASE 7 Deploy 2C: Tydelig merking av Sopro garantipunkter og egen garantifremdrift.
// FASE 7 Deploy 2: Dynamiske Sopro-sjekklister koblet til garantimotor.
// FASE 7 Deploy 1: Garantimodul og datamodell for 15 års dokumentert tetthetsgaranti.
// FASE 5 v2: klikkbar bildevisning i stor modal.
// FASE 5 v1: prosjektinformasjon/beskrivelse + synlig prosjektinfo i delingslenker.
// Admin: old FDV-register UI removed; Produktmaster is now the active admin document register.
import React, * as ReactNS from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { Camera, FileText, Plus, Trash2, Download, Building2, ClipboardCheck, BadgeCheck } from 'lucide-react';
import './style.css';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

const import_react = { default: React, ...ReactNS };
const import_client = { createRoot };
const import_supabase_js = { createClient };
const import_lucide_react = { Camera, FileText, Plus, Trash2, Download, Building2, ClipboardCheck, BadgeCheck };
const import_jsx_runtime = { jsx, jsxs, Fragment };
  var supabase = (0, import_supabase_js.createClient)(
    "https://dqffxflaoyarbxyiyhop.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZmZ4Zmxhb3lhcmJ4eWl5aG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NzcxNTEsImV4cCI6MjA5MzA1MzE1MX0.5fkVNPooHGlayw4NgYM3fUVrAiv0XbUyTixkfeToMSE"
  );
  var uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
  var EXPO_PROFFDOK_APP_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <defs>
      <linearGradient id="g" x1="56" y1="56" x2="456" y2="456" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#08d5d8"/>
        <stop offset="1" stop-color="#0c2a52"/>
      </linearGradient>
    </defs>
    <rect x="24" y="24" width="464" height="464" rx="112" fill="url(#g)"/>
    <rect x="54" y="54" width="404" height="404" rx="92" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="10"/>
    <text x="256" y="224" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="86" font-weight="900" fill="#fff">EXPO</text>
    <text x="256" y="310" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="82" font-weight="900" fill="#fff">PD</text>
    <path d="M174 354l44 44 120-132" fill="none" stroke="#fff" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
  var expoProffDokIconDataUrl = () => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(EXPO_PROFFDOK_APP_ICON_SVG)}`;
  var ensureExpoProffDokHeadTag = (selector, createNode, patchNode) => {
    if (typeof document === "undefined") return null;
    let node = document.head.querySelector(selector);
    if (!node) {
      node = createNode();
      document.head.appendChild(node);
    }
    if (patchNode) patchNode(node);
    return node;
  };
  var ensureExpoProffDokAppBranding = () => {
    if (typeof document === "undefined") return;
    const title = "Expo ProffDok";
    const iconUrl = expoProffDokIconDataUrl();
    document.title = title;
    ensureExpoProffDokHeadTag('meta[name="application-name"]', () => {
      const meta = document.createElement("meta");
      meta.setAttribute("name", "application-name");
      return meta;
    }, (meta) => meta.setAttribute("content", title));
    ensureExpoProffDokHeadTag('meta[name="apple-mobile-web-app-title"]', () => {
      const meta = document.createElement("meta");
      meta.setAttribute("name", "apple-mobile-web-app-title");
      return meta;
    }, (meta) => meta.setAttribute("content", title));
    ensureExpoProffDokHeadTag('meta[name="apple-mobile-web-app-capable"]', () => {
      const meta = document.createElement("meta");
      meta.setAttribute("name", "apple-mobile-web-app-capable");
      return meta;
    }, (meta) => meta.setAttribute("content", "yes"));
    ensureExpoProffDokHeadTag('meta[name="mobile-web-app-capable"]', () => {
      const meta = document.createElement("meta");
      meta.setAttribute("name", "mobile-web-app-capable");
      return meta;
    }, (meta) => meta.setAttribute("content", "yes"));
    ensureExpoProffDokHeadTag('meta[name="theme-color"]', () => {
      const meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      return meta;
    }, (meta) => meta.setAttribute("content", "#08d5d8"));
    ensureExpoProffDokHeadTag('link[rel="icon"][data-expo-proffdok="true"]', () => {
      const link = document.createElement("link");
      link.setAttribute("rel", "icon");
      link.setAttribute("type", "image/svg+xml");
      link.setAttribute("data-expo-proffdok", "true");
      return link;
    }, (link) => link.setAttribute("href", iconUrl));
    ensureExpoProffDokHeadTag('link[rel="apple-touch-icon"][data-expo-proffdok="true"]', () => {
      const link = document.createElement("link");
      link.setAttribute("rel", "apple-touch-icon");
      link.setAttribute("sizes", "512x512");
      link.setAttribute("data-expo-proffdok", "true");
      return link;
    }, (link) => link.setAttribute("href", iconUrl));
    try {
      const manifest = {
        name: "Expo ProffDok",
        short_name: "ProffDok",
        description: "Prosjektdokumentasjon og FDV for våtrom",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#08d5d8",
        icons: [
          { src: iconUrl, sizes: "512x512", type: "image/svg+xml", purpose: "any maskable" }
        ]
      };
      const manifestUrl = URL.createObjectURL(new Blob([JSON.stringify(manifest)], { type: "application/manifest+json" }));
      ensureExpoProffDokHeadTag('link[rel="manifest"][data-expo-proffdok="true"]', () => {
        const link = document.createElement("link");
        link.setAttribute("rel", "manifest");
        link.setAttribute("data-expo-proffdok", "true");
        return link;
      }, (link) => {
        const previous = link.getAttribute("href");
        if (previous && previous.startsWith("blob:")) URL.revokeObjectURL(previous);
        link.setAttribute("href", manifestUrl);
      });
    } catch (error) {
      console.warn("Kunne ikke sette appmanifest:", error);
    }
  };
  var WARRANTY_YEAR_OPTIONS = [10, 12, 15];
  var WARRANTY_YEARS = 15;
  var getWarrantyYears = (warrantyConfig = {}) => {
    const years = Number(warrantyConfig?.durationYears || warrantyConfig?.warrantyYears || WARRANTY_YEARS);
    return WARRANTY_YEAR_OPTIONS.includes(years) ? years : WARRANTY_YEARS;
  };
  var warrantyYearLabel = (warrantyConfig = {}) => `${getWarrantyYears(warrantyConfig)} år`;
  var warrantyTitle = (warrantyConfig = {}) => `${getWarrantyYears(warrantyConfig)} års dokumentert tetthetsgaranti`;
  var productSections = [
    { title: "Avretting / st\xF8peprodukter", items: ["Sopro VS582 Avretting", "Sopro 3.50 Avretting", "Sopro HF-S 563 Avretting", "Sopro FS 5\xAE Avretting", "Sopro RDS 960 - Ekspansjonsb\xE5nd", "Sopro Classic EM Hurtigst\xF8p", "Sopro RAM 3\xAE reparasjon og st\xF8pem\xF8rtel", "Sopro RS 462 reparasjonsm\xF8rtel", "Sopro Rapidur M5\xAE hurtigst\xF8p"] },
    { title: "Underlag / Plater", items: ["Kryssfiner / v\xE5tromsfiner", "Tetti Finerpanel 15mm", "Tetti Finerpanel 18mm", "Tetti V\xE5tromsplate 6mm", "Tetti V\xE5tromsplate 10mm", "Tetti V\xE5tromsplate 12mm", "Tetti V\xE5tromsplate 20mm", "Tetti V\xE5tromsplate 30mm", "Tetti V\xE5tromsplate 50mm", "Tetti Hj\xF8rnekasse", "Tetti Veggnisje", "Tetti kasse for vegghengt toalett", "Tetti monteringslim", "Soudal Fix All HT", "Soudal Fix All Turbo"] },
    { title: "Primer / forsterkningsduk", items: ["Sopro PG-X 1188", "Sopro EPG 1522 - 2 Komponent Epoxy primer", "Sopro HPS 673 - spesial primer ikke sugende", "Sopro GD 749 - primer sugende underlag", "Sopro SG 874 Dampsperre-Primer"] },
    { title: "Membransystem / tetting", items: ["Sopro FDK 1-K 1180 membranlim", "Sopro FDF 527 sm\xF8remembran lys gr\xE5", "Sopro DSF 623 RS - 1K sementbasert membran", "AEB 815 Tetteduk", "Sopro BBM 134 Slukmansjett", "Sopro FDB 524 selvklebende tetteb\xE5nd", "Sopro AEB 816 Tetteb\xE5nd", "Sopro AEB 821 Hj\xF8rnemansjett innerhj\xF8rne", "Sopro AEB 822 Hj\xF8rnemansjett ytterhj\xF8rne", "Sopro AEB 825 R\xF8rmansjett \xD810-24mm", "Sopro AEB 826 R\xF8rmansjett \xD832-55mm", "Sopro AEB 827 R\xF8rmansjett \xD875-110mm", "Sopro AEB 828 R\xF8rmansjett \xD8110-140mm"] },
    { title: "Limprodukter / festeprodukter", items: ["Sopro\u2019s No.1 400 Flislim", "Sopro\u2019s No.1 403 Silver Hurtig flislim", "Sopro FKM XL 444 St\xF8vredusert flislim", "Sopro FKM 5555 Hurtig flislim", "Sopro FF 450 - Sigefri flislim"] },
    { title: "Fugemasse / silikon", items: ["Sopro DFH Bruksklar fugemasse", "Sopro DFX epoxyfug", "Sopro DF 10\xAE Designfug", "Sopro FL plus Fugemasse", "Sopro Sanit\xE6r Silikon", "Sopro Ceramic Silikon", "Sopro NSM Neutralsilikon Matt"] }
  ];
  var productCategoryOptions = productSections.map((section) => section.title);
  var emptyNewProductMaster = () => ({
    product_no: "",
    product_name: "",
    product_family: "",
    category: "Fugemasse / silikon",
    color_code: "",
    fdv_url: "",
    datablad_url: "",
    dop_url: "",
    epd_url: "",
    sikkerhetsdatablad_url: "",
    document_file_url: "",
    comment: "",
    showInProducts: true,
    createCheckpoint: false,
    checkpoint_text: "",
    checkpoint_type: "garanti",
    image_required: true,
    comment_required: true,
    guarantee_system: "all",
    sort_order: 0
  });
  var productCheckpointTypeOptions = ["standard", "garanti"];
  var productCheckpointTypeLabels = { standard: "Ordinært kontrollpunkt", garanti: "Garantikontrollpunkt" };
  var productCheckpointSystemOptions = ["all", "sopro-aeb-815", "sopro-fdf-525-527"];
  var productCheckpointSystemLabels = { all: "Alle systemer", "sopro-aeb-815": "Sopro AEB 815", "sopro-fdf-525-527": "Sopro FDF 525/527" };
  var isSoproGuaranteeProductMasterRow = (row = {}) => {
    const text = [
      row.product_no,
      row.product_name,
      row.product_family,
      row.category,
      row.app_match_name,
      row.comment
    ].filter(Boolean).join(" ").toLowerCase();
    return /sopro|\baeb\b|\bfdf\b|\bfdk\b|\bfdb\b|\bbbm\b|\bdsf\b|pg-x|hps|gd 749|sg 874|nsm|dfh|dfx|df 10|fl plus|sanit[æae]r silikon|ceramic silikon|tetteb[åa]nd|r[øo]rmansjett|slukmansjett|hj[øo]rnemansjett|membran/.test(text);
  };
  var emptyNewProductCheckpoint = (productNo = "") => ({
    product_no: productNo,
    checkpoint_text: "",
    checkpoint_type: "garanti",
    image_required: true,
    comment_required: true,
    guarantee_system: "all",
    sort_order: 0
  });
  var formatProductMasterComment = (row = {}) => {
    const parts = [];
    if (hasValue(row.color_code)) parts.push(`Fargekode: ${row.color_code}`);
    if (hasValue(row.comment)) parts.push(row.comment);
    return parts.join("\n");
  };
  var productDisplayNameFromMaster = (row = {}) => String(row.app_match_name || row.product_name || "").trim();
  var soproDf10ColorOptions = [
    "10 Hvit",
    "14 Betonggrå",
    "15 Grå",
    "16 Lysegrå",
    "17 Sølvgrå",
    "18 Sandgrå",
    "22 Steingrå",
    "27 Pergamon",
    "28 Jasmine",
    "29 Lys beige",
    "32 Beige",
    "33 Jurabeige",
    "34 Bahamabeige",
    "38 Karamell",
    "40 Sahara",
    "50 Kastanje",
    "52 Brun",
    "55 Mahogni",
    "59 Balibrun",
    "62 Ibenholt",
    "64 Basalt",
    "66 Antrasitt",
    "77 Manhattan",
    "90 Sort",
    "91 Signalrød",
    "92 Vinrød",
    "98 Dypblå",
    "Annen fargekode – skriv i kommentar"
  ];
  var soproFlPlusColorOptions = [
    "10 Hvit",
    "14 Betonggrå",
    "15 Grå",
    "16 Lysegrå",
    "17 Sølvgrå",
    "18 Sandgrå",
    "22 Steingrå",
    "28 Jasmine",
    "29 Lys beige",
    "33 Jurabeige",
    "34 Bahamabeige",
    "52 Brun",
    "59 Balibrun",
    "64 Basalt",
    "66 Antrasitt",
    "90 Sort",
    "Annen fargekode – skriv i kommentar"
  ];
  var soproDfxColorOptions = [
    "10 Hvit",
    "14 Betonggrå",
    "15 Grå",
    "16 Lys grå",
    "17 Sølv grå",
    "18 Sand grå",
    "22 Stein grå",
    "27 Pergament",
    "29 Lys beige",
    "32 Beige",
    "33 Jura beige",
    "40 Sahara",
    "52 Brun",
    "59 Bali brun",
    "64 Basalt",
    "66 Antrasitt",
    "77 Manhattan",
    "86 Aqua",
    "90 Svart",
    "99 Gjennomsiktig",
    "Annen fargekode – skriv i kommentar"
  ];
  var soproSanitarySiliconeColorOptions = [
    "00 Transparent",
    "10 Hvit",
    "14 Betonggrå",
    "15 Grå",
    "16 Lysegrå",
    "17 Sølvgrå",
    "18 Sandgrå",
    "22 Steingrå",
    "27 Pergament",
    "28 Jasmine",
    "29 Lys beige",
    "32 Beige",
    "33 Jurabeige",
    "34 Bahamabeige",
    "38 Karamell",
    "40 Sahara",
    "50 Kastanje",
    "52 Brun",
    "55 Mahogni",
    "59 Balibrun",
    "62 Ibenholt",
    "64 Basalt",
    "66 Antrasitt",
    "77 Manhattan",
    "86 Aqua",
    "90 Sort",
    "91 Signalrød",
    "92 Vinrød",
    "96 Dypsort",
    "98 Dypblå",
    "Annen fargekode – skriv i kommentar"
  ];
  var soproMatteSiliconeColorOptions = [
    "14 Betonggrå",
    "15 Grå",
    "17 Sølvgrå",
    "18 Sandgrå",
    "22 Steingrå",
    "26 Matt hvit",
    "29 Lysebeige",
    "32 Beige",
    "66 Antrasitt",
    "Annen fargekode – skriv i kommentar"
  ];
  var soproColorCodeFallbackOptions = [
    ...soproSanitarySiliconeColorOptions
  ];
  var productSupportsColorChoice = (productName = "", sectionName = "") => {
    const text = `${productName} ${sectionName}`.toLowerCase();
    return /fug|silikon|silicon|df\s*10|dfx|dfh|fl\s*plus|nsm|ceramic|keramik|marmor|sanit[æae]r|ssi|ksi|msi/.test(text);
  };
  var normalizeColorCodeLabel = (value = "") => String(value || "").trim().replace(/\s+/g, " ");
  var splitColorCodeOptions = (value = "") => String(value || "")
    .split(/[;\n|,]+/)
    .map((entry) => normalizeColorCodeLabel(entry))
    .filter(Boolean);
  var normalizeColorSortKey = (value = "") => {
    const clean = normalizeColorCodeLabel(value);
    const codeMatch = clean.match(/^(\d{2,3})\b/) || clean.match(/(\d{2,3})\s*$/);
    return codeMatch ? Number(codeMatch[1]) : 9999;
  };
  var uniqueColorOptions = (values = []) => {
    const seen = new Set();
    const result = [];
    (values || []).forEach((value) => {
      const clean = normalizeColorCodeLabel(value);
      const key = clean.toLowerCase();
      if (!clean || seen.has(key)) return;
      seen.add(key);
      result.push(clean);
    });
    return result;
  };
  var buildProductSectionsWithMaster = (baseSections = [], masterRows = []) => {
    const sections = (baseSections || []).map((section) => ({ ...section, items: [...section.items || []] }));
    const ensureSection = (title = "Andre produkter") => {
      const cleanTitle = String(title || "Andre produkter").trim() || "Andre produkter";
      let section = sections.find((entry) => entry.title === cleanTitle);
      if (!section) {
        section = { title: cleanTitle, items: [] };
        sections.push(section);
      }
      return section;
    };
    (masterRows || []).filter((row) => row?.active !== false && (row?.used_in_app_standard_list || hasValue(row?.app_match_name))).forEach((row) => {
      const productName = productDisplayNameFromMaster(row);
      if (!productName) return;
      const section = ensureSection(row.category || row.product_family || "Andre produkter");
      if (!section.items.includes(productName)) section.items.push(productName);
    });
    return sections;
  };
  var surfaces = ["Veggflis 1", "Veggflis 2", "Veggflis 3", "Gulvflis 1", "Gulvflis 2", "Gulvflis 3", "Mosaikkfliser vegg", "Mosaikkfliser gulv", "Dekorfliser"];
  var bathroomEquipmentSections = [
    { title: "Overflater", items: [
      { key: "takoverflate", label: "Takoverflate" },
      { key: "veggpanelPlater", label: "Veggpanel / plater" },
      { key: "overflateAnnet", label: "Annet overflateprodukt" }
    ] },
    { title: "Baderomsinnredning", items: [
      { key: "servantskap", label: "Servantskap" },
      { key: "hoyskap", label: "Høyskap" },
      { key: "speil", label: "Speil" },
      { key: "speilskap", label: "Speilskap" },
      { key: "benkeplate", label: "Benkeplate" },
      { key: "sittebenk", label: "Sittebenk" },
      { key: "innredningAnnet", label: "Annet" }
    ] },
    { title: "Sanitærutstyr", items: [
      { key: "servant", label: "Servant" },
      { key: "utslagsvask", label: "Utslagsvask" },
      { key: "dusjvegg", label: "Dusjvegg" },
      { key: "dusjdor", label: "Dusjdør" },
      { key: "badekar", label: "Badekar" },
      { key: "slukrist", label: "Slukrist" },
      { key: "sanitaerAnnet", label: "Annet" }
    ] },
    { title: "Armaturer", items: [
      { key: "servantarmatur", label: "Servantarmatur" },
      { key: "dusjbatteri", label: "Dusjbatteri" },
      { key: "takdusj", label: "Takdusj" },
      { key: "handdusj", label: "Hånddusj" },
      { key: "badekarbatteri", label: "Badekarbatteri" },
      { key: "armaturTilbehor", label: "Tilbehør" },
      { key: "armaturAnnet", label: "Annet" }
    ] },
    { title: "Elektriske komponenter", items: [
      { key: "varmekabler", label: "Varmekabler" },
      { key: "termostat", label: "Termostat" },
      { key: "ventilasjonsvifte", label: "Ventilasjonsvifte" },
      { key: "downlights", label: "Downlights" },
      { key: "speillys", label: "Speillys" },
      { key: "stikkontakter", label: "Stikkontakter" },
      { key: "dimmer", label: "Dimmer" },
      { key: "elektroAnnet", label: "Annet" }
    ] },
    { title: "Annet", items: [
      { key: "annetProdukt1", label: "Annet produkt / løsning" },
      { key: "annetProdukt2", label: "Annet produkt / løsning 2" },
      { key: "annetProdukt3", label: "Annet produkt / løsning 3" }
    ] }
  ];
  var emptyBathroomEquipment = () => ({});
  var equipmentValue = (equipment = {}, key = "", field = "") => equipment?.[`${key}_${field}`] || "";
  var equipmentHasGenericContent = (equipment = {}, key = "") => ["product", "supplier", "fdvUrl", "certificateUrl", "comment"].some((field) => hasValue(equipmentValue(equipment, key, field)));
  var equipmentSectionStorageKey = (title = "") => `custom_${String(title || "annet").toLowerCase().replace(/[åä]/g, "a").replace(/[øö]/g, "o").replace(/[æ]/g, "ae").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")}`;
  var equipmentCustomItemsForSection = (equipment = {}, title = "") => {
    const value = equipment?.[equipmentSectionStorageKey(title)];
    return Array.isArray(value) ? value : [];
  };
  var equipmentCustomItemHasContent = (item = {}) => ["product", "supplier", "fdvUrl", "certificateUrl", "comment"].some((field) => hasValue(item?.[field]));
  var wcHasContent = (equipment = {}) => ["wcType", "wcProduct", "wcSupplier", "wcProductFdvUrl", "wcProductCertificateUrl", "wcCistern", "wcCisternSupplier", "wcCisternFdvUrl", "wcCisternCertificateUrl", "wcFlushPlate", "wcFlushPlateSupplier", "wcFlushPlateFdvUrl", "wcFlushPlateCertificateUrl", "wcFdvUrl", "wcCertificateUrl", "wcComment"].some((field) => hasValue(equipment?.[field]));
  var buildBathroomEquipmentReportGroups = (surf = {}, bathroomEquipment = {}) => {
    const groups = [];
    const pushGroup = (title) => {
      let group = groups.find((entry) => entry.title === title);
      if (!group) {
        group = { title, items: [] };
        groups.push(group);
      }
      return group;
    };
    const surfaceRows = Object.entries(surf || {}).filter(([, value]) => hasValue(value));
    const surfaceExtras = (bathroomEquipmentSections.find((section) => section.title === "Overflater")?.items || []).filter((item) => equipmentHasGenericContent(bathroomEquipment, item.key));
    const surfaceCustomExtras = equipmentCustomItemsForSection(bathroomEquipment, "Overflater").filter(equipmentCustomItemHasContent);
    if (surfaceRows.length || surfaceExtras.length || surfaceCustomExtras.length) {
      const group = pushGroup("Overflater");
      surfaceRows.forEach(([label, value]) => group.items.push({ title: label, entries: [["Produkt / beskrivelse", value]], links: [] }));
      surfaceExtras.forEach((item) => {
        const entries = [
          ["Produkt / beskrivelse", equipmentValue(bathroomEquipment, item.key, "product")],
          ["Leverandør", equipmentValue(bathroomEquipment, item.key, "supplier")],
          ["Kommentar", equipmentValue(bathroomEquipment, item.key, "comment")]
        ].filter(([, value]) => hasValue(value));
        const links = [
          { label: "FDV", url: equipmentValue(bathroomEquipment, item.key, "fdvUrl") },
          { label: "Produktsertifikat", url: equipmentValue(bathroomEquipment, item.key, "certificateUrl") }
        ].filter((link) => hasValue(link.url));
        group.items.push({ title: item.label, entries, links });
      });
      surfaceCustomExtras.forEach((customItem, index) => {
        const entries = [
          ["Produkt / beskrivelse", customItem.product],
          ["Leverandør", customItem.supplier],
          ["Kommentar", customItem.comment]
        ].filter(([, value]) => hasValue(value));
        const links = [
          { label: "FDV", url: customItem.fdvUrl },
          { label: "Produktsertifikat", url: customItem.certificateUrl }
        ].filter((link) => hasValue(link.url));
        group.items.push({ title: customItem.title || `Eget produkt ${index + 1}`, entries, links });
      });
    }
    if (wcHasContent(bathroomEquipment)) {
      const type = bathroomEquipment.wcType || "";
      const group = pushGroup("Sanitærutstyr");
      if (type) {
        group.items.push({ title: "WC / toalett", entries: [["Type WC", type]], links: [] });
      }
      const wcProductLinks = [
        { label: "FDV", url: bathroomEquipment.wcProductFdvUrl || bathroomEquipment.wcFdvUrl },
        { label: "Produktsertifikat", url: bathroomEquipment.wcProductCertificateUrl || bathroomEquipment.wcCertificateUrl }
      ].filter((link) => hasValue(link.url));
      if (hasValue(bathroomEquipment.wcProduct) || hasValue(bathroomEquipment.wcSupplier) || wcProductLinks.length) {
        group.items.push({
          title: type === "Vegghengt" ? "WC – veggskål" : "WC-produkt",
          entries: [
            ["Produkt / modell", bathroomEquipment.wcProduct],
            ["Leverandør", bathroomEquipment.wcSupplier]
          ].filter(([, value]) => hasValue(value)),
          links: wcProductLinks
        });
      }
      if (type === "Vegghengt") {
        const cisternLinks = [
          { label: "FDV", url: bathroomEquipment.wcCisternFdvUrl },
          { label: "Produktsertifikat", url: bathroomEquipment.wcCisternCertificateUrl }
        ].filter((link) => hasValue(link.url));
        if (hasValue(bathroomEquipment.wcCistern) || hasValue(bathroomEquipment.wcCisternSupplier) || cisternLinks.length) {
          group.items.push({
            title: "WC – sisterne",
            entries: [
              ["Sisternemodell", bathroomEquipment.wcCistern],
              ["Leverandør", bathroomEquipment.wcCisternSupplier]
            ].filter(([, value]) => hasValue(value)),
            links: cisternLinks
          });
        }
        const flushPlateLinks = [
          { label: "FDV", url: bathroomEquipment.wcFlushPlateFdvUrl },
          { label: "Produktsertifikat", url: bathroomEquipment.wcFlushPlateCertificateUrl }
        ].filter((link) => hasValue(link.url));
        if (hasValue(bathroomEquipment.wcFlushPlate) || hasValue(bathroomEquipment.wcFlushPlateSupplier) || flushPlateLinks.length) {
          group.items.push({
            title: "WC – trykknapp",
            entries: [
              ["Trykknappmodell", bathroomEquipment.wcFlushPlate],
              ["Leverandør", bathroomEquipment.wcFlushPlateSupplier]
            ].filter(([, value]) => hasValue(value)),
            links: flushPlateLinks
          });
        }
      }
      if (hasValue(bathroomEquipment.wcComment)) {
        group.items.push({ title: "WC – kommentar", entries: [["Kommentar", bathroomEquipment.wcComment]], links: [] });
      }
    }
    bathroomEquipmentSections.filter((section) => section.title !== "Overflater").forEach((section) => {
      const group = pushGroup(section.title);
      section.items.filter((item) => equipmentHasGenericContent(bathroomEquipment, item.key)).forEach((item) => {
        const entries = [
          ["Produkt / beskrivelse", equipmentValue(bathroomEquipment, item.key, "product")],
          ["Leverandør", equipmentValue(bathroomEquipment, item.key, "supplier")],
          ["Kommentar", equipmentValue(bathroomEquipment, item.key, "comment")]
        ].filter(([, value]) => hasValue(value));
        const links = [
          { label: "FDV", url: equipmentValue(bathroomEquipment, item.key, "fdvUrl") },
          { label: "Produktsertifikat", url: equipmentValue(bathroomEquipment, item.key, "certificateUrl") }
        ].filter((link) => hasValue(link.url));
        group.items.push({ title: item.label, entries, links });
      });
      equipmentCustomItemsForSection(bathroomEquipment, section.title).filter(equipmentCustomItemHasContent).forEach((customItem, index) => {
        const entries = [
          ["Produkt / beskrivelse", customItem.product],
          ["Leverandør", customItem.supplier],
          ["Kommentar", customItem.comment]
        ].filter(([, value]) => hasValue(value));
        const links = [
          { label: "FDV", url: customItem.fdvUrl },
          { label: "Produktsertifikat", url: customItem.certificateUrl }
        ].filter((link) => hasValue(link.url));
        group.items.push({ title: customItem.title || `Eget produkt ${index + 1}`, entries, links });
      });
    });
    return groups.filter((group) => group.items.length > 0);
  };
  var imageCats = ["F\xF8r arbeid", "Underlag", "Avretting/st\xF8p", "Primer", "Membran", "Sluk og mansjetter", "R\xF8rgjennomf\xF8ringer", "Flislegging", "Fuging/silikon", "Ferdig resultat"];
  var roles = ["Eier / administrator", "Ansatt", "Underleverand\xF8r", "Kun lesetilgang"];
  var checklistAttachmentTradeOptions = ["Rørlegger", "Elektriker", "Tømrer", "Murer/flislegger", "Maler", "Ventilasjon", "Annet fag", "Uspesifisert"];
  var checklistAttachmentDocumentTypeOptions = ["Sjekkliste", "Samsvarserklæring", "Kontrollerklæring", "FDV", "Sluttdokumentasjon", "Bilde-/fotodokumentasjon", "Annet dokument", "Uspesifisert"];
  var checklistAttachmentMetaLine = (file = {}) => [
    file.trade || file.fag || file.role || "Ikke angitt fag",
    file.documentType || file.docType || file.typeLabel || "Ikke angitt dokumenttype",
    file.description || file.comment || ""
  ].filter(hasValue).join(" · ");
  var installCats = ["R\xF8rlegger", "T\xF8mrer/Snekker", "Maler", "Andre"];
  var projectDescriptionTemplates = [
    {
      label: "Våtrom / bad",
      text: "Prosjektet gjelder rehabilitering/oppbygging av våtrom. Arbeidet dokumenteres med prosjektinformasjon, produkter, bildedokumentasjon, sjekklister og FDV-rapport. Utførende og eventuelle underentreprenører skal følge gjeldende krav, produktanvisninger og avtalt arbeidsomfang."
    },
    {
      label: "Flisarbeid",
      text: "Prosjektet omfatter flisarbeid med tilhørende underlag, primer, membran/tetting, flislim, fug og silikon der dette er aktuelt. Valgte produkter og kontrollpunkter dokumenteres fortløpende i Expo ProffDok."
    },
    {
      label: "Underentreprenør-info",
      text: "Underentreprenør skal legge inn relevant dokumentasjon for eget arbeid, inkludert produkter/utstyr, bilder, sjekklistepunkter og eventuelle kommentarer eller avvik. Endringer eller forhold som kan påvirke fremdrift, kvalitet eller sluttresultat skal meldes til prosjektansvarlig."
    },
    {
      label: "Kundeinfo",
      text: "Kunde kan følge prosjektet via kundelenke med tilgang til prosjektinformasjon, rapport/PDF, tilbud/kontrakt og chat. Spørsmål, avklaringer og eventuelle kommentarer kan sendes direkte i prosjektchatten."
    },
    {
      label: "Avvik / merknad",
      text: "Eventuelle avvik eller merknader dokumenteres med beskrivelse, bilde der det er relevant, og videre tiltak/avklaring. Avvik lukkes ikke før nødvendige tiltak er utført eller avklart med prosjektansvarlig/kunde."
    }
  ];
  var accessRoleInfo = [
    { role: "Eier / administrator", text: "Full tilgang til prosjekt, rapport, firmaprofil, prosjektliste, deling og brukergodkjenning." },
    { role: "Ansatt", text: "Kan normalt opprette, endre og dokumentere prosjekter for firmaet." },
    { role: "Underleverand\xF8r", text: "Anbefales for fag som skal bidra med dokumentasjon, bilder, sjekklister eller utstyr p\xE5 prosjektet." },
    { role: "Kun lesetilgang", text: "Kunde/byggherre f\xE5r egen kundelink med rapport, tilbud/kontrakt og chat." }
  ];
  var checklistTemplate = [
    {
      category: "Tildekning/forarbeid",
      items: [
        "Underlag kontrollert",
        "Fall kontrollert",
        "Sluk korrekt montert",
        "Terskel og h\xF8yder kontrollert"
      ]
    },
    {
      category: "Avretting / underlag",
      items: [
        "Det er avrettet p\xE5 tregulv/spon eller betong",
        "Alle sprekker og krakeleringer er fjernet",
        "Overflatestyrken er kontrollert med risspr\xF8ve",
        "Vedheft mellom r\xE5betong og pusslag er kontrollert med bankepr\xF8ve",
        "Underlaget er fritt for olje, fett, st\xF8v, skitt, m\xF8rtelrester, l\xF8s betong og lignende",
        "Trekk i rommet er kontrollert",
        "Gulvvarme er sl\xE5tt av",
        "Restfukt/RF er kontrollert iht. krav f\xF8r videre belegning/membran"
      ]
    },
    {
      category: "Primer / underlag",
      items: [
        "Riktig primer valgt",
        "Primer p\xE5f\xF8rt",
        "T\xF8rketid fulgt"
      ]
    },
    {
      category: "Membran / tetting",
      items: [
        "Membranl\xF8sning kontrollert",
        "Tetteb\xE5nd montert",
        "Slukmansjett montert",
        "R\xF8rmansjetter montert",
        "Trykktesting av membran",
        "Minimum 5 cm overlapp p\xE5 skj\xF8ter med tetningsduk/tetteb\xE5nd er kontrollert",
        "Riktig membrantykkelse p\xE5 vegger og gulv iht. Sopro anvisninger og myndighetskrav er kontrollert"
      ]
    },
    {
      category: "Flislegging / flislim",
      items: [
        "Fliser montert iht. plan",
        "Limdekning mellom fliser og underlag er kontrollert",
        "Stikkpr\xF8ve/slakting av flis er utf\xF8rt mens flislim fortsatt er v\xE5tt"
      ]
    },
    {
      category: "Fuging / silikon",
      items: [
        "Fugemasse er blandet/r\xF8rt opp med korrekt vanntilsetning iht. datablad",
        "Fugene er helt fylt opp f\xF8r rengj\xF8ring",
        "Fugene er jevne, glatte, ensartet og uten hull og sprekker etter rengj\xF8ring",
        "Fugesl\xF8r er vasket av med svamp og rent vann",
        "Silikon utf\xF8rt"
      ]
    },
    {
      category: "Sluttkontroll",
      items: [
        "Visuell kontroll utf\xF8rt",
        "Bilder tatt",
        "Dokumentasjon komplett"
      ]
    }
  ];
  var emptyTilbud = () => ({
    enabled: false,
    files: [],
    tillegg: "",
    fradrag: "",
    kommentar: ""
  });
  var emptyOvertagelse = () => ({
    enabled: false,
    dato: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    kommentar: "",
    signUtf\u00F8rende: "",
    signKunde: "",
    signUtf\u00F8rendeImage: "",
    signKundeImage: ""
  });
  var soproWarrantySystems = [
    { id: "sopro-aeb-815", label: "Sopro AEB 815 – SINTEF TG 20918", product: "Sopro AEB 815", sintefApproval: "SINTEF TG 20918", sintefUrl: "https://www.sintefcertification.no/Product/Index/11729" },
    { id: "sopro-fdf-525-527", label: "Sopro FDF 525/527 – SINTEF TG 20987", product: "Sopro FDF 525/527", sintefApproval: "SINTEF TG 20987", sintefUrl: "https://www.sintefcertification.no/Product/Index/12275" }
  ];
  var warrantyArchiveNotice = "Viktig: Last alltid ned og lagre komplett PDF-rapport på egen maskin, server eller annet sikkert arkiv når prosjektet er ferdig. Expo ProffDok er en dokumentasjonsplattform, men kan ikke garantere ubegrenset lagringstid eller tilgjengelighet av prosjektdata i hele garanti- eller byggets levetid.";
  var userGuidePdfPath = "/Expo_ProffDok_Brukerveiledning.pdf";
  var adminGuidePdfPath = "/Expo_ProffDok_Adminveiledning.pdf";
  var warrantyTermsPdfFileName = "Expo_ProffDok_Garantivilkar.pdf";
  var warrantyTermsText = [
    `Denne garantien dokumenterer at våtrommet er utført med et godkjent Sopro membransystem og at arbeidet er dokumentert gjennom Expo ProffDok. Garantien gjelder tettheten i det dokumenterte membransystemet i ${WARRANTY_YEARS} år fra dato for signert overtakelse, forutsatt at arbeidene er utført i henhold til gjeldende krav, produsentens anvisninger og prosjektets dokumenterte sjekklister.`,
    "Garantien gjelder for den aktuelle boligen og følger eiendommen ved et eventuelt eierskifte innen garantiperioden. Ny eier overtar de samme rettigheter og forpliktelser som opprinnelig eier.",
    "Garantien utstedes av det utførende firmaet som er angitt i garantibeviset. Expo ProffDok fungerer som dokumentasjonsplattform og arkiv for prosjektets dokumentasjon, men er ikke part i garantiforholdet.",
    "Garantien forutsetter at prosjektet er dokumentert i Expo ProffDok, at nødvendige sjekklister er gjennomført, at bildedokumentasjon er registrert, at overtakelse er signert, at godkjent Sopro-system er benyttet og at senere arbeider ikke har skadet membransystemet.",
    "Garantien omfatter dokumenterte feil i membransystemets tetthet når disse skyldes utførelse eller installasjon av det dokumenterte systemet. Garantien gjelder de områdene som omfattes av prosjektets dokumentasjon.",
    "Garantien omfatter ikke mekanisk skade, hulltaking eller inngrep etter overtakelse, manglende vedlikehold, setningsskader i bygget, frostskader, brann- eller vannskader fra andre kilder, naturhendelser eller arbeider utført av andre etter overtakelse.",
    "Forhold som kan omfattes av garantien skal meldes til garantigiver uten ugrunnet opphold etter at forholdet er oppdaget. Reklamasjonen bør inneholde en beskrivelse av forholdet, bilder og relevant dokumentasjon.",
    "Garantibeviset er kun gyldig sammen med prosjektets komplette dokumentasjon, inkludert bilder, sjekklister, produktdokumentasjon og signert overtakelse. Det anbefales at boligeier oppbevarer rapporten som en del av boligens FDV-dokumentasjon."
  ];
  var EXPO_PROFFDOK_TERMS_VERSION = "1.0";
  var EXPO_PROFFDOK_TERMS_TITLE = `Brukervilkår og personvern – versjon ${EXPO_PROFFDOK_TERMS_VERSION}`;
  var expoProffDokTermsSections = [
    {
      title: "1. Bruk av tjenesten",
      text: "Expo ProffDok er et skybasert dokumentasjons- og kvalitetssystem for prosjekter, bilder, sjekklister, FDV, produktdokumentasjon, overtagelse, garanti og kommunikasjon. Tjenesten skal brukes på en forsvarlig og lovlig måte."
    },
    {
      title: "2. Brukerens ansvar",
      text: "Brukeren er ansvarlig for at opplysninger, bilder, dokumenter og personopplysninger som registreres i systemet er korrekte, relevante og lovlige å lagre og dele. Brukeren er også ansvarlig for tilgang som gis til kunder, ansatte og underleverandører."
    },
    {
      title: "3. Prosjektdokumentasjon og lokal lagring",
      text: "Brukeren må selv laste ned og lagre ferdige rapporter, FDV-dokumentasjon, garantibevis og øvrige prosjektdokumenter på egen PC, server eller annet sikkert arkiv. Expo ProffDok er et arbeids- og dokumentasjonsverktøy, men erstatter ikke brukerens eget arkivansvar."
    },
    {
      title: "4. Ingen garanti for permanent lagring",
      text: "Expo ProffDok arbeider for stabil drift og sikker lagring, men gir ingen garanti for ubegrenset eller permanent oppbevaring av prosjektdata, bilder, rapporter eller dokumenter. Data kan gå tapt som følge av tekniske feil, feil bruk, tredjepartsleverandører, endringer i tjenesten eller forhold utenfor vår kontroll."
    },
    {
      title: "5. Personvern og GDPR",
      text: "Tjenesten behandler personopplysninger som navn, e-postadresse, telefonnummer, firmaopplysninger, prosjektinformasjon, bilder og kommunikasjon i den grad dette er nødvendig for å levere tjenesten. Brukeren er ansvarlig for at personopplysninger som legges inn har lovlig behandlingsgrunnlag, og at kunder, ansatte og andre berørte er informert der dette er nødvendig."
    },
    {
      title: "6. Sikkerhet og tilgang",
      text: "Brukeren skal holde innloggingsinformasjon konfidensiell og sørge for at kun personer med tjenstlig behov får tilgang til prosjekter. Delingslenker og kundeportaltilganger skal brukes med forsiktighet."
    },
    {
      title: "7. Garanti og ansvar",
      text: "Eventuelle garantibevis som genereres i Expo ProffDok er dokumentasjon av arbeid og valgt garantiløsning. Selve garantiforpliktelsen ligger hos den utførende virksomheten som utsteder garantien, ikke hos Expo ProffDok som teknisk plattform."
    },
    {
      title: "8. Tjenestens tilgjengelighet",
      text: "Tjenesten leveres slik den til enhver tid foreligger. Det kan forekomme nedetid, vedlikehold, feilretting, endringer eller avvikling av funksjoner."
    },
    {
      title: "9. Aksept av vilkår",
      text: "Ved å godkjenne vilkårene bekrefter brukeren å ha lest og forstått brukervilkår og personvernpunkter, inkludert plikten til å laste ned og lagre egne rapporter og dokumenter lokalt."
    }
  ];
  var randomWarrantyCode = (length = 6) => {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const values = new Uint32Array(length);
    if (window?.crypto?.getRandomValues) {
      window.crypto.getRandomValues(values);
    } else {
      for (let i = 0; i < length; i += 1) values[i] = Math.floor(Math.random() * 1e9);
    }
    return Array.from(values).map((value) => alphabet[value % alphabet.length]).join("");
  };
  var makeWarrantyNumber = () => {
    const year = String((/* @__PURE__ */ new Date()).getFullYear()).slice(-2);
    return `EPD-${year}-${randomWarrantyCode(6)}`;
  };
  var makeWarrantyValidUntil = (overtagelseDato = "", warrantyConfig = {}) => {
    const sourceDate = overtagelseDato || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const d = new Date(sourceDate);
    if (Number.isNaN(d.getTime())) return null;
    d.setFullYear(d.getFullYear() + getWarrantyYears(warrantyConfig));
    return d.toISOString().slice(0, 10);
  };
  var soproSystemChecklistTemplates = {
    "sopro-aeb-815": [
      {
        category: "Sopro AEB 815 / TG 20918 – Underlag",
        items: [
          "Underlaget er rengjort og tørt før montering av foliemembran",
          "Fuktinnhold i betong er kontrollert og er ikke over 85 % RF",
          "Underlaget er primet med Sopro Primer iht. monteringsanvisning"
        ]
      },
      {
        category: "Sopro AEB 815 / TG 20918 – Foliemembran",
        items: [
          "Sopro AEB 815 foliemembran er montert iht. leverandørens monteringsanvisning",
          "Folieskjøter er limt med Sopro FDK 1-K 1180 / Sopro FDK 415 eller annet godkjent systemlim",
          "Sopro tettebånd er montert i alle overganger mellom gulv og vegg, hjørner, folieskjøter og tilslutninger",
          "Innvendige og utvendige hjørner er utført med Sopro systemdetaljer"
        ]
      },
      {
        category: "Sopro AEB 815 / TG 20918 – Rør og sluk",
        items: [
          "Sopro rørmansjetter er montert på alle rørgjennomføringer og veggbokser",
          "Rør og veggbokser er rengjort før mansjetter er montert",
          "Slukmansjett er montert iht. leverandørens monteringsanvisning",
          "Klemring/limflens er kontrollert og utført iht. valgt sluktype",
          "Sluk og mansjett er dokumentert med bilde før flislegging"
        ]
      },
      {
        category: "Sopro AEB 815 / TG 20918 – Tetthetskontroll",
        items: [
          "Tetthetskontroll/vanntetthetstest av membransystemet er vurdert/utført før overflatebelegg",
          "Bildedokumentasjon av membransystem, skjøter, mansjetter og sluk foreligger"
        ]
      }
    ],
    "sopro-fdf-525-527": [
      {
        category: "Sopro FDF 525/527 / TG 20987 – Underlag",
        items: [
          "Underlaget er rengjort og tørt før påføring av membran",
          "Fuktinnhold i betong er kontrollert og er ikke over 85 % RF",
          "Primer er påført iht. valgt Sopro-system og underlag"
        ]
      },
      {
        category: "Sopro FDF 525/527 / TG 20987 – Membran",
        items: [
          "Minimum to strøk Sopro FDF 525/527 membran er påført",
          "Membrantykkelse på gulv er minimum 1,0 mm",
          "Membrantykkelse på vegg er minimum 0,5 mm",
          "Primer og membran er overflatetørr før neste lag er påført",
          "Brukstemperatur minimum +10 °C er ivaretatt"
        ]
      },
      {
        category: "Sopro FDF 525/527 / TG 20987 – Overganger og gjennomføringer",
        items: [
          "Sopro tettebånd/fiberremse er montert i plateskjøter, overganger og tilslutninger",
          "Innvendige og utvendige hjørner er forsterket med Sopro hjørnemansjetter",
          "Sopro rørmansjetter er montert på alle rørgjennomføringer med riktig dimensjon",
          "Rør er rengjort før mansjett er montert",
          "Tekstilsjikt på mansjetter er fullstendig dekket med Sopro FDF 525/527",
          "Membran er ført litt forbi mansjett og ut på rør/veggboks"
        ]
      },
      {
        category: "Sopro FDF 525/527 / TG 20987 – Sluk og tetthetskontroll",
        items: [
          "Slukmansjett er montert med Sopro FDF 525/527 iht. valgt sluktype",
          "Det er påført minst to strøk Sopro FDF 525/527 over slukmansjett",
          "Klemring/limflens er kontrollert og dokumentert",
          "Sluk og mansjett er dokumentert med bilde før flislegging",
          "Tetthetskontroll/vanntetthetstest av membransystemet er vurdert/utført før overflatebelegg"
        ]
      }
    ]
  };
  var getSoproChecklistTemplate = (systemId) => soproSystemChecklistTemplates[systemId] || [];
  var isSoproWarrantyCategory = (category = "") => String(category || "").startsWith("Sopro ");
  var isSoproWarrantyPoint = (category = "") => isSoproWarrantyCategory(category);
  var checklistPointAnchor = (category = "", item = "") => {
    const clean = `${category}-${item}`.toLowerCase().replace(/[åä]/g, "a").replace(/[øö]/g, "o").replace(/[æ]/g, "ae").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return `checkpunkt-${clean || "punkt"}`;
  };
  var getSoproWarrantyPointStatus = (checklist = {}, systemId = "") => {
    const template = getSoproChecklistTemplate(systemId);
    const points = template.flatMap((group) => (group.items || []).map((item) => {
      const value = checklist?.[group.category]?.[item] || {};
      const statusDone = hasValue(value?.status);
      const imageDone = (value?.photos || []).some((photo) => hasValue(photo?.url));
      const commentDone = hasValue(value?.comment);
      const documentationDone = imageDone || commentDone;
      const done = statusDone && documentationDone;
      return {
        category: group.category,
        item,
        status: value?.status || "",
        done,
        statusDone,
        imageDone,
        commentDone,
        documentationDone,
        anchorId: checklistPointAnchor(group.category, item)
      };
    }));
    const total = points.length;
    const done = points.filter((point) => point.done).length;
    const missing = points.filter((point) => !point.done);
    return {
      points,
      missing,
      total,
      done,
      complete: total > 0 && done >= total,
      percent: total ? Math.round(done / total * 100) : 0
    };
  };
  var dedupeChecklistTemplate = (groups = []) => {
    const result = [];
    (groups || []).forEach((group) => {
      const category = String(group?.category || "");
      if (!category) return;
      let target = result.find((entry) => entry.category === category);
      if (!target) {
        target = { category, items: [], requirements: { ...group?.requirements || {} } };
        result.push(target);
      } else if (group?.requirements) {
        target.requirements = { ...target.requirements || {}, ...group.requirements };
      }
      const seenItems = new Set(target.items || []);
      (group.items || []).forEach((item) => {
        if (!seenItems.has(item)) {
          target.items.push(item);
          seenItems.add(item);
        }
      });
    });
    return result;
  };
  var warrantyOverlapGenericItems = new Set([
    "Restfukt/RF er kontrollert iht. krav før videre belegning/membran",
    "Riktig primer valgt",
    "Primer påført",
    "Tørketid fulgt",
    "Membranløsning kontrollert",
    "Sopro tettebånd montert",
    "Slukmansjett montert",
    "Sopro rørmansjetter montert",
    "Trykktesting av membran",
    "Minimum 5 cm overlapp på skjøter med tetningsduk/tettebånd er kontrollert",
    "Riktig membrantykkelse på vegger og gulv iht. Sopro anvisninger og myndighetskrav er kontrollert"
  ]);
  var getBaseChecklistTemplateForWarranty = (warranty = {}) => {
    const warrantyActive = !!warranty?.enabled && !!warranty?.system;
    if (!warrantyActive) return checklistTemplate;
    return checklistTemplate.map((group) => ({
      ...group,
      items: (group.items || []).filter((item) => !warrantyOverlapGenericItems.has(item))
    })).filter((group) => (group.items || []).length > 0);
  };
  var getActiveChecklistTemplate = (warranty = {}, extraSoproProductTemplate = []) => {
    const baseTemplate = getBaseChecklistTemplateForWarranty(warranty);
    const soproTemplate = warranty?.enabled ? getSoproChecklistTemplate(warranty?.system) : [];
    const extraTemplate = warranty?.enabled ? extraSoproProductTemplate || [] : [];
    if (!soproTemplate.length && !extraTemplate.length) return dedupeChecklistTemplate(baseTemplate);
    const soproUnderlag = soproTemplate.filter((group) => /Underlag/i.test(group.category));
    const soproMembran = soproTemplate.filter((group) => /Foliemembran|Membran/i.test(group.category));
    const soproOverganger = soproTemplate.filter((group) => /Overganger|Rør og sluk|Sluk og tetthetskontroll/i.test(group.category));
    const soproTetthet = soproTemplate.filter((group) => /Tetthetskontroll/i.test(group.category) && !/Sluk og tetthetskontroll/i.test(group.category));
    const soproInserted = new Set();
    const markInserted = (groups = []) => groups.filter((group) => {
      if (!group || soproInserted.has(group.category)) return false;
      soproInserted.add(group.category);
      return true;
    });
    const result = [];
    (baseTemplate || []).forEach((group) => {
      result.push(group);
      if (group.category === "Avretting / underlag") result.push(...markInserted(soproUnderlag));
      if (group.category === "Membran / tetting") {
        result.push(...markInserted(soproMembran));
        result.push(...markInserted(soproOverganger));
        result.push(...markInserted(soproTetthet));
      }
    });
    result.push(...markInserted(soproTemplate));
    result.push(...markInserted(extraTemplate));
    return dedupeChecklistTemplate(result);
  };
  var buildSelectedSoproProductChecklistTemplate = ({
    warranty = {},
    selectedProducts = [],
    productMasterByProduct = {},
    productMasterCheckpointsByProduct = {}
  } = {}) => {
    if (!warranty?.enabled || !warranty?.system) return [];
    const warrantySystem = warranty.system;
    const groups = [];
    const usedCategories = new Set();
    (selectedProducts || []).forEach((product) => {
      const productName = product?.item || product?.name || "";
      const masterRow = productMasterByProduct?.[productName];
      if (!masterRow || !isSoproGuaranteeProductMasterRow(masterRow)) return;
      const productNo = String(masterRow.product_no || "").trim();
      if (!productNo) return;
      const checkpoints = (productMasterCheckpointsByProduct?.[productNo] || []).filter((checkpoint) => {
        if (checkpoint?.checkpoint_type && checkpoint.checkpoint_type !== "garanti") return false;
        const system = checkpoint?.guarantee_system || "all";
        return system === "all" || system === warrantySystem;
      });
      if (!checkpoints.length) return;
      let category = `Sopro garantikontrollpunkter – ${productDisplayNameFromMaster(masterRow) || productName}`;
      let suffix = 2;
      while (usedCategories.has(category)) {
        category = `Sopro garantikontrollpunkter – ${productDisplayNameFromMaster(masterRow) || productName} (${suffix})`;
        suffix += 1;
      }
      usedCategories.add(category);
      const requirements = {};
      const items = [];
      checkpoints.forEach((checkpoint) => {
        const checkpointText = String(checkpoint?.checkpoint_text || "").trim();
        if (!checkpointText || items.includes(checkpointText)) return;
        items.push(checkpointText);
        requirements[checkpointText] = {
          image_required: true,
          comment_required: true,
          product_no: productNo,
          product_name: productDisplayNameFromMaster(masterRow) || productName,
          guarantee_system: checkpoint.guarantee_system || "all"
        };
      });
      if (items.length) groups.push({ category, items, requirements });
    });
    return groups;
  };
  var getDynamicSoproWarrantyRequirementStatus = (checklist = {}, dynamicTemplate = []) => {
    const missing = [];
    const points = [];
    (dynamicTemplate || []).forEach((group) => {
      (group.items || []).forEach((item) => {
        const value = checklist?.[group.category]?.[item] || {};
        const req = group.requirements?.[item] || {};
        const statusDone = hasValue(value?.status);
        const imageDone = (value?.photos || []).some((photo) => hasValue(photo?.url));
        const commentDone = hasValue(value?.comment);
        const documentationRequired = !!req.image_required || !!req.comment_required;
        const documentationDone = !documentationRequired || imageDone || commentDone;
        const done = statusDone && documentationDone;
        const point = { category: group.category, item, status: value?.status || "", done, statusDone, imageDone, commentDone, documentationDone, requirement: req, anchorId: checklistPointAnchor(group.category, item) };
        points.push(point);
        if (!done) {
          if (!statusDone) missing.push(`${group.category}: ${item} må ha status.`);
          if (statusDone && !documentationDone) missing.push(`${group.category}: ${item} krever bilde eller kommentar.`);
        }
      });
    });
    return { points, missing, total: points.length, done: points.filter((point) => point.done).length, complete: points.length === 0 || missing.length === 0, percent: points.length ? Math.round(points.filter((point) => point.done).length / points.length * 100) : 100 };
  };
  var emptyWarranty = () => ({
    enabled: false,
    issued: false,
    issuedAt: null,
    system: "",
    sintefApproval: "",
    durationYears: WARRANTY_YEARS,
    status: "draft",
    guaranteeNumber: "",
    reportGeneratedAt: null,
    reportGeneratedFileName: "",
    termsAccepted: false,
    termsAcceptedAt: "",
    termsAcceptedBy: "",
    termsReceiptName: "",
    termsReceiptRole: "Kunde"
  });
  var emptyProject = () => ({
    responsible: "",
    projectName: "",
    address: "",
    postnr: "",
    city: "",
    customer: "",
    customerEmail: "",
    customerPhone: "",
    date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    notes: "",
    projectDescription: "",
    projectInfoIncludeInReport: false,
    checklistPhotosNote: false,
    fall: "",
    fallDusj: "",
    fallUtenfor: "",
    sluk: "",
    terskel: "",
    membran: "",
    prosjekteringKommentar: "",
    prosjekteringPunkter: [],
    locked: false,
    status: "active",
    workflowStatus: "Pågår",
    lockedAt: "",
    lockedBy: ""
  });
  var emptyProjectLog = () => ({
    enabled: false,
    draft: "",
    messages: [],
    lastReadByAdmin: "",
    lastReadByCustomer: ""
  });
  var normalizeProjectLog = (log = {}) => ({
    ...emptyProjectLog(),
    ...log || {},
    messages: Array.isArray(log?.messages) ? log.messages : []
  });

  var productReportDocumentOptions = [
    { key: "Fdv", field: "fdvUrl", label: "FDV" },
    { key: "Datablad", field: "databladUrl", label: "Datablad" },
    { key: "Dop", field: "dopUrl", label: "DOP" },
    { key: "Epd", field: "epdUrl", label: "EPD" },
    { key: "Sikkerhetsdatablad", field: "sikkerhetsdatabladUrl", label: "Sikkerhetsdatablad" },
    { key: "DocumentFile", field: "documentFileUrl", label: "Produkt-/leverandørside" }
  ];
  var hasProductReportChoice = (doc = {}) => productReportDocumentOptions.some((option) => doc?.[`include${option.key}InReport`] === true || doc?.[`include${option.key}InReport`] === false);
  var shouldIncludeProductReportDoc = (doc = {}, option) => {
    if (!doc || !option || !hasValue(doc?.[option.field])) return false;
    const choiceKey = `include${option.key}InReport`;
    return doc?.[choiceKey] !== false;
  };

  var normalizeManualProductsBySection = (value = {}) => {
    const result = {};
    const addProduct = (section, product) => {
      const cleanSection = String(section || product?.section || product?.trade || "Andre produkter").trim() || "Andre produkter";
      const cleanProduct = {
        id: product?.id || uid(),
        name: product?.name || product?.product_name || "",
        fdvUrl: product?.fdvUrl || product?.fdv_url || "",
        comment: product?.comment || ""
      };
      result[cleanSection] = [...result[cleanSection] || [], cleanProduct];
    };
    if (Array.isArray(value)) {
      value.forEach((product) => addProduct(product?.section || product?.trade || "Andre produkter", product || {}));
      return result;
    }
    Object.entries(value || {}).forEach(([section, products]) => {
      if (Array.isArray(products)) {
        products.forEach((product) => addProduct(section, product || {}));
      }
    });
    return result;
  };
  function App() {
    (0, import_react.useEffect)(() => {
      ensureExpoProffDokAppBranding();
    }, []);
    (0, import_react.useEffect)(() => {
      const preventFileDropNavigation = (event) => {
        const hasFiles = Array.from(event?.dataTransfer?.types || []).includes("Files");
        if (!hasFiles) return;
        event.preventDefault();
      };
      window.addEventListener("dragover", preventFileDropNavigation);
      window.addEventListener("drop", preventFileDropNavigation);
      return () => {
        window.removeEventListener("dragover", preventFileDropNavigation);
        window.removeEventListener("drop", preventFileDropNavigation);
      };
    }, []);
    const [tab, setTab] = (0, import_react.useState)("prosjekt");
    const [company, setCompany] = (0, import_react.useState)({ companyName: "Expo Proffsenter", address: "", orgNumber: "", phone: "", email: "", website: "", logoUrl: "" });
    const [user, setUser] = (0, import_react.useState)({ name: "", email: "", role: "Eier / administrator" });
    const [project, setProject] = (0, import_react.useState)(emptyProject());
    const [checked, setChecked] = (0, import_react.useState)({});
    const [productDocs, setProductDocs] = (0, import_react.useState)({});
    const [manualProducts, setManualProducts] = (0, import_react.useState)({});
    const [other, setOther] = (0, import_react.useState)({});
    const [surf, setSurf] = (0, import_react.useState)({});
    const [bathroomEquipment, setBathroomEquipment] = (0, import_react.useState)(emptyBathroomEquipment());
    const [photos, setPhotos] = (0, import_react.useState)([]);
    const [access, setAccess] = (0, import_react.useState)([]);
    const [inst, setInst] = (0, import_react.useState)([]);
    const [files, setFiles] = (0, import_react.useState)([]);
    const [checklist, setChecklist] = (0, import_react.useState)({});
    const [tilbud, setTilbud] = (0, import_react.useState)(emptyTilbud());
    const [overtagelse, setOvertagelse] = (0, import_react.useState)(emptyOvertagelse());
    const [warranty, setWarranty] = (0, import_react.useState)(emptyWarranty());
    const [chatUploadFile, setChatUploadFile] = (0, import_react.useState)(null);
    const [customerChatUploadFile, setCustomerChatUploadFile] = (0, import_react.useState)(null);
    const [projectLog, setProjectLog] = (0, import_react.useState)(emptyProjectLog());
    const [customerTab, setCustomerTab] = (0, import_react.useState)("oversikt");
    const [internalNotes, setInternalNotes] = (0, import_react.useState)("");
    const [lightboxImage, setLightboxImage] = (0, import_react.useState)(null);
    const [accessEmailMessage, setAccessEmailMessage] = (0, import_react.useState)("Hei, du har fått tilgang til prosjektet. Klikk på linken i denne e-posten for å åpne prosjektet.");
    const [projects, setProjects] = (0, import_react.useState)([]);
    const [projectId, setProjectId] = (0, import_react.useState)(null);
    const [currentProjectOwnerId, setCurrentProjectOwnerId] = (0, import_react.useState)("");
    const [supportModeExplicit, setSupportModeExplicit] = (0, import_react.useState)(false);
    const [mobileCreatingProject, setMobileCreatingProject] = (0, import_react.useState)(false);
    const [authUser, setAuthUser] = (0, import_react.useState)(null);
    const [authEmail, setAuthEmail] = (0, import_react.useState)("");
    const [authPassword, setAuthPassword] = (0, import_react.useState)("");
    const [passwordRecovery, setPasswordRecovery] = (0, import_react.useState)(false);
    const [newPassword, setNewPassword] = (0, import_react.useState)("");
    const [newPasswordRepeat, setNewPasswordRepeat] = (0, import_react.useState)("");
    const [authLoading, setAuthLoading] = (0, import_react.useState)(true);
    const [profile, setProfile] = (0, import_react.useState)(null);
    const [profileLoading, setProfileLoading] = (0, import_react.useState)(false);
    const [termsAccepted, setTermsAccepted] = (0, import_react.useState)(false);
    const [termsAcceptanceRecord, setTermsAcceptanceRecord] = (0, import_react.useState)(null);
    const [termsLoading, setTermsLoading] = (0, import_react.useState)(false);
    const [termsAccepting, setTermsAccepting] = (0, import_react.useState)(false);
    const [termsError, setTermsError] = (0, import_react.useState)("");
    const [termsReadConfirmed, setTermsReadConfirmed] = (0, import_react.useState)(false);
    const [adminUsers, setAdminUsers] = (0, import_react.useState)([]);
    const [adminTermsAcceptances, setAdminTermsAcceptances] = (0, import_react.useState)([]);
    const [adminUserFilter, setAdminUserFilter] = (0, import_react.useState)("pending");
    const [adminUserSearch, setAdminUserSearch] = (0, import_react.useState)("");
    const [adminUserCompanyFilter, setAdminUserCompanyFilter] = (0, import_react.useState)("");
    const [adminLoading, setAdminLoading] = (0, import_react.useState)(false);
    const [companyUsers, setCompanyUsers] = (0, import_react.useState)([]);
    const [companyInvites, setCompanyInvites] = (0, import_react.useState)([]);
    const [companyAdminLoading, setCompanyAdminLoading] = (0, import_react.useState)(false);
    const [newEmployeeEmail, setNewEmployeeEmail] = (0, import_react.useState)("");
    const [newEmployeeRole, setNewEmployeeRole] = (0, import_react.useState)("ansatt");
    const [projectSearch, setProjectSearch] = (0, import_react.useState)("");
    const [projectStatusFilter, setProjectStatusFilter] = (0, import_react.useState)("alle");
    const [projectUnreadOnly, setProjectUnreadOnly] = (0, import_react.useState)(false);
    const [supportCompanySearch, setSupportCompanySearch] = (0, import_react.useState)("");
    const [supportProjectSearch, setSupportProjectSearch] = (0, import_react.useState)("");
    const [supportSelectedCompany, setSupportSelectedCompany] = (0, import_react.useState)("");
    const [openSupportCompany, setOpenSupportCompany] = (0, import_react.useState)("");
    const [fdvRegister, setFdvRegister] = (0, import_react.useState)([]);
    const [fdvLoading, setFdvLoading] = (0, import_react.useState)(false);
    const [productMaster, setProductMaster] = (0, import_react.useState)([]);
    const [productMasterLoading, setProductMasterLoading] = (0, import_react.useState)(false);
    const [productMasterCheckpoints, setProductMasterCheckpoints] = (0, import_react.useState)([]);
    const [productMasterCheckpointLoading, setProductMasterCheckpointLoading] = (0, import_react.useState)(false);
    const [openProductCheckpointPanels, setOpenProductCheckpointPanels] = (0, import_react.useState)({});
    const [newProductCheckpoints, setNewProductCheckpoints] = (0, import_react.useState)({});
    const [newProductMaster, setNewProductMaster] = (0, import_react.useState)(emptyNewProductMaster());
    const [productMasterSearch, setProductMasterSearch] = (0, import_react.useState)("");
    const [showNewProductMasterForm, setShowNewProductMasterForm] = (0, import_react.useState)(false);
    const [openAdminSections, setOpenAdminSections] = (0, import_react.useState)({
      dokument: false,
      support: false,
      brukere: false,
      produktmaster: false
    });
    const toggleAdminSection = (key) => setOpenAdminSections((prev) => ({ ...prev || {}, [key]: !prev?.[key] }));
    const adminSectionIsOpen = (key) => key === "produktmaster" && hasValue(productMasterSearch) ? true : !!openAdminSections?.[key];
    const adminAccordionButton = (key, title, subtitle = "") => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
      type: "button",
      className: "secondary",
      style: { width: "100%", justifyContent: "space-between", textAlign: "left", fontWeight: 900, fontSize: "18px", marginBottom: adminSectionIsOpen(key) ? "12px" : "0" },
      onClick: () => toggleAdminSection(key),
      children: [
        adminSectionIsOpen(key) ? `▼ ${title}` : `▶ ${title}`,
        subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { fontSize: "13px", fontWeight: 700, color: "#64748b" }, children: subtitle }) : null
      ]
    });

    const [openProductSections, setOpenProductSections] = (0, import_react.useState)({});
    const [showOpenDeviationsOnly, setShowOpenDeviationsOnly] = (0, import_react.useState)(false);
    const [checklistSaveStatus, setChecklistSaveStatus] = (0, import_react.useState)("");
    const [photoSaveStatus, setPhotoSaveStatus] = (0, import_react.useState)("");
    const [projectAutoSaveStatus, setProjectAutoSaveStatus] = (0, import_react.useState)("");
    const [localDraftRestoreChecked, setLocalDraftRestoreChecked] = (0, import_react.useState)(false);
    const checklistAutoSaveTimerRef = (0, import_react.useRef)(null);
    const localDraftTimerRef = (0, import_react.useRef)(null);
    const cloudAutoSaveTimerRef = (0, import_react.useRef)(null);
    const restoredDraftKeysRef = (0, import_react.useRef)(new Set());
    const latestStateRef = (0, import_react.useRef)({});
    const lastChatMessageCountRef = (0, import_react.useRef)(0);
    const lastChatRefreshAtRef = (0, import_react.useRef)(0);
    const previousAuthUserIdRef = (0, import_react.useRef)(null);
    const openImageLightboxFromClick = (event) => {
      const target = event?.target;
      if (!target || target.tagName !== "IMG") return;
      const imageContainer = target.closest?.(".photo, .projectImageThumb");
      if (!imageContainer) return;
      const src = target.getAttribute("src");
      if (!src) return;
      setLightboxImage({ src, alt: target.getAttribute("alt") || "Bilde" });
    };
    (0, import_react.useEffect)(() => {
      latestStateRef.current = {
        company,
        user,
        project,
        checked,
        productDocs,
        manualProducts,
        other,
        surf,
        bathroomEquipment,
        photos,
        access,
        inst,
        files,
        checklist,
        tilbud,
        overtagelse,
        warranty,
        projectLog,
        internalNotes
      };
    }, [company, user, project, checked, productDocs, manualProducts, other, surf, bathroomEquipment, photos, access, inst, files, checklist, tilbud, overtagelse, warranty, projectLog, internalNotes]);
    (0, import_react.useEffect)(() => {
      const savedEmail = window.localStorage.getItem("expoProffDokAuthEmail");
      if (savedEmail) setAuthEmail(savedEmail);
    }, []);
    const effectiveProductSections = (0, import_react.useMemo)(() => buildProductSectionsWithMaster(productSections, productMaster), [productMaster]);
    const selected = (0, import_react.useMemo)(() => effectiveProductSections.flatMap((s) => s.items.filter((i) => checked[i]).map((i) => ({
      section: s.title,
      item: i,
      fdvUrl: productDocs[i]?.fdvUrl || "",
      databladUrl: productDocs[i]?.databladUrl || "",
      dopUrl: productDocs[i]?.dopUrl || "",
      epdUrl: productDocs[i]?.epdUrl || "",
      sikkerhetsdatabladUrl: productDocs[i]?.sikkerhetsdatabladUrl || "",
      documentFileUrl: productDocs[i]?.documentFileUrl || "",
      colorCode: productDocs[i]?.colorCode || productDocs[i]?.colourCode || productDocs[i]?.fargekode || "",
      comment: productDocs[i]?.comment || ""
    }))), [checked, productDocs]);
    const manualProductsBySection = (0, import_react.useMemo)(() => normalizeManualProductsBySection(manualProducts), [manualProducts]);
    const getManualProductsForSection = (section) => manualProductsBySection[section] || [];
    const manualSelected = (0, import_react.useMemo)(() => {
      return Object.entries(manualProductsBySection || {}).flatMap(
        ([section, products]) => (products || []).filter((p) => hasValue(p.name) || hasValue(p.fdvUrl) || hasValue(p.comment)).map((p) => ({ ...p, section }))
      );
    }, [manualProductsBySection]);
    const fdvRegisterByProduct = (0, import_react.useMemo)(() => {
      const map = {};
      (fdvRegister || []).forEach((row) => {
        if (row?.product_name) map[row.product_name] = row;
      });
      return map;
    }, [fdvRegister]);
    const productMasterByProduct = (0, import_react.useMemo)(() => {
      const map = {};
      const scoreRow = (row) => [row?.fdv_url, row?.datablad_url, row?.dop_url, row?.epd_url, row?.sikkerhetsdatablad_url, row?.document_file_url].filter(hasValue).length;
      const addKey = (key, row) => {
        const cleanKey = String(key || "").trim();
        if (!cleanKey) return;
        if (!map[cleanKey] || scoreRow(row) > scoreRow(map[cleanKey])) map[cleanKey] = row;
      };
      (productMaster || []).forEach((row) => {
        addKey(row?.app_match_name, row);
        addKey(row?.product_family, row);
        addKey(row?.product_name, row);
      });
      return map;
    }, [productMaster]);
    const getProductColorOptions = (productName = "", sectionName = "") => {
      if (!productSupportsColorChoice(productName, sectionName)) return [];
      const cleanProduct = String(productName || "").toLowerCase();
      const productWords = cleanProduct.split(/\s+/).filter((word) => word.length > 2);
      const masterColors = (productMaster || []).filter((row) => {
        const rowText = [
          row?.app_match_name,
          row?.product_name,
          row?.product_family,
          row?.category
        ].filter(Boolean).join(" ").toLowerCase();
        if (!rowText) return false;
        if (rowText === cleanProduct) return true;
        if (rowText.includes(cleanProduct) || cleanProduct.includes(rowText)) return true;
        return productWords.length && productWords.some((word) => rowText.includes(word));
      }).flatMap((row) => splitColorCodeOptions(row?.color_code)).filter(hasValue);
      const getBaseColorOptions = () => {
        if (/df\s*10|df10|designfug/.test(cleanProduct)) return soproDf10ColorOptions;
        if (/fl\s*plus|flexfuge/.test(cleanProduct)) return soproFlPlusColorOptions;
        if (/dfx|epoxy|epoksi/.test(cleanProduct)) return soproDfxColorOptions;
        if (/nsm|matt|neutral/.test(cleanProduct)) return soproMatteSiliconeColorOptions;
        if (/silikon|silicon|sanit[æae]r|ssi|ceramic|keramik|ksi|msi/.test(cleanProduct)) return soproSanitarySiliconeColorOptions;
        return soproColorCodeFallbackOptions;
      };
      const selectedValue = normalizeColorCodeLabel(productDocs?.[productName]?.colorCode || "");
      const sourceOptions = masterColors.length ? masterColors : getBaseColorOptions();
      const options = uniqueColorOptions([...sourceOptions, selectedValue]);
      const emptyOption = [""];
      const sortedOptions = options.filter(Boolean).sort((a, b) => normalizeColorSortKey(a) - normalizeColorSortKey(b) || a.localeCompare(b, "no"));
      return [...emptyOption, ...sortedOptions];
    };
    const productMasterStats = (0, import_react.useMemo)(() => {
      const rows = productMaster || [];
      const withDocs = rows.filter((row) => [row?.fdv_url, row?.datablad_url, row?.dop_url, row?.epd_url, row?.sikkerhetsdatablad_url, row?.document_file_url].some(hasValue)).length;
      const appMatches = rows.filter((row) => row?.used_in_app_standard_list || hasValue(row?.app_match_name)).length;
      return { total: rows.length, withDocs, appMatches };
    }, [productMaster]);
    const visibleProductMasterRows = (0, import_react.useMemo)(() => {
      const baseRows = (productMaster || []).filter((row) => row.used_in_app_standard_list || hasValue(row.app_match_name) || hasValue(row.fdv_url) || hasValue(row.datablad_url) || hasValue(row.dop_url) || hasValue(row.epd_url) || hasValue(row.sikkerhetsdatablad_url) || hasValue(row.document_file_url));
      const search = String(productMasterSearch || "").trim().toLowerCase();
      if (!search) return baseRows;
      return baseRows.filter((row) => [
        row.product_no,
        row.product_name,
        row.product_family,
        row.category,
        row.app_match_name,
        row.color_code,
        row.comment,
        row.fdv_url,
        row.datablad_url,
        row.dop_url,
        row.epd_url,
        row.sikkerhetsdatablad_url,
        row.document_file_url
      ].filter(Boolean).join(" ").toLowerCase().includes(search));
    }, [productMaster, productMasterSearch]);
    const productMasterCheckpointsByProduct = (0, import_react.useMemo)(() => {
      const map = {};
      (productMasterCheckpoints || []).forEach((checkpoint) => {
        const key = String(checkpoint?.product_no || "").trim();
        if (!key) return;
        map[key] = [...map[key] || [], checkpoint].sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0) || String(a.checkpoint_text || "").localeCompare(String(b.checkpoint_text || "")));
      });
      return map;
    }, [productMasterCheckpoints]);

    const selectedSoproProductChecklistTemplate = (0, import_react.useMemo)(() => buildSelectedSoproProductChecklistTemplate({
      warranty,
      selectedProducts: selected,
      productMasterByProduct,
      productMasterCheckpointsByProduct
    }), [warranty, selected, productMasterByProduct, productMasterCheckpointsByProduct]);
    const activeChecklistTemplate = (0, import_react.useMemo)(() => getActiveChecklistTemplate(warranty, selectedSoproProductChecklistTemplate), [warranty, selectedSoproProductChecklistTemplate]);
    const dynamicSoproWarrantyRequirementStatus = (0, import_react.useMemo)(() => getDynamicSoproWarrantyRequirementStatus(checklist, selectedSoproProductChecklistTemplate), [checklist, selectedSoproProductChecklistTemplate]);

    const toggleProductCheckpointPanel = (productNo) => {
      const key = String(productNo || "").trim();
      if (!key) return;
      setOpenProductCheckpointPanels((prev) => ({ ...prev || {}, [key]: !prev?.[key] }));
    };

    const pendingAdminUsers = (0, import_react.useMemo)(() => (adminUsers || []).filter((u) => !u?.approved && !u?.deactivated), [adminUsers]);
    const adminUserStats = (0, import_react.useMemo)(() => {
      const rows = adminUsers || [];
      return {
        pending: rows.filter((u) => !u?.approved && !u?.deactivated).length,
        approved: rows.filter((u) => u?.approved && !u?.deactivated).length,
        deactivated: rows.filter((u) => u?.deactivated).length,
        systemadmin: rows.filter((u) => u?.system_role === "systemadmin").length,
        all: rows.length
      };
    }, [adminUsers]);
    const visibleAdminUsers = (0, import_react.useMemo)(() => {
      const search = String(adminUserSearch || "").trim().toLowerCase();
      const companyFilter = String(adminUserCompanyFilter || "").trim().toLowerCase();
      const matchesFilter = (u = {}) => {
        if (adminUserFilter === "pending") return !u?.approved && !u?.deactivated;
        if (adminUserFilter === "approved") return !!u?.approved && !u?.deactivated;
        if (adminUserFilter === "deactivated") return !!u?.deactivated;
        if (adminUserFilter === "systemadmin") return u?.system_role === "systemadmin";
        return true;
      };
      return (adminUsers || []).filter((u) => {
        if (!matchesFilter(u)) return false;
        if (companyFilter && String(u?.company_name || "").trim().toLowerCase() !== companyFilter) return false;
        if (!search) return true;
        const text = [
          u?.email,
          u?.company_name,
          u?.company_role,
          u?.system_role,
          u?.role,
          u?.approved ? "godkjent" : "venter",
          u?.deactivated ? "deaktivert" : "aktiv"
        ].filter(Boolean).join(" ").toLowerCase();
        return text.includes(search);
      });
    }, [adminUsers, adminUserFilter, adminUserSearch, adminUserCompanyFilter]);
    const normalizeEmailKey = (value = "") => String(value || "").trim().toLowerCase();
    const adminTermsAcceptanceByUser = (0, import_react.useMemo)(() => {
      const map = {};
      (adminTermsAcceptances || []).forEach((row) => {
        if (!row?.user_id) return;
        const current = map[row.user_id];
        if (!current || String(row.accepted_at || "") > String(current.accepted_at || "")) map[row.user_id] = row;
      });
      return map;
    }, [adminTermsAcceptances]);
    const adminTermsAcceptanceByEmail = (0, import_react.useMemo)(() => {
      const map = {};
      (adminTermsAcceptances || []).forEach((row) => {
        const emailKey = normalizeEmailKey(row?.email);
        if (!emailKey) return;
        const current = map[emailKey];
        if (!current || String(row.accepted_at || "") > String(current.accepted_at || "")) map[emailKey] = row;
      });
      return map;
    }, [adminTermsAcceptances]);
    const getAdminTermsAcceptanceForUser = (userRow = {}) => {
      return adminTermsAcceptanceByUser?.[userRow?.id] || adminTermsAcceptanceByEmail?.[normalizeEmailKey(userRow?.email)] || null;
    };
    const termsAcceptedCount = (0, import_react.useMemo)(() => {
      const keys = new Set();
      Object.values(adminTermsAcceptanceByUser || {}).forEach((row) => {
        keys.add(row?.user_id || normalizeEmailKey(row?.email));
      });
      return keys.size;
    }, [adminTermsAcceptanceByUser]);
    const formatTermsAcceptedAt = (value = "") => {
      if (!value) return "";
      try {
        return new Date(value).toLocaleString("no-NO", { dateStyle: "short", timeStyle: "short" });
      } catch {
        return value;
      }
    };
    const hasActiveProjectWorkspace = !!projectId || !!mobileCreatingProject;
    const name = company.companyName || "Expo Proffsenter";
    const urlParams = new URLSearchParams(window.location.search);
    const accessMode = urlParams.get("access") || urlParams.get("role") || (urlParams.has("project") ? "kunde" : "");
    const isAdminProjectLink = urlParams.has("project") && accessMode === "admin";
    const isUnderleverandorView = urlParams.has("project") && accessMode === "underleverandor";
    const isReadOnly = urlParams.has("project") && !isUnderleverandorView && !isAdminProjectLink;
    const isSystemAdminUser = !!authUser && profile?.system_role === "systemadmin";
    const isCompanyAdminUser = !!authUser && !!profile?.approved && !profile?.deactivated && (profile?.company_role === "firmaadmin" || isSystemAdminUser);
    const currentCompanyName = String(profile?.company_name || company?.companyName || "").trim();
    const normalizeCompanyName = (value = "") => String(value || "").trim().toLowerCase();
    const projectCompanyNameFromRow = (row = {}) => String(
      row?.company_name ||
      row?.data?.company?.companyName ||
      row?.data?.company?.company_name ||
      row?.data?.companyName ||
      ""
    ).trim();
    const projectBelongsToCurrentCompany = (row = {}, currentUser = authUser) => {
      if (!row) return false;
      if (isSystemAdminUser) return true;
      if (row.user_id === currentUser?.id) return true;
      if (!isCompanyAdminUser || !currentCompanyName) return false;
      return normalizeCompanyName(projectCompanyNameFromRow(row)) === normalizeCompanyName(currentCompanyName);
    };
    const projectBelongsToCurrentCompanyForProjectList = (row = {}, currentUser = authUser) => {
      if (!row) return false;
      if (row.user_id === currentUser?.id) return true;
      const ownCompanyName = String(profile?.company_name || currentCompanyName || "").trim();
      if (!ownCompanyName) return false;
      return normalizeCompanyName(projectCompanyNameFromRow(row)) === normalizeCompanyName(ownCompanyName);
    };
    const isAdminUser = isSystemAdminUser;
    const canUseAdminProjectSync = !!authUser && !!profile?.approved && isSystemAdminUser && !isReadOnly;
    const projectIsLocked = (p = project) => p?.locked === true || p?.locked === "true" || p?.status === "locked" || p?.status === "Avsluttet";
    const applyLockState = (baseProject, sourceProject = {}) => ({
      ...baseProject,
      locked: projectIsLocked(sourceProject),
      status: projectIsLocked(sourceProject) ? "locked" : sourceProject.status || baseProject.status || "active",
      lockedAt: sourceProject.lockedAt || "",
      lockedBy: sourceProject.lockedBy || ""
    });
    const isProjectLocked = projectIsLocked(project);
    const lockedProjectMessage = "Prosjektet er arkivert/låst og kan ikke endres. Lås opp prosjektet før du gjør endringer.";
    const notifyLockedProject = () => {
      alert(lockedProjectMessage);
      return false;
    };
    const canEditProject = () => !isProjectLocked || notifyLockedProject();
    const projectHasOvertagelse = (o = overtagelse) => !!o?.enabled || hasValue(o?.dato) || hasValue(o?.kommentar) || hasValue(o?.signUtf\u00F8rende) || hasValue(o?.signKunde) || hasValue(o?.signUtf\u00F8rendeImage) || hasValue(o?.signKundeImage);
    const workflowStatusOptions = ["Utkast", "Pågår", "Avventer", "Klar for kunde", "Avvik åpent", "Ferdigstilt"];
    const getOpenDeviationCount = (sourceChecklist = checklist) => Object.values(sourceChecklist || {}).flatMap((items) => Object.values(items || {})).filter((value) => value?.status === "Avvik").length;
    const workflowStatusInfo = (status) => {
      const cleanStatus = workflowStatusOptions.includes(status) ? status : "Pågår";
      const map = {
        "Utkast": { label: "Utkast", icon: "⚪", tone: "draft" },
        "Pågår": { label: "Pågår", icon: "🟡", tone: "progress" },
        "Avventer": { label: "Avventer", icon: "⏸️", tone: "waiting" },
        "Klar for kunde": { label: "Klar for kunde", icon: "🔵", tone: "customer_ready" },
        "Avvik åpent": { label: "Avvik åpent", icon: "🔴", tone: "deviation" },
        "Ferdigstilt": { label: "Ferdigstilt", icon: "✅", tone: "done" }
      };
      return map[cleanStatus] || map["Pågår"];
    };
    const projectStatusInfo = (p = project, o = overtagelse, openDeviationCount = 0) => {
      const locked = projectIsLocked(p);
      if (locked && projectHasOvertagelse(o)) return { label: "Ferdigstilt", icon: "✅", tone: "done" };
      if (locked) return { label: "Avsluttet / låst", icon: "🔒", tone: "locked" };
      if (openDeviationCount > 0) return { label: "Avvik åpent", icon: "🔴", tone: "deviation" };
      if (p?.workflowStatus) return workflowStatusInfo(p.workflowStatus);
      if (p?.projectName || p?.address || p?.customer || projectHasOvertagelse(o)) return workflowStatusInfo("Pågår");
      return workflowStatusInfo("Utkast");
    };
    const statusStyle = (tone) => ({
      background: tone === "done" ? "#ecfdf5" : tone === "locked" ? "#f8fafc" : tone === "deviation" ? "#fef2f2" : tone === "customer_ready" ? "#eff6ff" : tone === "waiting" ? "#f8fafc" : tone === "draft" ? "#f8fafc" : "#fffbeb",
      color: tone === "done" ? "#065f46" : tone === "locked" ? "#334155" : tone === "deviation" ? "#991b1b" : tone === "customer_ready" ? "#075985" : tone === "waiting" ? "#475569" : tone === "draft" ? "#475569" : "#92400e"
    });
    const chatMessages = projectLog?.messages || [];
    const customerChatCount = chatMessages.filter((m) => m.role === "kunde").length;
    const totalChatCount = chatMessages.length;
    const latestChatMessage = chatMessages.length ? chatMessages[chatMessages.length - 1] : null;
    const lastReadByAdmin = projectLog?.lastReadByAdmin || "";
    const lastReadByCustomer = projectLog?.lastReadByCustomer || "";
    const unreadForAdmin = chatMessages.filter((m) => m.role === "kunde" && (!lastReadByAdmin || (m.created || "") > lastReadByAdmin)).length;
    const unreadForCustomer = chatMessages.filter((m) => m.role !== "kunde" && (!lastReadByCustomer || (m.created || "") > lastReadByCustomer)).length;
    const projectGuideStats = (0, import_react.useMemo)(() => {
      const productCount = (selected || []).length + (manualSelected || []).length;
      const photoCount = (photos || []).filter((photo) => photo?.url).length;
      const checklistValues = Object.values(checklist || {}).flatMap((items) => Object.values(items || {}));
      const checklistTotal = activeChecklistTemplate.reduce((sum, group) => sum + (group.items || []).length, 0);
      const checklistDone = checklistValues.filter((value) => hasValue(value?.status)).length;
      const checklistMissing = Math.max(0, checklistTotal - checklistDone);
      const checklistAvvik = checklistValues.filter((value) => value?.status === "Avvik").length;
      const openDeviationCount = checklistAvvik;
      const hasProjectBasics = [project.projectName, project.address, project.customer].some(hasValue);
      const hasDescription = hasValue(project.projectDescription);
      const hasCustomerEmail = hasValue(project.customerEmail);
      const hasCustomerPhone = hasValue(project.customerPhone);
      const hasOvertagelse = projectHasOvertagelse(overtagelse);
      const completionChecks = [
        hasProjectBasics,
        hasDescription,
        productCount > 0,
        photoCount > 0,
        checklistDone > 0,
        checklistMissing === 0 && checklistTotal > 0,
        openDeviationCount === 0,
        hasCustomerEmail,
        hasCustomerPhone,
        hasOvertagelse
      ];
      const completionPercent = Math.round(completionChecks.filter(Boolean).length / completionChecks.length * 100);
      return { productCount, photoCount, checklistTotal, checklistDone, checklistMissing, checklistAvvik, openDeviationCount, hasProjectBasics, hasDescription, hasCustomerEmail, hasCustomerPhone, hasOvertagelse, completionPercent };
    }, [selected, manualSelected, photos, checklist, project, overtagelse, activeChecklistTemplate]);
    const projectGuideItems = (0, import_react.useMemo)(() => {
      const items = [];
      if (!projectGuideStats.hasProjectBasics) items.push({ id: "basis", label: "Fyll inn prosjekt, adresse og kunde", tab: "prosjekt", tone: "warning" });
      if (!projectGuideStats.hasDescription) items.push({ id: "info", label: "Legg inn kort prosjektbeskrivelse", tab: "prosjektinfo", tone: "info" });
      if (projectGuideStats.productCount === 0) items.push({ id: "produkter", label: "Velg produkter for FDV/rapport", tab: "produkter", tone: "warning" });
      if (projectGuideStats.photoCount === 0) items.push({ id: "bilder", label: "Legg til bildedokumentasjon", tab: "bilder", tone: "warning" });
      if (projectGuideStats.checklistDone === 0) {
        items.push({ id: "sjekklister-start", label: "Start sjekklistekontroll", tab: "sjekklister", tone: "info" });
      } else if (projectGuideStats.checklistMissing > 0) {
        items.push({ id: "sjekklister-mangler", label: `Fullfør ${projectGuideStats.checklistMissing} gjenstående sjekkpunkt`, tab: "sjekklister", tone: "warning" });
      }
      if (projectGuideStats.openDeviationCount > 0) items.push({ id: "avvik-apne", label: `Lukk ${projectGuideStats.openDeviationCount} åpne avvik`, tab: "sjekklister", tone: "warning" });
      if (!projectGuideStats.hasCustomerEmail) items.push({ id: "kunde", label: "Legg inn kunde e-post for deling/varsling", tab: "prosjekt", tone: "info" });
      if (!projectGuideStats.hasCustomerPhone) items.push({ id: "kunde-tlf", label: "Legg inn kunde telefonnummer for enklere oppfølging", tab: "prosjekt", tone: "info" });
      if (!projectGuideStats.hasOvertagelse) items.push({ id: "overtagelse", label: "Registrer overtagelse når prosjektet er ferdig", tab: "overtagelse", tone: "neutral" });
      return items.slice(0, 6);
    }, [projectGuideStats]);
    const firstProjectGuideMissingChecklistPoint = (0, import_react.useMemo)(() => {
      const points = activeChecklistTemplate.flatMap((group) => (group.items || []).map((item) => ({
        category: group.category,
        item,
        anchorId: checklistPointAnchor(group.category, item)
      })));
      return points.find((point) => !hasValue(checklist?.[point.category]?.[point.item]?.status)) || null;
    }, [activeChecklistTemplate, checklist]);
    const openProjectGuideItem = (item) => {
      if (!item) return;
      if (item.id === "sjekklister-start" || item.id === "sjekklister-mangler") {
        const targetPoint = firstProjectGuideMissingChecklistPoint;
        try {
          if (targetPoint) window.sessionStorage.setItem("expoProffDokChecklistJumpTarget", JSON.stringify(targetPoint));
        } catch (error) {
          console.warn("Kunne ikke lagre hopp til sjekkpunkt:", error);
        }
        setShowOpenDeviationsOnly(false);
        goToTab("sjekklister");
        window.setTimeout(() => {
          const el = targetPoint?.anchorId ? document.getElementById(targetPoint.anchorId) : null;
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: window.innerWidth <= 700 ? "start" : "center" });
            el.classList.add("checklistPointFocus");
            window.setTimeout(() => el.classList.remove("checklistPointFocus"), 1800);
          }
        }, 520);
        return;
      }
      if (item.id === "avvik-apne") {
        openActiveDeviations();
        return;
      }
      goToTab(item.tab);
    };
    const warrantyReadiness = (0, import_react.useMemo)(() => {
      const utførendeSigned = hasValue(overtagelse?.signUtførende) || hasValue(overtagelse?.signUtførendeImage);
      const kundeSigned = hasValue(overtagelse?.signKunde) || hasValue(overtagelse?.signKundeImage);
      const overtagelseSigned = utførendeSigned && kundeSigned;
      const openDeviationCount = getOpenDeviationCount(checklist);
      const selectedSystem = soproWarrantySystems.find((item) => item.id === warranty?.system);
      const approvedSoproSystemSelected = !!selectedSystem;
      const checklistValues = Object.values(checklist || {}).flatMap((items) => Object.values(items || {}));
      const checklistTotal = activeChecklistTemplate.reduce((sum, group) => sum + (group.items || []).length, 0);
      const checklistDone = activeChecklistTemplate.reduce((sum, group) => {
        return sum + (group.items || []).filter((item) => hasValue(checklist?.[group.category]?.[item]?.status)).length;
      }, 0);
      const checklistComplete = checklistTotal > 0 && checklistDone >= checklistTotal;
      const systemPointStatus = getSoproWarrantyPointStatus(checklist, warranty?.system);
      const dynamicPointStatus = dynamicSoproWarrantyRequirementStatus;
      const systemChecklistTemplate = getSoproChecklistTemplate(warranty?.system);
      const systemChecklistTotal = systemPointStatus.total + dynamicPointStatus.total;
      const systemChecklistDone = systemPointStatus.done + dynamicPointStatus.done;
      const systemChecklistComplete = !approvedSoproSystemSelected ? false : systemPointStatus.complete && dynamicPointStatus.complete;
      const hasPhotos = (photos || []).some((photo) => hasValue(photo?.url));
      const reportGenerated = !!warranty?.reportGeneratedAt;
      const termsAccepted = !!warranty?.termsAccepted || (!!warranty?.enabled && overtagelseSigned);
      const missing = [];
      if (!termsAccepted) missing.push(`Kunde må bekrefte mottak og aksept av garantivilkår ${getWarrantyYears(warranty)} år.`);
      if (!overtagelseSigned) missing.push("Overtagelse må være aktivert og signert av både utførende og kunde.");
      if (openDeviationCount > 0) missing.push("Alle åpne avvik må lukkes før garanti kan utstedes.");
      if (!checklistComplete) missing.push("Alle ordinære sjekklister og systemspesifikke Sopro-punkter må ha status.");
      if (approvedSoproSystemSelected && !systemChecklistComplete) missing.push("Alle kontrollpunkter for valgt Sopro-system og valgte Sopro-produkter må være fullført.");
      dynamicPointStatus.missing.forEach((message) => missing.push(message));
      if (!hasPhotos) missing.push("Bildedokumentasjon må være lastet opp.");
      if (!approvedSoproSystemSelected) missing.push("Godkjent Sopro-system må velges.");
      // For garantiprosjekter skal garantien kunne utstedes før komplett PDF genereres,
      // slik at garantibevis og garantivilkår faktisk kommer med i den nedlastede rapporten.
      return {
        overtagelseSigned,
        openDeviationCount,
        checklistTotal,
        checklistDone,
        checklistComplete,
        systemChecklistTotal,
        systemChecklistDone,
        systemChecklistComplete,
        systemChecklistPercent: systemChecklistTotal ? Math.round(systemChecklistDone / systemChecklistTotal * 100) : systemPointStatus.percent,
        missingSystemChecklistPoints: [...systemPointStatus.missing, ...dynamicPointStatus.points.filter((point) => !point.done)],
        systemChecklistPoints: [...systemPointStatus.points, ...dynamicPointStatus.points],
        hasPhotos,
        reportGenerated,
        termsAccepted,
        approvedSoproSystemSelected,
        selectedSystem,
        missing,
        ready: missing.length === 0
      };
    }, [overtagelse, checklist, photos, warranty, activeChecklistTemplate, dynamicSoproWarrantyRequirementStatus]);
    const issueWarranty = async () => {
      if (isProjectLocked) return alert("Prosjektet er låst og fungerer som arkiv. Garanti kan ikke utstedes eller endres etter låsing.");
      if (!warranty?.enabled) return alert("Aktiver garantien først.");
      if (warranty?.issued && warranty?.guaranteeNumber) return alert(`Garantien er allerede utstedt med garantinummer ${warranty.guaranteeNumber}.`);
      if (!warrantyReadiness.ready) return alert("Garantien kan ikke utstedes ennå. Se listen over mangler.");
      const selectedSystem = warrantyReadiness.selectedSystem;
      const issuedAt = (/* @__PURE__ */ new Date()).toISOString();
      const warrantyYears = getWarrantyYears(warranty);
      const validUntil = makeWarrantyValidUntil(overtagelse?.dato || project?.date || "", warranty);
      let guaranteeNumber = warranty?.guaranteeNumber || "";
      let registrySaved = false;
      let registryErrorMessage = "";
      for (let attempt = 0; attempt < 10 && !registrySaved; attempt += 1) {
        guaranteeNumber = guaranteeNumber || makeWarrantyNumber();
        const { error } = await supabase.from("warranty_registry").insert({
          guarantee_number: guaranteeNumber,
          project_id: projectId || null,
          project_name: project.projectName || project.address || "",
          customer_name: project.customer || "",
          property_address: [project.address, project.postnr, project.city].filter(Boolean).join(", "),
          company_name: name || company.companyName || "",
          company_orgnr: company.orgNumber || "",
          sopro_system: selectedSystem?.product || "",
          sintef_tg: selectedSystem?.sintefApproval || "",
          warranty_period_years: warrantyYears,
          issued_at: issuedAt,
          valid_until: validUntil,
          status: "issued",
          pdf_generated: !!warranty?.reportGeneratedAt
        });
        if (!error) {
          registrySaved = true;
          break;
        }
        registryErrorMessage = error.message || String(error);
        if (error.code === "23505" || /duplicate|unique/i.test(registryErrorMessage)) {
          guaranteeNumber = "";
          continue;
        }
        break;
      }
      if (!registrySaved) return alert("Kunne ikke registrere garantien i garantiregisteret. Garantien er ikke utstedt. Feil: " + registryErrorMessage);
      const nextWarranty = {
        ...emptyWarranty(),
        ...warranty,
        enabled: true,
        issued: true,
        issuedAt,
        system: selectedSystem?.id || warranty.system,
        sintefApproval: selectedSystem?.sintefApproval || warranty.sintefApproval || "",
        durationYears: warrantyYears,
        guaranteeNumber,
        status: "issued"
      };
      setWarranty(nextWarranty);

      let projectSaved = false;
      let projectSaveError = "";
      if (projectId) {
        try {
          const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
          if (fetchError || !existing) {
            projectSaveError = fetchError?.message || "Fant ikke prosjekt";
          } else {
            const existingData = dataFromRow(existing);
            const existingProject = existingData.project || {};
            const nextData = JSON.parse(JSON.stringify({
              ...existingData,
              company,
              user,
              project: {
                ...emptyProject(),
                ...existingProject,
                ...project,
                locked: existing.locked === true || existingProject.locked === true || project.locked === true,
                status: existing.locked === true || existingProject.locked === true || project.locked === true ? "locked" : project.status || existingProject.status || "active",
                lockedAt: existing.locked_at || existingProject.lockedAt || project.lockedAt || "",
                lockedBy: existing.locked_by || existingProject.lockedBy || project.lockedBy || ""
              },
              checked,
              productDocs,
              manualProducts,
              other,
              surf,
              bathroomEquipment,
              photos,
              access,
              inst,
              files,
              checklist,
              tilbud,
              overtagelse,
              warranty: nextWarranty,
              projectLog,
              internalNotes
            }));
            const { data: updatedRow, error: updateError } = await supabase.from("projects").update({
              data: nextData,
              title: project.projectName || project.address || existing.title || "Uten navn",
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            }).eq("id", projectId).select("*").maybeSingle();
            if (updateError) {
              projectSaveError = updateError.message || String(updateError);
            } else {
              projectSaved = true;
              if (updatedRow) {
                unpackData(dataFromRow(updatedRow), true);
                setProjectId(updatedRow.id);
              }
              await loadProjects(authUser);
            }
          }
        } catch (error) {
          projectSaveError = error?.message || String(error);
        }
      }

      if (projectId && !projectSaved) {
        alert(`✔ Garantien er registrert i garantiregisteret med garantinummer ${guaranteeNumber}, men den ble ikke lagret tilbake på prosjektet automatisk. Feil: ${projectSaveError}. Lås opp prosjektet, trykk Oppdater prosjekt, og kontakt support hvis garantidokumentet fortsatt ikke vises.`);
      } else {
        alert(`✔ ${warrantyYears} års dokumentert tetthetsgaranti er registrert, utstedt og lagret på prosjektet med garantinummer ${guaranteeNumber}. Last nå ned komplett PDF, slik at garantibevis og garantivilkår blir med i rapporten.`);
      }
    };
    const currentStatus = projectStatusInfo(project, overtagelse, projectGuideStats.openDeviationCount);
    const suggestedWorkflowStatus = projectGuideStats.openDeviationCount > 0 ? "Avvik åpent" : projectGuideStats.hasOvertagelse ? "Ferdigstilt" : projectGuideStats.productCount > 0 && projectGuideStats.photoCount > 0 && projectGuideStats.checklistDone > 0 ? "Klar for kunde" : projectGuideStats.hasProjectBasics ? "Pågår" : "Utkast";
    const openActiveDeviations = () => {
      setShowOpenDeviationsOnly(true);
      goToTab("sjekklister");
      setTimeout(() => {
        const checklistSection = document.querySelector(".activeDeviationFocus") || document.querySelector(".checklistAccordion");
        if (checklistSection) checklistSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 140);
    };
    const rowIsLocked = (row) => row?.locked === true || row?.locked === "true" || projectIsLocked(row?.data?.project || {});
    const projectFromRow = (row, fallbackProject = project) => {
      const dataProject = row?.data?.project || {};
      const lockedValue = rowIsLocked(row);
      return {
        ...emptyProject(),
        ...dataProject,
        ...fallbackProject,
        locked: lockedValue,
        status: lockedValue ? "locked" : dataProject.status || fallbackProject.status || "active",
        lockedAt: row?.locked_at || dataProject.lockedAt || fallbackProject.lockedAt || "",
        lockedBy: row?.locked_by || dataProject.lockedBy || fallbackProject.lockedBy || ""
      };
    };
    const dataFromRow = (row, fallbackData = {}) => ({
      ...row?.data || fallbackData || {},
      project: projectFromRow(row, (row?.data || fallbackData || {}).project || emptyProject())
    });
    const normalizeSearchText = (value = "") => String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/æ/g, "ae")
      .replace(/ø/g, "o")
      .replace(/å/g, "a")
      .replace(/Æ/g, "ae")
      .replace(/Ø/g, "o")
      .replace(/Å/g, "a")
      .toLowerCase();
    const compactSearchText = (value = "") => normalizeSearchText(value).replace(/[\s.\-+()_/:;,]/g, "");
    const makeSearchableText = (values = []) => {
      const raw = values.filter((value) => value !== null && value !== void 0 && value !== false).map((value) => {
        if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
        try { return JSON.stringify(value); } catch { return String(value); }
      }).filter(Boolean).join(" ");
      const normalized = normalizeSearchText(raw);
      const compact = compactSearchText(raw);
      return `${normalized} ${compact}`;
    };
    const projectMatchesSearch = (searchable = "", searchTerm = "") => {
      const normalizedTerm = normalizeSearchText(searchTerm).trim();
      if (!normalizedTerm) return true;
      const compactTerm = compactSearchText(searchTerm);
      const terms = normalizedTerm.split(/\s+/).filter(Boolean);
      const compactTerms = terms.map(compactSearchText).filter(Boolean);
      return terms.every((term, index) => searchable.includes(term) || (compactTerms[index] && searchable.includes(compactTerms[index]))) || (!!compactTerm && searchable.includes(compactTerm));
    };
    const projectListRows = (0, import_react.useMemo)(() => {
      return (projects || []).map((row) => {
        const data = row.data || {};
        const listWarranty = { ...emptyWarranty(), ...data.warranty || {} };
        const listProject = projectFromRow(row, data.project || {});
        const listStatus = projectStatusInfo(listProject, data.overtagelse || {}, getOpenDeviationCount(data.checklist));
        const listLog = normalizeProjectLog(data.projectLog);
        const messages = listLog.messages || [];
        const unreadForAdminInList = messages.filter((m) => m.role === "kunde" && (!listLog.lastReadByAdmin || (m.created || "") > listLog.lastReadByAdmin)).length;
        const latestMessage = messages.length ? messages[messages.length - 1] : null;
        const openDeviationCount = getOpenDeviationCount(data.checklist);
        const checkedProductCount = Object.values(data.checked || {}).filter(Boolean).length;
        const manualProductCount = Object.values(normalizeManualProductsBySection(data.manualProducts || {})).flat().filter((p) => hasValue(p?.name) || hasValue(p?.fdvUrl) || hasValue(p?.comment)).length;
        const productSummary = {
          total: checkedProductCount + manualProductCount,
          standard: checkedProductCount,
          manual: manualProductCount
        };
        const photoImages = Array.isArray(data.photos) ? data.photos.filter((photo) => photo?.url).map((photo) => ({
          url: photo.url,
          label: photo.cat || photo.name || "Prosjektbilde",
          source: "Bilder"
        })) : [];
        const checklistImages = [];
        Object.entries(data.checklist || {}).forEach(([category, items]) => {
          Object.entries(items || {}).forEach(([item, value]) => {
            (value?.photos || []).forEach((photo) => {
              if (photo?.url) checklistImages.push({
                url: photo.url,
                label: `${category} \xB7 ${item}`,
                source: "Sjekkliste"
              });
            });
          });
        });
        const installImages = [];
        (Array.isArray(data.inst) ? data.inst : []).forEach((entry) => {
          (entry?.photos || []).forEach((photo) => {
            if (photo?.url) installImages.push({
              url: photo.url,
              label: entry.name || entry.category || photo.name || "Fag/utstyr",
              source: "Fag/utstyr"
            });
          });
        });
        const chatImages = messages.filter((message) => message?.imageUrl).map((message) => ({
          url: message.imageUrl,
          label: message.imageName || message.text || "Chatbilde",
          source: "Chat"
        }));
        const allProjectImages = [...photoImages, ...checklistImages, ...installImages, ...chatImages];
        const imageSummary = {
          total: allProjectImages.length,
          photos: photoImages.length,
          checklist: checklistImages.length,
          install: installImages.length,
          chat: chatImages.length,
          previews: allProjectImages.slice(0, 4)
        };
        const projectCompanyName = projectCompanyNameFromRow(row) || data?.company?.companyName || data?.company?.company_name || "";
        const ownerProfile = (adminUsers || []).find((userRow) => userRow?.id === row.user_id) || {};
        const projectOwnerEmail = ownerProfile?.email || row?.data?.user?.email || row?.user?.email || "";
        const searchableValues = [
          row.id,
          row.title,
          row.user_id,
          row.created_at,
          row.updated_at,
          projectCompanyName,
          data?.company,
          data?.user,
          ownerProfile?.email,
          ownerProfile?.company_name,
          ownerProfile?.company_role,
          ownerProfile?.phone,
          ownerProfile?.address,
          listProject,
          listProject.projectName,
          listProject.customer,
          listProject.address,
          listProject.city,
          listProject.postnr,
          listProject.customerEmail,
          listProject.customerPhone,
          listProject.responsible,
          listProject.notes,
          listProject.projectDescription,
          listWarranty?.enabled ? `garanti ${getWarrantyYears(listWarranty)} år` : "",
          listWarranty?.guaranteeNumber || "",
          listWarranty?.sintefApproval || "",
          listWarranty?.system || "",
          data?.surf || {},
          data?.bathroomEquipment || {},
          data?.access || [],
          data?.inst || [],
          data?.checked || {},
          data?.productDocs || {},
          data?.manualProducts || {},
          data?.other || {},
          data?.files || [],
          data?.tilbud || {},
          data?.projectLog || {}
        ];
        const searchable = makeSearchableText(searchableValues);
        return { row, listProject, listStatus, listLog, unreadForAdminInList, latestMessage, imageSummary, openDeviationCount, productSummary, listWarranty, searchable, projectCompanyName, projectOwnerEmail };
      });
    }, [projects, adminUsers]);
    const ordinaryProjectListRows = (0, import_react.useMemo)(() => {
      if (!isSystemAdminUser) return projectListRows;
      return (projectListRows || []).filter((item) => projectBelongsToCurrentCompanyForProjectList(item?.row));
    }, [projectListRows, isSystemAdminUser, authUser?.id, profile?.company_name, currentCompanyName]);
    const filteredProjectListRows = (0, import_react.useMemo)(() => {
      return ordinaryProjectListRows.filter((item) => {
        if (!projectMatchesSearch(item.searchable, projectSearch)) return false;
        if (projectUnreadOnly && item.unreadForAdminInList <= 0) return false;
        if (projectStatusFilter !== "alle" && item.listStatus.tone !== projectStatusFilter) return false;
        return true;
      });
    }, [ordinaryProjectListRows, projectSearch, projectStatusFilter, projectUnreadOnly]);
    const activeMobileProjectRows = (0, import_react.useMemo)(() => {
      return filteredProjectListRows.filter((item) => item.listStatus.tone !== "done" && item.listStatus.tone !== "locked");
    }, [filteredProjectListRows]);
    const projectListStats = (0, import_react.useMemo)(() => {
      const total = ordinaryProjectListRows.length;
      const unread = ordinaryProjectListRows.reduce((sum, item) => sum + item.unreadForAdminInList, 0);
      const active = ordinaryProjectListRows.filter((item) => item.listStatus.tone === "progress" || item.listStatus.tone === "open").length;
      const finished = ordinaryProjectListRows.filter((item) => item.listStatus.tone === "done" || item.listStatus.tone === "locked").length;
      return { total, unread, active, finished, visible: filteredProjectListRows.length };
    }, [ordinaryProjectListRows, filteredProjectListRows]);
    const registeredCompanyOptions = (0, import_react.useMemo)(() => {
      const companies = new Map();
      const addCompany = (value) => {
        const clean = String(value || "").trim();
        if (!clean) return;
        companies.set(clean.toLowerCase(), clean);
      };
      (adminUsers || []).forEach((u) => addCompany(u?.company_name));
      (projectListRows || []).forEach((item) => {
        const dataCompany = item?.row?.data?.company || {};
        addCompany(dataCompany.companyName || dataCompany.company_name || item?.listProject?.companyName);
      });
      addCompany(profile?.company_name);
      addCompany(company?.companyName);
      return ["", ...Array.from(companies.values()).sort((a, b) => a.localeCompare(b, "no"))];
    }, [adminUsers, projectListRows, profile?.company_name, company?.companyName]);
    const supportCompanies = (0, import_react.useMemo)(() => {
      const map = new Map();
      const ensure = (companyName) => {
        const clean = String(companyName || "").trim();
        if (!clean) return null;
        const key = clean.toLowerCase();
        if (!map.has(key)) map.set(key, { name: clean, users: 0, projects: 0, activeProjects: 0, unread: 0, latestUpdated: "" });
        return map.get(key);
      };
      (adminUsers || []).forEach((u) => {
        const entry = ensure(u?.company_name);
        if (entry) entry.users += 1;
      });
      (projectListRows || []).forEach((item) => {
        const dataCompany = item?.row?.data?.company || {};
        const entry = ensure(dataCompany.companyName || dataCompany.company_name || item?.listProject?.companyName);
        if (!entry) return;
        entry.projects += 1;
        if (item?.listStatus?.tone !== "done" && item?.listStatus?.tone !== "locked") entry.activeProjects += 1;
        entry.unread += Number(item?.unreadForAdminInList || 0);
        const updated = item?.row?.updated_at || "";
        if (updated > entry.latestUpdated) entry.latestUpdated = updated;
      });
      const term = String(supportCompanySearch || "").trim().toLowerCase();
      return Array.from(map.values())
        .filter((entry) => !term || entry.name.toLowerCase().includes(term))
        .sort((a, b) => (b.latestUpdated || "").localeCompare(a.latestUpdated || "") || a.name.localeCompare(b.name, "no"));
    }, [adminUsers, projectListRows, supportCompanySearch]);
    const supportProjects = (0, import_react.useMemo)(() => {
      const selectedCompany = normalizeSearchText(supportSelectedCompany).trim();
      return (projectListRows || []).filter((item) => {
        const companyName = normalizeSearchText(item?.projectCompanyName || "").trim();
        if (selectedCompany && companyName !== selectedCompany) return false;
        return projectMatchesSearch(item.searchable, supportProjectSearch);
      }).slice(0, 120);
    }, [projectListRows, supportProjectSearch, supportSelectedCompany]);
    const currentSupportProjectRow = (0, import_react.useMemo)(() => {
      if (!supportModeExplicit || !isSystemAdminUser || !projectId || !currentProjectOwnerId || currentProjectOwnerId === authUser?.id) return null;
      return (projectListRows || []).find((item) => item?.row?.id === projectId) || null;
    }, [supportModeExplicit, isSystemAdminUser, projectId, currentProjectOwnerId, authUser?.id, projectListRows]);
    const isSupportModeActive = !!currentSupportProjectRow;
    const supportProjectCompanyName = String(
      currentSupportProjectRow?.row?.data?.company?.companyName ||
      currentSupportProjectRow?.row?.data?.company?.company_name ||
      company?.companyName ||
      ""
    ).trim();
    const supportProjectOwner = (adminUsers || []).find((entry) => entry?.id === currentProjectOwnerId);
    const exitSupportMode = () => {
      if (!isSupportModeActive) return;
      setProject(emptyProject());
      setChecked({});
      setProductDocs({});
      setManualProducts({});
      setOther({});
      setSurf({});
      setBathroomEquipment(emptyBathroomEquipment());
      setPhotos([]);
      setAccess([]);
      setInst([]);
      setFiles([]);
      setChecklist({});
      setTilbud(emptyTilbud());
      setOvertagelse(emptyOvertagelse());
      setWarranty(emptyWarranty());
      setProjectLog(emptyProjectLog());
      setInternalNotes("");
      setProjectId(null);
      setCurrentProjectOwnerId("");
      setSupportModeExplicit(false);
      setProjectSearch("");
      setProjectStatusFilter("alle");
      setProjectUnreadOnly(false);
      setMobileCreatingProject(false);
      setLocalDraftRestoreChecked(false);
      setShowOpenDeviationsOnly(false);
      if (profile) applyProfile(profile);
      setOpenAdminSections((prev) => ({ ...prev || {}, support: true }));
      setTab("admin");
      setTimeout(() => scrollToMobileTabTarget("admin"), 120);
    };
    const mobileHomeStats = (0, import_react.useMemo)(() => {
      const active = ordinaryProjectListRows.filter((item) => item.listStatus.tone !== "done" && item.listStatus.tone !== "locked").length;
      const deviations = ordinaryProjectListRows.filter((item) => item.openDeviationCount > 0).length;
      const unreadProjects = ordinaryProjectListRows.filter((item) => item.unreadForAdminInList > 0).length;
      const readyForCustomer = ordinaryProjectListRows.filter((item) => item.listStatus.tone === "customer_ready").length;
      return { active, deviations, unreadProjects, readyForCustomer };
    }, [ordinaryProjectListRows]);
    const tabs = [
      ["prosjekt", "Startside"],
      ["prosjektinfo", "Prosjektinformasjon/beskrivelse"],
      ["garanti", warranty?.issued ? "Garanti ✓" : "Garanti"],
      ["firma", "Firmaprofil"],
      ...isCompanyAdminUser ? [["firmaadmin", "Firma"]] : [],
      ["prosjektering", "Prosjektering"],
      ["produkter", "Produkter"],
      ["overflater", "Overflater og innredning"],
      ["bilder", "Bilder"],
      ["tilgang", "Tilgang"],
      ["installasjoner", "Fag/utstyr"],
      ["sjekklister", "Sjekklister"],
      ["tilbud", "Tilbud/kontrakt"],
      ["chat", unreadForAdmin > 0 ? `Chat (${unreadForAdmin} ulest)` : totalChatCount > 0 ? `Chat (${totalChatCount})` : "Chat"],
      ["internt", "Interne notater"],
      ["overtagelse", "Overtagelse"],
      ["prosjektliste", "Prosjektliste"],
      ["rapport", "Rapport"],
      ["hjelp", "Hjelp"],
      ...canUseAdminProjectSync ? [["admin", "Systemadmin"]] : []
    ];
    const currentTabIndex = tabs.findIndex(([id]) => id === tab);
    const previousTab = currentTabIndex > 0 ? tabs[currentTabIndex - 1] : null;
    const nextTab = currentTabIndex >= 0 && currentTabIndex < tabs.length - 1 ? tabs[currentTabIndex + 1] : null;
    const scrollToMobileTabTarget = (id) => {
      if (!id) return;
      if (typeof window === "undefined" || typeof document === "undefined") return;
      if (window.innerWidth > 700) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const targetMap = {
        prosjekt: ".mobileCurrentProjectBar, .desktopOnlyWhenNoProject section, main",
        prosjektinfo: ".projectInfoSection, section, main",
        garanti: ".warrantyStatusCard, section, main",
        firma: ".logoBox, section, main",
        firmaadmin: ".companyAdminQuickStart, section, main",
        prosjektering: ".prosjekteringSection, section, main",
        produkter: ".productQuickStart, .checklistList, section, main",
        overflater: ".bathroomEquipmentQuickStart, section, main",
        bilder: ".imageUploadTiles, .photos, section, main",
        tilgang: ".accessQuickStart, section, main",
        installasjoner: ".installQuickStart, section, main",
        sjekklister: ".checklistSummaryCard, .checklistAccordion, section, main",
        tilbud: ".contractQuickStart, section, main",
        overtagelse: ".handoverQuickStart, section, main",
        chat: ".chatQuickStart, .chatMessages, section, main",
        internt: ".internalNotesQuickStart, section, main",
        prosjektliste: ".projectListToolbar, .projectListCard, section, main",
        rapport: ".report, section, main",
        hjelp: ".helpQuickStart, section, main",
        admin: ".adminQuickStart, section, main"
      };
      const selector = targetMap[id] || "main";
      const target = selector.split(",").map((part) => document.querySelector(part.trim())).find(Boolean) || document.querySelector("main");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const goToTab = (id) => {
      if (!id) return;
      setTab(id);
      setTimeout(() => scrollToMobileTabTarget(id), 90);
      setTimeout(() => scrollToMobileTabTarget(id), 320);
    };
    const appendProjectDescriptionTemplate = (templateText) => {
      const currentText = project.projectDescription || "";
      const separator = currentText.trim() ? "\n\n" : "";
      setProject({ ...project, projectDescription: `${currentText}${separator}${templateText}` });
    };
    const buildProjectSnapshot = (override = {}) => ({
      company: override.company || company,
      user: override.user || user,
      project: override.project || project,
      checked: override.checked || checked,
      productDocs: override.productDocs || productDocs,
      manualProducts: override.manualProducts || manualProducts,
      other: override.other || other,
      surf: override.surf || surf,
      bathroomEquipment: override.bathroomEquipment || bathroomEquipment,
      photos: override.photos || photos,
      access: override.access || access,
      inst: override.inst || inst,
      files: override.files || files,
      checklist: override.checklist || checklist,
      tilbud: override.tilbud || tilbud,
      overtagelse: override.overtagelse || overtagelse,
      warranty: override.warranty || warranty,
      projectLog: override.projectLog || projectLog,
      internalNotes: override.internalNotes || internalNotes
    });
    const packData = () => buildProjectSnapshot();
    const hasMeaningfulProjectDraftContent = (snapshot = buildProjectSnapshot()) => {
      const p = snapshot.project || {};
      return !!(
        p.projectName || p.address || p.postnr || p.city || p.customer || p.customerEmail || p.customerPhone || p.notes || p.projectDescription ||
        p.fall || p.fallDusj || p.fallUtenfor || p.sluk || p.terskel || p.membran || p.prosjekteringKommentar ||
        Object.keys(snapshot.checked || {}).length || Object.keys(snapshot.productDocs || {}).length ||
        Object.values(normalizeManualProductsBySection(snapshot.manualProducts || {})).some((list) => (list || []).some((item) => hasValue(item?.name) || hasValue(item?.fdvUrl) || hasValue(item?.comment))) ||
        Object.keys(snapshot.other || {}).length || Object.keys(snapshot.surf || {}).length || Object.values(snapshot.bathroomEquipment || {}).some(hasValue) ||
        (snapshot.photos || []).length || (snapshot.access || []).length || (snapshot.inst || []).length || (snapshot.files || []).length ||
        Object.keys(snapshot.checklist || {}).length || snapshot.tilbud?.enabled || hasValue(snapshot.tilbud?.tillegg) || hasValue(snapshot.tilbud?.fradrag) || hasValue(snapshot.tilbud?.kommentar) || (snapshot.tilbud?.files || []).length ||
        snapshot.overtagelse?.enabled || hasValue(snapshot.overtagelse?.kommentar) || hasValue(snapshot.overtagelse?.signUtførende) || hasValue(snapshot.overtagelse?.signKunde) || hasValue(snapshot.overtagelse?.signUtførendeImage) || hasValue(snapshot.overtagelse?.signKundeImage) ||
        snapshot.warranty?.enabled || snapshot.warranty?.issued || hasValue(snapshot.warranty?.system) ||
        snapshot.projectLog?.enabled || hasValue(snapshot.projectLog?.draft) || (snapshot.projectLog?.messages || []).length || hasValue(snapshot.internalNotes)
      );
    };
    const localDraftStorageKey = (id = projectId) => authUser?.id ? `expoProffDokDraft:${authUser.id}:${id || "new"}` : "";
    const isSupportProjectDraft = (id = projectId, ownerId = currentProjectOwnerId) => {
      if (!isSystemAdminUser || !authUser?.id || !id) return false;
      return !!ownerId && ownerId !== authUser.id;
    };
    const shouldSkipLocalDraftForSupport = (id = projectId, ownerId = currentProjectOwnerId) => isSupportProjectDraft(id, ownerId);
    const saveLocalDraftNow = (snapshot = latestStateRef.current || buildProjectSnapshot()) => {
      if (!authUser || isReadOnly || !profile?.approved) return;
      if (shouldSkipLocalDraftForSupport(projectId, currentProjectOwnerId)) {
        setProjectAutoSaveStatus("Supportprosjekt – lokal kladd er ikke lagret");
        return;
      }
      if (!projectId && !mobileCreatingProject && !hasMeaningfulProjectDraftContent(snapshot)) return;
      const key = localDraftStorageKey(projectId);
      if (!key) return;
      try {
        window.localStorage.setItem(key, JSON.stringify({
          savedAt: (/* @__PURE__ */ new Date()).toISOString(),
          projectId: projectId || null,
          projectOwnerId: currentProjectOwnerId || authUser?.id || "",
          projectCompanyName: snapshot?.company?.companyName || "",
          projectTitle: snapshot?.project?.projectName || snapshot?.project?.address || "Uten navn",
          mobileCreatingProject: !!mobileCreatingProject,
          data: snapshot
        }));
        setProjectAutoSaveStatus(`Lagret lokalt ${(/* @__PURE__ */ new Date()).toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" })}`);
      } catch (error) {
        console.warn("Lokal nødlagring feilet:", error);
        setProjectAutoSaveStatus("Kunne ikke lagre lokalt");
      }
    };
    const clearLocalDraft = (id = projectId) => {
      if (!authUser?.id) return;
      try {
        window.localStorage.removeItem(`expoProffDokDraft:${authUser.id}:${id || "new"}`);
      } catch (error) {
        console.warn("Kunne ikke fjerne lokal kladd:", error);
      }
    };
    const localDraftIsNewerThanCloud = (saved = {}) => {
      if (!saved?.projectId || !saved?.savedAt) return false;
      const cloudRow = (projects || []).find((row) => row.id === saved.projectId);
      if (!cloudRow?.updated_at) return true;
      const localTime = new Date(saved.savedAt).getTime();
      const cloudTime = new Date(cloudRow.updated_at).getTime();
      if (!Number.isFinite(localTime) || !Number.isFinite(cloudTime)) return false;
      return localTime > cloudTime + 3e4;
    };
    const localDraftHasProjectIdentity = (saved = {}) => {
      const p = saved?.data?.project || {};
      return [p.projectName, p.address, p.customer, p.customerEmail, p.customerPhone].some(hasValue);
    };
    const shouldPromptForLocalDraftRestore = (saved = {}) => {
      if (!saved?.data || !hasMeaningfulProjectDraftContent(saved.data)) return false;
      if (!saved.projectId) return localDraftHasProjectIdentity(saved);
      return localDraftIsNewerThanCloud(saved);
    };
    const unpackData = (data, preserveDraft = false) => {
      setCompany(data.company || { companyName: "Expo Proffsenter", address: "", orgNumber: "", phone: "", email: "", website: "", logoUrl: "" });
      setUser(data.user || { name: "", email: "", role: "Eier / administrator" });
      setProject({ ...emptyProject(), ...data.project || {} });
      setChecked(data.checked || {});
      setProductDocs(data.productDocs || {});
      if (Array.isArray(data.manualProducts)) {
        const migratedManual = {};
        data.manualProducts.forEach((p) => {
          const section = p.trade || "Andre produkter";
          migratedManual[section] = [...migratedManual[section] || [], { ...p, trade: void 0 }];
        });
        setManualProducts(migratedManual);
      } else {
        setManualProducts(data.manualProducts || {});
      }
      setOther(data.other || {});
      setSurf(data.surf || {});
      setBathroomEquipment(data.bathroomEquipment || emptyBathroomEquipment());
      setPhotos(data.photos || []);
      setAccess(data.access || []);
      setInst(data.inst || []);
      setFiles(data.files || []);
      setChecklist(data.checklist || {});
      setTilbud(data.tilbud || emptyTilbud());
      setOvertagelse(data.overtagelse || emptyOvertagelse());
      setWarranty({ ...emptyWarranty(), ...data.warranty || {} });
      const incomingLog = normalizeProjectLog(data.projectLog);
      setProjectLog((prev) => ({
        ...incomingLog,
        draft: preserveDraft ? prev?.draft || "" : incomingLog.draft || ""
      }));
      setInternalNotes(data.internalNotes || "");
    };
    const autoSaveProjectToCloud = async (snapshot = latestStateRef.current || buildProjectSnapshot()) => {
      if (!authUser || !projectId || isReadOnly || isProjectLocked) return;
      setProjectAutoSaveStatus("Autolagrer …");
      try {
        const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
        if (fetchError || !existing) {
          console.warn("Autolagring prosjekt feilet:", fetchError?.message || "Fant ikke prosjekt");
          setProjectAutoSaveStatus("Kunne ikke autolagre");
          return;
        }
        if (rowIsLocked(existing)) {
          setProjectAutoSaveStatus("Prosjektet er låst – ikke autolagret");
          return;
        }
        const existingData = dataFromRow(existing);
        const projectForSave = { ...emptyProject(), ...existingData.project || {}, ...snapshot.project || {}, locked: false, status: "active", lockedAt: "", lockedBy: "" };
        const cleanData = JSON.parse(JSON.stringify({
          ...existingData,
          company: snapshot.company,
          user: snapshot.user,
          project: projectForSave,
          checked: snapshot.checked,
          productDocs: snapshot.productDocs,
          manualProducts: snapshot.manualProducts,
          other: snapshot.other,
          surf: snapshot.surf,
          bathroomEquipment: snapshot.bathroomEquipment,
          photos: snapshot.photos,
          access: snapshot.access,
          inst: snapshot.inst,
          files: snapshot.files,
          checklist: snapshot.checklist,
          tilbud: snapshot.tilbud,
          overtagelse: snapshot.overtagelse,
          warranty: snapshot.warranty,
          projectLog: { ...normalizeProjectLog(snapshot.projectLog), draft: snapshot.projectLog?.draft || "" },
          internalNotes: snapshot.internalNotes
        }));
        const { error: updateError } = await supabase.from("projects").update({
          data: cleanData,
          title: projectForSave.projectName || projectForSave.address || existing.title || "Uten navn",
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", projectId);
        if (updateError) {
          console.warn("Autolagring prosjekt feilet:", updateError.message);
          setProjectAutoSaveStatus("Kunne ikke autolagre");
          return;
        }
        clearLocalDraft(projectId);
        setProjectAutoSaveStatus(`Autolagret ${(/* @__PURE__ */ new Date()).toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" })}`);
      } catch (error) {
        console.warn("Autolagring prosjekt feilet:", error);
        setProjectAutoSaveStatus("Kunne ikke autolagre");
      }
    };
    const scheduleProjectAutoSave = (snapshot = latestStateRef.current || buildProjectSnapshot(), delay = 1800) => {
      if (!authUser || isReadOnly || !profile?.approved) return;
      if (shouldSkipLocalDraftForSupport(projectId, currentProjectOwnerId)) return;
      if (!projectId && !mobileCreatingProject && !hasMeaningfulProjectDraftContent(snapshot)) return;
      if (localDraftTimerRef.current) window.clearTimeout(localDraftTimerRef.current);
      localDraftTimerRef.current = window.setTimeout(() => saveLocalDraftNow(snapshot), 180);
      if (!projectId || isProjectLocked) return;
      if (cloudAutoSaveTimerRef.current) window.clearTimeout(cloudAutoSaveTimerRef.current);
      cloudAutoSaveTimerRef.current = window.setTimeout(() => autoSaveProjectToCloud(snapshot), delay);
    };
    (0, import_react.useEffect)(() => {
      const snapshot = buildProjectSnapshot();
      scheduleProjectAutoSave(snapshot, 2200);
      return () => {
        if (localDraftTimerRef.current) window.clearTimeout(localDraftTimerRef.current);
        if (cloudAutoSaveTimerRef.current) window.clearTimeout(cloudAutoSaveTimerRef.current);
      };
    }, [company, user, project, checked, productDocs, manualProducts, other, surf, bathroomEquipment, photos, access, inst, files, checklist, tilbud, overtagelse, warranty, projectLog, internalNotes, projectId, currentProjectOwnerId, mobileCreatingProject, authUser?.id, profile?.approved, isReadOnly, isProjectLocked]);
    (0, import_react.useEffect)(() => {
      const handleBeforeUnload = () => saveLocalDraftNow(latestStateRef.current || buildProjectSnapshot());
      const handleVisibilityChange = () => {
        if (document.visibilityState === "hidden") saveLocalDraftNow(latestStateRef.current || buildProjectSnapshot());
      };
      window.addEventListener("beforeunload", handleBeforeUnload);
      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }, [authUser?.id, projectId, currentProjectOwnerId, mobileCreatingProject, isReadOnly, profile?.approved]);
    (0, import_react.useEffect)(() => {
      if (!authUser || !profile?.approved || isReadOnly || localDraftRestoreChecked) return;
      setLocalDraftRestoreChecked(true);
      const keys = [localDraftStorageKey(projectId), localDraftStorageKey(null)].filter(Boolean);
      for (const key of keys) {
        if (restoredDraftKeysRef.current.has(key)) continue;
        restoredDraftKeysRef.current.add(key);
        try {
          const raw = window.localStorage.getItem(key);
          if (!raw) continue;
          const saved = JSON.parse(raw);
          if (!saved?.data || !hasMeaningfulProjectDraftContent(saved.data)) {
            window.localStorage.removeItem(key);
            continue;
          }
          if (!shouldPromptForLocalDraftRestore(saved)) {
            window.localStorage.removeItem(key);
            setProjectAutoSaveStatus("Lokal kladd var allerede lagret i skyen og ble ryddet automatisk");
            continue;
          }

          // Systemadmin jobber ofte i supportmodus på andre firmaers prosjekter.
          // For å unngå lokale kladder fra supportarbeid, forkastes disse automatisk.
          // Prosjektene ligger uansett lagret i skyen.
          if (isSystemAdminUser) {
            window.localStorage.removeItem(key);
            setProjectAutoSaveStatus("Lokal supportkladd ble forkastet automatisk");
            continue;
          }

          // NØD-HOTFIX 11D.8.6:
          // Ikke vis kladd-popup ved innlogging. Cloud-autolagring er hovedlagring.
          // Lokal kladd beholdes som stille nødbackup i aktiv økt, men gamle kladder
          // skal ryddes automatisk og aldri gi svart nettleser-dialog ved oppstart.
          window.localStorage.removeItem(key);
          setProjectAutoSaveStatus("Gammel lokal kladd ryddet automatisk");
          continue;
        } catch (error) {
          console.warn("Kunne ikke lese lokal kladd:", error);
        }
      }
    }, [authUser?.id, profile?.approved, isReadOnly, localDraftRestoreChecked, isSystemAdminUser, projects]);
    const loadProjects = async (currentUser = authUser, notify = false, profileOverride = null) => {
      if (!currentUser) {
        setProjects([]);
        if (notify) alert("Du må være logget inn for å hente prosjektliste.");
        return;
      }

      // FASE 13.9 HOTFIX:
      // Ikke bruk kun React-state for rolle/firma her. Ved innlogging kan profile-state henge ett render
      // etter ensureProfile(), og da ble prosjektlisten først lastet som vanlig bruker (f.eks. 27 prosjekter)
      // før man trykket Oppdater og fikk riktig firma-/systemadminliste (f.eks. 54 prosjekter).
      const effectiveProfile = profileOverride || profile || {};
      const effectiveSystemAdmin = effectiveProfile?.system_role === "systemadmin";
      const effectiveCompanyAdmin = !!effectiveProfile?.approved && !effectiveProfile?.deactivated && (effectiveProfile?.company_role === "firmaadmin" || effectiveSystemAdmin);
      const effectiveCompanyName = String(effectiveProfile?.company_name || "").trim();
      const normalizeCompanyForLoad = (value = "") => String(value || "").trim().toLowerCase();

      let query = supabase.from("projects").select("*").order("updated_at", { ascending: false });
      if (!effectiveSystemAdmin && !effectiveCompanyAdmin) {
        query = query.eq("user_id", currentUser.id);
      }

      const { data, error } = await query;
      if (error) {
        console.error(error);
        return alert("Kunne ikke hente prosjektliste: " + error.message);
      }

      const rows = data || [];
      const filteredRows = effectiveSystemAdmin
        ? rows
        : effectiveCompanyAdmin
          ? rows.filter((row) => {
              if (row.user_id === currentUser.id) return true;
              if (!effectiveCompanyName) return false;
              const rowCompanyName = projectCompanyNameFromRow(row);
              return normalizeCompanyForLoad(rowCompanyName) === normalizeCompanyForLoad(effectiveCompanyName);
            })
          : rows.filter((row) => row.user_id === currentUser.id);

      setProjects(filteredRows);
      if (notify) {
        // FASE 13.11 HOTFIX:
        // For systemadmin ligger alle prosjekter i projects-state slik at Systemadmin → Supportmodus
        // fortsatt kan søke i alle firma. Vanlig Prosjektliste rendrer derimot kun egne/eget firmas
        // prosjekter via ordinaryProjectListRows. Popupen må derfor telle samme scope som vanlig
        // Prosjektliste viser, ikke alle prosjektene som er hentet til supportmodus.
        const ordinaryVisibleRowsForAlert = effectiveSystemAdmin
          ? filteredRows.filter((row) => {
              if (row.user_id === currentUser.id) return true;
              if (!effectiveCompanyName) return false;
              const rowCompanyName = projectCompanyNameFromRow(row);
              return normalizeCompanyForLoad(rowCompanyName) === normalizeCompanyForLoad(effectiveCompanyName);
            })
          : filteredRows;
        const companyText = effectiveCompanyAdmin && effectiveCompanyName ? ` i ${effectiveCompanyName}` : "";
        const count = ordinaryVisibleRowsForAlert.length;
        alert(`Prosjektliste oppdatert${companyText}. Fant ${count} prosjekt${count === 1 ? "" : "er"}.`);
      }
    };

    const openProjectById = async (id, targetTab = "rapport", options = {}) => {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
      if (error || !data) {
        console.error(error);
        return alert("Kunne ikke \xE5pne prosjekt: " + (error?.message || "Fant ikke prosjekt"));
      }
      unpackData(dataFromRow(data));
      setProjectId(data.id);
      setCurrentProjectOwnerId(data.user_id || "");
      setSupportModeExplicit(!!options.supportMode);
      setLocalDraftRestoreChecked(false);
      setMobileCreatingProject(false);
      setShowOpenDeviationsOnly(!!options.showOpenDeviationsOnly);
      setTab(targetTab);
      setTimeout(() => scrollToMobileTabTarget(targetTab), 180);
      setTimeout(() => scrollToMobileTabTarget(targetTab), 420);
      if (options.showOpenDeviationsOnly) {
        setTimeout(() => {
          const checklistSection = document.querySelector(".activeDeviationFocus") || document.querySelector(".checklistAccordion");
          if (checklistSection) checklistSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 350);
      }
    };
    const refreshProjectFromCloud = async (silent = false, fullRefresh = false) => {
      if (!projectId) return;
      const { data, error } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
      if (error || !data) {
        console.error(error);
        if (!silent) alert("Kunne ikke oppdatere prosjektdata: " + (error?.message || "Fant ikke prosjekt"));
        return;
      }
      const cloudData = dataFromRow(data);
      const incomingLog = normalizeProjectLog(cloudData.projectLog);
      const isChatRefresh = !fullRefresh && (silent || tab === "chat" || customerTab === "chat" || isReadOnly);
      if (isChatRefresh) {
        const incomingCount = (incomingLog.messages || []).length;
        setProjectLog((prev) => {
          const currentDraft = prev?.draft || "";
          const currentCount = (prev?.messages || []).length;
          if (incomingCount > currentCount && !silent) {
          }
          return {
            ...incomingLog,
            draft: currentDraft
          };
        });
        lastChatMessageCountRef.current = incomingCount;
        lastChatRefreshAtRef.current = Date.now();
        setProjectId(data.id);
        if (!silent) alert("Chat oppdatert.");
        return;
      }
      unpackData(cloudData, true);
      lastChatMessageCountRef.current = (incomingLog.messages || []).length;
      lastChatRefreshAtRef.current = Date.now();
      setProjectId(data.id);
      if (!silent) alert("Prosjektdata oppdatert.");
    };
    const applyProfile = (row) => {
      if (!row) return;
      setProfile(row);
      setCompany((c) => ({
        ...c,
        companyName: row.company_name || c.companyName || "Expo Proffsenter",
        orgNumber: row.org_number || "",
        address: row.address || "",
        phone: row.phone || "",
        email: row.email || "",
        website: row.website || "",
        logoUrl: row.logo_url || c.logoUrl || ""
      }));
    };
    const ensureProfile = async (sessionUser) => {
      if (!sessionUser) return null;
      setProfileLoading(true);
      let { data, error } = await supabase.from("profiles").select("*").eq("id", sessionUser.id).maybeSingle();
      if (error) {
        console.error(error);
        alert("Kunne ikke hente brukerprofil: " + error.message);
        setProfileLoading(false);
        return null;
      }
      if (!data) {
        const { data: inserted, error: insertError } = await supabase.from("profiles").insert({ id: sessionUser.id, email: sessionUser.email, approved: false }).select("*").single();
        if (insertError) {
          console.error(insertError);
          alert("Kunne ikke opprette brukerprofil: " + insertError.message);
          setProfileLoading(false);
          return null;
        }
        data = inserted;
      }
      try {
        const inviteEmail = String(sessionUser.email || "").trim().toLowerCase();
        if (inviteEmail) {
          const { data: invite } = await supabase.from("company_user_invites").select("*").eq("email", inviteEmail).in("status", ["pending", "active"]).order("created_at", { ascending: false }).limit(1).maybeSingle();
          if (invite?.company_name && (!data.company_name || data.approved === false || data.deactivated === true)) {
            const invitedRole = invite.company_role === "firmaadmin" ? "firmaadmin" : "ansatt";
            const { data: updatedProfile, error: inviteUpdateError } = await supabase.from("profiles").update({
              company_name: invite.company_name,
              company_role: invitedRole,
              approved: true,
              deactivated: false
            }).eq("id", sessionUser.id).select("*").maybeSingle();
            if (!inviteUpdateError && updatedProfile) {
              data = updatedProfile;
              await supabase.from("company_user_invites").update({ status: "accepted", accepted_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", invite.id);
            }
          }
        }
      } catch (inviteError) {
        console.warn("Kunne ikke kontrollere firmainvitasjon:", inviteError);
      }
      applyProfile(data);
      setProfileLoading(false);
      return data;
    };
    const resetToCleanStartPage = () => {
      setTab("prosjekt");
      setSupportCompanySearch("");
      setSupportProjectSearch("");
      setSupportSelectedCompany("");
      setOpenSupportCompany("");
      setSupportModeExplicit(false);
      setProjectSearch("");
      setProjectStatusFilter("alle");
      setProjectUnreadOnly(false);
      setAdminUserSearch("");
      setAdminUserCompanyFilter("");
      setAdminUserFilter("pending");
      setProductMasterSearch("");
      setShowNewProductMasterForm(false);
      setOpenAdminSections({
        dokument: false,
        support: false,
        brukere: false,
        produktmaster: false
      });
      try {
        window.localStorage.removeItem("expoProffDokActiveTab");
        window.localStorage.removeItem("activeTab");
      } catch (error) {
        console.warn("Kunne ikke rydde siste aktive fane:", error);
      }
    };
    const loadTermsAcceptance = async (userId) => {
      if (!userId) {
        setTermsAccepted(false);
        setTermsLoading(false);
        return false;
      }
      setTermsLoading(true);
      setTermsError("");
      try {
        const { data, error } = await supabase
          .from("user_terms_acceptance")
          .select("id,user_id,email,version,accepted_at,user_agent")
          .eq("user_id", userId)
          .eq("version", EXPO_PROFFDOK_TERMS_VERSION)
          .maybeSingle();
        if (error) {
          console.error("Kunne ikke hente brukervilkår:", error);
          setTermsAccepted(false);
          setTermsError("Brukervilkår er ikke klargjort. Kontakt systemadministrator eller kjør SQL-steget for FASE 11D.1.");
          return false;
        }
        const accepted = !!data;
        setTermsAccepted(accepted);
        setTermsAcceptanceRecord(data || null);
        return accepted;
      } catch (error) {
        console.error("Kunne ikke kontrollere brukervilkår:", error);
        setTermsAccepted(false);
        setTermsAcceptanceRecord(null);
        setTermsError("Kunne ikke kontrollere brukervilkår. Prøv å laste siden på nytt.");
        return false;
      } finally {
        setTermsLoading(false);
      }
    };
    const acceptCurrentTerms = async () => {
      if (!authUser?.id) return alert("Du må være logget inn for å godkjenne vilkårene.");
      if (!termsReadConfirmed) return alert("Du må bekrefte at du har lest og forstått vilkårene før du kan fortsette.");
      setTermsAccepting(true);
      setTermsError("");
      try {
        const acceptedAt = (/* @__PURE__ */ new Date()).toISOString();
        const acceptancePayload = {
          user_id: authUser.id,
          email: authUser.email || profile?.email || "",
          version: EXPO_PROFFDOK_TERMS_VERSION,
          accepted_at: acceptedAt,
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent : ""
        };
        const { error } = await supabase.from("user_terms_acceptance").upsert(acceptancePayload, { onConflict: "user_id,version" });
        if (error) {
          console.error("Kunne ikke lagre godkjenning av vilkår:", error);
          setTermsError("Kunne ikke lagre godkjenning. Prøv igjen eller kontakt systemadministrator.");
          return;
        }
        setTermsAccepted(true);
        setTermsAcceptanceRecord(acceptancePayload);
        setTermsReadConfirmed(false);
        resetToCleanStartPage();
        if (authUser && profile?.approved) await loadProjects(authUser);
      } catch (error) {
        console.error("Kunne ikke lagre godkjenning av vilkår:", error);
        setTermsError("Kunne ikke lagre godkjenning. Prøv igjen eller kontakt systemadministrator.");
      } finally {
        setTermsAccepting(false);
      }
    };
    const handleAuthUser = async (sessionUser) => {
      const nextUserId = sessionUser?.id || null;
      const previousUserId = previousAuthUserIdRef.current;
      const isNewLoginOrLogout = previousUserId !== nextUserId;
      previousAuthUserIdRef.current = nextUserId;
      setAuthUser(sessionUser);
      if (isNewLoginOrLogout) {
        resetToCleanStartPage();
        setTermsAccepted(false);
        setTermsAcceptanceRecord(null);
        setTermsReadConfirmed(false);
        setTermsError("");
      }
      if (!sessionUser) {
        setProjects([]);
        setAdminTermsAcceptances([]);
        setProfile(null);
        setProfileLoading(false);
        setTermsAccepted(false);
        setTermsAcceptanceRecord(null);
        setTermsReadConfirmed(false);
        setTermsError("");
        setTermsLoading(false);
        return;
      }
      const row = await ensureProfile(sessionUser);
      if (row?.approved && !row?.deactivated) {
        await loadTermsAcceptance(sessionUser.id);
        loadProjects(sessionUser, false, row);
      } else {
        setTermsLoading(false);
      }
    };
    (0, import_react.useEffect)(() => {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams((window.location.hash || "").replace(/^#/, ""));
      const id = params.get("project");
      const isRecoveryLink = params.get("type") === "recovery" || hashParams.get("type") === "recovery";
      if (isRecoveryLink) {
        setPasswordRecovery(true);
      }
      if (id && !isRecoveryLink) {
        openProjectById(id);
        if ((params.get("access") || params.get("role")) === "underleverandor") setTab("produkter");
        if ((params.get("access") || params.get("role")) !== "admin") {
          setAuthLoading(false);
          return;
        }
      }
      supabase.auth.getSession().then(({ data }) => {
        handleAuthUser(data.session?.user || null).finally(() => setAuthLoading(false));
      });
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (_event === "PASSWORD_RECOVERY") {
          setPasswordRecovery(true);
        }
        handleAuthUser(session?.user || null);
      });
      return () => listener.subscription.unsubscribe();
    }, []);
    (0, import_react.useEffect)(() => {
      if (!projectId) return;
      const chatVisible = isReadOnly || tab === "chat" || customerTab === "chat";
      if (!chatVisible) return;
      let cancelled = false;
      const applyChatData = (row) => {
        if (!row || cancelled) return;
        const cloudData = dataFromRow(row);
        const incomingLog = normalizeProjectLog(cloudData.projectLog);
        const incomingCount = (incomingLog.messages || []).length;
        setProjectLog((prev) => ({
          ...incomingLog,
          draft: prev?.draft || ""
        }));
        lastChatMessageCountRef.current = incomingCount;
        lastChatRefreshAtRef.current = Date.now();
        setProjectId(row.id);
      };
      const channel = supabase.channel(`project-chat-${projectId}`).on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "projects", filter: `id=eq.${projectId}` },
        (payload) => applyChatData(payload.new)
      ).subscribe();
      refreshProjectFromCloud(true);
      const timer = window.setInterval(() => {
        refreshProjectFromCloud(true);
      }, 5e3);
      return () => {
        cancelled = true;
        window.clearInterval(timer);
        supabase.removeChannel(channel);
      };
    }, [projectId, isReadOnly, tab, customerTab]);
    (0, import_react.useEffect)(() => {
      if (!isReadOnly) {
        loadFdvRegister(false);
        loadProductMaster(false);
        loadProductMasterCheckpoints(false);
      }
    }, [isReadOnly]);
    (0, import_react.useEffect)(() => {
      if (authUser && profile?.approved) {
        loadProjects(authUser);
      }
    }, [authUser?.id, profile?.approved, profile?.company_name, profile?.company_role, profile?.system_role]);

    const createNewProject = () => {
      const hasContent = projectId || project.projectName || project.address || project.postnr || project.city || project.customer || project.customerEmail || project.customerPhone || project.notes || project.projectDescription || project.projectInfoIncludeInReport || project.checklistPhotosNote || project.fall || project.fallDusj || project.fallUtenfor || project.sluk || project.terskel || project.membran || project.prosjekteringKommentar || (Array.isArray(project.prosjekteringPunkter) ? project.prosjekteringPunkter : []).length || Object.keys(checked || {}).length || Object.keys(productDocs || {}).length || (Array.isArray(manualProducts) ? manualProducts.length : Object.values(manualProducts || {}).some((list) => (list || []).length)) || Object.keys(other || {}).length || Object.keys(surf || {}).length || Object.values(bathroomEquipment || {}).some(hasValue) || (photos || []).length || (access || []).length || (inst || []).length || (files || []).length || Object.keys(checklist || {}).length || tilbud.enabled || tilbud.tillegg || tilbud.fradrag || tilbud.kommentar || (tilbud.files || []).length || overtagelse.enabled || overtagelse.kommentar || overtagelse.signUtf\u00F8rende || overtagelse.signKunde || overtagelse.signUtf\u00F8rendeImage || overtagelse.signKundeImage || warranty.enabled || warranty.issued || warranty.system || projectLog.enabled || projectLog.draft || (projectLog.messages || []).length || internalNotes;
      if (hasContent && !window.confirm("Starte nytt prosjekt? Ulagrede endringer vil g\xE5 tapt.")) return;
      setProject(emptyProject());
      setChecked({});
      setProductDocs({});
      setManualProducts({});
      setOther({});
      setSurf({});
      setBathroomEquipment(emptyBathroomEquipment());
      setPhotos([]);
      setAccess([]);
      setInst([]);
      setFiles([]);
      setChecklist({});
      setTilbud(emptyTilbud());
      setOvertagelse(emptyOvertagelse());
      setWarranty(emptyWarranty());
      setProjectLog(emptyProjectLog());
      setInternalNotes("");
      setProjectId(null);
      setCurrentProjectOwnerId(authUser?.id || "");
      setSupportModeExplicit(false);
      setMobileCreatingProject(true);
      setLocalDraftRestoreChecked(false);
      setTab("prosjekt");
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
    };
    const addProsjekteringPunkt = () => {
      setProject((p) => ({
        ...p,
        prosjekteringPunkter: [
          ...Array.isArray(p.prosjekteringPunkter) ? p.prosjekteringPunkter : [],
          { id: uid(), category: "Annet", title: "", value: "" }
        ]
      }));
    };
    const updateProsjekteringPunkt = (id, patch) => {
      setProject((p) => ({
        ...p,
        prosjekteringPunkter: (Array.isArray(p.prosjekteringPunkter) ? p.prosjekteringPunkter : []).map(
          (point) => point.id === id ? { ...point, ...patch } : point
        )
      }));
    };
    const removeProsjekteringPunkt = (id) => {
      setProject((p) => ({
        ...p,
        prosjekteringPunkter: (Array.isArray(p.prosjekteringPunkter) ? p.prosjekteringPunkter : []).filter((point) => point.id !== id)
      }));
    };
    const updateProductDoc = (productName, patch) => {
      if (!canEditProject()) return;
      setProductDocs((prev) => ({
        ...prev,
        [productName]: {
          ...prev[productName] || {},
          ...patch
        }
      }));
    };
    const toggleProductChecked = (productName, isChecked) => {
      if (!canEditProject()) return;
      setChecked((prev) => ({ ...prev, [productName]: isChecked }));
      if (!isChecked) return;
      const masterRow = productMasterByProduct[productName];
      const registerRow = fdvRegisterByProduct[productName];
      const autoDocs = {
        fdvUrl: masterRow?.fdv_url || registerRow?.fdv_url || masterRow?.datablad_url || "",
        databladUrl: masterRow?.datablad_url || "",
        dopUrl: masterRow?.dop_url || "",
        epdUrl: masterRow?.epd_url || "",
        sikkerhetsdatabladUrl: masterRow?.sikkerhetsdatablad_url || "",
        documentFileUrl: masterRow?.document_file_url || "",
        fdvSource: masterRow ? "product-master" : registerRow ? "admin-register" : ""
      };
      if (!Object.values(autoDocs).some(hasValue)) return;
      setProductDocs((prev) => {
        const current = prev[productName] || {};
        return {
          ...prev,
          [productName]: {
            ...current,
            fdvUrl: hasValue(current.fdvUrl) ? current.fdvUrl : autoDocs.fdvUrl,
            databladUrl: hasValue(current.databladUrl) ? current.databladUrl : autoDocs.databladUrl,
            dopUrl: hasValue(current.dopUrl) ? current.dopUrl : autoDocs.dopUrl,
            epdUrl: hasValue(current.epdUrl) ? current.epdUrl : autoDocs.epdUrl,
            sikkerhetsdatabladUrl: hasValue(current.sikkerhetsdatabladUrl) ? current.sikkerhetsdatabladUrl : autoDocs.sikkerhetsdatabladUrl,
            documentFileUrl: hasValue(current.documentFileUrl) ? current.documentFileUrl : autoDocs.documentFileUrl,
            fdvSource: current.fdvSource || autoDocs.fdvSource
          }
        };
      });
    };
    const addManualProduct = (section) => {
      if (!canEditProject()) return;
      setManualProducts((prev) => {
        const normalized = normalizeManualProductsBySection(prev);
        return {
          ...normalized,
          [section]: [
            ...normalized[section] || [],
            { id: uid(), name: "", fdvUrl: "", comment: "" }
          ]
        };
      });
    };
    const updateManualProduct = (section, id, patch) => {
      if (!canEditProject()) return;
      setManualProducts((prev) => {
        const normalized = normalizeManualProductsBySection(prev);
        return {
          ...normalized,
          [section]: (normalized[section] || []).map((p) => p.id === id ? { ...p, ...patch } : p)
        };
      });
    };
    const removeManualProduct = (section, id) => {
      if (!canEditProject()) return;
      setManualProducts((prev) => {
        const normalized = normalizeManualProductsBySection(prev);
        return {
          ...normalized,
          [section]: (normalized[section] || []).filter((p) => p.id !== id)
        };
      });
    };
    const markChatAsRead = async (reader = "admin") => {
      if (!projectId) return;
      const timestamp = (/* @__PURE__ */ new Date()).toISOString();
      const key = reader === "customer" ? "lastReadByCustomer" : "lastReadByAdmin";
      let nextLogForSave = null;
      setProjectLog((prev) => {
        const normalized = normalizeProjectLog(prev);
        nextLogForSave = { ...normalized, [key]: timestamp };
        return nextLogForSave;
      });
      try {
        const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
        if (fetchError || !existing) {
          if (fetchError) console.warn("Kunne ikke markere chat som lest:", fetchError.message);
          return;
        }
        const existingData = dataFromRow(existing);
        const existingLog = normalizeProjectLog(existingData.projectLog);
        const cleanData = JSON.parse(JSON.stringify({
          ...existingData,
          projectLog: {
            ...existingLog,
            [key]: timestamp,
            draft: ""
          }
        }));
        const { error } = await supabase.from("projects").update({
          data: cleanData,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", projectId);
        if (error) console.warn("Kunne ikke markere chat som lest:", error.message);
      } catch (error) {
        console.warn("Kunne ikke markere chat som lest:", error);
      }
    };
    const notifyChatMessage = async ({ toEmail, direction, message }) => {
      if (!toEmail || !message?.text) return;
      try {
        const { error } = await supabase.functions.invoke("smart-worker", {
          body: {
            toEmail,
            direction,
            projectId,
            projectName: project.projectName || project.address || "Prosjekt",
            customerName: project.customer || "Kunde",
            customerEmail: project.customerEmail || "",
            companyName: company.companyName || name || "Expo ProffDok",
            fromName: message.by || "Ukjent",
            message: message.text,
            projectLink: projectId ? makeProjectLink(projectId, direction === "to_owner" ? "admin" : "kunde") : ""
          }
        });
        if (error) {
          console.warn("E-postvarsling kunne ikke sendes:", error.message);
        }
      } catch (error) {
        console.warn("E-postvarsling kunne ikke sendes:", error);
      }
    };
    const ownerNotificationEmail = () => user.email || authUser?.email || company.email || profile?.email || "";
    const addProjectLogMessage = async () => {
      if (!projectId) return alert("Prosjektet m\xE5 lagres f\xF8r chatmelding med bilde kan lagres p\xE5 prosjektet.");
      const text = (projectLog.draft || "").trim();
      if (!text && !chatUploadFile) return alert("Skriv en melding eller velg et bilde f\xF8rst.");
      let uploadedImage = null;
      if (chatUploadFile) {
        uploadedImage = await uploadChatImage(chatUploadFile, projectId, "admin");
        if (!uploadedImage) return;
      }
      const message = {
        id: uid(),
        text,
        by: user.name || authUser?.email || "Utf\xF8rende",
        role: "utf\xF8rende",
        created: (/* @__PURE__ */ new Date()).toISOString(),
        imageUrl: uploadedImage?.imageUrl || "",
        imageName: uploadedImage?.imageName || "",
        imagePath: uploadedImage?.imagePath || ""
      };
      const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
      if (fetchError || !existing) {
        console.error(fetchError);
        return alert("Kunne ikke hente prosjekt f\xF8r melding ble lagret: " + (fetchError?.message || "Fant ikke prosjekt"));
      }
      if (rowIsLocked(existing)) {
        return alert("Prosjektet er l\xE5st og chatmeldingen kan ikke lagres. L\xE5s opp prosjektet f\xF8rst.");
      }
      const existingData = dataFromRow(existing);
      const existingLog = normalizeProjectLog(existingData.projectLog);
      const updatedLog = {
        ...existingLog,
        draft: "",
        lastReadByAdmin: (/* @__PURE__ */ new Date()).toISOString(),
        messages: [...existingLog.messages || [], message]
      };
      const cleanData = JSON.parse(JSON.stringify({
        ...existingData,
        project: { ...emptyProject(), ...existingData.project || {}, ...project },
        projectLog: updatedLog,
        internalNotes
      }));
      const { data: updatedRow, error } = await supabase.from("projects").update({
        data: cleanData,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", projectId).select("*").maybeSingle();
      if (error) {
        console.error(error);
        return alert("Kunne ikke lagre chatmelding p\xE5 prosjektet: " + error.message);
      }
      setChatUploadFile(null);
      const fileInput = document.getElementById("admin-chat-image-input");
      if (fileInput) fileInput.value = "";
      if (updatedRow) {
        unpackData(dataFromRow(updatedRow));
        setProjectId(updatedRow.id);
      } else {
        setProjectLog(updatedLog);
      }
      await notifyChatMessage({
        toEmail: project.customerEmail,
        direction: "to_customer",
        message
      });
      alert(project.customerEmail ? "\u2714 Melding sendt og lagret p\xE5 prosjektet. E-postvarsling fors\xF8kt sendt til kunde." : "\u2714 Melding lagret p\xE5 prosjektet. Legg inn kunde e-post for e-postvarsling.");
    };
    const removeProjectLogMessage = async (id) => {
      if (!id) return;
      if (!window.confirm("Vil du fjerne denne chatmeldingen fra prosjektet?")) return;
      if (!projectId) {
        setProjectLog((prev) => ({
          ...prev,
          messages: (prev.messages || []).filter((m) => m.id !== id)
        }));
        return;
      }
      const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
      if (fetchError || !existing) {
        console.error(fetchError);
        return alert("Kunne ikke hente prosjekt før meldingen ble fjernet: " + (fetchError?.message || "Fant ikke prosjekt"));
      }
      if (rowIsLocked(existing)) {
        return alert("Prosjektet er låst. Lås opp prosjektet før chatmeldinger kan fjernes.");
      }
      const existingData = dataFromRow(existing);
      const existingLog = normalizeProjectLog(existingData.projectLog);
      const updatedLog = {
        ...existingLog,
        draft: projectLog?.draft || existingLog.draft || "",
        messages: (existingLog.messages || []).filter((m) => m.id !== id)
      };
      if ((existingLog.messages || []).length === updatedLog.messages.length) {
        return alert("Fant ikke meldingen i lagret prosjektdata. Oppdater chat og prøv igjen.");
      }
      const cleanData = JSON.parse(JSON.stringify({
        ...existingData,
        projectLog: updatedLog
      }));
      const { data: updatedRow, error } = await supabase.from("projects").update({
        data: cleanData,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", projectId).select("*").maybeSingle();
      if (error) {
        console.error(error);
        return alert("Kunne ikke fjerne chatmelding fra prosjektet: " + error.message);
      }
      if (updatedRow) {
        unpackData(dataFromRow(updatedRow), true);
        setProjectId(updatedRow.id);
      } else {
        setProjectLog(updatedLog);
      }
      await loadProjects(authUser);
      alert("Chatmelding fjernet fra prosjektet.");
    };
    const saveCustomerChatMessage = async () => {
      if (!projectId) return alert("Prosjektet mangler ID.");
      const text = (projectLog.draft || "").trim();
      if (!text && !customerChatUploadFile) return alert("Skriv en melding eller velg et bilde f\xF8rst.");
      let uploadedImage = null;
      if (customerChatUploadFile) {
        uploadedImage = await uploadChatImage(customerChatUploadFile, projectId, "kunde");
        if (!uploadedImage) return;
      }
      const message = {
        id: uid(),
        text,
        by: project.customer || "Kunde",
        role: "kunde",
        created: (/* @__PURE__ */ new Date()).toISOString(),
        imageUrl: uploadedImage?.imageUrl || "",
        imageName: uploadedImage?.imageName || "",
        imagePath: uploadedImage?.imagePath || ""
      };
      const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
      if (fetchError || !existing) {
        console.error(fetchError);
        return alert("Kunne ikke hente prosjekt f\xF8r melding ble lagret: " + (fetchError?.message || "Fant ikke prosjekt"));
      }
      if (rowIsLocked(existing)) {
        return alert("Prosjektet er l\xE5st og chatmeldingen kan ikke lagres. Kontakt prosjektansvarlig hvis noe m\xE5 korrigeres.");
      }
      const existingData = dataFromRow(existing);
      const existingLog = normalizeProjectLog(existingData.projectLog);
      const updatedLog = {
        ...existingLog,
        draft: "",
        lastReadByCustomer: (/* @__PURE__ */ new Date()).toISOString(),
        messages: [...existingLog.messages || [], message]
      };
      const cleanData = JSON.parse(JSON.stringify({
        ...existingData,
        projectLog: updatedLog
      }));
      const { data: updatedRow, error } = await supabase.from("projects").update({
        data: cleanData,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", projectId).select("*").maybeSingle();
      if (error) {
        console.error(error);
        return alert("Kunne ikke lagre melding: " + error.message);
      }
      setCustomerChatUploadFile(null);
      const fileInput = document.getElementById("customer-chat-image-input");
      if (fileInput) fileInput.value = "";
      if (updatedRow) {
        unpackData(dataFromRow(updatedRow));
        setProjectId(updatedRow.id);
      } else {
        setProjectLog(updatedLog);
      }
      await notifyChatMessage({
        toEmail: ownerNotificationEmail(),
        direction: "to_owner",
        message
      });
      alert(ownerNotificationEmail() ? "\u2714 Melding sendt og lagret p\xE5 prosjektet. E-postvarsling fors\xF8kt sendt til utf\xF8rende." : "\u2714 Melding sendt og lagret p\xE5 prosjektet.");
    };
    const saveProject = async () => {
      if (!authUser) return alert("Du m\xE5 v\xE6re logget inn for \xE5 lagre prosjekt.");
      const snapshot = {
        ...latestStateRef.current || {},
        company,
        user,
        project,
        checked,
        productDocs,
        manualProducts,
        other,
        surf,
        bathroomEquipment,
        photos,
        access,
        inst,
        files,
        checklist,
        tilbud,
        overtagelse,
        warranty,
        projectLog,
        internalNotes
      };
      const makeCleanData = (projectOverride = snapshot.project, projectLogOverride = snapshot.projectLog) => JSON.parse(JSON.stringify({
        company: snapshot.company,
        user: snapshot.user,
        project: { ...emptyProject(), ...projectOverride },
        checked: snapshot.checked,
        productDocs: snapshot.productDocs,
        manualProducts: snapshot.manualProducts,
        other: snapshot.other,
        surf: snapshot.surf,
        bathroomEquipment: snapshot.bathroomEquipment || bathroomEquipment,
        photos: snapshot.photos,
        access: snapshot.access,
        inst: snapshot.inst,
        files: snapshot.files,
        checklist: snapshot.checklist,
        tilbud: snapshot.tilbud,
        overtagelse: snapshot.overtagelse,
        warranty: snapshot.warranty || emptyWarranty(),
        projectLog: projectLogOverride,
        internalNotes: snapshot.internalNotes
      }));
      if (projectId) {
        const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
        if (fetchError) {
          console.error(fetchError);
          return alert("Kunne ikke kontrollere prosjektstatus: " + fetchError.message);
        }
        if (!existing) {
          return alert("Fant ikke prosjektet. \xC5pne prosjektet p\xE5 nytt fra prosjektlisten.");
        }
        const existingProject = projectFromRow(existing, existing?.data?.project || {});
        if (rowIsLocked(existing) || isProjectLocked) {
          const lockedProject = existingProject;
          setProject(lockedProject);
          return alert("Prosjektet er l\xE5st. L\xE5s opp prosjektet f\xF8r du lagrer endringer.");
        }
        const saveProjectData = {
          ...emptyProject(),
          ...snapshot.project || {},
          locked: false,
          status: "active",
          lockedAt: "",
          lockedBy: ""
        };
        const saveProjectLog = {
          ...normalizeProjectLog(snapshot.projectLog),
          draft: ""
        };
        const cleanData = makeCleanData(saveProjectData, saveProjectLog);
        const payload = {
          title: saveProjectData.projectName || saveProjectData.address || "Uten navn",
          data: cleanData,
          user_id: existing.user_id || authUser.id,
          share_enabled: true,
          locked: false,
          locked_at: null,
          locked_by: "",
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        let updatedRow = null;
        const updateResult = await supabase.from("projects").update(payload).eq("id", projectId).select("*").maybeSingle();
        if (updateResult.error) {
          console.error(updateResult.error);
          return alert("Kunne ikke oppdatere prosjekt i sky: " + updateResult.error.message);
        }
        updatedRow = updateResult.data || null;
        if (!updatedRow) {
          const verifyResult = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
          if (verifyResult.error) {
            console.error(verifyResult.error);
          } else {
            updatedRow = verifyResult.data || null;
          }
        }
        const matchesSavedProject = (row) => {
          const saved = row?.data?.project || {};
          return (saved.projectName || "") === (saveProjectData.projectName || "") && (saved.address || "") === (saveProjectData.address || "") && (saved.postnr || "") === (saveProjectData.postnr || "") && (saved.city || "") === (saveProjectData.city || "") && (saved.customer || "") === (saveProjectData.customer || "") && (saved.customerEmail || "") === (saveProjectData.customerEmail || "") && (saved.customerPhone || "") === (saveProjectData.customerPhone || "") && (saved.notes || "") === (saveProjectData.notes || "");
        };
        if (updatedRow && matchesSavedProject(updatedRow)) {
          unpackData(dataFromRow(updatedRow), false);
          setProjectId(updatedRow.id);
          await loadProjects(authUser);
          return alert("\u2714 Prosjekt oppdatert og bekreftet lagret");
        }
        const shouldCopy = window.confirm(
          "Prosjektet ble ikke oppdatert automatisk. Dette kan skyldes tilgang til et eldre prosjekt.\n\nVil du lagre dette som en ny oppdatert kopi n\xE5, slik at endringene ikke g\xE5r tapt?"
        );
        if (!shouldCopy) {
          setProject(saveProjectData);
          setProjectLog(saveProjectLog);
          latestStateRef.current = { ...snapshot, project: saveProjectData, projectLog: saveProjectLog };
          return alert("Endringene st\xE5r fortsatt p\xE5 skjermen, men er ikke bekreftet lagret.");
        }
        const copyPayload = {
          title: saveProjectData.projectName || saveProjectData.address || "Uten navn",
          data: cleanData,
          user_id: authUser.id,
          share_enabled: true,
          locked: false,
          locked_at: null,
          locked_by: "",
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        const { data: copyRow, error: copyError } = await supabase.from("projects").insert(copyPayload).select().single();
        if (copyError) {
          console.error(copyError);
          return alert("Kunne ikke lagre kopi heller: " + copyError.message);
        }
        setProjectId(copyRow.id);
        setCurrentProjectOwnerId(copyRow.user_id || authUser.id);
        setSupportModeExplicit(false);
        unpackData(dataFromRow(copyRow), false);
        await loadProjects(authUser);
        return alert("\u2714 Gammel rad kunne ikke oppdateres, men prosjektet er lagret som ny oppdatert kopi.");
      } else {
        const newProjectData = {
          ...emptyProject(),
          ...snapshot.project || {},
          locked: false,
          status: "active",
          lockedAt: "",
          lockedBy: ""
        };
        const newProjectLog = {
          ...normalizeProjectLog(snapshot.projectLog),
          draft: ""
        };
        const payload = {
          title: newProjectData.projectName || newProjectData.address || "Uten navn",
          data: makeCleanData(newProjectData, newProjectLog),
          user_id: authUser.id,
          share_enabled: true,
          locked: false,
          locked_at: null,
          locked_by: "",
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        const { data, error } = await supabase.from("projects").insert(payload).select().single();
        if (error) {
          console.error(error);
          return alert("Kunne ikke lagre i sky: " + error.message);
        }
        setProjectId(data.id);
        setCurrentProjectOwnerId(data.user_id || authUser.id);
        setSupportModeExplicit(false);
        setMobileCreatingProject(false);
        unpackData(dataFromRow(data), false);
        alert("\u2714 Prosjekt lagret");
      }
      loadProjects(authUser);
    };
    const saveSharedProject = async () => {
      if (!projectId) return alert("Prosjektet mangler ID og kan ikke lagres fra delingslink.");
      const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
      if (fetchError || !existing) {
        console.error(fetchError);
        return alert("Kunne ikke kontrollere prosjektstatus f\xF8r lagring: " + (fetchError?.message || "Fant ikke prosjekt"));
      }
      const existingProject = projectFromRow(existing, existing.data?.project || {});
      if (rowIsLocked(existing) || isProjectLocked) {
        const lockedProject = existingProject;
        setProject(lockedProject);
        return alert("Prosjektet er l\xE5st og kan ikke endres. Kontakt prosjektansvarlig hvis noe m\xE5 korrigeres.");
      }
      const safeProject = {
        ...emptyProject(),
        ...project,
        locked: false,
        status: "active",
        lockedAt: "",
        lockedBy: ""
      };
      const cleanData = JSON.parse(JSON.stringify({
        company,
        user,
        project: safeProject,
        checked,
        productDocs,
        manualProducts,
        other,
        surf,
        bathroomEquipment,
        photos,
        access,
        inst,
        files,
        checklist,
        tilbud,
        overtagelse,
        warranty,
        projectLog,
        internalNotes
      }));
      const payload = {
        title: safeProject.projectName || safeProject.address || "Uten navn",
        data: cleanData,
        share_enabled: true,
        locked: false,
        locked_at: null,
        locked_by: "",
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      const { error } = await supabase.from("projects").update(payload).eq("id", projectId);
      if (error) {
        console.error(error);
        return alert("Kunne ikke lagre fra delingslink. Kontakt prosjektansvarlig hvis feilen vedvarer. Feil: " + error.message);
      }
      setProject(safeProject);
      alert("\u2714 Bidrag lagret p\xE5 prosjektet " + (/* @__PURE__ */ new Date()).toLocaleTimeString("no-NO"));
    };
    const setProjectLockedState = async (locked) => {
      if (!authUser) return alert("Du m\xE5 v\xE6re logget inn for \xE5 endre prosjektstatus.");
      if (!projectId) return alert("Prosjektet m\xE5 lagres f\xF8r det kan l\xE5ses eller l\xE5ses opp.");
      const message = locked ? "Vil du avslutte og l\xE5se prosjektet? Ingen kan lagre endringer f\xF8r prosjektet l\xE5ses opp igjen." : "Vil du l\xE5se opp prosjektet slik at endringer kan lagres igjen?";
      if (!window.confirm(message)) return;
      const { data, error } = await supabase.rpc("set_project_lock", {
        p_project_id: projectId,
        p_locked: !!locked,
        p_locked_by: authUser.email || user.email || user.name || "Ukjent"
      });
      if (error) {
        console.error(error);
        return alert("Kunne ikke oppdatere prosjektstatus: " + error.message);
      }
      const updatedRow = Array.isArray(data) ? data[0] : data;
      if (!updatedRow) {
        return alert("Prosjektstatus ble ikke oppdatert. \xC5pne prosjektet p\xE5 nytt og pr\xF8v igjen.");
      }
      const updatedData = dataFromRow(updatedRow, updatedRow.data || packData());
      unpackData(updatedData);
      alert(locked ? "\u{1F512} Prosjektet er avsluttet og l\xE5st." : "\u{1F513} Prosjektet er l\xE5st opp igjen.");
      loadProjects(authUser);
    };
    const saveAsNewProject = async () => {
      if (!authUser) return alert("Du m\xE5 v\xE6re logget inn for \xE5 lagre prosjekt.");
      const projectTitle = project.projectName || project.address || project.customer || "Uten navn";
      const hasProjectContent = projectId || project.projectName || project.address || project.customer || project.customerEmail || project.customerPhone || project.notes || project.projectDescription || Object.keys(checked || {}).length || (photos || []).length || Object.keys(checklist || {}).length || (inst || []).length || (files || []).length || (projectLog?.messages || []).length;
      if (!hasProjectContent) return alert("Det finnes ikke nok prosjektinnhold til \xE5 lagre en kopi enn\xE5.");
      const confirmText = projectId
        ? `Lagre en NY kopi av prosjektet "${projectTitle}"?\n\nDette lager en separat prosjektrad. Bruk heller "Oppdater prosjekt" hvis du bare skal lagre vanlige endringer p\xE5 dagens prosjekt.`
        : `Dette prosjektet er ikke lagret fra f\xF8r. Vanlig valg er "Lagre / oppdater prosjekt".\n\nVil du likevel lagre dette som en egen kopi?`;
      if (!window.confirm(confirmText)) return;
      if (isProjectLocked && !window.confirm("Prosjektet du kopierer er l\xE5st. Kopien blir opprettet som \xE5pen/ul\xE5st slik at den kan redigeres. Fortsette?")) return;
      const unlockedProject = { ...emptyProject(), ...project, locked: false, status: "active", lockedAt: "", lockedBy: "" };
      const cleanProjectLog = { ...normalizeProjectLog(projectLog), draft: "" };
      const cleanData = JSON.parse(JSON.stringify({
        company,
        user,
        project: unlockedProject,
        checked,
        productDocs,
        manualProducts,
        other,
        surf,
        bathroomEquipment,
        photos,
        access,
        inst,
        files,
        checklist,
        tilbud,
        overtagelse,
        warranty,
        projectLog: cleanProjectLog,
        internalNotes
      }));
      const payload = {
        title: projectTitle,
        data: cleanData,
        user_id: authUser.id,
        share_enabled: true,
        locked: false,
        locked_at: null,
        locked_by: "",
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      const { data, error } = await supabase.from("projects").insert(payload).select().single();
      if (error) {
        console.error(error);
        return alert("Kunne ikke lagre som ny kopi: " + error.message);
      }
      setProjectId(data.id);
      setMobileCreatingProject(false);
      unpackData(dataFromRow(data), false);
      await loadProjects(authUser);
      alert(`\u2714 Kopi lagret. Du jobber n\xE5 i den nye kopien av "${projectTitle}".`);
    };
    const deleteProject = async (id) => {
      if (!window.confirm("Er du sikker p\xE5 at du vil slette prosjektet?")) return;
      if (!authUser) return alert("Du m\xE5 v\xE6re logget inn for \xE5 slette prosjekt.");
      const { data, error } = await supabase.from("projects").delete().eq("id", id).select("id");
      if (error) {
        console.error(error);
        return alert("Kunne ikke slette prosjekt: " + error.message);
      }
      if (!data || data.length === 0) {
        return alert("Prosjektet ble ikke slettet. Dette skyldes sannsynligvis tilgang til en eldre prosjektrad.");
      }
      setProjects((prev) => (prev || []).filter((p) => p.id !== id));
      if (id === projectId) {
        setProjectId(null);
        setCurrentProjectOwnerId("");
        setSupportModeExplicit(false);
        setMobileCreatingProject(false);
        setTab("prosjekt");
      }
      await loadProjects(authUser);
      alert("Prosjekt slettet.");
    };
    const saveProjectForLink = async () => {
      if (projectId) return projectId;
      if (!authUser) {
        alert("Du m\xE5 v\xE6re logget inn for \xE5 lage delingslink.");
        return null;
      }
      const newProjectData = {
        ...emptyProject(),
        ...project,
        locked: false,
        status: "active",
        lockedAt: "",
        lockedBy: ""
      };
      const cleanData = JSON.parse(JSON.stringify({
        company,
        user,
        project: newProjectData,
        checked,
        productDocs,
        manualProducts,
        other,
        surf,
        bathroomEquipment,
        photos,
        access,
        inst,
        files,
        checklist,
        tilbud,
        overtagelse,
        warranty,
        projectLog,
        internalNotes
      }));
      const payload = {
        title: newProjectData.projectName || newProjectData.address || "Uten navn",
        data: cleanData,
        user_id: authUser.id,
        share_enabled: true,
        locked: false,
        locked_at: null,
        locked_by: "",
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      const { data, error } = await supabase.from("projects").insert(payload).select().single();
      if (error) {
        console.error(error);
        alert("Kunne ikke lagre prosjekt f\xF8r deling: " + error.message);
        return null;
      }
      setProjectId(data.id);
      setMobileCreatingProject(false);
      setProject(newProjectData);
      loadProjects(authUser);
      return data.id;
    };
    const makeProjectLink = (id, role = "kunde") => {
      if (role === "admin") {
        return `${window.location.origin}${window.location.pathname}?project=${id}&role=admin`;
      }
      const roleParam = role === "Underleverand\xF8r" ? "underleverandor" : "kunde";
      return roleParam === "underleverandor" ? `${window.location.origin}${window.location.pathname}?project=${id}&access=underleverandor` : `${window.location.origin}${window.location.pathname}?project=${id}&role=kunde`;
    };
    const copyLinkToClipboard = async (link, successMessage) => {
      try {
        await navigator.clipboard.writeText(link);
        alert(successMessage);
      } catch {
        prompt("Kopier denne linken:", link);
      }
    };
    const shareProject = async () => {
      const id = await saveProjectForLink();
      if (!id) return;
      await copyLinkToClipboard(makeProjectLink(id, "kunde"), "Kundelink kopiert.");
    };
    const copyAccessLink = async (role = "kunde") => {
      const id = await saveProjectForLink();
      if (!id) return;
      const roleParam = role === "Underleverand\xF8r" ? "underleverandor" : "kunde";
      await copyLinkToClipboard(
        makeProjectLink(id, role),
        roleParam === "underleverandor" ? "Underentrepren\xF8r-link kopiert." : "Kundelink kopiert."
      );
    };
    const sendAccessEmail = async ({ role = "kunde", toEmail = "", recipientName = "" } = {}) => {
      const cleanEmail = String(toEmail || "").trim();
      if (!cleanEmail) return alert("Legg inn e-postadresse før du sender tilgang.");
      const id = await saveProjectForLink();
      if (!id) return;
      const roleParam = role === "Underleverand\xF8r" ? "underleverandor" : "kunde";
      const link = makeProjectLink(id, role);
      try {
        const { error } = await supabase.functions.invoke("smart-worker", {
          body: {
            toEmail: cleanEmail,
            direction: roleParam === "underleverandor" ? "access_underleverandor" : "access_kunde",
            accessRole: roleParam === "underleverandor" ? "underentreprenør" : "kunde",
            projectId: id,
            projectName: project.projectName || project.address || "Prosjekt",
            recipientName: recipientName || "",
            customerName: project.customer || recipientName || "Kunde",
            customerEmail: project.customerEmail || "",
            customerPhone: project.customerPhone || "",
            projectAddress: project.address || "",
            projectPostnr: project.postnr || "",
            projectCity: project.city || "",
            projectResponsible: project.responsible || user.name || authUser?.email || "",
            companyName: company.companyName || name || "Expo ProffDok",
            fromName: user.name || authUser?.email || "Prosjektleder",
            message: accessEmailMessage || "Du har fått tilgang til prosjektet.",
            projectLink: link,
            subject: `Tilgang til prosjekt: ${project.projectName || project.address || "Prosjekt"}`
          }
        });
        if (error) {
          console.warn("Tilgangs-e-post kunne ikke sendes:", error.message);
          await copyLinkToClipboard(link, "E-post kunne ikke sendes, men linken er kopiert.");
          return;
        }
        alert("✔ E-post med tilgangslink er sendt.");
      } catch (error) {
        console.warn("Tilgangs-e-post kunne ikke sendes:", error);
        await copyLinkToClipboard(link, "E-post kunne ikke sendes, men linken er kopiert.");
      }
    };

    const sendProjectCompletionEmailToCustomer = async ({ askFirst = true, silent = false } = {}) => {
      const cleanEmail = String(project.customerEmail || "").trim();
      if (!cleanEmail) {
        if (!silent) alert("Kunde e-post mangler. Legg inn kunde e-post før dokumentasjonen kan sendes automatisk.");
        return false;
      }
      if (!projectId) {
        if (!silent) alert("Prosjektet må lagres før dokumentasjon kan sendes til kunde.");
        return false;
      }
      const customerLink = makeProjectLink(projectId, "kunde");
      const projectTitle = project.projectName || project.address || "prosjektet";
      const warrantyLine = warranty?.issued
        ? `\n• Garantibevis${warranty?.guaranteeNumber ? ` (${warranty.guaranteeNumber})` : ""}\n• Garantivilkår ${getWarrantyYears(warranty)} år`
        : warranty?.enabled
          ? "\n• Garantiinformasjon oppdateres når garantien er utstedt"
          : "";
      const emailBody = `Hei ${project.customer || "kunde"}

Prosjektet er nå ferdigstilt, og dokumentasjonen er tilgjengelig i kundeportalen.

Du finner blant annet:

• Sluttrapport
• Bildedokumentasjon
• Produktoversikt
• FDV- og produktdokumentasjon${warrantyLine}

Åpne kundeportalen:
${customerLink}

Med vennlig hilsen

${company.companyName || name || "Expo ProffDok"}
${company.phone ? "Tlf: " + company.phone + "\n" : ""}${company.email ? "E-post: " + company.email : ""}`;

      if (askFirst) {
        const shouldSend = window.confirm(
          `Prosjektet er klart til å låses.\n\nVil du sende ferdigmelding og kundeportal-link automatisk til:\n${cleanEmail}\n\nTrykk OK for å sende, eller Avbryt for å låse uten å sende e-post.`
        );
        if (!shouldSend) return false;
      }

      try {
        const { error } = await supabase.functions.invoke("smart-worker", {
          body: {
            toEmail: cleanEmail,
            direction: "project_completed_customer",
            projectId,
            projectName: project.projectName || project.address || "Prosjekt",
            customerName: project.customer || "Kunde",
            customerEmail: cleanEmail,
            customerPhone: project.customerPhone || "",
            projectAddress: project.address || "",
            projectPostnr: project.postnr || "",
            projectCity: project.city || "",
            projectResponsible: project.responsible || user.name || authUser?.email || "",
            companyName: company.companyName || name || "Expo ProffDok",
            fromName: user.name || authUser?.email || "Prosjektleder",
            message: emailBody,
            projectLink: customerLink,
            subject: `Prosjektdokumentasjon er klar – ${projectTitle}`
          }
        });
        if (error) {
          console.warn("Ferdigmelding kunne ikke sendes:", error.message);
          if (!silent) alert("Prosjektet kan låses, men e-post kunne ikke sendes automatisk. Feil: " + error.message);
          return false;
        }
        if (!silent) alert("✔ Ferdigmelding med kundeportal-link er sendt til kunde.");
        return true;
      } catch (error) {
        console.warn("Ferdigmelding kunne ikke sendes:", error);
        if (!silent) alert("Prosjektet kan låses, men e-post kunne ikke sendes automatisk. Feil: " + (error?.message || String(error)));
        return false;
      }
    };

    const completeOvertagelseAndLock = async () => {
      if (!projectId) return alert("Prosjektet m\xE5 lagres f\xF8r overtagelse kan fullf\xF8res.");
      if (!authUser) return alert("Du m\xE5 v\xE6re logget inn for \xE5 fullf\xF8re overtagelse.");
      const utf\u00F8rendeSigned = hasValue(overtagelse.signUtf\u00F8rende) || hasValue(overtagelse.signUtf\u00F8rendeImage);
      const kundeSigned = hasValue(overtagelse.signKunde) || hasValue(overtagelse.signKundeImage);
      if (!utf\u00F8rendeSigned || !kundeSigned) {
        return alert("B\xE5de utf\xF8rende og kunde m\xE5 signere f\xF8r overtagelse kan fullf\xF8res.");
      }
      const completedOvertagelse = {
        ...emptyOvertagelse(),
        ...overtagelse,
        enabled: true,
        dato: overtagelse.dato || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
      };
      const completedWarranty = warranty?.enabled ? {
        ...emptyWarranty(),
        ...warranty,
        enabled: true,
        termsAccepted: true,
        termsAcceptedAt: warranty?.termsAcceptedAt || (/* @__PURE__ */ new Date()).toISOString(),
        termsAcceptedBy: warranty?.termsAcceptedBy || completedOvertagelse.signKunde || project.customer || "Kunde",
        termsReceiptName: warranty?.termsReceiptName || completedOvertagelse.signKunde || project.customer || "Kunde",
        termsReceiptRole: warranty?.termsReceiptRole || "Kunde"
      } : warranty;
      if (warranty?.enabled) setWarranty(completedWarranty);
      if (warranty?.enabled && !warranty?.issued) {
        const goWarrantyNow = window.confirm(
          "Overtagelse er registrert på et garantiprosjekt.\n\nVil du gå til Garanti nå for å lage garantibevis og komplett rapport/PDF?\n\nViktig: Last ned rapporten og lagre den sikkert på egen PC/server. Prosjektet låses ikke før du er ferdig med garanti og rapport."
        );
        if (goWarrantyNow) {
          setOvertagelse(completedOvertagelse);
          const cleanDataBeforeWarranty = JSON.parse(JSON.stringify({
            company,
            user,
            project: { ...emptyProject(), ...project, locked: false, status: "active", lockedAt: "", lockedBy: "" },
            checked,
            productDocs,
            manualProducts,
            other,
            surf,
            bathroomEquipment,
            photos,
            access,
            inst,
            files,
            checklist,
            tilbud,
            overtagelse: completedOvertagelse,
            warranty: completedWarranty,
            projectLog,
            internalNotes
          }));
          const { error: saveBeforeWarrantyError } = await supabase.from("projects").update({
            data: cleanDataBeforeWarranty,
            title: project.projectName || project.address || "Uten navn",
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          }).eq("id", projectId).eq("user_id", authUser.id);
          if (saveBeforeWarrantyError) {
            console.error(saveBeforeWarrantyError);
            return alert("Kunne ikke lagre overtagelse før garanti: " + saveBeforeWarrantyError.message);
          }
          alert("Overtagelse er lagret. Gå videre med garantibevis og last ned komplett PDF-rapport før prosjektet låses.");
          goToTab("garanti");
          return;
        }
      }
      const shouldOfferCompletionEmail = !!project.customerEmail;
      const completionEmailAccepted = shouldOfferCompletionEmail ? await sendProjectCompletionEmailToCustomer({ askFirst: true, silent: false }) : false;
      if (!shouldOfferCompletionEmail) {
        alert("Kunde e-post mangler. Prosjektet låses uten automatisk kundeutsendelse.");
      }
      const cleanData = JSON.parse(JSON.stringify({
        company,
        user,
        project: { ...emptyProject(), ...project, locked: false, status: "active", lockedAt: "", lockedBy: "" },
        checked,
        productDocs,
        manualProducts,
        other,
        surf,
        bathroomEquipment,
        photos,
        access,
        inst,
        files,
        checklist,
        tilbud,
        overtagelse: completedOvertagelse,
        warranty: completedWarranty,
        projectLog,
        internalNotes
      }));
      const { error: saveError } = await supabase.from("projects").update({
        data: cleanData,
        title: project.projectName || project.address || "Uten navn",
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", projectId).eq("user_id", authUser.id);
      if (saveError) {
        console.error(saveError);
        return alert("Kunne ikke lagre overtagelse f\xF8r l\xE5sing: " + saveError.message);
      }
      setOvertagelse(completedOvertagelse);
      await setProjectLockedState(true);
    };
    const uploadLogo = async (file) => {
      if (!authUser || !file) return;
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `logos/${authUser.id}/${Date.now()}-${cleanName}`;
      const { error } = await supabase.storage.from("project-images").upload(path, file, { cacheControl: "3600", upsert: true });
      if (error) return alert("Kunne ikke laste opp logo: " + error.message);
      const { data } = supabase.storage.from("project-images").getPublicUrl(path);
      setCompany((c) => ({ ...c, logoUrl: data.publicUrl }));
      alert("Logo lastet opp. Husk \xE5 trykke Lagre firmaprofil.");
    };
    const saveProfile = async () => {
      if (!authUser) return alert("Du m\xE5 v\xE6re logget inn.");
      const payload = {
        id: authUser.id,
        email: company.email || authUser.email,
        company_name: company.companyName || "",
        org_number: company.orgNumber || "",
        address: company.address || "",
        phone: company.phone || "",
        website: company.website || "",
        logo_url: company.logoUrl || ""
      };
      const { error } = await supabase.from("profiles").update(payload).eq("id", authUser.id);
      if (error) return alert("Kunne ikke lagre firmaprofil: " + error.message);
      const row = { ...profile || {}, ...payload };
      applyProfile(row);
      alert("Firmaprofil lagret");
    };
    const loadAdminUsers = async () => {
      if (!isAdminUser) return alert("Du har ikke tilgang til admin.");
      setAdminLoading(true);
      const [{ data, error }, { data: termsData, error: termsFetchError }] = await Promise.all([
        supabase.from("profiles").select("id,email,approved,deactivated,company_name,company_role,system_role,role,is_admin,org_number,address,phone,website,logo_url,created_at").order("created_at", { ascending: false }),
        supabase.from("user_terms_acceptance").select("id,user_id,email,version,accepted_at").eq("version", EXPO_PROFFDOK_TERMS_VERSION).order("accepted_at", { ascending: false })
      ]);
      setAdminLoading(false);
      if (error) {
        console.error(error);
        return alert("Kunne ikke hente brukere. Kontakt systemansvarlig hvis feilen vedvarer.");
      }
      if (termsFetchError) {
        console.warn("Kunne ikke hente brukervilkårstatus:", termsFetchError.message);
      }
      setAdminUsers(data || []);
      setAdminTermsAcceptances(termsFetchError ? [] : termsData || []);
    };
    const approveAdminUser = async (id) => {
      if (!isAdminUser) return alert("Du har ikke tilgang til admin.");
      const { error } = await supabase.from("profiles").update({ approved: true, deactivated: false }).eq("id", id);
      if (error) {
        console.error(error);
        return alert("Kunne ikke godkjenne bruker: " + error.message);
      }
      alert("Bruker er godkjent.");
      loadAdminUsers();
    };
    const deactivateAdminUser = async (id) => {
      if (!isAdminUser) return alert("Du har ikke tilgang til admin.");
      if (!window.confirm("Vil du deaktivere denne brukeren? Brukeren vises ikke som ny bruker for godkjenning, men beholdes i historikken.")) return;
      const { error } = await supabase.from("profiles").update({ approved: false, deactivated: true }).eq("id", id);
      if (error) {
        console.error(error);
        return alert("Kunne ikke deaktivere bruker: " + error.message);
      }
      alert("Bruker er deaktivert.");
      loadAdminUsers();
    };
    const reactivateAdminUser = async (id) => {
      if (!isAdminUser) return alert("Du har ikke tilgang til admin.");
      if (!window.confirm("Vil du reaktivere denne brukeren og legge den tilbake som venter på godkjenning?")) return;
      const { error } = await supabase.from("profiles").update({ approved: false, deactivated: false }).eq("id", id);
      if (error) {
        console.error(error);
        return alert("Kunne ikke reaktivere bruker: " + error.message);
      }
      alert("Bruker er reaktivert og ligger nå som venter på godkjenning.");
      loadAdminUsers();
    };
    const updateAdminUserCompanyRole = async (userRow, role) => {
      if (!isAdminUser) return alert("Du har ikke tilgang til systemadmin.");
      if (!userRow?.id) return;
      const cleanRole = role === "firmaadmin" ? "firmaadmin" : "ansatt";
      const currentRole = userRow.company_role === "firmaadmin" ? "firmaadmin" : "ansatt";
      if (cleanRole === currentRole) return;
      const roleLabel = cleanRole === "firmaadmin" ? "Firmaadmin" : "Ansatt";
      const userEmail = userRow.email || "brukeren";
      if (!window.confirm(`Vil du endre firmarollen for ${userEmail} til ${roleLabel}?

Endringen lagres umiddelbart.`)) return;
      const { error } = await supabase.from("profiles").update({ company_role: cleanRole }).eq("id", userRow.id);
      if (error) {
        console.error(error);
        return alert("Kunne ikke endre firmarolle: " + error.message);
      }
      await loadAdminUsers();
      alert(`✔ Firmarolle oppdatert. ${userEmail} er nå ${roleLabel}.`);
    };
    const updateAdminUserCompanyName = async (userRow, nextCompanyValue = "") => {
      if (!isAdminUser) return alert("Du har ikke tilgang til systemadmin.");
      if (!userRow?.id) return;
      const userEmail = userRow.email || "brukeren";
      const current = String(userRow.company_name || "").trim();
      const cleanCompany = String(nextCompanyValue || "").trim();
      if (cleanCompany === current) return;
      if (cleanCompany && !registeredCompanyOptions.includes(cleanCompany)) {
        return alert("Firma må velges fra registrerte firmaer. Oppdater brukerliste/supportdata hvis firmaet mangler.");
      }
      if (!window.confirm(`Vil du flytte ${userEmail} til firma:
${cleanCompany || "(ikke valgt)"}?

Endringen lagres umiddelbart.`)) return;
      const { error } = await supabase.from("profiles").update({ company_name: cleanCompany }).eq("id", userRow.id);
      if (error) {
        console.error(error);
        return alert("Kunne ikke endre firma: " + error.message);
      }
      await loadAdminUsers();
      alert("✔ Firma oppdatert.");
    };
    const setAdminUserSystemAdmin = async (userRow, makeSystemAdmin) => {
      if (!isAdminUser) return alert("Du har ikke tilgang til systemadmin.");
      if (!userRow?.id) return;
      const userEmail = userRow.email || "brukeren";
      if (userRow.id === authUser?.id && !makeSystemAdmin) return alert("Du kan ikke fjerne systemadmin-rollen fra deg selv.");
      const message = makeSystemAdmin
        ? `Vil du gjøre ${userEmail} til SYSTEMADMIN?

Systemadmin kan godkjenne brukere, endre Produktmaster og supportere alle firmaer.`
        : `Vil du fjerne systemadmin-rollen fra ${userEmail}?

Brukeren mister tilgang til Systemadmin, Produktmaster og global brukergodkjenning.`;
      if (!window.confirm(message)) return;
      const payload = makeSystemAdmin
        ? { system_role: "systemadmin", is_admin: true, role: "admin", approved: true, deactivated: false, company_role: userRow.company_role || "firmaadmin" }
        : { system_role: null, is_admin: false, role: "user", company_role: userRow.company_role || "firmaadmin" };
      const { error } = await supabase.from("profiles").update(payload).eq("id", userRow.id);
      if (error) {
        console.error(error);
        return alert("Kunne ikke oppdatere systemadmin-rolle: " + error.message);
      }
      await loadAdminUsers();
      alert(makeSystemAdmin ? "✔ Brukeren er nå systemadmin." : "✔ Systemadmin-rollen er fjernet.");
    };
    const loadCompanyAdminData = async (notify = false) => {
      if (!isCompanyAdminUser) return alert("Du har ikke tilgang til firmaadministrasjon.");
      const companyNameForQuery = currentCompanyName;
      if (!companyNameForQuery) return alert("Firmaprofil mangler firmanavn. Legg inn firmanavn i Firmaprofil først.");
      setCompanyAdminLoading(true);
      const [{ data: usersData, error: usersError }, { data: invitesData, error: invitesError }] = await Promise.all([
        supabase.from("profiles").select("id,email,approved,deactivated,company_name,company_role,system_role,created_at").eq("company_name", companyNameForQuery).order("created_at", { ascending: false }),
        supabase.from("company_user_invites").select("*").eq("company_name", companyNameForQuery).order("created_at", { ascending: false })
      ]);
      setCompanyAdminLoading(false);
      if (usersError) {
        console.error(usersError);
        return alert("Kunne ikke hente brukere i firmaet: " + usersError.message);
      }
      if (invitesError) {
        console.warn("Kunne ikke hente invitasjoner:", invitesError.message);
      }
      const safeUsers = (usersData || []).filter((u) => isSystemAdminUser || u.system_role !== "systemadmin");
      setCompanyUsers(safeUsers);
      setCompanyInvites(invitesData || []);
      if (notify) alert(`Firmaoversikt oppdatert. Fant ${safeUsers.length} bruker${safeUsers.length === 1 ? "" : "e"}.`);
    };
    const inviteCompanyEmployee = async () => {
      if (!isCompanyAdminUser) return alert("Du har ikke tilgang til firmaadministrasjon.");
      const companyNameForInvite = currentCompanyName;
      if (!companyNameForInvite) return alert("Firmaprofil mangler firmanavn. Legg inn firmanavn i Firmaprofil først.");
      const cleanEmail = String(newEmployeeEmail || "").trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes("@")) return alert("Skriv inn en gyldig e-postadresse.");
      const cleanRole = newEmployeeRole === "firmaadmin" ? "firmaadmin" : "ansatt";
      const { data: existingProfile, error: existingError } = await supabase.from("profiles").select("id,email,company_name,company_role,system_role").eq("email", cleanEmail).maybeSingle();
      if (existingError) {
        console.warn("Kunne ikke sjekke eksisterende bruker:", existingError.message);
      }
      if (existingProfile?.system_role === "systemadmin" && !isSystemAdminUser) {
        return alert("Denne brukeren er systemadministrator og kan ikke administreres fra firma.");
      }
      if (existingProfile?.id) {
        const { error: updateError } = await supabase.from("profiles").update({
          company_name: companyNameForInvite,
          company_role: cleanRole,
          approved: true,
          deactivated: false
        }).eq("id", existingProfile.id);
        if (updateError) {
          console.error(updateError);
          return alert("Kunne ikke legge eksisterende bruker til firmaet: " + updateError.message);
        }
      }
      const { error } = await supabase.from("company_user_invites").upsert({
        email: cleanEmail,
        company_name: companyNameForInvite,
        company_role: cleanRole,
        status: existingProfile?.id ? "accepted" : "pending",
        invited_by: authUser?.email || profile?.email || ""
      }, { onConflict: "email,company_name" });
      if (error) {
        console.error(error);
        return alert("Kunne ikke lagre invitasjon: " + error.message);
      }
      let invitationEmailSent = false;
      if (!existingProfile?.id) {
        try {
          const invitationLink = `${window.location.origin}${window.location.pathname}`;
          const { error: inviteMailError } = await supabase.functions.invoke("smart-worker", {
            body: {
              toEmail: cleanEmail,
              direction: "company_user_invite",
              companyName: companyNameForInvite,
              fromName: profile?.email || authUser?.email || "Firmaadministrator",
              message: `Du er invitert til ${companyNameForInvite} i Expo ProffDok. Opprett bruker med denne e-postadressen for å få tilgang til firmaet.`,
              projectLink: invitationLink,
              subject: `Invitasjon til Expo ProffDok – ${companyNameForInvite}`
            }
          });
          invitationEmailSent = !inviteMailError;
          if (inviteMailError) console.warn("Invitasjons-e-post kunne ikke sendes:", inviteMailError.message);
        } catch (emailError) {
          console.warn("Invitasjons-e-post kunne ikke sendes:", emailError);
        }
      }
      setNewEmployeeEmail("");
      setNewEmployeeRole("ansatt");
      await loadCompanyAdminData(false);
      alert(existingProfile?.id ? "✔ Brukeren er lagt til i firmaet." : invitationEmailSent ? "✔ Invitasjon er registrert og e-post er forsøkt sendt til brukeren." : "✔ Invitasjon er registrert. E-post kunne ikke bekreftes sendt, så be brukeren opprette konto med samme e-postadresse.");
    };
    const updateCompanyUserRole = async (userRow, role) => {
      if (!isCompanyAdminUser) return alert("Du har ikke tilgang til firmaadministrasjon.");
      if (!userRow?.id) return;
      if (userRow.system_role === "systemadmin" && !isSystemAdminUser) return alert("Systemadministrator kan ikke endres fra firma.");
      const cleanRole = role === "firmaadmin" ? "firmaadmin" : "ansatt";
      const currentRole = userRow.company_role === "firmaadmin" ? "firmaadmin" : "ansatt";
      if (cleanRole === currentRole) return;
      const roleLabel = cleanRole === "firmaadmin" ? "Firmaadmin" : "Ansatt";
      const userEmail = userRow.email || "brukeren";
      if (!window.confirm(`Vil du endre rollen for ${userEmail} til ${roleLabel}?\n\nEndringen lagres umiddelbart.`)) return;
      const { error } = await supabase.from("profiles").update({ company_role: cleanRole }).eq("id", userRow.id).eq("company_name", currentCompanyName);
      if (error) {
        console.error(error);
        return alert("Kunne ikke endre rolle: " + error.message);
      }
      await loadCompanyAdminData(false);
      alert(`✔ Rolle oppdatert. ${userEmail} er nå ${roleLabel}.`);
    };
    const setCompanyUserDeactivated = async (userRow, deactivated) => {
      if (!isCompanyAdminUser) return alert("Du har ikke tilgang til firmaadministrasjon.");
      if (!userRow?.id) return;
      if (userRow.id === authUser?.id && deactivated) return alert("Du kan ikke deaktivere din egen bruker.");
      if (userRow.system_role === "systemadmin" && !isSystemAdminUser) return alert("Systemadministrator kan ikke deaktiveres fra firma.");
      const message = deactivated ? "Vil du deaktivere denne brukeren i firmaet? Prosjekthistorikk beholdes." : "Vil du reaktivere denne brukeren?";
      if (!window.confirm(message)) return;
      const { error } = await supabase.from("profiles").update({ approved: !deactivated, deactivated: !!deactivated }).eq("id", userRow.id).eq("company_name", currentCompanyName);
      if (error) {
        console.error(error);
        return alert("Kunne ikke oppdatere bruker: " + error.message);
      }
      await loadCompanyAdminData(false);
      alert(deactivated ? "✔ Brukeren er deaktivert." : "✔ Brukeren er reaktivert.");
    };

    const loadFdvRegister = async (notify = false) => {
      setFdvLoading(true);
      const { data, error } = await supabase.from("fdv_register").select("*").order("section", { ascending: true }).order("product_name", { ascending: true });
      setFdvLoading(false);
      if (error) {
        console.error(error);
        return alert("Kunne ikke hente FDV-register. Kontakt systemansvarlig hvis feilen vedvarer. Feil: " + error.message);
      }
      setFdvRegister(data || []);
      if (notify) alert(`FDV-register oppdatert. Fant ${(data || []).length} produkter.`);
    };
    const seedFdvRegister = async () => {
      if (!isAdminUser) return alert("Du har ikke tilgang til FDV-register.");
      if (!window.confirm("Vil du legge inn alle standardproduktene i FDV-registeret? Eksisterende produkter oppdateres ikke, men manglende produkter legges til.")) return;
      setFdvLoading(true);
      const rows = productSections.flatMap((section) => section.items.map((productName) => ({
        section: section.title,
        product_name: productName,
        fdv_url: "",
        comment: "",
        active: true,
        updated_by: authUser?.email || ""
      })));
      const { error } = await supabase.from("fdv_register").upsert(rows, { onConflict: "product_name" });
      setFdvLoading(false);
      if (error) {
        console.error(error);
        return alert("Kunne ikke opprette standardprodukter i FDV-register: " + error.message);
      }
      await loadFdvRegister(false);
      alert("FDV-register er klargjort med standardprodukter.");
    };
    const saveFdvRegisterRow = async (row) => {
      if (!isAdminUser) return alert("Du har ikke tilgang til FDV-register.");
      if (!row?.product_name) return alert("Produktnavn mangler.");
      const payload = {
        section: row.section || "",
        product_name: row.product_name,
        fdv_url: row.fdv_url || "",
        comment: row.comment || "",
        active: row.active !== false,
        updated_by: authUser?.email || ""
      };
      const { data, error } = await supabase.from("fdv_register").upsert(payload, { onConflict: "product_name" }).select("*").single();
      if (error) {
        console.error(error);
        return alert("Kunne ikke lagre FDV-produkt: " + error.message);
      }
      setFdvRegister((prev) => {
        const exists = (prev || []).some((x) => x.product_name === data.product_name);
        return exists ? prev.map((x) => x.product_name === data.product_name ? data : x) : [...prev || [], data].sort((a, b) => `${a.section}${a.product_name}`.localeCompare(`${b.section}${b.product_name}`));
      });
      alert("FDV-produkt lagret.");
    };
    const updateFdvRegisterLocal = (productName, patch) => {
      setFdvRegister((prev) => {
        const list = prev || [];
        const exists = list.some((row) => row.product_name === productName);
        if (!exists) return [...list, { product_name: productName, section: patch.section || "", fdv_url: "", comment: "", active: true, ...patch }];
        return list.map((row) => row.product_name === productName ? { ...row, ...patch } : row);
      });
    };
    const loadProductMaster = async (notify = false) => {
      setProductMasterLoading(true);
      const { data, error } = await supabase.from("product_document_master").select("*").order("category", { ascending: true }).order("product_family", { ascending: true }).order("product_name", { ascending: true });
      setProductMasterLoading(false);
      if (error) {
        console.warn("Kunne ikke hente produktmaster:", error.message);
        if (notify) alert("Kunne ikke hente produktmaster. Kontakt systemansvarlig hvis feilen vedvarer. Feil: " + error.message);
        return;
      }
      setProductMaster(data || []);
      if (notify) alert(`Produktmaster oppdatert. Fant ${(data || []).length} produkter/varianter.`);
    };
    const loadProductMasterCheckpoints = async (notify = false) => {
      setProductMasterCheckpointLoading(true);
      const { data, error } = await supabase.from("product_master_checkpoints").select("*").order("product_no", { ascending: true }).order("sort_order", { ascending: true }).order("created_at", { ascending: true });
      setProductMasterCheckpointLoading(false);
      if (error) {
        console.warn("Kunne ikke hente produktkontrollpunkter:", error.message);
        if (notify) alert("Kunne ikke hente kontrollpunkter fra Produktmaster. Kontakt systemansvarlig hvis feilen vedvarer. Feil: " + error.message);
        return;
      }
      setProductMasterCheckpoints(data || []);
      if (notify) alert(`Sopro garantikontrollpunkter oppdatert. Fant ${(data || []).length} punkt${(data || []).length === 1 ? "" : "er"}.`);
    };
    const productCheckpointDraft = (productNo) => newProductCheckpoints?.[productNo] || emptyNewProductCheckpoint(productNo);
    const updateProductCheckpointDraft = (productNo, patch) => {
      setNewProductCheckpoints((prev) => ({
        ...prev || {},
        [productNo]: {
          ...emptyNewProductCheckpoint(productNo),
          ...prev?.[productNo] || {},
          ...patch,
          product_no: productNo
        }
      }));
    };
    const createProductMasterCheckpoint = async (row) => {
      if (!isAdminUser) return alert("Du har ikke tilgang til produktmaster.");
      if (!isSoproGuaranteeProductMasterRow(row)) return alert("Garantikontrollpunkter brukes kun for Sopro-produkter som inngår i garantisystemet.");
      const productNo = String(row?.product_no || "").trim();
      if (!productNo) return alert("Varenummer mangler.");
      const draft = productCheckpointDraft(productNo);
      const checkpointText = String(draft.checkpoint_text || "").trim();
      if (!checkpointText) return alert("Kontrollpunkttekst mangler.");
      const payload = {
        product_no: productNo,
        checkpoint_text: checkpointText,
        checkpoint_type: productCheckpointTypeOptions.includes(draft.checkpoint_type) ? draft.checkpoint_type : "standard",
        image_required: true,
        comment_required: true,
        guarantee_system: productCheckpointSystemOptions.includes(draft.guarantee_system) ? draft.guarantee_system : "all",
        sort_order: Number.isFinite(Number(draft.sort_order)) ? Number(draft.sort_order) : 0
      };
      const { data, error } = await supabase.from("product_master_checkpoints").insert(payload).select("*").single();
      if (error) {
        console.error(error);
        return alert("Kunne ikke lagre kontrollpunkt: " + error.message);
      }
      setProductMasterCheckpoints((prev) => [...prev || [], data]);
      setNewProductCheckpoints((prev) => ({ ...prev || {}, [productNo]: emptyNewProductCheckpoint(productNo) }));
      alert("✔ Sopro garantikontrollpunkt lagret på produktet.");
    };
    const deleteProductMasterCheckpoint = async (checkpoint) => {
      if (!isAdminUser) return alert("Du har ikke tilgang til produktmaster.");
      if (!checkpoint?.id) return alert("Kontrollpunkt mangler ID.");
      if (!window.confirm("Vil du slette dette Sopro garantikontrollpunktet fra Produktmaster? Dette påvirker ikke eksisterende prosjekter.")) return;
      const { error } = await supabase.from("product_master_checkpoints").delete().eq("id", checkpoint.id);
      if (error) {
        console.error(error);
        return alert("Kunne ikke slette kontrollpunkt: " + error.message);
      }
      setProductMasterCheckpoints((prev) => (prev || []).filter((item) => item.id !== checkpoint.id));
      alert("Sopro garantikontrollpunkt slettet.");
    };
    const updateProductMasterLocal = (productNo, patch) => {
      setProductMaster((prev) => (prev || []).map((row) => row.product_no === productNo ? { ...row, ...patch } : row));
    };
    const saveProductMasterRow = async (row) => {
      if (!isAdminUser) return alert("Du har ikke tilgang til produktmaster.");
      if (!row?.product_no) return alert("Varenummer mangler.");
      const payload = {
        fdv_url: row.fdv_url || "",
        datablad_url: row.datablad_url || "",
        dop_url: row.dop_url || "",
        epd_url: row.epd_url || "",
        sikkerhetsdatablad_url: row.sikkerhetsdatablad_url || "",
        document_file_url: row.document_file_url || "",
        comment: row.comment || "",
        active: row.active !== false
      };
      const { data, error } = await supabase.from("product_document_master").update(payload).eq("product_no", row.product_no).select("*").single();
      if (error) {
        console.error(error);
        return alert("Kunne ikke lagre produktmaster-rad: " + error.message);
      }
      const nextMasterRows = (productMaster || []).map((x) => x.product_no === data.product_no ? data : x);
      setProductMaster(nextMasterRows);
      const namesForSync = productNamesForMasterRow(data);
      if (window.confirm("Produktdokumentasjon er lagret i Produktmaster.\n\nVil du også synke aktive prosjekter som bruker dette produktet?\n\nLåste og arkiverte prosjekter blir ikke endret.")) {
        await syncActiveProjectsWithProductMaster({ askFirst: false, productNames: namesForSync, masterRows: nextMasterRows });
      } else {
        alert("Produktdokumentasjon lagret i Produktmaster. Aktive prosjekter ble ikke synket nå.");
      }
    };
    const createProductMasterRow = async () => {
      if (!isAdminUser) return alert("Du har ikke tilgang til produktmaster.");
      const productNo = String(newProductMaster.product_no || "").trim();
      const productName = String(newProductMaster.product_name || "").trim();
      if (!productNo) return alert("Varenummer mangler.");
      if (!productName) return alert("Produktnavn mangler.");
      if (newProductMaster.createCheckpoint && !isSoproGuaranteeProductMasterRow(newProductMaster)) return alert("Garantikontrollpunkt kan kun legges til samtidig for Sopro-produkter som inngår i garantisystemet. Fjern avhukingen eller skriv inn et Sopro-produkt.");
      const payload = {
        product_no: productNo,
        product_name: productName,
        product_family: newProductMaster.product_family || productName,
        category: newProductMaster.category || "Andre produkter",
        app_match_name: newProductMaster.showInProducts ? productName : "",
        used_in_app_standard_list: !!newProductMaster.showInProducts,
        fdv_url: newProductMaster.fdv_url || "",
        datablad_url: newProductMaster.datablad_url || "",
        dop_url: newProductMaster.dop_url || "",
        epd_url: newProductMaster.epd_url || "",
        sikkerhetsdatablad_url: newProductMaster.sikkerhetsdatablad_url || "",
        document_file_url: newProductMaster.document_file_url || "",
        comment: formatProductMasterComment(newProductMaster),
        active: true
      };
      const { data, error } = await supabase.from("product_document_master").upsert(payload, { onConflict: "product_no" }).select("*").single();
      if (error) {
        console.error(error);
        return alert("Kunne ikke opprette produkt i Produktmaster: " + error.message);
      }
      const nextMasterRowsAfterCreate = (() => {
        const exists = (productMaster || []).some((row) => row.product_no === data.product_no);
        return exists ? (productMaster || []).map((row) => row.product_no === data.product_no ? data : row) : [data, ...productMaster || []];
      })();
      setProductMaster(nextMasterRowsAfterCreate);
      let checkpointCreated = false;
      if (newProductMaster.createCheckpoint && hasValue(newProductMaster.checkpoint_text)) {
        const checkpointPayload = {
          product_no: productNo,
          checkpoint_text: String(newProductMaster.checkpoint_text || "").trim(),
          checkpoint_type: productCheckpointTypeOptions.includes(newProductMaster.checkpoint_type) ? newProductMaster.checkpoint_type : "standard",
          image_required: true,
          comment_required: true,
          guarantee_system: productCheckpointSystemOptions.includes(newProductMaster.guarantee_system) ? newProductMaster.guarantee_system : "all",
          sort_order: Number.isFinite(Number(newProductMaster.sort_order)) ? Number(newProductMaster.sort_order) : 0
        };
        const { data: checkpointData, error: checkpointError } = await supabase.from("product_master_checkpoints").insert(checkpointPayload).select("*").single();
        if (checkpointError) {
          console.error(checkpointError);
          alert("Produktet ble lagret, men kontrollpunktet kunne ikke lagres: " + checkpointError.message);
        } else if (checkpointData) {
          checkpointCreated = true;
          setProductMasterCheckpoints((prev) => [...prev || [], checkpointData]);
          setOpenProductCheckpointPanels((prev) => ({ ...prev || {}, [productNo]: true }));
        }
      }
      setNewProductMaster(emptyNewProductMaster());
      const createMessage = "✔ Produktet er lagret i Produktmaster" + (payload.used_in_app_standard_list ? " og vil vises i Produkter-fanen etter oppdatering." : ".") + (checkpointCreated ? " Sopro garantikontrollpunkt er også lagret." : "");
      if (window.confirm(createMessage + "\n\nVil du også synke aktive prosjekter som bruker dette produktet?\n\nLåste og arkiverte prosjekter blir ikke endret.")) {
        await syncActiveProjectsWithProductMaster({ askFirst: false, productNames: productNamesForMasterRow(data), masterRows: nextMasterRowsAfterCreate });
      } else {
        alert(createMessage + "\n\nAktive prosjekter ble ikke synket nå.");
      }
    };
    const productMasterRowsWithOverride = (overrideRows = productMaster) => Array.isArray(overrideRows) ? overrideRows : productMaster || [];

    const buildProductMasterMapFromRows = (rows = productMaster) => {
      const map = {};
      const scoreRow = (row) => [row?.fdv_url, row?.datablad_url, row?.dop_url, row?.epd_url, row?.sikkerhetsdatablad_url, row?.document_file_url].filter(hasValue).length;
      const addKey = (key, row) => {
        const cleanKey = String(key || "").trim();
        if (!cleanKey) return;
        if (!map[cleanKey] || scoreRow(row) > scoreRow(map[cleanKey])) map[cleanKey] = row;
      };
      (rows || []).forEach((row) => {
        addKey(row?.app_match_name, row);
        addKey(row?.product_family, row);
        addKey(row?.product_name, row);
      });
      return map;
    };

    const mergeProductDocsFromMaster = (productName, current = {}, rows = productMaster) => {
      const masterMap = buildProductMasterMapFromRows(rows);
      const masterRow = masterMap[productName] || {};
      const next = { ...current };
      if (hasValue(masterRow.fdv_url)) next.fdvUrl = masterRow.fdv_url;
      if (hasValue(masterRow.datablad_url)) next.databladUrl = masterRow.datablad_url;
      if (hasValue(masterRow.dop_url)) next.dopUrl = masterRow.dop_url;
      if (hasValue(masterRow.epd_url)) next.epdUrl = masterRow.epd_url;
      if (hasValue(masterRow.sikkerhetsdatablad_url)) next.sikkerhetsdatabladUrl = masterRow.sikkerhetsdatablad_url;
      if (hasValue(masterRow.document_file_url)) next.documentFileUrl = masterRow.document_file_url;
      if ([masterRow.fdv_url, masterRow.datablad_url, masterRow.dop_url, masterRow.epd_url, masterRow.sikkerhetsdatablad_url, masterRow.document_file_url].some(hasValue)) next.fdvSource = "product-master";
      return next;
    };

    const productNamesForMasterRow = (row = {}) => [row.app_match_name, row.product_name, row.product_family].filter(hasValue).map((value) => String(value).trim());

    const syncActiveProjectsWithProductMaster = async ({ askFirst = true, productNames = null, masterRows = productMaster } = {}) => {
      if (!isAdminUser) return alert("Du har ikke tilgang til Produktmaster-synk.");
      const filterNames = Array.isArray(productNames) && productNames.length ? new Set(productNames.filter(hasValue).map((name) => String(name).trim())) : null;
      const filterText = filterNames ? `\n\nSynken begrenses til produkt: ${Array.from(filterNames).join(", ")}` : "";
      if (askFirst && !window.confirm(`Vil du synke aktive prosjekter med Produktmaster?\n\nDette oppdaterer FDV, datablad, DOP, EPD, sikkerhetsdatablad og produkt-/leverandørside på produkter som allerede er valgt i aktive prosjekter.\n\nLåste og arkiverte prosjekter blir ikke endret.${filterText}`)) return;
      try {
        const { data: rows, error } = await supabase.from("projects").select("*").order("updated_at", { ascending: false });
        if (error) {
          console.error(error);
          return alert("Kunne ikke hente prosjekter for synk: " + error.message);
        }

        let checkedProjectCount = 0;
        let updatedProjectCount = 0;
        let updatedProductCount = 0;
        let skippedLockedCount = 0;
        let skippedNoProductsCount = 0;
        let missingMasterCount = 0;
        let failedCount = 0;
        const rowsToRefresh = [];

        for (const row of rows || []) {
          if (rowIsLocked(row)) {
            skippedLockedCount += 1;
            continue;
          }
          const existingData = dataFromRow(row);
          if (projectIsLocked(existingData.project)) {
            skippedLockedCount += 1;
            continue;
          }
          checkedProjectCount += 1;
          const rowChecked = existingData.checked || {};
          const selectedNames = Object.keys(rowChecked).filter((name) => rowChecked?.[name]);
          const namesToSync = filterNames ? selectedNames.filter((name) => filterNames.has(String(name).trim())) : selectedNames;
          if (!namesToSync.length) {
            skippedNoProductsCount += 1;
            continue;
          }

          const nextProductDocs = { ...existingData.productDocs || {} };
          let projectChanged = false;

          namesToSync.forEach((productName) => {
            const current = nextProductDocs[productName] || {};
            const merged = mergeProductDocsFromMaster(productName, current, masterRows);
            const hasAutoDocs = [merged.fdvUrl, merged.databladUrl, merged.dopUrl, merged.epdUrl, merged.sikkerhetsdatabladUrl, merged.documentFileUrl].some(hasValue);
            if (!hasAutoDocs) {
              missingMasterCount += 1;
              return;
            }
            const keys = ["fdvUrl", "databladUrl", "dopUrl", "epdUrl", "sikkerhetsdatabladUrl", "documentFileUrl", "fdvSource"];
            const changed = keys.some((key) => (current[key] || "") !== (merged[key] || ""));
            if (!changed) return;
            nextProductDocs[productName] = merged;
            projectChanged = true;
            updatedProductCount += 1;
          });

          if (!projectChanged) continue;

          const cleanData = JSON.parse(JSON.stringify({
            ...existingData,
            productDocs: nextProductDocs,
            project: { ...emptyProject(), ...existingData.project || {}, locked: false, status: existingData.project?.status || "active", lockedAt: "", lockedBy: "" }
          }));

          const { error: updateError } = await supabase.from("projects").update({
            data: cleanData,
            title: existingData.project?.projectName || existingData.project?.address || row.title || "Uten navn",
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          }).eq("id", row.id);

          if (updateError) {
            console.error(updateError);
            failedCount += 1;
          } else {
            updatedProjectCount += 1;
            rowsToRefresh.push(row.id);
          }
        }

        await loadProjects(authUser);
        if (projectId && rowsToRefresh.includes(projectId)) {
          await refreshProjectFromCloud(true, true);
        }

        return alert(`Synk mot Produktmaster fullført.\n\nAktive prosjekter kontrollert: ${checkedProjectCount}\nProsjekter oppdatert: ${updatedProjectCount}\nProduktlinjer oppdatert: ${updatedProductCount}\nLåste/arkiverte prosjekter hoppet over: ${skippedLockedCount}\nAktive prosjekter uten aktuelle produkter: ${skippedNoProductsCount}\nProduktvalg uten dokumenttreff i Produktmaster: ${missingMasterCount}\nFeil: ${failedCount}`);
      } catch (error) {
        console.error("Synk mot Produktmaster feilet:", error);
        return alert("Kunne ikke synke aktive prosjekter med Produktmaster. Feil: " + (error?.message || String(error)));
      }
    };

    const syncCurrentProjectProducts = async () => {
      try {
        if (!projectId) return alert("Åpne et prosjekt først hvis du vil synke kun dette prosjektet.");
        if (isProjectLocked) return alert("Prosjektet er låst og fungerer som arkiv. Produktdokumentasjon kan ikke oppdateres fra Produktmaster.");
        const checkedNames = effectiveProductSections.flatMap((section) => section.items).filter((name) => checked?.[name]);
        if (!checkedNames.length) return alert("Ingen standardprodukter er valgt i dette prosjektet.");

        let existingRowForSave = null;
        if (projectId && authUser) {
          const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
          if (fetchError || !existing) {
            console.error(fetchError);
            return alert("Produktdokumentasjon ble ikke oppdatert fordi prosjektet ikke kunne kontrolleres: " + (fetchError?.message || "Fant ikke prosjekt"));
          }
          if (rowIsLocked(existing)) {
            const lockedProject = projectFromRow(existing, existing?.data?.project || {});
            setProject(lockedProject);
            return alert("Prosjektet er låst og fungerer som arkiv. Dokumentlenker fra Produktmaster kan ikke synkes inn i låste prosjekter.");
          }
          existingRowForSave = existing;
        }

        let updatedCount = 0;
        let missingCount = 0;
        const nextProductDocs = { ...productDocs };
        checkedNames.forEach((productName) => {
          const current = nextProductDocs[productName] || {};
          const merged = mergeProductDocsFromMaster(productName, current, productMaster);
          const hasAutoDocs = [merged.fdvUrl, merged.databladUrl, merged.dopUrl, merged.epdUrl, merged.sikkerhetsdatabladUrl, merged.documentFileUrl].some(hasValue);
          if (!hasAutoDocs) {
            missingCount += 1;
            return;
          }
          const keys = ["fdvUrl", "databladUrl", "dopUrl", "epdUrl", "sikkerhetsdatabladUrl", "documentFileUrl", "fdvSource"];
          const changed = keys.some((key) => (current[key] || "") !== (merged[key] || ""));
          if (changed) updatedCount += 1;
          nextProductDocs[productName] = merged;
        });

        setProductDocs(nextProductDocs);
        let savedToCloud = false;
        if (projectId && authUser && existingRowForSave) {
          const existingData = dataFromRow(existingRowForSave);
          const cleanData = JSON.parse(JSON.stringify({
            ...existingData,
            company,
            user,
            project: { ...emptyProject(), ...existingData.project || {}, ...project },
            checked,
            productDocs: nextProductDocs,
            manualProducts,
            other,
            surf,
            bathroomEquipment,
            photos,
            access,
            inst,
            files,
            checklist,
            tilbud,
            overtagelse,
            warranty,
            projectLog,
            internalNotes
          }));
          const { error: updateError } = await supabase.from("projects").update({
            data: cleanData,
            title: project.projectName || project.address || existingRowForSave.title || "Uten navn",
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          }).eq("id", projectId);
          if (updateError) {
            console.error(updateError);
            return alert("Dokumentoppdatering er gjort på skjermen, men kunne ikke lagres automatisk: " + updateError.message);
          }
          savedToCloud = true;
        }
        const saveText = savedToCloud ? " Prosjektet er lagret." : " Trykk Lagre / oppdater prosjekt for å lagre endringen.";
        if (updatedCount > 0) return alert(`Dokumentoppdatering fullført. ${updatedCount} produkt${updatedCount === 1 ? "" : "er"} fikk dokumentlinker oppdatert.${missingCount ? ` ${missingCount} valgt${missingCount === 1 ? "" : "e"} produkt${missingCount === 1 ? "" : "er"} manglet match i Produktmaster.` : ""}${saveText}`);
        if (missingCount > 0) return alert(`Dokumentoppdatering fullført, men ingen nye dokumentlinker ble lagt til. ${missingCount} valgt${missingCount === 1 ? "" : "e"} produkt${missingCount === 1 ? "" : "er"} manglet match i Produktmaster.${saveText}`);
        return alert("Dokumentoppdatering fullført. Valgte produkter hadde allerede dokumentlinker." + saveText);
      } catch (error) {
        console.error("Dokumentoppdatering feilet:", error);
        return alert("Kunne ikke oppdatere produktdokumentasjon. Feil: " + (error?.message || String(error)));
      }
    };
    const signIn = async () => {
      const cleanEmail = authEmail.trim();
      if (!cleanEmail || !authPassword) return alert("Fyll inn e-post og passord.");
      window.localStorage.setItem("expoProffDokAuthEmail", cleanEmail);
      const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password: authPassword });
      if (error) return alert("Kunne ikke logge inn: " + error.message);
    };
    const signUp = async () => {
      const cleanEmail = authEmail.trim();
      if (!cleanEmail || !authPassword) return alert("Fyll inn e-post og passord.");
      window.localStorage.setItem("expoProffDokAuthEmail", cleanEmail);
      const { error } = await supabase.auth.signUp({ email: cleanEmail, password: authPassword });
      if (error) return alert("Kunne ikke opprette bruker: " + error.message);
      alert("Bruker opprettet. Kontoen m\xE5 godkjennes f\xF8r appen kan brukes.");
    };
    const resetPassword = async () => {
      const cleanEmail = authEmail.trim();
      if (!cleanEmail) return alert("Skriv inn e-postadressen din f\xF8rst.");
      window.localStorage.setItem("expoProffDokAuthEmail", cleanEmail);
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: "https://expo-proffdok.vercel.app"
      });
      if (error) return alert("Kunne ikke sende tilbakestilling: " + error.message);
      alert("E-post for tilbakestilling av passord er sendt. Sjekk innboksen din.");
    };
    const completePasswordReset = async () => {
      if (!newPassword || !newPasswordRepeat) return alert("Skriv inn nytt passord to ganger.");
      if (newPassword !== newPasswordRepeat) return alert("Passordene er ikke like.");
      if (newPassword.length < 6) return alert("Passordet m\xE5 v\xE6re minst 6 tegn.");
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return alert("Kunne ikke oppdatere passord: " + error.message);
      setNewPassword("");
      setNewPasswordRepeat("");
      setPasswordRecovery(false);
      window.history.replaceState({}, document.title, window.location.pathname);
      await supabase.auth.signOut();
      setAuthUser(null);
      setProfile(null);
      setProjects([]);
      setTab("prosjekt");
      alert("Passordet er oppdatert. Logg inn p\xE5 nytt.");
    };
    const signOut = async () => {
      await supabase.auth.signOut();
      setProjectId(null);
      setCurrentProjectOwnerId("");
      setMobileCreatingProject(false);
      setProjects([]);
      setProfile(null);
      setTermsAccepted(false);
      setTermsLoading(false);
      setTermsAccepting(false);
      setTermsError("");
      setTermsReadConfirmed(false);
      resetToCleanStartPage();
      window.history.replaceState({}, document.title, window.location.pathname);
    };
    const writePrintableReport = (printWindow, title = "Expo ProffDok rapport") => {
      const reportNode = document.querySelector(".report");
      if (!reportNode) {
        if (printWindow && !printWindow.closed) printWindow.close();
        alert("Rapporten er ikke klar ennå. Prøv igjen om et øyeblikk.");
        return;
      }

      const reportClone = reportNode.cloneNode(true);
      reportClone.querySelectorAll("a[href]").forEach((link) => {
        const normalizedHref = normalizeExternalUrl(link.getAttribute("href"));
        if (!normalizedHref) return;
        link.setAttribute("href", normalizedHref);
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      });

      const inlineStyles = Array.from(document.querySelectorAll("style")).map((style) => style.innerHTML).join("\n");
      const reportHtml = reportClone.outerHTML;

      const printDocument = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    ${inlineStyles}
    body {
      margin: 0;
      padding: 24px;
      background: #ffffff;
      color: #0f172a;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 14px;
      line-height: 1.45;
    }
    .report {
      max-width: 920px;
      margin: 0 auto;
      background: #ffffff;
    }
    section {
      border: 1px solid #dbe7ec;
      border-radius: 18px;
      padding: 18px;
      margin: 0 0 18px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    h2 {
      margin: 0 0 12px;
      border-bottom: 1px solid #0f172a;
      padding-bottom: 8px;
      font-size: 22px;
    }
    h3 { margin: 14px 0 8px; }
    .out {
      border: 1px solid #dbe7ec;
      border-radius: 14px;
      padding: 10px;
      margin: 8px 0;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }
    .reportTop {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    .photos {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }
    .photo img {
      max-width: 100%;
      height: auto;
      border-radius: 10px;
    }
    a[href] {
      color: #0645ad !important;
      text-decoration: underline !important;
      cursor: pointer;
      font-weight: 700;
    }
    .pdfSafeUrl {
      display: block !important;
      color: #334155 !important;
      font-size: 10px !important;
      overflow-wrap: anywhere;
      word-break: break-word;
      margin-top: 2px;
    }
    footer {
      text-align: center;
      color: #64748b;
      font-size: 12px;
      margin-top: 28px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
    }
    button, nav, .mobileFieldBar, .mobileNav, .mobileCurrentProjectBar, .bottomAppNav {
      display: none !important;
    }
    @media print {
      body { padding: 0; }
      a[href] {
        color: #0645ad !important;
        text-decoration: underline !important;
      }
      .pdfSafeUrl {
        display: block !important;
      }
    }
  </style>
</head>
<body>
  ${reportHtml}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 250);
    };
  </script>
</body>
</html>`;

      printWindow.document.open();
      printWindow.document.write(printDocument);
      printWindow.document.close();
    };

    const printVisibleReport = () => {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Nettleseren blokkerte utskriftsvinduet. Tillat popup-vinduer og prøv igjen.");
        return;
      }
      setTimeout(() => writePrintableReport(printWindow), 150);
    };

    const printReport = () => {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Nettleseren blokkerte utskriftsvinduet. Tillat popup-vinduer og prøv igjen.");
        return;
      }
      setTab("rapport");
      setTimeout(() => writePrintableReport(printWindow), 650);
    };

    const setPdfProgress = (message = "Genererer rapport…", subMessage = "") => {
      let overlay = document.getElementById("expo-pdf-progress-overlay");
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "expo-pdf-progress-overlay";
        overlay.setAttribute("role", "status");
        overlay.setAttribute("aria-live", "polite");
        overlay.style.position = "fixed";
        overlay.style.inset = "0";
        overlay.style.zIndex = "99999";
        overlay.style.background = "rgba(15, 23, 42, 0.58)";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.padding = "18px";
        document.body.appendChild(overlay);
      }
      overlay.innerHTML = `
        <div style="width:min(420px, calc(100vw - 32px)); background:#ffffff; border-radius:18px; box-shadow:0 24px 70px rgba(15,23,42,.28); padding:22px; font-family:Arial, Helvetica, sans-serif; color:#0f172a;">
          <div style="display:flex; gap:14px; align-items:center;">
            <div style="width:34px; height:34px; border:4px solid #dbeafe; border-top-color:#1456a0; border-radius:50%; animation:expoPdfSpin .8s linear infinite;"></div>
            <div>
              <div style="font-weight:800; font-size:16px;">${message}</div>
              <div style="font-size:13px; color:#475569; margin-top:4px;">${subMessage || "Dette kan ta litt tid ved mange bilder."}</div>
            </div>
          </div>
          <style>@keyframes expoPdfSpin{to{transform:rotate(360deg)}}</style>
        </div>`;
    };
    const clearPdfProgress = (delay = 0) => {
      window.setTimeout(() => {
        const overlay = document.getElementById("expo-pdf-progress-overlay");
        if (overlay) overlay.remove();
      }, delay);
    };

    const downloadClickablePdfReport = async () => {
      try {
        const archiveConfirmed = window.confirm("Viktig før nedlasting:\n\nNår prosjektet er ferdig skal komplett PDF-rapport lagres lokalt hos utførende firma, og gjerne også oversendes kunde. Expo ProffDok benytter skylagring, men kan ikke garantere ubegrenset lagringstid eller tilgjengelighet av prosjektdata i hele garanti- eller byggets levetid.\n\nVil du fortsette og generere komplett PDF-rapport nå?");
        if (!archiveConfirmed) return;
        setPdfProgress("Genererer rapport…", "Starter PDF-motor og klargjør rapporten.");
        await new Promise((resolve) => setTimeout(resolve, 60));
        const module = await import("https://esm.sh/jspdf@2.5.1");
        const JsPDF = module.jsPDF || module.default?.jsPDF;
        if (!JsPDF) throw new Error("Kunne ikke laste PDF-motor.");
        const doc = new JsPDF({ unit: "mm", format: "a4", compress: true });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 14;
        const contentWidth = pageWidth - margin * 2;
        let y = 16;

        const cleanReportText = (value) => {
          let text = value === void 0 || value === null ? "" : String(value);
          try {
            text = text.normalize("NFC");
          } catch {}
          // jsPDF standardfont støtter ikke enkelte emoji/symboler. Disse ble vist som Ø=ÜÄ i PDF.
          text = text
            .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
            .replace(/Ø=ÜÄ\s*/g, "")
            .replace(/['\u0013]\s*/g, "")
            .replace(/\s+/g, " ");
          return text.trim();
        };
        const safeText = (value) => cleanReportText(value);
        const filenameSafe = (value) => safeText(value || "FDV-rapport").replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ").trim().slice(0, 80) || "FDV-rapport";
        const normalizePdfUrl = (value) => normalizeExternalUrl(value);
        const isLikelyRawFileName = (value = "") => /^image[a-f0-9-]{8,}\.(jpe?g|png|webp|heic|heif)$/i.test(safeText(value).trim()) || /^[a-f0-9-]{16,}\.(jpe?g|png|webp|heic|heif)$/i.test(safeText(value).trim());
        const cleanPdfCaption = (caption = "", fallback = "Dokumentert bilde") => {
          const clean = safeText(caption).trim();
          if (!clean || isLikelyRawFileName(clean)) return fallback;
          return clean;
        };
        const storedFileUrl = (file = {}) => normalizePdfUrl(publicProjectFileUrl(file));
        const fileIdentityText = (file = {}) => [file?.name, file?.url, file?.path, file?.type, file?.mimeType, file?.contentType].filter(Boolean).join(" ");
        const isLikelyDocumentFile = (file = {}) => /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|csv|txt|rtf|odt|ods|odp)(\?|#|$)/i.test(fileIdentityText(file)) || /application\/(pdf|msword|vnd\.)/i.test(fileIdentityText(file));
        const isLikelyImageFile = (file = {}) => /\.(jpe?g|png|gif|webp|bmp|svg|heic|heif)(\?|#|$)/i.test(fileIdentityText(file)) || /^image\//i.test(safeText(file?.type || file?.mimeType || file?.contentType));
        const cleanCompanyPhoneForReport = (value = "") => {
          const clean = safeText(value).trim();
          if (!clean) return "";
          if (/^\d{4}\s+[A-Za-zÆØÅæøå .-]+$/.test(clean)) return "";
          if (/@/.test(clean) || /www\.|https?:\/\//i.test(clean)) return "";
          return clean;
        };
        const companyPhoneForReport = cleanCompanyPhoneForReport(company.phone);
        const reportAddressLine = () => [project.address, project.postnr, project.city].filter(Boolean).join(", ");
        const reportGeneratedAtLabel = () => new Date().toLocaleString("no-NO");
        const countReportAttachments = () => {
          let total = Array.isArray(files) ? files.filter((file) => hasValue(file?.name) || hasValue(file?.url) || hasValue(file?.path)).length : 0;
          Object.values(checklist || {}).forEach((items) => {
            Object.values(items || {}).forEach((value) => {
              total += (value?.photos || []).filter((file) => isLikelyDocumentFile(file)).length;
            });
          });
          (inst || []).forEach((entry) => {
            total += (entry?.photos || []).filter((file) => isLikelyDocumentFile(file)).length;
          });
          total += Array.isArray(tilbud?.files) ? tilbud.files.filter((file) => hasValue(file?.name) || hasValue(file?.url) || hasValue(file?.path)).length : 0;
          return total;
        };
        const makeReportDocumentNumber = () => {
          const guarantee = safeText(warranty?.guaranteeNumber || "").trim();
          if (guarantee) return `${guarantee}-FDV-001`;
          const idPart = safeText(projectId || "").trim().slice(0, 8).toUpperCase();
          return `PROJECT-${idPart || "UTKAST"}-FDV-001`;
        };
        const reportDocumentationStatus = () => {
          const entries = Object.values(checklist || {}).flatMap((items) => Object.values(items || {}));
          const checklistTotal = activeChecklistTemplate.reduce((sum, group) => sum + (group.items || []).length, 0);
          const checklistDone = entries.filter((value) => hasValue(value?.status)).length;
          const openDeviationTotal = getOpenDeviationCount(checklist);
          const productTotal = (selected || []).length + (manualSelected || []).length;
          const photoTotal = (photos || []).filter((photo) => hasValue(photo?.url)).length;
          const attachmentTotal = countReportAttachments();
          const items = [
            { label: "Prosjektinformasjon", ok: [project.projectName, project.address, project.customer].some(hasValue), detail: "Prosjektnavn, kunde og adresse" },
            { label: "Produkter / FDV", ok: productTotal > 0, detail: `${productTotal} produkt${productTotal === 1 ? "" : "er"} dokumentert` },
            { label: "Bildedokumentasjon", ok: photoTotal > 0, detail: `${photoTotal} bilde${photoTotal === 1 ? "" : "r"} registrert` },
            { label: "Sjekklister", ok: checklistTotal > 0 && checklistDone >= checklistTotal, detail: `${checklistDone}/${checklistTotal || checklistDone} kontrollpunkt vurdert` },
            { label: "Avvik", ok: openDeviationTotal === 0, detail: openDeviationTotal ? `${openDeviationTotal} åpne avvik` : "Ingen åpne avvik" },
            { label: "Vedlegg", ok: attachmentTotal > 0, detail: `${attachmentTotal} vedlegg` },
            { label: "Overtagelse", ok: projectHasOvertagelse(overtagelse), detail: projectHasOvertagelse(overtagelse) ? "Registrert" : "Ikke registrert" },
            { label: "Garanti", ok: !!warranty?.issued || !warranty?.enabled, detail: warranty?.issued ? `${getWarrantyYears(warranty)} år · ${warranty?.guaranteeNumber || "aktiv"}` : warranty?.enabled ? "Ikke utstedt" : "Ikke aktivert" }
          ];
          const percent = Math.round(items.filter((item) => item.ok).length / items.length * 100);
          return { items, percent, productTotal, photoTotal, checklistTotal, checklistDone, openDeviationTotal, attachmentTotal };
        };
        const ensureSpace = (height = 8) => {
          if (y + height <= pageHeight - 18) return;
          doc.addPage();
          y = 16;
        };
        const addSectionTitle = (title) => {
          ensureSpace(16);
          y += 2;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(15);
          doc.setTextColor(15, 23, 42);
          doc.text(safeText(title), margin, y);
          y += 3;
          doc.setDrawColor(15, 23, 42);
          doc.setLineWidth(0.25);
          doc.line(margin, y, pageWidth - margin, y);
          y += 7;
        };
        const addSectionPageBreak = (title) => {
          if (y > 24) {
            doc.addPage();
            y = 16;
          }
          addSectionTitle(title);
        };
        const makeCoverCroppedImage = async (imageInfo, targetW, targetH) => {
          // FASE 13.15.3: Bevar proporsjoner på forsidebildet.
          // Bildet fyller banneret som object-fit: cover, men blir ikke strukket/forvridd.
          if (!imageInfo?.dataUrl || !imageInfo?.width || !imageInfo?.height) return imageInfo?.dataUrl || "";
          try {
            const sourceImage = await new Promise((resolve) => {
              const img = new window.Image();
              img.onload = () => resolve(img);
              img.onerror = () => resolve(null);
              img.src = imageInfo.dataUrl;
            });
            if (!sourceImage) return imageInfo.dataUrl;
            const sourceW = imageInfo.width || sourceImage.width || 1;
            const sourceH = imageInfo.height || sourceImage.height || 1;
            const targetRatio = targetW / targetH;
            const sourceRatio = sourceW / sourceH;
            let sx = 0;
            let sy = 0;
            let sw = sourceW;
            let sh = sourceH;
            if (sourceRatio > targetRatio) {
              sw = sourceH * targetRatio;
              sx = (sourceW - sw) / 2;
            } else if (sourceRatio < targetRatio) {
              sh = sourceW / targetRatio;
              sy = (sourceH - sh) / 2;
            }
            const canvas = document.createElement("canvas");
            canvas.width = 1600;
            canvas.height = Math.max(1, Math.round(canvas.width / targetRatio));
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(sourceImage, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
            return canvas.toDataURL("image/jpeg", 0.88);
          } catch (error) {
            console.warn("Kunne ikke beskjære forsidebilde:", error);
            return imageInfo.dataUrl;
          }
        };

        const addCoverPage = async () => {
          const generatedAt = reportGeneratedAtLabel();
          const status = reportDocumentationStatus();
          const openDeviationTotal = status.openDeviationTotal;
          const productTitle = project.projectName || project.address || "Prosjektdokumentasjon";
          const addressLine = reportAddressLine();
          const coverImage = (photos || []).slice().reverse().find((photo) => hasValue(photo?.url) && /ferdig|resultat/i.test(String(photo?.cat || photo?.name || ""))) || (photos || []).slice().reverse().find((photo) => hasValue(photo?.url));
          doc.setFillColor(8, 18, 30);
          doc.rect(0, 0, pageWidth, pageHeight, "F");
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(8, 8, pageWidth - 16, pageHeight - 20, 5, 5, "F");

          if (coverImage?.url) {
            const cover = await loadPdfImage(coverImage.url);
            if (cover && !cover.error) {
              const imgX = 12;
              const imgY = 12;
              const imgW = pageWidth - 24;
              const imgH = 78;
              const coverCroppedDataUrl = await makeCoverCroppedImage(cover, imgW, imgH);
              doc.addImage(coverCroppedDataUrl, "JPEG", imgX, imgY, imgW, imgH);
              doc.setFillColor(8, 18, 30);
              doc.setGState && doc.setGState(new doc.GState({ opacity: 0.58 }));
              doc.rect(imgX, imgY, imgW, imgH, "F");
              doc.setGState && doc.setGState(new doc.GState({ opacity: 1 }));
            }
          } else {
            doc.setFillColor(12, 42, 82);
            doc.roundedRect(12, 12, pageWidth - 24, 78, 3, 3, "F");
          }

          if (company.logoUrl) {
            const logoImage = await loadPdfImage(company.logoUrl);
            if (logoImage && !logoImage.error) {
              let logoW = 44;
              let logoH = logoW * (logoImage.height / logoImage.width);
              if (logoH > 18) {
                logoH = 18;
                logoW = logoH * (logoImage.width / logoImage.height);
              }
              doc.setFillColor(255, 255, 255);
              doc.roundedRect(margin, 18, logoW + 8, logoH + 7, 2.5, 2.5, "F");
              doc.addImage(logoImage.dataUrl, logoImage.format || "PNG", margin + 4, 21, logoW, logoH);
            }
          }

          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(8, 213, 216);
          doc.text("EXPO PROFFDOK", pageWidth - margin, 24, { align: "right" });
          doc.setFontSize(8);
          doc.setTextColor(226, 232, 240);
          doc.text("FDV-rapport · prosjektdokumentasjon", pageWidth - margin, 31, { align: "right" });

          doc.setFont("helvetica", "bold");
          doc.setFontSize(25);
          doc.setTextColor(255, 255, 255);
          doc.text(doc.splitTextToSize(safeText(productTitle).toUpperCase(), pageWidth - 48).slice(0, 2), margin, 54);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10.5);
          doc.setTextColor(226, 232, 240);
          doc.text(doc.splitTextToSize(safeText(addressLine || project.customer || "Prosjekt"), pageWidth - 48), margin, 74);

          const badgeY = 96;
          const badgeText = warranty?.issued ? `${getWarrantyYears(warranty)} års dokumentert tetthetsgaranti` : openDeviationTotal ? "Kontroll med åpne avvik" : "Kontroll dokumentert";
          doc.setFillColor(...(openDeviationTotal ? [254, 242, 242] : warranty?.issued ? [236, 253, 245] : [239, 246, 255]));
          doc.setDrawColor(...(openDeviationTotal ? [248, 113, 113] : warranty?.issued ? [74, 222, 128] : [147, 197, 253]));
          doc.roundedRect(margin, badgeY, contentWidth, 24, 3, 3, "FD");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          doc.setTextColor(...(openDeviationTotal ? [153, 27, 27] : warranty?.issued ? [6, 95, 70] : [12, 42, 82]));
          doc.text(safeText(badgeText), margin + 6, badgeY + 9);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.4);
          doc.setTextColor(51, 65, 85);
          const badgeSub = warranty?.issued && warranty?.guaranteeNumber ? `Garantinummer: ${warranty.guaranteeNumber}` : openDeviationTotal ? "Prosjektet har åpne avvik som må følges opp." : "Prosjektet har ingen åpne avvik i rapportgrunnlaget.";
          doc.text(safeText(badgeSub), margin + 6, badgeY + 17);

          const cardY = 130;
          const cardW = (contentWidth - 6) / 2;
          drawInfoCardPdf(margin, cardY, cardW, 21, "Kunde", project.customer || "Ikke oppgitt");
          drawInfoCardPdf(margin + cardW + 6, cardY, cardW, 21, "Utførende firma", name || company.companyName || "Expo ProffDok");
          drawInfoCardPdf(margin, cardY + 26, cardW, 21, "Rapport generert", generatedAt);
          drawInfoCardPdf(margin + cardW + 6, cardY + 26, cardW, 21, "Dokumentnummer", makeReportDocumentNumber());

          const metricGap = 4;
          const metricW = (contentWidth - metricGap * 4) / 5;
          const metricY = 190;
          drawMetricCard(margin, metricY, metricW, 20, "Bilder", String(status.photoTotal), "blue");
          drawMetricCard(margin + (metricW + metricGap), metricY, metricW, 20, "Produkter", String(status.productTotal), "neutral");
          drawMetricCard(margin + (metricW + metricGap) * 2, metricY, metricW, 20, "Kontroll", String(status.checklistDone), "green");
          drawMetricCard(margin + (metricW + metricGap) * 3, metricY, metricW, 20, "Vedlegg", String(status.attachmentTotal), "blue");
          drawMetricCard(margin + (metricW + metricGap) * 4, metricY, metricW, 20, "Avvik", String(openDeviationTotal), openDeviationTotal ? "red" : "green");

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(71, 85, 105);
          doc.text(doc.splitTextToSize("Denne rapporten dokumenterer arbeidene som er utført i prosjektet, inkludert produkter, sjekklister, bilder, vedlegg og eventuelle garantier. Rapporten bør oppbevares som en del av boligens FDV-dokumentasjon.", contentWidth), margin, 226);

          doc.setFontSize(7.8);
          doc.setTextColor(100, 116, 139);
          doc.text("© 2026 Expo Proffsenter – Expo ProffDok", pageWidth / 2, pageHeight - 20, { align: "center" });
          doc.addPage();
          y = 16;
        };
        const addSubTitle = (title) => {
          ensureSpace(8);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          doc.setTextColor(15, 23, 42);
          doc.text(safeText(title), margin, y);
          y += 5;
        };
        const addParagraph = (value, opts = {}) => {
          const textValue = safeText(value).trim();
          if (!textValue) return;
          const size = opts.size || 10.5;
          const lineHeight = opts.lineHeight || 5.4;
          doc.setFont("helvetica", opts.bold ? "bold" : "normal");
          doc.setFontSize(size);
          doc.setTextColor(opts.color || 15, opts.color ? 69 : 23, opts.color ? 135 : 42);
          const lines = doc.splitTextToSize(textValue, opts.width || contentWidth);
          ensureSpace(lines.length * lineHeight + 2);
          doc.text(lines, opts.x || margin, y);
          y += lines.length * lineHeight;
        };
        const addKeyValue = (label, value) => {
          const cleanValue = safeText(value).trim() || "Ikke fylt ut";
          ensureSpace(10);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(15, 23, 42);
          doc.text(safeText(label), margin, y);
          y += 4.5;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10.5);
          const lines = doc.splitTextToSize(cleanValue, contentWidth);
          doc.text(lines, margin, y);
          y += Math.max(5.8, lines.length * 5.4);
        };
        const addLink = (label, href) => {
          const rawHref = safeText(href).trim();
          const isBlobUrl = /^blob:/i.test(rawHref);
          const url = isBlobUrl ? "" : normalizePdfUrl(rawHref);
          if (!url) {
            if (isBlobUrl) {
              ensureSpace(18);
              doc.setFont("helvetica", "bold");
              doc.setFontSize(10.2);
              doc.setTextColor(153, 27, 27);
              doc.text(doc.splitTextToSize(`${safeText(label)} – filen må lastes opp på nytt for å bli klikkbar i PDF.`, contentWidth), margin, y);
              y += 10;
            }
            return;
          }
          ensureSpace(12);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10.5);
          doc.setTextColor(0, 84, 180);
          if (typeof doc.textWithLink === "function") {
            doc.textWithLink(safeText(label), margin, y, { url });
          } else {
            doc.text(safeText(label), margin, y);
            doc.link(margin, y - 4, Math.min(contentWidth, safeText(label).length * 2.2), 5, { url });
          }
          y += 6;
        };
        const addAttachmentList = (title, attachmentList = [], emptyMessage = "Ingen vedlegg er lagt til.") => {
          const visibleAttachments = (attachmentList || []).filter((file) => hasValue(file?.name) || hasValue(file?.url) || hasValue(file?.path));
          addSectionTitle(title);
          if (!visibleAttachments.length) {
            addParagraph(emptyMessage);
            return;
          }
          const cleanMetaValue = (value = "", fallback = "Ikke angitt") => {
            const clean = safeText(value).trim();
            if (!clean || /^uspesifisert/i.test(clean)) return fallback;
            return clean;
          };
          visibleAttachments.forEach((file, index) => {
            const fileName = safeText(file?.name || `Vedlegg ${index + 1}`);
            const fileUrl = storedFileUrl(file);
            const sourceLabel = cleanMetaValue(file?._sourceLabel || "Vedlegg", "Vedlegg");
            const trade = cleanMetaValue(file.trade || file.fag || file.role, "Ikke angitt");
            const documentType = cleanMetaValue(file.documentType || file.docType || file.typeLabel, "Ikke angitt");
            const description = cleanMetaValue(file.description || file.comment, "");
            const uploadedBy = cleanMetaValue(file.by, "Ikke angitt");
            const uploadedAt = cleanMetaValue(file.created ? (String(file.created).includes("T") ? new Date(file.created).toLocaleString("no-NO") : file.created) : "", "Ikke angitt");
            const titleLabel = documentType !== "Ikke angitt" ? documentType : sourceLabel;
            const detailRows = [
              ["Fil", fileName],
              ["Kategori", sourceLabel],
              ["Fag", trade],
              ["Dokumenttype", documentType],
              ["Beskrivelse", description],
              ["Opplastet av", uploadedBy],
              ["Dato", uploadedAt]
            ].filter(([, value]) => hasValue(value));
            const detailLineCount = detailRows.reduce((sum, [label, value]) => sum + Math.max(1, doc.splitTextToSize(`${label}: ${value}`, contentWidth - 28).length), 0);
            const boxH = Math.max(44, 20 + detailLineCount * 4.2 + 11);
            ensureSpace(boxH + 6);
            const boxY = y;
            doc.setDrawColor(191, 219, 254);
            doc.setFillColor(248, 250, 252);
            doc.roundedRect(margin, boxY, contentWidth, boxH, 3, 3, "FD");
            doc.setFillColor(239, 246, 255);
            doc.roundedRect(margin + 4, boxY + 4, 13, 13, 2.2, 2.2, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.2);
            doc.setTextColor(20, 86, 160);
            doc.text("PDF", margin + 7.2, boxY + 12.2);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(11.2);
            doc.setTextColor(15, 23, 42);
            doc.text(doc.splitTextToSize(titleLabel, contentWidth - 26).slice(0, 1), margin + 21, boxY + 9);

            let yy = boxY + 17;
            detailRows.forEach(([label, value]) => {
              const lines = doc.splitTextToSize(`${safeText(label)}: ${safeText(value)}`, contentWidth - 28);
              doc.setFont("helvetica", "bold");
              doc.setFontSize(7.7);
              doc.setTextColor(51, 65, 85);
              const labelText = `${safeText(label)}:`;
              doc.text(labelText, margin + 21, yy);
              doc.setFont("helvetica", "normal");
              doc.setTextColor(71, 85, 105);
              const valueLines = doc.splitTextToSize(safeText(value), contentWidth - 52);
              doc.text(valueLines, margin + 43, yy);
              yy += Math.max(4.2, valueLines.length * 4.2);
            });

            const linkY = boxY + boxH - 5.4;
            if (fileUrl) {
              const linkLabel = "Åpne PDF";
              doc.setFont("helvetica", "bold");
              doc.setFontSize(8.8);
              doc.setTextColor(0, 84, 180);
              if (typeof doc.textWithLink === "function") {
                doc.textWithLink(linkLabel, margin + 21, linkY, { url: fileUrl });
              } else {
                doc.text(linkLabel, margin + 21, linkY);
                doc.link(margin + 21, linkY - 3.5, 22, 4.5, { url: fileUrl });
              }
            } else {
              doc.setFont("helvetica", "normal");
              doc.setFontSize(7.6);
              doc.setTextColor(153, 27, 27);
              doc.text("Dokumentlenke mangler", margin + 21, linkY);
            }
            y += boxH + 6;
          });
        };

        const addDivider = () => {
          ensureSpace(4);
          doc.setDrawColor(226, 232, 240);
          doc.line(margin, y, pageWidth - margin, y);
          y += 5;
        };

        const statusVisual = (status = "") => {
          const clean = String(status || "").toLowerCase();
          if (clean === "avvik") return { label: "AVVIK", bg: [254, 242, 242], border: [248, 113, 113], text: [153, 27, 27] };
          if (clean === "lukket avvik") return { label: "LUKKET", bg: [236, 253, 245], border: [74, 222, 128], text: [6, 95, 70] };
          if (clean === "ikke aktuelt") return { label: "IKKE AKTUELT", bg: [248, 250, 252], border: [203, 213, 225], text: [71, 85, 105] };
          if (clean === "ok" || clean === "utført" || clean === "utfort") return { label: "OK", bg: [236, 253, 245], border: [74, 222, 128], text: [6, 95, 70] };
          return { label: status || "IKKE VURDERT", bg: [255, 251, 235], border: [251, 191, 36], text: [146, 64, 14] };
        };
        const drawMetricCard = (x, yPos, w, h, label, value, tone = "neutral") => {
          const bg = tone === "green" ? [236, 253, 245] : tone === "red" ? [254, 242, 242] : tone === "blue" ? [239, 246, 255] : [248, 250, 252];
          const borderColor = tone === "green" ? [74, 222, 128] : tone === "red" ? [248, 113, 113] : tone === "blue" ? [147, 197, 253] : [203, 213, 225];
          const textColor = tone === "green" ? [6, 95, 70] : tone === "red" ? [153, 27, 27] : tone === "blue" ? [30, 64, 175] : [15, 23, 42];
          doc.setDrawColor(...borderColor);
          doc.setFillColor(...bg);
          doc.roundedRect(x, yPos, w, h, 2.5, 2.5, "FD");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(13);
          doc.setTextColor(...textColor);
          doc.text(safeText(value), x + 5, yPos + 9);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.4);
          doc.setTextColor(71, 85, 105);
          doc.text(doc.splitTextToSize(safeText(label), w - 10), x + 5, yPos + 15);
        };
        const drawInfoCardPdf = (x, yPos, w, h, label, value) => {
          doc.setDrawColor(214, 226, 236);
          doc.setFillColor(248, 250, 252);
          doc.roundedRect(x, yPos, w, h, 2.5, 2.5, "FD");
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.3);
          doc.setTextColor(100, 116, 139);
          doc.text(safeText(label), x + 4, yPos + 6);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.7);
          doc.setTextColor(15, 23, 42);
          const lines = doc.splitTextToSize(safeText(value || "Ikke oppgitt"), w - 8);
          doc.text(lines.slice(0, 3), x + 4, yPos + 11.5);
        };
        const addInfoGridSection = (title, entries = []) => {
          const visibleEntries = entries.filter(([_, value]) => hasValue(value));
          if (!visibleEntries.length) return;
          // FASE 13.15.3: Unngå at en seksjonstittel havner alene nederst på siden.
          ensureSpace(42);
          addSectionTitle(title);
          const gap = 5;
          const cardW = (contentWidth - gap) / 2;
          const cardH = 20;
          visibleEntries.forEach(([label, value], index) => {
            if (index % 2 === 0) ensureSpace(cardH + 8);
            const x = index % 2 === 0 ? margin : margin + cardW + gap;
            drawInfoCardPdf(x, y, cardW, cardH, label, value);
            if (index % 2 === 1) y += cardH + 5;
          });
          if (visibleEntries.length % 2 === 1) y += cardH + 5;
        };
        const addProductCategoryHeader = (category, count = 0) => {
          if (y > pageHeight - 52) {
            doc.addPage();
            y = 16;
          } else {
            y += 3;
          }
          ensureSpace(15);
          doc.setDrawColor(191, 219, 254);
          doc.setFillColor(239, 246, 255);
          doc.roundedRect(margin, y, contentWidth, 11, 2.5, 2.5, "FD");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10.2);
          doc.setTextColor(12, 42, 82);
          doc.text(doc.splitTextToSize(safeText(category), contentWidth - 25).slice(0, 1), margin + 5, y + 7.2);
          if (count) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.2);
            doc.setTextColor(71, 85, 105);
            doc.text(`${count} produkt${count === 1 ? "" : "er"}`, pageWidth - margin - 5, y + 7.2, { align: "right" });
          }
          y += 16;
        };
        const addProductReportCard = (product) => {
          const productName = product.item || product.name || "Uten produktnavn";
          const links = productReportDocumentOptions.filter((option) => shouldIncludeProductReportDoc(product, option));
          const shortDocLabel = (label = "") => {
            if (/produkt|leverand/i.test(label)) return "Produktside";
            if (/sikkerhet/i.test(label)) return "Sikkerhetsblad";
            return label;
          };
          const nameLines = doc.splitTextToSize(safeText(productName), contentWidth - 18).slice(0, 2);
          const detailLines = [];
          if (product.colorCode) detailLines.push(...doc.splitTextToSize(`Fargekode: ${safeText(product.colorCode)}`, contentWidth - 18));
          if (product.comment) detailLines.push(...doc.splitTextToSize(`Kommentar: ${safeText(product.comment)}`, contentWidth - 18));
          const chipCount = links.length || 1;
          const chipsPerRow = 3;
          const chipRows = Math.ceil(chipCount / chipsPerRow);
          const boxH = Math.max(28, 16 + nameLines.length * 4.7 + Math.min(detailLines.length, 3) * 3.8 + 3 + chipRows * 7.2);
          ensureSpace(boxH + 5);

          const boxY = y;
          doc.setDrawColor(214, 226, 236);
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(margin, boxY, contentWidth, boxH, 3.2, 3.2, "FD");
          doc.setFillColor(248, 250, 252);
          doc.roundedRect(margin + 4, boxY + 4, 10, 10, 2.2, 2.2, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.2);
          doc.setTextColor(20, 86, 160);
          doc.text("FDV", margin + 5.9, boxY + 10.7);

          doc.setFont("helvetica", "bold");
          doc.setFontSize(10.2);
          doc.setTextColor(15, 23, 42);
          doc.text(nameLines, margin + 18, boxY + 8.3);

          let yy = boxY + 8.3 + nameLines.length * 4.7 + 1.5;
          if (detailLines.length) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.2);
            doc.setTextColor(71, 85, 105);
            doc.text(detailLines.slice(0, 3), margin + 18, yy);
            yy += Math.min(detailLines.length, 3) * 3.8 + 1.5;
          }

          if (links.length) {
            const gap = 2.3;
            const chipW = (contentWidth - 18 - gap * (chipsPerRow - 1)) / chipsPerRow;
            links.forEach((option, index) => {
              const url = normalizePdfUrl(product?.[option.field]);
              if (!url) return;
              const row = Math.floor(index / chipsPerRow);
              const col = index % chipsPerRow;
              const x = margin + 18 + col * (chipW + gap);
              const chipY = yy + row * 7.2;
              const label = shortDocLabel(option.label);
              doc.setDrawColor(191, 219, 254);
              doc.setFillColor(239, 246, 255);
              doc.roundedRect(x, chipY - 4.6, chipW, 5.9, 1.7, 1.7, "FD");
              doc.setFont("helvetica", "bold");
              doc.setFontSize(6.8);
              doc.setTextColor(0, 84, 180);
              if (typeof doc.textWithLink === "function") {
                doc.textWithLink(label, x + 2.4, chipY, { url });
              } else {
                doc.text(label, x + 2.4, chipY);
                doc.link(x + 2.4, chipY - 3.8, Math.min(chipW - 5, label.length * 1.55), 4.5, { url });
              }
            });
          } else {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.2);
            doc.setTextColor(100, 116, 139);
            doc.text("Ingen produktdokumenter valgt for visning i rapport.", margin + 18, yy);
          }

          y += boxH + 4.5;
        };
        const addEquipmentCategoryHeader = (category, count = 0) => {
          if (y > pageHeight - 52) {
            doc.addPage();
            y = 16;
          } else {
            y += 3;
          }
          ensureSpace(15);
          doc.setDrawColor(191, 219, 254);
          doc.setFillColor(239, 246, 255);
          doc.roundedRect(margin, y, contentWidth, 11, 2.5, 2.5, "FD");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10.2);
          doc.setTextColor(12, 42, 82);
          doc.text(doc.splitTextToSize(safeText(category), contentWidth - 25).slice(0, 1), margin + 5, y + 7.2);
          if (count) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.2);
            doc.setTextColor(71, 85, 105);
            doc.text(`${count} punkt`, pageWidth - margin - 5, y + 7.2, { align: "right" });
          }
          y += 16;
        };
        const addEquipmentReportCard = (item = {}) => {
          const title = safeText(item.title || "Uten navn");
          const entries = (item.entries || []).filter(([, value]) => hasValue(value));
          const links = (item.links || []).filter((link) => hasValue(link?.url));
          const titleLines = doc.splitTextToSize(title, contentWidth - 18).slice(0, 2);
          const entryRows = entries.map(([label, value]) => ({ label: safeText(label), value: safeText(value) })).slice(0, 6);
          const linkRows = links.length ? 1 : 0;
          const boxH = Math.max(25, 14 + titleLines.length * 4.7 + entryRows.length * 6.2 + linkRows * 7.2 + 3);
          ensureSpace(boxH + 5);
          const boxY = y;
          doc.setDrawColor(214, 226, 236);
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(margin, boxY, contentWidth, boxH, 3.2, 3.2, "FD");
          doc.setFillColor(248, 250, 252);
          doc.roundedRect(margin + 4, boxY + 4, 10, 10, 2.2, 2.2, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.2);
          doc.setTextColor(20, 86, 160);
          doc.text("UTS", margin + 5.6, boxY + 10.7);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10.2);
          doc.setTextColor(15, 23, 42);
          doc.text(titleLines, margin + 18, boxY + 8.3);
          let yy = boxY + 8.3 + titleLines.length * 4.7 + 1.5;
          entryRows.forEach(({ label, value }) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.3);
            doc.setTextColor(100, 116, 139);
            doc.text(label, margin + 18, yy);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.4);
            doc.setTextColor(15, 23, 42);
            const valueLines = doc.splitTextToSize(value || "Ikke oppgitt", contentWidth - 65).slice(0, 1);
            doc.text(valueLines, margin + 62, yy);
            yy += 6.2;
          });
          if (links.length) {
            const gap = 2.3;
            const chipW = (contentWidth - 18 - gap) / 2;
            links.slice(0, 2).forEach((link, index) => {
              const url = normalizePdfUrl(link.url);
              if (!url) return;
              const x = margin + 18 + index * (chipW + gap);
              doc.setDrawColor(191, 219, 254);
              doc.setFillColor(239, 246, 255);
              doc.roundedRect(x, yy - 4.6, chipW, 5.9, 1.7, 1.7, "FD");
              doc.setFont("helvetica", "bold");
              doc.setFontSize(6.8);
              doc.setTextColor(0, 84, 180);
              const label = safeText(link.label || "Dokument");
              if (typeof doc.textWithLink === "function") {
                doc.textWithLink(label, x + 2.4, yy, { url });
              } else {
                doc.text(label, x + 2.4, yy);
                doc.link(x + 2.4, yy - 3.8, Math.min(chipW - 5, label.length * 1.55), 4.5, { url });
              }
            });
          }
          y += boxH + 4.5;
        };
        const addReportSummary = () => {
          const entries = Object.values(checklist || {}).flatMap((items) => Object.values(items || {}));
          const assessed = entries.filter((value) => hasValue(value?.status));
          const okTotal = assessed.filter((value) => ["ok", "utført", "utfort"].includes(String(value?.status || "").toLowerCase())).length;
          const notRelevantTotal = assessed.filter((value) => String(value?.status || "").toLowerCase() === "ikke aktuelt").length;
          const openDeviationTotal = assessed.filter((value) => value?.status === "Avvik").length;
          const closedDeviationTotal = assessed.filter((value) => value?.status === "Lukket avvik").length;
          const photoTotal = (photos || []).filter((photo) => hasValue(photo?.url)).length;
          const productTotal = (selected || []).length + (manualSelected || []).length;
          addSectionTitle("Rapportsammendrag");
          const passed = openDeviationTotal === 0;
          ensureSpace(26);
          doc.setDrawColor(...(passed ? [74, 222, 128] : [248, 113, 113]));
          doc.setFillColor(...(passed ? [236, 253, 245] : [254, 242, 242]));
          doc.roundedRect(margin, y, contentWidth, 22, 3, 3, "FD");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(13);
          doc.setTextColor(...(passed ? [6, 95, 70] : [153, 27, 27]));
          doc.text(passed ? "KONTROLL DOKUMENTERT" : "KONTROLL MED ÅPNE AVVIK", margin + 6, y + 9);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.2);
          doc.setTextColor(51, 65, 85);
          doc.text(passed ? "Prosjektet har ingen åpne avvik i rapportgrunnlaget." : "Prosjektet har åpne avvik som må følges opp.", margin + 6, y + 16);
          y += 28;
          const gap = 4;
          const cardW = (contentWidth - gap * 3) / 4;
          ensureSpace(24);
          drawMetricCard(margin, y, cardW, 20, "Godkjente punkter", String(okTotal), "green");
          drawMetricCard(margin + (cardW + gap), y, cardW, 20, "Ikke aktuelle", String(notRelevantTotal), "neutral");
          drawMetricCard(margin + (cardW + gap) * 2, y, cardW, 20, "Åpne avvik", String(openDeviationTotal), openDeviationTotal ? "red" : "green");
          drawMetricCard(margin + (cardW + gap) * 3, y, cardW, 20, "Bilder", String(photoTotal), "blue");
          y += 26;
          addParagraph(`Produkter dokumentert: ${productTotal}. Lukkede avvik: ${closedDeviationTotal}. Rapporten bygger på registrerte produkter, bilder, sjekklister, avvikshistorikk og signert overtakelse der dette er registrert.`, { size: 8.5, lineHeight: 4.4 });
          if (warranty?.issued) addParagraph(`✓ ${getWarrantyYears(warranty)} års dokumentert tetthetsgaranti er utstedt. Garantinummer: ${warranty.guaranteeNumber || "Ikke oppgitt"}.`, { size: 8.5, lineHeight: 4.4, bold: true });
        };
        const addChecklistCategoryTitle = (category, count = 0) => {
          if (y > pageHeight - 54) {
            doc.addPage();
            y = 16;
          } else {
            y += 4;
          }
          ensureSpace(18);
          doc.setDrawColor(191, 219, 254);
          doc.setFillColor(239, 246, 255);
          doc.roundedRect(margin, y, contentWidth, 12, 2.5, 2.5, "FD");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10.5);
          doc.setTextColor(12, 42, 82);
          doc.text(safeText(category), margin + 5, y + 7.7);
          if (count) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.4);
            doc.setTextColor(71, 85, 105);
            doc.text(`${count} punkt`, pageWidth - margin - 5, y + 7.7, { align: "right" });
          }
          y += 17;
        };
        const addChecklistStatusCard = async (category, item, value = {}) => {
          const status = value?.status || "";
          const comment = value?.comment || "";
          const closeComment = value?.closeComment || "";
          const pointPhotos = (value?.photos || []).filter((photo) => (hasValue(photo?.url) || hasValue(photo?.path)) && !isLikelyDocumentFile(photo));
          const visual = statusVisual(status);
          const cleanStatus = String(status || "").toLowerCase();
          const isOpenDeviation = cleanStatus === "avvik";
          const isClosedDeviation = cleanStatus === "lukket avvik";
          const isNotRelevant = cleanStatus === "ikke aktuelt";
          const isOk = ["ok", "utført", "utfort"].includes(cleanStatus);
          const statusLabel = isOk ? "OK" : isClosedDeviation ? "LUKKET AVVIK" : isOpenDeviation ? "ÅPENT AVVIK" : isNotRelevant ? "IKKE AKTUELT" : (status || "IKKE VURDERT");
          const textLines = doc.splitTextToSize(safeText(item), contentWidth - 38);
          const commentLabel = isOpenDeviation || isClosedDeviation ? "Opprinnelig avvik" : "Kommentar";
          const commentLines = comment ? doc.splitTextToSize(`${commentLabel}: ${comment}`, contentWidth - 20) : [];
          const closeLines = isClosedDeviation && closeComment ? doc.splitTextToSize(`Utbedring / lukkekommentar: ${closeComment}`, contentWidth - 20) : [];
          const isCompact = isOk || isNotRelevant;
          const rowH = isCompact
            ? Math.max(10.5, 7.2 + textLines.length * 4.2)
            : Math.max(18, 12 + textLines.length * 4.5 + commentLines.length * 3.8 + closeLines.length * 3.8);
          ensureSpace(rowH + (pointPhotos.length ? 49 : 4));

          if (isCompact) {
            const iconColor = isOk ? [22, 163, 74] : [100, 116, 139];
            doc.setDrawColor(226, 232, 240);
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(margin, y, contentWidth, rowH, 2.2, 2.2, "FD");
            doc.setDrawColor(...iconColor);
            doc.setFillColor(isOk ? 236 : 248, isOk ? 253 : 250, isOk ? 245 : 252);
            doc.circle(margin + 5.3, y + rowH / 2, 3.0, "FD");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(isOk ? 8.8 : 7.5);
            doc.setTextColor(...iconColor);
            doc.text(isOk ? "OK" : "-", margin + 5.3, y + rowH / 2 + 1.0, { align: "center" });
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.8);
            doc.setTextColor(15, 23, 42);
            doc.text(textLines, margin + 12, y + 6.8);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(6.4);
            doc.setTextColor(...iconColor);
            doc.text(statusLabel, pageWidth - margin - 4, y + 6.8, { align: "right" });
            y += rowH + 2.8;
          } else {
            doc.setDrawColor(...visual.border);
            doc.setFillColor(...visual.bg);
            doc.roundedRect(margin, y, contentWidth, rowH, 3.0, 3.0, "FD");
            doc.setDrawColor(...visual.border);
            doc.setFillColor(255, 255, 255);
            doc.circle(margin + 7, y + 8.7, 3.4, "FD");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.0);
            doc.setTextColor(...visual.text);
            doc.text(isClosedDeviation ? "OK" : safeText(visual.label).slice(0, 1), margin + 7, y + 9.8, { align: "center" });
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.2);
            doc.setTextColor(15, 23, 42);
            doc.text(textLines, margin + 15, y + 8.4);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(6.6);
            doc.setTextColor(...visual.text);
            doc.text(statusLabel, pageWidth - margin - 5, y + 8.4, { align: "right" });
            let yy = y + 9 + textLines.length * 4.4;
            if (commentLines.length) {
              doc.setFont("helvetica", "normal");
              doc.setFontSize(7.5);
              doc.setTextColor(71, 85, 105);
              doc.text(commentLines, margin + 9, yy + 2);
              yy += commentLines.length * 3.8;
            }
            if (closeLines.length) {
              doc.setFont("helvetica", "normal");
              doc.setFontSize(7.5);
              doc.setTextColor(6, 95, 70);
              doc.text(closeLines, margin + 9, yy + 3);
            }
            y += rowH + 4.5;
          }

          if (pointPhotos.length) {
            ensureSpace(48);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.6);
            doc.setTextColor(12, 42, 82);
            doc.text(`Bildedokumentasjon (${pointPhotos.length})`, margin + 12, y + 2);
            y += 5;
            const gap = 4;
            const cardW = (contentWidth - 18 - gap) / 2;
            const cardH = 38;
            for (let i = 0; i < pointPhotos.length; i += 2) {
              ensureSpace(cardH + 6);
              await drawImageGalleryCard({ ...pointPhotos[i], _reportCaption: `Bilde ${i + 1}` }, margin + 12, y, cardW, cardH);
              if (pointPhotos[i + 1]) {
                await drawImageGalleryCard({ ...pointPhotos[i + 1], _reportCaption: `Bilde ${i + 2}` }, margin + 12 + cardW + gap, y, cardW, cardH);
              }
              y += cardH + 5;
            }
          }
        };

const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        const getImageInfo = (dataUrl) => new Promise((resolve) => {
          const image = new window.Image();
          image.onload = () => resolve({ width: image.width || 1, height: image.height || 1, image });
          image.onerror = () => resolve({ width: 1, height: 1, image: null });
          image.src = dataUrl;
        });
        const normalizeImageForJsPdf = async (dataUrl) => {
          const info = await getImageInfo(dataUrl);
          if (!info.image) throw new Error("Bildeformat støttes ikke i PDF.");
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, info.width || 1);
          canvas.height = Math.max(1, info.height || 1);
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(info.image, 0, 0, canvas.width, canvas.height);
          return { dataUrl: canvas.toDataURL("image/png"), width: canvas.width, height: canvas.height, format: "PNG" };
        };
        const addImageFromUrl = async (url, caption = "") => {
          const cleanUrl = normalizePdfUrl(url);
          if (!cleanUrl) return;
          try {
            const response = await fetch(cleanUrl, { mode: "cors" });
            if (!response.ok) throw new Error("Bilde kunne ikke hentes.");
            const blob = await response.blob();
            const rawDataUrl = await blobToDataUrl(blob);
            const info = await normalizeImageForJsPdf(rawDataUrl);
            const maxW = Math.min(82, contentWidth);
            const maxH = 62;
            let w = maxW;
            let h = w * (info.height / info.width);
            if (h > maxH) {
              h = maxH;
              w = h * (info.width / info.height);
            }
            ensureSpace(h + 12);
            doc.addImage(info.dataUrl, info.format, margin, y, w, h);
            y += h + 4;
            if (caption) addParagraph(caption, { size: 8.2, lineHeight: 4 });
          } catch (error) {
            addParagraph("Bilde kunne ikke bygges inn i rapporten.", { bold: true, size: 10.2, lineHeight: 4.6 });
            addParagraph("Originalfilen kan likevel åpnes via lenken under dersom filen fortsatt er tilgjengelig.", { size: 9.5, lineHeight: 4.4 });
            addLink(caption ? `Åpne originalfil – ${caption}` : "Åpne originalfil", cleanUrl);
          }
        };

        const drawSignatureBlock = async (label, signerName, imageUrl, x, yy, w, h = 44) => {
          doc.setDrawColor(203, 213, 225);
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(x, yy, w, h, 2.8, 2.8, "FD");
          const image = imageUrl ? await loadPdfImage(imageUrl) : null;
          const imageAreaX = x + 5;
          const imageAreaY = yy + 5;
          const imageAreaW = w - 10;
          const imageAreaH = h - 19;
          if (image && !image.error) {
            let imgW = imageAreaW;
            let imgH = imgW * (image.height / image.width);
            if (imgH > imageAreaH) {
              imgH = imageAreaH;
              imgW = imgH * (image.width / image.height);
            }
            const imgX = imageAreaX + (imageAreaW - imgW) / 2;
            const imgY = imageAreaY + (imageAreaH - imgH) / 2;
            doc.addImage(image.dataUrl, image.format || "PNG", imgX, imgY, imgW, imgH);
          } else {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.2);
            doc.setTextColor(148, 163, 184);
            doc.text("Ingen signaturbilde", x + w / 2, yy + 18, { align: "center" });
          }
          doc.setDrawColor(100, 116, 139);
          doc.line(x + 8, yy + h - 13, x + w - 8, yy + h - 13);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.0);
          doc.setTextColor(15, 23, 42);
          doc.text(safeText(signerName || "Ikke oppgitt"), x + w / 2, yy + h - 8, { align: "center" });
          doc.setFont("helvetica", "normal");
          doc.setFontSize(6.8);
          doc.setTextColor(100, 116, 139);
          doc.text(safeText(label), x + w / 2, yy + h - 3.5, { align: "center" });
        };

        const loadPdfImage = async (url) => {
          const cleanUrl = storedFileUrl({ url }) || normalizePdfUrl(url);
          if (!cleanUrl) return null;
          if (isLikelyDocumentFile({ url: cleanUrl })) return { error: true, document: true, url: cleanUrl };
          try {
            const response = await fetch(cleanUrl, { mode: "cors" });
            if (!response.ok) throw new Error("Bilde kunne ikke hentes.");
            const blob = await response.blob();
            if (blob?.type && !/^image\//i.test(blob.type)) return { error: true, document: true, contentType: blob.type, url: cleanUrl };
            const rawDataUrl = await blobToDataUrl(blob);
            if (!/^data:image\//i.test(String(rawDataUrl || ""))) return { error: true, document: true, url: cleanUrl };
            const info = await normalizeImageForJsPdf(rawDataUrl);
            return { ...info, url: cleanUrl };
          } catch (error) {
            return { error: true, url: cleanUrl };
          }
        };
        const drawDocumentGalleryCard = (file, x, yy, w, h) => {
          const fileName = cleanPdfCaption(file?.name || file?._reportCaption, file?._reportCaption || "Dokumentvedlegg").slice(0, 90);
          const fileUrl = storedFileUrl(file);
          doc.setDrawColor(214, 226, 236);
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(x, yy, w, h, 3, 3, "FD");
          doc.setFillColor(248, 250, 252);
          doc.roundedRect(x + 4, yy + 4, w - 8, h - 14, 2, 2, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.2);
          doc.setTextColor(15, 23, 42);
          doc.text("📄 Dokument vedlagt", x + 8, yy + 14);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.2);
          doc.setTextColor(71, 85, 105);
          doc.text(doc.splitTextToSize(fileName, w - 16).slice(0, 2), x + 8, yy + 21);
          if (fileUrl) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.0);
            doc.setTextColor(0, 84, 180);
            if (typeof doc.textWithLink === "function") {
              doc.textWithLink("Åpne dokument", x + 8, yy + h - 12, { url: fileUrl });
            } else {
              doc.text("Åpne dokument", x + 8, yy + h - 12);
              doc.link(x + 8, yy + h - 16, 34, 5, { url: fileUrl });
            }
          }
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.2);
          doc.setTextColor(15, 23, 42);
          doc.text(doc.splitTextToSize(fileName, w - 8).slice(0, 1), x + 4, yy + h - 4.8);
        };
        const drawImageGalleryCard = async (photo, x, yy, w, h) => {
          if (isLikelyDocumentFile(photo)) {
            drawDocumentGalleryCard(photo, x, yy, w, h);
            return;
          }
          doc.setDrawColor(214, 226, 236);
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(x, yy, w, h, 3, 3, "FD");
          const caption = cleanPdfCaption(photo.comment || photo._reportCaption || photo.name, photo._reportCaption || "Dokumentert bilde").slice(0, 80);
          const image = await loadPdfImage(storedFileUrl(photo) || photo.url);
          const imageAreaX = x + 4;
          const imageAreaY = yy + 4;
          const imageAreaW = w - 8;
          const imageAreaH = h - 14;
          doc.setFillColor(248, 250, 252);
          doc.roundedRect(imageAreaX, imageAreaY, imageAreaW, imageAreaH, 2, 2, "F");
          if (image && !image.error) {
            const imageMaxW = imageAreaW - 2;
            const imageMaxH = imageAreaH - 2;
            let imgW = imageMaxW;
            let imgH = imgW * (image.height / image.width);
            if (imgH > imageMaxH) {
              imgH = imageMaxH;
              imgW = imgH * (image.width / image.height);
            }
            const imgX = imageAreaX + (imageAreaW - imgW) / 2;
            const imgY = imageAreaY + (imageAreaH - imgH) / 2;
            doc.addImage(image.dataUrl, image.format || "PNG", imgX, imgY, imgW, imgH);
          } else {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.2);
            doc.setTextColor(100, 116, 139);
            doc.text(doc.splitTextToSize("Bildet kunne ikke bygges inn automatisk", imageAreaW - 8), imageAreaX + 4, imageAreaY + 11);
            const cleanPhotoUrl = normalizePdfUrl(photo?.url || "");
            if (cleanPhotoUrl && !/^blob:/i.test(cleanPhotoUrl)) {
              doc.setFont("helvetica", "bold");
              doc.setFontSize(7.0);
              doc.setTextColor(0, 84, 180);
              const linkText = "Åpne originalfil";
              if (typeof doc.textWithLink === "function") {
                doc.textWithLink(linkText, imageAreaX + 4, imageAreaY + 22, { url: cleanPhotoUrl });
              } else {
                doc.text(linkText, imageAreaX + 4, imageAreaY + 22);
                doc.link(imageAreaX + 4, imageAreaY + 18, 34, 5, { url: cleanPhotoUrl });
              }
            }
          }
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.2);
          doc.setTextColor(15, 23, 42);
          doc.text(doc.splitTextToSize(caption, w - 8).slice(0, 1), x + 4, yy + h - 4.8);
        };
        const addImageGalleryCategory = async (category, items = []) => {
          if (!items.length) return;
          if (y > pageHeight - 66) {
            doc.addPage();
            y = 16;
          }
          doc.setDrawColor(191, 219, 254);
          doc.setFillColor(239, 246, 255);
          doc.roundedRect(margin, y, contentWidth, 12, 2.5, 2.5, "FD");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10.5);
          doc.setTextColor(12, 42, 82);
          doc.text(safeText(category), margin + 5, y + 7.7);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.4);
          doc.setTextColor(71, 85, 105);
          doc.text(`${items.length} bilde${items.length === 1 ? "" : "r"}`, pageWidth - margin - 5, y + 7.7, { align: "right" });
          y += 17;
          const gap = 5;
          const cardW = (contentWidth - gap) / 2;
          const cardH = 50;
          for (let i = 0; i < items.length; i += 2) {
            ensureSpace(cardH + 7);
            await drawImageGalleryCard({ ...items[i], _reportCaption: `${category} – bilde ${i + 1}` }, margin, y, cardW, cardH);
            if (items[i + 1]) await drawImageGalleryCard({ ...items[i + 1], _reportCaption: `${category} – bilde ${i + 2}` }, margin + cardW + gap, y, cardW, cardH);
            y += cardH + 6;
          }
        };


        // FASE 13.15.2 HOTFIX: Global PDF note box helper tilgjengelig for alle rapportseksjoner.
        // 13.15.1 hadde fortsatt drawNoteBox definert for smalt i enkelte PDF-kjøringer/cache.
        const drawNoteBox = (text) => {
          const lines = doc.splitTextToSize(safeText(text), contentWidth - 18);
          const h = Math.max(18, lines.length * 4 + 10);
          ensureSpace(h + 4);
          doc.setDrawColor(191, 219, 254);
          doc.setFillColor(239, 246, 255);
          doc.roundedRect(margin, y, contentWidth, h, 2.5, 2.5, "FD");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(20, 86, 160);
          doc.text("i", margin + 7, y + 10);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(30, 64, 105);
          doc.text(lines, margin + 15, y + 8);
          y += h + 7;
        };

        const addWarrantyCertificatePages = async () => {
          if (!warranty?.enabled || !warrantyReadiness?.selectedSystem) return;
          const selectedSystem = warrantyReadiness.selectedSystem;
          const guaranteeNumber = warranty?.guaranteeNumber || "Tildeles ved utstedelse";
          const overtagelseDate = overtagelse?.dato || project?.date || "";
          const issuedDate = warranty?.issuedAt ? new Date(warranty.issuedAt) : /* @__PURE__ */ new Date();
          const issuedDateText = warranty?.issued && warranty?.issuedAt ? issuedDate.toLocaleDateString("no-NO") : "Ikke utstedt";
          const reportText = warranty?.reportGeneratedAt ? new Date(warranty.reportGeneratedAt).toLocaleString("no-NO") : "Genereres nå";
          const warrantyValidTo = (() => {
            const sourceDate = overtagelseDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
            const d = new Date(sourceDate);
            if (Number.isNaN(d.getTime())) return "";
            d.setFullYear(d.getFullYear() + getWarrantyYears(warranty));
            return d.toISOString().slice(0, 10);
          })();
          const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(selectedSystem.sintefUrl)}&size=180&margin=1`;
          const qrFallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=1&data=${encodeURIComponent(selectedSystem.sintefUrl)}`;
          const darkBlue = [12, 42, 82];
          const blue = [20, 86, 160];
          const lightBlue = [239, 246, 255];
          const green = [22, 163, 74];
          const gray = [100, 116, 139];
          const border = [214, 226, 236];
          const pageBottom = pageHeight - 16;
          const resetPage = () => {
            y = 16;
            doc.setDrawColor(...border);
            doc.setFillColor(255, 255, 255);
          };
          const drawFooterBand = (pageLabel = "Garantisertifikat") => {
            doc.setFillColor(...darkBlue);
            doc.rect(0, pageHeight - 14, pageWidth, 14, "F");
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7);
            doc.setTextColor(255, 255, 255);
            doc.text(`Expo ProffDok • ${pageLabel}`, margin, pageHeight - 6);
          };
          const addImageFit = async (url, x, yy, maxW, maxH) => {
            const cleanUrl = normalizePdfUrl(url);
            if (!cleanUrl) return false;
            try {
              const response = await fetch(cleanUrl, { mode: "cors" });
              if (!response.ok) throw new Error("Kunne ikke hente bilde.");
              const blob = await response.blob();
              const rawDataUrl = await blobToDataUrl(blob);
              const info = await normalizeImageForJsPdf(rawDataUrl);
              let w = maxW;
              let h = w * (info.height / info.width);
              if (h > maxH) {
                h = maxH;
                w = h * (info.width / info.height);
              }
              doc.addImage(info.dataUrl, info.format || "PNG", x, yy, w, h);
              return true;
            } catch (error) {
              return false;
            }
          };
          const drawHeader = async (title = "GARANTIDOKUMENTASJON") => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.5);
            doc.setTextColor(...blue);
            doc.text(title, margin, 17);
            doc.setDrawColor(...blue);
            doc.setLineWidth(0.35);
            doc.line(margin, 21, pageWidth - margin, 21);
            y = 31;
          };
          const drawInfoCard = (x, yy, w, h, label, value) => {
            doc.setDrawColor(...border);
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(x, yy, w, h, 2.5, 2.5, "FD");
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.2);
            doc.setTextColor(...gray);
            doc.text(safeText(label), x + 4, yy + 6);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.8);
            doc.setTextColor(15, 23, 42);
            const lines = doc.splitTextToSize(safeText(value || "Ikke oppgitt"), w - 8);
            doc.text(lines.slice(0, 2), x + 4, yy + 11);
          };
          const drawCheckCard = (label, text) => {
            const h = 18;
            doc.setDrawColor(...border);
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(margin, y, contentWidth, h, 2.5, 2.5, "FD");
            doc.setDrawColor(...green);
            doc.setFillColor(240, 253, 244);
            doc.circle(margin + 8, y + 9, 3.2, "FD");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(...darkBlue);
            doc.text("OK", margin + 5.6, y + 10.1);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.8);
            doc.setTextColor(15, 23, 42);
            doc.text(safeText(label), margin + 17, y + 7.3);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.8);
            doc.setTextColor(51, 65, 85);
            doc.text(doc.splitTextToSize(safeText(text), contentWidth - 24), margin + 17, y + 12.2);
            y += h + 4;
          };
          const drawTerm = (heading, body) => {
            if (y > pageBottom - 34) {
              doc.addPage();
              resetPage();
              drawHeader("GARANTIDOKUMENTASJON");
            }
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10.2);
            doc.setTextColor(...darkBlue);
            doc.text(safeText(heading), margin, y);
            y += 5.3;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9.1);
            doc.setTextColor(31, 41, 55);
            const lines = doc.splitTextToSize(safeText(body), contentWidth);
            ensureSpace(lines.length * 4.8 + 8);
            doc.text(lines, margin, y);
            y += lines.length * 4.8 + 7;
          };

          doc.addPage();
          resetPage();

          doc.setFillColor(248, 250, 252);
          doc.rect(0, 0, pageWidth, pageHeight, "F");
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(8, 8, pageWidth - 16, pageHeight - 22, 4, 4, "F");

          const logoSource = company.logoUrl || "/expo-logo.png";
          const logoOk = logoSource ? await addImageFit(logoSource, margin, 17, 60, 24) : false;
          if (!logoOk) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(13);
            doc.setTextColor(...darkBlue);
            doc.text(name || company.companyName || "Utførende firma", margin, 28);
          }
          doc.setDrawColor(203, 213, 225);
          doc.line(pageWidth / 2, 19, pageWidth / 2, 39);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(15);
          doc.setTextColor(...darkBlue);
          doc.text("Expo ProffDok", pageWidth - margin, 27, { align: "right" });
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(...gray);
          doc.text("Prosjektdokumentasjon", pageWidth - margin, 32, { align: "right" });

          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(255, 255, 255);
          doc.setFillColor(...darkBlue);
          doc.roundedRect(pageWidth / 2 - 21, 48, 42, 8, 2, 2, "F");
          doc.text("GARANTISERTIFIKAT", pageWidth / 2, 53.5, { align: "center" });

          doc.setDrawColor(74, 222, 128);
          doc.setFillColor(236, 253, 245);
          doc.roundedRect(pageWidth / 2 - 23, 60, 46, 8, 2, 2, "FD");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.0);
          doc.setTextColor(6, 95, 70);
          doc.text(warranty?.issued ? "GARANTI AKTIV" : "GARANTI KLAR", pageWidth / 2, 65.3, { align: "center" });

          doc.setFont("helvetica", "bold");
          doc.setFontSize(24);
          doc.setTextColor(...darkBlue);
          doc.text(`${getWarrantyYears(warranty)} ÅRS`, pageWidth / 2, 82, { align: "center" });
          doc.setFontSize(20);
          doc.text("DOKUMENTERT", pageWidth / 2, 94, { align: "center" });
          doc.text("TETTHETSGARANTI", pageWidth / 2, 106, { align: "center" });
          doc.setFontSize(12);
          doc.setTextColor(...blue);
          doc.text(project.projectName || "Prosjekt", pageWidth / 2, 118, { align: "center" });

          const cardTop = 130;
          const cardGap = 4;
          const cardW = (contentWidth - cardGap) / 2;
          drawInfoCard(margin, cardTop, cardW, 22, "Utstedt til", project.customer || "Ikke oppgitt");
          drawInfoCard(margin + cardW + cardGap, cardTop, cardW, 22, "Utført av", `${name || company.companyName || "Ikke oppgitt"}${company.orgNumber ? "\nOrg.nr. " + company.orgNumber : ""}`);
          drawInfoCard(margin, cardTop + 26, cardW, 22, "Adresse", [project.address, project.postnr, project.city].filter(Boolean).join(", "));
          drawInfoCard(margin + cardW + cardGap, cardTop + 26, cardW, 22, "Garantinummer", guaranteeNumber);
          drawInfoCard(margin, cardTop + 52, cardW, 22, "Utstedelsesdato", issuedDateText);
          drawInfoCard(margin + cardW + cardGap, cardTop + 52, cardW, 22, "Gyldig til", warrantyValidTo || `${getWarrantyYears(warranty)} år fra overtakelse`);
          drawInfoCard(margin, cardTop + 78, contentWidth, 22, "Godkjent membransystem", `${selectedSystem.product} · ${selectedSystem.sintefApproval}`);

          const qrY = cardTop + 108;
          const qrDrawn = await addImageFit(qrUrl, margin + 2, qrY, 34, 34) || await addImageFit(qrFallbackUrl, margin + 2, qrY, 34, 34);
          if (!qrDrawn) {
            doc.setDrawColor(...border);
            doc.setFillColor(248, 250, 252);
            doc.roundedRect(margin + 2, qrY, 34, 34, 2.5, 2.5, "FD");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7);
            doc.setTextColor(...blue);
            doc.text("QR", margin + 19, qrY + 15, { align: "center" });
            doc.text("ikke lastet", margin + 19, qrY + 22, { align: "center" });
          }
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(51, 65, 85);
          doc.text(doc.splitTextToSize("Skann QR-koden for å åpne/verifisere SINTEF Teknisk Godkjenning for valgt membransystem.", contentWidth - 48), margin + 42, qrY + 7);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...blue);
          doc.text(selectedSystem.sintefApproval, margin + 42, qrY + 20);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.2);
          doc.setTextColor(...gray);
          doc.text("Verifiser dokumentasjon", margin + 42, qrY + 28);

          drawFooterBand("Garantisertifikat");

          doc.addPage();
          resetPage();
          await drawHeader("GARANTIDOKUMENTASJON");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(16);
          doc.setTextColor(...darkBlue);
          doc.text("1. DOKUMENTASJONSGRUNNLAG", margin, y);
          y += 9;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(31, 41, 55);
          doc.text("Denne garantien er basert på følgende dokumentasjon og kontroller i prosjektet:", margin, y);
          y += 10;
          drawCheckCard("Overtagelse signert", "Prosjektet er overtatt og signert av kunde og utførende.");
          drawCheckCard("Ingen åpne avvik", "Alle avvik er lukket eller avklart før garantien er utstedt.");
          drawCheckCard("Sjekklister fullført", "Ordinære sjekklister og systemspesifikke garantipunkter er kontrollert.");
          drawCheckCard("Bildedokumentasjon registrert", "Bilder av relevante arbeidsoperasjoner er registrert i prosjektet.");
          drawCheckCard("Godkjent Sopro-system valgt", `${selectedSystem.product} er dokumentert med ${selectedSystem.sintefApproval}.`);
          drawCheckCard("Garantivilkår mottatt", warranty?.termsAccepted ? `Kunde/representant har bekreftet mottak og aksept av garantivilkår. Bekreftet av ${warranty?.termsAcceptedBy || "ikke oppgitt"}.` : "Garantivilkår er vedlagt, men kvittering er ikke registrert.");
          drawCheckCard("Komplett PDF-rapport generert", "Sluttrapport med sjekklister, bilder, produktdokumentasjon og garantibevis er generert.");
          drawNoteBox("Garantien gjelder kun for det dokumenterte arbeidet i dette prosjektet og forutsetter normal bruk og vedlikehold i henhold til FDV-dokumentasjonen.");
          addSubTitle("Arkivering av dokumentasjon");
          addParagraph("Utførende firma er ansvarlig for å laste ned og oppbevare komplett sluttrapport, inkludert bilder, sjekklister, produktdokumentasjon og garantibevis. Expo ProffDok fungerer som dokumentasjonsplattform, men kan ikke garantere ubegrenset lagringstid eller tilgjengelighet av prosjektdata.");
          addKeyValue("Sist genererte rapport", reportText);
          drawFooterBand("Dokumentasjonsgrunnlag");

          doc.addPage();
          resetPage();
          await drawHeader("GARANTIDOKUMENTASJON");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(16);
          doc.setTextColor(...darkBlue);
          doc.text("2. GARANTIVILKÅR", margin, y);
          y += 9;
          drawTerm("Garantien", `Denne garantien dokumenterer at våtrommet er utført med et godkjent Sopro membransystem og at arbeidet er dokumentert gjennom Expo ProffDok. Garantien gjelder tettheten i det dokumenterte membransystemet i ${getWarrantyYears(warranty)} år fra dato for signert overtakelse, forutsatt at arbeidene er utført i henhold til gjeldende krav, produsentens anvisninger og prosjektets dokumenterte sjekklister.`);
          drawTerm("Hvem garantien gjelder for", "Garantien gjelder for den aktuelle boligen og følger eiendommen ved et eventuelt eierskifte innen garantiperioden. Ny eier overtar de samme rettigheter og forpliktelser som opprinnelig eier.");
          drawTerm("Garantigiver", "Garantien utstedes av det utførende firmaet som er angitt i garantibeviset. Expo ProffDok fungerer som dokumentasjonsplattform og arkiv for prosjektets dokumentasjon, men er ikke part i garantiforholdet.");
          drawTerm("Forutsetninger for garantien", "Garantien forutsetter at prosjektet er dokumentert i Expo ProffDok, at nødvendige sjekklister er gjennomført, at bildedokumentasjon er registrert, at overtakelse er signert, at godkjent Sopro-system er benyttet og at senere arbeider ikke har skadet membransystemet.");
          drawTerm("Hva garantien omfatter", "Garantien omfatter dokumenterte feil i membransystemets tetthet når disse skyldes utførelse eller installasjon av det dokumenterte systemet. Garantien gjelder de områdene som omfattes av prosjektets dokumentasjon.");
          drawTerm("Hva garantien ikke omfatter", "Garantien omfatter ikke mekanisk skade, hulltaking eller inngrep etter overtakelse, manglende vedlikehold, setningsskader i bygget, frostskader, brann- eller vannskader fra andre kilder, naturhendelser eller arbeider utført av andre etter overtakelse.");
          drawTerm("Reklamasjon og varsling", "Forhold som kan omfattes av garantien skal meldes til garantigiver uten ugrunnet opphold etter at forholdet er oppdaget. Reklamasjonen bør inneholde en beskrivelse av forholdet, bilder og relevant dokumentasjon.");
          drawTerm("Dokumentasjon og arkiv", "Garantibeviset er kun gyldig sammen med prosjektets komplette dokumentasjon, inkludert bilder, sjekklister, produktdokumentasjon og signert overtakelse. Det anbefales at boligeier oppbevarer rapporten som en del av boligens FDV-dokumentasjon.");
          drawFooterBand("Garantivilkår");

          doc.addPage();
          resetPage();
          await drawHeader("GARANTIDOKUMENTASJON");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(16);
          doc.setTextColor(...darkBlue);
          doc.text("3. BEKREFTELSE", margin, y);
          y += 8;
          addParagraph("Denne garantien er utstedt elektronisk og bygger på registrert prosjektdata, signert overtakelse, sjekklister og bildedokumentasjon i Expo ProffDok.");

          const tableY = y + 4;
          const rowH = 10;
          const labelW = 48;
          const tableRows = [
            ["Utførende firma", name || company.companyName || ""],
            ["Org.nr.", company.orgNumber || ""],
            ["Dato", issuedDateText],
            ["Kontaktperson", project.responsible || user.name || authUser?.email || ""],
            ["Telefon", companyPhoneForReport || ""],
            ["E-post", company.email || ""]
          ];
          doc.setDrawColor(...border);
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(margin, tableY, contentWidth, tableRows.length * rowH, 2.5, 2.5, "FD");
          tableRows.forEach(([label, value], index) => {
            const yy = tableY + index * rowH;
            if (index > 0) doc.line(margin, yy, pageWidth - margin, yy);
            doc.line(margin + labelW, yy, margin + labelW, yy + rowH);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.setTextColor(...darkBlue);
            doc.text(label, margin + 4, yy + 6.5);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(31, 41, 55);
            doc.text(doc.splitTextToSize(safeText(value || "Ikke oppgitt"), contentWidth - labelW - 8), margin + labelW + 4, yy + 6.5);
          });
          y = tableY + tableRows.length * rowH + 14;

          doc.setDrawColor(...border);
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(margin, y, contentWidth, 34, 2.5, 2.5, "FD");
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(51, 65, 85);
          doc.text(`Bekreftet av ${name || company.companyName || "utførende firma"}`, pageWidth / 2, y + 8, { align: "center" });
          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          doc.setTextColor(...blue);
          doc.text(project.responsible || user.name || "Elektronisk utstedt", pageWidth / 2, y + 20, { align: "center" });
          doc.setDrawColor(148, 163, 184);
          doc.line(margin + 36, y + 24, pageWidth - margin - 36, y + 24);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(...gray);
          doc.text("Elektronisk bekreftelse", pageWidth / 2, y + 29, { align: "center" });
          y += 44;

          drawNoteBox("Takk for tilliten. Ta vare på garantidokumentet sammen med komplett FDV-rapport og øvrig prosjektdokumentasjon.");
          drawFooterBand("Bekreftelse");
        };
        setPdfProgress("Bygger forside…", "Klargjør rapportforside og prosjektstatus.");
        await addCoverPage();

        setPdfProgress("Legger inn prosjektfakta…", "Bygger prosjektfakta og innholdsfortegnelse.");
        const reportStatusForFacts = reportDocumentationStatus();
        addInfoGridSection("Prosjektfakta", [
          ["Prosjektnavn", project.projectName],
          ["Kunde", project.customer],
          ["Adresse", reportAddressLine()],
          ["Prosjektleder / ansvarlig", project.responsible || user.name],
          ["Utførende firma", name || company.companyName || "Expo ProffDok"],
          ["Oppstart / dato", project.date],
          ["Ferdigstillelse / overtagelse", overtagelse?.dato],
          ["Garantiperiode", warranty?.issued ? `${getWarrantyYears(warranty)} år` : warranty?.enabled ? `${getWarrantyYears(warranty)} år – ikke utstedt` : ""],
          ["Garantinummer", warranty?.guaranteeNumber],
          ["Dokumentnummer", makeReportDocumentNumber()],
          ["Rapport generert", reportGeneratedAtLabel()],
          ["Dokumentasjonsgrad", `${reportStatusForFacts.percent} %`]
        ]);

        addSectionTitle("Innhold");
        [
          "1. Prosjektinformasjon",
          "2. Produkter og FDV",
          "3. Overflater og innredning",
          "4. Bildedokumentasjon",
          "5. Fag, deler og utstyr",
          "6. Sjekklister",
          "7. Vedlegg",
          "8. Garantisertifikat",
          "9. Garantivilkår",
          "10. Dokumentasjonsstatus"
        ].forEach((line) => addParagraph(line, { size: 10, lineHeight: 5.2 }));
        addDivider();

        setPdfProgress("Legger inn prosjektinformasjon…", "Firma, kunde, prosjekt og prosjektering.");
        addInfoGridSection("Firma", [
          ["Firma", name || company.companyName || "Expo ProffDok"],
          ["Adresse", company.address],
          ["Org.nr", company.orgNumber],
          ["Telefon", companyPhoneForReport],
          ["E-post", company.email],
          ["Nettside", company.website]
        ]);

        addInfoGridSection("Kunde og prosjekt", [
          ["Prosjektansvarlig", project.responsible],
          ["Prosjektnavn", project.projectName],
          ["Adresse", [project.address, project.postnr, project.city].filter(Boolean).join(", ")],
          ["Kunde", project.customer],
          ["Kunde e-post", project.customerEmail],
          ["Kunde telefon", project.customerPhone],
          ["Dato", project.date],
          ["Status", project.locked ? "Avsluttet / låst" : "Aktivt"],
          ["Notater", project.notes]
        ]);

        addReportSummary();

        if (project.projectInfoIncludeInReport && hasValue(project.projectDescription)) {
          addSectionTitle("Prosjektinformasjon/beskrivelse");
          addParagraph(project.projectDescription);
        }

        const prosjekteringEntries = [
          ["Fall i dusjsone", project.fallDusj],
          ["Fall utenfor dusjsone / våtsone", project.fallUtenfor],
          ["Fall mot sluk", project.fall],
          ["Slukplassering", project.sluk],
          ["Terskelhøyde", project.terskel],
          ["Membran", project.membran],
          ...((Array.isArray(project.prosjekteringPunkter) ? project.prosjekteringPunkter : []).filter((p) => hasValue(p.title) || hasValue(p.value)).map((p) => [`${p.category || "Annet"}: ${p.title || "Eget punkt"}`, p.value])),
          ["Kommentar / avvik", project.prosjekteringKommentar]
        ];
        addInfoGridSection("Prosjektering", prosjekteringEntries);

        setPdfProgress("Legger inn produkter og FDV…", "Bygger produktkort og valgte dokumentlenker.");
        addSectionPageBreak("Produkter / FDV");
        const allProducts = [...selected || [], ...manualSelected || []];
        if (!allProducts.length) {
          addParagraph("Ingen produkter er valgt.");
        }
        const productsBySection = allProducts.reduce((acc, product) => {
          const section = product.section || "Andre produkter";
          acc[section] = [...acc[section] || [], product];
          return acc;
        }, {});
        Object.entries(productsBySection).forEach(([section, products]) => {
          addProductCategoryHeader(section, products.length);
          products.forEach((p) => addProductReportCard(p));
        });
        Object.entries(other || {}).filter(([, v]) => v).forEach(([k, v]) => addParagraph(`Tidligere registrert annet produkt under ${k}: ${v}`));

        const bathroomEquipmentGroupsForPdf = buildBathroomEquipmentReportGroups(surf, bathroomEquipment);
        if (bathroomEquipmentGroupsForPdf.length) {
          addSectionPageBreak("Overflater og innredning");
          bathroomEquipmentGroupsForPdf.forEach((group) => {
            addEquipmentCategoryHeader(group.title, (group.items || []).length);
            (group.items || []).forEach((item) => addEquipmentReportCard(item));
          });
        }

        setPdfProgress("Samler bilder…", "Laster inn og konverterer bilder til PDF-format.");
        addSectionPageBreak("Bildedokumentasjon");
        const photoCats = [...new Set((photos || []).map((photo) => photo.cat).filter(Boolean))];
        if (!photoCats.length) addParagraph("Ingen bilder er lagt til.");
        for (const cat of photoCats) {
          await addImageGalleryCategory(cat, (photos || []).filter((item) => item.cat === cat));
        }

        addSectionTitle("Fag, deler og utstyr");
        if (!(inst || []).length) addParagraph("Ingen fag-/utstyrsposter er lagt til.");
        for (const item of inst || []) {
          const sectionTitle = item.category || "Fag/utstyr";
          addSubTitle(sectionTitle);
          addParagraph([item.name, item.qty, item.supplier, item.desc].filter(Boolean).join(" · "));
          addLink("Åpne FDV/datablad", item.fdvUrl);
          const installPhotos = (item.photos || []).filter((photo) => (hasValue(photo?.url) || hasValue(photo?.path)) && !isLikelyDocumentFile(photo));
          if (installPhotos.length) {
            const galleryTitle = [sectionTitle, item.name || item.supplier || "bilder"].filter(Boolean).join(" – ");
            await addImageGalleryCategory(galleryTitle, installPhotos.map((photo, index) => ({ ...photo, _reportCaption: `${galleryTitle} – bilde ${index + 1}` })));
          }
          addDivider();
        }

        setPdfProgress("Bygger sjekklister…", "Fremhever OK-punkter, avvik og kommentarer.");
        addSectionPageBreak("Sjekkliste / utførte kontroller");
        addParagraph("Kontrollpunktene under viser registrert status for prosjektet. Godkjente punkter er fremhevet for å gi en tydelig dokumentasjon av utført kontroll.", { size: 8.5, lineHeight: 4.3 });
        for (const [category, items] of Object.entries(checklist || {})) {
          const itemEntries = Object.entries(items || {});
          if (!itemEntries.length) continue;
          addChecklistCategoryTitle(category, itemEntries.length);
          for (const [item, value] of itemEntries) {
            await addChecklistStatusCard(category, item, value || {});
          }
        }

        const deviations = [];
        Object.entries(checklist || {}).forEach(([category, items]) => {
          Object.entries(items || {}).forEach(([item, value]) => {
            if (value?.status === "Avvik" || value?.status === "Lukket avvik") deviations.push({ category, item, status: value?.status || "", comment: value?.comment || "", closeComment: value?.closeComment || "", closedBy: value?.closedBy || "", closedAt: value?.closedAt || "" });
          });
        });
        if (deviations.length) {
          addSectionTitle("Avviksliste");
          const openDeviationTotal = deviations.filter((d) => d.status === "Avvik").length;
          const closedDeviationTotal = deviations.filter((d) => d.status === "Lukket avvik").length;
          addParagraph(`Avviksoppsummering: ${openDeviationTotal} åpne avvik · ${closedDeviationTotal} lukkede avvik`, { bold: true });
          deviations.forEach((d) => {
            addSubTitle(`${d.status === "Lukket avvik" ? "✅ Lukket avvik" : "⚠️ Åpent avvik"} – ${d.category} / ${d.item}`);
            if (d.comment) addKeyValue("Opprinnelig avvik", d.comment);
            if (d.status === "Lukket avvik") {
              addKeyValue("Utbedring / lukkekommentar", d.closeComment || "Lukket uten egen lukkekommentar");
              addKeyValue("Lukket av", d.closedBy || "Ikke oppgitt");
              addKeyValue("Lukket dato", d.closedAt ? new Date(d.closedAt).toLocaleString("no-NO") : "Ikke oppgitt");
            } else if (!d.comment) {
              addParagraph("Avvik registrert uten kommentar.");
            }
            addDivider();
          });
        }

        if (tilbud?.enabled && (hasValue(tilbud.tillegg) || hasValue(tilbud.fradrag) || hasValue(tilbud.kommentar) || (tilbud.files || []).length > 0)) {
          addSectionTitle("Tilbud / kontrakt");
          addKeyValue("Tillegg", tilbud.tillegg);
          addKeyValue("Fradrag", tilbud.fradrag);
          addKeyValue("Avtaleendringer / kommentar", tilbud.kommentar);
          if ((tilbud.files || []).length > 0) addParagraph("Tilbuds- og kontraktsvedlegg ligger også samlet bakerst i rapporten under Vedlegg.", { size: 9.5, lineHeight: 4.6 });
          (tilbud.files || []).forEach((file) => addLink(file.name || "Vedlegg", file.url));
        }

        if (overtagelse?.enabled && (hasValue(overtagelse.dato) || hasValue(overtagelse.kommentar) || hasValue(overtagelse.signUtførende) || hasValue(overtagelse.signKunde) || hasValue(overtagelse.signUtførendeImage) || hasValue(overtagelse.signKundeImage))) {
          addSectionPageBreak("Overtagelse");
          const hasRemarks = hasValue(overtagelse.kommentar) && !/^ingen\s*(bemerkninger|merknader)?$/i.test(String(overtagelse.kommentar).trim());
          ensureSpace(54);
          doc.setDrawColor(...(hasRemarks ? [251, 191, 36] : [74, 222, 128]));
          doc.setFillColor(...(hasRemarks ? [255, 251, 235] : [236, 253, 245]));
          doc.roundedRect(margin, y, contentWidth, 28, 3, 3, "FD");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(13);
          doc.setTextColor(...(hasRemarks ? [146, 64, 14] : [6, 95, 70]));
          doc.text(hasRemarks ? "OVERTATT MED MERKNAD" : "OVERTATT UTEN MERKNAD", margin + 6, y + 11);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.3);
          doc.setTextColor(51, 65, 85);
          doc.text(doc.splitTextToSize(hasRemarks ? overtagelse.kommentar : "Prosjektet er registrert overtatt av kunde og utførende.", contentWidth - 12), margin + 6, y + 19);
          y += 34;
          const signGap = 5;
          const signW = (contentWidth - signGap) / 2;
          drawInfoCardPdf(margin, y, signW, 22, "Dato", overtagelse.dato || "Ikke oppgitt");
          drawInfoCardPdf(margin + signW + signGap, y, signW, 22, "Status", hasRemarks ? "Overtatt med merknad" : "Overtatt uten merknad");
          y += 27;
          drawInfoCardPdf(margin, y, signW, 22, "Utførende", overtagelse.signUtførende || project.responsible || user.name || "Ikke oppgitt");
          drawInfoCardPdf(margin + signW + signGap, y, signW, 22, "Kunde", overtagelse.signKunde || project.customer || "Ikke oppgitt");
          y += 27;
          if (warranty?.enabled) {
            drawInfoCardPdf(margin, y, contentWidth, 22, `Garantivilkår ${getWarrantyYears(warranty)} år`, warranty?.termsAccepted ? `Mottatt og akseptert av ${warranty?.termsAcceptedBy || warranty?.termsReceiptName || "kunde"}${warranty?.termsAcceptedAt ? " " + new Date(warranty.termsAcceptedAt).toLocaleString("no-NO") : ""}` : "Ikke bekreftet");
            y += 30;
          } else {
            y += 3;
          }
          ensureSpace(50);
          await drawSignatureBlock("Signatur utførende", overtagelse.signUtførende || project.responsible || user.name || "Utførende", overtagelse.signUtførendeImage, margin, y, signW, 46);
          await drawSignatureBlock("Signatur kunde", overtagelse.signKunde || project.customer || "Kunde", overtagelse.signKundeImage, margin + signW + signGap, y, signW, 46);
          y += 54;
        }

        const checklistDocumentAttachments = [];
        Object.entries(checklist || {}).forEach(([category, items]) => {
          Object.entries(items || {}).forEach(([item, value]) => {
            (value?.photos || []).filter((file) => isLikelyDocumentFile(file)).forEach((file, index) => {
              checklistDocumentAttachments.push({
                ...file,
                name: file?.name || `${item} – dokument ${index + 1}`,
                _sourceLabel: `Sjekkliste: ${category} / ${item}`
              });
            });
          });
        });
        const installDocumentAttachments = [];
        (inst || []).forEach((entry) => {
          (entry?.photos || []).filter((file) => isLikelyDocumentFile(file)).forEach((file, index) => {
            installDocumentAttachments.push({
              ...file,
              name: file?.name || `${entry?.name || entry?.category || "Fag/utstyr"} – dokument ${index + 1}`,
              _sourceLabel: `Fag/utstyr: ${entry?.category || "Uspesifisert"}`
            });
          });
        });
        const reportAttachments = [
          ...(files || []).map((file) => ({ ...file, _sourceLabel: "Sjekklister / andre vedlegg" })),
          ...checklistDocumentAttachments,
          ...installDocumentAttachments,
          ...(tilbud?.files || []).map((file) => ({ ...file, _sourceLabel: "Tilbud / kontrakt" }))
        ];
        addAttachmentList("Vedlegg – opplastede filer", reportAttachments, "Ingen vedlegg er lagt til.");

        const visibleAccess = (access || []).filter((a) => hasValue(a?.name) || hasValue(a?.email));
        if (visibleAccess.length) {
          addSectionTitle("Prosjekttilgang");
          visibleAccess.forEach((a) => addParagraph(`${a.name || a.email} — ${a.role || "Tilgang"}`));
        }

        setPdfProgress("Oppretter garantidokument…", "Legger inn garantisertifikat, vilkår og QR-kode der garanti er aktivert.");
        await addWarrantyCertificatePages();

        setPdfProgress("Legger inn dokumentasjonsstatus…", "Oppsummerer komplett dokumentasjonsgrad.");
        const addDocumentationStatusPage = () => {
          const status = reportDocumentationStatus();
          const drawReportNoteBox = (text) => {
            const lines = doc.splitTextToSize(safeText(text), contentWidth - 18);
            const h = Math.max(18, lines.length * 4 + 10);
            ensureSpace(h + 4);
            doc.setDrawColor(191, 219, 254);
            doc.setFillColor(239, 246, 255);
            doc.roundedRect(margin, y, contentWidth, h, 2.5, 2.5, "FD");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(20, 86, 160);
            doc.text("i", margin + 7, y + 10);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(30, 64, 105);
            doc.text(lines, margin + 15, y + 8);
            y += h + 7;
          };
          doc.addPage();
          y = 16;
          addSectionTitle("Dokumentasjonsstatus");
          doc.setFillColor(12, 42, 82);
          doc.roundedRect(margin, y, contentWidth, 32, 4, 4, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(13);
          doc.setTextColor(255, 255, 255);
          doc.text("Dokumentasjonsgrad", margin + 8, y + 12);
          doc.setFontSize(24);
          doc.text(`${status.percent} %`, pageWidth - margin - 8, y + 21, { align: "right" });
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.4);
          doc.setTextColor(226, 232, 240);
          doc.text("Basert på registrerte produkter, bilder, sjekklister, vedlegg, overtagelse og garanti.", margin + 8, y + 23);
          y += 42;

          status.items.forEach((item) => {
            ensureSpace(16);
            doc.setDrawColor(item.ok ? 187 : 253, item.ok ? 247 : 186, item.ok ? 208 : 116);
            doc.setFillColor(item.ok ? 236 : 255, item.ok ? 253 : 251, item.ok ? 245 : 235);
            doc.roundedRect(margin, y, contentWidth, 13, 2.5, 2.5, "FD");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.4);
            doc.setTextColor(item.ok ? 6 : 146, item.ok ? 95 : 64, item.ok ? 70 : 14);
            doc.text(item.ok ? "OK" : "MÅ FØLGES OPP", margin + 5, y + 8.3);
            doc.setTextColor(15, 23, 42);
            doc.text(safeText(item.label), margin + 38, y + 8.3);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(71, 85, 105);
            doc.text(doc.splitTextToSize(safeText(item.detail), contentWidth - 105).slice(0, 1), pageWidth - margin - 5, y + 8.3, { align: "right" });
            y += 17;
          });

          y += 4;
          drawReportNoteBox("Rapporten bør lastes ned og lagres sammen med øvrig FDV-dokumentasjon. Ved salg av boligen bør rapporten deles med ny eier, megler og/eller takstmann der dette er relevant.");
        };
        addDocumentationStatusPage();

        setPdfProgress("Klargjør PDF…", "Setter sidetall, bunntekst og filnavn.");
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i += 1) {
          doc.setPage(i);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
          doc.setTextColor(100, 116, 139);
          doc.text("Expo ProffDok rapport", pageWidth / 2, 7, { align: "center" });
          doc.text(`${i}/${pageCount}`, pageWidth - margin, pageHeight - 7, { align: "right" });
          doc.text("© 2026 Expo Proffsenter – Expo ProffDok. Alle rettigheter forbeholdt.", pageWidth / 2, pageHeight - 7, { align: "center" });
        }

        const generatedFileName = `${filenameSafe(project.projectName || project.address || project.customer || "FDV-rapport")}.pdf`;
        doc.save(generatedFileName);
        setPdfProgress("✅ Rapport klar", "PDF-en er generert og lastes ned.");
        clearPdfProgress(1400);
        if (warranty?.enabled) {
          if (isProjectLocked) {
            alert("PDF er generert fra låst/arkivert prosjekt. Prosjektets lagrede dokumentasjon og garantistatus er ikke endret.");
          } else {
            const reportGeneratedAt = (/* @__PURE__ */ new Date()).toISOString();
            setWarranty((prev) => ({
              ...emptyWarranty(),
              ...prev,
              reportGeneratedAt,
              reportGeneratedFileName: generatedFileName,
              guaranteeNumber: prev?.guaranteeNumber || "",
              status: prev?.issued ? "issued" : "report_generated"
            }));
            alert("PDF er generert. Husk å lagre filen på egen maskin/server. Garantimodulen er oppdatert med at komplett rapport er generert – husk å lagre/oppdatere prosjektet.");
          }
        }
      } catch (error) {
        clearPdfProgress(0);
        console.error("Kunne ikke lage PDF med klikkbare lenker:", error);
        alert("Kunne ikke lage PDF med klikkbare lenker. Bruk vanlig utskrift som fallback. Feil: " + (error?.message || String(error)));
      }
    };

    const uploadImages = async (fileList, folder = "photos") => {
      if (isProjectLocked) {
        notifyLockedProject();
        return [];
      }
      const filesArray = Array.from(fileList || []);
      const imageFiles = filesArray.filter((file) => {
        const fileName = String(file?.name || "");
        const mime = String(file?.type || "");
        return /^image\//i.test(mime) || /\.(jpe?g|png|gif|webp|bmp|svg|heic|heif)$/i.test(fileName);
      });
      if (filesArray.length && imageFiles.length !== filesArray.length) {
        alert("Kun bildefiler kan lastes opp som sjekkpunktbilder. PDF og andre dokumenter må lastes opp under ‘Opplastede sjekklister / vedlegg fra andre fag’. ");
      }
      const uploaded = [];
      for (const file of imageFiles) {
        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const path = `${folder}/${Date.now()}-${uid()}-${cleanName}`;
        const { error } = await supabase.storage.from("project-images").upload(path, file, { cacheControl: "3600", upsert: false });
        if (error) {
          console.error(error);
          alert("Kunne ikke laste opp bilde: " + error.message);
          continue;
        }
        const { data } = supabase.storage.from("project-images").getPublicUrl(path);
        uploaded.push({ id: uid(), url: data.publicUrl, path, name: file.name });
      }
      return uploaded;
    };
    const autoSavePhotosToCloud = async (nextPhotos) => {
      if (!authUser || !projectId || isReadOnly) return;
      setPhotoSaveStatus("Lagrer bilder …");
      try {
        const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
        if (fetchError || !existing) {
          setPhotoSaveStatus("Kunne ikke autolagre bilder");
          console.warn("Autolagring bilder feilet:", fetchError?.message || "Fant ikke prosjekt");
          return;
        }
        if (rowIsLocked(existing) || isProjectLocked) {
          setPhotoSaveStatus("Prosjektet er låst – bilder ikke lagret");
          return;
        }
        const existingData = dataFromRow(existing);
        const snapshot = latestStateRef.current || {};
        const cleanData = JSON.parse(JSON.stringify({
          ...existingData,
          company: snapshot.company || company,
          user: snapshot.user || user,
          project: { ...emptyProject(), ...existingData.project || {}, ...snapshot.project || project },
          checked: snapshot.checked || checked,
          productDocs: snapshot.productDocs || productDocs,
          manualProducts: snapshot.manualProducts || manualProducts,
          other: snapshot.other || other,
          surf: snapshot.surf || surf,
          bathroomEquipment: snapshot.bathroomEquipment || bathroomEquipment,
          photos: nextPhotos,
          access: snapshot.access || access,
          inst: snapshot.inst || inst,
          files: snapshot.files || files,
          checklist: snapshot.checklist || checklist,
          tilbud: snapshot.tilbud || tilbud,
          overtagelse: snapshot.overtagelse || overtagelse,
          warranty: snapshot.warranty || warranty,
          projectLog: snapshot.projectLog || projectLog,
          internalNotes: snapshot.internalNotes || internalNotes
        }));
        const { error: updateError } = await supabase.from("projects").update({
          data: cleanData,
          title: (snapshot.project || project)?.projectName || (snapshot.project || project)?.address || existing.title || "Uten navn",
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", projectId);
        if (updateError) {
          setPhotoSaveStatus("Kunne ikke autolagre bilder");
          console.warn("Autolagring bilder feilet:", updateError.message);
          return;
        }
        latestStateRef.current = { ...snapshot, photos: nextPhotos };
        setPhotoSaveStatus(`Bilder autolagret ${(/* @__PURE__ */ new Date()).toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" })}`);
      } catch (error) {
        console.warn("Autolagring bilder feilet:", error);
        setPhotoSaveStatus("Kunne ikke autolagre bilder");
      }
    };
    const addPhoto = async (cat, fl) => {
      if (!canEditProject()) return;
      const imgs = await uploadImages(fl, "photos");
      if (!imgs.length) return;
      const newPhotos = imgs.map((img) => ({
        ...img,
        cat,
        comment: "",
        created: (/* @__PURE__ */ new Date()).toLocaleString("no-NO")
      }));
      let nextPhotosSnapshot = null;
      setPhotos((p) => {
        nextPhotosSnapshot = [...p, ...newPhotos];
        return nextPhotosSnapshot;
      });
      setTimeout(() => autoSavePhotosToCloud(nextPhotosSnapshot), 120);
    };
    const stopFileDragNavigation = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    const handlePhotoTileDrop = (cat, event) => {
      event.preventDefault();
      event.stopPropagation();
      const droppedFiles = event?.dataTransfer?.files;
      if (droppedFiles && droppedFiles.length) addPhoto(cat, droppedFiles);
    };
    const autoSaveChecklistToCloud = async (nextChecklist) => {
      if (!authUser || !projectId || isReadOnly) return;
      setChecklistSaveStatus("Lagrer sjekkliste …");
      try {
        const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
        if (fetchError || !existing) {
          setChecklistSaveStatus("Kunne ikke autolagre sjekkliste");
          console.warn("Autolagring sjekkliste feilet:", fetchError?.message || "Fant ikke prosjekt");
          return;
        }
        if (rowIsLocked(existing) || isProjectLocked) {
          setChecklistSaveStatus("Prosjektet er låst – ikke lagret");
          return;
        }
        const existingData = dataFromRow(existing);
        const snapshot = latestStateRef.current || {};
        const cleanData = JSON.parse(JSON.stringify({
          ...existingData,
          company: snapshot.company || company,
          user: snapshot.user || user,
          project: { ...emptyProject(), ...existingData.project || {}, ...snapshot.project || project },
          checked: snapshot.checked || checked,
          productDocs: snapshot.productDocs || productDocs,
          manualProducts: snapshot.manualProducts || manualProducts,
          other: snapshot.other || other,
          surf: snapshot.surf || surf,
          bathroomEquipment: snapshot.bathroomEquipment || bathroomEquipment,
          photos: snapshot.photos || photos,
          access: snapshot.access || access,
          inst: snapshot.inst || inst,
          files: snapshot.files || files,
          checklist: nextChecklist,
          tilbud: snapshot.tilbud || tilbud,
          overtagelse: snapshot.overtagelse || overtagelse,
          warranty: snapshot.warranty || warranty,
          projectLog: snapshot.projectLog || projectLog,
          internalNotes: snapshot.internalNotes || internalNotes
        }));
        const { error: updateError } = await supabase.from("projects").update({
          data: cleanData,
          title: (snapshot.project || project)?.projectName || (snapshot.project || project)?.address || existing.title || "Uten navn",
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", projectId);
        if (updateError) {
          setChecklistSaveStatus("Kunne ikke autolagre sjekkliste");
          console.warn("Autolagring sjekkliste feilet:", updateError.message);
          return;
        }
        latestStateRef.current = { ...snapshot, checklist: nextChecklist };
        setChecklistSaveStatus(`Autolagret ${(/* @__PURE__ */ new Date()).toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" })}`);
      } catch (error) {
        console.warn("Autolagring sjekkliste feilet:", error);
        setChecklistSaveStatus("Kunne ikke autolagre sjekkliste");
      }
    };
    const scheduleChecklistAutoSave = (nextChecklist, delay = 650) => {
      if (!nextChecklist) return;
      if (checklistAutoSaveTimerRef.current) window.clearTimeout(checklistAutoSaveTimerRef.current);
      setChecklistSaveStatus("Autolagring venter …");
      checklistAutoSaveTimerRef.current = window.setTimeout(() => {
        autoSaveChecklistToCloud(nextChecklist);
      }, delay);
    };
    const setChecklistValue = (category, item, patch, options = { autoSave: true }) => {
      let nextChecklistSnapshot = null;
      setChecklist((prev) => {
        const nextChecklist = {
          ...prev,
          [category]: {
            ...prev[category] || {},
            [item]: {
              ...prev[category]?.[item] || {},
              ...patch
            }
          }
        };
        nextChecklistSnapshot = nextChecklist;
        return nextChecklist;
      });
      if (options.autoSave !== false) {
        scheduleChecklistAutoSave(nextChecklistSnapshot, options.delay || 650);
      }
    };
    const saveChecklistNow = () => autoSaveChecklistToCloud(checklist);
    const addChecklistPhoto = async (category, item, fl) => {
      const imgs = await uploadImages(fl, "sjekklister");
      if (!imgs.length) return;
      let nextChecklistSnapshot = null;
      setChecklist((prev) => {
        const nextChecklist = {
          ...prev,
          [category]: {
            ...prev[category] || {},
            [item]: {
              ...prev[category]?.[item] || {},
              photos: [...prev[category]?.[item]?.photos || [], ...imgs]
            }
          }
        };
        nextChecklistSnapshot = nextChecklist;
        return nextChecklist;
      });
      scheduleChecklistAutoSave(nextChecklistSnapshot, 250);
    };
    const addFiles = async (fl) => {
      if (!canEditProject()) return;
      const filesArray = Array.from(fl || []);
      const uploaded = [];
      for (const file of filesArray) {
        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const path = `vedlegg/${Date.now()}-${uid()}-${cleanName}`;
        const { error } = await supabase.storage.from("project-images").upload(path, file, { cacheControl: "3600", upsert: false });
        if (error) {
          console.error(error);
          alert("Kunne ikke laste opp vedlegg: " + error.message);
          continue;
        }
        const { data } = supabase.storage.from("project-images").getPublicUrl(path);
        uploaded.push({
          id: uid(),
          name: file.name,
          url: data.publicUrl,
          path,
          storagePath: path,
          type: file.type || "",
          mimeType: file.type || "",
          size: file.size || 0,
          trade: "Uspesifisert",
          documentType: "Sjekkliste",
          description: "",
          by: user.name || authUser?.email || "Ukjent",
          created: (/* @__PURE__ */ new Date()).toLocaleString("no-NO")
        });
      }
      if (uploaded.length) setFiles((p) => [...p, ...uploaded]);
    };
    const uploadTilbudFiles = async (fileList) => {
      const filesArray = Array.from(fileList || []);
      const uploaded = [];
      for (const file of filesArray) {
        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const path = `tilbud-kontrakt/${Date.now()}-${uid()}-${cleanName}`;
        const { error } = await supabase.storage.from("project-images").upload(path, file, { cacheControl: "3600", upsert: false });
        if (error) {
          console.error(error);
          alert("Kunne ikke laste opp vedlegg: " + error.message);
          continue;
        }
        const { data } = supabase.storage.from("project-images").getPublicUrl(path);
        uploaded.push({
          id: uid(),
          url: data.publicUrl,
          path,
          name: file.name,
          by: user.name || authUser?.email || "Ukjent",
          created: (/* @__PURE__ */ new Date()).toLocaleString("no-NO")
        });
      }
      if (uploaded.length) {
        setTilbud((t) => ({ ...emptyTilbud(), ...t, files: [...t.files || [], ...uploaded] }));
      }
    };
    const updateBathroomEquipment = (patch = {}) => setBathroomEquipment((prev) => ({ ...prev || {}, ...patch }));
    const renderEquipmentItem = (item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: item.label }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Produkt / beskrivelse", value: equipmentValue(bathroomEquipment, item.key, "product"), onChange: (v) => updateBathroomEquipment({ [`${item.key}_product`]: v }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Leverandør", value: equipmentValue(bathroomEquipment, item.key, "supplier"), onChange: (v) => updateBathroomEquipment({ [`${item.key}_supplier`]: v }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-link", value: equipmentValue(bathroomEquipment, item.key, "fdvUrl"), onChange: (v) => updateBathroomEquipment({ [`${item.key}_fdvUrl`]: v }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Produktsertifikat-link", value: equipmentValue(bathroomEquipment, item.key, "certificateUrl"), onChange: (v) => updateBathroomEquipment({ [`${item.key}_certificateUrl`]: v }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Kommentar", value: equipmentValue(bathroomEquipment, item.key, "comment"), onChange: (v) => updateBathroomEquipment({ [`${item.key}_comment`]: v }) })
    ] }, item.key);
    const addCustomEquipmentItem = (sectionTitle) => {
      const storageKey = equipmentSectionStorageKey(sectionTitle);
      const current = equipmentCustomItemsForSection(bathroomEquipment, sectionTitle);
      updateBathroomEquipment({ [storageKey]: [...current, { id: uid(), title: "", product: "", supplier: "", fdvUrl: "", certificateUrl: "", comment: "" }] });
    };
    const updateCustomEquipmentItem = (sectionTitle, id, patch) => {
      const storageKey = equipmentSectionStorageKey(sectionTitle);
      const current = equipmentCustomItemsForSection(bathroomEquipment, sectionTitle);
      updateBathroomEquipment({ [storageKey]: current.map((item) => item.id === id ? { ...item, ...patch } : item) });
    };
    const removeCustomEquipmentItem = (sectionTitle, id) => {
      const storageKey = equipmentSectionStorageKey(sectionTitle);
      const current = equipmentCustomItemsForSection(bathroomEquipment, sectionTitle);
      updateBathroomEquipment({ [storageKey]: current.filter((item) => item.id !== id) });
    };
    const renderCustomEquipmentSection = (sectionTitle) => {
      const customItems = equipmentCustomItemsForSection(bathroomEquipment, sectionTitle);
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Egne produkter / annet" }),
        customItems.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Legg til egne produkter dersom standardpunktene ikke dekker alt som skal dokumenteres." }),
        customItems.map((customItem, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", style: { marginTop: "12px" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: `Eget produkt ${index + 1}` }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => removeCustomEquipmentItem(sectionTitle, customItem.id), children: "Fjern" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Tittel / type", value: customItem.title || "", onChange: (v) => updateCustomEquipmentItem(sectionTitle, customItem.id, { title: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Produkt / beskrivelse", value: customItem.product || "", onChange: (v) => updateCustomEquipmentItem(sectionTitle, customItem.id, { product: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Leverandør", value: customItem.supplier || "", onChange: (v) => updateCustomEquipmentItem(sectionTitle, customItem.id, { supplier: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-link", value: customItem.fdvUrl || "", onChange: (v) => updateCustomEquipmentItem(sectionTitle, customItem.id, { fdvUrl: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Produktsertifikat-link", value: customItem.certificateUrl || "", onChange: (v) => updateCustomEquipmentItem(sectionTitle, customItem.id, { certificateUrl: v }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Kommentar", value: customItem.comment || "", onChange: (v) => updateCustomEquipmentItem(sectionTitle, customItem.id, { comment: v }) })
        ] }, customItem.id)),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => addCustomEquipmentItem(sectionTitle), children: "+ Legg til eget produkt" })
      ] });
    };
    const renderOverflaterOgInnredning = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Overflater og innredning", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Dokumenter synlige overflater, innredning, sanitærutstyr, armaturer, elektriske komponenter og annet utstyr. Bare utfylte punkter tas med i rapport/PDF." }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note collapsibleHelp", children: "Klikk på kategoriene under for å registrere produkter, FDV-lenker og dokumentasjon. Kun utfylte punkter tas med i rapporten." }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleBlock, { title: "Fliser og overflater", defaultOpen: Object.values(surf || {}).some(hasValue), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, { children: surfaces.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: `${f} - produkt, farge og plassering`, value: surf[f] || "", onChange: (v) => setSurf({ ...surf, [f]: v }) }, f)) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleBlock, { title: "WC / toalett", defaultOpen: wcHasContent(bathroomEquipment), children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "WC" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Type WC", value: bathroomEquipment.wcType || "", onChange: (v) => updateBathroomEquipment({ wcType: v }), options: ["", "Vegghengt", "Gulvstående"], optionLabels: { "": "Velg type" } }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: bathroomEquipment.wcType === "Vegghengt" ? "Veggskål / WC-produkt" : "WC-produkt / modell", value: bathroomEquipment.wcProduct || "", onChange: (v) => updateBathroomEquipment({ wcProduct: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: bathroomEquipment.wcType === "Vegghengt" ? "Leverandør veggskål" : "Leverandør", value: bathroomEquipment.wcSupplier || "", onChange: (v) => updateBathroomEquipment({ wcSupplier: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: bathroomEquipment.wcType === "Vegghengt" ? "FDV-link veggskål" : "FDV-link WC-produkt", value: bathroomEquipment.wcProductFdvUrl || bathroomEquipment.wcFdvUrl || "", onChange: (v) => updateBathroomEquipment({ wcProductFdvUrl: v, wcFdvUrl: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: bathroomEquipment.wcType === "Vegghengt" ? "Produktsertifikat veggskål" : "Produktsertifikat WC-produkt", value: bathroomEquipment.wcProductCertificateUrl || bathroomEquipment.wcCertificateUrl || "", onChange: (v) => updateBathroomEquipment({ wcProductCertificateUrl: v, wcCertificateUrl: v }) }),
          bathroomEquipment.wcType === "Vegghengt" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Sisternemodell", value: bathroomEquipment.wcCistern || "", onChange: (v) => updateBathroomEquipment({ wcCistern: v }) }),
          bathroomEquipment.wcType === "Vegghengt" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Leverandør sisterne", value: bathroomEquipment.wcCisternSupplier || "", onChange: (v) => updateBathroomEquipment({ wcCisternSupplier: v }) }),
          bathroomEquipment.wcType === "Vegghengt" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-link sisterne", value: bathroomEquipment.wcCisternFdvUrl || "", onChange: (v) => updateBathroomEquipment({ wcCisternFdvUrl: v }) }),
          bathroomEquipment.wcType === "Vegghengt" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Produktsertifikat sisterne", value: bathroomEquipment.wcCisternCertificateUrl || "", onChange: (v) => updateBathroomEquipment({ wcCisternCertificateUrl: v }) }),
          bathroomEquipment.wcType === "Vegghengt" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Trykknappmodell", value: bathroomEquipment.wcFlushPlate || "", onChange: (v) => updateBathroomEquipment({ wcFlushPlate: v }) }),
          bathroomEquipment.wcType === "Vegghengt" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Leverandør trykknapp", value: bathroomEquipment.wcFlushPlateSupplier || "", onChange: (v) => updateBathroomEquipment({ wcFlushPlateSupplier: v }) }),
          bathroomEquipment.wcType === "Vegghengt" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-link trykknapp", value: bathroomEquipment.wcFlushPlateFdvUrl || "", onChange: (v) => updateBathroomEquipment({ wcFlushPlateFdvUrl: v }) }),
          bathroomEquipment.wcType === "Vegghengt" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Produktsertifikat trykknapp", value: bathroomEquipment.wcFlushPlateCertificateUrl || "", onChange: (v) => updateBathroomEquipment({ wcFlushPlateCertificateUrl: v }) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Kommentar", value: bathroomEquipment.wcComment || "", onChange: (v) => updateBathroomEquipment({ wcComment: v }) })
      ] }) }),
      bathroomEquipmentSections.map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleBlock, { title: section.title, defaultOpen: section.items.some((item) => equipmentHasGenericContent(bathroomEquipment, item.key)) || equipmentCustomItemsForSection(bathroomEquipment, section.title).some(equipmentCustomItemHasContent), children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cards", children: [
        ...section.items.map((item) => renderEquipmentItem(item)),
        renderCustomEquipmentSection(section.title)
      ] }) }, section.title))
    ] });

    if (authLoading && !isReadOnly && !isUnderleverandorView) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Laster..." }) }) }) });
    }
    if (passwordRecovery && !isReadOnly) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Expo ProffDok" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Sett nytt passord" })
          ] })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Sett nytt passord", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Skriv inn et nytt passord. Det kan ikke v\xE6re det samme som forrige passord." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              Input,
              {
                label: "Nytt passord",
                type: "password",
                value: newPassword,
                onChange: setNewPassword,
                autoComplete: "new-password"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              Input,
              {
                label: "Gjenta nytt passord",
                type: "password",
                value: newPasswordRepeat,
                onChange: setNewPasswordRepeat,
                autoComplete: "new-password",
                onKeyDown: (e) => {
                  if (e.key === "Enter") completePasswordReset();
                }
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: completePasswordReset, children: "Lagre nytt passord" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: async () => {
              setPasswordRecovery(false);
              setNewPassword("");
              setNewPasswordRepeat("");
              window.history.replaceState({}, document.title, window.location.pathname);
              await supabase.auth.signOut();
              setAuthUser(null);
              setProfile(null);
            }, children: "Avbryt og g\xE5 til innlogging" })
          ] })
        ] }) })
      ] });
    }
    if (isUnderleverandorView) {
      const limitedTabs = [["prosjektinfo", "Prosjektinformasjon"], ["produkter", "Produkter"], ["overflater", "Overflater og innredning"], ["bilder", "Bilder"], ["installasjoner", "Fag/utstyr"], ["sjekklister", "Sjekklister"]];
      if (!projectId && !(project.projectName || project.address)) {
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Expo ProffDok" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Laster prosjekt..." })
            ] })
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { title: "Laster prosjekt", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Henter prosjektdata..." }) }) })
        ] });
      }
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `
          .collapsibleHelp { font-weight:800; background:#f8fafc; border:1px solid #dbe7ec; border-radius:14px; padding:10px 12px; }
          .collapsibleBlock { border:1px solid #dbe7ec; border-radius:16px; background:#ffffff; margin:12px 0; overflow:hidden; }
          .collapsibleBlock summary { list-style:none; cursor:pointer; padding:13px 14px; display:flex; align-items:center; justify-content:space-between; gap:10px; font-weight:900; color:#0f172a; background:#f8fafc; border-bottom:1px solid transparent; user-select:none; transition:background .15s ease, border-color .15s ease, box-shadow .15s ease; }
          .collapsibleBlock summary:hover { background:#eef7fa; box-shadow:inset 0 0 0 1px rgba(8,213,216,.18); }
          .collapsibleBlock[open] summary { border-bottom-color:#dbe7ec; background:#f1f8fb; }
          .collapsibleBlock summary::-webkit-details-marker { display:none; }
          .collapsibleBlock summary:after { content:'▼'; font-size:13px; color:#0f172a; transition:transform .15s ease; background:#ffffff; border:1px solid #cbd5e1; border-radius:999px; width:24px; height:24px; display:inline-flex; align-items:center; justify-content:center; flex:0 0 24px; }
          .collapsibleBlock:not([open]) summary:after { transform:rotate(-90deg); }
          .collapsibleBlockBody { padding:0 14px 14px; }
          @media screen and (max-width:700px) {
            .collapsibleHelp { font-size:13px !important; line-height:1.35 !important; padding:9px 11px !important; }
            .collapsibleBlock { border-radius:15px !important; margin:10px 0 !important; }
            .collapsibleBlock summary { min-height:46px; padding:11px 12px; font-size:15px; }
            .collapsibleBlockBody { padding:0 12px 12px; }
          }
        ` }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Expo ProffDok" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
                "Underentrepren\xF8r-tilgang \xB7 ",
                project.projectName || project.address || "Prosjekt"
              ] })
            ] }),
            isProjectLocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", disabled: true, children: "\u{1F512} Prosjekt l\xE5st" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: saveSharedProject, children: "Lagre bidrag" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", { children: limitedTabs.map(([id, l]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: tab === id ? "on" : "", onClick: () => goToTab(id), children: l }, id)) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Begrenset tilgang", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Du har tilgang til \xE5 se produkter, overflater, bilder, fag/utstyr og sjekklister p\xE5 dette prosjektet. Du kan legge inn bilder, sjekklistepunkter, fag/utstyr og kommentarer. Prosjektinformasjon er synlig. Prosjektering, rapport, tilbud/kontrakt og admin er skjult." }),
            isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "\u{1F512} Prosjektet er avsluttet og l\xE5st. Nye endringer kan ikke lagres." })
          ] }),
          tab === "prosjektinfo" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectInformationReadOnly, { project }),
          tab === "produkter" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: effectiveProductSections.map((s) => {
          const manualForSection = getManualProductsForSection(s.title);
          const visibleStandardItems = isProjectLocked ? (s.items || []).filter((i) => !!checked[i]) : s.items || [];
          const visibleManualItems = isProjectLocked ? manualForSection.filter((p) => hasValue(p?.name) || hasValue(p?.fdvUrl) || hasValue(p?.comment)) : manualForSection;
          const selectedInSection = (s.items || []).filter((i) => !!checked[i]).length;
          const manualInSection = manualForSection.filter((p) => hasValue(p?.name) || hasValue(p?.fdvUrl) || hasValue(p?.comment)).length;
          const hasUsedProducts = selectedInSection > 0 || manualInSection > 0;
          if (isProjectLocked && !hasUsedProducts) return null;
          const sectionOpen = isProjectLocked ? true : openProductSections?.[s.title] ?? hasUsedProducts;
          const totalVisible = visibleStandardItems.length + visibleManualItems.length;
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: s.title, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "secondary", onClick: () => setOpenProductSections((prev) => ({ ...prev || {}, [s.title]: !sectionOpen })), style: { width: "100%", justifyContent: "space-between", marginBottom: "12px" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                sectionOpen ? "▼ " : "▶ ",
                s.title
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: isProjectLocked ? `${selectedInSection + manualInSection} brukt` : selectedInSection + manualInSection > 0 ? `${selectedInSection + manualInSection} valgt` : "Åpne" })
            ] }),
            !sectionOpen && !isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: selectedInSection + manualInSection > 0 ? `${selectedInSection + manualInSection} produkt${selectedInSection + manualInSection === 1 ? "" : "er"} er valgt i denne kategorien.` : "Trykk for å åpne og velge produkter i denne kategorien." }),
            sectionOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: isProjectLocked ? "Prosjektet er arkivert/låst. Kun produkter som er brukt vises her." : "Kryss av produkter som er brukt. Når et produkt er valgt, kan du legge inn FDV-/databladlink og hvor produktet er brukt direkte på produktet." }),
              isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { color: "#991b1b", fontWeight: 700 }, children: "🔒 Produkter kan ikke legges til, fjernes eller endres før prosjektet låses opp." }),
              totalVisible === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen produkter valgt i denne kategorien ennå." }),
              visibleStandardItems.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "checklistList", children: visibleStandardItems.map((i) => {
                const doc = productDocs[i] || {};
                return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
                    !isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", style: { width: "auto", minHeight: "auto", padding: 0, margin: 0, flex: "0 0 auto" }, checked: !!checked[i], onChange: (e) => toggleProductChecked(i, e.target.checked) }),
                    isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { width: "18px", display: "inline-flex", justifyContent: "center", flex: "0 0 auto" }, children: "✓" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { margin: 0 }, children: i })
                  ] }),
                  checked[i] && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-/databladlink", value: doc.fdvUrl || "", disabled: isProjectLocked, onChange: (v) => updateProductDoc(i, { fdvUrl: v, fdvSource: "manual" }) }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Datablad", value: doc.databladUrl || "", disabled: isProjectLocked, onChange: (v) => updateProductDoc(i, { databladUrl: v, fdvSource: "manual" }) }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "DOP", value: doc.dopUrl || "", disabled: isProjectLocked, onChange: (v) => updateProductDoc(i, { dopUrl: v, fdvSource: "manual" }) }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "EPD", value: doc.epdUrl || "", disabled: isProjectLocked, onChange: (v) => updateProductDoc(i, { epdUrl: v, fdvSource: "manual" }) }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Sikkerhetsdatablad", value: doc.sikkerhetsdatabladUrl || "", disabled: isProjectLocked, onChange: (v) => updateProductDoc(i, { sikkerhetsdatabladUrl: v, fdvSource: "manual" }) }),
                      productSupportsColorChoice(i, s.title) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Fargekode", value: doc.colorCode || "", disabled: isProjectLocked, onChange: (v) => updateProductDoc(i, { colorCode: v }), options: getProductColorOptions(i, s.title) }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Hvor brukt / kommentar", value: doc.comment || "", disabled: isProjectLocked, onChange: (v) => updateProductDoc(i, { comment: v }) })
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductReportDocumentSelector, { doc, productName: i, updateProductDoc }),
                    doc.fdvSource === "product-master" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Dokumentlinker er hentet automatisk fra produktmaster." }),
                    doc.fdvSource === "admin-register" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "FDV-link er hentet automatisk fra admin FDV-register." })
                  ] })
                ] }, i);
              }) }),
              !isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: [
                  "Andre produkter i ",
                  s.title
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Bruk dette hvis produktet ikke ligger i standardlisten for denne kategorien." }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", onClick: () => addManualProduct(s.title), children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
                  " Legg til annet produkt"
                ] }),
                visibleManualItems.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "12px" }, children: "Ingen andre produkter lagt til i denne kategorien." }),
                visibleManualItems.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Produktnavn", value: p.name || "", disabled: isProjectLocked, onChange: (v) => updateManualProduct(s.title, p.id, { name: v }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-/databladlink", value: p.fdvUrl || "", disabled: isProjectLocked, onChange: (v) => updateManualProduct(s.title, p.id, { fdvUrl: v }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Hvor brukt / kommentar", value: p.comment || "", disabled: isProjectLocked, onChange: (v) => updateManualProduct(s.title, p.id, { comment: v }) })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", disabled: isProjectLocked, onClick: () => removeManualProduct(s.title, p.id), children: "Fjern produkt" })
                ] }, p.id))
              ] }),
              isProjectLocked && visibleManualItems.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: [
                  "Andre produkter i ",
                  s.title
                ] }),
                visibleManualItems.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "item", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: p.name || "Annet produkt" }),
                  hasValue(p.fdvUrl) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: p.fdvUrl }),
                  hasValue(p.comment) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p.comment })
                ] }, p.id))
              ] })
            ] })
          ] }, s.title);
        }) }),

        tab === "overflater" && renderOverflaterOgInnredning(),
          tab === "bilder" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Bildedokumentasjon", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Camera, {}), children: [
            photos.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen bilder er lagt til ennå. Start gjerne med Før arbeid, Underlag og Ferdig resultat for en ryddig rapport." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "item", style: { display: "flex", alignItems: "flex-start", gap: "10px", cursor: isProjectLocked ? "not-allowed" : "pointer" }, onClick: (e) => e.stopPropagation(), children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: !!project.checklistPhotosNote, disabled: isProjectLocked, onClick: (e) => e.stopPropagation(), onChange: (e) => {
                if (!canEditProject()) return;
                setProject({ ...project, checklistPhotosNote: e.target.checked });
              }, style: { width: "20px", height: "20px", marginTop: "2px" } }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Flere bilder ligger under sjekkpunkt i sjekkliste" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { className: "note", children: "Bruk denne når bildene hovedsakelig er dokumentert direkte på kontrollpunktene." })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cards imageUploadTiles", children: imageCats.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "tile", onDragOver: stopFileDragNavigation, onDragEnter: stopFileDragNavigation, onDrop: (e) => handlePhotoTileDrop(c, e), children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 16 }),
                " ",
                c
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: photos.filter((p) => p.cat === c).length > 0 ? `\u{1F4F7} ${photos.filter((p) => p.cat === c).length} bilder lagt til` : "Ta bilde, velg fra galleri eller dra bilde hit" }),
             /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", capture: "environment", multiple: true, disabled: isProjectLocked, onClick: (e) => e.stopPropagation(), onChange: (e) => addPhoto(c, e.target.files) })
            ] }, c)) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoGrid, { photos, setPhotos })
          ] }),
          tab === "installasjoner" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Fag, deler og utstyr", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", onClick: () => setInst((prev) => [...prev, { id: uid(), category: "R\xF8rlegger", name: "", qty: "", supplier: "", desc: "", fdvUrl: "", photos: [], by: user.name || "Underentrepren\xF8r", created: (/* @__PURE__ */ new Date()).toLocaleString("no-NO") }]), children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
              " Legg til post"
            ] }),
            inst.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Kategori", value: x.category, options: installCats, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, category: v } : i)) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn/produkt", value: x.name, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, name: v } : i)) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Antall/mengde", value: x.qty, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, qty: v } : i)) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Leverand\xF8r", value: x.supplier, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, supplier: v } : i)) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Beskrivelse/plassering", value: x.desc, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, desc: v } : i)) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-/databladlink", value: x.fdvUrl || "", onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, fdvUrl: v } : i)) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
                " Last opp bilder",
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", multiple: true, onChange: async (e) => {
                  const imgs = await uploadImages(e.target.files, "installasjoner");
                  setInst(inst.map((i) => i.id === x.id ? { ...i, photos: [...i.photos || [], ...imgs] } : i));
                } })
              ] }),
              (x.photos || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
                "\u{1F4F7} ",
                (x.photos || []).length,
                " bilder lagt til"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos", children: (x.photos || []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: p.url }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: p.name })
              ] }, p.id)) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                "Lagt inn av ",
                x.by,
                " \xB7 ",
                x.created
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setInst(inst.filter((i) => i.id !== x.id)), children: "Fjern" })
            ] }, x.id))
          ] }),
          tab === "sjekklister" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Sjekklister og vedlegg", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Velg status per kontrollpunkt. Kategoriene kan \xE5pnes/lukkes for mindre scrolling p\xE5 mobil. Ved Avvik kan du skrive kommentar og ta bilde." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              ChecklistEditor,
              {
                checklist,
                setChecklistValue,
                addChecklistPhoto,
                addFiles,
                files,
                setFiles,
                closedByName: user.name || authUser?.email || "Utførende",
                showOpenDeviationsOnly,
                setShowOpenDeviationsOnly,
                warranty,
                activeChecklistTemplate,
                onSaveChecklistNow: saveChecklistNow,
                checklistSaveStatus
              }
            )
          ] })
        ] })
      ] });
    }
    if (!authUser && !isReadOnly) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Expo ProffDok" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Logg inn for \xE5 se dine prosjekter" })
          ] })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Innlogging", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "E-post", value: authEmail, onChange: setAuthEmail, autoComplete: "email" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              Input,
              {
                label: "Passord",
                type: "password",
                value: authPassword,
                onChange: setAuthPassword,
                autoComplete: "current-password",
                onKeyDown: (e) => {
                  if (e.key === "Enter") signIn();
                }
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: signIn, children: "Logg inn" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: signUp, children: "Opprett bruker" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: resetPassword, children: "Glemt passord?" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "16px" }, children: "E-post huskes p\xE5 denne enheten. Passord lagres ikke i appen. Nettleseren kan likevel holde deg innlogget på en trygg måte." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Delingslenker fungerer fortsatt uten innlogging." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppInstallGuide, { compact: true })
        ] }) })
      ] });
    }
    if (!isReadOnly && (profileLoading || authUser && !profile)) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Expo ProffDok" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Laster brukerprofil..." })
          ] })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { title: "Laster", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Henter brukerprofil..." }) }) })
      ] });
    }
    if (!isReadOnly && authUser && profile && !profile.approved) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Expo ProffDok" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Venter p\xE5 godkjenning" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: signOut, children: "Logg ut" })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Konto venter p\xE5 godkjenning", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
            "Brukeren ",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: authUser.email }),
            " er registrert, men m\xE5 godkjennes av administrator f\xF8r appen kan brukes."
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Fyll gjerne inn firmaprofilen under. Administrator kan deretter godkjenne kontoen din." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Firmanavn", value: company.companyName, onChange: (v) => setCompany({ ...company, companyName: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Org.nr", value: company.orgNumber, onChange: (v) => setCompany({ ...company, orgNumber: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Adresse", value: company.address, onChange: (v) => setCompany({ ...company, address: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Telefon", value: company.phone, onChange: (v) => setCompany({ ...company, phone: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "E-post", value: company.email || authUser.email, onChange: (v) => setCompany({ ...company, email: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Hjemmeside", value: company.website || "", onChange: (v) => setCompany({ ...company, website: v }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: "16px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
              " Last opp firmalogo",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", onChange: (e) => uploadLogo(e.target.files?.[0]) })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: saveProfile, children: "Lagre firmaprofil" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: signOut, children: "Logg ut" })
          ] })
        ] }) })
      ] });
    }
    if (!isReadOnly && authUser && profile?.approved && !profile?.deactivated && termsLoading) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Expo ProffDok" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Kontrollerer brukervilkår" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: signOut, children: "Logg ut" })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { title: "Laster brukervilkår", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Kontrollerer om brukeren allerede har godkjent gjeldende vilkår." }) }) })
      ] });
    }
    if (!isReadOnly && authUser && profile?.approved && !profile?.deactivated && !termsAccepted) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Expo ProffDok" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Brukervilkår må godkjennes" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: signOut, children: "Logg ut" })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: EXPO_PROFFDOK_TERMS_TITLE, icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Før du kan bruke Expo ProffDok må du godkjenne brukervilkår og personvernpunkter. Dette gjelder også eksisterende brukere ved første innlogging etter innføring av nye vilkår." }),
          termsError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "item", style: { background: "#fef2f2", borderColor: "#fecaca" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { color: "#991b1b", fontWeight: 800 }, children: termsError }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "item", style: { maxHeight: "48vh", overflowY: "auto", background: "#f8fafc" }, children: expoProffDokTermsSections.map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginBottom: "14px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { style: { marginBottom: "6px" }, children: section.title }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { margin: 0 }, children: section.text })
          ] }, section.title)) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "item", style: { background: "#fff7ed", borderColor: "#fed7aa" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { style: { margin: 0, fontWeight: 800, color: "#9a3412" }, children: [
            "Viktig: Ferdige rapporter, FDV, garantibevis og prosjektdokumentasjon må lastes ned og lagres av brukeren på egen PC, server eller annet sikkert arkiv."
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { style: { display: "flex", gap: "10px", alignItems: "flex-start", marginTop: "16px", fontWeight: 800 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: termsReadConfirmed, onChange: (e) => setTermsReadConfirmed(e.target.checked), style: { marginTop: "4px" } }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Jeg har lest og forstått brukervilkår og personvernpunkter, inkludert at jeg selv må laste ned og lagre ferdige rapporter og dokumenter." })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: acceptCurrentTerms, disabled: termsAccepting || !termsReadConfirmed || !!termsError, children: termsAccepting ? "Lagrer godkjenning..." : "Godkjenn og fortsett" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: signOut, children: "Avbryt / logg ut" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "14px" }, children: "Godkjenningen lagres med bruker, e-post, versjon og tidspunkt. Ved ny versjon av vilkårene må brukeren godkjenne på nytt." })
        ] }) })
      ] });
    }
    if (isReadOnly) {
      const hasTilbudContent = hasValue(tilbud?.tillegg) || hasValue(tilbud?.fradrag) || hasValue(tilbud?.kommentar) || (tilbud?.files || []).length > 0;
      const customerPortalProductCount = [...selected || [], ...manualSelected || []].length;
      const customerPortalPhotoCount = (photos || []).filter((photo) => hasValue(photo?.url)).length;
      const customerPortalChecklistValues = Object.values(checklist || {}).flatMap((items) => Object.values(items || {}));
      const customerPortalChecklistAvvik = customerPortalChecklistValues.filter((value) => value?.status === "Avvik").length;
      const customerPortalChecklistClosedAvvik = customerPortalChecklistValues.filter((value) => value?.status === "Lukket avvik").length;
      const countChecklistTemplateStatus = (template = []) => {
        const total = (template || []).reduce((sum, group) => sum + (group.items || []).length, 0);
        const done = (template || []).reduce((sum, group) => {
          return sum + (group.items || []).filter((item) => hasValue(checklist?.[group.category]?.[item]?.status)).length;
        }, 0);
        return { total, done, missing: Math.max(0, total - done), complete: total > 0 && done >= total };
      };
      const customerPortalBaseChecklistStats = countChecklistTemplateStatus(getBaseChecklistTemplateForWarranty(warranty));
      const customerPortalSoproChecklistStats = countChecklistTemplateStatus(warranty?.enabled ? getSoproChecklistTemplate(warranty?.system) : []);
      const customerPortalActiveChecklistStats = countChecklistTemplateStatus(activeChecklistTemplate);
      const customerPortalChecklistTotal = customerPortalActiveChecklistStats.total;
      const customerPortalChecklistDone = customerPortalActiveChecklistStats.done;
      const customerPortalChecklistMissing = customerPortalActiveChecklistStats.missing;
      const customerPortalChecklistComplete = customerPortalActiveChecklistStats.complete;
      const customerPortalSoproChecklistTotal = customerPortalSoproChecklistStats.total;
      const customerPortalSoproChecklistDone = customerPortalSoproChecklistStats.done;
      const customerPortalSoproChecklistComplete = customerPortalSoproChecklistStats.complete;
      const customerPortalBaseChecklistText = customerPortalBaseChecklistStats.done ? `${customerPortalBaseChecklistStats.done} av ${customerPortalBaseChecklistStats.total} ordinære kontrollpunkter` : "Ordinære sjekklister ikke utfylt ennå";
      const customerPortalSoproChecklistText = customerPortalSoproChecklistTotal ? `Garantipunkter: ${customerPortalSoproChecklistDone} av ${customerPortalSoproChecklistTotal}` : "";
      const customerPortalChecklistStatusText = customerPortalChecklistDone ? `${customerPortalBaseChecklistText}${customerPortalSoproChecklistText ? ` · ${customerPortalSoproChecklistText}` : ""}${customerPortalChecklistAvvik ? ` · ${customerPortalChecklistAvvik} åpne avvik` : customerPortalChecklistMissing ? ` · ${customerPortalChecklistMissing} gjenstår` : ""}` : "Ikke utfylt ennå";
      const customerPortalAddress = [project.address, project.postnr, project.city].filter(Boolean).join(", ");
      const customerPortalProducts = [...selected || [], ...manualSelected || []];
      const customerPortalPhotos = (photos || []).filter((photo) => hasValue(photo?.url));
      const customerPortalWarrantyActive = !!warranty?.enabled;
      const customerPortalWarrantyIssued = !!warranty?.issued;
      const customerPortalWarrantySystem = warrantyReadiness?.selectedSystem;
      const customerPortalWarrantyTermsAccepted = !!warrantyReadiness?.termsAccepted;
      const customerPortalWarrantyStatusText = customerPortalWarrantyIssued ? `${getWarrantyYears(warranty)} års dokumentert tetthetsgaranti er utstedt${warranty?.guaranteeNumber ? ` – ${warranty.guaranteeNumber}` : ""}.` : customerPortalWarrantyActive ? "Garanti er aktivert, men ikke utstedt ennå." : "Garanti er ikke aktivert for dette prosjektet.";
      const customerPortalDocumentationReady = customerPortalProductCount > 0 || customerPortalPhotoCount > 0 || customerPortalChecklistDone > 0 || !!overtagelse?.enabled || customerPortalWarrantyActive;
      const customerPortalCompletionItems = [
        { label: "Prosjektinformasjon", done: hasValue(project.projectName) || hasValue(project.address) || hasValue(project.customer) },
        { label: "Produkter", done: customerPortalProductCount > 0 },
        { label: "Bilder", done: customerPortalPhotoCount > 0 },
        { label: "Sjekklister", done: customerPortalChecklistComplete && customerPortalChecklistAvvik === 0 },
        ...(customerPortalWarrantyActive && customerPortalSoproChecklistTotal ? [{ label: "Garantipunkter", done: customerPortalSoproChecklistComplete && customerPortalChecklistAvvik === 0 }] : []),
        { label: "Overtagelse", done: !!overtagelse?.enabled },
        { label: "Garanti", done: customerPortalWarrantyIssued || !customerPortalWarrantyActive }
      ];
      const customerPortalCompletionPercent = Math.round(customerPortalCompletionItems.filter((item) => item.done).length / customerPortalCompletionItems.length * 100);
      const customerPortalPrimaryStatus = customerPortalWarrantyIssued ? `${getWarrantyYears(warranty)} års garanti aktiv` : currentStatus.label;
      const customerPortalNextAction = customerPortalWarrantyIssued ? "Last ned komplett rapport eller se garantidokumentasjonen." : customerPortalWarrantyActive ? "Garanti er aktivert og oppdateres når alle krav er fullført." : "Se rapport, bilder og produktdokumentasjon.";
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Kundeportal" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
                "Her finner du komplett prosjektdokumentasjon, garanti, bilder, produkter og rapport",
                totalChatCount ? ` \xB7 ${totalChatCount} melding${totalChatCount === 1 ? "" : "er"}` : ""
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { onClick: downloadClickablePdfReport, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Download, { size: 18 }),
              " Last ned PDF"
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: customerTab === "oversikt" ? "on" : "", onClick: () => setCustomerTab("oversikt"), children: "Oversikt" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: customerTab === "rapport" ? "on" : "", onClick: () => setCustomerTab("rapport"), children: "Rapport" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: customerTab === "dokumentasjon" ? "on" : "", onClick: () => setCustomerTab("dokumentasjon"), children: "Dokumentasjon" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: customerTab === "garanti" ? "on" : "", onClick: () => setCustomerTab("garanti"), children: customerPortalWarrantyIssued ? "Garanti ✓" : "Garanti" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: customerTab === "bilder" ? "on" : "", onClick: () => setCustomerTab("bilder"), children: customerPortalPhotoCount ? `Bilder (${customerPortalPhotoCount})` : "Bilder" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: customerTab === "produkter" ? "on" : "", onClick: () => setCustomerTab("produkter"), children: customerPortalProductCount ? `Produkter (${customerPortalProductCount})` : "Produkter" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: customerTab === "prosjektinfo" ? "on" : "", onClick: () => setCustomerTab("prosjektinfo"), children: "Prosjektinformasjon" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { className: customerTab === "chat" ? "on" : "", onClick: () => setCustomerTab("chat"), children: [
              "Chat",
              unreadForCustomer > 0 ? ` (${unreadForCustomer} ulest)` : totalChatCount ? ` (${totalChatCount})` : ""
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: customerTab === "tilbud" ? "on" : "", onClick: () => setCustomerTab("tilbud"), children: "Tilbud/kontrakt" })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: project.projectName || project.address || "Prosjektoversikt", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "flex-start" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: 0 }, children: customerPortalAddress || project.customer || "Prosjektdokumentasjon" }),
                project.customer && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
                  "Kunde: ",
                  project.customer
                ] }),
                project.customerPhone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
                  "Tlf: ",
                  project.customerPhone
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: `statusBadge status-${currentStatus.tone}`, style: { display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "999px", fontWeight: 700, border: "1px solid #dbe7ec", ...statusStyle(currentStatus.tone) }, children: [
                currentStatus.icon,
                " ",
                currentStatus.label
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note customerChatFocusNote", children: "All kommunikasjon tas i prosjektchatten, slik at meldinger og bilder lagres på prosjektet." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Produkter dokumentert", value: customerPortalProductCount ? `${customerPortalProductCount} produkter` : "Ikke valgt ennå" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Bildedokumentasjon", value: customerPortalPhotoCount ? `${customerPortalPhotoCount} bilder` : "Ingen bilder ennå" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Sjekklister", value: customerPortalChecklistStatusText }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Chat", value: unreadForCustomer > 0 ? `${unreadForCustomer} ulest` : totalChatCount ? `${totalChatCount} meldinger` : "Ingen meldinger" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "customerPortalActions", style: { display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "14px" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => setCustomerTab("chat"), children: unreadForCustomer > 0 ? `Åpne chat (${unreadForCustomer} ulest)` : "Åpne prosjektchat" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setCustomerTab("rapport"), children: "Se rapport" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setCustomerTab("dokumentasjon"), children: "Se dokumentasjon" }),
              customerPortalWarrantyActive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setCustomerTab("garanti"), children: "Se garanti" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: downloadClickablePdfReport, children: "Last ned PDF" }),
              hasTilbudContent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setCustomerTab("tilbud"), children: "Tilbud/kontrakt" })
            ] })
          ] }),
          customerTab === "prosjektinfo" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectInformationReadOnly, { project }),
          customerTab === "oversikt" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Kundeportal dashboard", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Dette er kundens samlede oversikt over prosjektstatus, dokumentasjon, garanti og neste steg." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Prosjektstatus", value: customerPortalPrimaryStatus }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Dokumentasjon", value: `${customerPortalCompletionPercent}% komplett` }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Garanti", value: customerPortalWarrantyStatusText }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Neste steg", value: customerPortalNextAction })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { marginTop: "14px" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Dokumentasjonsstatus" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "8px", marginTop: "10px" }, children: customerPortalCompletionItems.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { border: "1px solid #dbe7ec", borderRadius: "12px", padding: "10px", background: item.done ? "#ecfdf5" : "#f8fafc", color: item.done ? "#065f46" : "#475569", fontWeight: 700 }, children: [
                item.done ? "✅ " : "○ ",
                item.label
              ] }, item.label)) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "customerPortalActions", style: { display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "14px" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: downloadClickablePdfReport, children: "Last ned komplett rapport" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setCustomerTab("garanti"), children: "Se garanti" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setCustomerTab("bilder"), children: "Se bilder" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setCustomerTab("produkter"), children: "Se produkter" })
            ] })
          ] }),
          customerTab === "dokumentasjon" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Dokumentasjon", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ClipboardCheck, {}), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: customerPortalDocumentationReady ? "Her vises samlet dokumentasjon som er registrert på prosjektet." : "Det er foreløpig lite dokumentasjon registrert på prosjektet." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Produkter", value: customerPortalProductCount ? `${customerPortalProductCount} produkter registrert` : "Ingen produkter registrert" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Bilder", value: customerPortalPhotoCount ? `${customerPortalPhotoCount} bilder lastet opp` : "Ingen bilder lastet opp" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Kontroller", value: customerPortalChecklistAvvik ? `${customerPortalChecklistAvvik} åpne avvik` : customerPortalChecklistDone ? `${customerPortalChecklistDone} kontrollpunkter utført` : "Ikke registrert" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Overtagelse", value: overtagelse?.enabled ? `Registrert ${overtagelse?.dato || ""}` : "Ikke registrert" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "customerPortalActions", style: { display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "14px" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => setCustomerTab("bilder"), children: "Åpne bilder" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setCustomerTab("produkter"), children: "Åpne produkter" }),
              customerPortalWarrantyActive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setCustomerTab("garanti"), children: "Åpne garanti" })
            ] })
          ] }),
          customerTab === "garanti" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Garanti", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: customerPortalWarrantyStatusText }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Garantistatus", value: customerPortalWarrantyIssued ? "Utstedt" : customerPortalWarrantyActive ? "Aktivert" : "Ikke aktivert" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Garantinummer", value: warranty?.guaranteeNumber || "Tildeles ved utstedelse" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "System", value: customerPortalWarrantySystem ? `${customerPortalWarrantySystem.product} – ${customerPortalWarrantySystem.sintefApproval}` : warranty?.sintefApproval || "Ikke valgt" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Garantivilkår", value: customerPortalWarrantyTermsAccepted ? "Akseptert ved signert overtagelse" : customerPortalWarrantyActive ? "Aksepteres ved overtagelse" : "Ikke aktuelt" })
            ] }),
            customerPortalWarrantySystem?.sintefUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: customerPortalWarrantySystem.sintefUrl, target: "_blank", rel: "noopener noreferrer", children: "Åpne SINTEF Teknisk Godkjenning" }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "customerPortalActions", style: { display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "14px" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { className: "upload", href: `/${warrantyTermsPdfFileName}`, target: "_blank", rel: "noopener noreferrer", children: "Last ned garantivilkår PDF" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: downloadClickablePdfReport, children: "Last ned komplett rapport" })
            ] })
          ] }),
          customerTab === "bilder" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Bilder", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Camera, {}), children: [
            customerPortalPhotos.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen bilder er delt på prosjektet ennå." }),
            customerPortalPhotos.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos", children: customerPortalPhotos.map((photo) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: photo.url, target: "_blank", rel: "noopener noreferrer", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: photo.url, alt: photo.comment || photo.cat || "Prosjektbilde" }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: photo.cat || "Prosjektbilde" }),
              (photo.comment || photo.name) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: photo.comment || photo.name })
            ] }, photo.id || photo.url)) })
          ] }),
          customerTab === "produkter" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Produkter og FDV", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Building2, {}), children: [
            customerPortalProducts.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen produkter er registrert på prosjektet ennå." }),
            customerPortalProducts.map((product) => {
              const productName = product.item || product.name || "Produkt";
              const docLinks = productReportDocumentOptions.filter((option) => shouldIncludeProductReportDoc(product, option));
              return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: productName }),
                product.section && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: product.section }),
                product.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: product.comment }),
                docLinks.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen dokumentlenker valgt for kunden." }),
                docLinks.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }, children: docLinks.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { className: "upload", href: normalizeExternalUrl(product?.[option.field]), target: "_blank", rel: "noopener noreferrer", children: option.label }, option.field)) })
              ] }, product.id || productName);
            })
          ] }),
          customerTab === "rapport" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomerReport, { company, name, project, selected, manualProducts: manualSelected, other, surf, bathroomEquipment, photos, inst, files, checklist, tilbud, overtagelse, projectLog }),
          customerTab === "chat" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: unreadForCustomer > 0 ? `Chat (${unreadForCustomer} ulest)` : totalChatCount ? `Chat (${totalChatCount})` : "Chat", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Send spørsmål, beskjeder og bilder her. Alt lagres på prosjektet." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Ny melding fra kunde", value: projectLog.draft || "", onChange: (v) => setProjectLog((prev) => ({ ...prev, draft: v })) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload", style: { marginBottom: 0 }, children: [
                "\u{1F4F7} Last opp bilde",
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "input",
                  {
                    id: "customer-chat-image-input",
                    type: "file",
                    accept: "image/*",
                    onChange: (e) => setCustomerChatUploadFile(e.target.files?.[0] || null)
                  }
                ),
                customerChatUploadFile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { style: { display: "block", marginTop: "6px" }, children: [
                  "Valgt: ",
                  customerChatUploadFile.name
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: saveCustomerChatMessage, children: "Send melding" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => refreshProjectFromCloud(false), children: "Oppdater chat" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", disabled: unreadForCustomer === 0, onClick: () => markChatAsRead("customer"), children: "Marker alle som lest" })
            ] }),
            (projectLog.messages || []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "16px" }, children: "Ingen meldinger enn\xE5." }),
            (projectLog.messages || []).slice().reverse().map((m) => {
              const isUnread = m.role !== "kunde" && (!lastReadByCustomer || (m.created || "") > lastReadByCustomer);
              return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", onClick: () => isUnread && markChatAsRead("customer"), style: isUnread ? { borderColor: "#fecaca", background: "#fff7f7", cursor: "pointer" } : void 0, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                  m.by || "Ukjent",
                  " ",
                  m.role === "kunde" ? "\xB7 Kunde" : "\xB7 Utf\xF8rende"
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                  m.created ? new Date(m.created).toLocaleString("no-NO") : "",
                  m.role === "kunde" ? !lastReadByAdmin || (m.created || "") > lastReadByAdmin ? " \xB7 Ulest for admin" : " \xB7 Lest av admin" : isUnread ? " \xB7 Ulest for kunde" : " \xB7 Lest av kunde"
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: m.text }),
                m.imageUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: "10px" }, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: m.imageUrl, target: "_blank", rel: "noreferrer", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "img",
                    {
                      src: m.imageUrl,
                      alt: m.imageName || "Chat bilde",
                      style: { maxWidth: "280px", width: "100%", borderRadius: "12px", border: "1px solid #dbe7ec" }
                    }
                  ) }),
                  m.imageName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { style: { display: "block", marginTop: "6px" }, children: m.imageName })
                ] })
              ] }, m.id);
            })
          ] }),
          customerTab === "tilbud" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Tilbud / kontrakt", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}), children: [
            !hasTilbudContent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen tilbud eller kontrakt er delt p\xE5 dette prosjektet enn\xE5." }),
            hasTilbudContent && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Tillegg", value: tilbud.tillegg }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Fradrag", value: tilbud.fradrag }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Avtaleendringer / kommentar", value: tilbud.kommentar })
              ] }),
              (tilbud.files || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Vedlegg" }),
                (tilbud.files || []).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: f.url, target: "_blank", rel: "noopener noreferrer", children: f.name }) }, f.id))
              ] })
            ] })
          ] })
        ] })
      ] });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { onClick: openImageLightboxFromClick, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `

      .pdfSafeLink a { font-weight: 700; }
      .pdfSafeUrl { display:block; color:#334155; font-size:10px; line-height:1.25; overflow-wrap:anywhere; word-break:break-word; margin-top:2px; }
      .collapsibleHelp { font-weight:800; background:#f8fafc; border:1px solid #dbe7ec; border-radius:14px; padding:10px 12px; }
      .collapsibleBlock { border:1px solid #dbe7ec; border-radius:16px; background:#ffffff; margin:12px 0; overflow:hidden; }
      .collapsibleBlock summary { list-style:none; cursor:pointer; padding:13px 14px; display:flex; align-items:center; justify-content:space-between; gap:10px; font-weight:900; color:#0f172a; background:#f8fafc; border-bottom:1px solid transparent; user-select:none; transition:background .15s ease, border-color .15s ease, box-shadow .15s ease; }
      .collapsibleBlock summary:hover { background:#eef7fa; box-shadow:inset 0 0 0 1px rgba(8,213,216,.18); }
      .collapsibleBlock[open] summary { border-bottom-color:#dbe7ec; background:#f1f8fb; }
      .collapsibleBlock summary::-webkit-details-marker { display:none; }
      .collapsibleBlock summary:after { content:'▼'; font-size:13px; color:#0f172a; transition:transform .15s ease; background:#ffffff; border:1px solid #cbd5e1; border-radius:999px; width:24px; height:24px; display:inline-flex; align-items:center; justify-content:center; flex:0 0 24px; }
      .collapsibleBlock:not([open]) summary:after { transform:rotate(-90deg); }
      .collapsibleBlockBody { padding:0 14px 14px; }
      .mobileChatFab { display:none; }
      @media screen and (max-width:700px) {
        .collapsibleHelp { font-size:13px !important; line-height:1.35 !important; padding:9px 11px !important; }
        .collapsibleBlock { border-radius:15px !important; margin:10px 0 !important; }
        .collapsibleBlock summary { min-height:46px; padding:11px 12px; font-size:15px; }
        .collapsibleBlockBody { padding:0 12px 12px; }
        .mobileChatFab { display:inline-flex !important; position:fixed; right:14px; bottom:calc(18px + env(safe-area-inset-bottom)); z-index:90; align-items:center; justify-content:center; gap:7px; min-height:50px !important; padding:12px 16px !important; border-radius:999px !important; background:#082f3a !important; color:#fff !important; border:1px solid #082f3a !important; box-shadow:0 14px 34px rgba(15,23,42,.28); font-weight:900 !important; }
        .mobileChatFab.hasUnread { background:#b91c1c !important; border-color:#b91c1c !important; }
      }
      @media print {
        .pdfSafeLink a { color:#0645ad !important; text-decoration:underline !important; }
        .pdfSafeUrl { display:block !important; color:#334155 !important; font-size:9px !important; }
      }

      .mobileNav { display: none; }
      .mobileNavPanel { background:#ffffff; border:1px solid #dbe7ec; border-radius:18px; padding:12px; box-shadow:0 10px 24px rgba(15,23,42,0.08); }
      .mobileNavTop { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:10px; }
      .mobileNavTitle { display:flex; flex-direction:column; gap:2px; min-width:0; }
      .mobileNavTitle b { font-size:14px; color:#0f172a; }
      .mobileNavTitle small { color:#64748b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .mobileNavSelectWrap { position:relative; }
      .mobileNav select { width:100%; min-height:52px; border-radius:14px; font-size:17px; font-weight:800; padding:12px 44px 12px 14px; background:#f8fafc; border:1px solid #cbd5e1; color:#0f172a; appearance:auto; }
      .mobileNavQuick { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px; }
      .mobileNavQuick button { width:100%; min-height:44px; justify-content:center; }
      .mobileNavStatus { display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
      .mobileNavPill { display:inline-flex; align-items:center; gap:6px; padding:6px 9px; border-radius:999px; background:#f8fafc; border:1px solid #dbe7ec; font-size:12px; font-weight:800; color:#334155; }
      .mobileSectionChips { display:none; }
      .projectListHeaderCards { margin-bottom:16px; }
      .projectListToolbar { display:flex; gap:12px; flex-wrap:wrap; margin:14px 0 16px; }
      .projectListCard { position:relative; overflow:hidden; }
      .projectListCardTop { display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:flex-start; }
      .projectListBadges { display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end; }
      .projectListMetaCards { margin-top:12px; }
      .projectListActions { display:flex; gap:12px; flex-wrap:wrap; margin-top:12px; }
      .projectImageStrip { display:flex; gap:8px; overflow-x:auto; padding:8px 2px 4px; margin-top:10px; scrollbar-width:thin; }
      .projectImageThumb { flex:0 0 76px; width:76px; }
      .projectImageThumb img { width:76px; height:58px; object-fit:cover; border-radius:12px; border:1px solid #dbe7ec; background:#f8fafc; display:block; }
      .projectImageThumb small { display:block; margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:11px; }
      .projectImageCounts { display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
      .projectMiniBadge { display:inline-flex; align-items:center; gap:5px; padding:5px 8px; border-radius:999px; border:1px solid #dbe7ec; background:#f8fafc; font-size:12px; font-weight:700; }
      .guideGrid { display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:10px; margin-top:12px; }
      .guideCard { border:1px solid #dbe7ec; background:#f8fafc; border-radius:16px; padding:12px; }
      .guideCard b { display:block; font-size:18px; color:#0f172a; margin-bottom:3px; }
      .guideCard span { display:block; color:#64748b; font-size:13px; line-height:1.35; }
      .guideSteps { display:grid; gap:8px; margin-top:12px; }
      .guideStep { display:flex; align-items:center; justify-content:space-between; gap:10px; border:1px solid #dbe7ec; background:#ffffff; border-radius:14px; padding:10px; }
      .guideStepText { min-width:0; }
      .guideStepText b { display:block; font-size:14px; line-height:1.25; color:#0f172a; }
      .guideStepText small { display:block; color:#64748b; margin-top:2px; }
      .guideStep button { flex:0 0 auto; }

      @media screen and (max-width: 700px) {
        .guideGrid { grid-template-columns:1fr 1fr !important; gap:8px !important; }
        .guideCard { padding:10px !important; border-radius:14px !important; }
        .guideCard b { font-size:16px !important; }
        .guideCard span { font-size:12.5px !important; }
        .guideStep { display:grid !important; grid-template-columns:1fr !important; gap:8px !important; padding:10px !important; }
        .guideStep button { width:100% !important; justify-content:center !important; }
      }

      .imageLightboxOverlay { position:fixed; inset:0; z-index:9999; background:rgba(2, 6, 23, 0.86); display:flex; align-items:center; justify-content:center; padding:18px; }
      .imageLightboxInner { width:min(1100px, 100%); max-height:92vh; display:grid; gap:12px; }
      .imageLightboxTop { display:flex; justify-content:flex-end; }
      .imageLightboxClose { background:#ffffff; color:#0f172a; border:1px solid rgba(255,255,255,0.6); box-shadow:none; }
      .imageLightboxImage { width:100%; max-height:82vh; object-fit:contain; border-radius:16px; background:#ffffff; }
      .photo img, .projectImageThumb img { cursor: zoom-in; }
      @media screen and (max-width: 700px) {
        header nav { display: none !important; }
        .mobileNav { display: block !important; }
        .mobileNav { padding:0 12px 12px !important; }
        .mobileNavPanel { border-radius:16px; padding:10px; }
        .mobileNavTop { margin-bottom:8px; }
        .mobileNav select { min-height:54px; font-size:16px; }
        .projectListHeaderCards { display:grid !important; grid-template-columns:1fr 1fr; gap:8px; }
        .projectListHeaderCards .tile { min-height:auto; padding:10px !important; }
        .projectListHeaderCards .tile b { font-size:20px; }
        .projectListToolbar { position:sticky; top:0; z-index:5; background:#ffffff; border:1px solid #dbe7ec; border-radius:16px; padding:10px; box-shadow:0 8px 22px rgba(15,23,42,0.08); }
        .projectListToolbar button { flex:1 1 100%; width:100%; justify-content:center; }
        .projectListCard { padding:14px !important; border-radius:18px; }
        .projectListCardTop { display:block; }
        .projectListBadges { justify-content:flex-start; margin-top:10px; }
        .projectListMetaCards { display:grid !important; grid-template-columns:1fr; gap:8px; }
        .projectListMetaCards .tile { padding:10px !important; min-height:auto; }
        .projectListActions { display:grid !important; grid-template-columns:1fr; gap:8px; }
        .projectListActions button { width:100%; justify-content:center; }
        .projectImageThumb { flex-basis:84px; width:84px; }
        .projectImageThumb img { width:84px; height:64px; }
      }


      /* Mobile-first redesign v1 */
      .bottomAppNav { display:none; }
      @media screen and (max-width: 700px) {
        body { -webkit-text-size-adjust:100%; }
        header { position:sticky; top:0; z-index:20; background:rgba(255,255,255,0.96); backdrop-filter:blur(14px); border-bottom:1px solid #e2edf2; }
        header .head { padding:8px 12px !important; gap:8px !important; align-items:center !important; }
        header .head > div:first-child { width:122px !important; height:42px !important; flex:0 0 122px !important; }
        header .head h1 { font-size:18px !important; line-height:1.1 !important; margin:0 !important; }
        header .head p { font-size:12px !important; margin:2px 0 0 !important; max-width:170px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        header .head > button { display:none !important; }
        header .head > button:nth-of-type(2), header .head > button:nth-of-type(3) { display:inline-flex !important; min-height:34px !important; padding:7px 10px !important; font-size:12px !important; border-radius:12px !important; }
        main { padding:10px 10px calc(150px + env(safe-area-inset-bottom)) !important; }
        section { padding:14px !important; border-radius:18px !important; margin:10px auto !important; }
        section h2 { font-size:19px !important; margin-bottom:10px !important; gap:6px !important; }
        .mobileNav { padding:0 10px 8px !important; }
        .mobileNavPanel { box-shadow:none !important; border-radius:14px !important; padding:9px !important; }
        .mobileNavTop { display:flex !important; margin-bottom:6px !important; }
        .mobileNavTitle b { font-size:12px !important; letter-spacing:.02em; text-transform:uppercase; color:#64748b !important; }
        .mobileNavTitle small { font-size:13px !important; color:#0f172a !important; font-weight:800; }
        .mobileNavStatus, .mobileNavQuick { display:none !important; }
        .mobileNav select { min-height:44px !important; font-size:17px !important; border-radius:13px !important; padding:9px 12px !important; background:#f8fafc !important; }
        .mobileSectionChips { display:grid !important; grid-template-columns:repeat(4, minmax(0,1fr)); gap:6px; margin-top:8px; }
        .mobileSectionChips button { min-height:36px !important; padding:6px 5px !important; border-radius:12px !important; font-size:12px !important; font-weight:900 !important; }
        .bottomAppNav { position:fixed; left:12px; right:12px; bottom:calc(10px + env(safe-area-inset-bottom)); z-index:50; display:grid; grid-template-columns:repeat(5, 1fr); gap:5px; padding:7px; border:1px solid #dbe7ec; border-radius:20px; background:rgba(255,255,255,0.98); box-shadow:0 12px 34px rgba(15,23,42,0.16); backdrop-filter:blur(14px); }
        .bottomAppNav button { min-height:44px !important; padding:5px 3px !important; border-radius:14px !important; font-size:12px !important; font-weight:900 !important; display:flex !important; flex-direction:column !important; gap:1px !important; align-items:center !important; justify-content:center !important; line-height:1.05 !important; }
        .bottomAppNav button span:first-child { font-size:16px; line-height:1; }
        .bottomAppNav button.active { background:#082f3a !important; color:#fff !important; border-color:#082f3a !important; }
        .grid { grid-template-columns:1fr !important; gap:10px !important; }
        label span { font-size:12px !important; }
        input, textarea, select { min-height:42px !important; font-size:16px !important; border-radius:12px !important; }
        textarea { min-height:86px !important; }
        button, .upload { min-height:42px !important; border-radius:14px !important; padding:9px 12px !important; font-size:14px !important; }
        .cards { gap:8px !important; }
        .tile { padding:10px !important; border-radius:16px !important; min-height:auto !important; }
        .tile b { font-size:16px !important; }
        .tile span { font-size:12px !important; }
        .projectListHeaderCards { display:grid !important; grid-template-columns:repeat(4, minmax(0,1fr)) !important; gap:6px !important; overflow:visible !important; }
        .projectListHeaderCards .tile { padding:8px 6px !important; text-align:center !important; }
        .projectListHeaderCards .tile b { font-size:18px !important; }
        .projectListHeaderCards .tile span { font-size:10px !important; line-height:1.1 !important; }
        .projectListToolbar { position:static !important; display:grid !important; grid-template-columns:1fr 1fr 1fr !important; gap:6px !important; padding:0 !important; border:0 !important; box-shadow:none !important; background:transparent !important; margin:8px 0 10px !important; }
        .projectListToolbar button { width:100% !important; min-height:38px !important; padding:7px 6px !important; font-size:12px !important; border-radius:12px !important; }
        .projectListCard { padding:12px !important; border-radius:20px !important; margin:10px 0 !important; }
        .projectListCardTop { display:block !important; }
        .projectListCardTop b[style] { font-size:17px !important; line-height:1.15 !important; display:block; }
        .projectListCardTop p { font-size:14px !important; margin:4px 0 0 !important; }
        .projectListCardTop small { font-size:12px !important; }
        .projectListBadges { justify-content:flex-start !important; gap:6px !important; margin-top:8px !important; }
        .statusBadge, .projectMiniBadge { font-size:11px !important; padding:4px 7px !important; }
        .projectListMetaCards { display:grid !important; grid-template-columns:1fr 1fr !important; gap:6px !important; margin-top:8px !important; }
        .projectListMetaCards .tile { padding:8px !important; }
        .projectListMetaCards .tile:nth-child(3) { display:none !important; }
        .projectImageCounts { gap:5px !important; margin-top:8px !important; }
        .projectImageStrip { gap:6px !important; padding:6px 0 0 !important; margin-top:4px !important; }
        .projectImageThumb { flex:0 0 58px !important; width:58px !important; }
        .projectImageThumb img { width:58px !important; height:46px !important; border-radius:10px !important; }
        .projectImageThumb small { font-size:9px !important; }
        .projectImageThumb[style] { height:46px !important; min-width:58px !important; font-size:12px !important; }
        .projectListActions { display:grid !important; grid-template-columns:1fr 1fr 1fr !important; gap:6px !important; margin-top:10px !important; }
        .projectListActions button { width:100% !important; min-height:38px !important; padding:7px 6px !important; font-size:12px !important; border-radius:12px !important; }
        .note { font-size:13px !important; line-height:1.35 !important; }
        .photos { grid-template-columns:repeat(2, minmax(0,1fr)) !important; gap:8px !important; }
        .photo { border-radius:14px !important; padding:8px !important; }
        .photo img { border-radius:12px !important; }
        body:has(.bottomAppNav) > div { padding-bottom:0; }

        /* Mobile readability tuning v2 */
        section h2 { font-size:21px !important; line-height:1.22 !important; }
        h3 { font-size:18px !important; line-height:1.25 !important; }
        p, small, .out p, .item p { line-height:1.45 !important; }
        .note { font-size:14px !important; line-height:1.48 !important; }
        label span { font-size:13px !important; line-height:1.3 !important; }
        input, textarea, select { font-size:17px !important; line-height:1.35 !important; }
        button, .upload { font-size:15px !important; font-weight:800 !important; line-height:1.2 !important; }
        .bottomAppNav button { font-size:12px !important; }
        .bottomAppNav button span:first-child { font-size:20px !important; }
        .projectListCardTop b[style] { font-size:19px !important; line-height:1.24 !important; }
        .projectListCardTop p { font-size:15px !important; line-height:1.35 !important; }
        .projectListCardTop small { font-size:13px !important; line-height:1.35 !important; }
        .statusBadge, .projectMiniBadge { font-size:12.5px !important; line-height:1.15 !important; padding:6px 9px !important; }
        .projectListMetaCards .tile b { font-size:13px !important; line-height:1.2 !important; }
        .projectListMetaCards .tile span { font-size:12.5px !important; line-height:1.28 !important; }
        .projectListHeaderCards .tile b { font-size:20px !important; }
        .projectListHeaderCards .tile span { font-size:11.5px !important; line-height:1.18 !important; }
        .projectListToolbar button, .projectListActions button { font-size:13.5px !important; min-height:42px !important; }
        .tile b { font-size:17px !important; line-height:1.2 !important; }
        .tile span { font-size:13px !important; line-height:1.3 !important; }
        .check span { font-size:15px !important; }
        .checklistHeader b { font-size:15.5px !important; line-height:1.3 !important; }
        .checklistStatusButtons button { font-size:13px !important; }
        .photo b { font-size:14px !important; line-height:1.25 !important; }
        .photo small { font-size:12px !important; line-height:1.25 !important; }
        .projectImageThumb small { font-size:10.5px !important; line-height:1.15 !important; }
      }


      /* Mobile navigation cleanup v2: no fixed chrome on small screens */
      @media screen and (max-width: 700px) {
        header { position:static !important; top:auto !important; z-index:auto !important; backdrop-filter:none !important; border-bottom:0 !important; }
        main { padding:10px 10px 28px !important; }
        .bottomAppNav { display:none !important; }
        body:has(.bottomAppNav) > div { padding-bottom:0 !important; }
        .mobileNav { padding:0 10px 10px !important; }
        .mobileNavPanel { position:static !important; border-radius:16px !important; padding:10px !important; margin-bottom:8px !important; }
        .mobileNavTop { display:flex !important; align-items:flex-start !important; margin-bottom:8px !important; }
        .mobileNavTitle b { font-size:13px !important; letter-spacing:.04em !important; text-transform:uppercase !important; color:#64748b !important; }
        .mobileNavTitle small { font-size:18px !important; font-weight:900 !important; color:#0f172a !important; }
        .mobileNav select { min-height:46px !important; font-size:18px !important; font-weight:900 !important; }
        .mobileNavQuick { display:none !important; }
        .mobileNavStatus { display:grid !important; grid-template-columns:repeat(4, minmax(0, 1fr)) !important; gap:6px !important; margin-top:8px !important; }
        .mobileNavStatus .mobileNavPill { justify-content:center !important; min-height:38px !important; font-size:13px !important; padding:7px 6px !important; border-radius:14px !important; }
        .mobileNavStatus .mobileNavPill:nth-child(n+5) { display:none !important; }
        section { scroll-margin-top:12px !important; }
        .projectListToolbar { position:static !important; }
      }


      /* Mobile project chooser v5 - desktop-safe */
      .mobileProjectChooser,
      .mobileCurrentProjectBar { display:none !important; }
      .desktopOnlyWhenNoProject { display:block !important; }

      .desktopNoProjectWelcome { max-width:1180px; margin:28px auto; }
      .desktopNoProjectHero { background:linear-gradient(135deg,#12384a,#1f4e6a); border-radius:28px; padding:34px; color:#fff; }
      .desktopNoProjectHero h2 { color:#fff; font-size:34px; margin:10px 0 8px; }
      .desktopNoProjectHero .note { color:rgba(255,255,255,.82); font-size:16px; max-width:720px; }
      .desktopNoProjectHero .secondary { background:#fff; }
      @media screen and (min-width: 701px) {
        .mobileProjectChooser,
        .mobileCurrentProjectBar { display:none !important; }
        .desktopOnlyWhenNoProject { display:block !important; }
      }
      @media screen and (max-width: 700px) {
        .mobileProjectChooser { display:block !important; }
        .mobileCurrentProjectBar { display:block !important; }
        .desktopOnlyWhenNoProject { display:none !important; }
        .mobileProjectChooser { padding:16px !important; border-radius:22px !important; background:#fff !important; border:1px solid #dbe7ec !important; box-shadow:0 12px 30px rgba(15,23,42,0.08) !important; }
        .mobileProjectChooser h2 { font-size:24px !important; line-height:1.15 !important; margin-bottom:8px !important; }
        .mobileProjectChooserIntro { color:#64748b; font-size:15px; line-height:1.45; margin:0 0 14px; }
        .mobileProjectChooserActions { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin:12px 0; }
        .mobileProjectChooserActions button { width:100% !important; min-height:46px !important; justify-content:center !important; }
        .mobileProjectList { display:grid; gap:10px; margin-top:14px; }
        .mobileProjectPickCard { border:1px solid #dbe7ec; border-radius:18px; padding:12px; background:#f8fafc; }
        .mobileProjectPickCardTop { display:flex; justify-content:space-between; gap:8px; align-items:flex-start; }
        .mobileProjectPickCard b { font-size:17px; line-height:1.25; color:#0f172a; }
        .mobileProjectPickCard small { display:block; color:#64748b; font-size:13px; line-height:1.35; margin-top:3px; }
        .mobileProjectPickStatus { white-space:nowrap; font-size:12px; font-weight:900; border:1px solid #dbe7ec; border-radius:999px; padding:5px 8px; background:#fff; }
        .mobileProjectPickActions { display:grid !important; grid-template-columns:1fr 1fr !important; gap:6px; margin-top:10px; }
        .mobileProjectPickActions button { min-height:42px !important; padding:7px 6px !important; font-size:13px !important; border-radius:13px !important; width:100% !important; }
        .mobileCurrentProjectBar { margin:0 10px 10px !important; padding:12px !important; border:1px solid #dbe7ec !important; background:#ffffff !important; border-radius:18px !important; }
        .mobileCurrentProjectBar b { display:block; font-size:13px; text-transform:uppercase; color:#64748b; letter-spacing:.04em; margin-bottom:4px; }
        .mobileCurrentProjectBar span { display:block; font-size:17px; font-weight:900; color:#0f172a; line-height:1.25; }
        .mobileCurrentProjectActions { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px; }
        .mobileCurrentProjectActions button { min-height:44px !important; font-size:14px !important; }
      }



      /* FASE 10 Deploy 1.1: proff mobil åpningsside */
      @media screen and (max-width: 700px) {
        .mobileProjectChooser {
          background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%) !important;
          border: 1px solid #dbe7ec !important;
          box-shadow: 0 14px 36px rgba(15, 23, 42, 0.08) !important;
        }
        .mobileHomeHero {
          border-radius: 22px;
          padding: 18px;
          background: linear-gradient(135deg, #082f3a 0%, #0c4a6e 100%);
          color: #ffffff;
          box-shadow: 0 18px 42px rgba(8, 47, 58, 0.18);
        }
        .mobileHomeEyebrow {
          display: inline-flex;
          align-items: center;
          padding: 5px 9px;
          border-radius: 999px;
          background: rgba(255,255,255,0.14);
          border: 1px solid rgba(255,255,255,0.2);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .04em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .mobileHomeHero h2 {
          color: #ffffff !important;
          margin: 0 0 8px !important;
          font-size: 25px !important;
          line-height: 1.08 !important;
        }
        .mobileHomeHero p {
          color: rgba(255,255,255,0.86) !important;
          margin: 0 0 14px !important;
          font-size: 14px !important;
          line-height: 1.45 !important;
        }
        .mobileHomeActions {
          display: grid;
          grid-template-columns: 1.4fr .8fr;
          gap: 8px;
        }
        .mobileHomeActions button {
          width: 100% !important;
          min-height: 46px !important;
        }
        .mobileHomeStats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 7px;
          margin-top: 12px;
        }
        .mobileHomeStatCard {
          background: #ffffff !important;
          color: #0f172a !important;
          border: 1px solid #dbe7ec !important;
          border-radius: 16px !important;
          box-shadow: none !important;
          padding: 9px 5px !important;
          min-height: 64px !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 2px !important;
        }
        .mobileHomeStatCard b {
          font-size: 19px !important;
          line-height: 1 !important;
          color: #082f3a !important;
        }
        .mobileHomeStatCard span {
          font-size: 10.5px !important;
          line-height: 1.1 !important;
          color: #64748b !important;
          font-weight: 900 !important;
        }
        .mobileHomeSearchCard {
          margin-top: 12px;
          border: 1px solid #dbe7ec;
          background: #ffffff;
          border-radius: 18px;
          padding: 12px;
        }
        .mobileHomeSearchCard label {
          margin-bottom: 0 !important;
        }
        .mobileHomeFilterRow {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 7px;
          margin-top: 10px;
        }
        .mobileHomeFilterRow button {
          min-height: 38px !important;
          padding: 7px 5px !important;
          font-size: 13px !important;
        }
        .mobileProjectPickMeta {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 10px;
        }
        .mobileProjectPickMeta span {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 5px 7px;
          border-radius: 999px;
          border: 1px solid #dbe7ec;
          background: #ffffff;
          color: #334155;
          font-size: 11px;
          font-weight: 900;
        }
        .mobileProjectPickMeta .mobileProjectPickAlert {
          border-color: #fecaca;
          background: #fef2f2;
          color: #991b1b;
        }
        .mobileProjectPickActions {
          grid-template-columns: 1.2fr 1fr 1fr 1fr !important;
        }
        .mobileProjectPickActions button {
          font-size: 12.5px !important;
          min-height: 40px !important;
        }
      }


      /* Mobile UX fase 4: feltapp-sjekklister */
      .checklistSummaryCard {
        border:1px solid #dbe7ec;
        background:#f8fafc;
        border-radius:18px;
        padding:14px;
        margin:12px 0 16px;
      }
      .checklistSummaryCard b { font-size:18px; color:#0f172a; }
      .checklistSummaryCard p { margin:4px 0 10px; color:#64748b; }
      .checklistProgress { height:10px; border-radius:999px; background:#e2e8f0; overflow:hidden; margin:10px 0; }
      .checklistProgress span { display:block; height:100%; border-radius:999px; background:#082f3a; transition:width .2s ease; }
      .checklistSummaryBadges { display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
      .checklistSummaryBadges span { display:inline-flex; align-items:center; gap:4px; padding:6px 9px; border-radius:999px; border:1px solid #dbe7ec; background:#fff; font-size:13px; font-weight:800; color:#334155; }
      .checklistSummaryActions { display:flex; gap:8px; flex-wrap:wrap; margin-top:12px; }
      .checklistAccordion { display:grid; gap:12px; }
      .checklistGroup { padding:0 !important; overflow:hidden; border-radius:18px !important; }
      .checklistGroupHeader { width:100%; border:0 !important; background:#ffffff !important; color:#0f172a !important; box-shadow:none !important; display:grid !important; grid-template-columns:auto minmax(0,1fr) auto !important; align-items:center !important; gap:10px !important; padding:14px !important; text-align:left !important; min-height:64px !important; cursor:pointer; }
      .checklistGroupCaret { display:inline-flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:999px; background:#f8fafc; border:1px solid #dbe7ec; font-size:18px; font-weight:900; }
      .checklistGroupTitle { display:flex; flex-direction:column; gap:3px; min-width:0; }
      .checklistGroupTitle b { font-size:18px; line-height:1.2; }
      .checklistGroupTitle small { color:#64748b; font-weight:700; }
      .checklistGroupBadge { white-space:nowrap; border:1px solid #dbe7ec; border-radius:999px; padding:6px 9px; font-size:12px; font-weight:900; background:#f8fafc; }
      .checklistGroupBadge-done { background:#ecfdf5; color:#065f46; border-color:#bbf7d0; }
      .checklistGroupBadge-avvik { background:#fef2f2; color:#991b1b; border-color:#fecaca; }
      .checklistGroupBadge-progress { background:#fffbeb; color:#92400e; border-color:#fde68a; }
      .checklistGroupBadge-missing { background:#f8fafc; color:#475569; }
      .checklistGroupBody { padding:0 14px 14px; display:grid; gap:10px; }
      .checklistPoint { border:1px solid #dbe7ec; background:#fff; border-radius:16px; padding:12px; }
      .checklistPoint-avvik { border-color:#fecaca; background:#fff7f7; }
      .checklistPoint-done { border-color:#bbf7d0; }
      .checklistPointTitle { display:flex; flex-direction:column; gap:3px; min-width:0; }
      .checklistPointTitle small { color:#64748b; font-weight:700; }
      .checklistWarrantyPoint { border-color:#bfdbfe; background:#eff6ff; }
      .checklistWarrantyPoint.checklistPoint-done { border-color:#93c5fd; background:#eff6ff; }
      .warrantyPointBadge { display:inline-flex; align-items:center; width:max-content; gap:5px; padding:4px 8px; border-radius:999px; border:1px solid #bfdbfe; background:#dbeafe; color:#1e3a8a; font-size:11px; font-weight:900; letter-spacing:.02em; text-transform:uppercase; }
      .warrantyProgressCard { border-color:#bfdbfe !important; background:#eff6ff !important; }
      .warrantyProgress span { background:#1d4ed8 !important; }
      .warrantyMissingList { margin-top:12px; }
      .warrantyMissingButtons { display:grid; gap:8px; margin-top:8px; }
      .warrantyJumpButton { justify-content:flex-start !important; text-align:left !important; white-space:normal !important; }
      .checklistPointFocus { outline:4px solid #facc15; box-shadow:0 0 0 6px rgba(250,204,21,0.25); transition:outline .2s ease, box-shadow .2s ease; }

      @media screen and (max-width:700px) {
        .checklistSummaryCard { padding:12px !important; border-radius:16px !important; margin:10px 0 12px !important; }
        .checklistSummaryCard b { font-size:17px !important; }
        .checklistSummaryBadges { display:grid !important; grid-template-columns:1fr 1fr !important; gap:6px !important; }
        .checklistSummaryBadges span { justify-content:center !important; font-size:12.5px !important; padding:7px 6px !important; }
        .checklistSummaryActions { display:grid !important; grid-template-columns:1fr 1fr !important; gap:6px !important; }
        .checklistSummaryActions button { width:100% !important; font-size:13px !important; }
        .checklistGroupHeader { grid-template-columns:auto 1fr !important; padding:12px !important; min-height:64px !important; gap:8px !important; align-items:start !important; }
        .checklistGroupCaret { width:34px !important; height:34px !important; font-size:20px !important; margin-top:1px !important; }
        .checklistGroupBadge { grid-column:2 !important; justify-self:start !important; margin-top:4px !important; max-width:100% !important; white-space:normal !important; }
        .checklistGroupTitle b { font-size:16.5px !important; }
        .checklistGroupTitle small { font-size:12.5px !important; }
        .checklistGroupBadge { font-size:11.5px !important; padding:5px 7px !important; }
        .checklistGroupBody { padding:0 10px 10px !important; gap:8px !important; }
        .checklistPoint { padding:10px !important; border-radius:15px !important; }
        .warrantyPointBadge { font-size:10.5px !important; padding:4px 7px !important; }
        .warrantyMissingButtons { gap:6px !important; }
        .warrantyJumpButton { width:100% !important; }

        .checklistHeader { display:grid !important; gap:8px !important; }
        .checklistStatusButtons { display:grid !important; grid-template-columns:1fr 1fr 1fr !important; gap:6px !important; }
        .checklistStatusButtons button { width:100% !important; min-height:40px !important; padding:7px 4px !important; font-size:12.5px !important; }
        .checklistUpload { width:100% !important; justify-content:center !important; margin-top:8px !important; }
      }



      .deviationCloseBox, .deviationClosedBox { border:1px solid #dbe7ec; border-radius:14px; padding:12px; margin:10px 0; background:#f8fafc; }
      .deviationCloseBox { border-color:#fecaca; background:#fff7f7; }
      .deviationClosedBox { border-color:#bbf7d0; background:#ecfdf5; }
      .deviationClosedBox b { color:#065f46; }

      /* iPhone Safari safe-area: avoid bottom browser toolbar */
      @media screen and (max-width:700px) {
        .bottomPrevNext {
          padding-bottom:calc(110px + env(safe-area-inset-bottom)) !important;
          margin-bottom:0 !important;
        }
        main {
          padding-bottom:calc(120px + env(safe-area-inset-bottom)) !important;
        }
      }

      /* Mobile UX fase 3: sticky feltapp-meny */
      .mobileFieldBar { display:none; }
      @media screen and (max-width: 700px) {
        .mobileNav { display:none !important; }
        .mobileCurrentProjectBar { display:none !important; }
        .mobileFieldBar {
          display:block !important;
          position:sticky;
          top:0;
          z-index:60;
          padding:8px 10px 9px;
          background:rgba(248,250,252,0.96);
          backdrop-filter:blur(14px);
          border-bottom:1px solid #dbe7ec;
          box-shadow:0 8px 22px rgba(15,23,42,0.08);
        }
        .mobileFieldBarInner {
          max-width:1180px;
          margin:0 auto;
          display:grid;
          grid-template-columns:1fr;
          gap:8px;
          align-items:center;
        }
        .mobileProjectLine {
          grid-column:1 / -1;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:8px;
          min-width:0;
        }
        .mobileProjectLineText { min-width:0; }
        .mobileProjectLineText b {
          display:block;
          font-size:11px;
          letter-spacing:.05em;
          text-transform:uppercase;
          color:#64748b;
          line-height:1.1;
        }
        .mobileProjectLineText span {
          display:block;
          font-size:15px;
          font-weight:900;
          color:#0f172a;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
          max-width:70vw;
          line-height:1.25;
        }
        .mobileFieldBar select {
          width:100%;
          min-height:44px !important;
          border-radius:14px !important;
          font-size:16px !important;
          font-weight:900 !important;
          background:#fff !important;
          border:1px solid #cbd5e1 !important;
          padding:8px 12px !important;
        }
        section { scroll-margin-top:106px !important; }
        main { padding-top:10px !important; }
      }


      /* FASE 6 v2: mobile top actions - make all critical header buttons available in portrait */
      @media screen and (max-width: 700px) {
        header .head {
          display:grid !important;
          grid-template-columns:92px minmax(0, 1fr) !important;
          gap:8px !important;
          align-items:center !important;
          padding:8px 10px 10px !important;
        }
        header .head > div:first-child {
          grid-column:1 !important;
          width:92px !important;
          height:38px !important;
          flex:0 0 92px !important;
          min-width:0 !important;
        }
        header .head > div:nth-child(2) {
          grid-column:2 !important;
          min-width:0 !important;
        }
        header .head h1 {
          font-size:17px !important;
          line-height:1.1 !important;
          margin:0 !important;
          white-space:nowrap !important;
          overflow:hidden !important;
          text-overflow:ellipsis !important;
        }
        header .head p {
          max-width:100% !important;
          font-size:12px !important;
          margin:2px 0 0 !important;
          white-space:nowrap !important;
          overflow:hidden !important;
          text-overflow:ellipsis !important;
        }
        header .head > button,
        header .head > button:nth-of-type(1),
        header .head > button:nth-of-type(2),
        header .head > button:nth-of-type(3),
        header .head > button:nth-of-type(4),
        header .head > button:nth-of-type(5),
        header .head > button:nth-of-type(6),
        header .head > button:nth-of-type(7) {
          display:inline-flex !important;
          width:100% !important;
          min-height:38px !important;
          padding:7px 8px !important;
          border-radius:12px !important;
          font-size:12.5px !important;
          line-height:1.1 !important;
          justify-content:center !important;
          align-items:center !important;
          gap:5px !important;
          white-space:normal !important;
        }
        header .head > button svg {
          width:15px !important;
          height:15px !important;
          flex:0 0 auto !important;
        }
      }


      /* FASE 6.11 compact + chat-fokus: kun visuell komprimering */
      .customerChatFocusNote {
        margin: 8px 0 10px !important;
        padding: 9px 11px;
        border: 1px solid #dbe7ec;
        border-radius: 14px;
        background: #f8fafc;
        font-weight: 800;
      }
      .customerPortalActions button:first-child {
        font-weight: 900;
      }
      @media screen and (max-width:700px) {
        main { padding-top: 8px !important; }
        section { padding: 11px !important; margin: 8px auto !important; border-radius: 16px !important; }
        section h2 { font-size: 19px !important; margin-bottom: 8px !important; }
        h3 { font-size: 16px !important; margin: 8px 0 6px !important; }
        .note { font-size: 13px !important; line-height: 1.38 !important; margin: 6px 0 !important; }
        .grid { gap: 8px !important; }
        .item, .out { padding: 9px !important; margin: 7px 0 !important; border-radius: 14px !important; }
        .tile { padding: 8px !important; border-radius: 14px !important; }
        .cards { gap: 7px !important; }
        input, textarea, select { min-height: 40px !important; }
        textarea { min-height: 74px !important; }
        button, .upload { min-height: 39px !important; padding: 8px 10px !important; }
        .collapsibleBlock { margin: 7px 0 !important; }
        .collapsibleBlock summary { min-height: 42px !important; padding: 9px 11px !important; }
        .collapsibleBlockBody { padding: 0 10px 10px !important; }
        .projectListCard { padding: 10px !important; margin: 8px 0 !important; }
        .projectListActions { margin-top: 8px !important; }
        .projectListMetaCards { margin-top: 7px !important; }
        .customerPortalActions { display:grid !important; grid-template-columns:1fr 1fr !important; gap:7px !important; }
        .customerPortalActions button { width:100% !important; }
        .customerPortalActions button:first-child { grid-column:1 / -1; min-height:44px !important; }
        .customerChatFocusNote { font-size:13px !important; line-height:1.35 !important; }
      }

    

      /* FASE 7 Deploy 3B: mobiljustering av sjekklister */
      @media screen and (max-width: 700px) {
        html, body, #root {
          max-width: 100% !important;
          overflow-x: hidden !important;
        }

        main,
        section,
        .checklistList,
        .checklistAccordion,
        .checklistGroup,
        .checklistGroupBody,
        .checklistPoint,
        .checklistHeader,
        .checklistPointTitle,
        .checklistSummaryCard {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
          overflow-x: hidden !important;
        }

        .checklistAccordion {
          display: block !important;
          padding: 0 !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
        }

        .checklistGroup {
          margin-left: 0 !important;
          margin-right: 0 !important;
          padding: 0 !important;
          border-radius: 16px !important;
        }

        .checklistGroupHeader {
          width: 100% !important;
          max-width: 100% !important;
          display: grid !important;
          grid-template-columns: auto minmax(0, 1fr) !important;
          gap: 8px !important;
          align-items: start !important;
          text-align: left !important;
          white-space: normal !important;
          overflow: hidden !important;
        }

        .checklistGroupBadge {
          grid-column: 2 !important;
          justify-self: start !important;
          max-width: 100% !important;
          white-space: normal !important;
        }

        .checklistGroupTitle,
        .checklistGroupTitle b,
        .checklistGroupTitle small,
        .checklistPointTitle,
        .checklistPointTitle b,
        .checklistPointTitle small,
        .warrantyPointBadge {
          max-width: 100% !important;
          overflow-wrap: anywhere !important;
          word-break: break-word !important;
          white-space: normal !important;
        }

        .checklistGroupBody {
          padding: 8px !important;
        }

        .checklistPoint {
          padding: 12px !important;
          margin: 10px 0 !important;
          border-radius: 16px !important;
        }

        .checklistHeader {
          display: block !important;
        }

        .checklistStatusButtons {
          width: 100% !important;
          max-width: 100% !important;
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 8px !important;
          margin-top: 10px !important;
          overflow: hidden !important;
        }

        .checklistStatusButtons button {
          width: 100% !important;
          min-width: 0 !important;
          max-width: 100% !important;
          white-space: normal !important;
          overflow-wrap: anywhere !important;
        }

        .checklistStatusButtons button:nth-child(3) {
          grid-column: 1 / -1 !important;
        }

        .checklistUpload {
          width: 100% !important;
          max-width: 100% !important;
          display: flex !important;
          justify-content: center !important;
          text-align: center !important;
          overflow: hidden !important;
        }

        .checklistPhotos,
        .checklistPhotos .photo,
        .checklistPhotos img,
        .checklistPhotos small {
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
          overflow-wrap: anywhere !important;
          word-break: break-word !important;
        }

        .checklistPhotos {
          display: grid !important;
          grid-template-columns: 1fr !important;
          gap: 8px !important;
          overflow-x: hidden !important;
        }

        .checklistPhotos .photo img {
          width: 100% !important;
          height: auto !important;
          object-fit: contain !important;
        }

        .deviationCloseBox,
        .deviationClosedBox {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          overflow-x: hidden !important;
        }
      }

` }),
      lightboxImage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "imageLightboxOverlay", onClick: (event) => {
        event.stopPropagation();
        setLightboxImage(null);
      }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "imageLightboxInner", onClick: (event) => event.stopPropagation(), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "imageLightboxTop", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "imageLightboxClose", onClick: () => setLightboxImage(null), children: "Lukk bilde" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { className: "imageLightboxImage", src: lightboxImage.src, alt: lightboxImage.alt })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Expo ProffDok" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: projectId ? `${currentStatus.icon} ${currentStatus.label}` : authUser?.email || name })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: signOut, children: "Logg ut" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: createNewProject, children: "+ Nytt prosjekt" }),
          hasActiveProjectWorkspace && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: saveProject, children: projectId ? "Oppdater prosjekt" : "Lagre prosjekt" }),
          hasActiveProjectWorkspace && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: saveAsNewProject, children: "Lagre som kopi" }),
          hasActiveProjectWorkspace && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { onClick: downloadClickablePdfReport, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Download, { size: 18 }),
            " Last ned PDF"
          ] }),
          projectId && (isProjectLocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => setProjectLockedState(false), children: "\u{1F513} L\xE5s opp prosjekt" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => setProjectLockedState(true), children: "\u{1F512} Avslutt prosjekt" }))
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", { children: tabs.map(([id, l]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: tab === id ? "on" : "", onClick: () => goToTab(id), children: l }, id)) }),
        isSupportModeActive && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { maxWidth: "1180px", margin: "0 auto 10px", padding: "12px 16px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "16px", display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", flexWrap: "wrap" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "grid", gap: "3px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { style: { color: "#9a3412" }, children: "SYSTEMADMIN SUPPORTMODUS" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { style: { color: "#7c2d12", fontWeight: 800 }, children: [
              "Firma: ", supportProjectCompanyName || "Ukjent firma",
              " · Prosjekt: ", project.projectName || project.address || "Uten navn",
              " · Prosjekteier: ", supportProjectOwner?.email || currentProjectOwnerId || "ukjent"
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: exitSupportMode, children: "Avslutt supportmodus" })
        ] }),
        hasActiveProjectWorkspace && projectAutoSaveStatus && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "note", style: { maxWidth: "1180px", margin: "0 auto", padding: "0 16px 10px" }, children: `Autolagring: ${projectAutoSaveStatus}` }),
        projectId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mobileNav", style: { maxWidth: "1180px", margin: "0 auto", padding: "0 16px 14px" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileNavPanel", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileNavTop", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileNavTitle", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Meny" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: tabs.find(([id]) => id === tab)?.[1] || "Velg side" })
            ] }),
            projectId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "mobileNavPill", children: [
              currentStatus.icon,
              " ",
              currentStatus.label
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mobileNavSelectWrap", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", { "aria-label": "Velg side", value: tab, onChange: (e) => goToTab(e.target.value), children: tabs.map(([id, l]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: id, children: l }, id)) }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileSectionChips", "aria-label": "Hurtigvalg seksjoner", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: tab === "produkter" ? "" : "secondary", onClick: () => goToTab("produkter"), children: "Produkter" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: tab === "sjekklister" ? "" : "secondary", onClick: () => goToTab("sjekklister"), children: "Sjekklister" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: tab === "tilbud" ? "" : "secondary", onClick: () => goToTab("tilbud"), children: "Tilbud" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: tab === "overtagelse" ? "" : "secondary", onClick: () => goToTab("overtagelse"), children: "Overtag." })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileNavQuick", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", disabled: !previousTab, onClick: () => previousTab && goToTab(previousTab[0]), children: "\u2190 Forrige" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: !nextTab, onClick: () => nextTab && goToTab(nextTab[0]), children: "Neste \u2192" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileNavStatus", children: [
            unreadForAdmin > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "mobileNavPill", onClick: () => goToTab("chat"), children: [
              "\u{1F4AC} ",
              unreadForAdmin,
              " ulest"
            ] }),
            totalChatCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "mobileNavPill", onClick: () => goToTab("chat"), children: [
              "Chat: ",
              totalChatCount
            ] })
          ] })
        ] }) })
      ] }),
      projectId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mobileFieldBar", "aria-label": "Mobil arbeidsmeny", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileFieldBarInner", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileProjectLine", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileProjectLineText", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Du jobber i" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: project.projectName || project.address || "\xC5pent prosjekt" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => {
            setProjectId(null);
            setTab("prosjekt");
          }, children: "Bytt" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", { "aria-label": "Velg seksjon", value: tab, onChange: (e) => goToTab(e.target.value), children: tabs.map(([id, l]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: id, children: l }, "mobile-field-" + id)) })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
        !projectId && !mobileCreatingProject && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "mobileProjectChooser", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileHomeHero", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mobileHomeEyebrow", children: "Expo ProffDok" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Hva skal du dokumentere nå?" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Start et nytt prosjekt eller fortsett der du slapp. Denne startsiden vises kun på mobil." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileHomeActions", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => {
                createNewProject();
                setTab("prosjekt");
                setTimeout(() => scrollToMobileTabTarget("prosjekt"), 120);
              }, children: "+ Nytt prosjekt" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => loadProjects(authUser, true), children: "Oppdater" })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileHomeStats", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "mobileHomeStatCard", onClick: () => setProjectStatusFilter("alle"), children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: mobileHomeStats.active }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "aktive" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "mobileHomeStatCard", onClick: () => setProjectUnreadOnly((value) => !value), children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: mobileHomeStats.unreadProjects }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "ulest chat" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "mobileHomeStatCard", onClick: () => setProjectStatusFilter("deviation"), children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: mobileHomeStats.deviations }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "med avvik" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "mobileHomeStatCard", onClick: () => setProjectStatusFilter("customer_ready"), children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: mobileHomeStats.readyForCustomer }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "klar kunde" })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileHomeSearchCard", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Søk prosjekt, kunde, adresse, e-post, telefon eller garantinr.", value: projectSearch, onChange: setProjectSearch }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileHomeFilterRow", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: projectStatusFilter === "alle" && !projectUnreadOnly ? "" : "secondary", onClick: () => {
                setProjectStatusFilter("alle");
                setProjectUnreadOnly(false);
              }, children: "Alle" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: projectUnreadOnly ? "" : "secondary", onClick: () => setProjectUnreadOnly((value) => !value), children: "Ulest" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: projectStatusFilter === "deviation" ? "" : "secondary", onClick: () => setProjectStatusFilter(projectStatusFilter === "deviation" ? "alle" : "deviation"), children: "Avvik" })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileProjectList", children: [
            filteredProjectListRows.filter((item) => item.listStatus.tone !== "done" && item.listStatus.tone !== "locked").slice(0, 8).map(({ row: p, listProject, listStatus, unreadForAdminInList, openDeviationCount, productSummary, imageSummary }) => {
              const locationLine = [listProject.address, listProject.postnr, listProject.city].filter(Boolean).join(", ");
              return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileProjectPickCard", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileProjectPickCardTop", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: p.title || listProject.projectName || "Uten navn" }),
                    listProject.customer && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                      "Kunde: ",
                      listProject.customer
                    ] }),
                    locationLine && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: locationLine })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "mobileProjectPickStatus", children: [
                    listStatus.icon,
                    " ",
                    listStatus.label
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileProjectPickMeta", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                    "📷 ",
                    imageSummary.total,
                    " bilder"
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                    "📦 ",
                    productSummary.total,
                    " produkter"
                  ] }),
                  unreadForAdminInList > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "mobileProjectPickAlert", children: [
                    "💬 ",
                    unreadForAdminInList,
                    " ulest"
                  ] }),
                  openDeviationCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "mobileProjectPickAlert", children: [
                    "⚠️ ",
                    openDeviationCount,
                    " avvik"
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileProjectPickActions", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => openProjectById(p.id, "prosjekt"), children: "Åpne" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => openProjectById(p.id, "bilder"), children: "Bilder" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => openProjectById(p.id, "sjekklister"), children: "Sjekklister" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => openProjectById(p.id, "chat"), children: "Chat" })
                ] })
              ] }, `mobile-pick-${p.id}`);
            }),
            projects.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen prosjekter hentet ennå. Trykk Oppdater." }),
            projects.length > 0 && filteredProjectListRows.filter((item) => item.listStatus.tone !== "done" && item.listStatus.tone !== "locked").length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen aktive prosjekter matcher søket eller filteret. Avsluttede prosjekter ligger i prosjektlisten." })
          ] })
        ] }),
        projectId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileCurrentProjectBar", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Du jobber i" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: project.projectName || project.address || "\xC5pent prosjekt" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileCurrentProjectActions", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => {
              setProjectId(null);
              setTab("prosjekt");
            }, children: "Bytt prosjekt" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => goToTab("bilder"), children: "G\xE5 til bilder" })
          ] })
        ] }),
        projectId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: `${currentStatus.icon} Prosjektstatus: ${currentStatus.label}`, icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `statusBadge status-${currentStatus.tone}`, style: { display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "999px", fontWeight: 700, marginBottom: "10px", border: "1px solid #dbe7ec", ...statusStyle(currentStatus.tone) }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: currentStatus.icon }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: currentStatus.label })
          ] }),
          projectGuideStats.openDeviationCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "activeDeviationFocus item", style: { margin: "10px 0", borderColor: "#fecaca", background: "#fff7f7" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
              "Prosjektet har ",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectGuideStats.openDeviationCount }),
              " åpne avvik som bør følges opp før prosjektet settes klart for kunde."
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: openActiveDeviations, children: "Se aktive avvik" })
          ] }),
          !isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { margin: "10px 0" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Arbeidsstatus", value: project.workflowStatus || "Pågår", options: workflowStatusOptions, onChange: (v) => setProject({ ...project, workflowStatus: v }) }),
            suggestedWorkflowStatus !== (project.workflowStatus || "Pågår") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
              "Forslag basert på prosjektet: ",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: suggestedWorkflowStatus }),
              "."
            ] }),
            suggestedWorkflowStatus !== (project.workflowStatus || "Pågår") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setProject({ ...project, workflowStatus: suggestedWorkflowStatus }), children: "Bruk foreslått status" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: isProjectLocked ? `Prosjektet ble l\xE5st${project.lockedAt ? " " + new Date(project.lockedAt).toLocaleString("no-NO") : ""}${project.lockedBy ? " av " + project.lockedBy : ""}. L\xE5s opp prosjektet hvis du trenger \xE5 gj\xF8re endringer.` : "Prosjektet er åpent for endringer. Bruk arbeidsstatus for å vise om prosjektet er utkast, pågår, avventer, klart for kunde eller har åpne avvik." }),
          projectHasOvertagelse() && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
            "Overtagelse er registrert",
            overtagelse.dato ? ` ${new Date(overtagelse.dato).toLocaleDateString("no-NO")}` : "",
            "."
          ] }),
          totalChatCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
            "\u{1F4AC} Chat: ",
            totalChatCount,
            " melding",
            totalChatCount === 1 ? "" : "er",
            " totalt",
            customerChatCount > 0 ? ` \xB7 ${customerChatCount} fra kunde` : "",
            unreadForAdmin > 0 ? ` \xB7 ${unreadForAdmin} ulest` : "",
            latestChatMessage?.created ? ` \xB7 siste ${new Date(latestChatMessage.created).toLocaleString("no-NO")}` : "",
            "."
          ] })
        ] }),
        projectId && !isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Hva mangler på prosjektet?", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ClipboardCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Denne oversikten viser hva som er på plass og hva som bør kontrolleres før rapport, PDF og overtagelse." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideGrid", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideCard", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: `${projectGuideStats.completionPercent}%` }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "ferdigstillelse" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideCard", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectGuideStats.productCount }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "produkter valgt" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideCard", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectGuideStats.photoCount }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "bilder lagt til" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideCard", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectGuideStats.checklistDone }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: projectGuideStats.checklistMissing > 0 ? `${projectGuideStats.checklistMissing} sjekkpunkt gjenstår` : "sjekklister ferdig" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideCard", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectGuideStats.openDeviationCount }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: projectGuideStats.openDeviationCount > 0 ? "åpne avvik" : "ingen åpne avvik" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideCard", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectGuideStats.hasOvertagelse ? "Ja" : "Nei" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "overtagelse registrert" })
            ] })
          ] }),
          projectGuideStats.openDeviationCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Prosjektet har åpne avvik. Lukk avvikene når tiltak er utført og kontrollert." }),
          projectGuideItems.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "guideSteps", children: projectGuideItems.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `guideStep guideStep-${item.tone}`, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideStepText", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: item.label }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Trykk for å gå direkte til riktig seksjon." })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => openProjectGuideItem(item), children: "Åpne" })
          ] }, item.id)) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Prosjektet ser komplett ut. Kontroller rapporten før prosjektet avsluttes." }),
          projectGuideStats.openDeviationCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: openActiveDeviations, children: "Se aktive avvik" })
        ] }),
        tab === "prosjekt" && (!hasActiveProjectWorkspace ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "desktopOnlyWhenNoProject desktopNoProjectWelcome", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "desktopNoProjectHero", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mobileHomeEyebrow", children: "Expo ProffDok" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Velg eller opprett prosjekt" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen prosjekt er valgt. Start et nytt prosjekt, eller åpne et eksisterende prosjekt fra prosjektlisten før du fyller inn prosjektinformasjon." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "16px" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => { createNewProject(); setTab("prosjekt"); }, children: "+ Nytt prosjekt" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => goToTab("prosjektliste"), children: "Åpne prosjektliste" })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideGrid", style: { marginTop: "18px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideCard", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: mobileHomeStats.active }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "aktive prosjekter" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideCard", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: mobileHomeStats.unread }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "uleste chat" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideCard", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: mobileHomeStats.deviations }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "med avvik" })
            ] })
          ] })
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: !projectId && !mobileCreatingProject ? "desktopOnlyWhenNoProject" : "", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { title: "Prosjektinformasjon", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ClipboardCheck, {}), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleBlock, { title: "Prosjekt- og kundeinfo", defaultOpen: true, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Prosjektansvarlig", value: project.responsible, onChange: (v) => setProject({ ...project, responsible: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Dato", type: "date", value: project.date, onChange: (v) => setProject({ ...project, date: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn p\xE5 prosjekt", value: project.projectName, onChange: (v) => setProject({ ...project, projectName: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Adresse", value: project.address, onChange: (v) => setProject({ ...project, address: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Postnr.", value: project.postnr || "", onChange: (v) => setProject({ ...project, postnr: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Poststed / by", value: project.city || "", onChange: (v) => setProject({ ...project, city: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Kunde", value: project.customer, onChange: (v) => setProject({ ...project, customer: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Kunde e-post", type: "email", value: project.customerEmail || "", onChange: (v) => setProject({ ...project, customerEmail: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Kunde telefon", type: "tel", value: project.customerPhone || "", onChange: (v) => setProject({ ...project, customerPhone: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Notater", value: project.notes, onChange: (v) => setProject({ ...project, notes: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectWarrantySetup, { warranty, setWarranty, systems: soproWarrantySystems })
        ] }) }) }) })),
        tab === "prosjektinfo" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Prosjektinformasjon/beskrivelse", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ClipboardCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Her kan prosjektleder legge inn praktisk prosjektinformasjon som kunde og underentreprenører skal kunne lese i sine prosjektlenker." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleBlock, { title: "Standardtekster", defaultOpen: !hasValue(project.projectDescription), children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Trykk på en mal for å legge den inn nederst i prosjektbeskrivelsen. Teksten kan redigeres fritt etterpå." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }, children: projectDescriptionTemplates.map((template) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => appendProjectDescriptionTemplate(template.text), children: template.label }, template.label)) })
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Beskrivelse / nødvendig prosjektinformasjon", value: project.projectDescription || "", onChange: (v) => setProject({ ...project, projectDescription: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleBlock, { title: "Portal/PDF-innstillinger", defaultOpen: !project.projectInfoIncludeInReport, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", gap: "10px", alignItems: "center", marginTop: "4px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: !!project.projectInfoIncludeInReport, onChange: (e) => setProject({ ...project, projectInfoIncludeInReport: e.target.checked }), style: { width: "auto" } }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ta med prosjektinformasjon/beskrivelse i rapport/PDF" })
          ] }) })
        ] }),
        tab === "firma" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Firmaprofil", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Building2, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Firmaprofilen lagres p\xE5 brukeren din og brukes automatisk i prosjekter og rapporter." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleBlock, { title: "Firmainfo og logo", defaultOpen: !hasValue(company.companyName) || !hasValue(company.email), children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "two", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "logoBox", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
                " Last opp firmalogo",
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", onChange: (e) => uploadLogo(e.target.files?.[0]) })
              ] }),
              company.logoUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => setCompany({ ...company, logoUrl: "" }), children: "Fjern logo" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Firmanavn", value: company.companyName, onChange: (v) => setCompany({ ...company, companyName: v }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Org.nr", value: company.orgNumber, onChange: (v) => setCompany({ ...company, orgNumber: v }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Adresse", value: company.address, onChange: (v) => setCompany({ ...company, address: v }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Telefon", value: company.phone, onChange: (v) => setCompany({ ...company, phone: v }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "E-post", value: company.email, onChange: (v) => setCompany({ ...company, email: v }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Hjemmeside", value: company.website, onChange: (v) => setCompany({ ...company, website: v }) })
            ] })
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: saveProfile, children: "Lagre firmaprofil" })
        ] }),
        tab === "innlogging" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Innlogging og brukerprofil", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
            "Du er logget inn som ",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: authUser?.email }),
            ". Prosjektlisten viser kun dine prosjekter. Delingslenker kan fortsatt \xE5pnes av kunde uten innlogging."
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn", value: user.name, onChange: (v) => setUser({ ...user, name: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "E-post i rapport", value: user.email, onChange: (v) => setUser({ ...user, email: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Rolle", value: user.role, options: roles, onChange: (v) => setUser({ ...user, role: v }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: signOut, children: "Logg ut" })
        ] }),
        tab === "prosjektering" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Prosjektering", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Angi fall som forholdstall, for eksempel 1:50 i dusjsone og 1:100 utenfor dusjsone. Prosjektering brukes til tekniske forutsetninger, fall, sluk, våtsone og membranløsning." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Hva bør dokumenteres her?" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Falltegning eller bilde/skjermbilde som viser fallforhold på badet." }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Plassering av sluk, terskel, våtsone og eventuelle nisjer eller spesielle løsninger." }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Valgt membranløsning og andre tekniske avklaringer som bør følge prosjektet." }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Tilbud og kontrakter lastes opp i fanen Tilbud/kontrakt, ikke her." })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Fall i dusjsone", value: project.fallDusj || "", onChange: (v) => setProject({ ...project, fallDusj: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Fall utenfor dusjsone / v\xE5tsone", value: project.fallUtenfor || "", onChange: (v) => setProject({ ...project, fallUtenfor: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Slukplassering", value: project.sluk, onChange: (v) => setProject({ ...project, sluk: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Terskelh\xF8yde", value: project.terskel, onChange: (v) => setProject({ ...project, terskel: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Membranl\xF8sning", value: project.membran, onChange: (v) => setProject({ ...project, membran: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Kommentar / avvik", value: project.prosjekteringKommentar, onChange: (v) => setProject({ ...project, prosjekteringKommentar: v }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Egne prosjekteringspunkter" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Legg til egne prosjekteringspunkter under riktig tema. Bruk Annet for spesielle løsninger eller avklaringer som ikke passer i standardfeltene." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", onClick: addProsjekteringPunkt, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
              " Legg til punkt"
            ] }),
            (Array.isArray(project.prosjekteringPunkter) ? project.prosjekteringPunkter : []).map((point) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Tema", value: point.category || "Annet", options: ["Fall", "Sluk", "Membran", "Tegning", "Våtsone", "Terskel", "Annet"], onChange: (v) => updateProsjekteringPunkt(point.id, { category: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Punkt / tittel", value: point.title || "", onChange: (v) => updateProsjekteringPunkt(point.id, { title: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Beskrivelse / kommentar", value: point.value || "", onChange: (v) => updateProsjekteringPunkt(point.id, { value: v }) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => removeProsjekteringPunkt(point.id), children: "Fjern punkt" })
            ] }, point.id))
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Tegninger og prosjekteringsgrunnlag" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Last opp bilde eller skjermbilde av falltegning, slukplassering, våtsonekart, membranprinsipp eller annen relevant prosjekteringsinfo. Tilbud og kontrakt skal fortsatt lastes opp i fanen Tilbud/kontrakt." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
              " Last opp tegning / bilde",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", multiple: true, onChange: (e) => addPhoto("Prosjektering", e.target.files) })
            ] })
          ] })
        ] }),
        tab === "produkter" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: effectiveProductSections.map((s) => {
          const manualForSection = getManualProductsForSection(s.title);
          const visibleStandardItems = isProjectLocked ? (s.items || []).filter((i) => !!checked[i]) : s.items || [];
          const visibleManualItems = isProjectLocked ? manualForSection.filter((p) => hasValue(p?.name) || hasValue(p?.fdvUrl) || hasValue(p?.comment)) : manualForSection;
          const selectedInSection = (s.items || []).filter((i) => !!checked[i]).length;
          const manualInSection = manualForSection.filter((p) => hasValue(p?.name) || hasValue(p?.fdvUrl) || hasValue(p?.comment)).length;
          const hasUsedProducts = selectedInSection > 0 || manualInSection > 0;
          if (isProjectLocked && !hasUsedProducts) return null;
          const sectionOpen = isProjectLocked ? true : openProductSections?.[s.title] ?? hasUsedProducts;
          const totalVisible = visibleStandardItems.length + visibleManualItems.length;
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: s.title, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "secondary", onClick: () => setOpenProductSections((prev) => ({ ...prev || {}, [s.title]: !sectionOpen })), style: { width: "100%", justifyContent: "space-between", marginBottom: "12px" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                sectionOpen ? "▼ " : "▶ ",
                s.title
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: isProjectLocked ? `${selectedInSection + manualInSection} brukt` : selectedInSection + manualInSection > 0 ? `${selectedInSection + manualInSection} valgt` : "Åpne" })
            ] }),
            !sectionOpen && !isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: selectedInSection + manualInSection > 0 ? `${selectedInSection + manualInSection} produkt${selectedInSection + manualInSection === 1 ? "" : "er"} er valgt i denne kategorien.` : "Trykk for å åpne og velge produkter i denne kategorien." }),
            sectionOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: isProjectLocked ? "Prosjektet er arkivert/låst. Kun produkter som er brukt vises her." : "Kryss av produkter som er brukt. Når et produkt er valgt, kan du legge inn FDV-/databladlink og hvor produktet er brukt direkte på produktet." }),
              isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { color: "#991b1b", fontWeight: 700 }, children: "🔒 Produkter kan ikke legges til, fjernes eller endres før prosjektet låses opp." }),
              totalVisible === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen produkter valgt i denne kategorien ennå." }),
              visibleStandardItems.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "checklistList", children: visibleStandardItems.map((i) => {
                const doc = productDocs[i] || {};
                return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
                    !isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", style: { width: "auto", minHeight: "auto", padding: 0, margin: 0, flex: "0 0 auto" }, checked: !!checked[i], onChange: (e) => toggleProductChecked(i, e.target.checked) }),
                    isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { width: "18px", display: "inline-flex", justifyContent: "center", flex: "0 0 auto" }, children: checked[i] ? "✓" : "" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { margin: 0 }, children: i })
                  ] }),
                  checked[i] && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-/databladlink", value: doc.fdvUrl || "", disabled: isProjectLocked, onChange: (v) => updateProductDoc(i, { fdvUrl: v, fdvSource: "manual" }) }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Datablad", value: doc.databladUrl || "", disabled: isProjectLocked, onChange: (v) => updateProductDoc(i, { databladUrl: v, fdvSource: "manual" }) }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "DOP", value: doc.dopUrl || "", disabled: isProjectLocked, onChange: (v) => updateProductDoc(i, { dopUrl: v, fdvSource: "manual" }) }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "EPD", value: doc.epdUrl || "", disabled: isProjectLocked, onChange: (v) => updateProductDoc(i, { epdUrl: v, fdvSource: "manual" }) }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Sikkerhetsdatablad", value: doc.sikkerhetsdatabladUrl || "", disabled: isProjectLocked, onChange: (v) => updateProductDoc(i, { sikkerhetsdatabladUrl: v, fdvSource: "manual" }) }),
                      productSupportsColorChoice(i, s.title) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Fargekode", value: doc.colorCode || "", disabled: isProjectLocked, onChange: (v) => updateProductDoc(i, { colorCode: v }), options: getProductColorOptions(i, s.title) }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Hvor brukt / kommentar", value: doc.comment || "", disabled: isProjectLocked, onChange: (v) => updateProductDoc(i, { comment: v }) })
                    ] }),
                    !isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductReportDocumentSelector, { doc, productName: i, updateProductDoc }),
                    doc.fdvSource === "product-master" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Dokumentlinker er hentet automatisk fra produktmaster." }),
                    doc.fdvSource === "admin-register" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "FDV-link er hentet automatisk fra admin FDV-register." })
                  ] })
                ] }, i);
              }) }),
              !isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: [
                  "Andre produkter i ",
                  s.title
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Bruk dette hvis produktet ikke ligger i standardlisten for denne kategorien." }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", onClick: () => addManualProduct(s.title), children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
                  " Legg til annet produkt"
                ] }),
                visibleManualItems.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "12px" }, children: "Ingen andre produkter lagt til i denne kategorien." }),
                visibleManualItems.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Produktnavn", value: p.name || "", disabled: isProjectLocked, onChange: (v) => updateManualProduct(s.title, p.id, { name: v }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-/databladlink", value: p.fdvUrl || "", disabled: isProjectLocked, onChange: (v) => updateManualProduct(s.title, p.id, { fdvUrl: v }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Hvor brukt / kommentar", value: p.comment || "", disabled: isProjectLocked, onChange: (v) => updateManualProduct(s.title, p.id, { comment: v }) })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", disabled: isProjectLocked, onClick: () => removeManualProduct(s.title, p.id), children: "Fjern produkt" })
                ] }, p.id))
              ] }),
              isProjectLocked && visibleManualItems.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: [
                  "Andre produkter i ",
                  s.title
                ] }),
                visibleManualItems.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "item", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: p.name || "Annet produkt" }),
                  hasValue(p.fdvUrl) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: p.fdvUrl }),
                  hasValue(p.comment) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p.comment })
                ] }, p.id))
              ] })
            ] })
          ] }, s.title);
        }) }),
        tab === "overflater" && renderOverflaterOgInnredning(),
        tab === "bilder" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Bildedokumentasjon", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Camera, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "item", style: { display: "flex", alignItems: "flex-start", gap: "10px", cursor: isProjectLocked ? "not-allowed" : "pointer" }, onClick: (e) => e.stopPropagation(), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: !!project.checklistPhotosNote, disabled: isProjectLocked, onClick: (e) => e.stopPropagation(), onChange: (e) => {
              if (!canEditProject()) return;
              setProject({ ...project, checklistPhotosNote: e.target.checked });
            }, style: { width: "20px", height: "20px", marginTop: "2px" } }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Flere bilder ligger under sjekkpunkt i sjekkliste" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { className: "note", children: "Bruk denne når bildene hovedsakelig er dokumentert direkte på kontrollpunktene, slik at Bilder-fanen ikke må duplisere alt." })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cards imageUploadTiles", children: imageCats.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "tile", onDragOver: stopFileDragNavigation, onDragEnter: stopFileDragNavigation, onDrop: (e) => handlePhotoTileDrop(c, e), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 16 }),
              " ",
              c
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: photos.filter((p) => p.cat === c).length > 0 ? `\u{1F4F7} ${photos.filter((p) => p.cat === c).length} bilder lagt til` : "Ta bilde, velg fra galleri eller dra bilde hit" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", multiple: true, disabled: isProjectLocked, onClick: (e) => e.stopPropagation(), onChange: (e) => addPhoto(c, e.target.files) })
          ] }, c)) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: photoSaveStatus || "Bilder autolagres ved opplasting når prosjektet er lagret i skyen." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoGrid, { photos, setPhotos })
        ] }),
        tab === "tilgang" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Tilgang og deling", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Administrer tilgang til prosjektet. Kunde f\xE5r egen kundelink med rapport, tilbud/kontrakt og chat. Underentrepren\xF8rer kan bidra med dokumentasjon via egen tilgang." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Melding i e-post med tilgangslink", value: accessEmailMessage, onChange: setAccessEmailMessage }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cards", children: accessRoleInfo.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: r.role }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: r.text })
          ] }, r.role)) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { onClick: () => setAccess([...access, { id: uid(), name: "", email: "", role: "Underleverand\xF8r" }]), children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
              " Legg til person/firma"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => copyAccessLink("kunde"), children: "Kopier kundelink" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => sendAccessEmail({ role: "kunde", toEmail: project.customerEmail, recipientName: project.customer }), children: "Send kundelink på e-post" })
          ] }),
          access.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "16px" }, children: "Ingen ekstra tilganger er lagt til enn\xE5." }),
          access.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn/firma", value: a.name, onChange: (v) => setAccess(access.map((x) => x.id === a.id ? { ...x, name: v } : x)) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "E-post", value: a.email, onChange: (v) => setAccess(access.map((x) => x.id === a.id ? { ...x, email: v } : x)) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Rolle", value: a.role, options: roles, onChange: (v) => setAccess(access.map((x) => x.id === a.id ? { ...x, role: v } : x)) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: accessRoleInfo.find((r) => r.role === a.role)?.text || "" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => copyAccessLink(a.role), children: "Kopier link" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => sendAccessEmail({ role: a.role, toEmail: a.email, recipientName: a.name }), children: "Send e-post med link" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => setAccess(access.filter((x) => x.id !== a.id)), children: "Fjern" })
            ] })
          ] }, a.id))
        ] }),
        tab === "installasjoner" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Fag, deler og utstyr", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", onClick: () => setInst((prev) => [...prev, { id: uid(), category: "R\xF8rlegger", name: "", qty: "", supplier: "", desc: "", fdvUrl: "", photos: [], by: user.name || "Ukjent", created: (/* @__PURE__ */ new Date()).toLocaleString("no-NO") }]), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
            " Legg til post"
          ] }),
          inst.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Kategori", value: x.category, options: installCats, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, category: v } : i)) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn/produkt", value: x.name, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, name: v } : i)) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Antall/mengde", value: x.qty, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, qty: v } : i)) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Leverand\xF8r", value: x.supplier, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, supplier: v } : i)) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Beskrivelse/plassering", value: x.desc, onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, desc: v } : i)) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-/databladlink", value: x.fdvUrl || "", onChange: (v) => setInst(inst.map((i) => i.id === x.id ? { ...i, fdvUrl: v } : i)) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
              " Last opp bilder",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", multiple: true, onChange: async (e) => {
                const imgs = await uploadImages(e.target.files, "installasjoner");
                setInst(inst.map((i) => i.id === x.id ? { ...i, photos: [...i.photos || [], ...imgs] } : i));
              } })
            ] }),
            (x.photos || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
              "\u{1F4F7} ",
              (x.photos || []).length,
              " bilder lagt til"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos", children: (x.photos || []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: p.url }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: p.name })
            ] }, p.id)) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
              "Lagt inn av ",
              x.by,
              " \xB7 ",
              x.created
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setInst(inst.filter((i) => i.id !== x.id)), children: "Fjern" })
          ] }, x.id))
        ] }),
        tab === "sjekklister" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Sjekklister og vedlegg", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Velg status per kontrollpunkt. Kategoriene kan \xE5pnes/lukkes for mindre scrolling p\xE5 mobil. Ved Avvik kan du skrive kommentar og ta bilde." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            ChecklistEditor,
            {
              checklist,
              setChecklistValue,
              addChecklistPhoto,
              addFiles,
              files,
              setFiles,
              closedByName: user.name || authUser?.email || "Utførende",
              showOpenDeviationsOnly,
              setShowOpenDeviationsOnly,
              warranty,
              activeChecklistTemplate
            }
          )
        ] }),
        tab === "tilbud" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Tilbud / kontrakt", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Her legger du inn tilbud, kontrakt og avtaleendringer. Kunde f\xE5r se dette i kundelinken n\xE5r det finnes innhold eller vedlegg. Huk av hvis sammendraget ogs\xE5 skal med i vanlig rapport/PDF." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Tillegg", value: tilbud.tillegg || "", onChange: (v) => setTilbud({ ...emptyTilbud(), ...tilbud, tillegg: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Fradrag", value: tilbud.fradrag || "", onChange: (v) => setTilbud({ ...emptyTilbud(), ...tilbud, fradrag: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Avtaleendringer / kommentar", value: tilbud.kommentar || "", onChange: (v) => setTilbud({ ...emptyTilbud(), ...tilbud, kommentar: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "input",
                {
                  type: "checkbox",
                  style: { width: "auto", minHeight: "auto", padding: 0, margin: 0, flex: "0 0 auto" },
                  checked: !!tilbud.enabled,
                  onChange: (e) => setTilbud({ ...emptyTilbud(), ...tilbud, enabled: e.target.checked })
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { margin: 0 }, children: "Ta med sammendrag i rapport" })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Vedlegg" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Last opp tilbud, kontrakt eller andre avtaledokumenter. Vedleggene lagres p\xE5 prosjektet og vises i kundelinken. Underentrepren\xF8r har ikke tilgang til tilbud/kontrakt." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
              " Last opp tilbud / kontrakt",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", multiple: true, onChange: (e) => uploadTilbudFiles(e.target.files) })
            ] }),
            (tilbud.files || []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "12px" }, children: "Ingen tilbud eller kontrakter er lastet opp enn\xE5." }),
            (tilbud.files || []).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "file", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: f.name }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                "Lastet opp av ",
                f.by || "Ukjent",
                " \xB7 ",
                f.created
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: f.url, target: "_blank", rel: "noopener noreferrer", children: "\xC5pne" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => setTilbud({ ...emptyTilbud(), ...tilbud, files: (tilbud.files || []).filter((x) => x.id !== f.id) }), children: "Fjern" })
            ] }, f.id))
          ] })
        ] }),
        tab === "overtagelse" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Overtagelse og signering", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ClipboardCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Bruk denne ved sluttbefaring og overlevering. N\xE5r begge signaturer er fylt ut kan prosjektet fullf\xF8res og l\xE5ses." }),
          isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "\u{1F512} Prosjektet er l\xE5st. Overtagelsen kan vises i rapporten, men endringer krever at prosjektet l\xE5ses opp." }),
          projectHasOvertagelse() && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
            "\u2705 Overtagelse registrert",
            overtagelse.dato ? ` ${new Date(overtagelse.dato).toLocaleDateString("no-NO")}` : "",
            "."
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Dato for overtagelse", type: "date", value: overtagelse.dato || "", onChange: (v) => setOvertagelse({ ...emptyOvertagelse(), ...overtagelse, dato: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "input",
                {
                  type: "checkbox",
                  style: { width: "auto", minHeight: "auto", padding: 0, margin: 0, flex: "0 0 auto" },
                  checked: !!overtagelse.enabled,
                  onChange: (e) => setOvertagelse({ ...emptyOvertagelse(), ...overtagelse, enabled: e.target.checked })
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { margin: 0 }, children: "Ta med overtagelse i rapport" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Kommentar / merknader fra sluttbefaring", value: overtagelse.kommentar || "", onChange: (v) => setOvertagelse({ ...emptyOvertagelse(), ...overtagelse, kommentar: v }) }),
            warranty?.enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: warranty?.termsAccepted ? { borderColor: "#bbf7d0", background: "#ecfdf5" } : { borderColor: "#fde68a", background: "#fffbeb" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: `📑 Garantivilkår ${getWarrantyYears(warranty)} år` }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Garantivilkår aksepteres automatisk når kunden signerer overtagelsen og prosjektet fullføres. Kunden trenger derfor ikke signere eller krysse av et eget sted." }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Mottaker", value: warranty?.termsReceiptName || overtagelse.signKunde || project.customer || "Kunde", disabled: true, onChange: () => {} }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Status", value: warranty?.termsAccepted ? `Bekreftet sammen med overtagelse${warranty?.termsAcceptedAt ? " " + new Date(warranty.termsAcceptedAt).toLocaleString("no-NO") : ""}` : "Bekreftes automatisk ved fullført overtagelse", disabled: true, onChange: () => {} })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", style: { fontWeight: 700 }, children: [
                warranty?.termsAccepted ? "✅ Garantivilkår er bekreftet sammen med overtagelsen." : "ℹ️ Når kunden signerer overtagelsen, lagres mottak og aksept av garantivilkår automatisk på prosjektet."
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { className: "secondary", href: `/${warrantyTermsPdfFileName}`, target: "_blank", rel: "noopener noreferrer", style: { display: "inline-block", textDecoration: "none", marginTop: "8px" }, children: "Åpne garantivilkår PDF" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Signaturer" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Signer direkte p\xE5 skjermen med finger p\xE5 telefon eller mus p\xE5 PC. Navn kan fylles ut i tillegg for tydelig dokumentasjon." }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn utf\xF8rende", value: overtagelse.signUtf\u00F8rende || "", onChange: (v) => setOvertagelse({ ...emptyOvertagelse(), ...overtagelse, signUtf\u00F8rende: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn kunde", value: overtagelse.signKunde || "", onChange: (v) => setOvertagelse({ ...emptyOvertagelse(), ...overtagelse, signKunde: v }) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid", style: { marginTop: "14px" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  SignaturePad,
                  {
                    label: "Signatur utf\xF8rende",
                    value: overtagelse.signUtf\u00F8rendeImage || "",
                    onChange: (v) => setOvertagelse({ ...emptyOvertagelse(), ...overtagelse, signUtf\u00F8rendeImage: v })
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  SignaturePad,
                  {
                    label: "Signatur kunde",
                    value: overtagelse.signKundeImage || "",
                    onChange: (v) => setOvertagelse({ ...emptyOvertagelse(), ...overtagelse, signKundeImage: v })
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: saveProject, children: "Lagre overtagelse" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: completeOvertagelseAndLock, disabled: isProjectLocked, children: "Fullf\xF8r overtagelse og l\xE5s prosjekt" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => sendProjectCompletionEmailToCustomer({ askFirst: true, silent: false }), disabled: !projectId || !project.customerEmail, children: "Send dokumentasjon til kunde" })
          ] })
        ] }),
        tab === "chat" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: unreadForAdmin > 0 ? `Chat (${unreadForAdmin} ulest)` : totalChatCount > 0 ? `Chat (${totalChatCount} meldinger)` : "Chat", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Chatten oppdateres automatisk live. Nye kundemeldinger st\xE5r som ulest til du svarer, klikker p\xE5 meldingen eller trykker Marker alle som lest. Skrivefeltet beholdes ved refresh." }),
          totalChatCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", style: { fontWeight: 700 }, children: [
            "\u{1F4AC} Det finnes ",
            totalChatCount,
            " melding",
            totalChatCount === 1 ? "" : "er",
            " totalt i chatten",
            customerChatCount > 0 ? `, hvorav ${customerChatCount} fra kunde` : "",
            unreadForAdmin > 0 ? ` \xB7 ${unreadForAdmin} ulest fra kunde` : " \xB7 alt er lest",
            "."
          ] }),
          !hasValue(project.customerEmail) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { fontWeight: 700 }, children: "\u26A0\uFE0F Legg inn kunde e-post i Prosjektinformasjon for at kunde skal f\xE5 e-postvarsling ved nye chatmeldinger." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                type: "checkbox",
                style: { width: "auto", minHeight: "auto", padding: 0, margin: 0, flex: "0 0 auto" },
                checked: !!projectLog.enabled,
                onChange: (e) => setProjectLog((prev) => ({ ...prev, enabled: e.target.checked }))
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { margin: 0 }, children: "Ta med chat i rapport" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Ny melding", value: projectLog.draft || "", onChange: (v) => setProjectLog((prev) => ({ ...prev, draft: v })) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload", style: { marginBottom: 0 }, children: [
              "\u{1F4F7} Last opp bilde",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "input",
                {
                  id: "admin-chat-image-input",
                  type: "file",
                  accept: "image/*",
                  onChange: (e) => setChatUploadFile(e.target.files?.[0] || null)
                }
              ),
              chatUploadFile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { style: { display: "block", marginTop: "6px" }, children: [
                "Valgt: ",
                chatUploadFile.name
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: addProjectLogMessage, children: "Send melding" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => refreshProjectFromCloud(false), children: "Oppdater chat" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", disabled: unreadForAdmin === 0, onClick: () => markChatAsRead("admin"), children: "Marker alle som lest" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setProjectLog((prev) => ({ ...prev, draft: "" })), children: "T\xF8m skrivefelt" })
          ] }),
          (projectLog.messages || []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "16px" }, children: "Ingen meldinger enn\xE5." }),
          (projectLog.messages || []).slice().reverse().map((m) => {
            const isUnread = m.role === "kunde" && (!lastReadByAdmin || (m.created || "") > lastReadByAdmin);
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", onClick: () => isUnread && markChatAsRead("admin"), style: isUnread ? { borderColor: "#fecaca", background: "#fff7f7", cursor: "pointer" } : void 0, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                m.by || "Ukjent",
                " ",
                m.role === "kunde" ? "\xB7 Kunde" : "\xB7 Utf\xF8rende"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                m.created ? new Date(m.created).toLocaleString("no-NO") : "",
                m.role === "kunde" ? isUnread ? " \xB7 Ulest for admin" : " \xB7 Lest av admin" : !lastReadByCustomer || (m.created || "") > lastReadByCustomer ? " \xB7 Ulest for kunde" : " \xB7 Lest av kunde"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: m.text }),
              m.imageUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: "10px" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: m.imageUrl, target: "_blank", rel: "noreferrer", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "img",
                  {
                    src: m.imageUrl,
                    alt: m.imageName || "Chat bilde",
                    style: { maxWidth: "280px", width: "100%", borderRadius: "12px", border: "1px solid #dbe7ec" }
                  }
                ) }),
                m.imageName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { style: { display: "block", marginTop: "6px" }, children: m.imageName })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: (e) => {
                e.stopPropagation();
                removeProjectLogMessage(m.id);
              }, children: "Fjern melding" })
            ] }, m.id);
          })
        ] }),
        tab === "internt" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Interne notater", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Dette feltet er kun internt. Det vises ikke i kundelink og tas ikke med i rapport." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Interne notater", value: internalNotes || "", onChange: setInternalNotes }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: saveProject, children: "Lagre interne notater" }) })
        ] }),
        tab === "prosjektliste" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Prosjektliste", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Her får du rask oversikt over aktive prosjekter, uleste kundemeldinger, bildedokumentasjon og snarveier til de vanligste arbeidsflatene." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cards projectListHeaderCards", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectListStats.total }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Totalt" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectListStats.active }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Aktive" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectListStats.unread }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ulest chat" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectListStats.finished }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Arkiv" })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item projectListSearchPanel", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Søk etter prosjekt, kunde, adresse, e-post, telefon, garantinr., ansvarlig eller produkt", value: projectSearch, onChange: setProjectSearch }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Statusfilter", value: projectStatusFilter, onChange: setProjectStatusFilter, options: ["alle", "draft", "progress", "waiting", "customer_ready", "deviation", "done", "locked"], optionLabels: { alle: "Alle", draft: "Utkast", progress: "Pågår", waiting: "Avventer", customer_ready: "Klar for kunde", deviation: "Avvik åpent", done: "Ferdigstilt", locked: "Arkivert / låst" } })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectListToolbar", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => loadProjects(authUser, true), children: "Oppdater" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: projectUnreadOnly ? "" : "secondary", onClick: () => setProjectUnreadOnly((v) => !v), children: projectUnreadOnly ? "Vis alle" : "Kun uleste" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: projectStatusFilter === "alle" ? "secondary" : "", onClick: () => setProjectStatusFilter("alle"), children: "Alle" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: projectStatusFilter === "progress" || projectStatusFilter === "open" ? "" : "secondary", onClick: () => setProjectStatusFilter(projectStatusFilter === "progress" || projectStatusFilter === "open" ? "alle" : "progress"), children: "Aktive" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: projectStatusFilter === "done" || projectStatusFilter === "locked" ? "" : "secondary", onClick: () => setProjectStatusFilter(projectStatusFilter === "done" || projectStatusFilter === "locked" ? "alle" : "done"), children: "Arkiv" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => {
                setProjectSearch("");
                setProjectStatusFilter("alle");
                setProjectUnreadOnly(false);
              }, children: "Nullstill" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
              "Viser ",
              projectListStats.visible,
              " av ",
              projectListStats.total,
              " prosjekter. Status: Åpen, Pågår, Ferdigstilt eller Avsluttet/låst."
            ] })
          ] }),
          projects.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "16px" }, children: "Ingen prosjekter hentet ennå. Trykk Oppdater." }),
          projects.length > 0 && filteredProjectListRows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "16px" }, children: "Ingen prosjekter matcher søket eller filteret." }),
          filteredProjectListRows.map(({ row: p, listProject, listStatus, unreadForAdminInList, latestMessage, imageSummary, openDeviationCount, productSummary, listWarranty, projectCompanyName, projectOwnerEmail }) => {
            const locationLine = [listProject.address, listProject.postnr, listProject.city].filter(Boolean).join(", ");
            const updatedLabel = p.updated_at || p.created_at ? new Date(p.updated_at || p.created_at).toLocaleString("no-NO") : "Ukjent";
            const latestChatLabel = latestMessage?.created ? new Date(latestMessage.created).toLocaleString("no-NO") : "Ingen meldinger";
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item projectListCard", style: unreadForAdminInList > 0 ? { borderColor: "#fecaca", background: "#fff7f7" } : void 0, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectListCardTop", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectListTitleBlock", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { style: { fontSize: "19px" }, children: p.title || listProject.projectName || "Uten navn" }),
                  listProject.customer && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { style: { margin: "6px 0 0" }, children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Kunde:" }),
                    " ",
                    listProject.customer
                  ] }),
                  projectCompanyName && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: ["🏢 ", projectCompanyName] }),
                  listProject.customerEmail && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: ["✉ ", listProject.customerEmail] }),
                  listProject.customerPhone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: ["☎ ", listProject.customerPhone] }),
                  locationLine && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: ["📍 ", locationLine] }),
                  isSystemAdminUser && projectOwnerEmail && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: ["👤 Prosjekteier: ", projectOwnerEmail] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectListBadges", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: `statusBadge status-${listStatus.tone}`, style: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 10px", borderRadius: "999px", fontWeight: 700, border: "1px solid #dbe7ec", width: "fit-content", ...statusStyle(listStatus.tone) }, children: [
                    listStatus.icon,
                    " ",
                    listStatus.label
                  ] }),
                  listWarranty?.enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "projectMiniBadge", style: { borderColor: listWarranty?.issued ? "#86efac" : "#fde68a", background: listWarranty?.issued ? "#ecfdf5" : "#fffbeb", color: listWarranty?.issued ? "#065f46" : "#92400e", fontWeight: 800 }, children: [
                    listWarranty?.issued ? `🛡️ Garanti ${getWarrantyYears(listWarranty)} år` : "🛡️ Garanti aktiv",
                    listWarranty?.guaranteeNumber ? ` · ${listWarranty.guaranteeNumber}` : ""
                  ] }),
                  unreadForAdminInList > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", onClick: () => openProjectById(p.id, "chat"), style: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 10px", borderRadius: "999px", fontWeight: 800, border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b", width: "fit-content", minHeight: "auto", boxShadow: "none" }, children: [
                    "💬 ",
                    unreadForAdminInList,
                    " ulest"
                  ] }),
                  openDeviationCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", onClick: () => openProjectById(p.id, "sjekklister", { showOpenDeviationsOnly: true }), style: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 10px", borderRadius: "999px", fontWeight: 800, border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b", width: "fit-content", minHeight: "auto", boxShadow: "none" }, children: [
                    "⚠️ ",
                    openDeviationCount,
                    " åpne avvik"
                  ] }),
                  productSummary.total > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "projectMiniBadge", children: [
                    "📦 ",
                    productSummary.total,
                    " produkter"
                  ] }),
                  imageSummary.total > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "projectMiniBadge", children: [
                    "📷 ",
                    imageSummary.total,
                    " bilder"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectImageCounts", style: { marginTop: "12px" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "projectMiniBadge", onClick: () => openProjectById(p.id, "produkter"), style: { cursor: "pointer", minHeight: "auto", boxShadow: "none" }, children: ["📦 Produkter: ", productSummary.total] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "projectMiniBadge", onClick: () => openProjectById(p.id, "sjekklister", { showOpenDeviationsOnly: openDeviationCount > 0 }), style: { cursor: "pointer", minHeight: "auto", boxShadow: "none", ...(openDeviationCount > 0 ? { borderColor: "#fecaca", background: "#fef2f2", color: "#991b1b" } : {}) }, children: ["⚠️ Åpne avvik: ", openDeviationCount] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "projectMiniBadge", onClick: () => openProjectById(p.id, "bilder"), style: { cursor: "pointer", minHeight: "auto", boxShadow: "none" }, children: ["📷 Bilder: ", imageSummary.total] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "projectMiniBadge", onClick: () => openProjectById(p.id, "chat"), style: { cursor: "pointer", minHeight: "auto", boxShadow: "none", ...(unreadForAdminInList > 0 ? { borderColor: "#fecaca", background: "#fef2f2", color: "#991b1b" } : {}) }, children: ["💬 Ulest chat: ", unreadForAdminInList] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cards projectListMetaCards", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Oppdatert" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: updatedLabel })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Siste chat" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: latestChatLabel })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Ansvarlig" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: listProject.responsible || "Ikke fylt ut" })
                ] })
              ] }),
              imageSummary.total > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectImageCounts", children: [
                  imageSummary.photos > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "projectMiniBadge", children: ["📁 Bilder: ", imageSummary.photos] }),
                  imageSummary.checklist > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "projectMiniBadge", children: ["✅ Sjekkliste: ", imageSummary.checklist] }),
                  imageSummary.install > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "projectMiniBadge", children: ["🧰 Fag/utstyr: ", imageSummary.install] }),
                  imageSummary.chat > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "projectMiniBadge", children: ["💬 Chat: ", imageSummary.chat] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectImageStrip", "aria-label": "Bildeoversikt for prosjekt", children: [
                  imageSummary.previews.map((img, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectImageThumb", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: img.url, alt: img.label || img.source || "Prosjektbilde" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: img.source })
                  ] }, `${p.id}-img-${index}`)),
                  imageSummary.total > imageSummary.previews.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectImageThumb", style: { display: "flex", alignItems: "center", justifyContent: "center", height: "58px", border: "1px dashed #c7d6dd", borderRadius: "12px", background: "#f8fafc", fontWeight: 800 }, children: [
                    "+",
                    imageSummary.total - imageSummary.previews.length
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "projectListActions projectListActionsV2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => openProjectById(p.id, "prosjekt"), children: "📂 Åpne" }),
                openDeviationCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { onClick: () => openProjectById(p.id, "sjekklister", { showOpenDeviationsOnly: true }), children: ["⚠️ Avvik (", openDeviationCount, ")"] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => openProjectById(p.id, "produkter"), children: "📦 Produkter" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => openProjectById(p.id, "bilder"), children: "📷 Bilder" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => openProjectById(p.id, "sjekklister"), children: "✅ Sjekklister" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => openProjectById(p.id, "rapport"), children: "📄 Rapport" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: unreadForAdminInList > 0 ? "" : "secondary", onClick: () => openProjectById(p.id, "chat"), children: unreadForAdminInList > 0 ? `💬 Chat (${unreadForAdminInList})` : "💬 Chat" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => deleteProject(p.id), children: "🗑️ Slett" })
              ] })
            ] }, p.id);
          })
        ] }),
        tab === "firmaadmin" && isCompanyAdminUser && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Firma", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Building2, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item companyAdminQuickStart", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Firmaadministrasjon" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
              "Her kan firmaadmin administrere ansatte i ",
              currentCompanyName || "eget firma",
              ". Firmaadmin kan administrere ansatte og se prosjekter i eget firma, men kan ikke endre Produktmaster eller systeminnstillinger."
            ] }),
            !currentCompanyName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { color: "#991b1b" }, children: "Firmaprofil mangler firmanavn. Gå til Firmaprofil og lagre firmanavn før du legger til ansatte." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => loadCompanyAdminData(true), children: companyAdminLoading ? "Henter firmaoversikt..." : "Oppdater firmaoversikt" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Legg til ansatt" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Legg inn e-postadressen til den ansatte. Hvis brukeren ikke finnes ennå, må vedkommende opprette konto med samme e-postadresse etterpå." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "E-post", value: newEmployeeEmail, placeholder: "navn@firma.no", onChange: setNewEmployeeEmail }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
                "Rolle",
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { value: newEmployeeRole, onChange: (e) => setNewEmployeeRole(e.target.value), children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "ansatt", children: "Ansatt" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "firmaadmin", children: "Firmaadmin" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: inviteCompanyEmployee, children: "Inviter ansatt" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Brukere i firma" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Endring av rolle og status lagres direkte når du bekrefter valget. Det finnes derfor ingen egen lagreknapp her." }),
            companyUsers.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen brukere hentet ennå. Trykk Oppdater firmaoversikt." }),
            companyUsers.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: u.email || "Ukjent e-post" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                "Rolle: ",
                u.system_role === "systemadmin" ? "Systemadmin" : u.company_role === "firmaadmin" ? "Firmaadmin" : "Ansatt",
                " · Status: ",
                u.deactivated ? "Deaktivert" : u.approved ? "Aktiv" : "Venter"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }, children: [
                u.system_role !== "systemadmin" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { value: u.company_role === "firmaadmin" ? "firmaadmin" : "ansatt", onChange: (e) => updateCompanyUserRole(u, e.target.value), style: { maxWidth: "220px" }, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "ansatt", children: "Ansatt" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "firmaadmin", children: "Firmaadmin" })
                ] }),
                !u.deactivated && u.id !== authUser?.id && u.system_role !== "systemadmin" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setCompanyUserDeactivated(u, true), children: "Deaktiver" }),
                u.deactivated && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => setCompanyUserDeactivated(u, false), children: "Reaktiver" })
              ] })
            ] }, u.id))
          ] }),
          (companyInvites || []).filter((invite) => (invite?.status || "pending") === "pending").length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Inviterte brukere" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Brukere som er invitert, men som ikke har registrert seg eller blitt aktivert i firmaet ennå." }),
            (companyInvites || []).filter((invite) => (invite?.status || "pending") === "pending").map((invite) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: invite.email }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                "Rolle: ",
                invite.company_role === "firmaadmin" ? "Firmaadmin" : "Ansatt",
                " · Status: Venter på registrering"
              ] })
            ] }, invite.id || invite.email))
          ] })
        ] }),
                tab === "garanti" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WarrantyPanel, { warranty, setWarranty, readiness: warrantyReadiness, issueWarranty, systems: soproWarrantySystems, goToTab, project, company, name, overtagelse, isProjectLocked, downloadClickablePdfReport }),
                tab === "rapport" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Report, { company, name, project, selected, manualProducts: manualSelected, other, surf, bathroomEquipment, photos, access, inst, files, checklist, tilbud, overtagelse, projectLog }),
                tab === "hjelp" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HelpCenter, { userGuidePdfPath, adminGuidePdfPath, isAdmin: isAdminUser, termsAccepted, termsAcceptanceRecord, authUser, formatTermsAcceptedAt }),
        tab === "admin" && canUseAdminProjectSync && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Systemadmin", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: isAdminUser ? "Her kan systemadministrator godkjenne brukere, vedlikeholde Produktmaster og synke aktive prosjekter mot Produktmaster. Låste prosjekter røres ikke." : "Her kan du synke åpnet prosjekt mot Produktmaster." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item adminAccordionItem", children: [
            adminAccordionButton("dokument", "Synk produktdokumenter", "Aktive prosjekter"),
            adminSectionIsOpen("dokument") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Synk produktdokumenter" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Oppdaterer FDV, datablad, DOP, EPD, sikkerhetsdatablad og produkt-/leverandørside på produkter som allerede er valgt i aktive prosjekter. Låste og arkiverte prosjekter blir ikke endret." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => syncActiveProjectsWithProductMaster(), children: "Synk aktive prosjekter med Produktmaster" }),
              projectId && !isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => syncCurrentProjectProducts(), children: "Synk kun åpnet prosjekt" })
            ] })
          ] })
          ] }),
          isAdminUser && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item adminAccordionItem", children: [
            adminAccordionButton("support", "Supportmodus", `${supportCompanies.length} firma · ${supportProjects.length} prosjekter`),
            adminSectionIsOpen("support") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Supportmodus" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Brukes av systemadministrator for å finne firmaer og åpne prosjekter ved support. Firmaadmin hos kunde får ikke tilgang til dette området." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap", margin: "12px 0" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => { loadAdminUsers(); loadProjects(authUser, true); }, children: "Oppdater supportdata" }),
              supportSelectedCompany && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => { setSupportSelectedCompany(""); setOpenSupportCompany(""); }, children: "Vis alle firma" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Søk firma", value: supportCompanySearch, placeholder: "Søk etter firmanavn", onChange: setSupportCompanySearch }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Søk prosjekt", value: supportProjectSearch, placeholder: "Søk prosjekt, kunde, adresse, e-post, telefon, firma, produkt eller garanti", onChange: setSupportProjectSearch })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cards projectListHeaderCards", style: { marginTop: "12px" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: supportCompanies.length }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Firma" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: supportProjects.length }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Prosjekter i visning" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: supportProjects.reduce((sum, item) => sum + Number(item.unreadForAdminInList || 0), 0) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ulest chat" })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { style: { marginTop: "18px" }, children: "Firmaoversikt" }),
            supportCompanies.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen firma funnet ennå. Trykk Oppdater supportdata." }),
            supportCompanies.slice(0, 20).map((entry) => {
              const entryIsOpen = openSupportCompany === entry.name;
              const entryProjects = supportProjects.filter((item) => normalizeSearchText(item?.projectCompanyName || "").trim() === normalizeSearchText(entry.name || "").trim()).slice(0, 30);
              const entryUsers = (adminUsers || []).filter((userRow) => String(userRow?.company_name || "").trim().toLowerCase() === String(entry.name || "").trim().toLowerCase());
              const entryAdmins = entryUsers.filter((userRow) => userRow?.company_role === "firmaadmin");
              const entryProfile = entryUsers.find((userRow) => userRow?.org_number || userRow?.phone || userRow?.address || userRow?.website || userRow?.logo_url) || entryUsers[0] || {};
              return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { background: entryIsOpen ? "#ecfeff" : "#fff" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: entry.name }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => {
                    const nextCompany = entryIsOpen ? "" : entry.name;
                    setOpenSupportCompany(nextCompany);
                    setSupportSelectedCompany(nextCompany);
                  }, children: entryIsOpen ? "Skjul prosjekter" : "Vis prosjekter" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                  "Brukere: ", entry.users,
                  " · Prosjekter: ", entry.projects,
                  " · Aktive: ", entry.activeProjects,
                  " · Ulest chat: ", entry.unread
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { style: { display: "block", marginTop: "4px", color: "#475569" }, children: [
                  "Firmaadmin: ", entryAdmins.map((userRow) => userRow.email).filter(Boolean).join(", ") || "Ikke satt",
                  entryProfile?.org_number ? ` · Org.nr: ${entryProfile.org_number}` : "",
                  entryProfile?.phone ? ` · Tlf: ${entryProfile.phone}` : "",
                  entryProfile?.address ? ` · Adresse: ${entryProfile.address}` : "",
                  entryProfile?.website ? ` · Web: ${entryProfile.website}` : ""
                ] }),
                entryIsOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: "14px", borderTop: "1px solid #dbeafe", paddingTop: "12px" }, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { style: { marginTop: 0 }, children: `Prosjekter hos ${entry.name}` }),
                  entryProjects.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: supportProjectSearch ? "Ingen prosjekter matcher søket for dette firmaet." : "Ingen prosjekter funnet for dette firmaet." }),
                  entryProjects.map((item) => {
                    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { background: "#fff" }, children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }, children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: item.listProject.projectName || item.row.title || "Uten navn" }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { style: { display: "block" }, children: [
                            item.listProject.customer ? `Kunde: ${item.listProject.customer}` : "Kunde ikke satt",
                            item.listProject.address ? ` · ${item.listProject.address}` : "",
                            item.listProject.customerEmail ? ` · ${item.listProject.customerEmail}` : "",
                            item.listProject.customerPhone ? ` · ${item.listProject.customerPhone}` : "",
                            item.listWarranty?.guaranteeNumber ? ` · Garanti: ${item.listWarranty.guaranteeNumber}` : ""
                          ] })
                        ] }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap" }, children: [
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => openProjectById(item.row.id, "prosjekt", { supportMode: true }), children: "Åpne" }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => openProjectById(item.row.id, "rapport", { supportMode: true }), children: "Rapport" }),
                          item.openDeviationCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => openProjectById(item.row.id, "sjekklister", { showOpenDeviationsOnly: true, supportMode: true }), children: "Avvik" })
                        ] })
                      ] }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                        "Status: ", item.listStatus.label,
                        " · Ansvarlig: ", item.listProject.responsible || "Ikke satt",
                        " · Prosjekteier: ", (adminUsers || []).find((userRow) => userRow?.id === item.row.user_id)?.email || item.row.user_id || "ukjent",
                        " · Oppdatert: ", item.row.updated_at ? new Date(item.row.updated_at).toLocaleString("no-NO") : "ukjent",
                        " · Ulest chat: ", item.unreadForAdminInList
                      ] })
                    ] }, item.row.id);
                  })
                ] })
              ] }, entry.name);
            }),
          ] })
          ] }),
          isAdminUser && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item adminAccordionItem", children: [
            adminAccordionButton("brukere", "Brukere og roller", `${visibleAdminUsers.length} vises`),
            adminSectionIsOpen("brukere") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Brukergodkjenning" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Kun systemadministrator kan godkjenne, deaktivere, reaktivere og korrigere firma-/rolleoppsett. Endringer i rolle og firma lagres direkte etter bekreftelse." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "10px", flexWrap: "wrap", margin: "12px 0" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: loadAdminUsers, children: adminLoading ? "Henter brukere..." : "Oppdater brukerliste" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: adminUserFilter === "pending" ? "" : "secondary", onClick: () => setAdminUserFilter("pending"), children: `Nye (${adminUserStats.pending})` }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: adminUserFilter === "approved" ? "" : "secondary", onClick: () => setAdminUserFilter("approved"), children: `Godkjente (${adminUserStats.approved})` }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: adminUserFilter === "deactivated" ? "" : "secondary", onClick: () => setAdminUserFilter("deactivated"), children: `Deaktiverte (${adminUserStats.deactivated})` }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: adminUserFilter === "systemadmin" ? "" : "secondary", onClick: () => setAdminUserFilter("systemadmin"), children: `Systemadmin (${adminUserStats.systemadmin})` }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: adminUserFilter === "all" ? "" : "secondary", onClick: () => setAdminUserFilter("all"), children: `Alle (${adminUserStats.all})` })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "10px", margin: "12px 0" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Søk bruker" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { value: adminUserSearch, onChange: (e) => setAdminUserSearch(e.target.value), placeholder: "Søk e-post, firma eller rolle" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Filtrer firma", value: adminUserCompanyFilter, options: registeredCompanyOptions, optionLabels: { "": "Alle firma" }, onChange: (v) => setAdminUserCompanyFilter(v) })
            ] }),
            adminUsers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: `${visibleAdminUsers.length} av ${adminUsers.length} brukere vises. Brukervilkår v${EXPO_PROFFDOK_TERMS_VERSION}: ${termsAcceptedCount} godkjent.` }),
            adminUsers.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "16px" }, children: "Ingen brukere hentet enn\xE5. Trykk Oppdater brukerliste." }),
            adminUsers.length > 0 && visibleAdminUsers.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "16px" }, children: "Ingen brukere matcher valgt søk/filter." }),
            visibleAdminUsers.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: u.email || "Ukjent e-post" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                u.company_name ? `Firma: ${u.company_name} \xB7 ` : "",
                u.system_role === "systemadmin" ? "Systemadmin \xB7 " : u.company_role ? `Rolle: ${u.company_role} \xB7 ` : "",
                "Status: ",
                u.deactivated ? "Deaktivert" : u.approved ? "Godkjent" : "Venter p\xE5 godkjenning"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { style: { display: "block", marginTop: "4px", color: getAdminTermsAcceptanceForUser(u) ? "#065f46" : "#9a3412", fontWeight: 800 }, children: [
                "Brukervilkår v",
                EXPO_PROFFDOK_TERMS_VERSION,
                ": ",
                getAdminTermsAcceptanceForUser(u) ? `Godkjent ${formatTermsAcceptedAt(getAdminTermsAcceptanceForUser(u).accepted_at)}` : "Ikke godkjent"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "10px", marginTop: "10px" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Firmarolle", value: u.company_role === "firmaadmin" ? "firmaadmin" : "ansatt", options: ["ansatt", "firmaadmin"], onChange: (v) => updateAdminUserCompanyRole(u, v) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
                  label: "Firma",
                  value: registeredCompanyOptions.includes(u.company_name || "") ? u.company_name || "" : "",
                  options: registeredCompanyOptions,
                  optionLabels: { "": u.company_name ? `${u.company_name} (ikke i registrerte firmaer)` : "Velg firma" },
                  onChange: (v) => updateAdminUserCompanyName(u, v)
                })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "10px" }, children: [
                !u.approved && !u.deactivated && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => approveAdminUser(u.id), children: "Godkjenn bruker" }),
                u.approved && !u.deactivated && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => deactivateAdminUser(u.id), children: "Deaktiver bruker" }),
                u.deactivated && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => reactivateAdminUser(u.id), children: "Reaktiver bruker" }),
                u.system_role === "systemadmin"
                  ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setAdminUserSystemAdmin(u, false), disabled: u.id === authUser?.id, children: u.id === authUser?.id ? "Din systemadmin-rolle" : "Fjern systemadmin" })
                  : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setAdminUserSystemAdmin(u, true), children: "Gjør til systemadmin" })
              ] })
            ] }, u.id))
          ] })
          ] }),
          isAdminUser && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item adminAccordionItem", children: [
            adminAccordionButton("produktmaster", "Produktmaster", `${visibleProductMasterRows.length} / ${productMasterStats.total || 0}`),
            adminSectionIsOpen("produktmaster") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Admin Produktmaster" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Dette er produktregisteret for dokumentasjon. Legg inn FDV, datablad, DOP, EPD og sikkerhetsdatablad her. N\xE5r et standardprodukt velges i prosjektet, henter appen dokumentlinker automatisk fra registeret." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cards projectListHeaderCards", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: productMasterStats.total }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Produkter/varianter" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: productMasterStats.appMatches }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Koblet mot app" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: productMasterStats.withDocs }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Med dokumenter" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: productMasterLoading ? "..." : "OK" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Status" })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "12px" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => loadProductMaster(true), children: productMasterLoading ? "Henter produktmaster..." : "Oppdater produktmaster" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => loadProductMasterCheckpoints(true), children: productMasterCheckpointLoading ? "Henter garantikontrollpunkter..." : "Oppdater garantikontrollpunkter" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { background: "#f8fafc" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Søk i Produktmaster", value: productMasterSearch, placeholder: "Søk på varenummer, produktnavn, kategori, farge eller dokumentlink", onChange: setProductMasterSearch }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", style: { marginTop: "8px" }, children: [
                "Viser ",
                visibleProductMasterRows.length,
                " av ",
                (productMaster || []).filter((row) => row.used_in_app_standard_list || hasValue(row.app_match_name) || hasValue(row.fdv_url) || hasValue(row.datablad_url) || hasValue(row.dop_url) || hasValue(row.epd_url) || hasValue(row.sikkerhetsdatablad_url) || hasValue(row.document_file_url)).length,
                " produkter/varianter."
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", style: { width: "100%", justifyContent: "space-between", textAlign: "left", fontWeight: 900, fontSize: "18px" }, onClick: () => setShowNewProductMasterForm((value) => !value), children: showNewProductMasterForm ? "▼ Nytt produkt" : "▶ Nytt produkt" }),
              showNewProductMasterForm && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "12px" }, children: "Bruk denne for nye produkter, for eksempel nye Sopro-silikoner, fuger eller systemprodukter. Hvis 'Vis i Produkter-fanen' er huket av, blir produktet tilgjengelig i valgt produktkategori uten kodeendring. Farger kan legges inn i feltet Fargekoder / varianter, for eksempel: 10 Hvit; 15 Grå; 34 Bahamabeige. Garantikontrollpunkter skal kun brukes for Sopro-produkter som inngår i garantiordningen." }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Varenummer", value: newProductMaster.product_no || "", onChange: (v) => setNewProductMaster((p) => ({ ...p, product_no: v })) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Produktnavn", value: newProductMaster.product_name || "", onChange: (v) => setNewProductMaster((p) => ({ ...p, product_name: v })) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Produktfamilie", value: newProductMaster.product_family || "", onChange: (v) => setNewProductMaster((p) => ({ ...p, product_family: v })) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Vis i produktkategori", value: newProductMaster.category || "Fugemasse / silikon", options: productCategoryOptions, onChange: (v) => setNewProductMaster((p) => ({ ...p, category: v })) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Fargekoder / varianter (skill med semikolon)", value: newProductMaster.color_code || "", onChange: (v) => setNewProductMaster((p) => ({ ...p, color_code: v })) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-link", value: newProductMaster.fdv_url || "", onChange: (v) => setNewProductMaster((p) => ({ ...p, fdv_url: v })) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Datablad", value: newProductMaster.datablad_url || "", onChange: (v) => setNewProductMaster((p) => ({ ...p, datablad_url: v })) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "DOP", value: newProductMaster.dop_url || "", onChange: (v) => setNewProductMaster((p) => ({ ...p, dop_url: v })) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "EPD", value: newProductMaster.epd_url || "", onChange: (v) => setNewProductMaster((p) => ({ ...p, epd_url: v })) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Sikkerhetsdatablad", value: newProductMaster.sikkerhetsdatablad_url || "", onChange: (v) => setNewProductMaster((p) => ({ ...p, sikkerhetsdatablad_url: v })) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Produkt-/leverandørside", value: newProductMaster.document_file_url || "", onChange: (v) => setNewProductMaster((p) => ({ ...p, document_file_url: v })) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Kommentar", value: newProductMaster.comment || "", onChange: (v) => setNewProductMaster((p) => ({ ...p, comment: v })) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { marginTop: "12px", display: "flex", alignItems: "center", gap: "10px", width: "fit-content", padding: "8px 0" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: !!newProductMaster.showInProducts, onChange: (e) => setNewProductMaster((p) => ({ ...p, showInProducts: e.target.checked })) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { lineHeight: "1.2" }, children: "Vis produktet i Produkter-fanen" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { marginTop: "12px", background: "#f8fafc" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "10px", width: "fit-content" }, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: !!newProductMaster.createCheckpoint, onChange: (e) => setNewProductMaster((p) => ({ ...p, createCheckpoint: e.target.checked, image_required: e.target.checked ? true : p.image_required, comment_required: e.target.checked ? true : p.comment_required })) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Legg til Sopro garantikontrollpunkt samtidig" })
                ] }),
                newProductMaster.createCheckpoint && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Fragment, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "8px" }, children: "Garantikontrollpunktet lagres på Sopro-produktet i Produktmaster og kobles inn i garantisjekklisten når garantien er aktivert og produktet er valgt. Garantipunkter krever status og dokumentasjon med bilde eller kommentar uansett om garantien er 10, 12 eller 15 år." }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Garantikontrollpunkttekst", value: newProductMaster.checkpoint_text || "", onChange: (v) => setNewProductMaster((p) => ({ ...p, checkpoint_text: v })) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Type", value: newProductMaster.checkpoint_type || "standard", options: productCheckpointTypeOptions, optionLabels: productCheckpointTypeLabels, onChange: (v) => setNewProductMaster((p) => ({ ...p, checkpoint_type: v })) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "System", value: newProductMaster.guarantee_system || "all", options: productCheckpointSystemOptions, optionLabels: productCheckpointSystemLabels, onChange: (v) => setNewProductMaster((p) => ({ ...p, guarantee_system: v })) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Sortering", type: "number", value: newProductMaster.sort_order || 0, onChange: (v) => setNewProductMaster((p) => ({ ...p, sort_order: v })) })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center", marginTop: "10px" }, children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px", width: "fit-content" }, children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: true, disabled: true, onChange: () => {} }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Bilde påkrevd" })
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px", width: "fit-content" }, children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: true, disabled: true, onChange: () => {} }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Kommentar påkrevd" })
                    ] })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "10px" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: createProductMasterRow, children: "Lagre nytt produkt" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setNewProductMaster(emptyNewProductMaster()), children: "Tøm skjema" })
              ] }),
                ] })
                ] }),
            (productMaster || []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen produkter funnet i produktmaster. Kontakt systemansvarlig hvis produktlisten mangler." }),
            (productMaster || []).length > 0 && visibleProductMasterRows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen produkter matcher søket." }),
            visibleProductMasterRows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: row.product_name }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                row.product_no,
                " \xB7 ",
                row.category || "Uten kategori",
                row.app_match_name ? ` \xB7 App: ${row.app_match_name}` : ""
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-link", value: row.fdv_url || "", onChange: (v) => updateProductMasterLocal(row.product_no, { fdv_url: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Datablad", value: row.datablad_url || "", onChange: (v) => updateProductMasterLocal(row.product_no, { datablad_url: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "DOP", value: row.dop_url || "", onChange: (v) => updateProductMasterLocal(row.product_no, { dop_url: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "EPD", value: row.epd_url || "", onChange: (v) => updateProductMasterLocal(row.product_no, { epd_url: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Sikkerhetsdatablad", value: row.sikkerhetsdatablad_url || "", onChange: (v) => updateProductMasterLocal(row.product_no, { sikkerhetsdatablad_url: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Vedlagt dokument / samlet PDF", value: row.document_file_url || "", onChange: (v) => updateProductMasterLocal(row.product_no, { document_file_url: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Kommentar", value: row.comment || "", onChange: (v) => updateProductMasterLocal(row.product_no, { comment: v }) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "10px" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => saveProductMasterRow(row), children: "Lagre dokumenter" }),
                row.updated_at && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                  "Sist oppdatert: ",
                  new Date(row.updated_at).toLocaleString("no-NO")
                ] })
              ] }),
              (isSoproGuaranteeProductMasterRow(row) || (productMasterCheckpointsByProduct[row.product_no] || []).length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: "14px" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => toggleProductCheckpointPanel(row.product_no), children: `${openProductCheckpointPanels?.[row.product_no] ? "Skjul" : "Vis / rediger"} Sopro garantikontrollpunkter (${(productMasterCheckpointsByProduct[row.product_no] || []).length})` }),
                openProductCheckpointPanels?.[row.product_no] && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { marginTop: "10px", background: "#f8fafc" }, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { style: { margin: "0 0 6px" }, children: "Sopro garantikontrollpunkter" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Her kan admin registrere ekstra Sopro garantikontrollpunkter som senere kan kobles mot garantimotoren. Tallet på knappen gjelder kun ekstra punkter som er registrert på produktet. Innebygde Sopro-garantipunkter som allerede ligger i appen telles ikke her." }),
                  (productMasterCheckpointsByProduct[row.product_no] || []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen ekstra Sopro garantikontrollpunkter registrert på dette produktet ennå. Produktet kan likevel være dekket av innebygde Sopro-garantipunkter i appen." }),
                  (productMasterCheckpointsByProduct[row.product_no] || []).map((checkpoint) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", style: { marginTop: "8px" }, children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: checkpoint.checkpoint_text }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                      productCheckpointTypeLabels[checkpoint.checkpoint_type] || checkpoint.checkpoint_type || "Standard kontrollpunkt",
                      " · ",
                      productCheckpointSystemLabels[checkpoint.guarantee_system] || checkpoint.guarantee_system || "Alle systemer",
                      " · Bilde påkrevd",
                      " · Kommentar påkrevd",
                      Number(checkpoint.sort_order || 0) ? ` · Sortering ${checkpoint.sort_order}` : ""
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", style: { marginTop: "8px" }, onClick: () => deleteProductMasterCheckpoint(checkpoint), children: "Slett garantikontrollpunkt" })
                  ] }, checkpoint.id || `${row.product_no}-${checkpoint.checkpoint_text}`)),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { style: { margin: "14px 0 8px" }, children: "+ Legg til Sopro garantikontrollpunkt" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Garantikontrollpunkttekst", value: productCheckpointDraft(row.product_no).checkpoint_text || "", onChange: (v) => updateProductCheckpointDraft(row.product_no, { checkpoint_text: v }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Type", value: productCheckpointDraft(row.product_no).checkpoint_type || "standard", options: productCheckpointTypeOptions, optionLabels: productCheckpointTypeLabels, onChange: (v) => updateProductCheckpointDraft(row.product_no, { checkpoint_type: v }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "System", value: productCheckpointDraft(row.product_no).guarantee_system || "all", options: productCheckpointSystemOptions, optionLabels: productCheckpointSystemLabels, onChange: (v) => updateProductCheckpointDraft(row.product_no, { guarantee_system: v }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Sortering", type: "number", value: productCheckpointDraft(row.product_no).sort_order || 0, onChange: (v) => updateProductCheckpointDraft(row.product_no, { sort_order: v }) })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center", marginTop: "10px" }, children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px", width: "fit-content" }, children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: !!productCheckpointDraft(row.product_no).image_required, onChange: (e) => updateProductCheckpointDraft(row.product_no, { image_required: e.target.checked }) }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Bilde påkrevd" })
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px", width: "fit-content" }, children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: !!productCheckpointDraft(row.product_no).comment_required, onChange: (e) => updateProductCheckpointDraft(row.product_no, { comment_required: e.target.checked }) }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Kommentar påkrevd" })
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => createProductMasterCheckpoint(row), children: "Lagre garantikontrollpunkt" })
                  ] })
                ] })
              ] })
            ] }, "pm-" + row.product_no))
          ] })
          ] })
        ] })
      ] }),
      projectId && tab !== "chat" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: unreadForAdmin > 0 ? "mobileChatFab hasUnread" : "mobileChatFab", onClick: () => goToTab("chat"), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "💬" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: unreadForAdmin > 0 ? `${unreadForAdmin} ulest` : totalChatCount > 0 ? `Chat ${totalChatCount}` : "Chat" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bottomAppNav", "aria-label": "Hovednavigasjon mobil", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: tab === "prosjektliste" ? "active" : "secondary", onClick: () => goToTab("prosjektliste"), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u{1F4C1}" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Liste" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: tab === "prosjekt" ? "active" : "secondary", onClick: () => goToTab("prosjekt"), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u270F\uFE0F" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Info" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: tab === "chat" ? "active" : "secondary", onClick: () => goToTab("chat"), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u{1F4AC}" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: unreadForAdmin > 0 ? `${unreadForAdmin}` : "Chat" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: tab === "bilder" ? "active" : "secondary", onClick: () => goToTab("bilder"), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u{1F4F7}" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Foto" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: tab === "rapport" ? "active" : "secondary", onClick: () => goToTab("rapport"), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u{1F4C4}" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "PDF" })
        ] })
      ] }),
      hasActiveProjectWorkspace && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bottomPrevNext", style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        maxWidth: "1180px",
        margin: "18px auto 28px",
        padding: "0 18px",
        flexWrap: "wrap"
      }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "button",
          {
            type: "button",
            className: "secondary",
            disabled: !previousTab,
            onClick: () => previousTab && goToTab(previousTab[0]),
            style: { flex: "1 1 150px" },
            children: [
              "\u2190 Forrige",
              previousTab ? `: ${previousTab[1]}` : ""
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "button",
          {
            type: "button",
            onClick: () => nextTab && goToTab(nextTab[0]),
            disabled: !nextTab,
            style: { flex: "1 1 150px" },
            children: [
              "Neste",
              nextTab ? `: ${nextTab[1]}` : "",
              " \u2192"
            ]
          }
        )
      ] })
    ] });
  }
  async function uploadChatImage(file, projectId = "uten-prosjekt", sender = "chat") {
    if (!file) return null;
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const ext = cleanName.includes(".") ? cleanName.split(".").pop() : "jpg";
    const safeProjectId = String(projectId || "uten-prosjekt").replace(/[^a-zA-Z0-9._-]/g, "-");
    const safeSender = String(sender || "chat").replace(/[^a-zA-Z0-9._-]/g, "-");
    const fileName = `${safeProjectId}/${safeSender}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await supabase.storage.from("chat-images").upload(fileName, file, { cacheControl: "3600", upsert: false });
    if (error) {
      console.error(error);
      alert("Kunne ikke laste opp bilde: " + error.message);
      return null;
    }
    const { data: publicData } = supabase.storage.from("chat-images").getPublicUrl(data.path);
    return {
      imageUrl: publicData.publicUrl,
      imageName: file.name,
      imagePath: data.path
    };
  }
  function Brand({ logo, name }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { width: "260px", height: "80px", overflow: "hidden", display: "flex", alignItems: "center" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: logo ? logo : "/expo-logo.png", alt: name || "Expo Proffsenter", style: { maxWidth: "100%", maxHeight: "100%", objectFit: "contain" } }) });
  }
  function ProjectWarrantySetup({ warranty, setWarranty, systems }) {
    const enabled = !!warranty?.enabled;
    const selectedSystem = systems.find((item) => item.id === warranty?.system);
    const setEnabled = (value) => {
      setWarranty({
        ...emptyWarranty(),
        ...warranty,
        enabled: !!value,
        system: value ? warranty?.system || "" : "",
        sintefApproval: value ? warranty?.sintefApproval || selectedSystem?.sintefApproval || "" : "",
        issued: value ? !!warranty?.issued : false,
        issuedAt: value ? warranty?.issuedAt || null : null,
        status: value ? warranty?.status || "draft" : "draft",
        durationYears: value ? getWarrantyYears(warranty) : WARRANTY_YEARS
      });
    };
    const updateSystem = (systemId) => {
      const system = systems.find((item) => item.id === systemId);
      setWarranty({
        ...emptyWarranty(),
        ...warranty,
        enabled: true,
        system: system?.id || "",
        sintefApproval: system?.sintefApproval || "",
        status: warranty?.issued ? "issued" : "draft",
        durationYears: getWarrantyYears(warranty)
      });
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item warrantyProjectSetup", style: { gridColumn: "1 / -1" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Dokumentert tetthetsgaranti" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Velg tidlig om prosjektet skal omfattes av dokumentert tetthetsgaranti. Hvis Ja velges aktiveres garantikravene og riktig Sopro-sjekkliste automatisk." }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "10px" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "radio", name: "projectWarrantyChoice", checked: enabled, onChange: () => setEnabled(true), style: { width: "auto", minHeight: "auto", padding: 0, margin: 0 } }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ja" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "radio", name: "projectWarrantyChoice", checked: !enabled, onChange: () => setEnabled(false), style: { width: "auto", minHeight: "auto", padding: 0, margin: 0 } }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Nei" })
        ] })
      ] }),
      enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: "12px" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Garantiperiode", value: String(getWarrantyYears(warranty)), options: WARRANTY_YEAR_OPTIONS.map(String), optionLabels: Object.fromEntries(WARRANTY_YEAR_OPTIONS.map((year) => [String(year), `${year} år`])), onChange: (value) => setWarranty({ ...emptyWarranty(), ...warranty, enabled: true, durationYears: Number(value) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Velg membransystem", value: warranty?.system || "", options: ["", ...systems.map((item) => item.id)], optionLabels: { "": "Velg Sopro-system", ...Object.fromEntries(systems.map((item) => [item.id, item.label])) }, onChange: updateSystem }),
        selectedSystem && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", style: { marginTop: "8px" }, children: [
          "Valgt system: ",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: selectedSystem.product }),
          " · ",
          selectedSystem.sintefApproval,
          ". Garantikravene vises automatisk i Sjekklister og Garanti."
        ] })
      ] }),
      !enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "8px" }, children: "Garantien er ikke aktivert. Prosjektet kan fortsatt dokumenteres som vanlig." })
    ] });
  }

  function WarrantyPanel({ warranty, setWarranty, readiness, issueWarranty, systems, goToTab, project = {}, company = {}, name = "Expo ProffDok", overtagelse = {}, isProjectLocked = false, downloadClickablePdfReport = null }) {
    const selectedSystem = systems.find((item) => item.id === warranty?.system);
    const goToWarrantyPoint = (point) => {
      if (!point) return;
      if (typeof goToTab === "function") goToTab("sjekklister");
      window.setTimeout(() => {
        const el = document.getElementById(point.anchorId || checklistPointAnchor(point.category, point.item));
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("checklistPointFocus");
          window.setTimeout(() => el.classList.remove("checklistPointFocus"), 2200);
        } else {
          alert("Gå til fanen Sjekklister og åpne riktig Sopro-kategori.");
        }
      }, 220);
    };
    const updateSystem = (systemId) => {
      const system = systems.find((item) => item.id === systemId);
      setWarranty({
        ...emptyWarranty(),
        ...warranty,
        system: system?.id || "",
        sintefApproval: system?.sintefApproval || "",
        status: warranty?.issued ? "issued" : "draft"
      });
    };
    const enabled = !!warranty?.enabled;
    // FASE 11D.8.1 HOTFIX:
    // Noen eksisterende prosjekter kan ha garantinummer/status lagret, selv om issued-flagget ikke er satt.
    // Visningen skal derfor tolke garanti som utstedt når issued=true, status=issued eller garantinummer finnes.
    const issued = !!warranty?.issued || warranty?.status === "issued" || hasValue(warranty?.guaranteeNumber);
    const warrantyYears = getWarrantyYears(warranty);
    const warrantyValidUntil = makeWarrantyValidUntil(overtagelse?.dato || project?.date || "", warranty);
    const warrantyStatusText = issued ? (warrantyValidUntil && new Date(warrantyValidUntil) < /* @__PURE__ */ new Date() ? "Utgått" : "Gyldig") : readiness?.ready ? "Klar til utstedelse" : "Ikke utstedt";
    const warrantyCanEdit = !isProjectLocked && !issued;
    const downloadWarrantyTermsPdf = async () => {
      try {
        const module = await import("https://esm.sh/jspdf@2.5.1");
        const JsPDF = module.jsPDF || module.default?.jsPDF;
        if (!JsPDF) throw new Error("Kunne ikke laste PDF-motor.");
        const doc = new JsPDF({ unit: "mm", format: "a4", compress: true });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 16;
        const contentWidth = pageWidth - margin * 2;
        let y = 18;
        const addTitle = (text, size = 18) => { doc.setFont("helvetica", "bold"); doc.setFontSize(size); doc.setTextColor(12, 42, 82); doc.text(text, margin, y); y += size === 18 ? 12 : 8; };
        const addText = (text, opts = {}) => { doc.setFont("helvetica", opts.bold ? "bold" : "normal"); doc.setFontSize(opts.size || 9); doc.setTextColor(31, 41, 55); const lines = doc.splitTextToSize(String(text || ""), contentWidth); if (y + lines.length * 4.6 > pageHeight - 18) { doc.addPage(); y = 18; } doc.text(lines, margin, y); y += lines.length * 4.6 + 4; };
        const addSection = (heading, body) => { addTitle(heading, 12); addText(body); };
        doc.setFillColor(248, 250, 252); doc.rect(0, 0, pageWidth, pageHeight, "F"); doc.setFillColor(255,255,255); doc.roundedRect(9, 9, pageWidth-18, pageHeight-18, 4, 4, "F");
        addTitle(`Garantivilkår – ${warrantyYears} års dokumentert tetthetsgaranti`, 18);
        addText(`Prosjekt: ${project?.projectName || project?.address || "Ikke oppgitt"}`, { bold: true });
        addText(`Kunde: ${project?.customer || "Ikke oppgitt"} · Utførende: ${name || company?.companyName || "Ikke oppgitt"}`);
        addText(`System: ${selectedSystem ? selectedSystem.product + " · " + selectedSystem.sintefApproval : warranty?.sintefApproval || "Ikke valgt"}`);
        addSection("1. Garantien", `Garantien gjelder tettheten i det dokumenterte membransystemet i ${warrantyYears} år fra dato for signert overtagelse. Garantien gjelder kun for det arbeidet som er dokumentert i Expo ProffDok.`);
        addSection("2. Forutsetninger", "Garantien forutsetter at godkjent Sopro-system er valgt, sjekklister og garantipunkter er fullført, nødvendig bildedokumentasjon foreligger, alle avvik er lukket og komplett sluttrapport er generert og arkivert.");
        addSection("3. Hva garantien omfatter", "Garantien omfatter dokumenterte feil i membransystemets tetthet når feilen skyldes utførelse eller installasjon av det dokumenterte systemet.");
        addSection("4. Hva garantien ikke omfatter", "Garantien omfatter ikke mekanisk skade, påboring, inngrep i konstruksjonen, skader etter overtagelse, brann, naturhendelser, manglende vedlikehold eller arbeider utført av andre etter overtagelse.");
        addSection("5. Varsling", "Forhold som kan omfattes av garantien skal meldes til garantigiver uten ugrunnet opphold etter at forholdet er oppdaget.");
        addSection("6. Dokumentasjon og arkiv", "Garantibeviset er gyldig sammen med komplett prosjekt­dokumentasjon, inkludert bilder, sjekklister, produktdokumentasjon og signert overtagelse. Utførende firma er ansvarlig for langsiktig arkivering.");
        addTitle("Kvittering for mottak", 12);
        addText(`Mottatt og akseptert av: ${warranty?.termsReceiptName || warranty?.termsAcceptedBy || "________________________"}`);
        addText(`Rolle: ${warranty?.termsReceiptRole || "Kunde"}     Dato: ${warranty?.termsAcceptedAt ? new Date(warranty.termsAcceptedAt).toLocaleString("no-NO") : "________________"}`);
        addText("Signatur: _______________________________________________");
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i += 1) { doc.setPage(i); doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(100,116,139); doc.text(`Expo ProffDok · Garantivilkår ${warrantyYears} år`, pageWidth / 2, pageHeight - 8, { align: "center" }); doc.text(`${i}/${pageCount}`, pageWidth - margin, pageHeight - 8, { align: "right" }); }
        doc.save(warrantyTermsPdfFileName);
      } catch (error) {
        alert("Kunne ikke lage garantivilkår-PDF: " + (error?.message || String(error)));
      }
    };
    const acceptWarrantyTerms = () => {
      const receiptName = (warranty?.termsReceiptName || project?.customer || "").trim();
      if (!receiptName) return alert("Fyll inn navn på den som bekrefter mottak av garantivilkår.");
      setWarranty({ ...emptyWarranty(), ...warranty, termsAccepted: true, termsAcceptedAt: new Date().toISOString(), termsAcceptedBy: receiptName, termsReceiptName: receiptName, termsReceiptRole: warranty?.termsReceiptRole || "Kunde" });
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: enabled ? `${warrantyYears} års dokumentert tetthetsgaranti` : "Dokumentert tetthetsgaranti", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Garantien er valgfri og kan bare utstedes når overtagelse er signert, alle avvik er lukket, sjekklister er fullført, bildedokumentasjon er lastet opp og godkjent Sopro-system er valgt." }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "10px" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", style: { width: "auto", minHeight: "auto", padding: 0, margin: 0 }, checked: enabled, disabled: !warrantyCanEdit, onChange: (e) => setWarranty({ ...emptyWarranty(), ...warranty, enabled: e.target.checked, system: e.target.checked ? warranty?.system || "" : "", sintefApproval: e.target.checked ? warranty?.sintefApproval || "" : "", issued: e.target.checked ? issued : false, issuedAt: e.target.checked ? warranty?.issuedAt || null : null, status: e.target.checked ? issued ? "issued" : "draft" : "draft" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Aktiver dokumentert tetthetsgaranti for dette prosjektet" })
        ] }),
        !enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Garantien er ikke aktivert. Prosjektet kan fortsatt dokumenteres som vanlig uten garanti." })
      ] }),
      enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Godkjent Sopro-system", value: warranty?.system || "", disabled: !warrantyCanEdit, options: ["", ...systems.map((item) => item.id)], optionLabels: { "": "Velg Sopro-system", ...Object.fromEntries(systems.map((item) => [item.id, item.label])) }, onChange: updateSystem }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "SINTEF Teknisk Godkjenning", value: selectedSystem?.sintefApproval || warranty?.sintefApproval || "", onChange: (v) => setWarranty({ ...emptyWarranty(), ...warranty, sintefApproval: v }), disabled: true }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Garantiperiode", value: String(warrantyYears), disabled: !warrantyCanEdit, options: WARRANTY_YEAR_OPTIONS.map(String), optionLabels: Object.fromEntries(WARRANTY_YEAR_OPTIONS.map((year) => [String(year), `${year} år`])), onChange: (value) => setWarranty({ ...emptyWarranty(), ...warranty, enabled: true, durationYears: Number(value) }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Status", value: warrantyStatusText, onChange: () => {}, disabled: true })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: warranty?.termsAccepted ? { borderColor: "#bbf7d0", background: "#ecfdf5" } : { borderColor: "#fde68a", background: "#fffbeb" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: `📑 Garantivilkår ${warrantyYears} år` }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Garantivilkår aksepteres automatisk når kunden signerer overtagelsen og prosjektet fullføres. Kunden trenger ikke signere eller bekrefte vilkår et eget sted." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Mottaker", value: warranty?.termsReceiptName || overtagelse?.signKunde || project?.customer || "Kunde", disabled: true, onChange: () => {} }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Kvitteringsstatus", value: warranty?.termsAccepted || readiness?.termsAccepted ? `Bekreftet sammen med overtagelse${warranty?.termsAcceptedAt ? " " + new Date(warranty.termsAcceptedAt).toLocaleString("no-NO") : ""}` : "Bekreftes automatisk ved fullført overtagelse", disabled: true, onChange: () => {} })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: downloadWarrantyTermsPdf, children: "⬇ Last ned garantivilkår PDF" }),
            !(warranty?.termsAccepted || readiness?.termsAccepted) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => goToTab && goToTab("overtagelse"), children: "Gå til overtagelse for signering" })
          ] })
        ] }),
        (issued || isProjectLocked) && enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item warrantyArchiveCard", style: { borderColor: issued ? "#bbf7d0" : "#cbd5e1", background: issued ? "#ecfdf5" : "#f8fafc" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "📄 Garantidokument i arkiv" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: issued ? "Dette garantidokumentet er lagret på prosjektet og vises også når prosjektet er arkivert/låst." : "Prosjektet er arkivert/låst, men garantien er ikke utstedt. Garantidokument vises først når garantien er utstedt." }),
          issued && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Garantinummer" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: warranty?.guaranteeNumber || "Ikke tildelt" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Status" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: warrantyStatusText })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Utstedt" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: warranty?.issuedAt ? new Date(warranty.issuedAt).toLocaleDateString("no-NO") : "Ikke oppgitt" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Gyldig til" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: warrantyValidUntil || `${warrantyYears} år fra overtakelse` })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Prosjekt" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project?.projectName || project?.address || "Ikke oppgitt" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Kunde" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project?.customer || "Ikke oppgitt" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Utførende firma" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: `${name || company?.companyName || "Ikke oppgitt"}${company?.orgNumber ? " · Org.nr. " + company.orgNumber : ""}` })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Membransystem" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: selectedSystem ? `${selectedSystem.product} · ${selectedSystem.sintefApproval}` : warranty?.sintefApproval || "Ikke oppgitt" })
            ] })
          ] }),
          issued && selectedSystem?.sintefUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: `SINTEF Teknisk Godkjenning: ${selectedSystem.sintefApproval}. Komplett garantibevis tas med i PDF fra Rapport-fanen også etter at prosjektet er låst/arkivert.` })
        ] }),
        selectedSystem && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item warrantyProgressCard", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "🛡️ Garantipunkter for valgt Sopro-system" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
            "Valgt system legger automatisk inn egne kontrollpunkter i fanen Sjekklister. Overlappende generelle membran-/primerpunkter skjules i visningen når garanti er aktivert, slik at samme kontroll ikke må vurderes to ganger. Punktene merkes med 🛡️ Garantipunkt. Status: ",
            readiness?.systemChecklistDone || 0,
            " av ",
            readiness?.systemChecklistTotal || 0,
            " garantipunkter fullført · ",
            readiness?.systemChecklistPercent || 0,
            "%."
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "checklistProgress warrantyProgress", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { width: `${readiness?.systemChecklistPercent || 0}%` } }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: selectedSystem.id === "sopro-aeb-815" ? "Grunnlaget er Sopro AEB 815 foliemembran med SINTEF TG 20918." : "Grunnlaget er Sopro FDF 525/527 smøremembran med SINTEF TG 20987." }),
          (readiness?.missingSystemChecklistPoints || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "warrantyMissingList", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Manglende garantipunkter:" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "warrantyMissingButtons", children: readiness.missingSystemChecklistPoints.map((point) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary warrantyJumpButton", onClick: () => goToWarrantyPoint(point), children: `Gå til: ${point.item}` }, point.anchorId)) })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: readiness?.ready ? { borderColor: "#bbf7d0", background: "#ecfdf5" } : { borderColor: "#fecaca", background: "#fff7f7" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: readiness?.ready ? "Klar til garanti" : "Ikke klar til garanti" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistSummaryBadges", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: readiness?.overtagelseSigned ? "✅ Overtagelse signert" : "⚠️ Overtagelse mangler" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: readiness?.openDeviationCount === 0 ? "✅ Ingen åpne avvik" : `⚠️ ${readiness?.openDeviationCount || 0} åpne avvik` }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: readiness?.checklistComplete ? "✅ Sjekklister fullført" : `⚠️ ${readiness?.checklistDone || 0}/${readiness?.checklistTotal || 0} sjekklistepunkter` }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: readiness?.hasPhotos ? "✅ Bilder lastet opp" : "⚠️ Bilder mangler" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: issued ? readiness?.reportGenerated ? "✅ Komplett PDF generert" : "⚠️ Last ned komplett PDF nå" : "ℹ️ PDF lages etter garanti" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: readiness?.termsAccepted ? "✅ Vilkår akseptert" : "⚠️ Garantivilkår mangler" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: readiness?.approvedSoproSystemSelected ? "✅ Sopro-system valgt" : "⚠️ Sopro-system mangler" }),
            readiness?.approvedSoproSystemSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: readiness?.systemChecklistComplete ? "✅ Sopro-punkter fullført" : `⚠️ ${readiness?.systemChecklistDone || 0}/${readiness?.systemChecklistTotal || 0} Sopro-punkter` })
          ] }),
          (readiness?.missing || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: "12px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Mangler før garanti kan utstedes:" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: readiness.missing.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: item }, item)) })
          ] }),
          issued && warranty?.issuedAt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
            "Garantien er markert som utstedt ",
            new Date(warranty.issuedAt).toLocaleString("no-NO"),
            "."
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Grunnlag for garantien" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Garantien bygger på dokumentert utførelse med valgt Sopro-system, fullførte sjekklister, lukket avvikshåndtering, bildedokumentasjon og signert overtagelse. Når garantien er utstedt, legges garantibevis og garantivilkår automatisk bakerst i den komplette PDF-rapporten. Last derfor ned komplett PDF etter at garantien er utstedt." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: warrantyArchiveNotice }),
          warranty?.reportGeneratedAt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
            "Sist genererte komplette PDF-rapport: ",
            new Date(warranty.reportGeneratedAt).toLocaleString("no-NO"),
            warranty?.reportGeneratedFileName ? ` · ${warranty.reportGeneratedFileName}` : ""
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: !readiness?.ready || issued || isProjectLocked, onClick: issueWarranty, children: issued ? "✅ Garanti utstedt" : isProjectLocked ? "Garanti kan ikke utstedes i låst prosjekt" : `Utsted ${warrantyYears} års tetthetsgaranti` }),
          issued && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => { if (typeof downloadClickablePdfReport === "function") downloadClickablePdfReport(); else alert("PDF-funksjonen er ikke klar. Gå til Rapport-fanen og trykk Last ned PDF."); }, children: "⬇ Last ned garantibevis / komplett PDF" }),
          issued && !isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setWarranty({ ...emptyWarranty(), ...warranty, issued: false, issuedAt: null, status: "draft" }), children: "Trekk tilbake utstedelse" })
        ] })
      ] })
    ] });
  }

  function AppInstallGuide({ compact = false } = {}) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { marginTop: compact ? "16px" : void 0, background: "#f8fdff" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "📱 Legg Expo ProffDok på hjemskjermen" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "For rask tilgang ute på byggeplass anbefaler vi å legge Expo ProffDok på hjemskjermen på mobilen. Da kan løsningen åpnes mer som en vanlig app." }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { style: { marginTop: "8px" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "iPhone:" }),
          " Åpne i Safari, trykk Del-knappen, velg Legg til på Hjem-skjerm og trykk Legg til."
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Android:" }),
          " Åpne i Chrome, trykk menyen ⋮, velg Legg til på startskjermen eller Installer app, og bekreft."
        ] }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Tips: Bruk Safari på iPhone og Chrome på Android for best resultat." })
    ] });
  }

  function HelpCenter({ userGuidePdfPath: guidePath = userGuidePdfPath, adminGuidePdfPath: adminPath = adminGuidePdfPath, isAdmin = false, termsAccepted = false, termsAcceptanceRecord = null, authUser = null, formatTermsAcceptedAt = (value) => value || "" }) {
    const openPdf = (url) => {
      if (!url) return;
      window.open(url, "_blank", "noopener,noreferrer");
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Hjelp og dokumentasjon", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: isAdmin ? "Her finner du brukerveiledning, admin-veiledning og anbefalte arbeidsrutiner for Expo ProffDok." : "Her finner du brukerveiledning og anbefalte arbeidsrutiner for Expo ProffDok." }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "📖 Brukerveiledning v1.0" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Komplett brukerveiledning for ordinære brukere, prosjektledere, utførende og dokumentasjonsansvarlige." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "10px", flexWrap: "wrap" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => openPdf(guidePath), children: "Åpne PDF" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: guidePath, download: true, style: { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "10px 14px", borderRadius: "12px", border: "1px solid #cbd5e1", textDecoration: "none", fontWeight: 800, color: "#1456a0", background: "#fff" }, children: "Last ned" })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "📄 Brukervilkår og personvern" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
              "Gjeldende versjon: ",
              EXPO_PROFFDOK_TERMS_VERSION,
              ". Brukeren må godkjenne disse ved første innlogging eller når vilkårene oppdateres."
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "item", style: { maxHeight: "280px", overflowY: "auto", background: "#f8fafc" }, children: expoProffDokTermsSections.map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginBottom: "12px" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: section.title }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "4px" }, children: section.text })
            ] }, section.title)) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { background: termsAccepted ? "#ecfdf5" : "#fff7ed", borderColor: termsAccepted ? "#bbf7d0" : "#fed7aa" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: termsAccepted ? "✅ Godkjent av innlogget bruker" : "⚠️ Ikke godkjent i denne økten" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { style: { display: "block", marginTop: "6px" }, children: [
                "Bruker: ",
                authUser?.email || termsAcceptanceRecord?.email || "Ukjent",
                " · Versjon: ",
                termsAcceptanceRecord?.version || EXPO_PROFFDOK_TERMS_VERSION,
                termsAcceptanceRecord?.accepted_at ? ` · Godkjent: ${formatTermsAcceptedAt(termsAcceptanceRecord.accepted_at)}` : ""
              ] })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppInstallGuide, {}),
          isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "🛠️ Admin-veiledning" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Kort veiledning for administratorer. Brukes ved godkjenning av brukere, produktmaster, garantikontrollpunkter og systemadministrasjon." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "10px", flexWrap: "wrap" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => openPdf(adminPath), children: "Åpne PDF" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: adminPath, download: true, style: { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "10px 14px", borderRadius: "12px", border: "1px solid #cbd5e1", textDecoration: "none", fontWeight: 800, color: "#1456a0", background: "#fff" }, children: "Last ned" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Anbefalt arbeidsflyt" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Opprett prosjekt og fyll inn kunde/adresse før arbeid starter." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Velg garanti tidlig hvis prosjektet skal omfattes av dokumentert tetthetsgaranti." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Registrer produkter, bilder og sjekklister fortløpende." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Lukk avvik før overtagelse og generer komplett PDF-rapport." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Lagre alltid ferdig PDF i eget arkivsystem." })
          ] })
        ] })
      ] })
    ] });
  }

  function Section({ title, icon, children }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: [
        icon,
        title
      ] }),
      children
    ] });
  }
  function CollapsibleBlock({ title, children, defaultOpen = true }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { className: "collapsibleBlock", open: defaultOpen, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", { children: title }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "collapsibleBlockBody", children })
    ] });
  }
  function Grid({ children }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "grid", children });
  }
  function ProductReportDocumentSelector({ doc = {}, productName, updateProductDoc }) {
    const availableOptions = productReportDocumentOptions.filter((option) => hasValue(doc?.[option.field]));
    if (!availableOptions.length) return null;
    const hasChoice = hasProductReportChoice(doc);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { background: "#f8fafc", borderStyle: "dashed", marginTop: "10px" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Dokumenter som skal vises i rapport" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Kryss av kun dokumentene som er relevante for kunden. Lenker beholdes i prosjektet selv om de ikke vises i PDF." }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "flex", flexWrap: "wrap", gap: "10px" }, children: availableOptions.map((option) => {
        const choiceKey = `include${option.key}InReport`;
        const checkedValue = doc?.[choiceKey] !== false;
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "inline-flex", alignItems: "center", gap: "7px", width: "auto", margin: 0 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", style: { width: "auto", minHeight: "auto", padding: 0, margin: 0 }, checked: checkedValue, onChange: (e) => updateProductDoc(productName, { [choiceKey]: e.target.checked }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: option.label })
        ] }, option.key);
      }) })
    ] });
  }

  function stopInteractivePropagation(event) {
    event.stopPropagation();
  }
  function Input({ label, value, onChange, type = "text", onKeyDown, autoComplete, disabled = false }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { onClick: stopInteractivePropagation, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type, value, autoComplete, onKeyDown, disabled, onClick: stopInteractivePropagation, onMouseDown: stopInteractivePropagation, onTouchStart: stopInteractivePropagation, onChange: (e) => !disabled && onChange(e.target.value) })
    ] });
  }
  function Textarea({ label, value, onChange }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { onClick: stopInteractivePropagation, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", { value, onClick: stopInteractivePropagation, onMouseDown: stopInteractivePropagation, onTouchStart: stopInteractivePropagation, onChange: (e) => onChange(e.target.value) })
    ] });
  }
  function Select({ label, value, onChange, options, optionLabels = {} }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { onClick: stopInteractivePropagation, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", { value, onClick: stopInteractivePropagation, onMouseDown: stopInteractivePropagation, onTouchStart: stopInteractivePropagation, onChange: (e) => onChange(e.target.value), children: options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: o, children: optionLabels[o] || o }, o)) })
    ] });
  }
  function PhotoGrid({ photos, setPhotos }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos", children: photos.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: p.url, draggable: false }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: p.cat }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: p.created }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", { placeholder: "Kommentar", value: p.comment, onClick: stopInteractivePropagation, onMouseDown: stopInteractivePropagation, onTouchStart: stopInteractivePropagation, onChange: (e) => setPhotos(photos.map((x) => x.id === p.id ? { ...x, comment: e.target.value } : x)) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { className: "secondary", onClick: () => setPhotos(photos.filter((x) => x.id !== p.id)), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Trash2, { size: 16 }),
        " Fjern"
      ] })
    ] }, p.id)) });
  }
  function ProjectInformationReadOnly({ project }) {
    const fields = [
      ["Prosjektnavn", project?.projectName],
      ["Adresse", [project?.address, project?.postnr, project?.city].filter(Boolean).join(" ")],
      ["Prosjektansvarlig", project?.responsible],
      ["Kunde", project?.customer],
      ["Kunde e-post", project?.customerEmail],
      ["Kunde telefon", project?.customerPhone],
      ["Dato", project?.date]
    ].filter(([, value]) => hasValue(value));
    const hasDescription = hasValue(project?.projectDescription);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Prosjektinformasjon/beskrivelse", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ClipboardCheck, {}), children: [
      fields.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, { children: fields.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label, value }, label)) }),
      hasDescription ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", style: { marginTop: "14px" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Beskrivelse / nødvendig prosjektinformasjon" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { whiteSpace: "pre-wrap" }, children: project.projectDescription })
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Prosjektleder har ikke lagt inn egen prosjektbeskrivelse ennå." })
    ] });
  }
  function ChecklistEditor({ checklist, setChecklistValue, addChecklistPhoto, addFiles, files, setFiles, closedByName = "Utførende", showOpenDeviationsOnly = false, setShowOpenDeviationsOnly = null, warranty = {}, activeChecklistTemplate: providedActiveChecklistTemplate = null, onSaveChecklistNow = null, checklistSaveStatus = "" }) {
    const activeChecklistTemplate = providedActiveChecklistTemplate || getActiveChecklistTemplate(warranty);
    const [openCategories, setOpenCategories] = import_react.default.useState(() => {
      const firstMissingGroup = activeChecklistTemplate.find((group) => (group.items || []).some((item) => !hasValue(checklist?.[group.category]?.[item]?.status)));
      return { [firstMissingGroup?.category || activeChecklistTemplate[0]?.category || ""]: true };
    });
    const mobileInitialChecklistJumpRef = import_react.default.useRef(false);
    import_react.default.useEffect(() => {
      if (!showOpenDeviationsOnly) return;
      const openGroups = Object.fromEntries(activeChecklistTemplate.map((group) => [
        group.category,
        group.items.some((item) => checklist?.[group.category]?.[item]?.status === "Avvik")
      ]));
      setOpenCategories(openGroups);
    }, [showOpenDeviationsOnly, checklist]);
    const groupHasOpenDeviation = (group) => group.items.some((item) => checklist?.[group.category]?.[item]?.status === "Avvik");
    const visibleChecklistGroups = showOpenDeviationsOnly ? activeChecklistTemplate.filter(groupHasOpenDeviation) : activeChecklistTemplate;
    const flatChecklistPoints = activeChecklistTemplate.flatMap((group) => (group.items || []).map((item) => ({ category: group.category, item, anchorId: checklistPointAnchor(group.category, item) })));
    const firstIncompletePoint = flatChecklistPoints.find((point) => !hasValue(checklist?.[point.category]?.[point.item]?.status));
    const scrollToChecklistPoint = (point, block = "start") => {
      if (!point) return;
      setOpenCategories((prev) => ({ ...prev, [point.category]: true }));
      window.setTimeout(() => {
        const el = document.getElementById(point.anchorId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: window.innerWidth <= 700 ? block : "center" });
          el.classList.add("checklistPointFocus");
          window.setTimeout(() => el.classList.remove("checklistPointFocus"), 1600);
        }
      }, 180);
    };
    import_react.default.useEffect(() => {
      try {
        const rawTarget = window.sessionStorage.getItem("expoProffDokChecklistJumpTarget");
        if (!rawTarget) return;
        window.sessionStorage.removeItem("expoProffDokChecklistJumpTarget");
        const targetPoint = JSON.parse(rawTarget);
        if (!targetPoint?.category || !targetPoint?.item) return;
        scrollToChecklistPoint({
          category: targetPoint.category,
          item: targetPoint.item,
          anchorId: targetPoint.anchorId || checklistPointAnchor(targetPoint.category, targetPoint.item)
        }, "start");
      } catch (error) {
        console.warn("Kunne ikke hoppe til sjekkpunkt:", error);
      }
    }, []);
    import_react.default.useEffect(() => {
      if (mobileInitialChecklistJumpRef.current) return;
      if (showOpenDeviationsOnly) return;
      if (typeof window === "undefined" || window.innerWidth > 700) return;
      if (!firstIncompletePoint) return;
      mobileInitialChecklistJumpRef.current = true;
      scrollToChecklistPoint(firstIncompletePoint, "start");
    }, [firstIncompletePoint?.anchorId, showOpenDeviationsOnly]);
    const scrollToNextChecklistPoint = (category, item) => {
      const index = flatChecklistPoints.findIndex((point) => point.category === category && point.item === item);
      const nextPoint = flatChecklistPoints.slice(index + 1).find((point) => !hasValue(checklist?.[point.category]?.[point.item]?.status)) || flatChecklistPoints[index + 1];
      if (!nextPoint) return;
      scrollToChecklistPoint(nextPoint, "start");
    };
    const handleStatusClick = (category, item, status) => {
      const currentValue = checklist?.[category]?.[item] || {};
      const hasWarrantyDocumentation = (currentValue?.photos || []).some((photo) => hasValue(photo?.url)) || hasValue(currentValue?.comment);
      const isWarrantyCheckpoint = isSoproWarrantyPoint(category);
      setChecklistValue(category, item, { status }, { autoSave: true });
      if (status !== "Avvik" && isWarrantyCheckpoint && !hasWarrantyDocumentation) {
        alert("Garantipunktet må dokumenteres med bilde eller kommentar før du går videre til neste punkt.");
        scrollToChecklistPoint({ category, item, anchorId: checklistPointAnchor(category, item) }, "start");
        return;
      }
      if (status !== "Avvik") scrollToNextChecklistPoint(category, item);
    };
    const stopChecklistFileDragNavigation = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    const handleChecklistPhotoDrop = (category, item, event) => {
      event.preventDefault();
      event.stopPropagation();
      const droppedFiles = event?.dataTransfer?.files;
      if (droppedFiles && droppedFiles.length) addChecklistPhoto(category, item, droppedFiles);
    };
    const handleChecklistAttachmentDrop = (event) => {
      event.preventDefault();
      event.stopPropagation();
      const droppedFiles = event?.dataTransfer?.files;
      if (droppedFiles && droppedFiles.length) addFiles(droppedFiles);
    };
    const updateChecklistAttachmentFile = (fileId, patch = {}) => {
      setFiles((prev) => (prev || []).map((file) => file.id === fileId ? { ...file, ...patch } : file));
    };
    const groupStats = (group) => {
      const total = group.items.length;
      const done = group.items.filter((item) => hasValue(checklist?.[group.category]?.[item]?.status)).length;
      const deviations = group.items.filter((item) => checklist?.[group.category]?.[item]?.status === "Avvik").length;
      const closedDeviations = group.items.filter((item) => checklist?.[group.category]?.[item]?.status === "Lukket avvik").length;
      const photos = group.items.reduce((sum, item) => sum + (checklist?.[group.category]?.[item]?.photos || []).length, 0);
      return { total, done, missing: Math.max(0, total - done), deviations, closedDeviations, photos };
    };
    const totalStats = activeChecklistTemplate.reduce((acc, group) => {
      const stats = groupStats(group);
      acc.total += stats.total;
      acc.done += stats.done;
      acc.missing += stats.missing;
      acc.deviations += stats.deviations;
      acc.closedDeviations += stats.closedDeviations;
      acc.photos += stats.photos;
      return acc;
    }, { total: 0, done: 0, missing: 0, deviations: 0, closedDeviations: 0, photos: 0 });
    const percent = totalStats.total ? Math.round(totalStats.done / totalStats.total * 100) : 0;
    const toggleCategory = (category) => setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }));
    const expandAll = () => setOpenCategories(Object.fromEntries(activeChecklistTemplate.map((group) => [group.category, true])));
    const showRemainingAndJump = () => {
      const targetPoint = firstIncompletePoint;
      setShowOpenDeviationsOnly && setShowOpenDeviationsOnly(false);
      setOpenCategories(Object.fromEntries(activeChecklistTemplate.map((group) => {
        const stats = groupStats(group);
        return [group.category, stats.missing > 0 || stats.deviations > 0 || group.category === targetPoint?.category];
      })));
      if (targetPoint) {
        window.setTimeout(() => scrollToChecklistPoint(targetPoint, "start"), 260);
      }
    };
    const collapseDone = showRemainingAndJump;
    const closeDeviation = (category, item, value = {}) => {
      const closeComment = window.prompt("Kommentar til lukking av avvik:", value.closeComment || "Utført/kontrollert og lukket.");
      if (closeComment === null) return;
      setChecklistValue(category, item, {
        status: "Lukket avvik",
        closedAt: (/* @__PURE__ */ new Date()).toISOString(),
        closedBy: closedByName || "Utførende",
        closeComment: closeComment.trim()
      });
    };
    const reopenDeviation = (category, item) => {
      if (!window.confirm("Vil du åpne avviket igjen?")) return;
      setChecklistValue(category, item, {
        status: "Avvik",
        closedAt: "",
        closedBy: "",
        closeComment: ""
      });
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistSummaryCard", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Sjekklistefremdrift" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            totalStats.done,
            " av ",
            totalStats.total,
            " punkter vurdert \xB7 ",
            percent,
            "% ferdig"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "checklistProgress", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { width: `${percent}%` } }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistSummaryBadges", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
            "\u2705 ",
            totalStats.done,
            " utfylt"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
            "\u26AA ",
            totalStats.missing,
            " mangler"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
            "\u26A0\uFE0F ",
            totalStats.deviations,
            " åpne avvik"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
            "\u2705 ",
            totalStats.closedDeviations,
            " lukket"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
            "\u{1F4F7} ",
            totalStats.photos,
            " bilder"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistSummaryActions", children: [
          firstIncompletePoint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => scrollToChecklistPoint(firstIncompletePoint, "start"), children: "Gå til neste punkt" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: expandAll, children: "\xC5pne alle" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: collapseDone, children: "Vis det som gjenst\xE5r" }),
          totalStats.deviations > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => setShowOpenDeviationsOnly && setShowOpenDeviationsOnly(!showOpenDeviationsOnly), children: showOpenDeviationsOnly ? "Vis alle punkter" : "Vis bare åpne avvik" })
        ] }),
        showOpenDeviationsOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Viser bare sjekkpunkter med åpne avvik. Trykk ‘Vis alle punkter’ for normal sjekkliste." }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistSummaryActions", style: { marginTop: "10px" }, children: [
          onSaveChecklistNow && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: onSaveChecklistNow, children: "Lagre nå" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "note", children: checklistSaveStatus || "Autolagring aktiv" })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "checklistList checklistAccordion", children: visibleChecklistGroups.map((group) => {
        const stats = groupStats(group);
        const isOpen = openCategories[group.category] !== false;
        const groupTone = stats.deviations > 0 ? "avvik" : stats.missing === 0 ? "done" : stats.done > 0 ? "progress" : "missing";
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `item checklistGroup checklistGroup-${groupTone}`, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "checklistGroupHeader", onClick: () => toggleCategory(group.category), "aria-expanded": isOpen, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "checklistGroupCaret", "aria-hidden": "true", children: isOpen ? "\u25BE" : "\u25B8" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "checklistGroupTitle", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                isSoproWarrantyCategory(group.category) ? "🛡️ " : "",
                group.category
              ] }),
              isSoproWarrantyCategory(group.category) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "warrantyPointBadge", children: `${getWarrantyYears(warranty)} ÅRS GARANTI` }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                stats.done,
                "/",
                stats.total,
                " utfylt",
                stats.deviations ? ` \xB7 ${stats.deviations} avvik` : "",
                stats.photos ? ` \xB7 ${stats.photos} bilder` : ""
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `checklistGroupBadge checklistGroupBadge-${groupTone}`, children: stats.deviations > 0 ? "\u26A0\uFE0F Avvik" : stats.missing === 0 ? "\u2705 Ferdig" : stats.done > 0 ? "\u{1F7E1} P\xE5g\xE5r" : "\u26AA Mangler" })
          ] }),
          isOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "checklistGroupBody", children: group.items.filter((item) => !showOpenDeviationsOnly || checklist?.[group.category]?.[item]?.status === "Avvik").map((item) => {
            const value = checklist[group.category]?.[item] || {};
            const pointTone = value.status === "Avvik" ? "avvik" : value.status === "Lukket avvik" ? "done" : value.status ? "done" : "missing";
            const warrantyPoint = isSoproWarrantyPoint(group.category);
            const pointRequirement = warrantyPoint ? { ...group.requirements?.[item] || {}, image_required: true, comment_required: true } : group.requirements?.[item] || {};
            const anchorId = checklistPointAnchor(group.category, item);
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { id: anchorId, className: `checklistPoint checklistPoint-${pointTone}${warrantyPoint ? " checklistWarrantyPoint" : ""}`, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistHeader", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistPointTitle", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: item }),
                  warrantyPoint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "warrantyPointBadge", children: "🛡️ Garantipunkt" }),
                  warrantyPoint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "warrantyPointBadge", children: "📷/✍️ Bilde eller kommentar" }),
                  !warrantyPoint && pointRequirement.image_required && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "warrantyPointBadge", children: "📷 Bilde påkrevd" }),
                  !warrantyPoint && pointRequirement.comment_required && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "warrantyPointBadge", children: "✍️ Kommentar påkrevd" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                    value.status || "Ikke vurdert",
                    (value.photos || []).length > 0 ? ` \xB7 \u{1F4F7} ${(value.photos || []).length} bilder` : ""
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "checklistStatusButtons", children: ["Ok", "Ikke aktuelt", "Avvik"].map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "button",
                  {
                    type: "button",
                    className: value.status === status ? "" : "secondary",
                    onClick: () => handleStatusClick(group.category, item, status),
                    children: status
                  },
                  status
                )) })
              ] }),
              (value.status || value.comment || (value.photos || []).length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                Textarea,
                {
                  label: "Kommentar",
                  value: value.comment || "",
                  onChange: (v) => setChecklistValue(group.category, item, { comment: v })
                }
              ),
              value.status === "Avvik" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "deviationCloseBox", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Avviket er åpent. Lukk det når tiltak er utført og kontrollert." }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => closeDeviation(group.category, item, value), children: "✅ Lukk avvik" })
              ] }),
              value.status === "Lukket avvik" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "deviationClosedBox", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "✅ Avvik lukket" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
                  value.closeComment || "Avviket er lukket.",
                  value.closedBy ? ` Lukket av ${value.closedBy}.` : "",
                  value.closedAt ? ` ${new Date(value.closedAt).toLocaleString("no-NO")}.` : ""
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => reopenDeviation(group.category, item), children: "Åpne avvik igjen" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload checklistUpload", onClick: (e) => e.stopPropagation(), onDragOver: stopChecklistFileDragNavigation, onDragEnter: stopChecklistFileDragNavigation, onDrop: (e) => handleChecklistPhotoDrop(group.category, item, e), title: "Dra bilde hit eller klikk for å laste opp", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
                (value.photos || []).length > 0 ? ` 📷 ${(value.photos || []).length} bilde${(value.photos || []).length === 1 ? "" : "r"} lastet opp – dra flere hit eller klikk` : " 📷 Dra bilde hit eller klikk for å laste opp",
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", capture: "environment", multiple: true, onClick: (e) => e.stopPropagation(), onChange: (e) => addChecklistPhoto(group.category, item, e.target.files) })
              ] }),
              (value.photos || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos checklistPhotos", children: value.photos.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: p.url }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: p.name })
              ] }, p.id)) })
            ] }, item);
          }) })
        ] }, group.category);
      }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Opplastede sjekklister / vedlegg fra andre fag", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload checklistUpload", onDragOver: stopChecklistFileDragNavigation, onDragEnter: stopChecklistFileDragNavigation, onDrop: handleChecklistAttachmentDrop, title: "Dra PDF, bilde eller dokument hit – eller klikk for å laste opp", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
          " Last opp sjekkliste / vedlegg – dra filer hit eller klikk",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", multiple: true, onChange: (e) => addFiles(e.target.files) })
        ] }),
        files.map((f) => {
          const fileUrl = publicProjectFileUrl(f);
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "file", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: f.name }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
              "Lastet opp av ",
              f.by || "Ukjent",
              " \xB7 ",
              f.created || ""
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
                "Fag/rolle",
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", { value: f.trade || f.fag || f.role || "Uspesifisert", onChange: (e) => updateChecklistAttachmentFile(f.id, { trade: e.target.value }), children: checklistAttachmentTradeOptions.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: option, children: option }, option)) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
                "Dokumenttype",
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", { value: f.documentType || f.docType || f.typeLabel || "Sjekkliste", onChange: (e) => updateChecklistAttachmentFile(f.id, { documentType: e.target.value }), children: checklistAttachmentDocumentTypeOptions.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: option, children: option }, option)) })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Kort beskrivelse / kommentar", value: f.description || f.comment || "", onChange: (v) => updateChecklistAttachmentFile(f.id, { description: v }) }),
            fileUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: fileUrl, target: "_blank", rel: "noopener noreferrer", children: "\xC5pne" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { style: { color: "#991b1b", fontWeight: 800 }, children: "Dokumentlenke mangler – last opp filen på nytt" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => setFiles(files.filter((x) => x.id !== f.id)), children: "Fjern" })
          ] }, f.id);
        })
      ] })
    ] });
  }
  function ChecklistReportSection({ checklist }) {
    const rows = [];
    Object.entries(checklist || {}).forEach(([category, items]) => {
      Object.entries(items || {}).forEach(([item, value]) => {
        if (value?.status || value?.comment || (value?.photos || []).length) {
          rows.push({ category, item, ...value });
        }
      });
    });
    if (!rows.length) return null;

    const statusMeta = (status = "") => {
      const clean = String(status || "").toLowerCase();
      if (clean === "avvik") return { icon: "!", label: "Åpent avvik", color: "#991b1b", bg: "#fef2f2", border: "#f87171" };
      if (clean === "lukket avvik") return { icon: "✓", label: "Lukket avvik", color: "#065f46", bg: "#ecfdf5", border: "#4ade80" };
      if (clean === "ikke aktuelt") return { icon: "–", label: "Ikke aktuelt", color: "#475569", bg: "#f8fafc", border: "#cbd5e1" };
      if (clean === "ok" || clean === "utført" || clean === "utfort") return { icon: "✓", label: "OK", color: "#047857", bg: "#ffffff", border: "#e2e8f0" };
      return { icon: "?", label: status || "Ikke vurdert", color: "#92400e", bg: "#fffbeb", border: "#fbbf24" };
    };

    const deviations = rows.filter((r) => r.status === "Avvik" || r.status === "Lukket avvik");
    const openDeviationTotal = deviations.filter((r) => r.status === "Avvik").length;
    const closedDeviationTotal = deviations.filter((r) => r.status === "Lukket avvik").length;
    const categories = [...new Set(rows.map((r) => r.category))];

    const itemStyle = (meta) => ({
      border: `1px solid ${meta.border}`,
      background: meta.bg,
      borderRadius: 12,
      padding: "10px 12px",
      margin: "8px 0 10px",
      breakInside: "avoid",
      pageBreakInside: "avoid"
    });
    const iconStyle = (meta) => ({
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 24,
      height: 24,
      borderRadius: 999,
      border: `1.5px solid ${meta.color}`,
      background: meta.label === "OK" ? "#ecfdf5" : "#ffffff",
      color: meta.color,
      fontWeight: 900,
      fontSize: 16,
      lineHeight: 1,
      marginRight: 10,
      flex: "0 0 auto"
    });

    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Sjekkliste / utførte kontroller" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Kontrollpunktene under viser registrert status for prosjektet. Bilder som er lagt inn på et sjekkpunkt vises direkte under punktet." }),
      categories.map((category) => {
        const categoryRows = rows.filter((r) => r.category === category);
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: 18 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "10px 14px", marginBottom: 8 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { style: { margin: 0, color: "#0c2a52" }, children: category }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { style: { color: "#475569" }, children: [
              categoryRows.length,
              " punkt"
            ] })
          ] }),
          categoryRows.map((r) => {
            const meta = statusMeta(r.status);
            const hasPhotos = (r.photos || []).length > 0;
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: itemStyle(meta), children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", alignItems: "flex-start", gap: 0 }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: iconStyle(meta), children: meta.icon }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { flex: 1 }, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }, children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: r.item }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { style: { color: meta.color, fontWeight: 800, whiteSpace: "nowrap" }, children: meta.label })
                  ] }),
                  r.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { style: { margin: "6px 0 0" }, children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: r.status === "Avvik" || r.status === "Lukket avvik" ? "Opprinnelig avvik: " : "Kommentar: " }),
                    r.comment
                  ] }),
                  r.status === "Lukket avvik" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { style: { margin: "6px 0 0", color: "#065f46" }, children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Utbedring / lukkekommentar: " }),
                    r.closeComment || "Lukket uten egen lukkekommentar",
                    r.closedBy ? ` · Lukket av ${r.closedBy}` : "",
                    r.closedAt ? ` · ${new Date(r.closedAt).toLocaleString("no-NO")}` : ""
                  ] }),
                  hasPhotos && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: 10 }, children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { style: { display: "block", color: "#0c2a52", fontWeight: 800, marginBottom: 6 }, children: [
                      "📷 Bildedokumentasjon (",
                      (r.photos || []).length,
                      ")"
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos reportPhotos", children: (r.photos || []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: p.url, alt: p.name || r.item }),
                      p.name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: p.name })
                    ] }, p.id || p.url)) })
                  ] })
                ] })
              ] })
            ] }, r.category + r.item);
          })
        ] }, category);
      }),
      deviations.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: 22 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Avviksliste" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Avviksoppsummering: " }),
          `${openDeviationTotal} åpne avvik · ${closedDeviationTotal} lukkede avvik`
        ] }),
        deviations.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistReportItem", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
              r.status === "Lukket avvik" ? "✅ Lukket avvik" : "⚠️ Åpent avvik",
              " – ",
              r.category,
              " / ",
              r.item
            ] })
          ] }),
          r.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Opprinnelig avvik: " }),
            r.comment
          ] }),
          r.status === "Lukket avvik" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Utbedring / lukkekommentar: " }),
            r.closeComment || "Lukket uten egen lukkekommentar",
            r.closedBy ? ` · Lukket av ${r.closedBy}` : "",
            r.closedAt ? ` · ${new Date(r.closedAt).toLocaleString("no-NO")}` : ""
          ] }),
          r.status !== "Lukket avvik" && !r.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Avvik registrert uten kommentar." })
        ] }, "avvik-" + r.category + r.item))
      ] })
    ] });
  }
function BathroomEquipmentReportSection({ surf, bathroomEquipment }) {
    const groups = buildBathroomEquipmentReportGroups(surf, bathroomEquipment);
    if (!groups.length) return null;
    const categoryStyle = { border: "1px solid #bfdbfe", background: "#eff6ff", borderRadius: "12px", padding: "12px 16px", margin: "18px 0 12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" };
    const cardStyle = { border: "1px solid #d6e2ec", background: "#fff", borderRadius: "12px", padding: "14px 16px", margin: "10px 0", breakInside: "avoid", pageBreakInside: "avoid" };
    const labelStyle = { fontSize: "12px", fontWeight: 800, color: "#64748b", margin: "0 0 3px" };
    const valueStyle = { fontSize: "14px", fontWeight: 700, color: "#0f172a", margin: "0 0 8px" };
    const linkWrapStyle = { display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" };
    const linkStyle = { display: "inline-block", border: "1px solid #bfdbfe", background: "#eff6ff", borderRadius: "999px", padding: "5px 10px", fontWeight: 800, textDecoration: "none" };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Overflater og innredning" }),
      groups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: categoryStyle, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { style: { margin: 0 }, children: group.title }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { fontSize: "12px", color: "#475569", fontWeight: 700 }, children: [
            (group.items || []).length,
            " punkt"
          ] })
        ] }),
        (group.items || []).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: cardStyle, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { style: { margin: "0 0 10px", fontSize: "16px" }, children: item.title }),
          (item.entries || []).map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: labelStyle, children: label }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: valueStyle, children: value || "Ikke oppgitt" })
          ] }, label)),
          (item.links || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: linkWrapStyle, children: item.links.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: link.url, style: linkStyle, children: link.label }, link.label)) })
        ] }, item.title))
      ] }, group.title))
    ] });
  }
  function Report({ company, name, project, selected, manualProducts, other, surf, bathroomEquipment, photos, access, inst, files, checklist, tilbud, overtagelse, projectLog }) {
    const projectFields = { Prosjektansvarlig: project.responsible, Prosjektnavn: project.projectName, Adresse: project.address, "Postnr.": project.postnr, "Poststed / by": project.city, Kunde: project.customer, "Kunde e-post": project.customerEmail, "Kunde telefon": project.customerPhone, Dato: project.date, Status: project.locked ? "Avsluttet / l\xE5st" : "Aktivt", Notater: project.notes };
    const cats = [...new Set(photos.map((p) => p.cat))];
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "report", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "reportTop", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: name }),
            company.address && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: company.address }),
            company.orgNumber && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
              "Org.nr: ",
              company.orgNumber
            ] }),
            company.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: company.phone }),
            company.email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: company.email }),
            company.website && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: company.website })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "FDV-rapport / Prosjektdokumentasjon" }),
        project.locked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { fontWeight: 800, letterSpacing: "0.04em" }, children: "\u2705 FERDIGSTILT / L\xC5ST" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, { children: Object.entries(projectFields).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: k }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: v || "Ikke fylt ut" })
        ] }, k)) })
      ] }),
      project.projectInfoIncludeInReport && hasValue(project.projectDescription) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Prosjektinformasjon/beskrivelse" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { whiteSpace: "pre-wrap" }, children: project.projectDescription })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Prosjektering" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Fall i dusjsone" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project.fallDusj || "Ikke oppgitt" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Fall utenfor dusjsone / v\xE5tsone" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project.fallUtenfor || "Ikke oppgitt" })
          ] }),
          project.fall && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Fall mot sluk" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project.fall })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Slukplassering" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project.sluk || "Ikke oppgitt" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Terskelh\xF8yde" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project.terskel || "Ikke oppgitt" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Membran" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project.membran || "Ikke oppgitt" })
          ] })
        ] }),
        (Array.isArray(project.prosjekteringPunkter) ? project.prosjekteringPunkter : []).filter((p) => hasValue(p.title) || hasValue(p.value)).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: `${p.category || "Annet"}: ${p.title || "Eget punkt"}` }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p.value || "Ikke oppgitt" })
        ] }, p.id || p.title)),
        project.prosjekteringKommentar && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Kommentar / avvik" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project.prosjekteringKommentar })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Produkter / FDV" }),
        selected.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: p.section }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p.item }),
          p.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Hvor brukt / kommentar:" }),
            " ",
            p.comment
          ] }),
          p.fdvUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.fdvUrl, children: "\xC5pne FDV" }),
          p.databladUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.databladUrl, children: "\xC5pne datablad" }),
          p.dopUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.dopUrl, children: "\xC5pne DOP" }),
          p.epdUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.epdUrl, children: "\xC5pne EPD" }),
          p.sikkerhetsdatabladUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.sikkerhetsdatabladUrl, children: "\xC5pne sikkerhetsdatablad" }),
          p.documentFileUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.documentFileUrl, children: "\xC5pne vedlagt dokument" })
        ] }, p.item)),
        (manualProducts || []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: p.section || "Annet produkt" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p.name || "Uten produktnavn" }),
          p.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Hvor brukt / kommentar:" }),
            " ",
            p.comment
          ] }),
          p.fdvUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.fdvUrl, children: "\xC5pne FDV" }),
          p.databladUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.databladUrl, children: "\xC5pne datablad" }),
          p.dopUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.dopUrl, children: "\xC5pne DOP" }),
          p.epdUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.epdUrl, children: "\xC5pne EPD" }),
          p.sikkerhetsdatabladUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.sikkerhetsdatabladUrl, children: "\xC5pne sikkerhetsdatablad" }),
          p.documentFileUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.documentFileUrl, children: "\xC5pne vedlagt dokument" })
        ] }, p.id)),
        Object.entries(other).filter(([, v]) => v).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
            "Tidligere registrert annet produkt under ",
            k,
            ":"
          ] }),
          " ",
          v
        ] }, k))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BathroomEquipmentReportSection, { surf, bathroomEquipment }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Bildedokumentasjon" }),
        cats.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: cat }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos reportPhotos", children: photos.filter((p) => p.cat === cat).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: p.url }),
            p.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p.comment })
          ] }, p.id)) })
        ] }, cat))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Fag, deler og utstyr" }),
        inst.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
            i.category,
            ":"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            i.name,
            " ",
            i.qty && `\xB7 ${i.qty}`,
            " ",
            i.supplier && `\xB7 ${i.supplier}`,
            " ",
            i.desc && ` \u2014 ${i.desc}`
          ] }),
          i.fdvUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: i.fdvUrl, children: "\xC5pne FDV/datablad" })
        ] }, i.id))
      ] }),
      projectLog?.enabled && (projectLog.messages || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Chat" }),
        (projectLog.messages || []).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: m.by || "Ukjent" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: m.created ? new Date(m.created).toLocaleString("no-NO") : "" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: m.text }),
          m.imageUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos reportPhotos", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: m.imageUrl, alt: m.imageName || "Chat bilde" }),
            m.imageName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: m.imageName })
          ] }) })
        ] }, m.id))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChecklistReportSection, { checklist }),
      tilbud?.enabled && (hasValue(tilbud.tillegg) || hasValue(tilbud.fradrag) || hasValue(tilbud.kommentar) || (tilbud.files || []).length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Tilbud / kontrakt" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Tillegg", value: tilbud.tillegg }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Fradrag", value: tilbud.fradrag }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Avtaleendringer / kommentar", value: tilbud.kommentar })
        ] }),
        (tilbud.files || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Vedlegg" }),
          (tilbud.files || []).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: f.url, target: "_blank", rel: "noopener noreferrer", children: f.name }) }, f.id))
        ] })
      ] }),
      overtagelse?.enabled && (hasValue(overtagelse.dato) || hasValue(overtagelse.kommentar) || hasValue(overtagelse.signUtf\u00F8rende) || hasValue(overtagelse.signKunde) || hasValue(overtagelse.signUtf\u00F8rendeImage) || hasValue(overtagelse.signKundeImage)) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Overtagelse" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Dato", value: overtagelse.dato }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Kommentar / merknader", value: overtagelse.kommentar }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignatureCard, { label: "Signatur utf\xF8rende", name: overtagelse.signUtf\u00F8rende, image: overtagelse.signUtf\u00F8rendeImage }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignatureCard, { label: "Signatur kunde", name: overtagelse.signKunde, image: overtagelse.signKundeImage })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Sjekklister og vedlegg" }),
        files.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: f.name }, f.id))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Prosjekttilgang" }),
        access.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
          a.name || a.email,
          " \u2014 ",
          a.role
        ] }, a.id))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", { children: [
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "© 2026 Expo Proffsenter – Expo ProffDok" }),
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Alle rettigheter forbeholdt." })
] })
    ] });
  }

  function publicProjectFileUrl(file = {}) {
    const raw = String(file?.url || file?.href || "").trim();
    if (raw && !/^blob:/i.test(raw)) return normalizeExternalUrl(raw);
    const path = String(file?.path || file?.storagePath || file?.filePath || "").trim();
    if (path) {
      try {
        const { data } = supabase.storage.from("project-images").getPublicUrl(path);
        return normalizeExternalUrl(data?.publicUrl || "");
      } catch {
        return "";
      }
    }
    return "";
  }

  function normalizeExternalUrl(value) {
    if (value === void 0 || value === null) return "";
    const raw = String(value).trim();
    if (!raw) return "";
    if (/^(https?:|mailto:|tel:)/i.test(raw)) return raw;
    if (raw.startsWith("//")) return "https:" + raw;
    if (/^[a-z0-9.-]+\.[a-z]{2,}([/:?#].*)?$/i.test(raw)) return "https://" + raw;
    return raw;
  }
  function PdfSafeLink({ href, children }) {
    const url = normalizeExternalUrl(href);
    if (!url) return null;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "pdfSafeLink", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: url, target: "_blank", rel: "noopener noreferrer", children }) });
  }

  function hasValue(value) {
    return value !== void 0 && value !== null && String(value).trim() !== "";
  }
  function InfoCard({ label, value }) {
    if (!hasValue(value)) return null;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: label }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: value })
    ] });
  }
  function SignatureCard({ label, name, image }) {
    if (!hasValue(name) && !hasValue(image)) return null;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: label }),
      name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: name }),
      image && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: image, alt: label, style: { width: "100%", maxWidth: "360px", height: "120px", objectFit: "contain", background: "#fff", border: "1px solid #dbe7ec", borderRadius: "12px", marginTop: "8px" } })
    ] });
  }
  function SignaturePad({ label, value, onChange }) {
    const canvasRef = import_react.default.useRef(null);
    const drawingRef = import_react.default.useRef(false);
    const hasDrawnRef = import_react.default.useRef(false);
    import_react.default.useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(180 * ratio));
      const ctx = canvas.getContext("2d");
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.lineWidth = 2.4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#0f172a";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width / ratio, canvas.height / ratio);
      if (value) {
        const img = new Image();
        img.onload = () => {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width / ratio, canvas.height / ratio);
          ctx.drawImage(img, 0, 0, canvas.width / ratio, canvas.height / ratio);
        };
        img.src = value;
        hasDrawnRef.current = true;
      } else {
        hasDrawnRef.current = false;
      }
    }, [value]);
    const getPoint = (event) => {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const touch = event.touches?.[0] || event.changedTouches?.[0];
      const source = touch || event;
      return {
        x: source.clientX - rect.left,
        y: source.clientY - rect.top
      };
    };
    const start = (event) => {
      event.preventDefault();
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const p = getPoint(event);
      drawingRef.current = true;
      hasDrawnRef.current = true;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    };
    const move = (event) => {
      if (!drawingRef.current) return;
      event.preventDefault();
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const p = getPoint(event);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    };
    const end = (event) => {
      if (!drawingRef.current) return;
      event.preventDefault();
      drawingRef.current = false;
      const canvas = canvasRef.current;
      if (hasDrawnRef.current) onChange(canvas.toDataURL("image/png"));
    };
    const clear = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const rect = canvas.getBoundingClientRect();
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, rect.width, 180);
      hasDrawnRef.current = false;
      onChange("");
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: label }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "canvas",
        {
          ref: canvasRef,
          style: { width: "100%", height: "180px", background: "#fff", border: "1px solid #c7d6dd", borderRadius: "14px", touchAction: "none", display: "block", marginTop: "10px" },
          onMouseDown: start,
          onMouseMove: move,
          onMouseUp: end,
          onMouseLeave: end,
          onTouchStart: start,
          onTouchMove: move,
          onTouchEnd: end
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: clear, children: "T\xF8m signatur" }) })
    ] });
  }
  function CustomerReport({ company, name, project, selected, manualProducts, other, surf, bathroomEquipment, photos, inst, files, checklist, tilbud, overtagelse, projectLog }) {
    const projectFields = [
      ["Prosjektansvarlig", project.responsible],
      ["Prosjektnavn", project.projectName],
      ["Adresse", project.address],
      ["Postnr.", project.postnr],
      ["Poststed / by", project.city],
      ["Kunde", project.customer],
      ["Kunde e-post", project.customerEmail],
      ["Kunde telefon", project.customerPhone],
      ["Dato", project.date],
      ["Status", project.locked ? "Avsluttet / l\xE5st" : "Aktivt"],
      ["Notater", project.notes]
    ];
    const prosjektering = [
      ["Fall i dusjsone", project.fallDusj],
      ["Fall utenfor dusjsone / v\xE5tsone", project.fallUtenfor],
      ...hasValue(project.fall) ? [["Fall mot sluk", project.fall]] : [],
      ["Slukplassering", project.sluk],
      ["Terskelh\xF8yde", project.terskel],
      ["Membranl\xF8sning", project.membran],
      ...(Array.isArray(project.prosjekteringPunkter) ? project.prosjekteringPunkter : []).filter((p) => hasValue(p.title) || hasValue(p.value)).map((p) => [`${p.category || "Annet"}: ${p.title || "Eget punkt"}`, p.value]),
      ["Kommentar / avvik", project.prosjekteringKommentar]
    ];
    const surfaceRows = Object.entries(surf || {}).filter(([, v]) => hasValue(v));
    const otherRows = Object.entries(other || {}).filter(([, v]) => hasValue(v));
    const photoCats = [...new Set((photos || []).map((p) => p.cat).filter(Boolean))];
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "report", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "reportTop", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: project.projectName || "FDV-rapport / Prosjektdokumentasjon" }),
            project.address && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project.address }),
            project.customer && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Kunde:" }),
              " ",
              project.customer
            ] }),
            company.companyName && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Utf\xF8rende:" }),
              " ",
              company.companyName
            ] }),
            company.orgNumber && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
              "Org.nr: ",
              company.orgNumber
            ] })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Prosjektinformasjon" }),
        project.locked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { fontWeight: 800, letterSpacing: "0.04em" }, children: "\u2705 FERDIGSTILT / L\xC5ST" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, { children: projectFields.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label, value }, label)) })
      ] }),
      project.projectInfoIncludeInReport && hasValue(project.projectDescription) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Prosjektinformasjon/beskrivelse" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { whiteSpace: "pre-wrap" }, children: project.projectDescription })
      ] }),
      prosjektering.some(([, v]) => hasValue(v)) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Prosjektering" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, { children: prosjektering.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label, value }, label)) })
      ] }),
      (selected.length > 0 || (manualProducts || []).length > 0 || otherRows.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Produkter / FDV" }),
        selected.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: p.section }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p.item }),
          p.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Hvor brukt / kommentar:" }),
            " ",
            p.comment
          ] }),
          p.fdvUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.fdvUrl, children: "\xC5pne FDV/datablad" })
        ] }, p.item)),
        (manualProducts || []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: p.section || "Annet produkt" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p.name || "Uten produktnavn" }),
          p.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Hvor brukt / kommentar:" }),
            " ",
            p.comment
          ] }),
          p.fdvUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: p.fdvUrl, children: "\xC5pne FDV/datablad" })
        ] }, p.id)),
        otherRows.map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
            "Tidligere registrert annet produkt under ",
            k,
            ":"
          ] }),
          " ",
          v
        ] }, k))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BathroomEquipmentReportSection, { surf, bathroomEquipment }),
      (photos || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Bildedokumentasjon" }),
        photoCats.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: cat }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos reportPhotos", children: photos.filter((p) => p.cat === cat).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: p.url, alt: p.cat || "Dokumentasjonsbilde" }),
            p.comment && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p.comment })
          ] }, p.id)) })
        ] }, cat))
      ] }),
      (inst || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Fag, deler og utstyr" }),
        inst.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: i.category || "Post" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: [i.name, i.qty, i.supplier, i.desc].filter(Boolean).join(" \xB7 ") }),
          i.fdvUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfSafeLink, { href: i.fdvUrl, children: "\xC5pne FDV/datablad" }),
          (i.photos || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos reportPhotos", children: i.photos.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photo", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: p.url, alt: p.name || "Bilde" }) }, p.id)) })
        ] }, i.id))
      ] }),
      (hasValue(tilbud?.tillegg) || hasValue(tilbud?.fradrag) || hasValue(tilbud?.kommentar) || (tilbud?.files || []).length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { id: "kunde-tilbud", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Tilbud / kontrakt" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Tillegg", value: tilbud.tillegg }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Fradrag", value: tilbud.fradrag }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Avtaleendringer / kommentar", value: tilbud.kommentar })
        ] }),
        (tilbud.files || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Vedlegg" }),
          (tilbud.files || []).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: f.url, target: "_blank", rel: "noopener noreferrer", children: f.name }) }, f.id))
        ] })
      ] }),
      overtagelse?.enabled && (hasValue(overtagelse.dato) || hasValue(overtagelse.kommentar) || hasValue(overtagelse.signUtf\u00F8rende) || hasValue(overtagelse.signKunde) || hasValue(overtagelse.signUtf\u00F8rendeImage) || hasValue(overtagelse.signKundeImage)) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Overtagelse" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Dato", value: overtagelse.dato }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, { label: "Kommentar / merknader", value: overtagelse.kommentar }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignatureCard, { label: "Signatur utf\xF8rende", name: overtagelse.signUtf\u00F8rende, image: overtagelse.signUtf\u00F8rendeImage }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignatureCard, { label: "Signatur kunde", name: overtagelse.signKunde, image: overtagelse.signKundeImage })
        ] })
      ] }),
      projectLog?.enabled && (projectLog.messages || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Chat" }),
        (projectLog.messages || []).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: m.by || "Ukjent" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: m.created ? new Date(m.created).toLocaleString("no-NO") : "" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: m.text }),
          m.imageUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photos reportPhotos", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: m.imageUrl, alt: m.imageName || "Chat bilde" }),
            m.imageName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: m.imageName })
          ] }) })
        ] }, m.id))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChecklistReportSection, { checklist }),
      (files || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Sjekklister og vedlegg" }),
        files.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: f.name }, f.id))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", { children: "Levert av Expo Proffsenter" })
    ] });
  }
  (0, import_client.createRoot)(document.getElementById("root")).render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(App, {}));
