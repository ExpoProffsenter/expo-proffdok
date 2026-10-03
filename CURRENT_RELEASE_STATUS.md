# Release-status – kontrollert 03.10.2026

## Production

- `main`: `9802ef55194a5203c9dcaa1e3c4c5a15a361017a`. Siste funksjonsmerge er PR #206, godkjent med `TEST OK – Production godkjent`.
- Gjeldende deployment: `dpl_BEgWys2wYFA8DrmntrUxWzXLbtwY`, `READY`, `target=production`; `expo-proffdok.app` svarte HTTP 200 ved startkontrollen. Production-Supabase er `ACTIVE_HEALTHY`.
- Mobil Prissøk/EAN, små strekkoder, inntil tre serverlagrede plukklister, mobilskanning i Generelt tilbud og rettelsen mot gjentatt tilbudsrecovery er deployet.

## Aktiv endring

- Branch: `fase45b-desktop-price-picklist`, fra gjeldende `main`. PR opprettes som draft etter lokal QA.
- Miljømål: **BEGGE**. PC får antall og valgfritt Cordel-ordrenummer for nye plukklister, serversave, Ny plukkliste og separat plukkliste-/prisutskrift. Kameraskanning er kun på mobil. Eksisterende backend og tilgangsregler gjenbrukes uten migrasjon.
- Preview bygges mot Sandbox `ppvircenkjizeiqdxphj`. Målrettede checks, hele `npm run check:critical`, Sandbox-build, diff-/scope- og dokumentkontroll er grønne. Backendtest i rollback verifiserer lagring/antall, revisjonsvern, tre-listersgrense, prisfri payload og brukerisolasjon. Faktisk Preview-test gjenstår.
- Kenneth-test: ikke utført. Produksjonsgodkjenning for denne endringen: ikke gitt.

## Permanent Demo Sandbox

- `demo`: `d147dc586df373453183f1fae4d35a3c476d8094`; Production-baseline `9802ef55` er synkronisert kontrollert `main → demo`.
- Deployment `dpl_At3o2pZ36z4RhVH29oypWnCXYoko` er `READY`; app og `/demo-control.html` svarte HTTP 200 ved startkontrollen.
- Innlogget **Kjør preflight** er fortsatt ikke attestert grønn etter siste synk. Grenoversikten melder aktiv Sandbox, men har eldre `MIGRATIONS_FAILED`-status. Dette avklares før viktig kundedemo.

## Blokkere og neste handling

- Teknisk QA og Kenneths korte Preview-test må fullføres før release. Merge krever ny eksplisitt `PRODUCTION GODKJENT` for den konkrete PR-en.
- Etter godkjent Production-QA: kontrollert `main → demo`-synk og Sandbox-preflight. Demo skal aldri merges tilbake til `main`.
