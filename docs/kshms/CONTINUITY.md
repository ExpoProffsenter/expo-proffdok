## Rutine- og sjekkliste-PDF – avgrenset B/C-del, 8. oktober 2026

Utgangspunkt feature-head `aea7e76672380e8e914a234d8cc9ae9b629434c3`, main `155f6c4ac01f126c1db0c65da385cfd9305587d5`. Miljømål BEGGE, bare samme feature/Sandbox nå. Tidligere TEST OK og åpne nye delprøver beholdes. PR #216 er draft. Ingen HR, Production/main/demo-release, databaseendring eller ekte e-postsending.

Egne PDF-er fra godkjente rutineutgaver, publiserte sjekklistemaler og lagrede prosjektkontroller er implementert. Rutine viser R-nummer/utgave, firmaets lagrede tekst, godkjenner/kilder og ID/hash. Egen ansattbekreftelse og andre ansattes opplysninger eksporteres ikke. Historiske kontooppslag merkes når navnesnapshot mangler. Sjekklistemal er tydelig tom mal; upublisert kladd tas ikke med. Prosjektkontroll viser eksakt lagret mal-ID, kontroll/revisjon, svar, kommentarer, bilder og eventuell lagret fullføringsidentitet/tid. Utkast merkes under arbeid; kontrollens fullføring lukker ikke avvik. Filvedlegg er navngitt med tydelig beskjed om at originalfilen ikke følger PDF-en. Ingen automatisk rapport-/portaldeling.

Eksisterende lesende RPC-er og firmaprofil brukes. Tilgang og samme utgave kontrolleres både før og etter PDF-/bildeinnlasting. Prosjektkontroller beholder eksisterende prosjekttilgang uten krav om personlig KS/HMS-grant. Nye/ulagrede kontroller og redigerte svar sperres. Manglende bilde stopper eksport; manglende logo gir firmanavn og synlig beskjed. Filadresser/token kommer ikke i PDF-en. Profil-, bruker-, skjerm-/dokumentbytte stopper sene uttrekk. Ingen automatisk save/publish/sign/complete.

Utviklerprøver: permanent ny document-PDF-critical PASS; fem faktiske React/jsPDF-uttrekk PASS med simulert RPC, inkludert rutine i Les og bekreft/Min personalhåndbok, mal ved endret utkast, fullført kontroll og utkast. Langtekst, logo/bilde, ikke-bekreftelse, ulagret sperre, nyere revisjon, tilgang tilbakekalt etter bildefremhenting og sent brukerbytte er prøvd. Tre eksisterende React-flyter for sjekklistesentral/prosjektpopup/workspace PASS; lagring/gjenåpning/fullføring/historikk/kladd/konflikt/legacy er bevart. Poppler-layout kontrollert på lang rutine (7 sider), mal (1 side), fullført kontroll/utkast (3 sider). Ingen kutt/overlapp; sider og originalbilder er beholdt. Endelig full Sandbox critical/build etter hjelpeoppdatering PASS, exit 0. Eksisterende bundle-size-advarsel består. Ingen ny innlogget mobil-/flere-konto-PASS hevdes.

Publisering/CI/READY registreres etter bekreftelse. Neste er kun den korte nye PDF-prøven i USER_TEST.md. Øvrige B/C-punkter (full vedleggsdekning, versjonerte underskjema, RUH-bilder/historikk, tilsynsuttrekk, påminnelser/kildeoppdatering) gjenstår før HR. Samme faste Preview; ingen gamle TEST OK gjentas automatisk.

---

## Publisert kompakt prosjektoversikt – READY

Funksjonskode **990ce731d983c8f6bbfd92b8498723d03c956868**, tree **18151a4384ba493e166801500bd5af7d09b78aee**. Lokal testet og publisert source tree er identiske. Fast Sandbox Preview er **READY** på **dpl_Gm7bVWwzsQ7N3nrcXiaL32RQbebW**, alias expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app, med eksakt SHA. PR Core Safety **37844000342**, jobb Core safety + critical build **113540184367**, completed/success på samme SHA. Branchbinding EXPO_BACKEND_TARGET=sandbox, target preview, gitBranch feat-kshms-foundation er kontrollert. PR #216 er fortsatt open/draft. Main står uendret på **155f6c4ac01f126c1db0c65da385cfd9305587d5**.

Neste er den korte oversiktsprøven i USER_TEST.md. Alle 14 skjermbilder er lest. Tidligere TEST OK består; denne UX-delen og PDF-prøven har fortsatt ikke egen bruker-TEST OK. Ingen main-/Production-/demo-, database- eller e-postendring i UX-runden. En etterfølgende ren dokumentcommit registrerer dette beviset uten funksjonsendring.

---

## Prosjektoversikt – sammenfolding, 8. oktober 2026

Kenneths 14 skjermbilder er lest. Avvik/SJA/RUH er gjort kompakt i samme feature/Sandbox: fire lukkede dokumentgrupper med antall/status, og lukkede grupper/rader for sjekkpunkt- og prosjektavvik. Åpne avvik står først; ansvarlig og frist vises på raden. Nye prosjektavvik åpnes etter lagring. Miljømål BEGGE, først Sandbox Preview; tidligere TEST OK består.

Faktisk React/DOM med simulert RPC PASS: metadataantall, folding, bevart redigering, ny sak synlig etter lagring, offline/tapt tilgang/sene svar, låst prosjekt, legacy-lukking og koblet KS/HMS-sak. Eksisterende prosjekt/SJA/RUH- og gjennomføringsprøver PASS. Ingen ny innlogget mobil-/flere-konto-PASS hevdes. Full Sandbox critical/build PASS med exit code 0. Publiseringsbevis er bekreftet ovenfor. Ingen database-, e-post-, main-, Production- eller demo-endring i denne UX-runden. PR #216 beholdes draft.

Neste er den korte oversiktsprøven øverst i USER_TEST.md. PDF-prøven under den er fortsatt åpen. [Omfang og kontroller](PROJECT_OVERVIEW_20261008.md).

---

## Publisert kontroll-/risiko-PDF – READY

Funksjonskode **c6dc21d5073388eb4c57ce16eed447887ff17495**, tree **5642f9df18d308124fcf970b8f6900e702e00785**. Lokal testet og publisert source tree er identiske. Fast Sandbox Preview er **READY** på **dpl_AF8RKPJdjkFDcfSu32MPDauYy3xG**, alias expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app, eksakt funksjons-SHA. PR Core Safety **37840420573** og jobb Core safety + critical build **113528082970** er completed/success på samme SHA. Branchbinding EXPO_BACKEND_TARGET=sandbox, target preview, er kontrollert. PR #216 er open/draft. Main står uendret på **155f6c4ac01f126c1db0c65da385cfd9305587d5**.

Neste er bare ny PDF-prøve øverst i USER_TEST.md. Ingen gammel TEST OK gjentas. PDF-leveransen er utviklertestet/publisert, men egen bruker-TEST OK for denne nye delen er ikke mottatt. Øvrige B/C-punkter før separat HR og pilot består. Ingen Production-migrasjon/merge/deploy eller reell e-postsending. Etterfølgende ren dokumentcommit registrerer dette beviset uten funksjonsendring.

---

## Gjeldende leveranse – kontroll-/risiko-PDF 8. oktober 2026

Kenneths «kjør» autoriserer neste avgrensede PDF-del i samme feature/Sandbox. Avklarte valg: lagrede kontrollbilder, farget 5×5 med detaljer, lagrede utkast tydelig under arbeid, både egen PDF og valgfritt prosjektvedlegg, firmaprofilens navn/logo. Miljømål BEGGE; først Sandbox. Ingen main-/Production-/demo-endring eller reell e-postsending.

Egen **Last ned PDF** og **Velg KS/HMS til rapport** er implementert. Fersk lesing kontrollerer tilgang/revisjon; ulagrede endringer stopper egen PDF. Lagrede identiteter, rutine-/malutgaver og egen fullføring beholdes. Forventet risiko er tydelig skilt fra kontrollert effekt; fullført kontroll lukker ikke avvik. Utkast kan eksporteres, men får ingen oppdiktet fullføring. Bare uttrykkelig valgte prosjektdokumenter følger rapporten, og portal får ingen KS/HMS-data.

Sandbox-migrasjon **20261008202524_kshms_execution_report** er anvendt. Ny lesende RPC; gamle SJA/RUH-RPC-er og kommandoer er uendret. **79** faktiske SQL-assertioner PASS med full rollback. Faktisk React/jsPDF: tre egne PDF-er og syv prosjektrapport-PDF-er/fire utskrifter PASS med simulert transport. Lange dokumenter, bilder/logo, matrise og kombinasjon er visuelt kontrollert. Permanent critical og full Sandbox build PASS. Ingen ny innlogget mobil-/flere-konto-PASS eller brukerens TEST OK for PDF er hevdet. Signert SJA/rutineutgaver har samme fingeravtrykk; e-post-enabled=false. [Detaljer](EXECUTION_PDF_20261008.md).

Publisering/CI/READY er bekreftet ovenfor. Fortsett med den korte nye PDF-prøven i USER_TEST.md; tidligere godkjente deler gjentas ikke. Fullplanen A–E og øvrige vedlegg/rapporter/påminnelser/HR består.
---

## Gjeldende avklaring – eksisterende Resend, Sandbox uten reell sending

8. oktober 2026: Kenneth autoriserer videre kontroll og gjenbruk av eksisterende Resend. Sandbox/Preview holdes uten ekte KS/HMS-e-post; tidligere krav om å sette Sandbox-hemmeligheter/aktivere der er erstattet. Lesende Production-kontroll bekrefter smart-worker v18 ACTIVE med RESEND_API_KEY/CHAT_FROM_EMAIL. KS/HMS-kilde bruker allerede de samme prosjekthemmelighetene; smart-worker/payload endres ikke. Sandbox har også smart-worker v18, så eldre e-posttester kan ikke utelukkes; metoden er ikke gjenfunnet. KS/HMS enabled=false er direkte SQL-verifisert. Dagens permanent-test bruker providerstub, ikke innbokslevering. Se [gjeldende oppsett](EMAIL_SETUP.md).

Miljømål BEGGE; kun dokumentasjon endres i denne runden. Ingen Production-merge/DDL/deploy, ingen hemmelighetsendring og ingen sending. Før senere uttrykkelig godkjent release: gjenbruk Production-konfigurasjon, riktig Production-origin/endepunkt, autentisert check uten sending og kontrollert mottaksprøve. Tidligere QA/popup/Preview-bevis består; ikke bygg om ferdig kobling. Denne runden: critical-kshms-notifications-check PASS og critical-kshms-deviations-check PASS på uendret kode. Første avvikscheck i ny dokument-worktree manglet React-avhengighet; prøven ble deretter kjørt i originalarbeidsmappen og besto. Ingen ny full build er nødvendig for ren dokumentendring.

## Sluttkontroll – popup/ansvarse-post READY

Popup og e-postflyt er bygget og tester grønne. Faktisk Sandbox-migrasjon 20261008192529, mailer v4 ACTIVE. Ny rollback-SQL 36 PASS + prosjekt 45, gjennomføring 54, avvik/worker 73, SJA/RUH 93 PASS. Faktisk React/DOM/prøvelenker og full Sandbox critical/build PASS. Fingeravtrykk signert SJA/rutineutgaver uendret. Check request 4 viser HTTP503, transport_safe=true, api_key_configured=false, sender_configured=false; enabled=false, ingen ekte e-post. Samme feature-Preview er READY, main uendret på 155f6c4a. [Bevis](NOTIFICATIONS_20261008.md). Funksjonskode `e96e20ade6605ddb0e8bc735f862ef842ea9b1b8`, tree `dc9c7397eb66bcedcee930769c1243c82f72523d`. Samme faste feature-Preview er READY på `dpl_HNUqhySypafZmk9d9CaQXSUVZcVn` med eksakt SHA/alias. PR Core Safety `37833698123`, Core safety + critical build `113505254109`, completed/success. Lokal og publisert source tree er identiske. Preview-binding EXPO_BACKEND_TARGET=sandbox er kontrollert for feat-kshms-foundation. Ingen Production-endring. Gjenstående ekstern konfigurasjon er RESEND_API_KEY/CHAT_FROM_EMAIL i Sandbox; ingen flere bruker-/Production-godkjenninger er utledet.

