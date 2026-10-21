# Bygg prosjekt og mange/lange bygg – QA 21. oktober 2026

Miljømål BEGGE. Preview/Sandbox først, samme operative foundation-branch og draft PR #278. Ingen produksjonsmerge uten ny uttrykkelig TEST OK. Fersk main ved start er 0730eeb46c49bf45b5d910772da5c2ad7ed60771; forrige foundation-head b46948f4ab73ab0fcae9234daa87131b57ec78eb. PR #277/prototype-overlay er ikke tatt inn.

## Scope og kontrakt

Egne boligkomponenter, bolig-CSS, hjelpeinnhold, arkitektur-/QA-dokumentasjon og additive bolig-migrasjoner. Eksisterende workflow får bare en ekstra browserkontroll. Eksisterende bolig-React-test beholder alle assertions; kontakteditorens selectors er flyttet fra boligpanelet til den nye portal-dialogen fordi bruker bestilte popuper for avgrensede funksjoner. Ny test bekrefter også at første prosjektopprettelse fra tom oversikt beholder samme veiviserdialog, mottar kvittering og fjerner korrekt kladd. Meny/auth/main/Sales/recovery/andre moduler er urørt i denne etappen.

Bygg prosjekt har fire trinn, fem starttyper, selvstendige bygg/adresser, blandede typer, kopiering av struktur, boligfordeling, avledet total og kontrollside. Husets interne etasjer er separat fra husstandsantall. Ingen automatisk konvertering av eksisterende boliger. Redigering av eksisterende byggtype/husets interne etasjer gjenstår. Veiviserkladd er lokal og bruker-/firmaavgrenset. Native dialoger lukker bare seg selv med Escape; skjemaene beholdes montert.

Alle bygg gir kompakte kort, med 12 bygg per side på større skjermer og 4 på mobil. Søk og Neste/Forrige begrenser scrolling. Kortområdet bruker full arbeidsbredde når ingen boligdetalj vises. Bytt bygg er en søkbar popup. Boligsøk omfatter hele prosjektet og oppretter samlet bygg-/oppgangs-/boligvalg. Søk viser 50 treff om gangen. Et langt bygg viser én eller to oppganger etter tilgjengelig bredde, med forrige/neste, velger og minimap. Lange etasjer får lokal horisontal rulling fremfor krympede boligknapper. Illustrasjonen er dekorativ, ikke teknisk fasadetegning. Bare faktiske boliger tegnes.

Oppsett er delt i Bygg og boliger / Grunnpakker og tilvalg / Arkiv og synlighet. Inaktive områder er skjult uten å demontere kladder. Kontakt og leilighetsprosjekt er en egen popup med eksisterende felter og lagring.

## Lagring og migrasjoner

- Kilde `20261021000023_bolig_project_builder.sql`, installert i Sandbox som `20261021000642` / `bolig_project_builder`.
- Kilde `20261021001124_bolig_building_household_guard.sql`, installert i Sandbox som `20261021001226` / `bolig_building_household_guard`.
- Private bygg får type, adresse og husets etasjeantall. Privat kvitteringstabell har RLS og ingen direkte klient-/service_role-grants. Prosjektopprettelse er én transaksjon, med fersk firmakontekst, prosjektlederkrav, tom search_path, nøkkellås, full validering og audit. Samme bruker/firma/referanse + uendret payload returnerer samme prosjekt og stabile ID-er. Endret payload med brukt referanse gir PT409. Kvittering returneres med request_id/root_id.
- Public gateway er fortsatt SECURITY INVOKER. Den nye private funksjonen gjør egne autorisasjonskontroller; anon/PUBLIC/service_role har ikke EXECUTE. Backendfeil rulles tilbake, inklusive feil i siste bygg. Households-guard beskytter også gamle entrance/resize-kommandoer, slik at en enebolig ikke kan få flere husstander via den gamle oppsettflaten.
- Originale elleve bolig-migrasjoner og disse to er fortsatt bare installert i Sandbox. Production er ikke migrert av Preview-deploy.

## Lokal verifisering

