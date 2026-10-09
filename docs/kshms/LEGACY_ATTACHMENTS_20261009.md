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

Full critical Sandbox build PASS før docs; final full build, scope/docs-guard og diff-check føres sammen med publiseringsbevis. Branchens Vercel-variabel EXPO_BACKEND_TARGET=sandbox er direkte lest. Sandbox email_worker_settings.enabled=false er direkte lest; ingen mailer kjøres.

## Status og restprøver

Implementert og lokalt utviklerverifisert; publisert bevis kommer i neste dokumentasjonsoppdatering. Kenneths TEST OK for ny legacy-del gjenstår; se USER_TEST.md. Bevar tidligere 9. oktober TEST OK: SJA-PDF 00:59, samlet PDF 01:29, ZIP 01:55 og kvalitet-/HMS 02:28 på f9e0f7b5 / funksjon 0e2de193.

Eksisterende Sandbox-hovedprosjekt har tre ukoblede eldre avvik og tre koblede avvik (read-only SQL-metadata); ukoblede saker har ingen photos. Dette beviser tilgjengelig eksisterende prøvegrunnlag, ikke UI-/filtransport. Faktisk lagret eldre fil, private avviks-/prosjektkontrollfiler og mobil/flere brukere består. SJA/risiko-filtilknytning og full tilsynsdekning gjenstår. Neste arbeid følger dokumentert vedleggsdekning før versjonerte underskjema → påminnelser → kildeoppdatering. HR utsettes; ingen Production/main/demo-merge, ekte e-post, nye reelle saker/signatur/lukking.
