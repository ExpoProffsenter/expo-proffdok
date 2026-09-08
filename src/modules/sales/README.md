# Expo ProffDok – Sales / Befaring / Tilbud / Butikktilbud / Aksept / Kontrakt

**Status:** Produksjonskoblet Sales-modul  
**Oppdatert:** Fase 39B.2 – 08.09.2026

Sales håndterer både ordinær Befaring/Tilbud-flyt og den separate Butikktilbud-flyten.

Ordinære tilbud kan etter aksept gå videre til Expo-kontrakt, egen opplastet kontrakt eller direkte prosjekt. Butikktilbud avsluttes derimot i Sales ved aksept eller avvisning og oppretter ikke ProffDok-prosjekt.

**Kontrakt er ikke et generelt prosjektkrav.** Signert kontrakt kreves først når dokumentert tetthetsgaranti faktisk skal utstedes.

## 1. Gyldige prosjektveier

```text
A) Direkte prosjekt uten tilbud
B) Akseptert ordinært tilbud → prosjekt uten kontrakt
C) Akseptert ordinært tilbud → egen opplastet kontrakt → prosjekt
D) Akseptert ordinært tilbud → Expo-kontrakt → prosjekt
```

Alle fire er gyldige normaltilstander.

Butikktilbud følger en annen avslutning:

```text
Butikktilbud → publisert versjon → kundelenke/e-post → aksept/avvisning → avsluttet Sales-sak
```

Ingen prosjektaktivering eller kontrakt opprettes fra Butikktilbud.

## 2. Ordinær Sales-hovedflyt

```text
Forespørsel
→ eventuell befaring
→ tilbudskladd
→ publisert tilbudsversjon
→ kundelenke/e-post
→ kundevalg av opsjoner
→ digital aksept
   → kunden får akseptbekreftelse på e-post
   → publiserende bruker varsles på e-post
→ låst akseptbevis
→ valgfritt kontraktsteg
→ eventuell prosjektaktivering
```

Tilbud kan også opprettes uten befaring.

## 3. Butikktilbud-hovedflyt

```text
Nytt tilbud
→ velg Butikktilbud
→ kunde/ansvarlig/merkevare
→ tilbudsposter og avsnitt
→ valgfritt katalogsøk per post
→ knyttet montering og opsjoner
→ autosavet kladd
→ kundepreview
→ publisert låst versjon
→ kundelenke/e-post
→ kunde velger opsjoner
→ aksept eller avvisning
→ avsluttet Sales-sak
```

Butikktilbud er egnet for butikk, service, vareleveranser, varmepumpe, elektriker, mindre arbeid og andre leveranser der prosjektaktivering ikke er ønsket.

## 4. Styrende kontrakter

- Publiserte tilbudsversjoner og kundeaksept overskrives aldri.
- Kundeaksept knyttes til eksakt tilbudsversjon og valgte opsjoner.
- Privatkundeorienterte priser vises inkl. mva.
- Prosjekt uten tilbud og/eller kontrakt er gyldig.
- Ingen historisk backfill uten eksplisitt beslutning.
- RLS/server er sikkerhetsgrensen; frontend er ikke tilgangskontroll.
- Supportmodus er ikke skrive-bypass.
- Sales recovery/hydration og IndexedDB-sikring av befaringsbilder skal ikke svekkes.
- Eksisterende `contractFile` og gamle kontraktdokumenter er gyldig legacy.
- Brukerflaten heter **Avtalegrunnlag**, mens intern prosjekt-/tabnøkkel `tilbud` / `data.tilbud` beholdes.
- Butikktilbud skal aldri aktivere prosjekt.
- Intern ERP-nettopris skal aldri inn i kundedata, publisert tilbud, PDF eller akseptbevis.
- E-postvarsling etter aksept/avvisning er et sekundært sideutfall og må aldri kunne reversere kundens allerede lagrede beslutning.

## 5. Butikktilbud – tilbudsposter og avsnitt

Butikktilbud er ikke lenger begrenset til «varer». Den synlige modellen er **Tilbudsposter og avsnitt**.

Eksempel:

```text
Varmepumpe
  CALIBRA 12 230V
    Montering av CALIBRA
    Opsjoner/alternativer
  Akkumulatortank
    Montering av akkumulatortank
  Rør og deler

Elektriker
  Elektrikerarbeid
```

Avsnitt lagres som `store_text` med `storeSectionMode = "group"`. De skal:

- ha beløp 0 internt
- ikke valideres som prislinjer
- ikke nummereres som varepost
- ikke vises som `0 kr`
- presenteres som overskrifter i internvisning, kundelenke, tilbuds-PDF og akseptbevis

Robust deteksjon ligger i felles `storeSectionLine`-logikk og støtter også eldre markører (`store-section-*`, `storeSectionMode`, markør-URL/metadata).

## 6. Post, montering og opsjoner

En vanlig Butikktilbud-post kan være manuelt arbeid eller katalogvare.

