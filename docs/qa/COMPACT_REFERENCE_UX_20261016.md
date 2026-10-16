# Kompakte referanser – 16. oktober 2026

Miljømål: BEGGE. Denne runden krever egen TEST OK før publisering.
Baseline main: 688d7f63990bde408a8a49d876343ae778022f63, publisert PR #261.
Fast Preview/branch beholdes. Release og supportplan er separate.

## Scope og funksjonsbevaring

- KshmsModule.jsx: kun innledning/veiledning i håndboken får native details.
  Ny rutine-knapper, lokalt utkast/recovery, rutinebibliotek, editor og fremdrift
  er utenfor folden. Ingen handler, effekt, rolle eller godkjenningsregel endres.
- KshmsBulkPublication.jsx: kun forklaringsavsnitt foldes. Knapp, advarsler,
  utvalg, vurdering, samtykke, readback og godkjenningshistorikk er urørt.
- warrantyViewToolsCore.js: eksisterende readiness-kort og original handlingrad
  flyttes foran innstillinger. Readiness/utstedelse/lås beregnes som før.
  Referansegrunnlag og vilkårsforklaring/mottakerfelt foldes. PDF- og signerings-
  knapper samt manglende garantipunkter forblir direkte tilgjengelige.
- helpToolsCore.js: gjeldende vilkårstekst og AppInstallGuide beholdes montert
  inne i native details. Vilkårsversjon og godkjenningsstatus er alltid synlige.
  Rollefiltrering, søk, samtykke og eksisterende innloggingskrav er uendret.
- Etter innlogget QA er også updateHelp i projectWorkflowUx.js og referansepanelet
  i help45b.js omfattet. Kun wrapper/overskrift er endret til native details/summary.
  Navigasjon, tekstinnhold og rollebetingelser beholdes. Faktiske hjelpeinnslag
  testes med lukk/åpne og firmaadmin uten Systemadmin-innhold.
- appUxReview.css: lokal referansestil og kompakt KS/HMS-status/handling.
  Ingen globale navigasjons-/skjemaregler legges til.
- Tester, README, architecture, release-status, supportplan og overlevering.

Ingen main.jsx, Sales, backend, database, e-postarbeider, tilgang, global recovery,
lagring eller garantikrav endres. Support er kun dokumentasjon i denne runden.

## Verifisering

- Full critical/build PASS.
- Ny faktisk Chromium-test compact-reference-browser-check.mjs: 27 assertions
  PASS. Garantikrav/lås blokkerer fortsatt; original utstedelses-/PDF-/tilbakekall-
  callback, signerings-/sjekklisteinngang og KS/HMS neste steg er beholdt.
  Vilkårsstatus er synlig, teksten kan åpnes/lukkes med tastatur og native
  detaljer bevarer monterte felt. Ingen sideveis overflow ved 1280/768/390/320 px.
- Eksisterende faktisk firmagodkjenningstest PASS: 87 utkast, begge lederroller,
  leser/ulagret-sperrer, utvalg, vurdering/samtykke, egen lesebekreftelse, dobbelt-
  klikk, avbryt/rediger, stale/revoked/incomplete/lost/late/readback-feil,
  firmabytte og individuell godkjenning/auto-next. Kun syntetisk transport.
- Publiseringstestens eksisterende transportmock manglet tre exports som dagens
  uendrede KshmsProgressPlans importerer. Kun mockens eksportgrensesnitt er
  komplettert. Ingen scenario, assertion eller sperre er fjernet/svekket.
- React-gjennomgang: ingen nye hooks/effekter, ingen betinget avmontering av
  skjemaer, native summary for tastatur, original dataflyt og callbacks beholdt.
- Ny Chromium-test kjøres permanent i PR Core Safety. Publiseringstest og full
  sikkerhetskontroll samt eksakt head/deploystatus føres i nyeste PR.
- Innlogget Preview-prøve og visuell gjennomgang gjøres før brukerprøven.
  Fysisk mobil/Windows og virkelig e-postmottak påstås ikke testet.

## Kort brukerprøve

1. KS/HMS → Håndbok: status og Neste-knapp skal være synlige. Åpne/lukk
   «Vis veiledning for håndboken». Ny rutine og eksisterende innhold skal finnes.
2. Åpne et prosjekt → Garanti: status/mangler og utstedelseshandling skal komme
   før innstillingene. Åpne «Vis mottaker og vilkårsforklaring» og
   «Vis grunnlag for garantien». Ikke utsted eller trekk tilbake for å teste UI.
3. Hjelp: søk som før. Nederst åpner «Les brukervilkår og personvern» hele teksten.
   Godkjenningsstatus vises også lukket. Åpne «Legg ProffDok på hjemskjermen».

Neste steg etter TEST OK: merge → Production-verifisering → main → demo/preflight.
Start deretter ny chat før support bygges, se docs/CHAT_HANDOFF_20261016.md.
