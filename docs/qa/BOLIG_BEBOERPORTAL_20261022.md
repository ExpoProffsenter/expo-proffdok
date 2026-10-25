# Beboerportal – første samlede pakke

Miljømål **BEGGE**. Kenneth ba 22.10.2026 om å lese siste handoff og fortsette
Boligprosjekter. Avgrenset neste pakke er beboerportalen. Samme branch og draft
PR #278 brukes, fra 09529dc5. Gjeldende main er 6aa355cd (kontrollert via GitHub).
Ingen produksjonsmerge, produksjonsmigrasjon eller main→demo-synk.

## Omfang og kontrakt

- Ny inngang «Beboerportal» i eksisterende boligdialog; global navigasjon og Sales
  er urørt. Fire beboerområder: Mine valg, Avtaler, Dokumenter, Meldinger.
- Prosjektleder klargjør inntil 12 komplette valgmuligheter fra lagret boligvalg
  eller eksisterende pakke-preview for en valgt felles-/rompakke. Resten av
  boligen bevares. Alternativene og serverberegnet pris/fratrekk fryses.
  Dette er komplette alternativer, ikke fri kombinasjon av alle rom/tilvalg.
- Beboeren velger ett delt alternativ og sender det til gjennomgang. Priser og
  varegrunnlag kommer aldri fra klienten. Ingen automatisk avtaleaksept,
  leverandørbestilling, faktura eller endring av allerede bekreftet leveranse.
- «Bruk valget i avtalegrunnlaget» skriver ny intern valgrevisjon bare ved uendret
  kildegrunnlag, før avtale er publisert/akseptert og før bestilling finnes.
  Eksisterende kladder følger vanlige revisjonskrav. Etterpå klargjøres avtalen
  i «Endringer og beboeraksept». Senere endringer følger eksisterende endringsflyt.
- Versjonsaksept benytter samme beslutningskontrakt og aksepttrigger som gammel
  offentlig avtaleside. Gamle direkte avtale-URL-er fungerer fortsatt. Én gjeldende
  hovedavtale, siste endring per bestilling og sammenfoldet avtalehistorikk.
- 256-bit personlig capability ligger i fragmentet, bare hash i databasen.
  Lenken gjelder én bolig og én kontakt, varer 30 dager og kan tilbakekalles.
  Aktivt firma/prosjekt/bygg/oppgang/bolig og kontaktfingeravtrykk sjekkes ved hver
  operasjon. Ny kontakt mister tilgang til tidligere kontakts meldinger/valg.
  Hendelsene bevares i privat database. Innkjøpspriser, interne grunnsummer,
  leverandørmetadata og andre boliger inngår ikke i offentlig projeksjon.
- Dokumenter er inntil 30 eksplisitt delte eksterne https-lenker. Private
  Storage-filer deles ikke automatisk og kan ikke åpnes gjennom denne portalen.
- Meldinger og svar lagres i portalen. Invitasjon/påminnelse krever gjennomgang,
  kan kopieres og sendes gjennom separat e-postkanal. Ingen mailmotor,
  automatisk påminnelse eller fristvarsling er innført. Ingen ekte QA-mail.
- Portalkladder bevares ved lukking/fokus og er avgrenset til bruker/firma/bolig.
  Beboerkladd og uavklart sending sikres i sessionStorage. Samme request-id brukes
  etter tapt svar. Konflikt/revokering kontrolleres før replay. Samme firma og
  arbeidsprofil oppdaterer data uten å lukke arbeidsområdet.

## Tester og konkret evidens

- PGlite/PostgreSQL: **855 assertions**, alle tidligere 796 beholdt. Nye scenarioer
  dekker serverpris, grunnfratrekk, innsendingsreplay og konflikt, firma-/nabo-/
  leser-/anontilgang, private tabeller/funksjoner, stale grunnlag, publisering,
  rotasjon/utløp/kontaktbytte/tilbakekalling, avtaleaksept og kvitteringsreplay.
