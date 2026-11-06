# Bemanningsfilm – gjenopptatt 6. november

Miljømål BEGGE, kun PR308 Preview/Sandbox fra04392220. Den allerede lagrede102s-bemanningsfilmen er gjenfunnet og integrert direkte under KS/HMS med eksisterende forvaltertilgang, kapitler/VTT/full tekst og retur. Tretten tidligere filmer/metadata og filer beholdes; totalt fjorten. Alle kildehash og åtte kodede scener er kontrollert. Lokal Sandbox-build/critical, scope/release-docs, videoregister/syntaks/whitespace PASS. Lokal native Chromium ble stoppet før første assertion av miljøets socket/ptrace-begrensning; ingen lokal native attest. Eksakt ny kandidat-CI/READY føres i PR308.

[Bevis, film-/kildelenker, testliste, begrensninger og rollback](docs/qa/STAFFING_EXPORT_HELP_VIDEO_20261106.md). PR311/e650ff74 har READY, men CI983s app-browser ble avbrutt ved15-minuttersgrensen etter over10minutters setup; åtte pakker bestod. Én isolert omkjøring av ufullførte/feilede jobber er startet etter loggkontroll. Ingen test er svekket. Ny skybrowser viser innlogging; ingen ny innlogget test påstås. Main34daef4c/demo er urørt. Ingen TEST OK, produksjonssetting, migrering eller utsending. Resten av helapp-/filmregisteret fortsetter åpent.

---

# Gjeldende Hjelp-kandidat – 6. november 2026

PR308 / `fase45b-ux-live-review-20261104`, kandidat `759adb29493968cfcdbf8538303a551271f6938e`. To nye filmer om planoppretting/redigering (2:04) og områdetelling/pause/kontroll (2:30) er koblet til eksisterende temaer og relevante tilganger. Alle elleve tidligere filmer er bevart. Vercel `dpl_kfewdwXUU5EhqxnG6NSAGgiivuKn` er READY på fast Preview, target null. Begge publiserte MP4-filer og VTT-spor er byteidentiske med originalene; publisert app er Sandbox uten Production-ref.

CI980 stoppet på feil antakelse om antall monterte hjelpevisninger i den nye tilgangstesten. Kandidaten retter bare denne testventingen og dokumenterer årsaken; app/media/backend er uendret. Eksakt kandidat-CI981/run42224836882 SUCCESS: alle ni delpakker og samlet Core safety + critical build127918754664 PASS. Filmprøven127915665986 bestod 712 faktiske Chromium-kontroller på alle13filmer, inklusive begge nye filmer, fem bredder, tekstspor, kapitler, avspilling, tilgang og nested retur/fokus. Nettleseren viser ordinær innlogging i ny økt; ingen ny innlogget manuell prøve eller fysisk Safari-test er attestert. Bevis, scope og rollback: [QA-grunnlaget](docs/qa/PLAN_AREA_HELP_INTEGRATION_20261105.md).

Production er kontrollert uendret `34daef4c`/READY. Ingen TEST OK, merge, produksjons-/demopublisering, migrering eller utsending. Senere release må omfatte PR311s relevante plan-/områdeflyt; ingen tidligere Sandbox-migrering skal kjøres på nytt. Full HR/Bolig A–Å og resten av helapp-/filmregisteret gjenstår.

---

# Historiske checkpoint

# Ny planfilm i Hjelp – kandidat 5. november

PR308/63a9bc8d har elleve filmer: ny Fremdriftsplan – visning, bemanning og PDF,120s/11kapitler, med de ti tidligere bevart. Eksakt CI977/run42063219007 SUCCESS (ni pakker + gate),565 native filmkrav og READY dpl_7PfhUMmqJRCdc4ukhiMsLp7CowvM på fast Preview/Sandbox. Ny innlogget avspilling, kapittel90s, VTT/elleve tekststeg og direkte/nestet retur/fokus er bekreftet. Scope/bevis/rollback: docs/qa/PLAN_VIEW_HELP_VIDEO_20261105.md. Ingen TEST OK/produksjon. Planoppretting/redigering og områdefilm er fortsatt neste åpne arbeid.

# Siste Hjelp-kandidat: KS/HMS samlet PDF, 5. november

Nyeste tillegg fra69181c70:102sekunders «Egne timer – felt og avbrutt utkast», ni kapitler/VTT/tekst, under eksisterende HR-tema. Ni tidligere filmer bevart. Faktisk demokonto/kildeapp284f04aa, kun lokal kladd og Avbryt/ny tom åpning; ingen lagring/filopplasting/tidtaking/innlevering/eksport. Full decode2448frames og visuell kontroll PASS, film og redigerbare kilder lagret. Ny eksakt CI/READY/native avspillingsattest føres i PR308. Scope/rollback: docs/qa/TIME_FIELDS_VIDEO_20261105.md. Ingen TEST OK eller Production-endring.

Miljømål BEGGE; bare PR308 Preview/Sandbox. Ny avgrenset film på 2:02/10 kapitler under eksisterende KS/HMS-forvaltertilgang. Alle åtte tidligere filmer beholdes. Eksakt kandidat-CI/READY/live og rollback dokumenteres i PR308 og [QA-grunnlaget](docs/qa/KSHMS_PDF_VIDEO_20261105.md). Ingen TEST OK eller produksjonssetting. HR-film v2 krever PR311s trestegsflyt og tekstkontrakt ved senere autorisert release. Hele appens dekning er fortsatt ufullstendig.

