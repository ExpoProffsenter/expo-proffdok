# Expo ProffDok – arkitekturkart

**Fase:** 35A – fremdriftsplan  
**Status:** Feature branch / Preview-QA – ikke merget  
**Dato:** 04.09.2026  
**Produksjonsbaseline ved oppstart:** `main` på `036fc1ef841b7e4ca382ec91fd553f844dfe7d17`  
**Supabase:** `dqffxflaoyarbxyiyhop`

Dette kartet beskriver gjeldende arkitektur og sikkerhets-/bakoverkompatibilitetskrav som må bevares. Historiske detaljer finnes i Git.

## 1. Styrende prinsipper

1. `main` er kilde til sannhet for produksjonskode.
2. Produksjon beskyttes foran alt: feature-branch → Vercel Preview → `TEST OK` → merge → verifiser eksakt Production-SHA, HTTP/runtime og relevant Supabase-status.
3. RLS/server er sikkerhetsgrensen; frontend alene gir aldri tilgang eller siste autoritative validering.
4. Publiserte tilbud, aksepterte tilbudsversjoner, signerte kontrakter og utstedte garantier er historikk og skal ikke overskrives vilkårlig.
5. Prosjekt kan opprettes og eksistere uten tilbud.
6. Prosjekt kan eksistere uten kontrakt. Kontrakt er kun obligatorisk når dokumentert tetthetsgaranti faktisk skal utstedes.
7. Eksisterende opplasting av bedriftens egen kontrakt er fortsatt gyldig.
8. Privatkundeorienterte priser vises inkl. mva.
9. Ingen historisk backfill uten eksplisitt beslutning.
10. Supportmodus er ikke skrive-bypass og skal ikke registrere systemadmin som feil oppretter, ansvarlig eller signatar.
11. Sales recovery/hydration og IndexedDB-sikring av befaringsbilder er kritiske kontrakter.
12. Historiske Storage-paths/URL-er flyttes ikke spontant.
13. Modulisering gjøres bare ved naturlige ansvargrenser som gir reell oversikt eller mindre risiko.
14. Brukerrettede endringer oppdaterer HJELP samme runde.
15. Fremdriftsplan er operativ prosjektdata og skal aldri endre den låste tilbuds-/aksepthistorikken den eventuelt er opprettet fra.

## 2. Plattform

| Lag | Teknologi | Hovedansvar |
|---|---|---|
| Klient | React + Vite | UI, state, navigasjon og arbeidsflyt |
| Auth | Supabase Auth | Innlogging og identitet |
| Data | Supabase Postgres | Prosjekter, Sales, kontrakt, garanti, fremdriftsplan og produktdata |
| Serverlogikk | Supabase RPC/trigger | Firmascoping, validering, låsing, portalfiltrering og dokumentkobling |
| Filer | Supabase Storage | Bilder og private/offentlige dokumenter |
| E-post | Supabase Edge Functions + Resend | Befaring, tilbud, aksept, kontrakt, portal, chat og systemmeldinger |
| Hosting | Vercel | Preview og Production |
| PDF | jsPDF | Rapport, tilbud, akseptbevis, garanti og endelig kontrakt |

Produksjon: `https://expo-proffdok.app`

## 3. Prosjekt og Avtalegrunnlag

Prosjektet lagres hovedsakelig som samlet JSON i `projects.data`. Den synlige fanen heter **Avtalegrunnlag**, mens intern nøkkel fortsatt er `tilbud` / `data.tilbud` for bakoverkompatibilitet.

Fire vanlige prosjektveier er gyldige:

```text
A) Direkte prosjekt uten tilbud
B) Akseptert tilbud → prosjekt uten kontrakt
C) Akseptert tilbud → egen opplastet kontrakt → prosjekt
D) Akseptert tilbud → Expo-kontrakt → prosjekt
```

Avtalegrunnlag kan inneholde akseptert tilbud/akseptbevis, signert Expo-kontrakt, bedriftens egen kontrakt, andre avtaledokumenter og senere tillegg/fradrag. Direkte prosjekt uten tilbud eller kontrakt er en normaltilstand.

