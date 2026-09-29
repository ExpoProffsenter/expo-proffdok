# Gjeldende release-status – 29.09.2026

## Production

- `main` er deployet på https://expo-proffdok.app fra merge av PR #200. Vercel Production er `READY`, appen svarte 200 OK, og den avgrensede runtime-kontrollen fant ingen error/fatal.
- Supportmodus-rettelsen i PR #200 er ferdig og ikke del av dette arbeidet.

## Aktiv endring: mobil Prissøk og strekkodeskanning

- Branch: `fase45b-mobile-price-search-barcode`, fra gjeldende `main`.
- Miljømål: **BEGGE**. Først Vercel Preview mot Sandbox `ppvircenkjizeiqdxphj`; Production og permanent Demo er urørt.
- Mobil Prissøk får `← Startside` gjennom eksisterende close-flyt, og strekkodeskanning fyller bare EAN/GTIN i eksisterende read-only RPC-søk. Desktop, prisrettigheter, database og lagring er ikke endret.
- ZXing lastes ved behov på mobil. Bakre kamera foretrekkes; kamerasporet frigjøres ved treff, avbrudd, navigasjon og når appen går i bakgrunnen. Manuell inntasting er fallback. Ingen bilder eller videodata lagres eller lastes opp.
- Målrettet critical check, full critical-suite, Sandbox-bundet build og diff-kontroll er grønne lokalt. Den tidligere branch-Preview er READY og ble bekreftet bundet til Sandbox; en ny Preview for siste kamerarydding/dokumentasjon skal verifiseres etter push.
- I faktisk innlogget Preview ga manuell EAN `4005734815018` ett vare-/pristreff. Desktop Startside gikk tilbake til den opprinnelige Startsiden, og den midlertidige arbeidslisten var fortsatt tilgjengelig. Fysisk mobilkamera er ikke verifisert av agenten.

## Åpent og neste handling

- Opprett draft-PR og kontroller ny Preview, GitHub CI, Sandbox-binding og avgrenset diff.
- Kenneth må teste på fysisk iPhone/Android: åpne Prissøk, gå til Startside, åpne igjen, åpne/avbryt skanner, skann kjent EAN, test nektet kameratillatelse og manuell inntasting.
- Vent på uttrykkelig `TEST OK`. PR-en skal ikke merges til `main` og Production uten separat `PRODUCTION GODKJENT` for denne PR-en. Etter Production-QA kan `main` synkroniseres kontrollert til permanent `demo`.
