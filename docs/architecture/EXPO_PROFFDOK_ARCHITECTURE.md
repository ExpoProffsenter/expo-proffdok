# Expo ProffDok – arkitekturkart

**Fase:** 33B.3 – intern steg-for-steg forbrukerkontrakt  
**Status:** Kontraktgrunnlag på server + brukerrettet Expo-kontraktsveiviser i feature/Preview  
**Dato:** 31.08.2026  
**Sist verifiserte produksjonsbaseline ved oppstart av 33B.3:** `main` på `8793adee6845e075527573aaab66efb9723fe430`  
**Supabase:** `dqffxflaoyarbxyiyhop`

Dette dokumentet er den tekniske inngangen til Expo ProffDok. Historiske faser finnes i Git. Kartet skal beskrive faktisk arkitektur, sikkerhetsgrenser og de viktigste bakoverkompatibilitetskravene uten å bli en parallell spesifikasjon av hele appen.

## 1. Styrende prinsipper

1. `main` er kilde til sannhet for produksjonskode.
2. Produksjon beskyttes foran alt: feature-branch → Vercel Preview → eksplisitt `TEST OK` → merge → kontroll av eksakt Production-SHA, HTTP og runtime.
3. RLS/server er sikkerhetsgrensen; frontend alene gir aldri tilgang.
4. Publiserte og aksepterte tilbudsversjoner er historikk og skal ikke overskrives.
5. Kontrakt er egen historikk og skal aldri mutere akseptert tilbud.
6. Prosjekter uten Expo-tilbud og uten Expo-kontrakt er gyldige normal-/legacytilstander.
7. Privatkundeorienterte priser vises inkl. mva.
8. Ingen historisk backfill uten eksplisitt beslutning.
9. Supportmodus skal ikke bli skrive-bypass eller sette systemadmin som feil oppretter/ansvarlig.
10. Sales recovery/hydration og IndexedDB-sikring av befaringsbilder er kritiske kontrakter.
11. Modulisering gjøres bare når ansvargrensen gir reell oversikt, testbarhet eller vedlikeholdsgevinst.
12. Brukerrettede endringer oppdaterer HJELP samme runde. Data-/sikkerhets-/modulendringer oppdaterer dette kartet og relevant domene-README.
13. Ingen hemmeligheter, nøkler eller sensitive driftsverdier skal inn i dokumentasjonen.

## 2. Plattform

| Lag | Teknologi | Hovedansvar |
|---|---|---|
| Klient | React + Vite | UI, state, navigasjon og arbeidsflyt |
| Auth | Supabase Auth | Innlogging og identitet |
| Data | Supabase Postgres | Prosjekter, Sales, kontrakt, garanti og produktdata |
| Serverlogikk | Supabase RPC | Firmascoping, publisering, offentlig kundehandling og låsing |
| Filer | Supabase Storage | Bilder og dokumenter |
| E-post | Supabase Edge Functions + Resend | Befaring, tilbud, portal, chat og systemmeldinger |
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

`main.jsx` er fortsatt sentral orkestrator for autentisering, profil/roller, prosjektpersistens, prosjektliste, navigasjon, support og tverrgående modulkoordinering. Den skal behandles konservativt.

## 4. Prosjektpersistens

Prosjektet lagres hovedsakelig som samlet JSON i `projects.data`. Viktige toppnivåområder er blant annet:

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

Flere kodeveier kan oppdatere samme JSON. Endringer i persistens må derfor bevare merge-/normaliseringslogikk og testes mot eldre prosjekter.