- Chromium portal: **27 assertions**, reelle komponenter/adaptre med isolerte
  API-mocker. Valg, tapte svar, reload/fokus, meldingskladd ved faneskift/lukking,
  dokumentlenke, nøyaktig aksept/kvittering, intern invitasjon, leserrolle og
  1366/390/320 px. Offentlig og intern CSS bygges separat. Visuell kontroll fant
  radioknapp-regresjon; rettet og beskyttet med egen størrelsesassertion.
- Eksisterende commerce Chromium: **38 assertions PASS**.
- Full kritisk Sandbox-build: **PASS**. Kjente advarsler om store chunks beholdes.
- Faktisk Sandbox: `scripts/bolig-portal-sandbox-smoke.sql` **PASS** med rollback:
  ny syntetisk struktur → grunnpakke → portal → anon-innsending/replay → lederens
  anvendelse som valgrevisjon 2 → tilbakekalling → anon-avvisning. Ingen testdata
  eller ekte utsending beholdes fra denne kontrollen.
- Security advisors: 396 eksisterende funn → **399**, nøyaktig tre nye **INFO**
  (`rls_enabled_no_policy`) for de nye private RPC-tabellene. Dette er bevisst
  default-deny: RLS er på, direkte tabellrettigheter er tilbakekalt, og tilgang
  skjer bare gjennom kontrollerte RPC-er. Ingen nye WARN/ERROR. Ikke beskriv
  resultatet som «ingen sikkerhetsadvarsler» eller «ingen nye advisor-funn».

Migrering `20261022203739_bolig_resident_portal.sql` er anvendt **kun i Sandbox**.
Ikke endre/kjør den på nytt. Ved ny schemaendring skal ny CLI-generert migrering
brukes. Verifikasjonsskriptet er lagt til eksisterende CI, uten svekkede tester.

## Publisering og brukertest

Første publiserte kode-SHA `25596783`, deployment `dpl_5qXgpMghijjvSNX8DvgcMtiub8P7` READY.
Faktisk skynettprøve bruker **DEMO – Beboerportal**, root
`14c8234e-1f14-42d3-8bae-7557abef3572`. Bevar denne nye demoen og alle tidligere demoer.
Fra UI ble grunnpakke 0 kr og eikealternativ 150 kr klargjort, invitasjon
forhåndsvist og portaltilgang opprettet uten utsending. Beboeren sendte alternativet
til gjennomgang og en melding. Leder anvendte det som intern valgrevisjon 2,
svarte og delte en syntetisk FDV-lenke. Avtale utgave 1 med 150 kr ble klargjort,
godkjent, publisert og akseptert på portalens avtaleside. Kvittering er verifisert.
Ingen ekte kundeavtale eller bestilling ble opprettet. FDV-testlenken er bevisst
syntetisk, og dokumentnedlasting fra ekstern server er ikke verifisert.

Skynettprøven fant at statusknappen kunne dekkes av innledningen på desktop.
Den bruker nå vanlig dokumentflyt. Ny runtime-test klikker knappen, henter et
nytt prosjektsvar og bevarer usendt meldingskladd. Normal pågående lagring viser
«Registrerer svaret»/«Lagrer endringen», ikke en for tidlig feilmelding om ukjent
resultat. Intern «Oppdater portalstatus» gir eksplisitt oppdatering uten å lukke.
Siste SHA, deployment og eksakt CI-resultat vedlikeholdes i PR #278.
Bruk fast Preview, ikke ny engangsadresse. Kenneths TEST OK kreves før merge.

Kort brukertest: Boligprosjekter → åpne prosjekt → velg bolig → Beboerportal.
Legg til to valgmuligheter, åpne Klargjør invitasjon, kontroller kontakt/pris og
lag portaltilgang. Åpne beboerportalen, send valg og melding. Gå tilbake internt,
gjennomgå valget, skriv svar og del en dokumentlenke. Se at akseptert avtale viser
kvittering. En reell e-postlevering, fysisk Safari og private filnedlastinger er
ikke verifisert i denne pakken.
