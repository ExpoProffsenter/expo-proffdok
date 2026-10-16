# Planpopup – åpne prosjektvalg og fokus/utklipp

Miljømål BEGGE. Preview først, samme PR #254 og fast alias. Fersk førkontroll: head a624453fcf6e1945eef42287e85f3dcc972a1417, main a7bd4795e78e0ba1cbdc747960384bbf01338581, Vercel dpl_3cDaqaTHKr83Zn5EnkEorjYNMv27 READY på riktig head. Brukeren viste åpne Prosjektvalg, tilbud og deling med stor avkryssing og meldte at utklippsverktøyet igjen fikk siden til å hoppe.

## Bevis og avgrensning

Ny Chromium-reproduksjon bruker faktisk ProjectProgressPlanner og delt planbygger, style.css, APP_RUNTIME_STYLES og progressPlanExport.css; bare backendtransport er syntetisk. Før rettelse: checkbox 662 × 40 px ved 700 px skjerm. Åpne verktøy, board.scrollTop 302, tidslinje scrollTop 360 og scrollLeft 150 ble etter blur/focus til lukkede verktøy og 0/0/0. Datoperioden var beholdt, men den native popupen ble remontert ved eksisterende frisk tilgangs-/planlesing. Problemet gjenskapes uten endring av felles scrollminne.

Den tidligere pageScrollMemory-rettelsen mot synlig Windows-fokus er fortsatt på plass og uendret. Ingen main.jsx, Sales-/navigasjonsrecovery eller global scrollkode endres. Rettingen er avgrenset til planpopupens UI-gjenoppretting. Fysisk Windows + Shift + S kan ikke kjøres i Linux/Chromium-harnessen; den relevante tastatur/blur/focus-sekvensen og faktisk skjult/tilbake er simulert. Brukerens fysiske Windows-prøve gjenstår.

## Endring

- KshmsProgressBoard.jsx/CSS: eksisterende scope-nøklede view-cache får bare numeriske rulleposisjoner og boolske åpne/lukkede verktøy. Ingen plan-, kontakt- eller HR-payload legges til. Native prosjekt-/eksportdetaljer beholdes som React UI-state. Posisjon tas før fokusvalidering og ved skjuling/unmount, og brukes etter at den nye popupen er åpnet etter frisk godkjent lesing. ResizeObserver får riktig innledende bredde og ignorerer avrundingsforskjeller på høyst 1 CSS-px, slik at første observermelding ikke nullstiller den nettopp gjenopprettede horisontale posisjonen. Ekstra faktisk zoom-prøve (html zoom 1,1): før avrundingsrettelsen gikk horisontal posisjon fra 150 til 0, etter rettelsen beholdes 150; vertikal posisjon beholdes også. Ingen retry-timere. Ekte peker-/tastatur-/hjul-/berøringshandling kansellerer en ventende gjenoppretting.
- ProjectProgressPlanner.jsx: bare markup for Prosjektvalg, tilbud og deling grupperes i prosjektinfo, samme kundedelingsvalg, samme forklaring, samme knapper og eksisterende mailkort. Tilbudsimport, dirty-state, kundevalg, reload/forkast-bekreftelse, autorisasjon, lagring/readback, PDF og e-postcallbacks er identiske.
- Lokal checkbox-CSS vinner over appens generelle tekstfeltbredde og mobile min-height: 18 × 18 px, med minst 44 px høy klikkbar etikett. Delingskort og beskrivelser får mindre innvendig luft. Smale skjermer bryter kontrollene uten overlegg.

Gjelder den delte planbyggeren i Prosjekt, KS/HMS og Min side. Prosjektverktøyene finnes bare i Prosjekt. Tilgangstap, feil firma/aktør og tom svarfase skjuler fortsatt gammel plan; eksisterende autorisasjon er ikke erstattet av UI-cachen. Ingen backend, SQL, e-posttjeneste, ekte brukerdata, kursdata eller Production er endret.

## Validering

15 nye faktiske Chromium-kontroller PASS: reproduksjonssekvensens åpne verktøy + tre scrollposisjoner + dato beholdes, normal checkbox mobil/desktop, frisk dobbelt plan-/tilgangslesing, kundedeling kun som kladd uten autoskriv, kladd etter fokus, skjult/tilbake, nektet tilgang fjerner gammel plan, godkjent retry gjenoppretter egen kladd, bevisst lukkede verktøy/nullscroll beholdes, kompakt åpent prosjektfelt og bevisst lukket popup gjenåpnes ikke av fokus. Zoom med brøkdelsgeometri er også kontrollert. Null nettleserfeil. Ingen mail sendes.

Eksisterende 39 Prosjekt- og 128 KS/HMS-Chromium-kontroller PASS, inkludert import/dedup/opsjoner, egne aktive planer, kladd/reload/konflikt, flytt/strekk/Angre/tastatur/berøring, lagring, eksport/logo, låst/enkel ordre og firmasikring. Eksisterende 52 layoutkontroller PASS. Felles page-scroll-memory-check består for seks faner, nullposisjon, brukervalg, skjult/tilbake og cleanup. Ingen gammel kontroll svekkes. CI beholder tidligere suite og får den nye fokus-/delingskontrollen og eksisterende felles scrollkontroll.

Visuell QA av faktisk prosjektflate med app-CSS PASS. React-gjennomgang: ingen endring av datalesing/-lagring eller tilgangslogikk. UI-effekter er avgrenset til stateKey/expanded, lyttere/RAF ryddes, refs holder ingen privat payload, nye inputhendelser får forrang og detaljer markeres ikke som lagret av gjenåpning. Full critical/build PASS på siste funksjonskode; release-scope kontrolleres før publisering; nøyaktig head/CI/deploy føres i PR #254.

