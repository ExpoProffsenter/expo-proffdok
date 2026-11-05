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
