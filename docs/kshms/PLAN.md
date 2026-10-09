## HR H4 – manifestverktøy og isolert fysisk restore, 9. oktober 2026

HR ser foreløpig tom ut fordi bare medarbeider-/leder-/leserregisteret er åpnet. Samtalereferater, egne forberedelser, sykefraværsoppfølging og private vedlegg er kommende innhold. H4 gir privat HMAC-/prosjektbundet operator-manifest med holdbar skriving og komplette snapshots, samt konkret retting av orphan-filer ved restore uten medarbeiderrad. **39 lokale fysiske PostgreSQL-/filrestore-kontroller PASS**, **11 nye Sandbox-assertions og berørte H3 61 PASS**, permanent critical/full build PASS. Dette er fysisk PGlite-restore og lokale faktiske bytefiler, **ikke full Supabase-cloud-restore**. Varig ekstern driftsbinding/ack og full isolert Supabase-restore gjenstår; sensitivt innhold fortsatt stengt. 1 eksisterende HR-firma/medarbeider beholdt. Ingen UI-/B/C-omtest, e-post, merge eller Production. [Scope, bevis, operatorløp og grenser](HR_RESTORE_LEDGER_20261009.md). Neste synlige produktdel er medarbeidersamtalen etter gjenstående åpningskrav. Tidligere TEST OK beholdes.

## H3 og samlet Hjelp – 9. oktober 2026

## Hjelp og moduladgang på brukerkort – 9. oktober 2026

Alle hjelpepunkter har ikon, og rekkefølgen følger arbeidsflyten. KS/HMS og HR filtreres med egne ferske rettigheter; øvrig modulhjelp følger også tildeling. Systemadmin aktiverer KS/HMS/HR i firmaoversikten; firmaadmin/systemadmin gir individuelle valg på eksisterende brukerkort. HR-modultilgang gir ikke automatisk individuelt HR-innsyn. **38 nye faktiske SQL assertions PASS**, berørte H1/H2/H3 **75/16/61 PASS**, faktisk React/DOM og full Sandbox critical/build PASS. Eksisterende 1 HR-firma/1 medarbeider beholdt; innhold stengt og restore quarantined. Bare feature/Sandbox, ingen mail/merge/Production. [Scope, vei til tilgang og bevis](HELP_ACCESS_20261009.md). Publisert eksakt SHA, CI og Preview føres i draft PR #216.


Miljømål **BEGGE**, bare feature/Preview og Sandbox, draft PR #216. Hjelp har nå ett **KS/HMS**-punkt med 11 kapitler og ett **HR**-punkt; tidligere hjelpeinnhold beholdes. HR-slettefundamentet omfatter registrert innhold, versjoner, kladder, søkeuttrekk, eksporter og private filer. Tilgang sperres straks; **Slettekvitteringer** viser pågående filsletting og ferdig sletting korrekt.

**61 nye faktiske Sandbox-assertions PASS**, faktisk privat Storage-opplasting/hashkontroll/API-sletting av én syntetisk 62-bytes fil PASS, faktisk HR/Hjelp-React og full critical build PASS. Alle 16 live SQL-funksjoner og Edge v3 er lest tilbake mot kilden. Sensitivt HR-innhold og filnedlasting er fortsatt stengt, både i databasen og i Edge-koden. Uavhengig slettemanifest og full isolert backup-restore er neste sikkerhetsbevis før åpning. Sandbox har nå én firmaoppføring og én medarbeider; eksisterende oppføring beholdes, ingen sensitive data eller testrester finnes. Ingen e-post, merge eller Production. Kenneths **TEST OK for H2-menyen** er mottatt; eldre B/C/PDF/ZIP-bevis beholdes. [Scope, kontrakt og QA](HR_PURGE_FILES_20261009.md).

## HR-register og smartere KS/HMS-meny – 9. oktober 2026

Miljømål **BEGGE**, levering bare feature/Preview/Sandbox, draft PR #216. H2 gir eget HR-hovedvalg med firmaadmins medarbeider-/leder-/leserregister og medarbeiderens Mine oppfølginger. HR har fortsatt ingen samtale-/fraværsinnhold, filer eller eksport; full innholdspurge/restore må leveres før sensitivt innhold åpnes. Ingen firma aktivert av leveransen. KS/HMS-menyen er gruppert i Daglig arbeid, Mine rutiner og Forvaltning; eksisterende faner, snarveier og utkastbevaring beholdes.

**16 nye faktiske Sandbox-assertions PASS**, faktisk HR/meny-React og berørt håndbok/kildeforslag-React PASS, permanent hook/tilgang/revisjon/late-response-prøve og full critical build PASS. Fem HR-FK-indekser forbedrer slettestien. Skynettleseren fungerer igjen; faktisk ny layout etter publisering og eksakt SHA/CI/Preview føres i PR #216. Tidligere Kenneth TEST OK og B/C/PDF/ZIP-bevis beholdes uten ny obligatorisk omtest. Ingen mail/merge/Production. Neste: privat fil-/full slettekontrakt. [Scope og QA](HR_UI_MENU_20261009.md).

---

## HR H1 – første sikkerhetsfundament, 9. oktober 2026

Firmabundet medarbeider-/lederregister, eksplisitte ekstra lesere, fersk tilgang og fysisk sletting av register/tildelinger er levert i feature/Sandbox. **75 faktiske rollback-assertions PASS**, permanent klientprøve og full critical build PASS; alle ti live funksjoner byteidentiske. HR er deaktivert for alle firmaer, private filer stengt og tomme. Dette er backend uten ny HR-meny, referat, fravær eller eksport. Full sletting av fremtidig HR-innhold/filbytes og restore er ikke levert. Neste: HR-registerets brukerflate, deretter privat fil-/innholdspurge før sensitivt innhold. Tidligere TEST OK beholdes; ingen ny Kenneth-prøve eller browser-PASS. Miljømål **BEGGE**, bare feature/Preview; KS-e-post fortsatt disabled. [Scope, QA og grenser](HR_FOUNDATION_20261009.md). Publisert SHA/CI/Preview føres i draft PR #216.

---

## B/C-sluttkontroll og drift – 9. oktober 2026

Samlet B/C-utviklerreview er gjennomført; alle seks påminnelsestyper er levert. Ny lesende Sandbox-kontroll bekrefter 20/20 offentlige KS-tabeller med RLS, worker disabled og en liten eksisterende kø. Avgrensede SQL-planer er dokumentert; ingen 100-firma-kapasitet eller browser-/fil-/leveringsbevis påstås. Håndbok-/malhistorikk og store eksporter er konkrete vekstpunkter før større utrulling. Bare dokumentasjon endret, ingen ny obligatorisk Kenneth-prøve; tidligere TEST OK beholdes. Neste utviklingspunkt er avklart HR-tilgang/private filer/sletting før sensitivt innhold. Releasebevis og ekte e-postaktivering/mottak følger egne konkrete punkter. [Sluttstatus, scope og målinger](BC_CLOSEOUT_20261009.md). Miljømål **BEGGE**, bare feature/Preview; ingen merge/Production. Publisert SHA og grønn CI/READY Preview føres i draft PR #216.

---

## Oppgavepåminnelser – 9. oktober 2026

Miljømål **BEGGE**, levering bare feature/Sandbox. Påminnelser følger opp ufullførte vernerunder, risiko, SJA og egne lesebekreftelser etter minst sju dager. Framtidig planlagt dato utsetter oppfølgingen. Ingen nye arbeidsfrister eller automatiske signeringer. Egen appoversikt åpner eksisterende arbeidsflater. **41 ulike Sandbox-assertions PASS**; eksisterende seks varseltyper **36 PASS**, avvikspåminnelser **37 PASS** og revisjonspåminnelser **36 PASS**. Faktisk React-appflyt og berørte kilde-/revisjonsflyter PASS; full critical/build PASS. Migrasjon 20261009171349 og Edge v7 levert, worker **enabled=false**, 0 syntetiske firma/brukere. Tidligere TEST OK beholdes; ingen ny obligatorisk Kenneth-prøve. Testmailen er ikke sendt. Neste punkt: samlet B/C-sluttkontroll og drift/kapasitet før HR. [Scope og QA](TASK_REMINDERS_20261009.md). Publisert SHA, CI og READY Preview føres i draft PR #216.

---

## Håndbokrevisjonspåminnelser – 9. oktober 2026

Miljømål **BEGGE**, leveranse bare feature/Sandbox. Utpekt ansvarlig får egen revisjonsoppgave og åpner eksisterende skjema uten automatisk signering. Ukentlige påminnelser bruker bare aktuell periode, med sju dagers sendepause og fersk kontroll av ansvar, dato og tilgang. **36 nye Sandbox-assertions PASS**, eksisterende varseltyper **36 PASS**, avvik/RUH-påminnelser **37 PASS** og faktisk React-flyt/kildeoppdateringsregresjon PASS. Full critical/build PASS. Migrasjon 20261009164036 og Edge v6 levert; worker fortsatt **enabled=false**, syntetiske data rullet tilbake. Tidligere TEST OK beholdes; ingen ny obligatorisk Kenneth-prøve. Testmailen er ikke sendt. Neste funksjon er øvrige C-påminnelser; faktisk innlogget fil-/mobil-/flerbrukerbevis og kontrollert release gjenstår. [Scope og QA](REVIEW_REMINDERS_20261009.md). Publisert SHA, CI og READY Preview føres i draft PR #216.

---

## Samlet B/C-gjennomgang – 9. oktober 2026

[OVERSIKT](OVERSIKT.md) er nå en kompakt, oppdatert A–E-status; tidligere oversikt er arkivert. Underskjema, avvik/RUH-påminnelser, kildeoppdatering og ti-gruppe PDF/ZIP er registrert som levert. Gjenstående funksjonsgap skilles fra innlogget fil-/mobil-/flerbrukerbevis. Neste konkrete utviklingsscope er håndbokrevisjonspåminnelser, deretter øvrige C-påminnelser før HR. Tall/dato er dekket i faste skjemaer; generell skjemabygger legges ikke til som nytt obligatorisk krav. **45 faktiske Sandbox-RPC-assertions PASS**, kombinert React/PDF med alle ti grupper **26 / 25 sider**, ZIP **13 filer + manifest** og visuell kontroll av alle 26 sider PASS. Syntetisk transport er ikke faktisk innlogget Storage-bevis. Ingen ny obligatorisk Kenneth-prøve; tidligere TEST OK beholdes. Testmailen er autorisert, ikke sendt; transport fortsatt disabled. Miljømål BEGGE, bare feature/Sandbox. [Kravkart og bevis](BC_REVIEW_20261009.md).

---

