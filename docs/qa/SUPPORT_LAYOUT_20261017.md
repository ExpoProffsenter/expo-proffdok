# Support og Systemadmin – 17. oktober 2026

Miljømål BEGGE. Kenneth ba om eget Support-område ved siden av Hjelp, varsling på
Min side og Systemadmin med samme grupperte presentasjon som KS/HMS, og sa «kjør».
Dette utvider uttrykkelig navigasjons-/presentasjonsscopet i PR #263.

## Avgrensning

- SupportWorkspace, nytt SupportSummary og supportOverview-hook med egne stiler.
- Ny SystemAdminWorkspace/CSS, avgrenset oppdeling av AppNewsAdmin i nyheter og
  utsending. Gamle nyhets-, utsendings- og Sales-supporthandlinger beholdes.
- main.jsx: ny supportfane, Min side-snarvei og wrapper rundt eksisterende
  administrasjonspaneler. Gamle brukere-/produkt-/prosjekt-/synkhandlinger beholdes.
  Eksplisitt tilbake til prosjektstøtte åpner fortsatt riktig firma/arbeidsflate.
- Native menykilder, globalt Support-mål i prosjektets flytnabofilter og en
  desktopknapp som videresender til samme native goToTab som eksisterende meny.
- PersonalPage: lite kort for egne svar. Ingen egen kopiert samtalehistorikk.
- Én additiv migrasjon support_overview og utvidelse av den nye support_list med
  ulest-filter. Ingen gamle autorisasjoner/RPC-er, profiler eller RLS endres.
- systemAdminStoreCatalogUx: eksisterende ERP-panel monteres i et eget skjult/valgt
  område. Original serverkontroll og vareverktøy er uendret.
- Nye og utvidede supporttester, additiv CI og dokumentasjon.

Sales, autosave/recovery/hydrering, bootstrap, prosjektdata, HR/KS/HMS-innhold,
garantier, eksisterende e-postarbeidere og Production-aktivering er utenfor scope.

## Oppførsel

Support står ved siden av Hjelp i hovedmenyen og desktoplinjen. Hjelp har igjen
bare veiledning. Support viser kompakt sideinndelt liste, status/ulest-filter og
én samtale om gangen. Min side viser antall saker med nye svar og åpner samme
autoriserte sak. Det fungerer også uten HR-/KS/HMS-lisens.

Systemadmin har Oppfølging, Forvaltning og Informasjon og drift, med Oversikt,
Supportsaker, Firmaer og prosjekter, Brukere og roller, Produktmaster, Internt vareregister, Nyheter i
appen, E-postutsending og Dokumentsynk. Bare valgt arbeidsflate vises. Besøkte
paneler holdes montert for å bevare søk/utkast ved internt visningsbytte. Originale
handlinger gjør fortsatt faktisk lagring/utsending; navigasjon gjør ingen slik
handling. Ved tilbakekomst fra et skrivebeskyttet supportprosjekt åpnes igjen
Firmaer og prosjekter. Support gir ingen skrivebypass til prosjektet.

Oppsummerings-RPC-en er read-only, krever fersk godkjent/verifisert bruker og
aktivt firma gjennom eksisterende supportgate. Firmaadmin får bare egne tall;
global innboks krever Systemadmin. Tall og nyeste uleste ID er uten meldingsinnhold,
intern mottaker, svartoken eller providerinformasjon. Teller omfatter alle sider.
Hooken fjerner gamle tall ved bakgrunn/rolle-/firma-/kontobytte og avviser sent svar.
Ingen nye data eller kladder legges i browserlagring.

## Verifikasjon

- 100 faktiske PostgreSQL-assertions PASS på hele supportmigrasjonssekvensen.
  Nye prøver dekker egne/admin-tall, intern merknad, lest-kvittering, 45 uleste
  saker over to sider, kryssrolle og anon uten tilgang.
- 30 faktiske Chromium-assertions for ny layout PASS: header/native meny,
  Min side til nøyaktig sak, grupper/enkeltpanel, bevarte søk/nyhetsutkast,
  originale handlinger, ingen implisitt mail/publisering og sen/falsk identitet.
  Faktisk ERP-monteringsadapter prøves i gruppen, skjult på oversikten og med
  samme monterte rot ved visningsbytte. Tilgangsgaten gir ingen varetilgang i fixture.
- Eksisterende Support 23 Chromium-assertions PASS, inklusive private merknader,
  lagringsreplay, fokus/dvale, firmaendring og e-postlenkens sikre dialog.
- Eksisterende faktisk Min side/HR/profil/e-postvalg og modulnavigasjon PASS.
  Ingen ekte bruker/profil, e-post eller nyhet endres av testene.
- Faktisk Sandbox-migrasjon 20261016223601 er installert. Rollback-prøve med
  eksisterende syntetisk eier bekrefter egne tellinger, uten å markere saker lest.
  Innlogget Preview cba86: Support ved Hjelp, Min side åpnet nøyaktig ulest
  sak #3, Hjelp uten sakslist og gruppert Systemadmin bekreftet. Ingen ny
  sak, svar, nyhet eller e-post ble sendt av denne prøven. CI #516 grønn.
  Oppdatert Preview 01fc304: ERP-panelet er skjult på Oversikt og vises bare
  under Internt vareregister. Faktisk samlet firma-/brukerflate lastet, søket
  «Proffkunde» overlevde bytte til Produktmaster og tilbake. Produktmaster og
  Dokumentsynk viste eksisterende kontroller. Ingen lagring eller synk ble kjørt.
  Full lokal critical/build PASS; siste CI-status føres i PR #263.
- Skjermbilde: support-admin-overview-20261017.jpg, faktisk innlogget Preview.

## Konkret brukertest

Fast Preview beholdes:
https://expo-proffdok-git-fix-company-admin-scope-20261015-ringside.vercel.app/

1. Trykk Support ved Hjelp. Se egne saker, åpne én og gå Tilbake til saker.
   Hjelp skal ikke inneholde sakslisten.
2. Systemadmin → Supportsaker: åpne saken og send et offentlig testsvar.
   Intern merknad skal fortsatt bare finnes i innboksen.
3. Min side → Åpne nyeste svar: samme sak skal åpnes i Support. E-post er fortsatt
   avslått i Preview; ingen levering loves av denne prøven.
4. Systemadmin: bytt mellom Brukere og roller, Produktmaster, Internt vareregister, Nyheter i appen og
   Dokumentsynk. Bare valgt område vises. Et skrevet nyhetsutkast skal være der
   når du kommer tilbake, uten at noe publiseres.

Relevant ny TEST OK kreves før merge/Production. Mottakswebhook og faktisk avtalt
e-postprøve gjenstår; tidligere godkjent nøkkel er fortsatt bare serverlagret.
