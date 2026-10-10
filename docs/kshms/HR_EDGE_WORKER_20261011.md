# Isolert HR-serverjobb – 11. oktober 2026

Miljømål **SANDBOX/DEMO**, kun kontrollverktøy, isolert QA og dokumentasjon på draft PR #217. Ingen appkode, appmigrasjon, Production/demo, eksisterende operator/checker, credentials eller tidligere brukerprøver endres. Ingen merge eller privat HR-åpning.

## Levert og installert

`hr-ledger-worker` er installert som **v1 ACTIVE** i expo-hr-control / amduqhmgmeetaatwlmmt. ACTIVE betyr at endepunktet finnes; jobben er **ikke konfigurert eller aktivert**. De syv installerte kildefilene er hentet og sammenlignet byte-for-byte med gjennomgått kode. Bundle SHA-256: `4626918f2b2895a26ac460a209c79b744162cb34d255732ca456083f45bfe7c6`.

Faktisk anonym POST/bootstrap gir **403 / worker_key_not_configured**. POST/cycle med oppdiktet publishable-header stoppes i plattformgatewayen med **401 / Invalid API key**; dette er ikke en prøve med gyldig publishable-key. Dette beviser kaldstart/runtime og avvisning når den nye nøkkelen mangler. Det beviser ikke autentisert skybootstrap, permanent signeringsnøkkel, kildekobling eller database-ack i skyen. Ingen eksisterende nøkkel/token er lest, hentet eller rotert. Browser credential-protection STOP er beholdt.

| Del | Kontrakt |
| --- | --- |
| Autentisering | Bare egen navngitt `hr_ledger_worker` i `SUPABASE_SECRET_KEYS`, på `apikey`, timing-safe sammenligning. Authorization/user-JWT, publishable, default og probe-nøkkel godtas ikke. `verify_jwt=false` er nødvendig for dokumentert sb_secret-transport; obligatorisk egen autentisering kjører før kropp, konfigurasjon og enhver nettverks-/databaseoperasjon. |
| Binding | Kontroll-URL og privat Blob-store/origin er faste. Kildeprosjekt kommer kun fra servermiljø. Production, kurs-Sandbox og kontrollprosjekt avvises før eksport/skriving. Request kan ikke angi prosjekt, URL, nøkkel, token eller store. |
| `plan` | Eksakt generation=0/HMAC og INSERT-only staging-SQL. Ingen nøkkel/token i respons. Ingen SQL, cloud eller source call. |
| `bootstrap` | Faktisk tidligere bootstrap-modul/SQL: eksakt forhåndsstaging, claim, privat missing, create-only, ferske signerte readbacks og kontrollreads. Suksess er fortsatt deaktivert og låst. Ingen app-ack, aktivering eller unlock. |
| `cycle` | Separat `ISOLATED_QA_VERIFIED`-miljøgodkjenning og egen isolert source-secret kreves. Faktisk control-cycle-modul brukes med nye smale HTTP-klienter: apikey uten Bearer, pinnede URL/RPC-navn, redirects avvist, 30 sek timeout, kontrollsvar maks 16 KiB, kildesvar maks 40 MB. |
| Feil | Kun fast feilkode/run-ID, ingen providertekst, receipt-payload, hemmelighet eller stack. Ingen automatisk retry, timeout-overtakelse, delete, unlock eller recovery. Ukjent utfall kan ha skrevet/kvittert; kontrollåsen må beholdes til separat gjennomgått recovery. |

Endpoint: `https://amduqhmgmeetaatwlmmt.supabase.co/functions/v1/hr-ledger-worker`. Tillatt kropp er kun `{ "mode": "ISOLATED_QA", "action": "plan" }`, `bootstrap` eller `cycle`, maks 256 byte og 5 sek lesefrist. Ingen scheduler installert.

## QA og grensene for beviset

- **108 assertions PASS** i `scripts/critical-hr-ledger-worker-check.mjs`: autentisering før sideeffekter, feil miljø/binding, request-felt/mode/method/størrelse, plan uten hemmeligheter, manglende cycle-konfigurasjon, faste feil, riktig apikey og bounded JSON, samt nøkkel-filrettigheter/ingen overskriving/bevaring ved ukjent upload. HTTP/CLI-transporter er syntetiske.
- **243 assertions PASS** i `scripts/hr-worker-integration-db-check.mjs`: faktisk HTTP-handler → faktiske begrensede RPC-klienter → faktiske H5b/control-RPC-er i to separate PostgreSQL/PGlite-motorer. Plan/staging/bootstrap, sperret cycle før eksplisitt fixture-aktivering, full snapshot/union/ack, senere lavere UUID, SQL file-job-gate, samt svar tapt etter cloud-write, faktisk SQL-control-commit og faktisk SQL-ack. Ingen ny skriv ved ukjent utfall/låst run. Cloud/Auth/Storage og filjobb er syntetiske; ikke native eller managed-cloud integration.
- **Full `EXPO_BACKEND_TARGET=sandbox npm run build` PASS**, eksisterende critical checks beholdt.
- De to nye kontrollene er permanente tillegg til Core Safety. Eksisterende 26/21 bootstrap/control-scenarioer, 48+29+37 kontroll-SQL, 87 direkte source/control-integrasjonsassertions og 233 native restore-assertions er ikke endret eller svekket.
- Live kontrollpunkt: **0 rader / 0 enabled / 0 låser**. Production content_enabled=false, restore_quarantined=true, ack_table=false. Kurs-Sandbox tilsvarende lukket, ledger_enabled=false.

