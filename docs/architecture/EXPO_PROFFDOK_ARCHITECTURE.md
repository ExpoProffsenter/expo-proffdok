# Expo ProffDok – arkitekturkart

**Fase:** 33B.4 – bedriftssignatur, sikker kundelenke og kundesignering  
**Status:** Feature/Preview – venter på brukerens TEST OK før merge  
**Dato:** 31.08.2026  
**Produksjonsbaseline ved oppstart:** `main` på `cfc4b15942cc11bb0c5915c39c68aff4aa74119c`  
**Supabase:** `dqffxflaoyarbxyiyhop`

Dette kartet er den tekniske inngangen til Expo ProffDok. Historiske faser finnes i Git. Dokumentet beskriver faktisk arkitektur, sikkerhetsgrenser og kritiske bakoverkompatibilitetskrav uten å bli en parallell spesifikasjon av hele appen.

## 1. Styrende prinsipper

1. `main` er kilde til sannhet for produksjonskode.
2. Produksjon beskyttes foran alt: feature-branch → Vercel Preview → `TEST OK` → merge → verifiser eksakt Production-SHA, HTTP/runtime og relevant Supabase-status.
3. RLS/server er sikkerhetsgrensen; frontend alene gir aldri tilgang.
4. Publiserte tilbud, aksepterte tilbudsversjoner og signerte kontrakter er historikk og skal ikke overskrives.
5. Kontrakt er egen historikk og muterer aldri akseptert tilbud.
6. Prosjekter uten Expo-tilbud eller Expo-kontrakt er gyldige normal-/legacytilstander.
7. Privatkundeorienterte priser vises inkl. mva.
8. Ingen historisk backfill uten eksplisitt beslutning.
9. Supportmodus skal ikke bli skrive-bypass eller registrere systemadmin som feil oppretter/ansvarlig/signatar.
10. Sales recovery/hydration og IndexedDB-sikring av befaringsbilder er kritiske kontrakter.
11. Storage-historikk og eksisterende URL-er skal ikke flyttes spontant.
12. Modulisering gjøres bare når ansvargrensen gir reell oversikt, testbarhet eller vedlikeholdsgevinst.
13. Brukerrettede endringer oppdaterer HJELP samme runde; data-/sikkerhets-/systemflyt oppdaterer dette kartet og domene-README.
14. Ingen hemmeligheter, nøkler eller sensitive driftsverdier dokumenteres.

## 2. Plattform

| Lag | Teknologi | Hovedansvar |
|---|---|---|
| Klient | React + Vite | UI, state, navigasjon og arbeidsflyt |
| Auth | Supabase Auth | Innlogging og identitet |
| Data | Supabase Postgres | Prosjekter, Sales, kontrakt, garanti og produktdata |
| Serverlogikk | Supabase RPC | Firmascoping, publisering, tokenhandling, validering og låsing |
| Filer | Supabase Storage | Bilder og dokumenter |
| E-post | Supabase Edge Functions + Resend | Befaring, tilbud, kontrakt, portal, chat og systemmeldinger |
| Hosting | Vercel | Preview og Production |
| PDF | jsPDF | Rapport, tilbud, akseptbevis, garanti og senere endelig kontrakt |

Produksjon: `https://expo-proffdok.app`

## 3. Repository og modulgrenser

`src/main.jsx` er fortsatt sentral orkestrator for autentisering, profil/roller, prosjektpersistens, prosjektliste, navigasjon, support og tverrgående modulkoordinering. Den skal behandles konservativt.

Sales ligger under `src/modules/sales/`. Fase 33B.4 legger ikke signeringslogikk inn i `main.jsx` eller `SalesModuleCore.jsx`, men bruker små ansvarswrappere:

```text
src/modules/sales/
├── SalesModule.jsx                    ← offentlig kontraktsrouting + eksisterende recovery-wrapper
├── SalesModuleCore.jsx                ← eksisterende Sales-orkestrering
├── components/
│   ├── SalesDetailView.jsx            ← integrasjon til kontraktkort
│   ├── SalesContractWizard.jsx        ← signeringslivsløp/status
│   ├── SalesContractWizardCore.jsx    ← testet 33B.3-veiviser
│   ├── SalesContractDocument.jsx      ← dynamiske signaturer/elektronisk footer
│   ├── SalesContractDocumentCore.jsx  ← testet avtaletekst fra 33B.3
│   └── SalesContractCustomerView.jsx  ← offentlig read-only kundesignering
├── services/
│   └── salesContracts.js
└── utils/
    └── salesContractModel.js
```

Dette er naturlige ansvargrenser. `SalesDetailViewCore.jsx`, eksisterende ekstern kontraktopplasting og `SalesProjectActivation.jsx` er ikke skrevet om.

## 4. Prosjektpersistens

Prosjektet lagres hovedsakelig som samlet JSON i `projects.data`. Viktige områder omfatter blant annet company, user, project, checked, productDocs, manualProducts, photos, access, files, checklist, tilbud, overtagelse, warranty, projectLog og internalNotes.

