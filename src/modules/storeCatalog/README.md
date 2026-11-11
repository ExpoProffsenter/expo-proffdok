# Varesøk og proffkunders varebestilling

Intern Prissøk/ERP, eksisterende bestilling til leverandør og proffkatalog er forskjellige tilgangssoner. Varebestilling er tilgjengelig med eksisterende proffkatalogtilgang eller internt Prissøk. Innkjøpsprisinnsyn er ikke en forutsetning. Proffkunden beholder firmaets leverandøravgrensning; interne brukere bestiller aktive varer fra Prissøk.

Interne brukere finner Varebestilling rett under Prissøk, før Firmaprofil, samt knappen Åpne varebestilling i Prissøk. Søk i bestillingen brukes til å velge varer; eksisterende plukklister og leverandørbestilling er uendret.

Brukerflyt for proffkunder: Varesøk → åpne varekort med egne priser → velg antall og Legg i varebestilling → Se varebestilling → mottaker/levering → Se over bestillingen → Send bestilling. Mottaker kan lagres eksplisitt for firmaet. Ønsket levering er «Avtales» eller dato med valgfritt klokkeslett. Kvitteringen skiller mellom e-posttjenestens aksept og mottakerens ordrebekreftelse.

Varekurv, opplysninger og uavklart sendeforsøk sikres separat per bruker/firma i nettleseren. Ved feil på lokal sikring må siden holdes åpen og feilen løses før nye handlinger. En uavklart sending gjenbruker samme ID; ikke lag en ny bestilling for å prøve samme sending igjen.

Serverkontrollene gjelder også ved direkte RPC-/Edge-kall og ved bortfalt tilgang. Filene kommer fra ett uforanderlig servergrunnlag: eksisterende prisfrie Cordel ASCII-format samt XLSX-kontrollfil. Proffkatalog-/tilbudsfeltene får ikke interne innkjøpspriser.

Arkitektur/API: `docs/architecture/PRO_CATALOG_ORDERS.md`.
Tester: `scripts/pro-catalog-order-db-check.mjs`, `scripts/pro-catalog-order-email-check.mjs`, `scripts/pro-catalog-order-browser-check.mjs`.

## Rask registrering av flere varer

Når en vare velges, får antallet fokus og kan overskrives. +/− og pil opp/ned endrer antallet med én; desimalkomma og punktum kan skrives manuelt. Enter i antall åpner et fokusert søk etter neste vare under de registrerte varelinjene. Enter i søket velger første treff, også når søket må hentes først. Et tomt søk blir aldri en tom varelinje. Ugyldig antall beholdes for retting; maks 99999 og inntil tre desimaler som på serveren. Usikker eller sendt bestilling er låst som før.

## Kundens varesøk
Eksterne proffkunder bruker ProCatalogSearch: resultatlisten og valgt vare viser kundens avtalte pris, eventuelt veiledende salgspris når individuelt prisinnsyn ikke er aktivert. Interne innkjøpspriser, margin og innkjøpsrabatt brukes ikke. Prisdata ligger bare i minnet, og lastes på nytt ved tilgangskontroll. Bestillingskladden lagrer kun identitet og antall; varelinjens pris leses fra autorisert RPC.

Smartere søk bruker additive `search_pro_store_catalog_smart`: samme fagordregister som internt søk, men bare aktive leverandøravtaler for aktivt firma og samme individuelle prisinnsyn. Systemadmin kan velge supportfirma; vanlig bruker kan ikke overstyre firma. Ingen eksisterende intern søkefunksjon endres. Funksjonen må installeres i riktig Supabase-miljø før klienten publiseres.
