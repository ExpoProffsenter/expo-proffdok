# Systemadmin: brukeropptelling 05.11.2026

PR311 / fase45b-whole-app-qa-20261104. Miljømål BEGGE, kun Preview/Sandbox. Produksjon/main34daef4c er uendret; ingen TEST OK.

## Diagnose før rettelse

Supabase-branchoversikten bekrefter demo-sandbox=ppvircenkjizeiqdxphj under expo-proffdok. Historisk MIGRATIONS_FAILED-status fra15.09 er ikke en oppfordring om å kjøre gamle migreringer; preview_project_status er ACTIVE_HEALTHY. Ingen installasjon kjørt.

Read-only aggregat i Sandbox: Expo Proffsenter har4primærprofiler,4medlemskap,4aktive medlemskap og1aktiv firmaadmin. Ingen identitets-/kontaktdata hentet i diagnosequery. Sikkerhets-/ytelsesråd lest før undersøkelsen; ingen DDL eller rådgiverrelatert endring. Changelog og dokumentasjon kontrollert; ingen CLI-/SDK-oppgradering.

Innlogget eksisterende Preview viste Brukere:0 og Firmaadmin:Ikke satt. Oppdater supportdata ga deretter Brukere:4 og riktig firmaadmin, samt andre firmaer fra profillisten. Ingen rolle eller medlemskap endret. Et JS-varsel ved den eksisterende samlede oppdateringen ble lukket; varselteksten ble ikke registrert, så årsaken til akkurat dette varselet er ikke attestert.

Koden manglet automatisk initialisering av adminUsers for denne visningen. Den tidligere teorien om ekstra arbeidsprofiler var ikke årsaken til det observerte0-tallet: alle4har også dette primærfirmaet. Primærfirmagruppering er likevel et reelt omfang og forklares i UI. Ingen generell endring til medlemskapsbasert opptelling.

## Rettelse og kontroll

Support får separat, read-only aktørbundet brukerlesing ved åpning. Ukjent/lasting/feil vises eksplisitt; bare bekreftet tomt svar kan gi0/Ikke satt. Prosjekteier følger samme ferske katalog. Brukeradministrasjon og dens eksisterende skrivende handlinger beholdes.

Lokal faktisk React/main-prøve:39PASS. Faktisk hook, main-memo og firmarendering mot syntetisk SELECT-grense: automatisk og deaktivert lesing, venting, fire profiler, admin, prosjekteier, bekreftet tomt, feil/retry, gammel aktørrespons, tilgangsendring, tilbakekalling, gjenåpning og unmount. Ingen mutasjonsmetode finnes i transportfixturen. Testen kjøres i app-browser.

Ny full CI, eksakt deployment og innlogget automatisk opptelling må bekreftes på kandidaten. Dette er ikke en positiv ekstern portaltest, full helappattest eller produksjonssetting. Tilbakeføring med revert av avgrenset appcommit krever ingen migrering eller datareset.