- PostgreSQL: 150 assertions PASS. Alle tidligere 128 er beholdt. Nye scenarioer: 20 bygg/40 oppganger/400 boliger, 20 oppganger/480 boliger i én blokk, blandet hus/tomannsbolig/blokk, separat husets etasjer, stabilt resultat ved replay, PT409 ved endret replay, full rollback ved feil i siste bygg/duplikatadresse, leser/fremmed firma/direkte kvitteringslesing nektes, og gamle strukturkommandoer kan ikke lage nye husstander i en enebolig.
- Faktisk bolig-React: PASS på oppdaterte komponenter. Bevarer eksisterende focus/visibility, samme arbeidsfirma, forsinket kontekst, gammel firmarace, server-first, lokal kladd, rolletap, konflikt, project picker/Escape og fullscreen. Kontakteditorens nye DOM-plassering har samme scenarioassertions. Første prosjekt fra tom listing har egen integrasjonsprøve.
- Faktisk katalog-React og overview-React: PASS. Eksisterende varevalg, ekskluderte ordrelinjer, prisgrenser, bildefelter og proffkatalogrettigheter beholdes.
- Ny faktisk Chromium-test: 64 assertions PASS ved 320/390/1024/1366px. Kladd/gjenåpning, husets etasjer, feil etter sendeforsøk, samme request_id etter reload, receipt-kladdrydding, Escape/focus, 400/480/500 boliger, bare 24/48 boligknapper for valgt utsnitt, 20 oppganger i minimap, leselige knapper, ingen sideomfattende horisontal overflow, innrammet veiviser, globalt søk til siste bygg/oppgang, søkbar byggpopup/Escape og uendret kontakttekst ved popup-lukking.
- Full critical build: PASS. Vanlig eksisterende chunkstørrelsesmelding er ikke en ny runtimefeil.
- Ingen eksisterende critical assertion er fjernet. Den nye browsertesten er lagt til i PR Core Safety etter de eksisterende boligtestene.

## Visuell gjennomgang

Interne skjermbilder av typevalg, kontrollside, mobilveiviser, mangebyggkort og lang fasade er vurdert. Mobilheaderens lukkeknapp er flyttet øverst til høyre slik at den ikke lager en ekstra rad. Dialogen følger innholdshøyden; footer holder Neste/Tilbake tilgjengelig. Egen box-sizing på boligdialogen fjerner sideomfattende overflow i den isolerte mobile prøven. Fasaden bruker sammenhengende segmenter, med samme faktiske etasje-/boligdata som før.

Innlogget skynettprøve på d09148dd er gjennomført mot samme faste alias, uten ny innlogging. Et syntetisk prosjekt QA-LANGBYGG-20261021 er opprettet gjennom hele veiviseren: 1 bygg, 20 oppganger, 480 boliger. Serverlesing viser nøyaktig én opprettelseskvittering; originalt Testprosjekt/79800 står fortsatt med 0 bygg/boliger. Siste oppgang/H0302 er åpnet; kontakttekst er skrevet, lukket med Escape, gjenåpnet uendret og satt tilbake uten lagring. Fullskjerm/retur beholder boligen. Et andre syntetisk prosjekt QA-MANGEBYGG-20261021 er opprettet gjennom veiviseren med kopiering av struktur: 25 bygg, 500 boliger. Alle bygg viser 25 kort; Bygg 25 åpner med 20 faktiske boliger, uten å tegne alle 500. CI #571 / 39520388548 er SUCCESS, og deployment dpl_JCs7cANXFVMZ7BbsxY21hx19osw2 er READY på eksakt d09148dd.

Livegjennomgangen utløste en ekstra UX-justering: veiviserens 20 oppganger velges nå i én kompakt velger med ett aktivt redigeringsfelt, og kontrollsiden oppsummerer etasjehøyder med sammenleggbar fordeling i stedet for tjue gjentatte tall. Bygg/adresser sorteres naturlig, verktøylinjens Bygg prosjekt-knapp gis innholdsbredden, og et opprettelsesvarsel ryddes ved boligvalg. Dette er lokalt verifisert og CI #572 / 39521332173 er SUCCESS på 6730102775c625ec944b1ba9678a4a960a19c82b; deployment dpl_EuRWhgcsdgCLhpdj6KXPTdn8F9TZ er READY på samme head. Siste UI-justering begrenser mangebyggkort til 12/4 per side, bevarer samme byggområde ved breddeendring og lar Alle bygg bruke full bredde. Eksisterende assertions er utvidet med sidebytte og mobilgrense; 64 browserassertions passerer. Ny critical build, foundation-React og overview-React passerer lokalt.

