# Bygg prosjekt og mange/lange bygg – QA 21. oktober 2026

Miljømål BEGGE. Preview/Sandbox først, samme operative foundation-branch og draft PR #278. Ingen produksjonsmerge uten ny uttrykkelig TEST OK. Fersk main ved start er 0730eeb46c49bf45b5d910772da5c2ad7ed60771; forrige foundation-head b46948f4ab73ab0fcae9234daa87131b57ec78eb. PR #277/prototype-overlay er ikke tatt inn.

## Scope og kontrakt

Egne boligkomponenter, bolig-CSS, hjelpeinnhold, arkitektur-/QA-dokumentasjon og additive bolig-migrasjoner. Eksisterende workflow får bare en ekstra browserkontroll. Eksisterende bolig-React-test beholder alle assertions; kontakteditorens selectors er flyttet fra boligpanelet til den nye portal-dialogen fordi bruker bestilte popuper for avgrensede funksjoner. Ny test bekrefter også at første prosjektopprettelse fra tom oversikt beholder samme veiviserdialog, mottar kvittering og fjerner korrekt kladd. Meny/auth/main/Sales/recovery/andre moduler er urørt i denne etappen.

Bygg prosjekt har fire trinn, fem starttyper, selvstendige bygg/adresser, blandede typer, kopiering av struktur, boligfordeling, avledet total og kontrollside. Husets interne etasjer er separat fra husstandsantall. Ingen automatisk konvertering av eksisterende boliger. Redigering av eksisterende byggtype/husets interne etasjer gjenstår. Veiviserkladd er lokal og bruker-/firmaavgrenset. Native dialoger lukker bare seg selv med Escape; skjemaene beholdes montert.

Alle bygg gir kompakte kort og Bytt bygg en søkbar popup. Boligsøk omfatter hele prosjektet og oppretter samlet bygg-/oppgangs-/boligvalg. Søk viser 50 treff om gangen. Et langt bygg viser én eller to oppganger etter tilgjengelig bredde, med forrige/neste, velger og minimap. Lange etasjer får lokal horisontal rulling fremfor krympede boligknapper. Illustrasjonen er dekorativ, ikke teknisk fasadetegning. Bare faktiske boliger tegnes.

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
- Ny faktisk Chromium-test: 55 assertions PASS ved 320/390/1024/1366px. Kladd/gjenåpning, husets etasjer, feil etter sendeforsøk, samme request_id etter reload, receipt-kladdrydding, Escape/focus, 400/480/500 boliger, bare 24/48 boligknapper for valgt utsnitt, 20 oppganger i minimap, leselige knapper, ingen sideomfattende horisontal overflow, innrammet veiviser, globalt søk til siste bygg/oppgang, søkbar byggpopup/Escape og uendret kontakttekst ved popup-lukking.
- Full critical build: PASS. Vanlig eksisterende chunkstørrelsesmelding er ikke en ny runtimefeil.
- Ingen eksisterende critical assertion er fjernet. Den nye browsertesten er lagt til i PR Core Safety etter de eksisterende boligtestene.

## Visuell gjennomgang

Interne skjermbilder av typevalg, kontrollside, mobilveiviser, mangebyggkort og lang fasade er vurdert. Mobilheaderens lukkeknapp er flyttet øverst til høyre slik at den ikke lager en ekstra rad. Dialogen følger innholdshøyden; footer holder Neste/Tilbake tilgjengelig. Egen box-sizing på boligdialogen fjerner sideomfattende overflow i den isolerte mobile prøven. Fasaden bruker sammenhengende segmenter, med samme faktiske etasje-/boligdata som før.

Innlogget skynettprøve og CI/deployment på publisert commit føres etter publisering. Fysiske enheter/Safari, to reelle brukerinnlogginger og serverdvale på annen enhet hevdes ikke prøvd. Lokal browserfixture er et UI-bevis, ikke produksjonslasttest eller e-post-/ordrebevis.

## Brukerprøve

1. Meny → Boligprosjekter → Bygg prosjekt. Prøv boligtypekortene og Neste/Tilbake.
2. Bygg og adresser → flere bygg, forskjellige boligtyper og Kopier oppsett til nytt bygg. Fyll inn nye adresser.
3. Etasjer og boliger → flere oppganger og ulik boligfordeling. Se beregnet total.
4. Se over og opprett → Rediger bygg, eller Opprett prosjektforside for et syntetisk eksempel.
5. Alle bygg / Bytt bygg → velg bygg. Bruk oppgangsvelger, minimap og forrige/neste i et langt bygg.
6. Søk bolig, adresse eller kontakt → åpne treff fra et annet bygg.
7. Oppsett → bytt mellom de tre områdene med usendt kladd. Kontakt og leilighetsprosjekt → skriv, lukk og åpne igjen.
8. Lukk veiviseren og bytt nettleserfane; Fortsett prosjektkladd skal beholde trinn og tekst. Ingen serverposter opprettes før siste knapp.

Ti UX-forslag og tydelig skille mellom implementert og planlagt: `docs/architecture/BOLIG_DESIGNREVIEW_20261021.md`.
