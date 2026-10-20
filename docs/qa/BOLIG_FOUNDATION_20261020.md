# Boligprosjekter – første operative etappe

Miljømål: **BEGGE**, Preview/Sandbox først. Baseline main `0730eeb46c49bf45b5d910772da5c2ad7ed60771`. Egen branch `fase45b-boligprosjekter-foundation-20261020`, uten prototype-/demo-overlay. PR #277 beholder klikkbar prototype og større produktkrav.

## Scope

Nye filer i `src/modules/bolig`, avgrenset Hjelp-komponent, seks additive bolig-migrasjoner, to egne runtime-tester og tilhørende README/arkitektur/QA. `src/main.jsx` får lazy-import og tilgangsstyrt global menyinngang. CompanyAdminPanel og SystemAdminWorkspace får hver sin avgrensede boligtilgangskomponent. Ingen boligflate monteres på Startsiden. `projectNavigationTabs.mjs` får en valgfri global Boligprosjekter-fane; prosjektmenyen beholdes. `.github/workflows/pr-core-safety.yml` får et tillegg som kjører de nye testene etter eksisterende kontroller. Eksisterende checkere, øvrige menypunkter, Sales, recovery, prosjektlagring, e-post og eksisterende rettigheter endres ikke.

## Leveranse

- Hovedprosjekt, blokker og oppganger med adresse, etasjer og antall boliger per etasje. Inntil 30 etasjer og 20 boliger per etasje; inntil 2000 boliger per hovedprosjekt inkludert skjulte.
- Felles lagring med optimistisk revisjonskontroll. Skjuling og gjenoppretting beholder bolig-ID, kontaktperson og prosjektkobling.
- Leilighetsnummer, kontaktperson og kobling til eksisterende ordinært ProffDok-prosjekt. Selve prosjektet opprettes fortsatt gjennom vanlig prosjektopprettelse. Samme prosjekt kan bare kobles til én bolig.
- Firmaaktivering av systemadmin. Firmaadmin følger aktiveringen; andre interne medarbeidere tildeles lesetilgang eller prosjektledertilgang. Eksisterende prosjekttilgang kreves i tillegg.
- Synlig veiledningsboks «Slik styrer du prosjektet». Eksplisitt lagring med bekreftelse, lokal kladd, synlig konflikt og «Hent siste versjon».

## Verifikasjon

- Den eksakte SQL-migrasjonen kjøres i PGlite med roller og autentiseringskontrakter. 52 kontroller: 500 boliger, delt lesing, firma-/modul-/bruker-/rollegrenser, feil firma også med aktiv modul, låst prosjekt, revisjonskonflikt og rollback, stabile ID-er/kontakt/kobling, deaktivert bruker, tilbakekalt tilgang, direkte tabelltilgang og anonym nektet.
- Faktisk React-komponent kjøres i JSDOM med kontrollert transport. Kontrollerer serverstyrt menyinngang, adskilte adminflater, systemadmin-aktivering av et annet firma uten arbeidsprofilbytte, firmaadmin-grense, individuell lese-/prosjektlederrolle, tilgangskonflikt uten gjentatt skriving og sent svar etter firmabytte, portal uten nestede prosjektskjema, lokal kladd, fanebytte, konflikt/henting/ny lagring, firmabytte og bortfalt aktivering. Dette er komponenttest; den erstatter ikke innlogget integrasjonsprøve.
- Full critical/Sandbox-build PASS. Eksisterende faktisk React-test for KS/HMS + HR + Min side navigation PASS. Eksisterende prosjektmeny-returtest PASS (ordre → Startside/våtrom, KS/HMS, mobiltekster).
- Alle seks migrasjoner installert i Sandbox `ppvircenkjizeiqdxphj`. Ekte PostgreSQL-prøve med eksisterende intern autorisasjon: midlertidig aktivering, nytt syntetisk hovedprosjekt, blokk og 500 boliger, reread og gammel revisjon avvist. Hele testen rullet tilbake. Null testhovedprosjekter igjen. Ingen personidentitet eller token eksportert.
- Supabase security/performance advisors gjennomgått. Nye tabeller med RLS uten policies er tilsiktet deny-all for direkte tilgang; data går bare gjennom kontrollert gateway. To manglende FK-indekser rettet i egen additiv migrasjon. Nye ubrukte indekser er forventet før modulen er tatt i bruk. Andre eksisterende moduladvarsler er utenfor scope.

Kjøring: `HR_PGLITE_PATH=<sti til pglite dist/index.js> node scripts/bolig-foundation-db-check.mjs` og `KSHMS_JSDOM_PATH=<sti til jsdom lib/api.js> node scripts/bolig-foundation-react-check.mjs`. CI installerer pinnede QA-avhengigheter og kjører samme filer. Full critical build og relevante eksisterende navigasjons-/prosjekttester skal være grønne før TEST OK.

