# Boligprosjekter – første operative etappe

Miljømål: **BEGGE**, Preview/Sandbox først. Baseline main `0730eeb46c49bf45b5d910772da5c2ad7ed60771`. Egen branch `fase45b-boligprosjekter-foundation-20261020`, uten prototype-/demo-overlay. PR #277 beholder klikkbar prototype og større produktkrav.

## Scope

Nye filer i `src/modules/bolig`, avgrenset Hjelp-komponent, fire additive bolig-migrasjoner, to egne runtime-tester og tilhørende README/arkitektur/QA. `src/main.jsx` får kun lazy-import og en autorisert launcher i Startside uten åpent prosjekt. `.github/workflows/pr-core-safety.yml` får et tillegg som kjører de nye testene etter eksisterende kontroller. Eksisterende checkere, menyer, Sales, recovery, prosjektlagring, e-post og eksisterende rettigheter endres ikke.

## Leveranse

- Hovedprosjekt, blokker og oppganger med adresse, etasjer og antall boliger per etasje. Inntil 30 etasjer og 20 boliger per etasje; inntil 2000 boliger per hovedprosjekt inkludert skjulte.
- Felles lagring med optimistisk revisjonskontroll. Skjuling og gjenoppretting beholder bolig-ID, kontaktperson og prosjektkobling.
- Leilighetsnummer, kontaktperson og kobling til eksisterende ordinært ProffDok-prosjekt. Selve prosjektet opprettes fortsatt gjennom vanlig prosjektopprettelse. Samme prosjekt kan bare kobles til én bolig.
- Firmaaktivering av systemadmin. Firmaadmin følger aktiveringen; andre interne medarbeidere tildeles lesetilgang eller prosjektledertilgang. Eksisterende prosjekttilgang kreves i tillegg.
- Synlig veiledningsboks «Slik styrer du prosjektet». Eksplisitt lagring med bekreftelse, lokal kladd, synlig konflikt og «Hent siste versjon».

## Verifikasjon

- Den eksakte SQL-migrasjonen kjøres i PGlite med roller og autentiseringskontrakter. 38 kontroller: 500 boliger, delt lesing, firma-/modul-/bruker-/rollegrenser, feil firma også med aktiv modul, låst prosjekt, revisjonskonflikt og rollback, stabile ID-er/kontakt/kobling, deaktivert bruker, tilbakekalt tilgang, direkte tabelltilgang og anonym nektet.
- Faktisk React-komponent kjøres i JSDOM med kontrollert transport. Kontrollerer autorisert launcher, portal uten nestede prosjektskjema, lokal kladd, fanebytte, konflikt/henting/ny lagring, firmabytte og bortfalt aktivering. Dette er komponenttest; den erstatter ikke innlogget integrasjonsprøve.
- Full critical/Sandbox-build PASS. Eksisterende faktisk React-test for KS/HMS + HR + Min side navigation PASS. Eksisterende prosjektmeny-returtest PASS (ordre → Startside/våtrom, KS/HMS, mobiltekster).
- Alle fire migrasjoner installert i Sandbox `ppvircenkjizeiqdxphj`. Ekte PostgreSQL-prøve med eksisterende intern autorisasjon: midlertidig aktivering, nytt syntetisk hovedprosjekt, blokk og 500 boliger, reread og gammel revisjon avvist. Hele testen rullet tilbake. Null testhovedprosjekter igjen. Ingen personidentitet eller token eksportert.
- Supabase security/performance advisors gjennomgått. Nye tabeller med RLS uten policies er tilsiktet deny-all for direkte tilgang; data går bare gjennom kontrollert gateway. To manglende FK-indekser rettet i egen additiv migrasjon. Nye ubrukte indekser er forventet før modulen er tatt i bruk. Andre eksisterende moduladvarsler er utenfor scope.

Kjøring: `HR_PGLITE_PATH=<sti til pglite dist/index.js> node scripts/bolig-foundation-db-check.mjs` og `KSHMS_JSDOM_PATH=<sti til jsdom lib/api.js> node scripts/bolig-foundation-react-check.mjs`. CI installerer pinnede QA-avhengigheter og kjører samme filer. Full critical build og relevante eksisterende navigasjons-/prosjekttester skal være grønne før TEST OK.

## Rettelse fra innlogget prøve

Innlogget Preview med demo-brukeren fant at opprettet hovedprosjekt ikke kom i listen. Årsak: listealiaset `r` kolliderte med PL/pgSQL-recorden `r` under `use_variable`, slik at listespørringen filtrerte på en tom lokal record. Egen additiv migrasjon `20261020203617_boligprosjekter_root_list_scope.sql` gir listealiaset et entydig navn og beholder øvrig gateway/grants. Den nye PostgreSQL-testen feiler før rettelsen og passerer etterpå. Tidligere brukere/data berøres ikke.

