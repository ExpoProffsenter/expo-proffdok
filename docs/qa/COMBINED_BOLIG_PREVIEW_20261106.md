# Én samlet testversjon med Bolig –6.november2026

Miljømål BEGGE, kun Preview/Sandbox. Ingen brukerbestemt avgrensning krever separat Bolig-leveranse. Det tidligere skillet var en teknisk løsning på repoets avgrensningstester. Målet er én samlet testversjon og én avtalt releasegodkjenning, med alle kildeendringer bevart.

## Kontrollgrunnlag som bevarer alle sperrer

KjernePR311/0e44d83ab54372bbb358d4976ed7438191fe9166 har full CI988/run42253538878 SUCCESS og READY på dpl_2N89pAaDTFvQSK38uTomtFRKU3aY. Den inkluderer PR308/d3759ce5 med14filmer, PR310/1a3f615e og PR311/8f446820. Main er fortsatt34daef4c.

Denne samlede kandidaten iPR309 beholder opprinnelig Bolig-head1b59d937f7614328030b71a617fa6a3c717a5a8f og legger den fullgrønne kjernen til som forelder/avhengighet. PR309s kontrollbase er den eksakte kjernekandidaten,ikke en antatt publisert main. Delt planbygger er byteidentisk kjernen; alle tilsiktede kjerneendringer er allerede prøvd iCI988. Bolig-grensekontrollen sammenligner den faktiske samlede utsjekken med denne dokumenterte basen og kontrollerer alle Bolig-sideeffekter uendret. Hele standardpakken kjøres fortsatt på det samlede treet,inkludert vanlig app/HR/prosjekt/tilgang/PDF/filmer og alle Bolig-scenarier. Ingen testutelating,nytt unntaksflagg eller svakere forventning innføres.

Workflowens ene branch-liste utvides additivt fra main til main+fase45b-whole-app-qa-20261104. Dette starter samme fulle eksisterende147kommandoer/varianter og samme uendrede build/sluttgate også nårPR309 har kjernebranchen som base. Ingen nypermission,secrets,continue-on-error,paths-ignore eller endret assertion. Base/ref/SHA og CI dokumenteres uttrykkelig; før release avstemmes dette mot faktisk main.

## Faktisk førbevis

Firepakksforsøketff1f047b var direkte motmain og ble riktig avvist av Bolig-scope og byteparitet. Det er bevart påqa-history-combined-bolig-20261106. Den nye oppdelingen er av testgrunnlaget,ikke av sluttproduktet: core-diff motmain iPR311; Bolig-diff motkjernen iPR309; full runtime på hele den samlede kandidaten.

Lokal Bolig-core-boundary har bestått55krav,28Bolig-/dokumentasjonsstier mot0e44d83a før additivCIstart og29etter denne ene workflowlinjen. Ordinær planbygger er byteidentisk0e44d83a. App/test/media/SQL i samlet kandidat er byteidentiske det tidligere firepakksforsøket; bare dokumentasjon og den ene additivCItriggeren skiller. Ingen runtime-/databasekode omskrives for å gjøre kontrollen grønn.

## Lokal og automatisk kontroll

Full lokal Sandbox-build/critical og workflowvakt147opprinnelige kommandoer kjøres. Bolig-grense55PASS og vanlig planbygger-byteparitet PASS lokalt. Ingen ny lokal native attest etter kjent socketbegrensning. Ny samlet eksaktCI/READY og innlogget etterkontroll kreves førTEST OK. Bevis/kandidat/sluttstatus føres iPR309; ikke gjenbruk kildeCI som samlet attest.

## Én avtalt release

Brukerens eventuelleTEST OK må gjelde det konkrete samlede testgrunnlaget og den fullstendige avtalte produksjonsplanen,inkludert nødvendige kontrollerte migreringer. Ikke krev en ekstra produktgodkjenning bare fordiPR-ene er teknisk avhengige.

Ved autorisert release: kontroller faktiskProduction-DB og utførte steg; merge kontrollert kjernePR311 tilmain; avstemPR309 mot eksakt publisert kjerne/main,bevar samme app-/testgrunnlag og full QA; fullfør Bolig-merge; verifiser endelig publisert commit og alle relevante funksjoner; synkroniser deretter gjeldende endeligmain→demo med overlay og preflight. Ingen automatisk produksjonssetting eller lovnad om atomisk publisering følger av denne forberedelsen.

Allerede utførte Sandbox-migreringer skal ikke kjøres på nytt. Ingen produksjonsDDL,seed/reset,utsending eller kalenderimport er utført. Routine-e-post er fortsatt deaktivert. Full HR/Bolig-A–Å,positive portaler,fysisk mobil/Safari og øvrige videoer er fortsatt åpne.

Rollback før release:opprinneligPR309/1b59d937 og kjernePR311/0e44d83a er bevart i historikken. Ingen DB-steg er nødvendige for å avvikle denne Preview-integrasjonen. Den additivCIbasegrenen kan fjernes når den avhengigePR-en ikke lenger trengs,men ikke slik at aktivQA forsvinner.


## CI989: faktisk testantakelse om boligrekkefølge

CI989/run42255486657 på49eb23b5 startet alle ni pakker på den avhengige basen. Scope/build/HR/firma og de ferdige nettleser-/prosjektpakkene kontrolleres separat; Bolig-db128021537043 stoppet i bolig-integration-db-scenarios:324 med forventetBuildingA/faktiskBuildingB. Ingen ny server-/produktfeil er påvist av denne assertionen.

Rotårsak: testfixtureen brukte locationPlan.units[0] somBuildingA. Gjeldende snapshot sorterer units etter generert entrance_id,floor,position,ikke byggenes innsendingsrekkefølge (se20261020230426_boligprosjekter_unit_contact.sql:119). Den faktiske lokasjonsfunksjonen kobler unit.id→entrance.id→block.id. Alle selected.unit_id-krav bestod før den feilaktige antakelsen om navnet.

Kun syntetisk fixturevalg rettes: finnBuildingA/B fra egne blokk-ID-er,deretter nøyaktig én tilhørende oppgang og bolig. Eksisterende krav om to boliger,samme bolignummer,eksakt selected.unit_id,byggnavn,adresseprioritet,begge paginerte bygg,reader-/firmasikt beholdes. Fem additive krav bekrefter entydige oppganger/boliger og ulike bolig-ID-er. Ingen SQL,migrering,RPC,grense/paritet eller produktkode endres. Lokal fullfoundation-DB og ny eksaktCI kjøres; resultater føres iPR309. Ingen blind omkjøring av den tilfeldige testen.


Lokal etterkontroll: full bolig-foundation-db-check på ordinær lokalPGlite-fixture PASS1758krav/500boliger,inkludert de fem nye entydighetskravene. Syntaks,whitespace og uendret Bolig-core-boundary55PASS. App/SQL/CI/media er uendret fra49eb23b5; bare denne fixtureen og QA er endret. Ny eksaktCI må bekrefte kandidaten.
