# Gjeldende leveranse – 27.10.2026

## Varebestilling

Varebestilling er publisert for proffkunder med eksisterende katalogtilgang og interne Ringside/Expo-brukere med Prissøk. Interne brukere finner Prissøk → Varebestilling → Firmaprofil, samt Åpne varebestilling i Prissøk. Proffkunder beholder sitt avgrensede vareutvalg.

Funksjonsrelease: main `4a33cef5d791a7bc804e7acfdad4d59dae772601`, fra godkjent kandidat `7ce1a3f21a53617c9e977e32006f6191387894e3`. Full Core Safety #729 / 40580430716 er grønn. E-postlayouten følger etablert mal; Cordel ASCII og Excel er prisfrie. Rutine-e-post er fortsatt deaktivert.

Kenneth har gitt TEST OK og bedt om reell e-postprøve i Production. Faktisk mottak hos testmottaker gjenstår til det er bekreftet. Det er ikke sendt prøve-e-post fra Sandbox eller via utviklertestene.

- [Produksjonslogg og tilbakeføring](docs/qa/PRO_CATALOG_ORDERS_RELEASE_20261027.md)
- [PR290 – siste faktiske deployment-, demo- og teststatus](https://github.com/ExpoProffsenter/expo-proffdok/pull/290)
- [Arkitektur og tilgang](docs/architecture/PRO_CATALOG_ORDERS.md)

Senere dokumentasjonscommits endrer ikke funksjonsreleasen over. Aktuell main/demo-SHA og faktisk publisert versjon føres i PR290.

## Arbeidsprosess og historikk

Følg `docs/DEVELOPMENT_WORKFLOW.md`: én varig endringsbeskrivelse, relevante dokumenter og kontrollert main → demo med bevart overlay og preflight. PR289 dokumenterer prosessforenklingen, PR288 tidligere kundepreview-rettelse.

Eldre releasebevis finnes i Git-historikken og [arkivet](docs/archive/RELEASE_STATUS_BEFORE_PROCESS_20261026.md). Historiske ventende punkter overstyrer ikke senere verifiserte PR-er.

## Permanent Demo Sandbox

Denne branchen beholder demo-overlay, syntetiske ressurser og Sandbox-konfigurasjon. Den er kontrollert synkronisert fra publisert main `0301c8e570557da79bb0a7d86b27fc80207a0eff`. Faktisk deployment og ny preflight føres i PR290. Tidligere demo-status er bevart i [eget arkiv](docs/archive/SANDBOX_RELEASE_STATUS_BEFORE_PROCESS_20261026.md). Ingen reset, seed eller e-postutsending inngår i synkroniseringen.
