# Kundens antall på opsjoner – Preview

Miljømål: **BEGGE**. Implementert fra main
`a31609fab8ca692293a79b55ad2617f7f5efe935` etter Kenneths «enig, kjør».
Denne godkjenningen gjelder implementering; ny TEST OK kreves før merge.

## Endring og avgrensning

- Våtromstilbud og Generelt tilbud: «Kunden kan velge antall» per tillegg.
- Kunden velger opsjonen og bruker − / antall / +. Tall med komma støttes.
  Tillatt mengde er over 0 og opptil 100 000, med høyst tre desimaler.
- Enhetspris, valgt mengde og sum følger tilbudets publiserte mva.-visning.
  Faste opsjoner beholder antall. Erstatningsalternativer og fradrag har fast antall.
- Ny aksept-RPC kontrollerer tilbudsversjon under tilbudets eksisterende radlås.
  Både gammel og ny RPC bruker publisert pris, fast antall og øvrige opsjonsfelt.
  Bare eksplisitt tillatt mengde tas fra kunden. Ukjente/dupliserte valg,
  motstridende alternativer, ugyldig mengde og utdatert versjon avvises.
- Kunden ser serverens akseptsvar. Valgt antall ligger i låst `selected_options`;
  `version_snapshot` beholder opprinnelig publisering. Eldre aksepter røres ikke.
- Akseptbekreftelsen og signert kontrakt viser valgt antall/enhetspris.
  Tilbuds-PDF forklarer at vist antall er standardantall ved kundevalg.
  Aksept-PDF og bestillingsgrunnlag bruker eksisterende låste akseptdata.
- Generell kladd-forhåndsvisning kan prøve valgene uten å registrere aksept.
  Eksisterende server-first, lokal sikring, recovery og prosjektflyt er bevart.
  Support/e-post, tilgangskjerne, navigasjon, Startside og Badskisse er utenfor scope.

## Backend

Migrasjon: `supabase/migrations/20261017124151_customer_option_quantities.sql`.
Anvendt kun i Sandbox `ppvircenkjizeiqdxphj`; ingen Production-migrasjon.
Ingen nye tabeller, kolonner, RLS- eller Storage-regler.

Lest tilbake i Sandbox:

| Funksjon | MD5 av pg_get_functiondef |
|---|---|
| accept_sales_offer(uuid,text,jsonb) | e33cec57de87e307bc83d3c2e0949127 |
| accept_sales_offer_quantities(uuid,text,jsonb,uuid) | 6819329298b816c2ea42b4faa333b990 |

Begge har eksisterende definer-prinsipp og låst search_path.
Integrasjonsskriptet `scripts/customer-option-quantity-sandbox-check.sql`
oppretter tilfeldige syntetiske tilbud og tester som `anon`, deretter ROLLBACK.
Fire downlights à 2 400 eks. mva. + fast tillegg 2 × 100 + grunnsum 10 000
gir 19 800 eks. mva. Serveren ignorerer innsendt pris/tittel og fast mengde 999.
Utdatert versjon, ugyldig mengde, lagret aksept og uendret publisering er prøvd.
Ingen e-post sendes og ingen testtilbud beholdes.

## Verifikasjon

- 29 rene runtime-assertions: validering, kladdsignatur, publisering,
  gjenåpning, summer og uforanderlig aksepthistorikk.
- 41 PostgreSQL-assertions med faktisk migrasjon i PGlite: anon/authenticated,
  forfalsket pris/metadata, gamle klienter, faste/alternative/gratis opsjoner,
  desimaler, status, utløp, versjonskontroll og snapshots.
- 92 Chromium-assertions på 1363, 768, 390 og 320 px med faktiske React-
  komponenter/global CSS: kundens wrapper, begge tilbudsbyggere via router,
  kortvalg, pluss/minus, feil antall, totalsum, aksept og bestillingsgrunnlag.
  Syntetisk arbeidsprofil og state; ingen innlogget ekstern transport i denne testen.
- Tre faktiske PDF-er generert med jsPDF 2.5.1. Tekstuttrekk verifiserer
  publisert standardantall og valgt 4 stk × 3 000, 12 000 og total 24 500 inkl. mva.
  Tilbud og aksept er også rendret til PNG og visuelt kontrollert.
- Eksisterende Sales editor-test: 128 Chromium-assertions ved fire bredder,
  inkludert opprinnelige lagre-/tilbakehandlinger og bilder/Badskisse.
- Full critical build og permanente checks for recovery, server-hydrering,
  desktop fanebytte/mobil dvale, bevisst navigasjon, mva., avvisning, revisjon,
  bestillingsgrunnlag og kontrakt beholdes. Nye mengdetester er lagt til CI.

Innlogget brukerprøve på ekstern Preview og fysisk mobil kreves fortsatt.
Automatisk lokal Chromium med syntetisk transport er ikke bevis på det.

## Kort brukertest på fast Preview

https://expo-proffdok-git-fix-company-admin-scope-20261015-ringside.vercel.app/

1. Åpne en testsak → Rediger tilbud. Åpne et tillegg, f.eks. downlight.
   Slå på «Kunden kan velge antall». Sett enhetspris og enhet stk. Lagre tilbud.
2. Bruk «Forhåndsvis som kunde». Velg opsjonen og prøv 4 med antall/pluss/minus.
   Kontroller enhetspris, opsjonssum og totalsum. Et fast tillegg skal ha fast antall.
3. Publiser testtilbudet og åpne kundelenken. Velg antall og aksepter med testnavn.
   Gjenåpne lenken: valgt antall og samme sum skal vises.
4. Åpne den aksepterte saken internt. Kontroller aksept-PDF og, for Generelt tilbud,
   «Åpne bestillingsgrunnlag». Valgt antall skal følge med.

Etter ny TEST OK: anvend verifisert migrasjon i Production før appen tas i bruk,
merge etter grønn CI, verifiser Production og synkroniser main → demo kontrollert
med bevarte overlays og 19 + 5 Sandbox-preflight. Ingen demo → main.
