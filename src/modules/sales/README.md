# Expo ProffDok – Befaring / Tilbud / Aksept / Kontrakt

**Status:** Produksjonskoblet Sales-modul  
**Oppdatert:** Fase 33B.4 – 31.08.2026

Sales håndterer flyten fra forespørsel til eventuelt ProffDok-prosjekt. Etter akseptert tilbud kan brukeren frivillig opprette en enkel Expo-kontrakt, laste opp egen kontrakt eller – for vanlige prosjekter – gå videre uten kontrakt. Eksisterende tilbud, aksept, recovery, ekstern kontraktopplasting og prosjektaktivering skal fortsatt fungere.

## Hovedflyt

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
   └─ Last opp egen kontrakt (eksisterende flyt)
→ aktivering som ProffDok-prosjekt
```

Tilbud kan også opprettes uten befaring. Prosjekter uten Expo-tilbud eller Expo-kontrakt er fortsatt gyldige. Kontrakt blir obligatorisk for garantibad først i en senere garantikobling.

## Styrende prinsipper

- Publiserte tilbudsversjoner og kundeaksept overskrives aldri.
- Kontrakt er egen historikk og muterer ikke akseptert tilbud.
- Kundeaksept knyttes til eksakt tilbudsversjon og valgte opsjoner.
- Privatkundeorienterte priser vises inkl. mva.
- Ingen historisk backfill uten eksplisitt beslutning.
- RLS/server er sikkerhetsgrensen; frontend er ikke tilgangskontroll.
- Supportmodus er ikke skrive-bypass.
- Sales recovery/hydration og IndexedDB-sikring av befaringsbilder skal ikke svekkes.
- Eksisterende `contractFile` er gyldig legacy og skal ikke flyttes eller backfilles tilfeldig.

## Struktur

```text
src/modules/sales/
├── SalesModule.jsx
├── SalesModuleCore.jsx
├── components/
│   ├── SalesDetailView.jsx
│   ├── SalesContractWizard.jsx
│   ├── SalesContractWizardCore.jsx
│   ├── SalesContractDocument.jsx
│   ├── SalesContractDocumentCore.jsx
│   ├── SalesContractCustomerView.jsx
│   └── ...
├── services/
│   ├── salesContracts.js
│   └── ...
├── utils/
│   ├── salesContractModel.js
│   └── ...
└── sales.css
```

Ansvarsgrensene er bevisste:

- `SalesContractWizardCore.jsx` = testet 33B.3-veiviser, utfylling og lokal session-recovery.
- `SalesContractWizard.jsx` = kontraktens livsløp etter lagring: bedriftssignatur, låsing, kundelenke og status.
- `SalesContractDocumentCore.jsx` = avtaleteksten fra 33B.3.
- `SalesContractDocument.jsx` = dynamisk signaturstatus og profesjonell elektronisk avslutning.
- `SalesContractCustomerView.jsx` = offentlig tokenstyrt, read-only kundevisning og kundesignering.
- `SalesModule.jsx` = liten routing-wrapper; eksisterende Sales Core er ikke skrevet om.

Dette er naturlige ansvargrenser, ikke fragmentering for filstørrelsens skyld.

## Kritisk recovery/hydration

Sales har vern mot datatap gjennom serverlagret arbeidskopi, lokal tilbudskladd, kontrollert hydrering, reload/appbytte-recovery og IndexedDB-sikring av befaringsbilder. `scripts/critical-sales-recovery-check.mjs` kjører i build.

En tom eller uhydrert tilbudskladd må aldri kunne overskrive nyere serverdata. Kontraktens serverlagring er separat fra tilbudskladdens recovery.

Ulagrede kontraktfelt og aktivt veivisersteg sikres i `sessionStorage` per salgssak/akseptert tilbudsversjon. Serverlagring skjer først når brukeren eksplisitt velger `Lagre kontraktsutkast`.

## Servermodell – `sales_contracts`

Hver kontrakt knyttes til faktisk Sales-firma, salgssak, tilbud og **eksakt akseptert tilbudsversjon**.

```text
source: expo | external
status: draft | awaiting_customer | signed | external_confirmed | void
```

Viktige serverfelt omfatter snapshot, unik `customer_token`, firma-/kundesignaturmetadata, ekstern dokumentreferanse og senere endelig dokumentreferanse.

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
```

- `sales_contracts` har RLS.
- `authenticated` har bare direkte SELECT; ordinære writes går via kontrollerte SECURITY DEFINER-RPC-er.
- Intern kontraktskriving krever aktiv bruker og faktisk `current_sales_company_scope_id()`.
- Kontrakt-RPC-ene aksepterer ikke `support_company_id`; systemadmin-support er ikke skrive-bypass.
- Offentlig kunde leser/signerer bare via unik kontrakttoken og RPC, ikke direkte tabelltilgang.
- Signert snapshot/signaturhistorikk beskyttes server-side.
- Ingen normal DELETE-flyt for kontrakthistorikk.

### Migrasjoner

```text
20260831190622  fase33b2_sales_contract_foundation
20260831190713  fase33b2_contract_offer_version_index
20260831210107  fase33b4_company_signature_validation
20260831210119  fase33b4_customer_signature_acknowledgements
```

33B.4-migrasjonene strammer signeringsvalidering; de endrer ikke tilbudsdata, prosjektdata eller Storage.

## Expo-kontrakt – utfylling

Veiviseren autofyller firma, org.nr., kunde, prosjektadresse, eksakt akseptert tilbudsversjon og avtalesum inkl. mva. Brukeren fyller primært:

- avtalt oppstart
- forventet varighet i uker
- eventuell alternativ prisform
- redigerbar 40/40/20-betalingsplan
- avtaleform
- eventuell tidlig oppstart før angrefrist
- eventuell avtalt dagmulkt og tilleggsfrist
- eventuelle særvilkår