## Kildeoppdateringsforslag – gjeldende fortsettelsespunkt 9. oktober 2026

Miljømål **BEGGE**, levering bare feature/Sandbox. Oppfølging og revisjon har nå en samlet oversikt over nyere sentrale ProffDok-tekstforslag og vurderte utkast som fortsatt må firmagodkjennes. Sammenligningen viser firmaets tekst og forslaget felt for felt. Å bruke ett felt endrer bare dette feltet; bare **Jeg har vurdert hele tekstforslaget** flytter utkastets forslagsutgave. Egne tilpasninger beholdes. Lagre utkast og Godkjenn og publiser er separate handlinger. Gjeldende godkjente utgaver og gamle ansattbekreftelser omskrives ikke. Ingen nettkilde markeres kontrollert av denne vurderingen, og dette er ikke automatisk lovovervåking.

**Utvikler-QA:** permanent critical-kjede og full lokal build PASS; faktisk React/Vite/JSDOM PASS for sammenligning, manuell kildedato, lokal kladd, feilet lagring/retry, lagret vurdering uten publisering, eksplisitt godkjenning, nye tildelinger og bevarte historiske bekreftelser. Ekte Sandbox-RPC i rollback-transaksjon: **22 assertions PASS**, inkludert firma-/rolle-/revisjonskontroll, kildegrunnlag, immutable v1/v2 og avslått modul. Direkte sluttkontroll: 0 syntetiske firma/brukere, worker `enabled=false`. Ingen ny migrasjon, RPC, RLS/Storage eller global navigasjon. Publisert SHA, Core Safety og READY Preview dokumenteres i draft PR #216 etter levering. [Scope og QA](SOURCE_UPDATES_20261009.md).

Kenneths TEST OK **00:59 / 01:29 / 01:55 / 02:28 / 15:01** beholdes. Ingen ny obligatorisk Kenneth-prøve opprettes. Innlogget browserbevis er fortsatt blokkert etter reset av `native credential state cannot be safely resumed`; dette er ikke browser-PASS. Neste punkt er samlet helhetlig B/C-vurdering og målrettet dekning av faktiske filer, mobil og flerbruker før HR. Tidligere fortsettelsespunkter nedenfor er historikk.

**E-postavklaring:** Kenneth autoriserte én kontrollert test til sin valgte arbeidsadresse 9. oktober kl. 17:29. Testen er ikke sendt; Production-testendpoint krever fungerende innlogget systemadminøkt. Generell køaktivering er fortsatt avslått. KS/HMS-varsler og fristpåminnelser skal aktiveres og verifiseres ved senere godkjent produksjonssetting. Ingen Production-release eller main/demo-merge er bestilt. Denne avklaringen supplerer de eldre sendingstillatelsene nedenfor.

---

## Fristpåminnelser for avvik/RUH – 9. oktober 2026

Miljømål **BEGGE**, levering bare feature/Sandbox. Oppgavelisten viser passert frist, frist i dag og frist innen tre dager etter norsk kalenderdato. Periodiske e-postpåminnelser for åpne avvik/RUH bruker den private køen, høyst én per syv dager og tidligst syv dager etter siste tildelingslevering. Bare aktuell ukesperiode opprettes. Ansvar, frist, status, firmaaktivering, medlemskap og grant kontrolleres før levering. Deaktivering og reaktivering skal ikke spille av gamle påminnelser. E-posttransport forblir avslått.

Utviklerkontroller og faktiske bruker-TEST OK holdes atskilt; ingen ny obligatorisk Kenneth-prøve opprettes. Tidligere TEST OK beholdes. Skynettleseren er fortsatt blokkert av verktøyets credential-state-grense; det er ikke påstått innlogget nettleserbevis for denne leveransen. Påminnelser for andre oppgavetyper og HR-utløp inngår ikke i denne første avgrensningen. Neste utviklingspunkt er kildeoppdatering. [Scope og QA](DEVIATION_REMINDERS_20261009.md).

---

## Testarbeid – avklart med Kenneth 9. oktober 2026

Kenneth påpekte kl. 15:17 at gjentatte like brukerprøver skaper en testsløyfe, og ba om at agenten tester i skynettleseren. Agenten tar teknisk QA: felles PDF-/ZIP-flyter regresjonstestes samlet, med målrettede tester for hver dokumenttypes datakobling. En ny variant blir ikke automatisk en ny obligatorisk Kenneth-prøve. Brukerprøver samles til en kort helhetlig gjennomgang når det finnes en vesentlig ny arbeidsflyt eller et konkret hull som agenten ikke kan dekke. Kritiske regresjonsvern og krav til eksplisitt godkjenning før eventuell merge består. Ingen eksisterende TEST OK skal gjentas uten konkret feil/relevant regresjon.

Tidligere åpne lister nedenfor er testgrunnlag for agenten og dokumenterte bevisgap; de er ikke en automatisk kø av oppgaver for Kenneth. Skill utviklerverifisering, brukerens faktiske TEST OK og udekket bevis. Ikke merk risikobilder, underskjema eller flerbruker som bruker-TEST OK uten en slik godkjenning. Neste utviklingspunkt er fortsatt påminnelser, deretter kildeoppdatering; det skal ikke blokkeres av flere like PDF-/ZIP-brukerprøver. Production-release, main/demo-merge og ekte e-post er fortsatt ikke godkjent.

### Skynettleserforsøk i denne runden

Fast Sandbox Preview på funksjonskode/head `b4986bcf72b19e2bdef471a907e5f5c4393b150a`. Sikker innlogging ga synlig innlogget demo@expo-proffdok.no, Expo Proffsenter og KS/HMS. Risikolisten var tom. Et nytt ulagret skjema viste bildefeltet; lokal tekst ble fylt med «TEST SKY 20261009 – risikobilde – ikke reell vurdering». Ingen Lagre/fullføring/publisering/filopplasting ble utført. Før neste handling avviste nettleserverktøyet styring: `retained_data_restricted`; forsøket på ny testfane ble avvist med `native credential state cannot be safely resumed`. Stoppet ved innloggings-/verktøygrensen. Dette er ikke bildeopplasting, readback, PDF-/ZIP- eller underskjemabevis. En lokal ulagret kladd kan stå igjen; kontroller/lukk den ved neste fungerende browserøkt. Ingen ny brukerprøve er gitt som erstatning for denne verktøyfeilen.

---

## TEST OK – SJA-bilder, 9. oktober 2026 kl. 15:01

Kenneth svarte «test ok» etter den avgrensede SJA-bildeprøven i samme Sandbox Preview. Godkjenningen gjelder ett testbilde i SJA-utkast med lagring/gjenåpning, egen og samlet PDF, og bilde/manifest.json i vedleggs-ZIP på head `65655dea4a220352075b3c50dd0530a53aab758f`. Dette er brukerens godkjenning, ikke en ny utviklerdrevet nettleserprøve. Ingen bestemt sak, enhet eller antall filer utover prøven er dokumentert.

Tidligere TEST OK **00:59 / 01:29 / 01:55 / 02:28** beholdes uten omtest. SJA-bildeprøven trenger ikke gjentas uten konkret feil eller relevant regresjon. Mobilkamera, flerbruker, faktiske private avviks-/prosjektkontroll-/legacyfiler, risikobilder, eldre prosjektavviksuttrekk og versjonerte underskjema beholder sine egne restprøver. Neste uavhengige utviklingspunkt er påminnelser, deretter kildeoppdatering. HR er ikke startet.

Denne registreringen endrer bare dokumentasjon på feature-branchen; PR #216 forblir draft. Ingen Production-release eller main/demo-merge er godkjent eller utført. KS/HMS-e-postutsending skal fortsatt være deaktivert. Eldre beskrivelser av «ikke TEST OK for SJA-bilder» nedenfor er historisk status før denne godkjenningen.

---

## Versjonerte underskjema – levert utviklerscope

Eksakt publisert child-versjon per rotpunkt, syklus-/tilgangskontroll og uforanderlig dependency-snapshot er implementert i feature/Sandbox. Prosjekt- og selvstendig gjennomføring bruker samme ferdig utflatede versjonssnapshot. Sandbox-migrasjoner `20261009040633` + `20261009041152`, 17 rollback-assertions, faktisk React og faktisk/visuell PDF PASS. `6faf58df` / tree `2e8562f5` er grønn full CI og READY Sandbox; innlogget read-only UI PASS. Bruker-TEST OK gjenstår; tidligere godkjenninger består. Neste uavhengige C-punkt er påminnelser, deretter kildeoppdatering. HR starter ikke nå. [Detaljer](CHECKLIST_SUBFORMS_20261009.md).

---

## Risikobilder – gjeldende avgrensede B/C-punkt

Inntil tre komprimerte bilder per fare er implementert i risikovurderingens versjonerte snapshot og koblet til egen PDF, prosjektrapport, samlet PDF og vedleggs-ZIP. Legacy uten bilder, ny vurdering uten bildearv, privat validator og eksisterende immutable fullføring beholdes. Faktisk React/PDF/ZIP, visuell kontroll og full Sandbox critical build er PASS. Privat migrasjon `20261009031544 kshms_risk_photos` er anvendt og funksjons-/ACL-prøvd i Sandbox. Funksjonshead `bcd0579cebdeaaaa4578abab14dc5522bf0abd88`, tree `03e3ecf71fcde6c43e714997f57a24f1f213f810`, grønn full CI og READY Sandbox Preview. Innlogget read-only UI-regresjon PASS uten dataendring. Leveransen er utviklerferdig, men ikke bruker-TEST OK. [Scope/QA](RISK_ATTACHMENTS_20261009.md).

Etter denne leveransen står faktiske innloggede filprøver igjen som bevis, ikke ny funksjonsimplementasjon. Neste uavhengige planpunkt er versjonerte underskjema, så påminnelser og kildeoppdatering. HR starter ikke i natt. Tidligere TEST OK beholdes; ny kort prøve gjelder bare risikobilder.

---

## SJA-bilder – gjeldende avgrensede B/C-punkt

Inntil tre komprimerte arbeidsstedsbilder er implementert i SJA-revisjonen og koblet til egen PDF, samlet PDF og vedleggs-ZIP. Eksisterende privat SJA-kontrakt, revisjonskontroll og signert-uforanderlighet beholdes; ingen ny Storage/tabell/RLS/policy. Faktiske React/PDF/ZIP-prøver, visuell kontroll og full Sandbox-build er PASS. Privat validator-migrasjon `20261009022028 kshms_sja_photos` er anvendt og funksjonsprøvd bare på Sandbox. Funksjonshead `785d01389d2059026711ea1a8af12762e75fc4b9` er publisert med grønn full CI og READY Sandbox Preview; innlogget read-only regresjonskontroll PASS. Leveransen er utviklerferdig, men ikke bruker-TEST OK.

