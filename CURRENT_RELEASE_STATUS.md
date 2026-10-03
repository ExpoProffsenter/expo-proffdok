# Release-status – kontrollert 03.10.2026

## Production

- Siste funksjonsmerge er [PR #207](https://github.com/ExpoProffsenter/expo-proffdok/pull/207), `ca161ba57657b0817c23a081471e274982a6bdb9`. Kenneth ga `test ok` og uttrykkelig `production ok` 03.10.2026 kl. 16:31 Europe/Oslo for godkjent head `311e7d430d08a5fdae4bfbb6065a718c4c9ed942`. Senere dokumentasjonscommits endrer ikke funksjonskoden.
- Verifisert funksjonsdeployment: `dpl_6xiEukiPwd6P2SgvjV6QtYXsPz7U`, `READY`, `target=production`, kilde `ca161ba5`. `https://expo-proffdok.app` og live JS svarte HTTP 200. Live JS inneholder PC-endringen, Production-binding `dqffxflaoyarbxyiyhop` og ingen Sandbox-binding. Production-Supabase er `ACTIVE_HEALTHY`.
- PC Prissøk har antall, valgfritt manuelt Cordel-ordrenummer, nye serverlagrede plukklister, Ny plukkliste og separate **Skriv ut plukkliste** / **Skriv ut priser**. Kameraskanning er bare på mobil. Eksisterende backend og tilgangsregler er gjenbrukt uten migrasjon.
- Tidligere mobil Prissøk/EAN, små strekkoder, inntil tre serverlagrede plukklister, mobilskanning i Generelt tilbud og PR #206 mot gjentatt tilbudsrecovery er bevart.

## Godkjenning og QA for PR #207

- Miljømål: **BEGGE**. Målrettede checks, hele `npm run check:critical`, Sandbox-build, GitHub Core Safety og diff-/scope-/dokumentkontroll er grønne.
- Innlogget Preview-QA ble utført på funksjonskode `d7fe0ae8acd3a489edc922132c25f3b5a1342b34`; den godkjente head `311e7d43` legger bare til QA-dokumentasjon. Kenneth godkjente den avtalte Preview-testen med `test ok` før Production-merge.
- Innlogget PC-test bekrefter nye lister, desimalantall, lagring/oppdatering, gjenåpning fra serveren, Ny plukkliste, vern av ulagrede endringer, Startside-retur og full sideoppdatering. Begge utskrifter er kontrollert: plukkliste har antall/ordrenummer uten priser; prisutskrift har kundepris og valgfritt tilgangsstyrte internpriser. Lagring/gjenåpning rydder en eldre byttebekreftelse, mens nye ulagrede endringer igjen krever bekreftelse.
- Backendtest i rollback verifiserer lagring/antall, revisjonsvern, tre-listersgrense, prisfri payload og brukerisolasjon. Ingen Production-data ble endret av QA.
- Sandbox-brukeren har testlisten `QA-PC-20261003`, én syntetisk Sopro-vare med antall 4 og revisjon 2. Ingen priser lagres. Listen er en QA-fixture, ikke en registrert Cordel-ordre.

## Permanent Demo Sandbox

- Godkjent funksjonskode `ca161ba5` er synkronisert kontrollert **main → demo**, merge `428ee71bec10ca1cd1f647e6ee0e998f6613a636`. Demo-overlay, syntetiske ressurser og Sandbox-data er bevart. Kontrollsidens baseline følger synkronisert `main`, også ved senere rene dokumentsynker.
- Full Demo-critical QA og Sandbox-build er grønne; builden krever Sandbox-binding `ppvircenkjizeiqdxphj` og avviser Production-binding.
- Verifisert Demo-deployment: `dpl_Fg1bEJScPgGHe1ekgnTUzudWaNGi`, `READY`, kilde `5bafb9f47d1f635cf9e5247b2cfb38f3b97d68d0`, med synkronisert `main`-baseline `a69fce07`. Fast Demo-app, `/demo-control.html` og de nye JS-filene svarte HTTP 200. Live funksjonskode har PC-utskriftsvalgene og Sandbox-binding. Senere ren dokumentsynk skal oppdatere kontrollsidens baseline og få ny innlogget preflight.
- Faktisk innlogget **Kjør preflight** på fast Demo er grønn 03.10.2026 etter fullført demo-innlogging. Kontrollsiden viser **✅ Demo Sandbox er klar.** Production-baseline er synkron, begge lokale Badskisser er installert (2/2), og serverkontrollene er grønne. De to skissene ble installert i den nye nettleseroriginen; serverdata, QA-plukkliste og Golden Demo er bevart uten reset.

## Neste handling

- PR #207 er godkjent og verifisert i Production, synkronisert til Demo og kontrollert med grønn innlogget preflight. Kjør alltid ny **Kjør preflight** før en viktig kundedemo. Ny `main`-commit, også dokumentasjon, krever kontrollert **main → demo**-synk med oppdatert baseline. Demo skal aldri merges tilbake til `main`; Sandbox-data og Golden Demo skal bevares.
