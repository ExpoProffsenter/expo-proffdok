# Expo ProffDok – Sales / Befaring / Tilbud / Generelt tilbud / Aksept / Kontrakt

**Status:** Production inkluderer godkjent PR #207 med antall, nye serverlagrede plukklister og separate utskriftsvalg i Prissøk på PC, i tillegg til PR #206 og de tidligere mobil-/plukklisteendringene. Sales-flyten og mobil tilbudsskanning er bevart.
**Oppdatert:** 03.10.2026

Sales håndterer både ordinær Befaring/Tilbud-flyt og Generelt tilbud for varer, arbeid, underentreprenører og andre leveranser. Den tekniske legacy-identiteten `Butikktilbud`/`store offer` beholdes der det trengs for kompatibilitet.

Ordinære tilbud kan etter aksept gå videre til Expo-kontrakt, egen opplastet kontrakt eller direkte prosjekt. Et nytt Generelt tilbud kan etter aksept aktiveres som Enkel ordre eller ordinært prosjekt. Eksisterende historiske Butikktilbud beholder sin opprinnelige avslutning og skal ikke konverteres automatisk.

**Kontrakt er ikke et generelt prosjektkrav.** Signert kontrakt kreves først når dokumentert tetthetsgaranti faktisk skal utstedes.

## 1. Gyldige prosjektveier

```text
A) Direkte prosjekt uten tilbud
B) Akseptert ordinært tilbud → prosjekt uten kontrakt
C) Akseptert ordinært tilbud → egen opplastet kontrakt → prosjekt
D) Akseptert ordinært tilbud → Expo-kontrakt → prosjekt
E) Akseptert Generelt tilbud → Enkel ordre eller ordinært prosjekt
```

Historiske Butikktilbud følger tidligere avslutning:

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

## 3. Generelt tilbud – hovedflyt

```text
Nytt tilbud
→ velg Generelt tilbud
→ kunde/ansvarlig/merkevare
→ tilbudsposter og avsnitt
→ valgfritt katalogsøk
→ montering og opsjoner
→ autosavet kladd
→ kundepreview
→ publisert låst versjon
→ kundelenke/e-post
→ aksept eller avvisning
→ låst akseptert versjon
→ velg Enkel ordre eller ordinært prosjekt
```

Generelt tilbud kan brukes til varer, arbeid, underentreprenører og andre leveranser. Historiske Butikktilbud skal fortsatt åpnes med samme data og historikk som før.

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
- Historiske Butikktilbud skal ikke automatisk aktivere prosjekt. Nye Generelle tilbud kan etter aksept aktiveres som Enkel ordre eller ordinært prosjekt.
- Intern ERP-nettopris skal aldri inn i kundedata, publisert tilbud, PDF eller akseptbevis.
- E-postvarsling etter aksept/avvisning er sekundært sideutfall og kan aldri reversere lagret kundebeslutning.

## 5. Generelt tilbud – tilbudsposter og avsnitt

Den synlige modellen er **Tilbudsposter og avsnitt**. Avsnitt lagres som `store_text` med `storeSectionMode = "group"` og skal ikke valideres eller presenteres som prislinjer.

Robust avsnittsdeteksjon ligger i `src/modules/sales/utils/storeSectionLine.js` og brukes i internvisning, kundelenke, tilbuds-PDF og akseptbevis.

## 6. Post, montering og opsjoner

En tilbudspost kan være manuelt arbeid, UE/annen leveranse eller katalogvare. Katalogkobling låser ikke kundebeskrivelsen.

Montering kan knyttes til post eller opprettes som `Kun montering`. Opsjoner kan være tillegg/oppgradering eller alternativ/erstatter.

Komplette firmamaler beholder varige app-/Storage-bilder på poster og opsjoner. Bare `https:`- og trygge rot-relative bildepekere lagres; midlertidige `data:`/`blob:`-bilder fjernes, og PDF-vedlegg følger aldri en mal. Eldre maler som ble lagret uten bildepeker må lagres på nytt fra et tilbud som fortsatt har bildet.

## 7. Internt og eksternt proff-vareregister

