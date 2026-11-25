# Expo ProffDok – Fase 38A: Brukere og modultilganger

**Dato:** 08.09.2026  
**Produksjonsbaseline ved oppstart:** `09385d70964d855a7f9ecd5b227ef6ce9e0c0763`  
**Supabase:** `dqffxflaoyarbxyiyhop`  
**Feature branch:** `feature/fase38a-modultilganger`

Dette dokumentet er styrende for Fase 38A og supplerer `EXPO_PROFFDOK_ARCHITECTURE.md`.

## 1. Mål og prinsipp

Expo ProffDok skiller mellom tre ting:

1. **rolle** – hvem som kan administrere andre brukere
2. **firmatilhørighet** – hvilke data brukeren tilhører og kan arbeide med
3. **modultilgang** – hvilke hovedfunksjoner brukeren faktisk får bruke

Modultilgang er serverstyrt. Meny, knapper og Hjelp viser samme tilgang, men er aldri eneste sikkerhetsgrense.

Vi bruker få, grove moduler for å unngå overfragmentering.

## 2. Hovedmoduler

| Nøkkel | Synlig navn | Omfang |
|---|---|---|
| `projects` | Prosjekter og dokumentasjon | Prosjekter, produkt-/FDV-dokumentasjon, bilder, sjekklister, avvik, garanti, overtagelse, rapport, fremdrift m.m. |
| `sales` | Befaring / Våtromstilbud | Forespørsel, befaring, ordinært tilbud, publisering, kundeaksept og ordinær kontrakt/prosjektflyt |
| `store_offers` | Butikktilbud | Varebaserte tilbud med varer, NOBB, eventuell montering, alternativer og butikkpresentasjon |

`store_offers` er tilleggstilgang til `sales`. En bruker kan ikke ha Butikktilbud uten samtidig å ha Befaring / Våtromstilbud.

Startside, Hjelp, innlogging og egen firmaprofil er globale appfunksjoner og er ikke egne moduler.

## 3. Roller og delegasjon

### Systemadministrator

Systemadministrator har effektiv tilgang til alle hovedmoduler og kan administrere modultilgang på tvers av firma.

Ved godkjenning av ny bruker skal systemadministrator velge minst én relevant modultilgang før brukeren godkjennes. Nye brukere skal ikke automatisk få full funksjonstilgang.

### Firmaadministrator

Firmaadministrator administrerer brukere i eget firma og kan bare delegere moduler firmaadministratoren selv har.

Firmaadministrator kan ikke:

- gi en modul vedkommende selv mangler
- endre egen modultilgang
- endre en systemadministrator
- gi tilgang på tvers av firma

Systemadministrator styrer dermed rammen, mens firmaadministrator kan ta den praktiske brukeradministrasjonen videre innenfor rammen.

### Vanlig bruker

Vanlig bruker kan ikke administrere modultilgang og ser bare modulene som er tildelt.

## 4. Datamodell

Modultilgang lagres separat fra `profiles`:

```text
public.user_module_access
  user_id       uuid -> profiles.id
  module_key    text
  granted_by    uuid -> profiles.id
  created_at    timestamptz
  updated_at    timestamptz

PRIMARY KEY (user_id, module_key)
```

Tillatte nøkler i 38A:

```text
projects
sales
store_offers
```

Egen tabell gjør modellen utvidbar uten å fylle `profiles` med mange boolske rettighetskolonner.

## 5. Server er autoritativ

Prinsipp:

```text
UI / meny / Hjelp
        ↓
viser serverens tilgang
        ↓
RLS / SECURITY DEFINER RPC
        ↓
avgjør faktisk data- og skrivetilgang
```

Sentrale funksjoner:

```text
current_user_has_module_access(module_key)
current_user_module_keys()
get_my_module_access()
list_managed_module_access()
set_managed_module_access(target_user_id, requested_module_keys)
```

Direkte endring av `user_module_access` gis ikke til ordinære brukere. Endringer går gjennom kontrollert RPC.

## 6. Prosjekt- og Sales-data

Eksisterende firma-/prosjektgrenser beholdes. `projects` er et ekstra krav for interne prosjektdata.

`current_sales_company_scope_id()` gir ordinært Sales-scope bare når brukeren har `sales`.

Butikktilbud har i tillegg `store_offers`-kontroll på butikkmetadata, butikkmaler og publisering av butikkversjoner.

Modultilgang gir aldri tilgang til andre firmaers data.

Offentlig kundelenke og `accept_sales_offer` fortsetter å bruke tilbudstoken og er ikke avhengig av intern modultilgang. Allerede publiserte tilbud skal derfor fortsatt kunne vises og aksepteres selv om en intern brukers rettigheter senere endres.

## 7. Ny forespørsel og Nytt tilbud – viktig arkitekturgrense

Disse arbeidsflytene skal ikke blandes:

```text
+ Ny forespørsel
  → eksisterende forespørsel/befaring
  → tilbud
  → kundeaksept
  → ordinær prosjektflyt ved relevant tilbud
```

`+ Ny forespørsel` og den eksisterende Befaring/Tilbud-flyten skal ikke omskrives av 38A.

Direkte tilbud har én felles inngang:

```text
+ Nytt tilbud
  ├─ Våtromstilbud      (krever sales)
  └─ Butikktilbud       (krever sales + store_offers)
```

