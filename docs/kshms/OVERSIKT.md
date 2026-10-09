## Risikobilder – avgrenset vedleggsleveranse 9. oktober 2026

Inntil tre komprimerte bilder per fare er implementert i samme private, revisjonerte risikovurderingssnapshot. Bildene følger egen PDF, valgt prosjektrapport, samlet Dokumentuttrekk og bekreftet ZIP/manifest. Gamle vurderinger uten bilder virker som før; ny vurdering med samme farer arver ikke bilder. Ingen ny Storage/tabell/RLS/policy. Faktisk React, tre PDF-flyter, visuell kontroll, ZIP og full Sandbox critical build er PASS. Privat migrasjon `20261009031544 kshms_risk_photos` er anvendt og direkte funksjons-/ACL-prøvd på Sandbox; mailer er fortsatt `enabled=false`. Featurepublisering føres når verifisert. [Scope og QA](RISK_ATTACHMENTS_20261009.md).

Dette er ikke ny bruker-TEST OK. TEST OK 00:59 / 01:29 / 01:55 / 02:28 beholdes. Faktisk innlogget risiko- og SJA-bilde/kamera, faktiske private filer, mobil/flere brukere og øvrig dokumentert vedleggsbevis gjenstår. Neste uavhengige punkt er versjonerte underskjema, deretter påminnelser og kildeoppdatering. HR starter ikke i natt. Ingen e-post eller Production/main/demo-merge.

---

## SJA-bilder – avgrenset vedleggsleveranse 9. oktober 2026

Miljømål **BEGGE**; bare feature/Sandbox publiseres. Kontrollert start-head `7a68293c8ad3aae4191a1e766b1dbf278ab54eef`, main `155f6c4ac01f126c1db0c65da385cfd9305587d5`, draft PR #216. SJA-utkast kan få inntil tre komprimerte bilder fra arbeidsstedet. Bildene lagres i samme revisjonssnapshot som teksten og følger egen SJA-PDF, valgt SJA i samlet PDF og bekreftet vedleggs-ZIP med egne JPG-filer/SHA-256-manifest. Gamle SJA-er forblir gyldige uten bilder.

Avgrensningen bruker eksisterende private SJA-JSON/RPC og signert-uforanderlighet. Én privat validator-migrering; ingen ny tabell, Storage-bucket, RLS eller policy. Faktisk React-opplasting, tre SJA-PDF-er, 15-siders åtte-type samle-PDF, ZIP med seks filer, visuell PDF-kontroll og full Sandbox-build PASS. Migrasjon `20261009022028 kshms_sja_photos` er anvendt og positivt/negativt prøvd bare på `demo-sandbox`. Funksjonshead **785d01389d2059026711ea1a8af12762e75fc4b9**, tree **cd5257609f1a3e2c375b9faf7d9146bc561ed429**, Core Safety **37874352426** / jobb **113639379783** success, Vercel **dpl_Dd3VioNsdD4idRkMGodqfpTamDqG** READY på fast feature-alias og Sandbox-env. Innlogget eksisterende signert SJA åpnes uendret/read-only med ny bildeseksjon; ingen data skrevet. [Scope og QA](SJA_ATTACHMENTS_20261009.md).

Tidligere TEST OK 9. oktober **00:59 / 01:29 / 01:55 / 02:28** beholdes. Dette er ikke ny TEST OK for SJA-bilder. Faktisk innlogget bilde/kamera, risikovurderingsfiltilknytning, faktiske private avviks-/prosjektkontroll-/legacyfiler, mobil og flere brukere gjenstår. Deretter følger versjonerte underskjema, påminnelser og kildeoppdatering. HR starter ikke i natt. Ingen e-post, Production/main/demo-merge eller branchsletting.

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

## Kvalitet-/HMS-uttrekk: READY og grønn full critical build

Funksjonshead **0e2de193164dad2342206cac1e2a7610f3c265d0** er READY/grønn Core Safety. Innlogget utviklerprøve lastet ned seks lagrede kvalitets-/HMS-saker på 23 sider med historikk/manifest; tom privat vedleggsliste sperret ZIP, endret utvalg nullstilte bekreftelsen. Eksakt head/tree/deploy/CI og [nettleserbevis](deviation-extract-proof.jpg) er ført i CONTINUITY/QA. Tidligere TEST OK **00:59 / 01:29 / 01:55** beholdes. Ny avviks-TEST OK, faktisk private avviksfiler, mobil/flere brukere og øvrig vedleggsdekning gjenstår. KS/HMS-e-post deaktivert; ingen Production/main/demo-merge. Én avgrenset leveranse, ingen underskjema/HR i denne runden.

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

# KS/HMS – gjeldende planstatus

