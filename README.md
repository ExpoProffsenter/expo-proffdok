# Expo ProffDok

Expo ProffDok er en produksjonsapp for håndverks- og prosjektbedrifter. Løsningen støtter blant annet prosjektstyring, dokumentasjon, sjekklister, bilder, avvik, kunde-/UE-portal, garanti, befaring, Badskisse, ordinære tilbud, Butikktilbud, digital aksept og rapport/PDF.

Produksjon: https://expo-proffdok.app

Gjeldende dokumentert baseline: **Fase 42F i produksjon / Fase 42G systemadmin firmascoping i Preview-QA (15.09.2026)**.

## Teknologi

- React / Vite
- Supabase Postgres, Auth, Storage, RLS og RPC
- Supabase Edge Functions
- Resend
- Vercel
- jsPDF / pdf-lib
- GitHub

## Repository – hovedstruktur

```text
src/
├── main.jsx                 # sentral app-orkestrering
├── bootstrap.jsx
└── modules/                 # access, sales, storeCatalog, project, progress, portal, help, report m.fl.

docs/
└── architecture/            # gjeldende arkitekturkart og fasespesifikke sikkerhetsnotater

scripts/
├── critical-build-check.mjs
├── critical-sales-recovery-check.mjs
├── critical-work-profile-check.mjs
├── critical-progress-plan-check.mjs
├── critical-store-catalog-check.mjs
└── øvrige målrettede guards
```

Detaljert nå-arkitektur: [docs/architecture/EXPO_PROFFDOK_ARCHITECTURE.md](docs/architecture/EXPO_PROFFDOK_ARCHITECTURE.md)

Sales-domene: [src/modules/sales/README.md](src/modules/sales/README.md)

Internt vareregister / Fase 39B: [docs/architecture/FASE39B_INTERNAL_STORE_CATALOG.md](docs/architecture/FASE39B_INTERNAL_STORE_CATALOG.md)

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
- Vareregister-/katalogendringer vurderes mot Fase 39B-arkitekturdokumentet.
- Arbeidsprofil/systemadmin-endringer vurderes mot `critical-work-profile-check.mjs` og arkitekturkartet.
- Viktige utsatte produktvalg registreres som GitHub issue.
- Root README skal være kort og fungere som inngangsdør, ikke duplisere detaljdokumentasjon.

Ikke skriv secrets, passord, service_role keys, ERP-prisfiler eller andre sensitive verdier i README eller docs.

## Kritiske sikkerhets- og kompatibilitetsregler

- RLS og serverkontroll er sikkerhetsgrensen; frontend alene er ikke nok.
- Ikke svekk company-scoping eller bruk systemadmin/supportmodus som write-bypass.
- Aktiv arbeidsprofil/representert firma skal styre normal arbeidsflate; systemadmins brede rettigheter skal ikke blande tverrfirma-prosjekter inn i vanlig prosjektarbeid.
- Publiserte og aksepterte tilbud er immutable historikk.
- Ingen historisk backfill uten eksplisitt beslutning.
- Gamle prosjekter og prosjekter uten tilbud skal fortsatt fungere.
- Bevar Sales recovery/hydration, regelen «brukerhandling vinner» og IndexedDB-/serverbevaring av befaringsbilder og Badskisse.
- Ikke endre Storage-policyer, offentlige/private filer eller historiske URL-er uten egen migreringsplan.
- Privatkundepriser vises inkl. mva.
- Intern ERP-nettopris skal aldri lekke til kundelenke, tilbuds-PDF eller publisert Sales-historikk.
- Butikktilbud skal ikke aktivere ProffDok-prosjekt.
- Aksept-/avvisningsvarsler skal være sekundære sideutfall: en e-postfeil skal aldri reversere kundens allerede lagrede beslutning.
- `main.jsx` og store Core-filer skal bare splittes når det gir reell vedlikeholdsgevinst.

## Start her som ny utvikler

1. Les [arkitekturkartet](docs/architecture/EXPO_PROFFDOK_ARCHITECTURE.md).
2. Les [Sales README](src/modules/sales/README.md) før endringer i befaring/tilbud/aksept/Butikktilbud/recovery.
3. Les [Fase 39B](docs/architecture/FASE39B_INTERNAL_STORE_CATALOG.md) før endringer i vareregister, ERP-import eller katalogtilgang.
4. Les relevante HJELP-moduler før brukerrettede endringer.
5. Kontroller åpne GitHub issues og siste legitime `main`-SHA.
6. Kontroller Production og Supabase-status før større arbeid.
7. Endre minst mulig per runde og beskytt produksjon foran alt.
