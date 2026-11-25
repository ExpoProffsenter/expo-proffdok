# ProffDok – funksjonskart, skjermoversikt og nyansattprøve

Dato: 28.10.2026. Kenneth har bestilt planens første leveranse og en selvstendig prøve i skynett. Miljømål: PRODUKSJON/PREVIEW. Denne runden endrer dokumentasjon og den separate designskissen; ingen ProffDok-appkode, database, produksjonskonfigurasjon eller e-posttransport.

## Konklusjon og styrende valg

Den nye retningen skal gjøre eksisterende fagfunksjoner lettere å finne og forstå. Bevar innloggingsbildet. Vis aktivt arbeidsfirmas faktiske logo. Bruk samme komponenter og arbeidsmønster i app, firmaadmin og systemadmin. Fasaden forblir standard i bolig, med valgfri tett liste. Ny prosjektøkonomi har lav prioritet; ERP/API er et separat senere spor.

**Min side bør være en fast hovedinngang for medarbeideren.** Start med dagens arbeid, tilstedeværelse, timer, rutiner og egne oppfølginger. Faglig forvaltning og administrasjon kommer frem gjennom riktige roller.

Ferdige, redigerbare forslag finnes allerede i HR, timeoppsett og sjekkpunktoppsett. De skal gjenbrukes som mønster: fyll bare tomme felt eller la brukeren velge eksplisitt, bevar kladd, skill forslag fra godkjent utgave og vis neste handling. En ny designimplementering skal gjenbruke dagens logikk fremfor å erstatte den med prototypekode.

## Verifisert grunnlag

- Main: `5f58b1c6ca974e0cf97cb4b945c8d6603a39f485`.
- Production: `dpl_5rvFAAsZ4WDeDwWj7Gg6qa3NLfkm`, READY på eksakt main.
- Demo: `dcff082f06be7b68e1e00c8a2d43794a1393f1cf`; `dpl_5JwQAZx9Z7BYvGUnfnaYQvgg6ADK`, READY på eksakt demo.
- Eksisterende arbeidsbranch: `fase45b-bolig-portal-polish-20261025`. Før denne leveransen: bare tidligere UX-rapport i diff mot main; 2 unike dokumentasjonscommits og 1 mergecommit bak main.
- Repoets AGENTS, guardrails, arbeidsflyt og aktuelle releasestatus er lest. Relevante critical-check-kontrakter for prosjekt, Min side, HR-navigasjon og firmaprofil er lest; ingen tester er svekket.
- Hele main-treet er hentet: 1757 oppføringer. 61 aktuelle kilde-/dokumentasjons-/testfiler er lest, inkludert hele `src/main.jsx`, bootstrap, navigasjonskontrakter, modulinnganger og sentrale fagarbeidsflater.
- Dagens demo er faktisk åpnet og innlogget via sikker nettleserinnlogging. Kontoen har flere roller. Prøven er utført med en nyansatts oppgaver og forståelsesnivå; dette er **ikke** en attest på en nyopprettet, begrenset ansattkonto eller alle tilgangskombinasjoner.

## Hva funksjonskartet betyr

Registeret nedenfor har **339 bevaringspunkter i 35 områder**. Dette er en breddeinventar med kilde og foreslått ny plass, ikke 339 uavhengige eller runtime-verifiserte funksjoner. Flere punkter beskriver samme arbeidsflyt fra forskjellige kontekster.

Status er kildekartlagt med mindre en konkret skynettprøve er beskrevet. Underliggende callbacks, betingede felt, alle varianter og roller må spores i pilotens detaljmatrise før 100 % funksjonsparitet kan erklæres. Manglende element i skissen er et implementeringspunkt, aldri en automatisk beslutning om fjerning.

## Områdene og foreslått plass

| Område | Bevarings-ID-er | Dagens inngang | Foreslått plass | Roller |
| --- | --- | --- | --- | --- |
| Innlogging | `AUTH-01`–`AUTH-09` | Auth-flaten | Behold eksisterende innloggingsbilde | Alle |
| Felles ramme | `NAV-01`–`NAV-08` | Globalmeny / arbeidsprofil | Fast navigasjon og tydelig arbeidskontekst | Etter fersk tilgang |
| Min side | `MINE-01`–`MINE-12` | innlogging / PersonalPage | Min side som hovedinngang | Egen bruker |
| Timer og utlegg | `TIME-01`–`TIME-18` | Min side → Mine timer / HR → Timer | Egen registrering og separat administrasjon | Ansatt / leder / timeansvarlig |
| HR og medarbeidere | `HR-01`–`HR-20` | hr / medarbeidervindu | HR med egen medarbeiderarbeidsflate | Egen bruker / leder / særskilt leser / firmaadmin |
| KS/HMS | `KS-01`–`KS-18` | kshms / KshmsNavigation | Samme tre arbeidsgrupper og én oppgave om gangen | Leser / ansvarlig / firmaadmin |
| Prosjekt | `PRJ-01`–`PRJ-16` | prosjekt / prosjektliste | Prosjektets arbeidsrom og bevart prosjektkart | Tildelt prosjektrolle |
| Prosjektering | `DES-01`–`DES-10` | prosjektering | Prosjektering → Løsning / grunnlag / kontroller | Prosjekterende / tildelt rolle |
| Fremdrift og bemanning | `PLAN-01`–`PLAN-08` | fremdrift / KS/HMS / Bolig | Felles planpresentasjon med bevart kontekst | Planlegger / deltaker / ekstern etter tilgang |
| Produkter og FDV | `PROD-01`–`PROD-08` | produkter | Prosjekt → Produkter og dokumentasjon | Tildelt prosjektrolle |
| Overflater og innredning | `SURF-01`–`SURF-05` | overflater | Prosjekt → Overflater og innredning | Tildelt prosjektrolle |
| Fag og utstyr | `INSTALL-01`–`INSTALL-05` | installasjoner | Prosjekt → Fag og utstyr | Tildelt prosjektrolle |
| Bilder | `PHOTO-01`–`PHOTO-07` | bilder | Prosjekt → Bilder med samme kilder | Tildelt prosjektrolle |
| Sjekklister | `CHECK-01`–`CHECK-12` | sjekklister / prosjektering | Prosjekt → Kontroller → eksisterende editor | Utførende / kontrollør etter tilgang |
| Avvik og sikkerhet | `DEV-01`–`DEV-08` | avvik / KS/HMS | Arbeid → Avvik og sikkerhet | Etter prosjekt- og modulrolle |
| Kommunikasjon | `CHAT-01`–`CHAT-05` | chat / internt | Prosjekt → Dialog / Interne notater | Avgrenset intern/ekstern rolle |
| Avtalegrunnlag | `CON-01`–`CON-06` | tilbud / sales | Prosjekt → Avtalegrunnlag og salgsgrunnlag | Tildelt prosjektrolle |
| Overlevering | `HAND-01`–`HAND-05` | overtagelse | Prosjekt → Overlevering | Prosjektansvarlig / kunde etter rolle |
| Garanti | `WAR-01`–`WAR-07` | garanti | Prosjekt → Garanti | Eksisterende utstedelsesrolle |
| Rapporter | `REP-01`–`REP-08` | rapport | Prosjekt → Dokumentasjon og rapport | Tildelt rapport-/portalrolle |
| Befaring og tilbud | `SALE-01`–`SALE-20` | sales | Salg → Sak → Befaring / Tilbud / Avtale | sales / store_offers etter fersk tilgang |
| Prissøk og plukkliste | `CAT-01`–`CAT-11` | Prissøk / pro_catalog | Salg og varer → Prissøk | Katalogtilgang / netto-tilgang separat |
| Varebestilling | `ORDER-01`–`ORDER-10` | catalog_order / egen menypost | Salg og varer → Varebestilling | Proffkunde med katalog og autorisert intern bruker |
| Varetelling | `STOCK-01`–`STOCK-09` | Prissøk → telling | Salg og varer → Varetelling | Firmaets telle- og eksporttilgang |
| Boligstruktur | `BSET-01`–`BSET-09` | bolig → Hovedside / Oppsett | Bolig → prosjekt → bevart fasade og valgfri liste | Boligtilgang / oppsettrolle |
| Boligpakker og tilvalg | `BPKG-01`–`BPKG-10` | bolig → Grunnpakker og tilvalgspakker | Bolig → Leveranse / valgt bolig | Prosjektansvarlig / beboer etter avgrensning |
| Boligbestilling og levering | `BCOM-01`–`BCOM-08` | bolig → Commerce / valgt bolig | Bolig → Bestillinger / Levering | Prosjektansvarlig / innkjøper / leverandør etter tilgang |
| Boligplan og samarbeid | `BPLAN-01`–`BPLAN-10` | bolig → Fremdrift og varsler / UE og leverandører | Bolig → Plan / Samarbeid | Prosjektansvarlig / deltaker / UE / leverandør |
| Boligkontroll og overtakelse | `BQA-01`–`BQA-10` | bolig → Quality / Completion | Bolig → Kontroller / Overtakelse | Prosjektrolle / UE / kontrollør etter tilgang |
| Boligkontrakt og fakturaregister | `BFIN-01`–`BFIN-07` | bolig → Kontrakter | Bolig → Kontrakt og fakturagrunnlag – lav prioritet for ny utbygging | Prosjektansvarlig / økonomitilgang |
| Eksterne flater | `PORT-01`–`PORT-10` | Kunde-/UE-/leverandør-/beboer-/kontrollørlenker | Samme visuelle familie, egne tilgangsgrenser | Tids-/omfangsbegrenset ekstern tilgang |
| Firma og profil | `FIRM-01`–`FIRM-11` | firma / firmaadmin | Firma → Profil / Brukere og tilgang | Firmaadmin / systemadmin etter gjeldende regler |
| Systemadmin | `ADMIN-01`–`ADMIN-09` | admin / SystemAdminWorkspace | Systemadmin i samme ramme med egne arbeidsområder | Systemadmin – gir ikke automatisk HR-innsyn |
| Organisasjon | `ORG-01`–`ORG-04` | KS/HMS → Organisasjonskart | Firma → Organisasjon; også kontekstuell inngang | Etter firma-/flerfirmatilgang |
| Hjelp og support | `HELP-01`–`HELP-06` | hjelp / support | Fast hjelp, egen supportdialog og lokale veiledninger | Egen bruker / administrator etter rolle |