Flere kodeveier kan oppdatere samme JSON. Endringer i persistens må derfor bevare merge-/normaliseringslogikk og testes mot eldre prosjekter.

`locked` betyr ferdig/read-only, ikke arkiv.

Fase 33B.4 endrer **ikke** prosjektpersistens.

## 5. Sales – tilbud og aksept

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

Kritiske kontrakter:

- tom/uhydrert tilbudskladd skal aldri overskrive nyere serverdata
- recovery skal fungere ved reload, dvale og appbytte
- befaringsbilder beholder IndexedDB/Storage-flyt
- publiserte tilbudsversjoner er immutable snapshots
- kundeaksept knyttes til eksakt versjon og valgte opsjoner
- tidligere aksept/historikk bevares ved senere tilbudsversjon
- delt browser-Supabase-klient brukes
- `critical-sales-recovery-check.mjs` er obligatorisk del av build

33B.4 endrer ikke disse kontraktene.

## 6. Kontraktserver – `sales_contracts`

Hver kontrakt knyttes til:

- faktisk Sales `company_id`
- salgssak `request_ref`
- `offer_id`
- **eksakt `offer_version_id` som kunden aksepterte**
- `source`: `expo` eller `external`
- `status`: `draft`, `awaiting_customer`, `signed`, `external_confirmed`, `void`
- unikt `customer_token`
- snapshot
- firma-/kundesignaturmetadata
- eventuell ekstern/endelig dokumentreferanse

Ingen historisk backfill er utført. Eksisterende `contractFile` er gyldig legacy.

### 6.1 Snapshot

Serveren bygger kontraktgrunnlaget fra eksakt akseptert tilbudsversjon, akseptdata/valgte opsjoner, kundedata, firmasnapshot og de få kontraktfeltene brukeren legger til.

Akseptert tilbud endres aldri.

Kontraktsdelen bruker `schema_version: 2` med blant annet:

```text
start_date
expected_duration_weeks
expected_finish_date
daily_penalty_agreed
daily_penalty_grace_days
daily_penalty_text
payment_plan
agreement_channel
early_start_requested
```

`daily_penalty_grace_days` presenteres som **avtalt tilleggsfrist**, ikke «slakk».

### 6.2 RLS og write-modell

- RLS er aktivert på `sales_contracts`.
- `authenticated` har direkte SELECT, ikke ordinær direkte INSERT/UPDATE/DELETE.
- Writes går gjennom kontrollerte SECURITY DEFINER-RPC-er.
- Intern skriving krever aktiv bruker og faktisk `current_sales_company_scope_id()`.
- Kontrakt-RPC-er har ikke `support_company_id`; support/systemadmin er ikke write-bypass.
- Offentlig kunde leser/signerer via unik token og RPC, ikke direkte tabelltilgang.
- Signert snapshot/signaturhistorikk beskyttes server-side.
- Ingen normal DELETE-flyt for kontrakthistorikk.

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

### 6.4 Migrasjoner

```text
20260831190622  fase33b2_sales_contract_foundation
20260831190713  fase33b2_contract_offer_version_index
20260831210107  fase33b4_company_signature_validation
20260831210119  fase33b4_customer_signature_acknowledgements
```

33B.4-migrasjonene er additive/strammende. De endrer ikke tilbudsdata, prosjektdata eller Storage-policy.

## 7. 33B.4 – bedriftssignering

Et Expo-utkast er redigerbart kun i `draft`.

`sign_sales_contract_company(...)` kontrollerer server-side blant annet:

- aktiv godkjent innlogget bruker
- faktisk firmascope
- Expo-kontrakt i draft
- fortsatt samme eksakte aksepterte tilbudsversjon
- prisform
- avtalt oppstart
- forventet varighet > 0
- beregnet ferdigstillelse
- gyldig avtaleform
- betalingsplan som summerer til 100 %
- dagmulkttekst og gyldig tilleggsfrist hvis dagmulkt er avtalt

I UI må brukeren bekrefte at kontrakten er kontrollert og at vedkommende signerer på vegne av bedriften. Serveren registrerer faktisk bruker/navn og tidspunkt. Status går til `awaiting_customer`; innholdet blir read-only i denne flyten.

## 8. Offentlig kundelenke

Etter bedriftssignering bygges en sikker lenke med unik kontrakttoken:

```text
?publicOffer=<tilbudstoken eller routingmarkør>&publicContract=<kontrakttoken>
```

Eksisterende `main.jsx` bruker `publicOffer` som inngang til public Sales-modus. `SalesModule.jsx` ser deretter `publicContract` og viser `SalesContractCustomerView.jsx` i stedet for tilbudsvisningen.

Sikkerhetsmessig er `publicContract`/RPC-token nøkkelen til kontrakten. `publicOffer` er bare routing. Hvis en eldre aksept mangler historisk tilbudstoken brukes en ikke-sensitiv routingmarkør slik at kontraktlenken fortsatt fungerer.

Kunden får kun read-only kontraktsvisning. Ingen intern Sales-state eller ordinær appskriving eksponeres.

## 9. Kundesignering

