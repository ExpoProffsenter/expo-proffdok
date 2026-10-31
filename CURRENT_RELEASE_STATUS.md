# Tilgangskort, Sandbox-paritet og ferske sluttpakke-PDF-er –31.10

Samme PR295/faste Preview. Scoped UI-mål BEGGE; utførelse bare Preview. Native Systemadmin-tilgangs-/arbeidsprofilkort har faste24px avkryssinger,16px navn,14px forklaringer,6px rammer og44px etiketter etter sen runtimeCSS. Begge faktiske React-adaptere370krav og eksisterende firmapanel67kravPASS. Native felt, primærfirma, ventende/systemadmin-vakt og eksplisitt save/feil/retry beholdes. Ingen tilgangskode, rapportdatakilde eller recovery endres. [Scope og konkret bevis](docs/changes/admin-access-closeout-036-20261031.json); endelig fullCI/READY/innlogget CSS-etterkontroll i PR295.

Separat SANDBOX/DEMO-reparasjon utført: list_managed_work_profiles() manglet i pg_proc. Eksakt eksisterende main-SQL gjenbrukt som Sandbox-migrering20261031211714, samme kropp som Production. Eksisterende systemadmin/ordinær/ingen aktør/anon er prøvd i read-only transaksjon med rollback. Brukere, firmaer, medlemskap og andre offentlige funksjoner er uendret. Samme innloggede Preview laster nå arbeidsprofiler uten RPC-feil; ingen live valg eller lagring. Tidligere omtale av denne RPC-en som åpen er historisk.

Fersk native QA:4signerte/legacy/utkast-PDF-er63krav; samlet KS/HMS7PDF/4print; bolig-FDV12kravPASS. Åtte bevarte filer/40sider er rendret og alle sider visuelt kontrollert. Dette gjelder syntetisk transport, ikke attest på live nedlastingsbro. Signerte prosjektkontrollers snapshot kan fortsatt ikke velges i samlet sluttrapport; velger/hook/mapper omfatter bare SJA/RUH/vernerunder/risiko. Separat kontroll-PDF og kontrolluttrekk finnes. Dette er eget core-arbeid, ikke en skjult designrettelse.

Fersk PDF-kontroll avdekket manglende vernerunde-/risikooverskrifter i innholdslisten. To betingede linjer er rettet, og ny faktisk PDF-prøve beviste feil før og valgt/ikke-valgt/utkast etter. Begge PDF-lesere PASS; berørte20sider visuelt kontrollert på nytt. Prøven inngår nå i eksisterende app-ux-CI med allerede installert Poppler. Sandbox Golden19/19 og HR/KS-kurs5/5 preflight PASS, read-only/rollback.

Neste: avgrens samlet sluttrapports signerte kontrollhistorikk og gjenstående roller/transport, deretter resterende videoer i godkjent mal. Tidligere bevis og fem videoer beholdes. Ingen global redesign-TEST OK, merge, Production eller demo-synk. Solgløtt venter avtalt releaseforløp.

Kort prøve: Alle områder → Systemadmin → Brukere og roller → Expo Proffsenter. Arbeidsprofilnavn og avkryssing skal stå ved siden av hverandre og tidligere feil være borte. Lukk firma uten å endre tilgang.

---

# Startside, profil-/menyretur, Prissøk og timeunderflater –31.10

Samme PR295/faste Preview/Sandbox, miljømål BEGGE. Valgfri Representerer-/arbeidsprofilmeny lukkes med Escape eller klikk utenfor; Escape returnerer fokus uten firmabytte. Rask åpne/Escape i hovedmenyen kan ikke gjenopplive bakgrunnen fra en sen animasjon. Faktiske sene mobilregler er med i Home-/Prissøk-prøvene; de beviste for små handlinger/overskrift. Scoped CSS beholder16px/minst44px og samme6/8px rammer; et påkrevd førstevalg forblir påkrevd og passer også kort skjerm. TimeField får stabil etikettkobling, med samme barn/handlers og bevart notat. Innloggingsbildet er beholdt.

Shell/profil57, Home67, Prissøk70, timeunderflater125/40visninger, eksisterende Time React91, valgfri timeføring63 og varetelling73PASS. Alle gamle krav er bevart; faktisk DOM/kladd/retur, null/desimaler,122linjer/alle-sider-eksport, konflikter, retry og tilgangsgrenser er dekket på sine isolerte grunnlag. Full lokal Sandbox critical/buildPASS. [Scope og bevis](docs/changes/shell-commerce-time-036-20261031.json). Eksakt sluttkandidat/fullCI/READY og innlogget etterkontroll føres i PR295.

Live baseline: Representerer-feilen gjenskapt, faktisk varesøk fant2eksisterende Oras-demovarer, varetelling/veiledning åpnet uten opprettelse eller registrering og Min side lest uten å aktivere timer. Ingen reell invitasjon, ny tilgang, lagring av telling/timer, sending, signering, eksport eller sletting. Ingen ny innlogging prøvd; eksisterende økt og originalt innloggingsdesign beholdes. Fysisk mobil/Safari, virkelig kamera, separate roller/transport og tidligere konkrete sluttpakke-/PDF-/backendgrenser er fortsatt åpne. Sandbox-feilen list_managed_work_profiles er ikke rettet av denne UI-pakken.

Tidligere designbevis og fem godkjent formaterte, avgrensede filmer beholdes. Nye videoer/avspiller og full avstemming av resterende underhandlinger gjenstår; denne runden prioriterer ferdig design som avtalt. Solgløtt står fortsatt på vent til design+QA → TEST OK → Production → kontrollert main→demo. Ingen global redesign-TEST OK, merge, Production eller demo-synk.

Kort prøve: Representerer → Escape skal lukke og returnere fokus uten firmabytte. Alle områder → Escape → åpne igjen skal fungere uten sperrende bakgrunn. Prissøk og eventuelt Mine timer skal ha lesbare handlinger. Ikke opprett telling eller send/eksporter som del av designprøven.