## Skjermoversikt og navigasjonskontrakt

Skjermnavnene nedenfor er dagens interne skjerm-ID-er eller dokumenterte arbeidsflater, ikke nye URL-er. Behold de gamle ID-ene og callbacks bak den nye presentasjonen.

| Kontekst | Skjermer som må videreføres |
| --- | --- |
| Global app | `prosjekt` (Startside), `sales`, `pro_catalog`, `catalog_order`, `firma`, `innlogging`, `firmaadmin`, `prosjektliste`, `bolig`, `kshms`, `hr`, `hjelp`, `support`, `admin`; interne kataloginnganger følger samme eksisterende tilgang. |
| Aktivt ordinært prosjekt | `prosjekt`, `sales`, `prosjektinfo`, `tilbud`, `prosjektering`, `fremdrift`, `produkter`, `overflater`, `bilder`, `tilgang`, `installasjoner`, `sjekklister`, `avvik`, `chat`, `internt`, `overtagelse`, `garanti`, `rapport`, `hjelp`, `support`. |
| Enkel ordre | Eget avgrenset prosjektsett fra `projectWorkspacePresentation.mjs`. Ikke legg garanti, ordinær overtakelse eller våtromsprosjektering inn som nye obligatoriske steg. |
| Min side | `overview`, `time`, `handbook`, `hr`, `profile`, samt tilstedeværelse, boligoppgaver, planer, supportsvar og frister. |
| KS/HMS | `deviations`, `sja`, `rounds`, `risk`, `progress`, `reading`, `personal`, `organization`, `handbook`, `checklists`, `followup`, `extract`, `setup`. Personlig visning og forvaltning følger egne rettigheter. |
| HR | Medarbeiderregister, medarbeidervindu, malarbeidsflate og forvaltning; samtale: Forberedelse → Felles møte → Tiltak → Referat; sykefravær: Forberedelse → Felles plan → Tiltak → Gjennomgang → Frister → Deling og avslutning. |
| Timer | Egen uke, registreringsdialog, kontroll/godkjenning, timeoppsett og lønnseksport. |
| Bolig | Prosjektvalg; `overview`, `progress`, `integration`, `partners`, `contracts`, `setup`; oppsett av struktur, grafikk og katalog; boligvinduets kontakt, rom, leveransevalg, ordre, dialog, kontroller, dokumentasjon og løpende overtakelse. |
| Salg og varer | Forespørselskø, saksoversikt, befaring, våtromstilbud, generelt tilbud, Badskisse, kundevisning/aksept/kontrakt, katalog, plukkliste, leverandørbestilling, proffvarebestilling og varetelling. |
| Firma | Profil/logo, brukere, invitasjoner, roller, modulvalg, HR/KS-HMS-tilgang, netto-pris og boligtilgang. |
| Systemadmin | `overview`, `support`, `projects`, `users`, `products`, `store`, `news`, `broadcast`, `sync`. |
| Eksterne flater | Kunde, UE, leverandør, beboer, kontrollør og prosjektets supportvisning. Hver flate beholder egen autorisasjon, datagrense, signering og avtaleutgave. |

## Nyansattprøve i dagens innloggede demo

| ID | Oppgave og faktisk prøve | Resultat og avgrensning |
| --- | --- | --- |
| D01 | Åpnet innlogging og logget inn via sikker nettleserinnlogging. | Innlogget demokonto bekreftet. Innloggingsbildet er ikke endret. |
| D02 | Startside → Åpne Min arbeidsdag. | Fant Min side med tilstedeværelse, timer, rutiner, planer, HR og supportsvar. Flere innganger og navn overlapper. |
| D03 | Før timer og utlegg → Før timer i dag. Valgte navngitt demoprosjekt, fylte 7,5 timer og en fiktiv merknad. Avbrøt. | Skjema og riktig antallsformat prøvd. Ingen timepost lagret, ingen uke levert og ingen lønnseksport opprettet. Prosjektlisten viste flere valg som bare het «Prosjekt». |
| D04 | Personalhåndbok → søkte «Ta imot» → åpnet R-009. | Søket ga 1 av 10 treff. Åpnet tekst, utgave, godkjent-for-firma og egen gjennomgang. Ingen lesebekreftelse registrert. |
| D05 | Mine oppfølginger → Prøv medarbeidersamtale → Legg eksempeltekster i tomme felt → redigerte ett svar → lagret videre. | Fiktivt, lokalt prøveinnhold. Tilpasset svar fulgte med til samtalen. Deretter lagret videre til Tiltak og Referat, utgaver 1–3 synlige. Ingen medarbeider kontaktet. |
| D06 | Prosjektliste → åpnet DEMO HOVED. | Fant kartet med tre faser og alle prosjektinnganger. Oversikten viser samtidig status, KS/HMS, kundeskjema, garantivalg og deltakere; dette gir mye informasjon for en nyansatt. |
| D07 | Åpnet Sjekklister og sjekklistedialog. | Dialogen Tildekning/forarbeid var åpen etter inngangen. Svar/kommentarer og skille Lagre/Fullført lest. Ingen svar eller kontroll endret. Videre prøve må avklare valget av startkontroll og formuleringen «Ferdig» mot «alle punkter vurdert». |
| D08 | Åpnet Prosjektering i samme prosjekt. | Bekreftet fallfelter, sluk, terskel, membran, kommentar, egne punkter, tegninger og eksisterende kontroll med 13 punkter. Ingen prosjekteringsdata endret. Alle disse skal ha ny plass sammen med eventuelle fagforslag. |
| D09 | Boligprosjekter → PILOT – Løpende overtakelse · 12 leiligheter → H0201 fra fasaden → Sjekklister og dokumentasjon. | Riktig boligkontekst bevart. Dokumentasjon ferdig lastet med én sjekkliste, to FDV og egen navigasjon. Ingen boligdata endret. |
| D10 | Lukket boligens arbeidsområde → Boligliste → Fasade. | Tolv boliger på tvers av to bygg i listen. H0201 fortsatt valgt. Fasaden kom tilbake. Boligliste er en eksisterende funksjon som bevares, ikke en ny idé. |

Prøven er en strukturert ekspertgjennomgang «som om nyansatt», ikke en studie med faktiske nye ansatte. Ingen fysisk telefon, Safari, kamera, full offline/dvale-regresjon, alle roller, alle eksporter eller reelle e-postleveranser er attestert i denne runden. Tidligere QA er historikk, ikke et nytt måleresultat.

## Konkrete UX-funn og beslutninger

| Prioritet | Funn | Tiltak / videre kontroll |
| --- | --- | --- |
| P1 | Min arbeidsdag, Min side og global start har overlappende innganger. | Én konsekvent Min side-inngang på desktop og mobil, med dagens arbeid først. Første rollevisning må følge faktisk tilgang. |
| P1 | Timeprosjektvalg viser flere navnløse «Prosjekt». | Rotårsak må avklares separat: demodata, feltmapping eller reelt datagrunnlag. Vis forståelig prosjektnavn, nummer og ev. adresse. Ikke gjett navn eller endre prosjekt-ID. |
| P1 | Prosjektets oppsett og daglige arbeid vises samtidig med mye redigerbar informasjon. | Gjør daglig arbeidsflate kort. Behold prosjektkart og oppsett som egne tydelige innganger, med alle data tilgjengelige. |
| P1 | En vurdert sjekkliste er ikke nødvendigvis en fullført kontroll. | Standardiser begrepene «Punkter vurdert», «Kontroll fullført», «Avvik lukket» og «Overtatt» mot reelle lagrede tilstander. Ingen endring av fagkrav. |
| P1 | Designskissens fag utenfor valgt omfang kunne redigeres uten å inngå i samlet grunnlag. | Skissen er rettet til eksplisitt «Ta med [fag]» før redigering. Eksisterende utkast beholdes. |
| P2 | Store oppgavetall i demoen (458 boligoppgaver) er vanskelige å prioritere. | Vis relevant arbeid nå, deretter kommende og øvrige oppgaver. Behold total og full liste. Demotall alene er ikke dokumentasjon på tilsvarende produksjonsbelastning. |
| P2 | HR har allerede gode redigerbare forslag og en tydelig trinnflyt. | Gjenbruk mønster og eksisterende mekanikk i flere moduler. Ikke bygg en konkurrerende mal-/versjonsmotor i en UI-endring. |
| P2 | Logo og administrasjon var ikke vist i skissen. | Tilføyd faktisk app-logo for tre eksempelarbeidsfirmaer, egen firmaprofil og systemadmins ni hovedinnganger som illustrasjon. Ingen adminoperasjoner koblet til. |

