# Expo ProffDok – arkitekturkart

**Fase:** 33B.2 – kontraktgrunnlag på server  
**Status:** Produksjonsarkitektur med additiv kontraktsmodell; ingen kontrakt-UI er koblet på ennå  
**Dato:** 31.08.2026  
**App-baseline:** `main` på `fa1b708b207c7aed6aa4b67e02fc78e478b4b453`  
**Supabase:** `dqffxflaoyarbxyiyhop`

Dette dokumentet er den tekniske inngangen til Expo ProffDok. Historiske fasebeskrivelser finnes i Git. Kartet skal være kort nok til å brukes i handover og detaljert nok til at neste utvikler forstår sikkerhets- og datakontraktene.

## 1. Styrende prinsipper

1. `main` er kilde til sannhet for appkode.
2. Produksjon beskyttes foran alt: feature-branch → Preview → `TEST OK` → merge → produksjonskontroll.
3. RLS/server er sikkerhetsgrensen; frontend alene gir aldri tilgang.
4. Publiserte og aksepterte tilbudsversjoner er historikk og skal ikke overskrives.
5. Signerte kontrakter er egen historikk og skal ikke mutere akseptert tilbud.
6. Prosjekter uten Expo ProffDok-tilbud og uten Expo-kontrakt er gyldige legacy-/normaltilstander.
7. Privatkundeorienterte priser vises inkl. mva.
8. Ingen historisk backfill uten eksplisitt beslutning.
9. Supportmodus skal ikke bli skrive-bypass eller sette systemadmin som feil oppretter/ansvarlig.
10. Sales recovery/hydration og IndexedDB-sikring for befaringsbilder er kritiske kontrakter.
11. Modulisering gjøres bare når den gir reell oversikt og vedlikeholdsgevinst.
12. Brukerrettede endringer oppdaterer HJELP samme runde. Rent tekniske endringer dokumenterer eksplisitt at HJELP ikke trenger endring.

## 2. Plattform

| Lag | Teknologi | Hovedansvar |
|---|---|---|
| Klient | React + Vite | UI, state, navigasjon og arbeidsflyt |
| Auth | Supabase Auth | Innlogging og identitet |
| Data | Supabase Postgres | Prosjekter, Sales, kontrakt, garanti og produktdata |
| Serverlogikk | Supabase RPC | Firmascoping, publisering, offentlig kundehandling og låsing |
| Filer | Supabase Storage | Bilder og dokumenter |
| E-post | Supabase Edge Functions + Resend | Befaring, tilbud, portal og meldinger |
| Hosting | Vercel | Preview og Production |
| PDF | jsPDF | Rapport, tilbud, akseptbevis, garanti og senere kontrakt |

Produksjon: `https://expo-proffdok.app`

## 3. Repository – hovedstruktur

```text
src/
├── bootstrap.jsx
├── main.jsx
└── modules/
    ├── app/
    ├── chat/
    ├── checklist/
    ├── company/
    ├── config/
    ├── contract/
    ├── deviations/
    ├── documents/
    ├── help/
    ├── images/
    ├── installations/
    ├── overtagelse/
    ├── portal/
    ├── product/
    ├── project/
    ├── report/
    ├── sales/
    ├── surfaces/
    └── warranty/

scripts/
├── critical-build-check.mjs
└── critical-sales-recovery-check.mjs
```

`main.jsx` er fortsatt sentral orkestrator og skal behandles konservativt. Store naturlige ansvarsområder kan trekkes ut, men ikke bare for å redusere filstørrelse.

## 4. Prosjektpersistens

Prosjektet lagres hovedsakelig i `projects.data` som samlet JSON. Viktige toppnivåområder er blant annet:

```text
company
user
project
checked
productDocs
manualProducts
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

Flere kodeveier kan oppdatere samme JSON. Endringer må derfor bevare merge-/normaliseringslogikk og fungere mot eldre prosjekter.

`locked` er ferdig/read-only-tilstand, ikke prosjektarkiv.

## 5. Sales – Befaring / Tilbud / Aksept

```text
Forespørsel
→ eventuell befaring
→ tilbudskladd
→ publisert tilbudsversjon
→ kundelenke / e-post
→ kundevalg av opsjoner
→ digital aksept
→ låst akseptbevis
→ valgfri kontrakt
→ eventuell ny tilbudsversjon
→ aktivering som ProffDok-prosjekt
```

`SalesModule.jsx` er en liten wrapper. Hovedorkestrering ligger i `SalesModuleCore.jsx`, med presentasjon og tjenester i `components/`, `services/`, `constants/` og `utils/`.

### Kritiske Sales-kontrakter

- Tom/uferdig lokal kladd må aldri overskrive nyere serverdata.
- Recovery skal fungere ved reload, dvale og appbytte.
- Befaringsbilder beholder egen IndexedDB/Storage-flyt.
- Publisert tilbud er versjonslåst.
- Kundeaksept knyttes til eksakt tilbudsversjon og valgte opsjoner.
- Akseptbevis og tidligere aksepterte versjoner bevares ved ny versjon.
- `scripts/critical-sales-recovery-check.mjs` er obligatorisk i build.
- Sales bruker delt browser-Supabase-klient; ikke opprett parallelle GoTrue-klienter.

### Sporbarhet

For nye data skilles det mellom faktisk oppretter, saksansvarlig og faktisk publisist. Gamle saker backfilles ikke.

## 6. Fase 33B.2 – servermodell for forbrukerkontrakt

Fase 33B.2 legger til **servergrunnlaget**, men ingen brukerflate. Dagens app kjører videre uendret inntil senere 33B-runder kobler på veiviser, kundelenke og PDF.

Ny tabell:

```text
sales_contracts
```

Hver kontrakt er knyttet til:

- `company_id` – Sales-firmascope
- `request_ref` – salgssaken
- `offer_id`
- `offer_version_id` – eksakt akseptert tilbudsversjon
- `source` – `expo` eller `external`
- `status` – `draft`, `awaiting_customer`, `signed`, `external_confirmed` eller `void`
- låst `snapshot`
- signaturmetadata
- eventuell ekstern/endelig dokumentreferanse

Det gjøres **ingen historisk backfill**. Eksisterende `contractFile` i gamle salgssaker og dokumenter i gamle prosjekter beholdes som gyldig legacy.

### Snapshot og historikk

Når en Expo-kontrakt opprettes, bygges snapshotet server-side fra:

- eksakt akseptert `sales_offer_versions`-rad
- kundens registrerte aksept og valgte opsjoner
- kundedata fra tilbudet
- firmadata som skal vises i kontrakten
- de få kontraktsfeltene brukeren fyller ut

Akseptert tilbud endres aldri av kontrakten.

Når bedriften signerer, går status til `awaiting_customer` og snapshotet låses. Kunden kan deretter signere samme snapshot med offentlig, unik kontrakttoken. Etter kundesignering er kontrakten `signed`. Endelig dokument kan knyttes til raden én gang uten å åpne snapshot/signaturhistorikken for redigering.

Ekstern kontrakt kan registreres som `external_confirmed`; original dokumentreferanse beholdes. Ny UI skal senere kreve at bruker bekrefter at opplastet dokument er endelig/signert.

### RLS og grants

`sales_contracts` har RLS aktivert.

- `authenticated` har kun direkte `SELECT`.
- `anon` har ingen direkte tabelltilgang.
- Intern skriving skjer kun gjennom kontrollerte RPC-er.
- Vanlig bruker kan bare skrive for sin **faktiske** `current_sales_company_scope_id()`.
- Systemadmin kan lese på tvers for support, men kontrakt-RPC-ene aksepterer ikke `support_company_id`; support er derfor ikke skrive-bypass.
- Ingen direkte DELETE-flyt tilbys. Historikk beholdes og kan eventuelt markeres `void` før endelig Expo-signering.

### Kontrakt-RPC-er

```text
create_sales_contract(payload jsonb)
save_sales_contract_draft(contract_id uuid, contract_data jsonb, company_snapshot jsonb)
sign_sales_contract_company(contract_id uuid)
get_sales_contract_by_token(token uuid)
sign_sales_contract_customer(token uuid, accepted_name text, acknowledgements jsonb)
register_external_sales_contract(payload jsonb)
void_sales_contract(contract_id uuid)
attach_sales_contract_final_document(contract_id uuid, document jsonb)
```

De offentlige kunde-RPC-ene er med vilje `SECURITY DEFINER` og tilgjengelige for `anon`, på samme prinsipp som dagens tilbudstoken. Supabase-advisor vil derfor varsle om dem generisk; dette er forventet og skal ikke «fikses» blindt ved å fjerne nødvendig kundeaksess.

De interne `SECURITY DEFINER`-RPC-ene er med vilje tilgjengelige for `authenticated`, men hver RPC kontrollerer aktiv bruker, faktisk Sales-firmascope, riktig tilbud og riktig akseptert versjon før skriving.

### Migrasjoner

```text
20260831190622  fase33b2_sales_contract_foundation
20260831190713  fase33b2_contract_offer_version_index
```

Rollback-QA er kjørt transaksjonelt mot eksisterende akseptert tilbud:

```text
Expo: create → save → company sign → anon read → customer sign → attach final document
External: register → void
```

Begge testene ble rullet tilbake. `sales_contracts` hadde 0 produksjonsrader etter QA.

## 7. Kontraktproduktet – besluttet retning

Dette er produktretningen for kommende 33B-runder:

- Etter akseptert tilbud kan bruker frivillig opprette Expo-kontrakt eller laste opp egen kontrakt.
- Ikke-garantiprosjekt kan fortsette uten kontrakt.
- Garantibad skal senere kreve enten signert Expo-kontrakt eller bekreftet ekstern kontrakt før garanti kan utstedes.
- Expo-kontrakten skal ha minst mulig utfylling og en steg-for-steg-veiviser som ender i ett samlet dokument.
- Akseptert tilbud, kunde og firmadata gjenbrukes automatisk.
- Standard betalingsforslag: 40 % ved oppstart, 40 % ved hovedmilepæl, 20 % etter overtagelse; bruker kan endre planen.
- Kontrakt og PDF skal følge Expo ProffDok-design og firmaets logo/profil.
- Relevante hjelpelinker kan peke til Forbrukerrådet. Expo skal ikke bruke Forbrukerrådets logo eller fremstille kontrakten som godkjent av dem.
- Expo skal ikke kopiere Standard Norge/NS-forbrukerblanketter.
- 2 G kan brukes som informasjon, ikke som teknisk sperre eller hardkodet beløp.

## 8. Systemadmin og support

Systemadmin er et kontrollert tverrfirma-verktøy, ikke en generell sikkerhetsbypass.

- Supportfirma skal være tydelig i UI.
- Lesing på tvers kan være nødvendig for support.
- Opprettelse, signering og ansvar skal fortsatt utføres av riktig firma/bruker.
- Prosjektaktivering eller kontraktskriving skal ikke gjennomføres dersom korrekt eierskap ikke kan etableres.

## 9. Overtagelse og garanti

Overtagelse er først reelt registrert når begge parter har signert, bruker bekrefter gjennomført overtagelse, data er lagret og signaturene kan leses tilbake fra Supabase.

Garantimodulen har egne ferdigstillingskrav. Kontraktkravet for garantibad kobles på i senere 33B-runde og skal være bakoverkompatibelt: gamle prosjekter skal ikke få tvungen historisk kontrakt.

## 10. Storage

Aktive hovedbuckets omfatter blant annet:

```text
sales-inspection-photos
chat-images
project-images
```

`project-images` er offentlig og brukes av eksisterende flyter, inkludert eldre kontraktopplasting. Dette er kjent sikkerhets-/personvernsgjeld. **Fase 33B.2 flytter ingen filer og endrer ingen Storage-policy.**

Endelig lagringsstrategi for nye signerte kontrakt-PDF-er avgjøres før 33B.5. Historiske URL-er skal bevares og eventuell overgang til privat Storage krever egen plan.

## 11. HJELP og dokumentasjon

Fase 33B.2 er rent teknisk/servermessig og har ingen synlig brukerflyt. **HJELP trenger derfor ikke oppdatering i denne runden.**

Når kontraktveiviseren blir synlig, skal HJELP oppdateres i samme runde med valg mellom Expo-kontrakt, ekstern kontrakt, signering og garantikrav.

## 12. Automatisk minimumsvern

`npm run build` kjører:

```text
critical-build-check.mjs
critical-sales-recovery-check.mjs
vite build
```

Dette er minimumsvern. Brukerrettede endringer krever fortsatt Preview-test og eksplisitt `TEST OK`.

## 13. Viktigste tekniske risikoer

| Prioritet | Risiko | Regel |
|---|---|---|
| Kritisk | Offentlig `project-images` med enkelte sensitive dokumenter | Ikke flytt historikk spontant; egen Storage-plan |
| Høy | Sales recovery/hydration | Beskytt eksisterende kladd- og gjenopprettingskontrakter |
| Høy | Signert tilbud/kontraktshistorikk | Immutable snapshots; ingen overskriving |
| Høy | Support på tvers av firma | Lesing er ikke skrive-bypass |
| Høy | Stor `projects.data` JSON | Ingen persistensendring uten bred regresjonstest |
| Middels | Legacy data uten nye felt | Bakoverkompatibilitet, ingen backfill |
| Middels | Store Core-filer | Uttrekk bare når ansvargrensen er naturlig |

## 14. Neste kontraktrunder

Planlagt trygg rekkefølge:

```text
33B.2  servermodell/RLS/RPC                 ← denne runden
33B.3  intern steg-for-steg-veiviser/autofyll
33B.4  kundelenke + begge signaturer
33B.5  endelig PDF + prosjektets Tilbud/kontrakt
33B.6  garantikobling + full HJELP/dokumentasjon
```

Hver brukerrettet runde skal gjennom build, Preview, eksisterende Sales-regresjon, ny funksjon, reload/persistens og relevant kundevisning før merge.
