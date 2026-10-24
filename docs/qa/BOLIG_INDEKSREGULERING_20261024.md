# Indeksregulering mot byggherre

Miljømål **BEGGE**. Utført bare i feature-Preview/Sandbox, PR #278 fortsatt draft.
Ingen produksjonsmerge/-migrasjon, kjøp, AI-endring eller e-postaktivering.

## Avklart omfang

Kenneth: vanligvis «Boligblokk i alt», noen ganger «Rørlegger», av og til
reduksjonsfaktor, og avkryssing for leveransedeler. Presiseringen er
**grunnleveransen til byggherre og opsjoner**. Dette er ikke grunnpakke-/
tilvalgsprisene til beboerne. Begge rørindeksene skal være egne valg.

**Kontrakter → Indeksregulering mot byggherre** har avtalehenvisning, valgfri
referanse til én original dokumentversjon, indeks, basis-/reguleringsmåned,
indekstall og reduksjonsfaktor. Én grunnleveranse og inntil 50 navngitte opsjoner
har egne opprinnelige beløp ekskl. mva. og avkryssing. Ny opsjon er ikke krysset
av automatisk. Ukryssete beløp vises uendret i resultatet.

SSB-metadata kontrollert 24.10.2026:

- Boligblokk i alt: tabell 08655, Arbeidstype=20, ContentsCode=Byggindeks.
- Rørleggerarbeid i boligblokk: tabell 08655, Arbeidstype=28, samme statistikkvariabel.
- Rørleggerarbeid i kontor- og forretningsbygg: tabell 04534, ArbType=1,
  Innsatsfaktor=00, ContentsCode=ByggKostInd.

Knappen **Hent indekstall fra SSB** henter bare valgte offentlige serie/måneder.
Ingen kontrakt, beløp, navn, firma eller dokumentinnhold sendes. Credentials
utelates og referrer-policy er no-referrer. Hentingen har 15 sekunders frist og
avbrytes ved bakgrunn/unmount. Manglende tall brukes ikke som null eller som
forrige måneds tall. Bekreftede tall kan også føres inn manuelt. Serie-/månedbytte
tømmer gamle tall. Lagret kildeangivelse er klientinnsendt, ikke en attestasjon
fra SSB eller serveren. Kontraktsadministrator skal kontrollere tallene.

## Beregning og godkjenning

Regulering = opprinnelig beløp × (ny indeks / basisindeks − 1) × faktor.
Faktor 1 gir hele indeksendringen; faktor 0,90 og 10 % indeksøkning gir 9 %.
Samme faktor brukes ved nedgang. Faktor 0–1 og positive indekstall med inntil
fire desimaler støttes. Negative opprinnelige linjebeløp støttes ikke i denne
første etappen. Prosjektets faktiske avtale må passe denne beregningsmåten.

Serveren beregner med numeric og avrunder hver linjes regulering én gang til
øre, også ved negativ endring. Rå og anvendt prosentsats vises, men avrundet
visningsprosent brukes ikke i beregningen. Beløp, formler, valg og dokumentversjon
bevares i godkjent historikk. Ingen automatisk renteregning, månedsvis a-konto,
delbetalingsgrunnlag, prisoppdatering, faktura, vare-/beboer-/ordreendring eller
akkumulering av tidligere reguleringer. En ny beregning bruker opprinnelig
avtalegrunnlag fra basismåneden, ikke forrige regulerte sluttsum.

**Forhåndsvis regulering** skriver ikke noe. **Godkjenn og lagre beregning**
lagrer et uforanderlig øyeblikksbilde med aktør, seriereferanse og tidspunkt.
Gjeldende historikkrevisjon kontrolleres under prosjektlås. Samme forsøks-ID og
grunnlag gir samme kvittering etter tapt svar; endret payload/foreldet revisjon
avvises. En ny ID med identisk allerede godkjent grunnlag avvises også.
Historikken viser siste 50 poster. Eldre poster slettes ikke.

## Tilgang og isolasjon

Additiv migrasjon `20261024210413_bolig_contract_index.sql` er installert bare
i Sandbox `ppvircenkjizeiqdxphj`. Fil opprettet med CLI, deretter navngitt etter
faktisk versjon i Sandbox-migrasjonshistorikken. Ny privat deny-all RLS-tabell
`contract_index_reports`; ingen direkte table grants til anon/authenticated/
service_role. Public RPC er SECURITY INVOKER foran avgrenset privat gateway
med search_path=''. Eksisterende kontraktsautorisasjon gjenbrukes ved hver
lesing/forhåndsvisning/godkjenning og igjen etter venting på prosjektlåsen.
Kontraktsleser kan bare lese godkjent historikk. Arkivert prosjekt beholder lesing.

