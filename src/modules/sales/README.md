# Expo ProffDok – Befaring / Tilbud / Aksept

**Status:** Produksjonskoblet modul  
**Oppdatert:** Fase 33B.2 – 31.08.2026

Sales håndterer salgsflyten fra forespørsel til eventuelt ProffDok-prosjekt. Fra Fase 33B.2 finnes også et additivt servergrunnlag for enkel forbrukerkontrakt, men kontrakt-UI er ikke koblet på ennå.

## Hovedflyt

```text
Forespørsel
→ eventuell befaring
→ tilbudskladd
→ publisert tilbudsversjon
→ kundelenke / e-post
→ kundevalg av opsjoner
→ digital aksept
→ akseptbevis
→ valgfri kontrakt
→ eventuell ny tilbudsversjon
→ aktivering som ProffDok-prosjekt
```

Tilbud kan også opprettes uten befaring.

## Viktige prinsipper

- Mobil først.
- Registrer informasjon én gang og gjenbruk den.
- Publiserte tilbudsversjoner overskrives aldri.
- Kundeaksept knyttes til eksakt tilbudsversjon og valgte opsjoner.
- Ny tilbudsversjon etter aksept skal bevare tidligere aksept/historikk.
- Signert kontrakt er egen historikk og skal ikke mutere akseptert tilbud.
- Sak og ProffDok-prosjekt er separate objekter.
- Prosjekter uten Expo-tilbud eller Expo-kontrakt er gyldige.
- Privatkundeorienterte priser vises inkl. mva.
- Ingen historisk backfill uten eksplisitt beslutning.
- Supportmodus er ikke skrive-bypass.

## Struktur

`SalesModule.jsx` er inngang/wrapper. Hovedorkestrering ligger i `SalesModuleCore.jsx`.

```text
src/modules/sales/
├── SalesModule.jsx
├── SalesModuleCore.jsx
├── SalesPreview.jsx
├── components/
├── constants/
├── services/
├── utils/
└── sales.css
```

Ikke splitt Sales bare for å redusere filstørrelse. Nye grenser skal gi reell oversikt, testbarhet eller vedlikeholdsgevinst.

## Kritisk recovery/hydration

Sales har flere vern mot datatap:

- serverlagret arbeidskopi i `sales_requests.payload`
- lokal tilbudskladd
- kontrollert hydrering før autosave
- gjenoppretting ved reload/appbytte
- IndexedDB/lokal sikring av befaringsbilder
- `scripts/critical-sales-recovery-check.mjs` i build

En tom eller uhydrert kladd må aldri kunne overskrive nyere serverdata. Kontraktutvikling skal ikke endre denne logikken.

## Supabase-klient

Sales bruker delt browser-Supabase-klient. Ikke opprett parallelle GoTrue/Supabase-klienter med samme browser-storage når den delte klienten kan brukes.

## Publisering og aksept

Sentrale eksisterende RPC-kontrakter:

```text
resolve_sales_company_scope()
publish_sales_offer(payload jsonb)
get_sales_offer_by_token(token uuid)
accept_sales_offer(...)
```

Publisert tilbud og aksept er historikk. Akseptbevis og tidligere aksepterte versjoner skal ikke muteres ved senere revisjoner.

## Fase 33B.2 – kontraktgrunnlag på server

Ny Supabase-tabell:

```text
sales_contracts
```

Tabellen er knyttet til faktisk Sales-firma, salgssak, tilbud og **eksakt akseptert tilbudsversjon**.

Kilder:

```text
expo      – kontrakt som senere opprettes i Expo ProffDok
external  – brukerens egen opplastede kontrakt
```

Status:

```text
draft
awaiting_customer
signed
external_confirmed
void
```

### Expo-kontrakt

Serveren oppretter et snapshot med:

- låst akseptert tilbudsversjon
- akseptdato/-navn og valgte opsjoner
- kundedata
- firmasnapshot
- kontraktsfeltene fra veiviseren

Fremtidig UI skal fylle ut minst mulig. Akseptert tilbud og kundedata skal gjenbrukes, ikke skrives inn på nytt.

Når bedriften signerer, låses snapshotet og status blir `awaiting_customer`. Kunden signerer via separat token. Etter kundesignering er status `signed`.

### Ekstern kontrakt

Serveren kan registrere ekstern kontrakt som `external_confirmed`. Dette er grunnlaget for den eksisterende brukerretningen «Last opp egen kontrakt».

