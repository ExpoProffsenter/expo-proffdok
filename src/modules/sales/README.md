# Expo ProffDok – Sales / Befaring / Tilbud / Butikktilbud / Aksept / Kontrakt

**Status:** Produksjonskoblet Sales-modul  
**Oppdatert:** Fase 42J – 15.09.2026

Sales håndterer både ordinær Befaring/Tilbud-flyt og den separate Butikktilbud-flyten.

Ordinære tilbud kan etter aksept gå videre til Expo-kontrakt, egen opplastet kontrakt eller direkte prosjekt. Butikktilbud avsluttes i Sales ved aksept eller avvisning og oppretter ikke ProffDok-prosjekt.

**Kontrakt er ikke et generelt prosjektkrav.** Signert kontrakt kreves først når dokumentert tetthetsgaranti faktisk skal utstedes.

## 1. Gyldige prosjektveier

```text
A) Direkte prosjekt uten tilbud
B) Akseptert ordinært tilbud → prosjekt uten kontrakt
C) Akseptert ordinært tilbud → egen opplastet kontrakt → prosjekt
D) Akseptert ordinært tilbud → Expo-kontrakt → prosjekt
```

Butikktilbud følger en annen avslutning:

```text
Butikktilbud → publisert versjon → kundelenke/e-post → aksept/avvisning → avsluttet Sales-sak
```

## 2. Ordinær Sales-hovedflyt

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

Tilbud kan også opprettes uten befaring.

### 2.1 Forespørselskø – Fase 42H

Nye saker med status `Forespørsel` vises i egen fane **Forespørsler**. Dette er bookingkøen for saker som er registrert, men hvor befaring ennå ikke er planlagt.

```text
Ny forespørsel
→ Forespørsler
→ åpne saken
→ Planlegg befaring
→ ordinær Under arbeid-flyt
```

Køen endrer ikke statusmodell eller lagring; den er en tydelig visning av eksisterende `Forespørsel`-status.

### 2.2 Skalerbar saksoversikt – Fase 42I

Sales-listen skal **ikke** hente komplette tilbudspayloads for alle saker. Den bruker en lett serverprojeksjon (`list_payload`) med nødvendig metadata til oversikt, søk og tellere.

```text
Åpne Befaring/Tilbud
→ hent lett summary for sakslisten
→ vis tellere/kort raskt
→ bruker åpner én konkret sak
→ hent komplett payload for akkurat denne saken
→ server-first hydration/recovery
→ editor kan åpnes
```

Komplett tilbud, bilder, Badskisse, akseptdata og historikk hentes først når saken faktisk åpnes. En summary-rad må aldri kunne lagres tilbake som komplett Sales-payload.

Dersom komplett sak ikke kan hentes, skal editor blokkeres med kontrollert retry fremfor å åpne tom eller ufullstendig data.

### 2.3 PC-fanebytte og mobil appbytte – Fase 42J

Bruker må kunne hente kundedata fra SMS, Outlook eller andre faner/apper mens en forespørsel fylles ut.

`Ny forespørsel` og `Nytt tilbud` har ingen `request_ref` før første lagring. De er likevel gyldige recovery-arbeidsbilder. Kunde-, adresse- og notatfelter mellomlagres lokalt og gjenopprettes bare når et ferskt bakgrunns-snapshot viser at brukeren faktisk var i dette skjemaet.

`Rediger forespørsel` bruker samme prinsipp, men lokal recovery er bundet til konkret `request_ref`.

Kritiske regler:

- PC-fanebytte og mobil appbytte skal returnere til samme skjema med ulagrede felt bevart
- normal navigasjon skal ikke gjenopplive gamle entry-kladddata
- første tomme React-render skal ikke overskrive recovery-kladden
- bevisst Tilbake/Avbryt/menyvalg vinner alltid over automatisk recovery

