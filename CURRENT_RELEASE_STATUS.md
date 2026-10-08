## Gjeldende avklaring – eksisterende Resend, Sandbox uten reell sending

8. oktober 2026: Kenneth autoriserer videre kontroll og gjenbruk av eksisterende Resend. Sandbox/Preview holdes uten ekte KS/HMS-e-post; tidligere krav om å sette Sandbox-hemmeligheter/aktivere der er erstattet. Lesende Production-kontroll bekrefter smart-worker v18 ACTIVE med RESEND_API_KEY/CHAT_FROM_EMAIL. KS/HMS-kilde bruker allerede de samme prosjekthemmelighetene; smart-worker/payload endres ikke. Sandbox har også smart-worker v18, så eldre e-posttester kan ikke utelukkes; metoden er ikke gjenfunnet. KS/HMS enabled=false er direkte SQL-verifisert. Dagens permanent-test bruker providerstub, ikke innbokslevering. Se [gjeldende oppsett](docs/kshms/EMAIL_SETUP.md).

Miljømål BEGGE; kun dokumentasjon endres i denne runden. Ingen Production-merge/DDL/deploy, ingen hemmelighetsendring og ingen sending. Før senere uttrykkelig godkjent release: gjenbruk Production-konfigurasjon, riktig Production-origin/endepunkt, autentisert check uten sending og kontrollert mottaksprøve. Tidligere QA/popup/Preview-bevis består; ikke bygg om ferdig kobling.

# Gjeldende release-status – 8. oktober 2026

Miljømål: **BEGGE**, først feature/Sandbox Preview.

## Production

Main er kontrollert uendret på `155f6c4ac01f126c1db0c65da385cfd9305587d5`. Production Vercel `dpl_9wsjTrEVzvAF6jf7f9HgvzskYP5z`, https://expo-proffdok.app, Supabase `dqffxflaoyarbxyiyhop`. Ingen KS/HMS-produksjonsmigrering, merge eller release er utført.

## Aktiv branch og Preview