Et tredje syntetisk prosjekt, QA-BOLIGTYPER-20261021, er opprettet gjennom den faktiske veiviseren: 4 bygg / 23 boliger (leilighetsbygg 16, enebolig 1 med tre interne etasjer, tomannsbolig 2, flerfamiliehus 4). Ingen av disse testene oppretter ordinære kundeprosjekter, personkontakter, aksepter eller sendte ordrer.   Fysiske enheter/Safari, to reelle brukerinnlogginger og serverdvale på annen enhet hevdes ikke prøvd. Lokal browserfixture er et UI-bevis, ikke produksjonslasttest eller e-post-/ordrebevis.

## Brukerprøve

1. Meny → Boligprosjekter → Bygg nytt prosjekt. Prøv boligtypekortene og Neste/Tilbake.
2. Bygg og adresser → flere bygg, forskjellige boligtyper og Kopier oppsett til nytt bygg. Fyll inn nye adresser.
3. Etasjer og boliger → flere oppganger og ulik boligfordeling. Se beregnet total.
4. Se over og opprett → Rediger bygg, eller Opprett prosjektforside for et syntetisk eksempel.
5. Alle bygg / Bytt bygg → velg bygg. Bruk oppgangsvelger, minimap og forrige/neste i et langt bygg.
6. Søk bolig, adresse eller kontakt → åpne treff fra et annet bygg.
7. Oppsett → bytt mellom de tre områdene med usendt kladd. Kontakt og leilighetsprosjekt → skriv, lukk og åpne igjen.
8. Lukk veiviseren og bytt nettleserfane; Fortsett prosjektkladd skal beholde trinn og tekst. Ingen serverposter opprettes før siste knapp.

Ti UX-forslag og tydelig skille mellom implementert og planlagt: `docs/architecture/BOLIG_DESIGNREVIEW_20261021.md`.


Siste skynettkontroll på 43ec3675 bekrefter 12 bygg på første side, Bygg 25 på siste side, naturlig sortering 1–12, full arbeidsbredde uten tomt sidepanel, ingen horisontal sideoverflow og kompakt Bygg prosjekt-knapp (136px). Søk «Eksempelenga 24 H0302» fra Bygg 25 åpner riktig bolig i Bygg 24. Eneboligen tegner husillustrasjon og nøyaktig én boligknapp. Oppgangsveiviseren viser ett redigeringsfelt ved 20 oppganger, og kladden gjenåpner riktig trinn med 20. Et usendt pakkenavn beholdes ved områdeskifte og settes tilbake uten lagring. CI #573 / 39521964393 er SUCCESS på 43ec3675; Vercel dpl_65QwDHNTBRyuXnHsbtpy88SHN9nc er READY på samme head. Main 0730eeb4 og permanent demo 1312f406 er lest tilbake uendret.

En siste avgrenset oppfølging etter visuell kontroll flytter fokus/visning til overskriften ved Neste/Forrige bygg, slik at en ny side ikke åpner nederst etter klikk på bunnpageren. To nye Chromium-assertions beskytter dette på desktop og mobil (64 totalt). «Alle bygg» og aktivt byggkort har eksplisitt kontrast. Ingen nye serverkall eller datamutasjoner ved sidebyttet.


## Knappjustering etter brukerprøve

Brukerens skjermbilde viste at «Bygg prosjekt» stod lavere enn «Slik styrer du prosjektet». Årsaken var en arvet toppmarg på primærknappen. Den er nullstilt bare i Boligprosjekters verktøylinje. Begge handlingene har 44 px høyde; hjelpevalget beholder tydelig åpen/lukket pil og vanlig details-tastaturbetjening. Knapp, dialogtittel og hjelpetekst bruker nå «Bygg nytt prosjekt». «Fortsett prosjektkladd» beholdes ved påbegynt kladd.

Scope: egen bolig-CSS, veivisertekst, BoligHelp og tilhørende QA. Ingen data-/tilgangs-/navigasjonsendring. Testselectors er oppdatert til det bestilte knappnavnet; eksisterende scenarioassertions er beholdt. Chromium-testen er utvidet fra 64 til 78 assertions med lik knappehøyde, samme topplinje på desktop, ingen horisontal overflow og åpning/lukking av hjelp ved 320/390/1024/1366 px. Alle 78 passerer lokalt. Foundation-React og full critical build passerer også. Skynettleseren viser innlogging i denne økten, så denne lille endringen er ikke prøvd med en ny innlogget økt.

