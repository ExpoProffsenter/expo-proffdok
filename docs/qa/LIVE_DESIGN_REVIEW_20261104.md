# Innlogget designgjennomgang 4. november 2026

Miljømål BEGGE. Baseline main/Production 34daef4c0526b93ddbd84c3bfd97fb0833d97caf, Vercel dpl_3D5fzV9TVkidd7x7Eowg3V6hWjQ2 READY. PR295 er merget 2. november; PR294/298/305 inngår. Demo fd5aafa17d0a6412bebc60b586e328d682393d8e er nå oppfrisket mot remote. Ny arbeidsbranch fase45b-ux-live-review-20261104 / PR308. Ingen ny TEST OK eller produksjonsendring.

## Oppdrag og avgrensning

Kenneth ønsker helhetlig QA etter kundemøtet 3. november: hele appen og underfunksjoner, Hjelp øverst, filmer under relevante temaer og full A–Å-film for Boligprosjekter. Alle tidligere grønne delbevis beholdes. Denne loggen er en løpende kontroll, ingen totalattest.

Første kodepakke berører bare main.jsx sin eksplisitte Hjelp-integrasjon i eksisterende interne toppfelt, HeaderHelp, hjelpetemaenes presentasjon/søk, videoknapper og tilhørende tester/dokumentasjon. Den nye knappen åpner et native høyrepanel uten navigasjon eller lagring. Oppgavene bak panelet beholdes montert. Nytt firma/bruker lukker hjelp; tekst-/filmtilgang følger eksisterende kontekst. Bolig får egen hjelpeinngang med eksisterende 18-stegsguide og detaljhjelp. Fem opprinnelige filmer og avspilleren beholdes. Ingen endring i auth, kundeaksept, beregninger, autosave/recovery, backend, database, e-post, demo-overlay eller produksjonsdata.

## Faktisk innlogget Production-kontroll

Ny skynettøkt, vellykket sikker innlogging, Ringside Rørleggerbedrift. Lesing/disclosures/søk, ingen skjemalagring, sending, signering eller tilgangstildeling. Arbeidsfirmabytte til Expo er en separat bevisst brukerprofilhandling, ikke datamigrering.

| Område | Faktisk kontroll | Grense / neste kontroll |
| --- | --- | --- |
| Innlogging | E-post/passord, godkjent konto, riktig firma/logo og hovedmeny | Separate ansatt-/leserroller og fysisk Safari mangler |
| Startside | Arbeidsområder, sjekklisteinnganger og eksisterende tilbudsoppfølging | Alle oppgavetyper, mobil og rollevarianter mangler |
| Boligprosjekter | Firmaoversikt med 0 aktive, åpne/lukke prosjektbygger, A–Å 18-stegsguide og retur | Fylt prosjekt, hele PL-/UE-/beboerreisen, lagring og full film mangler |
| Hjelp | Hovedmeny → Hjelp, sent lastede roller/temaer, teksttema og retur | Videoavspilling i levende miljø og nye topperstatning kontrolleres separat |
| Prosjektliste | Egen/felles liste, åpne eksisterende prosjekt | Dupliserte egne/felles rader bør vurderes; ikke slett data |
| Prosjekt | Oversikt, prosjektbeskrivelse, Prosjektmeny, Sjekklister, Rapport/tilbake | Øvrige faner og konsekvensfulle helreiser mangler |
| Sjekklister i prosjekt | Native høyrepanel, 7 uferdige kontroller, filtre/status og retur | Full utfylling/signering i isolert miljø mangler; lukket panel etterlater tynt arbeidsinnhold |
| Rapport | Native panel og lagret rapportinnhold, synlig PDF-knapp, retur til samme prosjektbeskrivelse | Ny full PDF-eksport ikke utført i denne runden |
| Forespørsel/tilbud | Lastet 42 saker, type/statusfiltre, Ny forespørsel/avbryt, Nytt tilbud/typevalg/avbryt | Begge editorer, befaringsnotat, kundevisning, aksept og kontrakt mangler |
| Prissøk | Faktisk søk Dansani gir katalogtreff, prisnivåer og varedata | Ingen vare lagt til eller plukkliste lagret |
| Varebestilling | Tom kladd, vareinngang, mottaker/levering, kontrollknapp sperret uten varer | Leverandørfiler, mottakerlagring, sending kun isolert |
| HR | Lastet medarbeiderregister, Alle HR-funksjoner, meny og retur | Private samtaler åpnes ikke som UI-demo i Production; native isolerte prøver kreves |
| KS/HMS | Daglig arbeid, Rutiner og håndbok, Avvik og RUH | 87 rutiner lastet; underredigerere, dokumentuttrekk og komplette flyter mangler |
| Min side | I dag, Mine planer, tomme prosjekt-/andre planer, støttesaker | Timeføring er av i dette firmaet og skjules; andre faner/innhold mangler |
| Firmaadmin | Lastet brukeroversikt, Inviter en ansatt/native panel, uendret skjema/lukk | Tilgangsendringer og utsending ikke prøvd |
| Systemadmin, firmaprofil, support | Ikke ferdig kontrollert | Må tas med, ikke utled full dekning fra felles CSS |

