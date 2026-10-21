# Boligprosjekter – egne kontroller, FDV og ekstern protokoll

Miljømål **BEGGE**. Samme feature-branch og draft PR #278. Før endring kontrollert lokal HEAD og remote feature `8f74b5bf`, main `0730eeb4`; ingen nyere sporet kode. Ingen produksjonsmigrasjon, merge, TEST OK eller main → demo-synk i denne etappen.

## Scope og produktkontrakt

Kun egne Bolig-flater/klient/CSS, Bolig-hjelp, additive private gateway-/Storage-/e-postfunksjoner og QA. Eksisterende ordinær prosjekt-/sjekklistemotor, Sales, innlogging, tilgangskjerne og globale menyer er beholdt. KS/HMS sine eksisterende validatorer gjenbrukes uten endring.

- Sjekklister føres i Boligprosjekter per bolig, valgfritt rom, bygg og prosjekt. Manuell bygger har sjekkpunkter, veiledning, bilde-/kommentarkrav og betingede underpunkter. Publiserte firmamaler importeres på serveren fra riktig firma og siste tilgjengelige utgave. Den eksakte utgaven, inkludert underskjema og krav, fryses i kontrollen. Egen liste kan opprettes uten KS/HMS-bibliotek; publisert bibliotek krever firmaets eksisterende aktivering. Ingen automatisk våtroms-/garantiliste for alle boliger.
- Fullførte kontroller må gjenåpnes med begrunnelse før endring. Avvik lukkes med dokumentert retting. Gamle svar og bekreftelser beholdes i revisjonshistorikk; «Se lagret utgave» åpner historisk innhold. Arkivert rom må avklares. Native kontrollkladd/åpne avvik/ubekreftet gjeldende protokoll sperrer ferdigstilling. Endret dokumentgrunnlag gir ny kontroll på bolig, bygg og prosjekt. Ingen nye frister eller automatiske fristvarsler innføres.
- PDF/bilder lastes til privat, immutable `bolig-documents` (20 MB; PDF/JPG/PNG/WebP), avgrenset per firma/root/scope. Filen kan registreres i Filer og bilder; ekstern protokoll kan også lastes opp direkte i protokolldialogen og registreres atomisk med merknadene. Lagrede originaler overskrives ikke. Korte signerte nedlastingslenker lages etter ny Storage-autorisasjon.
- FDV-lenke finnes på varelinjen i grunnpakke, tilvalgspakke og boligtilpasning. Katalogkopiering bruker bare eksplisitt FDV-felt når kilden har et slikt; produktlenke blir ikke feilaktig merket FDV. Nye valg fryser lenken med varen. Etterfølgende retting i boligens FDV krever begrunnelse og produktidentitet; gamle valg og ordre omskrives ikke. FDV-oversikt på bygg/prosjekt samler aktive boligers siste lagrede varevalg og registrerte FDV-filer. PDF har klikkbare lenker, mangelliste, kilde/revisjon og firmaprofil. Eksterne dokumenter er ikke innebygd, og varevalg er ikke bevis på montering. Kontroller faktisk montert leveranse før sluttbruk.
- Ekstern protokoll er valgfri. Merknader føres manuelt fra originalen; ingen OCR loves. Rettede merknader trenger rettingsbeskrivelse og kan knyttes til lagrede vedlegg. Samlet «Bekreft retting» registrerer aktør/tidspunkt og nøyaktig bekreftelsesutgave. Ny protokollutgave og begrunnet gjenåpning bevarer historikken. Dette er intern bekreftelse på retting, separat fra registrert overtagelse og kontrollørens signatur.
- Valgfri e-post: én valgt mottaker → forhåndsvisning → eksplisitt sending. Canonical server-snapshot inneholder bekreftelse og merknader. Original/vedlegg sendes ikke. Auth + fersk firma/rolle/scope/bekreftelses-ID kontrolleres ved prepare/inspect/begin. Resend idempotency-key bindes til immutable attempt; usikker sending må prøves med samme ID. Etter 23 timer stoppes uavklart automatisk retry. Service-only kvittering gir provider-aksept, ikke levert/lest-status. Ingen virkelig test-e-post sendt.
- Vareoppslag beholder dagens regler: internt register krever intern arbeidsprofil + store_offers; proffkatalog krever sales + store_offers + firmatilgang og filtrerer leverandører via `store_catalog_company_supplier_access`. Boligrollen gir ingen ekstra katalogtilgang. Ingen nettopriser kopieres til pakker/FDV.

## QA før Preview

- PostgreSQL/PGlite **613 assertions PASS**, alle tidligere Bolig-scenarier inkludert. Nye kontroller dekker scope/reader/fremmed firma, private tabeller, gamle revisjoner, typed/bilde-/kommentarkrav, fullføring/gjenåpning/avvik, arkiverte kilder, immutable import, dokumentpath/RLS, protokollutgaver, rettingsbekreftelse, FDV-URL/valg/korreksjon/aggregater og canonical e-post/retry/service-only kvittering.
- Ny Chromium-scenariofil **20 assertions PASS**: manuell liste/typed felt, import, usendt kladd etter fokus/lukking/gjentatt arbeidsprofilhendelse, write-konflikt, fullført read-only kontroll, retting, privat fil, protokoll, mottakerreview/mocket sending, FDV, mobil og reader/fremmed firma.
- Provider-mocket e-posttest **24 assertions PASS**; ingen faktisk utsending. PDF **12 assertions PASS**: ekte PDF-byte/lenker/logo, 10 sider med lange navn/URL-er, ny grunnlags-/tilgangskontroll etter lasting. Alle 10 sider rendret og visuelt kontrollert; ingen avkutting/foreldreløse overskrifter.
- Berørte eksisterende reiser PASS: foundation React, catalog React, facade React, builder 102, overview 42, rom 51, room content 35, scoped packages 36, catalog navigation 24, bilder 29, sections 35, completion 24, customization/unit cards 22, delivery 31, preparation 33. Critical build og scope guard PASS.
- Testkontrakter oppdatert bare der brukerkravet endrer atferd: eget quality-slot erstatter tvungen enkeltprosjektnavigasjon; FDV er eneste tillatte nye URL-felt i bilde/pakkeeditor. Bildeopplastingens øvrige vern beholdes. Overview-harness får CSS-filnavn fordi integrasjonen nå inkluderer eksisterende ChecklistFields CSS. Nye kontroller lagt til CI uten å fjerne noen gamle.

## Sandbox

Kun `ppvircenkjizeiqdxphj`: `bolig_native_documentation` versjon `20261021233354`, `bolig_protocol_confirmation_email` versjon `20261021233409`. Edge `bolig-protocol-email` v1 ACTIVE, JWT + Auth + canonical gateway. `scripts/bolig-quality-sandbox-smoke.sql` PASS med reelle schema/validatorer/RLS; alle syntetiske SQL-skrive- og e-postklargjøringsdata rollback, ingen rest-root. Faktiske filbyte og skynett-UX verifiseres i Preview etter publisering.

Security advisors før/etter: tre forventede deny-all/RLS-tabeller; én bevisst authenticated boolean Storage-access-helper. Ingen ny anon definer, mutabel search_path eller brede tabellgrants. Eksisterende urelaterte advisor-funn er ikke endret.

## Publisering og skynett

Samme faste branch-Preview brukes. Eksakt CI, READY og faktisk innlogget egenprøve føres etter publisering. Ingen reell e-postmottak/levering eller Safari-enhet verifisert av mocket Chromium-QA.
