# Planoppretting og områdetelling i Hjelp – 5. november

Miljømål BEGGE; utført bare PR308 Preview/Sandbox fra `6c23091ff922d20e1bf7aced960510c5228dbf7b`. Fersk remote main `34daef4c` og PR308-baseline er kontrollert. PR311-kilde `6c223547`, app `4c5c0632`; ingen kjerne eller migrering kopieres. Scope i docs/changes/plan-area-help-video-20261105.json. Produksjon/demo/TEST OK er ikke endret.

To ferdige filmer kobles direkte under sine eksisterende temaer og i åpnet tema. Alle elleve tidligere guideposter er byteidentiske (JSON SHA256 `03d5018213e110bbbe88c016f06266bf49e4bcf99c6f5eb8e8a88603529888c8`) og gamle filer beholdes.

- Fremdriftsplan – opprett og rediger: 124s/10 kapitler/4796548bytes/SHA256 `c9f70307ca3de45c050fa25de43839a7db8eced667f51f70376028ce7a0c418c`. Samme eksisterende KS/HMS-forvalterfilter.
- Varetelling – område, pause og kontroll: 150s/11 kapitler/7337752bytes/SHA256 `4967be56f080cfa9cb8475dd6028fbce6a87768e06c313c195e9554a0bd018ef`. Synlig Prissøk og positiv eksisterende stocktake_context: samme bruker, firma-ID, enabled===true. Read-only hook; endret/forsinket/tilbakekalt kontekst testes. Ingen ny grant eller adgang til data.

Begge H264/1080p/24fps/uten lyd. Originale kapitler/VTT kopieret uendret fra de allerede leverede redigerbare kilder. Full dekoding og alle21representantscener var kontrollert i kildeetappen; denne integration endrer ingen filmbytes.

## Kontroller og begrænsninger

Den eksisterende native prøve beholder alle historiske hash-/metadata-/medie-/tilgangs-/retur-/kladdekrav. Begge nye filmer inngår i faktisk metadata/dekoding/start/spoling/slutt/VTT/tekst, fem bredder/kortskjerm/fullskjerm, søk og nested retur/fokus. Nyt stocktake-forløp krever afvisning ved pending/disabled/fremmed bruker/manglende firma/feil enabled-type/fejl og gamle svar etter nytt avslag; gjenopprettet tilgang må ikke gjenåpne video. Ingen skrive-RPC er tillatt.

Lokal native Chromium ble stoppet ved oppstart: socket()/ProcessSingleton Operation not permitted; ingen native assertion nådd. Metadata/hash og komponentbuild nåede browseropstart. Eksakt kandidat-CI og publisert Preview kontrolleres separat; gammel CI978 er kun baseline.

Fast Preview: https://expo-proffdok-git-fase45b-ux-live-review-20261104-ringside.vercel.app/?progressTest=safe . Prøv Hjelp → KS/HMS → Fremdriftsplan – opprett og rediger, og Hjelp → Prissøk og internt vareregister → Varetelling – område, pause og kontroll. Kapitler/Les filmens steg/Tilbake til veiledningen krever ingen datalagring eller utsending.

Releaseavhengighet: PR311s aktuelle plan-/områdeflyt må følge de to filmene; områdemigreringen er tidligere installert bare i Sandbox og skal ikke installeres igjen. Full KSHMS-006, fysisk mobil/Safari, overtakelse mellom to faktiske personer, HR/Bolig A–Å og resten af helappregisteret er fortsatt åpent. Ingen TEST OK/merge/produksjon.

Rollback: revert bare denne Hjelp-/film-/testpakke til6c23091f; ingen DB-steg, datareset eller sletting av testposter.

## Gjenopptatt kandidatkontroll – 6. november