Etter denne leveransen står risikovurderingsfiltilknytning og faktiske filprøver fortsatt som øvrig vedleggsdekning. Deretter: versjonerte underskjema, påminnelser og kildeoppdatering. HR starter ikke i natt. Tidligere TEST OK beholdes; ny kort prøve gjelder bare SJA-bilder. [Scope/QA](SJA_ATTACHMENTS_20261009.md).

---

## Publisert eldre prosjektavviksuttrekk – utviklerbevis 9. oktober 2026

Funksjonshead **37cd906b697763c4865650d9393a33d05fb78303**, tree **bf3c2e0ee256eb2cb9dddcc052b07aaf4490c8a2**, identisk med lokal testcommit 4316675cb99a3d1a004494eac2bb376df5c878c3. Alle 18 blobber opprettet/hashkontrollert og lest tilbake byte-/tekstidentisk; faktisk publisert git-commit rekonstruert og SHA-verifisert, 668 recursive tree-oppføringer kontrollert med korrekt tree og alle endrede filer. Lokal feature-head følger eksakt publisert kode. Publisert expected-head bd506a65 uten force; main fortsatt **155f6c4ac01f126c1db0c65da385cfd9305587d5**. Vercel READY **dpl_8kaLkrvrwtiBGmksLnSRLFaUGUmi**, riktig SHA/feature-ref/prosjekt/faste alias, EXPO_BACKEND_TARGET=sandbox direkte lest. PR Core Safety **37868239123**, jobb **113620009941** med full critical build: completed/success. Final lokal full Sandbox build, scope/docs-guard og diff-check PASS.

Innlogget fast Sandbox Preview, gjenbrukt demoøkten i én fane: hovedprosjektet viste **3 ukoblede eldre saker**, alle startet uten valg. Tre koblede saker ble utelatt. De tre valgte eksisterende sakene (to åpne, én lukket) ga faktisk nedlastet **5-siders PDF** med innhold/status/eldre lukking, forklaring om uversjonert lagret tilstand og manifest. Tekst-/sidekontroll PASS; alle fem sider rendret og visuelt kontrollert uten overlapp/klipp. Vedleggslisten viste 0 og sperret ZIP/bekreftelse. Fjerning av lukket sak ga 2 valg, tømte vedleggsliste og PDF-bekreftelse og sperret PDF. Deretter valg/omfang tømt; én fane, ingen popup eller sak-/database-/Storage-skriving. [Nettleserbevis](legacy-extract-proof.jpg).

Dette er **utviklerbevis, ikke Kenneths TEST OK** for ny legacy-del. Ny kort prøve står i USER_TEST.md. Tidligere TEST OK **00:59 / 01:29 / 01:55 / 02:28** beholdes. Ingen gamle godkjente deler skal prøves på nytt uten konkret feil/relevant regresjon. Faktisk lagret eldre avviksfil, private avviks-/prosjektkontrollfiler og mobil/flere brukere er fortsatt separate restprøver: eksisterende gamle testsaker hadde ingen photos. Lokal React/ZIP med syntetisk transport verifiserer 7 originaler og manifest/CRC32/SHA-256; dette er ikke faktisk innlogget filbevis. Øvrig vedleggsdekning/SJA-/risikofiltilknytning består før versjonerte underskjema, påminnelser og kildeoppdatering. HR starter ikke nå. KS/HMS enabled=false er direkte lest, ingen e-post/Production/main/demo-merge. Etterfølgende beviscommit har bare docs/skjermbilde og uendret funksjon.

---

## Eldre ukoblede prosjektavvik – avgrenset leveranse 9. oktober 2026

Miljømål **BEGGE**; bare feature/Sandbox-publisering. Verifisert start **bd506a652bd2b4d339b43946f80a121ecea294f9**, main **155f6c4ac01f126c1db0c65da385cfd9305587d5**, draft PR #216. Denne del-leveransen gjør eldre ukoblede prosjektavvik eksplisitt valgbare i Dokumentuttrekk: lagret innhold/bilder i PDF, originalfiler i separat bekreftet ZIP. Koblet KS/HMS-sak utelates. Eldre ansvar/lukking merkes som lagret tekst uten versjonert historikk eller KS/HMS-signatur; innholdets SHA-256 følger valget/manifestet.

Utviklerbevis: permanent tilgangs-/innholds-/fil-/avbruddsvern PASS; faktisk React/jsPDF gir 20-siders prøve-PDF og ZIP med 7 originaler, CRC32/SHA-256 verifisert. Alle 20 sider rendret, kontaktark og åpne/lukkede avvik visuelt kontrollert. Opprinnelige åtte-gruppe-prøver og kvalitet-/HMS-modus PASS (ZIP 5/9 originaler). Full critical Sandbox build PASS. Transport i disse lokale prøvene er syntetisk. Innlogget publisert prøve og eksakt publisert head/tree/CI/deploy er ført ovenfor. Vercels branch-binding er direkte kontrollert: EXPO_BACKEND_TARGET=sandbox. KS/HMS-worker enabled=false er direkte lest; utsending forblir deaktivert.

**Ny bruker-TEST OK foreligger ikke for eldre prosjektavvik.** Bevar Kenneths TEST OK 9. oktober Europe/Oslo: egen SJA-PDF 00:59, samlet PDF 01:29, ZIP med to bilder/manifest 01:55, kvalitet-/HMS-uttrekk 02:28 på f9e0f7b52a0573cf662fce07f8158c47576c8598 (funksjon 0e2de193164dad2342206cac1e2a7610f3c265d0). Ingen ny prøve av disse delene kreves uten konkret feil/relevant regresjon. Faktiske private avviks-/prosjektkontrollfiler, faktisk eldre prosjektavviksfil, mobil/flere brukere og øvrig vedleggsdekning består. Nye filtilknytninger på SJA/risiko er ikke levert. Fortsett øvrig vedleggsdekning før versjonerte underskjema, påminnelser og kildeoppdatering. HR starter ikke nå; kravene i HR_SCOPE_20261008.md beholdes.

Ingen migrasjon, backend-/database-/policyendring, saks-/Storage-skriving, signering/lukking, ekte e-post, Production-release eller main/demo-merge. [Eksakt scope, prøver og neste steg](LEGACY_ATTACHMENTS_20261009.md).

---

## TEST OK – kvalitets-/HMS-avvik, 9. oktober kl. 02:28

Kenneth ga **TEST OK 9. oktober 2026 kl. 02:28 Europe/Oslo** for den avgrensede kvalitets-/HMS-leveransen på publisert head **f9e0f7b52a0573cf662fce07f8158c47576c8598** (funksjonskode **0e2de193164dad2342206cac1e2a7610f3c265d0**). Godkjenningen gjelder den nye avviksdekningen i Dokumentuttrekk og den fremlagte korte brukerprøven. Utviklers innloggede bevis omfatter seks lagrede avvik, 23-siders PDF med begge kategorier/historikk/manifest, tom vedleggsliste med sperret ZIP og nullstilling ved fjerning. Bevishead f9e0f7b5 var READY **dpl_3DB6k8cwp3K1eBvzMcG8Ludc8JFk**, grønn Core Safety **37864641901** / full critical build **113608347101** completed/success.

Tidligere TEST OK **00:59 egen SJA-PDF / 01:29 samlet PDF / 01:55 ZIP med to bilder og manifest.json** beholdes. Denne nye godkjenningen er **ikke faktisk privatfilbevis**: Sandbox-avvikene har ingen private originaler/bilder. Faktisk private avviksfiler, private prosjektkontrollfiler, mobil/flere brukere og øvrige tidligere separate restprøver består. Den godkjente avviksprøven skal ikke gjentas uten konkret feil eller relevant regresjon. Ukoblede eldre prosjektavvik og andre filtilknytninger/full tilsynsdekning er fortsatt ufullført B/C-scope. Fortsett én avgrenset del av øvrig vedleggsdekning før versjonerte underskjema, påminnelser og kildeoppdatering; HR følger senere etter avklart HR_SCOPE_20261008.md.

Denne oppfølgingen endrer bare dokumentert godkjenningsstatus. Miljømål **BEGGE**, kun feature/Sandbox. Faktisk branch/main kontrollert før endring: f9e0f7b5 / **155f6c4ac01f126c1db0c65da385cfd9305587d5**, draft PR #216. Ingen app-/backend-/databaseendring, Production-release/main/demo-merge eller ekte e-post. KS/HMS-e-postutsending forblir deaktivert.

---

## Kvalitet-/HMS-avvik i dokument- og vedleggsuttrekk – 9. oktober 2026

Miljømål **BEGGE**, kun feature/Sandbox nå. Baseline `da2e5a79824c1358948ed535768b81277a2ecb41`, faktisk main `155f6c4ac01f126c1db0c65da385cfd9305587d5`, draft PR #216. Ny avgrenset del av øvrig vedleggsdekning: egen gruppe **Kvalitets- og HMS-avvik med historikk og bilder** i Dokumentuttrekk. Valgte lagrede KS/HMS-saker får full historikk/private bilder i PDF og private originaler i ZIP, med eksisterende bekreftelse/manifest/konsistens-/tilgangsvern. [Scope og QA](DEVIATION_ATTACHMENTS_20261009.md).

TEST OK for egen SJA-PDF **00:59**, samlet PDF **01:29** og ZIP med to bilder/manifest **01:55** 9. oktober beholdes som separate dokumenterte godkjenninger. De er ikke ny TEST OK for kvalitet/HMS. Innlogget Sandbox har fem HMS-saker/én kvalitetssak, ingen private avviksfiler. Ny faktisk privatfilprøve, mobil/flere brukere og tidligere separate restprøver er fortsatt åpne. Nye filtilknytninger på andre dokumenttyper og full legacy-/tilsynsdekning er ikke erklært ferdig. Øvrig vedleggsdekning følger før versjonerte underskjema, deretter påminnelser og kildeoppdatering før HR; HR_SCOPE_20261008.md beholdes. Ingen Production/main/demo-merge eller ekte e-post; Sandbox KS/HMS-enabled=false bekreftet direkte og beholdt.

---

## TEST OK – ZIP med to bilder og filoversikt, 9. oktober kl. 01:55

Kenneths TEST OK er presisert **9. oktober 2026 kl. 01:55 Europe/Oslo**: ZIP fra Voldsløkka-vernerunden er lastet ned og åpnet, med **to bilder i vedlegg og én JSON-fil**. Skjermbildet viser åpnet «KS-HMS vedlegg – test omfang», mappen «vedlegg» og «manifest.json». Dette bekrefter innlogget ZIP-nedlasting/innhold på publisert head **359dac0ed2df86ab43cb545ece6716161f9bdc87** (funksjon 42a38e91), etter PDF-/ZIP-avklaringen kl. 01:51–01:53. Tidligere TEST OK beholdes. Ingen ny mobil-, flerbruker-, privat RUH-original-/prosjektkontrollfil- eller Production-/merge-/e-postgodkjenning følger.

