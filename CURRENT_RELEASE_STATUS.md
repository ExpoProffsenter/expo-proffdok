# Release-status – kontrollert 03.10.2026

## Production

- `main`: `9802ef55194a5203c9dcaa1e3c4c5a15a361017a`. Siste funksjonsmerge er PR #206, godkjent med `TEST OK – Production godkjent`.
- Gjeldende deployment: `dpl_BEgWys2wYFA8DrmntrUxWzXLbtwY`, `READY`, `target=production`; `expo-proffdok.app` svarte HTTP 200 ved startkontrollen. Production-Supabase er `ACTIVE_HEALTHY`.
- Mobil Prissøk/EAN, små strekkoder, inntil tre serverlagrede plukklister, mobilskanning i Generelt tilbud og rettelsen mot gjentatt tilbudsrecovery er deployet.

## Aktiv endring

- Branch: `fase45b-desktop-price-picklist`, fra gjeldende `main`. Draft-PR #207: https://github.com/ExpoProffsenter/expo-proffdok/pull/207. Remote source tree er identisk med lokalt QA-testet tre.
- Miljømål: **BEGGE**. PC får antall og valgfritt Cordel-ordrenummer for nye plukklister, serversave, Ny plukkliste og separat plukkliste-/prisutskrift. Kameraskanning er kun på mobil. Eksisterende backend og tilgangsregler gjenbrukes uten migrasjon.
- Preview mot Sandbox `ppvircenkjizeiqdxphj` er `READY`. Innlogget PC-test er utført på feature-deployment `dpl_5XyThZcn8fXfguzqijbqjZXuYqcq`, kildekode `d7fe0ae8acd3a489edc922132c25f3b5a1342b34`. GitHub Core Safety er grønn. Preview: https://expo-proffdok-git-fase45b-desktop-price-picklist-ringside.vercel.app/?progressTest=safe.
- Målrettede checks, hele `npm run check:critical`, Sandbox-build, diff-/scope- og dokumentkontroll er grønne. Backendtest i rollback verifiserer lagring/antall, revisjonsvern, tre-listersgrense, prisfri payload og brukerisolasjon.
- Innlogget Preview bekrefter nye PC-lister, desimalantall, lagring/oppdatering, gjenåpning fra serveren, Ny plukkliste, vern av ulagrede endringer, Startside-retur og full sideoppdatering. En bekreftelse som ble stående etter lagring ble rettet; ny bekreftelse kreves igjen for senere ulagrede endringer. Begge utskriftsdokumenter er kontrollert: plukkliste har antall/ordrenummer uten priser, prisutskrift har kundepris og valgfritt tilgangsstyrte internpriser. Desktop har ingen kameraskanning. Faktisk mobiltest gjenstår. Draft beholdes.
- Demo-brukeren har testlisten `QA-PC-20261003`, én syntetisk Sopro-vare med antall 4, tilgjengelig for Kenneths kontroll på PC og mobil. Serveren viser revisjon 2 og kun vareidentifikatorer/antall; ingen priser. Listen er en QA-fixture, ikke en registrert Cordel-ordre.
- Kenneth-test: ikke utført. Produksjonsgodkjenning for denne endringen: ikke gitt.

## Permanent Demo Sandbox

- `demo`: `d147dc586df373453183f1fae4d35a3c476d8094`; Production-baseline `9802ef55` er synkronisert kontrollert `main → demo`.
- Deployment `dpl_At3o2pZ36z4RhVH29oypWnCXYoko` er `READY`; app og `/demo-control.html` svarte HTTP 200 ved startkontrollen.
- Innlogget **Kjør preflight** er fortsatt ikke attestert grønn etter siste synk. Grenoversikten melder aktiv Sandbox, men har eldre `MIGRATIONS_FAILED`-status. Dette avklares før viktig kundedemo.

## Blokkere og neste handling

- Neste handling: Kenneth kontrollerer `QA-PC-20261003` i samme Preview på PC og mobil, antall/lagring og de to PC-utskriftsvalgene. Merge krever deretter ny eksplisitt `PRODUCTION GODKJENT` for PR #207; `TEST OK` alene er ikke produksjonsgodkjenning.
- Etter godkjent Production-QA: kontrollert `main → demo`-synk og Sandbox-preflight. Demo skal aldri merges tilbake til `main`.
