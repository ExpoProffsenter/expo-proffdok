# Samlet testkandidat – 6. november 2026

Miljømål BEGGE. Bare arbeidsbranch/Preview/Sandbox. Produksjon og demo er uendret; ingen ny TEST OK er gitt.

PR309 er én samlet testkandidat med Bolig og PR311-kjernen. Sist bekreftede samlede kandidat e994a857 har full CI996 SUCCESS på første forsøk, READY/Sandbox og innlogget kontroll av profilmeny, timeføring og skrivebeskyttet kundetilbud. Core567a63e3 har full CI995 SUCCESS etter dokumentert omkjøring av en jobb med treg systemnedlasting. Ingen produksjonssetting.

Neste avgrensede retting: tilbudsoversikten får Core-eid status og venter på faktisk ferdig liste før null, tomtekst og0treff vises. Se [årsak og testgrunnlag](docs/qa/SALES_LIST_READINESS_20261106.md). Ny faktisk Core/transport/List-test har39kravPASS; native fixture-build og relevante criticalPASS. Eksakt ny full CI og innlogget Preview kreves. Søk, filtre, retur, editor, kladd, priser og aksept beholdes.

Full appgjennomgang, eksterne roller og fysisk mobil/Safari står fortsatt åpne. Ingen utsending, migrering, seed eller nullstilling er utført. Eksakte kandidat-/CI-/Preview-bevis ligger i PR309/311.

Ved senere uttrykkelig TEST OK for samlet leveranse: kontroller faktisk main/base, avtal migrasjonssteg, fullfør core og Bolig i riktig rekkefølge, verifiser publisert commit og synkroniser demo med særtilpasningene bevart. Eksakte CI-/Preview-bevis og videre status dokumenteres i PR309/311.