## 3. Butikktilbud-hovedflyt

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
→ aksept eller avvisning
→ avsluttet Sales-sak
```

Butikktilbud er egnet for butikk, service, vareleveranser og andre leveranser der prosjektaktivering ikke er ønsket.

## 4. Styrende kontrakter

- Publiserte tilbudsversjoner og kundeaksept overskrives aldri.
- Kundeaksept knyttes til eksakt tilbudsversjon og valgte opsjoner.
- Privatkundeorienterte priser vises inkl. mva.
- Prosjekt uten tilbud og/eller kontrakt er gyldig.
- RLS/server er sikkerhetsgrensen; frontend er ikke tilgangskontroll.
- Supportmodus er ikke skrive-bypass.
- Sales recovery/hydration og IndexedDB-sikring av befaringsbilder skal ikke svekkes.
- Tom initialform får aldri overskrive serverdata.
- Komplett valgt sak skal være hydrert før editor/autosave aktiveres.
- Saksoversikten skal bruke summary/lazy loading og ikke hente alle komplette payloads.
- Bevisst brukerhandling skal alltid vinne over automatisk recovery.
- Butikktilbud skal aldri aktivere prosjekt.
- Intern ERP-nettopris skal aldri inn i kundedata, publisert tilbud, PDF eller akseptbevis.
- E-postvarsling etter aksept/avvisning er sekundært sideutfall og kan aldri reversere lagret kundebeslutning.

## 5. Butikktilbud – tilbudsposter og avsnitt

Den synlige modellen er **Tilbudsposter og avsnitt**. Avsnitt lagres som `store_text` med `storeSectionMode = "group"` og skal ikke valideres eller presenteres som prislinjer.

Robust avsnittsdeteksjon ligger i `src/modules/sales/utils/storeSectionLine.js` og brukes i internvisning, kundelenke, tilbuds-PDF og akseptbevis.

## 6. Post, montering og opsjoner

En Butikktilbud-post kan være manuelt arbeid eller katalogvare. Katalogkobling låser ikke kundebeskrivelsen.

Montering kan knyttes til post eller opprettes som `Kun montering`. Opsjoner kan være tillegg/oppgradering eller alternativ/erstatter.

## 7. Internt vareregister

Butikktilbud kan bruke internt ERP-vareregister fra `src/modules/storeCatalog/`.

Tilgang krever aktiv/godkjent bruker, `store_offers`-modultilgang og autorisert firmamedlemskap. Expo Proffsenter har ikke katalogtilgang. Intern netto innkjøpspris beholdes i katalogen og skal aldri lekke til kundegrunnlaget.

Detaljer: `docs/architecture/FASE39B_INTERNAL_STORE_CATALOG.md`.

## 8. Autosave, recovery og navigasjon

Sales recovery er kritisk fordi saker kan inneholde store payloads og låst historikk.

Kritiske recovery-regler:

- serverdata er autoritativt utgangspunkt for eksisterende sak
- tom/stale lokal kladd får ikke overstyre reelt serverinnhold
- tilbudskladd og befaringskladd har egne recovery-lagre
- firmascopet sakslist-cache inneholder kun lett summary
- full reload/dvale i eksisterende sak kan gjenåpne aktuell sak
- Ny forespørsel/Nytt tilbud kan gjenopprettes selv før de har `request_ref`
- Rediger forespørsel gjenopprettes saksspesifikt
- eksplisitt brukerhandling stopper gammel recovery

Butikktilbud har i tillegg saksspesifikk serverautosave gjennom `salesStoreOfferAutosave.js`.

## 9. Kundevisning, PDF og aksept

Kundelenken bruker eksisterende høyt entropisk `publicOffer`-token. Kundevisning og PDF skal presentere samme publiserte versjon og priser inkl. mva. Forhåndsvisning er read-only.

Publiserte/aksepterte versjoner er immutable historikk.

## 10. Automatisk oppfølging – Butikktilbud

FASE 37A2 gjelder fortsatt uendret og er frozen med mindre funksjonen eksplisitt skal endres. Planen er versjonslåst og stopper ved aksept, avvisning, utløp, arkiv eller ny gjeldende publisert versjon.

## 11. Fremdriftsplan

Akseptert ordinært tilbud kan brukes som **forslag** til arbeidsoperasjoner i fremdriftsplan. Fremdriftsplan skriver aldri tilbake til tilbud, aksept, kontrakt eller akseptbevis. Butikktilbud brukes ikke som prosjektkilde.

## 12. Aksept- og avvisningsvarsling

Lagret kundeaksept/avvisning er autoritativ. E-post sendes etterpå og kan ikke reversere beslutningen.

Aktuelle serverkomponenter inkluderer `sales-offer-acceptance-notify` og `sales-offer-decline-notify`, med idempotens i egne varslingslogger.

## 13. Kontrakt og Avtalegrunnlag

Etter ordinær aksept kan saken fortsette med Expo-kontrakt, egen kontrakt eller ingen kontrakt. Synlig prosjektfane heter **Avtalegrunnlag**; intern nøkkel `tilbud` beholdes.

Dokumentert tetthetsgaranti krever signert kontrakt sammen med øvrige garanti-/Sopro-/overtagelseskrav.

## 14. Viktige filer i Sales 42J

```text
src/modules/sales/SalesModule.jsx
src/modules/sales/SalesModuleCore.jsx
src/modules/sales/components/SalesListView.jsx
src/modules/sales/components/SalesRequestForm.jsx
src/modules/sales/components/SalesInspectionNote.jsx
src/modules/sales/components/SalesOfferBuilder.jsx
src/modules/sales/components/SalesStoreOfferBuilderGrouped.jsx
src/modules/sales/components/SalesCustomerViewCore.jsx
src/modules/sales/services/salesSupabase.js
src/modules/sales/services/salesResumeRecovery.mjs
src/modules/sales/services/salesLocalStorage.js
src/modules/sales/services/salesLocalStorageCore.js
src/modules/sales/services/salesStoreOfferAutosave.js
scripts/critical-sales-recovery-check.mjs
scripts/critical-sales-tab-resume-check.mjs
scripts/critical-sales-entry-resume-check.mjs
scripts/critical-sales-server-hydration-check.mjs
scripts/critical-sales-lazy-loading-check.mjs
scripts/critical-sales-overview-check.mjs
```

## 15. QA før merge

Ved Sales-endringer skal minst følgende verifiseres:

- alle critical checks og Vite build grønne
- Befaring/Tilbud-listen åpner raskt med korrekte tellere
- Forespørsler viser ubokede `Forespørsel`-saker og planlagt befaring flytter saken videre
- stor eksisterende sak henter komplett innhold først ved åpning
- tilbudslinjer, priser, opsjoner, bilder og Badskisse er intakte etter detaljhydrering
- Ny forespørsel: delvis kundeinfo → PC-fanebytte/mobil appbytte → samme skjema og tekst ved retur
- Rediger forespørsel: samme test, bundet til riktig sak
- eksplisitt Avbryt/Tilbake skal ikke senere reverseres av recovery
- Butikktilbud redigering/autosave/Tilbake og kundepreview ved relevant endring
- immutable tilbud/aksept/avvisning endres ikke
- HJELP og arkitektur oppdateres samme runde når arbeidsflyt/arkitektur endres

## 16. Utsatt videreutvikling

- NOBB/Byggtjeneste-berikelse via GTIN
- ERP-vareliste/PDF etter aksept gruppert på leverandør
- CSV/Excel-eksport av varebehov
- kontrollert demo-/testdataflyt med reset/sletting
- trygg oppgradering av eldre **redigerbare** tilbudsutkast; publisert/akseptert historikk forblir immutable
