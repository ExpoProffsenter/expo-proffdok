# Expo ProffDok

Expo ProffDok er en produksjonsapp for håndverks- og prosjektbedrifter. Løsningen støtter prosjektstyring, dokumentasjon, sjekklister, bilder, avvik, kunde-/UE-portal, garanti, befaring, Badskisse, ordinære tilbud, Generelt tilbud, digital aksept, kontrakt og rapport/PDF.

Produksjon: https://expo-proffdok.app

**Gjeldende Production-baseline:** `main`. Pågående Fase 45B ligger på en separat, `main`-basert release-branch og er ikke Production før eksplisitt godkjenning og merge.

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

## Fase 45B – Proff, Generelt tilbud og Enkel ordre

- Tilgang til Expo ProffDok forutsetter at virksomheten kjøper og benytter SoPro-produkter i relevant omfang, slik gjeldende brukervilkår beskriver.
- Kun Systemadministrator kan aktivere Proff / Enkel ordre for et eksternt firma og styre firmaets leverandører og leverandørrabatter.
- Ekstern proffkunde søker bare i godkjente leverandører. Ringsides interne innkjøps-/nto-pris, innkjøpsrabatt, DG og påslag skal aldri eksponeres.
- «Din nto pris» er en egen bruker- og firmascopet rettighet. Firmaadmin kan administrere egne brukere, men kan ikke gi rettigheten til seg selv. Intern Ringside-nto krever fortsatt eksplisitt `view_internal_net_prices`.
- Den synlige betegnelsen er **Generelt tilbud**. Teknisk legacy-identitet beholdes der det er nødvendig, og historiske Butikktilbud skal fortsatt åpnes og fungere.
- Etter aksept av et Generelt tilbud kan firmaet velge **Enkel ordre** eller ordinært prosjekt. Akseptert versjon og valgte alternativer er låst bestillingsgrunnlag.
- Enkel ordre bruker en lett prosjektmotor med produkter, bilder, relevante sjekklister, UE og sluttdokumentasjon. Fremdriftsplan og FDV er valgfrie. Kundeportal er blokkert.
- Kundepreview åpnes separat og er read-only. Den skal ikke publisere, sende e-post eller kunne akseptere tilbudet.
- Tilbudsmaler kan gjenbruke varige app-/Storage-bilder på poster og opsjoner. Midlertidige nettleserbilder og kundespesifikke PDF-vedlegg følger ikke malen.
- Kontrakt-PDF holder sammenhengende avsnitt samlet og bryter opsjonskort kontrollert uten å skille beskrivelse fra pris.

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

Clean Fase 45B-Preview bygges fra release-branchen mot samme isolerte Sandbox-Supabase, men er ikke permanent Demo og skal ikke hente produktregler eller kode tilbake fra `demo`.

Sandboxen har egen demo-/kursmigrasjonslinje og skal aldri branch-merges til Production. Production-endringer skal komme fra versjonerte migrasjoner i en `main`-basert og godkjent release.

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

Når Fase 45B er merget og Production er trippelverifisert, ryddes midlertidige release-/feature-/backup-brancher. Sluttbildet skal være kun `main` og permanent `demo` i GitHub, og kun Production/default samt `demo-sandbox` i Supabase. Opprydding skal aldri skje før godkjent Production-QA.

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
- Prosjekter åpnet på tvers av firma i eksplisitt Systemadmin-supportmodus er skrivebeskyttet; kontroll og PDF er tillatt, mens lagring, kopiering, låsing og øvrige endringer er blokkert.
- Aktiv arbeidsprofil/representert firma skal styre normal arbeidsflate.
- Publiserte og aksepterte tilbud er immutable historikk.
- Ingen historisk backfill uten eksplisitt beslutning.
- Bevar Sales recovery/hydration, lazy loading, regelen «brukerhandling vinner» og IndexedDB-/serverbevaring av befaringsbilder og Badskisse.
- Summary-data skal aldri skrives tilbake som komplett Sales-payload.
- Ikke endre Storage-policyer, offentlige/private filer eller historiske URL-er uten egen migreringsplan.
- Privatkundepriser vises inkl. mva.
- Intern ERP-nettopris skal aldri lekke til kundelenke, tilbuds-PDF eller publisert Sales-historikk.
- Historiske Butikktilbud beholder tidligere avslutning og skal ikke endres. Nye Generelle tilbud kan etter aksept aktiveres som Enkel ordre eller ordinært prosjekt.
- Aksept-/avvisningsvarsler skal være sekundære sideutfall: en e-postfeil skal aldri reversere kundens allerede lagrede beslutning.
- `main.jsx` og store Core-filer skal bare splittes når det gir reell vedlikeholdsgevinst.

## Start her som ny utvikler

1. Les `AGENTS.md` og `PROJECT_GUARDRAILS.md`.
2. Les [arkitekturkartet](docs/architecture/EXPO_PROFFDOK_ARCHITECTURE.md).
3. Les [Sales README](src/modules/sales/README.md) før endringer i befaring/tilbud/aksept/kontrakt/Generelt tilbud/recovery/lazy loading.
4. Les [Fase 39B](docs/architecture/FASE39B_INTERNAL_STORE_CATALOG.md) før endringer i vareregister, ERP-import eller katalogtilgang.
5. Les relevante HJELP-moduler før brukerrettede endringer.
6. Kontroller åpne GitHub issues, åpne PR-er og siste legitime `main`-SHA.
7. Kontroller Production og Supabase-status før større arbeid.
8. Endre minst mulig per runde og beskytt produksjon foran alt.