Ingen eksisterende authorizer, SQL-funksjon, migrasjon, global navigasjon,
pakkepris, tilvalg, fakturering, tilgang, eksport eller e-postmotor er endret.
Private beløp holdes bare i scopebundet RAM under klargjøring. Ingen privat
localStorage/sessionStorage/IndexedDB. Minuttkontroll bevarer editor/resultat;
reell bakgrunn skjuler innhold og krever ny forhåndsvisning etter reautorisasjon.
Tilbakekalt tilgang fjerner beløp fra arbeidsflaten.

## Verifisering og grenser

- 52 nye JavaScript/ekte PostgreSQL-kontroller PASS: selektiv regulering,
  positiv/negativ/halvøre-avrunding, nullfaktor, tre serier, validering,
  godkjenning, eksakt replay, konflikt, privat reader/admin-/anon-/tabellsperre,
  arkivering og offentlig SSB-request uten kontraktsdata.
- 98 Chromium-kontroller PASS: faktisk React → HTTP → PostgreSQL og gammel
  originalfil-/OCR-/analyseflyt; SSB-svaret, Auth/Storage og AI-svar er syntetiske.
  Nye reiser inkluderer avkryssing, invalidert forhåndsvisning, SSB-henting,
  kladd ved close/remount/bakgrunn, uendret DOM ved periodisk ACL, tapt
  godkjenningssvar/eksakt retry, leserhistorikk/tilbakekalling og 320/390/768/1366 px.
- Eksisterende 72 kontraktsanalyse-/SQL/API-kontroller PASS. Full critical
  Sandbox-build og core boundary (51 assertions) PASS. Siste SHA/CI/READY
  kontrolleres separat før publiseringspåstand.
- Faktisk offentlig SSB-POST kontrollert: 08655 total, 2025M01=143,1 og
  2026M01=151,0, json-stat2 med entydige månedskoder og CORS '*'. Dette er et
  kilde-/transportbevis, ikke en lagret kundeberegning.
- Native Sandbox rollback-smoke PASS: faktisk valgt beløp/faktor, preview uten
  skriving, godkjenning og samme kvittering, reader-/write-/tabell-/anon-grenser
  og tilbakekalling. Syntetiske aktører; alle midlertidige data rullet tilbake.
- Sikkerhetsrådgiver gir ingen nye ERROR-/WARN-kategorier. Ny tabell er bevisst
  privat med RLS uten direkte klientpolicy.

Innlogget faktisk Preview-prøve på 3299969b: SSB-knappen hentet 143,1 og 151,0
for januar 2025/januar 2026. Forhåndsvisning med fiktiv grunnleveranse 1 000 000
og ukrysset opsjon 200 000, faktor 0,90, ga 49 685,53 i tillegg og uendret opsjon.
Ingen beregning ble godkjent eller lagret i den delte piloten. Visuell kontroll
avdekket lys intro-/footertekst på lys dialogbakgrunn; root arver nå dialogens
tekstfarge, og mørke paneler har egen lys tekst. Ny kontrastassertion er lagt til.
Fysisk Safari/mobil og Kenneths relevante brukerprøve er egne bevis.
Ingen samlet Bolig TEST OK eller produksjonsgodkjenning.
AI Gateway-tilgang og full analyse av 150–250 sider er fortsatt utsatt.

## Kort brukerprøve

1. Åpne hovedprosjektet → **Kontrakter → Indeksregulering mot byggherre**.
2. Velg avtalt indeks og to publiserte måneder. **Hent indekstall fra SSB**, eller
   før inn kontrollerte tall. Oppgi avtalehenvisning og reduksjonsfaktor.
3. Oppgi opprinnelig grunnleveranse ekskl. mva. **Legg til opsjon** ved behov.
   Kryss av hvilke deler som skal reguleres.
4. **Forhåndsvis regulering**: kontroller tall, faktor, valgte deler og beløp.
   **Godkjenn og lagre beregning** skal gi en nummerert post i historikken.
   Prøv bakgrunn/retur før godkjenning; kladden skal beholdes.
