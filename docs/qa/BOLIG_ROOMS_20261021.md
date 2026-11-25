# Rom per bolig – første avgrensede etappe, 21. oktober 2026

Miljømål BEGGE. Fortsetter på eksisterende foundation-branch / draft PR #278 og samme faste Preview. Baseline ved start: feature d63ea1fa21828fcb22bf2abe314112286f192214, main 0730eeb46c49bf45b5d910772da5c2ad7ed60771, demo 1312f406acc18361037304227171b57b64b5cc36. Ingen produksjonsmerge eller branchsletting. Den større koblingen av varer og sjekklister til rom avgrenses som neste etappe; foundationen må ikke mistes ved å starte fra main alene.

## Scope

Nye BoligRooms.jsx / boligRoomsClient.js, seks linjer integrasjon og én import i BoligEntry.jsx, egen bolig-CSS, BoligHelp, to additive rommigrasjoner, egne romscenarioer og en ekstra browserkontroll i eksisterende CI. Eksisterende DB- og React-suiter er utvidet uten å fjerne assertions. React-transporten får tom romrespons for den nye RPC-en. Produktplan og designstatus er oppdatert. Meny, main/bootstrap/auth/recovery, Sales, HR, øvrige moduler og eksisterende prosjekt-/katalog-/ordrekommandoer er uendret.

## Levert

- Kompakt «Rom og oversikt» i boligpanelet, «Alle rom», romkort og ett valgt rom. Romoversikt har lokal avgrenset scrolling ved mange rom.
- «Legg til rom» og «Rediger rom» i en avgrenset popup. Bad, Vaskerom, WC, Teknisk rom og Annet rom; egne navn og valgfri etasje i boligen. Flere rom av samme type støttes. Foreslåtte navn nummereres uten å overskrive egne navn.
- Native dialog/Escape/fokusretur og beholdt usendt tekst. Lokal kladd per bruker/firma/hovedprosjekt/bolig, inkludert basisrevisjon og stabil rom-ID. Et urørt lukket skjema sperrer ikke opprettelse av et nytt rom. Ett faktisk usendt romutkast beholdes før andre rom kan åpnes. Det er ikke en kladd delt mellom enheter.
- Lagring sender aldri et nytt rom før ID-en er sikret lokalt. Mistet svar beholder samme ID og krever kontroll av fersk romoversikt før videre lagring. Ingen automatisk retry av skriving. Navnekollisjon gir forklaring, ikke ny romidentitet.
- Arkivering har uttrykkelig bekreftelse. Arkiverte rom kan gjenopprettes med samme ID. Immutable versjonssnapshots lagrer tidligere navn/type/etasje/arkivstatus, med aktør og tidspunkt. Historikkvisning er ikke bygget i denne etappen.
- Fersk serverkontroll ved lesing/skriving, firma-/boliggrenser, leser/prosjektleder og tilbakekalt tilgang. Romdata fjernes ved 42501. Sene lesesvar kan ikke gjenåpne en lukket popup eller overskrive et nyere lagringssvar.
- Rom har separat revisjon per bolig. Konkrete konflikter beholder utkast og viser fersk romliste før «Bruk siste grunnlag». Arkivert rom må gjenopprettes før redigering.
- Ett ordinært prosjekt per bolig beholdes. Ingen prosjektopprettelse per bad. Ingen stille flytting eller omskriving av eksisterende boligvalg, pris-/varehistorikk, prosjektkobling eller bestillingsutvalg.

## Database / miljø

Bare Sandbox ppvircenkjizeiqdxphj er migrert:

- Kilde 20261021145003_bolig_rooms.sql → serverversjon 20261021145751 / bolig_rooms.
- Kilde 20261021145829_bolig_room_fk_indexes.sql → serverversjon 20261021145842 / bolig_room_fk_indexes.

Totalt femten additive bolig-migrasjoner er nå bare installert i Sandbox. Production dqffxflaoyarbxyiyhop er fortsatt ikke migrert. Alle må kontrolleres og installeres i riktig rekkefølge før eventuell produksjonsrelease.

Tre private tabeller har RLS og ingen direkte klient-/service_role-grants. Public bolig_rooms er SECURITY INVOKER. Privilegert implementasjon ligger i bolig_private med tom search_path, eksplisitt auth.uid/fersk context, firmarot, aktiv bolig/bygg/oppgang, prosjektleder og aktiv rot ved skriving. Parent-lås serialiserer mot strukturarkivering; en boliglås og forventet romrevisjon beskytter samtidig skriving. Inntil 60 rom inkludert arkiverte. Historikk og audit skrives i samme transaksjon.

Supabase security/performance advisors er gjennomgått. Den tilsiktede private deny-all-modellen gir RLS-no-policy-info. Tre nye manglende sammensatte FK-indekser ble rettet i egen additiv migrasjon; ny advisor viser ingen manglende rom-FK-indekser. Ubrukte indekser er forventet før bruk. Andre moduladvarsler er ikke endret.

## Verifisering

