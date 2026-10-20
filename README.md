## Antall på kundevalgte opsjoner – Preview 17.10.2026

Våtromstilbud og Generelt tilbud får et eget valg «Kunden kan velge antall» på tillegg. Kunden velger opsjonen og bruker − / antall / +. Enhetspris og sum vises med tilbudets låste mva.-visning. Aksepten lagrer serverberegnet sum og valgt antall fra publisert versjon. Faste opsjoner og erstatningsalternativer beholder publisert antall. Ny TEST OK kreves før Production og kontrollert main → demo-synk. Se docs/qa/CUSTOMER_OPTION_QUANTITIES_20261017.md.

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

## Befaring: eksplisitt valg for tidligere tom lokal tekst – Preview

Innlogget etterkontroll viste at den gamle feilen også kan ha etterlatt en lokal kladd med bilder, men uten tekst, mens serveren fortsatt har tekst. Slike lokale medier regnes med rette som meningsfullt arbeid. Notatet viser derfor et synlig valg: Bruk teksten fra saken eller Behold tom lokal tekst. Tekstfelter og Lagre er sperret til valget er tatt, og submit har samme sperre. Servervalget kopierer bare de fire tekstfeltene; lokale bilder/Badskisse og alle lagrings-/recovery-regler beholdes. Ingen ny browserlagring, automatisk serveroverskriving eller generell konflikthåndtering innføres. Bevisst tømming etter normal åpning fungerer som før.

128 faktiske editor-Chromium-kontroller og elleve actual-Core/helper-scenarier PASS, inkl. begge valg, sperret lagring før valg og bevarte bilder/skisse. Første søke-/initialstate-head b3cfeeee har Core Safety #497 SUCCESS og Preview dpl_E4VJKMMdVkZn9g9Ha7TU3UAKfCUy READY. Denne oppfølgingens endelige SHA/CI/innloggede kontroll føres i PR #260. Ingen TEST OK/merge/Production.

## Smartere Prissøk og sikker befarings-retur – Preview 16.10.2026

Miljømål BEGGE. Smartere søk finner alle ordene i fri rekkefølge og tar med avgrensede fagaliaser (servantkran/servantbatteri/servbatt, dusj-/kjøkkenkran, WC/klosett/toalett, sort/svart, krom/chrome). Eksakte varenummer/EAN kommer først; alias-treff merkes. Slå av Smartere søk for uendret vanlig søk. Ingen KI-tjeneste eller ekstern utsending; dette er et avgrenset katalogoppslag, ikke generell stave-/betydningsforståelse. Alle farge-/dimensjons-/merkeord beholdes som krav.

Ny lesende `search_internal_store_catalog_prices_smart` med samme tilgang/nettomaskering og aktiv-importfilter. Gamle søk/RPC-er, tilbudsoppslag, varetelling, plukklistelagring/eksport og varedata er uendret. Migrasjon 20261016190242 er installert bare i Sandbox, ikke Production. 41 PostgreSQL- og 70 Chromium-kontroller PASS; eksisterende mobilskann-QA kontrolleres også.

Etterkontroll av editorleveransen avdekket eksisterende tom initialstate ved direkte remount i befaringsnotat. Test mot uendret main feiler. Core initialiserer nå kun dette arbeidsbildet fra meningsfull scoped lokal kladd eller ferdiglastet servergrunnlag; ordinær detaljflyt er uendret. Ingen recovery-timere, nettlagring, server-autosave, navigasjon eller andre moduler endres. Sju permanente initialstate-kontroller kjøres i full critical. Servertekst og bilder på DEMO-02 er kontrollert intakte; skjemaet ble ikke lagret i feilsøkingen. QA: docs/qa/SALES_EDITOR_UX_20261016.md og docs/qa/SMART_PRICE_SEARCH_20261016.md. Ny TEST OK kreves før merge/Production/demo-synk.

## Editorflate – Preview 16.10.2026

Miljømål BEGGE. Befaringsnotat samler fire tekstfelt i to PC-kolonner før uendret Badskisse/bilder. Våtromstilbud har samme fire kort for forbehold/leveranse, mindre topp-/malområde og ikke-sticky tilbakefelt. Mobil beholder én kolonne og romslige felt. Kun presentasjon, ingen main-/recovery-/lagrings-/pris-/backendendring. QA: docs/qa/SALES_EDITOR_UX_20261016.md. Ny TEST OK kreves.

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
## Rutiner sender ikke e-post – 12. oktober 2026

Etter Kenneths eksplisitte akuttinstruks er rutinetildelinger og lesepåminnelser bare i appen. Ny køtrigger blokkerer reading ved insert/retry; 670 ventende rutine-e-poster stanset i produksjon, ingen gjeldende rutinepost sendbar. 200 allerede sendte beholdes i loggen. Rutiner, tildelinger og egne bekreftelser beholdes. Andre oppgaver og frister beholder e-post. Produksjon og Sandbox installert, faktisk insert/retry-test rullet tilbake. Se docs/kshms/ROUTINE_EMAIL_STOP_20261012.md.

## Hele personalhåndboka som PDF – 12. oktober 2026

