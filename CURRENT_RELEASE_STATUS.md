# Gjeldende release-status – Fase 45B

Dato: 2026-09-27. Statusen skal beskrive dagens fasit, ikke historikken bak feilrettingene.

## Miljøer

- Production: `main` på `5e2a1ee6c00e3a67158d5a52b196675125d91fb1`; Vercel Production er READY og bundet til Production Supabase `dqffxflaoyarbxyiyhop`. Fase 45B er ikke lagt i Production.
- Aktiv release: `fase45b-production-release-clean`, bygget kontrollert fra Production-main. Ny branch-HEAD skal være READY i Vercel Preview og bundet kun til Sandbox før manuell slutt-test.
- Sandbox: Supabase-branch `demo-sandbox`, ref `ppvircenkjizeiqdxphj`. SQL, Fase 45B-tabeller, RPC-er, RLS/ACL, triggere og faste QA-saker svarer. Kontrollplanet viser fortsatt `MIGRATIONS_FAILED`; dette må avklares før Production-migrering selv om den kjørende databasen er operativ.
- Permanent Demo: Git-branch `demo`. Demo er kun kurs/presentasjon, har egen reset-/slettelogikk og er aldri kilde for Production-release.

## Ferdig i releasekandidaten

- Profftilgang er firma-, bruker- og leverandørscopet. Kun Systemadministrator kan aktivere Proff / Enkel ordre og styre leverandører/rabatter.
- Brukervilkår v1.1 gjør kjøp og bruk av SoPro-produkter i relevant omfang til en forutsetning for tilgang til Expo ProffDok.
- Eksternt proffsøk skjuler Ringsides interne nto, innkjøpsrabatt, DG og påslag. «Din nto pris» og intern `view_internal_net_prices` er separate, eksplisitte rettigheter.
- Synlig navn er Generelt tilbud, mens nødvendig legacy-identitet og historiske Butikktilbud er bevart.
- Akseptert Generelt tilbud kan aktiveres som Enkel ordre eller ordinært prosjekt med låst akseptert snapshot og valgte alternativer.
- Enkel ordre bruker lett prosjektmotor og blokkerer kundeportal; fremdriftsplan og FDV er valgfrie.
- Kundepreview er koblet til Sales og er read-only uten publisering, e-post eller aksept.
- Sales recovery/lazy loading, Production-hotfixer og arbeidsprofilbasert firmascope er bevart.
- Architecture, README, Sales README og Hjelp beskriver Fase 45B-reglene.

## Åpne feil og release-blokkere

1. Autentisert nettleser-QA viser at «Forhåndsvis som kunde» åpner korrekt read-only i ny fane, men originalfanen faller tilbake til tilbudsoversikten. Konkret rotårsak skal rettes uten å hente inn gamle brede navigasjonsforsøk.
2. Ny clean-release commit og Vercel Preview må deretter være READY på samme branch-HEAD og bekreftet bundet kun til Sandbox.
3. Supabase-kontrollplanets `MIGRATIONS_FAILED` og forskjellen mellom Sandboxens iterative migrasjonshistorikk og releasebranchens konsoliderte Fase 45B-migrasjoner må avklares før Production påvirkes.
4. Kenneth må gi eksplisitt `TEST OK / PRODUCTION GODKJENT` før merge.

## Siste QA-resultat

- Ren `npm ci`: PASS.
- Full `npm run check:critical`, inkludert 45B-gatene: PASS.
- Preview-build: PASS og eksplisitt `Sandbox Supabase only`.
- Production-mode dry build: PASS og eksplisitt `Production Supabase only`.
- Sandbox backend: relevante tabeller har RLS, direkte klientprivilegier er stengt, svak gammel pris-RPC er ikke klientkallbar, sensitive prisfelt mangler i proffsøk, Enkel ordre blokkerer kundeportal og faste QA-saker finnes.
- Autentisert Preview-QA: knapp og read-only kundepreview er bekreftet, men originalfanen resettes til oversikten; QA er derfor FEIL.
- Production-main, Production-deployment og Production Supabase er uendret.

## Det Kenneth må teste

Når automatisk Preview-QA er ferdig: åpne ett fast Generelt tilbud i den oppgitte Previewen, trykk «Forhåndsvis som kunde», bekreft ny fane, bekreft at originalfanen fortsatt står på samme tilbud, og kontroller at previewen ikke har publisering, sending eller aksept.

## Produktvalg som ikke er del av denne releasen

- Generelt tilbud vurderes som en framtidig betalt løsning. Ingen betalings-, abonnements- eller ny tilgangslogikk innføres før egen produktbeslutning.

## Neste handling

Finn og rett den konkrete årsaken til at originalfanen resettes ved kundepreview, legg regresjonen i build-gaten, publiser ny Sandbox-Preview og gjenta autentisert nettleser-QA. Ingen merge eller Production-endring før eksplisitt godkjenning.

Etter godkjent merge og trippel Production-QA skal midlertidige GitHub-brancher slettes slik at bare `main` og permanent `demo` står igjen. Supabase skal da ryddes slik at bare Production/default og `demo-sandbox` står igjen. Ingen slik opprydding utføres før release og Production-QA er godkjent.
