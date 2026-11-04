# Helappkontroll – fortsettelse 4. november 2026

## Gjeldende grunnlag

Miljømål **BEGGE**. Arbeid og innlogget QA begrenses til Preview/Sandbox. Ingen ny TEST OK, produksjonssetting, migrering eller demo-synk.

- Fersk main: `34daef4c0526b93ddbd84c3bfd97fb0833d97caf`; demo: `fd5aafa17d0a6412bebc60b586e328d682393d8e`.
- PR308s masseplanpakke er bevart på `b2c3a42269afa4ef5d7b1edd07af946dc3142d3f`, Vercel `dpl_6qQsU2r1azxUr3tDdnMehimUnr5L` READY/target null/riktig branch. CI910/run41886555578 var under arbeid ved første kontroll.
- PR309: `73c97450`, tidligere full CI903 grønn, avgrenset Bolig-UX. PR310: `1a3f615e`, full CI909/run41884890173 SUCCESS. Ingen av dem er merget.
- Faktisk nettleser: fast PR308-host `https://expo-proffdok-git-fase45b-ux-live-review-20261104-ringside.vercel.app/?progressTest=safe`, eksisterende demokonto/Expo Proffsenter. Samme innlogging er bevart. Nettleseren viser Chromium 1363×1023 inklusive chrome; ingen fysisk mobil-/Safari-attest.
- Denne rettelsen tas fra ren main i `fase45b-whole-app-qa-20261104`, med egen Preview. PR308/309/310 blandes ikke inn i kjernepakken.

## Hele appen skal beholdes i køen

Kenneth presiserte etter bruddet at **hele appen** skal sjekkes. Det eksisterende 145-reisers registeret er beholdt som inventar, med senere delbevis avstemt separat. En grønn testpakke, et hovedsidebesøk eller en enkelt film betyr ikke at alle underfunksjoner er ferdig kontrollert.

| Område | Registrerte reiser |
| --- | ---: |
| HOME | 3 |
| PERSONAL | 7 |
| PROJECT | 16 |
| HR | 11 |
| KSHMS | 13 |
| SALES | 16 |
| COMMERCE | 6 |
| CHECKLIST | 4 |
| BOLIG | 33 |
| COMPANY | 7 |
| SYSTEMADMIN | 9 |
| PORTAL | 2 |
| SUPPORT | 2 |
| HELP | 2 |
| TIME | 3 |
| STOCK | 3 |
| ACCESS | 6 |
| SHELL | 2 |

Dette er et inventar, ikke en ferdigprosent. Nye sjekklistefunksjoner fra PR305 kommer i tillegg der de ikke er selvstendige ID-er i registeret. Videre videoer skal følge verifiserte faktiske arbeidsflyter i alle områder, uten å fremstille korte delkapitler som full A–Å.

## Ferske innloggede delkontroller

| Reiser | Faktisk utført | Fortsatt åpent |
| --- | --- | --- |
| HOME-001/002 | Startside med tillatte arbeidsområder og oppfølging lastet. Demo viser tre autoriserte områdekort i denne kontoen. | Full rolle-/oppgavematrise, alle varselmål og mobil. Ingen retur til en annen forsidevariant. |
| SALES-001/011 | 19 Sandbox-saker, filter Alle og Generelle tilbud (11), åpnet DEMO–Generelt tilbud utkast. Kundens tilbud viser lagret kladd, utvides til høyrepanel og returnerer til samme sak. | Våtromstype, aksepterte/historiske versjoner og reell kundelenke/aksept i den innloggede helreisen. |
| SALES-005/ACCESS-004 | Befaringsnotat på samme fiktive sak, fire felt og Badskisse-inngang. Nettleserfanebytte tilbake beholdt notat/sak. | Ingen ny tekst skrevet; dette er ikke bevis for usendt tekst, bilder, mobil dvale eller server-first på tom enhet. |
| SALES-008 | Faktisk Generelt tilbud-editor åpnet. Lagret tittel, firma-/signaturvalg, vilkår og kundevisning lest. Retur til samme sak bekreftet. | **Funn GENERAL-CATALOG-CLIP**, se nedenfor. Ingen pris/tekst endret manuelt; editor viser egen automatisk lagringsstatus, så dette er ikke en påstand om null bakgrunnslagring. |
| HR-001/005/006/007 | To demoansatte. Demo medarbeider2 åpnet fra register, eksisterende DEMO-årssamtale, Felles møte og Tiltak lest. Tiltak viser ansvar/frister, separat lagring og steg som ikke lagrer. Escape lukket medarbeiderpanelet og returnerte fokus synlig til samme rad. | Ingen samtale opprettet, endret, sendt, bekreftet eller avsluttet. Private reelle ansatte brukes ikke som visningsdata. |
| HR-004 | Alle HR-funksjoner → Samtalemaler åpnet i samme native høyrepanel. | Videre kladd/forhåndsvisning/retur, lagring og rollevarianter må kontrolleres. |

