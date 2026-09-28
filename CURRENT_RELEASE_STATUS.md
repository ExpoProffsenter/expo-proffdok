# Gjeldende release-status – Fase 45B

Dato: 28.09.2026. Kode, backend og live system er fasit. Dette dokumentet skiller eksplisitt mellom Production og den umergede QA-hotfixen.

## Miljøer og GitHub

- Production: `main` står på merge-commit `517086b30a3bbfe14025bf9cda4faa2490d9c9a1` fra PR #190.
- Vercel Production: `dpl_DVnRrEqpNbv1sTpjSZQQF1sceoNd` er `READY`, `target=production` og peker på samme commit.
- PR #190 er `closed`, `merged=true`, `draft=false`. Den ble merget 27.09.2026 kl. 22:38:51 UTC etter Kenneths uttrykkelige `PRODUCTION GODKJENT`.
- Production-QA-hotfix: branch `fase45b-production-qa-hotfix`, PR #191. PR-en er fortsatt `open`, `draft=true`, `merged=false`, base `main`. Opprinnelig sluttføringshotfix er `5cbf2ed83b8a9e6207c55fe60de70ffb720c0760`; kontraktinngang direkte fra Prosjekt er `3d2d0f3fbeccc7bf62bebc8aed7beef92fd23af1`, med visnings-/no-op-vernet i `921a0daa3ed799a94d46c630fb179e304d0f1e1c`.
- Vercel Preview `dpl_DeqjU31LsXqcfVhWBu9tfUF9dH8B` er `READY`, `target=null` og peker på `921a0da`. HTTP-kontroll gir 200. Levert hovedbundle inneholder Sandbox-ref `ppvircenkjizeiqdxphj` og ingen Production-ref; leverte kontraktchunks inneholder prosjektinngang, versjonssamsvarssperre, matching på `contractId`/path/URL og no-op-vernet før synk.
- Supabase har kun Production/default `dqffxflaoyarbxyiyhop` og `demo-sandbox` `ppvircenkjizeiqdxphj`. Begge rapporteres `ACTIVE_HEALTHY`; kontrollplanstatusen `MIGRATIONS_FAILED` på demo-sandbox stammer fra opprettelsen og beskriver ikke dagens runtime.
- Permanent Demo (`demo`) og demo-sandbox er ikke endret av Production-QA-hotfixen.

## Gjennomført Production-E2E

QA-prosjektet `PRODUCTION QA FASE45B – bad og garanti` (`QA-45B-20260928`) ble ført gjennom reell Production-flyt med bare syntetiske QA-identiteter og uten reell kunde:

1. Forespørsel og befaring ble opprettet og fullført.
2. Badskisse ble laget.
3. Våtromstilbud med 12 seksjoner, 17 linjer og 30 opsjoner ble publisert og akseptert.
4. Valgte alternativer og totalsum 463 663 kr inkl. mva. ble kontrollert.
5. Akseptbevis, ordinært prosjekt og signert Expo-forbrukerkontrakt ble opprettet.
6. Prosjektering, 11 fremdriftsoperasjoner, åtte Sopro-produkter, overflater/innredning og Fag/utstyr ble registrert.
7. 64/64 ordinære kontroller og 14/14 Sopro-garantipunkter ble fullført; null åpne avvik.
8. Overtagelse ble signert av syntetisk utførende og syntetisk kunde.
9. 10 års dokumentert tetthetsgaranti ble utstedt som `EPD-26-HCVY6U`, gyldig til 2036-09-28, for Sopro AEB 815 / SINTEF TG 20918.
10. Komplett PDF på 22 A4-sider ble lastet ned og kontrollert visuelt side for side. Den inneholder prosjekt, produkter, kontroller, avtalegrunnlag, signert overtagelse, garantisertifikat, garantivilkår, bekreftelse og sluttdokumentasjon.
11. Prosjektet ble låst 28.09.2026 kl. 00:40:18 UTC. Read-only databasekontroll viser `locked=true`, prosjektstatus `locked`, garantivilkår `true` og registrert rapportfil/tidspunkt.