Katalogkobling skal ikke låse kundebeskrivelsen. Bruker kan for eksempel velge en ERP-vare og endre kundeteksten til en mer forståelig produktbeskrivelse.

Montering kan:

- knyttes direkte til en post
- beregnes som antall/timer × enhetspris
- opprettes separat som `Kun montering`

Opsjoner kan være:

- tillegg/oppgradering
- alternativ/erstatter

Ved alternativ vare støttes monteringsvalg:

- behold samme montering
- bruk ny monteringsmengde/enhetspris
- ingen montering

## 7. Internt vareregister

Butikktilbud kan bruke et internt ERP-vareregister gjennom `src/modules/storeCatalog/`.

Tilgang krever:

- aktiv/godkjent bruker
- `store_offers`-modultilgang
- firmamedlemskap i Ringside Rørleggerbedrift AS eller Bademiljø Expo

Expo Proffsenter har ikke katalogtilgang.

Søk kan bruke:

- leverandør
- leverandørens varenummer
- GTIN/EAN
- varetekst

Ved valg kopieres bare kundeegnet snapshot/salgspris inn i tilbudet. Intern netto innkjøpspris beholdes kun i katalogen.

Leverandøralternativer kobles via normalisert GTIN/EAN, aldri sikkert via varenummer alene.

Katalogvedlikehold er systemadministrator-only og dokumenteres separat i:

```text
docs/architecture/FASE39B_INTERNAL_STORE_CATALOG.md
```

## 8. Autosave, recovery og navigasjon

Sales recovery er kritisk fordi Sales kan ha store payloads og publiserte historiske versjoner.

Butikktilbud har i tillegg saksspesifikk serverautosave gjennom `salesStoreOfferAutosave.js`.

Kritiske recovery-regler:

- en tom/stale lokal kladd får ikke overstyre et eksisterende servertilbud med reelt innhold
- serverdata vinner ved strukturelt tom lokal kladd
- helt tom Enter-opprettet post prunes ved lagring
- avsnitt skal overleve normalisering som avsnitt
- firmascopet lokal Sales-cache kan brukes som rask førstevisning, men Supabase er fasit
- vanlig inngang via Befaring/Tilbud åpner sakslisten
- full reload inne i en Sales-sak kan gjenåpne aktuell sak

Butikktilbud-Tilbake bruker autosave og skal ikke trigge den gamle generiske «lagre/valider før tilbake»-dialogen.

`critical-sales-recovery-check.mjs` er obligatorisk del av build.

## 9. Kundevisning, PDF og aksept

Kundelenken er offentlig via eksisterende høyt entropisk `publicOffer`-token.

Kundevisningen skal for Butikktilbud vise merkevare/logo, tilbudstittel/intro, avsnitt, nummererte reelle poster, montering, opsjoner, priser inkl. mva., samlet leveranse, vilkår, betaling/gyldighet og aksepter/avvis.

Forhåndsvisning er read-only og skal vise samme kundestruktur uten å tillate aksept/avvisning.

Tilbuds-PDF og akseptbevis bruker samme avsnittsdetektor som kunde-/internvisning slik at avsnitt ikke blir `0 kr`-linjer.

## 10. Butikktilbud – automatisk oppfølging

FASE 37A2 gjelder fortsatt uendret:

- oppfølging er valgfri per publisert Butikktilbud-versjon
- første påminnelse, intervall og maks antall velges av bruker
- planen er versjonslåst
- akseptert, avvist, utløpt eller arkivert tilbud stoppes
- en ny publisert versjon erstatter den gamle som gjeldende oppfølgingsgrunnlag

Denne funksjonen er frozen/no-touch med mindre den eksplisitt skal endres.

## 11. Fase 35A – Sales som kilde til forslag i fremdriftsplan

Når et prosjekt stammer fra et akseptert ordinært tilbud kan fremdriftsmodulen lese det **låste aksepterte tilbudsgrunnlaget og de faktisk valgte opsjonene** og bruke hovedpostene som forslag til arbeidsoperasjoner.

```text
akseptert tilbud + valgte opsjoner
  → leses av fremdriftsmodulen
  → kopieres til redigerbare arbeidsoperasjoner i prosjektet

fremdriftsplan
  ✕ skriver ikke tilbake til sales_offers
  ✕ skriver ikke tilbake til sales_offer_versions
  ✕ endrer ikke accepted_payload
  ✕ endrer ikke kontrakt eller akseptbevis
```

Butikktilbud brukes ikke som prosjektkilde.

## 12. Fase 34B – e-post ved ordinær tilbudsaksept

Aksept lagres gjennom eksisterende `accept_sales_offer(...)`. E-post er et etterfølgende sideutfall og kan aldri reversere en lagret aksept.

Edge Function:

```text
sales-offer-acceptance-notify
```

Funksjonen mottar offentlig tilbudstoken og bestemmer mottakerne server-side. Idempotens ligger i `sales_offer_acceptance_notifications` med unik nøkkel på `offer_id + offer_version_id + recipient_type`.

