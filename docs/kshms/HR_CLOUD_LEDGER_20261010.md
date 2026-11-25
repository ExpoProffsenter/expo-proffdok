# HR H5a – privat skyadapter for slettemanifest

## Scope før endring

Miljømål **BEGGE**, levering bare feature/Preview og Supabase Sandbox `ppvircenkjizeiqdxphj`, draft PR #216. Faktisk remote feature før endringer: `0c1a62e665ffcd545ad4c08a0fb4e63aa1539855`, tree `a0c65424597300bc45d03805799bd5461847457a`. Main direkte kontrollert: `155f6c4ac01f126c1db0c65da385cfd9305587d5`. Lokal historie har andre commit-ID-er, men samme baseline-tree. Ingen blind push eller merge.

Avgrenset første del: operator-adapter for et eksisterende privat eksternt manifest, fersk lesing, prosjekt-/lager-/tokenbinding, signatur, konfliktvern og kontrollert lesekvittering. Filer: `scripts/lib/hr-cloud-deletion-ledger.mjs`, `scripts/hr-cloud-deletion-ledger.mjs`, `scripts/critical-hr-cloud-deletion-ledger-check.mjs`, `scripts/hr-cloud-sdk-contract-check.mjs`. H4-biblioteket får bare offentlig `sealLedger` med eksisterende validering; `critical-kshms-check.mjs` inkluderer den nye permanente prøven. Dokumentasjon: dette notatet, OVERSIKT/CONTINUITY/PLAN/QA/USER_TEST, MODULE_LAYOUT, CURRENT_RELEASE_STATUS og README.

Ingen app-/layout-/navigasjonsendring, database/migrasjon, worker, Storage-konfigurasjon, privat innholdsport, e-post eller Production i denne delen. Automatisk eksport/DB-ack ved hver sletting og full isolert Supabase-restore er egne gjenstående leveranser. Ingen juridisk frist implementert.

## Kontrakt og begrensninger

- Bare de syv eksisterende minimale receipt-feltene. Ingen navn, adresse, pårørende, samtaletekst eller fraværsinnhold i manifestet. Identifikatorer er fortsatt beskyttelsesverdige, ikke anonyme.
- HMAC/prosjektbinding følger uendret H4-format. En uavhengig, betrodd ankerrad har `project`, `storeId`, `generation`, `hmac`. Både generasjon og digest må samsvare. Gammel gyldig signatur eller en alternativ utgave med samme generasjon er ikke tilstrekkelig.
- Ankerraden, HMAC-nøkkelen og operatorlagringen skal være utenfor database-/filrestore-området. En kopi restaurert sammen med databasen er ikke et betrodd anker. Kontrollert, uavhengig oppdatering av siste anker gjenstår i driftsbindingen.
- Privat Blob-origin må samsvare med faktisk lager-ID og ID-en i det eksplisitte read/write-tokenet. Tokenet overstyrer `storeId` i SDK 2.8.1; bindingen kontrolleres **før nettverkskall**. Fast prosjektbundet pathname, ingen bruker-URL eller offentlig fil.
- All lesing bruker `access: private` og `useCache: false`. Bare 200, ikke 304 eller fravær. Påkrevd ETag, nøyaktig filstørrelse, maks 40 MB / 100 000 receipts, streng UTF-8/JSON/signaturkontroll. Avbrutt/ugyldig strøm kanselleres. Operasjonen har 30-sekunders feilgrense; tidsavbrudd kan bety at serveren skrev uten at klienten fikk svar.
- Fullt kildesnapshot merges med alle tidligere slettinger. Lavere UUID-er og receipts som mangler i en restaurert kilde beholdes. Eksisterende receipt-identitet kan ikke omskrives.
- Oppdatering krever den ferskt leste ETag-en med `ifMatch`, fast pathname og eksplisitt `allowOverwrite`. Ingen blind retry etter konflikt eller tvetydig nettverksfeil.
- Opplasting gir ikke kvittering alene. Ny fersk lesing må vise nøyaktig signert forventet generasjon/innhold. CLI skriver nytt privat anker med eksklusiv opprettelse og fsync av fil og katalog før den rapporterer suksess. Dette er **ikke database-ack eller godkjenning av fullført sletting**.
- Ingen automatisk opprettelse av et manglende fjernmanifest. Et allerede provisionert, verifisert manifest og betrodd anker er nødvendig før første sync. Bootstrap/recovery krever separat kontroll, særlig etter vellykket server-skriv med tapt svar eller mislykket ankervalg.

Blob er ikke WORM/uforanderlig arkiv. Autoriserte lagereiere kan slette/erstatte filer. HMAC alene gir ikke ferskhetsbevis. Et uavhengig siste anker, avklart bevaring, separat tilgang og verifisert restore-løp er fortsatt nødvendig. Nye ankerfiler er minimale operatorbevis, ikke private HR-eksporter. Ingen HR-port åpnes av verktøyene.

## Aktuelle primærkilder og SDK