## Aktivt arbeid – 8. oktober kl. 21:04 Europe/Oslo

Kenneth: «test ok, popup burde lukke seg når godkjent. Alle varsler vi sender i appens ks/hms bør også sendes ansvarlig person på epost». TEST OK er registrert for prosjekttillegget publisert på 8bce982f: prosjektinnganger, rutinevalg og ansvarligvarsel. Dette er ikke Production-godkjenning. Nytt miljømål BEGGE, først samme Sandbox/Preview. Pågående rettelse lukker gjennomføringsdialogen først etter lagring og autoritativ readback; feil beholder kladden. E-post kobles til Avvik/RUH, vernerunder/kontroller, risiko, SJA, pliktig rutinegjennomgang og forfalt håndbokrevisjon, med deduplisering og undertrykking av inaktivt ansvar. Mailer er fortsatt avslått; helse/oppsett må verifiseres uten reell sending. Ingen Production-migrasjon, main-merge eller release er autorisert.

# Gjeldende fortsettelsespunkt – prosjektinnganger og ansvarligvarsel publisert

Funksjonskode `8bce982fb75bf105ee614601e604e438f89a78bc`, tree `ed17f78782d6a49944bd55be6b008d0ef29995e9`. Fast Sandbox Preview er READY på `dpl_4gwb3VsRp7Wf2GWmRrxFNre8DY87`, med samme feature-alias og eksakt SHA. PR Core Safety `37827572425` og jobb Core safety + critical build `113484256816` er completed/success på samme SHA. Lokal og publisert tree er identiske.

Begge brukerbestillingene er implementert: prosjektinngang kun med modultilgang, separate prosjektoversikter og kladder, ansvarligs appvarsel til lagret egen fullføring, godkjente rutineutgaver og stor avkrysning ved begge fullføringsknapper. 44 nye rollback SQL-kontroller, faktisk React/DOM med CSS, gamle berørte brukerreiser og hele critical/build PASS. Rutinene velges med nummer og eksakt utgave; avviksvarsler beholdes når kontroll eller risiko fullføres.

Neste handling er bare den nye korte innloggede brukerprøven i USER_TEST.md. Flere faktiske kontoer og mobil er ikke hevdet prøvd. Tidligere TEST OK består. Main/Production/demo er uendret; PR #216 er draft. Ved ny chat: bruk denne statusen og PROJECT_EXECUTIONS_20261008.md, og ikke behandle den historiske frakoblingen nedenfor som aktiv.

---

## Historikk – gjenoppretting og publisering

# Gjeldende fortsettelsespunkt – forbindelsen gjenopprettet, originalarbeid intakt

8. oktober 2026 etter kl. 20:34 Europe/Oslo svarte arbeidsmiljøet igjen. Originalarbeidet i `/workspace/scratch/31e71b5bfc49/expo-proffdok` er intakt, inkludert den nye faktiske React-prøven og critical-testtilleggene som ikke lå fullt i backupen. Forrige bygglogg viser ferdig Sandbox-bygg. Remote-head 8549888f er fast-forwardet inn uten tap av app-/testendringer. Backupen brukes bare som historisk gjenopprettingsbevis.

Prosjektinngang, separate prosjektkladder, ansvarligvarsler, godkjente rutineutgaver og stor egen bekreftelse ved begge fullføringsknapper er ferdig målrettet prøvd. 44 nye rollback SQL-assertioner og faktisk React-prosjekt/varsel/dialog PASS; tidligere relevante scenarioer og fingeravtrykk består. Hjelp, README, arkitektur og kort testliste er oppdatert. Endelig full Sandbox critical/build etter oppdatert Hjelp er PASS med bekreftet exit code 0; diff-check og branchens Vercel Sandbox-binding er kontrollert. Publisering til samme feature/Sandbox Preview følger nå. Endelig commit/CI/READY registreres her når det er bekreftet.

Miljømål BEGGE. Ingen ny DDL, main-/Production-/demo-endring eller tidligere godkjent brukerprøve gjentas. PR #216 beholdes draft. Ny vernerunde-/risiko-/ansvarligvarselprøve i USER_TEST.md gjenstår. Neste kilde for omfang og prøvebevis er PROJECT_EXECUTIONS_20261008.md. Det tidligere environment_offline nedenfor er historikk og skal ikke behandles som gjeldende hvis ny publisering er bekreftet.

---

## Historikk – frakoblingen før gjenoppretting

# Gjeldende fortsettelsespunkt – prosjektinnganger/ansvarligvarsler testet, arbeidsmiljø frakoblet

Chatten 8. oktober etter ca. 20:07 Europe/Oslo gjenfant arbeidsmappen `/workspace/scratch/31e71b5bfc49/expo-proffdok` på base `2079f5b4ec3e7eaeff0d755c37f7a31294b2182b`. Tilleggene for prosjektets vernerunde og 5×5, ansvarligs faste appvarsel, godkjente rutineutgaver og bekreftelse ved fullføringsknappen er skrevet og målrettet prøvd. Miljømål BEGGE, først samme feature/Sandbox Preview.

44 faktiske nye SQL-assertioner PASS med full rollback: begge oppgavetyper, lesing beholder varsel, omfordeling, minimal varsling uten prosjekttilgang, egen fullføring, beholdt historikk, prosjektisolasjon/paginering, låst prosjekt, revokert modul, anon og ingen e-postkø. Ny faktisk React-prosjekt/varsel/dialog-prøve med simulert RPC PASS; eksisterende utførelses-, SJA-parent- og prosjekt/SJA/RUH-prøver PASS. Utvidet permanent execution-critical for prosjektkladder og faktisk varseleffekt, samt deviation-critical PASS. Samme signerte SJA (1) og rutineutgaver (10) har uendrede MD5 av sortert jsonb_agg: `9a8185f140b7483664c0d98a62b54b8e` / `474ef0379b5149c307ad43be792c18f0`.

Sandbox-migrasjonene `20261008175102_kshms_project_executions_and_tasks` og `20261008180504_kshms_execution_task_access_hint` var allerede anvendt ved gjenopptakelsen. Den sistnevntes manglende lokale fil er gjenfunnet fra migrasjonshistorikken. Ikke kjør dem igjen. Nye funksjoner har eksplisitt firma-/bruker-/modul-/prosjektport, tom search_path og anon/PUBLIC-revokes; tilsiktet authenticated SECURITY DEFINER-advisor er vurdert mot negative SQL-prøver.

`EXPO_BACKEND_TARGET=sandbox npm run build` ble startet. Før sluttresultatet kunne leses, sluttet verktøyet å svare. Siste konkrete feil: `failed to query exec-server capabilities ... 409 Conflict, environment_offline: Environment is not connected.` Full build kan derfor IKKE graderes PASS. Ingen nye appfiler ble pushet, og de nye tilleggene er IKKE publisert. GitHub fungerer; kun dokumentasjon og kildebackup er lagret. Main/Production og PR #216 draft er bevart. Browser-listen var tom; ingen ny fane/reset, innlogget/mobil-PASS eller credential-kall.

Varig [kildebackup og prøvebevis](recovery/PROJECT_EXECUTIONS_20261008_environment_offline.json) er lagret i GitHub i commit `a79372a52a104c3be72fcb442f4e7335fbfe586d`. Backupen er et inert dokument, ikke installert appkode. Den inneholder syv app-/QA-filer og to allerede anvendte migrasjoner. Eksekveringsheader/hjelpere/CSS er rekonstruert fra hentet baseline og gjennomgåtte endringer; sammenlign med original arbeidsmappe når den svarer. Nye lokale React-/critical-testtillegg finnes i arbeidsmappen, men deres fulle kilde er ikke i backupen; ikke påstå at alt lokalt arbeid allerede er pushet.

Neste: gjenkoble arbeidsmiljøet, kontroller original arbeidsmappe og anvend kun backup dersom originalen mangler. Bevar `scripts/kshms-project-executions-react-check.mjs` og utvidet `critical-kshms-executions-check.mjs`; deviation-critical skal nå hente den uendrede gamle varseleffekten fra `function DeviationTasks`. Bekreft full critical/build, oppdater kort testliste/README/arkitektur/Hjelp, og publiser appkode kun til `feat-kshms-foundation` med expected-SHA-kontroll. Verifiser samme faste Preview, CI/Core Safety og Sandbox-binding. Ingen ny Production-godkjenning. Tidligere TEST OK består; ikke gjenta godkjente deler uten ny feil. Ingen nye unødvendige avklaringer kreves.

---

# Gjeldende fortsettelsespunkt – gjenopptatt kontroll-/risikoleveranse

Arbeidet fra avbrutt chat 8. oktober er gjenfunnet. Den opprinnelige vernerunde-/5×5-leveransen nådde Preview på 829ae353; etterfølgende bevis er på feature-head 65f62e0b. Rapportens TEST OK kl. 14:48 og tidligere godkjente delprøver består. Ingen av disse prøves på nytt uten feil.

En påvist kladdfeil er rettet: etter uttrykkelig valg av kollegaens lagrede utgave ryddes den forkastede lokale kladden, så gjenåpning beholder servervalget. Nye meldinger ryddes ved ny åpning. Matrise-/malhistorikk-/Avbryt-vern fra siste publisering er bevart. Ny faktisk React-remount/servervalg-regresjon, eksisterende SJA-parent/sjekklistebygger, 54 rollback SQL-kontroller og full Sandbox critical/build PASS. Migrasjon 20261008131207 og dens eksakte SQL er uendret; ingen ny DDL.

Kladdrettelsen er publisert: funksjonskode `cdac7cf1fe50b724bb87163422e5a0424b01fd58`, tree `47f6249fb6433a6181c9ac94256dd862b097f3bd`. Samme faste Preview er READY på `dpl_7ViZBuSk1G3bjNJ8vUfozN2u8Qhn`; PR Core Safety `37788569184` og jobb Core safety + critical build `113349595488` er completed/success. Branch-målet er Sandbox, main 155f6c4a og PR #216 open/draft. Publiseringsbevis står i EXECUTIONS_20261008.md; etterfølgende dokumentcommit endrer bare notater. Én eksisterende skynettleserfane er gjenbrukt, ingen nye faner/reset; faktisk visning når innloggingssiden, så ingen ny innlogget skjerm-/mobil-PASS hevdes. Ikke gjenta tidligere blokkerte credential-kall. Neste brukerhandling er bare vernerunde-/risikoprøven øverst i USER_TEST.md. Rapport-/vedleggsuttrekk, fristpåminnelser og separat HR følger fortsatt avtalt minimum før Ringside-pilot. Ingen Production-godkjenning.

---

## Opprinnelig publiseringsbevis fra forrige chat

# Fortsettelsespunkt – vernerunder/kontroller og 5×5-risiko READY

Kenneths rapport-TEST OK 8. oktober 2026 kl. 14:48 Europe/Oslo er registrert. Neste tidligere avtalte utførelsesdel er bygget: KS/HMS har Vernerunder/kontroller og Risikovurdering, med eller uten prosjekt, lokal kladd, serverlagring, egen fullføring og bevart historikk. Kontrollavvik går til eksisterende Avvik/RUH med ansvar/frister; fullføring lukker dem ikke. Risiko har blanke scorer, firmavurderte grenser, før/etter-matrise og planlagt/kontrollert effekt med uttrykkelig beslutning.

