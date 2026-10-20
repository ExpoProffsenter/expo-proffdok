## Kundevalgt opsjonsantall – Preview 17.10.2026

Avgrenset Sales-endring fra main a31609fab8ca692293a79b55ad2617f7f5efe935. Opsjons-JSON får opt-in `customerCanChooseQuantity`. Ren visningsadapter kopierer valg inn i kundens summer; original publisert versjon og aksepterte snapshots endres ikke. Ingen nye tabeller/kolonner eller RLS-regler. Eksisterende `accept_sales_offer(uuid,text,jsonb)` kanoniserer valgte opsjoner fra aktiv versjon og validerer tillatte antall. Ny token-RPC `accept_sales_offer_quantities(uuid,text,jsonb,uuid)` kontrollerer versjon med samme tilbudsrad låst før den kaller eksisterende aksept. Den gamle RPC-en kan dermed ikke omgå serverprisene. Begge beholder status-/utløpskontroll og låst `version_snapshot`; valgt antall ligger kun i `selected_options`. Klientens akseptbekreftelse bruker serverens svar. Eksisterende prosjekt-/ordreoverføring bruker dette låste grunnlaget. E-post, Support, navigasjon og tilgangskjerne er utenfor scope. Release og gjenstående innlogget Preview-prøve: docs/qa/CUSTOMER_OPTION_QUANTITIES_20261017.md.

## Support-e-post: bevart meldings-ID – Preview 17.10.2026

Ekte toveis prøve er gjennomført med Kenneth: svaret ble mottatt i samme sak, og webhook-gjentakelse lagret ingen duplikat. Testoppsettet er tilbakeført; ordinær e-post er AV. En påvist feil der interne varsler overskrev mottatt Message-ID rettes med en avgrenset migrasjon. Bare offentlige support-svar får utgående ID i samtalen. Feil lease, retry, tilgang og øvrige arbeidere beholdes. Ny TEST OK kreves før rettelsen publiseres og vanlig e-post aktiveres. Scope/bevis: docs/qa/SUPPORT_EMAIL_THREADING_20261017.md. Eldre supportplanstatuser nedenfor er historikk.

## Prosjektlisten: mindre luft og valgfri detaljvisning – Preview 16.10.2026

## Kompakt referansevisning og supportplan – 16. oktober 2026

PR #261 er publisert etter Kenneths TEST OK: main 688d7f63990bde408a8a49d876343ae778022f63, Production READY med korrekt miljøbinding. Kontrollert main → demo 19b48a95276afabbba6463afdcc260bab987475a; full build og faktisk preflight grønne. Ingen migrasjon eller e-post. Publiseringsbevis og overlevering: docs/CHAT_HANDOFF_20261016.md. Eldre ventende notater for #261 er historikk.

Neste avtalte UX-runde (BEGGE, foreløpig bare Preview): KS/HMS-veiledning foldes, status/neste handling beholdes; Garanti viser krav og original utstedelseshandling før innstillingene, lange referanser kan åpnes; Hjelp folder vilkårstekst/installasjonsveiledning mens gjeldende versjon og godkjenningsstatus fortsatt vises. Ingen endring i tilgang, lagring, recovery, garantikrav, signering, samtykke eller utsending. Ny TEST OK kreves. QA: docs/qa/COMPACT_REFERENCE_UX_20261016.md.

Support er lagt til som egen planlagt leveranse: innloggede brukere, dialog i app og e-post, Systemadmin-svar i ProffDok-layout og serverstyrt intern mottaker. Ingen supportfunksjon er implementert her. Avklarte valg og mottakskrav: docs/SUPPORT_PLAN_20261016.md. Ny chat anbefales ved overgangen til support, etter denne UX-runden.


Oppfølging av brukerens to skjermbilder: kompakte nøkkeltall, synlige Alle/Aktive/Arkiv, sammenfoldbart Søk og filtre og prosjektkort med Åpne alltid synlig. Vis detaljer åpner opprinnelig kontaktinfo, ansvarlig, bilder og snarveier; Vis alle detaljer åpner alle kort. Alle eksisterende handlinger er beholdt. Felleslistens visningsfilter støtter også de allerede avtalte active/archive-valgene. Ingen endring i tilgang, RPC, prosjektdata, main.jsx eller lagring. Samme Preview/PR #261, ny TEST OK kreves. QA og neste visuelle forslag finnes i docs/qa/APP_UX_REVIEW_20261016.md.

## Samlet UX-runde 16.10.2026 – Preview før ny TEST OK

