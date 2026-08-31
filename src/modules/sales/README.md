# Expo ProffDok – Befaring / Tilbud / Aksept / Kontrakt

**Status:** Produksjonskoblet Sales-modul  
**Oppdatert:** Fase 33B.5 – 31.08.2026

Sales håndterer flyten fra forespørsel til eventuelt ProffDok-prosjekt. Etter akseptert tilbud kan brukeren frivillig opprette en enkel Expo-kontrakt, laste opp egen kontrakt eller gå videre uten kontrakt. Prosjekt kan også opprettes direkte uten Sales/tilbud. Eksisterende tilbud, aksept, recovery, ekstern kontraktopplasting og prosjektaktivering skal fortsatt fungere.

## Gyldige prosjektveier

Alle disse er gyldige normaltilstander:

```text
A) Direkte prosjekt uten tilbud
   → ProffDok-prosjekt
   → Avtalegrunnlag kan være tomt til dokumenter/endringer eventuelt registreres senere

B) Akseptert tilbud
   → ingen kontrakt
   → ProffDok-prosjekt

C) Akseptert tilbud
   → egen opplastet kontrakt
   → ProffDok-prosjekt

D) Akseptert tilbud
   → Expo ProffDok-kontrakt
   → bedriftssignatur
   → kundesignatur
   → endelig privat PDF
   → ProffDok-prosjekt
```

Kontrakt eller tilbud er altså ikke generelle krav for å opprette prosjekt. Eventuelt kontraktkrav for garantibad håndteres særskilt i 33B.6 og skal ikke endre vanlige prosjekter.

## Sales-hovedflyt

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
   ├─ Expo ProffDok-kontrakt
   │  → utkast
   │  → bedriften kontrollerer og signerer
   │  → awaiting_customer / låst kontraktsgrunnlag
   │  → sikker kundelenke / e-post
   │  → kunden bekrefter og signerer
   │  → signed / begge signaturer låst
   │  → endelig privat PDF fra låst servergrunnlag
   │  → Avtalegrunnlag på eksisterende eller senere prosjekt
   ├─ Last opp egen kontrakt (eksisterende flyt)
   └─ Fortsett uten kontrakt