Oppdatert 9. oktober 2026 etter innlogget prøve av samlet uttrekk, Europe/Oslo. Dette er samlet gjeldende status. PLAN.md inneholder hele omfanget og historiske gap; CONTINUITY.md inneholder overlevering og testbevis. Historiske «gjenstår»-tekster der må ikke overstyre denne oversikten.

## Nyeste forbedring

**Samlet dokument-/tilsynsuttrekk – ny avgrenset B/C-leveranse**

Miljømål **BEGGE**, publisering først på samme feature/Sandbox. Baseline `9ac259fa8027a3d88e57c5ab761d71fbeaef5cb7`, faktisk main `155f6c4ac01f126c1db0c65da385cfd9305587d5`; PR #216 open/draft. Tidligere TEST OK beholdes, også Kenneths SJA-PDF-prøve 9. oktober kl. 00:59.

Firmaadmin/KS/HMS-ansvarlig får **KS/HMS → Dokumentuttrekk**: beskriv omfang, hent listen, velg lagrede dokumenter og bekreft valget før **Last ned samlet PDF**. Åtte dokumentgrupper, full RUH-historikk/private bilder, felles rammer og manifest med dokument-ID, utgave/revisjon og sider. Ingen dokumenter velges automatisk. [Scope, testbevis og avgrensning](INSPECTION_EXTRACT_20261009.md). Funksjonskode **8d045d0c** er READY med grønn Core Safety/full critical build. Innlogget seksdokumenters PDF ga 12 sider med bevart SJA-signatur, begge RUH-hendelser, to vernerunde-bilder og manifest; uten rutine ga den 10 sider. Én fane, alle popup lukket; ingen lagrede saker endret. Eksakt bevis i CONTINUITY.

Neste ufullførte B/C-punkt etter denne leveransen er øvrig vedleggsdekning/versjonerte underskjema; deretter frist-/utløpspåminnelser og kildeoppdatering. Full tilsynsdekning, andre avvik enn RUH, separate originalfiler og framtidige HR-/opplæringsbevis er ikke levert gjennom denne PDF-en. Ingen databaseendring, Production/main/demo-merge eller ekte e-postsending; KS/HMS-utsending forblir deaktivert.

Egen **Last ned PDF** fra lagret SJA er implementert og utviklertestet med felles rammer, full analyse, deltakere, rutineutgaver og lagret signatur. Utkast er tydelig merket. Ulagret/nyere innhold, endret tilgang og sent svar sperres. [Scope og QA](SJA_PDF_20261009.md). Funksjonskode f7128eff er READY med grønn Core Safety/full critical build. Innlogget Test sja gir én side med full analyse og bevart signatur; popup lukket, én fane. Kenneth ga **TEST OK 9. oktober kl. 00:59** for egen SJA-PDF. Eksakt bevis og handoff i CONTINUITY; USER_TEST fører prøven som godkjent. Tidligere TEST OK og øvrige B/C-punkter før HR består.

Alle KS/HMS-uttrekk har nå felles **rammer og tettere to-kolonne-oppsett**, med full bredde og fortsettelsesbokser for langtekst. Rutine/mal/lagret kontroll/vernerunde/risiko/egen RUH samt valgte KS-dokumenter i prosjektrapporten er utviklertestet med ekte PDF-motor. [Scope og QA](BOXED_PDF_20261009.md). Funksjonskode 709bf7d4 er READY med grønn Core Safety/full critical build. Innlogget test ruh gir 2 sider og test vernerunde 1 side, med rammer og dokumentasjon kontrollert. Tidligere TEST OK beholdes; eksakt bevis står øverst i CONTINUITY. Ingen Production eller ekte e-postsending. B/C før HR består.

Egen **Last ned RUH-PDF** fra lagret sak med hele historikken og private bilder er READY på funksjonskode 7ed7eefa med grønn Core Safety/full critical build. Innlogget test ruh ga faktisk 4-siders PDF med begge hendelser og bevart lukking. Saken har 0 vedlegg; innlogget bildeprøve gjenstår. Ulagret tekst og endret/avslått tilgang sperrer uttrekk; andre vedlegg listes med tydelig originalfil-beskjed. [Scope/bevis](RUH_PDF_20261009.md), publisering i CONTINUITY og kort ny prøve i USER_TEST. Full historikk/bilder er avgrenset til egen RUH-PDF; prosjektrapportens tidligere sammendrag er uendret. Øvrige B/C-punkter består.

HR-lesetilgang er presisert: medarbeideren selv, registrert nærmeste leder og firmaadmin; firmaadmin kan gi uttrykkelig, tilbakekallbar lesetilgang til andre per medarbeider. [Byggekontrakt](HR_SCOPE_20261008.md). Ingen faktisk HR-implementering/rettigheter ennå.

