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

Sandbox MCP-historikk bruker servergenererte versjoner: foundation `20261020202112`, FK-indekser `20261020202709`, listescoping `20261020203641`, HTTP-konflikt `20261020204137`, prosjektkobling `20261020205119`, systemadmin-firmatilgang `20261020212953`; kildefilene er generert med CLI. Ved senere CLI-synk må denne navne-/versjonskoblingen håndteres eksplisitt; migrasjonene skal ikke kjøres dobbelt på Sandbox. Production har ingen av migrasjonene installert.

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

Sandbox ble deretter aktivert etter uttrykkelig brukerordre: Ringside Rørleggerbedrift AS, Bademiljø Expo og Expo Proffsenter. Tre eksisterende syntetiske Expo-ansatte fikk prosjektledertilgang gjennom autorisert RPC; full enabled/prosjekttilgang ble lest tilbake som hver bruker. Det finnes foreløpig ingen egne syntetiske ansatte i de to andre interne firmaene. Systemadmin kan bruke alle tre. Andre firmaer forblir uaktivert. De tre manglet hovedmodulen Prosjekter og dokumentasjon; denne ble lagt til via eksisterende systemadmin-RPC, med øvrige modulvalg beholdt. Ingen medlemskap, HR-tilgang eller Production-data er endret. Produksjonsbrukere skal tildeles individuelt ved senere godkjent release.

Full critical/Sandbox-build, eksisterende prosjektmeny-retur og KS/HMS/HR/Min side passerer lokalt. Innlogget Preview beholder innlogging etter deploy; Systemadmin viser eget firmavalg med de tre interne firmaene PÅ og Proffkunde Demo AV. Firmaaktivering plasseres over supportlisten for å være lett å finne. Firmaadmin viser alle tre syntetiske medarbeidere med prosjektledertilgang og ingen lisensbryter. Meny → Boligprosjekter åpner prosjektarbeidet med veiledningsboks og uten administratorbeskjeder. Begge adminflater og prosjektflaten er lest via faktisk HTTP/RPC i samme innloggede nettleser. Neste produktetappe er grunnpakke og firmaets tilvalgslister, deretter valg per bolig og bestillingsgrunnlag med de avtalte feltene. Ingen e-post sendes av denne endringen.

## Grunnpakker, tillegg/alternativ og boligvalg – neste operative etappe

Miljømål BEGGE, kun Preview/Sandbox nå. Scope: ny BoligCatalog-komponent/klient, to integrasjonspunkter i BoligEntry, avgrenset CSS og Hjelp, én additiv migrasjon, utvidet egen PostgreSQL-test og ny komponenttest som legges til eksisterende CI. main.jsx, meny, øvrige adminflater, Sales/aksept, eksisterende prosjektmotor, utsending og eksisterende critical checks endres ikke i denne etappen.

- Prosjektets Grunnpakker: flere pakker med stabile varelinjenøkler, beskrivelse, varenummer, antall og enhet. Ingen påkrevd sum. Valgfri grunnsum per linje er bare et fratrekksgrunnlag, adskilt fra inkludert hovedentreprise og innkjøpspris.
- Tilvalgsliste: Tillegg til eller Alternativ til standardvare. Alternativ kan erstatte med eller uten fratrekk. Pris, fratrekk og netto vises separat. Alternativ uten registrert fratrekksgrunnlag kan ikke lagres som boligvalg med fratrekk. Ingen automatisk pris eller fratrekk gjettes.
- Valgt bolig: velg pakke og tilvalg, kontroller og lagre internt valgsutkast. Serveren beregner heltallsbeløp i øre og genererer varegrunnlaget fra registrerte data. To alternativer til samme linje avvises. Erstattet standardvare blir ikke med i varegrunnlaget. Grunnpakken uten pris beholder varenummer og antall.
- Ved senere pakke-/pris-/kontaktendring beholdes lagret valgsversjon med opprinnelig pakke, varer, priser, fratrekk og boligidentitet. Ny bevisst lagring legger til en ny versjon. Inntil 20 siste versjoner vises; alle lagrede versjoner beholdes i databasen. Katalogen i denne etappen er prosjektspesifikk, ikke en sentral vare-/priskatalog.
- Hent/fokus bevarer lokal kladd og dens opprinnelige revisjon. Endret grunnlag markeres. «Se over og bruk siste grunnlag» kreves før en gammel kladd flyttes til ny revisjon. Ingen bakgrunnslagring eller automatisk gjentakelse av skriver.

