# Expo ProffDok

Expo ProffDok er en produksjonsapp for håndverks- og prosjektbedrifter. Løsningen støtter blant annet prosjektstyring, dokumentasjon, sjekklister, bilder, avvik, kunde-/UE-portal, garanti, befaring, tilbud, digital aksept og rapport/PDF.

Produksjon: https://expo-proffdok.app

## Teknologi

- React / Vite
- Supabase Postgres, Auth, Storage, RLS og RPC
- Supabase Edge Functions
- Resend
- Vercel
- jsPDF
- GitHub

## Repository – hovedstruktur

```text
src/
├── main.jsx                 # sentral app-orkestrering
├── bootstrap.jsx
└── modules/                 # funksjonsområder som sales, project, portal, help, report m.fl.

docs/
└── architecture/            # gjeldende arkitekturkart

scripts/
├── critical-build-check.mjs
└── critical-sales-recovery-check.mjs
```

Detaljert nå-arkitektur: [docs/architecture/EXPO_PROFFDOK_ARCHITECTURE.md](docs/architecture/EXPO_PROFFDOK_ARCHITECTURE.md)

Sales-domene: [src/modules/sales/README.md](src/modules/sales/README.md)

## Utviklings- og mergepolicy

`main` er produksjonsbranch og kilde til sannhet.

For brukerrettede endringer:

1. Opprett feature-branch fra gjeldende `main`.
2. Kjør `npm run build` og relevante kritiske kontroller.
3. Test Vercel Preview på desktop og mobil der relevant.
4. Kontroller eksisterende funksjon, ny funksjon, reload/persistens og eldre data der det er relevant.
5. Ikke merge før eksplisitt `TEST OK`.
6. Etter merge: bekreft eksakt `main`-SHA, Vercel Production `READY`, HTTP 200 og runtime uten fatale feil.

Dokumentasjonsendringer uten runtimepåvirkning skal fortsatt gå kontrollert via feature-branch, men trenger ikke kunstig bruker-/UI-test dersom ingen brukerflyt er endret.

## Dokumentasjonsregel

Repositoryet skal kunne overtas av en kvalifisert utvikler uten tilgang til tidligere ChatGPT-samtaler.

- Endret arbeidsflyt, begreper, knapper, roller eller brukeropplevelse → oppdater HJELP i samme runde.
- Endret datamodell, modulansvar, Storage, RPC, RLS, sikkerhetsmodell eller større teknisk struktur → oppdater arkitekturkartet.
- Sales-endringer vurderes mot Sales README.
- Viktige utsatte produktvalg registreres som GitHub issue.
- Root README skal være kort og fungere som inngangsdør, ikke duplisere detaljdokumentasjon.

Ikke skriv secrets, passord, service_role keys eller andre sensitive verdier i README eller docs.

## Kritiske sikkerhets- og kompatibilitetsregler

- RLS og serverkontroll er sikkerhetsgrensen; frontend alene er ikke nok.
- Ikke svekk company-scoping eller bruk systemadmin/supportmodus som write-bypass.
- Publiserte og aksepterte tilbud er immutable historikk.
- Ingen historisk backfill uten eksplisitt beslutning.
- Gamle prosjekter og prosjekter uten tilbud skal fortsatt fungere.
- Bevar Sales recovery/hydration og IndexedDB-sikring av befaringsbilder.
- Ikke endre Storage-policyer, offentlig/private filer eller historiske URL-er uten egen migreringsplan.
- Privatkundepriser vises inkl. mva.
- `main.jsx` og store Core-filer skal bare splittes når det gir reell vedlikeholdsgevinst.

## Start her som ny utvikler

1. Les [arkitekturkartet](docs/architecture/EXPO_PROFFDOK_ARCHITECTURE.md).
2. Les [Sales README](src/modules/sales/README.md) før endringer i befaring/tilbud/aksept.
3. Les relevante HJELP-moduler før brukerrettede endringer.
4. Kontroller åpne GitHub issues og siste legitime `main`-SHA.
5. Kontroller Production og Supabase-status før større arbeid.
6. Endre minst mulig per runde og beskytt produksjon foran alt.