Innlogget skynettleser 8. oktober: **test vernerunde** funnet i testprosjektets **Avvik/SJA/RUH → Vernerunde / kontroll**, gjenåpning og faktisk PDF kontrollert. Også rutine R-008 og tom Bunnledning-mal lastet ned. [Bevis og konkrete begrensninger](UI_TEST_20261008_PDF.md). Tidligere TEST OK beholdes; gjenværende PDF-/mobil-/flere-brukerprøver består.

Kenneths ti HR-svar er avklart: eget HR-valg, separat medarbeider-/ledertilgang, forberedelse før felles møte, firmamaler, behovsstyrte tiltak, begge bekreftelser, lederbytte og sletting ved fratredelse. Nærmeste leder velges blant aktive appbrukere og starter sykefravær manuelt. [Byggekontrakt og anbefalt sykefraværsflyt](HR_SCOPE_20261008.md) er dokumentert, ikke implementert. B/C før HR, ingen Production eller ekte e-postsending, består.

Egne PDF-er for godkjente rutineutgaver, publiserte tomme sjekklistemaler og lagrede prosjektkontroller er READY på funksjonskode 64143a3a med grønn Core Safety/critical build. Kort ny prøve står først i USER_TEST.md; publiseringsbevis står i CONTINUITY.md. Ingen ny HR- eller Production-leveranse.

Prosjektets Avvik/SJA/RUH er publisert READY på funksjonskode 990ce731 med grønn Core Safety/critical build. Visningen er gjort kompakt: fire lukkede dokumentgrupper viser antall/status, og avviksgrupper/rader er lukket med åpne saker først. Kort oversiktsprøve i USER_TEST.md gjenstår sammen med PDF-prøven. Samme Sandbox Preview; tidligere TEST OK består. Dette endrer visning og hjelp, ikke planens øvrige omfang.

## Hvor vi er

Vi har levert håndbokfundamentet og rutinebiblioteket i Sandbox Preview. Utførelsesdelen er langt på vei bygget. Varsling og rapporter er delvis levert. Individuell HR og full Ringside-pilot er ikke startet. Hele KS/HMS-modulen er ikke ferdig eller satt i produksjon.

[Samme Sandbox Preview](https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe). PR #216 er fortsatt draft på feat-kshms-foundation. Kontroll-/risiko-PDF med bilder, matrise, utkastmerking og firmaprofil er implementert og utviklertestet. Funksjonskode c6dc21d5 er READY på samme feature/Sandbox, med grønn Core Safety/critical build. Eksakt publiseringsbevis står i CONTINUITY.md. Main er 155f6c4ac01f126c1db0c65da385cfd9305587d5 ved siste kontroll. Godkjenningen kl. 22:09 gjelder dokumentasjonsendring til feature-branchen, ikke Production-release.

## Planen A–E

| Trinn | Levert i Preview | Det som gjenstår |
|---|---|---|
| A – håndbok og tilgang | Firmaaktivering, roller, oppstart, utkast/godkjenning, faste utgaver, egen bekreftelse, Min personalhåndbok og signert revisjon. Tidligere delprøver TEST OK. | Samlet QA før release. Firmaet må velge, tilpasse og godkjenne sine rutiner før bruk. |
| A2 – rutineinnhold | 73 egne forslag med sporbar dekning av 121 innholdstemaer fra begge håndbøkene, seks egne hovedkapitler og faste rutinenumre. | Firmatilpasning og konkret faglig vurdering. Temadekning er ikke godkjenning av alle spesialtilfeller. |
| B – utførelse | Sjekklistesentral, prosjektpopup/historikk, Avvik/RUH, SJA, vernerunder/kontroller og 5×5-risiko med prosjektkobling, egne fullføringer og bevarte utgaver. Flere delprøver TEST OK. | Ny kort popup-prøve; resterende sentral-/signerings-/mobil-/flere-brukerprøver. Fullstendig vedleggsdekning og senere versjonerte underskjema inngår fortsatt i planen; underskjema er ikke dokumentert levert. |
| C – varsler og rapporter | Faste appoppgaver, deduplisert e-postkø for seks oppgavetyper og valgfri SJA/RUH-del i prosjektets Rapport/PDF/utskrift (TEST OK). Egne kontroll-/risiko-PDF-er og valgfri inkludering i prosjektrapport er utviklertestet. Egne PDF-er for rutineutgaver, sjekklistemaler og prosjektkontroller er også utviklertestet. Egen RUH-PDF med full historikk/private bilder og egen lagret SJA-PDF (TEST OK 9. oktober kl. 00:59) er levert. Valgt samlet dokument-/tilsynsuttrekk med åtte grupper og RUH-historikk/private bilder er nå implementert. | Samlet uttrekk TEST OK 9. oktober kl. 01:29; ny ZIP-prøve; øvrig full tilsyns-/vedleggsdekning og andre avvik enn RUH; frist-/utløpspåminnelser og kildeoppdateringsforslag. Faktisk e-postlevering etter separat godkjent oppsett/release. |
| D – HR og stoffkartotek | Felles personalrutiner er tilgjengelige i håndboken. | Individuelle kurs/sertifikater/kompetanse, utløp, medarbeidersamtaler/tiltak og separat HR-tilgang/oppbevaring/sletting. Valgfritt stoffkartotek med arbeids-/SJA-koblinger. |
| E – pilot og drift | Løpende database-/React-/critical-QA og delvise desktop-/PDF-prøver. | Full tematisk/funksjonell kontroll, mobil/flere brukere, kapasitet/drift, Ringside-pilot etter minimumsomfang, deretter release-godkjenning og Production-verifisering. Avgrenset supportmodus følger etter pilot. |

