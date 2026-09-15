# Expo ProffDok – arkitekturkart

**Fase:** 42G – systemadmin firmascoping / support-sikkerhet  
**Status:** Produksjonsbaseline t.o.m. 42F; 42G hotfix i Preview-QA  
**Dato:** 15.09.2026  
**Produksjonsbaseline før 42G:** `main` etter Fase 42F8 (`04340bc`)  
**Supabase:** `dqffxflaoyarbxyiyhop`

Dette dokumentet beskriver gjeldende arkitektur og sikkerhets-/bakoverkompatibilitetskrav som må bevares. Historiske detaljer finnes i Git og fasespesifikke arkitekturfiler.

## 1. Styrende prinsipper

1. `main` er kilde til sannhet for produksjonskode.
2. Produksjon beskyttes foran alt: feature-branch → Vercel Preview → eksplisitt `TEST OK` → merge → bekreft Production-SHA, `READY`, HTTP/runtime og relevant Supabase-status.
3. RLS/server er sikkerhetsgrensen; frontend alene gir aldri tilgang eller autoritativ validering.
4. Publiserte tilbud, aksepterte tilbudsversjoner, signerte kontrakter og utstedte garantier er historikk og skal ikke overskrives vilkårlig.
5. Prosjekt kan opprettes og eksistere uten tilbud og uten kontrakt.
6. Kontrakt er bare obligatorisk når dokumentert tetthetsgaranti faktisk skal utstedes.
7. Privatkundeorienterte priser vises inkl. mva.
8. Ingen historisk backfill uten eksplisitt beslutning.
9. Supportmodus er ikke skrive-bypass og skal ikke registrere systemadmin som feil oppretter, ansvarlig eller signatar.
10. Sales recovery/hydration og IndexedDB-sikring av befaringsbilder er kritiske kontrakter.
11. Historiske Storage-paths/URL-er flyttes ikke spontant.
12. Modulisering gjøres bare ved naturlige ansvargrenser som gir reell oversikt eller mindre risiko.
13. Brukerrettede endringer oppdaterer HJELP samme runde.
14. Fremdriftsplan er operativ prosjektdata og skal aldri endre låst tilbuds-/aksepthistorikk.
15. Vercel Preview skal være trygg testmodus for prosjektfunksjoner som ellers kan sende e-post eller skrive produksjonsdata.
16. Kalender- og PDF-eksport skal lese lagret data; eksport blir ikke ny sannhetskilde.
17. Intern ERP-nettopris er sikkerhetskritisk intern data og skal aldri inngå i kundens tilbudsgrunnlag.
18. Butikktilbud er separat fra ordinær prosjektflyt og skal aldri aktivere ProffDok-prosjekt ved aksept.
19. Aktiv arbeidsprofil/representert firma er arbeidsscope. Systemadministrator skal ikke få tverrfirma-prosjekter projisert inn i ordinær arbeidsflate bare fordi rollen har brede supportrettigheter.
20. Ved recovery/hydration vinner en eksplisitt brukerhandling alltid over automatisk gjenoppretting.

## 2. Plattform

| Lag | Teknologi | Hovedansvar |
|---|---|---|
| Klient | React + Vite | UI, state, navigasjon og arbeidsflyt |
| Auth | Supabase Auth | Innlogging og identitet |
| Data | Supabase Postgres | Prosjekter, Sales, kontrakt, garanti, fremdrift, katalog og systemdata |
| Serverlogikk | Supabase RPC/trigger/RLS | Firmascoping, validering, låsing, portalfiltrering og katalogtilgang |
| Filer | Supabase Storage | Bilder og private/offentlige dokumenter |
| E-post | Supabase Edge Functions + Resend | Befaring, tilbud, aksept, kontrakt, portal, chat og prosjektmeldinger |
| Hosting | Vercel | Preview og Production |
| PDF | jsPDF + nettleserutskrift + `pdf-lib` | Rapport, tilbud, akseptbevis, garanti, kontrakt og fremdriftsdokumenter |
| Kalender | standard `.ics` | Enveis eksport av daterte fremdriftsøkter |

Produksjon: `https://expo-proffdok.app`

## 3. Repository – hovedansvar