88 PostgreSQL-kontroller dekker foundation samt pakker uten sum, varenummer i varegrunnlag, tillegg, alternativ med/uten fratrekk, manglende grunnsum, ugyldige linjer/beløp, dobbeltvalg, prismanipulering, immutable valgsversjoner, gamle katalog-/boligrevisjoner, skjuling/gjenoppretting, firmagrenser, leser og direkte/anonym tilgang. Ny faktisk React-test dekker redigering, valgfri sum, varedata, typevalg/fratrekk, prisregning, bevart kladd ved konflikt/fokus, eksplisitt revisjonsgjennomgang, reader og sent firmasvar. Foundation-komponenttesten beholdes og mocker kun ny transport som tom katalog.

Prøve: Meny → Boligprosjekter → velg hovedprosjekt. Grunnpakker → Ny grunnpakke → legg inn navn/vare/varenummer/antall, la grunnsum stå tom → Lagre grunnpakke. Tilvalgsliste → Nytt tilvalg → velg type og eventuell standardvare/fratrekk → Lagre tilvalg. Velg en bolig nedenfor → Grunnpakke og tilvalg → velg pakke/tilvalg → Lagre boligvalg som utkast. Se lagret varegrunnlag og historikk. Rediger deretter pakken: det tidligere lagrede boligvalget skal forbli uendret.

Dette er interne valgsutkast. Kundeaksept, publiserte beboertilbud, indeks-/kontraktsregulering, individuelle avvik utenfor pakke/tilvalg, beboerportal og operative bestillinger er videre etapper. Ingen e-postadresse er oppgitt for bestilling; ingen e-post eller ASCII-eksport sendes nå. Senere bestilling skal bruke dette varegrunnlaget, kreve riktige varenummer og ha adresse, navn og/eller leilighetsnummer, ønsket leveringsdato og kjøpers referanse.

Katalogmigrasjonen er installert kun i Sandbox som `20261020215241`. Indeksoppfølging `20261020215336_boligprosjekter_choice_unit_index.sql` dekker valgsversjonenes sammensatte FK til boligen. Eksisterende advarsler i andre moduler er utenfor scope. Et syntetisk eksempel «Eksempel – grunnpakker og boligvalg», referanse QA-PKG-20261020, med tre boliger er opprettet gjennom eksisterende RPC for innlogget prøve. Varenummer i eksempelet er QA-eksempler, ikke katalogverifiserte ordrevarer.

## Tillegg fra Kenneth: varekort og linjeutvalg før bestilling – 21.10.2026

Scope er utvidet med egne BoligProductCard/BoligOrderDraft/BoligDraftForm-komponenter og additiv migrasjon `20261020220230_boligprosjekter_order_drafts_product_images.sql`. Sales-komponentene er lest som UX-referanse; selve Sales- og tilbudsmotoren er uendret. Varekort følger tilbudsvarenes oppbygning, med valgfri bilde-/produktadresse. HTTPS-kilder valideres på server, og nye boligvalg beholder sine egne bildereferanser. Bildene kan foreløpig legges inn som adresse; bildeopplasting og kataloghenting er ikke del av denne etappen.

«Klargjør varebestilling» viser alle varelinjer fra lagret boligvalg valgt første gang. Prosjektleder kan utelate produkter som leveres andre steder. «Lagre bestillingsutkast» lagrer et eget versjonert utvalg, med kildevalgrevisjon og antall utelatte linjer. Dette er ingen utsending. Etter endret boligvalg må nytt grunnlag kontrolleres; gammel kilde/revisjon avvises. Boligvalg og tidligere utkast beholdes. Alle linjer kan velges igjen. Minst én linje kreves for et lagret bestillingsutkast.

107 PostgreSQL-kontroller inkluderer de opprinnelige 88 samt utkast med alle/utelatte linjer, uendret boligvalg, kilde-/utkastkonflikt, duplikate/ugyldige/ingen posisjoner, pris-/varemanipulering, leser/firma/anon/direkte tilgang og sikre bildereferanser. Komponenttesten dekker avkryssing med standard alle, separat lagring, beholdt boligvalg og faktiske varebilder. Bestillingsmottaker, leveringsdato/adresse og eventuell ASCII-eksport må fortsatt komme i operativt utsendingstrinn. Ingen e-post sendes nå.
