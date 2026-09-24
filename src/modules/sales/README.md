# Expo ProffDok – Sales

**Oppdatert:** Fase 45B – 24.09.2026

Sales håndterer fire tydelig adskilte brukerreiser som deler deler av samme tilbudsmotor, men har forskjellige avslutninger og sikkerhetsregler:

1. ordinær Befaring/Tilbud
2. Butikktilbud
3. Profftilbud / Enkel ordre
4. kontrakt etter ordinær prosjektorientert aksept

RLS/RPC/server er sikkerhetsgrensen. Frontendfiltrering er bare UX.

## 1. Ordinær Sales-hovedflyt

```text
Forespørsel
→ eventuell befaring
→ tilbudskladd
→ publisert tilbudsversjon
→ kundelenke/e-post
→ kundevalg av opsjoner
→ digital aksept
→ låst akseptbevis
→ valgfritt kontraktsteg
→ eventuell prosjektaktivering
```

Tilbud kan opprettes uten befaring.

Gyldige ordinære prosjektveier:

```text
A) Direkte prosjekt uten tilbud
B) Akseptert ordinært tilbud → prosjekt uten kontrakt
C) Akseptert ordinært tilbud → egen opplastet kontrakt → prosjekt
D) Akseptert ordinært tilbud → Expo-kontrakt → prosjekt
```

Kontrakt er ikke et generelt prosjektkrav. Den kreves når garanti-/avtalegrunnlaget faktisk krever den.

## 2. Forespørsler, summary og lazy loading

Nye saker med status `Forespørsel` vises i egen forespørselskø fram til befaring er planlagt eller saken går videre.

Sales-listen skal ikke hente full payload for alle saker. Den bruker lett `list_payload`/summary til oversikt, søk og tellere.

```text
Åpne Befaring/Tilbud
→ hent lett summary
→ bruker åpner én sak
→ hent komplett payload for akkurat denne saken
→ server-first hydration
→ editor/autosave kan åpnes
```

Kritisk:

- summary-rad må aldri lagres tilbake som komplett payload
- hvis komplett sak ikke kan hentes, skal editor blokkeres/retryes – ikke åpnes tom
- full payload med linjer, media, Badskisse, historikk og akseptdata hentes først ved behov

## 3. Recovery – PC-fanebytte og mobil appbytte

`Ny forespørsel` og `Nytt tilbud` kan være gyldige arbeidsbilder før de har `request_ref`.

Kritiske regler:

- ulagret kunde/adresse/notat kan gjenopprettes etter reelt fanebytte/appbytte
- første tomme render må aldri overskrive recovery-data
- eksisterende sak bruker serverdata som autoritativt utgangspunkt
- befaringsbilder og Badskisse skal ikke tapes ved hydrering
- manglende lokal media er ikke beskjed om å slette servermedia
- bevisst Tilbake/Avbryt/menyvalg rydder recovery-markører
- eksplisitt brukerhandling vinner alltid over automatisk recovery

## 4. Butikktilbud

Butikktilbud er egen Sales-flyt for butikk, vare, service og mindre leveranser der prosjektaktivering ikke er ønsket.

```text
Nytt tilbud
→ velg Butikktilbud
→ kunde/ansvarlig/merkevare
→ tilbudsposter og avsnitt
→ valgfritt katalogsøk
→ montering og opsjoner
→ autosavet kladd
→ kundepreview
→ publisert låst versjon
→ kundelenke/e-post
→ aksept/avvisning
→ avsluttet Sales-sak
```

Butikktilbud skal aldri aktivere ProffDok-prosjekt.

Avsnitt lagres som `store_text` med gruppe-/seksjonsmarkør og skal vises som overskrift, ikke som prislinje. Montering og opsjoner beholder eksisterende Butikktilbud-kontrakt.

## 5. Profftilbud / Enkel ordre – Fase 45B

Proffløsningen gjenbruker eksisterende Sales-motor, men har egen tilgangs- og prisgrense.

### 5.1 Tilgang

En proffbruker skal bare kunne søke i leverandører firmaet eksplisitt er godkjent for.

