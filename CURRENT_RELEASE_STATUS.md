# Egne sjekkpunkter og godkjenningskø – Preview-arbeid

[Oppgave304](https://github.com/ExpoProffsenter/expo-proffdok/issues/304) gjelder flere bevarte lokale kladder, egne punkter for alle aktive ansatte og forslag til firmamal med separat firmagodkjenning. Eksisterende core-branch gjenbrukes fra publisert main; ingen ny branch. Migrering prøves kun i Sandbox før ny TEST OK. Ingen Production- eller demo-synk er godkjent for denne funksjonen. DesignPR295 kan vise funksjonen med uttrykkelig avhengighet til egen core-PR. Nøyaktig kandidat, CI, Preview og innloggede begrensninger vedlikeholdes i PR/oppgave304. [Endring og tester](docs/changes/checklist-template-proposals-20261031.json).

# Utførelsessjekklister – TEST OK og publisert 31.10.2026

Brukerens TEST OK gjelder signatur- og firmamalkandidat `2ccecedf`. Full Core Safety820/41150527338 SUCCESS10/10; PR301 er merget som `7c22018d3054b3bad31004bb556ada0af2e1e2c6`. Vercel `dpl_HDuQQSbhmBqTFPbr2L49n9CmW46R` er READY på samme commit og expo-proffdok.app. Faktisk Production-HTML/loader/bootstrap/app er sammenlignet med eksplisitt lokal Production-build; produksjonsbinding kontrolleres ved publisering. Gjeldende main-/demo-SHA, fullført main → demo, privat rollout-aktivering, preflight og eventuelle begrensninger vedlikeholdes i [PR301](https://github.com/ExpoProffsenter/expo-proffdok/pull/301).

Vanlige utførelsessjekklister har påkrevd tegnet signatur fra fullfører og separat valgfri ekstern signatur. Lagre som firmamal ligger rett etter punktene, før Signering, med eksisterende rettigheter og skille mellom utkast/publisering. Prosjektering, Bolig/UE, vernerunder, risiko og Overtagelse er utenfor. Fullført historikk er urørt. Tre additive SQL-filer er installert atomisk i Production som migrering20261031003022. PDF-Edge standalone-checklist-email v2 er ACTIVE/JWTtrue og har samme eksakte bundle som Sandbox v3. RLS/ACL og uendret historikk er kontrollert. Teknisk Production-prøve av signert kommando avviste manglende signatur og bekreftet kladd/readback med tilbakerulling; ingen nye testkontroller, prøve-e-post eller falsk reell signering. [Endring og tester](docs/changes/execution-checklist-signatures-20261031.json).

Eksterne sjekklister fra [PR299](https://github.com/ExpoProffsenter/expo-proffdok/pull/299) finnes via Meny → Sjekklister / Startside → Fyll ut sjekkliste. Ordrenummer og arbeidssted/adresse kreves; eksternt prosjektnavn og kunde følger også kontroll/PDF når utfylt. Ingen ProffDok-prosjektopprettelse. Nettleserfilbroens PDF-overføring, fysisk mobil/Safari, faktisk innlogget Production-prøve og reell e-postlevering er avgrenset i godkjenningsgrunnlaget.

Neste UX-ønske er notert i [oppgave302](https://github.com/ExpoProffsenter/expo-proffdok/issues/302): kompakte, stilige avkrysningsbokser i alle sjekklister, fingervennlig trykkflate, tydelig grønn V for OK/Ikke aktuelt og oransje Avvik. Ikke implementert som del av signaturreleasen.

DesignPR295 fortsetter separat fra sitt maleditor-/vedleggscheckpoint. Ingen redesign-TEST OK.

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
