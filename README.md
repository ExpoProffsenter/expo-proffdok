# Expo ProffDok

Expo ProffDok er en produksjonsapp for håndverks- og prosjektbedrifter. Løsningen støtter prosjektstyring, dokumentasjon, sjekklister, bilder, avvik, kunde-/UE-portal, garanti, befaring, Badskisse, tilbud, Butikktilbud, Proff / Enkel ordre, digital aksept, kontrakt og rapport/PDF.

Produksjon: https://expo-proffdok.app

## Kilde til sannhet

- `main` er alltid kilde til sannhet for **Production-koden**.
- Faktisk Production-status skal verifiseres mot gjeldende `main`-SHA, Vercel Production og Production-Supabase – ikke mot eldre ChatGPT-samtaler eller et hardkodet fase-/SHA-notat.
- Dokumentasjonen i en feature-/release-branch beskriver koden i den branchen. Den blir Production-dokumentasjon først når branchen er godkjent, merget til `main` og Production er verifisert.
- Fase 45B introduserer Proff vareregister / Enkel ordre. Denne funksjonaliteten er Production-funksjonalitet først når 45B faktisk ligger på `main` og tilhørende Production-migrasjoner er verifisert.

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
├── main.jsx
├── bootstrap.jsx
└── modules/
    ├── access/
    ├── app/
    ├── help/
    ├── progress/
    ├── project/
    ├── sales/
    └── storeCatalog/

docs/
├── architecture/
└── qa/

scripts/
└── critical-*.mjs

supabase/
├── functions/
└── migrations/
```

Startdokumenter:

- [Arkitekturkart](docs/architecture/EXPO_PROFFDOK_ARCHITECTURE.md)
- [Sales README](src/modules/sales/README.md)
- [Internt vareregister / Fase 39B](docs/architecture/FASE39B_INTERNAL_STORE_CATALOG.md)
- [Fase 45B pre-production QA](docs/qa/FASE45B_PREPROD_QA.md)

## Kritisk produksjonsarkitektur

- RLS/RPC/server er sikkerhetsgrensen. Frontend alene gir aldri autoritativ tilgang.
- Sales-oversikten bruker lett summary/lazy loading; komplett sak hentes først når brukeren åpner den.
- Komplett valgt Sales-sak skal være server-hydrert før editor/autosave aktiveres.
- Ny forespørsel og nytt tilbud skal tåle PC-fanebytte og mobil appbytte også før saken har fått `request_ref`.
- Bevisst brukerhandling vinner alltid over automatisk recovery.
- Systemadmins ordinære prosjektarbeidsflate følger valgt **Representerer**-firma; brede supportrettigheter skal ikke blande firma i vanlig prosjektliste.
- Publiserte/aksepterte tilbud er immutable historikk.
- Privatkundeorienterte priser vises inkl. mva.
- Intern ERP-netto innkjøpspris, innkjøpsrabatt, DG og internt påslag skal aldri lekke til proffkunde, sluttkunde, kundelenke, PDF eller publisert Sales-historikk.
- Butikktilbud er separat og skal aldri opprette ProffDok-prosjekt.

## Fase 45B – Proff / Enkel ordre

Fase 45B bygger på eksisterende Sales- og vareregisterarkitektur uten å gjøre Butikktilbud til prosjektflyt.

Kjerneprinsipper:

- Proffkunde ser bare leverandører firmaet eksplisitt er godkjent for.
- Systemadmin administrerer firmaets leverandørtilgang og rabatt.
- `Din nto pris` er en beregnet proffkundepris og er **ikke** Ringsides interne ERP-netto innkjøpspris.
- Firmaadmin/Systemadmin kan styre hvilken godkjent bruker som får se `Din nto pris`; serveren validerer firma- og modultilgang.
- Kundepris/salgspris kan brukes som utgangspunkt i tilbud og justeres før publisering.
- `Forhåndsvis som kunde` er read-only og skal ikke publisere eller akseptere tilbud.
- Etter aksept kan saken enten bli **Enkel ordre** eller aktiveres som ordinært prosjekt.
- Enkel ordre har en bevisst smal arbeidsflate. Fremdriftsplan og FDV er valgfrie.
- Kundeportal blokkeres for Enkel ordre der 45B-kontrakten krever det; UE-flyt kan fortsatt brukes der den er relevant.
- Bestillingsgrunnlag fra akseptert tilbud er read-only og prisfritt, og skal bygges fra låst akseptert tilbudsgrunnlag.

Detaljer og regressjonskrav ligger i arkitekturkartet og `src/modules/sales/README.md`.

## Permanent Demo Sandbox

Expo ProffDok har et separat, langlivet demomiljø:

- branch: `demo`
- fast host: `https://expo-proffdok-git-demo-ringside.vercel.app`
- separat Sandbox-Supabase: `ppvircenkjizeiqdxphj`
- egen Auth, database, Storage og demodata
- `demo` skal **aldri merges til `main`**
- ordinær godkjent appkode kan synkroniseres kontrollert **main → demo** etter Production-verifisering
- demo-overlay, syntetiske data og sandbox-konfigurasjon skal aldri flyte **demo → main**

