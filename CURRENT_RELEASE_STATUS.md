# Release-status – kontrollert 01.10.2026

## Production

- Siste funksjonsendring på `main` er PR #206 («Stopp gjentatt tilbudsrecovery»), merge-commit `c6ece9fcef8b48dba7206522283795f189d48e5b`. Kenneth ga eksplisitt `TEST OK – Production godkjent`.
- Deployment `dpl_6DZLrKPVMqneoe4Q3hqajSBFv3Nw` for denne appkoden var `READY`, `target=production`; `expo-proffdok.app` svarte 200 OK. En avgrenset Vercel-kontroll fant ingen error/fatal i runtime-loggene. Andreas' opprinnelige gjentatte dialog kan bare bekreftes på hans enhet og lokale tilbudskladd.
- Tidligere godkjente endringer omfatter PR #201 (mobil Startside-knapp og EAN-skanning i Prissøk), PR #203 (bedre lesing av små strekkoder) og PR #205 (serverlagrede plukklister på tvers av enheter og mobilskanning i Generelt tilbud). Intern prisvisning og katalogtilgang er fortsatt serverstyrt; Cordel-overføring er manuell.
- Dette dokumentet beskriver verifisert funksjonsrelease. Senere rene dokumentasjonscommits kan flytte `main` uten å endre appfunksjoner eller den historiske deployment-ID-en ovenfor.

## Permanent Demo Sandbox

- Appkoden fra `main` er synkronisert kontrollert `main → demo`. Sist verifiserte Demo-funksjonsrelease var commit `129f0b8650dfd7a098ddbd71a467e011d29c0831`. Kontrollsidens Production-baseline oppdateres til siste synkroniserte `main`-commit også ved rene dokumentsynker.
- Fast Demo-deployment `dpl_7C7QuEp17wc6wxCMZUxviuK6FQ5P` for denne funksjonsreleasen var `READY`; app og `/demo-control.html` svarte 200 OK. Avgrenset Vercel-kontroll fant ingen error/fatal for denne deploymenten.

## Åpent før viktig demo

- Den innloggede **Kjør preflight** på https://expo-proffdok-git-demo-ringside.vercel.app/demo-control.html er fortsatt ikke attestert grønn. Skybrowseren viste «Ikke innlogget i sandboxen»; dedikert demo-bruker må kjøre kontrollen før viktig kundedemo.
- Kun `main` og `demo` er GitHub-brancher ved denne kontrollen. Demoressurser og sandbox-overlay skal aldri merges `demo → main`.