Miljømål: BEGGE. Baseline er publisert main `5cc7e530685a48f4f59b403357e654e93c724578` (PR #260, godkjent og publisert). Eldre Preview-statuser lenger nede er historikk.

Brukeren har bestilt alle forslagene fra appgjennomgangen, med bevaring av eksisterende funksjoner. Denne runden samler prosjektstatus og meny, daglig timeføring, varevisninger, HR/håndbok, sjekkliste-/bilde-/produktoversikter, bemanningsgrunnlag, kundekladd-forhåndsvisning, admin og Hjelp. Visningsvalg bruker de opprinnelige handlingene. Smartere varesøk i telling bruker allerede publisert RPC; klassisk søk er tilgjengelig. Ingen migrasjoner, tilgangsregler, priser, e-posttransport, signering, autosave eller server-first-hydrering endres.

Scope, verifikasjon og teststeg: `docs/qa/APP_UX_REVIEW_20261016.md`. Fast Preview: https://expo-proffdok-git-fix-company-admin-scope-20261015-ringside.vercel.app/ . Denne runden er ikke godkjent for merge. Production og permanent demo beholder eksisterende versjon til ny TEST OK og vanlig releasekontroll er gjennomført.

## Befaring: vent på komplett sak før skjema/kladd – Preview

Innlogget etterkontroll avdekket også at wrapperens prefetch holdes i minnet til Core sin eksisterende asynkrone listehenting bruker den. Lokal requests-cache kan derfor fortsatt være summary ved første Core-render. Den nye initializeren alene var ikke tilstrekkelig. Befaringsnotatet har nå en saksspesifikk ready-state: ingen editor, lokal kladdlagring eller submit før komplett sak er tilgjengelig og skjemaet er hydrert. Meningsfull lokal/offline-kladd beholdes. Sen serveroppdatering kan ikke nullstille et ferdig hydrert skjema. Ingen endring av innlastingskall, recovery-timere, wrapper, tilbudseditor, serverlagring eller øvrige moduler.

21 permanente kontroller kjører faktisk Core-initializer og faktiske hydration-/lokallagringseffekter i React-rekkefølge, inkludert summary → full sak, utsatt state-commit, saksskifte og bevisst exit. Full critical/Sandbox build PASS. 128 editor-/tekstvalg-kontroller er fortsatt grønne; ingen UI-endring siden de ble kjørt. Endelig innlogget kontroll og ny SHA/CI føres i PR #260. Ny TEST OK gjenstår; Production urørt.

## 16.10.2026 – bevar gamle lokale mediekladder ved tom tekst

inspectionNeedsTextChoice oppdager ved notatets mount når serveren har tekst og lokal form ikke har tekst. SalesInspectionNote holder valget i komponentstate uten ny lagring, sperrer tekstfelter/submit og viser to eksplisitte valg. Bruk teksten fra saken oppdaterer bare tekstnøklene gjennom eksisterende onUpdateInspectionForm; Behold tom lokal tekst gir aktiv bekreftelse. Bilder/skisse påvirkes ikke. Ingen endring i globale recovery-timere/serverlagring eller andre moduler. Bevisst senere tømming i et normalt åpnet notat krever ikke dette mount-valget. 128 faktiske editor-/valg-kontroller og elleve initializer/helper-scenarier PASS.

## 16.10.2026 – avgrenset smartere Prissøk og sikker editor-initialstate (Preview)

Prissøk bruker additiv lesende RPC search_internal_store_catalog_prices_smart. Spørringen bygges av maksimalt ti sikre tokenpredikater direkte på eksisterende search_text, med pg_trgm-indeks og eksplisitte fagaliaser. Alle tokenkrav AND-es; synonymene er OR innen hvert krav. Ingen embedding, KI-kall, nye tabeller, dataskriving eller ny sensitiv prisautorisasjon. auth.uid, eksisterende Prissøk-gate, fersk view_internal_net_prices og aktive import/varer kontrolleres før resultat. Dynamiske verdier er SQL-litteraler via format %L; SKU/GTIN/prisrett/limit/offset er bundne parametre. Feltutvalg og nettoprismaskering er lik gammel paginering, med ekstra match_kind. Hjelpefunksjonen har ingen execute for klientroller. Vanlig søk bruker gammel RPC, mens arbeidsliste-rehydrering beholder opprinnelig lookup. Søkets generasjonsvern forkaster gamle sider etter tekst-, modus- eller firmabytte. Ingen ny lagring av søk eller priser.

SalesCore sin inspection-note-initializer bruker inspectionInitialForm med allerede hydrert requests og eksisterende scoped kladdnøkkel. Meningsfull lokal/offline-kladd beholdes helt; tom initialkladd kan ikke erstatte servergrunnlaget. Ordinært list/detail-mount starter som før. Denne avgrensede sikkerhetsrettelsen ble nødvendig da innlogget editor-QA gjenskapte tom tekst ved full reload; faktiske serverdata var intakte. Main-initializeren feiler den nye permanente scenario-testen, korrigert initializer passerer. Ingen recovery-/navigasjons-/serverlagringsendring. Scope og testbevis: docs/qa/SALES_EDITOR_UX_20261016.md og SMART_PRICE_SEARCH_20261016.md.

## 16.10.2026 – avgrenset editorpresentasjon (Preview)

SalesInspectionNote/SalesOfferBuilderCore bruker isolert sales-editor-app. Fire eksisterende tekstfelt får lokal sales-note-field og to PC-kolonner, én mobilkolonne. Befaringens observasjoner står før Badskisse. Tilbakefelt er div med statisk plassering, for å unngå global header-sticky. Malvalg får egen klasse og sideordnet kontrollfelt på PC. Ingen controller-, lagrings-, tilgangs-, pris-, server- eller main-endring. Runtime-QA: scripts/sales-editor-ux-browser-check.mjs og docs/qa/SALES_EDITOR_UX_20261016.md.

## Publisert salgsrunde og knappoppfølging – 16. oktober 2026

Kenneth ga TEST OK kl. 20:21 norsk tid for PR #257. Godkjent head 8e54ae35ab7f3689a896a14d2d7319074e10d437 / tre dac65c83f146f9c5eb3c05d63522c2f402842c46 har Core Safety #492 SUCCESS. Merget main 1e6052f7a325f6b2d7e8213852f5c65d5604c511, Production dpl_9J14YR8AwwC94n85vGNDg4ULa4TG READY på korrekt domene/SHA; HTTP og vanlig innloggingsflate fungerer, publisert bundle har Production-binding og ingen Sandbox-binding. Innlogget funksjonsprøve er gjort i godkjent Preview, ikke på Production i denne runden. Kontrollert main → demo 7f2c5b29b76270d15d4395e54d5e62878ebd6997 / dpl_8LhnUWfc4owEJKuywYkPc32KympC READY med bevart overlay og full critical/build PASS. Ingen migrasjon, seed/reset eller e-post. Faktisk innlogget preflight er grønn, inkludert baseline mot main og bevarte kurs-/Golden-punkter. Eldre ventende TEST OK-notater nedenfor er historikk for denne releasen.

Etterpå ba Kenneth om å flytte Nytt tilbud fra egen rad for å frigjøre luft. Miljømål BEGGE, Preview først: samme startDirectOffer sendes gjennom SalesCore til SalesListView og vises sammen med Ny forespørsel i overskriftens handlingsfelt. Den gamle snarveiraden skjules bare i oversikten; andre arbeidsbilder beholder den. Ingen main.jsx-, tilbudstypevalg-, editor-, tilgangs-, lagrings-, recovery-, utsendings- eller prosjektendring. Smal skjerm har to knapper med minst 48 px høyde. Ny relevant TEST OK kreves for denne lille oppfølgingen. QA: docs/qa/SALES_OVERVIEW_UX_20261016.md.

## Godkjent Min side/prosjektliste og neste salgsrunde – 16. oktober 2026

Kenneth ga «test ok, kjør videre» kl. 19:56 norsk tid. PR #256 er merget til main bcac550ffeb2f46c2ee946518acbe31c8b63334a. Core Safety #490 SUCCESS og testet Preview-tre fcdd62155103e05c0b380ff17c3f4d2691c08d1d er bevart. Production dpl_2WiVgGBoqxNvjHZaamSyZn4QLsmg er READY på riktig SHA/domene; publisert bundle bruker Production, ikke Sandbox. Kontrollert main → demo er publisert i a5506df94346d8df5afa5caf60c01997ea097c03; demo-overlay er bevart. Full demo-critical/build PASS, egen preflight-guard PASS og faktisk innlogget preflight er grønn (19 serverpunkter, fem kurspunkter og klientens baseline/lokale skisse). Bare manglende lokal demoskisse i testnettleseren er installert; ingen reset, ny kursseed eller utsending. Eldre ventende-godkjenningstekst nedenfor er historikk for #256.

Neste leveranse: miljømål BEGGE, Preview først. Kompakt Befaring/Tilbud-oversikt og intern saksvisning, med eksisterende arbeidskøer/søk, én farget statusoversikt, færre dupliserte tilbudshandlinger og ikke-sticky tilbakefelt. Retur til liste beholder bare UI-valg/scroll i en montert firma-/brukeravgrenset ref. Ingen ny varig cache eller saksdata i refen. main.jsx får bare en lokal CSS-klasse på eksisterende Sales-intro. Ingen editor-, beregnings-, auto-save-, recovery-, publiserings-, e-post-, aksept-, prosjektaktiverings-, tilgangs- eller DB-endring. Relevant ny TEST OK kreves før denne salgsrunden merges. QA: docs/qa/SALES_OVERVIEW_UX_20261016.md.

## Preview-oppfølging: én planboks og utklipp – 16. oktober 2026

Miljømål BEGGE, samme umergede PR #256/faste Preview. Kenneths skjermbilde viser at Min side erstattes av «Kontrollerer tilgangen din …» ved utklipp. Synlig fokus/visibility-kontroll beholder nå verifiserte visningsmetadata mens nye serverkall pågår. Faktisk skjult side, rolle-/firmabytte, feil, avslag og feil aktør rydder fortsatt. HR beholder tidligere streng oppførsel som standard; én avgrenset main.jsx-linje aktiverer metadata-valget bare for Min side. Private HR-kontrollere og autoriserte serverhandlinger er urørt. Egne planpopup-er beholdes under synlig kontroll, eksport er sperret til fersk lesing er ferdig, og bevisst lukking vinner over sene svar.

Min side har én boks «Mine aktive planer», med «Fra ProffDok-prosjekter» og «Andre fremdriftsplaner». Kilder, egne oppgaver, aktive datoer og oppdatering er fortsatt separate. Ny relevant TEST OK kreves; ingen merge/Production/demoendring. Førtest og QA: docs/qa/PERSONAL_PROJECT_UX_20261016.md.

## Preview: Min side og prosjektlisten – 16. oktober 2026

Miljømål BEGGE, Preview først. Avgrenset UX etter godkjent planrelease: Min side gjenbruker eksisterende sammenfoldede HR-/kontaktoversikt, med faner først og varsler bare i Oversikt. Egne prosjekt-/KS-planer bruker samme autoriserte kilder og vises ved siden av hverandre på PC. Prosjektlisten bruker lokale fargede kort, fire nøkkeltall i én PC-rad, kompakt tomt samarbeidsfelt, mindre metadatafelt og én samlet tellerrad. Alle eksisterende snarveier er beholdt. Ingen main.jsx, global CSS, lagring, tilgang, varslingsregler, e-post, database, prosjekt-/tilbudsflyt eller planbygger endres.

Ny relevant TEST OK kreves; tidligere godkjenning gjelder forrige release. Production og demo er foreløpig uendret. Scope, QA og testliste: docs/qa/PERSONAL_PROJECT_UX_20261016.md.

## Publisert: fremdrift, bemanning og Startside – 16. oktober 2026

Kenneths TEST OK og uttrykkelige produksjonsgodkjenning er gjennomført. PR #254 er merget; funksjons-main e7363f8a37cf84caebf829a27bc8c25c71559a00, Core Safety #485 SUCCESS, Production dpl_G2NWYyXfjqDbinnzQYy9U8KN3fZV READY med korrekt databasebinding. Alle fire planmigrasjoner er installert og kontrollert i Production, med uendrede eksisterende prosjektplaner og faktisk lagring/lesing i rollback. Varseloversikten finnes bare på Startsiden; globale avvik-/gjennomføringsbannere er fjernet fra øvrige faner.

Main → demo er synkronisert, demo-overlay og kurseksempler beholdt, full build/berørte nettlesertester grønne og faktisk preflight 19 + 5 PASS. Fullt releasebevis og begrensninger: docs/kshms/PROGRESS_HOME_RELEASE_20261016.md og PR #254. Avsluttende dokumentasjonscommitter endrer ikke appfunksjonene; siste main/demo-SHA og Vercel-status føres i PR. Eldre ventende TEST OK-/umerget-/Production-ikke-migrert-notater under er historikk, erstattet av denne release-statusen.

## Godkjent produksjonsløp og kun Startside-varsler – 16. oktober 2026

Miljømål BEGGE. Kenneth ga TEST OK for leveransen frem til 6aa06ba9 og ba om at de to KS/HMS-bannerne bare vises på Startsiden. Deretter ga han uttrykkelig «etter dette er test ok for produksjon» og autoriserte videre arbeid mens han er borte. Tidligere notater om ventende TEST OK er dermed erstattet for denne releasen; grønn QA/Preview kreves fortsatt før merge.

Siste appendring fjerner bare global KshmsTasks-lazyimport og banner-montering i headeren i main.jsx. Eksisterende HomeFollowups-gate beholdes. Samlet oversikt finnes på Startsiden ved innlogging og bevisst retur; ingen engangsflagg skjuler åpne oppgaver. KS/HMS sine vanlige oppgaveinnganger, fristregler, tilgang, e-post, data, lagring og planbygger beholdes. Hjelp følger plasseringen. Førtest med faktisk app-shell-montering fant to bannere i Befaring/Tilbud; etter rettelse 128 Home-Chromium-kontroller PASS, full critical/build og faktisk modulnavigasjon PASS. Ny commit/CI/Preview, produksjonsmigrasjoner, main/deploy og kontrollert demo-synk føres i releasenotat/PR.

## Planpopup: avbryt-hendelse og ramme – 16. oktober 2026

Miljømål BEGGE, Preview først, fortsatt umerget PR #254. Førkontroll: bc9e42892cf7a22fbd1d57843e87eed270bf9bb7, main a7bd4795e78e0ba1cbdc747960384bbf01338581, Core Safety #482 SUCCESS og fast Preview READY på samme head. Kenneth melder at vanlig utklipp fortsatt går ut av popupen, mens egen hurtigtast fungerer. Fysisk Windows-forløp er ikke observert av utvikler. En separat utgang er gjenskapt: nettleserens native cancel/Escape lukker hovedplanen selv om fokus/scroll gjenopprettes riktig.

Hovedplanen lukkes nå bare med Tilbake. Native cancel/Escape og klikk utenfor rammen lukker ikke arbeidsflaten. Mindre oppgave-/kodevinduer beholder Escape og sin egen lukking; cancel stoppes ved det aktuelle undervinduet. Prosjektvalg, tilbud og deling får synlig avrundet ramme, hover og tastaturfokus. Appscope er bare KshmsProgressBoard.jsx/CSS og Hjelp; ingen main, global recovery, wrapper-/tilgangslogikk, planlagring, e-post, SQL eller dataendring.

Førtesten feiler med 0 åpne hovedpopup etter ekte Chromium-Escape; etter rettelse består 28 fokus-/delingskontroller (tidligere 15 beholdt), 39 Prosjekt, 128 KS/HMS og 52 layoutkontroller. Full critical/build PASS. Ramme visuelt kontrollert ved 1280/390 px. QA: docs/qa/PROGRESS_FOCUS_20261016.md. Fysisk Windows-utklipp krever ny innlogget prøve; ingen påstand om at brukerens OS-verktøy er testet. Samme faste Preview-adresse; eksakt ny SHA/tre/CI/Vercel føres i PR #254. Ingen TEST OK/merge/Production eller demo-synk.

## Prosjektvalg og fokus/utklipp i planpopup – 16. oktober 2026

Miljømål BEGGE, Preview først i umerget PR #254 fra a624453f. Åpne Prosjektvalg, tilbud og deling har normal avkryssing og samlet prosjektinfo/handlinger med kompakt delingskort. Generisk dialog-/mobil-CSS hadde gitt avkryssingen tekstfeltbredde og minst 40 px høyde. Lokale regler gir 18 × 18 px med stor klikkbar etikett. Tilbudsimport, Hent lagret plan, kundedelingsvalg og eksisterende prosjektmail er beholdt.

Planpopupens fokusvalidering remonterte arbeidsflaten og nullstilte åpne prosjektvalg samt vertikal/horizontal scrolling. Gjenskapt i faktisk Chromium før rettelse. Den eksisterende, firma-/bruker-/planavgrensede UI-cachen beholder nå bare posisjoner og åpne/lukkede verktøy. Disse brukes etter uendret fersk tilgangs-/planlesing. Synlig fokus, skjult/tilbake, bevisst lukking, nullposisjon, kladd og tilgangstap er kontrollert. Ingen privat planpayload caches av den nye løsningen. Gammel felles pageScrollMemory-rettelse er urørt og består.

Appscope er KshmsProgressBoard.jsx/CSS og bare presentasjonsmarkup for prosjektverktøy i ProjectProgressPlanner.jsx. Ingen main/Startside, global recovery, lagring, tilgang, SQL, e-postarbeider eller demodata endres. QA og konkret Windows-prøve: docs/qa/PROGRESS_FOCUS_20261016.md. Relevant TEST OK gjenstår før merge/Production og kontrollert main → demo-synk.

## Mer plass til oppgavene i begge planbyggere – 16. oktober 2026

Miljømål BEGGE, Preview først i umerget PR #254, fra 21210b32. Prosjekt → Fremdrift, KS/HMS → Fremdriftsplaner og egne planer på Min side bruker samme justerte planflate. Planvisning/handlinger/eksport og prosjektvalg er samlet øverst; Dag/Uke/Måned står sammen med perioden; søk/fag/visningsvalg deler filterlinje. Normal oppgaveradhøyde og farger beholdes. Ingen nye sammenfoldbare oppgaver. Popupens ekstra kortpadding fjernes lokalt, og tidslinjen fyller resten av høyden.

Bare KshmsProgressBoard.jsx og tilhørende CSS endrer appkode. Ingen main/Startside, planlagring, tilbudsimport, deling, eksport, tilgang, SQL, varsling eller demodata endres. Alle eksisterende handlinger og datofelter beholdes. Mobil bryter verktøyene over flere linjer, og kort skjerm kan scrolle verktøyområdet. Drahjelpen har fortsatt fast plass og fanger ingen pekerhendelser. Scope, faktisk skjermmåling og tester: docs/qa/PROGRESS_LAYOUT_20261016.md. Relevant TEST OK for denne og tidligere plan-/Startsideleveranse gjenstår før merge/Production og kontrollert main → demo-synk.

## Kompakt varseloversikt på Startsiden – 16. oktober 2026

Miljømål BEGGE, Preview først i fortsatt umerget PR #254, fra head 614c2562/main a7bd4795. Startsiden samler Avvik, Kontroller, HR og Kontakt i én lukket oversikt med antall, pagineringspluss og tydelige markeringer for passerte frister, i dag, avvik innen tre dager og kontroller etter planlagt dato. Kontakt er én påminnelse med alle manglende felter i detaljene. Eksisterende oppgaver, frister, direktehandlinger, flere oppgaver, e-postlenker, kontaktlagring og egne dialoger beholdes.

HomeFollowups er bare presentasjon. De eksisterende controllerne henter/validerer fortsatt selv og leverer metadata gjennom valgfrie renderere; ingen ny datakilde eller varslingsregel. main.jsx har tre avgrensede endringspunkter: lazy import, utelat global KS/HMS-banner akkurat når Startside-oversikten monteres, og erstatt Startsiden sin HR-montering med samlet oversikt. Alle andre monteringsflater beholder gammel presentasjon. Ingen endring av backend, e-post, tilgang, prosjekt/tilbud eller planbygger. Lokal CSS fjerner sticky/absolutt overlegg bare inne i oversikten. React-state for åpne/lukke beholdes ved fersk lesing; ingen ny nettleserlagring.

QA og brukerprøve: docs/qa/HOME_FOLLOWUPS_20261016.md. Ingen TEST OK for denne eller siste planleveranse er gitt. Ingen merge, Production-endring, migrasjon, nye eksempler eller demo-synk i denne runden. Etter relevant godkjenning gjelder fortsatt kontrollert Production-verifisering og main → demo med preflight.

## Prosjekt får felles planbygger, egne aktive prosjektplaner og firmalogo – 16. oktober 2026

Miljømål BEGGE, Preview først i PR #254. Prosjekt → Fremdrift bruker samme popup/tidslinje som KS/HMS: Dag/Uke/Måned, flytt/strekk/Angre, periodepanel, søk/fagfilter/kompakte rader, standardoppgaver og NS-underkoder, valgfritt personantall og bemanning, direkte PDF, forhåndsvisning, CSV og kalender. Prosjektvalg, tilbud og deling samler tilbudsimport med bevarte opsjoner/dedup og eksisterende kunde-/prosjektmailvalg. Enkel ordre tilbyr ikke kundedeling. Ingen nye fristansvarlige, varsler eller automatiske e-poster. Milepæler/avhengigheter er ikke del av denne leveransen.

Ny ProjectProgressPlanner bruker prosjektets eksisterende tilgang, låsing og separate public.project_progress_plans. Additiv revision og trigger gir CAS også ved eldre direkte skriving. project_progress_editor leser/lagrer med fersk aktiv firma-/aktørkontroll, prosjektets eksisterende access/write-helper, revisjon og bekreftet readback. Kladd er avgrenset til firma/aktør/prosjekt i lokal lagring. Fersk lesing kommer før gjenoppretting; konflikt krever et synlig valg. Fokus/dvale rydder payload og leser på nytt; eksplisitt lukking respekteres. Låst prosjekt er historikk.

Deltakere er aktive interne medlemmer i prosjektets firma og lagres i progress_private.assignments med RLS og uten direkte klientrettigheter. Offentlig plan-JSON og uendret kunde-/UE-RPC inneholder ikke deltaker-ID-er. Nye authenticated project_progress_mine returnerer bare egne oppgaver i aktiv periode etter norsk dato, uten kollegaoppgaver/deltaker-ID-er eller tilbudskilde. Min side viser Mine aktive prosjektplaner når slike finnes; eksisterende KS/HMS-kort beholdes. Tildelte prosjektbrukere kan få Min side uten HR/KS-lisens, uten ekstra prosjekt-/HR-/KS-rettigheter. Eksisterende øvrige personal-context-felter og regler beholdes.

Firmaprofilen leses ferskt for aktivt firma ved eksport i Prosjekt, KS/HMS og Min side. Navn/logo følger nedlastet PDF og forhåndsvisning av fremdrift/bemanning. PDF rasteriserer eksisterende logo og kontrollerer profil/tilgang igjen etter motor-/bildelast. Feil ved logo som er konfigurert stopper nedlastingen med tydelig beskjed; et firma uten logo kan fortsatt eksportere. Historisk prosjektfirma brukes ikke som eksportmerke. Eksisterende prosjektmail og serverens vedleggsrenderer beholdes i denne leveransen.

Knyttet Sandbox bruker varig egen databaselagring også når eldre progressTest=safe-parameter finnes i URL-en; gammel uknyttet trygg Preview beholder lokal editor/eksport/kalender. Sandbox blokkerer ekte prosjektmail i delingsflaten. Production-binding og andre modulflyter endres ikke. Sandbox-migrasjon 20261016142124_project_progress_workspace har kilde-MD5 (ett avsluttende linjeskift) 399e53ac4ed95cfe24f7cf1022baa282, lik migrasjonsloggen. Production er ikke migrert.

Kurseksempel er separat Sandbox-data i Expo Proffsenter: DEMO – VVS – fremdrift og bemanning 3 måneder, prosjekt-ID 5ea8d503-e38c-43d4-94ce-7fab7df525e9, revisjon 1, 16.10.2026–15.01.2027, 21 oppgaver/282 dagsøkter, 1–5 personer, topp 23 og 6408 persontimer, uten søndager. Kenneth Demo er deltaker på fire oppgaver. Opprettet og verifisert gjennom authenticated prosjekt-/planlagring; tidligere arbeidsprofil er gjenopprettet. Ingen kursdata/seed i produksjonsmigrasjon eller demo-overlay i core-PR. Eksemplet ligger i Sandbox klar for kurs når godkjent appkode synkroniseres main → demo. Eksakt QA/CI/deploy føres i docs/qa/PROJECT_PROGRESS_20261016.md og PR #254.

## PDF lastes ned direkte, og bemanning bruker norske ukenavn – 16. oktober 2026

Miljømål BEGGE, Preview først i PR #254. KS/HMS og Mine aktive fremdriftsplaner har Last ned fremdriftsplan (PDF) og Last ned bemanningsplan (PDF). De lager faktiske PDF-filer med appens eksisterende jsPDF 2.5.1-motor. Forhåndsvis fremdriftsplan / Forhåndsvis bemanningsplan beholdes med separate Last ned PDF og Skriv ut. Nedlasting åpner ikke utskriftsdialog. Den delte Prosjekt-eksportens standardvisning endres ikke.

Ny paginert vektor-PDF har firma, referanse, adresse, sidetall, Gantt per uke og fulle grupperte arbeidsperioder med merknader, eller bemanning per uke/dag med summer og tydelig ufullstendig grunnlag. Fersk plan- og tilgangslesing gjentas etter PDF-motorlast, før nedlasting. Min side bruker bare egen plan via mine-RPC. Ulagret kladd og bortfalt tilgang stopper eksport. Intern ISO-ukenøkkel beholdes for beregning/sortering, mens HTML, CSV og PDF viser for eksempel Uke 42 · 2026, også korrekt ISO-ukeår rundt nyttår. Ingen database-, rutinevarsling- eller eksempeldataendring. QA/releasebevis: docs/qa/KSHMS_PROGRESS_20261016.md og PR #254.

## Mine aktive fremdriftsplaner og deltakerlag – 16. oktober 2026

Miljømål BEGGE, Preview først i samme PR #254. Hver KS/HMS-oppgave kan ha valgte appbrukere fra aktivt firma med gjeldende KS/HMS-tilgang. IDs lagres i planens assigneeIds. Antall personer er et separat, valgfritt bemanningstall som også kan dekke innleide. Ingen medlemskap/modultilganger opprettes. Deltakere er planlagt arbeidslag, ikke nye fristansvarlige; ingen e-post sendes.

Min side → Oversikt viser Mine aktive fremdriftsplaner. Serveren bruker norsk dato og første/siste økt på brukerens egne oppgaver som ikke er Ferdig. Perioden inkluderer mellomliggende fridager. Udaterte, fremtidige, utløpte og arkiverte planer vises ikke. Planvinduet og eksporten inneholder bare brukerens egne oppgaver i planen. Datoperioden kontrolleres igjen ved åpning, eksport, fokus/dvale og datobytte. Bare UI-valg beholdes mellom visninger; payload leses på nytt. Bevisst lukking respekteres.

Nye avgrensede RPC-er: kshms_progress_people og kshms_progress_mine. Privat trigger validerer unike kanoniske bruker-ID-er, høyst 50 per oppgave, aktivt firmamedlemskap og KS/HMS-tilgang ved nye valg. Eksisterende deltakere som senere mister tilgang kan beholdes som historikk eller fjernes, men kan ikke velges på nytt; bortfalt tilgang gir ingen personlig lesetilgang. Eksisterende save/CAS/readback og privat RLS-tabell beholdes. Additiv migrasjon 20261016132206_kshms_progress_participants, først Sandbox.

Drahjelpen har nå en fast høyde over tidslinjen. Drag starter uten å legge inn et nytt bunnfelt eller krympe arbeidsområdet, og hjelpen fanger ingen pekerhendelser. Min side-popuper ligger utenfor oversiktskortets CSS slik at tidslinjens knapper beholder layout. 3-måneders VVS-eksempel opprettes separat som Sandbox-data, aldri som produksjonsmigrasjon. Verifikasjon og eksakt releasebevis: docs/qa/KSHMS_PROGRESS_20261016.md og PR #254.

## KS/HMS-planbygger: popup, bemanning og flere underkoder – 16. oktober 2026

Miljømål BEGGE, Preview først i PR #254. Åpning/opprettelse viser planbyggeren direkte i en stor popup over appen. Tilbake lukker popupen; Åpne planbygger og Åpne bemanningsplan åpner igjen. Fokus/dvale respekterer bevisst lukking og bevarer kladd og valgt visning etter fersk tilgangskontroll.

Kodeutvalget er utvidet fra 57 til 256 kontrollerte valg i 25 hovedgrupper fra Bergen kommunes offentlige NS 3451:2022-grunnlag (FDVU v3.0/2025, tabell 4, s18–23). Tre-/firesifferkoder vises under hovedgruppen, systemkode merkes separat. Fagfilter bruker alle relevante fagkoblinger, slik at blant annet overflatekoder finnes for både mur/flis, maler og tømrer. Korte navn og fagkoblinger er appens egne. Utvalget er ikke den komplette standarden; oppgaver og egne kodevalg kan fortsatt tilpasses.

Antall personer per oppgave er valgfritt (1–999; tomt betyr ukjent). Bemanningsplan viser høyeste samtidige personbehov og persontimer for valgt dag/uke/måned. Samtidig behov beregnes fra klokkeslett, og overlapp innen samme oppgave dobbelttelles ikke. Ukjent antall og oppgaver uten tider gjør grunnlaget ufullstendig. Eksport → Bemanning / PDF og Last ned bemanning (.csv) bruker hele den bekreftede, lagrede planen; ulagret kladd blokkerer eksport.

Nye planer utelater søndager, men inkluderer lørdager. Flytting/strekk følger synlige arbeidsdager. Eksisterende planer endres først når brukeren velger Utelat søndager, bekrefter antall økter som fjernes fra kladden, og lagrer. Angre kan gjenopprette før lagring. Privat additiv migrasjon `20261016125012_kshms_progress_staffing` validerer feltene uten nye RPC-er eller rettigheter. Bare Sandbox migreres før TEST OK. Prosjektets tilbudsimport og portal følger fortsatt opprinnelig flyt. Se `docs/qa/KSHMS_PROGRESS_20261016.md` for test-/releasebevis.

## KS/HMS-plan: tidslinje og underkoder – 16. oktober 2026

Samme leveranse/PR #254, fortsatt Preview før ny TEST OK. Kenneth ønsket mindre scrolling og direkte planlegging. KS/HMS har nå søkbart hierarki med 57 utvalgte hoved-/under-/systemkoder, Dag/Uke/Måned, direkte flytting og strekk fra begge ender, Angre, kompakte rader, fag-/tekstsøk og Utvid-visning. Sidepanel erstatter lange skjemaer i oversikten. Planvalg og eksport og planlisten er sammenfoldet under arbeid.

Datoer/klokkeslett lagres fortsatt som eksisterende separate dagsøkter. Uke/måned bruker hele kalenderdager, Dag bruker 30-minutters trinn. Sammenhengende perioder inkluderer helg; opphold blir egne perioder. Endringer krever Lagre fremdriftsplan; eksport bruker lagret serverutgave. Visning/åpent sidepanel beholdes i samme firma/bruker/plan ved fersk tilgangskontroll. Dra avbrytes ved Escape, skjult vindu eller bortfalt tilgang. Ingen ny backend eller databaseendring i denne UX-oppfølgingen. Prosjekt og portal bruker fortsatt eksisterende visning. Detaljer og QA: `docs/qa/KSHMS_PROGRESS_20261016.md`.

## Egne fremdriftsplaner i KS/HMS – 16. oktober 2026

Miljømål BEGGE, først fast Preview med Sandbox. Fra main `a7bd4795e78e0ba1cbdc747960384bbf01338581`. KS/HMS → Fremdriftsplaner lar firmaet opprette uavhengige planer med navn, adresse og valgfritt eksternt prosjektnummer. Samme planeditor, ukevisning, mobilkort, Gantt/PDF og kalender som Prosjekt; ingen tilbudsimport eller kundedeling i KS/HMS. Firmaadmin og KS/HMS-ansvarlig redigerer; øvrige med KS/HMS-tilgang leser. Planene kan arkiveres og gjenopprettes.

Egen privat tabell og tre RPC-er bruker eksisterende aktiv firma-/KS-autorisasjon og revisjonskontroll. Bekreftet serverlesing før åpning og eksport; lagring leses tilbake før suksess. Lokal kladd er avgrenset til firma, bruker og plan og gjenbrukes bare mot samme serverrevisjon. Ingen prosjektplan, portal, tilbud, HR-opplysning eller e-post endres. Person/firma er fritekst for planlegging, ikke tildelt oppfølgingsoppgave eller fristvarsel.

NS 3451:2022: 24 utvalgte faktiske kodekoblinger fra Bergen kommunes offentlige FDVU-grunnlag (2025), med egne korte visningsnavn. Skiller bygningsdel/system; manuelt kodevalg er mulig. Ikke komplett standard eller automatisk kontroll av at manuelt kodevalg passer jobben. Detaljer, tester og releasebevis: `docs/qa/KSHMS_PROGRESS_20261016.md`. Ny TEST OK kreves før main/Production og kontrollert main → demo-synk.

## Kontaktopplysninger – påminnelse i appen, 15. oktober 2026

Miljømål BEGGE. Fra main `6d7a6dc2899f941f23bea33e4cdf1c9458670216`, egen feature `feat-contact-reminder-20261015`. Startsiden og Min side viser påminnelse ved manglende gateadresse, postnummer, poststed eller pårørendes navn/telefon. Fyll ut kontaktopplysninger åpner eksisterende privat skjema direkte. Relasjon og pårørendes e-post er valgfrie. Fersk dobbel egenlesing kreves før visning; bare fullføringsmetadata beholdes i påminnelsen. Bekreftet kontaktlagring utløser ny lesing og fjerner fullført påminnelse. Eksisterende kladd, tilgang og lagring beholdes. Ingen SQL, migrasjon, e-post, hovedmeny, main.jsx eller annen datalagring endres. 55 Chromium-kontroller og eksisterende kontakt-/Min side- og 108 HR-varselkontroller PASS. Full critical/build, CI og fast Preview verifiseres før relevant TEST OK og publisering. Tidligere TEST OK for invitasjonsleveransen attesterer ikke manuell test av denne nye påminnelsen. Detaljer: docs/qa/HR_CONTACT_REMINDER_20261015.md.

## Automatisk HR-registrering fra invitasjon – 15. oktober 2026

Ved invitasjon med HR valgt opprettes medarbeideren automatisk i det inviterende firmaets HR-register når kontoen blir aktiv. Eksisterende aktiv konto behandles med én gang. Hvis HR-registeret ikke er satt opp eller er deaktivert, fullføres registreringen når firmaet lagrer et aktivt HR-oppsett. Eksisterende medarbeider, leder, lesere og historikk beholdes. En eksisterende gyldig leder i firmakartet gjenbrukes; ellers står leder tom til firmaadmin velger den i HR. Ingen medarbeidere kopieres mellom firmaer.

Miljømål BEGGE fra main 657a430f. Scope: privat invitasjonsfunksjon, én privat HR-registreringshjelper/oppsett-trigger, to hjelpetekster, Hjelp og regresjonsvern. Eksplisitt lagret og akseptert HR-valg, uendret invitasjonsfingeravtrykk og fersk firma-/modultilgang kreves. Avsluttede arbeidsforhold gjenopprettes ikke. Ingen nye offentlige RPC-er, medlemskap, RLS, e-postarbeidere eller generell masseinnmelding. 121 PostgreSQL-kontroller, 52 Chromium-kontroller, eksisterende HR-register/meny/Hjelp og full critical/build PASS. Ingen ekte invitasjon eller e-post sendt under QA. Samme pågående invitasjonsleveranse; Kenneths uttrykkelige TEST OK og ønske om egen prøve i Production beholdes. Ingen ny manuell brukerprøve attesteres. Eksakt CI/Preview/Production/demo-bevis føres i release-PR. Detaljer: docs/qa/COMPANY_INVITATION_AUTO_HR_20261015.md.

## Send invitasjon på nytt – 15. oktober 2026

Firmaadmin får **Send invitasjon på nytt** ved hver ventende invitasjon. Den bruker opprinnelig registreringsidentitet og fersk logo/firmanavn. Ny, lesende manager-RPC kontrollerer valgt firma, invitasjons-ID, ventende status og deaktivert konto. Den omskriver aldri invitasjonen, inviter, tidspunkt, rolle, lagrede tilgangsvalg eller aksept-fingeravtrykk. Klienten kontrollerer firma/aktør/ID på nytt før eksisterende e-posttjeneste brukes. Dobbeltklikk blokkeres; brukt invitasjon, bortfalt tilgang og firmaswitch stopper sending. Feil viser prøv igjen ved invitasjonen; suksess sier at e-posttjenesten har bekreftet utsending, uten å påstå mottak.

Miljømål BEGGE fra main 736d5ce7. Scope: Firmaadmin-panel/klient, én additiv read-RPC, utvidet eksisterende QA og dokumentasjon. 89 PostgreSQL- og 52 Chromium-kontroller består, inkludert alle tidligere modultilganger, firmaskille og Systemadmin-isolasjon. Ingen ekte e-post sendes under QA. Samme faste Preview og videre publiseringsløp som pågående firma-/invitasjonsleveranse. Ingen andre rettigheter, data eller e-postarbeidere endres. Detaljer: docs/qa/COMPANY_INVITATION_RESEND_20261015.md.

## Firmaadmin og Systemadmin holdes i hver sin flate – 15. oktober 2026

Etter publisering av PR #249 viste Kenneth at Firmaadmin i Bademiljø Expo fikk den globale firmaoversikten. Rotårsaken var eldre DOM-adaptere som søkte etter «Brukere og tilganger» i hele dokumentet og monterte systemadmins firmavelger i den nye, avgrensede React-flaten. Serverens Firmaadmin-snapshot var riktig avgrenset til 10 medlemmer i Bademiljø Expo; ordinær proffadmin ble fortsatt nektet tilgang til andre firmaer i faktisk Production-SQL-prøve med rollback.

Fire systemadmin-adaptere finner nå bare elementer i den dedikerte Systemadmin-seksjonen og utelukker den avgrensede Firmaadmin-flaten. Regresjonstesten installerer de fire faktiske adapterne sammen med Firmaadmin: feilen reproduseres på publisert kode; rettelsen består 40 Chromium-kontroller, inkludert fortsatt global firmaliste og bruker-/arbeidsprofilkontroller under Systemadmin, samtidig visning og navigasjon bort. Ingen SQL, brukerrettigheter, medlemskap eller e-postendring. Miljømål BEGGE; rettelse av samme godkjente leveranse som brukeren prøver i Production. Full critical/build grønn. Releasebevis føres i oppfølgings-PR og `docs/qa/COMPANY_ADMIN_ISOLATION_20261015.md`.

## Tilgangsvalg ved invitasjon – 15. oktober 2026

Firmaadmin velger nå rolle, hovedmoduler, KS/HMS, HR og eventuell KS/HMS-rolle før **Inviter ansatt**. Valgene vises på ventende invitasjoner og brukes atomisk når en ny bruker bekrefter registreringen. Firmaavtale, inviterens gjeldende delegasjonsrett og rett firmamedlemskap kontrolleres på nytt. Eksisterende kontoer beholder hovedmoduler/primærfirma/historikk; valgte firmatilganger oppdateres. Vanlige proffkunder administrerer bare eget firma. Ekstra arbeidsprofiler krever systemadmin og er begrenset til den interne Ringside/Expo-gruppen.

Miljømål BEGGE, samme Preview og PR #249, fortsatt ingen Production-/demo-release. 72 PostgreSQL- og 31 Chromium-kontroller, full critical/build og faktisk ny registrering/tilgangsvalg/proffkundeskille med full rollback består. En eldre Sandbox-variant av arbeidsprofilhjelperne er gjenopprettet til eksisterende main-kontrakt; Production hadde allerede riktige sperrer og er bare lest. Detaljer: `docs/qa/COMPANY_ADMIN_20261015.md`.

## Firmaadministrasjon i aktivt firma – 15. oktober 2026

Firmaadmin bruker serverens aktive firma til brukerlisten, invitasjoner og firmaroller, også når systemadmin representerer Bademiljø Expo. Brukerkortet samler rolle, hovedmoduler, KS/HMS og HR. Hovedmoduler gjelder kontoen; KS/HMS og HR gjelder firmaet som vises. Kontostatus gjelder alle firmaer og styres av systemadministrator. En systemadmin kan legge til et ekstra internt arbeidsfirma uten å flytte primærfirma eller historikk. Registrering bruker firmaets stabile identitet også etter navneendring.

Miljømål BEGGE, feature/Preview først. Ingen Production-/demo-release før ny relevant TEST OK. Scope, tilgangsgrenser og bevis: `docs/qa/COMPANY_ADMIN_20261015.md`.

## Valgfri snarvei til timeføring på mobil – 14. oktober 2026

I **HR → Timer og utlegg → Timeoppsett** kan firmaet slå på **Vis snarvei til timeføring på mobilforsiden** og trykke **Lagre timeoppsett**. Valget er avslått som standard. Et mørkt kort med turkis klokke og **Før timer** åpner den personlige timeføringen direkte fra mobilforsiden.

Kortet krever aktiv timeregistrering, firmaets lagrede valg og registrert medarbeider med HR-tilgang i aktivt firma. Timeveiledningen i Hjelp er også avgrenset til HR. Desktop og eksisterende prosjektmenyer beholdes. Av/på, firmabytte, fersk tilgangskontroll og bevaring av ulagret timekladd er testet. Full kontrakt/QA: `docs/kshms/TIME_REGISTRATION_20261014.md`.

## Avbryt timeføring uten ekstra varsel – 14. oktober 2026

Etter brukerens ønske lukker **Avbryt**, krysset og Escape timeeditoren direkte. Ulagret endring forkastes, lagrede timer beholdes og forkastet kladd gjenåpnes ikke ved remount. Endringen gjelder bare timeeditorens lukking; ingen backendendring. Faktiske React-scenarioer dekker de tre lukkemåtene, manglende lagringskall, forkastet kladd og bevaring av lagret prosjekt/timetall. Samme Preview/PR #245; Production uendret.

## Manuelt prosjekt fra annet ERP – 14. oktober 2026

Samme Preview og PR #245. I **Min side → Mine timer → Ny registrering** kan ansatte skrive direkte i **Prosjektnummer, navn eller adresse** uten å velge noe i prosjektlisten først. Feltet vises når ingen ProffDok-prosjekt er valgt. **Manuelt prosjekt / annet ERP** finnes også i prosjektlisten. Ett felt på høyst 240 tegn tar nummer, navn, adresse eller en kombinasjon. Omgivende blanktegn fjernes; ledende nuller og øvrig tekst beholdes. Referansen vises i kontroll/historikk og følger uendret i CSV-feltet `project_number` (standardoverskrift Prosjektnummer). Ved import må referansen stemme med mottakersystemets forventning. CSV-oppsett og valgt kolonnerekkefølge endres ikke.

Eksisterende ProffDok-prosjekter velges som før. Manuell referanse oppretter ingen prosjekt-/tilgangsrad. Påkrevd prosjekt kan oppfylles med en manuell referanse; kombinasjon av intern prosjekt-ID og manuell tekst avvises. `time_timer_command_v2` tar samme manuelle referanse, mens gammel RPC-signatur er bevart som wrapper. Timerens lagrede manuelle referanse følger stopp og lagret ukelinje. Eksport-, godkjennings-, CAS-, rolle-, fil- og tomånedersregler beholdes.

Avgrenset scope: timeeditor/oppsett/core, additiv migrasjon `20261014161822_time_external_project_reference.sql`, ny timerkolonne og v2-RPC, uendret ekstern eksportkontrakt, tester og hjelp/docs. Ingen endring i prosjekter, prosjektmeny, ERP-integrasjon, medlemskap, andre moduler eller Production. Lokal PostgreSQL 113 og faktisk React 44 assertions PASS; alle tidligere kontroller beholdes. Full critical/Sandbox-build PASS. Sandbox-migrasjon installert; eksisterende HR/KS-funksjoner, gamle policies, runtime, lagrede demotimer og mailinnstillinger er uendret. Ekte Sandbox-regresjon består 23 assertions med full rollback. Preview/CI føres i PR. Den kjente sperren i skynettleserens native credential state omgås ikke; ingen ny brukerinnlogging kreves av en deploy.

## Timer og utlegg – 14. oktober 2026

Miljømål **BEGGE**, fra main `d95f14c80e2a87bd4fed4e31cf47f712c3c2ca48`. Ansatte fører i **Min side → Mine timer**. **HR → Timer og utlegg** samler kontroll, firmaets timeoppsett og konfigurerbar CSV-eksport. Antall timer, fra–til med pause og serverlagret start/stopp støttes, sammen med fravær, overtid, reise/km, tillegg og utlegg med private PDF/JPG/PNG-kvitteringer. Overtid beregnes ikke automatisk. Importformat må prøves når lønnsprogram er valgt.

Firmaadmin velger timeansvarlige. Egen ansatt fører; aktuell nærmeste leder eller timeansvarlig kontrollerer. Egne timer kan ikke godkjennes av samme bruker. Innsendte uker er låst til tilbaketrekking/retur. Eksport omfatter bare godkjente, ikke tidligere eksporterte linjer og krever ansattnummer/lønnskode/prosjektnummer der påkrevd. Eksportarkivet lar samme fil lastes ned igjen; nedlasting er ingen bekreftelse på import eller utbetaling.

Kenneths avklaring: ferdig eksporterte uker, endringshistorikk og kvitteringer ryddes etter **to kalendermåneder fra siste eksport for uken**. Åpne/ufullstendig eksporterte uker beholdes til ferdigbehandling. Daglig databasejobb rydder innhold; egen tokenbeskyttet Edge-worker fjerner kvitteringer via Storage API og bekrefter fravær før køen kvitteres. Minimale firma-/medarbeider-/ukemarkører uten navn, timer eller beløp hindrer falske manglende-oppgaver og ny innlegging i ryddet uke. Eldre lønnsgrunnlag finnes i lønnssystemet. Utdatert idempotens og historiske, ikke eksportrefererte utgaver ryddes også etter to måneder.

Avgrenset scope: ny time-modul, to innganger i HR/Min side, additiv privat database/storage/RPC/cron, egne mail-/cleanup-workers, Hjelp, dokumentasjon og permanent QA. Eksisterende HR-/KS-funksjonskilder og gamle policies er identiske i Sandbox; ny enrollment-trigger er eneste integrasjon i HR-tabell. Sales, globale menyer, profil, medlemskap og eksisterende mail-workers endres ikke. Time-e-post er implementert, men fortsatt AV i Sandbox; produksjonsaktivering inngår i senere release.

QA: 98 lokale PostgreSQL-assertions og 37 faktiske React-assertions PASS. 19 faktiske Sandbox-assertions PASS, alle random syntetiske fixtures rullet tilbake. Min side, eksisterende HR-register/Hjelp og modulnavigasjon PASS. Full critical/Sandbox-build PASS. Hjelpetester er utvidet fra tre til fire HR-kapitler; alle tidligere kapitler/innholdskontroller beholdes. Representative 10-linjers uke med hver lagring/godkjenning/eksport målte ~52 kB lagrede radbytes; 40 ansatte × 9 uker ~19 MB før indekser/ledig plass. Vedlegg kommer i tillegg. Praktisk anslag 30–60 MB for dette mønsteret, ikke en øvre kvote.

Sandbox `ppvircenkjizeiqdxphj`: migrasjon installert, egne workers ACTIVE, cleanup-endepunkt konfigurert; ny time-mail fortsatt AV. Standard migreringsverktøy feilet to ganger med `Invalid or expired requestState`; samme autoriserte migrasjon ble installert via én eksplisitt SQL-transaksjon og registrert med versjon `20261014144538`. Ingen Production-migrering/merge er gjort. Preview, CI og innlogget brukerprøve føres nedenfor. TEST OK gjelder denne nye funksjonen separat.

## Samlet firmagodkjenning – 12. oktober 2026

Miljømål **BEGGE**, fra ferdig #236/main `5c5e32792895e213280d893975d8eeea6872c3cb`. Kenneth viste enkeltgodkjenning på R-087 og ba om en raskere firmagodkjenning. **Godkjenn flere rutiner** øverst i Håndbok lar firmaadmin og KS/HMS-ansvarlig velge lagrede utkast, inkludert Velg alle som venter, lese eksakte utkast/utgavenummer og bekrefte felles vurdering. Én ny additiv transaksjons-RPC bruker uendret kshms_command(publish) for hver utgave. Gammel godkjenning, historikk, tildeling, varsling og eksplisitt valgfri egen lesebekreftelse beholdes. Ulagret tekst og stale/feil aktør/rolle/firma stopper handlingen; ingen delvis publisering. 87-utkast/88-utgaveprøve i lokal PostgreSQL og ekte Sandbox rullet helt tilbake, faktisk React for begge roller og gammel enkeltgodkjenning/auto-neste PASS. 86 eksisterende funksjoner og 102 relasjoner/RLS/ACL er identiske i Sandbox. Kenneths avgrensede produksjonsautorisasjon for isolert samlet rutinebehandling gjelder; ingen ny manuell Kenneth test påstås. Preview/CI, Production og kontrollert main → demo verifiseres før sluttmelding. [Kontrakt og bevis](../kshms/BULK_PUBLICATION_20261012.md).

## KS/HMS butikk-/lager-/truckrutiner og samlet egen lesebekreftelse – 12. oktober 2026

14 nye selvstendige rutineforslag gir 87 forslag totalt; de 73 eksisterende verifiseres uendret. Butikk, lager og truck har egen velger og vanlig utkast → tilpasning → godkjenning. Medarbeider, KS/HMS-ansvarlig og firmaadmin kan bekrefte alle egne aktive, tildelte, ubekreftede utgaver samlet etter uttrykkelig lest-og-forstått-avkrysning. Eksakt liste med titler/versjoner vises før handlingen. Enkeltbekreftelse og eksisterende historikk beholdes. Én additiv, selvbegrenset RPC lagrer kvittering/identitet og samme serverdato/-klokkeslett per ny utgave atomisk; nye tildelinger under gjennomgang avviser listen. Fersk own-scope readback kreves før UI-suksess. Alle 85 eksisterende KS/HMS-funksjoner og 102 relasjons-/RLS-/ACL-definisjoner er verifisert uendret i Sandbox, og syntetiske 87-utgaveprøver er rullet tilbake. Ingen endring av HR, salg, prosjekt, globale tilganger, worker/mail/cron eller PDF-eksport. Miljømål BEGGE innenfor Kenneths eksplisitte produksjonsautorisasjon etter isolert QA/Preview. [Kontrakt og QA](../kshms/BULK_ACK_STORE_20261012.md).

## Tydelig gjennomføring og trygg referatgjennomgang – 12. oktober 2026

Miljømål **BEGGE**, fra ferdig publisert PR #234/main `c0f3a015d8a47b81d0d2a0f0a9ed7b18aa06da12`. Kenneth ba om faktisk UX-test og retting. Innlogget Preview med eksisterende syntetisk kursmedarbeider bekrefter uklar opprettingsinngang etter deling. Faktisk React og lokal PostgreSQL reproduserte at gjentatt Send til begge for gjennomgang nullstilte gitt bekreftelse.

Opprettingsinngangen heter **Opprett ny medarbeidersamtale** og forklarer at eksisterende samtaler fortsettes nedenfor. Status og neste steg forklares. Nytt lederinnspill åpner Felles møte mens møtet pågår, med delte svar og medarbeiderens delte kommentar; sendte/ferdige referater åpnes i Referat. Eksisterende RAM-kladd og valgt steg ved ny autorisasjon beholdes. Referat samler delt forberedelse, møtenotater, tiltak, ansvarlig, frist og neste oppfølging. Ulagret forhåndsvisning merkes tydelig og kan ikke sendes/bekreftes. Privat, ikke delt forberedelse tas ikke inn i oversikten.

**Lagre samtale** lagrer arbeidet. **Send til begge for gjennomgang** vises bare før sending. Begge bekrefter selv med **Jeg har lest referatet**. En ferdig samtale lukker ikke åpne tiltak. Forrige/Neste bytter steg uten å lagre. Endret referat eller delt kommentar krever fortsatt nye bekreftelser.

Scope: HrConversations, ny ren HrConversationReview, samtale-sessionens åpningssteg, scoped CSS, én migrasjon som bare gjør ready på samme awaiting-utgave til en lesende no-op, utvidet eksisterende React/PostgreSQL/session-QA og Hjelp/docs. Alle opprinnelige firma-/rolle-/medarbeider-/CAS-/required-field-kontroller beholdes før no-op. Ingen ny RPC/tabell, grants/RLS/tilgang, medlemskap, worker/cron/mail eller annen modul. Retry lager ingen revisjon, historikk, kvittering eller mail; faktisk innholdsendring beholder tidligere bekreftelsesregel.

QA, CI, eksakt Preview-kilde og innlogget ny visning føres i release-PR. Sandbox-mail beholdes AV; ingen kurssamtale resettes, og ingen ekte medarbeider/profil/leder/tilgang endres som QA. Tidligere TEST OK beholdes; godkjenningen for #234 gjelder ikke automatisk denne nye UX-/retry-rettingen. Kenneth ga avgrenset TEST OK 12. oktober 2026 kl.10:47 Europe/Oslo: «får ikke test så TEST OK». Godkjenningen gjelder denne leveransen i PR #235, basert på agentens innloggede Preview-kontroll og grønne automatiske scenarioer/CI. Kenneth gjennomførte ingen ny manuell Preview-prøve. Production-migrasjon/merge og kontrollert main → demo er autorisert; tidligere tester/godkjenninger beholdes.

Innlogget etterprøve: fast Preview beholder økten over deploy. Opprett ny medarbeidersamtale, status for delt forberedelse og samlet Referat er kontrollert i faktisk publisert kurssamtale. Midlertidig syntetisk RAM-tekst vises i ulagret forhåndsvisning og sperrer sending; original tekst er satt tilbake uten lagring. Kurssamtalen er fortsatt utgave 4, ingen mail/write/reset. Dialoghodet dekket 8 px av stegoverskriften; scrollmargin for bare den ordinære samtalens steg er økt slik at hele overskriften vises etter stegbytte. QA: 105 samtale-React, 108 varsel-React, 267 PostgreSQL og 131 runtime assertions PASS, berørte eksisterende brukerreiser og full critical/build BEGGE PASS. Endelig CI/READY/byteeksakt kilde og målt innlogget stegvisning føres i release-PR #235.

## Navn i åpnet medarbeidersamtale – 12. oktober 2026

Miljømål **BEGGE**, avgrenset feilretting etter ferdig publisert #233/main `a5be1c976ceb4c4ab19e326647dcf79c7b63e99e`. Kenneth viste en direkte åpnet samtale uten medarbeideridentitet. Dialogtittelen viser nå Medarbeidersamtale – navn, og selve samtalen viser Medarbeider: navn med e-post. E-post brukes som reserve hvis profilnavnet mangler. Navnet kommer fra den samme autoriserte medarbeiderens profil, aldri innlogget leder, e-postgjetting eller samtaletittel. Bare den åpne private samtalen viser navnet; generelle kort på Startsiden/Min side og e-post beholder eksisterende innhold.

Scope: én ny ren hrEmployeeLabel, HrFollowupNotice-dialogtittel, HrConversations-identitetsfelt/CSS, én migrasjon som bare utvider den eksisterende private employee_json-formatteringen med valgfritt full_name, permanent React/PostgreSQL-QA og Hjelp/docs. Profilnavnet er visningstekst fra typetestet/trimmet raw_user_meta_data.full_name, maks 120 tegn; ingen autorisasjonsbeslutning bruker metadata. Ingen ny RPC/tabell, grants/RLS/tilgang, medlemskap, leder, samtaleinnhold/revisjon/historikk, e-post/worker/cron, PDF/kalender, Sales/recovery, prosjektflyt eller menyendring. Formatterens tidligere felter og interne privilegier beholdes. Fersk reautorisasjon skjuler identitet sammen med resten av dialogen ved bortfalt tilgang, firma-/brukerbytte og sene svar.

QA: faktisk varselkort/direkte dialog/Min side React 101, samtale-React 89 og PostgreSQL 260 assertions PASS. Navn fra riktig medarbeider, navneløs/ugyldig metadata, e-postreserve, maksimal lengde og private helperprivilegier er dekket; tidligere tilgang/kladd/direkte sak/innspill/paginering/ingen mail-scenarier er beholdt. Eksisterende HR-foundation, Min side/kontakt og module-navigation runtime PASS. Full critical/build og kilde-/metadata-/CI/Preview-bevis føres i release-PR. Ingen faktisk medarbeider/profil/leder/tilgang endres eller e-post sendes som QA.

Sandbox-migrasjon installert: formatterens funksjonskropp er lest tilbake byteeksakt. Alle øvrige HR-funksjoner, policies, triggere, runtime, e-postinnstillinger og helperprivilegier er uendret. Faktisk lesende prøve med eksisterende syntetisk kursmedarbeider er rullet tilbake; navn/bruker-ID/revisjon stemmer. Ingen advisor-tillegg. Full critical/build Production og Sandbox PASS. PR #234: godkjent funksjonskode `6151ada6172ffc49ecb2d135dee1b85f37f85255`, Core Safety `38212621017` / jobb `114689997559`, alle steg SUCCESS. Fast Preview `dpl_4aNs4pSFirbzkJqYqoQB2yEPBtcG` READY, HTTP200 og 31 berørte JS/CSS-filer byteeksakte mot vanlig Sandbox-build. Endelig Production/main → demo-bevis føres i release-PR.

Dette er ny avgrenset navnevisning; tidligere TEST OK for #233 og alle andre funksjoner beholdes. Kenneth ga TEST OK for navnevisningen 12. oktober kl.08:34 Europe/Oslo. Godkjenningen gjelder denne avgrensede rettingen i PR #234. Ingen gamle tester skal gjentas. Production-migrasjon/merge og kontrollert main → demo er autorisert; tidligere godkjenninger er ikke brukt som generell fullmakt.

## Lederkort for delte medarbeiderinnspill – 12. oktober 2026

Miljømål **BEGGE**. Ny avgrenset leveranse etter ferdig publisert #232, fra main `ababf3f2c23f4ed9d54c36eed4000f4c397c3e53`. Ingen generell Production-godkjenning arves fra tidligere direkte bestillinger. Kenneth ga ny avgrenset TEST OK 12. oktober kl.07:27 Europe/Oslo: «noe jeg må teste? Hvis ikke er test ok». Ingen ekstra manuell prøve er nødvendig for godkjenningen; den nye funksjonen er kontrollert med faktisk React/PostgreSQL, publisert Preview/sourcekontroll og grønn CI. Ingen innlogget lederkortprøve er attestert, og tidligere godkjenninger gjenbrukes ikke som generell Production-fullmakt. Production-migrasjon/merge og kontrollert main → demo er autorisert for akkurat lederkortet.

Gjeldende nærmeste leder får **Nytt innspill til medarbeidersamtalen** i Dine varsler og oppfølginger på Startsiden og Min side i aktivt firma. Eksisterende `employee_feedback_revision` fra Klar til samtale eller endret delt medarbeiderkommentar styrer kortet, også når e-post er deaktivert. Privat kladd, lederens egen kommentar og uendret medarbeiderkommentar lager ingen ny feedback-revisjon. Kortet viser generell tekst og pekere, ingen personnavn, private svar eller kommentarer. Åpne samtalen går direkte til riktig samtales Referat, der kommentaren kan leses; Forberedelse/Felles møte viser de delte forberedelsessvarene.

Kortet håndteres uttrykkelig med **Marker innspillet som håndtert** i den ferskt autoriserte, gjeldende samtalen. Åpning/polling/lesing håndterer ingenting. Handlingen er sperret ved ulagret kladd, konflikt, historisk/annen sak eller endret revisjon. Privat kvittering gjelder samtale + faktisk leder + nøyaktig feedback-revisjon. Senere endret kommentar vises på nytt. Ny leder arver ikke forrige leders kvittering. Samtalen og dens revisjon/historikk/bekreftelser beholdes. E-postkø, utsending, worker, cron og mailstatus er uendret; håndtering sender ikke e-post på nytt.

Scope: HrFollowupNotice/transport, én HrConversations-propintegrasjon, ny isolert HrConversationFeedback, én additiv migrasjon med privat RLS-stengt kvitteringstabell/to RPC-er, permanent eksisterende React/PostgreSQL-QA og Hjelp/docs. Ingen eksisterende SQL-funksjon, tilgangskjerne, medlemskap, Sales, main/navigation, sykefraværseditor, autosave/recovery eller prosjektflyt endres. Kvitteringer følger samtalens eksisterende FK-sletting. Ved gjenoppretting uten kvitteringer blir innspillet ulest igjen; gammel kvittering kan aldri skjule nyere innspill. Full databasebackup inkluderer tabellen; eksisterende innholdseksport gjenbrukes uten kvitteringer.

QA før Production: faktisk React 92, PostgreSQL 245, eksisterende samtale-React 88 og sykefravær-React 48 PASS. Session/PDF 127 og sykefravær/mail 175 PASS. Min side/kontakt og module-navigation runtime PASS. Full critical/build Production og Sandbox PASS. Sandbox-migrasjon installert; begge funksjonskropper lest tilbake byteeksakte. Eksisterende HR-funksjoner samlet fingerprint `3496d74f97d72414dc7c318cdd223a3a`, policies `1cb764eb0dc8d86c5f051d4aa1f69915`, ikke-interne triggere `7362fa67a5dcd2a0eaa041e76710e1a6` uendret før/etter. Sandbox-mail fortsatt AV, runtime uendret. Rolletest rullet tilbake: manglende aktør og direkte tabelllesing avvist. Ny tabell har RLS, ingen direkte klient-/servicegrants, null kvitteringer etter QA. Advisor-differanse bare forventet én lukket RLS-tabell og to autentiserte, tilgangskontrollerte definer-RPC-er. Ingen virkelig medarbeiderwrite/utsending. Avgrenset TEST OK er mottatt; eldre godkjenninger beholdes.

PR #233: feature-kode `9a089c241ef336919a8207d9caa6dc12b0c3664b`, Core Safety `38207713606` / jobb `114674792407`, alle steg SUCCESS. Fast Preview `dpl_7ULrKS9LLF3KFBzSGqXyhVYhsitC` READY, HTTP200 og 30 berørte JS/CSS-filer byteeksakte mot vanlig Sandbox-build. Innlogget prøve er ikke attestert; Sandbox har ingen delte aktive innspill. Ingen ekstra gammel brukerprøve kreves. Endelig Production/main → demo-bevis føres i release-PR. Ingen faktisk medarbeidermail, konto-/leder-/tilgangsendring eller sletting brukes som QA. Ingen ny manuell prøve av gamle godkjente funksjoner kreves.

## HR-kontroll nær fristen og ryddige HR-e-poster – 12. oktober 2026

Miljømål **BEGGE**. Kenneth oppdaget at Kontroll av HR-oppsett og tilgang med frist 11.10.2027 allerede lå som varsel 12.10.2026. Det nye varselkortet filtrerer nå denne administrative kontrollen til 30 kalenderdager før fristen, på fristen og etter fristpassering. Invitasjoner vises straks, og andre åpne arbeidsplaner/tiltak beholdes slik at arbeidet kan starte i tide. Kontrollfristen kan fortsatt leses i HR-oppsettet/registerets fullstendige fristliste. E-postregelen er uendret.

Avgrenset retting av #231: visningsfilter, permanent QA, Hjelp/docs og generisk HTML-layout i eksisterende HR-mailworker. Ingen endring i SQL/RLS, firmatilgang, leder, kø/reservasjon/validering/dispatchregel eller beskyttet autentisering. Brukerens direkte Production-bestilling for varselkortet gjelder også denne feilrettingen. Ny faktisk React 65 assertions dekker den rapporterte årsfristen, 31/30-dagersgrense, fristdag, passert frist og Oslo-DST, samt tidligere invitasjon/direkte editor/kladd/paginering/tilgang. Ready CI/Preview/Production/Demo-bevis føres i release-PR.

Leder-e-post er allerede aktivert i Production: medarbeiderens Klar til samtale/deling og faktisk endring i egen delt kommentar køer generisk nytt innspill til registrert nærmeste leder. Lagring av privat forberedelseskladd sender ikke varsel. Dette nye frontendkortet har fortsatt ikke et separat ledervarsel om delte svar. Kenneths skjermbilde kl.01:16 bekrefter faktisk mottak av nytt innspill i lederens innboks, med ren tekst og lang omskrevet lenke. Feedback-, lederpåminnelse- og generiske fristmailer har nå samme mørke/turkise ProffDok-profil med tekstlogo, inline tabeller, tydelig appknapp og tekstalternativ. Firmalogoen i invitasjonen er uendret. Generiske varsler får ingen firmanavn, personnavn, svar, kommentarer, diagnose eller saksidentitet. Varsel-/køregler og målrettet testmodus er uendret. Ny mail-runtime QA 175 assertions PASS; ny faktisk innboksvisning av HTML eller en ny testmail er ikke attestert/sendt av utvikleren.

## Synlige HR-varsler og direkte åpning – 12. oktober 2026

Miljømål **BEGGE**. Kenneth ba kl.00:54 Europe/Oslo uttrykkelig om direkte Production-leveranse. Dine varsler og oppfølginger vises øverst på Startsiden og Min side i aktivt firma. Invitasjonen viser dato, klokkeslett, sted og om forberedelsen er delt. Åpne samtalen/Åpne oppfølgingen åpner riktig privat sak i dialog, med eksisterende redigering, lagring, kalender, PDF og historikk. Lederens eksisterende åpne tiltak og sykefraværsfrister bruker samme inngang. Kontroll av HR-oppsett åpnes fra eget varsel. Ingen oppgave oppdiktes når listen er tom. «Kommer» og «ikke åpnet ennå» er rettet til aktuell funksjon.

Avgrenset frontend: én Startside-render i main, Min side, nytt varselkort/minimal lesetransport og initialt saksvalg i de to HR-editorene. Dagens hr_followup_tasks og dobbel fersk medarbeider-/sakslesing gjenbrukes. Ingen SQL/RLS/grants/membership/e-post/worker/cron-endring. Ingen private svar, navn eller journalinnhold legges i varselkortet, URL eller nettleserlager. Kun de første seks invitasjonene per side får møtefelter hentet; øvrige viser oppgavefrist og kan åpnes direkte. Paginerte oppgaver kontrolleres mot samme servermarkør før åpning.

Snarveien autoriserer på nytt og nekter foreldet/ferdig oppgave. Min side beholder konto- og e-postkladd. Samme saks private RAM-kladd og valgte steg beholdes ved fokus/ny autorisasjon. En annen sak bytter ikke automatisk over en ulagret kladd; eksplisitt bytte bruker eksisterende avbryt/bekreftelse. Feil firma/aktør, tilbakekalt tilgang, skjult side og sene svar kan ikke vise gammelt innhold. Eksplisitt lukking respekteres.

QA: faktisk nytt varselkort/direkte editor/Min side React 56 assertions PASS, eksisterende Min side/kontakt og modulnavigasjon PASS, medarbeidersamtale React 88 og sykefravær React 48 PASS. Ny permanent test kjøres i PR Core Safety. Hjelp/README/architecture oppdatert; publisert SHA/CI/assetkontroll og main → demo-preflight føres i release-PR. Faktisk Outlook/innboks eller ny innlogget nettleserprøve attesteres ikke. Brukeren ba om direkte Production uten ny TEST OK-runde.

## Sted og firmaprofil i medarbeidersamtale-invitasjon – 12. oktober 2026

Miljømål BEGGE. Kenneth bestilte sted i invitasjonen kl.00:01:32 og sa uttrykkelig «gjør det rett i produksjon» kl.00:01:51 Europe/Oslo. Tillegg kl.00:05 om samme logo/profil som tilbudsmailene inngår i samme avgrensede leveranse. Direkte Production etter grønn QA/CI/sourcekontroll; ingen ny TEST OK eller faktisk medarbeidermail attesteres.

Nye samtaler krever Sted (møterom eller adresse, én linje, maks 200 tegn). Nærmeste leder endrer lagret dato/klokkeslett/sted under Endre tidspunkt og sted. Eksisterende samtaler kan fortsatt åpnes; manglende sted må legges til før invitasjon. Sted følger samme lagrede utgave til e-post, Outlook, .ics LOCATION og samtalens PDF. Historikk viser faktisk tidligere sted eller Ikke avtalt. Gamle start-/tidspunkt-RPC-er beholdes og overskriver ikke eksisterende sted.

Invitasjonen har firmaets lagrede logo/profil, samme mørke/turkise profil som tilbudsmail, datoboks og knapp til den generelle appadressen. Firmaprofil hentes fra samtalens firmascope på serveren. HTML bruker e-posttabeller/inline-stil, escaped tekst og HTTPS-logo eller appens standardlogo. Tekstalternativ følger med. Svar, kommentarer, personnavn og samtale-ID følger ikke e-post eller ekstern kalender-URL; møtested og firmaprofil følger uttrykkelig brukerbestilling.

Invitasjoner identifiseres etter lagret dato, klokkeslett og sted i eksisterende private, cascade-slettede artefaktsnapshot/outbox. Stedendring lager ingen e-post av seg selv. Leder sender den nye avtalen uttrykkelig. Gjentatte klikk gjenbruker samme jobb/provider-idempotency; tidligere sendt samme dato/tid/sted beholdes. Foreldet sted stopper kø/reservert jobb før provider-kall. Bare allerede undertrykt, aldri sendt invitasjon kan få ny jobb ved retur til tidligere sted. Sendetilgang, fersk mottaker, lease/backoff og opprinnelige forberedelses-/rolle-/CAS-/bekreftelseskrav beholdes. Nytt bucketområde isolerer invitasjon fra frist, lederpåminnelse, innspill og målrettet test.

Scope: samtale/session/kalender/PDF, eksisterende mailworker + ny formatter, én additiv funksjonsmigrasjon, HR-checks og Hjelp/docs. 7 nye funksjoner og 5 eksisterende invitasjonsfunksjoner endres. Ingen tabell, RLS, trigger, token, cron, firmatilgang eller annen modul endres. Lokal PostgreSQL 206, faktisk React 88, session/kalender/PDF 127 og sykefravær/mail 151 assertions PASS; full critical/build BEGGE PASS. Backup-test utvidet fra én til tre syntetiske saker med samme kontroll av gammel backup/purge. Eksakt Sandbox/Production-kilde/fingerprint/CI/READY og main → Demo føres i PR. Skyens store rollback-harness traff MCP «Invalid or expired requestState» to ganger; den attesteres ikke. Ikke-muterte funksjons-/privilegiekontroller og fingerprints brukes i tillegg til faktisk lokal PostgreSQL. Ingen virkelig samtale, tilgang eller mottaker er endret/sendttestet.

## KS/HMS og HR i flere arbeidsfirma – 11. oktober 2026

Miljømål BEGGE. Kenneth fant ikke Camilla eller HR-valget i Firmaadmin. Read-only Production-metadata bekrefter at profilen hennes ligger under Bademiljø Expo, med medlemskap i alle tre firmaer; samtalen ligger i Ringside. Kenneth er systemadmin. Den gamle Firmaadmin-listen henter profiler etter primærfirmanavn, og systemadmins tidligere KS/HMS-/HR-kort brukte bare primærfirmaets scope. Derfor kunne ikke individuell HR-tilgang i ekstra arbeidsfirma velges fra kortet. Ingen virkelig konto eller tilgang er endret.

Avgrenset separat retting: ny PeopleWorkspaceModuleAccess-wrapper og systemadmins eksisterende kortintegrasjon, relevante React-checks/CI, Hjelp og release-dokumentasjon. Wrapperen bruker eksisterende list_managed_work_profiles og PeopleModuleAccess/RPC/CAS. Ingen backend, migrasjon, arbeidsprofilendring, øvrige tilgangskontroller eller kalenderendring i denne PR-en. Systemadmin velger Firma for KS/HMS og HR blant brukerens faktiske medlemskap. KS/HMS-rolle og eksisterende tilgang i valgt firma beholdes ved HR-lagring. Firmaadmins arvede tilgang vises uten individuell lagreknapp. Andre tilganger på kortet beholder primærfirmaets scope. Ulagrede modulvalg krever uttrykkelig forkasting før firmabytte; pågående lagring sperrer bytte. Fersk metadata og sent svar etter unmount/tilgangsendring håndteres uten å gjenåpne gammel UI.

QA: faktisk wrapper + eksisterende PeopleModuleAccess React med syntetisk transport, eksisterende full People/Help-React og critical People-check PASS. CI inkluderer nå disse permanente kontrollene. Ingen faktisk Camilla-grant eller e-post sendes av utvikleren. Sandbox har ingen identisk Camilla/flerfirma-fixture; innlogget tilgangsvalg for det virkelige tilfellet er ikke attestert. Ny avgrenset tilgangs-UX krever TEST OK før Production; tidligere mail-/kalendergodkjenning brukes ikke som godkjenning av denne separate rettingen. Eksakt grønn CI/Preview/source føres i PR.

## Outlook / Office 365 og tydelig invitasjonsstatus – 11. oktober 2026

Miljømål BEGGE. Kenneth ba kl.23:18 om å oppdatere kalenderknappen i den aktive Production-leveransen. **Åpne i Outlook / Office 365** åpner en ny avtale i Outlook på nettet med fersk lagret dato, norsk klokkeslett og valgt varighet. Brukeren kontrollerer jobbkonto og kalender og lagrer i Outlook. Ingen kalenderkonto kobles til, og appen bekrefter ikke lagring i Outlook. **Last ned kalenderfil (.ics)** beholdes med konkret veiledning for Kalender → Legg til kalender → Last opp fra fil → velg kalender → Importer. Tidspunktendringer må oppdateres av brukeren. Gjentatt åpning kan lage en ny Outlook-avtale.

Begge kalenderformater bruker samme validering og Oslo → UTC-konvertering. To ferske autoriserte samtalelesinger og revisjonskontroll før eksport beholdes. Gjeldende medarbeider/leder kontrolleres på nytt før begge kalenderformater. Nytt vindu åpnes synkront på brukerklikk; opener fjernes straks, og et tomt vindu lukkes ved feil eller foreldet svar. Bare generell møtetittel, dato/tid/varighet og generell applenke sendes til Outlook. Ingen medarbeider, firma, samtale-ID, svar, referat eller kommentar følger nettadressen.

Camillas manglende sendeknapp skyldtes avslått individuell HR-modultilgang; aktiv brukerkonto og valgt nærmeste leder var korrekte. Det er kun lest tilgangsmetadata. Ingen virkelig tilgang, samtale eller e-post er endret/sendttestet i denne runden. UI forklarer nå riktig adminmeny og firmascope når forberedelsesoppgaven mangler, og sier ikke lenger at brukeren skal trykke på en skjult knapp. Sendebetingelser og eksisterende tilgangskontroll beholdes.

Avgrenset scope: samtale-React/CSS, kalenderformatter, Hjelp og relevant runtime/React/docs. Ingen backend, migrasjon, RLS, kontoendring eller annen modul. Tidligere TEST OK og Kenneths bekreftede test-e-post kl.23:11 beholdes. Faktisk innlogget Outlook-lagring/kalendervalg må bekreftes av bruker. QA: faktisk React 83 og samtale/session/kalender/PDF/mail 113 assertions PASS, full critical/build PASS. Eksakt QA/CI/Preview/Production/main → demo-bevis føres i PR.

## Lederpåminnelse, kalender og medarbeiderinnspill – 11. oktober 2026

Kenneths Production-instruksjon kl.22:24 gjelder aktiv leveranse; tillegg kl.22:35–22:36 om egen lederpåminnelse, kalender for begge og e-post ved medarbeiderkommentar er innarbeidet. Invitasjonsknappen fra #226 er allerede publisert. Disse tilleggene får egen avgrenset PR, grønn critical QA/CI og Production-verifisering; ingen innlogget Preview-mailprøve eller mottatt e-post attesteres.

Nærmeste leder velger **Send meg e-postpåminnelse dagen før** i den gjeldende samtalen. Valget lagres straks på serveren, krever gjeldende leder, fersk medarbeider-/samtalerevisjon og et fremtidig gyldig norsk tidspunkt. Det gjelder bare den lederen som valgte det. Utsending skjer 24 timer før, eller snarest før møtet ved senere valg. Avslått valg, leder-/tilgangsbytte, endret tid, ferdig referat eller sletting stopper ventende utsending. Samme avtale varsles én gang. Privat outbox, token og cron gjenbrukes; ingen nye tabeller/innstillinger.

Begge parter har **Varighet i kalenderen** og **Legg til i kalender**. Kalenderfil (.ics) bruker dobbel fersk autorisert serverlesing, lagret tidspunkt i Europe/Oslo konvertert til UTC, stabil samtale-UID og valgt varighet (standard 60 minutter). Bruker åpner filen og bekrefter avtalen i egen kalender. Ved endret tidspunkt må kalenderavtalen oppdateres av bruker. Ingen kalenderkonto tilkobles eller automatisk kalenderbooking. Filen inneholder generell møtetittel og applenke, ingen private innspill/personnavn/firma. Sommer-/vintertid, første gjentatte høstklokkeslett, ugyldig vårklokkeslett, dato, varighet, CRLF/UTF-8-linjebryting og sen tilgangsendring er testet. RFC 5545 brukes for formatet.

Når medarbeideren deler forberedelsen eller lagrer en endret egen kommentar til referatet, får gjeldende HR-leder en generell e-post når transport er aktivert. Private ikke delte forberedelser og lederens egne kommentarer varsler ikke. Nyere usendt innspill erstatter behovet for et eldre usendt varsel. Kommentar/svar leses i appen; ingen tekst/personnavn/firma/diagnose tas med i e-posten. Fersk mottaker, HR-rettighet, aktivt arbeidsforhold, lease og idempotency kontrolleres før provider-kall. Sandbox-mail forblir AV.

Scope: HrConversations/session/CSS, ny kalenderformatter, avgrenset utvidelse av eksisterende HR-mailworker, én migrasjon og HR-QA/Hjelp/docs. To eksisterende funksjoner endres: samtalekommandoens etterlagringsvarsel og eksisterende cron-invoker. Åtte funksjoner legges til; møte-/kommentarinnhold, originale CAS/rolle-/delings-/bekreftelses-/slettekrav og gammel fristworker beholdes. Påminnelsesvalget endrer ingen innholdsbetinget bekreftelse. Ingen meny/Sales/konto/firmaendring.

QA: PostgreSQL 161, faktisk React 63, samtale/session/kalender/PDF/mail 100 og sykefravær/session/PDF/mail 114 assertions PASS. Full critical/build PASS. Faktisk Sandbox rollback-QA 22 PASS, uten network/provider-dispatch. Production får samme kilde-/rollback-/fingerprintkontroll før merge. Eksakt CI/READY/SHA og main → demo-preflight føres i PR. Faktisk mottak i innboks og kalenderimport i brukerens kalender må bekreftes av bruker; ingen virkelig testmail sendes av utvikleren. Tidligere TEST OK beholdes.

## Produksjonspublisering uttrykkelig godkjent – 11. oktober 2026 kl. 22:24 Europe/Oslo

Kenneth: «får ikke testet epost på preview så send det til produksjon». Dette er eksplisitt autorisasjon til Production uten ny innlogget Preview-e-postprøve og overstyrer tidligere prøvekrav for denne invitasjonsendringen. Ingen faktisk invitasjon sendes av utvikleren: bruker klikker Send e-postinvitasjon på sin lagrede samtale når publiseringen er verifisert. Critical QA/CI, Production-migrasjon/worker, publiserte assets og kontrollert main → demo gjennomføres før oppgaven regnes som publisert. Faktisk mottak i innboks bekreftes bare av bruker.

## Bekreftelse og manuell e-postinvitasjon – 11. oktober 2026

Miljømål BEGGE; ny kort Preview-prøve kreves før Production og main → demo. Tidligere TEST OK for klokkeslett/HR/kart beholdes. Etter Opprett samtale lukkes og tømmes opprettingsskjemaet, og Samtalen er opprettet får fokus med lagret dato/klokkeslett og separat app-/e-poststatus. Mistet opprettingssvar gjenbruker samme samtale-ID, også ved intern remount. Samtalen slettes ikke ved feil i e-poststatus.

Nærmeste leder bruker **Send e-postinvitasjon** på en lagret samtale i forberedelse, også en tidligere opprettet samtale. Opprettelse alene sender ingen invitasjon. Medarbeideren får en åpen forberedelsesoppgave på Min side. Invitasjonen har faktisk dato/klokkeslett i norsk tid og forklarer hvordan medarbeideren åpner og deler forberedelsen. Ingen svar, personnavn, firmanavn eller diagnose følger e-posten. Ingen kalenderbooking. Eldre samtale må ha klokkeslett før sending. Gjentatte klikk for samme medarbeider/samtale/dato/klokkeslett bruker samme private leveringsrad og provider-idempotency. Nytt tidspunkt får separat invitasjon; endret tidspunkt/tilgang eller delt forberedelse stopper gammel ventende utsending.

Status skiller disabled/not_queued/pending/sending/sent/failed/suppressed. «Sendt» er provider-aksept lagret på serveren, ikke attestert mottak i innboksen. Sandbox-mail forblir deaktivert; der vises knappen og tydelig avslått-status. Ingen ekte samtale eller virkelig mottaker er endret/sendttestet.

Scope: HrConversations, samtale-session/CSS, HR-forberedelsesoppgave, eksisterende hr-followup-reminders-transport, Hjelp, én additiv migrasjon og relevante QA/docs. Ingen nye tabeller/tokens/cron, ingen andre moduler, navigasjon, kontoer eller firmatilganger. Tre eksisterende HR-funksjoner endres og seks tilgangskontrollerte funksjoner legges til. Fristworker beholder kontortid; eksplisitt invitasjon kan sendes når leder klikker. Ingen Production-endring før relevant TEST OK.

QA: 136 PostgreSQL-assertions, 55 faktiske React-assertions, 81 samtale/session/PDF/slettemail og 94 sykefravær/session/PDF/frist-/invitasjonmail PASS. Eksisterende sykefravær SQL 83 PASS. Faktisk Sandbox rollback-prøve: 31 assertions PASS, uten network/provider-dispatch. Alle ni funksjonskilder matcher migrasjonen. Øvrige funksjoner, policies, triggere, tabeller, profiler, medlemskap, modulrettigheter og beskyttede worker-innstillinger er uendret før/etter. Bare to forventede advisor-notiser for eksplisitt autoriserte authenticated-definer-RPC-er legges til; performance-notiser uendret. Register/Min side og full critical/build verifiseres før publisering. Innlogget brukerprøve, faktisk Production-utsending og mottak i innboks attesteres ikke av disse testene.

Kort brukerprøve på fast Preview: Åpne lagret samtale som nærmeste leder → Send e-postinvitasjon. I Sandbox skal utsending være tydelig avslått. Ved ny samtale skal opprettingsskjemaet lukkes og Samtalen er opprettet vises med tidspunkt. Eksakt CI/READY/SHA og status føres i PR.

## Klokkeslett publisert – godkjent TEST OK 11. oktober 2026

Kenneth TEST OK kl. 21:39 Europe/Oslo godkjenner klokkeslett i medarbeidersamtaler. Feature `03bec590f3bd0396c63fc6b347e33c3428d13a04` er merget i #224 som `eaeb06d475d3134869505c4f12ea56f96c855f2f`. Ready-for-review Core Safety run `38168965204`, job `114557343986`: alle steg SUCCESS. Production `dpl_Aa7RUMwwmsgwuA9HitLEyeidnpWx` READY på https://expo-proffdok.app. Ingen ny innlogget Production-prøve attesteres; Kenneths Preview-prøve og live backend-/assetkontroller er separate bevis.

Nye samtaler krever Klokkeslett i norsk tid; nærmeste leder kan endre dato/tid i forberedelse/felles møte. Tidspunktet vises for begge parter og i PDF. Eldre samtaler har ingen oppdiktet tid. Hjelp er oppdatert. Ingen kalender-/e-postinvitasjon innføres.

Migrasjon `hr_conversation_meeting_time` er installert i Sandbox og Production. 21 faktiske rollback-assertions PASS i hvert miljø; alle tre funksjonskilder matcher eksakt. Bare listekroppen er endret og start_at/schedule lagt til. Øvrige funksjoner, profiler, medlemskap, policies, triggere, modulrettigheter og beskyttede worker-innstillinger er identiske før/etter. QA: PostgreSQL 100, React 44, session/PDF/mail 73, sykefravær 68 samt register/Min side og full critical/build PASS. Fersk PDF visuelt kontrollert. Kontrollert main → demo-synk, gjeldende main-baseline og 24 faktiske Sandbox-preflightpunkter føres i PR #224 etter ferdig publisering. Tidligere TEST OK beholdes.

## Godkjent Production-release #222 – 11. oktober 2026

Kenneths «flott test ok» kl. 20:49 Europe/Oslo godkjenner også logo og midtstilt, tilpasset PDF-tekst. Tidligere TEST OK for HR, firmanavn, felles kart og linjer/lederplassering beholdes. Eldre «venter», «draft» og prøvekrav nedenfor er daterte arbeidsnotater.

Godkjent feature `2d0ae997797f3f737e30778c2d6d4910ff3bedf9` er merget som `e466c5603f745081d00a8964e752bb4f6f76b36b`. Production `dpl_5uuswoKpL4NYvVkMH94Hjrq2eALT` er READY på https://expo-proffdok.app. Obligatorisk Core Safety etter ready-for-review: run `38166319985`, job `114549510315`, alle steg SUCCESS. Ingen ny innlogget Production-prøve attesteres; Kenneths Preview-prøve og utviklernes backend-/assetkontroller er separate bevis.

Alle seks godkjente migrasjoner er installert i Production: sykefraværssaker, fristvarsler, referanseindeks, worker-scope, firmavisningsnavn og felleskart/rekkefølge. 22 + 12 + 36 faktiske rollback-prøver PASS. Alle 23 funksjonskropper matcher godkjent SQL. Bare åtte avtalte eksisterende org-funksjoner er endret; 15 funksjoner og tre private RLS-tabeller er lagt til. Eksisterende policies, triggere, medlemskap, profiler, modulrettigheter og andre worker-innstillinger er uendret. Nye advisor-notiser gjelder tilsiktede private RLS-tabeller uten direkte klienttilgang, tilgangskontrollerte definer-RPC-er og to nye foreløpig ubrukte indekser; ingen nye manglende FK-indekser.

HR-fristworker `hr-followup-reminders` v1 er ACTIVE og aktivert med egen Vault-autentisering og minutt-cron. Utsending skjer i Oslo-kontortid, tre dager før, på frist og ukentlig etterpå for aktuelle åpne oppgaver; endret ansvar/tilgang kontrolleres på nytt. Anonym GET=405/POST=403. Serverautentisert tom-kø-prøve ga 200 `{idle:true}`, uten testmail eller providerkall. Dette er ikke bevis på mottatt fristmail. Tidligere mottatt slettevarsel skal ikke gjentas.

Kenneth, Tom og Kim har hver firmaadmin i de tre avtalte firmaene, med eksisterende kontoer og primærfirma beholdt. KS/HMS er aktivert i Expo Proffsenter. Ingen ny registrering eller invitasjon. Faktiske firmavisningsnavn og organisasjonskart bygges av brukeren i Production; utvikleren har ikke skrevet et virkelig personal-/kartoppsett.

Miljømål BEGGE. Permanent demo synkroniseres kontrollert kun main → demo, med egen Sandbox og bevart overlegg. Kurs-/preflight- og endelig demo-publisering dokumenteres separat på demo-branch og i PR #222. Ingen demoressurs eller syntetisk identitet skal tilbake til main.

## Midtstilt og tilpasset PDF-tekst – 11. oktober 2026

Miljømål **BEGGE**, først samme feature/Preview. Nytt kosmetisk tillegg gjelder organisasjonskartets PDF: firma-/avdelingskort, avdelingsoverskrifter, ledertekst og alle medarbeiderkort har midtstilt tekst. Navn/avdeling bruker inntil 18–20 pt, medarbeidernavn inntil 15 pt og tilhørende tekst inntil 12 pt. Brede/korte tekster vokser til feltets maks; lange tekster reduseres til en lesbar minste størrelse og brytes deretter fullstendig. Kort-/rad-/nivåhøyde beregnes fra faktisk tekst og skriftstørrelse. Rapporteringens eksisterende innrykk beholdes, med tekst sentrert i sitt kort. Logo og ferske profil-/kart-/tilgangskontroller beholdes.

Den gamle PDF-posisjonsprøven forventet tekst på kortets venstrekant +6 mm. Ny forventning er den uendrede midtkortaksen x=210 mm med align=center. Ordens-/linje-/tilgangs-/logoassertions beholdes. Nye faktiske jsPDF-prøver kontrollerer større korte navn, mindre lange navn, full tekstbryting, sentrum/bredde/høyde mot tegnede kort og bevaring av alle medarbeidere/dype grener. Ny brukerprøve er kun **Last ned PDF** og tekst/logo; tidligere godkjente HR-/kart-/tilgangsprøver skal ikke gjentas. Preview/CI-bevis og eksakt SHA føres i PR #222. Ingen ny backendendring. Production/main/demo venter på relevant TEST OK etter AGENTS.md punkt 10.

Faktisk jsPDF med små/store og dype kart PASS: tekstens senter og mål er kontrollert mot faktiske tegnede kort, alle navn/grener beholdes, og flersidige dokumenter beholder logo. Nye PDF-sider med kart, medarbeiderkolonner og smale/dype grener er visuelt kontrollert. Faktisk kart-React, permanente eksisterende guards og full Sandbox critical/build PASS. Dette er utviklerprøver med syntetisk innhold; innlogget ny eksport venter på brukerens korte Preview-prøve.


## Firmalogo i organisasjonskartets PDF – 11. oktober 2026

Miljømål **BEGGE**, først samme feature/Preview. Kenneths siste **TEST OK** gjelder linjer og lederplassering og beholdes. Nytt tillegg: **Last ned PDF** bruker eksisterende `work_profile_company_profile` for aktivt firma, også ved felleskart. Logoen gjentas i et hvitt felt øverst på hver A3-side med bevarte proporsjoner. Kartets toppnavn beholdes. Ingen nytt logo-register eller backendendring.

Profilens firma og logo kontrolleres på nytt, og kart-/tilgangskontrollen etter lasting beholdes. Endret logo/firma, navigasjon eller tilbakekalt karttilgang stopper levering. En utilgjengelig logo gir lesbar PDF og en tydelig melding om at logoen mangler. Hjelp beskriver samme kontrakt uten kundespesifikke navn. Ny brukerprøve gjelder bare **Last ned PDF** og logoen; tidligere HR-, kart- og tilgangsprøver skal ikke gjentas. Release av dette nye tillegget venter på relevant Preview-prøve etter AGENTS.md punkt 10.

Faktisk jsPDF med eksisterende Ringside-PNG: logo på alle sider, proporsjoner og headergrenser PASS; ferske PDF-sider er visuelt kontrollert. Endret/fremmed/offline firmaprofil, navigasjon, tilbakekalt tilgang og manglende logo er prøvd. Faktisk kart-React, permanent kart-critical og full Sandbox critical/build PASS. Dette er utviklerprøver med syntetisk kart, ikke en attestasjon av innlogget nedlasting. CI/READY og eksakt publisert SHA føres i PR #222.


## Organisasjonskart – renere forbindelser og sentrerte ledere (11.10.2026)

Skjermkartets forbindelser går bare mellom kortenes midtakser: én gren får en rett stamme, og tverrlinjer stopper ved ytterste gren. Linjene er 3 px; PDF bruker 0,65 mm. Leder og mellomleder har sentrerte navn/stillinger uten dybdeinnrykk. Vanlige medarbeideres innrykk og all lagrings-/tilgangslogikk beholdes. Faktisk React, jsPDF og full Sandbox critical/build PASS; Preview-visning kreves for dette kosmetiske tillegget. Tidligere TEST OK skal ikke gjentas. Se [omfang og QA](../kshms/ORGANIZATION_SHARED_20261011.md).

## TEST OK og generell veiledning – 11. oktober 2026 kl. 19:42 Europe/Oslo

Miljømål **BEGGE**. Kenneth har gitt **TEST OK** også for felles lesetilgang og sentrert kart. Tidligere HR/navn/kart-prøver er godkjent og skal ikke gjentas. Spørsmålet om hvem som ser eksemplene avdekket at Ringside-navn var lagt inn i felles veiledning og organisasjonskapittelet i Hjelp uten firmabegrensning. Disse eksemplene er erstattet med generelle navn/nivåer og venstre/midt/høyre. Hjelps oppdateringsdato er satt til 11.10.2026. Ingen kartnavn, avdelingsnavn, firmadata, tilgang eller lagringsflyt endres.

Rettelsen er tekst/placeholder og har ingen ny obligatorisk brukerprøve. Eksisterende faktisk React-kontroll krever nå generisk veiledning og fravær av andre firmas eksempler på et urelatert firmakart; alle eksisterende dataplasserings-/rettighetsprøver beholdes. Brukerens egne kartnavn vises fortsatt fra den autoriserte kartresponsen. Øvrige Hjelp-kapitlers omtale av leverandør/vareregister/produktmerke er utenfor denne kartrettelsen.

## Felles kart og sentrerte grener – 11. oktober 2026

Miljømål **BEGGE**, feature/Preview + Sandbox. Kenneths **TEST OK** på HR, firmavisningsnavn og forrige kartleveranse er registrert og beholdes. Nytt scope gjelder bare kartets felles lesetilgang og plassering.

Ett kart opprettes for de tilknyttede firmaene. **Vis hele kartet for brukere i hvert tilknyttet firma** åpner hele kartet for aktive brukere med KS/HMS i ett tilknyttet firma. Dette er uttrykkelig opt-in: eksisterende kart har uendret begrenset visning. Redigering/opprettelse krever fortsatt firmaadmin og KS/HMS i alle firmaene. Én tilgjengelig delt organisasjon åpnes automatisk; et bevisst valg av firmakart huskes. Ingen HR- eller medlemskapsrettigheter endres.

**Rekkefølge fra venstre** lagres på kortene: Expo Proffsenter 1, Ringside Rørleggerbedrift 2, Bademiljø Expo 3. Alle tre legges under Styret. Like brede grenfelt sentrerer det midterste kortet under Styret/Ringside AS. PDF bruker samme rekkefølge. Hjelp forklarer både oppsett og tilgang.

QA: 36 nye faktiske Sandbox-rollback-assertions PASS, også med én firmatilgang i hvert av de tre firmaene. 340 eksisterende funksjoner uendret; bare de åtte godkjente org-funksjonene endret. Ingen nye security-advisor-funn. Lokal PostgreSQL: 63 + 33 + 64 eksisterende og 36 nye PASS. Faktisk React, faktisk PDF-drawing/fersk tilgang og full Sandbox critical/build PASS. Nettleserinnlogging til flerfirmaflyt er ikke attestert. Ingen aktive kart, Production-innstillinger eller ekte medarbeiderdata er endret.

Fast Preview: https://expo-proffdok-git-fase45c-hr-sickleave-20261011-ringside.vercel.app/?progressTest=safe . Bare ny kartprøve: **Rediger kart → Vis hele kartet … → Lagre kart**, og rekkefølge 1/2/3 via **Rediger / flytt → Bruk endring → Lagre kart**. Kontroller samme felleskart med en konto som har bare ett tilknyttet firma. Tidligere HR/navn/mail-prøver gjentas ikke. [Kontrakt og QA](../kshms/ORGANIZATION_SHARED_20261011.md).

## Gjeldende HR-status og ny sykefraværsoppfølging – 11. oktober 2026

Eksisterende private kontaktopplysninger, medarbeidersamtaler og slettevarsler er godkjent og åpnet i Production fra main `61a42e6c7d996a6abc6c5146de45e3759e682b4d`. Kenneth har bekreftet faktisk mottatt slettevarselmail med receipt `544cd046-7e92-4ea0-a10c-6a6940bb67ec`. Disse testene skal ikke kreves på nytt som brukerprøve.

Ny funksjon har miljømål **BEGGE** og egen feature/Preview fra denne main: personlig sykefraværsoppfølging, felles plan/tiltak, kalenderfrister, dokumenterte vurderinger, egne bekreftelser, faktisk delingsjournal, avslutning og PDF. Nærmeste leder får påminnelser om frister og medarbeiderens åpne tiltak. Samme HR-arbeider dekker avtalte frister i vanlige medarbeidersamtaler og firmaadmins HR-kontrollfrist. Utsending er avslått i Preview; produksjonsaktivering følger ny relevant `TEST OK`. [Kontrakt, QA, kilder og release](../kshms/HR_SICK_LEAVE_CASES_20261011.md).

De tidligere kapitlene nedenfor er historiske fasebeskrivelser. Formuleringer om stengt HR-port eller fremtidige samtaler gjelder ikke gjeldende Production-status. Ny sykefraværsfunksjon er foreløpig ikke releaset til Production. Eksisterende KS/HMS-varsling er aktiv i Production; dette er ikke en attestasjon av alle øvrige frister i appen.

## HR: serverlagrede medarbeidersamtaler og slettevarsler – 11. oktober 2026

Miljømål **BEGGE**. Ny produksjonsfunksjon fra ren main, foreløpig feature/Preview: nærmeste leder starter en samtale på en registrert medarbeider; medarbeiderens private forberedelse deles uttrykkelig, felles referat/tiltak versjoneres, hver part kommenterer og bekrefter selv. Samtalen ligger i medarbeider-popupen og beholdes ved fanebytte og PDF. Alle snapshots inngår i eksisterende private purge-/restore-domene. Systemadmin får en minimal driftsmelding uten tilgang til samtaletekst. Ingen ny betalt testressurs. [Scope, QA og manuell gjenopprettingsrutine](../kshms/HR_CONVERSATIONS_20261011.md).

Migrasjonene åpner ingen innholds- eller e-postport. Ekte opplysninger er produksjonsmålet; dette er ikke en pilotbegrensning. Eksisterende Sandbox er åpnet for Preview etter grønn QA. Production er fortsatt stengt før TEST OK, konkret driftsoppsett og kontrollert release. Tidligere kapitler nedenfor beskriver tidligere leveranser og kan omtale samtaler som fremtidig arbeid.

## HR: sykefraværsoppsett – 10. oktober 2026

## Scoped navigasjon i KS/HMS og HR – 11. oktober 2026

`moduleNavigationMemory.mjs` gir avgrenset per-side minne for tillatte skjerm-ID-er og HR-medarbeider-ID-er, bundet til firma, aktør og audience. Høyest åtte pekere per modul; ingen payload, myndighet eller browserlagring. Eksisterende tilgangshooks er uendret, og HR gjenåpner bare etter fersk liste og dobbel lesing. Personlig HR beholder sitt foreldrestyrte valg. Dokumentuttrekk holdes skjult ved internt fanebytte; aktiv-status og operasjonsgenerasjon stanser gamle eksport-/listesvar. Rolle-, firma- og aktørendring bruker eksisterende sperrer og nullstilling. Full appreload, globale ruter, Sales, databaser og privat HR-innhold er utenfor scope. [Detaljert kontrakt og QA](../kshms/NAVIGATION_RECOVERY_20261011.md).

Lagrede prøvesamtaler vises nå som en tydelig blå boks med ramme, større klikkflate og synlig tastaturfokus. Åpning og historikk er uendret.

HR-menyen har nå egne snarveier til Samtalemaler og Sykefravær. Generell sykefraværsmal bruker eksisterende private malregister/RPC, versjoner, CAS og firmaadmin-gater. Additiv validator-migration tillater `sickleave`; ingen personlig innholdsport eller privilegier åpnes. Kildebasert veiledning og et datoregneksempel uten lagring/påminnelser. BEGGE, foreløpig bare feature/Preview/Sandbox. [Scope og bevis](../kshms/HR_SICK_LEAVE_SETUP_20261010.md).

## HR: tydelig hjelp der du arbeider – 10. oktober 2026

Synlig **Start her** viser oppsett → medarbeider/leder → samtalemal for firmaadmin, og relevant lesehjelp for leder/personlig bruker. Malbyggeren forklarer velg → tilpass → forhåndsvis/lagre, navn/tema/spørsmål, forberedelse/felles møte, kladd/Forkast og utgave/arkiv. En lagret mal starter ingen samtale og sender ingenting til ansatte. Bare presentasjon/hjelp; handlinger, roller, SQL og privat innholdsport beholdes.

Berørte faktiske HR-/mal-/Hjelp-React-prøver og full Sandbox critical/build PASS. Eksisterende tester beholdt uten nye speiltester. Miljømål BEGGE, bare feature/Preview; tidligere TEST OK beholdes. [Scope og bevis](../kshms/HR_HELP_20261010.md). CI/innlogget visuell Preview kontrolleres etter publisering.

## HR: versjonerte samtalemaler – 10. oktober 2026

Firmaadmin får **HR → Samtalemaler**: årlig medarbeidersamtale, prøvetid og oppfølging, egne tema/spørsmål, medarbeiderforberedelse/felles møte, forhåndsvisning og tydelig **Lagre mal**. Immutable malutgaver, historikk, gjenbruk som ny kladd, arkivering/gjenåpning, paginering og avvisning av samtidige revisjoner. Kladd beholdes i midlertidig aktør-/firmabundet minne over fokus/remount, først etter fersk admin-tilgang. Ingen ansattes svar, personreferater, signaturer eller fraværsinnhold åpnes.

**91 nye faktiske rollback Sandbox-assertions PASS**, samme 91 i fysisk PostgreSQL/PGlite med syntetisk plattformadapter. Faktisk ny mal-React og berørt HR/register/KS-meny/Hjelp-React PASS; permanent critical og full Sandbox build PASS. Fem live funksjonskropper matcher lokale MD5-er, tomt search_path og riktige ACL. Sandbox-migrasjon **20261010005833**, CLI **20261010004928**. Eksisterende 1 HR-firma/1 medarbeider beholdt; 0 aktive utviklermaler/utgaver/artifacts/filer/receipts. Privat innhold fortsatt content=false/restore quarantined. Første live prøving ble korrekt avvist av eksisterende profile-guard under endring av egen syntetisk aktør; fixtureoppsettet ble korrigert til eksisterende systemaktør, uten endret guard eller produktkode. Hele første prøve rullet tilbake.

Miljømål **BEGGE**, bare feature/Preview/Sandbox, draft PR #216. Tidligere O3/B/C/PDF/ZIP og Kenneth TEST OK beholdes; ingen Production/main/demo/e-post. Uavhengig varig manifest/automatisk eksport og DB-ack/full isolert Supabase database- og Storage-restore gjenstår før privat HR-kontakt og individuelle samtaler/fravær åpnes. [Scope, kontrakt og nye bevis](../kshms/HR_TEMPLATES_20261010.md).

**Faktisk mal-Preview-kontroll:** kode `70f12015b616e8e9b4c6e0efc06d82ab4e6df1ef`, Core Safety **38011669656 / jobb 114092844672 SUCCESS**, `dpl_6QTL7UM5H55ek25V7mrsqkEdyPys` READY med eksakt SHA/ref/prosjekt/fast alias. Direkte branch-env `EXPO_BACKEND_TARGET=sandbox`. Innlogget desktop: HR/admin, tre forslag, generisk kladd/redigering, tom forhåndsvisning, dirty bytte/Behold kladden, Oppdater maler med bevart kladd og Forkast PASS. Ingen testmal lagret. Ingen horisontal overflow; Lagre mal 44px. Lagret historikk/arkiv/CAS har SQL og React-bevis; mobil og separate samtidige browserøkter gjenstår. [Originalbilde og presise bevis](../kshms/HR_TEMPLATES_20261010.md#faktisk-innlogget-preview-og-kodepublisering).

## H3 og samlet Hjelp – 9. oktober 2026

Miljømål **BEGGE**, bare feature/Preview og Sandbox, draft PR #216. Hjelp har nå ett **KS/HMS**-punkt med 11 kapitler og ett **HR**-punkt; tidligere hjelpeinnhold beholdes. HR-slettefundamentet omfatter registrert innhold, versjoner, kladder, søkeuttrekk, eksporter og private filer. Tilgang sperres straks; **Slettekvitteringer** viser pågående filsletting og ferdig sletting korrekt.

**61 nye faktiske Sandbox-assertions PASS**, faktisk privat Storage-opplasting/hashkontroll/API-sletting av én syntetisk 62-bytes fil PASS, faktisk HR/Hjelp-React og full critical build PASS. Alle 16 live SQL-funksjoner og Edge v3 er lest tilbake mot kilden. Sensitivt HR-innhold og filnedlasting er fortsatt stengt, både i databasen og i Edge-koden. Uavhengig slettemanifest og full isolert backup-restore er neste sikkerhetsbevis før åpning. Sandbox har nå én firmaoppføring og én medarbeider; eksisterende oppføring beholdes, ingen sensitive data eller testrester finnes. Ingen e-post, merge eller Production. Kenneths **TEST OK for H2-menyen** er mottatt; eldre B/C/PDF/ZIP-bevis beholdes. [Scope, kontrakt og QA](../kshms/HR_PURGE_FILES_20261009.md).

## HR-register og smartere KS/HMS-meny – 9. oktober 2026

Miljømål **BEGGE**, levering bare feature/Preview/Sandbox, draft PR #216. H2 gir eget HR-hovedvalg med firmaadmins medarbeider-/leder-/leserregister og medarbeiderens Mine oppfølginger. HR har fortsatt ingen samtale-/fraværsinnhold, filer eller eksport; full innholdspurge/restore må leveres før sensitivt innhold åpnes. Ingen firma aktivert av leveransen. KS/HMS-menyen er gruppert i Daglig arbeid, Mine rutiner og Forvaltning; eksisterende faner, snarveier og utkastbevaring beholdes.

**16 nye faktiske Sandbox-assertions PASS**, faktisk HR/meny-React og berørt håndbok/kildeforslag-React PASS, permanent hook/tilgang/revisjon/late-response-prøve og full critical build PASS. Fem HR-FK-indekser forbedrer slettestien. Skynettleseren fungerer igjen; faktisk ny layout etter publisering og eksakt SHA/CI/Preview føres i PR #216. Tidligere Kenneth TEST OK og B/C/PDF/ZIP-bevis beholdes uten ny obligatorisk omtest. Ingen mail/merge/Production. Neste: privat fil-/full slettekontrakt. [Scope og QA](../kshms/HR_UI_MENU_20261009.md).

---

## HR H1 – isolert tilgangsregister

Fem smale authenticated RPC-er bruker privat schema med fire RLS-tabeller og fem stengte hjelpere. HR har egen firmainnstilling; fersk arbeidsprofil/medlemskap/profil og medarbeider-/leder-/leserrelasjoner gir innsyn uten KS-/supportbypass. Firmalås og forventet revisjon beskytter endringer. Fratredelse sletter register/grants og rydder egne leder-/leserrelasjoner hos andre; minimal separat slettesperre hindrer reaktivering. Ingen innholds-/versjons-/kladd-/fil-/eksport-API eller HR-meny finnes ennå. Ny hr-private er privat og tom uten klientpolicy; API-purge/restore må leveres før filer åpnes. Den nye flyktige transporttjenesten er foreløpig frakoblet React/global events. 75 Sandbox-assertions, permanent runtime og byteidentisk funksjonsreadback PASS. [Scope og neste gate](../kshms/HR_FOUNDATION_20261009.md). KS-kode/roller/worker og hovednavigasjon er uendret.

---

## KS/HMS – samlet B/C-gjennomgang

Gjeldende avgrensning står i [OVERSIKT](../kshms/OVERSIKT.md), med [kravkart/runtimebevis](../kshms/BC_REVIEW_20261009.md). Kombinert ti-gruppe React/PDF og ZIP med kvalitet/HMS og legacy samtidig er verifisert; prosjekt-/rolle-RPC er kontrollert etter senere migrasjoner. Denne endringen berører bare status/hjelp og én vedleggstekst, ikke eksporthandler eller backend. Tall/dato finnes i faste skjemaer, men ikke som egendefinerte svarfelt i firmamalen. Generell originalfilopplasting i selvstendig kontroll er ikke implementert, men er heller ikke innført som nytt obligatorisk scope. Håndbokrevisjonspåminnelser er neste konkrete C-scope.

Direkte Sandbox-audit bekrefter privat kshms-private og eksisterende offentlig project-images. Innlogget uttrekkskontroll endrer ikke bucketens offentlige natur; fremtidig sensitiv HR-/privatfilflyt må bruke særskilt privat tilgang. Ingen bucket/policy/grant endres her. Cron er aktiv, transport enabled=false. Autentisert faktisk e-posttest og generell releaseaktivering er atskilte.

---

## Kildeoppdateringsforslag – feature/Sandbox

`sourceUpdateOverview` leser eksisterende håndbokstate og krever enabled/manage samt eksakt firma-/brukerscope. Den utelater arkiverte, fremmede og egne rutiner uten kjent source_key og skiller eldre utkastgrunnlag fra vurdert utkast med eldre publisert grunnlag. `KshmsSourceUpdates` åpner eksisterende editor. `KshmsSourceProposal` viser åtte felt med faktisk firmatekst/forslag; applySourceField kloner bare ett felt uten å flytte source_revision, mens markSourceReviewed er en egen eksplisitt handling som ikke senker et nyere grunnlag. Referansenes checked_on beholdes ved tekstvurdering.

Editorens eksisterende firma-/brukerscoped localStorage-kladd og save/publish/ack gjenbrukes. Ingen nye fetch-effekter, global state, RPC, migrasjon, RLS/Storage, signatur eller navigasjon. Native details og scoped responsiv CSS brukes. Permanent critical-kjede, faktisk React og 22 rollback-assertions mot ekte Sandbox-RPC er grønne. [Scope og QA](../kshms/SOURCE_UPDATES_20261009.md).

---

## Fristpåminnelser for avvik/RUH – feature/Sandbox

Oppgavelisten skiller passert frist, frist i dag og frist innen tre dager i norsk tid. Åpne avvik/RUH får styrte ukespåminnelser via eksisterende privat leveringskø når e-post senere aktiveres. Kø og leveringskontroll følger ansvarlig, frist og gjeldende tilgang; gamle perioder og reaktiverte køer spilles ikke av. Transport forblir deaktivert i Sandbox. `kshms_deviation_tasks` beregner friststatus med Europe/Oslo. Private collector låser saken og oppretter kun aktuell syvdagersperiode i outbox; separate delvise unike indekser bevarer tildelings-idempotens og påminnelses-idempotens. `notification_active` bevarer de seks eksisterende oppgavetypenes kontroll og legger til frist-/periode-/aktiveringsvern for påminnelser. Profilens tilgangsendringer undertrykker ventende påminnelser. Workerens token, reservasjon, retry, siste tilgangskontroll og beskyttede lenke er bevart. [Scope og QA](../kshms/DEVIATION_REMINDERS_20261009.md).

---

# Risikobilder i eksisterende privat gjennomføringssnapshot – Preview 9. oktober 2026

`KshmsExecutions` gjenbruker den eksisterende komprimerings- og bildevalideringen for inntil tre JPG-/PNG-/WebP-bilder per fare. Bildene ligger i samme private, versjonerte `kshms_executions.content` som fare, tiltak og score. Migrasjon `20261009030000_kshms_risk_photos.sql` utvider bare den private innholdsvalidatoren; den oppretter ingen tabell, Storage-bucket, RLS-policy eller offentlig RPC. Eldre snapshots normaliseres til tom bildeliste. Ny vurdering med samme farer kopierer tekstgrunnlaget, men ikke bildene. Konfliktvisningen viser bare antall bilder og eksponerer ikke base64-data.

`executionReportDocument` er fortsatt én felles lagret-dokumentmodell for egen PDF, prosjektrapport og samlet dokumentuttrekk. Vedleggsarkivet tar bare med bilder fra uttrykkelig valgte risikovurderinger og binder dem til dokument, revisjon, fare, byteantall og SHA-256 i manifestet. Rapportblokken tolererer nå dokumenttyper uten `closing` og tomme rader, slik at SJA-bilder i prosjektrapporten ikke utløser en React-krasj. Ingen save-/complete-, e-post-, navigasjons- eller Production-endring inngår. [Avgrensning og QA](../kshms/RISK_ATTACHMENTS_20261009.md).

---

# Versjonerte underskjema – avgrenset B i Sandbox

Sjekklistedraften kan peke fra et rotpunkt til én eksakt `kshms_checklist_versions.id`. `kshms_private.checklist_snapshot` validerer samme firma/aktiv mal, stopper direkte og transitiv syklus, begrenser den ferdige listen til 100 punkter og lager deterministiske child-punkt-ID-er. Publisert `content` beholder `root_points`, ferdig utflatede `points` og komplette `dependencies` med versjons-ID/hash/innhold. Child-referansen finnes bare i root/dependency, ikke utføringspunktet, så eksisterende utførelses-RPC-er validerer og låser den utflatete listen som før. Historiske versjoner er valgbare bare gjennom manager-RPC; prosjektkatalogen tilbyr fortsatt nyeste aktive mal. Ingen ny tabell, Storage, RLS-policy, e-post eller Production-endring. Sandbox-migrasjoner `20261009040633` og `20261009041152`. [Kontrakt og QA](../kshms/CHECKLIST_SUBFORMS_20261009.md).

# Rutine-/sjekkliste-PDF – avgrenset B/C i Sandbox

KshmsDocumentPdfButton og kshmsDocumentPdf.mjs bruker eksisterende kshms_get_state/kshms_checklist_state/project_checklist_state og firmaprofil. Eksakte utgaver/hash/svar/revisjon og eksisterende firma-/bruker-/prosjekttilgang kontrolleres før/etter asynkron lasting. Ulagret kontroll sperres; sene scope-/skjermsvar stoppes. appendExecutionPdf gjenbrukes uten layout-/lagringsendring; eksisterende logo-loader eksporteres. Main sender bare eksisterende publicProjectFileUrl til prosjektpopupen. Ingen DDL/RLS/Storage/auth-, autosave-/navigasjons- eller e-postendring. Filadresser blir rasterbilder, ikke tekst/lenker. Rutine-PDF utelater medarbeidertildelinger/bekreftelser og upubliserte utkast. Se [kontrakt og tester](../kshms/DOCUMENT_PDF_20261008.md).

---

# Kontroll-/risiko-PDF – Sandbox 8. oktober 2026

`executionReportDocument` mapper kun lagrede snapshots til både egen PDF, prosjektrapport-PDF og React/utskrift. Foto-data valideres og feil stopper eksport, identiteter/utgaver slås ikke opp på nytt. Utkast vises uten fullføringsidentitet; forventet risiko er skilt fra kontrollert effekt. `downloadExecutionPdf` krever fersk detail med riktig bruker/firma/prosjekt/type/revisjon og enabled; den leser firmaprofil og bruker samme eksisterende jsPDF-versjon. Aktivt dokument/scope kontrolleres etter hvert asynkrone steg og før nedlasting. Ingen save-/complete-kall fra eksporten.

Prosjektvalget utvides fra to til fire dokumenttyper. Eksisterende `kshms_project_report` beholdes; ny `kshms_project_execution_report` bruker samme firma-/modul-/prosjekttilgang og eksisterende `execution_visible`. Nøyaktig valgte ID-er/type/prosjekt må finnes, ellers avvises hele uttrekket. SECURITY DEFINER med tom search_path og eksplisitte PUBLIC/anon-revokes; authenticated-grant er kontrollert med negative SQL-prøver. Ny migrasjon 20261008202524 er kun anvendt i Sandbox. Ingen endring i main.jsx, reportTools.js, signerte data eller portal. [Bevis](../kshms/EXECUTION_PDF_20261008.md).
---

# SJA/RUH i prosjektrapporten – Preview 8. oktober 2026

`useKshmsProjectReport` holder rapportvalget utenfor prosjekt-/portaldata og nøkkler det på bruker, firma, prosjekt, modultilgang og managerrett. Ved scopeendring tømmes også den lagrede klientkopien; retur til tidligere prosjekt gjenoppliver ikke gamle snapshots. Dialogen gjenbrukes av rapportvisning, begge utskriftsknapper og PDF-knappene. Bare et aktivt valg gir SJA/RUH-innhold. Ny read-only `kshms_project_report` bruker eksisterende `require_context`, `project_checklist_access` og `deviation_visible`; private SJA-utkast følger eksisterende SJA-synlighet. Både valglisten og det ferske eksportuttrekket avgrenses server-side. Manglende, fremmede eller tilbakekalte ID-er stopper hele uttrekket. RPC-en har tom search_path, ingen PUBLIC/anon-grant og authenticated-grant med eksplisitte interne porter.

`kshmsReportDocuments` gir samme felter til intern rapport og faktisk jsPDF. Signaturer, deltakertekst og rutinenummer/utgave kommer fra lagrede snapshots; de slås ikke opp eller skrives på nytt. Signerte SJA-er og prosjektets JSON endres ikke. Utkast merkes usignert, åpne RUH-er viser gjenstående oppfølging. Lange KS-felter får egne kontrollerte sideskift. Valgt RUH undertrykker samme legacy-speil i avvikslisten; øvrige legacy-avvik beholdes. CustomerReport/portal får ingen SJA/RUH-innsprøyting. Main-koblingene er bare hook, rapportavhengigheter/props, valgpanel og dialog. Ingen navigasjons-/autosave-/auth-endring. Sandbox-migrasjon 20261008115650, ingen Production-migrasjon. [QA, omfang og begrensninger](../kshms/PROJECT_REPORT_20261008.md).

# Expo ProffDok – arkitekturkart

SJA utvider bare KS/HMS-parenten med en bevart SJA-fane og ny popup. kshms_sjas/kshms_sja_commands bruker eksisterende arbeidsfirma-/KS-gates, revisjonsvern, idempotente kommandoer, bekreftet readback og uforanderlig signert snapshot. Ingen main.jsx-/auth-/prosjektendring. Sandbox-migrasjon 20261007212858_kshms_sja; ingen Production-migrasjon. Se [SJA-kontrakt og tester](../kshms/SJA_20261007.md).

Preview 07.10.2026: Native React-menykontroller bærer gjeldende navn i `data-expo-nav-label`. Enkel ordre bruker dette ved gjenoppretting etter sidebytte, fordi React gjenbruker knapper og samme salgsprop også når arbeidsflaten endres. Den eksisterende desktop-/prosjektmenyen klikker fortsatt de samme native kontrollene. Ingen ny navigasjonsmotor, tilgangsregel eller datastrøm innføres. Se [avgrenset returprøve](../kshms/MENU_RETURN_20261007.md).

**Fase:** eksisterende ProffDok med firmakunder/mva.; KS/HMS trinn A under utvikling i feature/Preview
**Status:** Production inkluderer godkjent PR #214 og tidligere Cordel-/prosjekt-/tilbudsfunksjoner. KS/HMS er ikke merget eller produksjonsgodkjent.
**Kontrolldato:** 05.10.2026
**Produksjonsbaseline:** `main` = `155f6c4ac01f126c1db0c65da385cfd9305587d5`; Vercel `dpl_9wsjTrEVzvAF6jf7f9HgvzskYP5z` READY på samme SHA. Kode, backend og live system er autoritativt dersom statusdokumentet henger etter.
**Production Supabase:** `dqffxflaoyarbxyiyhop`  
**Permanent Demo Sandbox:** branch `demo`, Supabase `ppvircenkjizeiqdxphj`

Dette dokumentet beskriver gjeldende Production-arkitektur og sikkerhets-/bakoverkompatibilitetskrav som må bevares. Historiske detaljer finnes i Git og fasespesifikke arkitekturfiler.

## 1. Styrende prinsipper

### Cordel: lokal eksport fra låst grunnlag

`src/modules/cordel` er en ren filgenerator og React-presentasjon. Eksportknapper integreres i Sales-detalj, prosjektets eksisterende kontraktkort og Prissøk/plukkliste. En separat, firmascope-bundet Cordel-tilgang leses fra server og administreres i eksisterende Systemadmin-brukerkort. Filgeneratorene endrer ikke tilbud, plukklister, recovery eller hydration.

Aksepterte tilbud blir Windows-1252-jobbliste og native AFG v4 med komplette tekster, Rundsum-priser, nummererte overskrifter og delsummer. Akseptert sum kontrolleres i øre mot hver eksportert post. På en tom ordre kan AFG importeres alene; ved jobbliste brukes jobbliste først og AFG uten sletting etterpå. AFG-oppsettet bygger på faktisk Cordel-eksport og bekreftet TEST-import, ikke et publisert skjema. Egen Cordel-metode med 0 % materiellpåslag og øreavrunding kreves. Kildekost, timer og fortjeneste overføres ikke.

Plukklistefilen inneholder kun NR, Mengde og Fagområde/leverandør; Cordel bruker sin prisbok. Faste P:-filnavn gjenbruker importdefinisjoner. **Hjelp → Eksport av tilbud til Cordel** rendres i eksisterende React-Hjelp som ett nytt tema. TEST-bildene leveres som lazy-lastede, lokale bildeassets med originale PNG-bytes bevart. Øvrige Hjelp-temaer og deres rettighets-/åpne/lukk-logikk er bevart.

1. `main` er kilde til sannhet for produksjonskode.
2. Produksjon beskyttes foran alt: feature-branch → Vercel Preview → eksplisitt `TEST OK` → merge → bekreft Production-SHA, `READY`, HTTP/runtime og relevant Supabase-status.
3. RLS/server er sikkerhetsgrensen; frontend alene gir aldri tilgang eller autoritativ validering.
4. Publiserte tilbud, aksepterte tilbudsversjoner, signerte kontrakter og utstedte garantier er historikk og skal ikke overskrives vilkårlig.
5. Prosjekt kan opprettes og eksistere uten tilbud og uten kontrakt.
6. Kontrakt er bare obligatorisk når dokumentert tetthetsgaranti faktisk skal utstedes eller øvrig avtalegrunnlag krever den.
7. Privatkundeorienterte priser vises inkl. mva.
8. Ingen historisk backfill uten eksplisitt beslutning.
9. Supportmodus er ikke skrive-bypass og skal ikke registrere systemadmin som feil oppretter, ansvarlig eller signatar.
10. Sales recovery/hydration og IndexedDB-sikring av befaringsbilder er kritiske kontrakter.
11. Historiske Storage-paths/URL-er flyttes ikke spontant.
12. Modulisering gjøres bare ved naturlige ansvargrenser som gir reell oversikt eller mindre risiko.
13. Brukerrettede endringer oppdaterer HJELP samme runde.
14. Fremdriftsplan er operativ prosjektdata og skal aldri endre låst tilbuds-/aksepthistorikk.
15. Vercel Preview skal være trygg testmodus for prosjektfunksjoner som ellers kan sende e-post eller skrive produksjonsdata.
16. Kalender- og PDF-eksport skal lese lagret data; eksport blir ikke ny sannhetskilde.
17. Intern ERP-nettopris er sikkerhetskritisk intern data og skal aldri inngå i kundens tilbudsgrunnlag.
18. Historiske Butikktilbud beholder tidligere avslutning og skal ikke omskrives. Nye Generelle tilbud kan etter aksept aktiveres som Enkel ordre eller ordinært prosjekt.
19. Aktiv arbeidsprofil/representert firma er arbeidsscope. Systemadministrator skal ikke få tverrfirma-prosjekter projisert inn i ordinær arbeidsflate bare fordi rollen har brede supportrettigheter. Et prosjekt som åpnes via eksplisitt tverrfirma-support er skrivebeskyttet i hele prosjektflaten: lesing, fanenavigasjon og PDF er tillatt, mens lagring, kopiering, låsing, opplasting, autolagring og øvrige mutasjoner blokkeres. Integrasjonslag som starter før hovedappen skal vente på hovedappens registrerte Supabase-klient og skal ikke opprette parallelle GoTrue-klienter mot samme auth-storage.
20. Ved recovery/hydration vinner en eksplisitt brukerhandling alltid over automatisk gjenoppretting.
21. Sales-oversikten skal være lett: listevisning henter bare summary/metadata. Komplett tilbud, bilder, Badskisse og historikk hentes først når én konkret sak åpnes.
22. Aktivt arbeidsbilde skal tåle PC-fanebytte og mobil appbytte. Også en ny forespørsel uten `request_ref` er et gyldig recovery-arbeidsbilde.
23. Før implementering klassifiseres miljømålet som `PRODUKSJON/PREVIEW`, `SANDBOX/DEMO` eller `BEGGE`.
24. Permanent Demo Sandbox ligger på branch `demo`. Ordinær appkode kan synkroniseres **main → demo** etter godkjent Production-verifisering; demo-overlay og demodata skal aldri flyte **demo → main**.
25. Demo/Test skal ikke brukes som begrunnelse for å endre beskyttet Production-kjerne i samme PR. Reell produktfeil splittes til egen core-PR fra ren `main`.
26. Kun Systemadministrator kan aktivere Proff-vareregisteret for eksterne firma, styre leverandører/rabatter og aktivere Generelle tilbud for firmaet. Firmatilgangen gjelder alle nåværende og nye brukere. Enkel ordre er en videreføring som velges først etter kundeaksept.
27. Intern Ringside-nto og ekstern «Din nto pris» er to separate rettigheter. Begge krever eksplisitt serververifisert tilgang.
28. Enkel ordre bruker prosjektmotoren, men kundeportal er blokkert. Fremdriftsplan og FDV er valgfrie.
29. App-tilgang forutsetter at virksomheten oppfyller gjeldende SoPro-vilkår. Eventuell særskilt betaling for Generelt tilbud er et senere produktvalg og er ikke en teknisk tilgangsregel i Fase 45B.
30. En generert sluttrapport er et konsistent øyeblikksbilde av samme effektive status som brukerflaten. Signert overtagelse kan derfor bekrefte garantivilkår i rapporten selv om siste eksplisitte persist-hook først kjøres ved låsing, og rapporten viser tidspunktet for den aktuelle genereringen – aldri en pågående-status i en ferdig fil.
31. Auditfelt på nye Fag/utstyr-poster og automatisk arkivert Expo-kontrakt skal komme fra autentisert aktør/signatar, ikke bare fra eventuelt tomt prosjektsnapshot.
32. En eksplisitt «Fullfør overtagelse og lås prosjekt»-handling kan hoppe over den generelle, dupliserte låsebekreftelsen. Direkte låsing/opplåsing fra topplinjen beholder egen bekreftelse.
33. Felles e-postutsending er en separat systemadminhandling. Mottakere løses server-side, adresser sendes individuelt, driftsmelding og markedsføring er eksplisitte typer, og markedsføring krever aktivt samtykke samt personlig avmelding.

## 2. Plattform

| Lag | Teknologi | Hovedansvar |
|---|---|---|
| Klient | React + Vite | UI, state, navigasjon og arbeidsflyt |
| Auth | Supabase Auth | Innlogging og identitet |
| Data | Supabase Postgres | Prosjekter, Sales, kontrakt, garanti, fremdrift, katalog og systemdata |
| Serverlogikk | Supabase RPC/trigger/RLS | Firmascoping, validering, låsing, portalfiltrering og katalogtilgang |
| Filer | Supabase Storage | Bilder og private/offentlige dokumenter |
| E-post | Supabase Edge Functions + Resend | Befaring, tilbud, aksept, kontrakt, portal, chat og prosjektmeldinger |
| Hosting | Vercel | Preview, Production og permanent Demo Sandbox |
| PDF | jsPDF + nettleserutskrift + `pdf-lib` | Rapport, tilbud, akseptbevis, garanti, kontrakt og fremdriftsdokumenter |
| Kalender | standard `.ics` | Enveis eksport av daterte fremdriftsøkter |

Produksjon: `https://expo-proffdok.app`  
Permanent demo: `https://expo-proffdok-git-demo-ringside.vercel.app`

## 3. Repository – hovedansvar

```text
src/main.jsx
  sentral app-/prosjektorkestrering og eldre funksjoner

src/bootstrap.jsx
  installer små, avgrensede bootstrap-/UX-lag

src/modules/app/
  app-shell, desktopmeny og prosjektveiviser/hurtigvalg

src/modules/access/
  modul-/rolletilgang, arbeidsprofiler, systemadmin-representasjon og support-/scope-guards

src/modules/sales/
  forespørsel, befaring, ordinært/Generelt tilbud, aksept, recovery og kontrakt

src/modules/storeCatalog/
  internt ERP-vareregister, søk/import og Systemadmin-katalogflate

src/modules/progress/
  fremdriftsplan, eksport, kalender og kunde-/UE-presentasjon

src/modules/help/
  rollebasert brukerveiledning

src/modules/project/
  prosjektfunksjoner og prosjektinvolverte

docs/architecture/
  gjeldende arkitekturkart + fasespesifikke sikkerhets-/designnotater

scripts/
  kritiske pre-build-regresjonskontroller og PR-scope-guard
```

### 3.1 Permanent Demo Sandbox

`demo` er en langlivet, isolert branch som bygger den ekte appen mot separat Sandbox-Supabase. Den brukes til kundedemo, opplæring og funksjonell presentasjon uten risiko for Production-data.

Kritiske regler:

- `demo` skal aldri merges til `main`.
- Production-funksjonalitet utvikles og godkjennes fra `main`-baserte feature-/hotfix-brancher.
- Når godkjent Production-kode også skal finnes i demo, synkroniseres gjeldende `main` kontrollert inn i `demo`.
- Demo-spesifikke kontrollflater, Golden/reset, syntetiske ressurser, sandbox-RPC-er og konfigurasjon bevares kun i demo.
- Demo-builden skal feile dersom emitted JS fortsatt inneholder Production-Supabase-binding.
- Sandbox har egen Auth, database og Storage og skal bare inneholde fiktive/sanitiserte data.
- Fast kontrollside er `/demo-control.html` på det permanente demo-hostet.

## 4. Prosjekt og Avtalegrunnlag

Prosjektet lagres hovedsakelig som samlet JSON i `projects.data`. Den synlige fanen heter **Avtalegrunnlag**, mens intern nøkkel fortsatt er `tilbud` / `data.tilbud` for bakoverkompatibilitet.

Gyldige prosjektveier:

```text
A) Direkte prosjekt uten tilbud
B) Akseptert ordinært tilbud → prosjekt uten kontrakt
C) Akseptert ordinært tilbud → egen opplastet kontrakt → prosjekt
D) Akseptert ordinært tilbud → Expo-kontrakt → prosjekt
E) Akseptert Generelt tilbud → Enkel ordre eller ordinært prosjekt
```

Avtalegrunnlag kan inneholde akseptert tilbud/akseptbevis, signert Expo-kontrakt, bedriftens egen kontrakt, andre avtaledokumenter og senere tillegg/fradrag.

For ordinære prosjekter aktivert fra et akseptert Sales-tilbud viser Avtalegrunnlag også kontrakthandlingen. Dersom kontrakten ikke ble laget før aktivering, henter prosjektet den samme låste, aksepterte tilbudsversjonen via eksisterende offentlig tilbudstoken og åpner eksisterende `SalesContractActions`/`SalesContractWizard` i prosjektfanen. Nye aktiveringer bevarer også `salesOfferId` i `project.salesOrigin`; eldre prosjekter kan utlede ID-en fra serverresponsen. Det opprettes ingen ny kontraktmodell, RPC, tabell eller RLS-bypass. Kunde-/UE-portal skjuler handlingen. I eksplisitt Systemadmin-supportmodus er Salgsgrunnlag og Avtalegrunnlag interaktive for lesing og åpning av eksisterende dokumenter, mens all kontraktskriving, opplasting og fjerning fortsatt er blokkert. Private Sales-dokumentlenker bærer en eksplisitt supportmarkør; eksisterende systemadmin-vakt tillater den bare for autentisert Systemadmin og bare på GET/HEAD. Når prosjektet allerede inneholder slutt-PDF med samme `contractId`, Storage-path eller URL som kontraktraden, hoppes automatisk sluttarkivering/prosjektsynk over; ren visning skal ikke flytte `projects.updated_at`.

Historiske Butikktilbud beholder gammel avslutning uten prosjektaktivering. Fase 45B endrer den synlige funksjonen til Generelt tilbud; teknisk legacy-identitet kan fortsatt være `store offer` av hensyn til kompatibilitet.

### 4.1 Prosjektnavigasjon – Fase 42J/42K

Desktop bruker kollapset prosjektmeny for å frigjøre plass i headingen. Når et prosjekt er aktivt viser `projectWorkspaceHeaderGuide.js` en kort veiviser og noen få hurtigvalg: **Oversikt, Bilder, Sjekklister og Chat**. Hurtigvalgene klikker eksisterende native prosjektfaner og lager ikke en ny navigasjonsmotor. Alt øvrig prosjektinnhold ligger fortsatt i **Meny**.

Når Systemadmin har åpnet et annet firmas prosjekt i eksplisitt supportmodus, heter prosjektets returhandling **Supportoversikt**. Den går tilbake til Systemadmin-visningen med samme firma valgt og supportpanelet åpent; den avslutter ikke supportmodus. Bare den separate handlingen **Avslutt supportmodus** rydder supportkonteksten.

Fase 42K stabiliserte legacy-prosjektmenyer slik at eldre prosjektdata ikke gir feil anbefalt rekkefølge. Mobilskallet endres ikke av desktop-veiviseren.

## 5. Sales – ordinær Befaring/Tilbud

```text
Forespørsel
→ eventuell befaring
→ tilbudskladd
→ publisert tilbudsversjon
→ kundelenke/e-post
→ kundevalg av opsjoner
→ digital aksept
→ låst akseptbevis
→ valgfritt kontrakt/prosjekt
```

Kritiske Sales-kontrakter:

- tom/uhydrert tilbudskladd skal aldri overskrive nyere serverdata
- recovery skal fungere ved reload, dvale, PC-fanebytte og mobil appbytte
- befaringsbilder beholder IndexedDB/Storage-flyt
- publiserte/aksepterte tilbudsversjoner er immutable snapshots
- kundeaksept knyttes til eksakt versjon og valgte opsjoner
- supportmodus er ikke skrive-bypass
- summary-rader skal aldri kunne skrives tilbake som komplett Sales-payload
- komplette saksdetaljer skal være lastet før editor/autosave aktiveres

### 5.1 Recovery/hydration – Fase 42F

Fase 42F strammet inn Sales-gjenoppretting etter mobil dvale, appbytte og reload. Serverdata er autoritativt utgangspunkt, mens lokal recovery brukes kontrollert for ulagret arbeid.

Kritiske regler:

- eksplisitt brukerhandling vinner alltid over automatisk recovery
- recovery skal ikke hoppe brukeren tilbake til en sak eller fane vedkommende bevisst har forlatt
- ferske serverbilder og lagret Badskisse skal flettes inn uten å overskrive nyere lokal befaring
- manglende lokal media skal ikke tolkes som beskjed om å slette servermedia
- bakgrunns-/reloadmarkører skal ikke bli ny sannhetskilde

Disse kontraktene er permanent regresjonsbeskyttet og skal vurderes ved alle endringer i Sales-navigasjon, hydrering eller media.

PR #206 sikrer audit-recovery av tilbudskladd: brukerens valg identifiseres av den lokale sikkerhetskopiens revisjon, uavhengig av at aktiv kladd får nytt lagringstidspunkt. Dialogen navngir begge lokale versjoner korrekt. Valgt kladd bevares ved samtidig serverkonflikt, og autolagring prøves igjen etter overgangsvakten. Recovery skal fortsatt bare be om valg når to reelle versjoner krever det.

### 5.2 Badskisse og befaringsmedia – Fase 42A–42F

Badskisse er en mobiltilpasset del av befaringen for enkle romskisser med vegger/mål, dør/vindu og relevante baderomsobjekter. Fase 42E forbedret målsatt visning og redigering. Fase 42F sikret at lagret Badskisse og servermedia overlever recovery/hydration.

Badskisse og bilder er del av befaringsdata og skal følge samme recovery-prinsipp: serverinnhold bevares, nyere lokal brukerhandling bevares, og sammenslåing skal ikke gi stille datatap.

### 5.3 Skalerbar saksoversikt / lazy loading – Fase 42I

Sales-listen bruker en lett serverprojeksjon (`list_payload`) for metadata som kunde, adresse, status, ansvarlig, neste steg, dato og søkeinformasjon. Komplett `payload` med tilbudslinjer, bilder, Badskisse, akseptdata og historikk hentes først når brukeren åpner den konkrete saken.

Dette er en kritisk skaleringsgrense. Historiske Ringside-saker hadde titalls MB full payload selv med få saker; listeprojeksjonen reduserer dette til noen titalls KB for samme oversikt.

Kritiske regler:

- sakslisten må aldri begynne å hente komplette payloads for alle saker igjen
- firmascopet localStorage-listecache skal bare inneholde lett summary
- valgt sak skal hydreres komplett server-first før editor åpnes
- hvis komplett sak ikke kan hentes, skal editor blokkeres og brukeren få kontrollert retry i stedet for tom/ufullstendig redigering
- tilbudskladd, befaringskladd og media-recovery beholder egne lagringsmekanismer

### 5.4 Ulagret kundeinformasjon ved app-/fanebytte – Fase 42J

`Ny forespørsel` og `Nytt tilbud` har ingen `request_ref` før brukeren lagrer. Recovery må derfor tillate disse modusene uten valgt saks-ID. Kunde-/adressefelter mellomlagres lokalt og gjenopprettes bare når et eksplisitt, ferskt bakgrunns-snapshot viser at brukeren faktisk var i dette arbeidsbildet.

Dette gjelder både PC-fanebytte og mobil appbytte, for eksempel når bruker åpner SMS eller Outlook for å hente resten av kundenavn/adresse.

`Rediger forespørsel` bruker samme prinsipp, men kladden er bundet til konkret `request_ref`.

Viktig:

- normal navigasjon skal ikke gjenopplive gamle entry-kladddata
- første tomme React-render skal aldri overskrive entry-kladden som skal gjenopprettes
- bevisst Tilbake/Avbryt/menyvalg rydder recovery-markører slik at brukerhandling alltid vinner

### 5.5 Produksjonsstabilisering

Gjeldende Production-baseline inkluderer Fase 42K og senere godkjente rettelser, blant annet:

- korrekt systemadmin-arbeidsscope via valgt `Representerer`-firma
- videre beskyttelse av Prissøk-resume og bevisst navigasjon. Mobil-Prissøk er i Production fra PR #201; detaljene står i avsnitt 7.5.
- krav om Firma ved godkjenning av nye brukere
- vern av intern Butikktilbud-/nettopristilgang ved firmabytte
- legacy prosjektmeny og anbefalt prosjektløp konsolidert mot gjeldende navigasjon

## 6. Sales – Generelt tilbud

Generelt tilbud er Sales-flyten for varer, arbeid, underentreprenører og andre leveranser. Eksisterende historiske Butikktilbud skal fortsatt kunne åpnes og vises korrekt. Interne tekniske navn kan derfor fortsatt bruke `store offer`/`Butikktilbud`.

```text
Nytt Generelt tilbud
→ kunde/ansvarlig/merkevare
→ tilbudsposter og avsnitt
→ valgfritt katalogsøk
→ knyttet montering og opsjoner
→ autosavet kladd
→ kundepreview
→ publisert versjon
→ kundelenke/e-post
→ aksept eller avvisning
→ låst akseptert tilbudsversjon
→ Enkel ordre eller ordinært prosjekt
```

Aksept av Generelt tilbud:

- gir firmaet et eksplisitt valg mellom Enkel ordre og ordinært prosjekt
- bruker akseptert versjon og valgte alternativer som låst bestillingsgrunnlag
- beholder publisert versjon som låst historikk
- beholder eventuell automatisk oppfølgingshistorikk

Historiske Butikktilbud følger sin opprinnelige avslutning og skal ikke automatisk konverteres eller aktiveres som prosjekt.

### 6.1 Tilbudsposter og avsnitt

Avsnitt lagres som `store_text` med `storeSectionMode = "group"` og representerer visuelle grupper som `Varmepumpe`, `Elektriker`, `Bad 1` osv.

Avsnitt:

- har ingen pris
- skal ikke valideres som ordinær prislinje
- skal ikke bruke prislinjenummer
- skal vises som overskrift i internvisning, kundelenke, tilbuds-PDF og akseptbevis

Felles robust deteksjon ligger i `src/modules/sales/utils/storeSectionLine.js` og støtter også eldre seksjonsmarkører.

### 6.2 Montering og opsjoner

Montering kan knyttes direkte til post og beregnes med antall/timer × enhetspris. `Kun montering` støtter frittstående arbeid.

Opsjoner støtter tillegg/oppgradering og alternativ/erstatter. Alternativ vare kan beholde samme montering, bruke ny montering eller ha ingen montering.

Komplette tilbudsmaler kan lagre varige bildepekere (`https:` eller appens rot-relative Storage-/asset-URL-er) på poster og opsjoner. Midlertidige `data:`/`blob:`-bilder fjernes fordi de ikke er en stabil lagringskontrakt, og PDF-vedlegg er alltid saksspesifikke og følger ikke malen. Eksisterende maler uten lagret bildepeker kan ikke rekonstruere bildet automatisk; de må lagres på nytt fra et tilbud som fortsatt har bildet.

### 6.3 Autosave og recovery

Generelt tilbud har saksspesifikk serverautosave. Kritiske regler:

- tom/stale lokal kladd får ikke overstyre servertilbud med innhold
- tom Enter-opprettet post prunes ved lagring
- avsnitt bevares gjennom normalisering som avsnitt
- Tilbake lagrer kladd uten gammel generisk valideringsdialog
- vanlig inngang til Befaring/Tilbud åpner sakslisten
- faktisk reload inne i sak kan gjenåpne samme sak

Firmascopet lokal Sales-cache kan gi rask førstevisning, men Supabase er alltid autoritativ og oppdaterer listen etter serverlasting.

Kundepreview bruker samme presentasjon som kunden, men er isolert og read-only. Den åpnes i ny fane uten å flytte originalfanen bort fra tilbudet, og kan ikke publisere, sende e-post, akseptere eller avvise.

Kontrakt-PDF grupperer sammenhengende tekst i ett kort, bruker ledig sideplass og oppretter fortsettelseskort bare ved reelt sideskift. Lange overskrifter brytes, og opsjonsbeskrivelse og pris holdes samlet. PDF-generering endrer ikke det låste kontraktsgrunnlaget.

## 7. Internt ERP-vareregister – Fase 39B.2

Detaljert sikkerhet og importmodell: `docs/architecture/FASE39B_INTERNAL_STORE_CATALOG.md`.

Tilgang krever godkjent/aktiv bruker og eksplisitt serverautorisering. Interne brukere i Ringside/Bademiljø Expo/Expo Proffsenter kan gis tilgang til hele internkatalogen, mens eksterne proffbrukere bare kan søke hos leverandører firmaet er aktivert for. Org.nr. brukes ikke som eneste sikkerhetsgrense.

Kun systemadministrator kan administrere/importere katalogen.

### 7.1 Ekstern Proff-katalog – Fase 45B

Ekstern profftilgang er firma- og leverandørscopet:

1. Systemadministrator velger aktive leverandører og firmaets rabatt per leverandør i Proff-vareregisteret.
2. Systemadministrator aktiverer `store_offers` én gang for firmaet, synlig som **Generelle tilbud / Proff vareregister**. Backend sørger for at alle firmaets brukere får nødvendig `sales`-grunnlag og samme tilgang.
3. Brukeren må være godkjent og aktiv, ha begge modulene og tilhøre et firma med minst én aktiv leverandør.
4. Søk returnerer ikke Ringsides interne purchase-netto, innkjøpsrabatt, DG eller påslag.

Brukervilkårstatus er en separat compliance-/onboardingstatus og er ikke samme kontroll som firmaets leverandørtilgang eller brukerens modultilgang. **Enkel ordre** blir først et valg når et Generelt tilbud er akseptert.

Veiledende/kundepris brukes som foreslått salgspris, men tilbudsgiver kan endre salgspris/rabatt i eget tilbud. «Din nto pris» kan bare returneres når brukeren har eksplisitt bruker- og firmascopet rettighet. Firmaadmin kan administrere rettigheten for andre brukere i eget firma, men ikke gi den til seg selv. Systemadministrator kan gi og fjerne rettigheten.

Interne Ringside/Bademiljø Expo/Expo Proffsenter-brukere kan ha bred katalogtilgang uten automatisk tilgang til intern nto-pris. `view_internal_net_prices` beholdes som eksplisitt sikkerhetskrav.

### 7.2 Katalogdata

Katalogen kan inneholde intern netto innkjøpspris og kalkulasjonsdata. Ved valg i tilbud kopieres bare kundeegnet snapshot og salgspris.

Intern nettopris skal aldri finnes i:

- kundens Sales-payload
- publisert tilbudsversjon
- offentlig kundelenke
- tilbuds-PDF
- akseptbevis

### 7.3 Single-copy import

Gjeldende importmodell er single-copy for å unngå dobbel full katalog og unødvendig disk/WAL-belastning.

```text
Systemadmin starter import
→ søk låses
→ TXT parses lokalt
→ gyldige batcher skrives kontrollert
→ liten aktivering
→ søk åpnes
```

Historiske publiserte/aksepterte tilbud endres ikke av ny ERP-prisfil.

### 7.4 Vareidentitet

Primær vareidentitet er leverandør + leverandørens varenummer.

Leverandøralternativer kobles via samme normaliserte GTIN/EAN. Varenummer alene brukes ikke på tvers av leverandører.

### 7.5 Mobil Prissøk og strekkodeskanning

`← Startside` vises i mobil Prissøk og bruker eksisterende `closePriceSearch({ clearResume: true })` før appens ordinære Startside-navigasjon. Bevisst avslutning rydder recovery-markøren. Ved reelt appbytte/dvale kan aktivt Prissøk gjenopprettes; den midlertidige arbeidslisten beholder kun vare-ID/oppslagsnøkler i samme fanes `sessionStorage`, og priser hentes på nytt fra backend.

`Skann strekkode` vises bare på mobil. Skannerkomponenten og ZXing lastes ved behov, foretrekker bakre kamera og setter avlest EAN/GTIN i eksisterende søkefelt. Søket går gjennom de eksisterende read-only RPC-ene; ingen kamerabilder eller videodata lagres eller lastes opp. Videosporet stoppes ved treff, avbrudd, navigasjon, bakgrunning, unmount og sent innvilget kameratillatelse etter at skanneren er lukket. Manuell EAN-inntasting er fallback ved manglende kameratilgang. Desktop-visningen og serverens maskering av interne nettoprisfelter er uendret.

Interne brukere kan opprette og redigere høyst tre plukklister per bruker på både PC og mobil via de samme avgrensede RPC-ene. Listene inneholder vareidentitet, antall og valgfritt manuelt Cordel-ordrenummer, men ingen priser eller kameradata; de kan åpnes på begge enheter og slettes av eieren. Antall, ordrenummer og serversave vises også for en ny PC-kladd. Utskriftsmodus er separat fra redigeringsflaten: **Skriv ut plukkliste** skjuler alle priser og viser antall/ordrenummer, mens **Skriv ut priser** på PC beholder prisdokumentet og eksplisitt internprisvalg. React oppdaterer valgt dokument synkront før native utskrift, slik at bytte mellom de to aldri skriver ut forrige dokumenttype. Mobilskanning i Generelt tilbud gjenbruker skanneren og fyller søket for aktuell post/opsjon, mens varevalget fortsatt er bevisst. Serverkontroll av firmascope, katalogtilgang og prisvisning gjelder uendret. Se [plukklister og skanning i Generelt tilbud](MOBILE_PICKLIST_AND_GENERAL_OFFER_SCAN.md) for datamodell, revisjonsvern og tilgangsvilkår.

## 8. Modul-/rolle-tilgang

Modultilganger skiller blant annet:

- `projects`
- `sales`
- `store_offers`

Systemadministrator har tverrfirma-support, men dette er ikke en generell skrive-bypass.

Firmaadministrator kan delegere øvrige moduler innenfor eget firma og egne tillatelser. Generelle tilbud/katalog aktiveres samlet på firmaet av Systemadministrator og følger egne serverkontroller. Firmaadministrator kan ikke aktivere Proff for firmaet, endre leverandørrabatter eller selvtildele «Din nto pris», men kan styre prisinnsyn for andre brukere i firmaet.

Katalogimport er strengere enn ordinær Butikktilbud-bruk: systemadministrator-only.

### 8A. Arbeidsprofiler, representasjon og systemadmin-scope – Fase 41B / 42G / 42K

Aktiv arbeidsprofil lagres server-side. Vanlige flerfirma-brukere arbeider i valgt firma. Systemadministrator kan velge hvilket firma vedkommende **representerer**, uten at dette oppretter ordinært firmamedlemskap.

Ved ny prosjektinnsetting setter `projects_sync_company_scope_id` aktivt `company_scope_id` og autoritativt firmasnapshot i en `BEFORE INSERT`-trigger. Dette skjer før `projects_insert_scoped_authenticated` kontrollerer samme scope i RLS. Klienten sender fortsatt eierens `user_id`, men kan ikke velge et vilkårlig firmascope. Triggeren er versjonert og idempotent slik at Production og permanent demo-sandbox beholder samme grunnkontrakt.

Systemadministrator har fortsatt brede serverrettigheter for legitim administrasjon/support, men den vanlige prosjektflaten skal være låst til valgt representert firma. Fra Fase 42G installeres `systemAdminProjectScopeGuard.js` før app-bootstrap. For systemadministrator legges aktiv `company_scope_id` på prosjekt-REST for lesing og eksisterende endringer/sletting. Dersom systemadministrator ikke har aktivt firma, brukes et tomt/umulig scope i stedet for å vise alle prosjekter.

Dette er et ekstra klientsikkerhetsnett, ikke erstatning for RLS. RLS/RPC/server forblir autoritativ sikkerhetsgrense. Produktretningen er at tverrfirmaarbeid skal skje ved eksplisitt valg av firma/supportkontekst, ikke ved at prosjekter fra flere firma blandes i ordinær prosjektliste.

Sales-recovery aktiveres bare når den markerte hovedarbeidsflaten for Befaring/Tilbud faktisk er montert. Kontraktveiviseren gjenbruker Sales-visuelle komponenter inne i Prosjekt, men skal ikke kunne armere en Sales-retur som overstyrer `tab=tilbud`/Avtalegrunnlag etter kundesignering eller oppfriskning.

Prosjektets sky-autolagring henter autoritativ rad før skriving og stopper før `PATCH` når normalisert `data` og tittel er uendret. Dermed skal ren visning, kontraktstatusinnlasting og oppfriskning ikke flytte `projects.updated_at`; en skriveoperasjon utføres bare når faktisk prosjektinnhold eller tittel er endret. Etter en bekreftet skriving tømmes lokal kladd og dirty-status bare dersom det lagrede snapshotet fortsatt matcher siste klienttilstand. En eldre nettverksrespons kan derfor verken skjule nyere endringer eller utløse falsk «ulagret»-popup etter vellykket autolagring.

`warranty_registry` bruker to server-side `BEFORE`-triggere. Den første slår opp prosjektets autoritative `company_scope_id`, kontrollerer prosjekttilgang og setter scope før `NOT NULL`/RLS. Den andre krever at prosjektets Avtalegrunnlag inneholder et kontraktdokument før garanti kan registreres. Den idempotente parity-migrasjonen gjenoppretter disse eksisterende Production-vernene i eldre Sandbox-baselines; klienten får ikke sette firmascope selv.

Prosjektets arkivlås utføres av SECURITY DEFINER-RPC-en `set_project_lock`. RPC-en krever innlogget bruker, gjenbruker `project_row_access_allowed`, og oppdaterer `locked`, `locked_at`, `locked_by` samt de tilsvarende verdiene i `projects.data.project` i én transaksjon. Sandbox-parity-migrasjonen gjenoppretter Production-RPC-en uten å endre eksisterende prosjektrader.

Kritisk regresjonstest:

```text
Systemadmin primærfirma Ringside
→ velg «Representerer Expo Proffsenter»
→ ordinær prosjektflate viser/åpner bare Expo Proffsenter-prosjekter
→ Ringside-prosjekt krever eksplisitt firmabytte
```

## 9. Publisering, kundelenke og aksept

Publiserte Sales-versjoner er snapshots. En senere kladd eller katalogpris kan ikke endre en publisert versjon.

Offentlig tilbudslenke bruker høyt entropisk `publicOffer`-token og serveroppslag.

Kundevisning for Generelt tilbud viser avsnitt/poster, montering, opsjoner og priser inkl. mva. Forhåndsvisning bruker samme struktur, men er read-only og tillater ikke publisering, e-post eller faktisk aksept/avvisning.

Tilbuds-PDF og akseptbevis bruker samme seksjonsdeteksjon for å unngå `0 kr`-avsnitt og feil nummerering.

## 10. Automatisk oppfølging – Butikktilbud

FASE 37A2 er fortsatt egen, versjonslåst oppfølgingsmekanisme for Butikktilbud.

- ordinære tilbud følges manuelt
- Butikktilbud kan ha automatisk plan
- planen låses til publisert versjon
- aksept/avvisning/utløp/arkiv eller ny gjeldende versjon stopper gammel plan

Denne mekanismen er sensitiv/frozen med mindre endring er eksplisitt bestilt.

## 11. Kontrakt og akseptvarsling

Ordinær Sales-aksept kan gå videre til Expo-kontrakt eller ekstern kontrakt. Etter prosjektaktivering kan en manglende Expo-kontrakt opprettes direkte fra Avtalegrunnlag med samme låste aksept og samme kontraktmotor. Signert slutt-PDF er privat historikk og synkroniseres tilbake til prosjektets Avtalegrunnlag.

Kontraktfunksjonen finnes gjennom blant annet `SalesContractWizard`, `SalesContractActions`, `SalesContractCustomerView` og kontraktdokumentkomponentene. Prosjektinngangen er et tynt adapterlag og skal ikke forgrene eller kopiere kontraktmotoren.

Akseptvarsling er et etterfølgende sideutfall; lagret aksept kan ikke reverseres av e-postfeil.

Viktige serverkomponenter inkluderer:

```text
accept_sales_offer(...)
sales-offer-acceptance-notify
sales_offer_acceptance_notifications
create_sales_contract(...)
sign_sales_contract_company(...)
sign_sales_contract_customer(...)
```

## 12. Fremdriftsplan – Fase 35A–35C

Fremdriftsplan lagres separat i `public.project_progress_plans` og ligger ikke inne i `projects.data`.

```text
projects.id
  1 ── 1 project_progress_plans.project_id
```

Planen er operativ prosjektdata og skriver aldri tilbake til tilbud, aksept eller kontrakt.

Et akseptert ordinært tilbud kan brukes som **forslag** til arbeidsoperasjoner. Kun valgte opsjoner tas med. Direkte prosjekter uten Sales-opphav bygger planen manuelt.

### 12.1 Arbeidsøkter

Aktiviteter kan ha flere arbeidsøkter med dato, klokkeslett og merknad. Standard ny aktivitet får første økt i valgt/synlig uke, normalt `08:00–16:00`.

### 12.2 Gantt / PDF / kalender

Eksport leser lagret plan:

- Gantt/PDF er utskrift/read-only
- `.ics` er enveis kalender-eksport
- kalenderdata skriver ikke tilbake til Expo ProffDok

### 12.3 Prosjektinvolverte og prosjektmail

Prosjektinvolverte lagres separat i `project_participants`. `project_participant_notices` brukes til varsling/sporbarhet.

Edge Function `project-participants-mailer` validerer prosjekt- og mottakertilgang server-side.

## 13. Kunde-/UE-portal

Kunde og UE får tilgang gjennom serververifisert portalgrunnlag/koder og ikke ved direkte tabelltilgang.

Kunde kan bare se fremdriftsplan når `customer_visible = true`. UE er read-only der relevant.

Private dokumenter og kundelenker må fortsatt respektere eksisterende sikker Storage-/tokenflyt.

Enkel ordre skal ikke ha kundeportal. Servertrigger/RPC-regler blokkerer og tilbakekaller kundeportal dersom et prosjekt er markert som Enkel ordre. UE kan fortsatt brukes der det er relevant.

## 14. Garanti

Dokumentert tetthetsgaranti krever blant annet:

- riktig Sopro-system
- fullførte relevante sjekklister/bilder
- ingen åpne avvik
- overtagelse/signaturer
- signert kontrakt i Avtalegrunnlag når garanti skal utstedes

Historiske utstedte garantier og låste prosjekter skal ikke endres av produktmaster eller senere systemendringer.

Endelig garantiflyt er: registrert og signert overtagelse, utstedt garanti, komplett PDF kontrollert/arkivert og deretter prosjektlås. Rapportgeneratoren bruker `warrantyReadiness.termsAccepted` som effektiv fallback når signert overtagelse allerede gjør vilkårene bekreftet i brukerflaten, og stempler alle rapportsider med samme starttidspunkt for den aktuelle PDF-kjøringen.

## 15. Systemadministrasjon

Systemadmin er kontrollsenter for:

- bruker-/firmagodkjenning
- eksplisitt firma-/supportkontekst for tverrfirmaarbeid
- modul-/rollehåndtering
- produktmaster
- appnyheter
- felles e-post til en eksplisitt valgt brukergruppe
- **internt ERP-vareregister**

Systemadmin skal ikke bruke brede rolleprivilegier som normal prosjektflate på tvers av firma. Før prosjektarbeid/support velges riktig representert firma. For vareregister skal Systemadmin vise import/status/kontrolltall og være eneste sted for prisoppdatering.

Fase 42K krever Firma ved godkjenning av nye brukere og beskytter interne tilganger ved firmabytte.

Den samlede Systemadmin-flaten bygger fortsatt på enkelte legacy-brukerkort med nyere React-kontroller. Etter endring i firma, bruker, modul, arbeidsprofil, prisinnsyn eller Proff-leverandør skal alle projeksjonslag hente autoritativt snapshot på et felles ferdigsignal som sendes etter bekreftet serveroperasjon. Klikk-timere eller nettleserfokus skal ikke brukes som sannhetskilde for om en lagring er ferdig.

Felles e-post bruker `systemadmin-broadcast-email` og Resends batch-endepunkt med ett separat brev per mottaker. Nettleseren får bare mottakertall, aldri den samlede adresselisten eller Resend-nøkkelen. Serveren kontrollerer aktiv `systemadmin`-rolle, krever ny mottakerkontroll og testutsending før klienten tilbyr endelig sending, og bruker både kampanje-ID og Resend-idempotens for å hindre dobbeltutsending.

Datagrensen består av:

- `marketing_email_preferences`: gjeldende frivillig samtykke og serverbeskyttet avmeldingstoken
- `marketing_email_preference_events`: sporbar samtykke-/avmeldingshistorikk
- `systemadmin_email_campaigns`: auditstatus og tellere, uten direkte klienttilgang
- `get_my_marketing_email_preference` / `set_my_marketing_email_preference`: eneste autentiserte klientflate for eget e-postvalg
- `marketing-email-unsubscribe`: offentlig tokenbasert bekreftelse; GET viser valg og POST utfører avmelding

Driftsmelding er kun nødvendig tjenesteinformasjon. Nyheter, tips, tilbud og kampanjer er markedsføring og filtreres alltid mot aktivt samtykke, uansett hvilken brukergruppe Systemadmin velger.

## 16. HJELP

Digital Hjelp er gjeldende brukerveiledning og skal følge rolle.

Gjeldende sentrale temaer inkluderer:

- ordinær Befaring/Tilbud, Forespørsler-kø og recovery
- PC-fanebytte/mobil appbytte mens kundeinformasjon fylles ut
- Badskisse i befaring
- Butikktilbud som eget tema ved Befaring/Tilbud
- Proff vareregister, «Din nto pris», Generelt tilbud og Enkel ordre
- prosjektets kollapsede desktopmeny og hurtigvalg
- tilbudsposter og avsnitt
- vareregister som valgfritt oppslag
- montering/opsjoner
- autosave/recovery
- Systemadmin-ERP-import og sikkerhetsgrense
- arbeidsprofil/representert firma der rollen har flere firma
- brukerens frivillige e-postvalg og Systemadmins sikre skille mellom driftsmelding og markedsføring

Hjelp skal beskrive gjeldende funksjon, ikke historisk changelog.

## 17. Kritiske build-sperrer

`npm run build` kjører før Vite blant annet:

```text
scripts/critical-pr-scope-guard.mjs --self-test
scripts/critical-build-check.mjs
scripts/critical-systemadmin-broadcast-email-check.mjs
scripts/critical-bathroom-sketch-check.mjs
scripts/critical-sales-recovery-check.mjs
scripts/critical-sales-tab-resume-check.mjs
scripts/critical-sales-entry-resume-check.mjs
scripts/critical-sales-server-hydration-check.mjs
scripts/critical-sales-lazy-loading-check.mjs
scripts/critical-project-navigation-check.mjs
scripts/critical-progress-plan-check.mjs
scripts/critical-store-catalog-check.mjs
scripts/critical-work-profile-check.mjs
```

Disse beskytter kjente kontrakter som:

- Sales recovery og regelen «brukerhandling vinner»
- Ny/Rediger forespørsel ved PC-fanebytte og mobil appbytte
- Sales lazy loading og komplett detaljhydrering før editor
- befaringsmedia/Badskisse der dette inngår i recovery-testene
- prosjektets kollapsede desktopmeny/hurtigvalg
- fremdriftsplanens tilbudsimport/standardoperasjoner/kalender
- katalogsikkerhet og Butikktilbud-seksjonspresentasjon
- arbeidsprofiler, systemadmin-representasjon og 42G/42K prosjekt-scope
- PR-isolasjon slik at Demo/Test ikke samtidig endrer beskyttet appkjerne

Build-sperrer erstatter ikke Preview-test, men skal stoppe kjente regresjoner før deploy.

### 17.1 PR Core Safety

GitHub workflow `PR Core Safety` kjører på PR-er mot `main`. Dersom en PR inneholder Demo/Test-markører, skal den feile dersom samme diff også endrer beskyttet Sales-/app-/backendkjerne. Reell core-endring skal da splittes i egen PR fra ren `main`.

## 18. Preview-sikkerhet

Vercel Preview brukes for eksplisitt test før merge.

Prosjekt-/fremdriftsfunksjoner har egen Preview-sikkerhet som kan blokkere produksjonsmail/testdata der det er nødvendig.

Clean Fase 45B-Preview skal bindes eksplisitt til Sandbox Supabase `demo-sandbox`, aldri Production. Builden skal feile lukket ved feil branch-/miljøbinding. Preview-test bruker faste Sandbox-saker og skal ikke publisere eller sende e-post når kundepreview verifiseres.

`progressTest=safe` er Preview-sikkerhetsparameter og er ikke en del av endelig produksjonskundelenke.

### 18.1 Demo Sandbox er ikke ordinær Preview

Permanent Demo Sandbox bruker separat backend og er fysisk isolert fra Production. Den skal derfor ikke behandles som en tilfeldig Vercel Preview. Demo-builden har egen sandbox-binding, Golden/reset og fast branch-host.

Sandboxens migrasjonshistorikk inneholder en egen demo-/kursbaseline og er ikke samme lineære historikk som Production. `demo-sandbox` skal derfor aldri merges til Production gjennom Supabase branch-merge. Godkjente Production-migrasjoner kjøres fra den versjonerte, `main`-baserte releasekoden og verifiseres separat.

Før viktig demo skal preflight bekrefte:

- branch `demo`
- riktig permanent host
- sandbox-Supabase i emitted JS og ingen Production-binding
- fungerende `/demo-control.html`
- forventede demosaker/Golden
- kundetilbud før aksept og akseptert kundevisning
- rapport/PDF dersom dette skal vises

## 19. Databasestørrelse og store payloads

Etter full ERP-import var målt database rundt 348–356 MB og katalog rundt 283 MB.

Sales har enkelte store historiske JSON-payloads, blant annet inline/base64-bilder. Fase 42I løser listeytelsen ved lett summary/lazy loading uten å endre historiske payloads. Fremtidig opprydding kan flytte nye tunge bilder til Storage, men eksisterende historikk skal ikke migreres tilfeldig.

## 20. Frosne/sensitive områder

Endres bare eksplisitt og med egen QA:

- auth/login-presentasjon
- kompakt desktop header/menu og prosjektveiviser
- arbeidsprofil-/systemadmin-scoping
- publiserte/aksepterte tilbud
- aksepterte kontrakter
- offentlige kundelenker/private dokumentlenker
- RLS utenfor eksplisitt avtalt arbeid
- Edge Functions
- Fase 37A2 automatisk Butikktilbud-oppfølging
- Sales recovery/hydration/lazy loading
- Badskisse/bevaringen av befaringsmedia ved recovery
- permanent Demo Sandbox-isolasjon og main → demo-synkretning

## 21. Utsatt videreutvikling / observasjoner fra demo 16.09.2026

- forbedre kontraktfunksjonens finnbarhet etter akseptert ordinært tilbud
- kvalitetsløft av rapport/PDF, særlig forside/hero, bildeinnbygging, sjekklistetelling og dokumentasjonsgrad
- NOBB/Byggtjeneste-berikelse via GTIN
- ERP-vareliste/PDF etter aksept gruppert på leverandør
- CSV/Excel-varebehov
- målrettet Storage-opprydding for fremtidige Sales-bilder
- kontrollert oppgradering av eldre **redigerbare** tilbudsutkast til ny versjon; publisert/akseptert historikk forblir immutable
- komplett null-til-miljø databasebaseline/migrasjonskjede slik at nye isolerte miljøer kan bygges deterministisk

Disse skal gjennomføres som egne runder med samme Preview-/mergepolicy.

## 22. Før merge

Minimum:

1. Alle kritiske checks grønne.
2. Vite build grønn.
3. Preview `READY`, ingen fatale runtime-feil.
4. Ordinær Befaring/Tilbud-liste åpner raskt og viser korrekte tellere fra summary-data.
5. Åpne minst én større Sales-sak og bekreft at komplett tilbud/bilder/Badskisse lastes først ved åpning.
6. Ny forespørsel: skriv delvis kundeinfo → bytt PC-fane eller mobilapp → gå tilbake → samme skjema og tekst skal stå.
7. Rediger forespørsel: samme app-/fanebytte-test med eksisterende sak.
8. Prosjekt: kontroller veiviser/hurtigvalg og full Meny på desktop; mobilmeny skal være uendret.
9. Systemadmin: bytt mellom minst to representerte firma og bekreft at prosjektliste/åpning følger valgt firma.
10. Direkte prosjektlenke til annet firma skal ikke åpnes i feil representasjonskontekst.
11. Butikktilbud: redigering, autosave, Tilbake og kundepreview kontrollert ved relevante endringer.
12. Arkitektur og relevante README/HJELP-filer samsvarer med faktisk implementasjon.
13. `PR Core Safety` er grønn når PR-en går mot `main`.
14. Eksplisitt bruker-`TEST OK` før merge.
15. Etter merge: Production verifisert. Ved miljømål `BEGGE` synkroniseres deretter gjeldende `main` kontrollert til `demo`, og sandbox-preflight skal være grønn.
16. Fase 45B: ekstern bruker ser bare godkjente leverandører; sensitive interne prisfelt lekker ikke; «Din nto pris» følger eksplisitt bruker-/firmascope.
17. Fase 45B: kundepreview åpnes i ny fane, originalfanen står på samme tilbud, og preview kan ikke publisere, sende e-post eller akseptere.
18. Fase 45B: akseptert Generelt tilbud kan velges som Enkel ordre eller ordinært prosjekt; Enkel ordre blokkerer kundeportal og bruker låst akseptert snapshot.
19. Etter godkjent merge og trippel Production-QA ryddes midlertidige brancher. GitHub skal ende med `main` + `demo`; Supabase med Production/default + `demo-sandbox`.


### Cordel: importvalg og brukertilgang (05.10.2026)

Samme eksport beholdes for våtromstilbud og generelle tilbud. AFG kan importeres alene uten jobbliste, med ønsket ordremetode. Ved bruk av jobbliste må jobblistefilen importeres først, med tilsvarende jobblisteoppsett i Cordel, deretter AFG uten sletting. 0 % materiellpåslag og øreavrunding kreves for å beholde akseptert pris også ved AFG alene. Den bekreftede Cordel-testen gjelder den kombinerte flyten; AFG alene med andre metoder må kontrolleres hos mottaker. Prisposter er fortsatt Rundsum; faktisk timebudsjett og kildekost følger ikke med.

Systemadmin → bruker → **Eksport til Cordel** styrer tilbudseksport, plukklisteeksport og det spesifikke Hjelp-temaet samlet. Godkjent, aktiv Systemadmin har automatisk tilgang; andre brukere må få den eksplisitt. Firmaadmin kan ikke tildele den. Grantet bindes til brukerens firma; firmabytte krever ny tildeling. Eksisterende datatilgang og pristilganger gjelder i tillegg. `cordel_export_user_access` er RLS-beskyttet uten direkte klientrettigheter; avgrensede RPC-er leser egen tilgang og lar kun Systemadmin administrere. UI feiler lukket og sjekker tilgang på nytt før nedlasting.

## Firmaavgrensede kundeprofiler og tilbudets mva.-visning

Ny separat `company_customer_profiles` med serveravledet aktivt firmascope, godkjent profil/membership, RLS uten direkte klienttilgang og begrensede search/save RPC-er. Kunderegistrering er eksplisitt opt-in. Lagret profil kopieres ved bevisst valg til eksisterende kunde-/prosjektskjema; historiske prosjekter/tilbud er snapshots. Optimistisk revisjonsvern og expected-company guard beskytter samtidige endringer/profilbytte. Ingen automatisk import av tidligere kunder.

Avtalte integrasjonspunkter: SalesRequestForm og prosjektets kundedata i main.jsx. Endringen i main begrenses til én eksisterende kundedataflate; navigasjon/bootstrap/recovery røres ikke. Mva.-valg lagres med offer draft, og fryses som boolean `showPricesExVat` i eksisterende terms-metadata i versjonslinjene. Prisberegning og aksept er fortsatt eks. mva.; presentasjon velger multiplier 1 eller 1.25, inkl. store-alternativer som lagres inkl. mva. Public/accepted metadata har forrang fremfor kladd. Default for eldre versjoner er inkl. mva.

Mva.-valget i Generelt tilbud er integrert i `SalesStoreOfferBuilderGrouped` via eksisterende katalog/router-wrappere. Kladdforhåndsvisning bygger snapshot av nåværende formvalg; permanent render-QA verifiserer den faktiske routeren og begge prisvisninger.

CompanyCustomerProvider deler eksisterende firmascope, valgt profil og revisjonsvern mellom Search øverst og Save nederst i SalesRequestForm. Prosjekt bruker samme komponent sammensatt. Dropdown og søk bruker samme avgrensede RPC; maks 30 treff, presiserende søk finner øvrige kunder. Ingen endring i serverrettigheter eller automatisk lagring.
# KS/HMS – integrert domene, trinn A (2026-10-05)

Ny modul under `src/modules/kshms` kobles til eksisterende globale navigasjon og appens ene Supabase-klient. Eksisterende prosjekt-/salg-/rapportflyter beholdes. Miljømål er BEGGE; første feature-Preview bruker Sandbox. [Planen](../kshms/PLAN.md) fastsetter full dekning, gjeldende krav, gjenbruk, tilgang, personvern og resterende trinn.

Firmagrensen er `sales_company_scopes` med aktivt medlemskap, ikke legacy profil-/prosjektfirma. `company_module_access` utvides med `kshms`, mens `kshms_member_access` gir internt firmagrant. Systemadmin kan aktivere firma, men får ikke automatisk innholdsinnsyn. Firmaadmin utledes av aktivt medlemskap. Alle utsatte tabeller har RLS uten direkte API-privilegier; smale security-definer RPC-er med tom `search_path` utfører eksplisitt auth-, firma-, modul- og rollekontroll via ikke-eksponert `kshms_private`. Anonyme kall og direkte tabelltilgang avvises.

`kshms_settings` lagrer flerfaglig oppstart/utpekt ansvarlig/neste revisjon. `kshms_routines` har revisjonskontrollert kladd og arkiveringsstatus; `kshms_versions` lagrer uforanderlig publisert innhold, kildekontroll, godkjenner, tidspunkt og SHA-256. `kshms_assignments` og `kshms_acknowledgments` knytter bruker og nøyaktig versjon. `kshms_reviews` fryser gjeldende versjons-ID-er/hash og signert revisjonsnotat. Trigger hindrer omskriving av publiserte og signerte poster; minimal audit følger mutasjoner. Nye/vesentlige versjoner har egen bekreftelse; tidligere poster beholdes. Sentrale forslag tas manuelt felt for felt inn i kladd og krever ny firmagodkjenning.

React-komponenten beholdes montert ved vanlig appfanebytte; ordinær rutinekladd sikres lokalt per bruker/firma først ved faktisk redigering. Server leses før lokal gjenoppretting tilbys, og gjenoppretting er et bevisst valg med opprinnelig revisjonsnummer. KS/HMS følger eksisterende Sales `syncWorkProfileScope`-prinsipp: gjenpublisering av samme arbeidsfirma ved nettleserfokus beholder kontekst, montert visning og ulagrede felt. Et reelt profilbytte, manglende firmascope eller egen/uavgrenset administrert tilgangsendring nuller tilgang; gamle skrivekall får forventet firma og kan ikke krysse kontekst. Ingen egen authklient eller automatisk tom kladd skriver til server. Lokalt innhold er bare felles håndboktekst; individuelle HR-data er utenfor denne komponenten.

Trinn A har ingen filopplasting, betalingssystem, eksterne utsendinger eller individuelle personaldokumenter. Eksisterende offentlige bilde-buckets skal ikke brukes for senere sensitive KS/HR-filer. B/C/D bygger versjonerte maler/gjennomføringer/SJA/risiko, én samlet avvikssentral, varsler/PDF/avgrenset deling og separate HR-/SDS-domener. [Dekningsoversikten](../kshms/COVERAGE.md) beholder alle originale temaer, også VVS og historisk stoff. Årlig revisjon og 5×5 er produktvalg, ikke en generell lovpåstand.

Firmaadmin kan utpeke seg selv eller en annen aktiv firmaadmin som KS/HMS-ansvarlig uten en ekstra modultildeling. Andre interne medarbeidere krever fortsatt aktivt `responsible`-grant. Serverens `responsible`-rettighet krever eksakt utpeking i gjeldende firmas oppstart; adminstatus alene gir ikke revisjonssignering. `20261005212145_kshms_firmaadmin_appointment.sql` oppdaterer kun disse eksisterende funksjonene, uten nye tabeller eller automatisk grant/aktivering.

`KshmsRoutineLibrary` skiller avkrysning/lesing av standardutkast fra faktisk innlegging og redigering. Valgte kildenøkler ligger i modulens eksisterende monterte arbeidsflate; filter- og fanebytte åpner ikke en ny editor. «Disse rutinene legges inn» viser hele utvalget. `addLibraryRoutines` leser fersk firma-/rollekontrollert serverstate og bruker eksisterende `kshms_command/save` for hver manglende aktiv `source_key`. Ingen ny tabell, tilgangsmodell eller parallell rutineflyt innføres. Historikk og selskapets tilpasninger beholdes. Kopiering er fortsatt en eksplisitt separat handling.

Innleggingen er flere enkeltlagringer, ikke en atomisk transaksjon. Ved delvis nettfeil leses serveren igjen; bekreftede rutiner vises som lagrede utkast, mens resten forblir valgt for nytt forsøk. Fersk lesing før retry håndterer også tapt svar etter faktisk lagring. Modulen stopper videre kommandoer og UI-oppdateringer når arbeidsflaten unmountes eller dens tilgangskontekst endres. Dette er ikke en generell servergaranti mot samtidige innlegginger fra to administratorer. Innlegging beholder en åpen ulagret editor og publiserer eller tildeler ikke rutinene; eksisterende godkjennings-/versjonsflyt gjelder. Faneretur bruker den tidligere Sales-baserte rettelsen uten ny recovery-mekanisme.

Brukerveiledningen i de fire fanene og i redigering/godkjenning bruker korte handlingsbeskrivelser og angir neste steg. Begrepene utkast, versjon og revisjon forklares; feltets skrivehjelp knyttes til input med eksisterende `aria-describedby`. Backend-verdier, roller, rutineinnhold og selve signatur-/bekreftelsesgrunnlaget endres ikke av språkforenklingen. Hjelp bruker samme handlings- og knappnavn. `USER_TEST.md` og AGENTS fastsetter konkret handling/forventet resultat ved videre leveranser.

Vanlig brukerprøve følger én fast branch-alias hos Vercel. Nye deployer erstatter kode bak samme origin; appens registrerte Supabase-klient beholder eksisterende auth-oppsett med `persistSession` og tokenoppfriskning. En annen host/nettleser har ikke automatisk samme lokale økt. Den innloggede øktens varighet er ikke verifisert av syntetisk komponent-QA, og det innføres ingen deling av authdata mellom Preview-domener.

Godkjenningsåpning følger editorens eksisterende eksplisitte fokus-/scroll-prinsipp med ref og handlingsnummer. Hvert klikk på **Åpne godkjenning** viser riktig panel, også når samme rutine allerede er valgt. Samme rutine beholder vurderingsteksten; en annen rutine starter med tom vurdering. Selve publiseringen bruker uendret `kshms_command/publish`, forventet rutinerevisjon og eksisterende krav om minst fem tegn. Manglende vurdering, fremdrift og serverfeil vises ved panelet. Etter bekreftet publisering åpnes neste gjenstående godkjenning med tom vurdering; etter den siste fokuseres fullføringskortet nederst. Fokusrettelsen endrer ikke auth, global navigasjon eller signeringsgrunnlaget. Rolleendringen beskrevet nedenfor er en separat, uttrykkelig produkteierbeslutning.

Rollebeslutning 2026-10-06: `context.publish` gjelder firmaadmin eller aktivt internt `responsible`-grant. Ny serveravledet `context.administer` gjelder bare firmaadmin. `kshms_command` krever publish for publisering og administer for ansattes grant/arkivering; utpeking i oppstart krever fortsatt administer. Oppfølging/tildeling til allerede kvalifiserte interne medarbeidere følger eksisterende manage-rettighet. Revisjonssignering krever eksakt utpeking. Migrasjonen `20261005225124_kshms_responsible_publication.sql` oppdaterer bare eksisterende funksjoner og er først anvendt på Sandbox. Tabellenes ACL/RLS, signerte poster, aktive firmaskope, UE-avslag og betalt modulgate beholdes. Ansattens initiale KS/HMS-visning er reading, uten managerverktøy eller andre ansattes status.

## Veiledet håndbokflyt (2026-10-06)

Første manager-visning uten lagret oppstart er setup; med lagret oppstart er den handbook. Initialisering skjer én gang per firmabundet mount, uten ny fokus-/auth-/recovery-mekanisme. Oppstart har utpeking først og tilbyr alle interne, godkjente, ikke-deaktiverte medlemmer fra eksisterende manager-RPC. Firmaadminens lagring setter ved behov eksisterende `kshms_command/access` til responsible før `settings`. Ved settings-feil beholdes lokalt oppsett og det forklares at granten kan være gitt. Tilgangsevent sendes etter vellykket lagret oppstart. Ingen ny tabell, funksjonsmigrasjon eller serverrettighet innføres.

`routineApprovalState` sammenlikner lagret kladd med høyeste publiserte rutineversjon. JSON-objektenes nøkkelrekkefølge normaliseres; tekst, arrayrekkefølge og referanser er betydningsfulle. Dette er kun UI-status, ikke en erstatning for serverens hash/signaturkontroll. `handbookProgress` utleder oppstart → valg → gjenstående godkjenninger → ansattes gjennomgang fra serverstate. Arkiverte rutiner inngår ikke i antallet. En trukket ansvarlig-grant gjør oppstart ufullført. Ulagret editor stopper neste/publisering. Etter lagret endring åpnes eksisterende godkjenningspanel; uendret lagring krever ingen ny versjon i UI.

Firmaets rutiner er hovedlisten, og biblioteket ligger under «Legg til flere rutiner». Lagrede bibliotekrutiner har tekststatus og redigeringsknapp, uten avkrysning som kan forveksles med godkjenning. Neste-knapper bruker samme ref-/fokus-/scroll-prinsipp som redigering og godkjenning. Når alle valgte aktive rutiner er godkjent, vises «Neste: Ansattes gjennomgang» både øverst og nederst og åpner eksisterende oppfølging. Det gjelder også håndbøker som allerede var fullført før oppdateringen. Publisering tildeler til allerede kvalifiserte brukere; nyansatte kan få eksisterende versjoner med assign etter at firmaadmin har gitt tilgang. Ingen varsler eller e-post simuleres som sendt.

Automatisk fremdrift bruker fersk, autorisert state fra den eksisterende `run`-handlingens kommando og påfølgende `load`. En valgfri `onSaved`-callback endrer ikke eksisterende returverdier eller legger til serverkall. Samme aktive request-scope, firma og identitet må fortsatt gjelde; publisering krever fortsatt publish-rettighet. Neste godkjenning utledes av `handbookProgress`; neste lesing av `pendingReadingVersions`, kun egne tildelinger og egne eksakte bekreftelser. Informasjonsutgaver uten krav om ny bekreftelse åpnes ikke automatisk. Egen bekreftelse må finnes i den oppfriskede staten før fremdrift. Feil i kommando eller kontrolllesing beholder panel, vurdering eller avkrysning. Søket tømmes bare hvis det skjuler neste rutine. Ingen handler setter appfane etter et avventende kall; bevisst navigasjon og scopebytte vinner fortsatt.

`KshmsHandbookProgress` deler tekst, fremdrift og knapp mellom topp og bunn, uten duplisert liveannonsering. Godkjenningspanelet fjernes etter siste lagrede godkjenning. Lesepanelet har samme handlingsstyrte ref-/focus-/scroll-prinsipp; neste utgave starter med avslått avkrysning, og siste egen bekreftelse gir et fokusert «Du er ferdig med gjennomgangen»-kort. Hvert klikk publiserer eller bekrefter bare én rutineutgave med uendret identitet, ACK-tekst og versjonsgrunnlag. Ingen generell recovery, automatisk bekreftelse, database- eller tilgangsendring innføres.

Demomedarbeiderne for Expo Proffsenter er rene Sandbox-fixtures i eksisterende auth/profil/medlemsstruktur, med `.invalid`-adresser og ingen automatiske KS-grant. Seed, UI-harness og demo-overlay inngår ikke i feature/main-PR.

## Kompakt oppfølging per medarbeider (2026-10-06)

`kshmsFollowup` utleder oppfølging fra eksisterende, autorisert firmastate, bare når `context.manage` gjelder. `acknowledgmentOverview` grupperer tildelte påkrevde utgaver per bruker og kobler bekreftelser med eksakt bruker-/versjonspar. Første utgave og senere `requires_ack` følger eksisterende krav; informasjonsutgaver, ukjente versjoner og duplikatpar øker ikke antallet. Bekreftede utgaver med tidspunkt og ferdige medarbeidere beholdes. Map/Set-oppslag erstatter gjentatte søk uten ekstra serverlesing eller skriving.

`KshmsAcknowledgments` viser fremdrift, lokalt søk og native details per medarbeider. Komponenten har ingen bekreftelses- eller signeringshandling. `pendingAssignmentOptions` beholder eksisterende kvalifisering (aktiv modultilgang eller firmaadmin), men viser bare gjeldende utgaver som minst én kvalifisert bruker mangler. Eksisterende `assign`-kommando, busy-vern og tilgangskontroll brukes uendret; funksjonen gir ingen tilgang.

Ny tildeling og revisjon ligger i separate native details. Revisjonens eksisterende feltstate forblir montert og beholdes ved lukking/åpning og samme firmas faneretur. Dato, utpeking, signaturtekst, snapshot og revisjonspayload er uendret. Ansattes gjennomgang er neste steg etter publisering; revisjon innfører ingen ekstra fremdriftsport. Ingen auth-, nav-, database-, Storage-, rolle- eller betalt-tilgangsendring.

## Tekstforslag, søk og målrettet tilgangsoppdatering (2026-10-06)

`publishManagedAccessChange` har allerede source/userId/companyId. KS/HMS sender nå målmedlem og firma ved grantendring. `useKshmsAccess` beholder den monterte arbeidsflaten når hendelsen gjelder en annen bruker og sjekker serveren i bakgrunnen; egen eller uavgrenset hendelse nuller kontekst umiddelbart. Revision/racevern, feilavslag, reelt firmabytte og auth-identitetskontroll beholdes. Ingen ny global event, authklient eller recoverymekanisme.

`kshmsWriting` skiller redigerbar tekst fra rene UI-tips. Server leses først. Bare blanke oppstartsfelt fylles lokalt, og et ref-sett markerer urørte forslag som kan følge fagvalget. Egen redigering eller bevisst tømming tar feltet ut av settet; ikke-blank servertekst eies aldri av forslaget. Lagret settings tømmer settet. Ingen effekt skriver til server. Generell rutine med tekstforslag og eksisterende helt blank mal er separate bevisste valg. Tips kopieres aldri inn i draft/version; Content viser bare de eksisterende innholdsfeltene og referansene. Publiserte utgaver, hash og eksakte bekreftelser endres ikke ved sentral tekstoppdatering.

`kshmsSearch` filtrerer bare eksisterende autorisert state, med Unicode-/ordnormalisering og indeksert gruppering av versjoner. Manager kan finne kladd og gjeldende publisert tekst; ansatt får bare egne tildelte utgaver, aldri draft eller andres utgaver. Søk i katalogen beholder hele flervalget. Ingen nye serverkall, tabellprivilegier, HR-data eller firmabypass. Stor historikk må senere få smale lesemodeller, serverfiltrering og cursorpaginering, jf. [CAPACITY](../kshms/CAPACITY.md).

[Innholdsstatus](../kshms/CONTENT_STATUS.md) registrerer alle 125 kildereferanser. Dagens 12 utkast er delvis tekstgrunnlag og beviser ikke full innholdsdekning. A2 prioriterer full forfatting/kildevalidering. [PLAN](../kshms/PLAN.md) fastsetter B/C-avvik som en utvidelse av eksisterende sentral med intern aktiv bruker-ID, rettingsansvar/saksbehandling/kontrollert lukking, outbox/appoppgaver og entitlement ved hver levering. Tilsynseksport bruker manifest med eksakte versjoner og relevant utførelsesbevis. Support krever firmagodkjent, avgrenset, tidsbegrenset servergrant/audit; administrativ aktivering innebærer ikke innsyn, HR eller signering som annen bruker. Disse operative delene er fortsatt roadmap.


## Min personalhåndbok og eksplisitt egen gjennomgang (2026-10-06)

`KshmsPersonalHandbook` bruker eksisterende autorisert `get_state`, `Content` og firmabundet montert modul. `personalHandbook` filtrerer først egne eksakte assignment-par, også når managerens respons inneholder hele firmaet. Bare publiserte, tildelte utgaver fra riktig firma inngår; ingen managerkladd eller andres bekreftelser. Rutiner grupperes med siste tildelte utgave øverst, tidligere tildelte utgaver og eget tidspunkt som oppslagshistorikk. Bekreftelse fjerner ikke rutinen. Søket ligger i modulens eksisterende state og bevares ved samme firmas faneretur. En leser har personaloppslag og eksisterende Les og bekreft, uten managerfaner. Firmaadmin har samme personlige oppslag for egne tildelinger.

`KshmsVersionIdentity` viser firmagodkjenner og egen gjennomgang hver for seg med eksisterende aktør-ID, tidspunkt og eksakt utgave. `20261006141916_kshms_personal_handbook_identity.sql` legger til nullable `publisher_identity` på versjoner og `user_identity` på bekreftelser. Nye handlinger får et serveravledet, uforanderlig snapshot av bruker-ID, registrert navn og canonical auth-e-post (`source: account_at_action`). Navn fra kontometadata er en visningsetikett; tillatelse og faktisk aktør bestemmes fortsatt av `auth.uid()`, aktiv godkjent profil, internt firmamedlemskap, riktig arbeidsfirma, modulaktivering og eksisterende roller. Klientens navn, bruker-ID og tidspunkt kan ikke erstatte signeringsaktøren.

Den private security-invoker-helperen `identity_snapshot` har tom search_path og ingen PUBLIC/anon/authenticated-execute. Bare de eksisterende, autoriserte security-definer-RPC-ene bruker den. Leserresponsen inneholder nødvendige etiketter for godkjenneren på egne tildelte utgaver og egen bekreftelse, ikke en generell ansattliste eller full auth-metadata. Managerens eksisterende medlemsliste får et navn. Eksisterende poster backfilles aldri; get_state kan vise dagens kontonavn (`source: current_account`) for gamle null-snapshot, mens original bruker-ID, innhold, hash, tidspunkt og bekreftelse står urørt. Et nåværende kontonavn er ikke dokumentasjon på hvilket navn kontoen hadde ved den gamle handlingen. Nye snapshot beholder navnet ved senere kontoendring. Dette er minimal gjennomgangsidentitet, ikke individuell HR-data.

Publiseringspanelets valg om tidspunkt for egen bekreftelse sender `acknowledge_self: true` og eksakt eksisterende `ACK_STATEMENT` bare etter uttrykkelig egen avkrysning. Serverens eksisterende publish-kommando validerer boolsk valg og tekst før versjon opprettes. Firmagodkjenning, vanlige kvalifiserte tildelinger, egen versjonsbundet bekreftelse og audit lagres i samme transaksjon under eksisterende firma-/rutinesperrer. Manglende/ugyldig tekst avviser hele handlingen. Uten valget opprettes ingen egen bekreftelse. Bare innlogget publiserer får egen bekreftelse; andre ansatte må bekrefte selv. Både firmaadmin og aktiv KS/HMS-ansvarlig følger samme publish-rettighet.

Klienten kontrollerer både ny publisert utgave og eventuell egen bekreftelse i fersk state før den viser fullført eller går videre. Feil beholder vurdering og avkrysning, mens neste rutine starter uten egen avkrysning. Gamle bekreftelser og godkjenninger omskrives ikke; samme nye utgave trenger ingen ny egen bekreftelse. Egen bekreftelse uten publisering bruker fortsatt samme ack-kommando med eksakt statement og serveridentitet. ACL/RLS, aktivering, tilbakekallings-/scopevern, UE-avslag, versjonsimmutasjon og revisjonsregler består. Migrasjonen er anvendt bare på Sandbox; Production krever egen godkjenning. Ingen Storage-, betalings- eller e-postendring.

Felles HR-rutiner kan vises i personaloppslaget. Individuelle medarbeidersamtaler, kompetanse og oppfølging følger senere separat HR-domene/ACL/oppbevaringsvurdering; de innføres ikke som nye felles rutinefelt eller automatisk innsyn for KS-/firmaadminrollen.


Avklaring 2026-10-06 kl. 18:56 Europe/Oslo: Det er påkrevd å lese/bekrefte tildelte rutiner før arbeid etter firmaets arbeidsregel, også for firmaadmin/KS-HMS-ansvarlig. Valget i publiseringspanelet gjelder bare når egen påkrevd bekreftelse utføres. Uten samlet bekreftelse beholdes krav og manglende-status i Les og bekreft. Denne tekstpresiseringen endrer ingen handlers, requires_ack, personlige signeringskrav, RPC/RLS eller historiske poster. Regelen er et firmakrav, ikke en generell lovpåstand om signatur. Ledelsen følger opp etterlevelsen; A har ingen automatisk sperre av prosjektarbeid eller andre appmoduler. Et senere teknisk arbeidsadgangsvilkår må avgrenses eksplisitt mot arbeid, firma, aktivitet og tilgang før eksisterende prosjektflyter endres.

## A2: rutinebibliotek og serverstyrt Avvikssentral

A2 oppdatert 6. oktober 2026: Biblioteket har 73 egne forslag med sporbar dekning av alle 121 innholdstemaer + fire metadatarader fra kvalitetshåndboken (148 sider) og personalhåndboken (127 sider). Avvikssentral gir ansvarlig/frister, åpne/lukkede saker, tiltak/egen kontroll, private vedlegg og hendelseshistorikk. Bare valgt ansvarlig får fast varsel i interne faner og lukker selv. Prosjekt-/sjekkpunktavvik som kobles inn har serverbeskyttet status; ukoblet legacy-flyt består. 73 Sandbox-kontroller PASS med rollback; ingen ekte e-post eller produksjonsendring. Full-app-brukerprøve og e-postmottak gjenstår. Sandbox mangler RESEND_API_KEY og CHAT_FROM_EMAIL; utsending er derfor deaktivert. Gammel TEST OK for 6dfb74d dekker håndbokversjonen, ikke A2.

kshmsExtendedCatalog utvider 12 stabile nøkler til 73 forslag med egen fagtekst, kildetype/kontroll-dato og aktivitetstilpasset anbefaling. De ti grunnforslagene beholdes. Sentralt forslag omskriver aldri firmaets draft/version/ack; nye forslag legges bevisst inn som firmakladder. coverage.json/CSV og CONTENT_STATUS beholder alle kildesider og synlig samling/historisk håndtering.

KshmsDeviations leser status/søk/cursor, case/events og private vedlegg via smale RPC-er. Ordinary reader ser bare meldt/tildelt sak; manager ser firmaets saker. Hver handling krever aktivt modul/firma/medlemskap og kvalifisert intern ansvarlig. Bare aktuell ansvarlig kan lukke med dokumentert årsak/tiltak/egen kontroll og controlled=true. Firmaadmin kan omfordele/gjenåpne, ikke lukke en annens sak. Revisjoner hindrer stille overskriving; låseorden modul → prosjekt → case beskytter mot samtidige grant/statusendringer. Opprettelse har stabil request-ID. Uforanderlige events og identitet/snapshot følger handlingene.

Klienten installerer lukket case først etter command + fersk kontrollert detail. Feil beholder form/avkrysning, scopebundet lokal kladd og sist bekreftet oppgave. Cache valideres på user+firma, felttyper/revisjon/tid og sju dagers utløp. Serial/current-vern stopper sene lesinger. Vedlegg reserveres, lastes opp i privat bucket og vises etter kontrollert metadata-commit. Retry kan oppdage tapt opplastings-/commit-svar. Signerte leselenker varer 60 sekunder. Uferdig valgt vedlegg blokkerer lukking.

KshmsTasks monteres under eksisterende intern navigasjon med den samme verifiserte KS/HMS-konteksten og registrerte Supabase-klienten. Den leser kun auth-brukerens aktuelle åpne ansvar. Focus/visibility og 30 sekunders synlig polling oppfrisker; lesing skriver ingenting. Nettverksfeil beholder bekreftede tasks, 42501 rydder. Bekreftet case-event oppfrisker oppgaver og smal prosjekt-/sjekkpunktprojeksjon. Oppgavehopp følger eksisterende goToTab og respekterer avbrutt leave-confirm. goToTab returnerer boolsk resultat, uten ny recovery/autosave/hydrering.

Legacy-kobling krever lagret ulåst kilde; main stopper ved dirty/ventende/feilet prosjekt-/sjekkpunktlagring. Servertrigger håndhever koblet status og hindrer fjerning/omgåelse ved annen project-UPDATE. Klientkort tilbyr Åpne i KS/HMS på koblet case. Andre avvik og prosjektfelter beholder eksisterende flyt.

Outbox er unik per case/tildelingsnummer og opprettes atomisk med tildeling/gjenåpning. Privat postgres-cron → pg_net → Edge Function bruker et egen-generert Vault-token; cron-tekst har ikke hemmeligheter. Worker/service-RPC kontrollerer token/enabled, active membership/grant/ansvar/status og mottaker på hvert forsøk. Forsøksnummer fencer validate/finish; stabil Resend-idempotens/body gir retry uten ny oppgave. Etter ti forsøk/23 timer markeres failed. E-posten inneholder ikke sakstittel/hendelse/tiltak/vedlegg.

Hosted pg_net er eid av supabase_admin. REVOKE-forsøket i 20261006201244_kshms_worker_transport_privacy.sql hadde ingen effekt; dette er en verifisert plattformbegrensning, ikke oppnådd tabell-ACL-vern. Ingen bred rolle-/API-endring er gjort. Anon/authenticated er NOLOGIN, og net må holdes utenfor Data API. Worker v3 verifiserer faktisk schema-avslag (HTTP 406/PGRST106, null rader) før den behandler mail. Manglende/feilet eksponeringskontroll stopper sending. Databasetesten beskytter NOLOGIN, privat worker/settings og nødvendig postgres-cron-tilgang. Kun betrodde tjenester får direkte SQL-innlogging. Kildene er Supabases offisielle pg_net-/troubleshooting-dokumentasjon.

Autentisert helsekontroll på Sandbox: transport_safe=true, begge e-posthemmeligheter false. enabled er false. Appoppgaver virker uavhengig av e-postoppsettet. Se EMAIL_SETUP. Ingen Production-migrering, main-merge eller demo-synk. Tidligere sections er kontrollhistorikk for håndbokdelen.


## Prosjektsjekklistegjennomføringer – Preview 07.10.2026

ProjectChecklistWorkspace bruker eksisterende React-eide DeviationDialog og ChecklistEditor. Kladdnøkkel avgrenses av bruker, firma, prosjekt og kategori; Lagre/Fullført går gjennom project_checklist_command og kontrollert project_checklist_state-readback. Private project_checklist_runs har én kladd per kategori, revisjonskontroll, identitetssnapshot og uforanderlige fullføringer. project_checklist_receipts sikrer samme gjenforsøk etter tapt svar. Prosjektlåsen, aktivt firma, godkjent internt medlemskap og eksisterende prosjektrett kontrolleres server-side; egen KS/HMS-grant er ikke et krav for utfylling. Innlagte firmamaler beholder eksakt kildeutgave/krav. Projektsvarenes speil vernes mot forsinket vanlig autosave; eksisterende KS/HMS-avviksprojeksjon beholder autoritativ status. SQL- og React-kontroller samt faktisk desktopflyt er dokumentert i KS/HMS QA/CONTINUITY. Ingen produksjonsmigrering eller merge er utført.

## SJA/RUH – prosjektvalg og faste rutinenumre, 8. oktober 2026

ProjectSjaEntry er lazy SJA/RUH-inngang i Prosjektoversikt og avviksfane. createProjectWorkspaceTabs endrer bare avviksetiketten til Avvik/SJA/RUH ved verifisert personlig KS/HMS-kontekst; native fane-ID og navigasjonsflyt består. Direkte Opprett SJA og Registrer RUH binder lagret prosjekt-ID. KshmsJobChoices henter kshms_job_choices med scope-/serialvern og viser aktive, tilgjengelige public.projects samt siste gjeldende, godkjente og kvalifisert tildelte rutineutgave. Valg fyller ingen risikosvar. Referanse til rutine bevares som redigerbar tekst med fast R-nummer og versjon i eksisterende SJA-content / RUH-routines. Publisert rutineinnhold og signert SJA endres ikke.

kshms_routines.reference_number er unik og fast per firma, også ved arkivering, kopiering og nye utgaver; nummer tildeles under firmaavgrenset transaksjonssperre. kshms_get_state gir metadata også til leser, uten managerkladd. RUH bruker kshms_deviations.category=ruh, existing command/history/own-responsible closure/tasks/private files. source_kind=company sammen med faktisk project_id gir ny prosjektrapport uten å mutere legacy prosjekt-JSON. kshms_project_ruh_state krever eksisterende KS/HMS-/prosjekttilgang og filtrerer kategori, prosjekt, firma og sakstilgang før paginering. Eksterne prosjekt-/rutinereferanser er egne valgfrie tekstfelt. Lokal RUH-kladd kan avgrenses per prosjekt, med bakoverkompatibel global avvikskladd. Prosjektfirma kan ikke endres mens SJA/avvik/RUH er tilknyttet.

Additiv migrasjon 20261007224149_kshms_job_choices_routine_references_ruh er bare brukt i Sandbox. RPC-only ACL/RLS og låst-prosjektkontroll består. 93 rollback SQL-assertioner og faktiske React-handlerprøver er dokumentert i SJA_RUH_PROJECT_20261008.md. Ingen nye e-postutsendinger, HR-rettigheter, Production-DDL eller merge.

Meny-/datoretting 8. oktober 2026: isProjectDeviationNavLabel er felles kontrakt for desktopguide, bootstrap-snarvei og eksisterende workflowadapter. Den matcher både Avvik og Avvik/SJA/RUH med antall, og navigasjonen klikker fortsatt native kildeknapp. Bootstrap godtar også Ordreoversikt. KS/HMS-parentens eksisterende deviations-skjerm vises som Avvik/RUH. deviationDates.mjs formaterer kalenderfrist uten tidssonekonvertering og hendelsestid i Europe/Oslo; input-/lagringsverdier beholdes som ISO. Ingen backend-/tilgangsendring. NAV_RUH_DATE_20261008.md har faktisk DOM-/React-testbevis.


## KS/HMS – selvstendige kontroller og risiko (8. oktober 2026)

KshmsModule monterer Vernerunder/kontroller og Risikovurdering som separate, scope-keyed KshmsExecutions-flater som bevares ved interne fanebytter. Person/firma/type og dokument-ID avgrenser lokal kladd. Revisjon, fast request-ID ved retry, bekreftet command/detail og scope-vern beskytter mot overskriving og sene svar. Et uttrykkelig valg av serverutgave rydder den forkastede lokale kladden.

public.kshms_executions, kshms_execution_commands og kshms_execution_deviations har RLS og revokerte direkte klientgrants. kshms_execution_state/detail/command håndhever require_context, privat kladd, prosjektadgang og lås. Serveren krever at valgt ansvarlig fullfører selv. Fullførte rader, request-receipts, kildekoblinger og mal-snapshots er uforanderlige. Hvert avvik opprettes atomisk gjennom eksisterende kshms_deviation_command og stabil execution/point-kobling; ansvarligvarsel og egen lukking gjenbrukes. Ingen prosjekt-/portal-JSON writes eller ny e-posttransport.

Risiko valideres på klient og server: nivåer 1–5, begrunnet jobbgrunnlag og firmagrenser, medvirkning, ansvar/frist og forventet/kontrollert effekt. Aksept krever kontrollert effekt/dato og avviser høy residualscore. Ny kontroll/vurdering får ny ID med tomme svar og datoer; gammel dokumentasjon bevares. Kontrollbilder inngår i privat gjennomføring, ikke automatisk som avviksvedlegg. Prosjektrapportens godkjente uttrekk beholder SJA/RUH-omfang. Migrasjon/testbevis: docs/kshms/EXECUTIONS_20261008.md.

Prosjektinngangene i ProjectSjaEntry monterer også KshmsExecutions med fast projectId og egen lokal kladd per firma/bruker/type/prosjekt. kshms_project_execution_state filtrerer firma, prosjekt, dokumentadgang, type og status før paginering og krever eksisterende modul-/prosjekttilgang. Dialogen kontrollerer både svart kontekst og hver prosjektrad; låst prosjekt er lesbart og avviser skriving.

KshmsTasks beholder avviksvarslingen i DeviationTasks og monterer KshmsExecutionTasks for ansvarligs utkast. kshms_execution_tasks beregner ventende oppgaver fra eksisterende gjennomføringer, uten ny kø eller e-post. Mottaker uten prosjekttilgang får bare type/egen tildeling og beskjed om tilgang; innhold, prosjekt-ID og dato skjules. Lesing kvitterer ikke ut oppgaven. Bekreftet command/detail utløser expo:kshms:execution-change, og nettverksfeil beholder siste bekreftede varsel. Sene svar og revokert tilgang håndteres særskilt. Rutinevalg gjenbruker firmaets godkjente nummererte utgaver; egen fullføring har avkrysning og handling i samme feltgruppe. De to additivt anvendte Sandbox-migrasjonene er 20261008175102 og 20261008180504. Testbevis: docs/kshms/PROJECT_EXECUTIONS_20261008.md.

## KS/HMS ansvarse-post og bekreftet dialoglukking (2026-10-08)

Eksisterende outbox og service-only reserve/validate/fenced finish brukes for deviation, round, risk, sja, reading og review. En privat mottaker-/generasjonstabell stopper A→B→A og gamle forsøk uten å legge felt i signerte dokumenter eller rutineutgaver. Atomiske AFTER-triggere følger reelle serverlagringer; eksisterende uferdige appoppgaver får én køpost. Forfalt revisjon synkroniseres av eksisterende minuttworker, én tildeling per ansvar/dato. Deduplisering, minste e-postinnhold, medlems-/tilgangskontroll og adressefrysing gjelder alle typer. E-postlenker kan bare velge autoriserte lesinger. Ingen main.jsx-, global navigasjon-, autosave-, auth- eller portalendring. Sandbox-migrasjon 20261008192529 og mailer v4; sending er fortsatt av pga. manglende RESEND_API_KEY/CHAT_FROM_EMAIL. Dialogen lukker først etter autoritativ readback; listefeil kan ikke gjøre vellykket lagring til en feil. [Omfang og bevis](../kshms/NOTIFICATIONS_20261008.md).

## Kompakt prosjektoversikt (2026-10-08)

ProjectSjaEntry bruker fire sammenfoldede grupper, lazy montering og én åpen gruppe om gangen. Besøkte barn beholdes montert når gruppen skjules, slik at kladder/editorer ikke går tapt. projectDocumentOverview.mjs leser kun valgmetadata fra eksisterende kshms_project_report og kshms_project_execution_report parallelt: ingen nye kommandoer, tabeller eller migrasjoner. Metadata gjelder alle synlige valg, ikke bare den første siden. Bruker/firma/prosjekt kontrolleres; sene svar forkastes, nettverksfeil beholder sist bekreftede antall, 42501 rydder og sperrer. Oppdaterknapp, åpning av gruppe, focus/visibility og eksisterende avviks-/gjennomføringshendelser oppfrisker. SJA kan oppfriskes med knappen/ved ny gruppeåpning.

DeviationCenter pakker eksisterende kort i native details/summary med scopesatte nøkler. Grupper og rader starter lukket; åpne saker sorteres først i en kopi av listen. Handlerne og kildeorden er uendret. ProjectDeviationCreator åpner omsluttende details før eksisterende fokus/scroll på ny lagret legacy-sak. CSS er lokalt avgrenset. main.jsx, navigasjon, låser, prosjektlagring, report/PDF, SQL/RLS og e-post er uendret i denne runden. Faktisk React/DOM og gamle SJA/RUH-/gjennomføringsflyter kontrolleres; se PROJECT_OVERVIEW_20261008.md.

## Valgt samlet KS/HMS-uttrekk

`KshmsInspectionExtract.jsx` er en intern managerflate i KS/HMS. `kshmsInspectionExtract.mjs` samler eksplisitt valgte eksisterende read-RPC-snapshots og bruker de etablerte PDF-rendererne/rammene. Felles `readRuhPdfSnapshot` uttømmer paginert RUH-historikk i både egen og samlet PDF. Privat Storage download med eksisterende appklient; dobbel snapshotlesing, endelig tilgangskontroll og kontekst-/avmonteringsvern før save. Ingen ny backend, global navigasjon, skrivemodell, e-post eller HR. Katalog/listeside og 50-dokumentgrense samt originalfil-/tilsynsavgrensning er dokumentert i `docs/kshms/INSPECTION_EXTRACT_20261009.md`.


## Valgt KS/HMS-vedleggspakke

`kshmsAttachmentArchive.mjs` gjenbruker den ekstraherte `readInspectionSnapshots`-leseren fra PDF-uttrekket. `KshmsInspectionExtract.jsx` viser først et eksplisitt vedleggsutvalg og krever egen bekreftelse. Dokumenter leses ved forhåndsvisning, før henting og etter henting, med firma-/rolle-/bruker-/kontekstvern og ingen delvis save. Private kvalitet-/HMS-/RUH-originaler lastes med samme innloggede appklient fra `kshms-private`; lagrede prosjektkontrollvedlegg bare fra samme aktive Supabase-origin og kjente `project-images`-objektprefikser; vernerunde-bilder dekodes fra lagret data-URI. Ingen URL-fetch eller tokenlenke i manifestet.

ZIP bruker avgrensede, ukomprimerte UTF-8/CRC32-records (PKWARE APPNOTE), maks 100 vedlegg, 10 MB per fil og 50 MB totalt. Hver fil har unik, renset sti; `manifest.json` har valgt dokument-ID/revisjon, tilknytning, MIME/størrelse og SHA-256 av faktisk filinnhold. Det er et klientuttrekk med dobbel kontroll, ingen atomisk serverarkivering eller kryptering. Uendrede RPC-/Storage-/backendkontrakter, ingen ny skrivemodell eller avhengighet. Full tilsyns-/vedleggsdekning og HR er ikke erklært levert. [Scope/QA](../kshms/ATTACHMENT_ARCHIVE_20261009.md).

ZIP-nedlasting/innhold er Kenneths TEST OK 9. oktober kl. 01:55 på head 359dac0e. Tekstoppfølging presiserer de to separate nedlastingene og forklarer manifest.json som filoversikt; ingen handler-/format-/arkitekturendring. Se CONTINUITY/USER_TEST for eksakt prøvescope.

### Utvidet avviksdekning (2026-10-09)

Dokumentuttrekket har en niende gruppe for kvalitet/HMS fra eksisterende kshms_deviation_state. Kategori er del av det eksplisitte valget og valideres igjen ved detaljlesing. readDeviationPdfSnapshot/deviationPdfDocument i eksisterende kshmsRuhPdf.mjs gjenbruker hele historikken og private filer for de tre serverkategoriene; readRuhPdfSnapshot/ruhPdfDocument/downloadRuhPdf beholder RUH-only-sperren. ZIP bruker de samme snapshotfilene. Ingen backend-/RLS-/Storage-/skrivemodellendring. Ukoblede legacy-prosjektavvik og nye filtilknytninger på SJA/risiko er ikke lagt til. Permanent ny kategori-/historikk-/privatfil-/finalkontroll i critical-kshms-deviation-extract-check.mjs; gamle kontroller består. React/PDF/ZIP har en ekstra KSHMS_DEVIATION_QA=1-modus, mens opprinnelig åtte-gruppe-test beholdes.

### SJA-bilder i versjonert snapshot (2026-10-09)

SJA-vedlegg bruker `content.photos` i den eksisterende versjonerte `kshms_sjas.content`-snapshoten. Klienten gjør JPG/PNG/WebP om til hvitbakgrunns-JPEG (maks 1280 px, 400 000 tegn), og både klient og privat `kshms_private.sja_content` begrenser listen til tre unike UUID-er, kun JPEG-data-URI og 1,35 MB samlet innhold. Dette gir samme revisjonskontroll, readback, konflikthåndtering og signert-uforanderlighet som øvrig SJA-innhold, uten ny tabell, Storage-bucket, RLS eller policy.

`kshmsProjectReport` lager PDF-blokkene; `kshmsAttachmentArchive` lager separate JPG-filer og manifestposter fra de samme endelig gjenleste snapshotene. Eldre SJA-er normaliseres til tom bildeliste. Risikovurderingsbilder er fortsatt et separat modellpunkt. [Scope og QA](../kshms/SJA_ATTACHMENTS_20261009.md).


## Eldre ukoblede prosjektavvik i dokumentuttrekk, 9. oktober 2026

`kshmsLegacyProjectExtract.mjs` normaliserer bare eldre avviksfelter fra `projects.data.project.projectDeviations`. `KshmsInspectionExtract.jsx` leser smal JSON-projeksjon med samme innloggede appklient, prosjekt-ID og aktivt company_scope_id. Eksisterende `project_checklist_state` kontrollerer bruker/firma/prosjekt før og etter hver lesing; PDF/ZIP kontrollerer også managerrett og ferskt innhold før save. Koblet ks_deviation_id utelates for å unngå duplikater med avvikssentralen. Dokument-ID er prosjekt-ID:kilde-ID; SHA-256 av normalisert snapshot avviser endret sak eller filreferanse. Historikk/signatur/utgavenummer oppfinnes ikke.

Lagrede prosjektbilder lastes autentisert fra samme Supabase-origin/bucket project-images, med eksisterende metadata/type/størrelsesgrenser. Kjent avvik-prefiks tillates sammen med tidligere prosjektprefikser. Originaler følger separat ZIP; manifest har contentHash og fil-SHA-256. Ingen migrasjon, backend-, policy-, saks- eller Storage-skriving. Permanent critical-kshms-legacy-extract-check og ekstra faktisk React/PDF/ZIP-modus; eksisterende guards/prøver beholdes. [Scope/bevis/restprøver](../kshms/LEGACY_ATTACHMENTS_20261009.md).

## KS/HMS og HR: firmaavtale og modultilgang – feature 9. oktober 2026

`PeopleModuleAccess.jsx` monteres på eksisterende system-/firmaadmin-brukerkort og systemadmins eksisterende firmarad. Fire `people_modules_*` RPC-er håndhever aktive administrative profiler, eksakt firma/bruker, firmaaktivering og optimistic expected-snapshot. Firmaadmin kan delegere i eget aktive firma; bare systemadmin aktiverer firmamoduler. Den gamle separate KS/HMS-aktiveringsflaten er fjernet fra main. Generelt MODULE_CATALOG/systemadmin-bypass er uendret og brukes aldri for HR.

`company_module_access.hr` og RPC-only/RLS-stengt `hr_private.module_access` skiller firmamodul og personens HR-modultilgang. `hr_private.require_actor` krever begge, med firmaadmin gjennom firmarollen; individinnsyn krever fortsatt `can_read`, aktivt arbeidsforhold og egen/leder/firmaadmin/eksplisitt leserrelasjon. En systemadmin kan administrere modulmetadata uten å lese medarbeidere. Fratredelse fjerner også HR-modulgrant via lukkingstrigger. Eksisterende konfigurerte HR-firmaer og registrerte medarbeider/leder/leserrelasjoner videreføres; dette registrerer ikke kjøp/betaling eller gir nye personlige leserettigheter. H3 innholds-/restore-/Edge-sperrer består.

`useHelpModuleAccess` bruker appklienten og fersk serverrespons, rydder ved bruker-/firma-/tilgang-/bakgrunnsbytte og nekter sene svar. Main sender eksisterende ferske KS/HR-kontekster til React-Hjelp. `helpPresentation.mjs` filtrerer alle modultemaer og ordner global/prosjektflyt; separate Proff-veiledninger følger også store_offers. Alle toppvalg får 20 px dekorativt Lucide-ikon. [Scope/bevis](../kshms/HELP_ACCESS_20261009.md).

Firmamodalens «Lagre og lukk» følger også `data-people-module-save` / `data-access-saving` for de nye modulvalgene; synlige RPC-feil holder firmaet åpent. Felles signal fra en annen selvstendig people-user-grant nullstiller ikke pågående valg på dette kortet. `PeopleModuleAccess.css` retter kun checkbox-bredde/tekstplassering i de nye feltene og tilstøtende company-store-offers-feltet.

Medarbeiderraden åpner nå leder, lesetilgang og eksisterende kontaktflate i appens etablerte popup-vindu. Desktop viser et sentrert vindu, mobil en full skjerm. Tab/fokus, Escape og tilbakeføring til raden følger den eksisterende dialogkomponenten. Lukking rydder HR-valget, og fanebytte viser oppføringen igjen først etter fersk autorisering. Paginering av appbrukere og resultat-/feilmeldinger er tilgjengelige inne i vinduet. Tilgangsmodell, skrivekall og private innholdsporter er uendret.

## HR: prøvesamtale i Sandbox – 11. oktober 2026

Eksisterende HR får en tydelig merket, oppdiktet medarbeidersamtale når byggets backendmål er `sandbox` og HR-konteksten er tilgjengelig. Forberedelse → felles samtale → tiltak → referat kan prøves med samme konto. Eksempeltekster fyller bare tomme felt. Lokal lagring er skilt per firma og bruker, med Web Locks, revisjonskontroll og uforanderlige tidligere utgaver. PDF bruker lagret utgave og merkes som prøve/utkast. Ingen medarbeiderkobling, HR-RPC, utsending, signatur, backendendring eller åpning av privat HR.

Dette er en lokal prøve av arbeidsflyten; data følger ikke brukeren til en ny nettleser eller enhet. Maksimum 10 prøvesamtaler og 20 utgaver per samtale; sletting gjelder bare eget prøveinnhold i nettleseren. Isolert Preview fra ren main, uten å merge tidligere HR-workerarbeid. Se [scope og verifisering](../kshms/HR_PRACTICE_20261011.md).

Prøvesamtalens neste steg ruller nå til innholdets start. PDF-retur og ny tilgangskontroll beholder valgt samtale, lagret utgave og fane via en scoped sessionStorage-peker; innhold leses fra ferskt validert lokal historikk. Bevisst lukk/ny/slett rydder valget. PDF-format, tilgangskjerne og global navigasjon er uendret.

Prøv medarbeidersamtale viser nå toppen av skjemaet. Tomme og ulagrede prøvekladder beholdes i et avgrenset konto-/firmabundet sideminne gjennom tilgangsremount etter fanebytte. Fersk lokal historikk leses før gjenåpning; en eldre ulagret revisjon får ikke overskrive endringer fra en annen fane. Full oppfriskning gjenåpner fortsatt bare lagrede utgaver. Bevisst Lukk rydder kladden og valget.

## Firmavisningsnavn, kartledelse og HR-veiledning – 11. oktober 2026

Firmaprofil → Endre firmanavn bruker egen authenticated-RPC med fersk aktiv profil, låst firmaadmin-medlemskap eller systemadmin, primærfirmabinding, forventet navn og navnekollisjon. Bare sales_company_scopes.display_name endres; stable UUID/normalized identity, profiles, memberships, contact profile and existing snapshots are preserved. Original profile RPCs unchanged. Main applies acknowledged display name to the profile draft and, only outside an open project, the current company; contact drafts are preserved. Four existing project presentation filters now use the stable company_scope_id when available and retain historical-name fallback. Fresh primary-company ID is read when projects load; existing owner/systemadmin/support branches and database RLS are preserved. Work-profile metadata refreshes separately.

Organisasjonskart forklarer at Nytt felles kart krever minst to kvalifiserte registrerte firmaer. Ett firma kan ha Styret og valgfri underavdelingsstruktur. Leader/middle placements show names and free job titles even when staff details are collapsed. No new organization or HR rights. Hjelp now has separate A–Å chapters for conversations and sick-leave, and distinguishes explicit employee sharing, meeting readiness, own confirmation, deadlines and actual external sharing.


## Hele personalhåndboka som PDF – 12. oktober 2026

Miljømål **BEGGE**, fra verifisert main `55d43947b0bd991d282959ace41fdefc489984b2` (#237). Kenneth ba om at ansatte kan laste ned hele personalhåndboka med firmalogo. Ny knapp øverst i Min personalhåndbok bruker eksisterende lesende KS/HMS-state og firmaprofil. Alle egne tildelte rutiner med full tekst, kilder, godkjenning og egne bekreftelser med sekunder/norsk tid; søk begrenser ikke PDF. Gjeldende tildelte utgaver først, tidligere/utgåtte tildelte utgaver i merket historikkdel. Innholdsfortegnelse med faktiske sider og felles kompakt ramme-layout. Ingen bekreftelse registreres ved nedlasting.

Scope: PersonalHandbook integrasjon, ny egen PDF-knapp/renderer, permanent critical og React/jsPDF-QA, Hjelp og release-dokumentasjon. Eksisterende enkelt-PDF/samlet lesebekreftelse/firmapublisering beholdes. Ingen SQL/RLS/tilgang/worker/mail/meny/salg/HR-endring. Egen tildeling brukes også for admin og KS/HMS-ansvarlig. Fersk aktør-/firma-/tilgangskontroll før/etter PDF-motor og logo; endrede tildelinger/tekst/kvitteringer stopper nedlasting. Sent svar etter unmount eller scopeswitch forkastes. Manglende registrert logo stopper eksport; profil uten logo gir firmanavn og ærlig beskjed.

QA/status og Preview føres i `docs/kshms/HANDBOOK_PDF_20261012.md`. Ingen tidligere TEST OK påstås å dekke denne nye PDF-funksjonen. Ingen produksjonspublisering før relevant godkjenning.

## Rutiner sender ikke e-post – 12. oktober 2026

Etter Kenneths eksplisitte akuttinstruks er rutinetildelinger og lesepåminnelser bare i appen. Ny køtrigger blokkerer reading ved insert/retry; 670 ventende rutine-e-poster stanset i produksjon, ingen gjeldende rutinepost sendbar. 200 allerede sendte beholdes i loggen. Rutiner, tildelinger og egne bekreftelser beholdes. Andre oppgaver og frister beholder e-post. Produksjon og Sandbox installert, faktisk insert/retry-test rullet tilbake. Se docs/kshms/ROUTINE_EMAIL_STOP_20261012.md.

## Mobil tilbudslesing – 13. oktober 2026

Miljømål BEGGE, fra main 59682a0902615437677c129fb18fe154350b127e. Intern tilbudsvisning og kundevisning får hovedposter med Åpne hovedpost/Lukk hovedpost, lukket som utgangspunkt på mobil og åpent på desktop. Nummer/tekst/pris i grupperte rader får avgrenset mobil-layout; priser ligger under teksten. Små Til toppen/Til bunnen-knapper på lange tilbudssider skjules under tekstinntasting og ligger over eksisterende mobil Lagre-knapp. Se kundens tilbud/Forhåndsvis som kunde åpner mobil kundepreview i en native modal med fast Tilbake til tilbudet; samme interne saks-/editorinstans beholdes. Desktop og visninger uten modal-lytter beholder egen fane. Modaladresse må være same-origin og en kunde-/kladdvisning; ingen return-token eller ny offentlig tilganger.

Scope er presentasjon/CSS, isolert modal/scroll-komponent og to eksisterende open-handlinger. Ingen lagring, publisering, pristall, aksept, e-post, server-hydrering/recovery eller SQL/RLS endres. E-postsperren for rutiner beholdes. Lesende produksjonskontroll av Andreas' F-2026-0087 og F-2026-0080 ga 23/13 linjer og 25/21 opsjoner. Tester bruker kun linje-/opsjonstekster, uten kundedata eller tokens; alle firma-/kunde-/brukerdata er uendret.

Actual Chromium QA PASS ved 320/360/390/760/1280: åpne/lukke, interne grupperte tekster uten prisoverlapp, ingen horisontal overflow, mobil modal-retur og topp/bunn. Gamle draft-preview/recovery/tab-resume/server-hydration/entry-resume og Befaring → Generelt tilbud passerer. Full critical/build/CI og innlogget Preview følger i release-PR før TEST OK/merge.

Mobilpiler: plasseres midt på høyre side, over innholdets lag og utenfor det flytende kundepreview-kortet. Synlighet følger faktisk scrollflate og mobilens synlige skjerm; kundevisning og interne tilbud får samme kontroll. Runtime-QA dekker kort over knappene og scrolling i en egen container.

Pilkontrollene har egen enkolonnet meny-layout og ruller dokumentet via window.scrollTo. Hvis Vercels Preview-verktøy finnes, trekkes pilene litt inn fra høyrekanten så begge kan trykkes. Runtime-QA bruker nå også appens faktiske globale mobil-/menystiler og en overlappende Preview-knapp.

Mobil 13. oktober: topp/bunn-kontrollen er flyttet til felles MobileScrollShortcuts i den autentiserte appskallet; én kontroll uansett valgt modul, mens isolert kundevisning har sin egen. SalesMobileTools beholder bare kundevisningsdialogen. Mobil startboks er avgrenset til tab=prosjekt uten valgt/nytt prosjekt, slik at HR/KS/HMS/profil/øvrige moduler åpner uten startboksen. Kun presentasjon, ingen endring i navigasjonshandlere, recovery, lagring, tilgang eller e-post. Permanent sjekk bruker faktisk rendererbetingelse; touch-QA på modulbytte/HR/KS/HMS/profil/Startsiden og eksisterende tilbudskontroller.

Sjekklistesentral 13. oktober: eksisterende prosjektmaler/fagpunkter/Sopro-garantipunkter, produktmasterens kontrollpunkter og egne lister fra firmaets tilgjengelige prosjekter vises i et felles bibliotek. Kun definisjoner hentes, ingen prosjektbesvarelser/kundedata. Firmatilgang kontrolleres før/etter lesing, RLS/firmascope beholdes, paginering og sene svar beskyttes. Vanlige kilder åpnes som en separat firmaversjon via eksisterende bygger/publisering. Garantikilder har ingen redigering, sletting eller kopiering, og garantimalene deles med Prosjekt som samme frosne kildedata. Eksisterende prosjektsvar og garantilogikk er uendret. «+ Legg til sjekkliste» ligger under Sjekklister for både små og våtromsprosjekter; våtrom beholder også inngang fra Fag/utstyr. Full QA og Preview før ny TEST OK; BEGGE.


13.10.2026 – Preview-korrigering: Våtrom har én samlet redigerbar firmaversjon med alle sju arbeidsområder; øvrige fag har hver sin liste. Arbeidsområdet følger punktets hjelpetekst i byggeren. Ingen punkter fjernes. Garantipunkter er fortsatt uforanderlige og kan ikke kopieres til redigerbare firmaversjoner. Redigeringsinngangen heter «Rediger som firmaversjon». Eksisterende prosjektutfyllinger beholdes. Avventer ny TEST OK.


13.10.2026 – Prosjektering Preview: egen samlet kontroll med 13 prosjekteringspunkter nederst i Prosjektering. Gjenbruker ProjectChecklistWorkspace og eksisterende bekreftet serverlagring, lokal kladd, historikk, Ok/Avvik/Ikke aktuelt og egen PDF. Stabil egen kategori skiller svar fra utførelses-/garantikontroller. Låste/lesetilgang/support får samme sperrer. Eksisterende prosjekteringsfelt, egne punkter og tegninger beholdes. Ingen database-/e-postendring. Avventer TEST OK.


13.10.2026 – Kontrollørtilgang / BEGGE / Preview: isolert leselenke og separat 128-bit kode, kun SHA-256 i controller_private.links med RLS/ingen direkte API-grants. Intern prosjekt-/aktiv-firma-tilgang kreves for oppretting, endret tidsfrist, koderotasjon og tilbakekalling (revisjonsvern). Anonym lesefunksjon sjekker kode, utløp og tilbakekalling på hver forespørsel og returnerer kun prosjekteringsfelt/tegninger/bilder/vedlegg, alle registrerte prosjektlister med svar og historikk, valgte produktkontroller og prosjektbundne vernerunde-/sjekklistegjennomføringer. Interne notater, salgsgrunnlag, portal-/UE-koder, HR og chat utelates. Egen portal uten skrivehandlinger; serverklokke, utløpstimer og revalidering/fokus fjerner innhold ved bortfalt tilgang. Kunde-/UE-funksjoner og rutine-e-poststopper er uendret. Sandbox SQL QA rulles tilbake; grønn full critical/build og real React før TEST OK. Produksjonsmigrering først etter godkjent Preview. Security advisors: privat deny-all RLS og kapabilitetsstyrte SECURITY DEFINER-endepunkter er tilsiktet; ingen direkte tabelltilgang gis.


Kontrollør-e-post (13. oktober 2026, Preview): Under Administrer kontrollørtilgang kan en nylaget/rotert kode sendes manuelt til kontrollørens e-postadresse. E-posten bruker samme HTML-layout og emailBrandPayload som tilbud, med firmalogo, lenke, kode og norsk utløpstid. Isolert controller-access-email validerer innlogget prosjekt-/firmatilgang samt gjeldende kode og utløp før Resend. Ingen automatisk utsending ved opprettelse/endring; rutine-e-postforbud og smart-worker er urørt. Mock-baserte ende-til-ende-tester sender ingen ekte e-poster. Sandbox-funksjon først, produksjonsfunksjon/migrasjon og main→demo etter nytt TEST OK.


Scrollrettelse 13. oktober 2026 (BEGGE, Preview): Felles scrollminne flyttet til pageScrollMemory. Synlig fokusendring, inkludert Windows + Shift + S, skal ikke gjenopprette en gammel posisjon. Gjenoppretting skjer kun etter faktisk skjult side; tastatur/mus/touch/hjul, blur og unmount avbryter ventende gjentakelser. Nullposisjon er gyldig. Tester dekker seks faner, skjult/tilbake, brukerinteraksjon og rydding. Ingen endring i autosave, serverhydrering, Sales workspace-recovery, backend eller e-post. Ny TEST OK kreves før main/Production og kontrollert demo-synk.


### Varetelling – Preview 15.10.2026

Systemadmin kan aktivere **Varetelling** per firma. I Prissøk får godkjente tellere egne delte tellelister med lager, dato og område, skanning/søk med eksplisitt leverandørvalg og manuell innlegging uten strekkode. Antall 0, desimaler, idempotent lagring, revisjonsvern og låst avslutning støttes. Listene bruker ikke plukklistens grense på 30 varer. Eksport henter alle sider, summerer områder per leverandør/varenummer til samme etablerte Cordel-vareformat med fast filnavn og gir separat CSV-kontrollfil. Ingen prisfelt eller direkte oppdatering av Cordel. Kenneth bekrefter samme vareimportoppsett som ved tilbud; faktisk prøveimport av tellefilen gjenstår; se `docs/qa/STOCKTAKE_20261015.md`. Bare Sandbox er migrert/aktivert for Preview, ikke produksjon.


Mobil Prissøk 15.10: Søk, kamera og treff vises rett under overskriften på mobil, før varetelling og lagrede/valgte plukklister. Tastaturet åpnes ved eget trykk i feltet; verken åpning, skanning eller valg av vare setter mobilfokus automatisk. PC-oppsettet beholdes. Kenneth ga «test ok på alt» kl. 13:18, inkludert denne avgrensede mobilrettingen.

### Plukkliste til leverandør (Preview, 15.10.2026)

Prissøk har «Send bestilling til leverandør». Brukeren kan skrive leverandørnavn og én valgfri e-postadresse, velge varer (også fra en blandet plukkliste), angi referanse, leveringsadresse og melding. Forhåndsvisningen hentes fra aktive katalogvarer på serveren; varenummer, netto-pris, linjesum og varesum eks. mva. følger bestillingen. Prisene hentes på serveren med fersk netto-tilgang. «Ordrebekreftelse sendes til» viser tydelig innlogget brukers e-postadresse med klikkbar lenke. Bestillingen bruker appens faste e-postformat med Expo ProffDok-toppfelt og firmalogo. «Husk leverandør og e-post» lagrer kontakten for det aktive firmaet etter bekreftet sending. Lagrede kontakter kan velges eller slettes; plukklisten beholdes.

Avgrenset implementasjon: `SupplierOrder.jsx`, `supplierOrderClient.js`, `supplierOrder.css`, RPC-ene `supplier_order_context`, `supplier_order_prepare`, `supplier_order_contact_delete` og worker `supplier-order-email`. Kontakter og uforanderlige sendekvitteringer ligger i `supplier_order_private` med RLS og uten direkte klienttilgang. Hvert brukerkall kontrollerer fersk Prissøk-tilgang, firma og medlemskap. Kun service_role kan fullføre sending og lagre kontakt. E-post bygger utelukkende på serverens feltutvalg, inkluderer avsenderens firmainfo og teksten «Ved utkjøring tilkommer leveringsomkostninger». Intern dispatch bruker et eget Vault-token og sjekker opprinnelig brukers tilgang på nytt. Stabile Resend-nøkler tillater samme forsøk på nytt i 23 timer; daglig egen cron sletter sendekvitteringer eldre enn to dager. Dette oppretter ingen ordre i Cordel/ERP eller langvarig ordrehistorikk.

QA: `node scripts/supplier-order-db-check.mjs`, `node scripts/supplier-order-email-check.mjs`, `node scripts/supplier-order-react-check.mjs`, full critical-suite og bygg. Sandbox først; ny TEST OK kreves før produksjonssetting og deretter kontrollert main → demo.

Plukklisten har en samlet handlingsrad: bestilling, utskrift av plukkliste, Cordel og prisutskrift. Internt prisvalg står under prisutskriften. Lagre, vis/skjul og slett står ved overskriften. På mobil står bestilling øverst i full bredde, med utskrift og Cordel under.


### Prosjektarbeidsflate – Preview 17.10.2026

Miljømål: BEGGE. Ordinære, direkte opprettede og generelle/enkle prosjekter
bruker samme kompakte toppfelt og prosjektmeny, med eksisterende ordrefiltrering.
ProjectWorkspaceChrome viser valgt fase på desktop og bruker eksisterende
DeviationDialog for mobilmeny, samlet status/mangler og flere handlinger.
React eier dialogene; eksisterende goToTab, lagring, PDF, kopi, låsing og
forlat-bekreftelser brukes uendret. Den gamle kilde-navigasjonen beholdes for
legacy-adapterne, mens dobbelt prosjektmeny ikke vises. Statusveiledningen
beholder sjekklisteprosent, avvik, overtagelseskrav og eksisterende callbacks.
Ingen SQL, e-post-, support-, timeførings- eller recovery-endring.
Se docs/qa/PROJECT_WORKSPACE_UX_20261017.md. Ny TEST OK kreves før merge.

Oppfølging 17.10: Prosjektets apphode er komprimert med lokal CSS. Navn, kunde
og full adresse står i toppfeltet; intern oversikt gjentar dem ikke, men beholder
telefon, e-post, prosjektansvarlig og akseptert sum inkl. mva. Kundeportalens
ProjectInformationReadOnly og rapportdata er urørt. Vanlige prosjekter viser
«Overlevering og garanti»; enkle ordrer beholder «Overlevering» uten garanti.

Prosjektflyt 17.10: Nummererte oppstartssteg, Ved behov-merker og Salgsgrunnlag
som historikk gir anbefalt rekkefølge. Lagre og fortsett bruker eksisterende
lagring med et eksplisitt bekreftet resultat. Bare denne nye handlingen krever
kontroll av hele prosjektinnholdet mot returdata (serverens firma-/bruker-
snapshots kan normaliseres). Feil, nyere kladd, firmabytte eller senere bruker-
handling stopper fortsettelsen. Ved nyopprettet rad beholdes ID ved avbrudd for
å unngå duplikat ved retry. Vanlige Lagre/Oppdater-knapper og bekreftelser er
beholdt. Ulagret fremdriftsplan må lagres i den eksisterende planbyggeren.
Fast mobilmeny: Oversikt, Sjekklister, Bilder, Avvik, Meny. Påbegynte sjekklister
vises først og åpner eksisterende begin/dialog/kladd-logikk. Fullførte kontroller
og lesetilgang endres ikke. Ingen SQL-, backend-, rapport- eller e-postendring.
CI er utvidet med faktiske lagrings-/mobil-/fortsett-tester; gamle tester beholdes.


## Prosjektkart og samordnet nestehandling – 17.10 kl. 11:50

Kenneth godkjente en miks av oversiktskartet og den nye kompakte prosjektflaten.
Miljømål: BEGGE, samme PR #266 og faste Preview. Denne delen erstatter tidligere
beskrivelse av ett valgt fasepanel og nummererte underfaner. Alle tre faser er
synlige på PC i like brede bokser med lik topp-/bunnkant. Mobil beholder fast
feltmeny og fullskjermdialog for alle prosjektfanene.

Oppstart viser Deltakere og tilganger rett etter Oversikt. Eksisterende
Prosjektinvolverte-root får en plass foran portalene i eksisterende tilgangsfane;
oversiktens opprinnelige plass beholdes. Samme editor og kladd gjenbrukes ved
flytting, med eksisterende egen lagring. Registrert kontakt gir ikke portaltilgang.
Kunde-, UE- og kontrollørhandlinger bruker opprinnelige callbacks, koder, RLS og
e-postmotor. Enkle ordrer beholder UE/funksjonsutvalg uten kundedeling.
Ingen ny deltakereditor injiseres i skrivebeskyttet tilgangsfane eller før lagring.

Begge handlingsrader bruker projectWorkspaceFlow og ProjectFlowActions.
Fremdrift peker til Sjekklister begge steder. Den gamle bottomPrevNext beholdes
som skjult kompatibilitetskilde for urørte legacy-checker og er ikke brukerens
navigasjon i React-skallet. Generisk prosjektlagring brukes bare for prosjektets
felter; kontaktlisten, fremdriftsplanen og sjekklister beholder egen lagring.
Nye data-project-navigation-markører sikrer at gammel deltaker-kladdvakt
fortsatt stopper nye meny-/neste-/mobilhandlinger ved ulagrede kontakter.

Scope: ProjectWorkspaceChrome/presentation/CSS, to integrasjonspunkter i main,
accessViewTools sin presentasjonsplass, deltakeradapterens hostvalg og
kladdvaktmatch, Hjelp, nye UX-tester, QA/docs og tillegg i CI. Ingen endring i
Sales, goToTab, lagringsmotor, database, autorisasjon, e-post eller timeføring.

Testendringens begrunnelse: gammel UX-test forventet skjulte faser og fem/tre
oppstartssteg. Ny avtalt kontrakt krever alle faser, synlige deltakere og samme
nestehandling. Nytester fra denne PR oppdateres. I critical-project-navigation-check
oppdateres kun hjelpetekstkontrakten til tre synlige bokser, deltaker-/portalvalg
og lik nestehandling, med ekstra vern mot at kontakt likestilles med tilgang.
Alle øvrige eksisterende critical-assertions beholdes. Prosjektkortets grense økes fra 440 til 560 px fordi
hele kartet nå er synlig. Apphode <=80 px og innhold før 800 px beholdes.

Brukerprøve: Åpne vanlig prosjekt → Deltakere og tilganger. Prosjektinvolverte
skal stå før portalene. Åpne Fremdrift og kontroller at øvre/nedre handling går
til Sjekklister. Prøv enkel ordre og mobilmeny, og avbryt navigasjon fra en
ulagret kontakt. Faktisk QA/CI/deploybevis føres i PR før ny TEST OK.


## Samlet kundeboks og kompakt prosjektskjema – 17.10 kl. 12:12

Kenneth ba om én kundeboks og mindre luft i prosjektoversiktens skjema.
Miljømål: BEGGE, samme PR #266/faste Preview. Scope: feltpresentasjonen i
ProjectInformationFields, main sin skjemaintegrasjon, prosjektlokal CSS, Hjelp,
QA/docs og tillegg til eksisterende QA-jobb. Ingen endring i kunderegisterets
provider, RPC-er, scope/revisjon, opt-in, lagring, Sales eller portal.

Prosjektopplysninger samler navn, ansvarlig, dato og prosjektadresse. Kunde
samler navn, e-post og telefon. Kunderegister – hent eller lagre kunde åpner
original søk/valg og eksplisitt lagring i samme boks. Registeret er lukket som
standard; ingen kunde lagres automatisk. OnUse beholder opprinnelig mapping
av både kontakt og prosjektadresse; brukeren skal kontrollere adressen.
Notater beholdes synlig med lavere minimumshøyde. Garantifelt og opprinnelig
oversiktsoverskrift/vertsplass for Prosjektinvolverte beholdes. Desktop bruker
tre kolonner, nettbrett to og liten mobil én, med store trykk-/skrivefelt.

Brukerprøve: Oppstart → Oversikt → Kunde. Åpne Kunderegister – hent eller
lagre kunde, hent en lagret testkunde og kontroller kontakt/prosjektadresse.
Egen registrering fungerer uten registervalg. Registerlagring krever fortsatt
et aktivt valg; ordinær prosjektlagring er uendret. Ny TEST OK før merge.


## Flere handlinger som nedtrekksmeny – 17.10 kl. 12:27

Miljømål: BEGGE. Brukerbestilt bytte fra modal til liten meny rett under Flere
handlinger. Scope: ProjectHeaderActions, prosjektlokal CSS, eksisterende UX-QA
og Hjelp/docs. PDF, nytt prosjekt, kopi og avslutning/opplåsing har uendrede
callbacks, synlighetskrav og bekreftelser. Lagre/Oppdater er fortsatt direkte.
Menyen lukkes ved nytt klikk, valg, utenforklikk, Tab eller Escape. Escape gir
fokus tilbake; pil/Home/End støtter tastatur. Ingen bakgrunnslåsing/fullskjerm.
Status/mangler og prosjektmeny beholder sine eksisterende dialoger.
Bare denne PR-ens nye UX-test tilpasses den nye menyrollen, med ekstra
responsive og tastaturkontroller. Ingen eldre critical-check endres.
Brukerprøve: Flere handlinger → meny under knappen, klikk utenfor for å lukke.


## Mobil prosjektbredde og direkte sjekklistestart – 17. oktober 2026

Miljømål BEGGE, fra main `8afb2246a5126665e7c89af8a0da3c2f81614e9c` / godkjent PR #266. Prosjektfeltet over innholdet får bredde som inkluderer begge sidemargene; en eldre global 100 %-regel klippet høyrekanten på mobil. Prosjektets handlingsrad spenner nå over hele toppfeltet, med plass til både lagring og Flere handlinger. Den eksisterende nedtrekksmenyen og alle callbacks beholdes. Fast sjekklisteknapp nederst beholdes etter Kenneths avklaring.

Klikk på Sjekklister ber etter godkjent eksisterende navigasjon om neste uferdige liste: påbegynt lokal/serverkladd først, ellers første ikke-fullførte liste. Fersk eksisterende state-RPC og samme begin/dialog/editor brukes. Åpen kladd og presis lenke til sjekkpunkt vinner; ingen automatisk åpning ved mount, fokus eller etter avbrutt navigasjon. Ny brukerhandling, appbytte eller prosjekt-/firmabytte stopper sen åpning. Alle fullført viser oversikten. Read-only/support starter ikke redigering. Ingen database, RLS, utsending, lagringskommando eller ny recovery endres. `main.jsx` endres bare med en avgrenset, identitetsbundet engangsforespørsel i eksisterende goToTab og prop til den ordinære sjekklistesiden; Prosjektering beholder egen liste.

QA og relevant ny Preview-prøve: `docs/qa/PROJECT_MOBILE_HEADER_CHECKLIST_20261017.md`. Ny TEST OK kreves før merge/Production; deretter main → demo med preflight.

### Fleksible underpunkter og varme arbeider (17.10.2026, Preview)

`checklistFields.mjs` og `ChecklistFields.jsx` deler kanonisering, betingelser, krav, utfylling og malbygger. Inntil 40 underpunkter per punkt; bare tidligere valg i samme punkt kan styre synlighet. `fields` og `allow_na:false` er additive utvidelser i faste mal-/kontrollkopier. Gamle punkter får ingen nye JSON-nøkler. Prosjektets `requirements` og selvstendige kontrollpunkter beholder identisk malinnhold. Begge kommandoer validerer på server og bekrefter readback.

Bekreftelser får eksplisitt hendelses-ID ved avkryssing. Serveren eier bruker, identitet, tidspunkt og SHA256 av punktene/svarene frem til denne delen (uten bekreftelsesmetadata). Etterfølgende deler endrer ikke tidligere bevis. Endringer før en bekreftelse rydder denne og senere bekreftelser i klienten; server avviser gjenbruk av samme hendelses-ID på endret grunnlag. Ny avkryssing signerer som innlogget bruker. Eksterne uten innlogging bruker signert vedlegg. Ingen nye offentlige RPC-er, tabeller, tilgangsgrants, e-postregler eller RLS-endringer.

`hotWorkChecklist.mjs` leverer selvstendig firmatilpassbart forslag for alle fag med jobb, sikkerhet/bekreftelser før start og etterkontroll. Eksisterende rutine `hot-work` får kildeforslag v2. Malen er ikke automatisk godkjent arbeidstillatelse. Sikkerhetsforskriften fra 1.1.2024 er kontrollert 17.10.2026; varslede 2027-endringer innføres ikke på forskudd. Konkrete tillatelser, sertifikater, faktisk vaktvarighet og sikkerhetsvurdering kontrolleres av virksomheten. PDF bruker faste definisjoner og lagrede svar.


### Systemadmin – firmavalg 19.10.2026

Firmavalget på brukerkortet matcher nå registrert firmanavn etter trim og små bokstaver, på samme måte som firmalisten og firmafilteret. Gamle navn med mellomrom eller ulik bokstavbruk viser dermed riktig firma. Valg av samme normaliserte firma er uten skriving; et reelt firmabytte følger eksisterende bekreftelse, profiloppdatering og serverhenting. Ingen automatisk normalisering av produksjonsdata, rolle-/tilgangsendring eller endring av firmaidentitet. Regresjonsvern: `scripts/systemadmin-company-selection-react-check.mjs`, faktiske memo/Select/felt/lagringshandler fra main i Chromium, syntetisk transport. Se `docs/qa/SYSTEMADMIN_COMPANY_SELECTION_20261019.md`.


### Lagerrutine og 25 kg sekker – 20.10.2026

`store_lifting` er oppdatert til kildeforslag v2, «Tunge løft og varehåndtering på lager». Beskriver mottak/plukk/utlevering med 25 kg lim- og mørtelsekker, konkrete arbeidskrav, arbeidsgivers risikovurdering/opplæring/hjelpemidler og medarbeiderens utførelse/medvirkning. 25 kg, 6000 kg og 20 meter er riktig merket som veiledning, med vurdering av repetisjon og individuelle forutsetninger. Tilrettelegging vurderes sammen med drift og kollegers arbeidsmiljø; personlige helseopplysninger holdes utenfor håndboka. Stabil source_key og source_revision=2 gir sammenligning gjennom eksisterende kildeoppdatering. Firmaets gjeldende rutine erstattes først ved ny firmagodkjenning. Gamle utgaver og lesebekreftelser beholdes uendret. Ingen database-, tilgangs-, navigasjons- eller e-postendring. De 73 opprinnelige rutinene og 13 andre butikkrutiner er uendret.


### Lagre rutineutkast etter tekstsammenligning – 20.10.2026

Ekstra «Lagre utkast» nederst etter ProffDoks tekstsammenligning er koblet til det eksisterende redigeringsskjemaet med en unik form-ID. Samme innsending, påkrevde felt og busy-sperre gjelder fra begge knapper. Lagring, lokal kladd, firmagodkjenning og lesebekreftelser følger eksisterende flyt. Miljømål BEGGE; Preview og ny TEST OK før produksjon.


### Automatisk personalhåndbok ved tilgang – 20.10.2026

Nye og eksisterende aktive interne medarbeidere med KS/HMS-tilgang får siste godkjente utgave av alle aktive firmarutiner. Private triggerfunksjoner dekker tilgang på brukerkort, akseptert invitasjon, firmarolle, sen godkjenning/reaktivering og firmamodul. Samme firmalås som publisering hindrer tap ved samtidig tildeling/publisering. Bare manglende tildelinger opprettes; tidligere utgaver, kvitteringer, roller og firmatilgang beholdes. Ingen ansatt bekreftes automatisk. Rutine-e-post er fortsatt sperret.

Kenneth bestilte direkte produksjon og supplerte med alle eksisterende ansatte og samme håndbok i Bademiljø Expo og Expo Proffsenter. Etter kontrollert rollback-prøve er de to tomme håndbøkene fylt via eksisterende oppstart/lagre/publiser-RPC-er, med uttrykkelig bestilling som endringsvurdering og uten egen lesebekreftelse. 87 gjeldende Ringside-utgaver er innholdslike i alle tre firmaene. 7 aktive Expo Proffsenter-medarbeidere fikk påkrevd KS/HMS-lesetilgang. Alle 19/10/11 aktive medlemskap har nå 87 gjeldende rutiner. Ringsides 3 eldre utgaver og alle eksisterende lesebekreftelser er beholdt. Dette er en engangskopiering; senere firmaredigeringer er fortsatt selvstendige.

QA, migrasjon og publisert status: `docs/qa/HANDBOOK_AUTO_ASSIGNMENT_20261020.md`.


### Én gjennomgang i hovedfirmaet – 20. oktober 2026

Ansattes faktiske egenbekreftelse i primærfirmaet dekker egne tildelte utgaver med identisk `content_hash` **og** JSONB-innhold i andre tilgjengelige firmaer. Ulik tekst krever egen gjennomgang. Begge firmaer må ha aktiv KS/HMS-lisens og brukerens medlemskap/tilgang. Originale kvitteringer endres aldri. Gjenbruk lagres med originalens navn, tidspunkt, tekst og kildeutgave/firma, eget `shared_at` og revisjonshendelsen `ack_shared_primary`. Det er ikke en ny signering. Eksisterende selvstendige kvitteringer beholdes. Ingen kjeder av gjenbrukte kvitteringer opprettes.

En privat, API-avskåret trigger håndterer ny egenbekreftelse; autorisert `kshms_get_state` gjenbruker eksisterende bekreftelser ved nye tildelinger og reparerer eventuelle samtidighetskappløp før visning. Unik versjon/bruker og `ON CONFLICT DO NOTHING` gjør gjentakelser idempotente. Eksisterende leser-/lederfiltre beholdes. Oppfølging og personalhåndbok/PDF viser kildefirma. Primærfirma følger medlemskapets `is_primary`, ikke firmaet valgt i menyen. Ingen tilgang, rutinetekst eller e-postinnstilling endres.

QA: `scripts/kshms-primary-ack-db-check.mjs` med ekte PostgreSQL/RPC-er og syntetisk rollbackscenario; eksisterende samlet/enkeltbekreftelse og faktisk React/jsPDF beholdes som regresjonsvern.


### Prosjektsjekklister i skrivebeskyttet supportmodus – 20. oktober 2026

Systemadmin kunne åpne ML Flis-prosjektet, mens sjekklistene brukte administratorens aktive firma og viste «Prosjektet er ikke tilgjengelig i aktivt firma». De fire sjekklisteintegrasjonene i `main.jsx` får nå prosjektets faktiske firma og eksplisitt `supportReadOnly`. Ingen aktiv arbeidsprofil eller medlemskap endres.

Ny `project_checklist_support_state(uuid)` kontrollerer fersk aktiv systemadmin og eksisterende prosjektleserett, avleder firma fra prosjektet og returnerer bare prosjektets kontroller og svar. Vanlig `project_checklist_state`, alle skrive-RPC-er og private tabellrettigheter er uendret. Supportflaten bruker ingen privat lokal kladd, lagrer ikke og importerer ikke nye maler. Eksisterende PDF-verifisering bruker samme autoriserte leserute før/etter generering; firmaprofilens etablerte systemadminregel beholdes. Ordinær fullføring/historikk/lokal sikring har eget regresjonsvern.
