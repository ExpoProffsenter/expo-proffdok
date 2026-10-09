# HR H4 – slettemanifest og isolert fysisk restore

Miljømål **BEGGE**, levering bare feature/Preview og Sandbox `ppvircenkjizeiqdxphj`. Før endringer var faktisk remote feature **c4acce74e70c48fe9e5b3290230aaabebdb2804f**, tree **c74b4b9f5277c97355a012c608e401f33190bd8d**; main **155f6c4ac01f126c1db0c65da385cfd9305587d5**. Lokal tree var identisk, lokal historikk hadde andre commit-ID-er. Draft PR #216 beholdes.

## Hvorfor HR ser tom ut

Kenneth ber 9. oktober om å fortsette, og spør hvilke private opplysninger dette gjelder. HR har nå register for medarbeider, nærmeste leder og uttrykkelige ekstra lesere. Ingen medarbeidersamtaler, egne forberedelser, fraværssaker eller private vedlegg er åpnet. Dette er fremtidig fortrolig innhold, ikke påstander om eksisterende sensitive data. Registerets identiteter og lederrelasjoner er også personopplysninger og har egen tilgangskontroll.

Medarbeider forbereder samtalen; medarbeider og leder fullfører sammen, begge bekrefter referatet. Sykefravær startes senere manuelt av registrert nærmeste leder. Ingen diagnoser, medisiner, fødselsnummer eller medisinsk sykmelding inngår i første avklarte fraværsscope. [Full byggekontrakt](HR_SCOPE_20261008.md).

## Avgrenset scope før kode

Nye operatorverktøy for minimalt slettemanifest, en ny HR restore-migrasjon, relevante critical-/SQL-/fysiske restore-prøver og disse statusdokumentene. Ingen HR-editor/opplasting, endring av brukerflate, navigasjon, Sales, KS/HMS-innhold, e-post, Production eller main/demo. Ingen gjenoppretting av aktive Sandbox-data. Ingen ny B/C/PDF/ZIP-omtest.

Prøver definert før implementering: manifest uten navn/innhold, privat filmodus, HMAC/prosjektbinding, identitetsendring/stale generasjon, manglende/ødelagt fil, nye UUID-er før gammel cursor, full paging, virkelig fysisk database-/filbackup og restore, sletting av fem innholdsfamilier og bytes, bevart annen medarbeider, uavhengig lukket Edge-port og filrestore når medarbeiderraden allerede mangler.

## Levert kontrakt

- Operator-only Node-verktøy med **minimale ID-er, generasjon og slettetidspunkt**, aldri navn, referat, fraværsdetaljer eller filinnhold. Katalog og nøkkel skal ligge utenfor database-/filbackupens restore-område. Katalog 0700, filer 0600; HMAC-nøkkel kommer fra uavhengig operatørmiljø og logges ikke.
- Eksplisitt initialisering kan ikke overskrive eksisterende manifest. Sync bevarer alle gamle slettinger, også hvis kilden senere er en eldre gjenopprettet database. Immutable receipt-identitet, forventet generasjon og eksklusiv operatorlås hindrer stille konflikter. Tempfil → fsync → atomisk rename → katalog-fsync, med verifisert readback. Prosesskrasj med gjenværende lås krever operatørkontroll; ingen automatisk antakelse om at arbeidet er ferdig.
- Full receipt-snapshot under kort tabellås; ingen inkrementell UUID-cursor som kan overse nye lavere UUID-er. Verktøyet håndterer høyst 100 000 minimale receipts og feiler ved grensen, uten stille avkorting. Ingen ny klient-/Data API-tilgang.
- Verifisert replay-SQL stenger databaseportene i egen statement **før** replay-transaksjonen. Alle receipts behandles i grupper på 100. Replay eller filworker kan ikke åpne innhold. En gammel databasebackup kan heller ikke åpne den uavhengige lukkede Edge-kodeporten.
- Ny `hr_private.restore_reconcile` fanger kanoniske HR-Storage-objekter **selv om medarbeiderraden ikke finnes**. Dette retter et konkret H3-hull ved fil-only restore. Nye/returnerte bytejobber får fersk tilstand uten gammel lease/forsøkstoken; en kvittering blir ikke komplett mens egne bytejobber gjenstår. Storage-bytes slettes fortsatt gjennom API, aldri ved SQL-sletting av metadata.

