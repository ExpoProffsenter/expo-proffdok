# Expo ProffDok – arkitekturkart

**Oppdatert:** 24.09.2026  
**Production Supabase:** `dqffxflaoyarbxyiyhop`  
**Permanent Demo Sandbox:** branch `demo`, Supabase `ppvircenkjizeiqdxphj`

Dette er det autoritative høynivåkartet for Expo ProffDok-koden i branchen dokumentet ligger i. `main` er alltid kilde til sannhet for faktisk Production-kode. En fase eller release-kandidat er først Production når den er merget til `main`, Vercel Production er verifisert og nødvendige Production-migrasjoner er kontrollert.

Repositoryet skal kunne overtas av en kvalifisert utvikler uten tilgang til tidligere ChatGPT-samtaler.

## 1. Styrende prinsipper

1. `main` er kilde til sannhet for Production-kode.
2. Produksjon beskyttes foran alt: ren `main` → feature/release-branch → Vercel Preview → eksplisitt `TEST OK` → merge → trippel Production-QA.
3. RLS/RPC/server er sikkerhetsgrensen. Frontend alene gir aldri autoritativ tilgang.
4. Publiserte tilbud, aksepterte tilbudsversjoner, signerte kontrakter og utstedte garantier er historikk og skal ikke overskrives vilkårlig.
5. Prosjekt kan opprettes uten tilbud og uten kontrakt.
6. Kontrakt er bare obligatorisk når garanti-/avtalegrunnlaget faktisk krever den.
7. Privatkundeorienterte priser vises inkl. mva.
8. Ingen historisk backfill uten eksplisitt beslutning.
9. Supportmodus/systemadmin er ikke skrive-bypass.
10. Sales recovery/hydration, lazy loading og IndexedDB-/serverbevaring av media er kritiske kontrakter.
11. Bevisst brukerhandling vinner alltid over automatisk recovery.
12. Historiske Storage-paths/URL-er flyttes ikke spontant.
13. Modulisering gjøres ved naturlige ansvargrenser; unngå over-fragmentering.
14. Fremdriftsplan er operativ prosjektdata og endrer aldri låst tilbuds-/aksepthistorikk.
15. Intern ERP-netto innkjøpspris, innkjøpsrabatt, DG og internt påslag er sikkerhetskritiske data og skal aldri lekke til proffkunde/sluttkunde.
16. Butikktilbud er separat fra prosjektflyt og skal aldri aktivere ProffDok-prosjekt.
17. Aktiv arbeidsprofil/representert firma er normalt arbeidsscope.
18. Før implementering klassifiseres miljømålet som `PRODUKSJON/PREVIEW`, `SANDBOX/DEMO` eller `BEGGE`.
19. `demo` er permanent Sandbox-branch. Godkjent kode kan flyte **main → demo**; demo-overlay/data/config skal aldri flyte **demo → main**.
20. Produksjonspåvirkende PR-er skal oppdatere HJELP, dette arkitekturkartet og root README i samme PR. GitHub CI håndhever dette før merge.

## 2. Plattform og miljøer

| Lag | Teknologi | Hovedansvar |
|---|---|---|
| Klient | React + Vite | UI, state, navigasjon og arbeidsflyt |
| Auth | Supabase Auth | Innlogging og identitet |
| Data | Supabase Postgres | Prosjekter, Sales, kontrakt, garanti, fremdrift, katalog og systemdata |
| Serverlogikk | Supabase RPC / trigger / RLS | Firmascoping, validering, låsing, portalfiltrering og katalogtilgang |
| Filer | Supabase Storage | Bilder og private/offentlige dokumenter |
| E-post | Supabase Edge Functions + Resend | Befaring, tilbud, aksept, kontrakt, portal, chat og prosjektmeldinger |
| Hosting | Vercel | Preview, Production og permanent Demo Sandbox |
| PDF | jsPDF / pdf-lib / nettleserutskrift | Rapport, tilbud, akseptbevis, garanti, kontrakt og fremdriftsdokumenter |
| Kalender | `.ics` | Enveis eksport av daterte fremdriftsøkter |

**Production**

- host: `https://expo-proffdok.app`
- branch: `main`
- Supabase: `dqffxflaoyarbxyiyhop`