Beregnet forventet ferdigstillelse er et avledet felt. Dagmulkt skal bare gjelde forsinkelse utførende firma svarer for; dokumenterte forhold på kundens side som gir rett til fristforlengelse forskyver fristen.

## 33B.4 – bedriftssignering og låsing

Et lagret Expo-utkast kan redigeres så lenge status er `draft`.

Før bedriften kan signere kontrollerer serveren blant annet:

- fortsatt samme eksakte aksepterte tilbudsversjon
- prisform
- avtalt oppstart
- forventet varighet og beregnet ferdigstillelse
- avtaleform
- betalingsplan som summerer til 100 %
- dagmulkttekst/tilleggsfrist når dagmulkt er valgt

Bedriften må i UI bekrefte at kontrakten er kontrollert og at innlogget bruker signerer på vegne av bedriften. Navn og tidspunkt settes av serveren. Status går deretter til `awaiting_customer`, og kontrakten er read-only i denne flyten.

## Sikker kundelenke og e-post

Kundelenken bruker en unik `customer_token`. Offentlig routing skjer gjennom eksisterende public Sales-inngang med:

```text
?publicOffer=<tilbudstoken eller routingmarkør>&publicContract=<kontrakttoken>
```

`publicContract` er sikkerhetsnøkkelen for kontrakten; `publicOffer` brukes bare for å gå inn i eksisterende offentlig Sales-routing. Eldre aksepterte saker uten historisk tilbudstoken får en ikke-sensitiv routingmarkør.

Etter bedriftssignering kan brukeren:

- sende kontrakten til kundens registrerte Sales-e-post
- åpne kundelenken selv
- kopiere kundelenken

E-post sendes gjennom `smart-worker` med direction `sales_contract`. Samme Sales-mottakerkontroll som tilbud/befaringsmail brukes: innlogget aktiv bruker må ha tilgang til en Sales-sak med mottakerens e-post. E-postfeil endrer ikke kontraktstatusen og låser ikke opp dokumentet.

## Kundesignering

Kunden får en read-only visning av det samme låste snapshotet. Før signering må kunden:

1. bekrefte at kontrakten er lest og akseptert
2. bekrefte at tidligere akseptert tilbud med valgte opsjoner og vedlegg inngår i avtalegrunnlaget
3. dersom tidlig oppstart er registrert: uttrykkelig bekrefte ønsket om oppstart før eventuell angrefrist er utløpt
4. skrive fullt navn

Serveren avviser signering hvis obligatoriske bekreftelser mangler. Ved gyldig signering lagres kundenavn, tidspunkt og acknowledgements, og status går til `signed`.

Begge signaturer vises deretter i kontraktdokumentet. Signert kontrakt og signaturhistorikk skal ikke redigeres.

## Kontraktdokumentet

Dokumentet viser tydelig låst kundeaksept, tilbudsversjon, aksepttidspunkt, avtalesum inkl. mva., valgte opsjoner og avtalegrunnlaget. Kontrakten dekker blant annet parter/prosjekt, omfang, pris/fremdrift/betaling, endringer, ansvar, skjulte forhold, forsinkelse/mangler, overtagelse, angrerett, særvilkår, dokumentrekkefølge og signaturer.

Avslutningen bruker profesjonell tekst om **elektronisk avtalegrunnlag**. Den lange interne forklaringen om hva kontrakten ikke er, vises ikke i kundedokumentet. Expo ProffDok skal fortsatt ikke markedsføre kontrakten som Standard Norge-/NS-blankett eller Forbrukerrådet-godkjent.

## Ekstern kontrakt – eksisterende funksjon

Dagens `contractFile`-opplasting beholdes. Den følger fortsatt saken til prosjektets «Tilbud / kontrakt» ved aktivering.

Overgangstilstand: eksisterende upload-UI er ennå ikke koblet til `sales_contracts`. `register_external_sales_contract(...)` finnes på server. Gamle `contractFile`-data er gyldige og backfilles ikke.

## Prosjektaktivering og Storage

Prosjektaktivering er fortsatt urørt. Vanlig prosjekt kan aktiveres uten Expo-kontrakt, og eksisterende ekstern kontrakt følger som før.

33B.4 lager **ikke endelig kontrakt-PDF** og overfører ikke Expo-kontrakten til prosjektets «Tilbud / kontrakt». Dette er 33B.5.

Ingen Storage-policy endres i 33B.4. Historiske Storage-URL-er skal bevares.

## HJELP

HJELP beskriver nå hele brukerflyten fra frivillig Expo-kontrakt til bedriftssignatur, sikker kundelenke/e-post, obligatoriske kundebekreftelser og låst signert status. Den presiserer også at endelig PDF/prosjektkobling kommer senere, mens egen kontraktopplasting og prosjektaktivering fortsatt fungerer.

## QA for 33B.4

Serverløpet er testet transaksjonelt mot testsaken F-2026-0042:

```text
opprett utkast
→ lagre
→ bedriftssigner
→ offentlig tokenlesing
→ manglende tidlig-oppstart-bekreftelse avvises
→ gyldig kundesignering
→ begge signaturtidspunkter kan leses
→ ROLLBACK
```

Ingen QA-kontraktrad ble stående etter rollback.

## Videre

```text
33B.2  servermodell/RLS/RPC                         ← ferdig
33B.3  intern steg-for-steg-veiviser/autofyll       ← ferdig
33B.4  bedriftssignatur + kundelenke + kundesignering ← denne runden
33B.5  endelig PDF + prosjektets Tilbud / kontrakt
33B.6  garantikobling + slutt-QA/dokumentasjon
```
