# Varesøk og proffkunders varebestilling

Intern Prissøk/ERP, eksisterende bestilling til leverandør og proffkatalog er forskjellige tilgangssoner. Varebestilling er tilgjengelig med eksisterende proffkatalogtilgang eller internt Prissøk. Innkjøpsprisinnsyn er ikke en forutsetning. Proffkunden beholder firmaets leverandøravgrensning; interne brukere bestiller aktive varer fra Prissøk.

Interne brukere finner Varebestilling rett under Prissøk, før Firmaprofil, samt knappen Åpne varebestilling i Prissøk. Søk i bestillingen brukes til å velge varer; eksisterende plukklister og leverandørbestilling er uendret.

Brukerflyt for proffkunder: Varesøk → velg vare → Varebestilling → antall/mottaker/levering → Se over bestillingen → Send bestilling. Mottaker kan lagres eksplisitt for firmaet. Ønsket levering er «Avtales» eller dato med valgfritt klokkeslett. Kvitteringen skiller mellom e-posttjenestens aksept og mottakerens ordrebekreftelse.

Varekurv, opplysninger og uavklart sendeforsøk sikres separat per bruker/firma i nettleseren. Ved feil på lokal sikring må siden holdes åpen og feilen løses før nye handlinger. En uavklart sending gjenbruker samme ID; ikke lag en ny bestilling for å prøve samme sending igjen.

Serverkontrollene gjelder også ved direkte RPC-/Edge-kall og ved bortfalt tilgang. Filene kommer fra ett uforanderlig servergrunnlag: eksisterende prisfrie Cordel ASCII-format samt XLSX-kontrollfil. Proffkatalog-/tilbudsfeltene får ikke interne innkjøpspriser.

Arkitektur/API: `docs/architecture/PRO_CATALOG_ORDERS.md`.
Tester: `scripts/pro-catalog-order-db-check.mjs`, `scripts/pro-catalog-order-email-check.mjs`, `scripts/pro-catalog-order-browser-check.mjs`.

## Rask registrering av flere varer

Når en vare velges, får antallet fokus og kan overskrives. +/− og pil opp/ned endrer antallet med én; desimalkomma og punktum kan skrives manuelt. Enter i antall åpner et fokusert søk etter neste vare under de registrerte varelinjene. Enter i søket velger første treff, også når søket må hentes først. Et tomt søk blir aldri en tom varelinje. Ugyldig antall beholdes for retting; maks 99999 og inntil tre desimaler som på serveren. Usikker eller sendt bestilling er låst som før.
