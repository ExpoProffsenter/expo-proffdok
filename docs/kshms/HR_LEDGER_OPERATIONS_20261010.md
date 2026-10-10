# H5b driftsklargjøring – 10. oktober 2026

Miljømål **SANDBOX/DEMO** for operator-/restorekontroll. Ingen endring av Production, permanent kursdemo, appkode, SQL-migrasjoner, tester eller privat HR-port. Dette er en klargjort driftsoppskrift, **ikke utført sky-/restore-PASS**. Autorisert testmail er allerede sendt én gang; Kenneths skjermbilde dokumenterer mottak. Ingen ny mail sendes som del av denne klargjøringen.

## Faktisk kontroll ca. 21:17–21:33 Europe/Oslo

- Remote main/Production `c3d873e0`, READY `dpl_BHpnnv8bnyo8wU3oLUE9NEsgixd5`. Remote demo `11f1b45d`, fast alias READY `dpl_3uegJLq87zotYZFvFQQpfLM5vEsw`. PR #217 open/draft, head før denne dokumentasjonsoppdateringen `f057da4d720f7e9416c0694ac80b3338571f90c7`; funksjonskode fortsatt `ecd700ac`. Ingen merge/deploy til Production/demo.
- Vercel team `team_Yvcnc6KRYfVB1W2LQjCffZGT`, slug `ringside`, har én bekreftet OWNER, Kenneth. Eierrollen beviser ikke endrede connectorrettigheter. Det tidligere 403-avviste opprettelseskallet ble **ikke gjentatt**. Ingen nytt lager/token; lageroversikten ble ikke tilgjengelig.
- Én eksisterende cloud-fane ble brukt til lageroversikten. Vercel ba om innlogging; Kenneth valgte GitHub gjennom browserAuth. Første device-kode ble avvist. Etter Kenneths uttrykkelige beskjed om å prøve på nytt ble én ny kode sendt fra GitHub til den registrerte, maskerte e-postadressen og verifikasjonen kom videre til Vercels eget 2FA-steg. Vercel krevde autentiseringsapp eller eksisterende recovery-kode; sikker forespørsel ble avbrutt. Kenneth opplyste at koden ikke finnes i hans autentiseringsapp. Ingen ny automatisk retry, passord/2FA-endring eller omgåelse. Ingen credentials/cookies/JWT/auth-state hentet eller rekonstruert. Ingen ny guard-feil eller browserprosess-restart attestert.
- Supabase viser bare eksisterende `expo-proffdok` i `ExpoProffsenter's Org` (`oolmxqndmldzpylahcjl`) og dens eksisterende `demo-sandbox`-branch. Ingen isolert skyinstans opprettet. Begge `get_cost`-oppslag (branch/prosjekt) returnerte **UNAVAILABLE: MCP tool get_cost was not returned by tools/list**. Ingen pris, kostnadsbekreftelse eller ressursopprettelse påstås.
- Ny lokal vei undersøkt: offisiell Supabase CLI **2.120.0**, pinnet/installert utenfor apprepoet; faktisk `--help` bekreftet eksperimentell `stack start --runtime native`. Native krever ikke Docker. Første oppstart avviste systembrukeren nobody; én korrigert oppstart med eksisterende ikke-root-bruker oai kom til artifact preparation. Deretter **ExperimentalStackStartError**: `getaddrinfo ETIMEOUT` mot både `github.com` og `supabase-cli-artifacts.s3.us-east-1.amazonaws.com` for PostgreSQL **17.11.0.004-r1**. Ingen database/Auth/Storage/restore startet. Bare ufullført lokal stackregistrering finnes; målrettet stop returnerte unavailable, ikke en påstand om stopp av kjørende tjenester. Ingen nettverksomgåelse eller eskalering.
- Fersk direkte SQL-etterkontroll: Production `content_enabled=false`, `restore_quarantined=true`, ingen H5b-ack-tabell. Sandbox samme portstatus, ledger enabled=false; **1 medarbeider, 0 receipts/acks/artifacts/filer/filjobber**. Ingen endring i aktive miljøer.

## Ressurser som må være konkrete før skyprøven

| Ressurs | Konkret klargjøring |
| --- | --- |
| Privat Blob | Separat `expo-hr-ledger-sandbox-ppvircenkjizeiqdxphj`, region fra1, access private, team ringside. Ingen prosjekttilkobling eller automatisk env-kopiering. Opprett først gjennom faktisk autorisert tilgang; ikke gjenta avvist connectorhandling uten endret tilgang. |
| Store-token | Begrenset til det separate lageret; server-only hemmelighet på operatorverten. Store-ID og privat origin skal verifiseres mot tokenbindingen uten å logge token. Ingen token i chat/git/VITE/browser. |
| Operatorvert | Varig separat vert og beskyttet volum utenfor database-/Storage-/apprestore. Scratch og Vercel Functions midlertidige filer er ikke et varig anker. Eier, tilgang og backup-/restoregrenser må registreres. |
| Anker/nøkkel | Absolutt operatorroot 0700; anchor.json 0600 og uavhengig 32-byte HMAC-nøkkel. Gjenoppretting av applikasjonen må aldri gjenopprette nøkkel/anker til eldre tidspunkt. |
| Restorekilde/-mål | Bare nye isolerte miljøer med syntetiske brukere/filer. Ingen backup med reelle Production-/kursdata. Aldri restore aktiv Sandbox eller Production. Native runtime kan undersøkes igjen først etter at offisielle artifact-downloads faktisk er tilgjengelige. |

## Serverkonfigurasjon for eksisterende operator