## Påviste UX-forhold

1. Hjelp ligger bare under Alle områder på PC. Ny pakke gir synlig toppknapp og beholder arbeidsflaten.
2. Egen Vis videoer-oversikt legger til en mellomside og tar mye plass. Ny pakke legger Se video direkte under temaet med felles søk og uendret avspiller.
3. Global Hjelp mangler et Boligprosjekter-tema selv om en kort boligfilm finnes. Ny pakke kobler de eksisterende guidene/filmen til et tilgangsstyrt tema.
4. Introduksjonen i Hjelp er lang og blander oppgaver med forklaring av systemet. Den forkortes; faktiske fagveiledninger beholdes.
5. Prosjektets sjekklistefane blir nesten tom når panelet lukkes. Dette krever en egen gjennomgang av retur/oversikt før en eventuell kjernerettelse; ingen prosjektlogikk endres i hjelpepakken.
6. A–Å i Boligprosjekter er tekst og eksempelbilder. Finn bolig-filmen er avgrenset og skal ikke fremstilles som komplett A–Å. Ny full film gjenstår etter verifisert arbeidsflyt.
7. KS/HMS-håndboken gjentar Håndboken er klar og neste-handling øverst/nederst. Vurder samlet informasjonsmengde og rekkefølge i den videre helreisen.

## Testbegrensninger

Lokal full npm build med critical-kjeden PASS. Lokal native Chromium-prøve startet ikke: miljøet nektet socket()/ProcessSingleton før testen. Ingen produktfeil eller bestått nettlesertest utledes fra dette. Samme test kjøres i ordinær CI; ingen testkrav svekkes. Eksisterende video-/retur-/tilgangs-/feil-/mobilkrav tilpasses den uttrykkelig bestilte direkte temaplasseringen, og toppknappens monterings-/Escape-/fokus-/firmabyttekrav legges til.

En automatisk browserkontroll avviste et leseklikk med feilaktig domenetolkning. Produksjonsdomenet ble kontrollert mot Vercels verified prosjekt-domene og repoets README/arkitektur før videre vanlig lesing. Ingen omgåelse eller alternativ nettleser ble brukt.

## Neste steg

1. Grønn full CI, fast Preview og innlogget prøve av den nye hjelpepakken; ingen merge uten ny TEST OK.
2. Fullføre fylt Boligprosjekt fra oppsett til overtakelse, roller/portaler og sluttpakke i isolert miljø. Bruke den verifiserte rekkefølgen som manus for kapitteldelt A–Å-film uten lyd, med den godkjente videomalen og redigerbare kilder.
3. Fortsette alle 145 registrerte reiser og senere sjekklistefunksjoner med faktiske underfunksjoner. Registrere felt/retur/kladd/feil og eksport, uten å kalle hovedsidebesøk en fullført helreise.
4. Samle naturlig sammenhengende UX-rettelser og dokumentere eksakt QA/Preview/produksjonsstatus her og i PR.