## 4. Sales – tilbud, aksept og kontrakt

```text
Forespørsel
→ eventuell befaring
→ tilbudskladd
→ publisert tilbudsversjon
→ kundelenke/e-post
→ kundevalg av opsjoner
→ digital aksept
→ låst akseptbevis
→ akseptbekreftelse på e-post til kunde og publiserer
→ valgfritt kontrakt/prosjekt
```

Kritiske Sales-kontrakter:

- tom/uhydrert tilbudskladd skal aldri overskrive nyere serverdata
- recovery skal fungere ved reload, dvale og appbytte
- befaringsbilder beholder IndexedDB/Storage-flyt
- publiserte/aksepterte tilbudsversjoner er immutable snapshots
- kundeaksept knyttes til eksakt versjon og valgte opsjoner
- `critical-sales-recovery-check.mjs` er obligatorisk del av build

## 5. Fase 35A – operativ fremdriftsplan

Fremdriftsplanen har egen lagring i `public.project_progress_plans` og ligger **ikke** inne i `projects.data`. Dette er bevisst slik at en vanlig prosjektlagring ikke kan overskrive arbeidsøkter eller kundedelingsvalget.

Én plan er knyttet til ett lagret prosjekt:

```text
projects.id
  1 ── 1 project_progress_plans.project_id
```

Viktige felt:

```text
project_id         prosjektets id / primærnøkkel
company_scope_id   firmascope kopiert og kontrollert fra prosjektet
customer_visible   false som standard; må aktiveres eksplisitt
plan               JSON med versjon, aktiviteter og arbeidsøkter
created_by / updated_by + tidsstempel
```

En aktivitet kan ha valgfritt antall arbeidsøkter. Arbeidsøktene har dato, fra-/til-tid og merknad. Aktiviteten har blant annet arbeidsoperasjon, fag, person/firma og status. Dette gjør at samme fag/person kan planlegges flere separate ganger i samme uke eller på tvers av uker.

### Tilgang

RLS er aktivert på `project_progress_plans`; `anon` har ingen direkte tabelltilgang. Intern lesing/skriving krever gyldig prosjekt-/firmatilknytning etter planens tilgangsfunksjon. Triggeren `sync_project_progress_plan_scope()` setter firmascope fra den faktiske `projects`-raden og hindrer at klienten velger et annet scope.

Kunde og UE leser aldri tabellen direkte. Eksisterende serververifiserte `verify_project_portal_access(...)` er utvidet med fremdriftsplanen:

```text
intern bruker med prosjekttilgang
  → kan arbeide med planen når prosjektet ikke er låst

UE med gyldig UE-kode
  → får progressPlan i portalgrunnlaget
  → read-only i 35A

kunde med gyldig kundekode
  → får progressPlan bare når customer_visible = true
  → ellers returnerer serveren ikke planen
```

Kundedeling er dermed et serverhåndhevet valg og ikke bare skjult frontend. Standard er `false`.

Låst prosjekt viser fremdriftsplanen som historikk og skal ikke redigeres i vanlig brukerflyt.

### Akseptert tilbud som forslag – aldri som ny sannhet

Et aktivert prosjekt med Sales-opphav kan lese eksakt akseptert tilbudsgrunnlag og **valgte** opsjoner og omforme hovedpostene til forslag til arbeidsoperasjoner. Fremdriftsmodulen skriver aldri tilbake til `sales_offers` eller `sales_offer_versions`.

```text
låst akseptert tilbud + valgte opsjoner
  → leses
  → grupperes til arbeidsoperasjoner
  → kopieres som redigerbare forslag i prosjektets fremdriftsplan

fremdriftsplan
  ✕ endrer ikke tilbud
  ✕ endrer ikke aksept
  ✕ endrer ikke kontrakt
```

En valgt opsjon kan opprette en arbeidsoperasjon selv om den aktuelle hovedposten ikke hadde grunnpris i selve tilbudet. Uvalgte opsjoner skal ikke importeres.

Direkte opprettede prosjekter uten Sales-opphav kan bygge planen manuelt og er like gyldige.

