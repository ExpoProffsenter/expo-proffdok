# Gjeldende release-status – Fase 45B

Dato: 2026-09-27. Statusen skal beskrive dagens fasit, ikke historikken bak feilrettingene.

## Miljøer

- Production: `main` på `5e2a1ee6c00e3a67158d5a52b196675125d91fb1`; Vercel Production er READY og bundet til Production Supabase `dqffxflaoyarbxyiyhop`. Fase 45B er ikke lagt i Production.
- Aktiv release: `fase45b-production-release-clean`, bygget kontrollert fra Production-main. Gjeldende Vercel Preview er READY og emitted kode er bundet kun til Sandbox.
- Sandbox: Supabase-branch `demo-sandbox`, ref `ppvircenkjizeiqdxphj`. Databasen er `ACTIVE_HEALTHY`, og SQL, Fase 45B-tabeller, RPC-er, RLS/ACL, triggere og faste QA-saker svarer. Kontrollplanets `MIGRATIONS_FAILED` stammer fra branch-opprettelsen 15.09 og beskriver ikke dagens runtime. Sandbox har bevisst egen demo-migrasjonslinje og skal aldri branch-merges til Production.
- Permanent Demo: Git-branch `demo`. Demo er kun kurs/presentasjon, har egen reset-/slettelogikk og er aldri kilde for Production-release.

## Ferdig i releasekandidaten

- Profftilgang er firma-, bruker- og leverandørscopet. Kun Systemadministrator kan aktivere Proff / Enkel ordre og styre leverandører/rabatter.
- Brukervilkår v1.1 gjør kjøp og bruk av SoPro-produkter i relevant omfang til en forutsetning for tilgang til Expo ProffDok.
- Eksternt proffsøk skjuler Ringsides interne nto, innkjøpsrabatt, DG og påslag. «Din nto pris» og intern `view_internal_net_prices` er separate, eksplisitte rettigheter.
- Synlig navn er Generelt tilbud, mens nødvendig legacy-identitet og historiske Butikktilbud er bevart.
- Akseptert Generelt tilbud kan aktiveres som Enkel ordre eller ordinært prosjekt med låst akseptert snapshot og valgte alternativer.
- Enkel ordre bruker lett prosjektmotor og blokkerer kundeportal; fremdriftsplan og FDV er valgfrie.
- Kundepreview åpnes i ny fane uten å flytte originalfanen. Previewen rendrer ingen kontroller eller klient for publisering, e-post, aksept eller avvisning.
- Sales recovery/lazy loading, Production-hotfixer og arbeidsprofilbasert firmascope er bevart.
- Architecture, README, Sales README og Hjelp beskriver Fase 45B-reglene.

## Åpne feil og release-blokkere

1. Ingen åpne funksjonsfeil etter automatisert backend-, build- og nettleser-QA.
2. Kenneth må gjennomføre den korte manuelle Preview-testen og gi eksplisitt `TEST OK / PRODUCTION GODKJENT` før merge.
3. Etter godkjenning skal de versjonerte 45B-migrasjonene kjøres kontrollert fra repoet mot Production. `demo-sandbox` skal ikke brukes som mergekilde.

## Siste QA-resultat

- Ren `npm ci`: PASS.
- Full `npm run check:critical`, inkludert 45B-gatene: PASS.
- Preview-build: PASS og eksplisitt `Sandbox Supabase only`.
- Production-mode dry build: PASS og eksplisitt `Production Supabase only`.
- Sandbox backend: relevante tabeller har RLS, direkte klientprivilegier er stengt, svak gammel pris-RPC er ikke klientkallbar, sensitive prisfelt mangler i proffsøk, Enkel ordre blokkerer kundeportal og faste QA-saker finnes.
- Alle 16 versjonerte 45B-migrasjoner er kjørt samlet mot Sandbox i transaksjon med rollback: PASS uten varige databaseendringer.
- Autentisert Preview-QA: «Forhåndsvis som kunde» åpner i ny fane; originalfanen ble stående på samme Generelle tilbud gjennom hele testen; Preview-DOM-en har ingen beslutningskontroller.
- Sandbox etter Preview-QA: testsaken er fortsatt utkast uten publisert versjon, e-post, aksept, avvisning eller nye varsler.
- Brukervilkår v1.1 og SoPro-forutsetningen er synlige i Hjelp og dekkes av critical-gaten.
- Production-main, Production-deployment og Production Supabase er uendret.

## Det Kenneth må teste

Åpne `DEMO-BUTIKK-01-UTKAST` i clean Preview, trykk «Forhåndsvis som kunde», bekreft at ny fane åpnes, at originalfanen fortsatt står på samme tilbud, og at Previewen ikke viser publisering, sending, aksept eller avvisning.

## Produktvalg som ikke er del av denne releasen

- Generelt tilbud vurderes som en framtidig betalt løsning. Ingen betalings-, abonnements- eller ny tilgangslogikk innføres før egen produktbeslutning.

## Neste handling

Innhent Kenneths manuelle `TEST OK / PRODUCTION GODKJENT`. Ingen merge eller Production-endring før eksplisitt godkjenning.

Etter godkjent merge og trippel Production-QA skal midlertidige GitHub-brancher slettes slik at bare `main` og permanent `demo` står igjen. Supabase skal da ryddes slik at bare Production/default og `demo-sandbox` står igjen. Ingen slik opprydding utføres før release og Production-QA er godkjent.
