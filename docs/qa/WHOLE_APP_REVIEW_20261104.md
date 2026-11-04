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
| HOME-001/002 | Startside og oppfølging lastet. Første bilde viste tre kort før tilganger var ferdig lastet; senere retur viser de seks godkjente arbeidsområdene. | Full rolle-/oppgavematrise, alle varselmål og mobil. Ingen retur til en annen forsidevariant. |
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

Faktisk Sjekklister-panel fra Alle områder viste korrekt høyrepanel, men Start sjekkliste, Oppdater malforslag og Åpne sjekkliste beholdt gamle gradienter/skygger/pilleform. Scope utvides med bare eksisterende handlingsknappers presentasjon i standaloneChecklists.css. Samme 7px-kant, mørk teal og hvit sekundærhandling som øvrige arbeidsflater. Svarvalg, statusfarger, signatur, HTML-handlers, lagring, firmatilgang, malforslag og utsending er uendret. Eksisterende faktiske standalone-browserprøve dekker fem bredder, kladd, ordrenummer/arbeidssted, signatur, lagring/retry, malforslag/roller og PDF gjennom React→HTTP→disponibel PostgreSQL med syntetisk e-postleverandør.

Native videre varekontroll: Varebestilling → Dansani gir DEMO-DAN-001. Enter velger varen og markerer antall1. Skriving av2 og Enter beholder2 og åpner/fokuserer søk etter neste vare. Ingen mottaker, kontakt, forhåndsvisning eller bestilling lagret/sendt. Én lokal demovare med2stk beholdes i bestillingskladden; Prissøks uavhengige midlertidige liste har1stk. Varetelling åpner eksisterende listevelger og opprettelsesskjema; ingen telling opprettet/endret.

## Verifisert katalogkandidat før knappetilpasningen

Eksakt841ffd1c6a651df9610f585c6a0f6009ede7425f: fullCI913/run41890967987 COMPLETED SUCCESS. Alle ni pakker og sluttkontroll er grønne. App-browser-loggen bekrefter880 native kundevisningsassertions med faktisk Catalog→Grouped,9tilstander/fem viewports og native formgeometri/DOM-kladd/fokus;229general-offer-layout og84inline-preview-assertions;170standalone React→HTTP→PostgreSQL→PDF-assertions med syntetisk transport. Dette lukker den nye testvertsfeilen og gir runtimebevis for kataloglayouten. Den senere rene knappe-CSSen krever fortsatt sin nye sluttkandidatkontroll. Innlogget PR311-etterprøve er fortsatt åpen fordi ny host står på ordinær innlogging. Ingen ny autentisering er opprettet eller kopiert.

## Sjekkliste-/support-/prosjektkontroll og miljøgrenser

- CHECKLIST-004: eksisterende fullførte TEST–signert utførelsessjekkliste åpnet. Lagret ordreTEST-SIGN-20261031-01, fiktivt arbeidssted, låste Ok-svar/kommentar og både egen/ekstern syntetisk signatur vises. Ingen canvas/Tøm eller ny fullføring på den lagrede listen. PDF-knapp og Send PDF-på-e-post er separate; tom mottaker og ubekreftet mottaker gir disabled Send PDF. Ingen sending eller ny signering. Malforslagskøen er tom; ingen forslag opprettet/godkjent.
- SUPPORT-001:3egne supportsaker lastet. QA Support16.10–kunSandbox åpnet med opprinnelig henvendelse, svarhistorikk, egen Tilbake til saker og svarfelt. Historikken viser Lagret/e-post er avslått i dette miljøet. Ingen ny henvendelse eller svar sendt. Eventuell ordinær lesemarkering er ikke det samme som fravær av alle backendkall.
- PROJECT-001/003:7prosjekter/5aktive/2arkiv i ordinær Prosjektliste. Felles-prosjektblokk lastes separat. Ved ferdig tomt fellessvar kollapser den og flytter egne rader opp. En koordinatbasert åpning mens dette pågikk traff DEMO–Inn- og utregistrering i stedet for den tidligere synlige HOVED-raden; faktisk prosjekttittel ble kontrollert før videre arbeid, og det ble returnert til listen. **PROJECT-LIST-SHIFT** er et konkret UX-funn; effekten på raske menneskeklikk må verifiseres før rettelse. Ikke framstill det som feil firmatilgang eller feil lagret prosjekt-ID. Den åpne prosjektoversikten hadde native meny, Status og mangler og KS/HMS-dokumentgrupper. Ingen felt endret; appen viser egen autolagring, så null bakgrunnslagring hevdes ikke.
- Mobilkontroll i den innloggede nettleseren: browserpolicy avviste DevTools med «Your organization has blocked the use of DevTools on this page». Ingen policy endret. Vanlig vindusendring ga ingen endret bredde på den administrerte flaten. Ingen innlogget mobil-/Safari-attest gis. Native Chromium-prøver i CI dekker de dokumenterte320/390/768/1363/1920-breddene; fysisk enhet er et separat bevisnivå.

