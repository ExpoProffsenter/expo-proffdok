# Bestillingsark med bilder – 25.11.2026

Miljømål BEGGE. Egen branch fase45b-bolig-confirmed-order-print-20261125 fra faktisk publisert main55ea4e5. Brukerens TEST OK gjaldt tilbudsdato/fritekst, som er publisert og synkronisert til demo. Denne nye funksjonen er ikke godkjent for produksjon.

Scope: BoligOrderDraft, egen lesende RPC, separat utskriftskomponent/CSS, egne tester og hjelp. Ingen nye rettigheter, katalogendring, tilbudsendring, e-post, datatilbakefylling eller bestillingshandling. Utskriften samler grunnpakke/valgte tilvalg/aksepterte tillegg, ingen priser, med fryste bildereferanser og tydelig proveniens. Pending beboervalg kan skrives ut men merkes ikke akseptert. Eksterne bilder kan senere endres på verten; manglende bilder vises tydelig.

Lokalt PostgreSQL2083 før ekstra grunnbildekrav PASS: base, akseptert butikktillegg, ingen dobbelttelling av håndtert ordre, utestengt nyere publisert forslag, bevart tilleggsbilde, ingen pris-/kontaktfelter, stabil basis, manager/anon/firma-sperrer. Egen faktisk Chromium-test produserer A4-PDF og kontrollerer innebygde bildeobjekter, alle varer, tekst, multipage, skjult intern app,360px, endret basis og tilbakekalt tilgang. Lokal Chromium-binær mangler; nettlesertesten må bekreftes i CI. Ingen fysisk skriver/iPhone/Safari-prøve.

Sandbox-installasjon/Preview/CI registreres i PR før sluttvurdering. Produksjonsmigrasjon er ikke kjørt. Etter ny uttrykkelig TEST OK: bekreft main og produksjon, installer kun den manglende migrasjonen, merge, verifiser eksakt READY og kontrollert main→demo. Tilbakeføring: revert frontend, den isolerte lesende RPC-en kan bli stående uten datatap. Ingen kundedata skal slettes eller endres som del av dette.

## Publisert sandbox og første CI

PR349, første kandidatbbf4fda. Sandbox-migrasjonen er installert én gang som20261125140850, Production urørt. Lokal full critical/build og PostgreSQL2084krav PASS. Første CI45631049505 bestod build og PostgreSQL, men katalogens eksisterende React-harness manglet cssFileName etter ny CSS-import, og ny utskriftsharness forsøkte å løse react/jsx-runtime fra/tmp. Kun harness-pakking rettet, ingen assertions fjernet. Katalogtesten får eksplisitt CSS-filnavn, ny harness bruker etablert classic-JSX-oppsett. Ny full CI kreves.

For å bevare eksisterende innlogging er den tidligere review-branchen fast-forwardet til samme nye kandidat som PR349. Fast sandboxadresse er fortsatt https://expo-proffdok-git-fase45b-offer-date-free-text-1b69c3-ringside.vercel.app/ . Den gamle PR347 er allerede merget; dette flytter ikke main. Ny egen branch/PR349 er fasit for utskriftsendringen.

Eget syntetisk QA-prosjekt «QA – Bestillingsark med bilder25.11» ble opprettet i sandbox, root30e0f85a-6f42-4ab1-9259-6dea1d725e42, bolig8086785e-680f-4356-b99d-7111011b98af/H0101. Grunnpakke og ett tilvalg med tydelig syntetiske eksempelbilder er akseptert via testens egne funksjonskall, ingen reelle mottakere eller e-post. Ingen eksisterende avtaler endret. Testprosjekt beholdes for brukerens konkrete prøve.

Innlogget hosted prøve påbbf4fda: Boligprosjekter → QA-prosjekt → H0101 → Bestilling og levering → Skriv ut bestilling med bilder. Riktig bolig/adresse,1pakke/2stk, begge fullstendig innlastede1200×800bilder, kundebekreftet status, kildeutgave og tekst; ingen priser. Visuell dialogkontroll PASS. Faktisk fysisk skriver og iPhone/Safari ikke prøvd. Utskriftsdialogens PDF/kutt/bildeobjekter krever fortsatt grønn faktisk Chromium-test.

Andre CI45632047631: PostgreSQL, katalog-React og build bestod. Den nye nettleserharnessen viste ingen knapp: React-bundelen hadde ikke fått process.env.NODE_ENV innfelt. Lokal faktisk oppstart bekreftet «process is not defined» med gammel harness og PASS etter eksplisitt production-define, uten produktendring eller fjernede assertions. Runtime-/DOM-feildetaljer er lagt til for eventuell videre diagnose.
