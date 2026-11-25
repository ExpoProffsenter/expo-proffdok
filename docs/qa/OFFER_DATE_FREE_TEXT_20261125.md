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

## Oppdeling og innlogget Preview-kontroll

Core PR348: e0829508502efc59153ed803a8de22e75548205e, tree a63f180331e72391b526ca8d5ecf2beda92a756f. PR347 følger som avhengig Bolig-PR mot denne eksakte basen. `bolig-core-boundary-check` PASS55 på17Bolig-/hjelpe-/test-/dokumentasjonsstier. Sales-produktkode er uendret fra a6fa3c1; egne tester er delt i11persistenskrav,9Sales React og16Bolig React, uten å fjerne de tidligere kravene.

Første CI45619736575 feilet to kontrakter: samlet Sales/Bolig-diff ble korrekt avvist av scopevakten; nytt hjelpetema manglet i den eksplisitte listen over tillegg. Løst med separate PR-er og ett navngitt nytt hjelpetema med egen innholdssjekk. De69opprinnelige hjelpeteksthashene,13tidligere tillegg, alle tidligere assertions og scopevakten er beholdt. Ingen scopevakt er endret. Historisk CI-vilkår ble senere avgrenset til sin eksakte gamle main, se core-rapporten; alle147direkte opprinnelige QA-kommandoer er bevart. Ny full CI på kontrollert oppdeling kreves.

Sikker innlogging til full sandbox-Preview med demo@expo-proffdok.no bekreftet. Liste viser publiseringsdato på eksisterende publiserte/aksepterte tilbud, og opprettelsesdato på upublisert kladd. Syntetisk F0054: ny blokk før vareposten, lagring, kundens visning og reload PASS;1250inkl.mva. beholdt. Syntetisk F0053: ny blokk etter rørleggerposten, lagring, kundens visning og reload PASS;2500inkl.mva. beholdt. Begge egne blokker deretter fjernet og lagret; separat hosted lesing bekreftet0tekstblokker og2000/1000eks.mva. Ingen publisering, utsending eller signering. Nettlesertest ventet først feilaktig på editor etter reload; siden hadde korrekt åpnet samme sak og teksten var intakt. Ingen datafeil funnet.

Før oppdelingen er også den separate sales-preview-inngangen visuelt kontrollert med syntetiske lokale poster: tekst mellom to prisposter, bevarte avsnitt og1875inkl.mva. Denne inngangen er ikke brukt som bevis på hosted lagring og har eksisterende, urelaterte utviklingsvisningsbegrensninger. Ingen produksjonsdata er skrevet.

## Native Bolig-kontroll i publisert sandbox

På READY5f092af (dpl_4YkeYrNZKtJq6M47o59ALwr15gnC), samme produktkode som neste kandidat: Min side → Mine boligprosjekter → syntetisk «QA – Butikkflyt og video 14.11» → H0101. Ny lokal testvare1250inkl.mva. og tekst før varen vistes riktig i «Kontroller beboerens forslag». Lukking/gjenåpning beholdt kladden. Egne testvare/tekst ble fjernet; begge felt var tomme etterpå. Ingen forslag ble publisert eller sendt.

Prosjektledervisning → samme boligs Endringer og beboeraksept → Klargjør beboeraksept: egen ny lokal tekst etter inkludert grunnpakke vistes riktig i kundekontrollen, total0inkl.mva. som før. Egen kladd forkastet; ingen tidligere kladd fantes. Eksisterende to aksepterte butikktillegg og historikk forble urørt. Hjelpesøk «fri tekst» fant nøyaktig det nye temaet, og prosjektet kunne åpnes igjen. Ingen faktisk ny akseptlenke, endringsordre eller kundeaksept opprettet i hosted miljø; disse snapshot-/tilgangsbanene er kontrollert i database/React-testene.

En gammel åpen nettleserfane forsøkte å hente en tidligere lazy JS-fil under deploybytte. Én normal omlasting lastet riktig versjon og Bolig fungerte. Dette var et deploybytte, ingen innloggingsfeil. Ingen nye fysiske mobil-/Safari-prøver er gjennomført. Produksjon er fortsatt urørt.

## Kritisk tilleggstest 25.11.2026

Brukeren ba om kritisk egenkontroll etter første fullgrønne kandidat1c037de. Faktisk F0054sandbox: tekst med overskrift, norske tegn og blanklinjer før vare ble lagret korrekt. Kundens reelle skrivebeskyttede forhåndsvisning viste riktig tekstkort og1250inkl.mva. Tom blokk ble filtrert ved lagring. Egen testtekst ble fjernet og lagret; opprinnelig1250sum beholdt. Ingen ny publisering eller utsending. Sidepanelet viste en kortvarig eldre lagret kladd før eksplisitt lagring; riktig oppdatert plassering etter lagring.

Fant en reell feil i Bolig: numerisk tekstposisjon var uendret når tidligere vare ble slettet eller varene flyttet. Etter B i[A,B,C] ble etter C når A forsvant. Rettet i både butikkens change-handler og prosjektlederens updateForm: behold stabil varekobling i redigeringsforløpet, og serialiser fortsatt kun riktig numerisk plassering i det fryste snapshotet. Hvis målvaren slettes, behold tekst ved forrige overlevende vare/før første. Ingen migrasjons-, pris-, tilgangs- eller transportendring.

Ny faktisk butikk-React-regresjon dekker sletting av A, bevaring etter B, boligbytte/gjenåpning, kundekontroll og sletting av B. 23Bolig-fritekstkrav inkluderer omflytting, sletting før/mål/all, bevart innhold og uendret tidligere snapshot. Tillegg i ekte Chromium commerce-test dekker tilsvarende prosjektlederhandlinger, gjenåpning,360px bredde og lang sammenhengende tekst. Lokal Chromium-binær mangler; denne nettleserprøven skal bekreftes i full CI, ikke påstås lokal. Ingen ny fysisk Safari-prøve.