Regler:

- bruker med `sales`, men uten `store_offers`, går direkte til ordinært Våtromstilbud som tidligere
- bruker med både `sales` og `store_offers` får valg mellom Våtromstilbud og Butikktilbud
- bruker uten `sales` skal ikke se eller kunne bruke Nytt tilbud
- valg av Butikktilbud endrer ikke Ny forespørsel eller befaringsmotoren
- Butikktilbud avsluttes ved kundeaksept og kan ikke aktiveres som prosjekt
- Våtromstilbud beholder eksisterende kontrakt-/prosjektflyt

Dette gjenbruker eksisterende `startNewOfferSignal` og Sales-motor. Vi lager ikke en parallell tilbudsmotor.

## 8. Bakoverkompatibilitet

Ved innføring av 38A:

- eksisterende godkjente brukere beholder `projects`
- eksisterende godkjente brukere beholder `sales`
- tidligere Butikktilbud-brukere beholder `store_offers`
- systemadministrator har effektiv tilgang til alle moduler
- nye brukere får ikke moduler automatisk; tilgang velges i godkjenningsprosessen

Historiske prosjekter, tilbud, tilbudsversjoner, kontrakter og aksepter omskrives ikke.

## 9. Klientarkitektur

```text
src/modules/access/moduleAccessClient.js
  - modul-katalog
  - RPC-kontrakter
  - normalisering
  - delt UI-cache

src/modules/access/moduleAccessUx.jsx
  - Brukere og tilganger
  - menyprojeksjon
  - Hjelp-filtrering
  - systemadmin-/firmaadmin-regler

src/modules/app/desktopSideMenu.js
  - desktop hovednavigasjon
  - global Startside-hurtigtilgang
  - global Hjelp-hurtigtilgang
  - bruker appens ekte navigasjonsknapper, ikke URL-reload som primærløsning

src/modules/sales/SalesModule.jsx
  - modultilgang for direkte tilbud
  - én Nytt tilbud-inngang
  - typevalg bare når bruker har Butikktilbud
  - eksisterende SalesModuleCore beholdes som tilbudsmotor
```

Vi skal ikke ha flere konkurrerende globale navigasjons-observers. Startside og Hjelp eies samlet av `desktopSideMenu.js` på desktop.

## 10. Hjelp

Hjelp er globalt tilgjengelig, men innholdet filtreres etter faktisk modultilgang:

```text
sales         -> Befaring/Tilbud-hjelp
store_offers  -> Butikktilbud-hjelp
projects      -> prosjekt-/dokumentasjonshjelp
```

Hjelp skal ikke lære opp en bruker i en modul vedkommende ikke har tilgang til.

Administratorveiledning skal ikke ligge som en egen parallell Hjelp-modul:

- systemadministrators veiledning om bruker- og modultilganger ligger under **⚙️ Systemadministrasjon**
- firmaadministrators veiledning om delegering av modultilganger ligger under **👥 Firma**

Dermed følger Hjelp samme informasjonsarkitektur som administrasjonen ellers, og vi unngår et ekstra **Brukere og tilganger**-hjelpekort.

På desktop skal Hjelp være tilgjengelig som hurtigknapp i toppnavigasjonen i tillegg til hovedmenyen. Hjelp er en global appfunksjon, ikke en prosjektmodul.

## 11. Juridisk firma og merkevare

Modultilgang endrer ikke tilbudets juridiske firma eller firmascope.

```text
modultilgang   -> hva brukeren kan gjøre
firmascope     -> hvilke data brukeren kan arbeide med
merkevare      -> hvordan tilbudet presenteres
juridisk firma -> hvem som faktisk er tilbyder
```

Butikktilbud kan bruke Bademiljø Expo som merkevare, mens juridisk tilbyder følger brukerens/firmaets låste firmaprofil.

## 12. QA før merge

Minstekrav:

- branch er basert på gjeldende `main` og er ikke bak produksjonsbaseline
- eksisterende godkjente brukere har ikke mistet Prosjekt-/Sales-tilgang
- systemadmin har alle moduler og kan administrere andre brukere
- firmaadmin ser bare eget firma og kan ikke delegere mer enn egen tilgang
- ny bruker kan ikke godkjennes uten valgt modultilgang
- `store_offers` medfører `sales`
- RLS blokkerer prosjekt/Sales/butikkdata uten riktig modul
- meny og Hjelp følger modultilgang
- Startside og Hjelp fungerer uten sideheng
- + Ny forespørsel fungerer som før
- + Nytt tilbud fungerer som før for bruker uten Butikktilbud
- + Nytt tilbud viser typevalg for bruker med Butikktilbud
- Butikktilbud kan ikke aktivere prosjekt
- offentlig kundetilbud/aksept fungerer videre
- critical build, Sales recovery og Fremdriftsplan er grønne
- Preview er READY på eksakt branch-SHA
- Hjelp og arkitektur er oppdatert

## 13. Videre utvidelse

Nye tilgangsnøkler skal bare opprettes når det finnes en reell produkt-/sikkerhetsgrense. Unngå smårettigheter uten konkret forretningsbehov.

Mønster:

```text
ny høy-nivå modul
→ server/RLS/RPC først
→ klientmeny og handling
→ Hjelp
→ arkitektur
→ Preview/QA
```
