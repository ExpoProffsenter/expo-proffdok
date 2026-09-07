# Expo ProffDok – Fase 38A: Brukere og modultilganger

**Dato:** 08.09.2026  
**Produksjonsbaseline ved oppstart:** `09385d70964d855a7f9ecd5b227ef6ce9e0c0763`  
**Supabase:** `dqffxflaoyarbxyiyhop`  
**Feature branch:** `feature/fase38a-modultilganger`

Dette dokumentet er styrende for Fase 38A og supplerer `EXPO_PROFFDOK_ARCHITECTURE.md`.

## 1. Mål

Expo ProffDok skal skille tydelig mellom:

1. **rolle** – hvem som kan administrere andre brukere
2. **firmatilhørighet** – hvilke data brukeren tilhører og kan arbeide med
3. **modultilgang** – hvilke hovedfunksjoner brukeren faktisk får bruke

Modultilgang skal aldri være en ren frontend-funksjon. Meny og Hjelp er bare presentasjon av den serverstyrte tilgangen.

## 2. Hovedmoduler

Fase 38A bruker få, grove tilgangsgrenser for å unngå overfragmentering:

| Nøkkel | Synlig navn | Omfang |
|---|---|---|
| `projects` | Prosjekter og dokumentasjon | Prosjekter, produkt-/FDV-dokumentasjon, bilder, sjekklister, avvik, garanti, overtagelse, rapport, fremdrift m.m. |
| `sales` | Befaring / Våtromstilbud | Forespørsel, befaring, ordinært tilbud, publisering, kundeaksept og ordinær kontrakt/prosjektflyt |
| `store_offers` | Butikktilbud | Varebaserte tilbud med vare, montering, NOBB, alternativer og butikkpresentasjon |

`store_offers` er en **tilleggstilgang til `sales`**. En bruker kan derfor ikke ha Butikktilbud uten samtidig å ha Befaring / Våtromstilbud.

Startside, Hjelp, innlogging og egen firmaprofil er grunnfunksjoner og er ikke egne moduler.

## 3. Roller og delegasjon

### Systemadministrator

Systemadministrator har effektiv tilgang til alle hovedmoduler og kan tildele eller fjerne modultilgang for alle brukere på tvers av firma.

Ved godkjenning av en ny bruker skal systemadministrator velge relevant modultilgang. Nye brukere får ikke automatisk full funksjonstilgang.

### Firmaadministrator

Firmaadministrator kan administrere brukere i **eget firma**, men kan bare delegere moduler firmaadministratoren selv har.

Eksempel:

```text
Firmaadmin har:
  projects
  sales

Firmaadmin kan gi ansatt:
  projects
  sales

Firmaadmin kan ikke gi:
  store_offers
```

Firmaadministrator kan ikke endre egen modultilgang. Den styres av systemadministrator. Firmaadministrator kan heller ikke endre en systemadministrator.

### Vanlig bruker

Vanlig bruker kan ikke administrere modultilgang og ser bare modulene som er tildelt.

## 4. Datamodell

Ny tabell:

```text
public.user_module_access
  user_id       uuid -> profiles.id
  module_key    text
  granted_by    uuid -> profiles.id
  created_at    timestamptz
  updated_at    timestamptz

PRIMARY KEY (user_id, module_key)
```

Tillatte `module_key`-verdier i 38A:

```text
projects
sales
store_offers
```

Modulrettigheter legges ikke inn som mange boolske kolonner i `profiles`. Egen tabell gjør modellen utvidbar uten å gjøre brukerprofilen til en stadig større rettighetsstruktur.

## 5. Server er autoritativ

Følgende prinsipp er absolutt:

```text
UI / meny / Hjelp
        ↓
viser serverens tilgang
        ↓
RLS / SECURITY DEFINER RPC
        ↓
avgjør faktisk data- og skrivetilgang
```

Frontend kan skjule en knapp for god UX, men frontend kan aldri være eneste sperre.

Sentrale serverfunksjoner:

```text
current_user_has_module_access(module_key)
current_user_module_keys()
get_my_module_access()
list_managed_module_access()
set_managed_module_access(target_user_id, requested_module_keys)
```

Direkte INSERT/UPDATE/DELETE på `user_module_access` er ikke gitt til vanlige `authenticated`-brukere. Endringer går gjennom kontrollert RPC.

## 6. Prosjekttilgang

Eksisterende firma-/prosjektgrense beholdes. `projects` er et ekstra krav for ikke-systemadministratorer.

```text
gyldig aktiv bruker
+ projects-modul
+ eksisterende project/company-scope-regel
= intern prosjekttilgang
```

De sentrale funksjonene `project_row_access_allowed` og `project_row_insert_allowed` inkluderer modulkravet, slik at eksisterende RLS-regler på prosjektdata fortsetter å bruke samme sikkerhetsgrense.

Systemadmin beholder eksisterende support-/lesemuligheter; supportmodus skal fortsatt ikke bli en generell skrive-bypass.

## 7. Sales og Butikktilbud

`current_sales_company_scope_id()` returnerer bare firmascope for en ordinær bruker som har `sales`.

Dermed følger eksisterende Sales-RLS automatisk `sales`-tilgangen.

Butikktilbud har i tillegg egen serverkontroll:

