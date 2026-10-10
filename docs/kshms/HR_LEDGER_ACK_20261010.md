# HR H5b – uavhengig slettekvittering, 10. oktober 2026

Miljømål **BEGGE**, levert bare på `feature/hr-ledger-ack-gate-20261010` / Preview / Sandbox. Ren base: Production/main `c3d873e0e5bd2677f0205143de6edc1fbd95ae4c`, tre `75e07665d71047e187111eb7476949fa7902688b`. Ingen demo-overlay føres tilbake. Production/main og tidligere bruker-TEST OK beholdes.

## Avgrenset endring

- Ny migrasjon `20261010160924_hr_ledger_ack_gate.sql`: deaktivert prosjekt-/lagerbinding, privat ack-tabell, completion-trigger, service-only full snapshot og immutable batch-ack. `closure_json` rapporterer ikke sletting som fullført når en kvittering mangler. Eksisterende tilgangssperre og fysisk filarbeider beholdes.
- `scripts/lib/hr-ledger-ack-cycle.mjs` / `scripts/hr-ledger-run-once.mjs`: server/operator-eksport, eksisterende H5a signert skyunion, varig ankerpublisering og ekstra fersk sky-lesing før DB-ack. CLI avviser Production og krever eksplisitt Sandbox-modus. Ingen credentials eller HR-svar i kildekode/logg.
- `HrModule.jsx` / `hrClosureMessage`: status forklarer ventende slettekontroll og uavhengig kvittering. Ingen ny navigasjon, handling, rettighet eller personlig innholdsflate. Eksisterende React-prøve oppdatert til riktig statusordlyd.
- Nye permanente feil-/rekkefølgeprøver, separat PostgreSQL-prøve og rollback-prøve. Ingen tester for Sales/core fjernet eller svekket. Appens pakker/lockfile beholdes.

## Kontrakt

«Slettet» krever både at alle registrerte filjobber er fysisk ferdige og at en serveroperatør har attestert ekstern lagring. Et fraværende lager, ugyldig signatur, gammelt anker, feil prosjekt/lager, konflikten ved sky-skriv, feil readback eller mislykket ankerpublisering gir ingen DB-ack. DB-kvitteringen inneholder bare immutable identifikatorer, revisjon, slettetid, lager, generasjon og digest. Ingen referater, private svar, diagnose, kontakt-/pårørendeinnhold eksporteres.

Operatorroten skal ligge **utenfor database-/filbackup og restorevolumer**, med 0700-katalog og 0600-anker. Hele kjøringen har eksklusiv fil-lås; sky-skriv bruker eksisterende ETag/CAS. Ankeret skrives temp → fsync → rename → katalog-fsync → lesekontroll. Deretter kreves enda en fersk verifisert sky-lesing før batch-ack. DB-ack etter tapt respons kan gjentas med idempotent receipt/generasjon. Replay/re-purge ugyldiggjør tidligere ack. En lavere UUID ved senere sletting fanges av full snapshot; gammel skyunion beholdes ved tilbakeført DB.

En prosesskrasj kan etterlate lås. Et sky-skriv som lyktes før ankerfeil kan kreve særskilt operator-recovery. Verktøyet tilbyr ingen blind retry, rewind eller automatisk tillit til et alternativt anker. En enkelt kjøring gir ikke bevis for permanent scheduler eller varig ekstern driftsbinding.

## Utviklerbevis

