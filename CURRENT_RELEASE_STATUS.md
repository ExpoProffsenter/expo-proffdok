# Preview-gjennomgang – 29.10.2026

PR295: app-ramme/startside er fortsatt draft. Sist fullgrønne kandidat før dagens videre rettelser er 92035a78 / Core Safety #762. Designparitet for salgsoversikt/sak og prosjekt/sjekklister kontrolleres samlet; eksakt ny kandidat, CI og fast Preview føres i PR. Full funksjonsinventering: [kontrollmatrise](docs/qa/proffdok-full-function-matrix-20261029.md) med 36 moduler, 605 kildefiler og navngitte eksisterende kontroller. Inventar er ikke full manuell attest.

Lesende e-postundersøkelse: [mottakerlogikk og HR-finnbarhet](docs/qa/MAIL_ROUTING_AUDIT_20261029.md). Ingen endring i mottakere eller utsendingsoppsett. HRs egen aktiverte fristmotor er adskilt fra KS/HMS-rutineutsendingens sperre.

PR294: isolert boligrettelse for fasadehøyde og adressefokus ved byggvalg, ny 16-hus-fixture. Eksakte kandidater/CI/Preview-bevis vedlikeholdes i PR-ene. Ingen app-TEST OK, merge eller produksjonssetting.

# Gjeldende leveranse – 27.10.2026

## Varebestilling

Varebestilling er publisert for proffkunder med eksisterende katalogtilgang og interne Ringside/Expo-brukere med Prissøk. Interne brukere finner Prissøk → Varebestilling → Firmaprofil, samt Åpne varebestilling i Prissøk. Proffkunder beholder sitt avgrensede vareutvalg.

Funksjonsrelease: main `4a33cef5d791a7bc804e7acfdad4d59dae772601`, fra godkjent kandidat `7ce1a3f21a53617c9e977e32006f6191387894e3`. Full Core Safety #729 / 40580430716 er grønn. E-postlayouten følger etablert mal; Cordel ASCII og Excel er prisfrie. Rutine-e-post er fortsatt deaktivert.

Kenneth har gitt TEST OK og deretter uttrykkelig bestilt én testmail til seg selv. Agenten sendte den fra faktisk Production til kenneth@ringside.no med TEST – SKAL IKKE LEVERES. Appen og e-posttjenesten bekreftet sendingen. Faktisk mottak/vedlegg/layout i innboksen gjenstår til Kenneth bekrefter det. Ingen prøve-e-post er sendt fra Sandbox. Se docs/qa/PRO_CATALOG_ORDER_ENTRY_20261027.md.

- [Produksjonslogg og tilbakeføring](docs/qa/PRO_CATALOG_ORDERS_RELEASE_20261027.md)
- [PR290 – siste faktiske deployment-, demo- og teststatus](https://github.com/ExpoProffsenter/expo-proffdok/pull/290)
- [Arkitektur og tilgang](docs/architecture/PRO_CATALOG_ORDERS.md)

## Varebestilling: antall og Enter – publisert

Kenneths nye TEST OK gjelder kandidat `bbe67f1a`, publisert som main `a31c0673ba917a677954dc94bfd5ead0dbd0471f` etter grønn Core Safety #731 / 40585298385 og faktisk innlogget Preview-prøve. Pluss/minus, piltaster, Enter til neste varesøk og fokus i antall er publisert. Vercel `dpl_FVLJFLV6UJtwQ6NZ8wW9F3dbqFgZ` READY på eksakt SHA; faktisk Production-HTML/hovedapp/ordrekomponent er identiske med lokal Production-build, og innlogget Production viser nye kontroller og bevart låst sendekvittering. Ingen backend, database eller ny e-postsending.

[PR292](https://github.com/ExpoProffsenter/expo-proffdok/pull/292) er varig logg for godkjenning, faktisk main/demo-SHA, deployment, preflight og tilbakeføring. Rene dokumentasjonscommits endrer ikke funksjonsreleasen. Se [QA og release](docs/qa/PRO_CATALOG_ORDER_ENTRY_20261027.md).

## Arbeidsprosess og historikk

Følg `docs/DEVELOPMENT_WORKFLOW.md`: én varig endringsbeskrivelse, relevante dokumenter og kontrollert main → demo med bevart overlay og preflight. PR289 dokumenterer prosessforenklingen, PR288 tidligere kundepreview-rettelse.

Eldre releasebevis finnes i Git-historikken og [arkivet](docs/archive/RELEASE_STATUS_BEFORE_PROCESS_20261026.md). Historiske ventende punkter overstyrer ikke senere verifiserte PR-er.
