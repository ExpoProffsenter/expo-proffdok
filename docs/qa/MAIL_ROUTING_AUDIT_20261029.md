# Lesende kontroll av to mottatte varsler – 29.10.2026

Miljø: eksisterende Production, kun lesing. Ingen funksjon, kø, konfigurasjon, tilgang eller data er endret. Ingen e-post er sendt. Person-, kunde-, saks- og HR-identifikatorer er utelatt her.

## Aksept av tilbud

Den publiserte `sales-offer-acceptance-notify` v7 ble lest og sammenholdt med den aksepterte versjonen og leveringsloggen for den ene oppgitte saken. Meldingen er intern publisistvarsling, separat fra kundens kvittering.

Mottakeren velges fra den **aksepterte versjonens `published_by`**, med profilens e-post og auth-brukeren som fallback. `responsible` / `projectResponsible` påvirker ikke dette oppslaget. I den undersøkte saken var den lagrede publiseringskontoen og navnet på saksbehandler forskjellige; loggen bekrefter utsending til publiseringskontoens adresse. `published_by = auth.uid()` dokumenterer hvilken autentisert bruker-ID/sesjon serveren registrerte. Det beviser ikke hvilken fysisk person som trykket publiser. Dette forklarer leveransen, men er ikke en bekreftelse på at mottakerregelen er ønsket produktatferd.

Den kjørende acceptance-funksjonens kilde og opprettelsen av notification-tabellen mangler på undersøkt `main` (`5f58b1c6`). Klientens kall finnes. Dette er et eget kilde-/testgap som må håndteres i et avgrenset backend-scope, ikke som sideeffekt av design-PR295. Klientens acceptance-test traverserer heller ikke notify-wrapperens mottakerregel.

## Generelt HR-varsel

Den konkrete leveringsraden ble avgrenset til mottakeren og tidspunktet i den oppgitte e-posten. Den gjelder et åpent **avtalt tiltak**, med frist 31.10.2026 og sendt tre dager før frist (`bucket=-3`). Sammenligning med dagens `hr_private.sick_leave_tasks` bekreftet samme mottaker, oppgavenøkkel og frist. Mottakeren er leder i samtalens arbeidsfirma. Ingen samtaletekst, tiltaksinnhold, medarbeidernavn eller helseopplysninger ble hentet.

Dette er ikke KS/HMS-rutinegjennomgang og heller ikke `hr-review` («Kontroll av HR-oppsett og tilgang»). HR-listen «Dine frister og åpne tiltak» under HR / Min side → Mine oppfølginger leser samme live-kilde, avgrenset til **aktivt arbeidsfirma og innlogget mottaker**. Kildekontrollen viser at dette tiltaket skal være i listen når riktig firma er valgt. Brukerens faktiske aktive firma og skjermbilde av denne listen er ikke verifisert i en innlogget nettleser.

E-postmalen oppgir hverken arbeidsfirma, frist eller en oppgavereferanse, og lenken går til app-roten. Appen viser ingen varig referanse fra en mottatt e-post til den aktuelle oppgaven. Dette er dokumenterte finnbarhetshull; ingen innlogget appfeil eller bortfalt oppgave er bevist.

HR har en egen `followup_settings.enabled`, som var aktiv ved lesingen. Dette er adskilt fra KS/HMS-rutineutsendingens sperre og historisk dokumentert HR-aktivering. Ingenting er aktivert eller deaktivert i denne undersøkelsen. Fremtidig forbedring må beholde HR-innhold inne i appen, fersk firmatilgang og kontroll av gjeldende ansvarlig.

## Avslutning av sidesporet

Undersøkelsen er avsluttet etter brukerens instruks. Videre arbeid fortsetter med designparitet for Befaring/Tilbud. Endring av e-postmottakere, oppgavelenker eller transport krever eget avgrenset scope og relevant QA; ingen slik runtime-endring er blandet inn i designpakken.

Senere arbeid med eksplisitt saksbehandler-ID og mottakerruting ligger separat i PR296 med eget Preview- og Sandbox-grunnlag. Ved denne første kontrollen var mottakerendringen bare prøvepublisert i Sandbox. Den senere Production-releasen er dokumentert i docs/qa/SALES_CASE_HANDLER_RELEASE_20261029.md. Denne historiske kontrollen av Production-v7 er ikke bevis på ny e-postleveranse.