## Konkret nøkkeloppsett og videre skytest

Oppsettet krever en gjennomgått operatør i eksisterende Supabase-konto. Agenten skal ikke hente eksisterende secrets eller be om nøkkelverdier i chat. Det er ingen tilgjengelig connector-operasjon for sikker setting av Edge secrets, og tidligere browser STOP skal ikke omgås.

1. Opprett **ny** server-secret med navn `hr_ledger_worker` under kontrollprosjektets Settings → API Keys. Behold verdien kun hos operatøren; den skal ikke kopieres til chat/repo. Denne navngitte nøkkelen er kun for serverjobben og fremtidig serverkaller. Den gamle `hr_cloud_probe` brukes ikke på nytt. Ingen gamle/default-nøkler endres.
2. Før signeringsnøkkel opprettes må kontrollprosjektet være uten eksisterende V1-signer, ingen andre operatører må provisionere samtidig, og en privat katalog **utenfor alle appens backup-/restorevolumer og repo** må være valgt. `scripts/hr-worker-provision-signing-key.mjs --new-key-file /absolutt/privat-katalog/hr-ledger-qa-signing-v1.key` kjøres med `node` fra repoet på operatørens betrodde maskin med autorisert Supabase CLI. Skriptet leser kun secret-navn/digest-metadata, avviser eksisterende `HR_LEDGER_QA_SIGNING_KEY_V1`, lager en kryptografisk ny 256-bit nøkkel i wx/0600-fil og fsync-er fil/katalog. Det sender nøkkelen til kontrollprosjektet via CLI stdin, aldri shell-argument/stdout. Skriptet er testet med syntetisk CLI, **ikke kjørt mot skyen**. Sikre også nøkkelen i operatørens uavhengige krypterte backup. Dette er QA-nøkkelen, ikke automatisk en godkjent Production-nøkkel.
3. Hvis upload feiler eller svaret er ukjent, behold den nye offline-filen. **Ikke kjør provisioning på nytt, slett nøkkelen eller roter automatisk.** Verifiser tilstanden separat uten å eksponere verdien. CLI-setting er ikke en atomisk create-only API; eksklusiv operatørprovisionering er derfor nødvendig.
4. Velg/opprett et separat kildeprosjekt med komplett relevant appgrunnlag og kun syntetiske personer/filer. De tilgjengelige listeførte prosjektene er Production og control; aktiv kurs-Sandbox kan heller ikke brukes som QA-kilde. Ingen nytt betalt prosjekt er opprettet eller kostnad autorisert i denne runden. Opprettelse/managed restore må først ha konkret pris og særskilt avtale.
5. Sett `HR_LEDGER_QA_PROJECT_REF` i control Edge secrets og en separat source-secret fra **det isolerte kildeprosjektet** som `HR_LEDGER_QA_SOURCE_KEY`. Eksisterende `HR_LEDGER_BLOB_TOKEN` for fast privat store er allerede lagret; ikke hent/roter. Kjør autentisert `plan`, gjennomgå eksakt SQL og installer den deaktivert staging-raden bare i control. Kjør én autentisert `bootstrap`. Verifiser permanent cloud-/kontrollstatus; den skal fortsatt være disabled/locked.
6. Før cycle-aktivering må bootstrap-prosessen faktisk være avsluttet, sky-/kontrolltilstanden verifisert uavhengig og den isolerte source-bindingen kontrollert. Koden inneholder **ingen aktiverings-/unlock-route**. Manuell skyaktivering krever et eget gjennomgått SQL-sett og SQL/source-gate-bevis; testens fixture-UPDATE skal aldri kopieres til skyen. Først da kan `HR_LEDGER_QA_CYCLE_APPROVED=ISOLATED_QA_VERIFIED` settes og faktisk sky/source/control/Blob/ack-test kjøres.
7. Scheduler/feilvarsler og managed-cloud Database/Auth/Storage-byte restore følger etter reell integrasjon og gjenopprettings-/fencing-bevis. Kilde og control har ulike restoregrenser; aldri restore aktiv Production, kurs-Sandbox eller control. Privat HR holdes stengt til alle krav er oppfylt.

Ingen ny innlogget Kenneth-brukerprøve kreves for denne serverleveransen. Tidligere TEST OK beholdes. Den gamle syntetiske Blob-orphanen er fortsatt separat, målrettet cleanup-arbeid; ingen bred sletting er gjort.
