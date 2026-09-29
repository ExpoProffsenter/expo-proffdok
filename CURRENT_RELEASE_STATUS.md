# Gjeldende release-status – 29.09.2026

## Production

- `main` er deployet på https://expo-proffdok.app fra merge av PR #200. Vercel Production er `READY`, appen svarte 200 OK, og den avgrensede runtime-kontrollen fant ingen error/fatal.
- Supportmodus-rettelsen i PR #200 er ferdig og ikke del av dette arbeidet.

## Aktiv endring: mobil Prissøk og strekkodeskanning

- Branch: `fase45b-mobile-price-search-barcode`, fra gjeldende `main`. PR #201 er åpen som draft og ikke merget.
- Miljømål: **BEGGE**. Først Vercel Preview mot Sandbox `ppvircenkjizeiqdxphj`; Production og permanent Demo er urørt.
- Mobil Prissøk får `← Startside` gjennom eksisterende close-flyt, og strekkodeskanning fyller bare EAN/GTIN i eksisterende read-only RPC-søk. Desktop, prisrettigheter, database og lagring er ikke endret.
- ZXing lastes ved behov på mobil. Bakre kamera foretrekkes; kamerasporet frigjøres ved treff, avbrudd, navigasjon og når appen går i bakgrunnen. Manuell inntasting er fallback. Ingen bilder eller videodata lagres eller lastes opp.
- Målrettet critical check, full critical-suite, Sandbox-bundet build, release-dokumentasjonsguard og diff-kontroll er grønne. GitHub `PR Core Safety` er `completed/success` for siste commit.
- PR #201s Vercel Preview er `READY`, `target=null`, og bygges fra siste branch-commit. Deployet JS inneholder Sandbox-ref og ingen Production-ref.
- I faktisk innlogget Preview ga EAN `9900000000004` ett treff på «DEMO – Svedbergs servantskap 80 cm». Desktop Startside gikk tilbake til den opprinnelige Startsiden, og den midlertidige arbeidslisten var fortsatt tilgjengelig. Fysisk mobilkamera er ikke verifisert av agenten.

## Åpent og neste handling

- Kenneth må teste PR #201 på fysisk iPhone/Android: åpne Prissøk, gå til Startside, åpne igjen, åpne/avbryt skanner, skann kjent Sandbox-EAN `9900000000004`, test nektet kameratillatelse og manuell inntasting.
- Vent på uttrykkelig `TEST OK`. PR-en skal ikke merges til `main` og Production uten separat `PRODUCTION GODKJENT` for denne PR-en. Etter Production-QA kan `main` synkroniseres kontrollert til permanent `demo`.
