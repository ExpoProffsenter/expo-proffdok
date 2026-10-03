# Release-status – kontrollert 03.10.2026

## Production

- `main`: `9802ef55194a5203c9dcaa1e3c4c5a15a361017a`. Siste funksjonsmerge er PR #206, godkjent med `TEST OK – Production godkjent`.
- Gjeldende deployment: `dpl_BEgWys2wYFA8DrmntrUxWzXLbtwY`, `READY`, `target=production`; `expo-proffdok.app` svarte HTTP 200 ved startkontrollen. Production-Supabase er `ACTIVE_HEALTHY`.
- Mobil Prissøk/EAN, små strekkoder, inntil tre serverlagrede plukklister, mobilskanning i Generelt tilbud og rettelsen mot gjentatt tilbudsrecovery er deployet.

## Aktiv endring

- Branch: `fase45b-desktop-price-picklist`, fra gjeldende `main`. Draft-PR #207: https://github.com/ExpoProffsenter/expo-proffdok/pull/207. Remote source tree er identisk med lokalt QA-testet tre.
- Miljømål: **BEGGE**. PC får antall og valgfritt Cordel-ordrenummer for nye plukklister, serversave, Ny plukkliste og separat plukkliste-/prisutskrift. Kameraskanning er kun på mobil. Eksisterende backend og tilgangsregler gjenbrukes uten migrasjon.
- Preview mot Sandbox `ppvircenkjizeiqdxphj` er `READY` og svarer HTTP 200. Feature-deployment `dpl_6491we2eRTrpK2uAnfTrF5V9nEZS` bygget kildekoden `e7ceae63e27da77b158329feb90a16e1495b7acf`; GitHub Core Safety og Vercel-status er grønne. Preview: https://expo-proffdok-git-fase45b-desktop-price-picklist-ringside.vercel.app/?progressTest=safe.
- Målrettede checks, hele `npm run check:critical`, Sandbox-build, diff-/scope- og dokumentkontroll er grønne. Backendtest i rollback verifiserer lagring/antall, revisjonsvern, tre-listersgrense, prisfri payload og brukerisolasjon.
- Nettleseren viser innlogging. Sikker innlogging kom ikke videre til en attestert innlogget side; ingen synlig appfeil ble observert. Faktisk innlogget Preview-test av PC-flyten og utskriftsvalgene gjenstår. Draft beholdes.
- Kenneth-test: ikke utført. Produksjonsgodkjenning for denne endringen: ikke gitt.

## Permanent Demo Sandbox

- `demo`: `d147dc586df373453183f1fae4d35a3c476d8094`; Production-baseline `9802ef55` er synkronisert kontrollert `main → demo`.
- Deployment `dpl_At3o2pZ36z4RhVH29oypWnCXYoko` er `READY`; app og `/demo-control.html` svarte HTTP 200 ved startkontrollen.
- Innlogget **Kjør preflight** er fortsatt ikke attestert grønn etter siste synk. Grenoversikten melder aktiv Sandbox, men har eldre `MIGRATIONS_FAILED`-status. Dette avklares før viktig kundedemo.

## Blokkere og neste handling

- Neste handling: fullfør Sandbox-innlogging og Preview-test av PC-antall, lagring/gjenåpning og begge utskriftsvalg. Kontroller deretter samme lagrede liste på mobil. Merge krever ny eksplisitt `PRODUCTION GODKJENT` for PR #207.
- Etter godkjent Production-QA: kontrollert `main → demo`-synk og Sandbox-preflight. Demo skal aldri merges tilbake til `main`.
