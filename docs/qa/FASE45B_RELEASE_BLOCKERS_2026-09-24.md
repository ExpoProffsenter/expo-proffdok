# Fase 45B – gjeldende release-status

**Kontrolldato:** 24.09.2026  
**Release branch:** `fase45b-release-candidate`  
**Mål:** Production / `main`  
**Production Supabase:** `dqffxflaoyarbxyiyhop`  
**Demo Sandbox Supabase:** `ppvircenkjizeiqdxphj`

Dette dokumentet er den korte, varige statusen for Fase 45B. Repositoryet skal være tilstrekkelig handoff uten tidligere ChatGPT-samtaler.

## Kort status

Fase 45B er **ikke klar for merge til Production ennå**.

Det viktigste som nå er på plass:

- Production er fortsatt urørt av Fase 45B.
- Release-kandidaten er synket med gjeldende `main`.
- Proff vareregister / Enkel ordre er implementert med egne critical checks.
- HJELP, root README, architecture og Sales README er oppdatert.
- PR mot `main` har teknisk dokumentasjonssperre.
- Sandbox sin manglende Production-RLS/policy-baseline er reparert.

Gjenstående hovedarbeid før merge:

1. avklare/rydde Supabase branchstatus `MIGRATIONS_FAILED`
2. ferdigstille eksplisitt Production/Sandbox miljøbinding uten skjult tekstlig rewrite som eneste sannhetskilde
3. aktivere reell GitHub-beskyttelse på `main` slik at direkte push ikke kan omgå PR-sperrene
4. full manuell E2E/regresjons-QA
5. eksplisitt **PRODUCTION GODKJENT** før merge

---

## 1. Production er fortsatt ren – OK

Production har fortsatt ingen Fase 45B backend-migrasjoner/tabeller/RPC-er installert.

Production skal ikke endres før eksplisitt godkjent release.

---

## 2. Sandbox RLS/policy-paritet – RETTET 24.09.2026

Tidligere hadde Sandbox en ufullstendig sikkerhetsbaseline: store deler av Production-tabellene manglet aktiv RLS og Production-policyene.

Dette er nå reparert **kun i Sandbox**.

Følgende Sandbox-migrasjoner ble anvendt:

- `demo_sandbox_restore_production_security_helpers`
- `demo_sandbox_restore_production_rls_policies`

Kontroll etter reparasjon:

- Production public RLS-policyer: **55**
- Sandbox public RLS-policyer: **55**
- Production policy-hash: `7a6064b54f723e32c74935657d62360e`
- Sandbox policy-hash: `7a6064b54f723e32c74935657d62360e`

Det betyr at de 55 Production-policyene nå er identiske med Sandbox-policyene.

Alle Production-baseline-tabeller i Sandbox har nå RLS aktivert. Sandbox har én ekstra demo-only tabell uten RLS:

- `demo_sandbox_snapshots`

Denne tabellen har ikke direkte `anon` eller `authenticated` tabelltilgang og beholdes som Sandbox-intern demo-infrastruktur.

Manglende Production-hjelpefunksjoner som RLS-policyene er avhengige av ble også gjenopprettet med identisk funksjonsdefinisjon mot Production, blant annet:

- `expo_is_systemadmin()`
- `current_profile_company_name()`
- `current_active_company_role()`
- `current_user_has_multiple_work_profiles()`
- prosjekt-scope helpers
- fremdriftsplan access/write helpers
- Sales store-offer payload/template helpers

De nye Fase 45B-tabellene er fortsatt låst:

- `store_catalog_company_supplier_access`
- `store_catalog_user_price_access`

Begge har RLS aktiv og ingen direkte `anon`/`authenticated` SELECT.

Kritiske 45B-RPC-er er fortsatt utilgjengelige for `anon`, mens eksplisitte klient-RPC-er er tilgjengelige for `authenticated` der de skal være det.

Permanent Demo-host svarer HTTP 200 etter sikkerhetsreparasjonen.

**Status:** tidligere Sandbox RLS-blocker er lukket.

---

## 3. Sandbox branchstatus `MIGRATIONS_FAILED` – FORTSATT BLOCKER

Selve Sandbox-prosjektet er tilgjengelig og SQL fungerer, men Supabase branch metadata har tidligere rapportert `MIGRATIONS_FAILED`.

Dette må fortsatt forstås/ryddes før Sandbox erklæres som helt ren release-testflate.

Viktig: dette er nå et miljø-/migrasjonshistorikkproblem, ikke lenger et RLS/policy-paritetsproblem.

---

## 4. Proff vareregister / priser – KODE OG BACKEND RETTET

Fase 45B beskytter at Proff-katalogen ikke returnerer Ringsides interne:

