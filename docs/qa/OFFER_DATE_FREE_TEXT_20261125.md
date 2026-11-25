# Tilbudsdato og fri tekst – 25.11.2026

Miljømål: BEGGE. Baseline main/Production abe4ffded609865f1dd8e88a5de3b1d7cc1083f3, bekreftet Vercel READY på expo-proffdok.app. Arbeidsbranch fase45b-offer-date-free-text-20261125. Ingen produksjonsendring eller TEST OK.

## Scope

Sales-oversikt og lett datoprojeksjon; egne prisnøytrale tekstblokker i de aktive våtroms-/generelle tilbudseditorene og kundens visning; full tekst/paginering i tilbuds-/aksept-/kontrakts-PDF. Bolig-avtaleforslag: beboeraksept, endringsordre og butikktillegg med fryst tekst i snapshot. Ingen endring av innlogging, firmaroller, priser, akseptregler, e-post eller demo-overlay. Katalogens grunnpakke-/tilvalgskort er ikke endret.

## Lokale kontroller

- Sandbox critical/build PASS på implementasjonen, inkludert kontrakts-PDF-oppfølging.
- 14 faktiske lagrings-/rekkefølge-/pris-/publiserings-/fingeravtrykkskrav PASS.
- 2069 Bolig PostgreSQL-krav PASS, inkludert egne tekstkrav, ugyldig input, uendret pris, akseptert snapshot, replay, utløp, tilbakekalling og rollegjerder.
- 7 nye datoprojeksjonskrav PASS. Alle tidligere returverdier er identiske når bare det nye datofeltet fjernes. Ingen oppdiktet dato på upublisert sak, og firma-/anon-sperrer beholdes.
- 15 faktiske React-krav PASS: kontrollert editor, kundens/Boligs plassering før/mellom/etter, HTML-escaping, avsnitt, ingen pris på tekst og norske datodager. Tre faktiske PDF-er (tilbud/aksept/signert kontrakt) PASS: alle 150 tekstrader, sluttmarkør, postrekkefølge og sideskift. JSDOM gir en kjent canvas-advarsel fra jsPDFs valgfrie bilde/HTML-initialisering; ingen bilder er brukt i denne tekstprøven.
- Lokal Playwright Chromium kunne ikke lastes ned (Site Unavailable/403 fra offisiell CDN). Dette er ingen funksjonstest. Innlogget skynettøkt demo@expo-proffdok.no er tilgjengelig for publisert Preview.

## Sandbox-installasjon

Kontrollert fravær før installasjon. Kun ppvircenkjizeiqdxphj:

- lokal 20261125124710_sales_offer_summary_date.sql → remote 20261125125636_sales_offer_summary_date.
- lokal 20261125124713_bolig_offer_free_text.sql → remote 20261125125644_bolig_offer_free_text.

Ingen datatilbakefylling, nye tilganger, utsending eller endring av eksisterende avtaler. Bolig-migrasjonen setter kun tekst inn ved opprettelsen av nytt snapshot i gjeldende funksjonsdefinisjon, med eksplisitt ankerkontroll. Gjeldende frist-/support-/butikkrettigheter beholdes. Sikkerhetsrådgiver før/etter har identiske kategorier/nivåer/antall: INFO RLS 204, WARN search_path 1, extension 1, anon definer 22, authenticated definer 254, leaked-password 1. Dette løser ikke historiske rådgiverfunn.

## Før produksjon

Fullfør konkret Preview og grønn CI. Brukerprøve: Befaring/Tilbud → oversiktens dato; åpne et syntetisk våtromstilbud/generelt tilbud → Ny fri tekst → velg plassering → Lagre → Kundevisning/PDF. Bolig: klargjør beboeraksept/endringsordre eller butikktillegg → Ny fri tekst → kontroller kundens forslag. Ingen utsending til reelle mottakere.

Etter uttrykkelig TEST OK: kontroller nyeste main og proddefinisjoner/migrasjonstilstand, installer bare manglende nye migrasjoner i Production, merge godkjent kandidat, bekreft eksakt READY-commit og Production-binding, og gjennomfør kontrollert main → demo med bevart overlay/preflight.

Tilbakeføring: revert frontend. Behold additive tekstfelter i allerede lagrede snapshots og helper; gamle klienter ignorerer dem. Den lesende datoprojeksjonen kan bli stående. Ikke endre eller slett kunders avtaler, kladder eller historikk som tilbakeføring.
