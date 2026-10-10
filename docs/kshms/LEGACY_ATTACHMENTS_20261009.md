## Publisert eldre prosjektavviksuttrekk – utviklerbevis 9. oktober 2026

Funksjonshead **37cd906b697763c4865650d9393a33d05fb78303**, tree **bf3c2e0ee256eb2cb9dddcc052b07aaf4490c8a2**, identisk med lokal testcommit 4316675cb99a3d1a004494eac2bb376df5c878c3. Alle 18 blobber opprettet/hashkontrollert og lest tilbake byte-/tekstidentisk; faktisk publisert git-commit rekonstruert og SHA-verifisert, 668 recursive tree-oppføringer kontrollert med korrekt tree og alle endrede filer. Lokal feature-head følger eksakt publisert kode. Publisert expected-head bd506a65 uten force; main fortsatt **155f6c4ac01f126c1db0c65da385cfd9305587d5**. Vercel READY **dpl_8kaLkrvrwtiBGmksLnSRLFaUGUmi**, riktig SHA/feature-ref/prosjekt/faste alias, EXPO_BACKEND_TARGET=sandbox direkte lest. PR Core Safety **37868239123**, jobb **113620009941** med full critical build: completed/success. Final lokal full Sandbox build, scope/docs-guard og diff-check PASS.

Innlogget fast Sandbox Preview, gjenbrukt demoøkten i én fane: hovedprosjektet viste **3 ukoblede eldre saker**, alle startet uten valg. Tre koblede saker ble utelatt. De tre valgte eksisterende sakene (to åpne, én lukket) ga faktisk nedlastet **5-siders PDF** med innhold/status/eldre lukking, forklaring om uversjonert lagret tilstand og manifest. Tekst-/sidekontroll PASS; alle fem sider rendret og visuelt kontrollert uten overlapp/klipp. Vedleggslisten viste 0 og sperret ZIP/bekreftelse. Fjerning av lukket sak ga 2 valg, tømte vedleggsliste og PDF-bekreftelse og sperret PDF. Deretter valg/omfang tømt; én fane, ingen popup eller sak-/database-/Storage-skriving. [Nettleserbevis](legacy-extract-proof.jpg).

Dette er **utviklerbevis, ikke Kenneths TEST OK** for ny legacy-del. Ny kort prøve står i USER_TEST.md. Tidligere TEST OK **00:59 / 01:29 / 01:55 / 02:28** beholdes. Ingen gamle godkjente deler skal prøves på nytt uten konkret feil/relevant regresjon. Faktisk lagret eldre avviksfil, private avviks-/prosjektkontrollfiler og mobil/flere brukere er fortsatt separate restprøver: eksisterende gamle testsaker hadde ingen photos. Lokal React/ZIP med syntetisk transport verifiserer 7 originaler og manifest/CRC32/SHA-256; dette er ikke faktisk innlogget filbevis. Øvrig vedleggsdekning/SJA-/risikofiltilknytning består før versjonerte underskjema, påminnelser og kildeoppdatering. HR starter ikke nå. KS/HMS enabled=false er direkte lest, ingen e-post/Production/main/demo-merge. Etterfølgende beviscommit har bare docs/skjermbilde og uendret funksjon.

---

# Eldre ukoblede prosjektavvik – 9. oktober 2026

## Avgrensning og funksjon

Miljømål BEGGE; kun feat-kshms-foundation/Sandbox er autorisert. Draft PR #216 beholdes. Starthead bd506a652bd2b4d339b43946f80a121ecea294f9 og main 155f6c4ac01f126c1db0c65da385cfd9305587d5 ble kontrollert mot faktisk GitHub før skriving.