## Kandidat og første CI

9cb46a16 publisert som Sandbox Preview dpl_3HsGvN34uQbk1VEitoaNhBGy6qNu READY, eksakt commit og fast alias expo-proffdok-git-fase45b-ux-live-review-20261104-ringside.vercel.app. Anonym loaderkontroll: Sandbox-ref til stede, Production-ref fraværende. Vellykket sikker innlogging som eksisterende demokonto. Hjelp-knapp, høyrepanel og direkte filmknapper faktisk sett; nytt Bolig-tema finnes. Avspilling/retur og øvrige tester er under arbeid.

Første branch ux-live-review-20261104 traff repoets historiske Production-standard for ordinære Preview. Oppdaget ved anonym assetkontroll før innlogging/testing; ingen datahandling. PR307 er lukket til fordel for identisk kandidat i PR308 med eksisterende fase45b-Sandbox-regel. Ingen bindingskode eller Vercel-konfigurasjon endret.

CI890: scope/build/company-db/bolig-browser/hr-react/app-browser/hr-db/bolig-db består. projects-support stopper fordi en kildeuttrekkende headertest manglet de nye hjelpereferansene (isReadOnly først). Testvertens import/scope kompletteres; alle opprinnelige header-/handlings-/kladdkrav beholdes. Selve HelpCenter testes med native komponent i den dedikerte hjelpeprøven, ikke gjennom headervertens tomme hjelpeinnhold. Ingen appendring for denne fixturfeilen.

Innlogget Sandbox: Finn bolig-film faktisk lastet (75s,1920×1080,readyState4), kapittel0:35 ga currentTime35 og ordinær Spill av ga35.2352/pausedfalse. Lukk video returnerte til samme Hjelp og opprinnelig filmknapp; Bolig-tema → A–Å → retur → tema → retur → Hjelp → retur → samme Startside er kontrollert. Ingen serverlagring eller sending. Global Bolig-guide viste opprinnelig misvisende Tilbake til prosjektet; valgfri returetikett gir Tilbake til hjelpetemaet her, mens originaltekst beholdes i prosjektet. Native nested cancel/close isoleres, og samme reise får scenariovern. Tomme Viktig/Anbefalt bruk under nytt Bolig-tema får relevante korte råd.

## Bekreftet Bolig-layoutfeil og utvidet scope

Faktisk innlogget 40-boligpilot på9cb46a16: grouped .bolig-workspace-toolbar hadde grid-row:auto og topp1331.77px, etter fasaden og sju eksplisitt okkuperte sidefeltrader. Selve fasaden begynte500.39px. Grupperingen kom fra boligpakken, mens design-CSS fortsatt adresserte de tidligere direkte toolbarbarna. Kun presentasjonen utvides i samme samlepakke: workspaceSurface.css plasserer den nåværende wrapperen eksplisitt i første rad og bevarer eksisterende tolvkolonne/fasade/sidefelt. Samme workspaceSurface.css gir prosjektets fokusoverskrift scrollmargin under den faste toppmenyen (ordinær, mobil og fullskjerm). Ingen prosjekt-/søke-/filter-/lagrings-/recoverykode endres.

Den eksisterende housing-first-screen-prøven beholder alle opprinnelige krav og får uttrykkelig krav om gruppert toolbar før fasade, synlige kontroller uten sideklipping og faktisk første skjerm. Førkoden er målt rød i levende Sandbox; endelig CI/etterbilde kreves før ferdigmelding. Komplett film utsettes til dette virkelige layoutgrunnlaget er kontrollert, i tråd med godkjent videomal.

