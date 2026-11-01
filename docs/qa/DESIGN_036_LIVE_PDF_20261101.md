# Design 03.6 – faktisk innlogget PDF, 1. november 2026

Miljømål BEGGE; denne kontrollen gjelder bare fast design-Preview bundet til Sandbox. Kodebaseline 61076b47, dokumentasjonshode 6fc516d3. Ingen appendring for eksporten.

## Faktisk fil

Innlogget demoøkt, eksisterende låste RESERVE-prosjekt a0000000-0000-4000-8000-000000000002. Rapport → Last ned PDF → Fortsett uten KS/HMS → Generer PDF. Ettervarselet er en native alert; `getJsDialog()` bekreftet type alert og `dismiss()` lukket OK-meldingen. Panelet ble deretter igjen aktivt med Last ned PDF. Tilbake til prosjektet beholdt samme prosjekt og tab=prosjekt-URL. Ingen Oppdater prosjekt, ny signering eller sending ble utført; appens ordinære lokale sikring var aktiv.

Faktisk nedlastet original generert 1.11.2026 kl.14:57:39 Oslo:
- 21 A4-sider, jsPDF 2.5.1, 8 815 729 byte.
- SHA256: 19000bd8dec7128c45ab79db17ec6f744bba8c1ef03b427016eacaac4e7fd426.
- Sju unike 1200×800-bilder i galleri på side6–7; fem ytterligere sjekkpunktplasseringer på side8,9,11. Samme bilder gjenbrukes som forventet. AI-merking følger bildepikslene; ferdigbad brukes også på for-/sluttside.
- Garantisertifikat DEMO-GARANTI-2026-002, 10år, utstedt15.9.2026/gyldig15.9.2036, 38 kontrollpunkter, null åpne/to lukkede avvik. Rapportvalg inkluderte ingen ekstra KS/HMS-dokumenter; dette er ikke en attest på alle valgkombinasjoner.
- Alle21sider er rendret med Poppler og visuelt gjennomgått i komplette kontaktark. Forside, faktasider, galleribilder, sjekkpunktbilder, avvik, overtagelse og garantisider er leselige. Flere korte dokumentseksjoner har mye ledig plass; ingen ny komprimering av PDF-layout er gjort.

[Bevart gjennomgangseksemplar](https://chatgpt.com/library?file_id=libfile_98dab25a0a288191b28fb2328804f039&account_id=personal). Filbevaring kan legge på plattformmetadata; SHA og byteantall over gjelder den opprinnelige nettlesernedlastingen.

## Korrigering av tidligere tolkning

Kenneth opplyste at eksporten viste et OK-varsel. Kontroll med sekvensielle kommandoer bekreftet dette og en faktisk PDF-fil. Første forsøk ventet på download samtidig med klikk, og nettleserstyringen tidsavbrøt. Det var for bastant å omtale dette som fastlåst generator/nettleser uten å kontrollere ettervarselet. Ikke gjenta samme samtidige eksportforsøk eller endre rapportmotoren for å skjule et automasjonsproblem. Native getJsDialog kan leses gjennom browser.tabs.get uten ny fokusbinding etter en gammel timeout.

Dette lukker det avgrensede punktet om ny levende RESERVE-PDF med AI-bilder. Tidligere grønne syntetiske PDF-/listekontroller er ikke kjørt om igjen. Full overgang/kort innlogget skjerm, fysisk mobil/Safari, separate reelle roller, alle portaler og total03.6-avstemming har ikke fått generell sluttattest.

## Fersk status og videre arbeid

main b389c707/Production dpl_HCNMdakvBh8qLupibztefMgrvBc8 READY, demo fd04ac9a, PR2956fc516d3/dpl_36LsinpWf1T1PS47TaBoyuSDcDmu READY. CI868/41312717306 feilet i app-browser og hr-db. Årsaker og testrettelser ligger i docs/changes/qa-clock-live-pdf-20261101.json. Nye testkandidaters CI må leses før mergeberedskap.

Ingen AI-bilder er reinstallert, ingen Golden-capture/reset, databaseinstallasjon, e-post, merge eller Production-endring. Samlet redesign-TEST OK mangler. Solgløtt24boliger/seksbygg og videre videoserie følger etter godkjent release.
