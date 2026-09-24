# Fase 45B – release blockers og paritetsfunn

**Kontrolldato:** 24.09.2026  
**Release branch:** `fase45b-release-candidate`  
**Mål:** Production / `main`  
**Production Supabase:** `dqffxflaoyarbxyiyhop`  
**Demo Sandbox Supabase:** `ppvircenkjizeiqdxphj`

Dette dokumentet er en varig QA-handoff. Det skal leses sammen med `FASE45B_PREPROD_QA.md`, root `README.md`, hoved-arkitekturkartet og `src/modules/sales/README.md`.

## Statuskoder

- **BLOCKER** – skal være løst/verifisert før `TEST OK` og merge.
- **ÅPEN** – må avklares eller testes, men er ikke dokumentert som Production-feil ennå.
- **RETTET** – kode/migrasjon/guard finnes; må fortsatt inngå i samlet regresjons-QA.
- **PRODUCTION REN** – Production er kontrollert og har ikke 45B-endringen ennå.

## 1. Production er fortsatt uten Fase 45B backend – PRODUCTION REN

Kontroll mot Production viste at Fase 45B-migrasjonene/tabellene/RPC-ene ikke er deployet dit. Production skal forbli urørt frem til eksplisitt `TEST OK` og kontrollert release.

Dette er ønsket status før merge.

## 2. Sandbox-baseline har svakere RLS enn Production – BLOCKER

Read-only databasekontroll 24.09.2026 viste:

- Production: **0** public-tabeller med RLS avslått.
- Sandbox: **31** public-tabeller med RLS avslått.

Eksempler på sentrale tabeller som har RLS aktiv i Production, men avslått i Sandbox:

- `projects`
- `profiles`
- `sales_requests`
- `sales_offers`
- `sales_offer_versions`
- `internal_store_catalog_items`
- `user_module_access`
- `project_progress_plans`
- flere øvrige baseline-tabeller

Sandbox har samtidig brede direkte grants til `authenticated` på mange av disse tabellene. Enkelte tabeller har også `anon` SELECT. Når RLS er avslått er dette vesentlig svakere enn Production.

**Konsekvens:** En funksjonell test som lykkes i Sandbox kan skjule en firmascoping-/tilgangsfeil som Production-RLS ville stoppet. Sandbox kan derfor ikke brukes som full sikkerhetsfasit før relevant baseline-paritet er reparert/verifisert.

**Viktig:** Dette skal ikke løses ved å svekke Production. Production-baselinen er sikkerhetsfasit.

## 3. Sandbox branchstatus er `MIGRATIONS_FAILED` – BLOCKER / miljøhelse

Supabase branch metadata viser:

- branch: `demo-sandbox`
- project ref: `ppvircenkjizeiqdxphj`
- preview project status: `ACTIVE_HEALTHY`
- branch migration status: `MIGRATIONS_FAILED`

Direkte SQL fungerer, og Fase 45B-migrasjoner er registrert/applisert i Sandbox. Likevel må årsaken til branchens `MIGRATIONS_FAILED`-status avklares før Sandbox erklæres som ren release-testflate.

## 4. Nye 45B tilgangstabeller er låst ned – RETTET

Fase 45B release-hardening aktiverer RLS og revoker direkte `anon`/`authenticated`-tilgang på:

- `store_catalog_company_supplier_access`
- `store_catalog_user_price_access`

Disse er ment å være RPC-only. Dette er riktig retning og skal bevares.

## 5. Baseline RPC-ACL-paritet – RETTET, men regresjonstest kreves

`20260924123500_fase45b_baseline_acl_parity.sql` reetablerer Production-lignende ACL/search_path for sentrale eksisterende RPC-er, blant annet:

- `current_profile_is_firmaadmin()`
- `current_profile_is_systemadmin()`
- `current_sales_company_scope_id()`
- `get_my_module_access()`
- `get_sales_support_company_profile(uuid)`
- `list_sales_request_summaries(uuid)`
- `list_sales_support_companies()`
- `resolve_sales_company_scope()`
- support-scope-funksjoner

Trigger/helper `fase38a_transition_seed_modules_on_approval()` er revoket fra klientroller.

## 6. Service-role / funksjons-ACL-avvik mellom Sandbox og Production – ÅPEN

Read-only funksjonskontroll viste at flere Sandbox-funksjoner har annen `service_role` EXECUTE-status enn Production-baseline. For flere rene bruker-RPC-er kan dette være tilsiktet, men det må verifiseres at ingen Edge Function/serverflyt er avhengig av direkte service-role-kall til disse funksjonene.

Dette skal vurderes ut fra faktisk kallesti – ikke normaliseres blindt.

## 7. `search_internal_store_catalog_prices` ACL-avvik – ÅPEN

Kontrollen viste forskjell mellom Production- og Sandbox-ACL for `search_internal_store_catalog_prices(...)`.

Før release må faktisk brukerreise/kallesti fastslå om dette er:

- tilsiktet hardening i 45B, eller
- utilsiktet Sandbox-paritetsavvik.

Intern ERP-netto innkjøpspris skal uansett aldri bli tilgjengelig for Proff/sluttkunde.

