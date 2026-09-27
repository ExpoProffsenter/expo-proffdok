# Gjeldende release-status – Fase 45B

Dato: 2026-09-27. Statusen beskriver dagens fasit, ikke historikken bak feilrettingene.

## Miljøer

- Production: `main` står fortsatt på `5e2a1ee6c00e3a67158d5a52b196675125d91fb1`. Vercel Production `dpl_RUA6pD8FrFkJRaibzJTV3Gft41fN` er `READY`, peker på samme commit og er bundet til Production Supabase `dqffxflaoyarbxyiyhop`. Fase 45B er ikke lagt i Production.
- Aktiv release: `fase45b-production-release-clean`. Kodehode før denne statusoppdateringen er `ea4649ffa683948644668dd19e4750c7f513fad2`. Vercel Preview `dpl_CgK15QGehUnYiu4smVJQKnb329MM` er `READY` på branch-aliaset, og emitted kode er bundet kun til Sandbox.
- PR #190 er fortsatt `open`, `draft=true`, `merged=false`, med base `main` og head `fase45b-production-release-clean`.
- Sandbox: Supabase-branch `demo-sandbox`, ref `ppvircenkjizeiqdxphj`, er `ACTIVE_HEALTHY`. Kontrollplanets `MIGRATIONS_FAILED` stammer fra branch-opprettelsen 15.09 og beskriver ikke dagens runtime. Sandbox har bevisst egen demo-migrasjonslinje og skal aldri branch-merges til Production.
- Supabase har nå bare default/Production og `demo-sandbox`, som også er ønsket sluttilstand.
- Permanent Demo: Git-branch `demo` er urørt. Seks eksisterende demo-bilder fra denne branchen er gjenbrukt i release-kandidaten fordi de permanente Sandbox-prosjektene peker til dem.

## Ferdig i releasekandidaten

- Profftilgang er firma-, bruker- og leverandørscopet. Kun Systemadministrator kan aktivere Proff / Enkel ordre og styre leverandører/rabatter.
- Brukervilkår v1.1 gjør kjøp og bruk av SoPro-produkter i relevant omfang til en forutsetning for tilgang til Expo ProffDok.
- Eksternt proffsøk skjuler Ringsides interne nto, innkjøpsrabatt, DG og påslag. «Din nto pris» og intern `view_internal_net_prices` er separate, eksplisitte rettigheter.
- Synlig navn er Generelt tilbud, mens nødvendig legacy-identitet og historiske Butikktilbud er bevart.
- Akseptert Generelt tilbud kan aktiveres som Enkel ordre eller ordinært prosjekt med låst akseptert snapshot og valgte alternativer.
- Enkel ordre bruker lett prosjektmotor og blokkerer kundeportal; fremdriftsplan og FDV er valgfrie.
- Kundepreview åpnes i ny fane uten å flytte originalfanen. Previewen rendrer ingen kontroller eller klient for publisering, e-post, aksept eller avvisning.
- Supportbanneret henter navn fra innlogget brukers metadata/e-post og spør ikke lenger etter den ikke-eksisterende kolonnen `profiles.full_name`.
- En akseptert kundelenke åpnes etter reload som låst akseptbekreftelse med riktig versjon, valgte opsjoner og akseptert totalsum. Aksept-/avvisningskontroller vises ikke på nytt.
- Komplett rapport-PDF støtter både `cat` og `category` på bilder. De seks bildebanene som brukes av permanent Sandbox-demo finnes nå i release-bygget.
- Nye eller oppdaterte tilbudsmaler beholder gjenbrukbare app-/Storage-bilder på poster og opsjoner. Midlertidige `data:`/`blob:`-bilder og kundespesifikke PDF-vedlegg lagres ikke i malen.
- Kontrakt-PDF grupperer sammenhengende avsnitt i samme kort, bryter bare ved reelt sideskift og holder opsjonsbeskrivelse og pris samlet.
- Sales recovery/lazy loading, Production-hotfixer og arbeidsprofilbasert firmascope er bevart.
- Architecture, README, Sales README og Hjelp beskriver Fase 45B-reglene.

## Åpne feil og release-blokkere

1. Ingen kjent kode-, kritisk test-, bygg- eller deployfeil.
2. To autentiserte Sandbox-retester gjenstår etter at nettleserforbindelsen mistet den påkrevde `scripts/browser-client.mjs`-hjelperen:
   - Åpne `DEMO-45B-002` på nytt og bekreft at tilbudshistorikken viser v1, korrekt total og to valgte opsjoner i stedet for «Ukjent versjon · 0 kr». Aktiv rad og `golden-v1`-snapshot er reparert med korrekt `publicToken` og `salesOfferId`.
   - Generer komplett garantirapport på nytt og bekreft visuelt at prosjektets bildeseksjon og sjekklistebilder er innebygd. Ny Preview leverer alle seks demoressursene med HTTP 200, og kode-/byggvernet er grønt.
