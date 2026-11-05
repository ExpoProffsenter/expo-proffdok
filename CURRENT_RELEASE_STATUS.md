# Gjeldende release – samlet TEST OK 2. november 2026

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

## Videre helappkontroll 4. november

Ny QA/riktig kandidatstatus, hele 145-reisers inventaret og avgrenset rettelse av klipping i Generelt tilbud: [WHOLE_APP_REVIEW_20261104](docs/qa/WHOLE_APP_REVIEW_20261104.md). Arbeid fra main34daef4c i fase45b-whole-app-qa-20261104. Ingen ny TEST OK eller produksjonssetting. PR308/309/310 er fortsatt separate og umerget.

## Varetelling: områder og overtakelse – 5. november

Pågående Preview/Sandbox-arbeid i PR311: velg hylla én gang, pause/overtakelse, eierskapsrevisjon og historikk. Ingen ny TEST OK eller Production-endring. Faktisk QA, installasjonsstatus og videre prøve: [STOCKTAKE_AREAS_20261105](docs/qa/STOCKTAKE_AREAS_20261105.md).

## HR-tekstkontroll – Preview 5. november

PR311 beholder hele innlimte samtaletekster, viser tegnantall og sperrer for lang tekst før første lagringsmutasjon. Eksisterende servergrenser er fortsatt4000/600; større lengder og samlet oppfølgingsflyt gjenstår.121 syntetiske React-/modellassertions og lokal Sandbox-build PASS; kandidat-CI/livekontroll føres i PR311. [Nattgrunnlag](docs/qa/NIGHT_QA_HR_START_20261105.md). Ingen TEST OK/Production.