Sandbox er et test-/demomiljø, ikke automatisk sikkerhetsfasit. Før en release kan brukes som full sikkerhets-QA må relevante RLS-policyer, grants og RPC-ACL-er være verifisert mot Production-baselinen.

## Utviklings- og mergepolicy

Før kodeendring klassifiseres miljømålet som:

- `PRODUKSJON/PREVIEW`
- `SANDBOX/DEMO`
- `BEGGE`

For produksjonsendringer:

1. Start fra gjeldende `main`.
2. Undersøk eksisterende løsning og berørte kritiske kontrakter.
3. Endre minst mulig.
4. Kjør critical checks og `npm run build`.
5. Test Vercel Preview og berørte brukerreiser.
6. Oppdater HJELP, hoved-arkitektur og root README i **samme PR**.
7. Sales-/katalogendringer oppdaterer også `src/modules/sales/README.md`.
8. Ikke merge før eksplisitt `TEST OK`.
9. Etter merge: trippel Production-QA – eksakt `main`-SHA, Vercel Production `READY`/runtime og relevant Supabase-status/brukerreise.
10. Ved miljømål `BEGGE`: synkroniser deretter godkjent `main` kontrollert inn i `demo` og kjør sandbox-preflight.
11. Slett ferdige feature/chore/tmp-brancher etter verifisert merge. Permanent `demo` beholdes.

## Obligatorisk dokumentasjonssperre

Repositoryet skal kunne overtas uten tidligere ChatGPT-samtaler.

GitHub workflow `PR Core Safety` kjører `scripts/critical-release-docs-check.mjs` på PR-er mot `main`. En produksjonspåvirkende PR blokkeres dersom den ikke samtidig oppdaterer:

- `README.md`
- `docs/architecture/EXPO_PROFFDOK_ARCHITECTURE.md`
- minst én relevant fil under `src/modules/help/`

Dersom PR-en berører Sales, vareregister eller tilhørende backend, kreves også:

- `src/modules/sales/README.md`

Sperren kjøres før merge. Dokumentasjon skal altså ikke være et lovet etterarbeid etter Production-deploy.

## Kritiske sikkerhets- og kompatibilitetsregler

- Ikke svekk company-scoping eller bruk systemadmin/supportmodus som write-bypass.
- Aktiv arbeidsprofil/representert firma styrer normal arbeidsflate.
- Ingen historisk backfill uten eksplisitt beslutning.
- Bevar Sales recovery/hydration, lazy loading, regelen «brukerhandling vinner» og IndexedDB-/serverbevaring av befaringsbilder og Badskisse.
- Summary-data skal aldri skrives tilbake som komplett Sales-payload.
- Ikke endre Storage-policyer, offentlige/private filer eller historiske URL-er uten egen migreringsplan.
- Aksept-/avvisningsvarsler er sekundære sideutfall: e-postfeil skal aldri reversere kundens lagrede beslutning.
- Store Core-filer splittes bare når det gir reell vedlikeholdsgevinst.
- Secrets, passord, service-role keys, ERP-prisfiler eller andre sensitive verdier skal aldri inn i README/docs.

## Start her som ny utvikler

1. Les `AGENTS.md` og `PROJECT_GUARDRAILS.md`.
2. Les [arkitekturkartet](docs/architecture/EXPO_PROFFDOK_ARCHITECTURE.md).
3. Les [Sales README](src/modules/sales/README.md) før endringer i Befaring/Tilbud, Butikktilbud, Proff / Enkel ordre, aksept, kontrakt, recovery eller lazy loading.
4. Les [Fase 39B](docs/architecture/FASE39B_INTERNAL_STORE_CATALOG.md) før endringer i ERP-vareregister/import.
5. Les relevante HJELP-moduler før brukerrettede endringer.
6. Kontroller åpne PR-er/branches, gjeldende `main`-SHA, Vercel og Supabase før større arbeid.
7. Beskytt Production foran fart.