CI893 scopebegrensning: den historiske Bolig-core-vakten tillater ikke samtidig hovedappintegrasjon og endring i Bolig-modulens egne filer. All ny Bolig-rettelse er ren presentasjon; de tre scrollmarginreglene flyttes til den eksisterende delte designfilen workspaceSurface.css sammen med gridrettelsen. Bolig-modulens CSS blir igjen byteidentisk med main. Ingen guard, kjernefil, navigasjon eller lagringsmekanisme svekkes eller endres.

Etter60ef9946 i samme innloggede Sandbox: toolbar flyttet fra1331.77px til275.39px (slutt371.39px), før fasaden383.39px. ByggA/B, søk, filter, Fasade/Boligliste og statistikk faktisk synlige. Originalbilder bevart internt. Runden viser også at det lokale modulheaderet arver global z-index10/backdrop-blur som grid-item og maler over den faste appmenyen ved scroll. Dette nullstilles bare på .bolig-page>header i samme presentasjonsfil, med eget geometrikrav. Byggkolonnen får plass til de to byggknappene og den eksisterende Bytt bygg-inngangen på én linje; ingen knapp eller funksjon fjernes.

Ytterligere lest i40-boligpiloten: private kontrakter har syntetisk prøvekontrakt, versjoner/filhandlinger og egen økonomidialog; tall/fakturaregister/indexfeil kan leses uten lagring. Grunnpakker har eksisterende Standard bad med2varer, native redigerer og uendret retur. Katalogoppslag er ikke tilgjengelig for denne demokontoen i pakkeeditoren (manuelle varelinjer tilbys), og må avklares før en katalogbasert instruksjonsfilm. Dette er en faktisk testbegrensning, ingen ny tilgang gitt.

## Videre innlogget kontroll av fylt boligpilot

Sandbox/Expo/demokonto, eksisterende fiktiv40-boligpilot. Ingen ny bolig, ordre, tilgangslenke, e-post, signatur, arkivering eller backendlagring utført. Ikke brukt kundens Aamodthagen-prosjekt som testdata.

- H0101: åpne bolig, Rom/grunnpakker/tilvalg, eksisterende Bad med2varer, Tilpass denne leiligheten, faktiske varefelt, avsnitt, antall, enhet, FDV og bildeinngang. Lukking gjenoppretter samme rompanel og valgt bolig. Katalogsøk finnes her som internt vareregister; dette avviker fra gjenbrukbar pakkeeditor og må undersøkes, ikke konkluderes som manglende firmatilgang generelt.
- Bestilling: lagret usendt utkast,2valgtevarer, tydelig separat lagring/sending, eksisterende B-3 med1av2varer mottatt. Registrer varemottak viser dato, tidligere mottak, mengde nå, korrigeringsforklaring og lagre; lukket uendret. Ingen testutsending.
- Dokumentasjon: lagret sluttkontroll med mindre restpunkt, låste svar, opprinnelig utfører/dato, egne gjenåpnings-/krav-/arkivhandlinger. FDV viser2varelinjer med manglende lenker, tydelig at eksterne dokumenter ikke vedlegges.
- Samlet PDF faktisk lastet ned:51514bytes,13A4-sider, ingen JavaScript/skjemafelt. Tekst og alle sider visuelt kontrollert med MuPDF; riktig bolig, relevant fellesdokumentasjon, restpunkt, lagrede kontrollutgaver, overtakelsesvurdering og FDV. Layout uten påvist klipping. Popplers lokale fontsubstitusjon ga først misvisende typografi; uavhengig MuPDF-render viser normalt resultat. Ingen produktfeil utledes fra lokalt renderavvik. ZIP med originalfiler er ikke lastet ned i denne runden.
- Ferdigstilling: faktisk Overtatt med restpunkter,9åpneforhold, sporbar tidligere vurdering, beskjed om endret grunnlag. Intern sluttkontroll separat Ikke startet med2forståelige mangler. Ingen omregistrering/godkjenning.
- Beboerportal: ikke delt,0valgmuligheter/innsendtevalg/dokumentlenker/meldinger. Ingen lenke opprettet eller invitasjon sendt.
- Endringer/beboeraksept: akseptert boligvalg v1 og eksisterende endringsordre B-3v1 i kladd. Før1/etter2servantbatterier,1250krinkl.mva.,fristskjema og eksplisitt Opprett beboerlenke. Ingen lenke opprettet eller avtale akseptert.
- Oppsett: lagret rommal og fordeling,40boliger filtrerbare på bygg/oppgang/søk med10per side; eksisterendeinnhold beskyttes som standard. Ingen forhåndsvisning eller lagring utført.