## Innlogget prøve

Fast Preview: https://expo-proffdok-git-fix-company-admin-scope-20261015-ringside.vercel.app

1. Prosjekt → Fremdrift → Prosjektvalg, tilbud og deling. Avkryssingen skal stå normalt ved teksten, og prosjekt-/delingsfeltet skal være ryddig.
2. Scroll til en oppgave og eventuelt bortover tidslinjen. Trykk Windows + Shift + S og avbryt med Escape. Åpne valg, periode og posisjon skal være de samme etter tilgangskontrollen.
3. Prøv også et faktisk utklipp. Kontroller at oppgave/dato står på samme sted. Ingen kundedeling eller sending skal skje av å åpne feltet eller ta utklipp.

Innlogget Windows-prøve og relevant TEST OK gjenstår. Ingen merge eller Production-endring. Tidligere plan- og Startsideleveranser i samme PR er fortsatt umerget.

## Ny tilbakemelding: vanlig utklipp går fortsatt ut av popupen

Kenneths nye bilde viser lukket Prosjektvalg, tilbud og deling uten ramme. Han opplyser at vanlig utklippsfunksjon fortsatt går ut av popupen, mens egen hurtigtast fungerer. Førkontroll ved denne oppfølgingen: head bc9e42892cf7a22fbd1d57843e87eed270bf9bb7, main a7bd4795e78e0ba1cbdc747960384bbf01338581, Core Safety #482 SUCCESS, dpl_BNbmWJKEU4rpYAPjq3Y1La5ywSGo READY på fast alias og riktig head.

Forrige test dekket fokus og scroll, men sendte ikke en native cancel/Escape-hendelse til dialogen. En ny faktisk Chromium-test feiler før rettelse: page.keyboard.press('Escape') lukker hovedpopupen (0 åpne dialoger mot forventet 1). Dette beviser en egen utilsiktet utgang, men attesterer ikke hvilken hendelse Kenneths fysiske utklippsverktøy sender.

Ny UI-kontrakt: Hovedplanen er en arbeidsflate som lukkes med Tilbake. Den ignorerer native cancel/Escape og klikk utenfor rammen. Ingen tidsgrense, automatisk gjenåpning eller erstatning av bevisst Tilbake. Mindre oppgave-/kodevinduer beholder Escape og egen bakgrunnslukking. Cancel stopper ved undervinduet. Native dialog/fokuslås og eksisterende tilgangslesing beholdes. Dette gjelder delt planbygger i Prosjekt, KS/HMS og Min side. Hjelp beskriver lukking.

Rammen er lokal CSS rundt prosjektverktøyets summary: 1 px, avrundede hjørner, samme fargefamilie som Eksport, egen hover/focus-visible. Åpning med mus og Enter beholdes. Ingen endring i wrapperens callbacks eller data.

Etter rettelse: 28 fokus-/delingsassertions PASS. Alle tidligere 15 beholdes; 13 nye dekker faktisk Escape på hovedplanen, bevart scroll/åpne valg, native cancel uten keydown, bakgrunnsklikk, blur/cancel/focus med frisk lesing, Escape i kodevindu og oppgaveeditor uten å lukke hovedplanen, synlig ramme, Enter-åpning og ramme innenfor 1280/390 px med minst 44 px treffhøyde. Eksisterende 39 Prosjekt, 128 KS/HMS og 52 layoutkontroller PASS; full critical/build PASS. Desktop/mobil-PNG visuelt kontrollert. Tidligere regresjonsvern svekkes ikke. Bare JSX/CSS/Hjelp, utvidet eksisterende QA og dokumentasjon endres. Global pageScrollMemory/autorisasjon/SQL/e-post er urørt, så deres tidligere bevis beholdes uten unødig repetisjon.

Innlogget prøve på samme faste Preview:
1. Prosjekt → Fremdrift: kontroller ramme rundt Prosjektvalg, tilbud og deling; åpne/lukk feltet.
2. Prøv den vanlige utklippsmåten som tidligere gikk ut av popupen, både avbryt og faktisk bilde. Popup/posisjon skal stå igjen. Prøv egen hurtigtast som kontroll.
3. Escape i hovedplanen skal beholde planen. Åpne en oppgave: Escape lukker bare oppgaven. Tilbake skal lukke hovedplanen og fortsatt respekteres etter appbytte.

Fysisk Windows-prøve og relevant TEST OK gjenstår. Production og permanent demo er ikke endret. Nytt head/tre/CI/deploy føres i PR etter publisering.

## Tekstpresisering av åpneknappene

Kenneth bekreftet at venstre knapp skulle hete Åpne fremdriftsplan (tidligere Åpne planbygger); høyre er fortsatt Åpne bemanningsplan. Felles Board/launcher og Hjelp oppdateres. Tre eksisterende QA-skript får bare ny eksakt knapptekst i selektorene. Ingen test fjernes eller svekkes; ingen nye tester for tekstendringen. Kontroller Tilbake → Åpne fremdriftsplan → tidslinjen og Tilbake → Åpne bemanningsplan → personbehov. Eksisterende funksjonsbevis fra forrige head beholdes, ny build/CI/release føres i PR.

Tekstpresiseringen: full critical/build og eksisterende 39 Prosjekt-Chromium-kontroller PASS, inkludert bevisst lukking og gjenåpning med ny knapptekst. Øvrige tidligere funksjonstester gjentas i uendret CI-suite.
