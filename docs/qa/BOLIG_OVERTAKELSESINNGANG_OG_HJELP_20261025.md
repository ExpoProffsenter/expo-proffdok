# Overtakelsesinngang og hjelp – 25. oktober 2026

Miljømål BEGGE. Først samme feature/Preview. Ingen produksjonssetting i denne etappen.

## Problem og endring

Brukeren fant ikke «4 gjenstår / 2 overtatt». Den eksisterende inngangen lå etter
fasaden og hele beboerdialogen, mens knappen «Ferdigstilling» over fasaden bare
velger statuslaget. Den ene overtakelsesinngangen er flyttet foran statusfanene
og fasaden. Byggnavn og «Gjenstår»/«Overtatt» viser valgt bygg. «Alle bygg» viser
hele prosjektet; byggknappen er da deaktivert til et bygg velges.

«Ferdigstilling av bygg» åpner den eksisterende dialogen. Ingen status endres ved
å åpne eller lukke. Restpunkter og intern sluttkontroll beholdes separat. Samme
serverrespons, hendelser og autorisasjonsregler brukes. Manglende/begrensede
statusrader skal ikke gi falske tall.

## Hjelp og tilgang

Globalt menyvalg og modulens hovedinngang krever allerede serverbekreftet
firmaaktivering og brukertilgang. I tillegg følger begge hjelpeinnganger den
interne arbeidsflatens `ctx.enabled`, også etter en avvist operasjon før ytre
kontekst er oppdatert. Dette gir ingen ny tilgang.

«Slik styrer du prosjektet» har ny anbefalt arbeidsrekkefølge for store prosjekter.
Etter brukerens gjennomgang er A–Å-veiledningen utvidet fra åtte til 18 egne steg.
Interne roller, kontraktsinnsyn, sjekklistefordeling, utfylling, faktisk bemanning,
UE-/leverandørtilgang, beboeravtaler, bestilling, avvik, varsler og økonomi har
egen plassering, anbefaling, hva som kan vente og neste handling. En native
stegvelger hindrer at 18 knapper skyver innholdet langt ned på mobil.
Økonomihjelpen forklarer kontraktsvilkår, Fakturert og a konto, separat indeks,
fakturadato, historisk indeksbekreftelse og senere fakturanummer uten dobbeltelling.
Excel-import er fortsatt utsatt. Ingen ny funksjon loves i hjelpen.

## Avgrensning

Bare Bolig-visning, Bolig-hjelp, eksisterende kontrollharnesser og påkrevd
dokumentasjon. Ingen endring av database, Edge, rutine-e-post, global meny,
tilgangskjerne eller andre moduler. Kandidat før denne etappen: ec6197af.

## Konkret brukerprøve

1. Samme Preview → PILOT – Løpende overtakelse · 12 leiligheter → Pilotbygg A.
2. Øverst før fasaden: «Pilotbygg A», «4 gjenstår», «2 overtatt».
3. «Ferdigstilling av bygg»: eksisterende liste med seks boliger og filtrene 4/2.
4. Bytt til Pilotbygg B: seks gjenstår og null overtatt. «Alle bygg»: ti/to.
5. Åpne A–Å-veiledningens overtakelsessteg, og «Slik styrer du prosjektet» →
   «Start her – arbeidsrekkefølge for store boligprosjekter».

Utviklerkontroller og fersk CI/Preview-status føres i PR278. Ingen merge før
relevant Preview-prøve, grønn QA og Kenneths samlede TEST OK.

Lokal verifisering: 59 Chromium-assertions i byggoversikten (42 tidligere
beholdt, 17 nye), 40 ferdigstillingsassertions og 213 overtakelses-/guideassertions
PASS. De 39 tidligere kontrollene er beholdt; alle 18 faser er gjennomgått på
320/390/1366 px, med valg, neste/forrige, egne plasseringer og neste handling,
interne roller, sjekklister, eksternt innsyn og fakturaredigering.
Eksisterende React-harnesser for tilgang og fasade PASS, med nye
hjelpeassertions for aktiv og deaktivert kontekst. Fersk core-boundary mot
main 36462e2b: 55 PASS. Mobil 320/390 og desktop 1366 inngår; skjermbildet på
390 er visuelt inspisert. Ingen runtime-feil eller lagringskall i visningsprøven.
Full critical Sandbox-build og diff --check PASS. React-gjennomgang: samme
komponentinstans og datakilde, ingen ny effekt/RPC, navnede regioner og native
knapper, ingen utvidet tilgang eller påvirkning av andre moduler.