Selvstendig Prissøk i `src/modules/storeCatalog/` bruker eksisterende read-only katalog-RPC og er ikke del av Sales-editoren. Plukklister med antall og valgfritt manuelt Cordel-ordrenummer kan opprettes/redigeres på både PC og mobil via eksisterende brukerbundne plukkliste-RPC-er. Plukklisteutskrift viser antall/ordrenummer uten priser, mens PC også har separat prisutskrift med serverstyrt intern nto-tilgang og eksplisitt avkryssing. På mobil avslutter `← Startside` Prissøk via eksisterende close-flyt og rydder resume-markøren. Skanneren finnes bare på mobil og fyller GTIN/EAN i samme søkefelt; kamera og bilde lagres eller lastes ikke opp. Ved avvist kameratilgang fungerer manuell inntasting. Se [plukklistemodellen](../../../docs/architecture/MOBILE_PICKLIST_AND_GENERAL_OFFER_SCAN.md).

Generelt tilbud kan bruke vareregister fra `src/modules/storeCatalog/`.

Tilgang krever aktiv/godkjent bruker, relevant modultilgang og autorisert firmascope. Interne brukere i Ringside/Bademiljø Expo/Expo Proffsenter kan gis tilgang til hele internkatalogen, men intern netto innkjøpspris følger aldri automatisk med og skal aldri lekke til kundegrunnlaget.

For ekstern Proff kreves `sales`, firmatilgang til `store_offers` og aktiv leverandørtilgang for firmaet. Kun Systemadministrator kan aktivere Proff-vareregisteret, styre leverandører/rabatter og slå på Generelle tilbud for firmaet. Når firmatilgangen er aktiv, får alle nåværende og nye brukere i firmaet Generelle tilbud; Enkel ordre velges først etter kundeaksept. Ekstern bruker ser aldri Ringsides interne purchase-netto, innkjøpsrabatt, DG eller påslag. «Din nto pris» krever separat bruker- og firmascopet rettighet; Firmaadmin kan administrere andre brukere i eget firma, men ikke gi rettigheten til seg selv. Intern nto krever fortsatt eksplisitt `view_internal_net_prices`, også for interne brukere.

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

Audit-recovery av tilbud sammenligner lokal sikkerhetskopi med aktiv kladd. Et bekreftet valg er bundet til sikkerhetskopiens revisjon, ikke til aktiv kladds senere `savedAt`; samme backup skal derfor ikke utløse nye dialoger ved hver autolagring. Dialogen omtaler begge som lokale versjoner. Valgt lokal kladd beholdes ved samtidig serverkonflikt, og varig autolagring forsøkes igjen etter recovery-overgangen. Dette er sikret i PR #206 og `critical-sales-recovery-check.mjs`.

Generelt tilbud har i tillegg saksspesifikk serverautosave gjennom `salesStoreOfferAutosave.js`.

## 9. Kundevisning, PDF og aksept

Kundelenken bruker eksisterende høyt entropisk `publicOffer`-token. Kundevisning og PDF skal presentere samme publiserte versjon og priser inkl. mva. Forhåndsvisning åpnes separat, er read-only og kan ikke publisere, sende e-post, akseptere eller avvise. Originalfanen skal bli stående på samme tilbud.

Kontrakt-PDF grupperer sammenhengende avsnitt i samme kort, bruker ledig sideplass før sideskift og holder opsjonsbeskrivelse/pris samlet. PDF-layouten skal aldri endre det låste kontraktsgrunnlaget.

Publiserte/aksepterte versjoner er immutable historikk.

## 10. Automatisk oppfølging – Generelt tilbud

FASE 37A2 gjelder fortsatt uendret og er frozen med mindre funksjonen eksplisitt skal endres. Planen er versjonslåst og stopper ved aksept, avvisning, utløp, arkiv eller ny gjeldende publisert versjon.

## 11. Prosjektaktivering og fremdriftsplan

Akseptert ordinært tilbud kan brukes som **forslag** til arbeidsoperasjoner i fremdriftsplan. Et akseptert Generelt tilbud bruker den aksepterte versjonen og valgte alternativer som låst bestillingsgrunnlag og kan aktiveres som Enkel ordre eller ordinært prosjekt. Fremdriftsplan skriver aldri tilbake til tilbud, aksept, kontrakt eller akseptbevis.

Enkel ordre er en lett prosjektmotor for produkter, bilder, relevante sjekklister, UE og sluttdokumentasjon. Fremdriftsplan og FDV er valgfrie. Kundeportal er blokkert både i klient og serverregler.

## 12. Aksept- og avvisningsvarsling

Lagret kundeaksept/avvisning er autoritativ. E-post sendes etterpå og kan ikke reversere beslutningen.

Aktuelle serverkomponenter inkluderer `sales-offer-acceptance-notify` og `sales-offer-decline-notify`, med idempotens i egne varslingslogger.

## 13. Kontrakt og Avtalegrunnlag