---

# Admin, Hjelp, Support og portaler –31.10

Samme PR295/faste Preview/Sandbox, miljømål BEGGE. Faktisk sen runtime-CSS er nå med i de berørte prøvene. Den gjenskapte19px titler,17px felt og fire små nøkkeltall på mobil. Avgrensede 03.6-regler verner de opprinnelige målene. Firmaadmin/Hjelp248, firmapaneladapter67, profil/Support/register113 og systemadmin/Support51PASS:479krav, fem bredder og korte520/600px-skjermer. Gamle krav er bevart. Uendrede prosjektbilde-/portalprøver149, kontrollørens faktiske React og Support60 samt critical support55/Sandbox critical-buildPASS. [Scope og presise begrensninger](docs/changes/admin-help-support-portals-036-20261031.json). Kandidat/fullCI/READY og levende etterkontroll føres i PR295.

Live firmaadmin invitasjon/ansatt/retur, alle ni systemadminfaner, native firmapanel, produkt-/garantiunderfelt, bruker-Support/ny sak/avbryt og Hjelp/søk/kapittel/tomt søk/retur er lest uten utsending eller tilgangsendring. Åpent: Sandbox mangler list_managed_work_profiles-RPC i systemadminens firmapanel; egen backend-/miljørettelse må avklares separat. Internt vareregister viste kun innledning live; isolert ekte importkomponent er kontrollert. Support-vedlegg støttes ennå ikke. Separate roller, ekte lenke-/transportforløp og fysisk mobil/Safari er ikke sluttattestert. To Hjelp-henvisninger er rettet til Min side → Mine planer.