### Brukerflyt og responsiv visning

På desktop er Fremdrift en ukeoversikt med arbeidsoperasjonen til venstre og ukedagene i kolonner. Hele arbeidsoperasjonsfeltet kan åpnes for redigering. Når standardpost eller egen arbeidsoperasjon legges til, åpnes posten automatisk, siden scroller til riktig sted og posten markeres kort. Når planen har ulagrede endringer, følger kun **Lagre fremdriftsplan** synsfeltet; sekundærhandlingene blir stående i vanlig dokumentflyt.

På mobil brukes en enklere kort-/aktivitetsvisning i stedet for den brede ukegriden. Intern navigasjon husker prosjekt og aktiv fane i URL-en, slik at refresh på Fremdrift åpner samme prosjekt og fane igjen.

### Modulansvar

- `src/modules/progress/progressPlanUx.jsx` – stabil inngang for Fremdrift, layout-import og eksport av native prosjektfane.
- `src/modules/progress/progressPlanUxV2.jsx` – selve arbeidsflaten: ukevisning, redigering, mobil, dirty-state og read-only portalpresentasjon.
- `src/modules/progress/progressPlanSupabase.js` – data-/portalbro, separat planlagring og tilbudslesing.
- `src/modules/progress/progressPlanOfferCore.js` – ren enveistransformasjon fra akseptert tilbud til arbeidsoperasjoner.
- `src/main.jsx` – eier den interne Fremdrift-fanen, prosjekt-/fane-URL og sentral guard mot å forlate ulagrede endringer.
- `src/bootstrap.jsx` – starter kun Fremdrift-adapteren for verifisert kunde-/UE-portal; intern navigasjon eies av React i `main.jsx`.
- `scripts/critical-progress-plan-check.mjs` – permanent, generisk QA med syntetiske tilbudsdata og kontroll av standard arbeidsoperasjoner.

Ingen historiske prosjekter backfilles. En plan opprettes først når brukeren faktisk lagrer fremdriftsplanen.

## 6. Fase 34B – akseptvarsler

Når en **ny** kundeaksept er lagret server-side, forsøkes to separate e-poster:

1. kunden får bekreftelse på at aksepten er registrert
2. brukeren som publiserte den eksakte tilbudsversjonen får beskjed om at tilbudet er akseptert

Mottaker for intern e-post bestemmes av `sales_offer_versions.published_by`, ikke av mutable felt som «Ansvarlig».

E-postgrunnlaget leses server-side fra den allerede lagrede aksepten:

- eksakt akseptert tilbudsversjon
- `accepted_payload.selected_options`
- akseptert av / tidspunkt
- kunde/prosjekt/adresse
- beregnet akseptert totalsum inkl. mva.

Selve tilbudsaksepten er autoritativ og fullføres **før** e-post forsøkes. E-postfeil kan derfor aldri reversere eller endre aksepten.

### Idempotens og historikkvern

`sales_offer_acceptance_notifications` registrerer én rad per:

```text
offer_id + offer_version_id + recipient_type
```

`recipient_type` er `customer` eller `publisher`. Uniknøkkelen hindrer dobbel utsending ved dobbeltklikk/reload.

Edge Function `sales-offer-acceptance-notify` bruker offentlig tilbudstoken som begrenset tilgangsnøkkel, verifiserer at tilbudet faktisk er akseptert og leser øvrig grunnlag server-side. Funksjonen har et eksplisitt tidsvern slik at historiske aksepter fra før 34B ikke kan utløse nye e-poster ved senere åpning av gammel kundelenke.

Klienten forsøker varsling kun som del av en vellykket **ny aksept**. Å åpne en allerede akseptert historisk lenke utløser ikke varsling.

Kundens ferdige akseptvisning viser låst tilbudsgrunnlag med valgte opsjoner, totalsum inkl. mva., akseptert av og tidspunkt. Den er read-only.

34B-migrasjoner i produksjonsdatabasen:

```text
20260904113833  fase34b_sales_offer_acceptance_notifications
20260904113908  fase34b_sales_offer_acceptance_notifications
20260904113915  fase34b_sales_offer_acceptance_notification_updated_at
```