Branch `feat-kshms-foundation`, [PR #216](https://github.com/ExpoProffsenter/expo-proffdok/pull/216), open/draft. Fast [Sandbox Preview](https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe), backend ppvircenkjizeiqdxphj. Nyeste funksjonskode `e96e20ade6605ddb0e8bc735f862ef842ea9b1b8`, tree `dc9c7397eb66bcedcee930769c1243c82f72523d`, READY med grønn CI (bevis nedenfor). Tidligere prosjekttillegg: Funksjonskode `8bce982fb75bf105ee614601e604e438f89a78bc`, tree `ed17f78782d6a49944bd55be6b008d0ef29995e9`. Fast Sandbox Preview er READY på `dpl_4gwb3VsRp7Wf2GWmRrxFNre8DY87`, med samme feature-alias og eksakt SHA. PR Core Safety `37827572425` og jobb Core safety + critical build `113484256816` er completed/success på samme SHA. Lokal og publisert tree er identiske. Tidligere funksjonskode med kladdrettelsen `cdac7cf1fe50b724bb87163422e5a0424b01fd58`, tree `47f6249fb6433a6181c9ac94256dd862b097f3bd`: samme faste Preview er READY på `dpl_7ViZBuSk1G3bjNJ8vUfozN2u8Qhn`. PR Core Safety `37788569184`, jobb Core safety + critical build `113349595488`, er completed/success på samme SHA. Branch-spesifikk `EXPO_BACKEND_TARGET=sandbox` er kontrollert (target preview, branch feat-kshms-foundation). Senere dokumentregistrering endrer bare notater. Bevis: [EXECUTIONS_20261008.md](docs/kshms/EXECUTIONS_20261008.md).

## Popup og ansvarse-post – publisert og grønn

Prosjekttilleggets TEST OK er registrert 8. oktober kl. 21:04 Europe/Oslo. Fullført-popupen lukker etter bekreftet lagring/readback. Ansvarse-post omfatter alle dagens KS/HMS-oppgavetyper, pliktig rutinegjennomgang og forfalt håndbokrevisjon. 36 nye + 45/54/73/93 relevante rollback SQL-kontroller PASS; faktisk React/DOM med simulerte RPC-er og permanent mailer-/lenkeprøve PASS. Full Sandbox critical/build PASS exit 0. Signert SJA/rutineutgaver er uendret. Sandbox-migrasjon 20261008192529 og mailer v4 ACTIVE. Faktisk check HTTP503 viser manglende Resend-nøkkel og avsender; enabled=false, ingen ekte sending. Samme feature-Preview er READY med grønn CI. Funksjonskode `e96e20ade6605ddb0e8bc735f862ef842ea9b1b8`, tree `dc9c7397eb66bcedcee930769c1243c82f72523d`. Samme faste feature-Preview er READY på `dpl_HNUqhySypafZmk9d9CaQXSUVZcVn` med eksakt SHA/alias. PR Core Safety `37833698123`, Core safety + critical build `113505254109`, completed/success. Lokal og publisert source tree er identiske. Preview-binding EXPO_BACKEND_TARGET=sandbox er kontrollert for feat-kshms-foundation. Ingen Production-endring. Se [testbevis og omfang](docs/kshms/NOTIFICATIONS_20261008.md) og [oppsett](docs/kshms/EMAIL_SETUP.md).

## Prosjekttillegg – publisert og grønn

Originalarbeidet er gjenfunnet etter environment_offline; forbindelsen er tilbake. Vernerunde/5×5 har prosjektinnganger, separate prosjektoversikter/kladder, fast ansvarligvarsel til lagret egen fullføring, valgbare godkjente rutineutgaver og stor avkrysning ved fullføringsknappen. 44 nye rollback SQL-kontroller, faktisk React-prosjekt/varsel/dialog og eksisterende relevante scenarioer PASS. Ny Hjelp og kort testliste er oppdatert. Ingen ny DDL i gjenopprettingen. Full sluttbygg/critical-kjede PASS med exit code 0; CI og fast Preview er bekreftet grønne på 8bce982f. Se [prosjekttillegget](docs/kshms/PROJECT_EXECUTIONS_20261008.md).

## Ny leveranse – vernerunder/kontroller og 5×5-risiko

Begge verktøyene ligger i KS/HMS og kan brukes med eller uten et faktisk firmaprosjekt. Utkast, egne sjekkpunkter/fast malutgave, svar/bilder, ansvar/frister, egen fullføring og bevart historikk er bygget. Kontrollavvik opprettes én gang via eksisterende sak/varsel. Risiko har tomme scorer, firmavurderte grenser, planlagt/kontrollert effekt og uttrykkelig beslutning. Fullførte dokumenter og historisk identitet beholdes.

54 faktiske Sandbox SQL-kontroller PASS med full rollback. Reell React-/dialogflyt med RPC-fixture og permanent kritisk prøve PASS. Signert SJA (1) og rutineutgaver (10) har samme fingeravtrykk før/etter. Migrasjon 20261008131207 finnes bare i Sandbox. Advisor-varslene om RPC-only RLS og tilsiktede SECURITY DEFINER-grants er vurdert mot faktiske negative tilgangsprøver; nye FK-indekser beholdes. Ingen generell advisor-opprydding er hevdet. Endelig full Sandbox critical/build PASS. Samme Preview er READY; publiseringsbevis står i [EXECUTIONS_20261008.md](docs/kshms/EXECUTIONS_20261008.md). Prosjekttillegget er TEST OK 8. oktober kl. 21:04; bare ny popup-prøve og senere faktisk e-postlevering gjenstår.

## Tidligere rapportleveranse og QA

Kenneths «kjør» kl. 13:38 autoriserer valgfri prosjekt-SJA/RUH i Rapport/PDF/utskrift. Dialogen brukes av alle tre eksportfunksjoner og viser bare prosjektets tilgjengelige dokumenter. SJA får lagret rutinehenvisning, deltakere/medvirkning og PL-signatur. RUH får hendelse/tiltak/ansvarlig/frist/status/egen kontroll/lukking. Utkast/åpne saker merkes. Ingen automatisk avkrysning eller ny lagring i prosjekt-/portal-JSON.

34 rollback SQL-kontroller PASS; faktisk React, 5 PDF-er med jsPDF 2.5.1, 3 utskriftsdokumenter og visuell kontroll av 12-siders lang PDF PASS. Eksisterende signert SJA og 10 rutineutgaver er bevart. Full endelig Sandbox critical QA/build, PR Core Safety og release-docs-guard PASS. Ny read-only RPC/migrasjon 20261008115650 er bare i Sandbox. Security Advisor: tilsiktet authenticated SECURITY DEFINER-grant er gjennomgått med funksjonens porter og negative tilgangsprøver. Ingen påstand om at alle eksisterende advisor-varsler er løst. Se [rapportomfang og QA](docs/kshms/PROJECT_REPORT_20261008.md).

## Kenneths tester

Rapporttillegget er TEST OK 8. oktober kl. 14:48 Europe/Oslo på kontrollert head 564778722c17d77358464de4fe465d02d336956e / funksjonskode f5c28dd3324a89ec0dd15b3f0c187d47e7bf1e9c. Gjelder prosjektets rapportvalg og PDF med/uten SJA/RUH. Neste del er vernerunder/selvstendige kontroller og 5×5-risikovurdering; ingen Production-godkjenning.

Tidligere håndbok-, avvikspopup/lukking-, menyretur- og sjekklistepopup-prøver er TEST OK for sine prøvde leveranser. TEST OK 8. oktober kl. 01:28 Europe/Oslo for meny, RUH-inngang og norsk dato gjelder kontrollert head 42204af397fc1fb6187e7e475c951ecdcd007550. TEST OK kl. 13:30 for SJA-utkast/rutinenummer/lagring/gjenåpning og RUH-oppfølging/ansvarligvarsel/egen dokumentert lukking/bevart sak gjelder kontrollert head 75f6ba1f53817a17e4efb3cac778a63d3cfcb9c5. Dette godkjenner ikke hele KS/HMS eller Production. Rapporttillegget er også TEST OK kl. 14:48 og skal ikke prøves på nytt uten konkret feil.

## Gjenstående og neste handling

Bare de nye vernerunde-/risikoflytene i USER_TEST.md skal prøves nå; godkjente delprøver gjentas ikke. Første rapportdel har dokumenttekst og elektronisk signering/lukking; RUH-bildevedlegg og full endringshistorikk følger ikke med. Ingen ny innlogget nettleser-/mobil-/flere faktiske brukerøkter-PASS hevdes. Den eksisterende skynettleserfanen åpner fast Preview på innloggingssiden; tidligere avviste credential-kall gjentas ikke.

Vedleggs-/øvrige rapportuttrekk, separat HR/kompetanse/medarbeidersamtaler og fristpåminnelser gjenstår før Ringside-pilot som avtalt. Sandbox-e-postsending er deaktivert; avsenderoppsett/faktisk mottaksprøve gjenstår. Utførelse før HR; leder bare tildelte ansatte, firmaadmin alle/tildele ansvar. Relevant TEST OK og eksplisitt PRODUCTION GODKJENT for PR #216 kreves før Production-migrering/merge. Senere synkretning main → demo.

Fortsettelsespunkt: [OVERSIKT.md](docs/kshms/OVERSIKT.md) og [CONTINUITY.md](docs/kshms/CONTINUITY.md). Eldre release-status er bevart i [arkivet](docs/kshms/archive/CURRENT_RELEASE_STATUS_before_TEST_OK_20261008.md).