Ingen reell kunde-e-post var brukt. Under den manuelle popuphåndteringen ble ferdigmeldingskallet likevel godkjent mot den syntetiske `example.invalid`-adressen; Edge Function svarte HTTP 200, men det finnes ingen reell mottaker.

## Funn fra Production-QA

### Allerede på draft PR #191

- Prosjektoversikten viste lagret eks. mva.-beløp med etiketten inkl. mva. Hotfixen konverterer eksplisitt til 463 663 kr inkl. mva.
- Forrige/Neste-etiketter kunne bli hengende igjen fra Salgsgrunnlag. Hotfixen gjenoppretter riktig mål og etikett for hvert prosjektsteg.

### Rettet lokalt etter full E2E, fortsatt ikke i Production

- Første komplette PDF viste garantivilkår både som mottatt og «Ikke bekreftet». Rapporten bruker nå samme effektive vilkårstatus som Garanti-visningen når signert overtagelse foreligger.
- Ferdig PDF viste «Sist genererte rapport: Genereres nå». Hele PDF-kjøringen bruker nå ett faktisk starttidspunkt, og samme tidspunkt lagres etter nedlasting.
- Automatisk arkivert Expo-kontrakt manglet aktør. Nye kontraktdokumenter får nå `by` fra autentisert bedriftssignatar.
- Nye Fag/utstyr-poster kunne vise «Ukjent» når prosjektsnapshotets `user.name` var tomt. Aktør hentes nå først fra autentisert profil/metadata, deretter e-post.
- Sluttføring viste en duplisert generell låsebekreftelse etter den eksplisitte knappen «Fullfør overtagelse og lås prosjekt». Denne ekstra popupen hoppes nå over i sluttflyten; direkte låsing/opplåsing beholder bekreftelsen.
- README, arkitekturkart og brukerhjelp beskriver nå korrekt rekkefølge: signert overtagelse → garanti → komplett PDF → låsing.
- Ordinære prosjekter som er aktivert fra et akseptert tilbud, får nå en tydelig kontraktinngang direkte i **Avtalegrunnlag**. Den gjenbruker samme låste aksept og kontraktmotor som Sales, uten at brukeren må gå tilbake til Tilbud. Expo-kontrakt, egen opplastet kontrakt og ingen kontrakt forblir tre gyldige valg.
- Nye prosjektaktiveringer bevarer `salesOfferId`; eldre prosjekter kan hente ID og låst tilbudsversjon via eksisterende `get_sales_offer_by_token`. Kunde-/UE-portal skjuler inngangen, og låst prosjekt/supportmodus kan ikke utføre kontraktskriving. Ingen database-, RLS-, Storage- eller Edge Function-endring er gjort.
- Målrettet Preview-test avdekket at eksisterende auto-sluttarkivering kjørte en unødvendig, idempotent prosjektsynk ved ren visning av en allerede synkronisert kontrakt. Prosjektdata var byte-likt golden snapshot, men `updated_at` ble flyttet. QA-raden ble straks gjenopprettet nøyaktig fra `golden-v1` og verifisert med `exact_golden_match=true`. Koden hopper nå over synken når sluttfilen allerede matcher på `contractId`, Storage-path eller URL.
- Brukerrettet Hjelp for **Generelle tilbud** viste en intern sikkerhetsregel om nettopris. Teksten er fjernet fra Hjelp, mens den tekniske prisbeskyttelsen og tilhørende kritiske tester beholdes uendret. En negativ regresjonstest hindrer at den interne formuleringen legges tilbake i brukerhjelpen.

### Bekreftet eksisterende malfunksjon

- Bilder på tilbudsposter og opsjoner følger en firmamal når bildet allerede har en varig `https:`- eller trygg rot-relativ app-/Storage-URL. Tilhørende bildenavn bevares.
- Midlertidige `data:`/`blob:`-bilder og kundespesifikke PDF-vedlegg fjernes bevisst fra maldata. Eldre maler uten lagret bildepeker må lagres på nytt fra et tilbud som fortsatt har bildet.
- Atferden er dekket av `critical-store-template-check.mjs` for både ordinær tilbudsmal og komplett Generelt tilbud-mal.

### Observerte restpunkter

