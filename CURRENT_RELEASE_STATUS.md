# Gjeldende status – 4. november 2026

Production/main er kontrollert som **34daef4c0526b93ddbd84c3bfd97fb0833d97caf**, Vercel dpl_3D5fzV9TVkidd7x7Eowg3V6hWjQ2 READY på expo-proffdok.app. Novembers godkjente produksjonsløp er gjennomført; gamle planpunkter nedenfor skal ikke kjøres på nytt.

Ny designgjennomgang etter kundemøtet: **PR308**, branch **fase45b-ux-live-review-20261104**. Kodekandidat **a39f110c8b5a9dc555ad506c5675a195e3e3dcc0** har grønn full CI897 (run41833840681) og bekreftet Sandbox Preview READY. Hjelp i toppfeltet, filmknapper under temaer og korrigert Bolig-verktøylinje er klare til avgrenset brukertest. Ingen ny TEST OK eller produksjonsmerge er gitt.

Innlogget skynettøkt fungerer igjen. Production er undersøkt uten kundedatalagring. Sandbox er undersøkt med eksisterende fiktiv40-boligpilot og et nytt avgrenset QA-prosjekt. Dette er fortsatt ingen full A–Å-attest for alle roller/underfunksjoner. Komplett Bolig-film, videre flytrettelser og fysisk Safari/mobil gjenstår.

[Datert QA, testgrenser, funn og neste steg](docs/qa/LIVE_DESIGN_REVIEW_20261104.md). [PR308](https://github.com/ExpoProffsenter/expo-proffdok/pull/308). Demo er ikke synkronisert med denne nye, ikke-godkjente pakken.

---

# Historisk releasegrunnlag – samlet TEST OK 2. november 2026

Kenneth har godkjent PR294, PR295, PR298 og sjekklistefunksjonen PR305 med nødvendige backendkontroller, produksjonssetting og main → demo. Ingen ny bekreftelse kreves for uendret avtalt omfang når kontrollene består. PR217/277, nye funksjoner, Solgløtt, videre videoer og branchopprydding er utenfor dette løpet.

## Faktisk gjennomførte etapper

- Production-migrering for malforslag er installert og verifisert som remote20261102151721, canonical kilde20261031012504. Ikke kjør den på nytt. Eksisterende data/historikk, signaturkrav og tilganger er bevart.
- PR305 og PR298 er merget og publisert, med grønn CI og korrekt Production-binding. PR294 er deretter merget som main70a99b3ece0ab562c5ee140f23c8b18da1b7b4a1 etter CI886 SUCCESS.
- PR295 er siste designetappe. Faktisk main integreres med begge pakkers innhold og tester bevart. De69 opprinnelige boligveiledningstekstene er byteidentiske; fire godkjente boligtemaer legges til via samme modul-API. Ingen ny designvariant.
- Den siste kandidatens fullCI, Production-SHA/READY og main → demo-kvittering føres i PR295. Ikke utled ferdig publisering fra denne filen alene.

[Godkjent produksjonsløp, migreringskvittering, datahash, CI-årsaker og tilbakeføring](docs/qa/DESIGN036_PRODUCTION_RELEASE_20261102.md).

Permanent demo er ved denne committen fortsatt fd04ac9a. Den skal synkroniseres fra faktisk godkjent main, med særtilpasninger, bilder og Sandbox-binding bevart. Demoens ferske SQL-preflight19/19 og kurs5/5 består, uten datareset eller utsending.

Den gamle innloggede skynettøkten er fortsatt ikke gjenopprettet. Ingen full ny innlogget rolle-/Safari-attest gis. Dette hindrer ikke den eksplisitt godkjente utviklertestbaserte releaseplanen, men testgrensene må være synlige i sluttkvitteringen. Etter verifisert publisering innføres stabilitetsstopp før visningen3.november.

## Historikk

Tidligere detaljstatus, godkjente hoder og delbevis er bevart i Git på d9ca45e0 og i PR294/295/298/305. Bruk den nyeste daterte releasekvitteringen, ikke gamle «mangler migrering» eller «ikke TEST OK»-avsnitt. Ingen originalbevis eller demodata er slettet.
