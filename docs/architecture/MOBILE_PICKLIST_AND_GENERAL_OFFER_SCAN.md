# Mobil plukkliste og skanning i Generelt tilbud

Miljømål: BEGGE. Feature-branch → critical QA → Preview → TEST OK → main/Production → kontrollert main → demo.

## Plukkliste

Prissøks fanespesifikke arbeidsliste og resume-markør beholdes. På mobil kan brukeren angi antall per vare og valgfritt manuelt Cordel-ordrenummer. **Lagre plukkliste** oppretter en serverlagret liste. Prissøk viser inntil tre lagrede lister for samme innloggede bruker på både PC og mobil. En åpnet liste kan endres og lagres eksplisitt med **Lagre endringer**. Sletting krever et ekstra bekreftelsestrykk og fjerner listen fra alle enheter. Utskrift av plukkliste viser ordrenummer, antall og vareidentifikatorer uten prisfelt. Registrering i Cordel gjøres manuelt.

Tabellen `mobile_store_picklists` har RLS, ingen direkte tabellrettigheter til `anon`/`authenticated`, og tre avgrensede RPC-er for eierens lister. Hver RPC krever gjeldende intern katalogtilgang og autentisert bruker. Oppretting låser brukerens profilrad og håndhever maks tre lister per bruker også ved samtidig bruk på to enheter. Oppdatering krever forventet revisjon, slik at en eldre fane ikke kan overskrive en nyere versjon. Lagring inneholder bare katalog-ID, leverandørvarenummer, GTIN/EAN, antall og ordrenummer. Ingen pris, rabatt, margin, bilder, kameraopptak eller tokens inngår. Maksimalt 30 ulike varer i én liste. Ved åpning hentes hver vare og autoriserte prisfelt på nytt gjennom eksisterende read-only RPC. Eldre lokal Preview-liste kan leses én gang og fjernes først etter en vellykket serversave. Fanens ulagrede endringer beholdes ved nettfeil.

## Generelt tilbud

Bare den interne katalogkomponenten får en mobilknapp for skanning. Den vises først når `current_user_has_internal_store_catalog_access` tillater aktivt firmascope og `store_offers`. Eksterne Proff-brukere har separat katalogkomponent og får ikke knappen. Etter skanning fylles EAN/GTIN i den aktuelle postens/opsjonens søkefelt. Eksisterende `search_internal_store_catalog` henter treff; brukeren velger varen før dagens `onPatch` og Sales-autosave oppdaterer utkastet. Skanneren gjenbruker eksisterende bakre kamera, zoom/kameravalg og stopp ved treff, avbrytelse, bakgrunn og unmount. Ingen ny databaseflyt eller direkte Cordel-integrasjon.

Ved arbeidsprofil- eller modultilgangsendring skjules skanneren umiddelbart og intern katalogtilgang kontrolleres på nytt. Skanneknappen styres av mobil CSS og finnes ikke synlig på desktop. Mobil avkryssing for automatisk oppfølging har fast, liten størrelse. Prissøk-menyen beholder siste bekreftede tilgang ved en midlertidig RPC-feil og prøver på nytt; et eksplisitt avslag eller firmascopebytte fjerner tilgangen.
