# Timer og utlegg – release 15. oktober 2026

Miljømål BEGGE. Kenneths TEST OK gjelder funksjonskilde `b50f30907799c3b27602252111cfabb2fa073863`. PR #245 er merget som `f65a9768db342687caff220a3081b65a2ab732f2`. Fersk PR Core Safety run `38712881586`, jobb `116348373809`: alle steg SUCCESS. Tidligere funksjons-QA: 123 PostgreSQL, 87 faktiske React og 26 faktiske Sandbox-kontroller, full critical/build samt eksisterende HR-/Hjelp-/Min side-/navigasjonstester PASS.

Production `dqffxflaoyarbxyiyhop`: migrasjoner `20261014144538`, `20261014160424`, `20261014161822`, `20261014165602` installert og registrert. Private time-tabeller/bucket/RPC/cron er på plass; ingen anonym execute, bucket public=false, to aktive cron-jobber. Eksisterende ikke-timefunksjoner har samme fingeravtrykk `54c90601ea2f5ed1e99797c9f96db549`; gamle policies `e66e7db624acc13ca1503285117884db`; 10 eksisterende HR-medarbeidere beholdt. Firmaoppsett og timeuker er tomme fra starten. Autentisert, autorisert firmaadmin kan lese nytt tomt oppsett; mobilsnarveien er av som standard.

Workers time-cleanup/time-notifications ACTIVE v1 med egen Vault-autentisering. Cleanup-endepunkt og time-mail-endepunkt peker til Production. Time-mail enabled=true. Faktisk server-til-server helsesjekk gjennom pg_net: HTTP 200 `{idle:true}` og HTTP 200 `{removed:0}`. Transport-/avsenderkonfigurasjon ble godkjent før idle-svaret. Ingen testmail er sendt; ingen mottaksprøve påstås. Andre mail-workers/-innstillinger er uendret.

Vercel `dpl_6cdFCWaLM4XrUV9MSEaQUyqgVayk` READY, target production, riktig main-SHA og domener expo-proffdok.app/www. HTTP 200 på forside, HTML-entry, bootstrap, faktisk app-chunk og MobileTimeShortcut-chunk; korrekt Production-binding verifisert. Nettleserens kjente native-credential-sperre er ikke omgått, og ingen ny innlogget Production-/mobilskjermprøve påstås.

Migreringsverktøy ga periodisk `Invalid or expired requestState`. Første hovedmigrasjon og timerfix ble installert med apply_migration; øvrige to via én eksplisitt transaksjon. Versjoner er justert til repoets eksakte filnavn. Midlertidig, ikke offentlig tilgjengelig overføringstabell er fjernet. Ingen delvis staging eller ukjent migrasjonsstatus gjenstår.

Main → demo synkroniseres fra den verifiserte Production-committen. Demo-overlay, kursinnhold, sandbox-binding og sikkerhetssperrer beholdes. Kontrollsidens SANDBOX_PRODUCTION_BASELINE peker på samme main. Faktisk preflight før synk: alle 19 infrastruktur-/Golden-kontroller og alle fem HR/KS/HMS-kurspunkter grønne. Sandbox har allerede alle fire migrasjoner, egne workers og time-mail AV. Ny preflight/build/deploy føres i PR #245 ved publisering. Ingen demo → main-synk.

Firmaadmin starter i HR → Timer og utlegg → Timeoppsett, lagrer egne kategorier, ansattnumre og lønnskoder og aktiverer timeregistrering. Vis snarvei til timeføring på mobilforsiden er et separat frivillig valg per firma. Import i et konkret lønnssystem gjenstår til system/format er valgt.
