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