3. Enkel ordre-prosjektet er verifisert i backend og aktiveringspopupen er verifisert i faktisk app, men selve prosjektflaten bør åpnes én siste gang i den nye Preview-en sammen med retestene over.
4. Ingen merge før Kenneth uttrykkelig gir `PRODUCTION GODKJENT` etter slutt-QA.
5. Etter godkjenning skal de versjonerte 45B-migrasjonene kjøres kontrollert fra repoet mot Production. `demo-sandbox` skal ikke brukes som mergekilde.

Ikke-blokkerende Sandbox-advarsel: `demo_sandbox_snapshots` har RLS deaktivert, men har ingen grants til `public`, `anon` eller `authenticated`. Tabellen er derfor ikke klienttilgjengelig. Eventuell defense-in-depth-endring må vurderes mot demo-reset før den gjøres.

## Siste QA-resultat

- Ren `npm ci`: PASS.
- Full `npm run check:critical`, inkludert nye vern for supportprofil, akseptert kundelenke og PDF-bildekategorier: PASS.
- Preview-build: PASS og eksplisitt `Sandbox Supabase only`.
- Production-mode dry build: PASS og eksplisitt `Production Supabase only`.
- Preview-commit `ea4649f`: Vercel `READY`; seks permanente demoressurser svarer med HTTP 200.
- Sandbox backend: relevante tabeller/RPC-er/RLS/ACL/triggere og faste QA-saker svarer. Alle 16 versjonerte 45B-migrasjoner er tidligere kjørt samlet i transaksjon med rollback: PASS.
- Ny, ren og innlogget Sandbox-fane: supportbanneret viste «Innlogget support: Kenneth Demo».
- `DEMO-45B-002`: popupen «Hva skal oppdraget bli?» viste både «Lag enkel ordre» og «Aktiver som prosjekt». Begge var korrekt deaktivert i Systemadmin-supportmodus. Popupen som spør om Andreas sin mal er en separat dialog og er ikke denne aktiveringskontrollen.
- Faktisk appflyt verifisert read-only: `DEMO-01-FORESPORSEL`, `DEMO-02-BEFARING`, `DEMO-03-TILBUD`, kundepreview uten beslutningskontroller, `DEMO-04-AKSEPTERT`, låst tilbud v1 med tre valgte opsjoner, signert forbrukerkontrakt og `DEMO-05-PROSJEKT`.
- Akseptert offentlig kundelenke viste først feilaktig nytt akseptskjema. Rettelsen ble deployet og deretter verifisert live: «Din aksept er registrert», v1, tre valgte opsjoner, 214 625 kr inkl. mva., ingen aksept- eller avvisningsknapper.
- Ordinært prosjekt åpnet med skrivebeskyttet salgsgrunnlag, tilbudssum og prosjektstatus. Previewens fremdriftsflate var korrekt merket som trygg lokal testmodus.
- Ferdigstilt reserveprosjekt: låst, overtagelse registrert 15.09.2026, begge navn/signaturbekreftelser, garantivilkår bekreftet, 14/14 garantipunkter, garanti gyldig til 2036 og garantinummer `DEMO-GARANTI-2026-002`.
- Første komplette garantirapport ble lastet ned og kontrollert: 17 A4-sider, 100 % dokumentasjonsgrad, 38/38 kontroller, null åpne avvik, overtagelse, garantisertifikat og garantivilkår. Kontrollen avdekket manglende demoressurser og `cat`/`category`-mismatch; begge er rettet og deployet, men PDF-en må gjengenereres én gang i ny nettleserøkt.
- `DEMO-45B-002` sin aktive Sandbox-rad og permanente `golden-v1`-snapshot inneholder nå samme korrekte `publicToken` og `salesOfferId`.
- Production-main, Production-deployment og Production Supabase er uendret.

## Det Kenneth må teste

Ingen ny manuell test nå. Kenneth får én kort, konkret slutt-test etter de to gjenværende automatiserte Sandbox-retestene.

## Produktvalg som ikke er del av denne releasen

- Generelt tilbud vurderes som en framtidig betalt løsning. Ingen betalings-, abonnements- eller ny tilgangslogikk innføres før egen produktbeslutning.

## Neste handling

Gjenopprett en ren, innlogget Sandbox-nettleser når browser-hjelperen er tilgjengelig. Retest `DEMO-45B-002`-historikken, åpne Enkel ordre-prosjektflaten og gjengenerer/visuelt kontroller komplett garantirapport. Oppdater denne statusen med sluttresultatet. Ingen merge eller Production-endring før eksplisitt godkjenning.

Etter godkjent merge og trippel Production-QA skal midlertidige GitHub-brancher slettes slik at bare `main` og permanent `demo` står igjen. Supabase skal da fortsatt bare ha Production/default og `demo-sandbox`. Ingen slik GitHub-opprydding utføres før release og Production-QA er godkjent.
