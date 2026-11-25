# Kontraktsøkonomi og utklipp – 25. oktober 2026

Kenneth melder at popupen forsvinner når Utklippsverktøyet åpnes. Han finner ikke
kontraktssummen og spør hvorfor «Henvisning til økonomiavtalen» er obligatorisk.

Miljømål BEGGE, kun feature/Preview/Sandbox. Ingen produksjonsmerge.
Scope: BoligContracts.jsx, BoligContractFinance.jsx, boligContractFinance.js, boligContractFinance.css,
tilhørende Bolig-kontraktstester og denne dokumentasjonen. Ingen global dialog,
navigasjon, tilbud, HR, KS/HMS, tilgangsregler eller database endres.

## Endret og presisert hendelseskontrakt

Den tidligere testen «blur hides financial data» representerer nå feil ønsket
oppførsel: tap av vindusfokus skjer også ved Windows Utklippsverktøy, et annet
synlig vindu eller nettleserens verktøy. Dette er ikke bevis på fanebytte/dvale.

- Synlig dokument + blur: behold samme popup, redigering, forhåndsvisning og scroll.
- Fokus tilbake i fortsatt synlig og autorisert dokument: kontroller tilgang i
  bakgrunnen, uten å suspendere popup eller gjenskape skjema/resultat.
- document.hidden/visibilitychange: behold tidligere sperre, skjul privat innhold,
  kontroller tilgang før retur, og gjenopprett gyldig kladd.
- Tilbakekalt tilgang, reelt firma-/brukerbytte, feil ved tilgangskontroll og bevisst
  lukking skal fortsatt virke. Privat PDF-iframe skal ikke lastes på nytt ved utklipp.

Før rettelsen feilet den nye utklippstesten med `actual: 0, expected: 1`.

Tester som før brukte bare blur som synonym for skjult dokument endres til faktisk
visibilitychange med document.hidden. Dette bevarer sperretesten og legger til
regresjonstest for brukerens faktiske feil, i stedet for å fjerne en kontroll.

## Enklere økonomiskjema

- «Kontraktssum og opsjoner» er et tydelig eget oppsett.
- «Kontraktssum ekskl. mva.» står først og betyr grunnleveransen uten opsjonene
  som føres separat. Eksisterende lagrede beløp og linje-ID-er bevares.
- Opsjonene får navn og beløp med forståelige feltetiketter.
- «Merknad til kontrakten (valgfritt)» erstatter den obligatoriske henvisningen.
  Tom merknad får den nøytrale posttittelen «Kontraktsgrunnlag» i eksisterende
  lagringsformat. Dette legger ikke til noen avtale eller vilkår.
- Felles indeksvilkår og hver dels indeksavkryssing beholdes. Ingen beregningsregel
  eller godkjent historikk endres.

## Test og leveringsstatus

Før-/etter-regresjon, samlet kontraktsbrowserprøve, økonomi-/indeks-suite,
critical build og core-boundary er kjørt før publisering. Preview og nyeste CI må
kontrolleres på eksakt remote SHA. Fysisk Windows Utklippsverktøy prøves av Kenneth.

## Gjennomført kontroll

- Før-/etterprøve: den synlige popupen forsvant før rettelsen og bevares etter.
- Samlet kontraktsbrowserprøve: 136 assertions PASS på endelig kode og layout.
  Samme DOM, scroll og avregning etter synlig blur/focus, samt skjult dokument,
  OCR-avbrudd, reader/tilbakekalling, PDF-bytes og firmabytte er med.
- 75 økonomikontroller og 52 indekskontroller PASS mot ekte PostgreSQL. Valgfri
  blank merknad er også prøvd gjennom faktisk skjema → HTTP → SQL.
- Full critical Sandbox-build og 51 core-boundary assertions PASS mot main
  36462e2b. Ingen SQL-/databasemigrasjon eller global endring i denne rettelsen.