- PostgreSQL/PGlite: 192 assertions PASS; alle tidligere 150 er beholdt. Romscenarioene kjører mens tidligere reelle syntetiske valg-/ordresnapshots finnes. Bytevis JSON-sammenligning bekrefter uendret historikk etter romskriving. Nye scenarioer dekker gjentatt romtype, egne navn, stabil ID ved omdøping, navnekollisjon, validering, gammel revisjon/rollback, arkiv/gjenopprett, bolig-/firma-/rollegrenser, anonym/direkte tilgang, parent-arkiv og historikk.
- Faktisk Chromium: 51 romassertions ved 320/390/1024/1366px. Beholdt editor-DOM/tekst ved focus/visibility, Escape/lukk/gjenåpning, separate boligkladder ved remount, mistet svar med urørt foreslått navn og samme ID etter reload, eksplisitt konfliktgjennomgang, arkivbekreftelse/gjenopprett, leser, tilbakekalt tilgang og sperret skriving ved mislykket lokal sikring. Desktop- og mobilbilder av faktisk React/CSS er visuelt vurdert.
- Eksisterende foundation-, katalog- og overview-React PASS. Eksisterende builder-Chromium: 99 assertions PASS. Full critical build PASS med repoets aktuelle Vite-linje. Kjente chunk-/konfigurasjonsadvarsler er ikke nye runtimefeil. Ingen eksisterende assertion er svekket.
- Faktisk Sandbox PostgreSQL, med eksisterende innloggings-/firmakontekst og authenticated-rolle: opprettelse, romlagring/omdøping, konflikt, arkiv/gjenopprett, ny lesing, direkte tabellnekt og uendret tidligere versjon PASS. Hele syntetiske prøven rullet tilbake; etterkontroll viser null QA-ROOMS-ROLLBACK-prosjekter. Brukerens Testprosjekt/79800 er lest tilbake uendret med 0 boliger.
- Skynett viser innlogging i denne økten. Ny innlogget browserprøve av rom er derfor ikke gjennomført. Fysisk Safari/mobil og to reelle innlogginger er ikke prøvd. Kontrollert Chromium-transport og PostgreSQL er ulike testlag, ikke bevis på en full innlogget end-to-end-reise.

## Brukerprøve

Fast Preview: https://expo-proffdok-git-fase45b-boligprosjekter-found-0509d8-ringside.vercel.app/?progressTest=safe

1. Boligprosjekter → åpne et DEMO-prosjekt → bygg → bolig → Rom og oversikt → Legg til rom.
2. Lag Bad 1 og Bad 2. Velg et rom, åpne Rediger rom, endre navnet og legg til valgfri etasje. Lagre rom skal vise samme rom med nytt navn.
3. Skriv usendt tekst, bytt nettleserfane og tilbake. Lukk med Escape og åpne igjen. Teksten skal være beholdt. Prøv også boligbytte/retur og Fullskjermvisning/Vanlig visning.
4. Rediger rom → Flere handlinger → Arkiver rom → Bekreft arkivering. Arkiverte rom → Gjenopprett skal gi samme rom tilbake.
5. Kontroller at eksisterende grunnpakke, tilvalg og bestillingsutkast fortsatt gjelder hele boligen og beholder sitt lagrede innhold.

Ingen merge før relevant Preview-prøve, grønn critical QA og Kenneths uttrykkelige TEST OK.

## Neste etappe og bevarte krav

Knyt varer/pakker/tilvalg til rom med egen versjonering og tydelig strategi for eldre valg uten rom. Eksisterende historikk skal fortsatt vises som boligomfattende; ingen automatisk flytting av varer, priser eller utfylte sjekklister. Deretter sjekklister/dokumentasjon, rommal med forhåndsvisning/utvalg, plantegninger/markører og egne bilder. Ingen av disse er operative nå. Hele øvrige ønskelisten i BOLIG_VIDERE_PLAN_20261021.md og overleveringen følger videre, inkludert operativ bestilling/levering, faktisk fremdrift/varsler, beboeraksept, indeks, import, leverandørtilgang og privat kontraktsanalyse. Ingen ekte ordre eller varsler er sendt.

## Publisert eksempel og CI-oppfølging

Sandbox har et bevisst beholdt romeksempel i DEMO – Blandede boligtyper / Eneboligen / Bolig: Bad 1 (1. etasje), Bad 2 (2. etasje), Vaskerom og Teknisk rom (Kjeller). Dette er separat fra den tilbakeførte QA-ROOMS-ROLLBACK-prøven. Ingen rom er lagt til brukerens egne prosjekter.

Første romhead 2c0f6d02 hadde READY Preview dpl_G6k2de4vZhPF8qbiuz6ezC9cyY2L. CI #578 passerte build, PostgreSQL 192, alle eksisterende React-suiter og builder 99, men stoppet i den nye rollebytteprøven: en umiddelbar count kunne lese forrige React-render. Testfixturen har derfor fått en rendret rollemarkør; prøven venter på faktisk leservisning og fersk romrespons før de samme nekt-assertionene utføres. Ingen produktrettighet eller eksisterende assertion er endret. Endelig CI/deploy-status føres i PR #278.
