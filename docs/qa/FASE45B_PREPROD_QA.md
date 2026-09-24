# Fase 45B – Pre-production QA

Status: SANDBOX/release-kandidat. Skal ikke merges til `main` før komplett QA og eksplisitt **PRODUCTION GODKJENT**.

## 1. Baseline og isolasjon
- [x] Release-kandidat `fase45b-release-candidate` er synket med gjeldende Production-`main` `6d73ccb1e0c1fd654bb0faf69f3eb05ca78347cf` (PR #186 Sales auth/session-hotfix) og er 0 commits bak `main`.
- [x] Production-versjonen av `salesSupabase.js` og `critical-sales-auth-client-check.mjs` er båret inn identisk i release-kandidaten, og auth-vernet kjøres i både `check:critical` og `build`.
- [x] Tidligere feature-PR med feil rollback-merge-base er lukket uten merge; release-kandidaten har komplett Fase 45B-diff.
- [x] Sandbox-preview er eksplisitt bundet til Sandbox Supabase.
- [x] Production Supabase brukes kun read-only under utvikling/QA.
- [x] Miljøbevisst build-guard: Production hard-feiler ved Sandbox-binding; Fase45B/demo-preview hard-feiler ved Production-binding eller blandet binding.
- [ ] Endelig diff mot `main` gjennomgås fil for fil.

## 2. Eksisterende bruker/firma/godkjenning
- [x] Eksisterende bruker-/firmaopprettelse og godkjennings-RPC-er er ikke redefinert av Fase 45B.
- [x] Eksisterende Systemadmin bruker-/rolleadministrasjon er ikke erstattet.
- [x] Firma må fortsatt være godkjent og profil aktiv for modultilgang.
- [x] Eksisterende modulregel er bevart; ekstern proffsti er kun et tillegg for `store_offers`.
- [x] Ekstern proff krever eksplisitt `store_offers` + `sales` og minst én aktiv leverandør for aktivt firma.
- [x] Backend-regresjon: ekstern ansatt med `sales`, men uten `store_offers`, får ikke proffkatalog.
- [x] Backend-regresjon: ekstern ansatt med `sales` + `store_offers` + aktiv leverandør får proffkatalog.
- [x] Backend-regresjon: samme bruker mister proffkatalog når alle firmaets leverandører deaktiveres.
- [x] Backend-regresjon: deaktivert profil får ingen modultilgang.
- [x] Backend-regresjon: Firmaadmin kan ikke endre prisinnsyn for annet aktivt firma eller gi seg selv prisinnsyn.
- [x] Backend-regresjon: deaktivert bruker kan ikke få «Din nto pris» aktivert.
- [x] Firmaadmin får «Din nto pris» på samme Brukere og tilganger-kort; Systemadmin styrer fortsatt selve Enkel ordre/proffmodulen.
- [x] Systemadmin-support er fortsatt separat fra brukerens arbeidsprofil og er read-only der produksjonsflyten krever det.
- [ ] Manuell regresjon: ny bruker → firma → systemadmin-godkjenning → rolle/moduler.
- [ ] Manuell regresjon: eksisterende vanlig bruker uten profftilgang ser ingen proffkatalog.
- [ ] Manuell regresjon: Firmaadmin med to reelle brukere slår «Din nto pris» av/på og kan ikke endre annet firma.

## 3. Proff vareregister og priser
- [x] Bare eksplisitt aktive leverandører returneres i proffsøket.
- [x] `purchase_net_ex_vat`, innkjøpsrabatt, DG og påslag inngår ikke i proff-RPC-retur eller tilbudsdata.
- [x] `Din nto pris` = Kundepris eks. mva. minus firmarabatt.
- [x] Kundepris eks. mva. er foreslått salgspris til sluttkunde og kan redigeres i tilbudet.
- [x] Prisinnsyn er firmascopet og brukerspesifikt.
- [x] Backend-regresjon: bruker uten eksplisitt `Din nto pris` får `my_net_price_ex_vat = null` fra proffsøket.
- [x] Backend-regresjon: bruker med eksplisitt `Din nto pris` får beregnet nettopris i proffsøket.
- [x] Gammel tvetydig 2-args prisinnsyns-RPC er sperret for `authenticated`.
- [x] Release-hardening krever aktiv/godkjent bruker + `sales` + `store_offers` + aktiv leverandør når pristilgang slås på.
- [x] Standardforslag: FlisLab AS 40 %, FlisLabFLISER 40 %, Askøy 40 %, Baden Haus 30 %.
- [x] Standardforslag overskriver ikke allerede aktive rabatter.
- [ ] Manuell QA: Systemadmin legger til/fjerner leverandør og endrer rabatt.
- [ ] Manuell QA: Firmaadmin slår «Din nto pris» av/på for to forskjellige brukere.

## 4. Tilbud/kundevisning
- [x] Proffkatalog bruker samme tilbudsmotor, ikke separat tilbudsmodul.
- [x] Forhåndsvis som kunde åpner i egen fane før publisering.
- [x] Preview publiserer ikke tilbud, oppretter ikke token og sender ikke e-post.
- [x] Kundevisning viser priser inkl. mva. og opsjoner påvirker totalsum.
- [x] Demo firmalogo følger kundepresentasjon.
- [x] Varenummer vises internt på varelinjer og katalogbaserte opsjoner/alternativer, men ikke i kundetilbud.
- [x] Backend-transaksjon: offentlig kundelenke kan hentes som `anon`.
- [x] Backend-transaksjon: kundens aksept med valgt FLY-alternativ lagrer valgt opsjon med varenr. `02803` og setter saken til Akseptert; testen rulles tilbake.
- [ ] Manuell QA: publiser tilbud og send til kontrollert testadresse.
- [ ] Manuell QA: mottatt e-post → lenke → kundevisning → aksept med opsjon.
- [ ] Manuell QA: PDF/akseptbevis bruker riktig firmalogo og summer.

## 5. Aksept og bestillingsgrunnlag
- [x] Akseptert Enkel ordre kan velges videre som Enkel ordre eller ordinært prosjekt.
- [x] Systemadmin support ser valgene read-only og kan ikke aktivere på vegne av firmaet.
- [x] Backend-regresjon: aktivering av Enkel ordre blokkeres uten `store_offers`, og tillates med både `sales` + `store_offers`.
- [x] Eksisterende Bestillingsgrunnlag inneholder leverandørvarenummer, NOBB/GTIN der tilgjengelig og antall/enhet.
- [x] Bestillingsgrunnlag bruker låst akseptert versjon og valgte opsjoner/alternativer.
- [x] Pris/nto-pris inngår ikke i bestillingslisten.
- [x] Systemadmin support kan QA-lese bestillingsgrunnlaget for akseptert Enkel ordre.
- [ ] Manuell QA: kopier/skriv ut bestillingsgrunnlag med valgt alternativ.

## 6. Enkel ordre arbeidsflate
- [x] Teknisk workspace-guard omskriver prosjektmotoren til `Enkel ordre`/`Ordre`-terminologi.
- [x] Aksepterte produkter og valgte alternativer seedes til produkter/FDV-grunnlag uten priser, med låst tilbudssnapshot.
- [x] Backend portal-guard blokkerer kundelenke/kundeportal for Enkel ordre og tillater UE/underleverandør.
- [ ] Manuell QA: Oversikt og tydelig `Enkel ordre`-terminologi, ikke `Prosjekt` i brukerflate.
- [ ] Manuell QA: valgfri fremdriftsplan basert på aksepterte tilbudsposter.
- [ ] Manuell QA: Produkter/FDV følger akseptert tilbud der data finnes.
- [ ] Manuell QA: Bilder.
- [ ] Manuell QA: valgfrie relevante sjekklister.
- [ ] Manuell QA: UE-link.
- [ ] Manuell QA: Sluttdokumentasjon.
- [ ] Manuell QA: ingen kundelink/kundeportal for Enkel ordre.

## 7. Hjelp og vilkår
- [x] In-app HJELP beskriver proffkatalog, `Din nto pris`, kundepreview, Enkel ordre og Bestillingsgrunnlag.
- [x] Brukervilkår oppdatert til v1.1 med SoPro-forutsetning.
- [x] Eksisterende terms-versjonering gjør at v1.1 må godkjennes ved første innlogging etter oppdateringen.
- [ ] Manuell QA: vilkår v1.1 vises og kan godkjennes; admin ser akseptstatus.
- [ ] Endelig kommersiell/juridisk ordlyd godkjennes før Production.

## 8. Backend/migrasjoner før Production
- [x] Production Supabase er kontrollert read-only og har ingen 45B-migrasjoner, 45B-tabeller eller 45B-RPC-er installert.
- [x] Production har nødvendige prerequisites for 45B: firmascope/-medlemskap, profiler, modul-/featuretilgang, intern varekatalog, Sales/aksept, prosjekt/portal og nødvendige helper-funksjoner/kolonner.
- [x] Repoets 45B-migrasjoner ligger i deterministisk rekkefølge fra `20260922170000` til `20260923184500` og avsluttes med release-parity/sensitive-access/alternative-product hardening.
- [x] Statisk/read-only kontroll av migrasjonsavhengigheter mot faktisk Production-schema er gjennomført uten manglende prerequisites.
- [x] Sandbox release-parity-migrasjon er anvendt og backend-hardening verifisert transaksjonelt.
- [x] Sandbox: 45B-tabellene har RLS aktivert og direkte `anon`/`authenticated` tabelltilgang er revokert.
- [x] Sandbox: 45B-RPC-er er ikke eksponert til `anon`; relevante klient-RPC-er er eksplisitt gitt til `authenticated`.
- [x] Release-parity fjerner foreldreløs Sandbox-only pris-RPC og låser interne helper-/triggerfunksjoner for klientroller.
- [ ] Rehearsal: kjør hele repoets 45B-migrasjonsrekke på en ren Production-lik database uten historiske Sandbox-hotfixer, og sammenlign slutt-schema/grants med Sandbox-fasiten.
- [ ] Før faktisk Production-migrering: ny read-only preflight av Production-schema og gjeldende `main`-SHA.

## 9. Final gate før Production
- [x] Release-kandidat er 0 commits bak Production `main` og inkluderer PR #186 auth/session-hotfixen.
- [x] Release-kandidat `check:critical`/build inkluderer permanent Sales-auth-regresjonsvern.
- [x] Release-kandidat Vercel-preview på commit `a30cb5cd` er READY og svarer HTTP 200.
- [x] Ny miljøbinding-guard er verifisert i release-kandidatens Sandbox-preview.
- [ ] Ingen åpne kritiske Vercel/runtime-feil i release-preview etter full manuell smoke.
- [x] PR-diff er kontrollert for Sandbox testdata: ingen `DEMO-45B`, testkunde-UUID, `.invalid`-adresse eller `sales_requests`-seed ligger i Production-migrasjonene. Demologo ligger kun som statisk Sandbox-testasset.
- [x] Production/Sandbox refs og publishable keys forekommer kun i eksplisitt miljø-build-guard i `vite.config.js`; ingen nye klientmoduler har hardkodet backend-binding.
- [ ] Endelig diff mot `main` gjennomgås fil for fil etter siste QA-endring.
- [ ] Manuell smoke: Systemadmin, Firmaadmin, vanlig intern bruker, ekstern proffbruker, sluttkunde.
- [ ] Eksplisitt **PRODUCTION GODKJENT** før merge. `TEST OK` gjelder bare aktuell test/runde.
- [ ] Etter merge: trippel QA Production og kontrollert `main → demo`.
- [ ] Slett utdaterte feature/tmp-brancher etter opprydding. Behold permanent `demo`.