## 7. Kontraktserver – `sales_contracts`

Sales-kontrakt knyttes til faktisk firma, `request_ref`, tilbud og eksakt akseptert tilbudsversjon.

```text
source: expo | external
status: draft | awaiting_customer | signed | external_confirmed | void
```

Viktige kontrakter:

- RLS er aktivert.
- Intern kontraktskriving går gjennom kontrollerte RPC-er.
- Offentlig kunde bruker unik kontrakttoken/RPC, ikke direkte tabelltilgang.
- Signert snapshot og signaturmetadata låses server-side.
- `final_document` kan settes første gang etter signering og er deretter immutable.
- Ingen normal DELETE-flyt for kontrakthistorikk.

## 8. Endelig Expo-kontrakt og prosjektkobling

Endelig PDF genereres kun fra låst `sales_contracts.snapshot` og registrerte signaturer. Den inneholder kontraktsvilkår, begge signaturer, eksakt akseptert tilbud/opsjoner og aksept-/signaturbevis. Slutt-PDF lagres privat og kobles til prosjektets Avtalegrunnlag uten duplikater.

## 9. Kontrakt som garantikrav

**Dokumentert tetthetsgaranti kan bare utstedes når en signert kontrakt ligger i prosjektets Avtalegrunnlag.** Gyldig grunnlag er ferdig signert Expo-kontrakt/slutt-PDF eller bedriftens egen signerte kontrakt.

Dette gjør ikke kontrakt obligatorisk for prosjektet i seg selv. Frontend gir forhåndskontroll, mens serververnet på `warranty_registry` er autoritativt. Etter utstedt garanti kan siste kontraktsgrunnlag ikke fjernes.

Relevant migrasjon:

```text
20260831230412  fase33b6_warranty_requires_signed_contract
```

## 10. HJELP

HJELP forklarer i vanlig proffspråk blant annet:

- kontrakt er valgfritt for vanlige prosjekter
- garantiprosjekt krever signert kontrakt før garantiutstedelse
- arbeidsstatus og åpne avvik er to forskjellige ting
- etter ny tilbudsaksept får både kunden og tilbudets publiserer e-postbekreftelse
- den ferdige kundelenken viser hva som faktisk ble akseptert, inkludert valgte opsjoner
- fremdriftsplan kan bygges manuelt eller hente arbeidsoperasjoner fra et akseptert tilbud
- UE kan se fremdriftsplanen, mens kunde bare ser den når bedriften aktivt deler den
- endringer i fremdriftsplanen endrer aldri det aksepterte tilbudet
- mobil viser fremdrift som aktivitetskort, mens desktop viser ukeoversikt
- nye arbeidsoperasjoner åpnes og fokuseres automatisk, og Lagre følger synsfeltet ved ulagrede endringer

## 11. QA / handover

35A skal før merge minst verifisere:

- critical-build-check
- critical-sales-recovery-check
- kritisk fremdriftsimport-test med syntetiske, generiske testdata
- Vite build
- diff mot `main`
- Preview READY på eksakt branch-SHA
- desktop og mobil
- flere arbeidsøkter på samme aktivitet
- import av bare valgte opsjoner
- kunde skjult som standard
- UE read-only
- kunde read-only når deling er aktivert
- låst prosjekt read-only
- refresh tilbake til samme prosjekt og Fremdrift-fane
- ingen fremdriftsdata skrevet til produksjon under isolert Preview-QA
- midlertidig Andreas-QA-fixture er fjernet fra runtime og repo før merge

34B ble testet med kontrollert QA-tilbud og QA-data ble slettet etter TEST OK.

Handover-regel:

```text
Les faktisk main
→ kartlegg relevant område
→ gjør additiv/minimal endring
→ behold data- og sikkerhetskontrakter
→ critical build/recovery
→ Vercel Preview
→ TEST OK
→ merge
→ verifiser eksakt Production-SHA + HTTP + runtime
→ verifiser Supabase når relevant
→ slett feature-branch manuelt
```