## GENERAL-CATALOG-CLIP – rotårsak og avgrenset rettelse

Førtilstand i faktisk innlogget PR308: Generelt tilbuds tekst/felt klippes ved venstre arbeidskolonnes høyrekant. Tilbudsmalteksten går utenfor kolonnen, og felt mister synlig høyrekant. Ved scroll forsvinner leseområdet oppover som før; eventuell sticky-forbedring er ikke del av denne rettelsen.

Kildebevis: `SalesStoreOfferBuilderCatalog` rendrer en div rundt `SalesStoreOfferBuilderGrouped`. De tre delte reglene for `.sales-shell`, `.sales-app` og `.sales-main` krevde direkte `.sales-app` under `.sales-case-work-content`. Den gamle prøven rendret Grouped direkte og overså den faktiske wrapperen.

Rettelsen gir den eksisterende wrapperen klassen `sales-store-catalog-editor` og lar samme interne bredde-/paddingregler treffe denne. Scope: den ene className-linjen, tre CSS-selektorer + wrapperens min-width/max-width, eksisterende browserprøve og fixture, samt dette endringsgrunnlaget. Ingen ny navigasjon, lagringsmekanisme, prislogikk, auth, tilgang, portal, e-post eller database.

Regresjonsprøven rendrer faktisk Catalog→Grouped. Bare persistStoreOfferDraft-grensen er injisert syntetisk; den virkelige editoren og all opprinnelig kundevisnings-/kladd-/fokus-/viewporttest beholdes. Nytt geometrikrav kontrollerer hver synlig input/textarea/select og skall innenfor arbeidskolonnens grenser, ikke bare dokumentets scrollWidth (som kan skjules av overflow).

## Verifikasjon og grenser

- Full lokal `EXPO_BACKEND_TARGET=sandbox npm run build` inkludert uendret critical-kjede: PASS.
- `node --check scripts/sales-case-customer-preview-browser-check.mjs`, `git diff --check`: PASS.
- Ny lokal Chromium-prøve kunne ikke starte på grunn av miljøets `socket()/ProcessSingleton`-begrensning. Ingen runtime-PASS utledes. Ordinær CI skal kjøre den faktiske prøven.
- Endelig head, full CI, READY og innlogget etterkontroll føres nedenfor. Ingen TEST OK eller merge ved dette checkpointet. Før merge er tilbakeføring å lukke PR-en.

## Neste sammenhengende kontrollrekkefølge

1. Fullfør denne avgrensede Generelt tilbud-rettelsen med CI og innlogget før/etter.
2. KS/HMS: avvik/RUH, SJA, vernerunde, risiko, plan, rutiner/revisjon, sjekklister og dokumentuttrekk; bruk faktisk underpanel/retur/eksport.
3. Min side og timeføring (firmaets eksisterende opt-in); firmaprofil, firmaadmin, organisasjonskart og systemadmin.
4. Prissøk/plukkliste, varebestilling og varetelling; faktiske eksportbytes og sperret transport skal skilles fra reell utsending.
5. Ordinære prosjektfaner, selvstendige sjekklister, portal-/rollevarianter, support og hjelp. PR310s overtagelse er ett delbevis, ikke hele prosjektmodulen.
6. Fortsett gjenstående Bolig-helreise og kapittelfilm etter at øvrige områder har fått fremdrift. Full Bolig A–Å gjenstår.

Det brukes én varig oppfølgingslogg per avgrenset pakke. Ikke lag nye designretninger eller ombygg uberørte moduler som sideeffekt.

## CI912 – testvertens avhengighetstre

CI912/run41888655245 på63e864f4: app-browser stoppet ved fixture-oppstart før første geometrisjekk (window.qa.show manglet). Lokal Vite-reproduksjon av den faktiske Catalog-importen gir tre chunks: entry importerer jsx-runtime-chunk og har lazy BarcodeScanner. Testverten leverte bare entry som innebygd modul og HTML for øvrige forespørsler. Dette er en bevist feil i testverten, ikke et bestått eller feilet produktmål. Testbygget samles nå til én selvstendig bundle, med eksplisitt krav om én chunk og bedre oppstartsfeil. Alle opprinnelige assertions og den nye faktiske Catalog-wrapperen beholdes. Ingen appendring for denne testvertsrettelsen.

