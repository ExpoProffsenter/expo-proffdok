# Fase 45B – gjeldende release-status

**Kontrolldato:** 24.09.2026  
**Release branch:** `fase45b-release-candidate`  
**Mål:** Production / `main`  
**Production Supabase:** `dqffxflaoyarbxyiyhop`  
**Demo Sandbox Supabase:** `ppvircenkjizeiqdxphj`

Dette dokumentet er den korte, varige statusen for Fase 45B. Repositoryet skal være tilstrekkelig handoff uten tidligere ChatGPT-samtaler.

## Kort status

Fase 45B er teknisk langt ryddigere, men skal **ikke merges til Production før manuell slutt-QA og eksplisitt PRODUCTION GODKJENT**.

På plass nå:

- Production er fortsatt urørt av Fase 45B.
- Release-kandidaten er 0 commits bak gjeldende `main`.
- Proff vareregister / Enkel ordre er implementert med egne critical checks.
- Sandbox har samme 55 Production-RLS-policyer som Production.
- Production/Sandbox velges nå eksplisitt i builden; generisk `.replaceAll()` styrer ikke lenger miljøidentiteten.
- GitHub Core Safety + full critical build er grønn på RC.
- Vercel Fase 45B Preview er READY og svarer HTTP 200.
- HJELP, root README, architecture og Sales README er oppdatert.
- PR mot `main` har teknisk dokumentasjonssperre.

Det som faktisk gjenstår før merge:

1. reell GitHub-beskyttelse av `main` slik at direkte push ikke kan omgå PR-sperrene
2. full manuell E2E/regresjons-QA av Fase 45B og eksisterende kritiske brukerreiser
3. siste Production-preflight og eksplisitt **PRODUCTION GODKJENT**

---

## 1. Production er fortsatt ren – OK

Production har fortsatt ingen Fase 45B backend-migrasjoner/tabeller/RPC-er installert.

Production skal ikke endres før eksplisitt godkjent release.

---

## 2. Sandbox RLS/policy-paritet – RETTET OG VERIFISERT

Tidligere hadde Sandbox en ufullstendig sikkerhetsbaseline. Dette er reparert **kun i Sandbox**.

Sandbox-migrasjoner brukt til reparasjonen:

- `demo_sandbox_restore_production_security_helpers`
- `demo_sandbox_restore_production_rls_policies`

Etterkontroll:

- Production public RLS-policyer: **55**
- Sandbox public RLS-policyer: **55**
- Production policy-hash: `7a6064b54f723e32c74935657d62360e`
- Sandbox policy-hash: `7a6064b54f723e32c74935657d62360e`

De 55 Production-policyene er dermed identiske med Sandbox-policyene.

Alle Production-baseline-tabeller i Sandbox har RLS aktivert. Sandbox har én ekstra demo-only tabell uten RLS, `demo_sandbox_snapshots`; den har ikke direkte `anon` eller `authenticated` tabelltilgang og beholdes som Sandbox-intern demo-infrastruktur.

De nye Fase 45B-tabellene `store_catalog_company_supplier_access` og `store_catalog_user_price_access` har fortsatt RLS aktiv og ingen direkte `anon`/`authenticated` SELECT.

Permanent Demo-host svarer HTTP 200 etter reparasjonen.

**Status:** lukket.

---

## 3. Supabase branchstatus `MIGRATIONS_FAILED` – KJENT HISTORISK METADATA, IKKE LENGER RELEASE-BLOCKER

Supabase viser fortsatt `MIGRATIONS_FAILED` på den permanente `demo-sandbox`-branchen, selv om preview-prosjektet er `ACTIVE_HEALTHY`, SQL fungerer og faktisk schema/sikkerhet er verifisert.

Årsaken er historisk migrasjonsdrift: den permanente demoen ble opprettet med egen snapshot-/demo-baseline og har senere fått kontrollerte demo- og 45B-migrasjoner. Statusflagget stammer fra denne branchhistorikken.

Å nullstille/rebase hele den permanente demoen bare for å få bort etiketten vil kunne slette eller endre demooppsettet og skal derfor ikke gjøres som del av 45B-release.