## Rettelse fra innlogget prøve

Innlogget Preview med demo-brukeren fant at opprettet hovedprosjekt ikke kom i listen. Årsak: listealiaset `r` kolliderte med PL/pgSQL-recorden `r` under `use_variable`, slik at listespørringen filtrerte på en tom lokal record. Egen additiv migrasjon `20261020203617_boligprosjekter_root_list_scope.sql` gir listealiaset et entydig navn og beholder øvrig gateway/grants. Den nye PostgreSQL-testen feiler før rettelsen og passerer etterpå. Tidligere brukere/data berøres ikke.

Sandbox MCP-historikk bruker servergenererte versjoner: foundation `20261020202112`, FK-indekser `20261020202709`, listescoping `20261020203641`, HTTP-konflikt `20261020204137`, prosjektkobling `20261020205119`; kildefilene er generert med CLI. Ved senere CLI-synk må denne navne-/versjonskoblingen håndteres eksplisitt; migrasjonene skal ikke kjøres dobbelt på Sandbox. Production har ingen av migrasjonene installert.

## Konflikt over ekte HTTP

Innlogget prøve med en ekte usendt kladd og en separat godkjent RPC-endring av samme testbolig avdekket automatisk gjentakelse ved SQLSTATE `40001` i PostgREST 14.5. Egen additiv migrasjon `20261020204107_boligprosjekter_conflict_http_status.sql` returnerer `PT409` for modulens tre eksplisitte revisjonskonflikter. Klienten gjenkjenner HTTP-konflikten og deaktiverer SDK-retry eksplisitt. Etter rettelsen kom konflikten straks frem; lokal tekst var beholdt etter «Hent siste versjon» og kunne lagres bevisst. Ingen generell PostgREST-/auth-/recovery-konfigurasjon ble endret. Den identifiserte gamle testforespørselen var allerede avsluttet da målrettet opprydding ble forsøkt; ingen annen backend ble stoppet. Offisiell forklaring: https://supabase.com/docs/guides/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b .

Innlogget browser → RPC → database-prøve: midlertidig firmaaktivering, hovedprosjekt i liste, blokk og oppgang med 4 + 4 + 3 boliger, kontakt og prosjektkobling, ny innlasting med bevart innlogging, versjonskonflikt med lokal kladd, reduksjon til 8 og tilbake til 11 boliger. Samme bolig-UUID, kontakt og prosjektkobling er beholdt. Rolle-/firma-/tilbakekallingsmatrisen testes i PostgreSQL/React; to ulike ekte brukerinnlogginger er ikke prøvd her. Åpning av eksisterende QA-prosjekt og retur til Startsiden er kontrollert uten å redigere prosjektinnhold. Det nye syntetiske hovedprosjektet er arkivert, testkoblingen til ordinært prosjekt fjernet og firmaaktiveringen slått av igjen. Ingen individuelle tilganger er tildelt.

## Eksisterende prosjektlivsløp

Gjennomgangen fant at standard-FK fra den nye boligkoblingen ville stanse ordinær prosjektsletting. En faktisk PostgreSQL-test viste 23503 før rettelsen. `20261020205027_boligprosjekter_project_link_lifecycle.sql` gjør bare den nye private koblingen til ON DELETE SET NULL. Etter sletting beholdes boligens UUID og kontakt, mens prosjektkoblingen fjernes. Ingen eksisterende slettefunksjon, rettighet eller prosjektrad endres av migrasjonen. Samme migrasjon krever eksplisitt samme firma også ved lesing av koblet prosjekt-ID; flyttes et ordinært prosjekt senere til annet firma, er ID-en maskert også for systemadmin. Begge scenarier er med i de 52 PostgreSQL-kontrollene. Ingen ekte eksisterende prosjektdata ble slettet i Sandbox-prøven.

## Innlogget Preview-prøve før TEST OK

1. «Meny» → «Systemadmin» → «Firmaer og prosjekter». Velg firma under «Firma for Boligprosjekter» og aktiver. «Meny» → «Firmaadmin»: velg lese-/prosjektledertilgang for den ansatte under Boligprosjekter. Ingen firmaaktivering i prosjektflaten eller Firmaadmin.
2. «Nytt hovedprosjekt» → fyll prosjektnavn/nummer → «Opprett hovedprosjekt». «Legg til blokk» → «Lagre blokk». «Legg til oppgang» → velg blokk/adresse, antall etasjer og antall per etasje → «Lagre oppgang». Kontroller total og boligkort.
3. Velg bolig. Endre kontakt/leilighetsnummer og «Lagre i firmaet». Åpne fra en annen bruker/enhet med tilgang og hent samme prosjekt.
4. «Hent tilgjengelige ProffDok-prosjekter» → velg eksisterende testprosjekt → lagre → «Åpne leilighetsprosjekt». Kontroller at ordinær prosjektflyt og tilbake til Startsiden fungerer.
5. Gjør samtidig endring i to økter. Gammel økt må få konflikt, beholde kladd og kreve «Hent siste versjon» før ny lagring. Prøv fanebytte med usendt kladd.
6. Reduser/øk etasjer. Tidligere bolig-ID, kontakt og kobling må komme tilbake. Bytt firma: gamle boligdata/dialog skal bort. Test leser og bruker uten tilgang.
7. De tre interne Sandbox-firmaene og eksisterende syntetiske Expo-ansatte skal forbli aktivert etter brukerens instruks. Tilbakefør bare midlertidige endringer fra selve prøven. Avklar databevaring før eventuell Production-migrasjon; ingen migrasjon eller firmaaktivering utføres i Production uten releasegodkjenningen.