1. **20 lokale feil-/rekkefølge-/samtidighetsscenarioer PASS**, inkludert feil før/etter sky-skriv, feil etter varig anker, filrettigheter/symlink, stale/crash-lås, to arbeidere, batchdeling, minimale felter, tapt DB-respons og bevart tidligere sletting. Syntetisk sky/RPC; ingen ekte skykvittering påstås.
2. **42 faktiske PostgreSQL/PGlite-assertions PASS**, versjon 0.5.8 i separat runtime: disabled binding, identity/tid/ekstrafelt/duplikat/unknown/negativ/unsafe generation, transaksjonsrollback, byte/ack-rekkefølge begge veier, replay, immutable receipt, manglende receipt og faktiske SQL-roller/ACL. Plattformadapteren for Auth/Storage/Vault er syntetisk.
3. Berørt faktisk HR/register/KS-meny/Hjelp-React PASS, inkludert honest pending/complete, tilgang/revisjon/fokus/remount/late-response. Ingen ny live browser-PASS for H5b påstås.
4. Full `EXPO_BACKEND_TARGET=sandbox npm run build` PASS med alle eksisterende kritiske kontroller. Emittert app er utelukkende bundet til Sandbox.
5. Sandbox-migrasjon **20261010161625** installert. Fire funksjonskropper matcher lokale MD5-er; tomt search_path; public snapshot/ack bare service_role, private helper ingen klient-/serverrolle-execute. Binding fortsatt `enabled=false`; privat innhold `false` / quarantine `true`; **0 receipts/acks/artifacts/filer**, eksisterende **1 medarbeider** beholdt.
6. Det første forsøket på live rollback-prøve fikk `Invalid or expired requestState` og er historisk **ikke PASS**. I ny sesjon 10. oktober ca. 21:00 Europe/Oslo fungerte lesende connector igjen; deretter bestod den uendrede `scripts/hr-ledger-ack-sandbox-check.sql` på faktisk Sandbox: **HR ledger acknowledgment rollback PASS**. Dette prøver minimal eksport, binding, ekstra felt/identitets-/tidsfeil, duplikat/ukjent receipt, atomisk avslag, generation/digest, retry, ack/filjobb-rekkefølge, replay og ACL. Filjobben avsluttes gjennom DB-funksjonen med syntetisk suksessflag; ingen faktisk Storage-bytefil eller ekstern skykvittering inngår. Alle fixture-rader og midlertidige bindingsinnstillinger ble rullet tilbake. Etterkontroll: **1 medarbeider; 0 receipts/acks/artifacts/filer/filjobber/HR Storage-objekter; ledger enabled=false; content=false/quarantine=true**. Ikke full sky-/restore- eller browser-PASS.
7. Production/main fortsatt eksakt `c3d873e0`; ny ack-tabell finnes **ikke** i Production; privat HR fortsatt stengt. Ingen Production-migrasjon, merge, reell ansattsletting eller aktivering gjort i H5b-leveransen. Separat autorisert systemadmin-testmail er dokumentert nedenfor.

## Gjenstår før privat HR kan åpnes

Et ekte uavhengig privat lager med begrenset token, operatorbootstrap og holdbart anker utenfor restore; faktisk privat anonym-avvisning, skriv/lesing/konflikt/recovery; ekstern scheduler med varsling; vellykket eksport og ack ved hver ny sletting; full isolert Supabase database/Auth/Storage-byte-restore og etterfølgende ansatt-/leder-/leser-/filer-/purgeprøve. Verktøyet er klargjort, men **ikke satt i permanent drift**. Første lagerforsøk tidligere avvist Vercel 403; tilgang er ikke omgått. Ikke restore aktiv Sandbox eller Production. Ingen ny kostnadsbelagt Supabase-ressurs er opprettet.