Brukerens «det var ikke selvsagt» følges opp med avgrenset tekst i Dokumentuttrekk og HJELP: PDF og ZIP har hver sin nedlasting; ZIP-knappen vises etter Vis vedleggslisten; manifest.json forklares som filoversikt som beholdes med vedleggene. Ingen handler, eksportformat, backend eller knappnavn endres. Miljømål BEGGE, først samme feature/Sandbox. Neste faglige B/C-punkt er fortsatt øvrig vedleggsdekning og versjonerte underskjema; deretter påminnelser/kildeoppdatering før HR. Gjenværende prøver videreføres uten å gjenta godkjent ZIP-nedlasting.

---

## Publisert ZIP-del – READY

Funksjonskode **42a38e91** / tree **96ed970e**, READY **dpl_HY7SG3fjVEMjYJtV4JR8nkYnMvKa**, Core Safety **37860831491** / full critical build **113595879925** success. Innlogget ZIP med to allerede lagrede Voldsløkka-bilder + manifest (381240 byte) PASS: CRC, JPEG-er, riktige dokument/revisjon/punkt og SHA-256 kontrollert. Bekreftelse, tomt omfang, nullstilling og RUH uten vedlegg PASS. Publisert HJELP kontrollert. Eksisterende samle-PDF med SJA/signatur og begge vernerundebilder fortsatt PASS (5 sider). Én fane, alle popup lukket, ingen lagrede data mutert. Eksakt bevis/handoff i CONTINUITY. ZIP-nedlasting/innhold TEST OK 9. oktober kl. 01:55. Private RUH-originaler/prosjektkontrollvedlegg innlogget, mobil/flere brukere gjenstår.

---

## Vedleggspakke – neste avgrensede B/C-leveranse

Kenneth ga **TEST OK 9. oktober 2026 kl. 01:29 Europe/Oslo** for samlet dokument-/tilsynsuttrekk på publisert head `c5e128c6fde2d0fb1368accb78a9414c05f0c81d`. HJELP, architecture og README var oppdatert ved godkjenningen. Tidligere TEST OK beholdes, inkludert egen SJA-PDF kl. 00:59. Dette er ingen Production-/merge-/e-postgodkjenning.

Ny levering: **Dokumentuttrekk → Vis vedleggslisten → Last ned vedlegg (ZIP)**. Valgte lagrede RUH-originaler, vernerunde-bilder og prosjektkontrollvedlegg med manifest, filstørrelser og SHA-256. Egen bekreftelse; endring av omfang/valg tømmer listen. ZIP-nedlasting/innhold TEST OK 9. oktober kl. 01:55. [Scope og QA](ATTACHMENT_ARCHIVE_20261009.md). Øvrig vedleggsdekning, versjonerte underskjema, påminnelser og kildeoppdatering følger før HR. Ingen ny backend eller sending.

---

## Samlet dokument-/tilsynsuttrekk – ny avgrenset B/C-leveranse

Miljømål **BEGGE**, publisering først på samme feature/Sandbox. Baseline `9ac259fa8027a3d88e57c5ab761d71fbeaef5cb7`, faktisk main `155f6c4ac01f126c1db0c65da385cfd9305587d5`; PR #216 open/draft. Tidligere TEST OK beholdes, også Kenneths SJA-PDF-prøve 9. oktober kl. 00:59.

Firmaadmin/KS/HMS-ansvarlig får **KS/HMS → Dokumentuttrekk**: beskriv omfang, hent listen, velg lagrede dokumenter og bekreft valget før **Last ned samlet PDF**. Åtte dokumentgrupper, full RUH-historikk/private bilder, felles rammer og manifest med dokument-ID, utgave/revisjon og sider. Ingen dokumenter velges automatisk. [Scope, testbevis og avgrensning](INSPECTION_EXTRACT_20261009.md). Funksjonskode **8d045d0c** er READY med grønn Core Safety/full critical build. Innlogget seksdokumenters PDF ga 12 sider med bevart SJA-signatur, begge RUH-hendelser, to vernerunde-bilder og manifest; uten rutine ga den 10 sider. Én fane, alle popup lukket; ingen lagrede saker endret. Eksakt bevis i CONTINUITY.

Neste ufullførte B/C-punkt etter denne leveransen er øvrig vedleggsdekning/versjonerte underskjema; deretter frist-/utløpspåminnelser og kildeoppdatering. Full tilsynsdekning, andre avvik enn RUH, separate originalfiler og framtidige HR-/opplæringsbevis er ikke levert gjennom denne PDF-en. Ingen databaseendring, Production/main/demo-merge eller ekte e-postsending; KS/HMS-utsending forblir deaktivert.

---

## Samlet status 8. oktober 2026 – les først

[OVERSIKT.md](OVERSIKT.md) er gjeldende samlet A–E-status og videre rekkefølge. A/A2 er levert i Preview, B langt på vei bygget, C delvis levert, individuell D og pilot E gjenstår. De opprinnelige gap-tabellene nedenfor er historikk; bruk dem som omfang, ikke som aktuell implementasjonsstatus. Kontroll-/risiko-PDF er nå implementert og utviklertestet med egen nedlasting og valgfritt prosjektvedlegg; ny brukerprøve står i USER_TEST.md. Publiseringsstatus står i CONTINUITY.md. Øvrige B/C-punkter følger før separat HR. Ingen Production-godkjenning følger dokumentgodkjenningen. E-post gjenbruker eksisterende Production-Resend; Sandbox KS/HMS-sending holdes deaktivert.

---

## Gjeldende utførelsesleveranse 8. oktober 2026

Rapportprøven er Kenneths TEST OK kl. 14:48. Vernerunder/selvstendige kontroller og 5×5-risikovurdering er gjenopptatt fra bevart arbeidsmappe, bygget og utviklertestet. 54 rollback SQL-kontroller og faktisk React-flyt PASS. Sluttkontroll/publiseringsbevis: EXECUTIONS_20261008.md. USER_TEST.md starter med bare den nye kontroll-/risikoprøven. Videre utførelse før separat HR, minimum før Ringside-pilot og ingen Production-release før egen godkjenning består. Eldre status nedenfor er historikk.

---

## SJA/RUH i prosjektrapporten – autorisert og bygget 8. oktober 2026

«Kjør» kl. 13:38 avklarer prioriteringen: valgfri prosjektrapportdel for SJA/RUH før videre utførelsesarbeid. Valgdialog, lesende uttrekk med nye kontroller, identiske rapportfelter, PDF/utskrift og norsk dato er bygget. 34 rollback SQL-kontroller og 5 faktiske PDF-/3 utskriftsprøver PASS. Lang PDF på 12 sider er kontrollert visuelt. Samme Preview er READY på funksjonskode f5c28dd3324a89ec0dd15b3f0c187d47e7bf1e9c; Core safety + critical build completed/success. Publiseringsbevis står i PROJECT_REPORT_20261008.md. Se PROJECT_REPORT_20261008.md og ny, kort brukerprøve i USER_TEST.md. Rapporttillegget er ikke Kenneths TEST OK eller Production-godkjenning ennå. Tidligere delprøver skal ikke gjentas.

Neste faglige omfang etter denne prøven er fortsatt utførelse med vernerunder/selvstendige kontroller og 5×5-risiko, før separat HR og deretter pilot etter minimumsomfang. Ingen ny beslutning om disse detaljene innføres her.

---

## Historikk før rapportleveransen

## SJA-utkast og RUH-oppfølging 8. oktober 2026 kl. 13:30 – TEST OK

Kenneth svarte «test ok» 8. oktober 2026 kl. 13:30 Europe/Oslo på prøven rett ovenfor i chatten: SJA-utkast med rutinenummer → Lagre utkast → lukk/gjenåpne fra samme prosjekt, og RUH → lagring med ansvarlig/frister → egne tiltak/egen kontroll/lukking → bortfalt ansvarligvarsel og bevart sak under Lukkede.

Disse prøvepunktene er ferdige. Ingen ny app-/databaseendring, produksjonsgodkjenning eller ny signerings-/mobilprøve følger registreringen. Kenneth spør om SJA/RUH kommer med i prosjektrapporten: PDF-koblingen mangler. Prosjekt-ID alene gir ikke rapportinkludering. En valgfri rapportdel for prosjektets SJA/RUH, med signatur/deltakere/rutineutgaver for SJA og status/tiltak/ansvarlig/lukking for RUH, foreslås som en egen avgrenset leveranse. Omfang, inkludering og prioritering er ikke besluttet av spørsmålet alene. Avtalt videre utførelsesarbeid med vernerunder/selvstendige kontroller og 5×5-risiko, deretter separat HR og Ringside-pilot etter minimumsomfang, består.

---

## Historikk – meny-/RUH-/datoretting 8. oktober 2026 – TEST OK

Skjermbildene viste at desktopadapteren utelot Avvik/SJA/RUH. Matcher og Åpne Avvik er rettet, KS/HMS viser Avvik/RUH, og avvik/RUH har norsk dato og Oslo-tid. Funksjonskode `4cebc9f8e7d115887a7ef4264c9f5390b3504265` READY/Core safety success. Full critical/build og faktisk DOM-/React-prøve PASS. Ingen SQL-mutasjoner eller produksjonsendringer i denne rettelsen. Kenneth bekreftet TEST OK 8. oktober 2026 kl. 01:28 Europe/Oslo for meny, RUH-inngang og norsk dato. Denne prøven er ferdig. Neste nødvendige brukerprøve er SJA/RUH-lagring, gjenåpning og egen lukking øverst i USER_TEST.md. Videre utførelses-/HR-scope og krav om separat Production-godkjenning består. Se NAV_RUH_DATE_20261008.md.

---

## SJA/RUH-oppfølging 8. oktober 2026 – READY på samme Preview

Kenneths prosjektvalg-/rutine-/fag-/RUH-scope ca. 00:24–00:32 er levert. Modulbrukerens Avvik/SJA/RUH har direkte Opprett SJA og Registrer RUH. Faktiske aktive tilgjengelige prosjekter og manuell ekstern referanse støttes. Godkjente firmarutiner har fast R-nummer, separat versjon og aktivt valgt referanse. SJA/RUH forklares; forslag omfatter mur/flis/tømrer/VVS. RUH bruker eksisterende ansvar, fast appvarsel, egne tiltak/lukking og historikk. 93 SQL-assertioner med rollback, faktiske React-handlerforløp og full critical/build PASS. Kode `694a4a9a114044ead724532c18133c28045c5863` READY/Core Safety success. Main/Production/demo urørt. Neste er den korte brukerprøven først i USER_TEST.md; ikke bygg delen på nytt. Vernerunder/5×5 risiko, vedlegg/PDF og separat HR består. Se SJA_RUH_PROJECT_20261008.md.

