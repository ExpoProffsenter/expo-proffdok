# Gjenopptatt godkjent release – 2. november 2026

Kenneths TEST OK kl.16:02 CET for PR294/295/298/305, nødvendig databaseoppdatering, Production og main → demo gjelder fortsatt. Ingen nye funksjoner, gammel HR-ledger/prototype, Solgløtt, videoer eller opprydding inngår. Miljømål BEGGE.

## Kontrollert etter samtalebrudd

Main er70a99b3ece0ab562c5ee140f23c8b18da1b7b4a1. PR305/298/294 er allerede merget. Production er READY på dpl_FGu9g1fHQSk4i9mvQPCAxacRReq6, eksakt main70a99b3e. Demo står fortsatt påfd04ac9a. Designbranchens integrerte head erd3489a690b9899b42a6bb5f8fa956fd13f41d214 med foreldre d9ca45e0 ogmain70a99b3e.

Production SQL-lesing i READ ONLY/ROLLBACK bekrefter allerede installert malforslagsmigrering20261102151721, privat tabell og0forslag. Canonical20261031012504 skal IKKE installeres på nytt. Tidligere data-/rettighets-/signaturbevis står i [produksjonsloggen](DESIGN036_PRODUCTION_RELEASE_20261102.md).

## Hvorfor CI887 stoppet og hva som rettes

Åtte pakker var grønne. App-browser stoppet i personal-workspace-036-browser-check.mjs:85 på Åpne oppgave, og sluttgaten stoppet korrekt. Den samme feilen er gjenskapt i isolert Chromium fra eksakt d3489a69.

PR294 har godkjent `expanded=true` og viser de fire første boligoppgavene direkte. Den eldre designprøven trykket på overskriften for å åpne listen, men lukket den dermed før oppgaveklikket. Den ventet også på den gamle etiketten Innlogget i stedet for godkjent Registrert på prosjektet. Dette er en testintegrasjonsfeil, ikke grunnlag for å endre produktet tilbake.

Bare testinngangen samordnes. Fem nye krav kontrollerer direkte synlighet, collapse/hidden og reopen; den samme åpne/lukke-oppgaven og inn-/utregistreringen beholdes. Alle andre tidligere plan-/kladd-/scope-/fokus-/tilgangskrav beholdes. Etterprøve:1141Min side,63time-opt-in,53boligoppgaver og21registreringskrav PASS. Faktiske komponenter med syntetisk transport; ingen serverdata eller utsending. Ingen produkt-, CSS-, database-, avhengighets- eller workflowfiler endres.

## Sluttløp og bevisgrenser

Ny kandidat får vanlig full CI før merge av PR295. Deretter kontrolleres faktisk Production-SHA, alias, backendbinding og publiserte ressurser. Main synkroniseres til demo først etter produksjonskontrollen, med demo-overlay og bilder bevart og ny read-only preflight. Eksakte slutt-SHA-er, deploy-ID-er og kontrollresultater føres i PR295, og demologgen vedlikeholdes ved synken. Ingen tester omgås.

Den tidligere innloggede skynettøkten er ikke tilgjengelig. En ny full innlogget rolle-/Safari-runde hevdes ikke. Publisering bygger på eksplisitt godkjente utviklertester og Kenneths Preview-vurdering. Tilbakeføring beholder den additive databasen og eventuelle innkomne forslag. Produksjon og demo har separate tilbakeføringsgrunnlag i produksjonsloggen.