PR308 er siden oppdatert til0525da71 med dokumentasjon; appkode er fortsatt b2c3a422 og fullCI910 grønn. Den nye PR311-adressen åpner ordinær innlogging. Den gamle PR308-økten er bevart; ingen autentisering kopieres til en annen host. Innlogget PR311-etterprøve er derfor foreløpig åpen.

## Videre native delkontroller utenfor Bolig

Samme PR308-host og demokonto. Ingen reelle mottakere brukt. Dette er konkret ny utførelse, ikke bare gjenbruk av eldre tester.

| Område / reiser | Utført | Avgrensning / funn |
| --- | --- | --- |
| KS/HMS – KSHMS-001/004 | Daglig arbeid → Se kontrollene → tre lagrede kontroller. Fortsett gjennomføring åpner DEMO-vernerunde i native høyrepanel med lagret navn, arbeidssted, ansvarlig og låst prosjektkobling. Escape returnerer til samme liste. | Ingen kontrollpunkter eller status endret/fullført. |
| KS/HMS PDF – KSHMS-004 | Last ned PDF på den lagrede DEMO-vernerunden. Appen viser ikke-blokkerende «PDF er lastet ned fra lagret dokumentasjon». Ingen OK-alert. | Nettleserens nedlastingshistorikk viser et GUID-navn merket Deleted; ny fil var ikke tilgjengelig for byte-/sidekontroll i arbeidsmiljøet. Dette er ingen ny attest av eksportfilens innhold eller layout. Ikke utled produktfeil fra filbroens grense. |
| Avvik/RUH – KSHMS-002 | Avvik og RUH lastet (3 åpne/7 lukkede). Registrer avvik og Registrer RUH åpner separate native høyrepaneler med tittel, ansvar/frister, beskrivelse og prosjekt/referanse. Lukket med Escape. | Ingen registrering, lagring, tiltak, lukking eller varsel utført. |
| Min side – PERSONAL-001/003/005 | I dag viser egne planer, HR-oppfølging, synlige Boligoppgaver (476 åpne i syntetisk pilotgrunnlag) og separat innregistrering. | Inn-/utregistrering er ikke utført. Dette gjengir faktisk nåværende visning, ikke historisk påstand om skjulte oppgaver. Store oppgavemengder må vurderes videre. |
| Timer – TIME-001 | Mine timer lastet uke02.–08.11, manglende-uke-varsel, 0t/0kr/0km og utkast. Ny registrering åpner høyrepanel med dato, kategori, prosjekt, timer, merknad og vedlegg. Escape tilbake. Faneretur gikk via tilgangskontroll tilbake til samme Mine timer. | Ingen tidtaking, registrering, levering eller lønnseksport. Firmaets eksisterende aktivering er bevart. |
| Firmaprofil – COMPANY-001 | Firmaprofil → Forhåndsvis firmaprofil i dokumenter og e-post: riktig demoidentitet/logo, adresse, organisasjonsnummer og kontakt vises i begge kolonner. | Ingen endring eller lagring av firmaprofil. |
| Firmaadmin – COMPANY-002/004 | 4 brukere/roller/status lastet. Demoansatt2 åpnet i høyrepanel med eksplisitt rolle-/modullagring, eksisterende modulvalg og firmaavgrensning. Escape tilbake. | Ingen rolle, modul, innsyn, status eller invitasjon endret. Bolig-, organisasjonskart- og timeoppsett må fortsatt tas med. |
| Systemadmin – SYSTEMADMIN-001/003/005/006/007 | Oversikt og undermeny, Brukere og roller (6 godkjente/2 firma), Produktmaster (tom i dette Sandbox-utvalget), Internt vareregister og Nyheter i appen åpnet. | Nyheter viser tittel/tekst og publiseringshandling; ingen tekst skrevet/publisert. **SYSTEM-STORE-EMPTY:** Internt vareregister forblir bare overskrift/forklaring uten status/innhold. |
| Prissøk – COMMERCE-001/002/004 | Dansani-søk gir DEMO-DAN-001 med prisnivåer. Legg til gir midlertidig arbeidsliste med1stk. Fanebytte tilbake beholdt vare og mengde. Send bestilling til leverandør er kildekontrollert som kun åpning og deretter prøvd: leverandør-/e-post-/adresse-/referansefelt,1valgt demovare og eksplisitt ordrebekreftelse til innlogget demokonto. Lukket uten sending. | **SUPPLIER-INLINE-SCROLL:** skjemaet åpnes fortsatt som lang inline-blokk og flytter varelisten langt ned. Samles til senere avgrenset presentasjonsrettelse, ikke endret i katalogeditorrettelsen. Midlertidig Prissøk-vare beholdt; ingen lagret plukkliste, kontakt eller bestilling. |

