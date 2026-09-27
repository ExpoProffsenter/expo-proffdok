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
- Nye eller oppdaterte tilbudsmaler beholder gjenbrukbare app-/Storage-bilder på poster og opsjoner. Midlertidige `data:`/`blob:`-bilder og kundespesifikke PDF-vedlegg lagres ikke i malen.
- Kontrakt-PDF grupperer sammenhengende avsnitt i samme kort, bryter bare ved reelt sideskift og holder opsjonsbeskrivelse og pris samlet. Lange seksjoner bruker ledig sideplass før ny side.
- Sales recovery/lazy loading, Production-hotfixer og arbeidsprofilbasert firmascope er bevart.
- Architecture, README, Sales README og Hjelp beskriver Fase 45B-reglene.

## Åpne feil og release-blokkere

1. Ingen kjent kode-/buildfeil. Siste malbilde-, kontrakt-PDF- og terminologirettelser venter på autentisert nettleser-QA i ny Sandbox-Preview.
2. Bred ende-til-ende QA fra forespørsel til garantidokument er ikke ferdig.
3. Ingen merge før Kenneth uttrykkelig gir `PRODUCTION GODKJENT` etter slutt-QA.
4. Etter godkjenning skal de versjonerte 45B-migrasjonene kjøres kontrollert fra repoet mot Production. `demo-sandbox` skal ikke brukes som mergekilde.

## Siste QA-resultat

- Ren `npm ci`: PASS.
- Full `npm run check:critical`, inkludert 45B-gatene: PASS.
- Preview-build: PASS og eksplisitt `Sandbox Supabase only`.
- Production-mode dry build: PASS og eksplisitt `Production Supabase only`.
- Sandbox backend: relevante tabeller har RLS, direkte klientprivilegier er stengt, svak gammel pris-RPC er ikke klientkallbar, sensitive prisfelt mangler i proffsøk, Enkel ordre blokkerer kundeportal og faste QA-saker finnes.
- Alle 16 versjonerte 45B-migrasjoner er kjørt samlet mot Sandbox i transaksjon med rollback: PASS uten varige databaseendringer.
- Autentisert Preview-QA: «Forhåndsvis som kunde» åpner i ny fane; originalfanen ble stående på samme Generelle tilbud gjennom hele testen; Preview-DOM-en har ingen beslutningskontroller.
- Kenneths manuelle test av kundepreview: PASS.
- Reell låst kontraktsnapshot fra Production-sak er brukt read-only i lokal PDF-QA: 18 sider ble 14 uten innholdstap; lange overskrifter brytes, og opsjonsbeskrivelse/pris holdes samlet. Production-data ble ikke endret.
- Full `check:critical` og eksplisitt Sandbox-Preview-build etter terminologi-/mal-/PDF-rettelsene: PASS.
- Sandbox etter Preview-QA: testsaken er fortsatt utkast uten publisert versjon, e-post, aksept, avvisning eller nye varsler.
- Brukervilkår v1.1 og SoPro-forutsetningen er synlige i Hjelp og dekkes av critical-gaten.
- Production-main, Production-deployment og Production Supabase er uendret.

## Det Kenneth må teste

Ingen ny manuell test nå. Kenneth får én kort, konkret slutt-test når automatisert nettleser- og ende-til-ende QA er ferdig.

## Produktvalg som ikke er del av denne releasen

- Generelt tilbud vurderes som en framtidig betalt løsning. Ingen betalings-, abonnements- eller ny tilgangslogikk innføres før egen produktbeslutning.

## Neste handling

Opprett ny Sandbox-Preview fra clean release, verifiser malbilder, kontrakt-PDF, direkte Generelt tilbud-terminologi og fortsett bred ende-til-ende QA. Ingen merge eller Production-endring før eksplisitt godkjenning.

Etter godkjent merge og trippel Production-QA skal midlertidige GitHub-brancher slettes slik at bare `main` og permanent `demo` står igjen. Supabase skal da ryddes slik at bare Production/default og `demo-sandbox` står igjen. Ingen slik opprydding utføres før release og Production-QA er godkjent.