54 faktiske rollback SQL-kontroller, permanent ny kritisk prøve og reell React/dialog med simulert RPC PASS. Sandbox-migrasjon 20261008131207 er anvendt. Signert SJA (1) og rutineutgaver (10) har uendrede fingeravtrykk. Omfang/testbevis i [EXECUTIONS_20261008.md](EXECUTIONS_20261008.md). Full Sandbox critical/build PASS. Funksjonskode `829ae35315d5e09d4f4e18d7f231f4a2826b8915`, tree `50421488d1498c3045f1d68f56b5efd62c2043d0`: samme faste Preview er READY på `dpl_6nK5QuRTshRSYX5ZAbd3MMPNYBAg`. Core safety + critical build `113342140090` er completed/success på samme SHA. Branch-spesifikk `EXPO_BACKEND_TARGET=sandbox` er kontrollert på nytt (target preview, branch feat-kshms-foundation). Publiseringsbevis står i leveransenotatet. Ny innlogget skjerm-/mobil-PASS er ikke hevdet; tidligere avviste nettleserkall gjentas ikke.

Samme faste feature/Sandbox Preview beholdes. Main er kontrollert uendret 155f6c4ac01f126c1db0c65da385cfd9305587d5, PR #216 fortsatt draft, miljømål BEGGE. Ingen merge, Production-DDL/release eller demo-synk. Neste brukerhandling er bare den nye korte vernerunde-/risikoprøven øverst i USER_TEST.md; tidligere TEST OK gjelder fortsatt. Øvrige rapport-/vedleggsuttrekk, fristpåminnelser og separat HR/kompetanse følger minimumsplanen før Ringside-pilot. Utførelse før HR består.

---

## Historikk – rapport-TEST OK registrert før utførelsesarbeid

# Fortsettelsespunkt – prosjektrapport TEST OK; vernerunder og risiko er neste del

Kenneth svarte «test ok» 8. oktober 2026 kl. 14:48 Europe/Oslo på den korte rapportprøven gitt i chatten: velg prosjektets SJA/RUH i Rapport, PDF med valget og ordinær PDF uten SJA/RUH. Kontrollert feature-head `564778722c17d77358464de4fe465d02d336956e`, funksjonskode `f5c28dd3324a89ec0dd15b3f0c187d47e7bf1e9c`, samme faste Preview READY på `dpl_5L5KriFjsuoex1g4e3WGfAvzJNZA`. Godkjenningen gjelder rapporttillegget, ikke hele modulen eller Production. Tidligere delprøver består og gjentas ikke uten konkret feil.

Neste avgrensede arbeid er vernerunder/selvstendige kontroller og 5×5-risikovurdering, fortsatt BEGGE og først samme Sandbox Preview. Egen lagring, fullføringshistorikk, valgfri prosjektkobling og kontrollerte avvik er innenfor dette. Se EXECUTIONS_20261008.md. Ingen Production-migrering/merge/release eller demo-synk er autorisert. Utførelse før separat HR og minimum før Ringside-pilot består.

---

# Historikk – SJA/RUH i prosjektrapporten bygget og publisert

Kenneths «kjør» 8. oktober 2026 kl. 13:38 Europe/Oslo godkjente avgrenset valgfri SJA/RUH-del i prosjektets Rapport/PDF/utskrift. Miljømål BEGGE, først samme Sandbox Preview. Brukere med modulen velger konkrete prosjektdokumenter; ingen automatisk avkrysning. SJA viser oppgave/arbeidstrinn/tiltak/rutinenummer og utgave/deltakere/lagret PL-signatur, RUH viser hendelse/tiltak/ansvarlig/frist/status/egen kontroll og lukking. Utkast og åpne saker merkes tydelig. Rapportvalg lagres ikke i prosjektets JSON eller kundeportal.

Implementering og 34 rollback databasekontroller PASS. Faktisk React/PDF/utskrift: 5 PDF-er og 3 utskrifter PASS; lang prøve-PDF på 12 sider kontrollert visuelt med Poppler Cairo. Eksisterende signert SJA og 10 rutineutgaver har uendrede fingeravtrykk. Endelig critical QA/build og publiseringsbevis samles i [PROJECT_REPORT_20261008.md](PROJECT_REPORT_20261008.md). Samme Preview er READY på funksjonskode f5c28dd3324a89ec0dd15b3f0c187d47e7bf1e9c; Core safety + critical build completed/success. Publiseringsbevis står i PROJECT_REPORT_20261008.md. Ingen Production- eller demo-synk.

Neste brukerprøve gjelder bare rapportvalget og PDF-innholdet i USER_TEST.md. Tidligere TEST OK 8. oktober kl. 13:30 for SJA-utkast/rutine/lagring/gjenåpning og RUH-oppfølging/egen lukking bortfalt varsel/bevart sak består. Ingen nye signerings-/mobil-/flere faktiske brukerøkter-prøver er godkjent av dette. RUH-bildevedlegg/full endringshistorikk er ikke med i første rapportuttrekk. Ingen ny innlogget skjermtest hevdes; ikke gjenta tidligere avviste nettleserkall.

Hovedretningen består: utførelse først, vernerunder/selvstendige kontroller og 5×5-risiko gjenstår; så separat HR (leder bare tildelte ansatte, firmaadmin alle/tildele), minimumsomfang før Ringside-pilot. Production main 155f6c4ac01f126c1db0c65da385cfd9305587d5 er uendret. Hovedretning for senere demo-synk er main → demo.

---

## Historikk før autorisert rapportleveranse

# Gjeldende fortsettelsespunkt – SJA-utkast og RUH-oppfølging TEST OK; rapportkobling gjenstår

Kenneth svarte «test ok» 8. oktober 2026 kl. 13:30 Europe/Oslo på prøven rett ovenfor i chatten: SJA-utkast med rutinenummer → Lagre utkast → lukk/gjenåpne fra samme prosjekt, og RUH → lagring med ansvarlig/frister → egne tiltak/egen kontroll/lukking → bortfalt ansvarligvarsel og bevart sak under Lukkede.

Godkjenningen er registrert mot kontrollert feature-head `75f6ba1f53817a17e4efb3cac778a63d3cfcb9c5` og funksjonskode `4cebc9f8e7d115887a7ef4264c9f5390b3504265`. Samme Preview var READY på `dpl_39J3zc2PeqRSq6A8GtGs5pzNwfoA`. Den gjelder de konkrete prøvepunktene, ikke en ny signerings-/mobil-/flere faktiske brukerøkter-prøve, hele KS/HMS eller Production. De godkjente lagrings-/gjenåpnings-/RUH-lukkepunktene og tidligere meny-/dato-/sjekkliste-/håndbokprøver skal ikke gjentas uten en ny feil.

Kodekontroll bekrefter at nye prosjektkoblede SJA-er og RUH-er foreløpig ikke inngår i prosjektets PDF-/rapportvisning. reportTools.js og reportViewTools.js leser eksisterende sjekkpunktavvik og project.projectDeviations valgt med includeInReport. createReportTools får ikke KS/HMS-/SJA-/RUH-data. Nye RUH-er opprettes med source_kind=company og project_id; projectAfterDeviation oppdaterer bare allerede koblede source_kind=project-saker. Dette er en bekreftet rapportmangel, ikke en feil i den godkjente lagringen.

En valgfri rapportdel for prosjektets SJA/RUH, med signatur/deltakere/rutineutgaver for SJA og status/tiltak/ansvarlig/lukking for RUH, foreslås som en egen avgrenset leveranse. Omfang, inkludering og prioritering er ikke besluttet av spørsmålet alene. Avtalt videre utførelsesarbeid med vernerunder/selvstendige kontroller og 5×5-risiko, deretter separat HR og Ringside-pilot etter minimumsomfang, består.

Denne registreringen endrer bare dokumentasjon. Ingen appkode, SQL, rapport, tilgang, e-post, signert analyse eller rutineutgave endres. Main uendret `155f6c4ac01f126c1db0c65da385cfd9305587d5`; PR #216 beholdes draft. Ingen Production-migrering/merge/release eller demo-synk. Ingen nye utviklerprøver er hevdet i denne dokumentregistreringen.

---

# Historikk – meny, RUH-inngang og norsk dato TEST OK

Kenneth svarte «test ok» 8. oktober 2026 kl. 01:28 Europe/Oslo på den avgrensede prøven for prosjektets Avvik/SJA/RUH, Opprett SJA / Registrer RUH, KS/HMS → Avvik/RUH og norsk dato. Godkjenningen er registrert mot kontrollert feature-head `42204af397fc1fb6187e7e475c951ecdcd007550` og funksjonskode `4cebc9f8e7d115887a7ef4264c9f5390b3504265`. Dette er ikke godkjenning av hele SJA/RUH-lagrings-/signeringsflyten, hele modulen eller Production.

Den korte meny-/RUH-/datoprøven skal ikke gjentas uten en ny konkret feil. Neste nødvendige brukerprøve er SJA-utkast med rutinenummer → lagring/gjenåpning fra samme prosjekt, samt RUH → lagring for oppfølging → ansvarligs egen dokumenterte lukking → bevart rapport. Se de faktiske knappene øverst i [USER_TEST.md](USER_TEST.md). Tidligere håndbok-, avvik-, menyretur- og sjekklistepopup-TEST OK består.

Overtakelseskontrollen bekreftet samme faste Preview READY på `dpl_6LSTm6CzDM94bZEj6Wf58NwvhP27` / `42204af397fc1fb6187e7e475c951ecdcd007550`, PR Core Safety completed/success på funksjonskoden, branch-spesifikk `EXPO_BACKEND_TARGET=sandbox` og de tre SJA/prosjekt/RUH-migrasjonene i Sandbox-historikken. Denne registreringen endrer bare dokumentasjon. Ingen appkode, SQL, tilgang, e-post, signerte analyser eller rutineutgaver endres. Ingen ny innlogget utviklerprøve eller fysisk mobilprøve hevdes; eksisterende Preview-fane kunne ikke bindes og øktens tabbliste var tom.

Miljømål BEGGE, fortsatt feature/Sandbox Preview. PR #216 beholdes draft. Main/Production er kontrollert READY på `155f6c4ac01f126c1db0c65da385cfd9305587d5` / `dpl_9wsjTrEVzvAF6jf7f9HgvzskYP5z`. Ingen Production-godkjenning, merge, Production-DDL eller demo-synk. Vernerunder/selvstendige kontroller og 5×5-risiko følger den korte SJA/RUH-prøven; utførelse før separat HR og bygging før Ringside-pilot er fortsatt vedtatt.

CURRENT_RELEASE_STATUS.md viser nå bare dagens status. Det tidligere samlede statusinnholdet er bevart som [historisk arkiv](archive/CURRENT_RELEASE_STATUS_before_TEST_OK_20261008.md). Eldre avsnitt nedenfor er kontrollhistorikk og skal ikke starte nye godkjenningsrunder.

---

# Historikk før TEST OK – Avvik/SJA/RUH, RUH-meny og norsk dato READY

Oppdatert 8. oktober 2026, Europe/Oslo. Kenneths tre skjermbilder viste en faktisk desktopmenyfeil: det nye navnet Avvik/SJA/RUH ble ikke gjenkjent av adapteren og manglet i toppmenyen. Dette er rettet i menyen, bootstrap-snarveien og workflowmålet. Åpne Avvik går til den faktiske prosjektfanen, også fra Ordreoversikt. KS/HMS har nå Avvik/RUH → Registrer avvik / Registrer RUH og eget SJA-valg. Kun personlig modulbruker får prosjektets SJA/RUH-verktøy.

