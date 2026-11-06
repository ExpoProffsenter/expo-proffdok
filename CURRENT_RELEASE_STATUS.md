# Samlet testkandidat – 6. november 2026

Miljømål BEGGE. Bare arbeidsbranch/Preview/Sandbox. Produksjon og demo er uendret; ingen ny TEST OK er gitt.

PR309 er den samlede testkandidaten med Boligprosjekter og kjernekandidaten fra PR311. Den interne PR-rekkefølgen er en teknisk avgrensning, ikke et brukerkrav om separat Bolig-leveranse. PR309 på 984f9a88 har full CI990 SUCCESS og innlogget kontroll av Bolig, grunnpakker/tilvalg, A–Å-guide og Hjelp/video. Core 0e44d83a har full CI988 SUCCESS og innlogget HR-/prosjektkontroll.

Neste avgrensede retting: garantioppsettet følger eksisterende prosjektlås og skrivebeskyttet tilgang. Se [testgrunnlag](docs/qa/PROJECT_WARRANTY_READONLY_20261106.md). Lokal React-test og Sandbox-bygg er bestått; ny full CI og faktisk Preview-kontroll kreves før rettingen kan godkjennes.

Prosjektinvolverte bruker en egen lagringsflyt og er ikke rettet av denne endringen. Full appgjennomgang, eksterne roller og fysisk mobil/Safari står fortsatt åpne. Ingen utsending, migrering, seed eller nullstilling er utført.

Ved senere uttrykkelig TEST OK for samlet leveranse: kontroller faktisk main/base, avtal migrasjonssteg, fullfør core og Bolig i riktig rekkefølge, verifiser publisert commit og synkroniser demo med særtilpasningene bevart. Eksakte CI-/Preview-bevis og videre status dokumenteres i PR309/311.
