# Privat kontraktstekst, søk og gjennomgang

24. oktober 2026. Kenneth: «kjør» etter forslag om tekstgjenkjenning, søk,
kildebelagt kontraktsoversikt og forslag til røde flagg.

Miljømål BEGGE. Samme feature/Preview og Sandbox; ingen produksjonsmerge eller
produksjonsmigrasjon. PR #278 skal fortsatt være OPEN DRAFT. Dette er ikke samlet
Bolig TEST OK. Gjeldende publisert HEAD, CI og Preview-status føres i PR-en.

## Funksjon og avgrensning

Kontrakter → **Les og gjennomgå kontrakter** åpner én dialog med **Tekst og søk**
og **Gjennomgang**. Kontraktsadministrator bruker **Gjør søkbar** på en lagret
PDF/JPG/PNG. PDF-tekst leses direkte; sider uten tilstrekkelig tekst rendres og
leses med norsk/engelsk OCR. Originalen hentes via uendret privat filgateway og
SHA-256 bekreftes før lesing. Originalen endres ikke. Inntil 200 sider, 50 000
tegn per side og 1,1 MB tekstgrunnlag per lagring.

Tekstutgaven lagres med egen stabil ID, originalens fil-ID, side, lesemetode,
OCR-score, innsender og tidspunkt. Gjentatt samme ID/innhold gir samme kvittering;
endret innhold kan ikke overskrive samme ID. Ny lesing lager en ny tekstutgave.
Tom/kort tekst og OCR-score under 70 markeres for kontroll. Maskinscoren bekrefter
ikke at beløp, datoer eller formuleringer er riktige. Teksten er klargjort i
brukerens nettleser og tilskrevet innsenderen; den er ikke attestert av serveren.

Søk er et bokstavelig, ikke versalsensitivt ord-/uttrykkssøk. Det viser inntil 50
sidetreff i nyeste tekstutgave av hver gjeldende filversjon. Filversjoner uten
tekst inngår ikke. **Åpne kildeside** viser den uendrede originalen på PDF-siden.
Bildedokumenter har én side. Tilbake-knappen bevarer gjennomgang og spørsmål.

Administrator velger 1–10 tekstutgaver og eventuelt et spørsmål før **Start
gjennomgang**. Grunnlaget begrenses til 160 000 tegn. Funn grupperes som funnet
formulering, mulig rødt flagg eller må avklares, med tema for leveranse, frister,
betaling, varsling, dokumentasjon, endringer, garantier eller øvrig. Hvert funn
har dokument, eksakt fil-/tekstversjon, sidetall og kildeutdrag. Mulig motstrid
skal vise begge kilder; dokumentrekkefølgen gir ingen automatisk juridisk rang.

Utdrag kontrolleres maskinelt mot den **lagrede tekstsiden**, både i API og SQL.
Dette kontrollerer ikke om OCR har lest skanningen riktig, eller om modellens
tolkning er riktig. Forslagene må gjennomgås mot originalen. Tekst og resultater
er administratorinnsendte arbeidsforslag, ikke signerte modellattestasjoner eller
godkjenninger. Ingen kontraktsaksept, oppgaver, bestillinger, frister eller varsler
opprettes. Ingen indeksregulering, dokumentrangering eller automatiske handlinger.

Lagrede gjennomganger beholder de eksakte tekst-/filversjonene. Ny fil eller ny
tekstutgave gir historisk grunnlag-markering. En tidligere gjennomgang omskrives
aldri stille. Oppsettet foldes sammen etter lagring slik at funn kommer først.

## Tilgang, behandling og drift

- Additiv migrasjon `20261024191654_bolig_contract_reviews.sql` er installert bare
  i Sandbox `ppvircenkjizeiqdxphj`. Lokal fil er opprettet med CLI og deretter
  navngitt med faktisk versjon returnert fra Sandbox-migrasjonshistorikken.
- To nye private RLS-tabeller, uten direkte grants til anon/authenticated/
  service_role. Ny offentlig invoker-RPC går gjennom den eksisterende private
  kontraktskontrollen ved hver lesing og skriving. Ingen gammel migrasjon eller
  authorizer er endret. Lesere kan søke og lese; bare kontraktsadministrator i
  aktivt prosjekt kan klargjøre tekst eller starte/lagre gjennomgang.
- Ingen tekst, OCR-bilder, resultater eller filbaner til generelle prosjektkort,
  UE-/leverandør-/beboerlenker eller ordinær FDV/sluttpakke. Ingen e-postendring.
- PDFium og Tesseract kjører i nettleserarbeidere. Bibliotek, WASM og språkdata
  leveres fra egen host, og OCR-cache er deaktivert. Ingen dokumenter sendes til
  CDN/OCR-tjeneste. Ingen nye private data i localStorage/sessionStorage/IndexedDB.
- Bare eksplisitt **Start gjennomgang** sender en forespørsel til egen Vercel-
  funksjon. Browseren sender ID-er/spørsmål; API-et laster tekst fra privat SQL.
  Brukersupplert alternativ tekst eller backend-URL aksepteres ikke.
- API-et validerer JWT med Auth.getUser før privat SQL. Samme eksplisitte
  miljøbinding som appen velger Sandbox for denne feature-Preview-en. Ingen
  service key. Ny ACL-kontroll i SQL etter modellarbeid, før lagring/retur.
