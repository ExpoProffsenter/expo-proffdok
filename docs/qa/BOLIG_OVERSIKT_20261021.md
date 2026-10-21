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
- Oversikt Chromium: 35 assertions med faktisk global appstil, bredder 320/390/1024/1366 px.
- Byggveiviser Chromium: 101 assertions, inkludert eksisterende modal/fokus, store bygg og responsivitet.
- Foundation React: bestått, inkludert én Oppsett-inngang og nytt dialognavn.
- Pakkenavigasjon Chromium: 24 assertions bestått.
- Build og critical/scope-guard kontrolleres før publisering.

## Skynett og publisert versjon

Publisert første versjon 6fb55843 på fast branch-Preview, Vercel dpl_3dLeJX1LcZosYUJXme2AzwcspMvS READY. Innlogget skynettprøve på DEMO – Klargjør hel blokk viser 24 boliger: 12 Må gjennomgås og 12 Boligvalg mangler. Filteret viser de 12 forventede A-boligene. Valg av A-101 åpner korrekt adresse Eksempelgata 30A og offisielt H0101. Leilighetsinformasjon viser kontakt-/prosjektfeltene med korrekt tittel. Usendt syntetisk kontaktprøve er beholdt ved lukking/åpning og deretter tømt igjen uten serverlagring. Nøyaktig én Oppsett-knapp kontrollert. Samlet Oppsett viser eksisterende bygg, nummerering og rommaler.

Siste tillegg sikrer at Alle bygg/Bytt bygg eksplisitt avslutter liste/filter. Ny Chromium-scenario verifiserer begge returhandlinger. Ingen endring av kundens Testprosjekt 79800; bare syntetisk QA-prosjekt brukes.

CI #590 besto critical build og øvrige gjennomførte trinn, men stanset etter PASS i uendret compact-reference-browser-check med en Playwright ProtocolError ved lukking av JavaScript-dialog (session closed). Ingen kjernefiler eller kjernechecker er endret som følge av dette. Ny kjøring på oppfølgingscommit verifiseres separat.

## Kort brukerprøve

1. Åpne Hovedside i et boligprosjekt. Fasaden skal ha små vinduer, med synlig foto mellom dem.
2. Åpne Oppsett øverst. Det skal være prosjektets eneste Oppsett-knapp.
3. Velg Boligliste og Filtrer boliger → Må gjennomgås eller Mangler kontaktinfo. Velg en bolig for å åpne riktig boligpanel.
4. Åpne Leilighetsinformasjon. Kontakt, adresse og prosjektkobling skal ligge i samme dialog som før. Lukk/åpne skal beholde usendt kladd.

Fysisk Safari/mobil og to samtidige reelle kontoer er ikke prøvd i denne UX-pakken.
