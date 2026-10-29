## Kundepreview med appens innlogging – Preview 26.10.2026

Miljømål **BEGGE**. Baseline er publisert main `3ba4d228` (PR287, fullført i
Production og demo). Ny rettelse bruker samme arbeidsbranch og faste Preview.
Ny TEST OK kreves før denne rettelsen merges eller publiseres i Production.

«Forhåndsvis som kunde» åpner den lagrede kladden i en dialog i samme dokument
på PC og mobil. Visningen gjenbruker appens registrerte Supabase-klient og
krever ikke at en ny fane kan lese lagret innlogging. Tilbake/Escape lukker bare
forhåndsvisningen. Serverhenting, firma-/tilgangskontroll og skrivebeskyttet
kundevisning beholdes. Ingen auth-kjerne, editor/autosave, publisering, aksept,
e-post, database eller visning av allerede publiserte kundetilbud endres.
Avgrensning, feildiagnose og faktiske tester: `docs/qa/SALES_INLINE_PREVIEW_20261026.md`.

## Kundepreview: ny innloggingskontroll og PDF-overskrifter – Preview 25.10.2026

Den skrivebeskyttede kladdevisningen gjenopptar etter ny innlogging og tilbyr Prøv igjen ved feil. Eget session-abonnement og foreground-kontroll bevarer prøvevalg ved samme bruker/firma, sperrer gamle bruker-/firmadata og ignorerer sene svar etter cleanup. Ingen tokens overføres mellom adresser, og ingen editor/recovery-runtime monteres. Aktiv tilbuds-PDF gjenkjenner også «Oppstart, tildekking og riving» og «Gulv og membran» som mellomtitler. Øvrig tekst/pris/aksept er uendret. Miljømål BEGGE, ny TEST OK før Production. Se `docs/qa/SALES_DRAFT_PREVIEW_AND_HEADINGS_20261025.md` for bevis, kjente begrensninger og konkret brukertest.

## Boligprosjekter – separat avtalehistorikk 22.10.2026

Boligprosjekter har egne katalog-/avtale-RPC-er og en separat `bolig-kunde.html` for beboeraksept og endringsordre. Dette bruker ikke Sales-tilbudets aksepthandler, versjoner eller recovery. Se `docs/qa/BOLIG_ENDRINGSORDRE_AKSEPT_20261022.md`. Sales-rettelsene i main fra PR #279/#280 er synkronisert uendret inn i boligbranchens Preview.

## Kundens antall på opsjoner – Preview 17.10.2026

Opt-in `customerCanChooseQuantity` lagres i opsjons-JSON, mal/kladd og publisert versjon. Begge aktive tilbudsbyggere støtter tillegg med null eller positiv enhetspris; erstatningsalternativer har fast antall. Kunden kan endre antall direkte; en mengdeendring velger tillegget atomisk uten å fjerne andre valg. Avkryssing kan fortsatt fjerne tillegget uten å miste mengdekladden. Antall er > 0, ≤ 100 000 og høyst tre desimaler (komma tillatt). Summer beregnes med uendret intern eks. mva.-modell. Ny RPC `accept_sales_offer_quantities` kontrollerer forventet versjon under samme radlås som eksisterende aksept. Begge RPC-er henter pris, fast antall og øvrig opsjonsinnhold fra publisert versjon; bare tillatt antall kan komme fra klienten. Ukjente/dupliserte valg og motstridende erstatningsalternativer avvises. `accepted_payload.selected_options`, `accepted_total` og uendret `version_snapshot` er grunnlag for senere gjenåpning, aksept-PDF, signert kontrakt, bestillingsgrunnlag og prosjektaktivering. Eldre lagrede aksepter endres ikke. Migrasjon: `20261017124151_customer_option_quantities.sql`. Sandbox anvendt og transaksjonstestet; migrasjonen er også registrert i Production som 20261017131349 (lest tilbake 22.10.2026). QA/testliste: docs/qa/CUSTOMER_OPTION_QUANTITIES_20261017.md.