→ aktivering som ProffDok-prosjekt
```

Tilbud kan også opprettes uten befaring.

## Styrende prinsipper

- Publiserte tilbudsversjoner og kundeaksept overskrives aldri.
- Kontrakt er egen historikk og muterer ikke akseptert tilbud.
- Kundeaksept knyttes til eksakt tilbudsversjon og valgte opsjoner.
- Prosjekt uten tilbud er gyldig.
- Prosjekt uten kontrakt er gyldig utenfor særskilt fremtidig garantikrav.
- Privatkundeorienterte priser vises inkl. mva.
- Ingen historisk backfill uten eksplisitt beslutning.
- RLS/server er sikkerhetsgrensen; frontend er ikke tilgangskontroll.
- Supportmodus er ikke skrive-bypass.
- Sales recovery/hydration og IndexedDB-sikring av befaringsbilder skal ikke svekkes.
- Eksisterende `contractFile` er gyldig legacy og skal ikke flyttes eller backfilles tilfeldig.
- Endelig Expo-kontrakt-PDF genereres kun fra serverlåst `sales_contracts.snapshot` og signaturmetadata, aldri fra redigerbar lokal kladd.
- Brukerflaten heter **Avtalegrunnlag**, mens eksisterende intern prosjekt-/tabnøkkel `tilbud` og `data.tilbud` beholdes for bakoverkompatibilitet.

## Struktur

```text
src/modules/sales/
├── SalesModule.jsx
├── SalesModuleCore.jsx
├── components/
│   ├── SalesDetailView.jsx
│   ├── SalesContractActions.jsx
│   ├── SalesContractWizard.jsx
│   ├── SalesContractWizardCore.jsx
│   ├── SalesContractDocument.jsx
│   ├── SalesContractDocumentCore.jsx
│   ├── SalesContractCustomerView.jsx
│   └── ...
├── services/
│   ├── salesContracts.js
│   ├── salesContractPdf.js
│   └── ...
├── utils/
│   ├── salesContractModel.js
│   └── ...
└── sales.css
```

Ansvarsgrensene er bevisste:

- `SalesContractActions.jsx` = fast kontraktflate på Sales-saken, kundelenke og idempotent sluttarkivering.
- `SalesContractWizardCore.jsx` = testet veiviser, utfylling og lokal session-recovery.
- `SalesContractWizard.jsx` = bedriftssignatur, låsing, kundelenke/e-post og signeringsstatus.
- `SalesContractDocumentCore.jsx` = avtaleteksten.
- `SalesContractDocument.jsx` = reell signaturstatus og profesjonell elektronisk avslutning.
- `SalesContractCustomerView.jsx` = offentlig tokenstyrt, read-only kundevisning og kundesignering.
- `salesContractPdf.js` = profesjonell A4-slutt-PDF fra låst kontraktsrad, med tilbuds-/akseptvedlegg.
- `salesContracts.js` = RPC-klient, privat PDF-arkivering og prosjektsynk.
- `SalesModule.jsx` = liten routing-wrapper; eksisterende Sales Core er ikke skrevet om.

Dette er naturlige ansvargrenser, ikke fragmentering for filstørrelsens skyld.

## Kritisk recovery/hydration

Sales har vern mot datatap gjennom serverlagret arbeidskopi, lokal tilbudskladd, kontrollert hydrering, reload/appbytte-recovery og IndexedDB-sikring av befaringsbilder. `scripts/critical-sales-recovery-check.mjs` kjører i build.

En tom eller uhydrert tilbudskladd må aldri kunne overskrive nyere serverdata. Kontraktens serverlagring er separat fra tilbudskladdens recovery.

Ulagrede kontraktfelt og aktivt veivisersteg sikres i `sessionStorage` per salgssak/akseptert tilbudsversjon. Serverlagring skjer først når brukeren eksplisitt velger `Lagre kontraktsutkast`.

## Servermodell – `sales_contracts`

Hver Expo-/ekstern Sales-kontrakt knyttes til faktisk Sales-firma, salgssak, tilbud og **eksakt akseptert tilbudsversjon**. Tabellen brukes ikke for direkte prosjekter uten tilbud.

```text
source: expo | external
status: draft | awaiting_customer | signed | external_confirmed | void
```

Viktige felt omfatter låst snapshot, unik `customer_token`, firma-/kundesignaturmetadata, ekstern dokumentreferanse og `final_document`.

Kontraktsnapshotet bruker `schema_version: 2` og inneholder blant annet:

```text
start_date                     ← avtalt oppstart
expected_duration_weeks        ← brukerfelt
expected_finish_date           ← beregnet
daily_penalty_agreed
daily_penalty_grace_days       ← avtalt tilleggsfrist
daily_penalty_text
payment_plan
agreement_channel
early_start_requested
```

Ingen historisk databasebackfill kjøres.

## RPC-er og sikkerhet

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

- `sales_contracts` har RLS.
- `authenticated` har bare direkte SELECT; ordinære writes går via kontrollerte SECURITY DEFINER-RPC-er.
- Intern kontraktskriving krever aktiv bruker og faktisk `current_sales_company_scope_id()`.
- Kontrakt-RPC-ene aksepterer ikke `support_company_id`; systemadmin-support er ikke skrive-bypass.
- Offentlig kunde leser/signerer bare via unik kontrakttoken og RPC, ikke direkte tabelltilgang.
- Signert snapshot/signaturhistorikk beskyttes server-side.
- `final_document` kan settes én gang på signert kontrakt og er deretter immutable.
- Ingen normal DELETE-flyt for kontrakthistorikk.

### Migrasjoner

```text
20260831190622  fase33b2_sales_contract_foundation
20260831190713  fase33b2_contract_offer_version_index
20260831210107  fase33b4_company_signature_validation
20260831210119  fase33b4_customer_signature_acknowledgements
20260831215906  fase33b5_sync_final_contract_to_project
20260831220648  fase33b5_project_contract_auto_link
```

33B.5-migrasjonene er additive. De endrer ikke historiske tilbud/kontrakter og flytter ingen Storage-filer.

## Expo-kontrakt – utfylling og signering

Veiviseren autofyller firma, org.nr., kunde, prosjektadresse, eksakt akseptert tilbudsversjon og avtalesum inkl. mva. Brukeren fyller primært avtalt oppstart, forventet varighet, betalingsplan, avtaleform og eventuelle særvilkår/dagmulkt.

Beregnet forventet ferdigstillelse er avledet. Dagmulkt skal bare gjelde forsinkelse utførende firma svarer for; dokumenterte forhold på kundens side som gir rett til fristforlengelse forskyver fristen.

Bedriften signerer først. Serveren setter signaturnavn/tidspunkt og låser snapshotet. Kunden får sikker tokenlenke, bekrefter kontrakten og akseptert tilbudsgrunnlag og signerer med fullt navn. Ved registrert tidlig oppstart kreves særskilt kundebekreftelse.

Når begge har signert er status `signed`. Åpner kunden lenken på nytt vises ferdigstatus; ny signering er ikke mulig.

## 33B.5 – fast kontraktflate på Sales-saken

Kontraktkortet henter aktiv Expo-kontrakt for den eksakte aksepterte tilbudsversjonen. Når kontrakten finnes vises uten ekstra navigasjon:

- kontraktsstatus
- `Åpne kontrakt`
- `Åpne kundelenke`
- `Kopier kundelenke`
- `Åpne signert PDF` når slutt-PDF finnes

Eksisterende `Last opp egen kontrakt` beholdes, og vanlig prosjektaktivering uten kontrakt beholdes. Hvis bare legacy `contractFile` finnes, påvirkes ikke den flyten.

Systemadministrator i Sales-supportmodus får ingen automatisk sluttarkivering. Supportmodus er eksplisitt ikke skrive-bypass.

## Endelig signert PDF og komplett tilbudsgrunnlag

Når en ordinær innlogget firmabruker åpner en Sales-sak med signert Expo-kontrakt og `final_document` mangler, kjøres idempotent ferdigstilling:

1. PDF genereres fra låst `sales_contracts.snapshot` og registrerte signaturer.
2. PDF lagres privat under logisk `sales-contracts/...` i `project-documents-private` via eksisterende Storage-oversettelse.
3. `attach_sales_contract_final_document(...)` låser dokumentreferansen på kontrakten.
4. `sync_sales_contract_final_document_to_project(...)` kobler den til eventuelt allerede aktivert prosjekt.
5. Dersom prosjektet aktiveres senere, database-triggeren `trg_projects_link_signed_sales_contract` legger samme dokumentreferanse i prosjektets `data.tilbud.files`.

Hvis PDF allerede finnes, genereres den ikke på nytt. Prosjektsynk kan trygt kjøres igjen.

PDF-en inneholder:

- kontraktens avtalepunkter
- begge signaturer med navn/tidspunkt
- låst kundeaksept
- Vedlegg A: eksakt akseptert tilbudsversjon og kundens valgte opsjoner
- Vedlegg B: aksept- og signatursporbarhet
- priser til privatkunde inkl. mva.

Vedlegg A viderefører kundesynlig tilbudsinnhold fra den låste versjonen når det finnes:

```text
tilbudsintro
forutsetninger og forbehold
inkludert
ikke inkludert
kundens egne leveranser
vilkår
betalingsbetingelser
tilbudsposter
valgte opsjoner
```

Dette innholdet hentes fra snapshotet av tilbudsversjonen kunden faktisk aksepterte. Det skrives ikke om eller rekonstrueres fra en senere kladd. Gamle aksepterte tilbud som ikke hadde slike felt lagret får ingen historisk etterfylling.

## Prosjektets «Avtalegrunnlag»

Brukerflaten som tidligere het `Tilbud/kontrakt` heter nå **Avtalegrunnlag**. Intern nøkkel `tilbud` og `data.tilbud` beholdes uendret for bakoverkompatibilitet.

Avtalegrunnlag kan inneholde:

- akseptert tilbud / Sales-opprinnelse
- låst akseptbevis
- signert Expo-kontrakt
- egen opplastet kontrakt eller annet avtaledokument
- senere tillegg og fradrag

Direkte prosjekt uten tilbud viser en normal tom starttilstand. Det er ikke en feil og krever ingen opplasting. Prosjekt med akseptert tilbud kan også fortsette uten kontrakt.

For Expo-kontrakt:

- eksisterende ulåst prosjekt med samme `company_scope_id` og `salesOrigin.requestRef` kan oppdateres idempotent gjennom RPC
- nytt/senere prosjekt får slutt-PDF gjennom server-triggeren
- prosjektspesifikk privat dokument-URL bruker samme eksisterende kundeportal-/tilgangskodeflyt
- låste prosjekter oppdateres ikke av RPC-en

Ingen Storage-objekter flyttes eller dupliseres når dokumentet kobles til prosjektet; prosjektet får en referanse til samme private PDF.

## HJELP

HJELP beskriver nå de fire gyldige prosjektveiene, Avtalegrunnlag-terminologien, komplett videreføring av lagret kundesynlig tilbudsgrunnlag, slutt-PDF og automatisk prosjektkobling. Egen kontraktopplasting, ingen-kontrakt-flyt og direkte prosjekt uten tilbud består.

## QA for 33B.5

Serverkoblingen er testet med rollback mot den eksisterende signerte testsaken F-2026-0042:

```text
midlertidig final_document
→ midlertidig prosjekt med samme company_scope + requestRef
→ trigger legger 1 kontraktdokument i data.tilbud.files
→ dokumentet får project-bundet privat URL
→ ROLLBACK
→ QA-prosjekt = 0
→ testens final_document = 0
```

Den virkelige F-2026-0042 er en eldre testversjon uten lagrede tilbudsvilkår i v10. Den brukes derfor ikke som bevis på hvordan nyere tilbud med vilkår rendres, og historikken backfilles ikke.

## Videre

```text
33B.2  servermodell/RLS/RPC                           ← ferdig
33B.3  intern steg-for-steg-veiviser/autofyll         ← ferdig
33B.4  bedriftssignatur + kundelenke + kundesignering ← ferdig
33B.5  slutt-PDF + Avtalegrunnlag + prosjektkobling   ← denne runden
33B.6  garantikobling + slutt-QA/dokumentasjon
```
