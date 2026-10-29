# Akseptbekreftelse til gjeldende saksbehandler – release 29.10.2026

Miljømål BEGGE. Kenneth ga uttrykkelig klarsignal til Production basert på utviklerverifisering, fordi han ikke selv kan teste mottakerrutingen. Dette gjelder PR296; design-PR295 er separat og ikke produksjonsgodkjent.

## Kode og verifisering

- Grønn kandidat `79e4e2937e34ab6f61ff60f11a01bbb121f9af44`, tre `95e46835533c913d8b7eed00f7ba8fe650e90cf6`.
- Full PR Core Safety #768 / 40940249573 SUCCESS: alle åtte pakker og sluttkontrollen. Faktiske CI-logger bekrefter 105 handler-SQL-kontroller, 111 Edge-/wrapperkontroller, 31 opprettings-/RPC-kontroller og 23 faktiske React/Chromium-kontroller. Eksisterende kundeopsjoner: 41 PostgreSQL- og 116 Chromium-kontroller. Lokal boligdatabase: 1727 PASS.
- #766 feilet i eksisterende datoavhengig boligfixture: deviation kunne ligge etter side én. De opprinnelige type-/antallsassertionene ble flyttet etter eksisterende komplett paginering. Ingen assertions eller produktregler ble svekket. #767 ble avløst av ready-for-review-kjøringen #768 gjennom eksisterende concurrency-regel; ingen gjentakelse til grønt.
- Preview `dpl_6d19hefXJtZvNMkagwSmJrTzfpzW` READY på kandidaten. Faktisk hovedbundle har bare Sandbox-binding og er identisk med foregående verifiserte Preview-app. Sandbox-kandidatlisten ga 4 kvalifiserte brukere i lesende databasekontekst.
- Production-merge `fd87265d2b4b9a4556287b157f0ca77f785827fc` har samme tre. Vercel `dpl_Bif1ZERHqyLfnETAJ7ruFdE8Jecy` READY på eksakt SHA og expo-proffdok.app.
- Faktisk HTTP200 og identiske frontendfiler mot lokal Production-build: main-92EXXuUP.js SHA256 `ca23ab17e08837edb9a3d7dcfe39f34690953cef872c3dc4d5fbff0a42971c82`; SalesModule-e7te8S3A.js SHA256 `ab1e1b4d2740250ea4aa3fde09e9097d6315a21fa819283a9ef49824f53fef76`. Hovedappen har Production-ref og ingen Sandbox-ref.

## Backend og avgrensning

Production-migrering `20261029193247_sales_case_handler_identity` er installert én gang. Sandbox har samme kilde under versjon `20261029191431`, som også er repoets migreringsfilnavn. Kontroller registrert navn/versjon og faktiske objekter før fremtidig installasjon; disse er allerede utført.

Privat tabell har RLS og 0 bindinger opprettet av migreringen. Authenticated mangler direkte SELECT, anon mangler kandidatliste/setter, authenticated mangler service-resolver, service_role har resolver. De sju nye funksjonenes samlede definisjonsdigest er identisk med Sandbox: `dd1268fe829584a7cd2171d4ac026f9c`. Eksisterende public-funksjoners digest er uendret: `04d33411d102edf1640e69a9228d603b`.

Acceptance-notify v8 ACTIVE beholder eksisterende verify_jwt=false og egen public-token-kontroll. Hentet deployet kilde er eksakt lik kandidaten/Sandbox. Bundle `9d2ba97da936723a43da45f15a3100bd7f0e634d7c37371859175984d2dea447`. Ingen secrets eller øvrige funksjoner/utsendingsjobber er endret. Advisor-deltaet er den tilsiktet lukkede private RLS-tabellen og to autentiserte definer-gatewayer med eksplisitt aktørkontroll; ingen nye anon-grants. Øvrige advisorfunn er uendret.

Lesende Production-prøve i rollback-transaksjon med eksisterende Kenneth-kontekst gir 20 kvalifiserte saksbehandlere. Dette bruker faktisk skjema/tilgangsfunksjoner, men er ikke autentisering via en nettleserøkt. Ingen saksbinding, kundeaksept eller reell utsending brukes som test. Faktisk anonymt Production-POST uten tilbudstoken returnerer HTTP400 «Mangler tilbudstoken» før noen sending.

Nye saker krever eksplisitt bruker-ID. Eldre saker med bare fritekstnavn krever ett valg og **Lagre saksbehandler** før internt akseptvarsel kan sendes. Ingen navnegjetting, automatisk backfill eller ny utsending av historisk aksept. Kundekvittering og historisk dedupliseringsslot beholdes. En tidligere feilet/reservert melding får ikke automatisk retry.

## Demo og tilbakeføring

Kontrollert main → demo, bevart overlay, faktisk demo-SHA/deployment og ny preflight føres i PR296 ved sluttkontroll. Ingen golden reset, seeding eller kursdataendring inngår. Rutine-e-post forblir deaktivert.

Forrige Production er main `5f58b1c6ca974e0cf97cb4b945c8d6603a39f485`, Vercel `dpl_5rvFAAsZ4WDeDwWj7Gg6qa3NLfkm`. Frontend kan tilbakeføres, men den additive private tabellen/bindingene må bevares. Backendrollback må beholde kanonisk saksbehandler eller stoppe intern utsending; gammel publisherfallback skal ikke gjeninnføres stille. Kundekvittering og øvrige transportflyter skal bevares. Ikke kjør destruktiv nedmigrering.

Ingen faktisk e-postleveranse, fysisk mobil/Safari eller ny innlogget helappøkt er attestert. Aktuell CI bruker faktiske komponenter med syntetisk transport. Lokal ny Chromium-nedlasting feilet i kjøremiljøet; den faktiske nettleserprøven er verifisert i CI, ikke rapportert som en ny lokal pass.