## Skisse 03.1 etter skyprøven

Dette gjelder den separate private prototypen, ikke produksjonsappen.

- Min side er fast inngang i toppmeny og mobilmeny. Start bruker «Åpne Min side». «Folk» heter «HR og medarbeidere».
- Tilstedeværelse vises med egen inn/ut-handling og teksten «Timer føres separat». Begge retninger prøvd, uten appregistrering.
- Tre eksisterende logoer fra apprepoet er brukt uten forvrenging. Alle tre bildefiler lastet i nettleseren. Firmavalg og navn/logo følger hverandre; firmaprofil og ni systemadminområder er eksempler uten reelle adminoperasjoner.
- Fag utenfor omfang er skrivebeskyttet til «Ta med [fag]». Elektro inkludert, eksempeltekst redigert og lagret lokalt. Reload bevarte teksten; samlet eksempel tok med samme tekst og fire valgte fag.
- Min side åpnet fra desktopmeny. Systemadmin → Supportsaker åpnet korrekt eksempelpanel.
- Min side i 390 × 844 og Systemadmin i 320 × 844 visuelt kontrollert i mobilrammer. Ingen horisontal dokumentoverflyt: henholdsvis 375/375 og 305/305 px med rullefelt. Dette attesterer ikke fysisk mobil eller Safari.
- JavaScript-syntaks kontrollert. Ingen appkode, API, database, rettighet eller ekte utsending endret.

Skissen viser retning og arbeidsmønster. Den implementerer ikke alle 339 bevaringspunkter. Den innloggede demoens brede demokonto representerer ikke alle tilgangskombinasjoner. Systemadmin er kildekartlagt, ikke prøvd som full operativ flyt i denne runden.

## Samlet UX/UI-vurdering – utvidet gjennomgang 28.10.2026

**Kenneth trenger ikke godkjenne noe nå.** Dette er en UX-gjennomgang og en separat, privat designprototype. Neste reelle appgodkjenning skal gjelde en navngitt Preview-kandidat med konkrete, fungerende brukerreiser og dokumenterte regresjonsprøver. Designliking eller dette oppdraget er ikke appens TEST OK.

### Hovedvurdering

ProffDok har stor faglig bredde. Den viktigste forbedringen er å gjøre brukerens neste handling tydelig og å redusere det som vises samtidig. Flere gode mønstre finnes allerede: HRs fire samtalesteg, redigerbare malforslag, KS/HMS-grupperingen, boligens fasade/liste, grunnpakker og løpende overtakelse. De bør få en felles presentasjon og forutsigbar flyt.

Forslaget er å videreføre egen marine/turkise profil og eksisterende firmalogoer. Den nye rammen skal brukes i hele appen, firmaadmin og systemadmin. Innloggingen beholdes. Dette er en egen produktretning; ingen konkurrentstruktur skal kopieres som mal for appens datamodell eller navigasjon.

### Ny føring: valgfri timeføring

- Firmaadmin styrer om firmaet bruker timeføring i ProffDok. HR og medarbeidersamtaler skal fortsatt være tilgjengelige uten timeføring.
- Kilden og faktisk demo bekrefter at Timeoppsett allerede har «Aktiver timeregistrering i firmaet» og separat mobilvalg. Dette er en eksisterende funksjon; ikke grunnlag for å bygge en ny modulmotor.
- I demo var timeregistrering aktivert og mobilsnarveien av. Ingen av valgene er endret i demo.
- `PersonalPage.jsx` viser timekort og timefane med HR-tilgang som inngang. `HrTimeEntry` er en fast lederinngang. `MobileTimeShortcut.jsx` bruker allerede ferskt resultat med `enabled`, `registered` og `mobile_shortcut`. UI-redesignen må bruke samme faktiske firmavalg konsekvent på alle innganger, og beholde egen administrasjonsinngang for firmaadmin.
- Ny eller deaktivert funksjon skal gi en ryddig arbeidsflate: ingen timekort, registreringssnarveier eller manglende-uke-oppgaver for ansatte som ikke bruker funksjonen. Søk og «Alle områder» skal følge valget. Direkte gammel lenke skal ha en forståelig avgrenset tilstand.
- Ingen automatisk deaktivering hos eksisterende kunder. Ingen sletting av historikk ved avvalg. Gjeldende regler for tilgang, eksport og oppbevaring består; redesignen endrer dem ikke.
- Tilstedeværelse/inn-ut i boligprosjekt er en separat, eksisterende prosjektfunksjon. Den skal ikke bli skjult eller aktivert fordi timeføring slås av/på.

### Én rød tråd gjennom appen

| Felles mønster | Kontrakt i ny presentasjon |
| --- | --- |
| Hvor er jeg? | Aktivt arbeidsfirma, sak/prosjekt/bygg/bolig og meningsfull tittel. |
| Hva skal jeg gjøre? | En kort forklaring og én tydelig hovedhandling som passer rolle, fase og faktisk status. |
| Hvordan starter jeg? | Relevant forslag eller lagret innhold; brukeren velger og redigerer. Et forslag er ikke automatisk godkjent. |
| Hvor finnes resten? | Samme «Alle funksjoner»-inngang i hver modul, med forståelige grupper. Prosjektkart og fasade bevares. |
| Hva er lagret? | Skill lokalt sikret, lagret på server, firmagodkjent, personlig bekreftet, sendt og mottatt. |
| Hvordan går jeg tilbake? | Samme listefilter, valgt sak, fane og kladd. Ingen global recovery som vinner over bevisst navigasjon. |
| Hvordan bruker jeg mobil? | Kort hovedflate, store tydelige handlinger, én oppgave per dialog og bevart arbeidskontekst. |
| Hvordan får jeg hjelp? | Kort forklaring ved oppgaven og søkbar full veiledning. Lange fagtekster kan åpnes ved behov. |

### Prioriterte funn

| ID / prioritet | Bevis og betydning | Anbefalt behandling |
| --- | --- | --- |
| UX-01 · P1 | Min arbeidsdag, Min side og global start har overlappende navn/innganger. | Én konsekvent Min side; dagens prosjekt, egne oppgaver og oppfølginger. Retning prøvd i skisse. |
| UX-02 · P1 | Timeføring er valgfri, men hadde stor plass i skissen. Aktivering finnes allerede i faktisk Timeoppsett. | Firmaadminvalg med konsekvent visning av/på. Skisse rettet og prøvd per firma. Faktisk appintegrasjon gjenstår. |
| UX-03 · P1 | Prosjektoversikten viser prosjektkart, redigerbare grunndata, KS/HMS, garantivalg og kontaktlister samtidig. | Daglig faseflate med oppsett tilgjengelig separat. Behold alle eksisterende innganger og felt. |
| UX-04 · P1 | Flere timeprosjektvalg het bare «Prosjekt». | Avklar data/feltmapping separat. Ikke gjett navn eller endre prosjekt-ID. |
| UX-05 · P1 | Boligvelger i «KS/HMS og timer» viste H0101, H0102 osv. to ganger i prosjekt med to bygg. | Vis «Bygg / adresse · bolignummer» i alle velgere; behold samme stabile ID-er. |
| UX-06 · P1 | Sjekklistedialog sier «4/4 utfylt · Ferdig», mens listen ber om kontroll/fullføring. | Standardiser punkter vurdert, kontroll fullført og avvik lukket mot reelt lagrede tilstander. |
| UX-07 · P1 | «Salgsgrunnlag» inne i HOVED viste salgsinnhold først, men var tomt ved neste lesing. Gjentatt via Oversikt → Salgsgrunnlag ga samme forløp. Global Befaring/Tilbud fungerte. | Konkret gjenskapt visningsavvik i demo. Finn rotårsak i egen avgrenset core-rettelse; ikke løs ved å endre Sales recovery som del av prototypen. Ingen datatap påvist. |
| UX-08 · P1 | Prosjektlisten viste «Garanti aktiv», mens garantiflaten viste «Ikke klar til garanti» og sperret utstedelse. | Skill garanti valgt/aktivert fra garanti faktisk utstedt. Krav og utstedelse skal bevares. |
| UX-09 · P2 | Tilbake fra salgssak gikk til Forespørsler etter åpning fra Under arbeid. | Bevar statusfilter og plassering på vei tilbake. Verifiser med samme sak og samme konto før integrasjon. |
| UX-10 · P2 | Store demotall, blant annet 458 boligoppgaver, er vanskelige å prioritere. | Vis eget arbeid nå, deretter kommende og resten. Demotall sier ikke hvor stor produksjonsbelastningen er. |
| UX-11 · P2 | Produkt, overflate/innredning og fag/utstyr er ulike innganger med faglig overlapp i ordlyden. | Gi hver flate et klart formål og gjenbruk vare-/dokumentmønster; behold datafeltene og koblingene. |
| UX-12 · P2 | HRs maler og KS/HMS-oppsett har gode forberedte forslag, men mye veiledning og forvaltning kan stå åpent på samme side. | Behold eksisterende motor, versjoner og roller. Vis én oppgave av gangen og gjør langt oppsett tilgjengelig ved behov. |
| UX-13 · P2 | Badskisse åpnet tom lokal tegneflate, mens saken forklarte at tidligere tegning var lagret som bilde fra annen økt/enhet. | Gjør «Se lagret skisse» og «Lag/rediger tegning» tydeligere. Ingen attest på Kenneths lokale redigerbare tegning. |
| UX-14 · P2 / demo | Demoens faste kontrollmerke lå over deler av Badskisse-Lukk. Lukk-forsøk endte på demo-control. | Vurder badgeplassering i separat demo-overlay-scope. Ikke behandle dette som en produksjonsfeil eller endre produksjonens tegneverktøy av den grunn. Ingen reset utført. |
| UX-15 · P2 | Et tidlig Produkt-valg endte i sjekkliste/dialog. Etter lukking og stabil ny åpning kom korrekt Produkt-flate. | Avvikende navigasjonsobservasjon; rotårsak og påvirkning fra dialog, rendering og skyinput er uavklart. Ikke en bevist Produkt-feil. Ta med i senere scenario-prøve. |
| UX-16 · P2 | Dialoger, sidearbeidsflater og helside-editorer bruker ulike mønstre. | Felles fokus, lukk/tilbake, utvidelse og lagringsstatus. Bakgrunnshandlinger må ikke konkurrere med åpen dialog. |
| UX-17 · P3 | Økonomi finnes i avtaler og bolig, men er lite prioritert av målgruppen ifølge Kenneth. | Behold funksjonene tilgjengelige. Ikke gi dem dominerende dashboardplass. ERP/API vurderes separat senere. |