- PDF-en er komplett og uten avkuttede sider, men standardfonten fra jsPDF gir noe ujevn bokstavavstand. Dette er lesbart og ikke datatap, men er et eget visuelt kvalitetsløft.
- Native `window.confirm`/`alert` er blokkende og krevende for både mobil og automatisert QA. Denne hotfixen fjerner én duplikat-popup, men en senere avgrenset UX-endring bør erstatte native dialoger med én kontrollert app-dialog.
- Fysisk mobiltest på minst én iOS- eller Android-enhet gjenstår. Kritiske automatiske mobiltester for shell, Representerer, tilgang, app-/fanebytte og portalopprydding er grønne, men de erstatter ikke en fysisk enhet.
- Supabase-loggene i QA-vinduet viser gjentatte PostgREST/Warp «Thread killed by timeout manager»-linjer uten path/status. De observerte prosjektkallene rundt låsingen svarte 200/204, og Vercel rapporterer ingen runtimefeil i samme tidsrom. Loggmønsteret bør overvåkes separat før det eventuelt klassifiseres som appfeil.

## Verifisering av hotfixen

- `npm ci`: PASS.
- `npm run check:critical`: PASS, inkludert `critical-production-closeout-check.mjs`.
- Ny `critical-project-contract-entry-check.mjs`: PASS. Den kontrollerer adapteren for eldre/nye prosjekter, låst tilbud/opsjoner, eksisterende kontrakt, portal-/lesemodus, ingen retur til Sales og prosjektsynk etter sluttarkivering.
- Production-mode dry build: PASS og eksplisitt `Production Supabase only`.
- Sandbox-mode build: PASS og eksplisitt `Sandbox Supabase only`.
- `git diff --check`: PASS.
- GitHub `PR Core Safety` run `36397887995` på `921a0da`: PASS. Vercel commit-status: `success`.
- Vercel Preview `dpl_DeqjU31LsXqcfVhWBu9tfUF9dH8B`: `READY`, `target=null`, HTTP 200 og kun Sandbox-binding. Den faktiske leverte bundlen inneholder tidligere sluttføringsvern, prosjektkontraktinngangen og no-op-vernet for allerede synkronisert sluttfil.
- Ny ren Cloud Browser-økt logget sikkert inn i Sandbox og åpnet permanent demo-prosjekt i én fane. Avtalegrunnlag viste «Kontrakt fra prosjektet», de tre gyldige valgene og eksisterende signert kontrakt. «Åpne kontrakt» viste låst aksept, pris og valgte opsjoner i samme fane; «Tilbake til saken» returnerte til samme Avtalegrunnlag. Ingen popup eller ekstratab ble opprettet. Et prosjekt uten kontrakt ble ikke opprettet fordi permanent demo ikke skal endres; selve opprettelsesgrenen dekkes av kritisk test og bundlekontroll.
- Siste no-op-vern er verifisert i kilde, kritisk test, begge miljøbygg og faktisk levert Preview-bundle. En ny autentisert UI-retest på branch-aliaset ble ikke tvunget gjennom da den sikre innloggingen ikke ble fullført; det er bevisst ikke kopiert token/cookie mellom Preview-origins. Demo-raden står fortsatt eksakt lik `golden-v1` etter gjenopprettingen.
- Production er ikke deployet eller endret av hotfixarbeidet.

## Neste handling

1. Retest målrettet i én Preview-fane: kontraktinngang direkte fra Avtalegrunnlag, prosjektbeløp, prosjektsteg, garantivilkår/tidspunkt i PDF, auditnavn og redusert popuprekkefølge. Gjenta ikke hele Production-flyten før hotfixen eventuelt er godkjent og merget.
2. Utfør kort fysisk mobiltest på minst én iOS- eller Android-enhet.
3. Ikke merge PR #191 og ikke deploy til Production uten Kenneths nye uttrykkelige godkjenning.
4. QA-prosjekt, tilbud og forespørsel beholdes inntil resultatet er endelig grønt og Kenneth bekrefter sletting på handlingstidspunktet.
5. Etter godkjent hotfix, Production-QA og eventuell datasletting: minn om opprydding av gamle GitHub-brancher. Sluttbildet skal være `main` + permanent `demo`, og Supabase skal fortsatt bare ha Production/default + `demo-sandbox`.