### SYSTEM-STORE-EMPTY – konkret videre undersøkelse

`systemAdminStoreCatalogUx.jsx` viser området, mens `StoreCatalogPanel` returnerer null for `loadingAccess || !access || !client`. Disse ulike tilstandene får samme tomme arbeidsflate. Det er ikke bevist om demoens tomme tilstand skyldes tilsiktet tilgang, klient eller avvist oppslag. Ikke gi tilgang eller endre RLS/import som sideeffekt. Neste rettelse må skille venting, bekreftet avslag og feil/retry i eksisterende rettighetsflyt. Intern katalogtilgang og Prissøks prisinnsyn er ulike kontrakter.

### Testvertsrettelsen lokalt

Etter samling til én bundle: lokal faktisk Catalog-fixture rendrer Catalog→Grouped i JSDOM og `window.qa.show` finnes. Den nye single-chunk-assertionen består. Dette er oppstarts-/React-bevis, ikke geometribevis; Chromium/viewportkrav kjøres uendret i CI. Ingen testterskler er senket.

### Inventaret er 153 funksjoner, med 145 grunnreiser

`proffdok-video-coverage-20261031.json` har153 oppføringer. De8tilleggene til145-registeret er PILOT-BOLIG-HELP-001, CHECKLIST-EMPLOYEE-POINTS, CHECKLIST-TEMPLATE-SUBMIT, CHECKLIST-TEMPLATE-REVIEW, PERSONAL-002-OPEN-READ, SALES-011-OPEN-READ, HR-010-CREATE-COMPLETE og HELP-001-SEARCH. Disse skal også følges. Masseplanfilmen er et delkapittel til BOLIG-019 og lukker ikke hele reisen. Ingen full app-/videodekning hevdes her.

## Samlet presentasjon: selvstendige sjekklister

Faktisk Sjekklister-panel fra Alle områder viste korrekt høyrepanel, men Start sjekkliste, Oppdater malforslag og Åpne sjekkliste beholdt gamle gradienter/skygger/pilleform. Scope utvides med bare disse eksisterende handlingsgruppenes knappepresentasjon i standaloneChecklists.css. Samme 7px-kant, mørk teal og hvit sekundærhandling som øvrige arbeidsflater. Svarvalg, statusfarger, signatur, HTML-handlers, lagring, firmatilgang, malforslag og utsending er uendret. Eksisterende faktiske standalone-browserprøve dekker fem bredder, kladd, ordrenummer/arbeidssted, signatur, lagring/retry, malforslag/roller og PDF gjennom React→HTTP→disponibel PostgreSQL med syntetisk e-postleverandør.

Native videre varekontroll: Varebestilling → Dansani gir DEMO-DAN-001. Enter velger varen og markerer antall1. Skriving av2 og Enter beholder2 og åpner/fokuserer søk etter neste vare. Ingen mottaker, kontakt, forhåndsvisning eller bestilling lagret/sendt. Én lokal demovare med2stk beholdes i bestillingskladden; Prissøks uavhengige midlertidige liste har1stk. Varetelling åpner eksisterende listevelger og opprettelsesskjema; ingen telling opprettet/endret.

## Verifisert katalogkandidat før knappetilpasningen

Eksakt841ffd1c6a651df9610f585c6a0f6009ede7425f: fullCI913/run41890967987 COMPLETED SUCCESS. Alle ni pakker og sluttkontroll er grønne. App-browser-loggen bekrefter880 native kundevisningsassertions med faktisk Catalog→Grouped,9tilstander/fem viewports og native formgeometri/DOM-kladd/fokus;229general-offer-layout og84inline-preview-assertions;170standalone React→HTTP→PostgreSQL→PDF-assertions med syntetisk transport. Dette lukker den nye testvertsfeilen og gir runtimebevis for kataloglayouten. Den senere rene knappe-CSSen krever fortsatt sin nye sluttkandidatkontroll. Innlogget PR311-etterprøve er fortsatt åpen fordi ny host står på ordinær innlogging. Ingen ny autentisering er opprettet eller kopiert.