Eksakt fil-/funksjonsscope:
- src/modules/report/kshmsLegacyProjectExtract.mjs: normaliserte gamle casefelter, SHA-256, prosjekttilgang før/etter, eldre PDF-dokument.
- src/modules/report/kshmsInspectionExtract.mjs: separat legacy-gruppe, valg/ferske snapshots, autentiserte bilder, manifest.
- src/modules/report/kshmsAttachmentArchive.mjs: legacy-originaler, kjent avvik-prefiks, contentHash i manifest.
- src/modules/kshms/KshmsInspectionExtract.jsx: eksplisitt prosjektlasting, smal projects-projeksjon med firmafilter, PDF/ZIP-transport via innlogget appklient.
- scripts/critical-kshms-legacy-extract-check.mjs og import i scripts/critical-kshms-check.mjs: permanent ekstra kontroll; eksisterende guards beholdes.
- scripts/kshms-inspection-extract-react-check.mjs og scripts/kshms-attachment-archive-react-check.mjs: ekstra KSHMS_LEGACY_QA-modus. Rutinefjerningsprøven finner eksplisitt rutinevalget også når legacy står først; samme tidligere assertion beholdes.
- src/modules/help/helpToolsCore.js, README.md, docs/architecture/EXPO_PROFFDOK_ARCHITECTURE.md, CURRENT_RELEASE_STATUS.md og docs/kshms/{CONTINUITY,OVERSIKT,USER_TEST,PLAN,QA,LEGACY_ATTACHMENTS_20261009}.md: brukersteg, arkitektur, status og bevis.

Ingen andre moduler/kjerner, navigasjon, backend/database/policy eller nye avhengigheter. Prosjektets gamle sak endres aldri ved uttrekk. Koblede ks_deviation_id utelates. Historiske tekstfelter er ikke nye signaturer; ingen versjon/hendelseshistorikk oppfinnes. Kun valgte dokumenter følger uttrekket. Max 500 eldre kildesaker per prosjekt, samme tidligere dokument/filgrenser. Innhold eller filreferanser som endres etter valg stopper nedlasting. Ugyldig/ukjent filtype eller manglende tilgang stopper hele pakken; ingen delvis save. Double-read er klientkontroll, ikke atomisk serverarkiv.

## Utvikler-QA før publisering

Permanent critical: tillatt åpent/lukket innhold, koblet sak utelatt, fremmed firma/prosjekt/bruker, tilbakekalt prosjekt før/etter, sak koblet/endret/fjernet etter preview, endret filreferanse, filfeil/type/størrelse, sen prosjekt-/filsvar, final PDF-endring. PASS; originaldata uendret, ingen commands. ZIP åpnes uavhengig med Python zipfile; CRC32, størrelser og SHA-256 kontrolleres.

Faktisk React/Storage/jsPDF: legacy-modus gir 2 PDF-er (20 sider med rutine, 19 uten) og ZIP med 7 originaler inklusive eldre bilde og PDF. Original åtte-gruppe-modus gir 2 PDF-er og ZIP 5 filer; kvalitet-/HMS-modus 2 PDF-er og ZIP 9 filer. Bekreftelse, tom liste, reset, feil, sen firma/bruker/avmontering PASS. Alle er syntetiske transportprøver, ikke innlogget filbevis. PDF 20 sider rendret med Poppler, kontaktark og eldre åpne/lukkede sider kontrollert uten overlapp/klipp.

Full critical Sandbox build PASS før docs; final full build, scope/docs-guard og diff-check PASS, eksakt publiseringsbevis står ovenfor. Branchens Vercel-variabel EXPO_BACKEND_TARGET=sandbox er direkte lest. Sandbox email_worker_settings.enabled=false er direkte lest; ingen mailer kjøres.

## Status og restprøver

Implementert, lokalt og innlogget utviklerverifisert; publisert bevis står ovenfor. Kenneths TEST OK for ny legacy-del gjenstår; se USER_TEST.md. Bevar tidligere 9. oktober TEST OK: SJA-PDF 00:59, samlet PDF 01:29, ZIP 01:55 og kvalitet-/HMS 02:28 på f9e0f7b5 / funksjon 0e2de193.

Eksisterende Sandbox-hovedprosjekt har tre ukoblede eldre avvik og tre koblede avvik (read-only SQL-metadata); ukoblede saker har ingen photos. Dette beviser tilgjengelig eksisterende prøvegrunnlag, ikke UI-/filtransport. Faktisk lagret eldre fil, private avviks-/prosjektkontrollfiler og mobil/flere brukere består. SJA/risiko-filtilknytning og full tilsynsdekning gjenstår. Neste arbeid følger dokumentert vedleggsdekning før versjonerte underskjema → påminnelser → kildeoppdatering. HR utsettes; ingen Production/main/demo-merge, ekte e-post, nye reelle saker/signatur/lukking.