## Godkjente delprøver

- Håndbok, avvikspopup/egen lukking og menyretur: tidligere TEST OK for sine leveranser.
- Sjekklistepopup med lagring/fullføring/historikk: TEST OK 7. oktober kl. 23:02.
- Meny, RUH-inngang og norske datoer: TEST OK 8. oktober kl. 01:28.
- SJA-utkast med rutine/lagring/gjenåpning og RUH-oppfølging/egen lukking: TEST OK kl. 13:30.
- SJA/RUH-valg i prosjektrapport og PDF med/uten: TEST OK kl. 14:48.
- Vernerunde/5×5 i prosjekt, rutinevalg og ansvarligvarsel: TEST OK kl. 21:04.
- Egen PDF fra lagret SJA, med felles rammer og bevart signatur: TEST OK 9. oktober kl. 00:59.

Disse gjentas bare ved ny konkret feil eller relevant regresjon. De er ikke samlet produksjonsgodkjenning. Popupens automatiske lukking er en etterfølgende rettelse; egen TEST OK for den er ikke registrert.

## E-post – avklart

KS/HMS-koden bruker allerede samme RESEND_API_KEY/CHAT_FROM_EMAIL som Production smart-worker. Smart-worker finnes også i Sandbox; eldre testmetode er ikke gjenfunnet. Dagens KS/HMS-prøver bruker simulert Resend, ikke innbokslevering. Sandbox KS/HMS-enabled=false er direkte bekreftet og beholdes. Ingen nye Sandbox-hemmeligheter kreves for å fortsette planen. [Gjeldende e-postoppsett](EMAIL_SETUP.md).

## Videre rekkefølge

1. Avslutt utførelsesdelen med nødvendige gjenstående B-punkter og PDF/vedlegg/rapportuttrekk som dokumenterer arbeidet. Kontroll-/risiko-PDF er nå bygget og utviklertestet; prøv bare det nye uttrekket i USER_TEST.md. Fortsett øvrige B/C-punkter etterpå. Den korte popup-prøven i USER_TEST kan gjøres parallelt; ikke krev at gamle delprøver gjentas.
2. Fullfør øvrig varsling/påminnelser og dokumentuttrekk fra C, og separat individuell HR fra D. Ledere ser bare tildelte medarbeidere; firmaadmin ser/behandler alle og tildeler ansvar. KS-rolle gir ikke HR-innsyn.
3. Avklar og gjennomfør eventuell valgfri stoffkartotekdel innen avtalt minimum. Den er ikke automatisk et nytt obligatorisk produktkrav.
4. Gjennomfør samlet QA og Ringside-pilot etter minimumsomfanget. Ingen tidlig begrenset pilot er besluttet.
5. Etter relevant TEST OK og uttrykkelig Production-godkjenning: migrasjoner/release, kontrollert e-postmottak og Production-verifisering, deretter kontrollert main → demo-synk. Supportmodus følger etter pilot.

PDF-leveransen er avgrenset innen vedtatt utførelses-/rapportscope og endrer ikke fullplanen.

## Faste beslutninger

Seks hovedkapitler; egen gjennomgang av tildelte rutiner; valgt ansvarlig lukker avvik selv; faste godkjente rutineutgaver; fullførte/signerte dokumenter beholdes. SJA har ansvarlig prosjektleders egen signatur og dokumentert medvirkning. Utførelse før HR. Minimumsomfang før Ringside-pilot. Samme Preview-adresse og én avgrenset leveranse om gangen.

Detaljer: [PLAN.md](PLAN.md), [CONTINUITY.md](CONTINUITY.md), [USER_TEST.md](USER_TEST.md), [CONTENT_STATUS.md](CONTENT_STATUS.md), [EMAIL_SETUP.md](EMAIL_SETUP.md).