Sluttresultat for endelig appkandidat, CI/READY, testlenke og rester føres i PR311. De uendrede grønne delbevisene gjenbrukes; dokumentasjonsoppdateringer skal ikke fremstilles som ny utført helappreise.

## Gjenopptatt etter tilkoblingsbrudd – CI915

Fersk kontroll av ef4ac842: CI915/run41894108641 er ferdig med FAILURE. Scope og åtte testpakker er grønne; app-browser stoppet i home-followup-036-browser-check.mjs på umiddelbar knappemåling ved 390px. Senere tester i denne pakken ble ikke kjørt og gis ingen PASS. Vercel-statusen er grønn, men erstatter ikke denne kontrollen.

Den samme eksisterende målefeilen er dokumentert i PR308s LIVE_DESIGN_REVIEW_20261104.md (CI894), med rettelse 8d4089d9 og senere grønne CI895/896/910. PR311 hadde fortsatt den gamle målingen. Scope utvides bare med identisk testvertsrettelse: vent på at responsiv knappgeometri oppfyller de uendrede 44px/16px-kravene, og ta med faktisk geometri i feilmeldingen. Alle fem bredder, overflow-, høyde-, callback- og transportkrav beholdes. Ingen appendring eller svekket terskel i dette steget. En vedvarende feil skal fortsatt gi timeout/FAIL.

Lokal node --check og git diff --check PASS. Nytt lokalt Chromium-forsøk er stoppet før scenario av socket()/ProcessSingleton (Operation not permitted); ingen lokal runtime-PASS hevdes. Hele CI-kjeden må bekrefte ny kandidat. Innlogget PR311-etterkontroll, de tre åpne UX-funnene og resterende helapp-/videoreiser er fortsatt åpne. Produksjon/main og permanent demo er ikke oppdatert.


## Samlet prosjektrunde etter CI916

Grunnlag: remote c8849c08, tree6a96116959a5520486686aa66737264ee6b8e2db, fullCI916/run41895998352 SUCCESS. Lokal042f9024 er en innholdslik commit med samme tree; remote kandidat og publisering identifiseres alltid med GitHubs SHA, ikke den lokale kopiens metadata. Main34daef4c/demo fd5aafa1 er fortsatt baseline. Arbeidsbranch og fast Preview gjenbrukes. Miljømål BEGGE; ingen TEST OK eller merge.

Scope utvidet til workProfileProjectListUx.jsx (kun tom-/lastetekst), proffdokProjectListWorkspace.css (felles statusplass), projectListTools.js (presis sjekklisteetikett), ProjectWorkspaceChrome.jsx (presentasjon av allerede beregnede tellinger), main.jsx (to avgrensede presentasjonskoblinger), checklistSubflows036.css og de to eksisterende berørte nettleserprøvene. Ingen endret innlasting, firmakontroll, RPC, navigasjon, lagring, signering eller ferdigstilling.