`locked` er prosjektets ferdig/read-only-tilstand, ikke et prosjektarkiv.

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
→ aktivering som ProffDok-prosjekt
```

Tilbud uten befaring er støttet.

`SalesModule.jsx` er en liten wrapper. Hovedorkestrering ligger i `SalesModuleCore.jsx`. Presentasjon og tjenester ligger gradvis i `components/`, `services/`, `constants/` og `utils/`.

### 5.1 Kritiske Sales-kontrakter

- En tom/uhydrert tilbudskladd skal aldri overskrive nyere serverdata.
- Recovery skal fungere ved reload, dvale og appbytte.
- Befaringsbilder beholder egen IndexedDB/Storage-flyt.
- Publiserte tilbudsversjoner er immutable snapshots.
- Kundeaksept knyttes til eksakt versjon og valgte opsjoner.
- Akseptbevis og tidligere aksepterte versjoner bevares ved senere revisjon.
- Sales bruker delt browser-Supabase-klient; ikke opprett parallelle GoTrue-klienter med samme storage.
- `scripts/critical-sales-recovery-check.mjs` er obligatorisk del av build.

### 5.2 Sporbarhet

For nye data skilles det mellom:

- faktisk oppretter
- nåværende saksansvarlig
- faktisk publisist av tilbudsversjon

Gamle saker backfilles ikke dersom historiske felt mangler.

### 5.3 Tilbudsbilder

Nye tilbudsbilder lagres normalt som Storage-URL i `imageDataUrl`; eldre `data:image...` støttes fortsatt. Befaringsbilder har separat flyt og skal ikke blandes med tilbudsbilder.

## 6. Forbrukerkontrakt – servergrunnlag fra Fase 33B.2

Supabase-tabell:

```text
sales_contracts
```

Hver kontrakt knyttes til:

- `company_id` – faktisk Sales-firmascope
- `request_ref` – salgssak
- `offer_id`
- `offer_version_id` – eksakt akseptert tilbudsversjon
- `source` – `expo` eller `external`
- `status` – `draft`, `awaiting_customer`, `signed`, `external_confirmed` eller `void`
- snapshot
- signaturmetadata
- eventuell ekstern/endelig dokumentreferanse

Det er ingen historisk backfill. Eksisterende `contractFile` i eldre salgssaker og prosjekter er gyldig legacy.

### 6.1 Snapshot og historikk

Når en Expo-kontrakt opprettes, bygger serveren snapshot fra:

- eksakt akseptert `sales_offer_versions`-rad
- akseptdata og valgte opsjoner
- kundedata
- firmasnapshot
- kontraktsfeltene brukeren fyller ut

Akseptert tilbud endres aldri.

Kontraktsdelen av snapshotet bruker fra Fase 33B.3 `schema_version: 2`. Viktige nye felt:

```text
start_date                     ← avtalt oppstart
expected_duration_weeks        ← brukerfelt
expected_finish_date           ← beregnes fra oppstart + varighet
daily_penalty_agreed
daily_penalty_grace_days       ← redigerbar slakk, standard 7 kalenderdager
daily_penalty_text
```

Eldre lokale/sessionbaserte utkast som bare har start- og sluttdato normaliseres til forventet varighet der det er mulig. Det kjøres ingen historisk databasebackfill.

Når bedriften senere signerer, skal snapshotet låses og status gå til `awaiting_customer`. Kunden skal deretter signere via unik kontrakttoken. Dette servergrunnlaget finnes, men kundesignering er ikke koblet til UI i Fase 33B.3.

### 6.2 RLS og grants

`sales_contracts` har RLS aktivert.

- `authenticated` har kun direkte `SELECT`.
- `anon` har ingen direkte tabelltilgang.
- Intern skriving skjer gjennom kontrollerte RPC-er.
- Vanlig kontraktskriving krever aktiv bruker og faktisk `current_sales_company_scope_id()`.
- Kontrakt-RPC-ene aksepterer ikke `support_company_id`; systemadmin-support er ikke skrive-bypass.
- Offentlig kundelesing/signering skal skje via unik token og RPC, ikke direkte tabelltilgang.
- Signert snapshot/signaturhistorikk beskyttes server-side.
- Ingen DELETE-flyt for kontrakthistorikk.

### 6.3 RPC-er

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

Eksplisitte `SECURITY DEFINER`-RPC-er kan gi generiske Supabase-advisor-varsler. Ikke fjern grants blindt når funksjonen bevisst er token-/brukerstyrt og har egne serverkontroller.

### 6.4 Migrasjoner

```text
20260831190622  fase33b2_sales_contract_foundation
20260831190713  fase33b2_contract_offer_version_index
```

Fase 33B.3 legger ikke til eller endrer migrasjoner, RLS eller Storage-policy.

## 7. Fase 33B.3 – intern kontraktsveiviser

Fase 33B.3 legger brukerflaten oppå servergrunnlaget uten å skrive om eksisterende Sales-core.

Nye naturlige moduler:

```text
src/modules/sales/components/SalesContractWizard.jsx
src/modules/sales/components/SalesContractDocument.jsx
src/modules/sales/services/salesContracts.js
src/modules/sales/utils/salesContractModel.js
```

Integrasjonen skjer i eksisterende `SalesDetailView.jsx`-wrapper. `SalesDetailViewCore.jsx`, dagens kontraktopplasting og `SalesProjectActivation.jsx` beholdes urørt i denne runden.

### 7.1 Valg etter aksept

I eksisterende kontraktkort på en akseptert sak finnes nå:

```text
Opprett / åpne enkel kontrakt
Last opp egen kontrakt          ← eksisterende funksjon beholdt
```

Vanlig prosjekt kan fortsatt gå til prosjektaktivering uten kontrakt. Garantibad får obligatorisk kontrakt senere i garantimodulen, ikke som ny blokkering i Sales nå.

### 7.2 Stegvis flyt

**Steg 1 – Grunnlag**  
Autofyll av firma, org.nr., kunde, prosjektadresse, akseptert tilbudsversjon, avtalesum inkl. mva. og relevante tilbudsvilkår. Brukeren skal ikke skrive samme data på nytt.

**Steg 2 – Fremdrift og betaling**  
Brukeren fyller hovedsakelig **avtalt oppstart** og **forventet varighet i uker**. `expected_finish_date` beregnes automatisk og er ikke et eget brukerfelt. Prisform er standardisert til fastpris iht. akseptert tilbud, men kan endres. Standard betalingsforslag:

```text
40 % ved faktisk oppstart – umiddelbart forfall
40 % ved naturlig hovedmilepæl
20 % etter ferdigstillelse og signert overtagelse
```

Planen er redigerbar og må samlet være 100 %.

**Steg 3 – Avtalevalg**  
Avtaleform, eventuell tidlig oppstart før angrefrist, eventuell særskilt dagmulkt og valgfritt felt for særskilte vilkår. Hvis dagmulkt avtales, registreres også redigerbar slakk i kalenderdager før dagmulkten kan begynne å løpe.

Veiviseren viser en intern faglig anbefaling om at en tydelig avtalt dagmulkt kan gi forutsigbarhet og fremstå profesjonelt. Denne anbefalingen er kun bruker-UI og skal ikke inn i kundens dokument.

Kontraktsdokumentet skal skille mellom forsinkelse utførende firma svarer for og dokumentert forsinkelse på kundens side. Kundens egne valg/leveranser, manglende tilgang, sene avklaringer eller andre forhold som gir rett til fristforlengelse skal forskyve fristen og ikke regnes som dagmulktsutløsende tid.

Forbrukerrådet-lenker vises som informasjon uten logo eller påstand om godkjenning.

**Steg 4 – samlet dokument**  
Veiviseren ender i ett samlet Expo ProffDok-dokumentutkast med firmaets visuelle profil/logo. I Fase 33B.3 lagres kun utkastet på server.

### 7.3 Viktige avgrensninger i 33B.3

- ingen kundesignering ennå
- ingen bedriftssignering i UI ennå
- ingen endelig kontrakt-PDF ennå
- ingen kontrakt-e-post ennå
- ingen overføring av Expo-utkast til prosjektet ennå
- ingen garantisperre ennå
- ingen endring av tilbud/aksept/recovery
- ingen endring av eksisterende ekstern kontraktopplasting

Hvis serveren allerede har en ekstern kontrakt eller en kontrakt som er sendt/signert for samme aksepterte versjon, skal veiviseren ikke skrive over denne.

## 8. Ekstern kontrakt – overgangstilstand

Dagens `contractFile`-opplasting fungerer fortsatt som før og følger ved prosjektaktivering til prosjektets «Tilbud / kontrakt».

Serveren har `register_external_sales_contract(...)`, men den eksisterende upload-UI-en er **ikke koblet til `sales_contracts` ennå**. Dette er bevisst for å unngå å endre en fungerende produksjonsflyt samtidig som veiviseren innføres.

Før garantikrav aktiveres må nye eksterne kontrakter kunne registreres sikkert i kontraktmodellen. Gamle `contractFile` skal fortsatt være gyldig uten tvungen backfill.

## 9. Systemadmin og support

Systemadmin er et kontrollert tverrfirma-verktøy, ikke en generell sikkerhetsbypass.

- valgt supportfirma skal være tydelig
- tverrfirma-lesing kan være nødvendig for support
- opprettelse/signering skal fortsatt utføres av riktig firma/bruker
- support skal ikke sette systemadmin som feil ansvarlig eller oppretter
- kontrakt-RPC-er skal ikke få en snarvei som omgår faktisk firmatilknytning

## 10. Overtagelse og garanti

Overtagelse er først reelt registrert når begge parter har signert, bruker bekrefter gjennomført overtagelse, data er lagret og signaturene kan leses tilbake fra Supabase.

Garantimodulen har egne ferdigstillingskrav. Senere 33B-runde skal kreve enten signert Expo-kontrakt eller bekreftet ekstern kontrakt før garantibad kan få garanti. Gamle prosjekter skal ikke få historisk tvang/backfill.

## 11. Storage

Aktive hovedbuckets omfatter blant annet:

```text
sales-inspection-photos
chat-images
project-images
```

`project-images` er offentlig og brukes av eksisterende flyter. Dette er kjent sikkerhets-/personvernsgjeld, særlig for dokumenter.

Fase 33B.3 endrer ingen Storage-policy og lager ingen ny kontrakt-PDF. Endelig lagringsstrategi for nye signerte kontrakter avgjøres før PDF-/prosjektkoblingen. Historiske URL-er skal bevares.

## 12. Edge Functions

Sentrale funksjoner inkluderer:

```text
smart-worker
delete-pending-user
```

`smart-worker` brukes til e-post via Resend. Fase 33B.3 sender ingen ny kontrakt-e-post og endrer ingen Edge Function.

## 13. HJELP og dokumentasjon

Fase 33B.3 er brukerrettet. HJELP er derfor oppdatert samme runde med:

- Expo-kontrakt som frivillig valg etter aksept
- eksisterende opplasting av egen kontrakt
- autofyll og få manuelle steg
- avtalt oppstart + forventet varighet i uker + beregnet forventet ferdigstillelse
- 40/40/20-standard
- intern dagmulktsanbefaling og tydelig fordeling av forsinkelsesansvar
- samlet dokument
- at akseptert tilbud ikke endres
- at prosjektaktivering fortsatt fungerer som før

Sales-detaljer ligger i `src/modules/sales/README.md`. Root `README.md` skal forbli kort repository-inngang.

## 14. Automatisk minimumsvern og QA

`npm run build` kjører:

```text
critical-build-check.mjs
critical-sales-recovery-check.mjs
vite build
```

Dette er minimumsvern, ikke full testpakke. Brukerrettede endringer krever Preview-test før merge.

For Fase 33B.3 skal Preview minst kontrollere:

- eksisterende akseptert sak åpnes
- «Last opp egen kontrakt» finnes fortsatt
- «Opprett / åpne enkel kontrakt» åpner veiviseren
- autofyll er korrekt
- avtalt oppstart + forventet varighet beregner forventet ferdigstillelse riktig
- 40/40/20 vises og kan redigeres
- internt dagmulktsråd vises bare i veiviseren
- dagmulktslakk og ansvar ved håndverker-/kundeforsinkelse er tydelig
- steg frem/tilbake beholder verdier
- samlet dokument er lesbart på PC og mobil
- Forbrukerrådet-lenker åpner separat
- tilbake til saken fungerer
- dagens «Aktiver som prosjekt» finnes fortsatt
- HJELP er oppdatert
- reload/persistens testes kontrollert dersom et kontraktsutkast lagres

## 15. Viktigste tekniske risikoer

| Prioritet | Risiko | Regel |
|---|---|---|
| Kritisk | Offentlig `project-images` med enkelte sensitive dokumenter | Ikke flytt historikk spontant; egen Storage-plan |
| Høy | Sales recovery/hydration | Beskytt eksisterende kladd- og gjenopprettingskontrakter |
| Høy | Tilbud-/kontraktshistorikk | Immutable snapshots; ingen overskriving |
| Høy | Support på tvers av firma | Lesing er ikke skrive-bypass |
| Høy | Stor `projects.data` JSON | Ingen persistensendring uten bred regresjonstest |
| Middels | Legacy `contractFile` uten `sales_contracts`-rad | Bevar legacy; koble fremover uten backfill |
| Middels | Store Core-filer | Uttrekk bare når ansvargrensen er naturlig |

## 16. Åpne produkt-/arkitekturpunkter

### Kontrakt – neste runder

```text
33B.2  servermodell/RLS/RPC                   ← ferdig
33B.3  intern steg-for-steg-veiviser/autofyll ← denne runden
33B.4  kundelenke + begge signaturer
33B.5  endelig PDF + prosjektets Tilbud/kontrakt
33B.6  garantikobling + slutt-QA/dokumentasjon
```

### Flere rom under samme prosjekt

GitHub issue #110 beskriver fremtidig rommodell (Bad 1, Bad 2, WC, vaskerom osv.). Dette er fortsatt kun analyse/backlog. Ingen romdata eller prosjektpersistens endres i Fase 33B.

## 17. Handover-regel

Videre utvikling skal følge:

```text
Les faktisk main
→ kartlegg bare relevant område
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

Målet er ikke flest mulig moduler. Målet er en enkel, forståelig og trygg produksjonsapp som kan videreutvikles uten å miste historikk eller fungerende arbeidsflyt.