Sandbox MCP-historikk bruker servergenererte versjoner: foundation `20261020202112`, FK-indekser `20261020202709`, listescoping `20261020203641`, HTTP-konflikt `20261020204137`; kildefilene er generert med CLI. Ved senere CLI-synk må denne navne-/versjonskoblingen håndteres eksplisitt; migrasjonene skal ikke kjøres dobbelt på Sandbox. Production har ingen av migrasjonene installert.

## Konflikt over ekte HTTP

Innlogget prøve med en ekte usendt kladd og en separat godkjent RPC-endring av samme testbolig avdekket automatisk gjentakelse ved SQLSTATE `40001` i PostgREST 14.5. Egen additiv migrasjon `20261020204107_boligprosjekter_conflict_http_status.sql` returnerer `PT409` for modulens tre eksplisitte revisjonskonflikter. Klienten gjenkjenner HTTP-konflikten og deaktiverer SDK-retry eksplisitt. Etter rettelsen kom konflikten straks frem; lokal tekst var beholdt etter «Hent siste versjon» og kunne lagres bevisst. Ingen generell PostgREST-/auth-/recovery-konfigurasjon ble endret. Den identifiserte gamle testforespørselen var allerede avsluttet da målrettet opprydding ble forsøkt; ingen annen backend ble stoppet. Offisiell forklaring: https://supabase.com/docs/guides/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b .

Innlogget browser → RPC → database-prøve: midlertidig firmaaktivering, hovedprosjekt i liste, blokk og oppgang med 4 + 4 + 3 boliger, kontakt og prosjektkobling, ny innlasting med bevart innlogging, versjonskonflikt med lokal kladd, reduksjon til 8 og tilbake til 11 boliger. Samme bolig-UUID, kontakt og prosjektkobling er beholdt. Rolle-/firma-/tilbakekallingsmatrisen testes i PostgreSQL/React; to ulike ekte brukerinnlogginger er ikke prøvd her. Åpning av eksisterende QA-prosjekt og retur til Startsiden er kontrollert uten å redigere prosjektinnhold. Det nye syntetiske hovedprosjektet er arkivert, testkoblingen til ordinært prosjekt fjernet og firmaaktiveringen slått av igjen. Ingen individuelle tilganger er tildelt.

## Innlogget Preview-prøve før TEST OK

1. Systemadmin velger avtalt testfirma. På Startsiden: «Åpne boligprosjekter» → «Firmaets tilganger» → «Aktiver Boligprosjekter for firmaet». Firmaadmin kan tildele testmedarbeider prosjektledertilgang.
2. «Nytt hovedprosjekt» → fyll prosjektnavn/nummer → «Opprett hovedprosjekt». «Legg til blokk» → «Lagre blokk». «Legg til oppgang» → velg blokk/adresse, antall etasjer og antall per etasje → «Lagre oppgang». Kontroller total og boligkort.
3. Velg bolig. Endre kontakt/leilighetsnummer og «Lagre i firmaet». Åpne fra en annen bruker/enhet med tilgang og hent samme prosjekt.
4. «Hent tilgjengelige ProffDok-prosjekter» → velg eksisterende testprosjekt → lagre → «Åpne leilighetsprosjekt». Kontroller at ordinær prosjektflyt og tilbake til Startsiden fungerer.
5. Gjør samtidig endring i to økter. Gammel økt må få konflikt, beholde kladd og kreve «Hent siste versjon» før ny lagring. Prøv fanebytte med usendt kladd.
6. Reduser/øk etasjer. Tidligere bolig-ID, kontakt og kobling må komme tilbake. Bytt firma: gamle boligdata/dialog skal bort. Test leser og bruker uten tilgang.
7. Fjern testaktivering/tildeling etter prøven. Avklar databevaring før eventuell Production-migrasjon; ingen migrasjon eller firmaaktivering utføres i Production uten releasegodkjenningen.

## Gjenstår etter denne etappen

Grunnpakke, redigering av tilvalgslister, valg per bolig, fremdriftsplan, beboerportal og bestillinger er senere etapper. Bestilling til Expo/Ringside skal gå til avtalt e-postadresse og inneholde adresse, navn og/eller leilighetsnummer og ønsket leveringsdato, eventuelt validert ASCII-fil. Kundens ordrenummer er kundens referanse; leverandørens Cordel-ordre opprettes av leverandøren. Ingen e-post sendes av denne etappen.

Ny TEST OK kreves før merge. Deretter: Production-migrasjoner → merge/releasekontroll → produksjonsverifisering → kontrollert main → demo-synk og sandbox-preflight. Før dette er løsningen en ikke-godkjent foundation-Preview, ikke ferdig operativ modul.
