# Isolert native Supabase restore-QA

Miljømål SANDBOX/DEMO. Kjør bare `node scripts/hr-native-restore-check.mjs` på en disponibel Docker-vert med Supabase CLI 2.120.0 og Node24. CI-jobben `.github/workflows/hr-native-restore.yml` kjører automatisk ved relevante endringer i PR mot main. Eksisterende Core Safety er uendret.

Testen oppretter sin egen tilfeldige lokale stack. Den krever API-origin `http://127.0.0.1:54321`; ingen prosjektlink, cloud-secrets eller faktiske persondata brukes. Alle Auth-brukere har oppdiktet `.invalid`-epost og tilfeldig passord. Native Auth bekrefter faktisk brukeren; ingen syntetisk auth.uid, JWT-forfalskning eller SQL-auth-setting brukes. Firma-/profilgrunnlaget er en avgrenset fixture, ikke full produksjonsprofil-QA.

Scenario:

1. Installer fem uendrede H1/H3/H4/modultilgangsmigrasjoner over ekte Auth/Storage/Vault/Cron/pg_net og et eksplisitt firma-testsubstrat.
2. Opprett fire native Auth-brukere, fem syntetiske innholdsfamilier, to registrerte private filer, en orphan og en annen medarbeiders fil. Kontroller faktisk tilgang og avvisning.
3. Stopp egne API-containere og deretter PostgreSQL. Kopier hele det kalde PostgreSQL/Auth-volumet og native Storage-bytevolumet. Ledger ligger utenfor begge.
4. Avslutt testmedarbeideren via faktisk innlogget native RPC. Kjør den uendrede filarbeideren mot native service-only RPC og Storage API; slett faktisk byteinnhold. Slett deretter den oppdiktede Auth-brukeren via Auth Admin API og krev avvist ny innlogging.
5. Stopp egne containere. Gjenopprett begge fysiske volumene. Start PostgreSQL først, bekreft at gammel åpen DB-flagging er tilbake, og sett karantene **før** API starter. Krev at native Auth-innlogging og filenes opprinnelige hash er gjenopprettet; behold uavhengig Edge-port stengt.
6. Replay uavhengig signert testledger. Kontroller slettede registre/tilganger, fysisk filpurge, bevaring av annen medarbeider og filer, file-only tilbakekomst og idempotent replay. Innhold skal forbli stengt.
7. Fjern kun egne tilfeldige stack-volumer og lokale backupfiler. Ingen backup eller credentials publiseres som CI-artifact.

PASS kan bare hevdes fra en faktisk fullført native-jobb med alle assertions og opprydding. Bare syntaktisk/lokal kilde-QA er ikke native PASS. Sikker resultatlinje oppgir kjørte assertions og eksakte image-ID-er; stderr, SQL, Auth-responser og credentials skjules. Feil rapporteres med fast fase/HTTP-status/SQLSTATE, uten sensitive providertekster.

## Grenser for beviset

Dette er samme-versjons kald fysisk restore i en disponibel native Docker-stack med syntetiske data. Det er **ikke** managed-cloud Supabase backup/PITR, full produksjonsprofil/onboarding-QA, varig produksjonsanker eller H5b service-only DB-ack. Fem eksisterende H1/H3/H4-migrasjoner prøves; H5b-ack-migrasjonen er ikke installert i denne testen. De tidligere PGlite-prøvene har syntetiske plattformadaptere og er fortsatt merket separat.

Før privat HR kan åpnes gjenstår betrodd bootstrap/varig uavhengig anker/signing key, faktisk isolert kilde/kontroll/ack-flyt, ekstern scheduler med varsling og full managed-cloud database/Auth/Storage-byte-restore med komplett appgrunnlag og etterfølgende tilgangs-/fil-/purgeprøver. Production, kurs-Sandbox og kontrollprosjekt skal aldri restores som test.
