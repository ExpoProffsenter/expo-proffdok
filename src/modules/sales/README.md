# Expo ProffDok – Befaring / Tilbud / Aksept / Kontrakt

**Status:** Produksjonskoblet Sales-modul  
**Oppdatert:** Fase 33B.6 – 01.09.2026

Sales håndterer flyten fra forespørsel til eventuelt ProffDok-prosjekt. Etter akseptert tilbud kan brukeren frivillig opprette Expo-kontrakt, laste opp egen kontrakt eller gå videre uten kontrakt. Prosjekt kan også opprettes direkte uten Sales/tilbud.

**Kontrakt er ikke et generelt prosjektkrav.** Fase 33B.6 innfører kun et særskilt krav når dokumentert tetthetsgaranti faktisk skal utstedes: da må signert Expo-kontrakt eller bedriftens egen signerte kontrakt ligge i prosjektets Avtalegrunnlag.

## Gyldige prosjektveier

```text
A) Direkte prosjekt uten tilbud
B) Akseptert tilbud → prosjekt uten kontrakt
C) Akseptert tilbud → egen opplastet kontrakt → prosjekt
D) Akseptert tilbud → Expo-kontrakt → prosjekt
```

Alle fire er gyldige normaltilstander. Garanti kan aktiveres og dokumentasjonen kan bygges opp, men selve garantiutstedelsen stoppes dersom signert kontrakt mangler.

## Sales-hovedflyt

```text
Forespørsel
→ eventuell befaring
→ tilbudskladd
→ publisert tilbudsversjon
→ kundelenke/e-post
→ kundevalg av opsjoner
→ digital aksept
→ låst akseptbevis
→ valgfritt:
   ├─ Expo-kontrakt
   │  → utkast
   │  → bedriften signerer
   │  → sikker kundelenke
   │  → kunden signerer
   │  → endelig privat PDF
   │  → Avtalegrunnlag på eksisterende eller senere prosjekt
   ├─ bedriftens egen kontrakt
   └─ ingen kontrakt
→ eventuell prosjektaktivering
```

Tilbud kan også opprettes uten befaring.

## Styrende kontrakter

- Publiserte tilbudsversjoner og kundeaksept overskrives aldri.
- Kontrakt er egen historikk og muterer ikke akseptert tilbud.
- Kundeaksept knyttes til eksakt tilbudsversjon og valgte opsjoner.
- Prosjekt uten tilbud er gyldig.
- Prosjekt uten kontrakt er gyldig frem til eventuell garantiutstedelse.
- Privatkundeorienterte priser vises inkl. mva.
- Ingen historisk backfill uten eksplisitt beslutning.
- RLS/server er sikkerhetsgrensen; frontend er ikke tilgangskontroll.
- Supportmodus er ikke skrive-bypass.
- Sales recovery/hydration og IndexedDB-sikring av befaringsbilder skal ikke svekkes.
- Eksisterende `contractFile` og gamle kontraktdokumenter er gyldig legacy.
- Endelig Expo-kontrakt-PDF genereres kun fra serverlåst `sales_contracts.snapshot` og signaturmetadata.
- Brukerflaten heter **Avtalegrunnlag**, mens intern prosjekt-/tabnøkkel `tilbud` / `data.tilbud` beholdes.

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
│   └── SalesContractCustomerView.jsx
├── services/
│   ├── salesContracts.js
│   ├── salesContractPdf.js
│   └── ...
└── utils/
    └── salesContractModel.js
