# Permanent demo – godkjent Design 036-synk, 2. november 2026

Kenneths TEST OK omfatter PR294/295/298/305 og kontrollert main → demo. Production er nå publisert på main **34daef4c0526b93ddbd84c3bfd97fb0833d97caf**, READY **dpl_3D5fzV9TVkidd7x7Eowg3V6hWjQ2**, etter full CI888 SUCCESS10/10 på22eecb54. Alle fire PR-er er merget. Det var bare den eldre Min side-testinngangen som måtte samordnes med godkjent boligflyt etter CI887; ingen produktendring i denne rettelsen.

Denne demo-committen synkroniserer faktisk main34daef4c inn i tidligere demo fd04ac9a. Eksisterende demo-overlay, kontrollside, lokalkladd-/demoåpning, Sandbox-binding, bilder og ressursfiler beholdes. Ingen demo → main. Ingen database-, bruker-, rolle-, e-post- eller demodataendring, reset eller reinstallasjon av AI-bilder. Solgløtt og videre videoer er fortsatt egne oppgaver, ikke del av denne synken.

[Synkgrunnlag, kontrollresultater, historikk og grenser](docs/qa/DESIGN036_DEMO_SYNC_20261102.md). Endelig demo-SHA, Vercel READY, publiserte ressurskontroller og etter-preflight føres i PR295 etter at de faktisk er bekreftet. Ikke utled publiseringsstatus fra denne filen alene.

Production-malforslag ble allerede installert som remote20261102151721 fra canonical20261031012504. Ikke installer på nytt. [Produksjonsløp](docs/qa/DESIGN036_PRODUCTION_RELEASE_20261102.md) og [gjenopptak etter brudd](docs/qa/DESIGN036_RELEASE_RESUME_20261102.md) bevarer årsaker, autorisasjon og testbevis.

Demoens SQL-preflight før synk er19/19 og kurs5/5 grønn i READ ONLY/ROLLBACK. Lokal demo critical/build, kontrollside, sjekkliste/save/konflikt/support, tilbud292+229, oversikt311 og boligveiledning242 består. Innlogget full rolle-/Safari-gjennomgang er ikke nyattestert. Etter publiseringskontroll gjelder stabilitetsstopp før visningen3.november.

Tidligere demo-README og hovedarkitektur er bevart byteidentisk i docs/archive/DEMO_README_BEFORE_DESIGN036_20261102.md og DEMO_ARCHITECTURE_BEFORE_DESIGN036_20261102.md. Gjeldende felles README/arkitektur følger main; demoens egne manualer beholdes uendret. Tidligere status ligger fortsatt i Git på fd04ac9a.
