# Kontrollert main → demo, 2. november 2026

## Godkjenning og kilde

Kenneths eksplisitte TEST OK kl.16:02 CET omfatter PR294/295/298/305, nødvendig databaseoppdatering, Production og demosynk. Ingen ny godkjenning kreves for uendret avtalt omfang. PR217/277, opprydding, Solgløtt, nye videoer og andre funksjoner inngår ikke.

Production-kilde: main34daef4c0526b93ddbd84c3bfd97fb0833d97caf. Tre83194d266f6901a775c133467abf5b129a0650a9 er identisk med sluttkandidat22eecb54, full CI888/run41490848102 SUCCESS10/10. Vercel Production er READY dpl_3D5fzV9TVkidd7x7Eowg3V6hWjQ2. Faktisk anonym Chromium laster HTTP200, main-BzfJHr2J.js, Production-ref og ikke Sandbox-ref. Deltakerstil og videotekstfil er publisert. Den kjente anonyme oppstartsmeldingen Innlogging er ikke klar ennå forekommer; dette er ikke en innlogget funksjonsattest.

Forrige demo: fd04ac9a31dee75d29d1c770b65b5edf023b619c / dpl_H8cXav9UGpnofomAu6pbN6Rt8CTq. Den nye demo-committen har denne som første forelder og faktisk main34daef4c som andre. Ingen demo-kode merges til main.

## Integrasjon og bevaring

Lokal mergeøvelse er gjennomført fra samme appkilde før demosynken. Sju konfliktfiler ble gjennomgått. De gamle desktop-/mobil-Startsiden-blokkene erstattes av godkjent fellesramme; native sjekklisteflagg, Vis dokumentasjon, tom-lokal-kladd-vern og nye hjelpetekster følger main. Tester beholder alle nye og tidligere krav. Ingen ny produktretting eller svekking av guards.

Demoens eksisterende index-vindusnavnvern, kontrollside, demoåpning av salgssak, Sales-recoveryvariant, salesLocalStorageCore, miljøbinding og ressursstier beholdes. De to Sales-filene er sammenslått med det godkjente designinnholdet. Eksakte testede kilder kontrolleres via Git-blob før branchoppdatering. En første overføring av SalesModule hadde to ekstra blanklinjer; hashkontrollen oppdaget dette, og den korrekte testede blobf69ca5c6 ble overført før publisering. Ingen feil blob publiseres.

Alle eksisterende demo-/AI-bilder, dokumenter og installasjonsgrunnlag beholdes byteidentisk. Ingen installasjons-, seed- eller reset-script kjøres. De separate demo-/kursmanualene beholdes. De to store felles README-/arkitekturdokumentene følger ny main, mens demoens fulle eldre varianter er arkivert byteidentisk slik at historiske egne releasekvitteringer ikke går tapt.

## Faktisk kontroll før publisering

Demo critical/build med eksplisitt Sandbox-binding PASS. Kontrollsidens preflighttest PASS med avvisningsscenarioer. Faktisk sjekkliste-React verifiserer save/reopen, tapt svar, kollegakonflikt, signering, historikk, immutable fullførte kontroller og read-only/support. Tilbudseditor292 og Generelt tilbud229, oversikt311 og boligveiledning242 krav PASS med faktiske komponenter og syntetisk transport. Kilde til felles app er byteidentisk med Production der det ikke finnes dokumentert demo-overlay.

SQL-demo ppvircenkjizeiqdxphj kl.17:26 UTC: BEGIN READ ONLY / ROLLBACK, demoaktør satt kun i transaksjonen. Preflight19/19 og kurs5/5 består. HOVED, RESERVE, medier, garantipunkter, signert kontrakt/overtagelse og Golden finnes. Ingen data skrives. Dette er SQL-kontroll, ikke brukerpålogging. Samme preflight og faktisk SHA/alias/binding/ressursfiler kontrolleres igjen etter deploy; kvitteringen føres i PR295.

## Begrensninger, freeze og tilbakeføring

Den tidligere innloggede skynettøkten er ikke gjenopprettet. Ingen full ny innlogget rolle-/Safari-/kamera-/dvaletest eller ny slutt-PDF fra levende brukerøkt hevdes. Publiseringen bygger på eksplisitt godkjente utvikler-/regresjonstester og Kenneths Preview-prøve. Før viktig visning bør den faktisk brukte innloggede flyten og rapporten åpnes; ingen reelle kundeutsendinger som test.

Etter publisert verifikasjon: stabilitetsstopp før3.november. Ved feil i demo: gå tilbake til demoens forrige kontrollerte deployment/fd04ac9a, ikke Production. Production har eget tilbakeføringsgrunnlag70a99b3e/dpl_FGu9g1fHQSk4i9mvQPCAxacRReq6 før siste designetappe; hele releasens tidligere grunnlagb389c707 står i produksjonsloggen. Den additive forslagsdatabasen og eventuelle nye forslag skal ikke slettes ved frontend-rollback.