```text
src/main.jsx
  sentral app-/prosjektorkestrering og eldre funksjoner

src/bootstrap.jsx
  installer små, avgrensede bootstrap-/UX-lag

src/modules/access/
  modul-/rolletilgang, arbeidsprofiler, systemadmin-representasjon og support-/scope-guards

src/modules/sales/
  forespørsel, befaring, ordinært tilbud, Butikktilbud, aksept og kontrakt

src/modules/storeCatalog/
  internt ERP-vareregister, søk/import og Systemadmin-katalogflate

src/modules/progress/
  fremdriftsplan, eksport, kalender og kunde-/UE-presentasjon

src/modules/help/
  rollebasert brukerveiledning

src/modules/project/
  prosjektfunksjoner og prosjektinvolverte

docs/architecture/
  gjeldende arkitekturkart + fasespesifikke sikkerhets-/designnotater

scripts/
  kritiske pre-build-regresjonskontroller
```

## 4. Prosjekt og Avtalegrunnlag

Prosjektet lagres hovedsakelig som samlet JSON i `projects.data`. Den synlige fanen heter **Avtalegrunnlag**, mens intern nøkkel fortsatt er `tilbud` / `data.tilbud` for bakoverkompatibilitet.

Gyldige prosjektveier:

```text
A) Direkte prosjekt uten tilbud
B) Akseptert ordinært tilbud → prosjekt uten kontrakt
C) Akseptert ordinært tilbud → egen opplastet kontrakt → prosjekt
D) Akseptert ordinært tilbud → Expo-kontrakt → prosjekt
```

Avtalegrunnlag kan inneholde akseptert tilbud/akseptbevis, signert Expo-kontrakt, bedriftens egen kontrakt, andre avtaledokumenter og senere tillegg/fradrag.

Butikktilbud er ikke en prosjektvei.

## 5. Sales – ordinær Befaring/Tilbud

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

Kritiske Sales-kontrakter:

- tom/uhydrert tilbudskladd skal aldri overskrive nyere serverdata
- recovery skal fungere ved reload, dvale og appbytte
- befaringsbilder beholder IndexedDB/Storage-flyt
- publiserte/aksepterte tilbudsversjoner er immutable snapshots
- kundeaksept knyttes til eksakt versjon og valgte opsjoner
- supportmodus er ikke skrive-bypass
- `critical-sales-recovery-check.mjs` er obligatorisk del av build

### 5.1 Recovery/hydration – Fase 42F

Fase 42F strammet inn Sales-gjenoppretting etter mobil dvale, appbytte og reload. Serverdata er autoritativt utgangspunkt, mens lokal recovery brukes kontrollert for ulagret arbeid.

Kritiske regler:

- eksplisitt brukerhandling vinner alltid over automatisk recovery
- recovery skal ikke hoppe brukeren tilbake til en sak eller fane vedkommende bevisst har forlatt
- ferske serverbilder og lagret Badskisse skal flettes inn uten å overskrive nyere lokal befaring
- manglende lokal media skal ikke tolkes som beskjed om å slette servermedia
- bakgrunns-/reloadmarkører skal ikke bli ny sannhetskilde

Disse kontraktene er permanent regresjonsbeskyttet og skal vurderes ved alle endringer i Sales-navigasjon, hydrering eller media.

### 5.2 Badskisse og befaringsmedia – Fase 42A–42F

Badskisse er en mobiltilpasset del av befaringen for enkle romskisser med vegger/mål, dør/vindu og relevante baderomsobjekter. Fase 42E forbedret målsatt visning og redigering. Fase 42F sikret at lagret Badskisse og servermedia overlever recovery/hydration.

Badskisse og bilder er del av befaringsdata og skal følge samme recovery-prinsipp: serverinnhold bevares, nyere lokal brukerhandling bevares, og sammenslåing skal ikke gi stille datatap.

## 6. Sales – Butikktilbud

Butikktilbud er egen Sales-flyt for butikk, vare, service og mindre leveranser.

```text
Nytt Butikktilbud
→ kunde/ansvarlig/merkevare
→ tilbudsposter og avsnitt
→ valgfritt katalogsøk
→ knyttet montering og opsjoner
→ autosavet kladd
→ kundepreview
→ publisert versjon
→ kundelenke/e-post
→ aksept eller avvisning
→ avsluttet Sales-sak
```

Aksept av Butikktilbud:

- oppretter ikke ProffDok-prosjekt
- oppretter ikke kontrakt
- beholder publisert versjon som låst historikk
- beholder eventuell automatisk oppfølgingshistorikk

### 6.1 Tilbudsposter og avsnitt

Avsnitt lagres som `store_text` med `storeSectionMode = "group"` og representerer visuelle grupper som `Varmepumpe`, `Elektriker`, `Bad 1` osv.

Avsnitt:

