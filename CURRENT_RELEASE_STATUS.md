# Samlet testkandidat – 6. november 2026

Miljømål BEGGE. Bare arbeidsbranch/Preview/Sandbox. Produksjon og demo er uendret; ingen ny TEST OK er gitt.

PR309 er én samlet testkandidat med Bolig og PR311-kjernen. Sist bekreftede samlede kandidat 2c0f057c har full CI992 SUCCESS, READY/Sandbox og innlogget kontroll av låst garantioppsett. Core 16429ad9 har full CI991 SUCCESS. Bolig, grunnpakker/tilvalg, A–Å-guide, Hjelp/video og HR-kladd har tidligere dokumenterte innloggede delprøver.

Neste avgrensede retting: prosjektinvolverte følger eksisterende prosjektlås og skrivebeskyttet tilgang, med bevart kontaktkladd og usendt melding. Se [testgrunnlag](docs/qa/PROJECT_PARTICIPANTS_READONLY_20261106.md). Lokal faktisk React43PASS og native fixture-build er bestått; ny full CI og innlogget Preview kreves før denne rettingen kan godkjennes.

Full appgjennomgang, eksterne roller og fysisk mobil/Safari står fortsatt åpne. Ingen utsending, migrering, seed eller nullstilling er utført.

Ved senere uttrykkelig TEST OK for samlet leveranse: kontroller faktisk main/base, avtal migrasjonssteg, fullfør core og Bolig i riktig rekkefølge, verifiser publisert commit og synkroniser demo med særtilpasningene bevart. Eksakte CI-/Preview-bevis og videre status dokumenteres i PR309/311.
