# Sjekklister for eksterne prosjekter – korrigert krav30.10

PR299 oppdateres etter Kenneths presisering: ordrenummer er påkrevd, med arbeidssted/adresse og valgfrie eksternt prosjektnavn/kunde på lagret kontroll og PDF. Egen Meny → Sjekklister og Startside → Fyll ut sjekkliste; ingen ProffDok-prosjektopprettelse. Lokal DB92/mail-PDF43/nativebrowser106 og full Sandbox critical/buildPASS. Ny additive migrering/Edge og faktisk Preview-sluttprøve føres på eksakt kandidat i [PR299](https://github.com/ExpoProffsenter/expo-proffdok/pull/299). Tidligere blank-ordre-test bevares som historikk. Ingen Production-publisering eller faktisk e-post.

Testgrenen har eksplisitt EXPO_BACKEND_TARGET=sandbox kun for Preview. Den tidligere feilkoblingen til Production er rettet og kontrollert i faktisk publisert kode på ca0a7f62/fullCI812SUCCESS; demo-innlogging ble deretter bekreftet. DesignPR295 fortsetter separat fra sitt maleditor-/vedleggscheckpoint. Ingen redesign-TEST OK.

# Gjeldende leveranse – 27.10.2026

## Saksbehandler for akseptvarsel – publisert 29.10.2026

Kenneth autoriserte Production på grunnlag av utviklertester. PR296 er merget som `fd87265d2b4b9a4556287b157f0ca77f785827fc`, etter full Core Safety #768 / 40940249573 SUCCESS. Vercel `dpl_Bif1ZERHqyLfnETAJ7ruFdE8Jecy` er READY på eksakt commit og expo-proffdok.app. Hovedapp og SalesModule er byteidentiske med lokal Production-build; ingen Sandbox-binding i hovedappen.

Production har migrering `20261029193247` og acceptance-notify v8. Nye funksjoner er identiske med Sandbox, eksisterende public-funksjoner uendret, privat RLS/ACL kontrollert. 20 reelle kandidater i lesende databaseprøve med eksisterende Kenneth-kontekst. Dette er ikke en faktisk innlogget nettleserøkt. Ingen saksbinding/backfill eller prøve-e-post er utført. Eldre fritekstsaker må få ett eksplisitt lagret saksbehandlervalg; navn blir ikke automatisk oversatt til bruker-ID.

[Release, QA og tilbakeføring](docs/qa/SALES_CASE_HANDLER_RELEASE_20261029.md). Gjeldende demo-SHA og sluttkontroll vedlikeholdes i [PR296](https://github.com/ExpoProffsenter/expo-proffdok/pull/296). Design-PR295 er fortsatt separat Preview og har ingen produksjonsgodkjenning.

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
