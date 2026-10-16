# Samlet UX-runde – 16. oktober 2026

Miljømål: BEGGE. Preview først. Brukeren har bestilt alle forbedringsforslagene
og krever at eksisterende funksjoner bevares. Ny TEST OK kreves før merge.

Baseline: main 5cc7e530685a48f4f59b403357e654e93c724578, godkjent PR #260.
Samme faste Preview og branch beholdes. Ingen demo-overlay legges på main.

## Avtalt scope

- Prosjektlisten: felles definisjon av aktive/arkiverte prosjekter, bevarte eksakte statusfiltre.
- Prosjektflaten: gruppert toppmeny, kompakt status, alle gamle mål og handlinger beholdes.
- Garanti: forklar ulike avviksgrunnlag og konsekvent signeringstekst. Ingen endring av garantikrav.
- Timer: dagens registrering/start, nylig brukte prosjekter og sammenfoldbare vedlegg; samme transport.
- Varer: egne visningsvalg for søk, plukkliste og telling, samme oppslag/leverandørvalg;
  smartere søk i telling via allerede godkjent RPC, gammel modus beholdes.
- HR/håndbok: kompakt oppstart, navn der de er tilgjengelige, statusfilter og kapitler.
- Sjekklister, bilder, produkter: lesende filtre og oversikter som peker til opprinnelig utfylling.
- Planer: vis kvaliteten i person-/deltakergrunnlaget uten å endre oppgaver eller beregninger.
- Salg: tydeligere kundekladd-forhåndsvisning med samme callback.
- Tilgang/overlevering/rapport: oversikt og snarveier; samme koder, signering, eksport og tilgang.
- Startside/Min side: arbeidsvalg basert på allerede tilgjengelige innganger, ingen nye rettigheter.
- Firma-/systemadmin: sammenfoldbar presentasjon, alle eksisterende felt og handlinger beholdes.
- Firmaprofil/hjelp: lesende profilforhåndsvisning og søkbart hjelpesenter.
- Relevante modulfiler/CSS, avgrensede integrasjonspunkter i main.jsx,
  additive scenario-/nettlesertester, eksisterende presentasjonstesters selektorer og release-dokumentasjon.

## Beskyttet

Ingen SQL/migrasjoner, RLS, rolle-/tilgangsregler, databaseinnhold, priser,
beregninger, e-posttransport, publisering/aksept, garantiutstedelse, autosave,
server-first-hydrering, recovery-timere, kladdlagring eller Badskissemotor endres.
Filtre påvirker bare visning; skjulte punkter følger fortsatt lagring og PDF.
Ingen massebekreftelse, automatisk godkjenning eller nye automatiske utsendinger.

Den samlede prosjektstatusen teller sjekklisteavvik og prosjektavvik, mens den
eksisterende garantigaten teller sjekklisteavvik. Dette forklares eksplisitt;
faglig avgrensning endres ikke som del av presentasjonsrunden.

## Verifikasjon

Eksisterende critical checks beholdes. Berørte React-/nettleserreiser skal dekke
bevarte callbacks, kladder, avslag/firmabytte, skjult/tilbake, alle menymål,
filtrering uten datatap, manuell registrering, eksport og smale visninger.
Ingen fysisk telefon/kamera-PASS hevdes uten faktisk prøve.

Status og konkret brukerprøve kompletteres før leveranse.

## Utført lokal QA

- Full `npm run build` med uendrede sikkerhets-/forretningsasserts: PASS.
- Ny `app-ux-review-browser-check`: 55 asserts, alle 18 native prosjektmål,
  aktiv menygruppe, rettighetstilbakekall, uendrede svar, bildekilder/deduplisering,
  dokumentlenker og 1363/768/390/320 px. Syntetisk transport, ingen reelle writes.
- Time React: 91 asserts, inkludert dagens snarveier, valgfri visning av hele uken,
  begge registreringsmåter, kvitteringer, godkjenning/eksport, kladd, timer og avslag.
- Varetelling: 27 asserts, inkludert begge RPC-moduser, leverandøridentitet, null/desimal,
  omlasting/ukjent svar/idempotent retry, konflikt, 122 rader, eksport og firmabytte.