Dette er et verktøy og testet kontrakt. **Ingen varig ekstern driftslagring er provisionert eller koblet til Sandbox**, og ingen automatisk receipt-eksport/ack ved hver HR-sletting er etablert. Periodisk manuell eksport alene er ikke tilstrekkelig før innhold åpnes. HMAC beskytter innhold/identitet, men beskytter ikke mot at en operatør bytter både hele manifestet og nøkkelen eller gjenoppretter hele den uavhengige lagringen til et eldre tidspunkt. Ekstern drift må ha tilgangsstyring, uavhengig ferskhetskontroll, holdbar skriving/kvittering og avklart oppbevaring av de minimale ID-ene.

## Faktiske bevis og grenser

| Prøve | Faktisk resultat |
|---|---|
| Isolert fysisk PostgreSQL-restore | **39 kontroller PASS**, PostgreSQL **18.3 / PGlite 0.5.8**, fysisk datadir-tarball **4 827 623 byte**, ny separat databaseinstans. Gamle fem innholdsfamilier og to filregistreringer faktisk tilbake etter restore; separat manifest overlevde. |
| Faktiske lokale filbytes | Egen privat HTTP-fixture med filer på disk. To registrerte filer + foreldreløs fil gjenopprettet og hashkontrollert; faktisk eksisterende HR-worker reserverte/kjørte/kvitterte sletting gjennom HTTP. Tre bytebaner borte; annen medarbeiders fil beholdt. Anonymous avvist i **lokal adapter**, ikke påstått Supabase Auth-bevis. |
| Manglende medarbeider | Fil-only restore etter registerpurge lager ny pending-jobb; virkelig byte-sletting og idempotent replay PASS. Uavhengig Edge-port gir 423 selv med true innholdsflagg i gammel databasebackup. |
| Faktisk Sandbox SQL | **11 nye assertions PASS**, syntetiske receipts/firma i rollback, ingen Storage-metadata eller filbytes skrevet. Samme berørte H3 **61 assertions PASS** etter migrasjon. Ingen gamle assertions fjernet/svekket. |
| Permanent critical | Privat durable manifest, HMAC/prosjekt/identitet/CAS, lavere UUID, manglende/tampered ledger, lås, 206 receipts over tre replay-grupper, lukket gate og orphan-kontrakt PASS. Full Sandbox critical/build og scope guard PASS. |
| Live migrasjon | Lokal CLI-fil **20261009211209_hr_restore_reconcile_orphans.sql**; faktisk Sandbox-versjon **20261009211558**. Eksisterende owner-only ACL/tomt search_path beholdt, authenticated/anon/service_role avvist. |
| Lesende Sandbox | **1 HR-firma / 1 medarbeider beholdt**, 0 innhold/filer/receipts/HR-Storage-objekter. content=false / restore quarantined. KS/HMS e-post fortsatt disabled. |

PGlite kjører PostgreSQL i WASM; dumpDataDir/loadDataDir er en fysisk PGlite-backup og ny instans, **ikke en Supabase-cloud-backup eller portabel native pg_dump**. Auth/Storage/Vault/Cron-adapterne i isolert fixture er uttrykkelig syntetiske. Den nye prøven er sterkere enn H3s kopierte rader i én transaksjon, men **full isolert Supabase database-/Storage-restore, varig driftsbinding og separate ekte brukerfiløkter gjenstår**. Sensitivt innhold forblir stengt. Ingen ny browser-PASS eller mobil-/100-firma-lasttest erklæres.