Frister vises dd.mm.åååå i liste, historikksaksbilder, fast ansvarligvarsel og koblede prosjektavvik. Hendelsestidspunkter viser norsk dato og Europe/Oslo. Date-input/payload/lagring forblir ISO. Ingen SQL-/Auth-/Storage-/e-postendringer i denne rettelsen. Forrige Sandbox-migrasjon består; syntetiske SQL-testdata ble rullet tilbake. De konkrete tekstene i Kenneths to SQL-godkjenningsdialoger er ikke kjent.

Funksjonskode `4cebc9f8e7d115887a7ef4264c9f5390b3504265`, tree `c746110e2025cb11b06087bec2084abf651442b2`: READY på `dpl_7eswiB6TH89b1VcUJBxAsiX5ckDA`, Core safety + critical build `113066107707` completed/success. Fast Preview-alias og branch EXPO_BACKEND_TARGET=sandbox kontrollert. Full critical QA/Vite-bygg, faktisk desktop DOM og faktisk React parent/prosjekt/SJA/RUH med norsk listedato/historikk PASS. Ingen ny innlogget nettleserprøve er hevdet; den dokumenterte verktøyblokkeringen ble ikke gjentatt. Testbevis: [NAV_RUH_DATE_20261008.md](NAV_RUH_DATE_20261008.md).

Main er kontrollert uendret `155f6c4ac01f126c1db0c65da385cfd9305587d5`. PR #216 er draft. Ingen produksjonsrelease/DDL/demo-synk. Ingen ny SJA/RUH-TEST OK. Tidligere godkjente menyretur-/sjekkliste-/avvikprøver består, men denne nye menynavnfeilen krever den korte prøven øverst i USER_TEST.md.

Neste steg: Kenneth kontrollerer bare synlig Avvik/SJA/RUH, prosjektets Opprett SJA / Registrer RUH, KS/HMS → Avvik/RUH og norsk dato. Full ny SJA/RUH-godkjenning, mobil/flere faktiske brukerøkter og senere vernerunder/5×5-risiko/HR følger tidligere plan. Ikke bygg godkjente deler om eller gjenta gamle databaseprøver uten ny feil.

Notatet er lagret i Git-repoet og trenger ikke kopieres manuelt. Ved ny chat: «Fortsett KS/HMS; les docs/kshms/OVERSIKT.md og CONTINUITY.md.» Hele notatet forutsettes ikke automatisk overført av ChatGPT-prosjektet.

---

# Gjeldende fortsettelsespunkt – prosjekt-SJA/RUH og nummererte rutiner READY

Oppdatert 8. oktober 2026, Europe/Oslo. Les OVERSIKT.md først. Kenneth avklarte ca. 00:24–00:32 at ordreforslag skal være bedriftens faktiske aktiverte ProffDok-prosjekter, samtidig med manuell ekstern referanse. Han ba om nummererte bedriftens rutiner, fagforslag for mur/flis/tømrer, RUH med samme logikk og direkte Opprett SJA / Registrer RUH i prosjektets Avvik/SJA/RUH, bare ved personlig modultilgang. Dette er implementert, ikke SJA/RUH-TEST OK.

Prosjektoversikt / Ordreoversikt og Avvik/SJA/RUH har Opprett SJA og Registrer RUH samt Åpne SJA / Åpne RUH. Begrepene forklares. Ny blank analyse/rapport derfra binder prosjekt-ID. SJA og RUH i KS/HMS kan også velge faktisk tilgjengelig aktivt firmaprosjekt eller manuell ekstern referanse. Godkjente, tilgjengelige rutiner kan leses og velges med fast R-nummer og versjon. Nummer er metadata uavhengig av publisert innhold. Forslag dekker mur, flis, tømrer, VVS og generelle jobber; ingen risiko-/signatursvar autofylles. RUH gjenbruker existing deviation-category/kommando, ansvarligvarsel, egne tiltak/lukking, private vedlegg og historikk. Kladd og retry/readback er vernet per bruker/firma/prosjekt. Legacy avvik/prosjekt-/sjekkpunkt-JSON beholdes.

Funksjonskode `694a4a9a114044ead724532c18133c28045c5863`, tree `e25b2562a45dcde9ced79ecfb54a6b52b053416c`, er READY på `dpl_AX9QTyWPY7KQovT3bGBFPSyKxsdg` og fast alias. Core safety + critical build `113058866219` completed/success. Lokal og remote tree er eksakt like. EXPO_BACKEND_TARGET=sandbox gjelder feature-branchen/preview. Migrasjon `20261007224149_kshms_job_choices_routine_references_ruh.sql` er registrert bare i Sandbox. 93 SQL-assertioner PASS med full rollback, nye faktiske React/DOM-prosjekt-/SJA-/RUH-handlere PASS, eksisterende SJA- og parent-/fanebytteprøver og full critical/build PASS. Eksisterende signert SJA (1) og publiserte rutineutgaver (10) har identiske fingeravtrykk før/etter.

Neste handling: kort SJA/RUH-prøve først i USER_TEST.md. Ingen ny innlogget nettleser-/mobilprøve hevdes; dokumentert skynettleserblokkering ble ikke gjentatt. Kenneths SJA/RUH-TEST OK gjenstår. Gamle meny/sjekklistepopup-TEST OK består, uten nye omtester. Vernerunder, 5×5 risiko, SJA-vedlegg/PDF, separat HR og øvrig minimum gjenstår. Utførelse før HR og bygging før pilot er fortsatt vedtatt. Miljømål BEGGE, main uendret `155f6c4ac01f126c1db0c65da385cfd9305587d5`; PR #216 draft; ingen merge/Production-DDL/-release/demo-synk. Ikke bygg denne delen på nytt ved chatbytte.

Se [SJA_RUH_PROJECT_20261008.md](SJA_RUH_PROJECT_20261008.md) for scope/testbevis.

---

# Historikk – tidligere fortsettelsespunkter

# Gjeldende fortsettelsespunkt – SJA-UX og prosjektinngang READY

Oppdatert 8. oktober 2026, Europe/Oslo. Les OVERSIKT.md først. Kenneths nye tilbakemelding 7. oktober ca. 23:50 er håndtert: samlet mangelliste med feltnavn og fokus ved signering, aktive forslag i alle SJA-tekstfelt og inngang fra prosjekt ved KS/HMS-tilgang. Dette er tilbakemelding og ny scope, ikke ny SJA-TEST OK.

Prosjektoversikt / Ordreoversikt → Åpne SJA viser bare analyser med faktisk prosjekt-ID. Nye analyser derfra følger prosjektet etter lagring/signering. Gamle selvstendige analyser og signert innhold flyttes ikke. Lokale prosjektkladder og tidligere KS/HMS-kladd er separate. Server krever KS/HMS-grant, aktivt firma og prosjektadgang; låst prosjekt avviser endringer. Egen PL-signatur og dokumentert medvirkning består.

Funksjonskode `06a5abbed3ed6a921265c96468f1253d278ca5ee`, tree `ce2df79089500734b0770a0938e0f3f0d736a6c3`, er READY på `dpl_DPUuLEqTcrN2mFr3HN5nrE8D3u4r` med samme faste Preview og bekreftet branch-binding `EXPO_BACKEND_TARGET=sandbox`. Core safety + critical build check `113042525234` completed/success. Eksakt lokal/remote tree samsvarer.

Full critical QA/build, faktisk React/DOM-skjema/ProjectSjaEntry, parent-/fanebyttescenario og 60 faktiske SQL-kontroller PASS. Alle syntetiske SQL-rader er rullet tilbake. Eksisterende signerte analyse (1) bevart med identisk kontrollsum. Sandbox-migrasjon `20261007220221_kshms_sja_project_link.sql` er registrert; tidligere SJA-migrasjon `20261007212858` består. Ingen Production-DDL.

Neste handling er den korte brukerprøven først i USER_TEST.md. Ingen ny innlogget nettleser-/mobilprøve hevdes; tidligere verktøyblokkering må ikke gjentas i løkke. SJA-TEST OK er fortsatt ikke mottatt. Meny/sjekklistepopup er allerede TEST OK. Miljømål BEGGE, main fortsatt `155f6c4ac01f126c1db0c65da385cfd9305587d5`; ingen merge/Production-release/demo-synk. Vernerunder, 5×5 risiko, vedlegg/PDF, separat HR og resten av minimumsomfanget består.

Se [SJA_UX_PROJECT_20261008.md](SJA_UX_PROJECT_20261008.md) for scope og testbevis. Ikke bygg denne delen på nytt ved chatbytte.

---

# Historikk – tidligere SJA-status

# Gjeldende fortsettelsespunkt – SJA READY på samme Preview; kort brukerprøve gjenstår

Les OVERSIKT.md først. Kenneths svar 23:02 er lagret: begge delprøver TEST OK, utførelse før HR, bygg før Ringside-pilot, ledere bare tildelte HR-medarbeidere/firmaadmin alle, og tom SJA med hjelp over feltene. Meny/sjekklistepopup skal ikke testes på nytt uten ny feil.

Avgrenset SJA er bygget: blank jobb, valgbare forslag, utkast/readback, lokal kladd ved fanebytte/remount, kollegasammenligning, ansvarlig PLs egen signatur og uforanderlig analyse. 38 faktiske SQL-kontroller i Sandbox og faktisk React-scenario med simulert transport PASS. Begge faktiske React-scenarioer (den gjenfunne og parent-/fanebyttescenarioet) samt full critical/Vite-build PASS. Migrasjon 20261007212858_kshms_sja er bekreftet fra Sandbox-historikken og eksakt SQL lagret i repoet. Syntetiske rader rullet tilbake. Ingen ny nettlesertest hevdes; skynettleseren er fortsatt blokkert og ingen nye faner åpnes.

Miljømål BEGGE. Neste utviklingsdel er vernerunder og 5×5 risiko. Bare den korte SJA-prøven kan registrere egen SJA-TEST OK; Ringside-pilot kommer etter bygging av avtalt minimum. Bare SJA-prøven øverst i USER_TEST.md gjenstår for denne leveransen. Main/Production/demo er uendret på gjeldende baseline. Vernerunder, 5×5 risiko, PDF, HR og øvrige B–E-deler består. Se SJA_20261007.md.



Funksjonskode `8f14d58282408d872eee0505dc61646dfe4a5c20`, tree `8ad9492809bbd41f8ca37925c1f43e20bf2e53f1`, er publisert READY på `dpl_H3XMgUxRsSHW2pvUiTdxV9Spzuzs`. Fast branch-alias peker til denne deployen; `EXPO_BACKEND_TARGET=sandbox` gjelder feat-kshms-foundation/preview. PR Core Safety run `37691631432` er completed/success på koden. Lokal og publisert tree er identiske. Main er kontrollert uendret på `155f6c4ac01f126c1db0c65da385cfd9305587d5`.

---

# Bevart publiseringshistorikk fra tidligere kjøring

# Gjeldende fortsettelsespunkt – SJA bygget og utviklertestet

Påbegynt SJA fra avbrutt chat er gjenopptatt i separat recovery-arbeidsmappe. Tomme jobbspesifikke felt, veiledning over feltene, aktivt valgte forslag, delvise utkast, prosjektleders egen signering og uforanderlig signert innhold er implementert. Migrasjon `20261007212858_kshms_sja.sql` er kun anvendt i Sandbox; 37 reelle SQL-kontroller med full rollback, permanent kontroll, faktisk React-flyt og full critical QA/build PASS. Se [SJA_20261007.md](SJA_20261007.md) for scope/kilder/testgrenser og [USER_TEST.md](USER_TEST.md) for kort prøve.