- PROJECT-LIST-SHIFT: under lasting av en foreløpig tom fellesliste finnes samme kompakte statusrad som etter bekreftet tomt svar. Statusfeltet reserverer to tekstlinjer slik at tommeldingen ikke flytter egne prosjekters åpneknapp. Fylt fellesliste og oppfrisking av allerede lastede kollegaprosjekter beholder eksisterende visning. Nettverksfeil er fortsatt egen feiltilstand.
- Avviksomfang: liste, prosjektoppfølging og mobilvalg merker eksisterende sjekklisteantall som sjekklisteavvik. Prosjekttoppen viser sjekklisteavvik og prosjektavvik separat; totalen, kildene, knappemålene og ferdigstillingskravene er uendret. Eldre kall uten de valgfrie propsene får fortsatt totalen. Dette er ikke en ny felles avviksmotor eller påstand om at listeraden teller alle prosjektavvik.
- PROJECT-CHECKLIST-ACTION-STYLE: eksisterende fortsett-/sluttkontroll-/lagre-/opplastingshandlinger følger intern teal/hvit sekundærstil. Svarenes grønn/oransje, tre fremdriftsfiltre, disabled, signaturkrav og felles dialoglukkeknapp er ikke overstyrt.
- Tests: ny forsinket tomsvarprøve ved320/390/768/1363/1920 krever uendret faktisk Åpne-node og y-posisjon (maks1px forskjell). Headerprøven dekker oppdelt avviksmerking sammen med opprinnelige dimensjons-/fokus-/callback-/read-only-krav. Ingen opprinnelige terskler er redusert.

Lokal full EXPO_BACKEND_TARGET=sandbox npm run build/critical PASS. Prosjektmenyens faktiske React-ruter og kladdbevaring PASS. Ekstra historisk project-checklist-popup-react-check.mjs (ikke i gjeldende CI-inventar) feiler på gammel forventning om aria-expanded=false på .project-checklist-heading. Den uendrede komponenten bruker allerede en statisk div uten denne attributten; dette er et eksisterende foreldet testkrav, ikke endret her eller gitt PASS. Gjeldende workspace/resume-prøver og full CI rapporteres separat. Dette gamle scriptet er ikke rettet eller fjernet som sideeffekt.

Visuell prøve ble forsøkt via syntetisk faktisk headerfixture, men Skynett viste svart flate/ingen vinduer, også etter ordinær nettleseråpning. Ingen policy endret og ingen innlogget/visuell etterkontroll hevdes. Innlogget PR311, fysisk mobil/Safari, HOVEDs bildekilde, kompakt produktvalg, internt vareregister, bestillingspanel og full Bolig A–Å er fortsatt åpne.

Oppfriskingsknappen beholder også teksten Oppdater felles under lasting, med disabled og aria-busy. Dette holder knappens bredde og dermed nabotittelens linjebryting stabil på mobil. Selve statusraden forklarer at prosjektene hentes. Ingen ekstra oppslag eller automatisk retry.


## CI918 og separat Sandbox-bildereparasjon

CI918/run41900225928 på878bde66: scope og åtte øvrige pakker PASS. App-browser bestod ny forsinket tomsvarprøve og hele fem-bredde-geometrien, men stoppet på én oversett gammel lokator ⚠️ Avvik (3). Den er oppdatert til faktisk ⚠️ Sjekklisteavvik (3); samme eksakte prosjekt-ID, sjekklistefane og showOpenDeviationsOnly=true kreves fortsatt. Ingen appendring eller terskelsenkning i dette steget. Senere tester i pakken må fortsatt kjøre.

HOVED-bildene er undersøkt separat, kun i SANDBOX/DEMO. Fersk Supabase-branchoversikt bekrefter demo-sandbox=ppvircenkjizeiqdxphj under expo-proffdok. HOVED hadde seks relative /demo-images-lenker. Arbeidsbranchene fra main har ikke demo-overlayets filer: faktisk HOVED Før arbeid-URL svarte404 i PR311, mens samme fil svarte200/image/svg+xml i permanent demo. Alle seks kildefilene svarte200 og riktig image/svg+xml eller image/jpeg på permanent demo.