- har ingen pris
- skal ikke valideres som ordinær prislinje
- skal ikke bruke prislinjenummer
- skal vises som overskrift i internvisning, kundelenke, tilbuds-PDF og akseptbevis

Felles robust deteksjon ligger i `src/modules/sales/utils/storeSectionLine.js` og støtter også eldre seksjonsmarkører.

### 6.2 Montering og opsjoner

Montering kan knyttes direkte til post og beregnes med antall/timer × enhetspris. `Kun montering` støtter frittstående arbeid.

Opsjoner støtter tillegg/oppgradering og alternativ/erstatter. Alternativ vare kan beholde samme montering, bruke ny montering eller ha ingen montering.

### 6.3 Autosave og recovery

Butikktilbud har saksspesifikk serverautosave. Kritiske regler:

- tom/stale lokal kladd får ikke overstyre servertilbud med innhold
- tom Enter-opprettet post prunes ved lagring
- avsnitt bevares gjennom normalisering som avsnitt
- Tilbake lagrer kladd uten gammel generisk valideringsdialog
- vanlig inngang til Befaring/Tilbud åpner sakslisten
- faktisk reload inne i sak kan gjenåpne samme sak

Firmascopet lokal Sales-cache kan gi rask førstevisning, men Supabase er alltid autoritativ og oppdaterer listen etter serverlasting.

## 7. Internt ERP-vareregister – Fase 39B.2

Detaljert sikkerhet og importmodell: `docs/architecture/FASE39B_INTERNAL_STORE_CATALOG.md`.

Katalogen inneholder 468 425 validerte aktive varer etter ERP-import 08.09.2026.

Tilgang krever:

1. godkjent/aktiv bruker
2. `store_offers`-modultilgang
3. faktisk firmamedlemskap i Ringside Rørleggerbedrift AS eller Bademiljø Expo

Expo Proffsenter er eksplisitt uten katalogtilgang. Org.nr. brukes ikke som sikkerhetsgrense.

Kun systemadministrator kan administrere/importere katalogen.

### 7.1 Katalogdata

Katalogen kan inneholde intern netto innkjøpspris og kalkulasjonsdata. Ved valg i tilbud kopieres bare kundeegnet snapshot og salgspris.

Intern nettopris skal aldri finnes i:

- kundens Sales-payload
- publisert tilbudsversjon
- offentlig kundelenke
- tilbuds-PDF
- akseptbevis

### 7.2 Single-copy import

Gjeldende importmodell er single-copy for å unngå dobbel full katalog og unødvendig disk/WAL-belastning.

```text
Systemadmin starter import
→ søk låses
→ TXT parses lokalt
→ gyldige batcher skrives kontrollert
→ liten aktivering
→ søk åpnes
```

Historiske publiserte/aksepterte tilbud endres ikke av ny ERP-prisfil.

### 7.3 Vareidentitet

Primær vareidentitet er leverandør + leverandørens varenummer.

Leverandøralternativer kobles via samme normaliserte GTIN/EAN. Varenummer alene brukes ikke på tvers av leverandører.

## 8. Modul-/rolle-tilgang

Modultilganger skiller blant annet:

- `projects`
- `sales`
- `store_offers`

Systemadministrator har tverrfirma-support, men dette er ikke en generell skrive-bypass.

Firmaadministrator kan delegere moduler innenfor eget firma og egne tillatelser. Butikktilbud/katalog følger egne serverkontroller.

Katalogimport er strengere enn ordinær Butikktilbud-bruk: systemadministrator-only.

### 8A. Arbeidsprofiler, representasjon og systemadmin-scope – Fase 41B / 42G

Aktiv arbeidsprofil lagres server-side. Vanlige flerfirma-brukere arbeider i valgt firma. Systemadministrator kan velge hvilket firma vedkommende **representerer**, uten at dette oppretter ordinært firmamedlemskap.

Systemadministrator har fortsatt brede serverrettigheter for legitim administrasjon/support, men den vanlige prosjektflaten skal være låst til valgt representert firma. Fra Fase 42G installeres `systemAdminProjectScopeGuard.js` før app-bootstrap. For systemadministrator legges aktiv `company_scope_id` på prosjekt-REST for lesing og eksisterende endringer/sletting. Dersom systemadministrator ikke har aktivt firma, brukes et tomt/umulig scope i stedet for å vise alle prosjekter.

Dette er et ekstra klientsikkerhetsnett, ikke erstatning for RLS. RLS/RPC/server forblir autoritativ sikkerhetsgrense. Produktretningen er at tverrfirmaarbeid skal skje ved eksplisitt valg av firma/supportkontekst, ikke ved at prosjekter fra flere firma blandes i ordinær prosjektliste.

