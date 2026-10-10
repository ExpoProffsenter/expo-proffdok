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
6. Forsøk på ekstra live rollback-prøve fikk connectorfeilen `Invalid or expired requestState`. Det er **ikke PASS**. Etterkontroll fant 0 receipts/acks, deaktivert binding og lukket innhold. Prøven er lagret for senere gjennomføring; uendret feilforsøk er ikke gjentatt.
7. Production/main fortsatt eksakt `c3d873e0`; ny ack-tabell finnes **ikke** i Production; privat HR fortsatt stengt. Ingen Production-migrasjon, merge, e-post, reell ansattsletting eller aktivering gjort i denne leveransen.

## Gjenstår før privat HR kan åpnes

Et ekte uavhengig privat lager med begrenset token, operatorbootstrap og holdbart anker utenfor restore; faktisk privat anonym-avvisning, skriv/lesing/konflikt/recovery; ekstern scheduler med varsling; vellykket eksport og ack ved hver ny sletting; full isolert Supabase database/Auth/Storage-byte-restore og etterfølgende ansatt-/leder-/leser-/filer-/purgeprøve. Verktøyet er klargjort, men **ikke satt i permanent drift**. Første lagerforsøk tidligere avvist Vercel 403; tilgang er ikke omgått. Ikke restore aktiv Sandbox eller Production. Ingen ny kostnadsbelagt Supabase-ressurs er opprettet.

Aktuelle Supabase-dokumenter om [restore til nytt prosjekt](https://supabase.com/docs/guides/platform/clone-project) og [plattform til isolert instans](https://supabase.com/docs/guides/self-hosting/restore-from-platform) er kontrollert: database/Auth kan inngå, Storage-bytefiler og innstillinger må håndteres separat. Ingen personlig HR-port åpnes på grunnlag av databasekopi alene.

## Andre ferdige/pågående kontroller

Innlogget permanent demo preflight er grønn på `main c3d873e0`, inkludert 2/2 redigerbare Badskisser, tre kursmaler og KS/HMS-kurseksempler. Bare lokal demoskisse installert; Golden/kurshistorikk ikke tilbakestilt.

[Originalt skjermbevis for innlogget demo](evidence/PREFLIGHT_20261010.jpg). Bildet gjelder den eksisterende demoen, ikke H5b-Preview.

Testmail til `kenneth@ringside.no` er fortsatt **ikke sendt**. Production secure login meldte submitted, men fersk side og ny fane viste fortsatt innlogging. Brukeren ba om nettleserreset; en frisk fane ble startet og gammel fane lukket. Ingen credentials, JWT eller cookies lest/eksponert eller omgått.

## Reproduserbare utviklerprøver

```sh
node scripts/critical-hr-ledger-ack-cycle-check.mjs
HR_PGLITE_PATH=/private-runtime/node_modules/@electric-sql/pglite/dist/index.js node scripts/hr-ledger-ack-db-check.mjs
KSHMS_JSDOM_PATH=/private-runtime/node_modules/jsdom/lib/api.js node scripts/hr-register-react-check.mjs
EXPO_BACKEND_TARGET=sandbox npm run build
```

Operatoren trenger eksisterende H5a servervariabler, eksakt `@vercel/blob 2.8.1`, `HR_LEDGER_ANCHOR_ROOT`, `HR_LEDGER_SUPABASE_SERVER_KEY` og `HR_LEDGER_RUN_MODE=SANDBOX`. Ikke legg noen privat variabel i `VITE_*`, git eller browser. Bootstrap/konfigurasjon og ekstern scheduler er egne driftshandlinger etter faktisk lagerprøve.