**Styrende regel:** faktisk schema, RLS/policy-paritet, RPC/grants, app-helse og kontrollert demo-preflight er fasit – ikke den gamle branch-etiketten alene.

**Status:** kjent metadata; overvåkes, men blokkerer ikke release alene.

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

## 6. Miljøbinding Production / Sandbox – RETTET OG AUTOMATISK VERIFISERT

Tidligere valgte Preview Sandbox gjennom generisk tekstlig `.replaceAll()` av Production URL/key. Dette er fjernet som miljøvalg.

Ny løsning:

- `scripts/environmentBindingCore.mjs` bestemmer eksplisitt backend-target: `production` eller `sandbox`.
- `vite.config.js` bruker dette ene targetet til å injisere korrekt Supabase-binding.
- Fase 45B/demo Preview klassifiseres som Sandbox.
- Vercel Production klassifiseres som Production.
- feil eksplisitt kombinasjon hard-feiler.
- emitted bundle kontrolleres slik at Production og Sandbox aldri kan være blandet.
- `scripts/critical-environment-binding-check.mjs` kjører i både critical-check og build.

Legacy `src/main.jsx` inneholder fortsatt de gamle Production-literalene. Vite har derfor en smal, fail-closed kompatibilitetsadapter som kun erstatter akkurat den kjente `createClient`-bootstrapen med eksplisitte env-tokens. Adapteren velger ikke miljø; den feiler dersom bootstrapen endres uventet. Den generiske `.replaceAll()`-mekanismen er borte.

Verifisert 24.09.2026:

- GitHub `Core safety + critical build`: **SUCCESS**
- Vercel Fase 45B Preview på gjeldende RC: **READY**
- Preview svarer HTTP **200**
- negative self-tests blokkerer Production+Sandbox og Sandbox+Production feilbinding

**Status:** tidligere miljøblocker er lukket.

Fremtidig opprydding kan flytte `src/main.jsx` helt over til direkte `import.meta.env` og fjerne den smale legacy-adapteren, men dette er ikke nødvendig for 45B-sikkerheten.

---

## 7. Dokumentasjonssperre – RETTET

PR mot `main` med produksjonspåvirkende kode/backend/config krever samtidig oppdatering av:

- root `README.md`
- `docs/architecture/EXPO_PROFFDOK_ARCHITECTURE.md`
- relevant `src/modules/help/*`

Sales-/katalogendring krever også `src/modules/sales/README.md`.

Dette håndheves av `scripts/critical-release-docs-check.mjs` og GitHub `PR Core Safety`.

Det kjøres også audit på push til `main`.

---

## 8. GitHub `main` er ikke fysisk beskyttet – GJENSTÅR

Repositoryet har per 24.09.2026 ingen branch protection/ruleset på `main`.

Dermed kan en bruker med tilstrekkelig GitHub-rettighet i prinsippet pushe direkte til `main` og omgå PR-flyten. GitHub Action kan oppdage det etter push, men ikke fysisk stoppe pushen.

For absolutt «alltid»-sperre må GitHub-konfigurasjonen kreve:

- Pull Request til `main`
- grønn `Core safety + critical build`
- ingen direkte push
- ingen force push

**Status:** gjenstår som repository-innstilling. Kan ikke settes med den tilgjengelige GitHub-tilkoblingen.

---

## 9. Manuell E2E/regresjons-QA – HOVEDBLOCKER FØR PRODUCTION

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

De to store tekniske blockerene som ble funnet i denne rydderunden er nå lukket:

1. Sandbox-sikkerheten er brakt i paritet med Production.
2. Production/Sandbox-miljøbindingen er gjort eksplisitt og automatisk fail-closed.

Det som nå hovedsakelig gjenstår er:

1. fysisk GitHub-beskyttelse av `main`
2. full menneskelig Fase 45B E2E/regresjons-QA
3. siste Production-preflight
4. eksplisitt **PRODUCTION GODKJENT**

Ingen Production-migrasjon eller merge før dette er godkjent.