## Gjenta avgrenset lokal fysisk prøve

Testavhengigheten er pinnet utenfor apprepoet, slik at ingen ny dependency følger klient/build:

```bash
npm install --prefix /tmp/hr-restore-runtime --save-exact @electric-sql/pglite@0.5.8
HR_PGLITE_PATH=/tmp/hr-restore-runtime/node_modules/@electric-sql/pglite/dist/index.js node scripts/hr-isolated-restore-check.mjs
```

Alle testdata er syntetiske. Scriptet har ingen cloud-URL/credentials, tar backup av bare sin egen lokale database og rydder testkatalog/databaser/filserver etterpå. Local platform-fixture endrer aldri et cloud-skjema.

## Operatorløp før senere innholdsåpning

1. Velg og provisioner uavhengig privat varig lagring og nøkkelhåndtering, utenfor restore-volumene; bind riktig miljø/prosjekt og oppbevaringskontrakt. Ikke legg reelle manifests/nøkler i Git, appklient eller prosjektets ordinære rapporter.
2. Initialiser én gang med `node scripts/hr-deletion-ledger.mjs init /absolutt/privat-katalog`. `HR_LEDGER_PROJECT` må samsvare med riktig Supabase-prosjekt, `HR_LEDGER_HMAC_KEY` er 32 kryptografisk tilfeldige byte kodet som 64 hextegn. Ingen hemmeligheter som kommandoargument.
3. Kjør `scripts/hr-deletion-snapshot.sql` i operatorøkt med eksplisitt `hr.ledger.project`; lagre JSON-resultatet privat. Sync: `node scripts/hr-deletion-ledger.mjs sync /absolutt/privat-katalog /absolutt/snapshot.json FORVENTET_GENERASJON`. Verify: `node scripts/hr-deletion-ledger.mjs verify /absolutt/privat-katalog`.
4. Koble hver ny sletting til holdbar ekstern manifest-ack og overvåk feil/ferskhet. Ikke åpne HR på antakelsen om at en daglig snapshot alltid kom frem. Separate innganger/tilgang og lukket gjenopprettingsmiljø må sikre at ingen leser returnerte data før kontrollene er ferdige.
5. Ved isolert restore: innholdsportene skal være stengt først. Generer `reconcile-sql` fra **ferskeste uavhengige verifiserte manifest**, til ny privat SQL-fil. Klienten må stoppe ved første SQL-feil. Kjør SQL operator-only, kjør Storage API-worker til dokumentert fravær av alle slettede bytes, kontroller register/innhold/grants og at annen medarbeider beholdes. Dette verktøyet gir aldri åpningsgodkjenning.
6. Full Supabase-cloud-restore og separate innloggede medarbeider-/lederfiløkter i isolert syntetisk miljø. Åpning av konkret HR-innhold er et eget avgrenset steg. Ingen restore mot aktive Sandbox-fixtures eller Production.

Primærkilder kontrollert 9. oktober: [Supabase changelog](https://supabase.com/changelog), [database backups](https://supabase.com/docs/guides/platform/backups), [Storage API-sletting](https://supabase.com/docs/guides/storage/management/delete-objects), [PGlite API](https://pglite.dev/docs/api). Supabase databasebackup inkluderer Storage-metadata, ikke filbytes. Ingen juridiske frister implementert; [HR_SCOPE](HR_SCOPE_20261008.md) krever aktuell kildekontroll når disse bygges.

Tidligere Kenneth TEST OK, inkludert alle 9. oktober SJA-PDF/samlet PDF/ZIP/bilder/manifest/kvalitet/HMS/SJA-bilder, beholdes. Ingen ny obligatorisk brukertest for denne operator/backend-runden. Nøyaktig publisert SHA/tree, grønn CI og READY Preview føres i draft PR #216.