**Permanent Demo Sandbox**

- branch: `demo`
- host: `https://expo-proffdok-git-demo-ringside.vercel.app`
- Supabase: `ppvircenkjizeiqdxphj`
- egen Auth/database/Storage/demodata

Sandbox er ikke automatisk sikkerhetsfasit. RLS, policies, grants og relevante RPC-ACL-er må være kontrollert mot Production-baselinen før Sandbox kan brukes som full sikkerhets-QA for en release.

## 3. Repository – hovedansvar

```text
src/main.jsx
  sentral app-/prosjektorkestrering og legacy-integrasjon

src/bootstrap.jsx
  små avgrensede bootstrap-/UX-lag

src/modules/app/
  app-shell, menyer og navigasjon

src/modules/access/
  modul-/rolletilgang, arbeidsprofiler, firma-/supportscope og admin-guards

src/modules/sales/
  forespørsel, befaring, tilbud, Butikktilbud, Proff/Enkel ordre, aksept, recovery og kontrakt

src/modules/storeCatalog/
  ERP-vareregister, proffkatalog og adminflater

src/modules/project/
  prosjektarbeidsflate og Enkel ordre-arbeidsflate

src/modules/progress/
  fremdriftsplan, eksport og kalender

src/modules/help/
  rollebasert digital HJELP

docs/architecture/
  gjeldende arkitekturkart og fasespesifikke sikkerhets-/designnotater

docs/qa/
  release-/pre-production QA

scripts/
  kritiske regresjonskontroller og merge-sperrer

supabase/
  migrasjoner og Edge Functions
```

## 4. Tilgang, firma og sikkerhetsmodell

Tilgang skal valideres server-side og bindes til riktig bruker/firma/rolle/modul.

Kjernebegreper:

- godkjent/aktiv bruker
- firma-/Sales-scope
- modulrettigheter, blant annet `projects`, `sales` og `store_offers`
- systemadministrator
- firmaadministrator
- vanlig bruker
- UE / kunde via egne portalgrunnlag

Systemadministrator kan ha brede supportrettigheter, men ordinær arbeidsflate følger valgt **Representerer**-firma. Tverrfirma-support skal være eksplisitt og skal ikke gjøre systemadmin til feil oppretter, ansvarlig eller signatar.

### 4.1 RLS/RPC

RLS er obligatorisk sikkerhetsgrense for Production-tabeller. SECURITY DEFINER-RPC-er skal ha eksplisitt `search_path` og minst mulig `EXECUTE`-flate.

Interne helper-/triggerfunksjoner skal ikke være klientkallbare bare fordi de finnes i `public` schema. Nye sensitive tabeller kan være RPC-only med RLS aktivert og direkte klientgrants revoked.

Ved release må det skilles mellom:

- **Production-baseline** – faktisk sikkerhetsfasit
- **Sandbox-paritet** – testmiljøet må matche relevant Production-RLS/ACL før sikkerhetsresultater kan sammenlignes
- **45B-tillegg** – nye RPC-er/tabeller/guards som skal migreres kontrollert til Production først etter `TEST OK`

## 5. Prosjekt og Avtalegrunnlag

Prosjekt lagres hovedsakelig i `projects.data`. Synlig fane heter **Avtalegrunnlag**; intern nøkkel `tilbud` / `data.tilbud` beholdes for bakoverkompatibilitet.

Gyldige ordinære prosjektveier:

```text
A) Direkte prosjekt uten tilbud
B) Akseptert ordinært tilbud → prosjekt uten kontrakt
C) Akseptert ordinært tilbud → egen opplastet kontrakt → prosjekt
D) Akseptert ordinært tilbud → Expo-kontrakt → prosjekt
```

Butikktilbud er ikke en prosjektvei.

Desktop bruker kollapset prosjektmeny med få hurtigvalg. Full funksjonsliste ligger fortsatt i Meny. Legacy-prosjektdata skal ikke gi gammel anbefalt rekkefølge eller gamle menyer.

## 6. Sales – ordinær Befaring/Tilbud

```text
Forespørsel
→ eventuell befaring
→ tilbudskladd
→ publisert tilbudsversjon
→ kundelenke/e-post
→ kundevalg av opsjoner
→ digital aksept
→ låst akseptbevis
→ valgfritt kontrakt/prosjekt
```