Aktuelle Supabase-dokumenter om [restore til nytt prosjekt](https://supabase.com/docs/guides/platform/clone-project) og [plattform til isolert instans](https://supabase.com/docs/guides/self-hosting/restore-from-platform) er kontrollert: database/Auth kan inngå, Storage-bytefiler og innstillinger må håndteres separat. Ingen personlig HR-port åpnes på grunnlag av databasekopi alene.

## Andre ferdige/pågående kontroller

Innlogget permanent demo preflight er grønn på `main c3d873e0`, inkludert 2/2 redigerbare Badskisser, tre kursmaler og KS/HMS-kurseksempler. Bare lokal demoskisse installert; Golden/kurshistorikk ikke tilbakestilt.

[Originalt skjermbevis for innlogget demo](evidence/PREFLIGHT_20261010.jpg). Bildet gjelder den eksisterende demoen, ikke H5b-Preview.

## Faktisk Production-testmail, 10. oktober ca. 21:08 Europe/Oslo

Én tidligere autorisert test til `kenneth@ringside.no` ble sendt **én gang** 10. oktober ca. 21:08 Europe/Oslo i den eksisterende innloggede Production-flyten **Systemadmin → Send e-post til brukere → 1. Kontroller mottakere → 2. Send test**. Kenneth meldte «innlogget» før handlingen; synlig økt viste riktig konto. Emne: «Expo ProffDok – avtalt test av e-post 10.10.2026». Meldingen inneholdt bare ufølsom testtekst.

Appen bekreftet **«Test er sendt kun til kenneth@ringside.no.»** Mottakerpreview viste 37 kvalifiserte brukere, men **3. Send til mottakergruppen ble ikke klikket**. Ingen masseutsending eller nytt sendeforsøk. Etter skjermbevis gikk fanen tilbake til Startside. Den ene sendeautorisasjonen er brukt.

[Originalt skjermbevis](evidence/TESTMAIL_SENT_20261010.jpg). Dette er faktisk innlogget appbekreftelse for `systemadmin-broadcast-email` sin testhandling. **Mottak er dokumentert med Kenneths vedlagte skjermbilde** av den åpnete e-posten med eksakt `[TEST]`-emne, testmerke og melding; [originalt mottaksbevis](evidence/TESTMAIL_RECEIVED_20261010.png). Bildet kom i denne samtalen ca. 21:13 Europe/Oslo. Dette beviser ikke KS/HMS-tildelingskøens fullstendige leverings-/lenke-/retryflyt eller at e-postlenken er åpnet. Ingen credentials, JWT, cookies eller intern auth-state ble lest; ingen SQL/service-role-omgåelse av innlogging.

## Fersk miljøkontroll, 10. oktober ca. 21:00 Europe/Oslo

| Miljø | Faktisk observert |
| --- | --- |
| Remote main / Production | `c3d873e0e5bd2677f0205143de6edc1fbd95ae4c`, tree `75e07665d71047e187111eb7476949fa7902688b`; fast produksjonsalias READY på `dpl_BHpnnv8bnyo8wU3oLUE9NEsgixd5`. |
| Remote demo / fast demoalias | `11f1b45dac4daa08efc850ba87ad5e28522dad4c`; alias READY på **dpl_3uegJLq87zotYZFvFQQpfLM5vEsw** med samme SHA. Dette er nyere aliasbevis enn deploy-ID-en i handoffen, ingen ny deploy utført. Gammelt innlogget preflight-bevis beholdes; ikke ny innlogget demo-/H5b-prøve. |
| PR #217 | Open/draft, ikke merged, head `ecd700acc72951303cc59647a7089eaf09fffbd7`, tree `2c26427a35732ee047238a9bc6ec7c38dc26bd87`, én commit foran faktisk main. Core Safety **38076078790 completed/success**. |
| H5b Preview | `dpl_GAB5Qpjwn4AcmjfcAM7y9dF6aiF7` READY på eksakt PR-SHA; direkte branch-env `EXPO_BACKEND_TARGET=sandbox` for `feature/hr-ledger-ack-gate-20261010`. Ingen innlogget H5b-browser-PASS. |
| Backend / e-post | Begge private HR-porter fortsatt false/true. Ack-tabellen finnes ikke i Production. Production e-post enabled=true, Sandbox enabled=false. Konfigurasjonsbeviset er supplert av én innlogget systemadmin-testmail og Kenneths skjermbilde av mottatt e-post ovenfor. Sandbox-branchmetadata har fortsatt historisk MIGRATIONS_FAILED fra september, mens SQL er tilgjengelig og preview_project_status ACTIVE_HEALTHY; ingen blind branch-reset/merge. |
| Lokal checkout | `/workspace/scratch/16c991cab440/expo-proffdok-hr-ledger`; syntetisk/detached `ca0b7ff3` med tre eksakt likt PR-head. Lokal base `f0ac2f7d` har tre eksakt likt remote main. Dokumentasjon publiseres via GitHub med faktisk remote PR-head som forelder og expected-head lease; aldri push av syntetisk historie eller demo → main. |

Bare dokumentasjon endres i denne oppfølgingen. Tidligere 20/42/React/build-bevis og Kenneth TEST OK beholdes; ingen ombygging, svekkede tester eller ny app-/Production-/demo-release.

## Neste konkrete driftshandling

1. Få lageret provisionert gjennom en tilkobling med faktisk Blob-opprettelsestilgang i team `team_Yvcnc6KRYfVB1W2LQjCffZGT`, eller av lagereier: separat **privat** `expo-hr-ledger-sandbox-ppvircenkjizeiqdxphj`, fra1, uten Production-/prosjekttilkobling. Den avviste opprettelsen gjentas ikke før tilgang er endret. Store-ID, origin og begrenset token bindes server-only; ingen token sendes i chat/git/VITE.
2. Etabler uavhengig varig operatorvert og anker utenfor alle restorevolumer. Deretter utfør faktisk bootstrap, anonym avvisning, skriv/readback, ETag-konflikt og kontrollert recovery før binding/scheduler. Lokal scratch eller en Vercel Functions midlertidig filkatalog er ikke et varig uavhengig anker.
3. Klargjør isolert Supabase testkilde/mål med syntetiske Auth-brukere og bytefiler; aldri restore Production eller aktiv kurs-Sandbox. [Supabase restore til nytt prosjekt](https://supabase.com/docs/guides/platform/clone-project) og [CLI backup/restore](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore) er kontrollert via leverandørens dokumentasjon i denne sesjonen: database/Auth kan kopieres, men Storage-bytefiler og innstillinger må håndteres separat. Ingen ny isolert instans eller full restore er utført. Tilgjengelige connectorressurser er Production og dens eksisterende demo-sandbox; lokalt Docker/psql er ikke tilgjengelig.
4. Verifiser gjenopprettet tilgang, bytehash, revokering og purge med ekstern skyunion/ferskt uavhengig anker. Hold content_enabled=false/restore_quarantined=true til hele kjeden har faktisk bevis. Ingen H5b-merge til main er autorisert av PR #216-godkjenningen.

## Reproduserbare utviklerprøver

```sh
node scripts/critical-hr-ledger-ack-cycle-check.mjs
HR_PGLITE_PATH=/private-runtime/node_modules/@electric-sql/pglite/dist/index.js node scripts/hr-ledger-ack-db-check.mjs
KSHMS_JSDOM_PATH=/private-runtime/node_modules/jsdom/lib/api.js node scripts/hr-register-react-check.mjs
EXPO_BACKEND_TARGET=sandbox npm run build
```

Operatoren trenger eksisterende H5a servervariabler, eksakt `@vercel/blob 2.8.1`, `HR_LEDGER_ANCHOR_ROOT`, `HR_LEDGER_SUPABASE_SERVER_KEY` og `HR_LEDGER_RUN_MODE=SANDBOX`. Ikke legg noen privat variabel i `VITE_*`, git eller browser. Bootstrap/konfigurasjon og ekstern scheduler er egne driftshandlinger etter faktisk lagerprøve.

## Dokumentasjonspublisering før testmail

Dokumentasjonshead `287a80aaaeae21162735ad8a5187b88bae312618`, tree `ddba94c3864bc2c71b584354ccbac09f360b8787`, hadde Core Safety **38078311463 SUCCESS** og Preview **dpl_55TUJy7U58CGdj7fv2TrZuNUS4yS READY** på eksakt SHA. Funksjonskoden er fortsatt `ecd700ac`. Den etterfølgende mailoppfølgingen endrer bare statusnotater og originalt skjermbevis på samme draft PR, uten merge.