- AI SDK 7.0.153, live modellkatalog kontrollert: `openai/gpt-5.4-mini`, lav
  reasoning, maksimalt 6000 output-tokens, 120 sekunders frist, ingen SDK-retry,
  verktøy eller weboppslag. Vercel OIDC brukes i deployment. Kravet
  `zeroDataRetention:true` skal feile lukket hvis kvalifisert rute ikke finnes;
  ingen automatisk svekking av lagringskravet. Faktisk team-/modelltilgang og
  kreditt er ikke bekreftet med en autentisert live modellkjøring i denne QA-en.
- Serveren tillater maksimalt 20 startede gjennomganger per prosjekt per døgn og
  30 sekunder mellom starter. Eksakt retry av en bekreftet kvittering gjenbruker
  resultatet uten ny modellkjøring. Løpende/feilede forsøk regnes med i grensen.
- Instruksjoner i kontrakter/spørsmål behandles som data. Ingen dokumentstyrte
  verktøy eller kommandoer. Ingen kildetekst, prompts, svar eller hemmeligheter
  logges av applikasjonskoden. Modelldata rendres som React-tekst.
- Samme bruker/firma ved fokus- og periodisk ACL-kontroll bevarer spørsmål,
  valgt fane og pågående foreground-arbeid. Reell bakgrunn lukker privat visning
  og avbryter klientarbeid. Serverarbeid som allerede er startet kan avsluttes;
  status hentes fra historikken, uten automatisk ny analyse. Faktisk tilbakekalling
  eller bruker-/firmabytte sperrer gamle data. Sen tilgangslesing kan ikke
  overskrive et nyere valgt resultat.

## QA og faktiske begrensninger

| Kontroll | Resultat |
|---|---|
| Faktisk SQL og faktisk HTTP-handler | 67 assertions PASS; syntetisk modell, Auth-transport og Storage |
| Faktisk React → HTTP → SQL/filhandler/PDF/OCR → gjennomgang | 62 Chromium assertions PASS, inkludert filvelgerregresjon, faktisk bilde-OCR med avbrudd/ny start og 320/390/768/1366 px; modellen er syntetisk |
| Vedlagt virkelig skannet PDF, samme browser-flyt | PASS: sju sider lesbare, ingen under OCR-terskelen; ingen dokumentforespørsler til ekstern host |
| Original ved nedlasting | Samme SHA-256 som opplastet original |
| Native Sandbox SQL-smoke som authenticated | PASS: tekst/søk/kilder/lagret forslag, reader/write-grenser, rå tabell-/Storage-/anon-sperre og tilbakekalling; rollback |
| Full Sandbox-build og eksisterende critical checks | PASS |
| Eksisterende Bolig-workspace og KS/HMS-integrasjon | PASS; egen React-suite og 25 Chromium assertions |
| Core boundary og gamle dependency-versjoner | PASS; alle tidligere pakkeversjoner beholdes |
| Security advisors før/etter | WARN-typer og antall uendret; to nye INFO for bevisst lukkede private RLS-tabeller |

Eksempelkontrakten avdekket en feil ved rendring av komprimerte skannebilder i
først vurdert PDF-motor. Levert kode bruker PDFium 3.0.0, testet på hele originalen.
Tesseract 7.0.0 og norsk/engelsk språkdata 1.0.0 er låst i package-lock. OCR/PDF-
ressurser og lisenser bygges til egne statiske Bolig-stier, og lastes først ved
tekstbehandling. AI SDK importeres bare av serverfunksjonen. Eksisterende npm-
skript og dependency-versjoner er uendret; boundary-sjekken håndhever dette.

Den faktiske kontrakten, OCR-tekst og bilder av innholdet er ikke lagt i repo,
delte pilotdata eller produksjon. Lokale tester bruker midlertidig database og
logger bare kvalitetstall. Native smoke bruker syntetisk tekst og Storage-
metadata, uten faktiske Storage-bytes; alle testskrivinger rulles tilbake.

**Gjenstår som separat bevis:** første autentiserte reelle modellkjøring i delt
Preview med teamets OIDC/kreditt/ZDR, innlogget brukerprøve og fysisk mobil/Safari.
En grønn browser-test med syntetisk modell er ikke bevis for disse. Utsending,
betalings-/kredittoppsett og produksjonsmerge er ikke gjennomført.

## Kort brukerprøve

Samme faste Preview-adresse som før.

1. **Kontrakter → Les og gjennomgå kontrakter → Gjør søkbar** på eksempel-PDF-en.
   Se sju tekstsider og eventuelle kvalitetsmarkeringer.
2. Søk etter et ord fra teksten. **Åpne kildeside** skal åpne riktig originalside.
3. **Gjennomgang** → velg dokumentgrunnlag og skriv eventuelt et spørsmål →
   **Start gjennomgang**. Ved tilgjengelig analysetjeneste skal et lagret forslag
   vise kildene. Ved utilgjengelig tjeneste skal en tydelig feil vises uten falskt
   lagret resultat; tekst/søk beholdes.
4. Åpne et funn, kontroller sitatet og bruk **Tilbake til gjennomgang**. Bytt fane
   og tilbake med et usendt spørsmål. Last opp en ny filversjon og kontroller at
   den gamle gjennomgangen er merket som historisk.