Funksjonskode `fcea0492531d860ea006e3650b85d3dd18b80c47`, tree `006797ae29ed0f9fb2fadb4897df25bf9c348a03`, er publisert på **samme** feature-Preview. Vercel `dpl_4LUb8LoDB3EVhkko6nwYae29Sy4G` READY og Core safety + critical build `37690659010` success på denne SHA-en. Fast alias/Sandbox-binding og eksakt lokal/remote tree er kontrollert. Eksisterende skynettleserfane 1 kunne bindes, men viste innlogging; ingen ny fane, credentialforespørsel eller innlogget SJA-skjerm-PASS. Ingen main-/Production-/demo-endring; main er kontrollert `155f6c4`.

Neste handling er den **korte SJA-prøven** øverst i USER_TEST.md. Ingen SJA-TEST OK er registrert ennå. Meny og sjekklistepopup er allerede TEST OK; ikke start gamle prøver automatisk eller bygg SJA på nytt. Vernerunder og 5×5-risiko er neste avgrensede utførelsesdeler etter SJA. Prosjektkobling/vedlegg/PDF, separat HR og øvrige roadmapdeler består. Denne dokumentoppdateringen endrer ikke funksjonskoden.

---

# Vedtatte avklaringer – meny og sjekklistepopup TEST OK; SJA

Kenneth svarte 7. oktober 2026 kl. 23:02 Europe/Oslo: TEST OK gjelder begge deler, meny og sjekklistepopup med lagring/fullføring/historikk. Utførelsesdelen prioriteres før HR; vi bygger før Ringside-piloten. Ved individuell HR får ledere bare tildelte medarbeidere; firmaadmin ser/behandler alle og tildeler ansvar. SJA starter tom for hver jobb, med forslag til rutiner/sjekkpunkter og hjelpetekst over feltene. Primærkilder undersøkes før innholdet skrives. Ansvarlig PL signerer fortsatt selv etter dokumentert medvirkning. Dette er ikke Production-godkjenning.

Miljømål BEGGE, først samme Sandbox Preview. Neste avgrensede kodeleveranse er SJA i KS/HMS, med nytt avgrenset datadomene og RPC-er; ingen endring av main.jsx, global meny, prosjektdata, avviksregler, auth eller e-post. Se OVERSIKT.md og kommende SJA-leveransenotat. Vernerunder, 5×5 risiko, PDF, HR og øvrige roadmapdeler består. Ingen gamle godkjenninger skal gjentas automatisk.

---

# Historikk – meny TEST OK, før godkjenning av sjekklistepopup

**Kort samlet status ved chatbytte:** Les [OVERSIKT.md](OVERSIKT.md) først. Den skiller implementert arbeid, Kenneths godkjente delprøver, gjenstående leveranser og spørsmål som fortsatt avventer svar. Eldre avsnitt nedenfor er testhistorikk og skal ikke utløse nye fulle omtester.

Kenneth meldte **«test ok» 7. oktober 2026 kl. 22:39 Europe/Oslo** etter den korte menyprøven. Dette er godkjenning av kompakt Meny og retur fra generell ordre til Startside. Registrert mot kontrollert feature-head `2c7c2b5ee68230056e9dd385986a33756a9b2561`, funksjonskode `9a8bc9d64ec2ac18d82778eca26fbaa9fae10a9f`. Ikke gjenta den beståtte menyprøven uten ny feil. Godkjenningen omfatter ikke hele KS/HMS, popupens lagring/historikk eller Production.

Neste avgrensede handling er den korte sjekklistepopup-prøven øverst i USER_TEST.md: et testpunkt → Lagre → omlasting/gjenåpning → Sjekkliste fullført → Start ny kontroll → bevart historikk med navn/tidspunkt. Utviklerens tidligere innloggede popupprøve, 35 rollback-databasekontroller og React-scenarioer består; ikke bygg funksjonen på nytt eller gjenta SQL-rundene. Miljømål BEGGE, først samme Sandbox Preview. Ingen main-merge, Production-endring eller demo-synk utføres ved registrering av meny-TEST OK. Utviklerens nye skynettleserøkt fikk ingen bekreftet innlogget flate; brukerens TEST OK er eget bevis, ikke en ny utvikler-skjermtest.

Kenneth ba kl. 22:44 Europe/Oslo om nullstilling av skynettleseren. Den støttede REPL-nullstillingen fullførte (`js kernel reset`). Deretter avviste både åpning av ny Preview-fane og gjenkobling til cdp med `native credential state cannot be safely resumed. Start a new browser runtime to continue.` Dette er en verktøyblokkering, ikke påvist botblokkering eller feil i appen. Full restart av nettleserprosessen er ikke eksponert i de tilgjengelige dokumenterte API-ene. Ingen full nettlesernullstilling eller ny skjermtest hevdes som bestått. Ikke gjenta de samme avviste kallene i løkke.

---

# Historikk før meny-TEST OK – hovedmeny etter ordre, 7. oktober 2026

Kenneth har meldt reell regresjon i den globale menyen etter bruk av generell ordre. Den er gjenskapt med hans nøyaktige Prosjektoversikt/Salgsgrunnlag-knapperekke. Årsaken er ordre-adapterens gamle etiketter som overskriver gjenbrukte React-kontroller ved retur, ikke manglende ny menykode. Rettelsen følger den gjeldende React-etiketten på source controls. Scope og før/etter-prøver står i [MENU_RETURN_20261007.md](MENU_RETURN_20261007.md). Miljømål BEGGE, først samme Sandbox Preview. Full critical/build, faktisk React-retur og eksisterende sjekklistepopupscenario PASS. Koden er publisert som 9a8bc9d64ec2ac18d82778eca26fbaa9fae10a9f, eksakt lokal/remote tree-kontroll, READY dpl_95rV35jiRQTjca3Mik9Yecp8qrYU, fast alias og Sandbox-binding kontrollert, Core Safety 37682948736 success. Sikker skynettleserinnlogging ga ingen bekreftet innlogget flate; ingen innlogget skjerm-PASS hevdes. Ikke bygg sjekklistefunksjonen på nytt eller gjenta gamle SQL-runder. Production er kontrollert uendret på 155f6c4. Neste handling er Kenneths samme Preview → generell ordre → ← Startside, og kompakt Meny skal bestå. Ingen ny TEST OK eller produksjonsgodkjenning hevdes.

---

# Gjeldende fortsettelsespunkt – sjekklistepopup, 7. oktober 2026

Miljømål **BEGGE**, først samme Sandbox Preview. Forrige kjøring fortsatte i bakgrunnen etter forbindelsesbruddet og publiserte kodehead `dba4ee3ad8ce700e5eb64df101f95063c65a1d91` (tree `207d8051c449aee8e94d6bdda11805739cc3f015`). En separat recovery-arbeidsmappe ble derfor åpnet på den eksakt samme lokale treutgaven for å unngå samtidige overskrivinger. Ikke bygg denne funksjonen på nytt.

Fast Preview: https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe. Vercel `dpl_DCieSStSwjVhZq6rQS9iDNCAiG7C` READY; branchvariabelen `EXPO_BACKEND_TARGET=sandbox` er kontrollert. PR Core Safety run `37668916442` completed/success. Main var uendret `155f6c4ac01f126c1db0c65da385cfd9305587d5`. Ingen Production-migrasjon, merge eller demo-synk.

Avklart funksjon: kompakt ordremeny; ingen automatisk våtromsliste i generelle ordrer; egne punkter uten KS/HMS-/garantikrav på disse ordrene; publiserte firmamaler ved aktiv firmamodul. Listene starter kollapset. Popupen har **Lagre**, **Sjekkliste fullført**, **Start ny kontroll** og historikk. Vanlige åpne sjekkpunktavvik kan følges opp i en ny kontroll via Gå til punkt; historikken beholdes. Samtidige endringer gir konfliktvisning, og videreføring av lagret kontroll beholder tidligere lokal kladd for sammenligning.

Kontroll ved overtakelsen: full critical QA/Sandbox-build PASS; de eksisterende React-prøvene for sentralen/popupen samt en ekstra konkret prøve for konflikthåndtering og avviksoppfølging PASS. Utvidet faktisk Sandbox SQL har **35 kontroller PASS med rollback**. Ingen ny databasemigrasjon ble nødvendig i denne overtakelsen. Den ekstra SQL-prøven verifiserer lukking i ny kontroll, egne nye punkter, gjenåpning, koblet KS/HMS-status og bevart fullført snapshot.

Innlogget desktopprøve på samme Preview er nå PASS: demoordre `a45b0000-0000-4000-8000-000000000001`; egen kategori Annet fag med punkt **QA – sjekklistepopup, syntetisk prøve 07.10.2026**. Lagre → lukk → reload → åpne bevarer Ok og kommentaren. Første fullføring `ddee47a5-84fe-43b1-a18c-a93d0707ca4c` kl. 20:55:53 Europe/Oslo; ny kontroll starter uten tidligere svar og fullføres separat som `7832ff92-31e3-479a-bc2c-13c7a0261bdf` kl. 20:57:08 med Ikke aktuelt og en annen kommentar. Begge har Kenneth Demo som faktisk aktør. Historikken viser begge; første kontroll gjenåpnes skrivebeskyttet med sitt opprinnelige Ok og sin opprinnelige kommentar. [Skjermbevis](checklist-popup-history-proof.jpg). Bare det tydelig merkede testpunktet har fått disse syntetiske gjennomføringene; den innhentede Bunnledning-listen er bare åpnet og inspisert.

Neste handling er Kenneths korte prøve øverst i USER_TEST.md. Ingen ny bruker-TEST OK eller Production-godkjenning hevdes. Ikke gjenta allerede beståtte runder uten en ny feil. To samtidige personer er kontrollert i database-/komponentprøver, ikke som to faktiske browserinnlogginger. Mobilbredde, fysisk kamera, ny PDF og UE-portal for lister med nye gjennomføringer er ikke verifisert her. De gjenværende roadmapdelene består.

---

## Siste overgangskontroll – åpne sjekkliste i generell ordre

Den avklarte inngangen består: generelle ordrer henter under **Sjekklister**, våtrom under **Fag/utstyr**. Baseline er 4b84bab86d1172f84c189615c4f99d17401d9be4. «Åpne sjekkliste» kan nå også åpne riktig gruppe når ChecklistEditor allerede er montert på samme fane; den eksisterende hopprutinen håndterer både mount og et avgrenset åpningssignal. Svar/kladd og prosjektrettigheter endres ikke. Kort faktisk React-prøve av kollapset gruppe → åpnesignal PASS; full critical QA/Sandbox-build PASS. Ingen ny SQL, e-post, main-/demo-merge eller Production-endring. Sjekk aktuell feature-HEAD og fast Preview ved videre arbeid; ikke gjenta eldre fulltester. Den korte prøven i USER_TEST er fortsatt neste brukerhandling.

# Gjeldende fortsettelsespunkt – Sjekklistesentral, 7. oktober 2026

Kenneth har gitt **TEST OK for popup og direkte lukking på ca2f0cb676755338c87e3d4f2a082281d309da8b**. Ikke start denne hele flyten igjen automatisk. Ny bestilling er fagspesifikk Sjekklistesentral med innhenting under Sjekklister i generelle ordrer og Fag/utstyr i våtromsprosjekter. Tilgang avklart: **«Har firma KS/HMS modulen så ja»** – prosjektbrukere trenger ikke personlig KS/HMS-grant for å hente publiserte lister. Sentralen bygges av firmaadmin/KS/HMS-ansvarlig. Ukoblede prosjektavvik fungerer som før.