Før `sign_sales_contract_customer(...)` godtar signering må kunden:

1. oppgi fullt navn
2. bekrefte kontrakten
3. bekrefte at tidligere akseptert tilbud med valgte opsjoner/vedlegg inngår i avtalegrunnlaget
4. dersom `early_start_requested=true`: uttrykkelig bekrefte tidlig oppstart før eventuell angrefrist er utløpt

Serveren avviser manglende obligatoriske acknowledgements.

Ved gyldig signering:

```text
status = signed
customer_signed_by_name = <navn>
customer_signed_at = now()
customer_acknowledgements = <låst bekreftelse>
```

Bedriftens og kundens navn/tidspunkt vises deretter i dokumentets signaturdel. Signert kontrakt kan ikke redigeres i denne flyten.

## 10. Kontraktdokument

Det aksepterte tilbudet og valgte opsjoner forblir det låste avtalegrunnlaget. Dokumentet viser kundeaksept, versjon, tidspunkt, avtalesum inkl. mva., valgte opsjoner og kontraktspunktene.

Avslutningen heter **Elektronisk avtalegrunnlag** og forklarer kort at kontrakten signeres elektronisk i Expo ProffDok og at akseptert tilbud/opsjoner/angitte vedlegg inngår i avtalen.

Den tidligere lange forklaringen om «ikke NS / ikke godkjent av Forbrukerrådet» er ikke kundetekst. Produktet skal fortsatt aldri markedsføres som en Standard Norge-/NS-blankett eller som Forbrukerrådet-godkjent.

## 11. E-post – `smart-worker`

Supabase Edge Function `smart-worker` er i 33B.4 utvidet med direction:

```text
sales_contract
```

Funksjonen beholder `verify_jwt=true` og bruker samme Sales-mottakerkontroll som befaring/tilbud:

- godkjent aktiv caller
- mottaker må tilhøre en Sales-sak caller kan lese
- kontraktlenken sendes til kundens registrerte e-post

UI tilbyr også åpne/kopiere kundelenke. En e-postfeil endrer ikke `sales_contracts.status` og låser ikke opp kontrakten.

## 12. Ekstern kontrakt og prosjektaktivering

Eksisterende `contractFile`-opplasting er fortsatt uendret og følger saken til prosjektets «Tilbud / kontrakt» ved prosjektaktivering.

`register_external_sales_contract(...)` finnes på server, men gammel upload-UI er ennå ikke koblet til tabellen. Gamle data backfilles ikke.

Vanlige prosjekter kan fortsatt aktiveres uten kontrakt. Garantibad får kontraktkrav senere i garantimodulen.

33B.4 lager ikke endelig kontrakt-PDF og overfører ikke Expo-kontrakten til prosjektet. Dette er 33B.5.

## 13. Storage

Aktive buckets omfatter blant annet `sales-inspection-photos`, `chat-images` og `project-images`.

`project-images` er offentlig i eksisterende flyter og er kjent sikkerhets-/personvernsgjeld. 33B.4 endrer ingen Storage-policy og lager ingen ny kontrakt-PDF. Historiske URL-er skal bevares.

## 14. HJELP

HJELP er oppdatert med:

- bedriftens kontroll og signering
- automatisk signatarnavn/tidspunkt
- låsing etter bedriftssignatur
- sikker kundelenke og e-post
- read-only kundevisning
- obligatoriske kundebekreftelser
- særskilt bekreftelse ved tidlig oppstart
- låste signaturer etter kundesignering
- at endelig PDF/prosjektkobling kommer i neste runde
- at eksisterende ekstern kontrakt og prosjektaktivering består

## 15. QA for 33B.4

Serverflyten er testet transaksjonelt mot testsaken `F-2026-0042`:

```text
opprett utkast
→ lagre utkast
→ bedriftssigner
→ les offentlig via unik token
→ forsøk uten påkrevd early-start-bekreftelse avvises
→ gyldig kundesignering
→ kontroller signed + begge signaturtidspunkter
→ ROLLBACK
```

Etter rollback var `sales_contracts` fortsatt tom. Ingen QA-kontrakt ble stående.

`smart-worker` er utvidet additivt med `sales_contract`; øvrige mailtyper beholdes.

Før merge skal Preview fortsatt gjennom:

- critical-build-check
- critical-sales-recovery-check
- Vite build
- diff mot main
- runtime/HTTP
- brukerens faktiske PC/mobil-test av relevant signeringsflyt

## 16. Neste runder

```text
33B.2  servermodell/RLS/RPC                           ← ferdig
33B.3  intern steg-for-steg-veiviser/autofyll         ← ferdig
33B.4  bedriftssignatur + kundelenke + kundesignering ← denne runden
33B.5  endelig PDF + prosjektets Tilbud / kontrakt
33B.6  garantikobling + slutt-QA/dokumentasjon
```

GitHub issue #110 om flere rom under samme prosjekt forblir fremtidig backlog og endrer ingen data i Fase 33B.

## 17. Handover-regel

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

Målet er en enkel, forståelig og trygg produksjonsapp – ikke flest mulig moduler.
