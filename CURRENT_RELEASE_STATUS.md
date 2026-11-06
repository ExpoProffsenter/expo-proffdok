# Samlet kjernekandidat –6.november2026

Miljømål BEGGE. Bare arbeidsbranch/Preview/Sandbox, ingen TEST OK eller produksjonssetting.

PR311 samler PR308/d3759ce5 (Hjelp/14filmer), PR310/1a3f615e (låst prosjekt/overtagelse) og PR311/8f446820 (helapp/HR/plan/område). Samme faste PR311-Preview beholdes. PR309/1b59d937 (Bolig) skal fortsatt leveres separat.

Forsøket med alle fire pakker påff1f047b ble stoppet av uendret bolig-core-boundary-check og bolig-shared-board-parity. Det er bevart på qa-history-combined-bolig-20261106. Ingen guard eller test ble svekket. Ny kandidat er bygget fra8f446820 med308/310;309 er verken forelder eller kilde til Bolig-modulendringer i denne kandidaten. [Fullt scope,kilder,feilårsak,test og rollback](docs/qa/COMBINED_PREVIEW_20261106.md).

## Bevis og avgrensninger

Kilde311/8f446820 har full CI986SUCCESS og innlogget plan-/HR-prøve. Kilde308/d3759ce5 har CI984SUCCESS og14filmer; tidligere13-opptelling var utdatert. Alle14medier/metadata og filmprøven er bevart uendret.

Ny lokal kjernekandidat: full Sandbox-build/critical, faktisk prosjektfixture-build uten browser, scope/release-docs,147workflowkommandoer og145-reisers videoregister kontrolleres før publisering. HR-komponent/test er byteidentisk den allerede lokalt145PASS-prøvde firepakkskandidaten. Begge uendrede Bolig-avgrensningsprøver rapporterer ingen Bolig-featureendring. Eksakt ny CI/READY og innlogget etterkontroll kreves; kildebevis er ikke samlet attest.

Productionmain34daef4c og demoabc38f7e er urørt. Ingen migrering, seed/reset, kalenderimport eller utsending. Allerede utførte Sandbox-migreringer skal ikke kjøres på nytt. Production krever separat migrasjonskontroll ved senere autorisert release.

Neste: fullfør denne kjernekandidatens QA/Preview → uttrykkelig TEST OK → kontrollert Production/main→demo. Deretter avstemmes PR309 mot den nye publiserte main-baselinen med uendrede Bolig-grenser og egen full QA. Full HR/Bolig A–Å, eksterne portalroller,fysisk mobil/Safari og flere filmer står fortsatt åpne.