## 13. Fase 39B.2 – e-post ved avvist Butikktilbud

Digital avvisning lagres først gjennom `decline_sales_offer(...)`. Etter vellykket lagring kalles Edge Function:

```text
sales-offer-decline-notify
```

Funksjonen mottar kun offentlig tilbudstoken og henter avvisningen og eksakt publisert tilbudsversjon server-side. Mottakeren kan ikke velges av klienten: varselet går til brukeren i `sales_offer_versions.published_by` for versjonen kunden faktisk avviste.

Idempotens ligger i:

```text
public.sales_offer_decline_notifications
```

med unik nøkkel på:

```text
offer_id + offer_version_id + recipient_type
```

Tabellen har RLS aktivert og ingen klientpolicyer; den brukes som intern service-role-logg. `getSalesOfferByToken(...)` kan forsøke samme varslingsendepunkt på nytt som recovery når en allerede avvist kundelenke åpnes. Uniknøkkelen avgjør om e-post faktisk skal sendes.

En e-postfeil endrer aldri den allerede registrerte avvisningen. Automatisk Butikktilbud-oppfølging stopper på avvist status uavhengig av om varslingsmailen lykkes.

## 14. Kontrakt etter ordinær aksept

Etter ordinær aksept kan saken fortsette med Expo-kontrakt, bedriftens egen kontrakt eller ingen kontrakt.

Expo-kontrakten er låst historikk knyttet til eksakt akseptert tilbudsversjon. Bedriften signerer først, kunden deretter via sikker tokenlenke. Når begge har signert opprettes privat slutt-PDF med kontrakt, tilbud, aksept og signatursporbarhet.

## 15. Avtalegrunnlag og garanti

Synlig prosjektfane heter **Avtalegrunnlag**. Intern nøkkel er fortsatt `tilbud`.

Avtalegrunnlag kan inneholde akseptbevis, signert Expo-kontrakt, bedriftens egen kontrakt og senere avtaledokumenter/endringer. Tom Avtalegrunnlag-flate er normalt for direkte prosjekt uten tilbud/kontrakt.

Ved dokumentert tetthetsgaranti kreves signert kontrakt i Avtalegrunnlag sammen med øvrige garanti-/Sopro-/overtagelseskrav.

## 16. Viktige filer i Sales 39B.2

```text
src/modules/sales/SalesModuleCore.jsx
src/modules/sales/components/SalesOfferBuilder.jsx
src/modules/sales/components/SalesStoreOfferBuilderGrouped.jsx
src/modules/sales/components/SalesStoreOfferBuilderCatalog.jsx
src/modules/sales/components/SalesCustomerViewCore.jsx
src/modules/sales/components/SalesCustomerView.jsx
src/modules/sales/components/SalesDetailView.jsx
src/modules/sales/services/salesStoreOfferAutosave.js
src/modules/sales/services/salesStoreOfferTemplates.js
src/modules/sales/services/salesStoreOffers.js
src/modules/sales/services/salesSupabase.js
src/modules/sales/services/salesOfferPdf.js
src/modules/sales/services/salesAcceptanceProofPdf.js
src/modules/sales/services/salesLocalStorage.js
src/modules/sales/utils/salesOfferLogic.js
src/modules/sales/utils/salesOfferLogicCore.js
src/modules/sales/utils/storeSectionLine.js
src/modules/storeCatalog/
supabase/functions/sales-offer-decline-notify/
supabase/migrations/20260908165435_fase39b2_store_decline_notifications.sql
```

## 17. Recovery og QA før merge

Ved Sales-/Butikktilbud-endringer skal minst følgende verifiseres:

- `critical-build-check.mjs`
- `critical-sales-recovery-check.mjs`
- `critical-store-catalog-check.mjs` når katalog/Butikktilbud påvirkes
- `critical-store-decline-check.mjs` når digital avvisning/varsling påvirkes
- Vite build
- Vercel Preview/runtime
- vanlig Befaring/Tilbud-liste og ordinær Sales-sak
- Butikktilbud redigering, Enter, autosave og Tilbake
- avsnitt i internvisning, kundelenke og PDF
- katalogsøk og tilgang
- offentlig tilbud/aksept/avvisning ved relevant endring
- e-post-/Edge-status ved kommunikasjonsendringer
- at immutable tilbud/aksept/avvisning ikke endres
- HJELP samme runde ved brukerrettet flyt
- arkitektur samme runde ved datamodell/RLS/RPC/modulendring

## 18. Utsatt Butikktilbud-videreutvikling

Ikke del av ferdig 39B.2:

- komplett mal som lagrer avsnitt, poster, montering og opsjoner
- NOBB/Byggtjeneste-berikelse via GTIN
- ERP-vareliste/PDF etter aksept gruppert på leverandør
- CSV/Excel-eksport av varebehov

Disse må bygges i egne runder uten å endre historiske tilbud eller katalogsikkerheten.
