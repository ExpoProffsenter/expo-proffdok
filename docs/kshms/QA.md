# KS/HMS QA – trinn A

2026-10-05. Branch `feat-kshms-foundation`, baseline main `155f6c4`. Miljømål BEGGE. Kun Supabase Sandbox er endret. Trinn A er ikke full KS/HMS eller produksjonsgodkjent.

## Verifikasjonskontrakt

Firmaadmin etablerer → tilpasser → godkjenner → ansatt leser og bekrefter. Utpekt ansvarlig reviderer og signerer eksakte publiserte versjoner. Navigasjon/auth og eksisterende prosjekt-/salgssikkerhet skal fortsatt virke.

| Kontroll | Resultat og grense |
|---|---|
| Kildekapitler og rutiner | 125 sporbare rader; 105 kvalitetsoppføringer/88 personaloppføringer, 16 underemner og 4 metadatarader; 148/127 sider og begge filhash registrert. Alle 275 sider dekket av kildeintervallkontrollen. |
| Krav/kilder og produktvalg | Registrert i PLAN og de 12 selvstendige standardutkastenes referanser, kontrollert 2026-10-05. Dette er ikke ferdig forfatting av alle kildetemaer. |
| Preview-miljø | Branch-spesifikt `EXPO_BACKEND_TARGET=sandbox` satt via Vercel; feature-Preview verifiseres ved publisering. |
| Migrasjon | Håndbokfundament og avgrensede reparasjoner anvendt på Sandbox `ppvircenkjizeiqdxphj`. Ingen Production-endring eller blind branchmerge. Git-migrasjonene inneholder den endelige funksjonsdefinisjonen. |
| Database/API | `scripts/kshms-sandbox-check.sql` PASS mot faktisk `authenticated`-rolle og ferske syntetiske auth-identiteter. Alle testdata rulles tilbake. Ingen faktisk ansatt eller håndbok bekreftet. |
| Klient og eksisterende kritiske flyter | Full `EXPO_BACKEND_TARGET=sandbox npm run build` PASS med hele eksisterende critical-kjeden og ny KS/HMS-kontroll. Vite-build PASS. Eksisterende advarsel om store bundle-chunks beholdes. |
| Desktop-komponentflyt | PASS med faktisk React-modul og syntetiske RPC-svar: standardutkast, kilder/type/kontrolldato, firmatilpasning, publiseringsforhåndsvisning, godkjenning, ansattbekreftelse, ansvarlig revisjon/historikk og vesentlig ny versjon. V1-bekreftelsen beholdes; V2 vises som manglende. |
| Mobil komponent | PASS i iframe med 390 px ramme / 375 px innvendig viewport. Ingen horisontal overflow; synlige tekstfelt og knapper har minst 44 px høyde. Mobil rutinekladd beholdes ved skjul/åpning av appfane. Dette er ingen fysisk enhetstest. |
| Nettleserfeil | Ingen app-/React-feil observert i komponentflyten. Nettleserutvidelsen logger egne metadatafeil; disse er ikke appfeil. |
| Git-scope/dokumentasjon | Kontrolleres mot hele committede endringen før PR. Ingen QA-fixture eller demo-overlay skal følge feature-PR. |
| Innlogget full-app Preview / bruker TEST OK | GJENSTÅR. Komponenttesten erstatter ikke reell innlogging og serverflyt via appen. |
| Merge / Production / main → demo | IKKE GODKJENT / IKKE UTFØRT. |

SQL dekker deaktivert modul; systemadminaktivering uten automatisk innholdsinnsyn; firmaadmin grant; KS-ansvarlig kan redigere, men ikke publisere, arkivere, tildele tilgang eller utpeke ny revisjonsansvarlig; ansatt ser bare egne tildelinger uten utkast/roster; kryssfirma og feil forventet arbeidsfirma; tilbakekalt tilgang; deaktivert/ekstern bruker; stale oppstart/utkast; gamle versjoner/bekreftelser; ny versjon krever egen bekreftelse; serveravledet identitet/tid; idempotent tildeling; uforanderlige versjoner/bekreftelser/revisjoner; eksakt revisjonssnapshot, stale snapshot, ettårsgrense og avvisning av tom aktiv håndbok; kildekontrolldato i fremtiden avvises; direkte tabell/private helper/anon-adgang avvises.

Klientkontrollen dekker faktiske hook-racer ved grant-/arbeidsprofilbytte, auth-identitetsbytte før effekter, nettfeil, unmount og listener-opprydding; eksplisitt bruker-/firmabundet kladd med opprinnelig revisjon; global navigasjon bak grant, uendrede prosjektfaner; flerfaglig relevans og publisert versjonssnapshot.

## Nettleserbevis og avgrensning

Komponentkontroll i isolert QA-branch `test-kshms-handbook-ui`: desktop `dpl_2PAw3RxR6T84MXA2tnnSNxy673XD`, mobil `dpl_GZsRvceK7f8HFVLETD7dEiAAbK57`, begge READY. QA-branchens statiske fixture/telefonramme ligger **ikke** i feature-PR eller main og skal aldri merges derfra. Den inneholder bare syntetiske navn/identiteter og mock-klient; ingen reell Supabase-innlogging eller sending. Desktopbildet viser tydelig dette og forskjellen mellom gammel bekreftelse og ny versjon:

![Syntetisk komponentkontroll: v1 bekreftet, v2 mangler](reading-proof.jpg)

## Sikkerhetsrådgiver

Supabase advisors rapporterer tilsiktet INFO [RLS aktiv uten policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) og WARN [authenticated SECURITY DEFINER-funksjon](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable) for RPC-modellen. Direkte tabellprivilegier er fjernet; funksjonene har tom search_path, privat hjelpe-schema og eksplisitte auth-/firmaskope-/grant-/rollevern. Avslagene testes med faktisk authenticated-rolle, ikke bare som databaseeier. Det hevdes ikke at advisors har null funn. Legacy-funn ligger utenfor denne PR.

## Test som gjenstår før merge

Systemadmin aktiverer kun testfirma i feature-Preview/Sandbox. Firmaadmin gir ansvarlig/leser grant og lagrer flerfaglig oppstart; tilpasser og publiserer rutine. Leser bekrefter; utpekt ansvarlig reviderer. Vesentlig endring publiseres, og ny bekreftelse mangler mens gammel historikk beholdes. Kontroller også faktisk appfanebytte, arbeidsprofilbytte og tilbakekalling. Ingen faktisk e-post sendes.

HR-tilgang, private storage-filer, SJA-signering, rapport-PDF, varselutsending og kontrollert avvikslukking er fortsatt krav i senere trinn og rapporteres ikke som testet i A. Persondatautlevering/sletteservice gjenstår før produksjonsklar full modul. AGENTS krever ny eksplisitt bruker TEST OK før merge, deretter Production-verifisering og main → demo/preflight.