---

## SJA-oppfølging 8. oktober 2026 – levert på samme Preview

Kenneths nye scope er levert: samlet mangelliste/fokus ved signering, forslag i alle SJA-tekstfelt og prosjektinngang med faktisk prosjektkobling og dobbel tilgangskontroll. Full critical/build, begge React-scenarioer og 60 rollback SQL-kontroller PASS. Ingen SJA-TEST OK mottatt. Kort brukerprøve først i USER_TEST.md; testbevis i SJA_UX_PROJECT_20261008.md. Main/Production/demo er urørt. Vernerunder/5×5 risiko er videre utførelsesscope, vedlegg/PDF og separat HR består.

---

# KS/HMS – status, krav, gap og leveranseplan

**Start ved gjenopptakelse:** [CONTINUITY.md](CONTINUITY.md) samler gjeldende beslutninger, original-PDF-referanser, vedtatt kapittelinndeling og neste ufullførte oppgave. Eldre baseline/tabeller nedenfor må leses sammen med siste A2-status.

Kontrollert 2026-10-05. Miljømål: **BEGGE**. Dette er en integrert utvidelse av Expo ProffDok. Trinn A er et håndbokfundament i Preview/Sandbox, **ikke et komplett KS/HMS-system**. Alle trinn og temaer nedenfor gjelder fortsatt. Betaling/pris er uavklart og det innføres ingen betalingsintegrasjon.

## Faktisk baseline

| Kontroll | Observert tilstand |
|---|---|
| GitHub `main` | `155f6c4ac01f126c1db0c65da385cfd9305587d5`; siste dokumenterte release er firmakunder og mva., #214 |
| GitHub `demo` | `67f336f5a111ac6d997fa66c572e1b2e084390e8`; main → demo-dokumentasjonssynk |
| Åpne PR-er før arbeidet | Ingen ved GitHub-kontrollen |
| Vercel Production | `dpl_9wsjTrEVzvAF6jf7f9HgvzskYP5z`, READY, SHA samsvarer med main |
| Vercel demo | `dpl_DeBknL4yTBurUETHUHsYZbuft2ve`, READY, SHA samsvarer med demo |
| Supabase Production | `dqffxflaoyarbxyiyhop`, ACTIVE_HEALTHY; schema, funksjoner, tilgang og bucketmetadata lest, ingen endring utført |
| Supabase Sandbox | `ppvircenkjizeiqdxphj`, ACTIVE_HEALTHY; branchmetadata har eldre MIGRATIONS_FAILED, derfor ingen blind branchmerge |
| Isolasjon | Branch `feat-kshms-foundation`, eksplisitt `EXPO_BACKEND_TARGET=sandbox` for denne Preview-branchen; vanlige feature-previews kan ellers bruke Production |

Dette er API-/Git-/kodebevis for tilstand, ikke en full produksjonstest. Tidligere TEST OK gjelder ikke KS/HMS. GitHub/Vercel, eksisterende `CURRENT_RELEASE_STATUS.md`, instrukser, README og arkitektur er kontrollert uavhengig av eldre chatter.

## Kildedekning og forskjeller

[COVERAGE.md](COVERAGE.md), [coverage.csv](coverage.csv) og [coverage.json](coverage.json) registrerer 105 kvalitetsoppføringer, 88 personaloppføringer, 16 underliggende temaer og 4 metadatarader med PDF-side, målkapittel, relevans og håndtering. De 17 kvalitetsspesifikke oppføringene og dobbel beredskapsplan er bevart. VVS-innhold som gass, sprinkler, avløp og legionella beholdes som fag-/aktivitetsvalg for Ringside, ikke fjernet eller pålagt alle.

Begge PDF-er er lest fra vedleggene (148/127 sider). Alle sider er tekstuttrukket og gjennomgått for rutinetitler, underinstrukser, referanser og skjemaemner; organisasjonskart og innfelte beredskapsrutiner er visuelt kontrollert. Kildenes individuelle svar, gamle firmadetaljer, signaturer og systemspesifikke skjemaer importeres ikke. De er historiske dokumenter, med henvisninger og revisjoner fra tidligere år. Personlig bekreftelse i personalhåndboken er et annet dokumentasjonsformål enn en generell firmarutine.

Smittevernets fem temaer samles under biologisk risiko/beredskap, men deres opprinnelige ID-er beholdes. Pandemispesifikke karantene-/isolasjonsregler skal ikke automatisk videreføres. Tjenestemannsloven i gaverutinen, eldre verneombudsterskler, brede sertifikat-/samtykkepåstander, ansattes «eget ansvar» ved grøfteavvik og allmenne CSRD-påstander må korrigeres ved ny forfatting. Produktet får egne tekster og eget eksisterende ProffDok-design; ingen Dextro-tekst, bilder, skjema eller layout gjenbrukes.

## Kravkart og kildekontroll

Kildene er primært offentlige. **Kontrolldato for alle lenker nedenfor: 2026-10-05.** Kravnøklene brukes i dekningsoversikten. Veiledning skilles fra forskriftstekst. Den som skriver en spesialisert rutine må i tillegg kontrollere den konkrete bestemmelsen og gjeldende kontrakt før firmapublisering; en generell kildekategori er ikke full faglig validering av alle spesialtilfeller.