Bare HOVED-prosjekt a0000000-0000-4000-8000-000000000001 fikk sine seks photo.url prefikset med permanent demos faste HTTPS-origin. Ingen bildefil er generert, kopiert, reinstallert eller slettet. Opprinnelige filnavn: befaring-for.svg, underlag-primer.jpg, membran-tetteband.jpg, slukmansjett.jpg, ror-mansjett.jpg og elektro-varmekabel.svg. Navn, ID, kategori, rekkefølge og createdAt er bevart. Reparasjonen var atomisk med forhåndshash, eksakt prosjekt-/seksfilskontroll og post-trigger-sammenligning av alle andre JSON-felt og radkolonner. Enhver uventet forskjell ville gitt rollback. Ingen grant, auth, migrering, utsending eller Production-dataendring.

Fersk uavhengig READ ONLY-lesing etter commit: HOVED6bilder, alle seks med forventet fast demo-origin. HOVED data-md5 eff8bdb631f1efb6f161236d5c66526a → e72e1d7e10693f9817f03118a068ba44; other-data-md5 b0b8c7d3a3efa8a0e385f5f1d9128a11 uendret. RESERVE a0000000-0000-4000-8000-000000000002 er urørt:7innebygde bilder, data-md5 fortsatt448e9f47a70c493781cbcb69b98f41b4. Ingen sju-bilders reparasjon er kjørt på nytt.

Tilbakeføring av akkurat URL-reparasjonen kan gjøres med forhåndskontroll av HOVEDs nye datahash og fjerning av bare det innførte faste demo-origin-prefikset fra de seks URL-feltene. Krev opprinnelig eff8bdb631f1efb6f161236d5c66526a før commit; ikke erstatt hele prosjektet eller kjør seed/reset. Skynett er fortsatt utilgjengelig, så HTTP-/databevis er ikke attest av innlogget galleri eller ny PDF. HOVEDs6kilder er nå teknisk rettet, mens visuell etterkontroll står åpen.


## Innlogget etterkontroll og endelig HOVED-galleri

FullCI919/run41901388916 på d10861f0 SUCCESS: alle ni pakker og sluttkontroll.290faktiske Personal/project-layoutkrav,880Catalog-kundevisningskrav og170standalone-browserkrav PASS. Vercel dpl_8nuxCgbxoBhWrCD3NJKAoM1YrW87 READY/eksaktSHA/fastalias/targetnull; faktisk bygglogg bekrefter eksplisitt Sandbox-binding. Ingen TEST OK/merge.

Alternativ browserstyring åpnet riktig fast PR311-host. Ordinær sikker brukerinnlogging ble fullført, og fersk side viste demo@expo-proffdok.no/Expo Proffsenter. Ingen innlogging eller credential er kopiert mellom hoster. Faktisk innlogget liste viser2åpne sjekklisteavvik på HOVED, mens prosjektets header viser2sjekklisteavvik+2prosjektavvik+2uleste meldinger. Sjekklister åpner i høyrepanel; Fortsett utfylling åpner riktig1/3-kontroll med lagret kommentar og to uvurderte punkter. Lukk returnerer til oversikten. Ingen svar, signatur, opplasting, Lagre eller fullføring er utført. Appens eksisterende lokale sikring opprettet/viste lokal kladd ved åpning; dette er ikke påstand om fravær av lokale/bakgrunnseffekter.

Innlogget bildeprøve korrigerte den tidligere HTTP-only-konklusjonen: toSVGlastet, men fire gamle JPG-kilder feilet. Faktisk Git-blob fra permanent demo bekreftet at underlag-primer.jpg, membran-tetteband.jpg, slukmansjett.jpg og ror-mansjett.jpg er ugyldige bildefiler (ca15kB, ikke JPEG, PILverify avviser).200/image/jpeg var derfor ikke dekoderbevis. Disse gamle filene er ikke skrevet om i demo-overlay som sideeffekt.