Ytterligere UX-funn til neste avgrensede Bolig-kjernepakke:

1. Underpanelene Tilpass leiligheten, Registrer varemottak, Sluttkontroll, Samlet sluttdokumentasjon og Endringsordre returnerer visuelt til riktig forelder, men fokus blir AXWebArea ved ikonlukking. Hovedpanelets Tilbake til boligen returnerer derimot til opprinnelig oppgaveknapp. Faktisk fokusretur bør samles og sikres i native underpaneler.
2. Den tilbakekalte DEMO–Gantt-UEens detalj viser161aktiviteter som lang ufiltrert kortliste. Hovedprosjektets fremdrift har derimot80førsteaktiviteter med Visflere, filtrering og samlet tidslinje. UE-detaljen trenger tilsvarende oversikt ved store prosjekter.
3. Endringsordrekladd viser veiledning om å laste ned endringsgrunnlag før leverandøravklaring, men ingen nedlastingsknapp i denne kladdtilstanden. Teksten/handlingsrekkefølgen bør følge den faktiske statusen.

## Kontrollrunder etter toolbarrettelsen

CI894: alle pakker unntatt app-browser grønne; app-browser stoppet på en eksisterende umiddelbar geometrimåling ved viewportbytte. Samme44px/16pxkrav beholdt med venting på ferdig responsiv overgang. CI895/896 bekrefter denne prøven grønn.
CI896: bolig-browser,bolig-db,projects-support,build,company-db,hr-react,hr-db grønne. app-browser avdekket at flyttet toolbar ga fasadetopp505.39px ved1920, mot eksisterende krav<500. Krav beholdt: den gjentatte firma-/introduksjonsteksten skjules bare når et prosjekt er åpent på PC, og margin før fasaden reduseres. Boligoversikt uten åpent prosjekt og mobil beholder introduksjonen. Ny kandidat a39f110c er under CI897; ingen grønn totalstatus hevdes før alle pakker er ferdige.

Oppsett/Faktisk bemanning: funksjonen er av,0deltakere/registreringer, tydelige manuelle/Min side/UE-innganger og disabled Registrer deltaker inn. Ingen aktivering eller deltaker lagt til. KS/HMS og timer: hovedprosjektet mangler prosjektkobling, forklaringen og eksplisitt Opprett prosjektkobling vises. Ingen kobling opprettet. Arbeidssted-selecten viser samme H0101…H0504 to ganger for de to byggene, uten bygg/adresse i etiketten; reelt UX-funn ved identiske bolignumre, bør rettes sammen med Bolig-kjerneflytene. Backendverdiene er ikke undersøkt som feil; problemet er at valgene ikke kan skilles visuelt.

### Kontroll av faktisk opprettelse

I Sandbox er et nytt, tydelig fiktivt QA-prosjekt opprettet gjennom de fire native stegene: QA – Designgjennomgang04.11.2026 / QA-DESIGN-20261104, QA-bygg A, Fiktiv testadresse101,3etasjer×2boliger. Riktig6boliger og suksesstekst verifisert etter serverrespons. Dette er første avgrensede testskriving i denne runden; Production og eksisterende pilot-/kundedata er ikke endret. Ingen mottakere/tilganger/utsendinger opprettet. Etterbildet viser fasade348px og toolbar slutt336px med alle6boliger synlige.