GitHub-head `58a40606e5f7300a100ab63ababa166fa356183d` er bevart, Vercel `dpl_qFbcAFmLU6kUfXDq64W2v8rLP7g7` READY på fast Preview/target null. CI980/run42118719736 hadde åtte grønne delpakker, men app-browser feilet i filmprøvens nye linje92 før samlet godkjenning. Alle filmers ordinære avspilling og nye nested-returer var passert før stoppet; ingen samlet PASS utledes.

Rotårsak: prøven antok to monterte HelpCenter-instanser og fire ventende `stocktake_context`-svar etter to fokus-hendelser. HeaderHelp monterer barn først når panelet åpnes; her er bare den ordinære hjelpevisningen montert. Ventingen kunne derfor aldri fullføres. Testrettelsen fanger første og neste forespørselsgenerasjon separat, behandler nyere disabled-svar før eldre enabled-svar, og avventer React-paint før uendrede avvisnings-/medie-/kladdkrav. Ingen app-, tilgangs-, film- eller backendkode endres; ingen timeout økes eller assertion fjernes. Ett ekstra krav kontrollerer fjernet media etter det nyere avslaget.

Lokal metadata/hash/komponentbuild nådde Chromium-oppstart, men socket()/ProcessSingleton er fortsatt blokkert før første native assertion. Ingen lokal native PASS. Egen ny kandidat-CI må bekreftes; eksisterende grønne pakker er historisk bevis, ikke sluttattest for ny kandidat. Ingen Production/demo/DDL/utsending eller TEST OK.

## Sluttresultat – 6. november

Kode-/testkandidat `759adb29493968cfcdbf8538303a551271f6938e`, tree `10c49f217b9c0c0fbf4aadc027be14e369277bad`. **CI981/run42224836882 SUCCESS**: alle ni pakker og Core safety + critical build127918754664 PASS. App-browser127915665986 bekrefter **712 faktiske Chromium-kontroller** for alle13filmer: avspilling/start/kapittel/spoling/slutt/VTT/tekst, ingen autoplay/preload, nye filmer ved320/390/768/1363/1920/kortskjerm/fullskjerm, direkte/nested retur/fokus, søk, pending/avslag/fremmed bruker/feil kontekst, nyere disabled før eldre enabled, gjenopprettet tilgang uten automatisk gjenåpning og bevart foreldrekladd. Syntetisk autorisasjonstransport; ingen faktisk utsending.

**Vercel dpl_kfewdwXUU5EhqxnG6NSAGgiivuKn READY** på eksakt759adb29, fastalias og target null. Publisert `main-ZrshGgiA.js` inneholder Sandbox `ppvircenkjizeiqdxphj`, uten Production-ref. Begge publiserte MP4-er gir HTTP200/video-mp4 og eksakt byteantall/SHA256 ovenfor. VTT gir HTTP200/text-vtt,1799og2057bytes, byteidentisk kildefil. Alle13lokale MP4-hasher/byteantall og WEBVTT-filer PASS. Scope/release-docs/syntax/whitespace og145-reisers videoregister PASS.

Ny faktisk skybrowser på fastalias viser ordinær innlogging; det finnes ingen videreført økt i denne nettleseren. Ingen ny innlogget manuell Hjelp-prøve, fysisk mobil/Safari eller full modulreise attesteres. Automatisk native kontroll over er ferdig. Production er ferskt kontrollert fortsatt34daef4c/dpl_3D5fzV9TVkidd7x7Eowg3V6hWjQ2 READY. Ingen main/demo-merge, DDL, datareset, utsending eller TEST OK.

Neste: innlogget manuell kontroll av de to filmknappene på fast Preview ved neste tilgjengelige testøkt, deretter resterende helappregister/filmer. Produksjonssetting krever brukerens uttrykkelige TEST OK og kontroll av PR311-releaseavhengighetene. Tilbakeføring før release: avgrenset revert av filmtillegget til6c23091f; ingen DB-steg. Denne siste kvitteringen endrer bare dokumentasjon; kode/test/media er identisk CI981-kandidaten.