Kritisk regresjonstest:

```text
Systemadmin primærfirma Ringside
→ velg «Representerer Expo Proffsenter»
→ ordinær prosjektflate viser/åpner bare Expo Proffsenter-prosjekter
→ Ringside-prosjekt krever eksplisitt firmabytte
```

## 9. Publisering, kundelenke og aksept

Publiserte Sales-versjoner er snapshots. En senere kladd eller katalogpris kan ikke endre en publisert versjon.

Offentlig tilbudslenke bruker høyt entropisk `publicOffer`-token og serveroppslag.

Kundevisning for Butikktilbud viser avsnitt/poster, montering, opsjoner og priser inkl. mva. Forhåndsvisning bruker samme struktur, men er read-only og tillater ikke faktisk aksept/avvisning.

Tilbuds-PDF og akseptbevis bruker samme seksjonsdeteksjon for å unngå `0 kr`-avsnitt og feil nummerering.

## 10. Automatisk oppfølging – Butikktilbud

FASE 37A2 er fortsatt egen, versjonslåst oppfølgingsmekanisme for Butikktilbud.

- ordinære tilbud følges manuelt
- Butikktilbud kan ha automatisk plan
- planen låses til publisert versjon
- aksept/avvisning/utløp/arkiv eller ny gjeldende versjon stopper gammel plan

Denne mekanismen er sensitiv/frozen med mindre endring er eksplisitt bestilt.

## 11. Kontrakt og akseptvarsling

Ordinær Sales-aksept kan gå videre til Expo-kontrakt eller ekstern kontrakt. Signert slutt-PDF er privat historikk og kan synkroniseres til prosjektets Avtalegrunnlag.

Akseptvarsling er et etterfølgende sideutfall; lagret aksept kan ikke reverseres av e-postfeil.

Viktige serverkomponenter inkluderer:

```text
accept_sales_offer(...)
sales-offer-acceptance-notify
sales_offer_acceptance_notifications
create_sales_contract(...)
sign_sales_contract_company(...)
sign_sales_contract_customer(...)
```

## 12. Fremdriftsplan – Fase 35A–35C

Fremdriftsplan lagres separat i `public.project_progress_plans` og ligger ikke inne i `projects.data`.

```text
projects.id
  1 ── 1 project_progress_plans.project_id
```

Planen er operativ prosjektdata og skriver aldri tilbake til tilbud, aksept eller kontrakt.

Et akseptert ordinært tilbud kan brukes som **forslag** til arbeidsoperasjoner. Kun valgte opsjoner tas med. Direkte prosjekter uten Sales-opphav bygger planen manuelt.

### 12.1 Arbeidsøkter

Aktiviteter kan ha flere arbeidsøkter med dato, klokkeslett og merknad. Standard ny aktivitet får første økt i valgt/synlig uke, normalt `08:00–16:00`.

### 12.2 Gantt / PDF / kalender

Eksport leser lagret plan:

- Gantt/PDF er utskrift/read-only
- `.ics` er enveis kalender-eksport
- kalenderdata skriver ikke tilbake til Expo ProffDok

### 12.3 Prosjektinvolverte og prosjektmail

Prosjektinvolverte lagres separat i `project_participants`. `project_participant_notices` brukes til varsling/sporbarhet.

Edge Function `project-participants-mailer` validerer prosjekt- og mottakertilgang server-side.

## 13. Kunde-/UE-portal

Kunde og UE får tilgang gjennom serververifisert portalgrunnlag/koder og ikke ved direkte tabelltilgang.

Kunde kan bare se fremdriftsplan når `customer_visible = true`. UE er read-only der relevant.

Private dokumenter og kundelenker må fortsatt respektere eksisterende sikker Storage-/tokenflyt.

## 14. Garanti

Dokumentert tetthetsgaranti krever blant annet:

- riktig Sopro-system
- fullførte relevante sjekklister/bilder
- ingen åpne avvik
- overtagelse/signaturer
- signert kontrakt i Avtalegrunnlag når garanti skal utstedes

Historiske utstedte garantier og låste prosjekter skal ikke endres av produktmaster eller senere systemendringer.

## 15. Systemadministrasjon

Systemadmin er kontrollsenter for:

- bruker-/firmagodkjenning
- eksplisitt firma-/supportkontekst for tverrfirmaarbeid
- modul-/rollehåndtering
- produktmaster
- appnyheter
- **internt ERP-vareregister**

