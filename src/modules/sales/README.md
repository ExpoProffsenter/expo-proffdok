# Expo ProffDok – Befaring / Tilbud / Aksept

**Status:** Produksjonskoblet modul  
**Oppdatert:** Fase 32 – 31.08.2026

Sales er en aktiv del av Expo ProffDok og er koblet til hovedappen. Modulen håndterer hele salgsflyten fra ny forespørsel til eventuelt ProffDok-prosjekt.

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
→ eventuell ny tilbudsversjon
→ aktivering som ProffDok-prosjekt
```

Det er også mulig å opprette tilbud uten befaring når befaring ikke er nødvendig.

## Viktige prinsipper

- Mobil først.
- Registrer informasjon én gang og gjenbruk den videre.
- Publiserte tilbudsversjoner skal ikke overskrives.
- Kundeaksept skal være knyttet til eksakt tilbudsversjon og valgte opsjoner.
- Ny versjon etter aksept skal bevare tidligere aksept/historikk.
- Sak og ProffDok-prosjekt er separate objekter.
- Prosjekt opprettes kun etter aktiv brukerhandling.
- Prosjekter uten tilbud i Expo ProffDok er gyldige.
- Privatkundeorienterte priser vises inkl. mva.
- Eksisterende produksjonsfunksjonalitet og historiske data skal beskyttes.
- Ingen historisk backfill uten eksplisitt beslutning.

## Struktur

`SalesModule.jsx` er en liten inngang/wrapper. Hovedorkestrering ligger i `SalesModuleCore.jsx`.

Modulen er gradvis delt i:

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

Eksempler på presentasjonsområder:

```text
SalesListView
SalesDetailView
SalesInspectionNote
SalesOfferBuilder
SalesCustomerView
SalesAcceptedPresentation
SalesProjectActivation
SalesHomeFollowUp
```

Eksempler på tjenester:

```text
salesSupabase*
salesPublishing
salesImages
salesLocalStorage*
salesInspectionDraftDb
salesCommunication
salesOfferPdf*
salesAcceptancePdf*
```

## Kritisk recovery/hydration

Sales har flere sikkerhetslag for å unngå datatap:

- serverlagret arbeidskopi i `sales_requests.payload`
- lokal tilbudskladd
- kontrollert hydrering før autosave
- gjenoppretting ved reload/appbytte
- IndexedDB/lokal sikring av befaringsbilder
- `scripts/critical-sales-recovery-check.mjs` i build

Denne logikken skal ikke forenkles eller flyttes uten egen regresjonstest. En tom eller uhydrert kladd må aldri kunne overskrive et nyere tilbud på server.

## Sporbarhet – Fase 32

For nye data skilles det mellom:

- **Opprettet av** – faktisk oppretter lagret server-side
- **Ansvarlig** – hvem som er ansvarlig for saken nå
- **Sist publisert av** – faktisk innlogget publisist av siste tilbudsversjon

Eldre saker kan mangle disse feltene. Historiske data fylles ikke automatisk inn i ettertid.

## Tilbudsbilder – Fase 32

Nye bilder på tilbudslinjer og opsjoner lagres normalt i Supabase Storage under `project-images/sales-offer-images/...`.

Eksisterende felt `imageDataUrl` kan derfor inneholde enten:

- eldre `data:image...` base64, eller
- ny offentlig Storage-URL.

Begge formater skal støttes. Ved offline/session/Storage-feil finnes fallback til gammel data-URL-metode. Befaringsbildenes separate flyt skal ikke endres av dette.

## Supabase-klient

Sales bruker en delt standard browser-Supabase-klient. Ikke opprett nye parallelle GoTrue/Supabase-klienter i komponenter eller tjenester når den delte klienten kan brukes. Parallelle auth-klienter med samme storage key kan gi uforutsigbar sesjons-/refreshadferd.

## Publisering og aksept

Publiserte tilbud lagres som versjonerte snapshots via Sales RPC-er. Aksept er historikk.

Sentrale kontrakter:

- `publish_sales_offer(...)`
- `get_sales_offer_by_token(...)`
- `accept_sales_offer(...)`

Akseptbevis og akseptert historikk skal ikke muteres når det senere opprettes ny versjon.

## Prosjektaktivering

Ved aktivering overføres relevant salgshistorikk til prosjektet, blant annet gjennom `project.salesOrigin`, akseptbevis og eventuelle dokumenter.

Den opprinnelige avtalen skal holdes separat fra senere prosjektendringer/tillegg/fradrag.

Systemadmin Sales-support har egne sikkerhetsbegrensninger. Aktivering skal ikke gjennomføres i en supportkontekst dersom korrekt firmaeierskap og prosjektansvar ikke kan settes sikkert.

## HJELP-regel

Når en Sales-endring påvirker arbeidsflyt, knapper, begreper eller hva brukeren skal gjøre, skal HJELP oppdateres i samme runde.

Rent tekniske endringer som ikke endrer brukeropplevelsen skal eksplisitt dokumentere at HJELP ikke trenger endring.

## Utviklingsregel

Ikke splitt Sales i flere filer bare for å redusere filstørrelse. Ny modulgrense skal gi tydelig bedre oversikt, testbarhet eller vedlikehold og må bevare recovery, historikk, publisering og kundevisning.
