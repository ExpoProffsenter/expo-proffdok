# Samlet kontraktsøkonomi og CI – 25. oktober 2026

Senere avklaring fra Kenneth har erstattet det separate registreringsløpet og
uredigerbare fakturaer. Se `BOLIG_FAKTURAREGISTER_20261025.md` for gjeldende flyt.
Beskrivelsen nedenfor gjelder den tidligere etappen.

Miljømål BEGGE. Nå kun eksisterende feature/Preview og Sandbox. Ingen
produksjonsmerge eller produksjonsmigrasjon. Separat indeksfaktura er utvidet etter
Kenneths tilleggsbestilling, med additive migrasjoner bare i Sandbox.

Scope: BoligContracts, BoligContractFinance, BoligContractIndex, deres scoped
CSS/kladdrydding og tilhørende scenarioer. Bemanning endres bare i testfixture og
nettlesertest. Økonomiens private RPC utvides med separat indeksgrunnlag og
kobling til eget fakturanummer. Global navigasjon, øvrige moduler, tilgangsregler, gamle migrasjoner
og critical checks endres ikke.

## Ny brukerflyt

Kontrakter har én inngang: **Kontraktsøkonomi**.

- **Kontraktssum og vilkår**: grunnleveranse, opsjoner og felles indeksvilkår.
  Kontraktsmerknad er valgfri. Det finnes ingen separat kontraktssum-editor for
  indeksberegningen. Bare lagret grunnlag brukes; en usendt endring gjør ingen
  beregning om til ny avtale.
- **Fakturert og a konto**: oversikt og denne periodens nye beløp iht.
  betalingsplan eller dokumentert utført/medgått. Egne summer viser Fakturert a konto
  hittil og Fakturert indeksregulering hittil, i tillegg til samlet fakturert.
  Forhåndsvisning oppdaterer ingen
  fakturasummer. Utsted faktura i økonomisystemet og registrer fakturanummeret her.
  Fakturaer akkumuleres automatisk; kreditnotaer reduserer summene.
- **Beregn indeks for hele kontrakten**: bruker samme lagrede kontraktssum,
  opsjoner og vilkår. Bare reguleringsmåned, nytt indekstall og valgfri
  dokumentversjon velges her. Beregningen gjelder hele kontrakten uavhengig av
  fakturert hittil og oppretter ingen faktura.
- **Historikk**: fakturaer/kreditnotaer og godkjente indeksberegninger.
  Historiske beregninger viser lagret grunnlag, også etter senere avtaleendring.

Intern navigasjon bevarer usendt fakturautkast, kontraktsutkast og indeksutkast.
Endret lagret avtalegrunnlag ugyldiggjør forhåndsvisning og gammelt måltall for
indeks. Et ubekreftet lagringsforsøk prøves med samme uforanderlige payload/ID.
Ferskt avtalegrunnlag kontrolleres før ny helkontrakt-forhåndsvisning/godkjenning;
eksisterende SQL bruker fortsatt sin egen revisjonskontroll. Dette er ikke en ny
atomisk kobling mellom finans- og indeksrevisjon på tvers av samtidige klienter.

## Separat indeksfaktura

Kenneth valgte separat faktura med eget fakturanummer. Når periodens indeks er
valgt, er separat faktura standard. Forhåndsvisningen viser en ekstra linje med
indeksbeløp og fordeling. Registrering av a konto fører bare hovedstolen. Den
samme transaksjonen lagrer indeksgrunnlaget uten å regne det som fakturert.

Etter registrering brukes **Klargjør separat indeksfaktura for [nummer]**. Nytt
fakturanummer og faktisk fakturadato må fylles ut. Hovedstolen er null, og de
lagrede indeksbeløpene kan ikke redigeres i dette skjemaet. Registrering bruker
serverens uforanderlige grunnlag, lagrer referanse til a konto og summerer bare
indeks. Gammel indeksavtale beholdes selv om kontrakten senere endres.

Ventende grunnlag leses fra server og overlever omlasting/ny enhet. Serveren
avviser gjenbruk av samme kilde med annet fakturanummer, feil beløp, ny hovedstol,
annen avregningsperiode, kilde fra annet prosjekt og krediterte a konto-kilder.
Eksakt retry returnerer samme kvittering. Tilknyttet indeksfaktura kan krediteres
med vanlig kreditnota. Automatisk reutstedelse etter kreditering inngår ikke;
eventuell ny faktisk faktura føres kontrollert fra økonomisystemet.

Indeksnedgang vises som negativ regulering og kan tas som fradrag på samme a
konto ved å velge bort separat faktura. Den kan ikke registreres som en positiv
separat indeksfaktura. Nullbeløp lager ingen ventende indeksfaktura. Oversikten
viser inntil 50 ventende grunnlag om gangen; de eldste behandles først.

