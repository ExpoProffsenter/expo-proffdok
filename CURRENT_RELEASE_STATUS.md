# Gjeldende release-status – Fase 45B

Dato: 2026-09-27. Denne statusen bygger på kontroller mot GitHub, Vercel og Supabase samme dag.

- Production: `main` på `5e2a1ee6c00e3a67158d5a52b196675125d91fb1`; Vercel Production READY og koblet til Production Supabase `dqffxflaoyarbxyiyhop`. Ingen Fase 45B-migrasjoner i Production.
- Aktiv release: `fase45b-production-release-clean` bygget fra gjeldende main. Siste offentlig verifiserte Preview-deployment `d7af3bd65af23dff1c55e21d3c2f9aed759bddad` er READY. Preview-miljøbinding er beskyttet av build-konfigurasjon, men faktisk autentisert UX og ferdig bundlebinding gjenstår å verifisere.
- Sandbox: `demo-sandbox`, ref `ppvircenkjizeiqdxphj`, SQL svarer. Supabase branch-status er `MIGRATIONS_FAILED` selv om Fase 45B-migrasjoner vises i migrasjonshistorikken. Krever målrettet avklaring før release.
- Permanent Demo: `demo`; holdes separat og er ikke kilde for Production-release.
- Implementert i release-kode: ekstern proffkatalog og tilgangsadministrasjon, Generelt tilbud med historiske butikktilbud, Enkel ordre, kundepreview i isolert fane, hjelpemodul og 45B-migrasjoner. Full funksjonsverifisering gjenstår.

## Åpne feil og blokkere

1. `critical-customer-draft-preview-check.mjs` eksisterte uten å være koblet til build. Når den kjøres, feiler den fordi SalesModule ikke implementerer påkrevd arbeidsprofilbasert storage-scope. Kontroll er nå koblet inn i `check:critical` og `build`, og release skal være rød inntil kode og regresjon er rettet og verifisert.
2. Ren `npm ci` feiler: `package-lock.json` matcher ikke `package.json` for Supabase-avhengigheter. Oppdater låsefil kontrollert og kjør full critical/build.
3. Manglende autentisert nettleserbekreftelse: kundepreview i ny fane, originalfane på samme sak, skrivebeskyttet preview og riktig Sandbox-binding.
4. Full Sandbox backend-verifikasjon av tilgang, pris-RPC, RLS og akseptert snapshot gjenstår for denne kontrollrunden.
5. Release-dokumentasjon i Architecture, README, Sales README og Hjelp må vurderes opp mot faktisk sluttløsning før merge.

## Siste QA og neste handling

GitHub `main` og Production-deployment er uendret; Preview READY er ikke funksjonsbevis. Lokal kontroll av kundepreview-skript avdekket manglende storage-scope. Neste handling: rett scope uten å svekke Sales recovery/server-first, oppdater lockfile, kjør critical/build, undersøk Sandbox-status og verifiser Preview med innlogget testbruker. Kenneth skal først slutt-teste kort UX etter automatisert QA. Ingen merge eller Production-endring før eksplisitt `TEST OK / PRODUCTION GODKJENT`.