Sjekklistesentral, publisering og versjonsfaste prosjektkopier er implementert. Kenneth presiserte at generelle ordrer ikke trenger Fag/utstyr. Innhenting ligger derfor direkte under Sjekklister i generell ordre, mens våtrom bruker Fag/utstyr. Ordrebegrensningene består. Nye migrasjoner er anvendt kun i Sandbox. **27 faktiske databasekontroller PASS med rollback**, permanent handler-/kopiregresjon PASS, kort faktisk React-flyt PASS. Se [CHECKLIST_CENTRAL_20261007.md](CHECKLIST_CENTRAL_20261007.md) for eksakt scope, migrasjoner og begrensninger. USER_TEST har neste korte prøve. Arbeidsbranchen er fortsatt feat-kshms-foundation/PR #216; bruk samme faste Preview. Main ved siste kontroll er 155f6c4ac01f126c1db0c65da385cfd9305587d5. Ingen merge eller Production-/demo-endring er utført.

Dette er én avgrenset del av B, ikke hele roadmapen. Bevar kapitler/rutiner og gjeldende avviksrettigheter. Selvstendige gjennomføringer, vernerunder, SJA, risiko, HR, påminnelser, eksport/PDF og pilot/drift gjenstår. Bruk korte målrettede kontroller; Kenneth tester i Preview. Ikke erstatt historikk nedenfor eller spør om avklarte tilgangsvalg igjen.

---

# KS/HMS – gjeldende fortsettelsespunkt

Oppdatert 7. oktober 2026, Europe/Oslo. Dette dokumentet samler gjeldende brukerbeslutninger og verifiserte referanser etter to avbrutte samtaler. En ny chat skal lese dette først, deretter PLAN.md, SCOPE_A2.md, QA.md og USER_TEST.md. Dette er ikke en ordrett kopi av historikken eller en attest på at hele modulen er ferdig.

## Gjeldende rettelse – kontrolltekst, direkte lukking og popup

Brukeren har lagt inn kontrolltekst flere ganger; «Lagre endringer» slettet den og flyttet fokus oppover. Rotårsaken er gjenskapt i en avgrenset Sandbox-transaksjon: kshms_deviation_command satte control_note til tom streng ved vanlig save. Den gamle fokus-/scroll-effekten kjørte også etter lagring. Brukeren ønsker eksisterende avvik i en popup som lukkes ved lagret lukking, og korte tekster som «OK» i lukkefeltene.

Miljømål BEGGE, først samme Sandbox-Preview. Kontrollert branch-parent 342cf3cadcea3aaa1ecfdb8130ffde96bf17996f; main før endring 155f6c4ac01f126c1db0c65da385cfd9305587d5. Scope: KshmsDeviations.jsx, kshmsDeviations.mjs, DeviationDialog.jsx, deviationDialog.css, eksisterende critical-avvikscheck, én målrettet SQL-check, én ny migrasjon og disse fire test-/fortsettelsesdokumentene. Toppvarselets kompakte utforming fra forrige rettelse består.

- Alle KS/HMS-saker åpner i den eksisterende React-eide popupen. «Lagre og lukk avvik» lagrer hele skjemaet og lukker popupen først etter kontrollert readback av firma/sak, egen signatur, status og innsendt tekst. Ved feil beholdes popup, tekst og lokal kladd. Lukkekrysset beholder kladden; åpning av samme sak henter den automatisk tilbake. Samtidig nyere serverversjon vises som konflikt.
- «Lagre uten å lukke» bevarer kontrollteksten uten å signere/lukke saken, og flytter ikke fokus eller scroll oppover. Readback som ikke inneholder innsendt tekst godtas ikke som vellykket lagring.
- Årsak, Utførte tiltak / forbedring og Egen kontroll av resultatet krever bare ikke-tom tekst; «OK» godtas både i klient og server. Tomme/blanke felter, manglende egen kontroll og lukking på andres vegne avvises fortsatt. Tittel/hendelse/ansvar/frister følger eksisterende regler.
- Migrasjon 20261007163024_kshms_control_note_direct_close.sql er anvendt bare på Sandbox ppvircenkjizeiqdxphj. Vanlig save bevarer control_note. Firma-/tilgangs-/ansvars-/revisjonskontroller, prosjektlås, historikk og varsler er videreført. CLI var ikke installert og npm-tilgang returnerte 403; lokal fil bruker versjonen fra faktisk MCP-migrasjonslogg, ikke en oppdiktet tidsverdi.

Utviklerbevis: permanent critical-kshms-deviations-check PASS med korttekst, uventet teksttap/readback-avslag, lokal gjenåpning, vanlig save, feilet close og bekreftet close som fjerner popupstate. Full EXPO_BACKEND_TARGET=sandbox npm run build PASS. En kort prøve med de faktiske React-komponentene i jsdom og avgrenset RPC-stub PASS: eksisterende sak i portal, gjenfunnet tekst, samme popup/scroll etter vanlig save, beholdt tekst ved feil og automatisk lukking etter bekreftet close. Dette er ikke en innlogget skynettleserprøve.

Databasebevis: scripts/kshms-deviation-save-close-sandbox-check.sql gjenskaper først «Save erased the control note». Rettelsen passerer deretter 14 kontroller både i kandidattransaksjon og etter anvendt migrasjon. Alle syntetiske rader rulles tilbake; ingen reell sak, HTTP eller e-post berøres. EXECUTE er fortsatt sperret for anon, tillatt for authenticated; tom search_path og private tilgangskontroller består. Advisor er kontrollert; den generelle merknaden om bevisst SECURITY DEFINER-RPC vurderes sammen med require_context, firmakontroll og ansvarligsperre. E-postworker er fortsatt deaktivert.

Brukerens korte Preview-prøve gjenstår. Ingen ny full skynettleserrunde; mobil, to faktiske brukerøkter og e-postmottak er fortsatt uprøvd. Ikke gjenta hele opprettelses-/omfordelingsløpet automatisk. Ingen main-/demo-merge eller Production-endring. Hele roadmapen nedenfor består. Det tidligere avsnittets 5/10/10-grenser er erstattet etter brukerens uttrykkelige ønske.

## Tidligere fortsettelsespunkt etter nytt chatbrudd – 7. oktober 2026

**Tillegg med de konkrete bevisene fra den opprinnelige dialogkjøringen:** AVVIK_DIALOG_20261007.md er nå ferdig med case-ID-er 68a26ff6-d9c2-4e1e-a766-e3769b2060fa og 6dc89fcd-bb48-44a0-9430-31dbeb75bcaa, SQL-bekreftet egen lukking, Lukket tilbake i prosjektet og siste faktiske reload på d73. To skjermbevis er lagret med varige referanser. Alle tre opprinnelige prosjektavvik er uendrede, worker er verifisert deaktivert og ingen sending er utført. Dette kompletterer den avbrutte kjøringens bevis; det er ikke en ny automatisk full omtest. Delavsnittet «Siste skjermstatus fra den avbrutte chatten» beskriver hva som var tilgjengelig ved den parallelle gjenopptakelsen før bevisene ble lagret. Den korte tretrinnsprøven i USER_TEST.md og hele roadmapen beholdes.

Dette avsnittet er nyere enn statusene og testlistene nedenfor. Brukeren har bedt om at han tester skjermflyten i den faste Preview-adressen, mens assistenten gjør korte, målrettede utviklerkontroller. Ikke start en ny full skynettleserrunde eller gjenta beståtte prøver uten en konkret grunn. Gi én avgrenset brukerprøve om gangen, rapporter resultat og lagre neste steg før videre arbeid. Dette erstatter de eldre arbeidsmåteformuleringene om at brukerens Preview-prøve ikke kan erstatte utviklerens lange skjermrunde. Relevante permanente critical checks, sikker lagring og eksplisitt TEST OK før eventuell merge gjelder fortsatt.

### Uavhengig kontrollert ved denne gjenopptakelsen

- Arbeidsbranch: feat-kshms-foundation. Funksjonskode: d73cd78935ab769b36c37ae4721934f586f05d27.
- Siste kodecommit er «fix(kshms): keep assignment identity in case and align dialog controls». Forrige kodecommit 88e1bfec7655026ecdb08c9b9796d7cb5b97938b inneholder stor avviksdialog og sikker prosjektkobling.
- Vercel dpl_G5pZJCaMa4pQwNyu1DcakbXt4AiA er READY på d73cd789. Fast alias peker på denne deploymenten: https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe .
- GitHub PR Core Safety 37644638589 er completed/success på d73cd789. Eksisterende CI er lest; ingen full lokal build eller database-/skynettleserprøve er gjentatt i denne gjenopptakelsen.
- PR #216 er fortsatt åpen draft, ikke merget. Main er fortsatt 155f6c4ac01f126c1db0c65da385cfd9305587d5. Ingen Production- eller demo-endring utføres.
- Begge håndbøkenes dekningsgrunnlag, 73 selvstendige forslag, 121 innholdstemaer og seks vedtatte hovedkapitler er bevart. Ikke spør om kapittelvalget på nytt.
- Gjenværende B–E er fortsatt hele utførelsesdelen med firmamaler/sjekklister/vernerunder, SJA, 5×5 risiko, øvrige varsler/PDF/rapporter, separat individuell HR/kompetanse/medarbeidersamtaler, valgfritt stoffkartotek og pilot/drift.

### Siste skjermstatus fra den avbrutte chatten

Brukeren har limt inn den siste assistentstatusen fra forrige økt. Den rapporterer at ny dialog åpner med tittelfokus, kladd overlever omlasting, valgt annen syntetisk ansvarlig beholdes og lagring åpner riktig KS/HMS-sak direkte. Melder får ikke den andres ansvarligvarsel og kan ikke lukke på den andres vegne. Deretter er overtakelse/egen lagret lukking, forsvunnet ansvarligvarsel, Lukket i prosjektet og tildelings-/overtakelses-/lukkehistorikk rapportert. Full-app-mobil var fortsatt utestående. Chatten frøs ved «Bekrefter lukket prosjektavvik etter omlasting», med planindikator «1 av 4».

Dette videreføres som rapportert resultat fra den avbrutte økten, ikke en ny skjerm- eller databaseprøve. Eksakt sak-ID, nye rå skjermbevis og en eksplisitt siste readback etter den aller siste omlastingen er ikke lagret i de gjenfunne testnotatene. Ikke konstruer disse eller grader siste omlasting som ny PASS. Eldre dokumenterte case-ID-er og UI-prøver beholdes som historikk. Koden og deploymenten over er uavhengig gjenfunnet; arbeidet skal ikke bygges på nytt fordi testnotatene var eldre.

### Neste avgrensede handling

Brukeren prøver først bare den nye dialogen på samme faste Preview: lagret prosjekt → Avvik → + Nytt HMS/prosjektavvik → velg ansvarlig og frist → Lagre avvik for oppfølging. Stor dialog, faktisk brukervalg og direkte åpning av riktig KS/HMS-sak skal vises. Se den korte aktuelle listen øverst i USER_TEST.md. Deretter håndteres brukerens resultat før neste avgrensede prøve eller utførelsesleveranse. To separate faktiske brukerøkter, mobil, avviksteller/ukoblet legacy og reelt e-postmottak beholdes som ufullførte kontroller; ingen lang omtest startes automatisk.

E-postlevering i Preview er fortsatt dokumentert deaktivert på grunn av manglende Sandbox-avsenderoppsett. Ingen faktisk mottaksprøve er bekreftet. Den tilstanden er ikke kontrollert på nytt i databasen ved dette dokumentarbeidet.

## Tidligere checkpoint: ny avviksrunde – 7. oktober, etter brukerens krasjrapport