Miljømål **BEGGE**, fra verifisert main `55d43947b0bd991d282959ace41fdefc489984b2` (#237). Kenneth ba om at ansatte kan laste ned hele personalhåndboka med firmalogo. Ny knapp øverst i Min personalhåndbok bruker eksisterende lesende KS/HMS-state og firmaprofil. Alle egne tildelte rutiner med full tekst, kilder, godkjenning og egne bekreftelser med sekunder/norsk tid; søk begrenser ikke PDF. Gjeldende tildelte utgaver først, tidligere/utgåtte tildelte utgaver i merket historikkdel. Innholdsfortegnelse med faktiske sider og felles kompakt ramme-layout. Ingen bekreftelse registreres ved nedlasting.

Scope: PersonalHandbook integrasjon, ny egen PDF-knapp/renderer, permanent critical og React/jsPDF-QA, Hjelp og release-dokumentasjon. Eksisterende enkelt-PDF/samlet lesebekreftelse/firmapublisering beholdes. Ingen SQL/RLS/tilgang/worker/mail/meny/salg/HR-endring. Egen tildeling brukes også for admin og KS/HMS-ansvarlig. Fersk aktør-/firma-/tilgangskontroll før/etter PDF-motor og logo; endrede tildelinger/tekst/kvitteringer stopper nedlasting. Sent svar etter unmount eller scopeswitch forkastes. Manglende registrert logo stopper eksport; profil uten logo gir firmanavn og ærlig beskjed.

QA/status og Preview føres i `docs/kshms/HANDBOOK_PDF_20261012.md`. Ingen tidligere TEST OK påstås å dekke denne nye PDF-funksjonen. Ingen produksjonspublisering før relevant godkjenning.

## Samlet firmagodkjenning – 12. oktober 2026

Miljømål **BEGGE**, fra ferdig #236/main `5c5e32792895e213280d893975d8eeea6872c3cb`. Kenneth viste enkeltgodkjenning på R-087 og ba om en raskere firmagodkjenning. **Godkjenn flere rutiner** øverst i Håndbok lar firmaadmin og KS/HMS-ansvarlig velge lagrede utkast, inkludert Velg alle som venter, lese eksakte utkast/utgavenummer og bekrefte felles vurdering. Én ny additiv transaksjons-RPC bruker uendret kshms_command(publish) for hver utgave. Gammel godkjenning, historikk, tildeling, varsling og eksplisitt valgfri egen lesebekreftelse beholdes. Ulagret tekst og stale/feil aktør/rolle/firma stopper handlingen; ingen delvis publisering. 87-utkast/88-utgaveprøve i lokal PostgreSQL og ekte Sandbox rullet helt tilbake, faktisk React for begge roller og gammel enkeltgodkjenning/auto-neste PASS. 86 eksisterende funksjoner og 102 relasjoner/RLS/ACL er identiske i Sandbox. Kenneths avgrensede produksjonsautorisasjon for isolert samlet rutinebehandling gjelder; ingen ny manuell Kenneth test påstås. Preview/CI, Production og kontrollert main → demo verifiseres før sluttmelding. [Kontrakt og bevis](docs/kshms/BULK_PUBLICATION_20261012.md).

## KS/HMS butikk-/lager-/truckrutiner og samlet egen lesebekreftelse – 12. oktober 2026

14 nye selvstendige rutineforslag gir 87 forslag totalt; de 73 eksisterende verifiseres uendret. Butikk, lager og truck har egen velger og vanlig utkast → tilpasning → godkjenning. Medarbeider, KS/HMS-ansvarlig og firmaadmin kan bekrefte alle egne aktive, tildelte, ubekreftede utgaver samlet etter uttrykkelig lest-og-forstått-avkrysning. Eksakt liste med titler/versjoner vises før handlingen. Enkeltbekreftelse og eksisterende historikk beholdes. Én additiv, selvbegrenset RPC lagrer kvittering/identitet og samme serverdato/-klokkeslett per ny utgave atomisk; nye tildelinger under gjennomgang avviser listen. Fersk own-scope readback kreves før UI-suksess. Alle 85 eksisterende KS/HMS-funksjoner og 102 relasjons-/RLS-/ACL-definisjoner er verifisert uendret i Sandbox, og syntetiske 87-utgaveprøver er rullet tilbake. Ingen endring av HR, salg, prosjekt, globale tilganger, worker/mail/cron eller PDF-eksport. Miljømål BEGGE innenfor Kenneths eksplisitte produksjonsautorisasjon etter isolert QA/Preview. [Kontrakt og QA](docs/kshms/BULK_ACK_STORE_20261012.md).

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

Skjermkartets forbindelser går bare mellom kortenes midtakser: én gren får en rett stamme, og tverrlinjer stopper ved ytterste gren. Linjene er 3 px; PDF bruker 0,65 mm. Leder og mellomleder har sentrerte navn/stillinger uten dybdeinnrykk. Vanlige medarbeideres innrykk og all lagrings-/tilgangslogikk beholdes. Faktisk React, jsPDF og full Sandbox critical/build PASS; Preview-visning kreves for dette kosmetiske tillegget. Tidligere TEST OK skal ikke gjentas. Se [omfang og QA](docs/kshms/ORGANIZATION_SHARED_20261011.md).

## TEST OK og generell veiledning – 11. oktober 2026 kl. 19:42 Europe/Oslo

Miljømål **BEGGE**. Kenneth har gitt **TEST OK** også for felles lesetilgang og sentrert kart. Tidligere HR/navn/kart-prøver er godkjent og skal ikke gjentas. Spørsmålet om hvem som ser eksemplene avdekket at Ringside-navn var lagt inn i felles veiledning og organisasjonskapittelet i Hjelp uten firmabegrensning. Disse eksemplene er erstattet med generelle navn/nivåer og venstre/midt/høyre. Hjelps oppdateringsdato er satt til 11.10.2026. Ingen kartnavn, avdelingsnavn, firmadata, tilgang eller lagringsflyt endres.

Rettelsen er tekst/placeholder og har ingen ny obligatorisk brukerprøve. Eksisterende faktisk React-kontroll krever nå generisk veiledning og fravær av andre firmas eksempler på et urelatert firmakart; alle eksisterende dataplasserings-/rettighetsprøver beholdes. Brukerens egne kartnavn vises fortsatt fra den autoriserte kartresponsen. Øvrige Hjelp-kapitlers omtale av leverandør/vareregister/produktmerke er utenfor denne kartrettelsen.

## Felles kart og sentrerte grener – 11. oktober 2026

Miljømål **BEGGE**, feature/Preview + Sandbox. Kenneths **TEST OK** på HR, firmavisningsnavn og forrige kartleveranse er registrert og beholdes. Nytt scope gjelder bare kartets felles lesetilgang og plassering.

Ett kart opprettes for de tilknyttede firmaene. **Vis hele kartet for brukere i hvert tilknyttet firma** åpner hele kartet for aktive brukere med KS/HMS i ett tilknyttet firma. Dette er uttrykkelig opt-in: eksisterende kart har uendret begrenset visning. Redigering/opprettelse krever fortsatt firmaadmin og KS/HMS i alle firmaene. Én tilgjengelig delt organisasjon åpnes automatisk; et bevisst valg av firmakart huskes. Ingen HR- eller medlemskapsrettigheter endres.

**Rekkefølge fra venstre** lagres på kortene: Expo Proffsenter 1, Ringside Rørleggerbedrift 2, Bademiljø Expo 3. Alle tre legges under Styret. Like brede grenfelt sentrerer det midterste kortet under Styret/Ringside AS. PDF bruker samme rekkefølge. Hjelp forklarer både oppsett og tilgang.

QA: 36 nye faktiske Sandbox-rollback-assertions PASS, også med én firmatilgang i hvert av de tre firmaene. 340 eksisterende funksjoner uendret; bare de åtte godkjente org-funksjonene endret. Ingen nye security-advisor-funn. Lokal PostgreSQL: 63 + 33 + 64 eksisterende og 36 nye PASS. Faktisk React, faktisk PDF-drawing/fersk tilgang og full Sandbox critical/build PASS. Nettleserinnlogging til flerfirmaflyt er ikke attestert. Ingen aktive kart, Production-innstillinger eller ekte medarbeiderdata er endret.

Fast Preview: https://expo-proffdok-git-fase45c-hr-sickleave-20261011-ringside.vercel.app/?progressTest=safe . Bare ny kartprøve: **Rediger kart → Vis hele kartet … → Lagre kart**, og rekkefølge 1/2/3 via **Rediger / flytt → Bruk endring → Lagre kart**. Kontroller samme felleskart med en konto som har bare ett tilknyttet firma. Tidligere HR/navn/mail-prøver gjentas ikke. [Kontrakt og QA](docs/kshms/ORGANIZATION_SHARED_20261011.md).

## Gjeldende HR-status og ny sykefraværsoppfølging – 11. oktober 2026

Eksisterende private kontaktopplysninger, medarbeidersamtaler og slettevarsler er godkjent og åpnet i Production fra main `61a42e6c7d996a6abc6c5146de45e3759e682b4d`. Kenneth har bekreftet faktisk mottatt slettevarselmail med receipt `544cd046-7e92-4ea0-a10c-6a6940bb67ec`. Disse testene skal ikke kreves på nytt som brukerprøve.

Ny funksjon har miljømål **BEGGE** og egen feature/Preview fra denne main: personlig sykefraværsoppfølging, felles plan/tiltak, kalenderfrister, dokumenterte vurderinger, egne bekreftelser, faktisk delingsjournal, avslutning og PDF. Nærmeste leder får påminnelser om frister og medarbeiderens åpne tiltak. Samme HR-arbeider dekker avtalte frister i vanlige medarbeidersamtaler og firmaadmins HR-kontrollfrist. Utsending er avslått i Preview; produksjonsaktivering følger ny relevant `TEST OK`. [Kontrakt, QA, kilder og release](docs/kshms/HR_SICK_LEAVE_CASES_20261011.md).

De tidligere kapitlene nedenfor er historiske fasebeskrivelser. Formuleringer om stengt HR-port eller fremtidige samtaler gjelder ikke gjeldende Production-status. Ny sykefraværsfunksjon er foreløpig ikke releaset til Production. Eksisterende KS/HMS-varsling er aktiv i Production; dette er ikke en attestasjon av alle øvrige frister i appen.

## HR: serverlagrede medarbeidersamtaler og slettevarsler – 11. oktober 2026

Miljømål **BEGGE**. Ny produksjonsfunksjon fra ren main, foreløpig feature/Preview: nærmeste leder starter en samtale på en registrert medarbeider; medarbeiderens private forberedelse deles uttrykkelig, felles referat/tiltak versjoneres, hver part kommenterer og bekrefter selv. Samtalen ligger i medarbeider-popupen og beholdes ved fanebytte og PDF. Alle snapshots inngår i eksisterende private purge-/restore-domene. Systemadmin får en minimal driftsmelding uten tilgang til samtaletekst. Ingen ny betalt testressurs. [Scope, QA og manuell gjenopprettingsrutine](docs/kshms/HR_CONVERSATIONS_20261011.md).

Migrasjonene åpner ingen innholds- eller e-postport. Ekte opplysninger er produksjonsmålet; dette er ikke en pilotbegrensning. Eksisterende Sandbox er åpnet for Preview etter grønn QA. Production er fortsatt stengt før TEST OK, konkret driftsoppsett og kontrollert release. Tidligere kapitler nedenfor beskriver tidligere leveranser og kan omtale samtaler som fremtidig arbeid.

## HR: sykefraværsoppsett – 10. oktober 2026

## Retur til samme KS/HMS-/HR-visning – 11. oktober 2026

Separat core-retting fra ren main: HR husker valgt medarbeider gjennom fersk tilgangskontroll; KS/HMS husker tillatt fane, også Les og bekreft på Min side. Dokumentuttrekk beholder omfang og dokumentvalg over interne fanebytter, og gamle eksporter avbrytes. Navigasjonsminnet har bare scoped skjerm-/post-ID-er; innhold hentes på nytt. Ingen full reload-recovery, backendendring eller samtaleøvelse følger denne rettelsen. Miljømål **BEGGE**, bare feature/Preview frem til TEST OK. [Kontrakt, regresjonstest og kort prøve](docs/kshms/NAVIGATION_RECOVERY_20261011.md).

Lagrede prøvesamtaler vises nå som en tydelig blå boks med ramme, større klikkflate og synlig tastaturfokus. Åpning og historikk er uendret.



**Release 10. oktober 2026:** PR #216 er merged og Production READY på main `c3d873e0`. Denne demo-branchen synkroniserer godkjent main og legger til [fiktive HR-/KS/HMS-kurseksempler](docs/DEMO_KSHMS_HR_COURSE_20261010.md) med egen veiledning og reset. Personlige HR-svar/sykefraværssaker forblir sperret. Tidligere «ingen main/demo/Production»-notater nedenfor er historiske fasebevis.
HR-menyen har nå egne snarveier til Samtalemaler og Sykefravær. Generell sykefraværsmal bruker eksisterende private malregister/RPC, versjoner, CAS og firmaadmin-gater. Additiv validator-migration tillater `sickleave`; ingen personlig innholdsport eller privilegier åpnes. Kildebasert veiledning og et datoregneksempel uten lagring/påminnelser. BEGGE, foreløpig bare feature/Preview/Sandbox. [Scope og bevis](docs/kshms/HR_SICK_LEAVE_SETUP_20261010.md).

## HR: tydelig hjelp der du arbeider – 10. oktober 2026

Synlig **Start her** viser oppsett → medarbeider/leder → samtalemal for firmaadmin, og relevant lesehjelp for leder/personlig bruker. Malbyggeren forklarer velg → tilpass → forhåndsvis/lagre, navn/tema/spørsmål, forberedelse/felles møte, kladd/Forkast og utgave/arkiv. En lagret mal starter ingen samtale og sender ingenting til ansatte. Bare presentasjon/hjelp; handlinger, roller, SQL og privat innholdsport beholdes.

Berørte faktiske HR-/mal-/Hjelp-React-prøver og full Sandbox critical/build PASS. Eksisterende tester beholdt uten nye speiltester. Miljømål BEGGE, bare feature/Preview; tidligere TEST OK beholdes. [Scope og bevis](docs/kshms/HR_HELP_20261010.md). CI/innlogget visuell Preview kontrolleres etter publisering.

## HR: versjonerte samtalemaler – 10. oktober 2026

Firmaadmin får **HR → Samtalemaler**: årlig medarbeidersamtale, prøvetid og oppfølging, egne tema/spørsmål, medarbeiderforberedelse/felles møte, forhåndsvisning og tydelig **Lagre mal**. Immutable malutgaver, historikk, gjenbruk som ny kladd, arkivering/gjenåpning, paginering og avvisning av samtidige revisjoner. Kladd beholdes i midlertidig aktør-/firmabundet minne over fokus/remount, først etter fersk admin-tilgang. Ingen ansattes svar, personreferater, signaturer eller fraværsinnhold åpnes.

**91 nye faktiske rollback Sandbox-assertions PASS**, samme 91 i fysisk PostgreSQL/PGlite med syntetisk plattformadapter. Faktisk ny mal-React og berørt HR/register/KS-meny/Hjelp-React PASS; permanent critical og full Sandbox build PASS. Fem live funksjonskropper matcher lokale MD5-er, tomt search_path og riktige ACL. Sandbox-migrasjon **20261010005833**, CLI **20261010004928**. Eksisterende 1 HR-firma/1 medarbeider beholdt; 0 aktive utviklermaler/utgaver/artifacts/filer/receipts. Privat innhold fortsatt content=false/restore quarantined. Første live prøving ble korrekt avvist av eksisterende profile-guard under endring av egen syntetisk aktør; fixtureoppsettet ble korrigert til eksisterende systemaktør, uten endret guard eller produktkode. Hele første prøve rullet tilbake.

Miljømål **BEGGE**, bare feature/Preview/Sandbox, draft PR #216. Tidligere O3/B/C/PDF/ZIP og Kenneth TEST OK beholdes; ingen Production/main/demo/e-post. Uavhengig varig manifest/automatisk eksport og DB-ack/full isolert Supabase database- og Storage-restore gjenstår før privat HR-kontakt og individuelle samtaler/fravær åpnes. [Scope, kontrakt og nye bevis](docs/kshms/HR_TEMPLATES_20261010.md).

**Faktisk mal-Preview-kontroll:** kode `70f12015b616e8e9b4c6e0efc06d82ab4e6df1ef`, Core Safety **38011669656 / jobb 114092844672 SUCCESS**, `dpl_6QTL7UM5H55ek25V7mrsqkEdyPys` READY med eksakt SHA/ref/prosjekt/fast alias. Direkte branch-env `EXPO_BACKEND_TARGET=sandbox`. Innlogget desktop: HR/admin, tre forslag, generisk kladd/redigering, tom forhåndsvisning, dirty bytte/Behold kladden, Oppdater maler med bevart kladd og Forkast PASS. Ingen testmal lagret. Ingen horisontal overflow; Lagre mal 44px. Lagret historikk/arkiv/CAS har SQL og React-bevis; mobil og separate samtidige browserøkter gjenstår. [Originalbilde og presise bevis](docs/kshms/HR_TEMPLATES_20261010.md#faktisk-innlogget-preview-og-kodepublisering).

**Faktisk O3 Preview-kontroll:** kode d4b5270e916dc06a764fbd35af36a8db6f238470, Core Safety 38009716896/jobb114086648809 SUCCESS, dpl_GKkbK6sdQd5si4yqYpeEd44NomJx READY eksakt SHA/Sandbox. Innlogget Skynett: ny kartvelger/bevart enkeltfirmakart/fokusretur/PDF to sider/fire demonavn PASS. Nytt felles kart er riktig skjult for demo uten to kvalifiserte firmaer; flerfirmahandlinger har SQL/React-bevis, ikke nytt browserbevis. Ingen aktiv rettighets-/kartendring. [Originalbilde og presise bevis](docs/kshms/ORGANIZATION_GROUPS_20261010.md#faktisk-innlogget-preview-og-kodepublisering).

## Organisasjonskart O3 – felles kart for flere firmaer, 10. oktober 2026

Miljømål **BEGGE**, leveres bare feature/Preview og Sandbox. Et separat felles organisasjonskart kan knytte **2–10 firmaer** sammen. Én brukerkonto kan ha forskjellig stilling og plassering i hver firmagren. Opprettelse lager Styret og sideordnede firmagrener; toppnavn og struktur kan redigeres med **Lagre kart**, og hele kartet kan slettes med uttrykkelig bekreftelse. Firmautvalget er fast i denne første versjonen. Eksisterende firmakart, brukere og HR beholdes.

**Hele felleskartet krever fersk KS/HMS i alle firmaene; redigering krever firmaadmin i alle.** En kartleder gir ingen ekstra redigering eller HR-innsyn. En bruker med ett firma ser sitt vanlige firmakart. Firmamedlemskap, avsluttet arbeidsforhold, tilbakekalling, firmagrense og revisjon kontrolleres på serveren ved hver handling. Ingen automatisk konto-/medlemskapsopprettelse eller modulaktivering.

**64 nye faktiske rollback Sandbox-assertions PASS**; fysisk PostgreSQL/PGlite **63 + 33 + 64 PASS**, faktiske nye/berørte React-flyter, permanent critical og full Sandbox build PASS. Felles PDF: **49 syntetiske personer / 51 firmaplasseringer / fire A3-sider**, alle tekst- og visuelt kontrollert. Samme person har tre ulike stillinger i tre firmaer. Dette er utviklerbevis, ikke nytt innlogget flerfirma-browserbevis. Sandbox-migrasjon **20261010002710** (CLI 20261010001921), ni live funksjonskropper/ACL/tomt search_path verifisert mot kilden. Ingen aktive felleskart opprettet, rettigheter utvidet eller HR-innhold åpnet.

[Scope, knapper, sikkerhetsprøver og presise bevis](docs/kshms/ORGANIZATION_GROUPS_20261010.md). Kenneths tidligere TEST OK/B/C/PDF/ZIP/SJA-bevis beholdes uten gjentatt omtest. Ingen main/demo/Production eller e-post. Privat HR-kontakt/samtale/fravær fortsatt stengt; uavhengig driftsmanifest/ack og isolert Supabase-restore gjenstår før åpning. Mobil, separate samtidige browserøkter og belastningstest på isolert database gjenstår som egne bevis.

**Feature/Preview 10. oktober – kartredigering:** eksplisitt Lagre kart, synlig redigering/flytting/sletting, frie toppnavn og tydelig tre. 33 nye + 63 berørte Sandbox assertions, faktisk React og fire syntetiske PDF-sider kontrollert. Flerfirma-Ringside-kart er avklart eget neste scope før deres Production. [Scope og bevis](docs/kshms/ORGANIZATION_EDITOR_20261010.md). Ingen Production/main/demo/e-post.

**Feature/Preview 10. oktober:** Organisasjonskart under KS/HMS, også uten HR-avtale: avdelinger, stillinger, lærlinger og egen PDF. 63 Sandbox assertions, berørt H1/H3 75/61, faktisk React og visuelt kontrollert syntetisk PDF PASS. Privat HR fortsatt stengt; ingen mail/merge/Production. [Scope og bevis](docs/kshms/ORGANIZATION_SCOPE_20261010.md). Skynett: faktisk kartvisning/dialog/fokusretur og PDF-nedlasting kontrollert på kode 0b638fc27d0b987cb61a54fc439727b4d03b5325; Core Safety 38005156679 SUCCESS, eksakt READY Preview/Sandbox. Originalbilder og kontrollgrenser er lagret i scope-dokumentet.

**Feature/Preview 10. oktober:** Kenneth TEST OK for KS/HMS-/HR-layout er mottatt. H5a gir privat slettemanifest-adapter med 38 lokale feil-/samtidighetsscenarioer og faktisk versjonslåst SDK på syntetisk HTTP; full Sandbox build PASS. Eksternt lager ikke opprettet: Vercel 403 forbidden. Privat HR fortsatt stengt; driftsbinding/DB-ack og isolert Supabase-restore gjenstår. [Scope og konkret blokkering](docs/kshms/HR_CLOUD_LEDGER_20261010.md). Ingen main/demo/Production eller e-post.

**Feature/Preview 9. oktober:** Min side og HR-tekstforslag er utviklerverifisert; privat adresse/pårørende fortsatt bak lukket HR-port. [Avgrenset scope og bevis](docs/kshms/PERSONAL_PAGE_20261009.md). Ingen Production/main/demo-release.

## H3 og samlet Hjelp – 9. oktober 2026

Miljømål **BEGGE**, bare feature/Preview og Sandbox, draft PR #216. Hjelp har nå ett **KS/HMS**-punkt med 11 kapitler og ett **HR**-punkt; tidligere hjelpeinnhold beholdes. HR-slettefundamentet omfatter registrert innhold, versjoner, kladder, søkeuttrekk, eksporter og private filer. Tilgang sperres straks; **Slettekvitteringer** viser pågående filsletting og ferdig sletting korrekt.

**61 nye faktiske Sandbox-assertions PASS**, faktisk privat Storage-opplasting/hashkontroll/API-sletting av én syntetisk 62-bytes fil PASS, faktisk HR/Hjelp-React og full critical build PASS. Alle 16 live SQL-funksjoner og Edge v3 er lest tilbake mot kilden. Sensitivt HR-innhold og filnedlasting er fortsatt stengt, både i databasen og i Edge-koden. Uavhengig slettemanifest og full isolert backup-restore er neste sikkerhetsbevis før åpning. Sandbox har nå én firmaoppføring og én medarbeider; eksisterende oppføring beholdes, ingen sensitive data eller testrester finnes. Ingen e-post, merge eller Production. Kenneths **TEST OK for H2-menyen** er mottatt; eldre B/C/PDF/ZIP-bevis beholdes. [Scope, kontrakt og QA](docs/kshms/HR_PURGE_FILES_20261009.md).

## HR-register og smartere KS/HMS-meny – 9. oktober 2026

Miljømål **BEGGE**, levering bare feature/Preview/Sandbox, draft PR #216. H2 gir eget HR-hovedvalg med firmaadmins medarbeider-/leder-/leserregister og medarbeiderens Mine oppfølginger. HR har fortsatt ingen samtale-/fraværsinnhold, filer eller eksport; full innholdspurge/restore må leveres før sensitivt innhold åpnes. Ingen firma aktivert av leveransen. KS/HMS-menyen er gruppert i Daglig arbeid, Mine rutiner og Forvaltning; eksisterende faner, snarveier og utkastbevaring beholdes.

**16 nye faktiske Sandbox-assertions PASS**, faktisk HR/meny-React og berørt håndbok/kildeforslag-React PASS, permanent hook/tilgang/revisjon/late-response-prøve og full critical build PASS. Fem HR-FK-indekser forbedrer slettestien. Skynettleseren fungerer igjen; faktisk ny layout etter publisering og eksakt SHA/CI/Preview føres i PR #216. Tidligere Kenneth TEST OK og B/C/PDF/ZIP-bevis beholdes uten ny obligatorisk omtest. Ingen mail/merge/Production. Neste: privat fil-/full slettekontrakt. [Scope og QA](docs/kshms/HR_UI_MENU_20261009.md).

---

## HR H1 – første sikkerhetsfundament, 9. oktober 2026

Firmabundet medarbeider-/lederregister, eksplisitte ekstra lesere, fersk tilgang og fysisk sletting av register/tildelinger er levert i feature/Sandbox. **75 faktiske rollback-assertions PASS**, permanent klientprøve og full critical build PASS; alle ti live funksjoner byteidentiske. HR er deaktivert for alle firmaer, private filer stengt og tomme. Dette er backend uten ny HR-meny, referat, fravær eller eksport. Full sletting av fremtidig HR-innhold/filbytes og restore er ikke levert. Neste: HR-registerets brukerflate, deretter privat fil-/innholdspurge før sensitivt innhold. Tidligere TEST OK beholdes; ingen ny Kenneth-prøve eller browser-PASS. Miljømål **BEGGE**, bare feature/Preview; KS-e-post fortsatt disabled. [Scope, QA og grenser](docs/kshms/HR_FOUNDATION_20261009.md). Publisert SHA/CI/Preview føres i draft PR #216.

---

## KS/HMS – B/C-sluttkontroll og drift

Samlet B/C-utviklerreview er gjennomført, med påminnelser for alle seks typer. [Sluttstatus og lesende driftsmålinger](docs/kshms/BC_CLOSEOUT_20261009.md) viser hva som er levert og hvilke konkrete bevis som gjenstår før release/større utrulling. Tidligere TEST OK beholdes. Neste utviklingspunkt er det avklarte HR-fundamentet. E-post skal aktiveres og mottak verifiseres ved senere godkjent Production-release.

---

## Oppgavepåminnelser – feature/Sandbox

KS/HMS følger opp dine ufullførte vernerunder, risikovurderinger, SJA og lesebekreftelser etter minst sju dager. Snarveier åpner eksisterende arbeidsflater; fullføring og egen bekreftelse/signering lagres fortsatt av deg. Styrt ukentlig e-postoppfølging er klar i privat kø; Sandbox-transport er fortsatt deaktivert. [Scope og QA](docs/kshms/TASK_REMINDERS_20261009.md). Tidligere TEST OK beholdes.

---

## Håndbokrevisjonspåminnelse – feature/Sandbox

Utpekt ansvarlig ser nær/passert revisjonsdato og åpner eksisterende skjema med **Åpne håndbokrevisjon**. Egen vurdering og **Signer revisjon** lagrer gjennomgangen. Styrte ukentlige påminnelser er klare i privat kø; e-posttransport er fortsatt deaktivert. [Scope og utviklerbevis](docs/kshms/REVIEW_REMINDERS_20261009.md). Tidligere TEST OK beholdes.

---

## KS/HMS – samlet B/C-status

Den [samlede planoversikten](docs/kshms/OVERSIKT.md) viser faktisk leveranse og gjenstående funksjoner/bevis. Ti dokumentgrupper er kontrollert sammen i PDF og ZIP; underskjema, avvik/RUH-påminnelser og kildeoppdatering er levert i feature/Sandbox. Tidligere TEST OK beholdes. [Gjennomgang og testbevis](docs/kshms/BC_REVIEW_20261009.md). Ingen Production-release eller generell e-postaktivering.

---

## Kildeoppdateringsforslag – feature/Sandbox

Oppfølging og revisjon viser nyere sentrale tekstforslag og vurderte utkast som fortsatt må godkjennes. Sammenlign firmaets tekst med forslaget; velg bare feltene dere trenger. Ett felt markerer ikke hele forslaget som vurdert. **Jeg har vurdert hele tekstforslaget**, **Lagre utkast** og firmagodkjenning er separate handlinger. Gamle godkjente utgaver og ansattbekreftelser beholdes. Nettkilder kontrolleres manuelt. [Scope og QA](docs/kshms/SOURCE_UPDATES_20261009.md).

---

## Fristpåminnelser for avvik/RUH – feature/Sandbox

Oppgavelisten skiller passert frist, frist i dag og frist innen tre dager i norsk tid. Åpne avvik/RUH får styrte ukespåminnelser via eksisterende privat leveringskø når e-post senere aktiveres. Kø og leveringskontroll følger ansvarlig, frist og gjeldende tilgang; gamle perioder og reaktiverte køer spilles ikke av. Transport forblir deaktivert i Sandbox. [Scope og QA](docs/kshms/DEVIATION_REMINDERS_20261009.md).

---

# KS/HMS – versjonerte underskjema i Sandbox

Sjekklistesentral kan feste en eksakt publisert underskjemaversjon etter et punkt. Publisering lagrer rotpunkter, ferdig utføringsliste og komplett dependency-ID/hash/snapshot. Syklus, fremmed/arkivert mal og mer enn 100 ferdige punkter stoppes server-side. Eksisterende prosjekt- og selvstendige kontroller bruker samme utførelsesmodell; gamle publiserte utgaver omskrives ikke. Tom mal-PDF viser child-versjonene. [Scope/testbevis](docs/kshms/CHECKLIST_SUBFORMS_20261009.md), [kort prøve](docs/kshms/USER_TEST.md). Bare feature/Sandbox; Production er ikke godkjent.

---

# KS/HMS – egne rutine- og sjekkliste-PDF-er

Godkjente rutineutgaver og publiserte sjekklistemaler kan lastes ned. Lagrede prosjektkontroller har egen PDF med svar, bilder og eventuell fullføring. Utkast/maler og historikk merkes; tilgang og lagret innhold leses på nytt. Ingen automatisk deling eller egen ansattbekreftelse. [Omfang/testbevis](docs/kshms/DOCUMENT_PDF_20261008.md), [kort prøve](docs/kshms/USER_TEST.md). Samme feature/Sandbox; Production er ikke godkjent.

---

# KS/HMS – kompakt prosjektoversikt

Avvik/SJA/RUH starter med lukkede SJA-, RUH-, kontroll- og risikogrupper med antall/status. Sjekkpunkt- og prosjektavvik vises som lukkede rader med åpne saker først. Eksisterende redigering og oppfølging består. [Omfang og tester](docs/kshms/PROJECT_OVERVIEW_20261008.md), [kort brukerprøve](docs/kshms/USER_TEST.md). Samme feature/Sandbox før Production-godkjenning.

---

# KS/HMS – kontroll-/risiko-PDF i Sandbox

Lagrede vernerunder/kontroller og 5×5-risikovurderinger har **Last ned PDF**, med firmaprofil, lagrede bilder, farget matrise, tiltak og lagret fullføringsinformasjon. Utkast merkes under arbeid; ulagret tekst må lagres først. Prosjektets **Velg KS/HMS til rapport** inkluderer nå uttrykkelig valgte kontroller og risiko sammen med SJA/RUH. Ingen dokumenter tas automatisk med eller legges i portal. Ny lesende Sandbox-RPC; Production er uendret. [Omfang og testbevis](docs/kshms/EXECUTION_PDF_20261008.md), [gjeldende planstatus](docs/kshms/OVERSIKT.md).
---

# Expo ProffDok

KS/HMS har prosjektkoblede SJA-er og RUH-er. I Rapport/PDF/utskrift velger brukere med modultilgang hvilke dokumenter som skal følge rapporten. SJA viser lagret rutinehenvisning, deltakere og prosjektleders signatur; RUH viser tiltak, ansvarlig, status og eventuell dokumentert lukking. Utkast og åpne saker merkes tydelig. Rapportvalget tømmes helt ved prosjekt-, firma-, bruker- eller rollebytte. Samme feature/Sandbox Preview, før produksjonsgodkjenning. [Rapportomfang og testbevis](docs/kshms/PROJECT_REPORT_20261008.md). Tidligere TEST OK for SJA-utkast/RUH-oppfølging består.

Preview 07.10.2026: Retur fra generell ordre bevarer Reacts gjeldende menynavn, slik at Startsiden fortsatt bruker den kompakte Meny-knappen. Den faktiske returfeilen er gjenskapt og har fast runtime-regresjonsvern samt en React-prøve med appens menyadaptere. Se [menyprøven](docs/kshms/MENU_RETURN_20261007.md). KS/HMS er fortsatt kun feature/Preview.

Expo ProffDok er en produksjonsapp for håndverks- og prosjektbedrifter. Løsningen støtter prosjektstyring, dokumentasjon, sjekklister, bilder, avvik, kunde-/UE-portal, garanti, befaring, Badskisse, ordinære tilbud, Generelt tilbud, digital aksept, kontrakt og rapport/PDF.

Produksjon: https://expo-proffdok.app

**Produksjonsbaseline:** kontrollert 2026-10-05: `main` er `155f6c4`, Vercel Production er READY på samme SHA. Godkjent PR #214 gir firmakunder og mva.-visning, og tidligere Cordel-/prosjekt-/tilbudsfunksjoner er bevart. KS/HMS trinn A er fortsatt feature/Preview og ikke produksjonsgodkjent. Se [gjeldende release-status](CURRENT_RELEASE_STATUS.md).

## Cordel-eksport

Cordel-eksporten finnes ved aksepterte/aktiverte tilbud, prosjektets kontraktkort og plukklister. Tilbud lastes ned som én ZIP med jobbliste og AFG-spesifikasjon, og leses direkte inn i en tom Cordel-ordre. AFG alene brukes uten jobbliste; ved jobbliste brukes begge importer med jobbliste først. Faste filnavn i `P:\Expo ProffDok` gjør at importdefinisjoner kan gjenbrukes. A–Å-veiledningen ligger under **Hjelp → Eksport av tilbud til Cordel**. Se [Cordel-modulen](src/modules/cordel/README.md) for kildegrunnlag, validering og pris-/kostbegrensninger.

## Teknologi

- React / Vite
- Supabase Postgres, Auth, Storage, RLS og RPC
- Supabase Edge Functions
- Resend
- Vercel
- jsPDF / pdf-lib
- GitHub

## Repository – hovedstruktur

```text
src/
├── main.jsx                 # sentral app-orkestrering
├── bootstrap.jsx
└── modules/                 # app, access, sales, storeCatalog, project, progress, portal, help, report m.fl.

docs/
└── architecture/            # gjeldende arkitekturkart og fasespesifikke sikkerhetsnotater

scripts/
├── critical-pr-scope-guard.mjs
├── critical-build-check.mjs
├── critical-systemadmin-broadcast-email-check.mjs
├── critical-sales-recovery-check.mjs
├── critical-sales-tab-resume-check.mjs
├── critical-sales-entry-resume-check.mjs
├── critical-sales-server-hydration-check.mjs
├── critical-sales-lazy-loading-check.mjs
├── critical-work-profile-check.mjs
├── critical-project-navigation-check.mjs
└── øvrige målrettede guards
```

Detaljert nå-arkitektur: [docs/architecture/EXPO_PROFFDOK_ARCHITECTURE.md](docs/architecture/EXPO_PROFFDOK_ARCHITECTURE.md)

Sales-domene: [src/modules/sales/README.md](src/modules/sales/README.md)

Internt vareregister / Fase 39B: [docs/architecture/FASE39B_INTERNAL_STORE_CATALOG.md](docs/architecture/FASE39B_INTERNAL_STORE_CATALOG.md)

Plukklister på PC/mobil og tilbudsskanning: [docs/architecture/MOBILE_PICKLIST_AND_GENERAL_OFFER_SCAN.md](docs/architecture/MOBILE_PICKLIST_AND_GENERAL_OFFER_SCAN.md)

## Kritisk produksjonsarkitektur

- Sales-oversikten bruker lett summary/lazy loading; komplett sak hentes først når brukeren åpner den.
- Komplett valgt Sales-sak skal være server-hydrert før editor/autosave aktiveres.
- Ny forespørsel og nytt tilbud skal tåle PC-fanebytte og mobil appbytte også før saken har fått `request_ref`.
- Bevisst brukerhandling vinner alltid over automatisk recovery. Bare den faktiske Befaring/Tilbud-arbeidsflaten kan armere Sales-recovery; gjenbrukte kontraktkomponenter i Prosjekt skal ikke trekke brukeren tilbake til Sales etter fanebytte eller oppfriskning.
- Systemadmins ordinære prosjektarbeidsflate følger valgt **Representerer**-firma; brede supportrettigheter skal ikke blande firma i vanlig prosjektliste.
- Nye prosjektrader får `company_scope_id` fra aktiv arbeidsprofil i en server-side `BEFORE`-trigger før RLS validerer innsettingen.
- Nye rader i garantiregisteret arver prosjektets `company_scope_id` i en server-side `BEFORE`-trigger, og en separat trigger avviser garanti når signert kontrakt ikke finnes i Avtalegrunnlag. Migrasjonen er idempotent og gjenoppretter samme vern i Sandbox-baselines som mangler triggerne.
- Låsing og opplåsing av prosjekt går gjennom `set_project_lock`, som kontrollerer prosjekt-/firmatilgang og oppdaterer både radens låsekolonner og speilet i `projects.data` atomisk. En idempotent parity-migrasjon gjenoppretter samme Production-RPC i eldre Sandbox-baselines.
- Prosjektets sky-autolagring sammenligner normalisert data og tittel med serverraden før `PATCH`; ren gjenåpning eller oppfriskning skal ikke flytte `updated_at`. Etter en reell, bekreftet sky-lagring nullstilles «ulagret»-flagget bare når samme snapshot fortsatt er gjeldende, slik at unødige navigasjonspopuper fjernes uten å kunne skjule nyere endringer.
- Desktop prosjektarbeidsflate bruker kollapset meny med få native hurtigvalg; full funksjonsliste ligger fortsatt i Meny.
- Prissøk på mobil har `← Startside`, som avslutter aktivt Prissøk og rydder resume-markøren uten reload. `Skann strekkode` lastes ved behov, foretrekker bakre kamera og setter EAN/GTIN i det eksisterende read-only RPC-søket. Kamerasporet stoppes ved treff, avbrudd, navigasjon og bakgrunning; kamera/bilde lagres eller lastes ikke opp. Manuell EAN-inntasting fungerer hvis kameratilgang mangler. Kameraskanning finnes bare på mobil.
- Interne brukere kan opprette og redigere plukklister med antall og valgfritt Cordel-ordrenummer på både PC og mobil. Inntil tre lister per bruker med maks 30 ulike varer lagres uten priser eller kameradata. **Skriv ut plukkliste** viser antall/ordrenummer uten priser; PC har i tillegg **Skriv ut priser**, med eksplisitt valg av interne priser for brukere med egen rettighet. Cordel-registreringen er fortsatt manuell. Mobilskanning i Generelt tilbud fyller søket i aktuell post eller opsjon; brukeren velger selv varen før tilbudskladden oppdateres. Tilgang og prisfelter kontrolleres fortsatt på serveren.
- Tilbudsrecovery skiller mellom lokal sikkerhetskopi og aktiv kladd. Et valg knyttes til sikkerhetskopiens stabile revisjon, slik at senere autolagring av aktiv kladd ikke viser samme valg om igjen. Valgt kladd bevares også når en separat serverkonflikt må håndteres, og varig autolagring forsøkes på nytt etter recovery-overgangen.
- Ordinært akseptert tilbud kan gå videre til prosjekt uten kontrakt, egen opplastet kontrakt eller Expo-kontrakt. Hvis Expo-kontrakt ikke ble opprettet før prosjektaktivering, kan samme låste aksept og kontraktmotor åpnes direkte fra prosjektets **Avtalegrunnlag** uten retur til Sales. Åpning av en allerede synkronisert sluttkontrakt er ren lesing og skal ikke berøre prosjektets endringstidspunkt. Kontrakt er valgfri med mindre garanti-/avtalegrunnlaget krever den.

## Fase 45B – Proff, Generelt tilbud og Enkel ordre

- Tilgang til Expo ProffDok forutsetter at virksomheten kjøper og benytter SoPro-produkter i relevant omfang, slik gjeldende brukervilkår beskriver.
- Kun Systemadministrator kan aktivere Proff-vareregisteret for et eksternt firma, styre leverandører/rabatter og slå på **Generelle tilbud** for firmaet. Tilgangen gjelder automatisk alle nåværende og nye brukere i firmaet. **Enkel ordre** velges først etter at kunden har akseptert tilbudet.
- Ekstern proffkunde søker bare i godkjente leverandører. Ringsides interne innkjøps-/nto-pris, innkjøpsrabatt, DG og påslag skal aldri eksponeres.
- «Din nto pris» er en egen bruker- og firmascopet rettighet. Firmaadmin kan administrere egne brukere, men kan ikke gi rettigheten til seg selv. Intern Ringside-nto krever fortsatt eksplisitt `view_internal_net_prices`.
- Den synlige betegnelsen er **Generelt tilbud**. Teknisk legacy-identitet beholdes der det er nødvendig, og historiske Butikktilbud skal fortsatt åpnes og fungere.
- Brukervilkårstatus, firmaets Proff-status og brukerens modultilgang er separate forhold. Manglende aksept av ny vilkårsversjon skal vises separat og skal ikke feilaktig presenteres som årsak til at Systemadmin ikke kan tildele modulen.
- Etter aksept av et Generelt tilbud kan firmaet velge **Enkel ordre** eller ordinært prosjekt. Akseptert versjon og valgte alternativer er låst bestillingsgrunnlag.
- Enkel ordre bruker en lett prosjektmotor med produkter, bilder, relevante sjekklister, UE og sluttdokumentasjon. Fremdriftsplan og FDV er valgfrie. Kundeportal er blokkert.
- Kundepreview åpnes separat og er read-only. Den skal ikke publisere, sende e-post eller kunne akseptere tilbudet.
- Tilbudsmaler kan gjenbruke varige app-/Storage-bilder på poster og opsjoner. Midlertidige nettleserbilder og kundespesifikke PDF-vedlegg følger ikke malen.
- Kontrakt-PDF holder sammenhengende avsnitt samlet og bryter opsjonskort kontrollert uten å skille beskrivelse fra pris.
- Sluttflyten er overtagelse/signering → garantiutstedelse → komplett PDF → låsing. PDF-en skal bruke samme effektive garantivilkårstatus som appen, vise faktisk genereringstidspunkt og bevare autentisert aktør på automatisk arkivert kontrakt og nye Fag/utstyr-poster.
- «Fullfør overtagelse og lås prosjekt» er i seg selv en eksplisitt låsehandling. Etter eventuelt valg om kundeutsendelse skal appen ikke vise en ekstra identisk låsebekreftelse.

## Systemadmin – felles e-post

- Systemadministrator velger mottakergruppe og klassifiserer hver utsending som **Driftsmelding** eller **Nyheter og markedsføring**.
- Mottakerlisten løses i Edge Function og eksponeres ikke samlet i nettleseren. Hver mottaker får en separat e-post.
- Markedsføring går bare til brukere med aktivt, frivillig samtykke. Samtykket kan endres under Innlogging og brukerprofil, og hver markedsførings-e-post har personlig avmelding.
- Før reell sending må mottakertallet kontrolleres og en test sendes til innlogget systemadministrator.
- Avsendernavnet er Expo Proffsenter og Expo Proffsenter-logoen ligger i e-postmalen. Visning som profil-/avatarlogo i mottakerens innboks styres av e-postleverandøren og kan ikke garanteres av appen.

## Permanent Demo Sandbox

Expo ProffDok har et separat, langlivet demomiljø for presentasjon og opplæring:

- branch: `demo`
- fast host: `https://expo-proffdok-git-demo-ringside.vercel.app`
- separat Sandbox-Supabase: `ppvircenkjizeiqdxphj`
- egen Auth, database, Storage, Golden/reset og fiktive/sanitiserte demodata
- `demo` skal **aldri merges til `main`**
- ordinær appkode synkroniseres kontrollert **main → demo** etter godkjent Production-verifisering når endringen også skal finnes i demo
- demo-overlay, demodata, syntetiske ressurser og sandbox-konfigurasjon skal aldri flyte **demo → main**
- demo-builden skal feile dersom Production-Supabase blir bundet inn i emitted JS

Fase 45B-hotfix-Preview bygges fra en ren `main`-basert branch mot isolert Sandbox-Supabase, men er ikke permanent Demo og skal ikke hente produktregler eller kode tilbake fra `demo`.

Sandboxen har egen demo-/kursmigrasjonslinje og skal aldri branch-merges til Production. Production-endringer skal komme fra versjonerte migrasjoner i en `main`-basert og godkjent release.

Detaljert demo-dokumentasjon ligger på `demo`-branchen.

## Utviklings- og mergepolicy

`main` er produksjonsbranch og kilde til sannhet.

Før kodeendring skal miljømål oppgis som:

- `Miljømål: PRODUKSJON/PREVIEW`
- `Miljømål: SANDBOX/DEMO`
- `Miljømål: BEGGE`

For brukerrettede produksjonsendringer:

1. Opprett feature-/hotfix-branch fra gjeldende `main`.
2. Kjør `npm run build` og relevante critical checks.
3. Test Vercel Preview på desktop og mobil der relevant.
4. Kontroller både ny funksjon og berørte eksisterende brukerreiser.
5. Ikke merge før eksplisitt `TEST OK`.
6. Etter merge: bekreft eksakt `main`-SHA, Vercel Production `READY`, HTTP/runtime og relevant Supabase-status.
7. Ved miljømål `BEGGE`: synkroniser deretter gjeldende `main` kontrollert inn i `demo` og kjør sandbox-preflight.

Når Fase 45B er merget og Production er trippelverifisert, ryddes midlertidige release-/feature-/backup-brancher. Sluttbildet skal være kun `main` og permanent `demo` i GitHub, og kun Production/default samt `demo-sandbox` i Supabase. Opprydding skal aldri skje før godkjent Production-QA.

`PR Core Safety` kjører på pull requests mot `main` og skal stoppe Demo/Test-PR-er som samtidig forsøker å endre beskyttet kjerne.

## Dokumentasjonsregel

Repositoryet skal kunne overtas av en kvalifisert utvikler uten tilgang til tidligere ChatGPT-samtaler.

- Endret arbeidsflyt, begreper, knapper, roller eller brukeropplevelse → oppdater HJELP i samme runde.
- Endret datamodell, modulansvar, Storage, RPC, RLS, sikkerhetsmodell eller større teknisk struktur → oppdater arkitekturkartet.
- Sales-endringer vurderes mot Sales README.
- Vareregister-/katalogendringer vurderes mot Fase 39B-arkitekturdokumentet.
- Arbeidsprofil/systemadmin-endringer vurderes mot `critical-work-profile-check.mjs` og arkitekturkartet.
- Viktige utsatte produktvalg registreres som GitHub issue.
- Root README skal være kort og fungere som inngangsdør, ikke duplisere detaljdokumentasjon.

Ikke skriv secrets, passord, service_role keys, ERP-prisfiler eller andre sensitive verdier i README eller docs.

## Kritiske sikkerhets- og kompatibilitetsregler

- RLS og serverkontroll er sikkerhetsgrensen; frontend alene er ikke nok.
- Ikke svekk company-scoping eller bruk systemadmin/supportmodus som write-bypass.
- Prosjekter åpnet på tvers av firma i eksplisitt Systemadmin-supportmodus er skrivebeskyttet. Salgsgrunnlag og Avtalegrunnlag tillater kontroll og åpning av eksisterende tilbud, akseptbevis, kontrakter og øvrige dokumenter, mens lagring, opplasting, fjerning, kopiering, låsing og andre endringer er blokkert. Supportoversikt går tilbake til samme firmas supportvisning uten å avslutte supportmodus.
- Aktiv arbeidsprofil/representert firma skal styre normal arbeidsflate.
- Publiserte og aksepterte tilbud er immutable historikk.
- Ingen historisk backfill uten eksplisitt beslutning.
- Bevar Sales recovery/hydration, lazy loading, regelen «brukerhandling vinner» og IndexedDB-/serverbevaring av befaringsbilder og Badskisse.
- Summary-data skal aldri skrives tilbake som komplett Sales-payload.
- Ikke endre Storage-policyer, offentlige/private filer eller historiske URL-er uten egen migreringsplan.
- Privatkundepriser vises inkl. mva.
- Intern ERP-nettopris skal aldri lekke til kundelenke, tilbuds-PDF eller publisert Sales-historikk.
- Historiske Butikktilbud beholder tidligere avslutning og skal ikke endres. Nye Generelle tilbud kan etter aksept aktiveres som Enkel ordre eller ordinært prosjekt.
- Aksept-/avvisningsvarsler skal være sekundære sideutfall: en e-postfeil skal aldri reversere kundens allerede lagrede beslutning.
- `main.jsx` og store Core-filer skal bare splittes når det gir reell vedlikeholdsgevinst.

## Start her som ny utvikler

1. Les `AGENTS.md` og `PROJECT_GUARDRAILS.md`.
2. Les [arkitekturkartet](docs/architecture/EXPO_PROFFDOK_ARCHITECTURE.md).
3. Les [Sales README](src/modules/sales/README.md) før endringer i befaring/tilbud/aksept/kontrakt/Generelt tilbud/recovery/lazy loading.
4. Les [Fase 39B](docs/architecture/FASE39B_INTERNAL_STORE_CATALOG.md) før endringer i vareregister, ERP-import eller katalogtilgang.
5. Les relevante HJELP-moduler før brukerrettede endringer.
6. Kontroller åpne GitHub issues, åpne PR-er og siste legitime `main`-SHA.
7. Kontroller Production og Supabase-status før større arbeid.
8. Endre minst mulig per runde og beskytt produksjon foran alt.


### Cordel: importvalg og brukertilgang (05.10.2026)

Samme eksport beholdes for våtromstilbud og generelle tilbud. AFG kan importeres alene uten jobbliste, med ønsket ordremetode. Ved bruk av jobbliste må jobblistefilen importeres først, med tilsvarende jobblisteoppsett i Cordel, deretter AFG uten sletting. 0 % materiellpåslag og øreavrunding kreves for å beholde akseptert pris også ved AFG alene. Den bekreftede Cordel-testen gjelder den kombinerte flyten; AFG alene med andre metoder må kontrolleres hos mottaker. Prisposter er fortsatt Rundsum; faktisk timebudsjett og kildekost følger ikke med.

Systemadmin → bruker → **Eksport til Cordel** styrer tilbudseksport, plukklisteeksport og det spesifikke Hjelp-temaet samlet. Godkjent, aktiv Systemadmin har automatisk tilgang; andre brukere må få den eksplisitt. Firmaadmin kan ikke tildele den. Grantet bindes til brukerens firma; firmabytte krever ny tildeling. Eksisterende datatilgang og pristilganger gjelder i tillegg. `cordel_export_user_access` er RLS-beskyttet uten direkte klientrettigheter; avgrensede RPC-er leser egen tilgang og lar kun Systemadmin administrere. UI feiler lukket og sjekker tilgang på nytt før nedlasting.

## Firmaets kunder og prisvisning i tilbud

Kundeinformasjon kan frivillig lagres i firmaets kunderegister fra prosjekt eller forespørsel/tilbud. Velg **Lagre i firmaets kunderegister** og deretter **Lagre kunde**; engangskunder trenger ikke lagres. Søk og velg faste kunder for å fylle kundedata på nytt. Kontroller prosjektadressen. Registeret er låst til innlogget arbeidsfirma på serveren.

Begge tilbudstyper starter inkl. mva. **Vis priser eks. mva.** velges per tilbud i editoren og følger kundepreview, publisert kundelenke, akseptvisning og tilbuds-PDF. Valget fryses i tilbudsversjonen; eks. mva. er prisvisning, ikke avgiftsfritak. Mva. og total inkl. mva. vises ved totalsummen. Gamle versjoner uten flagget beholder inkl. mva.

I Generelt tilbud velges prisvisningen i den aktive grupperte tilbudsbyggeren under «Prisvisning til kunden». Forhåndsvisning og editorens grunnsum følger valget.

Kunderegisteret har nedtrekksmeny og søk på navn/e-post i egen ramme. Frivillig kundelagring ligger nederst i kunde-/tilbudsskjemaet, før Opprett tilbud, med avkrysning av som standard og egen Lagre kunde-knapp. Eks. mva. brukes vanligvis for bedriftskunder.
# KS/HMS – håndbokfundament i Preview/Sandbox

KS/HMS videreutvikler eksisterende ProffDok. [Plan og faktisk gap-analyse](docs/kshms/PLAN.md), [full kapittel-/rutinedekning](docs/kshms/COVERAGE.md) og [QA-status](docs/kshms/QA.md) beskriver hele minimumsomfanget. Trinn A gir firmaktivering, firmabundet ansattilgang, flerfaglig oppstart, 73 selvstendige tilpasningsutkast, blank/kopi, kapitler, kladd/godkjent versjon, ansattbekreftelse og signert årlig revisjon. Det er ikke et komplett KS/HMS-system; utførelse/SJA/risiko, samlet firmavvik, varsler/PDF og begrenset personal/stoffkartotek gjenstår i registrerte trinn.

I håndboken kan flere standardrutiner hukes av samtidig. Kortene viser «Valgt», og «Disse rutinene legges inn» viser hele utvalget før **Legg inn** lagrer hver rutine som en firmakladd. «Utkast – må godkjennes» og **Rediger her** viser hvor den enkelte rutinen tilpasses. Godkjente utgaver viser «Godkjent vN». Firmaets rutiner er hovedlisten; forslag ligger under **Legg til flere rutiner**. «Anbefalte» og «Alle forslag» deler samme utvalg. Allerede aktive rutiner beholdes ved ny innlegging; eksisterende tilpasninger overskrives ikke. Firmaadmin eller KS/HMS-ansvarlig godkjenner publisering separat. De 73 forslagene dekker temaene i begge håndbøkene, også personal/HR og VVS. Kapittelvalg og søk bevarer avkrysninger. Firmaets utgaver og bekreftelser endres ikke automatisk.

Systemadmin aktiverer firmaets modul, firmaadmin styrer ansattes tilgang; firmaadmin og KS/HMS-ansvarlig kan publisere, og utpekt KS/HMS-ansvarlig signerer revisjon. Firmaadmin kan velge seg selv som ansvarlig uten et ekstra grant; signering krever fortsatt eksplisitt utpeking i oppstart. De tre oppstartsfeltene får redigerbare fagtilpassede tekstforslag; lagret eller egen tekst beholdes. Fagvalget heter VVS. Samme arbeidsfirma ved faneretur beholder visning og ulagrede felt, i tråd med eksisterende Sales-kontroll for arbeidsprofil. Alle API-operasjoner kontrollerer aktivt firma og rolle. Ingen pris-/betalingsintegrasjon innføres. Production er ikke endret, og ny TEST OK kreves før merge. Preview-branchen må ha eksplisitt `EXPO_BACKEND_TARGET=sandbox`.

Alle KS/HMS-faner forklarer hva brukeren gjør der og hva som kommer etterpå. Utkast, versjon og revisjon forklares med korte setninger; rutinefeltene har konkrete skrivehjelper. Grensesnittet bruker **Lagre utkast**, **Les forslag** og **Alle forslag**. [Brukertestlisten](docs/kshms/USER_TEST.md) gir handling og forventet resultat. Den faste branch-Preview-adressen oppdateres ved nye deployer; samme nettleser/adresse skal normalt beholde aktiv innlogging. Tekstendringen innfører ingen ny innlogging eller endring i auth-/firmascope.

**Åpne godkjenning** viser og fokuserer riktig rutine; dette publiserer ikke. Firmaadmin eller KS/HMS-ansvarlig leser teksten og fyller ut **Hva er vurdert eller endret?** før **Godkjenn og publiser** blir aktiv. Etter bekreftet lagring åpnes neste rutine som trenger godkjenning, med tomt vurderingsfelt. Antall faktisk godkjente rutiner vises. Etter siste godkjenning forsvinner godkjenningspanelet, og **Håndboken er klar** med **Neste: Ansattes gjennomgang** vises både øverst og nederst. Siden fokuserer kortet nederst; knappen åpner oppfølgingen. Allerede fullførte håndbøker får også knappen nederst. En grå publiseringsknapp betyr at vurderingen mangler, ikke at rutinen er godkjent. Gjentatt åpning av samme rutine beholder vurderingsteksten. Manglende vurdering og serverfeil vises ved godkjenningen; en feil går ikke videre.

Ansatte åpner KS/HMS direkte i **Les og bekreft**, med antall rutiner som gjenstår og egen versjons-/bekreftelsesstatus. Etter lagret egen bekreftelse åpnes neste tildelte utgave som krever bekreftelse, med avkrysningen avslått. Hver utgave må leses og bekreftes separat. Etter den siste vises **Du er ferdig med gjennomgangen** nederst. En feil beholder den åpne teksten og avkrysningen. Tidligere identitet, tidspunkt og eksakt utgave beholdes. De får ikke verktøy for oppstart, tilganger, utkast, godkjenning eller oppfølging av andre ansatte.

**Oppfølging og revisjon** viser én sammenfoldet rad per medarbeider med bekreftet-antall og hva som gjenstår. Fire medarbeidere med ti rutiner hver gir fire rader og 40 bekreftelser. Åpne en rad for eksakte utgaver og tidspunkter; **Søk etter medarbeider** avgrenser listen. **Gi godkjente rutiner til nye medarbeidere** viser bare utgaver noen faktisk mangler. Revisjonsdatoen er synlig, mens **Gjennomfør revisjon** åpner det eksisterende skjemaet. Neste steg etter publisering er ansattes gjennomgang; en ny revisjon er ikke nødvendig bare for å gå videre.

**Min personalhåndbok** er et søkbart oppslagsverk over egne tildelte, publiserte rutiner for både medarbeidere og firmaadmin. Bekreftede utgaver blir liggende; tidligere tildelte utgaver har egen historikk. Hver utgave viser **Godkjent for firmaet av** og **Din egen gjennomgang**, med navn, tidspunkt og eksakt versjon. Godkjenneren er den faktiske firmaadminen eller KS/HMS-ansvarlige, ikke automatisk systemadmin. Egen gjennomgang er påkrevd etter firmaets arbeidsregel, også for firmaadmin og KS/HMS-ansvarlig. Ved publisering kan vedkommende huke av **Jeg bekrefter også egen gjennomgang av denne utgaven.** for å utføre den samtidig, eller bekrefte påkrevde utgaver etterpå i **Les og bekreft** før arbeidet starter. Da lagres firmagodkjenning og egen bekreftelse samlet; samme utgave trenger ingen andre egen bekreftelse. Valget er avslått for neste rutine, og andre ansatte bekrefter selv. Gamle godkjenninger omskrives ikke til bekreftelser. Felles HR-rutiner inngår i håndboken; individuelle medarbeidersamtaler og kompetansedokumenter følger senere separat personaltilgang.

Oppstarten begynner med **1. Velg KS/HMS-ansvarlig**. Firmaadmin velger blant alle aktive interne brukere i gjeldende firma. **Lagre og gå videre** gir ved behov den valgte medarbeideren eksisterende responsible-grant før oppstart lagres; deretter åpnes håndboken. De to kallene er ikke atomiske: ved feil etter grant vises at tilgang er gitt, mens oppstart må lagres på nytt. Verneombud og firmaets KS/HMS-ansvarlig er ulike roller; lenket offentlig veiledning og kontrolldato inngår i oppstarten. Ny redigering av en godkjent rutine vises som **Endringer må godkjennes · vN gjelder fortsatt**; lagring åpner godkjenningen av den lagrede teksten. Ulagret tekst stopper publisering/neste steg. Eksisterende fanereturløsning og versjons-/signeringsgrunnlag beholdes.

Oppdatering 2026-10-06: Tilgangsvalg for andre ansatte bruker eksisterende målrettet managed-access-hendelse og bevarer ulagret oppstart, rutineeditor og vurdering; egen/uavgrenset tilgangsendring og reelt firmabytte kontrolleres fortsatt. Oppstart og nye rutiner kan begynne med redigerbare tekstforslag. Skrivehjelp ligger utenfor rutineinnhold og signerte versjoner. Fire standardforslag har fått renset tekst, source_revision 2 og manuell vurdering; tidligere firmatekst overskrives ikke. Søk finnes i firmaets rutiner, ProffDoks forslag og ansattens tildelte publiserte utgaver. [Innholdsstatus for alle 125 kildereferanser](docs/kshms/CONTENT_STATUS.md) viser kobling fra alle innholdstemaer til de 73 egne forslagene og nødvendig firmatilpasning. [Planen](docs/kshms/PLAN.md) presiserer tilsynsuttrekk, samlet avvik med aktive ansvarlige og app-/e-postoppgaver, og senere avgrenset supportmodus. [Kapasitetsplanen](docs/kshms/CAPACITY.md) beskriver Supabase for 100 firmaer uten å hevde utført belastningstest.

## KS/HMS A2 – rutiner og Avvikssentral

A2 oppdatert 6. oktober 2026: Biblioteket har 73 egne forslag med sporbar dekning av alle 121 innholdstemaer + fire metadatarader fra kvalitetshåndboken (148 sider) og personalhåndboken (127 sider). Avvikssentral gir ansvarlig/frister, åpne/lukkede saker, tiltak/egen kontroll, private vedlegg og hendelseshistorikk. Bare valgt ansvarlig får fast varsel i interne faner og lukker selv. Prosjekt-/sjekkpunktavvik som kobles inn har serverbeskyttet status; ukoblet legacy-flyt består. 73 Sandbox-kontroller PASS med rollback; ingen ekte e-post eller produksjonsendring. Full-app-brukerprøve og e-postmottak gjenstår. Sandbox mangler RESEND_API_KEY og CHAT_FROM_EMAIL; utsending er derfor deaktivert. Gammel TEST OK for 6dfb74d dekker håndbokversjonen, ikke A2.

Melder velger en kvalifisert ansvarlig og frist. Ansvarlig dokumenterer årsak, utførte tiltak og egen kontroll og trykker **Kontroller og lukk avvik**. Først bekreftet command + fersk detail installerer lukket snapshot og oppdaterer oppgaven. En feil beholder felt/avkrysning og lokal kladd. **Lukkede** viser kontroll og historikk. [Brukersteg](docs/kshms/USER_TEST.md), [QA](docs/kshms/QA.md) og [e-postoppsett](docs/kshms/EMAIL_SETUP.md) beskriver det som er prøvd og det som gjenstår. SJA/risiko/utførelsesmaler, PDF/tilsynsuttrekk, individuell HR og stoffkartotek følger fortsatt planen.


## Prosjektsjekklister – popup og gjennomføringer i Preview

Generelle ordrer starter uten våtromsstandarder og tillater egne punkter uavhengig av KS/HMS. Publiserte firmamaler hentes ved aktiv firmamodul. Interne prosjektlister åpner i popup: Lagre viderefører pågående kontroll; Sjekkliste fullført lagrer et uforanderlig snapshot med identitet/tid; neste kontroll bevarer historikken. Serverens revisjonsvern og lokale kladder beskytter samtidige endringer. Dette er prøvd i Sandbox, ikke produksjonsgodkjent. Se docs/kshms/CONTINUITY.md, QA.md og USER_TEST.md.

Oppfølging 8. oktober 2026: Prosjektets Avvik/SJA/RUH har Opprett SJA og Registrer RUH bare ved personlig KS/HMS-tilgang. SJA/RUH har faktisk firmaprosjektvalg og fortsatt manuell ekstern referanse. Godkjente firmarutiner kan leses og velges med fast R-nummer og eksakt versjon. Forslag dekker mur, flis, tømrerarbeid og VVS. RUH bruker eksisterende ansvar, appvarsel, egen kontroll og historikk. Testbevis: [SJA/RUH-prosjektoppfølging](docs/kshms/SJA_RUH_PROJECT_20261008.md). Samme Sandbox Preview; Production er ikke oppdatert.

Rettelse 8. oktober 2026: Desktopmenyen og Åpne Avvik gjenkjenner Avvik/SJA/RUH. KS/HMS har Avvik/RUH → Registrer RUH. Frister vises norsk, og avvikshistorikk bruker Oslo-tid. Testbevis: [meny/RUH/dato](docs/kshms/NAV_RUH_DATE_20261008.md). Ingen SQL-endringer i denne rettelsen.


KS/HMS-utførelse 8. oktober 2026: **Vernerunder/kontroller** bruker egne punkter eller en fast publisert firmamal, med valgfri prosjektkobling, utkast, egen fullføring og bevart historikk. Hvert avvik får én ansvarlig/frist-sak i Avvik/RUH; kontrollens fullføring lukker ingen saker. **Risikovurdering** har en jobbspesifikk 5×5-matrise, risiko før/etter tiltak, firmaets dokumenterte grenser, medvirkning, ansvar/frist og uttrykkelig beslutning. Forventet effekt kan ikke godtas som kontrollert effekt. Se [scope og testbevis](docs/kshms/EXECUTIONS_20261008.md) og [kort brukerprøve](docs/kshms/USER_TEST.md). Rapportens TEST OK 8. oktober kl. 14:48 består.

Prosjektoppfølging 8. oktober: **Avvik/SJA/RUH** har også **Opprett vernerunde** og **Opprett risikovurdering 5×5**, med oversikter for bare dette prosjektet. Begge krever personlig KS/HMS-tilgang. Valgt ansvarlig får et fast appvarsel frem til bekreftet lagret fullføring; lesing fjerner det ikke, og omfordeling flytter oppgaven. Godkjente firmarutiner velges med R-nummer og eksakt utgave. En stor avkrysning for egen gjennomgang står ved **Kontroll fullført** / **Vurdering fullført**. Se [tilleggets testbevis](docs/kshms/PROJECT_EXECUTIONS_20261008.md). Publiseringsstatus står i CURRENT_RELEASE_STATUS.md.

Oppfølging etter TEST OK 8. oktober kl. 21:04: gjennomføringspopupen lukkes etter bekreftet lagret fullføring. Ansvarse-post omfatter Avvik/RUH, vernerunder, risiko, SJA, pliktig rutinegjennomgang og forfalt revisjon; køen dedupliserer tildelinger og stopper inaktivt ansvar. Sandbox-mailer v4 er publisert, men kontrollert HTTP 503 viser manglende Resend-nøkkel og avsender. Faktisk utsending er derfor fortsatt av. Se [varsler og popup](docs/kshms/NOTIFICATIONS_20261008.md).

KS/HMS har nå et valgt **Dokumentuttrekk** for firmaadmin/KS/HMS-ansvarlig: beskriv omfang, velg lagrede dokumenter og last ned én PDF med RUH-historikk/private bilder og manifest. Ingen dokumenter velges automatisk. Samlet PDF er Kenneths TEST OK 9. oktober kl. 01:29; ZIP-nedlasting med to bilder og manifest er TEST OK kl. 01:55. PDF og ZIP har separate knapper; ZIP-knappen vises etter Vis vedleggslisten. En separat **Vis vedleggslisten → Last ned vedlegg (ZIP)** samler valgte kvalitet-/HMS-/RUH-originaler, vernerunde-bilder og prosjektkontrollvedlegg etter egen bekreftelse. Manifest gir dokument/revisjon, filstørrelse og SHA-256. Maks 100 vedlegg/50 MB, 10 MB per fil; ZIP er ikke kryptert. [PDF-scope](docs/kshms/INSPECTION_EXTRACT_20261009.md) og [ZIP-scope/QA](docs/kshms/ATTACHMENT_ARCHIVE_20261009.md). Feature/Sandbox først; tidligere TEST OK beholdes, e-post forblir deaktivert.

Vedleggsdekning 9. oktober: Dokumentuttrekk har også **Kvalitets- og HMS-avvik med historikk og bilder**. Eksplisitt valgt lagret sak gir full historikk/private bilder i samlet PDF og private originalfiler i ZIP. Eldre ukoblede prosjektavvik kan nå hentes for valgt prosjekt i en egen gruppe. Lagret innhold og bilder følger PDF, originalfiler følger bekreftet ZIP. Ingen versjonsnummer eller signatur konstrueres; SHA-256 binder valget til innholdet. Se [ny avgrenset leveranse](docs/kshms/LEGACY_ATTACHMENTS_20261009.md). Egen RUH-PDF beholder sitt avgrensede scope. [Ny leveranse/QA](docs/kshms/DEVIATION_ATTACHMENTS_20261009.md). Tidligere TEST OK beholdes; ny avgrenset brukerprøve og øvrig B/C-scope består.

SJA kan lagre inntil tre komprimerte arbeidsstedsbilder i den samme versjonerte innholdssnapshoten som tekst og deltakere. Bildene følger egen SJA-PDF og valgt SJA i samlet PDF, og blir egne JPG-filer i bekreftet vedleggs-ZIP med manifestkontroll. Gamle SJA-er er bakoverkompatible uten bilder. Ingen ny Storage-bucket, tabell, RLS eller policy; eksisterende private SJA-RPC og signert-uforanderlighet består. [Avgrensning og QA](docs/kshms/SJA_ATTACHMENTS_20261009.md).

Risikovurderinger kan lagre inntil tre komprimerte bilder per fare i den samme private, versjonerte gjennomføringssnapshoten som risikoteksten. Bildene følger egen PDF, prosjektrapport og samlet dokumentuttrekk, og blir egne originalfiler i bekreftet vedleggs-ZIP med fare og SHA-256 i manifestet. Eldre vurderinger virker uten bilder, og «Ny vurdering med samme farer» arver ikke bilder. Ingen ny Storage-bucket, tabell, RLS eller policy er innført. [Avgrensning og QA](docs/kshms/RISK_ATTACHMENTS_20261009.md).

### KS/HMS og HR – firmaavtale og brukerkort (feature, 9. oktober 2026)

Systemadmin aktiverer KS/HMS/HR i **Firmaer, brukere og tilganger → firma → Firmaets KS/HMS- og HR-avtale**. Firmaadmin bruker **Firmaadmin → Brukere og tilganger → brukerkort → KS/HMS og HR**; systemadmin bruker samme brukerkort i sin firmaoversikt. HR-modultilgang er ikke en personlig leserett. Firmaadmin har administrasjon i eget aktiverte firma; systemadmin/KS-rolle gir ikke automatisk individuelt HR-innsyn. Hjelp har ikon på alle punkter og følger arbeidsflyt og fersk faktisk tilgang. Bare feature/Preview/Sandbox; sensitivt HR-innhold fortsatt stengt. [Scope og QA](docs/kshms/HELP_ACCESS_20261009.md).

Medarbeiderraden åpner nå leder, lesetilgang og eksisterende kontaktflate i appens etablerte popup-vindu. Desktop viser et sentrert vindu, mobil en full skjerm. Tab/fokus, Escape og tilbakeføring til raden følger den eksisterende dialogkomponenten. Lukking rydder HR-valget, og fanebytte viser oppføringen igjen først etter fersk autorisering. Paginering av appbrukere og resultat-/feilmeldinger er tilgjengelige inne i vinduet. Tilgangsmodell, skrivekall og private innholdsporter er uendret.

## HR: prøvesamtale i Sandbox – 11. oktober 2026

Eksisterende HR får en tydelig merket, oppdiktet medarbeidersamtale når byggets backendmål er `sandbox` og HR-konteksten er tilgjengelig. Forberedelse → felles samtale → tiltak → referat kan prøves med samme konto. Eksempeltekster fyller bare tomme felt. Lokal lagring er skilt per firma og bruker, med Web Locks, revisjonskontroll og uforanderlige tidligere utgaver. PDF bruker lagret utgave og merkes som prøve/utkast. Ingen medarbeiderkobling, HR-RPC, utsending, signatur, backendendring eller åpning av privat HR.

Dette er en lokal prøve av arbeidsflyten; data følger ikke brukeren til en ny nettleser eller enhet. Maksimum 10 prøvesamtaler og 20 utgaver per samtale; sletting gjelder bare eget prøveinnhold i nettleseren. Isolert Preview fra ren main, uten å merge tidligere HR-workerarbeid. Se [scope og verifisering](docs/kshms/HR_PRACTICE_20261011.md).

Prøvesamtalens neste steg ruller nå til innholdets start. PDF-retur og ny tilgangskontroll beholder valgt samtale, lagret utgave og fane via en scoped sessionStorage-peker; innhold leses fra ferskt validert lokal historikk. Bevisst lukk/ny/slett rydder valget. PDF-format, tilgangskjerne og global navigasjon er uendret.

Prøv medarbeidersamtale viser nå toppen av skjemaet. Tomme og ulagrede prøvekladder beholdes i et avgrenset konto-/firmabundet sideminne gjennom tilgangsremount etter fanebytte. Fersk lokal historikk leses før gjenåpning; en eldre ulagret revisjon får ikke overskrive endringer fra en annen fane. Full oppfriskning gjenåpner fortsatt bare lagrede utgaver. Bevisst Lukk rydder kladden og valget.

## Firmavisningsnavn, kartledelse og HR-veiledning – 11. oktober 2026

Firmaprofil → Endre firmanavn bruker egen authenticated-RPC med fersk aktiv profil, låst firmaadmin-medlemskap eller systemadmin, primærfirmabinding, forventet navn og navnekollisjon. Bare sales_company_scopes.display_name endres; stable UUID/normalized identity, profiles, memberships, contact profile and existing snapshots are preserved. Original profile RPCs unchanged. Main applies acknowledged display name to the profile draft and, only outside an open project, the current company; contact drafts are preserved. Four existing project presentation filters now use the stable company_scope_id when available and retain historical-name fallback. Fresh primary-company ID is read when projects load; existing owner/systemadmin/support branches and database RLS are preserved. Work-profile metadata refreshes separately.

Organisasjonskart forklarer at Nytt felles kart krever minst to kvalifiserte registrerte firmaer. Ett firma kan ha Styret og valgfri underavdelingsstruktur. Leader/middle placements show names and free job titles even when staff details are collapsed. No new organization or HR rights. Hjelp now has separate A–Å chapters for conversations and sick-leave, and distinguishes explicit employee sharing, meeting readiness, own confirmation, deadlines and actual external sharing.

## Mobil tilbudslesing – 13. oktober 2026

Miljømål BEGGE, fra main 59682a0902615437677c129fb18fe154350b127e. Intern tilbudsvisning og kundevisning får hovedposter med Åpne hovedpost/Lukk hovedpost, lukket som utgangspunkt på mobil og åpent på desktop. Nummer/tekst/pris i grupperte rader får avgrenset mobil-layout; priser ligger under teksten. Små Til toppen/Til bunnen-knapper på lange tilbudssider skjules under tekstinntasting og ligger over eksisterende mobil Lagre-knapp. Se kundens tilbud/Forhåndsvis som kunde åpner mobil kundepreview i en native modal med fast Tilbake til tilbudet; samme interne saks-/editorinstans beholdes. Desktop og visninger uten modal-lytter beholder egen fane. Modaladresse må være same-origin og en kunde-/kladdvisning; ingen return-token eller ny offentlig tilganger.

Scope er presentasjon/CSS, isolert modal/scroll-komponent og to eksisterende open-handlinger. Ingen lagring, publisering, pristall, aksept, e-post, server-hydrering/recovery eller SQL/RLS endres. E-postsperren for rutiner beholdes. Lesende produksjonskontroll av Andreas' F-2026-0087 og F-2026-0080 ga 23/13 linjer og 25/21 opsjoner. Tester bruker kun linje-/opsjonstekster, uten kundedata eller tokens; alle firma-/kunde-/brukerdata er uendret.

Actual Chromium QA PASS ved 320/360/390/760/1280: åpne/lukke, interne grupperte tekster uten prisoverlapp, ingen horisontal overflow, mobil modal-retur og topp/bunn. Gamle draft-preview/recovery/tab-resume/server-hydration/entry-resume og Befaring → Generelt tilbud passerer. Full critical/build/CI og innlogget Preview følger i release-PR før TEST OK/merge.

Mobilpiler: plasseres midt på høyre side, over innholdets lag og utenfor det flytende kundepreview-kortet. Synlighet følger faktisk scrollflate og mobilens synlige skjerm; kundevisning og interne tilbud får samme kontroll. Runtime-QA dekker kort over knappene og scrolling i en egen container.

Pilkontrollene har egen enkolonnet meny-layout og ruller dokumentet via window.scrollTo. Hvis Vercels Preview-verktøy finnes, trekkes pilene litt inn fra høyrekanten så begge kan trykkes. Runtime-QA bruker nå også appens faktiske globale mobil-/menystiler og en overlappende Preview-knapp.

Mobil 13. oktober: topp/bunn-kontrollen er flyttet til felles MobileScrollShortcuts i den autentiserte appskallet; én kontroll uansett valgt modul, mens isolert kundevisning har sin egen. SalesMobileTools beholder bare kundevisningsdialogen. Mobil startboks er avgrenset til tab=prosjekt uten valgt/nytt prosjekt, slik at HR/KS/HMS/profil/øvrige moduler åpner uten startboksen. Kun presentasjon, ingen endring i navigasjonshandlere, recovery, lagring, tilgang eller e-post. Permanent sjekk bruker faktisk rendererbetingelse; touch-QA på modulbytte/HR/KS/HMS/profil/Startsiden og eksisterende tilbudskontroller.


13.10.2026 – Godkjent TEST OK: main f0e74ce4 / PR #242 synkronisert kontrollert main→demo. Sjekklistesentralen viser én samlet våtromsliste (33 punkter), separate faglister og prosjekteringsmal (13 punkter). Vanlige kilder kan redigeres som firmaversjoner; garantikilder er låst uten redigering/sletting/kopiering. Prosjekteringssjekklisten fylles ut nederst i Prosjektering. Alle prosjekttyper har + Legg til sjekkliste under Sjekklister. Eksisterende svar/historikk og demo-overlay beholdes; ingen DB-/e-postendring. Full critical/build, React kladd/retry/konflikt/historikk og faktisk render-rekkefølge grønne.


Kontrollørtilgang godkjent TEST OK 13. oktober 2026 kl. 16:39 norsk tid, PR #243 main 308e5813a3074e86f5947dd314a28501890a7539. Separat leselenke med valgt utløp, tilbakekalling, alle tekniske sjekklister/prosjektering og manuell e-post med samme tilbudslayout/firmalogo. Ingen automatisk sending ved opprettelse/endring. controller-access-email krever JWT og gyldig intern prosjekt-/firmatilgang samt aktiv kode. Produktionsmigrasjon og mailer aktivert; Core Safety 38414228613 SUCCESS og critical/React/mail QA grønne uten ekte e-postutsending. Kontrollert main→demo-delta med demo-overlay bevart; sandbox-mailer og controller-RPC-er allerede deployet. Rutine-e-post forblir deaktivert.


Scrollrettelse godkjent TEST OK 13.10.2026 kl. 17:02 norsk tid, PR #244 main d95f14c80e2a87bd4fed4e31cf47f712c3c2ca48. Vanlig fokus/Windows-utklipp gjenoppretter ikke stale scroll; faktisk skjult side kan gjenopprette posisjonen, og tastatur/mus/touch/hjul/blur/unmount avbryter gjentakelser. Full critical/build og Core Safety 38418142446 SUCCESS; seks runtime-scenariofaner grønne. Kun scroll-effekt, ny helper og test/docs; autosave, Sales recovery, backend og e-post urørt. main→demo, overlay bevart og kontrollsidens baseline oppdatert.

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

## Fleksible sjekklister og varme arbeider – 17.10.2026

Preview-leveranse (miljømål BEGGE): alle redigerbare firmamaler kan utvides med valgfrie eller påkrevde, betingede underpunkter. Status, kommentar og bilder beholdes. Felttyper: tekst, tall/minsteverdi, Ja/Nei/Ikke aktuelt, ett/flere valg, dato, klokkeslett og egen bekreftelse med serverlagret identitet/tid/innholdskontroll.

Sjekklistesentral har «Bruk mal: Varme arbeider», felles for alle fag. Firmaet tilpasser og publiserer før prosjektet henter en fast utgave. Eksisterende rutine «Varme arbeider og brannberedskap» får kildeforslag v2 som viser til malen; firmaets godkjente rutiner endres ikke automatisk. Kontroller nye forslag i håndbokens eksisterende kildeoppdatering.

Gamle svar og garantipunkter beholder kontrakten. Fullføring, lokal kladd, lagret kontroll, gjentatt kontroll og PDF støtter underpunktene. Ny migrasjon installeres først i Sandbox. Produksjon og main → demo venter på ny TEST OK. QA og teststeg: `docs/qa/FLEXIBLE_CHECKLISTS_HOT_WORK_20261017.md`.


### Systemadmin – firmavalg 19.10.2026

Firmavalget på brukerkortet matcher nå registrert firmanavn etter trim og små bokstaver, på samme måte som firmalisten og firmafilteret. Gamle navn med mellomrom eller ulik bokstavbruk viser dermed riktig firma. Valg av samme normaliserte firma er uten skriving; et reelt firmabytte følger eksisterende bekreftelse, profiloppdatering og serverhenting. Ingen automatisk normalisering av produksjonsdata, rolle-/tilgangsendring eller endring av firmaidentitet. Regresjonsvern: `scripts/systemadmin-company-selection-react-check.mjs`, faktiske memo/Select/felt/lagringshandler fra main i Chromium, syntetisk transport. Se `docs/qa/SYSTEMADMIN_COMPANY_SELECTION_20261019.md`.


### Lagerrutine og 25 kg sekker – 20.10.2026

`store_lifting` er oppdatert til kildeforslag v2, «Tunge løft og varehåndtering på lager». Beskriver mottak/plukk/utlevering med 25 kg lim- og mørtelsekker, konkrete arbeidskrav, arbeidsgivers risikovurdering/opplæring/hjelpemidler og medarbeiderens utførelse/medvirkning. 25 kg, 6000 kg og 20 meter er riktig merket som veiledning, med vurdering av repetisjon og individuelle forutsetninger. Tilrettelegging vurderes sammen med drift og kollegers arbeidsmiljø; personlige helseopplysninger holdes utenfor håndboka. Stabil source_key og source_revision=2 gir sammenligning gjennom eksisterende kildeoppdatering. Firmaets gjeldende rutine erstattes først ved ny firmagodkjenning. Gamle utgaver og lesebekreftelser beholdes uendret. Ingen database-, tilgangs-, navigasjons- eller e-postendring. De 73 opprinnelige rutinene og 13 andre butikkrutiner er uendret.


### Lagre rutineutkast etter tekstsammenligning – 20.10.2026

Ekstra «Lagre utkast» nederst etter ProffDoks tekstsammenligning er koblet til det eksisterende redigeringsskjemaet med en unik form-ID. Samme innsending, påkrevde felt og busy-sperre gjelder fra begge knapper. Lagring, lokal kladd, firmagodkjenning og lesebekreftelser følger eksisterende flyt. Miljømål BEGGE; Preview og ny TEST OK før produksjon.
