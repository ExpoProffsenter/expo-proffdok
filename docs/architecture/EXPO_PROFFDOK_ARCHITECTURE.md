# Expo ProffDok – arkitekturkart

**Fase:** 33B.5 – endelig kontrakt-PDF, direkte kontraktflate og prosjektkobling  
**Status:** Feature/Preview – venter på brukerens TEST OK før merge  
**Dato:** 31.08.2026  
**Produksjonsbaseline ved oppstart:** `main` på `070d94e5d974d69e3c26b5b79c5776f854cab095`  
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
| Serverlogikk | Supabase RPC/trigger | Firmascoping, publisering, tokenhandling, validering, låsing og dokumentkobling |
| Filer | Supabase Storage | Bilder og private/offentlige dokumenter |
| E-post | Supabase Edge Functions + Resend | Befaring, tilbud, kontrakt, portal, chat og systemmeldinger |
| Hosting | Vercel | Preview og Production |
| PDF | jsPDF | Rapport, tilbud, akseptbevis, garanti og endelig kontrakt |

Produksjon: `https://expo-proffdok.app`

## 3. Repository og modulgrenser

`src/main.jsx` er fortsatt sentral orkestrator for autentisering, profil/roller, prosjektpersistens, prosjektliste, navigasjon, support og tverrgående modulkoordinering. Den behandles konservativt.

Sales ligger under `src/modules/sales/`. Fase 33B.5 legger ikke kontraktslogikk inn i `main.jsx` eller `SalesModuleCore.jsx`:

```text
src/modules/sales/
├── SalesModule.jsx                    ← offentlig kontraktsrouting + eksisterende recovery-wrapper
├── SalesModuleCore.jsx                ← eksisterende Sales-orkestrering
├── components/
│   ├── SalesDetailView.jsx            ← integrasjon til kontraktkort
│   ├── SalesContractActions.jsx       ← fast status/kundelenke/slutt-PDF på saken
│   ├── SalesContractWizard.jsx        ← signeringslivsløp/status
│   ├── SalesContractWizardCore.jsx    ← testet stegvis utfylling/recovery
│   ├── SalesContractDocument.jsx      ← dynamiske signaturer/elektronisk footer
│   ├── SalesContractDocumentCore.jsx  ← avtaletekst
│   └── SalesContractCustomerView.jsx  ← offentlig read-only kundesignering
├── services/
│   ├── salesContracts.js              ← kontrakt-RPC, privat arkivering og prosjekt-sync
│   └── salesContractPdf.js            ← endelig PDF fra låst servergrunnlag
└── utils/
    └── salesContractModel.js
```

Dette er naturlige ansvargrenser. `SalesDetailViewCore.jsx`, ekstern kontraktopplasting og `SalesProjectActivation.jsx` er ikke skrevet om. En midlertidig separat slutt-dokumentkomponent ble bevisst fjernet igjen fordi ansvaret allerede ligger naturlig i `SalesContractActions.jsx`.

## 4. Prosjektpersistens

Prosjektet lagres hovedsakelig som samlet JSON i `projects.data`. Viktige områder omfatter blant annet company, user, project, checked, productDocs, manualProducts, photos, access, files, checklist, `tilbud`, overtagelse, warranty, projectLog og internalNotes.

Flere kodeveier kan oppdatere samme JSON. Endringer må derfor bevare merge-/normaliseringslogikk og eldre prosjekter.

`locked` betyr ferdig/read-only, ikke arkiv.

### 4.1 Kontrakt inn i `data.tilbud.files`

Fase 33B.5 bruker to additive serverveier:

1. `sync_sales_contract_final_document_to_project(contract_id)` kobler en ferdig signert Expo-kontrakt til eventuelt **allerede aktivert, ulåst** prosjekt med samme `company_scope_id` og `salesOrigin.requestRef`.
2. trigger `trg_projects_link_signed_sales_contract` sikrer at prosjekt som opprettes eller oppdateres **senere** får samme `final_document` i `data.tilbud.files`.