## Samlet UX-runde 16.10.2026 – Preview før ny TEST OK

Miljømål: BEGGE. Baseline er publisert main `5cc7e530685a48f4f59b403357e654e93c724578` (PR #260, godkjent og publisert). Eldre Preview-statuser lenger nede er historikk.

Brukeren har bestilt alle forslagene fra appgjennomgangen, med bevaring av eksisterende funksjoner. Denne runden samler prosjektstatus og meny, daglig timeføring, varevisninger, HR/håndbok, sjekkliste-/bilde-/produktoversikter, bemanningsgrunnlag, kundekladd-forhåndsvisning, admin og Hjelp. Visningsvalg bruker de opprinnelige handlingene. Smartere varesøk i telling bruker allerede publisert RPC; klassisk søk er tilgjengelig. Ingen migrasjoner, tilgangsregler, priser, e-posttransport, signering, autosave eller server-first-hydrering endres.

Scope, verifikasjon og teststeg: `docs/qa/APP_UX_REVIEW_20261016.md`. Fast Preview: https://expo-proffdok-git-fix-company-admin-scope-20261015-ringside.vercel.app/ . Denne runden er ikke godkjent for merge. Production og permanent demo beholder eksisterende versjon til ny TEST OK og vanlig releasekontroll er gjennomført.

## Befaring: vent på komplett sak før skjema/kladd – Preview

Innlogget etterkontroll avdekket også at wrapperens prefetch holdes i minnet til Core sin eksisterende asynkrone listehenting bruker den. Lokal requests-cache kan derfor fortsatt være summary ved første Core-render. Den nye initializeren alene var ikke tilstrekkelig. Befaringsnotatet har nå en saksspesifikk ready-state: ingen editor, lokal kladdlagring eller submit før komplett sak er tilgjengelig og skjemaet er hydrert. Meningsfull lokal/offline-kladd beholdes. Sen serveroppdatering kan ikke nullstille et ferdig hydrert skjema. Ingen endring av innlastingskall, recovery-timere, wrapper, tilbudseditor, serverlagring eller øvrige moduler.

21 permanente kontroller kjører faktisk Core-initializer og faktiske hydration-/lokallagringseffekter i React-rekkefølge, inkludert summary → full sak, utsatt state-commit, saksskifte og bevisst exit. Full critical/Sandbox build PASS. 128 editor-/tekstvalg-kontroller er fortsatt grønne; ingen UI-endring siden de ble kjørt. Endelig innlogget kontroll og ny SHA/CI føres i PR #260. Ny TEST OK gjenstår; Production urørt.

## Befaring: eksplisitt valg for tidligere tom lokal tekst – Preview

Innlogget etterkontroll viste at den gamle feilen også kan ha etterlatt en lokal kladd med bilder, men uten tekst, mens serveren fortsatt har tekst. Slike lokale medier regnes med rette som meningsfullt arbeid. Notatet viser derfor et synlig valg: Bruk teksten fra saken eller Behold tom lokal tekst. Tekstfelter og Lagre er sperret til valget er tatt, og submit har samme sperre. Servervalget kopierer bare de fire tekstfeltene; lokale bilder/Badskisse og alle lagrings-/recovery-regler beholdes. Ingen ny browserlagring, automatisk serveroverskriving eller generell konflikthåndtering innføres. Bevisst tømming etter normal åpning fungerer som før.

128 faktiske editor-Chromium-kontroller og elleve actual-Core/helper-scenarier PASS, inkl. begge valg, sperret lagring før valg og bevarte bilder/skisse. Første søke-/initialstate-head b3cfeeee har Core Safety #497 SUCCESS og Preview dpl_E4VJKMMdVkZn9g9Ha7TU3UAKfCUy READY. Denne oppfølgingens endelige SHA/CI/innloggede kontroll føres i PR #260. Ingen TEST OK/merge/Production.

## Smartere Prissøk og sikker befarings-retur – Preview 16.10.2026

Miljømål BEGGE. Smartere søk finner alle ordene i fri rekkefølge og tar med avgrensede fagaliaser (servantkran/servantbatteri/servbatt, dusj-/kjøkkenkran, WC/klosett/toalett, sort/svart, krom/chrome). Eksakte varenummer/EAN kommer først; alias-treff merkes. Slå av Smartere søk for uendret vanlig søk. Ingen KI-tjeneste eller ekstern utsending; dette er et avgrenset katalogoppslag, ikke generell stave-/betydningsforståelse. Alle farge-/dimensjons-/merkeord beholdes som krav.

Ny lesende `search_internal_store_catalog_prices_smart` med samme tilgang/nettomaskering og aktiv-importfilter. Gamle søk/RPC-er, tilbudsoppslag, varetelling, plukklistelagring/eksport og varedata er uendret. Migrasjon 20261016190242 er installert bare i Sandbox, ikke Production. 41 PostgreSQL- og 70 Chromium-kontroller PASS; eksisterende mobilskann-QA kontrolleres også.

Etterkontroll av editorleveransen avdekket eksisterende tom initialstate ved direkte remount i befaringsnotat. Test mot uendret main feiler. Core initialiserer nå kun dette arbeidsbildet fra meningsfull scoped lokal kladd eller ferdiglastet servergrunnlag; ordinær detaljflyt er uendret. Ingen recovery-timere, nettlagring, server-autosave, navigasjon eller andre moduler endres. Sju permanente initialstate-kontroller kjøres i full critical. Servertekst og bilder på DEMO-02 er kontrollert intakte; skjemaet ble ikke lagret i feilsøkingen. QA: docs/qa/SALES_EDITOR_UX_20261016.md og docs/qa/SMART_PRICE_SEARCH_20261016.md. Ny TEST OK kreves før merge/Production/demo-synk.

## Editorflate – Preview 16.10.2026

Befaringsnotat: tekstfeltene samlet i to kolonner på PC, én på mobil, før uendret Badskisse og bilder. Våtromstilbud: fire leveranse-/forbeholdsfelt i samme kortoppsett, kompakt topp/malvelger og ikke-sticky tilbakefelt. Scope er bare SalesInspectionNote.jsx, SalesOfferBuilderCore.jsx og lokal CSS. Server-first, kladd, recovery, bilde-/skissehåndtering, kalkulasjon, malhandlinger og alle callbacks er uendret. Generelt tilbud sin editor er urørt. QA: docs/qa/SALES_EDITOR_UX_20261016.md. Ny TEST OK kreves.

## Knappoppfølging 16. oktober 2026 – Preview

Den godkjente kompakte salgsrunden er publisert via PR #257. Nytt tilbud flyttes nå inn ved siden av Ny forespørsel i oversiktens toppfelt. Samme eksisterende startDirectOffer åpner samme tilbudstypevalg; SalesCore sender bare callbacken videre. Den gamle snarveien beholdes utenfor oversikten. Ingen editor-/lagrings-/tilbudslogikk endres. Ny TEST OK kreves.

## UX-oppfølging 16. oktober 2026 – Preview

Salgsoversikten bruker én farget, klikkbar statusoversikt med eksisterende antall/buckets, søk og tilbudstypefilter. Befaring-hurtigfilteret bruker fortsatt eksisterende adapter/søk. Tilbake fra sak gjenoppretter søk, tilbudstype, status og scroll fra en UI-ref i den fortsatt monterte SalesCore, avgrenset med eksisterende salesStorageKey. Ingen saksdata eller ny browserlagring; remount starter vanlig eksisterende navigasjon/recovery. Intern saksvisning har et normalt tilbakefelt, tettere kunde-/notatkort og én visnings-/redigeringshandling per tilbud. Callback, publisert versjon, oppfølgingsplan og kundedata er uendret.

Scope: SalesListView, SalesDetailViewCore, lokal CSS, én klasse på direkte tilbud-knappraden i SalesModule, fire linjer for UI-ref/props i SalesCore og én klasse på Sales-introen i main.jsx. Ingen endring av editor eller tjenester. QA/testliste: docs/qa/SALES_OVERVIEW_UX_20261016.md. Ny TEST OK kreves.

# Expo ProffDok – Sales / Befaring / Tilbud / Generelt tilbud / Aksept / Kontrakt

**Status:** Production inkluderer godkjent PR #207 med antall, nye serverlagrede plukklister og separate utskriftsvalg i Prissøk på PC, i tillegg til PR #206 og de tidligere mobil-/plukklisteendringene. Sales-flyten og mobil tilbudsskanning er bevart.
**Oppdatert:** 03.10.2026

Sales håndterer både ordinær Befaring/Tilbud-flyt og Generelt tilbud for varer, arbeid, underentreprenører og andre leveranser. Den tekniske legacy-identiteten `Butikktilbud`/`store offer` beholdes der det trengs for kompatibilitet.

## Saksbehandler og intern akseptkvittering – review 29.10.2026

Nye saker krever et eksplisitt valg av saksbehandler fra godkjente brukere med riktig firmatilgang. UUID og visningsnavn velges sammen. Eksisterende saker, også Akseptert/Aktivert, har feltet Saksbehandler og Lagre saksbehandler for sikker nybinding. Gamle fritekstnavn og publiserings-/signaturhistorikk gir aldri automatisk brukerbinding.

Kanonisk binding og revisjon ligger privat på server; stale bulk-autosave kan ikke bytte ansvarlig, og et foreldet eksplisitt valg avvises med HTTP409. Intern akseptmail bruker dagens bekreftede Auth-identitet med fersk tilgang, uten fallback til publisist. Kundekvitteringen og historisk deduplisering beholdes. Ingen retroaktive utsendinger eller tilbakefylling inngår. Arkitektur, testgrunnlag og begrensninger: [SALES_CASE_HANDLER_IDENTITY.md](../../../docs/architecture/SALES_CASE_HANDLER_IDENTITY.md). Sandbox har migrering `20261029191431` og acceptance-notify v6, med 0 bindinger og ingen utsendinger. Production er uendret. Publisert app-Preview, innlogget Sandbox-integrasjon og TEST OK gjenstår.

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

## Kundeprofiler og mva.-visning

Firmakunderegisteret er frivillig, og kundeinformasjon kopieres ved eksplisitt valg i SalesRequestForm. Egen Lagre kunde-knapp skriver registeret; vanlig skjema-/tilbudslagring lagrer ikke kunden automatisk. Begge tilbudstyper har Vis priser eks. mva., av som standard. `offerShowPricesExVat` i kladden mappes til terms snapshot ved publisering; metadata styrer kundelenke, opsjoner/enhetspris, akseptvisning og PDF. Totalsummer viser også avgift og inkl.-total. Beregnet intern sum, kundens aksept og Cordel-eksport endres ikke av visningsvalget.

Generelt tilbud: Prisvisning til kunden ligger øverst i aktive SalesStoreOfferBuilderGrouped. Valget følger lokal kundetilbud-forhåndsvisning og grunnsumfeltet, uten å konvertere de lagrede prislinjene.

Kunderegister: velg kunde i nedtrekksmenyen eller søk. Lagring ligger i egen ramme nederst før opprett tilbud og må velges aktivt. Prisvisningsteksten presiserer bedriftskunder.

## Mobil tilbudslesing – 13. oktober 2026

Miljømål BEGGE, fra main 59682a0902615437677c129fb18fe154350b127e. Intern tilbudsvisning og kundevisning får hovedposter med Åpne hovedpost/Lukk hovedpost, lukket som utgangspunkt på mobil og åpent på desktop. Nummer/tekst/pris i grupperte rader får avgrenset mobil-layout; priser ligger under teksten. Små Til toppen/Til bunnen-knapper på lange tilbudssider skjules under tekstinntasting og ligger over eksisterende mobil Lagre-knapp. Se kundens tilbud/Forhåndsvis som kunde åpner mobil kundepreview i en native modal med fast Tilbake til tilbudet; samme interne saks-/editorinstans beholdes. Desktop og visninger uten modal-lytter beholder egen fane. Modaladresse må være same-origin og en kunde-/kladdvisning; ingen return-token eller ny offentlig tilganger.

Scope er presentasjon/CSS, isolert modal/scroll-komponent og to eksisterende open-handlinger. Ingen lagring, publisering, pristall, aksept, e-post, server-hydrering/recovery eller SQL/RLS endres. E-postsperren for rutiner beholdes. Lesende produksjonskontroll av Andreas' F-2026-0087 og F-2026-0080 ga 23/13 linjer og 25/21 opsjoner. Tester bruker kun linje-/opsjonstekster, uten kundedata eller tokens; alle firma-/kunde-/brukerdata er uendret.

Actual Chromium QA PASS ved 320/360/390/760/1280: åpne/lukke, interne grupperte tekster uten prisoverlapp, ingen horisontal overflow, mobil modal-retur og topp/bunn. Gamle draft-preview/recovery/tab-resume/server-hydration/entry-resume og Befaring → Generelt tilbud passerer. Full critical/build/CI og innlogget Preview følger i release-PR før TEST OK/merge.

Mobilpiler: plasseres midt på høyre side, over innholdets lag og utenfor det flytende kundepreview-kortet. Synlighet følger faktisk scrollflate og mobilens synlige skjerm; kundevisning og interne tilbud får samme kontroll. Runtime-QA dekker kort over knappene og scrolling i en egen container.

Pilkontrollene har egen enkolonnet meny-layout og ruller dokumentet via window.scrollTo. Hvis Vercels Preview-verktøy finnes, trekkes pilene litt inn fra høyrekanten så begge kan trykkes. Runtime-QA bruker nå også appens faktiske globale mobil-/menystiler og en overlappende Preview-knapp.

Mobil 13. oktober: topp/bunn-kontrollen er flyttet til felles MobileScrollShortcuts i den autentiserte appskallet; én kontroll uansett valgt modul, mens isolert kundevisning har sin egen. SalesMobileTools beholder bare kundevisningsdialogen. Mobil startboks er avgrenset til tab=prosjekt uten valgt/nytt prosjekt, slik at HR/KS/HMS/profil/øvrige moduler åpner uten startboksen. Kun presentasjon, ingen endring i navigasjonshandlere, recovery, lagring, tilgang eller e-post. Permanent sjekk bruker faktisk rendererbetingelse; touch-QA på modulbytte/HR/KS/HMS/profil/Startsiden og eksisterende tilbudskontroller.


### Varetelling – Preview 15.10.2026

Systemadmin kan aktivere **Varetelling** per firma. I Prissøk får godkjente tellere egne delte tellelister med lager, dato og område, skanning/søk med eksplisitt leverandørvalg og manuell innlegging uten strekkode. Antall 0, desimaler, idempotent lagring, revisjonsvern og låst avslutning støttes. Listene bruker ikke plukklistens grense på 30 varer. Eksport henter alle sider, summerer områder per leverandør/varenummer til samme etablerte Cordel-vareformat med fast filnavn og gir separat CSV-kontrollfil. Ingen prisfelt eller direkte oppdatering av Cordel. Kenneth bekrefter samme vareimportoppsett som ved tilbud; faktisk prøveimport av tellefilen gjenstår; se `docs/qa/STOCKTAKE_20261015.md`. Bare Sandbox er migrert/aktivert for Preview, ikke produksjon.


Mobil Prissøk 15.10: Søk, kamera og treff vises rett under overskriften på mobil, før varetelling og lagrede/valgte plukklister. Tastaturet åpnes ved eget trykk i feltet; verken åpning, skanning eller valg av vare setter mobilfokus automatisk. PC-oppsettet beholdes. Kenneth ga «test ok på alt» kl. 13:18, inkludert denne avgrensede mobilrettingen.

### Plukkliste til leverandør (Preview, 15.10.2026)

Prissøk har «Send bestilling til leverandør». Brukeren kan skrive leverandørnavn og én valgfri e-postadresse, velge varer (også fra en blandet plukkliste), angi referanse, leveringsadresse og melding. Forhåndsvisningen hentes fra aktive katalogvarer på serveren; varenummer, netto-pris, linjesum og varesum eks. mva. følger bestillingen. Prisene hentes på serveren med fersk netto-tilgang. «Ordrebekreftelse sendes til» viser tydelig innlogget brukers e-postadresse med klikkbar lenke. Bestillingen bruker appens faste e-postformat med Expo ProffDok-toppfelt og firmalogo. «Husk leverandør og e-post» lagrer kontakten for det aktive firmaet etter bekreftet sending. Lagrede kontakter kan velges eller slettes; plukklisten beholdes.

Avgrenset implementasjon: `SupplierOrder.jsx`, `supplierOrderClient.js`, `supplierOrder.css`, RPC-ene `supplier_order_context`, `supplier_order_prepare`, `supplier_order_contact_delete` og worker `supplier-order-email`. Kontakter og uforanderlige sendekvitteringer ligger i `supplier_order_private` med RLS og uten direkte klienttilgang. Hvert brukerkall kontrollerer fersk Prissøk-tilgang, firma og medlemskap. Kun service_role kan fullføre sending og lagre kontakt. E-post bygger utelukkende på serverens feltutvalg, inkluderer avsenderens firmainfo og teksten «Ved utkjøring tilkommer leveringsomkostninger». Intern dispatch bruker et eget Vault-token og sjekker opprinnelig brukers tilgang på nytt. Stabile Resend-nøkler tillater samme forsøk på nytt i 23 timer; daglig egen cron sletter sendekvitteringer eldre enn to dager. Dette oppretter ingen ordre i Cordel/ERP eller langvarig ordrehistorikk.

QA: `node scripts/supplier-order-db-check.mjs`, `node scripts/supplier-order-email-check.mjs`, `node scripts/supplier-order-react-check.mjs`, full critical-suite og bygg. Sandbox først; ny TEST OK kreves før produksjonssetting og deretter kontrollert main → demo.

Plukklisten har en samlet handlingsrad: bestilling, utskrift av plukkliste, Cordel og prisutskrift. Internt prisvalg står under prisutskriften. Lagre, vis/skjul og slett står ved overskriften. På mobil står bestilling øverst i full bredde, med utskrift og Cordel under.

Versjonskonflikt og CPU (22.10.2026): Forventet avvisning fra accept_sales_offer_quantities er PT409, ikke 40001. Null/utdatert versjon avvises fortsatt. Dette retter ikke eller endrer hvilke versjoner som kan aksepteres. Kun SQLSTATE endres; database- og klientregresjon beskytter kontrollen. Sandbox er rettet; produksjon venter TEST OK. Se docs/qa/OFFER_CONFLICT_CPU_20261022.md.


### Befaringsbilder i stor visning – 23.10.2026

SalesInspectionNote knytter både vanlige befaringsbilder og lagret Badskisse til eksisterende bootstrap-bildeviser med samme `Åpne større bilde`-lenkekontrakt som kundetilbudets bilder. Viewer bruker gjeldende visnings-URL i samme fane; ingen nye bildedata eller lagring opprettes. Last opp/Fjern/Lagre, IndexedDB-kladd, server-first hydrering og tilbakeknapp er bevart. Sales editor Chromium-suiten kontrollerer nå faktisk bildeåpning, full originalkilde, lukking med knapp/Escape/bakgrunn, tastatur, bevart ulagret tekst og ingen utilsiktet submit ved fire skjermbredder.
