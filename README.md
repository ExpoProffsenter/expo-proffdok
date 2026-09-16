# Expo ProffDok

Expo ProffDok er en produksjonsapp for håndverks- og prosjektbedrifter. Løsningen støtter prosjektstyring, dokumentasjon, sjekklister, bilder, avvik, kunde-/UE-portal, garanti, befaring, Badskisse, ordinære tilbud, Butikktilbud, digital aksept, kontrakt og rapport/PDF.

Produksjon: https://expo-proffdok.app

**Gjeldende produksjonsbaseline:** Fase 42K, PR #155, merge 15.09.2026. Fase 42H–42J Sales-scale/recovery/prosjektnavigasjon er dermed del av Production-baseline.

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
└── modules/                 # app, access, sales, storeCatalog, project, progress, portal, help, report m.fl.

docs/
└── architecture/            # gjeldende arkitekturkart og fasespesifikke sikkerhetsnotater

scripts/
├── critical-pr-scope-guard.mjs
├── critical-build-check.mjs
├── critical-sales-recovery-check.mjs
├── critical-sales-tab-resume-check.mjs
├── critical-sales-entry-resume-check.mjs
├── critical-sales-server-hydration-check.mjs
├── critical-sales-lazy-loading-check.mjs
├── critical-work-profile-check.mjs
├── critical-project-navigation-check.mjs
└── øvrige målrettede guards
```

Detaljert nå-arkitektur: [docs/architecture/EXPO_PROFFDOK_ARCHITECTURE.md](docs/architecture/EXPO_PROFFDOK_ARCHITECTURE.md)

Sales-domene: [src/modules/sales/README.md](src/modules/sales/README.md)

Internt vareregister / Fase 39B: [docs/architecture/FASE39B_INTERNAL_STORE_CATALOG.md](docs/architecture/FASE39B_INTERNAL_STORE_CATALOG.md)

## Kritisk produksjonsarkitektur

- Sales-oversikten bruker lett summary/lazy loading; komplett sak hentes først når brukeren åpner den.
- Komplett valgt Sales-sak skal være server-hydrert før editor/autosave aktiveres.
- Ny forespørsel og nytt tilbud skal tåle PC-fanebytte og mobil appbytte også før saken har fått `request_ref`.
- Bevisst brukerhandling vinner alltid over automatisk recovery.
- Systemadmins ordinære prosjektarbeidsflate følger valgt **Representerer**-firma; brede supportrettigheter skal ikke blande firma i vanlig prosjektliste.
- Desktop prosjektarbeidsflate bruker kollapset meny med få native hurtigvalg; full funksjonsliste ligger fortsatt i Meny.
- Ordinært akseptert tilbud kan gå videre til prosjekt uten kontrakt, egen opplastet kontrakt eller Expo-kontrakt. Kontraktfunksjonen ligger i Sales-domenet og er valgfri med mindre garanti-/avtalegrunnlaget krever den.

## Permanent Demo Sandbox

Expo ProffDok har et separat, langlivet demomiljø for presentasjon og opplæring:

- branch: `demo`
- fast host: `https://expo-proffdok-git-demo-ringside.vercel.app`
- separat Sandbox-Supabase: `ppvircenkjizeiqdxphj`
- egen Auth, database, Storage, Golden/reset og fiktive/sanitiserte demodata
- `demo` skal **aldri merges til `main`**
- ordinær appkode synkroniseres kontrollert **main → demo** etter godkjent Production-verifisering når endringen også skal finnes i demo
- demo-overlay, demodata, syntetiske ressurser og sandbox-konfigurasjon skal aldri flyte **demo → main**
- demo-builden skal feile dersom Production-Supabase blir bundet inn i emitted JS

Detaljert demo-dokumentasjon ligger på `demo`-branchen.

## Utviklings- og mergepolicy

`main` er produksjonsbranch og kilde til sannhet.

Før kodeendring skal miljømål oppgis som:

- `Miljømål: PRODUKSJON/PREVIEW`
- `Miljømål: SANDBOX/DEMO`
- `Miljømål: BEGGE`

For brukerrettede produksjonsendringer:

1. Opprett feature-/hotfix-branch fra gjeldende `main`.
2. Kjør `npm run build` og relevante critical checks.
3. Test Vercel Preview på desktop og mobil der relevant.
4. Kontroller både ny funksjon og berørte eksisterende brukerreiser.
5. Ikke merge før eksplisitt `TEST OK`.
6. Etter merge: bekreft eksakt `main`-SHA, Vercel Production `READY`, HTTP/runtime og relevant Supabase-status.
7. Ved miljømål `BEGGE`: synkroniser deretter gjeldende `main` kontrollert inn i `demo` og kjør sandbox-preflight.

`PR Core Safety` kjører på pull requests mot `main` og skal stoppe Demo/Test-PR-er som samtidig forsøker å endre beskyttet kjerne.

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
- Aktiv arbeidsprofil/representert firma skal styre normal arbeidsflate.
- Publiserte og aksepterte tilbud er immutable historikk.
- Ingen historisk backfill uten eksplisitt beslutning.
- Bevar Sales recovery/hydration, lazy loading, regelen «brukerhandling vinner» og IndexedDB-/serverbevaring av befaringsbilder og Badskisse.
- Summary-data skal aldri skrives tilbake som komplett Sales-payload.
- Ikke endre Storage-policyer, offentlige/private filer eller historiske URL-er uten egen migreringsplan.
- Privatkundepriser vises inkl. mva.
- Intern ERP-nettopris skal aldri lekke til kundelenke, tilbuds-PDF eller publisert Sales-historikk.
- Butikktilbud skal ikke aktivere ProffDok-prosjekt.
- Aksept-/avvisningsvarsler skal være sekundære sideutfall: en e-postfeil skal aldri reversere kundens allerede lagrede beslutning.
- `main.jsx` og store Core-filer skal bare splittes når det gir reell vedlikeholdsgevinst.

## Start her som ny utvikler

1. Les `AGENTS.md` og `PROJECT_GUARDRAILS.md`.
2. Les [arkitekturkartet](docs/architecture/EXPO_PROFFDOK_ARCHITECTURE.md).
3. Les [Sales README](src/modules/sales/README.md) før endringer i befaring/tilbud/aksept/kontrakt/Butikktilbud/recovery/lazy loading.
4. Les [Fase 39B](docs/architecture/FASE39B_INTERNAL_STORE_CATALOG.md) før endringer i vareregister, ERP-import eller katalogtilgang.
5. Les relevante HJELP-moduler før brukerrettede endringer.
6. Kontroller åpne GitHub issues, åpne PR-er og siste legitime `main`-SHA.
7. Kontroller Production og Supabase-status før større arbeid.
8. Endre minst mulig per runde og beskytt produksjon foran alt.