Katalogavklaringen er korrigert ved å vente på serverkontrollen: ny grunnpakke viser først «Vareoppslag krever katalogtilgang», men deretter eksisterende internt vareregister og søk. Det er altså en misvisende ventetilstand, ikke bekreftet manglende tilgang. Avvisningstekst bør først vises når kontrollen er fullført; behold alle faktiske tilgangssperrer. Ingen katalogrettighet er tildelt.

## Grønn kodekandidat a39f110c

PR Core Safety CI897 / run41833840681: alle9valgte kontrollpakker og endelig Core safety + critical build PASS. Full build, scope/workflow, projects-support, HR React/database, company database, Bolig database/nettleser og samlet app-nettleser er ferdige. Dette er syntetiske transport-/databaseprøver, separat fra de innloggede stikkprøvene over.

Nye/berørte native bevis fra app-browser-loggen: Housing first screen100assertions; katalogeditor376; boligens arbeidsområder1167; Bolig-veiledning242; Hjelp/video196. Hjelpeprøven kontrollerte faktisk dekoding/avspilling/kapitler/slutt for alle5opprinnelige filmer, ingen autoplay/preload, fembredder/kortskjerm/fullskjerm, direkte temaplassering/søk, nestet retur/fokus/kladd, endret aktør/firma/tilbakekalt tilgang og feil/retry/tekstalternativ. Opprinnelige krav er beholdt.

Vercel Sandbox Preview dpl_DsAnFMW3cTCwMZPskrheuVhctGUH READY for eksakt a39f110c8b5a9dc555ad506c5675a195e3e3dcc0. Ingen produksjonsmerge eller demo-synk. Production er fortsatt baseline34daef4c; Kenneths opprinnelige arbeidsprofil Ringside er gjenopprettet og visuelt bekreftet.

Test i fast Sandbox-preview: åpne Hjelp øverst, søk bolig, start filmen direkte under temaet, lukk/åpne Bolig-tema/A–Å og returner. Åpne40-boligpiloten, kontroller byggvalg/søk/filter før fasaden, og åpne/lukk en boligoppgave. Ingen sending/signering kreves. Dette er en avgrenset rettelsespakke til TEST OK, ikke en totalgodkjenning av appen.

Ny QA-grunnpakke «QA – Standard bad» ble opprettet kun i det nye Sandbox-prosjektet med DEMO-DAN-001 og DEMO-HG-001 fra eksisterende internt vareregister. Lagret i prosjektet, versjon1,2varelinjer faktisk bekreftet. Ingen eksisterende grunnpakke eller boligvalg endret. Ingen bestilling sendt. Dette er underlag for videre kontroller og film, ikke en ferdig full A–Å-leveranse.


## Videre selvstendig gjennomgang og separat Bolig-pakke

CI898 (41835541883) på515e03b91e5ac59966c8e0b8088e364e09f537d5: alle ni pakker og sluttkontroll PASS. Kode er identisk grønn a39f110c; bare dokumentasjon ble supplert. Ingen godkjenning/merge er gitt.

Påvist Bolig-kjerne-UX er rettet i separat PR309, branch fase45b-bolig-flow-qa-20261104 fra faktisk main34daef4c, slik at permanent kjernegrense bevares: katalogens ventetekst/sene tilbakekalte svar, bygg/adresse i HMS-velger, søk/status/paging for store interne UE-lister, statusriktig endringsordretekst, native fokusretur, tilgjengelig klargjøringsfooter og sann melding under pågående lagring. Ingen nye rettigheter, RPC-er, migreringer, utsendinger eller lagringskommandoer. QA-logg i den branchen: docs/qa/BOLIG_FLOW_QA_20261104.md.

CI901 på2126ac0e og CI902 påa111690c bestod alle ni pakker og sluttkontroll, inkludert full build, native app/Bolig, HR/firma/prosjekt og databasegrensene. Kandidat73c97450 presiserer at aktive UE-filtre kan tømmes selv om oppfrisket liste blir kortere, og at en valgt status som forsvinner fortsatt vises ærlig. Seks nye native scenariosjekker beholder alle tidligere krav. CI903 (41842300062) kontrollerer siste kandidat. Separate vertsspesifikke innloggingsøkter må beholdes; ingen auth-state kopieres mellom previewer.

