# Tilbudsoversikt: ukjent antall frem til ferdig liste

Miljømål BEGGE. Bare arbeidsbranch/Preview/Sandbox. Ingen TEST OK eller produksjonssetting.

## Bekreftet årsak

Den innloggede tilbudsoversikten viste først0saker og tomtekst før19saker kom til syne. fetchSalesRequests publiserer global transportstatus ready i neste task etter summary-RPC. Men SalesModuleCore venter deretter på kontroll av tilknyttede prosjekter og eventuell tilbudsstatus før setRequests(hydrated). En nulltimer kan derfor ikke bekrefte at React-listen er klar.

Ny deterministisk test bruker den faktiske Core-lasteeffekten og List-adapteren, faktisk fetchSalesRequests og faktisk SalesListView. Den slipper summaries videre, lar den ekte transporten bli ready, men holder prosjekt-/tilbudslesingen tilbake. Gammel kode feiler: lastemarkøren er borte mens listen ennå ikke er installert.

## Avgrenset retting

Core eier nå en lokal lastetilstand knyttet til eksisterende salesStorageKey. Første render og uavklart scope vises som loading. Ready settes først etter eksisterende setRequests(hydrated) og lokal listecache. Feil i innlogging, firmakontroll, summary eller videre klargjøring vises som feil fremfor en tom, vellykket liste. Eksisterende kanselleringsregel sperrer gamle callbacks.

List bruker denne eierstatusen i appmodus, med tidligere transportfallback for frittstående bruk. Både tilbudstype- og arbeidstellere er ukjente under venting. Søkeresultatet viser ikke0treff eller tomtekst før listen er klar. Søket og valgt filter endres ikke av ferdiglasting.

Ingen RPC, spørring, sekvens, pris, ordre, kundeaksept, editorhydrering, autosave, kladd, navigasjon eller backend endres. Eksisterende kontroll/reparasjon av aktiverte prosjekter og server-first-detaljgate beholdes byte for byte utenfor de nye visningsstatuslinjene. Ingen gammel servicechecker er endret.

## Testgrunnlag

Lokalt39React/JSDOM-kravPASS: ekte transportready før utsatt prosjekt/tilbud, nye scopes med gammel globalready, sent gammelt svar, ekte tom liste, nettfeil, videre klargjøringsfeil, manglende bruker, bortfalt firma, gjenåpnet retry, previewfallback, lokal cache og null backendupserts i syntetiske scenarier.

Native Sales-oversiktsprøven er utvidet additivt: ukjente tellere på320/390/768/1363px, søk under venting, bekreftet tomt søkeresultat etter ferdiglasting og bevart søk/status. Alle tidligere søk-, retur-, scroll-, server-first-, firma- og layoutkrav beholdes. Lokal faktisk fixture-buildPASS uten browser. Lazy-loading-, oversikts- og auth-client-critical består. Full Sandbox-build og eksakt CI/READY/innlogget kontroll føres i PR309/311.

Dette er ikke en attest for reell kundesignering, utsending eller fysisk mobil/Safari. Ingen slike handlinger er utført. Fersk main/demo og siste godkjente baseline avstemmes før publisering.

## Tilbakeføring

Revert denne avgrensede commit på arbeidsbranchen. Ingen databasesteg eller rollback av data. Core integreres i samme samlede PR309-kandidat med Bolig. Produksjon/main og demo forblir urørt uten uttrykkelig TEST OK.
