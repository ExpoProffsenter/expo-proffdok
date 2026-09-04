# Expo ProffDok – arkitekturkart

**Fase:** 34B – e-postbekreftelse ved tilbudsaksept  
**Status:** Preview testet – TEST OK 04.09.2026  
**Dato:** 04.09.2026  
**Produksjonsbaseline ved oppstart:** `main` på `b06b0a5bfa57e14dbd61d83542cb706227248e83`  
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

## 2. Plattform

| Lag | Teknologi | Hovedansvar |
|---|---|---|
| Klient | React + Vite | UI, state, navigasjon og arbeidsflyt |
| Auth | Supabase Auth | Innlogging og identitet |
| Data | Supabase Postgres | Prosjekter, Sales, kontrakt, garanti og produktdata |
| Serverlogikk | Supabase RPC/trigger | Firmascoping, validering, låsing og dokumentkobling |
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

## 5. Fase 34B – akseptvarsler

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

## 6. Kontraktserver – `sales_contracts`

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

## 7. Endelig Expo-kontrakt og prosjektkobling

Endelig PDF genereres kun fra låst `sales_contracts.snapshot` og registrerte signaturer. Den inneholder kontraktsvilkår, begge signaturer, eksakt akseptert tilbud/opsjoner og aksept-/signaturbevis. Slutt-PDF lagres privat og kobles til prosjektets Avtalegrunnlag uten duplikater.

## 8. Kontrakt som garantikrav

**Dokumentert tetthetsgaranti kan bare utstedes når en signert kontrakt ligger i prosjektets Avtalegrunnlag.** Gyldig grunnlag er ferdig signert Expo-kontrakt/slutt-PDF eller bedriftens egen signerte kontrakt.

Dette gjør ikke kontrakt obligatorisk for prosjektet i seg selv. Frontend gir forhåndskontroll, mens serververnet på `warranty_registry` er autoritativt. Etter utstedt garanti kan siste kontraktsgrunnlag ikke fjernes.

Relevant migrasjon:

```text
20260831230412  fase33b6_warranty_requires_signed_contract
```

## 9. HJELP

HJELP forklarer i vanlig proffspråk blant annet:

- kontrakt er valgfritt for vanlige prosjekter
- garantiprosjekt krever signert kontrakt før garantiutstedelse
- arbeidsstatus og åpne avvik er to forskjellige ting
- etter ny tilbudsaksept får både kunden og tilbudets publiserer e-postbekreftelse
- den ferdige kundelenken viser hva som faktisk ble akseptert, inkludert valgte opsjoner

## 10. QA / handover

34B er testet med kontrollert QA-tilbud med intern Ringside-kundeadresse og Andreas Pettersen som publiserer. Testen bekreftet korrekt valgte opsjoner, totalsum, begge e-poster og duplikatvern. QA-tilbudet er slettet etter TEST OK.

Obligatorisk kontroll før merge:

- critical-build-check
- critical-sales-recovery-check
- Vite build
- diff mot `main`
- Preview READY på eksakt branch-SHA
- runtime error/fatal = 0
- Supabase-tabell/RLS/Edge Function kontrollert
- ingen historisk aksept kan utløse nytt varsel
- QA-data fjernet

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