## 8. 45B Proff-katalog prislekkasje – RETTET i kode/critical guard

Critical-checks beskytter at Proff-katalogkontrakten ikke returnerer Ringsides interne felter som:

- intern purchase/net price
- intern purchase discount
- gross margin / DG
- intern markup

`Din nto pris` er en separat beregnet proffkundeverdi med eksplisitt brukerrettighet.

Må fortsatt E2E-testes med bruker **med** og **uten** prisrettighet.

## 9. Enkel ordre portalguard – RETTET i kode/backend

45B har server-/arbeidsflateguard som skal hindre kundeportal for ren Enkel ordre. UE-flyt kan beholdes der den er relevant.

Dette skal testes både gjennom normal UI og mot eldre/alternative klientveier.

## 10. Enkel ordre aksepterte produkter / alternativer – RETTET i kode/backend

Aksepterte produkter seedes fra låst akseptert tilbudsgrunnlag. Sensitive prisfelt strippes. Valgt alternativ skal erstatte grunnprodukt der tilbudet definerer alternativet som erstatter.

Må E2E-verifiseres på faktisk aksept med minst ett alternativ.

## 11. Bestillingsgrunnlag – RETTET i kode/critical guard

Bestillingsgrunnlag for akseptert varetilbud skal være:

- read-only
- prisfritt
- hydrert fra komplett akseptert Sales-detalj, ikke summary-cache
- basert på faktisk valgte produkter/opsjoner

## 12. Kundepreview – RETTET i kode/critical guard

`Forhåndsvis som kunde` skal være read-only og ikke publisere eller akseptere tilbud. Kundevisningen skal ikke lekke interne pris-/produktidentifikatorer som ikke hører til kundens grunnlag.

## 13. Miljøbinding Production / Sandbox – BLOCKER

RC har build-guards, men miljøisolasjonen må fortsatt bevises med negative tester.

Krav før release:

1. Production-build skal feile dersom Sandbox-binding er til stede.
2. Fase 45B Preview/Sandbox-build skal feile ved Production-binding eller blandet binding.
3. Miljøidentitet skal være eksplisitt/fail-closed og ikke være avhengig av skjult generisk tekstlig URL/key-rewrite som eneste sannhetskilde.

Production må aldri deployes med Sandbox-Supabase – eller motsatt.

## 14. Dokumentasjon / handoff var tidligere for svak – RETTET i RC

24.09.2026 er det lagt inn en teknisk merge-sperre:

`scripts/critical-release-docs-check.mjs`

PR mot `main` med produksjonspåvirkende kode/backend/config krever samtidig endring av:

- root `README.md`
- `docs/architecture/EXPO_PROFFDOK_ARCHITECTURE.md`
- relevant `src/modules/help/*`

Sales-/katalogendring krever også:

- `src/modules/sales/README.md`

GitHub `PR Core Safety` kjører sperren mot PR-baseline. Målet er at repositoryet alene skal være tilstrekkelig handoff dersom chat-historikk forsvinner.

## 15. Menneskelig E2E før `TEST OK` – BLOCKER

Minst følgende brukerreiser skal gjennomføres på korrekt isolert Preview/Sandbox:

1. ny bruker → godkjenning → riktig firma → riktige moduler
2. systemadmin: gi leverandørtilgang/rabatt til proffirma
3. firmaadmin: flere brukere → nettoprisinnsyn bare til valgt bruker
4. proffbruker uten prisrett → varesøk uten `Din nto pris`
5. proffbruker med prisrett → korrekt `Din nto pris`, aldri Ringside ERP-netto
6. tilbud → kundepreview → publisering → faktisk e-post/kundelenke
7. sluttkunde velger opsjon/alternativ → aksept
8. velg Enkel ordre → korrekt smal arbeidsflate, ingen kundeportal
9. kontroller UE der relevant
10. bestillingsgrunnlag prisfritt/read-only
11. aksepterte produkter/FDV-grunnlag korrekt etter alternativ
12. samme aksept aktivert som ordinært prosjekt → full prosjektflyt
13. regresjon: ordinær Befaring/Tilbud
14. regresjon: Butikktilbud skal fortsatt avsluttes i Sales og aldri opprette prosjekt
15. regresjon: Sales recovery/lazy loading/fanebytte/mobil appbytte

## 16. Branch-opprydding – ETTER godkjent release

Etter verifisert merge/opprydding skal utdaterte feature/chore/tmp-brancher slettes. Permanent `demo` skal beholdes.

Kjent branch som må vurderes slettet når den ikke lenger trengs:

- `demo-fase45b-proff-enkel-ordre-clean`

## Releasebeslutning per 24.09.2026

**IKKE MERGE PR #185 ennå.**

Gjenstående hovedblockere:

1. Sandbox RLS/baseline-paritet.
2. Sandbox `MIGRATIONS_FAILED`-status må forstås/ryddes.
3. Production/Sandbox miljøbinding må bestå negative fail-closed tester.
4. Full menneskelig Fase 45B E2E/regresjons-QA.

Ingen Production-migrasjon eller merge før eksplisitt `TEST OK`.
