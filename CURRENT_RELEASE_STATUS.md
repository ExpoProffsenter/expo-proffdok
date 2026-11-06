# Samlet Preview-kandidat –6.november2026

Miljømål BEGGE. Kun arbeidsbranch/Preview/Sandbox; ingen TEST OK eller produksjonssetting.

## Kandidat

PR311 samler eksisterende PR308/d3759ce5 (Hjelp og14filmer), PR309/1b59d937 (Boligflyt), PR310/1a3f615e (låst prosjekt/overtagelse) og PR311/8f446820 (helapp,HR,plan,område). Samme faste PR311-Preview beholdes. De andre kildebranchene er urørt. Demo-overlay er ikke tatt inn.

Importkonflikten i main.jsx er løst med HeaderHelp og begge support-/portalhooks bevart. Prosjekttestens faktiske låste informasjon og alle tre produktkategorier er bevart. Statusdokumentet er samlet her; tidligere status er i kildecommittenes historikk. [Scope,kildehash,test,releaseavhengigheter og rollback](docs/qa/COMBINED_PREVIEW_20261106.md).

## Kontroller

- PR311/8f446820 har full CI986/run42249529048 SUCCESS, alle ni pakker og gate. READY og innlogget plan-/HR-etterkontroll er bekreftet.
- Samlet lokal Sandbox-build/critical PASS.145faktiske HR-React-krav, faktisk sammensatt prosjektfixture-build,147bevarte workflowkommandoer,145-reisers videoregister og whitespace PASS.
- Alle14filmfiler/metadata og filmprøven er byteidentiske PR308/d3759ce5. CI-/build-/dependency-/miljøkonfigurasjon er uendret mot main.
- Samlet kandidat trenger egen eksakt CI/READY og innlogget prøve; separat grønn QA er ikke samlet attest. Sluttresultatet føres i PR311.

## Miljø og restpunkter

Production er fortsatt main34daef4c/READY; demoabc38f7e/READY. Ingen migrering, seed/reset, utsending eller kalenderimport. Sandbox-migreringene er allerede utført og skal ikke kjøres på nytt. Production har egne nødvendige migrasjonskontroller ved senere autorisert release.

Full HR/Bolig A–Å, positive eksterne portalroller, fysisk mobil/Safari og øvrige filmer er fortsatt åpne. Etter samlet Preview/QA og uttrykkelig TEST OK: Production-verifisering og kontrollert main→demo med bevart overlay.
