# Boligoversikt – fasade, én Oppsett-inngang og boligliste

Miljømål: BEGGE. Først eksisterende Preview/Sandbox i PR #278. Ingen produksjonsmerge eller main → demo-synk uten TEST OK.

## Problem og endring

Leilighetsknappene strakte seg over hele bredden og farget nesten hele illustrasjonen gul/grå. Vinduer har nå 52–84 px bredde, glasspreg og små separate statusmerker. Fotoet vises i full bredde når én oppgang er synlig; to synlige oppganger deler fotoutstrekningen. Etasjer, bolig-ID-er, oppgangsvalg og tastaturnavigasjon beholdes. Illustrasjonen er fortsatt et eksempel, ikke et nøyaktig foto av registrert bygg.

Den doble Oppsett-knappen i byggoversikten er fjernet. Prosjektets øverste Oppsett samler bygg, adresser, nummerering, rommaler og arkiv. Tomt bygg forklarer hvor inngangen finnes. «Kontakt og leilighetsprosjekt» heter nå «Leilighetsinformasjon» på knapp, dialog og i veiledningen.

«Boligliste» viser boliger fra hele prosjektet med bygg, oppgang, etasje, offisielt nummer, kontaktperson og faktisk status. Filtrer på lagret/koblet, må gjennomgås, manglende boligvalg/prosjekt, klargjør bestilling, ukjent status eller ufullstendig kontaktinformasjon. Kontaktfilteret finner boliger som mangler navn, e-post eller mobil. Filter og søk kombineres; listen er naturlig sortert og har 50 treff per side. Resultatvalg åpner riktig stabil bolig-ID og bygg. «Fasade» nullstiller søk/filter. Status er fortsatt utkast/kobling, aldri påstått fremdrift eller sendt bestilling. Lesefeil vises som ukjent status.

## Scope og QA-kontrakt

Bare boligmodulens oversikt, eksisterende boligdialogetikett, CSS, hjelp og egne tester/dokumentasjon endres. Ingen database, e-post, ordreutsending, øvrig appnavigasjon eller Sales-endring. Excel-import er utsatt til slutt.

Eksisterende kontakt-/modaltester får nytt forventet navn fordi brukeren ba om dette. Scenarioene for kladd, focus, lukking og retur beholdes. Ny Chromium-scenario dekker global app-CSS, kompakte vinduer, sider, kombinerte filtre, tomt resultat, offisielt nummer, riktig bolig-ID, fokusoppfriskning, ukjent status ved lesefeil og ingen skrivende kall.

## Lokal verifisering

- Oversikt React: eksisterende scenarier bestått.
- Oversikt Chromium: 33 assertions med faktisk global appstil, bredder 320/390/1024/1366 px.
- Byggveiviser Chromium: 101 assertions, inkludert eksisterende modal/fokus, store bygg og responsivitet.
- Foundation React: bestått, inkludert én Oppsett-inngang og nytt dialognavn.
- Pakkenavigasjon Chromium: 24 assertions bestått.
- Build og critical/scope-guard kontrolleres før publisering.

## Skynett og publisert versjon

Fylles med konkret Preview-verifisering etter publisering. Ingen endring av kundens Testprosjekt 79800. Bare syntetisk QA-prosjekt brukes.

## Kort brukerprøve

1. Åpne Hovedside i et boligprosjekt. Fasaden skal ha små vinduer, med synlig foto mellom dem.
2. Åpne Oppsett øverst. Det skal være prosjektets eneste Oppsett-knapp.
3. Velg Boligliste og Filtrer boliger → Må gjennomgås eller Mangler kontaktinfo. Velg en bolig for å åpne riktig boligpanel.
4. Åpne Leilighetsinformasjon. Kontakt, adresse og prosjektkobling skal ligge i samme dialog som før. Lukk/åpne skal beholde usendt kladd.

Fysisk Safari/mobil og to samtidige reelle kontoer er ikke prøvd i denne UX-pakken.