Etter ordinær aksept kan saken fortsette med Expo-kontrakt, egen kontrakt eller ingen kontrakt. Synlig prosjektfane heter **Avtalegrunnlag**; intern nøkkel `tilbud` beholdes.

Hvis Expo-kontrakt ikke ble opprettet før prosjektaktivering, viser Avtalegrunnlag en tydelig kontraktinngang og gjenbruker samme `SalesContractActions`/`SalesContractWizard` mot den låste aksepterte tilbudsversjonen. Brukeren blir i Prosjekt. Kunde-/UE-portal skjuler inngangen, og låst prosjekt eller supportmodus kan lese status/dokumenter, men kan ikke opprette, redigere, signere, sende eller sluttarkivere kontrakt. Nye prosjekter bevarer `salesOfferId`; eldre prosjekter kan hente den via eksisterende `get_sales_offer_by_token`. Hvis prosjektet allerede har slutt-PDF som matcher kontraktens ID/path/URL, skal ren visning ikke kalle ny prosjektsynk eller endre `projects.updated_at`. Endringen krever ingen ny database-, RLS-, Storage- eller Edge Function-kontrakt.

Dokumentert tetthetsgaranti krever signert kontrakt sammen med øvrige garanti-/Sopro-/overtagelseskrav.

Når en Expo-kontrakt signeres og arkiveres automatisk i prosjektets Avtalegrunnlag, skal dokumentreferansen bevare bedriftssignatarens autentiserte navn i feltet `by`. Auditaktøren skal ikke ende som «Ikke angitt» når `company_signed_by_name` finnes på kontrakten.

## 14. Viktige filer i Sales 45B

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
src/modules/sales/services/salesContracts.js
scripts/critical-sales-recovery-check.mjs
scripts/critical-sales-tab-resume-check.mjs
scripts/critical-sales-entry-resume-check.mjs
scripts/critical-sales-server-hydration-check.mjs
scripts/critical-sales-lazy-loading-check.mjs
scripts/critical-sales-overview-check.mjs
scripts/critical-production-closeout-check.mjs
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
- kundepreview åpner i ny fane, originalfanen beholder samme tilbud, og preview har ingen publisering/e-post/aksept
- ekstern Proff ser bare godkjente leverandører og ingen interne sensitive prisfelt
- «Din nto pris» og intern nto følger hver sin eksplisitte serverrettighet
- akseptert Generelt tilbud bruker låst snapshot og kan aktiveres som Enkel ordre eller ordinært prosjekt
- Enkel ordre har ingen kundeportal; fremdriftsplan og FDV er valgfrie
- immutable tilbud/aksept/avvisning endres ikke
- HJELP og arkitektur oppdateres samme runde når arbeidsflyt/arkitektur endres

## 16. Utsatt videreutvikling

- NOBB/Byggtjeneste-berikelse via GTIN
- ERP-vareliste/PDF etter aksept gruppert på leverandør
- CSV/Excel-eksport av varebehov
- kontrollert demo-/testdataflyt med reset/sletting
- trygg oppgradering av eldre **redigerbare** tilbudsutkast; publisert/akseptert historikk forblir immutable

## 17. Cordel-eksport av akseptert tilbud og plukkliste

`src/modules/cordel` lager eksportfiler lokalt fra eksisterende, autorisert grunnlag. Aksepterte/aktiverte tilbud bruker kun låst versjon og valgte opsjoner; hver prispost avrundes til øre og summen må være identisk med eksplisitt akseptert total. Kladd brukes aldri som fallback. Eksporten endrer ingen tilbud, prosjekter, backenddata, hydration eller recovery.

Én ZIP inneholder `ProffDok_Cordel_Jobbliste.txt` og `ProffDok_Cordel_Ordre.AFG`. Den bekreftede Cordel-flyten er jobbliste først, AFG etterpå på samme tomme ordre uten sletting. Jobber nummereres fra 1. Prekalkulerte Rundsum-priser unngår Cordels time-/pakkeoppslag. 0 % materiellpåslag og øreavrunding kreves; reell kost, timebudsjett og fortjeneste overføres ikke. AFG alene oppretter ikke jobbregisteret.

Plukklisten bruker én prisfri ASCII-fil med NR, Mengde og Fagområde/leverandør. Cordel henter egne priser. Ordrenummeret i ProffDok er en brukerrettet påminnelse, ikke automatisk ruting. Hjelp-temaet **Eksport av tilbud til Cordel** beskriver oppsett, faste P:-filer, importene, kontroller og feilsøking med originale TEST-bilder.
