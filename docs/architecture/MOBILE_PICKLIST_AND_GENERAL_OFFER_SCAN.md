# Mobil plukkliste og skanning i Generelt tilbud

Miljømål: BEGGE. Feature-branch → critical QA → Preview → TEST OK → main/Production → kontrollert main → demo.

## Plukkliste

Prissøks eksisterende fanespesifikke arbeidsliste og resume-markør beholdes. På mobil kan brukeren angi antall per vare og valgfritt manuelt Cordel-ordrenummer. Første trykk på **Lagre plukkliste** lager én kopi i samme mobils nettleser. Senere endringer lagres automatisk. **Slett plukkliste** fjerner både den lagrede kopien og den aktive arbeidslisten etter et ekstra bekreftelsestrykk. Utskrift viser ordrenummer, antall og vareidentifikatorer uten prisfelt. Registrering i Cordel gjøres manuelt.

Den lagrede kopien er nøkkelsatt med innlogget bruker-ID og aktivt firma-ID. Den er ikke synkronisert mellom enheter og bør ikke brukes som varig ordrearkiv. Lagring inneholder bare katalog-ID, leverandørvarenummer, GTIN/EAN, antall og ordrenummer. Ingen pris, rabatt, margin, bilder, kameraopptak eller tokens inngår. Maksimalt 30 ulike varer i én liste. Ved gjenåpning hentes hver vare og autoriserte prisfelt på nytt gjennom eksisterende read-only RPC. Hvis en vare ikke lenger er tilgjengelig, vises ikke den som et aktivt treff.

## Generelt tilbud

Bare den interne katalogkomponenten får en mobilknapp for skanning. Den vises først når `current_user_has_internal_store_catalog_access` tillater aktivt firmascope og `store_offers`. Eksterne Proff-brukere har separat katalogkomponent og får ikke knappen. Etter skanning fylles EAN/GTIN i den aktuelle postens/opsjonens søkefelt. Eksisterende `search_internal_store_catalog` henter treff; brukeren velger varen før dagens `onPatch` og Sales-autosave oppdaterer utkastet. Skanneren gjenbruker eksisterende bakre kamera, zoom/kameravalg og stopp ved treff, avbrytelse, bakgrunn og unmount. Ingen ny databaseflyt eller direkte Cordel-integrasjon.

Ved arbeidsprofil- eller modultilgangsendring skjules skanneren umiddelbart og intern katalogtilgang kontrolleres på nytt. Desktop viser fortsatt det ordinære varesøket.
