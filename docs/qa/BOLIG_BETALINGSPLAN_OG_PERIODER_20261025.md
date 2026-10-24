# Betalingsplan og månedens utført/medgått – 25. oktober 2026

Kenneth avklarte at fakturert hittil skal akkumulere når a konto-fakturaer føres
etter betalingsplan. Alternativt faktureres bare dokumentert utført/medgått for
måneden. Ingen ny samlepost kalt «utført og fakturert» innføres: betalingsplanen
kan avvike fra faktisk utført arbeid, og dette systemet må ikke likestille dem.

Miljømål BEGGE. Kun feature/Preview og Sandbox ppvircenkjizeiqdxphj.
Ingen produksjonsmerge/-migrasjon. Samling av de to inngangene til
«Kontraktsøkonomi» er foreløpig et forslag, ikke implementert eller bestilt her.

## Brukerflyt

- Standardvalg **Iht. betalingsplan – denne perioden**. Oppgi periodens nye
  beløp ekskl. indeks, ikke samlet hittil. Neste periode starter med tomme felt.
- Alternativ **Dokumentert utført/medgått – denne perioden**. Oppgi bare periodens
  dokumenterte verdi som kan faktureres. Brukeren kontrollerer dokumentasjonen;
  denne endringen innfører ikke en dokumentkontroll eller vedleggsfunksjon.
- Begge metodene legger registrerte fakturaer til fakturert hittil. Tidligere
  fakturaer trekkes ikke fra periodens beløp en gang til. Kun forhåndsvisning
  teller fortsatt ikke som fakturert. Kreditnotaer reduserer summer som før.
- Indeks følger kontraktens avkryssede deler og vilkår, separat fra hovedbeløpet.
  Indeks er av som standard ved betalingsplan og kan velges eksplisitt.
- Kvitteringen viser hvilket faktureringsgrunnlag som ble brukt.

Eksempel uten indeks: 100 000 i januar og 150 000 i februar gir 250 000 fakturert
hittil. Et dokumentert marsbeløp på 50 000 gir deretter 300 000, ikke en negativ
differanse mot tidligere fakturaer.

## Historikk og teknisk avgrensning

Eksisterende `payment` bruker allerede periodens beløp. Ny metode `documented`
lagres eksplisitt på fakturaposten, med samme periodiske pengegrunnlag. Ny migrasjon
er opprettet med Supabase CLI og erstatter bare Bolig-økonomiens egen funksjon med
to presise utvidelser av tillatte metodeverdier. Original migrasjon er uendret.
Tilgang, RLS, prosjektlås, revisjon/retry, summer, kreditering og indeksformel er
identiske. En ny browser kan ikke velge den gamle kumulative `earned`-metoden.
Eksisterende kvitteringer, API-grunnlag og eventuelle ventende eldre forsøk beholder
opprinnelig `earned`-beregning og merkes som tidligere beregningsmåte i visningen.
Ingen eksisterende faktura omtolkes eller omskrives.

## Kontroll

SQL-suite utvides med flere månedsfakturaer etter betalingsplan og dokumentert
periode, uendret historikk, avvisning av feil metodetype og kontroll av fakturert
hittil. Nettleserprøven tester defaultvalg, tomt nytt periodefelt, flere fakturaer,
periodens indeks, dokumentert månedsgrunnlag og kreditnota. Tidligere OCR-/utklipp- /
tilgangs-/original-/indeksprøver beholdes. Native Sandbox-smoke kjører med rollback.

Utført: 86 økonomikontroller og 141 samlede Chromium-kontroller PASS. Full critical
Sandbox-build PASS. Native Sandbox-smoke med dokumentert periode og summer PASS;
alle midlertidige data rullet tilbake. Migrasjonen er installert bare i Sandbox
som `20261024225233_bolig_contract_monthly_basis.sql`.