```

Naturlige ansvargrenser:

- `SalesContractActions.jsx`: status, kundelenke, slutt-PDF og prosjekt-synk.
- `SalesContractWizardCore.jsx`: stegvis utfylling og lokal recovery.
- `SalesContractWizard.jsx`: bedriftssignatur, låsing, kundelenke/e-post og signeringsstatus.
- `SalesContractDocumentCore.jsx`: avtaletekst.
- `SalesContractCustomerView.jsx`: offentlig tokenstyrt, read-only kundesignering.
- `salesContractPdf.js`: slutt-PDF fra låst kontraktsrad med tilbuds-/akseptvedlegg.
- `salesContracts.js`: RPC-klient, privat PDF-arkivering og prosjektkobling.

Fase 33B.6 endrer ikke disse Sales-ansvarene.

## Recovery/hydration

Sales har vern mot datatap gjennom serverlagret arbeidskopi, lokal tilbudskladd, kontrollert hydrering, reload/appbytte-recovery og IndexedDB-sikring av befaringsbilder.

`critical-sales-recovery-check.mjs` er obligatorisk del av build. En tom eller uhydrert tilbudskladd skal aldri overskrive nyere serverdata.

Kontraktens serverlagring er separat fra tilbudskladdens recovery. Ulagrede kontraktfelt og aktivt veivisersteg sikres i `sessionStorage` frem til eksplisitt `Lagre kontraktsutkast`.

## `sales_contracts`

```text
source: expo | external
status: draft | awaiting_customer | signed | external_confirmed | void
```

Kontrakten knyttes til faktisk Sales-firma, salgssak og **eksakt akseptert tilbudsversjon**. Tabellen brukes ikke for direkte prosjekter uten Sales.

Viktige RPC-er:

```text
create_sales_contract(...)
save_sales_contract_draft(...)
sign_sales_contract_company(...)
get_sales_contract_by_token(...)
sign_sales_contract_customer(...)
register_external_sales_contract(...)
void_sales_contract(...)
attach_sales_contract_final_document(...)
sync_sales_contract_final_document_to_project(...)
```

Sikkerhet:

- `sales_contracts` har RLS.
- Intern skriving går gjennom kontrollerte RPC-er.
- Offentlig kunde bruker unik token/RPC.
- Signert snapshot/signaturhistorikk er låst.
- `final_document` settes én gang etter signering og er deretter immutable.
- Kontrakt-RPC-er bruker ikke supportfirma som write-bypass.

## Endelig signert PDF

Når begge har signert, genereres slutt-PDF fra låst kontraktsrad. Den inneholder:

- kontraktens avtalepunkter
- begge signaturer med navn/tidspunkt
- Vedlegg A – eksakt akseptert tilbud og valgte opsjoner
- Vedlegg B – aksept-/signaturbevis
- privatkundepriser inkl. mva.

Vedlegg A viderefører kundesynlig tekst som faktisk lå i den aksepterte tilbudsversjonen, blant annet forutsetninger/forbehold, inkludert/ikke inkludert, kundens leveranser, vilkår og betalingsbetingelser. Historiske versjoner backfilles ikke.

Slutt-PDF lagres privat og kobles til prosjektets `data.tilbud.files`. Eksisterende og senere prosjekt bruker samme private Storage-objekt, ikke en kopi.

## Avtalegrunnlag

Synlig prosjektfane heter **Avtalegrunnlag**. Intern nøkkel er fortsatt `tilbud`.

Avtalegrunnlag kan inneholde:

- akseptert tilbud/akseptbevis
- signert Expo-kontrakt
- bedriftens egen kontrakt
- andre avtaledokumenter
- senere tillegg/fradrag

Tom Avtalegrunnlag-flate er normalt for direkte prosjekt uten tilbud/kontrakt.

### Bedriftens egen signerte kontrakt

Kontrakter som lastes opp gjennom Sales er allerede merket `documentType=contract`.

Fase 33B.6 legger også en tynn klassifisering i prosjektets Avtalegrunnlag slik at en allerede opplastet fil kan markeres som **bedriftens signerte kontrakt**. Da lagres:

```text
documentType = contract
contractSource = external
```

Expo-kontrakt merkes automatisk med `contractSource=expo`. Legacy-filer med kontraktnavn gjenkjennes fortsatt for bakoverkompatibilitet.

## Garantikobling – 33B.6

Garantikravet ligger utenfor selve Sales-signeringen, men bruker kontraktdokumentet som Sales/Avtalegrunnlag allerede har produsert.

Autoritativ regel:

```text
Ny dokumentert tetthetsgaranti
→ prosjekt må være lagret
→ signert kontrakt må finnes i Avtalegrunnlag
→ øvrige garanti-/Sopro-/overtagelseskrav må være oppfylt
→ garanti kan registreres
```

Serververnet ligger på `warranty_registry` før INSERT. Dermed kan frontend aldri omgå kontraktkravet. Etter utstedt garanti kan prosjektets siste kontraktsgrunnlag ikke fjernes.

Dette berører ikke gamle allerede utstedte garantier og kjører ingen backfill.

Migrasjon:

```text
20260831230412  fase33b6_warranty_requires_signed_contract
```

## HJELP og QA

HJELP forklarer at kontrakt er valgfritt for vanlige prosjekter, men kreves ved garantiutstedelse. Den forklarer også hvordan egen signert kontrakt markeres i Avtalegrunnlag.

33B.6 skal før merge verifisere:

- critical build
- critical Sales recovery
- Vite build
- Preview/runtime
- garanti uten kontrakt stoppes server-side
- garanti med kontrakt godtas
- kontrakt kan ikke fjernes etter utstedt garanti
- faktisk brukerflyt i Avtalegrunnlag og Garanti

```text
33B.2  servermodell/RLS/RPC                           ← ferdig
33B.3  intern kontraktveiviser/autofyll                ← ferdig
33B.4  bedriftssignatur + kundelenke + kundesignering ← ferdig
33B.5  slutt-PDF + Avtalegrunnlag + prosjektkobling   ← ferdig
33B.6  garantikobling + slutt-QA/dokumentasjon        ← denne runden
```
