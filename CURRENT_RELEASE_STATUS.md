# Gjeldende release-status – Fase 45B

Dato: 2026-09-27. Statusen skal beskrive dagens fasit, ikke historikken bak feilrettingene.

## Miljøer

- Production: `main` på `5e2a1ee6c00e3a67158d5a52b196675125d91fb1`; Vercel Production er READY og bundet til Production Supabase `dqffxflaoyarbxyiyhop`. Fase 45B er ikke lagt i Production.
- Aktiv release: `fase45b-production-release-clean`, bygget kontrollert fra Production-main. Ny branch-HEAD skal være READY i Vercel Preview og bundet kun til Sandbox før manuell slutt-test.
- Sandbox: Supabase-branch `demo-sandbox`, ref `ppvircenkjizeiqdxphj`. SQL, Fase 45B-tabeller, RPC-er, RLS/ACL, triggere og faste QA-saker svarer. Kontrollplanet viser fortsatt `MIGRATIONS_FAILED`; dette må avklares før Production-migrering selv om den kjørende databasen er operativ.
- Permanent Demo: Git-branch `demo`. Demo er kun kurs/presentasjon, har egen reset-/slettelogikk og er aldri kilde for Production-release.

## Ferdig i releasekandidaten

- Profftilgang er firma-, bruker- og leverandørscopet. Kun Systemadministrator kan aktivere Proff / Enkel ordre og styre leverandører/rabatter.
- Eksternt proffsøk skjuler Ringsides interne nto, innkjøpsrabatt, DG og påslag. «Din nto pris» og intern `view_internal_net_prices` er separate, eksplisitte rettigheter.
- Synlig navn er Generelt tilbud, mens nødvendig legacy-identitet og historiske Butikktilbud er bevart.
- Akseptert Generelt tilbud kan aktiveres som Enkel ordre eller ordinært prosjekt med låst akseptert snapshot og valgte alternativer.
- Enkel ordre bruker lett prosjektmotor og blokkerer kundeportal; fremdriftsplan og FDV er valgfrie.
- Kundepreview er koblet til Sales, åpnes isolert og har ingen publisering, e-post eller aksept.
- Sales recovery/lazy loading, Production-hotfixer og arbeidsprofilbasert firmascope er bevart.
- Architecture, README, Sales README og Hjelp beskriver Fase 45B-reglene.

## Åpne feil og release-blokkere

1. Ny clean-release commit og Vercel Preview må være READY på samme branch-HEAD og bekreftet bundet kun til Sandbox.
2. Autentisert nettleser-QA må bekrefte at «Forhåndsvis som kunde» vises, åpner i ny fane, lar originalfanen stå på samme Generelle tilbud og er helt read-only.
3. Supabase-kontrollplanets `MIGRATIONS_FAILED` og forskjellen mellom Sandboxens iterative migrasjonshistorikk og releasebranchens konsoliderte Fase 45B-migrasjoner må avklares før Production påvirkes.
4. Kenneth må gi eksplisitt `TEST OK / PRODUCTION GODKJENT` før merge.

## Siste QA-resultat

- Ren `npm ci`: PASS.
- Full `npm run check:critical`, inkludert 45B-gatene: PASS.
- Preview-build: PASS og eksplisitt `Sandbox Supabase only`.
- Production-mode dry build: PASS og eksplisitt `Production Supabase only`.
- Sandbox backend: relevante tabeller har RLS, direkte klientprivilegier er stengt, svak gammel pris-RPC er ikke klientkallbar, sensitive prisfelt mangler i proffsøk, Enkel ordre blokkerer kundeportal og faste QA-saker finnes.
- Production-main, Production-deployment og Production Supabase er uendret.

## Det Kenneth må teste

Når automatisk Preview-QA er ferdig: åpne ett fast Generelt tilbud i den oppgitte Previewen, trykk «Forhåndsvis som kunde», bekreft ny fane, bekreft at originalfanen fortsatt står på samme tilbud, og kontroller at previewen ikke har publisering, sending eller aksept.

## Neste handling

Publiser clean release til ny Sandbox-Preview, verifiser branch/SHA/buildbinding og gjennomfør autentisert nettleser-QA. Ingen merge eller Production-endring før eksplisitt godkjenning.

Etter godkjent merge og trippel Production-QA skal midlertidige GitHub-brancher slettes slik at bare `main` og permanent `demo` står igjen. Supabase skal da ryddes slik at bare Production/default og `demo-sandbox` står igjen. Ingen slik opprydding utføres før release og Production-QA er godkjent.