Arbeid fra kontrollert 794a9e5f, nå testet funksjonskode d73cd78935ab769b36c37ae4721934f586f05d27. Brukerens removeChild-feil er gjenskapt med faktisk React-renderer/DOM-adapter og løst i samme prøve. Stor dialog, faktisk ansvarligvalg, frist, «Lagre avvik for oppfølging», bekreftet prosjektkilde/KS-kobling og beholdt kladd er publisert på den faste Preview-adressen. Egen innlogget skynettleserprøve passerer ny separat prosjektavviksrad → valgt medarbeider → direkte åpnet sak → omfordeling til egen bruker → dokumentert egen lukking → Lukket tilbake i prosjektet → faktisk reload. Ny opprettelse/lukking på siste d73-kode passerer også; ansvarlig-ID beholdes i KS-saken, uten redundant ID i prosjektposten. Ditt eksisterende Test-prosjektavvik åpner riktig koblingsdialog med beskrivelse/frist og uten automatisk tolking av fritekstnavn; det er ikke endret eller koblet av utvikleren. Se AVVIK_DIALOG_20261007.md for case-ID-er, skjermbevis og testgrenser. Mobil og to separate innloggede brukere gjenstår. Tidligere UI-prøver beholdes som historikk.

## Mål og leveranseomfang

Bygge en integrert KS/HMS-modul i Expo ProffDok, med Ringside som pilot og mulighet for flere firmaer. Modulen skal omfatte selvstendige, tilpassbare rutiner, dokumentert egen gjennomgang, oppfølging/revisjon, utførelsessjekklister, SJA, risikovurdering, avvik/RUH, varsler og rapporter. Valgfrie deler omfatter individuell personal/kompetanse og stoffkartotek. Kapasitetsmålet på 100 firmaer er en plan, ikke en utført lasttest.

Modulen aktiveres per firma av systemadmin. Firmaadmin gir aktive interne medarbeidere tilgang. Kunde, UE og innleid får ingen ny KS/HMS-modulrettighet. Online mobilbruk er tilstrekkelig i første leveranse. Ordre, timer, materiell, ressursplanlegging og betalingsintegrasjon bygges ikke i denne modulen. Pris/fakturering er fortsatt uavklart og blokkerer ikke gjeldende Preview-arbeid.

## Kontrollert Git- og miljøpunkt

| Referanse | Status ved kontroll 7. oktober |
|---|---|
| Repo | ExpoProffsenter/expo-proffdok |
| Arbeidsbranch | feat-kshms-foundation |
| Siste faktisk UI-testede funksjonskode | d73cd78935ab769b36c37ae4721934f586f05d27 |
| Tidligere A2-funksjonskode med 73 SQL-kontroller | 6bf84204db9c7869bebafb19c034dc02f53f25ca |
| PR | #216, åpen draft, ikke merget |
| Eksisterende checkpoint | checkpoint-kshms-recovery-20261006, 9e88f4cc41db905898a4fbf0e013905ddee30343 |
| Fast Preview | https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe |
| Preview-backend | Sandbox ppvircenkjizeiqdxphj; branch-spesifikk EXPO_BACKEND_TARGET=sandbox |
| Main ved kontroll | 155f6c4ac01f126c1db0c65da385cfd9305587d5 |
| Production-backend | dqffxflaoyarbxyiyhop |
| Siste faktiske skjermprøve-Preview | dpl_G5pZJCaMa4pQwNyu1DcakbXt4AiA, READY på d73cd789 |
| Siste funksjonskode CI | PR Core Safety 37644638589, success på d73cd789 |
| Permanent demo | demo; https://expo-proffdok-git-demo-ringside.vercel.app |

Denne runden endrer avviksdialog, nødvendige prosjektkoblinger og to tekstetiketter som utløste krasjet; ingen SQL/RLS/Auth/e-post- eller demoendring. Full EXPO_BACKEND_TARGET=sandbox npm run build passerer på siste kode. READY, Core Safety og branch-spesifikk Sandbox-binding er kontrollert. Dokumentasjon av siste prøve lagres etter funksjonscommiten. Tidligere 73 SQL-kontroller gjentas ikke uten ny grunn. Historiske håndbok-/sjekkpunktprøver står i UI_TEST_20261007.md; ny dialogprøve står i AVVIK_DIALOG_20261007.md. Miljømål BEGGE; kun eksisterende Sandbox-Preview er oppdatert.

Tidligere håndbok-TEST OK for 6dfb74dad244ff9bd0e416a08f0a34bc88da3c3a gjelder den prøvde håndboken. Ny A2-TEST OK og eksplisitt Production-godkjenning er ikke gitt.

## Originaler og vedtatt kapittelinndeling – 7. oktober

Kenneth har etter sammenligningen besluttet å beholde ProffDoks seks inndelinger **som egne hovedkapitler**: Virksomhet og kvalitetsledelse; Personal, kompetanse og arbeidsmiljø; Sikker utførelse og beredskap; Fag og kvalitet; Ytre miljø og bærekraft; Personvern og informasjonssikkerhet. Originalenes fem kapitler beholdes som sporbar kildestruktur. Rutinetekstene skal fortsatt være selvstendig skrevet. Kapittelvalget er avklart og skal ikke spørres om på nytt.

Begge originalene har følgende hovedkapitler, kontrollert i tekst og visuelt på PDF-side 4–5:

1. 01. Vår bedrift
2. 02. HMSK
3. 03. Rutiner
4. 04. Miljø
5. 05. Personvern

| Original | Sider | Varig filreferanse | SHA-256 for kontrollert original |
|---|---:|---|---|
| QualityHandbookpdf.pdf | 148 | libfile_0034077571608191af2e8bfbddf996e7 | 8bf7d80348926287aa34a66282e4bade14ff0d7fcbda186fd365ba77b81f4403 |
| PersonalHandbookpdf.pdf | 127 | libfile_3cebf82948a88191bde1b4dc7a7f8a05 | 49b0e66ebd9a24d259b0971fe3fc0934078c42eaeb71e4ccd9d4a2bb84e1b70a |

Originalene kan hentes igjen med disse filreferansene. Gjeldende lokale kopier i denne samtalen ligger i /workspace/scratch/19673519cc9a/sources/. Ikke bygg videre utelukkende på en gammel lokal filsti. Ikke legg originalenes fulltekst, personlige svar, skjemaer eller illustrasjoner inn i Git-repoet.

Kilder og tema brukes som dekningsgrunnlag. Skriv egne mål, ansvar, fremgangsmåte og dokumentasjonskrav fra arbeidsoppgaven og aktuelle primærkilder. Ikke omskriv originalen setning for setning. Rutineoverskrifter kan være egne, korte beskrivelser. Originalenes kapittel/tema og kildetilknytning skal være sporbar sammen med brukerflatens seks egne hovedkapitler. Gjeldende krav må kontrolleres ved faglig forfatting; historiske covid-regler skal ikke publiseres som universelle gjeldende regler.

### Originalenes fem kapitler og katalogens seks grupper

Katalogen på 228357af bruker fremdeles seks grupper: Virksomhet og kvalitetsledelse; Personal, kompetanse og arbeidsmiljø; Sikker utførelse og beredskap; Fag og kvalitet; Ytre miljø og bærekraft; Personvern og informasjonssikkerhet.

Brukerens valg er bekreftet 7. oktober 2026 kl. 14:31 Europe/Oslo: seks egne hovedkapitler. Katalogen har allerede disse seks. Kodekontroll av KshmsModule.jsx bekrefter separate kapittelområder med egne h3-overskrifter for firmaets rutiner; KshmsRoutineLibrary.jsx har et kapittelvalg for standardforslagene. Innlogget skjermprøve 7. oktober bekrefter alle seks valg i «Vis kapittel», 73 forslag og eget filter for «Fag og kvalitet». Firmaets ti eksisterende rutiner ligger under fem befolkede kapitteloverskrifter; ingen fagrutine er valgt der ennå. Bevar stabile rutine- og kilde-ID-er, firmaets egne utkast/kapittelvalg, publiserte versjoner, signaturer og bekreftelser. Omgruppering til originalenes fem kapitler skal ikke gjennomføres. Ingen rutinetekst eller firmadata endres av denne beslutningsregistreringen.

### Tekstlikhetskontroll utført i denne samtalen

Alle 73 forslag på 228357af ble kontrollert mot full sidevis tekstuttrekking fra begge originalene. Felt: goal, responsibility, procedure, documentation og confirmation. Metode: ordtokenisering uten hensyn til store/små bokstaver; søk etter identiske sammenhengende sekvenser på 16 ord. Resultat: 0 treff.

Denne kontrollen dokumenterer direkte lang tekstlikhet i de valgte feltene. Den avgjør ikke kortere likhet, parafrase, rettslig status eller full faglig kvalitet. Manuell redaksjonell/faglig gjennomgang og firmatilpasning er fortsatt nødvendig.

## Beslutninger som ikke skal spørres om på nytt

- Egen gjennomgang/signering av tildelte rutineutgaver er påkrevd før arbeid etter firmaets regel. Det gjelder også firmaadmin og KS/HMS-ansvarlig. Valget ved publisering gjelder tidspunktet for egen bekreftelse, ikke om kravet er frivillig. Ingen automatisk sperre av andre prosjektmoduler er levert.
- Min personalhåndbok er et søkbart oppslag i egne tildelte publiserte utgaver, også etter bekreftelse. Eksakt utgave, faktisk firmagodkjenner og egen gjennomgang med identitet/tidspunkt skal være synlig.
- Firmaadmin og intern medarbeider med aktiv KS/HMS-ansvarligrolle kan utarbeide og godkjenne rutiner. Firmaadmin styrer modultilgang, utpeking av revisjonsansvarlig og arkivering. Den eksplisitt utpekte ansvarlige signerer årlig revisjon.
- Nye sentrale forslag skal aldri automatisk overskrive firmaets tilpassede utkast, godkjente utgaver eller signaturer.
- Melder velger en aktiv intern bruker med KS/HMS-tilgang som ansvarlig. Eksemplet er Trond som velger Eli.
- Eli får tildelings-e-post og et fast ansvarligvarsel i alle interne appfaner. Trond skal ikke få Elis ansvarligoppgave.
- Eli dokumenterer årsak/tiltak/egen kontroll og lukker selv. Bare valgt ansvarlig kan lukke; firmaadmin kan ikke lukke Elis sak som en annen aktør. Tidligere forslag om separat kontrollør er erstattet.
- Lesing, åpning og fanebytte fjerner ikke oppgaven. Varselet forsvinner først ved bekreftet lagret lukking. Feilet eller tapt lagringssvar skal ikke skape falsk lukking.
- Prosjekt-/sjekkpunktavvik kan kobles inn med stabil kilde. Deretter bestemmer KS/HMS status; den gamle prosjektvisningen kan ikke omgå lukking. Ukoblede prosjektavvik og brukere uten modultilgang beholder eksisterende flyt.
- Avvikssentralen har åpne/lukkede saker, ansvarlig, frist, tiltak, egen kontroll, private vedlegg og hendelseshistorikk. Gjenåpning, omfordeling og revokert tilgang kontrolleres på serveren.
- E-post under utvikling skal ikke sendes til ekte medarbeidere. Mottaker/grant/status kontrolleres før levering; deduplisering, retry, lukking og omfordeling inngår. Ekstern rapportdeling krever konkret mottaker-/innholdsgodkjenning og sendehandling.
- Eksisterende tilbud, autosave/hydrering, innlogging, prissøk, prosjektflyter, garantier og sjekklister skal vernes etter AGENTS.md/PROJECT_GUARDRAILS.md. Main → demo er eneste synkretning.

## Roadmap og faktisk status