- `sales_requests` med butikkmetadata krever `store_offers`
- butikktekstmaler krever `store_offers`
- `publish_sales_offer` kontrollerer `sales`
- publisering av en tilbudsversjon med låst butikkmetadata krever i tillegg `store_offers`

Dette betyr at en bruker uten Butikktilbud ikke kan omgå sperren ved å manipulere klienten og sende en butikk-payload direkte.

Offentlig kundelenke og `accept_sales_offer` er **ikke** knyttet til intern modultilgang. Kunden bruker den eksisterende sikre tilbudstokenen. En intern rettighetsendring skal aldri gjøre et allerede publisert kundetilbud uleselig eller uaksepterbart for kunden.

## 8. Bakoverkompatibilitet ved innføring

38A skal ikke plutselig ta fra eksisterende brukere funksjoner de allerede bruker.

Ved migrering:

- alle eksisterende godkjente brukere får `projects`
- alle eksisterende godkjente brukere får `sales`
- `store_offers` gis bare til brukere som allerede oppfylte den tidligere Butikktilbud-regelen basert på org.nr. `915407692`
- systemadministrator har uansett effektiv tilgang til alle moduler

Nye brukere opprettet etter 38A får ingen modul automatisk. Systemadministrator velger modulene i godkjenningsprosessen.

Det utføres ingen historisk omskriving av prosjekter, tilbud, tilbudsversjoner, kontrakter eller aksepter.

## 9. Klientarkitektur

Aktive 38A-moduler:

```text
src/modules/access/moduleAccessClient.js
  - modul-katalog
  - RPC-kontrakter
  - normalisering
  - delt, ikke-autoritativ UI-state

src/modules/access/moduleAccessUx.jsx
  - Brukere og tilganger
  - menyprojeksjon
  - Hjelp-filtrering
  - UI-regler for systemadmin/firmaadmin

src/modules/sales/SalesModule.jsx
  - viser Nytt butikktilbud kun ved store_offers
```

`index.html` starter det isolerte tilgangs-UX-laget. `main.jsx` skal ikke fragmenteres ytterligere bare for å få inn 38A; modultilgang holdes som et tydelig eget ansvar.

Nettleserstate er kun cache/presentasjon. Refresh eller manipulasjon av `window`/localStorage kan aldri gi servertilgang som ikke finnes i Supabase.

## 10. Hjelp

Hjelp følger samme modultilgang som arbeidsflaten:

```text
sales         -> Befaring/Tilbud-hjelp
store_offers  -> Butikktilbud-hjelp
projects      -> prosjekt-, dokumentasjons-, garanti-, sjekkliste-, avviks-, rapport- osv. hjelp
```

System-/firmaadministrator får i tillegg **Brukere og tilganger** med forklaring av delegasjonsreglene.

Hjelp skal ikke lære opp en bruker i en modul vedkommende ikke har fått tilgang til.

Rollebegrenset adminhjelp beholdes i tillegg til modulfiltreringen.

## 11. Juridisk firma og merkevare

Modultilgang endrer ikke tilbudets juridiske firma eller firmascope.

Butikktilbud kan fortsatt bruke valgt merkevare, for eksempel Bademiljø Expo, mens **juridisk tilbyder følger brukerens/firmaets låste firmaprofil**.

```text
modultilgang  -> hva brukeren kan gjøre
firmascope    -> hvilke data brukeren kan arbeide med
merkevare     -> hvordan butikktilbudet presenteres
juridisk firma -> hvem som faktisk er tilbyder
```

Disse begrepene skal ikke blandes.

## 12. QA-krav før merge

38A skal minst verifisere:

- eksisterende godkjente brukere har ikke mistet tidligere Prosjekt-/Sales-tilgang
- systemadmin ser alle tre moduler
- systemadmin kan endre modultilgang for bruker
- firmaadmin ser bare eget firma
- firmaadmin kan ikke gi en modul firmaadmin selv mangler
- firmaadmin kan ikke endre egen modultilgang
- `store_offers` medfører `sales`
- bruker uten `projects` får ikke prosjektdata gjennom RLS
- bruker uten `sales` får ikke internt Sales-scope/data
- bruker uten `store_offers` får ikke butikkrader/maler eller publisert butikktilbud server-side
- eksisterende offentlig kundetilbud/aksept fortsetter å fungere
- meny skjuler utilgjengelige hovedinnganger
- Hjelp skjuler tema for utilgjengelige moduler
- Brukere og tilganger er forståelig på både systemadmin- og firmaadmin-nivå
- critical build / Sales recovery / Fremdriftsplan er grønne
- Vercel Preview er READY på eksakt branch-SHA
- arkitekturdokumentasjon og Hjelp er oppdatert

## 13. Videre utvidelse

Nye moduler skal bare opprettes når det er en reell produkt-/sikkerhetsgrense. Unngå rettigheter som `kan_se_bilder`, `kan_redigere_sjekkpunkt_3` osv. uten et konkret forretningsbehov.

Ved senere utvidelse skal samme mønster brukes:

```text
ny høy-nivå modul
→ legg til kontrollert module_key
→ server/RLS/RPC først
→ klientmeny og handling
→ Hjelp
→ arkitektur
→ Preview/QA
```