### Faktisk lagring bare i eget fiktivt Sandbox-prosjekt

QA-DESIGN-20261104 har seks boliger, QA-bygg A/Fiktiv testadresse101. En egen rommal (Bad1/QA–Standardbad, to eksisterende DEMO-varer) ble lagret. Første bolig ble forhåndsvist og lagret. Neste massefordeling viste fem klare og én bevart; med overstyring av egne rom avslått ble kun fem serverbekreftet oppdatert. Ny åpning etter modulgjeninntreden viste seks av seks «Boligvalg lagret».

Planleggingsflyten ble gjennomført med seks boliger×tre trinn=18aktiviteter, varighet1, etter foregående arbeid, to arbeidsdager mellom boligstarter, eksisterende demobruker ansvarlig og mandag–fredag. Forhåndsvisning16.11.–02.12.2026 med helgehopp. Etter bekreftelse viste serverreadback18aktiviteter/0utført/én historikklinje og «Endringen er lagret». «Vis første arbeid» flyttet Gantt til16.–22.11. og viste riktige første stolper. Deretter ble et boligspesifikt arbeidsnotat beholdt ved lukk/gjenåpne og lagret kun i H0101; samme aktivitet i H0102 hadde fortsatt tomt notat og opprinnelige18.11.-datoer. Ingen beboervarsel ble publisert, ingen e-post sendt, og eksisterende pilot/kundedata er urørt.

### Ny kontroll av ordinær prosjektretur

Sandbox DEMO–RESERVE (ferdig våtrom med garanti) ble lest uten redigering: prosjektoversikt → Sjekklister → Vis dokumentasjon → Lukk → Lukk sjekklister. Dokumentasjonsfeltene var faktisk disabled. Innerlukking returnerte fokus til «Vis dokumentasjon»; ytterlukking returnerte til full Prosjektoversikt, riktig prosjekt og fokus på «Sjekklister». Skjermbildet viste normal full layout. Tidligere observasjon av tynt returinnhold er dermed ikke reprodusert på denne kandidaten; ingen grunn til en prosjektreturendring på dette beviset.

Overtagelse på samme arkivprosjekt viser korrekt låsebeskjed, registrert dato/garanti og disabled Fullfør. Flere redigerbare felt, signaturtømming og Lagre overtagelse ser likevel tilgjengelige ut selv om prosjektet er låst. Kildekontroll bekrefter at saveProject leser faktisk serverstatus og avviser lagring ved låst prosjekt. Dette er et åpent presentasjonsfunn, ikke dokumentert omgåelse av lås. Ingen signatur, dato, navn, lås eller sending er forsøkt endret. En avgrenset visningsrettelse med egne låst/åpen-signaturprøver bør tas før denne delen kalles fullt finjustert.

### Video og avgrensning

Nytt faktisk videokapittel: «Boligprosjekter – masseplan for flere boliger»,204sekunder,1920×1080/H.264/24fps, uten lyd. Godkjent mal PROFFDOK-VIDEO-1.0 og uendret renderer. Ti native Sandbox-bilder/steg, kalenderkontroll, lagret resultat og retur, redigerbare kilder. [Videoens kvittering og gjenstående dekning](BOLIG_VIDEO_PROGRESS_20261104.md). Dette er et delkapittel og endrer ingen fullførtstatus for BOLIG-019 eller hele A–Å. Filmen er ikke lagt inn som erstatning for en full guide i appen.

Produksjon/main34daef4c og demo fd5aafa1 er uendret. Ingen gammel produksjonsplan, migrering, invitasjon, e-post eller opprydding er kjørt. Neste nødvendige kontroll er innlogging i PR309s Sandbox-preview, kontroll av de konkrete rettelsene og videre utfylling av helreiser/full video. TEST OK må komme før produksjonssetting.