P1 er arbeid som bør løses eller avklares før en bred UI-pilot godkjennes. Ingen kritisk datakorrupsjon eller ny sikkerhetsfeil er bevist i denne gjennomgangen. Det er ikke en sikkerhetsattest.

### Vurdering av alle 35 funksjonsområder

| Område | Behold / ny presentasjon | Konkret UX-arbeid | Grunnlag |
| --- | --- | --- | --- |
| Innlogging | Behold dagens bilde og sikre innlogging. | Ny økt, feil innlogging og utløpt økt må ha konkrete neste steg. | D01; kilde |
| Felles ramme | Én hovednavigasjon, ett aktivt firma og tydelig arbeidskontekst. | Fjern konkurrerende menyer; tilbake skal bevare sak, filter og kladd. | D02, P01–P14, S01–S08 |
| Min side | Dagens arbeid, egne oppfølginger og oppslag først. | Vis bare aktiverte funksjoner. Store demooppgavetall må kunne prioriteres. | D02–D05; skisse av/på |
| Timer og utlegg | Valgfritt per firma; inngang under Firmaadmin. | Gjenbruk eksisterende timeoppsett. HR må fungere uten synlige timekrav. | T01, D03; kilde |
| HR og medarbeidere | Behold forberedelse, møte, tiltak og referat. | Skill medarbeiderens private svar, lederens arbeid og felles referat visuelt. Vis én oppgave av gangen. | D05, H01–H03 |
| KS/HMS | Behold Daglig arbeid, Mine rutiner og Forvaltning. | Ansatte starter i egne oppgaver; forvalter starter i relevant oversikt. Lange veiledninger åpnes ved behov. | K01–K10 |
| Prosjekt | Kort daglig arbeidsflate og beholdt prosjektkart. | Neste handling følger faktisk fase og ansvar. Redigerbare grunndata får egen inngang. | P01–P14; skisse fasevalg |
| Prosjektering | Redigerbare forslag sammen med dagens strukturerte felt. | Avklar omfang før redigering. Kilde, malversjon, prosjektvalg og kontrollgrunnlag må følge hverandre. | D08; skisse lagring/sammendrag |
| Fremdrift og bemanning | Samme plan med tydelig valg mellom arbeid og bemanning. | Planlagt, utført og overtatt er egne tilstander. Behold Gantt og arbeidsoperasjoner. | K06, P13, B01 |
| Produkter og FDV | Gjenkjennelig varevalg og samlet dokumentstatus. | Behold kategorier, kilder og alle dokumenttyper. Antall manglende dokumenter må forklare hva som mangler. | P05; kilde |
| Overflater og innredning | Behold faginndelingen; vis utfylt innhold først. | Gjør skillet mellom produktvalg og prosjektets synlige overflater forståelig. | P06 |
| Fag og utstyr | Fagposter og firmalister med samme redigeringsmønster. | Forklar når brukeren trenger denne flaten, Produkter eller Overflater. | P07 |
| Bilder | Ta bilde direkte ved oppgaven; samlet bildebibliotek. | Behold fase, kontrollkobling og kommentar. Vis opplasting, lokal sikring og serverlagring tydelig. | P08; kilde |
| Sjekklister | Én kontroll av gangen med tydelig lagring og fullføring. | Alle punkter vurdert er ikke det samme som kontroll fullført eller avvik lukket. | D07; P05-observation |
| Avvik og sikkerhet | Samme saksmønster med ansvar, frist, tiltak og egen kontroll. | Vis forskjellen mellom sjekklisteavvik, prosjektavvik, RUH, SJA og risikovurdering. Behold koblinger. | K02–K05; prosjekt-/garantivisning |
| Kommunikasjon | Meldinger i relevant prosjekt/bolig med tydelig mottaker. | Lest, krever oppfølging, sendt og mottatt holdes adskilt. Unngå personopplysninger i globale varsler. | B01–B07 kontekst; kilde. Ingen ny chat sendt eller lest for å nullstille ulest. |
| Avtalegrunnlag | Opprinnelig avtale, endringer og gjeldende sum samlet. | Behold låste aksepterte utgaver, mva.-grunnlag og visning til kunden. | P04 |
| Overlevering | En gjennomgang av dokumenter, åpne mangler og signaturer. | Ingen grønn overtakelse før krav og lagring er oppfylt. Velg dato og faktisk overtakelse skilles. | P10, D09 |
| Garanti | Behold alle krav og systemspesifikke kontrollpunkter. | Bruk ulike tekster for ønsket/valgt garanti, klar til utstedelse og faktisk utstedt. | P11 |
| Rapporter | Avgrenset dokumentvalg og forståelig forhåndsvisning. | Behold alle rapportdeler, vedlegg og historiske kilder. Vis hva PDF og ZIP inneholder hver for seg. | P12, K09. Ingen nye PDF-/ZIP-filer attestert. |
| Befaring og tilbud | Behold felles sak gjennom forespørsel, befaring, tilbud og avtale. | Vis neste steg tydelig; bevar listefilter og plassering ved tilbake. Redigering, kundevisning og publisering skilles. | S01–S08, P14 |
| Prissøk og plukkliste | Raskt søk med gjenkjennelige varer og antall. | Forklar forskjellen mellom lokal arbeidsliste, lagret plukkliste og sendt bestilling. | V01–V02 |
| Varebestilling | Behold siste godkjente antalls- og Enter-flyt. | Samme varelinjemønster som ellers; mottaker, levering og kontroll før sending tydelig. | V04; tidligere releasebevis er historikk |
| Varetelling | Egen arbeidsflate per lager med område/hylle på varen. | Behold telling, mobilregistrering og eksport. Oppretting av telling skal være en tydelig handling. | V03; kilde |
| Boligstruktur | Fasaden er standard; boligliste beholdes. | Vis valgt bygg og bolig tydelig i alle arbeidsflater. Bruk bygg/adresse når bolignumre gjentas. | D09–D10, B02, B07 |
| Boligpakker og tilvalg | Redigerbare grunnpakker og rommaler med gjenbruk. | Behold prosjektmal, individuell tilpasning og akseptert utgave som ulike nivåer. | B05–B06; kilde |
| Boligbestilling og levering | Ordre og mottak ved valgt bolig; samlet logistikk tilgjengelig. | Varevalg, sendt ordre, bekreftet levering og faktisk mottatt holdes adskilt. | D09 inngang; kilde. Ordre/mottak ikke utført. |
| Boligplan og samarbeid | Behold samlet Gantt, UE, leverandører og beboervarsler. | Filtrer relevant arbeid og vis hvem varselet gjelder før publisering. Bruk identisk statusmønster. | B01–B03 |
| Boligkontroll og overtakelse | Boligens dokumentasjon og løpende overtakelse beholdes. | Vis mangler for én bolig før bygg/prosjekt. Ingen skjult endring i krav for å gi grønn status. | D09–D10, B01; kilde |
| Boligkontrakt og fakturaregister | Tilgjengelig for riktige personer under avtaler. | Kontraktøkonomi får lav visuell prioritet. Behold registeret; ingen ny ERP-erstatning i redesignen. | B04; kilde. Registerets skriveflyt ikke prøvd. |
| Eksterne flater | Samme visuelle språk, egne oppgaver for kunde, UE, leverandør og beboer. | Behold selvstendige tilgangsgrenser, versjoner, aksept og signaturer. Ikke eksponer intern appmeny. | Kildekartlagt; intern kundevisning S08. Eksterne innlogginger ikke testet. |
| Firma og profil | Riktig firma/logo, tydelig Firmaadmin og valgfri timeføring. | Behold forskjellen mellom kontomoduler, firmatilgang, HR-innsyn og prosjektroller. Ikke én global av/på-motor som erstatter disse. | A01, A11, T01; skisse firmaskille |
| Systemadmin | Behold ni arbeidsområder med samme designramme. | Egne operasjoner og konsekvenser innenfor felles søk, liste, detalj og lagringsstatus. | A02–A10; kun lesing |
| Organisasjon | Behold felles Ringside AS-kart og firma-/avdelingsdetaljer. | Kartet forklarer organisasjon; personvern og HR-innsyn avgjøres fortsatt av egne tilganger. | K11 |
| Hjelp og support | Søk etter oppgave og kort hjelp ved riktig arbeidsflate. | Behold full veiledning; én tydelig støtteinngang og synlig status på egne saker. | U01–U03 |