Tilbud kan opprettes uten befaring.

Kritiske Sales-kontrakter:

- tom/uhydrert kladd skal aldri overskrive nyere serverdata
- valgt eksisterende sak skal være komplett server-hydrert før editor/autosave aktiveres
- Sales-listen henter bare lett summary/metadata; full payload hentes først ved åpning av konkret sak
- summary-data skal aldri skrives tilbake som komplett payload
- publiserte/aksepterte versjoner er immutable snapshots
- kundeaksept knyttes til eksakt tilbudsversjon og valgte opsjoner
- recovery fungerer ved reload, PC-fanebytte og mobil appbytte
- også `Ny forespørsel` / `Nytt tilbud` uten `request_ref` er gyldige recovery-arbeidsbilder
- bevisst Avbryt/Tilbake/menyvalg vinner over automatisk recovery
- befaringsbilder og Badskisse skal ikke tapes ved hydrering/recovery

Detaljert Sales-kontrakt: `src/modules/sales/README.md`.

## 7. Sales – Butikktilbud

Butikktilbud er egen Sales-flyt for butikk, vare, service og mindre leveranser.

```text
Nytt Butikktilbud
→ kunde/ansvarlig/merkevare
→ tilbudsposter og avsnitt
→ valgfritt katalogsøk
→ montering/opsjoner
→ autosavet kladd
→ kundepreview
→ publisert versjon
→ kundelenke/e-post
→ aksept/avvisning
→ avsluttet Sales-sak
```

Aksept av Butikktilbud:

- oppretter ikke ProffDok-prosjekt
- oppretter ikke kontrakt
- beholder publisert versjon som låst historikk
- e-postvarsel er sekundært sideutfall og kan ikke reversere lagret kundebeslutning

Avsnitt lagres som `store_text` / gruppe og skal presenteres som overskrifter, ikke prislinjer. Montering og opsjoner beholder eksisterende Butikktilbud-kontrakt.

## 8. Fase 45B – Proff vareregister / Enkel ordre

Fase 45B introduserer en separat proffkundeløsning som gjenbruker eksisterende Sales-motor og kataloggrunnlag, uten å endre Butikktilbud til prosjektflyt.

### 8.1 Proffkatalog

En proffbruker kan bare søke varer fra leverandører firmaet eksplisitt er godkjent for.

Systemadmin styrer:

- firmaets leverandørtilgang
- firmarabatt per leverandør

Server/RPC er autoritativ for tilgang. Frontendfiltrering alene er ikke nok.

### 8.2 Prisgrenser

Tre prisbegreper må aldri blandes:

1. **Intern ERP-netto innkjøpspris** – Ringsides interne data; aldri synlig for proffkunde/sluttkunde.
2. **Din nto pris** – beregnet proffkundepris basert på tillatt salgsgrunnlag/rabatt; sensitiv per-bruker-rettighet.
3. **Kunde-/salgspris** – foreslått salgspris i proffkundens tilbud til sluttkunde og kan justeres før publisering.

Proff-RPC-er skal ikke returnere felter som intern innkjøpspris, intern rabatt, DG eller internt påslag.

Firmaadmin/Systemadmin kan styre `Din nto pris` for en godkjent aktiv bruker i riktig firma. Serveren validerer firma- og modulmedlemskap. Firmaadmin skal ikke kunne omgå firmascoping eller gi seg selv utvidet tilgang gjennom klienten.

### 8.3 Profftilbud og kundepreview

Profftilbud bruker eksisterende Sales-historikk/prinsipper:

- tilbudsposter og opsjoner
- publisert låst versjon
- kundelenke/e-post
- digital aksept

`Forhåndsvis som kunde` er read-only. Den skal vise relevant kundedata/priser, men ikke publisere, akseptere eller eksponere interne identifikatorer/prisfelt som sluttkunden ikke skal se.

### 8.4 Aksept → Enkel ordre eller prosjekt

Et akseptert profftilbud kan fortsette som:

```text
A) Enkel ordre
B) Ordinært prosjekt
```

Valget lagres server-side gjennom kontrollert mutasjon av Sales-saken.

