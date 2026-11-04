# Rapportfilm under Hjelp – 5. november 2026

Miljømål **BEGGE**, Preview/Sandbox først. Samme arbeidsbranch/PR308. Main er ferskt bekreftet `34daef4c0526b93ddbd84c3bfd97fb0833d97caf`; ingen TEST OK, merge eller produksjonsendring.

## Avgrenset leveranse

«Last ned statusrapport fra prosjekt» legges direkte under eksisterende Rapport-tema, også i åpnet hjelpetema. Sju kapitler, VTT og tekstalternativ bruker samme native avspiller og søk. Tilgangen følger det allerede synlige Rapport-temaet; ingen ny RPC, aktivering eller rettighet. Tilbakekalt prosjekttilgang skal fjerne filmen og temaet uten automatisk gjenåpning.

Alle seks tidligere metadataoppføringer er bevart: JSON.stringify-SHA256 `3241f96288842b42751994b16feb7f92b5e6a17c2e7ac9c61dd3c7e8bb755357`. De fem originalene har i tillegg sitt tidligere uendrede vern. Tidligere MP4-/VTT-filer er ikke endret.

Ny MP4: 4 309 626 byte, 99 sekunder, 1920×1080, H264, 24fps, uten lyd. SHA256 `283eeba2eb364240fc9d6caad55b972660b6592db23e56ad1f0cf832118b3d78`. Kilde: rapportvisningen i PR311, `81204ff94c6fd3ec933fb114bedb720ac0d5e848`; bare korrigert velgerscene ble tatt om etter z-index-rettelsen. Øvrige identiske visninger ble tatt på dc097ccb. Hele sju originale demoskjermer beholdes. Godkjent PROFFDOK-VIDEO-1.0-renderer er uendret. Full dekoding av 2 376 filmruter og visuell scenekontroll er gjennomført før installasjon.

- [Film](https://chatgpt.com/library?file_id=libfile_1980d8e4fb388191ba6ede0ed4cd42d2&account_id=personal)
- [Redigerbare kilder](https://chatgpt.com/library?file_id=libfile_e2f42e71252881919e929bb76e8cf539&account_id=personal)

Filmen viser statusrapport uten ekstra KS/HMS, lokal arkivpåminnelse, nettlesernedlasting og retur. Den viser ikke garantiutstedelse, alle dokumentvalg, låst prosjekt eller hele PROJECT-016. Registerets fulle funksjonsstatus beholdes åpen, med eget avgrenset delklipp.

## Tester og faktisk miljø

Lokal full Sandbox-build PASS. De første40 faktiske metadata-/tilgangs-/hashkravene i eksisterende videoprøve PASS. Registry/scope/release-docs/whitespace PASS. Lokal Chromium har tidligere ikke kunnet starte; ingen lokal avspillingsattest gis.

Eksisterende browserprøve kjører nå alle sju faktiske MP4-filer med dekoding/start/kapittel/spoling/slutt og tekstspor. Alle gamle søk-/tilgangs-/kladd-/fokus-/feil-/retry-/fullskjerm-/kortskjermkrav beholdes. Rapportfilmen får i tillegg fem bredder, korrekt Rapport-tema, kapittelsøk, nestet retur/fokus og tilbakekalt/gjenopprettet prosjekttilgang. Full CI/eksakt head/READY og innlogget avspilling føres i PR308 etter ferdig kandidat.

## Releaseavhengighet og tilbakeføring

**PR311s viste rapportrettelser må følge med ved produksjonssetting av denne PR308-oppdateringen.** Denne Preview viser Hjelp-integrasjonen separat; den er ikke en samlet attest av PR308 og PR311s rapportmotor. Ingen rapport-/lagrings-/tilgangskjerne blandes inn i hjelpepakken.

Før merge kan PR stå umerget. Avgrenset revert av dette filmtillegget fjerner metadata, ny film/VTT og én filtergren; ingen prosjektdatareset eller migrering trengs. Seks tidligere filmer beholdes. Ingen ekte e-post, signering, ordre eller tilgang opprettes ved avspillingsprøven.