### Faktisk dekning i den utvidede skyprøven

Det ble registrert 65 skjerm-/navigasjonsobservasjoner i denne fortsettelsen, i tillegg til D01–D10 fra første nyansattprøve. Observasjoner omfatter også gjenåpninger og avvik; de er ikke 65 uavhengige beståtte funksjonstester.

| ID | Åpnet/lest |
| --- | --- |
| `B01` | Bolig fremdrift og varsler |
| `B02` | Bolig KS/HMS og timer |
| `B03` | Bolig UE og leverandører |
| `B04` | Bolig kontrakter |
| `B05` | Bolig pakker |
| `B06` | Grunnpakke editor lest |
| `B07` | Bolig oppsett |
| `A01` | Firmaadmin |
| `H01` | HR hovedflate |
| `T01` | Timeoppsett lest |
| `H02` | Samtalemaler |
| `H03` | Sykefraværsveiledning |
| `K01` | KS/HMS hovedflate |
| `K02` | Avvik og RUH |
| `K03` | SJA |
| `K04` | Vernerunder |
| `K05` | Risikovurderinger |
| `K06` | Fremdriftsplaner |
| `K07` | Sjekklistesentral |
| `K08` | Oppfølging og revisjon |
| `K09` | Dokumentuttrekk |
| `K10` | Oppstart og tilgang |
| `K11` | Organisasjonskart |
| `P01` | Ordinært prosjekt |
| `P02` | Deltakere og tilganger |
| `P03` | Prosjektbeskrivelse |
| `P04` | Avtalegrunnlag |
| `P05-observation` | Uventet sjekklistedialog etter Produkt-valg |
| `P05` | Produkter bekreftet |
| `P06` | Overflater og innredning |
| `P07` | Fag/utstyr |
| `P08` | Bilder |
| `P09` | Interne notater |
| `P10` | Overtagelse |
| `P11` | Garanti |
| `P12` | Rapport |
| `P13` | Prosjekt fremdrift |
| `P14` | Salgsgrunnlag |
| `P14-recheck` | Salgsgrunnlag gjenåpnet |
| `S01` | Global Befaring/Tilbud |
| `S02` | Salg under arbeid |
| `S03` | Salgssak befaring |
| `S04` | Befaringsnotat lest |
| `S05` | Badskisse inngang |
| `S05-demo-overlay` | Kontrollside etter Lukk i Badskisse |
| `S06` | Generelt tilbud sak |
| `S07` | Generelt tilbud editor lest |
| `S08` | Kundevisning uten publisering |
| `V01` | Prissøk |
| `V02` | Prissøk servant |
| `V03` | Varetelling |
| `V04` | Varebestilling tom kladd |
| `A02` | Systemadmin oversikt |
| `A03` | Supportsaker |
| `A04` | Firmaer og prosjekter |
| `A05` | Brukere og roller |
| `A06` | Produktmaster |
| `A07` | Internt vareregister |
| `A08` | Nyheter i appen |
| `A09` | E-postutsending |
| `A10` | Dokumentsynk |
| `A11` | Firmaprofil |
| `U01` | Hjelp |
| `U02` | Hjelpesøk bestilling |
| `U03` | Support |

Ingen innholdsfelt i appen ble endret i denne fortsettelsen. Ingen nye tilbud, tellinger, timer, bestillinger, signaturer eller tilgangsendringer ble lagret med handlingsknappene. Ingen testmail, supportmelding, publisering, reset eller dokumentsynk ble utført. Åpning av editorer er ikke en egen attest på fravær av alle automatiske bakgrunnsskrivinger. Lokal prøvesamtale fra første runde består som fiktivt prøveinnhold.

### Skisse 03.2 – konkret resultat

- Timeføring er av som standard i denne designprøven. Firmaadmin → Aktiver timeføring for firmaet → Lagre firmavalg i skissen slår på eksempelet for valgt firma. Dette er nettleserlagring, ikke appens innstillinger eller autorisasjon.
- Min side, registreringsknapper, søk, Alle områder og modulverktøy følger firmavalget. Mobilmenyen viser Plan når timefunksjon/snarvei er av. Egen mobilinnstilling kan vise Timer når begge er på.
- Aktivert for ett eksempelﬁrma, lagret og reload-prøvd. Bytte til et annet firma viste ingen timekort. Søk «timer» ga ingen treff når av. Direkte `#time` ga forklaring og vei tilbake, uten registreringsskjema.
- Deaktivering prøvd i mobilrammen. Min side beholdt prosjekt, bilder, sjekklister og HR, og mobilmenyen viste Plan.
- Prosjektet har Planlegg, Utfør og Overlever med ulike hovedhandlinger. Standard i eksempelprosjektet er Utfør. Fasevalg og piltastnavigasjon er prøvd. Prosjektkart beholdes som full inngang.
- Mobilrammer 390×844 og 320×844: Min side og Firmaadmin lest visuelt; ingen horisontal dokumentoverflyt, 375/375 og 305/305 px med rullefelt. Dette er smal Chrome-ramme, ikke fysisk telefon.
- Syntaks kontrollert i alle tre endrede JavaScript-filer. Dette er en prototypekontroll, ikke grønn app-CI eller produksjonsregresjon.

### Hva som fortsatt må prøves før appgodkjenning

En faktisk Preview-pilot skal bruke dagens komponenter og autorisasjon. Start med Min side både med og uten timeføring, et ordinært prosjekt fra fasevalg til prosjektering/kontroll/dokumentasjon, og én bolig fra fasade/liste til dokumentasjon. Deretter dekkes alle bevaringspunktene med eksisterende ID, callback, dataflyt og relevant prøve.

Følgende er fortsatt utestet i denne gjennomgangen: alle rollekombinasjoner og nektet tilgang; direkte eksterne kunde-/UE-/leverandør-/beboer-/kontrollørinnlogginger; private HR-sakers fulle skriveflyt; faktisk signering/aksept; alle PDF/ZIP/ASCII/Excel-eksporter; mottatt e-post; kamera/opplasting; fakturaregisterets skriveflyt; fysisk mobil/Safari; full offline-, fokus-, dvale- og konfliktregresjon. Kenneths lokale Badskisse er ikke attestert. Ingen full videobibliotekgjennomgang inngår som bevis i denne utvidede ProffDok-prøven.

Ingen lansering av en ny helhet før funksjoner og tilganger er bevart. En designprototype erstatter ikke den faktiske appen.

## Implementeringsrekkefølge

1. **Felles ramme:** navigasjon, arbeidsfirma/logo, Min side, knapper, status, dialoger, hjelp, lagringsstatus og mobil. Presentasjonsadapter over dagens skjerm-ID-er og callbacks. Behold innlogging.
2. **Vertikal Preview-pilot:** et faktisk ordinært prosjekt fra oversikt via prosjektering/kontroll til dokumentasjon, samt Min side/HR og én bolig fra fasade til kontroll. Ekte eksisterende komponenter; ikke HTML-prototype som app-erstatning.
3. **Prosjekt og salg:** alle prosjektmål, enkel ordre, tilbud/befaring, Badskisse og kunderegister. Bevar prisberegning, publisering, aksept og server-first.
4. **Folk og sikkerhet:** full HR, sykefravær, timeadministrasjon/lønnseksport og KS/HMS. Oppsett holdes tilgjengelig for riktige roller.
5. **Bolig og eksterne:** alle pakker, avtaler, ordre, plan, kontroller, løpende overtakelse, fakturaregister og portaler. Fasaden består.
6. **Varer og administrasjon:** varebestilling, plukkliste, leverandørbestilling, telling, firmaadmin, systemadmin, organisasjon, hjelp og support. Ingen nye utsendinger som sideeffekt.
7. **Samlet regresjon og brukertest:** funksjonskartets ID-er spores til ny skjerm, bevart callback og faktisk prøve. Ingen lansering av en helhet som mangler obligatoriske brukerreiser. TEST OK før appmerge; Production-verifisering og kontrollert main → demo etterpå.

Fagmaler er et eget arbeidsspor: relevant tiltakstype, gjeldende kilde/utgave, firmaforslag, prosjektets avklaringer, kontrollgrunnlag og ansvar for vedlikehold. Ingen automatisk TEK-oppfyllelse. Brukerens tilpasninger og historiske avtale-/rapportdata skal ikke overskrives av et nytt standardforslag.

## Permanente verifikasjonskrav

- Riktig firma og ferske roller før lesing og lagring; firmabytte stopper gammelt innhold. HR-innsyn følger egne roller, ikke systemadmin alene.
- Samme sak, skjerm, fane og kladd ved fanebytte/dvale; bevisst brukerhandling vinner over recovery.
- Server-first før autosave på ny enhet. Ikke la tom initialstate overskrive serverdata.
- Lagret lokalt, lagret på server og bekreftet sendt vises som forskjellige tilstander.
- Riktige summer, mva., publiserte tilbudsversjoner, signaturer, garantikrav og eksporter bevares.
- Ingen dobbel sending, rutine-e-post forblir deaktivert, og testmail krever egen uttrykkelig bestilling.
- Desktop, smal nettleser, fysisk mobil/Safari og relevante tilgjengelighetsprøver må være tydelig skilt i bevisene.
- Gamle imperative DOM-adaptere i bootstrap/desktopSideMenu må håndteres kontrollert. Ikke la både gammel og ny navigasjon konkurrere. Bevar komponentidentitet og unngå brede remounts.
- Full kritisk CI og relevant Preview-prøve før appens TEST OK. Denne runden har ikke kjørt en ny full app-QA, siden appkode ikke er endret.

