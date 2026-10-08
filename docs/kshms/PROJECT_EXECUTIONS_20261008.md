# Vernerunder og 5×5 i prosjektet, ansvarligvarsel og rutinevalg

Kenneth bestilte 8. oktober 2026 prosjektinnganger for vernerunde og 5×5, bare for brukere med KS/HMS-modulen. Tillegget kl. 19:37 Europe/Oslo gjelder begge dokumenttypene: fast appvarsel hos valgt ansvarlig, valgbare rutiner fra firmaets godkjente håndbok og tydelig egen bekreftelse nær fullføringsknappen. Miljømål BEGGE, først samme feature/Sandbox Preview. Ny brukerprøve gjelder disse tilleggene; tidligere TEST OK består.

## Avgrenset scope før kodeendring

- ProjectSjaEntry.jsx: nye prosjektknapper og oversikter, fortsatt innen eksisterende verifiserte KS/HMS-/prosjektport. SJA/RUH-flyten bevares.
- KshmsExecutions.jsx, kshmsExecutions.mjs og kshmsExecutions.css: fast prosjekt, separate prosjektkladder, readback-/scopevern, rutinevalg og bekreftelse ved fullføring.
- KshmsExecutionTasks.jsx og KshmsTasks.jsx: egne ansvarligoppgaver i eksisterende appvarselflate og direkte åpning av gjennomføringsdialog. Eksisterende avviksvarsel beholder sin RPC og ansvarsflyt.
- Ny Sandbox-migrasjon: prosjektavgrenset lesende gjennomførings-RPC og lesende ansvarligoppgaver. Eksisterende kommando, lagrede gjennomføringer, signert SJA, rutineutgaver, tabell-/prosjektrettigheter og e-post endres ikke.
- Relevante permanente critical-checks, faktisk React-/prosjekt-/varselprøve og rollback-SQL-prøve; README, arkitektur, Hjelp og fortsettelsesnotater.

Ingen endring i main.jsx, global meny, prosjektets native fane-ID, Sales/autosave/hydrering, portal, rapporteksport eller Production i denne runden. Rutinevalg er en referanse til gjeldende godkjent utgave og bekrefter ingen gjennomgang. Appvarsel for en kontroll er separat fra eventuelle avvik som må lukkes etterpå.

## Utgangspunkt og bevis

Kontrollert feature-/PR #216-head 2079f5b4ec3e7eaeff0d755c37f7a31294b2182b, open/draft. Main er 155f6c4ac01f126c1db0c65da385cfd9305587d5. Fast Sandbox Preview beholdes.

Read-only fingeravtrykk før endring (full rad-JSON, sortert på ID): signert SJA 1 / 9a8185f140b7483664c0d98a62b54b8e; rutineutgaver 10 / 474ef0379b5149c307ad43be792c18f0. Disse beregnes på samme måte etter QA. Nye app-/databasebevis og endelig SHA/CI/READY tilføyes etter faktisk kontroll. Ingen ny innlogget skjerm-/mobil-PASS hevdes ved oppstart.

## Gjennomført QA og gjenoppretting

- `scripts/kshms-project-executions-sandbox-check.sql`: 44 faktiske assertioner PASS, alle syntetiske rader rullet tilbake. Begge typer, lesing uten kvittering, mislykket fullføring, omfordeling, minimal tildelingsbeskjed uten prosjekttilgang, egen fullføring, uendret historikk, prosjektisolasjon/paginering, låst prosjekt, modulrevokering, anon og ingen e-postkø er prøvd.
- `scripts/kshms-project-executions-react-check.mjs`: faktisk React/DOM med simulert RPC PASS. Direkte prosjektoppretting, separate kladder, rutine med eksakt nummer/utgave, varsel gjennom lesing/offline, direkte oppgaveåpning, tapt fullførings-readback med retry, begge store bekreftelser og bevarte risikobeslutninger er prøvd.
- `critical-kshms-executions-check.mjs`: utvidet med prosjektkladder og den faktiske varseleffekten, inkludert sene svar, firma-/brukergrenser, skjult fane, revokert tilgang og cleanup. PASS. `critical-kshms-deviations-check.mjs` er tilpasset det nye komponentnavnet DeviationTasks og bevarer alle gamle scenarioer; PASS.
- Eksisterende faktiske React-scenarioer `kshms-executions-react-check.mjs`, `kshms-sja-parent-react-check.mjs` og `kshms-job-links-react-check.mjs`: PASS. DOM-prøvene bruker `KSHMS_JSDOM_PATH=/workspace/scratch/19673519cc9a/dialog-test-runtime/node_modules/jsdom/lib/api.js` sammen med eksisterende avhengigheter; ingen pakkeinstallasjon.
- Før/etter identisk fingeravtrykk av sortert `jsonb_agg(to_jsonb(row) order by id)`: signert SJA 1 / `9a8185f140b7483664c0d98a62b54b8e`; rutineutgaver 10 / `474ef0379b5149c307ad43be792c18f0`.

De to additivt anvendte Sandbox-migrasjonene 20261008175102 og 20261008180504 var allerede registrert ved gjenopptakelse. Den sistnevntes eksakte SQL ble hentet fra migrasjonshistorikken for den manglende lokale filen. Ingen ny DDL er kjørt i gjenopprettingsrunden. RPC-ene har eksisterende autorisasjonsporter, tom search_path, PUBLIC/anon-revokes og avgrenset authenticated-grant. Tilsiktede SECURITY DEFINER-advisorer er vurdert mot negative tilgangsprøver; ingen generell advisor-opprydding er hevdet.

Arbeidsmiljøet falt ut med `409 Conflict, environment_offline` før forrige byggresultat kunne leses. Inert kildebackup og status ble sikret i commit a79372a5 / 8549888f. Ved ny tilkobling var hele originalarbeidet, også de faktiske nye testfilene, intakt. Byggloggen viser ferdig Sandbox-bygg. Originalfilene brukes; rekonstruksjonen fra backupen installeres ikke. Fjernhead 8549888f er fast-forwardet inn uten tap av lokalt arbeid.

### Sluttkontroll og publisering

Full `EXPO_BACKEND_TARGET=sandbox npm run build` etter oppdatert Hjelp er PASS med bekreftet exit code 0. Hele den permanente critical-kjeden og Vite-bygg passerer. `git diff --check` PASS. Branch-spesifikk Vercel `EXPO_BACKEND_TARGET=sandbox` er bekreftet som plain config for target preview / feat-kshms-foundation. Commit/tree, CI og READY-bevis fylles inn etter faktisk publisering til samme faste Sandbox Preview. Main er uendret 155f6c4a, PR #216 open/draft. Ingen ny innlogget browser-/mobil-PASS eller bruker-TEST OK hevdes. Kontroll-/risiko-PDF, automatisk bildeoverføring til avvik og separat HR følger senere avtalt scope.