| Variabel | Verifisert kontrakt |
| --- | --- |
| HR_LEDGER_RUN_MODE | SANDBOX |
| HR_LEDGER_PROJECT | ppvircenkjizeiqdxphj; CLI er uttrykkelig låst til denne Sandbox |
| HR_LEDGER_STORE_ID | Faktisk privat store_ID |
| HR_LEDGER_BLOB_ORIGIN | Faktisk `https://ID.private.blob.vercel-storage.com`; samme ID som token/lager |
| HR_LEDGER_BLOB_TOKEN | Lagerbegrenset server-only hemmelighet |
| HR_LEDGER_HMAC_KEY | Uavhengig kryptografisk nøkkel, 64 hextegn; ikke logget |
| HR_LEDGER_ANCHOR_ROOT | Absolutt privat varig root utenfor alle restorevolumer |
| HR_LEDGER_BLOB_SDK_ROOT | Absolutt installasjon av eksakt @vercel/blob 2.8.1 utenfor apprepoet |
| HR_LEDGER_SUPABASE_SERVER_KEY | Sandbox servernøkkel, sikkert provisionert på operatorverten; aldri brukes til browserinnlogging |

Eksisterende kjøring, først etter faktisk bootstrap/lagerkontroll:

```sh
node scripts/hr-cloud-deletion-ledger.mjs verify /absolutt/privat/anchor.json
node scripts/hr-ledger-run-once.mjs
```

`sync`/`verify` oppretter ikke manglende skylager/manifest. Bootstrap er et eget eksplisitt steg med signert generation=0, receipts=[]; opprinnelig tomt objekt og anker må bindes, lagres holdbart og leses tilbake før DB-binding. Ingen blind «nytt anker» når et eksisterende objekt/anker er borte eller gammelt. Bootstrap er ikke utført og skal ikke erstattes av syntetisk SDK-transport. CLI skal ikke retargetes til Production eller en restoreinstans ved å svekke Sandbox-sperren.

## Faktisk sky-QA og drift

1. Verifiser anonym avvisning av det private objektet og riktig project/store/origin-binding. Deretter faktisk signert skriv/ukachet readback og samsvar med varig anker.
2. Bevis stale ETag-konflikt uten overskriving, feil før/etter sky-skriv, feil ved ankerpublisering og kontrollert recovery fra gjenværende lås. Cloud-resultat skal holdes adskilt fra eksisterende 20 syntetiske scenarios.
3. Aktiver binding bare i Sandbox etter bevisene, med privat innholdsport fortsatt stengt. Kjør full minimal snapshot → skyunion → varig anker → fersk readback → service-only ack. Manglende/feil/gammel kvittering skal aldri gi complete.
4. Etabler ekstern scheduler på operatorverten, foreslått hvert femte minutt, ingen samtidige kjøringer. Ikke blind retry etter krasj/lås. Varsling for feilkjøring og uteblitt/forsinket vellykket kjøring skal testes med avklart mottaker og uten HR-innhold/nøkler i meldingen. Scheduler, intervall og alerttransport er **ikke installert**. En ChatGPT-påminnelse erstatter ikke operatorjobben.

## Isolert restoreprotokoll

1. Registrer eksplisitt kilde-/målidentitet og avvis både Production- og aktive Sandbox-ref før noen backup/restore. Bruk syntetisk firma, medarbeider, leder, ekstra leser, uvedkommende og separate reelle Auth-identiteter.
2. Installer verifisert faktisk applikasjonsskjema og uendrede relevante migrasjoner; ingen syntetiske Auth/Storage/Vault-adaptere som erstatning for ekte plattformbevis. Portene skal være stengt før restore og under tilgangsprøvene. Ikke slå på privat HR i aktive miljøer for å få fixtures.
3. Ta ekte database/Auth-backup samt separat Storage-bytebackup med navn/lengde/SHA-256. Registrer konfigurasjon og eventuell krypteringsrot etter plattformens restoremetode. Backup av metadata alene er utilstrekkelig.
4. Slett bare de uttrykkelig syntetiske innholdsfamiliene/filene i isolert kilde. La annen medarbeider og dennes fil bestå. Bevar nyere ekstern signert union og varig anker utenfor backupen.
5. Restore gammel database/Auth og bytefiler til isolert mål. Bevis at gamle syntetiske rader og filer fysisk kom tilbake, mens det uavhengige ankeret/unionen beholdt nyere sletting. Ingen bruker skal få lese tilbakeført HR-innhold før avstemming.
6. Kjør eksisterende reconcile-SQL fra ferskt eksternt verifisert manifest med fail-stop ved SQL-feil. Kjør faktisk Storage-API-worker, kontroller bytefravær og nye ack-krav. Prøv fil-only restore der medarbeiderraden allerede mangler, tapt respons/retry og stale anker.
7. Bruk ekte isolerte Auth-økter for medarbeider/leder/leser/uvedkommende, firmabytte og revokering. Kontroller beskyttet filtilgang, bevart annen medarbeider/fil og fysisk purge. Registrer faktisk resultat per trinn. Plattformlokal PASS er fortsatt ikke en Supabase-cloud-backup/PITR-PASS.

Ingen HR-åpning eller PR #217-merge før faktisk uavhengig drift og hele nødvendige restorekjeden er dokumentert. Første hindring er nå konkret tilgang til Vercel-lager og en vert med tillatte leverandørnedlastinger, eller godkjent isolert skyressurs med faktisk kostnadsavklaring. Appkode skal ikke endres for å kompensere for tilgangs-/nettverksfeil.

Kontrollerte primærkilder: [Supabase native runtime](https://supabase.com/docs/guides/local-development/docker-and-native-runtimes), [flere lokale prosjekter](https://supabase.com/docs/guides/local-development/running-multiple-local-projects), [database/Auth/Storage restore](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore). Kildeinnhold og CLI-help ble kontrollert i denne sesjonen; eksperimentelle flagg skal kontrolleres på nytt ved senere installasjon.