| Trinn | Målet | Status / neste arbeid |
|---|---|---|
| A | Aktivering, firmatilgang, oppstart, håndbok/utkast/publisering/versjoner, Min personalhåndbok, egne bekreftelser, oppfølging og signert revisjon | Fundamentet er levert i Preview. Tidligere håndbokprøve er godkjent for sin eksakte versjon. |
| A2 + fremskyndet avvik | Full tematisk rutinedekning fra begge håndbøkene, avvikssentral, prosjektkobling, fast ansvarligvarsel og tildelings-e-post | 73 forslag dekker 121 innholdstemaer + fire metadatarader; seks egne hovedkapitler er vedtatt. Innlogget desktopprøve passerer kapittelfilter, firmaavvik, koblet eget sjekkpunkt og separat prosjektavvik med stor dialog, kladd, faktisk ansvarligvalg, egen lukking og omlasting. To separate brukerøkter, full ukoblet legacy-lukking/gjenåpning, avviksteller for egne sjekkpunkter, full-app-mobil, reelt e-postmottak og A2-TEST OK gjenstår. |
| B | Versjonerte firmamaler/gjennomføringer med og uten prosjekt, typede svar/bilder/filer/signaturer, mobile SJA og 5×5 risikoanalyse | Utførelsesverktøy/SJA/risiko gjenstår. Håndbokrutiner erstatter ikke gjennomføringer. SJA signeres av ansvarlig PL; deltaker-/medvirkningsbevis uten automatisk krav om alle deltakersignaturer. Betingede krav og senere underskjema skal versjoneres og bevare signerte snapshot. |
| C | Flere varsler/påminnelser, kildeoppdateringsforslag, PDF rutine/sjekkliste/SJA/risiko/avvik, begrenset rapportutdrag og valgfritt sluttrapportvalg | Tildelingsworker er fremskyndet til A2. Fristpåminnelser, eksport/PDF/tilsynsuttrekk og øvrig C gjenstår. |
| D | Valgfri individuell kompetanse/kurs/sertifikater/utløp, medarbeidersamtaler/oppfølging med separat HR-tilgang; valgfritt stoffkartotek | Gjenstår. KS-rolle gir ikke automatisk tilgang til andres personalmappe. Innsyn, personvern, oppbevaring og kontrollert sletting må spesifiseres før implementering. |
| E | Ringside-pilot, komplett tematisk/funksjonell kontroll, hjelp, drift/kilderevisjon, kapasitet, godkjenning per release og senere supportmodus | Gjenstår. Support skal være firmagodkjent, tidsbegrenset og logget; ingen signering på vegne av andre. Delvis leveranse skal ikke kalles komplett. |

PLAN.md inneholder detaljert minimumsdekning, offentlige kilder, roller, datamodell og akseptanse. CONTENT_STATUS.md/COVERAGE.md/coverage.json bevarer kildetemaer og sporbarhet. CAPACITY.md beskriver planlagte målinger før bred utrulling.

## Tester og gjenstående blokkeringer

Lagret QA på funksjonskode 6bf84204 dokumenterer 73 Sandbox-kontroller med full rollback, grønn eksisterende håndbokkontroll, faktiske React-handler-/task-/legacy-scenarioer, mailer med erstattet transport og grønn full critical build/Core Safety. Disse kontrollene skal ikke omtales som en innlogget full-app-/mobilprøve.

UI_TEST_20261007.md dokumenterer de tidligere innloggede desktopprøvene: firmaavvik 683a29cb-4ccd-47db-9377-8d8504d86db2 og koblet sjekkpunkt bbaa4b37-48d3-49d1-99d8-96da49e73cbf. AVVIK_DIALOG_20261007.md dokumenterer denne rundens to separate prosjektavvik 68a26ff6-d9c2-4e1e-a766-e3769b2060fa og 6dc89fcd-bb48-44a0-9430-31dbeb75bcaa, begge lagret lukket. Første prøve velger en annen ansvarlig og omfordeler deretter til egen testbruker; det er ikke en separat medarbeiderinnlogging. Kladd hentes etter reload, riktig sak åpner direkte, egen lukking bekreftes med aktør/tid og vises tilbake i prosjektet etter reload. Alle tre eksisterende prosjektavviksrader er uendrede. Ny stor React-dialog erstatter den tidligere native prompten; den gamle getJsDialog-grensen er historikk, uten omgåelse. Dev-logs er utilgjengelig i denne browserøkten; DOM/AX/skjerm og databasekontroll virker. Mobilbredde kan ikke settes med denne øktens dokumenterte API, så ingen mobil-PASS. To brukerøkter, full legacy-lukking/gjenåpning, toppfanens teller for egne sjekkpunkter og faktisk e-postmottak gjenstår. Arbeider enabled=false og samtlige tre nye utboksrader pending/attempts=0/sent_at=null. Tidligere environment_offline er kontrollhistorikk.

Sandbox-worker v3 er lagret/deployet, men RESEND_API_KEY og CHAT_FROM_EMAIL er ikke konfigurert og sending er deaktivert. EMAIL_SETUP.md beskriver sikkert oppsett, health/check-mode og avtalt mottaksprøve. Ingen hemmeligheter skal legges i chat, kildekode eller dokumentasjon. Faktisk avsenderoppsett og avtalt testmottaker må avklares ved e-postprøven; dette er ikke et åpent spørsmål om avviksfunksjonen.

## Neste avgrensede oppgaver og avbruddsrutine

1. Kapittelvalget er avklart og innlogget kapittelfilter er prøvd: behold seks egne hovedkapitler og eksplisitt kildedekning av alle 121 temaer. Ikke omgrupper standardbiblioteket til originalenes fem kapitler.
2. Fortsett med to separate brukere etter Trond → Eli-eksemplet, full ukoblet legacy-lukking/gjenåpning, målrettet undersøkelse av toppfanens antall for egne sjekkpunkter og mobil på samme faste Preview. Eget sjekkpunkt og separat prosjektavvik → KS/HMS → lagret lukking/omlasting er bestått; ikke gjenta disse eller firmaets håndbokgodkjenninger uten grunn. USER_TEST.md gir faktisk brukerprøve for den nye dialogen. Brukerens Preview-prøve erstatter ikke utviklerens skjermtest. Ved sperret innloggings-/dialogverktøy: følg dokumentert sikker overlevering når tilgjengelig; ikke omgå beskyttelsen eller kjør samme avviste kall i løkke.
3. Klargjør/avklar e-postoppsett og testmottaker sikkert, og kontroller reelt mottak før funksjonen omtales som ferdig verifisert.
4. Fullfør resterende B–E i avgrensede leveranser etter planen. Ny relevant TEST OK og Production-godkjenning kreves før release.

Ved videre arbeid: les AGENTS.md/PROJECT_GUARDRAILS.md og relevante critical checks; hent aktuell GitHub-HEAD før endring. Bruk separat arbeidsmappe på aktuell head. Ikke resett eller overskriv de gamle arbeidsmappene blindt.

Arbeid i korte, avgrensede deler. Etter hver del lagres kode, migrasjoner, kontrollresultat og oppdatert neste steg i GitHub. Bruk kontroll av forventet branch-SHA ved oppdatering. Endret SHA skal utløse ny lesing/sammenligning; aldri tvangsoverskriv en annen kjøring. Ikke kjør allerede anvendte Sandbox-migrasjoner på nytt uten å kontrollere migrasjonsloggen.

En ny chat kan få denne teksten: «Fortsett KS/HMS Expo ProffDok. Les docs/kshms/CONTINUITY.md på feat-kshms-foundation, deretter gjeldende PLAN/QA/USER_TEST og faktisk branch/PR. Bevar alle beslutninger og hele roadmapen. Fortsett fra første dokumenterte ufullførte oppgave.»

Kapittelsammenligningen er lagt frem og Kenneth har valgt de seks som egne hovedkapitler. Nye funksjonsavklaringer er ikke nødvendige for å fortsette eksisterende Preview-test.

Arbeidsmåten begrenser tap av kontekst og gjenoppbygging ved avbrudd. Den gir ingen garanti mot feil i selve chat-/verktøyplattformen.


## 2026-10-07 — kompakt ordremeny og sjekklistepopup

Miljømål BEGGE. Arbeidet bygger på remote 12183b181e4ce603394ac71b817b3eccb3fac6fa. Bare eksisterende feature/Sandbox Preview oppdateres; ikke main eller produksjonsdatabasen.

Generelle ordrer bruker prosjektets kompakte desktopmeny med ordreetiketter og uten skjulte våtromsfaner. Ingen standard våtromsliste legges automatisk til. Egne sjekkpunkter kan legges til uten garanti eller personlig KS/HMS-tilgang. Firmaets aktiverte modul styrer fortsatt innhenting av publiserte malutgaver. Eksisterende svar som ikke er aktive i ordren, beholdes under «Tidligere dokumentasjon».

Sjekklistene og innhentingen vises kollapset. «Åpne sjekkliste» åpner en React-eid popup. «Lagre» lagrer en kontroll under arbeid for videreføring av personer som allerede har prosjektets redigeringsrett. «Sjekkliste fullført» lagrer en uforanderlig kontroll med definisjon, svar, bilder, serverens brukeridentitet og tidspunkt. «Start ny kontroll» beholder fullførte kontroller og viderefører åpne/koblede avvik. Fullføring lukker ikke avvik. Egne punkter kan legges til en pågående kontroll; fullførte og innhentede maldefinisjoner forblir faste.

Prosjektkontroller lagres i private tabeller med eksisterende prosjekt-/firma-/profilkontroll og låssjekk. Ingen personlig KS/HMS-rett kreves for egne punkter. Revisjonskontroll hindrer at to personer overskriver hverandre. Faste lagrings-ID-er gjør tapt svar trygt å prøve igjen. Readback kontrolleres før lokal kladd slettes. Triggeren beskytter popupens svar mot forsinket vanlig prosjekt-autolagring; eksisterende KS/HMS-trigger kjøres etterpå og beholder autoritativ avvikslukking. Andre prosjektdata, signaturer, vedlegg og legacyavvik beholdes.

Sandbox-migrasjonsloggen er fasit for filnavn: 20261007180955 project_checklist_runs, 20261007182126 project_checklist_command_scope, 20261007182209 project_checklist_command_block, 20261007182259 project_checklist_mirror_scope og 20261007182742 project_checklist_custom_points. De små oppfølgingsmigrasjonene retter SQL-variabelscope før publisering og tillater egne punkter i en kladd. De skal følge grunnmigrasjonen i samme rekkefølge ved senere godkjent produksjonsutrulling.

Verifisert: 31 reelle SQL-kontroller med syntetiske rader og rollback; faktisk React-popup med fanebytte, lagringsfeil/retry, kollegas videreføring, egne nye punkter, bilder, flere kontroller, historikk, konfliktvisning, skrivebeskyttelse og sen firmabytte-respons; kompakt ordremeny videresender til native knapper uten skjulte våtromsvalg. Eksisterende React-test for malbygging/publisering/innhenting og montert sjekklistehopp passerer. «Åpne først»-kravet endrer med vilje gammel tests forventning om automatisk utvidet liste; hoppkontrakten er bevart. Ny critical-check er lagt inn i build/QA. Innlogget Preview-prøve gjenstår før TEST OK/merge.

Kort brukertest på samme faste Preview: Åpne testordren → Sjekklister. Menyen skal være kompakt og listene kollapset. Åpne «Egne sjekkpunkter og vedlegg», legg til et punkt, åpne listen og lagre. Åpne den igjen (gjerne med en annen person som har prosjektadgang), fortsett og trykk «Sjekkliste fullført». «Start ny kontroll» skal åpne neste kontroll mens den første kan leses i historikken. Prøv også en publisert KS/HMS-liste.