[Vercel SDK](https://vercel.com/docs/vercel-blob/using-blob-sdk), private URL-er, `useCache:false`, ETag/`ifMatch` og eksplisitt tokenprioritet kontrollert 10. oktober Oslo. Aktuell publisert npm-versjon lest fra registry: **@vercel/blob 2.8.1**, installert separat med eksakt versjon og uten installskript. Faktisk distribuert kildekode kontrollert for token-/store-ID, privat origin, cache-bypass, conditional-write-header og API-endepunkt. CLI avviser andre SDK-versjoner og custom API-overrides. [Leverandørens kildekode](https://github.com/vercel/storage/tree/main/packages/blob) er primærkilde; fremtidig oppgradering krever ny kontraktprøve, ikke `latest` i appen.

Ingen appavhengighet/lockfil endret. Operator kan installere `npm install --prefix /absolute/operator --save-exact @vercel/blob@2.8.1 --ignore-scripts` og sette `HR_LEDGER_BLOB_SDK_ROOT=/absolute/operator/node_modules/@vercel/blob`. Server-only miljøvariabler: `HR_LEDGER_PROJECT`, `HR_LEDGER_STORE_ID`, `HR_LEDGER_BLOB_ORIGIN`, `HR_LEDGER_BLOB_TOKEN`, `HR_LEDGER_HMAC_KEY`. Aldri `VITE_`/browser/JWT eller logg av nøklene. Ikke koble lageret automatisk til Production eller alle Preview-brancher.

Operator-CLI, når bootstrap og driftsbinding er kontrollert:

```sh
node scripts/hr-cloud-deletion-ledger.mjs verify /outside-restore/anchor.json
node scripts/hr-cloud-deletion-ledger.mjs sync /outside-restore/anchor.json /private/full-snapshot.json /outside-restore/new-anchor.json
node scripts/hr-cloud-deletion-ledger.mjs reconcile-sql /outside-restore/current-anchor.json /private/replay.sql
```

Inndata/anker må være absolutte private 0600-filer uten symlink; snapshots følger `scripts/hr-deletion-snapshot.sql` med uavhengig prosjektbinding. Utdata må ikke eksistere. Oppbevar anker i privat katalog utenfor restore; velg nytt betrodd anker først etter kontrollert suksess. Feil kan ha etterlatt server-skriv/utdata: ikke ignorer feilen eller konstruer et anker fra uverifiserte data. Reconcile-SQL holder portene stengt, slik som H4.

## Faktiske nye bevis

1. **38 permanente lokale feil-/samtidighetsscenarioer PASS**, syntetisk SDK: vellykket union/fersk kontroll; fravær/304/manglende strøm/ETag; størrelsesgrenser/trunkering; offentlig/feil origin/path/query; gammelt eller alternativt gyldig manifest; manipulert signatur/feil prosjekt; endret receipt/dobbelt-ID/sensitivt ekstrafelt; endring før skriv; to samtidige skrivere med én vinner; gammel/fraværende/manipulert/feilende readback etter faktisk adapter-skriv; utilgjengelige credentials; feil anker/token/lager/nøkkel; hengende transport/tidsavbrudd; strømkansellering og generasjonsoverløp. Ingen sensitivt innhold eller live testfixtures.
2. **Faktisk @vercel/blob 2.8.1 med syntetisk HTTP PASS**, Undici MockAgent med ekstern nettverkstrafikk deaktivert: riktig privat URL/cache=0, token, `x-if-match`, overwrite/suffix/access-headere, signert fersk readback og ekte SDK-avvisning av simulert 412. Dette er ikke en faktisk Vercel-lagringsprøve.
3. Berørt eksisterende **H4 ledger-critical PASS** og full **Sandbox critical/build PASS**. Ingen gammel brukerprøve/PDF/ZIP eller browserlayout-test gjentatt.
4. Ny **lesende** Sandbox-kontroll: content_enabled=false, restore_quarantined=true, 1 firma / 1 medarbeider, 0 artefakter/filer/receipts. Ingen schema-/gate-/innholds-/Storage-endring.

## Konkret driftsblokkering

Forsøk på å opprette ett separat **privat** Blob-lager `expo-hr-ledger-sandbox-ppvircenkjizeiqdxphj`, region fra1, eksplisitt team `team_Yvcnc6KRYfVB1W2LQjCffZGT`, **uten projectId/Production-tilkobling**, ble avvist med **403 forbidden: You don't have permission to create the blob**. Ingen lager-ID/token ble returnert; intet lager er opprettet. Ingen tilgjengelig autentisert Vercel-CLI-fallback. Uendret forsøk er ikke gjentatt og browsercredentials/JWT brukes ikke som omgåelse.

Dermed gjenstår faktisk lageropprettelse/privat anonym-avvisning/bootstrap/skrive-lese-konfliktbevis, uavhengig automatisk siste anker, eksport og DB-ack ved hver sletting, feilgjenopptaking og full isolert Supabase database-/Storage-restore. **Privat HR forblir stengt.** Det er ikke grunnlag for å fylle ekte pårørende/samtaler/fravær ennå. Aktiv Sandbox og Production skal aldri brukes til restore-/lasttest.

## Brukergodkjenning og publisering

Kenneths **«kjempefint, takk. kjør videre» er mottatt som TEST OK for levert KS/HMS-/HR-layout**. Min side-retningen og ønsket om senere vurdering i hele appen består. Ingen ny Kenneth-prøve nødvendig for denne operatorleveransen; den endrer ingen skjerm. Tidligere B/C-/PDF-/ZIP-/SJA-TEST OK beholdes. Ikke merge-/Production-/e-postgodkjenning.

Publisert remote SHA/tree, grønn CI, eksakt READY Preview og direkte Sandbox-binding føres i draft PR #216 etter forventet-head lease. Ingen main/demo/Production eller e-postsending. Neste synlige HR-del er medarbeidersamtalen etter de gjenstående åpningskravene.