Alle sju allerede installerte RESERVE-bilder ble først kontrollert innlogget: complete=true/naturalWidth1200/naturalHeight800. Deretter ble HOVEDs seks galleri-url-felt atomisk erstattet med de seks tilsvarende eksisterende RESERVE-bildene, matchet entydig på navn. Ingen nye bilder er laget eller reinstallert i RESERVE. HOVEDs ID/navn/kategori/rekkefølge/createdAt og alle øvrige JSON-felt/radkolonner ble kontrollert uendret etter triggere. Bare galleriets seks URL-felt er oppdatert; sjekklistebesvarelser og signert historikk er ikke berørt.

Endelig HOVED data-md5 a32354ec299402ce6e4d70b1844742a0, other-data-md5 fortsatt b0b8c7d3a3efa8a0e385f5f1d9128a11. RESERVE data-md5 fortsatt448e9f47a70c493781cbcb69b98f41b4. Ny vanlig navigasjon liste→HOVED→Bilder hentet oppdaterte kilder uten lokal kladdsletting: alle seks galleri-img complete=true/1200×800. Slukmansjett åpnet i stor høyrevisning og ble visuelt kontrollert. Samlet bildeoversikt viser også fire eldre sjekkpunktkilder; disse og ny PDF/rapport er ikke ferdig attestert. Ikke kall hele HOVEDs bilde-/rapporthistorikk reparert ut fra galleriet.

Den innloggede editoren avdekket én CSS-sideeffekt: den generelle handlingsregelen traff også checklistGroupHeader og gjorde pilen hvit på hvit bakgrunn. Klassen er nå unntatt, så original hvit/svart gruppeoverskrift beholdes mens handlingene beholder intern teal-stil. Statusvalg, progressfiltre og dialogclose er fortsatt unntatt. Ny kandidat trenger ny relevant full CI og visuell etterprøve av denne ene korreksjonen.

Ved senere tilbakeføring av galleridata: forhåndskontroller endelig HOVED-hash og all øvrig data, og rekonstruer bare de seks originale relative URL-feltene etter navn med filnavnlisten over; krev opprinnelig eff8bdb631f1efb6f161236d5c66526a før commit. Ingen full prosjekterstatning, seed/reset eller endring i RESERVE. Den tidligere instruksen om enkel prefixfjerning gjaldt mellomtilstanden med absolutte lenker og er ikke nok for den endelige innebygde tilstanden.


## Faktisk Catalog-vert etter sikker innlogging

Den innloggede PR311-editoren på d10861f0 viste fortsatt klipping etter at Catalog hadde hydrert:7av12synlige felt krysset arbeidskolonnens høyrekant. DOMkjeden hadde en ekstra nøytral div mellom sales-case-work-content og sales-store-catalog-editor, som den tidligere fixturen manglet. Dermed traff de nye direct-child-reglene fortsatt ikke den faktiske skjermflaten. Eksempel: arbeidskolonne28…754.84px, felt65…793.5px, store-builder-section48…810.5px. Dette er reelt innlogget produktbevis og korrigerer en for sterk forventning fra de tidligere880syntetiske kravene. Ingen felt eller pris ble manuelt endret; editoren viste egen automatisk serverlagring.

Samme avgrensede presentasjonsrettelse utvides til å tåle den faktiske nøytrale verten: Catalog-navngitt descendant innen eksisterende work-content, uten global utvidelse av editorreglene. Store-builder-section får samme min-width0/max-width100%/border-box som de øvrige formgruppene, så gridets intrinsic minimum ikke holder seksjoner bredere enn skjemaet. Ingen komponentflytting, hydrering, autosave, navigasjon, pris eller backendendring. General-fixturen inkluderer den observerte nøytrale verten rundt faktisk Catalog→Grouped; alle eksisterende tilstander, viewport- og geometri-/kladd-/fokuskrav beholdes. Ny kandidat må gjennom full CI og fersk innlogget feltmåling; gammel grønn kandidat er ikke etterbevis for denne korreksjonen.