## Detaljert bevaringsregister

### Innlogging

Dagens inngang: Auth-flaten. Ny plass: Behold eksisterende innloggingsbilde.

Kilde: `src/main.jsx`, `src/modules/auth/authLandingUx.js`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `AUTH-01` | Logg inn | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `AUTH-02` | Opprett bruker | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `AUTH-03` | Bekreft registrering og firmainvitasjon | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `AUTH-04` | Glemt passord og passordgjenoppretting | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `AUTH-05` | Fullfør profilopplysninger | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `AUTH-06` | Firmaregistrering og godkjenning | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `AUTH-07` | E-post huskes uten app-lagret passord | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `AUTH-08` | Mobil hjemskjermveiledning | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `AUTH-09` | Offentlige delingslenker uten ordinær innlogging | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### Felles ramme

Dagens inngang: Globalmeny / arbeidsprofil. Ny plass: Fast navigasjon og tydelig arbeidskontekst.

Kilde: `src/modules/project/projectNavigationTabs.mjs`, `src/modules/app/desktopSideMenu.js`, `src/bootstrap.jsx`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `NAV-01` | Startside og bevisst retur | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `NAV-02` | Arbeidsfirma og representasjon | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `NAV-03` | Aktivt prosjekt og bytt prosjekt | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `NAV-04` | Fullskjermvisning | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `NAV-05` | Mobilmeny og øvrige menymål | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `NAV-06` | Oppdateringsvarsel | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `NAV-07` | Appnyheter | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `NAV-08` | Kontekstuell Hjelp og Support | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### Min side

Dagens inngang: innlogging / PersonalPage. Ny plass: Min side som hovedinngang.

Kilde: `src/modules/personal/PersonalPage.jsx`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `MINE-01` | Oversikt over egen arbeidsdag | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `MINE-02` | Registrer inn og ut av tildelt boligprosjekt | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `MINE-03` | Mine aktive prosjektplaner | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `MINE-04` | Andre tildelte fremdriftsplaner | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `MINE-05` | Mine boligoppgaver | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `MINE-06` | Mine timer og utlegg | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `MINE-07` | Personalhåndbok | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `MINE-08` | Mine oppfølginger | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `MINE-09` | Profil og e-postvalg | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `MINE-10` | Egne supportsvar | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `MINE-11` | Frister og åpne tiltak | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `MINE-12` | Kontaktopplysninger og påminnelse om kontaktkontroll | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### Timer og utlegg

Dagens inngang: Min side → Mine timer / HR → Timer. Ny plass: Egen registrering og separat administrasjon.

Kilde: `src/modules/time/TimeEntryPoint.jsx`, `src/modules/time/TimeSheet.jsx`, `src/modules/time/TimeManagement.jsx`, `src/modules/time/TimeSetup.jsx`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `TIME-01` | Dagens registrering | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `TIME-02` | Ukevalg og vis hele uken | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `TIME-03` | Antall timer | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `TIME-04` | Fra–til med pause | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `TIME-05` | Start og stopp tidtaking | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `TIME-06` | Prosjektvalg og manuelt ERP-prosjekt | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `TIME-07` | Kategorier og fravær | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `TIME-08` | Reise og kilometer | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `TIME-09` | Utlegg og kvitteringsvedlegg | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `TIME-10` | Kopier en dag | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `TIME-11` | Send uke til godkjenning | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `TIME-12` | Returner og rett uke | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `TIME-13` | Godkjenn uke | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `TIME-14` | Kategorier og lønnskoder | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `TIME-15` | Ansattnumre og prosjektkobling | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `TIME-16` | Timeansvarlige og innleveringsfrist | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `TIME-17` | Konfigurerbar CSV-lønnseksport | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `TIME-18` | Eksportarkiv og samme fil på nytt | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### HR og medarbeidere

Dagens inngang: hr / medarbeidervindu. Ny plass: HR med egen medarbeiderarbeidsflate.

Kilde: `src/modules/hr/HrModule.jsx`, `src/modules/hr/HrConversations.jsx`, `src/modules/hr/HrSickLeaveCases.jsx`, `src/modules/hr/HrConversationTemplates.jsx`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `HR-01` | Medarbeiderregister og søk | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `HR-02` | Legg til medarbeider fra appbruker | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `HR-03` | Nærmeste leder | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `HR-04` | Ekstra begrunnet lesetilgang og tilbakekall | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `HR-05` | Privat kontaktinformasjon | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `HR-06` | Start og inviter til medarbeidersamtale | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `HR-07` | Medarbeiderens private forberedelse | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `HR-08` | Felles møte og notater | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `HR-09` | Tiltak med ansvar og frist | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `HR-10` | Referat og separate bekreftelser | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `HR-11` | Lagrede samtaler og historikk | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `HR-12` | Samtalemaler med redigerbare forslag | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `HR-13` | Malutgaver og arkivering | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `HR-14` | Sykefraværsforberedelse | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `HR-15` | Felles oppfølgingsplan | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `HR-16` | Sykefraværstiltak og gjennomgang | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `HR-17` | Frister og deling/avslutning i sykefraværsoppfølging | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `HR-18` | HR-oppsett og kontrollfrist | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `HR-19` | Avslutt HR-arbeidsforhold og slettekvitteringer | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `HR-20` | Lokale prøvesamtaler i sandbox | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### KS/HMS

Dagens inngang: kshms / KshmsNavigation. Ny plass: Samme tre arbeidsgrupper og én oppgave om gangen.

Kilde: `src/modules/kshms/KshmsNavigation.jsx`, `src/modules/kshms/kshmsNavigation.mjs`, `src/modules/kshms/KshmsModule.jsx`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `KS-01` | Avvik og RUH | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `KS-02` | SJA | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `KS-03` | Vernerunder og kontroller | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `KS-04` | Risikovurdering | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `KS-05` | Fremdriftsplaner | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `KS-06` | Les og bekreft rutiner | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `KS-07` | Min personalhåndbok og søk | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `KS-08` | Organisasjonskart | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `KS-09` | Firmahåndbok | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `KS-10` | Sjekklistesentral | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `KS-11` | Oppfølging og revisjon | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `KS-12` | Dokumentuttrekk | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `KS-13` | Oppstart og tilgang | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `KS-14` | Firmaets publisering av rutiner | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `KS-15` | Samlet egen lesebekreftelse | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `KS-16` | Tidligere rutineutgaver og egne bekreftelser | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `KS-17` | Kildeoppdateringer og vurdering | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `KS-18` | PDF for rutine, håndbok og dokumentasjon | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### Prosjekt

Dagens inngang: prosjekt / prosjektliste. Ny plass: Prosjektets arbeidsrom og bevart prosjektkart.

Kilde: `src/main.jsx`, `src/modules/project/projectNavigationTabs.mjs`, `src/modules/project/projectWorkspacePresentation.mjs`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `PRJ-01` | Prosjektliste, søk og eksakte statusfiltre | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PRJ-02` | Nytt prosjekt | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PRJ-03` | Kunde og prosjektopplysninger | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PRJ-04` | Firmaets kunderegister som valgfritt gjenbruk | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PRJ-05` | Prosjektbeskrivelse | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PRJ-06` | Avtalegrunnlag og salgsgrunnlag | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PRJ-07` | Prosjektkartets tre faser | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PRJ-08` | Status og mangler | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PRJ-09` | Prosjektinvolverte | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PRJ-10` | Kontakt- og distribusjonsliste | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PRJ-11` | Separat portaltilgang | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PRJ-12` | Autolagring og eksplisitte lagrehandlinger | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PRJ-13` | Lagre og fortsett | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PRJ-14` | Kopiering og øvrige prosjekthandlinger | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PRJ-15` | Arkiv og låst prosjekt | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PRJ-16` | Enkel ordre med eget avgrenset skjermsett | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### Prosjektering

Dagens inngang: prosjektering. Ny plass: Prosjektering → Løsning / grunnlag / kontroller.

Kilde: `src/main.jsx:6689`, `src/modules/config/projectDesignChecklist.mjs`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `DES-01` | Fall i dusjsone | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `DES-02` | Fall utenfor dusjsone | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `DES-03` | Slukplassering | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `DES-04` | Terskelhøyde | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `DES-05` | Membranløsning | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `DES-06` | Kommentar og avvik | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `DES-07` | Egne temainndelte prosjekteringspunkter | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `DES-08` | Tegninger og bilder av prosjekteringsgrunnlag | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `DES-09` | Eksisterende prosjekteringssjekkliste | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `DES-10` | Redigerbar beskrivelse per prosjekt | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### Fremdrift og bemanning

Dagens inngang: fremdrift / KS/HMS / Bolig. Ny plass: Felles planpresentasjon med bevart kontekst.

Kilde: `src/main.jsx:6760`, `src/modules/kshms/KshmsModule.jsx`, `src/modules/bolig/BoligEntry.jsx`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `PLAN-01` | Prosjektets fremdriftsplan | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PLAN-02` | Selvstendige KS/HMS-planer | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PLAN-03` | Aktiviteter, datoer og rekkefølge | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PLAN-04` | Bemanning og ansvar | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PLAN-05` | Uke-, måned- og Gantt-visninger | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PLAN-06` | Mine tildelte planer | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PLAN-07` | Planlagring og retur med kladd | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PLAN-08` | Planeksport og kalenderinngang | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### Produkter og FDV