Systemadmin styrer:

- leverandørtilgang per firma
- rabatt per firma/leverandør

Firmaadmin/Systemadmin kan styre hvilken godkjent bruker i firmaet som får se `Din nto pris`, innenfor servervaliderte regler.

Relevant bruker må være godkjent/aktiv og ha nødvendige moduler, blant annet Sales og Enkel ordre/`store_offers` der flyten krever det.

### 5.2 Prisgrensen

Tre prisnivåer må behandles separat:

- **Ringsides interne ERP-netto innkjøpspris**: aldri synlig for proffkunde eller sluttkunde.
- **Din nto pris**: beregnet proffkundepris; sensitiv per-bruker-rettighet.
- **Kunde-/salgspris**: foreslått pris ut til sluttkunde; kan justeres før publisering.

Følgende interne felt skal aldri inngå i proffkunde-/kundekontrakt dersom de representerer Ringsides interne kalkyle:

- intern purchase/net price
- intern innkjøpsrabatt
- DG/margin
- internt påslag

### 5.3 Profftilbud

```text
Nytt tilbud
→ Proff / Enkel ordre
→ kunde
→ produkt-/varesøk innen godkjente leverandører
→ tilbudsposter/opsjoner
→ foreslått salgspris, eventuelt justert
→ Forhåndsvis som kunde
→ publisert versjon
→ kundelenke/e-post
→ kundevalg av opsjoner
→ digital aksept
→ valg Enkel ordre eller ordinært prosjekt
```

`Forhåndsvis som kunde` er read-only. Den må ikke publisere, sende e-post eller akseptere tilbud. Kundevisningen skal ikke eksponere interne varenummer/prisfelt som ikke er del av kundens grunnlag.

### 5.4 Enkel ordre vs ordinært prosjekt

Etter aksept kan brukeren velge:

```text
A) Lag Enkel ordre
B) Aktiver som prosjekt
```

Valget lagres server-side. En tilfeldig innlogget bruker i samme firma skal ikke kunne mutere valget uten nødvendig modul-/firmatilgang.

**Enkel ordre** har bevisst smal arbeidsflate. Den kan bruke:

- oversikt
- bilder
- relevante sjekklister
- UE-bidrag
- fremdriftsplan – valgfritt
- FDV – valgfritt
- sluttdokumentasjon etter behov

Kundeportal blokkeres for ren Enkel ordre der 45B-kontrakten krever det. UE-flyt kan fortsatt brukes der det er relevant.

### 5.5 Bestillingsgrunnlag

Akseptert Proff/Enkel ordre får et read-only bestillingsgrunnlag.

Det skal:

- hydreres fra komplett akseptert Sales-detalj, ikke summary-cache
- bygge på eksakt låst akseptert versjon og valgte opsjoner/alternativer
- inneholde varenummer/antall/relevante produktidentifikatorer
- ikke inneholde kundepris, `Din nto pris` eller intern ERP-netto innkjøpspris

Aksepterte produkter kan seedes til Enkel ordre/prosjekt for FDV/produktgrunnlag. Sensitive prisfelt strippes. Valgt alternativ skal erstatte grunnproduktet der tilbudslogikken sier at alternativet er en erstatter.

## 6. Internt vareregister og Proff-katalog

Internt ERP-vareregister ligger i `src/modules/storeCatalog/` og beskrives i `docs/architecture/FASE39B_INTERNAL_STORE_CATALOG.md`.

Intern katalog og Proff-katalog er ikke samme autorisasjonsflate:

- intern Ringside/Expo-katalog kan inneholde intern netto innkjøpspris
- Proff-katalog returnerer bare tillatte leverandører og kundeegnede prisfelt
- tilgang og rabatt styres server-side
- historisk publisert/akseptert tilbud endres aldri av ny prisfil eller rabattendring

## 7. Publisering, kundelenke og aksept

Publisert tilbud er immutable snapshot. Kundeaksept knyttes til eksakt versjon og valgte opsjoner.

Kundelenke/PDF skal bruke samme publiserte grunnlag og privatkundeorienterte priser inkl. mva.

