# Support: felles innboks, avslutning og utklipp – 17. oktober 2026

Miljømål BEGGE. Kenneth ba om å fjerne Ansvarlig, sikre felles tilgang for alle
systemadministratorer, rette utklippshopp og gi en samlet endringsoversikt.
Han spurte også når/hvor en sak meldes ferdig.

## Scope

Bare SupportWorkspace.jsx, support.css, additive support-browser-/DB-tester og
supportdokumentasjon. Ingen ny migrasjon, endret RLS, global fokus-/scrollkode,
Sales/recovery/hydrering, produksjonsaktivering eller eksisterende e-postarbeider.
Utgangspunkt 3907837f i PR #263, main fortsatt publisert #262.

## Feil og rettelser

1. Ansvarlig var et unødvendig valg som kunne gi inntrykk av privat tildeling.
   Valget er fjernet. Teksten forklarer at innboksen er felles. Statushandlinger
   sender null som eldre kompatibilitetsfelt; ingen tildeling kreves. Alle ferskt
   godkjente systemadministratorer kunne allerede lese/svare på tvers av firma.
2. Avslutning var skjult i Status-listen. Merk som løst ligger nå ved svarfeltet.
   Send svaret først; avslutningsknappen sender ikke teksten. Ulagret tekst beholdes.
   Både knapp og Status → Løst lagrer direkte. Bekreftelsen sier at saken er løst.
   Ny melding fra brukeren gjenåpner saken gjennom eksisterende backendregel.
3. Synlig vindusfokus erstattet hele samtalen med en kort tilgangsmelding. Faktisk
   Chromium-prøve før retting: scroll 2971 → 0, sidehøyde 3871 → 900. Dette forklarer
   hoppet ved utklipp/fokus. Synlig fokus beholder nå samme DOM, tekstarealhøyde,
   tekstmarkering og rulleposisjon mens tilgang fortsatt valideres. Lagring stoppes
   synkront under kontrollen. Det er ingen ny scrollTo/recovery-timer.
4. Reelt skjult dokument fjerner fortsatt privat historie fra DOM. En tom flate
   beholder målt høyde og slår av scrollankring; manuelt endret tekstarealhøyde
   huskes i komponentminnet ved retur. Ingen støtteinnhold legges i browserlagring.
   Tilgangstap fjerner samtale/kladd. Sene ugyldige fokusresultater avvises før
   de får oppdatere visningen. Bevisst Tilbake til saker respekteres.
5. Statusendring oppdaterer også supportoversikten via eksisterende endringssignal.

## Verifikasjon

- 109 PostgreSQL-assertions PASS, inklusive ny systemadmin i annet aktivt firma:
  samme tildelte sak, interne merknader, offentlig svar og status. Første admin
  ser samme svar. Tilbakekalt systemrolle avvises. Nye fixture-prøver rulles tilbake.
- 52 Chromium-assertions PASS i utvidet eksisterende supporttest. De opprinnelige
  scenarioene består: idempotent lagring, privat intern merknad, mobilbredder,
  bakgrunnsskjuling, kladd, statusfilter, tilgangstap og e-postdialog. Testen av
  løst-status forventer den nye, tydeligere kvitteringsteksten; ingen garanti svekkes.
- Fokusprøvene holder tilgangssvaret tilbake, prøver å sende under kontrollen og
  sjekker eksakt høyde/scroll/DOM/tekstmarkering før, under og etter validering.
  Faktisk bakgrunn/retur prøves også på 1280 og 390 px. Ingen e-post sendes.
- Alle 30 layoutkontroller PASS. Full lokal Sandbox critical/build PASS.
- Eksakt CI og innlogget Preview-prøve dokumenteres i PR #263.

## Brukertest

1. Systemadmin → Supportsaker → åpne saken. Ansvarlig skal være borte.
2. Skriv et svar. Prøv Windows-utklipp. Samme utsnitt/kladd skal bli stående.
3. Send svar. Når henvendelsen er ferdig behandlet: Merk som løst.
   Se kvitteringen og status Løst. Saken finnes fortsatt i Alle saker/Løst.
4. Et nytt brukersvar skal gi status Ny igjen.

Samme faste Preview. Support-e-post er fortsatt avslått. Ikke merge/aktiver før
relevant ny TEST OK. Samlet tidligere UX-status finnes i SUPPORT_LAYOUT_20261017.md.
