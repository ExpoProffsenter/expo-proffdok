# Samlet testkandidat – 6. november 2026

Miljømål BEGGE. Bare arbeidsbranch/Preview/Sandbox. Produksjon og demo er uendret; ingen ny TEST OK er gitt.

PR309 er én samlet testkandidat med Bolig og PR311-kjernen. Sist bekreftede samlede kandidat f6fa6b08 har full CI994 SUCCESS etter dokumentert omkjøring, READY/Sandbox og innlogget skrivevernskontroll av kontakter og garanti. Core8fa313c4 har full CI993 SUCCESS. Ingen produksjonssetting.

Neste avgrensede retting: behold arbeidsprofilvelgerens React-root ved responsiv flytting. Gammel kode feiler ny deterministisk prøve; rettet kode har39ReactkravPASS og native fixture-build. Se [testgrunnlag og kildeavstemming](docs/qa/WORK_PROFILE_RESPONSIVE_STATE_20261106.md). Ny full CI og eksakt Preview-kontroll kreves. Et gammelt timeføringspunkt om tidlig Escape er allerede dekket i dagens kode og regresjonstester og endres ikke her.

Full appgjennomgang, eksterne roller og fysisk mobil/Safari står fortsatt åpne. Ingen utsending, migrering, seed eller nullstilling er utført. Eksakte kandidat-/CI-/Preview-bevis ligger i PR309/311.

Ved senere uttrykkelig TEST OK for samlet leveranse: kontroller faktisk main/base, avtal migrasjonssteg, fullfør core og Bolig i riktig rekkefølge, verifiser publisert commit og synkroniser demo med særtilpasningene bevart. Eksakte CI-/Preview-bevis og videre status dokumenteres i PR309/311.