Brukerprøve: Åpne Boligprosjekter i samme faste Preview. «Slik styrer du prosjektet» og «Bygg nytt prosjekt» skal ha samme høyde og stå på samme linje der det er plass. Åpne hjelp, lukk igjen, og åpne veiviseren. Ved eksisterende kladd skal «Fortsett prosjektkladd» fortsatt åpne samme trinn og tekst. Ingen produksjonsmerge før uttrykkelig TEST OK.


## Egen startside for Boligprosjekter

Kenneth påpekte at modulen manglet en startside og at «Fortsett prosjektkladd» skjulte inngangen til et nytt prosjekt. Miljømål BEGGE. Avgrenset scope: BoligProjectHome (ny), BoligEntry, BoligProjectBuilder, egen bolig-CSS, BoligHelp og eksisterende bolig-QA. Ingen endring i appens Startside/meny/auth/main, andre moduler eller SQL/backend.

Første åpning uten lagret arbeidssted viser Prosjektoversikt. Ny-/kladdinngangen venter til første prosjekthenting er ferdig, slik at et forsinket oppstartssvar ikke kan kollidere med ny prosjektopprettelse. Den åpner ikke automatisk firmaets første prosjekt. Oversikten har tydelig «Bygg nytt prosjekt», separat «Fortsett prosjektkladd» når en kladd finnes, søk på prosjektnavn/nummer, aktive/arkiverte prosjekter, faktiske boligtall og seks kort per side på PC / tre på mobil. Samme prosjektområde beholdes ved breddebytte. Ingen oppdiktet prosjektstatus eller dato. «Sist åpnet» vises bare når et servervalidert prosjekt er tilgjengelig. Eksisterende prosjekt åpnes fra et kort. «Alle prosjekter» returnerer til moduloversikten; «Til appens startside» skiller dette fra å forlate modulen.

Oversikt og arbeidsflate beholdes montert. Home/retur beholder valgt bygg/bolig, Oppsett-område og usendt tekst uten ny prosjekthenting. Gjeldende skjerm lagres bruker-/firmaavgrenset i sessionStorage. Samme firma/focus/visibility skal ikke sende brukeren til oversikten. Bevisst retur til oversikten ugyldiggjør pågående prosjektvalg, slik at et sent svar ikke kan åpne prosjektet på nytt. Nye valg av annet prosjekt starter i byggoversikten; gjenopptak av samme prosjekt beholder arbeidsområdet. Eksisterende request-/receipt- og firmagrenser beholdes.

«Bygg nytt prosjekt» bytter ikke lenger navn. Med eksisterende kladd vises et valg om å fortsette eller forkaste før ny start. Forkasting krever en egen, tydelig bekreftelse og vellykket lokal sikring av den nye kladden. Avbryt/Behold lukker ikke eller tømmer eksisterende skjema. En kladd med usikkert opprettelsesforsøk kan ikke forkastes her; den må først kontrolleres med samme request_id. Bare én lokal prosjektkladd støttes; samtidig oppbevaring av flere kladder er ikke innført.

Validering: Full critical build PASS. Foundation-, katalog- og overview-React PASS. Foundation-testen åpner nå eksplisitt et prosjekt fra modulens startside og beholder alle gamle scenarioassertions. Nye assertions verifiserer ingen automatisk førsteprosjektlesing, hjem/retur med samme editor-DOM/tekst/område og respekt for hjemvalget etter focus. Chromium: 99 assertions PASS ved 320/390/1024/1366 px (alle tidligere 78 beholdt). Nye scenarier dekker prosjektkort/søk/arkiv/paging, faktisk valgt prosjekt-ID, tre mobilkort, ingen sideoverflow, separat ny-/kladdinngang, behold/forkast-bekreftelse, ren ny veiviser og sperre mot forkasting av usikkert opprettelsesforsøk. Interne desktop-/mobilbilder er visuelt kontrollert. Ny innlogget skynettprøve er ikke gjennomført i denne økten; sist observerte skynettøkt stod på innlogging.

Brukerprøve: Boligprosjekter → Prosjektoversikt → Bygg nytt prosjekt / Fortsett prosjektkladd. Åpne et prosjektkort, gå til Oppsett, skriv et usendt felt, velg Alle prosjekter og fortsett via Sist åpnet. Samme felt og område skal stå igjen. Prøv søk, aktive/arkiverte og Neste/Forrige ved flere prosjekter. Ingen merge uten uttrykkelig TEST OK.
