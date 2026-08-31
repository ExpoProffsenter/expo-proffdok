# Expo ProffDok – arkitekturkart

**Fase:** 32 – stabil produksjonsarkitektur, sporbarhet, Sales-sikkerhet og kontrollert videreutvikling  
**Status:** Nå-arkitektur etter Fase 32  
**Dato:** 31.08.2026  
**Produksjonsgrunnlag:** `main` på `14ce96c978de674be2394173608366ff7c3f14e1`  
**Plassering:** `docs/architecture/EXPO_PROFFDOK_ARCHITECTURE.md`

Dette dokumentet er den tekniske oversikten for videre utvikling av Expo ProffDok. Det erstatter den tidligere Fase 27-versjonen som arbeidskart. Historisk detalj finnes i Git.

Denne dokumentasjonsrunden endrer ingen runtime, database, RLS, Storage, Edge Functions eller brukergrensesnitt. HJELP endres ikke fordi arbeidsflyten for brukeren er uendret.

## 1. Styrende prinsipper

1. Produksjonsversjonen på `main` er kilde til sannhet.
2. Produksjon beskyttes foran alt. Funksjonskode går via feature-branch, Vercel Preview, eksplisitt `TEST OK`, merge og produksjonskontroll.
3. Publiserte og aksepterte tilbudsversjoner er historikk og skal ikke overskrives.
4. Prosjekter uten tilbud i Expo ProffDok er en normal og støttet tilstand.
5. Privatkundeorienterte priser vises inkl. mva.
6. Eksisterende prosjekt- og salgsdata skal være bakoverkompatible. Ingen historisk backfill uten eksplisitt beslutning.
7. Systemadmin supportmodus skal aldri svekke firmaavgrensning, RLS eller riktig oppretter/ansvarlig.
8. Sales recovery/hydration, lokal kladd og IndexedDB-bildesikring er kritiske kontrakter.
9. Modulisering gjøres bare når den gir tydelig bedre oversikt, testbarhet eller vedlikehold. `main.jsx` skal ikke splittes bare for å redusere linjetall.
10. Brukerrettede endringer skal vurderes mot HJELP i samme runde. Rent tekniske endringer skal eksplisitt dokumentere at HJELP ikke trenger endring.

## 2. Plattform

| Lag | Teknologi | Ansvar |
|---|---|---|
| Klient | React + Vite | UI, state, navigasjon og arbeidsflyt |
| Auth | Supabase Auth | Innlogging og identitet |
| Data | Supabase Postgres | Profiler, prosjekter, salg, garanti og produktmaster |
| Serverlogikk | Supabase RPC | Firmascoping, tilbudspublisering, offentlig tilbud og aksept |
| Filer | Supabase Storage | Prosjektbilder, dokumenter, chatbilder, befaringsbilder og nye tilbudsbilder |
| E-post | Supabase Edge Functions + Resend | Befaring, tilbud, portal, chat og systemmeldinger |
| Hosting | Vercel | Preview og Production |
| PDF | jsPDF | Rapport, tilbud, garanti og akseptbevis |

Produksjon: `https://expo-proffdok.app`

## 3. Repository – dagens hovedstruktur

Fersk repository-inventering på Fase 32 viser blant annet:

```text
src/
├── bootstrap.jsx
├── main.jsx
├── modules/
│   ├── app/
│   │   ├── AppErrorBoundary.jsx
│   │   ├── AppNewsAdmin.jsx
│   │   ├── AppNewsNotice.jsx
│   │   ├── AppUpdateNotice.jsx
│   │   ├── SystemAdminSalesSupport.jsx
│   │   └── appRuntimeStyles.js
│   ├── chat/
│   ├── checklist/
│   ├── company/
│   ├── config/
│   ├── contract/
│   ├── deviations/
│   ├── documents/
│   ├── help/
│   ├── images/
│   ├── installations/
│   ├── overtagelse/
│   ├── portal/
│   ├── product/
│   ├── project/
│   ├── report/
│   ├── sales/
│   ├── surfaces/
│   └── warranty/
scripts/
├── critical-build-check.mjs
└── critical-sales-recovery-check.mjs
```

`src/main.jsx` er fortsatt den sentrale applikasjonsorkestratoren og er ca. 468 KB i Fase 32. Det er betydelig mindre enn det historiske utgangspunktet, men inneholder fortsatt mye delt state, prosjektpersistens, navigasjon og integrasjonslogikk. Det behandles konservativt.

## 4. Hovedappen