| Nøkkel / type | Kilde og relevant bestemmelse | Betydning for system og avgrensning |
|---|---|---|
| SAK / forskrift | [DiBK SAK10 §10-1](https://www.dibk.no/regelverk/sak/3/10/10-1/), [§10-2](https://www.dibk.no/regelverk/sak/3/10/10-2/), kap. 12–14 | Relevant for funksjon/ansvarsrett og eventuell sentral godkjenning. Tilpasset, dokumentert kvalitetssikring, kompetanse, kontroll av arbeid, UE/grensesnitt, avvik og jevnlig oppdatering. Innkjøpt eller egenutviklet er mulig; praksis og tilpasning er foretakets ansvar. Appen gir ingen myndighetsgodkjenning. |
| IK / forskrift | [Arbeidstilsynet internkontrollforskriften §§4–6](https://www.arbeidstilsynet.no/regelverk/forskrifter/internkontrollforskriften/) | Systematisk arbeid og medvirkning. Skriftlig dokumentasjon av mål, organisering, risiko/tiltak, avvik og oppfølging tilpasset art, størrelse og risiko. Ikke en plikt til alle bibliotekets skjemaer eller en bestemt 5×5-matrise. |
| AML / lov | [Arbeidsmiljøloven](https://www.arbeidstilsynet.no/regelverk/lover/arbeidsmiljoloven--aml/), særlig kap. 2 A, §§3-1, 3-2, 4-3, 4-6, kap. 6, 9, 10, 12, §14-5 | Opplæring og medvirkning er egne handlinger. Personalrutiner, varsling og tilrettelegging inngår. Psykososialt arbeidsmiljø må vurderes etter dagens regler. Ingen helseopplysninger i felles håndbok eller ordinær avviksrapport. |
| UTF / forskrift | [Forskrift om utførelse av arbeid](https://www.arbeidstilsynet.no/regelverk/forskrifter/forskrift-om-utforelse-av-arbeid/), kap. 2–4, 10, 17, 18, 21 | Aktivitetsbaserte instrukser om kjemikalier/støv/asbest, utstyr, høyde, trange rom og grøft. Krav til kvalifikasjon, sikring og tillatelse må vurderes konkret; valgte fag alene avgjør ikke risikoen. |
| SHA / forskrift | [Byggherreforskriften](https://www.arbeidstilsynet.no/regelverk/forskrifter/byggherreforskriften/) §§7–9, 15–19 | Byggherrens SHA-plan og arbeidsgivers eget HMS-system har forskjellige roller. Firmaet følger prosjektspesifikke tiltak og melder endringer; en intern SJA erstatter ikke SHA-planen. Oversiktslister/samordning beholdes som rutine selv om UE bruker eget system. |
| RISK / veiledning | [Arbeidstilsynet risikovurdering](https://www.arbeidstilsynet.no/hms/risikovurdering/) | Kartlegging, vurdering, tiltak og oppfølging. 5×5 og risiko før/etter er produktets anbefalte utgangspunkt, ikke en lovbestemt modell. |
| VO/BHT / forskrift og veiledning | [Verneombud](https://www.arbeidstilsynet.no/hms/roller-i-hms-arbeidet/verneombud/), [BHT](https://www.arbeidstilsynet.no/hms/roller-i-hms-arbeidet/bht/) | Kilde kontrollert på nytt 2026-10-06: verneombud kreves fra fem ansatte. Ved én til fire kan skriftlig alternativ avtales med arbeidstakerne; risiko kan likevel utløse krav. Arbeidstakerne velger verneombudet. Firmaets KS/HMS-koordinator er en annen rolle; arbeidsgiver beholder HMS-ansvaret. BHT-plikt vurderes mot risiko og gjeldende bransjeregler/næringskoder, ikke ved vilkårlig avkrysning. |
| FER / lov | [Ferieloven](https://www.arbeidstilsynet.no/regelverk/lover/ferieloven--feriel/) §§5–11, AML kap. 12 | Ferie og lovfestet permisjon skilles fra tariff, arbeidsavtale og firmaets velferds-/bonus-/gaveregler. HR-policy inngår; lønns- og timeadministrasjon bygges ikke. |
| PV / lov og veiledning | [Personopplysningsloven/GDPR](https://lovdata.no/lov/2018-06-15-38), [Datatilsynet arbeidsplassen](https://www.datatilsynet.no/personvern-pa-ulike-omrader/personvern-pa-arbeidsplassen/), [oppbevaring](https://www.datatilsynet.no/regelverk-og-verktoy/sporsmal-svar/arbeidsliv/hvor-lenge-kan-personopplysningene-lagres-hos-arbeidsgiveren/), [innsyn i e-post](https://www.datatilsynet.no/personvern-pa-ulike-omrader/personvern-pa-arbeidsplassen/innsyn-epost-filer/nar-er-innsyn-lovlig/) | Formål, behandlingsgrunnlag, dataminimering, informasjon, innsyn, retting, sletting og tjenstlig behov. Samtykke er ikke generell standard for arbeidsforhold. E-postinnsyn/kamera/GPS krever egen vurdering; ProffDok innfører ikke overvåking. |
| SDS / forskrift og veiledning | [Arbeidstilsynet stoffkartotek](https://www.arbeidstilsynet.no/risikofylt-arbeid/kjemikalier/stoffkartotek/), UTF kap. 2–3 | Oppdatert tilgjengelig informasjon, risikovurdering, opplæring, substitusjon og oppfølging. Opplasting alene er utilstrekkelig. Valgfri ProffDok-funksjon endrer ikke firmaets plikter. Eksternt kartotek kan lenkes. |
| TEK / forskrift | [DiBK TEK17 §13-15](https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/13/vi/13-15), kap. 9, 15 | Våtrom og relevante vann-/avløpskrav knyttes til valgt arbeid og prosjektgrunnlag. Fag-/produktkontroll må også følge valgt løsning/anvisning. Ikke kopier standarder med betalt opphavsrett. |
| MIL / offentlig kilde | [Miljødirektoratet avfallsdeklarering](https://www.miljodirektoratet.no/ansvarsomrader/avfall/for-naringsliv/avfallsdeklarering/), [TEK17 kap. 9](https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/9) | Avfalls-/miljøsaneringskrav vurderes for tiltak/avfallstype. Leverings-/deklarasjonsbevis dokumenteres. Transport/energi/innkjøpsmål er også firma- eller kontraktsvalg, ikke alle generelle lovkrav. |
| DSB / offentlig kilde | [DSB gass og brannfarlig væske](https://www.dsb.no/sikkerhverdag/gass-og-brannfarlig-vaske/) | Gass/brann/el/storulykke/strålevern beholdes i referansedekningen og vurderes av fagansvarlig ved relevant aktivitet. Høringsforslag er ikke gjeldende krav. Varme-arbeider-sertifikat kan følge forsikring/kontrakt og må merkes slik. |
| FHI / råd | [FHI luftveisinfeksjoner](https://www.fhi.no/sm/luftveisinfeksjoner/smittevernrad-ved-luftveisinfeksjoner/) | Dagens råd kontrolleres ved hendelse; historiske covid-regler publiseres ikke som gjeldende universelle plikter. Biologisk eksponering vurderes særskilt ved avløpsarbeid. |
| AAP / lov | [Åpenhetsloven](https://lovdata.no/lov/2021-06-18-99) §§2–7 | Gjelder virksomheter innen lovens virkeområde. Eget relevansvalg, ikke universell plikt. Kontraktskrav fra kunde kan være relevante også uten lovplikt. |

**Produktvalg:** systemadminaktivering; firmastyrte grant; firmagodkjenning; eksakte versjonsbekreftelser; signert revisjon minst årlig; ny bekreftelse ved vesentlig endring; én PL-signatur på SJA; foreslått 5×5; ingen offline i første leveranse. **Firma-/fag-/kontraktsvalg:** konkret frekvens for kontroll, interne mål, gave-/bonusregler, kundens krav, valgte normer, sertifikater og produsentanvisninger. Disse må merkes i rutinens referanser (`law`, `professional`, `company`, `product`).

## Gap mot kode og database

| Område | Faktisk støtte / evidens | Gjenbruk og nødvendig utvidelse |
|---|---|---|
| Sjekklister | `checklistTools.js`, `projectConfig.js`, main: grunn-/produkt-/Sopro-lister, fag og egne prosjektpunkter, avvik, kommentarer og bilder. Prosjekt som mal kan kopieres. | Behold eksisterende prosjekt- og garantikontroller. Generelt firmabibliotek, typede felt, malversjon og gjennomføring uten prosjekt mangler. Nye versjonstabeller begrunnes av dette gapet. |
| Signering/PDF | Overtagelse, garantier, tilbud og prosjekt/sluttrapport støttes i respektive moduler. | Gjenbruk rapportdesign, optimalisering og PDF-teknikk. Eksakte KS-rutineversjoner og uforanderlige signerte generiske gjennomføringer mangler. |
| Avvik | `deviationViewTools.js` henter prosjektets JSON og sjekklisteavvik. Kategorier, ansvarlig fritekst, frist, tiltak, foto, rapportvalg og lukking finnes. | Dette er en **prosjektavvikssentral**, ikke et serverstyrt firmaregister. Statusvalg kan også sette lukket. Én ny samlet readmodel/arbeidsflyt skal integrere legacy-kilder, ikke gi to konkurrerende sentraler. Kontrollert serverlukking, navngitt rettingsansvarlig/saksbehandler og full hendelseshistorikk mangler. |
| Firmatilgang | `sales_company_scopes`, memberships og aktiv arbeidsprofil; legacy `company_id` er ikke tilstrekkelig. `company_module_access` støtter nå bare butikktilbud. | Utvid samme entitlements med `kshms`; eget firmabundet medlemsgrant/ansvarsrolle er nødvendig. Ikke bruk legacy global modulgrant eller systemadminens supportbypass til å lese personaldata. |
| Varsler | E-post/chat og eksisterende mottakervalg finnes i prosjekt/salg; administrerte tilgangsendringer har events. | KS-bekreftelser, revisjon og utløp trenger egne dedupliserte hendelser/outbox, preferanser, påminnelses-UI og serverarbeider. Ikke send noe fra denne utviklingssesjonen. |
| Rutiner/HR/SJA/risiko/SDS | Ingen KS-rutine-, SJA-, risikomatrise- eller kompetansetabeller ved schema-kontroll. | Nytt avgrenset domene med private filer, versjoner og smale RPC-er. HR-policy kan ligge i håndbok; individuelle personalsaker får separat tilgang/domene. |
| Storage | Eksisterende `project-images` og `chat-images` er offentlige; private prosjektbuckets finnes. | Sensitive KS-/personalfiler må ikke lastes til offentlige buckets. Trinn A har ingen filopplasting. B/D bruker egne private buckets med samme firmagrense som databasen og kortvarig signert URL. |

## Struktur, oppstart og tilgang

Målkapitler: Virksomhet og kvalitetsledelse; Personal, kompetanse og arbeidsmiljø; Sikker utførelse og beredskap; Fag og kvalitet; Ytre miljø og bærekraft; Personvern og informasjonssikkerhet. Alle originale kapitler er kartlagt til disse. Firmaet kan flytte rutiner til egne kapittelnavn.

**Vedtatt kapittelinndeling 2026-10-07:** Kenneth har etter sammenligningen valgt ProffDoks seks inndelinger **som egne hovedkapitler**, jf. listen over. Begge original-PDF-ene og innholdsfortegnelsene er kontrollert på nytt: **01. Vår bedrift; 02. HMSK; 03. Rutiner; 04. Miljø; 05. Personvern** beholdes som kildestruktur i dekningsgrunnlaget. Originalenes kapittel-/temadekning skal være sporbar til de seks ProffDok-kapitlene. Rutinetekstene skal være selvstendig skrevet. Ingen omgruppering til fem kapitler er ønsket. Bevar stabile nøkler og firmaets egne kapittelvalg, godkjente utgaver og signaturer.

Oppstart begynner med firmaadminens valg av KS/HMS-ansvarlig blant aktive interne firmabrukere, inkludert egen firmaadmin. Ved lagring gis eventuell eksisterende responsible-tilgang før utpekingen lagres. Deretter velges flere fag (mur/flis, tømrer, maler og VVS), aktiviteter, funksjoner/ansvarsrett, ansvar og risiko. Felles kjernetema foreslås sammen med relevante aktiviteter. Firmaet vurderer relevans og fyller inn faktiske ansvar, lokalt utstyr, kontaktpunkter og prosjektgrensesnitt. Første standardutkast er selvstendig skrevet og merket som tilpasningsgrunnlag, aldri automatisk publisert. En blank mal, kopi og manuell oppdatering fra sentral versjon følger samme godkjenningsflyt.

| Rolle | Tilgang |
|---|---|
| Systemadmin | Aktivere/deaktivere modul for firma. Ingen automatisk tilgang til firmaets innhold eller personaldata. |
| Firmaadmin i aktiv medlemskapskontekst | Administrere ansattes modulgrant, oppstart, utkast, tildeling, publisering og arkivering. Kan utpekes selv som KS/HMS-ansvarlig uten ekstra grant; signering krever eksplisitt utpeking. |
| Dedikert KS/HMS-ansvarlig | Aktivt internt medlemskap + firmagrant `responsible`; utarbeide/redigere og godkjenne publisering, tildele rutiner og følge opp bekreftelser. Ingen administrasjon av ansattes tilgang, utpeking av revisjonsansvarlig eller arkivering. Den utpekte ansvarlige i oppstart signerer årlig revisjon. |
| Ansatt | Aktivt internt medlemskap + eget firmagrant. Lese tildelte publiserte versjoner og bekrefte selv. Ingen utkast eller andre ansattes bekreftelser. |
| HR-ansvarlig senere | Separat personaltillatelse og eksplisitt tjenstlig behov. KS-rolle gir ikke automatisk HR-innsyn. Medarbeider ser relevante egne opplysninger. |
| Kunde/UE/innleid | Ingen ny modul-/SJA-tilgang. Melder i eget system; firmaets samordnings-/oppfølgingsrutiner gjelder fortsatt. Rapportmottaker får bare et konkret godkjent utdrag. |

Trinn A bruker eksisterende firmaskope og authklient. Tabeller har RLS og ingen direkte `anon`/`authenticated`-privilegier. Smale RPC-er kontrollerer godkjent aktiv profil, internt medlemskap, aktivt firma, modulgrant og riktig rolle ved hvert kall. Alle mutasjoner får forventet firma; utkast og oppstart har revisjonskontroll mot samtidige endringer. Publisert innhold, ansattbekreftelse, revisjonssnapshot og audit er uforanderlige. Gjenpublisering av samme arbeidsfirma beholder montert arbeidsflate, etter eksisterende Sales-prinsipp. Reelt arbeidsprofilbytte/tilbakekalt tilgang skjuler konteksten og avviser gamle skrivekall.

## Datamodell og oppbevaring

Implementert i A: `company_module_access.kshms`; `kshms_member_access`; `kshms_settings`; `kshms_routines` (redigerbart utkast); `kshms_versions` (uforanderlig innhold/hash/kilder/versjon/godkjenner/tid); `kshms_assignments`; `kshms_acknowledgments` (egen auth-identitet, tidspunkt, versjon og forklarende tekst); `kshms_reviews` (eksakte publiserte versjoner, funn, oppfølging, signaturidentitet/tid); `kshms_audit` (minimal hendelsesmetadata). Historiske versjoner holdes adskilt fra arkivering av rutine og oppdatering av utkast.

Planlagt B: template → template_version → execution → immutable signed_snapshot. Execution har valgfri `project_id` og alltid `company_scope_id`. SJA/risk bruker samme arbeids-/vedlegg-/signeringsprimitiver, med typede spesialfelt. Avvik har firmaskope, valgfritt prosjekt, kildeeksekusjon/felt/versjon, identifiserte ansvarlige, frist, tiltak og kontrollhendelser. Legacy-prosjektavvik kobles med stabil kilde-ID og revisjonsnummer; én synlig sentral aggregerer begge under migreringsperioden.

Planlagt C: notification/outbox med deduplisering per mottaker/hendelse/versjon, samt export snapshots som ikke refererer til levende redigerbart innhold. Planlagt D: kompetanse-/utløpsposter, medarbeidersamtale og oppfølging, egen HR-ACL, SDS-versjoner og lenker til jobb/prosjekt/SJA.

Personvern vurderes **før HR-tabeller bygges**: HR er valgfritt per medarbeider; ingen fødselsnummer, diagnose, fagforening eller generisk helsefelt i første modell. Kompetanse har kurs/type/utsteder/utløp og nødvendig bevis, ikke full personalmappe. Medarbeidersamtale begrenses til jobbrelaterte mål, avtalt oppfølging og historikk med særskilt tilgang. Sensitive varslingssaker skal ha egen fortrolig kanal, ikke ordinær RUH.

Firmaet dokumenterer formål, behandlingsgrunnlag, informasjon, mottakere, innsyns-/rettingsflyt og bevaringsgrunnlag per dokumenttype. Ingen universell oppbevaringsfrist innføres. Personopplysninger vurderes ved fratredelse, årlig gjennomgang og avsluttet formål; beholdning må begrunnes, retting legges som sporbar supplering, sletting/anonymisering utføres kontrollert etter bevaringsvurdering. Historikk er ikke hjemmel for evig lagring. Lovbestemte eksponeringsregistre og SHA-/regnskapsdokumenter kan ha særregler og blandes ikke med vanlige HR-notater. A lagrer bare minimal identitet og gjennomgangsbevis; det er ingen individuell HR-funksjon. Inn-/utlevering og sletteservice er fortsatt leveransekrav før produksjonsklar full modul.

## Leveransetrinn og akseptanse

Minimumsfelter i de kommende utførelsesdelene beholdes eksplisitt:

| Del | Fast minimumsdekning |
|---|---|
| SJA | Arbeidsoppgave, farer og konsekvenser, tiltak, verneutstyr, arbeidsutstyr, førstehjelp og deltakere; ansvarlig prosjektleder/signatur; dokumentert medvirkning uten automatisk individuelle signaturkrav. |
| Risikoanalyse | Anbefalt 5×5, sannsynlighet/konsekvens og risiko før og etter tiltak, tiltaksansvarlig, frist og oppfølging. Vurderingsgrunnlag og valgt akseptnivå dokumenteres av firmaet. |
| Avvik/RUH | Hendelse, kategori, årsak, strakstiltak, forbedringstiltak, rettingsansvarlig, saksbehandler, frist, bilder/vedlegg, oppfølging, kontrollert lukking og hendelseshistorikk; firma/prosjekt og kildelenke fra sjekkliste. |
| Personal/kompetanse | Valgfritt per medarbeider: kompetansebevis, kurs, sertifikater, utløpsvarsler; medarbeidersamtalemal, historikk og oppfølging; særskilt innsyn/oppbevaring/sletting. |
| Stoffkartotek | Valgfritt i ProffDok, sikkerhetsdatablad/informasjonsblad, versjons-/oppdateringsansvar, lett tilgjengelig arbeidsinformasjon og koblinger til arbeid/prosjekt/SJA, samt risikovurdering og opplæring. |
| Rapporter | PDF av rutine, sjekkliste, SJA, risikoanalyse og avvik; eksplisitt valgfritt sluttrapportvalg. Individuelle personaldokumenter følger ikke sluttrapporten som standard. |

| Trinn | Leveranse | Ferdigkriterium og gjenstående avgrensning |
|---|---|---|
| A, denne PR | Sikret aktivering/firmatilgang, flerfaglig oppstart, selvstendige første rutineutkast/blank/kopi, kapitler, draft/publish/archive/history, eksakt versjonstildeling/egen bekreftelse, søkbar Min personalhåndbok, kompakt oppfølging og signert årlig revisjon. Påkrevd egen gjennomgang kan bekreftes samtidig med publisering eller etterpå i Les og bekreft før arbeid. Sentrale oppdateringer kan vurderes som manuell ny kladd uten overskriving. | Firmaskille og rolle-/modulavslag, stale revisjon, immutable versjoner, nye bekreftelser, egen personalvisning, serveravledet identitet, samlet eksplisitt publisering/egen bekreftelse, revisjonssnapshot og eksisterende kritiske flyter testet. Ikke alle 105 kildetema er ferdig skrevet. E-post/påminnelser og PDF kommer i C. |
| A2, neste innholdsleveranse | Fullstendig, selvstendig rutinebibliotek fra begge PDF-ers samlede temaer, inkludert alle HR-/personalkapitler og VVS-aktiviteter. Hvert tema beholder kilde-ID/sider, ny rutine eller synlig begrunnet samling/historisk håndtering, relevante offentlige kilder, kontrollert dato, kravtype og relevansvalg. | [CONTENT_STATUS.md](CONTENT_STATUS.md) viser alle 125 referanserader og dagens begrensede tekstutvalg. For hver av de 105 hovedoppføringene og 16 undertemaene må det foreligge ferdig forfattet og faglig kontrollert tekst/håndtering før innholdsleveransen regnes ferdig. De fire metadataradene er referansemetadata, ikke ansattrutiner. Ingen generiske tekstforslag teller som ferdig tematisk dekning. Innhold prioriteres før supportmodus og bred utrulling; nødvendige gjennomføringsverktøy følger fortsatt B–D. |
| B | Firmabibliotek og gjennomføringer med/uten prosjekt; OK/avvik/ikke aktuelt, tekst/tall/dato/bilde/fil/signatur; mobile SJA; 5×5 risiko; samlet avvik/RUH og kontrollert lukking. Fag-/aktivitetstema fra A2 kobles til dokumentert utførelse. | Historiske/signerte gjennomføringer endres ikke med mal. Avvik fra svar opprettes idempotent med kildekobling. SJA signeres av ansvarlig PL; deltakerliste + dokumentert gjennomgang/medvirkning (navn/rolle/tid/metode/notat) uten automatisk krav om hver persons signatur. |
| C | App- og e-postvarsler, påminnelser, kildeoppdateringsforslag, PDF rutine/sjekkliste/SJA/risiko/avvik, godkjent begrenset avviksrapport og valgfritt sluttrapportvalg. | Ingen intern personalinfo/hele avviksregister automatisk delt. Mottaker, felt og vedlegg forhåndsvises. Faktisk sending krever konkret handling. E-post jobber med deduplisering og retry; utilsiktede gjentatte varsler testes. |
| D | Valgfri kompetanse/utløpsvarsler, medarbeidersamtalemal/historikk/tiltak, særskilt HR-innsyn/retensjon/sletting; valgfritt stoffkartotek og jobblenker. | Tjenstlig tilgang på database/storage, egne opplysninger/innsyn, bevaringsregler og sletting testet. SDS-opplæring/tilgjengelighet/substitusjonsvurdering inngår; opplasting alene fremstilles ikke som oppfylt krav. |
| E | Pilot Ringside, full tematisk og funksjonell dekningskontroll, hjelp/PDF/regresjon, drifts-/kilderevisjon, kapasitet og produksjonsgodkjenning per releasetrinn. Deretter avgrenset supportmodus. | Ingen delvis leveranse kalles komplett. QA inkluderer firma, aktivering, personal, signering/versjoner, kontrollert lukking og eldre tilbud/prosjektsjekklister. Brukerens nye TEST OK før merge, deretter Production-verifisering og kontrollert main → demo. |

Betingede svarhandlinger i første **utførelsesleveranse B**: kommentar- og bildekrav, kildekoblet avvik og signaturkrav. De dekker dokumentasjon/ansvar uten skjult forgrening. Underskjema krever separat versjonert mal, syklus-/rettighetskontroll og immutable dependency snapshot; leveres senere i B før utførelsesdelen regnes ferdig, med eksplisitt UI og tester. Ingen betinget handling omskriver allerede signerte data.

Tre arbeidsflyter: (1) firma etablerer/tilpasser → firmaadmin/KS-HMS-ansvarlig publiserer → ansatte gjennomgår/bekrefter; (2) ansatt utfører sjekkliste/SJA → dokumenterer → ansvarlig signerer; (3) avvik → ansvarlig/frist → tiltak → kontrollert lukking → eventuelt konkret rapportutdrag. Bare (1) har første implementasjon i A. Gjennomførings- og avviksdelene erstattes ikke av håndbokrutiner.

Ordre, timer, materiell og ressursplanlegging bygges ikke. Tilsvarende rutinetema beholdes med kobling til firmaets andre systemer. Online mobil er tilstrekkelig; offline er ikke krav i første leveranse. Pris/fakturering avventer et reelt senere produktvalg.

Rollebeslutning 2026-10-06: Produkteier har endret det første kravet om firmaadmin som eneste publiserer. Både firmaadmin og ansatte med aktiv KS/HMS-ansvarlig-tilgang kan nå godkjenne rutiner. Ansattes modultilgang, valg av revisjonsansvarlig og arkivering er fortsatt firmaadminoppgaver. Årlig revisjon signeres fortsatt bare av den eksplisitt utpekte ansvarlige. Ansatte starter i Les og bekreft og ser bare egne tildelte utgaver og egne bekreftelser.

UX-presisering 2026-10-06: Håndboken viser faktisk godkjent-antall, neste handling og egne utkast adskilt fra forslag. «Håndboken er klar» gjelder kun godkjenningsstatus for firmaets valgte rutiner, ikke et komplett KS/HMS-system eller rettslig godkjenning. Først etter godkjenning følger ansattes gjennomgang; dette erstatter ikke opplæring og faktisk etterlevelse. Redigering krever ny vurdering og godkjenning av lagret innhold. Revideringsforslagets ansvarstekst har source_revision 2 i tråd med vedtatt rollefordeling; firmaets eksisterende kladder/versjoner overskrives ikke.

## Presiseringer fra pilottesten (2026-10-06)

**Min personalhåndbok, implementert i A:** Alle med modulrettighet, også firmaadmin, har et søkbart oppslagsverk over egne tildelte publiserte utgaver. Bekreftelse fjerner ikke rutinen fra oppslagsverket. Tidligere tildelte utgaver og deres eksakte bekreftelser beholdes. Hver utgave viser faktisk firmagodkjenner og egen gjennomgang med person/tidspunkt. Egen gjennomgang er påkrevd før arbeid etter firmaets regel, også for firmaadmin og KS/HMS-ansvarlig. Vedkommende kan uttrykkelig bekrefte den samtidig med publisering, eller gjøre den etterpå i Les og bekreft; serveren lagrer begge handlinger samlet for samme nye utgave og egen auth-identitet. Å lage/godkjenne håndboken gir ikke automatisk fritak eller en oppdiktet bekreftelse. Andre ansatte bekrefter selv, og gamle godkjenninger endres ikke. Felles HR-rutiner forfattes videre i A2 og kan slås opp her. Individuelle medarbeidersamtaler, kursbevis og oppfølging er fortsatt D med egen HR-tilgang, innsyn og bevaringsregler; en KS-/adminrolle gir ikke automatisk innsyn i andres personalmappe.

**Tekst og søk, implementert i A:** Tomme oppstartsfelt får redigerbare forslag etter serverlesing. Flere valgte fag inngår i forslaget; bare felt som fortsatt er urørte forslag følger nye fagvalg. Meningsfull firmatekst overskrives ikke. Ingen automatisk lagring. Egen rutine kan begynne med et generelt tekstforslag eller fortsatt en helt blank mal. Skrivehjelp og rutinespesifikke tilpasningstips ligger utenfor innholdet som lagres/publiseres. Godkjent fremgangsmåte vises under «I vår bedrift har vi følgende rutine»; biblioteket og godkjenningsutkast merkes som forslag. Fire sentrale tekster har fått nye forslag uten innebygde «fyll inn»-tips, med source_revision 2 og eksplisitt manuell vurdering. Eksisterende firmautgaver beholdes. Søk finnes i firmaets rutiner, forslag og ansattens egne tildelte utgaver; det gir ikke mer tilgang enn serverstate. Hendelser om andre ansattes tilgang bevarer arbeidsflaten; egen/uavgrenset tilgangsendring og reelt firmabytte kontrolleres fortsatt med fail-closed/racevern.

**Avvik og oppgaver, obligatorisk i B/C:** Én samlet sentral viser åpne og lukkede saker med kategori kvalitet, HMS eller RUH, firma/prosjekt, ansvarlig, frist og status. Filter/søk skal finne saker på tvers av firmaets tillatte prosjekter. Ikke bygg en ekstra konkurrerende avviksliste. Rettingsansvarlig og saksbehandler velges blant aktive, godkjente interne brukere i riktig firma med nødvendig modultilgang; fritekst erstatter ikke bruker-ID. UE/innleid får ingen ny tilgang. Gjeldende brukeravklaring erstatter tidligere krav om en annen kontrollør: valgt ansvarlig dokumenterer tiltak, kontrollerer resultatet selv og lukker saken. Serveren avviser lukking av andre, også firmaadmin. Trond velger Eli; Eli får oppgaven og lukker selv. Hvem som rettet/kontrollerte/lukket og tidspunkt/vedlegg registreres, også ved gjenåpning og omfordeling. En frist eller e-post gir ikke automatisk lukking.

Ny tildeling gir en deduplisert e-post og et varig appvarsel. Ved innlogging skal brukeren se «Du har avvik som må behandles», ansvar/frist og direkte lenke til egne åpne saker. Å lese varselet fjerner ikke oppgaven fra «Mine åpne avvik». Fristpåminnelser har styrt frekvens, ikke én utsending per innlogging. Firmaaktivering, aktivt medlemskap og mottakerens grant kontrolleres ved opprettelse, workerens utsending og åpning av lenken. Deaktivert modul stopper tilgang og nye leveranser/påminnelser, men sletter ikke historikk; reaktivering skal ikke sende hele gammel kø på nytt. E-post inneholder bare nødvendig, ufølsom oppgaveinformasjon og en innloggingsbeskyttet lenke. Test omfordeling, deaktivering mellom kølegging/utsending, gjentatt retry og lukking før utsending. Automatiske oppgavevarsler avklares som produktfunksjon; ekstern rapportdeling har fortsatt konkret mottaker-/felt-/vedleggsgodkjenning og eksplisitt sendehandling. Ingen e-post er sendt i utviklingen.

**Tilsynsgrunnlag i C/E:** Arbeidstilsynets [internkontrollforskrift §§4–5](https://www.arbeidstilsynet.no/regelverk/forskrifter/internkontrollforskriften/) krever relevant tilpasning, medvirkning og dokumentasjon av mål, organisering, risikovurdering/tiltak, avviksrutiner og systematisk oppfølging. DiBK [SAK10 §10-1](https://www.dibk.no/regelverk/sak/3/10/10-1/) og [§10-2](https://www.dibk.no/regelverk/sak/3/10/10-2/) knytter rutiner og dokumentert praksis til foretakets ansvarsområde i byggesaken. [Oslo PBE byggetilsyn](https://www.oslo.kommune.no/plan-bygg-og-eiendom/klage/byggetilsyn) gjelder oppfølging av byggetillatelse/lovverk. Kilder kontrollert 2026-10-06; en ferdig håndbok alene er ikke bevis på faktisk utførelse eller godkjent tilsyn.

Gjenbruk rapport-/PDF-grunnlaget til et avgrenset tilsynsuttrekk med firma, dato/omfang, fag/ansvar, publiserte rutineversjoner/godkjenninger/kildekontroll, dokumentert opplæring, relevante risiko-/SJA-/kontrollgjennomføringer, tiltak/lukking og signerte revisjonssnapshot. Hvert utsnitt har manifest med eksakte poster/versjoner; intern skrivehjelp og ulagrede/ikke-godkjente forslag inngår ikke. Personaldokumenter og fortrolige varslinger utleveres ikke automatisk. Revisjonshistorikk finnes allerede i A; operativ avvikshistorikk og samlet rapportgrunnlag gjenstår. Før E testes en faktisk eksport som kan spores tilbake til kildene og som viser dokumentasjon av etterlevelse. Produktet lover ingen automatisk myndighetsgodkjenning.

**Supportmodus etter full pilot:** Gjenbruk eksisterende arbeidsprofil/supportpresentasjon, med en egen serververifisert, firmagodkjent, tidsbegrenset støttesesjon. Firma og «Supportmodus» vises tydelig; start/stopp, støtteaktør og hver endring logges. Firmaet kan tilbakekalle sesjonen. Systemadmin kan hjelpe med oppsett og utkast innen avtalt scope; produktets aktiveringsrett gir ikke automatisk innholds- eller HR-innsyn. Firmaadmin/KS/HMS-ansvarlig godkjenner med sin egen identitet, og den utpekte ansvarlige/ansatte signerer selv. Ingen impersonering, signering på vegne av andre eller generell RLS-bypass. HR-tilgang krever separat vurdering og inngår ikke som standard. Test avslag ved manglende samtykke/scope, utløp, revokering og feil firma før dette leveres.

**100 firmaer:** Supabase/Postgres er et egnet teknisk utgangspunkt; dette er en arkitekturvurdering, ikke en utført kapasitetsprøve. [CAPACITY.md](CAPACITY.md) registrerer dagens faktiske metadata, gap i samlet state-lesing, anbefalt indeksering/paginering/private filer, jobbkø og konkrete målinger før større utrulling. Ingen abonnement, compute, betalingsintegrasjon eller Production-konfigurasjon endres i denne leveransen.

## Gjeldende A2-status etter gjenoppretting

A2 oppdatert 6. oktober 2026: Biblioteket har 73 egne forslag med sporbar dekning av alle 121 innholdstemaer + fire metadatarader fra kvalitetshåndboken (148 sider) og personalhåndboken (127 sider). Avvikssentral gir ansvarlig/frister, åpne/lukkede saker, tiltak/egen kontroll, private vedlegg og hendelseshistorikk. Bare valgt ansvarlig får fast varsel i interne faner og lukker selv. Prosjekt-/sjekkpunktavvik som kobles inn har serverbeskyttet status; ukoblet legacy-flyt består. 73 Sandbox-kontroller PASS med rollback; ingen ekte e-post eller produksjonsendring. Full-app-brukerprøve og e-postmottak gjenstår. Sandbox mangler RESEND_API_KEY og CHAT_FROM_EMAIL; utsending er derfor deaktivert. Gammel TEST OK for 6dfb74d dekker håndbokversjonen, ikke A2.

A2-tekstdekningen er implementert og operativt tematisk skrevet. Firmatilpasning/godkjenning og spesialisert fagvurdering gjenstår før bruk. Innholdsstatus og gjennomføringsverktøy skilles. Eldre trinn-/gap-tabeller over er historisk baseline; full minsteleveranse for SJA, utførelse, rapport/PDF, individuell HR, stoffkartotek og support består. Tildelings-e-post er implementert med sikker kø/retry; fristpåminnelser og rapporter er fortsatt C. Se QA, USER_TEST og EMAIL_SETUP.


## Avgrenset B-leveranse – Sjekklistesentral, 7. oktober 2026

Fagspesifikke firmamaler, utkast/publisering, faste utgaver og innhenting under Sjekklister i generell ordre og Fag/utstyr i våtromsprosjekt er implementert for Preview. Ved aktivert firmamodul kan interne prosjektbrukere hente publiserte lister uten personlig KS/HMS-grant. Firmaadmin og KS/HMS-ansvarlig bygger og publiserer. Eksisterende ukoblede avvik og utfylling videreføres. 27 Sandbox-kontroller og kort faktisk React-flyt PASS. Ny brukerprøve gjenstår; denne delprøven erstatter ikke resterende B–E eller Production-godkjenning. Se CHECKLIST_CENTRAL_20261007.md.


## Avklart og delvis levert 07.10.2026

Kenneth 23:02: begge delprøver (meny/sjekklistepopup) TEST OK. Fullfør utførelsesdelen før HR. Bygg avtalt minimum først; Ringside tester etterpå. Ingen tidlig begrenset pilot. Ved individuell HR får ledere bare tildelte medarbeidere, firmaadmin ser/behandler alle og tildeler ansvar; KS-rollen gir ikke slik tilgang automatisk.

SJA starter tom for hver jobb med hjelpetekst over feltene og eksplisitt valgbare forslag. Egen PL-signatur og dokumentert medvirkning består. Den avgrensede SJA-form-/utkast-/signaturleveransen er bygget og utviklerverifisert i Sandbox, med egen brukerprøve etter READY-publisering. Se SJA_20261007.md. Det betyr ikke at hele B er ferdig: vernerunder, selvstendige sjekklistegjennomføringer, 5×5 risiko, vedlegg/PDF og øvrige C–E-krav gjenstår. Historisk opprinnelig gap-tabell ovenfor beskriver tilstanden før implementering.
