# FASE 40B – Komplette Butikktilbud-maler

Status: Preview / ikke produksjonsmerget
Dato: 08.09.2026

## Formål

Fase 40B utvider Butikktilbud med firmadelte komplette tilbudsmaler uten å endre ordinær Våtromstilbud-flyt. Malen kan gjenbruke tilbudstekst, avsnitt, poster, montering, opsjoner og rekkefølge.

## Avgrensning

- Gjelder kun `isStoreOfferRequest(...)`.
- Ordinær `SalesOfferBuilderStandard` er urørt.
- Ingen ny database-/RLS-migrering.
- Eksisterende `sales_offer_templates` brukes fortsatt som firmascopet mal-lager.
- Publiserte, aksepterte og avviste tilbudsversjoner endres ikke.
- Bilder og PDF-vedlegg lagres ikke i firmamalen.
- Avsender, saksbehandler og automatisk oppfølgingsplan kopieres ikke fra malen.

## Maltyper

Eldre tekstmaler beholdes bakoverkompatibelt:

- `store-offer-text-v1`: tekst/vilkår, ingen struktur.
- `store-offer-complete-v2`: komplett Butikktilbud-struktur.

Nye v2-maler lagrer blant annet:

- tilbudstittel og kundetekster
- betalingsbetingelser og gyldighet
- avsnitt (`store_text`)
- tilbudsposter og rekkefølge
- monteringsposter
- tillegg/oppgraderinger
- alternativer som erstatter konkrete poster
- kobling mellom post, montering og opsjon

## Prisregel

Katalogpris er aldri malens autoritative pris.

Når en katalogvare lagres i en v2-mal beholdes katalogreferansen (`storeCatalogItemId`), men `storeUnitPriceInclVat` og `amount` tømmes i malpayloaden. Når malen brukes hentes varen på nytt fra aktiv `internal_store_catalog_items` under eksisterende RLS og får gjeldende `customer_price_incl_vat`.

Tjenesten henter ikke `purchase_net_ex_vat`, listepris, DG eller andre interne innkjøpsfelter. Disse skal aldri inn i mal-, tilbuds- eller kundedata.

Manuelle poster uten katalogreferanse beholder lagret malpris.

Hvis en tidligere katalogvare ikke lenger finnes aktivt, opprettes posten uten pris og brukeren får beskjed om å velge/prissette varen på nytt. Gammel katalogpris gjenbrukes ikke som fallback.

## Nye ID-er ved gjenbruk

En mal skal kunne brukes flere ganger uten ID-kollisjoner. Ved materialisering genereres derfor nye ID-er, og interne relasjoner remappes samlet:

- `storeSectionId`
- `storeParentProductId`
- `replacementLineId`
- `storeInstallationReplacementLineId`

Dette bevarer avsnitt → post → montering/opsjon-relasjon uten å gjenbruke ID-er fra tilbudet malen opprinnelig ble lagret fra.

## Metadata som beholdes fra aktuell sak

Ved bruk av mal beholdes eksisterende `__storeOfferMeta` fra den aktuelle kladden. Dermed følger ikke tidligere saksbehandlers metadata med malen:

- valgt merkevare/avsender
- saksbehandler/signatur
- automatisk oppfølgingsplan

Kunde, adresse og øvrig saksidentitet beholdes også fra den aktuelle salgssaken. Disse kontrolleres og låses først når den aktuelle tilbudsversjonen publiseres.

## Endelig UX

40B følger samme mentale modell som ordinære tilbudsmaler uten å bygge om den eksisterende grouped builderen:

- `Bruk firmamal` vises øverst i Butikktilbud-skjemaet.
- `Lagre som mal` ligger i den avsluttende handlingslinjen sammen med `Forhåndsvis kundetilbud` og `Lagre butikktilbud`.
- På desktop over 900 px holdes de tre avsluttende handlingene på én linje når plassen tillater det.
- Nettbrett og mobil beholder responsiv wrapping/stabling; ingen tilbudsinformasjon eller handling skjules på mobil.
- Etter lagring, bruk eller sletting av mal vises tydelig handlingsfeedback der brukeren befinner seg. Ved malbruk opplyses også hvor mange katalogpriser som ble hentet på nytt, og manglende katalogvarer varsles særskilt.
- Den eksisterende meldingen i malpanelet beholdes som varig kontekst i tillegg til den kortvarige handlingsfeedbacken.
- Portaler monteres med endelige, tidsbegrensede installasjonsforsøk. Det brukes ikke `MutationObserver` i Butikktilbud-editoren.

## Verifisert QA 08.09.2026

Funksjonen ble testet i Preview mot midlertidig sak `TEST-40B-MALER` og mal `40B testmal`.

Verifisert lagring og gjenbruk:

- 2 avsnitt
- 5 tilbudsposter
- 2 monteringsposter
- 1 opsjon
- relasjonene mellom avsnitt, poster, montering og opsjon ble bevart etter materialisering
- katalogvaren CALIBRA var bevisst lagret med 140 000 kr i testkladden og ble oppdatert til aktiv katalogpris 149 520 kr ved bruk av malen
- manuell post `Akk tank` beholdt malpris 6 000 kr
- autosave lagret den materialiserte kladden på server
- kunde-/saksidentitet ble beholdt og malpayloaden inneholdt ikke bilder, vedlegg eller historiske publiseringsdata
- tydelig handlingsfeedback etter `Bruk valgt mal` ble manuelt godkjent i Preview
- desktop sluttlinje med `Forhåndsvis kundetilbud` → `Lagre som mal` → `Lagre butikktilbud` ble manuelt godkjent

De midlertidige QA-dataene er en merge-gate og skal slettes og verifiseres borte før PR/merge. Historisk sak F-2026-0062 skal ikke endres i denne oppryddingen.

## Filer

- `src/modules/sales/services/salesStoreOfferCompleteTemplates.js` – lagring/materialisering/prisoppdatering/ID-remapping.
- `src/modules/sales/components/StoreOfferCompleteTemplatePanel.jsx` – lagre, bruke og slette mal, samt tydelig handlingsfeedback.
- `src/modules/sales/components/SalesStoreOfferBuilderCatalogTemplates.jsx` – tynn wrapper rundt eksisterende Butikktilbud-bygger.
- `src/modules/sales/components/SalesOfferBuilder.jsx` – ruter kun Butikktilbud gjennom 40B-wrapperen.
- `src/modules/help/helpTools.js` – gjeldende brukerveiledning for komplett Butikktilbud-mal.
- `scripts/critical-store-template-check.mjs` – permanent QA-sperre.

## Sikkerhetskontrakt

1. Vanlig Våtromstilbud skal ikke gå gjennom 40B-wrapperen.
2. Intern nettopris skal ikke leses inn i malmotoren eller kopieres til mal/tilbud.
3. Eksisterende katalog-RLS er tilgangsgrensen for prisoppdatering.
4. Publisert/akseptert/avvist historikk er uforanderlig.
5. Malbruk erstatter kun redigerbar Butikktilbud-kladd etter eksplisitt bekreftelse dersom kladden allerede har strukturert innhold.
6. Autosave/recovery fortsetter å være eksisterende Butikktilbud-autosave etter at malinnholdet er lagt inn i `offerForm`.
7. Kunde, adresse, ansvarlig/signatur, merkevare/avsender og oppfølgingsplan skal komme fra aktuell sak, ikke fra malen.
8. Bilder, PDF/vedlegg, public token, tilbudsversjoner, aksept/avvisning, prosjektkobling og annen saks-/historikkmetadata skal aldri kopieres fra en komplett firmamal.