Systemadmin skal ikke bruke brede rolleprivilegier som normal prosjektflate på tvers av firma. Før prosjektarbeid/support velges riktig representert firma. For vareregister skal Systemadmin vise import/status/kontrolltall og være eneste sted for prisoppdatering.

## 16. HJELP

Digital Hjelp er gjeldende brukerveiledning og skal følge rolle.

Gjeldende sentrale temaer inkluderer:

- ordinær Befaring/Tilbud og recovery
- Badskisse i befaring
- Butikktilbud som eget tema ved Befaring/Tilbud
- tilbudsposter og avsnitt
- vareregister som valgfritt oppslag
- montering/opsjoner
- autosave/recovery
- Systemadmin-ERP-import og sikkerhetsgrense
- arbeidsprofil/representert firma der rollen har flere firma

Hjelp skal beskrive gjeldende funksjon, ikke historisk changelog.

## 17. Kritiske build-sperrer

`npm run build` kjører før Vite blant annet:

```text
scripts/critical-build-check.mjs
scripts/critical-sales-recovery-check.mjs
scripts/critical-progress-plan-check.mjs
scripts/critical-store-catalog-check.mjs
scripts/critical-work-profile-check.mjs
```

Disse beskytter kjente kontrakter som:

- Sales recovery og regelen «brukerhandling vinner»
- befaringsmedia/Badskisse der dette inngår i recovery-testene
- fremdriftsplanens tilbudsimport/standardoperasjoner/kalender
- katalogsikkerhet og Butikktilbud-seksjonspresentasjon
- arbeidsprofiler, systemadmin-representasjon og 42G prosjekt-scope

Build-sperrer erstatter ikke Preview-test, men skal stoppe kjente regresjoner før deploy.

## 18. Preview-sikkerhet

Vercel Preview brukes for eksplisitt test før merge.

Prosjekt-/fremdriftsfunksjoner har egen Preview-sikkerhet som kan blokkere produksjonsmail/testdata der det er nødvendig.

Sales/Butikktilbud er produksjonskoblet mot delt Supabase og må derfor testes med tydelige testsaker. Publisering/e-post i Preview kan være reell dersom funksjonen ikke eksplisitt er blokkert.

`progressTest=safe` er Preview-sikkerhetsparameter og er ikke en del av endelig produksjonskundelenke.

## 19. Databasestørrelse og store payloads

Etter full ERP-import var målt database rundt 348–356 MB og katalog rundt 283 MB.

Sales har enkelte store historiske JSON-payloads, blant annet inline/base64-bilder. Fremtidig opprydding bør flytte nye tunge bilder til Storage, men eksisterende historikk skal ikke migreres tilfeldig.

## 20. Frosne/sensitive områder

Endres bare eksplisitt og med egen QA:

- auth/login-presentasjon
- kompakt desktop header/menu
- arbeidsprofil-/systemadmin-scoping
- publiserte/aksepterte tilbud
- aksepterte kontrakter
- offentlige kundelenker/private dokumentlenker
- RLS utenfor eksplisitt avtalt arbeid
- Edge Functions
- Fase 37A2 automatisk Butikktilbud-oppfølging
- Sales recovery/hydration
- Badskisse/bevaringen av befaringsmedia ved recovery

## 21. Utsatt videreutvikling

- NOBB/Byggtjeneste-berikelse via GTIN
- ERP-vareliste/PDF etter aksept gruppert på leverandør
- CSV/Excel-varebehov
- målrettet Storage-opprydding for fremtidige Sales-bilder
- egen kontrollert demo-/testdataflyt med reset/sletting uten å risikere ekte kundehistorikk

Disse skal gjennomføres som egne runder med samme Preview-/mergepolicy.

## 22. Før merge

Minimum:

1. Alle kritiske checks grønne.
2. Vite build grønn.
3. Preview `READY`, ingen fatale runtime-feil.
4. Ordinær Befaring/Tilbud-liste fortsatt fungerer.
5. Systemadmin: bytt mellom minst to representerte firma og bekreft at prosjektliste/åpning følger valgt firma.
6. Direkte prosjektlenke til annet firma skal ikke åpnes i feil representasjonskontekst.
7. Sales recovery: reload/dvale og eksplisitt brukerhandling kontrollert der endringen berører bootstrap/navigation.
8. Butikktilbud: redigering, autosave, Tilbake og kundepreview kontrollert ved relevante endringer.
9. Arkitektur og relevante README/HJELP-filer samsvarer med faktisk implementasjon.
10. Eksplisitt bruker-`TEST OK` før PR/merge.