Dagens inngang: produkter. Ny plass: Prosjekt → Produkter og dokumentasjon.

Kilde: `src/modules/product/productViewTools.js`, `src/main.jsx`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `PROD-01` | Standard produktkategorier | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PROD-02` | Produktmasteroppslag | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PROD-03` | Egne produkter | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PROD-04` | Farger og varianter | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PROD-05` | FDV-link | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PROD-06` | Datablad, DOP, EPD og sikkerhetsdatablad | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PROD-07` | Produktdokumenter i rapporten | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PROD-08` | Sopro-systemvalg og garantikontrollpunkter | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### Overflater og innredning

Dagens inngang: overflater. Ny plass: Prosjekt → Overflater og innredning.

Kilde: `src/modules/surfaces/surfaceViewTools.js`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `SURF-01` | Overflatedata | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `SURF-02` | Baderomsinnredning | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `SURF-03` | Plassering og produktvalg | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `SURF-04` | Kommentarer og dokumentasjon | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `SURF-05` | Rapportgrunnlag | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### Fag og utstyr

Dagens inngang: installasjoner. Ny plass: Prosjekt → Fag og utstyr.

Kilde: `src/modules/installations/installationViewTools.js`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `INSTALL-01` | Fag-/utstyrskategorier | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `INSTALL-02` | Egne registreringer | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `INSTALL-03` | Produkt og type | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `INSTALL-04` | Plassering | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `INSTALL-05` | Bilder, kommentarer og dokumentlenker | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### Bilder

Dagens inngang: bilder. Ny plass: Prosjekt → Bilder med samme kilder.

Kilde: `src/modules/images/imageDocumentationTools.js`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `PHOTO-01` | Kamera og bildebibliotek | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PHOTO-02` | Dra og slipp | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PHOTO-03` | Kategorisering | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PHOTO-04` | Kommentarer | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PHOTO-05` | Bilder fra kontroller, fag og chat | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PHOTO-06` | Stor bildevisning | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PHOTO-07` | Rapportens bildeutvalg | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### Sjekklister

Dagens inngang: sjekklister / prosjektering. Ny plass: Prosjekt → Kontroller → eksisterende editor.

Kilde: `src/main.jsx:6832`, `src/modules/config/projectDesignChecklist.mjs`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `CHECK-01` | Velg og legg til sjekkliste | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `CHECK-02` | Fortsett påbegynt kontroll | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `CHECK-03` | Ok, Avvik og Ikke aktuelt | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `CHECK-04` | Kommentarer | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `CHECK-05` | Påkrevd bilde eller dokumentasjon | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `CHECK-06` | Egne sjekkpunkter og vedlegg | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `CHECK-07` | Andre fags standardpunkter | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `CHECK-08` | Lagre uferdig kontroll | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `CHECK-09` | Fullfør kontroll som separat handling | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `CHECK-10` | Tidligere dokumentasjon og kontrollhistorikk | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `CHECK-11` | Kontroll-PDF | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `CHECK-12` | Gjenåpne og følge opp avvik uten falsk ferdigmelding | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### Avvik og sikkerhet

Dagens inngang: avvik / KS/HMS. Ny plass: Arbeid → Avvik og sikkerhet.

Kilde: `src/main.jsx:6880`, `src/modules/kshms/KshmsModule.jsx`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `DEV-01` | Registrer prosjektavvik | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `DEV-02` | RUH med sted og hendelse | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `DEV-03` | Ansvar og frist | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `DEV-04` | Bilder og dokumentasjon | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `DEV-05` | Lukk avvik med dokumentasjon | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `DEV-06` | Gjenåpne avvik | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `DEV-07` | SJA og risikovurdering knyttet til prosjekt | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `DEV-08` | Prosjektets samlede KS/HMS-dokumentoversikt | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### Kommunikasjon

Dagens inngang: chat / internt. Ny plass: Prosjekt → Dialog / Interne notater.

Kilde: `src/modules/chat/chatViewTools.js`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `CHAT-01` | Kundechat | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `CHAT-02` | Uleste meldinger og lest-status | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `CHAT-03` | Bilder i chat | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `CHAT-04` | Interne notater uten kundeinnsyn | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `CHAT-05` | Prosjektets kontakt-/e-postinngang | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### Avtalegrunnlag

Dagens inngang: tilbud / sales. Ny plass: Prosjekt → Avtalegrunnlag og salgsgrunnlag.

Kilde: `src/modules/contract/contractViewTools.js`, `src/modules/sales/README.md`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `CON-01` | Signert kontrakt og vedlegg | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `CON-02` | Tilbudsgrunnlag fra salg | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `CON-03` | Dokumenterte endringer | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `CON-04` | Forhåndsvisning | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `CON-05` | Riktig historisk avtaleutgave | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `CON-06` | Avtalegrunnlag som del av garantiens eksisterende krav | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### Overlevering

Dagens inngang: overtagelse. Ny plass: Prosjekt → Overlevering.

Kilde: `src/modules/overtagelse/overtagelseTools.js`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `HAND-01` | Gjennomgang med kunde | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `HAND-02` | Restpunkter og merknader | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `HAND-03` | Kontroll av eksisterende overleveringskrav | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `HAND-04` | Signering | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `HAND-05` | Låsing og senere dokumentasjon | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### Garanti

Dagens inngang: garanti. Ny plass: Prosjekt → Garanti.

Kilde: `src/modules/warranty/warrantyViewTools.js`, `src/main.jsx`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `WAR-01` | Valgfri garanti tidlig i prosjektet | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `WAR-02` | 10, 12 og 15 års valg | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `WAR-03` | Sopro-system og riktige kontrollkrav | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `WAR-04` | Oversikt over manglende grunnlag | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `WAR-05` | Utstedelse og garantinummer | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `WAR-06` | Garantibevis og historikk | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `WAR-07` | Eksisterende garantiavgrensning bevares | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### Rapporter

Dagens inngang: rapport. Ny plass: Prosjekt → Dokumentasjon og rapport.

Kilde: `src/modules/report/reportViewTools.js`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `REP-01` | Firma- og brukerprofil | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `REP-02` | Forside og bildevalg | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `REP-03` | Produktdokumentasjon | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `REP-04` | Sjekklister, bilder og vedlegg | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `REP-05` | Valg av innhold | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `REP-06` | PDF-rapport med lenker | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `REP-07` | KS/HMS-dokumentvalg | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `REP-08` | Sluttdokumentasjon for enkel ordre | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### Befaring og tilbud

Dagens inngang: sales. Ny plass: Salg → Sak → Befaring / Tilbud / Avtale.

Kilde: `src/modules/sales/README.md`, `src/modules/sales/SalesModule.jsx`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `SALE-01` | Ny forespørsel | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `SALE-02` | Forespørselskø | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `SALE-03` | Saksoversikt og søk | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `SALE-04` | Befaringsnotat og bilder | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `SALE-05` | Våtromstilbud | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `SALE-06` | Generelt tilbud | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `SALE-07` | Badskisse | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `SALE-08` | Kunderegister som valgfritt gjenbruk | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `SALE-09` | Poster, avsnitt og tekstmaler | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `SALE-10` | Vare- og monteringspriser | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `SALE-11` | Opsjoner og kundens antallsvalg | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `SALE-12` | Mva.-visning og kundeprofil | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `SALE-13` | Kundevisning og PDF | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `SALE-14` | Uforanderlig publisert versjon | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `SALE-15` | Aksept og avvisning | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `SALE-16` | Kontrakt | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `SALE-17` | Opprett prosjekt fra avtalt grunnlag | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `SALE-18` | Tilbudsoppfølging | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `SALE-19` | Cordel fra akseptert tilbud | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `SALE-20` | Server-first og lokal kladd ved retur | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### Prissøk og plukkliste

Dagens inngang: Prissøk / pro_catalog. Ny plass: Salg og varer → Prissøk.

Kilde: `src/modules/storeCatalog/StorePriceSearchView.jsx`, `src/modules/sales/README.md`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `CAT-01` | Varesøk og relevante søkeinnganger | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `CAT-02` | Leverandørvalg | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `CAT-03` | Strekkode og kamera | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `CAT-04` | Brutto-/nettopris etter tilgang | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `CAT-05` | Plukkliste | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `CAT-06` | Lagre og gjenåpne plukkliste | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `CAT-07` | Pris- og plukklisteutskrift | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `CAT-08` | Cordel-eksport | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `CAT-09` | Leverandørbestilling fra plukkliste | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `CAT-10` | Lagrede leverandørkontakter | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `CAT-11` | Varetelling som egen inngang | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### Varebestilling

Dagens inngang: catalog_order / egen menypost. Ny plass: Salg og varer → Varebestilling.

Kilde: `src/modules/storeCatalog/ProCatalogOrders.jsx`, `src/modules/project/projectNavigationTabs.mjs`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `ORDER-01` | Søk og velg varer | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `ORDER-02` | Pluss/minus og piltaster for antall | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `ORDER-03` | Enter til neste varesøk | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `ORDER-04` | Fokus i antall ved valgt vare | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `ORDER-05` | Stopp ugyldig antall og bevar kladd | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `ORDER-06` | Mottakervalg og husket mottaker | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `ORDER-07` | Leveringstidspunkt | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `ORDER-08` | Kontroll før sending | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `ORDER-09` | Prisfri Cordel ASCII og Excel med identiske varer | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `ORDER-10` | Sendekvittering og retry uten dobbeltordre | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### Varetelling

Dagens inngang: Prissøk → telling. Ny plass: Salg og varer → Varetelling.

Kilde: `src/modules/stocktake/StocktakeWorkspace.jsx`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `STOCK-01` | Opprett telling per lager | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `STOCK-02` | Varesøk og skanning | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `STOCK-03` | Manuell vare | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `STOCK-04` | Område og leverandør | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `STOCK-05` | Null og desimaltall | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `STOCK-06` | Flere registreringer og endring av antall | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `STOCK-07` | Avslutt telling | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `STOCK-08` | Cordel-tekstfil | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `STOCK-09` | Kontrollfil CSV og lagringshistorikk | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### Boligstruktur

Dagens inngang: bolig → Hovedside / Oppsett. Ny plass: Bolig → prosjekt → bevart fasade og valgfri liste.

Kilde: `src/modules/bolig/BoligEntry.jsx`, `src/modules/bolig/BoligProjectHome.jsx`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `BSET-01` | Boligprosjektliste, søk og arkiv | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BSET-02` | Bygg og oppganger | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BSET-03` | Etasjer og boliger | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BSET-04` | Flere bolig-/bygningstyper | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BSET-05` | Fasade uten forvrenging | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BSET-06` | Egne bilder og visuelle markeringer | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BSET-07` | Boligkontakt | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BSET-08` | Rom og leveranseområder | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BSET-09` | Klargjøring og manuelle rettelser | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### Boligpakker og tilvalg

Dagens inngang: bolig → Grunnpakker og tilvalgspakker. Ny plass: Bolig → Leveranse / valgt bolig.

Kilde: `src/modules/bolig/BoligEntry.jsx`, `src/modules/bolig/BoligPortalManager.jsx`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `BPKG-01` | Grunnpakker | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BPKG-02` | Vareinnhold og antall | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BPKG-03` | Individuelle boligavvik | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BPKG-04` | Tilvalgspakker | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BPKG-05` | Frister | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BPKG-06` | Kombinasjonsregler og avhengige varer | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BPKG-07` | Beboerens valg | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BPKG-08` | Akseptert leveranseutgave | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BPKG-09` | Endring etter aksept som eget tillegg | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BPKG-10` | Historikk uten overskriving av avtalt grunnlag | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### Boligbestilling og levering

