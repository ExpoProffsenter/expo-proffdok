# Expo ProffDok – Demo Sandbox Architecture

**Status:** aktivt permanent isolert demo-/opplæringsmiljø  
**Opprettet:** 15.09.2026  
**Permanent frontend branch:** `demo`  
**Fast Vercel-host:** `https://expo-proffdok-git-demo-ringside.vercel.app`  
**Supabase sandbox project ref:** `ppvircenkjizeiqdxphj`  
**Production Supabase project ref:** `dqffxflaoyarbxyiyhop`

## Formål

Demo Sandbox brukes til kundedemo, intern opplæring og funksjonell QA der brukeren må kunne bruke den ekte Expo ProffDok-klienten uten risiko for Production-data.

Sandboxen er **ikke** en Preview mot Production-backend. Den har egen Supabase-database, egen Auth, egne Storage-buckets og egne demodata.

## Permanent miljømodell

- `main` er Production og eneste branch som skal deployes som ordinær produksjonsapp.
- `demo` er langlivet, permanent Sandbox/Demo og skal aldri merges tilbake til `main`.
- Ordinær produksjonskode kan etter godkjent Production-verifisering synkroniseres **main → demo**.
- Demo-overlay, demodata, syntetiske ressurser, demo-RPC-er, sandbox-konfigurasjon og sandboxspesifikke rettinger skal aldri flyte **demo → main**.
- Feature-/hotfix-arbeid starter fra gjeldende `main`, ikke fra `demo`.
- En feil oppdaget i demo som også kan være en reell produktfeil må først reproduseres mot ren `main`.

## Sikkerhetsgrense

- `main` / `https://expo-proffdok.app` er Production og skal aldri peke mot sandbox.
- `demo` / `https://expo-proffdok-git-demo-ringside.vercel.app` er permanent demo og skal **ikke merges til `main`**.
- Demo-builden erstatter Production-Supabase-endepunktet med sandbox-endepunktet under Vite-build.
- Builden verifiserer emitted JS og feiler dersom sandbox-binding mangler eller Production-Supabase-binding fortsatt finnes.
- `demo-control.html` er fast kontrollside for demooperatør.
- Sandboxen inneholder ingen kopierte kundesaker, prosjektdata eller Production-filer.
- Firmamaler/demoinnhold skal være sanitert/fiktivt.
- E-post/cron/automatiske Production-sideeffekter skal ikke aktiveres i sandbox uten en egen beslutning.
- Vanlige Vercel Previewer beholder `progressTest=safe`. Bare det dedikerte permanente sandbox-hostet unntas fordi backend allerede er fysisk isolert.

## Datamodell og schema

Supabase Branching kunne ikke bootstrappe Expo ProffDok direkte fordi repositoryets historiske migrasjoner ikke utgjør en komplett null-til-produksjon-baseline. Sandbox-schema ble derfor etablert schema-only fra dagens Production-katalog:

- 32 `public`-tabeller
- PK/UNIQUE/CHECK/FK
- nødvendige indekser
- nødvendige RPC-er for demo-løypen
- nødvendige runtime-grants
- ingen Production-rader

Dette avdekker teknisk gjeld: repositoryet bør senere få en komplett database-baseline/migrasjonskjede som kan bygge et tomt miljø deterministisk.

## RLS og grants

Production bruker RLS som sikkerhetsgrense. Sandbox er fysisk isolert og har forenklet runtime-sikkerhet for én dedikert demo-bruker:

- Production-RLS er ikke kopiert som autoritativ sikkerhetsmodell.
- `authenticated` har nødvendige rettigheter til å bruke appens demo-funksjoner.
- `anon` har kun nødvendige leserettigheter for bootstrap og offentlige kundesider.
- Production-databasen og Production-RLS er ikke endret.

Sandbox skal derfor aldri brukes med ekte kunde- eller prosjektdata.

## Storage

Sandbox har samme bucket-navn og filgrenser som Production, men ingen kopierte filer:

- `chat-images`
- `project-documents-private`
- `project-images`
- `project-media-private`
- `sales-inspection-photos`

Innlogget demo-bruker kan bruke disse bucketene i sandbox. Offentlige demoressurser kan leses fra demo-hostet eller de offentlige bucketene.

## Sales og kundereise

Sandbox seedes med fem tydelig merkede demo-stopp:

1. Forespørsel
2. Befaring
3. Tilbud
4. Akseptert tilbud
5. Aktivert prosjekt

Tilbudet har sanitert grunnlag med 12 tilbudslinjer og 38 opsjoner. Akseptert case har tre valgte opsjoner.

Publisering, kundepreview og kundelink kjøres mot sandboxdata. Ingen Production-tilbud eller kunder berøres.

## Fremdriftsplan

Dagens Production-kode støtter import fra akseptert tilbud via `get_sales_offer_by_token` og `buildAcceptedOfferProgressActivities`.

Sandbox-prosjektets `data.project.salesOrigin` må inneholde:

- `requestRef` til akseptert demosak
- `publicToken` til akseptert sandbox-tilbud

Demo-prosjektet starter med tom gyldig fremdriftsplan slik at presentasjonen kan vise selve handlingen **hent poster fra tilbud**.

Med gjeldende seed forventes 7 unike arbeidsoperasjoner fra tilbudet:

- Tildekking
- Demontering og riving
- Rørlegger
- Elektriker
- Maler
- Rigg og drift
- Avfallshåndtering

Valgte opsjoner følger arbeidsoperasjonen de tilhører. Tre valgte opsjoner følger Rørlegger i demo-seedingen.

Det dedikerte sandbox-hostet skal ikke bruke `progressTest=safe`, fordi denne eldre Preview-sperren med vilje deaktiverer tilbudsimport og serverlagring.

## Golden snapshot og reset

Sandboxen lagrer endringer permanent i sin egen database. Refresh er derfor ikke en reset.

Golden snapshot brukes til å gjenopprette kjent demo-tilstand. Endringer i Golden skal være kirurgiske og skal aldri utføres ved generisk sletting/navnesøk. Før en viktig demo skal operatøren kontrollere:

1. riktig permanent demo-host
2. synlig demo-kontroll
3. riktig Representerer-firma
4. kun tydelig merkede demosaker
5. tilbudsgrunnlag og kundevisning
6. ønsket starttilstand i Fremdrift
7. kundelink/portal
8. bilder/Storage ved behov
9. rapportgrunnlag hvis rapport skal vises

## Production → demo synk

Når ny produksjonsfunksjonalitet er godkjent og verifisert i Production, kan gjeldende `main` synkroniseres inn i `demo`.

Synken må bevare sandbox-overlayet og må aldri kopiere demo-spesifikke filer eller data tilbake til Production. Etter synk skal minst følgende verifiseres:

- demo-branchen bygger
- emitted JS har sandbox-binding og ingen Production-Supabase-binding
- fast demo-host svarer
- demo-control svarer
- demodata/Golden finnes
- sentrale kundereiser åpner riktig

## Relasjon til Production

Endringer som oppdages under sandbox-demo skal vurderes som vanlige produktendringer:

1. reproducer mot gjeldende `main`
2. skill sandbox-konfigurasjon fra reell produktfeil
3. lag separat feature/hotfix fra ren `main`
4. critical QA + Preview
5. eksplisitt `TEST OK`
6. merge og Production-verifikasjon
7. synk deretter Production-kode main → demo dersom endringen også skal finnes i demo

En feil som bare skyldes sandbox-seed, grants, Auth, Storage eller Golden skal **ikke** repareres ved å endre ordinær Sales/recovery/autosave i Production-koden.
