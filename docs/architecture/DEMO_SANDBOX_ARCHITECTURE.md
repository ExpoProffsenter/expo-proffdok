# Expo ProffDok – Demo Sandbox Architecture

**Status:** aktivt isolert demo-/opplæringsmiljø  
**Opprettet:** 15.09.2026  
**Frontend branch:** `feature/demo-showcase-isolated`  
**Supabase sandbox project ref:** `ppvircenkjizeiqdxphj`  
**Production Supabase project ref:** `dqffxflaoyarbxyiyhop`

## Formål

Demo Sandbox brukes til kundedemo, intern opplæring og funksjonell QA der brukeren må kunne bruke den ekte Expo ProffDok-klienten uten risiko for Production-data.

Sandboxen er **ikke** en Preview mot Production-backend. Den har egen Supabase-database, egen Auth, egne Storage-buckets og egne demodata.

## Sikkerhetsgrense

- `main` / `https://expo-proffdok.app` er Production og skal aldri peke mot sandbox.
- `feature/demo-showcase-isolated` er permanent demo-branch og skal **ikke merges til `main`**.
- Demo-builden erstatter Production-Supabase-endepunktet med sandbox-endepunktet under Vite-build.
- Gult merke `DEMO SANDBOX · IKKE PRODUKSJON` skal alltid være synlig i demo-builden.
- Sandboxen inneholder ingen kopierte kundesaker, prosjektdata eller Production-filer.
- Firmamaler/demoinnhold skal være sanitert/fiktivt.
- E-post/cron/automatiske Production-sideeffekter skal ikke aktiveres i sandbox uten en egen beslutning.
- Vanlige Vercel Previewer beholder `progressTest=safe`. Bare det dedikerte sandbox-hostet unntas fordi backend allerede er fysisk isolert.

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

Innlogget demo-bruker kan bruke disse bucketene i sandbox. Offentlige demoressurser kan leses fra de offentlige bucketene.

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

## Drift og reset

Sandboxen lagrer endringer permanent i sin egen database. Refresh er derfor ikke en reset.

Før en viktig demo skal demooperatør kontrollere:

1. gult sandbox-merke
2. riktig sandbox-host
3. riktig Representerer-firma
4. fem demosaker, ikke ekte kundesaker
5. tilbudsgrunnlag og kundevisning
6. tom/ønsket starttilstand i Fremdrift
7. kundelink/portal
8. bilder/Storage ved behov

En framtidig forbedring er en egen Kenneth-only `Reset sandbox`-handling som restaurerer demo-seed atomisk. Inntil den er implementert skal reset utføres kontrollert i sandbox-backend, aldri med generisk sletting i Production.

## Relasjon til Production

Endringer som oppdages under sandbox-demo skal vurderes som vanlige produktendringer:

1. reproducer mot gjeldende `main`
2. skill sandbox-konfigurasjon fra reell produktfeil
3. lag separat feature/hotfix fra ren `main`
4. critical QA + Preview
5. eksplisitt `TEST OK`
6. merge og Production-verifikasjon

En feil som bare skyldes sandbox-seed, grants, Auth eller Storage skal **ikke** repareres ved å endre ordinær Sales/recovery/autosave i Production-koden.