Dagens inngang: bolig → Commerce / valgt bolig. Ny plass: Bolig → Bestillinger / Levering.

Kilde: `src/modules/bolig/BoligEntry.jsx`, `src/modules/bolig/BoligOrderDraft.jsx`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `BCOM-01` | Bestillingsgrunnlag per bolig | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BCOM-02` | Lagre bestillingsutkast | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BCOM-03` | Antall og varekontroll | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BCOM-04` | Cordel ASCII og Excel | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BCOM-05` | Leveringsadresse og leveringsønske | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BCOM-06` | Leverandør og bestillingsmail | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BCOM-07` | Uforanderlig sendekvittering | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BCOM-08` | Leveringsoppfølging | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### Boligplan og samarbeid

Dagens inngang: bolig → Fremdrift og varsler / UE og leverandører. Ny plass: Bolig → Plan / Samarbeid.

Kilde: `src/modules/bolig/BoligEntry.jsx`, `src/modules/bolig/BoligPartnerPage.jsx`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `BPLAN-01` | Aktiviteter og rekkefølge | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BPLAN-02` | Forskjøvet oppstart og avhengigheter | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BPLAN-03` | Plan per bolig og på tvers | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BPLAN-04` | Gantt | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BPLAN-05` | Arbeidslag og bemanning | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BPLAN-06` | Inn-/utregistrering | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BPLAN-07` | Manuell inn-/utregistrering for ansvarlig | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BPLAN-08` | Beboervarsler | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BPLAN-09` | Befaringstider | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BPLAN-10` | UE-/leverandørtilgang til valgte funksjoner på prosjektomfang | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### Boligkontroll og overtakelse

Dagens inngang: bolig → Quality / Completion. Ny plass: Bolig → Kontroller / Overtakelse.

Kilde: `src/modules/bolig/BoligQuality.jsx`, `src/modules/bolig/BoligCompletion.jsx`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `BQA-01` | Fordel sjekklister fra mal | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BQA-02` | Påkrevde kontroller | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BQA-03` | UE-utfylling | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BQA-04` | Bilder og egne PDF-vedlegg | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BQA-05` | Kritiske avvik | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BQA-06` | Restpunkter | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BQA-07` | Løpende overtakelse per bolig | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BQA-08` | Status klar/med restpunkter/overtatt | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BQA-09` | Ekstern protokoll og dokumentert retting | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BQA-10` | Sluttpakke PDF og ZIP | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### Boligkontrakt og fakturaregister

Dagens inngang: bolig → Kontrakter. Ny plass: Bolig → Kontrakt og fakturagrunnlag – lav prioritet for ny utbygging.

Kilde: `src/modules/bolig/BoligEntry.jsx`, `docs/qa/BOLIG_KONTRAKTSOKONOMI_OG_CI_20261025.md`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `BFIN-01` | Kontraktsopplasting og gjennomgang | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BFIN-02` | Reguleringsvalg | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BFIN-03` | Indeksberegning | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BFIN-04` | A konto-plan | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BFIN-05` | Redigerbart fakturaregister | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BFIN-06` | Skille mellom fakturert a konto og indeks | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `BFIN-07` | Hittil-summer og perioder | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### Eksterne flater

Dagens inngang: Kunde-/UE-/leverandør-/beboer-/kontrollørlenker. Ny plass: Samme visuelle familie, egne tilgangsgrenser.

Kilde: `src/modules/portal/portalTools.js`, `src/modules/controller/ControllerPortal.jsx`, `src/modules/bolig/BoligResidentPage.jsx`, `src/modules/bolig/BoligPartnerPage.jsx`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `PORT-01` | Prosjektets kundeportal | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PORT-02` | UE-portal og bidrag | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PORT-03` | Kontrollørportal | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PORT-04` | Beboerportal | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PORT-05` | Tilvalg og endringsaksept | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PORT-06` | UE-/leverandørens Gantt og kontroller | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PORT-07` | Dokumentdeling og priser etter tilgang | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PORT-08` | Personlige lenker og invitasjoner | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PORT-09` | Dialog og uleste meldinger | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `PORT-10` | Sluttpakker og protokoller | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### Firma og profil

Dagens inngang: firma / firmaadmin. Ny plass: Firma → Profil / Brukere og tilgang.

Kilde: `src/modules/company/companyViewTools.js`, `src/modules/company/CompanyAdminPanel.jsx`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `FIRM-01` | Logo og firmaprofil | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `FIRM-02` | Kontakt- og rapportopplysninger | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `FIRM-03` | Forhåndsvisning av profil | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `FIRM-04` | Inviter ansatt | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `FIRM-05` | Rolle og modulvalg | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `FIRM-06` | KS/HMS og HR ved invitasjon | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `FIRM-07` | Automatisk HR-kobling etter registrering | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `FIRM-08` | Send invitasjon på nytt | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `FIRM-09` | Proffnettopristilgang | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `FIRM-10` | Aktiv arbeidsprofil og flerfirmatilgang | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `FIRM-11` | Firmanavn og historisk prosjektidentitet | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### Systemadmin

Dagens inngang: admin / SystemAdminWorkspace. Ny plass: Systemadmin i samme ramme med egne arbeidsområder.

Kilde: `src/modules/app/SystemAdminWorkspace.jsx`, `src/main.jsx:6997`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `ADMIN-01` | Oversikt | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `ADMIN-02` | Supportsaker | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `ADMIN-03` | Firmaer og prosjekter | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `ADMIN-04` | Brukere og roller | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `ADMIN-05` | Produktmaster | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `ADMIN-06` | Internt vareregister | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `ADMIN-07` | Nyheter i appen | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `ADMIN-08` | E-postutsending | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `ADMIN-09` | Dokumentsynk | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### Organisasjon

Dagens inngang: KS/HMS → Organisasjonskart. Ny plass: Firma → Organisasjon; også kontekstuell inngang.

Kilde: `src/modules/organization/OrganizationChart.jsx`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `ORG-01` | Ledelse og avdelinger | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `ORG-02` | Personer og nærmeste leder | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `ORG-03` | Flerfirmakart | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `ORG-04` | Visning og PDF | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

### Hjelp og support

Dagens inngang: hjelp / support. Ny plass: Fast hjelp, egen supportdialog og lokale veiledninger.

Kilde: `src/modules/help/helpTools.js`, `src/modules/app/SystemAdminWorkspace.jsx`, `src/modules/personal/PersonalPage.jsx`.

| ID | Bevares / spores til ny arbeidsflate | Status |
| --- | --- | --- |
| `HELP-01` | Søkbart hjelpesenter | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `HELP-02` | A–Å boligveiledning | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `HELP-03` | Bruker- og adminveiledning | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `HELP-04` | Egne supportsaker og nye svar | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `HELP-05` | Systemadmins behandling | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |
| `HELP-06` | Prosjektets supportmodus uten ordinær redigering | Kildekartlagt; konkret integrasjon og regresjonsprøve gjenstår. |

## Avgrensning og endringsstatus

Arbeidet er et grunnlag for implementering og en forbedret separat skisse. Ingen påstand om at alle dagens funksjoner allerede finnes i prototypen. Ingen appkode, backend, database eller ProffDok-miljøer er endret. Ingen e-post sendt og ingen uke levert. Prøvesamtalen er fiktiv og ligger lokalt i skynettets nettleser.