---

# Gjeldende status – 4. november 2026

Production/main er kontrollert som **34daef4c0526b93ddbd84c3bfd97fb0833d97caf**, Vercel dpl_3D5fzV9TVkidd7x7Eowg3V6hWjQ2 READY på expo-proffdok.app. Demo er oppfrisket som **fd5aafa17d0a6412bebc60b586e328d682393d8e**. Gamle gjennomførte produksjonsplaner nedenfor skal ikke kjøres på nytt.

**PR308**, fase45b-ux-live-review-20261104: Hjelp øverst, filmer under temaer, Bolig-hjelp og toolbar/fasade-rettelse. Kode a39f110c og dokumentasjonskandidat515e03b9 har grønn full CI897/898. Innlogget Sandbox-kontroll av Hjelp, faktisk filmavspilling/kapitler, nested retur og fylt Bolig-layout er utført. Denne dokumentasjonsoppdateringen endrer ingen kode.

**PR309**, fase45b-bolig-flow-qa-20261104: separat Bolig-kjernepakke med katalogventing, store UE-lister, bygg/adresse, endringsordretekst, fokusretur, klargjøringsfooter og sann lagringsstatus. CI901/902 er grønne. Siste avgrensning73c97450 (filtre etter krympet oppfrisking) kontrolleres av CI903. Preview er Sandbox; ny vert krever separat innlogging. Kjernegrense55assertions er bevart, ingen backend-/tilgangs-/utsendingsendring.

Eget fiktivt Sandbox-prosjekt er gjennomført til seks lagrede boligvalg/rom/varer og18lagrede fremdriftsaktiviteter, med bevaring av eksisterende rom, kalender/helgehopp, Gantt og boligspesifikt notat. Arkivprosjektets sjekklister returnerte nå korrekt; tidligere tynt returinnhold er ikke reprodusert. Låste overtagelsesfelt ser fortsatt redigerbare ut selv om lagringsvakten avviser endring; dette står som eget åpent presentasjonsfunn.

Nytt masseplan-videokapittel er204sekunder i godkjent mal, med redigerbare kilder. **Full Bolig A–Å, alle rolle-/underfunksjonsreiser og fysisk Safari/mobil er fortsatt ikke ferdigattestert.** Ingen ny TEST OK, produksjonsmerge eller demo-synk er utført.

[Datert QA og testgrenser](docs/qa/LIVE_DESIGN_REVIEW_20261104.md). [Video og kilder](docs/qa/BOLIG_VIDEO_PROGRESS_20261104.md). [PR308](https://github.com/ExpoProffsenter/expo-proffdok/pull/308). [PR309](https://github.com/ExpoProffsenter/expo-proffdok/pull/309).

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


### Videre QA 04.11 – avgrensede kandidater

Produksjon `main34daef4c` og demo `fd5aafa1` er urørt. PR309 (`73c97450`, CI903 grønn) er kontrollert innlogget i Sandbox: masseoppsett med 6 bevarte boliger uten overskriving, intern katalog uten lagring, HMS-byggskille, UE-filter/20–40-visning, endringsordre og fokusretur. Ingen dataendring eller utsending i denne kontrollen. PR310 (`1a3f615e`, CI909/run41884890173 alle ni pakker og sluttkontroll grønne) retter misvisende redigering/lagrevalg i låste prosjekter, i egen branch med separat kjerneprøve. PR308 får masseplanfilmen direkte under Bolig; full Bolig A–Å gjenstår. Kandidatene er separate preview-endringer og krever TEST OK før avtalt produksjonssetting. PR310s native kontroll og begrensninger finnes i egen QA-logg og PR.

## Rapportfilm – Preview-oppdatering 5. november

Samme PR308 får «Last ned statusrapport fra prosjekt» direkte under Rapport. Sju kapitler, tekstalternativ og originalfil fra kontrollert PR311-visning. Seks tidligere filmer og metadata beholdes. Full CI/READY/innlogget avspilling føres i PR308; ingen produksjon eller ny TEST OK. Rapportrettelsene i PR311 er en nødvendig releaseavhengighet. Full prosjektvideo og Bolig A–Å er fortsatt åpne.

## HR-film – Preview

PR308 får et avgrenset106s/9kapitlers kapittel om eksisterende samtale, samlet møte/tiltak og referat/retur. Film og redigerbare kilder er levert; metadata/avspiller/tilgang testes i samme Hjelp. Sju tidligere filmer beholdes. PR311s trestegsflyt er releaseavhengighet. Ingen TEST OK eller produksjonssetting. Se docs/qa/HR_CONVERSATION_HELP_VIDEO_20261105.md og fersk PR308-status.


HR-film revisjon2: ni nye faktiske Sandbox-bilder fra ddffddae etter10000/2000tekstgrenser, samme106s/9kapitler/PROFFDOK-VIDEO-1.0 og uten lyd. V1 og alle sju tidligere filmer beholdes. Full decode/visuell kontroll PASS; siste eksakte Hjelp-CI/READY/live-avspilling føres i PR308. [Filmgrunnlag](docs/qa/HR_CONVERSATION_HELP_VIDEO_20261105.md). Ingen TEST OK/Production.
