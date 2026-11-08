# Arbeidsprofilvelger beholdes ved responsiv flytting

Miljømål BEGGE, kun arbeidsbranch/Preview/Sandbox. Ingen TEST OK eller produksjonssetting.

## Bekreftet årsak og avgrensning

CI994s første app-forsøk målte det påkrevde arbeidsprofilvalget som ikke synlig etter Escape. Samme test bestod i parallell kjerne og i kontrollert omkjøring på uendret kode. Dette alene beviste ikke årsaken.

Videre kildeanalyse og ny deterministisk React/JSDOM-prøve bekrefter nå at mountSwitcher destruerte eksisterende React-root og opprettet ny når hosten skulle flyttes mellom mobil og skrivebord. Den negative prøven feiler på gammel kode: det påkrevde profilvalget er en annen DOM-node etter første mobilflytting. Åpen meny, ventende valg og eksisterende feiltilstand kunne dermed starte på nytt ved ren layoutendring.

Rettelsen flytter samme eksisterende host uten unmount. Fokus i velgeren beholdes når feltet fortsatt er tilkoblet og aktivt. Ingen nye timere, cache-, auth- eller lagringsregler. Fersk bortfalt tillatelse, portal og supportmodus bruker fortsatt tidligere oppryddingsregler. Vanlig firmabytte krever fortsatt eksisterende bekreftelse; påkrevd førstegangsvalg kan fortsatt ikke lukkes med Escape.

Dette retter den påviste unmount-banen. At den forklarer absolutt alle detaljer i det tidligere enkeltstående CI-tidspunktfunnet er ikke hevdet.

## Kontroller

Ny faktisk React/JSDOM-prøve:39PASS på rettet kode. Den dekker gjentatte flyttinger, samme påkrevde dialog, bevart kladd, ventende engangsvalg uten duplikater, feil etter serveravvisning, Escape, fokusretur, fersk tilbakekalling og portalutelating. Transport er syntetisk; ingen firmabytte eller serverlagring skjer.

Den eksisterende native shell/work-profile-prøven beholder alle62tidligere krav og får ekstra identitets- og feilbevaringskrav på320/390/768/1363/1920px. Den kjører også den nye39kravs komponentprøven. Lokal native fixture-build består uten browser. Arbeidsprofil-/mobilkritiske kontroller består. Full Sandbox-appbuild og eksakt CI/READY/innlogget kontroll registreres i PR309/311 før eventuell godkjenning.

Som separat statusavstemming ble gammelt timeføringspunkt om tidlig Escape kontrollert mot dagens kilde. TimeSheet har allerede ventende fokusretur som annulleres av ny brukerhandling, og native timeprøven dekker forsinket prosjektlesing og eget navigasjonsvalg. Denne pakken endrer ikke timeføringen eller dens tester; eldre gjenstår-tekst skal ikke behandles som en ny feil.

## Tilbakeføring og gjenstående

Revert denne avgrensede commit på arbeidsbranchen ved behov. Databaser, rolle-/firmavalg, prosjekt, e-post og faktiske profiler er uendret. Integrer samme core i den samlede PR309-kandidaten med Bolig. Produksjon/main og demo forblir urørt.

Fysisk mobil/Safari og faktiske rolle-/firmabytter er ikke attestert av disse syntetiske testene. Bruk ikke reelt firmabytte eller lagring som utilsiktet manuell prøve.