`main.jsx` håndterer fortsatt sentrale tverrgående ansvar:

- autentisering, profil og roller
- firma- og systemadminflyt
- prosjektopprettelse, åpning, kopiering og lagring
- prosjektstate og normalisering
- autolagring og lokal nødkladd
- prosjektliste og supportmodus
- portalinnganger
- integrasjon mot Sales
- koordinering mellom moduliserte prosjektfaner

Flere presentasjonsområder ligger i egne moduler, blant annet HJELP, garanti, firma, portal, chat, rapport, kontrakt, produkter, overflater, avvik, installasjoner og overtagelse.

### 4.1 Prosjektpersistens

Prosjektet lagres fortsatt hovedsakelig som en samlet JSON-struktur i `projects.data`. Viktige toppnivåområder er:

```text
company
user
project
checked
productDocs
manualProducts
other
surf
bathroomEquipment
photos
access
inst
files
checklist
tilbud
overtagelse
warranty
projectLog
internalNotes
```

Konsekvens: Flere kodeveier kan oppdatere samme store JSON. Endringer i lagring må derfor bevare merge-/normaliseringslogikk og testes mot eldre prosjekter.

### 4.2 Låsing, ikke arkivering

`locked` er prosjektets ferdig-/read-only-tilstand. Fase 32 undersøkte separat arkivering, men funksjonen ble bevisst droppet fordi verdi ikke forsvarte kompleksitet og risiko. Prosjektarkiv skal derfor ikke bygges inn indirekte i `locked`.

Kunde-/UE-portal kan fortsatt være tilgjengelig i 30 dager etter låsing etter gjeldende portalregler.

## 5. Befaring / Tilbud / Aksept – Sales

Sales er produksjonskoblet og håndterer:

```text
Forespørsel
→ eventuell befaring
→ tilbudskladd
→ publisert tilbudsversjon
→ kundelenke / e-post
→ kundevalg av opsjoner
→ digital aksept
→ låst akseptbevis
→ eventuell ny tilbudsversjon
→ aktivering som ProffDok-prosjekt
```

`SalesModule.jsx` er nå en liten wrapper, mens hovedorkestrering ligger i `SalesModuleCore.jsx`. Presentasjon og tjenester er gradvis trukket ut i `components/`, `services/`, `constants/` og `utils/`.

Viktige eksisterende presentasjonsmoduler inkluderer blant annet:

```text
SalesListView.jsx
SalesDetailView.jsx
SalesInspectionNote.jsx
SalesOfferBuilder.jsx
SalesCustomerView.jsx
SalesAcceptedPresentation.jsx
SalesProjectActivation.jsx
SalesHomeFollowUp.jsx
```

Viktige tjenester inkluderer blant annet:

```text
salesSupabase.js / salesSupabaseBase.js
salesPublishing.js
salesImages.js
salesLocalStorage*.js
salesInspectionDraftDb.js
salesCommunication.js
salesOfferPdf*.js
salesAcceptancePdf*.js
```

### 5.1 Kritiske Sales-kontrakter

- Lokal tilbudskladd må aldri overskrive nyere serverdata ved feil hydrering.
- Gjenopprettingslogikk må fungere ved reload, dvale og appbytte.
- Befaringsbilder har egen lokal/IndexedDB + Storage-flyt og skal ikke blandes med tilbudsbilder.
- Publiserte tilbudsversjoner er immutable snapshots.
- Kundeaksept skal alltid knyttes til eksakt versjon og valgte opsjoner.
- Akseptbevis og tidligere aksepterte versjoner skal bevares når ny versjon opprettes.
- `scripts/critical-sales-recovery-check.mjs` er obligatorisk del av build.

### 5.2 Fase 32 sporbarhet

For nye salgssaker og publisering skiller systemet mellom:

- **Opprettet av** – faktisk oppretter lagret server-side (`created_by_name`)
- **Ansvarlig** – nåværende saksansvarlig
- **Sist publisert av** – innlogget bruker som faktisk publiserte versjonen (`published_by`, `published_by_name`)

Historiske saker backfilles ikke automatisk. Manglende eldre sporbarhetsfelt er derfor gyldig legacy-tilstand.

### 5.3 Fase 32 tilbudsbilder

Nye bilder på tilbudslinjer og opsjoner lagres normalt i `project-images/sales-offer-images/...` og `imageDataUrl` inneholder offentlig Storage-URL i stedet for stor base64-streng.

Dette er bakoverkompatibelt:

- eldre `data:image...` fungerer fortsatt
- ved offline/session/Storage-feil finnes fallback til gammel data-URL-metode
- kundevisning kan bruke både URL og data-URL
- befaringsbilder er ikke endret
- ingen historisk massekonvertering

Fase 32 viste at store base64-bilder, ikke antall salgssaker, var hovedårsaken til unødvendig stor `sales_requests.payload`.

### 5.4 Delt Sales Supabase-klient

Sales wrapperen bruker en delt standardklient. Nye komponenter/tjenester skal ikke opprette egne browser-Supabase/Auth-klienter med samme storage key. Dublerte GoTrue-klienter kan gi uforutsigbar sesjons-/refreshadferd og var sannsynlig årsak til blinking under det avbrutte arkivforsøket.

## 6. Systemadmin og supportmodus

Systemadmin er et kontrollert tverrfirma-verktøy, ikke en generell sikkerhetsbypass.

Ved prosjektsupport:

- aktivt supportfirma skal være tydelig
- prosjektlisten skal vise valgt supportfirmas prosjekter, ikke systemadministratorens eget firma
- ordinære eierskaps-/write-regler skal bevares
- supporthandling skal ikke endre faktisk oppretter eller feilaktig sette systemadmin som ansvarlig

Sales-support er separat og har egne begrensninger. Prosjektaktivering i supportkontekst skal ikke tillates dersom eierskap/ansvar ikke kan settes sikkert.

## 7. Overtagelse og signatur

Overtagelse er først reelt registrert når:

1. begge parter har signert
2. bruker bekrefter at overtagelsen er gjennomført
3. data er lagret
4. signaturene kan leses tilbake fra Supabase

Fase 32 la inn serververifisering av begge signaturene før bekreftet overtagelse, garanti/låsing. UI skiller nå mellom utkast, registrering og senere endringer.

`locked` skal ikke settes dersom signaturene ikke kan bekreftes eller øvrige ferdigstillingskrav ikke er oppfylt.

## 8. HJELP som produktkontrakt

HJELP er den gjeldende digitale brukerveiledningen i appen.

Fast regel fra Fase 32:

- påvirker en endring arbeidsflyt, knapper, begreper, roller eller brukeropplevelse → HJELP oppdateres i samme runde
- er endringen rent teknisk/usynlig → dokumenter eksplisitt at HJELP ikke krever endring

Fase 32 HJELP beskriver blant annet sporbarhet, supportmodus, overtagelse og låsing. Utdatert prosjektarkiv-begrep er fjernet.

## 9. Supabase – sentrale domener

Viktige tabeller:

```text
profiles
projects
companies
company_user_invites
user_terms_acceptance
product_document_master
product_master_checkpoints
warranty_registry
sales_requests
sales_offers
sales_offer_versions
sales_company_scopes
sales_company_memberships
```

Sentrale Sales RPC-er:

```text
resolve_sales_company_scope()
publish_sales_offer(payload jsonb)
get_sales_offer_by_token(token uuid)
accept_sales_offer(...)
```

Fase 32 la til sporbarhetskolonner for nye data. SQL/RLS/SECURITY DEFINER/grants skal ikke endres blindt på bakgrunn av Supabase-advisors; eksisterende sikkerhetsmodell må forstås før endring.

## 10. Storage

Aktive hovedbuckets omfatter blant annet:

```text
sales-inspection-photos
chat-images
project-images
```

`project-images` er offentlig og brukes av flere eksisterende flyter. Dette er en kjent sikkerhets-/personvernsgjeld, særlig for sensitive dokumenter. En fremtidig overgang til private filer krever egen migreringsplan, signerte URL-er og testing av kundeportal, PDF og historiske lenker.

Ikke innfør tilfeldige DELETE-policyer eller historisk filrydding som del av ordinær frontendutvikling.

## 11. Edge Functions

Aktive sentrale funksjoner:

```text
smart-worker
delete-pending-user
```

`smart-worker` håndterer e-post via Resend. Sikkerhetsendringer rundt JWT, mottakere eller directions skal behandles som egen server-/sikkerhetsoppgave og ikke blandes med visuell refaktorering.

## 12. Automatisk minimumsvern

`npm run build` kjører:

```text
critical-build-check.mjs
critical-sales-recovery-check.mjs
vite build
```

Dette er et regresjonsvern, ikke en full testpakke. Manuell Preview-test er fortsatt nødvendig for brukerrettede endringer.