- Firmaadmin: 52 Chromium-asserts, opprinnelige roller/modulvalg, invitasjon/feil,
  firmabytte og sen/tilbakekalt tilgang. Kun mock av e-posttransport.
- Prosjekt/Min side: 83 Chromium-asserts; sjekkliste og prosjektmeny: PASS.
- Salgseditor: 128 Chromium-asserts; salgsoversikt/sak: 57 asserts.
- Smartere prissøk: 70 Chromium-asserts; mobil varesøk: 17 asserts.
- Fremdrift: 128 Chromium-asserts; layout: 54 asserts med alle 21 oppgaver ved
  1768/1440/1280/1024/390/320/844 px. Opprinnelige rad-/høydekrav beholdes.
- HR register/praksis, Min side, modulnavigasjon, håndbok-PDF: PASS.

Eksisterende tester er bare tilpasset de avtalte visningsendringene:
adminfelter åpnes via summary, statusfixture bruker produksjonens filter,
planverktøy bruker direkte summary fremfor alle undernivåer, varesøk testes
via sine egne visningsvalg. Ingen assertions for lagring, autorisasjon,
hydrering, timer, priser, signering, eksport eller e-post er fjernet.
Nye state-settere/RPC-navn er lagt til de eksisterende syntetiske bindingene.

Ingen SQL, backend eller databaseinnhold er endret. Ingen nye fagordaliaser
legges inn uten konkrete eksempler. Bildeoversikten leser bare bilder som
allerede finnes i prosjektets tilgjengelige state. Dagens snarveier på PC
endrer ikke firmaets eksisterende innstilling for mobil timeknapp.

## Konkret prøve i fast Preview

1. Åpne Prosjektliste. Prøv Aktive, Arkiv og et eksakt statusfilter. Åpne prosjekt,
   prøv Oppstart/Gjennomføring/Overlevering og kontroller Status og oppfølging.
2. Min side → Timer: Før timer i dag, Start tidtaking, Vis hele uken. Prøv
   vanlig registrering og valgfritt vedlegg. Åpne en eksisterende registrering igjen.
3. Prissøk: veksle Søk varer/Plukklister/Varetelling. Kontroller eksisterende
   plukkliste og prøv Smartere søk samt klassisk søk i en telling.
4. Prøv Vis sjekklister, Samlet bildeoversikt og Produktdokumentasjon i et
   eksisterende prosjekt. Åpne den opprinnelige dokumentasjonen fra oversiktene.
5. KS/HMS: Vis rutinestatus og åpne et kapittel. Plan → Prosjektvalg, tilbud og
   deling → Bemanningsgrunnlag. HR: åpne Start her og en medarbeider.
6. Firmaadmin: åpne et brukerkort og invitasjonsfeltene uten å sende noe.
   Kontroller firmaprofilens forhåndsvisning, Søk i hjelpen og Forhåndsvis som kunde.

Ny TEST OK kreves etter Preview-prøven. Automatisk QA dekker syntetiske
reiser og skjermbredder; fysisk mobilkamera og faktisk brukervurdering
krever brukerprøve. Production og demo er ikke oppdatert i denne runden.

## Innlogget etterkontroll

Fast Preview på første runde viste riktig 3 aktive prosjekter både på Startside og
Prosjektliste, og egne chatmål (2 prosjekter / 4 meldinger). Alle native prosjektmål
var tilgjengelige. Sjekklistefilter skjulte/viste de samme kortene uten lagring.
Garantien var fortsatt sperret av eksisterende mangler. Bildeoversikten viste 6
unike bilder med 4 av dem også knyttet til sjekklister; referansene er beholdt.
Oversikten viser nå alle opprinnelige plasseringer når samme bildefil er brukt flere
steder. Det endrer ikke eksisterende prosjektkort, dokumentasjon eller rapporttall.

Innlogget kontroll fant en konflikt mellom den nye lokale varemenyen og appens
bevarte capture-lytter for native `nav > button`: lokalt visningsbytte lukket
Prissøk. Løst lokalt ved `div role="group"` for varevisninger. Den eksisterende
navigasjons-/recovery-kjernen er urørt. Mobiltesten monterer nå den faktiske
`installStorePriceSearchUx`, bytter mellom alle visninger og kontrollerer at
arbeidsflaten består, mens native Startside fortsatt lukker den bevisst.