Migrasjonenes versjoner samsvarer med native Sandbox-historikk:
`20261024232138_bolig_separate_index_invoice.sql` og
`20261024232319_bolig_index_invoice_canonical_source.sql`. Native verktøy lagret første navn som
`20261024231829_bolig_separate_index_invoice`; versjonen er 20261024232138.
Første installasjon etterfølges av et additivt vern for kanonisk kilde-ID. Ingen gammel migrasjon
endres. Bare den eksisterende private økonomifunksjonen erstattes. Tabeller,
RLS, roller, offentlig RPC og øvrige moduler endres ikke.

Native funksjon før endring var identisk med committed månedlig baseline
(MD5 3e929a1649478dc5833f8e1ced153f3d). Etter siste migrasjon er funksjonens
MD5 b5c45fb284488f0586ff4cb954b52abf. Native rollback-smoke PASS for separat
hovedstol/indeks, varig kilde, retry, duplikatvern, summer og eksisterende
ACL/reader/revocation. Etterkontroll viser 0 QA-FINANCE-ROLLBACK-røtter.
Security advisors har uendrede kategorier/antall før/etter; ingen ny warning.

## Endring av testkontrakt

De gamle testene åpnet en egen indeksdialog og redigerte kontraktssummen der.
Det er nå feil ønsket oppførsel. Scenarioene følger én inngang og ett grunnlag,
og kontrollerer historikk fra før samlingen, delvalg, faktor, ny lagret avtale,
usendt avtaleutkast og uendrede fakturasummer. Opprinnelige privacy-/ACL-,
retry-, SSB-, skjermbredde-, utklipps- og dvalescenarioer beholdes.

Forrige CI stoppet ved «Rett tidspunkt» i bemanningens nettleserprøve. Feilen er
gjenskapt lokalt. Fixture filtrerte UTC-datodel mot Oslo-prosjektdag og tolket alle
lokale tider som +02. En utsjekking etter norsk midnatt kunne derfor skjule hele
besøket. Fixture bruker nå Europe/Oslo både ved konvertering og dagfiltrering.
Fast klokke etter norsk midnatt og eksplisitte vinter-/sommerkontroller gjør
regresjonen stabil hele året. Ingen produksjonskode for bemanning er endret.

## Utviklerkontroll

- 115 økonomikontroller og 52 indekskontroller PASS mot PostgreSQL/PGlite.
- 163 samlede Chromium-kontroller PASS for kontrakter, OCR/gjennomgang, økonomi,
  indeks, originaler, fokus/dvale, kladd og tilgang. React, SQL og lokale HTTP-
  handlere er ekte; Auth, Storage, SSB og modelltransport er syntetiske.
- Bemanning: 19 kontroller PASS ved både vintermidnatt og sommermidnatt.
- Full critical Sandbox-build PASS. 51 core-boundary assertions PASS mot main
  36462e2b (423 paths); diff --check PASS. Publisert SHA, Vercel READY og siste CI leses separat.
- Mobil/desktop-layout inspisert som skjermbilder, inkludert kontraktssum og
  indeksresultat. Overskriftskontrast i mørke økonomikort er rettet lokalt.

## Kenneths prøve i samme faste Preview

1. Åpne **Kontrakter → Kontraktsøkonomi → Kontraktssum og vilkår**. Kontroller at
   kontraktssummen står først og at merknaden kan stå tom.
2. Åpne **Fakturert og a konto → Ny a konto**. Velg **Iht. betalingsplan – denne
   perioden**, før månedens nye beløp og forhåndsvis. Registrer bare en faktisk
   utstedt faktura fra økonomisystemet. Fakturert hittil skal øke med beløpet.
3. Ved valgt periodisk indeks: kontroller den ekstra linjen for separat
   indeksfaktura. Registrer a konto uten indeks, bruk **Klargjør separat
   indeksfaktura for [nummer]**, og før eget utstedt fakturanummer. Bare indekssummen
   skal øke ved denne registreringen.
4. Åpne **Beregn indeks for hele kontrakten**. Kontroller at samme lagrede beløp
   og vilkår vises uten ny innlegging. Prøv deretter **Historikk**.
5. Åpne Windows Utklippsverktøy mens popupen vises. Popupen skal bli stående.

Innlogget fysisk brukerprøve, Windows Utklippsverktøy og Safari krever fortsatt
Kenneths prøve. Lokal automatisering er ikke dokumentasjon på disse enhetene.
PR #278 skal forbli OPEN DRAFT. Ingen samlet Bolig TEST OK eller merge.