## 13. Viktigste tekniske risikoer

| Prioritet | Risiko | Regel |
|---|---|---|
| Kritisk | Offentlig `project-images` med enkelte sensitive dokumenter | Egen sikkerhetsfase, ikke spontan migrering |
| Høy | Stor og koblet `main.jsx` | Kun naturlige uttrekk med konkret gevinst |
| Høy | Stor Sales-orkestrering og recovery-kompleksitet | Beskytt hydrering/recovery og historikk |
| Høy | Hele `projects.data` oppdateres fra flere veier | Ikke endre persistens uten bred regresjonstest |
| Høy | Supportmodus krysser firmagrenser | Frontend er ikke sikkerhetsgrense; RLS/serverregler må stå |
| Middels | Legacy JSON uten eksplisitt schema-versjon | Normaliser bakoverkompatibelt, ingen tvungen backfill |
| Middels | Offentlig Storage og historiske URL-er | Kartlegg før policyendringer |
| Middels | Store genererte/Core-filer | Unngå splitting i mange små filer uten vedlikeholdsgevinst |

## 14. Anbefalt videre retning

### Gjør

1. Velg neste oppgave ut fra reelt produktbehov, feil eller tydelig vedlikeholdsgevinst.
2. Kartlegg bare området som skal endres.
3. Utvid eksisterende modul før ny modul opprettes når det er naturlig.
4. Behold data-/sikkerhetskontrakter stabile.
5. Oppdater HJELP når endringen er brukerrettet.
6. Preview-test, `TEST OK`, merge, Production READY, runtime-kontroll, slett branch.

### Ikke gjør

- ikke splitt `main.jsx` bare for å få lavere linjetall
- ikke overfragmenter Sales i små wrappers uten tydelig verdi
- ikke masserediger historiske prosjekt-/tilbudsdata
- ikke bland RLS/Storage/sikkerhetsmigrering med ordinær UI-jobb
- ikke reintroduser prosjektarkiv uten ny produktbeslutning
- ikke svekk supportmodus for å gjøre systemadmin enklere

## 15. Åpne fremtidspunkter

### Flere rom under samme prosjekt

Issue #110 beskriver mulig fremtidig modell med ett prosjekt/prosjektnummer og flere rom/arbeidsområder, eksempelvis Bad 1, Bad 2, WC-rom og vaskerom. Dette er kun backlog/utredning nå.

Før implementering må det avgjøres hva som er prosjektfelles og hva som er romspesifikt for:

- bilder
- sjekklister
- produkter/FDV
- avvik
- tilbud/kontrakt
- overtagelse
- garanti
- rapport/PDF
- chat

### Andre åpne tekniske spørsmål

- langsiktig privat Storage-strategi
- eksplisitt schema-versjon/normalisering for `projects.data`
- sentral project repository/merge-strategi
- videre automatiserte smoke-/utility-tester
- eventuell reduksjon av store Core-filer når en konkret endring gjør grensen naturlig

## 16. Beslutningslogg – Fase 32

| Dato | Beslutning |
|---|---|
| 27.08.2026 | Nye salgssaker får server-snapshot av faktisk oppretter. |
| 27.08.2026 | Publisert tilbud lagrer faktisk publisist; historikk backfilles ikke. |
| 31.08.2026 | Prosjektarkiv droppes; `locked` beholdes som ferdig/read-only-tilstand. |
| 31.08.2026 | Nye tilbudsbilder lagres normalt som Storage-URL i stedet for base64. |
| 31.08.2026 | Sales skal bruke delt browser Supabase-klient og ikke opprette parallelle GoTrue-klienter. |
| 31.08.2026 | Supportmodus-prosjektliste følger valgt supportfirma. |
| 31.08.2026 | Overtagelsessignaturer serververifiseres før bekreftet registrering/ferdigstilling. |
| 31.08.2026 | Brukerrettede endringer skal oppdatere HJELP når relevant. |

## 17. Konklusjon

Expo ProffDok er en produksjonsapp med bred funksjonsflate og historiske data. Arkitekturstrategien er derfor fortsatt konservativ:

```text
Kartlegg faktisk main
→ gjør én avgrenset endring
→ behold data- og sikkerhetskontrakter
→ bygg og Preview-test
→ TEST OK
→ merge
→ verifiser Production
→ dokumenter faktisk løsning
```

Målet er ikke flest mulig moduler. Målet er en enkel, oversiktlig og trygg app som kan videreutvikles uten å miste funksjonalitet eller historikk.