Aksept/avvisning lagres før varsling. E-postfeil kan aldri reversere en allerede lagret kundebeslutning.

## 8. Kontrakt og Avtalegrunnlag

Etter ordinær prosjektorientert aksept kan saken fortsette med Expo-kontrakt, egen kontrakt eller ingen kontrakt.

Synlig prosjektfane heter **Avtalegrunnlag**. Intern nøkkel `tilbud` beholdes av bakoverkompatibilitetshensyn.

Dokumentert tetthetsgaranti krever signert kontrakt sammen med øvrige garanti-/Sopro-/overtagelseskrav når garantien skal utstedes.

## 9. Fremdriftsplan

Akseptert ordinært tilbud kan brukes som forslag til arbeidsoperasjoner i fremdriftsplan. Planen skriver aldri tilbake til tilbud/aksept.

Enkel ordre kan bruke fremdriftsplan valgfritt.

Butikktilbud brukes fortsatt ikke som prosjektkilde.

## 10. Viktige sikkerhetskontrakter

- RLS/server er sikkerhetsgrensen; frontend er ikke tilgangskontroll.
- Supportmodus er ikke skrive-bypass.
- Aktivt firma/representert firma skal respekteres.
- Publisert/akseptert historikk er immutable.
- Intern ERP-netto innkjøpspris skal aldri inn i kundedata, Proff-kundegrunnlag, publisert tilbud, PDF eller akseptbevis.
- `Din nto pris` er separat sensitiv proffkundeverdi og må ha eksplisitt brukerrettighet.
- Butikktilbud skal aldri aktivere prosjekt.
- Enkel ordre-kundeportal skal ikke kunne åpnes via gammel/alternativ klientvei.
- Komplett valgt Sales-sak hydreres før editor/autosave.
- Bevisst brukerhandling vinner over recovery.

## 11. Viktige Fase 45B-filer

```text
src/modules/access/firmaAdminProNetPriceUx.js
src/modules/access/proUserAccessClient.js
src/modules/access/systemAdminUnifiedUserAccessUx.jsx
src/modules/help/help45b.js
src/modules/project/simpleOrderWorkspaceUx.js
src/modules/sales/components/SalesDraftCustomerPreview.jsx
src/modules/sales/components/SalesProjectActivation.jsx
src/modules/sales/components/SalesStoreOfferBuilderProCatalog.jsx
src/modules/sales/services/salesSimpleOrder.js
src/modules/storeCatalog/ProStoreCatalogAdminPanel.jsx
src/modules/storeCatalog/ProStoreCatalogInlineLookup.jsx
src/modules/storeCatalog/proStoreCatalogClient.js
scripts/critical-pro-store-catalog-check.mjs
scripts/critical-simple-order-workspace-check.mjs
scripts/critical-customer-draft-preview-check.mjs
scripts/critical-store-order-basis-check.mjs
```

## 12. QA før merge

Ved Sales-/45B-endringer verifiseres minst:

- alle critical checks og Vite build grønne
- riktig Preview SHA og miljøbinding
- ny bruker → godkjenning → firma/moduler
- firmaadmin/systemadmin rettighetsgrenser
- leverandørsøk viser bare godkjente leverandører
- bruker uten nettoprisrett ser ikke `Din nto pris`
- bruker med rettighet ser korrekt beregnet `Din nto pris`, aldri intern ERP-netto
- tilbud → kundepreview → publisering → faktisk kundelenke/e-post → opsjon → aksept
- immutable tilbud/aksept endres ikke
- Enkel ordre og ordinært prosjekt gir riktig separat arbeidsflyt
- Enkel ordre kundeportal er blokkert, UE etter gjeldende kontrakt
- bestillingsgrunnlag er read-only og prisfritt
- aksepterte produkter/alternativer seedes korrekt uten sensitive prisfelt
- gammel Befaring/Tilbud, Butikktilbud, recovery og lazy loading regresjonstestes
- HJELP, root README og hovedarkitektur er oppdatert i samme PR

GitHub CI håndhever dokumentasjonskravet gjennom `scripts/critical-release-docs-check.mjs`.
