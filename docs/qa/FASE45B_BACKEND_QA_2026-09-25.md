# Fase 45B – backend-QA 25.09.2026

Dette dokumentet oppsummerer live backend-QA etter Fase 45B release candidate. Repository/backend er fasit; eldre chat er ikke releasebevis.

## Miljøgrense

- Production Supabase: `dqffxflaoyarbxyiyhop` – ingen Fase 45B-migrasjoner er lagt inn.
- Demo Sandbox Supabase: `ppvircenkjizeiqdxphj` – brukes til Fase 45B backend-QA og permanent kursdemo.
- Permanent `demo`-branch er ikke mergekilde til Production.
- Ingen full schema-/datasynk Production → Demo/Sandbox er utført i denne QA-runden.
- Demoens Golden snapshot/reset-infrastruktur er beholdt urørt.

## Live verifisert

Transaksjonelle tester ble kjørt med `ROLLBACK`; etterkontroll viste ingen gjenværende QA-brukere, saker, prosjekter eller prisrettigheter.

- Proff tilgang/pris: 13/13 grønn.
- Enkel ordre normal serverløype: 8/8 grønn.
- Nytt firma/onboarding: 7/7 grønn.
- Aktiver som ordinært prosjekt: 4/4 grønn.
- Publisering/kundelenke/aksept: 6/6 grønn.
- Ekstern modul-/leverandørguard: grønn.
- Leverandørfilter: godkjente leverandører returneres; ikke-godkjent leverandør filtreres bort.
- `Din nto pris`: korrekt separat proffpris; intern ERP-netto/rabatt/DG/påslag returneres ikke.
- Kundeportal blokkert for Enkel ordre; UE tillatt.
- Valgt alternativ erstatter grunnprodukt ved produkt/FDV-seeding.
- Production/Sandbox public RLS-policyer: 55/55 med lik kanonisk policy-hash i kontrollen.

## Sandbox-paritet reparert – kun navngitte deler

Sandbox manglet deler av den eldre Fase 39B-katalogbaselinen. Kun følgende ble gjenopprettet i Sandbox:

- `internal_store_catalog_normalize_supplier(text)`
- `internal_store_catalog_refresh_search_text()`
- trigger `internal_store_catalog_items_refresh_search_text`

I tillegg ble Sandbox `accept_sales_offer(uuid,text,jsonb)` brakt til gjeldende Production-kontrakt slik at andre gangs aksept blokkeres og valgt opsjon valideres.

Dette var en målrettet Sandbox-reparasjon, ikke full synk av Production-schema/data.

Etter reparasjon:

- systemadmin-RPC for leverandør/rabatt fungerer igjen
- andre gangs kundeaksept blokkeres
- normal første aksept fungerer
- `demo_sandbox_preflight()` er grønn på alle 17 kurskontroller

## Fase 45B-feil rettet

Kundeportal-guard blokkerte tidligere også revokeringen som skulle rydde bort eksisterende kundetilgang ved konvertering til Enkel ordre.

Rettet kontrakt:

- eksisterende kundetilgang kan revokeres
- opprettelse av kundetilgang på Enkel ordre blokkeres
- reaktivering blokkeres
- UE-tilgang påvirkes ikke

`critical-simple-order-workspace-check.mjs` har permanent regresjonsguard for dette.

## Separat Production-core hotfix

Backend-QA avdekket at gjeldende Production `publish_sales_offer(jsonb)` kan republisere et allerede akseptert tilbud. Dette er ikke en Fase 45B/Demo-endring og håndteres separat fra fersk `main` i draft-PR/hotfix-branch.

Production-databasen skal ikke endres før separat QA og eksplisitt `TEST OK / PRODUKSJON GODKJENT`.

## Gjenstår manuelt før Fase 45B Production-release

Backend-testene erstatter mye repetitiv manuell testing, men følgende må fortsatt vurderes i faktisk UI:

- registrering/godkjenning og forståelig visning av moduler/leverandører
- `Din nto pris` av/på visuelt for to brukerroller
- tilbudsbygger og kundepreview
- e-post/kundelenke og faktisk presentasjon hos sluttkunde
- Enkel ordre-arbeidsflate på PC/mobil
- valgfri fremdrift og FDV i UI
- ordinær prosjektaktivering i UI
- regresjon av Befaring/Tilbud, Butikktilbud, recovery, fanebytte og mobil appbytte

Ingen merge til Production før manuell slutt-QA, ny reconcile mot gjeldende `main` og eksplisitt Production-godkjenning.