**Enkel ordre** er bevisst minimal og skal ikke automatisk arve hele ordinær prosjektflate. Arbeidsflaten kan bruke:

- oversikt
- bilder
- relevante sjekklister
- UE-bidrag
- valgfri fremdriftsplan
- valgfri FDV
- sluttdokumentasjon etter behov

Kundeportal skal være blokkert der Enkel ordre-kontrakten krever det. UE-tilgang kan fortsatt være tillatt der den er relevant.

### 8.5 Bestillingsgrunnlag og aksepterte produkter

Bestillingsgrunnlag skal bygges fra komplett, låst akseptert tilbudsgrunnlag – ikke fra lett Sales-summary/cache.

Det skal være:

- read-only
- prisfritt
- basert på akseptert versjon og faktisk valgte alternativer
- uten intern netto innkjøpspris / `Din nto pris`

Aksepterte produkter kan seedes til Enkel ordre/prosjekt for FDV/produktgrunnlag, men sensitive prisfelt skal strippes. Dersom kunden har valgt et alternativ som erstatter grunnproduktet, skal seedingen gjenspeile faktisk akseptert produktvalg.

### 8.6 45B serverflate

45B bruker blant annet serverkontroller for:

- leverandørtilgang per firma
- nettoprisinnsyn per bruker
- proffkatalogsøk
- systemadmin-supportsøk
- valg Enkel ordre / ordinært prosjekt
- blokkering av Enkel ordre-kundeportal
- seeding av aksepterte produkter

Nye tilgangstabeller er RPC-only: RLS aktivert og direkte klienttilgang revoked.

## 9. Internt ERP-vareregister

Detaljert dokument: `docs/architecture/FASE39B_INTERNAL_STORE_CATALOG.md`.

Primær vareidentitet er leverandør + leverandørens varenummer. Leverandøralternativer kan kobles via normalisert GTIN/EAN.

Katalogen kan inneholde sensitive interne kalkulasjonsdata. Ved valg til kundetilbud skal bare tillatt kunde-/salgsgrunnlag kopieres videre.

Intern netto innkjøpspris skal aldri ligge i:

- kundens Sales-payload
- publisert tilbudsversjon
- offentlig kundelenke
- tilbuds-PDF
- akseptbevis
- Proff/Enkel ordre bestillingsgrunnlag

## 10. Publisering, kundelenke og varsling

Publiserte Sales-versjoner er snapshots. Senere kladd eller katalogpris kan ikke endre dem.

Offentlig tilbudslenke bruker høyt entropisk token og serveroppslag. Kundevisning/PDF skal bruke samme publiserte versjon og kunderelevante priser.

Aksept/avvisning lagres først. E-post er etterfølgende sideutfall og kan aldri reversere lagret beslutning.

## 11. Kontrakt

Etter ordinær aksept kan saken fortsette med Expo-kontrakt, ekstern/opplastet kontrakt eller uten kontrakt.

Signert kontrakt/PDF er privat historikk og kan synkroniseres til prosjektets Avtalegrunnlag.

Kontrakt er ikke et generelt krav for prosjektopprettelse. Den er påkrevd når garanti-/avtalegrunnlaget faktisk krever det.

## 12. Fremdriftsplan

Fremdriftsplan lagres separat i `public.project_progress_plans` og er operativ prosjektdata.

- plan skriver aldri tilbake til tilbud/aksept/kontrakt
- akseptert ordinært tilbud kan brukes som forslag til aktiviteter
- Enkel ordre kan bruke fremdriftsplan valgfritt
- Gantt/PDF er read-only eksport
- `.ics` er enveis kalender-eksport

## 13. Kunde-/UE-portal

Kunde og UE får tilgang gjennom serververifisert portalgrunnlag/koder, ikke gjennom fri direkte tabelltilgang.

Kunde kan bare se data som eksplisitt er gjort tilgjengelig. Private dokumenter og Storage-paths beholder eksisterende token-/tilgangsmodell.

Enkel ordre har egen portalguard: kundeportal skal ikke kunne oppstå ved en ren klientfeil eller gammel UI-vei.

## 14. Garanti

Dokumentert tetthetsgaranti krever blant annet:

- riktig Sopro-system
- fullførte relevante sjekklister/bilder
- ingen åpne avvik
- overtagelse/signaturer
- signert kontrakt i Avtalegrunnlag når garanti faktisk skal utstedes

Historiske garantier og låste prosjektgrunnlag skal ikke endres av senere masterdata/systemendringer.

## 15. Digital HJELP

`src/modules/help/` er gjeldende rollebasert brukerveiledning i appen.

HJELP skal beskrive dagens funksjon og roller, ikke være historisk changelog. Den skal blant annet dekke relevante deler av:

- Befaring/Tilbud og recovery
- Badskisse/media
- Butikktilbud
- Proff vareregister / Enkel ordre
- prosjektmeny/arbeidsflate
- vareregister/prisgrenser
- systemadmin/firmaadmin-oppgaver
- arbeidsprofil/representert firma

Brukerrettet produksjonsendring skal oppdatere relevant HJELP i samme PR.

## 16. Dokumentasjon som merge-kontrakt

GitHub `PR Core Safety` kjører `scripts/critical-release-docs-check.mjs` på PR-er mot `main`.

Produksjonspåvirkende kode/backend/config kan ikke merges dersom samme PR mangler:

- `README.md`
- `docs/architecture/EXPO_PROFFDOK_ARCHITECTURE.md`
- relevant fil under `src/modules/help/`

Sales-/katalogendringer krever i tillegg:

- `src/modules/sales/README.md`

Hensikten er at repositoryet alene skal forklare gjeldende løsning, sikkerhetsgrenser og brukerflyt selv om chat-historikk forsvinner.

## 17. Kritiske build-/CI-sperrer

`npm run build` kjører målrettede critical checks før Vite. Blant kontraktene som er beskyttet:

- Sales recovery og regelen «brukerhandling vinner»
- entry-resume ved PC-fanebytte/mobil appbytte
- server-first hydrering og Sales lazy loading
- Badskisse/media-recovery
- prosjekt-/mobilnavigasjon
- fremdriftsplan
- internt vareregister og Proff-katalogsikkerhet
- Enkel ordre-arbeidsflate
- read-only kundepreview
- prisfritt bestillingsgrunnlag
- arbeidsprofil/systemadmin-scope
- Demo/Test-isolasjon
- obligatorisk release-dokumentasjon

GitHub workflow `PR Core Safety` kjører både scope-isolasjon og dokumentasjonssperre mot `main` før full critical build.

Build-sperrer erstatter ikke menneskelig Preview/E2E-test.

## 18. Release-QA

Før merge til `main`:

1. branch skal være basert på gjeldende `main`
2. alle critical checks grønne
3. Vercel Preview riktig branch/SHA og `READY`
4. Production/Sandbox-binding eksplisitt kontrollert
5. relevante Supabase-migrasjoner og ACL/RLS vurdert mot Production-baseline
6. berørte gamle brukerreiser regresjonstestet
7. ny brukerreise testet ende-til-ende
8. README + arkitektur + HJELP oppdatert; Sales README ved Sales/katalogendring
9. eksplisitt `TEST OK`

Etter merge gjennomføres trippel Production-QA:

1. GitHub: eksakt `main`-SHA / forventet merge
2. Vercel: Production deployment `READY`, HTTP/runtime og riktig miljøbinding
3. Supabase + brukerreise: migrasjonsstatus/sikkerhet og representative kritiske funksjoner

Ferdige feature/chore/tmp-brancher slettes etter trygg merge/opprydding. Permanent `demo` beholdes.

## 19. Kjente miljøregler for Demo/Sandbox

- `demo` skal aldri merges til `main`.
- Demo-syntetiske data/overlays/reset-funksjoner skal ikke inn i Production.
- Production credentials/binding skal aldri bygges inn i permanent Demo.
- Preview-/release-kandidat skal ikke være avhengig av skjult tekstlig URL/key-rewrite som eneste miljøidentitet; miljøbinding skal være eksplisitt og fail-closed.
- Dersom Sandbox har svakere RLS/policies/grants enn Production, er det et QA-paritetsavvik som skal rettes i Sandbox eller eksplisitt kompenseres før sikkerhets-QA godkjennes.