## Gjenstår etter denne etappen

Grunnpakke, redigering av tilvalgslister, valg per bolig, fremdriftsplan, beboerportal og bestillinger er senere etapper. Bestilling til Expo/Ringside skal gå til avtalt e-postadresse og inneholde adresse, navn og/eller leilighetsnummer og ønsket leveringsdato, eventuelt validert ASCII-fil. Kundens ordrenummer er kundens referanse; leverandørens Cordel-ordre opprettes av leverandøren. Ingen e-post sendes av denne etappen.

Ny TEST OK kreves før merge. Deretter: Production-migrasjoner → merge/releasekontroll → produksjonsverifisering → kontrollert main → demo-synk og sandbox-preflight. Før dette er løsningen en ikke-godkjent foundation-Preview, ikke ferdig operativ modul.

## Meny og tilgang – korrigert rollemodell 20.10.2026

Brukerens skjermbilde viste at den tidligere felles aktiveringsflaten og administratorveiledningen var misvisende i prosjektarbeidet. Denne oppfølgingen erstatter den tidligere adminsnarveien:

- Systemadmin → Firmaer og prosjekter → «Firma for Boligprosjekter»: velg hvilket som helst registrert firma og aktiver/deaktiver modulen. Valget bytter ikke arbeidsprofil og gir ikke tilgang til boligdata i andre firmaer.
- Firmaadmin → «Boligprosjekter · [aktivt firma]»: velg Ingen tilgang, Lesetilgang eller Prosjektledertilgang per godkjent intern ansatt. Firmaadmin har prosjektledertilgang når firmaet er aktivert. Ordinær Prosjekter og dokumentasjon kreves fortsatt.
- Meny → Boligprosjekter vises bare når serveren bekrefter enabled for innlogget bruker/aktivt firma. Vanlige brukere får ingen administratorveiledning. En gammel inngang etter tilbakekalling viser en kort kontakt-firmaadmin-beskjed, uten aktiveringskontroller eller boligdata.
- Startside og ordinær prosjektmeny beholder tidligere oppsett. Hjelpeboksen beskriver prosjektarbeidet og avgrensningen til første etappe.

Ny additiv migrasjon `20261020212755_boligprosjekter_systemadmin_firm_access.sql` beholder workspace-gatewayen uendret. Systemadmin-RPC kontrollerer fersk profil/rolle, tom search_path, samme lås/revisjon og audit. Ny PostgreSQL-kontrakt dekker ekstern firmaaktivering uten medlemskap, bevart aktivt firma, firmaadmin/anon/service_role/deaktivert sys nektet, ugyldig firma og konflikt uten ekstra audit. 52 kontroller totalt. React-testen dekker de faktiske tre boligkomponentene og tilgangshooken, inkludert sent gammelt firmasvar og bevaring av prosjektkladd.

Sandbox ble deretter aktivert etter uttrykkelig brukerordre: Ringside Rørleggerbedrift AS, Bademiljø Expo og Expo Proffsenter. Tre eksisterende syntetiske Expo-ansatte fikk prosjektledertilgang gjennom autorisert RPC; full enabled/prosjekttilgang ble lest tilbake som hver bruker. Det finnes foreløpig ingen egne syntetiske ansatte i de to andre interne firmaene. Systemadmin kan bruke alle tre. Andre firmaer forblir uaktivert. De tre manglet hovedmodulen Prosjekter og dokumentasjon; denne ble lagt til via eksisterende systemadmin-RPC, med øvrige modulvalg beholdt. Ingen medlemskap, HR-tilgang eller Production-data er endret. Produktionsbrukere skal tildeles individuelt ved senere godkjent release.

Full critical/Sandbox-build, eksisterende prosjektmeny-retur, KS/HMS/HR/Min side og innlogget Preview-prøve dokumenteres etter verifikasjon. Neste produktetappe er grunnpakke og firmaets tilvalgslister, deretter valg per bolig og bestillingsgrunnlag med de avtalte feltene. Ingen e-post sendes av denne endringen.
