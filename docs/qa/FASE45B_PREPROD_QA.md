# Fase 45B – Pre-production QA

Status: SANDBOX/feature. Skal ikke merges til `main` før komplett QA og eksplisitt Production-godkjenning.

## 1. Baseline og isolasjon
- [x] Feature bygger fra gjeldende `main` uten å ligge bak.
- [x] Sandbox-preview er eksplisitt bundet til Sandbox Supabase.
- [x] Production Supabase brukes kun read-only under utvikling/QA.
- [ ] Sandbox-only Vite-rewrite/guard fjernes eller erstattes før Production-PR.
- [ ] Endelig diff mot `main` gjennomgås fil for fil.

## 2. Eksisterende bruker/firma/godkjenning
- [x] Eksisterende bruker-/firmaopprettelse og godkjennings-RPC-er er ikke redefinert av Fase 45B.
- [x] Eksisterende Systemadmin bruker-/rolleadministrasjon er ikke erstattet.
- [x] Firma må fortsatt være godkjent og profil aktiv for modultilgang.
- [x] Eksisterende modulregel er bevart; ekstern proffsti er kun et tillegg for `store_offers`.
- [x] Ekstern proff krever eksisterende `sales`-tilgang + eksplisitt aktiv leverandørtilgang for aktivt firma.
- [x] Systemadmin-support er fortsatt separat fra brukerens arbeidsprofil og er read-only der produksjonsflyten krever det.
- [ ] Manuell regresjon: ny bruker → firma → systemadmin-godkjenning → rolle/moduler.
- [ ] Manuell regresjon: eksisterende vanlig bruker uten profftilgang ser ingen proffkatalog.
- [ ] Manuell regresjon: firmaadmin kan ikke endre annet firmas prisinnsyn.

## 3. Proff vareregister og priser
- [x] Bare eksplisitt aktive leverandører returneres i proffsøket.
- [x] `purchase_net_ex_vat`, innkjøpsrabatt, DG og påslag inngår ikke i proff-RPC-retur eller tilbudsdata.
- [x] `Din nto pris` = Kundepris eks. mva. minus firmarabatt.
- [x] Kundepris eks. mva. er foreslått salgspris til sluttkunde og kan redigeres i tilbudet.
- [x] Prisinnsyn er firmascopet og brukerspesifikt.
- [x] Gammel tvetydig 2-args prisinnsyns-RPC er sperret for `authenticated`.
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
- [ ] Manuell QA: publiser tilbud og send til kontrollert testadresse.
- [ ] Manuell QA: mottatt e-post → lenke → kundevisning → aksept med opsjon.
- [ ] Manuell QA: PDF/akseptbevis bruker riktig firmalogo og summer.

## 5. Aksept og bestillingsgrunnlag
- [x] Akseptert Enkel ordre kan velges videre som Enkel ordre eller ordinært prosjekt.
- [x] Systemadmin support ser valgene read-only og kan ikke aktivere på vegne av firmaet.
- [x] Eksisterende Bestillingsgrunnlag inneholder leverandørvarenummer, NOBB/GTIN der tilgjengelig og antall/enhet.
- [x] Bestillingsgrunnlag bruker låst akseptert versjon og valgte opsjoner/alternativer.
- [x] Pris/nto-pris inngår ikke i bestillingslisten.
- [x] Systemadmin support kan QA-lese bestillingsgrunnlaget for akseptert Enkel ordre.
- [ ] Manuell QA: kopier/skriv ut bestillingsgrunnlag med valgt alternativ.

## 6. Enkel ordre arbeidsflate
- [ ] Oversikt og tydelig `Enkel ordre`-terminologi, ikke `Prosjekt` i brukerflate.
- [ ] Valgfri fremdriftsplan basert på aksepterte tilbudsposter.
- [ ] Produkter/FDV følger akseptert tilbud der data finnes.
- [ ] Bilder.
- [ ] Valgfrie relevante sjekklister.
- [ ] UE-link.
- [ ] Sluttdokumentasjon.
- [ ] Ingen kundelink/kundeportal for Enkel ordre.

## 7. Hjelp og vilkår
- [x] In-app HJELP beskriver proffkatalog, `Din nto pris`, kundepreview, Enkel ordre og Bestillingsgrunnlag.
- [x] Brukervilkår oppdatert til v1.1 med SoPro-forutsetning.
- [x] Eksisterende terms-versjonering gjør at v1.1 må godkjennes ved første innlogging etter oppdateringen.
- [ ] Manuell QA: vilkår v1.1 vises og kan godkjennes; admin ser akseptstatus.
- [ ] Endelig kommersiell/juridisk ordlyd godkjennes før Production.

## 8. Final gate før Production
- [ ] Alle `check:critical`/build guards grønne på endelig commit.
- [ ] Ingen åpne kritiske Vercel/runtime-feil i feature-preview.
- [ ] Kontroll av migrationsrekkefølge og function grants mot faktisk Production.
- [ ] Ingen Sandbox/testdata følger som Production-datamigrasjon.
- [ ] Ingen Production secrets/URLs er lagt i nye klientfiler.
- [ ] Manuell smoke: Systemadmin, Firmaadmin, vanlig intern bruker, ekstern proffbruker, sluttkunde.
- [ ] Eksplisitt Production-godkjenning før merge.
- [ ] Etter merge: trippel QA Production og kontrollert `main → demo`.
- [ ] Slett utdaterte feature/tmp-brancher etter opprydding. Behold permanent `demo`.