Ny [hjelpevideo: Finn hjelp, åpne tema og gå tilbake](https://chatgpt.com/library?file_id=libfile_e4b4d6d0d7d081918df997946b1b4c13&account_id=personal) · [redigerbare kilder](https://chatgpt.com/library?file_id=libfile_505b605cc2408191988d185c15caeb20&account_id=personal).95sekunder/12scener/H264/1920x1080/24fps/uten lyd.2280frames full dekoding og faktisk Chromium-start/spoling/sluttPASS. Faktiske Preview-bilder fra21634439 og uendret godkjent renderer. Ikke sammenhengende skjermopptak, komplett Prissøk/HR-opplæring eller alle A–Å-/kontekstinnganger. Fem avgrensede filmer totalt; øvrige filmer og avspiller i appen gjenstår.

Neste samlepakke er innlogging/arbeidsprofil, Startside/meny og gjenstående prissøk/varetelling/time-/utleggsunderflater med tidligere delbevis beholdt. Kjente sluttpakke-/PDF-/rollegrenser og videokøen står fortsatt åpne. Ingen global redesign-TEST OK, merge, Production eller demo-synk. Solgløtt avventer avtalt design- og releaseforløp.

Kort prøve i fast Preview: Alle områder → Firmaprofil og Systemadmin → Produktmaster; tekst og handlinger skal være lesbare, mobilnøkkeltall skal stå i to kolonner. Hjelp → søk medarbeider → HR → åpne/lukk kapittel → Tilbake til arbeidet; samme søk skal stå igjen. Prøven krever ingen lagring eller sending.

---

# HR, KS/HMS og sjekklister –31.10

Miljømål BEGGE, samme PR295/Preview/Sandbox. Native HR-underflater655krav/133visninger, HR-forside153, KS/HMS-forside197, rutineforvaltning401/100visninger og RUH/SJA/vernerunde/risiko984/221visningerPASS. Live HR-samtale4steg, leder/tilgang og sjekklistemal/underfelt er kontrollert. En faktisk18px-underpunktsrad/14px-etiketter i sjekklistemalen får44px/16px og like8px rammer. Alle143gamle feltkrav beholdt pluss15nye; rettet158PASS. Frittstående sjekkliste170 og44forslags-SQL PASS før/etter CSS. KS984består også etter CSS. Full Sandbox critical/buildPASS. [Avgrensning og bevis](docs/changes/people-checklist-subflows-036-20261031.json). Eksakt kandidat/fullCI/READY/levende sjekklisteetterkontroll føres i PR295.

Ny video: [Prøvesamtale: opprett, fullfør og gå tilbake](https://chatgpt.com/library?file_id=libfile_c30fe07312e0819197e3637b5957ecd8&account_id=personal) · [Redigerbare kilder](https://chatgpt.com/library?file_id=libfile_ef608f09d0508191bdc8fad094c8bc27&account_id=personal).171sekunder/18scener/H264/1920x1080/24fps/uten lyd,4104frames dekodet og virkelig Chromium-start/spoling/sluttPASS. Faktiske HR-opptak fraa722cc4f; HR-kilder/opptatt UI er uendret av denne sjekkliste-CSS-pakken. Alle fire temaer i forberedelse og samtale, begge tiltak/ansvar/frister, lagring/gjenåpning av4utgaver, PDF-knapp/appbeskjed og begge returer. Fire avgrensede filmer finnes nå. Ikke reset/sletting, videre redigering, ekte HR-oppfølging eller hele HR-010.

PDF-begrensning: Appen viste eksportbekreftelse, men skynettens nedlastingshenting ga Download failed; ingen fil fra den innloggede fanen er attestert. Separat faktisk React/Chromium/Web Locks-prøve lastet ned PDF og bestod gjenåpning/2fanekonflikt. Ingen reell invitasjon, e-post, signering, tilgangsendring eller HR-backendlagring. Kun én ny lokal prøve med4utgaver.

Neste designpakke: Firmaadmin, Systemadmin, Hjelp, Support og portaler. Behold tidligere HR/KS/HMS-/sjekklistebevis; ikke start disse om igjen som ukontrollert. Reelle separate roller, fysiskmobil/Safari, resterende videoer og avspiller samt navngitte sluttpakke-/PDF-grenser er fortsatt åpne. Ingen global redesign-TEST OK, merge, Production eller demo-synk. Solgløtt avventer avtalt design- og releaseforløp.

Kort prøve: KS/HMS → Sjekklister → Rediger sjekkliste → Underpunkter og svarfelt. Raden og etikettene skal være lett lesbare, og eksisterende malinnhold skal stå der. Lukk uten å publisere. HR → Alle HR-funksjoner → Åpne prøvesamtale følger filmen.

---

# Befaring, tilbud og prosjektets underflater –31.10

Samme PR295/faste Preview/Sandbox, miljømål BEGGE. Befaring og begge tilbudsbyggere kontrolleres nå med appens faktiske sene mobilregler. De avdekket39px knapper; avgrenset CSS sikrer16px/minst45px. En lagret badskisse får ærlig status i den tomme lokale forhåndsvisningen. Tegning, lagring, server-first, recovery, priser og tilgang beholdes. [Scope og tester](docs/changes/sales-subflows-runtime-036-20261031.json): editor292/General229, opprettelse110, tilbudsrouter/mal/PDF59, uendrede prosjektunderflater573/90visninger og deltakeradapter21PASS, full critical Sandbox-buildPASS. Eksakt kandidat/fullCI/READY/levende etterkontroll føres i PR295. Ingen global design-TEST OK, merge, Production eller demo-synk.

Dette er delbevis i den eksisterende samlede gjennomgangen, ikke en nullstilling eller komplett attest for Sales/prosjekt. Fysisk mobil/Safari, reelle rolle-/signerings-/transportforløp og gjenstående underfunksjoner står fortsatt åpne. HR/KS/HMS/sjekklister og de øvrige områdene fortsetter i samme kø. Solgløtt avventer avtalt design- og releaseforløp.

Ny avgrenset film: [Les Kundens tilbud og gå tilbake](https://chatgpt.com/library?file_id=libfile_318eae345e1481918194b3ed7365050e&account_id=personal),75sekunder/8scener/1920x1080/H264/24fps/uten lyd. Faktiske Preview-bilder fra8003e7c7: eksisterende General-demoutkast, kladdemerke, kunde/leveranse/pris/forbehold/betaling og to returer.1800frames full dekoding og faktisk Chromium-start/spoling/sluttPASS. [Redigerbare kilder](https://chatgpt.com/library?file_id=libfile_3a666465acd08191923085c8f5d1a1e0&account_id=personal). Tre avgrensede filmer finnes nå; ikke full SALES-011 eller hele appens videodekning. Avspiller i appen og fysisk mobil/Safari gjenstår.

Appkandidat8003e7c7 har fullCI84410/10SUCCESS og READYdpl_GQv79n8zp9WgpqXx8PnZ3Aq23ABG på samme faste alias. Statisk binding Sandboxtrue/Productionfalse. Innlogget General16px/45px og returPASS; befaringsbildene lastet, rettet skissetekst1/gammel tomtekst0 og AvbrytPASS. Kundepreview-regresjon875+35+26PASS. Dagens case/innlogging beholdt ved reload. Dokumentasjon etter dette endrer ikke appen.

Kort prøve i samme Preview: Åpne eksisterende befaring → Se/endre befaringsnotat. En lagret skisse skal vises med «Den lagrede badskissen vises ovenfor.» Velg Avbryt. Åpne et Generelt tilbud → Rediger tilbud; felt og handlinger skal være lett lesbare. Kontroller Kundens tilbud → Utvid kundevisning → Tilbake til arbeidet. Ikke publiser eller send som del av designprøven.

---

# Hele appen – design og videoer31.10

Brukeren har presisert alle funksjoner og underfunksjoner, ikke bare Bolig. [Felles status/neste kontroller for18områder](docs/qa/APP_DESIGN_VIDEO_STATUS_20261031.md) og [videoregister](docs/qa/proffdok-video-coverage-20261031.json) omfatter145kjente reiser/tre nyere sjekklistefunksjoner. To avgrensede filmer er produsert: godkjent pilot og ny Min side-film. Inventaret/alle underhandlinger er ikke uttømmende sluttattestert.

Samme PR295/Preview/Sandbox, BEGGE. Leverandørbestilling, Min side, personlige planpaneler og time-mobilkaskade er samlet rettet. Lang periodemerknad vises hel i native lesemodus; redigerings-/lagringseier er beholdt. [Scope og tester](docs/changes/appwide-personal-commerce-subflows-036-20261031.json). Appkandidat430b1f66 har fullCI84210/10 og egen READY/Sandbox/livekontroll. Endelig dokumentasjonskandidat/CI føres i PR295; appen er uendret etter430b1f66. Ingen global redesign-TEST OK/merge/Production/demo-synk.

[Ny video: Finn egne planer, les oppgaven og gå tilbake](https://chatgpt.com/library?file_id=libfile_e1f75f1c86648191bbfbdb7406c24940&account_id=personal),95sekunder/10scener/H264/1920x1080/24fps/uten lyd. To plankilder, oppgavedetaljer, deltakere, hele periodemerknaden og begge returer. Hele filen og faktisk Chromium-avspilling/start/seek/slutt er kontrollert. [Redigerbare kilder](https://chatgpt.com/library?file_id=libfile_a6bcd192278c8191bef76968681d8c06&account_id=personal). Ikke hele PERSONAL-002 eller planredigering/bemanning/eksport. Fysisk mobil/Safari og avspiller i appen gjenstår.

Neste samlepakke utenfor Bolig: Forespørsel/befaring/begge tilbud, prosjekt og HR/KS/HMS/sjekklister; deretter resterende admin/support/hjelp/portaler og navngitte områder. Bevar tidligere delbevis og bruk faktisk reiseregister, ikke en ny nullstilling. Solgløtt avventer avtalt design+QA → TEST OK → Production → kontrollert main→demo → prosjekt → komplette prosjektvideoer.

# Boligens arbeidsflater og utsatt Solgløtt –31.10

Samme PR295/Preview/Sandbox, BEGGE. Kontakt, sju boligarbeidsflater og rom-/pakke-/fordelingsdialoger følger nå felles680px høyrepanel med fast navy topp/retur og16px felt.1167native kravPASS, eksisterende pakkevalg36/rominnhold35/rom51 og critical Sandbox-buildPASS. [Scope og presise tester](docs/changes/housing-unit-workspace-036-20261031.json). FullCI/READY/levende kontroll føres i PR295. Ingen Bolig-kjerne-/backend-/pris-/tilgangsendring. Totaldesign og tidligere restpunkter er fortsatt åpne.

Kenneth har bedt om å fortsette design og notere Solgløtt til vi er klare. Rekkefølge: design og QA → hans TEST OK → merge og Production-verifisering → kontrollert main→demo med bevart overlay/preflight → opprette Solgløtt → komplette videoer. Prosjekt/productimport/filmproduksjon avventer denne fasen. [Oppdatert plan](https://chatgpt.com/library?file_id=libfile_a6ce8e2d49648191ba9d6648f04a95a3&account_id=personal). Ingen TEST OK/merge/Production/demo-synk utført.

# Grunnpakke-/tilvalgseditor –31.10

Samme PR295/Preview/Sandbox, BEGGE. Faktisk innlogget editor hadde fortsatt gammel960px sentrert dialog/12px felt. De to native pakkeskjemaene får nå samme680px høyrepanel/navy/16-44/8px-rammer og synlig Lagre ved langt innhold.376native krav/24editorvisninger og begge pakkeoversikterPASS, negativ gammelCSS feiler, eksisterende catalogReact og navigation24PASS, full critical Sandbox-buildPASS. [Scope og presise tester](docs/changes/housing-catalog-editor-workspace-036-20261031.json). Ingen Bolig-kjerne-/pris-/tilgangs-/lagrings-/backendendring. Eksakt sluttkandidat/CI/READY/live føres i PR295. Totaldesign og tidligere restpunkter er fortsatt åpne; ingen TEST OK/Production/demo-synk.

# Sølgløtt-visning og boligoversiktens søkelayout –31.10

Kenneth har bestilt kundedemo tirsdag3. november: Sølgløtt,6navngitte firemannsboliger/24boliger, FlisLab og Baden Haus som grunnpakke og Dansani som tilvalg. Designet ferdigstilles først. Han oppgir konkrete produkter selv og har valgt faktiske salgspriser. [Avklaringer, faktisk katalogkontroll, foreslått struktur og komplett videoserie](https://chatgpt.com/library?file_id=libfile_a6ce8e2d49648191ba9d6648f04a95a3&account_id=personal). Ingen demooppretting/import/videoavspiller/ny film ennå. Godkjent videomal1.0 og pilot beholdes; den eldre formuleringen nedenfor om ingen produsert video er historikk.

Samme PR295/Preview/Sandbox, BEGGE: søk/liste beholder nå fasadens brede arbeidslayout og lesbar trefftekst. Faktisk førfeil gjenskapt innlogget og i native prøve;85native søk/fasade/regresjonskrav,233veiledningskrav,766builderkrav og full critical Sandbox-buildPASS. [Endring og presise begrensninger](docs/changes/housing-search-layout-036-20261031.json). FørsteCI836stoppet fordi demoplanens filnavn utløste Demo/Test-grensen. Planen er tatt ut av kodepakken og bevart som eget dokument og i PR-beskrivelsen. Vakten er uendret. Endelig commit/nyCI/READY/levende etterkontroll vedlikeholdes i PR295. PR294holdes separat. Totaldesign/rolle-/PDF-/enhetspunktene er fortsatt åpne; ingen redesign-TEST OK/merge/Production/demo-synk.

# Boligveiledning – fast retur og temaer31.10

Samme PR295/fast design-Preview/Sandbox, BEGGE. «Slik styrer du prosjektet» bruker nå felles høyrepanel med åtte temaområder, fulltekstsøk, én forklaring og fast «Tilbake til prosjektet»/kryss/Escape. A–Å-guidens18steg har samme ramme.233native assertionsPASS,69opprinnelige tekstblokker bevart, foundation/builder766/guide213 og full critical Sandbox-buildPASS. Ingen Bolig-kjerne-/data-/tilgangsendring. [Omfang og testgrunnlag](docs/changes/bolig-guidance-workspace-036-20261031.json). Endelig kandidat/fullCI/READY/innlogget kontroll/bilder i PR295. Ingen TEST OK/merge/Production/demo-synk. Video er vurdert som korte, selvstendig redigerbare klipp per arbeidsoppgave; ingen video er produsert ennå.

# Fortsettelse31.10 – dokumentvalg og eksportprøve

Samme PR295/Preview/Sandbox, BEGGE. Full veiledning er nå utvidbar, og omfang/søk deler PC-rad. Native36PASS og time-opt-in63PASS. [Endring og presise begrensninger](docs/changes/inspection-extract-workspace-036-20261031.json). Separat PR298338094b1 har fullCI83310/10 og egen bekreftet Sandbox-Preview; låsrettelsen er ikke flyttet inn i designen. Innlogget fire-siders eksport ble laget, men filbroen leverte ikke filen til visuell etterkontroll. Endelig kandidat/CI/READY og innlogget status i PR295/298. Ingen TEST OK, merge, Production eller demosynk.

# Dokumentuttrekk – native valgflate31.10

Samme PR295/Preview/Sandbox, BEGGE. [Scope/tester og separat PR298-begrensning](docs/changes/inspection-extract-workspace-036-20261031.json). Kandidat/CI/READY/bilder i PR295. Ingen redesign-TEST OK/Production/main/demo.

# Garanti – kategorier og PDF-fortsettelse31.10.2026

Samme PR295/Preview/Sandbox: originale Sopro-mangler per kategori, lesbar full kvittering og gjentatt målt PDF-kategori ved sideskift. [Endring og presise grenser](docs/changes/warranty-point-groups-pdf-continuations-20261031.json). Endelig kandidat/CI/READY/tester/bilder i PR295. BEGGE; ingen redesign-TEST OK/Production/main/demo.

# Native PDF – avsender, titler og signaturstørrelse31.10.2026

Eksisterende PR295 fortsetter med målt avsender/fulle fortsettelsestitler og proporsjonale signaturbilder i delt boxed-renderer. Egen kontroll-PDF beholder samme signerte data og sistelesing; komplett sluttrapports kontrollhistorikk er et separat åpent punkt. [Endring og native tester](docs/changes/boxed-signed-pdf-layout-20261031.json). Full kandidat/CI/READY og varige bilder vedlikeholdes i PR295. Miljømål BEGGE, utførelse bare Preview/Sandbox. Ingen redesign-TEST OK eller Production/merge/demo-synk.

# Komplett sluttrapport/garanti – nattcheckpoint2

Kun PR295/Preview/Sandbox. [Endring og faktisk testdekning](docs/changes/closeout-warranty-report-layout-20261031.json). Full kandidat/CI/READY/bildeleveranse vedlikeholdes i PR295. Ingen redesign-TEST OK eller Production/main/demo-endring.

# Nattarbeid31.10 – garanti/PDF i PR295

Ny avgrenset garanti/PDF-pakke, kun Preview/Sandbox. [Endring/tester](docs/changes/warranty-pdf-design-036-20261031.json). Eksakt kandidat, CI og deploy/live føres i PR295; øvrige145-reiser og separatePR294/298/305 forblir åpne. Ingen redesign-TEST OK eller produksjonsendring.

# Egne sjekkpunkter og godkjenningskø – Preview-arbeid

[Oppgave304](https://github.com/ExpoProffsenter/expo-proffdok/issues/304) gjelder flere bevarte lokale kladder, egne punkter for alle aktive ansatte og forslag til firmamal med separat firmagodkjenning. Eksisterende core-branch gjenbrukes fra publisert main; ingen ny branch. Migrering prøves kun i Sandbox før ny TEST OK. Ingen Production- eller demo-synk er godkjent for denne funksjonen. DesignPR295 viser funksjonen som Preview-integrasjon av [corePR305](https://github.com/ExpoProffsenter/expo-proffdok/pull/305). Ingen ny backend skjules som en ren designendring. Nøyaktig kandidat, CI, Preview og innloggede begrensninger vedlikeholdes i PR/oppgave304. [Endring og tester](docs/changes/checklist-template-proposals-20261031.json).

# Designfortsettelse – 31.10.2026

Samme draftPR295/branch/Preview, miljømål BEGGE. Gjeldende main b389c707 er integrert med publiserte eksterne sjekklister/signaturer/firmamal. Seks arbeidsområder på Startside beholdes; Fyll ut sjekkliste legges i eksisterende sjekklisteområde. Ny samlet pakke: kompakte svarvalg, native maleditor og planfelt. Faktisk kandidat/QA/deploy/live dokumenteres i PR295. Ingen redesign-TEST OK eller Production-publisering.

# Preview-gjennomgang – 30.10.2026

Prosjektbarn: native beskrivelse/kundeinfo/prosjekteringsfelt/avtale/produkter/innredning/fag-utstyr/chat/notater/overtagelse/garanti får samme03.6-ramme, og prosjektavvik/kontrollør native høyrepanel. Bare ny scoped screenCSS/import, QA og dokumentasjon.531 assertions/85 tilstand×bredde-visningerPASS, negativt foreldrestilsett feiler, eksisterende workspace193/kunde36/save98 og kontrakt/closeoutPASS. Samlet app-UXPASS og eksplisitt Sandbox critical/buildPASS. Eksakt sluttkandidat/CI/Preview/innlogget kontroll vedlikeholdes øverst i [PR295](https://github.com/ExpoProffsenter/expo-proffdok/pull/295). Grunnlag docs/changes/project-subflows-design-036-20261030.json. Ingen redesign-TEST OK eller Production.

Forrige appkandidat f479c5d4 har fullCI805SUCCESS og faktisk innlogget KS-etterkontroll. Skynettleseren svarer igjen. Gjenoppta neste faktiske barn etter handoff og145-reisers register; PROJECT006/KSHMS006/011/012 og gjenstående roller/Help/PDF/enheter er åpne. Ikke start tidligere KS-pakke på nytt.

Innlogget5992a1a1/CI806SUCCESS avdekket et ekstra native div-nivå rundt kundeeditoren. Den manglende nesting-fixturen er gjenskapt som negativ, og selektor/fixtur/kundekort/kunderegister er korrigert.531/85 består fortsatt. Endelig oppfølgings-SHA/fullCI/live er i PR295; CI806 attesterer bare første prosjektkandidat.

QA-oppfølging: CI807 på92afd1e7 stoppet i tilbudsprøvens klikk før native rAF-effekt. Timingfeilen er gjenskapt; testen avventer nå ferdig native aktiveringsvisning og beholder alle55 krav, med fire ekstra remount-countkrav. Ingen produktkode endres.59PASS både med normal scheduler og120ms QA-schedulerforsinkelse; ny fullCI føres i PR295. Grunnlag docs/changes/sales-flow-frame-sync-20261030.json.

Planvelger-oppfølging: f678d343 har fullCI808SUCCESS10/10; tilbud59 og prosjekt531 er bekreftet i CI. Ny native arbeidsoperasjonsvelger følger samme høyrepanel med bevart PlanDialog/kladd/fokus og scoped16/44. Layout212/prosjektplan39/KS-plan159 og Sandbox critical/buildPASS; sluttkandidat/CI/innlogget velger i PR295. Faktisk eksport fra lagret VVS-case er kontrollert:21oppgaver/79dager/282kalenderperioder,14PDF-sider, konsistente PDF/CSV/ICS-tall. Grunnlag docs/changes/progress-picker-design-036-20261030.json. Hovedplanens resterende14px-kontroller, øvrige rolle-/mal-/vedleggsreiser og fysisk mobil/Safari er fortsatt åpne; ingen totalattest.

## Tidligere avgrensede leveranser – historikk

KS-underflater30.10: faktisk RUH/SJA/vernerunde/risiko og åpne underpunkter samles i original03.6-høyrepanel. Ny979-assertions-prøve/221 tilstand×bredde-visninger og eksisterende197 med full sen runtimeCSSPASS. Kun CSS/import, QA og dokumentasjon. Ingen nye funksjons-/lagrings-/tilgangs-/sendingseiere. Fersk kandidat/full CI/Preview og innlogget kontroll i PR295. Handoffens nye topp gir konkret samtaleinngang, e-postgrense og navngitte resterende KS-/prosjektbarn. Grunnlag docs/changes/kshms-subflows-design-036-20261030.json. Fortsatt bare Preview og ingen redesign-TEST OK.


HR-underflater30.10 etter brukerens nye bilde: baseline189109f3 hadde fortsatt ulike rammer inni medarbeidervinduet. Samlepakken bruker samme03.6-stil for kontakt/samtale/sykefravær/leder og tilgang, tilhørende verktøy/maler/historikk og HR fra Min side. Ny underflateprøve laster også sen APP_RUNTIME_STYLES og åpner hver konkret delvisning; gammel CSS feiler. Registerbevis betyr ikke at underfunksjoner er gjennomgått. Eksakt sluttantall, full CI, Preview og innlogget kontroll i PR295; grunnlag docs/changes/hr-subflows-design-036-20261030.json.145-reisers register har avstemt delbevis og en konkret underflateport. Resten av appen er fortsatt ikke ferdigattestert. Ingen redesign-TEST OK.

Ny samlepakke30.10: brukerens Bolig-pilot er gjenskapt; CSS samler toppen og gir fasade/varsler første PC-skjermbilde med bevart bildestørrelse. Ny48-prøve med reell Entry/Overview/native tilstanderPASS. Tilbudets faktiske router/malmotor/logovalg/kunde/PDF og akseptert videreføring har ny55-prøve; krasj på floatingActionBottom og enslig PDF-seksjonsoverskrift er gjenskapt og rettet. Eksisterende Bolig762, tilbud277/229, kunde875+35+26 og aksept44/routing111/handler31PASS. Eksakt sluttkandidat/CI/Preview/innlogget kontroll i PR295. Ingen ny backend-/tilgangs-/sendingsmotor, ingen redesign-TEST OK.

Ny samlepakke30.10: Ny forespørsel, tilbudstypevalg og begge direkte tilbud følger original03.6 sitt høyrepanel, med samme felt/kundesøk/UUID/validering/lagringskommandoer. Befaringsplan får eksisterende editor-ramme. Ny110-assertions faktisk komponent-/handlerprøve og eksisterende salgsregresjonerPASS; eksplisitt Sandbox critical/buildPASS. Full app-UX, ny CI/deploy og innlogget sluttkontroll i PR295. Grunnlag docs/changes/sales-entry-workspace-036-20261030.json. Bare Preview, ingen redesign-TEST OK eller totalattest.

Neste samlepakke: prosjektbilder, kundeportal og privat dokumentinngang. Ny149-assertions runtimeprøve og visuell PC/mobilkontroll; eksisterende tilgang/lagring beholdes. Eksakt kandidat/CI/innlogget resultat i [PR295](https://github.com/ExpoProffsenter/expo-proffdok/pull/295), varig grunnlag docs/changes/project-media-portal-036-20261030.json. Bare Preview, ingen redesign-TEST OK.

Firmaadmin-oppfølging etter brukerens bilde30.10: oversikten var fortsatt for luftig selv om høyrepanelene var oppdatert. Native invitasjon/boligtilgang er samlet i handlingsrad; brukerlisten viser identitet, rolle og status med søk i PC-høyrekant og samme innhold stablet på mobil. Faktisk count og samme panel-/skjemaeiere. Company-admin-prøven247 inneholder alle165 tidligere assertions og ekte ytre Firma-seksjon/runtime-stil. Full Sandbox critical/buildPASS; kandidat/ny CI/deploy og innlogget sluttkontroll føres i PR295. Bare Preview; ingen redesign-TEST OK.

Ny samlepakke30.10: innlogget gjennomgang avdekket gjennomsiktig KS/HMS-rapportvalg. Rapportvalg, native sjekklister og Varetelling følger nå felles03.6-ramme. Faktisk komponent-CSS-test report78/checklist88/stock73PASS; negativ original gjenskaper feilen. Ekte React/jsPDF7PDF/4utskriftsforløp og eksplisitt Sandbox critical/buildPASS; samlet app-UXPASS.145-reisers register er avstemt med nyere delbevis per ID, uten totalattest. Eksakt kandidat/CI/deploy/innlogget sluttkontroll i PR295 og konkret handoff. Bare Preview, ingen redesign-TEST OK.

Ny oppfølging30.10: Firmaadmin og Hjelp hadde fortsatt gamle underflater. Invitasjon, native brukerkort/boligtilgang og hjelpetemaer bruker nå samme WorkspacePanel. Hjelp har åpen overskrift og kompakt en/tokolonners indeks. Faktisk firma-/Help-nettleserkontroll165PASS med alle52 tidligere assertions beholdt, produksjons-CSS og fem bredder. Kladd/fokus, disabled-revalidering, firmaskille, kapitler/søk og ingen automatisk gjenåpning ved gjenopprettet tilgang. Bare PR295/Preview; eksakt kandidat/CI/innlogget kontroll føres der. Ingen totalattest eller Production-publisering.

**Totalgjennomgangen av design og funksjon er ikke fullført.** Gjenoppta fra [konkret handoff](docs/qa/DESIGN_036_HANDOFF_20261029.md), [145 navngitte reiser](docs/qa/proffdok-journey-review-20261029.md) og fersk head/CI i [PR295](https://github.com/ExpoProffsenter/expo-proffdok/pull/295). Ingen ny designretning eller nyinnventering etter chatbrudd. Original03.6 og brukerens uttrykkelig godkjente Startside med seks arbeidsområder beholdes.

PR295 er fortsatt draft, miljømål BEGGE, bare Preview. Brukeren har avvist én-og-én-fiks og gjentatte erklæringer om designlikhet. Siste samlede layoutpakke bruker felles WorkspacePanel i arbeidsverktøy og HR-støtte, felles mål for rammer/typografi/bredde og kompakt HR-register med full fristliste/oppsett i høyrepanelet. Samme presentasjonsgrunnlag omfatter Prissøk, Varesøk/Varebestilling og Boligprosjektenes hovedinngang. Mobil/smart Prissøk35/94, ordre280 og Bolig-builder684PASS. Samlet lokal app-UX1643, prosjekt/Personal253, kundepreview936 og HR-registerReact PASS; full Sandbox critical/build og faktisk publisert kandidat/CI/visuell kontroll føres i PR295. Forrige kandidat50144fc har full CI779SUCCESS og innlogget kontroll av eksakt publisert/akseptert tilbudsversjon. Ingen totalattest, redesign-TEST OK eller Production-publisering.

Ny samlet oppfølging30.10: planleser med valgbare perioder, firmaets eksisterende time-opt-in i personlige innganger, native time-/planrammer og søkbar konteksthjelp. Lokal app-UX1706, prosjekt/Personal253, plan159 og timeReact91PASS; full kandidat/CI/deploy/innlogget kontroll føres i PR295. Boligoppgavenes kompakte førstegangsvisning og presenceordlyd følger PR294. Ingen totalattest eller Production-publisering.

Ny presentasjonspakke30.10: boligfotoet bruker mer ledig PC-bredde uten økt side-/felthøyde, og Systemadmins native firma-/brukerpanel får felles ramme. Lokalt bolig762, adminpanel63, samlet app-UX1769 og firmaadmin52PASS. Se [konkret administrasjonskontroll](docs/qa/ADMIN_REVIEW_036_20261030.md). En faktisk Sandbox-feil i henting av arbeidsfirmatilganger står åpen; ingen backend-/tilgangsendring i pakken. Eksakt kandidat/CI og innlogget sluttmåling føres i PR295.

Åpent: resterende innloggede helappreiser og16 flerfamiliehus i egen Bolig-Preview. Dokumentuttrekkets eksisterende låsefeil ved firmabytte under nedlasting følger separat PR298, ingen skjult rettelse i designpakken.

Neste samlepakke30.10 omfatter fire resterende flater: Firmaprofil, Support, Produktmaster og Internt vareregister. Åpne overskrifter og felles felt-/tekst-/rammemål; kompakte produktstatuser, riktig avkryssingsbredde og logokontroller uten overlapping. Faktisk Chromium88PASS over fem bredder, med kildehentet native Nytt produkt-/garantipunktskjema og samme DOM/kladd ved områdeskifte. Native eiere/kommandoer uendret. Full app-UX/support/build, eksakt kandidat og innlogget sluttkontroll føres i PR295. Totalgjennomgangen står fortsatt åpen.

Lesende e-postundersøkelse: [mottakerlogikk og HR-finnbarhet](docs/qa/MAIL_ROUTING_AUDIT_20261029.md). Designpakken endrer ingen mottakere eller utsendingsoppsett. Separat [PR296](https://github.com/ExpoProffsenter/expo-proffdok/pull/296) retter internt akseptvarsel til eksplisitt valgt gjeldende saksbehandler; rettelsen er godkjent og publisert i Production og permanent demo i PR296/297. Ingen binding/backfill eller prøve-e-post er utført. Designkandidaten har tatt inn gjeldende main, og endrer ikke denne backendrettelsen. HRs egen aktiverte fristmotor er adskilt fra KS/HMS-rutineutsendingens sperre.

PR294: isolert boligrettelse for fasadehøyde og adressefokus ved byggvalg, ny 16-hus-fixture. Eksakte kandidater/CI/Preview-bevis vedlikeholdes i PR-ene. Ingen app-TEST OK, merge eller produksjonssetting.

# Gjeldende leveranse – 27.10.2026

## Saksbehandler for akseptvarsel – publisert 29.10.2026

Kenneth autoriserte Production på grunnlag av utviklertester. PR296 er merget som `fd87265d2b4b9a4556287b157f0ca77f785827fc`, etter full Core Safety #768 / 40940249573 SUCCESS. Vercel `dpl_Bif1ZERHqyLfnETAJ7ruFdE8Jecy` er READY på eksakt commit og expo-proffdok.app. Hovedapp og SalesModule er byteidentiske med lokal Production-build; ingen Sandbox-binding i hovedappen.

Production har migrering `20261029193247` og acceptance-notify v8. Nye funksjoner er identiske med Sandbox, eksisterende public-funksjoner uendret, privat RLS/ACL kontrollert. 20 reelle kandidater i lesende databaseprøve med eksisterende Kenneth-kontekst. Dette er ikke en faktisk innlogget nettleserøkt. Ingen saksbinding/backfill eller prøve-e-post er utført. Eldre fritekstsaker må få ett eksplisitt lagret saksbehandlervalg; navn blir ikke automatisk oversatt til bruker-ID.

[Release, QA og tilbakeføring](docs/qa/SALES_CASE_HANDLER_RELEASE_20261029.md). Gjeldende demo-SHA og sluttkontroll vedlikeholdes i [PR296](https://github.com/ExpoProffsenter/expo-proffdok/pull/296). Design-PR295 er fortsatt separat Preview og har ingen produksjonsgodkjenning.

## Varebestilling

Varebestilling er publisert for proffkunder med eksisterende katalogtilgang og interne Ringside/Expo-brukere med Prissøk. Interne brukere finner Prissøk → Varebestilling → Firmaprofil, samt Åpne varebestilling i Prissøk. Proffkunder beholder sitt avgrensede vareutvalg.

Funksjonsrelease: main `4a33cef5d791a7bc804e7acfdad4d59dae772601`, fra godkjent kandidat `7ce1a3f21a53617c9e977e32006f6191387894e3`. Full Core Safety #729 / 40580430716 er grønn. E-postlayouten følger etablert mal; Cordel ASCII og Excel er prisfrie. Rutine-e-post er fortsatt deaktivert.

Kenneth har gitt TEST OK og deretter uttrykkelig bestilt én testmail til seg selv. Agenten sendte den fra faktisk Production til kenneth@ringside.no med TEST – SKAL IKKE LEVERES. Appen og e-posttjenesten bekreftet sendingen. Faktisk mottak/vedlegg/layout i innboksen gjenstår til Kenneth bekrefter det. Ingen prøve-e-post er sendt fra Sandbox. Se docs/qa/PRO_CATALOG_ORDER_ENTRY_20261027.md.

- [Produksjonslogg og tilbakeføring](docs/qa/PRO_CATALOG_ORDERS_RELEASE_20261027.md)
- [PR290 – siste faktiske deployment-, demo- og teststatus](https://github.com/ExpoProffsenter/expo-proffdok/pull/290)
- [Arkitektur og tilgang](docs/architecture/PRO_CATALOG_ORDERS.md)

## Varebestilling: antall og Enter – publisert

Kenneths nye TEST OK gjelder kandidat `bbe67f1a`, publisert som main `a31c0673ba917a677954dc94bfd5ead0dbd0471f` etter grønn Core Safety #731 / 40585298385 og faktisk innlogget Preview-prøve. Pluss/minus, piltaster, Enter til neste varesøk og fokus i antall er publisert. Vercel `dpl_FVLJFLV6UJtwQ6NZ8wW9F3dbqFgZ` READY på eksakt SHA; faktisk Production-HTML/hovedapp/ordrekomponent er identiske med lokal Production-build, og innlogget Production viser nye kontroller og bevart låst sendekvittering. Ingen backend, database eller ny e-postsending.

[PR292](https://github.com/ExpoProffsenter/expo-proffdok/pull/292) er varig logg for godkjenning, faktisk main/demo-SHA, deployment, preflight og tilbakeføring. Rene dokumentasjonscommits endrer ikke funksjonsreleasen. Se [QA og release](docs/qa/PRO_CATALOG_ORDER_ENTRY_20261027.md).

## Arbeidsprosess og historikk

Følg `docs/DEVELOPMENT_WORKFLOW.md`: én varig endringsbeskrivelse, relevante dokumenter og kontrollert main → demo med bevart overlay og preflight. PR289 dokumenterer prosessforenklingen, PR288 tidligere kundepreview-rettelse.

Eldre releasebevis finnes i Git-historikken og [arkivet](docs/archive/RELEASE_STATUS_BEFORE_PROCESS_20261026.md). Historiske ventende punkter overstyrer ikke senere verifiserte PR-er.


## Separat publisert funksjonalitet

# Utførelsessjekklister – TEST OK og publisert 31.10.2026

Brukerens TEST OK gjelder signatur- og firmamalkandidat `2ccecedf`. Full Core Safety820/41150527338 SUCCESS10/10; PR301 er merget som `7c22018d3054b3bad31004bb556ada0af2e1e2c6`. Vercel `dpl_HDuQQSbhmBqTFPbr2L49n9CmW46R` er READY på samme commit og expo-proffdok.app. Faktisk Production-HTML/loader/bootstrap/app er sammenlignet med eksplisitt lokal Production-build; produksjonsbinding kontrolleres ved publisering. Gjeldende main-/demo-SHA, fullført main → demo, privat rollout-aktivering, preflight og eventuelle begrensninger vedlikeholdes i [PR301](https://github.com/ExpoProffsenter/expo-proffdok/pull/301).

Vanlige utførelsessjekklister har påkrevd tegnet signatur fra fullfører og separat valgfri ekstern signatur. Lagre som firmamal ligger rett etter punktene, før Signering, med eksisterende rettigheter og skille mellom utkast/publisering. Prosjektering, Bolig/UE, vernerunder, risiko og Overtagelse er utenfor. Fullført historikk er urørt. Tre additive SQL-filer er installert atomisk i Production som migrering20261031003022. PDF-Edge standalone-checklist-email v2 er ACTIVE/JWTtrue og har samme eksakte bundle som Sandbox v3. RLS/ACL og uendret historikk er kontrollert. Teknisk Production-prøve av signert kommando avviste manglende signatur og bekreftet kladd/readback med tilbakerulling; ingen nye testkontroller, prøve-e-post eller falsk reell signering. [Endring og tester](docs/changes/execution-checklist-signatures-20261031.json).

Eksterne sjekklister fra [PR299](https://github.com/ExpoProffsenter/expo-proffdok/pull/299) finnes via Meny → Sjekklister / Startside → Fyll ut sjekkliste. Ordrenummer og arbeidssted/adresse kreves; eksternt prosjektnavn og kunde følger også kontroll/PDF når utfylt. Ingen ProffDok-prosjektopprettelse. Nettleserfilbroens PDF-overføring, fysisk mobil/Safari, faktisk innlogget Production-prøve og reell e-postlevering er avgrenset i godkjenningsgrunnlaget.

Neste UX-ønske er notert i [oppgave302](https://github.com/ExpoProffsenter/expo-proffdok/issues/302): kompakte, stilige avkrysningsbokser i alle sjekklister, fingervennlig trykkflate, tydelig grønn V for OK/Ikke aktuelt og oransje Avvik. Ikke implementert som del av signaturreleasen.
