# Synlig inngang til opprettelse/redigering av grunnpakker og tilvalg

Miljømål BEGGE, eksisterende foundation-Preview og PR #278. Brukeren fant ikke pakkeoppsettet. Rotårsak: katalogen var en underinngang under Oppsett, mens rompakke-dialogen bare valgte eksisterende pakker.

- Egen «Grunnpakker og tilvalg» i prosjektets arbeidsområder, ved siden av Byggoversikt og Oppsett. Bare valgt område markeres aktivt. Oppsett samler struktur/arkiv. Katalogkomponenten flyttes ikke eller remonteres.
- Ny grunnpakke og Nytt tilvalg er synlige samtidig, uavhengig av valgt katalogkategori. Eksisterende grunnpakker har sammenfoldet vareinnhold, slik at Rediger-knappen ikke havner under en lang vareliste. Tilvalgsliste har eksisterende Rediger tilvalg-handling.
- Rompakke-dialogen har «Lag eller rediger grunnpakker og tilvalg». Den sikrer lokal kladd før navigasjon, lukker dialogen og åpner katalogområdet. «Tilbake til boligvalg» går tilbake til samme valgte bolig. Eksisterende boliger/rom og usendte skjemaer blir montert.
- Fokus/scroll til katalogoverskriften skjer bare på eksplisitt navigasjon. Focus-/tilgangsoppfriskning skal ikke stjele arbeidssted eller redigeringsfelt.
- Ingen DB-, auth-, meny-, Sales-, HR- eller annen modulendring. Ingen migrasjon eller endring av lagrede pakker/valg/ordre. Hjelp er oppdatert til den direkte inngangen.

QA: faktisk foundation-React med ny direkteruting, én aktiv navigasjonsknapp, begge opprettelsesknapper, native pakke-/tilvalgsdialoger og samme struktur-/pakkeutkast gjennom katalog/focus/retur PASS. Eksisterende katalog-React PASS. Faktisk Chromium rompakke-/ordreflyt 36 assertions PASS (34 beholdt, ny snarvei/utkastkontroll); mobil-/PC-bredder og tidligere konflikt-/lagrings-/rolleprøver beholdt. Full critical build og eksakt publisert CI-status dokumenteres i PR.

Skynett-prøven er fortsatt ubekreftet etter tidligere tidsavbrudd. Denne runden bruker faktisk lokal Chromium og React-prøver. Ingen produksjonsmerge.

Fast Preview: https://expo-proffdok-git-fase45b-boligprosjekter-found-0509d8-ringside.vercel.app/?progressTest=safe

Prøv:
1. Åpne et boligprosjekt → Grunnpakker og tilvalg øverst ved Byggoversikt.
2. Ny grunnpakke / Nytt tilvalg skal begge være synlige. Velg Grunnpakker eller Tilvalgsliste for å finne lagrede oppføringer og Rediger.
3. Byggoversikt → bolig → rom → Endre rompakke → Lag eller rediger grunnpakker og tilvalg. Gå tilbake med Tilbake til boligvalg; romutkastet skal være beholdt.
