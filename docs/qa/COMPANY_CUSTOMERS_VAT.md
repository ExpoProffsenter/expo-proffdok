# Kunderegister og prisvisning per tilbud

Miljømål: BEGGE. Feature/Preview fra main 86e6036. KJØR gjelder Sandbox, ingen Production-godkjenning.

Scope: firmaets frivillige kunderegister, eksisterende kunde-/prosjektskjema og begge tilbudsredigeringer, låst prisvisning i kundevisning/tilbud-PDF/aksept-PDF, Hjelp og dokumentasjon. Ingen recovery-/navigasjonsendring.

Kontrollert 05.10.2026:
- Full eksisterende critical-suite og Vite-build grønne. Ny permanent runtime-check for default inkl. mva., eks. mva., uforanderlig publisert/akseptert valg, antall/enhetspris og uendret beregning. Faktisk public-mapper og rehydrert akseptmodus er også dekket.
- Reell React-render av kunderegisteret: lagringsvalget av og engangskundetekst synlig. Kundevisning rendret i begge publiserte mva.-modus med korrekte etiketter/mva.-oppsummering. Ingen backendkall i denne renderkontrollen.
- Sandbox SQL-scenarioer passerer: delt register i eget firma, skjerming av annet firma, oppdatering/revisjon, konflikt, feil forventet firma, anonym avvisning, whitelist og ingen direkte tabellrettigheter. Alle QA-data rulles tilbake.
- Sandbox-migrasjon anvendt. Security advisors: RLS uten direkte policy og authenticated SECURITY DEFINER er tilsiktet RPC-only-kontrakt. Firma avledes på server, godkjent/aktiv profil og medlemskap kreves, search_path er låst. Ingen anonym RPC. Eksisterende prosjektfunn utenfor scope.
- Nettleserinstallasjon mislyktes (sertifikat/avbrutt nedlasting). Ingen innlogget nettlesertest eller visuell PDF-kontroll hevdes. Brukeren tester Preview før merge.

Kort Preview-test:
1. Nytt prosjekt/forespørsel: kundelagring starter av. Lagre en fast kunde med eget navn, søk og hent den i et nytt prosjekt og begge tilbudstyper. Kontroller prosjektadressen.
2. Engangskunde: behold valget av. Kunden skal ikke dukke opp i registeret.
3. Et tilbud med enkel vare og opsjon: inkl. mva. som standard. Velg eks. mva., publiser og kontroller kundelenke og ny PDF; mva. og totalsum inkl. mva. skal fortsatt fremgå. Kontroller aksept-PDF hvis tilbudet aksepteres.
4. Åpne et eksisterende tilbud: tidligere prisvisning og innhold skal være bevart. Bytt nettleserfane og tilbake i editoren; samme kladd skal stå åpen.

TEST OK kreves før merge, konkret Production OK før migrasjon/publisering til Production. Deretter main → demo og preflight.

Preview-feedback 05.10 kl. 20:03: valget var lagt i eldre ubrukt generelt tilbudsbygger. Rettet i aktive grouped/catalog-routeren med egen Prisvisning til kunden-seksjon, flagg i kladdforhåndsvisning og totalsum som følger valget. Permanent React-render-test går gjennom faktisk SalesOfferBuilder-router med syntetisk avsenderprofil, begge modus og summary; ingen innloggings-/backendkall. Ny Preview må testes.

Kenneth TEST OK på prisvisning 05.10 kl. 20:13; ønsket UI-justering: separate rammer, lagringsvalg nederst før Opprett tilbud, nedtrekk og søk samt bedriftskundetekst. Samme branch. React-render kontrollerer begge innganger, riktig rekkefølge og lagring av som standard. Ingen SQL-endring. Ny Preview for sluttkontroll; Production ikke godkjent.