Begge veiene er idempotente og legger bare dokumentreferansen til samme private Storage-objekt. Filen kopieres ikke.

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
→ signering
→ endelig kontrakt-PDF
→ aktivering / Tilbud og kontrakt
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

33B.5 endrer ikke tilbuds- eller recovery-kontraktene.

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
- eventuell ekstern dokumentreferanse
- `final_document` for endelig signert Expo-PDF

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
- `final_document` kan settes første gang etter signering og er deretter immutable.
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
sync_sales_contract_final_document_to_project(contract_id uuid)
```

### 6.4 Migrasjoner

```text
20260831190622  fase33b2_sales_contract_foundation
20260831190713  fase33b2_contract_offer_version_index
20260831210107  fase33b4_company_signature_validation
20260831210119  fase33b4_customer_signature_acknowledgements
20260831215906  fase33b5_sync_final_contract_to_project
20260831220648  fase33b5_project_contract_auto_link
```

33B.5-migrasjonene endrer ikke historiske tilbud eller Storage-policy og kjører ingen backfill.

## 7. Bedriftssignering og kundesignering

Et Expo-utkast er redigerbart kun i `draft`.

Bedriftssigneringen kontrollerer server-side blant annet aktiv bruker/firmascope, eksakt akseptert tilbudsversjon, prisform, avtalt oppstart, forventet varighet, beregnet ferdigstillelse, avtaleform, betalingsplan og dagmulktfelter når relevant.

Serveren registrerer faktisk signatar og tidspunkt. Status går til `awaiting_customer` og snapshotet låses.

Kundelenken bruker:

```text
?publicOffer=<tilbudstoken eller routingmarkør>&publicContract=<kontrakttoken>
```

`publicContract` er sikkerhetsnøkkelen; `publicOffer` er kun public Sales-routing. Kunden får read-only visning og må bekrefte kontrakt + akseptert tilbudsgrunnlag. Ved registrert tidlig oppstart kreves særskilt bekreftelse. Gyldig signering setter `status=signed`, navn/tidspunkt og acknowledgements.

Åpnes kundelenken etter signering vises tydelig ferdigstatus. Ny signering er ikke mulig.

## 8. Fast kontraktflate på Sales-saken

`SalesContractActions.jsx` henter aktiv kontrakt for eksakt akseptert tilbudsversjon og vises inne i eksisterende kontraktkort.

Når kontrakt finnes:

```text
status
Åpne kontrakt
Åpne kundelenke
Kopier kundelenke
Åpne signert PDF  ← når final_document finnes
```

Brukeren trenger dermed ikke åpne veiviseren bare for å hente kundelenken.

Legacy `contractFile` og `Last opp egen kontrakt` beholdes. Dersom systemadmin står i Sales-supportmodus, forsøker ikke komponenten automatisk å generere eller arkivere PDF.

## 9. Endelig kontrakt-PDF

`createFinalSalesContractPdf(contract)` bruker bare:

- `sales_contracts.snapshot`
- `company_signed_by_name/company_signed_at`
- `customer_signed_by_name/customer_signed_at`
- `customer_acknowledgements`

Ingen redigerbar `selectedRequest` eller lokal kontraktkladd brukes som juridisk dokumentgrunnlag.

PDF-en består av:

1. kontraktens avtalepunkter
2. begge signaturer
3. **Vedlegg A – akseptert tilbud** med tilbudsversjon, leveranse, priser inkl. mva. og valgte opsjoner
4. **Vedlegg B – aksept og signaturbevis** med kundeaksept og signatursporbarhet

Dermed følger tilbudsaksepten kontrakten som samlet dokumentkjede uten at tilbudshistorikken kopieres tilbake eller overskrives.

### 9.1 Arkivering

Logisk Storage-path:

```text
sales-contracts/<user-id>/<request-ref>/<filnavn>.pdf
```

Eksisterende private Sales Storage-lag oversetter denne til fysisk firmascope-path i `project-documents-private`.

Flyt:

```text
signed + final_document mangler
→ generer PDF fra låst rad
→ last opp privat
→ attach_sales_contract_final_document(...)
→ final_document låses
→ sync eksisterende prosjekt
```

Hvis attach feiler etter upload forsøkes opplastingen ryddet bort. Hvis prosjektsynk feiler etter at PDF er trygt arkivert, beholdes `final_document` og synk kan kjøres igjen idempotent.

## 10. Kontraktdokument og juridisk presentasjon

Det aksepterte tilbudet og valgte opsjoner forblir det låste avtalegrunnlaget. Dokumentet viser kundeaksept, versjon, tidspunkt, avtalesum inkl. mva., valgte opsjoner og kontraktspunktene.

Avslutningen heter **Elektronisk avtalegrunnlag** og forklarer kort at kontrakten signeres elektronisk i Expo ProffDok og at akseptert tilbud/opsjoner/angitte vedlegg inngår i avtalen.

Produktet skal ikke markedsføres som Standard Norge-/NS-blankett eller Forbrukerrådet-godkjent.

## 11. E-post – `smart-worker`

`smart-worker` støtter `sales_contract` med eksisterende mottakerkontroll. Kontraktlenken sendes til kundens registrerte Sales-e-post. E-postfeil endrer ikke kontraktstatus eller låst snapshot.

33B.5 endrer ikke e-postfunksjonen.

## 12. Ekstern kontrakt

Eksisterende `contractFile`-opplasting følger fortsatt saken til prosjektets `Tilbud / kontrakt` ved aktivering.

`register_external_sales_contract(...)` finnes på server, men legacy upload-UI er ikke backfillet eller tvangsmigrert til `sales_contracts`.

Vanlige prosjekter kan fortsatt aktiveres uten kontrakt. Garantibad får kontraktkrav først i 33B.6.

## 13. Storage og prosjektportal

Private Sales-dokumenter bruker eksisterende `project-documents-private` og logiske Sales-paths. Historiske URL-er beholdes.

Når slutt-PDF kobles til et prosjekt, får prosjektets dokumentreferanse en prosjektbundet `privateDocument`-URL. Dermed bruker den samme eksisterende portal-/tilgangskode-mekanismen som andre private prosjektdokumenter.

33B.5 endrer ingen Storage-policy og flytter ingen eksisterende fil.

## 14. HJELP

HJELP er oppdatert med:

- direkte kontrakt/kundelenke på Sales-saken
- signert slutt-PDF fra låst servergrunnlag
- `Åpne signert PDF`
- tilbud + aksept som del av PDF-vedleggene
- automatisk prosjektkobling nå eller ved senere aktivering
- ingen automatisk sluttarkivering i supportmodus
- fortsatt støtte for ekstern kontrakt og vanlig prosjektaktivering

## 15. QA for 33B.5

Serverkoblingen er rollback-testet mot den eksisterende signerte testsaken `F-2026-0042`:

```text
midlertidig final_document
→ midlertidig prosjekt med samme company_scope_id + requestRef
→ trigger legger nøyaktig 1 kontraktdokument i data.tilbud.files
→ prosjektbundet privat URL bygges
→ ROLLBACK
→ QA-prosjekt = 0
→ testens final_document = 0
```

Før merge skal Preview fortsatt gjennom:

- critical-build-check
- critical-sales-recovery-check
- Vite build
- diff mot main
- runtime/HTTP
- brukerens faktiske test av kontraktkort + slutt-PDF
- kontroll av `sales_contracts.final_document` etter testen

## 16. Neste runder

```text
33B.2  servermodell/RLS/RPC                           ← ferdig
33B.3  intern steg-for-steg-veiviser/autofyll         ← ferdig
33B.4  bedriftssignatur + kundelenke + kundesignering ← ferdig
33B.5  slutt-PDF + direkte kontraktflate + prosjektkobling ← denne runden
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