- innkjøpsnetto
- innkjøpsrabatt
- DG
- påslag

`Din nto pris` er en separat proffkundeverdi med eksplisitt brukerrettighet.

Må fortsatt testes manuelt med bruker både med og uten prisrettighet.

---

## 5. Enkel ordre – KODE OG BACKEND RETTET

Løsningen støtter:

- akseptert tilbud → Enkel ordre eller ordinært prosjekt
- smal Enkel ordre-arbeidsflate
- valgfri fremdriftsplan
- valgfri FDV
- aksepterte produkter fra låst tilbudssnapshot
- prisfritt/read-only Bestillingsgrunnlag
- kundepreview før publisering
- blokkert kundeportal for ren Enkel ordre
- UE der relevant

Må fortsatt E2E-testes gjennom reell brukerflyt.

---

## 6. Miljøbinding Production / Sandbox – FORTSATT BLOCKER

RC har build-guards som kontrollerer emitted bundle, men dagens `vite.config.js` bruker fortsatt tekstlig omskriving av Production-binding til Sandbox i 45B/demo-preview.

Før release skal vi ha en eksplisitt og fail-closed miljøidentitet.

Krav:

1. Production-build skal feile ved Sandbox-binding.
2. Sandbox/Preview-build skal feile ved Production- eller blandet binding.
3. Miljøvalget skal ikke avhenge av skjult `.replaceAll()`-rewrite som eneste mekanisme.

---

## 7. Dokumentasjonssperre – RETTET

PR mot `main` med produksjonspåvirkende kode/backend/config krever samtidig oppdatering av:

- root `README.md`
- `docs/architecture/EXPO_PROFFDOK_ARCHITECTURE.md`
- relevant `src/modules/help/*`

Sales-/katalogendring krever også:

- `src/modules/sales/README.md`

Dette håndheves av:

- `scripts/critical-release-docs-check.mjs`
- GitHub `PR Core Safety`

Det kjøres også audit på push til `main`.

---

## 8. GitHub `main` er ikke fysisk beskyttet – BLOCKER FOR «ALLTID»-KRAVET

Repositoryet har per 24.09.2026 ingen branch protection/ruleset på `main`.

Dermed kan en bruker med tilstrekkelig GitHub-rettighet i prinsippet pushe direkte til `main` og omgå PR-flyten.

GitHub Action kan oppdage dette etter push, men kan ikke gjøre en allerede utført push ugjort.

For absolutt sperre må GitHub-konfigurasjonen kreve:

- Pull Request til `main`
- grønn `Core safety + critical build`
- ingen direkte push
- ingen force push

---

## 9. Manuell E2E/regresjons-QA – FORTSATT BLOCKER

Før **PRODUCTION GODKJENT** skal minst følgende gjennomføres:

1. ny bruker → godkjenning → riktig firma → riktige moduler
2. systemadmin gir leverandørtilgang/rabatt
3. firmaadmin gir `Din nto pris` bare til valgt bruker
4. proffbruker uten prisrettighet
5. proffbruker med prisrettighet
6. tilbud → kundepreview → publisering → kontrollert e-post/kundelenke
7. sluttkunde velger opsjon/alternativ → aksept
8. Enkel ordre → riktig smal arbeidsflate
9. ingen kundeportal for Enkel ordre
10. UE der relevant
11. Bestillingsgrunnlag prisfritt/read-only
12. aksepterte produkter/FDV korrekt etter alternativ
13. samme aksept som ordinært prosjekt
14. regresjon ordinær Befaring/Tilbud
15. regresjon Butikktilbud
16. regresjon Sales recovery/lazy loading/fanebytte/mobil appbytte

---

## 10. Branch-opprydding – ETTER release/opprydding

Utdaterte feature/chore/tmp-brancher skal slettes når de ikke lenger trengs.

Permanent `demo` skal beholdes.

Kjent branch som må vurderes slettet:

- `demo-fase45b-proff-enkel-ordre-clean`

---

# Releasebeslutning 24.09.2026

**IKKE MERGE PR #185 ennå.**

Sandbox RLS/policy-paritet er nå reparert og er ikke lenger blocker.

Gjenstående hovedblockere:

1. Sandbox `MIGRATIONS_FAILED` må forstås/ryddes.
2. Miljøbinding Production/Sandbox må ferdigstilles og negativtestes.
3. `main` må få reell GitHub branch protection/ruleset for å gjøre dokumentasjonssperren absolutt.
4. Full menneskelig Fase 45B E2E/regresjons-QA.

Ingen Production-migrasjon eller merge før eksplisitt **PRODUCTION GODKJENT**.