Eksisterende gamle `contractFile`-data backfilles ikke og forblir gyldig legacy. Ny UI skal senere bevare dagens opplastingsmulighet og koble nye opplastinger mot servermodellen uten å ødelegge gamle saker.

### RPC-er

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

### Sikkerhet

- `sales_contracts` har RLS.
- `authenticated` har bare direkte `SELECT`; ingen direkte INSERT/UPDATE/DELETE.
- Intern skriving skjer via kontrollerte `SECURITY DEFINER`-RPC-er.
- Hver intern RPC krever aktiv bruker, faktisk `current_sales_company_scope_id()`, riktig tilbud og riktig akseptert versjon.
- Kontrakt-RPC-ene aksepterer ikke `support_company_id`; systemadmin support kan derfor ikke skrive kontrakt på vegne av annet firma uten reell medlemskapsscope.
- Offentlig kundelesing/signering skjer via unik kontrakttoken og RPC, ikke direkte tabelltilgang.
- Signert snapshot/signaturhistorikk beskyttes av database-trigger.
- Ingen DELETE-flyt for kontrakthistorikk.

Supabase-advisor varsler generisk når en `SECURITY DEFINER`-funksjon er tilgjengelig for `anon` eller `authenticated`. For de eksplisitte kontrakt-RPC-ene er dette forventet og kontrollert; ikke fjern nødvendige grants blindt uten å forstå kundetoken-/write-modellen.

### Migrasjoner

```text
20260831190622  fase33b2_sales_contract_foundation
20260831190713  fase33b2_contract_offer_version_index
```

Rollback-QA er gjennomført mot eksisterende akseptert tilbud:

```text
Expo: create → save → bedriftssignering → anonym lesing → kundesignering → endelig dokument
External: register → void
```

Testdata ble rullet tilbake. Ingen historiske kontrakter ble opprettet/backfillet.

## Produktretning for kontrakt

Kommende UI skal være enkel og brukerfokusert:

```text
Akseptert tilbud
→ Velg kontrakt
   ├─ Opprett enkel kontrakt i Expo ProffDok
   ├─ Last opp egen kontrakt
   └─ Fortsett uten kontrakt (ikke garantibad)
→ få steg med mest mulig autofyll
→ samlet dokument
→ bedrift signerer
→ kunde signerer
```

Besluttet retning:

- Kontrakt er frivillig for vanlige prosjekter.
- Ikke-garantiprosjekter skal også frivillig kunne bruke Expo-kontrakten.
- Garantibad skal senere kreve enten signert Expo-kontrakt eller bekreftet ekstern kontrakt før garanti kan utstedes.
- Standard betalingsforslag: 40 % ved oppstart, 40 % ved naturlig hovedmilepæl, 20 % etter overtagelse; redigerbart av bruker.
- 2 G brukes som relevant informasjon, ikke som teknisk sperre eller hardkodet beløp.
- Expo skal ikke kopiere Standard Norge/NS-forbrukerblanketter.
- Relevante hjelpelinker kan peke til Forbrukerrådet, uten logo eller påstand om godkjenning.
- Kontrakt/PDF skal følge Expo ProffDok-design, firmalogo og firmasnapshot.

## Prosjektaktivering

Ved aktivering overføres relevant salgshistorikk til prosjektet via blant annet `project.salesOrigin`, akseptbevis og dokumenter.

Kontrakt skal i senere runde knyttes til prosjektets eksisterende «Tilbud / kontrakt»-område uten å overskrive opprinnelig avtale. Senere tillegg/fradrag forblir separate endringer.

## Storage

Dagens eksterne kontraktopplasting bruker eksisterende Storage-flyt. `project-images` er offentlig og dette er kjent sikkerhets-/personvernsgjeld.

Fase 33B.2 endrer **ingen** Storage-policy og flytter ingen historiske filer. Lagring av nye ferdig signerte Expo-kontrakt-PDF-er avgjøres før 33B.5 med egen plan.

## HJELP-regel

Fase 33B.2 er rent teknisk og synlig arbeidsflyt er uendret. **HJELP trenger ikke oppdatering i denne runden.**

Når kontraktveiviseren blir brukerrettet, skal HJELP oppdateres samme runde.

## Videre implementering

```text
33B.2  servermodell/RLS/RPC                 ← ferdig servergrunnlag
33B.3  intern steg-for-steg-veiviser/autofyll
33B.4  kundelenke + begge signaturer
33B.5  endelig PDF + prosjektets Tilbud/kontrakt
33B.6  garantikobling + full HJELP/dokumentasjon
```