Etter første vertskorreksjon traff bredde/padding nå faktisk Catalog, men innlogget måling viste fortsatt auto-gridtrack762.5px inne i et726.84px bredt form. Section hadde allerede min-width0/max-width100%, men prosenten var relativ til det for brede sporet. Det eksisterende énkolonneskjemaet får derfor eksplisitt minmax(0,1fr), kun i den navngitte Catalog-editoren. Ny innlogget måling må bekrefte null felt utenfor arbeidskolonnen; ingen gammel PASS gjenbrukes som dette beviset.


## Etterprøve53aad55c og CI922-strukturkontroll

Eksakt53aad55c ble publisert READY med fastalias og eksplisitt Sandbox-binding. Vanlig reload beholdt innlogging og samme tilbudseditor. Etter at faktisk Catalog var ferdig hydrert (Bruk firmamal synlig):12synlige input/select/textarea, kolonne726.84px, gridspor726.84px,0felt utenfor kolonnen. Hele malteksten bryter innenfor kolonnen. Utvid kundevisning → Tilbake til arbeidet beholdt samme Baderomsmøbel og toalett–utkast. Ingen manuell felt-/prisendring eller klikk på lagre/publiser/send; eksisterende autosave er ikke slått av.

Sjekklisteeditor på samme kandidat: gruppeoverskrift faktisk hvit rgb255/255/255 og mørk rgb15/23/42, tydelig pil og beholdt grønt svarvalg, teal på handlinger. Lukk returnerte til samme oversikt uten fullføring. Selvstendig fullført TEST-liste viste låste ordre-/arbeidssteds-/svar-/kommentarfelt og begge lagrede signaturbilder dekodet. Send PDF forble disabled ved tom mottaker; ingen sending/signering/malforslag. Avsluttet på Startsiden med innlogging bevart.

CI922/run41911274128 på53aad55c: scope og åtte øvrige pakker PASS. App-browser stoppet i den oppdaterte general-fixturen på en glemt struktur-lokator som fortsatt krevde Catalog direkte under work-content. Fixturen gjengir nå med hensikt den observerte nøytrale verten. Lokatoren krever derfor nøyaktig work-content>div>Catalog>Grouped, fortsatt én faktisk instans; alle eksisterende bounds/overflow/44px/16px/kladd/fokus/kundevisningsscenarioer beholdes. Ingen appendring eller terskelsenkning i denne test-/dokumentasjonscommitten. Senere del av pakken må fortsatt bekreftes i ny full CI. Innlogget produktbevis på53aad55c er bevart og gjelder samme uendrede appkode.


## Videre helappkontroll: vareregister og faktisk PDF-eksport

Miljømål BEGGE for avgrenset apprettelse i samme PR311, Preview/Sandbox først. Remote utgangspunkt78ac929a, faktisk READY på fast Preview. Ingen TEST OK, merge eller produksjonsendring.

Innlogget Systemadmin → Internt vareregister viste bare overskrift og forklaring; monteringsslot hadde én wrapper, men selve panelet var borte. StoreCatalogAdminOnlyPanel returnerte null ved både lasting og manglende administrasjonstilgang. StoreCatalogPanel gjorde tilsvarende ved indre tilgangskontroll. Begge viser nå tydelig status for venting, avslag og kontrollfeil. Manuelt nytt forsøk gjør kun de eksisterende RPC-lesningene. Klientens valgfrie throwOnError skiller feilrespons fra faktisk false; øvrige oppslag beholder standarden false ved RPC-feil. Ingen rettighetsutvidelse, import, aktivering, databaseendring eller e-post.

