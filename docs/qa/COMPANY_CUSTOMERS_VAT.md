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
