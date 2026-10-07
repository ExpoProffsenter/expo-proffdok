# Meny, RUH-inngang og norsk dato – 8. oktober 2026

Miljømål: BEGGE, først samme feature/Sandbox Preview. Kenneth meldte at prosjektmenyen manglet Avvik/SJA/RUH, at KS/HMS bare viste SJA som tydelig utførelsesvalg, og at Avvikssentralen viste ISO-datoer. Skjermbildene er gjennomgått. Dette er en avgrenset feilretting, ikke ny SJA/RUH-TEST OK eller produksjonsgodkjenning.

## Årsak og retting

Native prosjektfanen het allerede Avvik/SJA/RUH, men desktopadapterens matcher godtok bare Avvik etterfulgt av mellomrom eller parentes. Den nye fanen ble derfor utelatt fra toppmenyen. Både bootstrap-snarveien og workflowadapterens lenkemål brukte også det gamle navnet.

En felles, avgrenset matcher kjenner nå Avvik og Avvik/SJA/RUH med eventuelt antall åpne avvik. Desktopmenyen beholder hele native etiketten og klikker samme native knapp. Åpne Avvik bruker den faktiske fanen. Bootstrap gjenkjenner også Ordreoversikt. Personlig modultilgang styrer fortsatt Avvik/SJA/RUH og prosjektets Opprett SJA / Registrer RUH; andre brukere beholder Avvik.

KS/HMS-fanen heter nå Avvik/RUH. Den åpner den eksisterende sentralen med Registrer avvik og Registrer RUH. SJA har fortsatt eget valg. RUH betyr rapport om uønsket hendelse; forklaringen vises i sentralen og prosjektinngangen.

Frister vises dd.mm.åååå i KS/HMS-listen, historikkens lagrede saksbilder, ansvarligvarselet og koblede prosjektavvik. Hendelsestidspunkter vises dd.mm.åååå kl. tt:mm:ss i Europe/Oslo. Kalenderfrister formateres uten tidssoneforskyvning. Date-inputenes og serverens verdier forblir ISO; ingen lagrede data eller signerte dokumenter endres.

## Filer og avgrensning

- Navigasjon: src/modules/project/projectNavigationTabs.mjs, src/modules/app/projectWorkspaceHeaderGuide.js, src/bootstrap.jsx, src/modules/project/projectWorkflowUx.js.
- Visning: src/modules/deviations/deviationDates.mjs, src/modules/deviations/deviationViewTools.js, src/modules/kshms/KshmsModule.jsx, KshmsDeviations.jsx og KshmsTasks.jsx.
- Hjelp: src/modules/help/helpToolsCore.js. README, arkitektur og fortsettelsesnotater følger samme faktiske knappetekster.
- Tester: critical-project-navigation-check.mjs, critical-kshms-deviations-check.mjs, kshms-navigation-dom-check.mjs og kshms-job-links-react-check.mjs.
- Ingen endring i main.jsx, database, Auth, Storage, e-post, kunde-/UE-portal eller rapportdata.

## Testbevis

- Full npm run build med EXPO_BACKEND_TARGET=sandbox: PASS; samtlige critical checks og Vite-bygg.
- Permanent critical navigasjonsprøve kjører den faktiske desktopmatcherens definisjon for Avvik, Avvik (4), Avvik/SJA/RUH og Avvik/SJA/RUH (4). Feil funksjonsnavn avvises.
- Faktisk desktop DOM-prøve: PASS for begge modultilstander, begge antall, synlighet, aktiv fane, native klikk, Åpne Avvik, workflowmål, enkel ordre og retur til Startside.
- Faktisk React-prøve for ProjectSjaEntry, SJA, RUH og KS/HMS-parent: PASS. Avvik/RUH åpner begge registreringsvalg; Registrer RUH åpner RUH-skjema; SJA åpner fortsatt sin egen oversikt. Den eksisterende kladd-/nettfeil-/egen-lukking-/prosjektskopingen består.
- Faktisk React-liste og historikk: PASS for frist 10.10.2026 og Oslo-tid ved datogrense (08.10.2026 kl. 00:00:00 / 00:30:00). Native date-input og payload forblir 2026-10-10.
- Ren dato-/tidstest: PASS for tom dato, januar, sommer-/vintertid og ugyldig tidspunkt.
- Første DOM-prøve stoppet under JSDOM-opprydding etter lukking med aktive observere/animation frames; testharnessen kobler nå fra disse før lukking. Første nye React-historikkprøve lette etter knappeteksten Lukk; den faktiske lukkeknappen heter Lukk avviksdialog i aria-label og viser ×. Begge harnessfeil er rettet, avsluttende prøver exit 0.
- Ingen gamle databaseprøver gjentatt; denne rettelsen har ingen SQL-mutasjoner. Forrige migrasjons 93 rollback-assertioner og uendrede signerte SJA-/rutineutgaver står i SJA_RUH_PROJECT_20261008.md.
- Ny innlogget brukerprøve er ikke hevdet gjennomført. Den dokumenterte nettleserblokkeringen ble ikke gjentatt.

Publiseringsbevis og kontrollert feature-/main-head registreres i CONTINUITY.md etter READY. Neste korte brukerprøve står øverst i USER_TEST.md.

## SQL og chatbytte

SQL-kallene i forrige leveranse gjaldt Sandbox-migrasjonen og testene; syntetiske testdata ble rullet tilbake. Selve additive migrasjonen består. Ingen KS/HMS-DDL eller release ble gjort i produksjon. De konkrete tekstene i Kenneths to godkjenningsdialoger er ikke tilgjengelige her.

Fortsettelsesnotatet er varig lagret i Git-repoet. Det trenger ikke kopieres manuelt. En ny chat kan bes om å lese docs/kshms/OVERSIKT.md og CONTINUITY.md; automatisk overføring av hele notatet via ChatGPT-prosjektet er ikke forutsatt.

## Kontrollert publisering

Funksjonskode `4cebc9f8e7d115887a7ef4264c9f5390b3504265`, identisk lokal/remote tree `c746110e2025cb11b06087bec2084abf651442b2`. Samme Preview READY på `dpl_7eswiB6TH89b1VcUJBxAsiX5ckDA`; Core safety + critical build `113066107707` completed/success. EXPO_BACKEND_TARGET=sandbox for denne feature-Preview er kontrollert. Main fortsatt `155f6c4ac01f126c1db0c65da385cfd9305587d5`, PR #216 draft. Ingen TEST OK eller produksjonsrelease.

## Kenneths godkjente delprøve

Kenneth svarte «test ok» 8. oktober 2026 kl. 01:28 Europe/Oslo etter den konkrete meny-/RUH-/datoprøven. Registrert mot feature-head `42204af397fc1fb6187e7e475c951ecdcd007550` og funksjonskode `4cebc9f8e7d115887a7ef4264c9f5390b3504265`. Avvik/SJA/RUH, prosjektets SJA/RUH-innganger, KS/HMS → Avvik/RUH og norsk dato er godkjent. Den prøven skal ikke gjentas uten ny feil. Lagring/gjenåpning av prosjekt-SJA, RUH-oppfølging/egen lukking, resterende fysisk mobil-/flerbrukerprøve og Production-godkjenning er separate gjenstående punkter.