33 faktiske React-/klientkontroller PASS med syntetisk transport: ytre og indre venting, avslag, RPC-feil, avvist transport, nytt forsøk og faktisk autorisert panel/import-UI, ingen importlesning før tillatelse og ingen gjennoppstandelse etter unmount. Tilgangsforsøket kan ikke skrive eller importere. Testen inngår i eksisterende app-ux-browserkjede. Full lokal EXPO_BACKEND_TARGET=sandbox npm run build PASS. git diff --check PASS. Ny CI og innlogget etterkontroll gjenstår på publisert kandidat.

PDF-kontroll på uendret78ac929a: eksisterende innlogging gjenbrukt, RESERVE åpnet og korrekt prosjekt-ID bekreftet. Prosjektmeny → Rapport viste faktisk høyrepanel, sjekkpunktbilder og separate Last ned PDF/Tilbake-knapper. Last ned PDF åpnet KS/HMS-valg; Fortsett uten KS/HMS åpnet Lagre rapporten lokalt. Etter Generer PDF ventet nedlastingshendelsen, men CUA-kallet timet ut etter60sekunder og kernel ble nullstilt. Ett forsøk på å inspisere samme tab15 fikk Emulation.setFocusEmulationEnabled-timeout. Ingen nedlastingssti ble returnert; ingen ferdig PDF eller innholdskontroll attesteres. Dette beviser verken feilfri eksport eller at appen er eneste årsak til browserfeilen. Ingen e-post eller prosjektfelt endret. Eksportkoden og browsertilstanden må undersøkes videre.


## PDF: bekreftet nedlasting og blokkering av OK-varsel

Kenneth bekreftet at PDF-en fra RESERVE var lastet ned, og at han måtte klikke OK. Den samme tab15 ble deretter tilgjengelig igjen og viste Rapport og PDF med aktiv Last ned PDF-knapp. Dette korrigerer den foreløpige tolkningen av timeouten over: nedlasting er brukerbekreftet; innholdet i selve filen er fortsatt ikke selvstendig inspisert.

Kilden bekrefter tre blokkerende suksessvarsler etter doc.save for låst prosjekt, komplett utstedt garanti og statusrapport. Disse erstattes med en vedvarende, ikke-blokkerende role=status-melding ved nedlastingsknappene i rapportpanelet. Meldingen sier presist at PDF er generert og sendt til nettleserens nedlasting, og beholder garanti-/lagringsveiledningen. Ny eksport tømmer gammel melding; visningen er bundet til samme prosjekt-/firmascope og tab. Garantioppdatering, siste tilgangskontroll, arkivbekreftelse, faktisk PDF-motor og feilhåndtering beholdes. Ingen suksess-alert skal kreve OK.

Lokalt: faktisk createReportTools/jsPDF bestod 512 garanti-/PDF-kontroller (AEB/FDF, kort/lang, låst/åpen, avvik og digitalt sluttsidekort), nå også null suksess-alert og bevart veiledning i ny statuscallback. Ingen endret bilde-/PDF-layout eller kontrakt. Eksisterende Chromium-prøve utvides med ekte browserdownload, vedvarende status og footer ved320/390/768/1363/1920. Den lokale maskinen har fortsatt ikke en fungerende Chromium-kjøring; runtime-resultat kreves fra ny CI og live Preview.

Registeretterkontroll på18816640: READY, innlogget nyfane16. Internt vareregister viste feilstatus og Prøv tilgangskontrollen igjen, som kunne klikkes uten import eller sending. Read-only pg_proc-kontroll bekreftet rotårsaken: current_user_can_manage_internal_store_catalog mangler i Sandbox ppvircenkjizeiqdxphj, mens begge tilgangsfunksjonene finnes i produksjon dqffxflaoyarbxyiyhop. Ingen gammel migrering kjørt eller tilgang lagt til. Registerimport er derfor ikke live-attestert i Sandbox. CI924 hadde åtte grønne pakker mens app-browser fortsatt kjørte ved siste kontroll.
