# Expo ProffDok – Befaring / Tilbud / Aksept

**Status:** Produksjonskoblet modul  
**Oppdatert:** Fase 33B.3 – 31.08.2026

Sales håndterer salgsflyten fra forespørsel til eventuelt ProffDok-prosjekt. Fase 33B.3 kobler den nye, enkle forbrukerkontrakten på internt etter akseptert tilbud, samtidig som eksisterende opplasting av egen kontrakt og prosjektaktivering beholdes.

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
   ├─ Opprett / åpne enkel kontrakt i Expo ProffDok
   └─ Last opp egen kontrakt (eksisterende flyt)
→ aktivering som ProffDok-prosjekt
```

Tilbud kan også opprettes uten befaring. Vanlige prosjekter kan fortsatt aktiveres uten kontrakt. Garantibad får kontraktkrav i en senere, egen garantikobling – ikke i denne runden.

## Viktige prinsipper

- Mobil først.
- Registrer informasjon én gang og gjenbruk den.
- Publiserte tilbudsversjoner overskrives aldri.
- Kundeaksept knyttes til eksakt tilbudsversjon og valgte opsjoner.
- Ny tilbudsversjon etter aksept skal bevare tidligere aksept/historikk.
- Kontrakt er egen historikk og skal aldri mutere akseptert tilbud.
- Sak og ProffDok-prosjekt er separate objekter.
- Prosjekter uten Expo-tilbud eller Expo-kontrakt er gyldige.
- Privatkundeorienterte priser vises inkl. mva.
- Ingen historisk backfill uten eksplisitt beslutning.
- Supportmodus er ikke skrive-bypass.
- Eksisterende Sales recovery/hydration og befaringsbildenes IndexedDB-sikring skal ikke svekkes.

## Struktur

`SalesModule.jsx` er inngang/wrapper. Hovedorkestrering ligger i `SalesModuleCore.jsx`.

```text
src/modules/sales/
├── SalesModule.jsx
├── SalesModuleCore.jsx
├── components/
│   ├── SalesDetailView.jsx
│   ├── SalesContractWizard.jsx
│   └── ...
├── services/
│   ├── salesContracts.js
│   └── ...
├── utils/
│   ├── salesContractModel.js
│   └── ...
└── sales.css
```

Fase 33B.3 er bevisst koblet inn gjennom den eksisterende `SalesDetailView.jsx`-wrapperen. `SalesDetailViewCore.jsx`, den gamle kontraktopplastingen og `SalesProjectActivation.jsx` er ikke skrevet om. Dette reduserer regresjonsrisiko og bevarer tidligere funksjonalitet.

Ikke splitt Sales bare for å redusere filstørrelse. Nye grenser skal gi reell oversikt, testbarhet eller vedlikeholdsgevinst.

## Kritisk recovery/hydration

Sales har flere vern mot datatap:

- serverlagret arbeidskopi i `sales_requests.payload`
- lokal tilbudskladd
- kontrollert hydrering før autosave
- gjenoppretting ved reload/appbytte
- IndexedDB/lokal sikring av befaringsbilder
- `scripts/critical-sales-recovery-check.mjs` i build

En tom eller uhydrert tilbudskladd må aldri kunne overskrive nyere serverdata. Kontraktveiviseren har egen serverlagring og skal ikke blandes inn i tilbudskladdens recovery.

## Supabase-klient

Sales bruker delt browser-Supabase-klient. `SalesContractWizard` bruker samme klient via `createDefaultSalesSupabaseClient()` og oppretter ikke en parallell GoTrue/Auth-klient.

## Publisering og aksept

Sentrale eksisterende RPC-kontrakter:

```text
resolve_sales_company_scope()
publish_sales_offer(payload jsonb)
get_sales_offer_by_token(token uuid)
accept_sales_offer(...)
```

Publisert tilbud og aksept er historikk. Akseptbevis og tidligere aksepterte versjoner muteres ikke av kontraktveiviseren.

## Servermodell for kontrakt – Fase 33B.2

Supabase-tabell:

```text
sales_contracts
```

Tabellen er knyttet til faktisk Sales-firma, salgssak, tilbud og **eksakt akseptert tilbudsversjon**.

Kilder:

```text
expo      – kontrakt opprettet i Expo ProffDok
external  – ekstern/opplastet kontrakt
```

Status:

```text
draft
awaiting_customer
signed
external_confirmed
void
```

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
- Intern kontraktskriving krever aktiv bruker, faktisk `current_sales_company_scope_id()`, riktig tilbud og riktig akseptert versjon.
- Kontrakt-RPC-ene aksepterer ikke `support_company_id`; systemadmin-support er ikke skrive-bypass.
- Offentlig kundelesing/signering skal skje via unik kontrakttoken og RPC, ikke direkte tabelltilgang.
- Signert snapshot/signaturhistorikk beskyttes av database-trigger.
- Ingen DELETE-flyt for kontrakthistorikk.

Supabase-advisor varsler generisk om eksplisitte `SECURITY DEFINER`-RPC-er. Ikke fjern nødvendige grants blindt uten å forstå kunde-token- og write-modellen.

### Migrasjoner

```text
20260831190622  fase33b2_sales_contract_foundation
20260831190713  fase33b2_contract_offer_version_index
```

Ingen migrasjon, RLS- eller Storage-policy endres i Fase 33B.3.

## Fase 33B.3 – intern kontraktsveiviser

På en akseptert salgssak viser dagens eksisterende kontraktkort nå et nytt, frivillig valg:

```text
Opprett / åpne enkel kontrakt
```

Den eksisterende funksjonen:

```text
Last opp egen kontrakt
```

beholdes urørt.

### Steg 1 – Grunnlag

Autofyll fra eksisterende data:

- utførende firma og organisasjonsnummer
- firmalogo/profil
- kunde
- prosjektadresse
- eksakt akseptert tilbudsversjon
- avtalesum inkl. mva.
- inkludert / ikke inkludert / kundens egne leveranser når dette finnes i tilbudet

Akseptert tilbud og valgte opsjoner forblir låst historikk.

### Steg 2 – Tid og betaling

Brukeren fyller i hovedsak bare:

- planlagt oppstart
- forventet ferdigstillelse
- eventuelt annen prisform enn standard fastpris

Standard betalingsforslag er redigerbart:

```text
40 % ved faktisk oppstart – umiddelbart forfall
40 % ved naturlig hovedmilepæl
20 % etter ferdigstillelse og signert overtagelse
```

Betalingsplanen må samlet være 100 %.

### Steg 3 – Avtalevalg

Få valg:

- hvordan avtalen inngås
- eventuell tidlig oppstart før angrefrist er ute
- eventuell særskilt dagmulkt
- eventuelle særskilte avtalevilkår

Veiviseren lenker til relevante Forbrukerrådet-sider om håndverker og angrerett. Lenken er kun informasjon. Expo ProffDok bruker ikke Forbrukerrådets logo og fremstiller ikke kontrakten som godkjent av Forbrukerrådet.

### Steg 4 – samlet dokument

Veiviseren ender i ett samlet kontraktsutkast i Expo ProffDok-design med firmasnapshot/logo. Utkastet kan lagres på server.

**Fase 33B.3 sender ikke kontrakten til kunde, signerer ikke på vegne av partene og lager ikke endelig kontrakt-PDF.** Dette kommer i egne kontrollerte runder.

Hvis et Expo-utkast allerede finnes for samme aksepterte versjon, åpnes det igjen. Hvis serveren allerede har en ekstern kontrakt eller en kontrakt som er sendt/signert, får veiviseren ikke skrive over den.

## Ekstern kontrakt – eksisterende funksjon

Dagens `contractFile`-opplasting beholdes nøyaktig som tidligere og følger fortsatt saken til prosjektets «Tilbud / kontrakt» ved aktivering.

Viktig overgangstilstand: den gamle opplastingsflyten er **ikke koblet til `sales_contracts` ennå**. `register_external_sales_contract(...)` finnes på server, men UI-koblingen tas i en senere runde før garantikrav aktiveres. Gamle `contractFile`-data er gyldig legacy og backfilles ikke.

## Prosjektaktivering

Dagens prosjektaktivering er urørt i Fase 33B.3. Brukeren kan fortsatt aktivere et vanlig prosjekt uten Expo-kontrakt, og eksisterende opplastet `contractFile` følger som før.

Expo-kontraktsutkastet overføres ikke til prosjektet i denne runden. Endelig, signert dokument og prosjektkobling kommer i Fase 33B.5.

## Storage

Dagens eksterne kontraktopplasting bruker eksisterende Storage-flyt. `project-images` er offentlig og dette er kjent sikkerhets-/personvernsgjeld.

Fase 33B.3 endrer ingen Storage-policy og lagrer ingen ny PDF-fil. Endelig lagringsstrategi for signerte Expo-kontrakter avgjøres før Fase 33B.5 uten å bryte historiske URL-er.

## HJELP

Fase 33B.3 er brukerrettet. HJELP er derfor oppdatert samme runde med:

- valg mellom Expo-kontrakt og egen kontrakt
- autofyll
- 40/40/20-forslaget
- samlet dokument
- at akseptert tilbud ikke endres
- at dagens opplasting og prosjektaktivering fortsatt fungerer

## Videre implementering

```text
33B.2  servermodell/RLS/RPC                  ← ferdig
33B.3  intern steg-for-steg-veiviser/autofyll ← denne runden
33B.4  kundelenke + begge signaturer
33B.5  endelig PDF + prosjektets Tilbud/kontrakt
33B.6  garantikobling + slutt-QA/dokumentasjon
```

Alle videre runder skal bevare dagens tilbud, aksept, ekstern kontraktopplasting, recovery og prosjektaktivering til ny funksjon er separat testet og godkjent.
